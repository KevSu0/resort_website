const getEnvValue = (key: string, defaultValue?: string) => {
  const metaValue = typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env as Record<string, string | undefined>)[key]
    : undefined;

  const nodeValue = typeof process !== 'undefined'
    ? process.env?.[key]
    : undefined;

  const value = metaValue ?? nodeValue ?? defaultValue;

  if (value === undefined) {
    throw new Error(`Key ${key} is undefined`);
  }

  return value;
};

export const config = {
  VITE_WHATSAPP_CONTACT_NUMBER: getEnvValue('VITE_WHATSAPP_CONTACT_NUMBER', '+919876543210'),
  VITE_SITE_EMAIL_FROM: getEnvValue('VITE_SITE_EMAIL_FROM', 'info@wayanadresorts.com'),
};
