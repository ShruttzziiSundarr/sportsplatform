import { Request, Response } from 'express';
import { getProfileById, getProfiles } from '../repositories/profile.repository';
import { createProfileService } from '../services/profile.service';

export const createProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const newProfile = await createProfileService(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Profile created. Scout report generating in background.',
      data: newProfile,
    });
  } catch (error: any) {
    console.error('Error creating profile:', error.message);
    res.status(500).json({ status: 'error', message: 'Internal server error while creating profile' });
  }
};

export const listProfiles = async (_req: Request, res: Response): Promise<void> => {
  try {
    const profiles = await getProfiles();
    res.status(200).json({ status: 'success', data: profiles });
  } catch (error: any) {
    console.error('Error fetching profiles:', error.message);
    res.status(500).json({ status: 'error', message: 'Internal server error while fetching profiles' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = await getProfileById(req.params.id as string);
    res.status(200).json({ status: 'success', data: profile });
  } catch (error: any) {
    console.error('Error fetching profile:', error.message);
    res.status(404).json({ status: 'error', message: 'Profile not found' });
  }
};