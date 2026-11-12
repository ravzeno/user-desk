import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { queryClient } from "@/lib/query-client";
import { router } from "@/routes";
import { ServiceUnavailable } from "@/components/service/ServiceUnavailable";
import { ToastProvider } from "@/components/ui";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
        <ServiceUnavailable />
      </ToastProvider>
    </QueryClientProvider>
  );
}
