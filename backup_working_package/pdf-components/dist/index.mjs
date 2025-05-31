var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/components/BoundingBox.tsx
import classNames from "classnames";
import * as React3 from "react";

// src/context/DocumentContext.ts
import * as React from "react";

// src/utils/provider.ts
function logProviderWarning(functionName, providerName) {
  console.warn(
    `Unable to call ${functionName}. The ${providerName} Provider may not be set up correctly.`
  );
}

// src/utils/rotate.ts
var PageRotation = /* @__PURE__ */ ((PageRotation2) => {
  PageRotation2[PageRotation2["Rotate0"] = 0] = "Rotate0";
  PageRotation2[PageRotation2["Rotate90"] = 90] = "Rotate90";
  PageRotation2[PageRotation2["Rotate180"] = 180] = "Rotate180";
  PageRotation2[PageRotation2["Rotate270"] = 270] = "Rotate270";
  return PageRotation2;
})(PageRotation || {});
function rotateClockwise(rotation) {
  switch (rotation) {
    case 0 /* Rotate0 */:
      return 90 /* Rotate90 */;
    case 90 /* Rotate90 */:
      return 180 /* Rotate180 */;
    case 180 /* Rotate180 */:
      return 270 /* Rotate270 */;
    default:
      return 0 /* Rotate0 */;
  }
}
function rotateCounterClockwise(rotation) {
  switch (rotation) {
    case 0 /* Rotate0 */:
      return 270 /* Rotate270 */;
    case 90 /* Rotate90 */:
      return 0 /* Rotate0 */;
    case 180 /* Rotate180 */:
      return 90 /* Rotate90 */;
    default:
      return 180 /* Rotate180 */;
  }
}
function isSideways(rotation) {
  return rotation === 90 /* Rotate90 */ || rotation === 270 /* Rotate270 */;
}

// src/utils/scroll.ts
var PAGE_NAV_TARGET_ID_ROOT = "reader_pg_";
var PDF_HEIGHT_POINTS = 792;
var PDF_WIDTH_POINTS = 612;
function generatePageIdFromIndex(pageIndex) {
  return `${PAGE_NAV_TARGET_ID_ROOT}${pageIndex}`;
}
function scrollToId(id) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start", inline: "center" });
  } else {
    console.error(`Could not find scroll target with ID #${id}`);
  }
}
function scrollToPdfPageIndex(pageIndex) {
  scrollToId(generatePageIdFromIndex(pageIndex));
}
function scrollToPosition(pageIndex, leftPoints, bottomPoints, rotation = 0 /* Rotate0 */) {
  const { width, height, marginTop, marginBottom, marginLeft, marginRight } = getPagePropertiesInPixels();
  const heightWithMargins = height + marginTop + marginBottom;
  let marginTopPixels = marginTop;
  let bottomPixels = height * bottomPoints / PDF_HEIGHT_POINTS;
  let leftPixels = width * leftPoints / PDF_WIDTH_POINTS;
  if (rotation == 90 /* Rotate90 */) {
    marginTopPixels = marginLeft;
    bottomPixels = height * (PDF_WIDTH_POINTS - leftPoints) / PDF_WIDTH_POINTS;
    leftPixels = width * bottomPoints / PDF_HEIGHT_POINTS;
  } else if (rotation == 180 /* Rotate180 */) {
    marginTopPixels = marginBottom;
    bottomPixels = height * (PDF_HEIGHT_POINTS - bottomPoints) / PDF_HEIGHT_POINTS;
    leftPixels = width * (PDF_WIDTH_POINTS - leftPoints) / PDF_WIDTH_POINTS;
  } else if (rotation == 270 /* Rotate270 */) {
    marginTopPixels = marginRight;
    bottomPixels = height * leftPoints / PDF_WIDTH_POINTS;
    leftPixels = width * (PDF_HEIGHT_POINTS - bottomPoints) / PDF_HEIGHT_POINTS;
  }
  const pageId = generatePageIdFromIndex(pageIndex);
  const pageIdElement = document.getElementById(pageId);
  if (!pageIdElement) {
    return;
  }
  const parentElement = getScrollParent(pageIdElement);
  if (!parentElement) {
    return;
  }
  parentElement.scrollTo({
    top: calculateTopPx({
      heightWithMarginsInPx: heightWithMargins,
      pageIndex,
      marginTopPx: marginTopPixels,
      heightPx: height,
      bottomPx: bottomPixels
    }),
    left: Math.floor(leftPixels),
    behavior: "smooth"
  });
}
function getScrollParent(node) {
  const minScrollableHeight = 50;
  if (typeof document === "undefined") {
    return null;
  }
  if (!node || node.nodeName.toLowerCase() === "body") {
    return document.documentElement;
  }
  if (node.scrollHeight - node.clientHeight > minScrollableHeight && !isOverflowIsHidden(node)) {
    return node;
  }
  return getScrollParent(node.parentElement);
}
function isOverflowIsHidden(node) {
  const style = getComputedStyle(node);
  return style.overflow.includes("hidden") || style.overflowX.includes("hidden") || style.overflowY.includes("hidden");
}
function calculateTopPx({
  heightWithMarginsInPx,
  pageIndex,
  marginTopPx,
  heightPx,
  bottomPx
}) {
  return Math.floor(heightWithMarginsInPx * pageIndex + marginTopPx + (heightPx - bottomPx));
}
function getPagePropertiesInPixels() {
  const firstPage = document.getElementById(generatePageIdFromIndex(0));
  if (!firstPage) {
    console.error(`Cannot get the first page of this document.`);
    const emptyPageProperties = {
      width: 0,
      height: 0,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0
    };
    return emptyPageProperties;
  }
  const style = getComputedStyle(firstPage);
  const pageProperties = {
    width: parseInt(style.width),
    height: parseInt(style.height),
    marginTop: parseInt(style.marginTop),
    marginBottom: parseInt(style.marginBottom),
    marginLeft: parseInt(style.marginLeft),
    marginRight: parseInt(style.marginRight)
  };
  return pageProperties;
}
function calculateTargetPosition({
  scale,
  leftPoint,
  bottomPoint,
  pageDimensions,
  rotation = 0 /* Rotate0 */
}) {
  switch (rotation) {
    default:
    case 0 /* Rotate0 */: {
      const leftPx = leftPoint / PDF_WIDTH_POINTS * pageDimensions.width * scale;
      const topPx = (1 - bottomPoint / PDF_HEIGHT_POINTS) * pageDimensions.height * scale;
      return { leftPx, topPx };
    }
  }
}

// src/context/DocumentContext.ts
var DocumentContext = React.createContext({
  numPages: 0,
  numPagesLoaded: 0,
  outline: [],
  outlinePositions: null,
  pageDimensions: { height: 0, width: 0 },
  pdfDocProxy: void 0,
  getOutlineTargets: (opts) => {
    logProviderWarning(`getOutlineTargets(${JSON.stringify(opts)})`, "DocumentContext");
    return [];
  },
  setNumPages: (numPages) => {
    logProviderWarning(`setNumPages(${numPages})`, "DocumentContext");
  },
  setNumPagesLoaded: (numPages) => {
    logProviderWarning(`setNumPagesLoaded(${numPages})`, "DocumentContext");
  },
  setOutline: (outline) => {
    logProviderWarning(`setOutline(${outline})`, "DocumentContext");
  },
  setOutlinePositions: (outline) => {
    logProviderWarning(`setOutlinePositions(${outline})`, "DocumentContext");
  },
  setPageDimensions: (pageDimensions) => {
    logProviderWarning(`setPageDimensions(${pageDimensions})`, "DocumentContext");
  },
  setPdfDocProxy: (pdfDocProxy) => {
    logProviderWarning(`setPdfDocProxy(${pdfDocProxy})`, "DocumentContext");
  }
});
function useDocumentContextProps() {
  const [numPages, setNumPages] = React.useState(0);
  const [numPagesLoaded, setNumPagesLoaded] = React.useState(0);
  const [outline, setOutline] = React.useState(null);
  const [outlinePositions, setOutlinePositions] = React.useState(null);
  const [pageDimensions, setPageDimensions] = React.useState({
    height: 0,
    width: 0
  });
  const [pdfDocProxy, setPdfDocProxy] = React.useState();
  const getOutlineTargets = React.useCallback(
    ({
      pageNumber,
      pageIndex,
      scale,
      rotation,
      pageDimensions: pageDimensions2
    }) => {
      if (typeof pageIndex === "number") {
        pageNumber = pageIndex + 1;
      }
      if (typeof pageNumber !== "number") {
        return [];
      }
      const positions = outlinePositions?.get(pageNumber) || [];
      return positions.map(({ dest, leftPoint, bottomPoint }) => {
        const { leftPx, topPx } = calculateTargetPosition({
          scale,
          rotation,
          leftPoint,
          bottomPoint,
          pageDimensions: pageDimensions2
        });
        return {
          dest,
          leftPx,
          topPx
        };
      });
    },
    [outlinePositions]
  );
  return {
    numPages,
    numPagesLoaded,
    outline,
    outlinePositions,
    pageDimensions,
    pdfDocProxy,
    getOutlineTargets,
    setNumPages,
    setNumPagesLoaded,
    setOutline,
    setOutlinePositions,
    setPageDimensions,
    setPdfDocProxy
  };
}
async function buildOutlinePositions(pdfDocProxy, outline) {
  if (!outline) {
    outline = await pdfDocProxy.getOutline();
  }
  const itemQueue = outline.slice();
  const proms = [];
  while (itemQueue.length > 0) {
    const item = itemQueue.pop();
    if (!item) {
      continue;
    }
    const { dest, items } = item;
    if (Array.isArray(items)) {
      itemQueue.push(...items);
    }
    if (Array.isArray(dest)) {
      proms.push(...dest.map((dest2) => getDestination(pdfDocProxy, dest2)));
    } else if (typeof dest === "string") {
      proms.push(getDestination(pdfDocProxy, dest));
    }
  }
  const results = await Promise.all(proms);
  const map = /* @__PURE__ */ new Map();
  for (const result of results) {
    if (!result) {
      continue;
    }
    const { pageNumber } = result;
    if (!map.has(pageNumber)) {
      map.set(pageNumber, []);
    }
    map.get(pageNumber)?.push(result);
  }
  for (const pagePos of map.values()) {
    for (const pos of pagePos) {
      Object.freeze(pos);
    }
    Object.freeze(pagePos);
  }
  Object.freeze(map);
  return map;
}
async function getDestination(pdfDocProxy, dest) {
  try {
    const result = await pdfDocProxy.getDestination(dest);
    if (!result) {
      return null;
    }
    const [ref, _format, leftPoint, bottomPoint] = result;
    const pageIndex = await pdfDocProxy.getPageIndex(ref);
    const pageNumber = pageIndex + 1;
    return { pageNumber, dest, leftPoint, bottomPoint };
  } catch {
    return null;
  }
}

