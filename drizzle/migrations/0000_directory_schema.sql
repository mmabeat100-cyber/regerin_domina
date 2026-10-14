-- Roles
create type public.app_role as enum ('admin', 'user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- The very first account created becomes the administrator.
create or replace function public.handle_new_user_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'user');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_role after insert on auth.users
  for each row execute function public.handle_new_user_role();

-- Listings (directory profiles)
create table public.listings (
  id text primary key,
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft','published')),
  data jsonb not null,
  updated_at timestamptz not null default now()
);
grant select on public.listings to anon, authenticated;
grant insert, update, delete on public.listings to authenticated;
grant all on public.listings to service_role;
alter table public.listings enable row level security;
create policy "public read published" on public.listings for select to anon, authenticated using (status = 'published' or public.has_role(auth.uid(), 'admin'));
create policy "admin insert" on public.listings for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "admin update" on public.listings for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin delete" on public.listings for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Countries (with nested cities)
create table public.countries (
  code text primary key,
  sort int not null default 0,
  data jsonb not null
);
grant select on public.countries to anon, authenticated;
grant insert, update, delete on public.countries to authenticated;
grant all on public.countries to service_role;
alter table public.countries enable row level security;
create policy "public read" on public.countries for select to anon, authenticated using (true);
create policy "admin write" on public.countries for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Studios
create table public.studios (
  id text primary key,
  data jsonb not null
);
grant select on public.studios to anon, authenticated;
grant insert, update, delete on public.studios to authenticated;
grant all on public.studios to service_role;
alter table public.studios enable row level security;
create policy "public read" on public.studios for select to anon, authenticated using (true);
create policy "admin write" on public.studios for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Catalogs
create table public.catalogs (
  id text primary key,
  type text not null,
  label text not null,
  sort int not null default 0
);
grant select on public.catalogs to anon, authenticated;
grant insert, update, delete on public.catalogs to authenticated;
grant all on public.catalogs to service_role;
alter table public.catalogs enable row level security;
create policy "public read" on public.catalogs for select to anon, authenticated using (true);
create policy "admin write" on public.catalogs for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Reviews
create table public.reviews (
  id text primary key default gen_random_uuid()::text,
  profile_id text not null,
  user_id uuid,
  author_name text not null check (char_length(author_name) between 1 and 60),
  rating int not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 10 and 1000),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
