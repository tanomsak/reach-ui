var _extends =
  Object.assign ||
  function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };

function _objectWithoutProperties(obj, keys) {
  var target = {};
  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }
  return target;
}

import React from "react";

var id = "reach-skip-nav";

var SkipNavLink = function SkipNavLink(_ref) {
  var _ref$children = _ref.children,
    children = _ref$children === undefined ? "Skip to content" : _ref$children,
    props = _objectWithoutProperties(_ref, ["children"]);

  return React.createElement(
    "a",
    _extends({}, props, { href: "#" + id, "data-reach-skip-link": true }),
    children
  );
};

var SkipNavContent = function SkipNavContent(props) {
  return React.createElement("div", _extends({}, props, { id: id }));
};

export { SkipNavLink, SkipNavContent };
