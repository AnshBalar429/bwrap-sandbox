import { Worker } from 'bullmq';
import { sandboxExecute } from './sandbox';
import IORedis from 'ioredis';

const connection = new IORedis({
  maxRetriesPerRequest: null,
  host: "scet-redis-1",
  port: 6379
});

const worker = new Worker('code-exec', async job => {
  const { language, source } = job.data as { language: string; source: string };
  const result = await sandboxExecute(language, source);
  console.log(result);
  return result;
}, { connection });

worker.on('completed', job => console.log(`Job ${job.id} done`));