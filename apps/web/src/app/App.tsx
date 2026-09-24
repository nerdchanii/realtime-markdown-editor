import { AuthScreen } from "@/features/auth";
import { ProductWorkspaceStatus, ReviewWorkspace } from "@/layouts/workspace-shell";

import { useProductWorkspaceProviders } from "./product-workspace-providers";

export function App() {
  const productWorkspace = useProductWorkspaceProviders();

  if (productWorkspace.status === "unauthenticated") {
    return <AuthScreen apiClient={productWorkspace.apiClient} reload={productWorkspace.reload} />;
  }

  if (productWorkspace.status !== "ready") {
    return <ProductWorkspaceStatus state={productWorkspace} />;
  }

  return <ReviewWorkspace state={productWorkspace} providers={productWorkspace.providers} />;
}
