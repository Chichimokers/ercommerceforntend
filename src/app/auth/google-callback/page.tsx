'use client';

import { useSocialAuth } from '@/hooks/useSocialAuth';
import { Spinner } from '@heroui/react';

export default function GoogleCallback() {
  useSocialAuth();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner className="h-12 w-12 text-blue-600" />
      <p className="ml-2 text-gray-600">Autenticando con Google...</p>
    </div>
  );
} 