grant select on public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
create policy "read approved or admin" on public.reviews for select to anon, authenticated using (status = 'approved' or public.has_role(auth.uid(), 'admin'));
create policy "signed-in users submit pending reviews" on public.reviews for insert to authenticated with check (user_id = auth.uid() and status = 'pending');
create policy "admin update" on public.reviews for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin delete" on public.reviews for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Seed data
insert into public.listings (id, slug, status, data) values
('p-1', 'lady-seraphine', 'published', '{"id":"p-1","slug":"lady-seraphine","displayName":"Lady Séraphine","category":"cat-1","studioId":"st-1","status":"published","verified":true,"vip":true,"featured":true,"createdAt":"2026-08-22T10:00:00.000Z","updatedAt":"2026-08-22T10:00:00.000Z","age":34,"bodyType":"Mince","heightCm":162,"hairColor":"Noirs","eyeColor":"Verts","smoker":true,"piercings":true,"tattoos":true,"languages":["lang-1","lang-2"],"servesFor":["hommes","couples"],"avatar":"ph:1","gallery":["ph:1","ph:2","ph:3","grad:1"],"availability":[{"countryCode":"FR","cities":["paris","lyon"],"primaryCity":"paris"}],"mode":"both","address":{"street":"Adresse communiquée sur rendez-vous","city":"paris","countryCode":"FR"},"price":{"perHour":300,"currency":"EUR"},"specialOffers":[{"label":"Séance découverte","duration":"45 min","price":240},{"label":"Demi-journée","duration":"4 h","price":900}],"contact":{"phone":"+33 6 00 00 00 10","whatsapp":"+33600000100","email":"lady-seraphine@example.com","website":"https://example.com"},"services":["srv-1","srv-2","srv-3","srv-12"],"equipment":["eq-1","eq-2"],"taboos":["tab-1","tab-2"],"rating":{"average":4.8,"count":12}}'::jsonb),
('p-2', 'maitresse-ombeline', 'published', '{"id":"p-2","slug":"maitresse-ombeline","displayName":"Maîtresse Ombeline","category":"cat-1","status":"published","verified":true,"vip":false,"featured":false,"createdAt":"2026-09-28T10:00:00.000Z","updatedAt":"2026-09-28T10:00:00.000Z","age":41,"bodyType":"Athlétique","heightCm":165,"hairColor":"Bruns","eyeColor":"Bruns","smoker":false,"piercings":false,"tattoos":false,"languages":["lang-1"],"servesFor":["hommes"],"avatar":"ph:3","gallery":["ph:3","ph:2","grad:1","grad:2"],"availability":[{"countryCode":"FR","cities":["marseille"],"primaryCity":"marseille"}],"mode":"recoit","price":{"perHour":250,"currency":"EUR"},"specialOffers":[],"contact":{"phone":"+33 6 00 00 00 11","email":"maitresse-ombeline@example.com","instagram":"maitresse_ombeline"},"services":["srv-3","srv-7","srv-8"],"equipment":["eq-1"],"taboos":["tab-1","tab-4"],"rating":{"average":4.5,"count":6}}'::jsonb),
('p-3', 'comtesse-vespera', 'published', '{"id":"p-3","slug":"comtesse-vespera","displayName":"Comtesse Vespera","category":"cat-2","studioId":"st-2","status":"published","verified":true,"vip":true,"featured":true,"createdAt":"2026-08-02T10:00:00.000Z","updatedAt":"2026-08-02T10:00:00.000Z","age":29,"bodyType":"Pulpeuse","heightCm":168,"hairColor":"Roux","eyeColor":"Bleus","smoker":false,"piercings":false,"tattoos":true,"languages":["lang-1","lang-4","lang-2"],"servesFor":["hommes","femmes","couples"],"avatar":"ph:2","gallery":["ph:2","grad:1","grad:2","grad:3"],"availability":[{"countryCode":"BE","cities":["bruxelles","liege"],"primaryCity":"bruxelles"},{"countryCode":"LU","cities":["luxembourg-ville"]}],"mode":"both","price":{"perHour":280,"currency":"EUR"},"specialOffers":[{"label":"Séance découverte","duration":"45 min","price":224},{"label":"Demi-journée","duration":"4 h","price":840}],"contact":{"phone":"+33 6 00 00 00 12","whatsapp":"+33600000102","email":"comtesse-vespera@example.com"},"services":["srv-5","srv-9","srv-4","srv-11"],"equipment":["eq-6","eq-3"],"taboos":["tab-2"],"rating":{"average":4.9,"count":21}}'::jsonb),
('p-4', 'mistress-aurelia', 'published', '{"id":"p-4","slug":"mistress-aurelia","displayName":"Mistress Aurelia","category":"cat-4","status":"published","verified":false,"vip":false,"featured":false,"createdAt":"2026-09-30T10:00:00.000Z","updatedAt":"2026-09-30T10:00:00.000Z","age":31,"bodyType":"Élancée","heightCm":171,"hairColor":"Blonds","eyeColor":"Noisette","smoker":false,"piercings":true,"tattoos":false,"languages":["lang-2","lang-1"],"servesFor":["hommes","divers"],"avatar":"grad:1","gallery":["grad:1","ph:1","ph:2","ph:3"],"availability":[{"countryCode":"FR","cities":["paris"]}],"mode":"deplace","price":{"perHour":150,"currency":"EUR"},"specialOffers":[],"contact":{"phone":"+33 6 00 00 00 13","email":"mistress-aurelia@example.com","website":"https://example.com"},"services":["srv-10","srv-8","srv-12"],"equipment":[],"taboos":["tab-3"],"rating":{"average":0,"count":0}}'::jsonb),
('p-5', 'docteure-blanche', 'published', '{"id":"p-5","slug":"docteure-blanche","displayName":"Docteure Blanche","category":"cat-5","studioId":"st-1","status":"published","verified":true,"vip":false,"featured":true,"createdAt":"2026-09-16T10:00:00.000Z","updatedAt":"2026-09-16T10:00:00.000Z","age":38,"bodyType":"Mince","heightCm":174,"hairColor":"Châtains","eyeColor":"Verts","smoker":true,"piercings":false,"tattoos":true,"languages":["lang-1","lang-2"],"servesFor":["hommes","couples"],"avatar":"grad:2","gallery":["grad:2","ph:2","ph:3","grad:1"],"availability":[{"countryCode":"FR","cities":["paris","lille"],"primaryCity":"paris"}],"mode":"recoit","price":{"perHour":350,"currency":"EUR"},"specialOffers":[{"label":"Séance découverte","duration":"45 min","price":280},{"label":"Demi-journée","duration":"4 h","price":1050}],"contact":{"phone":"+33 6 00 00 00 14","whatsapp":"+33600000104","email":"docteure-blanche@example.com"},"services":["srv-4","srv-11","srv-12"],"equipment":["eq-5","eq-7"],"taboos":["tab-1","tab-4"],"rating":{"average":4.6,"count":9}}'::jsonb),
('p-6', 'lady-nocturne', 'published', '{"id":"p-6","slug":"lady-nocturne","displayName":"Lady Nocturne","category":"cat-3","status":"published","verified":false,"vip":false,"featured":false,"createdAt":"2026-09-23T10:00:00.000Z","updatedAt":"2026-09-23T10:00:00.000Z","age":27,"bodyType":"Athlétique","heightCm":177,"hairColor":"Noirs","eyeColor":"Bruns","smoker":false,"piercings":false,"tattoos":false,"languages":["lang-1","lang-6"],"servesFor":["hommes","femmes"],"avatar":"ph:3","gallery":["ph:3","grad:1","grad:2","grad:3"],"availability":[{"countryCode":"FR","cities":["bordeaux"]}],"mode":"both","price":{"perHour":200,"currency":"EUR"},"specialOffers":[],"contact":{"phone":"+33 6 00 00 00 15","email":"lady-nocturne@example.com","instagram":"lady_nocturne"},"services":["srv-1","srv-4","srv-6"],"equipment":["eq-3"],"taboos":["tab-2","tab-3"],"rating":{"average":4.2,"count":4}}'::jsonb),
('p-7', 'grafin-isolde', 'published', '{"id":"p-7","slug":"grafin-isolde","displayName":"Gräfin Isolde","category":"cat-1","studioId":"st-3","status":"published","verified":true,"vip":true,"featured":true,"createdAt":"2026-07-03T10:00:00.000Z","updatedAt":"2026-07-03T10:00:00.000Z","age":44,"bodyType":"Pulpeuse","heightCm":162,"hairColor":"Bruns","eyeColor":"Bleus","smoker":false,"piercings":true,"tattoos":true,"languages":["lang-3","lang-1","lang-2"],"servesFor":["hommes","couples"],"avatar":"ph:1","gallery":["ph:1","ph:2","ph:3","grad:1"],"availability":[{"countryCode":"CH","cities":["geneve","lausanne"],"primaryCity":"geneve"}],"mode":"recoit","address":{"street":"Adresse communiquée sur rendez-vous","city":"geneve","countryCode":"CH"},"price":{"perHour":450,"currency":"CHF"},"specialOffers":[{"label":"Séance découverte","duration":"45 min","price":360},{"label":"Demi-journée","duration":"4 h","price":1350}],"contact":{"phone":"+33 6 00 00 00 16","whatsapp":"+33600000106","email":"grafin-isolde@example.com","website":"https://example.com"},"services":["srv-1","srv-2","srv-3","srv-7","srv-12"],"equipment":["eq-1","eq-4","eq-2"],"taboos":["tab-1","tab-4"],"rating":{"average":4.9,"count":17}}'::jsonb),
('p-8', 'madame-celeste', 'published', '{"id":"p-8","slug":"madame-celeste","displayName":"Madame Céleste","category":"cat-2","status":"published","verified":true,"vip":false,"featured":false,"createdAt":"2026-09-26T10:00:00.000Z","updatedAt":"2026-09-26T10:00:00.000Z","age":36,"bodyType":"Élancée","heightCm":165,"hairColor":"Roux","eyeColor":"Noisette","smoker":false,"piercings":false,"tattoos":false,"languages":["lang-1"],"servesFor":["hommes"],"avatar":"grad:3","gallery":["grad:3","ph:2","ph:3","grad:1"],"availability":[{"countryCode":"CH","cities":["lausanne"]},{"countryCode":"FR","cities":["lyon"]}],"mode":"both","price":{"perHour":380,"currency":"CHF"},"specialOffers":[],"contact":{"phone":"+33 6 00 00 00 17","email":"madame-celeste@example.com"},"services":["srv-5","srv-6","srv-9"],"equipment":["eq-6"],"taboos":["tab-2"],"rating":{"average":4.4,"count":5}}'::jsonb),
('p-9', 'lady-morgana', 'published', '{"id":"p-9","slug":"lady-morgana","displayName":"Lady Morgana","category":"cat-1","status":"published","verified":false,"vip":false,"featured":false,"createdAt":"2026-09-09T10:00:00.000Z","updatedAt":"2026-09-09T10:00:00.000Z","age":33,"bodyType":"Mince","heightCm":168,"hairColor":"Blonds","eyeColor":"Verts","smoker":true,"piercings":false,"tattoos":true,"languages":["lang-1","lang-4"],"servesFor":["hommes","divers"],"avatar":"ph:3","gallery":["ph:3","grad:1","grad:2","grad:3"],"availability":[{"countryCode":"BE","cities":["liege"]}],"mode":"recoit","price":{"perHour":220,"currency":"EUR"},"specialOffers":[{"label":"Séance découverte","duration":"45 min","price":176},{"label":"Demi-journée","duration":"4 h","price":660}],"contact":{"phone":"+33 6 00 00 00 18","whatsapp":"+33600000108","email":"lady-morgana@example.com"},"services":["srv-3","srv-7","srv-1"],"equipment":["eq-1"],"taboos":["tab-1"],"rating":{"average":3.9,"count":3}}'::jsonb),
('p-10', 'duchesse-lilith', 'published', '{"id":"p-10","slug":"duchesse-lilith","displayName":"Duchesse Lilith","category":"cat-6","status":"published","verified":true,"vip":true,"featured":false,"createdAt":"2026-09-19T10:00:00.000Z","updatedAt":"2026-09-19T10:00:00.000Z","age":39,"bodyType":"Athlétique","heightCm":171,"hairColor":"Châtains","eyeColor":"Bruns","smoker":false,"piercings":true,"tattoos":false,"languages":["lang-1","lang-2","lang-3"],"servesFor":["couples","divers"],"avatar":"ph:2","gallery":["ph:2","ph:1","ph:3","grad:1"],"availability":[{"countryCode":"LU","cities":["luxembourg-ville"]},{"countryCode":"BE","cities":["bruxelles"]}],"mode":"deplace","price":{"perHour":500,"currency":"EUR"},"specialOffers":[],"contact":{"phone":"+33 6 00 00 00 19","email":"duchesse-lilith@example.com","website":"https://example.com","instagram":"duchesse_lilith"},"services":["srv-4","srv-12","srv-5"],"equipment":[],"taboos":["tab-2","tab-3"],"rating":{"average":5,"count":7}}'::jsonb),
('p-11', 'miss-garance', 'published', '{"id":"p-11","slug":"miss-garance","displayName":"Miss Garance","category":"cat-3","status":"published","verified":false,"vip":false,"featured":false,"createdAt":"2026-09-29T10:00:00.000Z","updatedAt":"2026-09-29T10:00:00.000Z","age":26,"bodyType":"Pulpeuse","heightCm":174,"hairColor":"Noirs","eyeColor":"Bleus","smoker":false,"piercings":false,"tattoos":true,"languages":["lang-1","lang-4"],"servesFor":["hommes","femmes"],"avatar":"grad:1","gallery":["grad:1","ph:2","ph:3","grad:2"],"availability":[{"countryCode":"FR","cities":["lille"]},{"countryCode":"BE","cities":["bruxelles"]}],"mode":"both","price":{"perHour":180,"currency":"EUR"},"specialOffers":[{"label":"Séance découverte","duration":"45 min","price":144},{"label":"Demi-journée","duration":"4 h","price":540}],"contact":{"phone":"+33 6 00 00 00 20","whatsapp":"+33600000110","email":"miss-garance@example.com"},"services":["srv-6","srv-4","srv-9"],"equipment":[],"taboos":["tab-3"],"rating":{"average":4.1,"count":2}}'::jsonb),
('p-12', 'lady-viviane', 'published', '{"id":"p-12","slug":"lady-viviane","displayName":"Lady Viviane","category":"cat-1","status":"published","verified":true,"vip":false,"featured":false,"createdAt":"2026-09-01T10:00:00.000Z","updatedAt":"2026-09-01T10:00:00.000Z","age":42,"bodyType":"Élancée","heightCm":177,"hairColor":"Bruns","eyeColor":"Noisette","smoker":false,"piercings":false,"tattoos":false,"languages":["lang-1","lang-5"],"servesFor":["hommes"],"avatar":"ph:1","gallery":["ph:1","grad:1","grad:2","grad:3"],"availability":[{"countryCode":"FR","cities":["lyon"]}],"mode":"recoit","price":{"perHour":270,"currency":"EUR"},"specialOffers":[],"contact":{"phone":"+33 6 00 00 00 21","email":"lady-viviane@example.com"},"services":["srv-2","srv-1","srv-8"],"equipment":["eq-4","eq-1"],"taboos":["tab-1"],"rating":{"average":4.7,"count":8}}'::jsonb),
('p-13', 'signora-amara', 'published', '{"id":"p-13","slug":"signora-amara","displayName":"Signora Amara","category":"cat-2","studioId":"st-3","status":"published","verified":false,"vip":false,"featured":false,"createdAt":"2026-10-01T10:00:00.000Z","updatedAt":"2026-10-01T10:00:00.000Z","age":35,"bodyType":"Mince","heightCm":162,"hairColor":"Roux","eyeColor":"Verts","smoker":true,"piercings":true,"tattoos":true,"languages":["lang-5","lang-1","lang-2"],"servesFor":["hommes","couples"],"avatar":"grad:2","gallery":["grad:2","ph:1","ph:2","ph:3"],"availability":[{"countryCode":"CH","cities":["geneve"]}],"mode":"recoit","address":{"street":"Adresse communiquée sur rendez-vous","city":"geneve","countryCode":"CH"},"price":{"perHour":400,"currency":"CHF"},"specialOffers":[{"label":"Séance découverte","duration":"45 min","price":320},{"label":"Demi-journée","duration":"4 h","price":1200}],"contact":{"phone":"+33 6 00 00 00 22","whatsapp":"+33600000112","email":"signora-amara@example.com","website":"https://example.com"},"services":["srv-5","srv-6","srv-3"],"equipment":["eq-6","eq-7"],"taboos":["tab-2"],"rating":{"average":0,"count":0}}'::jsonb),
('p-14', 'maitresse-iris', 'draft', '{"id":"p-14","slug":"maitresse-iris","displayName":"Maîtresse Iris","category":"cat-4","status":"draft","verified":false,"vip":false,"featured":false,"createdAt":"2026-09-13T10:00:00.000Z","updatedAt":"2026-09-13T10:00:00.000Z","age":30,"bodyType":"Athlétique","heightCm":165,"hairColor":"Blonds","eyeColor":"Bruns","smoker":false,"piercings":false,"tattoos":false,"languages":["lang-1"],"servesFor":["hommes","femmes","divers"],"avatar":"grad:3","gallery":["grad:3","ph:2","ph:3","grad:1"],"availability":[{"countryCode":"FR","cities":["marseille","bordeaux"],"primaryCity":"marseille"}],"mode":"deplace","price":{"perHour":160,"currency":"EUR"},"specialOffers":[],"contact":{"phone":"+33 6 00 00 00 23","email":"maitresse-iris@example.com","instagram":"maitresse_iris"},"services":["srv-10","srv-12"],"equipment":[],"taboos":["tab-3"],"rating":{"average":4.3,"count":3}}'::jsonb);

