import { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { useLoop } from '@/store/loop-store';
import { exportEnvelope } from '@/domain/model';
import { Button } from '@/components/ui/button';
import { Card, Eyebrow, Muted } from '@/components/ui/card';
import { Notice, PageHeader } from '@/components/ui/page';
import { downloadText } from '@/lib/download';
import { API_CONTRACT } from '@/ports/HttpProjectRepository';

export function Configuracoes() {
  const { repo, projects, contacts, resetAll, notify } = useLoop();
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <PageHeader eyebrow="Workspace · configuração" title="Configurações" lead="Armazenamento, exportação completa e contratos de API preparados para o backend." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <Eyebrow>Armazenamento local</Eyebrow>
          <p className="mb-1 mt-2 text-[13px]">Adaptador ativo: <b data-testid="repo-kind">{repo?.kind === 'indexeddb' ? 'IndexedDB (Dexie)' : 'Memória da aba (IndexedDB indisponível)'}</b></p>
          <Muted>{projects.length} projetos · {contacts.length} rascunhos de contato. Os dados ficam só neste navegador e somem se os dados do site forem apagados.</Muted>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => { downloadText('loop-todos-os-projetos.json', JSON.stringify({ exportedAt: new Date().toISOString(), projects: projects.map(exportEnvelope) }, null, 2)); notify('Arquivo loop-todos-os-projetos.json gerado.'); }}><Download size={14} /> Exportar tudo</Button>
            {!confirm ? <Button size="sm" variant="danger" onClick={() => setConfirm(true)}><Trash2 size={14} /> Apagar dados locais…</Button>
              : <><Button size="sm" variant="danger" onClick={async () => { await resetAll(); setConfirm(false); }}>Confirmar: apagar tudo</Button><Button size="sm" variant="ghost" onClick={() => setConfirm(false)}>Cancelar</Button></>}
          </div>
          {confirm && <Notice tone="red" className="mt-3">Esta ação apaga todos os projetos e rascunhos deste navegador e não pode ser desfeita. Exporte antes se quiser guardar.</Notice>}
        </Card>
        <Card>
          <Eyebrow>Contratos de API (futuros)</Eyebrow>
          <Muted className="mt-2">A interface usa a porta ProjectRepository. Trocar o adaptador local pelo HttpProjectRepository não exige mudar as telas.</Muted>
          <ul className="mb-0 mt-3 space-y-1 pl-0 font-mono text-[11.5px]" style={{ listStyle: 'none' }}>{Object.entries(API_CONTRACT).map(([k, v]) => <li key={k}><span className="text-ds-muted">{k}:</span> {v}</li>)}</ul>
        </Card>
      </div>
    </>
  );
}
