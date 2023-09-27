import puppeteer from "puppeteer";
import { logIn } from "./login.js";
import { lugaresSelect, palcos, plateas } from "./secciones.js";
import { restart } from "./restart.js";
const URL = "https://soysocio.bocajuniors.com.ar/";
// const creds = {
//   email: "juliparadisol@gmail.com",
//   password: "Juli42913365",
// };

const creds = {
  email: "facundodalpra2015@gmail.com",
  password: "Facu1234",
};
const sectoresABuscar = [...palcos, ...plateas];
const waitAndClick = async (page, selector, time) => {
  await page.waitForSelector(selector, { timeout: time });
  await page.click(selector);
};
const SeleccionarPartido = async (page, selector, partido, time) => {
  await page.waitForSelector(selector, { timeout: time });
  const buttons = await page.$$(selector);
  await buttons[partido - 1].evaluate((b) => b.click());
};
const irASectores = async (page) => {
  await page.goto(`${URL}comprar.php`);
  await SeleccionarPartido(page, "div .columna3 a", 1, 10000);
  await waitAndClick(page, "#btnPlatea", 10000);
};
const checkSectores = async (page) => {
  await page.waitForSelector("switch g");

  const sectoresHTML = await page.$$("switch g");
  let sectores = [];
  for (let sector of sectoresHTML) {
    sectores.push(
      await sector.evaluate((x) => {
        return { id: x.id, class: Object.values(x.classList) };
      })
    );
  }
  let sectorSeleccionado = "";
  let sectoresFiltrados = sectores.filter((s) =>
    sectoresABuscar.includes(s.id)
  );
  if (
    sectoresFiltrados.some((sector) =>
      sector.class.some((c) => c === "enabled")
    )
  ) {
    sectorSeleccionado = sectoresFiltrados.find((s) =>
      s.class.some((c) => c === "enabled")
    ).id;
    // await waitAndClick(page, "switch g .enabled", 10000);
    console.log(`Encontrado en sector ${sectorSeleccionado}`);
    await waitAndClick(page, `#${sectorSeleccionado}`, 10000);

    await waitAndClick(page, ".loc.d", 10000);

    const button = await page.$$("div #btnReservar");
    await button[0].evaluate((b) => b.click());
    const cartel = await page.waitForSelector(".isa_info .message-box-wrap", {
      visible: true,
      timeout: 400000,
    });
    const content = await cartel.evaluate((x) => x.textContent);
    if (content === "La ubicación ya no se encuentra disponible") {
      await restart(page, checkSectores);
    }
    console.log(content);
    // content funciona y da el texto
  } else {
    await restart(page, checkSectores);
  }
};
let intentos = 1;
const reservarPlateaPalco = async (page) => {
  await irASectores(page);
  await checkSectores(page);
};

// Funcion incompleta
const reservarPopular = async () => {
  await page.goto(`${URL}eventos_inscripcion.php`);
  const button = await page.$$("div #btnReservar");
  await button[0].evaluate((b) => b.click());
};
const getTickets = async (url) => {
  console.log(`Intento: ${intentos}`);
  const browser = await puppeteer.launch({
    headless: false,
    ignoreDefaultArgs: ["--mute-audio"],
    args: ["--autoplay-policy=no-user-gesture-required"],
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  const [page] = await browser.pages();
  await page.setViewport({ width: 1366, height: 766 });
  await page.goto(url);
  await page.waitForSelector("#loginButton2", { timeout: 100000 });
  await logIn(page, creds);
  try {
    await waitAndClick(page, ".popup_imagen_close", 10000);
    await reservarPlateaPalco(page);
    // await checkIfTicket(page, ".ticket");
  } catch (e) {
    console.log(e.message);
    browser.close();
    intentos++;
    getTickets(URL);
  }
};
getTickets(URL);
// startFromZero()
