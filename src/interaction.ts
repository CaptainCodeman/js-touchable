import { Point } from '@captaincodeman/geometry/point';

export type Interaction = PointerEvent | Touch | MouseEvent | WheelEvent

export function pointFromInteraction(e: Interaction) {
  const el = <HTMLElement>e.target

  const x = e.clientX - el.offsetLeft
  const y = e.clientY - el.offsetTop

  return new Point(x, y)
}
