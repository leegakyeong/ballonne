import { Animation, CircleEase, EasingFunction } from '@babylonjs/core'

export function getDroopAnimation() {
  const droopAnimation = new Animation(
    'droopAnimation',
    'position.y',
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE,
  )

  const easingFunction = new CircleEase()
  easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEOUT)
  droopAnimation.setEasingFunction(easingFunction)

  return droopAnimation
}

export async function getCurveAnimation() {
  const curveAnimation = await Animation.CreateFromSnippetAsync('1NGH42#44')

  return curveAnimation
}

export function getLetterAppearanceAnimation() {
  const letterAppearanceAnimation = new Animation(
    'letterAppearanceAnimation',
    'material.alpha',
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE,
  )
  const keyframes = [
    { frame: 0, value: 0 },
    { frame: 10, value: 1 },
  ]
  letterAppearanceAnimation.setKeys(keyframes)

  const easingFunction = new CircleEase()
  easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT)
  letterAppearanceAnimation.setEasingFunction(easingFunction)

  return letterAppearanceAnimation
}
