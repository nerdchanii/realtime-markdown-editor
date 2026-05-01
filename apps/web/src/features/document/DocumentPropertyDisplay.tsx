import { CalendarDays, CheckSquare, CircleDashed, Tag, Text, UserRound } from "lucide-react";
import type { ReactNode } from "react";

import type { DocumentProperty } from "./types";

export function PropertyField({ property }: Readonly<{ property: DocumentProperty }>) {
  return (
    <>
      <FieldLabel icon={propertyIcon(property)} label={property.label} />
      <div>{propertyValue(property)}</div>
    </>
  );
}

function propertyIcon(property: DocumentProperty) {
  if (property.valueType === "date") return <CalendarDays size={14} />;
  if (property.valueType === "member") return <UserRound size={14} />;
  if (property.valueType === "status") return <CircleDashed size={14} />;
  if (property.valueType === "checkbox") return <CheckSquare size={14} />;
  if (property.label.toLowerCase().includes("tag")) return <Tag size={14} />;
  return <Text size={14} />;
}

function propertyValue(property: DocumentProperty) {
  if (property.valueType === "status") {
    return (
      <span style={statusChipStyle}>
        <span style={statusDotStyle} />
        {property.value}
      </span>
    );
  }

  if (property.valueType === "member") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <span style={avatarStyle} aria-hidden="true" />
        <span style={{ color: "#314158", fontWeight: 500 }}>{property.value}</span>
      </span>
    );
  }

  return <span style={{ color: "#45556c", fontWeight: 500 }}>{property.value}</span>;
}

function FieldLabel({ icon, label }: Readonly<{ icon: ReactNode; label: string }>) {
  return (
    <div style={{ color: "#90a1b9", display: "flex", alignItems: "center", gap: "8px" }}>
      {icon}
      {label}
    </div>
  );
}

const statusChipStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  borderRadius: "4px",
  padding: "2px 8px",
  background: "#fffbeb",
  color: "#bb4d00",
  fontSize: "12px",
  fontWeight: 500,
};

const statusDotStyle = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  background: "#fe9a00",
};

const avatarStyle = {
  width: "16px",
  height: "16px",
  borderRadius: "50%",
  background: "linear-gradient(180deg, #d0d7de 0%, #b4bfcb 100%)",
  border: "1px solid #e2e8f0",
};
