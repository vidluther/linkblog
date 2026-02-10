create table "links" (
  "id" integer not null,
  "url" text,
  "title" text,
  "summary" text,
  "created_at" timestamp with time zone default now(),
  "updated_at" timestamp with time zone default now(),

  primary key ("id")
);
