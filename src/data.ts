import { User, Withdrawal, Payment, AppNotification, GrantConfig } from "./types";

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT (Abuja)", "Gombe", "Imo", 
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", 
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

export const NIGERIAN_BANKS = [
  "Access Bank",
  "First Bank of Nigeria",
  "Guaranty Trust Bank (GTB)",
  "United Bank for Africa (UBA)",
  "Zenith Bank",
  "Kuda Bank",
  "OPay (Digital)",
  "Moniepoint Bank",
  "Wema Bank / ALAT",
  "Fidelity Bank",
  "Stanbic IBTC Bank",
  "Sterling Bank",
  "Providus Bank",
  "Union Bank of Nigeria"
];

export const DEFAULT_GRANT_CONFIGS: GrantConfig[] = [
  { id: "1", minAge: 17, maxAge: 20, grantAmount: 180000, membershipFee: 10000 },
  { id: "2", minAge: 21, maxAge: 25, grantAmount: 250000, membershipFee: 15000 },
  { id: "3", minAge: 26, maxAge: 30, grantAmount: 350000, membershipFee: 20000 },
  { id: "4", minAge: 31, maxAge: 40, grantAmount: 500000, membershipFee: 30000 },
  { id: "5", minAge: 41, maxAge: 120, grantAmount: 750000, membershipFee: 50000 },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is the APC Grants Platform?",
    answer: "APC Grants is an empowerment initiative aimed at providing direct financial support to eligible Nigerian citizens aged 17 and above. The grant scale increases proportionally with age to meet the unique socio-economic requirements of varying demographic cohorts."
  },
  {
    question: "How is my eligible grant amount calculated?",
    answer: "Your grant is calculated automatically based on your date of birth at registration. The brackets are: 17-20 years (₦180,000), 21-25 years (₦250,000), 26-30 years (₦350,000), 31-40 years (₦500,000), and 41+ years (₦750,000)."
  },
  {
    question: "Why do I need to pay an APC Membership ID Fee?",
    answer: "The APC Membership ID card is required to uniquely verify your identity, combat fraudulent applications, and enroll you as an active member of the empowerment network. This ensures funds are allocated exclusively to real, validated citizens."
  },
  {
    question: "Are the payments processed securely?",
    answer: "Absolutely. Our platform simulates standard Nigerian payment gateways like Paystack and Flutterwave, offering multiple encrypted payment channels including Credit Cards, Bank Transfers, USSD Codes, and Mobile Wallets."
  },
  {
    question: "How long does it take for withdrawals to reach my bank account?",
    answer: "Once your APC Membership ID is verified and your withdrawal request is submitted with valid bank details, the platform administrators review and approve the payout. This review is typically completed within 12 to 24 hours, after which bank transfers are credited immediately."
  },
  {
    question: "Can I refer other applicants to earn bonuses?",
    answer: "Yes, you can! Every registered user has a unique referral code. When a citizen registers with your code and completes their membership verification, you receive an automated referral milestone bonus, helping you level up in our citizen rankings."
  }
];

export interface TestimonialItem {
  name: string;
  age: number;
  state: string;
  amount: string;
  avatar: string;
  occupation: string;
  text: string;
}

export const TESTIMONIALS: TestimonialItem[] = [
  {
    name: "Aisha Gidado",
    age: 24,
    state: "Kano State",
    amount: "₦250,000",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    occupation: "Small Business Owner",
    text: "This grant has literally transformed my catering business. I registered, got approved for ₦250,000 based on my age, paid the ₦15,000 APC Membership card, and within 12 hours my bank was credited. God bless the APC Grants initiative!"
  },
  {
    name: "Emeka Okafor",
    age: 18,
    state: "Enugu State",
    amount: "₦180,000",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    occupation: "Undergraduate Student",
    text: "As an 18-year-old student, buying texbooks and laptop accessories has been very stressful. The ₦180,000 grant arrived just in time. The APC ID verification fee was ₦10,000 which I paid via debit card, and my withdrawal approved shortly after."
  },
  {
    name: "Oluwaseun Adebayo",
    age: 38,
    state: "Lagos State",
    amount: "₦500,000",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    occupation: "Agribusiness Entrepreneur",
    text: "The registration took less than 2 minutes. My age group qualified for ₦500,000. I was highly skeptical about the APC card fee, but I decided to give it a try. To my absolute amazement, the support was efficient, and my payout arrived. Fully secure!"
  },
  {
    name: "Fatima Umar",
    age: 42,
    state: "Kaduna State",
    amount: "₦750,000",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
    occupation: "Fashion Designer",
    text: "I am extremely grateful. The ₦750,000 grant allowed me to lease a brand new industrial sewing machine and stock fabrics for the peak season. The process was direct and very transparent."
  }
];

