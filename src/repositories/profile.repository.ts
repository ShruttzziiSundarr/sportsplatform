import { supabase } from '../config/supabase';
import { CreateProfileInput } from '../types/profile/schema';

export const insertProfile = async (
  profileData: CreateProfileInput & { visibility_score?: number },
) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([profileData])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateScoutSummary = async (
  profileId: string,
  scoutSummary: string,
  visibilityScore: number,
): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ scout_summary: scoutSummary, visibility_score: visibilityScore })
    .eq('id', profileId);

  if (error) throw new Error(error.message);
};

export const getProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('visibility_score', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const getProfileById = async (profileId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};