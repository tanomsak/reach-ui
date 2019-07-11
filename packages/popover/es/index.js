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

import React, { useRef, forwardRef, useEffect } from "react";
import Portal from "@reach/portal";
import { useRect } from "@reach/rect";
import { assignRef } from "@reach/utils";
import tabbable from "tabbable";

export default forwardRef(function Popover(props, ref) {
  return React.createElement(
    Portal,
    null,
    React.createElement(PopoverImpl, _extends({ ref: ref }, props))
  );
});

// Popover is conditionally rendered so we can't start measuring until it shows
// up, so useRect needs to live down here not up in Popover
var PopoverImpl = forwardRef(function PopoverImpl(_ref, forwardedRef) {
  var targetRef = _ref.targetRef,
    _ref$position = _ref.position,
    position = _ref$position === undefined ? positionDefault : _ref$position,
    style = _ref.style,
    rest = _objectWithoutProperties(_ref, ["targetRef", "position", "style"]);

  var popoverRef = useRef();
  var popoverRect = useRect(popoverRef);
  var targetRect = useRect(targetRef);

  useSimulateTabNavigationForReactTree(targetRef, popoverRef);

  return React.createElement(
    "div",
    _extends(
      {
        "data-reach-popover": "",
        ref: function ref(node) {
          assignRef(popoverRef, node);
          assignRef(forwardedRef, node);
        },
        style: _extends(
          {},
          style,
          {
            position: "absolute"
          },
          getStyles(position, targetRect, popoverRect)
        )
      },
      rest
    )
  );
});

var getStyles = function getStyles(position, targetRect, popoverRect) {
  var needToMeasurePopup = !popoverRect;
  if (needToMeasurePopup) {
    return { visibility: "hidden" };
  }
  return position(targetRect, popoverRect);
};

export function positionDefault(targetRect, popoverRect) {
  var _getCollisions = getCollisions(targetRect, popoverRect),
    directionUp = _getCollisions.directionUp,
    directionRight = _getCollisions.directionRight;

  return {
    left: directionRight
      ? targetRect.right - popoverRect.width + window.pageXOffset + "px"
      : targetRect.left + window.pageXOffset + "px",
    top: directionUp
      ? targetRect.top - popoverRect.height + window.pageYOffset + "px"
      : targetRect.top + targetRect.height + window.pageYOffset + "px"
  };
}

export function positionMatchWidth(targetRect, popoverRect) {
  var _getCollisions2 = getCollisions(targetRect, popoverRect),
    directionUp = _getCollisions2.directionUp;

  return {
    width: targetRect.width,
    left: targetRect.left,
    top: directionUp
      ? targetRect.top - popoverRect.height + window.pageYOffset + "px"
      : targetRect.top + targetRect.height + window.pageYOffset + "px"
  };
}

// Finish this another time
// export function positionHorizontalCenter(targetRect, popoverRect) {
//   const targetCenter = targetRect.width / 2 + targetRect.left;
//   const popoverHalf = popoverRect.width / 2;

//   const collisions = {
//     right: window.innerWidth < targetCenter - popoverHalf,
//     left: targetCenter - popoverHalf < 0
//     // top:
//     // bottom:
//   };

//   return {
//     left: collisions.right
//       ? `${targetRect.right - popoverRect.width + window.pageXOffset}px`
//       : collisions.left ? `` : ``
//   };
// }

function getCollisions(targetRect, popoverRect) {
  var offsetLeft =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var offsetBottom =
    arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

  var collisions = {
    top: targetRect.top - popoverRect.height < 0,
    right: window.innerWidth < targetRect.left + popoverRect.width - offsetLeft,
    bottom:
      window.innerHeight <
      targetRect.bottom + popoverRect.height - offsetBottom,
    left: targetRect.left - popoverRect.width < 0
  };

  var directionRight = collisions.right && !collisions.left;
  var directionUp = collisions.bottom && !collisions.top;

  return { directionRight: directionRight, directionUp: directionUp };
}

