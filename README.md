# React Native Image and Video Viewing

React Native modal component for viewing images and videos as a sliding gallery.

## Installation

```bash
yarn add react-native-image-viewing
```

### Dependencies

This library requires `expo-av` for video playback:

```bash
expo install expo-av
```

or

```bash
yarn add expo-av
```

## Usage

```jsx
import ImageView from "react-native-image-viewing";
import { useState } from "react";

const images = [
  {
    uri: "https://example.com/image1.jpg",
  },
  {
    uri: "https://example.com/video1.mp4", // Video files are automatically detected
  },
  {
    uri: "https://example.com/image2.jpg",
  }
];

const MyComponent = () => {
  const [visible, setIsVisible] = useState(false);

  return (
    <>
      <Button title="Open Gallery" onPress={() => setIsVisible(true)} />
      <ImageView
        images={images}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
      />
    </>
  );
};
```

## Media Types

The library automatically detects media types based on file extensions:
- Images: jpg, jpeg, png, gif, etc.
- Videos: mp4, mov, avi, mkv, webm

Videos are played with native controls on both iOS and Android.

## Props

| Prop Name               | Type                   | Default | Description                                                                                |
|-------------------------|------------------------|---------|--------------------------------------------------------------------------------------------|
| `images`                | `array`                | `[]`    | Array of images/videos to display                                                          |
| `imageIndex`            | `number`               | `0`     | Current index of image/video to display                                                    |
| `visible`               | `boolean`              | `false` | Is modal shown or not                                                                      |
| `onRequestClose`        | `function`             | `null`  | Function called to close the modal                                                         |
| `onLongPress`           | `function`             | `null`  | Function called when image is long pressed                                                 |
| `onImageIndexChange`    | `function`             | `null`  | Function called when image index changes                                                   |
| `animationType`         | `string`               | `fade`  | Animation modal presented with: 'none', 'fade', 'slide'                                    |
| `backgroundColor`       | `string`               | `black` | Background color of the modal                                                              |
| `swipeToCloseEnabled`   | `boolean`              | `true`  | Enable swipe down to close image viewer                                                    |
| `doubleTapToZoomEnabled`| `boolean`              | `true`  | Enable double tap to zoom for images                                                       |
| `delayLongPress`        | `number`               | `800`   | Delay in ms before onLongPress is called                                                   |
| `HeaderComponent`       | `component`            | `null`  | Custom header component rendered above the image                                           |
| `FooterComponent`       | `component`            | `null`  | Custom footer component rendered below the image                                           |
| `presentationStyle`     | `string`               | `null`  | Modal presentation style: 'fullScreen', 'pageSheet', 'formSheet', 'overFullScreen'         |

## License

MIT 