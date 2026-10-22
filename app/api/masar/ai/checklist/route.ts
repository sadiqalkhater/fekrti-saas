// app/api/masar/ai/checklist/route.ts
// اقتراح خطوات لمهمة بالذكاء الاصطناعي (لا يحفظ؛ الواجهة تضيفها للبطاقة)

import { z } from 'zod';
import { handle, ok, parseBody, requireUser } from '@/lib/masar/http';
import { requireCard } from '@/lib/masar/service';
import { generateChecklist } from '@/lib/masar/ai';

export const maxDuration = 60;
const schema = z.object({ cardId: z.string().min(1) });

export const POST = handle(async (request: Request) => {
  const me = await requireUser();
  const body = await parseBody(request, schema);
  const { card } = await requireCard(me.id, body.cardId, 'MEMBER');
  const steps = await generateChecklist(card.title, card.description.slice(0, 1500));
  return ok({ steps });
});
