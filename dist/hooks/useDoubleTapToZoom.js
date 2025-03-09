/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useRef, useCallback } from "react";
import { Animated } from "react-native";
const DOUBLE_TAP_DELAY = 300;
const useDoubleTapToZoom = (targetRef, contentDimensions, scalable) => {
    const lastTapTS = useRef(null);
    const doubleTapScale = useRef(new Animated.Value(1)).current;
    const isZoomed = useRef(false);
    const handleDoubleTap = useCallback((event) => {
        const nowTS = new Date().getTime();
        const scrollResponderRef = targetRef.current;
        if (lastTapTS.current && nowTS - lastTapTS.current < DOUBLE_TAP_DELAY) {
            const { locationX, locationY } = event.nativeEvent;
            if (scrollResponderRef && contentDimensions.current && scalable) {
                if (isZoomed.current) {
                    scrollResponderRef.scrollTo({
                        x: 0,
                        y: 0,
                        animated: true,
                    });
                }
                else {
                    const { width, height } = contentDimensions.current;
                    const newWidth = width * 3;
                    const newHeight = height * 3;
                    const offsetX = (locationX - width / 2) * 3;
                    const offsetY = (locationY - height / 2) * 3;
                    scrollResponderRef.scrollToWithZoom({
                        x: offsetX,
                        y: offsetY,
                        width: newWidth,
                        height: newHeight,
                        animated: true,
                    });
                }
                isZoomed.current = !isZoomed.current;
            }
            lastTapTS.current = 0;
        }
        else {
            lastTapTS.current = nowTS;
        }
    }, [targetRef, contentDimensions, scalable]);
    return {
        doubleTapScale,
        handleDoubleTap,
    };
};
export default useDoubleTapToZoom;
