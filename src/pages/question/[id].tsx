import FullPageLoader from '@/components/FullPageLoader';
import { trpc } from '@/utils/trpc';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import NotFoundPage from '../404';
import { MdContentCopy as CopyIcon, MdOutlineCheck } from 'react-icons/md';
import { getUrl } from '@/utils/getAppUrl';

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

const QuestionPageContect: React.FC<{ id: string }> = ({ id }) => {
  const { data, isLoading } = trpc.useQuery(['questions.get-by-id', { id }]);
  const {
    mutate,
    data: voteResponse,
    isLoading: isSubmittingVote,
  } = trpc.useMutation(['questions.vote-on-question'], {
    onSuccess: () => window.location.reload(),
  });

  const [showTickIcon, setShowTickIcon] = useState(false);

  const url = getUrl();

  if (isLoading) return <FullPageLoader />;

  if (!isLoading && (!data || !data.question)) return <NotFoundPage />;

  return (
    <div className="p-6 min-h-screen w-screen container m-auto">
      <Head>
        <title>Question | OnAVote</title>
      </Head>
      <header className="flex w-full justify-between mb-10 items-center">
        <Link href="/">
          <h3 className="text-2xl sm:text-4xl font-bold cursor-pointer">OnAVote</h3>
        </Link>
        {data.isOwner && <div className="bg-gray-700 rounded-md p-2 sm:p-3 ">You made this</div>}
      </header>
      <main className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-center">{data.question?.question}</h1>
          <button
            className="cursor-pointer btn btn-accent btn-circle"
            onClick={() => {
              navigator.clipboard.writeText(`${url}/question/${data.question?.id}`);
              setShowTickIcon(true);
              setTimeout(() => setShowTickIcon(false), 1200);
            }}
          >
            {showTickIcon ? (
              <MdOutlineCheck title="Copy Url" size={22} />
            ) : (
              <CopyIcon title="Copy Url" size={22} />
            )}
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {(data.question?.options as { text: string }[])?.map((option, index) => {
            if (data.isOwner || data.myVote) {
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
            }

            return (
              <button
                key={index}
                onClick={() => {
                  mutate({ questionId: id, optionIndex: index });
                }}
                className="btn btn-outline"
                disabled={isSubmittingVote}
              >
                {option.text}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};

const QuestionPage = () => {
  const { query } = useRouter();
  const { id } = query;

  if (!id || typeof id !== 'string') return <div>No id</div>;

  return <QuestionPageContect id={id} />;
};

export default QuestionPage;
