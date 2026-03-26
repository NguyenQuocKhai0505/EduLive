import { toast } from "sonner";

type ConfirmToastOptions = {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  durationMs?: number;
};

export function confirmWithToast({
  message,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  durationMs = 8000,
}: ConfirmToastOptions): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;

    const settle = (value: boolean) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    toast(message, {
      duration: durationMs,
      action: {
        label: confirmLabel,
        onClick: () => settle(true),
      },
      cancel: {
        label: cancelLabel,
        onClick: () => settle(false),
      },
      onAutoClose: () => settle(false),
      onDismiss: () => settle(false),
    });
  });
}

