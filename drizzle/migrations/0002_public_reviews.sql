-- The visitor "login" on review submission is just a local nickname, not real
-- Supabase Auth, so the existing "signed-in users submit pending reviews" policy
-- (which requires auth.uid()) never applies to it. Allow anonymous submission
-- the same way pending signups are allowed on public.listings.
create policy "public submit pending review" on public.reviews
  for insert to anon, authenticated
  with check (status = 'pending' and user_id is null);
