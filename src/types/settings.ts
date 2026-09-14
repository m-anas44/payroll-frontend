export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface SystemSettings {
  companyName: string;
  currencySymbol: string;
  currencyCode: string;
}
