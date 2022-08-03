import type React from 'react';
import { useEffect, useState } from 'react';
import { trpc } from '@/utils/trpc';

const EndPoll: React.FC<{ id: string; endDate: Date | null }> = ({ id, endDate }) => {
  const [showEndTimeIfExists, setShowEndTimeIfExists] = useState(false);

  useEffect(() => {
    endDate && setShowEndTimeIfExists(true);
  }, [endDate]);

  const trpcContext = trpc.useContext();
  const { mutate, isLoading } = trpc.useMutation('questions.endPoll', {
    onSuccess: () => {
      trpcContext.invalidateQueries('questions.get-by-id');
    },
  });
  const endPollHandler = () => {
    mutate({ id });
  };

  const isClient = () => {
    return typeof window !== 'undefined' && window.navigator;
  };

  return (
    <>
      <label
        htmlFor="confirmation-modal"
        className={`btn btn-error mt-7 px-6 ${isLoading ? 'btn-disabled loading' : ''}`}
      >
        {isLoading ? 'Ending the Poll' : 'End Poll Now!'}
      </label>
      {showEndTimeIfExists && (
        <p className="text-gray-500 text-sm mt-3">
          Automatically ends in{' '}
          {endDate!.toLocaleString(navigator.language, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })}
        </p>
      )}
      <input type="checkbox" id="confirmation-modal" className="modal-toggle" />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Are you Sure?</h3>
          <p className="py-4">This action can&apos;t be Undone. End the poll</p>
          <div className="modal-action">
            <label htmlFor="confirmation-modal" className="btn btn-outline">
              Cancel
            </label>
            <label className="btn" htmlFor="confirmation-modal" onClick={endPollHandler}>
              End It!
            </label>
          </div>
        </div>
      </div>
    </>
  );
};

export default EndPoll;
