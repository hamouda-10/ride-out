import { HERO_SLIDES, TankMark } from '../data/catalog';

// ============================================================================
// 1. Cubic Bezier (0.51, 0, 0, 0.98) — forward & inverse via 24-step bisection
// ============================================================================

const P1X = 0.51;
const P1Y = 0;
const P2X = 0;
const P2Y = 0.98;

function sampleCurve(t: number, p1: number, p2: number): number {
  const mt = 1 - t;
  return 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t;
}

export function ease(x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  let lo = 0;
  let hi = 1;
  let t = x;
  for (let i = 0; i < 24; i++) {
    t = 0.5 * (lo + hi);
    const val = sampleCurve(t, P1X, P2X);
    if (val < x) lo = t;
    else hi = t;
  }
  return sampleCurve(0.5 * (lo + hi), P1Y, P2Y);
}

export function inverseEase(y: number): number {
  if (y <= 0) return 0;
  if (y >= 1) return 1;
  let lo = 0;
  let hi = 1;
  let t = y;
  for (let i = 0; i < 24; i++) {
    t = 0.5 * (lo + hi);
    const val = sampleCurve(t, P1Y, P2Y);
    if (val < y) lo = t;
    else hi = t;
  }
  return sampleCurve(0.5 * (lo + hi), P1X, P2X);
}

// ============================================================================
// 2. Texture Cutting, Tank Mark Removal & 2048x1024 Composition (Section 11)
// ============================================================================

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

function sampleBilinearRGB(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  x: number,
  y: number
): [number, number, number] {
  const cx = clamp(x, 0, w - 1);
  const cy = clamp(y, 0, h - 1);
  const x0 = Math.floor(cx);
  const y0 = Math.floor(cy);
  const x1 = Math.min(w - 1, x0 + 1);
  const y1 = Math.min(h - 1, y0 + 1);
  const fx = cx - x0;
  const fy = cy - y0;

  const i00 = (y0 * w + x0) * 4;
  const i10 = (y0 * w + x1) * 4;
  const i01 = (y1 * w + x0) * 4;
  const i11 = (y1 * w + x1) * 4;

  const w00 = (1 - fx) * (1 - fy);
  const w10 = fx * (1 - fy);
  const w01 = (1 - fx) * fy;
  const w11 = fx * fy;

  return [
    data[i00] * w00 + data[i10] * w10 + data[i01] * w01 + data[i11] * w11,
    data[i00 + 1] * w00 + data[i10 + 1] * w10 + data[i01 + 1] * w01 + data[i11 + 1] * w11,
    data[i00 + 2] * w00 + data[i10 + 2] * w10 + data[i01 + 2] * w01 + data[i11 + 2] * w11,
  ];
}

