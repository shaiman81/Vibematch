export interface Member {
  id: string;
  name: string;
  age: number | string;
  interests: string[];
  registeredAt: string;
  status: 'New' | 'Connected' | 'Pending';
  mode?: 'standard' | 'very_romantic' | 'friendly';
  note?: string;
}

export const VERY_ROMANTIC_TOPIC = 'Very Romantic & Special Baatein';

export interface SocialLinksConfig {
  instagramUsername: string;
  telegramUsername: string;
  snapchatUsername: string;
  whatsappNumber: string;
  whatsappMessage: string;
  instagramEnabled: boolean;
  telegramEnabled: boolean;
  snapchatEnabled: boolean;
  whatsappEnabled: boolean;
}

export interface RomanticPageConfig {
  // Option name and desc shown on profile form
  optionTitle: string;
  optionBadge: string;
  optionDescription: string;
  
  // Content on the screen
  pageTitle: string;
  pageSubtitle: string;
  bannerMessage: string;
  quoteText: string;
  
  // Social links and features
  socialLinks: SocialLinksConfig;
}

export interface FriendlyPageConfig {
  optionTitle?: string;
  pageTitle: string;
  pageSubtitle: string;
  bannerMessage: string;
  quoteText: string;
  badgeText: string;
  socialLinks: SocialLinksConfig;
}

export interface WhatsAppRegistration {
  id: string;
  memberId?: string;
  name: string;
  phone: string;
  submittedAt: string;
  source?: 'romantic' | 'friendly' | 'general';
  notes?: string;
}

export interface HelpChatMessage {
  id: string;
  memberId: string;
  memberName: string;
  sender: 'user' | 'admin';
  text: string;
  timestamp: string;
}

export const INITIAL_HELP_CHATS: HelpChatMessage[] = [
  {
    id: 'msg_init_1',
    memberId: 'mem_1',
    memberName: 'Priya Sharma',
    sender: 'user',
    text: 'Hello, mujhe aapka app bahut pasand aaya! Kaise connect karein?',
    timestamp: '10:25 AM',
  },
  {
    id: 'msg_init_2',
    memberId: 'mem_1',
    memberName: 'Priya Sharma',
    sender: 'admin',
    text: 'Namaste Priya ji! Welcome! Aap WhatsApp ya Instagram par seedhe message kar sakti hain.',
    timestamp: '10:28 AM',
  },
];

export const DEFAULT_FRIENDLY_CONFIG: FriendlyPageConfig = {
  optionTitle: 'Acha & Friendly Baatein',
  pageTitle: 'Welcome to Sweet & Friendly Connect',
  pageSubtitle: 'Aapne acche aur dilchasp baatcheet ka vikalp chuna hai. Yaha hum bina kisi jhijhak ke ek acche dost ki tarah baat kar sakte hain.',
  bannerMessage: 'Aap seedhe mujhse connect karke dosti aur dil ki baatein share kar sakti hain ✨',
  quoteText: 'Zindagi me ek acche dost ka hona sabse bada tohfa hai, jo har baat ko samjhe aur muskurane ki wajah bane.',
  badgeText: 'FRIENDLY CONNECT',
  socialLinks: {
    instagramUsername: 'your_instagram_id',
    telegramUsername: 'your_telegram_id',
    snapchatUsername: 'your_snapchat_id',
    whatsappNumber: '919876543210',
    whatsappMessage: 'Hi! Maine aapke app me connect kiya hai, aapse baat karke achha laga.',
    instagramEnabled: true,
    telegramEnabled: true,
    snapchatEnabled: true,
    whatsappEnabled: true,
  },
};

export const DEFAULT_ROMANTIC_CONFIG: RomanticPageConfig = {
  optionTitle: 'Very Romantic & Special Baatein',
  optionBadge: 'EXCLUSIVE',
  optionDescription: 'Agar aap sirf behad romantic, pyaar bhari aur dil ke sabse kareeb wali baatein chahti hain. Isko chunne par upar ke options hat jayenge aur aapke liye alag romantic screen khulegi.',
  pageTitle: 'Welcome to Special Romantic Zone',
  pageSubtitle: 'Aapne chuna hai sabse pyara aur behad romantic andaaz. Yaha par humari har baat dil se shuru hokar dil tak jayegi.',
  bannerMessage: 'Aap seedhe mujhse connect karke apni manpasand baatein share kar sakti hain ❤️',
  quoteText: 'Tere bina ab dil lagta nahi, har saans me tera hi khayal rehta hai...',
  socialLinks: {
    instagramUsername: 'your_instagram_id',
    telegramUsername: 'your_telegram_id',
    snapchatUsername: 'your_snapchat_id',
    whatsappNumber: '919876543210',
    whatsappMessage: 'Hi! Maine aapka app dekha aur mujhe aapse romantic baatein karni hain.',
    instagramEnabled: true,
    telegramEnabled: true,
    snapchatEnabled: true,
    whatsappEnabled: true,
  },
};

export interface ConversationTopic {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export const AVAILABLE_TOPICS: ConversationTopic[] = [
  {
    id: 'dil_ki_baatein',
    title: 'Dil Ki Baatein & Feelings',
    description: 'Apne jazbaat, dil ki baatein aur emotional connect share karna',
    iconName: 'Heart',
  },
  {
    id: 'romantic_sweet',
    title: 'Romantic & Sweet Baatein',
    description: 'Pyaar bhari aur sweet compliments wali baatein',
    iconName: 'Sparkles',
  },
  {
    id: 'late_night',
    title: 'Late Night Deep Talks',
    description: 'Raat ki shant aur gehri baatein bina kisi jhijhak ke',
    iconName: 'Moon',
  },
  {
    id: 'fun_masti',
    title: 'Fun, Masti & Casual Gupshup',
    description: 'Hansna-mazaak, memes aur light-hearted chill baatein',
    iconName: 'Smile',
  },
  {
    id: 'daily_life',
    title: 'Daily Life & Routine Sharing',
    description: 'Din kaisa guzra, ek dusre ka haal-chaal aur sharing',
    iconName: 'Coffee',
  },
  {
    id: 'care_support',
    title: 'Care & Emotional Support',
    description: 'Ek acche dost ki tarah sunna, samjhana aur motivate karna',
    iconName: 'Shield',
  },
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem_1',
    name: 'Priya Sharma',
    age: 21,
    interests: ['Dil Ki Baatein & Feelings', 'Late Night Deep Talks', 'Romantic & Sweet Baatein'],
    registeredAt: '2026-09-03 10:15 AM',
    status: 'New',
    note: 'Special interest in deep late night talks',
  },
  {
    id: 'mem_2',
    name: 'Ananya Verma',
    age: 23,
    interests: ['Fun, Masti & Casual Gupshup', 'Daily Life & Routine Sharing'],
    registeredAt: '2026-09-02 08:45 PM',
    status: 'Connected',
    note: 'Loves friendly casual conversations',
  },
  {
    id: 'mem_3',
    name: 'Simran Kaur',
    age: 20,
    interests: ['Care & Emotional Support', 'Dil Ki Baatein & Feelings'],
    registeredAt: '2026-09-01 04:30 PM',
    status: 'Pending',
    note: 'Wants someone to listen and care',
  },
];
