import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface SystemAlert {
  id: string;
  source: string;
  level: string;
  message: string;
  sentryIssueId: string | null;
  sentryUrl: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export function useSystemAlerts(unresolvedOnly = true) {
  return useQuery({
    queryKey: ['system-alerts', { unresolvedOnly }],
    queryFn: async (): Promise<SystemAlert[]> => {
      const res = await fetch(`/api/system-alerts?unresolvedOnly=${unresolvedOnly}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch system alerts');
      return res.json();
    },
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });
}

export function useResolveSystemAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/system-alerts/${id}/resolve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`,
        },
      });
      if (!res.ok) throw new Error('Failed to resolve alert');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-alerts'] });
    },
  });
}
