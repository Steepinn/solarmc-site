"use client";

import type { ReactNode } from "react";

/** Анимация смены статьи вики: key=pathname → CSS enter каждый раз. */
export function WikiArticleMotion({
  pathname,
  children,
}: {
  pathname: string;
  children: ReactNode;
}) {
  return (
    <div key={pathname} className="wiki-article-enter">
      {children}
    </div>
  );
}
