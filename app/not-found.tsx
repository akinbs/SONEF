import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button-link";
import { PageIntro } from "@/components/ui/page-intro";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <PageIntro title="Sayfa bulunamadı">
      <p>Aradığınız sayfa taşınmış ya da kaldırılmış olabilir.</p>
      <p style={{ marginTop: "1.5rem" }}>
        <ButtonLink href="/" variant="primary">
          Ana sayfaya dön
        </ButtonLink>
      </p>
    </PageIntro>
  );
}
