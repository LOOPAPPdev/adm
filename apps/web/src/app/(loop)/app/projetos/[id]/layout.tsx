'use client';
import type { ReactNode } from 'react';
import { Gate } from '@/components/shell/Gate';
import { ProjectLayout } from '@/screens/workspace/ProjectLayout';

export default function Layout({ children }: { children: ReactNode }) {
  return <Gate><ProjectLayout>{children}</ProjectLayout></Gate>;
}
