"use strict";

exports.__esModule = true;
exports.TooltipPopup = undefined;

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

var _states; ////////////////////////////////////////////////////////////////////////////////
// Welcome to @reach/tooltip!
//
// Quick definitions:
//
// - "on rest" or "rested on": describes when the element receives mouse hover
//   after a short delay (and hopefully soon, touch longpress).
//
// - "activation": describes a mouse click, keyboard enter, or keyboard space.
//
// Only one tooltip can be visible at a time, so we use a global state chart to
// describe the various states and transitions between states that are
// possible. With the all the timeouts involved with tooltips it's important to
// "make impossible states impossible" with a state machine.
//
// It's also okay to use these module globals because you don't server render
// tooltips. None of the state is changed outside of user events.
//
// There are a few features that are important to understand.
//
// 1. Tooltips don't show up until the user has rested on one, we don't
//    want tooltips popupping up as you move your mouse around the page.
//
// 2. Once any tooltip becomes visible, other tooltips nearby should skip
//    resting and display immediately.
//
// 3. Tooltips stick around for a little bit after blur/mouseleave.
//
// TODO: Research longpress tooltips on Android, iOS
// - Probably want to position it by default above, since your thumb
//   is below and would cover it
// - I'm thinking after longpress, display the tooltip and cancel any click
//   events. Then on touchend, so they can read it display the tooltip for
//   a little while longer in case their hand was obstructing the tooltip.

/* eslint-disable default-case */

exports.useTooltip = useTooltip;
exports.default = Tooltip;

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _autoId = require("@reach/auto-id");

var _utils = require("@reach/utils");

var _portal = require("@reach/portal");

var _portal2 = _interopRequireDefault(_portal);

var _visuallyHidden = require("@reach/visually-hidden");

var _visuallyHidden2 = _interopRequireDefault(_visuallyHidden);

var _rect = require("@reach/rect");

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

////////////////////////////////////////////////////////////////////////////////
// ~The states~

// nothing goin' on
var IDLE = "idle";

// we're considering showing the tooltip, but we're gonna wait a sec
var FOCUSED = "focused";

// IT'S ON
var VISIBLE = "visible";

// Focus has left, but we want to keep it visible for a sec
var LEAVING_VISIBLE = "leavingVisible";

// The user clicked the tool, so we want to hide the thing, we can't just use
// IDLE because we need to ignore mousemove, etc.
var DISMISSED = "dismissed";

var chart = {
  initial: IDLE,
  states:
    ((_states = {}),
    (_states[IDLE] = {
      enter: clearContextId,
      on: {
        mouseenter: FOCUSED,
        focus: VISIBLE
      }
    }),
    (_states[FOCUSED] = {
      enter: startRestTimer,
      leave: clearRestTimer,
      on: {
        mousemove: FOCUSED,
        mouseleave: IDLE,
        mousedown: DISMISSED,
        blur: IDLE,
        rest: VISIBLE
      }
    }),
    (_states[VISIBLE] = {
      on: {
        focus: FOCUSED,
        mouseenter: FOCUSED,
        mouseleave: LEAVING_VISIBLE,
        blur: LEAVING_VISIBLE,
        mousedown: DISMISSED,
        selectWithKeyboard: DISMISSED,
        globalMouseMove: LEAVING_VISIBLE
      }
    }),
    (_states[LEAVING_VISIBLE] = {
      enter: startLeavingVisibleTimer,
      leave: function leave() {
        clearLeavingVisibleTimer();
        clearContextId();
      },
      on: {
        mouseenter: VISIBLE,
        focus: VISIBLE,
        timecomplete: IDLE
      }
    }),
    (_states[DISMISSED] = {
      leave: function leave() {
        // allows us to come on back later w/o entering something else first
        context.id = null;
      },
      on: {
        mouseleave: IDLE,
        blur: IDLE
      }
    }),
    _states)
};

// chart context allows us to persist some data around, in Tooltip all we use
// is the id of the current tooltip being interacted with.
var context = { id: null };
var state = chart.initial;

