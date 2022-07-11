import type React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiTrash2 as TrashIcon, FiPlus as AddIcon } from 'react-icons/fi';
import { trpc } from '@/utils/trpc';
import {
  CreateQuestionInputType,
  createQuestionValidator,
} from '@/shared/create-question-validator';

const CreateQuestionForm = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateQuestionInputType>({
    resolver: zodResolver(createQuestionValidator),
    defaultValues: {
      options: [{ text: 'Yes' }, { text: 'No' }],
    },
  });

  const { fields, append, prepend, remove, swap, move, insert } =
    useFieldArray<CreateQuestionInputType>({
      name: 'options', // unique name for your Field Array,
      control, // control props comes from useForm (optional: if you are using FormContext)
    });

  const { mutate, isLoading, data } = trpc.useMutation('questions.create', {
    onSuccess: (data) => {
      router.push(`/question/${data.id}`);
    },
  });

  console.log('form  errrors', errors, errors.options?.message);

  if (isLoading || data)
    return (
      <div className="antialiased min-h-screen flex items-center justify-center">
        <p className="text-white/40">Loading...</p>
      </div>
    );

  return (
    <div className="antialiased text-gray-100 p-6 min-h-screen">
      <Head>
        <title>Create | OnAVote</title>
      </Head>
      <header className="header flex w-full justify-between">
        <Link href={'/'}>
          <h1 className="text-4xl font-bold cursor-pointer">OnAVote</h1>
        </Link>
      </header>
      <div className="max-w-xl mx-auto py-12 md:max-w-2xl">
        <h2 className="text-2xl font-bold">Create a new poll</h2>

        <form
          onSubmit={handleSubmit((data) => {
            console.log('data', data);

            mutate(data);
          })}
          className="w-full"
        >
          <div className="mt-8 w-full">
            <div className="form-control my-10 w-full">
              <label className="label">
                <span className="label-text font-semibold text-base">Your Question</span>
              </label>
              <input
                {...register('question')}
                type="text"
                className="input input-bordered w-full block text-gray-300 rounded-md"
                placeholder="How do magnets work?"
              />
              {errors.question && (
                <p className="text-red-400 mt-2 ml-2 text-sm">{errors.question.message}</p>
              )}
            </div>
            <div className="grid grid-cols-1 w-full gap-x-5 gap-y-3 md:grid-cols-2">
              {fields.map((field, index) => {
                return (
                  <div key={field.id}>
                    <section className="flex items-center gap-2">
                      <input
                        placeholder="name"
                        {...register(`options.${index}.text`, {
                          required: true,
                        })}
                        className="input input-bordered w-full text-gray-300 font-medium"
                      />
                      {fields.length > 2 && (
                        <button type="button" onClick={() => remove(index)}>
                          <TrashIcon size={24} className="text-gray-500" />
                        </button>
                      )}
                    </section>
                    {errors.options && (
                      <p className="text-red-400 mt-2 ml-2 text-sm">
                        {errors.options[index]?.text?.message}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            {fields.length < 10 && (
              <div className="flex items-center my-3">
                <button
                  type="button"
                  value="Add more options"
                  className="btn btn-sm btn-ghost btn-active mt-2 h-10 flex items-center gap-1"
                  onClick={() => append({ text: 'Another Option' })}
                >
                  <AddIcon size={20} className="text-gray-400" /> Add options
                </button>
              </div>
            )}
            <div className="w-full mt-10">
              <input type="submit" className="btn w-full" value="Create question" />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const CreateQuestion: React.FC = () => {
  return <CreateQuestionForm />;
};

export default CreateQuestion;
