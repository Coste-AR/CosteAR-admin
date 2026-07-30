import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface TermsVersion {
  id: string;
  version: number;
  content: string;
  createdAt: string;
}

export function useTermsVersions() {
  return useQuery({
    queryKey: ['admin', 'terms'],
    queryFn: async (): Promise<TermsVersion[]> => {
      const res = await api.get<{ data: TermsVersion[] }>('/admin/terms');
      return res.data.data;
    },
  });
}

export function usePublishTerms() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const res = await api.post<{ data: TermsVersion }>('/admin/terms', { content });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'terms'] }),
  });
}
