"use client";

import { useState } from "react";
import { newsletterAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setMessage(null);
    const result = await newsletterAction(formData);
    setPending(false);
    if (result?.error) {
      setMessage(result.error);
    } else {
      setMessage("Thanks for subscribing!");
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <Input
        name="email"
        type="email"
        required
        placeholder="Enter your email"
        className="bg-white text-slate-900"
      />
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Subscribing..." : "Subscribe"}
      </Button>
      {message && <p className="text-sm text-red-100 sm:col-span-2">{message}</p>}
    </form>
  );
}
