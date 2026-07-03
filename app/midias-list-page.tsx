import Link from "next/link";
import DebouncedFiltersForm from "./debounced-filters-form";
import {
  formatarData,
  formatarQuantidade,
  getCategoriasByIds,
  type MidiasFiltros,
  getMidiasResumoPage,
  getTipoMidiaLabel,
} from "@/lib/api";

function getPageHref(page: number, filtros: MidiasFiltros) {
  const pathname = page === 1 ? "/" : `/midias/pagina/${page}`;
  const params = new URLSearchParams();

  if (filtros.nome) {
    params.set("nome", filtros.nome);
  }

  if (filtros.descricao) {
    params.set("descricao", filtros.descricao);
  }

  filtros.categorias?.forEach((categoriaId) => {
    params.append("categoria", String(categoriaId));
  });

  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
}

export default async function MidiasListPage({
  currentPage,
  filtros = {},
}: {
  currentPage: number;
  filtros?: MidiasFiltros;
}) {
  const [midiasPage, selectedCategorias] = await Promise.all([
    getMidiasResumoPage(currentPage, filtros),
    getCategoriasByIds(filtros.categorias ?? []),
  ]);

  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="eyebrow">Catalogo audiovisual</p>
        <h1>Lista de Midias</h1>
        <p>
          Pagina {midiasPage.currentPage} de {midiasPage.totalPages}. A API
          publica informa {midiasPage.totalItems} titulos no total.
        </p>
      </header>

      <DebouncedFiltersForm
        initialNome={filtros.nome}
        initialDescricao={filtros.descricao}
        initialSelectedCategorias={selectedCategorias}
      />

      <div className="lista">
        {midiasPage.results.map((midia) => (
          <Link key={midia.id} className="card" href={`/midias/${midia.id}`}>
            <div className="card-header">
              <div>
                <p className="tipo">{getTipoMidiaLabel(midia.tipo)}</p>
                <h2>{midia.nome}</h2>
              </div>
              <span className="card-id">#{midia.id}</span>
            </div>

            <p className="descricao">
              {midia.descricao ?? "Sem descricao cadastrada."}
            </p>

            <div className="tags">
              {midia.categoriasDetalhes.length > 0 ? (
                midia.categoriasDetalhes.map((categoria) => (
                  <span key={categoria.id}>{categoria.nome}</span>
                ))
              ) : (
                midia.categorias.map((categoriaId) => (
                  <span key={categoriaId}>Categoria #{categoriaId}</span>
                ))
              )}
            </div>
          </Link>
        ))}
      </div>

      {midiasPage.totalPages > 1 && (
        <nav className="pagination" aria-label="Paginacao de midias">
          {midiasPage.hasPreviousPage ? (
            <Link href={getPageHref(midiasPage.currentPage - 1, filtros)}>
              Anterior
            </Link>
          ) : (
            <span>Anterior</span>
          )}

          <div>
            {midiasPage.currentPage !== 1 && (
              <Link href={getPageHref(1, filtros)}>
                1
              </Link>
            )}
            {Array.from({
                length: Math.min(5, midiasPage.currentPage - 2),
              }, 
              (_, index) => {
                // const page = Math.min((2 + index), midiasPage.currentPage - (5 - index));
                const page = midiasPage.currentPage < 7 ? 2 + index : midiasPage.currentPage - (5 - index)
//               let page = midiasPage.currentPage - (5 - index)
//               page = page < 1 ?

                return (
                  <Link key={page} href={getPageHref(page, filtros)}>
                    {page}
                  </Link>
                )
            })}
            <span aria-current="page">
              {midiasPage.currentPage}
            </span>
            {Array.from({
                length: Math.min((midiasPage.totalPages - 1) - midiasPage.currentPage, 5),
              }, 
              (_, index) => {
                const page = index + 1 + midiasPage.currentPage;

                return (
                  <Link key={page} href={getPageHref(page, filtros)}>
                    {page}
                  </Link>
                )
            })}
            {midiasPage.totalPages !== midiasPage.currentPage && (
              <Link href={getPageHref(midiasPage.totalPages, filtros)}>
                {midiasPage.totalPages}
              </Link>
            )}
          </div>

          {midiasPage.hasNextPage ? (
            <Link href={getPageHref(midiasPage.currentPage + 1, filtros)}>
              Proxima
            </Link>
          ) : (
            <span>Proxima</span>
          )}
        </nav>
      )}

      <p className="api-note">
        A contagem de temporadas e episodios aparece quando a API envia campos
        agregados como quantidade_temporadas e quantidade_episodios.
      </p>
    </main>
  );
}
