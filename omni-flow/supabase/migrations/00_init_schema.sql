-- Enable pgvector extension to work with embedding vectors
create extension if not exists vector;

-- PRODUCTS TABLE
create table products (
  id bigint primary key generated always as identity,
  title text not null,
  description text,
  price numeric not null,
  flash_sale_price numeric,
  stock integer not null default 0,
  images text[],
  tags jsonb,
  vector_embedding vector(768), -- Dimensions for Gemini text-embedding-004
  seller_id uuid references auth.users not null,
  created_at timestamptz default now()
);

-- ORDERS TABLE
create table orders (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users not null,
  total numeric not null,
  status text not null default 'pending', -- pending, paid, shipped, delivered, cancelled
  tracking_number text,
  items jsonb, -- Simplified for demo: [{ product_id, quantity, price }]
  created_at timestamptz default now()
);

-- REVIEWS TABLE (for Sentiment Analysis)
create table reviews (
  id bigint primary key generated always as identity,
  product_id bigint references products(id) not null,
  user_id uuid references auth.users not null,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  sentiment_score numeric, -- AI Calculated: -1 (Negative) to 1 (Positive)
  created_at timestamptz default now()
);

-- VECTOR SEARCH FUNCTION (for "Snap to Shop" & RAG)
create or replace function match_products (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  title text,
  price numeric,
  images text[],
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    products.id,
    products.title,
    products.price,
    products.images,
    1 - (products.vector_embedding <=> query_embedding) as similarity
  from products
  where 1 - (products.vector_embedding <=> query_embedding) > match_threshold
  order by products.vector_embedding <=> query_embedding
  limit match_count;
end;
$$;

-- RLS POLICIES (Security)
alter table products enable row level security;
create policy "Public products are viewable by everyone." on products for select using (true);
create policy "Sellers can insert their own products." on products for insert with check (auth.uid() = seller_id);
create policy "Sellers can update their own products." on products for update using (auth.uid() = seller_id);

alter table orders enable row level security;
create policy "Users can view their own orders." on orders for select using (auth.uid() = user_id);

alter table reviews enable row level security;
create policy "Public reviews are viewable by everyone." on reviews for select using (true);
create policy "Authenticated users can insert reviews." on reviews for insert with check (auth.role() = 'authenticated');
