import mitt from "mitt";
import type { ApplicationEvents } from "~/types/emitterEvents";

const emitter = mitt<ApplicationEvents>()

export const useEvent = emitter.emit
export const useListen = emitter.on
