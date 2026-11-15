# Architecture Decision Records

Den här mappen innehåller projektets arkitekturbeslut (ADR:er).

## Om dokumentationen i efterhand

ADR-001 till ADR-006 skrevs i efterhand, 2026-11-15. Besluten togs under arbetets gång och syns i git-historiken, men dokumenterades inte i ADR-form när de togs. Arbetet styrdes då av kravspecifikationen (`docs/kravspecifikation_och_planering.docx`) och fokus låg på att få dataflödena att fungera från databas till gränssnitt.

Varje ADR anger därför två datum:

- **Beslutsdatum**: när beslutet faktiskt togs, hämtat från de commits där det först syns.
- **Dokumenterad**: när ADR:en skrevs.

Varje ADR hänvisar också till de commits som visar beslutet, så att det går att kontrollera i historiken. Kontexten och alternativen är rekonstruerade utifrån koden och commit-meddelandena från den tiden.

Från och med ADR-007 skrivs ADR:er i samband med att beslutet tas.

## Index

| ADR | Beslut | Beslutsdatum |
|---|---|---|
| [ADR-001](ADR-001.md) | Monorepo med React/Vite-klient och Express-server | 2026-04-29 |
| [ADR-002](ADR-002.md) | Lagerindelning controller → service → repository | 2026-05-12 |
| [ADR-003](ADR-003.md) | MongoDB med Mongoose | 2026-05-07 |
| [ADR-004](ADR-004.md) | Inloggning med JWT i httpOnly-cookie och CSRF-header | 2026-05-13 / 2026-11-13 |
| [ADR-005](ADR-005.md) | Klientstate via React Context och `useFetch` med service-funktioner | 2026-05-18 |
| [ADR-006](ADR-006.md) | Klient på Vercel, API på Render via rewrite | 2026-06-07 |
| [ADR-007](ADR-007.md) | Tillgänglighetsåtgärder i en egen stilmall | 2026-11-15 |