// src/context/TransformContext.ts
import * as React2 from "react";
var DEFAULT_ZOOM_SCALE = 1;
var TransformContext = React2.createContext({
  pixelRatio: (typeof window !== "undefined" ? window.devicePixelRatio : null) || 1,
  rotation: 0 /* Rotate0 */,
  scale: 1,
  zoomIncrementValue: 0.2,
  setPixelRatio: (pixelRatio) => {
    logProviderWarning(`setPixelRatio(${pixelRatio})`, "TransformContext");
  },
  setRotation: (rotation) => {
    logProviderWarning(`setRotation(${rotation})`, "TransformContext");
  },
  setScale: (scale) => {
    logProviderWarning(`setScale(${scale})`, "TransformContext");
  },
  setZoomIncrementValue: (value) => {
    logProviderWarning(`setZoomIncrementValue(${value})`, "TransformContext");
  }
});
function useTransformContextProps() {
  const [pixelRatio, setPixelRatio] = React2.useState(
    (typeof window !== "undefined" ? window.devicePixelRatio : null) || 1
  );
  const [rotation, setRotation] = React2.useState(0 /* Rotate0 */);
  const [scale, setScale] = React2.useState(DEFAULT_ZOOM_SCALE);
  const [zoomIncrementValue, setZoomIncrementValue] = React2.useState(0.2);
  return {
    pixelRatio,
    rotation,
    scale,
    setPixelRatio,
    setRotation,
    setScale,
    zoomIncrementValue,
    setZoomIncrementValue
  };
}

// src/utils/style.ts
function computeBoundingBoxStyle(boundingBoxSize, pageDimensions, rotation, scale) {
  const { top, left, height, width } = boundingBoxSize;
  switch (rotation) {
    case 90 /* Rotate90 */:
      return {
        top: left * scale,
        left: (pageDimensions.height - height - top) * scale,
        height: width * scale,
        width: height * scale
      };
    case 180 /* Rotate180 */:
      return {
        top: (pageDimensions.height - height - top) * scale,
        left: (pageDimensions.width - width - left) * scale,
        height: height * scale,
        width: width * scale
      };
    case 270 /* Rotate270 */:
      return {
        top: (pageDimensions.width - width - left) * scale,
        left: top * scale,
        height: width * scale,
        width: height * scale
      };
    default:
      return {
        top: top * scale,
        left: left * scale,
        height: height * scale,
        width: width * scale
      };
  }
}
function computePageStyle(pageDimensions, rotation, scale) {
  return {
    height: getPageHeight(pageDimensions, rotation) * scale,
    width: getPageWidth(pageDimensions, rotation) * scale,
    left: 0,
    top: 0
  };
}
function getPageHeight(pageDimensions, rotation) {
  return isSideways(rotation) ? pageDimensions.width : pageDimensions.height;
}
function getPageWidth(pageDimensions, rotation) {
  return isSideways(rotation) ? pageDimensions.height : pageDimensions.width;
}

// src/components/BoundingBox.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var BoundingBox = ({
  top,
  left,
  height,
  width,
  className,
  underlineClassName,
  id,
  isHighlighted,
  onClick,
  voiceOverLabel,
  ...extraProps
}) => {
  const { pageDimensions } = React3.useContext(DocumentContext);
  const { rotation, scale } = React3.useContext(TransformContext);
  const boxSize = { top, left, height, width };
  const componentClassName = classNames(
    "pdf-reader__overlay-bounding-box",
    isHighlighted === true ? "pdf-reader__overlay-bounding-box-highlighted" : "",
    className
  );
  const getBoundingBoxStyle = React3.useCallback(() => {
    return computeBoundingBoxStyle(boxSize, pageDimensions, rotation, scale);
  }, [pageDimensions, rotation, scale]);
  const rotationClassName = React3.useCallback(() => {
    return `rotate${rotation}`;
  }, [rotation]);
  return /* @__PURE__ */ jsxs(React3.Fragment, { children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: `pdf-reader__overlay-bounding-box-underline ${underlineClassName || rotationClassName()}`,
        style: getBoundingBoxStyle()
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        id,
        className: `${componentClassName} ${rotationClassName()}`,
        style: getBoundingBoxStyle(),
        onClick,
        role: "button",
        tabIndex: 0,
        "aria-label": voiceOverLabel,
        ...extraProps
      }
    )
  ] });
};

// src/components/DocumentWrapper.tsx
import * as React6 from "react";

// src/context/ScrollContext.ts
import * as React4 from "react";

// src/utils/ScrollDirectionDetector.ts
var ScrollDetector = class {
  constructor(el, setScrollDirection, setIsAtTop, setScrollThresholdReachedInDirection, scrollThreshold) {
    this._onScroll = () => {
      const currScrollTop = this._el.scrollTop;
      if (this._isAtTop !== (currScrollTop === 0)) {
        this._isAtTop = currScrollTop === 0;
        this._setIsAtTop(currScrollTop === 0);
      }
      if (this._lastScrollTop === currScrollTop) {
        return;
      }
      const currScrollDirection = (() => {
        if (currScrollTop <= 0) {
          return "DOWN" /* DOWN */;
        }
        return this._lastScrollTop < currScrollTop ? "DOWN" /* DOWN */ : "UP" /* UP */;
      })();
      this._lastScrollTop = currScrollTop;
      if (this._lastScrollDirection !== currScrollDirection) {
        this._lastScrollDirection = currScrollDirection;
        this._setScrollDirection(currScrollDirection);
        this._lastScrollTopBeforeDirectionChange = currScrollTop;
        this._isScrollThresholdReachedInDirection = null;
        if (this._setScrollThresholdReachedInDirection && !this._isAtTop) {
          this._setScrollThresholdReachedInDirection(null);
        }
      } else {
        if (this._scrollThreshold && this._setScrollThresholdReachedInDirection) {
          const scrolledAmount = Math.abs(this._lastScrollTopBeforeDirectionChange - currScrollTop);
          if (scrolledAmount >= this._scrollThreshold) {
            this._isScrollThresholdReachedInDirection = this._lastScrollDirection;
            this._setScrollThresholdReachedInDirection(this._lastScrollDirection);
          }
        }
      }
    };
    this._el = el;
    this._lastScrollTop = this._el.scrollTop;
    this._lastScrollDirection = null;
    this._setScrollDirection = setScrollDirection;
    this._isAtTop = null;
    this._setIsAtTop = setIsAtTop;
    this._lastScrollTopBeforeDirectionChange = this._el.scrollTop;
    this._scrollThreshold = scrollThreshold;
    this._isScrollThresholdReachedInDirection = null;
    this._setScrollThresholdReachedInDirection = setScrollThresholdReachedInDirection;
  }
  attachScrollListener() {
    if (this._el?.tagName?.toLowerCase() === "html") {
      window.addEventListener("scroll", this._onScroll, false);
      return;
    }
    this._el.addEventListener("scroll", this._onScroll, false);
  }
  detachScrollListener() {
    if (this._el?.tagName?.toLowerCase() === "html") {
      window.removeEventListener("scroll", this._onScroll, false);
      return;
    }
    this._el.removeEventListener("scroll", this._onScroll, false);
  }
};

// src/utils/VisibleEntriesDetector.ts
var DEFAULT_ROOT_MARGIN = "50px";
var DEFAULT_THRESHOLD = Array.from({ length: 101 }).map((_, i) => i / 100);
var VisibleEntriesDetector = class {
  constructor({
    root,
    thresHold,
    setVisibleEntries,
    onVisibleEntriesChange
  }) {
    this._root = root;
    this._lastVisibleEntries = /* @__PURE__ */ new Map();
    this._setVisibleEntries = setVisibleEntries;
    this._onVisibleEntriesChange = onVisibleEntriesChange;
    this._observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        const hiddenEntries = entries.filter((entry) => !entry.isIntersecting);
        const newVisibleEntries = this._onVisibleEntriesChange({
          visibleEntries,
          hiddenEntries,
          lastEntries: this._lastVisibleEntries
        });
        const frozenEntries = new Map(newVisibleEntries);
        Object.freeze(frozenEntries);
        this._lastVisibleEntries = frozenEntries;
        this._setVisibleEntries(frozenEntries);
      },
      // Default setting for intersection observer
      {
        root: this._root.tagName?.toLowerCase() === "html" ? null : this._root,
        rootMargin: DEFAULT_ROOT_MARGIN,
        threshold: thresHold ? thresHold : DEFAULT_THRESHOLD
      }
    );
  }
  observeNodes(selector) {
    for (const node of this._root.querySelectorAll(selector)) {
      this._observer.observe(node);
    }
  }
  destroy() {
    this._observer.disconnect();
  }
};

