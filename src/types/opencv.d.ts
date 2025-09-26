// src/types/opencv.d.ts
export interface Mat {
  rows: number;
  cols: number;
  type: number;
  delete(): void;
  isDeleted?: boolean;
}

export interface MatVector {
  size(): number;
  get(index: number): Mat;
  push_back(mat: Mat): void;
  delete(): void;
  isDeleted?: boolean;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Scalar = number[];

// OpenCV constants
export const COLOR_RGBA2RGB: number;
export const COLOR_RGB2HSV: number;
export const RETR_EXTERNAL: number;
export const CHAIN_APPROX_SIMPLE: number;
export const MORPH_RECT: number;
export const MORPH_CLOSE: number;
export const MORPH_OPEN: number;

// OpenCV functions
export function imread(canvas: HTMLCanvasElement): Mat;
export function cvtColor(src: Mat, dst: Mat, code: number): void;
export function inRange(src: Mat, lowerb: Mat, upperb: Mat, dst: Mat): void;
export function bitwise_or(src1: Mat, src2: Mat, dst: Mat): void;
export function morphologyEx(src: Mat, dst: Mat, op: number, kernel: Mat): void;
export function getStructuringElement(shape: number, ksize: Size): Mat;
export function findContours(
  src: Mat,
  contours: MatVector,
  hierarchy: Mat,
  mode: number,
  method: number
): void;
export function boundingRect(contour: Mat): Rect;

// Main cv object type
export interface CV {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Scalar: any;
  Mat: new (rows?: number, cols?: number, type?: number) => Mat;
  MatVector: new () => MatVector;
  Size: new (width: number, height: number) => Size;
  imread: typeof imread;
  cvtColor: typeof cvtColor;
  inRange: typeof inRange;
  bitwise_or: typeof bitwise_or;
  morphologyEx: typeof morphologyEx;
  getStructuringElement: typeof getStructuringElement;
  findContours: typeof findContours;
  boundingRect: typeof boundingRect;
  // Constants
  COLOR_RGBA2RGB: number;
  COLOR_RGB2HSV: number;
  RETR_EXTERNAL: number;
  CHAIN_APPROX_SIMPLE: number;
  MORPH_RECT: number;
  MORPH_CLOSE: number;
  MORPH_OPEN: number;
}

// Export the main cv object
export const cv: CV;
