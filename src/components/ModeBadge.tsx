import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

export function ModeBadge() {
  const { mode } = useAuth();

  if (!mode) return null;

  return (
    <Badge 
      variant={mode === 'real' ? 'default' : 'secondary'}
      className={mode === 'real' ? 'bg-green-600' : 'bg-yellow-600'}
    >
      {mode === 'real' ? '🟢 Live Mode (Backend Active)' : '🟡 Demo Mode (Mock Data)'}
    </Badge>
  );
}
