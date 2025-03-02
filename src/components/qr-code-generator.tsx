"use client";

import QRCode from "qrcode";
import { useEffect, useRef } from "react";

export function QrCodeGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // In a real app, this would be your app's URL with the session ID
      const url = `https://naver.com`;

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
  }, []);

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} className="border rounded-lg p-2" />
      <p className="mt-2 text-sm text-gray-500">
        Scan to join the bill splitting session
      </p>
    </div>
  );
}
