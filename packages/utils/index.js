"use strict";

exports.__esModule = true;
var checkedPkgs = {};

var checkStyles = function checkStyles() {};

if (process.env.NODE_ENV !== "production") {
  exports.checkStyles = checkStyles = function checkStyles(pkg) {
    // only check once per package
    if (checkedPkgs[pkg]) return;
    checkedPkgs[pkg] = true;

    if (
      parseInt(
        window
          .getComputedStyle(document.body)
          .getPropertyValue("--reach-" + pkg),
        10
      ) !== 1
    ) {
      console.warn(
        "@reach/" +
          pkg +
          ' styles not found. If you are using a bundler like webpack or parcel include this in the entry file of your app before any of your own styles:\n\n    import "@reach/' +
          pkg +
          '/styles.css";\n\n  Otherwise you\'ll need to include them some other way:\n\n    <link rel="stylesheet" type="text/css" href="node_modules/@reach/' +
          pkg +
          '/styles.css" />\n\n  For more information visit https://ui.reach.tech/styling.\n  '
      );
    }
  };
}

exports.checkStyles = checkStyles;
var wrapEvent = (exports.wrapEvent = function wrapEvent(
  theirHandler,
  ourHandler
) {
  return function(event) {
    theirHandler && theirHandler(event);
    if (!event.defaultPrevented) {
      return ourHandler(event);
    }
  };
});

var assignRef = (exports.assignRef = function assignRef(ref, value) {
  if (ref == null) return;
  if (typeof ref === "function") {
    ref(value);
  } else {
    try {
      ref.current = value;
    } catch (error) {
      throw new Error(
        'Cannot assign value "' + value + '" to ref "' + ref + '"'
      );
    }
  }
});
