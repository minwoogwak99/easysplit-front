"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

interface ImageUploaderProps {
  onImageProcessed?: (items: any[]) => void;
}

export function ImageUploader({ onImageProcessed }: ImageUploaderProps) {
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    // In a real app, this would open the device camera
    alert("Camera functionality would open here");
  };

  const handleRemoveImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleProcessImage = () => {
    if (onImageProcessed) {
      try {
        const base64Image = image?.split(",")[1];

        fetch("/api/analyze-bill", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imgdata: base64Image }),
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            console.log("aaaaaaa", data);
            data = JSON.parse(data);
            onImageProcessed(data.items);
          });
      } catch (error) {
        console.error("Error processing receipt:", error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {!image ? (
        <Card className="flex flex-col items-center justify-center p-6 border-dashed border-2 h-64">
          <div className="flex flex-col items-center text-center space-y-4">
            <Upload className="h-10 w-10 text-gray-400" />
            <div>
              <p className="font-medium">Drag and drop your receipt</p>
              <p className="text-sm text-gray-500">or select an option below</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={handleUploadClick} variant="outline">
                Upload File
              </Button>
              <Button onClick={handleCameraClick}>
                <Camera className="mr-2 h-4 w-4" />
                Take Photo
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="relative">
          <Image
            src={image || "/placeholder.svg"}
            alt="Receipt"
            width={0}
            height={0}
            className="w-full h-auto max-h-96 object-contain rounded-md"
          />
          <Button
            onClick={handleRemoveImage}
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleProcessImage}>Process Receipt</Button>
          </div>
        </div>
      )}
    </div>
  );
}
