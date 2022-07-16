import { z } from 'zod';

export const visibility = new Map([
  ['always', 'Always Publicly Visible'],
  ['after_end', 'Public Visible after poll ends'],
  ['hidden', 'Never Visible to the public'],
]);

const keys = ['always', 'after_end', 'hidden'] as const;

export const createQuestionValidator = z.object({
  question: z
    .string()
    .min(5, { message: 'Question must contain alteast 5 characters' })
    .max(600, { message: "Question can't be longer than 600 character" }),
  options: z
    .array(
      z.object({
        text: z.string().min(1, { message: "Option can't be empty." }).max(200).optional(),
      })
    )
    .min(2)
    .max(10),
  endsAt: z.preprocess((arg) => {
    if ((typeof arg === 'string' && arg.trim().length) || arg instanceof Date) {
      const endDate = new Date(arg);
      const currentDate = new Date();

      const isAfterNow = endDate.getTime() > currentDate.getTime();

      return isAfterNow ? endDate : null;
    }
    return null;
  }, z.date().nullable()),
  visibility: z.enum(keys),
});

export type CreateQuestionInputType = z.infer<typeof createQuestionValidator>;
