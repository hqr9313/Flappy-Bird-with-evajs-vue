/* eslint-disable no-console */
<template>
  <div class="page">
    <!-- <button @click="showBasket">sho22w eva</button> -->

    <canvas id="canvas"></canvas>
    <div id="debugger"></div>
  </div>
</template>

<script>
import { resource, RESOURCE_TYPE, Game, GameObject } from "@eva/eva.js";

import { RendererSystem } from "@eva/plugin-renderer";
import { Img, ImgSystem } from "@eva/plugin-renderer-img"; // 引入渲染图片所需要的组件和系统
import { Event, EventSystem } from "@eva/plugin-renderer-event";
import { Transition, TransitionSystem } from "@eva/plugin-transition";

import { SpriteAnimationSystem } from "@eva/plugin-renderer-sprite-animation";
import { RenderSystem } from "@eva/plugin-renderer-render";

import { GraphicsSystem } from "@eva/plugin-renderer-graphics";
import { Text, TextSystem } from "@eva/plugin-renderer-text";

import { PhysicsSystem, Physics, PhysicsType } from "@eva/plugin-matterjs";

import createBackground from "./gameObjects/background.ts";
import createBasketFront from "./gameObjects/board/basketFront.ts";
import createBoard from "./gameObjects/board/board.ts";
import createBall from "./gameObjects/ball.ts";
import createBtn from "./gameObjects/btn.ts";
import createWall from "./gameObjects/wall.ts";
import createSensor from "./gameObjects/sensor.ts";
import createScore from "./gameObjects/score.ts";
import createPower from "./gameObjects/power.ts";

import sources from "./basketBallResource";
import store from "./store.ts";

