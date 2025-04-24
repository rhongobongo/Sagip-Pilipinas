import React from 'react';
import Image from 'next/image';

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

const LearnMorePage = async () => {
  const visionText = "Our vision is to foster a resilient Philippines where technology enables swift, coordinated, and effective disaster response, ultimately minimizing suffering and accelerating community recovery. We aspire to a future where aid reaches those in need promptly and efficiently, supported by seamless collaboration and optimized resources.";
  const missionText = "Our mission is to connect and coordinate disaster relief efforts across the Philippines through an integrated digital platform. We achieve this by streamlining resource allocation, volunteer management, and aid requests, while ensuring transparent communication, leading to a more efficient, impactful, and collaborative response when disasters strike.";
  const aboutUsText = "We are a group of enthusiastic 3rd year BSCPE students from Cebu Institute of Technology – University. Driven by a shared passion for using technology to make a difference, we developed Sagip Pilipinas as our project. Witnessing the challenges faced during disaster relief efforts in the Philippines, we were motivated to create an integrated digital platform to improve coordination, resource allocation, and communication for volunteers and organizations. We combined our academic knowledge in computer engineering with a commitment to helping communities recover faster and more effectively. We hope Sagip Pilipinas proves to be a valuable tool in times of need.";

  return (
    <div className="bg-gray-50 min-h-screen p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-gray-600">
            Welcome to Sagip Pilipinas! We are a community of compassionate individuals, united in our mission to help those in need and restore hope.
          </p>
        </div>

        <h2 className="text-3xl font-bold text-left text-gray-800 mb-8">
          Meet the Team
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {teamMembers.map((member, index) => (
            <div
              key={member.email}
              className={`bg-amber-100 border border-amber-200 rounded-full shadow-sm ${
                index === 0 ? 'md:col-span-2 p-0' : 'p-4'
              }`}
            >
              <div className={`${index === 0 ? 'md:w-2/3 mx-auto p-4' : ''}`}>
                <div className={`flex items-center gap-4 ${index === 0 ? 'justify-center' : ''}`}>
                    <Image
                      src={`/images/team/${member.imageFilename}`}
                      alt={`Photo of ${member.name}`}
                      width={80}
                      height={80}
                      className="rounded-full flex-shrink-0 object-cover"
                    />

                    <div>
                        <h3 className="text-md font-semibold text-gray-800 mb-1">{member.title}</h3>
                        <div className="space-y-0.5 text-xs md:text-sm text-gray-700">
                            <p><span className="font-bold text-gray-900">Name:</span> {member.name}</p>
                            <p><span className="font-bold text-gray-900">Role:</span> {member.role}</p>
                            <p><span className="font-bold text-gray-900">Contact #:</span> {member.contact}</p>
                            <p><span className="font-bold text-gray-900">Email:</span> {member.email}</p>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-red-600 border border-red-700 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-center text-red-50 mb-4">MISSION</h2>
            <p className="text-red-100 text-sm text-justify">{missionText}</p>
          </div>
          <div className="bg-red-600 border border-red-700 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-center text-red-50 mb-4">VISION</h2>
            <p className="text-red-100 text-sm text-justify">{visionText}</p>
          </div>
        </div>

        <div className="mb-12">
            <h2 className="text-3xl font-bold text-left text-gray-800 mb-4">
              About Us
            </h2>
            <div className="bg-red-600 border border-red-700 rounded-lg p-6 shadow-sm">
              <p className="text-red-100 text-medium text-justify">
                {aboutUsText}
              </p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default LearnMorePage;
