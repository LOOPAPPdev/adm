import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import { Button } from './ui/button';
import type { usePlayback } from '@/lib/use-playback';

export function PlaybackBar({ pb, count }: { pb: ReturnType<typeof usePlayback>; count: number }) {
  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      {pb.playing
        ? <Button size="sm" variant="primary" onClick={pb.pause} aria-label="Pausar"><Pause size={14} /> Pausa</Button>
        : <Button size="sm" variant="primary" onClick={pb.play} aria-label="Reproduzir"><Play size={14} /> Play</Button>}
      <Button size="sm" onClick={pb.step} aria-label="Próxima etapa"><SkipForward size={14} /> Etapa</Button>
      <Button size="sm" onClick={pb.reset} aria-label="Reiniciar"><RotateCcw size={14} /> Reiniciar</Button>
      <span className="text-xs text-ds-muted" aria-live="polite" data-testid="playback-pos">Etapa {pb.idx + 1} de {count} · {pb.playing ? 'em reprodução' : 'pausado'} · ilustrativo</span>
    </div>
  );
}
