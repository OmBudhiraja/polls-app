import type React from 'react';
import { useEffect } from 'react';
import Ably from 'ably';
import { trpc } from '@/utils/trpc';
import { inferQueryResponse } from '@/pages/api/trpc/[trpc]';
import { PollData } from '@/pages/question/[id]';

const AddPollResult: React.FC<{ data: PollData; id: string }> = ({ data, id }) => {
  const { mutate, isLoading: isSubmittingVote } = trpc.useMutation(['questions.vote-on-question'], {
    onSuccess: () => window.location.reload(),
  });
  function handleAddVote(index: number) {
    const ably = new Ably.Realtime.Promise({ authUrl: '/api/createTokenRequest' });
    const channel = ably.channels.get('pollsResults');
    channel.publish(id, 'new vote added');
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