update public.listings set data = data || jsonb_build_object(
  'headline', 'Une approche exigeante, bienveillante et parfaitement discrète.',
  'descriptionFr', (data->>'displayName') || E' vous accueille dans un cadre élégant et soigné, où chaque rencontre se prépare avec attention. Le respect des limites, la communication préalable et la confidentialité sont au cœur de sa pratique.\n\nAprès un premier échange, elle définit avec vous un déroulé sur mesure, adapté à votre expérience. Les débutants comme les initiés sont les bienvenus. Tenue correcte et ponctualité appréciées.\n\nLes demandes se font uniquement par les moyens de contact indiqués, au minimum 24 h à l''avance.',
  'descriptionEn', (data->>'displayName') || E' welcomes you in an elegant and refined setting where every meeting is carefully prepared. Respect for limits, prior communication and confidentiality are at the heart of her practice.\n\nAfter a first exchange, she designs a tailored session suited to your experience. Beginners and experienced guests alike are welcome.'
);

insert into public.countries (code, sort, data) values
('FR', 0, '{"code":"FR","slug":"france","name":"France","currency":"EUR","cities":[{"slug":"paris","name":"Paris","countryCode":"FR","popular":true},{"slug":"lyon","name":"Lyon","countryCode":"FR","popular":true},{"slug":"marseille","name":"Marseille","countryCode":"FR","popular":true},{"slug":"bordeaux","name":"Bordeaux","countryCode":"FR","popular":false},{"slug":"lille","name":"Lille","countryCode":"FR","popular":false}]}'::jsonb),
('BE', 1, '{"code":"BE","slug":"belgique","name":"Belgique","currency":"EUR","cities":[{"slug":"bruxelles","name":"Bruxelles","countryCode":"BE","popular":true},{"slug":"liege","name":"Liège","countryCode":"BE","popular":false}]}'::jsonb),
('CH', 2, '{"code":"CH","slug":"suisse","name":"Suisse","currency":"CHF","cities":[{"slug":"geneve","name":"Genève","countryCode":"CH","popular":true},{"slug":"lausanne","name":"Lausanne","countryCode":"CH","popular":false}]}'::jsonb),
('LU', 3, '{"code":"LU","slug":"luxembourg","name":"Luxembourg","currency":"EUR","cities":[{"slug":"luxembourg-ville","name":"Luxembourg-Ville","countryCode":"LU","popular":true}]}'::jsonb);

