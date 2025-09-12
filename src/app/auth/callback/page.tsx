"use client";

import { useEffect } from "react";
import { createClientComponentClient } from "@/lib/supabase";
import { UserService } from "@/lib/user-service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth error:", error);
          toast.error("Authentication failed");
          router.push("/auth/signin");
          return;
        }

        if (data.session?.user) {
          const user = data.session.user;
          
          // Check if user exists in our database
          let dbUser = await UserService.getUserByEmail(user.email!);
          
          if (!dbUser) {
            // Create new user in our database
            dbUser = await UserService.createUser({
              id: user.id,
              email: user.email!,
              name: user.user_metadata?.full_name || user.user_metadata?.name || null,
              avatar_url: user.user_metadata?.avatar_url || null,
              plan: 'FREE',
              credits: 5, // Start with 5 free credits
            });

            if (dbUser) {
              toast.success("Welcome to AI ImageGen Pro! You have 5 free credits to get started.");
            }
          } else {
            toast.success("Welcome back!");
          }

          // Redirect to dashboard or home
          router.push("/dashboard");
        } else {
          router.push("/auth/signin");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        toast.error("Something went wrong during authentication");
        router.push("/auth/signin");
      }
    };

    handleAuthCallback();
  }, [router, supabase.auth]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center animate-spin">
          <div className="w-12 h-12 bg-white rounded-full"></div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Setting up your account...</h2>
        <p className="text-gray-600">Please wait while we complete your sign-in.</p>
      </div>
    </div>
  );
}