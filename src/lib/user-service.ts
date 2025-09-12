import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];
type Generation = Database['public']['Tables']['generations']['Row'];
type GenerationInsert = Database['public']['Tables']['generations']['Insert'];

// Pricing configuration
const PRICING_PLANS = {
  FREE: { name: 'Free', credits: 5, dailyLimit: 5, monthlyCredits: 5 },
  STARTER: { name: 'Starter', credits: 100, monthlyCredits: 100 },
  PRO: { name: 'Pro', credits: 500, monthlyCredits: 500 },
  ENTERPRISE: { name: 'Enterprise', credits: -1, monthlyCredits: -1 },
};

export class UserService {
  // Create new user
  static async createUser(userData: UserInsert): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching user by email:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }

  // Update user
  static async updateUser(userId: string, updates: UserUpdate): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  // Check if user can generate
  static async canGenerate(userId: string): Promise<{
    canGenerate: boolean;
    reason?: string;
    creditsRemaining: number;
    dailyGenerationsUsed: number;
  }> {
    const user = await this.getUserById(userId);
    if (!user) {
      return {
        canGenerate: false,
        reason: 'User not found',
        creditsRemaining: 0,
        dailyGenerationsUsed: 0,
      };
    }

    // Reset daily generations if it's a new day
    const now = new Date();
    const lastReset = user.last_reset_date ? new Date(user.last_reset_date) : new Date(0);
    const isNewDay = now.getDate() !== lastReset.getDate() || 
                    now.getMonth() !== lastReset.getMonth() || 
                    now.getFullYear() !== lastReset.getFullYear();

    let dailyGenerations = user.daily_generations;
    if (isNewDay) {
      await this.updateUser(userId, {
        daily_generations: 0,
        last_reset_date: now.toISOString(),
      });
      dailyGenerations = 0;
    }

    const planConfig = PRICING_PLANS[user.plan];
    
    // Free tier: check daily limit
    if (user.plan === 'FREE') {
      const freePlan = planConfig as typeof PRICING_PLANS.FREE;
      if (dailyGenerations >= freePlan.dailyLimit) {
        return {
          canGenerate: false,
          reason: `Daily limit of ${freePlan.dailyLimit} generations reached`,
          creditsRemaining: user.credits,
          dailyGenerationsUsed: dailyGenerations,
        };
      }
    }
    
    // Paid plans: check credits (except Enterprise)
    if (user.plan !== 'FREE' && user.plan !== 'ENTERPRISE') {
      if (user.credits <= 0) {
        return {
          canGenerate: false,
          reason: 'No credits remaining',
          creditsRemaining: user.credits,
          dailyGenerationsUsed: dailyGenerations,
        };
      }
    }

    return {
      canGenerate: true,
      creditsRemaining: user.credits,
      dailyGenerationsUsed: dailyGenerations,
    };
  }

  // Consume credits
  static async consumeCredits(userId: string, creditsUsed: number = 1): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return false;

      const updates: UserUpdate = {
        daily_generations: user.daily_generations + 1,
        total_credits_used: user.total_credits_used + creditsUsed,
      };

      // Only deduct credits for paid plans (not FREE or ENTERPRISE)
      if (user.plan !== 'FREE' && user.plan !== 'ENTERPRISE') {
        updates.credits = user.credits - creditsUsed;
      }

      const updatedUser = await this.updateUser(userId, updates);
      return updatedUser !== null;
    } catch (error) {
      console.error('Error consuming credits:', error);
      return false;
    }
  }

  // Add credits
  static async addCredits(userId: string, credits: number): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return false;

      const updatedUser = await this.updateUser(userId, {
        credits: user.credits + credits,
      });
      return updatedUser !== null;
    } catch (error) {
      console.error('Error adding credits:', error);
      return false;
    }
  }

  // Save generation
  static async saveGeneration(generationData: GenerationInsert): Promise<Generation | null> {
    try {
      const { data, error } = await supabase
        .from('generations')
        .insert(generationData)
        .select()
        .single();

      if (error) {
        console.error('Error saving generation:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error saving generation:', error);
      return null;
    }
  }

  // Get user generations
  static async getUserGenerations(userId: string, limit: number = 20, offset: number = 0): Promise<Generation[]> {
    try {
      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching generations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching generations:', error);
      return [];
    }
  }

  // Delete generation
  static async deleteGeneration(generationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('generations')
        .delete()
        .eq('id', generationId)
        .eq('user_id', userId); // Ensure user owns the generation

      if (error) {
        console.error('Error deleting generation:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting generation:', error);
      return false;
    }
  }

  // Get user statistics
  static async getUserStats(userId: string) {
    try {
      const [user, generations] = await Promise.all([
        this.getUserById(userId),
        supabase
          .from('generations')
          .select('id, created_at, credits_used')
          .eq('user_id', userId)
      ]);

      if (!user || generations.error) {
        return null;
      }

      const totalGenerations = generations.data?.length || 0;
      const totalCreditsUsed = generations.data?.reduce((sum, gen) => sum + gen.credits_used, 0) || 0;
      
      // Recent generations (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentGenerations = generations.data?.filter(
        gen => new Date(gen.created_at) > sevenDaysAgo
      ).length || 0;

      return {
        user,
        totalGenerations,
        totalCreditsUsed,
        recentGenerations,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }
}