////////////////////////////////////////////////////////////////////////////////
// Finds the next state from the current state + action. If the chart doesn't
// describe that transition, it will throw.
//
// It also manages lifecycles of the machine, (enter/leave hooks on the state
// chart)
function transition(action, newContext) {
  var stateDef = chart.states[state];
  var nextState = stateDef.on[action];

  // Really useful for debugging
  // console.log({ action, state, nextState, contextId: context.id });

  if (!nextState) {
    throw new Error(
      'Unknown state for action "' + action + '" from state "' + state + '"'
    );
  }

  if (stateDef.leave) {
    stateDef.leave();
  }

  if (newContext) {
    context = newContext;
  }

  var nextDef = chart.states[nextState];
  if (nextDef.enter) {
    nextDef.enter();
  }

  state = nextState;
  notify();
}

////////////////////////////////////////////////////////////////////////////////
// Subscriptions:
//
// We could require apps to render a <TooltipProvider> around the app and use
// React context to notify Tooltips of changes to our state machine, instead
// we manage subscriptions ourselves and simplify the Tooltip API.
//
// Maybe if default context could take a hook (instead of just a static value)
// that was rendered at the root for us, that'd be cool! But it doesn't.
var subscriptions = [];

function subscribe(fn) {
  subscriptions.push(fn);
  return function() {
    subscriptions.splice(subscriptions.indexOf(fn), 1);
  };
}

function notify() {
  subscriptions.forEach(function(fn) {
    return fn(state, context);
  });
}

////////////////////////////////////////////////////////////////////////////////
// Timeouts:

// Manages when the user "rests" on an element. Keeps the interface from being
// flashing tooltips all the time as the user moves the mouse around the screen.
var restTimeout = void 0;

function startRestTimer() {
  clearTimeout(restTimeout);
  restTimeout = setTimeout(function() {
    return transition("rest");
  }, 100);
}

function clearRestTimer() {
  clearTimeout(restTimeout);
}

// Manages the delay to hide the tooltip after rest leaves.
var leavingVisibleTimer = void 0;

function startLeavingVisibleTimer() {
  clearTimeout(leavingVisibleTimer);
  leavingVisibleTimer = setTimeout(function() {
    return transition("timecomplete");
  }, 500);
}

function clearLeavingVisibleTimer() {
  clearTimeout(leavingVisibleTimer);
}

// allows us to come on back later w/o entering something else first after the
// user leaves or dismisses
function clearContextId() {
  context.id = null;
}

