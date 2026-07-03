"use client";

import Link from "next/link";
import { useEffect, useRef, type ChangeEvent } from "react";
import CategoriasMultiSelect from "./categorias-multi-select";
import type { Categoria } from "@/lib/api";

interface DebouncedFiltersFormProps {
  initialNome?: string;
  initialDescricao?: string;
  initialSelectedCategorias: Categoria[];
}

export default function DebouncedFiltersForm({
  initialNome,
  initialDescricao,
  initialSelectedCategorias,
}: DebouncedFiltersFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  function scheduleAutoSubmit() {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      formRef.current?.requestSubmit();
    }, 300);
  }

  function handleFieldChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.name === "nome" || event.target.name === "descricao") {
      scheduleAutoSubmit();
    }
  }

  function handleSubmit() {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }

  return (
    <form
      ref={formRef}
      className="filters"
      action="/"
      method="get"
      onSubmit={handleSubmit}
    >
      <label>
        Nome
        <input
          type="text"
          name="nome"
          defaultValue={initialNome ?? ""}
          placeholder="Buscar por nome"
          onChange={handleFieldChange}
        />
      </label>

      <label>
        Descricao
        <input
          type="text"
          name="descricao"
          defaultValue={initialDescricao ?? ""}
          placeholder="Buscar por descricao"
          onChange={handleFieldChange}
        />
      </label>

      <CategoriasMultiSelect initialSelected={initialSelectedCategorias} />

      <div className="filter-actions">
        <button type="submit">Filtrar</button>
        <Link href="/">Limpar</Link>
      </div>
    </form>
  );
}
