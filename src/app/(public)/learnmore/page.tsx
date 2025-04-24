"use client";

import React from 'react';

const Image = ({ src, alt, width, height, className }: { src: string, alt: string, width: number, height: number, className: string }) => (
  <img
    src={src}
    alt={alt}
    width={width}
    height={height}
    className={className}
    onError={(e) => {
        (e.target as HTMLImageElement).src = `https://placehold.co/${width}x${height}/cccccc/ffffff?text=Img+Error`;
    }}
  />
);

interface TeamMember {
  title: string;
  name: string;
  role: string;
  contact: string;
  email: string;
  imageFilename: string;
}

const teamMembers: TeamMember[] = [
    {
        title: "HEAD DEVELOPER",
        name: "Khent Lloyd A. Cases",
        role: "Full-stack Developer",
        contact: "09394558976",
        email: "khentlloyd.cases@cit.edu",
        imageFilename: "khent.jpg"
    },
    {
        title: "PROJECT MANAGER",
        name: "Arbien M. Armenion",
        role: "Full-stack Developer",
        contact: "09942818478",
        email: "arbien.armenion@cit.edu",
        imageFilename: "arbien.jpg"
    },
    {
        title: "MAIN FRONT-END DEVELOPER",
        name: "Keith Harvey P. Angel",
        role: "Full-stack Developer",
        contact: "09702651633",
        email: "keithharvey.angel@cit.edu",
        imageFilename: "keith.jpg"
    },
    {
        title: "MAIN BACK-END DEVELOPER",
        name: "Jeff Gabriel Leung",
        role: "Full-stack Developer",
        contact: "09945768903",
        email: "jeffgabriel.leung@cit.edu",
        imageFilename: "jeff.jpg"
    },
    {
        title: "MAIN UI/UX DEVELOPER",
        name: "Mark John A. Toroy",
        role: "Full-stack Developer",
        contact: "09967328459",
        email: "markjohn.toroy@cit.edu",
        imageFilename: "markjohn.jpg"
    },
];

const LearnMorePage = () => {
  const visionText = "Our vision is to foster a resilient Philippines where technology enables swift, coordinated, and effective disaster response, ultimately minimizing suffering and accelerating community recovery. We aspire to a future where aid reaches those in need promptly and efficiently, supported by seamless collaboration and optimized resources.";
  const missionText = "Our mission is to connect and coordinate disaster relief efforts across the Philippines through an integrated digital platform. We achieve this by streamlining resource allocation, volunteer management, and aid requests, while ensuring transparent communication, leading to a more efficient, impactful, and collaborative response when disasters strike.";
  const aboutUsText = "We are a group of enthusiastic 3rd year BSCPE students from Cebu Institute of Technology – University. Driven by a shared passion for using technology to make a difference, we developed Sagip Pilipinas as our project. Witnessing the challenges faced during disaster relief efforts in the Philippines, we were motivated to create an integrated digital platform to improve coordination, resource allocation, and communication for volunteers and organizations. We combined our academic knowledge in computer engineering with a commitment to helping communities recover faster and more effectively. We hope Sagip Pilipinas proves to be a valuable tool in times of need.";

  const imageBaseUrl = '/images/team/';

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <p className="text-gray-600 text-sm sm:text-base">
            Welcome to Sagip Pilipinas! We are a community of compassionate individuals, united in our mission to help those in need and restore hope.
          </p>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-left text-gray-800 mb-6 md:mb-8">
          Meet the Team
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {teamMembers.map((member, index) => (
            <div
              key={member.email}
              className={`bg-red-600 border border-red-700 rounded-full shadow-md text-red-50 ${ 
                index === 0 ? 'md:col-span-2 p-4 sm:p-6' : 'p-4' 
              }`}
            >
              <div className={`${index === 0 ? 'md:w-2/3 lg:w-1/2 mx-auto' : ''}`}>
                <div className={`flex flex-col sm:flex-row items-center gap-4 ${index === 0 ? 'sm:justify-center' : ''}`}>
                    <Image
                      src={`${imageBaseUrl}${member.imageFilename}`}
                      alt={`Photo of ${member.name}`}
                      width={80}
                      height={80}
                      className="rounded-full flex-shrink-0 object-cover border-2 border-red-100"
                    />

                    <div className="text-center sm:text-left">
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-1">{member.title}</h3>
                      <div className="space-y-0.5 text-xs sm:text-sm text-red-100">
                          <p><span className="font-bold text-white">Name:</span> {member.name}</p>
                          <p><span className="font-bold text-white">Role:</span> {member.role}</p>
                          <p><span className="font-bold text-white">Contact #:</span> {member.contact}</p>
                          <p><span className="font-bold text-white">Email:</span> {member.email}</p>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-red-600 border border-red-700 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-center text-red-50 mb-4">MISSION</h2>
            <p className="text-red-100 text-sm sm:text-base text-justify">{missionText}</p>
          </div>
          <div className="bg-red-600 border border-red-700 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-center text-red-50 mb-4">VISION</h2>
            <p className="text-red-100 text-sm sm:text-base text-justify">{visionText}</p>
          </div>
        </div>

        <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-left text-gray-800 mb-4">
              About Us
            </h2>
            <div className="bg-red-600 border border-red-700 rounded-lg p-6 shadow-sm">
              <p className="text-red-100 text-medium sm:text-base text-justify">
                {aboutUsText}
              </p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default LearnMorePage;
