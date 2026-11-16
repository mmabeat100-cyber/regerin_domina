import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { queryClient } from "@/lib/queryClient";
import type { Studio } from "@/types";

const QUERY_KEY = ["studios"] as const;

async function fetchStudios(): Promise<Studio[]> {
  const { data, error } = await supabase.from("studios").select("data");
  if (error) throw error;
  return (data ?? []).map((row) => row.data as unknown as Studio);
}

export const useStudiosQuery = () =>
  useQuery({ queryKey: QUERY_KEY, queryFn: fetchStudios, staleTime: 30_000 });

export const useStudios = () => useStudiosQuery().data ?? [];

export const studioService = {
  async save(st: Studio) {
    const { error } = await supabase
      .from("studios")
      .upsert({ id: st.id, data: st as unknown as Json });
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  },
  async remove(id: string) {
    const { error } = await supabase.from("studios").delete().eq("id", id);
    if (error) throw error;

    // Clear the dangling reference on any listing that pointed at this studio.
    const { data: orphaned, error: findError } = await supabase
      .from("listings")
      .select("id, data")
      .contains("data", { studioId: id });
    if (!findError && orphaned) {
      await Promise.all(
        orphaned.map((row) => {
          const next = { ...(row.data as Record<string, unknown>) };
          delete next.studioId;
          return supabase
            .from("listings")
            .update({ data: next as unknown as Json })
            .eq("id", row.id);
        }),
      );
      await queryClient.invalidateQueries({ queryKey: ["listings"] });
    }

    await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  },
};
