import React from "react";
import Component from "@reach/component-component";
import { func } from "prop-types";

var hasWindow = typeof window !== "undefined";

var didMount = function didMount(_ref) {
  var refs = _ref.refs,
    setState = _ref.setState;

  var resize = function resize() {
    return setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };
  window.addEventListener("resize", resize);
  refs.removeEvent = function() {
    window.removeEventListener("resize", resize);
  };
};

var willUnmount = function willUnmount(_ref2) {
  var refs = _ref2.refs;

  refs.removeEvent();
};

var WindowSize = function WindowSize(_ref3) {
  var children = _ref3.children;
  return React.createElement(Component, {
    refs: { removeEvent: null },
    initialState: {
      width: hasWindow && window.innerWidth,
      height: hasWindow && window.innerHeight
    },
    didMount: didMount,
    willUnmount: willUnmount,
    render: function render(_ref4) {
      var state = _ref4.state;
      return children(state);
    }
  });
};

process.env.NODE_ENV !== "production"
  ? (WindowSize.propTypes = {
      children: func.isRequired
    })
  : void 0;

export default WindowSize;