// src/context/ScrollContext.ts
var OUTLINE_ATTRIBUTE = "data-outline-target-dest";
var OUTLINE_SELECTOR = ".pdf-reader__page__outline-target";
var PAGE_NUMBER_ATTRIBUTE = "data-page-number";
var PAGE_NUMBER_SELECTOR = `.pdf-reader__page[${PAGE_NUMBER_ATTRIBUTE}]`;
var DEFAULT_PAGE_SCROLLED_INTO_VIEW_THRESHOLD = 0.1;
var EMPTY_NUMBER_TO_VISIBLE_ENTRY_DETAIL_MAP = Object.freeze(
  /* @__PURE__ */ new Map()
);
var DEFAULT_CONTEXT = {
  scrollDirection: null,
  visibleOutlineTargets: /* @__PURE__ */ new Map(),
  visiblePageRatios: /* @__PURE__ */ new Map(),
  isOutlineTargetVisible: (opts) => {
    logProviderWarning(`isOutlineTargetVisible(${JSON.stringify(opts)})`, "ScrollContext");
    return false;
  },
  isPageVisible: (opts) => {
    logProviderWarning(`isPageVisible(${JSON.stringify(opts)})`, "ScrollContext");
    return false;
  },
  resetScrollObservers: () => {
    logProviderWarning(`resetScrollObservers()`, "ScrollContext");
  },
  scrollRoot: {},
  setScrollRoot: (_el) => {
    logProviderWarning(`setScrollRoot(...)`, "ScrollContext");
  },
  scrollToOutlineTarget: (dest) => {
    logProviderWarning(`scrollToOutlineTarget(${dest})`, "ScrollContext");
  },
  setScrollThreshold: (scrollThreshold) => {
    logProviderWarning(`setScrollThreshold(${scrollThreshold})`, "ScrollContext");
  },
  scrollToPage: (opts) => {
    logProviderWarning(`scrollToPage(${JSON.stringify(opts)})`, "ScrollContext");
  },
  updateScrollPosition: (zoomMultiplier) => {
    logProviderWarning(`updateScrollPosition(${JSON.stringify(zoomMultiplier)})`, "ScrollContext");
  },
  setIsOutlineClicked: (opts) => {
    logProviderWarning(`setIsOutlineGetClicked(${JSON.stringify(opts)})`, "ScrollContext");
  },
  scrollThresholdReachedInDirection: null,
  isAtTop: null,
  isOutlineClicked: null,
  pagesScrolledIntoView: /* @__PURE__ */ new Map(),
  setPageScrolledIntoViewThreshold: (threshold) => {
    logProviderWarning(`pagesScrolledIntoView(${threshold})`, "ScrollContext");
  }
};
var ScrollContext = React4.createContext(DEFAULT_CONTEXT);
function useScrollContextProps() {
  const [scrollRoot, setScrollRoot] = React4.useState(null);
  const [scrollDirection, setScrollDirection] = React4.useState(null);
  const [scrollThreshold, setScrollThreshold] = React4.useState(null);
  const [scrollThresholdReachedInDirection, setScrollThresholdReachedInDirection] = React4.useState(null);
  const [isAtTop, setIsAtTop] = React4.useState(null);
  const [isOutlineClicked, setIsOutlineClicked] = React4.useState(null);
  const [pageScrolledIntoViewThreshold, setPageScrolledIntoViewThreshold] = React4.useState(
    DEFAULT_PAGE_SCROLLED_INTO_VIEW_THRESHOLD
  );
  const [pagesScrolledIntoView, setPagesScrolledIntoView] = React4.useState(() => EMPTY_NUMBER_TO_VISIBLE_ENTRY_DETAIL_MAP);
  React4.useEffect(() => {
    const scrollElem = scrollRoot || document.documentElement;
    if (!scrollElem) {
      return;
    }
    let scrollDirectionDetector;
    if (!scrollThreshold) {
      scrollDirectionDetector = new ScrollDetector(scrollElem, setScrollDirection, setIsAtTop);
    } else {
      scrollDirectionDetector = new ScrollDetector(
        scrollElem,
        setScrollDirection,
        setIsAtTop,
        setScrollThresholdReachedInDirection,
        scrollThreshold
      );
    }
    scrollDirectionDetector.attachScrollListener();
    return () => {
      scrollDirectionDetector.detachScrollListener();
    };
  }, [scrollRoot, scrollThreshold]);
  const [observerIndex, setObserverIndex] = React4.useState(0);
  const resetScrollObservers = React4.useCallback(() => {
    setObserverIndex(observerIndex + 1);
  }, [observerIndex]);
  const [visibleOutlineTargets, setVisibleOutlineNodes] = React4.useState(() => {
    const map = /* @__PURE__ */ new Map();
    Object.freeze(map);
    return map;
  });
  const [visiblePageRatios, setVisiblePageRatios] = React4.useState(() => EMPTY_NUMBER_TO_VISIBLE_ENTRY_DETAIL_MAP);
  const isOutlineTargetVisible = React4.useCallback(
    (dest) => {
      return visibleOutlineTargets.has(dest);
    },
    [visibleOutlineTargets]
  );
  const scrollToOutlineTarget = React4.useCallback((dest) => {
    setIsOutlineClicked(true);
    document.querySelector(`[data-outline-target-dest="${dest}"]`)?.scrollIntoView({ behavior: "smooth" });
  }, []);
  const isPageVisible = React4.useCallback(
    ({ pageNumber, pageIndex }) => {
      if (typeof pageIndex === "number") {
        pageNumber = pageIndex + 1;
      }
      if (typeof pageNumber !== "number") {
        return false;
      }
      return visiblePageRatios.has(pageNumber);
    },
    [visiblePageRatios]
  );
  const scrollToPage = React4.useCallback(({ pageNumber, pageIndex }) => {
    if (typeof pageNumber === "number") {
      pageIndex = pageNumber - 1;
    }
    if (typeof pageIndex !== "number") {
      return;
    }
    document.getElementById(generatePageIdFromIndex(pageIndex))?.scrollIntoView({ behavior: "smooth" });
  }, []);
  React4.useEffect(() => {
    const root = scrollRoot || document.documentElement;
    const detector = new VisibleEntriesDetector({
      root,
      setVisibleEntries: setVisibleOutlineNodes,
      onVisibleEntriesChange: ({ visibleEntries, hiddenEntries, lastEntries }) => {
        hiddenEntries.map(
          (entry) => lastEntries.delete(entry.target.getAttribute(OUTLINE_ATTRIBUTE))
        );
        const newEntries = new Map(lastEntries);
        visibleEntries.map(
          (entry) => newEntries.set(entry.target.getAttribute(OUTLINE_ATTRIBUTE), {
            ratio: entry.intersectionRatio,
            timestamp: entry.time
          })
        );
        return newEntries;
      }
    });
    detector.observeNodes(OUTLINE_SELECTOR);
    return () => {
      detector.destroy();
    };
  }, [scrollRoot, observerIndex]);
  React4.useEffect(() => {
    const root = scrollRoot || document.documentElement;
    const detector = new VisibleEntriesDetector({
      root,
      setVisibleEntries: setVisiblePageRatios,
      onVisibleEntriesChange: ({ visibleEntries, hiddenEntries, lastEntries }) => {
        if (hiddenEntries.length) {
          const maxTime = Math.max(...hiddenEntries.map((e) => e.time));
          const hiddenPageNums = hiddenEntries.map(
            (e) => e.target?.getAttribute(PAGE_NUMBER_ATTRIBUTE) || ""
          );
          for (const [key, value] of lastEntries.entries()) {
            if (value.timestamp <= maxTime || hiddenPageNums.includes(String(key))) {
              lastEntries.delete(key);
            }
          }
        }
        const newEntries = new Map(lastEntries);
        visibleEntries.map((entry) => {
          newEntries.set(parseInt(entry.target?.getAttribute(PAGE_NUMBER_ATTRIBUTE) || "", 10), {
            ratio: entry.intersectionRatio,
            timestamp: entry.time
          });
        });
        return newEntries;
      }
    });
    detector.observeNodes(PAGE_NUMBER_SELECTOR);
    return () => {
      detector.destroy();
    };
  }, [scrollRoot, observerIndex]);
  React4.useEffect(() => {
    const root = scrollRoot || document.documentElement;
    const detector = new VisibleEntriesDetector({
      root,
      thresHold: pageScrolledIntoViewThreshold,
      setVisibleEntries: setPagesScrolledIntoView,
      onVisibleEntriesChange: ({ visibleEntries }) => {
        const newEntries = /* @__PURE__ */ new Map();
        visibleEntries.map((entry) => {
          newEntries.set(
            parseInt(entry.target?.getAttribute(PAGE_NUMBER_ATTRIBUTE) || "", 10),
            entry.intersectionRatio
          );
        });
        return newEntries;
      }
    });
    detector.observeNodes(PAGE_NUMBER_SELECTOR);
    return () => {
      detector.destroy();
    };
  }, [scrollRoot, observerIndex]);
  const updateScrollPosition = React4.useCallback(
    (zoomMultiplier) => {
      const root = scrollRoot || document.documentElement;
      if (!root) {
        return;
      }
      const newScrollTop = Math.floor(root.scrollTop * zoomMultiplier);
      setTimeout(() => {
        root.scrollTop = newScrollTop;
      }, 0);
    },
    [scrollRoot]
  );
  return {
    isOutlineTargetVisible,
    isPageVisible,
    scrollDirection,
    visibleOutlineTargets,
    visiblePageRatios,
    resetScrollObservers,
    scrollRoot,
    setScrollRoot,
    scrollToOutlineTarget,
    setScrollThreshold,
    scrollToPage,
    updateScrollPosition,
    setIsOutlineClicked,
    scrollThresholdReachedInDirection,
    isAtTop,
    isOutlineClicked,
    pagesScrolledIntoView,
    setPageScrolledIntoViewThreshold
  };
}

