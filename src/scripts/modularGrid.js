// src/scripts/modularGrid.js

// ╔═══════════════════════╗
// ║ 🎛️ CONFIGURAÇÃO GLOBAL ║
// ╚═══════════════════════╝
const MIN_COLS = 2;
const MAX_COLS = 6;
const MOBILE_PORTRAIT_COLS = 2;
const MOBILE_LANDSCAPE_COLS = 4;

const GAP_VH = 2;
const CONTAINER_PADDING_VH = GAP_VH / 2;

const BORDER_RADIUS = "1rem";
const MIN_COL_FRACTION = 0.15;
const MAX_COL_FRACTION = 0.33;

const ACTIVE_COL_MULTIPLIER = 2;
const MAX_BLOCK_HEIGHT_VH = 40;
const MIN_BLOCK_HEIGHT_VH = 10;

const TRANSITION_DURATION = 1; // ⏱️ Altura/largura
const HOVER_SCALE_DURATION = 0.1; // ⏱️ Hover

// ╔═════════════════════════════╗
// ║ 🔧 FUNÇÃO PRINCIPAL: CRIA GRID ║
// ╚═════════════════════════════╝
export function createModularGrid({ containerId, totalBlocks = 20 }) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";
  container.style.display = "flex";
  container.style.gap = `${GAP_VH}vh`;
  container.style.padding = `${CONTAINER_PADDING_VH}vh`;
  container.style.width = "100%";
  container.style.maxWidth = "100vw";
  container.style.boxSizing = "border-box";
  container.style.overflow = "hidden";

  const colCount = getResponsiveColumnCount(container);
  let currentExpandedCol = null;

  let colFractions = generateNormalizedFractions(
    colCount,
    MIN_COL_FRACTION,
    MAX_COL_FRACTION
  );

  const columns = [];
  const columnHeights = new Array(colCount).fill(0);

  for (let i = 0; i < colCount; i++) {
    const col = document.createElement("div");
    col.classList.add("grid-column");
    col.style.display = "flex";
    col.style.flexDirection = "column";
    col.style.gap = `${GAP_VH}vh`;
    col.style.flex = `${colFractions[i]} 1 0`;
    col.style.transition = `flex ${TRANSITION_DURATION}s ease`;
    columns.push(col);
    container.appendChild(col);
  }

  for (let i = 0; i < totalBlocks; i++) {
    const colIndex = i % colCount;
    const block = document.createElement("div");
    block.classList.add("modular-block");

    block.textContent = i + 1;
    block.style.width = "100%";
    block.style.backgroundColor = `hsl(${(i * 360) / totalBlocks}, 80%, 60%)`;
    block.style.borderRadius = BORDER_RADIUS;
    block.style.display = "flex";
    block.style.alignItems = "center";
    block.style.justifyContent = "center";
    block.style.fontSize = "2vh";
    block.style.color = "#fff";
    block.style.fontWeight = "bold";
    block.style.cursor = "pointer";
    block.style.transition = `
      height ${TRANSITION_DURATION}s ease,
      transform ${HOVER_SCALE_DURATION}s ease
    `;

    const initialHeight =
      MIN_BLOCK_HEIGHT_VH +
      Math.random() * (MAX_BLOCK_HEIGHT_VH - MIN_BLOCK_HEIGHT_VH);
    block.dataset.originalHeight = initialHeight;
    block.style.height = `${initialHeight}vh`;

    columnHeights[colIndex] += initialHeight;
    columns[colIndex].appendChild(block);

    // 🎯 Clique para expansão
    block.addEventListener("click", () => {
      const currentHeight = parseFloat(block.style.height);
      const currentCol = colIndex;

      const targetWidthPx =
        (container.clientWidth / colCount) * ACTIVE_COL_MULTIPLIER;
      const targetWidthFraction = targetWidthPx / container.clientWidth;

      const vhPerPx = 100 / window.innerHeight;
      const targetHeight = targetWidthPx * vhPerPx;

      const currentWidthFraction = colFractions[currentCol];

      const alreadyAtTarget =
        Math.abs(currentHeight - targetHeight) < 0.5 &&
        Math.abs(currentWidthFraction - targetWidthFraction) < 0.01;

      if (alreadyAtTarget) return;

      currentExpandedCol = currentCol;

      // ✅ Aplica classe "is-active" para hover
      document
        .querySelectorAll(".modular-block.is-active")
        .forEach((b) => b.classList.remove("is-active"));
      block.classList.add("is-active");

      colFractions = computeFixedExpansion(
        colFractions,
        currentCol,
        targetWidthPx,
        container.clientWidth
      );

      columns.forEach((col, i) => {
        col.style.flex = `${colFractions[i]} 1 0`;
      });

      const totalHeight = columnHeights[currentCol];
      const remainingHeight = totalHeight - targetHeight;

      const siblings = [...columns[currentCol].children];
      const others = siblings.filter((b) => b !== block);
      const othersTotal = siblings.reduce(
        (sum, b) =>
          b === block ? sum : sum + parseFloat(b.dataset.originalHeight),
        0
      );

      // ✅ Reforça a transição de altura para garantir animação
      block.style.transition = `height ${TRANSITION_DURATION}s ease`;
      block.getBoundingClientRect(); // força reflow
      requestAnimationFrame(() => {
        block.style.height = `${targetHeight}vh`;
      });

      // Ajusta os outros blocos
      others.forEach((b) => {
        const orig = parseFloat(b.dataset.originalHeight);
        const ratio = orig / othersTotal;
        const newHeight = remainingHeight * ratio;
        b.style.transition = `height ${TRANSITION_DURATION}s ease`;
        b.style.height = `${newHeight}vh`;
      });
    });

    // 🖱️ Hover com efeito pulso
    block.addEventListener("mouseenter", () => {
      block.style.transition = `transform ${HOVER_SCALE_DURATION}s ease`;
      block.style.transform = "scale(1.05)";
      block.style.zIndex = "2";

      setTimeout(() => {
        block.style.transform = "scale(1)";
        block.style.zIndex = "1";
      }, HOVER_SCALE_DURATION * 1000);
    });
  }
}

