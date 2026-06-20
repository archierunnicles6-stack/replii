const ADMIN_EMAIL = "aarunnicles@gmail.com";

export function isAdminUser(email: string | null | undefined): boolean {
  if (!email?.trim()) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}
