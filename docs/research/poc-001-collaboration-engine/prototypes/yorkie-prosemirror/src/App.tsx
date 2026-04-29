import { useMemo, useState } from 'react';
import { CollaborativeEditor } from './editor/CollaborativeEditor';
import {
  getDocumentKeyFromSearch,
  getMemberFromSearch,
  getPeerUrl,
} from './collaboration/identity';
import { getViewModeFromSearch, type ViewMode } from './ui/viewModes';

export function App() {
  const member = useMemo(() => getMemberFromSearch(window.location.search), []);
  const documentKey = useMemo(() => getDocumentKeyFromSearch(window.location.search), []);
  const [mode, setMode] = useState<ViewMode>(() => getViewModeFromSearch(window.location.search));
  const peerUrl = useMemo(() => getPeerUrl(member, documentKey), [documentKey, member]);

  return (
    <CollaborativeEditor
      documentKey={documentKey}
      member={member}
      mode={mode}
      peerUrl={peerUrl}
      onModeChange={setMode}
    />
  );
}
