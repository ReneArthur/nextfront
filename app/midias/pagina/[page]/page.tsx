import { notFound } from "next/navigation";
import MidiasListPage from "@/app/midias-list-page";
import { getMidiasFiltrosFromSearchParams } from "@/lib/api";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface MidiasPaginadasPageProps {
  params: Promise<{
    page: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MidiasPaginadasPage({
  params,
  searchParams,
}: MidiasPaginadasPageProps) {
  const { page } = await params;
  const currentPage = Number(page);
  const filtros = getMidiasFiltrosFromSearchParams(await searchParams);

  if (!Number.isInteger(currentPage) || currentPage < 2) {
    notFound();
  }

  return <MidiasListPage currentPage={currentPage} filtros={filtros} />;
}
