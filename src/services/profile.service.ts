import { insertProfile, updateScoutSummary } from '../repositories/profile.repository';
import { CreateProfileInput } from '../types/profile/schema';
import { generateScoutReport, getAiRankings } from './ai.service';

export const createProfileService = async (profileData: CreateProfileInput) => {
  try {
    // 1. Baseline metrics for a brand-new profile
    const initialMetrics = { speed: 50, strength: 50, stamina: 50, tactical: 50 };

    // 2. Get initial composite score with sport-specific weights
    const aiResults = await getAiRankings(initialMetrics, profileData.sport);

    // 3. Insert profile with initial visibility score
    const newProfile = await insertProfile({
      ...profileData,
      visibility_score: aiResults.composite_score ?? 0,
    });

    // 4. Asynchronously generate full MiniGPT scout report and persist to Supabase.
    //    The API response is returned immediately; scout_summary updates in the background.
    const profileId = (newProfile as any).id as string;
    generateScoutReport(profileId, profileData.sport, [initialMetrics])
      .then(async (reportData) => {
        await updateScoutSummary(
          profileId,
          reportData.scout_report,
          reportData.composite_score,
        );
      })
      .catch((err) =>
        console.error(`Scout report generation failed for profile ${profileId}:`, err),
      );

    return newProfile;
  } catch (error: any) {
    throw new Error(`Failed to create AI-analyzed profile: ${error.message}`);
  }
};