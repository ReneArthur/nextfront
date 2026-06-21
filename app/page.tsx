export const dynamic = "force-static";

enum TipoMidia {
  SERIE,
  FILME
}

interface Midia {
  id: number;
  nome: string;
  descricao: string;
  dataCriadao: Date;
  tipo: TipoMidia;
}

async function getMidias(): Promise<Midia[]> {
  const response = await fetch("http://localhost:3001/midia", {
    cache: "force-cache"
  });

  return response.json();
}

export default async function HomePage() {
  const midias = await getMidias();

  return (
    <main>
      <h1>Lista de Mídias</h1>

      <div className="lista">
        {midias.map((midia) => (
          <div key={midia.id} className="card">
            <h2>{midia.nome}</h2>

            <p>{midia.descricao}</p>

            <p className="tipo">
              Tipo: {midia.tipo === 1 ? "Série" : "Filme"}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
