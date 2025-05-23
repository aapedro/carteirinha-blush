let app;
let container;
let textures = {};
let selectedDecoration = "photo";
let duoToneColor = 0x2e8b57;

const badge = {
  name: "",
  occupation: "blogueira profissional",
  photo: 1,
  flower: 1,
  heart: 1,
  pearl: 2,
  ribbon: 1,
  star: 1,
  symbol: 2,
  logo: 1,
};

const colorMap = {
  green: 1,
  1: "green",
  pink: 2,
  2: "pink",
  blue: 3,
  3: "blue",
  purple: 4,
  4: "purple",
};

const duoToneMap = {
  green: 0x2e8b57, // Darker green
  pink: 0x984f79, // Darker pink (medium violet red)
  blue: 0x4682b4, // Darker blue (steel blue)
  purple: 0x6a5acd, // Darker purple (slate blue)
};

function createTwoToneDuotoneMatrix(shadowColor, highlightColor) {
  const sr = ((shadowColor >> 16) & 0xff) / 255;
  const sg = ((shadowColor >> 8) & 0xff) / 255;
  const sb = (shadowColor & 0xff) / 255;

  const hr = ((highlightColor >> 16) & 0xff) / 255;
  const hg = ((highlightColor >> 8) & 0xff) / 255;
  const hb = (highlightColor & 0xff) / 255;

  const dr = hr - sr;
  const dg = hg - sg;
  const db = hb - sb;

  const lumR = 0.3086;
  const lumG = 0.6094;
  const lumB = 0.082;

  return [
    lumR * dr,
    lumG * dr,
    lumB * dr,
    0,
    sr,
    lumR * dg,
    lumG * dg,
    lumB * dg,
    0,
    sg,
    lumR * db,
    lumG * db,
    lumB * db,
    0,
    sb,
    0,
    0,
    0,
    1,
    0,
  ];
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (textures.uploadedImage) {
        PIXI.Assets.unload(textures.uploadedImage);
      }

      const base64 = e.target.result;
      textures.uploadedImage = await PIXI.Assets.load(base64);
    };
    reader.readAsDataURL(file);
  }
}

function handleTextUpdate(event) {
  const targetId = event.target.id;
  switch (targetId) {
    case "input-name":
      badge.name = event.target.value;
      break;
    case "input-occupation":
      badge.occupation = event.target.value;
      break;
    default:
      break;
  }
  badge.text = document.getElementById("input-name").value;
}

function initBuilderUI() {
  document
    .querySelector('.builder-decoration-btn[data-type="flower"]')
    .classList.add("active");

  const decorationButtons = document.querySelectorAll(
    ".builder-decoration-btn"
  );
  decorationButtons.forEach((button) => {
    button.addEventListener("click", handleDecorationSelect);
  });

  const colorButtons = document.querySelectorAll(".builder-color-btn");
  colorButtons.forEach((button) => {
    button.addEventListener("click", handleColorSelect);
  });

  updateColorButtonsVisibility();
}

