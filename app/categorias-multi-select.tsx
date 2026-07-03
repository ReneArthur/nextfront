"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Categoria, PaginatedResponse } from "@/lib/api";

interface CategoriasMultiSelectProps {
  initialSelected: Categoria[];
}

function mergeCategorias(current: Categoria[], incoming: Categoria[]) {
  const categorias = new Map(current.map((categoria) => [categoria.id, categoria]));

  incoming.forEach((categoria) => {
    categorias.set(categoria.id, categoria);
  });

  return Array.from(categorias.values());
}

export default function CategoriasMultiSelect({
  initialSelected,
}: CategoriasMultiSelectProps) {
  const [selected, setSelected] = useState(initialSelected);
  const [options, setOptions] = useState<Categoria[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const selectedIds = useMemo(
    () => new Set(selected.map((categoria) => categoria.id)),
    [selected],
  );

  useEffect(() => {
    const controller = new AbortController();
    const searchText = search.trim();

    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({ page: String(page) });
    if (searchText) params.set("nome", searchText);

    fetch(`/api/categorias?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text().catch(() => "");
          throw new Error(
            `Nao foi possivel carregar categorias (status ${response.status}) ${text}`,
          );
        }

        return response.json() as Promise<PaginatedResponse<Categoria>>;
      })
      .then((data) => {
        console.debug("categorias fetched:", data);
        setOptions((current) =>
          page === 1 ? data.results : mergeCategorias(current, data.results),
        );
        setHasNextPage(Boolean(data.next));
      })
      .catch((requestError: Error) => {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [page, search]);

  // Close when clicking outside or pressing Escape. Do not close on selection.
  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      const container = containerRef.current;

      if (!container || !isOpen) return;

      if (event.target instanceof Node && !container.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return;

      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleScroll() {
    const element = scrollRef.current;

    if (!element || isLoading || !hasNextPage) {
      return;
    }

    const distanceToBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;

    if (distanceToBottom < 40) {
      setPage((currentPage) => currentPage + 1);
    }
  }

  function toggleCategoria(categoria: Categoria) {
    setSelected((current) => {
      if (current.some((item) => item.id === categoria.id)) {
        return current.filter((item) => item.id !== categoria.id);
      }

      return [...current, categoria];
    });
  }

  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <div className="category-select" ref={containerRef}>
      <span className="filter-label">Categorias</span>

      {selected.map((categoria) => (
        <input
          key={categoria.id}
          type="hidden"
          name="categoria"
          value={categoria.id}
        />
      ))}

      <button
        type="button"
        className="category-select-trigger"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        {selected.length > 0
          ? `${selected.length} categoria${selected.length > 1 ? "s" : ""} selecionada${selected.length > 1 ? "s" : ""}`
          : "Selecionar categorias"}
      </button>

      {selected.length > 0 && (
        <div className="category-selected-list">
          {selected.map((categoria) => (
            <button
              key={categoria.id}
              type="button"
              onClick={() => toggleCategoria(categoria)}
            >
              {categoria.nome}
              <span aria-hidden="true">x</span>
            </button>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="category-popover">
          <input
            type="search"
            ref={searchInputRef}
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Filtrar por nome"
            autoComplete="off"
          />

          <div
            ref={scrollRef}
            className="category-options"
            onScroll={handleScroll}
            role="listbox"
            aria-multiselectable="true"
          >
            {options.map((categoria) => (
              <button
                key={categoria.id}
                type="button"
                className={selectedIds.has(categoria.id) ? "is-selected" : ""}
                onClick={() => toggleCategoria(categoria)}
                role="option"
                aria-selected={selectedIds.has(categoria.id)}
              >
                <span>{categoria.nome}</span>
                <small>#{categoria.id}</small>
              </button>
            ))}

            {!isLoading && options.length === 0 && (
              <p>Nenhuma categoria encontrada.</p>
            )}

            {isLoading && <p>Carregando categorias...</p>}
            {error && <p>{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
