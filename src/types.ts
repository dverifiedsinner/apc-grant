export interface User {
  id: string;
  fullName: string;
  dob: string;
  age: number;
  phone: string;
  email: string;
  state: string;
  password?: string; // Opt in storage, keep simple
  grantAmount: number;
  membershipFee: number;
  membershipStatus: "unpaid" | "pending" | "paid";
  membershipId?: string; // QR code validation code e.g. APC-NG-XXXXXX
  withdrawalStatus: "not_requested" | "pending" | "approved" | "rejected";
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  referralCode: string;
  referredBy?: string;
  referralsCount: number;
  nin?: string;
  ninVerified?: boolean;
  faceVerified?: boolean;
  faceVerificationImage?: string;
  faceVerificationScore?: number;
  lastName?: string;
  otherNames?: string;
  gender?: string;
  lga?: string;
  homeAddress?: string;
  highestQualification?: string;
  yearAcquired?: string;
  schoolName?: string;
  idType?: string;
  idNumber?: string;
  passportPhoto?: string;
  ninDoc?: string;
  certDoc?: string;
  transferAccountName?: string;
  transferReceiptImage?: string;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  userFullName: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  userFullName: string;
  amount: number;
  paymentType: "card" | "bank_transfer" | "ussd" | "wallet";
  reference: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string; // "all" for global or specific userId
  title: string;
  message: string;
  role: "system" | "grant" | "payment" | "withdrawal";
  read: boolean;
  createdAt: string;
}

export interface GrantConfig {
  id: string;
  minAge: number;
  maxAge: number;
  grantAmount: number;
  membershipFee: number;
}
