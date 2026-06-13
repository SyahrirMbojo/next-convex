import type { ReactNode } from "react";
import { AuthProvider } from "@/app/auth-provider";
import { ConvexClientProvider } from "@/app/convex-client-provider";
import MainBody from "./main-body";
import { ThemeProvider } from "./theme-provider";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <ConvexClientProvider>
      <AuthProvider>
        <ThemeProvider>
          <MainBody>{children}</MainBody>
        </ThemeProvider>
      </AuthProvider>
    </ConvexClientProvider>
  );
}
