import type { PresenceMember } from "./ports/collaboration-adapter";
import { presenceBadgeStyle, presenceDotStyle, presenceLayerStyle } from "./styles";

export function PresenceLayer({ members }: { members: readonly PresenceMember[] }) {
  return (
    <div aria-label="Remote presence" data-testid="presence-layer" style={presenceLayerStyle}>
      {members.map((member) => (
        <span
          key={member.id}
          data-testid={`presence-cursor-${member.id}`}
          style={{ ...presenceBadgeStyle, borderColor: member.color }}
        >
          <span style={{ ...presenceDotStyle, background: member.color }} />
          <span>{member.name} editing</span>
          <span data-testid={`presence-selection-${member.id}`}>{member.range}</span>
        </span>
      ))}
    </div>
  );
}
