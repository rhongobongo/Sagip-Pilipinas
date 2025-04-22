// src/components/(page)/donationPage/DonationPageForm.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CiCirclePlus } from 'react-icons/ci';
import {
    CheckedDonationTypes,
    DonationDetails,
    FoodDetails,
    ClothingDetails,
    MedicalSuppliesDetails,
    ShelterDetails,
    SearchAndRescueDetails,
    FinancialAssistanceDetails,
    CounselingDetails,
    TechnicalSupportDetails,
} from './types';
import { donate, uploadDonation } from '@/lib/APICalls/Donation';
import emailjs from '@emailjs/browser'; // --- Imports Added ---

// --- Type Added ---
// Define type for volunteer data fetched from API
type VolunteerData = {
    userId: string;
    email: string | null;
    firstName: string | null;
};

// Updated interface to match the server component
interface OrganizationData {
    id: string;
    email?: string;
    name?: string;
    location?: string;
    contactNumber?: string;
    // Update to match the structure from registerOrganization
    aidStock?: {
        food?: {
            available: boolean;
            foodPacks?: number;
        };
        clothing?: {
            available: boolean;
            male?: number;
            female?: number;
            children?: number;
        };
        medicalSupplies?: {
            available: boolean;
            kits?: number;
        };
        shelter?: {
            available: boolean;
            tents?: number;
            blankets?: number;
        };
        searchAndRescue?: {
            available: boolean;
            rescueKits?: number;
            rescuePersonnel?: number;
        };
        financialAssistance?: {
            available: boolean;
            totalFunds?: number;
        };
        counseling?: {
            available: boolean;
            counselors?: number;
            hours?: number;
        };
        technicalSupport?: {
            available: boolean;
            vehicles?: number;
            communication?: number;
        };
    };
}

interface DonationPageFormProps {
    fetchedOrgData: OrganizationData | null; // Accept the fetched data as a prop
}

