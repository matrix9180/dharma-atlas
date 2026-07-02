import { ExplorePageClient } from "@/components/explore/ExplorePageClient";
import { OntologyRuntimeProvider } from "@/components/explore/OntologyRuntimeProvider";
import { getPlaceSummaries } from "@/lib/data/places";
import { getTeacherSummaries } from "@/lib/data/teachers";
import { getOntologySnapshot } from "@/lib/data/ontology";
import { serializeOntologySnapshot } from "@/lib/ontology/build-snapshot";

export const dynamic = "force-dynamic";

export async function ExplorePage() {
  const [places, teachers, ontology] = await Promise.all([
    getPlaceSummaries(),
    getTeacherSummaries(),
    getOntologySnapshot(),
  ]);

  return (
    <OntologyRuntimeProvider ontology={serializeOntologySnapshot(ontology)}>
      <ExplorePageClient places={places} teachers={teachers} />
    </OntologyRuntimeProvider>
  );
}
