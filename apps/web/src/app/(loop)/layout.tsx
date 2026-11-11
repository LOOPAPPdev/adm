'use client';
import { useEffect, type ReactNode } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { HashRedirect } from '@/components/shell/HashRedirect';
import { useLoop } from '@/store/loop-store';
import '../loop.css';

/** LOOP site, Workspace, Studio and Portal share one shell and one data store. */
export default function LoopLayout({ children }: { children: ReactNode }) {
  useEffect(() => { void useLoop.getState().init(); }, []);
  return (
    <>
      <HashRedirect />
      <AppShell>{children}</AppShell>
    </>
  );
}
