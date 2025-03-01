"use client";

import React, { useState } from "react";
import Image from "next/image";

const images = [
  { 
    src: "/home-image/image1.jpg", 
    alt: "Volunteer distributing supplies", 
    size: "large", 
    rotate: 3 
  },
  { 
    src: "/home-image/image2.jpg", 
    alt: "Post-disaster community cleanup", 
    size: "medium", 
    rotate: -2 
  },
  { 
    src: "/home-image/image3.jpg", 
    alt: "Child receiving aid package", 
    size: "large", 
    rotate: 0, 
    tag: "Lutopan, Toledo City" 
  },
  { 
    src: "/home-image/image4.jpg", 
    alt: "Medical team in action", 
    size: "medium", 
    rotate: -5 
  },
  { 
    src: "/home-image/image5.jpg", 
    alt: "Temporary shelter construction", 
    size: "medium", 
    rotate: 2 
  },
  { 
    src: "/home-image/image6.jpg", 
    alt: "Community thank you ceremony", 
    size: "medium", 
    rotate: 3 
  },
  { 
    src: "/home-image/image7.jpg", 
    alt: "Disaster relief operation", 
    size: "medium", 
    rotate: -3 
  },
  { 
    src: "/home-image/image8.jpg", 
    alt: "Volunteers in action", 
    size: "large", 
    rotate: 1 
  },
];

const Primary: React.FC = () => {
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="relative h-screen">
     
      <div className="absolute inset-0 bg-black bg-opacity-70 mix-blend-multiply" />
      <Image
        src="/home-image/image9.jpg"
        alt="Young girl in 'Save the Children' poncho"
        fill
        className="object-cover brightness-65"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,..."
      />
      
      <div className="absolute inset-0 px-6 md:px-12 flex flex-col md:flex-row items-center justify-center h-full">
       
        <div 
          className="relative w-[40%] md:w-[45%] h-full"
          style={{ aspectRatio: '4/5' }}
        >
          <div 
            className="relative h-full overflow-hidden"

          >
           
            {highlighted !== null && (
              <div 
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-2/5 rounded-lg shadow-2xl z-20"
                onClick={() => setHighlighted(null)}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={images[highlighted].src}
                    alt={images[highlighted].alt}
                    fill
                    className="rounded-lg object-cover border-2 border-white"
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
              const size = item.size === 'large' ? '40%' : 
                          item.size === 'medium' ? '35%' : '30%';
              
              // Using fixed width with 1:3 height to width ratio
              const width = `${size}`;
              const height = `calc(${size} / 2)`;
              //
              const position = {
                top: [25, 20, 45, 17, 30, 30, 10, 45][index], 
                left: [0, 15, 15, 55, 40, 65, 36, 40][index], 
              };

              return (
                <div
                  key={index}
                  className={`absolute transition-all duration-300 cursor-pointer
                    ${highlighted === index ? 'scale-105 z-10' : ''}
                    ${(hovered !== null && hovered !== index) ? 'opacity-50' : 'opacity-100'}
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
                    zIndex: highlighted === index ? 10 : index + 1,
                  }}
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setHighlighted(index === highlighted ? null : index)}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="rounded-lg object-cover"
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

        
        <div className="relative w-full md:w-5/12 flex flex-col items-center md:items-start md:pl-24">
          <h1 className="text-5xl font-black uppercase tracking-wide text-center md:text-left mb-8">
            GABAY SA GITNA NG UNOS,<br/>MULING BUBUHAYIN ANG PAG-ASA
          </h1>
          <p className="text-lg text-gray-200 mb-12 max-w-lg">
            When disaster strikes, every second counts. Sagip Pilipinas connects 
            volunteers and organizations to ensure relief reaches affected communities.
          </p>
          <button className="bg-red-600 px-8 py-4 rounded-full text-white font-bold 
            hover:bg-red-700 transition transform-gpu mb-6 md:mb-0">
            DONATE →
          </button>
        </div>
      </div>

      <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm 
        text-gray-400 opacity-75">
        Hover over photos; click to enlarge
      </p>
    </div>
  );
};

export default Primary;