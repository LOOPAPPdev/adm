'use client';
import dynamic from 'next/dynamic';
import { Loading } from '@/components/shell/Loading';

// Client-only: this screen uses browser-only libraries or local data.
const C = dynamic(() => import('@/screens/workspace/Overview').then(m => m.Overview), { ssr: false, loading: Loading });

export default function Page() {
  return <C />;
}
