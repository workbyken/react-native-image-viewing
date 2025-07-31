/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import React, { useCallback, useState, useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { ImageLoading } from "../ImageItem/ImageLoading";

const SCREEN = Dimensions.get("screen");
const SCREEN_WIDTH = SCREEN.width;
const SCREEN_HEIGHT = SCREEN.height;

const VideoItem = ({ videoSrc, onRequestClose, isActive }) => {
  const [loaded, setLoaded] = useState(false);
  
  console.log('VideoItem rendered with videoSrc:', videoSrc);
  
  // Extract URI from video source object - expo-video supports both string and object with uri
  const videoSource = typeof videoSrc === 'string' ? videoSrc : videoSrc.uri;
  console.log('Using video source:', videoSource);
  
  // Create video player using the new expo-video API following docs pattern
  const player = useVideoPlayer(videoSource, (player) => {
    console.log('Video player created and configured');
    player.loop = false;
    player.muted = false;
  });

  // Fallback timeout to hide loading spinner if video doesn't load
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('Video loading timeout, showing video anyway');
      setLoaded(true);
    }, 2000); // 2 second timeout

    return () => clearTimeout(timeout);
  }, []);

  // Effect to pause video when component becomes inactive (swiped away)
  useEffect(() => {
    if (player && !isActive) {
      console.log('Pausing video - component inactive');
      player.pause();
    }
  }, [isActive, player]);

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        nativeControls
        contentFit="contain"
        onLoad={() => {
          console.log('VideoView onLoad triggered');
          setLoaded(true);
        }}
        onError={(error) => {
          console.error('VideoView error:', error);
          setLoaded(true);
        }}
      />
      {!loaded && (
        <View style={styles.loadingContainer}>
          <ImageLoading />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7, // 70% of screen height
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
});

export default React.memo(VideoItem);