export default {
  created() {
    setTimeout(() => {
      this.showBasket();
    }, 100);
  },

  data() {
    return {
      isGoalA: false,
      isGoalB: false,
      score: 0,
      touchStartTime: 0,
      touchEndTime: 0,
    };
  },
  methods: {
    getTouchTime() {
      //返回毫秒
      let second = this.touchEndTime - this.touchStartTime;
      return second / 1000;
    },
    test(body, position, force) {
      body.force.x += force.x;
      body.force.y += force.y;
      var offset = {
        x: position.x - body.position.x,
        y: position.y - body.position.y,
      };
      body.torque += offset.x * force.y - offset.y * force.x;

      console.log(99);
    },
    showBasket() {
      let _this = this;
      resource.addResource(sources);
      const game = new Game({
        systems: [
          new RendererSystem({
            canvas: document.querySelector("#canvas"),
            width: 750,
            height: 1484,
            antialias: true,
            resolution: window.devicePixelRatio / 2,
          }),
          new ImgSystem(),
          new TransitionSystem(),

          new SpriteAnimationSystem(),
          new RenderSystem(),

          new GraphicsSystem(),
          new TextSystem(),
          new EventSystem(),
          new PhysicsSystem({
            resolution: window.devicePixelRatio / 2, //
            // isTest: true, // 是否开启调试模式保持RendererSystem的resolution一致
            // element: document.getElementById("debugger"), // 调试模式下canvas节点的挂载点
            world: {
              gravity: {
                y: 9.8, // 重力
              },
            },
            mouse: {
              open: true,
            },
          }),
        ],
      });

      game.scene.transform.size.width = 750;
      game.scene.transform.size.height = 1484;

      const pos = {
        x: 500,
        y: 1100,
      };

      store.ball = createBall(pos);
      const { basetFront, playAnim } = createBasketFront();
      const btn = createBtn({
        text: "投球",
        transform: {
          position: {
            x: 0,
            y: -120,
          },
          origin: {
            x: 0.5,
            y: 0.5,
          },
          anchor: {
            x: 0.5,
            y: 1,
          },
        },
        touchStart: () => {
          _this.touchStartTime = new Date();
          // console.log(store.ball.transform.position.y);
          transition.play("idle", 1);
        },

        touchEnd: () => {
          _this.touchEndTime = new Date();
          var s = _this.getTouchTime();
          transition.stop("idle");
          // physics.body.force.y = -0.5;
          //根据长按时间计算投球力度
          //在地上

          if (s > 1) {
            s = 1;
          }
          physics.body.force.y = -1.5 * (1 + s);

          physics.body.force.x = -0.2 * (1 + s);

          // alert(ball.transform.position.x);
          //如果球飞出界限，重置位置
          // if (
          //   store.ball.transform.position.x < 0 ||
          //   store.ball.transform.position.x > 750 ||
          //   store.ball.transform.position.y < 0 ||
          //   store.ball.transform.position.y > 1484
          // ) {
          //   //重置位置
          // } else {

          // }
        },
      });
      const power = createPower();
      const transition = power.addComponent(
        new Transition({
          group: {
            idle: [
              {
                name: "scale.x",
                component: power.transform,
                values: [
                  {
                    time: 0,
                    value: 1,
                    tween: "linear",
                  },
                  {
                    time: 500,
                    value: 5,
                    tween: "linear",
                  },
                  {
                    time: 1000,
                    value: 10,
                    tween: "linear",
                  },
                ],
              },
            ],
          },
        })
      );

      const wall_bottom = createWall(0, 1484 - 40, 730, 4000);
      const wall_left = createWall(-2000, 0, 2020, 1484);
      const wall_right = createWall(730, 0, 2220, 1484);
      const wall_top = createWall(0, -1980, 730, 2000);

      const boardWall = createWall(42, 562, 20, 238);
      const hoop_left = createWall(62, 752, 30, 10);
      const hoop_right = createWall(205, 752, 15, 10);
      //当篮球碰到A再碰到B，算得分
      const GoalA = createSensor(125, 752, 40, 10, function () {
        _this.isGoalA = true;
        if (_this.isGoalB) {
          _this.isGoalB = false;
        }
      });
      const GoalB = createSensor(125, 822, 40, 10, function () {
        playAnim();
        if (_this.isGoalA) {
          _this.isGoalB = true;
        } else {
          _this.isGoalA = false;
        }

        if (_this.isGoalA && _this.isGoalB) {
          _this.score++;
          const scoreObjs = game.scene.gameObjects.filter(
            (itm) => itm._name.indexOf("score") >= 0
          );
          scoreObjs.forEach((scoreObj) => {
            const text = scoreObj.getComponent(Text);
            text.text = `得分：${_this.score}`;
          });
          store.ball.transform.position.x = 500;
          store.ball.transform.position.y = 1000;
          _this.isGoalB = false;
          _this.isGoalA = false;
        }
      });

      const physics = store.ball.addComponent(
        new Physics({
          type: PhysicsType.CIRCLE,
          radius: 39.5,
        
          bodyOptions: {
            // restitution: 1.1,
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

      physics.on("collisionStart", () => {});
      physics.on("collisionEnd", () => {});

      game.scene.addChild(createBackground());
      game.scene.addChild(createBoard());
      game.scene.addChild(store.ball);
      game.scene.addChild(basetFront);
      game.scene.addChild(btn);
      game.scene.addChild(power);
      game.scene.addChild(wall_bottom);
      game.scene.addChild(wall_left);
      game.scene.addChild(wall_right);
      game.scene.addChild(wall_top);
      game.scene.addChild(hoop_left);

      game.scene.addChild(hoop_right);
      game.scene.addChild(createScore());
      game.scene.addChild(GoalA);
      game.scene.addChild(GoalB);

      game.scene.addChild(boardWall);
      window.playAnim = playAnim;
      window.game = game;
    },
    show() {
      resource.addResource([
        {
          name: "imageName",
          type: RESOURCE_TYPE.IMAGE,
          src: {
            image: {
              type: "png",
              url: "http://gw.alicdn.com/bao/uploaded/TB1lVHuaET1gK0jSZFhXXaAtVXa-200-200.png",
            },
          },
          preload: true,
        },
      ]);

      const game = new Game({
        systems: [
          new RendererSystem({
            canvas: document.querySelector("#canvas"),
            width: 750,
            height: 1000,
          }),
          new ImgSystem(),
          new EventSystem(),
          new TransitionSystem(),
        ],
      });

      const heart = new GameObject("heart", {
        size: { width: 200, height: 200 },
        position: {
          x: 0,
          y: 0,
        },
        origin: { x: 0, y: 0 }, //初始位置
        anchor: {
          x: 0,
          y: 0,
        },
      });
      //在gameObject上添加图片
      heart.addComponent(
        new Img({
          resource: "imageName",
        })
      );
      //定义事件
      const evt = heart.addComponent(new Event());
      evt.on("tap", () => {});

      //定义动画
      const animation = heart.addComponent(new Transition());
      animation.group = {
        idle: [
          {
            name: "scale.x",
            component: heart.transform,
            values: [
              {
                time: 0,
                value: 1,
                tween: "ease-out",
              },
              {
                time: 300,
                value: 1.2,
                tween: "ease-in",
              },
              {
                time: 600,
                value: 1,
              },
            ],
          },
          {
            name: "scale.y",
            component: heart.transform,
            values: [
              {
                time: 0,
                value: 1,
                tween: "ease-out",
              },
              {
                time: 300,
                value: 1.2,
                tween: "ease-in",
              },
              {
                time: 600,
                value: 1,
              },
            ],
          },
        ],
        move: [
          {
            name: "position.x",
            component: heart.transform,
            values: [
              {
                time: 0,
                value: 1,
                tween: "ease-out",
              },
              {
                time: 300,
                value: 300,
                tween: "ease-in",
              },
            ],
          },
          {
            name: "position.y",
            component: heart.transform,
            values: [
              {
                time: 0,
                value: 1,
                tween: "ease-in",
              },
              {
                time: 300,
                value: 300,
              },
            ],
          },
        ],
      };

      animation.play("move", 1);
      // animation.on("finish", (name) => {
      //   name === "move" && animation.play("idle", 3);
      // });

      game.scene.addChild(heart);
    },
  },
};
</script>

<style>
#canvas {
  width: 100%;
  height: auto;
}
#debugger {
  width: 100%;
  height: auto;
}
</style>