const required = (key: string, defaultValue: string | undefined = undefined) => {
  const value = (import.meta.env && import.meta.env[key]) || process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Key ${key} is undefined`);
  }
  return value;
};

export const config = {
  VITE_WHATSAPP_CONTACT_NUMBER: required('VITE_WHATSAPP_CONTACT_NUMBER', '+919876543210'),
  VITE_SITE_EMAIL_FROM: required('VITE_SITE_EMAIL_FROM', 'info@wayanadresorts.com'),
};