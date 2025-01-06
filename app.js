let app;
let container;
let textures = {};
const badge = {
  name: "John Doe",
}

function startBuilder() {
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
    background: "#000000",
    resolution: window.devicePixelRatio || 1,
  });
  containerDiv.appendChild(app.canvas);
  app.canvas.style.width = `${containerWidth}px`;
  app.canvas.style.height = `${containerHeight}px`;

  // Load textures
  textures["modelo"] = await PIXI.Assets.load("./assets/modelo.png");

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

function draw() {
  container.removeChildren();

  const modeloCarteirinha = new PIXI.Sprite(textures.modelo);
  modeloCarteirinha.anchor.set(0.5);
  modeloCarteirinha.x = app.screen.width / 2;
  modeloCarteirinha.y = app.screen.height / 2;
  container.addChild(modeloCarteirinha);

  const textStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 36,
    fontStyle: "italic",
    fontWeight: "bold",
    fill: '#FFFFFF',
    stroke: { color: "#4a1850", width: 5, join: "round" },
    dropShadow: {
      color: "#000000",
      blur: 4,
      angle: Math.PI / 6,
      distance: 6,
    },
    wordWrap: true,
    wordWrapWidth: 440,
  });
  const richText = new PIXI.Text({
    text: badge.text,
    style: textStyle,
  });
  richText.x = 538;
  richText.y = 375;
  container.addChild(richText);
}

function updateText() {
  badge.text = document.getElementById("nameInput").value;
  draw();
}

function saveBadge() {
  const link = document.createElement("a");
  link.download = "my-badge.png";
  link.href = app.view.toDataURL();
  link.click();
}
