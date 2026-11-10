import { useMemo, useState } from 'react';
import { runSelfTests } from '@/domain/self-tests';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page';
import { useLoop } from '@/store/loop-store';
import { cn } from '@/lib/cn';

export function Verificacao() {
  const notify = useLoop(s => s.notify);
  const [runAt, setRunAt] = useState('');
  const res = useMemo(() => runSelfTests(), [runAt]);
  const ok = res.filter(t => t.pass).length;
  return (
    <>
      <PageHeader eyebrow="Verificações do domínio" title={<span data-testid="selftest-summary">{ok} de {res.length} verificações aprovadas</span>}
        lead={`Testes executados no navegador sobre o núcleo de domínio${runAt ? ' · ' + runAt : ''}. Os mesmos testes rodam no Vitest.`}
        actions={<Button onClick={() => { setRunAt(new Date().toLocaleTimeString('pt-BR')); notify('Verificações executadas novamente.'); }}>Executar novamente</Button>} />
      <Card className="p-0">
        <ul className="m-0 list-none divide-y divide-ds-line p-0">
          {res.map(t => <li key={t.name} className="flex items-center justify-between gap-3 px-4 py-2.5 text-[13px]"><span>{t.name} {t.note && <span className="text-ds-muted">— {t.note}</span>}</span><b className={cn('text-xs', t.pass ? 'text-ds-success' : 'text-ds-accent')}>{t.pass ? 'PASSOU' : 'FALHOU'}</b></li>)}
        </ul>
      </Card>
    </>
  );
}
