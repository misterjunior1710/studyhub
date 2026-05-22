import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import StudyHubLogo from "@/components/StudyHubLogo";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50 pb-16 md:pb-0">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <StudyHubLogo className="h-10 w-10 sm:h-11 sm:w-11 transition-transform group-hover:scale-105" />
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                StudyHub™
              </h3>
              <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                Freemium
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Study Smarter, Ace Everything 🎯</p>
            <p className="text-xs text-muted-foreground">
              Free forever core features · Optional{" "}
              <Link to="/pricing" className="underline hover:text-primary">
                Pro upgrade
              </Link>{" "}
              · Multiple AI models built in
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground active:text-primary py-1 inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/questions" className="text-muted-foreground active:text-primary py-1 inline-block">
                  Questions
                </Link>
              </li>
              <li>
                <Link to="/groups" className="text-muted-foreground active:text-primary py-1 inline-block">
                  Study Groups
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground active:text-primary py-1 inline-block">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Your Stuff */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Your Stuff</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/friends" className="text-muted-foreground active:text-primary py-1 inline-block">
                  Friends
                </Link>
              </li>
              <li>
                <Link to="/study" className="text-muted-foreground active:text-primary py-1 inline-block">
                  Study Tools
                </Link>
              </li>
              <li>
                <Link to="/content-generator" className="text-muted-foreground active:text-primary py-1 inline-block">
                  AI Study Tools
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-muted-foreground active:text-primary py-1 inline-block">
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground active:text-primary py-1 inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground active:text-primary py-1 inline-block">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/refund" className="text-muted-foreground active:text-primary py-1 inline-block">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-muted-foreground active:text-primary py-1 inline-block">
                  Need Help?
                </Link>
              </li>
            </ul>
          </div>

          {/* Featured on */}
          <div className="col-span-2 md:col-span-4 space-y-3">
            <h4 className="font-semibold text-foreground">Featured</h4>
            <div className="marquee" aria-label="Featured on">
              {[0, 1].map((dup) => (
                <div className="marquee-track" key={dup} aria-hidden={dup === 1}>
                  <a
                    href="https://startuplibrary.net/startup/44b664fb-2a57-4610-8c3d-96f67a76375a"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors shrink-0"
                    aria-label="Featured on StartupLibrary"
                  >
                    <img
                      src="https://bsewdwaowjwuztpmnbyk.supabase.co/storage/v1/object/public/email-assets/sl-logo-badge.png"
                      alt="StartupLibrary"
                      className="w-6 h-6 rounded"
                      loading="lazy"
                    />
                    <span>StartupLibrary</span>
                  </a>
                  <a
                    href="https://twelve.tools"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                    aria-label="Featured on Twelve Tools"
                  >
                    <img
                      src="https://twelve.tools/badge0-light.svg"
                      alt="Featured on Twelve Tools"
                      width={200}
                      height={54}
                      loading="lazy"
                    />
                  </a>
                  <a
                    href="https://turbo0.com/item/studyhub-tm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                    aria-label="Listed on Turbo0"
                  >
                    <img
                      src="https://img.turbo0.com/badge-listed-dark.svg"
                      alt="Listed on Turbo0"
                      style={{ height: 54, width: "auto" }}
                      loading="lazy"
                    />
                  </a>
                  <a
                    href="https://wired.business"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                    aria-label="Featured on Wired Business"
                  >
                    <img
                      src="https://wired.business/badge0-dark.svg"
                      alt="Featured on Wired Business"
                      width={200}
                      height={54}
                      loading="lazy"
                    />
                  </a>
                  <a
                    href="https://startupfa.me/s/studyhub?utm_source=www.studyhub.world"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                    aria-label="Featured on Startup Fame"
                  >
                    <img
                      src="https://startupfa.me/badges/featured/dark-rounded.webp"
                      alt="StudyHub - Featured on Startup Fame"
                      width={171}
                      height={54}
                      loading="lazy"
                    />
                  </a>
                  <a
                    href="https://fazier.com/launches/www.studyhub.world"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                    aria-label="Featured on Fazier"
                  >
                    <img
                      src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=dark"
                      width={120}
                      alt="Fazier badge"
                      loading="lazy"
                    />
                  </a>
                  <a
                    href="https://huzzler.so/products/YANKqlFcka/studyhub?utm_source=huzzler_product_website&utm_medium=badge&utm_campaign=free_listing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                    aria-label="Featured on Huzzler"
                  >
                    <img
                      alt="Huzzler Embed Badge"
                      src="https://huzzler.so/assets/images/embeddable-badges/featured.png"
                      width="159"
                      height="55"
                      loading="lazy"
                    />
                  </a>
                  <a
                    href="https://www.aidirectori.es"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                    aria-label="AI Directories Badge"
                  >
                    <img
                      src="https://cdn.aidirectori.es/ai-tools/badges/light-mode.png"
                      alt="AI Directories Badge"
                      width={171}
                      height={54}
                      loading="lazy"
                    />
                  </a>
                  <a
                    href="https://ufind.best/products/studyhub-study-smarter-ace-everything?utm_source=ufind.best"
                    target="_blank"
                    rel="noopener"
                    className="shrink-0"
                    aria-label="Featured on ufind.best"
                  >
                    <img
                      src="https://ufind.best/badges/ufind-best-badge-light.svg"
                      alt="Featured on ufind.best"
                      width={150}
                      loading="lazy"
                    />
                  </a>
                  <a href="https://buildvoyage.com/products/studyhub-study-smarter-ace-everything?ref=badge">
                    <img
                      src="https://buildvoyage.com/images/featured_badge.png"
                      alt="Featured on BuildVoyage"
                      width="250"
                    />
                  </a>
                  <a href="https://marketingdb.live" target="_blank" rel="noopener noreferrer nofollow sponsored">
                    <img src="https://marketingdb.live/badge.svg" alt="Listed on MarketingDB" width="190" height="44" />
                  </a>
                  <a
                    href="https://www.foundrlist.com/product/studyhub?utm_source=badge&amp;utm_medium=embed"
                    target="_blank"
                    rel="noopener"
                  >
                    <img
                      src="https://www.foundrlist.com/api/badge/studyhub"
                      alt="Featured on FoundrList"
                      width="150"
                      height="48"
                    />
                  </a>
                  <a href="https://www.scrolllaunch.com/products/studyhub?ref=badge" target="_blank" rel="noopener">
                    <img
                      src="https://www.scrolllaunch.com/api/badge/studyhub?variant=launched&theme=dark"
                      alt="StudyHub™ — Featured on ScrollLaunch"
                      width="220"
                      height="48"
                    />
                  </a>
                  <a
                    href="https://bowora.com/?via=83i1vjmq"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Featured on Bowora"
                    className="shrink-0"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      width: 170,
                      height: 50,
                      backgroundColor: "#000",
                      color: "#fff",
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      padding: "8px 14px",
                      borderRadius: 8,
                      textDecoration: "none",
                      border: "none",
                    }}
                  >
                    <svg
                      width="35"
                      height="35"
                      viewBox="0 0 150 150"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <g transform="translate(31.1875, 18.1874)" fill="#fff">
                        <path d="M87.5343464,15.4046144 C88.0800499,16.2992254 87.7980596,17.4698555 86.9050901,18.0165331 C86.0121207,18.5633415 84.8423829,18.2806539 84.2966794,17.3859122 C81.7117678,13.1474282 78.0968081,9.80172458 73.4648555,7.33755659 L73.4485366,7.32879615 C68.8772902,4.83909213 63.5398394,3.61244746 57.444409,3.61244746 L9.3017365,3.61244746 C7.67506992,3.61244746 6.3960609,3.83953898 5.49238625,4.41819874 L5.45674581,4.4405444 C4.79524344,4.84409996 4.32995935,5.45833757 4.0239476,6.27503287 C3.73947677,7.26368123 3.60644521,8.42777375 3.60644521,9.76432926 L3.60644521,103.544841 C3.60644521,104.950303 3.75631787,106.263062 4.0658545,107.495669 C4.27578065,108.239391 4.6709588,108.810258 5.28428782,109.184211 L5.31979771,109.20657 C6.22347236,109.785151 7.50248138,110.012269 9.12927851,110.012269 L59.1699028,110.012269 C63.7602097,110.012269 68.0783175,109.267239 72.1226597,107.769727 C76.1497692,106.173758 79.6895314,103.98404 82.7378993,101.19469 C83.5107618,100.487317 84.7118318,100.541579 85.4181132,101.315897 C86.1243946,102.090216 86.0708687,103.293142 85.2967007,104.000384 C81.9088999,107.100795 77.9767011,109.539466 73.4985376,111.311429 L73.4602862,111.326073 C68.9979194,112.981273 64.2351545,113.8126 59.1699028,113.8126 L9.12927851,113.8126 C6.62504751,113.8126 4.6896276,113.307371 3.2936448,112.419559 C1.8549718,111.536324 0.878319095,110.227096 0.397499432,108.466901 L0.387969203,108.430944 C0.00649891912,106.918395 -0.1875,105.289999 -0.1875,103.544841 L-0.1875,9.76432926 C-0.1875,7.97589194 0.0187707215,6.42738608 0.409379582,5.11588281 L0.444889478,5.00826015 C1.06187393,3.31376875 2.08082518,2.0552073 3.46675555,1.20522233 C4.8626078,0.317842042 6.79815825,-0.1874 9.3017365,-0.1874 L57.444409,-0.1874 C64.2296714,-0.1874 70.1626962,1.21570871 75.252361,3.98591679 C80.5093922,6.78394907 84.5995579,10.5933023 87.5343464,15.4046144 Z" />
                        <path
                          d="M18.1870648,100.8126 C16.6872227,100.8126 15.520287,100.518396 14.687172,99.9299894 C13.9369898,99.4256779 13.4369118,98.6692106 13.1873299,97.6604566 C12.9372256,96.567738 12.8125,95.3909238 12.8125,94.130538 L12.8125,19.2423752 C12.8125,17.9815965 12.9372256,16.8888779 13.1873299,15.9647434 C13.5207588,14.9559894 14.0622378,14.1995221 14.8124201,13.6952106 C15.6459269,13.1068035 16.8124708,12.8126 18.3128353,12.8126 L53.1886048,12.8126 C57.8554332,12.8126 61.9387285,13.8632708 65.4386213,15.9647434 C69.0219693,18.066085 71.8139951,20.9235009 73.8135234,24.537515 C75.8135741,28.1519222 76.7720677,32.1020566 76.688482,36.3885735 C76.7720677,38.5740106 76.5218328,40.7170071 75.9382997,42.8183487 C75.3548972,44.9198213 74.4798587,46.8946265 73.3134454,48.7439434 C72.2298343,50.5090336 70.8552402,51.9800514 69.188096,53.1563416 C71.438251,54.5853115 73.3548465,56.4346284 74.9381438,58.7036372 C76.5213104,60.9731699 77.729386,63.4943345 78.5626316,66.2681788 C79.3971832,69.0416301 79.8125,71.9416177 79.8125,74.9670938 C79.7302203,78.5811079 79.0628402,81.9848831 77.8129717,85.1790743 C76.5631033,88.2891699 74.771364,91.0204424 72.4380151,93.3735468 C70.1045356,95.7271752 67.3963567,97.576361 64.3126949,98.9208424 C61.2291637,100.181752 57.9374518,100.8126 54.437559,100.8126 L18.186673,100.8126 L18.1870648,100.8126 Z"
                          fillRule="nonzero"
                        />
                      </g>
                    </svg>
                    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                      <span style={{ fontSize: 10, fontWeight: "normal" }}>Featured on</span>
                      <span style={{ fontSize: 16, fontWeight: 700 }}>Bowora</span>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-sm text-muted-foreground text-center sm:text-left space-y-1">
            <p>© {new Date().getFullYear()} StudyHub™ — Study Smarter, Ace Everything. All rights reserved.</p>
            <p>
              Built and maintained by the StudyHub Team ·{" "}
              <a href="mailto:studyhub.community.web@gmail.com" className="underline hover:text-primary">
                studyhub.community.web@gmail.com
              </a>
            </p>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Built with <Heart className="h-4 w-4 text-destructive" /> by students, for students
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
