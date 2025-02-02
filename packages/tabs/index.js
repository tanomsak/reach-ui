"use strict";

exports.__esModule = true;
exports.TabPanel = exports.TabPanels = exports.Tab = exports.TabList = exports.Tabs = undefined;

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

var _propTypes = require("prop-types");

var _warning = require("warning");

var _warning2 = _interopRequireDefault(_warning);

var _utils = require("@reach/utils");

var _autoId = require("@reach/auto-id");

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

////////////////////////////////////////////////////////////////////////////////
var Tabs = (0, _react.forwardRef)(function Tabs(_ref, ref) {
  var children = _ref.children,
    _ref$as = _ref.as,
    Comp = _ref$as === undefined ? "div" : _ref$as,
    onChange = _ref.onChange,
    _ref$index = _ref.index,
    controlledIndex = _ref$index === undefined ? undefined : _ref$index,
    _ref$readOnly = _ref.readOnly,
    readOnly = _ref$readOnly === undefined ? false : _ref$readOnly,
    defaultIndex = _ref.defaultIndex,
    props = _objectWithoutProperties(_ref, [
      "children",
      "as",
      "onChange",
      "index",
      "readOnly",
      "defaultIndex"
    ]);

  // useRef because you shouldn't switch between controlled/uncontrolled
  var _useRef = (0, _react.useRef)(controlledIndex != null),
    isControlled = _useRef.current;

  process.env.NODE_ENV !== "production"
    ? (0, _warning2.default)(
        !(isControlled && controlledIndex == null),
        "Tabs is changing from controlled to uncontrolled. Tabs should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled Tabs for the lifetime of the component. Check the `index` prop being passed in."
      )
    : void 0;

  process.env.NODE_ENV !== "production"
    ? (0, _warning2.default)(
        !(!isControlled && controlledIndex != null),
        "Tabs is changing from uncontrolled to controlled. Tabs should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled Tabs for the lifetime of the component. Check the `index` prop being passed in."
      )
    : void 0;

  var _id = (0, _autoId.useId)();

  // we only manage focus if the user caused the update vs.
  // a new controlled index coming in
  var _userInteractedRef = (0, _react.useRef)(false);

  var _selectedPanelRef = (0, _react.useRef)(null);

  var _useState = (0, _react.useState)(defaultIndex || 0),
    selectedIndex = _useState[0],
    setSelectedIndex = _useState[1];

  var clones = _react2.default.Children.map(children, function(child) {
    // ignore random <div/>s etc.
    if (typeof child.type === "string") return child;
    return (0, _react.cloneElement)(child, {
      selectedIndex: isControlled ? controlledIndex : selectedIndex,
      _id: _id,
      _userInteractedRef: _userInteractedRef,
      _selectedPanelRef: _selectedPanelRef,
      _onFocusPanel: function _onFocusPanel() {
        return _selectedPanelRef.current && _selectedPanelRef.current.focus();
      },
      _onSelectTab: readOnly
        ? function() {}
        : function(index) {
            _userInteractedRef.current = true;
            onChange && onChange(index);
            if (!isControlled) {
              setSelectedIndex(index);
            }
          }
    });
  });

  return _react2.default.createElement(
    Comp,
    _extends({ "data-reach-tabs": "", ref: ref }, props, { children: clones })
  );
});

exports.Tabs = Tabs;
process.env.NODE_ENV !== "production"
  ? (Tabs.propTypes = {
      children: _propTypes.node.isRequired,
      onChange: _propTypes.func,
      index: function index(props, name, compName) {
        for (
          var _len = arguments.length,
            rest = Array(_len > 3 ? _len - 3 : 0),
            _key = 3;
          _key < _len;
          _key++
        ) {
          rest[_key - 3] = arguments[_key];
        }

        if (
          props.index > -1 &&
          props.onChange == null &&
          props.readOnly !== true
        ) {
          return new Error(
            "You provided a `value` prop to `Tabs` without an `onChange` handler. This will render a read-only tabs element. If the tabs should be mutable use `defaultIndex`. Otherwise, set `onChange`."
          );
        } else {
          return _propTypes.number.apply(
            undefined,
            [name, props, compName].concat(rest)
          );
        }
      },
      defaultIndex: _propTypes.number
    })
  : void 0;

