import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface SystemAlert {
  id: string;
  source: string;
  level: string;
  message: string;
  sentryIssueId: string | null;
  sentryUrl: string | null;
  culprit: string | null;
  errorType: string | null;
  errorValue: string | null;
  occurrenceCount: number | null;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  platform: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export function useSystemAlerts(unresolvedOnly = true) {
  return useQuery({
    queryKey: ['system-alerts', { unresolvedOnly }],
    queryFn: async (): Promise<SystemAlert[]> => {
      const { data } = await api.get(`/system-alerts?unresolvedOnly=${unresolvedOnly}`);
      return data;
    },
    refetchInterval: 10000,
  });
}

export function useResolveSystemAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/system-alerts/${id}/resolve`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-alerts'] });
    },
  });
}
