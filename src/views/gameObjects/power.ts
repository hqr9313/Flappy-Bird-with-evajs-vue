import { GameObject } from '@eva/eva.js';
import { Graphics } from '@eva/plugin-renderer-graphics';


export default function createPower() {

    const power = new GameObject('graphics', {
        
        origin: { x: 0.5, y: 0.5 },
        position: { x: 620, y: 100 },
        anchor: {
            x: 0,
            y: 0,
        },
    });
    const graphics = power.addComponent(new Graphics());
    graphics.graphics.beginFill(0xff0000, 1);

    graphics.graphics.drawRect(0, 0, 10, 40);


    return power;
}
