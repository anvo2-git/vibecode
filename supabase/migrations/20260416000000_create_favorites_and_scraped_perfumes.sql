-- ============================================================
-- favorites: per-user saved perfumes, RLS scoped to own rows
-- ============================================================
create table if not exists favorites (
  user_id    text        not null default (auth.jwt() ->> 'sub'),
  perfume_id text        not null,
  created_at timestamptz not null default now(),
  primary key (user_id, perfume_id)
);

alter table favorites enable row level security;

-- Users can only read their own favorites
create policy "Users read own favorites"
  on favorites for select
  using (user_id = (auth.jwt() ->> 'sub'));

-- Users can insert their own favorites (user_id defaults from JWT)
create policy "Users insert own favorites"
  on favorites for insert
  with check (user_id = (auth.jwt() ->> 'sub'));

-- Users can delete their own favorites
create policy "Users delete own favorites"
  on favorites for delete
  using (user_id = (auth.jwt() ->> 'sub'));


-- ============================================================
-- scraped_perfumes: shared cache of Fragrantica scrapes
-- Anyone can read; signed-in users can insert.
-- ============================================================
create table if not exists scraped_perfumes (
  source_key    text        primary key,
  name          text,
  brand         text,
  gender        text,
  rating        real,
  rating_count  integer,
  accord_weights jsonb,
  source_url    text,
  scraped_by    text,
  created_at    timestamptz not null default now()
);

alter table scraped_perfumes enable row level security;

-- Anyone (including anonymous) can read scraped perfumes
create policy "Anyone can read scraped perfumes"
  on scraped_perfumes for select
  using (true);

-- Only authenticated users can insert
create policy "Authenticated users can insert scraped perfumes"
  on scraped_perfumes for insert
  with check ((auth.jwt() ->> 'sub') is not null);