// src/context/UiContext.ts
import * as React5 from "react";
var UiContext = React5.createContext({
  errorMessage: null,
  isLoading: false,
  isShowingHighlightOverlay: false,
  isShowingOutline: false,
  isShowingTextHighlight: false,
  isShowingThumbnail: false,
  setErrorMessage: (errorMessage) => {
    logProviderWarning(`setErrorMessage(${errorMessage})`, "UiContext");
  },
  setIsShowingOutline: (isShowingOutline) => {
    logProviderWarning(`setIsShowingOutline(${isShowingOutline})`, "UiContext");
  },
  setIsLoading: (isLoading) => {
    logProviderWarning(`setIsLoading(${isLoading})`, "UiContext");
  },
  setIsShowingHighlightOverlay: (isShowingHighlightOverlay) => {
    logProviderWarning(`setIsShowingHighlightOverlay(${isShowingHighlightOverlay})`, "UiContext");
  },
  setIsShowingTextHighlight: (isShowingTextHighlight) => {
    logProviderWarning(`setIsShowingTextHighlight(${isShowingTextHighlight})`, "UiContext");
  },
  setIsShowingThumbnail: (isShowingThumbnail) => {
    logProviderWarning(`setIsShowingThumbnail(${isShowingThumbnail})`, "UiContext");
  }
});
function useUiContextProps() {
  const [errorMessage, setErrorMessage] = React5.useState(null);
  const [isLoading, setIsLoading] = React5.useState(true);
  const [isShowingHighlightOverlay, setIsShowingHighlightOverlay] = React5.useState(false);
  const [isShowingOutline, setIsShowingOutline] = React5.useState(false);
  const [isShowingTextHighlight, setIsShowingTextHighlight] = React5.useState(false);
  const [isShowingThumbnail, setIsShowingThumbnail] = React5.useState(false);
  return {
    errorMessage,
    isLoading,
    isShowingHighlightOverlay,
    isShowingOutline,
    isShowingTextHighlight,
    isShowingThumbnail,
    setErrorMessage,
    setIsLoading,
    setIsShowingHighlightOverlay,
    setIsShowingOutline,
    setIsShowingTextHighlight,
    setIsShowingThumbnail
  };
}

// src/utils/errorMessage.ts
function getErrorMessage(error) {
  if (!error) {
    return "Unknown error";
  }
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error.error === "string") {
    return error.error;
  }
  return error.toString();
}

// src/utils/pdfWorker.ts
import { pdfjs } from "react-pdf";

// src/utils/debug.ts
function debugLog(...args) {
  if (true) {
    console.debug(...args);
  }
}

// src/utils/pdfWorker.ts
function initPdfWorker() {
  debugLog(`Initializing PDF.js worker (PDF.js version: ${pdfjs.version})`);
  if (pdfjs.version === "2.16.105") {
    debugLog("Detected version 2.16.105, using local worker file");
    const currentUrl = typeof window !== "undefined" ? window.location.origin : "";
    pdfjs.GlobalWorkerOptions.workerSrc = `${currentUrl}/pdf.worker.min.js`;
    debugLog(`Worker URL set to: ${pdfjs.GlobalWorkerOptions.workerSrc}`);
    return;
  }
  const majorVersion = parseInt(pdfjs.version.split(".")[0], 10);
  const fileExtension = majorVersion >= 3 ? ".min.mjs" : ".min.js";
  debugLog(`Detected PDF.js major version ${majorVersion}, using ${fileExtension} extension`);
  try {
    const workerUrl = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker${fileExtension}`;
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    debugLog(`PDF.js worker initialized from unpkg: ${workerUrl}`);
  } catch (error) {
    console.warn("Error setting PDF.js worker to unpkg, trying cdnjs", error);
    try {
      const cdnjsUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/build/pdf.worker${fileExtension}`;
      pdfjs.GlobalWorkerOptions.workerSrc = cdnjsUrl;
      debugLog(`PDF.js worker initialized from cdnjs: ${cdnjsUrl}`);
    } catch (cdnjsError) {
      console.warn("Error setting PDF.js worker to cdn sources, using bundled version", cdnjsError);
    }
  }
}

// src/utils/reader-utils.ts
var RENDER_TYPE = {
  MULTI_CANVAS: "multi-canvas",
  SINGLE_CANVAS: "single-canvas"
};
function getRenderMode(renderType) {
  switch (renderType) {
    case RENDER_TYPE.SINGLE_CANVAS:
      return "none";
    default:
      return "canvas";
  }
}
function getClassNameSuffixFromRenderType(renderType) {
  switch (renderType) {
    case RENDER_TYPE.SINGLE_CANVAS:
      return "single-canvas";
    default:
      return "multi-canvas";
  }
}

// src/utils/scale.ts
var DEFAULT_DPI = 96;
function getDisplayDPI() {
  if (typeof window !== "undefined" && typeof window.devicePixelRatio === "number") {
    return DEFAULT_DPI * window.devicePixelRatio;
  }
  return DEFAULT_DPI;
}
var USER_UNIT_DENOMINATOR = 72;
function computePageDimensions(page) {
  const [leftPx, topPx, rightPx, bottomPx] = page.view;
  const dpi = getDisplayDPI();
  const PPI = page.userUnit / USER_UNIT_DENOMINATOR * dpi;
  return {
    height: (bottomPx - topPx) * PPI,
    width: (rightPx - leftPx) * PPI
  };
}

// src/components/DocumentWrapper.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
var { Document } = __require("react-pdf");
initPdfWorker();
var DocumentWrapper = ({
  children,
  className,
  file,
  inputRef,
  options,
  renderType = RENDER_TYPE.MULTI_CANVAS,
  error,
  loading,
  ...extraProps
}) => {
  const { pdfDocProxy, setNumPages, setPageDimensions, setPdfDocProxy, setNumPagesLoaded } = React6.useContext(DocumentContext);
  const { resetScrollObservers } = React6.useContext(ScrollContext);
  const { rotation } = React6.useContext(TransformContext);
  const { setErrorMessage, setIsLoading } = React6.useContext(UiContext);
  const hasMountedRef = React6.useRef(false);
  function getFirstPage(pdfDoc) {
    return pdfDoc.getPage(1);
  }
  React6.useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      resetScrollObservers();
    }
  }, [resetScrollObservers]);
  const onPdfLoadSuccess = React6.useCallback(
    (pdfDoc) => {
      setNumPages(pdfDoc.numPages);
      setNumPagesLoaded(0);
      getFirstPage(pdfDoc).then((page) => {
        setPageDimensions(computePageDimensions(page));
        setErrorMessage(null);
      }).catch((error2) => {
        setErrorMessage(getErrorMessage(error2));
      }).finally(() => {
        setIsLoading(false);
      });
      if (!pdfDocProxy) {
        setPdfDocProxy(pdfDoc);
      }
    },
    [pdfDocProxy, setErrorMessage, setIsLoading, setNumPages, setNumPagesLoaded, setPageDimensions, setPdfDocProxy]
  );
  const onPdfLoadError = React6.useCallback(
    (error2) => {
      setErrorMessage(getErrorMessage(error2));
      setIsLoading(false);
    },
    [setErrorMessage, setIsLoading]
  );
  const onItemClicked = React6.useCallback(
    (param) => {
      if (!pdfDocProxy) {
        return;
      }
      pdfDocProxy.getDestination(param.dest).then((destArray) => {
        if (!destArray) {
          return;
        }
        const ref = destArray[0];
        pdfDocProxy.getPageIndex(ref).then((pageIndex) => {
          scrollToPosition(pageIndex, 0, 0, rotation);
        });
      }).catch(() => {
      });
    },
    [pdfDocProxy, rotation]
  );
  const renderMode = getRenderMode(renderType);
  return /* @__PURE__ */ jsx2("div", { className, ref: inputRef, children: /* @__PURE__ */ jsx2(
    Document,
    {
      file,
      options,
      onLoadSuccess: onPdfLoadSuccess,
      onLoadError: onPdfLoadError,
      onItemClick: onItemClicked,
      renderMode,
      error,
      loading,
      ...extraProps,
      children
    }
  ) });
};

// src/components/DownloadButton.tsx
import * as React7 from "react";
import { jsx as jsx3 } from "react/jsx-runtime";
var DownloadButton = ({
  pdfUrl,
  children,
  className,
  ...extraProps
}) => {
  const [fetching, setFetching] = React7.useState(false);
  const download = () => {
    setFetching(true);
    fetch(pdfUrl).then((response) => response.blob()).then((blob) => {
      setFetching(false);
      const blobURL = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobURL;
      a.download = pdfUrl.split("/").pop() || pdfUrl;
      document.body.appendChild(a);
      a.click();
    });
  };
  return /* @__PURE__ */ jsx3(
    "button",
    {
      disabled: fetching,
      onClick: () => download(),
      "aria-label": "Download PDF",
      className: `pdf-reader__download-btn ${className}`,
      ...extraProps,
      children: children ? children : "Download"
    }
  );
};

// src/components/HighlightOverlay.tsx
import * as React8 from "react";
import { jsx as jsx4, jsxs as jsxs2 } from "react/jsx-runtime";
var HighlightOverlay = ({
  children,
  pageIndex,
  ...extraProps
}) => {
  const { pageDimensions } = React8.useContext(DocumentContext);
  const { rotation, scale } = React8.useContext(TransformContext);
  const maskId = `highlight-overlay-mask-${pageIndex}`;
  const getPageStyle = React8.useCallback(() => {
    return computePageStyle(pageDimensions, rotation, scale);
  }, [pageDimensions, rotation, scale]);
  const getUnmaskedArea = React8.useCallback(
    (boundingBoxes) => {
      const boxes = Array.isArray(boundingBoxes) ? boundingBoxes : [boundingBoxes];
      return boxes.map((box, i) => {
        const boxStyle = computeBoundingBoxStyle(box.props, pageDimensions, rotation, scale);
        return /* @__PURE__ */ jsx4("rect", { style: boxStyle, x: boxStyle.left, y: boxStyle.top, fill: "black" }, i);
      });
    },
    [pageDimensions, rotation, scale]
  );
  return /* @__PURE__ */ jsx4("div", { className: "pdf-reader__page-highlight-overlay", style: getPageStyle(), ...extraProps, children: /* @__PURE__ */ jsxs2("svg", { className: "page-mask", style: getPageStyle(), children: [
    /* @__PURE__ */ jsxs2("mask", { id: maskId, children: [
      /* @__PURE__ */ jsx4("rect", { style: getPageStyle(), fill: "white" }),
      children && getUnmaskedArea(children)
    ] }),
    /* @__PURE__ */ jsx4("rect", { style: getPageStyle(), fill: "white", opacity: "0.6", mask: `url(#${maskId})` })
  ] }) });
};

