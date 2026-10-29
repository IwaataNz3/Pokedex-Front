import { useEffect, useState, type FormEvent } from 'react';
import {
  type Pokemon,
  listarPokemons,
  buscarPokemon,
  cadastrarPokemon,
  atualizarPokemon,
  excluirPokemon,
} from './api';

// estado do formulário: tudo como texto, porque é o que os inputs devolvem
const formularioVazio = { numero: '', nome: '', tipo: '', altura: '', peso: '', dataDaCaptura: '' };

export default function App() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [form, setForm] = useState(formularioVazio);
  const [editandoCodigo, setEditandoCodigo] = useState<number | null>(null); // null = cadastrando
  const [codigoBusca, setCodigoBusca] = useState('');
  const [mensagem, setMensagem] = useState<{ texto: string; erro: boolean } | null>(null);

  // busca a lista na API (GET /pokedex)
  async function carregar() {
    try {
      setPokemons(await listarPokemons());
    } catch {
      setMensagem({ texto: 'Não foi possível conectar à API. Ela está rodando?', erro: true });
    }
  }

  // carrega a lista assim que a página abre
  useEffect(() => {
    carregar();
  }, []);

  // atualiza o campo digitado no estado do formulário
  function alterarCampo(campo: keyof typeof formularioVazio, valor: string) {
    setForm({ ...form, [campo]: valor });
  }

  // cadastra (POST) ou salva a edição (PUT), dependendo do modo
  async function salvar(e: FormEvent) {
    e.preventDefault();
    const pokemon: Pokemon = {
      numero: Number(form.numero),
      nome: form.nome,
      tipo: form.tipo,
      altura: Number(form.altura),
      peso: Number(form.peso),
      dataDaCaptura: form.dataDaCaptura,
    };
    try {
      if (editandoCodigo === null) {
        await cadastrarPokemon(pokemon);
        setMensagem({ texto: `${pokemon.nome} cadastrado!`, erro: false });
      } else {
        await atualizarPokemon(editandoCodigo, pokemon);
        setMensagem({ texto: `${pokemon.nome} atualizado!`, erro: false });
      }
      cancelarEdicao();
      carregar();
    } catch (erro) {
      setMensagem({ texto: (erro as Error).message, erro: true });
    }
  }

  // preenche o formulário com o Pokémon escolhido para editar
  function editar(pokemon: Pokemon) {
    setEditandoCodigo(pokemon.codigo!);
    setForm({
      numero: String(pokemon.numero),
      nome: pokemon.nome,
      tipo: pokemon.tipo,
      altura: String(pokemon.altura),
      peso: String(pokemon.peso),
      dataDaCaptura: pokemon.dataDaCaptura,
    });
  }

  function cancelarEdicao() {
    setEditandoCodigo(null);
    setForm(formularioVazio);
  }

  // apaga (DELETE) depois de confirmar
  async function excluir(pokemon: Pokemon) {
    if (!confirm(`Excluir ${pokemon.nome}?`)) return;
    try {
      await excluirPokemon(pokemon.codigo!);
      setMensagem({ texto: `${pokemon.nome} excluído!`, erro: false });
      carregar();
    } catch (erro) {
      setMensagem({ texto: (erro as Error).message, erro: true });
    }
  }

  // busca um Pokémon pelo código (GET /pokedex/{codigo}) e mostra só ele na tabela
  async function buscar(e: FormEvent) {
    e.preventDefault();
    if (!codigoBusca) {
      carregar();
      return;
    }
    try {
      const pokemon = await buscarPokemon(Number(codigoBusca));
      if (pokemon) {
        setPokemons([pokemon]);
        setMensagem(null);
      } else {
        setPokemons([]);
        setMensagem({ texto: `Nenhum pokémon com o código ${codigoBusca}`, erro: true });
      }
    } catch (erro) {
      setMensagem({ texto: (erro as Error).message, erro: true });
    }
  }

  return (
    <main className="container">
      <h1>Pokédex</h1>

      {mensagem && (
        <p className={mensagem.erro ? 'mensagem erro' : 'mensagem sucesso'}>{mensagem.texto}</p>
      )}

      <section className="card">
        <h2>{editandoCodigo === null ? 'Cadastrar pokémon' : `Editando pokémon #${editandoCodigo}`}</h2>
        <form className="formulario" onSubmit={salvar}>
          <label>
            Número
            <input type="number" min="1" value={form.numero} onChange={(e) => alterarCampo('numero', e.target.value)} required />
          </label>
          <label>
            Nome
            <input value={form.nome} onChange={(e) => alterarCampo('nome', e.target.value)} required />
          </label>
          <label>
            Tipo
            <input value={form.tipo} onChange={(e) => alterarCampo('tipo', e.target.value)} required />
          </label>
          <label>
            Altura (m)
            <input type="number" step="0.01" min="0.01" value={form.altura} onChange={(e) => alterarCampo('altura', e.target.value)} required />
          </label>
          <label>
            Peso (kg)
            <input type="number" step="0.01" min="0.01" value={form.peso} onChange={(e) => alterarCampo('peso', e.target.value)} required />
          </label>
          <label>
            Data da captura
            <input type="date" value={form.dataDaCaptura} onChange={(e) => alterarCampo('dataDaCaptura', e.target.value)} required />
          </label>
          <div className="acoes-formulario">
            <button type="submit">{editandoCodigo === null ? 'Cadastrar' : 'Salvar alterações'}</button>
            {editandoCodigo !== null && (
              <button type="button" className="secundario" onClick={cancelarEdicao}>Cancelar</button>
            )}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="cabecalho-lista">
          <h2>Pokémons cadastrados</h2>
          <form className="busca" onSubmit={buscar}>
            <input type="number" min="1" placeholder="Buscar por código" value={codigoBusca} onChange={(e) => setCodigoBusca(e.target.value)} />
            <button type="submit" className="secundario">Buscar</button>
            <button type="button" className="secundario" onClick={() => { setCodigoBusca(''); carregar(); }}>Todos</button>
          </form>
        </div>

        {pokemons.length === 0 ? (
          <p className="vazio">Nenhum pokémon para mostrar.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nº</th>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Altura</th>
                <th>Peso</th>
                <th>Captura</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pokemons.map((p) => (
                <tr key={p.codigo}>
                  <td>{p.codigo}</td>
                  <td>{p.numero}</td>
                  <td>{p.nome}</td>
                  <td>{p.tipo}</td>
                  <td>{p.altura} m</td>
                  <td>{p.peso} kg</td>
                  <td>{p.dataDaCaptura.split('-').reverse().join('/')}</td>
                  <td className="acoes">
                    <button className="secundario" onClick={() => editar(p)}>Editar</button>
                    <button className="perigo" onClick={() => excluir(p)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
