# Nline Global — Mebel E-Commerce

Next.js 14 + TypeScript + Prisma + Neon PostgreSQL + Cloudflare R2.

## Quraşdırma

```bash
# 1. Asılılıqlar
npm install

# 2. Mühit dəyişənləri
cp .env.example .env
# .env faylını redaktə et və real dəyərləri əlavə et

# 3. DB-ni hazırla
npm run db:generate
npm run db:migrate

# 4. Seed (admin + nümunə data)
npm run db:seed

# 5. Dev server
npm run dev
```

## Strukturlar

```
/
├── apps/web/          # Next.js Frontend (App Router)
├── prisma/            # DB sxemi və migrasiyalar
└── CLAUDE.md          # Tam layihə spesifikasiyası
```

Tam tələblər və standartlar üçün [CLAUDE.md](./CLAUDE.md)-ə bax.
