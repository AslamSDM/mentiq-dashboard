/**
 * Hook to get the effective project ID
 * Returns impersonated project ID if set, otherwise selected project ID
 */

import { useStore } from "@/lib/store";

export function useEffectiveProjectId() {
  const { selectedProjectId, impersonatedProjectId } = useStore();
  return impersonatedProjectId || selectedProjectId;
}

export function useIsImpersonating() {
  const { impersonatedProjectId } = useStore();
  return !!impersonatedProjectId;
}

export function useImpersonationInfo() {
  const {
    impersonatedProjectId,
    impersonatedProjectName,
    impersonatedUserEmail,
    clearImpersonation,
  } = useStore();

  return {
    isImpersonating: !!impersonatedProjectId,
    projectId: impersonatedProjectId,
    projectName: impersonatedProjectName,
    userEmail: impersonatedUserEmail,
    clearImpersonation,
  };
}
