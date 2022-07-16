import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import Ably from 'ably/promises';
import { Question } from '@prisma/client';
import { createRouter } from './context';
import { createQuestionValidator } from '@/shared/create-question-validator';

function hasPollEnded(question: Question) {
  return (
    question?.ended ||
    (question?.endsAt && new Date().getTime() > new Date(question.endsAt).getTime())
  );
}

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

      if (!question) throw new TRPCError({ code: 'NOT_FOUND' });

      const myVote = await ctx.prisma.vote.findFirst({
        where: {
          questionId: input.id,
          voterToken: ctx.token,
        },
      });

      const isOwner = question?.ownerToken === ctx.token;

      const rest = { myVote, isOwner, question };

      if (rest.myVote || rest.isOwner || hasPollEnded(question)) {
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

      const question = await ctx.prisma.question.findFirst({ where: { id: input.questionId } });

      if (!question) throw new TRPCError({ code: 'NOT_FOUND' });

      if (hasPollEnded(question)) {
        if (!question.ended) {
          await ctx.prisma.question.update({
            where: { id: input.questionId },
            data: { ended: true },
          });
        }
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const myVote = await ctx.prisma.vote.create({
        data: {
          questionId: input.questionId,
          choice: input.optionIndex,
          voterToken: ctx.token,
        },
      });

      try {
        const ably = new Ably.Realtime.Promise(process.env.ABLY_API_KEY!);
        const channel = ably.channels.get('pollsResults');
        await channel.publish(input.questionId, 'new vote added');
        ably.close();
      } catch (err) {
        console.log('Ably connection limit exceeded??', err);
      }
      return myVote;
    },
  })
  .mutation('create', {
    input: createQuestionValidator,
    async resolve({ input, ctx }) {
      if (!ctx.token) throw new TRPCError({ code: 'UNAUTHORIZED' });
      console.log(input);

      const newQuestion = await ctx.prisma.question.create({
        data: {
          question: input.question,
          options: input.options,
          ownerToken: ctx.token,
          endsAt: input.endsAt,
          resultsVisibility: input.visibility,
        },
      });
      return newQuestion;
    },
  })
  .mutation('endPoll', {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      const question = await ctx.prisma.question.findFirst({
        where: {
          id: input.id,
        },
      });

      if (!question) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Question not found.' });
      }

      if (question.ownerToken !== ctx.token) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only Owner can end the poll' });
      }

      const updated = await ctx.prisma.question.update({
        where: {
          id: input.id,
        },
        data: {
          ended: true,
        },
      });

      return updated;
    },
  });