update public.countries set data = jsonb_set(data, '{cities}', (
  select jsonb_agg(c || jsonb_build_object('seoText', 'Découvrez une sélection discrète de dominas et bizarrladies à ' || (c->>'name') || '. Chaque fiche est vérifiée par notre équipe éditoriale et présente tarifs, disponibilités et moyens de contact direct.'))
  from jsonb_array_elements(data->'cities') c
));

insert into public.studios (id, data) values
('st-1', '{"id":"st-1","slug":"maison-ecarlate","name":"Maison Écarlate","cityId":"paris","countryCode":"FR","address":"Paris 9e (adresse communiquée sur rendez-vous)","image":"ph:2","website":"https://example.com"}'::jsonb),
('st-2', '{"id":"st-2","slug":"atelier-noir","name":"Atelier Noir","cityId":"bruxelles","countryCode":"BE","address":"Bruxelles – Ixelles","image":"grad:2"}'::jsonb),
('st-3', '{"id":"st-3","slug":"studio-lac-leman","name":"Studio Lac Léman","cityId":"geneve","countryCode":"CH","address":"Genève – Eaux-Vives","image":"grad:3","website":"https://example.com"}'::jsonb);

insert into public.catalogs (id, type, label, sort) values
('cat-1','category','Domina',0),('cat-2','category','Bizarrlady',1),('cat-3','category','Switch',2),('cat-4','category','Domina en ligne',3),('cat-5','category','Clinique',4),('cat-6','category','Événement',5),
('srv-1','service','Bondage',0),('srv-2','service','Shibari',1),('srv-3','service','Discipline',2),('srv-4','service','Jeux de rôle',3),('srv-5','service','Latex / cuir',4),('srv-6','service','Fétichisme des pieds',5),('srv-7','service','Dressage',6),('srv-8','service','Humiliation verbale',7),('srv-9','service','Travestissement',8),('srv-10','service','Contrôle à distance',9),('srv-11','service','Sensations',10),('srv-12','service','Protocole',11),
('eq-1','equipment','Croix de Saint-André',0),('eq-2','equipment','Cage',1),('eq-3','equipment','Chaise de bondage',2),('eq-4','equipment','Suspension',3),('eq-5','equipment','Cabinet clinique',4),('eq-6','equipment','Garde-robe latex',5),('eq-7','equipment','Douche',6),
('tab-1','taboo','Marques permanentes',0),('tab-2','taboo','Contenu filmé',1),('tab-3','taboo','Rencontre sans réservation',2),('tab-4','taboo','Substances',3),('tab-5','taboo','Négociation des limites',4),
('lang-1','language','Français',0),('lang-2','language','Anglais',1),('lang-3','language','Allemand',2),('lang-4','language','Néerlandais',3),('lang-5','language','Italien',4),('lang-6','language','Espagnol',5);

