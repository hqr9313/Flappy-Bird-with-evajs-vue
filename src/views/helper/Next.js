import { Game, Component, GameObject } from "@eva/eva.js";
import { Physics } from "@eva/plugin-matterjs";
import Matter from "matter-js";

export default class Next extends Component {
  gameObject;
  isAdd;
  static componentName = "next";

  constructor() {
    super();
  }

  update() {
    const physics = this.gameObject.getComponent(Physics);
    if (window.game.playing) {
      //如果小鸟通过就得分增加
      if (physics.body) {
        let x = physics.body.position.x;
        let isTop = physics.body.position.y == 0 ? true : false;
        //溢出屏幕
        if (x == -80) {
          this.gameObject.getComponent(Physics).removeAllListeners();

          window.game.scene.removeChild(this.gameObject);

          this.gameObject.destroy();
        }

        if (x == 60) {
          //只判断下面的管道

          if (isTop) {
            window.game.emit("getScore");
          }
        }
        this.isAdd = false; //防止重复添加
        if (!this.isAdd && x == 500) {
          this.isAdd = true;
          //新建一个管道
          //只判断下面的管道
          if (isTop) {
            window.game.emit("createBar", "down");
          }
        }
      }
    }
  }
  lateUpdate() {
    if (window.game.playing) {
      // console.log("得分lateUpdatelateUpdatelateUpdate");
    }
  }
}
