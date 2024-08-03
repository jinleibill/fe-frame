import {destroyDOM} from "./destroy-dom";
import {mountDOM} from "./mount-dom";
import {h} from "./h";

export function createApp(RootComponent, props = {}) {
    let parentEl = null
    let isMounted = false
    let vdom = null

    function reset() {
        parentEl = null
        isMounted = false
        vdom = null
    }

    return {
        mount(_parentEl) {
            if (isMounted) {
                throw new Error("the application is already mounted")
            }

            parentEl = _parentEl
            vdom = h(RootComponent, props)
            mountDOM(vdom, parentEl)

            isMounted = true
        },
        unmount() {
            if (!isMounted) {
                throw new Error("the application is not mounted")
            }

            destroyDOM(vdom)
            reset()
        },
    }
}