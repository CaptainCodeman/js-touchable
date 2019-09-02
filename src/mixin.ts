import { Point } from '@captaincodeman/geometry/point';
import { Tracking } from './tracking';
import { Touchable } from './touchable';
import { pointFromInteraction } from './interaction';

declare global {
  interface Window {
    PointerEvent?: any;
  }
}

type Constructor<T> = new (...args: any[]) => T

const pointers: unique symbol = Symbol('pointers')
const tracking: unique symbol = Symbol('tracking')

const onPointerDown: unique symbol = Symbol('onPointerDown')
const onPointerMove: unique symbol = Symbol('onPointerMove')
const onPointerFinish: unique symbol = Symbol('onPointerFinish')

const onTouchStart: unique symbol = Symbol('onTouchStart')
const onTouchMove: unique symbol = Symbol('onTouchMove')
const onTouchFinish: unique symbol = Symbol('onTouchFinish')

const onMouseDown: unique symbol = Symbol('onMouseDown')
const onMouseMove: unique symbol = Symbol('onMouseMove')
const onMouseUp: unique symbol = Symbol('onMouseUp')
const onMouseWheel: unique symbol = Symbol('onMouseWheel')

export function touchable<T extends Constructor<Touchable>>(
  superclass: T
) {
  abstract class touchable extends superclass {
    private [pointers]: { [id: number]: Point } = {}
    private [tracking]: Tracking = new Tracking(this)

    connectedCallback() {
      if (super.connectedCallback) {
        super.connectedCallback()
      }

      this._addEventListeners()
    }

    disconnectedCallback() {
      this._removeEventListeners()

      if (super.disconnectedCallback) {
        super.disconnectedCallback()
      }
    }

    private _addEventListeners() {
      const ael = this.addEventListener.bind(this)

      if (window.PointerEvent) {
        ael('pointerdown', this[onPointerDown], false)
        ael('pointermove', this[onPointerMove], false)
        ael('pointerup', this[onPointerFinish], false)
        ael('pointercancel', this[onPointerFinish], false)
      } else {
        ael('touchstart', this[onTouchStart], false)
        ael('touchmove', this[onTouchMove], false)
        ael('touchend', this[onTouchFinish], false)
        ael('touchcancel', this[onTouchFinish], false)
        ael('mousedown', this[onMouseDown], false)
      }

      ael('wheel', this[onMouseWheel], false)
    }

    private _removeEventListeners() {
      const rel = this.removeEventListener.bind(this)

      rel('wheel', this[onMouseWheel], false)

      if (window.PointerEvent) {
        rel('pointerdown', this[onPointerDown], false)
        rel('pointermove', this[onPointerMove], false)
        rel('pointerup', this[onPointerFinish], false)
        rel('pointercancel', this[onPointerFinish], false)
      } else {
        rel('touchstart', this[onTouchStart], false)
        rel('touchmove', this[onTouchMove], false)
        rel('touchend', this[onTouchFinish], false)
        rel('touchcancel', this[onTouchFinish], false)
        rel('mousedown', this[onMouseDown], false)
      }
    }

    private [onPointerDown](e: PointerEvent) {
      e.preventDefault()

      const el = <Element>e.target
      el.setPointerCapture(e.pointerId)

      this[pointers][e.pointerId] = pointFromInteraction(e)

      const values = Object.values(this[pointers])
      this[tracking].start(...values)
    }

    private [onPointerMove](e: PointerEvent) {
      e.preventDefault()

      if (this[pointers][e.pointerId]) {
        this[pointers][e.pointerId] = pointFromInteraction(e)
        const values = Object.values(this[pointers])
        this[tracking].move(...values)
      }
    }

    private [onPointerFinish](e: PointerEvent) {
      e.preventDefault()

      const el = <Element>e.target
      el.releasePointerCapture(e.pointerId);

      delete this[pointers][e.pointerId]

      const values = Object.values(this[pointers])
      this[tracking].finish(...values)
    }

    private [onTouchStart](e: TouchEvent) {
      e.preventDefault()

      const values = Array.from(e.targetTouches).map(pointFromInteraction)
      this[tracking].start(...values)
    }

    private [onTouchMove](e: TouchEvent) {
      e.preventDefault()

      const values = Array.from(e.targetTouches).map(pointFromInteraction)
      this[tracking].move(...values)
    }

    private [onTouchFinish](e: TouchEvent) {
      e.preventDefault()

      const values = Array.from(e.targetTouches).map(pointFromInteraction)
      this[tracking].finish(...values)
    }

    private [onMouseDown](e: MouseEvent) {
      e.preventDefault()

      this[tracking].start(pointFromInteraction(e))

      document.addEventListener('mousemove', this[onMouseMove], false)
      document.addEventListener('mouseup', this[onMouseUp], false)
    }

    private [onMouseMove](e: MouseEvent) {
      e.preventDefault()

      this[tracking].move(pointFromInteraction(e))
    }

    private [onMouseUp](e: MouseEvent) {
      e.preventDefault()

      this[tracking].finish(pointFromInteraction(e))

      document.removeEventListener('mousemove', this[onMouseMove], false)
      document.removeEventListener('mouseup', this[onMouseUp], false)
    }

    private [onMouseWheel](e: WheelEvent) {
      e.preventDefault()

      this[tracking].zoomBy(pointFromInteraction(e), e.deltaY)
    }
  }

  return touchable as Constructor<Touchable> & T
}
