"use client";

import { currentSessionAtom } from "@/store/atom";
import { useAtomValue } from "jotai";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Copy } from "lucide-react";

export function QrCodeGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const session = useAtomValue(currentSessionAtom);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (session && canvasRef.current) {
      // Create a URL with the session ID
      const url = `${window.location.origin}/join-session/${session.id}`;
      setShareUrl(url);

      QRCode.toCanvas(
        canvasRef.current,
        url,
        {
          width: 240,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        },
        (error) => {
          if (error) console.error(error);
        }
      );
    }
  }, [session]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  if (!session) {
    return <div>No active session</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} className="border rounded-lg p-2" />
      <p className="mt-2 text-sm text-gray-500">
        Scan to join the bill splitting session
      </p>
      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={shareUrl}
          className="px-3 py-2 border rounded-md text-sm w-full"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={copyToClipboard}
          className="flex-shrink-0"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      {copied && (
        <p className="text-sm text-green-600 mt-1">Copied to clipboard!</p>
      )}
    </div>
  );
}
