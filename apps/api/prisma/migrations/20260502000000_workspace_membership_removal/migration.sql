-- Preserve membership identity for authorship while allowing owners to revoke future access.
ALTER TABLE "workspace_memberships" ADD COLUMN "removedAt" TIMESTAMP(3);
