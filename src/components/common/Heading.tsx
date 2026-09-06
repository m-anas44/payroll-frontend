"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

export interface HeadingProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon | React.ReactNode;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export default function Heading({
  title,
  subtitle,
  description,
  icon: Icon,
  actions,
  badge,
  className = "",
}: HeadingProps) {
  const subContent = subtitle || description;

  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    const Component = Icon as React.ElementType;
    return <Component className="h-6 w-6 text-blue-600 shrink-0" />;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1 ${className}`}
    >
      <div className="flex items-start gap-3">
        {renderIcon()}
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {title}
            </h1>
            {badge && (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                {badge}
              </span>
            )}
          </div>
          {subContent && (
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              {subContent}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-end">
          {actions}
        </div>
      )}
    </div>
  );
}