export interface LiveFeedItem {
  id: string;
  name: string;
  state: string;
  amount: string;
  time: string;
}

export const LIVE_FEED_INITIAL: LiveFeedItem[] = [
  { id: "lf1", name: "Ibrahim K.", state: "Sokoto", amount: "₦350,000", time: "2 minutes ago" },
  { id: "lf2", name: "Chisom O.", state: "Anambra", amount: "₦250,000", time: "5 minutes ago" },
  { id: "lf3", name: "Blessing E.", state: "Rivers", amount: "₦500,000", time: "12 minutes ago" },
  { id: "lf4", name: "Abiodun A.", state: "Oyo", amount: "₦750,000", time: "25 minutes ago" },
  { id: "lf5", name: "Musa Y.", state: "Borno", amount: "₦180,000", time: "34 minutes ago" },
  { id: "lf6", name: "Uche C.", state: "Abia", amount: "₦350,000", time: "45 minutes ago" }
];

export const SEED_USERS: User[] = [
  {
    id: "user-1",
    fullName: "Aisha Gidado",
    dob: "2002-03-12",
    age: 24,
    phone: "08034567890",
    email: "aisha@gmail.com",
    state: "Kano",
    grantAmount: 250000,
    membershipFee: 15000,
    membershipStatus: "paid",
    membershipId: "APC-NG-482910",
    withdrawalStatus: "approved",
    bankName: "Zenith Bank",
    accountNumber: "2209187384",
    accountName: "Aisha Gidado",
    referralCode: "AISHA34",
    referredBy: undefined,
    referralsCount: 4,
    createdAt: "2026-05-18T10:24:00Z"
  },
  {
    id: "user-2",
    fullName: "Emeka Okafor",
    dob: "2008-01-15",
    age: 18,
    phone: "08145678901",
    email: "emeka@gmail.com",
    state: "Enugu",
    grantAmount: 180000,
    membershipFee: 10000,
    membershipStatus: "paid",
    membershipId: "APC-NG-192804",
    withdrawalStatus: "approved",
    bankName: "Guaranty Trust Bank (GTB)",
    accountNumber: "0109283746",
    accountName: "Emeka Okafor",
    referralCode: "EMEKA99",
    referredBy: "AISHA34",
    referralsCount: 1,
    createdAt: "2026-05-18T14:15:00Z"
  },
  {
    id: "user-3",
    fullName: "Oluwaseun Adebayo",
    dob: "1988-06-25",
    age: 38,
    phone: "09056789012",
    email: "seun@gmail.com",
    state: "Lagos",
    grantAmount: 500000,
    membershipFee: 30000,
    membershipStatus: "paid",
    membershipId: "APC-NG-774920",
    withdrawalStatus: "approved",
    bankName: "United Bank for Africa (UBA)",
    accountNumber: "2091827364",
    accountName: "Oluwaseun Adebayo",
    referralCode: "SEUN77",
    referredBy: undefined,
    referralsCount: 0,
    createdAt: "2026-05-19T08:11:00Z"
  },
  {
    id: "user-4",
    fullName: "Bello Hassan",
    dob: "1997-11-04",
    age: 28,
    phone: "07067890123",
    email: "bello@gmail.com",
    state: "Kaduna",
    grantAmount: 350000,
    membershipFee: 20000,
    membershipStatus: "pending",
    withdrawalStatus: "not_requested",
    referralCode: "BELLO12",
    referralsCount: 0,
    createdAt: "2026-05-20T09:12:00Z"
  },
  {
    id: "user-5",
    fullName: "Chioma Nwosu",
    dob: "1993-04-18",
    age: 33,
    phone: "08089012345",
    email: "chioma@gmail.com",
    state: "Rivers",
    grantAmount: 500000,
    membershipFee: 30000,
    membershipStatus: "paid",
    membershipId: "APC-NG-382910",
    withdrawalStatus: "pending",
    bankName: "Kuda Bank",
    accountNumber: "2009182736",
    accountName: "Chioma Jessica Nwosu",
    referralCode: "CHIOMA3",
    referredBy: "AISHA34",
    referralsCount: 2,
    createdAt: "2026-05-20T11:45:00Z"
  },
  {
    id: "user-6",
    fullName: "Daniel Alabi",
    dob: "2006-08-30",
    age: 19,
    phone: "09012345678",
    email: "daniel@gmail.com",
    state: "Oyo",
    grantAmount: 180000,
    membershipFee: 10000,
    membershipStatus: "unpaid",
    withdrawalStatus: "not_requested",
    referralCode: "DANNY99",
    referralsCount: 0,
    createdAt: "2026-05-20T15:30:00Z"
  }
];

