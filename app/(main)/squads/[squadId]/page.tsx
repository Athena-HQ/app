import SquadDetailPageClient from "@/components/squad/squad_detail_page_client";

export default async function SquadDetailPage({
  params,
}: {
  params: Promise<{ squadId: string }>;
}) {
  const { squadId } = await params;
  return <SquadDetailPageClient squadId={squadId} />;
}
