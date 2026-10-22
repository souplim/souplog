'use client';

import { useId, useState } from 'react';
import { Plus } from 'lucide-react';
import { DeleteIconButton } from '~/components/owner/OwnerActions';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

export interface PairListRow {
  first: string;
  second: string;
}

interface PairColumn {
  /** Repeated form field name — the action reads every row with `getAll`. */
  name: string;
  label: string;
  placeholder: string;
  maxLength: number;
}

interface PairListFieldProps {
  legend: string;
  description: string;
  initialRows: readonly PairListRow[];
  first: PairColumn;
  second: PairColumn;
  maxRows: number;
  /** "항목", "링크" — names the add button ("항목 추가"). */
  itemName: string;
}

interface KeyedRow extends PairListRow {
  key: number;
}

/**
 * An editable list of two-field rows (the About page's facts and links).
 * Rows are plain uncontrolled inputs sharing a name per column, so the form
 * posts them in display order; a row left blank is dropped by the action.
 */
export function PairListField({
  legend,
  description,
  initialRows,
  first,
  second,
  maxRows,
  itemName,
}: PairListFieldProps) {
  const idPrefix = useId();
  const [rows, setRows] = useState<KeyedRow[]>(() =>
    (initialRows.length > 0 ? initialRows : [{ first: '', second: '' }]).map((row, index) => ({ ...row, key: index })),
  );
  const [nextKey, setNextKey] = useState(rows.length);

  function addRow() {
    setRows((current) => [...current, { first: '', second: '', key: nextKey }]);
    setNextKey((key) => key + 1);
  }

  function removeRow(key: number) {
    setRows((current) => current.filter((row) => row.key !== key));
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold">{legend}</legend>
      <p className="-mt-1 text-xs text-muted-foreground">{description}</p>

      <ul className="space-y-2">
        {rows.map((row, index) => {
          const firstId = `${idPrefix}-${row.key}-first`;
          const secondId = `${idPrefix}-${row.key}-second`;
          return (
            <li key={row.key} className="flex items-center gap-2">
              <Label htmlFor={firstId} className="sr-only">
                {`${first.label} ${index + 1}`}
              </Label>
              <Input
                id={firstId}
                name={first.name}
                defaultValue={row.first}
                maxLength={first.maxLength}
                placeholder={first.placeholder}
                className="w-28 shrink-0 sm:w-36"
              />
              <Label htmlFor={secondId} className="sr-only">
                {`${second.label} ${index + 1}`}
              </Label>
              <Input
                id={secondId}
                name={second.name}
                defaultValue={row.second}
                maxLength={second.maxLength}
                placeholder={second.placeholder}
                className="min-w-0 flex-1"
              />
              <DeleteIconButton
                onClick={() => removeRow(row.key)}
                aria-label={`${itemName} ${index + 1} 삭제`}
                className="shrink-0"
              />
            </li>
          );
        })}
      </ul>

      {rows.length < maxRows && (
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus />
          {itemName} 추가
        </Button>
      )}
    </fieldset>
  );
}
