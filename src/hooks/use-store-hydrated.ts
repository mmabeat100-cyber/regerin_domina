import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";

/** true une fois l'état localStorage appliqué au store. */
export function useStoreHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => {
    if (useStore.persist.hasHydrated()) setH(true);
    return useStore.persist.onFinishHydration(() => setH(true));
  }, []);
  return h;
}
