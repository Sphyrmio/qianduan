const SLOT_PATTERN = /{{\s*([\w-]+)\s*}}/g

export function renderTemplate(template: string, slots: Record<string, string>): string {
  return template.replace(SLOT_PATTERN, (_, key: string) => slots[key] ?? '')
}
