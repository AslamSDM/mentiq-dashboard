import React from "react";

interface PageShellProps {
  breadcrumb?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function PageShell({
  breadcrumb,
  title,
  description,
  action,
  children,
}: PageShellProps) {
  return (
    <div className="min-h-full" style={{ backgroundColor: "#F8F7F4" }}>
      {/* Page header */}
      <div
        className="sticky top-0 z-10 border-b px-6 py-0 md:px-8"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E7E5E4" }}
      >
        <div className="flex items-center justify-between h-[56px]">
          <div>
            {breadcrumb && (
              <p className="text-[0.7rem] mb-0.5" style={{ color: "#A8A29E" }}>
                {breadcrumb}
              </p>
            )}
            <h1
              className="text-[1.05rem] font-semibold tracking-tight"
              style={{ color: "#1C1917", letterSpacing: "-0.015em" }}
            >
              {title}
            </h1>
          </div>
          {action && <div>{action}</div>}
        </div>
      </div>

      {/* Page content */}
      <div className="px-6 py-7 md:px-8">
        {description && (
          <p className="text-[0.875rem] mb-6" style={{ color: "#78716C" }}>
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
