import "./shell.css";

// Shown instead of the shell when the local workspace cannot be opened (blocked or broken
// IndexedDB), so the failure is explicit rather than a blank page.
export function StorageError() {
  return (
    <div className="storage-error" role="alert">
      <p className="storage-error__title">이 브라우저의 로컬 저장소를 열 수 없습니다.</p>
      <p>사이트 데이터 저장이 막혀 있거나 저장소가 손상되었을 수 있습니다.</p>
      <button type="button" className="storage-error__action" onClick={() => location.reload()}>
        다시 시도
      </button>
    </div>
  );
}
