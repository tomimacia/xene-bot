export const restart = async (page,checkSectores) => {
  await page.reload();
  await checkSectores(page);
};
