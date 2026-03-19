import Redis from 'ioredis';
const redis = new Redis({ host: '127.0.0.1', port: 6379 });
redis
  .set('hello', 'world')
  .then(() => redis.get('hello'))
  .then(console.log)
  .finally(() => redis.disconnect());
