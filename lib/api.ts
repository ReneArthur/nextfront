const API_BASE_URL = process.env.MIDIA_API_BASE_URL ?? "http://localhost:8000";

export type TipoMidia = 1 | 2;

export interface Categoria {
  id: number;
  nome: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface Midia {
  id: number;
  nome: string;
  descricao: string | null;
  data_criacao: string | null;
  categorias: number[];
  tipo: TipoMidia;
  created_at: string | null;
  updated_at: string | null;
  quantidade_temporadas?: number;
  quantidade_episodios?: number;
  total_temporadas?: number;
  total_episodios?: number;
}

export interface Temporada {
  id: number;
  ordem: number;
  nome: string;
  descricao: string;
  numero: number;
  midia: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface Episodio {
  id: number;
  ordem: number;
  numero: number;
  titulo: string;
  descricao: string;
  duracao: number;
  temporada: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface PageInfo {
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface MidiaResumo extends Midia {
  categoriasDetalhes: Categoria[];
  quantidadeTemporadas: number | null;
  quantidadeEpisodios: number | null;
}

export interface MidiasPage extends PageInfo {
  results: MidiaResumo[];
}

export type MidiaDetalhe = MidiaResumo;

export interface MidiasFiltros {
  nome?: string;
  descricao?: string;
  categorias?: number[];
}

type QueryParamValue = string | number | Array<string | number>;
type SearchParams = Record<string, string | string[] | undefined>;

function getTextSearchParam(value: string | string[] | undefined) {
  const text = Array.isArray(value) ? value[0] : value;
  const trimmedText = text?.trim();

  return trimmedText || undefined;
}

function getNumberListSearchParam(value: string | string[] | undefined) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  const numbers = values
    .flatMap((item) => item.split(","))
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item > 0);

  return Array.from(new Set(numbers));
}

export function getMidiasFiltrosFromSearchParams(
  searchParams: SearchParams,
): MidiasFiltros {
  const categorias = getNumberListSearchParam(
    searchParams.categoria ?? searchParams.categorias,
  );

  return {
    nome: getTextSearchParam(searchParams.nome),
    descricao: getTextSearchParam(searchParams.descricao),
    categorias: categorias.length > 0 ? categorias : undefined,
  };
}

function buildUrl(path: string, params?: Record<string, QueryParamValue | undefined>) {
  const url = new URL(path, API_BASE_URL);

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, String(item)));
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

async function fetchApi<T>(
  path: string,
  params?: Record<string, QueryParamValue | undefined>,
): Promise<T> {
  const response = await fetch(buildUrl(path, params), {
    cache: "no-cache",
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar ${path}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function getTotalPages<T>(
  page: PaginatedResponse<T>,
  requestedPage: number,
) {
  if (page.count === 0) {
    return 1;
  }

  if (!page.next && page.previous) {
    return requestedPage;
  }

  const pageSize = page.results.length;

  if (pageSize > 0) {
    return Math.max(1, Math.ceil(page.count / pageSize));
  }

  return requestedPage;
}

function getQuantidadeTemporadas(midia: Midia) {
  return midia.quantidade_temporadas ?? midia.total_temporadas ?? null;
}

function getQuantidadeEpisodios(midia: Midia) {
  return midia.quantidade_episodios ?? midia.total_episodios ?? null;
}

export function getTipoMidiaLabel(tipo: TipoMidia) {
  return tipo === 1 ? "Serie" : "Filme";
}

export function formatarQuantidade(valor: number | null) {
  return valor === null ? "Nao informado" : String(valor);
}

export function formatarDuracao(totalMinutos: number) {
  if (totalMinutos <= 0) {
    return "Sem duracao informada";
  }

  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;

  if (horas === 0) {
    return `${minutos} min`;
  }

  return minutos === 0 ? `${horas} h` : `${horas} h ${minutos} min`;
}

export function formatarData(data: string | null) {
  if (!data) {
    return "Data nao informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
  }).format(new Date(data));
}

export async function getCategoria(id: number) {
  return fetchApi<Categoria>(`/api/categorias/${id}`);
}

export async function getCategoriasPage(page = 1, nome?: string) {
  return fetchApi<PaginatedResponse<Categoria>>("/api/categorias", {
    page,
    nome,
  });
}

// Client-side helper that builds the correct backend URL and supports AbortSignal.
export async function fetchCategoriasPageClient(
  page = 1,
  nome?: string,
  signal?: AbortSignal,
) {
  const url = buildUrl("/api/categorias", { page, nome });

  const response = await fetch(url, {
    cache: "no-cache",
    signal,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Erro ao buscar /api/categorias: ${response.status} ${text}`,
    );
  }

  return response.json() as Promise<PaginatedResponse<Categoria>>;
}

export async function getCategoriasByIds(ids: number[]) {
  const uniqueIds = Array.from(new Set(ids));
  const categorias = await Promise.all(
    uniqueIds.map((id) => getCategoria(id).catch(() => null)),
  );

  return categorias.filter((categoria): categoria is Categoria => Boolean(categoria));
}

export async function getMidiasPage(page = 1, filtros: MidiasFiltros = {}) {
  return fetchApi<PaginatedResponse<Midia>>("/api/midias", {
    page,
    nome: filtros.nome,
    descricao: filtros.descricao,
    categoria: filtros.categorias,
  });
}

export async function getMidia(id: number) {
  return fetchApi<Midia>(`/api/midias/${id}`);
}

export async function getMidiasResumoPage(
  page = 1,
  filtros: MidiasFiltros = {},
): Promise<MidiasPage> {
  const midiasPage = await getMidiasPage(page, filtros);
  const categoriaIds = midiasPage.results.flatMap((midia) => midia.categorias);
  const categorias = await getCategoriasByIds(categoriaIds);
  const categoriasPorId = new Map(categorias.map((categoria) => [categoria.id, categoria]));
  const totalPages = getTotalPages(midiasPage, page);

  return {
    currentPage: page,
    totalItems: midiasPage.count,
    totalPages,
    hasNextPage: Boolean(midiasPage.next),
    hasPreviousPage: Boolean(midiasPage.previous),
    results: midiasPage.results.map((midia) => ({
      ...midia,
      categoriasDetalhes: midia.categorias
        .map((categoriaId) => categoriasPorId.get(categoriaId))
        .filter((categoria): categoria is Categoria => Boolean(categoria)),
      quantidadeTemporadas: getQuantidadeTemporadas(midia),
      quantidadeEpisodios: getQuantidadeEpisodios(midia),
    })),
  };
}

export async function getMidiaDetalhe(id: number): Promise<MidiaDetalhe | null> {
  const midia = await getMidia(id).catch(() => null);

  if (!midia) {
    return null;
  }

  const categorias = await getCategoriasByIds(midia.categorias);

  return {
    ...midia,
    categoriasDetalhes: categorias,
    quantidadeTemporadas: getQuantidadeTemporadas(midia),
    quantidadeEpisodios: getQuantidadeEpisodios(midia),
  };
}

export async function getMidiasStaticPageParams() {
  const firstPage = await getMidiasPage(1);
  const totalPages = getTotalPages(firstPage, 1);

  return Array.from({ length: totalPages }, (_, index) => ({
    page: String(index + 1),
  }));
}
