import { supabase } from '../config/supabase';
// Note: Adjust the import path below if your schema file is directly in types instead of types/profile
import { CreateProfileInput } from '../types/profile/schema'; 

export const insertProfile = async (profileData: CreateProfileInput) => {
  // We use the Supabase client to insert the validated data into the 'profiles' table
  const { data, error } = await supabase
    .from('profiles')
    .insert([profileData])
    .select()
    .single(); // .single() ensures we return an object, not an array

  // If Supabase throws a database error, we catch it and throw it up the chain
  if (error) {
    throw new Error(error.message);
  }

  return data;
};