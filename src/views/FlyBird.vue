<template>
  <div>
    <canvas id="canvas"></canvas>
    <div class="debugger"></div>
  </div>
</template>

<script>
import { resource, Game, GameObject, RESOURCE_TYPE } from "@eva/eva.js";
import { Render, RenderSystem } from "@eva/plugin-renderer-render";
import { RendererSystem } from "@eva/plugin-renderer";
import { Event, EventSystem, HIT_AREA_TYPE } from "@eva/plugin-renderer-event";
import { Text, TextSystem } from "@eva/plugin-renderer-text";
import Matter from "matter-js";

import { Sprite, SpriteSystem } from "@eva/plugin-renderer-sprite";
import {
  SpriteAnimation,
  SpriteAnimationSystem,
} from "@eva/plugin-renderer-sprite-animation";
SpriteAnimation;
import { Transition, TransitionSystem } from "@eva/plugin-transition";

import {
  TilingSprite,
  TilingSpriteSystem,
} from "@eva/plugin-renderer-tiling-sprite";
import { PhysicsSystem, Physics, PhysicsType } from "@eva/plugin-matterjs";
import { Img, ImgSystem } from "@eva/plugin-renderer-img";
import sources from "./birdResource";
import Move from "./helper/Move";
import Next from "./helper/Next";
export default {
  data() {
    return {
      sceneWidth: 750,
      sceneHeight: (window.innerHeight / window.innerWidth) * 750,
      game: "",
      start: false,
      over: false,
      playing: false,
      readyHidden: "",
      birdObject: "",
      score: 0,
      barPassCount: 0,
      barWidthDefault: 80,
    };
  },

  methods: {
    show() {
      resource.addResource(sources);

      this.game = new Game({
        frameRate: 61, // 兼容Eva自身bug, 帧率必须大于60
        autoStart: true, // 可选
        systems: [
          new RendererSystem({
            canvas: document.querySelector("#canvas"),
            width: this.sceneWidth,
            height: this.sceneHeight,
            resolution: window.devicePixelRatio / 2,
          }),
          new TilingSpriteSystem(),
          new TransitionSystem(),
          new SpriteAnimationSystem(),
          new RenderSystem(),
          new EventSystem({
            // moveWhenInside: true // 代表只有在元素内部才会执行move事件，默认为false
          }),
          new ImgSystem(),
          new TextSystem(),
          new SpriteSystem(),
          new PhysicsSystem({
            resolution: window.devicePixelRatio / 2,
            // isTest: true, // Whether to enable debugging mode
            // element: document.querySelector(".debugger"), // Mount point of canvas node in debug mode
            world: {
              gravity: {
                y: 5, // gravity
              },
            },
          }),
        ],
      });

      const ground = this.createBg();

      this.birdObject = this.createBird();
      this.game.scene.addChild(this.birdObject.bird);
      const ready = this.createReady();
      const overPanel = this.createGameOver();

      this.createScore();

      this.game.ticker.add(() => {
        if (this.playing) {
          ground.tilePosition.x -= 1;
          // this.barMove(bars);
        }
      });
      const evt = this.game.scene.addComponent(
        new Event({
          type: HIT_AREA_TYPE.Rect,
        })
      );
      //点击屏幕跳跃
      evt.on("tap", () => {
        if (this.over) return;
        if (this.start && this.birdObject.physics.body) {
          this.birdObject.physics.body.force.y = -0.62;
        }
      });
      //游戏开始
      this.game.on("start_game", () => {
        if (!this.readyHidden) {
          this.game.start();
          let bars = this.createBars();
          this.addBirdPhysic();
          ready.animation.play("hidden", 1);
          this.readyHidden = true;
          this.start = true;
          this.playing = true;
          this.game.playing = this.playing;
        }
      });
      //游戏结束
      this.game.on("game_over", () => {
        this.playing = false;
        //刷新结束的得分

        this.game.scene.addChild(overPanel.overBox);

        this.updateScode("overScore", this.score);
        //取消重力
        this.birdObject.bird.removeComponent(this.birdObject.physics);

        this.over = true;
        this.game.playing = this.playing;
        this.game.pause();
      });
      //回到标题
      this.game.on("on-game-ready", () => {
        //删除管道
        const pipes = this.game.scene.gameObjects.filter(
          (itm) => itm._name == "bar"
        );
        pipes.forEach((pipe) => {
          game.scene.removeChild(pipe);
          pipe.destroy();
        });

        //重置得分
        this.score = 0;
        this.updateScode("score", this.score);

        //重置位置
        this.birdObject.bird.transform.position = {
          x: 100,
          y: this.sceneHeight / 2,
        };
        this.game.scene.removeChild(overPanel.overBox);
        ready.animation.play("show", 1);
        this.readyHidden = false;
        this.over = false;
      });
      this.game.on("createBar", (e) => {
        console.log(1111);
        let bars = this.createNextBars(e);
      });
      this.game.on("getScore", () => {
        this.score++;

        this.updateScode("score", this.score);
      });
      window.game = this.game;
      window.game.playing = false;
    },

    //使用了脚本组件的update 方法，所以废弃
    // barMove(bars) {
    //   if (bars.top && bars.bottom) {
    //     let topPhysics = bars.top.physics;
    //     let bottomPhysics = bars.bottom.physics;
    //     let pushVec = Matter.Vector.create(-1, 0);
    //     Matter.Body.translate(topPhysics.body, pushVec);
    //     Matter.Body.translate(bottomPhysics.body, pushVec);

    //     //  this.game.scene.removeChild(bar);
    //     if (
    //       topPhysics.body.position.x <= 600 &&
    //       bottomPhysics.body.position.x <= 600
    //     ) {
    //       this.game.scene.removeChild(bars.top);
    //       this.game.scene.removeChild(bars.bottom);
    //     }
    //   }
    // },
    updateScode(name, value) {
      const score = this.game.scene.gameObjects.find((item) => {
        return item.name == name;
      });

      const text = score.getComponent(Text);

      text.text = "得分:" + value;
    },
    createScore() {
      const text = new GameObject("score", {
        position: {
          x: 40,
          y: 80,
        },
        origin: {
          x: 0,
          y: 0,
        },
        anchor: {
          x: 0,
          y: 0,
        },
      });

      text.addComponent(
        new Text({
          text: "得分:0",
          style: {
            fontFamily: "Arial",
            fontSize: 36,
            fontStyle: "italic",
            fontWeight: "bold",
            fill: "#fff",
            stroke: "#000",
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: "#000000",
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
            wordWrap: true,
            wordWrapWidth: 400,
            breakWords: true,
          },
        })
      );

      this.game.scene.addChild(text);
    },
    createBg() {
      // 创建 game object
      const image = new GameObject("image", {
        size: { width: this.sceneWidth, height: this.sceneHeight },
        origin: { x: 0, y: 0 },
        position: {
          x: 0,
          y: 0,
        },
        anchor: {
          x: 0,
          y: 0,
        },
      });

      // 为 game object 添加 Image Component
      image.addComponent(
        new Img({
          resource: "bg",
        })
      );

      this.game.scene.addChild(image);

      const ground = new GameObject("ground", {
        size: { width: this.sceneWidth, height: this.sceneHeight / 4 },
        position: { x: 0, y: 0 },
        anchor: {
          x: 0,
          y: 1,
        },
        origin: {
          x: 0.5,
          y: 0.5,
        },
        scale: { x: 2, y: 2 }, // 缩放比例
      });

      const groundTilingSprite = new TilingSprite({
        resource: "ground",
        tileScale: { x: 1, y: 1 },
        tilePosition: { x: 0, y: 0 },
      });

      ground.addComponent(groundTilingSprite);
      ground.addComponent(
        new Physics({
          type: PhysicsType.RECTANGLE,

          bodyOptions: {
            isStatic: true,
          },
        })
      );

      image.addChild(ground);

      image.addComponent(
        new Render({
          zIndex: 1,
        })
      );
      return groundTilingSprite;
    },
    createReady() {
      const readyBox = new GameObject("readyBox", {
        size: { width: 320, height: 80 },
        position: {
          x: 128,
          y: this.sceneHeight / 4,
        },
      });

      const readyTitle = new GameObject("readyTitle", {
        size: { width: 512, height: 144 },
        position: {
          x: 0,
          y: 0,
        },
      });

      readyTitle.addComponent(
        new Sprite({
          resource: "ready",
          spriteName: "ready_title.png",
        })
      );

      const readyTap = new GameObject("readyTitle", {
        size: { width: 294, height: 273 },
        position: {
          x: 120,
          y: 188,
        },
      });

      readyTap.addComponent(
        new Sprite({
          resource: "ready",
          spriteName: "ready_tap.png",
        })
      );
      const evt = readyTap.addComponent(
        new Event({
          type: HIT_AREA_TYPE.Rect,
        })
      );
      evt.on("tap", (e) => {
        this.game.emit("start_game");
      });
      readyBox.addChild(readyTitle);
      readyBox.addChild(readyTap);
      const render = readyBox.addComponent(
        new Render({
          alpha: 1,
          zIndex: 8,
        })
      );

      const animation = readyBox.addComponent(new Transition());

      animation.group = {
        hidden: [
          {
            name: "alpha",
            component: render,
            values: [
              {
                time: 0,
                value: 1,
                tween: "linear",
              },
              {
                time: 20,
                value: 0,
                tween: "linear",
              },
            ],
          },
        ],
        show: [
          {
            name: "alpha",
            component: render,
            values: [
              {
                time: 0,
                value: 0,
                tween: "linear",
              },
              {
                time: 20,
                value: 1,
                tween: "linear",
              },
            ],
          },
        ],
      };
      this.game.scene.addChild(readyBox);

      return { readyBox, animation };
    },
    createBird() {
      const bird = new GameObject("bird", {
        size: { width: 88, height: 66 },
        position: {
          x: 100,
          y: this.sceneHeight / 2,
        },
        anchor: {
          x: 0,
          y: 0,
        },
        origin: {
          x: 0.5,
          y: 0.5,
        },
      });

      const anim = bird.addComponent(
        new SpriteAnimation({
          resource: "bird",
          speed: 500,
        })
      );
      const physics = "";

      return { bird, physics };
    },
    addBirdPhysic() {
      const physics = this.birdObject.bird.addComponent(
        new Physics({
          type: PhysicsType.RECTANGLE,
          bodyOptions: {
            isStatic: false,
            // restitution: 0,
            frictionAir: 0.1,
            friction: 0.06,
            frictionStatic: 0.3,
            force: {
              x: 0,
              y: 0,
            },
          },
          stopRotation: true,
        })
      );

      //游戏失败
      physics.on("collisionStart", () => {
        this.game.emit("game_over");
      });
      this.birdObject.physics = physics;
    },
    createGameOver() {
      const overScore = new GameObject("overScore", {
        size: { width: 179, height: 79 },
        position: { x: 180, y: 320 },
        anchor: {
          x: 0,
          y: 0,
        },
      });

      overScore.addComponent(
        new Text({
          text: "得分：0",
          style: {
            fontFamily: "Arial",
            fontSize: 36,
            fontStyle: "italic",
            fontWeight: "bold",
            fill: "#fff",
            stroke: "#000",
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: "#000000",
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
            wordWrap: true,
            wordWrapWidth: 400,
            breakWords: true,
          },
        })
      );

      const overBox = new GameObject("overBox", {
        size: { width: 320, height: 80 },
        position: {
          x: 128,
          y: this.sceneHeight / 3,
        },
      });

      const overTitle = new GameObject("overTitle", {
        size: { width: 483, height: 101 },
        position: {
          x: 0,
          y: 0,
        },
      });
      overTitle.addComponent(
        new Sprite({
          resource: "over",
          spriteName: "game_over.png",
        })
      );

      const play = new GameObject("gameOverPlay", {
        size: { width: 126, height: 86 },
        position: {
          x: 187,
          y: 188,
        },
      });

      const spritePlay = new Sprite({
        resource: "over",
        spriteName: "play.png",
      });

      play.addComponent(spritePlay);

      const evt = play.addComponent(
        new Event({
          type: HIT_AREA_TYPE.Rect,
        })
      );

      evt.on("tap", () => {
        this.game.emit("on-game-ready");
      });

      overBox.addChild(play);
      overBox.addChild(overTitle);
      overBox.addChild(overScore);

      const animation = overBox.addComponent(new Transition());
      const render = overBox.addComponent(
        new Render({
          alpha: 1,
          zIndex: 10,
        })
      );

      animation.group = {
        hidden: [
          {
            name: "alpha",
            component: render,
            values: [
              {
                time: 0,
                value: 1,
                tween: "linear",
              },
              {
                time: 20,
                value: 0,
                tween: "linear",
              },
            ],
          },
        ],
        show: [
          {
            name: "alpha",
            component: render,
            values: [
              {
                time: 0,
                value: 0,
                tween: "linear",
              },
              {
                time: 20,
                value: 1,
                tween: "linear",
              },
            ],
          },
        ],
      };

      return { overBox, animation };
    },

    createNextBars(distance) {
      this.createBars();
    },
    createBars() {
      let allHeight = (this.sceneHeight * 3) / 4;
      let barWidth = this.barWidthDefault;
      let x = this.sceneWidth - barWidth * -0.5;
      let topHeight = 802;
      let space = 250;
      let hard = 100; //起伏高度
      let mixHeight = 40;
      let bottomHeight = Math.random() * hard + space + mixHeight;

      const top = this.createBar("bar_r.png", x, 0, barWidth, topHeight);
      const bottom = this.createBar(
        "bar.png",
        x,
        (this.sceneHeight * 3) / 4 - bottomHeight / 2,
        barWidth,
        bottomHeight
      );

      return { top, bottom };
    },
    createBar(distance, x, y, cWidth, cHeigt) {
      const bar = new GameObject("bar", {
        size: { width: cWidth, height: cHeigt },
        origin: { x: 0.5, y: 0.5 },
        position: {
          x: x,
          y: y,
        },

        anchor: {
          x: 0,
          y: 0,
        },
      });
      bar.addComponent(
        new Sprite({
          resource: "bar",
          spriteName: distance,
        })
      );

      let physics = bar.addComponent(
        new Physics({
          type: PhysicsType.RECTANGLE,
          bodyOptions: {
            isStatic: true, // Whether the object is still, any force acting on the object in a static state will not produce any effect
            restitution: 0,
            frictionAir: 0,
            friction: 0,
            frictionStatic: 0,
            force: {
              x: 0,
              y: 0,
            },
            stopRotation: true, // default false, usually do not need to be set
          },
        })
      );
      bar.addComponent(new Move());
      bar.addComponent(new Next());
      bar.addComponent(
        new Render({
          alpha: 1,
          zIndex: 8,
        })
      );
      // setTimeout(() => {
      //   let pushVec = Matter.Vector.create(-20, 0);
      //   Matter.Body.translate(physics.body, pushVec);
      // }, 100);

      this.game.scene.addChild(bar);
      return { bar, physics };
    },
  },
  created() {},
  mounted() {
    this.show();
  },
};
</script>

<style>
#canvas {
  width: 100%;
  height: auto;
}
</style>