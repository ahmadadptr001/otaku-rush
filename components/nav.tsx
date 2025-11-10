import Link from "next/link";
import { EnvVarWarning } from "./env-var-warning";
import { AuthButton } from "./auth-button";
import { hasEnvVars } from "@/lib/utils";

export default function Nav() {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl gap-10 flex justify-between items-center p-3 px-5 text-lg">
        <div className="flex gap-5 items-center font-extrabold">
          <Link href={'/'}>
            OTAKU
            <span className="bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-[19px] text-transparent">
              RUSH
            </span>
          </Link>
        </div>
        {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
      </div>
    </nav>
  );
}
