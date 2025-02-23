'use client';

import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function Logo({className = '', width = 180, height = 60}: LogoProps) {
  return (
    <Link href="/" className={`inline-block ${className}`}>
      <Image src="/donustur.png" alt="Dönüştür" width={width} height={height} priority className="h-auto w-auto" />
    </Link>
  );
}
