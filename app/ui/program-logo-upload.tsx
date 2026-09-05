"use client";

import { Button, Description, Label, toast } from "@heroui/react";
import { UploadIcon, XIcon } from "lucide-react";
import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";

const MAX_LOGO_SIZE = 1024 * 1024; // 1 MB
const MAX_LOGO_DIMENSION = 512;

export default function ProgramLogoUpload({
  url,
  file,
  onChange,
  label = "Program icon",
}: {
  url: string | null;
  file: File | null;
  onChange: (change: { url: string | null; file: File | null }) => void;
  label?: string;
}) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      toast("Please select an image file", {
        indicator: <XIcon />,
        variant: "danger",
      });
      return;
    }

    if (selectedFile.size > MAX_LOGO_SIZE) {
      toast("Image must be smaller than 1 MB", {
        indicator: <XIcon />,
        variant: "danger",
      });
      return;
    }

    let dimensions: { width: number; height: number };
    try {
      dimensions = await getImageDimensions(selectedFile);
    } catch {
      toast("Could not read image dimensions", {
        indicator: <XIcon />,
        variant: "danger",
      });
      return;
    }

    if (
      dimensions.width >= MAX_LOGO_DIMENSION ||
      dimensions.height >= MAX_LOGO_DIMENSION
    ) {
      toast("Image must be smaller than 512x512", {
        indicator: <XIcon />,
        variant: "danger",
      });
      return;
    }

    if (objectUrl) URL.revokeObjectURL(objectUrl);
    const newObjectUrl = URL.createObjectURL(selectedFile);
    setObjectUrl(newObjectUrl);
    onChange({ url: null, file: selectedFile });
  }

  function handleRemove() {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl(null);
    onChange({ url: null, file: null });
    if (inputRef.current) inputRef.current.value = "";
  }

  const previewSrc = objectUrl ?? url;

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <Description>
        Images must be smaller than 512x512. Upload your image directly.
      </Description>
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          onPress={() => inputRef.current?.click()}
        >
          <UploadIcon /> Upload icon
        </Button>
        {previewSrc && (
          <div className="flex items-center gap-2">
            <NextImage
              src={previewSrc}
              alt="Program icon preview"
              width={40}
              height={40}
              className="rounded object-cover"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onPress={handleRemove}
            >
              <XIcon /> Remove
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image"));
    };
    img.src = url;
  });
}
