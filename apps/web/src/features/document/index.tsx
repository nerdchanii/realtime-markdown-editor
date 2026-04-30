import { useState } from "react";

import { MarkdownExportSurface } from "./MarkdownExportSurface";
import { PropertiesSurface } from "./PropertiesSurface";
import type { DocumentBacklink, DocumentContextViewModel, DocumentProperty } from "./types";

export const documentFeatureId = "document";

export type { DocumentBacklink, DocumentContextViewModel, DocumentProperty } from "./types";

export type DocumentContextSlotProps = Readonly<{
  viewModel: DocumentContextViewModel;
}>;

const fallbackProperties: readonly DocumentProperty[] = [
  { key: "State", label: "State", value: "Review", valueType: "status", tone: "warning" },
  { key: "Owner", label: "Owner", value: "Mina Park", valueType: "member" },
  {
    key: "Project",
    label: "Project",
    value: "Realtime editor walking skeleton",
    valueType: "text",
  },
  { key: "Updated", label: "Updated", value: "Today 10:24", valueType: "date" },
];

const fallbackBacklinks: readonly DocumentBacklink[] = [
  {
    title: "Sprint review notes",
    source: "/workspace/engineering/reviews/sprint-review.md",
    excerpt: "References the editor workspace decision and CE evidence checklist.",
  },
  {
    title: "Collaboration engine ADR",
    source: "/workspace/engineering/adrs/adr-0002.md",
    excerpt: "Links to this document as the reviewer-facing Markdown scenario.",
  },
];

export function DocumentContextSlot({ viewModel }: DocumentContextSlotProps) {
  const title = viewModel.title ?? "Collaborative editor review plan";
  const path = viewModel.path ?? "Acme Workspace / Editor / Review plan";
  const { properties, addProperty, deleteProperty, updateProperty } = useDocumentProperties(
    viewModel.properties,
  );

  return (
    <header
      className="document-context"
      aria-label="Document context"
      data-testid="document-header"
    >
      <DocumentTitle title={title} path={path} />
      <PropertiesSurface
        properties={properties}
        onPropertyAdd={addProperty}
        onPropertyChange={updateProperty}
        onPropertyDelete={deleteProperty}
      />
      <MarkdownExportSurface
        documentId={viewModel.documentId}
        title={title}
        properties={properties}
      />
      <BacklinksSurface backlinks={viewModel.backlinks ?? fallbackBacklinks} />
    </header>
  );
}

function DocumentTitle({ title, path }: Readonly<{ title: string; path: string }>) {
  return (
    <>
      <div className="slot-kicker">Document</div>
      <h2 className="slot-title" data-testid="document-title">
        {title}
      </h2>
      <p style={metadataStyle}>{path}</p>
    </>
  );
}

function useDocumentProperties(initialProperties: readonly DocumentProperty[] | undefined) {
  const [properties, setProperties] = useState(() => [
    ...(initialProperties ?? fallbackProperties),
  ]);
  const updateProperty = (key: string, value: string) => {
    setProperties((current) =>
      current.map((property) => (propertyId(property) === key ? { ...property, value } : property)),
    );
  };
  const addProperty = (label: string) => {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) return;

    setProperties((current) => [
      ...current,
      {
        key: `${trimmedLabel}-${current.length + 1}`,
        label: trimmedLabel,
        value: "",
        valueType: "text",
      },
    ]);
  };
  const deleteProperty = (key: string) => {
    setProperties((current) => current.filter((property) => propertyId(property) !== key));
  };

  return { properties, addProperty, deleteProperty, updateProperty };
}

function propertyId(property: DocumentProperty) {
  return property.key ?? property.label;
}

function BacklinksSurface({ backlinks }: { backlinks: readonly DocumentBacklink[] }) {
  return (
    <section aria-label="Backlinks" data-testid="document-backlinks">
      <div style={sectionTitleStyle}>Backlinks</div>
      <ul style={backlinkListStyle}>
        {backlinks.map((backlink) => (
          <li
            key={backlink.source}
            style={backlinkItemStyle}
            data-source-document={backlink.sourceDocumentId}
            data-target-document={backlink.targetDocumentId}
          >
            <strong>{backlink.title}</strong>
            <a href={backlink.source} style={backlinkSourceStyle}>
              {backlink.source}
            </a>
            <span>{backlink.excerpt}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const metadataStyle = {
  margin: "4px 0 12px",
  color: "var(--color-text-secondary)",
  fontSize: "13px",
};

const sectionTitleStyle = {
  marginTop: "12px",
  color: "var(--color-text-secondary)",
  fontSize: "12px",
  fontWeight: 650,
};

const backlinkListStyle = {
  display: "grid",
  gap: "8px",
  margin: "8px 0 0",
  padding: 0,
  listStyle: "none",
};

const backlinkItemStyle = {
  display: "grid",
  gap: "2px",
  padding: "8px",
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  fontSize: "13px",
};

const backlinkSourceStyle = {
  color: "var(--color-text-muted)",
  fontSize: "12px",
  overflowWrap: "anywhere" as const,
};
