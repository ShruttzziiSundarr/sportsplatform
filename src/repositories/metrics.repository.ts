import { supabase } from '../config/supabase';
import { AddMetricsInput } from '../types/profile/schema';

export const insertMetrics = async (profileId: string, metricsData: AddMetricsInput) => {
  const { data, error } = await supabase
    .from('metrics')
    .insert([{ profile_id: profileId, ...metricsData }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const getMetricsByProfileId = async (profileId: string) => {
  const { data, error } = await supabase
    .from('metrics')
    .select('*')
    .eq('profile_id', profileId)
    .order('recorded_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
};
