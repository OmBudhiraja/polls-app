// src/server/router/context.ts
import * as trpc from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import { prisma } from '@/server/db/client';

export const createContext = ({ req, res }: trpcNext.CreateNextContextOptions) => {
  const token = req.cookies['poll-token'];

  return {
    req,
    res,
    prisma,
    token,
  };
};

type Context = trpc.inferAsyncReturnType<typeof createContext>;

export const createRouter = () => trpc.router<Context>();
