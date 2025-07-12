import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({
    host : "scet-redis-1",
    port : 6379

});
export const codeQueue = new Queue('code-exec', { connection });