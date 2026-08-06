export function isValidCNIC(cnic: string): boolean {
  // Format: 12345-1234567-1 or 13 digits
  const cnicRegex = /^\d{5}-\d{7}-\d{1}$|^\d{13}$/;
  return cnicRegex.test(cnic.trim());
}

export function formatCNICInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+92|0)?3\d{9}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ""));
}