////////////////////////////////////////////////////////////////////////////////
var TabList = (0, _react.forwardRef)(function TabList(_ref2, ref) {
  var children = _ref2.children,
    _ref2$as = _ref2.as,
    Comp = _ref2$as === undefined ? "div" : _ref2$as,
    onKeyDown = _ref2.onKeyDown,
    clonedProps = _objectWithoutProperties(_ref2, [
      "children",
      "as",
      "onKeyDown"
    ]);

  var selectedIndex = clonedProps.selectedIndex,
    _onSelectTab = clonedProps._onSelectTab,
    _userInteractedRef = clonedProps._userInteractedRef,
    _onFocusPanel = clonedProps._onFocusPanel,
    _selectedPanelRef = clonedProps._selectedPanelRef,
    _id = clonedProps._id,
    htmlProps = _objectWithoutProperties(clonedProps, [
      "selectedIndex",
      "_onSelectTab",
      "_userInteractedRef",
      "_onFocusPanel",
      "_selectedPanelRef",
      "_id"
    ]);

  var clones = _react2.default.Children.map(children, function(child, index) {
    return (0, _react.cloneElement)(child, {
      isSelected: index === selectedIndex,
      _id: makeId(_id, index),
      _userInteractedRef: _userInteractedRef,
      _onSelect: function _onSelect() {
        return _onSelectTab(index);
      }
    });
  });

  var handleKeyDown = (0, _utils.wrapEvent)(onKeyDown, function(event) {
    var enabledIndexes = _react2.default.Children.map(children, function(
      child,
      index
    ) {
      return child.props.disabled === true ? null : index;
    }).filter(function(index) {
      return index != null;
    }); // looks something like: [0, 2, 3, 5]
    var enabledSelectedIndex = enabledIndexes.indexOf(selectedIndex);

    switch (event.key) {
      case "ArrowRight": {
        var nextEnabledIndex =
          (enabledSelectedIndex + 1) % enabledIndexes.length;
        var nextIndex = enabledIndexes[nextEnabledIndex];
        _onSelectTab(nextIndex);
        break;
      }
      case "ArrowLeft": {
        var count = enabledIndexes.length;
        var _nextEnabledIndex = (enabledSelectedIndex - 1 + count) % count;
        var _nextIndex = enabledIndexes[_nextEnabledIndex];
        _onSelectTab(_nextIndex);
        break;
      }
      case "ArrowDown": {
        // don't scroll down
        event.preventDefault();
        _onFocusPanel();
        break;
      }
      case "Home": {
        _onSelectTab(0);
        break;
      }
      case "End": {
        _onSelectTab(_react2.default.Children.count(children) - 1);
        break;
      }
      default: {
      }
    }
  });

  return _react2.default.createElement(
    Comp,
    _extends(
      {
        "data-reach-tab-list": "",
        ref: ref,
        role: "tablist",
        onKeyDown: handleKeyDown,
        children: clones
      },
      htmlProps
    )
  );
});

exports.TabList = TabList;
process.env.NODE_ENV !== "production"
  ? (TabList.propTypes = {
      children: _propTypes.node
    })
  : void 0;

