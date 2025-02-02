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

import React, { createContext } from "react";
import Component from "@reach/component-component";
import { DialogOverlay, DialogContent } from "@reach/dialog";
import { useId } from "@reach/auto-id";
import invariant from "invariant";
import { func, bool, node, object, oneOfType } from "prop-types";

var AlertDialogContext = createContext();

function AlertDialogOverlay(_ref) {
  var leastDestructiveRef = _ref.leastDestructiveRef,
    props = _objectWithoutProperties(_ref, ["leastDestructiveRef"]);

  var labelId = useId();
  var descriptionId = useId();
  return React.createElement(
    Component,
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
      return React.createElement(
        AlertDialogContext.Provider,
        { value: refs },
        React.createElement(
          DialogOverlay,
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
      isOpen: bool,
      onDismiss: func,
      leastDestructiveRef: oneOfType([func, object]),
      children: node
    })
  : void 0;

var AlertDialogContent = function AlertDialogContent(_ref3) {
  var children = _ref3.children,
    props = _objectWithoutProperties(_ref3, ["children"]);

  return React.createElement(AlertDialogContext.Consumer, null, function(refs) {
    return React.createElement(
      DialogContent,
      _extends(
        {
          "data-reach-alert-dialong-content": true,
          role: "alertdialog",
          "aria-labelledby": refs.labelId
        },
        props
      ),
      React.createElement(Component, {
        didMount: function didMount() {
          !document.getElementById(refs.labelId)
            ? process.env.NODE_ENV !== "production"
              ? invariant(
                  false,
                  "@reach/alert-dialog: You must render a `<AlertDialogLabel>`\n              inside an `<AlertDialog/>`."
                )
              : invariant(false)
            : void 0;
          !refs.leastDestructiveRef
            ? process.env.NODE_ENV !== "production"
              ? invariant(
                  false,
                  "@reach/alert-dialog: You must provide a `leastDestructiveRef` to\n              `<AlertDialog>` or `<AlertDialogOverlay/>`. Please see\n              https://ui.reach.tech/alert-dialog/#alertdialogoverlay-leastdestructiveref"
                )
              : invariant(false)
            : void 0;
        },
        children: children
      })
    );
  });
};

process.env.NODE_ENV !== "production"
  ? (AlertDialogContent.propTypes = {
      children: node
    })
  : void 0;

var AlertDialogLabel = function AlertDialogLabel(props) {
  return React.createElement(AlertDialogContext.Consumer, null, function(
    _ref4
  ) {
    var labelId = _ref4.labelId;
    return React.createElement(
      "div",
      _extends({ id: labelId, "data-reach-alert-dialog-label": true }, props)
    );
  });
};

var AlertDialogDescription = function AlertDialogDescription(props) {
  return React.createElement(AlertDialogContext.Consumer, null, function(
    _ref5
  ) {
    var descriptionId = _ref5.descriptionId;
    return React.createElement(
      "div",
      _extends(
        { id: descriptionId, "data-reach-alert-dialog-description": true },
        props
      )
    );
  });
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

  return React.createElement(
    AlertDialogOverlay,
    {
      isOpen: isOpen,
      onDismiss: onDismiss,
      leastDestructiveRef: leastDestructiveRef
    },
    React.createElement(AlertDialogContent, props)
  );
};

process.env.NODE_ENV !== "production"
  ? (AlertDialog.propTypes = {
      isOpen: bool,
      onDismiss: func,
      leastDestructiveRef: func,
      children: node
    })
  : void 0;

export {
  AlertDialog,
  AlertDialogLabel,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogContent
};
