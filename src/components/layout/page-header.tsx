import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actionLabel,
  actionIcon
}: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="page-title">{title}</h1>
        {description ? <p className="page-description">{description}</p> : null}
      </div>
      {actionLabel ? (
        <button className="button" type="button">
          {actionIcon}
          {actionLabel}
        </button>
      ) : null}
    </header>
  );
}
