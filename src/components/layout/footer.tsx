'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebook,
  faInstagram,
  faXTwitter, // Previously known as Twitter
} from '@fortawesome/free-brands-svg-icons';

import { collection, addDoc, getFirestore } from 'firebase/firestore';
import { app } from '../../lib/Firebase/Firebase';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [concern, setConcern] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<string | null>(null);

  const db = getFirestore(app);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionResult(null); // Reset previous submission result

    try {
      const docRef = await addDoc(collection(db, 'userFeedback'), {
        email: email,
        concern: concern,
        timestamp: new Date(),
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
    <footer className="bg-gray-300 py-8 px-12">
      <div className="container mx-auto flex justify-between items-center">
        {/* Contact Us Section */}
        <div className="w-1/3 text-black mb-auto">
          <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
          <p className="mb-2">Contact Number: 0912-345-6789</p>
          <p>Address: DAS Lutopan, Toledo City, Cebu</p>
          <div className="flex mt-4 space-x-4">
            <a href="#" className="hover:opacity-75">
              <FontAwesomeIcon icon={faFacebook} size="2x" />
            </a>
            <a href="#" className="hover:opacity-75">
              <FontAwesomeIcon icon={faInstagram} size="2x" />
            </a>
            <a href="#" className="hover:opacity-75">
              <FontAwesomeIcon icon={faXTwitter} size="2x" />
            </a>
          </div>
        </div>

        {/* Feedback Section */}
        <h4 className="text-2xl font-semibold mb-auto text-black">Feedback</h4>
        <div className="w-2/5">
          <form onSubmit={handleSubmit}>
            <div className="mb-2 flex">
              <label
                htmlFor="email"
                className="block text-black text-sm font-regular mb-1 pr-5 translate-x-4"
              >
                Email:
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="shadow appearance-none border rounded-2xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="flex">
              <label
                htmlFor="concern"
                className="block text-black text-sm font-medium mb-1 -translate-x-1"
              >
                Concern:
              </label>
              <textarea
                id="concern"
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                className="shadow appearance-none border rounded-2xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              ></textarea>
            </div>
            <div className="text-right mt-4">
              <button
                type="submit"
                className={`hover:bg-gray-400 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
          {submissionResult && (
            <p
              className={`mt-2 text-sm ${submissionResult.startsWith('Failed') ? 'text-red-500' : 'text-green-500'}`}
            >
              {submissionResult}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
