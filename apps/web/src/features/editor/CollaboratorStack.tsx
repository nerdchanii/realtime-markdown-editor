import type { PresenceMember } from "./ports/collaboration-adapter";

export function CollaboratorStack({
  members,
}: Readonly<{
  members: readonly PresenceMember[];
}>) {
  const visibleMembers = members.slice(0, 3);
  const overflowCount = Math.max(0, members.length - visibleMembers.length);

  if (visibleMembers.length === 0) return null;

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {visibleMembers.map((member, index) => (
        <span
          key={member.id}
          aria-label={member.name}
          title={member.name}
          style={{
            alignItems: "center",
            background: member.color,
            border: "2px solid var(--color-surface)",
            borderRadius: "999px",
            color: "white",
            display: "inline-flex",
            fontSize: "10px",
            fontWeight: 700,
            height: "24px",
            justifyContent: "center",
            marginLeft: index === 0 ? "0" : "-8px",
            width: "24px",
          }}
        >
          {initials(member.name)}
        </span>
      ))}
      {overflowCount > 0 ? (
        <span
          aria-label={`${overflowCount} more collaborators`}
          style={{
            alignItems: "center",
            background: "#f1f5f9",
            border: "2px solid var(--color-surface)",
            borderRadius: "999px",
            color: "var(--color-text-secondary)",
            display: "inline-flex",
            fontSize: "10px",
            fontWeight: 700,
            height: "24px",
            justifyContent: "center",
            marginLeft: "-8px",
            width: "24px",
          }}
        >
          +{overflowCount}
        </span>
      ) : null}
    </div>
  );
}

function initials(name: string) {
  const characters = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return characters || "?";
}
