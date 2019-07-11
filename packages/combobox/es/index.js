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

var _on, _on2, _on3, _on4, _states;

function _objectWithoutProperties(obj, keys) {
  var target = {};
  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }
  return target;
}

/* eslint-disable jsx-a11y/role-has-required-aria-props */
/* eslint-disable jsx-a11y/aria-proptypes */
/* eslint-disable jsx-a11y/role-supports-aria-props */
/* eslint-disable default-case */

////////////////////////////////////////////////////////////////////////////////
// Welcome to @reach/combobox! State transitions are managed by a state chart,
// state mutations are managed by a reducer. Please enjoy the read here, I
// figured out a few new tricks with context and refs I think you might love or
// hate 😂

// ???: navigate w/ arrows, then hit backspace: should it delete the
// autocompleted text or the old value the user had typed?!

import React, {
  forwardRef,
  createContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useContext,
  useMemo,
  useReducer,
  useState
} from "react";
import { func } from "prop-types";
import { wrapEvent, assignRef } from "@reach/utils";
// import { findAll } from "highlight-words-core";
// import escapeRegexp from "escape-regexp";
import { useId } from "@reach/auto-id";
import Popover, { positionMatchWidth } from "@reach/popover";

////////////////////////////////////////////////////////////////////////////////
// States

// Nothing going on, waiting for the user to type or use the arrow keys
var IDLE = "IDLE";

// The component is suggesting options as the user types
var SUGGESTING = "SUGGESTING";

// The user is using the keyboard to navigate the list, not typing
var NAVIGATING = "NAVIGATING";

// The user is interacting with arbitrary elements inside the popup that
// are not ComboboxInputs
var INTERACTING = "INTERACTING";

////////////////////////////////////////////////////////////////////////////////
// Actions:

// User cleared the value w/ backspace, but input still has focus
var CLEAR = "CLEAR";

// User is typing
var CHANGE = "CHANGE";

// User is navigating w/ the keyboard
var NAVIGATE = "NAVIGATE";

// User can be navigating with keyboard and then click instead, we want the
// value from the click, not the current nav item
var SELECT_WITH_KEYBOARD = "SELECT_WITH_KEYBOARD";
var SELECT_WITH_CLICK = "SELECT_WITH_CLICK";

// Pretty self-explanatory, user can hit escape or blur to close the popover
var ESCAPE = "ESCAPE";
var BLUR = "BLUR";

// The user left the input to interact with arbitrary elements inside the popup
var INTERACT = "INTERACT";

var FOCUS = "FOCUS";

var OPEN_WITH_BUTTON = "OPEN_WITH_BUTTON";

var CLOSE_WITH_BUTTON = "CLOSE_WITH_BUTTON";

////////////////////////////////////////////////////////////////////////////////
var stateChart = {
  initial: IDLE,
  states:
    ((_states = {}),
    (_states[IDLE] = {
      on:
        ((_on = {}),
        (_on[BLUR] = IDLE),
        (_on[CLEAR] = IDLE),
        (_on[CHANGE] = SUGGESTING),
        (_on[FOCUS] = SUGGESTING),
        (_on[NAVIGATE] = NAVIGATING),
        (_on[OPEN_WITH_BUTTON] = SUGGESTING),
        _on)
    }),
    (_states[SUGGESTING] = {
      on:
        ((_on2 = {}),
        (_on2[CHANGE] = SUGGESTING),
        (_on2[FOCUS] = SUGGESTING),
        (_on2[NAVIGATE] = NAVIGATING),
        (_on2[CLEAR] = IDLE),
        (_on2[ESCAPE] = IDLE),
        (_on2[BLUR] = IDLE),
        (_on2[SELECT_WITH_CLICK] = IDLE),
        (_on2[INTERACT] = INTERACTING),
        (_on2[CLOSE_WITH_BUTTON] = IDLE),
        _on2)
    }),
    (_states[NAVIGATING] = {
      on:
        ((_on3 = {}),
        (_on3[CHANGE] = SUGGESTING),
        (_on3[FOCUS] = SUGGESTING),
        (_on3[CLEAR] = IDLE),
        (_on3[BLUR] = IDLE),
        (_on3[ESCAPE] = IDLE),
        (_on3[NAVIGATE] = NAVIGATING),
        (_on3[SELECT_WITH_KEYBOARD] = IDLE),
        (_on3[CLOSE_WITH_BUTTON] = IDLE),
        (_on3[INTERACT] = INTERACTING),
        _on3)
    }),
    (_states[INTERACTING] = {
      on:
        ((_on4 = {}),
        (_on4[CHANGE] = SUGGESTING),
        (_on4[FOCUS] = SUGGESTING),
        (_on4[BLUR] = IDLE),
        (_on4[ESCAPE] = IDLE),
        (_on4[NAVIGATE] = NAVIGATING),
        (_on4[CLOSE_WITH_BUTTON] = IDLE),
        (_on4[SELECT_WITH_CLICK] = IDLE),
        _on4)
    }),
    _states)
};

