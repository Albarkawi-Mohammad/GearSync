export function sanitizeString(val: string): string {
  if (!val) return '';
  // Strip out HTML tags completely using a regex to neutralize standard XSS vectors
  return val.replace(/<[^>]*>?/gm, '');
}

export function sanitizeProfile(profile: any): any {
  if (!profile) return profile;
  
  const sanitized = { ...profile };
  
  if (typeof sanitized.name === 'string') {
    sanitized.name = sanitizeString(sanitized.name);
  }
  if (typeof sanitized.username === 'string') {
    sanitized.username = sanitizeString(sanitized.username);
  }
  if (typeof sanitized.proBio === 'string') {
    sanitized.proBio = sanitizeString(sanitized.proBio);
  }
  
  if (Array.isArray(sanitized.tags)) {
    sanitized.tags = sanitized.tags.map((t: any) => 
      typeof t === 'string' ? sanitizeString(t) : t
    );
  }
  
  if (sanitized.settings && typeof sanitized.settings === 'object') {
    const sanitizedSettings: Record<string, any> = {};
    for (const [key, value] of Object.entries(sanitized.settings)) {
      if (typeof value === 'string') {
        sanitizedSettings[key] = sanitizeString(value);
      } else {
        sanitizedSettings[key] = value;
      }
    }
    sanitized.settings = sanitizedSettings;
  }
  
  return sanitized;
}