export const SEED_WITHDRAWALS: Withdrawal[] = [
  {
    id: "w-1",
    userId: "user-1",
    userFullName: "Aisha Gidado",
    bankName: "Zenith Bank",
    accountNumber: "2209187384",
    accountName: "Aisha Gidado",
    amount: 250000,
    status: "approved",
    createdAt: "2026-05-18T11:30:00Z"
  },
  {
    id: "w-2",
    userId: "user-2",
    userFullName: "Emeka Okafor",
    bankName: "Guaranty Trust Bank (GTB)",
    accountNumber: "0109283746",
    accountName: "Emeka Okafor",
    amount: 180000,
    status: "approved",
    createdAt: "2026-05-18T16:00:00Z"
  },
  {
    id: "w-3",
    userId: "user-3",
    userFullName: "Oluwaseun Adebayo",
    bankName: "United Bank for Africa (UBA)",
    accountNumber: "2091827364",
    accountName: "Oluwaseun Adebayo",
    amount: 500000,
    status: "approved",
    createdAt: "2026-05-19T09:30:00Z"
  },
  {
    id: "w-4",
    userId: "user-5",
    userFullName: "Chioma Nwosu",
    bankName: "Kuda Bank",
    accountNumber: "2009182736",
    accountName: "Chioma Jessica Nwosu",
    amount: 500000,
    status: "pending",
    createdAt: "2026-05-20T12:00:00Z"
  }
];

export const SEED_PAYMENTS: Payment[] = [
  {
    id: "p-1",
    userId: "user-1",
    userFullName: "Aisha Gidado",
    amount: 15000,
    paymentType: "card",
    reference: "REF_APC_48290123",
    status: "completed",
    createdAt: "2026-05-18T10:45:00Z"
  },
  {
    id: "p-2",
    userId: "user-2",
    userFullName: "Emeka Okafor",
    amount: 10000,
    paymentType: "ussd",
    reference: "REF_APC_38194481",
    status: "completed",
    createdAt: "2026-05-18T15:10:00Z"
  },
  {
    id: "p-3",
    userId: "user-3",
    userFullName: "Oluwaseun Adebayo",
    amount: 30000,
    paymentType: "bank_transfer",
    reference: "REF_APC_99281734",
    status: "completed",
    createdAt: "2026-05-19T08:45:00Z"
  },
  {
    id: "p-4",
    userId: "user-5",
    userFullName: "Chioma Nwosu",
    amount: 30000,
    paymentType: "card",
    reference: "REF_APC_27184918",
    status: "completed",
    createdAt: "2026-05-20T11:55:00Z"
  }
];

export const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n-global-1",
    userId: "all",
    title: "Second Phase Grant Disbursements Active",
    message: "Attention Citizens! The APC Central Grants Disbursement Committee has approved a second allocation tier for all states. Ensure you register and complete membership card audits to receive quick bank settlement.",
    role: "system",
    read: false,
    createdAt: "2026-05-17T09:00:00Z"
  }
];
