"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ImageOff, Loader2 } from "lucide-react";

/**
 * Renders an <img> for a file served behind JWT auth (e.g. /tree-photos/files/:filename).
 * A plain <img src> can't carry the Authorization header, so this fetches the
 * file as an authenticated blob and swaps in an object URL.
 */
export function AuthImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let currentUrl: string | null = null;
    let cancelled = false;
    setFailed(false);
    setObjectUrl(null);

    api
      .get(src, { responseType: "blob" })
      .then((res) => {
        if (cancelled) return;
        currentUrl = URL.createObjectURL(res.data);
        setObjectUrl(currentUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [src]);

  if (failed) {
    return (
      <div className={cn("flex items-center justify-center bg-gray-100 text-gray-400", className)}>
        <ImageOff className="h-6 w-6" />
      </div>
    );
  }

  if (!objectUrl) {
    return (
      <div className={cn("flex items-center justify-center bg-gray-100 text-gray-400", className)}>
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={objectUrl} alt={alt} className={className} />;
}
