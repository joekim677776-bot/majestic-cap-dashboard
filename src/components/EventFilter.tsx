"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface FilterOption {
  label: string;
  value: string;
}

interface EventFilterProps {
  options: FilterOption[];
  paramName?: string;
}

export function EventFilter({ options, paramName = "type" }: EventFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramName) ?? "ALL";

  function setFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") params.delete(paramName);
    else params.set(paramName, value);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => setFilter(value)}
          className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-all ${
            current === value
              ? "bg-white text-black border-white"
              : "bg-transparent text-white/50 border-white/20 hover:border-white/60 hover:text-white"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
