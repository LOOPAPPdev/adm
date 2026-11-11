import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 text-ds-title font-semibold">Página não encontrada</h1>
      <p className="mt-3 text-ds-muted">O endereço não existe ou foi movido. Endereços antigos com <code>#/</code> são redirecionados automaticamente.</p>
      <p className="mt-6 flex justify-center gap-4"><Link href="/">LOOP</Link><Link href="/app">Workspace</Link><Link href="/directory">Directory</Link></p>
    </main>
  );
}
