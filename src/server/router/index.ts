// src/server/router/index.ts
import { createRouter } from './context';
import superjson from 'superjson';

import { questionsRouter } from './questions';

export const appRouter = createRouter().transformer(superjson).merge('questions.', questionsRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
