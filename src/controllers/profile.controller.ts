import { Request, Response } from 'express';
import { createProfileService } from '../services/profile.service';

export const createProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // The request body is already perfectly validated by our Zod middleware!
    const profileData = req.body;
    
    // Pass it to the Service layer
    const newProfile = await createProfileService(profileData);

    // Send the success response
    res.status(201).json({
      status: 'success',
      message: 'Profile created successfully',
      data: newProfile
    });
  } catch (error: any) {
    console.error('Error creating profile:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while creating profile'
    });
  }
};