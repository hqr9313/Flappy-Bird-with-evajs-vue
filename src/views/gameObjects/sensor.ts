import { GameObject } from '@eva/eva.js';
import { Graphics } from '@eva/plugin-renderer-graphics';
import { Physics, PhysicsType } from "@eva/plugin-matterjs";

export default function createSensor(x, y, width, height, callback) {

    const go = new GameObject('graphics', {
        position: { x: x + width / 2, y: y + height / 2 },
        size: { width, height },
        origin: { x: 0.5, y: 0.5 },
    });
    const graphics = go.addComponent(new Graphics());
    graphics.graphics.beginFill(0xffffff,0);
    graphics.graphics.drawRect(0, 0, width, height);

    const physics = go.addComponent(
        new Physics({
            type: PhysicsType.RECTANGLE,
            bodyOptions: {
                isStatic: true, // Whether the object is still, any force acting on the object in a static state will not produce any effect
                restitution: 0.1,
                frictionAir: 0,
                isSensor:true,
                friction: 0,
                frictionStatic: 0,
                force: {
                    x: 0,
                    y: 0,
                },
            },
            stopRotation: true, // default false, usually do not need to be set
        }),
    );

    physics.on('collisionStart', () => {
        if (typeof callback === "function") {
            callback();
        }


    });

    return go;
}
