import { useState } from "react";

import type { Option } from "~/components/ui/custom/autocomplete-input";
import { AutoComplete } from "~/components/ui/custom/autocomplete-input";

const FRAMEWORKS = [
  {
    value: "next.js",
    label: "Next.js",
    type: "framework",
    sublabel:
      "Next.js is a React framework for building server-side rendered (SSR) web applications.",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
    type: "framework",
    sublabel:
      "SvelteKit is a framework for building server-side rendered (SSR) web applications.",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
    type: "framework",
    sublabel:
      "Nuxt.js is a framework for building server-side rendered (SSR) web applications.",
  },
  {
    value: "remix",
    label: "Remix",
    type: "framework",
    sublabel:
      "Remix is a framework for building server-side rendered (SSR) web applications.",
  },
  {
    value: "astro",
    label: "Astro",
    type: "framework",
    sublabel:
      "Astro is a framework for building server-side rendered (SSR) web applications.",
  },
  {
    value: "wordpress",
    label: "WordPress",
    type: "framework",
    sublabel:
      "WordPress is a framework for building server-side rendered (SSR) web applications.",
  },
  {
    value: "express.js",
    label: "Express.js",
    type: "framework",
    sublabel:
      "Express.js is a framework for building server-side rendered (SSR) web applications.",
  },
  {
    value: "nest.js",
    label: "Nest.js",
    type: "framework",
    sublabel:
      "Nest.js is a framework for building server-side rendered (SSR) web applications.",
  },
];

export function AutocompleteExample() {
  const [isLoading, setLoading] = useState(false);
  const [isDisabled, setDisbled] = useState(false);
  const [value, setValue] = useState<Option>();

  return (
    <div className="not-prose mt-8 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center rounded-md border border-stone-200 bg-white px-4 py-2 text-sm font-medium ring-offset-white transition-colors hover:bg-stone-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          onClick={() => setLoading((prev) => !prev)}
        >
          Toggle loading
        </button>
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center rounded-md border border-stone-200 bg-white px-4 py-2 text-sm font-medium ring-offset-white transition-colors hover:bg-stone-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          onClick={() => setDisbled((prev) => !prev)}
        >
          Toggle disabled
        </button>
      </div>
      <AutoComplete
        options={FRAMEWORKS}
        emptyMessage="No results."
        placeholder="Find something"
        isLoading={isLoading}
        onValueChange={setValue}
        value={value}
        disabled={isDisabled}
        createButtonLabel="Create new"
        createIfNotFound={() => {
          console.log("createIfNotFound");
        }}
      />
      <span className="text-sm">
        Current value: {value ? value?.label : "No value selected"}
      </span>
      <span className="text-sm">
        Loading state: {isLoading ? "true" : "false"}
      </span>
      <span className="text-sm">Disabled: {isDisabled ? "true" : "false"}</span>
    </div>
  );
}
