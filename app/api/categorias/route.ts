import { getCategoriasPage } from "@/lib/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const nome = searchParams.get("nome")?.trim() || undefined;

  try {
    const categorias = await getCategoriasPage(
      Number.isInteger(page) && page > 0 ? page : 1,
      nome,
    );

    return Response.json(categorias);
  } catch {
    return Response.json(
      { count: 0, next: null, previous: null, results: [] },
      { status: 502 },
    );
  }
}