// src/components/marker/ArrowFlagBase.tsx
import classnames from "classnames";
import * as React9 from "react";
import { jsx as jsx5, jsxs as jsxs3 } from "react/jsx-runtime";
var POSITION = {
  LEFT: "LEFT",
  RIGHT: "RIGHT"
};
var DEFAULT_ORIGIN_TOP_PX = 0;
var DEFAULT_FLAG_WIDTH_PX = 62;
var DEFAULT_FLAG_HEIGHT_PX = 20;
var DEFAULT_TAIL_LENGTH_PX = 40;
var DEFAULT_TAIL_WIDTH_PX = 7;
var ArrowFlagBase = ({
  className,
  label,
  flagWidth,
  originTop,
  position = POSITION.LEFT,
  tailLength,
  tailWidgth,
  ...extraProps
}) => {
  const { pageDimensions } = React9.useContext(DocumentContext);
  const { rotation, scale } = React9.useContext(TransformContext);
  const computeSize = React9.useCallback(
    (box) => computeBoundingBoxStyle(box, pageDimensions, rotation, scale),
    [pageDimensions, rotation, scale, originTop]
  );
  const flagSize = {
    top: originTop || DEFAULT_ORIGIN_TOP_PX,
    left: 0,
    height: DEFAULT_FLAG_HEIGHT_PX,
    width: flagWidth || DEFAULT_FLAG_WIDTH_PX
  };
  const tailSize = {
    top: originTop || DEFAULT_ORIGIN_TOP_PX,
    left: 0,
    height: tailLength || DEFAULT_TAIL_LENGTH_PX,
    width: tailWidgth || DEFAULT_TAIL_WIDTH_PX
  };
  const computedFlagSize = computeSize(flagSize);
  const computedTailSize = computeSize(tailSize);
  const tailPosition = {
    top: computedTailSize.top,
    left: position === POSITION.LEFT ? -computedTailSize.width : pageDimensions.width * scale,
    height: computedTailSize.height,
    width: computedTailSize.width
  };
  const renderFlag = () => {
    const { top, width, height } = computedFlagSize;
    const flagPosition = {
      top,
      height,
      width,
      left: position === POSITION.LEFT ? -computedTailSize.width : tailPosition.left + tailPosition.width - width + 1
    };
    const labelPosition = position === POSITION.LEFT ? "47%" : "53%";
    return /* @__PURE__ */ jsx5("div", { className: "pdf-reader__arrow-flag-base__flag", style: flagPosition, children: /* @__PURE__ */ jsx5(IconFlag, { className: "pdf-reader__arrow-flag-base__flag-icon", headerPosition: position, children: /* @__PURE__ */ jsx5(
      "text",
      {
        x: labelPosition,
        y: "54%",
        dominantBaseline: "middle",
        textAnchor: "middle",
        className: "pdf-reader__arrow-flag-base__flag-label",
        children: label
      }
    ) }) });
  };
  return /* @__PURE__ */ jsxs3("div", { className: classnames("pdf-reader__arrow-flag-base", className), ...extraProps, children: [
    /* @__PURE__ */ jsx5("div", { className: "pdf-reader__arrow-flag-base__tail", style: tailPosition }),
    label && renderFlag()
  ] });
};

// src/components/icon/IconFlag.tsx
import { jsx as jsx6, jsxs as jsxs4 } from "react/jsx-runtime";
var IconFlag = ({
  children,
  className,
  headerPosition = POSITION.LEFT
}) => {
  if (headerPosition == POSITION.LEFT) {
    return /* @__PURE__ */ jsxs4("svg", { viewBox: "0 0 62 22", className, children: [
      /* @__PURE__ */ jsx6("path", { d: "M52.0108 20.8315L52.0105 20.8318C51.5525 21.2525 50.9527 21.491 50.3265 21.5H3.02828C2.35623 21.5 1.71264 21.2355 1.23885 20.7661C0.76522 20.2969 0.5 19.6615 0.5 19V3C0.5 2.33848 0.765221 1.70309 1.23885 1.23389C1.71264 0.764519 2.35623 0.5 3.02828 0.5H50.2457C50.8719 0.50902 51.4718 0.747466 51.9298 1.16821L51.93 1.16846L60.6515 9.16846L60.6514 9.16852L60.658 9.17439C60.9175 9.40408 61.126 9.68412 61.2707 9.99679C61.4154 10.3095 61.4933 10.6482 61.4996 10.9917C61.5059 11.3353 61.4405 11.6765 61.3074 11.9941C61.1749 12.3104 60.9779 12.5966 60.7286 12.8348L52.0108 20.8315Z" }),
      children
    ] });
  }
  return /* @__PURE__ */ jsxs4("svg", { viewBox: "0 0 62 22", className, children: [
    /* @__PURE__ */ jsx6("path", { d: "M9.98922 1.16846L9.9895 1.16821C10.4475 0.747472 11.0473 0.509029 11.6735 0.499999L58.9717 0.500004C59.6438 0.500004 60.2874 0.764522 60.7611 1.23389C61.2348 1.7031 61.5 2.33848 61.5 3L61.5 19C61.5 19.6615 61.2348 20.2969 60.7611 20.7661C60.2874 21.2355 59.6438 21.5 58.9717 21.5L11.7543 21.5C11.1281 21.491 10.5282 21.2525 10.0702 20.8318L10.07 20.8315L1.34854 12.8315L1.3486 12.8315L1.34196 12.8256C1.08248 12.5959 0.87399 12.3159 0.729283 12.0032C0.584584 11.6905 0.506719 11.3518 0.500417 11.0083C0.494111 10.6647 0.559495 10.3235 0.692605 10.0059C0.825143 9.68961 1.02206 9.40341 1.27136 9.16519L9.98922 1.16846Z" }),
    children
  ] });
};

// src/components/marker/ArrowFlag.tsx
import classnames2 from "classnames";
import * as React10 from "react";

// src/components/types/boundingBox.ts
function scaleRawBoundingBox(boundingBoxRaw, pageHeight, pageWidth) {
  const boxScaled = {
    page: boundingBoxRaw.page,
    top: boundingBoxRaw.top * pageHeight,
    left: boundingBoxRaw.left * pageWidth,
    height: boundingBoxRaw.height * pageHeight,
    width: boundingBoxRaw.width * pageWidth
  };
  return boxScaled;
}

// src/components/marker/ArrowFlag.tsx
import { jsx as jsx7, jsxs as jsxs5 } from "react/jsx-runtime";
var CENTER_LINE = 0.5;
var LINE_HEIGHT_MULTIPLIER = 1.5;
var ArrowFlag = ({
  boundingBoxes,
  className,
  label,
  ...extraProps
}) => {
  const { pageDimensions } = React10.useContext(DocumentContext);
  const convertRatioToPx = React10.useCallback(
    (rawBoundingBox) => scaleRawBoundingBox(rawBoundingBox, pageDimensions.height, pageDimensions.width),
    [pageDimensions]
  );
  if (boundingBoxes.length == 0) return null;
  const hasWideBox = boundingBoxes.some(
    ({ left, width }) => left < CENTER_LINE && left + width >= CENTER_LINE
  );
  let leftBoundingBoxes = boundingBoxes, rightBoundingBoxes = [];
  if (!hasWideBox) {
    leftBoundingBoxes = boundingBoxes.filter(({ left }) => left < CENTER_LINE);
    rightBoundingBoxes = boundingBoxes.filter(({ left }) => left >= CENTER_LINE);
  }
  if (leftBoundingBoxes.length === 1 && rightBoundingBoxes.length === 1) {
    if (Math.abs(rightBoundingBoxes[0].top - leftBoundingBoxes[0].top) < LINE_HEIGHT_MULTIPLIER * rightBoundingBoxes[0].height) {
      leftBoundingBoxes = boundingBoxes;
      rightBoundingBoxes = [];
    }
  }
  leftBoundingBoxes.sort((first, second) => first.top - second.top);
  rightBoundingBoxes.sort((first, second) => first.top - second.top);
  const renderArrowFlagBase = (boxes, position, showLabel) => {
    if (boxes.length == 0) return null;
    const firstBox = convertRatioToPx(boxes[0]), lastBox = convertRatioToPx(boxes[boxes.length - 1]);
    const props = {
      label: showLabel ? label : void 0,
      tailLength: lastBox.top + lastBox.height - firstBox.top,
      originTop: firstBox.top,
      position
    };
    return /* @__PURE__ */ jsx7(ArrowFlagBase, { ...props });
  };
  const hasLeftFlag = leftBoundingBoxes.length > 0;
  return /* @__PURE__ */ jsxs5("div", { className: classnames2("pdf-reader__arrow-flag", className), ...extraProps, children: [
    renderArrowFlagBase(leftBoundingBoxes, POSITION.LEFT, hasLeftFlag),
    renderArrowFlagBase(rightBoundingBoxes, POSITION.RIGHT, !hasLeftFlag)
  ] });
};

// src/components/outline/Outline.tsx
import * as React12 from "react";

// src/components/outline/OutlineItem.tsx
import classnames3 from "classnames";
import * as React11 from "react";
import { jsx as jsx8, jsxs as jsxs6 } from "react/jsx-runtime";
var OutlineItem = ({ items, onClick }) => {
  const { isOutlineTargetVisible } = React11.useContext(ScrollContext);
  if (!items || !items.length) {
    return null;
  }
  function renderItem(item) {
    const clickHandler = (event) => {
      event.preventDefault();
      if (onClick) {
        onClick(item.dest);
      }
    };
    return /* @__PURE__ */ jsxs6(
      "li",
      {
        className: classnames3("reader__outline-item", {
          "reader__outline-item--target-visible": isOutlineTargetVisible(item.dest)
        }),
        children: [
          /* @__PURE__ */ jsx8("a", { href: "#", onClick: clickHandler, "data-test-id": "reader-outline-item", children: item.title }),
          /* @__PURE__ */ jsx8(OutlineItem, { items: item.items, onClick })
        ]
      },
      item.dest?.toString() || item.title
    );
  }
  return /* @__PURE__ */ jsx8("ul", { className: "reader__outline-items", children: items.map((item) => renderItem(item)) });
};

