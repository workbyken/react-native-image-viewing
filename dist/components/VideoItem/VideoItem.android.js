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
import useVideoDimensions from "../../hooks/useVideoDimensions";

const SCREEN = Dimensions.get("window");
const SCREEN_WIDTH = SCREEN.width;
const SCREEN_HEIGHT = SCREEN.height;

const VideoItem = ({ videoSrc, onRequestClose, isActive }) => {
  const [loaded, setLoaded] = useState(false);
  const videoDimensions = useVideoDimensions(videoSrc);
  
  console.log('VideoItem rendered with videoSrc:', videoSrc);
  console.log('videoDimensions:', videoDimensions);
  
  // Extract URI from video source object
  const videoUri = typeof videoSrc === 'string' ? videoSrc : videoSrc.uri;
  console.log('Using video URI:', videoUri);
  
  // Create video player using the new expo-video API
  const player = useVideoPlayer(videoUri, (player) => {
    console.log('Video player created');
    player.loop = false;
    player.muted = false;
  });

  const onLoadEnd = useCallback(() => {
    console.log('Video first frame rendered');
    setLoaded(true);
  }, []);

  // Fallback timeout to hide loading spinner if video doesn't load
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('Video loading timeout, hiding spinner');
      setLoaded(true);
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, []);

  // Effect to pause video when component becomes inactive (swiped away)
  useEffect(() => {
    if (player && !isActive) {
      console.log('Video became inactive, pausing playback');
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
        onFirstFrameRender={() => {
          console.log('Video first frame rendered');
          setLoaded(true);
        }}
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
    // Ensure video can receive touch events for controls
    pointerEvents: 'auto',
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