import type { Checkpoint } from './checkpoints';
import type { ViewMode } from '../ui/viewModes';

export type PresenceState = {
  memberId: string;
  name: string;
  color: string;
  role: string;
  mode: ViewMode;
  selection?: unknown;
};

export type PresencePeer = {
  clientID: string;
  presence: PresenceState;
};

export type YorkieRoot = {
  checkpoints?: Checkpoint[];
  tree?: unknown;
};
