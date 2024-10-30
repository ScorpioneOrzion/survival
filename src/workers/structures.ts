import { generateIndicatorId } from "./helper"
declare const self: WorkerGlobalScope;
const ID = generateIndicatorId()

const channel = new BroadcastChannel('test')

channel.postMessage(`hello${ID}`)