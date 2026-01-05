"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  trigger: React.ReactNode;
};

export function LoginModal({ trigger }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <div>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">Please login or sign up to continue.</p>
          <div className="flex gap-2">
            <Button asChild><a href="/auth/login">Login</a></Button>
            <Button variant="outline" asChild><a href="/auth/register">Register</a></Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


