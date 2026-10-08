/** Без enter-анимации на весь layout — иначе переходы из меню ощущаются как «долгая загрузка». */
export default function Template({ children }: { children: React.ReactNode }) {
  return children;
}
