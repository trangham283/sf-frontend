"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { User } from "lucide-react";
import Button, { buttonClasses } from "@/components/ui/Button";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const MAX_DIMENSION = 512;

export default function ContactPhotoField({
  defaultPhotoUrl,
  onProcessingChange,
}: {
  defaultPhotoUrl?: string | null;
  onProcessingChange?: (processing: boolean) => void;
}) {
  const [photoUrl, setPhotoUrl] = useState(defaultPhotoUrl ?? "");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const loadIdRef = useRef(0);

  function updateProcessing(next: boolean) {
    setProcessing(next);
    onProcessingChange?.(next);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file");
      input.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Photo must be 8 MB or smaller");
      input.value = "";
      return;
    }

    const myId = ++loadIdRef.current;
    updateProcessing(true);

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      if (myId !== loadIdRef.current) {
        URL.revokeObjectURL(objectUrl);
        return;
      }

      try {
        const scale = Math.min(
          1,
          MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight),
        );
        const width = Math.round(image.naturalWidth * scale);
        const height = Math.round(image.naturalHeight * scale);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context || !width || !height) {
          throw new Error("Unable to resize photo");
        }

        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height);
        setPhotoUrl(canvas.toDataURL("image/jpeg", 0.85));
      } catch {
        setError("Could not process that photo");
      } finally {
        URL.revokeObjectURL(objectUrl);
        input.value = "";
        if (myId === loadIdRef.current) {
          updateProcessing(false);
        }
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      if (myId !== loadIdRef.current) return;

      input.value = "";
      setError("Could not load that photo");
      updateProcessing(false);
    };

    image.src = objectUrl;
  }

  return (
    <div className="space-y-4" aria-busy={processing}>
      <div className="border-b border-hairline pb-2">
        <h2 className="font-display text-sm font-semibold text-foreground">
          Photo
        </h2>
        <p className="text-[13px] text-muted-foreground">
          Add an optional photo for this contact.
        </p>
      </div>

      <input type="hidden" name="photo_url" value={photoUrl} />

      <div className="flex items-center gap-4">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- local data URL / arbitrary remote avatar
          <img
            src={photoUrl}
            alt=""
            aria-hidden="true"
            className="h-16 w-16 aspect-square rounded-full object-cover"
          />
        ) : (
          <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <User className="h-6 w-6" aria-hidden="true" />
          </span>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              id="contact-photo"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleChange}
            />
            <label
              htmlFor="contact-photo"
              className={buttonClasses("secondary", "md", "cursor-pointer")}
            >
              {photoUrl ? "Change photo" : "Upload photo"}
            </label>
            {photoUrl ? (
              <Button
                variant="ghost"
                onClick={() => {
                  loadIdRef.current++;
                  setPhotoUrl("");
                  setError("");
                  updateProcessing(false);
                }}
              >
                Remove
              </Button>
            ) : null}
          </div>

          {error ? (
            <p role="alert" className="text-[13px] text-destructive">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
