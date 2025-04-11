'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const images = [
  {
    src: '/home-image/image1.jpg',
    alt: 'Volunteers Distributing Supplies',
    size: 'medium',
    rotate: 0,
    tag: 'Calinan, Davao City',
  },
  {
    src: '/home-image/image2.jpg',
    alt: 'Post-disaster Community Cleanup/Ayuda Distribution',
    size: 'medium',
    rotate: 0,
    tag: 'Naga, Cebu City',
  },
  {
    src: '/home-image/image3.jpg',
    alt: 'Affected Citizen Receiving an Aid Package',
    size: 'medium',
    rotate: 0,
    tag: 'Lutopan, Toledo City',
  },
  {
    src: '/home-image/image4.jpg',
    alt: 'Aid Distribution for Typhoon Affectees',
    size: 'medium',
    rotate: 0,
    tag: 'Ermita, Manila City',
  },
  {
    src: '/home-image/image5.jpg',
    alt: 'Flood Rescue Operation',
    size: 'medium',
    rotate: 0,
    tag: 'Naga, Cebu City',
  },
  {
    src: '/home-image/image6.jpg',
    alt: 'Community Medical Assistance',
    size: 'medium',
    rotate: 0,
    tag: 'Osmeña Blvd., Cebu City',
  },
  {
    src: '/home-image/image7.jpg',
    alt: 'Disaster Relief Operation',
    size: 'medium',
    rotate: 0,
    tag: 'San Pedro, Davao City',
  },
  {
    src: '/home-image/image8.jpg',
    alt: 'Volunteers Visiting A Distribution Center',
    size: 'medium',
    rotate: 0,
    tag: 'Rizal Street, Laoag City',
  },
  {
    src: '/home-image/image10.jpg',
    alt: 'Mother and Son Rescued',
    size: 'medium',
    rotate: 0,
    tag: 'Minglanilla, Cebu City',
  },
];

const Primary: React.FC = () => {
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="relative h-screen">
      <div className="absolute inset-0 bg-black bg-opacity-70 mix-blend-multiply" />
      <Image
        src="/home-image/image.jpg"
        alt="Young girl in 'Save the Children' poncho"
        fill
        className="object-cover"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,..."
      />

      <div className="absolute inset-0 px-6 md:px-12 flex flex-col md:flex-row items-center justify-left ml-10 h-full">
        <div
          className="relative w-full md:w-[45%] h-full top-6"
          style={{ aspectRatio: '4/5' }}
        >
          <div className="relative w-full h-full">
            {highlighted !== null && (
              <div
                className="absolute left-[55%] top-[41%] transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-2/5 rounded-lg shadow-2xl z-20"
                style={{
                  boxShadow: '0px 15px 40px rgb(0, 0, 0)',
                }}
                onClick={() => setHighlighted(null)}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={images[highlighted].src}
                    alt={images[highlighted].alt}
                    fill
                    className="rounded-lg object-cover border-4 border-black"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-70 rounded-b-lg">
                    <p className="text-sm text-white font-semibold text-center">
                      {images[highlighted].alt}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {images.map((item, index) => {
              // Making sizes more consistent, with just small and medium variants
              // Small is now 18%, medium is 22%
              const size =
                item.size === 'large'
                  ? '40%'
                  : item.size === 'medium'
                    ? '35%'
                    : '30%';

              // Using fixed width with 1:3 height to width ratio
              const width = `${size}`;
              const height = `calc(${size} /2)`;
              //
              const position = {
                top: [33, 23, 42, 22, 32, 30, 14, 50, 41][index],
                left: [0, 18, 16, 55, 35.5, 71.5, 38, 38, 54][index],
              };

              let zIndexOrder = 0;

              if (highlighted === index) {
                zIndexOrder = 30;
              } else if (highlighted !== null && index === 4) {
                zIndexOrder = 10;
              } else if (index === 4) {
                zIndexOrder = 20;
              } else if ([1, 2, 3, 8].includes(index)) {
                zIndexOrder = 15;
              } else if ([0, 5, 6, 7].includes(index)) {
                zIndexOrder = 10;
              }

              if (highlighted !== null && highlighted === index) {
                zIndexOrder = -1;
              }

              let opacity = 1;

              if (highlighted !== null) {
                opacity = highlighted === index ? 1 : 0.5;
              } else if (hovered !== null) {
                opacity = hovered === index ? 1 : 0.5;
                if (hovered === index) {
                  zIndexOrder = 25;
                }
              }

              return (
                <div
                  key={index}
                  className={`absolute transition-all duration-300 cursor-pointer
                    ${highlighted === index ? 'scale-105 z-20' : ''}
                    ${hovered !== null && hovered !== index && highlighted === null ? 'opacity-50' : ''}
                    ${index === highlighted ? 'shadow-2xl' : 'shadow-md'}
                  `}
                  style={{
                    width,
                    height,
                    top: `${position.top}%`,
                    left: `${position.left}%`,
                    transform: `rotate(${item.rotate}deg)`,
                    borderColor: '#000',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderRadius: '8px',
                    boxShadow: '0px 8px 50px rgb(0, 0, 0)',
                    zIndex: zIndexOrder,
                    opacity: opacity,
                    transition: 'opacity 0.3s ease-in-out',
                  }}
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() =>
                    setHighlighted(index === highlighted ? null : index)
                  }
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="rounded-lg object-cover border-2 border-black"
                  />
                  {item.tag && (
                    <div className="absolute bottom-2 left-2 p-2 bg-black bg-opacity-50 rounded">
                      <p className="text-xs text-white font-semibold">
                        {item.tag}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 px-6 md:px-12 flex-col md:flex-row items-center flex justify-end h-full">
        <div className="relative w-full md:w-6/12 flex flex-col items-end md:items-end md:pl-24 mr-10 -mt-20">
          <h1 className="text-3xl font-black uppercase tracking-wide md:text-right mb-8 w-full text-white">
            GABAY SA GITNA NG UNOS,
            <br />
            MULING BUBUHAYIN ANG PAG-ASA
          </h1>
          <p className="text-lg text-gray-200 mb-5 justify md:text-justify">
            When disaster strikes, every second counts.
          </p>
          <p className="text-lg text-gray-200 mb-5 justify md:text-justify w-full">
            SAGIP PILIPINAS connects volunteers and organizations to those in
            need, streamlining relief efforts for a faster, more effective
            response. Coordinating aid, tracking resources, and mobilizing
            support, all made easier, ensuring that help reaches
            disaster-affected communities when they need it most.
          </p>
          <p className="text-lg text-gray-200 mb-12 justify md:text-justify">
            Join us in making a difference. DONATE/SIGN UP NOW!
          </p>
          <button
            className="bg-red-600 px-8 py-4 rounded-full text-white font-bold 
            hover:bg-red-700 transition transform-gpu mb-6 md:mb-0"
          >
            DONATE →
          </button>
        </div>
      </div>

      <p className="absolute top-[77%] left-[28%] transform -translate-x-1/2 text-sm text-black-400 opacity-75">
        Hover over photos; click to enlarge
      </p>
    </div>
  );
};

export default Primary;