function paintOutMark(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  mark: TankMark,
  boxLeft: number,
  boxTop: number,
  sheetScale: number
): void {
  const untouched = new Uint8ClampedArray(data);
  const x0 = (mark.x0 - boxLeft) * sheetScale;
  const y0 = (mark.y0 - boxTop) * sheetScale;
  const x1 = (mark.x1 - boxLeft) * sheetScale;
  const y1 = (mark.y1 - boxTop) * sheetScale;
  const half = mark.half * sheetScale;

  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  if (len <= 0) return;

  const ux = dx / len;
  const uy = dy / len;
  // Perpendicular pointing "below" the line (positive y in screen space)
  let nx = -uy;
  let ny = ux;
  if (ny < 0) {
    nx = -nx;
    ny = -ny;
  }

  const margin = 18 * sheetScale;
  const minPx = Math.max(0, Math.floor(Math.min(x0, x1) - margin));
  const maxPx = Math.min(w - 1, Math.ceil(Math.max(x0, x1) + margin));
  const minPy = Math.max(0, Math.floor(Math.min(y0, y1) - margin));
  const maxPy = Math.min(h - 1, Math.ceil(Math.max(y0, y1) + margin));

  const stepDist = half + 2 * sheetScale;
  const sampleSpread = 3 * sheetScale;

  for (let py = minPy; py <= maxPy; py++) {
    for (let px = minPx; px <= maxPx; px++) {
      const rx = px - x0;
      const ry = py - y0;
      const along = rx * ux + ry * uy;
      const n = rx * nx + ry * ny;

      const out = Math.max(-3 * sheetScale - along, along - len - 3 * sheetScale, 0);
      const band = clamp((half + 1.5 * sheetScale - Math.abs(n)) / (2.5 * sheetScale), 0, 1);
      const fade = Math.max(0, 1 - out / (4 * sheetScale));
      const weight = band * fade;
      if (weight <= 0) continue;

      const projX = x0 + along * ux;
      const projY = y0 + along * uy;

      // Upper side (-stepDist along n) & lower side (+stepDist along n)
      let ur = 0, ug = 0, ub = 0;
      let lr = 0, lg = 0, lb = 0;
      const offsets = [-sampleSpread, 0, sampleSpread];
      for (let k = 0; k < 3; k++) {
        const off = offsets[k];
        const up = sampleBilinearRGB(
          untouched,
          w,
          h,
          projX - stepDist * nx + off * ux,
          projY - stepDist * ny + off * uy
        );
        ur += up[0];
        ug += up[1];
        ub += up[2];

        const lo = sampleBilinearRGB(
          untouched,
          w,
          h,
          projX + stepDist * nx + off * ux,
          projY + stepDist * ny + off * uy
        );
        lr += lo[0];
        lg += lo[1];
        lb += lo[2];
      }
      ur /= 3; ug /= 3; ub /= 3;
      lr /= 3; lg /= 3; lb /= 3;

      const interp = clamp((n + half) / (2 * half), 0, 1);
      const fillR = ur + (lr - ur) * interp;
      const fillG = ug + (lg - ug) * interp;
      const fillB = ub + (lb - ub) * interp;

      const idx = (py * w + px) * 4;
      data[idx] = Math.round(data[idx] * (1 - weight) + fillR * weight);
      data[idx + 1] = Math.round(data[idx + 1] * (1 - weight) + fillG * weight);
      data[idx + 2] = Math.round(data[idx + 2] * (1 - weight) + fillB * weight);
    }
  }
}

function drawEllipticalShadow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  alpha: number
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(rx, ry);
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  grad.addColorStop(0, `rgba(10, 7, 10, ${alpha})`);
  grad.addColorStop(0.45, `rgba(10, 7, 10, ${alpha * 0.55})`);
  grad.addColorStop(1, 'rgba(10, 7, 10, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export interface BuiltTextures {
  textures: HTMLCanvasElement[];
  previewUrls: string[];
}

export function buildBikeTextures(img: HTMLImageElement): BuiltTextures {
  const sheetScale = (img.naturalWidth || 3840) / 3840;
  const textures: HTMLCanvasElement[] = [];
  const previewUrls: string[] = [];

  const BIKE_LEFT = 134;
  const BIKE_WIDTH = 1780;
  const GROUND_Y = 960;

  for (const slide of HERO_SLIDES) {
    const sx = Math.round(slide.bounds.left * sheetScale);
    const sy = Math.round(slide.bounds.top * sheetScale);
    const sw = Math.max(1, Math.round((slide.bounds.right - slide.bounds.left) * sheetScale));
    const sh = Math.max(1, Math.round((slide.bounds.bottom - slide.bounds.top) * sheetScale));

    // Cut & solidify
    const cutCanvas = document.createElement('canvas');
    cutCanvas.width = sw;
    cutCanvas.height = sh;
    const cutCtx = cutCanvas.getContext('2d', { willReadFrequently: true })!;
    cutCtx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

    const imgData = cutCtx.getImageData(0, 0, sw, sh);
    const px = imgData.data;
    for (let i = 3; i < px.length; i += 4) {
      const a = px[i];
      px[i] = a < 8 ? 0 : Math.min(255, Math.round(((a - 6) * 255) / 236));
    }

    // Paint out both tank marks
    for (const mark of slide.marks) {
      paintOutMark(px, sw, sh, mark, slide.bounds.left, slide.bounds.top, sheetScale);
    }

    cutCtx.putImageData(imgData, 0, 0);

    // Export clean studio preview image for catalog/compare cards
    const prevCanvas = document.createElement('canvas');
    const prevW = 880;
    const prevH = Math.round((sh / sw) * prevW);
    prevCanvas.width = prevW;
    prevCanvas.height = prevH + 40;
    const prevCtx = prevCanvas.getContext('2d')!;
    prevCtx.imageSmoothingEnabled = true;
    prevCtx.imageSmoothingQuality = 'high';
    drawEllipticalShadow(prevCtx, prevW * 0.5, prevH + 14, prevW * 0.44, 14, 0.22);
    prevCtx.drawImage(cutCanvas, 0, 0, sw, sh, 0, 12, prevW, prevH);
    previewUrls.push(prevCanvas.toDataURL('image/png'));

    // Compose 2048 x 1024 power-of-two texture
    const texCanvas = document.createElement('canvas');
    texCanvas.width = 2048;
    texCanvas.height = 1024;
    const texCtx = texCanvas.getContext('2d')!;
    texCtx.imageSmoothingEnabled = true;
    texCtx.imageSmoothingQuality = 'high';

    drawEllipticalShadow(texCtx, 1024, 954, 1010, 58, 0.30);
    drawEllipticalShadow(texCtx, 1024, 956, 720, 34, 0.26);
    drawEllipticalShadow(texCtx, BIKE_LEFT + 0.158 * BIKE_WIDTH, 957, 300, 26, 0.85);
    drawEllipticalShadow(texCtx, BIKE_LEFT + 0.843 * BIKE_WIDTH, 957, 300, 26, 0.85);

    const drawnHeight = (sh / sw) * BIKE_WIDTH;
    texCtx.drawImage(
      cutCanvas,
      0,
      0,
      sw,
      sh,
      BIKE_LEFT,
      GROUND_Y - drawnHeight,
      BIKE_WIDTH,
      drawnHeight
    );

    textures.push(texCanvas);
  }

  return { textures, previewUrls };
}

