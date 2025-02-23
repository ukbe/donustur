'use client';

import Logo from '@/components/common/Logo';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export default function AuthHeader({title, subtitle}: AuthHeaderProps) {
  return (
    <div className="text-center mb-6">
      <Logo className="mb-4" />
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm text-gray-600">{subtitle}</p>
    </div>
  );
}
