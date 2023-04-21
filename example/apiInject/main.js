import { createApp } from "../../lib/guide-mini-vue.esm.js"
import { Provide } from "./App.js"

const appNode = document.querySelector('#app')

createApp(Provide).mounted(appNode)