function reducer(data, action) {
  var nextState = _extends({}, data, { lastActionType: action.type });
  switch (action.type) {
    case CHANGE:
      return _extends({}, nextState, {
        navigationValue: null,
        value: action.value
      });
    case NAVIGATE:
    case OPEN_WITH_BUTTON:
      return _extends({}, nextState, {
        navigationValue: findNavigationValue(nextState, action)
      });
    case CLEAR:
      return _extends({}, nextState, {
        value: {},
        navigationValue: null
      });
    case BLUR:
    case ESCAPE:
      return _extends({}, nextState, {
        navigationValue: null
      });
    case SELECT_WITH_CLICK:
      return _extends({}, nextState, {
        value: action.value,
        navigationValue: null
      });
    case SELECT_WITH_KEYBOARD:
      return _extends({}, nextState, {
        value: data.navigationValue,
        navigationValue: null
      });
    case CLOSE_WITH_BUTTON:
      return _extends({}, nextState, {
        navigationValue: null
      });
    case INTERACT:
      return nextState;
    case FOCUS:
      return _extends({}, nextState, {
        navigationValue: findNavigationValue(nextState, action)
      });

    default:
      throw new Error("Unknown action " + action.type);
  }
}

var visibleStates = [SUGGESTING, NAVIGATING, INTERACTING];
var isVisible = function isVisible(state) {
  return visibleStates.includes(state);
};
// When we open a list, set the navigation value to the value in the input, if
// it's in the list, then it'll automatically be highlighted.
var findNavigationValue = function findNavigationValue(state, action) {
  if (action.value) {
    return action.value;
  } else if (action.persistSelection) {
    return state.value;
  } else {
    return null;
  }
};

////////////////////////////////////////////////////////////////////////////////
// Combobox

var Context = createContext();

