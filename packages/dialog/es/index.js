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
import Component from "@reach/component-component";
import Portal from "@reach/portal";
import { checkStyles, wrapEvent, assignRef } from "@reach/utils";
import FocusLock from "react-focus-lock";
import { RemoveScroll } from "react-remove-scroll";
import { func, bool } from "prop-types";

var createAriaHider = function createAriaHider(dialogNode) {
  var originalValues = [];
  var rootNodes = [];

  Array.prototype.forEach.call(document.querySelectorAll("body > *"), function(
    node
  ) {
    var portalNode = dialogNode.parentNode.parentNode.parentNode;
    if (node === portalNode) {
      return;
    }
    var attr = node.getAttribute("aria-hidden");
    var alreadyHidden = attr !== null && attr !== "false";
    if (alreadyHidden) {
      return;
    }
    originalValues.push(attr);
    rootNodes.push(node);
    node.setAttribute("aria-hidden", "true");
  });

  return function() {
    rootNodes.forEach(function(node, index) {
      var originalValue = originalValues[index];
      if (originalValue === null) {
        node.removeAttribute("aria-hidden");
      } else {
        node.setAttribute("aria-hidden", originalValue);
      }
    });
  };
};

var k = function k() {};

var checkDialogStyles = function checkDialogStyles() {
  return checkStyles("dialog");
};

var portalDidMount = function portalDidMount(refs) {
  refs.disposeAriaHider = createAriaHider(refs.overlayNode);
};

var contentWillUnmount = function contentWillUnmount(_ref) {
  var refs = _ref.refs;

  refs.disposeAriaHider();
};

var FocusContext = React.createContext();

var DialogOverlay = React.forwardRef(function(_ref2, forwardedRef) {
  var _ref2$isOpen = _ref2.isOpen,
    isOpen = _ref2$isOpen === undefined ? true : _ref2$isOpen,
    _ref2$onDismiss = _ref2.onDismiss,
    onDismiss = _ref2$onDismiss === undefined ? k : _ref2$onDismiss,
    initialFocusRef = _ref2.initialFocusRef,
    onClick = _ref2.onClick,
    onKeyDown = _ref2.onKeyDown,
    props = _objectWithoutProperties(_ref2, [
      "isOpen",
      "onDismiss",
      "initialFocusRef",
      "onClick",
      "onKeyDown"
    ]);

  return React.createElement(
    Component,
    { didMount: checkDialogStyles },
    isOpen
      ? React.createElement(
          Portal,
          { "data-reach-dialog-wrapper": true },
          React.createElement(
            Component,
            {
              refs: { overlayNode: null },
              didMount: function didMount(_ref3) {
                var refs = _ref3.refs;

                portalDidMount(refs);
              },
              willUnmount: contentWillUnmount
            },
            function(_ref4) {
              var refs = _ref4.refs;
              return React.createElement(
                FocusLock,
                {
                  returnFocus: true,
                  onActivation: function onActivation() {
                    if (initialFocusRef) {
                      initialFocusRef.current.focus();
                    }
                  }
                },
                React.createElement(
                  RemoveScroll,
                  null,
                  React.createElement(
                    "div",
                    _extends(
                      {
                        "data-reach-dialog-overlay": true,
                        onClick: wrapEvent(onClick, function(event) {
                          event.stopPropagation();
                          onDismiss();
                        }),
                        onKeyDown: wrapEvent(onKeyDown, function(event) {
                          if (event.key === "Escape") {
                            event.stopPropagation();
                            onDismiss();
                          }
                        }),
                        ref: function ref(node) {
                          refs.overlayNode = node;
                          assignRef(forwardedRef, node);
                        }
                      },
                      props
                    )
                  )
                )
              );
            }
          )
        )
      : null
  );
});

DialogOverlay.propTypes = {
  initialFocusRef: function initialFocusRef() {}
};

var stopPropagation = function stopPropagation(event) {
  return event.stopPropagation();
};

var DialogContent = React.forwardRef(function(_ref5, forwardedRef) {
  var onClick = _ref5.onClick,
    onKeyDown = _ref5.onKeyDown,
    props = _objectWithoutProperties(_ref5, ["onClick", "onKeyDown"]);

  return React.createElement(
    "div",
    _extends(
      {
        "aria-modal": "true",
        "data-reach-dialog-content": true,
        tabIndex: "-1",
        onClick: wrapEvent(onClick, stopPropagation),
        ref: function ref(node) {
          assignRef(forwardedRef, node);
        }
      },
      props
    )
  );
});

var Dialog = function Dialog(_ref6) {
  var isOpen = _ref6.isOpen,
    _ref6$onDismiss = _ref6.onDismiss,
    onDismiss = _ref6$onDismiss === undefined ? k : _ref6$onDismiss,
    initialFocusRef = _ref6.initialFocusRef,
    props = _objectWithoutProperties(_ref6, [
      "isOpen",
      "onDismiss",
      "initialFocusRef"
    ]);

  return React.createElement(
    DialogOverlay,
    {
      isOpen: isOpen,
      onDismiss: onDismiss,
      initialFocusRef: initialFocusRef
    },
    React.createElement(DialogContent, props)
  );
};

process.env.NODE_ENV !== "production"
  ? (Dialog.propTypes = {
      isOpen: bool,
      onDismiss: func
    })
  : void 0;

export { DialogOverlay, DialogContent, Dialog };
