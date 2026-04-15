"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { cn } from "@/utils/cn";
import { Avatar } from "@/shared/ui/avatar.ui";
import { Camera } from "lucide-react";

function isLocalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === "127.0.0.1" || urlObj.hostname === "localhost";
  } catch {
    return false;
  }
}

type AvatarUploadProps = {
  name?: string;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  onUploadComplete?: (file: File, previewUrl: string) => void;
  isUploading?: boolean;
};

export function AvatarUpload({
  name,
  src,
  size = "lg",
  onUploadComplete,
  isUploading = false,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    const previewUrl = URL.createObjectURL(file);
    onUploadComplete?.(file, previewUrl);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const displaySrc = preview || src;
  const isLocal = src ? isLocalUrl(src) : false;

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        {displaySrc ? (
          <div
            className={cn(sizeClasses[size], "rounded-full overflow-hidden ring-2 ring-primary-200")}
          >
            {preview ? (
              <Image
                src={preview}
                alt="Preview"
                fill
                className="w-full h-full object-cover"
              />
            ) : (
              <Avatar name={name || "U"} src={displaySrc} size={size} unoptimized={isLocal} />
            )}
          </div>
        ) : (
          <Avatar name={name || "U"} size={size} />
        )}

        <button
          type="button"
          onClick={handleClick}
          disabled={isUploading}
          className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
        >
          {isUploading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </button>

        {preview && (
          <button
            type="button"
            onClick={() => setPreview(null)}
            className="absolute -top-1 -right-1 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center text-xs hover:bg-error/80 transition-colors"
          >
            ×
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={handleClick}
        disabled={isUploading}
        className="text-sm text-accent-600 hover:underline disabled:opacity-50"
      >
        {isUploading ? "Enviando..." : "Alterar foto"}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
