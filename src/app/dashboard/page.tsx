"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@/lib/supabase";
import { UserService } from "@/lib/user-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  CreditCard, 
  ImageIcon, 
  TrendingUp, 
  Calendar,
  Crown,
  Zap,
  Download,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserStats {
  user: any;
  totalGenerations: number;
  totalCreditsUsed: number;
  recentGenerations: number;
}

interface Generation {
  id: string;
  prompt: string;
  image_url: string;
  width: number;
  height: number;
  credits_used: number;
  created_at: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/auth/signin");
        return;
      }

      setUser(session.user);
      await loadUserData(session.user.id);
      setIsLoading(false);
    };

    checkAuth();
  }, [router, supabase.auth]);

  const loadUserData = async (userId: string) => {
    try {
      const [userStats, userGenerations] = await Promise.all([
        UserService.getUserStats(userId),
        UserService.getUserGenerations(userId, 10)
      ]);

      setStats(userStats);
      setGenerations(userGenerations);
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load your data");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded!");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  const deleteGeneration = async (generationId: string) => {
    if (!user) return;
    
    try {
      const success = await UserService.deleteGeneration(generationId, user.id);
      if (success) {
        setGenerations(prev => prev.filter(gen => gen.id !== generationId));
        toast.success("Image deleted");
      } else {
        toast.error("Failed to delete image");
      }
    } catch (error) {
      toast.error("Failed to delete image");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-pulse"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Something went wrong</h2>
          <Button onClick={() => router.push("/auth/signin")}>
            Sign In Again
          </Button>
        </div>
      </div>
    );
  }

  const planColors = {
    FREE: "bg-gray-100 text-gray-800",
    STARTER: "bg-blue-100 text-blue-800",
    PRO: "bg-purple-100 text-purple-800",
    ENTERPRISE: "bg-yellow-100 text-yellow-800"
  };

  const creditUsagePercent = stats.user.plan === 'FREE' 
    ? (stats.user.daily_generations / 5) * 100
    : stats.user.plan === 'ENTERPRISE' 
      ? 0 // Unlimited
      : ((stats.user.total_credits_used % (stats.user.plan === 'STARTER' ? 100 : 500)) / (stats.user.plan === 'STARTER' ? 100 : 500)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="font-bold text-xl text-gray-800">ImageGen Pro</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Badge className={planColors[stats.user.plan as keyof typeof planColors]}>
              {stats.user.plan}
            </Badge>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {stats.user.name || user.email}!
          </h1>
          <p className="text-gray-600">
            Manage your AI image generations and account settings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.user.plan === 'ENTERPRISE' ? '∞' : stats.user.credits}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.user.plan === 'FREE' ? 'Daily limit' : 'Monthly allocation'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Generated</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGenerations}</div>
              <p className="text-xs text-muted-foreground">
                All time images
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentGenerations}</div>
              <p className="text-xs text-muted-foreground">
                Recent activity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plan Status</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.user.plan}</div>
              <Link href="/pricing" className="text-xs text-purple-600 hover:underline">
                {stats.user.plan === 'FREE' ? 'Upgrade Plan' : 'Manage Plan'}
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Usage Progress */}
        {stats.user.plan !== 'ENTERPRISE' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Usage This {stats.user.plan === 'FREE' ? 'Day' : 'Month'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Credits Used</span>
                  <span>
                    {stats.user.plan === 'FREE' 
                      ? `${stats.user.daily_generations}/5` 
                      : `${stats.user.total_credits_used % (stats.user.plan === 'STARTER' ? 100 : 500)}/${stats.user.plan === 'STARTER' ? 100 : 500}`
                    }
                  </span>
                </div>
                <Progress value={creditUsagePercent} className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Generations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Generations</CardTitle>
          </CardHeader>
          <CardContent>
            {generations.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No images yet</h3>
                <p className="text-gray-500 mb-4">Start generating amazing AI images!</p>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <Zap className="w-4 h-4 mr-2" />
                    Create Your First Image
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generations.map((generation) => (
                  <div key={generation.id} className="group relative">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={generation.image_url}
                        alt={generation.prompt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => downloadImage(generation.image_url, `ai-image-${generation.id}`)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteGeneration(generation.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Image Info */}
                    <div className="mt-3 space-y-2">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {generation.prompt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(generation.created_at).toLocaleDateString()}
                        </span>
                        <span>{generation.width}×{generation.height}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}