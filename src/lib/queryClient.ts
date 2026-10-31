import { QueryClient } from "@tanstack/react-query";

/** Single shared instance so non-component code (services) can invalidate queries too. */
export const queryClient = new QueryClient();
