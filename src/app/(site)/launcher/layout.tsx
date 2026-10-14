/** Лаунчерный OAuth — без чата и лишнего UI. */
export default function LauncherSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="launcher-flow relative z-[1]">{children}</div>;
}
