'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebook,
  faInstagram,
  faXTwitter, // Previously known as Twitter
} from '@fortawesome/free-brands-svg-icons';

import { collection, addDoc, getFirestore } from 'firebase/firestore';
import { app } from '../../lib/Firebase/Firebase'; // Ensure this path is correct

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [concern, setConcern] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<string | null>(null);

  // Initialize Firestore only if the app is available (for client-side)
  const db = typeof window !== 'undefined' ? getFirestore(app) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) {
      setSubmissionResult('Database connection not available.');
      return;
    }
    setIsSubmitting(true);
    setSubmissionResult(null); // Reset previous submission result

    try {
      const docRef = await addDoc(collection(db, 'userFeedback'), {
        email: email,
        concern: concern,
        timestamp: new Date(),
        location: 'Cebu City, Central Visayas, Philippines', // Add location context
      });
      console.log('Document written with ID: ', docRef.id);
      setSubmissionResult('Feedback submitted successfully!');
      setEmail('');
      setConcern('');
    } catch (error: unknown) {
      console.error('Error adding document: ', error);
      if (error instanceof Error) {
        setSubmissionResult(`Failed to submit feedback: ${error.message}`);
      } else {
        setSubmissionResult(
          'Failed to submit feedback: An unknown error occurred.'
        );
        console.error('Unknown error:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Use responsive padding: less padding on small screens, more on larger ones
    <footer className="bg-gray-300 py-8 px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="container mx-auto">
        {/*
                 Layout Container:
                 - Default (mobile): flex-col (stacks items vertically) with space between (space-y-8)
                 - Medium screens (md) and up: flex-row (side-by-side), space-x-8, align items to the top (items-start)
                */}
        <div className="flex flex-col md:flex-row md:justify-between md:space-x-8 space-y-8 md:space-y-0 md:items-start">
          {/* Contact Us Section */}
          {/* Takes full width on mobile, adjusts width on medium screens */}
          <div className="w-full md:w-5/12 text-black text-center md:text-left">
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <p className="mb-2">Contact Number: 0912-345-6789</p>
            <p>Address: DAS Lutopan, Toledo City, Cebu</p>
            {/* Center icons on mobile, left-align on medium screens */}
            <div className="flex mt-4 space-x-4 justify-center md:justify-start">
              <a href="#" aria-label="Facebook" className="hover:opacity-75">
                <FontAwesomeIcon icon={faFacebook} size="2x" />
              </a>
              <a href="#" aria-label="Instagram" className="hover:opacity-75">
                <FontAwesomeIcon icon={faInstagram} size="2x" />
              </a>
              <a href="#" aria-label="X (Twitter)" className="hover:opacity-75">
                <FontAwesomeIcon icon={faXTwitter} size="2x" />
              </a>
            </div>
          </div>

          {/* Feedback Section */}
          {/* Takes full width on mobile, adjusts width on medium screens */}
          <div className="w-full md:w-6/12">
            {/* Moved Heading Inside */}
            <h4 className="text-xl md:text-2xl font-semibold mb-4 text-black text-center md:text-left">
              Feedback
            </h4>
            <form onSubmit={handleSubmit}>
              {/* Email Field Group */}
              <div className="mb-4">
                {' '}
                {/* Added margin-bottom for spacing */}
                <label
                  htmlFor="email"
                  // Simplified label styling: block display, margin bottom
                  className="block text-black text-sm font-regular mb-1"
                >
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required // Added required attribute for basic validation
                  className="shadow appearance-none border rounded-2xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="your.email@example.com" // Added placeholder
                />
              </div>
              {/* Concern Field Group */}
              <div className="mb-4">
                {' '}
                {/* Added margin-bottom for spacing */}
                <label
                  htmlFor="concern"
                  // Simplified label styling
                  className="block text-black text-sm font-medium mb-1"
                >
                  Concern:
                </label>
                <textarea
                  id="concern"
                  value={concern}
                  onChange={(e) => setConcern(e.target.value)}
                  required // Added required attribute
                  rows={4} // Give textarea a default size
                  className="shadow appearance-none border rounded-2xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter your feedback or concern here..." // Added placeholder
                ></textarea>
              </div>
              {/* Center button on mobile, right-align on medium screens */}
              <div className="text-center md:text-right mt-4">
                <button
                  type="submit"
                  className={`bg-gray-200 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isSubmitting || !email || !concern} // Disable if submitting or fields are empty
                >
                  {isSubmitting ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
            {submissionResult && (
              <p
                // Center result message on mobile, left-align on medium screens
                className={`mt-3 text-sm text-center md:text-left ${submissionResult.startsWith('Failed') ? 'text-red-600' : 'text-green-600'}`}
              >
                {submissionResult}
              </p>
            )}
          </div>
        </div>
        {/* Copyright - Added centered below the main content */}
        <div className="text-center text-gray-600 mt-8 pt-4 border-t border-gray-400">
          &copy; {new Date().getFullYear()} Sagip Pilipinas. All Rights
          Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
