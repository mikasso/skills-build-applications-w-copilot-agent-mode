import { useEffect, useState, type ReactNode } from 'react';

type Props<T> = {
  title: string;
  description: string;
  load: () => Promise<Record<string, unknown>>;
  resource: string;
  emptyMessage: string;
  renderItem: (item: T) => ReactNode;
};

export function CapabilityCard<T>({
  title,
  description,
  load,
  resource,
  emptyMessage,
  renderItem,
}: Props<T>) {
  const [items, setItems] = useState<T[] | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;

    load()
      .then((response) => {
        const data = response[resource];
        if (!Array.isArray(data)) throw new Error(`Invalid ${resource} response`);
        if (active) setItems(data as T[]);
      })
      .catch(() => {
        if (active) setHasError(true);
      });

    return () => {
      active = false;
    };
  }, [load, resource]);

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">{title}</h2>
    <p>{description}</p>
    {items === null && !hasError && <p role="status">Loading {title.toLowerCase()}...</p>}
    {hasError && <p role="alert">Unable to load {title.toLowerCase()}. Please try again later.</p>}
    {items?.length === 0 && !hasError && <p>{emptyMessage}</p>}
    {items && items.length > 0 && !hasError && <ul className="list-group list-group-flush">
      {items.map((item, index) => <li className="list-group-item" key={index}>{renderItem(item)}</li>)}
    </ul>}
  </div></section>;
}
