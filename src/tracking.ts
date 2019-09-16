import { Point, dist } from '@captaincodeman/geometry/point'
import { Rect, center } from '@captaincodeman/geometry/rect'
import { Touchable } from './touchable'

class TrackedPoint {
  constructor(readonly time: number, readonly point: Point) { }
}

export class Tracking {
  private readonly tracked: TrackedPoint[] = []
  private initial: TrackedPoint
  private latest: TrackedPoint
  private distance: number
  private zoom: number

  constructor(private readonly touchable: Touchable) { }

  start(...points: Point[]) {
    this.tracked.length = 0
    this.distance = 0
    this.zoom = 1

    switch (points.length) {
      case 1:
        this.add(points[0])
        break

      case 2:
        const r = new Rect(points[0], points[1])
        this.add(r.do(center))
        break

      default:
        return
    }

    this.initial = this.latest
    this.touchable.onMove && this.touchable.onMove(this.initial.point, this.latest.point)
  }

  move(...points: Point[]) {
    switch (points.length) {
      case 1:
        this.add(points[0])
        this.touchable.onMove && this.touchable.onMove(this.initial.point, this.latest.point)
        break

      case 2:
        const r = new Rect(points[0], points[1])
        const p = r.do(center)
        this.add(p)

        const d = points[0].do(dist, points[1])
        if (this.distance) {
          const delta = (d - this.distance) / 10
          const factor = Math.pow(1.06, delta)
          this.zoom = this.zoom * factor
          this.touchable.onZoomTo && this.touchable.onZoomTo(this.initial.point, p, this.zoom)
        }
        this.distance = d
        break
    }
  }

  finish(...points: Point[]) {
    // Note: the "+ 1" is so we can continue to think of the number
    // of touches consistently, even though one just ended
    switch (points.length + 1) {
      case 1:
        const now = performance.now()
        this.trim(now)

        // TODO: decide if we've tapped or long-pressed based on the
        // values of initial and latest + intermediate movements
        if (this.tracked.length > 1) {
          const oldest = this.tracked[0]
          const latest = this.tracked[this.tracked.length - 1]
          const duration = latest.time - oldest.time
          this.touchable.onFinish && this.touchable.onFinish(oldest.point, latest.point, duration)
        }
        break

      case 2:
        // if we _were_ doing multi-touch then act as though we have
        // just started single touch to prevent zoom / position jumps
        this.start(...points)
        break
    }
  }

  zoomBy(point: Point, direction: number) {
    this.touchable.onZoomBy && this.touchable.onZoomBy(point, direction)
  }

  private add(point: Point) {
    const now = performance.now()
    this.trim(now)
    this.latest = new TrackedPoint(now, point)
    this.tracked.push(this.latest)
  }

  private trim(now: number) {
    while (this.tracked.length > 0 && now - this.tracked[0].time > 100) {
      this.tracked.shift()
    }
  }
}
