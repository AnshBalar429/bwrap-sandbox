import { writeFile, rm } from 'fs/promises';
import * as fs from 'fs';
import { spawn } from 'child_process';
import { tmpdir } from 'os';
import path from 'path';

interface ExecResult { stdout: string; stderr: string; code: number; }

export async function sandboxExecute(lang: string, src: string): Promise<ExecResult> {
  if (!src || typeof src !== 'string') {
    throw new TypeError('The "src" argument must be a non-empty string.');
  }

  // 1) Create a host temp dir and write the source
  const dir = await fs.promises.mkdtemp(path.join(tmpdir(), 'code-'));
  const fileName = `Main.${lang}`;
  const hostFile = path.join(dir, fileName);
  await writeFile(hostFile, src);

  // 2) Prepare the in‑sandbox command (relative to /sandbox)
  const sandboxRoot = '/sandbox';
  const cmd: string[] = [];
  if (lang === 'js') {
    cmd.push('node', fileName);
  } else if (lang === 'py') {
    cmd.push('python3', fileName);
  } else if (lang === 'c') {
    const exeName = 'a.out';
    const hostExe = path.join(dir, exeName);
    await spawnPromise('gcc', [hostFile, '-o', hostExe]);
    cmd.push(path.posix.join(sandboxRoot, exeName));
  }

  // 3) Build bubblewrap args for a minimal FS
  const args = [
    // isolate everything
    '--unshare-all',
    '--new-session',
    '--die-with-parent',

    // start with a fresh, empty root
    '--tmpfs', '/',

    // bring in just enough of the host runtime (read‑only)
    '--ro-bind', '/usr', '/usr',
    '--ro-bind', '/bin', '/bin',
    '--ro-bind', '/lib', '/lib',
    '--ro-bind', '/usr/lib', '/usr/lib',

    // provide a fresh writable temp directory
    '--tmpfs', '/tmp',

    // bind your code directory into /sandbox
    '--bind', dir, sandboxRoot,
    '--chdir', sandboxRoot,

    // run the desired command
    '--',
    ...cmd
  ];

  // 4) Spawn the sandboxed process
  const proc = spawn('bwrap', args);
  let stdout = '', stderr = '';
  proc.stdout.on('data', d => stdout += d);
  proc.stderr.on('data', d => stderr += d);

  const code: number = await new Promise(resolve => proc.on('close', resolve));

  // 5) Cleanup host temp dir
  await rm(dir, { recursive: true, force: true });

  return { stdout, stderr, code };
}

function spawnPromise(cmd: string, args: string[]): Promise<void> {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args);
    p.on('close', c => c === 0 ? res() : rej(new Error(`${cmd} exited ${c}`)));
  });
}