////////////////////////////////////////////////////////////////////////////////
// THE HOOK! It's about time we got to the goods!
function useTooltip() {
  var _ref =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    onMouseEnter = _ref.onMouseEnter,
    onMouseMove = _ref.onMouseMove,
    onMouseLeave = _ref.onMouseLeave,
    onFocus = _ref.onFocus,
    onBlur = _ref.onBlur,
    onKeyDown = _ref.onKeyDown,
    onMouseDown = _ref.onMouseDown,
    ref = _ref.ref,
    DEBUG_STYLE = _ref.DEBUG_STYLE;

  var id = "tooltip:" + (0, _autoId.useId)();

  var _useState = (0, _react.useState)(
      DEBUG_STYLE ? true : context.id === id && state === VISIBLE
    ),
    isVisible = _useState[0],
    setIsVisible = _useState[1];

  // hopefully they always pass a ref if they ever pass one

  var triggerRef = ref || (0, _react.useRef)();
  var triggerRect = (0, _rect.useRect)(triggerRef, isVisible);

  (0, _react.useEffect)(
    function() {
      return subscribe(function() {
        if (
          context.id === id &&
          (state === VISIBLE || state === LEAVING_VISIBLE)
        ) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      });
    },
    [id]
  );

  (0, _react.useEffect)(function() {
    return (0, _utils.checkStyles)("tooltip");
  });

  var handleMouseEnter = function handleMouseEnter() {
    switch (state) {
      case IDLE:
      case VISIBLE:
      case LEAVING_VISIBLE: {
        transition("mouseenter", { id: id });
      }
    }
  };

  var handleMouseMove = function handleMouseMove() {
    switch (state) {
      case FOCUSED: {
        transition("mousemove", { id: id });
      }
    }
  };

  var handleFocus = function handleFocus(event) {
    if (window.__REACH_DISABLE_TOOLTIPS) return;
    switch (state) {
      case IDLE:
      case VISIBLE:
      case LEAVING_VISIBLE: {
        transition("focus", { id: id });
      }
    }
  };

  var handleMouseLeave = function handleMouseLeave() {
    switch (state) {
      case FOCUSED:
      case VISIBLE:
      case DISMISSED: {
        transition("mouseleave");
      }
    }
  };

  var handleBlur = function handleBlur() {
    // Allow quick click from one tool to another
    if (context.id !== id) return;
    switch (state) {
      case FOCUSED:
      case VISIBLE:
      case DISMISSED: {
        transition("blur");
      }
    }
  };

  var handleMouseDown = function handleMouseDown() {
    // Allow quick click from one tool to another
    if (context.id !== id) return;
    switch (state) {
      case FOCUSED:
      case VISIBLE: {
        transition("mousedown");
      }
    }
  };

  var handleKeyDown = function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      switch (state) {
        case VISIBLE: {
          transition("selectWithKeyboard");
        }
      }
    }
  };

  var trigger = {
    "aria-describedby": id,
    "data-reach-tooltip-trigger": "",
    ref: triggerRef,
    onMouseEnter: (0, _utils.wrapEvent)(onMouseEnter, handleMouseEnter),
    onMouseMove: (0, _utils.wrapEvent)(onMouseMove, handleMouseMove),
    onFocus: (0, _utils.wrapEvent)(onFocus, handleFocus),
    onBlur: (0, _utils.wrapEvent)(onFocus, handleBlur),
    onMouseLeave: (0, _utils.wrapEvent)(onMouseLeave, handleMouseLeave),
    onKeyDown: (0, _utils.wrapEvent)(onKeyDown, handleKeyDown),
    onMouseDown: (0, _utils.wrapEvent)(onMouseDown, handleMouseDown)
  };

  var tooltip = {
    id: id,
    triggerRect: triggerRect,
    isVisible: isVisible
  };

  return [trigger, tooltip, isVisible];
}

////////////////////////////////////////////////////////////////////////////////
function Tooltip(_ref2) {
  var children = _ref2.children,
    label = _ref2.label,
    ariaLabel = _ref2.ariaLabel,
    DEBUG_STYLE = _ref2.DEBUG_STYLE,
    rest = _objectWithoutProperties(_ref2, [
      "children",
      "label",
      "ariaLabel",
      "DEBUG_STYLE"
    ]);

  var _useTooltip = useTooltip({ DEBUG_STYLE: DEBUG_STYLE }),
    trigger = _useTooltip[0],
    tooltip = _useTooltip[1];

  return _react2.default.createElement(
    _react.Fragment,
    null,
    (0, _react.cloneElement)(_react.Children.only(children), trigger),
    _react2.default.createElement(
      TooltipPopup,
      _extends(
        {
          label: label,
          ariaLabel: ariaLabel
        },
        tooltip,
        rest
      )
    )
  );
}

process.env.NODE_ENV !== "production"
  ? (Tooltip.propTypes = {
      children: _propTypes.node.isRequired,
      label: _propTypes.node.isRequired,
      ariaLabel: _propTypes.string
    })
  : void 0;

