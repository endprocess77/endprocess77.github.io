'use client';

import { useState } from 'react';
import Image from 'next/image';

interface TeamLogoProps {
  slug: string;
  name: string;
  width: number;
  height: number;
  className?: string;
}

export default function TeamLogo({ slug, name, width, height, className }: TeamLogoProps) {
  const [src, setSrc] = useState(`/team-logos/${slug}.png`);

  return (
    <Image
      src={src}
      alt={`${name} Logo`}
      width={width}
      height={height}
      className={className}
      onError={() => {
        setSrc(`/team-logos/default-shield.png`);
      }}
    />
  );
}
