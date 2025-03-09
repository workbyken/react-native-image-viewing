/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useEffect } from "react";
import { Image } from "react-native";
import { createCache } from "../utils";
const imagePrefetchCache = createCache(50);
const useImagePrefetch = (images) => {
    useEffect(() => {
        images.forEach((image) => {
            if (typeof image === "string") {
                if (!imagePrefetchCache.get(image)) {
                    Image.prefetch(image).then(() => {
                        imagePrefetchCache.set(image, true);
                    });
                }
            }
        });
    }, [images]);
};
export default useImagePrefetch;
