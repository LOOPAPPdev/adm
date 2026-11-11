'use client';
import dynamic from 'next/dynamic';
import { Loading } from '@/components/shell/Loading';

// Client-only: reads the version history from /api/v1.
const C = dynamic(() => import('@/screens/workspace/Historico').then(m => m.Historico), { ssr: false, loading: Loading });

export default function Page() {
  return <C />;
}
