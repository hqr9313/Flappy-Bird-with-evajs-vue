import Vue from 'vue'
import Router from 'vue-router'
// import Home from './views/Home.vue'
import FlyBird from './views/FlyBird.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'FlyBird',
      component: FlyBird
    }

    // {
    //   path: '/',
    //   name: 'ball',
    //   component: Home
    // }
  ]
})
