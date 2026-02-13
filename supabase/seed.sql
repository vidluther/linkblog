INSERT INTO app_config (key, value) VALUES
    ('supabase_url', 'http://kong:8000')
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

insert into "links" ("url", "created_at", "updated_at")
values ('https://simonwillison.net/2026/Feb/2/introducing-the-codex-app/', now(), now());

insert into "links" ("url", "created_at", "updated_at")
values ('https://daringfireball.net/linked/2026/01/29/amazon-melania-spending', now(), now());

insert into "links" ("url","created_at", "updated_at")
values ('https://news.ycombinator.com',now(), now());

insert into "links" ("url",  "created_at", "updated_at")
values ('https://www.microsoft.com', now(), now());

insert into "links" ("url", "created_at", "updated_at")
values ('https://www.rfpmart.com', now(), now());

insert into "links" ("url", "created_at", "updated_at")
values ('https://portswigger.net/web-security/api-testing', now(), now());

insert into "links" ("url", "created_at", "updated_at")
values ('https://overheardintheoffice.com/', now(), now());
