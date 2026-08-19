import type { ReactNode } from "react";

type PricingCardProps = {
  name: string;
  price: string;
  priceSuffix?: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  cta: ReactNode;
};

export default function PricingCard({ name, price, priceSuffix, features, highlighted, badge, cta }: PricingCardProps) {
  return (
    <div
      className={`relative bg-white rounded-lg shadow-sm border p-6 flex flex-col gap-4 dark:bg-gray-800 ${
        highlighted ? "border-blue-600 dark:border-blue-500" : "border-gray-200 dark:border-gray-700"
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
          {badge}
        </span>
      )}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{name}</h2>
        <p className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-semibold text-gray-900 dark:text-gray-50">{price}</span>
          {priceSuffix && <span className="text-sm text-gray-500 dark:text-gray-400">{priceSuffix}</span>}
        </p>
      </div>

      <ul className="flex-1 space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      {cta}
    </div>
  );
}
