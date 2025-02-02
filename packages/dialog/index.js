"use strict";

exports.__esModule = true;
exports.Dialog = exports.DialogContent = exports.DialogOverlay = undefined;

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

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _componentComponent = require("@reach/component-component");

var _componentComponent2 = _interopRequireDefault(_componentComponent);

var _portal = require("@reach/portal");

var _portal2 = _interopRequireDefault(_portal);

var _utils = require("@reach/utils");

var _reactFocusLock = require("react-focus-lock");

var _reactFocusLock2 = _interopRequireDefault(_reactFocusLock);

var _reactRemoveScroll = require("react-remove-scroll");

var _propTypes = require("prop-types");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _objectWithoutProperties(obj, keys) {
  var target = {};
  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }
  return target;
}

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
  return (0, _utils.checkStyles)("dialog");
};

var portalDidMount = function portalDidMount(refs) {
  refs.disposeAriaHider = createAriaHider(refs.overlayNode);
};

var contentWillUnmount = function contentWillUnmount(_ref) {
  var refs = _ref.refs;

  refs.disposeAriaHider();
};

var FocusContext = _react2.default.createContext();

var DialogOverlay = _react2.default.forwardRef(function(_ref2, forwardedRef) {
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

  return _react2.default.createElement(
    _componentComponent2.default,
    { didMount: checkDialogStyles },
    isOpen
      ? _react2.default.createElement(
          _portal2.default,
          { "data-reach-dialog-wrapper": true },
          _react2.default.createElement(
            _componentComponent2.default,
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
              return _react2.default.createElement(
                _reactFocusLock2.default,
                {
                  returnFocus: true,
                  onActivation: function onActivation() {
                    if (initialFocusRef) {
                      initialFocusRef.current.focus();
                    }
                  }
                },
                _react2.default.createElement(
                  _reactRemoveScroll.RemoveScroll,
                  null,
                  _react2.default.createElement(
                    "div",
                    _extends(
                      {
                        "data-reach-dialog-overlay": true,
                        onClick: (0, _utils.wrapEvent)(onClick, function(
                          event
                        ) {
                          event.stopPropagation();
                          onDismiss();
                        }),
                        onKeyDown: (0, _utils.wrapEvent)(onKeyDown, function(
                          event
                        ) {
                          if (event.key === "Escape") {
                            event.stopPropagation();
                            onDismiss();
                          }
                        }),
                        ref: function ref(node) {
                          refs.overlayNode = node;
                          (0, _utils.assignRef)(forwardedRef, node);
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

var DialogContent = _react2.default.forwardRef(function(_ref5, forwardedRef) {
  var onClick = _ref5.onClick,
    onKeyDown = _ref5.onKeyDown,
    props = _objectWithoutProperties(_ref5, ["onClick", "onKeyDown"]);

  return _react2.default.createElement(
    "div",
    _extends(
      {
        "aria-modal": "true",
        "data-reach-dialog-content": true,
        tabIndex: "-1",
        onClick: (0, _utils.wrapEvent)(onClick, stopPropagation),
        ref: function ref(node) {
          (0, _utils.assignRef)(forwardedRef, node);
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

  return _react2.default.createElement(
    DialogOverlay,
    {
      isOpen: isOpen,
      onDismiss: onDismiss,
      initialFocusRef: initialFocusRef
    },
    _react2.default.createElement(DialogContent, props)
  );
};

process.env.NODE_ENV !== "production"
  ? (Dialog.propTypes = {
      isOpen: _propTypes.bool,
      onDismiss: _propTypes.func
    })
  : void 0;

exports.DialogOverlay = DialogOverlay;
exports.DialogContent = DialogContent;
exports.Dialog = Dialog;
