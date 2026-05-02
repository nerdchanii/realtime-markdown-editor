export const localProductPassword = "password";
export const localProductPasswordSalt = "local-review-password-salt";
export const localProductPasswordHash =
  "3bbff257761674495c3ad315d62259d7d7f1b13901c9c63eac6cb9bf189cc2f49d5254e6f2858b69cf2ac9cae04982f423a3253b239d3c450cb8c72785057e81";

export const localProductSeedSpec = {
  workspace: {
    id: "workspace_review",
    name: "Atlas Knowledge Workspace",
    rootFolderId: "folder_workspace_root",
  },
  project: {
    id: "project_editor",
    name: "Product Architecture",
    rootFolderId: "folder_project_root",
  },
  members: [
    member("user_alice", "alice@example.test", "member_alice", "Alice", "#0969da", "owner"),
    member("user_bob", "bob@example.test", "member_bob", "Bob", "#1a7f37", "member"),
    member("user_carol", "carol@example.test", "member_carol", "Carol", "#8250df", "member"),
    member("user_dana", "dana@example.test", "member_dana", "Dana", "#bf3989", "member"),
  ],
  documents: [
    documentFixture(
      "document_review_plan",
      "Architecture Overview",
      "review",
      "docs/architecture/README.md",
    ),
    documentFixture(
      "document_decision_log",
      "Product Surface Overview",
      "saved",
      "docs/product/README.md",
    ),
    documentFixture(
      "document_domain_model",
      "Domain Model Guide",
      "saved",
      "docs/domain/README.md",
    ),
    documentFixture(
      "document_workspace_hierarchy_adr",
      "Workspace Hierarchy ADR",
      "saved",
      "docs/adr/0006-filesystem-like-workspace-hierarchy.md",
    ),
  ],
  documentProperties: [
    property("document_review_plan", "Status", "status", { type: "status", value: "In Review" }),
    property("document_review_plan", "Owner", "member", { type: "member", value: "member_alice" }),
  ],
  linkEdges: [
    {
      sourceDocumentId: "document_decision_log",
      targetDocumentId: "document_review_plan",
      markdownHref: "../architecture/README.md",
      preview: "Product surface guidance references the architecture overview.",
    },
    {
      sourceDocumentId: "document_workspace_hierarchy_adr",
      targetDocumentId: "document_domain_model",
      markdownHref: "../domain/README.md",
      preview: "Workspace hierarchy decisions depend on the domain model guide.",
    },
  ],
};

function member(userId, email, membershipId, displayName, color, role) {
  return { userId, email, membershipId, displayName, color, role };
}

function documentFixture(id, title, state, sourcePath) {
  return { id, title, state, sourcePath };
}

function property(documentId, key, type, value) {
  return { documentId, key, type, value };
}
