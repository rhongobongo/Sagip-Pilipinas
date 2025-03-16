'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebook,
  faInstagram,
  faXTwitter, // Previously known as Twitter
} from '@fortawesome/free-brands-svg-icons';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [concern, setConcern] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle feedback submission logic here
    console.log('Email:', email);
    console.log('Concern:', concern);
    // You would typically send this data to a server or handle it in some other way
    // Reset form fields after submission (optional):
    setEmail('');
    setConcern('');
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
                className=" hover:bg-gray-400 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