// ============================================================================
// 3. WebGL Vogel-Spiral Blur Renderer + 2D Canvas Fallback (Section 12)
// ============================================================================

const VERT_SRC = `
attribute vec2 aPos;
attribute vec2 aUv;
uniform vec2 uView;
varying vec2 vUv;
void main() {
  vec2 clip = (aPos / uView) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  vUv = aUv;
}
`;

const FRAG_SRC = `
precision highp float;
uniform sampler2D uTex;
uniform float uSigma;
uniform float uDpr;
uniform vec2 uQuadTexSize;
varying vec2 vUv;

void main() {
  if (uSigma <= 0.06) {
    gl_FragColor = texture2D(uTex, vUv, -0.35);
    return;
  }

  float rCss = 2.0 * uSigma;
  vec2 radiusUv = vec2(rCss / uQuadTexSize.x, rCss / uQuadTexSize.y);
  float mipBias = log2(max(1.0, uSigma * uDpr * 0.55));

  vec4 sum = vec4(0.0);
  float wSum = 0.0;

  for (int i = 0; i < 28; i++) {
    float f = float(i) + 0.5;
    float r = sqrt(f / 28.0);
    float angle = f * 2.399963;
    float w = exp(-2.0 * r * r);
    vec2 offset = vec2(cos(angle), sin(angle)) * r * radiusUv;
    vec2 sampleUv = vUv + offset;
    if (sampleUv.x >= 0.0 && sampleUv.x <= 1.0 && sampleUv.y >= 0.0 && sampleUv.y <= 1.0) {
      sum += texture2D(uTex, sampleUv, mipBias) * w;
    }
    wSum += w;
  }

  gl_FragColor = sum / wSum;
}
`;

export interface QuadDrawItem {
  slideIdx: number;
  left: number;
  top: number;
  width: number;
  height: number;
  sigma: number;
}

