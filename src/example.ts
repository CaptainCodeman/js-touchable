import { touchable, Point } from './index'

declare global {
  interface CSSStyleDeclaration {
    contain?: string
  }
}

export class TouchableExample extends touchable(HTMLElement) {
  onMove(start: Point, point: Point) {
    console.log('onMove', start, point)
  }

  onFinish(start: Point, point: Point, duration: number) {
    console.log('onMoved', start, point, duration)
  }

  onZoomTo(start: Point, point: Point, z: number) {
    console.log('onZoomTo', start, point, z)
  }

  onZoomBy(point: Point, direction: number) {
    console.log('onZoomBy', point, direction)
  }

  connectedCallback() {
    super.connectedCallback()

    this.style.touchAction = 'none'
    this.style.display = 'block'
    this.style.contain = 'strict'
  }
}

customElements.define('touchable-example', TouchableExample)