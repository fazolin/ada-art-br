import inquirer from "inquirer";
import fs from "fs-extra";
import slugify from "slugify";
import sharp from "sharp";
import path from "path";

const jsonPath = "./src/data/trabalhos.json";
const midiaBasePath = "./trabalhos";
const extensoesValidas = [".jpg", ".jpeg", ".png", ".bmp", ".webp"];

async function garantirJSONValido() {
  try {
    if (!(await fs.pathExists(jsonPath))) {
      await fs.outputJSON(jsonPath, []);
      return [];
    }

    const conteudo = await fs.readFile(jsonPath, "utf-8");
    if (!conteudo.trim()) {
      await fs.writeJSON(jsonPath, []);
      return [];
    }

    return JSON.parse(conteudo);
  } catch (err) {
    console.warn("⚠️ JSON inválido. Substituindo por lista vazia.");
    await fs.writeJSON(jsonPath, []);
    return [];
  }
}

function mostrarResumo(dados) {
  console.log("\n📄 Resumo do projeto:");
  console.log(`• Título: ${dados.titulo}`);
  console.log(
    `• Slug: ${slugify(dados.titulo, { lower: true, strict: true })}`
  );
  console.log(`• Ano: ${dados.ano}`);
  console.log(`• Descrição: ${dados.descricao}`);
  console.log(`• Descrição curta: ${dados.descricao_curta}`);
  console.log(`• Tags: ${dados.tags}`);
  if (dados.youtube) console.log(`• YouTube: ${dados.youtube}`);
}

async function coletarDados() {
  const respostas = await inquirer.prompt([
    { name: "titulo", message: "Título do trabalho:" },
    { name: "ano", message: "Ano de criação:" },
    { name: "descricao", message: "Descrição completa:" },
    { name: "descricao_curta", message: "Descrição curta:" },
    { name: "tags", message: "Tags (separadas por vírgula):" },
    { name: "youtube", message: "ID do vídeo no YouTube (ou deixe vazio):" },
  ]);

  mostrarResumo(respostas);
  return respostas;
}

async function converterImagensParaPNG(slug, pasta) {
  const arquivos = await fs.readdir(pasta);
  const imagensConvertidas = [];
  const trashPath = path.join(pasta, "trash");
  await fs.ensureDir(trashPath);
  let index = 1;

  for (const arquivo of arquivos) {
    const ext = path.extname(arquivo).toLowerCase();
    if (!extensoesValidas.includes(ext)) continue;

    const nomeBase = `${slug} (${index})`;
    const caminhoOrigem = path.join(pasta, arquivo);
    const destinoNormal = path.join(pasta, `${nomeBase}.png`);
    const destinoLow = path.join(pasta, `${nomeBase}.low.png`);
    const caminhoTrash = path.join(trashPath, arquivo);

    try {
      await sharp(caminhoOrigem).png().toFile(destinoNormal);
      await sharp(caminhoOrigem)
        .resize({ width: 480 })
        .png()
        .toFile(destinoLow);

      imagensConvertidas.push({ index, nome: `${nomeBase}.png` });
      index++;

      await fs.move(caminhoOrigem, caminhoTrash, { overwrite: true });
    } catch (err) {
      console.warn(`Erro ao processar ${arquivo}:`, err.message);
    }
  }

  return imagensConvertidas;
}

async function criarProjeto() {
  const respostas = await coletarDados();
  const slug = slugify(respostas.titulo, { lower: true, strict: true });
  const pastaDestino = path.join(midiaBasePath, slug);
  await fs.ensureDir(pastaDestino);

  console.log(`\n📂 Cole as imagens em: ${pastaDestino}`);
  await inquirer.prompt([
    {
      name: "continuar",
      message: "→ Pressione ENTER quando terminar",
      type: "input",
    },
  ]);

  const imagens = await converterImagensParaPNG(slug, pastaDestino);
  if (imagens.length === 0) {
    console.error("❌ Nenhuma imagem válida encontrada.");
    return;
  }

  console.log("\n🖼️ Imagens convertidas:");
  imagens.forEach((img) => {
    console.log(`  ${img.index}. ${img.nome}`);
  });

  const { thumbIndex } = await inquirer.prompt([
    {
      name: "thumbIndex",
      message: "Qual índice será usado como capa (thumb)?",
      type: "number",
      validate: (value) => {
        return imagens.some((img) => img.index === value)
          ? true
          : "Índice inválido";
      },
    },
  ]);

  const novoTrabalho = {
    slug,
    titulo: respostas.titulo,
    ano: parseInt(respostas.ano),
    descricao: respostas.descricao,
    descricao_curta: respostas.descricao_curta,
    tags: respostas.tags.split(",").map((t) => t.trim()),
    thumb: thumbIndex,
  };

  if (respostas.youtube) {
    novoTrabalho.midias = { youtube: respostas.youtube };
  }

  const trabalhos = await garantirJSONValido();
  if (trabalhos.some((t) => t.slug === slug)) {
    console.error(`❌ Já existe um projeto com o slug "${slug}".`);
    return;
  }

  trabalhos.push(novoTrabalho);
  await fs.writeJSON(jsonPath, trabalhos, { spaces: 2 });

  console.log(`\n✅ Projeto "${respostas.titulo}" criado com sucesso!`);
  console.log(`📁 Imagens salvas em: ${pastaDestino}`);
  console.log(
    `🗑️ Arquivos originais movidos para: ${path.join(pastaDestino, "trash")}`
  );
}

async function main() {
  do {
    await criarProjeto();
    const { repetir } = await inquirer.prompt([
      {
        name: "repetir",
        type: "confirm",
        message: "Deseja cadastrar outro trabalho?",
        default: false,
      },
    ]);
    if (!repetir) break;
  } while (true);
}

main();
