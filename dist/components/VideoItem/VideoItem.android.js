/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import React, { useCallback, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Video } from "expo-av";
import { ImageLoading } from "../ImageItem/ImageLoading";
import useVideoDimensions from "../../hooks/useVideoDimensions";

const SCREEN = Dimensions.get("window");
const SCREEN_WIDTH = SCREEN.width;
const SCREEN_HEIGHT = SCREEN.height;

const VideoItem = ({ videoSrc, onRequestClose }) => {
  const [loaded, setLoaded] = useState(false);
  const videoDimensions = useVideoDimensions(videoSrc);

  const onLoadEnd = useCallback(() => {
    setLoaded(true);
  }, []);

  return (
    <View style={styles.container}>
      {!loaded && <ImageLoading />}
      <Video
        source={videoSrc}
        style={[styles.video, { width: videoDimensions.width, height: videoDimensions.height }]}
        resizeMode="contain"
        shouldPlay
        useNativeControls
        onReadyForDisplay={onLoadEnd}
        onError={(error) => {
          console.error("Error loading video:", error);
          setLoaded(true); // Set loaded to true even on error to hide loading indicator
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});

export default React.memo(VideoItem); 