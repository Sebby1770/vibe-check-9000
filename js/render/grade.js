/* Final film grade, applied after tone mapping: lift/gamma/gain, a cool-shadow / tungsten-highlight
   split tone, a soft vignette and fine animated grain. Subtle by design. */
import * as THREE from "three";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

const GradeShader = {
    uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uLift: { value: new THREE.Vector3(0.012, 0.012, 0.022) },
        uGamma: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
        uGain: { value: new THREE.Vector3(1.03, 1.0, 0.95) },
        uShadowTint: { value: new THREE.Color(0x2c4a6a) },
        uHighTint: { value: new THREE.Color(0xffc886) },
        uSplit: { value: 0.16 },
        uSaturation: { value: 1.04 },
        uVignette: { value: 0.32 },
        uGrain: { value: 0.035 },
        uAspect: { value: 1.6 },
    },
    vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`
        uniform sampler2D tDiffuse;
        uniform float uTime, uSplit, uSaturation, uVignette, uGrain, uAspect;
        uniform vec3 uLift, uGamma, uGain, uShadowTint, uHighTint;
        varying vec2 vUv;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        void main() {
            vec4 src = texture2D(tDiffuse, vUv);
            vec3 c = clamp(src.rgb, 0.0, 1.0);
            c = pow(max(c * uGain + uLift * (1.0 - c), 0.0), 1.0 / uGamma);
            float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
            vec3 tint = mix(uShadowTint, uHighTint, smoothstep(0.08, 0.78, l));
            c = mix(c, c * (tint * 2.0), uSplit * (1.0 - abs(l - 0.45)));
            c = mix(vec3(l), c, uSaturation);
            vec2 d = (vUv - 0.5) * vec2(uAspect, 1.0);
            c *= 1.0 - uVignette * smoothstep(0.35, 1.15, length(d));
            float g = hash(vUv * vec2(1931.0, 1213.0) + fract(uTime * 7.31)) - 0.5;
            c += g * uGrain * (1.0 - l * 0.6);
            gl_FragColor = vec4(c, src.a);
        }`,
};

export function createGradePass() {
    const pass = new ShaderPass(GradeShader);
    pass.setLook = function ({ zone = "street", outside = true, daylight = 0, reduced = false, grain = true } = {}) {
        const u = this.uniforms;
        const club = zone === "club" || zone === "lounge";
        u.uSplit.value = reduced ? 0 : club ? 0.1 : outside ? 0.1 + (1 - daylight) * 0.1 : 0.12;
        u.uVignette.value = reduced ? 0.12 : outside ? 0.26 + (1 - daylight) * 0.12 : 0.34;
        u.uGrain.value = reduced || !grain ? 0 : 0.03 + (1 - daylight) * 0.015;
        u.uSaturation.value = club ? 1.08 : outside ? 0.96 + daylight * 0.08 : 1.02;
        u.uGain.value.set(1.03, 1.0, outside && daylight > 0.5 ? 0.98 : 0.94);
    };
    return pass;
}
