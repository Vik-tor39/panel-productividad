import { z } from 'zod';

export const taskEventSchema = z.object({
  event_type: z.literal('task_completed'),
  task_id: z.string().uuid(),
  user_id: z.string().min(1),
  username: z.string().min(1),
  title: z.string().min(1),
  completed_at: z.string().datetime(),
});
