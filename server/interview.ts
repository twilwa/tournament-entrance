import { supabase, HackerProfile, InterviewResponse, HackerCard } from './supabase';

export interface InterviewQuestion {
  id: string;
  question: string;
  category: 'interests' | 'skills' | 'background' | 'goals' | 'experience';
  followUp?: string;
}

export const interviewQuestions: InterviewQuestion[] = [
  {
    id: 'q1',
    question: "What draws you to the digital realm? What aspects of technology fascinate you the most?",
    category: 'interests'
  },
  {
    id: 'q2',
    question: "Tell me about your technical skills. What languages, frameworks, or tools do you wield?",
    category: 'skills'
  },
  {
    id: 'q3',
    question: "How would you rate your experience level? Are you a curious beginner, seasoned practitioner, or somewhere in between?",
    category: 'experience'
  },
  {
    id: 'q4',
    question: "What's your background? How did you find yourself on this path?",
    category: 'background'
  },
  {
    id: 'q5',
    question: "What are your goals in the tech world? What do you hope to build or achieve?",
    category: 'goals'
  }
];

export class InterviewService {
  private responses: Map<string, InterviewResponse> = new Map();
  private currentQuestionIndex: number = 0;
  private userId: string;
  private username: string;

  constructor(userId: string, username: string) {
    this.userId = userId;
    this.username = username;
  }

  getCurrentQuestion(): InterviewQuestion | null {
    if (this.currentQuestionIndex >= interviewQuestions.length) {
      return null;
    }
    return interviewQuestions[this.currentQuestionIndex];
  }

  recordResponse(questionId: string, question: string, answer: string) {
    this.responses.set(questionId, {
      question_id: questionId,
      question,
      answer,
      timestamp: new Date().toISOString()
    });
    this.currentQuestionIndex++;
  }

  isComplete(): boolean {
    return this.currentQuestionIndex >= interviewQuestions.length;
  }

  async saveProfile(): Promise<HackerProfile | null> {
    if (!this.isComplete()) {
      throw new Error('Interview not complete');
    }

    const profile = this.buildProfile();
    
    const { data, error } = await supabase
      .from('hacker_profiles')
      .insert(profile)
      .select()
      .single();

    if (error) {
      console.error('Error saving profile:', error);
      return null;
    }

    return data;
  }

  private buildProfile(): Omit<HackerProfile, 'id' | 'created_at' | 'updated_at'> {
    const responses = Array.from(this.responses.values());
    
    // Extract information from responses
    const interests = this.extractFromResponse('q1', ['technology', 'coding', 'hacking', 'security', 'AI', 'web', 'mobile', 'data', 'blockchain', 'gaming']);
    const skills = this.extractFromResponse('q2', ['JavaScript', 'Python', 'TypeScript', 'React', 'Node', 'SQL', 'Git', 'Docker', 'AWS', 'Linux']);
    const experienceLevel = this.determineExperienceLevel(responses.find(r => r.question_id === 'q3')?.answer || '');
    const background = responses.find(r => r.question_id === 'q4')?.answer || '';
    const goals = this.extractFromResponse('q5', ['build', 'create', 'learn', 'contribute', 'innovate', 'solve', 'develop']);
    
    const hackerType = this.determineHackerType(interests, skills, goals);

    return {
      user_id: this.userId,
      username: this.username,
      interests,
      skills,
      experience_level: experienceLevel,
      background,
      goals,
      preferred_tech: skills.slice(0, 3), // Top 3 skills as preferred tech
      hacker_type: hackerType
    };
  }

  private extractFromResponse(questionId: string, keywords: string[]): string[] {
    const response = this.responses.get(questionId);
    if (!response) return [];

    const answer = response.answer.toLowerCase();
    const found: string[] = [];

    keywords.forEach(keyword => {
      if (answer.includes(keyword.toLowerCase())) {
        found.push(keyword);
      }
    });

    // Also extract any words that might be tech-related
    const techPattern = /\b(react|vue|angular|node|python|java|c\+\+|rust|go|swift|kotlin|docker|kubernetes|aws|gcp|azure)\b/gi;
    const matches = answer.match(techPattern);
    if (matches) {
      matches.forEach(match => {
        if (!found.includes(match)) {
          found.push(match);
        }
      });
    }

    return found;
  }

