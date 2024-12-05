import { chromium } from "playwright";

async function scrapeAllCategories() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(
    "https://www.venex.com.ar/componentes-de-pccomponentes-de-pc",
  );

  try {
    await page.waitForSelector("ul.menu-item-list", { timeout: 10000 });
  } catch (error) {
    console.error("No se pudo encontrar el selector de categorías:", error);
    await browser.close();

    return;
  }

  await page.waitForTimeout(5000);

  const categories = await page.$$eval("ul.menu-item-list li", (items) => {
    return items.map((item) => {
      const categoryLink = item.querySelector("a.item")?.href; // Enlace de la categoría principal
      const categoryName = item.querySelector("a.item span")?.innerText.trim(); // Nombre de la categoría principal

      const subcategories = Array.from(
        item.querySelectorAll(".submenu-cont .subcategory-title"),
      ).map((subitem) => {
        return {
          name: subitem.innerText.trim(),
          link: subitem.href,
        };
      });

      return {
        name: categoryName,
        link: categoryLink,
        subcategories: subcategories,
      };
    });
  });

  const extractedLinks = categories.map((category) => {
    if (!category.link) return null;

    const regex =
      /https:\/\/www\.venex\.com\.ar\/componentes-de-pccomponentes-de-pc\/(.*)/;
    const match = category.link.match(regex); // Buscar coincidencias
    const extractedLink = match ? match[1] : null; // Extraer la parte deseada si hay coincidencias

    return {
      name: category.name,
      extractedLink: extractedLink,
      subcategories: category.subcategories,
    };
  });

  console.log(
    "Categorías y subcategorías con enlaces extraídos:",
    extractedLinks.filter((link) => link !== null),
  );

  await browser.close();
}

// Ejecutar la función de scraping
scrapeAllCategories().catch(console.error);
