import express, { Request, Response } from 'express';
import { z } from 'zod';
import { runModel } from '../../services/modelService';

const router = express.Router();

const inferSchema = z.object({
  model_id: z.string(),
  input: z.any(),
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = inferSchema.parse(req.body);
    const { model_id, input } = validatedData;
    
    const prediction = await runModel(model_id, input);
    
    res.status(200).json({
      success: true,
      prediction,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: error.issues,
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
});

export default router;