var Combobox = forwardRef(function Combobox(_ref, ref) {
  var onSelect = _ref.onSelect,
    _ref$openOnFocus = _ref.openOnFocus,
    openOnFocus = _ref$openOnFocus === undefined ? false : _ref$openOnFocus,
    children = _ref.children,
    _ref$as = _ref.as,
    Comp = _ref$as === undefined ? "div" : _ref$as,
    rest = _objectWithoutProperties(_ref, [
      "onSelect",
      "openOnFocus",
      "children",
      "as"
    ]);

  // We store the values of all the ComboboxOptions on this ref. This makes it
  // possible to perform the keyboard navigation from the input on the list. We
  // manipulate this array through context so that we don't have to enforce a
  // parent/child relationship between ComboboxList and ComboboxOption with
  // cloneElement or fall back to DOM traversal. It's a new trick for me and
  // I'm pretty excited about it.
  var optionsRef = useRef(null);

  // Need this to focus it
  var inputRef = useRef();

  var popoverRef = useRef();

  var buttonRef = useRef();

  // When <ComboboxInput autocomplete={false} /> we don't want cycle back to
  // the user's value while navigating (because it's always the user's value),
  // but we need to know this in useKeyDown which is far away from the prop
  // here, so we do something sneaky and write it to this ref on context so we
  // can use it anywhere else 😛. Another new trick for me and I'm excited
  // about this one too!
  var autocompletePropRef = useRef();

  var persistSelectionRef = useRef();

  var defaultData = {
    // the value the user has typed, we derived this also when the developer is
    // controlling the value of ComboboxInput
    value: {
      text: "",
      value: null,
      content: null
    },
    // the value the user has navigated to with the keyboard
    navigationValue: null
  };

  var _useReducerMachine = useReducerMachine(stateChart, reducer, defaultData),
    state = _useReducerMachine[0],
    data = _useReducerMachine[1],
    transition = _useReducerMachine[2];

  useFocusManagement(data.lastActionType, inputRef);

  var listboxId = "listbox:" + useId();

  var context = useMemo(
    function() {
      return {
        data: data,
        inputRef: inputRef,
        popoverRef: popoverRef,
        buttonRef: buttonRef,
        onSelect: onSelect,
        optionsRef: optionsRef,
        state: state,
        transition: transition,
        listboxId: listboxId,
        autocompletePropRef: autocompletePropRef,
        persistSelectionRef: persistSelectionRef,
        isVisible: isVisible(state),
        openOnFocus: openOnFocus
      };
    },
    [data, onSelect, state, transition, listboxId]
  );

  return React.createElement(
    Context.Provider,
    { value: context },
    React.createElement(
      Comp,
      _extends({}, rest, {
        "data-reach-combobox": "",
        ref: ref,
        role: "combobox",
        "aria-haspopup": "listbox",
        "aria-owns": listboxId,
        "aria-expanded": context.isVisible
      }),
      children
    )
  );
});

export { Combobox };
process.env.NODE_ENV !== "production"
  ? (Combobox.propTypes = { onSelect: func })
  : void 0;

////////////////////////////////////////////////////////////////////////////////
// ComboboxInput

