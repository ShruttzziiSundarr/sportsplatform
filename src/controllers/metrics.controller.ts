import { Request, Response } from 'express';
import { addMetricsService } from '../services/metrics.service';

export const addMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const profileId = req.params.id as string;
    const newRecord = await addMetricsService(profileId, req.body);
    res.status(201).json({
      status: 'success',
      message: 'Metrics recorded. Scout report refreshing in background.',
      data: newRecord,
    });
  } catch (error: any) {
    console.error('Error adding metrics:', error.message);
    const status = error.message.includes('not found') ? 404 : 500;
    res.status(status).json({ status: 'error', message: error.message });
  }
};
