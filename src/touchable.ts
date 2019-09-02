import { Point } from '@captaincodeman/geometry/point';

interface _HTMLElement extends HTMLElement {
  connectedCallback?(): void
  disconnectedCallback?(): void
}

export interface Touchable extends _HTMLElement {
  onMove?(start: Point, point: Point): void
  onFinish?(start: Point, point: Point, duration: number): void
  onZoomTo?(start: Point, point: Point, z: number): void
  onZoomBy?(point: Point, direction: number): void
  onTap?(point: Point): void
  onHold?(point: Point): void
}