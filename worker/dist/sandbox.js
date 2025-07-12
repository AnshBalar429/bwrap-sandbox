"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sandboxExecute = sandboxExecute;
const promises_1 = require("fs/promises");
const fs = __importStar(require("fs"));
const child_process_1 = require("child_process");
const os_1 = require("os");
const path_1 = __importDefault(require("path"));
function sandboxExecute(lang, src) {
    return __awaiter(this, void 0, void 0, function* () {
        const dir = yield fs.promises.mkdtemp(path_1.default.join((0, os_1.tmpdir)(), 'code-'));
        const file = path_1.default.join(dir, `Main.${lang}`);
        yield (0, promises_1.writeFile)(file, src);
        const cmd = [];
        if (lang === 'js')
            cmd.push('node', file);
        else if (lang === 'py')
            cmd.push('python3', file);
        else if (lang === 'c') {
            const exe = path_1.default.join(dir, 'a.out');
            yield spawnPromise('gcc', [file, '-o', exe]);
            cmd.push(exe);
        }
        // Build bubblewrap args
        const args = [
            '--unshare-all',
            '--share-net',
            '--ro-bind', '/', '/',
            '--new-session',
            '--die-with-parent',
            '--cgroup', // optionally limit cpu/memory
            '--',
            ...cmd
        ];
        const proc = (0, child_process_1.spawn)('bwrap', args);
        let stdout = '', stderr = '';
        proc.stdout.on('data', d => stdout += d);
        proc.stderr.on('data', d => stderr += d);
        const code = yield new Promise(resolve => proc.on('close', resolve));
        yield (0, promises_1.rm)(dir, { recursive: true, force: true });
        return { stdout, stderr, code };
    });
}
function spawnPromise(cmd, args) {
    return new Promise((res, rej) => {
        const p = (0, child_process_1.spawn)(cmd, args);
        p.on('close', c => c === 0 ? res() : rej());
    });
}
