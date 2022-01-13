import { RESOURCE_TYPE } from "@eva/eva.js";
export default [
  {
    name: "bg",
    type: RESOURCE_TYPE.IMAGE,
    src: {
      image: {
        type: "png",
        url: "@/../static/bg.png",
      },
    },
    preload: true,
  },
  {
    name: "ground",
    type: RESOURCE_TYPE.IMAGE,
    src: {
      image: {
        type: "png",
        url: "@/../static/ground.png",
      },
    },
    preload: true,
  },
  {
    name: "ready",
    type: RESOURCE_TYPE.SPRITE,
    src: {
      image: {
        type: "png",
        url: "@/../static/ready/ready.png",
      },
      json: {
        type: "json",
        url: "@/../static/ready/ready.json",
      },
    },
    preload: true,
  },
  {
    name: "bird",
    type: RESOURCE_TYPE.SPRITE_ANIMATION,
    src: {
      image: {
        type: "png",
        url: "@/../static/bird/bird.png",
      },
      json: {
        type: "json",
        url: "@/../static/bird/bird.json",
      },
    },
    preload: true,
  },
  {
    name: 'over',
    type: RESOURCE_TYPE.SPRITE,
    src: {
      image: {
        type: 'png',
        url:
          '@/../static/over/over.png',
      },
      json: {
        type: 'json',
        url:
          '@/../static/over/over.json',
      },
    },
    preload: true,
  },
  {
    name: 'bar',
    type: RESOURCE_TYPE.SPRITE,
    src: {
      image: {
        type: 'png',
        url:
          '@/../static/bar/bar.png',
      },
      json: {
        type: 'json',
        url:
          '@/../static/bar/bar.json',
      },
    },
    preload: true,
  },
];
