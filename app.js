let app;
let container;
let textures = {};
let selectedDecoration = "flower";

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
}

function initBuilderUI() {
  document.querySelector('.decoration-btn[data-type="flower"]').classList.add('active');
  
  const decorationButtons = document.querySelectorAll('.decoration-btn');
  decorationButtons.forEach(button => {
    button.addEventListener('click', handleDecorationSelect);
  });
  
  const colorButtons = document.querySelectorAll('.color-btn');
  colorButtons.forEach(button => {
    button.addEventListener('click', handleColorSelect);
  });

  updateColorButtonsVisibility();
}

function handleDecorationSelect(event) {
  document.querySelectorAll('.decoration-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const button = event.currentTarget;
  button.classList.add('active');
  
  selectedDecoration = button.getAttribute('data-type');
  
  updateColorButtonsVisibility();
}

function handleColorSelect(event) {
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const button = event.currentTarget;
  button.classList.add('active');
  
  const selectedColor = button.getAttribute('data-color');
  
  updateBadgeDecoration(selectedDecoration, selectedColor);
}

function updateColorButtonsVisibility() {
  const colorButtons = document.querySelector('.color-buttons');
  
  if (selectedDecoration === 'photo') {
    colorButtons.style.display = 'none';
  } else {
    colorButtons.style.display = 'flex';
    
    const availableColors = getAvailableColorsForDecoration(selectedDecoration);
    
    document.querySelectorAll('.color-btn').forEach(button => {
      const color = button.getAttribute('data-color');
      if (availableColors.includes(color)) {
        button.style.display = 'block';
        if (availableColors.indexOf(color) === 0) {
          button.classList.add('active');
        }
      } else {
        button.style.display = 'none';
        button.classList.remove('active');
      }
    });
  }
}

function getAvailableColorsForDecoration(decoration) {
  switch (decoration) {
    case 'flower':
      return ['green', 'pink', 'blue'];
    case 'heart':
      return ['green', 'pink', 'blue'];
    case 'pearl':
      return ['pink', 'blue', 'purple'];
    case 'ribbon':
      return ['green', 'pink'];
    case 'star':
      return ['green', 'pink', 'blue', 'purple'];
    case 'symbol':
      return ['key', 'heart'];
    default:
      return ['green', 'pink', 'blue'];
  }
}

function updateBadgeDecoration(decoration, color) {
  if (decoration === 'photo') {
    document.getElementById('imageInput').click();
    return;
  }
  
  let colorIndex;
  switch (decoration) {
    case 'symbol':
      colorIndex = color === 'key' ? 1 : 2;
      break;
    default:
      const colorMap = {
        'green': 1,
        'pink': 2,
        'blue': 3,
        'purple': 4
      };
      colorIndex = colorMap[color] || 1;
  }
  
  badge[decoration] = colorIndex;
  
  draw();
}

function startBuilder() {
  const name = document.getElementById("nameInput").value.trim();
  const occupation = document.getElementById("occupationInput").value;
  
  // if (!name) {
  //   alert("Por favor, insira seu nome");
  //   return;
  // }
  
  // if (!occupation) {
  //   alert("Por favor, escolha sua ocupação");
  //   return;
  // }

  document.getElementById("homeScreen").classList.remove("active");
  document.getElementById("builderScreen").classList.add("active");
  initPixi();
  initBuilderUI();
}

async function initPixi() {
  // Changed to use canvasContainer instead of builderScreen
  const canvasContainer = document.getElementById("canvasContainer");
  const builderScreen = document.getElementById("builderScreen");
  const containerWidth = builderScreen.clientWidth;
  const containerHeight = containerWidth / (1063 / 591);

  app = new PIXI.Application();
  await app.init({
    width: 1063,
    height: 591,
    backgroundAlpha: 0,
    resolution: window.devicePixelRatio || 1,
  });
  
  // Append canvas to canvasContainer instead of builderScreen
  canvasContainer.appendChild(app.canvas);
  app.canvas.style.width = `${containerWidth}px`;
  app.canvas.style.height = `${containerHeight}px`;

  await loadTextures();

  container = new PIXI.Container();
  app.stage.addChild(container);
  container.position.set(0, 0);
  await draw();

  window.addEventListener("resize", () => {
    const newWidth = builderScreen.clientWidth;
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

  const base = new PIXI.Sprite(textures.base);
  base.anchor.set(0.5);
  base.x = Math.ceil(app.screen.width / 2) + 0.2;
  base.y = Math.ceil(app.screen.height / 2) - 1;
  container.addChild(base);

  if (textures.uploadedImage) {
    const uploadedSprite = new PIXI.Sprite(textures.uploadedImage);

    uploadedSprite.x = 150;
    uploadedSprite.y = 100;

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

startBuilder()