  private determineExperienceLevel(answer: string): string {
    const lower = answer.toLowerCase();
    if (lower.includes('beginner') || lower.includes('new') || lower.includes('learning')) {
      return 'beginner';
    } else if (lower.includes('intermediate') || lower.includes('some experience')) {
      return 'intermediate';
    } else if (lower.includes('expert') || lower.includes('senior') || lower.includes('experienced')) {
      return 'expert';
    } else if (lower.includes('advanced')) {
      return 'advanced';
    }
    return 'intermediate'; // default
  }

  private determineHackerType(interests: string[], skills: string[], goals: string[]): string {
    // Determine hacker archetype based on responses
    if (interests.includes('security') || interests.includes('hacking')) {
      return 'Security Researcher';
    } else if (interests.includes('AI') || skills.includes('Python')) {
      return 'AI Architect';
    } else if (interests.includes('web') || skills.includes('React')) {
      return 'Web Wizard';
    } else if (interests.includes('blockchain')) {
      return 'Crypto Pioneer';
    } else if (goals.includes('build') || goals.includes('create')) {
      return 'Digital Creator';
    }
    return 'Code Wanderer';
  }

  async generateHackerCard(profileId: string): Promise<HackerCard | null> {
    const profile = await this.getProfile(profileId);
    if (!profile) return null;

    const cardData = {
      title: profile.hacker_type,
      subtitle: `Level ${this.calculateLevel(profile)} ${profile.username}`,
      level: this.calculateLevel(profile),
      skills: profile.skills.map(skill => ({
        name: skill,
        level: Math.floor(Math.random() * 5) + 1
      })),
      achievements: this.generateAchievements(profile),
      special_abilities: this.generateAbilities(profile),
      avatar_seed: profile.username + profile.created_at
    };

    const { data, error } = await supabase
      .from('hacker_cards')
      .insert({
        profile_id: profileId,
        card_data: cardData
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating hacker card:', error);
      return null;
    }

    return data;
  }

  private async getProfile(profileId: string): Promise<HackerProfile | null> {
    const { data, error } = await supabase
      .from('hacker_profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }

  private calculateLevel(profile: HackerProfile): number {
    let level = 1;
    
    // Add levels based on experience
    switch (profile.experience_level) {
      case 'beginner': level += 0; break;
      case 'intermediate': level += 2; break;
      case 'advanced': level += 4; break;
      case 'expert': level += 6; break;
    }

    // Add levels based on skills count
    level += Math.min(profile.skills.length, 4);

    return Math.min(level, 10); // Cap at level 10
  }

  private generateAchievements(profile: HackerProfile): string[] {
    const achievements: string[] = [];

    if (profile.skills.length > 5) {
      achievements.push('Polyglot Programmer');
    }
    if (profile.experience_level === 'expert') {
      achievements.push('Master of the Craft');
    }
    if (profile.interests.includes('security')) {
      achievements.push('Digital Guardian');
    }
    if (profile.goals.includes('innovate')) {
      achievements.push('Innovation Pioneer');
    }

    return achievements;
  }

  private generateAbilities(profile: HackerProfile): string[] {
    const abilities: string[] = [];

    switch (profile.hacker_type) {
      case 'Security Researcher':
        abilities.push('Vulnerability Detection', 'System Hardening');
        break;
      case 'AI Architect':
        abilities.push('Neural Network Design', 'Data Synthesis');
        break;
      case 'Web Wizard':
        abilities.push('Responsive Enchantment', 'API Mastery');
        break;
      case 'Crypto Pioneer':
        abilities.push('Blockchain Forging', 'Smart Contract Weaving');
        break;
      default:
        abilities.push('Code Optimization', 'Debug Mastery');
    }

    return abilities;
  }
} 