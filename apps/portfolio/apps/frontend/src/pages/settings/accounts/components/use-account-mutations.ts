import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@fb/ui/components/ui/use-toast";
import { createAccount, updateAccount, deleteAccount, logger } from "@/adapters";
import { shouldInvalidateAfterPortfolioUpdate } from "@/lib/query-invalidation";

interface UseAccountMutationsProps {
  onSuccess?: () => void;
}

export function useAccountMutations({ onSuccess = () => undefined }: UseAccountMutationsProps) {
  const queryClient = useQueryClient();

  const handleSuccess = (message?: string) => {
    onSuccess();
    if (message) {
      toast({ title: message, variant: "success" });
    }
  };

  // Account create/update/delete changes portfolio totals (and including/excluding
  // via isArchived/isActive changes holdings), so invalidate everything except the
  // cloud/broker/subscription queries — the same rule the portfolio-update path uses.
  const invalidateAccountDependentQueries = () => {
    queryClient.invalidateQueries({
      predicate: (query) => shouldInvalidateAfterPortfolioUpdate(query.queryKey),
    });
  };

  const handleError = (action: string, error?: unknown) => {
    if (error instanceof Error && error.message.startsWith("IPS")) {
      toast({ title: "Investment Policy Statement requires attention", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: `Uh oh! Something went wrong ${action} this account.`,
      description: "Please try again or report an issue if the problem persists.",
      variant: "destructive",
    });
  };

  const createAccountMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      handleSuccess("Account created successfully.");
      invalidateAccountDependentQueries();
    },
    onError: (e) => {
      logger.error(`Error creating account: ${e}`);
      handleError("creating", e);
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: updateAccount,
    onSuccess: () => {
      handleSuccess();
      invalidateAccountDependentQueries();
    },
    onError: (e) => {
      logger.error(`Error updating account: ${e}`);
      handleError("updating", e);
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      handleSuccess();
      invalidateAccountDependentQueries();
    },
    onError: (e) => {
      logger.error(`Error deleting account: ${e}`);
      handleError("deleting", e);
    },
  });

  return {
    createAccountMutation,
    updateAccountMutation,
    deleteAccountMutation,
  };
}