var ComboboxInput = forwardRef(function ComboboxInput(_ref2, forwardedRef) {
  var _ref2$as = _ref2.as,
    Comp = _ref2$as === undefined ? "input" : _ref2$as,
    _ref2$selectOnClick = _ref2.selectOnClick,
    selectOnClick =
      _ref2$selectOnClick === undefined ? false : _ref2$selectOnClick,
    _ref2$autocomplete = _ref2.autocomplete,
    autocomplete = _ref2$autocomplete === undefined ? true : _ref2$autocomplete,
    onClick = _ref2.onClick,
    onChange = _ref2.onChange,
    onKeyDown = _ref2.onKeyDown,
    onBlur = _ref2.onBlur,
    onFocus = _ref2.onFocus,
    controlledValue = _ref2.value,
    props = _objectWithoutProperties(_ref2, [
      "as",
      "selectOnClick",
      "autocomplete",
      "onClick",
      "onChange",
      "onKeyDown",
      "onBlur",
      "onFocus",
      "value"
    ]);

  var _useContext = useContext(Context),
    _useContext$data = _useContext.data,
    navigationValue = _useContext$data.navigationValue,
    value = _useContext$data.value,
    lastActionType = _useContext$data.lastActionType,
    inputRef = _useContext.inputRef,
    state = _useContext.state,
    transition = _useContext.transition,
    listboxId = _useContext.listboxId,
    autocompletePropRef = _useContext.autocompletePropRef,
    openOnFocus = _useContext.openOnFocus;

  // Because we close the List on blur, we need to track if the blur is
  // caused by clicking inside the list, and if so, don't close the List.

  var selectOnClickRef = useRef(false);

  var handleKeyDown = useKeyDown();

  var handleBlur = useBlur();

  var isControlled = controlledValue != null;

  useLayoutEffect(function() {
    autocompletePropRef.current = autocomplete;
  });

  var handleValueChange = function handleValueChange(value) {
    if (value.text.trim() === "") {
      transition(CLEAR);
    } else {
      transition(CHANGE, { value: value });
    }
  };

  // If they are controlling the value we still need to do our transitions, so
  // we have this derived state to emulate onChange of the input as we receive
  // new `value`s ...[*]
  if (isControlled && controlledValue !== value) {
    handleValueChange(controlledValue);
  }

  // [*]... and when controlled, we don't trigger handleValueChange as the user
  // types, instead the developer controls it with the normal input onChange
  // prop
  var handleChange = function handleChange(event) {
    if (!isControlled) {
      handleValueChange(event.target.value);
    }
  };

  var handleFocus = function handleFocus() {
    if (selectOnClick) {
      selectOnClickRef.current = true;
    }

    // If we select an option with click, useFocusManagement will focus the
    // input, in those cases we don't want to cause the menu to open back up,
    // so we guard behind these states
    if (openOnFocus && lastActionType !== SELECT_WITH_CLICK) {
      transition(FOCUS);
    }
  };

  var handleClick = function handleClick() {
    if (selectOnClickRef.current) {
      selectOnClickRef.current = false;
      inputRef.current.select();
    }
  };

  var inputValue =
    autocomplete && (state === NAVIGATING || state === INTERACTING) // When idle, we don't have a navigationValue on ArrowUp/Down
      ? navigationValue || controlledValue || value
      : controlledValue || value;

  return React.createElement(
    Comp,
    _extends({}, props, {
      "data-reach-combobox-input": "",
      ref: function ref(node) {
        assignRef(inputRef, node);
        assignRef(forwardedRef, node);
      },
      value: inputValue,
      onClick: wrapEvent(onClick, handleClick),
      onBlur: wrapEvent(onBlur, handleBlur),
      onFocus: wrapEvent(onFocus, handleFocus),
      onChange: wrapEvent(onChange, handleChange),
      onKeyDown: wrapEvent(onKeyDown, handleKeyDown),
      id: listboxId,
      "aria-autocomplete": "both",
      "aria-activedescendant": navigationValue
        ? makeHash(navigationValue)
        : undefined
    })
  );
});

////////////////////////////////////////////////////////////////////////////////
// ComboboxPopover

export { ComboboxInput };
var ComboboxPopover = forwardRef(function ComboboxPopover(_ref3, forwardedRef) {
  var _ref3$portal = _ref3.portal,
    portal = _ref3$portal === undefined ? true : _ref3$portal,
    onKeyDown = _ref3.onKeyDown,
    onBlur = _ref3.onBlur,
    props = _objectWithoutProperties(_ref3, ["portal", "onKeyDown", "onBlur"]);

  var _useContext2 = useContext(Context),
    popoverRef = _useContext2.popoverRef,
    inputRef = _useContext2.inputRef,
    isVisible = _useContext2.isVisible;

  var handleKeyDown = useKeyDown();
  var handleBlur = useBlur();

  // Instead of conditionally rendering the popover we use the `hidden` prop
  // because we don't want to unmount on close (from escape or onSelect).  If
  // we unmounted, then we'd lose the optionsRef and the user wouldn't be able
  // to use the arrow keys to pop the list back open. However, the developer
  // can conditionally render the ComboboxPopover if they do want to cause
  // mount/unmount based on the app's own data (like results.length or
  // whatever).
  var hidden = !isVisible;

  var Container = portal ? Popover : "div";

  var popupProps = portal
    ? {
        targetRef: inputRef,
        position: positionMatchWidth
      }
    : null;

  return React.createElement(
    Container,
    _extends(
      {},
      props,
      {
        "data-reach-combobox-popover": ""
      },
      popupProps,
      {
        ref: function ref(node) {
          assignRef(popoverRef, node);
          assignRef(forwardedRef, node);
        },
        onKeyDown: wrapEvent(onKeyDown, handleKeyDown),
        onBlur: wrapEvent(onBlur, handleBlur),
        hidden: hidden,
        // Allow the user to click empty space inside the popover without causing
        // to close from useBlur
        tabIndex: "-1"
      }
    )
  );
});