// ╔═══════════════════════════════════════╗
// ║ 📐 EXPANSÃO COM VALOR FIXO ABSOLUTO   ║
// ╚═══════════════════════════════════════╝
function computeFixedExpansion(
  fractions,
  expandedIndex,
  targetWidthPx,
  containerWidthPx
) {
  const remainingWidth = containerWidthPx - targetWidthPx;
  const othersTotal = fractions.reduce(
    (sum, f, i) => (i === expandedIndex ? sum : sum + f),
    0
  );

  return fractions.map((f, i) => {
    if (i === expandedIndex) return targetWidthPx / containerWidthPx;
    const proportion = f / othersTotal;
    const newPx = proportion * remainingWidth;
    return newPx / containerWidthPx;
  });
}

// ╔══════════════════════════════╗
// ║ 🧠 RESPONSIVIDADE DAS COLUNAS ║
// ╚══════════════════════════════╝
function getResponsiveColumnCount(container) {
  const width = container.clientWidth;
  const height = window.innerHeight;
  const isPortrait = height > width;
  if (width < 768)
    return isPortrait ? MOBILE_PORTRAIT_COLS : MOBILE_LANDSCAPE_COLS;
  return Math.max(MIN_COLS, Math.min(MAX_COLS, Math.floor(width / 200)));
}

// ╔═════════════════════════════════╗
// ║ 🔢 GERA FRAÇÕES ALEATÓRIAS      ║
// ╚═════════════════════════════════╝
function generateNormalizedFractions(count, min, max) {
  const raw = Array.from(
    { length: count },
    () => min + Math.random() * (max - min)
  );
  const total = raw.reduce((sum, val) => sum + val, 0);
  return raw.map((val) => val / total);
}

// ╔══════════════════════════════╗
// ║ 🔁 ATUALIZAÇÃO EM RESIZE     ║
// ╚══════════════════════════════╝
window.addEventListener("resize", () => {
  createModularGrid({ containerId: "grid-container", totalBlocks: 20 });
});
