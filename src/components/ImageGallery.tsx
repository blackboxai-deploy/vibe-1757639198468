"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2, Eye, Calendar, Settings } from "lucide-react";
import { toast } from "sonner";
import type { GeneratedImage } from "@/app/page";

interface ImageGalleryProps {
  images: GeneratedImage[];
  onDeleteImage: (id: string) => void;
}

export default function ImageGallery({ images, onDeleteImage }: ImageGalleryProps) {
  // Removed unused selectedImage state

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

  const handleDelete = (id: string, prompt: string) => {
    onDeleteImage(id);
    toast.success(`Deleted: "${prompt.substring(0, 30)}..."`);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (images.length === 0) {
    return (
      <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
        <CardContent className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto">
              <Settings className="w-12 h-12 text-purple-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-700">No Images Yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Start generating beautiful AI images by entering a creative prompt above. Your creations will appear here!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((image) => (
          <Card key={image.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden bg-white/90 backdrop-blur-sm border-0">
            <div className="relative aspect-square">
              <img
                src={image.url}
                alt={image.prompt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              
              {/* Overlay with Actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="bg-white/90 hover:bg-white text-gray-800"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Generated Image</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <img
                        src={image.url}
                        alt={image.prompt}
                        className="w-full h-auto rounded-lg"
                        style={{ maxHeight: "70vh", objectFit: "contain" }}
                      />
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(image.timestamp)}
                          </Badge>
                          <Badge variant="outline">
                            {image.settings.width}×{image.settings.height}
                          </Badge>
                          <Badge variant="outline">
                            Flux 1.1 Pro
                          </Badge>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700 font-medium">Prompt:</p>
                          <p className="text-sm text-gray-600 italic">{image.prompt}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => downloadImage(image.url, `ai-image-${image.id}`)}
                            className="flex-1"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(image.id, image.prompt)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button 
                  variant="secondary" 
                  size="sm"
                  className="bg-white/90 hover:bg-white text-gray-800"
                  onClick={() => downloadImage(image.url, `ai-image-${image.id}`)}
                >
                  <Download className="w-4 h-4" />
                </Button>
                
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="bg-red-500/90 hover:bg-red-500 text-white"
                  onClick={() => handleDelete(image.id, image.prompt)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Image Info */}
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {image.prompt}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(image.timestamp)}
                  </span>
                  <span>{image.settings.width}×{image.settings.height}</span>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </DialogTrigger>
                </Dialog>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={() => downloadImage(image.url, `ai-image-${image.id}`)}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gallery Stats */}
      {images.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Total Images: <span className="font-semibold text-purple-600">{images.length}</span>
              </span>
              <span className="text-gray-600">
                Latest: <span className="font-semibold text-purple-600">
                  {images.length > 0 ? formatDate(images[0].timestamp) : 'None'}
                </span>
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}