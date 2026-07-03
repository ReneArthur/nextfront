import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatarData,
  formatarQuantidade,
  getMidiaDetalhe,
  getTipoMidiaLabel,
} from "@/lib/api";

export const dynamic = "force-static";
export const dynamicParams = true;

interface MidiaDetalhePageProps {
  params: Promise<{
    id: string;
  }>;
}

// export async function generateStaticParams() {
//   return [];
// }

export default async function MidiaDetalhePage({
  params,
}: MidiaDetalhePageProps) {
  const { id } = await params;
  const midia = await getMidiaDetalhe(Number(id));

  if (!midia) {
    notFound();
  }

  return (
    <main className="page-shell">
      <Link href="/" className="back-link">
        Voltar para a lista
      </Link>

      <section className="detail-hero">
        <div>
          <p className="tipo">{getTipoMidiaLabel(midia.tipo)}</p>
          <h1>{midia.nome}</h1>
          <p>{midia.descricao ?? "Sem descricao cadastrada."}</p>
        </div>

        <div className="detail-facts">
          <span>
            <strong>{formatarQuantidade(midia.quantidadeTemporadas)}</strong>
            Temporadas
          </span>
          <span>
            <strong>{formatarQuantidade(midia.quantidadeEpisodios)}</strong>
            Episodios
          </span>
          <span>
            <strong>{formatarData(midia.data_criacao)}</strong>
            Criacao
          </span>
        </div>
      </section>

      <section className="section-block">
        <h2>Categorias</h2>
        <div className="tags">
          {midia.categoriasDetalhes.length > 0 ? (
            midia.categoriasDetalhes.map((categoria) => (
              <span key={categoria.id}>{categoria.nome}</span>
            ))
          ) : (
            <span>Sem categoria</span>
          )}
        </div>
      </section>

      <section className="section-block">
        <h2>Temporadas e episodios</h2>
        <p className="empty-state">
          Para listar temporadas e episodios aqui de forma escalavel, a API
          precisa expor filtros por midia ou incluir essa relacao no endpoint de
          detalhe da midia.
        </p>
      </section>
    </main>
  );
}
