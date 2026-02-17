import { EditSquadPageClient } from "@/components/squad/edit_squad_page_client";

export default async function EditSquadPage({
  params,
}: {
  params: Promise<{ squadId: string }>;
}) {
  const { squadId } = await params;
  return <EditSquadPageClient squadId={squadId} />;
}
