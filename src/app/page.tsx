"use client";

import { useState } from "react";
import ImageGenerator from "@/components/ImageGenerator";
import ImageGallery from "@/components/ImageGallery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Images, Settings } from "lucide-react";

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
  settings: {
    width: number;
    height: number;
    model: string;
  };
}

export default function Home() {
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageGenerated = (newImage: GeneratedImage) => {
    setGeneratedImages(prev => [newImage, ...prev]);
  };

  const handleDeleteImage = (id: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            AI Image Generator
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transform your imagination into stunning visuals with our advanced AI image generation powered by state-of-the-art models
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generator Panel */}
        <div className="lg:col-span-2">
          <Card className="shadow-xl bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Generate Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageGenerator
                onImageGenerated={handleImageGenerated}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
              />
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Generated Images</span>
                  <span className="text-2xl font-bold text-purple-600">{generatedImages.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Status</span>
                  <span className={`text-sm font-medium ${isGenerating ? 'text-orange-500' : 'text-green-500'}`}>
                    {isGenerating ? 'Generating...' : 'Ready'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Demo Mode</span>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                    Limited Access
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <Sparkles className="w-8 h-8 mx-auto" />
                <h3 className="font-semibold">Upgrade to Pro</h3>
                <p className="text-xs opacity-90">
                  Unlimited generations, HD quality, commercial license, and more!
                </p>
                <a 
                  href="/pricing" 
                  className="block bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  View Plans
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Images className="w-8 h-8 text-blue-500 mx-auto" />
                <h3 className="font-semibold text-gray-700">Pro Tip</h3>
                <p className="text-sm text-gray-600">
                  Be specific in your prompts for better results. Include style, mood, and details!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="space-y-6">
        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Images className="w-4 h-4" />
              Gallery ({generatedImages.length})
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Recent
            </TabsTrigger>
          </TabsList>
          <TabsContent value="gallery" className="mt-6">
            <ImageGallery 
              images={generatedImages} 
              onDeleteImage={handleDeleteImage}
            />
          </TabsContent>
          <TabsContent value="recent" className="mt-6">
            <ImageGallery 
              images={generatedImages.slice(0, 6)} 
              onDeleteImage={handleDeleteImage}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}