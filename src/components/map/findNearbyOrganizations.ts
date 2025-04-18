"use server";

import { db } from "@/lib/Firebase-Admin";
import { GeoPoint } from "firebase-admin/firestore";
import * as geofire from 'geofire-common';

interface Organization {
  userId: string;
  name: string;
  email: string;
  coordinates: GeoPoint;
  // Add other fields as needed
}

export async function findNearbyOrganizations(
  latitude: number,
  longitude: number,
  radiusInKm: number = 30
): Promise<Organization[]> {
  try {
    // Calculate the bounding box for the search area
    const bounds = geofire.geohashQueryBounds(
      [latitude, longitude], 
      radiusInKm * 1000 // Convert km to meters
    );
    
    const organizations: Organization[] = [];
    
    // Execute each query
    const promises = bounds.map(async ([startHash, endHash]) => {
      const orgsRef = db.collection('organizations');
      
      // Get organizations in the bounding box
      const snapshot = await orgsRef
        .orderBy('geohash')
        .startAt(startHash)
        .endAt(endHash)
        .get();
        
      // Filter organizations within the exact radius
      snapshot.docs.forEach(doc => {
        const orgData = doc.data() as Organization;
        
        if (orgData.coordinates) {
          const distanceInKm = geofire.distanceBetween(
            [latitude, longitude],
            [orgData.coordinates.latitude, orgData.coordinates.longitude]
          ) / 1000; // Convert meters to km
          
          if (distanceInKm <= radiusInKm) {
            organizations.push(orgData);
          }
        }
      });
    });
    
    await Promise.all(promises);
    return organizations;
  } catch (error) {
    console.error("Error finding nearby organizations:", error);
    throw error;
  }
}