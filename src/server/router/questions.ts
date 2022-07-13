import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import Ably from 'ably/promises';
import { createRouter } from './context';
import { prisma } from '@/server/db/client';
import { createQuestionValidator } from '@/shared/create-question-validator';

export const questionsRouter = createRouter()
  .query('get-my-all-questions', {
    async resolve({ ctx }) {
      if (!ctx.token) return [];
      const questions = await ctx.prisma.question.findMany({
        where: { ownerToken: { equals: ctx.token } },
      });
      return questions;
    },
  })
  .query('get-by-id', {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      const question = await ctx.prisma.question.findFirst({ where: { id: input.id } });

      const myVote = await ctx.prisma.vote.findFirst({
        where: {
          questionId: input.id,
          voterToken: ctx.token,
        },
      });

      const isOwner = question?.ownerToken === ctx.token;

      const rest = { myVote, isOwner, question };

      if (rest.myVote || rest.isOwner) {
        const votes = await ctx.prisma.vote.groupBy({
          where: {
            questionId: input.id,
          },
          by: ['choice'],
          _count: true,
        });
        return { ...rest, votes };
      }

      return { ...rest, votes: undefined };
    },
  })
  .mutation('vote-on-question', {
    input: z.object({
      questionId: z.string(),
      optionIndex: z.number().min(0).max(10),
    }),
    async resolve({ input, ctx }) {
      if (!ctx.token) throw new TRPCError({ code: 'UNAUTHORIZED' });
      const myVote = await ctx.prisma.vote.create({
        data: {
          questionId: input.questionId,
          choice: input.optionIndex,
          voterToken: ctx.token,
        },
      });
      return myVote;
    },
  })
  .mutation('create', {
    input: createQuestionValidator,
    async resolve({ input, ctx }) {
      if (!ctx.token) throw new TRPCError({ code: 'UNAUTHORIZED' });
      const newQuestion = await ctx.prisma.question.create({
        data: {
          question: input.question,
          options: input.options,
          ownerToken: ctx.token,
        },
      });
      return newQuestion;
    },
  });
