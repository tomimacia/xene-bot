let count = 0;
export const checkIfTicket = async (page, selector) => {
  try {
    await page.waitForSelector(selector, { timeout: 500 });
    await page.click(selector);
  } catch (e) {
    count++;
    if (count < 20) {
      await page.reload();
      await checkIfTicket(page, selector);
    } else console.log("Terminado");
  }
};
