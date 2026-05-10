"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestMagicLink } from "./actions";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("email", values.email);
      const result = await requestMagicLink(fd);
      if (result.ok) {
        setSent(true);
        toast.success("Check your inbox for a magic link.");
      } else {
        toast.error(result.error);
      }
    });
  };

  if (sent) {
    return (
      <div className="space-y-3" aria-live="polite">
        <p className="text-foreground text-base">
          We&apos;ve sent you a sign-in link. Click it from this device to continue.
        </p>
        <p className="text-muted-foreground text-sm">
          The link expires in one hour. You can close this tab.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@tfoco.com"
          aria-invalid={errors.email ? true : undefined}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-destructive text-sm" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Sending..." : "Send magic link"}
      </Button>
    </form>
  );
}
