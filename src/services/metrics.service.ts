import { getMetricsByProfileId, insertMetrics } from '../repositories/metrics.repository';
import { getProfileById, updateScoutSummary } from '../repositories/profile.repository';
import { AddMetricsInput } from '../types/profile/schema';
import { generateScoutReport } from './ai.service';

export const addMetricsService = async (profileId: string, metricsData: AddMetricsInput) => {
  // 1. Verify the profile exists
  const profile = await getProfileById(profileId);
  if (!profile) throw new Error(`Profile ${profileId} not found`);

  // 2. Persist the new metrics record
  const newRecord = await insertMetrics(profileId, metricsData);

  // 3. Fetch full metrics history for this profile
  const history = await getMetricsByProfileId(profileId);

  // 4. Re-generate the scout report using the full history (all sessions)
  //    This is the core integration: Node.js → Python transformer pipeline.
  generateScoutReport(profileId, profile.sport as string, history)
    .then(async (reportData) => {
      await updateScoutSummary(
        profileId,
        reportData.scout_report,
        reportData.composite_score,
      );
    })
    .catch((err) =>
      console.error(`Scout report refresh failed for profile ${profileId}:`, err),
    );

  return newRecord;
};
