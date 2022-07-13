import Link from 'next/link';

const NotFoundPage = () => {
  return (
    <div className="antialiased min-h-screen flex flex-col gap-5 items-center justify-center">
      <p className="text-white/40 text-3xl">Oops! The Page you are looking for does not exist!</p>
      <Link href="/">
        <a className="underline text-blue-300">Go Back Home</a>
      </Link>
    </div>
  );
};

export default NotFoundPage;
