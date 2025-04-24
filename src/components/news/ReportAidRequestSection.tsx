// src/components/news/ReportAidRequestSection.tsx
'use client';

import React, { useState, useTransition } from 'react';
import { submitReport } from '@/actions/reportActions'; // Import the server action
import { FaFlag, FaCheckCircle } from 'react-icons/fa'; // Example icons

interface ReportAidRequestSectionProps {
  aidRequestId: string;
  loggedInUserId: string | null;
  hasUserAlreadyReported: boolean; // +++ New prop +++
}

export default function ReportAidRequestSection({
  aidRequestId,
  loggedInUserId,
  hasUserAlreadyReported, // +++ Use the new prop +++
}: ReportAidRequestSectionProps) {
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(
    null
  );

  // Determine if the user can report based on login status and previous reports
  const canReport = loggedInUserId && !hasUserAlreadyReported; // +++ User must be logged in AND not reported yet +++
  const cannotReportReason = !loggedInUserId
    ? 'You must be logged in to report.'
    : hasUserAlreadyReported
      ? 'You have already reported this request.'
      : null;

  const handleReportClick = () => {
    // Only allow toggling the form if the user *can* report
    if (canReport) {
      setShowReportForm(!showReportForm);
      setMessage(null); // Clear previous messages
      setMessageType(null);
      setReportReason(''); // Clear reason when toggling
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null); // Clear previous messages
    setMessageType(null);

    if (!canReport) {
      setMessage(cannotReportReason || 'Cannot submit report.');
      setMessageType('error');
      return; // Prevent submission if user cannot report
    }

    if (!reportReason.trim()) {
      setMessage('Please enter a reason for reporting.');
      setMessageType('error');
      return;
    }

    startTransition(async () => {
      // The server action will perform the final checks again
      const result = await submitReport(aidRequestId, reportReason);
      setMessage(result.message);
      setMessageType(result.success ? 'success' : 'error');
      if (result.success) {
        // Optimistically update UI or rely on page refresh/revalidation
        // For simplicity, just hiding the form. The parent page prop `hasUserAlreadyReported` won't update without a refresh/revalidation.
        setShowReportForm(false);
        setReportReason('');
        // You might want to visually disable the button permanently here in the client state too
      }
    });
  };

  // Render nothing, a message, or the button/form based on state
  if (!loggedInUserId) {
    return (
      <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-sm border border-gray-300 text-center text-sm text-gray-600">
        {cannotReportReason}{' '}
        <a href="/login" className="text-blue-600 hover:underline">
          Log in
        </a>
      </div>
    );
  }

  if (hasUserAlreadyReported) {
    return (
      <div className="mt-4 p-4 bg-green-100 rounded-lg shadow-sm border border-green-300 text-center text-sm text-green-700 flex items-center justify-center">
        <FaCheckCircle className="mr-2" /> {cannotReportReason}
      </div>
    );
  }

  // If logged in and hasn't reported, show the button and potentially the form
  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-300">
      <button
        onClick={handleReportClick}
        disabled={!canReport} // Disable if cannot report (redundant due to outer checks but safe)
        className={`flex items-center justify-center w-full px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition duration-150 ease-in-out ${
          !canReport
            ? 'bg-gray-400 cursor-not-allowed'
            : showReportForm
              ? 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-400' // Cancel style
              : 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-400' // Report style
        }`}
        aria-expanded={showReportForm}
      >
        <FaFlag className="mr-2" />
        {showReportForm ? 'Cancel Report' : 'Report this Request'}
      </button>

      {showReportForm &&
        canReport && ( // Only show form if allowed and toggled
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label
                htmlFor="reportReason"
                className="block text-sm font-medium text-gray-700"
              >
                Reason for Reporting:
              </label>
              <textarea
                id="reportReason"
                name="reportReason"
                rows={3}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                placeholder="Please provide details (e.g., inaccurate information, already resolved, inappropriate content...)"
              />
            </div>
            <button
              type="submit"
              disabled={isPending || !reportReason.trim()}
              className={`w-full px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out ${
                isPending || !reportReason.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              }`}
            >
              {isPending ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        )}

      {message && (
        <p
          className={`mt-3 text-sm ${
            messageType === 'success' ? 'text-green-600' : 'text-red-600'
          }`}
          role="alert"
        >
          {message}
        </p>
      )}
    </div>
  );
}
