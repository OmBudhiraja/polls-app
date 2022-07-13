import type React from 'react';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MdContentCopy as CopyIcon, MdOutlineCheck } from 'react-icons/md';
import FullPageLoader from '@/components/FullPageLoader';
import { trpc } from '@/utils/trpc';
import NotFoundPage from '../404';
import { getUrl } from '@/utils/getAppUrl';
import { inferQueryResponse } from '../api/trpc/[trpc]';
import ShowPollResults from '@/components/ShowPollResults';
import AddPollResult from '@/components/AddPollResult';

export type PollData = inferQueryResponse<'questions.get-by-id'>;

const QuestionPageContent: React.FC<{ id: string }> = ({ id }) => {
  const { data, isLoading, refetch } = trpc.useQuery(['questions.get-by-id', { id }], {
    refetchInterval: false,
    refetchOnWindowFocus: false,
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
          {data.isOwner || data.myVote ? (
            <ShowPollResults id={id} data={data} />
          ) : (
            <AddPollResult id={id} data={data} />
          )}
        </div>
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