////////////////////////////////////////////////////////////////////////////////
// ComboboxList

export { ComboboxPopover };
var ComboboxList = forwardRef(function ComboboxList(_ref4, ref) {
  var _ref4$persistSelectio = _ref4.persistSelection,
    persistSelection =
      _ref4$persistSelectio === undefined ? false : _ref4$persistSelectio,
    _ref4$as = _ref4.as,
    Comp = _ref4$as === undefined ? "ul" : _ref4$as,
    props = _objectWithoutProperties(_ref4, ["persistSelection", "as"]);

  var _useContext3 = useContext(Context),
    optionsRef = _useContext3.optionsRef,
    persistSelectionRef = _useContext3.persistSelectionRef;

  if (persistSelection) {
    persistSelectionRef.current = true;
  }

  // WEIRD? Reset the options ref every render so that they are always
  // accurate and ready for keyboard navigation handlers. Using layout
  // effect to schedule this effect before the ComboboxOptions push into
  // the array
  useLayoutEffect(function() {
    optionsRef.current = [];
    return function() {
      return (optionsRef.current = []);
    };
  });

  return React.createElement(
    Comp,
    _extends({}, props, {
      ref: ref,
      "data-reach-combobox-list": "",
      role: "listbox"
    })
  );
});

////////////////////////////////////////////////////////////////////////////////
// ComboboxOption

// Allows us to put the option's value on context so that ComboboxOptionText
// can work it's highlight text magic no matter what else is rendered around
// it.
export { ComboboxList };
var OptionContext = createContext();

var ComboboxOption = forwardRef(function ComboboxOption(_ref5, ref) {
  var children = _ref5.children,
    value = _ref5.value,
    onClick = _ref5.onClick,
    props = _objectWithoutProperties(_ref5, ["children", "value", "onClick"]);

  var _useContext4 = useContext(Context),
    onSelect = _useContext4.onSelect,
    navigationValue = _useContext4.data.navigationValue,
    transition = _useContext4.transition,
    optionsRef = _useContext4.optionsRef;

  useEffect(function() {
    optionsRef.current.push(value);
  });

  var isActive = navigationValue === value;

  var handleClick = function handleClick() {
    onSelect && onSelect(value);
    transition(SELECT_WITH_CLICK, { value: value });
  };

  return React.createElement(
    OptionContext.Provider,
    { value: value },
    React.createElement(
      "li",
      _extends({}, props, {
        "data-reach-combobox-option": "",
        ref: ref,
        id: makeHash(value.text),
        role: "option",
        "aria-selected": isActive,
        "data-highlighted": isActive ? "" : undefined,
        // without this the menu will close from `onBlur`, but with it the
        // element can be `document.activeElement` and then our focus checks in
        // onBlur will work as intended
        tabIndex: "-1",
        onClick: wrapEvent(onClick, handleClick),
        children: value.content || value.text
      })
    )
  );
});

////////////////////////////////////////////////////////////////////////////////
// ComboboxOptionText

// We don't forwardRef or spread props because we render multiple spans or null,
// should be fine 🤙
// export function ComboboxOptionText() {
//   const value = useContext(OptionContext);
//   const {
//     data: { value: contextValue }
//   } = useContext(Context);

//   const searchWords = escapeRegexp(contextValue).split(/\s+/);
//   const textToHighlight = value;
//   const results = useMemo(() => findAll({ searchWords, textToHighlight }), [
//     searchWords,
//     textToHighlight
//   ]);

//   return results.length
//     ? results.map((result, index) => {
//         const str = value.slice(result.start, result.end);
//         return (
//           <span
//             key={index}
//             data-user-value={result.highlight ? true : undefined}
//             data-suggested-value={result.highlight ? undefined : true}
//           >
//             {str}
//           </span>
//         );
//       })
//     : value;
// }

