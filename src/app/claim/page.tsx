import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { ClaimLocationPageView } from "@/components/claim/ClaimLocationPageView";

export const metadata: Metadata = {
  title: "Claim a location | Dharma Atlas",
  description:
    "Request to manage or update a listed center on Dharma Atlas.",
};

export default async function ClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ place?: string }>;
}) {
  const { place: placeId } = await searchParams;

  const session = await getSession();
  if (!session) {
    const target = placeId
      ? `/claim?place=${encodeURIComponent(placeId)}`
      : "/claim";
    redirect(`/login?redirect=${encodeURIComponent(target)}`);
  }

  let initialPlaceName: string | undefined;

  if (placeId) {
    const { getPlaceById } = await import("@/lib/data/places");
    const place = await getPlaceById(placeId);
    initialPlaceName = place?.name;
  }

  return (
    <ClaimLocationPageView
      initialPlaceId={placeId}
      initialPlaceName={initialPlaceName}
    />
  );
}
