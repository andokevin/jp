---
'@jp/api': patch
---

L'intégration continue génère le client Prisma avant de typer. `apps/api/src/genere/` étant un artefact non versionné, le runner ne pouvait pas compiler `@jp/api`.

Mise en place de Changesets pour le versionnement et les journaux de modifications, sans publication.
