// Formato do Pokémon igual ao PokemonTO da API Java
export interface Pokemon {
  codigo?: number; // gerado pelo banco; não vai no cadastro
  numero: number;
  nome: string;
  tipo: string;
  altura: number;
  peso: number;
  dataDaCaptura: string; // "AAAA-MM-DD"
}

// Endereço da API: local por padrão; depois do deploy, troque pela URL do Render
// (ou crie um arquivo .env com VITE_API_URL=https://sua-api.onrender.com/pokedex)
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/pokedex';

// GET /pokedex -> lista todos
export async function listarPokemons(): Promise<Pokemon[]> {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Erro ao listar os pokémons');
  return response.json();
}

// GET /pokedex/{codigo} -> busca um pelo código (null se não existir)
export async function buscarPokemon(codigo: number): Promise<Pokemon | null> {
  const response = await fetch(`${API_URL}/${codigo}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Erro ao buscar o pokémon');
  return response.json();
}

// POST /pokedex -> cadastra (envia o Pokémon como JSON no corpo)
export async function cadastrarPokemon(pokemon: Pokemon): Promise<void> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pokemon),
  });
  if (!response.ok) throw new Error('Dados inválidos: confira os campos');
}

// PUT /pokedex/{codigo} -> atualiza
export async function atualizarPokemon(codigo: number, pokemon: Pokemon): Promise<void> {
  const response = await fetch(`${API_URL}/${codigo}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pokemon),
  });
  if (!response.ok) throw new Error('Dados inválidos: confira os campos');
}

// DELETE /pokedex/{codigo} -> apaga
export async function excluirPokemon(codigo: number): Promise<void> {
  const response = await fetch(`${API_URL}/${codigo}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Pokémon não encontrado');
}
