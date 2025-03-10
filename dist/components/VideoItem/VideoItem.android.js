/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import React, { useCallback, useState, useRef, useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Video } from "expo-av";
import { ImageLoading } from "../ImageItem/ImageLoading";
import useVideoDimensions from "../../hooks/useVideoDimensions";

const SCREEN = Dimensions.get("window");
const SCREEN_WIDTH = SCREEN.width;
const SCREEN_HEIGHT = SCREEN.height;

const VideoItem = ({ videoSrc, onRequestClose, isActive }) => {
  const [loaded, setLoaded] = useState(false);
  const videoDimensions = useVideoDimensions(videoSrc);
  const videoRef = useRef(null);

  const onLoadEnd = useCallback(() => {
    setLoaded(true);
  }, []);

  // Effect to pause video when component becomes inactive (swiped away)
  useEffect(() => {
    if (videoRef.current) {
      if (!isActive) {
        videoRef.current.pauseAsync();
      }
    }
  }, [isActive]);

  return (
    <View style={styles.container}>
      {!loaded && <ImageLoading />}
      <Video
        ref={videoRef}
        source={videoSrc}
        style={[styles.video, { width: videoDimensions.width, height: videoDimensions.height }]}
        resizeMode="contain"
        useNativeControls
        shouldPlay={false}
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