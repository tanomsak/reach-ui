import { useState, useEffect } from "react";

// Could use UUID but if we hit 9,007,199,254,740,991 unique components over
// the lifetime of the app before it gets reloaded, I mean ... come on.
// I don't even know what xillion that is.
// /me googles
// Oh duh, quadrillion. Nine quadrillion components. I think we're okay.
var id = 0;
var genId = function genId() {
  return ++id;
};

export var useId = function useId() {
  var _useState = useState(null),
    id = _useState[0],
    setId = _useState[1];

  useEffect(function() {
    return setId(genId());
  }, []);
  return id;
};
