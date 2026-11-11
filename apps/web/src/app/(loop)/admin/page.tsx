'use client';
import dynamic from 'next/dynamic';
import { Gate } from '@/components/shell/Gate';
import { Loading } from '@/components/shell/Loading';

// Client-only: organizations and members through /api/v1.
const C = dynamic(() => import('@/screens/workspace/Admin').then(m => m.Admin), { ssr: false, loading: Loading });

export default function Page() {
  return <Gate><C /></Gate>;
}
