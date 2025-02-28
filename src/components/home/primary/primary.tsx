"use client";

import React, { useState } from "react";
import Image from "next/image";

const images = [
  "/home-image/image1.jpg",
  "/home-image/image2.jpg",
  "/home-image/image3.jpg",
  "/home-image/image4.jpg",
  "/home-image/image5.jpg",
  "/home-image/image6.jpg",
  "/home-image/image7.jpg",
  "/home-image/image8.jpg",
];

const Primary: React.FC = () => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/home-image/background.jpg"
          alt="Background"
          layout="fill"
          objectFit="cover"
          className="opacity-50"
        />
      </div>
      
      <div className="relative z-10 max-w-5xl text-center">
        <h1 className="text-3xl font-bold">GABAY SA GITNA NG UNOS, MULING BUBUHAYIN ANG PAG-ASA</h1>
        <p className="mt-4 text-lg">
          When disaster strikes, every second counts. SAGIP PILIPINAS connects volunteers and organizations to those in need, ensuring relief efforts reach disaster-affected communities.
        </p>
        <button className="mt-6 bg-red-600 px-6 py-3 rounded-lg text-white font-semibold hover:bg-red-700 transition">
          DONATE →
        </button>
      </div>
      
      {/* Image Gallery */}
      <div className="absolute bottom-10 left-10 flex flex-wrap gap-2 w-1/2">
        {images.map((src, index) => (
          <div
            key={index}
            className={`relative w-32 h-32 overflow-hidden rounded-lg transition ${
              hovered === index ? "scale-110 z-10" : "opacity-70"
            }`}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
          >
            <Image
              src={src}
              alt="Disaster relief"
              layout="fill"
              objectFit="cover"
            />
          </div>
        ))}
      </div>
      
      {/* Location Info */}
      <div className="absolute bottom-20 left-10 bg-white text-black p-4 rounded-lg shadow-lg w-80">
        <h3 className="font-bold">📍 LUTOPAN, TOLEDO CITY, CEBU</h3>
        <p className="text-sm mt-2">
          After typhoon Odette, which hit Cebu on December 16, 2021, disaster volunteers came to DAS Lutopan to provide ayuda.
        </p>
      </div>
    </div>
  );
};

export default Primary;
