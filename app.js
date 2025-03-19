let app;
let container;
let textures = {};

const badge = {
  name: "DreDre",
  occupation: "Blusher",
  flower: 1,
  heart: 1,
  pearl: 1,
  ribbon: 1,
  star: 1,
  symbol: 1,
};

function createTwoToneDuotoneMatrix(shadowColor, highlightColor) {
  const sr = ((shadowColor >> 16) & 0xff) / 255;
  const sg = ((shadowColor >> 8) & 0xff) / 255;
  const sb = (shadowColor & 0xff) / 255;

  const hr = ((highlightColor >> 16) & 0xff) / 255;
  const hg = ((highlightColor >> 8) & 0xff) / 255;
  const hb = (highlightColor & 0xff) / 255;

  // Calculate the difference between highlight and shadow colors
  const dr = hr - sr;
  const dg = hg - sg;
  const db = hb - sb;

  // Using luminance coefficients
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

function cycleOptions(direction) {
  const select = document.getElementById('occupationInput');
  const selectedIndex = select.selectedIndex;
  
  if (direction === 'prev') {
    select.selectedIndex = selectedIndex > 1 ? selectedIndex - 1 : select.options.length - 1;
  } else if (direction === 'next') {
    select.selectedIndex = selectedIndex < select.options.length - 1 ? selectedIndex + 1 : 1;
  }
  
  handleTextUpdate({ target: select });
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      // Remove previous uploaded image texture if it exists
      if (textures.uploadedImage) {
        PIXI.Assets.unload(textures.uploadedImage);
      }

      // Create a new texture from the uploaded image
      const base64 = e.target.result;
      textures.uploadedImage = await PIXI.Assets.load(base64);

      // Redraw the canvas with the new image
      draw();
    };
    reader.readAsDataURL(file);
  }
}

function handleSelectorUpdate(direction, selectorIndex) {
  const selectorConfig = [
    { property: "flower", max: 3 },
    { property: "heart", max: 3 },
    { property: "pearl", max: 3 },
    { property: "ribbon", max: 2 },
    { property: "star", max: 4 },
    { property: "symbol", max: 2 },
  ];

  const config = selectorConfig[selectorIndex];
  const currentValue = badge[config.property];

  let newValue;
  if (direction === "next") {
    newValue = currentValue + 1;
    if (newValue > config.max) newValue = 0;
  } else {
    newValue = currentValue - 1;
    if (newValue < 0) newValue = config.max;
  }

  badge[config.property] = newValue;

  document.getElementById(`selector${selectorIndex}`).textContent = newValue;

  draw();
}

function handleTextUpdate(event) {
  const targetId = event.target.id;
  switch (targetId) {
    case "nameInput":
      badge.name = event.target.value;
      break;
    case "occupationInput":
      badge.occupation = event.target.value;
      break;
    default:
      break;
  }
  badge.text = document.getElementById("nameInput").value;
  draw();
}

function startBuilder() {
  // Validate inputs before proceeding
  const name = document.getElementById("nameInput").value.trim();
  const occupation = document.getElementById("occupationInput").value;
  
  if (!name) {
    alert("Por favor, insira seu nome");
    return;
  }
  
  if (!occupation) {
    alert("Por favor, escolha sua ocupação");
    return;
  }

  document.getElementById("homeScreen").classList.remove("active");
  document.getElementById("builderScreen").classList.add("active");
  initPixi();
}

