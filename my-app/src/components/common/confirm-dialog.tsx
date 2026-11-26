"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// 되묻는 창. 열림 상태는 부르는 쪽이 들고 있는다(open, onOpenChange).
// 위 단추(노랑)는 그대로 머무는 쪽, 아래 단추(흰색)는 실행하는 쪽이다.

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  stayLabel,
  goLabel,
  onGo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
  stayLabel: string;
  goLabel: string;
  onGo: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader className="place-items-start text-left">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{body}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-col">
          <AlertDialogCancel variant="cta" size="touch">
            {stayLabel}
          </AlertDialogCancel>
          <AlertDialogAction variant="outline" size="touch" onClick={onGo}>
            {goLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