export class BikeRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null = null;
  private ctx2d: CanvasRenderingContext2D | null = null;
  private program: WebGLProgram | null = null;
  private buffer: WebGLBuffer | null = null;
  private glTextures: WebGLTexture[] = [];
  private sourceCanvases: HTMLCanvasElement[];
  private uView: WebGLUniformLocation | null = null;
  private uTex: WebGLUniformLocation | null = null;
  private uSigma: WebGLUniformLocation | null = null;
  private uDpr: WebGLUniformLocation | null = null;
  private uQuadTexSize: WebGLUniformLocation | null = null;
  private aPos = -1;
  private aUv = -1;
  public lost = false;

  constructor(canvas: HTMLCanvasElement, sourceCanvases: HTMLCanvasElement[]) {
    this.canvas = canvas;
    this.sourceCanvases = sourceCanvases;
    this.init();
  }

  public init(): boolean {
    const gl = this.canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
    });

    if (!gl) {
      this.ctx2d = this.canvas.getContext('2d');
      this.gl = null;
      return Boolean(this.ctx2d);
    }

    this.gl = gl;
    this.ctx2d = null;
    this.lost = false;

    const vs = this.compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
    const fs = this.compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    this.program = prog;
    this.aPos = gl.getAttribLocation(prog, 'aPos');
    this.aUv = gl.getAttribLocation(prog, 'aUv');
    this.uView = gl.getUniformLocation(prog, 'uView');
    this.uTex = gl.getUniformLocation(prog, 'uTex');
    this.uSigma = gl.getUniformLocation(prog, 'uSigma');
    this.uDpr = gl.getUniformLocation(prog, 'uDpr');
    this.uQuadTexSize = gl.getUniformLocation(prog, 'uQuadTexSize');

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(this.aPos);
    gl.enableVertexAttribArray(this.aUv);
    gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(this.aUv, 2, gl.FLOAT, false, 16, 8);

    const anisoExt =
      gl.getExtension('EXT_texture_filter_anisotropic') ||
      gl.getExtension('WEBKIT_EXT_TEXTURE_FILTER_ANISOTROPIC') ||
      gl.getExtension('MOZ_EXT_TEXTURE_FILTER_ANISOTROPIC');

    this.glTextures = this.sourceCanvases.map((texCanvas) => {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texCanvas);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
      if (anisoExt) {
        const maxAniso = gl.getParameter(anisoExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 4;
        gl.texParameterf(
          gl.TEXTURE_2D,
          anisoExt.TEXTURE_MAX_ANISOTROPY_EXT,
          Math.min(4, maxAniso)
        );
      }
      return tex;
    });

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    return true;
  }

  private compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    return shader;
  }

  public render(W: number, H: number, dpr: number, quads: QuadDrawItem[]): void {
    if (this.lost) return;

    if (this.gl && this.program) {
      const gl = this.gl;
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(this.program);
      gl.uniform2f(this.uView, W, H);
      gl.uniform1f(this.uDpr, dpr);
      gl.uniform1i(this.uTex, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

      for (const q of quads) {
        const pad = q.sigma > 0.06 ? 2.2 * q.sigma : 0;
        const x0 = q.left - pad;
        const y0 = q.top - pad;
        const x1 = q.left + q.width + pad;
        const y1 = q.top + q.height + pad;

        const u0 = -pad / q.width;
        const v0 = -pad / q.height;
        const u1 = 1 + pad / q.width;
        const v1 = 1 + pad / q.height;

        const verts = new Float32Array([
          x0, y0, u0, v0,
          x1, y0, u1, v0,
          x0, y1, u0, v1,
          x0, y1, u0, v1,
          x1, y0, u1, v0,
          x1, y1, u1, v1,
        ]);

        gl.bindTexture(gl.TEXTURE_2D, this.glTextures[q.slideIdx]);
        gl.uniform1f(this.uSigma, q.sigma);
        gl.uniform2f(this.uQuadTexSize, q.width, q.height);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STREAM_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
    } else if (this.ctx2d) {
      const ctx = this.ctx2d;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.scale(dpr, dpr);
      for (const q of quads) {
        ctx.save();
        if (q.sigma > 0.06) {
          ctx.filter = `blur(${(q.sigma * dpr).toFixed(2)}px)`;
        } else {
          ctx.filter = 'none';
        }
        ctx.drawImage(this.sourceCanvases[q.slideIdx], q.left, q.top, q.width, q.height);
        ctx.restore();
      }
      ctx.restore();
    }
  }

  public dispose(): void {
    if (this.gl) {
      for (const tex of this.glTextures) {
        this.gl.deleteTexture(tex);
      }
      if (this.buffer) this.gl.deleteBuffer(this.buffer);
      if (this.program) this.gl.deleteProgram(this.program);
    }
    this.glTextures = [];
  }
}

// ============================================================================
// 4. Responsive Tiers & Geometry (Section 5)
// ============================================================================

export type Tier = 'wide' | 'short' | 'tall';

export interface HeroGeometry {
  W: number;
  H: number;
  tier: Tier;
  cols3: boolean;
  narrow: boolean;
  roomy: boolean;
  tablet: boolean;
  uCss: number;
  wordLeft: number;
  wordTop: number;
  wordWidth: number;
  wordHeight: number;
  bikeCenterX: number;
  bikeCenterY: number;
  bikeWidth: number;
  groundY: number;
  step: number;
  arrowDiameter: number;
  prevArrow: { x: number; y: number };
  nextArrow: { x: number; y: number };
}

export function determineTierAndModifiers(W: number, H: number) {
  const ratio = W / Math.max(1, H);
  let tier: Tier = 'wide';
  if (ratio < 1.2) tier = 'tall';
  else if (H <= 500 || W < 900) tier = 'short';

  const cols3 = (tier === 'tall' && W >= 560) || (tier === 'short' && W < 840);
  const narrow = tier === 'tall' && W < 360;
  const roomy = tier === 'tall' && W < 560 && H >= 720;
  const tablet = tier === 'tall' && W >= 580 && H >= 900;
  const uCss = tier === 'wide' ? Math.min(W / 1440, H / 810) : 1;

  return { tier, cols3, narrow, roomy, tablet, uCss };
}

export function computeHeroGeometry(W: number, H: number, panelTop: number): HeroGeometry {
  const { tier, cols3, narrow, roomy, tablet, uCss } = determineTierAndModifiers(W, H);

  if (tier === 'wide') {
    const u = Math.min(W / 1440, H / 810);
    const ox = W / 2 - 720 * u;
    let oy = (H - 810 * u) * 0.5;
    const room = panelTop - 8 - (oy + 628 * u);
    if (room < 0) oy += room;

    return {
      W,
      H,
      tier,
      cols3,
      narrow,
      roomy,
      tablet,
      uCss,
      wordLeft: ox + 22.5 * u,
      wordTop: oy + 159 * u,
      wordWidth: 1357 * u,
      wordHeight: 198.5 * u,
      bikeCenterX: ox + 710 * u,
      bikeCenterY: oy + 427 * u,
      bikeWidth: 762 * u,
      groundY: oy + 628 * u,
      step: 776 * u,
      arrowDiameter: Math.max(28, 36 * u),
      prevArrow: { x: ox + 229 * u, y: oy + 433 * u },
      nextArrow: { x: ox + 1197.5 * u, y: oy + 433 * u },
    };
  }

  if (tier === 'short') {
    const navBottom = 46;
    const band = Math.max(100, panelTop - navBottom);
    const u = Math.min(W / 1440, (band - 10) / 478);
    const ox = W / 2 - 720 * u;
    const oy = 46 + (band - 478 * u) / 2 - 150 * u;

    return {
      W,
      H,
      tier,
      cols3,
      narrow,
      roomy,
      tablet,
      uCss,
      wordLeft: ox + 22.5 * u,
      wordTop: oy + 159 * u,
      wordWidth: 1357 * u,
      wordHeight: 198.5 * u,
      bikeCenterX: ox + 710 * u,
      bikeCenterY: oy + 427 * u,
      bikeWidth: 762 * u,
      groundY: oy + 628 * u,
      step: 776 * u,
      arrowDiameter: Math.max(28, 36 * u),
      prevArrow: { x: ox + 229 * u, y: oy + 433 * u },
      nextArrow: { x: ox + 1197.5 * u, y: oy + 433 * u },
    };
  }

  // Tall tier
  const navBottom = tablet ? 84 : 58;
  const band = Math.max(140, panelTop - navBottom);
  const wordK = (W - 14) / 1357;
  const bikeW = 0.92 * W;
  const overlap = 0.34 * 198.5 * wordK;
  const bikeH = 0.527 * bikeW;
  const d = tablet ? 54 : H >= 720 ? 44 : 38;
  const gap = 12 + d;
  const k = Math.min(1, (band - 16 - gap) / (overlap + bikeH));
  const top = navBottom + (band - (overlap + bikeH) * k - gap) / 2;

  const wordWidth = 1357 * wordK * k;
  const wordHeight = 198.5 * wordK * k;
  const finalBikeW = bikeW * k;
  const bikeCenterY = top + overlap * k + (bikeH * k) / 2;
  const groundY = top + (overlap + bikeH) * k;
  const step = W / 2 - 0.022 * W + (finalBikeW * 0.596774) / 2;

  return {
    W,
    H,
    tier,
    cols3,
    narrow,
    roomy,
    tablet,
    uCss,
    wordLeft: (W - wordWidth) / 2,
    wordTop: top,
    wordWidth,
    wordHeight,
    bikeCenterX: W / 2,
    bikeCenterY,
    bikeWidth: finalBikeW,
    groundY,
    step,
    arrowDiameter: d,
    prevArrow: { x: W / 2 - 0.85 * d, y: groundY + 12 + d / 2 },
    nextArrow: { x: W / 2 + 0.85 * d, y: groundY + 12 + d / 2 },
  };
}

// ============================================================================
// 5. Background 12-Stop Gradient & Dot Grid (Section 7)
// ============================================================================

const GRADIENT_STOPS: { row: number; amount: number }[] = [
  { row: 0, amount: -0.34 },
  { row: 70, amount: -0.26 },
  { row: 120, amount: -0.20 },
  { row: 200, amount: -0.08 },
  { row: 248, amount: 0 },
  { row: 300, amount: 0.08 },
  { row: 380, amount: 0.21 },
  { row: 450, amount: 0.36 },
  { row: 530, amount: 0.53 },
  { row: 610, amount: 0.66 },
  { row: 700, amount: 0.755 },
  { row: 810, amount: 0.82 },
];

function mapFrameRowToPixel(row: number, wordTop: number, groundY: number, H: number): number {
  let px = 0;
  if (row <= 159) {
    px = (row / 159) * wordTop;
  } else if (row <= 628) {
    px = wordTop + ((row - 159) / (628 - 159)) * (groundY - wordTop);
  } else {
    px = groundY + ((row - 628) / (810 - 628)) * (H - groundY);
  }
  return clamp(px, 0, H);
}

export function mod4(n: number): number {
  return ((n % 4) + 4) % 4;
}

export function computeInterpolatedColor(pos: number): [number, number, number] {
  const f = Math.floor(pos);
  const frac = pos - f;
  const c0 = HERO_SLIDES[mod4(f)].rgb;
  const c1 = HERO_SLIDES[mod4(f + 1)].rgb;
  return [
    c0[0] + (c1[0] - c0[0]) * frac,
    c0[1] + (c1[1] - c0[1]) * frac,
    c0[2] + (c1[2] - c0[2]) * frac,
  ];
}

export function computeBackgroundGradient(
  pos: number,
  wordTop: number,
  groundY: number,
  H: number
): string {
  const [r, g, b] = computeInterpolatedColor(pos);
  const stops = GRADIENT_STOPS.map(({ row, amount }) => {
    let sr: number, sg: number, sb: number;
    if (amount < 0) {
      const k = 1 + amount;
      sr = Math.round(r * k);
      sg = Math.round(g * k);
      sb = Math.round(b * k);
    } else {
      sr = Math.round(r + (255 - r) * amount);
      sg = Math.round(g + (255 - g) * amount);
      sb = Math.round(b + (255 - b) * amount);
    }
    const yPx = mapFrameRowToPixel(row, wordTop, groundY, H);
    return `rgb(${sr},${sg},${sb}) ${yPx.toFixed(1)}px`;
  });
  return `linear-gradient(to bottom, ${stops.join(', ')})`;
}

// ============================================================================
// 6. Letter-Fitted RIDE OUT SVG Metrics (Section 6)
// ============================================================================

export interface FittedLetter {
  char: string;
  fontSize: number;
  transform: string;
}

const LETTER_BOXES: { char: string; left: number; right: number }[] = [
  { char: 'R', left: 22.5, right: 185 },
  { char: 'I', left: 214.5, right: 245.5 },
  { char: 'D', left: 282.5, right: 464 },
  { char: 'E', left: 495, right: 640 },
  { char: 'O', left: 760, right: 978 },
  { char: 'U', left: 1010, right: 1187 },
  { char: 'T', left: 1212, right: 1379.5 },
];

export function fitRideOutLetters(): FittedLetter[] | null {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  if (!ctx) return null;

  ctx.font = '450 100px "Albert Sans", Arial, sans-serif';
  const mT = ctx.measureText('T');
  const ascent = mT.actualBoundingBoxAscent;
  if (!ascent) return null;

  const size = (100 * 198.5) / ascent;
  ctx.font = `450 ${size}px "Albert Sans", Arial, sans-serif`;

  return LETTER_BOXES.map(({ char, left, right }) => {
    const m = ctx.measureText(char);
    const inkW = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
    const sx = inkW > 0 ? (right - left) / inkW : 1;
    const tx = left - 22.5 + m.actualBoundingBoxLeft * sx;
    return {
      char,
      fontSize: size,
      transform: `translate(${tx.toFixed(2)} ${198.5}) scale(${sx.toFixed(5)} 1)`,
    };
  });
}
