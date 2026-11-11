import { ButtonLink } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page';

export function NotFound() {
  return (
    <div className="py-10">
      <PageHeader eyebrow="404" title="Página ou projeto não encontrado" lead="O endereço não existe ou o projeto não está salvo neste navegador." />
      <div className="flex gap-2"><ButtonLink to="/" variant="primary">Voltar ao início</ButtonLink><ButtonLink to="/app/projetos">Ver projetos</ButtonLink></div>
    </div>
  );
}
