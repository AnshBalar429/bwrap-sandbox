import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({
    host : "my-redis",
    port : 6379

});
export const codeQueue = new Queue('code-exec', { connection });