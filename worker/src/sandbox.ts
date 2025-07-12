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
  const dir = await fs.promises.mkdtemp(path.join(tmpdir(), 'code-'));
  const file = path.join(dir, `Main.${lang}`);
  await writeFile(file, src);

  const cmd: string[] = [];
  if (lang === 'js') cmd.push('node', file);
  else if (lang === 'py') cmd.push('python3', file);
  else if (lang === 'c') {
    const exe = path.join(dir, 'a.out');
    await spawnPromise('gcc', [file, '-o', exe]);
    cmd.push(exe);
  }

  // Build bubblewrap args
  const args = [
    '--unshare-all',
    '--share-net',
    '--ro-bind', '/', '/',
    '--new-session',
    '--die-with-parent',
    '--',
    ...cmd
  ];

  const proc = spawn('bwrap', args);
  let stdout = '', stderr = '';
  proc.stdout.on('data', d => stdout += d);
  proc.stderr.on('data', d => stderr += d);

  const code: number = await new Promise(resolve => proc.on('close', resolve));
  await rm(dir, { recursive: true, force: true });

  return { stdout, stderr, code };
}

function spawnPromise(cmd: string, args: string[]): Promise<void> {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args);
    p.on('close', c => c === 0 ? res() : rej());
  });
}