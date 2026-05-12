import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDatabase } from './config/database.js';

async function main(): Promise<void> {
  await connectDatabase();

  const app = createApp();

  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, host: env.HOST }, 'Server started');
  });
}

main().catch((err: unknown) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
