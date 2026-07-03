import MidiasListPage from "./midias-list-page";
import { getMidiasFiltrosFromSearchParams } from "@/lib/api";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const filtros = getMidiasFiltrosFromSearchParams(await searchParams);

  return <MidiasListPage currentPage={1} filtros={filtros} />;
}
