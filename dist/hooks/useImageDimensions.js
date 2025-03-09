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
const useImageDimensions = (images) => {
    const [dimensions, setDimensions] = useState([]);
    const [erroredImageUrls, setErroredImageUrls] = useState([]);
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
            else if (typeof image === "string") {
                const cacheKey = image;
                const imageDimensions = imageDimensionsCache.get(cacheKey);
                if (imageDimensions) {
                    resolve(imageDimensions);
                }
                else {
                    Image.getSize(
                        image,
                        (width, height) => {
                            const dimensions = { width, height };
                            imageDimensionsCache.set(cacheKey, dimensions);
                            resolve(dimensions);
                        },
                        () => {
                            setErroredImageUrls((erroredImageUrls) => [...erroredImageUrls, image]);
                            resolve({ width: 0, height: 0 });
                        }
                    );
                }
            }
            else {
                resolve({ width: 0, height: 0 });
            }
        });
    };
    const getImages = async () => {
        const dimensionsArray = await Promise.all(images.map(getImageDimensions));
        setDimensions(dimensionsArray);
    };
    useEffect(() => {
        getImages();
    }, [images, erroredImageUrls]);
    return dimensions;
};
export default useImageDimensions;
