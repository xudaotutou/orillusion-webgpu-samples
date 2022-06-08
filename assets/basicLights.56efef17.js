import"./modulepreload-polyfill.b7f2da20.js";import{v as P,i as U,a as w,b,c as C,d as L}from"./box.fffb8d82.js";import{g as M,a as T}from"./math.cb05c6db.js";var E=`@group(0) @binding(0) var<storage> modelViews : array<mat4x4<f32>>;
@group(0) @binding(1) var<uniform> projection : mat4x4<f32>;
@group(0) @binding(2) var<storage> colors : array<vec4<f32>>;

struct VertexOutput {
    @builtin(position) Position : vec4<f32>,
    @location(0) fragPosition : vec3<f32>,
    @location(1) fragNormal : vec3<f32>,
    @location(2) fragUV: vec2<f32>,
    @location(3) fragColor: vec4<f32>
};

@stage(vertex)
fn main(
    @builtin(instance_index) index : u32,
    @location(0) position : vec3<f32>,
    @location(1) normal : vec3<f32>,
    @location(2) uv : vec2<f32>,
) -> VertexOutput {
    let modelview = modelViews[index];
    let mvp = projection * modelview;
    let pos = vec4<f32>(position, 1.0);
    
    var output : VertexOutput;
    output.Position = mvp * pos;
    output.fragPosition = (modelview * pos).xyz;
    // it should use transpose(inverse(modelview)) if consider non-uniform scale
    // hint: inverse() is not available in wgsl, better do in JS or CS
    output.fragNormal =  (modelview * vec4<f32>(normal, 0.0)).xyz;
    output.fragUV = uv;
    output.fragColor = colors[index];
    return output;
}
`,R=`@group(1) @binding(0) var<uniform> ambientIntensity : f32;
@group(1) @binding(1) var<uniform> pointLight : array<vec4<f32>, 2>;
@group(1) @binding(2) var<uniform> directionLight : array<vec4<f32>, 2>;

@stage(fragment)
fn main(
    @location(0) fragPosition : vec3<f32>,
    @location(1) fragNormal: vec3<f32>,
    @location(2) fragUV: vec2<f32>,
    @location(3) fragColor: vec4<f32>
) -> @location(0) vec4<f32> {
    let objectColor = fragColor.rgb;
    let ambintLightColor = vec3(1.0,1.0,1.0);
    let pointLightColor = vec3(1.0,1.0,1.0);
    let dirLightColor = vec3(1.0,1.0,1.0);

    var lightResult = vec3(0.0, 0.0, 0.0);
    // ambient
    lightResult += ambintLightColor * ambientIntensity;
    // Directional Light
    var directionPosition = directionLight[0].xyz;
    var directionIntensity: f32 = directionLight[1][0];
    var diffuse: f32 = max(dot(normalize(directionPosition), fragNormal), 0.0);
    lightResult += dirLightColor * directionIntensity * diffuse;
    // Point Light
    var pointPosition = pointLight[0].xyz;
    var pointIntensity: f32 = pointLight[1][0];
    var pointRadius: f32 = pointLight[1][1];
    var L = pointPosition - fragPosition;
    var distance = length(L);
    if(distance < pointRadius){
        var diffuse: f32 = max(dot(normalize(L), fragNormal), 0.0);
        var distanceFactor: f32 = pow(1.0 - distance / pointRadius, 2.0);
        lightResult += pointLightColor * pointIntensity * diffuse * distanceFactor;
    }

    return vec4<f32>(objectColor * lightResult, 1.0);
}`;async function S(e){if(!navigator.gpu)throw new Error("Not Support WebGPU");const n=await navigator.gpu.requestAdapter();if(!n)throw new Error("No Adapter Found");const o=await n.requestDevice(),a=e.getContext("webgpu"),i=navigator.gpu.getPreferredCanvasFormat?navigator.gpu.getPreferredCanvasFormat():a.getPreferredFormat(n),t=window.devicePixelRatio||1;e.width=e.clientWidth*t,e.height=e.clientHeight*t;const u={width:e.width,height:e.height};return a.configure({device:o,format:i,alphaMode:"opaque"}),{device:o,context:a,format:i,size:u}}async function V(e,n,o){const a=await e.createRenderPipelineAsync({label:"Basic Pipline",layout:"auto",vertex:{module:e.createShaderModule({code:E}),entryPoint:"main",buffers:[{arrayStride:32,attributes:[{shaderLocation:0,offset:0,format:"float32x3"},{shaderLocation:1,offset:12,format:"float32x3"},{shaderLocation:2,offset:24,format:"float32x2"}]}]},fragment:{module:e.createShaderModule({code:R}),entryPoint:"main",targets:[{format:n}]},primitive:{topology:"triangle-list",cullMode:"back"},depthStencil:{depthWriteEnabled:!0,depthCompare:"less",format:"depth24plus"}}),i=e.createTexture({size:o,format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}),t=i.createView(),u={vertex:e.createBuffer({label:"GPUBuffer store vertex",size:P.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),index:e.createBuffer({label:"GPUBuffer store vertex index",size:U.byteLength,usage:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST})},l={vertex:e.createBuffer({label:"GPUBuffer store vertex",size:w.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),index:e.createBuffer({label:"GPUBuffer store vertex index",size:b.byteLength,usage:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST})};e.queue.writeBuffer(u.vertex,0,P),e.queue.writeBuffer(u.index,0,U),e.queue.writeBuffer(l.vertex,0,w),e.queue.writeBuffer(l.index,0,b);const d=e.createBuffer({label:"GPUBuffer store n*4x4 matrix",size:4*4*4*s,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),f=e.createBuffer({label:"GPUBuffer store 4x4 matrix",size:4*4*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),c=e.createBuffer({label:"GPUBuffer store n*4 color",size:4*4*s,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),h=e.createBindGroup({label:"Uniform Group with matrix",layout:a.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:d}},{binding:1,resource:{buffer:f}},{binding:2,resource:{buffer:c}}]}),g=e.createBuffer({label:"GPUBuffer store 4x4 matrix",size:1*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),p=e.createBuffer({label:"GPUBuffer store 4x4 matrix",size:8*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),m=e.createBuffer({label:"GPUBuffer store 4x4 matrix",size:8*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),x=e.createBindGroup({label:"Uniform Group with matrix",layout:a.getBindGroupLayout(1),entries:[{binding:0,resource:{buffer:g}},{binding:1,resource:{buffer:p}},{binding:2,resource:{buffer:m}}]});return{pipeline:a,boxBuffer:u,sphereBuffer:l,modelViewBuffer:d,projectionBuffer:f,colorBuffer:c,vsGroup:h,ambientBuffer:g,pointBuffer:p,directionalBuffer:m,lightGroup:x,depthTexture:i,depthView:t}}function z(e,n,o){const a=e.createCommandEncoder(),i={colorAttachments:[{view:n.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:1},loadOp:"clear",storeOp:"store"}],depthStencilAttachment:{view:o.depthView,depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store"}},t=a.beginRenderPass(i);t.setPipeline(o.pipeline),t.setBindGroup(0,o.vsGroup),t.setBindGroup(1,o.lightGroup),t.setVertexBuffer(0,o.boxBuffer.vertex),t.setIndexBuffer(o.boxBuffer.index,"uint16"),t.drawIndexed(C,s/2,0,0,0),t.setVertexBuffer(0,o.sphereBuffer.vertex),t.setIndexBuffer(o.sphereBuffer.index,"uint16"),t.drawIndexed(L,s/2,0,0,s/2),t.end(),e.queue.submit([a.finish()])}const s=500;async function q(){var p,m,x,v;const e=document.querySelector("canvas");if(!e)throw new Error("No Canvas");const{device:n,context:o,format:a,size:i}=await S(e),t=await V(n,a,i),u=new Float32Array(s*4*4),l=new Float32Array(s*4);for(let r=0;r<s;r++){const B={x:Math.random()*40-20,y:Math.random()*40-20,z:-50-Math.random()*50},G={x:Math.random(),y:Math.random(),z:Math.random()},y=M(B,G,{x:1,y:1,z:1});u.set(y,r*4*4),l.set([Math.random(),Math.random(),Math.random(),1],r*4)}n.queue.writeBuffer(t.colorBuffer,0,l),n.queue.writeBuffer(t.modelViewBuffer,0,u);const d=new Float32Array([.1]),f=new Float32Array(8);f[2]=-50,f[4]=1,f[5]=20;const c=new Float32Array(8);c[4]=.5;function h(){const r=performance.now();f[0]=10*Math.sin(r/1e3),f[1]=10*Math.cos(r/1e3),f[2]=-60+10*Math.cos(r/1e3),c[0]=Math.sin(r/1500),c[2]=Math.cos(r/1500),n.queue.writeBuffer(t.ambientBuffer,0,d),n.queue.writeBuffer(t.pointBuffer,0,f),z(n,o,t),requestAnimationFrame(h)}h(),(p=document.querySelector("#ambient"))==null||p.addEventListener("input",r=>{d[0]=+r.target.value}),(m=document.querySelector("#point"))==null||m.addEventListener("input",r=>{f[4]=+r.target.value}),(x=document.querySelector("#radius"))==null||x.addEventListener("input",r=>{f[5]=+r.target.value}),(v=document.querySelector("#dir"))==null||v.addEventListener("input",r=>{c[4]=+r.target.value});function g(){const r=i.width/i.height,B=T(r);n.queue.writeBuffer(t.projectionBuffer,0,B)}g(),window.addEventListener("resize",()=>{i.width=e.width=e.clientWidth*devicePixelRatio,i.height=e.height=e.clientHeight*devicePixelRatio,t.depthTexture.destroy(),t.depthTexture=n.createTexture({size:i,format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}),t.depthView=t.depthTexture.createView(),g()})}q();
