"use strict";
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
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const queue_1 = require("./queue");
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.post('/run', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { language, source } = req.body;
    if (!['js', 'py', 'c'].includes(language)) {
        return res.status(400).json({ error: 'Unsupported language' });
    }
    // enqueue job
    const job = yield queue_1.codeQueue.add('execute', { language, source });
    res.json({ jobId: job.id });
}));
app.get('/result/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const job = yield queue_1.codeQueue.getJob(req.params.id);
    if (!job)
        return res.status(404).send('Not found');
    const state = yield job.getState();
    const result = job.returnvalue;
    res.json({ state, result });
}));
app.listen(3000, () => console.log('API listening on 3000'));
