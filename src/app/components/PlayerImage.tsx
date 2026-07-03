'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PlayerImageProps {
  name: string;
  className?: string;
  width: number;
  height: number;
  priority?: boolean;
}

export default function PlayerImage({ name, className, width, height, priority = false }: PlayerImageProps) {
  const basePath = '';
  // Try loading player-specific image
  const [src, setSrc] = useState(`${basePath}/${encodeURIComponent(name)}.png`);

  return (
    <Image
      src={src}
      alt={name}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={() => {
        // Fall back to placeholder if it doesn't exist
        setSrc(`${basePath}/Placeholder.png`);
      }}
    />
  );
}
