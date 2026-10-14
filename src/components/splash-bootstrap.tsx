/** Синхронно в <head> — до первой отрисовки страницы. */
export const SPLASH_BOOTSTRAP_SCRIPT = `(function(){
  var path=location.pathname;
  if(path.indexOf("/launcher")===0)return;
  var q=new URLSearchParams(location.search);
  if(q.get("login")==="ok"||q.get("login")==="fail"){
    document.documentElement.classList.add("splash-pending");
    return;
  }
  try{
    if(sessionStorage.getItem("solar-splash-seen")!=="1"){
      document.documentElement.classList.add("splash-pending");
    }
  }catch(e){
    document.documentElement.classList.add("splash-pending");
  }
})();`;

export function SplashBootstrapShell() {
  return (
    <div
      id="splash-bootstrap"
      className="site-splash site-splash--bootstrapped"
      aria-hidden="true"
    >
      <div className="site-splash__bg" aria-hidden>
        <span className="site-splash__orb site-splash__orb--a" />
        <span className="site-splash__orb site-splash__orb--b" />
        <span className="site-splash__orb site-splash__orb--c" />
        <div className="splash-sun" />
        <div className="splash-rays" />
      </div>
      <div className="site-splash__card site-splash__card--alive">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand-face.png"
          alt=""
          width={132}
          height={132}
          className="site-splash__logo brand-face"
        />
        <p className="font-display site-splash__brand neon-text">SOLAR</p>
        <p className="site-splash__sub">зажигаем Season 3</p>
      </div>
    </div>
  );
}

export function clearSplashBootstrap() {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove("splash-pending");
  document.getElementById("splash-bootstrap")?.remove();
}
