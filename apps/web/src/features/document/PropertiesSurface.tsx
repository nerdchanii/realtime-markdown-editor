import { useState } from "react";

import type { DocumentProperty } from "./types";

export function PropertiesSurface({
  properties,
  onPropertyAdd,
  onPropertyChange,
  onPropertyDelete,
}: {
  properties: readonly DocumentProperty[];
  onPropertyAdd: (label: string) => void;
  onPropertyChange: (key: string, value: string) => void;
  onPropertyDelete: (key: string) => void;
}) {
  return (
    <section aria-label="Document properties" data-testid="document-properties">
      <div style={headerStyle}>
        <div style={sectionTitleStyle}>Properties</div>
        <PropertyAddForm onPropertyAdd={onPropertyAdd} />
      </div>
      <PropertyList
        properties={properties}
        onPropertyChange={onPropertyChange}
        onPropertyDelete={onPropertyDelete}
      />
    </section>
  );
}

function PropertyAddForm({ onPropertyAdd }: { onPropertyAdd: (label: string) => void }) {
  const [newPropertyLabel, setNewPropertyLabel] = useState("Evidence");

  return (
    <form
      aria-label="Add document property"
      style={addFormStyle}
      onSubmit={(event) => {
        event.preventDefault();
        onPropertyAdd(newPropertyLabel);
        setNewPropertyLabel("Evidence");
      }}
    >
      <input
        aria-label="New property name"
        value={newPropertyLabel}
        onChange={(event) => setNewPropertyLabel(event.currentTarget.value)}
        style={propertyInputStyle}
      />
      <button type="submit" style={propertyActionStyle}>
        Add
      </button>
    </form>
  );
}

function PropertyList({
  properties,
  onPropertyChange,
  onPropertyDelete,
}: {
  properties: readonly DocumentProperty[];
  onPropertyChange: (key: string, value: string) => void;
  onPropertyDelete: (key: string) => void;
}) {
  return (
    <dl style={propertyGridStyle}>
      {properties.map((property) => (
        <PropertyField
          key={property.key ?? property.label}
          property={property}
          onPropertyChange={onPropertyChange}
          onPropertyDelete={onPropertyDelete}
        />
      ))}
    </dl>
  );
}

function PropertyField({
  property,
  onPropertyChange,
  onPropertyDelete,
}: {
  property: DocumentProperty;
  onPropertyChange: (key: string, value: string) => void;
  onPropertyDelete: (key: string) => void;
}) {
  const propertyKey = property.key ?? property.label;

  return (
    <div style={propertyItemStyle}>
      <PropertyLabel label={property.label} onDelete={() => onPropertyDelete(propertyKey)} />
      <dd style={propertyValueStyle} data-tone={property.tone ?? "neutral"}>
        <PropertyInput
          property={property}
          onChange={(nextValue) => onPropertyChange(propertyKey, nextValue)}
        />
      </dd>
    </div>
  );
}

function PropertyLabel({ label, onDelete }: { label: string; onDelete: () => void }) {
  return (
    <dt style={propertyLabelStyle}>
      <span>{label}</span>
      <button
        type="button"
        aria-label="Remove property"
        data-testid={`delete-property-${slugify(label)}`}
        style={propertyDeleteStyle}
        onClick={onDelete}
      >
        Delete
      </button>
    </dt>
  );
}

function slugify(value: string) {
  return value.trim().toLowerCase().replaceAll(/\s+/g, "-");
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
  color: "var(--color-text-secondary)",
  fontSize: "12px",
  fontWeight: 650,
};

const headerStyle = {
  display: "grid",
  gap: "8px",
  marginTop: "12px",
};

const addFormStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: "6px",
};

const propertyGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: "8px",
  margin: "8px 0 0",
};

const propertyItemStyle = {
  minWidth: 0,
  display: "grid",
  gap: "4px",
};

const propertyLabelStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
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

const propertyActionStyle = {
  border: "1px solid var(--color-border)",
  borderRadius: "4px",
  padding: "5px 8px",
  color: "var(--color-text-primary)",
  background: "var(--color-surface)",
  font: "inherit",
};

const propertyDeleteStyle = {
  border: "0",
  padding: 0,
  color: "var(--color-danger)",
  background: "transparent",
  font: "inherit",
  fontSize: "11px",
};
