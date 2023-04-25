import { createApp } from "../../lib/guide-mini-vue.esm.js"
import { App } from "./App.js"

const appNode = document.querySelector("#app")

createApp(App).mounted(appNode)
