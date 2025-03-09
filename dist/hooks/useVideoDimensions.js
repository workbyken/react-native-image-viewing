/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useState, useEffect } from "react";
import { Dimensions } from "react-native";

const SCREEN = Dimensions.get("screen");
const DEFAULT_DIMENSIONS = { width: SCREEN.width, height: SCREEN.height };

/**
 * For videos, we'll use the screen dimensions as default
 * since we can't easily determine video dimensions before loading
 */
const useVideoDimensions = (videoSource) => {
  const [dimensions, setDimensions] = useState(DEFAULT_DIMENSIONS);

  useEffect(() => {
    // For videos, we'll use the screen dimensions
    // This ensures videos display properly in fullscreen
    setDimensions(DEFAULT_DIMENSIONS);
  }, [videoSource]);

  return dimensions;
};

export default useVideoDimensions; 