// src/actions/reportActions.ts
'use server';

import { db } from '@/lib/Firebase-Admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getAuthTokens } from '@/lib/Next-Firebase-Auth-Edge/NextFirebaseAuthEdge';
import { cookies } from 'next/headers';

// Helper function to get user ID within the server action
async function getActionUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies(); // Get cookies within the action
    const tokens = await getAuthTokens(cookieStore);
    return tokens?.decodedToken.uid || null;
  } catch (error) {
    console.error('Error getting user ID in server action:', error);
    return null;
  }
}

interface ReportData {
  reason: string;
  reportedBy: string | null; // Store the user ID of the reporter
  timestamp: Date;
}

// Interface for the structure within the reports array (adjust if needed)
interface ExistingReport {
  reportedBy?: string;
  // other fields...
}

export async function submitReport(
  aidRequestId: string,
  reportReason: string
): Promise<{ success: boolean; message: string }> {
  if (!aidRequestId) {
    return { success: false, message: 'Aid Request ID is missing.' };
  }
  if (!reportReason || reportReason.trim() === '') {
    return { success: false, message: 'Report reason cannot be empty.' };
  }

  const reportedByUserId = await getActionUserId(); // Get user ID securely

  // +++ Server-side Login Check +++
  if (!reportedByUserId) {
    return {
      success: false,
      message: 'Authentication required. Please log in to report.',
    };
  }

  const reportTimestamp = new Date();

  try {
    const reportRef = db.collection('aidRequest').doc(aidRequestId);

    // +++ Server-side "Report Once" Check +++
    // Use a transaction to read and then write atomically
    await db.runTransaction(async (transaction) => {
      const docSnap = await transaction.get(reportRef);

      if (!docSnap.exists) {
        throw new Error('Aid request not found.'); // Or handle differently
      }

      const data = docSnap.data();
      const existingReports = (data?.reports || []) as ExistingReport[]; // Cast safely

      const alreadyReported = existingReports.some(
        (report) => report.reportedBy === reportedByUserId
      );

      if (alreadyReported) {
        // Throw an error within the transaction to abort it
        throw new Error(
          'You have already submitted a report for this request.'
        );
      }

      // If not already reported, proceed with the update within the transaction
      const newReport: ReportData = {
        reason: reportReason.trim(),
        reportedBy: reportedByUserId,
        timestamp: reportTimestamp,
      };

      transaction.update(reportRef, {
        reports: FieldValue.arrayUnion(newReport),
        reportCount: FieldValue.increment(1),
        lastReportedAt: FieldValue.serverTimestamp(),
      });
    });
    // If transaction completes without error:
    console.log(
      `Report submitted successfully for aidRequest ${aidRequestId} by user ${reportedByUserId}. Report count incremented.`
    );
    return { success: true, message: 'Report submitted successfully.' };
  } catch (error: unknown) {
    console.error(
      `Error submitting report for aidRequest ${aidRequestId}:`,
      error
    );
    // The error message from the transaction (e.g., "already reported") will be caught here
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unknown server error occurred.';
    return {
      success: false,
      message: `Failed to submit report: ${errorMessage}`,
    };
  }
}
