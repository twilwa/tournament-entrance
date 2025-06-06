import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface HackerProfile {
  id: string;
  user_id: string;
  username: string;
  interests: string[];
  skills: string[];
  experience_level: string;
  background: string;
  goals: string[];
  preferred_tech: string[];
  hacker_type: string;
  created_at: string;
  updated_at: string;
}

export interface InterviewResponse {
  question_id: string;
  question: string;
  answer: string;
  timestamp: string;
}

export interface HackerCard {
  id: string;
  profile_id: string;
  card_data: {
    title: string;
    subtitle: string;
    level: number;
    skills: Array<{ name: string; level: number }>;
    achievements: string[];
    special_abilities: string[];
    avatar_seed: string;
  };
  created_at: string;
} 