"use client";

import { useRef, useState, type DragEvent, type ReactNode } from "react";
import {
  ACCEPTED_EXTENSIONS,
  MAX_REFERENCES,
  MAX_UPLOAD_BYTES,
  OTHER,
  otherKey,
  selectedOptions,
  type Answers,
  type Field,
  type Reference,
} from "@/lib/questions";
import styles from "./FormField.module.css";

type FormFieldProps = {
  field: Field;
  answers: Answers;
  error?: string | null;
  files: File[];
  onChange: (name: string, value: Answers[string]) => void;
  onFilesChange: (files: File[]) => void;
};

/** Deixa os links do texto de ajuda clicáveis (ex.: o link do teste DISC). */
const linkify = (text: string): ReactNode[] =>
  text.split(/(https?:\/\/[^\s,]+)/g).map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className={styles.helpLink}>
        {part}
      </a>
    ) : (
      part
    ),
  );

const formatBytes = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export default function FormField({ field, answers, error, files, onChange, onFilesChange }: FormFieldProps) {
  const id = `campo-${field.name}`;
  const value = answers[field.name];
  const text = typeof value === "string" ? value : "";

  const control = (() => {
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            id={id}
            className={styles.textarea}
            rows={4}
            placeholder={field.placeholder}
            value={text}
            onChange={(e) => onChange(field.name, e.target.value)}
            aria-invalid={!!error}
          />
        );
      case "radio":
      case "checkbox":
        return <Choices field={field} answers={answers} onChange={onChange} />;
      case "files":
        return <FileDrop accept={field.accept ?? ACCEPTED_EXTENSIONS} files={files} onFilesChange={onFilesChange} />;
      case "references":
        return <References value={(value as Reference[]) ?? []} onChange={(refs) => onChange(field.name, refs)} />;
      default:
        return (
          <input
            id={id}
            className={styles.input}
            type={field.type === "email" || field.type === "tel" ? field.type : "text"}
            inputMode={
              field.type === "url" ? "url" : field.type === "tel" ? "tel" : field.type === "number" || field.type === "cpf" ? "numeric" : undefined
            }
            maxLength={field.type === "number" ? 3 : field.type === "cpf" ? 14 : undefined}
            autoComplete={field.name === "nome" ? "name" : field.type === "email" ? "email" : field.type === "tel" ? "tel" : "off"}
            placeholder={field.placeholder}
            value={text}
            onChange={(e) => onChange(field.name, e.target.value)}
            aria-invalid={!!error}
          />
        );
    }
  })();

  const isGroup = field.type === "radio" || field.type === "checkbox" || field.type === "references";
  const Label = isGroup ? "p" : "label";
  const help = field.help ?? (field.type === "checkbox" ? "Selecione todas que se aplicam." : undefined);

  return (
    <div className={`${styles.field} ${field.half ? styles.half : ""}`} data-field={field.name}>
      <Label className={styles.label} {...(isGroup ? {} : { htmlFor: id })}>
        {field.label}
        {field.required && <span className={styles.required}> *</span>}
      </Label>
      {help && <p className={styles.help}>{linkify(help)}</p>}
      {control}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

function Choices({ field, answers, onChange }: Pick<FormFieldProps, "field" | "answers" | "onChange">) {
  const multiple = field.type === "checkbox";
  const selected = selectedOptions(answers[field.name]);
  const options = field.other ? [...(field.options ?? []), OTHER] : (field.options ?? []);

  const toggle = (option: string) => {
    if (!multiple) return onChange(field.name, option);
    if (selected.includes(option)) return onChange(field.name, selected.filter((o) => o !== option));
    // "Não tenho", "Não sei"... não combinam com as outras opções.
    const exclusive = field.exclusive ?? [];
    const kept = exclusive.includes(option) ? [] : selected.filter((o) => !exclusive.includes(o));
    onChange(field.name, [...kept, option]);
  };

  return (
    <div className={styles.choices} role={multiple ? "group" : "radiogroup"}>
      {options.map((option) => {
        const checked = selected.includes(option);
        return (
          <label key={option} className={`${styles.choice} ${checked ? styles.checked : ""}`}>
            <input
              type={multiple ? "checkbox" : "radio"}
              name={field.name}
              checked={checked}
              onChange={() => toggle(option)}
              className={styles.nativeChoice}
            />
            <span className={`${styles.indicator} ${multiple ? styles.square : ""}`} aria-hidden />
            <span>{option === OTHER ? "Outro" : option}</span>
          </label>
        );
      })}
      {field.other && selected.includes(OTHER) && (
        <input
          className={styles.input}
          placeholder="Descreva"
          aria-label={`${field.label} — outro`}
          value={String(answers[otherKey(field.name)] ?? "")}
          onChange={(e) => onChange(otherKey(field.name), e.target.value)}
          autoFocus
        />
      )}
    </div>
  );
}

function FileDrop({ accept, files, onFilesChange }: { accept: string[] } & Pick<FormFieldProps, "files" | "onFilesChange">) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [warning, setWarning] = useState("");
  const total = files.reduce((sum, file) => sum + file.size, 0);

  const add = (incoming: File[]) => {
    const accepted = incoming.filter((file) => accept.some((ext) => file.name.toLowerCase().endsWith(ext)));
    const next = [...files, ...accepted.filter((file) => !files.some((f) => f.name === file.name && f.size === file.size))];
    const nextTotal = next.reduce((sum, file) => sum + file.size, 0);

    if (nextTotal > MAX_UPLOAD_BYTES) {
      setWarning("Os arquivos passam de 4 MB. Envie os maiores por link, no campo logo abaixo.");
      return;
    }
    setWarning(accepted.length < incoming.length ? "Alguns arquivos foram ignorados por não estarem em um formato aceito." : "");
    onFilesChange(next);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    add(Array.from(e.dataTransfer.files));
  };

  return (
    <div>
      <div
        className={`${styles.drop} ${dragging ? styles.dragging : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" x2="12" y1="3" y2="15" />
        </svg>
        <span>
          <strong>Clique para escolher</strong> ou arraste os arquivos aqui
        </span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept.join(",")}
          hidden
          onChange={(e) => {
            add(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>
      {warning && <p className={styles.error}>{warning}</p>}
      {files.length > 0 && (
        <ul className={styles.fileList}>
          {files.map((file) => (
            <li key={file.name + file.size}>
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileSize}>{formatBytes(file.size)}</span>
              <button
                type="button"
                className={styles.remove}
                aria-label={`Remover ${file.name}`}
                onClick={() => onFilesChange(files.filter((f) => f !== file))}
              >
                ×
              </button>
            </li>
          ))}
          <li className={styles.fileTotal}>
            {formatBytes(total)} de 4 MB
          </li>
        </ul>
      )}
    </div>
  );
}

function References({ value, onChange }: { value: Reference[]; onChange: (refs: Reference[]) => void }) {
  const refs = value.length ? value : [{ url: "", nota: "" }];
  const update = (index: number, patch: Partial<Reference>) =>
    onChange(refs.map((ref, i) => (i === index ? { ...ref, ...patch } : ref)));

  return (
    <div className={styles.references}>
      {refs.map((ref, index) => (
        <div key={index} className={styles.reference}>
          <span className={styles.refNumber}>{index + 1}</span>
          <div className={styles.refInputs}>
            <input
              className={styles.input}
              inputMode="url"
              placeholder="Link do site (https://...)"
              aria-label={`Site de referência ${index + 1}`}
              value={ref.url}
              onChange={(e) => update(index, { url: e.target.value })}
            />
            <input
              className={styles.input}
              placeholder="O que você gostou nele? (cores, layout, textos...)"
              aria-label={`O que você gostou no site ${index + 1}`}
              value={ref.nota}
              onChange={(e) => update(index, { nota: e.target.value })}
            />
          </div>
          {refs.length > 1 && (
            <button
              type="button"
              className={styles.remove}
              aria-label={`Remover site ${index + 1}`}
              onClick={() => onChange(refs.filter((_, i) => i !== index))}
            >
              ×
            </button>
          )}
        </div>
      ))}
      {refs.length < MAX_REFERENCES && (
        <button type="button" className={styles.addRef} onClick={() => onChange([...refs, { url: "", nota: "" }])}>
          + Adicionar outro site
        </button>
      )}
    </div>
  );
}
