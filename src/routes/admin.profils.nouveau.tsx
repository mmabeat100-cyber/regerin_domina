import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { emptyProfile } from "@/services/profiles";

export const Route = createFileRoute("/admin/profils/nouveau")({
  component: NewProfile,
});

function NewProfile() {
  const [initial] = useState(emptyProfile);
  return <ProfileForm initial={initial} isNew />;
}
