import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OntologyRuntimeProvider } from "@/components/explore/OntologyRuntimeProvider";
import { ManageShell } from "@/components/manage/ManageShell";
import { getSession } from "@/lib/auth-server";
import { getOntologySnapshot } from "@/lib/data/ontology";
import { serializeOntologySnapshot } from "@/lib/ontology/build-snapshot";

export const metadata: Metadata = {
  title: "Manage | Dharma Atlas",
  robots: { index: false, follow: false },
};

export default async function ManageLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=%2Fmanage");
  }

  const ontology = await getOntologySnapshot();

  return (
    <OntologyRuntimeProvider ontology={serializeOntologySnapshot(ontology)}>
      <ManageShell>{children}</ManageShell>
    </OntologyRuntimeProvider>
  );
}