// Heads up, my jQuery past haunts this function. This hook scopes the tab
// order to the React element tree, instead of the DOM tree. This way, when the
// user navigates with tab from the targetRef, the tab order moves into the
// popup, and then out of the popup back to the rest of the document.
// (We call targetRef, triggerRef inside this function to avoid confusion with
// event.target)
function useSimulateTabNavigationForReactTree(triggerRef, popoverRef) {
  var doc = triggerRef.current.ownerDocument; // maybe in devtools

  function handleKeyDown(event) {
    if (event.key === "Tab" && tabbable(popoverRef.current).length === 0) {
      return;
    }

    if (event.key === "Tab" && event.shiftKey) {
      if (shiftTabbedFromElementAfterTrigger(event)) {
        focusLastTabbableInPopover(event);
      } else if (shiftTabbedOutOfPopover(event)) {
        focusTriggerRef(event);
      } else if (shiftTabbedToBrowserChrome(event)) {
        disableTabbablesInPopover(event);
      }
    } else if (event.key === "Tab") {
      if (tabbedFromTriggerToPopover(event)) {
        focusFirstPopoverTabbable(event);
      } else if (tabbedOutOfPopover(event)) {
        focusTabbableAfterTrigger(event);
      } else if (tabbedToBrowserChrome(event)) {
        disableTabbablesInPopover(event);
      }
    }
  }

  useEffect(function() {
    doc.addEventListener("keydown", handleKeyDown);
    return function() {
      return doc.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function getElementAfterTrigger() {
    var elements = tabbable(doc);
    var targetIndex = elements.indexOf(triggerRef.current);
    return elements[targetIndex + 1];
  }

  function tabbedFromTriggerToPopover() {
    return triggerRef.current === document.activeElement;
  }
  function focusFirstPopoverTabbable(event) {
    var elements = tabbable(popoverRef.current);
    if (elements[0]) {
      event.preventDefault();
      elements[0].focus();
    }
  }

  function tabbedOutOfPopover(event) {
    var inPopover = popoverRef.current.contains(document.activeElement);
    if (inPopover) {
      var elements = tabbable(popoverRef.current);
      return elements[elements.length - 1] === document.activeElement;
    }
  }
  function focusTabbableAfterTrigger(event) {
    var elementAfterTrigger = getElementAfterTrigger();
    if (elementAfterTrigger) {
      event.preventDefault();
      elementAfterTrigger.focus();
    }
  }

  function shiftTabbedFromElementAfterTrigger(event) {
    if (!event.shiftKey) return;
    var elementAfterTrigger = getElementAfterTrigger();
    return event.target === elementAfterTrigger;
  }
  function focusLastTabbableInPopover(event) {
    var elements = tabbable(popoverRef.current);
    var last = elements[elements.length - 1];
    if (last) {
      event.preventDefault();
      last.focus();
    }
  }

  function shiftTabbedOutOfPopover(event) {
    var elements = tabbable(popoverRef.current);
    return elements.length === 0 ? false : event.target === elements[0];
  }
  function focusTriggerRef(event) {
    event.preventDefault();
    triggerRef.current.focus();
  }

  function tabbedToBrowserChrome(event) {
    var elements = tabbable(doc).filter(function(element) {
      return !popoverRef.current.contains(element);
    });
    return event.target === elements[elements.length - 1];
  }

  function shiftTabbedToBrowserChrome(event) {
    // we're assuming the popover will never contain the first tabbable
    // element, and it better not, because the trigger needs to be tabbable!
    return event.target === tabbable(doc)[0];
  }

  var restoreTabIndexTuplés = [];
  function disableTabbablesInPopover() {
    var elements = tabbable(popoverRef.current);
    elements.forEach(function(element) {
      restoreTabIndexTuplés.push([element, element.tabIndex]);
      element.tabIndex = -1;
    });
    doc.addEventListener("focusin", enableTabbablesInPopover);
  }
  function enableTabbablesInPopover(event) {
    doc.removeEventListener("focusin", enableTabbablesInPopover);
    restoreTabIndexTuplés.forEach(function(_ref2) {
      var element = _ref2[0],
        tabIndex = _ref2[1];

      element.tabIndex = tabIndex;
    });
  }
}
