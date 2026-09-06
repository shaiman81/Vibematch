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

export const INITIAL_HELP_CHATS: HelpChatMessage[] = [];

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

export const INITIAL_MEMBERS: Member[] = [];
