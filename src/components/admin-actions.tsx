"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteProduct, markSold, markAvailable } from "@/app/actions/admin";

export function DeleteButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="destructive"
      size="xs"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this product? This cannot be undone.")) return;
        start(async () => {
          await deleteProduct(id);
        });
      }}
    >
      Delete
    </Button>
  );
}

export function SoldToggle({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  if (status === "SOLD") {
    return (
      <Button
        variant="outline"
        size="xs"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await markAvailable(id);
          })
        }
      >
        Undo sold
      </Button>
    );
  }
  return (
    <Button
      variant="secondary"
      size="xs"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await markSold(id);
        })
      }
    >
      Mark sold
    </Button>
  );
}