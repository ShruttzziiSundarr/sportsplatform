import axios from 'axios';

const AI_SERVICE_URL = 'http://localhost:8080';

export const getAiRankings = async (metrics: any, sport: string) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/calculate-score`, {
      speed:    metrics.speed,
      strength: metrics.strength,
      stamina:  metrics.stamina,
      tactical: metrics.tactical,
      sport,
    });
    return response.data;
  } catch (error) {
    console.error('AI Service /calculate-score unavailable:', error);
    return { composite_score: 0, rank_category: 'Pending' };
  }
};

export const generateScoutReport = async (
  profileId: string,
  sport: string,
  metricsHistory: Array<{ speed: number; strength: number; stamina: number; tactical: number }>,
): Promise<{ scout_report: string; composite_score: number; improvement_velocity: number }> => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/generate-scout-report`, {
      profile_id:      profileId,
      sport,
      metrics_history: metricsHistory,
    });
    return response.data;
  } catch (error) {
    console.error('AI Service /generate-scout-report unavailable:', error);
    return {
      scout_report:         'Scout analysis pending — AI service temporarily unavailable.',
      composite_score:      0,
      improvement_velocity: 0,
    };
  }
};