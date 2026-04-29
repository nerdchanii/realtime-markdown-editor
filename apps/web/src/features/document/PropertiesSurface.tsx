import type { DocumentProperty } from "./types";

export function PropertiesSurface({
  properties,
  onPropertyChange,
}: {
  properties: readonly DocumentProperty[];
  onPropertyChange: (key: string, value: string) => void;
}) {
  return (
    <section aria-label="Document properties" data-testid="document-properties">
      <div style={sectionTitleStyle}>Properties outside Markdown body</div>
      <dl style={propertyGridStyle}>
        {properties.map((property) => (
          <PropertyField
            key={property.key ?? property.label}
            property={property}
            onPropertyChange={onPropertyChange}
          />
        ))}
      </dl>
    </section>
  );
}

function PropertyField({
  property,
  onPropertyChange,
}: {
  property: DocumentProperty;
  onPropertyChange: (key: string, value: string) => void;
}) {
  const propertyKey = property.key ?? property.label;

  return (
    <div style={propertyItemStyle}>
      <dt style={propertyLabelStyle}>{property.label}</dt>
      <dd style={propertyValueStyle} data-tone={property.tone ?? "neutral"}>
        <PropertyInput
          property={property}
          onChange={(nextValue) => onPropertyChange(propertyKey, nextValue)}
        />
      </dd>
    </div>
  );
}

function PropertyInput({
  property,
  onChange,
}: {
  property: DocumentProperty;
  onChange: (value: string) => void;
}) {
  const valueType = property.valueType ?? inferPropertyType(property);

  if (valueType === "checkbox") {
    return (
      <input
        aria-label={property.label}
        type="checkbox"
        checked={property.value === "true"}
        onChange={(event) => onChange(String(event.currentTarget.checked))}
      />
    );
  }

  return (
    <input
      aria-label={property.label}
      data-property-type={valueType}
      type={valueType === "date" ? "date" : "text"}
      value={property.value}
      onChange={(event) => onChange(event.currentTarget.value)}
      style={propertyInputStyle}
    />
  );
}

function inferPropertyType(property: DocumentProperty) {
  const label = property.label.toLowerCase();
  if (label.includes("date")) return "date";
  if (label.includes("owner")) return "member";
  if (label.includes("evidence")) return "checkbox";
  if (property.tone === "warning") return "status";
  return "text";
}

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
};

const propertyInputStyle = {
  boxSizing: "border-box" as const,
  width: "100%",
  minWidth: 0,
  color: "var(--color-text-primary)",
  font: "inherit",
};