////////////////////////////////////////////////////////////////////////////////
var Tab = (0, _react.forwardRef)(function Tab(_ref3, forwardedRef) {
  var children = _ref3.children,
    _ref3$as = _ref3.as,
    Comp = _ref3$as === undefined ? "button" : _ref3$as,
    rest = _objectWithoutProperties(_ref3, ["children", "as"]);

  var isSelected = rest.isSelected,
    _userInteractedRef = rest._userInteractedRef,
    _onSelect = rest._onSelect,
    _id = rest._id,
    htmlProps = _objectWithoutProperties(rest, [
      "isSelected",
      "_userInteractedRef",
      "_onSelect",
      "_id"
    ]);

  var ownRef = (0, _react.useRef)(null);
  var ref = forwardedRef || ownRef;

  useUpdateEffect(
    function() {
      if (isSelected && ref.current && _userInteractedRef.current) {
        _userInteractedRef.current = false;
        ref.current.focus();
      }
    },
    [isSelected]
  );

  return _react2.default.createElement(
    Comp,
    _extends(
      {
        "data-reach-tab": "",
        ref: ref,
        role: "tab",
        id: "tab:" + _id,
        tabIndex: isSelected ? 0 : -1,
        "aria-selected": isSelected,
        "aria-controls": "panel:" + _id,
        "data-selected": isSelected ? "" : undefined,
        onClick: _onSelect,
        children: children
      },
      htmlProps
    )
  );
});

exports.Tab = Tab;
process.env.NODE_ENV !== "production"
  ? (Tab.propTypes = {
      children: _propTypes.node
    })
  : void 0;

////////////////////////////////////////////////////////////////////////////////
var TabPanels = (0, _react.forwardRef)(function TabPanels(_ref4, ref) {
  var children = _ref4.children,
    _ref4$as = _ref4.as,
    Comp = _ref4$as === undefined ? "div" : _ref4$as,
    rest = _objectWithoutProperties(_ref4, ["children", "as"]);

  var selectedIndex = rest.selectedIndex,
    _selectedPanelRef = rest._selectedPanelRef,
    _userInteractedRef = rest._userInteractedRef,
    _onFocusPanel = rest._onFocusPanel,
    _onSelectTab = rest._onSelectTab,
    _id = rest._id,
    htmlAttrs = _objectWithoutProperties(rest, [
      "selectedIndex",
      "_selectedPanelRef",
      "_userInteractedRef",
      "_onFocusPanel",
      "_onSelectTab",
      "_id"
    ]);

  var clones = _react2.default.Children.map(children, function(child, index) {
    return (0, _react.cloneElement)(child, {
      isSelected: index === selectedIndex,
      _selectedPanelRef: _selectedPanelRef,
      _id: makeId(_id, index)
    });
  });

  return _react2.default.createElement(
    Comp,
    _extends({ "data-reach-tab-panels": "", ref: ref }, htmlAttrs, {
      children: clones
    })
  );
});

exports.TabPanels = TabPanels;
process.env.NODE_ENV !== "production"
  ? (TabPanels.propTypes = {
      children: _propTypes.node
    })
  : void 0;

////////////////////////////////////////////////////////////////////////////////
var TabPanel = (0, _react.forwardRef)(function TabPanel(_ref5, ref) {
  var children = _ref5.children,
    _ref5$as = _ref5.as,
    Comp = _ref5$as === undefined ? "div" : _ref5$as,
    rest = _objectWithoutProperties(_ref5, ["children", "as"]);

  var isSelected = rest.isSelected,
    _selectedPanelRef = rest._selectedPanelRef,
    _id = rest._id,
    htmlProps = _objectWithoutProperties(rest, [
      "isSelected",
      "_selectedPanelRef",
      "_id"
    ]);

  return _react2.default.createElement(
    Comp,
    _extends(
      {
        "data-reach-tab-panel": "",
        ref: isSelected ? _selectedPanelRef : undefined,
        role: "tabpanel",
        tabIndex: -1,
        "aria-labelledby": "tab:" + _id,
        hidden: !isSelected,
        id: "panel:" + _id,
        children: children
      },
      htmlProps
    )
  );
});

exports.TabPanel = TabPanel;
process.env.NODE_ENV !== "production"
  ? (TabPanel.propTypes = {
      children: _propTypes.node
    })
  : void 0;

////////////////////////////////////////////////////////////////////////////////
// TODO: move into @reach/utils when something else needs it
function useUpdateEffect(effect, deps) {
  var mounted = (0, _react.useRef)(false);
  (0, _react.useEffect)(function() {
    if (mounted.current) {
      effect();
    } else {
      mounted.current = true;
    }
  }, deps);
}

var makeId = function makeId(id, index) {
  return id + ":" + index;
};
