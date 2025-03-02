"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/firebase";
import { billItemsAtom, billProcessStepAtom } from "@/store/atom";
import { useSetAtom } from "jotai";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

export function ImageUploader() {
  const setbillProcessStep = useSetAtom(billProcessStepAtom);
  const setBillItems = useSetAtom(billItemsAtom);
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user] = useAuthState(auth);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      if (user) {
        try {
          const token = await user.getIdToken();
          setAuthToken(token);
        } catch (error) {
          console.error("Error getting auth token:", error);
        }
      }
    };

    getToken();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setError(null); // Clear any previous errors
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setImage(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleProcessImage = async () => {
    if (!image) return;
    
    setIsProcessing(true);
    setError(null);
    
    const base64Image = image.split(",")[1];

    try {
      const response = await fetch("/api/analyze-bill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authToken,
          imgdata: base64Image,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to process receipt: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        throw new Error("No items detected in the receipt. Please try a clearer image.");
      }
      
      setBillItems(data.items);
      setbillProcessStep("items");
    } catch (error) {
      console.error("Error processing receipt:", error);
      setError(error instanceof Error ? error.message : "Failed to process receipt");
    } finally {
      setIsProcessing(false);
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
          
          {error && (
            <div className="mt-2 text-red-500 text-sm">{error}</div>
          )}
          
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={handleProcessImage} 
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Process Receipt"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
