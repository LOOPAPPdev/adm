'use client';
import dynamic from 'next/dynamic';
import { Loading } from '@/components/shell/Loading';

// Client-only: this screen uses browser-only libraries or local data.
const C = dynamic(() => import('@/screens/studio/Descoberta').then(m => m.Descoberta), { ssr: false, loading: Loading });

export default function Page() {
  return <C />;
}
