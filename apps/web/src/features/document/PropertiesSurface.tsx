import { CalendarDays, CheckSquare, Plus, Trash2, Type } from "lucide-react";
import type { KeyboardEvent } from "react";

import {
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui";

import type { DocumentProperty } from "./types";

type EditablePropertyType = "text" | "date" | "checkbox";

export function PropertiesSurface({
  properties,
  onPropertyAdd,
  onPropertyKeyChange,
  onPropertyTypeChange,
  onPropertyValueChange,
  onPropertyDelete,
}: Readonly<{
  properties: readonly DocumentProperty[];
  onPropertyAdd: () => void;
  onPropertyKeyChange: (index: number, key: string) => void;
  onPropertyTypeChange: (index: number, valueType: EditablePropertyType) => void;
  onPropertyValueChange: (index: number, value: string) => void;
  onPropertyDelete: (index: number) => void;
}>) {
  return (
    <section
      className="document-properties"
      aria-label="Document properties"
      data-testid="document-properties"
    >
      {properties.map((property, index) => (
        <PropertyRow
          index={index}
          key={index}
          property={property}
          onPropertyDelete={onPropertyDelete}
          onPropertyKeyChange={onPropertyKeyChange}
          onPropertyTypeChange={onPropertyTypeChange}
          onPropertyValueChange={onPropertyValueChange}
        />
      ))}
      <button
        type="button"
        className="document-property-add"
        aria-label="Add document property"
        onClick={onPropertyAdd}
      >
        <Plus size={14} aria-hidden="true" />
        <span>Add property</span>
      </button>
    </section>
  );
}

function PropertyRow({
  index,
  property,
  onPropertyDelete,
  onPropertyKeyChange,
  onPropertyTypeChange,
  onPropertyValueChange,
}: Readonly<{
  index: number;
  property: DocumentProperty;
  onPropertyKeyChange: (index: number, key: string) => void;
  onPropertyTypeChange: (index: number, valueType: EditablePropertyType) => void;
  onPropertyValueChange: (index: number, value: string) => void;
  onPropertyDelete: (index: number) => void;
}>) {
  const propertyLabel = property.key ?? property.label;

  return (
    <div className="document-property-row">
      <label className="document-property-key">
        <PropertyTypeSelect
          label={propertyLabel}
          onChange={(valueType) => onPropertyTypeChange(index, valueType)}
          value={editablePropertyType(property)}
        />
        <input
          aria-label={`Property key ${index + 1}`}
          className="document-property-key-input"
          data-property-field="key"
          data-property-index={index}
          onKeyDown={(event) => {
            if (isPlainEnter(event)) {
              event.preventDefault();
              focusPropertyField(index, "value");
            }
          }}
          onChange={(event) => onPropertyKeyChange(index, event.currentTarget.value)}
          placeholder="Property"
          value={propertyLabel}
        />
      </label>
      <div className="document-property-value">
        <PropertyValueInput
          index={index}
          property={property}
          onChange={(value) => onPropertyValueChange(index, value)}
        />
        <button
          type="button"
          className="document-property-delete"
          aria-label={`Remove ${propertyLabel || "property"}`}
          onClick={() => onPropertyDelete(index)}
        >
          <Trash2 size={13} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function PropertyValueInput({
  index,
  property,
  onChange,
}: Readonly<{
  index: number;
  property: DocumentProperty;
  onChange: (value: string) => void;
}>) {
  const valueType = property.valueType ?? "text";

  if (valueType === "checkbox") {
    return (
      <input
        aria-label={`${property.key ?? property.label} value`}
        className="document-property-checkbox"
        checked={property.value === "true"}
        data-property-field="value"
        data-property-index={index}
        onChange={(event) => onChange(String(event.currentTarget.checked))}
        onKeyDown={(event) => {
          if (isPlainEnter(event)) {
            event.preventDefault();
            focusNextPropertyKey(index);
          }
        }}
        type="checkbox"
      />
    );
  }

  if (valueType === "date") {
    return <DateTimePicker index={index} property={property} onChange={onChange} />;
  }

  return (
    <input
      aria-label={`${property.key ?? property.label} value`}
      className="document-property-value-input"
      data-property-field="value"
      data-property-index={index}
      data-property-type={valueType}
      onChange={(event) => onChange(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (isPlainEnter(event)) {
          event.preventDefault();
          focusNextPropertyKey(index);
        }
      }}
      placeholder="Empty"
      type="text"
      value={property.value}
    />
  );
}

function PropertyTypeSelect({
  label,
  onChange,
  value,
}: Readonly<{
  label: string;
  onChange: (value: EditablePropertyType) => void;
  value: EditablePropertyType;
}>) {
  return (
    <Select
      onValueChange={(nextValue) => onChange(nextValue as EditablePropertyType)}
      value={value}
    >
      <SelectTrigger
        className="document-property-type-trigger"
        aria-label={`${label || "Property"} type`}
      >
        <PropertyTypeIcon value={value} />
      </SelectTrigger>
      <SelectContent className="document-property-type-content">
        <SelectItem value="text">
          <span className="document-property-type-option">
            <Type size={13} aria-hidden="true" />
            Text
          </span>
        </SelectItem>
        <SelectItem value="date">
          <span className="document-property-type-option">
            <CalendarDays size={13} aria-hidden="true" />
            DateTime
          </span>
        </SelectItem>
        <SelectItem value="checkbox">
          <span className="document-property-type-option">
            <CheckSquare size={13} aria-hidden="true" />
            Checkbox
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

function PropertyTypeIcon({ value }: Readonly<{ value: EditablePropertyType }>) {
  if (value === "date") return <CalendarDays size={14} aria-hidden="true" />;
  if (value === "checkbox") return <CheckSquare size={14} aria-hidden="true" />;
  return <Type size={14} aria-hidden="true" />;
}

function DateTimePicker({
  index,
  property,
  onChange,
}: Readonly<{
  index: number;
  property: DocumentProperty;
  onChange: (value: string) => void;
}>) {
  const parsed = parseDateTimeValue(property.value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="document-property-datetime-trigger"
          data-property-field="value"
          data-property-index={index}
          aria-label={`${property.key ?? property.label} datetime`}
        >
          {formatDateTimeLabel(property.value)}
        </button>
      </PopoverTrigger>
      <PopoverContent className="document-property-datetime-popover" align="start">
        <Calendar
          mode="single"
          selected={parsed.date}
          onSelect={(date) => {
            if (!date) return;
            onChange(toDateTimeValue(date, parsed.time));
          }}
        />
        <label className="document-property-time-field">
          <span>Time</span>
          <input
            type="time"
            value={parsed.time}
            onChange={(event) => {
              const date = parsed.date ?? new Date();
              onChange(toDateTimeValue(date, event.currentTarget.value));
            }}
          />
        </label>
      </PopoverContent>
    </Popover>
  );
}

function editablePropertyType(property: DocumentProperty): EditablePropertyType {
  if (property.valueType === "date") return "date";
  if (property.valueType === "checkbox") return "checkbox";
  return "text";
}

function parseDateTimeValue(value: string) {
  const [datePart, timePart] = value.split("T");
  const date =
    datePart && /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? createLocalDate(datePart) : undefined;
  const time = timePart && /^\d{2}:\d{2}/.test(timePart) ? timePart.slice(0, 5) : "09:00";
  return { date, time };
}

function createLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

function toDateTimeValue(date: Date, time: string) {
  return `${formatDateValue(date)}T${time || "09:00"}`;
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateTimeLabel(value: string) {
  const { date, time } = parseDateTimeValue(value);
  if (!date) return "Empty";
  return `${formatDateValue(date)} ${time}`;
}

function isPlainEnter(event: KeyboardEvent<HTMLElement>) {
  return (
    event.key === "Enter" && !event.shiftKey && !event.altKey && !event.metaKey && !event.ctrlKey
  );
}

function focusPropertyField(index: number, field: "key" | "value") {
  requestAnimationFrame(() => {
    const target = document.querySelector<HTMLElement>(
      `[data-property-index="${index}"][data-property-field="${field}"]`,
    );
    target?.focus();
  });
}

function focusNextPropertyKey(index: number) {
  requestAnimationFrame(() => {
    const nextKey = document.querySelector<HTMLElement>(
      `[data-property-index="${index + 1}"][data-property-field="key"]`,
    );
    if (nextKey) {
      nextKey.focus();
      return;
    }

    document.querySelector<HTMLElement>(".document-property-add")?.focus();
  });
}
