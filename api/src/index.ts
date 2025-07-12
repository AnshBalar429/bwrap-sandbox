import express from 'express';
import bodyParser from 'body-parser';
import { codeQueue } from './queue';

const app = express();
app.use(bodyParser.json());

app.post('/run', async (req, res) => {
  const { language, source } = req.body;
  if (!['js','py','c'].includes(language)) {
    return res.status(400).json({ error: 'Unsupported language' });
  }

  // enqueue job
  const job = await codeQueue.add('execute', { language, source });
  res.json({ jobId: job.id });
});

app.get('/result/:id', async (req, res) => {
  const job = await codeQueue.getJob(req.params.id);
  if (!job) return res.status(404).send('Not found');
  const state = await job.getState();
  const result = job.returnvalue;
  res.json({ state, result });
});

app.listen(3000, () => console.log('API listening on 3000'));