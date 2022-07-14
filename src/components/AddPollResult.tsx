import type React from 'react';
import { trpc } from '@/utils/trpc';
import { PollData } from '@/pages/question/[id]';

const AddPollResult: React.FC<{ data: PollData; id: string }> = ({ data, id }) => {
  const { mutate, isLoading: isSubmittingVote } = trpc.useMutation(['questions.vote-on-question'], {
    onSuccess: () => {
      window.location.reload();
    },
  });

  function handleAddVote(index: number) {
    mutate({ questionId: id, optionIndex: index });
  }

  return (
    <>
      {(data.question?.options as { text: string }[])?.map((option, index) => {
        return (
          <button
            key={index}
            onClick={handleAddVote.bind(null, index)}
            className="btn btn-outline"
            disabled={isSubmittingVote}
          >
            {option.text}
          </button>
        );
      })}
    </>
  );
};

export default AddPollResult;
