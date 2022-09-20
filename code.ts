figma.skipInvisibleInstanceChildren = true;

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

const instances = figma.currentPage
  .findAllWithCriteria({
    types: ["INSTANCE"],
  })
  .filter((x) => x.name === "Button");

//remove COMPONENT ANNOTATIONS group(s)
figma.currentPage
  .findAllWithCriteria({
    types: ["GROUP"],
  })
  .filter((x) => x.name === "COMPONENT ANNOTATIONS")
  .forEach((x) => x.remove());

figma.ui.onmessage = async (msg) => {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  if (msg.type === "create-overlays") {
    const nodes = [];
    const parentNames = [];
    for (let i = 0; i < instances.length; i++) {
      const instance = instances[i];
      const rect = figma.createRectangle();
      rect.relativeTransform = [
        [
          instance.absoluteTransform[0][0],
          instance.absoluteTransform[0][1],
          instance.absoluteTransform[0][2] - 5,
        ],
        [
          instance.absoluteTransform[1][0],
          instance.absoluteTransform[1][1],
          instance.absoluteTransform[1][2] - 5,
        ],
      ];
      console.log("ins", instance.absoluteTransform, rect.relativeTransform);

      rect.resize(instance.width + 10, instance.height + 10);
      rect.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }];
      rect.name = `testrect-${i}`;
      rect.opacity = 0.9;
      rect.strokes = [{ type: "SOLID", color: { r: 1, g: 1, b: 0 } }];
      rect.strokeWeight = 1;

      const text = figma.createText();
      text.relativeTransform = instance.absoluteTransform;
      text.characters = `COMPONENT ${instance?.name}`;
      text.fontSize = 12;
      text.fills = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.9 } }];
      text.textAutoResize = "NONE";
      text.textAlignHorizontal = "CENTER";
      text.textAlignVertical = "CENTER";
      text.resize(rect.width, rect.height);
      text.setRangeHyperlink(0, text.characters.length, {
        value: "https://www.google.com",
        type: "URL",
      });

      nodes.push(rect);
      nodes.push(text);
      parentNames.push(instance.parent?.name);
    }

    console.log(parentNames);

    const group = figma.group(nodes, figma.currentPage);
    group.name = "COMPONENT ANNOTATIONS";

    /*figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);*/
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
};
