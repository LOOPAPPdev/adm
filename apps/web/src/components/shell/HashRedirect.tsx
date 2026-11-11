'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Old LOOP links used hash routes (/#/app/projetos/demo). Send them to the real path once, keeping the rest of the URL. */
export function HashRedirect() {
  const router = useRouter();
  useEffect(() => {
    const h = window.location.hash;
    if (h.startsWith('#/')) router.replace(h.slice(1) || '/');
  }, [router]);
  return null;
}
