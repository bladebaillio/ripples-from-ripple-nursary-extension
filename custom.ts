//% color=#0099CC icon="\uf043" block="Ripples"
//% groups=['Create', 'Update', 'Configure', 'Info']
namespace RippleSystem {
    export const WATER = {
        rippleCount: 4,
        rippleSpeed: 0.6,
        rippleSize: 60,
        rippleColor: 8,
        edgeThickness: 20,
        connectionDistance: 20,
    }
    let ripples: Ripple[] = []

    export class Ripple {
        x: number
        y: number
        size: number
        maxSize: number
        points: { x: number, y: number }[]
        opacity: number

        constructor(x: number, y: number) {
            this.x = x
            this.y = y
            this.size = 0
            this.maxSize = WATER.rippleSize + Math.randomRange(-5, 5)
            this.opacity = 1
            this.points = []
        }

        update() {
            this.size += WATER.rippleSpeed
            this.opacity = Math.max(0, 1 - (this.size / this.maxSize) ** 2)
            this.points = []
            if (this.opacity > 0) {
                const steps = 50
                for (let i = 0; i < steps; i++) {
                    const angle = (i / steps) * Math.PI * 2
                    this.points.push({
                        x: this.x + Math.cos(angle) * this.size,
                        y: this.y + Math.sin(angle) * this.size
                    })
                }
            }
        }
    }

    //% block="create ripple at x $x y $y"
    //% group="Create"
    //% x.defl=80 y.defl=60
    //% weight=100
    export function createRipple(x: number, y: number): void {
        if (ripples.length < WATER.rippleCount) {
            let ripple = new Ripple(x, y)
            ripples.push(ripple)
        }
    }

    //% block="create ripple at $sprite position"
    //% group="Create"
    //% sprite.shadow=variables_get
    //% sprite.defl=mySprite
    //% weight=95
    export function createRippleAtSprite(sprite: Sprite): void {
        if (sprite) {
            createRipple(sprite.x, sprite.y)
        }
    }

    //% block="update all ripples"
    //% group="Update"
    //% weight=90
    export function updateRipples(): void {
        ripples = ripples.filter(ripple => ripple.opacity > 0)
        ripples.forEach(ripple => ripple.update())
    }

    //% block="draw all ripples"
    //% group="Update"
    //% weight=85
    export function drawRipples(): void {
        drawConnectedRipples(ripples)
    }

    //% block="update and draw ripples"
    //% group="Update"
    //% weight=80
    export function updateAndDrawRipples(): void {
        updateRipples()
        drawRipples()
    }

    //% block="set max ripples to $count"
    //% group="Configure"
    //% count.min=1 count.max=10 count.defl=4
    //% weight=75
    export function setMaxRipples(count: number): void {
        WATER.rippleCount = count
    }

    //% block="set ripple speed to $speed"
    //% group="Configure"
    //% speed.min=0.1 speed.max=2.0 speed.defl=0.6
    //% weight=70
    export function setRippleSpeed(speed: number): void {
        WATER.rippleSpeed = speed
    }

    //% block="set ripple size to $size"
    //% group="Configure"
    //% size.min=10 size.max=120 size.defl=60
    //% weight=65
    export function setRippleSize(size: number): void {
        WATER.rippleSize = size
    }

    //% block="set ripple color to $color"
    //% group="Configure"
    //% color.shadow=colorindexpicker
    //% color.defl=8
    //% weight=60
    export function setRippleColor(color: number): void {
        WATER.rippleColor = color
    }

    //% block="set connection distance to $distance"
    //% group="Configure"
    //% distance.min=5 distance.max=50 distance.defl=20
    //% weight=55
    export function setConnectionDistance(distance: number): void {
        WATER.connectionDistance = distance
    }

    //% block="number of active ripples"
    //% group="Info"
    //% weight=50
    export function getRippleCount(): number {
        return ripples.length
    }

    //% block="clear all ripples"
    //% group="Info"
    //% weight=45
    export function clearAllRipples(): void {
        ripples = []
    }

    //% block="create ripple with cooldown at $sprite position || cooldown $cooldown ms"
    //% group="Create"
    //% sprite.shadow=variables_get
    //% sprite.defl=mySprite
    //% cooldown.defl=500
    //% expandableArgumentMode="toggle"
    //% weight=88
    export function createRippleWithCooldown(sprite: Sprite, cooldown: number = 500): void {
        if (!sprite) return

        let currentTime = game.runtime()
        let lastRippleKey = "lastRipple_" + sprite.id
        let lastRippleTime = sprite.data[lastRippleKey] || 0

        if (currentTime - lastRippleTime > cooldown) {
            createRipple(sprite.x, sprite.y)
            sprite.data[lastRippleKey] = currentTime
        }
    }

    //% block="create ripples in circle at x $x y $y || count $count radius $radius"
    //% group="Create"
    //% x.defl=80 y.defl=60
    //% count.defl=3 radius.defl=20
    //% expandableArgumentMode="toggle"
    //% weight=82
    export function createRippleCircle(x: number, y: number, count: number = 3, radius: number = 20): void {
        for (let i = 0; i < count; i++) {
            let angle = (i / count) * Math.PI * 2
            let rippleX = x + Math.cos(angle) * radius
            let rippleY = y + Math.sin(angle) * radius
            createRipple(rippleX, rippleY)
        }
    }
    
    function drawConnectedRipples(ripples: Ripple[]): void {
        let allPoints: { x: number, y: number, opacity: number }[] = []

        ripples.forEach(ripple => {
            if (ripple.opacity > 0.2) {
                ripple.points.forEach(point => {
                    allPoints.push({
                        x: point.x,
                        y: point.y,
                        opacity: ripple.opacity
                    })
                })
            }
        })

        for (let i = 0; i < allPoints.length; i++) {
            for (let j = i + 1; j < allPoints.length; j++) {
                const p1 = allPoints[i]
                const p2 = allPoints[j]
                const dist = Math.sqrt(
                    (p1.x - p2.x) * (p1.x - p2.x) +
                    (p1.y - p2.y) * (p1.y - p2.y)
                )

                if (dist < WATER.connectionDistance) {
                    const lineOpacity = (p1.opacity + p2.opacity) / 2
                    if (lineOpacity > 0.25) {
                        scene.backgroundImage().drawLine(
                            p1.x,
                            p1.y,
                            p2.x,
                            p2.y,
                            WATER.rippleColor
                        )
                    }
                }
            }
        }
    }
}
