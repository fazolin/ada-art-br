import inquirer from "inquirer";
import fs from "fs-extra";
import slugify from "slugify";
import sharp from "sharp";
import path from "path";

// Paths and configuration
// Paths and configuration
const jsonPath = "./src/data/trabalhos.json";
const mediaBasePath = "./src/assets/trabalhos";
const validExtensions = [".jpg", ".jpeg", ".png", ".bmp", ".webp"];

/**
 * Ensures the JSON file exists and is valid.
 * If not, it initializes an empty array.
 */
async function ensureValidJSON() {
  try {
    if (!(await fs.pathExists(jsonPath))) {
      await fs.outputJSON(jsonPath, []);
      return [];
    }

    const content = await fs.readFile(jsonPath, "utf-8");
    if (!content.trim()) {
      await fs.writeJSON(jsonPath, []);
      return [];
    }

    return JSON.parse(content);
  } catch (err) {
    console.warn("⚠️ Invalid JSON. Resetting to empty list.");
    await fs.writeJSON(jsonPath, []);
    return [];
  }
}

/**
 * Prints a quick summary of the project to the console.
 */
function displaySummary(data) {
  console.log("\n📄 Project summary:");
  console.log(`• Title: ${data.title}`);
  console.log(`• Slug: ${slugify(data.title, { lower: true, strict: true })}`);
  console.log(`• Year: ${data.year}`);
  console.log(`• Full description: ${data.description}`);
  console.log(`• Short description: ${data.shortDescription}`);
  console.log(`• Tags: ${data.tags}`);
  console.log(`• Credits: ${data.credits}`);
  if (data.youtube) console.log(`• YouTube ID: ${data.youtube}`);
}

/**
 * Collects user input for a new project.
 */
async function collectData() {
  const answers = await inquirer.prompt([
    { name: "title", message: "Project title:" },
    { name: "year", message: "Year of creation:" },
    { name: "description", message: "Full description:" },
    { name: "shortDescription", message: "Short description:" },
    { name: "tags", message: "Tags (comma-separated):" },
    { name: "credits", message: "Credits (technical sheet):" },
    { name: "youtube", message: "YouTube video ID (leave blank if none):" },
  ]);

  displaySummary(answers);
  return answers;
}

/**
 * Converts and resizes all valid image files in the folder to PNG format,
 * saving both full and low-res versions, and moving originals to a trash subfolder.
 */
async function convertImagesToPNG(slug, folderPath) {
  const files = await fs.readdir(folderPath);
  const convertedImages = [];
  const trashPath = path.join(folderPath, "trash");
  await fs.ensureDir(trashPath);
  let index = 1;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!validExtensions.includes(ext)) continue;

    const baseName = `${slug} (${index})`;
    const originalPath = path.join(folderPath, file);
    const fullOutput = path.join(folderPath, `${baseName}.png`);
    const lowOutput = path.join(folderPath, `${baseName}.low.png`);
    const trashTarget = path.join(trashPath, file);

    try {
      await sharp(originalPath).png().toFile(fullOutput);
      await sharp(originalPath).resize({ width: 480 }).png().toFile(lowOutput);

      convertedImages.push({ index, name: `${baseName}.png` });
      index++;

      await fs.move(originalPath, trashTarget, { overwrite: true });
    } catch (err) {
      console.warn(`Error processing ${file}:`, err.message);
    }
  }

  return convertedImages;
}

/**
 * Main routine to create a new project, gather data, process images and save to JSON.
 */
async function createProject() {
  const answers = await collectData();
  const slug = slugify(answers.title, { lower: true, strict: true });
  const destinationFolder = path.join(mediaBasePath, slug);
  await fs.ensureDir(destinationFolder);

  console.log(`\n📂 Please paste the images into: ${destinationFolder}`);
  await inquirer.prompt([
    {
      name: "continue",
      message: "→ Press ENTER when ready to process images",
      type: "input",
    },
  ]);

  const images = await convertImagesToPNG(slug, destinationFolder);
  if (images.length === 0) {
    console.error("❌ No valid images found.");
    return;
  }

  console.log("\n🖼️ Converted images:");
  images.forEach((img) => {
    console.log(`  ${img.index}. ${img.name}`);
  });

  const { thumbIndex } = await inquirer.prompt([
    {
      name: "thumbIndex",
      message: "Which image index should be used as thumbnail?",
      type: "number",
      validate: (value) => {
        return images.some((img) => img.index === value)
          ? true
          : "Invalid index.";
      },
    },
  ]);

  // Prepare the new project object
  const newProject = {
    slug,
    title: answers.title,
    year: parseInt(answers.year),
    description: answers.description,
    shortDescription: answers.shortDescription,
    tags: answers.tags.split(",").map((t) => t.trim()),
    credits: answers.credits,
    thumb: thumbIndex,
    totalImages: images.length,
  };

  if (answers.youtube) {
    newProject.media = { youtube: answers.youtube };
  }

  // Load and update the JSON
  const projects = await ensureValidJSON();
  if (projects.some((p) => p.slug === slug)) {
    console.error(`❌ A project with slug "${slug}" already exists.`);
    return;
  }

  projects.push(newProject);
  await fs.writeJSON(jsonPath, projects, { spaces: 2 });

  console.log(`\n✅ Project "${answers.title}" created successfully!`);
  console.log(`📁 Images saved to: ${destinationFolder}`);
  console.log(
    `🗑️ Originals moved to: ${path.join(destinationFolder, "trash")}`
  );
}

/**
 * Entry point: loops project creation if user wants to add more.
 */
async function main() {
  do {
    await createProject();
    const { repeat } = await inquirer.prompt([
      {
        name: "repeat",
        type: "confirm",
        message: "Do you want to add another project?",
        default: false,
      },
    ]);
    if (!repeat) break;
  } while (true);
}

main();
