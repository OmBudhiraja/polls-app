import type React from 'react';
import { useEffect } from 'react';
import Ably from 'ably';
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

const ShowPollResults: React.FC<{ data: PollData; id: string }> = ({ data, id }) => {
  const { refetch } = trpc.useQuery(['questions.get-by-id', { id }], {
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const ably = new Ably.Realtime.Promise({ authUrl: '/api/createTokenRequest' });
    const channel = ably.channels.get('pollsResults');
    channel.subscribe(id, () => {
      refetch();
    });

    return () => {
      channel.unsubscribe();
    };
  }, [id, refetch]);

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
