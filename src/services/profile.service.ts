import { insertProfile } from '../repositories/profile.repository';
import { CreateProfileInput } from '../types/profile/schema';

export const createProfileService = async (profileData: CreateProfileInput) => {
  try {
    // Here is where business logic lives. 
    // Example for later: check if user already has a profile, calculate initial stats, etc.
    
    // Call the database layer
    const newProfile = await insertProfile(profileData);
    return newProfile;
  } catch (error: any) {
    throw new Error(`Failed to create profile: ${error.message}`);
  }
};