////////////////////////////////////////////////////////////////////////////////
// ComboboxButton
export { ComboboxOption };
var ComboboxButton = forwardRef(function ComboboxButton(_ref6, _ref7) {
  var _ref6$as = _ref6.as,
    Comp = _ref6$as === undefined ? "button" : _ref6$as,
    onClick = _ref6.onClick,
    onKeyDown = _ref6.onKeyDown,
    props = _objectWithoutProperties(_ref6, ["as", "onClick", "onKeyDown"]);

  var _useContext5 = useContext(Context),
    transition = _useContext5.transition,
    state = _useContext5.state,
    buttonRef = _useContext5.buttonRef,
    listboxId = _useContext5.listboxId,
    isVisible = _useContext5.isVisible;

  var handleKeyDown = useKeyDown();

  var handleClick = function handleClick() {
    if (state === IDLE) {
      transition(OPEN_WITH_BUTTON);
    } else {
      transition(CLOSE_WITH_BUTTON);
    }
  };

  return React.createElement(
    Comp,
    _extends(
      {
        "data-reach-combobox-button": "",
        "aria-controls": listboxId,
        "aria-haspopup": "listbox",
        "aria-expanded": isVisible,
        ref: function ref(node) {
          assignRef(_ref7, node);
          assignRef(buttonRef, node);
        },
        onClick: wrapEvent(onClick, handleClick),
        onKeyDown: wrapEvent(onKeyDown, handleKeyDown)
      },
      props
    )
  );
});

////////////////////////////////////////////////////////////////////////////////
// The rest is all implementation details

// Move focus back to the input if we start navigating w/ the
// keyboard after focus has moved to any focusable content in
// the popup.
export { ComboboxButton };
function useFocusManagement(lastActionType, inputRef) {
  // useLayoutEffect so that the cursor goes to the end of the input instead
  // of awkwardly at the beginning, unclear to my why ...
  useLayoutEffect(function() {
    if (
      lastActionType === NAVIGATE ||
      lastActionType === ESCAPE ||
      lastActionType === SELECT_WITH_CLICK ||
      lastActionType === OPEN_WITH_BUTTON
    ) {
      inputRef.current.focus();
    }
  });
}