insert into public.reviews (id, profile_id, author_name, rating, comment, status, created_at) values
('r-1','p-1','Julien M.',5,'Accueil impeccable, très professionnelle et à l''écoute. Je recommande.','approved','2026-09-01T00:00:00Z'),
('r-2','p-1','Anonyme',4,'Cadre magnifique et grande discrétion. Échange préalable très rassurant.','approved','2026-09-03T00:00:00Z'),
('r-3','p-3','Thomas',5,'Ponctuelle, attentive aux limites, une vraie expérience.','approved','2026-09-05T00:00:00Z'),
('r-4','p-3','C. & L.',5,'Très bonne communication avant la rencontre. Lieu soigné.','approved','2026-09-07T00:00:00Z'),
('r-5','p-5','Marc-Antoine',4,'Une personnalité marquante, élégante et respectueuse.','approved','2026-09-09T00:00:00Z'),
('r-6','p-7','Pierre',5,'Accueil impeccable, très professionnelle et à l''écoute. Je recommande.','approved','2026-09-11T00:00:00Z'),
('r-7','p-7','Julien M.',5,'Cadre magnifique et grande discrétion. Échange préalable très rassurant.','approved','2026-09-13T00:00:00Z'),
('r-8','p-10','Anonyme',5,'Ponctuelle, attentive aux limites, une vraie expérience.','approved','2026-09-15T00:00:00Z'),
('r-9','p-12','Thomas',4,'Très bonne communication avant la rencontre. Lieu soigné.','approved','2026-09-17T00:00:00Z'),
('r-10','p-2','C. & L.',4,'Une personnalité marquante, élégante et respectueuse.','pending','2026-09-19T00:00:00Z');
