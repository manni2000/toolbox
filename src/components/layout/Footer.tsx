import { Link } from "react-router-dom";
import { Wrench, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Wrench className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Tool<span className="gradient-text">Box</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Free online tools for your daily needs. No signup required.
            </p>
          </div>

          {/* Popular Tools */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Popular Tools</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/tools/image/qr-generator" className="text-sm text-muted-foreground hover:text-foreground">
                  QR Code Generator
                </Link>
              </li>
              <li>
                <Link to="/tools/text/word-counter" className="text-sm text-muted-foreground hover:text-foreground">
                  Word Counter
                </Link>
              </li>
              <li>
                <Link to="/tools/security/password-generator" className="text-sm text-muted-foreground hover:text-foreground">
                  Password Generator
                </Link>
              </li>
              <li>
                <Link to="/tools/dev/json-formatter" className="text-sm text-muted-foreground hover:text-foreground">
                  JSON Formatter
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/categories" className="text-sm text-muted-foreground hover:text-foreground">
                  Image Tools
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-sm text-muted-foreground hover:text-foreground">
                  Text Tools
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-sm text-muted-foreground hover:text-foreground">
                  Security Tools
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-sm text-muted-foreground hover:text-foreground">
                  Developer Tools
                </Link>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ToolBox. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            Made with <Heart className="h-4 w-4 text-destructive" /> for everyone
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