function handleDecorationSelect(event) {
  document.querySelectorAll(".builder-decoration-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  const button = event.currentTarget;
  button.classList.add("active");

  selectedDecoration = button.getAttribute("data-type");

  updateColorButtonsVisibility();

  const colorIndex = badge[selectedDecoration];
  const colorName = colorMap[colorIndex];

  const colorBtn = document.querySelector(
    `.builder-color-btn[data-color="${colorName}"]`
  );

  colorBtn.click();
}

function handleColorSelect(event) {
  document.querySelectorAll(".builder-color-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  const button = event.currentTarget;
  button.classList.add("active");

  const selectedColor = button.getAttribute("data-color");

  updateBadgeDecoration(selectedDecoration, selectedColor);
}

function updateColorButtonsVisibility() {
  const colorButtons = document.querySelector(".builder-color-btns");

  colorButtons.style.display = "flex";

  const availableColors = getAvailableColorsForDecoration(selectedDecoration);

  document.querySelectorAll(".builder-color-btn").forEach((button) => {
    const color = button.getAttribute("data-color");
    if (availableColors.includes(color)) {
      button.style.display = "block";
      if (availableColors.indexOf(color) === 0) {
        button.classList.add("active");
      }
    } else {
      button.style.display = "none";
      button.classList.remove("active");
    }
  });
}

function getAvailableColorsForDecoration(decoration) {
  switch (decoration) {
    case "photo":
      return ["green", "pink", "blue"];
    case "flower":
      return ["green", "pink", "blue"];
    case "heart":
      return ["green", "pink", "blue"];
    case "pearl":
      return ["pink", "blue", "purple"];
    case "ribbon":
      return ["green", "pink"];
    case "star":
      return ["green", "pink", "blue", "purple"];
    case "symbol":
      return ["pink", "purple"];
    case "logo":
      return ["green", "pink", "blue", "purple"];
    default:
      return ["green", "pink", "blue"];
  }
}

function updateBadgeDecoration(decoration, color) {
  let colorIndex;
  switch (decoration) {
    case "photo":
      duoToneColor = duoToneMap[color];
    default:
      colorIndex = colorMap[color] || 1;
  }

  badge[decoration] = colorIndex;

  draw();
}

function startBuilder() {
  const name = document.getElementById("input-name").value.trim();
  const occupation = document.getElementById("input-occupation").value;

  if (!name) {
    alert("Por favor, insira seu nome");
    return;
  }

  if (!occupation) {
    alert("Por favor, escolha sua ocupação");
    return;
  }

  document.getElementById("screen-home").classList.remove("active");
  document.getElementById("screen-builder").classList.add("active");
  document.body.classList.add("builder-active");
  initPixi();
  initBuilderUI();
}

async function initPixi() {
  const builderScreen = document.getElementById("screen-builder");

  app = new PIXI.Application();
  await app.init({
    width: 1063,
    height: 591,
    backgroundAlpha: 0,
    resolution: 1,
  });

  builderScreen.insertBefore(app.canvas, builderScreen.firstChild);

  await loadTextures();

  container = new PIXI.Container();
  app.stage.addChild(container);
  container.position.set(0, 0);
  await draw();
}

async function loadTextures() {
  textures["base"] = await PIXI.Assets.load("./assets/carteirinha/base.png");
  textures["heart1"] = await PIXI.Assets.load(
    "./assets/carteirinha/heart/green.png"
  );
  textures["heart2"] = await PIXI.Assets.load(
    "./assets/carteirinha/heart/pink.png"
  );
  textures["heart3"] = await PIXI.Assets.load(
    "./assets/carteirinha/heart/blue.png"
  );
  textures["flower1"] = await PIXI.Assets.load(
    "./assets/carteirinha/flower/green.png"
  );
  textures["flower2"] = await PIXI.Assets.load(
    "./assets/carteirinha/flower/pink.png"
  );
  textures["flower3"] = await PIXI.Assets.load(
    "./assets/carteirinha/flower/blue.png"
  );
  textures["pearl2"] = await PIXI.Assets.load(
    "./assets/carteirinha/pearl/pink.png"
  );
  textures["pearl3"] = await PIXI.Assets.load(
    "./assets/carteirinha/pearl/blue.png"
  );
  textures["pearl4"] = await PIXI.Assets.load(
    "./assets/carteirinha/pearl/purple.png"
  );
  textures["ribbon1"] = await PIXI.Assets.load(
    "./assets/carteirinha/ribbon/green.png"
  );
  textures["ribbon2"] = await PIXI.Assets.load(
    "./assets/carteirinha/ribbon/pink.png"
  );
  textures["star1"] = await PIXI.Assets.load(
    "./assets/carteirinha/star/green.png"
  );
  textures["star2"] = await PIXI.Assets.load(
    "./assets/carteirinha/star/pink.png"
  );
  textures["star3"] = await PIXI.Assets.load(
    "./assets/carteirinha/star/blue.png"
  );
  textures["star4"] = await PIXI.Assets.load(
    "./assets/carteirinha/star/purple.png"
  );
  textures["symbol2"] = await PIXI.Assets.load(
    "./assets/carteirinha/symbol/pink.png"
  );
  textures["symbol4"] = await PIXI.Assets.load(
    "./assets/carteirinha/symbol/purple.png"
  );
  textures["logo1"] = await PIXI.Assets.load(
    "./assets/carteirinha/logo/green.png"
  );
  textures["logo2"] = await PIXI.Assets.load(
    "./assets/carteirinha/logo/pink.png"
  );
  textures["logo3"] = await PIXI.Assets.load(
    "./assets/carteirinha/logo/blue.png"
  );
  textures["logo4"] = await PIXI.Assets.load(
    "./assets/carteirinha/logo/purple.png"
  );
  await PIXI.Assets.load("./assets/font1.otf");
}

function draw() {
  container.removeChildren();

  const base = new PIXI.Sprite(textures.base);
  base.anchor.set(0.5);
  base.x = Math.ceil(app.screen.width / 2) + 0.2;
  base.y = Math.ceil(app.screen.height / 2) - 1;
  container.addChild(base);

  if (textures.uploadedImage) {
    const uploadedSprite = new PIXI.Sprite(textures.uploadedImage);

    uploadedSprite.x = 150;
    uploadedSprite.y = 100;

    const targetWidth = app.screen.width * 0.25;
    const targetHeight = (targetWidth / 3) * 4;
    uploadedSprite.width = targetWidth;
    uploadedSprite.height = targetHeight;

    const colorMatrix = new PIXI.ColorMatrixFilter();
    colorMatrix.matrix = createTwoToneDuotoneMatrix(duoToneColor, 0xffffff);

    const brightnessFilter = new PIXI.ColorMatrixFilter();
    brightnessFilter.brightness(1.1);

    uploadedSprite.filters = [colorMatrix, brightnessFilter];

    container.addChild(uploadedSprite);
  }

  const flower = new PIXI.Sprite(textures[`flower${badge.flower}`]);
  flower.anchor.set(0.5);
  flower.x = app.screen.width / 2;
  flower.y = app.screen.height / 2;
  container.addChild(flower);

  const heart = new PIXI.Sprite(textures[`heart${badge.heart}`]);
  heart.anchor.set(0.5);
  heart.x = app.screen.width / 2;
  heart.y = app.screen.height / 2 + 30;
  container.addChild(heart);

  const symbol = new PIXI.Sprite(textures[`symbol${badge.symbol}`]);
  symbol.anchor.set(0.5);
  symbol.x = app.screen.width / 2;
  symbol.y = app.screen.height / 2;
  container.addChild(symbol);

  const pearl = new PIXI.Sprite(textures[`pearl${badge.pearl}`]);
  pearl.anchor.set(0.5);
  pearl.x = app.screen.width / 2;
  pearl.y = app.screen.height / 2;
  container.addChild(pearl);

  const star = new PIXI.Sprite(textures[`star${badge.star}`]);
  star.anchor.set(0.5);
  star.x = app.screen.width / 2;
  star.y = app.screen.height / 2;
  container.addChild(star);

  const ribbon = new PIXI.Sprite(textures[`ribbon${badge.ribbon}`]);
  ribbon.anchor.set(0.5);
  ribbon.x = app.screen.width / 2;
  ribbon.y = app.screen.height / 2;
  container.addChild(ribbon);

  const logo = new PIXI.Sprite(textures[`logo${badge.logo}`]);
  logo.x = 450;
  logo.y = 100;
  container.addChild(logo);

  const textStyle = new PIXI.TextStyle({
    fontFamily: "font1",
    fontSize: 65,
    fill: "#394070",
    wordWrap: true,
    wordWrapWidth: 400,
    lineHeight: 50,
  });

  const name = new PIXI.Text({
    text: badge.name,
    style: textStyle,
  });
  name.x = 450;
  name.y = 355;
  container.addChild(name);

  const occupation = new PIXI.Text({
    text: badge.occupation,
    style: textStyle,
  });
  occupation.x = 450;
  occupation.y = 460;
  container.addChild(occupation);
}

function showFinalScreen() {
  // First ensure the canvas is fully rendered
  app.render(); // Force a render

  // Wait for the next frame to ensure rendering is complete
  requestAnimationFrame(() => {
    // Get the canvas as a data URL
    const dataURL = app.canvas.toDataURL("image/png");

    // Create an image element to display the badge
    const img = document.createElement("img");
    img.src = dataURL;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "contain";

    // Clear and update the final image container
    const finalImgContainer = document.getElementById("final-img-container");
    finalImgContainer.insertBefore(img, finalImgContainer.firstChild);

    // Update screen visibility
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.remove("active");
    });
    document.getElementById("screen-final").classList.add("active");

    // Update body classes
    document.body.classList.remove("builder-active");
    document.body.classList.add("final-active");
  });
}

function saveBadge() {
  const link = document.createElement("a");
  link.download = "my-badge.png";
  link.href = app.canvas.toDataURL();
  link.click();
}
