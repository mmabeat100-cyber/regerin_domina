import { createFileRoute, Link } from "@tanstack/react-router";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { useProfileById } from "@/services/profiles";
import { EmptyState } from "@/components/site/Breadcrumbs";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/profils/$id")({
  component: EditProfile,
});

function EditProfile() {
  const { id } = Route.useParams();
  const p = useProfileById(id);
  if (!p) return <EmptyState title="Profil introuvable" action={<Button asChild variant="gold"><Link to="/admin/profils">Retour</Link></Button>} />;
  return <ProfileForm key={p.id} initial={p} />;
}
