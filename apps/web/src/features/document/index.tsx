export const documentFeatureId = "document";

export type DocumentProperty = Readonly<{
  key?: string;
  label: string;
  value: string;
  valueType?: "text" | "status" | "date" | "member" | "checkbox";
  tone?: "neutral" | "success" | "warning";
}>;

export type DocumentBacklink = Readonly<{
  sourceDocumentId?: string;
  targetDocumentId?: string;
  title: string;
  source: string;
  excerpt: string;
}>;

export type DocumentContextViewModel = Readonly<{
  replacementPoint: string;
  label: string;
  title?: string;
  path?: string;
  properties?: readonly DocumentProperty[];
  backlinks?: readonly DocumentBacklink[];
}>;

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

// Mock replacement: TASK-016 can replace these local fallbacks with document providers.
export function DocumentContextSlot({ viewModel }: DocumentContextSlotProps) {
  const title = viewModel.title ?? "Collaborative editor review plan";
  const path = viewModel.path ?? "Acme Workspace / Editor / Review plan";

  return (
    <header
      className="document-context"
      aria-label="Document context"
      data-testid="document-header"
    >
      <div className="slot-kicker">Document</div>
      <h2 className="slot-title" data-testid="document-title">
        {title}
      </h2>
      <p style={metadataStyle}>{path}</p>
      <PropertiesSurface properties={viewModel.properties ?? fallbackProperties} />
      <BacklinksSurface backlinks={viewModel.backlinks ?? fallbackBacklinks} />
      <div className="replacement-point">{viewModel.replacementPoint}</div>
    </header>
  );
}

function PropertiesSurface({ properties }: { properties: readonly DocumentProperty[] }) {
  return (
    <section aria-label="Document properties" data-testid="document-properties">
      <div style={sectionTitleStyle}>Properties outside Markdown body</div>
      <dl style={propertyGridStyle}>
        {properties.map((property) => (
          <div key={property.label} style={propertyItemStyle}>
            <dt style={propertyLabelStyle}>{property.label}</dt>
            <dd style={propertyValueStyle} data-tone={property.tone ?? "neutral"}>
              {property.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function BacklinksSurface({ backlinks }: { backlinks: readonly DocumentBacklink[] }) {
  return (
    <section aria-label="Backlinks" data-testid="document-backlinks">
      <div style={sectionTitleStyle}>Backlinks</div>
      <ul style={backlinkListStyle}>
        {backlinks.map((backlink) => (
          <li key={backlink.source} style={backlinkItemStyle}>
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

const propertyGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: "8px",
  margin: "8px 0 0",
};

const propertyItemStyle = {
  minWidth: 0,
};

const propertyLabelStyle = {
  color: "var(--color-text-muted)",
  fontSize: "12px",
};

const propertyValueStyle = {
  margin: "2px 0 0",
  color: "var(--color-text-primary)",
  fontSize: "13px",
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
