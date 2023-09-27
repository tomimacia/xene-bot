export const logIn = async (page, creds) => {
  const [thisPage] = await Promise.all([
    new Promise((resolve) => page.once("popup", resolve)),
    page.click("#loginButton2"),
  ]);
  await thisPage.waitForSelector("#email");
  await thisPage.type("input[type=email]", creds.email);
  await thisPage.type("input[type=password]", creds.password);
  await thisPage.click("form button[type=submit]");
};