const DonationPageForm: React.FC<DonationPageFormProps> = ({
    fetchedOrgData,
}) => {
    const now = new Date();

    // Add state to track the selected aid request ID
    const [selectedAidRequestId, setSelectedAidRequestId] = useState<string | null>(null);

    // Listen for query parameter changes
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const aidRequestId = searchParams.get('aidRequestId');
        if (aidRequestId) {
            setSelectedAidRequestId(aidRequestId);
            console.log("Donating towards Aid Request ID:", aidRequestId); // Log confirmation
        }
    }, []);


    const [checkedDonationTypes, setCheckedDonationTypes] =
        useState<CheckedDonationTypes>({
            food: false,
            clothing: false,
            medicalSupplies: false,
            shelter: false,
            searchAndRescue: false,
            financialAssistance: false,
            counseling: false,
            technicalSupport: false,
        });

    const [donationDetails, setDonationDetails] = useState<DonationDetails>({
        food: { foodPacks: '', category: '' } as FoodDetails,
        clothing: { male: '', female: '', children: '' } as ClothingDetails,
        medicalSupplies: { kits: '', kitType: '' } as MedicalSuppliesDetails,
        shelter: { tents: '', blankets: '' } as ShelterDetails,
        searchAndRescue: { rescueKits: '', rescuePersonnel: '' } as SearchAndRescueDetails,
        financialAssistance: { totalFunds: '', currency: 'PHP' } as FinancialAssistanceDetails,
        counseling: { counselors: '', hours: '' } as CounselingDetails,
        technicalSupport: { vehicles: '', communication: '' } as TechnicalSupportDetails,
    });

    // State for donation date and image
    const [donationDate, setDonationDate] = useState('');
    const [donationImage, setDonationImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // --- State Added ---
    const [isSubmitting, setIsSubmitting] = useState(false); // Combined submitting state
    const [statusMessage, setStatusMessage] = useState(''); // For user feedback

    // Calculate inventory limits (keep this logic)
    const inventoryLimits = {
        food: { maxFoodPacks: fetchedOrgData?.aidStock?.food?.foodPacks },
        clothing: {
            maxMale: fetchedOrgData?.aidStock?.clothing?.male,
            maxFemale: fetchedOrgData?.aidStock?.clothing?.female,
            maxChildren: fetchedOrgData?.aidStock?.clothing?.children,
        },
        medicalSupplies: { maxMedicalKits: fetchedOrgData?.aidStock?.medicalSupplies?.kits },
        shelter: {
            maxTents: fetchedOrgData?.aidStock?.shelter?.tents,
            maxBlankets: fetchedOrgData?.aidStock?.shelter?.blankets,
        },
        searchAndRescue: {
            maxRescueKits: fetchedOrgData?.aidStock?.searchAndRescue?.rescueKits,
            maxRescuePersonnel: fetchedOrgData?.aidStock?.searchAndRescue?.rescuePersonnel,
        },
        financialAssistance: { maxFunds: fetchedOrgData?.aidStock?.financialAssistance?.totalFunds },
        counseling: {
            maxCounselors: fetchedOrgData?.aidStock?.counseling?.counselors,
            maxHours: fetchedOrgData?.aidStock?.counseling?.hours,
        },
        technicalSupport: {
            maxVehicles: fetchedOrgData?.aidStock?.technicalSupport?.vehicles,
            maxCommunication: fetchedOrgData?.aidStock?.technicalSupport?.communication,
        },
    };

    // Initialize checkboxes based on available aid types
    useEffect(() => {
        if (fetchedOrgData?.aidStock) {
            const aidStock = fetchedOrgData.aidStock;
            setCheckedDonationTypes({
                food: aidStock.food?.available ?? false,
                clothing: aidStock.clothing?.available ?? false,
                medicalSupplies: aidStock.medicalSupplies?.available ?? false,
                shelter: aidStock.shelter?.available ?? false,
                searchAndRescue: aidStock.searchAndRescue?.available ?? false,
                financialAssistance: aidStock.financialAssistance?.available ?? false,
                counseling: aidStock.counseling?.available ?? false,
                technicalSupport: aidStock.technicalSupport?.available ?? false,
            });
        }
    }, [fetchedOrgData]);

    // --- EmailJS Configuration ---
    const YOUR_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const YOUR_VOLUNTEER_TEMPLATE_ID = "template_kftx3cq"; // The NEW template ID
    const YOUR_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "RboVfwlHriKEa9DEr"; // Your key

    // --- Existing Handlers (Keep these as they are in your original code) ---
    const handleDonationCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        setCheckedDonationTypes((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    const handleDonationDetailChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name } = event.target;
        let value = event.target.value;
        const [category, field] = name.split('.') as [keyof typeof donationDetails, string];

        // Keep your existing validation logic for max limits etc.
        if (event.target.type === 'number') {
            let maxValue: number | undefined = undefined;
            // Determine maxValue based on category and field... (your existing logic here)
             if (category === 'food' && field === 'foodPacks') maxValue = inventoryLimits.food.maxFoodPacks ?? 0;
             else if (category === 'clothing' && field === 'male') maxValue = inventoryLimits.clothing.maxMale ?? 0;
             // ... include all other else if conditions ...
             else if (category === 'technicalSupport' && field === 'communication') maxValue = inventoryLimits.technicalSupport.maxCommunication ?? 0;


            // Validate and potentially cap the value
            if (maxValue !== undefined) {
                const numValue = field === 'totalFunds' ? parseFloat(value) : parseInt(value, 10);
                if (!isNaN(numValue)) {
                    if (numValue > maxValue) value = maxValue.toString();
                    else if (numValue < 0) value = '0';
                } else if (value !== '') {
                    value = '';
                }
            }
        }

        setDonationDetails((prev) => {
            const currentCategoryDetails = prev[category] || {};
            return { ...prev, [category]: { ...currentCategoryDetails, [field]: value, }, };
        });
    };

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDonationDate(event.target.value);
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            const file = event.target.files[0];
            setDonationImage(file);
            const previewUrl = URL.createObjectURL(file);
            // Revoke previous URL if exists before setting new one
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
            setImagePreview(previewUrl);
        } else {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
            setDonationImage(null);
            setImagePreview(null);
        }
    };
    // --- End of Existing Handlers ---


    // --- MODIFIED handleSubmit Function ---
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true); // Indicate processing starts
        setStatusMessage('Processing donation...');

        // --- Basic Validation ---
        if (!fetchedOrgData || !fetchedOrgData.id) {
            alert('Error: Organization data is missing.');
            setIsSubmitting(false);
            setStatusMessage('Error: Missing organization data.');
            return;
        }
        if (!donationDate) {
            alert('Please select an estimated drop-off/volunteer date.');
            setIsSubmitting(false);
            setStatusMessage('Error: Date missing.');
            return;
        }
        const checkedTypesArray = Object.entries(checkedDonationTypes).filter(([, checked]) => checked);
        if (checkedTypesArray.length === 0) {
            alert('Please select at least one donation type.');
            setIsSubmitting(false);
            setStatusMessage('Error: No donation types selected.');
            return;
        }
        // Add validation for donation details if necessary (e.g., ensure quantities > 0)

        if (!YOUR_SERVICE_ID || !YOUR_VOLUNTEER_TEMPLATE_ID || !YOUR_PUBLIC_KEY) {
            console.error("EmailJS environment variables not set!");
            alert('Configuration error. Cannot send notifications.');
            setIsSubmitting(false);
            setStatusMessage('Error: Email configuration error.');
            return;
        }

        // --- Prepare Donation Data ---
        const checkedDonationTypesToSend: CheckedDonationTypes = Object.fromEntries(
            checkedTypesArray
        ) as CheckedDonationTypes;

        const filteredDonationDetails: Partial<DonationDetails> = {};
        const donationSummaryItems: string[] = [];

       for (const key in checkedDonationTypesToSend) {
      const donationTypeKey = key as keyof CheckedDonationTypes; // Type assertion here is okay

      // Check if this type was checked AND if details exist in the main state
      if (checkedDonationTypesToSend[donationTypeKey] && donationDetails[donationTypeKey]) {
          // Assign the specific detail object directly using the known key
          // No need for 'as' assertions here because we are assigning the correct sub-object
          switch (donationTypeKey) {
              case 'food':
                  filteredDonationDetails.food = donationDetails.food;
                  break;
              case 'clothing':
                  filteredDonationDetails.clothing = donationDetails.clothing;
                  break;
              case 'medicalSupplies':
                  filteredDonationDetails.medicalSupplies = donationDetails.medicalSupplies;
                  break;
              case 'shelter':
                  filteredDonationDetails.shelter = donationDetails.shelter;
                  break;
              case 'searchAndRescue':
                  filteredDonationDetails.searchAndRescue = donationDetails.searchAndRescue;
                  break;
              case 'financialAssistance':
                  filteredDonationDetails.financialAssistance = donationDetails.financialAssistance;
                  break;
              case 'counseling':
                  filteredDonationDetails.counseling = donationDetails.counseling;
                  break;
              case 'technicalSupport':
                  filteredDonationDetails.technicalSupport = donationDetails.technicalSupport;
                  break;
          }
      }
  }
        const donationSummary = donationSummaryItems.join(', ') || 'items';

        let donationResult: Awaited<ReturnType<typeof donate>> | null = null;
        let submissionError: Error | null = null;

        try {
            // --- (A) Call Donate Server Action ---
            console.log("Calling donate server action...");
            donationResult = await donate(
                checkedDonationTypesToSend,
                filteredDonationDetails,
                donationDate,
                fetchedOrgData.id,
                selectedAidRequestId // Pass the selected ID
            );

            if (!donationResult?.success || !donationResult.organizationId || !donationResult.donationUID) {
                throw new Error(donationResult?.error || 'Failed to submit donation or get necessary IDs.');
            }
            const orgId = donationResult.organizationId;
            const donationUID = donationResult.donationUID;
            console.log(`Donation successful. Org ID: ${orgId}, Donation UID: ${donationUID}`);
            setStatusMessage('Donation recorded. Processing volunteer notifications...');

            // --- (B) Upload Donation Image ---
            if (donationImage && donationUID) {
                try {
                    console.log("Uploading donation image...");
                    await uploadDonation(donationImage, donationUID);
                    console.log("Donation image uploaded.");
                } catch (imgError) {
                    console.warn("Donation saved, but image upload failed:", imgError);
                    setStatusMessage('Donation recorded, but image upload failed.'); // Update status but continue
                }
            }

            // --- (C) Fetch Volunteers ---
            let volunteers: VolunteerData[] = [];
            try {
                console.log(`Workspaceing volunteers for orgId: ${orgId}`);
                const response = await fetch(`/api/volunteers?orgId=${orgId}`); // Use the API route
                if (!response.ok) {
                    const errorData = await response.text();
                    throw new Error(`Failed to fetch volunteers: ${response.status} ${response.statusText} - ${errorData}`);
                }
                volunteers = (await response.json()) as VolunteerData[];
                console.log(`Workspaceed ${volunteers.length} volunteers with email.`);
            } catch (fetchError) {
                console.error("Could not fetch volunteers:", fetchError);
                setStatusMessage('Donation recorded, but could not fetch volunteers for notification.');
                submissionError = fetchError instanceof Error ? fetchError : new Error(String(fetchError));
                // Continue without sending emails, error will be handled in finally block if needed
            }

            // --- (D) Send EmailJS Notifications to Volunteers ---
            if (volunteers.length > 0) {
                // Only update status if fetch didn't fail
                if (!submissionError) setStatusMessage(`Donation recorded. Notifying ${volunteers.length} volunteers...`);

                let emailSuccessCount = 0;
                const emailFailCount = 0;
                const orgName = fetchedOrgData.name || 'Your Organization'; // Use fetched org name

                for (const volunteer of volunteers) {
                    if (!volunteer.email) {
                        console.warn(`Skipping volunteer ${volunteer.userId} due to missing email.`);
                        continue;
                    };

                    // Construct parameters for the volunteer template
                    const templateParams = {
                        to_email: volunteer.email,
                        volunteer_name: volunteer.firstName || 'Volunteer',
                        org_name: orgName,
                        volunteer_date: donationDate, // The date help is needed
                        donation_summary: donationSummary, // Summary created earlier
                        // Add donationUID or other details if needed by template
                        // donation_id: donationUID
                    };

                    console.log(`DEBUG: Sending volunteer notification to ${volunteer.email} with params:`, JSON.stringify(templateParams, null, 2));

                    try {
                        // Use the VOLUNTEER template ID
                        await emailjs.send(
                            YOUR_SERVICE_ID!,
                            YOUR_VOLUNTEER_TEMPLATE_ID!,
                            templateParams,
                            YOUR_PUBLIC_KEY!
                        );
                        console.log(`EmailJS success sending to volunteer ${volunteer.email}`);
                        emailSuccessCount++;
                    } catch (error: unknown) {
                        console.error(`EmailJS failed sending to volunteer ${volunteer.email}:`, 
                        error instanceof Error ? error.message : String(error));
                        // Maybe collect failed emails to report?
                    }
                } // End volunteer loop

                // Update status only if no prior critical error occurred
                if (!submissionError) {
                    setStatusMessage(
                        `Donation processed! ${emailSuccessCount} volunteers notified.` +
                        (emailFailCount > 0 ? ` (${emailFailCount} failures)` : '')
                    );
                }

            } else if (volunteers.length === 0 && donationResult.success && !submissionError){
                setStatusMessage('Donation processed successfully! No registered volunteers found for this organization.');
            }

            // Final success alert only if no critical error happened
            if (!submissionError) {
                alert(statusMessage || 'Donation processed successfully!');
                // Optionally reset the form here
                // setCheckedDonationTypes({...}); setDonationDetails({...}); etc...
            }


        } catch (error: unknown) {
            // Catch errors from donate() action or initial checks/image upload
            submissionError = error instanceof Error ? error : new Error(String(error));
            console.error("Error during donation submission:", submissionError);
            const errorMessage = submissionError.message || 'An unknown error occurred.';
            setStatusMessage(`Error: ${errorMessage}`);
            alert(`Error: ${errorMessage}`); // Alert user

        } finally {
            // Runs regardless of success/fail in the try block
            setIsSubmitting(false); // Re-enable button
            // Clear status message after a delay
            setTimeout(() => setStatusMessage(''), 10000);
        }
    }; // --- End of handleSubmit ---


    // --- JSX ---
    if (!fetchedOrgData) {
        return <p className="text-center p-4">Loading organization details...</p>;
    }

    return (
        <form onSubmit={handleSubmit} className="h-full mx-4 mt-4">
            {/* Date and Time Display */}
            <div className="mb-4 text-sm text-black">
                <h2>Date: {format(now, 'MMMM d, yyyy')}</h2> {/* Standard format */}
                <h2>Time: {format(now, 'h:mm a')}</h2>
            </div>

            {/* Organization Details */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 md:gap-16 lg:gap-32 justify-between sm:justify-evenly mt-4 mb-6 border-b pb-4">
                <div className="flex flex-col text-start gap-1 sm:gap-2">
                    <div className="flex">
                        <h2 className="font-semibold mr-1 text-sm">Organization Name:</h2>
                        <h2 className="text-sm"> {fetchedOrgData.name ?? 'N/A'}</h2>
                    </div>
                    <div className="flex">
                        <h2 className="font-semibold mr-1 text-sm">Office Address:</h2>
                        <h2 className="text-sm">{fetchedOrgData.location ?? 'N/A'}</h2>
                    </div>
                </div>
                <div className="flex flex-col text-start gap-1 sm:gap-2">
                    <div className="flex">
                        <h2 className="font-semibold mr-1 text-sm">Contact #:</h2>
                        <h2 className="text-sm">{fetchedOrgData.contactNumber ?? 'N/A'}</h2>
                    </div>
                    <div className="flex">
                        <h2 className="font-semibold mr-1 text-sm">Email Address:</h2>
                        <h2 className="text-sm">{fetchedOrgData.email ?? 'N/A'}</h2>
                    </div>
                </div>
            </div>

             {/* Main Container for Form Sections */}
            <div className="pinkContainerBorder space-y-4 mb-6"> {/* Added mb-6 */}

                {/* Display selected aid request if any */}
                {selectedAidRequestId && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <h3 className="text-md font-semibold text-red-700">
                            Donating towards Aid Request ID: {selectedAidRequestId}
                        </h3>
                    </div>
                )}

                {/* Purpose of Donation Checkboxes */}
                <div className="pinkBorder p-4">
                    <h1 className="text-lg font-semibold mb-3">Purpose of Donation: (Select all applicable)</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                        {/* Checkbox for Food */}
                        <div>
                            <label htmlFor="donation_food" className="flex items-center cursor-pointer text-sm">
                                <input type="checkbox" id="donation_food" name="food" checked={checkedDonationTypes.food} onChange={handleDonationCheckboxChange} className="sr-only custom-checkbox-input" />
                                <span className="custom-checkbox-indicator"></span>
                                <span className="ml-2">Food</span>
                            </label>
                        </div>
                        {/* Checkbox for Clothing */}
                        <div>
                            <label htmlFor="donation_clothing" className="flex items-center cursor-pointer text-sm">
                                <input type="checkbox" id="donation_clothing" name="clothing" checked={checkedDonationTypes.clothing} onChange={handleDonationCheckboxChange} className="sr-only custom-checkbox-input" />
                                <span className="custom-checkbox-indicator"></span>
                                <span className="ml-2">Clothing</span>
                            </label>
                        </div>
                         {/* Checkbox for Medical Supplies */}
                         <div>
                             <label htmlFor="donation_medical" className="flex items-center cursor-pointer text-sm">
                                 <input type="checkbox" id="donation_medical" name="medicalSupplies" checked={checkedDonationTypes.medicalSupplies} onChange={handleDonationCheckboxChange} className="sr-only custom-checkbox-input" />
                                 <span className="custom-checkbox-indicator"></span>
                                 <span className="ml-2">Medical Supplies</span>
                             </label>
                         </div>
                         {/* Checkbox for Shelter */}
                         <div>
                             <label htmlFor="donation_shelter" className="flex items-center cursor-pointer text-sm">
                                 <input type="checkbox" id="donation_shelter" name="shelter" checked={checkedDonationTypes.shelter} onChange={handleDonationCheckboxChange} className="sr-only custom-checkbox-input" />
                                 <span className="custom-checkbox-indicator"></span>
                                 <span className="ml-2">Shelter</span>
                             </label>
                         </div>
                         {/* Checkbox for Search and Rescue */}
                         <div>
                             <label htmlFor="donation_search_rescue" className="flex items-center cursor-pointer text-sm">
                                 <input type="checkbox" id="donation_search_rescue" name="searchAndRescue" checked={checkedDonationTypes.searchAndRescue} onChange={handleDonationCheckboxChange} className="sr-only custom-checkbox-input" />
                                 <span className="custom-checkbox-indicator"></span>
                                 <span className="ml-2">Search and Rescue</span>
                             </label>
                         </div>
                         {/* Checkbox for Financial Assistance */}
                          <div>
                             <label htmlFor="donation_financial" className="flex items-center cursor-pointer text-sm">
                                 <input type="checkbox" id="donation_financial" name="financialAssistance" checked={checkedDonationTypes.financialAssistance} onChange={handleDonationCheckboxChange} className="sr-only custom-checkbox-input" />
                                 <span className="custom-checkbox-indicator"></span>
                                 <span className="ml-2">Financial Assistance</span>
                             </label>
                         </div>
                          {/* Checkbox for Counseling */}
                         <div>
                             <label htmlFor="donation_counseling" className="flex items-center cursor-pointer text-sm">
                                 <input type="checkbox" id="donation_counseling" name="counseling" checked={checkedDonationTypes.counseling} onChange={handleDonationCheckboxChange} className="sr-only custom-checkbox-input" />
                                 <span className="custom-checkbox-indicator"></span>
                                 <span className="ml-2">Counseling</span>
                             </label>
                         </div>
                         {/* Checkbox for Technical Support */}
                         <div>
                             <label htmlFor="donation_technical" className="flex items-center cursor-pointer text-sm">
                                 <input type="checkbox" id="donation_technical" name="technicalSupport" checked={checkedDonationTypes.technicalSupport} onChange={handleDonationCheckboxChange} className="sr-only custom-checkbox-input" />
                                 <span className="custom-checkbox-indicator"></span>
                                 <span className="ml-2">Technical/Logistical Support</span>
                             </label>
                         </div>
                        {/* ... other checkboxes ... */}
                    </div>
                </div>

                {/* Detailed Fields for Selected Donation Types */}
                <div className="pinkBorder p-4">
                    <h1 className="text-lg font-semibold mb-3">Donation Details:</h1>
                    <div className="flex flex-col gap-5">
                        {/* Food Details */}
                        {checkedDonationTypes.food && (
                             <div className="aid-detail-section">
                                 <h3 className="font-semibold mb-2">Food Details:</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                     <div>
                                         <label className="block text-sm font-medium mb-1">
                                              Number of Food Packs: (Max: {inventoryLimits.food.maxFoodPacks ?? 'N/A'})
                                         </label>
                                         <input type="number" name="food.foodPacks" value={donationDetails.food?.foodPacks} onChange={handleDonationDetailChange} className="inputBox w-full" placeholder={`e.g., up to ${inventoryLimits.food.maxFoodPacks ?? 'any'}`} min="0" max={inventoryLimits.food.maxFoodPacks}/>
                                     </div>
                                     <div>
                                         <label className="block text-sm font-medium mb-1">Category (Optional):</label>
                                         <select name="food.category" value={donationDetails.food?.category} onChange={handleDonationDetailChange} className="inputBox w-full bg-white">
                                              <option value="">Select Category</option>
                                              <option value="non-perishable">Non-Perishable</option>
                                              <option value="ready-to-eat">Ready-to-Eat</option>
                                         </select>
                                     </div>
                                 </div>
                             </div>
                        )}
                         {/* Clothing Details */}
                        {checkedDonationTypes.clothing && (
                             <div className="aid-detail-section">
                                <h3 className="font-semibold mb-2">Clothing Details (Counts):</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                     <div>
                                         <label className="block text-sm font-medium mb-1">Male: (Max: {inventoryLimits.clothing.maxMale ?? 'N/A'})</label>
                                         <input type="number" name="clothing.male" value={donationDetails.clothing?.male} onChange={handleDonationDetailChange} className="inputBox w-full" placeholder={`e.g., up to ${inventoryLimits.clothing.maxMale ?? 'any'}`} min="0" max={inventoryLimits.clothing.maxMale}/>
                                     </div>
                                     <div>
                                          <label className="block text-sm font-medium mb-1">Female: (Max: {inventoryLimits.clothing.maxFemale ?? 'N/A'})</label>
                                          <input type="number" name="clothing.female" value={donationDetails.clothing?.female} onChange={handleDonationDetailChange} className="inputBox w-full" placeholder={`e.g., up to ${inventoryLimits.clothing.maxFemale ?? 'any'}`} min="0" max={inventoryLimits.clothing.maxFemale}/>
                                     </div>
                                     <div>
                                         <label className="block text-sm font-medium mb-1">Children: (Max: {inventoryLimits.clothing.maxChildren ?? 'N/A'})</label>
                                         <input type="number" name="clothing.children" value={donationDetails.clothing?.children} onChange={handleDonationDetailChange} className="inputBox w-full" placeholder={`e.g., up to ${inventoryLimits.clothing.maxChildren ?? 'any'}`} min="0" max={inventoryLimits.clothing.maxChildren}/>
                                     </div>
                                </div>
                            </div>
                        )}
                         {/* Medical Supplies Details */}
                         {checkedDonationTypes.medicalSupplies && (
                             <div className="aid-detail-section">
                                 <h3 className="font-semibold mb-2">Medical Supplies Details:</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                     <div>
                                         <label className="block text-sm font-medium mb-1">Total Medical Kits: (Max: {inventoryLimits.medicalSupplies.maxMedicalKits ?? 'N/A'})</label>
                                         <input type="number" name="medicalSupplies.kits" value={donationDetails.medicalSupplies?.kits} onChange={handleDonationDetailChange} className="inputBox w-full" placeholder={`e.g., up to ${inventoryLimits.medicalSupplies.maxMedicalKits ?? 'any'}`} min="0" max={inventoryLimits.medicalSupplies.maxMedicalKits}/>
                                     </div>
                                     <div>
                                         <label className="block text-sm font-medium mb-1">Kit Type (Optional):</label>
                                         <select name="medicalSupplies.kitType" value={donationDetails.medicalSupplies?.kitType} onChange={handleDonationDetailChange} className="inputBox w-full bg-white">
                                              <option value="">Select Type</option>
                                              <option value="first-aid">First Aid Kit</option>
                                              <option value="emergency">Emergency Kit</option>
                                              <option value="specialized">Specialized Kit</option>
                                         </select>
                                     </div>
                                 </div>
                            </div>
                         )}
                          {/* Shelter Details */}
                         {checkedDonationTypes.shelter && (
                              <div className="aid-detail-section">
                                 <h3 className="font-semibold mb-2">Shelter Details:</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                     <div>
                                         <label className="block text-sm font-medium mb-1">Number of Tents: (Max: {inventoryLimits.shelter.maxTents ?? 'N/A'})</label>
                                         <input type="number" name="shelter.tents" value={donationDetails.shelter?.tents} onChange={handleDonationDetailChange} className="inputBox w-full" placeholder={`e.g., up to ${inventoryLimits.shelter.maxTents ?? 'any'}`} min="0" max={inventoryLimits.shelter.maxTents}/>
                                     </div>
                                     <div>
                                          <label className="block text-sm font-medium mb-1">Blankets/Sleeping Bags: (Max: {inventoryLimits.shelter.maxBlankets ?? 'N/A'})</label>
                                          <input type="number" name="shelter.blankets" value={donationDetails.shelter?.blankets} onChange={handleDonationDetailChange} className="inputBox w-full" placeholder={`e.g., up to ${inventoryLimits.shelter.maxBlankets ?? 'any'}`} min="0" max={inventoryLimits.shelter.maxBlankets}/>
                                     </div>
                                 </div>
                             </div>
                         )}
                          {/* Search and Rescue Details */}
                          {checkedDonationTypes.searchAndRescue && (
                               <div className="aid-detail-section">
                                 <h3 className="font-semibold mb-2">Search and Rescue Details:</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                     <div>
                                         <label className="block text-sm font-medium mb-1">Number of Rescue Kits: (Max: {inventoryLimits.searchAndRescue.maxRescueKits ?? 'N/A'})</label>
                                         <input type="number" name="searchAndRescue.rescueKits" value={donationDetails.searchAndRescue?.rescueKits} onChange={handleDonationDetailChange} className="inputBox w-full" placeholder={`e.g., up to ${inventoryLimits.searchAndRescue.maxRescueKits ?? 'any'}`} min="0" max={inventoryLimits.searchAndRescue.maxRescueKits}/>
                                     </div>
                                     <div>
                                          <label className="block text-sm font-medium mb-1">Specialized Rescue Personnel: (Max: {inventoryLimits.searchAndRescue.maxRescuePersonnel ?? 'N/A'})</label>
                                          <input type="number" name="searchAndRescue.rescuePersonnel" value={donationDetails.searchAndRescue?.rescuePersonnel} onChange={handleDonationDetailChange} className="inputBox w-full" placeholder={`e.g., up to ${inventoryLimits.searchAndRescue.maxRescuePersonnel ?? 'any'}`} min="0" max={inventoryLimits.searchAndRescue.maxRescuePersonnel}/>
                                     </div>
                                 </div>
                             </div>
                          )}
                           {/* Financial Assistance Details */}
                         {checkedDonationTypes.financialAssistance && (
                              <div className="aid-detail-section">
                                 <h3 className="font-semibold mb-2">Financial Assistance Details:</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                     <div>
                                         <label className="block text-sm font-medium mb-1">Total Funds Available: (Max: {inventoryLimits.financialAssistance.maxFunds?.toFixed(2) ?? 'N/A'})</label>
                                         <input type="number" name="financialAssistance.totalFunds" value={donationDetails.financialAssistance?.totalFunds} onChange={handleDonationDetailChange} className="inputBox w-full" placeholder={`e.g., up to ${inventoryLimits.financialAssistance.maxFunds?.toFixed(2) ?? 'any'}`} min="0" step="0.01" max={inventoryLimits.financialAssistance.maxFunds}/>
                                     </div>
                                     <div>
                                         <label className="block text-sm font-medium mb-1">Currency:</label>
                                         <select name="financialAssistance.currency" value={donationDetails.financialAssistance?.currency} onChange={handleDonationDetailChange} className="inputBox w-full bg-white">
                                              <option value="PHP">PHP</option>
                                              <option value="USD">USD</option>
                                              <option value="EUR">EUR</option>
                                         </select>
                                     </div>
                                 </div>
                             </div>
                         )}
                          {/* Counseling Details */}
                         {checkedDonationTypes.counseling && (
                              <div className="aid-detail-section">
                                 <h3 className="font-semibold mb-2">Counseling Details:</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                     <div>
                                         <label className="block text-sm font-medium mb-1">Number of Counselors Available: (Max: {inventoryLimits.counseling.maxCounselors ?? 'N/A'})</label>
                                         <input type="number" name="counseling.counselors" value={donationDetails.counseling?.counselors} onChange={handleDonationDetailChange} className="inputBox w-full" placeholder={`e.g., up to ${inventoryLimits.counseling.maxCounselors ?? 'any'}`} min="0" max={inventoryLimits.counseling.maxCounselors}/>
                                     </div>
                                     <div>
                                          <label className="block text-sm font-medium mb-1">Total Counseling Hours/Week: (Max: {inventoryLimits.counseling.maxHours ?? 'N/A'})</label>
                                          <input type="number" name="counseling.hours" value={donationDetails.counseling?.hours} onChange={handleDonationDetailChange} className="inputBox w-full" placeholder={`e.g., up to ${inventoryLimits.counseling.maxHours ?? 'any'}`} min="0" max={inventoryLimits.counseling.maxHours}/>
                                     </div>
                                 </div>
                             </div>
                         )}
                         {/* Technical Support Details */}
                          {checkedDonationTypes.technicalSupport && (
                               <div className="aid-detail-section">
                                 <h3 className="font-semibold mb-2">Technical/Logistical Support Details:</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                     <div>
                                         <label className="block text-sm font-medium mb-1">Number of Vehicles: (Max: {inventoryLimits.technicalSupport.maxVehicles ?? 'N/A'})</label>
                                         <input type="number" name="technicalSupport.vehicles" value={donationDetails.technicalSupport?.vehicles} onChange={handleDonationDetailChange} className="inputBox w-full" placeholder={`e.g., up to ${inventoryLimits.technicalSupport.maxVehicles ?? 'any'}`} min="0" max={inventoryLimits.technicalSupport.maxVehicles}/>
                                     </div>
                                     <div>
                                          <label className="block text-sm font-medium mb-1">Communication Equipment Count: (Max: {inventoryLimits.technicalSupport.maxCommunication ?? 'N/A'})</label>
                                          <input type="number" name="technicalSupport.communication" value={donationDetails.technicalSupport?.communication} onChange={handleDonationDetailChange} className="inputBox w-full" placeholder={`e.g., up to ${inventoryLimits.technicalSupport.maxCommunication ?? 'any'}`} min="0" max={inventoryLimits.technicalSupport.maxCommunication}/>
                                     </div>
                                 </div>
                             </div>
                          )}
                        {/* ... Other detail sections ... */}
                    </div>
                </div>

                {/* Donation Photo Upload */}
                <div className="pinkBorder p-4">
                    <label htmlFor="donation_photo_input" className="text-lg font-semibold mb-3 block">Donation Photo (Optional):</label>
                     <label htmlFor="donation_photo_input" className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 min-h-[100px]">
                         {imagePreview ? (
                             <img src={imagePreview} alt="Donation preview" className="h-24 w-auto object-contain"/>
                         ) : (
                             <CiCirclePlus size={40} className="text-gray-400" />
                         )}
                         <input id="donation_photo_input" type="file" accept="image/*" className="sr-only" onChange={handleImageChange}/>
                     </label>
                </div>

                {/* Estimated Drop-off Date */}
                <div className="pinkBorder p-4">
                    <label htmlFor="donation_date" className="text-lg font-semibold mb-3 block">Estimated Drop-off / Volunteer Date:</label>
                    <input id="donation_date" type="date" className="inputBox w-full max-w-xs" value={donationDate} onChange={handleDateChange} required /> {/* Make date required */}
                </div>
            </div> {/* End pinkContainerBorder */}

            {/* Submit Button */}
            <div className="flex justify-center sm:justify-end pt-2 mb-4">
                <button type="submit" className="px-6 py-2 bg-[#B3002A] text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50" disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : 'Submit Donation'}
                </button>
            </div>
             {/* Status Message Display */}
            {statusMessage && <p className="text-center font-semibold my-4">{statusMessage}</p>}
        </form>
    );
};

export default DonationPageForm;