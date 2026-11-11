'use client';
import dynamic from 'next/dynamic';
import { Gate } from '@/components/shell/Gate';
import { Loading } from '@/components/shell/Loading';

// Client-only: this screen uses browser-only libraries or local data.
const C = dynamic(() => import('@/screens/workspace/Projetos').then(m => m.Projetos), { ssr: false, loading: Loading });

export default function Page() {
  return <Gate><C /></Gate>;
}
