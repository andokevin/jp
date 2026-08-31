# @jp/api

## 0.0.1

### Patch Changes

- 0f9226e: L'intégration continue génère le client Prisma avant de typer. `apps/api/src/genere/` étant un artefact non versionné, le runner ne pouvait pas compiler `@jp/api`.
  
  Mise en place de Changesets pour le versionnement et les journaux de modifications, sans publication.
- @jp/contracts@0.0.1
  - @jp/i18n@0.0.1
  - @jp/money@0.0.1