// src/components/outline/Outline.tsx
import { jsx as jsx9 } from "react/jsx-runtime";
var Outline = ({ ...extraProps }) => {
  const { outline, pdfDocProxy, setOutline, setOutlinePositions } = React12.useContext(DocumentContext);
  const { scrollToOutlineTarget, resetScrollObservers } = React12.useContext(ScrollContext);
  React12.useEffect(() => {
    if (outline) {
      return;
    }
    if (!pdfDocProxy) {
      return;
    }
    pdfDocProxy.getOutline().then((outlineArray) => {
      setOutline(outlineArray);
      return buildOutlinePositions(pdfDocProxy, outlineArray);
    }).then((outlinePositions) => {
      setOutlinePositions(outlinePositions);
    }).then(() => {
      resetScrollObservers();
    });
  }, [outline]);
  const clickHandler = React12.useCallback((dest) => {
    if (!dest) {
      return;
    }
    scrollToOutlineTarget(dest);
    return;
  }, []);
  if (!pdfDocProxy) {
    return null;
  }
  return /* @__PURE__ */ jsx9("div", { className: "reader__outline", ...extraProps, children: !!outline && /* @__PURE__ */ jsx9(OutlineItem, { items: outline, onClick: clickHandler }) });
};

// src/components/Overlay.tsx
import * as React13 from "react";
import { jsx as jsx10 } from "react/jsx-runtime";
var Overlay = ({ children, ...extraProps }) => {
  const { pageDimensions } = React13.useContext(DocumentContext);
  const { rotation, scale } = React13.useContext(TransformContext);
  const getOverlayStyle = React13.useCallback(() => {
    return computePageStyle(pageDimensions, rotation, scale);
  }, [pageDimensions, rotation, scale]);
  return /* @__PURE__ */ jsx10("div", { className: "pdf-reader__overlay", style: getOverlayStyle(), ...extraProps, children });
};

// src/components/PageNumberControl.tsx
import classnames4 from "classnames";
import * as React14 from "react";

// src/utils/MaxVisibleElement.ts
function getMaxVisibleElement(visibleElements) {
  let maxVisibleKey = null;
  let maxRatio = 0;
  for (const [visibleKey, { ratio }] of visibleElements) {
    if (maxRatio < ratio) {
      maxVisibleKey = visibleKey;
      maxRatio = ratio;
    }
  }
  return maxVisibleKey;
}

// src/components/PageNumberControl.tsx
import { jsx as jsx11, jsxs as jsxs7 } from "react/jsx-runtime";
var DELAY_SCROLL_TIME_OUT_MS = 1e3;
var PageNumberControl = ({ className }) => {
  const delayTimerRef = React14.useRef(null);
  const { numPages } = React14.useContext(DocumentContext);
  const { scrollToPage, visiblePageRatios } = React14.useContext(ScrollContext);
  const [minPage, setMinPage] = React14.useState(0);
  const [userInput, setUserInput] = React14.useState("0");
  React14.useEffect(() => {
    if (numPages != 0) {
      setMinPage(1);
    }
  }, [numPages]);
  React14.useEffect(() => {
    if (visiblePageRatios.size !== 0) {
      const maxVisiblePageNumber = getMaxVisibleElement(visiblePageRatios);
      if (maxVisiblePageNumber) {
        setUserInput(maxVisiblePageNumber.toString());
      }
    }
  }, [visiblePageRatios]);
  const onPageNumberChange = React14.useCallback(
    (event) => {
      const { value } = event.currentTarget;
      const numericValue = Number(value);
      if (!Number.isNaN(numericValue) && !Number.isInteger(numericValue)) {
        setUserInput(Math.floor(numericValue).toString());
      } else {
        setUserInput(value);
      }
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
      }
      const newPageNumber = parseInt(value, 10);
      if (!Number.isNaN(newPageNumber) && newPageNumber >= minPage && newPageNumber <= numPages) {
        delayTimerRef.current = setTimeout(() => {
          scrollToPage({ pageNumber: newPageNumber });
        }, DELAY_SCROLL_TIME_OUT_MS);
      }
    },
    [minPage, numPages, scrollToPage]
  );
  const handleBlur = React14.useCallback(() => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
    }
    const pageNumber = parseInt(userInput, 10);
    if (Number.isNaN(pageNumber)) {
      return;
    }
    delayTimerRef.current = setTimeout(() => {
      scrollToPage({ pageNumber });
    }, DELAY_SCROLL_TIME_OUT_MS);
  }, [userInput, scrollToPage]);
  return /* @__PURE__ */ jsxs7("div", { className: classnames4("pdf-reader__page-number-control", className), children: [
    /* @__PURE__ */ jsx11(
      "input",
      {
        "aria-label": "Current Page",
        className: "pdf-reader__page-number-control__current-page",
        type: "number",
        name: "currentPage",
        value: userInput,
        onChange: onPageNumberChange,
        onBlur: handleBlur
      }
    ),
    /* @__PURE__ */ jsx11("span", { className: "pdf-reader__page-number-control__separator ", children: "/" }),
    /* @__PURE__ */ jsx11("span", { "aria-label": "Total Pages", className: "pdf-reader__page-number-control__total-pages", children: numPages })
  ] });
};

// src/components/PageWrapper.tsx
import classnames5 from "classnames";
import * as React16 from "react";

// src/context/PageRenderContext.ts
import * as React15 from "react";
var PageRenderContext = React15.createContext({
  pageRenderStates: /* @__PURE__ */ new Map(),
  getObjectURLForPage: (args) => {
    logProviderWarning(`getObjectURLForPage(${JSON.stringify(args)})`, "PageRenderContext");
    return null;
  },
  isBuildingObjectURLForPage: (args) => {
    logProviderWarning(`isBuildingObjectURLForPage(${JSON.stringify(args)})`, "PageRenderContext");
    return false;
  },
  isFinishedBuildingAllPagesObjectURLs: () => {
    logProviderWarning(`isFinishedBuildingAllPagesObjectURLs()`, "PageRenderContext");
    return false;
  },
  buildObjectURLForPage: (args) => {
    logProviderWarning(`buildObjectURLForPage(${JSON.stringify(args)})`, "PageRenderContext");
    return Promise.resolve("");
  }
});
function usePageRenderContextProps({
  pdfDocProxy,
  pixelRatio,
  scale,
  visiblePageRatios
}) {
  const [pageRenderStates, _setPageRenderStates] = React15.useState(
    () => {
      const map = /* @__PURE__ */ new Map();
      Object.freeze(map);
      return map;
    }
  );
  const pageRenderStatesRef = React15.useRef(pageRenderStates);
  const setPageRenderStates = React15.useCallback(
    (pageRenderStates2) => {
      pageRenderStatesRef.current = pageRenderStates2;
      _setPageRenderStates(pageRenderStates2);
    },
    [pageRenderStatesRef]
  );
  const isBuildingObjectURLForPage = React15.useCallback(
    ({ pageNumber, pageIndex }) => {
      if (typeof pageIndex === "number") {
        pageNumber = pageIndex + 1;
      }
      if (typeof pageNumber !== "number") {
        return false;
      }
      const state = pageRenderStates.get(pageNumber);
      if (!state) {
        return false;
      }
      return !state.objectURL;
    },
    [pageRenderStates]
  );
  const isFinishedBuildingAllPagesObjectURLs = React15.useCallback(() => {
    if (!pdfDocProxy) return false;
    for (let pageNumber = 1; pageNumber <= pdfDocProxy.numPages; pageNumber++) {
      if (!pageRenderStates.get(pageNumber)?.objectURL) {
        return false;
      }
    }
    return true;
  }, [pdfDocProxy, pageRenderStates]);
  const getObjectURLForPage = React15.useCallback(
    ({ pageNumber, pageIndex }) => {
      if (typeof pageIndex === "number") {
        pageNumber = pageIndex + 1;
      }
      if (typeof pageNumber !== "number") {
        return null;
      }
      return pageRenderStates.get(pageNumber)?.objectURL || null;
    },
    [pageRenderStates]
  );
  const buildObjectURLForPage = React15.useCallback(
    ({ pageNumber, pageIndex }) => {
      if (typeof pageIndex === "number") {
        pageNumber = pageIndex + 1;
      }
      if (typeof pageNumber !== "number") {
        throw new Error('prop "pageNumber" is not a number');
      }
      if (!pdfDocProxy) {
        throw new Error('cannot build a page until a "pdfDocProxy" is set on DocumentContext');
      }
      const existingPromise = pageRenderStates.get(pageNumber)?.promise;
      if (existingPromise) {
        return existingPromise;
      }
      const promise = buildPageObjectURL({
        pageNumber,
        pdfDocProxy,
        pixelRatio,
        scale,
        promiseTimestamp: flushTimestamp
      });
      const renderState = {
        promise,
        objectURL: null
      };
      promise.then((objectURL) => {
        if (!objectURL) return;
        renderState.objectURL = objectURL;
        const newPageRenderStates2 = new Map(pageRenderStatesRef.current);
        Object.freeze(newPageRenderStates2);
        setPageRenderStates(newPageRenderStates2);
      });
      const newPageRenderStates = new Map(pageRenderStatesRef.current);
      newPageRenderStates.set(pageNumber, renderState);
      Object.freeze(newPageRenderStates);
      setPageRenderStates(newPageRenderStates);
      return promise;
    },
    [pageRenderStates, pdfDocProxy, scale]
  );
  React15.useEffect(() => {
    const visiblePages = [...visiblePageRatios.keys()];
    if (!pdfDocProxy || [...pageRenderStates.keys()].length === pdfDocProxy.numPages) {
      return;
    }
    const priorityQueue = getPriorityQueue(visiblePages, pdfDocProxy.numPages);
    for (const pageNumber of priorityQueue) {
      buildObjectURLForPage({ pageNumber });
    }
  }, [pageRenderStates, pdfDocProxy, visiblePageRatios]);
  React15.useEffect(() => {
    for (const [, renderState] of pageRenderStatesRef.current) {
      if (renderState.objectURL) {
        URL.revokeObjectURL(renderState.objectURL);
      }
    }
    flushTimestamp = (/* @__PURE__ */ new Date()).getTime();
    const newPageRenderStates = /* @__PURE__ */ new Map();
    Object.freeze(newPageRenderStates);
    setPageRenderStates(newPageRenderStates);
  }, [scale, pixelRatio]);
  return {
    pageRenderStates,
    getObjectURLForPage,
    isBuildingObjectURLForPage,
    isFinishedBuildingAllPagesObjectURLs,
    buildObjectURLForPage
  };
}
function getNeighboringPages(pages, numTotalPages) {
  return pages.length === 0 ? [] : [Math.max(1, pages[0] - 1), Math.min(numTotalPages, pages[pages.length - 1] + 1)];
}
function getPriorityQueue(visiblePages, numPages) {
  const visiblePagesNeighbors = getNeighboringPages(visiblePages, numPages);
  const allPages = Array.from({ length: numPages }, (_, i) => i + 1);
  const priorityQueue = /* @__PURE__ */ new Set([...visiblePages, ...visiblePagesNeighbors, ...allPages]);
  return Array.from(priorityQueue);
}
var SCALE_BOOST = 2;
async function buildPageObjectURL({
  pageNumber,
  pdfDocProxy,
  pixelRatio = (typeof window !== "undefined" ? window.devicePixelRatio : null) || 0,
  scale = 1,
  imageType = "image/png",
  imageQuality = 1,
  promiseTimestamp
}) {
  const pageProxy = await pdfDocProxy.getPage(pageNumber);
  const blob = await useRenderCanvas(async (canvas) => {
    if (promiseTimestamp !== flushTimestamp) {
      return promiseTimestamp;
    }
    const viewport = pageProxy.getViewport({ scale: scale * pixelRatio * SCALE_BOOST });
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    const canvasContext = canvas.getContext("2d");
    if (!canvasContext) {
      throw new Error("canvas was unable to get a context");
    }
    const renderTask = pageProxy.render({
      canvasContext,
      viewport,
      intent: "print"
      // immediately render pages on inactive pages
    });
    await renderTask.promise;
    await new Promise((resolve) => setTimeout(resolve, 16));
    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob((blob2) => resolve(blob2), imageType, imageQuality);
      } catch (error) {
        reject(error);
      }
    });
  });
  if (typeof blob === "number") {
    return "";
  }
  if (!blob) {
    throw new Error("unable to create image from page");
  }
  return URL.createObjectURL(blob);
}
var renderCanvas = null;
function getRenderCanvas() {
  if (!renderCanvas) {
    renderCanvas = document.createElement("canvas");
  }
  return renderCanvas;
}
var flushTimestamp = (/* @__PURE__ */ new Date()).getTime();
var nextCanvasUse = Promise.resolve();
async function useRenderCanvas(callback) {
  let resolve = (_value) => {
  };
  let reject = (_reason) => {
  };
  const prom = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  nextCanvasUse = nextCanvasUse.then(() => callback(getRenderCanvas()).then(resolve, reject));
  const result = await prom;
  await new Promise((res) => setTimeout(res, 16));
  return result;
}

