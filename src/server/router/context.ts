// src/server/router/context.ts
import * as trpc from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import Ably from 'ably/promises';
import { prisma } from '@/server/db/client';

export const createContext = ({ req, res }: trpcNext.CreateNextContextOptions) => {
  const token = req.cookies['poll-token'];
  const ably = new Ably.Realtime.Promise(process.env.ABLY_API_KEY!);
  const channel = ably.channels.get('pollsResults');

  return {
    req,
    res,
    prisma,
    token,
    ablyChannel: channel,
  };
};

type Context = trpc.inferAsyncReturnType<typeof createContext>;

export const createRouter = () => trpc.router<Context>();
