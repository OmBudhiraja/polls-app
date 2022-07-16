import type React from 'react';
import { useEffect } from 'react';
import Ably from 'ably';
import { BsCheckCircle as SuccessIcon } from 'react-icons/bs';
import { MdOutlineInfo as InfoIcon } from 'react-icons/md';
import { trpc } from '@/utils/trpc';
import { PollData } from '@/pages/question/[id]';

interface VotesCount {
  _count: number;
  choice: number;
}
[];

function getTotalVotes(votes: VotesCount[]) {
  return votes.reduce((accumulatedVotes, currentVote) => accumulatedVotes + currentVote._count, 0);
}

function getVotesForIndex(votes: VotesCount[], index: number) {
  const totalVotes = getTotalVotes(votes);
  const votesForIndex = votes.find((vote) => vote.choice === index)?._count ?? 0;
  const votePercent = totalVotes === 0 ? 0 : (votesForIndex / totalVotes) * 100;
  return { totalVotes, votesForIndex, percent: votePercent.toFixed(1) };
}

const ShowPollResults: React.FC<{ data: PollData; id: string; pollEnded: boolean }> = ({
  data,
  id,
  pollEnded,
}) => {
  const { refetch } = trpc.useQuery(['questions.get-by-id', { id }], {
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const showResults =
    data.isOwner ||
    data.question?.resultsVisibility === 'always' ||
    (data.question?.resultsVisibility === 'after_end' && pollEnded);

  useEffect(() => {
    if (pollEnded) return;
    const ably = new Ably.Realtime.Promise({ authUrl: '/api/createTokenRequest' });
    const channel = ably.channels.get('pollsResults');
    const refetcher = () => refetch();
    channel.subscribe(id, refetcher);

    return () => {
      channel.unsubscribe(id, refetcher);
    };
  }, [id, refetch, data, pollEnded]);

  if (!showResults) {
    return (
      <div className="self-center mt-20 text-center">
        <p className="text-2xl text-gray-400 flex gap-4 items-center">
          {data.myVote ? (
            <>
              <SuccessIcon />
              <span>Your Vote has been submitted</span>
            </>
          ) : (
            <>
              <InfoIcon />
              <span>This Poll has ended</span>
            </>
          )}
        </p>
        <p className="text-gray-500 mt-2">
          {data.question?.resultsVisibility === 'hidden'
            ? 'Only owner can see the results'
            : 'You can see the results once the poll ends'}
        </p>
      </div>
    );
  }

  return (
    <>
      {(data.question?.options as { text: string }[])?.map((option, index) => {
        const { totalVotes, votesForIndex, percent } = getVotesForIndex(data.votes!, index);
        return (
          <div key={index}>
            <div className="flex justify-between">
              <p className="font-bold">{option.text}</p>
              <p>{percent} %</p>
            </div>
            <progress
              className="progress progress-secondary w-full"
              value={votesForIndex}
              max={totalVotes}
            ></progress>
          </div>
        );
      })}
    </>
  );
};

export default ShowPollResults;