async function initPixi() {
  // Get container dimensions
  const containerDiv = document.getElementById("builderScreen");
  const containerWidth = containerDiv.clientWidth;
  const containerHeight = containerWidth / (1063 / 591); // Maintain 1063:591 ratio

  // Initialize PixiJS with responsive dimensions
  app = new PIXI.Application();
  await app.init({
    width: 1063,
    height: 591,
    backgroundAlpha: 0,
    resolution: window.devicePixelRatio || 1,
  });
  containerDiv.appendChild(app.canvas);
  app.canvas.style.width = `${containerWidth}px`;
  app.canvas.style.height = `${containerHeight}px`;

  // Load textures
  await loadTextures();

  // Create container
  container = new PIXI.Container();
  app.stage.addChild(container);
  container.position.set(0, 0);
  await draw();

  window.addEventListener("resize", () => {
    const newWidth = containerDiv.clientWidth;
    const newHeight = newWidth / (1063 / 591);

    app.renderer.resize(1063, 591);
    app.canvas.style.width = `${newWidth}px`;
    app.canvas.style.height = `${newHeight}px`;
  });
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
  textures["pearl1"] = await PIXI.Assets.load(
    "./assets/carteirinha/pearl/pink.png"
  );
  textures["pearl2"] = await PIXI.Assets.load(
    "./assets/carteirinha/pearl/blue.png"
  );
  textures["pearl3"] = await PIXI.Assets.load(
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
  textures["symbol1"] = await PIXI.Assets.load(
    "./assets/carteirinha/symbol/key.png"
  );
  textures["symbol2"] = await PIXI.Assets.load(
    "./assets/carteirinha/symbol/heart.png"
  );
  textures["logo"] = await PIXI.Assets.load("./assets/blushrosa.png");
  await PIXI.Assets.load("./assets/font1.otf");
}

function draw() {
  container.removeChildren();

  // Add the base
  const base = new PIXI.Sprite(textures.base);
  base.anchor.set(0.5);
  base.x = Math.ceil(app.screen.width / 2) + 0.2;
  base.y = Math.ceil(app.screen.height / 2) - 1;
  container.addChild(base);

  if (textures.uploadedImage) {
    const uploadedSprite = new PIXI.Sprite(textures.uploadedImage);

    // Position and size
    uploadedSprite.x = 150;
    uploadedSprite.y = 100;

    // Set target width and force 3:4 aspect ratio
    const targetWidth = app.screen.width * 0.22;
    const targetHeight = (targetWidth / 3) * 4;
    uploadedSprite.width = targetWidth;
    uploadedSprite.height = targetHeight;

    const colorMatrix = new PIXI.ColorMatrixFilter();
    colorMatrix.matrix = createTwoToneDuotoneMatrix(0x984f79, 0xFFFFFF);

    const brightnessFilter = new PIXI.ColorMatrixFilter();
    brightnessFilter.brightness(1.1)

    uploadedSprite.filters = [colorMatrix, brightnessFilter];

    container.addChild(uploadedSprite);
  }

  // Add the decorations
  const flower = new PIXI.Sprite(textures[`flower${badge.flower}`]);
  flower.anchor.set(0.5);
  flower.x = app.screen.width / 2;
  flower.y = app.screen.height / 2;
  container.addChild(flower);

  const heart = new PIXI.Sprite(textures[`heart${badge.heart}`]);
  heart.anchor.set(0.5);
  heart.x = app.screen.width / 2;
  heart.y = (app.screen.height / 2) + 30;
  container.addChild(heart);

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

  const symbol = new PIXI.Sprite(textures[`symbol${badge.symbol}`]);
  symbol.anchor.set(0.5);
  symbol.x = app.screen.width / 2;
  symbol.y = app.screen.height / 2;
  container.addChild(symbol);

  const logo = new PIXI.Sprite(textures.logo);
  logo.x = 450;
  logo.y = 100;
  container.addChild(logo);

  // Add the name text (your existing text code)
  const textStyle = new PIXI.TextStyle({
    fontFamily: "font1",
    fontSize: 76,
    fill: "#a085de",
    wordWrap: true,
    wordWrapWidth: 440,
  });

  const name = new PIXI.Text({
    text: badge.name,
    style: textStyle,
  });
  name.x = 450;
  name.y = 360;
  container.addChild(name);

  const occupation = new PIXI.Text({
    text: badge.occupation,
    style: textStyle,
  });
  occupation.x = 450;
  occupation.y = 460;
  container.addChild(occupation);
}

function saveBadge() {
  const link = document.createElement("a");
  link.download = "my-badge.png";
  link.href = app.view.toDataURL();
  link.click();
}