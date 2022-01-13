import { Game, Component, GameObject } from '@eva/eva.js'
import { Physics } from '@eva/plugin-matterjs'
import Matter from 'matter-js'


export default class Move extends Component {
  gameObject
  static componentName = 'move'

  constructor() {
    super()
  }

  update() {
    // const gameComponent =
    // this.gameObject.getComponent(window.game);
     
    const physics = this.gameObject.getComponent(Physics)
    // console.log(this.gameObject);
    // console.log(window.game);
    // console.log(gameComponent);
    //console.log(window.game && physics.body);
    

    if (window.game && physics.body) {
    
      if (window.game.playing) {
        let pushVec = Matter.Vector.create(-5, 0)
        Matter.Body.translate(physics.body, pushVec)
      }
    }
  }
}
