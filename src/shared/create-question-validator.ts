import { z } from 'zod';

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
});

export type CreateQuestionInputType = z.infer<typeof createQuestionValidator>;
