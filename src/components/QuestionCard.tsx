import Link from 'next/link';
import { Question } from '@prisma/client';
import { MdContentCopy as CopyIcon, MdOutlineCheck } from 'react-icons/md';
import { useState } from 'react';

const QuestionCard: React.FC<{
  question: Question;
  copyToClipboard: (questionId: string) => void;
}> = ({ question, copyToClipboard }) => {
  const [showTickIcon, setShowTickIcon] = useState(false);
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h3 className="card-title line-clamp-2">{question.question}</h3>
        <p className="text-sm text-white/30">Created on {question.createdAt.toDateString()}</p>
        <div className="card-actions mt-5 items-center justify-between">
          <Link href={`/question/${question.id}`}>
            <a className="btn btn-info">View Results</a>
          </Link>
          <button
            className="cursor-pointer btn btn-ghost btn-circle"
            onClick={() => {
              copyToClipboard(question.id);
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
      </div>
    </div>
  );
};

export default QuestionCard;
