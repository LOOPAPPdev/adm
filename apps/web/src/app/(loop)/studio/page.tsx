'use client';
import dynamic from 'next/dynamic';
import { Gate } from '@/components/shell/Gate';
import { Loading } from '@/components/shell/Loading';

// LOOP Studio entry: the Studio modules live inside each project (/app/projetos/[id]/descoberta …).
const C = dynamic(() => import('@/screens/studio/StudioIndex').then(m => m.StudioIndex), { ssr: false, loading: Loading });

export default function Page() {
  return <Gate><C /></Gate>;
}
