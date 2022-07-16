import type React from 'react';
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  MdContentCopy as CopyIcon,
  MdOutlineCheck as CheckIcon,
  MdOutlineInfo as InfoIcon,
} from 'react-icons/md';
import FullPageLoader from '@/components/FullPageLoader';
import { trpc } from '@/utils/trpc';
import NotFoundPage from '../404';
import { inferQueryResponse } from '../api/trpc/[trpc]';
import ShowPollResults from '@/components/ShowPollResults';
import AddPollResult from '@/components/AddPollResult';
import EndPoll from '@/components/EndPoll';

export type PollData = inferQueryResponse<'questions.get-by-id'>;

export function hasPollEnded(data: PollData | undefined) {
  if (!data) return false;
  if (
    data.question?.ended ||
    (data.question?.endsAt && new Date().getTime() > new Date(data.question.endsAt).getTime())
  )
    return true;
  return false;
}

const QuestionPageContent: React.FC<{ id: string }> = ({ id }) => {
  const { data, isLoading, refetch } = trpc.useQuery(['questions.get-by-id', { id }], {
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const [showTickIcon, setShowTickIcon] = useState(false);

  const pollEnded = hasPollEnded(data);

  if (isLoading) return <FullPageLoader />;

  if (!isLoading && (!data || !data.question)) return <NotFoundPage />;

  return (
    <div className="p-6 min-h-screen w-screen container m-auto">
      <Head>
        <title>Question | OnAVote</title>
      </Head>
      <header className="flex w-full justify-between mb-20 items-center">
        <Link href="/">
          <h3 className="text-2xl sm:text-4xl font-bold cursor-pointer">OnAVote</h3>
        </Link>
        {data.isOwner && <div className="bg-gray-700 rounded-md p-2 sm:p-3 ">You made this</div>}
      </header>
      <main className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-10 gap-5">
          <h1 className="text-3xl font-bold text-center">{data.question?.question}</h1>
          <button
            className="cursor-pointer btn btn-accent btn-circle"
            onClick={() => {
              const url = window.location.href;
              navigator.clipboard.writeText(url);
              setShowTickIcon(true);
              setTimeout(() => setShowTickIcon(false), 1200);
            }}
          >
            {showTickIcon ? (
              <CheckIcon title="Copy Url" size={22} />
            ) : (
              <CopyIcon title="Copy Url" size={22} />
            )}
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {data.isOwner || data.myVote || pollEnded ? (
            <ShowPollResults id={id} data={data} pollEnded={pollEnded} />
          ) : (
            <AddPollResult id={id} data={data} />
          )}
        </div>
        {data.isOwner && !pollEnded && <EndPoll endDate={data.question.endsAt} id={id} />}
        {pollEnded && data.question.resultsVisibility !== 'hidden' && (
          <div className="text-gray-500 mt-10 flex gap-2 items-center">
            <InfoIcon /> Poll has been ended
          </div>
        )}
      </main>
    </div>
  );
};

const QuestionPage = () => {
  const { query } = useRouter();
  const { id } = query;

  if (!id || typeof id !== 'string') return <div>No id</div>;

  return <QuestionPageContent id={id} />;
};

export default QuestionPage;
