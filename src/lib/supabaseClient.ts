import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { User, Payment, Withdrawal, AppNotification } from "../types";

let supabaseInstance: SupabaseClient | null = null;

/**
 * Lazily gets or initializes the Supabase client.
 * Returns null if the required environment variables are not configured.
 */
export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
  const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

  if (supabaseUrl && supabaseAnonKey && supabaseUrl !== "placeholder" && supabaseAnonKey !== "placeholder") {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
      console.log("Supabase Client initialized successfully.");
      return supabaseInstance;
    } catch (err) {
      console.error("Failed to initialize Supabase client: ", err);
      return null;
    }
  }

  return null;
}

/**
 * Checks if Supabase connection credentials have been supplied inside environment parameters.
 */
export function isSupabaseConfigured(): boolean {
  return getSupabase() !== null;
}

// Helper: Upsert utility to make manual table integrations effortless
async function safeUpsert(tableName: string, record: any) {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb.from(tableName).upsert(record);
    if (error) {
      console.warn(`Supabase upsert warning on "${tableName}":`, error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn(`Supabase upsert connection error on "${tableName}":`, err);
    return null;
  }
}

/**
 * Synchronizes user profile modifications asynchronously to the Supabase Cloud.
 */
export async function syncUserToSupabase(user: User): Promise<void> {
  await safeUpsert("apc_users", {
    id: user.id,
    full_name: user.fullName,
    dob: user.dob,
    age: user.age,
    phone: user.phone,
    email: user.email,
    state: user.state,
    password: user.password || "",
    grant_amount: user.grantAmount,
    membership_fee: user.membershipFee,
    membership_status: user.membershipStatus,
    membership_id: user.membershipId || null,
    withdrawal_status: user.withdrawalStatus,
    bank_name: user.bankName || null,
    account_number: user.accountNumber || null,
    account_name: user.accountName || null,
    referral_code: user.referralCode,
    referred_by: user.referredBy || null,
    referrals_count: user.referralsCount,
    nin: user.nin || null,
    nin_verified: user.ninVerified || false,
    face_verified: user.faceVerified || false,
    face_verification_image: user.faceVerificationImage || null,
    face_verification_score: user.faceVerificationScore || null,
    created_at: user.createdAt
  });
}

/**
 * Synchronizes a processed fee payment to Supabase Cloud.
 */
export async function syncPaymentToSupabase(p: Payment): Promise<void> {
  await safeUpsert("apc_payments", {
    id: p.id,
    user_id: p.userId,
    user_full_name: p.userFullName,
    amount: p.amount,
    payment_type: p.paymentType,
    reference: p.reference,
    status: p.status,
    created_at: p.createdAt
  });
}

/**
 * Synchronizes a payout withdrawal request to Supabase Cloud.
 */
export async function syncWithdrawalToSupabase(w: Withdrawal): Promise<void> {
  await safeUpsert("apc_withdrawals", {
    id: w.id,
    user_id: w.userId,
    user_full_name: w.userFullName,
    bank_name: w.bankName,
    account_number: w.accountNumber,
    account_name: w.accountName,
    amount: w.amount,
    status: w.status,
    created_at: w.createdAt
  });
}

/**
 * Synchronizes an in-app system log or notification to Supabase Cloud.
 */
export async function syncNotificationToSupabase(n: AppNotification): Promise<void> {
  await safeUpsert("apc_notifications", {
    id: n.id,
    user_id: n.userId,
    title: n.title,
    message: n.message,
    role: n.role,
    read: n.read,
    created_at: n.createdAt
  });
}

/**
 * Dynamically queries available records from Supabase tables to sync down onto local caching.
 */
export async function fetchAllUsersFromSupabase(): Promise<User[] | null> {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb.from("apc_users").select("*");
    if (error) {
      console.warn("Could not query apc_users table:", error.message);
      return null;
    }
    return data.map((u: any) => ({
      id: u.id,
      fullName: u.full_name,
      dob: u.dob,
      age: u.age,
      phone: u.phone,
      email: u.email,
      state: u.state,
      password: u.password,
      grantAmount: u.grant_amount,
      membershipFee: u.membership_fee,
      membershipStatus: u.membership_status,
      membershipId: u.membership_id,
      withdrawalStatus: u.withdrawal_status,
      bankName: u.bank_name,
      accountNumber: u.account_number,
      accountName: u.account_name,
      referralCode: u.referral_code,
      referredBy: u.referred_by,
      referralsCount: u.referrals_count,
      nin: u.nin,
      ninVerified: u.nin_verified,
      faceVerified: u.face_verified,
      faceVerificationImage: u.face_verification_image,
      faceVerificationScore: u.face_verification_score,
      createdAt: u.created_at
    }));
  } catch (err) {
    console.warn("Supabase fetch all users failed connection:", err);
    return null;
  }
}
