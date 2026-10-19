export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center px-2 py-8 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
        <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h2 className="type-heading">{title}</h2>
      <p className="mt-1 max-w-sm type-body text-ink-muted">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
