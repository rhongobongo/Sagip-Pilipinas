// src/components/ui/ImageCard.tsx
'use client'; // <-- Mark this component to run on the client

import Image from 'next/image';

interface ImageCardProps {
    imageUrl: string;
    altText: string;
    fallbackImageUrl?: string; // Optional: Allow customizing the fallback
}

export default function ImageCard({
    imageUrl,
    altText,
    fallbackImageUrl = '/placeholder-image.jpg' // Default fallback image path
}: ImageCardProps) {
    return (
        <div className="overflow-hidden rounded-lg shadow-sm border border-gray-200 bg-white">
            <Image
                src={imageUrl}
                alt={altText}
                width={400} 
                height={300}
                className="w-full h-auto object-cover aspect-video" 
                onError={(e) => {
                  
                    if (e.currentTarget.src !== fallbackImageUrl) {
                        console.warn(`Image failed to load: ${imageUrl}. Falling back to placeholder.`);
                        e.currentTarget.src = fallbackImageUrl;
                    }
                }}
          
            />
        </div>
    );
}