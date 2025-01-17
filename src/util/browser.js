// @flow strict

import window from './window';
import type {Cancelable} from '../types/cancelable';

const now = window.performance && window.performance.now ?
    window.performance.now.bind(window.performance) :
    Date.now.bind(Date);

const raf = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;

const cancel = window.cancelAnimationFrame ||
    window.mozCancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.msCancelAnimationFrame;

let linkEl;

let reducedMotionQuery: MediaQueryList;

/**
 * @private
 */
const exported = {
    /**
     * Provides a function that outputs milliseconds: either performance.now()
     * or a fallback to Date.now()
     */
    now,

    frame(fn: (paintStartTimestamp: number) => void): Cancelable {
        const frame = raf(fn);
        return {cancel: () => cancel(frame)};
    },

    getImageData(img: CanvasImageSource, padding?: number = 0): ImageData {
        const canvas = window.document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('failed to create canvas 2d context');
        }
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, img.width, img.height);
        return context.getImageData(-padding, -padding, img.width + 2 * padding, img.height + 2 * padding);
    },

    resolveURL(path: string) {
        if (!linkEl) linkEl = window.document.createElement('a');
        linkEl.href = path;
        return linkEl.href;
    },

    get devicePixelRatio() { return window.devicePixelRatio; },
    get prefersReducedMotion(): boolean {
        if (!window.matchMedia) return false;
        //Lazily initialize media query
        if (reducedMotionQuery == null) {
            reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        }
        return reducedMotionQuery.matches;
    },
};

export default exported;
