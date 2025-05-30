const fs = require("fs");
const path = require("path");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/_data/branding.json");
  eleventyConfig.addPassthroughCopy("src/assets");
 eleventyConfig.addPassthroughCopy("src/modules/viewer");
 
  // Automatically passthrough all steps.json files under /src/modules
  const modulesDir = "src/modules";
  fs.readdirSync(modulesDir, { withFileTypes: true }).forEach(dirent => {
    if (dirent.isDirectory()) {
      const modulePath = path.join(modulesDir, dirent.name);
      const subDirs = fs.readdirSync(modulePath, { withFileTypes: true });
      subDirs.forEach(sub => {
        if (sub.isDirectory()) {
          const stepPath = path.join(modulePath, sub.name, "steps.json");
          if (fs.existsSync(stepPath)) {
            const passthroughPath = `${modulePath}/${sub.name}/steps.json`;
            eleventyConfig.addPassthroughCopy(passthroughPath);
          }
        }
      });
    }
  });

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  };
};
