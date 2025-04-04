"use client";

import { WelcomeForm } from "./welcome-form";

export const WelcomeClient = () => {
  return (
    <div className="flex min-h-[calc(100vh-250px)] w-full items-center justify-center">
      <div className="mx-auto w-full max-w-5xl rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-800">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to the Atomic Trade platform!
          </h1>

          <p className="text-muted-foreground max-w-lg text-center text-base">
            Let&apos;s get you started by creating your store. This will be used
            to sell your products and services.
          </p>

          <div className="w-full max-w-md pt-4">
            <WelcomeForm />
          </div>
        </div>
      </div>
    </div>
  );
};
