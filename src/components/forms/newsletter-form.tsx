"use client";

import { useState } from "react";
import { newsletterAction } from "@/app/actions/auth";

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
    <div>
      <form action={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          name="email"
          type="email"
          required
          placeholder="Enter your email"
          className="h-12 w-full rounded-full border-0 bg-white px-5 text-sm text-slate-900 shadow-sm outline-none ring-2 ring-transparent placeholder:text-slate-400 focus:ring-white/60"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-12 shrink-0 rounded-full bg-slate-900 px-7 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-70"
        >
          {pending ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      {message && <p className="mt-3 text-sm font-medium text-white">{message}</p>}
    </div>
  );
}
