/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useEffect, useState } from "react";
import { Image, Dimensions } from "react-native";
import { createCache } from "../utils";

const CACHE_SIZE = 50;
const imageDimensionsCache = createCache(CACHE_SIZE);
const SCREEN = Dimensions.get("screen");
const DEFAULT_DIMENSIONS = { width: SCREEN.width, height: SCREEN.height };

const useImageDimensions = (image) => {
    const [dimensions, setDimensions] = useState(null);
    const [error, setError] = useState(false);

    const getImageDimensions = (image) => {
        return new Promise((resolve) => {
            if (typeof image === "number") {
                const cacheKey = `${image}`;
                let imageDimensions = imageDimensionsCache.get(cacheKey);
                if (!imageDimensions) {
                    const { width, height } = Image.resolveAssetSource(image);
                    imageDimensions = { width, height };
                    imageDimensionsCache.set(cacheKey, imageDimensions);
                }
                resolve(imageDimensions);
            }
            else if (image && typeof image === "object" && image.uri) {
                const cacheKey = image.uri;
                const imageDimensions = imageDimensionsCache.get(cacheKey);
                if (imageDimensions) {
                    resolve(imageDimensions);
                }
                else {
                    Image.getSize(
                        image.uri,
                        (width, height) => {
                            const dimensions = { width, height };
                            imageDimensionsCache.set(cacheKey, dimensions);
                            resolve(dimensions);
                        },
                        () => {
                            console.error("Error getting image size for:", image.uri);
                            setError(true);
                            resolve(DEFAULT_DIMENSIONS);
                        }
                    );
                }
            }
            else {
                console.warn("Invalid image source:", image);
                resolve(DEFAULT_DIMENSIONS);
            }
        });
    };

    useEffect(() => {
        let isMounted = true;
        
        const loadDimensions = async () => {
            try {
                const imageDimensions = await getImageDimensions(image);
                if (isMounted) {
                    setDimensions(imageDimensions);
                }
            } catch (e) {
                console.error("Error in useImageDimensions:", e);
                if (isMounted) {
                    setError(true);
                    setDimensions(DEFAULT_DIMENSIONS);
                }
            }
        };
        
        loadDimensions();
        
        return () => {
            isMounted = false;
        };
    }, [image]);

    return dimensions || DEFAULT_DIMENSIONS;
};

export default useImageDimensions;