////////////////////////////////////////////////////////////////////////////////
var TooltipPopup = (0, _react.forwardRef)(function TooltipPopup(
  _ref3,
  forwardRef
) {
  var label = _ref3.label,
    ariaLabel = _ref3.ariaLabel,
    position = _ref3.position,
    isVisible = _ref3.isVisible,
    id = _ref3.id,
    triggerRect = _ref3.triggerRect,
    rest = _objectWithoutProperties(_ref3, [
      "label",
      "ariaLabel",
      "position",
      "isVisible",
      "id",
      "triggerRect"
    ]);

  return isVisible
    ? _react2.default.createElement(
        _portal2.default,
        null,
        _react2.default.createElement(
          TooltipContent,
          _extends(
            {
              label: label,
              ariaLabel: ariaLabel,
              position: position,
              isVisible: isVisible,
              id: id,
              triggerRect: triggerRect,
              ref: forwardRef
            },
            rest
          )
        )
      )
    : null;
});

exports.TooltipPopup = TooltipPopup;
process.env.NODE_ENV !== "production"
  ? (TooltipPopup.propTypes = {
      label: _propTypes.node.isRequired,
      ariaLabel: _propTypes.string,
      position: _propTypes.func
    })
  : void 0;

// Need a separate component so that useRect works inside the portal
var TooltipContent = (0, _react.forwardRef)(function TooltipContent(
  _ref4,
  forwardRef
) {
  var label = _ref4.label,
    ariaLabel = _ref4.ariaLabel,
    _ref4$position = _ref4.position,
    position = _ref4$position === undefined ? positionDefault : _ref4$position,
    isVisible = _ref4.isVisible,
    id = _ref4.id,
    triggerRect = _ref4.triggerRect,
    style = _ref4.style,
    rest = _objectWithoutProperties(_ref4, [
      "label",
      "ariaLabel",
      "position",
      "isVisible",
      "id",
      "triggerRect",
      "style"
    ]);

  var useAriaLabel = ariaLabel != null;
  var tooltipRef = (0, _react.useRef)();
  var tooltipRect = (0, _rect.useRect)(tooltipRef, isVisible);
  return _react2.default.createElement(
    _react.Fragment,
    null,
    _react2.default.createElement(
      "div",
      _extends(
        {
          "data-reach-tooltip": true,
          role: useAriaLabel ? undefined : "tooltip",
          id: useAriaLabel ? undefined : id,
          children: label,
          style: _extends(
            {},
            style,
            getStyles(position, triggerRect, tooltipRect)
          ),
          ref: function ref(node) {
            tooltipRef.current = node;
            if (forwardRef) forwardRef(node);
          }
        },
        rest
      )
    ),
    useAriaLabel &&
      _react2.default.createElement(
        _visuallyHidden2.default,
        { role: "tooltip", id: id },
        ariaLabel
      )
  );
});

// feels awkward when it's perfectly aligned w/ the trigger
var OFFSET = 8;

var getStyles = function getStyles(position, triggerRect, tooltipRect) {
  var haventMeasuredTooltipYet = !tooltipRect;
  if (haventMeasuredTooltipYet) {
    return { visibility: "hidden" };
  }
  return position(triggerRect, tooltipRect);
};

var positionDefault = function positionDefault(triggerRect, tooltipRect) {
  var styles = {
    left: triggerRect.left + window.pageXOffset + "px",
    top: triggerRect.top + triggerRect.height + window.pageYOffset + "px"
  };

  var collisions = {
    top: triggerRect.top - tooltipRect.height < 0,
    right: window.innerWidth < triggerRect.left + tooltipRect.width,
    bottom:
      window.innerHeight < triggerRect.bottom + tooltipRect.height + OFFSET,
    left: triggerRect.left - tooltipRect.width < 0
  };

  var directionRight = collisions.right && !collisions.left;
  var directionUp = collisions.bottom && !collisions.top;

  return _extends({}, styles, {
    left: directionRight
      ? triggerRect.right - tooltipRect.width + window.pageXOffset + "px"
      : triggerRect.left + window.pageXOffset + "px",
    top: directionUp
      ? triggerRect.top -
        OFFSET -
        tooltipRect.height +
        window.pageYOffset +
        "px"
      : triggerRect.top +
        OFFSET +
        triggerRect.height +
        window.pageYOffset +
        "px"
  });
};
