import { useRef, useState } from "react";
import { toast } from "sonner";
import { Mail, UploadCloud, X } from "lucide-react";
import { useT } from "@/i18n";
import { SITE } from "@/config/site";
import { supabase } from "@/integrations/supabase/client";
import { pendingProfile, profileService } from "@/services/profiles";
import { useCatalog } from "@/services/catalogs";
import { useCountries } from "@/services/geo";
import { slugify } from "@/data/profiles";
import { ACCEPTED, MAX_IMAGE_MB, processImage } from "@/lib/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Media } from "@/components/site/Media";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

const GALLERY_LIMIT = 4;

function emptyForm() {
  return {
    displayName: "",
    category: "",
    country: "",
    city: "",
    email: "",
    phone: "",
    headline: "",
  };
}

export function SignupDialog({ triggerClassName }: { triggerClassName?: string }) {
  const t = useT();
  const categories = useCatalog("category");
  const countries = useCountries();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [avatar, setAvatar] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const avatarInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  const cities = countries.find((c) => c.code === form.country)?.cities ?? [];

  const reset = () => {
    setForm(emptyForm());
    setAvatar(null);
    setGallery([]);
    setSent(false);
  };

  const onAvatarPick = async (file?: File) => {
    if (!file) return;
    try {
      setAvatar(await processImage(file, true));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  };

  const onGalleryPick = async (files: FileList | null) => {
    if (!files) return;
    const out: string[] = [];
    for (const f of Array.from(files).slice(0, GALLERY_LIMIT - gallery.length)) {
      try {
        out.push(await processImage(f, true));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : String(e));
      }
    }
    if (out.length) setGallery((g) => [...g, ...out]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.displayName.trim() ||
      !form.category ||
      !form.country ||
      !form.city ||
      !form.email.trim() ||
      !avatar
    ) {
      toast.error(t.signupForm.missingRequired);
      return;
    }
    setSubmitting(true);
    try {
      const base = pendingProfile();
      const profile = {
        ...base,
        displayName: form.displayName.trim(),
        slug: `${slugify(form.displayName)}-${base.id.split("-")[1]}`,
        category: form.category,
        headline: form.headline.trim(),
        avatar,
        gallery: gallery.length ? gallery : [avatar],
        availability: [{ countryCode: form.country, cities: [form.city], primaryCity: form.city }],
        contact: { email: form.email.trim(), phone: form.phone.trim() || undefined },
      };
      await profileService.save(profile);
      try {
        await supabase.functions.invoke("notify-admin-signup", {
          body: {
            displayName: profile.displayName,
            email: profile.contact.email,
            phone: profile.contact.phone,
            city: form.city,
          },
        });
      } catch {
        // Submission already succeeded; the admin will still see it in the back-office even if the email failed.
      }
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.signupForm.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="gold" className={triggerClassName}>
          {t.nav.signup}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto rounded-xl border-gold/20 bg-card shadow-elegant">
        {sent ? (
          <div className="space-y-4 py-6 text-center">
            <Mail className="mx-auto h-10 w-10 text-gold" aria-hidden />
            <h2 className="font-serif text-2xl">{t.signupForm.successTitle}</h2>
            <p className="text-sm text-muted-foreground">{t.signupForm.successText}</p>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t.signupForm.close}
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl font-normal">
                {t.signup.title}
              </DialogTitle>
              <DialogDescription>{t.signup.text}</DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="su-name">{t.signupForm.displayName} *</Label>
                <Input
                  id="su-name"
                  value={form.displayName}
                  onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                  maxLength={80}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-cat">{t.signupForm.category} *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger id="su-cat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="su-country">{t.signupForm.country} *</Label>
                  <Select
                    value={form.country}
                    onValueChange={(v) => setForm((f) => ({ ...f, country: v, city: "" }))}
                  >
                    <SelectTrigger id="su-country">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-city">{t.signupForm.city} *</Label>
                  <Select
                    value={form.city}
                    onValueChange={(v) => setForm((f) => ({ ...f, city: v }))}
                    disabled={!form.country}
                  >
                    <SelectTrigger id="su-city">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((c) => (
                        <SelectItem key={c.slug} value={c.slug}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="su-email">{t.signupForm.email} *</Label>
                  <Input
                    id="su-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-phone">{t.signupForm.phone}</Label>
                  <Input
                    id="su-phone"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-headline">{t.signupForm.headline}</Label>
                <Textarea
                  id="su-headline"
                  rows={3}
                  maxLength={140}
                  value={form.headline}
                  onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>{t.signupForm.avatar} *</Label>
                <div className="flex items-center gap-3">
                  <div className="h-20 w-14 shrink-0 overflow-hidden rounded border border-border">
                    {avatar && <Media src={avatar} alt="" />}
                  </div>
                  <input
                    ref={avatarInput}
                    type="file"
                    accept={ACCEPTED.join(",")}
                    className="hidden"
                    onChange={(e) => {
                      onAvatarPick(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => avatarInput.current?.click()}
                  >
                    <UploadCloud /> {avatar ? "—" : "+"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {t.signupForm.uploadHint(MAX_IMAGE_MB)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t.signupForm.gallery}</Label>
                <div className="flex flex-wrap items-center gap-2">
                  {gallery.map((g, i) => (
                    <div
                      key={i}
                      className="relative h-16 w-12 overflow-hidden rounded border border-border"
                    >
                      <Media src={g} alt="" />
                      <button
                        type="button"
                        onClick={() => setGallery((arr) => arr.filter((_, j) => j !== i))}
                        className="absolute right-0 top-0 rounded-bl bg-background/80 p-0.5"
                        aria-label="Remove"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {gallery.length < GALLERY_LIMIT && (
                    <>
                      <input
                        ref={galleryInput}
                        type="file"
                        multiple
                        accept={ACCEPTED.join(",")}
                        className="hidden"
                        onChange={(e) => {
                          onGalleryPick(e.target.files);
                          e.target.value = "";
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => galleryInput.current?.click()}
                      >
                        <UploadCloud />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <Button type="submit" variant="velvet" className="w-full" disabled={submitting}>
                {submitting ? t.signupForm.submitting : t.signupForm.submit}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                {t.signupForm.orEmail}{" "}
                <a href={`mailto:${SITE.adminEmail}`} className="text-gold hover:underline">
                  {SITE.adminEmail}
                </a>
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
