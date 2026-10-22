// lib/masar/ai.ts
// توليد اللوحات وقوائم التحقق عبر Claude بمخرجات JSON منظّمة

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { HttpError } from '@/lib/masar/http';
import { LABEL_IDS } from '@/lib/masar/shared';

const MODEL = 'claude-opus-5-5';

export const aiEnabled = () => !!process.env.ANTHROPIC_API_KEY;

async function generateJson<T extends z.ZodTypeAny>(
  prompt: string,
  jsonSchema: Record<string, unknown>,
  schema: T,
  effort: 'low' | 'medium',
): Promise<z.infer<T>> {
  if (!aiEnabled()) throw new HttpError(503, 'الذكاء الاصطناعي غير مفعّل على هذا الخادم');
  const client = new Anthropic();
  let response: Anthropic.Beta.BetaMessage;
  try {
    response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      // عند رفض النموذج للطلب يُعاد تلقائيًا على نموذج بديل مناسب
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort, format: { type: 'json_schema', schema: jsonSchema } },
      messages: [{ role: 'user', content: prompt }],
    });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) throw new HttpError(429, 'طلبات كثيرة على الذكاء الاصطناعي. انتظر دقيقة ثم أعد المحاولة.');
    if (error instanceof Anthropic.APIError) {
      console.error('Claude API error:', error.status, error.message);
      throw new HttpError(502, 'تعذّر الاتصال بالذكاء الاصطناعي. أعد المحاولة.');
    }
    throw error;
  }
  if (response.stop_reason === 'refusal') throw new HttpError(422, 'تعذّر إنشاء خطة لهذا الوصف. جرّب صياغة مختلفة.');
  if (response.stop_reason === 'max_tokens') throw new HttpError(502, 'الرد طويل جدًا. اختصر الوصف وأعد المحاولة.');
  const text = response.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('');
  try {
    return schema.parse(JSON.parse(text));
  } catch {
    throw new HttpError(502, 'لم يكن الرد بالشكل المطلوب. أعد المحاولة.');
  }
}

// ==================== توليد لوحة كاملة ====================

const boardSchema = z.object({
  name: z.string().min(1),
  lists: z.array(z.string().min(1)).min(2).max(8),
  cards: z
    .array(
      z.object({
        list: z.number().int(),
        title: z.string().min(1),
        description: z.string(),
        labels: z.array(z.string()),
        dueInDays: z.number().int().nullable(),
        checklist: z.array(z.string()),
      }),
    )
    .max(40),
});

const boardJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'lists', 'cards'],
  properties: {
    name: { type: 'string' },
    lists: { type: 'array', items: { type: 'string' } },
    cards: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['list', 'title', 'description', 'labels', 'dueInDays', 'checklist'],
        properties: {
          list: { type: 'integer' },
          title: { type: 'string' },
          description: { type: 'string' },
          labels: { type: 'array', items: { type: 'string', enum: LABEL_IDS } },
          dueInDays: { anyOf: [{ type: 'integer' }, { type: 'null' }] },
          checklist: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
};

export type GeneratedBoard = z.infer<typeof boardSchema>;

export function generateBoard(description: string, today: string): Promise<GeneratedBoard> {
  const prompt = `أنت مدير مشاريع خبير. صمّم لوحة كانبان عملية باللغة العربية لهذا المشروع:

<project>
${description}
</project>

تاريخ اليوم ${today}.
- name: اسم قصير للوحة.
- lists: من 3 إلى 5 قوائم تمثل مراحل سير العمل بالترتيب.
- cards: من 10 إلى 16 بطاقة، معظمها في القائمة الأولى. list هو رقم القائمة ويبدأ من 0.
- عنوان كل بطاقة فعل واضح ومحدد، والوصف سطر أو سطران.
- labels من 0 إلى 2 لكل بطاقة: g=تصميم، b=تطوير، p=تسويق، o=عاجل، y=بانتظار رد، r=خلل.
- dueInDays عدد الأيام من اليوم حتى الموعد (بين 1 و90)، أو null إن لم يلزم موعد.
- checklist من 0 إلى 5 خطوات قصيرة.`;
  return generateJson(prompt, boardJsonSchema, boardSchema, 'medium');
}

// ==================== تقسيم مهمة إلى خطوات ====================

const checklistSchema = z.object({ steps: z.array(z.string().min(1)).min(1).max(10) });
const checklistJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['steps'],
  properties: { steps: { type: 'array', items: { type: 'string' } } },
};

export async function generateChecklist(title: string, description: string): Promise<string[]> {
  const prompt = `قسّم هذه المهمة إلى 3 إلى 7 خطوات قصيرة وعملية بالعربية، كل خطوة تبدأ بفعل واضح.

<task>
${title}
${description ? `\n${description}` : ''}
</task>`;
  const out = await generateJson(prompt, checklistJsonSchema, checklistSchema, 'low');
  return out.steps.map((s) => s.slice(0, 200));
}
