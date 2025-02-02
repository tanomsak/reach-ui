"use strict";

exports.__esModule = true;
exports.useId = undefined;

var _react = require("react");

// Could use UUID but if we hit 9,007,199,254,740,991 unique components over
// the lifetime of the app before it gets reloaded, I mean ... come on.
// I don't even know what xillion that is.
// /me googles
// Oh duh, quadrillion. Nine quadrillion components. I think we're okay.
var id = 0;
var genId = function genId() {
  return ++id;
};

var useId = (exports.useId = function useId() {
  var _useState = (0, _react.useState)(null),
    id = _useState[0],
    setId = _useState[1];

  (0, _react.useEffect)(function() {
    return setId(genId());
  }, []);
  return id;
});
