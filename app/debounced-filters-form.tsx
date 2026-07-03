"use client";

import Link from "next/link";
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
  return (
    <form className="filters" action="/" method="get">
      <label>
        Nome
        <input
          type="text"
          name="nome"
          defaultValue={initialNome ?? ""}
          placeholder="Buscar por nome"
        />
      </label>

      <label>
        Descricao
        <input
          type="text"
          name="descricao"
          defaultValue={initialDescricao ?? ""}
          placeholder="Buscar por descricao"
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
