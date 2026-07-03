'use client';

import Image from 'next/image';

interface TeamLogoProps {
  slug: string;
  name: string;
  width: number;
  height: number;
  className?: string;
}

const EXISTING_LOGOS = ['lanja-lionesses', 'thevidiya-thunders'];

export default function TeamLogo({ slug, name, width, height, className }: TeamLogoProps) {
  const hasLogo = EXISTING_LOGOS.includes(slug);
  const src = hasLogo ? `/team-logos/${slug}.png` : `/team-logos/default-shield.png`;

  return (
    <Image
      src={src}
      alt={`${name} Logo`}
      width={width}
      height={height}
      className={className}
    />
  );
}