// src/components/PageWrapper.tsx
import { Fragment as Fragment2, jsx as jsx12, jsxs as jsxs8 } from "react/jsx-runtime";
var { Page } = __require("react-pdf");
var PageWrapper = ({
  children,
  error,
  loading,
  loadingContentForBuildingImage,
  noData,
  pageIndex,
  renderType,
  ...extraProps
}) => {
  const { rotation, scale } = React16.useContext(TransformContext);
  const { pageDimensions, getOutlineTargets, setNumPagesLoaded } = React16.useContext(DocumentContext);
  const { getObjectURLForPage, isBuildingObjectURLForPage } = React16.useContext(PageRenderContext);
  const { isLoading, errorMessage } = React16.useContext(UiContext);
  const objectURLForPage = getObjectURLForPage({ pageIndex });
  const isBuildingPageImage = isBuildingObjectURLForPage({ pageIndex });
  if (!pageDimensions?.height || !pageDimensions?.width) {
    if (isLoading && loading) {
      return /* @__PURE__ */ jsx12(Fragment2, { children: typeof loading === "function" ? loading() : loading });
    }
    if (!isLoading && errorMessage && error) {
      const err = new Error(errorMessage);
      return /* @__PURE__ */ jsx12(Fragment2, { children: typeof error === "function" ? error({ error: err }) : error });
    }
    if (!isLoading && !errorMessage && noData) {
      return /* @__PURE__ */ jsx12(Fragment2, { children: typeof noData === "function" ? noData() : noData });
    }
    return null;
  }
  const getPageStyle = React16.useCallback(() => {
    const styles = computePageStyle(pageDimensions, rotation, scale);
    if (objectURLForPage) {
      styles.backgroundImage = `url(${objectURLForPage})`;
    }
    return styles;
  }, [pageDimensions, rotation, scale, objectURLForPage]);
  const getWidth = React16.useCallback(() => {
    return getPageWidth(pageDimensions, rotation);
  }, [pageDimensions, rotation]);
  const outlineTargets = getOutlineTargets({
    pageIndex,
    scale,
    rotation,
    pageDimensions
  });
  const markPageAsLoaded = React16.useCallback(({ items, styles }) => {
    setNumPagesLoaded((prevNumPagesLoaded) => prevNumPagesLoaded + 1);
  }, []);
  return /* @__PURE__ */ jsxs8(
    "div",
    {
      id: generatePageIdFromIndex(pageIndex),
      className: classnames5(
        "pdf-reader__page",
        { "pdf-reader__page--has-page-image": objectURLForPage },
        { "pdf-reader__page--no-page-image": !objectURLForPage },
        `pdf-reader__page--render-type-${getClassNameSuffixFromRenderType(renderType)}`,
        { "pdf-reader__is-building-page-image": isBuildingPageImage }
      ),
      "data-page-number": pageIndex + 1,
      style: getPageStyle(),
      ...extraProps,
      children: [
        children,
        isBuildingPageImage && !isLoading && /* @__PURE__ */ jsx12(
          "div",
          {
            className: classnames5("pdf-reader__page", {
              "pdf-reader__page--is-loading-image": isBuildingPageImage
            }),
            children: loadingContentForBuildingImage
          }
        ),
        /* @__PURE__ */ jsx12(
          Page,
          {
            width: getWidth(),
            error,
            loading,
            noData,
            pageIndex,
            scale,
            rotate: rotation,
            renderAnnotationLayer: true,
            onGetTextSuccess: markPageAsLoaded
          }
        ),
        /* @__PURE__ */ jsx12("div", { className: "pdf-reader__page__outline-targets", children: outlineTargets.map(({ dest, leftPx, topPx }) => /* @__PURE__ */ jsx12(
          "span",
          {
            className: "pdf-reader__page__outline-target",
            "data-outline-target-dest": dest,
            "data-test-id": "pdf-reader__page__outline-target",
            style: { left: leftPx + "px", top: topPx + "px" }
          },
          dest
        )) })
      ]
    }
  );
};

// src/components/PrintButton.tsx
import { jsx as jsx13 } from "react/jsx-runtime";
var PrintButton = ({
  children,
  className,
  ...extraProps
}) => {
  return /* @__PURE__ */ jsx13(
    "button",
    {
      onClick: () => onClickPrint(),
      "aria-label": "Print PDF",
      className: `pdf-reader__print-btn ${className}`,
      ...extraProps,
      children: children ? children : "Print"
    }
  );
};
function onClickPrint() {
  window.print();
}

// src/components/SidePanel.tsx
import classnames6 from "classnames";
import * as React17 from "react";

// src/utils/util.ts
var bandPassFilter = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

// src/components/SidePanel.tsx
import { jsx as jsx14, jsxs as jsxs9 } from "react/jsx-runtime";
var DEFAULT_MIN_WIDTH_PX = 300;
var DEFAULT_MAX_WIDTH_PX = 700;
var SidePanel = ({
  minWidthPx = DEFAULT_MIN_WIDTH_PX,
  maxWidthPx = DEFAULT_MAX_WIDTH_PX,
  className,
  children,
  header,
  content,
  footer,
  dragHandlePosition,
  closeButton,
  isVisible = true,
  onClose,
  ...extraProps
}) => {
  const [isOverlayVisible, setIsOverlayVisible] = React17.useState(false);
  const [panelWidth, setPanelWidth] = React17.useState(minWidthPx);
  const sidePanelRef = React17.useRef(null);
  const dragHandleRef = React17.useRef(null);
  const renderCloseButton = () => {
    if (typeof closeButton === "boolean") {
      return /* @__PURE__ */ jsx14("button", { className: "pdf-reader__side-panel-close-button", onClick: onClose, children: "x" });
    }
    return closeButton;
  };
  const renderDragHandle = () => {
    const isDragHandleOnLeft = dragHandlePosition === "left";
    const isDragHandleOnRight = dragHandlePosition === "right";
    if (!isDragHandleOnLeft && !isDragHandleOnRight) {
      return null;
    }
    const onMouseMove = (mouseMoveEvent) => {
      if (!sidePanelRef || !sidePanelRef.current) {
        return;
      }
      const newWidth = dragHandlePosition === "left" ? sidePanelRef.current.getBoundingClientRect().right - mouseMoveEvent.pageX : mouseMoveEvent.pageX - sidePanelRef.current.getBoundingClientRect().left;
      setPanelWidth(bandPassFilter(newWidth, minWidthPx, maxWidthPx));
    };
    const onMouseUp = () => {
      if (dragHandleRef && dragHandleRef.current) {
        dragHandleRef.current.removeAttribute("style");
      }
      setIsOverlayVisible(false);
      document.body.removeEventListener("mousemove", onMouseMove);
    };
    const onDraggingHandle = () => {
      if (dragHandleRef && dragHandleRef.current) {
        dragHandleRef.current.style.opacity = "1";
      }
      setIsOverlayVisible(true);
      document.body.addEventListener("mousemove", onMouseMove);
      document.body.addEventListener("mouseup", onMouseUp, { once: true });
    };
    const onChangePanelWidth = (event) => {
      const newWidth = parseInt(event.currentTarget.value);
      setPanelWidth(bandPassFilter(newWidth, minWidthPx, maxWidthPx));
    };
    return /* @__PURE__ */ jsxs9(
      "div",
      {
        className: classnames6("pdf-reader__resize-zone", {
          "pdf-reader__resize-zone--left": isDragHandleOnLeft,
          "pdf-reader__resize-zone--right": isDragHandleOnRight
        }),
        children: [
          /* @__PURE__ */ jsx14(
            "input",
            {
              className: "pdf-reader__drag-handle__assistive-input",
              type: "range",
              min: minWidthPx,
              max: maxWidthPx,
              step: "5",
              value: panelWidth,
              onChange: onChangePanelWidth
            }
          ),
          /* @__PURE__ */ jsx14(
            "div",
            {
              ref: dragHandleRef,
              role: "slider",
              "aria-valuenow": panelWidth,
              tabIndex: -1,
              onMouseDown: onDraggingHandle,
              className: "pdf-reader__drag-handle",
              children: /* @__PURE__ */ jsx14("div", { className: "pdf-reader__drag-handle__inner" })
            }
          )
        ]
      }
    );
  };
  return /* @__PURE__ */ jsxs9(
    "div",
    {
      ref: sidePanelRef,
      style: { width: panelWidth },
      className: classnames6(
        "pdf-reader__side-panel",
        { "pdf-reader__side-panel--hidden": !isVisible },
        className
      ),
      ...extraProps,
      children: [
        renderDragHandle(),
        closeButton && renderCloseButton(),
        header && /* @__PURE__ */ jsx14("h2", { className: "pdf-reader__side-panel-title", children: header }),
        content && /* @__PURE__ */ jsx14("div", { className: "pdf-reader__side-panel-content", children: content }),
        footer && /* @__PURE__ */ jsx14("div", { className: "pdf-reader__side-panel-footer", children: footer }),
        children,
        isOverlayVisible && /* @__PURE__ */ jsx14("div", { className: "pdf-reader__side-panel-overlay" })
      ]
    }
  );
};

