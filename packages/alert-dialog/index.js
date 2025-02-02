"use strict";

exports.__esModule = true;
exports.AlertDialogContent = exports.AlertDialogOverlay = exports.AlertDialogDescription = exports.AlertDialogLabel = exports.AlertDialog = undefined;

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

var _dialog = require("@reach/dialog");

var _autoId = require("@reach/auto-id");

var _invariant = require("invariant");

var _invariant2 = _interopRequireDefault(_invariant);

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

var AlertDialogContext = (0, _react.createContext)();

function AlertDialogOverlay(_ref) {
  var leastDestructiveRef = _ref.leastDestructiveRef,
    props = _objectWithoutProperties(_ref, ["leastDestructiveRef"]);

  var labelId = (0, _autoId.useId)();
  var descriptionId = (0, _autoId.useId)();
  return _react2.default.createElement(
    _componentComponent2.default,
    {
      getRefs: function getRefs() {
        return {
          labelId: "alert-dialog-" + labelId,
          descriptionId: "alert-dialog-" + descriptionId,
          leastDestructiveRef: leastDestructiveRef
        };
      }
    },
    function(_ref2) {
      var refs = _ref2.refs;
      return _react2.default.createElement(
        AlertDialogContext.Provider,
        { value: refs },
        _react2.default.createElement(
          _dialog.DialogOverlay,
          _extends(
            {
              "data-reach-alert-dialog-overlay": true,
              initialFocusRef: leastDestructiveRef
            },
            props
          )
        )
      );
    }
  );
}

process.env.NODE_ENV !== "production"
  ? (AlertDialogOverlay.propTypes = {
      isOpen: _propTypes.bool,
      onDismiss: _propTypes.func,
      leastDestructiveRef: (0, _propTypes.oneOfType)([
        _propTypes.func,
        _propTypes.object
      ]),
      children: _propTypes.node
    })
  : void 0;

var AlertDialogContent = function AlertDialogContent(_ref3) {
  var children = _ref3.children,
    props = _objectWithoutProperties(_ref3, ["children"]);

  return _react2.default.createElement(
    AlertDialogContext.Consumer,
    null,
    function(refs) {
      return _react2.default.createElement(
        _dialog.DialogContent,
        _extends(
          {
            "data-reach-alert-dialong-content": true,
            role: "alertdialog",
            "aria-labelledby": refs.labelId
          },
          props
        ),
        _react2.default.createElement(_componentComponent2.default, {
          didMount: function didMount() {
            !document.getElementById(refs.labelId)
              ? process.env.NODE_ENV !== "production"
                ? (0, _invariant2.default)(
                    false,
                    "@reach/alert-dialog: You must render a `<AlertDialogLabel>`\n              inside an `<AlertDialog/>`."
                  )
                : (0, _invariant2.default)(false)
              : void 0;
            !refs.leastDestructiveRef
              ? process.env.NODE_ENV !== "production"
                ? (0, _invariant2.default)(
                    false,
                    "@reach/alert-dialog: You must provide a `leastDestructiveRef` to\n              `<AlertDialog>` or `<AlertDialogOverlay/>`. Please see\n              https://ui.reach.tech/alert-dialog/#alertdialogoverlay-leastdestructiveref"
                  )
                : (0, _invariant2.default)(false)
              : void 0;
          },
          children: children
        })
      );
    }
  );
};

process.env.NODE_ENV !== "production"
  ? (AlertDialogContent.propTypes = {
      children: _propTypes.node
    })
  : void 0;

var AlertDialogLabel = function AlertDialogLabel(props) {
  return _react2.default.createElement(
    AlertDialogContext.Consumer,
    null,
    function(_ref4) {
      var labelId = _ref4.labelId;
      return _react2.default.createElement(
        "div",
        _extends({ id: labelId, "data-reach-alert-dialog-label": true }, props)
      );
    }
  );
};

var AlertDialogDescription = function AlertDialogDescription(props) {
  return _react2.default.createElement(
    AlertDialogContext.Consumer,
    null,
    function(_ref5) {
      var descriptionId = _ref5.descriptionId;
      return _react2.default.createElement(
        "div",
        _extends(
          { id: descriptionId, "data-reach-alert-dialog-description": true },
          props
        )
      );
    }
  );
};

var AlertDialog = function AlertDialog(_ref6) {
  var isOpen = _ref6.isOpen,
    onDismiss = _ref6.onDismiss,
    leastDestructiveRef = _ref6.leastDestructiveRef,
    props = _objectWithoutProperties(_ref6, [
      "isOpen",
      "onDismiss",
      "leastDestructiveRef"
    ]);

  return _react2.default.createElement(
    AlertDialogOverlay,
    {
      isOpen: isOpen,
      onDismiss: onDismiss,
      leastDestructiveRef: leastDestructiveRef
    },
    _react2.default.createElement(AlertDialogContent, props)
  );
};

process.env.NODE_ENV !== "production"
  ? (AlertDialog.propTypes = {
      isOpen: _propTypes.bool,
      onDismiss: _propTypes.func,
      leastDestructiveRef: _propTypes.func,
      children: _propTypes.node
    })
  : void 0;

exports.AlertDialog = AlertDialog;
exports.AlertDialogLabel = AlertDialogLabel;
exports.AlertDialogDescription = AlertDialogDescription;
exports.AlertDialogOverlay = AlertDialogOverlay;
exports.AlertDialogContent = AlertDialogContent;