// We want the same events when the input or the popup have focus (HOW COOL ARE
// HOOKS BTW?) This is probably the hairiest piece but it's not bad.
function useKeyDown() {
  var _useContext6 = useContext(Context),
    navigationValue = _useContext6.data.navigationValue,
    onSelect = _useContext6.onSelect,
    optionsRef = _useContext6.optionsRef,
    state = _useContext6.state,
    transition = _useContext6.transition,
    autocompletePropRef = _useContext6.autocompletePropRef,
    persistSelectionRef = _useContext6.persistSelectionRef;

  return function handleKeyDown(event) {
    var options = optionsRef.current;

    switch (event.key) {
      case "ArrowDown": {
        // Don't scroll the page
        event.preventDefault();

        // If the developer didn't render any options, there's no point in
        // trying to navigate--but seriously what the heck? Give us some
        // options fam.
        if (!options || options.length === 0) {
          return;
        }

        if (state === IDLE) {
          // Opening a closed list
          transition(NAVIGATE, {
            persistSelection: persistSelectionRef.current
          });
        } else {
          var index = options.indexOf(navigationValue);
          var atBottom = index === options.length - 1;
          if (atBottom) {
            if (autocompletePropRef.current) {
              // Go back to the value the user has typed because we are
              // autocompleting and they need to be able to get back to what
              // they had typed w/o having to backspace out.
              transition(NAVIGATE, { value: null });
            } else {
              // cycle through
              var firstOption = options[0];
              transition(NAVIGATE, { value: firstOption });
            }
          } else {
            // Go to the next item in the list
            var nextValue = options[(index + 1) % options.length];
            transition(NAVIGATE, { value: nextValue });
          }
        }
        break;
      }
      // A lot of duplicate code with ArrowDown up next, I'm already over it.
      case "ArrowUp": {
        // Don't scroll the page
        event.preventDefault();

        // If the developer didn't render any options, there's no point in
        // trying to navigate--but seriously what the heck? Give us some
        // options fam.
        if (!options || options.length === 0) {
          return;
        }

        if (state === IDLE) {
          transition(NAVIGATE);
        } else {
          var _index = options.indexOf(navigationValue);
          if (_index === 0) {
            if (autocompletePropRef.current) {
              // Go back to the value the user has typed because we are
              // autocompleting and they need to be able to get back to what
              // they had typed w/o having to backspace out.
              transition(NAVIGATE, { value: null });
            } else {
              // cycle through
              var lastOption = options[options.length - 1];
              transition(NAVIGATE, { value: lastOption });
            }
          } else if (_index === -1) {
            // displaying the user's value, so go select the last one
            var value = options.length ? options[options.length - 1] : null;
            transition(NAVIGATE, { value: value });
          } else {
            // normal case, select previous
            var _nextValue =
              options[(_index - 1 + options.length) % options.length];
            transition(NAVIGATE, { value: _nextValue });
          }
        }
        break;
      }
      case "Escape": {
        if (state !== IDLE) {
          transition(ESCAPE);
        }
        break;
      }
      case "Enter": {
        if (state === NAVIGATING && navigationValue !== null) {
          // don't want to submit forms
          event.preventDefault();
          onSelect && onSelect(navigationValue);
          transition(SELECT_WITH_KEYBOARD);
        }
        break;
      }
    }
  };
}

function useBlur() {
  var _useContext7 = useContext(Context),
    state = _useContext7.state,
    transition = _useContext7.transition,
    popoverRef = _useContext7.popoverRef,
    inputRef = _useContext7.inputRef,
    buttonRef = _useContext7.buttonRef;

  return function handleBlur(event) {
    requestAnimationFrame(function() {
      // we on want to close only if focus rests outside the combobox
      if (
        document.activeElement !== inputRef.current &&
        document.activeElement !== buttonRef.current &&
        popoverRef.current
      ) {
        if (popoverRef.current.contains(document.activeElement)) {
          // focus landed inside the combobox, keep it open
          if (state !== INTERACTING) {
            transition(INTERACT);
          }
        } else {
          // focus landed outside the combobox, close it.
          transition(BLUR);
        }
      }
    });
  };
}

// This manages transitions between states with a built in reducer to manage
// the data that goes with those transitions.
function useReducerMachine(chart, reducer, initialData) {
  var _useState = useState(chart.initial),
    state = _useState[0],
    setState = _useState[1];

  var _useReducer = useReducer(reducer, initialData),
    data = _useReducer[0],
    dispatch = _useReducer[1];

  var transition = function transition(action) {
    var payload =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var currentState = chart.states[state];
    var nextState = currentState.on[action];
    if (!nextState) {
      throw new Error(
        'Unknown action "' + action + '" for state "' + state + '"'
      );
    }
    dispatch(
      _extends({ type: action, state: state, nextState: state }, payload)
    );
    setState(nextState);
  };

  return [state, data, transition];
}

// We don't want to track the active descendant with indexes because nothing is
// more annoying in a combobox than having it change values RIGHT AS YOU HIT
// ENTER. That only happens if you use the index as your data, rather than
// *your data as your data*. We use this to generate a unique ID based on the
// value of each item.  This function is short, sweet, and good enough™ (I also
// don't know how it works, tbqh)
// https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
var makeHash = function makeHash(str) {
  var hash = 0;
  if (str.length === 0) {
    return hash;
  }
  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
};

////////////////////////////////////////////////////////////////////////////////
// Well alright, you made it all the way here to like 700 lines of code (geez,
// what the heck?). Have a great day :D