// src/components/thumbnails/Thumbnail.tsx
import classnames7 from "classnames";
import * as React18 from "react";
import { jsx as jsx15 } from "react/jsx-runtime";
var Thumbnail = ({ pageNumber }) => {
  const { getObjectURLForPage } = React18.useContext(PageRenderContext);
  const { isPageVisible, scrollToPage, visiblePageRatios } = React18.useContext(ScrollContext);
  const [maxVisiblePageNumber, setMaxVisiblePageNumber] = React18.useState(null);
  const objectURL = getObjectURLForPage({ pageNumber });
  React18.useEffect(() => {
    if (visiblePageRatios.size !== 0) {
      const max = getMaxVisibleElement(visiblePageRatios);
      if (max) {
        setMaxVisiblePageNumber(max.toString());
      }
    }
  }, [visiblePageRatios]);
  const isThumbnailVisible = maxVisiblePageNumber && parseInt(maxVisiblePageNumber) === pageNumber && isPageVisible({ pageNumber });
  const onClick = React18.useCallback(
    (event) => {
      event.preventDefault();
      scrollToPage({ pageNumber });
    },
    [pageNumber, scrollToPage]
  );
  return /* @__PURE__ */ jsx15(
    "a",
    {
      "aria-label": `scroll to page ${pageNumber}`,
      href: `#${pageNumber}`,
      onClick,
      className: classnames7(
        "pdf-reader__thumbnail",
        { "pdf-reader__thumbnail--no-image": !objectURL },
        { "pdf-reader__thumbnail--is-visible": isThumbnailVisible }
      ),
      "data-page-number": pageNumber,
      "data-test-id": "thumbnail-link",
      children: !!objectURL && /* @__PURE__ */ jsx15("img", { className: "pdf-reader__thumbnail-image", src: objectURL })
    }
  );
};

// src/components/thumbnails/ThumbnailList.tsx
import * as React19 from "react";
import { jsx as jsx16 } from "react/jsx-runtime";
var ThumbnailList = () => {
  const { numPages } = React19.useContext(DocumentContext);
  return /* @__PURE__ */ jsx16("div", { className: "pdf-reader__thumbnail-list-wrapper", children: /* @__PURE__ */ jsx16("ul", { className: "pdf-reader__thumbnail-list", children: Array.from({ length: numPages }).map((_, pageIndex) => /* @__PURE__ */ jsx16("li", { className: "pdf-reader__thumbnail-list__item", children: /* @__PURE__ */ jsx16(Thumbnail, { pageNumber: pageIndex + 1 }) }, pageIndex + 1)) }) });
};

// src/components/ZoomInButton.tsx
import * as React20 from "react";

// src/utils/format.ts
var PercentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumSignificantDigits: 3
});

// src/components/ZoomInButton.tsx
import { jsx as jsx17 } from "react/jsx-runtime";
var MAX_ZOOM_IN_SCALE = 500;
var ZoomInButton = ({
  className,
  children,
  onZoom,
  ...extraProps
}) => {
  const { scale, setScale, zoomIncrementValue } = React20.useContext(TransformContext);
  const handleZoomIn = React20.useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      const newScaleValue = scale + zoomIncrementValue;
      const zoomScale = Number(PercentFormatter.format(newScaleValue).replace("%", ""));
      if (zoomScale <= MAX_ZOOM_IN_SCALE) {
        if (onZoom) {
          onZoom(newScaleValue);
        }
        setScale(newScaleValue);
      }
    },
    [scale]
  );
  return /* @__PURE__ */ jsx17(
    "button",
    {
      className: `reader__zoom-btn zoom-in ${className}`,
      onClick: handleZoomIn,
      ...extraProps,
      children: children ? children : "+"
    }
  );
};

// src/components/ZoomOutButton.tsx
import * as React21 from "react";
import { jsx as jsx18 } from "react/jsx-runtime";
var MIN_ZOOM_OUT_SCALE = 20;
var ZoomOutButton = ({
  className,
  children,
  onZoom,
  ...extraProps
}) => {
  const { scale, setScale, zoomIncrementValue } = React21.useContext(TransformContext);
  const handleZoomOut = React21.useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      const newScaleValue = scale - zoomIncrementValue;
      const zoomScale = Number(PercentFormatter.format(newScaleValue).replace("%", ""));
      if (zoomScale >= MIN_ZOOM_OUT_SCALE) {
        if (onZoom) {
          onZoom(newScaleValue);
        }
        setScale(newScaleValue);
      }
    },
    [scale]
  );
  return /* @__PURE__ */ jsx18(
    "button",
    {
      className: `reader__zoom-btn zoom-out ${className}`,
      onClick: handleZoomOut,
      ...extraProps,
      children: children ? children : "-"
    }
  );
};

// src/context/ContextProvider.tsx
import { jsx as jsx19 } from "react/jsx-runtime";
var ContextProvider = ({ children }) => {
  const documentProps = useDocumentContextProps();
  const transformProps = useTransformContextProps();
  const uiProps = useUiContextProps();
  const scrollProps = useScrollContextProps();
  const pageRenderProps = usePageRenderContextProps({
    pdfDocProxy: documentProps.pdfDocProxy,
    pixelRatio: transformProps.pixelRatio,
    scale: transformProps.scale,
    visiblePageRatios: scrollProps.visiblePageRatios
  });
  return /* @__PURE__ */ jsx19(DocumentContext.Provider, { value: documentProps, children: /* @__PURE__ */ jsx19(TransformContext.Provider, { value: transformProps, children: /* @__PURE__ */ jsx19(UiContext.Provider, { value: uiProps, children: /* @__PURE__ */ jsx19(ScrollContext.Provider, { value: scrollProps, children: /* @__PURE__ */ jsx19(PageRenderContext.Provider, { value: pageRenderProps, children }) }) }) }) });
};

// index.ts
var VERSION = "0.0.1";
var CONSTANTS = {
  DEFAULT_ZOOM_SCALE,
  RENDER_TYPE,
  POSITION
};
var index_default = {
  ArrowFlag,
  ArrowFlagBase,
  BoundingBox,
  computeBoundingBoxStyle,
  computePageStyle,
  ContextProvider,
  DEFAULT_ZOOM_SCALE,
  DocumentContext,
  DocumentWrapper,
  DownloadButton,
  generatePageIdFromIndex,
  getPageHeight,
  getPageWidth,
  HighlightOverlay,
  IconFlag,
  initPdfWorker,
  isSideways,
  Outline,
  OutlineItem,
  Overlay,
  PageNumberControl,
  PageRenderContext,
  PageRotation,
  PageWrapper,
  PercentFormatter,
  POSITION,
  PrintButton,
  RENDER_TYPE,
  rotateClockwise,
  rotateCounterClockwise,
  scaleRawBoundingBox,
  ScrollContext,
  scrollToId,
  scrollToPdfPageIndex,
  SidePanel,
  Thumbnail,
  ThumbnailList,
  TransformContext,
  UiContext,
  ZoomInButton,
  ZoomOutButton
};
export {
  ArrowFlag,
  ArrowFlagBase,
  BoundingBox,
  CONSTANTS,
  ContextProvider,
  DEFAULT_ZOOM_SCALE,
  DocumentContext,
  DocumentWrapper,
  DownloadButton,
  HighlightOverlay,
  IconFlag,
  Outline,
  OutlineItem,
  Overlay,
  POSITION,
  PageNumberControl,
  PageRenderContext,
  PageWrapper,
  PercentFormatter,
  PrintButton,
  RENDER_TYPE,
  ScrollContext,
  SidePanel,
  Thumbnail,
  ThumbnailList,
  TransformContext,
  UiContext,
  VERSION,
  ZoomInButton,
  ZoomOutButton,
  computeBoundingBoxStyle,
  computePageStyle,
  index_default as default,
  generatePageIdFromIndex,
  getPageHeight,
  getPageWidth,
  initPdfWorker,
  isSideways,
  rotateClockwise,
  rotateCounterClockwise,
  scaleRawBoundingBox,
  scrollToId,
  scrollToPdfPageIndex
};
