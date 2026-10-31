-- Public signup requests: visitors can submit a listing with status='pending'
-- for admin review. They cannot set any other status, and cannot read back
-- their own submission (only admins can see non-published listings, per the
-- existing "public read published" policy).

alter table public.listings drop constraint if exists listings_status_check;
alter table public.listings add constraint listings_status_check
  check (status in ('draft', 'published', 'pending'));

create policy "public submit pending profile" on public.listings
  for insert to anon, authenticated
  with check (status = 'pending');
