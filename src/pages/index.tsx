import type { NextPage } from 'next';
import { useCallback, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { trpc } from '@/utils/trpc';
import QuestionCard from '@/components/QuestionCard';
import FullPageLoader from '@/components/FullPageLoader';
import { getUrl } from '@/utils/getAppUrl';

const Home: NextPage = () => {
  const [showToast, setShowToast] = useState(false);
  const { data, isLoading } = trpc.useQuery(['questions.get-my-all-questions']);

  const url = getUrl();

  const copyToClipboard = useCallback(
    (questionId: string) => {
      navigator.clipboard.writeText(`${url}/question/${questionId}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    },
    [url]
  );

  if (isLoading || !data) return <FullPageLoader />;

  return (
    <div className="p-6 min-h-screen w-screen items-stretch relative">
      <Head>
        <title>Home | OnAVote</title>
        <meta name="description" content="Polls App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="header flex w-full justify-between items-center">
        <h1 className="text-4xl font-bold">OnAVote</h1>
        <Link href="/create">
          <a className="bg-gray-300 rounded text-gray-800 px-4 py-2 font-bold">
            Create a New Question
          </a>
        </Link>
      </header>
      <div className="grid grid-cols-1 gap-y-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-x-5 mt-10">
        {data.map((question) => (
          <QuestionCard key={question.id} question={question} copyToClipboard={copyToClipboard} />
        ))}
      </div>
      {showToast && (
        <div className="fixed bottom-5 right-10 flex items-center justify-center cursor-default bg-slate-50/10 px-5 py-4 rounded-md w-fit max-w-full">
          <span className="text-xs font-semibold">Link Copied to Clipboard!</span>
        </div>
      )}
    </div>
  );
};

export default Home;
