import { BpmMap } from '@/components/BpmMap';
import { useCurrentProject } from './ProjectLayout';

export function Consultoria() {
  const p = useCurrentProject();
  return <BpmMap project={p} />;
}
