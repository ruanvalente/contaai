# CHECKLIST - Clean Architecture Implementation

## Progresso Geral: ⏳ Fase 0 (Setup)

---

## FASE 0: Setup - Estrutura de Pastas
- [ ] 0.1 Criar pasta `src/domain/entities/`
- [ ] 0.2 Criar pasta `src/domain/repositories/`
- [ ] 0.3 Criar pasta `src/domain/usecases/`
- [ ] 0.4 Criar pasta `src/infrastructure/database/`
- [ ] 0.5 Criar pasta `src/infrastructure/api/`
- [ ] 0.6 Criar pasta `src/infrastructure/mappers/`

---

## FASE 1: domain/entities
- [ ] 1.1 Criar `src/domain/entities/book.entity.ts`
- [ ] 1.2 Criar `src/domain/entities/user.entity.ts`
- [ ] 1.3 Criar `src/domain/entities/reading-progress.entity.ts`
- [ ] 1.4 Criar `src/domain/entities/index.ts` (exports)

---

## FASE 2: domain/repositories
- [ ] 2.1 Criar interface `IBookRepository`
- [ ] 2.2 Criar interface `IUserRepository`
- [ ] 2.3 Criar interface `IReadingRepository`
- [ ] 2.4 Criar `src/domain/repositories/index.ts`

---

## FASE 3: domain/usecases
- [ ] 3.1 Criar `GetBooksUseCase`
- [ ] 3.2 Criar `GetFeaturedBooksUseCase`
- [ ] 3.3 Criar `SearchBooksUseCase`
- [ ] 3.4 Criar `FavoriteBookUseCase`
- [ ] 3.5 Criar `SaveReadingProgressUseCase`
- [ ] 3.6 Criar `src/domain/usecases/index.ts`

---

## FASE 4: infrastructure/database
- [ ] 4.1 Criar `src/infrastructure/mappers/book.mapper.ts`
- [ ] 4.2 Criar `SupabaseBookRepository`
- [ ] 4.3 Criar `SupabaseUserRepository`
- [ ] 4.4 Criar `SupabaseReadingRepository`
- [ ] 4.5 Criar `src/infrastructure/database/index.ts`

---

## FASE 5: infrastructure/api (Server Actions)
- [ ] 5.1 Migrar `getBooksAction` para `infrastructure/api/`
- [ ] 5.2 Migrar `searchBooksAction` para `infrastructure/api/`
- [ ] 5.3 Migrar `favoriteBookAction` para `infrastructure/api/`
- [ ] 5.4 Migrar `saveReadingProgressAction` para `infrastructure/api/`
- [ ] 5.5 Criar `src/infrastructure/api/index.ts`

---

## FASE 6: Atualizar Features
- [ ] 6.1 Atualizar imports em `features/discovery/`
- [ ] 6.2 Atualizar imports em `features/library/`
- [ ] 6.3 Atualizar imports em `features/reading/`
- [ ] 6.4 Atualizar imports em `features/profile/`
- [ ] 6.5 Atualizar imports em `features/book-dashboard/`
- [ ] 6.6 Remover tipos duplicados em `features/*/types/`

---

## STATUS ATUAL

**Última Fase Concluída:** Fase 6 - Atualizar imports nas features ✅
**Próxima Fase:** Concluído

---
*Atualizado em: 2026-04-08*