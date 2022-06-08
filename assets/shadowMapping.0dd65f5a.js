import"./modulepreload-polyfill.b7f2da20.js";import{v as G,i as M,a as V,b as T,c as C,d as z}from"./box.fffb8d82.js";import{g as b,c as D,f as y,l as E,o as R,m as N,a as A}from"./math.cb05c6db.js";var F=`@group(0) @binding(0) var<storage> modelViews : array<mat4x4<f32>>;
@group(0) @binding(1) var<uniform> cameraProjection : mat4x4<f32>;
@group(0) @binding(2) var<uniform> lightProjection : mat4x4<f32>;
@group(0) @binding(3) var<storage> colors : array<vec4<f32>>;

struct VertexOutput {
    @builtin(position) Position: vec4<f32>,
    @location(0) fragPosition: vec3<f32>,
    @location(1) fragNormal: vec3<f32>,
    @location(2) fragUV: vec2<f32>,
    @location(3) shadowPos: vec3<f32>,
    @location(4) fragColor: vec4<f32>
};

@stage(vertex)
fn main(
    @builtin(instance_index) index : u32,
    @location(0) position : vec3<f32>,
    @location(1) normal : vec3<f32>,
    @location(2) uv : vec2<f32>
) -> VertexOutput {
    let modelview = modelViews[index];
    let mvp = cameraProjection * modelview;
    let pos = vec4<f32>(position, 1.0);
    let posFromLight: vec4<f32> = lightProjection * modelview * pos;
    let posFromCamera: vec4<f32> = mvp * pos;
    
    var output : VertexOutput;
    output.Position = posFromCamera;
    // Convert shadowPos XY to (0, 1) to fit texture UV
    output.shadowPos = vec3<f32>(posFromLight.xy * vec2<f32>(0.5, -0.5) + vec2<f32>(0.5, 0.5), posFromLight.z);
    output.fragPosition = (modelview * pos).xyz;
    output.fragNormal =  (modelview * vec4<f32>(normal, 0.0)).xyz;
    output.fragUV = uv;
    output.fragColor = colors[index];
    return output;
}
`,_=`@group(1) @binding(0) var<uniform> lightPosition : vec4<f32>;
@group(1) @binding(1) var shadowMap: texture_depth_2d;
@group(1) @binding(2) var shadowSampler: sampler_comparison;

@stage(fragment)
fn main(
    @location(0) fragPosition : vec3<f32>,
    @location(1) fragNormal: vec3<f32>,
    @location(2) fragUV: vec2<f32>,
    @location(3) shadowPos: vec3<f32>,
    @location(4) fragColor: vec4<f32>
) -> @location(0) vec4<f32> {
    let objectColor = fragColor.rgb;
    // Directional Light
    let diffuse: f32 = max(dot(normalize(lightPosition.xyz), fragNormal), 0.0);
    // add shadow
    var shadow : f32 = 0.0;
    // apply Percentage-closer filtering (PCF)
    // sample nearest 9 texels to smooth result
    let size = f32(textureDimensions(shadowMap).x);
    let oneOverSize = 1.0 / size;
    for (var y : i32 = -1 ; y <= 1 ; y = y + 1) {
        for (var x : i32 = -1 ; x <= 1 ; x = x + 1) {
            let offset : vec2<f32> = vec2<f32>(
            f32(x) * oneOverSize,
            f32(y) * oneOverSize);

            shadow = shadow + textureSampleCompare(
            shadowMap, shadowSampler,
            shadowPos.xy + offset, shadowPos.z - 0.005); // apply a small bias to avoid acne
        }
    }
    shadow = shadow / 9.0;
    // ambient + diffuse * shadow
    let lightFactor = min(0.3 + shadow * diffuse, 1.0);
    return vec4<f32>(objectColor * lightFactor, 1.0);
}`,I=`@group(0) @binding(0) var<storage> modelViews : array<mat4x4<f32>>;
@group(0) @binding(1) var<uniform> lightProjection : mat4x4<f32>;

@stage(vertex)
fn main(
    @builtin(instance_index) index : u32,
    @location(0) position : vec3<f32>,
    @location(1) normal : vec3<f32>,
    @location(2) uv : vec2<f32>,
) -> @builtin(position) vec4<f32> {
    let modelview = modelViews[index];
    let pos = vec4(position, 1.0);
    return lightProjection * modelview * pos;
}
`;async function L(e){if(!navigator.gpu)throw new Error("Not Support WebGPU");const s=await navigator.gpu.requestAdapter();if(!s)throw new Error("No Adapter Found");const r=await s.requestDevice(),u=e.getContext("webgpu"),f=navigator.gpu.getPreferredCanvasFormat?navigator.gpu.getPreferredCanvasFormat():u.getPreferredFormat(s),i=window.devicePixelRatio||1;e.width=e.clientWidth*i,e.height=e.clientHeight*i;const t={width:e.width,height:e.height};return u.configure({device:r,format:f,alphaMode:"opaque"}),{device:r,context:u,format:f,size:t}}async function q(e,s,r){const u=[{arrayStride:32,attributes:[{shaderLocation:0,offset:0,format:"float32x3"},{shaderLocation:1,offset:12,format:"float32x3"},{shaderLocation:2,offset:24,format:"float32x2"}]}],f={topology:"triangle-list",cullMode:"back"},i={depthWriteEnabled:!0,depthCompare:"less",format:"depth32float"},t=await e.createRenderPipelineAsync({label:"Basic Pipline",layout:"auto",vertex:{module:e.createShaderModule({code:F}),entryPoint:"main",buffers:u},fragment:{module:e.createShaderModule({code:_}),entryPoint:"main",targets:[{format:s}]},primitive:f,depthStencil:i}),l=await e.createRenderPipelineAsync({layout:"auto",vertex:{module:e.createShaderModule({code:I}),entryPoint:"main",buffers:u},primitive:f,depthStencil:i}),g=e.createTexture({size:r,format:"depth32float",usage:GPUTextureUsage.RENDER_ATTACHMENT}),v=g.createView(),h=e.createTexture({size:[2048,2048,1],usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING,format:"depth32float"}),p=h.createView(),x={vertex:e.createBuffer({label:"GPUBuffer store vertex",size:G.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),index:e.createBuffer({label:"GPUBuffer store vertex index",size:M.byteLength,usage:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST})},w={vertex:e.createBuffer({label:"GPUBuffer store vertex",size:V.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),index:e.createBuffer({label:"GPUBuffer store vertex index",size:T.byteLength,usage:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST})};e.queue.writeBuffer(x.vertex,0,G),e.queue.writeBuffer(x.index,0,M),e.queue.writeBuffer(w.vertex,0,V),e.queue.writeBuffer(w.index,0,T);const m=e.createBuffer({label:"GPUBuffer store n*4x4 matrix",size:4*4*4*d,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),P=e.createBuffer({label:"GPUBuffer for camera projection",size:4*4*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),n=e.createBuffer({label:"GPUBuffer for light projection",size:4*4*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),a=e.createBuffer({label:"GPUBuffer store n*4 color",size:4*4*d,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),o=e.createBuffer({label:"GPUBuffer store 4x4 matrix",size:4*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),c=e.createBindGroup({label:"Group for renderPass",layout:t.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:m}},{binding:1,resource:{buffer:P}},{binding:2,resource:{buffer:n}},{binding:3,resource:{buffer:a}}]}),B=e.createBindGroup({label:"Group for fragment",layout:t.getBindGroupLayout(1),entries:[{binding:0,resource:{buffer:o}},{binding:1,resource:p},{binding:2,resource:e.createSampler({compare:"less"})}]}),U=e.createBindGroup({label:"Group for shadowPass",layout:l.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:m}},{binding:1,resource:{buffer:n}}]});return{renderPipeline:t,shadowPipeline:l,boxBuffer:x,sphereBuffer:w,modelViewBuffer:m,cameraProjectionBuffer:P,lightProjectionBuffer:n,colorBuffer:a,lightBuffer:o,vsGroup:c,fsGroup:B,shadowGroup:U,renderDepthTexture:g,renderDepthView:v,shadowDepthTexture:h,shadowDepthView:p}}function O(e,s,r){const u=e.createCommandEncoder(),f={colorAttachments:[],depthStencilAttachment:{view:r.shadowDepthView,depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store"}},i={colorAttachments:[{view:s.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:1},loadOp:"clear",storeOp:"store"}],depthStencilAttachment:{view:r.renderDepthView,depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store"}};{const t=u.beginRenderPass(f);t.setPipeline(r.shadowPipeline),t.setBindGroup(0,r.shadowGroup),t.setVertexBuffer(0,r.boxBuffer.vertex),t.setIndexBuffer(r.boxBuffer.index,"uint16"),t.drawIndexed(C,2,0,0,0),t.setVertexBuffer(0,r.sphereBuffer.vertex),t.setIndexBuffer(r.sphereBuffer.index,"uint16"),t.drawIndexed(z,d-2,0,0,d/2),t.end()}{const t=u.beginRenderPass(i);t.setPipeline(r.renderPipeline),t.setBindGroup(0,r.vsGroup),t.setBindGroup(1,r.fsGroup),t.setVertexBuffer(0,r.boxBuffer.vertex),t.setIndexBuffer(r.boxBuffer.index,"uint16"),t.drawIndexed(C,2,0,0,0),t.setVertexBuffer(0,r.sphereBuffer.vertex),t.setIndexBuffer(r.sphereBuffer.index,"uint16"),t.drawIndexed(z,d-2,0,0,d/2),t.end()}e.queue.submit([u.finish()])}const d=30;async function Y(){const e=document.querySelector("canvas");if(!e)throw new Error("No Canvas");const{device:s,context:r,format:u,size:f}=await L(e),i=await q(s,u,f),t=[],l=new Float32Array(d*4*4),g=new Float32Array(d*4);{const n={x:0,y:0,z:-20},a={x:0,y:Math.PI/4,z:0},o={x:2,y:20,z:2},c=b(n,a,o);l.set(c,0*4*4),g.set([.5,.5,.5,1],0*4),t.push({position:n,rotation:a,scale:o})}{const n={x:0,y:-10,z:-20},a={x:0,y:0,z:0},o={x:50,y:.5,z:40},c=b(n,a,o);l.set(c,1*4*4),g.set([1,1,1,1],1*4),t.push({position:n,rotation:a,scale:o})}for(let n=2;n<d;n++){const a=Math.random()>.5?1:-1,o={x:(1+Math.random()*12)*a,y:-8+Math.random()*15,z:-20+(1+Math.random()*12)*a},c={x:Math.random(),y:Math.random(),z:Math.random()},B=Math.max(.5,Math.random()),U={x:B,y:B,z:B},S=b(o,c,U);l.set(S,n*4*4),g.set([Math.random(),Math.random(),Math.random(),1],n*4),t.push({position:o,rotation:c,scale:U,y:o.y,v:Math.max(.09,Math.random()/10)*a})}s.queue.writeBuffer(i.colorBuffer,0,g);const v=D(),h=D(),p=y(0,100,0),x=y(0,1,0),w=y(0,0,0);function m(){const n=performance.now();p[0]=Math.sin(n/1500)*50,p[2]=Math.cos(n/1500)*50,E(v,p,w,x),R(h,-80,80,-80,80,-200,200),N(h,h,v),s.queue.writeBuffer(i.lightProjectionBuffer,0,h),s.queue.writeBuffer(i.lightBuffer,0,p);for(let a=2;a<d;a++){const o=t[a];o.position.y+=o.v,(o.position.y<-9||o.position.y>9)&&(o.v*=-1);const c=b(o.position,o.rotation,o.scale);l.set(c,a*4*4)}s.queue.writeBuffer(i.modelViewBuffer,0,l),O(s,r,i),requestAnimationFrame(m)}m();function P(){const n=f.width/f.height,a=A(n,60/180*Math.PI,.1,1e3,{x:0,y:10,z:20});s.queue.writeBuffer(i.cameraProjectionBuffer,0,a)}P(),window.addEventListener("resize",()=>{f.width=e.width=e.clientWidth*devicePixelRatio,f.height=e.height=e.clientHeight*devicePixelRatio,i.renderDepthTexture.destroy(),i.renderDepthTexture=s.createTexture({size:f,format:"depth32float",usage:GPUTextureUsage.RENDER_ATTACHMENT}),i.renderDepthView=i.renderDepthTexture.createView(),P()})}Y();
