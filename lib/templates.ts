import { getItem, setItem } from "./storage";

const TEMPLATES_KEY = "cobroya_templates";

export interface PaymentTemplate {
  id: string;
  name: string;
  amount: number;
  currency: string;
  description?: string;
  icon?: string;
  createdAt: string;
}

export async function getTemplates(): Promise<PaymentTemplate[]> {
  const raw = await getItem(TEMPLATES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveTemplate(template: Omit<PaymentTemplate, "id" | "createdAt">): Promise<PaymentTemplate> {
  const templates = await getTemplates();
  const newTemplate: PaymentTemplate = {
    ...template,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    createdAt: new Date().toISOString(),
  };
  templates.push(newTemplate);
  await setItem(TEMPLATES_KEY, JSON.stringify(templates));
  return newTemplate;
}

export async function deleteTemplate(id: string): Promise<void> {
  const templates = await getTemplates();
  const filtered = templates.filter((t) => t.id !== id);
  await setItem(TEMPLATES_KEY, JSON.stringify(filtered));
}

export async function updateTemplate(id: string, updates: Partial<PaymentTemplate>): Promise<void> {
  const templates = await getTemplates();
  const index = templates.findIndex((t) => t.id === id);
  if (index === -1) return;
  templates[index] = { ...templates[index], ...updates };
  await setItem(TEMPLATES_KEY, JSON.stringify(templates));
}
