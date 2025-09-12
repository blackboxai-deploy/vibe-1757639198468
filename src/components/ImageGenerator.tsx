"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Wand2, Download } from "lucide-react";
import { toast } from "sonner";
import type { GeneratedImage } from "@/app/page";

interface ImageGeneratorProps {
  onImageGenerated: (image: GeneratedImage) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
}

const IMAGE_SIZES = [
  { label: "Square (1:1)", value: "1024x1024", width: 1024, height: 1024 },
  { label: "Portrait (3:4)", value: "768x1024", width: 768, height: 1024 },
  { label: "Landscape (4:3)", value: "1024x768", width: 1024, height: 768 },
  { label: "Wide (16:9)", value: "1920x1080", width: 1920, height: 1080 },
];

const EXAMPLE_PROMPTS = [
  "A majestic mountain landscape at sunset with golden hour lighting",
  "Cyberpunk cityscape with neon lights and flying cars",
  "Cute kawaii cat wearing a wizard hat, digital art style",
  "Abstract geometric patterns in vibrant colors",
  "Vintage steampunk machinery with brass gears and copper pipes",
];

export default function ImageGenerator({
  onImageGenerated,
  isGenerating,
  setIsGenerating,
}: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedSize, setSelectedSize] = useState("1024x1024");
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const getCurrentSize = () => {
    return IMAGE_SIZES.find(size => size.value === selectedSize) || IMAGE_SIZES[0];
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to generate an image");
      return;
    }

    setIsGenerating(true);
    setCurrentImage(null);

    try {
      const size = getCurrentSize();
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          width: size.width,
          height: size.height,
          model: "replicate/black-forest-labs/flux-1.1-pro",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Generation error:", data);
        toast.error(data.error || "Failed to generate image");
        return;
      }

      if (data.success && data.imageUrl) {
        const newImage: GeneratedImage = {
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          url: data.imageUrl,
          prompt: data.prompt,
          timestamp: new Date(),
          settings: data.settings,
        };

        setCurrentImage(data.imageUrl);
        onImageGenerated(newImage);
        toast.success("Image generated successfully!");
      } else {
        console.error("Invalid response:", data);
        toast.error("Failed to generate image - invalid response");
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Network error occurred while generating image");
    } finally {
      setIsGenerating(false);
    }
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
      console.error("Download error:", error);
      toast.error("Failed to download image");
    }
  };

  const handleExamplePrompt = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  return (
    <div className="space-y-6">
      {/* Prompt Input */}
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-sm font-medium">
          Describe your image
        </Label>
        <Textarea
          id="prompt"
          placeholder="Enter your creative prompt here... Be descriptive for better results!"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          className="resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500">
          {prompt.length}/500 characters
        </p>
      </div>

      {/* Example Prompts */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Quick Start Examples</Label>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((example, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleExamplePrompt(example)}
              className="text-xs h-8 hover:bg-purple-50 hover:border-purple-300"
            >
              {example.length > 40 ? `${example.substring(0, 40)}...` : example}
            </Button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="size" className="text-sm font-medium">
            Image Size
          </Label>
          <Select value={selectedSize} onValueChange={setSelectedSize}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {IMAGE_SIZES.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label} ({size.value})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Model</Label>
          <Select value="flux-1.1-pro" disabled>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flux-1.1-pro">Flux 1.1 Pro (High Quality)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={generateImage}
        disabled={isGenerating || !prompt.trim()}
        size="lg"
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Generating Amazing Art...
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5 mr-2" />
            Generate Image
          </>
        )}
      </Button>

      {/* Current Generated Image */}
      {currentImage && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Image</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadImage(currentImage, `ai-generated-${Date.now()}`)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative group">
              <img
                src={currentImage}
                alt={prompt}
                className="w-full h-auto rounded-lg shadow-lg"
                style={{ maxHeight: "500px", objectFit: "contain" }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-lg" />
            </div>
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 font-medium">Prompt:</p>
              <p className="text-sm text-gray-600 italic">{prompt}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isGenerating && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Creating your masterpiece...</h3>
                <p className="text-sm text-gray-500">
                  This usually takes 30-60 seconds. Please wait while our AI works its magic!
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}