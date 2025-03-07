/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo, useEffect, useRef } from "react";
import { Animated, Dimensions } from "react-native";

import {
  createPanResponder,
  getDistanceBetweenTouches,
  getImageTranslate,
  getImageDimensionsByTranslate,
} from "../utils";

const SCREEN = Dimensions.get("window");
const SCREEN_WIDTH = SCREEN.width;
const SCREEN_HEIGHT = SCREEN.height;
const MIN_DIMENSION = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT);

const SCALE_MAX = 2;
const DOUBLE_TAP_DELAY = 300;
const OUT_BOUND_MULTIPLIER = 0.75;

const usePanResponder = ({
  initialScale,
  initialTranslate,
  onZoom,
  doubleTapToZoomEnabled,
  onLongPress,
  delayLongPress,
}) => {
  let numberInitialTouches = 1;
  let initialTouches = [];
  let currentScale = initialScale;
  let currentTranslate = initialTranslate;
  let tmpScale = 0;
  let tmpTranslate = null;
  let isDoubleTapPerformed = false;
  let lastTapTS = null;
  let longPressHandlerRef = null;

  const meaningfulShift = MIN_DIMENSION * 0.01;
  const scaleValue = new Animated.Value(initialScale);
  const translateValue = new Animated.ValueXY(initialTranslate);

  const imageDimensions = getImageDimensionsByTranslate(
    initialTranslate,
    SCREEN
  );

  const getBounds = (scale) => {
    const scaledImageDimensions = {
      width: imageDimensions.width * scale,
      height: imageDimensions.height * scale,
    };
    const translateDelta = getImageTranslate(scaledImageDimensions, SCREEN);

    const left = initialTranslate.x - translateDelta.x;
    const right = left - (scaledImageDimensions.width - SCREEN.width);
    const top = initialTranslate.y - translateDelta.y;
    const bottom = top - (scaledImageDimensions.height - SCREEN.height);

    return [top, left, bottom, right];
  };

  const getTranslateInBounds = (translate, scale) => {
    const inBoundTranslate = { x: translate.x, y: translate.y };
    const [topBound, leftBound, bottomBound, rightBound] = getBounds(scale);

    if (translate.x > leftBound) {
      inBoundTranslate.x = leftBound;
    } else if (translate.x < rightBound) {
      inBoundTranslate.x = rightBound;
    }

    if (translate.y > topBound) {
      inBoundTranslate.y = topBound;
    } else if (translate.y < bottomBound) {
      inBoundTranslate.y = bottomBound;
    }

    return inBoundTranslate;
  };

  const fitsScreenByWidth = () =>
    imageDimensions.width * currentScale < SCREEN_WIDTH;
  const fitsScreenByHeight = () =>
    imageDimensions.height * currentScale < SCREEN_HEIGHT;

  useEffect(() => {
    scaleValue.addListener(({ value }) => {
      if (typeof onZoom === "function") {
        onZoom(value !== initialScale);
      }
    });

    return () => scaleValue.removeAllListeners();
  });

  const cancelLongPressHandle = () => {
    longPressHandlerRef && clearTimeout(longPressHandlerRef);
  };

  const handlers = {
    onGrant: (_, gestureState) => {
      numberInitialTouches = gestureState.numberActiveTouches;

      if (gestureState.numberActiveTouches > 1) return;

      longPressHandlerRef = setTimeout(onLongPress, delayLongPress);
    },
    onStart: (event, gestureState) => {
      initialTouches = event.nativeEvent.touches;
      numberInitialTouches = gestureState.numberActiveTouches;

      if (gestureState.numberActiveTouches > 1) return;

      const tapTS = Date.now();
      isDoubleTapPerformed = Boolean(
        lastTapTS && tapTS - lastTapTS < DOUBLE_TAP_DELAY
      );

      if (doubleTapToZoomEnabled && isDoubleTapPerformed) {
        const isScaled = currentTranslate.x !== initialTranslate.x;
        const { pageX: touchX, pageY: touchY } = event.nativeEvent.touches[0];
        const targetScale = SCALE_MAX;
        const nextScale = isScaled ? initialScale : targetScale;
        const nextTranslate = isScaled
          ? initialTranslate
          : getTranslateInBounds(
              {
                x:
                  initialTranslate.x +
                  (SCREEN_WIDTH / 2 - touchX) * (targetScale / currentScale),
                y:
                  initialTranslate.y +
                  (SCREEN_HEIGHT / 2 - touchY) * (targetScale / currentScale),
              },
              targetScale
            );

        onZoom(!isScaled);

        Animated.parallel(
          [
            Animated.timing(translateValue.x, {
              toValue: nextTranslate.x,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(translateValue.y, {
              toValue: nextTranslate.y,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
              toValue: nextScale,
              duration: 300,
              useNativeDriver: true,
            }),
          ],
          { stopTogether: false }
        ).start(() => {
          currentScale = nextScale;
          currentTranslate = nextTranslate;
        });

        lastTapTS = null;
      } else {
        lastTapTS = Date.now();
      }
    },
    onMove: (event, gestureState) => {
      const { dx, dy } = gestureState;

      if (Math.abs(dx) >= meaningfulShift || Math.abs(dy) >= meaningfulShift) {
        cancelLongPressHandle();
      }

      if (doubleTapToZoomEnabled && isDoubleTapPerformed) {
        cancelLongPressHandle();
        return;
      }

      if (
        numberInitialTouches === 1 &&
        gestureState.numberActiveTouches === 2
      ) {
        numberInitialTouches = 2;
        initialTouches = event.nativeEvent.touches;
      }

      const isTapGesture =
        numberInitialTouches == 1 && gestureState.numberActiveTouches === 1;
      const isPinchGesture =
        numberInitialTouches === 2 && gestureState.numberActiveTouches === 2;

      if (isPinchGesture) {
        cancelLongPressHandle();

        const initialDistance = getDistanceBetweenTouches(initialTouches);
        const currentDistance = getDistanceBetweenTouches(
          event.nativeEvent.touches
        );

        let nextScale = (currentDistance / initialDistance) * currentScale;

        if (nextScale < initialScale) {
          nextScale =
            nextScale + (initialScale - nextScale) * OUT_BOUND_MULTIPLIER;
        }

        nextScale = Math.max(Math.min(nextScale, SCALE_MAX), initialScale * 0.5);

        scaleValue.setValue(nextScale);
        tmpScale = nextScale;

        const nextTranslate = getTranslateInBounds(currentTranslate, nextScale);
        translateValue.x.setValue(nextTranslate.x);
        translateValue.y.setValue(nextTranslate.y);
        tmpTranslate = nextTranslate;
      }

      if (isTapGesture) {
        const { x, y } = currentTranslate;
        const { dx, dy } = gestureState;
        const nextTranslate = { x: x + dx, y: y + dy };

        const isVerticalSwipe = Math.abs(dy) > Math.abs(dx);

        if (currentScale === initialScale) {
          if (!isVerticalSwipe && fitsScreenByWidth()) {
            translateValue.x.setValue(initialTranslate.x);
            return;
          }

          if (isVerticalSwipe && fitsScreenByHeight()) {
            translateValue.y.setValue(initialTranslate.y);
            return;
          }
        }

        translateValue.x.setValue(nextTranslate.x);
        translateValue.y.setValue(nextTranslate.y);
        tmpTranslate = nextTranslate;
      }
    },
    onRelease: () => {
      cancelLongPressHandle();

      if (tmpScale) {
        currentScale = tmpScale;
        tmpScale = 0;
      }

      if (tmpTranslate) {
        currentTranslate = tmpTranslate;
        tmpTranslate = null;
      }

      const [topBound, leftBound, bottomBound, rightBound] = getBounds(
        currentScale
      );

      if (currentTranslate.x > leftBound) {
        Animated.timing(translateValue.x, {
          toValue: leftBound,
          duration: 100,
          useNativeDriver: true,
        }).start();

        currentTranslate.x = leftBound;
      } else if (currentTranslate.x < rightBound) {
        Animated.timing(translateValue.x, {
          toValue: rightBound,
          duration: 100,
          useNativeDriver: true,
        }).start();

        currentTranslate.x = rightBound;
      }

      if (currentTranslate.y > topBound) {
        Animated.timing(translateValue.y, {
          toValue: topBound,
          duration: 100,
          useNativeDriver: true,
        }).start();

        currentTranslate.y = topBound;
      } else if (currentTranslate.y < bottomBound) {
        Animated.timing(translateValue.y, {
          toValue: bottomBound,
          duration: 100,
          useNativeDriver: true,
        }).start();

        currentTranslate.y = bottomBound;
      }
    },
  };

  const panResponder = useMemo(() => createPanResponder(handlers), []);

  return [panResponder.panHandlers, scaleValue, translateValue];
};

export default usePanResponder; 