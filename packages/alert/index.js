"use strict";

exports.__esModule = true;

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

var _reactDom = require("react-dom");

var _componentComponent = require("@reach/component-component");

var _componentComponent2 = _interopRequireDefault(_componentComponent);

var _visuallyHidden = require("@reach/visually-hidden");

var _visuallyHidden2 = _interopRequireDefault(_visuallyHidden);

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
} // The approach here is to allow developers to render a visual <Alert> and then
// we mirror that to a couple of aria live regions behind the scenes. This way,
// most of the time, developers don't have to think about visual vs. aria
// alerts.
//
// Limitations: Developers can't read from context inside of an Alert because
// we aren't using ReactDOM.createPortal(), we're actually creating a couple of
// brand new React roots. We could use createPortal but then apps would need to
// render the entire app tree in an <AlertProvider>, or maybe there's a way
// with default context to do it, but we haven't explored that yet. So, we'll
// see how this goes, and if it becomes a problem, we can introduce a portal
// later.

// singleton state is fine because you don't server render
// an alert (SRs don't read them on first load anyway)
var keys = {
  polite: -1,
  assertive: -1
};

var elements = {
  polite: {},
  assertive: {}
};

var liveRegions = {
  polite: null,
  assertive: null
};

var renderTimer = null;

var renderAlerts = function renderAlerts() {
  clearTimeout(renderTimer);

  renderTimer = setTimeout(function() {
    Object.keys(elements).forEach(function(type) {
      var container = liveRegions[type];
      if (container) {
        (0, _reactDom.render)(
          _react2.default.createElement(
            _visuallyHidden2.default,
            null,
            _react2.default.createElement(
              "div",
              {
                role: type === "assertive" ? "alert" : "status",
                "aria-live": type
              },
              Object.keys(elements[type]).map(function(key) {
                return _react2.default.cloneElement(elements[type][key], {
                  key: key
                });
              })
            )
          ),
          liveRegions[type]
        );
      }
    });
  }, 500);
};

var createMirror = function createMirror(type) {
  var key = ++keys[type];

  var mount = function mount(element) {
    if (liveRegions[type]) {
      elements[type][key] = element;
      renderAlerts();
    } else {
      var _node = document.createElement("div");
      _node.setAttribute("data-reach-live-" + type, "true");
      liveRegions[type] = _node;
      document.body.appendChild(liveRegions[type]);
      mount(element);
    }
  };

  var update = function update(element) {
    elements[type][key] = element;
    renderAlerts();
  };

  var unmount = function unmount(element) {
    delete elements[type][key];
    renderAlerts();
  };

  return { mount: mount, update: update, unmount: unmount };
};

var Alert = function Alert(_ref) {
  var children = _ref.children,
    type = _ref.type,
    props = _objectWithoutProperties(_ref, ["children", "type"]);

  var element = _react2.default.createElement(
    "div",
    _extends({}, props, { "data-reach-alert": true }),
    children
  );
  return _react2.default.createElement(_componentComponent2.default, {
    type: type,
    getRefs: function getRefs() {
      return { mirror: createMirror(type) };
    },
    didMount: function didMount(_ref2) {
      var refs = _ref2.refs;
      return refs.mirror.mount(element);
    },
    didUpdate: function didUpdate(_ref3) {
      var refs = _ref3.refs,
        prevProps = _ref3.prevProps;

      if (prevProps.type !== type) {
        refs.mirror.unmount();
        refs.mirror = createMirror(type);
        refs.mirror.mount(element);
      } else {
        refs.mirror.update(element, prevProps.type, type);
      }
    },
    willUnmount: function willUnmount(_ref4) {
      var refs = _ref4.refs;
      return refs.mirror.unmount(element);
    },
    children: element
  });
};

process.env.NODE_ENV !== "production"
  ? (Alert.propTypes = {
      children: _propTypes.node,
      type: _propTypes.string
    })
  : void 0;

Alert.defaultProps = {
  type: "polite"
};

exports.default = Alert;
