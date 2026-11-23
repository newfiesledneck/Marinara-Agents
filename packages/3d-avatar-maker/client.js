// 3D Avatar Maker 0.1.10 — Marinara Engine Home tab app (single-file client bundle, includes three.js 0.186.1, MIT)
// Built from packages/3d-avatar-maker/src by scripts/build-3d-avatar-maker-package.mjs. Do not edit; edit src/ and rebuild.
(()=>{var bi={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},Si={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},$u=0,_c=1,ju=2;var Ur=1,Zu=2,Ws=3,On=0,qt=1,Dt=2,Fn=0,Xs=1,xc=2,yc=3,vc=4,Ku=5;var qi=100,Ju=101,Qu=102,ed=103,td=104,nd=200,id=201,sd=202,rd=203,bc=204,Sc=205,od=206,ad=207,ld=208,cd=209,hd=210,ud=211,dd=212,fd=213,pd=214,ko=0,zo=1,Vo=2,Es=3,Ho=4,Go=5,Wo=6,Xo=7,ua=0,md=1,gd=2,Mn=0,Mc=1,wc=2,Ac=3,Tc=4,Ec=5,Cc=6,Rc=7,cc="attached",_d="detached",Ic=300,Mi=301,$i=302,da=303,fa=304,Or=306,Cs=1e3,dn=1001,Rs=1002,At=1003,pa=1004;var ji=1005;var Ct=1006,Ys=1007;var Bn=1008;var Zt=1009,Pc=1010,Lc=1011,qs=1012,ma=1013,wn=1014,fn=1015,An=1016,ga=1017,_a=1018,$s=1020,Nc=35902,Dc=35899,Uc=1021,Oc=1022,$t=1023,Dn=1026,wi=1027,Fc=1028,xa=1029,Ai=1030,ya=1031;var va=1033,Fr=33776,Br=33777,kr=33778,zr=33779,ba=35840,Sa=35841,Ma=35842,wa=35843,Aa=36196,Ta=37492,Ea=37496,Ca=37488,Ra=37489,Vr=37490,Ia=37491,Pa=37808,La=37809,Na=37810,Da=37811,Ua=37812,Oa=37813,Fa=37814,Ba=37815,ka=37816,za=37817,Va=37818,Ha=37819,Ga=37820,Wa=37821,Xa=36492,Ya=36494,qa=36495,$a=36283,ja=36284,Hr=36285,Za=36286;var Vi=2300,Is=2301,Oo=2302,hc=2303,uc=2400,dc=2401,fc=2402;var xd=3200;var Gr=0,yd=1,Tn="",St="srgb",xr="srgb-linear",yr="linear",ot="srgb";var Fo=7680;var vd=519,bd=512,Sd=513,Md=514,Ka=515,wd=516,Ad=517,Ja=518,Td=519,Ed=35044;var Bc="300 es",yn=2e3,Ps=2001;function Im(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Pm(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Ls(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Cd(){let i=Ls("canvas");return i.style.display="block",i}var vu={},Ns=null;function kc(...i){let e="THREE."+i.shift();Ns?Ns("log",e,...i):console.log(e,...i)}function Rd(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function De(...i){i=Rd(i);let e="THREE."+i.shift();if(Ns)Ns("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function Ve(...i){i=Rd(i);let e="THREE."+i.shift();if(Ns)Ns("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function zi(...i){let e=i.join(" ");e in vu||(vu[e]=!0,De(...i))}function Id(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var Pd={[ko]:zo,[Vo]:Wo,[Ho]:Xo,[Es]:Go,[zo]:ko,[Wo]:Vo,[Xo]:Ho,[Go]:Es},bn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}},kt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],bu=1234567,gr=Math.PI/180,Ds=180/Math.PI;function Zi(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(kt[i&255]+kt[i>>8&255]+kt[i>>16&255]+kt[i>>24&255]+"-"+kt[e&255]+kt[e>>8&255]+"-"+kt[e>>16&15|64]+kt[e>>24&255]+"-"+kt[t&63|128]+kt[t>>8&255]+"-"+kt[t>>16&255]+kt[t>>24&255]+kt[n&255]+kt[n>>8&255]+kt[n>>16&255]+kt[n>>24&255]).toLowerCase()}function $e(i,e,t){return Math.max(e,Math.min(t,i))}function zc(i,e){return(i%e+e)%e}function Lm(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function Nm(i,e,t){return i!==e?(t-i)/(e-i):0}function _r(i,e,t){return(1-t)*i+t*e}function Dm(i,e,t,n){return _r(i,e,1-Math.exp(-t*n))}function Um(i,e=1){return e-Math.abs(zc(i,e*2)-e)}function Om(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function Fm(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Bm(i,e){return i+Math.floor(Math.random()*(e-i+1))}function km(i,e){return i+Math.random()*(e-i)}function zm(i){return i*(.5-Math.random())}function Vm(i){i!==void 0&&(bu=i);let e=bu+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Hm(i){return i*gr}function Gm(i){return i*Ds}function Wm(i){return i>0&&Number.isInteger(i)&&2**Math.round(Math.log2(i))===i}function Xm(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Ym(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function qm(i,e,t,n,s){let r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),c=r((e+n)/2),u=o((e+n)/2),d=r((e-n)/2),h=o((e-n)/2),f=r((n-e)/2),g=o((n-e)/2);switch(s){case"XYX":i.set(a*u,l*d,l*h,a*c);break;case"YZY":i.set(l*h,a*u,l*d,a*c);break;case"ZXZ":i.set(l*d,l*h,a*u,a*c);break;case"XZX":i.set(a*u,l*g,l*f,a*c);break;case"YXY":i.set(l*f,a*u,l*g,a*c);break;case"ZYZ":i.set(l*g,l*f,a*u,a*c);break;default:De("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function As(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Wt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Ki={DEG2RAD:gr,RAD2DEG:Ds,generateUUID:Zi,clamp:$e,euclideanModulo:zc,mapLinear:Lm,inverseLerp:Nm,lerp:_r,damp:Dm,pingpong:Um,smoothstep:Om,smootherstep:Fm,randInt:Bm,randFloat:km,randFloatSpread:zm,seededRandom:Vm,degToRad:Hm,radToDeg:Gm,isPowerOfTwo:Wm,ceilPowerOfTwo:Xm,floorPowerOfTwo:Ym,setQuaternionFromProperEuler:qm,normalize:Wt,denormalize:As},Fe=class i{static{i.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=$e(this.x,e.x,t.x),this.y=$e(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=$e(this.x,e,t),this.y=$e(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar($e(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos($e(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*s+e.x,this.y=r*s+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},dt=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,o,a){let l=n[s+0],c=n[s+1],u=n[s+2],d=n[s+3],h=r[o+0],f=r[o+1],g=r[o+2],y=r[o+3];if(d!==y||l!==h||c!==f||u!==g){let m=l*h+c*f+u*g+d*y;m<0&&(h=-h,f=-f,g=-g,y=-y,m=-m);let p=1-a;if(m<.9995){let x=Math.acos(m),M=Math.sin(x);p=Math.sin(p*x)/M,a=Math.sin(a*x)/M,l=l*p+h*a,c=c*p+f*a,u=u*p+g*a,d=d*p+y*a}else{l=l*p+h*a,c=c*p+f*a,u=u*p+g*a,d=d*p+y*a;let x=1/Math.sqrt(l*l+c*c+u*u+d*d);l*=x,c*=x,u*=x,d*=x}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=d}static multiplyQuaternionsFlat(e,t,n,s,r,o){let a=n[s],l=n[s+1],c=n[s+2],u=n[s+3],d=r[o],h=r[o+1],f=r[o+2],g=r[o+3];return e[t]=a*g+u*d+l*f-c*h,e[t+1]=l*g+u*h+c*d-a*f,e[t+2]=c*g+u*f+a*h-l*d,e[t+3]=u*g-a*d-l*h-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),u=a(s/2),d=a(r/2),h=l(n/2),f=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=h*u*d+c*f*g,this._y=c*f*d-h*u*g,this._z=c*u*g+h*f*d,this._w=c*u*d-h*f*g;break;case"YXZ":this._x=h*u*d+c*f*g,this._y=c*f*d-h*u*g,this._z=c*u*g-h*f*d,this._w=c*u*d+h*f*g;break;case"ZXY":this._x=h*u*d-c*f*g,this._y=c*f*d+h*u*g,this._z=c*u*g+h*f*d,this._w=c*u*d-h*f*g;break;case"ZYX":this._x=h*u*d-c*f*g,this._y=c*f*d+h*u*g,this._z=c*u*g-h*f*d,this._w=c*u*d+h*f*g;break;case"YZX":this._x=h*u*d+c*f*g,this._y=c*f*d+h*u*g,this._z=c*u*g-h*f*d,this._w=c*u*d-h*f*g;break;case"XZY":this._x=h*u*d-c*f*g,this._y=c*f*d-h*u*g,this._z=c*u*g+h*f*d,this._w=c*u*d+h*f*g;break;default:De("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],d=t[10],h=n+a+d;if(h>0){let f=.5/Math.sqrt(h+1);this._w=.25/f,this._x=(u-l)*f,this._y=(r-c)*f,this._z=(o-s)*f}else if(n>a&&n>d){let f=2*Math.sqrt(1+n-a-d);this._w=(u-l)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+c)/f}else if(a>d){let f=2*Math.sqrt(1+a-n-d);this._w=(r-c)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(l+u)/f}else{let f=2*Math.sqrt(1+d-n-a);this._w=(o-s)/f,this._x=(r+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs($e(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+o*a+s*c-r*l,this._y=s*u+o*l+r*a-n*c,this._z=r*u+o*c+n*l-s*a,this._w=o*u-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,o=e._w,a=this.dot(e);a<0&&(n=-n,s=-s,r=-r,o=-o,a=-a);let l=1-t;if(a<.9995){let c=Math.acos(a),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},N=class i{static{i.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Su.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Su.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*n),u=2*(a*t-r*s),d=2*(r*n-o*t);return this.x=t+l*c+o*d-a*u,this.y=n+l*u+a*c-r*d,this.z=s+l*d+r*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=$e(this.x,e.x,t.x),this.y=$e(this.y,e.y,t.y),this.z=$e(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=$e(this.x,e,t),this.y=$e(this.y,e,t),this.z=$e(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar($e(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return zl.copy(this).projectOnVector(e),this.sub(zl)}reflect(e){return this.sub(zl.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos($e(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},zl=new N,Su=new dt,Ge=class i{static{i.prototype.isMatrix3=!0}constructor(e,t,n,s,r,o,a,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c)}set(e,t,n,s,r,o,a,l,c){let u=this.elements;return u[0]=e,u[1]=s,u[2]=a,u[3]=t,u[4]=r,u[5]=l,u[6]=n,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],u=n[4],d=n[7],h=n[2],f=n[5],g=n[8],y=s[0],m=s[3],p=s[6],x=s[1],M=s[4],v=s[7],S=s[2],A=s[5],E=s[8];return r[0]=o*y+a*x+l*S,r[3]=o*m+a*M+l*A,r[6]=o*p+a*v+l*E,r[1]=c*y+u*x+d*S,r[4]=c*m+u*M+d*A,r[7]=c*p+u*v+d*E,r[2]=h*y+f*x+g*S,r[5]=h*m+f*M+g*A,r[8]=h*p+f*v+g*E,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-n*r*u+n*a*l+s*r*c-s*o*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],d=u*o-a*c,h=a*l-u*r,f=c*r-o*l,g=t*d+n*h+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let y=1/g;return e[0]=d*y,e[1]=(s*c-u*n)*y,e[2]=(a*n-s*o)*y,e[3]=h*y,e[4]=(u*t-s*l)*y,e[5]=(s*r-a*t)*y,e[6]=f*y,e[7]=(n*l-c*t)*y,e[8]=(o*t-n*r)*y,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return zi("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Vl.makeScale(e,t)),this}rotate(e){return zi("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Vl.makeRotation(-e)),this}translate(e,t){return zi("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Vl.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Vl=new Ge,Mu=new Ge().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),wu=new Ge().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function $m(){let i={enabled:!0,workingColorSpace:xr,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===ot&&(s.r=jn(s.r),s.g=jn(s.g),s.b=jn(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===ot&&(s.r=Ts(s.r),s.g=Ts(s.g),s.b=Ts(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Tn?yr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return zi("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return zi("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[xr]:{primaries:e,whitePoint:n,transfer:yr,toXYZ:Mu,fromXYZ:wu,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:St},outputColorSpaceConfig:{drawingBufferColorSpace:St}},[St]:{primaries:e,whitePoint:n,transfer:ot,toXYZ:Mu,fromXYZ:wu,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:St}}}),i}var Je=$m();function jn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Ts(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var us,Us=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{us===void 0&&(us=Ls("canvas")),us.width=e.width,us.height=e.height;let s=us.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=us}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Ls("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=jn(r[o]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(jn(t[n]/255)*255):t[n]=jn(t[n]);return{data:t,width:e.width,height:e.height}}else return De("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},jm=0,Zn=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:jm++}),this.uuid=Zi(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Hl(s[o].image)):r.push(Hl(s[o]))}else r=Hl(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function Hl(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Us.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(De("Texture: Unable to serialize Texture."),{})}var Zm=0,Gl=new N,Ot=class i extends bn{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=dn,s=dn,r=Ct,o=Bn,a=$t,l=Zt,c=i.DEFAULT_ANISOTROPY,u=Tn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Zm++}),this.uuid=Zi(),this.name="",this.source=new Zn(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Fe(0,0),this.repeat=new Fe(1,1),this.center=new Fe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ge,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Gl).x}get height(){return this.source.getSize(Gl).y}get depth(){return this.source.getSize(Gl).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){De(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){De(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Ic)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Cs:e.x=e.x-Math.floor(e.x);break;case dn:e.x=e.x<0?0:1;break;case Rs:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Cs:e.y=e.y-Math.floor(e.y);break;case dn:e.y=e.y<0?0:1;break;case Rs:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Ot.DEFAULT_IMAGE=null;Ot.DEFAULT_MAPPING=Ic;Ot.DEFAULT_ANISOTROPY=1;var at=class i{static{i.prototype.isVector4=!0}constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],u=l[4],d=l[8],h=l[1],f=l[5],g=l[9],y=l[2],m=l[6],p=l[10];if(Math.abs(u-h)<.01&&Math.abs(d-y)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+h)<.1&&Math.abs(d+y)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let M=(c+1)/2,v=(f+1)/2,S=(p+1)/2,A=(u+h)/4,E=(d+y)/4,_=(g+m)/4;return M>v&&M>S?M<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(M),s=A/n,r=E/n):v>S?v<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(v),n=A/s,r=_/s):S<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(S),n=E/r,s=_/r),this.set(n,s,r,t),this}let x=Math.sqrt((m-g)*(m-g)+(d-y)*(d-y)+(h-u)*(h-u));return Math.abs(x)<.001&&(x=1),this.x=(m-g)/x,this.y=(d-y)/x,this.z=(h-u)/x,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=$e(this.x,e.x,t.x),this.y=$e(this.y,e.y,t.y),this.z=$e(this.z,e.z,t.z),this.w=$e(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=$e(this.x,e,t),this.y=$e(this.y,e,t),this.z=$e(this.z,e,t),this.w=$e(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar($e(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Yo=class extends bn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ct,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new at(0,0,e,t),this.scissorTest=!1,this.viewport=new at(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:n.depth},r=new Ot(s),o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Ct,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new Zn(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},jt=class extends Yo{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},vr=class extends Ot{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=At,this.minFilter=At,this.wrapR=dn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var qo=class extends Ot{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=At,this.minFilter=At,this.wrapR=dn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var Ne=class i{static{i.prototype.isMatrix4=!0}constructor(e,t,n,s,r,o,a,l,c,u,d,h,f,g,y,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c,u,d,h,f,g,y,m)}set(e,t,n,s,r,o,a,l,c,u,d,h,f,g,y,m){let p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=s,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=u,p[10]=d,p[14]=h,p[3]=f,p[7]=g,p[11]=y,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,s=1/ds.setFromMatrixColumn(e,0).length(),r=1/ds.setFromMatrixColumn(e,1).length(),o=1/ds.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),d=Math.sin(r);if(e.order==="XYZ"){let h=o*u,f=o*d,g=a*u,y=a*d;t[0]=l*u,t[4]=-l*d,t[8]=c,t[1]=f+g*c,t[5]=h-y*c,t[9]=-a*l,t[2]=y-h*c,t[6]=g+f*c,t[10]=o*l}else if(e.order==="YXZ"){let h=l*u,f=l*d,g=c*u,y=c*d;t[0]=h+y*a,t[4]=g*a-f,t[8]=o*c,t[1]=o*d,t[5]=o*u,t[9]=-a,t[2]=f*a-g,t[6]=y+h*a,t[10]=o*l}else if(e.order==="ZXY"){let h=l*u,f=l*d,g=c*u,y=c*d;t[0]=h-y*a,t[4]=-o*d,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*u,t[9]=y-h*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let h=o*u,f=o*d,g=a*u,y=a*d;t[0]=l*u,t[4]=g*c-f,t[8]=h*c+y,t[1]=l*d,t[5]=y*c+h,t[9]=f*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let h=o*l,f=o*c,g=a*l,y=a*c;t[0]=l*u,t[4]=y-h*d,t[8]=g*d+f,t[1]=d,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=f*d+g,t[10]=h-y*d}else if(e.order==="XZY"){let h=o*l,f=o*c,g=a*l,y=a*c;t[0]=l*u,t[4]=-d,t[8]=c*u,t[1]=h*d+y,t[5]=o*u,t[9]=f*d-g,t[2]=g*d-f,t[6]=a*u,t[10]=y*d+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Km,e,Jm)}lookAt(e,t,n){let s=this.elements;return tn.subVectors(e,t),tn.lengthSq()===0&&(tn.z=1),tn.normalize(),ai.crossVectors(n,tn),ai.lengthSq()===0&&(Math.abs(n.z)===1?tn.x+=1e-4:tn.z+=1e-4,tn.normalize(),ai.crossVectors(n,tn)),ai.normalize(),go.crossVectors(tn,ai),s[0]=ai.x,s[4]=go.x,s[8]=tn.x,s[1]=ai.y,s[5]=go.y,s[9]=tn.y,s[2]=ai.z,s[6]=go.z,s[10]=tn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],u=n[1],d=n[5],h=n[9],f=n[13],g=n[2],y=n[6],m=n[10],p=n[14],x=n[3],M=n[7],v=n[11],S=n[15],A=s[0],E=s[4],_=s[8],w=s[12],C=s[1],I=s[5],L=s[9],B=s[13],P=s[2],D=s[6],Y=s[10],G=s[14],ne=s[3],q=s[7],$=s[11],Q=s[15];return r[0]=o*A+a*C+l*P+c*ne,r[4]=o*E+a*I+l*D+c*q,r[8]=o*_+a*L+l*Y+c*$,r[12]=o*w+a*B+l*G+c*Q,r[1]=u*A+d*C+h*P+f*ne,r[5]=u*E+d*I+h*D+f*q,r[9]=u*_+d*L+h*Y+f*$,r[13]=u*w+d*B+h*G+f*Q,r[2]=g*A+y*C+m*P+p*ne,r[6]=g*E+y*I+m*D+p*q,r[10]=g*_+y*L+m*Y+p*$,r[14]=g*w+y*B+m*G+p*Q,r[3]=x*A+M*C+v*P+S*ne,r[7]=x*E+M*I+v*D+S*q,r[11]=x*_+M*L+v*Y+S*$,r[15]=x*w+M*B+v*G+S*Q,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],d=e[6],h=e[10],f=e[14],g=e[3],y=e[7],m=e[11],p=e[15],x=l*f-c*h,M=a*f-c*d,v=a*h-l*d,S=o*f-c*u,A=o*h-l*u,E=o*d-a*u;return t*(y*x-m*M+p*v)-n*(g*x-m*S+p*A)+s*(g*M-y*S+p*E)-r*(g*v-y*A+m*E)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],o=e[5],a=e[9],l=e[2],c=e[6],u=e[10];return t*(o*u-a*c)-n*(r*u-a*l)+s*(r*c-o*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],d=e[9],h=e[10],f=e[11],g=e[12],y=e[13],m=e[14],p=e[15],x=t*a-n*o,M=t*l-s*o,v=t*c-r*o,S=n*l-s*a,A=n*c-r*a,E=s*c-r*l,_=u*y-d*g,w=u*m-h*g,C=u*p-f*g,I=d*m-h*y,L=d*p-f*y,B=h*p-f*m,P=x*B-M*L+v*I+S*C-A*w+E*_;if(P===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let D=1/P;return e[0]=(a*B-l*L+c*I)*D,e[1]=(s*L-n*B-r*I)*D,e[2]=(y*E-m*A+p*S)*D,e[3]=(h*A-d*E-f*S)*D,e[4]=(l*C-o*B-c*w)*D,e[5]=(t*B-s*C+r*w)*D,e[6]=(m*v-g*E-p*M)*D,e[7]=(u*E-h*v+f*M)*D,e[8]=(o*L-a*C+c*_)*D,e[9]=(n*C-t*L-r*_)*D,e[10]=(g*A-y*v+p*x)*D,e[11]=(d*v-u*A-f*x)*D,e[12]=(a*w-o*I-l*_)*D,e[13]=(t*I-n*w+s*_)*D,e[14]=(y*M-g*S-m*x)*D,e[15]=(u*S-d*M+h*x)*D,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,c=r*o,u=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,u*a+n,u*l-s*o,0,c*l-s*a,u*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,o){return this.set(1,n,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,u=o+o,d=a+a,h=r*c,f=r*u,g=r*d,y=o*u,m=o*d,p=a*d,x=l*c,M=l*u,v=l*d,S=n.x,A=n.y,E=n.z;return s[0]=(1-(y+p))*S,s[1]=(f+v)*S,s[2]=(g-M)*S,s[3]=0,s[4]=(f-v)*A,s[5]=(1-(h+p))*A,s[6]=(m+x)*A,s[7]=0,s[8]=(g+M)*E,s[9]=(m-x)*E,s[10]=(1-(h+y))*E,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let o=ds.set(s[0],s[1],s[2]).length(),a=ds.set(s[4],s[5],s[6]).length(),l=ds.set(s[8],s[9],s[10]).length();r<0&&(o=-o),gn.copy(this);let c=1/o,u=1/a,d=1/l;return gn.elements[0]*=c,gn.elements[1]*=c,gn.elements[2]*=c,gn.elements[4]*=u,gn.elements[5]*=u,gn.elements[6]*=u,gn.elements[8]*=d,gn.elements[9]*=d,gn.elements[10]*=d,t.setFromRotationMatrix(gn),n.x=o,n.y=a,n.z=l,this}makePerspective(e,t,n,s,r,o,a=yn,l=!1){let c=this.elements,u=2*r/(t-e),d=2*r/(n-s),h=(t+e)/(t-e),f=(n+s)/(n-s),g,y;if(l)g=r/(o-r),y=o*r/(o-r);else if(a===yn)g=-(o+r)/(o-r),y=-2*o*r/(o-r);else if(a===Ps)g=-o/(o-r),y=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=d,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=y,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,o,a=yn,l=!1){let c=this.elements,u=2/(t-e),d=2/(n-s),h=-(t+e)/(t-e),f=-(n+s)/(n-s),g,y;if(l)g=1/(o-r),y=o/(o-r);else if(a===yn)g=-2/(o-r),y=-(o+r)/(o-r);else if(a===Ps)g=-1/(o-r),y=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=d,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=g,c[14]=y,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},ds=new N,gn=new Ne,Km=new N(0,0,0),Jm=new N(1,1,1),ai=new N,go=new N,tn=new N,Au=new Ne,Tu=new dt,Un=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],u=s[9],d=s[2],h=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin($e(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-$e(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin($e(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-$e(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(h,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin($e(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-$e(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:De("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Au.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Au,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Tu.setFromEuler(this),this.setFromQuaternion(Tu,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Un.DEFAULT_ORDER="XYZ";var br=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Qm=0,Eu=new N,fs=new dt,Wn=new Ne,_o=new N,ur=new N,eg=new N,tg=new dt,Cu=new N(1,0,0),Ru=new N(0,1,0),Iu=new N(0,0,1),Pu={type:"added"},ng={type:"removed"},ps={type:"childadded",child:null},Wl={type:"childremoved",child:null},Ft=class i extends bn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Qm++}),this.uuid=Zi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new N,t=new Un,n=new dt,s=new N(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Ne},normalMatrix:{value:new Ge}}),this.matrix=new Ne,this.matrixWorld=new Ne,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new br,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return fs.setFromAxisAngle(e,t),this.quaternion.multiply(fs),this}rotateOnWorldAxis(e,t){return fs.setFromAxisAngle(e,t),this.quaternion.premultiply(fs),this}rotateX(e){return this.rotateOnAxis(Cu,e)}rotateY(e){return this.rotateOnAxis(Ru,e)}rotateZ(e){return this.rotateOnAxis(Iu,e)}translateOnAxis(e,t){return Eu.copy(e).applyQuaternion(this.quaternion),this.position.add(Eu.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Cu,e)}translateY(e){return this.translateOnAxis(Ru,e)}translateZ(e){return this.translateOnAxis(Iu,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Wn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?_o.copy(e):_o.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),ur.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Wn.lookAt(ur,_o,this.up):Wn.lookAt(_o,ur,this.up),this.quaternion.setFromRotationMatrix(Wn),s&&(Wn.extractRotation(s.matrixWorld),fs.setFromRotationMatrix(Wn),this.quaternion.premultiply(fs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Ve("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Pu),ps.child=e,this.dispatchEvent(ps),ps.child=null):Ve("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(ng),Wl.child=e,this.dispatchEvent(Wl),Wl.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Wn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Wn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Wn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Pu),ps.child=e,this.dispatchEvent(ps),ps.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ur,e,eg),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ur,tg,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let d=l[c];r(e.shapes,d)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),d=o(e.shapes),h=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),d.length>0&&(n.shapes=d),h.length>0&&(n.skeletons=h),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){let l=[];for(let c in a){let u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Ft.DEFAULT_UP=new N(0,1,0);Ft.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ft.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var vn=class extends Ft{constructor(){super(),this.isGroup=!0,this.type="Group"}},ig={type:"move"},Os=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new vn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new vn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new N,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new N),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new vn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new N,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new N,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let y of e.hand.values()){let m=t.getJointPose(y,n),p=this._getHandJoint(c,y);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let u=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],h=u.position.distanceTo(d.position),f=.02,g=.005;c.inputState.pinching&&h>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(ig)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new vn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Ld={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},li={h:0,s:0,l:0},xo={h:0,s:0,l:0};function Xl(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var He=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=St){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Je.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=Je.workingColorSpace){return this.r=e,this.g=t,this.b=n,Je.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=Je.workingColorSpace){if(e=zc(e,1),t=$e(t,0,1),n=$e(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=Xl(o,r,e+1/3),this.g=Xl(o,r,e),this.b=Xl(o,r,e-1/3)}return Je.colorSpaceToWorking(this,s),this}setStyle(e,t=St){function n(r){r!==void 0&&parseFloat(r)<1&&De("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:De("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);De("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=St){let n=Ld[e.toLowerCase()];return n!==void 0?this.setHex(n,t):De("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=jn(e.r),this.g=jn(e.g),this.b=jn(e.b),this}copyLinearToSRGB(e){return this.r=Ts(e.r),this.g=Ts(e.g),this.b=Ts(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=St){return Je.workingToColorSpace(zt.copy(this),e),Math.round($e(zt.r*255,0,255))*65536+Math.round($e(zt.g*255,0,255))*256+Math.round($e(zt.b*255,0,255))}getHexString(e=St){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Je.workingColorSpace){Je.workingToColorSpace(zt.copy(this),t);let n=zt.r,s=zt.g,r=zt.b,o=Math.max(n,s,r),a=Math.min(n,s,r),l,c,u=(a+o)/2;if(a===o)l=0,c=0;else{let d=o-a;switch(c=u<=.5?d/(o+a):d/(2-o-a),o){case n:l=(s-r)/d+(s<r?6:0);break;case s:l=(r-n)/d+2;break;case r:l=(n-s)/d+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=Je.workingColorSpace){return Je.workingToColorSpace(zt.copy(this),t),e.r=zt.r,e.g=zt.g,e.b=zt.b,e}getStyle(e=St){Je.workingToColorSpace(zt.copy(this),e);let t=zt.r,n=zt.g,s=zt.b;return e!==St?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(li),this.setHSL(li.h+e,li.s+t,li.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(li),e.getHSL(xo);let n=_r(li.h,xo.h,t),s=_r(li.s,xo.s,t),r=_r(li.l,xo.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},zt=new He;He.NAMES=Ld;var fi=class extends Ft{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Un,this.environmentIntensity=1,this.environmentRotation=new Un,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},_n=new N,Xn=new N,Yl=new N,Yn=new N,ms=new N,gs=new N,Lu=new N,ql=new N,$l=new N,jl=new N,Zl=new at,Kl=new at,Jl=new at,di=class i{constructor(e=new N,t=new N,n=new N){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),_n.subVectors(e,t),s.cross(_n);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){_n.subVectors(s,t),Xn.subVectors(n,t),Yl.subVectors(e,t);let o=_n.dot(_n),a=_n.dot(Xn),l=_n.dot(Yl),c=Xn.dot(Xn),u=Xn.dot(Yl),d=o*c-a*a;if(d===0)return r.set(0,0,0),null;let h=1/d,f=(c*l-a*u)*h,g=(o*u-a*l)*h;return r.set(1-f-g,g,f)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Yn)===null?!1:Yn.x>=0&&Yn.y>=0&&Yn.x+Yn.y<=1}static getInterpolation(e,t,n,s,r,o,a,l){return this.getBarycoord(e,t,n,s,Yn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Yn.x),l.addScaledVector(o,Yn.y),l.addScaledVector(a,Yn.z),l)}static getInterpolatedAttribute(e,t,n,s,r,o){return Zl.setScalar(0),Kl.setScalar(0),Jl.setScalar(0),Zl.fromBufferAttribute(e,t),Kl.fromBufferAttribute(e,n),Jl.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(Zl,r.x),o.addScaledVector(Kl,r.y),o.addScaledVector(Jl,r.z),o}static isFrontFacing(e,t,n,s){return _n.subVectors(n,t),Xn.subVectors(e,t),_n.cross(Xn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return _n.subVectors(this.c,this.b),Xn.subVectors(this.a,this.b),_n.cross(Xn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,o,a;ms.subVectors(s,n),gs.subVectors(r,n),ql.subVectors(e,n);let l=ms.dot(ql),c=gs.dot(ql);if(l<=0&&c<=0)return t.copy(n);$l.subVectors(e,s);let u=ms.dot($l),d=gs.dot($l);if(u>=0&&d<=u)return t.copy(s);let h=l*d-u*c;if(h<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(n).addScaledVector(ms,o);jl.subVectors(e,r);let f=ms.dot(jl),g=gs.dot(jl);if(g>=0&&f<=g)return t.copy(r);let y=f*c-l*g;if(y<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(gs,a);let m=u*g-f*d;if(m<=0&&d-u>=0&&f-g>=0)return Lu.subVectors(r,s),a=(d-u)/(d-u+(f-g)),t.copy(s).addScaledVector(Lu,a);let p=1/(m+y+h);return o=y*p,a=h*p,t.copy(n).addScaledVector(ms,o).addScaledVector(gs,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Sn=class{constructor(e=new N(1/0,1/0,1/0),t=new N(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(xn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(xn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=xn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,xn):xn.fromBufferAttribute(r,o),xn.applyMatrix4(e.matrixWorld),this.expandByPoint(xn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),yo.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),yo.copy(n.boundingBox)),yo.applyMatrix4(e.matrixWorld),this.union(yo)}let s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,xn),xn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(dr),vo.subVectors(this.max,dr),_s.subVectors(e.a,dr),xs.subVectors(e.b,dr),ys.subVectors(e.c,dr),ci.subVectors(xs,_s),hi.subVectors(ys,xs),Oi.subVectors(_s,ys);let t=[0,-ci.z,ci.y,0,-hi.z,hi.y,0,-Oi.z,Oi.y,ci.z,0,-ci.x,hi.z,0,-hi.x,Oi.z,0,-Oi.x,-ci.y,ci.x,0,-hi.y,hi.x,0,-Oi.y,Oi.x,0];return!Ql(t,_s,xs,ys,vo)||(t=[1,0,0,0,1,0,0,0,1],!Ql(t,_s,xs,ys,vo))?!1:(bo.crossVectors(ci,hi),t=[bo.x,bo.y,bo.z],Ql(t,_s,xs,ys,vo))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,xn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(xn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(qn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),qn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),qn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),qn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),qn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),qn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),qn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),qn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(qn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},qn=[new N,new N,new N,new N,new N,new N,new N,new N],xn=new N,yo=new Sn,_s=new N,xs=new N,ys=new N,ci=new N,hi=new N,Oi=new N,dr=new N,vo=new N,bo=new N,Fi=new N;function Ql(i,e,t,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){Fi.fromArray(i,r);let a=s.x*Math.abs(Fi.x)+s.y*Math.abs(Fi.y)+s.z*Math.abs(Fi.z),l=e.dot(Fi),c=t.dot(Fi),u=n.dot(Fi);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}var wt=new N,So=new Fe,sg=0,Be=class extends bn{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:sg++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Ed,this.updateRanges=[],this.gpuType=fn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)So.fromBufferAttribute(this,t),So.applyMatrix3(e),this.setXY(t,So.x,So.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)wt.fromBufferAttribute(this,t),wt.applyMatrix3(e),this.setXYZ(t,wt.x,wt.y,wt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)wt.fromBufferAttribute(this,t),wt.applyMatrix4(e),this.setXYZ(t,wt.x,wt.y,wt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)wt.fromBufferAttribute(this,t),wt.applyNormalMatrix(e),this.setXYZ(t,wt.x,wt.y,wt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)wt.fromBufferAttribute(this,t),wt.transformDirection(e),this.setXYZ(t,wt.x,wt.y,wt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=As(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Wt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=As(t,this.array)),t}setX(e,t){return this.normalized&&(t=Wt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=As(t,this.array)),t}setY(e,t){return this.normalized&&(t=Wt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=As(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Wt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=As(t,this.array)),t}setW(e,t){return this.normalized&&(t=Wt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Wt(t,this.array),n=Wt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Wt(t,this.array),n=Wt(n,this.array),s=Wt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=Wt(t,this.array),n=Wt(n,this.array),s=Wt(s,this.array),r=Wt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}};var rn=class extends Be{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Hi=class extends Be{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var Xt=class extends Be{constructor(e,t,n){super(new Float32Array(e),t,n)}},rg=new Sn,fr=new N,ec=new N,pi=class{constructor(e=new N,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):rg.setFromPoints(e).getCenter(n);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;fr.subVectors(e,this.center);let t=fr.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(fr,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ec.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(fr.copy(e.center).add(ec)),this.expandByPoint(fr.copy(e.center).sub(ec))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},og=0,un=new Ne,tc=new Ft,vs=new N,nn=new Sn,pr=new Sn,Nt=new N,Rt=class i extends bn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:og++}),this.uuid=Zi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Im(e)?Hi:rn)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Ge().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return un.makeRotationFromQuaternion(e),this.applyMatrix4(un),this}rotateX(e){return un.makeRotationX(e),this.applyMatrix4(un),this}rotateY(e){return un.makeRotationY(e),this.applyMatrix4(un),this}rotateZ(e){return un.makeRotationZ(e),this.applyMatrix4(un),this}translate(e,t,n){return un.makeTranslation(e,t,n),this.applyMatrix4(un),this}scale(e,t,n){return un.makeScale(e,t,n),this.applyMatrix4(un),this}lookAt(e){return tc.lookAt(e),tc.updateMatrix(),this.applyMatrix4(tc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(vs).negate(),this.translate(vs.x,vs.y,vs.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let o=e[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Xt(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&De("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Sn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ve("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new N(-1/0,-1/0,-1/0),new N(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];nn.setFromBufferAttribute(r),this.morphTargetsRelative?(Nt.addVectors(this.boundingBox.min,nn.min),this.boundingBox.expandByPoint(Nt),Nt.addVectors(this.boundingBox.max,nn.max),this.boundingBox.expandByPoint(Nt)):(this.boundingBox.expandByPoint(nn.min),this.boundingBox.expandByPoint(nn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ve('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new pi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ve("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new N,1/0);return}if(e){let n=this.boundingSphere.center;if(nn.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];pr.setFromBufferAttribute(a),this.morphTargetsRelative?(Nt.addVectors(nn.min,pr.min),nn.expandByPoint(Nt),Nt.addVectors(nn.max,pr.max),nn.expandByPoint(Nt)):(nn.expandByPoint(pr.min),nn.expandByPoint(pr.max))}nn.getCenter(n);let s=0;for(let r=0,o=e.count;r<o;r++)Nt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Nt));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)Nt.fromBufferAttribute(a,c),l&&(vs.fromBufferAttribute(e,c),Nt.add(vs)),s=Math.max(s,n.distanceToSquared(Nt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Ve('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Ve("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new Be(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));let a=[],l=[];for(let _=0;_<n.count;_++)a[_]=new N,l[_]=new N;let c=new N,u=new N,d=new N,h=new Fe,f=new Fe,g=new Fe,y=new N,m=new N;function p(_,w,C){c.fromBufferAttribute(n,_),u.fromBufferAttribute(n,w),d.fromBufferAttribute(n,C),h.fromBufferAttribute(r,_),f.fromBufferAttribute(r,w),g.fromBufferAttribute(r,C),u.sub(c),d.sub(c),f.sub(h),g.sub(h);let I=1/(f.x*g.y-g.x*f.y);isFinite(I)&&(y.copy(u).multiplyScalar(g.y).addScaledVector(d,-f.y).multiplyScalar(I),m.copy(d).multiplyScalar(f.x).addScaledVector(u,-g.x).multiplyScalar(I),a[_].add(y),a[w].add(y),a[C].add(y),l[_].add(m),l[w].add(m),l[C].add(m))}let x=this.groups;x.length===0&&(x=[{start:0,count:e.count}]);for(let _=0,w=x.length;_<w;++_){let C=x[_],I=C.start,L=C.count;for(let B=I,P=I+L;B<P;B+=3)p(e.getX(B+0),e.getX(B+1),e.getX(B+2))}let M=new N,v=new N,S=new N,A=new N;function E(_){S.fromBufferAttribute(s,_),A.copy(S);let w=a[_];M.copy(w),M.sub(S.multiplyScalar(S.dot(w))).normalize(),v.crossVectors(A,w);let I=v.dot(l[_])<0?-1:1;o.setXYZW(_,M.x,M.y,M.z,I)}for(let _=0,w=x.length;_<w;++_){let C=x[_],I=C.start,L=C.count;for(let B=I,P=I+L;B<P;B+=3)E(e.getX(B+0)),E(e.getX(B+1)),E(e.getX(B+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new Be(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let h=0,f=n.count;h<f;h++)n.setXYZ(h,0,0,0);let s=new N,r=new N,o=new N,a=new N,l=new N,c=new N,u=new N,d=new N;if(e)for(let h=0,f=e.count;h<f;h+=3){let g=e.getX(h+0),y=e.getX(h+1),m=e.getX(h+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,y),o.fromBufferAttribute(t,m),u.subVectors(o,r),d.subVectors(s,r),u.cross(d),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,y),c.fromBufferAttribute(n,m),a.add(u),l.add(u),c.add(u),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(y,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let h=0,f=t.count;h<f;h+=3)s.fromBufferAttribute(t,h+0),r.fromBufferAttribute(t,h+1),o.fromBufferAttribute(t,h+2),u.subVectors(o,r),d.subVectors(s,r),u.cross(d),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Nt.fromBufferAttribute(e,t),Nt.normalize(),e.setXYZ(t,Nt.x,Nt.y,Nt.z)}toNonIndexed(){function e(a,l){let c=a.array,u=a.itemSize,d=a.normalized,h=new c.constructor(l.length*u),f=0,g=0;for(let y=0,m=l.length;y<m;y++){a.isInterleavedBufferAttribute?f=l[y]*a.data.stride+a.offset:f=l[y]*u;for(let p=0;p<u;p++)h[g++]=c[f++]}return new Be(h,u,d)}if(this.index===null)return De("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let a in s){let l=s[a],c=e(l,n);t.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let u=0,d=c.length;u<d;u++){let h=c[u],f=e(h,n);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let d=0,h=c.length;d<h;d++){let f=c[d];u.push(f.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let u=s[c];this.setAttribute(c,u.clone(t))}let r=e.morphAttributes;for(let c in r){let u=[],d=r[c];for(let h=0,f=d.length;h<f;h++)u.push(d[h].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,u=o.length;c<u;c++){let d=o[c];this.addGroup(d.start,d.count,d.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var nc=new N,ag=new N,lg=new Ge,sn=class{constructor(e=new N(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=nc.subVectors(n,t).cross(ag.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let s=e.delta(nc),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let o=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(o<0||o>1)?null:t.copy(e.start).addScaledVector(s,o)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||lg.getNormalMatrix(e),s=this.coplanarPoint(nc).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},cg=0,Kn=class extends bn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:cg++}),this.uuid=Zi(),this.name="",this.type="Material",this.blending=Xs,this.side=On,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=bc,this.blendDst=Sc,this.blendEquation=qi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new He(0,0,0),this.blendAlpha=0,this.depthFunc=Es,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=vd,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Fo,this.stencilZFail=Fo,this.stencilZPass=Fo,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){De(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){De(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(t){let r=s(e.textures),o=s(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new He().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new sn().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Fe().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Fe().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var $n=new N,ic=new N,Mo=new N,wo=new N,Gi=class{constructor(e=new N,t=new N(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,$n)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=$n.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):($n.copy(this.origin).addScaledVector(this.direction,t),$n.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){ic.copy(e).add(t).multiplyScalar(.5),Mo.copy(t).sub(e).normalize(),wo.copy(this.origin).sub(ic);let r=e.distanceTo(t)*.5,o=-this.direction.dot(Mo),a=wo.dot(this.direction),l=-wo.dot(Mo),c=wo.lengthSq(),u=Math.abs(1-o*o),d,h,f,g;if(u>0)if(d=o*l-a,h=o*a-l,g=r*u,d>=0)if(h>=-g)if(h<=g){let y=1/u;d*=y,h*=y,f=d*(d+o*h+2*a)+h*(o*d+h+2*l)+c}else h=r,d=Math.max(0,-(o*h+a)),f=-d*d+h*(h+2*l)+c;else h=-r,d=Math.max(0,-(o*h+a)),f=-d*d+h*(h+2*l)+c;else h<=-g?(d=Math.max(0,-(-o*r+a)),h=d>0?-r:Math.min(Math.max(-r,-l),r),f=-d*d+h*(h+2*l)+c):h<=g?(d=0,h=Math.min(Math.max(-r,-l),r),f=h*(h+2*l)+c):(d=Math.max(0,-(o*r+a)),h=d>0?r:Math.min(Math.max(-r,-l),r),f=-d*d+h*(h+2*l)+c);else h=o>0?-r:r,d=Math.max(0,-(o*h+a)),f=-d*d+h*(h+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(ic).addScaledVector(Mo,h),f}intersectSphere(e,t){if(e.radius<0)return null;$n.subVectors(e.center,this.origin);let n=$n.dot(this.direction),s=$n.dot($n)-n*n,r=e.radius*e.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,o,a,l,c=1/this.direction.x,u=1/this.direction.y,d=1/this.direction.z,h=this.origin;return c>=0?(n=(e.min.x-h.x)*c,s=(e.max.x-h.x)*c):(n=(e.max.x-h.x)*c,s=(e.min.x-h.x)*c),u>=0?(r=(e.min.y-h.y)*u,o=(e.max.y-h.y)*u):(r=(e.max.y-h.y)*u,o=(e.min.y-h.y)*u),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),d>=0?(a=(e.min.z-h.z)*d,l=(e.max.z-h.z)*d):(a=(e.max.z-h.z)*d,l=(e.min.z-h.z)*d),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,$n)!==null}intersectTriangle(e,t,n,s,r){let o=this.origin,a=this.direction,l=a.x,c=a.y,u=a.z,d=e.x-o.x,h=e.y-o.y,f=e.z-o.z,g=t.x-o.x,y=t.y-o.y,m=t.z-o.z,p=n.x-o.x,x=n.y-o.y,M=n.z-o.z,v=Math.abs(l),S=Math.abs(c),A=Math.abs(u),E,_,w,C,I,L,B,P,D,Y,G,ne;if(v>=S&&v>=A?(w=l,L=d,D=g,ne=p,l>=0?(E=c,_=u,C=h,I=f,B=y,P=m,Y=x,G=M):(E=u,_=c,C=f,I=h,B=m,P=y,Y=M,G=x)):S>=A?(w=c,L=h,D=y,ne=x,c>=0?(E=u,_=l,C=f,I=d,B=m,P=g,Y=M,G=p):(E=l,_=u,C=d,I=f,B=g,P=m,Y=p,G=M)):(w=u,L=f,D=m,ne=M,u>=0?(E=l,_=c,C=d,I=h,B=g,P=y,Y=p,G=x):(E=c,_=l,C=h,I=d,B=y,P=g,Y=x,G=p)),w===0)return null;let q=E/w,$=_/w,Q=1/w,be=C-q*L,Ae=I-$*L,Qe=B-q*D,We=P-$*D,Ke=Y-q*ne,j=G-$*ne,ee=Ke*We-j*Qe,ve=be*j-Ae*Ke,Ue=Qe*Ae-We*be;if(s){if(ee<0||ve<0||Ue<0)return null}else if((ee<0||ve<0||Ue<0)&&(ee>0||ve>0||Ue>0))return null;let _e=ee+ve+Ue;if(_e===0)return null;let Oe=Q*(ee*L+ve*D+Ue*ne);return(_e>0?Oe<0:Oe>0)?null:this.at(Oe/_e,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Wi=class extends Kn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new He(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Un,this.combine=ua,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Nu=new Ne,Bi=new Gi,Ao=new pi,Du=new N,To=new N,Eo=new N,Co=new N,sc=new N,Ro=new N,Uu=new N,Io=new N,Yt=class extends Ft{constructor(e=new Rt,t=new Wi){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let a=this.morphTargetInfluences;if(r&&a){Ro.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let u=a[l],d=r[l];u!==0&&(sc.fromBufferAttribute(d,e),o?Ro.addScaledVector(sc,u):Ro.addScaledVector(sc.sub(t),u))}t.add(Ro)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Ao.copy(n.boundingSphere),Ao.applyMatrix4(r),Bi.copy(e.ray).recast(e.near),!(Ao.containsPoint(Bi.origin)===!1&&(Bi.intersectSphere(Ao,Du)===null||Bi.origin.distanceToSquared(Du)>(e.far-e.near)**2))&&(Nu.copy(r).invert(),Bi.copy(e.ray).applyMatrix4(Nu),!(n.boundingBox!==null&&Bi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Bi)))}_computeIntersections(e,t,n){let s,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,d=r.attributes.normal,h=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,y=h.length;g<y;g++){let m=h[g],p=o[m.materialIndex],x=Math.max(m.start,f.start),M=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let v=x,S=M;v<S;v+=3){let A=a.getX(v),E=a.getX(v+1),_=a.getX(v+2);s=Po(this,p,e,n,c,u,d,A,E,_),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,f.start),y=Math.min(a.count,f.start+f.count);for(let m=g,p=y;m<p;m+=3){let x=a.getX(m),M=a.getX(m+1),v=a.getX(m+2);s=Po(this,o,e,n,c,u,d,x,M,v),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,y=h.length;g<y;g++){let m=h[g],p=o[m.materialIndex],x=Math.max(m.start,f.start),M=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let v=x,S=M;v<S;v+=3){let A=v,E=v+1,_=v+2;s=Po(this,p,e,n,c,u,d,A,E,_),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,f.start),y=Math.min(l.count,f.start+f.count);for(let m=g,p=y;m<p;m+=3){let x=m,M=m+1,v=m+2;s=Po(this,o,e,n,c,u,d,x,M,v),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function hg(i,e,t,n,s,r,o,a){let l;if(e.side===qt?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,e.side===On,a),l===null)return null;Io.copy(a),Io.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(Io);return c<t.near||c>t.far?null:{distance:c,point:Io.clone(),object:i}}function Po(i,e,t,n,s,r,o,a,l,c){i.getVertexPosition(a,To),i.getVertexPosition(l,Eo),i.getVertexPosition(c,Co);let u=hg(i,e,t,n,To,Eo,Co,Uu);if(u){let d=new N;di.getBarycoord(Uu,To,Eo,Co,d),s&&(u.uv=di.getInterpolatedAttribute(s,a,l,c,d,new Fe)),r&&(u.uv1=di.getInterpolatedAttribute(r,a,l,c,d,new Fe)),o&&(u.normal=di.getInterpolatedAttribute(o,a,l,c,d,new N),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let h={a,b:l,c,normal:new N,materialIndex:0};di.getNormal(To,Eo,Co,h.normal),u.face=h,u.barycoord=d}return u}var mr=new at,Ou=new at,Fu=new at,ug=new at,Bu=new Ne,Lo=new N,rc=new pi,ku=new Ne,oc=new Gi,Sr=class extends Yt{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=cc,this.bindMatrix=new Ne,this.bindMatrixInverse=new Ne,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Sn),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Lo),this.boundingBox.expandByPoint(Lo)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new pi),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Lo),this.boundingSphere.expandByPoint(Lo)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let n=this.material,s=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),rc.copy(this.boundingSphere),rc.applyMatrix4(s),e.ray.intersectsSphere(rc)!==!1&&(ku.copy(s).invert(),oc.copy(e.ray).applyMatrix4(ku),!(this.boundingBox!==null&&oc.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,oc)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new at,t=this.geometry.attributes.skinWeight;for(let n=0,s=t.count;n<s;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===cc?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===_d?this.bindMatrixInverse.copy(this.bindMatrix).invert():De("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,s=this.geometry;Ou.fromBufferAttribute(s.attributes.skinIndex,e),Fu.fromBufferAttribute(s.attributes.skinWeight,e),t.isVector4?(mr.copy(t),t.set(0,0,0,0)):(mr.set(...t,1),t.set(0,0,0)),mr.applyMatrix4(this.bindMatrix);for(let r=0;r<4;r++){let o=Fu.getComponent(r);if(o!==0){let a=Ou.getComponent(r);Bu.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(ug.copy(mr).applyMatrix4(Bu),o)}}return t.isVector4&&(t.w=mr.w),t.applyMatrix4(this.bindMatrixInverse)}},mi=class extends Ft{constructor(){super(),this.isBone=!0,this.type="Bone"}},Mr=class extends Ot{constructor(e=null,t=1,n=1,s,r,o,a,l,c=At,u=At,d,h){super(null,o,a,l,c,u,s,r,d,h),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},zu=new Ne,dg=new Ne,Xi=class i{constructor(e=[],t=[]){this.uuid=Zi(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){De("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,s=this.bones.length;n<s;n++)this.boneInverses.push(new Ne)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new Ne;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,s=this.boneTexture;for(let r=0,o=e.length;r<o;r++){let a=e[r]?e[r].matrixWorld:dg;zu.multiplyMatrices(a,t[r]),zu.toArray(n,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new i(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new Mr(t,e,e,$t,fn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,s=e.bones.length;n<s;n++){let r=e.bones[n],o=t[r];o===void 0&&(De("Skeleton: No bone found with UUID:",r),o=new mi),this.bones.push(o),this.boneInverses.push(new Ne().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let s=0,r=t.length;s<r;s++){let o=t[s];e.bones.push(o.uuid);let a=n[s];e.boneInverses.push(a.toArray())}return e}};var ki=new pi,fg=new Fe(.5,.5),No=new N,Fs=class{constructor(e=new sn,t=new sn,n=new sn,s=new sn,r=new sn,o=new sn){this.planes=[e,t,n,s,r,o]}set(e,t,n,s,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=yn,n=!1){let s=this.planes,r=e.elements,o=r[0],a=r[1],l=r[2],c=r[3],u=r[4],d=r[5],h=r[6],f=r[7],g=r[8],y=r[9],m=r[10],p=r[11],x=r[12],M=r[13],v=r[14],S=r[15];if(s[0].setComponents(c-o,f-u,p-g,S-x).normalize(),s[1].setComponents(c+o,f+u,p+g,S+x).normalize(),s[2].setComponents(c+a,f+d,p+y,S+M).normalize(),s[3].setComponents(c-a,f-d,p-y,S-M).normalize(),n)s[4].setComponents(l,h,m,v).normalize(),s[5].setComponents(c-l,f-h,p-m,S-v).normalize();else if(s[4].setComponents(c-l,f-h,p-m,S-v).normalize(),t===yn)s[5].setComponents(c+l,f+h,p+m,S+v).normalize();else if(t===Ps)s[5].setComponents(l,h,m,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ki.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ki.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ki)}intersectsSprite(e){ki.center.set(0,0,0);let t=fg.distanceTo(e.center);return ki.radius=.7071067811865476+t,ki.applyMatrix4(e.matrixWorld),this.intersectsSphere(ki)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(No.x=s.normal.x>0?e.max.x:e.min.x,No.y=s.normal.y>0?e.max.y:e.min.y,No.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(No)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var gi=class extends Ot{constructor(e,t,n,s,r,o,a,l,c,u,d,h){super(null,o,a,l,c,u,s,r,d,h),this.isCompressedTexture=!0,this.image={width:t,height:n},this.mipmaps=e,this.flipY=!1,this.generateMipmaps=!1}};var wr=class extends Ot{constructor(e=[],t=Mi,n,s,r,o,a,l,c,u){super(e,t,n,s,r,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Ar=class extends Ot{constructor(e,t,n,s,r,o,a,l,c){super(e,t,n,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var _i=class extends Ot{constructor(e,t,n=wn,s,r,o,a=At,l=At,c,u=Dn,d=1){if(u!==Dn&&u!==wi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let h={width:e,height:t,depth:d};super(h,s,r,o,a,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Zn(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},$o=class extends _i{constructor(e,t=wn,n=Mi,s,r,o=At,a=At,l,c=Dn){let u={width:e,height:e,depth:1},d=[u,u,u,u,u,u];super(e,e,t,n,s,r,o,a,l,c),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Tr=class extends Ot{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Bs=class i extends Rt{constructor(e=1,t=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],u=[],d=[],h=0,f=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,s,o,2),g("x","z","y",1,-1,e,n,-t,s,o,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new Xt(c,3)),this.setAttribute("normal",new Xt(u,3)),this.setAttribute("uv",new Xt(d,2));function g(y,m,p,x,M,v,S,A,E,_,w){let C=v/E,I=S/_,L=v/2,B=S/2,P=A/2,D=E+1,Y=_+1,G=0,ne=0,q=new N;for(let $=0;$<Y;$++){let Q=$*I-B;for(let be=0;be<D;be++){let Ae=be*C-L;q[y]=Ae*x,q[m]=Q*M,q[p]=P,c.push(q.x,q.y,q.z),q[y]=0,q[m]=0,q[p]=A>0?1:-1,u.push(q.x,q.y,q.z),d.push(be/E),d.push(1-$/_),G+=1}}for(let $=0;$<_;$++)for(let Q=0;Q<E;Q++){let be=h+Q+D*$,Ae=h+Q+D*($+1),Qe=h+(Q+1)+D*($+1),We=h+(Q+1)+D*$;l.push(be,Ae,We),l.push(Ae,Qe,We),ne+=6}a.addGroup(f,ne,w),f+=ne,h+=G}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var Er=class i extends Rt{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);let r=[],o=[],a=[],l=[],c=new N,u=new Fe;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let d=0,h=3;d<=t;d++,h+=3){let f=n+d/t*s;c.x=e*Math.cos(f),c.y=e*Math.sin(f),o.push(c.x,c.y,c.z),a.push(0,0,1),u.x=(o[h]/e+1)/2,u.y=(o[h+1]/e+1)/2,l.push(u.x,u.y)}for(let d=1;d<=t;d++)r.push(d,d+1,0);this.setIndex(r),this.setAttribute("position",new Xt(o,3)),this.setAttribute("normal",new Xt(a,3)),this.setAttribute("uv",new Xt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.segments,e.thetaStart,e.thetaLength)}};var Cr=class i extends Rt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(s),c=a+1,u=l+1,d=e/a,h=t/l,f=[],g=[],y=[],m=[];for(let p=0;p<u;p++){let x=p*h-o;for(let M=0;M<c;M++){let v=M*d-r;g.push(v,-x,0),y.push(0,0,1),m.push(M/a),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let x=0;x<a;x++){let M=x+c*p,v=x+c*(p+1),S=x+1+c*(p+1),A=x+1+c*p;f.push(M,v,A),f.push(v,S,A)}this.setIndex(f),this.setAttribute("position",new Xt(g,3)),this.setAttribute("normal",new Xt(y,3)),this.setAttribute("uv",new Xt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};function Ji(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];if(Vu(s))s.isRenderTargetTexture?(De("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(Vu(s[0])){let r=[];for(let o=0,a=s.length;o<a;o++)r[o]=s[o].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function Ht(i){let e={};for(let t=0;t<i.length;t++){let n=Ji(i[t]);for(let s in n)e[s]=n[s]}return e}function Vu(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function pg(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Vc(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Je.workingColorSpace}var Nd={clone:Ji,merge:Ht},mg=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,gg=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,on=class extends Kn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=mg,this.fragmentShader=gg,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ji(e.uniforms),this.uniformsGroups=pg(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new He().setHex(s.value);break;case"v2":this.uniforms[n].value=new Fe().fromArray(s.value);break;case"v3":this.uniforms[n].value=new N().fromArray(s.value);break;case"v4":this.uniforms[n].value=new at().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Ge().fromArray(s.value);break;case"m4":this.uniforms[n].value=new Ne().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},jo=class extends on{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Rr=class extends Kn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new He(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new He(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Gr,this.normalScale=new Fe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Un,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var ks=class extends Kn{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new He(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new He(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Gr,this.normalScale=new Fe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Un,this.combine=ua,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Zo=class extends Kn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=xd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Ko=class extends Kn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function bs(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function ac(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var xi=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let o;t:{i:if(!(e<s)){for(let a=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=t[++n],e<s)break e}o=t.length;break t}if(!(e>=r)){let a=t[1];e<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}o=n,n=0;break t}break n}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Jo=class extends xi{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:uc,endingEnd:uc}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,o=e+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case dc:r=e,a=2*t-n;break;case fc:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case dc:o=e,l=2*n-t;break;case fc:o=1,l=n+s[1]-s[0];break;default:o=e-1,l=t}let c=(n-t)*.5,u=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=r*u,this._offsetNext=o*u}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this._offsetPrev,d=this._offsetNext,h=this._weightPrev,f=this._weightNext,g=(n-t)/(s-t),y=g*g,m=y*g,p=-h*m+2*h*y-h*g,x=(1+h)*m+(-1.5-2*h)*y+(-.5+h)*g+1,M=(-1-f)*m+(1.5+f)*y+.5*g,v=f*m-f*y;for(let S=0;S!==a;++S)r[S]=p*o[u+S]+x*o[c+S]+M*o[l+S]+v*o[d+S];return r}},Qo=class extends xi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=(n-t)/(s-t),d=1-u;for(let h=0;h!==a;++h)r[h]=o[c+h]*d+o[l+h]*u;return r}},ea=class extends xi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},ta=class extends xi{interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this.inTangents,d=this.outTangents;if(!u||!d){let g=(n-t)/(s-t),y=1-g;for(let m=0;m!==a;++m)r[m]=o[c+m]*y+o[l+m]*g;return r}let h=a*2,f=e-1;for(let g=0;g!==a;++g){let y=o[c+g],m=o[l+g],p=f*h+g*2,x=d[p],M=d[p+1],v=e*h+g*2,S=u[v],A=u[v+1],E=xg(n,t,x,S,s);r[g]=Dd(E,y,M,A,m)}return r}};function Dd(i,e,t,n,s){let r=1-i;return r*r*r*e+3*r*r*i*t+3*r*i*i*n+i*i*i*s}function _g(i,e,t,n,s){let r=1-i;return 3*r*r*(t-e)+6*r*i*(n-t)+3*i*i*(s-n)}function xg(i,e,t,n,s){let r=(i-e)/(s-e);for(let o=0;o<8;o++){let a=Dd(r,e,t,n,s)-i;if(Math.abs(a)<1e-10)break;let l=_g(r,e,t,n,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-a/l))}return r}var an=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=bs(t,this.TimeBufferType),this.values=bs(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:bs(e.times,Array),values:bs(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s),ac(e.settings)&&(n.settings={inTangents:bs(e.settings.inTangents,Array),outTangents:bs(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new ea(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Qo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Jo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new ta(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Vi:t=this.InterpolantFactoryMethodDiscrete;break;case Is:t=this.InterpolantFactoryMethodLinear;break;case Oo:t=this.InterpolantFactoryMethodSmooth;break;case hc:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return De("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Vi;case this.InterpolantFactoryMethodLinear:return Is;case this.InterpolantFactoryMethodSmooth:return Oo;case this.InterpolantFactoryMethodBezier:return hc}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e;ac(this.settings)&&(Hu(this.settings.inTangents,e),Hu(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Ve("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(Ve("KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){Ve("KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){Ve("KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(s!==void 0&&Pm(s))for(let a=0,l=s.length;a!==l;++a){let c=s[a];if(isNaN(c)){Ve("KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Oo,r=e.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=e[a],u=e[a+1];if(c!==u&&(a!==1||c!==e[0]))if(s)l=!0;else{let d=a*n,h=d-n,f=d+n;for(let g=0;g!==n;++g){let y=t[d+g];if(y!==t[h+g]||y!==t[f+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let d=a*n,h=o*n;for(let f=0;f!==n;++f)t[h+f]=t[d+f]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,ac(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function Hu(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}an.prototype.ValueTypeName="";an.prototype.TimeBufferType=Float32Array;an.prototype.ValueBufferType=Float32Array;an.prototype.DefaultInterpolation=Is;var yi=class extends an{constructor(e,t,n){super(e,t,n)}};yi.prototype.ValueTypeName="bool";yi.prototype.ValueBufferType=Array;yi.prototype.DefaultInterpolation=Vi;yi.prototype.InterpolantFactoryMethodLinear=void 0;yi.prototype.InterpolantFactoryMethodSmooth=void 0;var na=class extends an{constructor(e,t,n,s){super(e,t,n,s)}};na.prototype.ValueTypeName="color";var ia=class extends an{constructor(e,t,n,s){super(e,t,n,s)}};ia.prototype.ValueTypeName="number";var sa=class extends xi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(s-t),c=e*a;for(let u=c+a;c!==u;c+=4)dt.slerpFlat(r,0,o,c-a,o,c,l);return r}},Ir=class extends an{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new sa(this.times,this.values,this.getValueSize(),e)}};Ir.prototype.ValueTypeName="quaternion";Ir.prototype.InterpolantFactoryMethodSmooth=void 0;var vi=class extends an{constructor(e,t,n){super(e,t,n)}};vi.prototype.ValueTypeName="string";vi.prototype.ValueBufferType=Array;vi.prototype.DefaultInterpolation=Vi;vi.prototype.InterpolantFactoryMethodLinear=void 0;vi.prototype.InterpolantFactoryMethodSmooth=void 0;var ra=class extends an{constructor(e,t,n,s){super(e,t,n,s)}};ra.prototype.ValueTypeName="vector";var Bo={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(Gu(i)||(this.files[i]=e))},get:function(i){if(this.enabled!==!1&&!Gu(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function Gu(i){try{let e=i.slice(i.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}var oa=class{constructor(e,t,n){let s=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(u){a++,r===!1&&s.onStart!==void 0&&s.onStart(u,o,a),r=!0},this.itemEnd=function(u){o++,s.onProgress!==void 0&&s.onProgress(u,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,d){return c.push(u,d),this},this.removeHandler=function(u){let d=c.indexOf(u);return d!==-1&&c.splice(d,2),this},this.getHandler=function(u){for(let d=0,h=c.length;d<h;d+=2){let f=c[d],g=c[d+1];if(f.global&&(f.lastIndex=0),f.test(u))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Ud=new oa,zs=class{constructor(e){this.manager=e!==void 0?e:Ud,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};zs.DEFAULT_MATERIAL_NAME="__DEFAULT";var Ss=new WeakMap,aa=class extends zs{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=Bo.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0);else{let d=Ss.get(o);d===void 0&&(d=[],Ss.set(o,d)),d.push({onLoad:t,onError:s})}return o}let a=Ls("img");function l(){u(),t&&t(this);let d=Ss.get(this)||[];for(let h=0;h<d.length;h++){let f=d[h];f.onLoad&&f.onLoad(this)}Ss.delete(this),r.manager.itemEnd(e)}function c(d){u(),s&&s(d),Bo.remove(`image:${e}`);let h=Ss.get(this)||[];for(let f=0;f<h.length;f++){let g=h[f];g.onError&&g.onError(d)}Ss.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function u(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),Bo.add(`image:${e}`,a),r.manager.itemStart(e),a.src=e,a}};var Yi=class extends zs{constructor(e){super(e)}load(e,t,n,s){let r=new Ot,o=new aa(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}},Pr=class extends Ft{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new He(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Lr=class extends Pr{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ft.DEFAULT_UP),this.updateMatrix(),this.groundColor=new He(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},lc=new Ne,Wu=new N,Xu=new N,la=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Fe(512,512),this.mapType=Zt,this.map=null,this.mapPass=null,this.matrix=new Ne,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Fs,this._frameExtents=new Fe(1,1),this._viewportCount=1,this._viewports=[new at(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;Wu.setFromMatrixPosition(e.matrixWorld),t.position.copy(Wu),Xu.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Xu),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){lc.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(lc,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,o=s?s.z/r.x:1,a=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===Ps||e.reversedDepth?t.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,1,0,0,0,0,1):t.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,.5,.5,0,0,0,1),t.multiply(lc)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Do=new N,Uo=new dt,Nn=new N,Nr=class extends Ft{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ne,this.projectionMatrix=new Ne,this.projectionMatrixInverse=new Ne,this.coordinateSystem=yn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Do,Uo,Nn),Nn.x===1&&Nn.y===1&&Nn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Do,Uo,Nn.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Do,Uo,Nn),Nn.x===1&&Nn.y===1&&Nn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Do,Uo,Nn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},ui=new N,Yu=new Fe,qu=new Fe,Vt=class extends Nr{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Ds*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(gr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ds*2*Math.atan(Math.tan(gr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){ui.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ui.x,ui.y).multiplyScalar(-e/ui.z),ui.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ui.x,ui.y).multiplyScalar(-e/ui.z)}getViewSize(e,t){return this.getViewBounds(e,Yu,qu),t.subVectors(qu,Yu)}setViewOffset(e,t,n,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(gr*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var Vs=class extends Nr{constructor(e=-1,t=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,o=n+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},pc=class extends la{constructor(){super(new Vs(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Hs=class extends Pr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ft.DEFAULT_UP),this.updateMatrix(),this.target=new Ft,this.shadow=new pc}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var Ms=-90,ws=1,ca=class extends Ft{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Vt(Ms,ws,e,t);s.layers=this.layers,this.add(s);let r=new Vt(Ms,ws,e,t);r.layers=this.layers,this.add(r);let o=new Vt(Ms,ws,e,t);o.layers=this.layers,this.add(o);let a=new Vt(Ms,ws,e,t);a.layers=this.layers,this.add(a);let l=new Vt(Ms,ws,e,t);l.layers=this.layers,this.add(l);let c=new Vt(Ms,ws,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,o,a,l]=t;for(let c of t)this.remove(c);if(e===yn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Ps)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,u]=this.children,d=e.getRenderTarget(),h=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let y=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=y,e.setRenderTarget(n,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(d,h,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},ha=class extends Vt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var Hc="\\[\\]\\.:\\/",yg=new RegExp("["+Hc+"]","g"),Gc="[^"+Hc+"]",vg="[^"+Hc.replace("\\.","")+"]",bg=/((?:WC+[\/:])*)/.source.replace("WC",Gc),Sg=/(WCOD+)?/.source.replace("WCOD",vg),Mg=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Gc),wg=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Gc),Ag=new RegExp("^"+bg+Sg+Mg+wg+"$"),Tg=["material","materials","bones","map"],mc=class{constructor(e,t,n){let s=n||rt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},rt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(yg,"")}static parseTrackName(e){let t=Ag.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);Tg.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let l=n(a.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){De("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){Ve("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Ve("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Ve("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Ve("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Ve("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){Ve("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){Ve("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[s];if(o===void 0){let c=t.nodeName;Ve("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){Ve("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Ve("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};rt.Composite=mc;rt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};rt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};rt.prototype.GetterByBindingType=[rt.prototype._getValue_direct,rt.prototype._getValue_array,rt.prototype._getValue_arrayElement,rt.prototype._getValue_toArray];rt.prototype.SetterByBindingTypeAndVersioning=[[rt.prototype._setValue_direct,rt.prototype._setValue_direct_setNeedsUpdate,rt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[rt.prototype._setValue_array,rt.prototype._setValue_array_setNeedsUpdate,rt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[rt.prototype._setValue_arrayElement,rt.prototype._setValue_arrayElement_setNeedsUpdate,rt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[rt.prototype._setValue_fromArray,rt.prototype._setValue_fromArray_setNeedsUpdate,rt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var IS=new Float32Array(1);var Gs=class{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=$e(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos($e(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var gc=class i{static{i.prototype.isMatrix2=!0}constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};var Dr=class extends bn{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function Wc(i,e,t,n){let s=Eg(n);switch(t){case Uc:return i*e;case Fc:return i*e/s.components*s.byteLength;case xa:return i*e/s.components*s.byteLength;case Ai:return i*e*2/s.components*s.byteLength;case ya:return i*e*2/s.components*s.byteLength;case Oc:return i*e*3/s.components*s.byteLength;case $t:return i*e*4/s.components*s.byteLength;case va:return i*e*4/s.components*s.byteLength;case Fr:case Br:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case kr:case zr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Sa:case wa:return Math.max(i,16)*Math.max(e,8)/4;case ba:case Ma:return Math.max(i,8)*Math.max(e,8)/2;case Aa:case Ta:case Ca:case Ra:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Ea:case Vr:case Ia:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Pa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case La:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Na:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Da:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Ua:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Oa:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Fa:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Ba:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case ka:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case za:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Va:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Ha:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Ga:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Wa:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Xa:case Ya:case qa:return Math.ceil(i/4)*Math.ceil(e/4)*16;case $a:case ja:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Hr:case Za:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Eg(i){switch(i){case Zt:case Pc:return{byteLength:1,components:1};case qs:case Lc:case An:return{byteLength:2,components:1};case ga:case _a:return{byteLength:2,components:4};case wn:case ma:case fn:return{byteLength:4,components:1};case Nc:case Dc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?De("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function sf(){let i=null,e=!1,t=null,n=null;function s(r,o){n=i.requestAnimationFrame(s),t(r,o)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function Cg(i){let e=new WeakMap;function t(a,l){let c=a.array,u=a.usage,d=c.byteLength,h=i.createBuffer();i.bindBuffer(l,h),i.bufferData(l,c,u),a.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:d}}function n(a,l,c){let u=l.array,d=l.updateRanges;if(i.bindBuffer(c,a),d.length===0)i.bufferSubData(c,0,u);else{d.sort((f,g)=>f.start-g.start);let h=0;for(let f=1;f<d.length;f++){let g=d[h],y=d[f];y.start<=g.start+g.count+1?g.count=Math.max(g.count,y.start+y.count-g.start):(++h,d[h]=y)}d.length=h+1;for(let f=0,g=d.length;f<g;f++){let y=d[f];i.bufferSubData(c,y.start*u.BYTES_PER_ELEMENT,u,y.start,y.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(i.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var Rg=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Ig=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Pg=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Lg=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Ng=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Dg=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Ug=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Og=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Fg=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Bg=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,kg=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,zg=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Vg=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Hg=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Gg=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Wg=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Xg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Yg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,qg=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,$g=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,jg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Zg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Kg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Jg=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Qg=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,e0=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,t0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,n0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,i0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,s0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,r0="gl_FragColor = linearToOutputTexel( gl_FragColor );",o0=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,a0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,l0=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,c0=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,h0=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,u0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,d0=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,f0=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,p0=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,m0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,g0=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,_0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,x0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,y0=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,v0=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,b0=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,S0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,M0=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,w0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,A0=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,T0=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,E0=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,C0=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,R0=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,I0=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,P0=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,L0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,N0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,D0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,U0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,O0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,F0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,B0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,k0=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,z0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,V0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,H0=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,G0=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,W0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,X0=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Y0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,q0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,$0=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,j0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Z0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,K0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,J0=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Q0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,e_=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,t_=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,n_=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,i_=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,s_=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,r_=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,o_=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,a_=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,l_=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,c_=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,h_=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,u_=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,d_=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,f_=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,p_=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,m_=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,g_=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,__=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,x_=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,y_=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,v_=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,b_=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,S_=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,M_=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,w_=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,A_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,T_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,E_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,C_=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,R_=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,I_=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,P_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,L_=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,N_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,D_=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,U_=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,O_=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,F_=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,B_=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,k_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,z_=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,V_=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,H_=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,G_=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,W_=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,X_=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Y_=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,q_=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,$_=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,j_=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Z_=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,K_=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,J_=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Q_=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,ex=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,tx=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,nx=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ix=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,sx=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,rx=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ox=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,ax=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,lx=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ye={alphahash_fragment:Rg,alphahash_pars_fragment:Ig,alphamap_fragment:Pg,alphamap_pars_fragment:Lg,alphatest_fragment:Ng,alphatest_pars_fragment:Dg,aomap_fragment:Ug,aomap_pars_fragment:Og,batching_pars_vertex:Fg,batching_vertex:Bg,begin_vertex:kg,beginnormal_vertex:zg,bsdfs:Vg,iridescence_fragment:Hg,bumpmap_pars_fragment:Gg,clipping_planes_fragment:Wg,clipping_planes_pars_fragment:Xg,clipping_planes_pars_vertex:Yg,clipping_planes_vertex:qg,color_fragment:$g,color_pars_fragment:jg,color_pars_vertex:Zg,color_vertex:Kg,common:Jg,cube_uv_reflection_fragment:Qg,defaultnormal_vertex:e0,displacementmap_pars_vertex:t0,displacementmap_vertex:n0,emissivemap_fragment:i0,emissivemap_pars_fragment:s0,colorspace_fragment:r0,colorspace_pars_fragment:o0,envmap_fragment:a0,envmap_common_pars_fragment:l0,envmap_pars_fragment:c0,envmap_pars_vertex:h0,envmap_physical_pars_fragment:b0,envmap_vertex:u0,fog_vertex:d0,fog_pars_vertex:f0,fog_fragment:p0,fog_pars_fragment:m0,gradientmap_pars_fragment:g0,lightmap_pars_fragment:_0,lights_lambert_fragment:x0,lights_lambert_pars_fragment:y0,lights_pars_begin:v0,lights_toon_fragment:S0,lights_toon_pars_fragment:M0,lights_phong_fragment:w0,lights_phong_pars_fragment:A0,lights_physical_fragment:T0,lights_physical_pars_fragment:E0,lights_fragment_begin:C0,lights_fragment_maps:R0,lights_fragment_end:I0,lightprobes_pars_fragment:P0,logdepthbuf_fragment:L0,logdepthbuf_pars_fragment:N0,logdepthbuf_pars_vertex:D0,logdepthbuf_vertex:U0,map_fragment:O0,map_pars_fragment:F0,map_particle_fragment:B0,map_particle_pars_fragment:k0,metalnessmap_fragment:z0,metalnessmap_pars_fragment:V0,morphinstance_vertex:H0,morphcolor_vertex:G0,morphnormal_vertex:W0,morphtarget_pars_vertex:X0,morphtarget_vertex:Y0,normal_fragment_begin:q0,normal_fragment_maps:$0,normal_pars_fragment:j0,normal_pars_vertex:Z0,normal_vertex:K0,normalmap_pars_fragment:J0,clearcoat_normal_fragment_begin:Q0,clearcoat_normal_fragment_maps:e_,clearcoat_pars_fragment:t_,iridescence_pars_fragment:n_,opaque_fragment:i_,packing:s_,premultiplied_alpha_fragment:r_,project_vertex:o_,dithering_fragment:a_,dithering_pars_fragment:l_,roughnessmap_fragment:c_,roughnessmap_pars_fragment:h_,shadowmap_pars_fragment:u_,shadowmap_pars_vertex:d_,shadowmap_vertex:f_,shadowmask_pars_fragment:p_,skinbase_vertex:m_,skinning_pars_vertex:g_,skinning_vertex:__,skinnormal_vertex:x_,specularmap_fragment:y_,specularmap_pars_fragment:v_,tonemapping_fragment:b_,tonemapping_pars_fragment:S_,transmission_fragment:M_,transmission_pars_fragment:w_,uv_pars_fragment:A_,uv_pars_vertex:T_,uv_vertex:E_,worldpos_vertex:C_,background_vert:R_,background_frag:I_,backgroundCube_vert:P_,backgroundCube_frag:L_,cube_vert:N_,cube_frag:D_,depth_vert:U_,depth_frag:O_,distance_vert:F_,distance_frag:B_,equirect_vert:k_,equirect_frag:z_,linedashed_vert:V_,linedashed_frag:H_,meshbasic_vert:G_,meshbasic_frag:W_,meshlambert_vert:X_,meshlambert_frag:Y_,meshmatcap_vert:q_,meshmatcap_frag:$_,meshnormal_vert:j_,meshnormal_frag:Z_,meshphong_vert:K_,meshphong_frag:J_,meshphysical_vert:Q_,meshphysical_frag:ex,meshtoon_vert:tx,meshtoon_frag:nx,points_vert:ix,points_frag:sx,shadow_vert:rx,shadow_frag:ox,sprite_vert:ax,sprite_frag:lx},me={common:{diffuse:{value:new He(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ge},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ge}},envmap:{envMap:{value:null},envMapRotation:{value:new Ge},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ge}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ge}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ge},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ge},normalScale:{value:new Fe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ge},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ge}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ge}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ge}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new He(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new N},probesMax:{value:new N},probesResolution:{value:new N}},points:{diffuse:{value:new He(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0},uvTransform:{value:new Ge}},sprite:{diffuse:{value:new He(16777215)},opacity:{value:1},center:{value:new Fe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ge},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0}}},zn={basic:{uniforms:Ht([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.fog]),vertexShader:Ye.meshbasic_vert,fragmentShader:Ye.meshbasic_frag},lambert:{uniforms:Ht([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new He(0)},envMapIntensity:{value:1}}]),vertexShader:Ye.meshlambert_vert,fragmentShader:Ye.meshlambert_frag},phong:{uniforms:Ht([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new He(0)},specular:{value:new He(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Ye.meshphong_vert,fragmentShader:Ye.meshphong_frag},standard:{uniforms:Ht([me.common,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.roughnessmap,me.metalnessmap,me.fog,me.lights,{emissive:{value:new He(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ye.meshphysical_vert,fragmentShader:Ye.meshphysical_frag},toon:{uniforms:Ht([me.common,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.gradientmap,me.fog,me.lights,{emissive:{value:new He(0)}}]),vertexShader:Ye.meshtoon_vert,fragmentShader:Ye.meshtoon_frag},matcap:{uniforms:Ht([me.common,me.bumpmap,me.normalmap,me.displacementmap,me.fog,{matcap:{value:null}}]),vertexShader:Ye.meshmatcap_vert,fragmentShader:Ye.meshmatcap_frag},points:{uniforms:Ht([me.points,me.fog]),vertexShader:Ye.points_vert,fragmentShader:Ye.points_frag},dashed:{uniforms:Ht([me.common,me.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ye.linedashed_vert,fragmentShader:Ye.linedashed_frag},depth:{uniforms:Ht([me.common,me.displacementmap]),vertexShader:Ye.depth_vert,fragmentShader:Ye.depth_frag},normal:{uniforms:Ht([me.common,me.bumpmap,me.normalmap,me.displacementmap,{opacity:{value:1}}]),vertexShader:Ye.meshnormal_vert,fragmentShader:Ye.meshnormal_frag},sprite:{uniforms:Ht([me.sprite,me.fog]),vertexShader:Ye.sprite_vert,fragmentShader:Ye.sprite_frag},background:{uniforms:{uvTransform:{value:new Ge},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ye.background_vert,fragmentShader:Ye.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ge}},vertexShader:Ye.backgroundCube_vert,fragmentShader:Ye.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ye.cube_vert,fragmentShader:Ye.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ye.equirect_vert,fragmentShader:Ye.equirect_frag},distance:{uniforms:Ht([me.common,me.displacementmap,{referencePosition:{value:new N},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ye.distance_vert,fragmentShader:Ye.distance_frag},shadow:{uniforms:Ht([me.lights,me.fog,{color:{value:new He(0)},opacity:{value:1}}]),vertexShader:Ye.shadow_vert,fragmentShader:Ye.shadow_frag}};zn.physical={uniforms:Ht([zn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ge},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ge},clearcoatNormalScale:{value:new Fe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ge},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ge},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ge},sheen:{value:0},sheenColor:{value:new He(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ge},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ge},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ge},transmissionSamplerSize:{value:new Fe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ge},attenuationDistance:{value:0},attenuationColor:{value:new He(0)},specularColor:{value:new He(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ge},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ge},anisotropyVector:{value:new Fe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ge}}]),vertexShader:Ye.meshphysical_vert,fragmentShader:Ye.meshphysical_frag};var Qa={r:0,b:0,g:0},cx=new Ne,rf=new Ge;rf.set(-1,0,0,0,1,0,0,0,1);function hx(i,e,t,n,s,r){let o=new He(0),a=s===!0?0:1,l,c,u=null,d=0,h=null;function f(x){let M=x.isScene===!0?x.background:null;if(M&&M.isTexture){let v=x.backgroundBlurriness>0;M=e.get(M,v)}return M}function g(x){let M=!1,v=f(x);v===null?m(o,a):v&&v.isColor&&(m(v,1),M=!0);let S=i.xr.getEnvironmentBlendMode();S==="additive"?t.buffers.color.setClear(0,0,0,1,r):S==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||M)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function y(x,M){let v=f(M);v&&(v.isCubeTexture||v.mapping===Or)?(c===void 0&&(c=new Yt(new Bs(1,1,1),new on({name:"BackgroundCubeMaterial",uniforms:Ji(zn.backgroundCube.uniforms),vertexShader:zn.backgroundCube.vertexShader,fragmentShader:zn.backgroundCube.fragmentShader,side:qt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(S,A,E){this.matrixWorld.copyPosition(E.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=v,c.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(cx.makeRotationFromEuler(M.backgroundRotation)).transpose(),v.isCubeTexture&&v.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(rf),c.material.toneMapped=Je.getTransfer(v.colorSpace)!==ot,(u!==v||d!==v.version||h!==i.toneMapping)&&(c.material.needsUpdate=!0,u=v,d=v.version,h=i.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null)):v&&v.isTexture&&(l===void 0&&(l=new Yt(new Cr(2,2),new on({name:"BackgroundMaterial",uniforms:Ji(zn.background.uniforms),vertexShader:zn.background.vertexShader,fragmentShader:zn.background.fragmentShader,side:On,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=v,l.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,l.material.toneMapped=Je.getTransfer(v.colorSpace)!==ot,v.matrixAutoUpdate===!0&&v.updateMatrix(),l.material.uniforms.uvTransform.value.copy(v.matrix),(u!==v||d!==v.version||h!==i.toneMapping)&&(l.material.needsUpdate=!0,u=v,d=v.version,h=i.toneMapping),l.layers.enableAll(),x.unshift(l,l.geometry,l.material,0,0,null))}function m(x,M){x.getRGB(Qa,Vc(i)),t.buffers.color.setClear(Qa.r,Qa.g,Qa.b,M,r)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(x,M=1){o.set(x),a=M,m(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(x){a=x,m(o,a)},render:g,addToRenderList:y,dispose:p}}function ux(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=h(null),r=s,o=!1;function a(I,L,B,P,D){let Y=!1,G=d(I,P,B,L);r!==G&&(r=G,c(r.object)),Y=f(I,P,B,D),Y&&g(I,P,B,D),D!==null&&e.update(D,i.ELEMENT_ARRAY_BUFFER),(Y||o)&&(o=!1,v(I,L,B,P),D!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(D).buffer))}function l(){return i.createVertexArray()}function c(I){return i.bindVertexArray(I)}function u(I){return i.deleteVertexArray(I)}function d(I,L,B,P){let D=P.wireframe===!0,Y=n[L.id];Y===void 0&&(Y={},n[L.id]=Y);let G=I.isInstancedMesh===!0?I.id:0,ne=Y[G];ne===void 0&&(ne={},Y[G]=ne);let q=ne[B.id];q===void 0&&(q={},ne[B.id]=q);let $=q[D];return $===void 0&&($=h(l()),q[D]=$),$}function h(I){let L=[],B=[],P=[];for(let D=0;D<t;D++)L[D]=0,B[D]=0,P[D]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:B,attributeDivisors:P,object:I,attributes:{},index:null}}function f(I,L,B,P){let D=r.attributes,Y=L.attributes,G=0,ne=B.getAttributes();for(let q in ne)if(ne[q].location>=0){let Q=D[q],be=Y[q];if(be===void 0&&(q==="instanceMatrix"&&I.instanceMatrix&&(be=I.instanceMatrix),q==="instanceColor"&&I.instanceColor&&(be=I.instanceColor)),Q===void 0||Q.attribute!==be||be&&Q.data!==be.data)return!0;G++}return r.attributesNum!==G||r.index!==P}function g(I,L,B,P){let D={},Y=L.attributes,G=0,ne=B.getAttributes();for(let q in ne)if(ne[q].location>=0){let Q=Y[q];Q===void 0&&(q==="instanceMatrix"&&I.instanceMatrix&&(Q=I.instanceMatrix),q==="instanceColor"&&I.instanceColor&&(Q=I.instanceColor));let be={};be.attribute=Q,Q&&Q.data&&(be.data=Q.data),D[q]=be,G++}r.attributes=D,r.attributesNum=G,r.index=P}function y(){let I=r.newAttributes;for(let L=0,B=I.length;L<B;L++)I[L]=0}function m(I){p(I,0)}function p(I,L){let B=r.newAttributes,P=r.enabledAttributes,D=r.attributeDivisors;B[I]=1,P[I]===0&&(i.enableVertexAttribArray(I),P[I]=1),D[I]!==L&&(i.vertexAttribDivisor(I,L),D[I]=L)}function x(){let I=r.newAttributes,L=r.enabledAttributes;for(let B=0,P=L.length;B<P;B++)L[B]!==I[B]&&(i.disableVertexAttribArray(B),L[B]=0)}function M(I,L,B,P,D,Y,G){G===!0?i.vertexAttribIPointer(I,L,B,D,Y):i.vertexAttribPointer(I,L,B,P,D,Y)}function v(I,L,B,P){y();let D=P.attributes,Y=B.getAttributes(),G=L.defaultAttributeValues;for(let ne in Y){let q=Y[ne];if(q.location>=0){let $=D[ne];if($===void 0&&(ne==="instanceMatrix"&&I.instanceMatrix&&($=I.instanceMatrix),ne==="instanceColor"&&I.instanceColor&&($=I.instanceColor)),$!==void 0){let Q=$.normalized,be=$.itemSize,Ae=e.get($);if(Ae===void 0)continue;let Qe=Ae.buffer,We=Ae.type,Ke=Ae.bytesPerElement,j=We===i.INT||We===i.UNSIGNED_INT||$.gpuType===ma;if($.isInterleavedBufferAttribute){let ee=$.data,ve=ee.stride,Ue=$.offset;if(ee.isInstancedInterleavedBuffer){for(let _e=0;_e<q.locationSize;_e++)p(q.location+_e,ee.meshPerAttribute);I.isInstancedMesh!==!0&&P._maxInstanceCount===void 0&&(P._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let _e=0;_e<q.locationSize;_e++)m(q.location+_e);i.bindBuffer(i.ARRAY_BUFFER,Qe);for(let _e=0;_e<q.locationSize;_e++)M(q.location+_e,be/q.locationSize,We,Q,ve*Ke,(Ue+be/q.locationSize*_e)*Ke,j)}else{if($.isInstancedBufferAttribute){for(let ee=0;ee<q.locationSize;ee++)p(q.location+ee,$.meshPerAttribute);I.isInstancedMesh!==!0&&P._maxInstanceCount===void 0&&(P._maxInstanceCount=$.meshPerAttribute*$.count)}else for(let ee=0;ee<q.locationSize;ee++)m(q.location+ee);i.bindBuffer(i.ARRAY_BUFFER,Qe);for(let ee=0;ee<q.locationSize;ee++)M(q.location+ee,be/q.locationSize,We,Q,be*Ke,be/q.locationSize*ee*Ke,j)}}else if(G!==void 0){let Q=G[ne];if(Q!==void 0)switch(Q.length){case 2:i.vertexAttrib2fv(q.location,Q);break;case 3:i.vertexAttrib3fv(q.location,Q);break;case 4:i.vertexAttrib4fv(q.location,Q);break;default:i.vertexAttrib1fv(q.location,Q)}}}}x()}function S(){w();for(let I in n){let L=n[I];for(let B in L){let P=L[B];for(let D in P){let Y=P[D];for(let G in Y)u(Y[G].object),delete Y[G];delete P[D]}}delete n[I]}}function A(I){if(n[I.id]===void 0)return;let L=n[I.id];for(let B in L){let P=L[B];for(let D in P){let Y=P[D];for(let G in Y)u(Y[G].object),delete Y[G];delete P[D]}}delete n[I.id]}function E(I){for(let L in n){let B=n[L];for(let P in B){let D=B[P];if(D[I.id]===void 0)continue;let Y=D[I.id];for(let G in Y)u(Y[G].object),delete Y[G];delete D[I.id]}}}function _(I){for(let L in n){let B=n[L],P=I.isInstancedMesh===!0?I.id:0,D=B[P];if(D!==void 0){for(let Y in D){let G=D[Y];for(let ne in G)u(G[ne].object),delete G[ne];delete D[Y]}delete B[P],Object.keys(B).length===0&&delete n[L]}}}function w(){C(),o=!0,r!==s&&(r=s,c(r.object))}function C(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:w,resetDefaultState:C,dispose:S,releaseStatesOfGeometry:A,releaseStatesOfObject:_,releaseStatesOfProgram:E,initAttributes:y,enableAttribute:m,disableUnusedAttributes:x}}function dx(i,e,t){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function o(l,c,u){u!==0&&(i.drawArraysInstanced(n,l,c,u),t.update(c,n,u))}function a(l,c,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,u);let h=0;for(let f=0;f<u;f++)h+=c[f];t.update(h,n,1)}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function fx(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let E=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(E.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(E){return!(E!==$t&&n.convert(E)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(E){let _=E===An&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(E!==Zt&&E!==fn&&!_&&n.convert(E)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(E){if(E==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";E="mediump"}return E==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",u=l(c);u!==c&&(De("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let d=t.logarithmicDepthBuffer===!0,h=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&h===!1&&De("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),x=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),M=i.getParameter(i.MAX_VARYING_VECTORS),v=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),S=i.getParameter(i.MAX_SAMPLES),A=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:h,maxTextures:f,maxVertexTextures:g,maxTextureSize:y,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:x,maxVaryings:M,maxFragmentUniforms:v,maxSamples:S,samples:A}}function px(i){let e=this,t=null,n=0,s=!1,r=!1,o=new sn,a=new Ge,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,h){let f=d.length!==0||h||n!==0||s;return s=h,n=d.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,h){t=u(d,h,0)},this.setState=function(d,h,f){let g=d.clippingPlanes,y=d.clipIntersection,m=d.clipShadows,p=i.get(d);if(!s||g===null||g.length===0||r&&!m)r?u(null):c();else{let x=r?0:n,M=x*4,v=p.clippingState||null;l.value=v,v=u(g,h,M,f);for(let S=0;S!==M;++S)v[S]=t[S];p.clippingState=v,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=x}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(d,h,f,g){let y=d!==null?d.length:0,m=null;if(y!==0){if(m=l.value,g!==!0||m===null){let p=f+y*4,x=h.matrixWorldInverse;a.getNormalMatrix(x),(m===null||m.length<p)&&(m=new Float32Array(p));for(let M=0,v=f;M!==y;++M,v+=4)o.copy(d[M]).applyMatrix4(x,a),o.normal.toArray(m,v),m[v+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=y,e.numIntersection=0,m}}var Zs=4,mx=6,gx=20,_x=256,Wr=new Vs,Od=new He,Xc=null,Yc=0,qc=0,$c=!1,xx=new N,Qi=new N,tl=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){let{size:o=256,position:a=xx}=r;Xc=this._renderer.getRenderTarget(),Yc=this._renderer.getActiveCubeFace(),qc=this._renderer.getActiveMipmapLevel(),$c=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=kd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Bd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Xc,Yc,qc),this._renderer.xr.enabled=$c,e.scissorTest=!1,js(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Mi||e.mapping===$i?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Xc=this._renderer.getRenderTarget(),Yc=this._renderer.getActiveCubeFace(),qc=this._renderer.getActiveMipmapLevel(),$c=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Ct,minFilter:Ct,generateMipmaps:!1,type:An,format:$t,colorSpace:xr,depthBuffer:!1},s=Fd(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Fd(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=yx(r)),this._blurMaterial=bx(r,e,t),this._ggxMaterial=vx(r,e,t)}return s}_compileMaterial(e){let t=new Yt(new Rt,e);this._renderer.compile(t,Wr)}_sceneToCubeUV(e,t,n,s,r){let l=new Vt(90,1,t,n),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],d=this._renderer,h=d.autoClear,f=d.toneMapping;d.getClearColor(Od),d.toneMapping=Mn,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(s),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Yt(new Bs,new Wi({name:"PMREM.Background",side:qt,depthWrite:!1,depthTest:!1})));let y=this._backgroundBox,m=y.material,p=!1,x=e.background;x?x.isColor&&(m.color.copy(x),e.background=null,p=!0):(m.color.copy(Od),p=!0);for(let M=0;M<6;M++){let v=M%3;v===0?(l.up.set(0,c[M],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+u[M],r.y,r.z)):v===1?(l.up.set(0,0,c[M]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+u[M],r.z)):(l.up.set(0,c[M],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+u[M]));let S=this._cubeSize;js(s,v*S,M>2?S:0,S,S),d.setRenderTarget(s),p&&d.render(y,l),d.render(e,l)}d.toneMapping=f,d.autoClear=h,e.background=x}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===Mi||e.mapping===$i;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=kd()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Bd());let r=s?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;let a=r.uniforms;a.envMap.value=e;let l=this._cubeSize;js(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,Wr)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){let s=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[n];a.material=o;let l=o.uniforms,c=n/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),d=Math.sqrt(c*c-u*u),h=c*1.25,f=d*h,{_lodMax:g}=this,y=this._sizeLods[n],m=3*y*(n>g-Zs?n-g+Zs:0),p=4*(this._cubeSize-y);l.envMap.value=e.texture,l.roughness.value=f,l.mipInt.value=g-t,js(r,m,p,3*y,2*y),s.setRenderTarget(r),s.render(a,Wr),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=g-n,js(e,m,p,3*y,2*y),s.setRenderTarget(e),s.render(a,Wr)}_blur(e,t,n,s){let r=this._pingPongRenderTarget,o=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(e,r,t,n,o),this._blurPass(r,e,n,n,o)}_blurPass(e,t,n,s,r){let o=this._renderer,a=this._blurMaterial,l=this._lodMeshes[s];l.material=a;let c=a.uniforms;c.envMap.value=e.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-n;let u=this._sizeLods[s],d=3*u*(s>this._lodMax-Zs?s-this._lodMax+Zs:0),h=4*(this._cubeSize-u);js(t,d,h,3*u,2*u),o.setRenderTarget(t),o.render(l,Wr)}};function yx(i){let e=[],t=[],n=i,s=i-Zs+1+mx;for(let r=0;r<s;r++){let o=Math.pow(2,n);e.push(o);let a=1/(o-2),l=-a,c=1+a,u=[l,l,c,l,c,c,l,l,c,c,l,c],d=6,h=6,f=3,g=new Float32Array(f*h*d),y=new Float32Array(f*h*d);for(let p=0;p<d;p++){let x=p%3*2/3-1,M=p>2?0:-1,v=[x,M,0,x+2/3,M,0,x+2/3,M+1,0,x,M,0,x+2/3,M+1,0,x,M+1,0];g.set(v,f*h*p);for(let S=0;S<h;S++){let A=u[S*2]*2-1,E=u[S*2+1]*2-1;p===0?Qi.set(1,E,A):p===1?Qi.set(-A,1,-E):p===2?Qi.set(-A,E,1):p===3?Qi.set(-1,E,-A):p===4?Qi.set(-A,-1,E):Qi.set(A,E,-1),Qi.toArray(y,(p*h+S)*f)}}let m=new Rt;m.setAttribute("position",new Be(g,f)),m.setAttribute("outputDirection",new Be(y,f)),t.push(new Yt(m,null)),n>Zs&&n--}return{lodMeshes:t,sizeLods:e}}function Fd(i,e,t){let n=new jt(i,e,t);return n.texture.mapping=Or,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function js(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function vx(i,e,t){return new on({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:_x,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:sl(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Fn,depthTest:!1,depthWrite:!1})}function bx(i,e,t){return new on({name:"SphericalGaussianBlur",defines:{SAMPLES:gx,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:sl(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:Fn,depthTest:!1,depthWrite:!1})}function Bd(){return new on({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:sl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Fn,depthTest:!1,depthWrite:!1})}function kd(){return new on({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:sl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Fn,depthTest:!1,depthWrite:!1})}function sl(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var nl=class extends jt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new wr(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Bs(5,5,5),r=new on({name:"CubemapFromEquirect",uniforms:Ji(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:qt,blending:Fn});r.uniforms.tEquirect.value=t;let o=new Yt(s,r),a=t.minFilter;return t.minFilter===Bn&&(t.minFilter=Ct),new ca(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,s);e.setRenderTarget(r)}};function Sx(i){let e=new WeakMap,t=new WeakMap,n=null;function s(h,f=!1){return h==null?null:f?o(h):r(h)}function r(h){if(h&&h.isTexture){let f=h.mapping;if(f===da||f===fa)if(e.has(h)){let g=e.get(h).texture;return a(g,h.mapping)}else{let g=h.image;if(g&&g.height>0){let y=new nl(g.height);return y.fromEquirectangularTexture(i,h),e.set(h,y),h.addEventListener("dispose",c),a(y.texture,h.mapping)}else return null}}return h}function o(h){if(h&&h.isTexture){let f=h.mapping,g=f===da||f===fa,y=f===Mi||f===$i;if(g||y){let m=t.get(h),p=m!==void 0?m.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==p)return n===null&&(n=new tl(i)),m=g?n.fromEquirectangular(h,m):n.fromCubemap(h,m),m.texture.pmremVersion=h.pmremVersion,t.set(h,m),m.texture;if(m!==void 0)return m.texture;{let x=h.image;return g&&x&&x.height>0||y&&x&&l(x)?(n===null&&(n=new tl(i)),m=g?n.fromEquirectangular(h):n.fromCubemap(h),m.texture.pmremVersion=h.pmremVersion,t.set(h,m),h.addEventListener("dispose",u),m.texture):null}}}return h}function a(h,f){return f===da?h.mapping=Mi:f===fa&&(h.mapping=$i),h}function l(h){let f=0,g=6;for(let y=0;y<g;y++)h[y]!==void 0&&f++;return f===g}function c(h){let f=h.target;f.removeEventListener("dispose",c);let g=e.get(f);g!==void 0&&(e.delete(f),g.dispose())}function u(h){let f=h.target;f.removeEventListener("dispose",u);let g=t.get(f);g!==void 0&&(t.delete(f),g.dispose())}function d(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:d}}function Mx(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&zi("WebGLRenderer: "+n+" extension not supported."),s}}}function wx(i,e,t,n){let s={},r=new WeakMap;function o(d){let h=d.target;h.index!==null&&e.remove(h.index);for(let g in h.attributes)e.remove(h.attributes[g]);h.removeEventListener("dispose",o),delete s[h.id];let f=r.get(h);f&&(e.remove(f),r.delete(h)),n.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,t.memory.geometries--}function a(d,h){return s[h.id]===!0||(h.addEventListener("dispose",o),s[h.id]=!0,t.memory.geometries++),h}function l(d){let h=d.attributes;for(let f in h)e.update(h[f],i.ARRAY_BUFFER)}function c(d){let h=[],f=d.index,g=d.attributes.position,y=0;if(g===void 0)return;if(f!==null){let x=f.array;y=f.version;for(let M=0,v=x.length;M<v;M+=3){let S=x[M+0],A=x[M+1],E=x[M+2];h.push(S,A,A,E,E,S)}}else{let x=g.array;y=g.version;for(let M=0,v=x.length/3-1;M<v;M+=3){let S=M+0,A=M+1,E=M+2;h.push(S,A,A,E,E,S)}}let m=new(g.count>=65535?Hi:rn)(h,1);m.version=y;let p=r.get(d);p&&e.remove(p),r.set(d,m)}function u(d){let h=r.get(d);if(h){let f=d.index;f!==null&&h.version<f.version&&c(d)}else c(d);return r.get(d)}return{get:a,update:l,getWireframeAttribute:u}}function Ax(i,e,t){let n;function s(d){n=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function l(d,h){i.drawElements(n,h,r,d*o),t.update(h,n,1)}function c(d,h,f){f!==0&&(i.drawElementsInstanced(n,h,r,d*o,f),t.update(h,n,f))}function u(d,h,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,h,0,r,d,0,f);let y=0;for(let m=0;m<f;m++)y+=h[m];t.update(y,n,1)}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function Tx(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(r/3);break;case i.LINES:t.lines+=a*(r/2);break;case i.LINE_STRIP:t.lines+=a*(r-1);break;case i.LINE_LOOP:t.lines+=a*r;break;case i.POINTS:t.points+=a*r;break;default:Ve("WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function Ex(i,e,t){let n=new WeakMap,s=new at;function r(o,a,l){let c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,d=u!==void 0?u.length:0,h=n.get(a);if(h===void 0||h.count!==d){let w=function(){E.dispose(),n.delete(a),a.removeEventListener("dispose",w)};h!==void 0&&h.texture.dispose();let f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,y=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],p=a.morphAttributes.normal||[],x=a.morphAttributes.color||[],M=0;f===!0&&(M=1),g===!0&&(M=2),y===!0&&(M=3);let v=a.attributes.position.count*M,S=1;v>e.maxTextureSize&&(S=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);let A=new Float32Array(v*S*4*d),E=new vr(A,v,S,d);E.type=fn,E.needsUpdate=!0;let _=M*4;for(let C=0;C<d;C++){let I=m[C],L=p[C],B=x[C],P=v*S*4*C;for(let D=0;D<I.count;D++){let Y=D*_;f===!0&&(s.fromBufferAttribute(I,D),A[P+Y+0]=s.x,A[P+Y+1]=s.y,A[P+Y+2]=s.z,A[P+Y+3]=0),g===!0&&(s.fromBufferAttribute(L,D),A[P+Y+4]=s.x,A[P+Y+5]=s.y,A[P+Y+6]=s.z,A[P+Y+7]=0),y===!0&&(s.fromBufferAttribute(B,D),A[P+Y+8]=s.x,A[P+Y+9]=s.y,A[P+Y+10]=s.z,A[P+Y+11]=B.itemSize===4?s.w:1)}}h={count:d,texture:E,size:new Fe(v,S)},n.set(a,h),a.addEventListener("dispose",w)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let f=0;for(let y=0;y<c.length;y++)f+=c[y];let g=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",h.size)}return{update:r}}function Cx(i,e,t,n,s){let r=new WeakMap;function o(c){let u=s.render.frame,d=c.geometry,h=e.get(c,d);if(r.get(h)!==u&&(e.update(h),r.set(h,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==u&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,u))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==u&&(f.update(),r.set(f,u))}return h}function a(){r=new WeakMap}function l(c){let u=c.target;u.removeEventListener("dispose",l),n.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:o,dispose:a}}var Rx={[Mc]:"LINEAR_TONE_MAPPING",[wc]:"REINHARD_TONE_MAPPING",[Ac]:"CINEON_TONE_MAPPING",[Tc]:"ACES_FILMIC_TONE_MAPPING",[Cc]:"AGX_TONE_MAPPING",[Rc]:"NEUTRAL_TONE_MAPPING",[Ec]:"CUSTOM_TONE_MAPPING"};function Ix(i,e,t,n,s,r){let o=new jt(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,l=null,c=new Rt;c.setAttribute("position",new Xt([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new Xt([0,2,0,0,2,0],2));let u=new jo({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new Yt(c,u),h=new Vs(-1,1,1,-1,0,1),f=null,g=null,y=!1,m,p=null,x=[],M=!1;this.setSize=function(v,S){o.setSize(v,S),a!==null&&a.setSize(v,S),l!==null&&l.setSize(v,S);for(let A=0;A<x.length;A++){let E=x[A];E.setSize&&E.setSize(v,S)}},this.setEffects=function(v){x=v,M=x.length>0&&x[0].isRenderPass===!0;let S=o.width,A=o.height;x.length>0&&a===null&&(a=new jt(S,A,{type:An,depthBuffer:!1,stencilBuffer:!1}),l=new jt(S,A,{type:An,depthBuffer:!1,stencilBuffer:!1}));for(let E=0;E<x.length;E++){let _=x[E];_.setSize&&_.setSize(S,A)}},this.begin=function(v,S){if(y||v.toneMapping===Mn&&x.length===0)return!1;if(p=S,S!==null){let A=S.width,E=S.height;(o.width!==A||o.height!==E)&&this.setSize(A,E)}return M===!1&&v.setRenderTarget(o),m=v.toneMapping,v.toneMapping=Mn,!0},this.hasRenderPass=function(){return M},this.end=function(v,S){v.toneMapping=m,y=!0;let A=o,E=a;for(let _=0;_<x.length;_++){let w=x[_];w.enabled!==!1&&(w.render(v,E,A,S),w.needsSwap!==!1&&(A=E,E=E===a?l:a))}if(f!==v.outputColorSpace||g!==v.toneMapping){f=v.outputColorSpace,g=v.toneMapping,u.defines={},Je.getTransfer(f)===ot&&(u.defines.SRGB_TRANSFER="");let _=Rx[g];_&&(u.defines[_]=""),u.needsUpdate=!0}u.uniforms.tDiffuse.value=A.texture,v.setRenderTarget(p),v.render(d,h),p=null,y=!1},this.isCompositing=function(){return y},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),c.dispose(),u.dispose()}}var of=new Ot,Kc=new _i(1,1),af=new vr,lf=new qo,cf=new wr,zd=[],Vd=[],Hd=new Float32Array(16),Gd=new Float32Array(9),Wd=new Float32Array(4);function Js(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=zd[s];if(r===void 0&&(r=new Float32Array(s),zd[s]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(r,a)}return r}function It(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Pt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function rl(i,e){let t=Vd[e];t===void 0&&(t=new Int32Array(e),Vd[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function Px(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Lx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(It(t,e))return;i.uniform2fv(this.addr,e),Pt(t,e)}}function Nx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(It(t,e))return;i.uniform3fv(this.addr,e),Pt(t,e)}}function Dx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(It(t,e))return;i.uniform4fv(this.addr,e),Pt(t,e)}}function Ux(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(It(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Pt(t,e)}else{if(It(t,n))return;Wd.set(n),i.uniformMatrix2fv(this.addr,!1,Wd),Pt(t,n)}}function Ox(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(It(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Pt(t,e)}else{if(It(t,n))return;Gd.set(n),i.uniformMatrix3fv(this.addr,!1,Gd),Pt(t,n)}}function Fx(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(It(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Pt(t,e)}else{if(It(t,n))return;Hd.set(n),i.uniformMatrix4fv(this.addr,!1,Hd),Pt(t,n)}}function Bx(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function kx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(It(t,e))return;i.uniform2iv(this.addr,e),Pt(t,e)}}function zx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(It(t,e))return;i.uniform3iv(this.addr,e),Pt(t,e)}}function Vx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(It(t,e))return;i.uniform4iv(this.addr,e),Pt(t,e)}}function Hx(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Gx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(It(t,e))return;i.uniform2uiv(this.addr,e),Pt(t,e)}}function Wx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(It(t,e))return;i.uniform3uiv(this.addr,e),Pt(t,e)}}function Xx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(It(t,e))return;i.uniform4uiv(this.addr,e),Pt(t,e)}}function Yx(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Kc.compareFunction=t.isReversedDepthBuffer()?Ja:Ka,r=Kc):r=of,t.setTexture2D(e||r,s)}function qx(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||lf,s)}function $x(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||cf,s)}function jx(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||af,s)}function Zx(i){switch(i){case 5126:return Px;case 35664:return Lx;case 35665:return Nx;case 35666:return Dx;case 35674:return Ux;case 35675:return Ox;case 35676:return Fx;case 5124:case 35670:return Bx;case 35667:case 35671:return kx;case 35668:case 35672:return zx;case 35669:case 35673:return Vx;case 5125:return Hx;case 36294:return Gx;case 36295:return Wx;case 36296:return Xx;case 35678:case 36198:case 36298:case 36306:case 35682:return Yx;case 35679:case 36299:case 36307:return qx;case 35680:case 36300:case 36308:case 36293:return $x;case 36289:case 36303:case 36311:case 36292:return jx}}function Kx(i,e){i.uniform1fv(this.addr,e)}function Jx(i,e){let t=Js(e,this.size,2);i.uniform2fv(this.addr,t)}function Qx(i,e){let t=Js(e,this.size,3);i.uniform3fv(this.addr,t)}function ey(i,e){let t=Js(e,this.size,4);i.uniform4fv(this.addr,t)}function ty(i,e){let t=Js(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function ny(i,e){let t=Js(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function iy(i,e){let t=Js(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function sy(i,e){i.uniform1iv(this.addr,e)}function ry(i,e){i.uniform2iv(this.addr,e)}function oy(i,e){i.uniform3iv(this.addr,e)}function ay(i,e){i.uniform4iv(this.addr,e)}function ly(i,e){i.uniform1uiv(this.addr,e)}function cy(i,e){i.uniform2uiv(this.addr,e)}function hy(i,e){i.uniform3uiv(this.addr,e)}function uy(i,e){i.uniform4uiv(this.addr,e)}function dy(i,e,t){let n=this.cache,s=e.length,r=rl(t,s);It(n,r)||(i.uniform1iv(this.addr,r),Pt(n,r));let o;this.type===i.SAMPLER_2D_SHADOW?o=Kc:o=of;for(let a=0;a!==s;++a)t.setTexture2D(e[a]||o,r[a])}function fy(i,e,t){let n=this.cache,s=e.length,r=rl(t,s);It(n,r)||(i.uniform1iv(this.addr,r),Pt(n,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||lf,r[o])}function py(i,e,t){let n=this.cache,s=e.length,r=rl(t,s);It(n,r)||(i.uniform1iv(this.addr,r),Pt(n,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||cf,r[o])}function my(i,e,t){let n=this.cache,s=e.length,r=rl(t,s);It(n,r)||(i.uniform1iv(this.addr,r),Pt(n,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||af,r[o])}function gy(i){switch(i){case 5126:return Kx;case 35664:return Jx;case 35665:return Qx;case 35666:return ey;case 35674:return ty;case 35675:return ny;case 35676:return iy;case 5124:case 35670:return sy;case 35667:case 35671:return ry;case 35668:case 35672:return oy;case 35669:case 35673:return ay;case 5125:return ly;case 36294:return cy;case 36295:return hy;case 36296:return uy;case 35678:case 36198:case 36298:case 36306:case 35682:return dy;case 35679:case 36299:case 36307:return fy;case 35680:case 36300:case 36308:case 36293:return py;case 36289:case 36303:case 36311:case 36292:return my}}var Jc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Zx(t.type)}},Qc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=gy(t.type)}},eh=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(e,t[a.id],n)}}},jc=/(\w+)(\])?(\[|\.)?/g;function Xd(i,e){i.seq.push(e),i.map[e.id]=e}function _y(i,e,t){let n=i.name,s=n.length;for(jc.lastIndex=0;;){let r=jc.exec(n),o=jc.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){Xd(t,c===void 0?new Jc(a,i,e):new Qc(a,i,e));break}else{let d=t.map[a];d===void 0&&(d=new eh(a),Xd(t,d)),t=d}}}var Ks=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){let a=e.getActiveUniform(t,o),l=e.getUniformLocation(t,a.name);_y(a,l,this)}let s=[],r=[];for(let o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,o=t.length;r!==o;++r){let a=t[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let o=e[s];o.id in t&&n.push(o)}return n}};function Yd(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var xy=37297,yy=0;function vy(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}var qd=new Ge;function by(i){Je._getMatrix(qd,Je.workingColorSpace,i);let e=`mat3( ${qd.elements.map(t=>t.toFixed(4))} )`;switch(Je.getTransfer(i)){case yr:return[e,"LinearTransferOETF"];case ot:return[e,"sRGBTransferOETF"];default:return De("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function $d(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+vy(i.getShaderSource(e),a)}else return r}function Sy(i,e){let t=by(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var My={[Mc]:"Linear",[wc]:"Reinhard",[Ac]:"Cineon",[Tc]:"ACESFilmic",[Cc]:"AgX",[Rc]:"Neutral",[Ec]:"Custom"};function wy(i,e){let t=My[e];return t===void 0?(De("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var el=new N;function Ay(){Je.getLuminanceCoefficients(el);let i=el.x.toFixed(4),e=el.y.toFixed(4),t=el.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Ty(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Yr).join(`
`)}function Ey(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Cy(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function Yr(i){return i!==""}function jd(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Zd(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var Ry=/^[ \t]*#include +<([\w\d./]+)>/gm;function th(i){return i.replace(Ry,Py)}var Iy=new Map;function Py(i,e){let t=Ye[e];if(t===void 0){let n=Iy.get(e);if(n!==void 0)t=Ye[n],De('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return th(t)}var Ly=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Kd(i){return i.replace(Ly,Ny)}function Ny(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Jd(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var Dy={[Ur]:"SHADOWMAP_TYPE_PCF",[Ws]:"SHADOWMAP_TYPE_VSM"};function Uy(i){return Dy[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Oy={[Mi]:"ENVMAP_TYPE_CUBE",[$i]:"ENVMAP_TYPE_CUBE",[Or]:"ENVMAP_TYPE_CUBE_UV"};function Fy(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":Oy[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var By={[$i]:"ENVMAP_MODE_REFRACTION"};function ky(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":By[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var zy={[ua]:"ENVMAP_BLENDING_MULTIPLY",[md]:"ENVMAP_BLENDING_MIX",[gd]:"ENVMAP_BLENDING_ADD"};function Vy(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":zy[i.combine]||"ENVMAP_BLENDING_NONE"}function Hy(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function Gy(i,e,t,n){let s=i.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,l=Uy(t),c=Fy(t),u=ky(t),d=Vy(t),h=Hy(t),f=Ty(t),g=Ey(r),y=s.createProgram(),m,p,x=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Yr).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Yr).join(`
`),p.length>0&&(p+=`
`)):(m=[Jd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Yr).join(`
`),p=[Jd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+d:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Mn?"#define TONE_MAPPING":"",t.toneMapping!==Mn?Ye.tonemapping_pars_fragment:"",t.toneMapping!==Mn?wy("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ye.colorspace_pars_fragment,Sy("linearToOutputTexel",t.outputColorSpace),Ay(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Yr).join(`
`)),o=th(o),o=jd(o,t),o=Zd(o,t),a=th(a),a=jd(a,t),a=Zd(a,t),o=Kd(o),a=Kd(a),t.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===Bc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Bc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let M=x+m+o,v=x+p+a,S=Yd(s,s.VERTEX_SHADER,M),A=Yd(s,s.FRAGMENT_SHADER,v);s.attachShader(y,S),s.attachShader(y,A),t.index0AttributeName!==void 0?s.bindAttribLocation(y,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(y,0,"position"),s.linkProgram(y);function E(I){if(i.debug.checkShaderErrors){let L=s.getProgramInfoLog(y)||"",B=s.getShaderInfoLog(S)||"",P=s.getShaderInfoLog(A)||"",D=L.trim(),Y=B.trim(),G=P.trim(),ne=!0,q=!0;if(s.getProgramParameter(y,s.LINK_STATUS)===!1)if(ne=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,y,S,A);else{let $=$d(s,S,"vertex"),Q=$d(s,A,"fragment");Ve("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(y,s.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+D+`
`+$+`
`+Q)}else D!==""?De("WebGLProgram: Program Info Log:",D):(Y===""||G==="")&&(q=!1);q&&(I.diagnostics={runnable:ne,programLog:D,vertexShader:{log:Y,prefix:m},fragmentShader:{log:G,prefix:p}})}s.deleteShader(S),s.deleteShader(A),_=new Ks(s,y),w=Cy(s,y)}let _;this.getUniforms=function(){return _===void 0&&E(this),_};let w;this.getAttributes=function(){return w===void 0&&E(this),w};let C=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=s.getProgramParameter(y,xy)),C},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(y),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=yy++,this.cacheKey=e,this.usedTimes=1,this.program=y,this.vertexShader=S,this.fragmentShader=A,this}var Wy=0,nh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new ih(e),t.set(e,n)),n}},ih=class{constructor(e){this.id=Wy++,this.code=e,this.usedTimes=0}};function Xy(i){return i===Ai||i===Vr||i===Hr}function Yy(i,e,t,n,s,r){let o=new br,a=new nh,l=new Set,c=[],u=new Map,d=n.logarithmicDepthBuffer,h=n.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(_){return l.add(_),_===0?"uv":`uv${_}`}function y(_,w,C,I,L,B){let P=I.fog,D=L.geometry,Y=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?I.environment:null,G=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,ne=e.get(_.envMap||Y,G),q=ne&&ne.mapping===Or?ne.image.height:null,$=f[_.type];_.precision!==null&&(h=n.getMaxPrecision(_.precision),h!==_.precision&&De("WebGLProgram.getParameters:",_.precision,"not supported, using",h,"instead."));let Q=D.morphAttributes.position||D.morphAttributes.normal||D.morphAttributes.color,be=Q!==void 0?Q.length:0,Ae=0;D.morphAttributes.position!==void 0&&(Ae=1),D.morphAttributes.normal!==void 0&&(Ae=2),D.morphAttributes.color!==void 0&&(Ae=3);let Qe,We,Ke,j;if($){let ft=zn[$];Qe=ft.vertexShader,We=ft.fragmentShader}else{Qe=_.vertexShader,We=_.fragmentShader;let ft=a.getVertexShaderStage(_),it=a.getFragmentShaderStage(_);a.update(_,ft,it),Ke=ft.id,j=it.id}let ee=i.getRenderTarget(),ve=i.state.buffers.depth.getReversed(),Ue=L.isInstancedMesh===!0,_e=L.isBatchedMesh===!0,Oe=!!_.map,ie=!!_.matcap,te=!!ne,le=!!_.aoMap,ke=!!_.lightMap,Ie=!!_.bumpMap&&_.wireframe===!1,nt=!!_.normalMap,ht=!!_.displacementMap,_t=!!_.emissiveMap,et=!!_.metalnessMap,mt=!!_.roughnessMap,F=_.anisotropy>0,Et=_.clearcoat>0,qe=_.dispersion>0,R=_.retroreflectivity>0,b=_.iridescence>0,k=_.sheen>0,H=_.transmission>0,X=F&&!!_.anisotropyMap,oe=Et&&!!_.clearcoatMap,he=Et&&!!_.clearcoatNormalMap,Z=Et&&!!_.clearcoatRoughnessMap,K=b&&!!_.iridescenceMap,ue=b&&!!_.iridescenceThicknessMap,de=k&&!!_.sheenColorMap,ae=k&&!!_.sheenRoughnessMap,re=!!_.specularMap,Se=!!_.specularColorMap,Pe=!!_.specularIntensityMap,ze=H&&!!_.transmissionMap,U=H&&!!_.thicknessMap,fe=!!_.gradientMap,J=!!_.alphaMap,pe=_.alphaTest>0,ye=!!_.alphaHash,se=!!_.extensions,Le=Mn;_.toneMapped&&(ee===null||ee.isXRRenderTarget===!0)&&(Le=i.toneMapping);let Ce={shaderID:$,shaderType:_.type,shaderName:_.name,vertexShader:Qe,fragmentShader:We,defines:_.defines,customVertexShaderID:Ke,customFragmentShaderID:j,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:h,batching:_e,batchingColor:_e&&L._colorsTexture!==null,instancing:Ue,instancingColor:Ue&&L.instanceColor!==null,instancingMorph:Ue&&L.morphTexture!==null,outputColorSpace:ee===null?i.outputColorSpace:ee.isXRRenderTarget===!0?ee.texture.colorSpace:Je.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:Oe,matcap:ie,envMap:te,envMapMode:te&&ne.mapping,envMapCubeUVHeight:q,aoMap:le,lightMap:ke,bumpMap:Ie,normalMap:nt,displacementMap:ht,emissiveMap:_t,normalMapObjectSpace:nt&&_.normalMapType===yd,normalMapTangentSpace:nt&&_.normalMapType===Gr,packedNormalMap:nt&&_.normalMapType===Gr&&Xy(_.normalMap.format),metalnessMap:et,roughnessMap:mt,anisotropy:F,anisotropyMap:X,clearcoat:Et,clearcoatMap:oe,clearcoatNormalMap:he,clearcoatRoughnessMap:Z,dispersion:qe,retroreflection:R,iridescence:b,iridescenceMap:K,iridescenceThicknessMap:ue,sheen:k,sheenColorMap:de,sheenRoughnessMap:ae,specularMap:re,specularColorMap:Se,specularIntensityMap:Pe,transmission:H,transmissionMap:ze,thicknessMap:U,gradientMap:fe,opaque:_.transparent===!1&&_.blending===Xs&&_.alphaToCoverage===!1,alphaMap:J,alphaTest:pe,alphaHash:ye,combine:_.combine,mapUv:Oe&&g(_.map.channel),aoMapUv:le&&g(_.aoMap.channel),lightMapUv:ke&&g(_.lightMap.channel),bumpMapUv:Ie&&g(_.bumpMap.channel),normalMapUv:nt&&g(_.normalMap.channel),displacementMapUv:ht&&g(_.displacementMap.channel),emissiveMapUv:_t&&g(_.emissiveMap.channel),metalnessMapUv:et&&g(_.metalnessMap.channel),roughnessMapUv:mt&&g(_.roughnessMap.channel),anisotropyMapUv:X&&g(_.anisotropyMap.channel),clearcoatMapUv:oe&&g(_.clearcoatMap.channel),clearcoatNormalMapUv:he&&g(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Z&&g(_.clearcoatRoughnessMap.channel),iridescenceMapUv:K&&g(_.iridescenceMap.channel),iridescenceThicknessMapUv:ue&&g(_.iridescenceThicknessMap.channel),sheenColorMapUv:de&&g(_.sheenColorMap.channel),sheenRoughnessMapUv:ae&&g(_.sheenRoughnessMap.channel),specularMapUv:re&&g(_.specularMap.channel),specularColorMapUv:Se&&g(_.specularColorMap.channel),specularIntensityMapUv:Pe&&g(_.specularIntensityMap.channel),transmissionMapUv:ze&&g(_.transmissionMap.channel),thicknessMapUv:U&&g(_.thicknessMap.channel),alphaMapUv:J&&g(_.alphaMap.channel),vertexTangents:!!D.attributes.tangent&&(nt||F),vertexNormals:!!D.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!D.attributes.color&&D.attributes.color.itemSize===4,pointsUvs:L.isPoints===!0&&!!D.attributes.uv&&(Oe||J),fog:!!P,useFog:_.fog===!0,fogExp2:!!P&&P.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||D.attributes.normal===void 0&&nt===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:ve,skinning:L.isSkinnedMesh===!0,hasPositionAttribute:D.attributes.position!==void 0,morphTargets:D.morphAttributes.position!==void 0,morphNormals:D.morphAttributes.normal!==void 0,morphColors:D.morphAttributes.color!==void 0,morphTargetsCount:be,morphTextureStride:Ae,numSunLights:w.sun.length,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numSunLightShadows:w.sunShadowMap.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numLightProbeGrids:B.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&C.length>0,shadowMapType:i.shadowMap.type,toneMapping:Le,decodeVideoTexture:Oe&&_.map.isVideoTexture===!0&&Je.getTransfer(_.map.colorSpace)===ot,decodeVideoTextureEmissive:_t&&_.emissiveMap.isVideoTexture===!0&&Je.getTransfer(_.emissiveMap.colorSpace)===ot,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===Dt,flipSided:_.side===qt,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:se&&_.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(se&&_.extensions.multiDraw===!0||_e)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return Ce.vertexUv1s=l.has(1),Ce.vertexUv2s=l.has(2),Ce.vertexUv3s=l.has(3),l.clear(),Ce}function m(_){let w=[];if(_.shaderID?w.push(_.shaderID):(w.push(_.customVertexShaderID),w.push(_.customFragmentShaderID)),_.defines!==void 0)for(let C in _.defines)w.push(C),w.push(_.defines[C]);return _.isRawShaderMaterial===!1&&(p(w,_),x(w,_),w.push(i.outputColorSpace)),w.push(_.customProgramCacheKey),w.join()}function p(_,w){_.push(w.precision),_.push(w.outputColorSpace),_.push(w.envMapMode),_.push(w.envMapCubeUVHeight),_.push(w.mapUv),_.push(w.alphaMapUv),_.push(w.lightMapUv),_.push(w.aoMapUv),_.push(w.bumpMapUv),_.push(w.normalMapUv),_.push(w.displacementMapUv),_.push(w.emissiveMapUv),_.push(w.metalnessMapUv),_.push(w.roughnessMapUv),_.push(w.anisotropyMapUv),_.push(w.clearcoatMapUv),_.push(w.clearcoatNormalMapUv),_.push(w.clearcoatRoughnessMapUv),_.push(w.iridescenceMapUv),_.push(w.iridescenceThicknessMapUv),_.push(w.sheenColorMapUv),_.push(w.sheenRoughnessMapUv),_.push(w.specularMapUv),_.push(w.specularColorMapUv),_.push(w.specularIntensityMapUv),_.push(w.transmissionMapUv),_.push(w.thicknessMapUv),_.push(w.combine),_.push(w.fogExp2),_.push(w.sizeAttenuation),_.push(w.morphTargetsCount),_.push(w.morphAttributeCount),_.push(w.numSunLights),_.push(w.numDirLights),_.push(w.numPointLights),_.push(w.numSpotLights),_.push(w.numSpotLightMaps),_.push(w.numHemiLights),_.push(w.numRectAreaLights),_.push(w.numSunLightShadows),_.push(w.numDirLightShadows),_.push(w.numPointLightShadows),_.push(w.numSpotLightShadows),_.push(w.numSpotLightShadowsWithMaps),_.push(w.numLightProbes),_.push(w.shadowMapType),_.push(w.toneMapping),_.push(w.numClippingPlanes),_.push(w.numClipIntersection),_.push(w.depthPacking)}function x(_,w){o.disableAll(),w.instancing&&o.enable(0),w.instancingColor&&o.enable(1),w.instancingMorph&&o.enable(2),w.matcap&&o.enable(3),w.envMap&&o.enable(4),w.normalMapObjectSpace&&o.enable(5),w.normalMapTangentSpace&&o.enable(6),w.clearcoat&&o.enable(7),w.iridescence&&o.enable(8),w.alphaTest&&o.enable(9),w.vertexColors&&o.enable(10),w.vertexAlphas&&o.enable(11),w.vertexUv1s&&o.enable(12),w.vertexUv2s&&o.enable(13),w.vertexUv3s&&o.enable(14),w.vertexTangents&&o.enable(15),w.anisotropy&&o.enable(16),w.alphaHash&&o.enable(17),w.batching&&o.enable(18),w.dispersion&&o.enable(19),w.retroreflection&&o.enable(24),w.batchingColor&&o.enable(20),w.gradientMap&&o.enable(21),w.packedNormalMap&&o.enable(22),w.vertexNormals&&o.enable(23),_.push(o.mask),o.disableAll(),w.fog&&o.enable(0),w.useFog&&o.enable(1),w.flatShading&&o.enable(2),w.logarithmicDepthBuffer&&o.enable(3),w.reversedDepthBuffer&&o.enable(4),w.skinning&&o.enable(5),w.morphTargets&&o.enable(6),w.morphNormals&&o.enable(7),w.morphColors&&o.enable(8),w.premultipliedAlpha&&o.enable(9),w.shadowMapEnabled&&o.enable(10),w.doubleSided&&o.enable(11),w.flipSided&&o.enable(12),w.useDepthPacking&&o.enable(13),w.dithering&&o.enable(14),w.transmission&&o.enable(15),w.sheen&&o.enable(16),w.opaque&&o.enable(17),w.pointsUvs&&o.enable(18),w.decodeVideoTexture&&o.enable(19),w.decodeVideoTextureEmissive&&o.enable(20),w.alphaToCoverage&&o.enable(21),w.numLightProbeGrids>0&&o.enable(22),w.hasPositionAttribute&&o.enable(23),_.push(o.mask)}function M(_){let w=f[_.type],C;if(w){let I=zn[w];C=Nd.clone(I.uniforms)}else C=_.uniforms;return C}function v(_,w){let C=u.get(w);return C!==void 0?++C.usedTimes:(C=new Gy(i,w,_,s),c.push(C),u.set(w,C)),C}function S(_){if(--_.usedTimes===0){let w=c.indexOf(_);c[w]=c[c.length-1],c.pop(),u.delete(_.cacheKey),_.destroy()}}function A(_){a.remove(_)}function E(){a.dispose()}return{getParameters:y,getProgramCacheKey:m,getUniforms:M,acquireProgram:v,releaseProgram:S,releaseShaderCache:A,programs:c,dispose:E}}function qy(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function $y(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function Qd(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function ef(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function o(h){let f=0;return h.isInstancedMesh&&(f+=2),h.isSkinnedMesh&&(f+=1),f}function a(h,f,g,y,m,p){let x=i[e];return x===void 0?(x={id:h.id,object:h,geometry:f,material:g,materialVariant:o(h),groupOrder:y,renderOrder:h.renderOrder,z:m,group:p},i[e]=x):(x.id=h.id,x.object=h,x.geometry=f,x.material=g,x.materialVariant=o(h),x.groupOrder=y,x.renderOrder=h.renderOrder,x.z=m,x.group=p),e++,x}function l(h,f,g,y,m,p,x){x.reversedDepth===!0&&(m=-m);let M=a(h,f,g,y,m,p);g.transmission>0?n.push(M):g.transparent===!0?s.push(M):t.push(M)}function c(h,f,g,y,m,p){let x=a(h,f,g,y,m,p);g.transmission>0?n.unshift(x):g.transparent===!0?s.unshift(x):t.unshift(x)}function u(h,f){t.length>1&&t.sort(h||$y),n.length>1&&n.sort(f||Qd),s.length>1&&s.sort(f||Qd)}function d(){for(let h=e,f=i.length;h<f;h++){let g=i[h];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:d,sort:u}}function jy(){let i=new WeakMap;function e(n,s){let r=i.get(n),o;return r===void 0?(o=new ef,i.set(n,[o])):s>=r.length?(o=new ef,r.push(o)):o=r[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function Zy(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new N,color:new He};break;case"SpotLight":t={position:new N,direction:new N,color:new He,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new N,color:new He,distance:0,decay:0};break;case"HemisphereLight":t={direction:new N,skyColor:new He,groundColor:new He};break;case"RectAreaLight":t={color:new He,position:new N,halfWidth:new N,halfHeight:new N};break}return i[e.id]=t,t}}}function Ky(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Fe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Fe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Fe,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var Jy=0;function Qy(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function ev(i){let e=new Zy,t=Ky(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new N);let s=new N,r=new Ne,o=new Ne;function a(c){let u=0,d=0,h=0;for(let L=0;L<9;L++)n.probe[L].set(0,0,0);let f=0,g=0,y=0,m=0,p=0,x=0,M=0,v=0,S=0,A=0,E=0,_=0,w=0,C=0;c.sort(Qy);for(let L=0,B=c.length;L<B;L++){let P=c[L],D=P.color,Y=P.intensity,G=P.distance,ne=null;if(P.shadow&&P.shadow.map&&(P.shadow.map.texture.format===Ai?ne=P.shadow.map.texture:ne=P.shadow.map.depthTexture||P.shadow.map.texture),P.isAmbientLight)u+=D.r*Y,d+=D.g*Y,h+=D.b*Y;else if(P.isLightProbe){for(let q=0;q<9;q++)n.probe[q].addScaledVector(P.sh.coefficients[q],Y);C++}else if(P.isSunLight){let q=e.get(P);if(q.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let $=P.shadow,Q=t.get(P);Q.shadowIntensity=$.intensity,Q.shadowBias=$.bias,Q.shadowNormalBias=$.normalBias,Q.shadowRadius=$.radius,Q.shadowMapSize.copy($.mapSize).multiply($.getFrameExtents()),n.sunShadow[g]=Q,n.sunShadowMap[g]=ne;let be=$.getViewportCount();for(let Ae=0;Ae<be;Ae++)n.sunShadowMatrix[y+Ae]=$.getMatrix(Ae),n.sunShadowCascade[y+Ae]=$._cascadeData[Ae];y+=be,g++}n.sun[f]=q,f++}else if(P.isDirectionalLight){let q=e.get(P);if(q.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let $=P.shadow,Q=t.get(P);Q.shadowIntensity=$.intensity,Q.shadowBias=$.bias,Q.shadowNormalBias=$.normalBias,Q.shadowRadius=$.radius,Q.shadowMapSize=$.mapSize,n.directionalShadow[m]=Q,n.directionalShadowMap[m]=ne,n.directionalShadowMatrix[m]=P.shadow.matrix,S++}n.directional[m]=q,m++}else if(P.isSpotLight){let q=e.get(P);q.position.setFromMatrixPosition(P.matrixWorld),q.color.copy(D).multiplyScalar(Y),q.distance=G,q.coneCos=Math.cos(P.angle),q.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),q.decay=P.decay,n.spot[x]=q;let $=P.shadow;if(P.map&&(n.spotLightMap[_]=P.map,_++,$.updateMatrices(P),P.castShadow&&w++),n.spotLightMatrix[x]=$.matrix,P.castShadow){let Q=t.get(P);Q.shadowIntensity=$.intensity,Q.shadowBias=$.bias,Q.shadowNormalBias=$.normalBias,Q.shadowRadius=$.radius,Q.shadowMapSize=$.mapSize,n.spotShadow[x]=Q,n.spotShadowMap[x]=ne,E++}x++}else if(P.isRectAreaLight){let q=e.get(P);q.color.copy(D).multiplyScalar(Y),q.halfWidth.set(P.width*.5,0,0),q.halfHeight.set(0,P.height*.5,0),n.rectArea[M]=q,M++}else if(P.isPointLight){let q=e.get(P);if(q.color.copy(P.color).multiplyScalar(P.intensity),q.distance=P.distance,q.decay=P.decay,P.castShadow){let $=P.shadow,Q=t.get(P);Q.shadowIntensity=$.intensity,Q.shadowBias=$.bias,Q.shadowNormalBias=$.normalBias,Q.shadowRadius=$.radius,Q.shadowMapSize=$.mapSize,Q.shadowCameraNear=$.camera.near,Q.shadowCameraFar=$.camera.far,n.pointShadow[p]=Q,n.pointShadowMap[p]=ne,n.pointShadowMatrix[p]=P.shadow.matrix,A++}n.point[p]=q,p++}else if(P.isHemisphereLight){let q=e.get(P);q.skyColor.copy(P.color).multiplyScalar(Y),q.groundColor.copy(P.groundColor).multiplyScalar(Y),n.hemi[v]=q,v++}}M>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=me.LTC_FLOAT_1,n.rectAreaLTC2=me.LTC_FLOAT_2):(n.rectAreaLTC1=me.LTC_HALF_1,n.rectAreaLTC2=me.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=d,n.ambient[2]=h;let I=n.hash;(I.sunLength!==f||I.directionalLength!==m||I.pointLength!==p||I.spotLength!==x||I.rectAreaLength!==M||I.hemiLength!==v||I.numSunShadows!==g||I.numDirectionalShadows!==S||I.numPointShadows!==A||I.numSpotShadows!==E||I.numSpotMaps!==_||I.numLightProbes!==C)&&(n.sun.length=f,n.directional.length=m,n.spot.length=x,n.rectArea.length=M,n.point.length=p,n.hemi.length=v,n.sunShadow.length=g,n.sunShadowMap.length=g,n.sunShadowMatrix.length=y,n.sunShadowCascade.length=y,n.directionalShadow.length=S,n.directionalShadowMap.length=S,n.directionalShadowMatrix.length=S,n.pointShadow.length=A,n.pointShadowMap.length=A,n.pointShadowMatrix.length=A,n.spotShadow.length=E,n.spotShadowMap.length=E,n.spotLightMatrix.length=E+_-w,n.spotLightMap.length=_,n.numSpotLightShadowsWithMaps=w,n.numLightProbes=C,I.sunLength=f,I.directionalLength=m,I.pointLength=p,I.spotLength=x,I.rectAreaLength=M,I.hemiLength=v,I.numSunShadows=g,I.numDirectionalShadows=S,I.numPointShadows=A,I.numSpotShadows=E,I.numSpotMaps=_,I.numLightProbes=C,n.version=Jy++)}function l(c,u){let d=0,h=0,f=0,g=0,y=0,m=0,p=u.matrixWorldInverse;for(let x=0,M=c.length;x<M;x++){let v=c[x];if(v.isSunLight){let S=n.sun[d];S.direction.setFromMatrixPosition(v.matrixWorld),S.direction.transformDirection(p),d++}else if(v.isDirectionalLight){let S=n.directional[h];S.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(p),h++}else if(v.isSpotLight){let S=n.spot[g];S.position.setFromMatrixPosition(v.matrixWorld),S.position.applyMatrix4(p),S.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(p),g++}else if(v.isRectAreaLight){let S=n.rectArea[y];S.position.setFromMatrixPosition(v.matrixWorld),S.position.applyMatrix4(p),o.identity(),r.copy(v.matrixWorld),r.premultiply(p),o.extractRotation(r),S.halfWidth.set(v.width*.5,0,0),S.halfHeight.set(0,v.height*.5,0),S.halfWidth.applyMatrix4(o),S.halfHeight.applyMatrix4(o),y++}else if(v.isPointLight){let S=n.point[f];S.position.setFromMatrixPosition(v.matrixWorld),S.position.applyMatrix4(p),f++}else if(v.isHemisphereLight){let S=n.hemi[m];S.direction.setFromMatrixPosition(v.matrixWorld),S.direction.transformDirection(p),m++}}}return{setup:a,setupView:l,state:n}}function tf(i){let e=new ev(i),t=[],n=[],s=[];function r(h){d.camera=h,t.length=0,n.length=0,s.length=0}function o(h){t.push(h)}function a(h){n.push(h)}function l(h){s.push(h)}function c(){e.setup(t)}function u(h){e.setupView(t,h)}let d={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:d,setupLights:c,setupLightsView:u,pushLight:o,pushShadow:a,pushLightProbeGrid:l}}function tv(i){let e=new WeakMap;function t(s,r=0){let o=e.get(s),a;return o===void 0?(a=new tf(i),e.set(s,[a])):r>=o.length?(a=new tf(i),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}var nv=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,iv=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,sv=[new N(1,0,0),new N(-1,0,0),new N(0,1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1)],rv=[new N(0,-1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1),new N(0,-1,0),new N(0,-1,0)],nf=new Ne,Xr=new N,Zc=new N;function ov(i,e,t){let n=new Fs,s=new Fe,r=new Fe,o=new at,a=new Zo,l=new Ko,c={},u=t.maxTextureSize,d={[On]:qt,[qt]:On,[Dt]:Dt},h=new on({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Fe},radius:{value:4}},vertexShader:nv,fragmentShader:iv}),f=h.clone();f.defines.HORIZONTAL_PASS=1;let g=new Rt;g.setAttribute("position",new Be(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let y=new Yt(g,h),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ur;let p=this.type;this.render=function(A,E,_){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||A.length===0)return;this.type===Zu&&(De("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Ur);let w=i.getRenderTarget(),C=i.getActiveCubeFace(),I=i.getActiveMipmapLevel(),L=i.state;L.setBlending(Fn),L.buffers.depth.getReversed()===!0?L.buffers.color.setClear(0,0,0,0):L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);let B=p!==this.type;B&&E.traverse(function(P){P.material&&(Array.isArray(P.material)?P.material.forEach(D=>D.needsUpdate=!0):P.material.needsUpdate=!0)});for(let P=0,D=A.length;P<D;P++){let Y=A[P],G=Y.shadow;if(G===void 0){De("WebGLShadowMap:",Y,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;s.copy(G.mapSize);let ne=G.getFrameExtents();s.multiply(ne),r.copy(G.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/ne.x),s.x=r.x*ne.x,G.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/ne.y),s.y=r.y*ne.y,G.mapSize.y=r.y));let q=i.state.buffers.depth.getReversed();if(G.camera._reversedDepth=q,G.map===null||B===!0){if(G.map!==null&&(G.map.depthTexture!==null&&(G.map.depthTexture.dispose(),G.map.depthTexture=null),G.map.dispose()),this.type===Ws){if(Y.isPointLight){De("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}G.map=new jt(s.x,s.y,{format:Ai,type:An,minFilter:Ct,magFilter:Ct,generateMipmaps:!1}),G.map.texture.name=Y.name+".shadowMap",G.map.depthTexture=new _i(s.x,s.y,fn),G.map.depthTexture.name=Y.name+".shadowMapDepth",G.map.depthTexture.format=Dn,G.map.depthTexture.compareFunction=null,G.map.depthTexture.minFilter=At,G.map.depthTexture.magFilter=At}else Y.isPointLight?(G.map=new nl(s.x),G.map.depthTexture=new $o(s.x,wn)):(G.map=new jt(s.x,s.y),G.map.depthTexture=new _i(s.x,s.y,wn)),G.map.depthTexture.name=Y.name+".shadowMap",G.map.depthTexture.format=Dn,this.type===Ur?(G.map.depthTexture.compareFunction=q?Ja:Ka,G.map.depthTexture.minFilter=Ct,G.map.depthTexture.magFilter=Ct):(G.map.depthTexture.compareFunction=null,G.map.depthTexture.minFilter=At,G.map.depthTexture.magFilter=At);G.camera.updateProjectionMatrix()}G.map.isWebGLCubeRenderTarget!==!0&&(G.map.width!==s.x||G.map.height!==s.y)&&G.map.setSize(s.x,s.y);let $=G.map.isWebGLCubeRenderTarget?6:G.getViewportCount();Y.isPointLight!==!0&&G.updateMatrices(Y,_);for(let Q=0;Q<$;Q++){let be=G.getCamera(Q);if(Y.isPointLight){let Ae=G.camera,Qe=G.matrix,We=Y.distance||Ae.far;We!==Ae.far&&(Ae.far=We,Ae.updateProjectionMatrix()),Xr.setFromMatrixPosition(Y.matrixWorld),Ae.position.copy(Xr),Zc.copy(Ae.position),Zc.add(sv[Q]),Ae.up.copy(rv[Q]),Ae.lookAt(Zc),Ae.updateMatrixWorld(),Qe.makeTranslation(-Xr.x,-Xr.y,-Xr.z),nf.multiplyMatrices(Ae.projectionMatrix,Ae.matrixWorldInverse),G._frustum.setFromProjectionMatrix(nf,Ae.coordinateSystem,Ae.reversedDepth)}if(G.map.isWebGLCubeRenderTarget)i.setRenderTarget(G.map,Q),i.clear();else{Q===0&&(i.setRenderTarget(G.map),i.clear());let Ae=G.getViewport(Q);o.set(r.x*Ae.x,r.y*Ae.y,r.x*Ae.z,r.y*Ae.w),L.viewport(o)}n=G.getFrustum(Q),v(E,_,be,Y,this.type)}G.isPointLightShadow!==!0&&this.type===Ws&&x(G,_),G.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(w,C,I)};function x(A,E){let _=e.update(y);h.defines.VSM_SAMPLES!==A.blurSamples&&(h.defines.VSM_SAMPLES=A.blurSamples,f.defines.VSM_SAMPLES=A.blurSamples,h.needsUpdate=!0,f.needsUpdate=!0),A.mapPass===null?A.mapPass=new jt(s.x,s.y,{format:Ai,type:An}):(A.mapPass.width!==A.map.width||A.mapPass.height!==A.map.height)&&A.mapPass.setSize(A.map.width,A.map.height),h.uniforms.shadow_pass.value=A.map.depthTexture,h.uniforms.resolution.value.set(A.map.width,A.map.height),h.uniforms.radius.value=A.radius,i.setRenderTarget(A.mapPass),i.clear(),i.renderBufferDirect(E,null,_,h,y,null),f.uniforms.shadow_pass.value=A.mapPass.texture,f.uniforms.resolution.value.set(A.map.width,A.map.height),f.uniforms.radius.value=A.radius,i.setRenderTarget(A.map),i.clear(),i.renderBufferDirect(E,null,_,f,y,null)}function M(A,E,_,w){let C=null,I=_.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(I!==void 0)C=I;else if(C=_.isPointLight===!0?l:a,i.localClippingEnabled&&E.clipShadows===!0&&Array.isArray(E.clippingPlanes)&&E.clippingPlanes.length!==0||E.displacementMap&&E.displacementScale!==0||E.alphaMap&&E.alphaTest>0||E.map&&E.alphaTest>0||E.alphaToCoverage===!0){let L=C.uuid,B=E.uuid,P=c[L];P===void 0&&(P={},c[L]=P);let D=P[B];D===void 0&&(D=C.clone(),P[B]=D,E.addEventListener("dispose",S)),C=D}if(C.visible=E.visible,C.wireframe=E.wireframe,w===Ws?C.side=E.shadowSide!==null?E.shadowSide:E.side:C.side=E.shadowSide!==null?E.shadowSide:d[E.side],C.alphaMap=E.alphaMap,C.alphaTest=E.alphaToCoverage===!0?.5:E.alphaTest,C.map=E.map,C.clipShadows=E.clipShadows,C.clippingPlanes=E.clippingPlanes,C.clipIntersection=E.clipIntersection,C.displacementMap=E.displacementMap,C.displacementScale=E.displacementScale,C.displacementBias=E.displacementBias,C.wireframeLinewidth=E.wireframeLinewidth,C.linewidth=E.linewidth,_.isPointLight===!0&&C.isMeshDistanceMaterial===!0){let L=i.properties.get(C);L.light=_}return C}function v(A,E,_,w,C){if(A.visible===!1)return;if(A.layers.test(E.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&C===Ws)&&(!A.frustumCulled||A.intersectsFrustum(n))){A.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,A.matrixWorld);let B=e.update(A),P=A.material;if(Array.isArray(P)){let D=B.groups;for(let Y=0,G=D.length;Y<G;Y++){let ne=D[Y],q=P[ne.materialIndex];if(q&&q.visible){let $=M(A,q,w,C);A.onBeforeShadow(i,A,E,_,B,$,ne),i.renderBufferDirect(_,null,B,$,A,ne),A.onAfterShadow(i,A,E,_,B,$,ne)}}}else if(P.visible){let D=M(A,P,w,C);A.onBeforeShadow(i,A,E,_,B,D,null),i.renderBufferDirect(_,null,B,D,A,null),A.onAfterShadow(i,A,E,_,B,D,null)}}let L=A.children;for(let B=0,P=L.length;B<P;B++)v(L[B],E,_,w,C)}function S(A){A.target.removeEventListener("dispose",S);for(let _ in c){let w=c[_],C=A.target.uuid;C in w&&(w[C].dispose(),delete w[C])}}}function av(i,e){function t(){let U=!1,fe=new at,J=null,pe=new at(0,0,0,0);return{setMask:function(ye){J!==ye&&!U&&(i.colorMask(ye,ye,ye,ye),J=ye)},setLocked:function(ye){U=ye},setClear:function(ye,se,Le,Ce,ft){ft===!0&&(ye*=Ce,se*=Ce,Le*=Ce),fe.set(ye,se,Le,Ce),pe.equals(fe)===!1&&(i.clearColor(ye,se,Le,Ce),pe.copy(fe))},reset:function(){U=!1,J=null,pe.set(-1,0,0,0)}}}function n(){let U=!1,fe=!1,J=null,pe=null,ye=null;return{setReversed:function(se){if(fe!==se){let Le=e.get("EXT_clip_control");se?Le.clipControlEXT(Le.LOWER_LEFT_EXT,Le.ZERO_TO_ONE_EXT):Le.clipControlEXT(Le.LOWER_LEFT_EXT,Le.NEGATIVE_ONE_TO_ONE_EXT),fe=se;let Ce=ye;ye=null,this.setClear(Ce)}},getReversed:function(){return fe},setTest:function(se){se?ee(i.DEPTH_TEST):ve(i.DEPTH_TEST)},setMask:function(se){J!==se&&!U&&(i.depthMask(se),J=se)},setFunc:function(se){if(fe&&(se=Pd[se]),pe!==se){switch(se){case ko:i.depthFunc(i.NEVER);break;case zo:i.depthFunc(i.ALWAYS);break;case Vo:i.depthFunc(i.LESS);break;case Es:i.depthFunc(i.LEQUAL);break;case Ho:i.depthFunc(i.EQUAL);break;case Go:i.depthFunc(i.GEQUAL);break;case Wo:i.depthFunc(i.GREATER);break;case Xo:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}pe=se}},setLocked:function(se){U=se},setClear:function(se){ye!==se&&(ye=se,fe&&(se=1-se),i.clearDepth(se))},reset:function(){U=!1,J=null,pe=null,ye=null,fe=!1}}}function s(){let U=!1,fe=null,J=null,pe=null,ye=null,se=null,Le=null,Ce=null,ft=null;return{setTest:function(it){U||(it?ee(i.STENCIL_TEST):ve(i.STENCIL_TEST))},setMask:function(it){fe!==it&&!U&&(i.stencilMask(it),fe=it)},setFunc:function(it,mn,Pn){(J!==it||pe!==mn||ye!==Pn)&&(i.stencilFunc(it,mn,Pn),J=it,pe=mn,ye=Pn)},setOp:function(it,mn,Pn){(se!==it||Le!==mn||Ce!==Pn)&&(i.stencilOp(it,mn,Pn),se=it,Le=mn,Ce=Pn)},setLocked:function(it){U=it},setClear:function(it){ft!==it&&(i.clearStencil(it),ft=it)},reset:function(){U=!1,fe=null,J=null,pe=null,ye=null,se=null,Le=null,Ce=null,ft=null}}}let r=new t,o=new n,a=new s,l=new WeakMap,c=new WeakMap,u={},d={},h={},f=new WeakMap,g=[],y=null,m=!1,p=null,x=null,M=null,v=null,S=null,A=null,E=null,_=new He(0,0,0),w=0,C=!1,I=null,L=null,B=null,P=null,D=null,Y=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),G=!1,ne=0,q=i.getParameter(i.VERSION);q.indexOf("WebGL")!==-1?(ne=parseFloat(/^WebGL (\d)/.exec(q)[1]),G=ne>=1):q.indexOf("OpenGL ES")!==-1&&(ne=parseFloat(/^OpenGL ES (\d)/.exec(q)[1]),G=ne>=2);let $=null,Q={},be=i.getParameter(i.SCISSOR_BOX),Ae=i.getParameter(i.VIEWPORT),Qe=new at().fromArray(be),We=new at().fromArray(Ae);function Ke(U,fe,J,pe){let ye=new Uint8Array(4),se=i.createTexture();i.bindTexture(U,se),i.texParameteri(U,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(U,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Le=0;Le<J;Le++)U===i.TEXTURE_3D||U===i.TEXTURE_2D_ARRAY?i.texImage3D(fe,0,i.RGBA,1,1,pe,0,i.RGBA,i.UNSIGNED_BYTE,ye):i.texImage2D(fe+Le,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ye);return se}let j={};j[i.TEXTURE_2D]=Ke(i.TEXTURE_2D,i.TEXTURE_2D,1),j[i.TEXTURE_CUBE_MAP]=Ke(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),j[i.TEXTURE_2D_ARRAY]=Ke(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),j[i.TEXTURE_3D]=Ke(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),ee(i.DEPTH_TEST),o.setFunc(Es),Ie(!1),nt(_c),ee(i.CULL_FACE),le(Fn);function ee(U){u[U]!==!0&&(i.enable(U),u[U]=!0)}function ve(U){u[U]!==!1&&(i.disable(U),u[U]=!1)}function Ue(U,fe){return h[U]!==fe?(i.bindFramebuffer(U,fe),h[U]=fe,U===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=fe),U===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=fe),!0):!1}function _e(U,fe){let J=g,pe=!1;if(U){J=f.get(fe),J===void 0&&(J=[],f.set(fe,J));let ye=U.textures;if(J.length!==ye.length||J[0]!==i.COLOR_ATTACHMENT0){for(let se=0,Le=ye.length;se<Le;se++)J[se]=i.COLOR_ATTACHMENT0+se;J.length=ye.length,pe=!0}}else J[0]!==i.BACK&&(J[0]=i.BACK,pe=!0);pe&&i.drawBuffers(J)}function Oe(U){return y!==U?(i.useProgram(U),y=U,!0):!1}let ie={[qi]:i.FUNC_ADD,[Ju]:i.FUNC_SUBTRACT,[Qu]:i.FUNC_REVERSE_SUBTRACT};ie[ed]=i.MIN,ie[td]=i.MAX;let te={[nd]:i.ZERO,[id]:i.ONE,[sd]:i.SRC_COLOR,[bc]:i.SRC_ALPHA,[hd]:i.SRC_ALPHA_SATURATE,[ld]:i.DST_COLOR,[od]:i.DST_ALPHA,[rd]:i.ONE_MINUS_SRC_COLOR,[Sc]:i.ONE_MINUS_SRC_ALPHA,[cd]:i.ONE_MINUS_DST_COLOR,[ad]:i.ONE_MINUS_DST_ALPHA,[ud]:i.CONSTANT_COLOR,[dd]:i.ONE_MINUS_CONSTANT_COLOR,[fd]:i.CONSTANT_ALPHA,[pd]:i.ONE_MINUS_CONSTANT_ALPHA};function le(U,fe,J,pe,ye,se,Le,Ce,ft,it){if(U===Fn){m===!0&&(ve(i.BLEND),m=!1);return}if(m===!1&&(ee(i.BLEND),m=!0),U!==Ku){if(U!==p||it!==C){if((x!==qi||S!==qi)&&(i.blendEquation(i.FUNC_ADD),x=qi,S=qi),it)switch(U){case Xs:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case xc:i.blendFunc(i.ONE,i.ONE);break;case yc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case vc:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Ve("WebGLState: Invalid blending: ",U);break}else switch(U){case Xs:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case xc:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case yc:Ve("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case vc:Ve("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ve("WebGLState: Invalid blending: ",U);break}M=null,v=null,A=null,E=null,_.set(0,0,0),w=0,p=U,C=it}return}ye=ye||fe,se=se||J,Le=Le||pe,(fe!==x||ye!==S)&&(i.blendEquationSeparate(ie[fe],ie[ye]),x=fe,S=ye),(J!==M||pe!==v||se!==A||Le!==E)&&(i.blendFuncSeparate(te[J],te[pe],te[se],te[Le]),M=J,v=pe,A=se,E=Le),(Ce.equals(_)===!1||ft!==w)&&(i.blendColor(Ce.r,Ce.g,Ce.b,ft),_.copy(Ce),w=ft),p=U,C=!1}function ke(U,fe){U.side===Dt?ve(i.CULL_FACE):ee(i.CULL_FACE);let J=U.side===qt;fe&&(J=!J),Ie(J),U.blending===Xs&&U.transparent===!1?le(Fn):le(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),o.setFunc(U.depthFunc),o.setTest(U.depthTest),o.setMask(U.depthWrite),r.setMask(U.colorWrite);let pe=U.stencilWrite;a.setTest(pe),pe&&(a.setMask(U.stencilWriteMask),a.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),a.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),_t(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?ee(i.SAMPLE_ALPHA_TO_COVERAGE):ve(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ie(U){I!==U&&(U?i.frontFace(i.CW):i.frontFace(i.CCW),I=U)}function nt(U){U!==$u?(ee(i.CULL_FACE),U!==L&&(U===_c?i.cullFace(i.BACK):U===ju?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):ve(i.CULL_FACE),L=U}function ht(U){U!==B&&(G&&i.lineWidth(U),B=U)}function _t(U,fe,J){U?(ee(i.POLYGON_OFFSET_FILL),(P!==fe||D!==J)&&(P=fe,D=J,o.getReversed()&&(fe=-fe),i.polygonOffset(fe,J))):ve(i.POLYGON_OFFSET_FILL)}function et(U){U?ee(i.SCISSOR_TEST):ve(i.SCISSOR_TEST)}function mt(U){U===void 0&&(U=i.TEXTURE0+Y-1),$!==U&&(i.activeTexture(U),$=U)}function F(U,fe,J){J===void 0&&($===null?J=i.TEXTURE0+Y-1:J=$);let pe=Q[J];pe===void 0&&(pe={type:void 0,texture:void 0},Q[J]=pe),(pe.type!==U||pe.texture!==fe)&&($!==J&&(i.activeTexture(J),$=J),i.bindTexture(U,fe||j[U]),pe.type=U,pe.texture=fe)}function Et(){let U=Q[$];U!==void 0&&U.type!==void 0&&(i.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function qe(){try{i.compressedTexImage2D(...arguments)}catch(U){Ve("WebGLState:",U)}}function R(){try{i.compressedTexImage3D(...arguments)}catch(U){Ve("WebGLState:",U)}}function b(){try{i.texSubImage2D(...arguments)}catch(U){Ve("WebGLState:",U)}}function k(){try{i.texSubImage3D(...arguments)}catch(U){Ve("WebGLState:",U)}}function H(){try{i.compressedTexSubImage2D(...arguments)}catch(U){Ve("WebGLState:",U)}}function X(){try{i.compressedTexSubImage3D(...arguments)}catch(U){Ve("WebGLState:",U)}}function oe(){try{i.texStorage2D(...arguments)}catch(U){Ve("WebGLState:",U)}}function he(){try{i.texStorage3D(...arguments)}catch(U){Ve("WebGLState:",U)}}function Z(){try{i.texImage2D(...arguments)}catch(U){Ve("WebGLState:",U)}}function K(){try{i.texImage3D(...arguments)}catch(U){Ve("WebGLState:",U)}}function ue(U){return d[U]!==void 0?d[U]:i.getParameter(U)}function de(U,fe){d[U]!==fe&&(i.pixelStorei(U,fe),d[U]=fe)}function ae(U){Qe.equals(U)===!1&&(i.scissor(U.x,U.y,U.z,U.w),Qe.copy(U))}function re(U){We.equals(U)===!1&&(i.viewport(U.x,U.y,U.z,U.w),We.copy(U))}function Se(U,fe){let J=c.get(fe);J===void 0&&(J=new WeakMap,c.set(fe,J));let pe=J.get(U);pe===void 0&&(pe=i.getUniformBlockIndex(fe,U.name),J.set(U,pe))}function Pe(U,fe){let pe=c.get(fe).get(U);l.get(fe)!==pe&&(i.uniformBlockBinding(fe,pe,U.__bindingPointIndex),l.set(fe,pe))}function ze(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},d={},$=null,Q={},h={},f=new WeakMap,g=[],y=null,m=!1,p=null,x=null,M=null,v=null,S=null,A=null,E=null,_=new He(0,0,0),w=0,C=!1,I=null,L=null,B=null,P=null,D=null,Qe.set(0,0,i.canvas.width,i.canvas.height),We.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:ee,disable:ve,bindFramebuffer:Ue,drawBuffers:_e,useProgram:Oe,setBlending:le,setMaterial:ke,setFlipSided:Ie,setCullFace:nt,setLineWidth:ht,setPolygonOffset:_t,setScissorTest:et,activeTexture:mt,bindTexture:F,unbindTexture:Et,compressedTexImage2D:qe,compressedTexImage3D:R,texImage2D:Z,texImage3D:K,pixelStorei:de,getParameter:ue,updateUBOMapping:Se,uniformBlockBinding:Pe,texStorage2D:oe,texStorage3D:he,texSubImage2D:b,texSubImage3D:k,compressedTexSubImage2D:H,compressedTexSubImage3D:X,scissor:ae,viewport:re,reset:ze}}function lv(i,e,t,n,s,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Fe,u=new WeakMap,d=new Set,h,f=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function y(R,b){return g?new OffscreenCanvas(R,b):Ls("canvas")}function m(R,b,k){let H=1,X=qe(R);if((X.width>k||X.height>k)&&(H=k/Math.max(X.width,X.height)),H<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){let oe=Math.floor(H*X.width),he=Math.floor(H*X.height);h===void 0&&(h=y(oe,he));let Z=b?y(oe,he):h;return Z.width=oe,Z.height=he,Z.getContext("2d").drawImage(R,0,0,oe,he),De("WebGLRenderer: Texture has been resized from ("+X.width+"x"+X.height+") to ("+oe+"x"+he+")."),Z}else return"data"in R&&De("WebGLRenderer: Image in DataTexture is too big ("+X.width+"x"+X.height+")."),R;return R}function p(R){return R.generateMipmaps}function x(R){i.generateMipmap(R)}function M(R){return R.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?i.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function v(R,b,k,H,X,oe=!1){if(R!==null){if(i[R]!==void 0)return i[R];De("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let he;H&&(he=e.get("EXT_texture_norm16"),he||De("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Z=b;if(b===i.RED&&(k===i.FLOAT&&(Z=i.R32F),k===i.HALF_FLOAT&&(Z=i.R16F),k===i.UNSIGNED_BYTE&&(Z=i.R8),k===i.UNSIGNED_SHORT&&he&&(Z=he.R16_EXT),k===i.SHORT&&he&&(Z=he.R16_SNORM_EXT)),b===i.RED_INTEGER&&(k===i.UNSIGNED_BYTE&&(Z=i.R8UI),k===i.UNSIGNED_SHORT&&(Z=i.R16UI),k===i.UNSIGNED_INT&&(Z=i.R32UI),k===i.BYTE&&(Z=i.R8I),k===i.SHORT&&(Z=i.R16I),k===i.INT&&(Z=i.R32I)),b===i.RG&&(k===i.FLOAT&&(Z=i.RG32F),k===i.HALF_FLOAT&&(Z=i.RG16F),k===i.UNSIGNED_BYTE&&(Z=i.RG8),k===i.UNSIGNED_SHORT&&he&&(Z=he.RG16_EXT),k===i.SHORT&&he&&(Z=he.RG16_SNORM_EXT)),b===i.RG_INTEGER&&(k===i.UNSIGNED_BYTE&&(Z=i.RG8UI),k===i.UNSIGNED_SHORT&&(Z=i.RG16UI),k===i.UNSIGNED_INT&&(Z=i.RG32UI),k===i.BYTE&&(Z=i.RG8I),k===i.SHORT&&(Z=i.RG16I),k===i.INT&&(Z=i.RG32I)),b===i.RGB_INTEGER&&(k===i.UNSIGNED_BYTE&&(Z=i.RGB8UI),k===i.UNSIGNED_SHORT&&(Z=i.RGB16UI),k===i.UNSIGNED_INT&&(Z=i.RGB32UI),k===i.BYTE&&(Z=i.RGB8I),k===i.SHORT&&(Z=i.RGB16I),k===i.INT&&(Z=i.RGB32I)),b===i.RGBA_INTEGER&&(k===i.UNSIGNED_BYTE&&(Z=i.RGBA8UI),k===i.UNSIGNED_SHORT&&(Z=i.RGBA16UI),k===i.UNSIGNED_INT&&(Z=i.RGBA32UI),k===i.BYTE&&(Z=i.RGBA8I),k===i.SHORT&&(Z=i.RGBA16I),k===i.INT&&(Z=i.RGBA32I)),b===i.RGB&&(k===i.UNSIGNED_SHORT&&he&&(Z=he.RGB16_EXT),k===i.SHORT&&he&&(Z=he.RGB16_SNORM_EXT),k===i.UNSIGNED_INT_5_9_9_9_REV&&(Z=i.RGB9_E5),k===i.UNSIGNED_INT_10F_11F_11F_REV&&(Z=i.R11F_G11F_B10F)),b===i.RGBA){let K=oe?yr:Je.getTransfer(X);k===i.FLOAT&&(Z=i.RGBA32F),k===i.HALF_FLOAT&&(Z=i.RGBA16F),k===i.UNSIGNED_BYTE&&(Z=K===ot?i.SRGB8_ALPHA8:i.RGBA8),k===i.UNSIGNED_SHORT&&he&&(Z=he.RGBA16_EXT),k===i.SHORT&&he&&(Z=he.RGBA16_SNORM_EXT),k===i.UNSIGNED_SHORT_4_4_4_4&&(Z=i.RGBA4),k===i.UNSIGNED_SHORT_5_5_5_1&&(Z=i.RGB5_A1)}return(Z===i.R16F||Z===i.R32F||Z===i.RG16F||Z===i.RG32F||Z===i.RGBA16F||Z===i.RGBA32F)&&e.get("EXT_color_buffer_float"),Z}function S(R,b){let k;return R?b===null||b===wn||b===$s?k=i.DEPTH24_STENCIL8:b===fn?k=i.DEPTH32F_STENCIL8:b===qs&&(k=i.DEPTH24_STENCIL8,De("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===wn||b===$s?k=i.DEPTH_COMPONENT24:b===fn?k=i.DEPTH_COMPONENT32F:b===qs&&(k=i.DEPTH_COMPONENT16),k}function A(R,b){return p(R)===!0||R.isFramebufferTexture&&R.minFilter!==At&&R.minFilter!==Ct?Math.log2(Math.max(b.width,b.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?b.mipmaps.length:1}function E(R){let b=R.target;b.removeEventListener("dispose",E),w(b),b.isVideoTexture&&u.delete(b),b.isHTMLTexture&&d.delete(b)}function _(R){let b=R.target;b.removeEventListener("dispose",_),I(b)}function w(R){let b=n.get(R);if(b.__webglInit===void 0)return;let k=R.source,H=f.get(k);if(H){let X=H[b.__cacheKey];X.usedTimes--,X.usedTimes===0&&C(R),Object.keys(H).length===0&&f.delete(k)}n.remove(R)}function C(R){let b=n.get(R);i.deleteTexture(b.__webglTexture);let k=R.source,H=f.get(k);delete H[b.__cacheKey],o.memory.textures--}function I(R){let b=n.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),n.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let H=0;H<6;H++){if(Array.isArray(b.__webglFramebuffer[H]))for(let X=0;X<b.__webglFramebuffer[H].length;X++)i.deleteFramebuffer(b.__webglFramebuffer[H][X]);else i.deleteFramebuffer(b.__webglFramebuffer[H]);b.__webglDepthbuffer&&i.deleteRenderbuffer(b.__webglDepthbuffer[H])}else{if(Array.isArray(b.__webglFramebuffer))for(let H=0;H<b.__webglFramebuffer.length;H++)i.deleteFramebuffer(b.__webglFramebuffer[H]);else i.deleteFramebuffer(b.__webglFramebuffer);if(b.__webglDepthbuffer&&i.deleteRenderbuffer(b.__webglDepthbuffer),b.__webglMultisampledFramebuffer&&i.deleteFramebuffer(b.__webglMultisampledFramebuffer),b.__webglColorRenderbuffer)for(let H=0;H<b.__webglColorRenderbuffer.length;H++)b.__webglColorRenderbuffer[H]&&i.deleteRenderbuffer(b.__webglColorRenderbuffer[H]);b.__webglDepthRenderbuffer&&i.deleteRenderbuffer(b.__webglDepthRenderbuffer)}let k=R.textures;for(let H=0,X=k.length;H<X;H++){let oe=n.get(k[H]);oe.__webglTexture&&(i.deleteTexture(oe.__webglTexture),o.memory.textures--),n.remove(k[H])}n.remove(R)}let L=0;function B(){L=0}function P(){return L}function D(R){L=R}function Y(){let R=L;return R>=s.maxTextures&&De("WebGLTextures: Trying to use "+(R+1)+" texture units while this GPU supports only "+s.maxTextures),L+=1,R}function G(R){let b=[];return b.push(R.wrapS),b.push(R.wrapT),b.push(R.wrapR||0),b.push(R.magFilter),b.push(R.minFilter),b.push(R.anisotropy),b.push(R.internalFormat),b.push(R.format),b.push(R.type),b.push(R.generateMipmaps),b.push(R.premultiplyAlpha),b.push(R.flipY),b.push(R.unpackAlignment),b.push(R.colorSpace),b.join()}function ne(R,b){let k=n.get(R);if(R.isVideoTexture&&F(R),R.isRenderTargetTexture===!1&&R.isExternalTexture!==!0&&R.version>0&&k.__version!==R.version){let H=R.image;if(H===null)De("WebGLRenderer: Texture marked for update but no image data found.");else if(H.complete===!1)De("WebGLRenderer: Texture marked for update but image is incomplete");else{ve(k,R,b);return}}else R.isExternalTexture&&(k.__webglTexture=R.sourceTexture?R.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,k.__webglTexture,i.TEXTURE0+b)}function q(R,b){let k=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&k.__version!==R.version){ve(k,R,b);return}else R.isExternalTexture&&(k.__webglTexture=R.sourceTexture?R.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,k.__webglTexture,i.TEXTURE0+b)}function $(R,b){let k=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&k.__version!==R.version){ve(k,R,b);return}t.bindTexture(i.TEXTURE_3D,k.__webglTexture,i.TEXTURE0+b)}function Q(R,b){let k=n.get(R);if(R.isCubeDepthTexture!==!0&&R.version>0&&k.__version!==R.version){Ue(k,R,b);return}t.bindTexture(i.TEXTURE_CUBE_MAP,k.__webglTexture,i.TEXTURE0+b)}let be={[Cs]:i.REPEAT,[dn]:i.CLAMP_TO_EDGE,[Rs]:i.MIRRORED_REPEAT},Ae={[At]:i.NEAREST,[pa]:i.NEAREST_MIPMAP_NEAREST,[ji]:i.NEAREST_MIPMAP_LINEAR,[Ct]:i.LINEAR,[Ys]:i.LINEAR_MIPMAP_NEAREST,[Bn]:i.LINEAR_MIPMAP_LINEAR},Qe={[bd]:i.NEVER,[Td]:i.ALWAYS,[Sd]:i.LESS,[Ka]:i.LEQUAL,[Md]:i.EQUAL,[Ja]:i.GEQUAL,[wd]:i.GREATER,[Ad]:i.NOTEQUAL};function We(R,b){if(b.type===fn&&e.has("OES_texture_float_linear")===!1&&(b.magFilter===Ct||b.magFilter===Ys||b.magFilter===ji||b.magFilter===Bn||b.minFilter===Ct||b.minFilter===Ys||b.minFilter===ji||b.minFilter===Bn)&&De("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(R,i.TEXTURE_WRAP_S,be[b.wrapS]),i.texParameteri(R,i.TEXTURE_WRAP_T,be[b.wrapT]),(R===i.TEXTURE_3D||R===i.TEXTURE_2D_ARRAY)&&i.texParameteri(R,i.TEXTURE_WRAP_R,be[b.wrapR]),i.texParameteri(R,i.TEXTURE_MAG_FILTER,Ae[b.magFilter]),i.texParameteri(R,i.TEXTURE_MIN_FILTER,Ae[b.minFilter]),b.compareFunction&&(i.texParameteri(R,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(R,i.TEXTURE_COMPARE_FUNC,Qe[b.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===At||b.minFilter!==ji&&b.minFilter!==Bn||b.type===fn&&e.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||n.get(b).__currentAnisotropy){let k=e.get("EXT_texture_filter_anisotropic");i.texParameterf(R,k.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,s.getMaxAnisotropy())),n.get(b).__currentAnisotropy=b.anisotropy}}}function Ke(R,b){let k=!1;R.__webglInit===void 0&&(R.__webglInit=!0,b.addEventListener("dispose",E));let H=b.source,X=f.get(H);X===void 0&&(X={},f.set(H,X));let oe=G(b);if(oe!==R.__cacheKey){X[oe]===void 0&&(X[oe]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,k=!0),X[oe].usedTimes++;let he=X[R.__cacheKey];he!==void 0&&(X[R.__cacheKey].usedTimes--,he.usedTimes===0&&C(b)),R.__cacheKey=oe,R.__webglTexture=X[oe].texture}return k}function j(R,b,k){return Math.floor(Math.floor(R/k)/b)}function ee(R,b,k,H){let oe=R.updateRanges;if(oe.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,b.width,b.height,k,H,b.data);else{oe.sort((de,ae)=>de.start-ae.start);let he=0;for(let de=1;de<oe.length;de++){let ae=oe[he],re=oe[de],Se=ae.start+ae.count,Pe=j(re.start,b.width,4),ze=j(ae.start,b.width,4);re.start<=Se+1&&Pe===ze&&j(re.start+re.count-1,b.width,4)===Pe?ae.count=Math.max(ae.count,re.start+re.count-ae.start):(++he,oe[he]=re)}oe.length=he+1;let Z=t.getParameter(i.UNPACK_ROW_LENGTH),K=t.getParameter(i.UNPACK_SKIP_PIXELS),ue=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,b.width);for(let de=0,ae=oe.length;de<ae;de++){let re=oe[de],Se=Math.floor(re.start/4),Pe=Math.ceil(re.count/4),ze=Se%b.width,U=Math.floor(Se/b.width),fe=Pe,J=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,ze),t.pixelStorei(i.UNPACK_SKIP_ROWS,U),t.texSubImage2D(i.TEXTURE_2D,0,ze,U,fe,J,k,H,b.data)}R.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,Z),t.pixelStorei(i.UNPACK_SKIP_PIXELS,K),t.pixelStorei(i.UNPACK_SKIP_ROWS,ue)}}function ve(R,b,k){let H=i.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(H=i.TEXTURE_2D_ARRAY),b.isData3DTexture&&(H=i.TEXTURE_3D);let X=Ke(R,b),oe=b.source;t.bindTexture(H,R.__webglTexture,i.TEXTURE0+k);let he=n.get(oe);if(oe.version!==he.__version||X===!0){if(t.activeTexture(i.TEXTURE0+k),(typeof ImageBitmap<"u"&&b.image instanceof ImageBitmap)===!1){let J=Je.getPrimaries(Je.workingColorSpace),pe=b.colorSpace===Tn?null:Je.getPrimaries(b.colorSpace),ye=b.colorSpace===Tn||J===pe?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,b.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ye)}t.pixelStorei(i.UNPACK_ALIGNMENT,b.unpackAlignment);let K=m(b.image,!1,s.maxTextureSize);K=Et(b,K);let ue=r.convert(b.format,b.colorSpace),de=r.convert(b.type),ae=v(b.internalFormat,ue,de,b.normalized,b.colorSpace,b.isVideoTexture);We(H,b);let re,Se=b.mipmaps,Pe=b.isVideoTexture!==!0,ze=he.__version===void 0||X===!0,U=oe.dataReady,fe=A(b,K);if(b.isDepthTexture)ae=S(b.format===wi,b.type),ze&&(Pe?t.texStorage2D(i.TEXTURE_2D,1,ae,K.width,K.height):t.texImage2D(i.TEXTURE_2D,0,ae,K.width,K.height,0,ue,de,null));else if(b.isDataTexture)if(Se.length>0){Pe&&ze&&t.texStorage2D(i.TEXTURE_2D,fe,ae,Se[0].width,Se[0].height);for(let J=0,pe=Se.length;J<pe;J++)re=Se[J],Pe?U&&t.texSubImage2D(i.TEXTURE_2D,J,0,0,re.width,re.height,ue,de,re.data):t.texImage2D(i.TEXTURE_2D,J,ae,re.width,re.height,0,ue,de,re.data);b.generateMipmaps=!1}else Pe?(ze&&t.texStorage2D(i.TEXTURE_2D,fe,ae,K.width,K.height),U&&ee(b,K,ue,de)):t.texImage2D(i.TEXTURE_2D,0,ae,K.width,K.height,0,ue,de,K.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){Pe&&ze&&t.texStorage3D(i.TEXTURE_2D_ARRAY,fe,ae,Se[0].width,Se[0].height,K.depth);for(let J=0,pe=Se.length;J<pe;J++)if(re=Se[J],b.format!==$t)if(ue!==null)if(Pe){if(U)if(b.layerUpdates.size>0){let ye=Wc(re.width,re.height,b.format,b.type);for(let se of b.layerUpdates){let Le=re.data.subarray(se*ye/re.data.BYTES_PER_ELEMENT,(se+1)*ye/re.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,J,0,0,se,re.width,re.height,1,ue,Le)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,J,0,0,0,re.width,re.height,K.depth,ue,re.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,J,ae,re.width,re.height,K.depth,0,re.data,0,0);else De("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Pe?U&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,J,0,0,0,re.width,re.height,K.depth,ue,de,re.data):t.texImage3D(i.TEXTURE_2D_ARRAY,J,ae,re.width,re.height,K.depth,0,ue,de,re.data);b.layerUpdates.size>0&&b.clearLayerUpdates()}else{Pe&&ze&&t.texStorage2D(i.TEXTURE_2D,fe,ae,Se[0].width,Se[0].height);for(let J=0,pe=Se.length;J<pe;J++)re=Se[J],b.format!==$t?ue!==null?Pe?U&&t.compressedTexSubImage2D(i.TEXTURE_2D,J,0,0,re.width,re.height,ue,re.data):t.compressedTexImage2D(i.TEXTURE_2D,J,ae,re.width,re.height,0,re.data):De("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Pe?U&&t.texSubImage2D(i.TEXTURE_2D,J,0,0,re.width,re.height,ue,de,re.data):t.texImage2D(i.TEXTURE_2D,J,ae,re.width,re.height,0,ue,de,re.data)}else if(b.isDataArrayTexture)if(Pe){if(ze&&t.texStorage3D(i.TEXTURE_2D_ARRAY,fe,ae,K.width,K.height,K.depth),U)if(b.layerUpdates.size>0){let J=Wc(K.width,K.height,b.format,b.type);for(let pe of b.layerUpdates){let ye=K.data.subarray(pe*J/K.data.BYTES_PER_ELEMENT,(pe+1)*J/K.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,pe,K.width,K.height,1,ue,de,ye)}b.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,K.width,K.height,K.depth,ue,de,K.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,ae,K.width,K.height,K.depth,0,ue,de,K.data);else if(b.isData3DTexture)Pe?(ze&&t.texStorage3D(i.TEXTURE_3D,fe,ae,K.width,K.height,K.depth),U&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,K.width,K.height,K.depth,ue,de,K.data)):t.texImage3D(i.TEXTURE_3D,0,ae,K.width,K.height,K.depth,0,ue,de,K.data);else if(b.isFramebufferTexture){if(ze)if(Pe)t.texStorage2D(i.TEXTURE_2D,fe,ae,K.width,K.height);else{let J=K.width,pe=K.height;for(let ye=0;ye<fe;ye++)t.texImage2D(i.TEXTURE_2D,ye,ae,J,pe,0,ue,de,null),J>>=1,pe>>=1}}else if(b.isHTMLTexture){if("texElementImage2D"in i){let J=i.canvas;if(J.hasAttribute("layoutsubtree")||J.setAttribute("layoutsubtree","true"),K.parentNode!==J){J.appendChild(K),d.add(b),J.onpaint=pe=>{let ye=pe.changedElements;for(let se of d)ye.includes(se.image)&&(se.needsUpdate=!0)},J.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,K);else{let ye=i.RGBA,se=i.RGBA,Le=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,ye,se,Le,K)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Se.length>0){if(Pe&&ze){let J=qe(Se[0]);t.texStorage2D(i.TEXTURE_2D,fe,ae,J.width,J.height)}for(let J=0,pe=Se.length;J<pe;J++)re=Se[J],Pe?U&&t.texSubImage2D(i.TEXTURE_2D,J,0,0,ue,de,re):t.texImage2D(i.TEXTURE_2D,J,ae,ue,de,re);b.generateMipmaps=!1}else if(Pe){if(ze){let J=qe(K);t.texStorage2D(i.TEXTURE_2D,fe,ae,J.width,J.height)}U&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ue,de,K)}else t.texImage2D(i.TEXTURE_2D,0,ae,ue,de,K);p(b)&&x(H),he.__version=oe.version,b.onUpdate&&b.onUpdate(b)}R.__version=b.version}function Ue(R,b,k){if(b.image.length!==6)return;let H=Ke(R,b),X=b.source;t.bindTexture(i.TEXTURE_CUBE_MAP,R.__webglTexture,i.TEXTURE0+k);let oe=n.get(X);if(X.version!==oe.__version||H===!0){t.activeTexture(i.TEXTURE0+k);let he=Je.getPrimaries(Je.workingColorSpace),Z=b.colorSpace===Tn?null:Je.getPrimaries(b.colorSpace),K=b.colorSpace===Tn||he===Z?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,b.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,b.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,K);let ue=b.isCompressedTexture||b.image[0].isCompressedTexture,de=b.image[0]&&b.image[0].isDataTexture,ae=[];for(let se=0;se<6;se++)!ue&&!de?ae[se]=m(b.image[se],!0,s.maxCubemapSize):ae[se]=de?b.image[se].image:b.image[se],ae[se]=Et(b,ae[se]);let re=ae[0],Se=r.convert(b.format,b.colorSpace),Pe=r.convert(b.type),ze=v(b.internalFormat,Se,Pe,b.normalized,b.colorSpace),U=b.isVideoTexture!==!0,fe=oe.__version===void 0||H===!0,J=X.dataReady,pe=A(b,re);We(i.TEXTURE_CUBE_MAP,b);let ye;if(ue){U&&fe&&t.texStorage2D(i.TEXTURE_CUBE_MAP,pe,ze,re.width,re.height);for(let se=0;se<6;se++){ye=ae[se].mipmaps;for(let Le=0;Le<ye.length;Le++){let Ce=ye[Le];b.format!==$t?Se!==null?U?J&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Le,0,0,Ce.width,Ce.height,Se,Ce.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Le,ze,Ce.width,Ce.height,0,Ce.data):De("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):U?J&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Le,0,0,Ce.width,Ce.height,Se,Pe,Ce.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Le,ze,Ce.width,Ce.height,0,Se,Pe,Ce.data)}}}else{if(ye=b.mipmaps,U&&fe){ye.length>0&&pe++;let se=qe(ae[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,pe,ze,se.width,se.height)}for(let se=0;se<6;se++)if(de){U?J&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,0,0,ae[se].width,ae[se].height,Se,Pe,ae[se].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,ze,ae[se].width,ae[se].height,0,Se,Pe,ae[se].data);for(let Le=0;Le<ye.length;Le++){let ft=ye[Le].image[se].image;U?J&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Le+1,0,0,ft.width,ft.height,Se,Pe,ft.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Le+1,ze,ft.width,ft.height,0,Se,Pe,ft.data)}}else{U?J&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,0,0,Se,Pe,ae[se]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,ze,Se,Pe,ae[se]);for(let Le=0;Le<ye.length;Le++){let Ce=ye[Le];U?J&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Le+1,0,0,Se,Pe,Ce.image[se]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Le+1,ze,Se,Pe,Ce.image[se])}}}p(b)&&x(i.TEXTURE_CUBE_MAP),oe.__version=X.version,b.onUpdate&&b.onUpdate(b)}R.__version=b.version}function _e(R,b,k,H,X,oe){let he=r.convert(k.format,k.colorSpace),Z=r.convert(k.type),K=v(k.internalFormat,he,Z,k.normalized,k.colorSpace),ue=n.get(b),de=n.get(k);if(de.__renderTarget=b,!ue.__hasExternalTextures){let ae=Math.max(1,b.width>>oe),re=Math.max(1,b.height>>oe);X===i.TEXTURE_3D||X===i.TEXTURE_2D_ARRAY?t.texImage3D(X,oe,K,ae,re,b.depth,0,he,Z,null):t.texImage2D(X,oe,K,ae,re,0,he,Z,null)}t.bindFramebuffer(i.FRAMEBUFFER,R),mt(b)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,H,X,de.__webglTexture,0,et(b)):(X===i.TEXTURE_2D||X>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&X<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,H,X,de.__webglTexture,oe),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Oe(R,b,k){if(i.bindRenderbuffer(i.RENDERBUFFER,R),b.depthBuffer){let H=b.depthTexture,X=H&&H.isDepthTexture?H.type:null,oe=S(b.stencilBuffer,X),he=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;mt(b)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,et(b),oe,b.width,b.height):k?i.renderbufferStorageMultisample(i.RENDERBUFFER,et(b),oe,b.width,b.height):i.renderbufferStorage(i.RENDERBUFFER,oe,b.width,b.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,he,i.RENDERBUFFER,R)}else{let H=b.textures;for(let X=0;X<H.length;X++){let oe=H[X],he=r.convert(oe.format,oe.colorSpace),Z=r.convert(oe.type),K=v(oe.internalFormat,he,Z,oe.normalized,oe.colorSpace);mt(b)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,et(b),K,b.width,b.height):k?i.renderbufferStorageMultisample(i.RENDERBUFFER,et(b),K,b.width,b.height):i.renderbufferStorage(i.RENDERBUFFER,K,b.width,b.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function ie(R,b,k){let H=b.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,R),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let X=n.get(b.depthTexture);if(X.__renderTarget=b,(!X.__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),H){if(X.__webglInit===void 0&&(X.__webglInit=!0,b.depthTexture.addEventListener("dispose",E)),X.__webglTexture===void 0){X.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,X.__webglTexture),We(i.TEXTURE_CUBE_MAP,b.depthTexture);let ue=r.convert(b.depthTexture.format),de=r.convert(b.depthTexture.type),ae;b.depthTexture.format===Dn?ae=i.DEPTH_COMPONENT24:b.depthTexture.format===wi&&(ae=i.DEPTH24_STENCIL8);for(let re=0;re<6;re++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+re,0,ae,b.width,b.height,0,ue,de,null)}}else ne(b.depthTexture,0);let oe=X.__webglTexture,he=et(b),Z=H?i.TEXTURE_CUBE_MAP_POSITIVE_X+k:i.TEXTURE_2D,K=b.depthTexture.format===wi?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(b.depthTexture.format===Dn)mt(b)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,K,Z,oe,0,he):i.framebufferTexture2D(i.FRAMEBUFFER,K,Z,oe,0);else if(b.depthTexture.format===wi)mt(b)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,K,Z,oe,0,he):i.framebufferTexture2D(i.FRAMEBUFFER,K,Z,oe,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function te(R){let b=n.get(R),k=R.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==R.depthTexture){let H=R.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),H){let X=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,H.removeEventListener("dispose",X)};H.addEventListener("dispose",X),b.__depthDisposeCallback=X}b.__boundDepthTexture=H}if(R.depthTexture&&!b.__autoAllocateDepthBuffer)if(k)for(let H=0;H<6;H++)ie(b.__webglFramebuffer[H],R,H);else{let H=R.texture.mipmaps;H&&H.length>0?ie(b.__webglFramebuffer[0],R,0):ie(b.__webglFramebuffer,R,0)}else if(k){b.__webglDepthbuffer=[];for(let H=0;H<6;H++)if(t.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer[H]),b.__webglDepthbuffer[H]===void 0)b.__webglDepthbuffer[H]=i.createRenderbuffer(),Oe(b.__webglDepthbuffer[H],R,!1);else{let X=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,oe=b.__webglDepthbuffer[H];i.bindRenderbuffer(i.RENDERBUFFER,oe),i.framebufferRenderbuffer(i.FRAMEBUFFER,X,i.RENDERBUFFER,oe)}}else{let H=R.texture.mipmaps;if(H&&H.length>0?t.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=i.createRenderbuffer(),Oe(b.__webglDepthbuffer,R,!1);else{let X=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,oe=b.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,oe),i.framebufferRenderbuffer(i.FRAMEBUFFER,X,i.RENDERBUFFER,oe)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function le(R,b,k){let H=n.get(R);b!==void 0&&_e(H.__webglFramebuffer,R,R.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),k!==void 0&&te(R)}function ke(R){let b=R.texture,k=n.get(R),H=n.get(b);R.addEventListener("dispose",_);let X=R.textures,oe=R.isWebGLCubeRenderTarget===!0,he=X.length>1;if(he||(H.__webglTexture===void 0&&(H.__webglTexture=i.createTexture()),H.__version=b.version,o.memory.textures++),oe){k.__webglFramebuffer=[];for(let Z=0;Z<6;Z++)if(b.mipmaps&&b.mipmaps.length>0){k.__webglFramebuffer[Z]=[];for(let K=0;K<b.mipmaps.length;K++)k.__webglFramebuffer[Z][K]=i.createFramebuffer()}else k.__webglFramebuffer[Z]=i.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){k.__webglFramebuffer=[];for(let Z=0;Z<b.mipmaps.length;Z++)k.__webglFramebuffer[Z]=i.createFramebuffer()}else k.__webglFramebuffer=i.createFramebuffer();if(he)for(let Z=0,K=X.length;Z<K;Z++){let ue=n.get(X[Z]);ue.__webglTexture===void 0&&(ue.__webglTexture=i.createTexture(),o.memory.textures++)}if(R.samples>0&&mt(R)===!1){k.__webglMultisampledFramebuffer=i.createFramebuffer(),k.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,k.__webglMultisampledFramebuffer);for(let Z=0;Z<X.length;Z++){let K=X[Z];k.__webglColorRenderbuffer[Z]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,k.__webglColorRenderbuffer[Z]);let ue=r.convert(K.format,K.colorSpace),de=r.convert(K.type),ae=v(K.internalFormat,ue,de,K.normalized,K.colorSpace,R.isXRRenderTarget===!0),re=et(R);i.renderbufferStorageMultisample(i.RENDERBUFFER,re,ae,R.width,R.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Z,i.RENDERBUFFER,k.__webglColorRenderbuffer[Z])}i.bindRenderbuffer(i.RENDERBUFFER,null),R.depthBuffer&&(k.__webglDepthRenderbuffer=i.createRenderbuffer(),Oe(k.__webglDepthRenderbuffer,R,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(oe){t.bindTexture(i.TEXTURE_CUBE_MAP,H.__webglTexture),We(i.TEXTURE_CUBE_MAP,b);for(let Z=0;Z<6;Z++)if(b.mipmaps&&b.mipmaps.length>0)for(let K=0;K<b.mipmaps.length;K++)_e(k.__webglFramebuffer[Z][K],R,b,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,K);else _e(k.__webglFramebuffer[Z],R,b,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0);p(b)&&x(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(he){for(let Z=0,K=X.length;Z<K;Z++){let ue=X[Z],de=n.get(ue),ae=i.TEXTURE_2D;(R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(ae=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ae,de.__webglTexture),We(ae,ue),_e(k.__webglFramebuffer,R,ue,i.COLOR_ATTACHMENT0+Z,ae,0),p(ue)&&x(ae)}t.unbindTexture()}else{let Z=i.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(Z=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(Z,H.__webglTexture),We(Z,b),b.mipmaps&&b.mipmaps.length>0)for(let K=0;K<b.mipmaps.length;K++)_e(k.__webglFramebuffer[K],R,b,i.COLOR_ATTACHMENT0,Z,K);else _e(k.__webglFramebuffer,R,b,i.COLOR_ATTACHMENT0,Z,0);p(b)&&x(Z),t.unbindTexture()}R.depthBuffer&&te(R)}function Ie(R){let b=R.textures;for(let k=0,H=b.length;k<H;k++){let X=b[k];if(p(X)){let oe=M(R),he=n.get(X).__webglTexture;t.bindTexture(oe,he),x(oe),t.unbindTexture()}}}let nt=[],ht=[];function _t(R){if(R.samples>0){if(mt(R)===!1){let b=R.textures,k=R.width,H=R.height,X=i.COLOR_BUFFER_BIT,oe=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,he=n.get(R),Z=b.length>1;if(Z)for(let ue=0;ue<b.length;ue++)t.bindFramebuffer(i.FRAMEBUFFER,he.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,he.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,he.__webglMultisampledFramebuffer);let K=R.texture.mipmaps;K&&K.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,he.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,he.__webglFramebuffer);for(let ue=0;ue<b.length;ue++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(X|=i.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(X|=i.STENCIL_BUFFER_BIT)),Z){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,he.__webglColorRenderbuffer[ue]);let de=n.get(b[ue]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,de,0)}i.blitFramebuffer(0,0,k,H,0,0,k,H,X,i.NEAREST),l===!0&&(nt.length=0,ht.length=0,nt.push(i.COLOR_ATTACHMENT0+ue),R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&(nt.push(oe),ht.push(oe),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,ht)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,nt))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),Z)for(let ue=0;ue<b.length;ue++){t.bindFramebuffer(i.FRAMEBUFFER,he.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.RENDERBUFFER,he.__webglColorRenderbuffer[ue]);let de=n.get(b[ue]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,he.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.TEXTURE_2D,de,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,he.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&l){let b=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[b])}}}function et(R){return Math.min(s.maxSamples,R.samples)}function mt(R){let b=n.get(R);return R.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function F(R){let b=o.render.frame;u.get(R)!==b&&(u.set(R,b),R.update())}function Et(R,b){let k=R.colorSpace,H=R.format,X=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||k!==xr&&k!==Tn&&(Je.getTransfer(k)===ot?(H!==$t||X!==Zt)&&De("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ve("WebGLTextures: Unsupported texture color space:",k)),b}function qe(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=Y,this.resetTextureUnits=B,this.getTextureUnits=P,this.setTextureUnits=D,this.setTexture2D=ne,this.setTexture2DArray=q,this.setTexture3D=$,this.setTextureCube=Q,this.rebindTextures=le,this.setupRenderTarget=ke,this.updateRenderTargetMipmap=Ie,this.updateMultisampleRenderTarget=_t,this.setupDepthRenderbuffer=te,this.setupFrameBufferTexture=_e,this.useMultisampledRTT=mt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function cv(i,e){function t(n,s=Tn){let r,o=Je.getTransfer(s);if(n===Zt)return i.UNSIGNED_BYTE;if(n===ga)return i.UNSIGNED_SHORT_4_4_4_4;if(n===_a)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Nc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Dc)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Pc)return i.BYTE;if(n===Lc)return i.SHORT;if(n===qs)return i.UNSIGNED_SHORT;if(n===ma)return i.INT;if(n===wn)return i.UNSIGNED_INT;if(n===fn)return i.FLOAT;if(n===An)return i.HALF_FLOAT;if(n===Uc)return i.ALPHA;if(n===Oc)return i.RGB;if(n===$t)return i.RGBA;if(n===Dn)return i.DEPTH_COMPONENT;if(n===wi)return i.DEPTH_STENCIL;if(n===Fc)return i.RED;if(n===xa)return i.RED_INTEGER;if(n===Ai)return i.RG;if(n===ya)return i.RG_INTEGER;if(n===va)return i.RGBA_INTEGER;if(n===Fr||n===Br||n===kr||n===zr)if(o===ot)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Fr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Br)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===kr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===zr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Fr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Br)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===kr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===zr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===ba||n===Sa||n===Ma||n===wa)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===ba)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Sa)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Ma)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===wa)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Aa||n===Ta||n===Ea||n===Ca||n===Ra||n===Vr||n===Ia)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Aa||n===Ta)return o===ot?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Ea)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Ca)return r.COMPRESSED_R11_EAC;if(n===Ra)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Vr)return r.COMPRESSED_RG11_EAC;if(n===Ia)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Pa||n===La||n===Na||n===Da||n===Ua||n===Oa||n===Fa||n===Ba||n===ka||n===za||n===Va||n===Ha||n===Ga||n===Wa)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Pa)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===La)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Na)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Da)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Ua)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Oa)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Fa)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ba)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===ka)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===za)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Va)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Ha)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Ga)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Wa)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Xa||n===Ya||n===qa)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Xa)return o===ot?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Ya)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===qa)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===$a||n===ja||n===Hr||n===Za)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===$a)return r.COMPRESSED_RED_RGTC1_EXT;if(n===ja)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Hr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Za)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===$s?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var hv=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,uv=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,sh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Tr(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new on({vertexShader:hv,fragmentShader:uv,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Yt(new Cr(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},rh=class extends bn{constructor(e,t){super();let n=this,s=null,r=1,o=null,a="local-floor",l=1,c=null,u=null,d=null,h=null,f=null,g=null,y=typeof XRWebGLBinding<"u",m=new sh,p={},x=t.getContextAttributes(),M=null,v=null,S=[],A=[],E=new Fe,_=null,w=null,C=new Vt;C.viewport=new at;let I=new Vt;I.viewport=new at;let L=[C,I],B=new ha,P=null,D=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(j){let ee=S[j];return ee===void 0&&(ee=new Os,S[j]=ee),ee.getTargetRaySpace()},this.getControllerGrip=function(j){let ee=S[j];return ee===void 0&&(ee=new Os,S[j]=ee),ee.getGripSpace()},this.getHand=function(j){let ee=S[j];return ee===void 0&&(ee=new Os,S[j]=ee),ee.getHandSpace()};function Y(j){let ee=A.indexOf(j.inputSource);if(ee===-1)return;let ve=S[ee];ve!==void 0&&(ve.update(j.inputSource,j.frame,c||o),ve.dispatchEvent({type:j.type,data:j.inputSource}))}function G(){s.removeEventListener("select",Y),s.removeEventListener("selectstart",Y),s.removeEventListener("selectend",Y),s.removeEventListener("squeeze",Y),s.removeEventListener("squeezestart",Y),s.removeEventListener("squeezeend",Y),s.removeEventListener("end",G),s.removeEventListener("inputsourceschange",ne);for(let j=0;j<S.length;j++){let ee=A[j];ee!==null&&(A[j]=null,S[j].disconnect(ee))}P=null,D=null,m.reset();for(let j in p)delete p[j];if(e.setRenderTarget(M),f=null,h=null,d=null,s=null,v=null,Ke.stop(),n.isPresenting=!1,e.setPixelRatio(_),e.setSize(E.width,E.height,!1),w!==null){let j=w.camera;j.fov=w.fov,j.zoom=w.zoom,j.updateProjectionMatrix(),w=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(j){r=j,n.isPresenting===!0&&De("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(j){a=j,n.isPresenting===!0&&De("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(j){c=j},this.getBaseLayer=function(){return h!==null?h:f},this.getBinding=function(){return d===null&&y&&(d=new XRWebGLBinding(s,t)),d},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(j){if(s=j,s!==null){if(M=e.getRenderTarget(),s.addEventListener("select",Y),s.addEventListener("selectstart",Y),s.addEventListener("selectend",Y),s.addEventListener("squeeze",Y),s.addEventListener("squeezestart",Y),s.addEventListener("squeezeend",Y),s.addEventListener("end",G),s.addEventListener("inputsourceschange",ne),x.xrCompatible!==!0&&await t.makeXRCompatible(),_=e.getPixelRatio(),e.getSize(E),y&&"createProjectionLayer"in XRWebGLBinding.prototype){let ve=null,Ue=null,_e=null;x.depth&&(_e=x.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ve=x.stencil?wi:Dn,Ue=x.stencil?$s:wn);let Oe={colorFormat:t.RGBA8,depthFormat:_e,scaleFactor:r};d=this.getBinding(),h=d.createProjectionLayer(Oe),s.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),v=new jt(h.textureWidth,h.textureHeight,{format:$t,type:Zt,depthTexture:new _i(h.textureWidth,h.textureHeight,Ue,void 0,void 0,void 0,void 0,void 0,void 0,ve),stencilBuffer:x.stencil,colorSpace:e.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}else{let ve={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,ve),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),v=new jt(f.framebufferWidth,f.framebufferHeight,{format:$t,type:Zt,colorSpace:e.outputColorSpace,stencilBuffer:x.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),Ke.setContext(s),Ke.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function ne(j){for(let ee=0;ee<j.removed.length;ee++){let ve=j.removed[ee],Ue=A.indexOf(ve);Ue>=0&&(A[Ue]=null,S[Ue].disconnect(ve))}for(let ee=0;ee<j.added.length;ee++){let ve=j.added[ee],Ue=A.indexOf(ve);if(Ue===-1){for(let Oe=0;Oe<S.length;Oe++)if(Oe>=A.length){A.push(ve),Ue=Oe;break}else if(A[Oe]===null){A[Oe]=ve,Ue=Oe;break}if(Ue===-1)break}let _e=S[Ue];_e&&_e.connect(ve)}}let q=new N,$=new N;function Q(j,ee,ve){q.setFromMatrixPosition(ee.matrixWorld),$.setFromMatrixPosition(ve.matrixWorld);let Ue=q.distanceTo($),_e=ee.projectionMatrix.elements,Oe=ve.projectionMatrix.elements,ie=_e[14]/(_e[10]-1),te=_e[14]/(_e[10]+1),le=(_e[9]+1)/_e[5],ke=(_e[9]-1)/_e[5],Ie=(_e[8]-1)/_e[0],nt=(Oe[8]+1)/Oe[0],ht=ie*Ie,_t=ie*nt,et=Ue/(-Ie+nt),mt=et*-Ie;if(ee.matrixWorld.decompose(j.position,j.quaternion,j.scale),j.translateX(mt),j.translateZ(et),j.matrixWorld.compose(j.position,j.quaternion,j.scale),j.matrixWorldInverse.copy(j.matrixWorld).invert(),_e[10]===-1)j.projectionMatrix.copy(ee.projectionMatrix),j.projectionMatrixInverse.copy(ee.projectionMatrixInverse);else{let F=ie+et,Et=te+et,qe=ht-mt,R=_t+(Ue-mt),b=le*te/Et*F,k=ke*te/Et*F;j.projectionMatrix.makePerspective(qe,R,b,k,F,Et),j.projectionMatrixInverse.copy(j.projectionMatrix).invert()}}function be(j,ee){ee===null?j.matrixWorld.copy(j.matrix):j.matrixWorld.multiplyMatrices(ee.matrixWorld,j.matrix),j.matrixWorldInverse.copy(j.matrixWorld).invert()}this.updateCamera=function(j){if(s===null)return;let ee=j.near,ve=j.far;m.texture!==null&&(m.depthNear>0&&(ee=m.depthNear),m.depthFar>0&&(ve=m.depthFar)),B.near=I.near=C.near=ee,B.far=I.far=C.far=ve,(P!==B.near||D!==B.far)&&(s.updateRenderState({depthNear:B.near,depthFar:B.far}),P=B.near,D=B.far),B.layers.mask=j.layers.mask|6,C.layers.mask=B.layers.mask&-5,I.layers.mask=B.layers.mask&-3;let Ue=j.parent,_e=B.cameras;be(B,Ue);for(let Oe=0;Oe<_e.length;Oe++)be(_e[Oe],Ue);_e.length===2?Q(B,C,I):B.projectionMatrix.copy(C.projectionMatrix),w===null&&j.isPerspectiveCamera&&(w={camera:j,fov:j.fov,zoom:j.zoom}),Ae(j,B,Ue)};function Ae(j,ee,ve){ve===null?j.matrix.copy(ee.matrixWorld):(j.matrix.copy(ve.matrixWorld),j.matrix.invert(),j.matrix.multiply(ee.matrixWorld)),j.matrix.decompose(j.position,j.quaternion,j.scale),j.updateMatrixWorld(!0),j.projectionMatrix.copy(ee.projectionMatrix),j.projectionMatrixInverse.copy(ee.projectionMatrixInverse),j.isPerspectiveCamera&&(j.fov=Ds*2*Math.atan(1/j.projectionMatrix.elements[5]),j.zoom=1)}this.getCamera=function(){return B},this.getFoveation=function(){if(!(h===null&&f===null))return l},this.setFoveation=function(j){l=j,h!==null&&(h.fixedFoveation=j),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=j)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(B)},this.getCameraTexture=function(j){return p[j]};let Qe=null;function We(j,ee){if(u=ee.getViewerPose(c||o),g=ee,u!==null){let ve=u.views;f!==null&&(e.setRenderTargetFramebuffer(v,f.framebuffer),e.setRenderTarget(v));let Ue=!1;ve.length!==B.cameras.length&&(B.cameras.length=0,Ue=!0);for(let te=0;te<ve.length;te++){let le=ve[te],ke=null;if(f!==null)ke=f.getViewport(le);else{let nt=d.getViewSubImage(h,le);ke=nt.viewport,te===0&&(e.setRenderTargetTextures(v,nt.colorTexture,nt.depthStencilTexture),e.setRenderTarget(v))}let Ie=L[te];Ie===void 0&&(Ie=new Vt,Ie.layers.enable(te),Ie.viewport=new at,L[te]=Ie),Ie.matrix.fromArray(le.transform.matrix),Ie.matrix.decompose(Ie.position,Ie.quaternion,Ie.scale),Ie.projectionMatrix.fromArray(le.projectionMatrix),Ie.projectionMatrixInverse.copy(Ie.projectionMatrix).invert(),Ie.viewport.set(ke.x,ke.y,ke.width,ke.height),te===0&&(B.matrix.copy(Ie.matrix),B.matrix.decompose(B.position,B.quaternion,B.scale)),Ue===!0&&B.cameras.push(Ie)}let _e=s.enabledFeatures;if(_e&&_e.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&y){d=n.getBinding();let te=d.getDepthInformation(ve[0]);te&&te.isValid&&te.texture&&m.init(te,s.renderState)}if(_e&&_e.includes("camera-access")&&y){e.state.unbindTexture(),d=n.getBinding();for(let te=0;te<ve.length;te++){let le=ve[te].camera;if(le){let ke=p[le];ke||(ke=new Tr,p[le]=ke);let Ie=d.getCameraImage(le);ke.sourceTexture=Ie}}}}for(let ve=0;ve<S.length;ve++){let Ue=A[ve],_e=S[ve];Ue!==null&&_e!==void 0&&_e.update(Ue,ee,c||o)}Qe&&Qe(j,ee),ee.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ee}),g=null}let Ke=new sf;Ke.setAnimationLoop(We),this.setAnimationLoop=function(j){Qe=j},this.dispose=function(){}}},dv=new Ne,hf=new Ge;hf.set(-1,0,0,0,1,0,0,0,1);function fv(i,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,Vc(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,x,M,v){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(m,p):p.isMeshLambertMaterial?(r(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(m,p),d(m,p)):p.isMeshPhongMaterial?(r(m,p),u(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(m,p),h(m,p),p.isMeshPhysicalMaterial&&f(m,p,v)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),y(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?l(m,p,x,M):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===qt&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===qt&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let x=e.get(p),M=x.envMap,v=x.envMapRotation;M&&(m.envMap.value=M,m.envMapRotation.value.setFromMatrix4(dv.makeRotationFromEuler(v)).transpose(),M.isCubeTexture&&M.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(hf),m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,x,M){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*x,m.scale.value=M*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function d(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function h(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,x){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===qt&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.retroreflectivity>0&&(m.retroreflectivity.value=p.retroreflectivity),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=x.texture,m.transmissionSamplerSize.value.set(x.width,x.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function y(m,p){let x=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(x.matrixWorld),m.nearDistance.value=x.shadow.camera.near,m.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function pv(i,e,t,n){let s={},r={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(v,S){let A=S.program;n.uniformBlockBinding(v,A)}function c(v,S){let A=s[v.id];A===void 0&&(m(v),A=u(v),s[v.id]=A,v.addEventListener("dispose",x));let E=S.program;n.updateUBOMapping(v,E);let _=e.render.frame;r[v.id]!==_&&(h(v),r[v.id]=_)}function u(v){let S=d();v.__bindingPointIndex=S;let A=i.createBuffer(),E=v.__size,_=v.usage;return i.bindBuffer(i.UNIFORM_BUFFER,A),i.bufferData(i.UNIFORM_BUFFER,E,_),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,S,A),A}function d(){for(let v=0;v<a;v++)if(o.indexOf(v)===-1)return o.push(v),v;return Ve("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(v){let S=s[v.id],A=v.uniforms,E=v.__cache;i.bindBuffer(i.UNIFORM_BUFFER,S);for(let _=0,w=A.length;_<w;_++){let C=A[_];if(Array.isArray(C))for(let I=0,L=C.length;I<L;I++)f(C[I],_,I,E);else f(C,_,0,E)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(v,S,A,E){if(y(v,S,A,E)===!0){let _=v.__offset,w=v.value;if(Array.isArray(w)){let C=0;for(let I=0;I<w.length;I++){let L=w[I],B=p(L);g(L,v.__data,C),typeof L!="number"&&typeof L!="boolean"&&!L.isMatrix3&&!ArrayBuffer.isView(L)&&(C+=B.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(w,v.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,_,v.__data)}}function g(v,S,A){typeof v=="number"||typeof v=="boolean"?S[0]=v:v.isMatrix3?(S[0]=v.elements[0],S[1]=v.elements[1],S[2]=v.elements[2],S[3]=0,S[4]=v.elements[3],S[5]=v.elements[4],S[6]=v.elements[5],S[7]=0,S[8]=v.elements[6],S[9]=v.elements[7],S[10]=v.elements[8],S[11]=0):ArrayBuffer.isView(v)?S.set(new v.constructor(v.buffer,v.byteOffset,S.length)):v.toArray(S,A)}function y(v,S,A,E){let _=v.value,w=S+"_"+A;if(E[w]===void 0)return typeof _=="number"||typeof _=="boolean"?E[w]=_:ArrayBuffer.isView(_)?E[w]=_.slice():E[w]=_.clone(),!0;{let C=E[w];if(typeof _=="number"||typeof _=="boolean"){if(C!==_)return E[w]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(C.equals(_)===!1)return C.copy(_),!0}}return!1}function m(v){let S=v.uniforms,A=0,E=16;for(let w=0,C=S.length;w<C;w++){let I=Array.isArray(S[w])?S[w]:[S[w]];for(let L=0,B=I.length;L<B;L++){let P=I[L],D=Array.isArray(P.value)?P.value:[P.value];for(let Y=0,G=D.length;Y<G;Y++){let ne=D[Y],q=p(ne),$=A%E,Q=$%q.boundary,be=$+Q;A+=Q,be!==0&&E-be<q.storage&&(A+=E-be),P.__data=new Float32Array(q.storage/Float32Array.BYTES_PER_ELEMENT),P.__offset=A,A+=q.storage}}}let _=A%E;return _>0&&(A+=E-_),v.__size=A,v.__cache={},this}function p(v){let S={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(S.boundary=4,S.storage=4):v.isVector2?(S.boundary=8,S.storage=8):v.isVector3||v.isColor?(S.boundary=16,S.storage=12):v.isVector4?(S.boundary=16,S.storage=16):v.isMatrix3?(S.boundary=48,S.storage=48):v.isMatrix4?(S.boundary=64,S.storage=64):v.isTexture?De("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(v)?(S.boundary=16,S.storage=v.byteLength):De("WebGLRenderer: Unsupported uniform value type.",v),S}function x(v){let S=v.target;S.removeEventListener("dispose",x);let A=o.indexOf(S.__bindingPointIndex);o.splice(A,1),i.deleteBuffer(s[S.id]),delete s[S.id],delete r[S.id]}function M(){for(let v in s)i.deleteBuffer(s[v]);o=[],s={},r={}}return{bind:l,update:c,dispose:M}}var mv=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),kn=null;function gv(){return kn===null&&(kn=new Mr(mv,16,16,Ai,An),kn.name="DFG_LUT",kn.minFilter=Ct,kn.magFilter=Ct,kn.wrapS=dn,kn.wrapT=dn,kn.generateMipmaps=!1,kn.needsUpdate=!0),kn}var il=class{constructor(e={}){let{canvas:t=Cd(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:h=!1,outputBufferType:f=Zt}=e;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=o;let y=f,m=new Set([va,ya,xa]),p=new Set([Zt,wn,qs,$s,ga,_a]),x=new Uint32Array(4),M=new Int32Array(4),v=new N,S=null,A=null,E=[],_=[],w=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Mn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let C=this,I=!1,L=null,B=null,P=null,D=null;this._outputColorSpace=St;let Y=0,G=0,ne=null,q=-1,$=null,Q=new at,be=new at,Ae=null,Qe=new He(0),We=0,Ke=t.width,j=t.height,ee=1,ve=null,Ue=null,_e=new at(0,0,Ke,j),Oe=new at(0,0,Ke,j),ie=!1,te=new Fs,le=!1,ke=!1,Ie=new Ne,nt=new N,ht=new at,_t={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},et=!1;function mt(){return ne===null?ee:1}let F=n;function Et(T,O){return t.getContext(T,O)}let qe,R,b,k,H,X,oe,he,Z,K,ue,de,ae,re,Se,Pe,ze,U,fe,J,pe,ye,se;try{let T={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",ft,!1),t.addEventListener("webglcontextrestored",it,!1),t.addEventListener("webglcontextcreationerror",mn,!1),F===null){let O="webgl2";if(F=Et(O,T),F===null)throw Et(O)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Le()}catch(T){throw t.removeEventListener("webglcontextlost",ft,!1),t.removeEventListener("webglcontextrestored",it,!1),t.removeEventListener("webglcontextcreationerror",mn,!1),Ve("WebGLRenderer: "+T.message),T}function Le(){qe=new Mx(F),qe.init(),pe=new cv(F,qe),R=new fx(F,qe,e,pe),b=new av(F,qe),R.reversedDepthBuffer&&h&&b.buffers.depth.setReversed(!0),B=F.createFramebuffer(),P=F.createFramebuffer(),D=F.createFramebuffer(),k=new Tx(F),H=new qy,X=new lv(F,qe,b,H,R,pe,k),oe=new Sx(C),he=new Cg(F),ye=new ux(F,he),Z=new wx(F,he,k,ye),K=new Cx(F,Z,he,ye,k),U=new Ex(F,R,X),Se=new px(H),ue=new Yy(C,oe,qe,R,ye,Se),de=new fv(C,H),ae=new jy,re=new tv(qe),ze=new hx(C,oe,b,K,g,l),Pe=new ov(C,K,R),se=new pv(F,k,R,b),fe=new dx(F,qe,k),J=new Ax(F,qe,k),k.programs=ue.programs,C.capabilities=R,C.extensions=qe,C.properties=H,C.renderLists=ae,C.shadowMap=Pe,C.state=b,C.info=k}y!==Zt&&(w=new Ix(y,t.width,t.height,a,s,r));let Ce=new rh(C,F);this.xr=Ce,this.getContext=function(){return F},this.getContextAttributes=function(){return F.getContextAttributes()},this.forceContextLoss=function(){let T=qe.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){let T=qe.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return ee},this.setPixelRatio=function(T){T!==void 0&&(ee=T,this.setSize(Ke,j,!1))},this.getSize=function(T){return T.set(Ke,j)},this.setSize=function(T,O,W=!0){if(Ce.isPresenting){De("WebGLRenderer: Can't change size while VR device is presenting.");return}Ke=T,j=O,t.width=Math.floor(T*ee),t.height=Math.floor(O*ee),W===!0&&(t.style.width=T+"px",t.style.height=O+"px"),w!==null&&w.setSize(t.width,t.height),this.setViewport(0,0,T,O)},this.getDrawingBufferSize=function(T){return T.set(Ke*ee,j*ee).floor()},this.setDrawingBufferSize=function(T,O,W){Ke=T,j=O,ee=W,t.width=Math.floor(T*W),t.height=Math.floor(O*W),this.setViewport(0,0,T,O)},this.setEffects=function(T){if(y===Zt){Ve("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(T){for(let O=0;O<T.length;O++)if(T[O].isOutputPass===!0){De("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}w.setEffects(T||[])},this.getCurrentViewport=function(T){return T.copy(Q)},this.getViewport=function(T){return T.copy(_e)},this.setViewport=function(T,O,W,z){T.isVector4?_e.set(T.x,T.y,T.z,T.w):_e.set(T,O,W,z),b.viewport(Q.copy(_e).multiplyScalar(ee).round())},this.getScissor=function(T){return T.copy(Oe)},this.setScissor=function(T,O,W,z){T.isVector4?Oe.set(T.x,T.y,T.z,T.w):Oe.set(T,O,W,z),b.scissor(be.copy(Oe).multiplyScalar(ee).round())},this.getScissorTest=function(){return ie},this.setScissorTest=function(T){b.setScissorTest(ie=T)},this.setOpaqueSort=function(T){ve=T},this.setTransparentSort=function(T){Ue=T},this.getClearColor=function(T){return T.copy(ze.getClearColor())},this.setClearColor=function(){ze.setClearColor(...arguments)},this.getClearAlpha=function(){return ze.getClearAlpha()},this.setClearAlpha=function(){ze.setClearAlpha(...arguments)},this.clear=function(T=!0,O=!0,W=!0){let z=0;if(T){let V=!1;if(ne!==null){let xe=ne.texture.format;V=m.has(xe)}if(V){let xe=ne.texture.type,we=p.has(xe),ge=ze.getClearColor(),Te=ze.getClearAlpha(),Re=ge.r,Xe=ge.g,je=ge.b;we?(x[0]=Re,x[1]=Xe,x[2]=je,x[3]=Te,F.clearBufferuiv(F.COLOR,0,x)):(M[0]=Re,M[1]=Xe,M[2]=je,M[3]=Te,F.clearBufferiv(F.COLOR,0,M))}else z|=F.COLOR_BUFFER_BIT}O&&(z|=F.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),W&&(z|=F.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),z!==0&&F.clear(z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(T){T.setRenderer(this),L=T},this.dispose=function(){t.removeEventListener("webglcontextlost",ft,!1),t.removeEventListener("webglcontextrestored",it,!1),t.removeEventListener("webglcontextcreationerror",mn,!1),ze.dispose(),ae.dispose(),re.dispose(),H.dispose(),oe.dispose(),K.dispose(),ye.dispose(),se.dispose(),ue.dispose(),Ce.dispose(),Ce.removeEventListener("sessionstart",uu),Ce.removeEventListener("sessionend",du),Ui.stop()};function ft(T){T.preventDefault(),kc("WebGLRenderer: Context Lost."),I=!0}function it(){kc("WebGLRenderer: Context Restored."),I=!1;let T=k.autoReset,O=Pe.enabled,W=Pe.autoUpdate,z=Pe.needsUpdate,V=Pe.type;Le(),k.autoReset=T,Pe.enabled=O,Pe.autoUpdate=W,Pe.needsUpdate=z,Pe.type=V}function mn(T){Ve("WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function Pn(T){let O=T.target;O.removeEventListener("dispose",Pn),Mm(O)}function Mm(T){wm(T),H.remove(T)}function wm(T){let O=H.get(T).programs;O!==void 0&&(O.forEach(function(W){ue.releaseProgram(W)}),T.isShaderMaterial&&ue.releaseShaderCache(T))}this.renderBufferDirect=function(T,O,W,z,V,xe){O===null&&(O=_t);let we=V.isMesh&&V.matrixWorld.determinantAffine()<0,ge=Em(T,O,W,z,V);b.setMaterial(z,we);let Te=W.index,Re=1;if(z.wireframe===!0){if(Te=Z.getWireframeAttribute(W),Te===void 0)return;Re=2}let Xe=W.drawRange,je=W.attributes.position,Ee=Xe.start*Re,st=(Xe.start+Xe.count)*Re;xe!==null&&(Ee=Math.max(Ee,xe.start*Re),st=Math.min(st,(xe.start+xe.count)*Re)),Te!==null?(Ee=Math.max(Ee,0),st=Math.min(st,Te.count)):je!=null&&(Ee=Math.max(Ee,0),st=Math.min(st,je.count));let Mt=st-Ee;if(Mt<0||Mt===1/0)return;ye.setup(V,z,ge,W,Te);let gt,ut=fe;if(Te!==null&&(gt=he.get(Te),ut=J,ut.setIndex(gt)),V.isMesh)z.wireframe===!0?(b.setLineWidth(z.wireframeLinewidth*mt()),ut.setMode(F.LINES)):ut.setMode(F.TRIANGLES);else if(V.isLine){let Bt=z.linewidth;Bt===void 0&&(Bt=1),b.setLineWidth(Bt*mt()),V.isLineSegments?ut.setMode(F.LINES):V.isLineLoop?ut.setMode(F.LINE_LOOP):ut.setMode(F.LINE_STRIP)}else V.isPoints?ut.setMode(F.POINTS):V.isSprite&&ut.setMode(F.TRIANGLES);if(V.isBatchedMesh)if(qe.get("WEBGL_multi_draw"))ut.renderMultiDraw(V._multiDrawStarts,V._multiDrawCounts,V._multiDrawCount);else{let Bt=V._multiDrawStarts,Me=V._multiDrawCounts,Gt=V._multiDrawCount,tt=Te?he.get(Te).bytesPerElement:1,hn=H.get(z).currentProgram.getUniforms();for(let Ln=0;Ln<Gt;Ln++)hn.setValue(F,"_gl_DrawID",Ln),ut.render(Bt[Ln]/tt,Me[Ln])}else if(V.isInstancedMesh)ut.renderInstances(Ee,Mt,V.count);else if(W.isInstancedBufferGeometry){let Bt=W._maxInstanceCount!==void 0?W._maxInstanceCount:1/0,Me=Math.min(W.instanceCount,Bt);ut.renderInstances(Ee,Mt,Me)}else ut.render(Ee,Mt)};function hu(T,O,W,z){L!==null&&T.isNodeMaterial&&L.setObject(z,T),le===!0&&Se.setState(T,W,!1),T.transparent===!0&&T.side===Dt&&T.forceSinglePass===!1?(T.side=qt,T.needsUpdate=!0,mo(T,O,z),T.side=On,T.needsUpdate=!0,mo(T,O,z),T.side=Dt):mo(T,O,z)}this.compile=function(T,O,W=null){W===null&&(W=T),L!==null&&L.renderStart(T,O,W),A=re.get(W),A.init(O),_.push(A),W.traverseVisible(function(V){V.isLight&&V.layers.test(O.layers)&&(A.pushLight(V),V.castShadow&&A.pushShadow(V))}),T!==W&&T.traverseVisible(function(V){V.isLight&&V.layers.test(O.layers)&&(A.pushLight(V),V.castShadow&&A.pushShadow(V))}),A.setupLights(),L!==null&&L.updateLights(A.state.lightsArray),ke=this.localClippingEnabled,le=Se.init(this.clippingPlanes,ke),le===!0&&Se.setGlobalState(this.clippingPlanes,O),L!==null&&Pe.render(A.state.shadowsArray,W,O);let z=new Set;return T.traverse(function(V){if(!(V.isMesh||V.isPoints||V.isLine||V.isSprite))return;let xe=V.material;if(xe)if(Array.isArray(xe))for(let we=0;we<xe.length;we++){let ge=xe[we];hu(ge,W,O,V),z.add(ge)}else hu(xe,W,O,V),z.add(xe)}),A=_.pop(),L!==null&&L.renderEnd(),z},this.compileAsync=function(T,O,W=null){let z=this.compile(T,O,W);return new Promise(V=>{function xe(){if(z.forEach(function(we){let Te=H.get(we).currentProgram;(Te===void 0||Te.isReady())&&z.delete(we)}),z.size===0){V(T);return}setTimeout(xe,10)}qe.get("KHR_parallel_shader_compile")!==null?xe():setTimeout(xe,10)})};let Bl=null;function Am(T){Bl&&Bl(T)}function uu(){Ui.stop()}function du(){Ui.start()}let Ui=new sf;Ui.setAnimationLoop(Am),typeof self<"u"&&Ui.setContext(self),this.setAnimationLoop=function(T){Bl=T,Ce.setAnimationLoop(T),T===null?Ui.stop():Ui.start()},Ce.addEventListener("sessionstart",uu),Ce.addEventListener("sessionend",du),this.render=function(T,O){if(O!==void 0&&O.isCamera!==!0){Ve("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;L!==null&&L.renderStart(T,O);let W=Ce.enabled===!0&&Ce.isPresenting===!0,z=w!==null&&(ne===null||W)&&w.begin(C,ne);if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),O.parent===null&&O.matrixWorldAutoUpdate===!0&&O.updateMatrixWorld(),Ce.enabled===!0&&Ce.isPresenting===!0&&(w===null||w.isCompositing()===!1)&&(Ce.cameraAutoUpdate===!0&&Ce.updateCamera(O),O=Ce.getCamera()),T.isScene===!0&&T.onBeforeRender(C,T,O,ne),A=re.get(T,_.length),A.init(O),A.state.textureUnits=X.getTextureUnits(),_.push(A),Ie.multiplyMatrices(O.projectionMatrix,O.matrixWorldInverse),te.setFromProjectionMatrix(Ie,yn,O.reversedDepth),ke=this.localClippingEnabled,le=Se.init(this.clippingPlanes,ke),S=ae.get(T,E.length),S.init(),E.push(S),Ce.enabled===!0&&Ce.isPresenting===!0){let we=C.xr.getDepthSensingMesh();we!==null&&kl(we,O,-1/0,C.sortObjects)}kl(T,O,0,C.sortObjects),S.finish(),L!==null&&L.updateLights(A.state.lightsArray),C.sortObjects===!0&&S.sort(ve,Ue),et=Ce.enabled===!1||Ce.isPresenting===!1||Ce.hasDepthSensing()===!1,et&&ze.addToRenderList(S,T),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),le===!0&&Se.beginShadows();let V=A.state.shadowsArray;if(Pe.render(V,T,O),le===!0&&Se.endShadows(),(z&&w.hasRenderPass())===!1){let we=S.opaque,ge=S.transmissive;if(A.setupLights(),O.isArrayCamera){let Te=O.cameras;if(ge.length>0)for(let Re=0,Xe=Te.length;Re<Xe;Re++){let je=Te[Re];pu(we,ge,T,je)}et&&ze.render(T);for(let Re=0,Xe=Te.length;Re<Xe;Re++){let je=Te[Re];fu(S,T,je,je.viewport)}}else ge.length>0&&pu(we,ge,T,O),et&&ze.render(T),fu(S,T,O)}ne!==null&&G===0&&(X.updateMultisampleRenderTarget(ne),X.updateRenderTargetMipmap(ne)),z&&w.end(C),T.isScene===!0&&T.onAfterRender(C,T,O),ye.resetDefaultState(),q=-1,$=null,_.pop(),_.length>0?(A=_[_.length-1],X.setTextureUnits(A.state.textureUnits),le===!0&&Se.setGlobalState(C.clippingPlanes,A.state.camera)):A=null,E.pop(),E.length>0?S=E[E.length-1]:S=null,L!==null&&L.renderEnd()};function kl(T,O,W,z){if(T.visible===!1)return;if(T.layers.test(O.layers)){if(T.isGroup)W=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(O);else if(T.isLightProbeGrid)A.pushLightProbeGrid(T);else if(T.isLight)A.pushLight(T),T.castShadow&&A.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||T.intersectsFrustum(te)){z&&ht.setFromMatrixPosition(T.matrixWorld).applyMatrix4(Ie);let we=K.update(T),ge=T.material;ge.visible&&S.push(T,we,ge,W,ht.z,null,O)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||T.intersectsFrustum(te))){let we=K.update(T),ge=T.material;if(z&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),ht.copy(T.boundingSphere.center)):(we.boundingSphere===null&&we.computeBoundingSphere(),ht.copy(we.boundingSphere.center)),ht.applyMatrix4(T.matrixWorld).applyMatrix4(Ie)),Array.isArray(ge)){let Te=we.groups;for(let Re=0,Xe=Te.length;Re<Xe;Re++){let je=Te[Re],Ee=ge[je.materialIndex];Ee&&Ee.visible&&S.push(T,we,Ee,W,ht.z,je,O)}}else ge.visible&&S.push(T,we,ge,W,ht.z,null,O)}}let xe=T.children;for(let we=0,ge=xe.length;we<ge;we++)kl(xe[we],O,W,z)}function fu(T,O,W,z){let{opaque:V,transmissive:xe,transparent:we}=T;A.setupLightsView(W),le===!0&&Se.setGlobalState(C.clippingPlanes,W),z&&b.viewport(Q.copy(z)),V.length>0&&po(V,O,W),xe.length>0&&po(xe,O,W),we.length>0&&po(we,O,W),b.buffers.depth.setTest(!0),b.buffers.depth.setMask(!0),b.buffers.color.setMask(!0),b.setPolygonOffset(!1)}function pu(T,O,W,z){if((W.isScene===!0?W.overrideMaterial:null)!==null)return;if(A.state.transmissionRenderTarget[z.id]===void 0){let Ee=qe.has("EXT_color_buffer_half_float")||qe.has("EXT_color_buffer_float");A.state.transmissionRenderTarget[z.id]=new jt(1,1,{generateMipmaps:!0,type:Ee?An:Zt,minFilter:Bn,samples:Math.max(4,R.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Je.workingColorSpace})}let xe=A.state.transmissionRenderTarget[z.id],we=z.viewport||Q;xe.setSize(we.z*C.transmissionResolutionScale,we.w*C.transmissionResolutionScale);let ge=C.getRenderTarget(),Te=C.getActiveCubeFace(),Re=C.getActiveMipmapLevel();C.setRenderTarget(xe),C.getClearColor(Qe),We=C.getClearAlpha(),We<1&&C.setClearColor(16777215,.5),C.clear(),et&&ze.render(W);let Xe=C.toneMapping;C.toneMapping=Mn;let je=z.viewport;if(z.viewport!==void 0&&(z.viewport=void 0),A.setupLightsView(z),le===!0&&Se.setGlobalState(C.clippingPlanes,z),po(T,W,z),X.updateMultisampleRenderTarget(xe),X.updateRenderTargetMipmap(xe),qe.has("WEBGL_multisampled_render_to_texture")===!1){let Ee=!1;for(let st=0,Mt=O.length;st<Mt;st++){let gt=O[st],{object:ut,geometry:Bt,material:Me,group:Gt}=gt;if(Me.side===Dt&&ut.layers.test(z.layers)){let tt=Me.side;Me.side=qt,Me.needsUpdate=!0,mu(ut,W,z,Bt,Me,Gt),Me.side=tt,Me.needsUpdate=!0,Ee=!0}}Ee===!0&&(X.updateMultisampleRenderTarget(xe),X.updateRenderTargetMipmap(xe))}C.setRenderTarget(ge,Te,Re),C.setClearColor(Qe,We),je!==void 0&&(z.viewport=je),C.toneMapping=Xe}function po(T,O,W){let z=O.isScene===!0?O.overrideMaterial:null;for(let V=0,xe=T.length;V<xe;V++){let we=T[V],{object:ge,geometry:Te,group:Re}=we,Xe=we.material;Xe.allowOverride===!0&&z!==null&&(Xe=z),ge.layers.test(W.layers)&&mu(ge,O,W,Te,Xe,Re)}}function mu(T,O,W,z,V,xe){L!==null&&V.isNodeMaterial&&L.setObject(T,V),T.onBeforeRender(C,O,W,z,V,xe),T.modelViewMatrix.multiplyMatrices(W.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),V.onBeforeRender(C,O,W,z,T,xe),V.transparent===!0&&V.side===Dt&&V.forceSinglePass===!1?(V.side=qt,V.needsUpdate=!0,C.renderBufferDirect(W,O,z,V,T,xe),V.side=On,V.needsUpdate=!0,C.renderBufferDirect(W,O,z,V,T,xe),V.side=Dt):C.renderBufferDirect(W,O,z,V,T,xe),T.onAfterRender(C,O,W,z,V,xe)}function mo(T,O,W){O.isScene!==!0&&(O=_t);let z=H.get(T),V=A.state.lights,xe=A.state.shadowsArray,we=V.state.version,ge=ue.getParameters(T,V.state,xe,O,W,A.state.lightProbeGridArray),Te=ue.getProgramCacheKey(ge),Re=z.programs;z.environment=T.isMeshStandardMaterial||T.isMeshLambertMaterial||T.isMeshPhongMaterial?O.environment:null,z.fog=O.fog;let Xe=T.isMeshStandardMaterial||T.isMeshLambertMaterial&&!T.envMap||T.isMeshPhongMaterial&&!T.envMap;z.envMap=oe.get(T.envMap||z.environment,Xe),z.envMapRotation=z.environment!==null&&T.envMap===null?O.environmentRotation:T.envMapRotation,Re===void 0&&(T.addEventListener("dispose",Pn),Re=new Map,z.programs=Re);let je=Re.get(Te);if(je!==void 0){if(z.currentProgram===je&&z.lightsStateVersion===we)return _u(T,ge),je}else ge.uniforms=ue.getUniforms(T),L!==null&&T.isNodeMaterial&&L.build(T,W,ge),T.onBeforeCompile(ge,C),je=ue.acquireProgram(ge,Te),Re.set(Te,je),z.uniforms=ge.uniforms;let Ee=z.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(Ee.clippingPlanes=Se.uniform),_u(T,ge),z.needsLights=Rm(T),z.lightsStateVersion=we,z.needsLights&&(Ee.ambientLightColor.value=V.state.ambient,Ee.lightProbe.value=V.state.probe,Ee.sunLights.value=V.state.sun,Ee.sunLightShadows.value=V.state.sunShadow,Ee.directionalLights.value=V.state.directional,Ee.directionalLightShadows.value=V.state.directionalShadow,Ee.spotLights.value=V.state.spot,Ee.spotLightShadows.value=V.state.spotShadow,Ee.rectAreaLights.value=V.state.rectArea,Ee.ltc_1.value=V.state.rectAreaLTC1,Ee.ltc_2.value=V.state.rectAreaLTC2,Ee.pointLights.value=V.state.point,Ee.pointLightShadows.value=V.state.pointShadow,Ee.hemisphereLights.value=V.state.hemi,Ee.sunShadowMatrix.value=V.state.sunShadowMatrix,Ee.sunShadowCascade.value=V.state.sunShadowCascade,Ee.directionalShadowMatrix.value=V.state.directionalShadowMatrix,Ee.spotLightMatrix.value=V.state.spotLightMatrix,Ee.spotLightMap.value=V.state.spotLightMap,Ee.pointShadowMatrix.value=V.state.pointShadowMatrix),z.lightProbeGrid=A.state.lightProbeGridArray.length>0,z.currentProgram=je,z.uniformsList=null,je}function gu(T){if(T.uniformsList===null){let O=T.currentProgram.getUniforms();T.uniformsList=Ks.seqWithValue(O.seq,T.uniforms)}return T.uniformsList}function _u(T,O){let W=H.get(T);W.outputColorSpace=O.outputColorSpace,W.batching=O.batching,W.batchingColor=O.batchingColor,W.instancing=O.instancing,W.instancingColor=O.instancingColor,W.instancingMorph=O.instancingMorph,W.skinning=O.skinning,W.morphTargets=O.morphTargets,W.morphNormals=O.morphNormals,W.morphColors=O.morphColors,W.morphTargetsCount=O.morphTargetsCount,W.numClippingPlanes=O.numClippingPlanes,W.numIntersection=O.numClipIntersection,W.vertexAlphas=O.vertexAlphas,W.vertexTangents=O.vertexTangents,W.toneMapping=O.toneMapping}function Tm(T,O){if(T.length===0)return null;if(T.length===1)return T[0].texture!==null?T[0]:null;v.setFromMatrixPosition(O.matrixWorld);for(let W=0,z=T.length;W<z;W++){let V=T[W];if(V.texture!==null&&V.boundingBox.containsPoint(v))return V}return null}function Em(T,O,W,z,V){O.isScene!==!0&&(O=_t),X.resetTextureUnits();let xe=O.fog,we=z.isMeshStandardMaterial||z.isMeshLambertMaterial||z.isMeshPhongMaterial?O.environment:null,ge=ne===null?C.outputColorSpace:ne.isXRRenderTarget===!0?ne.texture.colorSpace:Je.workingColorSpace,Te=z.isMeshStandardMaterial||z.isMeshLambertMaterial&&!z.envMap||z.isMeshPhongMaterial&&!z.envMap,Re=oe.get(z.envMap||we,Te),Xe=z.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,je=!!W.attributes.tangent&&(!!z.normalMap||z.anisotropy>0),Ee=!!W.morphAttributes.position,st=!!W.morphAttributes.normal,Mt=!!W.morphAttributes.color,gt=Mn;z.toneMapped&&(ne===null||ne.isXRRenderTarget===!0)&&(gt=C.toneMapping);let ut=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,Bt=ut!==void 0?ut.length:0,Me=H.get(z),Gt=A.state.lights;if(le===!0&&(ke===!0||T!==$)){let pt=T===$&&z.id===q;Se.setState(z,T,pt)}let tt=!1;z.version===Me.__version?(Me.needsLights&&Me.lightsStateVersion!==Gt.state.version||Me.outputColorSpace!==ge||V.isBatchedMesh&&Me.batching===!1||!V.isBatchedMesh&&Me.batching===!0||V.isBatchedMesh&&Me.batchingColor===!0&&V._colorsTexture===null||V.isBatchedMesh&&Me.batchingColor===!1&&V._colorsTexture!==null||V.isInstancedMesh&&Me.instancing===!1||!V.isInstancedMesh&&Me.instancing===!0||V.isSkinnedMesh&&Me.skinning===!1||!V.isSkinnedMesh&&Me.skinning===!0||V.isInstancedMesh&&Me.instancingColor===!0&&V.instanceColor===null||V.isInstancedMesh&&Me.instancingColor===!1&&V.instanceColor!==null||V.isInstancedMesh&&Me.instancingMorph===!0&&V.morphTexture===null||V.isInstancedMesh&&Me.instancingMorph===!1&&V.morphTexture!==null||Me.envMap!==Re||z.fog===!0&&Me.fog!==xe||Me.numClippingPlanes!==void 0&&(Me.numClippingPlanes!==Se.numPlanes||Me.numIntersection!==Se.numIntersection)||Me.vertexAlphas!==Xe||Me.vertexTangents!==je||Me.morphTargets!==Ee||Me.morphNormals!==st||Me.morphColors!==Mt||Me.toneMapping!==gt||Me.morphTargetsCount!==Bt||!!Me.lightProbeGrid!=A.state.lightProbeGridArray.length>0)&&(tt=!0):(tt=!0,Me.__version=z.version);let hn=Me.currentProgram;tt===!0&&(hn=mo(z,O,V),L&&z.isNodeMaterial&&L.onUpdateProgram(z,hn,Me));let Ln=!1,si=!1,cs=!1,ct=hn.getUniforms(),bt=Me.uniforms;if(b.useProgram(hn.program)&&(Ln=!0,si=!0,cs=!0),z.id!==q&&(q=z.id,si=!0),Me.needsLights){let pt=Tm(A.state.lightProbeGridArray,V);Me.lightProbeGrid!==pt&&(Me.lightProbeGrid=pt,si=!0)}if(Ln||$!==T){b.buffers.depth.getReversed()&&T.reversedDepth!==!0&&(T._reversedDepth=!0,T.updateProjectionMatrix()),ct.setValue(F,"projectionMatrix",T.projectionMatrix),ct.setValue(F,"viewMatrix",T.matrixWorldInverse);let oi=ct.map.cameraPosition;oi!==void 0&&oi.setValue(F,nt.setFromMatrixPosition(T.matrixWorld)),R.logarithmicDepthBuffer&&ct.setValue(F,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(z.isMeshPhongMaterial||z.isMeshToonMaterial||z.isMeshLambertMaterial||z.isMeshBasicMaterial||z.isMeshStandardMaterial||z.isShaderMaterial)&&ct.setValue(F,"isOrthographic",T.isOrthographicCamera===!0),$!==T&&($=T,si=!0,cs=!0)}if(Me.needsLights&&(Gt.state.sunShadowMap.length>0&&ct.setValue(F,"sunShadowMap",Gt.state.sunShadowMap,X),Gt.state.directionalShadowMap.length>0&&ct.setValue(F,"directionalShadowMap",Gt.state.directionalShadowMap,X),Gt.state.spotShadowMap.length>0&&ct.setValue(F,"spotShadowMap",Gt.state.spotShadowMap,X),Gt.state.pointShadowMap.length>0&&ct.setValue(F,"pointShadowMap",Gt.state.pointShadowMap,X)),V.isSkinnedMesh){ct.setOptional(F,V,"bindMatrix"),ct.setOptional(F,V,"bindMatrixInverse");let pt=V.skeleton;pt&&(pt.boneTexture===null&&pt.computeBoneTexture(),ct.setValue(F,"boneTexture",pt.boneTexture,X))}V.isBatchedMesh&&(ct.setOptional(F,V,"batchingTexture"),ct.setValue(F,"batchingTexture",V._matricesTexture,X),ct.setOptional(F,V,"batchingIdTexture"),ct.setValue(F,"batchingIdTexture",V._indirectTexture,X),ct.setOptional(F,V,"batchingColorTexture"),V._colorsTexture!==null&&ct.setValue(F,"batchingColorTexture",V._colorsTexture,X));let ri=W.morphAttributes;if((ri.position!==void 0||ri.normal!==void 0||ri.color!==void 0)&&U.update(V,W,hn),(si||Me.receiveShadow!==V.receiveShadow)&&(Me.receiveShadow=V.receiveShadow,ct.setValue(F,"receiveShadow",V.receiveShadow)),(z.isMeshStandardMaterial||z.isMeshLambertMaterial||z.isMeshPhongMaterial)&&z.envMap===null&&O.environment!==null&&(bt.envMapIntensity.value=O.environmentIntensity),bt.dfgLUT!==void 0&&(bt.dfgLUT.value=gv()),si){if(ct.setValue(F,"toneMappingExposure",C.toneMappingExposure),Me.needsLights&&Cm(bt,cs),xe&&z.fog===!0&&de.refreshFogUniforms(bt,xe),de.refreshMaterialUniforms(bt,z,ee,j,A.state.transmissionRenderTarget[T.id]),Me.needsLights&&Me.lightProbeGrid){let pt=Me.lightProbeGrid;bt.probesSH.value=pt.texture,bt.probesMin.value.copy(pt.boundingBox.min),bt.probesMax.value.copy(pt.boundingBox.max),bt.probesResolution.value.copy(pt.resolution)}Ks.upload(F,gu(Me),bt,X)}if(z.isShaderMaterial&&z.uniformsNeedUpdate===!0&&(Ks.upload(F,gu(Me),bt,X),z.uniformsNeedUpdate=!1),z.isSpriteMaterial&&ct.setValue(F,"center",V.center),ct.setValue(F,"modelViewMatrix",V.modelViewMatrix),ct.setValue(F,"normalMatrix",V.normalMatrix),ct.setValue(F,"modelMatrix",V.matrixWorld),z.uniformsGroups!==void 0){let pt=z.uniformsGroups;for(let oi=0,hs=pt.length;oi<hs;oi++){let yu=pt[oi];se.update(yu,hn),se.bind(yu,hn)}}return hn}function Cm(T,O){T.ambientLightColor.needsUpdate=O,T.lightProbe.needsUpdate=O,T.sunLights.needsUpdate=O,T.sunLightShadows.needsUpdate=O,T.directionalLights.needsUpdate=O,T.directionalLightShadows.needsUpdate=O,T.pointLights.needsUpdate=O,T.pointLightShadows.needsUpdate=O,T.spotLights.needsUpdate=O,T.spotLightShadows.needsUpdate=O,T.rectAreaLights.needsUpdate=O,T.hemisphereLights.needsUpdate=O}function Rm(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return Y},this.getActiveMipmapLevel=function(){return G},this.getRenderTarget=function(){return ne},this.setRenderTargetTextures=function(T,O,W){let z=H.get(T);z.__autoAllocateDepthBuffer=T.resolveDepthBuffer===!1,z.__autoAllocateDepthBuffer===!1&&(z.__useRenderToTexture=!1),H.get(T.texture).__webglTexture=O,H.get(T.depthTexture).__webglTexture=z.__autoAllocateDepthBuffer?void 0:W,z.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(T,O){let W=H.get(T);W.__webglFramebuffer=O,W.__useDefaultFramebuffer=O===void 0},this.setRenderTarget=function(T,O=0,W=0){ne=T,Y=O,G=W;let z=null,V=!1,xe=!1;if(T){let ge=H.get(T);if(ge.__useDefaultFramebuffer!==void 0){b.bindFramebuffer(F.FRAMEBUFFER,ge.__webglFramebuffer),Q.copy(T.viewport),be.copy(T.scissor),Ae=T.scissorTest,b.viewport(Q),b.scissor(be),b.setScissorTest(Ae),q=-1;return}else if(ge.__webglFramebuffer===void 0)X.setupRenderTarget(T);else if(ge.__hasExternalTextures)X.rebindTextures(T,H.get(T.texture).__webglTexture,H.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){let Xe=T.depthTexture;if(ge.__boundDepthTexture!==Xe){if(Xe!==null&&H.has(Xe)&&(T.width!==Xe.image.width||T.height!==Xe.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");X.setupDepthRenderbuffer(T)}}let Te=T.texture;(Te.isData3DTexture||Te.isDataArrayTexture||Te.isCompressedArrayTexture)&&(xe=!0);let Re=H.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(Re[O])?z=Re[O][W]:z=Re[O],V=!0):T.samples>0&&X.useMultisampledRTT(T)===!1?z=H.get(T).__webglMultisampledFramebuffer:Array.isArray(Re)?z=Re[W]:z=Re,Q.copy(T.viewport),be.copy(T.scissor),Ae=T.scissorTest}else Q.copy(_e).multiplyScalar(ee).floor(),be.copy(Oe).multiplyScalar(ee).floor(),Ae=ie;if(W!==0&&(z=B),b.bindFramebuffer(F.FRAMEBUFFER,z)&&b.drawBuffers(T,z),b.viewport(Q),b.scissor(be),b.setScissorTest(Ae),V){let ge=H.get(T.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_CUBE_MAP_POSITIVE_X+O,ge.__webglTexture,W)}else if(xe){let ge=O;for(let Te=0;Te<T.textures.length;Te++){let Re=H.get(T.textures[Te]);F.framebufferTextureLayer(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0+Te,Re.__webglTexture,W,ge)}}else if(T!==null&&W!==0){let ge=H.get(T.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,ge.__webglTexture,W)}q=-1};function xu(T){let O=H.get(T);return(O.__readFormat!==T.format||O.__readType!==T.type)&&(O.__readFormat=T.format,O.__readType=T.type,O.__formatReadable=R.textureFormatReadable(T.format),O.__typeReadable=R.textureTypeReadable(T.type)),O}this.readRenderTargetPixels=function(T,O,W,z,V,xe,we,ge=0){if(!(T&&T.isWebGLRenderTarget)){Ve("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Te=H.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&we!==void 0&&(Te=Te[we]),Te){b.bindFramebuffer(F.FRAMEBUFFER,Te);try{let Re=T.textures[ge],Xe=Re.format,je=Re.type;T.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+ge);let Ee=xu(Re);if(Ee.__formatReadable===!1){Ve("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Ee.__typeReadable===!1){Ve("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}O>=0&&O<=T.width-z&&W>=0&&W<=T.height-V&&F.readPixels(O,W,z,V,pe.convert(Xe),pe.convert(je),xe)}finally{let Re=ne!==null?H.get(ne).__webglFramebuffer:null;b.bindFramebuffer(F.FRAMEBUFFER,Re)}}},this.readRenderTargetPixelsAsync=async function(T,O,W,z,V,xe,we,ge=0){if(!(T&&T.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Te=H.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&we!==void 0&&(Te=Te[we]),Te)if(O>=0&&O<=T.width-z&&W>=0&&W<=T.height-V){b.bindFramebuffer(F.FRAMEBUFFER,Te);let Re=T.textures[ge],Xe=Re.format,je=Re.type;T.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+ge);let Ee=xu(Re);if(Ee.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Ee.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let st=F.createBuffer();F.bindBuffer(F.PIXEL_PACK_BUFFER,st),F.bufferData(F.PIXEL_PACK_BUFFER,xe.byteLength,F.STREAM_READ),F.readPixels(O,W,z,V,pe.convert(Xe),pe.convert(je),0),F.bindBuffer(F.PIXEL_PACK_BUFFER,null);let Mt=ne!==null?H.get(ne).__webglFramebuffer:null;b.bindFramebuffer(F.FRAMEBUFFER,Mt);let gt=F.fenceSync(F.SYNC_GPU_COMMANDS_COMPLETE,0);return F.flush(),await Id(F,gt,4),F.bindBuffer(F.PIXEL_PACK_BUFFER,st),F.getBufferSubData(F.PIXEL_PACK_BUFFER,0,xe),F.bindBuffer(F.PIXEL_PACK_BUFFER,null),F.deleteBuffer(st),F.deleteSync(gt),xe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(T,O=null,W=0){let z=Math.pow(2,-W),V=Math.floor(T.image.width*z),xe=Math.floor(T.image.height*z),we=O!==null?O.x:0,ge=O!==null?O.y:0;X.setTexture2D(T,0),F.copyTexSubImage2D(F.TEXTURE_2D,W,0,0,we,ge,V,xe),b.unbindTexture()},this.copyTextureToTexture=function(T,O,W=null,z=null,V=0,xe=0){let we,ge,Te,Re,Xe,je,Ee,st,Mt,gt=T.isCompressedTexture?T.mipmaps[xe]:T.image;if(W!==null)we=W.max.x-W.min.x,ge=W.max.y-W.min.y,Te=W.isBox3?W.max.z-W.min.z:1,Re=W.min.x,Xe=W.min.y,je=W.isBox3?W.min.z:0;else{let bt=Math.pow(2,-V);we=Math.floor(gt.width*bt),ge=Math.floor(gt.height*bt),T.isDataArrayTexture?Te=gt.depth:T.isData3DTexture?Te=Math.floor(gt.depth*bt):Te=1,Re=0,Xe=0,je=0}z!==null?(Ee=z.x,st=z.y,Mt=z.z):(Ee=0,st=0,Mt=0);let ut=pe.convert(O.format),Bt=pe.convert(O.type),Me;O.isData3DTexture?(X.setTexture3D(O,0),Me=F.TEXTURE_3D):O.isDataArrayTexture||O.isCompressedArrayTexture?(X.setTexture2DArray(O,0),Me=F.TEXTURE_2D_ARRAY):(X.setTexture2D(O,0),Me=F.TEXTURE_2D),b.activeTexture(F.TEXTURE0),b.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,O.flipY),b.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),b.pixelStorei(F.UNPACK_ALIGNMENT,O.unpackAlignment);let Gt=b.getParameter(F.UNPACK_ROW_LENGTH),tt=b.getParameter(F.UNPACK_IMAGE_HEIGHT),hn=b.getParameter(F.UNPACK_SKIP_PIXELS),Ln=b.getParameter(F.UNPACK_SKIP_ROWS),si=b.getParameter(F.UNPACK_SKIP_IMAGES);b.pixelStorei(F.UNPACK_ROW_LENGTH,gt.width),b.pixelStorei(F.UNPACK_IMAGE_HEIGHT,gt.height),b.pixelStorei(F.UNPACK_SKIP_PIXELS,Re),b.pixelStorei(F.UNPACK_SKIP_ROWS,Xe),b.pixelStorei(F.UNPACK_SKIP_IMAGES,je);let cs=T.isDataArrayTexture||T.isData3DTexture,ct=O.isDataArrayTexture||O.isData3DTexture;if(T.isDepthTexture){let bt=H.get(T),ri=H.get(O),pt=H.get(bt.__renderTarget),oi=H.get(ri.__renderTarget);b.bindFramebuffer(F.READ_FRAMEBUFFER,pt.__webglFramebuffer),b.bindFramebuffer(F.DRAW_FRAMEBUFFER,oi.__webglFramebuffer);for(let hs=0;hs<Te;hs++)cs&&(F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,H.get(T).__webglTexture,V,je+hs),F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,H.get(O).__webglTexture,xe,Mt+hs)),F.blitFramebuffer(Re,Xe,we,ge,Ee,st,we,ge,F.DEPTH_BUFFER_BIT,F.NEAREST);b.bindFramebuffer(F.READ_FRAMEBUFFER,null),b.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else if(V!==0||T.isRenderTargetTexture||H.has(T)){let bt=H.get(T),ri=H.get(O);b.bindFramebuffer(F.READ_FRAMEBUFFER,P),b.bindFramebuffer(F.DRAW_FRAMEBUFFER,D);for(let pt=0;pt<Te;pt++)cs?F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,bt.__webglTexture,V,je+pt):F.framebufferTexture2D(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,bt.__webglTexture,V),ct?F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,ri.__webglTexture,xe,Mt+pt):F.framebufferTexture2D(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,ri.__webglTexture,xe),V!==0?F.blitFramebuffer(Re,Xe,we,ge,Ee,st,we,ge,F.COLOR_BUFFER_BIT,F.NEAREST):ct?F.copyTexSubImage3D(Me,xe,Ee,st,Mt+pt,Re,Xe,we,ge):F.copyTexSubImage2D(Me,xe,Ee,st,Re,Xe,we,ge);b.bindFramebuffer(F.READ_FRAMEBUFFER,null),b.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else ct?T.isDataTexture||T.isData3DTexture?F.texSubImage3D(Me,xe,Ee,st,Mt,we,ge,Te,ut,Bt,gt.data):O.isCompressedArrayTexture?F.compressedTexSubImage3D(Me,xe,Ee,st,Mt,we,ge,Te,ut,gt.data):F.texSubImage3D(Me,xe,Ee,st,Mt,we,ge,Te,ut,Bt,gt):T.isDataTexture?F.texSubImage2D(F.TEXTURE_2D,xe,Ee,st,we,ge,ut,Bt,gt.data):T.isCompressedTexture?F.compressedTexSubImage2D(F.TEXTURE_2D,xe,Ee,st,gt.width,gt.height,ut,gt.data):F.texSubImage2D(F.TEXTURE_2D,xe,Ee,st,we,ge,ut,Bt,gt);b.pixelStorei(F.UNPACK_ROW_LENGTH,Gt),b.pixelStorei(F.UNPACK_IMAGE_HEIGHT,tt),b.pixelStorei(F.UNPACK_SKIP_PIXELS,hn),b.pixelStorei(F.UNPACK_SKIP_ROWS,Ln),b.pixelStorei(F.UNPACK_SKIP_IMAGES,si),xe===0&&O.generateMipmaps&&F.generateMipmap(Me),b.unbindTexture()},this.initRenderTarget=function(T){H.get(T).__webglFramebuffer===void 0&&X.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?X.setTextureCube(T,0):T.isData3DTexture?X.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?X.setTexture2DArray(T,0):X.setTexture2D(T,0),b.unbindTexture()},this.resetState=function(){Y=0,G=0,ne=null,b.reset(),ye.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return yn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Je._getDrawingBufferColorSpace(e),t.unpackColorSpace=Je._getUnpackColorSpace()}};var cl=["blink","blinkLeft","blinkRight","aa","ih","ou","ee","oh","happy","angry","sad","relaxed","surprised"],ah=["aa","ih","ou","ee","oh"],pf=[["lively","Lively: blinks and looks at you"],["talking","Talking"],["still","Still"],["happy","Happy"],["angry","Angry"],["sad","Sad"],["relaxed","Relaxed"],["surprised","Surprised"],["blink","Eyes closed"]],uf=.35,_v=.2,xv=.25,Qs=i=>{let e=Math.sin(i*127.1+311.7)*43758.5453;return e-Math.floor(e)};function yv(i){let e=0;for(let t=0;t<1e3;t++){let n=e+2+Qs(t)*4;if(i<n){let s=i-e;return s<.2?Math.sin(s/.2*Math.PI):0}e=n}return 0}function vv(i){let e=Object.fromEntries(ah.map(l=>[l,0])),t=Math.floor(i/2.4),n=i-t*2.4;if(n>1.9)return e;let s=n/.13,r=Math.floor(s),o=s-r,a=ah[Math.floor(Qs(t*31+r)*ah.length)];return e[a]=Math.sin(o*Math.PI)*(.55+.45*Qs(t*7+r)),e}function bv(i,e={}){for(let t of i.meshes){let n=t.morphTargetDictionary;if(n)for(let[s,r]of Object.entries(n))t.morphTargetInfluences[r]=e[s]??0}}var df=new dt,ol=new dt,lh=new dt,ch=new N,al=new N,ff=new N,ll=new N;function Sv(i,e=null){let t=i.humanoid.head;for(let n of["l","r"]){let s=i.bones.get(`eye_${n}`);if(!s||(s.quaternion.copy(i.rest.get(s.name)),s.updateMatrixWorld(!0),!e||!t))continue;t.getWorldQuaternion(lh).multiply(i.headRest.clone().invert()),ch.set(0,0,1).applyQuaternion(lh),ll.set(0,1,0).applyQuaternion(lh),s.getWorldPosition(ff),al.copy(e).sub(ff).normalize();let r=new N().crossVectors(ll,ch),o=Math.max(-uf,Math.min(uf,Math.atan2(al.dot(r),al.dot(ch)))),a=Math.max(-xv,Math.min(_v,Math.asin(Math.max(-1,Math.min(1,al.dot(ll))))));df.setFromAxisAngle(ll,o).multiply(new dt().setFromAxisAngle(r,-a)),ol.identity(),s.parent?.getWorldQuaternion(ol),s.quaternion.premultiply(ol).premultiply(df).premultiply(ol.invert()),s.updateMatrixWorld(!0)}}function mf(i,e,t,n=null,s=!1){let r={},o=e==="lively"||e==="talking";o&&!s?(r.blink=yv(t),e==="talking"&&Object.assign(r,vv(t))):e==="talking"?r.aa=.5:e!=="lively"&&e!=="still"&&(r[e]=1),bv(i,r);let a=o&&!s?n:null;if(a&&e==="lively"){let l=Math.floor(t/3);Qs(l+500)<.35&&t-l*3<.9&&(a=a.clone().add(new N((Qs(l)-.5)*.8,(Qs(l+9)-.5)*.4,0)))}Sv(i,a)}var Mv=[137,80,78,71,13,10,26,10],gf=i=>typeof i=="string"?Uint8Array.from(atob(i),e=>e.charCodeAt(0)):i;function _f(i,e){let t=gf(e);return new i(t.buffer,t.byteOffset,t.byteLength/i.BYTES_PER_ELEMENT)}function wv(i,e,t){let n=i.length/e,s=new Uint8Array(i.length),r={1:Uint8Array,2:Uint16Array,4:Uint32Array}[e],o=new r(n),a=new Uint8Array(o.buffer);for(let u=0;u<e;u++)for(let d=0;d<n;d++)a[d*e+u]=i[u*n+d];for(let u=1;u<n;u++)o[u]+=o[u-1];let l=n/t,c=new r(s.buffer);for(let u=0;u<t;u++)for(let d=0;d<l;d++)c[d*t+u]=o[u*l+d];return s}async function Av(i){let e=new Uint8Array(i);if(!Mv.every((d,h)=>e[h]===d))return JSON.parse(new TextDecoder().decode(e));let t=new DataView(e.buffer,e.byteOffset,e.byteLength),n=[],s=0;for(let d=8;d+8<=e.length;){let h=t.getUint32(d),f=String.fromCharCode(...e.subarray(d+4,d+8));if(f==="IHDR"&&(s=t.getUint32(d+8)),f==="IDAT"&&n.push(e.subarray(d+8,d+8+h)),f==="IEND")break;d+=12+h}let r=new Blob(n).stream().pipeThrough(new DecompressionStream("deflate")),o=new Uint8Array(await new Response(r).arrayBuffer()),a=o.length/(s+1),l=new Uint8Array(a*s);for(let d=0;d<a;d++){if(o[d*(s+1)]!==0)throw new Error("A packed kit file has a filtered row");l.set(o.subarray(d*(s+1)+1,(d+1)*(s+1)),d*s)}let c=new DataView(l.buffer).getUint32(0,!0),u=(d,h)=>{let f=h?.["@"];if(!Array.isArray(f))return h;let[g,y,m,p]=f,x=l.slice(g,g+y);return p?wv(x,m,p):x};return JSON.parse(new TextDecoder().decode(l.subarray(4,4+c)),u)}var Tv=new Yi;function xf(i){let e=URL.createObjectURL(new Blob([gf(i)],{type:"image/webp"})),t=()=>URL.revokeObjectURL(e);return Tv.load(e,t,void 0,t)}async function yf(i,e=i){let t=await fetch(i);if(!t.ok)throw new Error(`GET ${e} → ${t.status}`);return Av(await t.arrayBuffer())}var Kt="3d-avatar-maker",vf=`/api/capability-packages/${Kt}/assets/kit/`,hh="";function bf(i,e=""){vf=i.endsWith("/")?i:`${i}/`,hh=e}var Ev=i=>i.startsWith("avatar-outfit")?"wardrobe":"avatar",dl=i=>`${vf}${Ev(i)}/${i}${hh?`?v=${encodeURIComponent(hh)}`:""}`,hl=new Map,ul=new Map,Cv=new Yi,qr=i=>fl(dl(i),i);function fl(i,e=i){if(!hl.has(i)){let t=yf(i,e);t.catch(()=>hl.delete(i)),hl.set(i,t)}return hl.get(i)}function $r(i,e=null){if(!ul.has(i)){let t=e?.find(s=>s.name===i)?.webp,n=t?xf(t):Cv.load(dl(`${i}.webp`));n.flipY=!1,n.colorSpace=St,n.name=i,n.userData.shared=!0,ul.set(i,n)}return ul.get(i)}function Sf(){return Promise.all([...ul.values()].map(i=>new Promise(e=>{let t=n=>{i.image?.complete!==!1&&(i.image?.width||n<=0)?e():setTimeout(()=>t(n-1),50)};t(200)})))}var En=_f;function uh(i){let e=En(Int16Array,i.position),t=new Float32Array(e.length);for(let l=0;l<e.length;l++){let c=l%3,u=i.box[c],d=i.box[c+3]-u;t[l]=u+(e[l]+32768)/65535*d}let n=Float32Array.from(En(Int8Array,i.normal),l=>l/127),s=i.uv?Float32Array.from(En(Uint16Array,i.uv),l=>l/65535):null,r=new Rt;r.setAttribute("position",new Be(t,3)),r.setAttribute("normal",new Be(n,3)),s&&r.setAttribute("uv",new Be(s,2)),r.setAttribute("skinIndex",new rn(Uint16Array.from(En(Uint8Array,i.joints)),4));let o=Float32Array.from(En(Uint8Array,i.weights));for(let l=0;l<o.length;l+=4){let c=o[l]+o[l+1]+o[l+2]+o[l+3]||1;for(let u=0;u<4;u++)o[l+u]/=c}r.setAttribute("skinWeight",new Be(o,4));let a=i.wide?Uint32Array:Uint16Array;return r.setIndex(new Be(En(a,i.index),1)),r.computeBoundingBox(),r.computeBoundingSphere(),r}function Mf(i){let e=new vn,t=new Map,n=i.skeleton.names.map(s=>{let r=i.joints.indexOf(s);return new Ne().fromArray(i.inverseBind,r*16).invert()});return i.skeleton.names.forEach((s,r)=>{let o=new mi;o.name=s;let a=i.skeleton.parents[r];(a>=0?n[a].clone().invert().multiply(n[r]):n[r].clone()).decompose(o.position,o.quaternion,o.scale),t.set(s,o)}),i.skeleton.names.forEach((s,r)=>{let o=i.skeleton.parents[r];(o>=0?t.get(i.skeleton.names[o]):e).add(t.get(s))}),e.updateMatrixWorld(!0),{root:e,bones:t}}function wf(i,e,t,n=null,s=null,r=null){let o=t.joints.map(l=>e.get(l)??i),a=t.joints.map((l,c)=>{let u=t.inverseBind?new Ne().fromArray(t.inverseBind,c*16):new Ne().fromArray(s.inverseBind,Math.max(0,s.joints.indexOf(l))*16),d=r?.get(l);d&&u.multiply(d);let h=n?.get(l);return h?u.premultiply(h):u});return new Xi(o,a)}var Cn={hips:"pelvis",spine:"spine_01",chest:"spine_02",upperChest:"spine_03",neck:"neck_01",head:"Head",leftShoulder:"clavicle_l",leftUpperArm:"upperarm_l",leftLowerArm:"lowerarm_l",leftHand:"hand_l",rightShoulder:"clavicle_r",rightUpperArm:"upperarm_r",rightLowerArm:"lowerarm_r",rightHand:"hand_r",leftUpperLeg:"thigh_l",leftLowerLeg:"calf_l",leftFoot:"foot_l",leftToes:"ball_l",rightUpperLeg:"thigh_r",rightLowerLeg:"calf_r",rightFoot:"foot_r",rightToes:"ball_r",leftEye:"eye_l",rightEye:"eye_r"};for(let[i,e]of[["left","l"],["right","r"]]){for(let[t,n]of[["Index","index"],["Middle","middle"],["Ring","ring"],["Little","pinky"]])Cn[`${i}${t}Proximal`]=`${n}_01_${e}`,Cn[`${i}${t}Intermediate`]=`${n}_02_${e}`,Cn[`${i}${t}Distal`]=`${n}_03_${e}`;Cn[`${i}ThumbMetacarpal`]=`thumb_01_${e}`,Cn[`${i}ThumbProximal`]=`thumb_02_${e}`,Cn[`${i}ThumbDistal`]=`thumb_03_${e}`}function Af(i,e="auto",t={},n=Math.random){return t.body==="male"||t.body==="female"?{sex:t.body}:e==="male"||e==="female"?{sex:e}:{sex:n()<.5?"male":"female"}}var fh=new N,Rv=new N,pl=new dt,Ti=new dt;function er(i,e,t){if(!i||!e)return;let n=e.getWorldPosition(fh).sub(i.getWorldPosition(Rv));n.lengthSq()!==0&&(pl.setFromUnitVectors(n.normalize(),t),Ti.identity(),i.parent?.getWorldQuaternion(Ti),i.quaternion.premultiply(Ti).premultiply(pl).premultiply(Ti.invert()),i.updateMatrixWorld(!0))}function Ef(i,e,t=1){let n=new vn;n.add(i),i.scale.setScalar(t),i.updateMatrixWorld(!0);let s=i.children.filter(u=>u.isSkinnedMesh),r=new Sn().setFromObject(i).min.y,o=e.get(Cn.hips)?.getWorldPosition(fh)??fh.set(0,0,0);i.position.set(-o.x,Number.isFinite(r)?-r:0,-o.z),i.updateMatrixWorld(!0);let a={};for(let[u,d]of Object.entries(Cn))e.has(d)&&(a[u]=e.get(d));let l=new Map([...e].map(([u,d])=>[u,d.quaternion.clone()])),c=a.head?.getWorldQuaternion(new dt)??new dt;return{object:n,root:i,bones:e,meshes:s,humanoid:a,rest:l,headRest:c}}function tr(i){Vn(i);let e=i.humanoid;for(let[t,n]of[["left",1],["right",-1]]){let s=new N(n,0,0);er(e[`${t}UpperArm`],e[`${t}LowerArm`],s),er(e[`${t}LowerArm`],e[`${t}Hand`],s);for(let r of["Index","Middle","Ring","Little"])er(e[`${t}${r}Proximal`],e[`${t}${r}Intermediate`],s),er(e[`${t}${r}Intermediate`],e[`${t}${r}Distal`],s)}i.root.updateMatrixWorld(!0)}function Vn(i){for(let[e,t]of i.bones)t.quaternion.copy(i.rest.get(e));i.root.updateMatrixWorld(!0)}function ph(i,e=0){Vn(i);let t=i.humanoid,n=new N;for(let[o,a]of[["left",1],["right",-1]])n.set(a*.3,-1,.03).normalize(),er(t[`${o}UpperArm`],t[`${o}LowerArm`],n),n.set(a*.22,-1,.12).normalize(),er(t[`${o}LowerArm`],t[`${o}Hand`],n);let s=Math.sin(e*1.6)*.012,r=Math.sin(e*.55)*.012;t.chest&&t.chest.rotateX(-s),t.spine&&t.spine.rotateZ(r),t.head&&t.head.rotateZ(-r*.6),i.root.updateMatrixWorld(!0)}var Tf=new N(0,1,0),Iv=new N(1,0,0);function dh(i,e,t){!i||!t||(Ti.identity(),i.parent?.getWorldQuaternion(Ti),pl.setFromAxisAngle(e,t),i.quaternion.premultiply(Ti).premultiply(pl).premultiply(Ti.invert()),i.updateMatrixWorld(!0))}function Cf(i,e=0){ph(i,e);let t=i.humanoid,n=Math.tanh(Math.sin(e*.9)*3)/Math.tanh(3);dh(t.spine,Tf,n*.15),dh(t.head,Tf,n*.4),dh(t.head,Iv,Math.max(0,Math.sin(e*1.7))*.12),i.root.updateMatrixWorld(!0)}var mh={peasant:{label:"Townsfolk",colours:[["clothes-a","Cream"],["clothes-b","Olive"],["clothes-blue","Blue"],["clothes-red","Rose"],["clothes-teal","Green"],["clothes-plum","Plum"],["clothes-grey","Grey"]]},ranger:{label:"Ranger",colours:[["ranger-a","Forest"],["ranger-b","Tan"],["ranger-wine","Violet"],["ranger-dusk","Dusk blue"],["ranger-rust","Rust"],["ranger-moss","Moss"],["ranger-grey","Grey"]]}},xt="none",Pv=[...Object.keys(mh),xt],Lv={peasant:"colour",ranger:"rangerColour"},Rf=[["top","Top"],["arms","Sleeves"],["legs","Legs"],["feet","Boots"]],If=[["hood","Hood","ranger"],["pauldrons","Pauldrons","ranger"]];var Jt=[["shaved","Shaved close"],["crop","Cropped"],["short","Short"],["mohawk","Mohawk"],["slicked","Slicked back"],["fringe","Short with a fringe"],["parted","Side-parted"],["curly","Curly"],["afro","Afro"],["bob","Bob"],["bob_angled","Angled bob"],["buns","Two buns"],["long","Long"],["ponytail","Ponytail"],["braid","Braid"],["none","None (bald)"]];var Pf={buzzed:"short",buzzedfemale:"short",cropped:"short",simpleparted:"parted"},_h={male:["short","parted","long","parted","crop","slicked","fringe","curly"],female:["buns","long","parted","short","ponytail","braid","bob","bob_angled"]},ns=[[2825492,"Dark brown"],[4861724,"Brown"],[8014374,"Chestnut"],[11569232,"Dark blond"],[14731408,"Blond"],[1710618,"Black"],[9187102,"Red"],[12369084,"Grey"],[15921906,"White"],[4878248,"Blue"],[8014490,"Violet"],[4164186,"Green"],[13658764,"Pink"]],Df=8,ei=[[15981003,"Pale"],[15581360,"Rosy"],[15254440,"Fair"],[14264714,"Light"],[14199152,"Golden"],[12618338,"Tan"],[11569498,"Olive"],[10841155,"Bronze"],[9263674,"Brown"],[7357226,"Deep brown"],[6044198,"Dark"],[4007450,"Ebony"]],Nv=[0,2,3,5,8,10],Ei=[.55,1.15],nr=i=>Number.isInteger(i)&&i>=0&&i<=16777215,Jn=i=>!!i&&typeof i=="object"&&!Array.isArray(i),_l=/^[a-z0-9_]{1,64}$/u,Dv=/^3d-avatar-maker-[a-z0-9-]{1,80}$/u,Lf=i=>typeof i=="string"&&_l.test(i)&&!(i in Object.prototype),Nf=(i,e)=>typeof i=="string"&&i.trim()&&i.length<=e?i.trim():null,Uv=["vrm","glb-fbx","mmd","builtin"];function is(i){if(!i||typeof i!="object"||Array.isArray(i))return{};let e={};(f=>Object.hasOwn(mh,f))(i.outfit)&&(e.outfit=i.outfit);for(let[f]of Rf)Pv.includes(i[f])&&(e[f]=i[f]);for(let[f]of If)typeof i[f]=="boolean"&&(e[f]=i[f]);for(let[f,g]of Object.entries(Lv)){let y=mh[f].colours.map(([p])=>p),m=[i[g],i.colour].find(p=>y.includes(p));m&&(e[g]=m)}let n={};for(let[f]of[...Rf,...If]){let g=Jn(i.tints)&&nr(i.tints[f])?i.tints[f]:i.tint;nr(g)&&(n[f]=g)}Object.keys(n).length&&(e.tints=n);let s=Object.hasOwn(Pf,i.hair)?Pf[i.hair]:i.hair;(Jt.some(([f])=>f===s)||Lf(s)&&!Object.hasOwn(Ut,s))&&(e.hair=s);let r=(f,g)=>Number.isInteger(f)&&f>=0&&f<g;r(i.hairColour,ns.length)&&(e.hairColour=i.hairColour),nr(i.hairTint)&&(e.hairTint=i.hairTint);let o=i.skinSet===2?i.skin:Nv[i.skin];r(o,ei.length)&&Object.assign(e,{skin:o,skinSet:2}),nr(i.skinTint)&&(e.skinTint=i.skinTint),[...ml,...Zr].some(([f])=>f===i.skin)&&(e.skin=i.skin),Eh.some(([f])=>f===i.age)&&(e.age=i.age);for(let[f,g]of[["brows",Bv],["lashes",kv]])Number.isFinite(i[f])&&(e[f]=Math.max(1,Math.min(g,Math.round(i[f]))));(i.eyePicture===Hn||Kr.some(([f])=>f===i.eyePicture))&&(e.eyePicture=i.eyePicture),Ml.some(([f])=>f===i.nails)&&(e.nails=i.nails),typeof i.toenails=="boolean"&&(e.toenails=i.toenails),typeof i.beard=="boolean"&&(e.beard=i.beard),(i.figure==="male"||i.figure==="female")&&(e.figure=i.figure),Number.isFinite(i.height)&&(e.height=Math.max(Ei[0],Math.min(Ei[1],Number(i.height)))),Uv.includes(i.avatar)&&(e.avatar=i.avatar),xl.some(([f])=>f===i.body)&&(e.body=i.body),xh.some(([f])=>f===i.species)&&(e.species=i.species),typeof i.wings=="boolean"&&(e.wings=i.wings),Rn.some(([f])=>f===i.race)&&(e.race=i.race);for(let[f,g]of ir)g.some(([y])=>y===i[f])&&(e[f]=i[f]);typeof i.tail=="boolean"&&(e.tail=i.tail);for(let[f,g]of[["shape",[...ss,...Ri,...In,...Ii,...Ci,...jr]],["limbs",rr]]){let y={};for(let[m,,p,x]of g){let M=Jn(i[f])?i[f][m]:void 0,v=Ah[m]?.[0]?-1:p;Number.isFinite(M)&&(y[m]=Math.round(Math.max(v,Math.min(x,M))*1e3)/1e3)}Object.keys(y).length&&(e[f]=y)}let a={};for(let[f]of[...Ch,...Wv,...Object.values(Xv).flat()])Jn(i.colours)&&nr(i.colours[f])&&(a[f]=i.colours[f]);Object.keys(a).length&&(e.colours=a);let l={};for(let[f,g]of[["top",to],["bottom",no]]){let y=Jn(i.underwear)?i.underwear[f]:void 0;(y===xt||g.some(([m])=>m===y))&&(l[f]=y)}Object.keys(l).length&&(e.underwear=l);let c=[];if(Array.isArray(i.clothes)){let f=new Map;for(let g of i.clothes)Object.hasOwn(Ut,g)?f.has(Ut[g])||f.set(Ut[g],g):Lf(g)&&!Jt.some(([y])=>y===g)&&!c.includes(g)&&c.length<Pi.length&&c.push(g);e.clothes=[...f.values(),...c]}let u={};for(let f of[...e.clothes??[],...e.hair?[e.hair]:[]]){let g=Zf(f),y=Jn(i.fromPacks)&&Object.hasOwn(i.fromPacks,f)?i.fromPacks[f]:null;g?u[f]={pack:g.pack,name:g.packName,label:g.label}:(c.includes(f)||f===e.hair&&!Jt.some(([m])=>m===f))&&Jn(y)&&Dv.test(y.pack??"")&&(u[f]={pack:y.pack,name:Nf(y.name,80)??y.pack,label:Nf(y.label,60)??f})}Object.keys(u).length&&(e.fromPacks=u);let d={};for(let[f,g]of Object.entries(Jn(i.clothColours)?i.clothColours:{})){if(!Object.hasOwn(Ut,f)&&!c.includes(f)||!Jn(g))continue;let y={};for(let[m]of or)nr(g[m])&&(y[m]=g[m]);Object.keys(y).length&&(d[f]=y)}Object.keys(d).length&&(e.clothColours=d);let h={};for(let[f,g]of Object.entries(Jn(i.variants)?i.variants:{}))g&&Lh[f]?.ways.some(([y])=>y===g)&&(h[f]=g);return Object.keys(h).length&&(e.variants=h),typeof i.preset=="string"&&i.preset.trim()&&(e.preset=i.preset.trim().slice(0,qv)),e}var xl=[["male","Male body"],["female","Female body"]],xh=[["human","Human"],["wolf","Anthro wolf"],["dragon","Anthro dragon"]],Uf={wolf:{head:1.18}},Rn=[["human","Human"],["dwarf","Dwarf","race_dwarf",1,{height:.87,legs:.7,arms:.8,head:1.18}],["halfling","Halfling","race_halfling",1,{height:.58,legs:.86,arms:.9,head:1.2}],["gnome","Gnome","race_gnome",1,{height:.62,legs:.85,arms:.98,head:1.4}],["elf","Elf","race_elf",1,{height:1,legs:1.03,arms:1.02,head:.97}],["halfelf","Half-elf","race_elf",.5,{height:1,legs:1.015,arms:1.01,head:.985}],["halforc","Half-orc","race_halforc",1,{height:1.05,legs:1,arms:1.03,head:1}],["tiefling","Tiefling","race_tiefling",1,{height:1,legs:1,arms:1,head:1}]],Ci=[["race_dwarf","Dwarf build",0,1,"Broad and stocky: thick limbs, big hands, a broad strong face.",["None","Full"]],["race_halfling","Halfling build",0,1,"A halfling's build and round, youthful face.",["None","Full"]],["race_gnome","Gnome build",0,1,"A gnome's build, big nose and round face.",["None","Full"]],["race_elf","Elf features",0,1,"Slender, with fine features and almond eyes (pointed ears are on the Face tab).",["None","Full"]],["race_halforc","Orc features",0,1,"Heavy-boned and strong, with a broad nose and jaw.",["None","Full"]],["race_tiefling","Tiefling features",0,1,"Sharper cheekbones and a narrower face.",["None","Full"]]];function Of(i,e="female"){let[,,t="",n=0,s={}]=Rn.find(([a])=>a===i)??Rn[0],r=Object.fromEntries(Ci.map(([a])=>[a,a===t?n:0]));r.ears={elf:1,halfelf:.5}[i]??0;let o={halforc:bh[0][0],tiefling:vh[0][0]}[i];return{race:i,shape:r,height:s.height??1,limbs:{arms:s.arms??1,legs:s.legs??1,head:s.head??1},facialHair:i==="dwarf"&&e==="male"?"beard-02":xt,tusks:i==="halforc"?e==="male"?"tusks-02":"tusks-01":xt,horns:i==="tiefling"?"horns-01":xt,tail:i==="tiefling",...o?{skin:"custom",colours:{skin:o,eyes:i==="tiefling"?15253568:11569706}}:{}}}var yl=i=>{let[,,e="",t=0,n={}]=Rn.find(([s])=>s===i)??Rn[0];return{key:e,weight:t,height:1,legs:1,arms:1,head:1,...n}},Ov=[[xt,"None"],["moustache-01","Moustache"],["beard-05","Moustache and goatee"],["beard-01","Short beard"],["beard-02","Full beard"],["beard-03","Long beard"],["beard-04","Long beard with braids"]],Fv=[[xt,"None"],["tusks-01","Small"],["tusks-02","Large"]],yh=[[xt,"None"],["horns-03","Nubs"],["horns-01","Swept back"],["horns-02","Ram's curl"],["horns-04","Tall"]],ir=[["facialHair",Ov,"Facial hair","A beard or moustache, in the hair's colour."],["tusks",Fv,"Tusks","A half-orc's lower tusks."],["horns",yh,"Horns","A tiefling's horns."]],vh=[[11747898,"Red"],[4876968,"Blue"],[8014490,"Purple"]],bh=[[8227946,"Grey-green"],[9080706,"Grey"]],Sh=new Set(["head","brow","feet"]),ss=[["weight","Weight",-1,1,"Thinner to heavier, all over.",["Thin","Heavy"]],["muscle","Muscle",-.5,1,"Softer to more muscular.",["Soft","Muscular"]],["chest","Chest",-.5,1,"A flatter or fuller chest (her bust).",["Flat","Full"]],["hips","Hips",-.5,1,"Narrower or wider hips and seat.",["Narrow","Wide"]],["waist","Waist",-1,.5,"A narrower or wider waist.",["Narrow","Wide"]],["belly","Belly",-.5,1,"A flatter or rounder belly.",["Flat","Round"]],["shoulders","Shoulders",-.5,1,"Narrower or broader shoulders.",["Narrow","Broad"]],["neck","Neck",-.5,1,"A slimmer or thicker neck.",["Slim","Thick"]]],Ri=[["jaw","Jaw",-.5,1,"A softer or a squarer, stronger jaw and chin.",["Soft","Strong"]],["cheeks","Cheekbones",-.5,1,"Flatter or higher, fuller cheekbones.",["Flat","Full"]],["nose","Nose",-.5,1,"A smaller or larger nose.",["Small","Large"]],["eyes","Eyes",-.5,1,"Smaller or larger eyes.",["Small","Large"]],["ears","Pointed ears",0,1,"Round ears to long, pointed ones, as an elf's.",["Round","Pointed"]]],Ff=[["eyes","Eyes","Where the eyes sit and their shape. Eye size is under Face shape."],["brows","Brows","The brow line. The brow hair's style and colour are below."],["nose","Nose","Its shape in detail. Overall size is under Face shape."],["mouth","Mouth and lips",""],["jaw","Jaw and chin",""],["cheeks","Cheeks",""],["ears","Ears","Pointed ears are under Face shape."],["head","Forehead, head and neck","Hair and hats follow the head's shape."]],In=[["eye_height","Height",-1,1,"Where the eyes sit on the face.",["Lower","Higher"],"eyes"],["eye_spacing","Spacing",-1,1,"Closer together or further apart.",["Close","Wide"],"eyes"],["eye_depth","Depth",-1,1,"Standing out or set deep under the brow.",["Prominent","Deep-set"],"eyes"],["eye_tilt","Tilt",-1,1,"The outer corners lower or higher than the inner.",["Down","Up"],"eyes"],["eye_opening","Opening",-1,1,"Narrower or wider open.",["Narrow","Wide"],"eyes"],["eyelid","Eyelids",-1,1,"More of the upper lid showing, or a heavier, hooded lid.",["Open","Hooded"],"eyes"],["eye_inner_fold","Inner fold",-1,1,"The fold of skin over the inner corner.",["Less","More"],"eyes"],["eye_bags","Under the eyes",-1,1,"Smooth or puffy under the eyes.",["Smooth","Puffy"],"eyes"],["brow_height","Height",-1,1,"The brows lower or higher.",["Lower","Higher"],"brows"],["brow_angle","Angle",-1,1,"The brows' outer ends lower or higher.",["Down","Up"],"brows"],["brow_ridge","Ridge",-1,1,"A flat brow, or a heavy ridge standing out.",["Flat","Heavy"],"brows"],["nose_length","Length",-1,1,"A shorter or longer nose, top to tip.",["Short","Long"],"nose"],["nose_width","Width",-1,1,"A narrower or wider nose.",["Narrow","Wide"],"nose"],["nose_depth","Projection",-1,1,"How far the nose stands out from the face.",["Flat","Projecting"],"nose"],["nose_bridge","Bridge",-1,1,"A scooped or a humped bridge.",["Scooped","Humped"],"nose"],["nose_tip","Tip",-1,1,"The tip turned down or up.",["Down","Up"],"nose"],["nose_tip_width","Tip width",-1,1,"A fine or a broad tip.",["Fine","Broad"],"nose"],["nostrils","Nostrils",-1,1,"Narrower or flared nostrils.",["Narrow","Flared"],"nose"],["nose_height","Height",-1,1,"The nose lower or higher on the face.",["Lower","Higher"],"nose"],["mouth_width","Width",-1,1,"A narrower or wider mouth.",["Narrow","Wide"],"mouth"],["mouth_height","Height",-1,1,"The mouth lower or higher on the face.",["Lower","Higher"],"mouth"],["mouth_depth","Depth",-1,1,"The mouth set back or pushed forward.",["Back","Forward"],"mouth"],["upper_lip","Upper lip",-1,1,"A thinner or fuller upper lip.",["Thin","Full"],"mouth"],["lower_lip","Lower lip",-1,1,"A thinner or fuller lower lip.",["Thin","Full"],"mouth"],["cupids_bow","Cupid's bow",-1,1,"A flat or a deeply curved upper lip line.",["Flat","Curved"],"mouth"],["mouth_corners","Corners",-1,1,"The corners of the mouth turned down or up.",["Down","Up"],"mouth"],["jaw_forward","Jaw forward",-1,1,"The lower jaw back (an overbite) or forward (an underbite).",["Back","Forward"],"jaw"],["jaw_width","Jaw width",-1,1,"A narrower or wider jaw at its angles.",["Narrow","Wide"],"jaw"],["chin_height","Chin height",-1,1,"A shorter or longer chin.",["Short","Long"],"jaw"],["chin_width","Chin width",-1,1,"A pointed or a broad chin.",["Pointed","Broad"],"jaw"],["chin_prominence","Chin forward",-1,1,"A receding or a prominent chin.",["Receding","Prominent"],"jaw"],["chin_cleft","Cleft",-1,1,"A smooth chin or a cleft in it.",["Smooth","Cleft"],"jaw"],["cheekbones","Cheekbones",-1,1,"Flat or high, strong cheekbones.",["Flat","High"],"cheeks"],["cheek_fullness","Fullness",-1,1,"Thinner or fuller cheeks.",["Thin","Full"],"cheeks"],["cheek_hollows","Hollows",-1,1,"Full under the cheekbones, or hollow.",["Full","Hollow"],"cheeks"],["ear_size","Size",-1,1,"Smaller or larger ears.",["Small","Large"],"ears"],["ear_angle","Angle",-1,1,"Ears lying flat or standing out.",["Flat","Out"],"ears"],["ear_lobes","Lobes",-1,1,"Smaller or larger lobes.",["Small","Large"],"ears"],["ear_height","Height",-1,1,"The ears lower or higher.",["Lower","Higher"],"ears"],["forehead_height","Forehead height",-1,1,"A lower or higher forehead.",["Low","High"],"head"],["forehead_slope","Forehead slope",-1,1,"A sloping or an upright forehead.",["Sloping","Upright"],"head"],["temples","Temples",-1,1,"Hollow or full temples.",["Hollow","Full"],"head"],["head_width","Head width",-1,1,"A narrower or wider head.",["Narrow","Wide"],"head"],["head_height","Head height",-1,1,"A shorter or taller head.",["Short","Tall"],"head"],["head_depth","Head depth",-1,1,"A shallower or deeper head, front to back.",["Shallow","Deep"],"head"],["neck_length","Neck length",-1,1,"A shorter or longer neck.",["Short","Long"],"head"],["cheeks_round_high","Round, high",0,1,"Round, chipmunk cheeks, high on the face.",["None","Round"],"cheeks"],["cheeks_round_low","Round, low",0,1,"Round, chipmunk cheeks, lower down.",["None","Round"],"cheeks"],["cheekbones_chubby","Soft cheekbones",0,1,"High cheekbones with soft, full flesh over them.",["None","Full"],"cheeks"],["jowls","Jowls",0,1,"Flesh hanging at the jaw line, as with age.",["None","Heavy"],"cheeks"],["cheeks_sunken","Sunken",0,1,"Cheeks sunk in below the cheekbones.",["None","Sunken"],"cheeks"],["ears_flared","Flared",0,1,"The top of the ears flaring out.",["None","Flared"],"ears"],["ears_flatter","Flatter",0,1,"The ears' folds flatter.",["None","Flat"],"ears"],["lobes_out","Lobes out",0,1,"The lobes turned out from the head.",["None","Out"],"ears"],["detail_ears","Ear detail",0,1,"Finer folds and rims in the ears.",["Plain","Detailed"],"ears"],["detail_ear_inner","Inner ear",0,1,"A deeper bowl inside the ear.",["Plain","Deep"],"ears"],["detail_ear_canal","Ear canal",0,1,"An opening into the ear.",["None","Open"],"ears"],["nose_bulbous","Bulbous",0,1,"A round, bulbous tip.",["None","Bulbous"],"nose"],["nose_base_wide","Wide base",0,1,"The nose wider where it meets the face.",["None","Wide"],"nose"],["nose_greek","Greek",0,1,"A straight line from the brow to the tip, as on a Greek statue.",["None","Greek"],"nose"],["nostrils_up","Nostrils up",0,1,"Nostrils turned up, showing more from the front.",["None","Up"],"nose"],["nostrils_small","Small nostrils",0,1,"Smaller nostril openings.",["None","Small"],"nose"],["nostrils_round","Round nostrils",0,1,"Rounder wings at the sides of the nostrils.",["None","Round"],"nose"],["detail_nose_crease","Crease",0,1,"The crease where the nostril wings meet the cheek.",["Plain","Creased"],"nose"],["detail_columella","Columella",0,1,"A straight strip of skin between the nostrils.",["Plain","Straight"],"nose"],["detail_nostril_rims","Nostril rims",0,1,"Sharper rims round the nostrils.",["Soft","Sharp"],"nose"]],Bf=[["arms","Arms","Arm length is under Proportions."],["hands","Hands","The nails' length and colour are under Skin and eyes."],["legs","Legs","Leg length is under Proportions."],["torso","Torso and hips",""],["bust","Bust","Its size is the Chest slider above."]],Ii=[["upper_arms","Upper arms",-1,1,"Slimmer or thicker upper arms.",["Slim","Thick"],"arms"],["forearms","Forearms",-1,1,"Slimmer or thicker forearms.",["Slim","Thick"],"arms"],["arm_muscle","Arm muscle",-1,1,"Softer or more muscular arms.",["Soft","Muscular"],"arms"],["thighs","Thighs",-1,1,"Slimmer or thicker thighs.",["Slim","Thick"],"legs"],["calves","Calves",-1,1,"Slimmer or thicker calves.",["Slim","Thick"],"legs"],["leg_muscle","Leg muscle",-1,1,"Softer or more muscular legs.",["Soft","Muscular"],"legs"],["buttocks","Buttocks",-1,1,"Flatter or fuller buttocks.",["Flat","Full"],"torso"],["torso_taper","Taper",-1,1,"A straight torso, or one narrowing from the shoulders.",["Straight","V-shaped"],"torso"],["back_muscle","Back",-1,1,"A narrower or broader, more muscled back.",["Narrow","Broad"],"torso"],["stomach_tone","Stomach",-1,1,"A softer or more toned stomach.",["Soft","Toned"],"torso"],["hip_width","Hip bones",-1,1,"Narrower or wider hip bones (Hips above is the hips and seat).",["Narrow","Wide"],"torso"],["bust_height","Height",-1,1,"The bust lower or higher.",["Lower","Higher"],"bust"],["bust_spacing","Spacing",-1,1,"Closer together or further apart.",["Close","Apart"],"bust"],["bust_shape","Shape",-1,1,"Rounder or more pointed.",["Round","Pointed"],"bust"],["bust_lift","Lift",-1,1,"Fuller below or above.",["Low","Lifted"],"bust"],["detail_upper_arms","Upper arm shape",0,1,"The shape of the upper arm's muscles.",["Plain","Shaped"],"arms"],["detail_forearms","Forearm shape",0,1,"The shape of the forearm's muscles.",["Plain","Shaped"],"arms"],["detail_wrists","Wrist bone",0,1,"The bone at the outside of the wrist.",["Plain","Showing"],"arms"],["detail_armpits","Armpits",0,1,"A truer hollow under the arm.",["Plain","Shaped"],"arms"],["elbow_dimples","Elbow dimples",0,1,"Soft dimples at the elbows.",["None","Dimpled"],"arms"],["detail_fingers","Fingers",0,1,"Truer fingers, with their joints.",["Plain","Shaped"],"hands"],["detail_palm","Palm",0,1,"The pad at the little finger's side of the palm.",["Plain","Shaped"],"hands"],["detail_thumb","Thumb pad",0,1,"The pad at the base of the thumb.",["Plain","Shaped"],"hands"],["knuckles_knobby","Knuckles",0,1,"Knobbly knuckles, as with age or hard work.",["Smooth","Knobbly"],"hands"]],Mh={shape:[["Round",{head_width:.4,cheek_fullness:.6,jaw_width:-.2,chin_width:.2,chin_height:-.3}],["Oval",{head_height:.3,jaw_width:-.3,chin_width:-.2}],["Square",{jaw_width:.8,chin_width:.6,head_width:.3}],["Heart",{jaw_width:-.6,chin_width:-.8,temples:.5,forehead_height:.3}],["Long",{head_height:.7,chin_height:.6,head_width:-.3}],["Diamond",{cheekbones:.8,jaw_width:-.4,chin_width:-.6,temples:-.4}]],eyes:[["Almond",{eye_opening:-.3,eye_tilt:.3}],["Round",{eye_opening:.6,eyelid:-.4}],["Upturned",{eye_tilt:.8}],["Downturned",{eye_tilt:-.7,eyelid:.3}],["Hooded",{eyelid:.9,eye_opening:-.2}],["Deep-set",{eye_depth:.8}],["Wide-set",{eye_spacing:.7}],["Close-set",{eye_spacing:-.7}],["Inner fold",{eye_inner_fold:.9,eyelid:.4,eye_opening:-.3}]],brows:[["Arched",{brow_angle:.6,brow_height:.3}],["Straight",{brow_angle:-.3}],["Heavy",{brow_ridge:.8,brow_height:-.4}],["Raised",{brow_height:.8}]],nose:[["Button",{nose_length:-.5,nose_tip:.5,nose_tip_width:.3,nose_depth:-.3}],["Roman",{nose_bridge:.8,nose_length:.4,nose_tip:-.3}],["Snub",{nose_tip:.9,nose_length:-.4}],["Narrow",{nose_width:-.6,nose_tip_width:-.5,nostrils:-.4}],["Broad",{nose_width:.6,nostrils:.7,nose_tip_width:.5}],["Scooped",{nose_bridge:-.8,nose_tip:.4}]],mouth:[["Full lips",{upper_lip:.8,lower_lip:.8}],["Thin lips",{upper_lip:-.7,lower_lip:-.6}],["Wide",{mouth_width:.7}],["Small",{mouth_width:-.6,upper_lip:.2,lower_lip:.2}],["Bow-shaped",{cupids_bow:.9,upper_lip:.4}],["Smiling corners",{mouth_corners:.6}]],jaw:[["Strong",{jaw_width:.7,chin_width:.5,chin_prominence:.4}],["Soft",{jaw_width:-.6,chin_width:-.3}],["Pointed chin",{chin_width:-.9,chin_height:.3}],["Underbite",{jaw_forward:.9,chin_prominence:.4}],["Overbite",{jaw_forward:-.8,chin_prominence:-.4}],["Cleft chin",{chin_cleft:.9}]],cheeks:[["High cheekbones",{cheekbones:.8,cheek_hollows:.3}],["Full cheeks",{cheek_fullness:.8,cheek_hollows:-.4}],["Gaunt",{cheek_fullness:-.6,cheek_hollows:.8,temples:-.3}]],ears:[["Small and flat",{ear_size:-.5,ear_angle:-.6}],["Large",{ear_size:.7,ear_lobes:.4}],["Sticking out",{ear_angle:.9}]],head:[["High forehead",{forehead_height:.8}],["Long neck",{neck_length:.8}],["Short neck",{neck_length:-.7}]]},vl=[["semireal","Semi-real","The body and face as made.",{shape:{},limbs:{head:1}}],["anime","Anime proportions (trial)","Large eyes set low and apart, a small nose and mouth, a narrow pointed chin and a slightly larger head. A trial on the semi-real head: the anime look itself (its eyes, flat shading and outlines) is still to come.",{shape:{eyes:1,eye_height:-.35,eye_spacing:.35,eye_opening:.7,eye_tilt:.15,eyelid:-.5,eye_depth:-.5,brow_ridge:-.8,brow_height:.4,nose:-.5,nose_width:-.6,nose_depth:-.6,nose_length:-.4,nostrils:-.8,nose_tip:.4,nose_bridge:-.4,mouth_width:-.5,upper_lip:-.5,lower_lip:-.2,jaw:-.5,jaw_width:-.7,chin_width:-.8,chin_height:-.2,chin_prominence:-.2,cheeks:-.3,cheekbones:-.4,cheek_fullness:.3,cheek_hollows:-.6,forehead_height:.5,head_height:.2,head_width:.1},limbs:{head:1.1}}]],gh=([i])=>!i.startsWith("detail_"),kf=[...Ri.map(([i])=>i),...In.filter(gh).map(([i])=>i)],wh=i=>i==="shape"?In.filter(gh).filter(([,,,,,,e])=>["jaw","cheeks","head"].includes(e)).map(([e])=>e):In.filter(gh).filter(([,,,,,,e])=>e===i).map(([e])=>e),jr=[["muzzle","Muzzle",-1,1,"A shorter or a longer muzzle.",["Short","Long"],"face"],["earSize","Ears",-1,1,"Smaller or taller ears.",["Small","Tall"],"face"],["horns","Horns",-1,1,"Smaller or larger horns.",["Small","Large"],"face"],["tailLength","Tail length",-1,1,"A shorter or a longer tail.",["Short","Long"],"build"],["tail","Tail thickness",0,1,"A slim tail to a thicker one.",["Slim","Thick"],"build"]],Ah={weight:["thin","heavy"],neck:["neck_slim","neck"],ears:[null,"ears_pointed"],muzzle:["muzzle_short","muzzle"],earSize:["ears_small","ears_tall"],horns:["horns_small","horns"],tailLength:["tail_short","tail_long"],eyes:["eye_size.lo","eyes"],...Object.fromEntries([...In,...Ii].map(([i])=>[i,[`${i}.lo`,`${i}.hi`]]))},Th=(i,e)=>Ah[i]??[null,i==="chest"&&e==="female"?"bust":i],sr=(i,e,t)=>e.includes(Th(i,t)[1]),bl=([i,,e,t],n)=>[n.includes(Ah[i]?.[0])?-1:e,t],zf=(i,[e,t])=>i<0?-i/e:i/t,Vf=(i,[e,t])=>i<0?-i*e:i*t,rr=[["arms","Arm length",.75,1.2,"Shorter or longer arms, no thicker.",["Short","Long"]],["legs","Leg length",.65,1.2,"Shorter or longer legs, no thicker. Longer legs stand taller.",["Short","Long"]],["head","Head size",.85,1.45,"A smaller or larger head (and its hair).",["Small","Large"]]],Hf={shape:{...Object.fromEntries([...ss,...Ri,...In,...Ii,...Ci,...jr].map(([i])=>[i,0])),detail_ears:1,detail_ear_inner:.5,detail_ear_canal:.6,detail_nose_crease:.6,detail_nostril_rims:.5,detail_fingers:1,detail_palm:.6,detail_thumb:.6,detail_armpits:1,detail_wrists:.5},limbs:Object.fromEntries(rr.map(([i])=>[i,1])),height:1},Eh=[["young","Young adult"],["middle","Middle-aged (about 50)"],["old","Old (about 72)"]],ml=[["caucasian","Caucasian"],["african","African"],["asian","Asian"],["custom","A colour of your own"]],Zr=[["creamy","Creamy",["female"]],["redhead","Redhead's",["female"]],["freckles","Light, freckled",["female","male"]],["ginger","Light, ginger",["female","male"]],["bronze","Bronzed",["female","male"]],["eurasian-young","Eurasian, young",["female"]],["eurasian-middle","Eurasian, middle-aged",["female"]],["eurasian-old","Eurasian, old",["female","male"]],["aksel","Fair, weathered",["male"]],["natural-makeup","Light, natural make-up",["female"]],["classic-makeup","Light, make-up",["female"]],["violet-makeup","Light, violet make-up",["female"]],["bronze-makeup","Bronzed, make-up",["female"]],["eyeliner","Light, eyeliner",["male"]],["goth-makeup","Light, goth make-up",["male"]],["emo-eyes","Light, dark eye make-up",["male"]],["tattooed","Tattooed",["male"]]],Sl=i=>[...ml.slice(0,-1),...Zr.filter(([,,e])=>e.includes(i)).map(([e,t])=>[e,t]),...ml.slice(-1)],Gf=(i,e,t)=>i==="custom"?null:Zr.some(([n])=>n===i)?`avatar-${e}-skin-${i}`:`avatar-${e}-skin-${t}-${i}`,Hn="tint",Kr=[["brownlight","Brown"],["brown","Red-brown"],["green","Green"],["bluegreen","Blue-green"],["blue","Blue"],["lightblue","Light blue"],["deepblue","Deep blue"],["grey","Grey"],["ice","Ice"],["amber","Amber"],["hazel","Hazel"],["seabreeze","Sea green"],["clearblue","Clear blue"],["steel","Steel grey"],["darkbrown","Dark brown"],["sapphire","Sapphire"],["cat-blue","Cat's eye, blue"],["cat-brown","Cat's eye, brown"],["cat-green","Cat's eye, green"],["cat-sapphire","Cat's eye, sapphire"],["cat-yellow","Cat's eye, yellow"],["reptile","Reptile, fiery"],["dragon","Dragon"],["anime-navy","Anime, navy (trial)"]],Jr=5,Bv=16,kv=6,Wf={13:"Thin, fine hairs",14:"Natural, fine hairs",15:"Thick, fine hairs",16:"Arched, fine hairs"},Xf={5:"Natural, fine",6:"Full, fine"},Qr=[[3877406,"Dark brown"],[7031338,"Brown"],[9071162,"Hazel"],[10123818,"Amber"],[5208639,"Green"],[4157322,"Blue"],[8030874,"Grey"],[5917306,"Violet"]],zv=[[12088428,"Rose"],[13208190,"Pale pink"],[10113096,"Deep rose"],[11024954,"Red"],[6957626,"Berry"],[8014394,"Brown"],[4860458,"Dark"]],Vv=[[15780028,"Natural"],[16050400,"Pale"],[12595258,"Red"],[14192808,"Pink"],[3824282,"Blue"],[2779722,"Green"],[1710618,"Black"]],eo=[[15262940,"Off-white"],[16185078,"White"],[14207144,"Cream"],[9079434,"Grey"],[2763310,"Black"],[3820154,"Navy"],[9058874,"Red"],[4876874,"Green"],[6965810,"Brown"],[13672624,"Pink"],[6965882,"Violet"]],Ch=[["skin","Skin",ei,"The skin all over."],["eyes","Eyes",Qr,"The colour of the eyes."],["lips","Lips",zv,"The lips."],["nails","Nails",Vv,"Finger and toe nails."],["brows","Brows",ns,"Eyebrows and lashes (else the hair's colour, a little darker)."],["underwear","Underwear",eo,"The underwear's cloth."]],es=[[7235682,"Grey",15261648],[9407104,"Timber grey",15261648],[11118756,"Silver",16052714],[15328990,"White",16052714],[2367775,"Black",3814963],[6046771,"Brown",13216124],[9065008,"Red",15261648],[10846810,"Tawny",15261648],[14207144,"Cream",16052714]],Hv=[[15261648,"Cream"],[16052714,"White"],[12762806,"Pale grey"],[13216124,"Tan"],[8223348,"Grey"],[3814963,"Charcoal"]],Rh=[[2828069,"Black"],[4008738,"Dark brown"],[6964792,"Liver"],[12618372,"Pink"]],gl=[[14260779,"Amber"],[14726714,"Gold"],[14207050,"Yellow"],[14711326,"Orange"],[7031338,"Brown"],[6261311,"Green"],[9091288,"Ice blue"],[4157338,"Blue"],[11545122,"Red"],[8014490,"Violet"]],Ih=[[2828326,"Black"],[4865331,"Dark horn"],[9073752,"Horn"],[14208436,"Bone"],[15789282,"White"]],ts=[[2763310,"Black",6974064],[3104666,"Blue",14271114],[12098122,"Brass",14998728],[9071162,"Bronze",14271114],[12085818,"Copper",14998728],[13936682,"Gold",15787720],[4160063,"Green",14271114],[10496546,"Red",14271114],[11843776,"Silver",15133422],[15133422,"White",11059416]],Gv=[[14271114,"Pale gold"],[14998728,"Bone"],[15787720,"Cream"],[15133422,"White"],[6974064,"Ash"],[3815998,"Charcoal"],[11059416,"Pale blue"],[11061408,"Pale green"],[14198944,"Rose"]],rs=[[14141863,"Bone"],[15788760,"Ivory"],[6967352,"Horn brown"],[2762790,"Black"],[9078916,"Grey"],[13148240,"Gold"]],Wv=[["horns","Horns",rs,"The horns."]],Xv={wolf:[["fur","Fur",es,"The coat: the back, head, limbs and tail. The neck ruff's tufts follow it."],["fur2","Lighter fur",Hv,"The muzzle, throat, chest, belly and the tail's underside."],["nose","Nose",Rh,"The nose and the paw pads."],["eyes","Eyes",gl,"The colour of the eyes."],["claws","Claws",Ih,"The claws on hands and feet."]],dragon:[["scales","Scales",ts,"The scales all over: the back, head, limbs, tail and wings."],["scales2","Underside",Gv,"The throat, chest, belly and the wings' skin."],["horns","Horns",rs,"The horns, spines and claws."],["eyes","Eyes",gl,"The colour of the eyes."]]};var to=[["bra","Bra"],["sports_bra","Sports bra"],["bralette","Bralette"],["undershirt","Undershirt"]],no=[["briefs","Briefs"],["boxer_briefs","Boxer briefs"],["boxers","Boxers"],["boyshorts","Boyshorts"],["bikini","Bikini"],["thong","Thong"]],Pi=[["head","Head","A hood, a helm or a hat. Most hide the hair.","head"],["brow","Brow","A circlet on the brow.","head"],["horns","Horns or antlers","Horns or antlers fixed to the head, beside any horns chosen on the Face tab. A hat, hood or helm hides them.","extras","Head"],["face","Glasses","Glasses or a mask over the eyes.","accessories"],["mouth","Face mask","A mask over the mouth and nose.","accessories"],["ears","Earrings","A pair of earrings.","accessories"],["neck","Neck","A scarf.","accessories"],["necklace","Necklace","A necklace, a chain or a collar. A scarf hides it.","accessories"],["back","Cloak or coat","Worn over everything else.","body"],["on_back","On the back","Wings, a backpack, or a guitar slung across the back.","objects"],["body","Whole outfit","A dress, gown, robe or one-piece: top and legs in one.","body"],["top","Shirt or top","Next to the skin, under everything else.","tops"],["over","Over the shirt","A tunic, vest, corset, padded gambeson or jacket.","tops"],["armour","Body armour","Mail, scale, brigandine, leather or a harness.","armour"],["plate","Breastplate","A plate cuirass, over mail or a gambeson.","armour"],["shoulders","Shoulders","Plate pauldrons.","armour"],["arms","Forearms","Leather bracers.","hands"],["hands","Hands","Gloves or plate gauntlets.","hands"],["fingers","Rings","A ring. Gloves hide it.","accessories"],["wrists","Wrists","Bracelets or bangles. Gloves and bracers hide them.","accessories"],["waist","Belt","A belt with pouches.","accessories"],["belly","Belly","A belly piercing or a belly chain. A one-piece outfit, a breastplate or an apron hides it.","accessories"],["hip","At the hip","A sword, a purse or a bag hung at the hip.","objects"],["apron","Apron","A work apron, as a smith or a cook wears.","accessories"],["legs","Legs","Trousers, skirts, shorts and the like.","legs"],["tail","Tail","A tail worn as an item, such as a cat's. The tiefling tail on the Face tab is separate from this.","extras"],["thighs","Thigh plates","Plate tassets hung from the waist.","armour"],["shins","Shins","Plate greaves.","armour"],["socks","Socks","Socks or leg warmers, under the shoes.","feet"],["ankles","Ankles","Anklets. Socks and greaves hide them.","accessories"],["feet","Feet","Boots, shoes or sandals.","feet"],["hand_right","Right hand","Something held in the right hand: a sword, a microphone, a bag. It moves with the hand and doesn't bend.","objects","hand_r"],["hand_left","Left hand","Something held in the left hand. It moves with the hand and doesn't bend.","objects","hand_l"]],Ph=["Head","neck_01","spine_01","spine_02","spine_03","pelvis","clavicle_l","clavicle_r","upperarm_l","upperarm_r","lowerarm_l","lowerarm_r","hand_l","hand_r","thigh_l","thigh_r","calf_l","calf_r","foot_l","foot_r"],Yf=(i,e=null)=>Ph.includes(e)?e:Pi.find(([t])=>t===i)?.[4]??null,qf=[["nails","Fingernails","Short, medium or long.","hands"],["toenails","Toenails","On the toes.","feet"]],Ml=[["short","Short"],["medium","Medium"],["long","Long"],["none","None"]],Yv={nails:["hands"],toenails:["feet","socks"],fingers:["hands"],wrists:["hands","arms"],ankles:["socks","shins"],necklace:["neck"],belly:["body","plate","apron"],horns:["head"]},wl=(i,e)=>(Yv[i]??[]).some(t=>e.has(t)),io=[["hood","Hood","head"],["helm","Open helm","head"],["full_helm","Full helm","head"],["mh_fedora","Fedora","head"],["mh_fedora_cocked","Fedora, tilted","head"],["circlet","Circlet","brow"],["scarf","Scarf","neck"],["cloak","Cloak","back"],["long_coat","Long coat","back"],["dress","Dress","body"],["gown","Gown","body"],["robe","Robe","body"],["one_piece_swimsuit","Swimsuit","body"],["mh_workwear","Work overalls and shirt","body"],["shirt","Linen shirt","top"],["t_shirt","T-shirt","top"],["tank_top","Tank top","top"],["crop_top","Crop top","top"],["blouse","Blouse","top"],["bikini_top","Bikini top","top"],["mh_tee","Tee","top"],["mh_long_tee","Long tee","top"],["mh_longsleeve_tee","Long-sleeved tee","top"],["mh_denim_shirt","Denim shirt","top"],["mh_plaid_shirt","Plaid shirt","top"],["mh_female_tee","Tee","top"],["mh_female_loose_tee","Loose tee","top"],["mh_female_sport_top","Sports top","top"],["tunic","Tunic","over"],["vest","Vest","over"],["corset","Corset","over"],["gambeson","Gambeson","over"],["mh_jacket","Jacket","over"],["mh_suit_jacket","Suit jacket","over"],["mh_female_blazer","Blazer","over"],["chainmail","Chainmail","armour"],["scale_mail","Scale mail","armour"],["brigandine","Brigandine","armour"],["leather_armour","Leather armour","armour"],["bikini_armour","Bikini armour","armour"],["barbarian_harness","Barbarian harness","armour"],["plate_cuirass","Plate cuirass","plate"],["pauldrons","Pauldrons","shoulders"],["bracers","Bracers","arms"],["gloves","Leather gloves","hands"],["gauntlets","Gauntlets","hands"],["belt_pouches","Belt and pouches","waist"],["apron","Apron","apron"],["trousers","Trousers","legs"],["leggings","Leggings","legs"],["shorts","Shorts","legs"],["skirt","Long skirt","legs"],["short_skirt","Short skirt","legs"],["pleated_skirt","Pleated skirt","legs"],["loincloth","Loincloth","legs"],["swim_trunks","Swim trunks","legs"],["bikini_bottom","Bikini bottom","legs"],["mh_jeans","Jeans","legs"],["mh_jeans_dark","Dark jeans","legs"],["mh_suit_trousers","Suit trousers","legs"],["mh_overalls","Overalls","legs"],["mh_female_jeans","Jeans","legs"],["mh_female_leggings","Leggings","legs"],["mh_female_shorts","Shorts","legs"],["mh_female_skirt","Skirt","legs"],["tassets","Tassets","thighs"],["greaves","Greaves","shins"],["boots","Boots","feet"],["tall_boots","Tall boots","feet"],["shoes","Shoes","feet"],["sandals","Sandals","feet"],["sabatons","Sabatons","feet"],["mh_boots_black","Black boots","feet"],["mh_shoes_black","Black shoes","feet"],["mh_shoes_brown","Brown shoes","feet"],["mh_trainers_white","White trainers","feet"],["mh_trainers_blue","Blue trainers","feet"],["mh_trainers_worn","Worn trainers","feet"],["nails_short","Short nails","nails"],["nails_medium","Medium nails","nails"],["nails_long","Long nails","nails"],["toenails","Toenails","toenails"]],Ut=Object.fromEntries(io.map(([i,,e])=>[i,e])),Qn={};function $f(i){for(let e of i)Object.hasOwn(Ut,e.piece)||(io.push([e.piece,e.label,e.slot]),Ut[e.piece]=e.slot,Qn[e.piece]=e)}var ln={};function jf(i){for(let e of i)Jt.some(([t])=>t===e.style)||Object.hasOwn(Ut,e.style)||(Jt.splice(Jt.length-1,0,[e.style,e.label]),ln[e.style]=e)}var Zf=i=>Object.hasOwn(Qn,i)?Qn[i]:Object.hasOwn(ln,i)?ln[i]:null,Al=i=>[...new Set([...i?.clothes??[],...i?.hair?[i.hair]:[]].map(e=>Zf(e)?.credit).filter(Boolean))];function so(i){let e=(i?.clothes??[]).filter(n=>!Object.hasOwn(Ut,n)),t=i?.hair&&!Jt.some(([n])=>n===i.hair)?i.hair:null;return{clothes:e,hair:t}}function Kf(i){let{clothes:e,hair:t}=so(i);if(!e.length&&!t)return i;let n=new Set([...e,t]),s={...i};s.clothes&&(s.clothes=s.clothes.filter(r=>!n.has(r))),t&&delete s.hair;for(let r of["clothColours","fromPacks"])s[r]&&(s[r]=Object.fromEntries(Object.entries(s[r]).filter(([o])=>!n.has(o))),Object.keys(s[r]).length||delete s[r]);return s}function ro(i){let{clothes:e,hair:t}=so(i),n=(s,r)=>{let o=i.fromPacks?.[s];return o?`${r} "${o.label}" isn't shown because its pack, ${o.name}, isn't installed. Install it again to bring it back.`:`${r} "${s}" isn't shown: none of the installed wardrobe packs has it.`};return[...e.map(s=>n(s,"The piece")),...t?[`${n(t,"The hair style")} Another style shows until then.`]:[]]}var Lh={cloak:{label:"Hood",says:"The cloak's hood down on the shoulders, or up over the head (which hides the hair).",ways:[["","Down"],["hood_up","Up"]]}},or=[["cloth","Cloth"],["nail","Nail"],["trim","Trim"],["lining","Lining"],["bodice","Bodice"],["shirt","Shirt"],["suit","Suit"],["under","Underlayer"],["felt","Felt"],["laces","Laces"],["cord","Cord"],["leather","Leather"],["belt","Belt"],["pouch","Pouches"],["fur","Fur"],["sole","Soles"],["shoe","Shoe"],["sock","Sock"],["mail","Mail"],["scale","Scales"],["plate","Plate"],["metal","Metal fittings"],["gem","Gem"],["frame","Frame"]],ar=[[15261900,"Undyed linen"],[16053488,"White"],[2763310,"Black"],[8026746,"Grey"],[6965810,"Brown"],[10123858,"Tan"],[9054762,"Red"],[6957642,"Wine"],[11565610,"Ochre"],[5925418,"Olive"],[3103290,"Green"],[3099258,"Blue"],[2042442,"Navy"],[5913210,"Purple"],[12618394,"Rose"],[12105920,"Steel"],[13148240,"Brass"],[14202976,"Gold"]],Nh={"clothes-a":14734520,"clothes-b":8223306,"clothes-blue":4876954,"clothes-red":11561578,"clothes-teal":5212792,"clothes-plum":7688303,"clothes-grey":9079434,"ranger-a":4151861,"ranger-b":11573872,"ranger-wine":6961754,"ranger-dusk":4543866,"ranger-rust":10115637,"ranger-moss":6978111,"ranger-grey":7303023};var qv=40;var Dh=[{name:"Everyday man",look:{body:"male"}},{name:"Broad smith",look:{body:"male",shape:{weight:.35,muscle:.8,shoulders:.7,neck:.5,jaw:.5},limbs:{arms:1.04},height:1.04}},{name:"Lean ranger",look:{body:"male",shape:{weight:-.45,muscle:.35,cheeks:.4},limbs:{legs:1.05},height:1.05}},{name:"Stout elder",look:{body:"male",shape:{weight:.7,belly:.8,muscle:-.2},age:"old",hairColour:7,hair:"short",height:.95}},{name:"Male elf",look:{body:"male",race:"elf",shape:{weight:-.35,jaw:-.2,cheeks:.6,ears:1},hair:"long",hairColour:4,height:1.06}},{name:"Everyday woman",look:{body:"female"}},{name:"Strong woman",look:{body:"female",shape:{muscle:.8,shoulders:.5,weight:.15},height:1.04}},{name:"Slender woman",look:{body:"female",shape:{weight:-.5,waist:-.4,hips:.2},limbs:{legs:1.05}}},{name:"Curvy woman",look:{body:"female",shape:{weight:.3,chest:.6,hips:.7,waist:-.3}}},{name:"Female elf",look:{body:"female",race:"elf",shape:{weight:-.4,cheeks:.6,eyes:.3,ears:1},hair:"long",hairColour:4,height:1.04}},...["dwarf","halfling","gnome","halfelf","halforc","tiefling"].map(i=>({name:Rn.find(([e])=>e===i)[1],look:{race:i}})),...[["Grey wolf",0,14260779],["White wolf",3,9091288],["Black wolf",4,14726714]].map(([i,e,t])=>({name:i,look:{species:"wolf",colours:{fur:es[e][0],fur2:es[e][2],eyes:t}}})),...[["Red dragon",7,14726714],["Gold dragon",5,14711326],["Blue dragon",1,14207050],["Silver dragon",8,9091288]].map(([i,e,t])=>({name:i,look:{species:"dragon",colours:{scales:ts[e][0],scales2:ts[e][2],eyes:t}}}))].map(i=>({...i,look:is(i.look)})),oo=[{name:"Peasant",male:["tunic","trousers","shoes"],female:["blouse","skirt","shoes"],clothColours:{tunic:{cloth:10123858},skirt:{cloth:6965810},trousers:{cloth:6965810}}},{name:"Townsperson",male:["shirt","vest","trousers","shoes"],female:["dress","shoes"],clothColours:{vest:{cloth:3099258},dress:{cloth:3103290}}},{name:"Ranger",both:["shirt","leather_armour","trousers","tall_boots","gloves","cloak"],clothColours:{cloak:{cloth:3103290},trousers:{cloth:5925418}},variants:{cloak:"hood_up"}},{name:"Mage",both:["robe","shoes","circlet"],clothColours:{robe:{cloth:2042442,trim:13148240}}},{name:"Knight",both:["gambeson","chainmail","plate_cuirass","pauldrons","gauntlets","trousers","tassets","greaves","sabatons","full_helm"]},{name:"Barbarian",male:["loincloth","barbarian_harness","bracers","sandals"],female:["bikini_armour","loincloth","bracers","sandals"]},{name:"Beach",male:["swim_trunks","sandals"],female:["bikini_top","bikini_bottom","sandals"],clothColours:{swim_trunks:{cloth:3099258},bikini_top:{cloth:9054762},bikini_bottom:{cloth:9054762}}},{name:"Modern casual",male:["mh_tee","mh_jeans","mh_trainers_white"],female:["mh_female_tee","mh_female_jeans","mh_trainers_white"]}];function Tl(i,e){let t=i[e]??i.both??[],n=(s={})=>Object.fromEntries(Object.entries(s).filter(([r])=>t.includes(r)));return is({clothes:t,clothColours:n(i.clothColours),variants:n(i.variants)})}var $v=new Map([["long",.03],["ponytail",.03],["bob",.03],["bob_angled",.03],["braid",.12]]),ep=i=>$v.get(i)??(Object.hasOwn(ln,i)?ln[i].swing:null)??void 0,Qt=["back","back_left","left","front_left","front","front_right","right","back_right"],tp=Math.PI*2/Qt.length,Jf=.04,jv=.06,Zv=.08,Kv=5,Jv=["Head","neck_01","spine_03","spine_02"];function Qv(){let i=[];return{get size(){return i.length},push(e){i.push(e);for(let t=i.length-1;t>0;){let n=t-1>>1;if(i[n][0]<=i[t][0])break;[i[n],i[t]]=[i[t],i[n]],t=n}},pop(){let e=i[0],t=i.pop();if(i.length){i[0]=t;for(let n=0;;){let[s,r]=[n*2+1,n*2+2],o=n;if(s<i.length&&i[s][0]<i[o][0]&&(o=s),r<i.length&&i[r][0]<i[o][0]&&(o=r),o===n)break;[i[o],i[n]]=[i[n],i[o]],n=o}}return e}}}function eb(i,e,t,n){let s=i.length/3,r=new Int32Array(s),o=new Map,a=[];for(let m=0;m<s;m++){let[p,x,M]=[i[m*3],i[m*3+1],i[m*3+2]],v=`${Math.round(p*2e3)},${Math.round(x*2e3)},${Math.round(M*2e3)}`;o.has(v)||(o.set(v,a.length),a.push(new N(p,x,M))),r[m]=o.get(v)}let l=a.length,c=Array.from({length:l},()=>new Set);for(let m=0;m<e.length;m+=3)for(let[p,x]of[[0,1],[1,2],[2,0]]){let[M,v]=[r[e[m+p]],r[e[m+x]]];M!==v&&(c[M].add(v),c[v].add(M))}let u=new Float32Array(l).fill(1/0),d=new Float32Array(l),h=Qv();for(let m=0;m<l;m++)a[m].y>=t&&(u[m]=0,d[m]=Math.atan2(a[m].x-n.x,n.z-a[m].z),h.push([0,m]));if(!h.size)return null;let f=()=>{for(;h.size;){let[m,p]=h.pop();if(!(m>u[p]))for(let x of c[p]){let M=m+a[p].distanceTo(a[x]);M<u[x]&&(u[x]=M,d[x]=d[p],h.push([M,x]))}}};f();let g=[],y=[];for(let m=0;m<l;m++)(u[m]<1/0?g:y).push(m);for(let m of y){let p=-1,x=1/0;for(let M of g){let v=a[m].distanceToSquared(a[M]);v<x&&([x,p]=[v,M])}u[m]=u[p]+Math.sqrt(x),d[m]=d[p],h.push([u[m],m])}return f(),{far:Float32Array.from(r,m=>u[m]),side:Float32Array.from(r,m=>d[m])}}var tb=i=>(Math.round(i/tp)%Qt.length+Qt.length)%Qt.length;function np(i,e,t,n){let s=i.attributes.position.array,r=eb(s,i.index.array,t,n);if(!r)return null;let{far:o,side:a}=r,l=s.length/3,c=Qt.map(()=>[]),u=0;for(let E=0;E<l;E++)o[E]>0&&(u++,c[tb(a[E])].push(E));let d=i.attributes.skinIndex.array,h=i.attributes.skinWeight.array,f=new Map;for(let E=0;E<l;E++)if(o[E]>Jf)for(let _=0;_<4;_++){let w=e[d[E*4+_]];Jv.includes(w)&&f.set(w,(f.get(w)??0)+h[E*4+_])}let g=[...f].sort((E,_)=>_[1]-E[1])[0]?.[0]??"Head",y=[],m=new Array(Qt.length).fill(null);if(Qt.forEach((E,_)=>{let w=c[_];if(w.length<Math.max(24,u*.03))return;let C=w.map(D=>o[D]).sort((D,Y)=>D-Y),I=C[Math.floor(C.length*.95)];if(I<jv)return;let L=Math.max(1,Math.min(Kv,Math.round(I/Zv))),B=I/L,P=Array.from({length:L+1},(D,Y)=>Int32Array.from(w.filter(G=>Math.abs(o[G]-Y*B)<=(Y?B/2:B/4))));P.filter(D=>D.length).length<2||(m[_]=y.length,y.push({name:`hair_${E}`,side:E,from:g,bones:L,step:B,bands:P}))}),!y.length)return null;let p=[],x=e.length;for(let E of y)p.push(x),x+=E.bones+1;let M=E=>{for(let _=0;_<=Qt.length/2;_++)for(let w of[E+_,E-_]){let C=m[(w%Qt.length+Qt.length)%Qt.length];if(C!==null)return C}return 0},v=new Uint16Array(d.length),S=new Float32Array(h.length),A=new Map;for(let E=0;E<l;E++){A.clear();let _=Math.min(1,o[E]/Jf),w=_*_*(3-2*_);for(let L=0;L<4;L++)h[E*4+L]&&A.set(d[E*4+L],(A.get(d[E*4+L])??0)+h[E*4+L]*(1-w));if(w>0){let L=a[E]/tp,B=Math.floor(L),P=L-B,D=Y=>(Y%Qt.length+Qt.length)%Qt.length;for(let[Y,G]of[[D(B),1-P],[D(B+1),P]]){if(!G)continue;let ne=m[Y]??M(Y),q=y[ne],$=Math.max(0,Math.min(q.bones-1,o[E]/q.step-.5)),Q=Math.floor($),be=Q>=q.bones-1?0:$-Q;for(let[Ae,Qe]of[[Q,1-be],[Q+1,be]])Qe&&A.set(p[ne]+Ae,(A.get(p[ne]+Ae)??0)+w*G*Qe)}}let C=[...A].sort((L,B)=>B[1]-L[1]).slice(0,4),I=C.reduce((L,[,B])=>L+B,0)||1;C.forEach(([L,B],P)=>{v[E*4+P]=L,S[E*4+P]=B/I})}return{chains:y,skinIndex:new rn(v,4),skinWeight:new Be(S,4),was:{skinIndex:d,skinWeight:h}}}var El=new Ne,ao=new N;function Qf(i,e,t,n,s=!1){let r=new Float32Array(i.length);for(let o=0;o<i.length/3;o++){El.elements.fill(0);for(let a=0;a<4;a++){let l=n[o*4+a];if(!l)continue;let c=e[t[o*4+a]].elements;for(let u=0;u<16;u++)El.elements[u]+=l*c[u]}s&&El.invert(),ao.fromArray(i,o*3).applyMatrix4(El),r.set([ao.x,ao.y,ao.z],o*3)}return r}function ip(i,e,t,n,s=null,r=""){let o=e.joints.some(h=>s?.has(h)),a=e.joints.map((h,f)=>{let g=n.get(h);if(!g)return new Ne;let y=e.inverseBind?new Ne().fromArray(e.inverseBind,f*16):g.matrixWorld.clone().invert(),m=s?.get(h);return m&&y.premultiply(m),g.matrixWorld.clone().multiply(y)}),l=o?Qf(t,a,i.was.skinIndex,i.was.skinWeight):t,c=[],u=[],d=[];for(let h of i.chains){let f=n.get(h.from)??n.get("Head");f.updateMatrixWorld(!0);let g=h.bands.map(M=>{if(!M.length)return null;let v=new N;for(let S of M)v.add(ao.fromArray(l,S*3));return v.divideScalar(M.length)}),y=g.flatMap((M,v)=>M?[v]:[]);g.forEach((M,v)=>{if(M)return;let S=y.filter(w=>w<v).at(-1),A=y.find(w=>w>v),[E,_]=S===void 0?[A,y[1]]:A===void 0?[y.at(-2),S]:[S,A];g[v]=g[E].clone().lerp(g[_],(v-E)/(_-E))});let m=g.map((M,v)=>v&&v<g.length-1?M.clone().multiplyScalar(.5).addScaledVector(g[v-1].clone().add(g[v+1]),.25):M),p=f,x=m.map((M,v)=>{let S=new mi;return S.name=`${r}${h.name}_${v}`,p.add(S),S.position.copy(p.worldToLocal(M.clone())),S.updateMatrixWorld(!0),n.set(S.name,S),u.push(S.matrixWorld.clone().invert()),p=S,S});c.push(...x),d.push({name:`Hair (${h.side.replace("_"," ")})`,bones:x})}if(o){let h=[...a,...c.map(()=>new Ne)];t.set(Qf(l,h,i.skinIndex.array,i.skinWeight.array,!0))}return{bones:c,inverses:u,springs:d,moved:o}}var Gn=64,lo=16777215,nb=2048,ib=()=>typeof globalThis.document?.createElement("canvas")?.getContext=="function",Cl=new Map;function rp(i){if(!Cl.has(i)){let e=new Promise((t,n)=>{let s=new Image;s.decoding="async",s.onload=()=>t(s),s.onerror=()=>n(new Error(`the picture ${i} couldn't be loaded`)),s.src=dl(i.endsWith(".png")?i:`${i}.webp`)});e.catch(()=>Cl.delete(i)),Cl.set(i,e)}return Cl.get(i)}var Uh=new Map;function sb(i,e){let t=`${i}:${e}`;if(!Uh.has(t)){let n=rp(`avatar-${i}-masks.png`).then(s=>{let r=document.createElement("canvas");r.width=r.height=e;let o=r.getContext("2d",{willReadFrequently:!0});o.drawImage(s,0,0,e,e);let{data:a}=o.getImageData(0,0,e,e),l=new Uint8Array(e*e),c=Math.ceil(e/Gn),u=new Set;for(let d=0;d<l.length;d++)l[d]=a[d*4+1],l[d]&&u.add(Math.floor(Math.floor(d/e)/Gn)*c+Math.floor(d%e/Gn));return{lips:l,tiles:[...u].map(d=>({x:d%c*Gn,y:Math.floor(d/c)*Gn}))}}).catch(()=>null);Uh.set(t,n)}return Uh.get(t)}var ti=new Map,rb=3,sp=i=>[i>>16&255,i>>8&255,i&255];async function op({sex:i,base:e,skin:t=lo,lips:n=lo}){if(!ib()||t===lo&&n===lo)return null;let s=[i,e,t,n].join("|");if(ti.has(s)){let h=ti.get(s);return ti.delete(s),ti.set(s,h),h}let r=await rp(e),o=Math.max(nb,r.naturalWidth||r.width),a=await sb(i,o),l=document.createElement("canvas");l.width=l.height=o;let c=l.getContext("2d",{willReadFrequently:!0});c.drawImage(r,0,0,o,o);let u=a?a.tiles.map(({x:h,y:f})=>c.getImageData(h,f,Gn,Gn)):[];if(t!==lo&&(c.globalCompositeOperation="multiply",c.fillStyle=`#${t.toString(16).padStart(6,"0")}`,c.fillRect(0,0,o,o),c.globalCompositeOperation="source-over"),a){let[h,f,g]=sp(t),[y,m,p]=sp(n);a.tiles.forEach(({x,y:M},v)=>{let S=u[v],A=S.data;for(let E=0;E<Gn;E++)for(let _=0;_<Gn;_++){let w=a.lips[(M+E)*o+x+_]/255,C=(E*Gn+_)*4;A[C]=A[C]*(h+(y-h)*w)/255,A[C+1]=A[C+1]*(f+(m-f)*w)/255,A[C+2]=A[C+2]*(g+(p-g)*w)/255}c.putImageData(S,x,M)})}let d=new Ar(l);for(d.flipY=!1,d.colorSpace=St,d.name=`${e}-painted`,d.userData.shared=!0,ti.set(s,d);ti.size>rb;){let[h]=ti.keys();ti.get(h).dispose(),ti.delete(h)}return d}var dp={hitRadius:.02,stiffness:1.5,gravityPower:.1,gravityDir:[0,-1,0],dragForce:.4},fp={hitRadius:.02,stiffness:.5,gravityPower:.02,gravityDir:[0,-1,0],dragForce:.3},pp=["tail_01","tail_02","tail_03","tail_04","tail_05"],ob=.07,ab=.005;function mp(i,e,t){let{joints:n}=i.file,s=i.shared.skinIndex.array,r=i.shared.skinWeight.array,o=new Map;for(let m of i.meshes)if(!(m.part!=="skin"||m.piece))for(let p=m.start;p<m.start+m.count;p++){let x=0;for(let v=1;v<4;v++)r[p*4+v]>r[p*4+x]&&(x=v);let M=n[s[p*4+x]];o.has(M)||o.set(M,[]),o.get(M).push(new N().fromArray(e,p*3))}let a=m=>t.get(m)?.getWorldPosition(new N),l=(m,p)=>m.worldToLocal(p.clone()),c=(m,p,x,M=.2)=>{let v=x.clone().sub(p),S=v.lengthSq()||1,A=m.map(E=>{let _=Math.max(0,Math.min(1,E.clone().sub(p).dot(v)/S));return E.distanceTo(p.clone().addScaledVector(v,_))}).sort((E,_)=>E-_);return A[Math.floor(A.length*M)]??0},u=[],d=(m,p,x=.85)=>{let[M,v,S,A]=[t.get(m),a(m),a(p),o.get(m)];!M||!v||!S||!A?.length||u.push({bone:M,radius:c(A,v,S)*x,offset:l(M,v),tail:l(M,S)})},h=t.get("Head"),f=a("eye_l")?.y??a("Head")?.y+.05,g=(o.get("Head")??[]).filter(m=>Math.abs(m.y-f)<.03);if(h&&g.length){let[m,p]=[new N(1/0,0,1/0),new N(-1/0,0,-1/0)];for(let M of g)m.min(M),p.max(M);let x=new N(0,f,(m.z+p.z)/2);u.push({bone:h,radius:Math.min(p.x-m.x,p.z-m.z)*.46,offset:l(h,x)})}d("neck_01","Head");for(let m of["l","r"])d(`clavicle_${m}`,`upperarm_${m}`,.8),d(`upperarm_${m}`,`lowerarm_${m}`);for(let m of["pelvis","spine_01","spine_02","spine_03"]){let[p,x]=[t.get(m),o.get(m)];if(!p||!x?.length)continue;let M=x.map(I=>I.y).sort((I,L)=>I-L),v=M[Math.floor(M.length/2)],S=x.filter(I=>Math.abs(I.y-v)<.04),[A,E]=[new N(1/0,0,1/0),new N(-1/0,0,-1/0)];for(let I of S)A.min(I),E.max(I);let _=(E.z-A.z)/2*.9,w=Math.max(0,(E.x-A.x)/2-_),C=new N((A.x+E.x)/2,v,(A.z+E.z)/2);u.push({bone:p,radius:_,offset:l(p,C.clone().setX(C.x-w)),tail:l(p,C.clone().setX(C.x+w))})}let y=["l","r"].flatMap(m=>{let[p,x]=[t.get(`thigh_${m}`),t.get(`calf_${m}`)];return p&&x?[{bone:p,radius:ob,offset:new N,tail:x.position.clone()}]:[]});return{body:u,legs:y}}var ho=new N,gp=new N,ap=new N,lp=new N,co=new N,Rl=new N,lb=new N;function _p(i,e,t){if(co.copy(i.offset).applyMatrix4(i.bone.matrixWorld),!i.tail)return t.copy(co);Rl.copy(i.tail).applyMatrix4(i.bone.matrixWorld).sub(co);let n=Rl.lengthSq(),s=n?Math.max(0,Math.min(1,lb.copy(e).sub(co).dot(Rl)/n)):0;return t.copy(co).addScaledVector(Rl,s)}function xp(i){let e=[Vn,tr],t=new Map;for(let n of e){n(i);for(let s of i.springs)for(let r of s.colliders){let o=1/0;for(let l of s.bones.slice(1))l.getWorldPosition(ho),o=Math.min(o,ho.distanceTo(_p(r,ho,gp))-s.joint.hitRadius-ab);t.has(r)||t.set(r,new Map);let a=t.get(r).get(s)??1/0;t.get(r).set(s,Math.min(a,o))}}Vn(i);for(let[n,s]of t){let r=Math.min(...s.values());n.radius=Math.max(n.radius*.75,Math.min(n.radius,r));for(let[o,a]of s)a<n.radius&&(o.colliders=o.colliders.filter(l=>l!==n))}}var Il=new Ne,cp=new Ne,hp=new dt,up=new N;function yp(i){let e=[];for(let r of i.springs??[]){let{colliders:o}=r;r.bones.slice(0,-1).forEach((a,l)=>{a.quaternion.copy(i.rest.get(a.name)??a.quaternion),a.updateMatrix();let c=r.bones[l+1].position.clone();e.push({bone:a,settings:r.joint,colliders:o,local:a.matrix.clone(),rest:a.quaternion.clone(),child:c,axis:c.clone().normalize(),length:0,tip:new N,last:new N})})}let t=new N;function n(){i.root.updateMatrixWorld(!0);for(let r of e){let{bone:o}=r;o.quaternion.copy(r.rest),o.updateMatrixWorld(!0),r.tip.copy(r.child).applyMatrix4(o.matrixWorld),r.last.copy(r.tip),r.length=r.tip.distanceTo(o.getWorldPosition(ho))}}function s(r){let o=Math.min(.05,Math.max(0,r));if(!(!o||!e.length)){i.root.updateMatrixWorld(!0);for(let a of e){let{bone:l,settings:c}=a,u=l.parent.matrixWorld;Il.multiplyMatrices(u,a.local);let d=ho.setFromMatrixPosition(Il),h=up.copy(a.child).applyMatrix4(Il).sub(d).normalize();t.fromArray(c.gravityDir).normalize();let f=gp.copy(a.tip).addScaledVector(ap.copy(a.tip).sub(a.last),1-c.dragForce).addScaledVector(h,c.stiffness*o).addScaledVector(t,c.gravityPower*o);f.sub(d).normalize().multiplyScalar(a.length).add(d);for(let g of a.colliders){_p(g,f,lp);let y=ap.copy(f).sub(lp),m=y.length()-g.radius-c.hitRadius;m<0&&(f.addScaledVector(y.normalize(),-m),f.sub(d).normalize().multiplyScalar(a.length).add(d))}a.last.copy(a.tip),a.tip.copy(f),cp.copy(Il).invert(),hp.setFromUnitVectors(a.axis,up.copy(f).applyMatrix4(cp).normalize()),l.quaternion.copy(a.rest).multiply(hp),l.updateMatrix(),l.matrixWorld.multiplyMatrices(u,l.matrix);for(let g of l.children)g.updateMatrixWorld(!0)}}}return n(),{step:s,reset:n,joints:e.length}}function os(i){let e=2166136261;for(let t=0;t<i.length;t++)e^=i.charCodeAt(t),e=Math.imul(e,16777619);return e>>>0}function lr(i){let e=i>>>0;return()=>{e=e+1831565813|0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}var Oh=i=>`#${(i>>>0).toString(16).padStart(6,"0").slice(-6)}`,vp=i=>/^#?[0-9a-f]{6}$/iu.test(i??"")?parseInt(i.replace("#",""),16):null;async function cr(i,e=2e4){try{let t=await fetch(i,{headers:{Accept:"application/json"},signal:AbortSignal.timeout(e)});return t.ok?await t.json():null}catch{return null}}var Ep={Head:"head",neck_01:"neck",spine_01:"torso",spine_02:"torso",spine_03:"torso",clavicle_l:"torso",clavicle_r:"torso",pelvis:"hips",upperarm_l:"upperarms",upperarm_r:"upperarms",lowerarm_l:"forearms",lowerarm_r:"forearms",hand_l:"hands",hand_r:"hands",...Object.fromEntries(["l","r"].flatMap(i=>["thumb","index","middle","ring","pinky"].flatMap(e=>[1,2,3].map(t=>[`${e}_0${t}_${i}`,"hands"])))),thigh_l:"thighs",thigh_r:"thighs",calf_l:"calves",calf_r:"calves",foot_l:"feet",foot_r:"feet",ball_l:"feet",ball_r:"feet"},bp=!0;var Cp=[...new Set(Object.values(Ep)),"underwear","underwear-top","underwear-bottom","hair"],cb=new Set(["skin","nails","underwear","underwear_trim","fur","fur2","fur_tufts","fur2_tufts","nose","claws","scales","scales2","horns"]),hb=new Set(["neck","back","armour","plate"]),ub=(i,e)=>i==="human"?`avatar-${e}`:`anthro-${i}-${e}`,db={arms:[["upperarm_l","lowerarm_l"],["lowerarm_l","hand_l"],["upperarm_r","lowerarm_r"],["lowerarm_r","hand_r"]],legs:[["thigh_l","calf_l"],["calf_l","foot_l"],["thigh_r","calf_r"],["calf_r","foot_r"]]},as=16777215,Sp={male:[1,2,4,9,10,12],female:[3,5,6,7,8,11]},Mp={male:[1,3],female:[2,4]},fb=i=>i<.65?"young":i<.9?"middle":"old",pb=[0,3,4,5,6,7,8,9,10,11,12].map(i=>ar[i][0]),mb=[6,7,10,12,13,2].map(i=>ar[i][0]),gb=[0,3,4,5].map(i=>ar[i][0]),Fh=[{job:"townsperson",share:40,male:[["shirt","vest","trousers","shoes"],["shirt","tunic","trousers","boots"]],female:[["dress","shoes"],["blouse","skirt","shoes"],["blouse","corset","skirt","shoes"]]},{job:"farmer",share:22,male:[["tunic","trousers","boots"]],female:[["tunic","skirt","boots"],["blouse","skirt","boots"]]},{job:"smith",share:8,male:[["shirt","trousers","boots","apron"]],female:[["shirt","trousers","boots","apron"]]},{job:"guard",share:14,male:[["gambeson","trousers","boots"],["shirt","brigandine","trousers","boots"]],female:[["gambeson","trousers","boots"],["shirt","brigandine","trousers","boots"]]},{job:"noble",share:8,dyes:mb,male:[["shirt","long_coat","trousers","tall_boots"]],female:[["gown","shoes"],["blouse","long_coat","skirt","tall_boots"]]},{job:"priest",share:8,dyes:gb,male:[["robe","sandals"]],female:[["robe","sandals"]]}];function _b(i,e){let t=lr(os(`${i||"wanderer"}:clothes`)),n=t()*Fh.reduce((c,u)=>c+u.share,0),s=Fh.find(c=>(n-=c.share)<0)??Fh[0],r=s[e]??s.male,o=r[Math.floor(t()*r.length)],a=s.dyes??pb,l={};for(let c of o){let u=a[Math.floor(t()*a.length)];["apron","boots","shoes","tall_boots","sandals"].includes(c)||(l[c]=c==="gown"?{bodice:u,cloth:u}:{cloth:u})}return{job:s.job,clothes:o,clothColours:l}}var hr=(i,e,t)=>Math.max(e,Math.min(t,i)),Li=(i,e,t)=>{let n=s=>Math.round((i>>s&255)*(1-t)+(e>>s&255)*t);return n(16)<<16|n(8)<<8|n(0)};function xb(i,e="auto",t={}){let{sex:n,gender:s}=Af(i,e,t),r=xh.some(([te])=>te===t.species)?t.species:"human",o=r!=="human",a=!o&&Rn.some(([te])=>te===t.race)?t.race:"human",l=lr(os(`${i||"wanderer"}:avatar-race`)),c=te=>te[Math.floor(l()*te.length)],u={facialHair:a==="dwarf"&&n==="male"?c(["beard-02","beard-03","beard-04","beard-04"]):xt,tusks:a==="halforc"?n==="male"?c(["tusks-01","tusks-02"]):"tusks-01":xt,horns:a==="tiefling"?c(yh.slice(1))[0]:xt},{key:d,weight:h,...f}=yl(a),g=!!d&&t.shape?.[d]===void 0,y=te=>g?f[te]:1,m={halforc:bh,tiefling:vh}[a],p=m?c(m)[0]:void 0,x=lr(os(`${i||"wanderer"}:avatar`)),M=te=>(x()+x()-1)*te,v={weight:.5,muscle:.35,chest:.35,hips:.3,waist:.3,belly:.25,shoulders:.3,neck:.25},S={};for(let[te,,le,ke]of[...ss,...Ri]){let Ie=te==="ears"?{elf:1,halfelf:.5}[a]??0:hr(M(v[te]??.35),le,ke);S[te]=t.shape?.[te]??Math.round(Ie*100)/100}let A={};for(let[te]of[...In,...Ii])S[te]=t.shape?.[te]??0;for(let[te]of Ci)S[te]=t.shape?.[te]??(g&&te===d?h:0);for(let[te,,le,ke]of rr){let Ie=t.limbs?.[te]??Math.round(hr(1+M(te==="head"?.02:.03),le,ke)*1e3)/1e3;A[te]=hr(Ie*y(te),le,ke)}let E=.94+x()*.12,_=Math.floor(x()*ei.length),w=Qr[Math.floor(x()*7)][0],C=_h[n][Math.floor(x()*_h[n].length)],I=Math.floor(x()*Df),L=eo[Math.floor(x()*4)][0],B=t.colours?.skin??t.skinTint??(Number.isInteger(t.skin)?ei[t.skin][0]:void 0),P=B??p??ei[_][0],D=Sl(n).some(([te])=>te===t.skin)?t.skin:Zr.some(([te])=>te===t.skin)?"caucasian":(B??p)!==void 0?"custom":["caucasian","asian","african"][Math.floor(_*3/ei.length)],Y=D!=="custom",G=lr(os(`${i||"wanderer"}:avatar-age`)),ne=fb(G()),q=Sp[n][Math.floor(G()*Sp[n].length)],$=Mp[n][Math.floor(G()*Mp[n].length)],Q=lr(os(`${i||"wanderer"}:avatar-anthro`));for(let[te,,le,ke]of jr){let Ie=hr((Q()+Q()-1)*.35,le,ke);S[te]=t.shape?.[te]??Math.round(Ie*100)/100}let be=t.colours??{},Ae=(te,le,ke)=>te.find(([Ie])=>Ie===le)?.[2]??Li(le,ke,.6),Qe=es[Math.floor(Q()*es.length)][0],We=ts[Math.floor(Q()*ts.length)][0],Ke=gl[Math.floor(Q()*5)][0],[j,ee]=[be.fur??Qe,be.scales??We],ve=t.hairTint??ns[t.hairColour??I][0],Ue=_b(i,n),_e=(t.clothes??Ue.clothes).filter(te=>!o||!Sh.has(Ut[te])),Oe={};for(let te of _e){let le={...t.clothes?{}:Ue.clothColours[te],...t.clothColours?.[te]};Object.keys(le).length&&(Oe[te]=le)}let ie={skin:P,eyes:be.eyes??(o?Ke:{halforc:11569706,tiefling:15253568}[a]??w),...o?{}:{horns:be.horns??rs[3][0]},...r==="wolf"?{fur:j,fur2:be.fur2??Ae(es,j,15788248),nose:be.nose??Rh[0][0],claws:be.claws??Ih[0][0]}:{},...r==="dragon"?{scales:ee,scales2:be.scales2??Ae(ts,ee,15787720),horns:be.horns??rs[0][0]}:{},lips:t.colours?.lips??(Y?as:P===p?Li(P,0,.3):Li(Li(P,10502208,.35),0,.12)),nails:t.colours?.nails??(Y?as:Li(P,16180960,.4)),brows:t.colours?.brows??Li(ve,0,.25),underwear:t.colours?.underwear??t.tints?.top??Nh[t.colour]??Nh[t.rangerColour]??L};return{body:n,species:r,wings:t.wings!==!1,race:a,...Object.fromEntries(ir.map(([te])=>[te,o?xt:t[te]??u[te]])),tail:!o&&(t.tail??a==="tiefling"),gender:s,shape:S,limbs:A,height:hr((t.height??E)*y("height"),Ei[0],Ei[1]),colours:ie,hair:o?xt:Jt.some(([te])=>te===t.hair)?t.hair:C,hairColour:ve,underwear:{top:t.underwear?.top??(bp&&n==="female"?"bra":xt),bottom:t.underwear?.bottom??(bp?"briefs":xt)},clothes:_e,clothColours:Oe,variants:o?{}:t.variants??{},job:t.clothes?null:Ue.job,age:t.age??ne,skin:o?"custom":D,brows:t.brows??q,lashes:t.lashes??$,eyePicture:o?Hn:t.eyePicture??Hn,nails:o?"none":t.nails??"short",toenails:!o&&t.toenails!==!1,seed:os(`${i}:motion`)}}function yb(i,e,t,n=!1){let s={age_middle:i.age==="middle"?1:0,age_old:i.age==="old"?1:0,ruff_flat:n?1:0,collar_fit:n?1:0};for(let r of[...ss,...Ri,...In,...Ii,...Ci,...jr]){let[o]=r,[a,l]=Th(o,e),[c,u]=bl(r,t),d=hr(i.shape[o],c,u)*(o==="waist"?-1:1);a&&t.includes(a)?(s[a]=Math.max(0,-d),s[l]=Math.max(0,d)):s[l]=d}for(let r of Object.keys(s))t.includes(r)||delete s[r];return s}function Rp(i,e=0){let t={};for(let[n,s]of Object.entries(i.morphs??{})){let r=Uint32Array.from(En(i.count>65535?Uint32Array:Uint16Array,s.ids),c=>c+e),o=s.q??32767,a=Float32Array.from(En(Int16Array,s.delta),(c,u)=>c/o*s.d[u%3]),l=Float32Array.from(En(Int8Array,s.normal),(c,u)=>c/127*s.n[u%3]);t[n]={ids:r,delta:a,normal:l}}return t}function vb(i,e,t){let n=e.length/3||1,s=[0,0,0];for(let r=0;r<e.length;r++)s[r%3]+=(i.position[r]-e[r])/n;for(let r=0;r<e.length;r++)i.position[r]=e[r]+s[r%3];i.normal.set(t)}function wp(i,e,t,n){let s=i.slice(),r=e.slice(),o=!1;for(let[a,l]of Object.entries(t)){let c=n[a]??0;if(c){for(let{ids:u,delta:d,normal:h}of l)for(let f=0;f<u.length;f++){let g=u[f]*3;for(let y=0;y<3;y++)s[g+y]+=d[f*3+y]*c,r[g+y]+=h[f*3+y]*c}o=!0}}if(o)for(let a=0;a<r.length;a+=3){let l=Math.hypot(r[a],r[a+1],r[a+2])||1;r[a]/=l,r[a+1]/=l,r[a+2]/=l}return{position:s,normal:r}}function bb(i){return i.faceMoves??=cl.filter(e=>i.morphs[e]).map(e=>{let t=new Float32Array(i.position.length);for(let{ids:s,delta:r}of i.morphs[e])for(let o=0;o<s.length;o++)for(let a=0;a<3;a++)t[s[o]*3+a]+=r[o*3+a];let n=new Be(t,3);return n.name=e,n}),i.faceMoves}var Pl=new Map;function Ip(i,e="human"){let t=ub(e,i);if(!Pl.has(t)){let n=qr(`${t}.pack.png`).then(s=>{let r=s.meshes.map((E,_)=>({mesh:E,i:_})).sort((E,_)=>!!E.mesh.alpha-!!_.mesh.alpha||String(E.mesh.alpha).localeCompare(String(_.mesh.alpha))||String(E.mesh.texture).localeCompare(String(_.mesh.texture))||E.i-_.i),o=r.reduce((E,{mesh:_})=>E+_.count,0),a=E=>new N().setFromMatrixPosition(new Ne().fromArray(s.inverseBind,s.joints.indexOf(E)*16).invert()),l=a("neck_01").y+.03,c=new Float32Array(o*3),u=new Float32Array(o*3),d=new Float32Array(o*2),h=new Uint16Array(o*4),f=new Float32Array(o*4),g=new Array(o),y={},m=[],p=0;for(let{mesh:E}of r){let _=uh(E),{attributes:w}=_;c.set(w.position.array,p*3),u.set(w.normal.array,p*3),w.uv&&d.set(w.uv.array,p*2),h.set(w.skinIndex.array,p*4),f.set(w.skinWeight.array,p*4);for(let P=0;P<E.count;P++){let D=0;for(let G=1;G<4;G++)w.skinWeight.array[P*4+G]>w.skinWeight.array[P*4+D]&&(D=G);let Y=Ep[s.joints[w.skinIndex.array[P*4+D]]]??"";g[p+P]=Y==="torso"&&w.position.array[P*3+1]>l?"neck":Y}let{full:C,far:I}=_.userData.distant??{full:{count:_.index.count}},L=P=>Uint32Array.from(_.index.array.subarray(P.start??0,(P.start??0)+P.count),D=>D+p),B=L(C);for(let[P,D]of Object.entries(Rp(E,p)))(y[P]??=[]).push(D);m.push({...E,start:p,index:B,far:I?L(I):B,group:`${E.alpha||"solid"}:${E.texture}`}),_.dispose(),p+=E.count}let x=new Set,M=new Set,v={brows:[],lashes:[]};for(let E of m){let _=/^underwear-(top|bottom)-(.+)$/u.exec(E.piece??"");_&&(_[1]==="top"?x:M).add(_[2]);let w=/^eye(brows|lashes)-(\d+)$/u.exec(E.piece??"");w&&v[w[1]].push(Number(w[2])),E.piece==="underwear-legacy"&&(M.add("briefs"),i==="female"&&x.add("bra"))}let S=(E,_)=>E.filter(([w])=>_.has(w)).map(([w])=>w),A=new Rt;return A.setAttribute("position",new Be(c,3)),A.computeBoundingBox(),A.computeBoundingSphere(),{file:s,sex:i,position:c,normal:u,regions:g,morphs:y,meshes:m,boundingBox:A.boundingBox,boundingSphere:A.boundingSphere,shared:{uv:new Be(d,2),skinIndex:new Be(h,4),skinWeight:new Be(f,4)},indices:new Map,tops:S(to,x),bottoms:S(no,M),brows:v.brows.sort((E,_)=>E-_),lashes:v.lashes.sort((E,_)=>E-_),eyeUvs:new Map,tucked:{head:a("Head").add(new N(0,.08,0)).toArray(),hips:a("pelvis").toArray()},eyes:s.joints.includes("eye_l")?a("eye_l").y:a("Head").y+.05,headAt:a("Head")}});n.catch(()=>Pl.delete(t)),Pl.set(t,n)}return Pl.get(t)}function Ll(i,e,t){if(!i.piece)return!0;if(i.piece==="wings")return e.wings;if(i.piece==="tail-tiefling")return e.tail;let n=/^(beard|moustache|tusks|horns)-\d+$/u.exec(i.piece);if(n)return i.piece===e[{tusks:"tusks",horns:"horns"}[n[1]]??"facialHair"];let s=/^eye(brows|lashes)-(\d+)$/u.exec(i.piece);if(s)return Number(s[2])===e[s[1]];let{underwear:r}=e;if(i.piece==="underwear-legacy")return r.bottom==="briefs"||t==="female"&&r.top==="bra";let o=/^underwear-(top|bottom)-(.+)$/u.exec(i.piece);return!!o&&r[o[1]]===o[2]}function Sb(i,e,t){let{underwear:n}=e,s=`${n.top}|${n.bottom}|${e.brows}|${e.lashes}|${e.wings}|${e.facialHair}|${e.tusks}|${e.horns}|${e.tail}|${[...t].sort().join(",")}`;if(!i.indices.has(s)){let r=h=>/^underwear/u.test(h.part)&&(t.has("underwear")||h.piece&&t.has(h.piece.replace(/-[^-]+$/u,"")))?()=>!0:cb.has(h.part)?(f,g,y)=>t.has(i.regions[f])&&t.has(i.regions[g])&&t.has(i.regions[y]):()=>!1,o=[],a=[],l=[],c=(h,f,g)=>{for(let y=0;y<f.length;y+=3){let[m,p,x]=[f[y],f[y+1],f[y+2]];g(m,p,x)||h.push(m,p,x)}};for(let h of i.meshes){if(!Ll(h,e,i.sex))continue;let f=r(h);o.at(-1)?.name!==h.group&&o.push({name:h.group,start:a.length,count:0,farStart:l.length,farCount:0,mesh:h}),c(a,h.index,f),c(l,h.far??h.index,f),o.at(-1).count=a.length-o.at(-1).start,o.at(-1).farCount=l.length-o.at(-1).farStart}let u=i.position.length/3>65535?Uint32Array:Uint16Array,d=new u(a.length+l.length);d.set(a),d.set(l,a.length),i.indices.set(s,{index:new Be(d,1),groups:o.filter(h=>h.count).map(h=>({...h,farStart:a.length+h.farStart}))})}return i.indices.get(s)}function Mb(i,e){if(!i.eyeUvs.has(e)){let t=Kr.findIndex(([a])=>a===e),[n,s]=[t%Jr,Math.floor(t/Jr)],r=i.shared.uv.array.slice(),o=i.meshes.find(a=>a.part==="iris")?.texture;for(let a of i.meshes.filter(l=>l.texture===o&&!l.alpha))for(let l=a.start;l<a.start+a.count;l++)r[l*2]=(n+r[l*2])/Jr,r[l*2+1]=(s+r[l*2+1]*512/384)/Jr;i.eyeUvs.set(e,new Be(r,2))}return i.eyeUvs.get(e)}var Pp="avatar-hair-index.json",Lp="avatar-outfits-index.json",Nl=i=>qr(i).catch(()=>({}));async function wb(i,e){let t=Object.hasOwn(ln,i)?ln[i]:null,n=t??(await Nl(Pp))[i];if(!n?.bodies.includes(e))return null;let s=await(t?fl(t.url):qr(`${n.bundle}.pack.png`)).catch(()=>null),r=s?.styles?.[i]?.[e];if(!r)return null;let o=t?Np(s,t.pack):s.pictures;return{key:`hair:${i}:${e}`,part:r,pictures:o}}var Np=(i,e)=>[i.pictures??[]].flat().filter(t=>String(t?.name).startsWith(`${e}-`));async function Ab(i,e,t=""){let n=Object.hasOwn(Qn,i)?Qn[i]:null,s=n??(await Nl(Lp))[i];if(!s?.bodies.includes(e))return null;let r=await(n?fl(n.url):qr(`${s.bundle}.pack.png`)).catch(()=>null),o=r?.pieces?.[i],a=!n&&o?.variants?.[t]?.[e]?o.variants[t]:o;if(!a?.[e])return null;let l=a===o?"":t,c=n?n.slot:o.slot,u=Yf(c,n?n.bone:o.bone);return{key:`outfit:${i}:${e}:${l}${u?`@${u}`:""}`,piece:i,slot:c,layer:n?n.layer:o.layer??0,hides:n?n.hides:a.hides??[],bone:u,part:a[e],pictures:n?Np(r,n.pack):r.pictures}}var Tb=new Set(["brow","face","mouth","ears","fingers","neck","waist","arms","necklace","wrists","ankles","belly"]);function Eb(i,e,t){let n=i.inverseBind?i.joints.indexOf(e):-1,s=n>=0?n:t.joints.indexOf(e);if(s<0)return null;let r=n>=0?i.inverseBind:t.inverseBind;return{...i,joints:[e],inverseBind:Array.from(r.slice(s*16,s*16+16))}}var Bh=new Map;function Cb(i,e,t=!1,n=null,s=!1){return Bh.has(i)||Bh.set(i,e.meshes.map(r=>{let o=uh(r);o.userData.shared=!0;let a=n?np(o,e.joints,n.line,n.centre):null;if(a&&(o.setAttribute("skinIndex",a.skinIndex),o.setAttribute("skinWeight",a.skinWeight)),s){let l=o.attributes.position.count,c=new Float32Array(l*4);for(let u=0;u<l;u++)c[u*4]=1;o.setAttribute("skinIndex",new rn(new Uint16Array(l*4),4)),o.setAttribute("skinWeight",new Be(c,4))}if(t){let l=o.userData.distant?.full??{start:0,count:o.index.count};o.userData.distant={full:l,far:{start:l.start,count:0}}}return{mesh:r,geometry:o,morphs:Object.fromEntries(Object.entries(Rp(r)).map(([l,c])=>[l,[c]])),colours:new Map,plan:a}})),Bh.get(i)}async function Dp(i,e="human"){let t=e!=="human",n=await Ip(i,e),[s,r]=await Promise.all([Nl(Pp),Nl(Lp)]);return{keys:n.file.keys,wings:n.meshes.some(o=>o.piece==="wings"),...Object.fromEntries(ir.map(([o,a])=>[o,a.map(([l])=>l).filter(l=>n.meshes.some(c=>c.piece===l))])),tail:n.meshes.some(o=>o.piece==="tail-tiefling"),races:Rn.map(([o])=>o).filter(o=>!yl(o).key||n.file.keys.includes(yl(o).key)),tops:n.tops,bottoms:n.bottoms,brows:n.brows,lashes:n.lashes,hair:t?[]:Jt.map(([o])=>o).filter(o=>o===xt||s[o]?.bodies.includes(i)||Object.hasOwn(ln,o)&&ln[o].bodies.includes(i)),clothes:Object.entries({...r,...Qn}).filter(([o,a])=>a.bodies.includes(i)&&Ut[o]&&!qf.some(([l])=>l===Ut[o])).filter(([o])=>!t||!Sh.has(Ut[o])).map(([o,a])=>({piece:o,slot:a.slot,parts:a.parts[i]??[],variants:t?[]:a.variants??[]}))}}var uo=.04,pn=4,Rb=8,Up=(i,e,t)=>i+512<<20|e+512<<10|t+512;function Ib(i){if(!i.cells){i.cells=new Map;let e=new Set;for(let{ids:t,delta:n}of i.morphs.ears_pointed??[])for(let s=0;s<t.length;s++)Math.hypot(n[s*3],n[s*3+1],n[s*3+2])>.001&&e.add(t[s]);for(let t of i.meshes)if(!(t.piece||t.part!=="skin"))for(let n=t.start;n<t.start+t.count;n++){if(e.has(n))continue;let s=Up(Math.floor(i.position[n*3]/uo),Math.floor(i.position[n*3+1]/uo),Math.floor(i.position[n*3+2]/uo));i.cells.has(s)||i.cells.set(s,[]),i.cells.get(s).push(n)}}return i.cells}function Ap(i,e){let t=Ib(i),n=i.position,s=e.length/3,r=new Uint32Array(s*pn),o=new Float32Array(s*pn),a=new Float64Array(pn),l=new Uint32Array(pn);for(let c=0;c<s;c++){let[u,d,h]=[e[c*3],e[c*3+1],e[c*3+2]],[f,g,y]=[u,d,h].map(x=>Math.floor(x/uo)),m=0;for(let x=1;x<=Rb;x++){m=0;for(let M=-x;M<=x;M++)for(let v=-x;v<=x;v++)for(let S=-x;S<=x;S++)for(let A of t.get(Up(f+M,g+v,y+S))??[]){let E=(n[A*3]-u)**2+(n[A*3+1]-d)**2+(n[A*3+2]-h)**2;if(m===pn&&E>=a[m-1])continue;let _=m<pn?m++:m-1;for(;_>0&&a[_-1]>E;_--)a[_]=a[_-1],l[_]=l[_-1];a[_]=E,l[_]=A}if(m===pn&&a[m-1]<=(x*uo)**2)break}let p=0;for(let x=0;x<m;x++)p+=1/(a[x]+1e-6);for(let x=0;x<m;x++)r[c*pn+x]=l[x],o[c*pn+x]=1/(a[x]+1e-6)/p}return{ids:r,shares:o}}function Tp(i,e,t,n,s=0){if(i.moves??=new Map,!i.moves.has(e)){let l=new Float32Array(i.position.length);for(let{ids:c,delta:u}of i.morphs[e]??[])for(let d=0;d<c.length;d++)for(let h=0;h<3;h++)l[c[d]*3+h]+=u[d*3+h];i.moves.set(e,l)}let r=i.moves.get(e),o=[],a=[];for(let l=0;l<t.length/3;l++){let c=[0,0,0];for(let u=0;u<pn;u++){let d=n.shares[l*pn+u],h=n.ids[l*pn+u];for(let f=0;f<3;f++)c[f]+=r[h*3+f]*d}Math.max(Math.abs(c[0]),Math.abs(c[1]),Math.abs(c[2]))<1e-4||(o.push(l+s),a.push(...c))}return{ids:Uint32Array.from(o),delta:Float32Array.from(a),normal:new Float32Array(o.length*3)}}function Pb(i,e,t,n){let s=new Map;for(let[a,l]of Object.entries(t??{})){let c=n[a]??0;if(c)for(let[u,d]of Object.entries(l))e.has(u)&&(s.has(u)||s.set(u,new N),s.get(u).add(new N(...d).multiplyScalar(c)))}if(!s.size)return null;i.updateMatrixWorld(!0);let r=i.matrixWorld.clone().invert(),o=new Map;for(let[a,l]of e){let c=r.clone().multiply(l.matrixWorld),u=s.get(a);u&&c.premultiply(new Ne().makeTranslation(u.x,u.y,u.z)),o.set(a,c)}for(let[a,l]of e){let c=l.parent?.isBone?o.get(l.parent.name):null;(c?c.clone().invert().multiply(o.get(a)):o.get(a)).decompose(l.position,l.quaternion,l.scale)}return i.updateMatrixWorld(!0),new Map([...s].map(([a,l])=>[a,new Ne().makeTranslation(-l.x,-l.y,-l.z)]))}async function Op(i={},e="",t="auto"){let n=xb(e,t,i),s=n.body,r=new Set(n.clothes.map(ie=>Ut[ie])),o=n.clothes.filter(ie=>!wl(Ut[ie],r)),a=[...n.nails!=="none"&&!wl("nails",r)?[`nails_${n.nails}`]:[],...n.toenails&&!wl("toenails",r)?["toenails"]:[]],l={...n.clothColours};if(n.colours.nails!==as)for(let ie of a)l[ie]={nail:n.colours.nails};let[c,u,d]=await Promise.all([Ip(s,n.species),n.hair===xt?null:wb(n.hair,s),Promise.all([...o,...a].map(ie=>Ab(ie,s,n.variants[ie])))]),{root:h,bones:f}=Mf(c.file),g=null,y=new Set,m=d.filter(Boolean).sort((ie,te)=>ie.layer-te.layer);for(let ie of m)for(let te of ie.hides)y.add(te);let p=y.has("neck")||y.has("torso")||m.some(ie=>hb.has(ie.slot)),x=yb(n,s,c.file.keys,p);g=Pb(h,f,c.file.jointMoves,x);let M={height:1,legs:1,arms:1,head:1,...Uf[n.species]},v=ie=>ie.startsWith("race_");for(let[ie,te]of Object.entries(x))if(!(!te||!(v(ie)||ie.includes("."))||!c.morphs[ie]))for(let le of c.meshes){if(!le.piece||le.morphs?.[ie]||!Ll(le,n,s)||v(ie)&&!/^underwear/u.test(le.piece)||(le.carried??=new Set,le.carried.has(ie)))continue;le.carried.add(ie);let ke=c.position.subarray(le.start*3,(le.start+le.count)*3);c.morphs[ie].push(Tp(c,ie,ke,le.near??=Ap(c,ke),le.start))}let S=new Map;for(let[ie,te]of Object.entries(db)){let le=n.limbs[ie]*M[ie]-1;if(le)for(let[ke,Ie]of te){let nt=f.get(Ie);if(!f.has(ke)||!nt)continue;let{x:ht,y:_t,z:et}=nt.position.clone().normalize();S.set(ke,new Ne().set(1+le*ht*ht,le*ht*_t,le*ht*et,0,le*_t*ht,1+le*_t*_t,le*_t*et,0,le*et*ht,le*et*_t,1+le*et*et,0,0,0,0,1)),nt.position.multiplyScalar(1+le)}}let A=n.limbs.head*M.head;if(A!==1){S.set("Head",new Ne().makeScale(A,A,A));for(let ie of["eye_l","eye_r"])f.has(ie)&&(f.get(ie).position.multiplyScalar(A),S.set(ie,new Ne().makeScale(A,A,A)))}h.updateMatrixWorld(!0);let E=[],_=(ie,te,le,ke=null)=>{let Ie=new Sr(ie,te);return Ie.frustumCulled=!1,Ie.name=ke?"piece":"body",Ie.userData.sharedShadow=!0,h.add(Ie),Ie.bind(wf(h,f,le,S,ke,g),Ie.matrixWorld),Ie},{position:w,normal:C}=wp(c.position,c.normal,c.morphs,x);for(let ie of c.meshes){if(!/^(?:beard|moustache|tusks|horns|tail)-/u.test(ie.piece??"")||Ll(ie,n,s))continue;let te=c.tucked[ie.piece.startsWith("tail")?"hips":"head"];for(let le=ie.start;le<ie.start+ie.count;le++)w.set(te,le*3)}let I=ie=>c.meshes.find(te=>te.part===ie)?.texture,L=new Map,B=Gf(n.skin,s,n.age);B&&L.set(I("skin"),$r(B)),n.eyePicture!==Hn&&L.set(I("iris"),$r("avatar-eyes"));let P=n.species!=="human",D=P||!c.file.keys?null:await op({sex:s,base:B??I("skin"),skin:n.skin==="custom"?n.colours.skin:as,lips:n.colours.lips}).catch(()=>null);D&&L.set(I("skin"),D);let Y=new Set(D?["skin","lips"]:[]),G=ie=>Y.has(ie)?as:{skin:n.skin==="custom"?n.colours.skin:as,underwear:n.colours.underwear,underwear_trim:Li(n.colours.underwear,0,.3),iris:n.eyePicture===Hn?n.colours.eyes:as,eyes:n.colours.eyes,eyebrows:n.colours.brows,eyelashes:P?void 0:Li(n.colours.brows,0,.5),lips:n.colours.lips,nails:n.colours.nails,fur:n.colours.fur,fur_tufts:n.colours.fur,fur2:n.colours.fur2,fur2_tufts:n.colours.fur2,nose:n.colours.nose,claws:n.colours.claws??n.colours.horns,scales:n.colours.scales,scales2:n.colours.scales2,horns:n.colours.horns,hair:n.hairColour}[ie],ne=new Uint16Array(w.length),q=new He;for(let ie of c.meshes){let te=G(ie.part);te===void 0?q.setRGB(...ie.colour):q.setHex(te);for(let le=ie.start;le<ie.start+ie.count;le++)ne[le*3]=Math.round(q.r*65535),ne[le*3+1]=Math.round(q.g*65535),ne[le*3+2]=Math.round(q.b*65535)}let $=new Rt;$.setAttribute("position",new Be(w,3)),$.setAttribute("normal",new Be(C,3)),$.setAttribute("color",new Be(ne,3,!0));for(let[ie,te]of Object.entries(c.shared))$.setAttribute(ie,te);n.eyePicture!==Hn&&$.setAttribute("uv",Mb(c,n.eyePicture));let{index:Q,groups:be}=Sb(c,n,y);$.setIndex(Q),$.userData.distant={groups:!0};let Ae=be.map((ie,te)=>{$.addGroup(ie.start,ie.count,te),$.groups[te].distant={full:{start:ie.start,count:ie.count},far:{start:ie.farStart,count:ie.farCount}};let le=!!ie.mesh.alpha,ke=ie.mesh.alpha==="MASK";return new ks({map:L.get(ie.mesh.texture)??(ie.mesh.texture?$r(ie.mesh.texture,c.file.pictures):null),vertexColors:!0,side:Dt,...ke?{alphaTest:.5}:le?{transparent:!0,depthWrite:!1,alphaTest:.05}:{}})});$.boundingBox=c.boundingBox.clone(),$.boundingSphere=c.boundingSphere.clone();let Qe=bb(c);Qe.length&&($.morphAttributes.position=Qe,$.morphTargetsRelative=!0),_($,Ae,c.file),E.push(()=>{$.morphAttributes={};for(let ie of Object.keys(c.shared))$.deleteAttribute(ie);$.setIndex(null),$.dispose();for(let ie of Ae)ie.dispose()});let We=[],Ke=({key:ie,part:te,pictures:le,slot:ke,piece:Ie,bone:nt},ht,_t=null)=>{let et=nt?Eb(te,nt,c.file):null,mt=et??te;Cb(ie,mt,Tb.has(ke),_t,!!et).forEach((F,Et)=>{let{mesh:qe,geometry:R,morphs:b,colours:k,plan:H}=F;for(let[de,ae]of Object.entries(x))if(ae&&(de.includes(".")||v(de))&&!b[de]&&c.morphs[de]){let re=R.attributes.position.array;b[de]=[Tp(c,de,re,F.near??=Ap(c,re))]}let X=R,oe=null;if(qe.partOf){let de=qe.parts.map(({part:re})=>l[Ie]?.[re]??null),ae=de.join();if(!k.has(ae)){let re=qe.parts.map(({colour:ze},U)=>de[U]===null?new He().setRGB(...ze):new He().setHex(de[U])),Se=En(Uint8Array,qe.partOf),Pe=new Uint16Array(Se.length*3);Se.forEach((ze,U)=>{Pe[U*3]=Math.round(re[ze].r*65535),Pe[U*3+1]=Math.round(re[ze].g*65535),Pe[U*3+2]=Math.round(re[ze].b*65535)}),k.set(ae,new Be(Pe,3,!0))}oe=k.get(ae)}let he=Object.keys(b).length>0,Z=!!H&&mt.joints.some(de=>S.has(de));if(he||oe||Z){let de=he?wp(R.attributes.position.array,R.attributes.normal.array,b,x):null;de&&et&&vb(de,R.attributes.position.array,R.attributes.normal.array);let ae=["uv","skinIndex","skinWeight",...he?[]:["normal"],...he||Z?[]:["position"]];X=new Rt,de?(X.setAttribute("position",new Be(de.position,3)),X.setAttribute("normal",new Be(de.normal,3))):Z&&X.setAttribute("position",new Be(R.attributes.position.array.slice(),3));for(let Se of ae)R.attributes[Se]&&X.setAttribute(Se,R.attributes[Se]);oe&&(X.setAttribute("color",oe),ae.push("color")),X.setIndex(R.index),X.userData.distant=R.userData.distant,X.boundingBox=R.boundingBox,X.boundingSphere=R.boundingSphere;let re=X;E.push(()=>{for(let Se of ae)re.deleteAttribute(Se);re.setIndex(null),re.dispose()})}let K=new ks({map:qe.texture?$r(qe.texture,le):null,color:ht(qe),vertexColors:!!oe,...qe.alpha?{alphaTest:.5,side:Dt}:{}});E.push(()=>K.dispose());let ue=_(X,K,mt,c.file);if(H){let de=ip(H,mt,X.attributes.position.array,f,S,Et?`${Et}_`:""),{bones:ae,boneInverses:re}=ue.skeleton;ue.bind(new Xi([...ae,...de.bones],[...re,...de.inverses]),ue.bindMatrix);for(let Se of de.springs)We.push({...Se,joint:fp,meets:"body"})}})},j=ep(n.hair),ee=j===void 0?null:{line:c.eyes-j,centre:c.headAt};u&&!y.has("hair")&&Ke(u,()=>new He(n.hairColour),ee);for(let ie of m)Ke(ie,te=>te.partOf?16777215:new He().setRGB(...te.colour));let ve=pp.map(ie=>f.get(ie)).filter(Boolean);c.meshes.some(ie=>ie.piece?.startsWith("tail-")&&Ll(ie,n,s))&&ve.length>1&&We.push({name:"Tail",bones:ve,joint:dp,meets:"legs"});let _e=We.length?mp(c,w,f):{body:[],legs:[]};for(let ie of We)ie.colliders=[..._e[ie.meets]];let Oe=Ef(h,f,n.height*M.height);return Oe.springs=We,Oe.colliders=[..._e.body,..._e.legs],We.length&&xp(Oe),Oe.dispose=()=>{for(let ie of E)ie()},Oe.avatar=n,Oe.kit=c,Oe}var Fp={POSITION:["byte","byte normalized","unsigned byte","unsigned byte normalized","short","short normalized","unsigned short","unsigned short normalized"],NORMAL:["byte normalized","short normalized"],TANGENT:["byte normalized","short normalized"],TEXCOORD:["byte","byte normalized","unsigned byte","short","short normalized","unsigned short"]},Ni=class{constructor(){this.textureUtils=null,this.pluginCallbacks=[],this.register(function(e){return new Gh(e)}),this.register(function(e){return new Wh(e)}),this.register(function(e){return new $h(e)}),this.register(function(e){return new jh(e)}),this.register(function(e){return new Zh(e)}),this.register(function(e){return new Kh(e)}),this.register(function(e){return new Xh(e)}),this.register(function(e){return new Yh(e)}),this.register(function(e){return new qh(e)}),this.register(function(e){return new Jh(e)}),this.register(function(e){return new Qh(e)}),this.register(function(e){return new eu(e)}),this.register(function(e){return new tu(e)}),this.register(function(e){return new nu(e)})}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}setTextureUtils(e){return this.textureUtils=e,this}parse(e,t,n,s){let r=new Hh,o=[];for(let a=0,l=this.pluginCallbacks.length;a<l;a++)o.push(this.pluginCallbacks[a](r));r.setPlugins(o),r.setTextureUtils(this.textureUtils),r.writeAsync(e,t,s).catch(n)}parseAsync(e,t){let n=this;return new Promise(function(s,r){n.parse(e,s,r,t)})}},Ze={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,BYTE:5120,UNSIGNED_BYTE:5121,SHORT:5122,UNSIGNED_SHORT:5123,INT:5124,UNSIGNED_INT:5125,FLOAT:5126,ARRAY_BUFFER:34962,ELEMENT_ARRAY_BUFFER:34963,NEAREST:9728,LINEAR:9729,NEAREST_MIPMAP_NEAREST:9984,LINEAR_MIPMAP_NEAREST:9985,NEAREST_MIPMAP_LINEAR:9986,LINEAR_MIPMAP_LINEAR:9987,CLAMP_TO_EDGE:33071,MIRRORED_REPEAT:33648,REPEAT:10497},kh="KHR_mesh_quantization",cn={};cn[At]=Ze.NEAREST;cn[pa]=Ze.NEAREST_MIPMAP_NEAREST;cn[ji]=Ze.NEAREST_MIPMAP_LINEAR;cn[Ct]=Ze.LINEAR;cn[Ys]=Ze.LINEAR_MIPMAP_NEAREST;cn[Bn]=Ze.LINEAR_MIPMAP_LINEAR;cn[dn]=Ze.CLAMP_TO_EDGE;cn[Cs]=Ze.REPEAT;cn[Rs]=Ze.MIRRORED_REPEAT;var Bp={scale:"scale",position:"translation",quaternion:"rotation",morphTargetInfluences:"weights"},Lb=new He,kp=12,Nb=1179937895,Db=2,zp=8,Ub=1313821514,Ob=5130562;function ni(i,e){return i.length===e.length&&i.every(function(t,n){return t===e[n]})}function Fb(i){return new TextEncoder().encode(i).buffer}function Bb(i){return ni(i.elements,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}function kb(i,e,t){let n={min:new Array(i.itemSize).fill(Number.POSITIVE_INFINITY),max:new Array(i.itemSize).fill(Number.NEGATIVE_INFINITY)};for(let s=e;s<e+t;s++)for(let r=0;r<i.itemSize;r++){let o;i.itemSize>4?o=i.array[s*i.itemSize+r]:(r===0?o=i.getX(s):r===1?o=i.getY(s):r===2?o=i.getZ(s):r===3&&(o=i.getW(s)),i.normalized===!0&&(o=Ki.normalize(o,i.array))),n.min[r]=Math.min(n.min[r],o),n.max[r]=Math.max(n.max[r],o)}return n}function Vp(i){return Math.ceil(i/4)*4}function zh(i,e=0){let t=Vp(i.byteLength);if(t!==i.byteLength){let n=new Uint8Array(t);if(n.set(new Uint8Array(i)),e!==0)for(let s=i.byteLength;s<t;s++)n[s]=e;return n.buffer}return i}function Vh(){return typeof document>"u"&&typeof OffscreenCanvas<"u"?new OffscreenCanvas(1,1):document.createElement("canvas")}function zb(i,e){if(typeof OffscreenCanvas<"u"&&i instanceof OffscreenCanvas){let t;return e==="image/jpeg"?t=.92:e==="image/webp"&&(t=.8),i.convertToBlob({type:e,quality:t})}else return new Promise(t=>i.toBlob(t,e))}var Hh=class{constructor(){this.plugins=[],this.options={},this.pending=[],this.buffers=[],this.byteOffset=0,this.buffers=[],this.nodeMap=new Map,this.skins=[],this.extensionsUsed={},this.extensionsRequired={},this.uids=new Map,this.uid=0,this.json={asset:{version:"2.0",generator:"THREE.GLTFExporter r186"}},this.cache={meshes:new Map,attributes:new Map,attributesNormalized:new Map,materials:new Map,textures:new Map,images:new Map,normalMaps:new Map},this.textureUtils=null}setPlugins(e){this.plugins=e}setTextureUtils(e){this.textureUtils=e}async writeAsync(e,t,n={}){this.options=Object.assign({binary:!1,trs:!1,onlyVisible:!0,maxTextureSize:1/0,animations:[],includeCustomExtensions:!1,copyright:null},n),this.options.animations.length>0&&(this.options.trs=!0),await this.processInputAsync(e),await Promise.all(this.pending);let s=this,r=s.buffers,o=s.json;n=s.options;let a=s.extensionsUsed,l=s.extensionsRequired,c=new Blob(r,{type:"application/octet-stream"}),u=Object.keys(a),d=Object.keys(l);if(u.length>0&&(o.extensionsUsed=u),d.length>0&&(o.extensionsRequired=d),o.buffers&&o.buffers.length>0&&(o.buffers[0].byteLength=c.size),n.copyright&&(o.asset.copyright=n.copyright),n.binary===!0){let h=new FileReader;h.readAsArrayBuffer(c),h.onloadend=function(){let f=zh(h.result),g=new DataView(new ArrayBuffer(zp));g.setUint32(0,f.byteLength,!0),g.setUint32(4,Ob,!0);let y=zh(Fb(JSON.stringify(o)),32),m=new DataView(new ArrayBuffer(zp));m.setUint32(0,y.byteLength,!0),m.setUint32(4,Ub,!0);let p=new ArrayBuffer(kp),x=new DataView(p);x.setUint32(0,Nb,!0),x.setUint32(4,Db,!0);let M=kp+m.byteLength+y.byteLength+g.byteLength+f.byteLength;x.setUint32(8,M,!0);let v=new Blob([p,m,y,g,f],{type:"application/octet-stream"}),S=new FileReader;S.readAsArrayBuffer(v),S.onloadend=function(){t(S.result)}}}else if(o.buffers&&o.buffers.length>0){let h=new FileReader;h.readAsDataURL(c),h.onloadend=function(){let f=h.result;o.buffers[0].uri=f,t(o)}}else t(o)}serializeUserData(e,t){if(Object.keys(e.userData).length===0)return;let n=this.options,s=this.extensionsUsed;try{let r=JSON.parse(JSON.stringify(e.userData));if(n.includeCustomExtensions&&r.gltfExtensions){t.extensions===void 0&&(t.extensions={});for(let o in r.gltfExtensions)t.extensions[o]=r.gltfExtensions[o],s[o]=!0;delete r.gltfExtensions}Object.keys(r).length>0&&(t.extras=r)}catch(r){console.warn("THREE.GLTFExporter: userData of '"+e.name+"' won't be serialized because of JSON.stringify error - "+r.message)}}getUID(e,t=!1){if(this.uids.has(e)===!1){let s=new Map;s.set(!0,this.uid++),s.set(!1,this.uid++),this.uids.set(e,s)}return this.uids.get(e).get(t)}isNormalizedNormalAttribute(e){if(this.cache.attributesNormalized.has(e))return!1;let n=new N;for(let s=0,r=e.count;s<r;s++)if(Math.abs(n.fromBufferAttribute(e,s).length()-1)>5e-4)return!1;return!0}createNormalizedNormalAttribute(e){let t=this.cache;if(t.attributesNormalized.has(e))return t.attributesNormalized.get(e);let n=e.clone(),s=new N;for(let r=0,o=n.count;r<o;r++)s.fromBufferAttribute(n,r),s.x===0&&s.y===0&&s.z===0?s.setX(1):s.normalize(),n.setXYZ(r,s.x,s.y,s.z);return t.attributesNormalized.set(e,n),n}applyTextureTransform(e,t){let n=!1,s={};(t.offset.x!==0||t.offset.y!==0)&&(s.offset=t.offset.toArray(),n=!0),t.rotation!==0&&(s.rotation=t.rotation,n=!0),(t.repeat.x!==1||t.repeat.y!==1)&&(s.scale=t.repeat.toArray(),n=!0),n&&(e.extensions=e.extensions||{},e.extensions.KHR_texture_transform=s,this.extensionsUsed.KHR_texture_transform=!0)}async buildMetalRoughTextureAsync(e,t){if(e===t)return e;function n(f){return f.colorSpace===St?function(y){return y<.04045?y*.0773993808:Math.pow(y*.9478672986+.0521327014,2.4)}:function(y){return y}}e instanceof gi&&(e=await this.decompressTextureAsync(e)),t instanceof gi&&(t=await this.decompressTextureAsync(t));let s=e?e.image:null,r=t?t.image:null,o=Math.max(s?s.width:0,r?r.width:0),a=Math.max(s?s.height:0,r?r.height:0),l=Vh();l.width=o,l.height=a;let c=l.getContext("2d",{willReadFrequently:!0});c.fillStyle="#00ffff",c.fillRect(0,0,o,a);let u=c.getImageData(0,0,o,a);if(s){c.drawImage(s,0,0,o,a);let f=n(e),g=c.getImageData(0,0,o,a).data;for(let y=2;y<g.length;y+=4)u.data[y]=f(g[y]/256)*256}if(r){c.drawImage(r,0,0,o,a);let f=n(t),g=c.getImageData(0,0,o,a).data;for(let y=1;y<g.length;y+=4)u.data[y]=f(g[y]/256)*256}c.putImageData(u,0,0);let h=(e||t).clone();return h.source=new Zn(l),h.colorSpace=Tn,h.channel=(e||t).channel,e&&t&&e.channel!==t.channel&&console.warn("THREE.GLTFExporter: UV channels for metalnessMap and roughnessMap textures must match."),console.warn("THREE.GLTFExporter: Merged metalnessMap and roughnessMap textures."),h}async buildNormalMapTextureAsync(e,t,n){e instanceof gi&&(e=await this.decompressTextureAsync(e));let s=e.image,r=Vh();r.width=s.width,r.height=s.height;let o=r.getContext("2d",{willReadFrequently:!0});o.drawImage(s,0,0,r.width,r.height);let a=o.getImageData(0,0,r.width,r.height),l=a.data;for(let u=0;u<l.length;u+=4)t&&(l[u+0]=255-l[u+0]),n&&(l[u+1]=255-l[u+1]);o.putImageData(a,0,0);let c=e.clone();return c.source=new Zn(r),c}async decompressTextureAsync(e,t=1/0){if(this.textureUtils===null)throw new Error("THREE.GLTFExporter: setTextureUtils() must be called to process compressed textures.");return await this.textureUtils.decompress(e,t)}processBuffer(e){let t=this.json,n=this.buffers;return t.buffers||(t.buffers=[{byteLength:0}]),n.push(e),0}processBufferView(e,t,n,s,r){let o=this.json;o.bufferViews||(o.bufferViews=[]);let a;switch(t){case Ze.BYTE:case Ze.UNSIGNED_BYTE:a=1;break;case Ze.SHORT:case Ze.UNSIGNED_SHORT:a=2;break;default:a=4}let l=e.itemSize*a;r===Ze.ARRAY_BUFFER&&(l=Math.ceil(l/4)*4);let c=Vp(s*l),u=new DataView(new ArrayBuffer(c)),d=0;for(let g=n;g<n+s;g++){for(let y=0;y<e.itemSize;y++){let m;e.itemSize>4?m=e.array[g*e.itemSize+y]:(y===0?m=e.getX(g):y===1?m=e.getY(g):y===2?m=e.getZ(g):y===3&&(m=e.getW(g)),e.normalized===!0&&(m=Ki.normalize(m,e.array))),t===Ze.FLOAT?u.setFloat32(d,m,!0):t===Ze.INT?u.setInt32(d,m,!0):t===Ze.UNSIGNED_INT?u.setUint32(d,m,!0):t===Ze.SHORT?u.setInt16(d,m,!0):t===Ze.UNSIGNED_SHORT?u.setUint16(d,m,!0):t===Ze.BYTE?u.setInt8(d,m):t===Ze.UNSIGNED_BYTE&&u.setUint8(d,m),d+=a}d%l!==0&&(d+=l-d%l)}let h={buffer:this.processBuffer(u.buffer),byteOffset:this.byteOffset,byteLength:c};return r!==void 0&&(h.target=r),r===Ze.ARRAY_BUFFER&&(h.byteStride=l),this.byteOffset+=c,o.bufferViews.push(h),{id:o.bufferViews.length-1,byteLength:0}}processBufferViewImage(e){let t=this,n=t.json;return n.bufferViews||(n.bufferViews=[]),new Promise(function(s){let r=new FileReader;r.readAsArrayBuffer(e),r.onloadend=function(){let o=zh(r.result),a={buffer:t.processBuffer(o),byteOffset:t.byteOffset,byteLength:o.byteLength};t.byteOffset+=o.byteLength,s(n.bufferViews.push(a)-1)}})}processAccessor(e,t,n,s){let r=this.json,o={1:"SCALAR",2:"VEC2",3:"VEC3",4:"VEC4",9:"MAT3",16:"MAT4"},a;if(e.array.constructor===Float32Array)a=Ze.FLOAT;else if(e.array.constructor===Int32Array)a=Ze.INT;else if(e.array.constructor===Uint32Array)a=Ze.UNSIGNED_INT;else if(e.array.constructor===Int16Array)a=Ze.SHORT;else if(e.array.constructor===Uint16Array)a=Ze.UNSIGNED_SHORT;else if(e.array.constructor===Int8Array)a=Ze.BYTE;else if(e.array.constructor===Uint8Array)a=Ze.UNSIGNED_BYTE;else throw new Error("THREE.GLTFExporter: Unsupported bufferAttribute component type: "+e.array.constructor.name);if(n===void 0&&(n=0),(s===void 0||s===1/0)&&(s=e.count),s===0)return null;let l=kb(e,n,s),c;t!==void 0&&(c=e===t.index?Ze.ELEMENT_ARRAY_BUFFER:Ze.ARRAY_BUFFER);let u=this.processBufferView(e,a,n,s,c),d={bufferView:u.id,byteOffset:u.byteOffset,componentType:a,count:s,max:l.max,min:l.min,type:o[e.itemSize]};return e.normalized===!0&&(d.normalized=!0),r.accessors||(r.accessors=[]),r.accessors.push(d)-1}processImage(e,t,n,s="image/png"){if(e!==null){let r=this,o=r.cache,a=r.json,l=r.options,c=r.pending;o.images.has(e)||o.images.set(e,{});let u=o.images.get(e),d=s+":flipY/"+n.toString();if(u[d]!==void 0)return u[d];a.images||(a.images=[]);let h={mimeType:s},f=Vh();f.width=Math.min(e.width,l.maxTextureSize),f.height=Math.min(e.height,l.maxTextureSize);let g=f.getContext("2d",{willReadFrequently:!0});if(n===!0&&(g.translate(0,f.height),g.scale(1,-1)),e.data!==void 0){t!==$t&&console.error("GLTFExporter: Only RGBAFormat is supported.",t),(e.width>l.maxTextureSize||e.height>l.maxTextureSize)&&console.warn("GLTFExporter: Image size is bigger than maxTextureSize",e);let m=new Uint8ClampedArray(e.height*e.width*4);for(let p=0;p<m.length;p+=4)m[p+0]=e.data[p+0],m[p+1]=e.data[p+1],m[p+2]=e.data[p+2],m[p+3]=e.data[p+3];g.putImageData(new ImageData(m,e.width,e.height),0,0)}else if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap||typeof OffscreenCanvas<"u"&&e instanceof OffscreenCanvas)g.drawImage(e,0,0,f.width,f.height);else throw new Error("THREE.GLTFExporter: Invalid image type. Use HTMLImageElement, HTMLCanvasElement, ImageBitmap or OffscreenCanvas.");l.binary===!0?c.push(zb(f,s).then(m=>r.processBufferViewImage(m)).then(m=>{h.bufferView=m})):h.uri=Us.getDataURL(f,s);let y=a.images.push(h)-1;return u[d]=y,y}else throw new Error("THREE.GLTFExporter: No valid image data found. Unable to process texture.")}processSampler(e){let t=this.json;t.samplers||(t.samplers=[]);let n={magFilter:cn[e.magFilter],minFilter:cn[e.minFilter],wrapS:cn[e.wrapS],wrapT:cn[e.wrapT]};return t.samplers.push(n)-1}async processTextureAsync(e){let n=this.options,s=this.cache,r=this.json;if(s.textures.has(e))return s.textures.get(e);r.textures||(r.textures=[]),e instanceof gi&&(e=await this.decompressTextureAsync(e,n.maxTextureSize));let o=e.userData.mimeType,a=this.processImage(e.image,e.format,e.flipY,o),l={sampler:this.processSampler(e)};o==="image/webp"?(l.extensions=l.extensions||{},l.extensions.EXT_texture_webp={source:a},this.extensionsUsed.EXT_texture_webp=!0,this.extensionsRequired.EXT_texture_webp=!0):l.source=a,e.name&&(l.name=e.name),await this._invokeAllAsync(async function(u){u.writeTexture&&await u.writeTexture(e,l)});let c=r.textures.push(l)-1;return s.textures.set(e,c),c}async processMaterialAsync(e,t){let n=this.cache,s=this.json,r=t!==void 0&&t.hasAttribute("tangent"),o=e.normalMap?e.uuid+":"+r:e.uuid;if(n.materials.has(o))return n.materials.get(o);if(e.isShaderMaterial)return console.warn("GLTFExporter: THREE.ShaderMaterial not supported."),null;s.materials||(s.materials=[]);let a={pbrMetallicRoughness:{}};e.isMeshStandardMaterial!==!0&&e.isMeshBasicMaterial!==!0&&console.warn("GLTFExporter: Use MeshStandardMaterial or MeshBasicMaterial for best results.");let l=e.color.toArray().concat([e.opacity]);if(ni(l,[1,1,1,1])||(a.pbrMetallicRoughness.baseColorFactor=l),e.isMeshStandardMaterial?(a.pbrMetallicRoughness.metallicFactor=e.metalness,a.pbrMetallicRoughness.roughnessFactor=e.roughness):(a.pbrMetallicRoughness.metallicFactor=0,a.pbrMetallicRoughness.roughnessFactor=1),e.metalnessMap||e.roughnessMap){let u=await this.buildMetalRoughTextureAsync(e.metalnessMap,e.roughnessMap),d={index:await this.processTextureAsync(u),texCoord:u.channel};this.applyTextureTransform(d,u),a.pbrMetallicRoughness.metallicRoughnessTexture=d}if(e.map){let u={index:await this.processTextureAsync(e.map),texCoord:e.map.channel};this.applyTextureTransform(u,e.map),a.pbrMetallicRoughness.baseColorTexture=u}if(e.emissive){let u=e.emissive;if(Math.max(u.r,u.g,u.b)>0&&(a.emissiveFactor=e.emissive.toArray()),e.emissiveMap){let h={index:await this.processTextureAsync(e.emissiveMap),texCoord:e.emissiveMap.channel};this.applyTextureTransform(h,e.emissiveMap),a.emissiveTexture=h}}if(e.normalMap){let u=e.normalScale,d=u.x<0,h=r?u.y<0:u.y>0,f=e.normalMap;if(d||h){n.normalMaps.has(e.normalMap)===!1&&n.normalMaps.set(e.normalMap,{});let y=n.normalMaps.get(e.normalMap),m=`${d}:${h}`;y[m]===void 0&&(y[m]=await this.buildNormalMapTextureAsync(e.normalMap,d,h)),f=y[m]}let g={index:await this.processTextureAsync(f),texCoord:e.normalMap.channel};Math.abs(u.x)!==1&&(g.scale=Math.abs(u.x)),this.applyTextureTransform(g,e.normalMap),a.normalTexture=g}if(e.aoMap){let u={index:await this.processTextureAsync(e.aoMap),texCoord:e.aoMap.channel};e.aoMapIntensity!==1&&(u.strength=e.aoMapIntensity),this.applyTextureTransform(u,e.aoMap),a.occlusionTexture=u}e.transparent?a.alphaMode="BLEND":e.alphaTest>0&&(a.alphaMode="MASK",a.alphaCutoff=e.alphaTest),e.side===Dt&&(a.doubleSided=!0),e.name!==""&&(a.name=e.name),this.serializeUserData(e,a),await this._invokeAllAsync(async function(u){u.writeMaterialAsync&&await u.writeMaterialAsync(e,a)});let c=s.materials.push(a)-1;return n.materials.set(o,c),c}async processMeshAsync(e){let t=this.cache,n=this.json,s=[e.geometry.uuid];if(Array.isArray(e.material))for(let v=0,S=e.material.length;v<S;v++)s.push(e.material[v].uuid);else s.push(e.material.uuid);let r=s.join(":");if(t.meshes.has(r))return t.meshes.get(r);let o=e.geometry,a;e.isLineSegments?a=Ze.LINES:e.isLineLoop?a=Ze.LINE_LOOP:e.isLine?a=Ze.LINE_STRIP:e.isPoints?a=Ze.POINTS:a=e.material.wireframe?Ze.LINES:Ze.TRIANGLES;let l={},c={},u=[],d=[],h={uv:"TEXCOORD_0",uv1:"TEXCOORD_1",uv2:"TEXCOORD_2",uv3:"TEXCOORD_3",color:"COLOR_0",skinWeight:"WEIGHTS_0",skinIndex:"JOINTS_0"},f=o.getAttribute("normal");f!==void 0&&!this.isNormalizedNormalAttribute(f)&&(console.warn("THREE.GLTFExporter: Creating normalized normal attribute from the non-normalized one."),o.setAttribute("normal",this.createNormalizedNormalAttribute(f)));let g=null;for(let v in o.attributes){if(v.slice(0,5)==="morph")continue;let S=o.attributes[v];if(v=h[v]||v.toUpperCase(),!/^(POSITION|NORMAL|TANGENT|TEXCOORD_\d+|COLOR_\d+|JOINTS_\d+|WEIGHTS_\d+)$/.test(v)&&!v.startsWith("_")&&(v="_"+v),t.attributes.has(this.getUID(S))){c[v]=t.attributes.get(this.getUID(S));continue}g=null;let E=S.array;v==="JOINTS_0"&&!(E instanceof Uint16Array)&&!(E instanceof Uint8Array)?(console.warn('GLTFExporter: Attribute "skinIndex" converted to type UNSIGNED_SHORT.'),g=Ni.Utils.toTypedBufferAttribute(S,Uint16Array)):(E instanceof Uint32Array||E instanceof Int32Array)&&!v.startsWith("_")&&(console.warn(`GLTFExporter: Attribute "${v}" converted to type FLOAT.`),g=Ni.Utils.toTypedBufferAttribute(S,Float32Array));let _=this.processAccessor(g||S,o);_!==null&&(v.startsWith("_")||this.detectMeshQuantization(v,S),c[v]=_,t.attributes.set(this.getUID(S),_))}if(f!==void 0&&o.setAttribute("normal",f),Object.keys(c).length===0)return null;if(e.morphTargetInfluences!==void 0&&e.morphTargetInfluences.length>0){let v=[],S=[],A={};if(e.morphTargetDictionary!==void 0)for(let E in e.morphTargetDictionary)A[e.morphTargetDictionary[E]]=E;for(let E=0;E<e.morphTargetInfluences.length;++E){let _={},w=!1;for(let C in o.morphAttributes){if(C!=="position"&&C!=="normal"){w||(console.warn("GLTFExporter: Only POSITION and NORMAL morph are supported."),w=!0);continue}let I=o.morphAttributes[C][E],L=C.toUpperCase(),B=o.attributes[C];if(t.attributes.has(this.getUID(I,!0))){_[L]=t.attributes.get(this.getUID(I,!0));continue}let P=I.clone();if(!o.morphTargetsRelative)for(let D=0,Y=I.count;D<Y;D++)for(let G=0;G<I.itemSize;G++)G===0&&P.setX(D,I.getX(D)-B.getX(D)),G===1&&P.setY(D,I.getY(D)-B.getY(D)),G===2&&P.setZ(D,I.getZ(D)-B.getZ(D)),G===3&&P.setW(D,I.getW(D)-B.getW(D));_[L]=this.processAccessor(P,o),t.attributes.set(this.getUID(B,!0),_[L])}d.push(_),v.push(e.morphTargetInfluences[E]),e.morphTargetDictionary!==void 0&&S.push(A[E])}l.weights=v,S.length>0&&(l.extras={},l.extras.targetNames=S)}let y=Array.isArray(e.material);if(y&&o.groups.length===0)return null;let m=!1;if(y&&o.index===null){let v=[];for(let S=0,A=o.attributes.position.count;S<A;S++)v[S]=S;o.setIndex(v),m=!0}let p=y?e.material:[e.material],x=y?o.groups:[{materialIndex:0,start:void 0,count:void 0}];for(let v=0,S=x.length;v<S;v++){let A={mode:a,attributes:c};if(this.serializeUserData(o,A),d.length>0&&(A.targets=d),o.index!==null){let _=this.getUID(o.index);(x[v].start!==void 0||x[v].count!==void 0)&&(_+=":"+x[v].start+":"+x[v].count),t.attributes.has(_)?A.indices=t.attributes.get(_):(A.indices=this.processAccessor(o.index,o,x[v].start,x[v].count),t.attributes.set(_,A.indices)),A.indices===null&&delete A.indices}let E=await this.processMaterialAsync(p[x[v].materialIndex],o);E!==null&&(A.material=E),u.push(A)}m===!0&&o.setIndex(null),l.primitives=u,n.meshes||(n.meshes=[]),await this._invokeAllAsync(function(v){v.writeMesh&&v.writeMesh(e,l)});let M=n.meshes.push(l)-1;return t.meshes.set(r,M),M}detectMeshQuantization(e,t){if(this.extensionsUsed[kh])return;let n;switch(t.array.constructor){case Int8Array:n="byte";break;case Uint8Array:n="unsigned byte";break;case Int16Array:n="short";break;case Uint16Array:n="unsigned short";break;default:return}t.normalized&&(n+=" normalized");let s=e.split("_",1)[0];Fp[s]&&Fp[s].includes(n)&&(this.extensionsUsed[kh]=!0,this.extensionsRequired[kh]=!0)}processCamera(e){let t=this.json;t.cameras||(t.cameras=[]);let n=e.isOrthographicCamera,s={type:n?"orthographic":"perspective"};return n?s.orthographic={xmag:e.right*2,ymag:e.top*2,zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near}:s.perspective={aspectRatio:e.aspect,yfov:Ki.degToRad(e.fov),zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near},e.name!==""&&(s.name=e.type),t.cameras.push(s)-1}processAnimation(e,t){let n=this.json,s=this.nodeMap;n.animations||(n.animations=[]),e=Ni.Utils.mergeMorphTargetTracks(e.clone(),t);let r=e.tracks,o=[],a=[];for(let c=0;c<r.length;++c){let u=r[c],d=rt.parseTrackName(u.name),h=rt.findNode(t,d.nodeName),f=Bp[d.propertyName];if(d.objectName==="bones"&&(h.isSkinnedMesh===!0?h=h.skeleton.getBoneByName(d.objectIndex):h=void 0),!h||!f){console.warn('THREE.GLTFExporter: Could not export animation track "%s".',u.name);continue}let g=1,y=u.values.length/u.times.length;f===Bp.morphTargetInfluences&&(y/=h.morphTargetInfluences.length);let m;u.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline===!0?(m="CUBICSPLINE",y/=3):u.getInterpolation()===Vi?m="STEP":m="LINEAR",a.push({input:this.processAccessor(new Be(u.times,g)),output:this.processAccessor(new Be(u.values,y)),interpolation:m}),o.push({sampler:a.length-1,target:{node:s.get(h),path:f}})}let l={name:e.name||"clip_"+n.animations.length,samplers:a,channels:o};return this.serializeUserData(e,l),n.animations.push(l),n.animations.length-1}processSkin(e){let t=this.json,n=this.nodeMap,s=t.nodes[n.get(e)],r=e.skeleton;if(r===void 0)return null;let o=e.skeleton.bones[0];if(o===void 0)return null;let a=[],l=new Float32Array(r.bones.length*16),c=new Ne;for(let d=0;d<r.bones.length;++d)a.push(n.get(r.bones[d])),c.copy(r.boneInverses[d]),c.multiply(e.bindMatrix).toArray(l,d*16);return t.skins===void 0&&(t.skins=[]),t.skins.push({inverseBindMatrices:this.processAccessor(new Be(l,16)),joints:a,skeleton:n.get(o)}),s.skin=t.skins.length-1}async processNodeAsync(e){let t=this.json,n=this.options,s=this.nodeMap;if(t.nodes||(t.nodes=[]),e.pivot!==null)return await this._processNodeWithPivotAsync(e);let r={};if(n.trs){let a=e.quaternion.toArray(),l=e.position.toArray(),c=e.scale.toArray();ni(a,[0,0,0,1])||(r.rotation=a),ni(l,[0,0,0])||(r.translation=l),ni(c,[1,1,1])||(r.scale=c)}else e.matrixAutoUpdate&&e.updateMatrix(),Bb(e.matrix)===!1&&(r.matrix=e.matrix.elements);if(e.name!==""&&(r.name=String(e.name)),this.serializeUserData(e,r),e.isMesh||e.isLine||e.isPoints){let a=await this.processMeshAsync(e);a!==null&&(r.mesh=a)}else e.isCamera&&(r.camera=this.processCamera(e));e.isSkinnedMesh&&this.skins.push(e);let o=t.nodes.push(r)-1;if(s.set(e,o),e.children.length>0){let a=[];for(let l=0,c=e.children.length;l<c;l++){let u=e.children[l];if(u.visible||n.onlyVisible===!1){let d=await this.processNodeAsync(u);d!==null&&a.push(d)}}a.length>0&&(r.children=a)}return await this._invokeAllAsync(function(a){a.writeNode&&a.writeNode(e,r)}),o}async _processNodeWithPivotAsync(e){let t=this.json,n=this.options,s=this.nodeMap,r=e.pivot,o={},a=e.quaternion.toArray(),l=[e.position.x+r.x,e.position.y+r.y,e.position.z+r.z],c=e.scale.toArray();ni(a,[0,0,0,1])||(o.rotation=a),ni(l,[0,0,0])||(o.translation=l),ni(c,[1,1,1])||(o.scale=c),o.extras={pivot:r.toArray()},e.name!==""&&(o.name=String(e.name)),this.serializeUserData(e,o);let u=t.nodes.push(o)-1;s.set(e,u);let d={},h=[-r.x,-r.y,-r.z];if(ni(h,[0,0,0])||(d.translation=h),e.isMesh||e.isLine||e.isPoints){let y=await this.processMeshAsync(e);y!==null&&(d.mesh=y)}else e.isCamera&&(d.camera=this.processCamera(e));e.isSkinnedMesh&&this.skins.push(e);let g=[t.nodes.push(d)-1];if(e.children.length>0){let y=[];for(let m=0,p=e.children.length;m<p;m++){let x=e.children[m];if(x.visible||n.onlyVisible===!1){let M=await this.processNodeAsync(x);M!==null&&y.push(M)}}y.length>0&&(d.children=y)}return o.children=g,await this._invokeAllAsync(function(y){y.writeNode&&y.writeNode(e,o)}),u}async processSceneAsync(e){let t=this.json,n=this.options;t.scenes||(t.scenes=[],t.scene=0);let s={};e.name!==""&&(s.name=e.name),t.scenes.push(s);let r=[];for(let o=0,a=e.children.length;o<a;o++){let l=e.children[o];if(l.visible||n.onlyVisible===!1){let c=await this.processNodeAsync(l);c!==null&&r.push(c)}}r.length>0&&(s.nodes=r),this.serializeUserData(e,s)}async processObjectsAsync(e){let t=new fi;t.name="AuxScene";for(let n=0;n<e.length;n++)t.children.push(e[n]);await this.processSceneAsync(t)}async processInputAsync(e){let t=this.options;e=e instanceof Array?e:[e],await this._invokeAllAsync(function(s){s.beforeParse&&s.beforeParse(e)});let n=[];for(let s=0;s<e.length;s++)e[s]instanceof fi?await this.processSceneAsync(e[s]):n.push(e[s]);n.length>0&&await this.processObjectsAsync(n);for(let s=0;s<this.skins.length;++s)this.processSkin(this.skins[s]);if(e.length===1)for(let s=0;s<t.animations.length;++s)this.processAnimation(t.animations[s],e[0]);else for(let s=0;s<e.length;s++){let r=t.animations[s]||[];for(let o=0;o<r.length;++o)this.processAnimation(r[o],e[s])}await this._invokeAllAsync(function(s){s.afterParse&&s.afterParse(e)})}async _invokeAllAsync(e){for(let t=0,n=this.plugins.length;t<n;t++)await e(this.plugins[t])}},Gh=class{constructor(e){this.writer=e,this.name="KHR_lights_punctual"}writeNode(e,t){if(!e.isLight)return;if(!e.isDirectionalLight&&!e.isPointLight&&!e.isSpotLight){console.warn("THREE.GLTFExporter: Only directional, point, and spot lights are supported.",e);return}let n=this.writer,s=n.json,r=n.extensionsUsed,o={};e.name&&(o.name=e.name),o.color=e.color.toArray(),o.intensity=e.intensity,e.isDirectionalLight?o.type="directional":e.isPointLight?(o.type="point",e.distance>0&&(o.range=e.distance)):e.isSpotLight&&(o.type="spot",e.distance>0&&(o.range=e.distance),o.spot={},o.spot.innerConeAngle=(1-e.penumbra)*e.angle,o.spot.outerConeAngle=e.angle),e.decay!==void 0&&e.decay!==2&&console.warn("THREE.GLTFExporter: Light decay may be lost. glTF is physically-based, and expects light.decay=2."),e.target&&(e.target.parent!==e||e.target.position.x!==0||e.target.position.y!==0||e.target.position.z!==-1)&&console.warn("THREE.GLTFExporter: Light direction may be lost. For best results, make light.target a child of the light with position 0,0,-1."),r[this.name]||(s.extensions=s.extensions||{},s.extensions[this.name]={lights:[]},r[this.name]=!0);let a=s.extensions[this.name].lights;a.push(o),t.extensions=t.extensions||{},t.extensions[this.name]={light:a.length-1}}},Wh=class{constructor(e){this.writer=e,this.name="KHR_materials_unlit"}async writeMaterialAsync(e,t){if(!e.isMeshBasicMaterial)return;let s=this.writer.extensionsUsed;t.extensions=t.extensions||{},t.extensions[this.name]={},s[this.name]=!0,t.pbrMetallicRoughness.metallicFactor=0,t.pbrMetallicRoughness.roughnessFactor=.9}},Xh=class{constructor(e){this.writer=e,this.name="KHR_materials_clearcoat"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.clearcoat===0)return;let n=this.writer,s=n.extensionsUsed,r={};if(r.clearcoatFactor=e.clearcoat,e.clearcoatMap){let o={index:await n.processTextureAsync(e.clearcoatMap),texCoord:e.clearcoatMap.channel};n.applyTextureTransform(o,e.clearcoatMap),r.clearcoatTexture=o}if(r.clearcoatRoughnessFactor=e.clearcoatRoughness,e.clearcoatRoughnessMap){let o={index:await n.processTextureAsync(e.clearcoatRoughnessMap),texCoord:e.clearcoatRoughnessMap.channel};n.applyTextureTransform(o,e.clearcoatRoughnessMap),r.clearcoatRoughnessTexture=o}if(e.clearcoatNormalMap){let o={index:await n.processTextureAsync(e.clearcoatNormalMap),texCoord:e.clearcoatNormalMap.channel};e.clearcoatNormalScale.x!==1&&(o.scale=e.clearcoatNormalScale.x),n.applyTextureTransform(o,e.clearcoatNormalMap),r.clearcoatNormalTexture=o}t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Yh=class{constructor(e){this.writer=e,this.name="KHR_materials_dispersion"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.dispersion===0)return;let s=this.writer.extensionsUsed,r={};r.dispersion=e.dispersion,t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},qh=class{constructor(e){this.writer=e,this.name="KHR_materials_iridescence"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.iridescence===0)return;let n=this.writer,s=n.extensionsUsed,r={};if(r.iridescenceFactor=e.iridescence,e.iridescenceMap){let o={index:await n.processTextureAsync(e.iridescenceMap),texCoord:e.iridescenceMap.channel};n.applyTextureTransform(o,e.iridescenceMap),r.iridescenceTexture=o}if(r.iridescenceIor=e.iridescenceIOR,r.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],r.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1],e.iridescenceThicknessMap){let o={index:await n.processTextureAsync(e.iridescenceThicknessMap),texCoord:e.iridescenceThicknessMap.channel};n.applyTextureTransform(o,e.iridescenceThicknessMap),r.iridescenceThicknessTexture=o}t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},$h=class{constructor(e){this.writer=e,this.name="KHR_materials_transmission"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.transmission===0)return;let n=this.writer,s=n.extensionsUsed,r={};if(r.transmissionFactor=e.transmission,e.transmissionMap){let o={index:await n.processTextureAsync(e.transmissionMap),texCoord:e.transmissionMap.channel};n.applyTextureTransform(o,e.transmissionMap),r.transmissionTexture=o}t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},jh=class{constructor(e){this.writer=e,this.name="KHR_materials_volume"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.transmission===0)return;let n=this.writer,s=n.extensionsUsed,r={};if(r.thicknessFactor=e.thickness,e.thicknessMap){let o={index:await n.processTextureAsync(e.thicknessMap),texCoord:e.thicknessMap.channel};n.applyTextureTransform(o,e.thicknessMap),r.thicknessTexture=o}e.attenuationDistance!==1/0&&(r.attenuationDistance=e.attenuationDistance),r.attenuationColor=e.attenuationColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Zh=class{constructor(e){this.writer=e,this.name="KHR_materials_ior"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.ior===1.5)return;let s=this.writer.extensionsUsed,r={};r.ior=e.ior,t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Kh=class{constructor(e){this.writer=e,this.name="KHR_materials_specular"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.specularIntensity===1&&e.specularColor.equals(Lb)&&!e.specularIntensityMap&&!e.specularColorMap)return;let n=this.writer,s=n.extensionsUsed,r={};if(e.specularIntensityMap){let o={index:await n.processTextureAsync(e.specularIntensityMap),texCoord:e.specularIntensityMap.channel};n.applyTextureTransform(o,e.specularIntensityMap),r.specularTexture=o}if(e.specularColorMap){let o={index:await n.processTextureAsync(e.specularColorMap),texCoord:e.specularColorMap.channel};n.applyTextureTransform(o,e.specularColorMap),r.specularColorTexture=o}r.specularFactor=e.specularIntensity,r.specularColorFactor=e.specularColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Jh=class{constructor(e){this.writer=e,this.name="KHR_materials_sheen"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.sheen==0)return;let n=this.writer,s=n.extensionsUsed,r={};if(e.sheenRoughnessMap){let o={index:await n.processTextureAsync(e.sheenRoughnessMap),texCoord:e.sheenRoughnessMap.channel};n.applyTextureTransform(o,e.sheenRoughnessMap),r.sheenRoughnessTexture=o}if(e.sheenColorMap){let o={index:await n.processTextureAsync(e.sheenColorMap),texCoord:e.sheenColorMap.channel};n.applyTextureTransform(o,e.sheenColorMap),r.sheenColorTexture=o}r.sheenRoughnessFactor=e.sheenRoughness,r.sheenColorFactor=e.sheenColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Qh=class{constructor(e){this.writer=e,this.name="KHR_materials_anisotropy"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.anisotropy==0)return;let n=this.writer,s=n.extensionsUsed,r={};if(e.anisotropyMap){let o={index:await n.processTextureAsync(e.anisotropyMap)};n.applyTextureTransform(o,e.anisotropyMap),r.anisotropyTexture=o}r.anisotropyStrength=e.anisotropy,r.anisotropyRotation=e.anisotropyRotation,t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},eu=class{constructor(e){this.writer=e,this.name="KHR_materials_emissive_strength"}async writeMaterialAsync(e,t){if(!e.isMeshStandardMaterial||e.emissiveIntensity===1)return;let s=this.writer.extensionsUsed,r={};r.emissiveStrength=e.emissiveIntensity,t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},tu=class{constructor(e){this.writer=e,this.name="EXT_materials_bump"}async writeMaterialAsync(e,t){if(!e.isMeshStandardMaterial||e.bumpScale===1&&!e.bumpMap)return;let n=this.writer,s=n.extensionsUsed,r={};if(e.bumpMap){let o={index:await n.processTextureAsync(e.bumpMap),texCoord:e.bumpMap.channel};n.applyTextureTransform(o,e.bumpMap),r.bumpTexture=o}r.bumpFactor=e.bumpScale,t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},nu=class{constructor(e){this.writer=e,this.name="EXT_mesh_gpu_instancing"}writeNode(e,t){if(!e.isInstancedMesh)return;let n=this.writer,s=e,r=new Float32Array(s.count*3),o=new Float32Array(s.count*4),a=new Float32Array(s.count*3),l=new Ne,c=new N,u=new dt,d=new N;for(let f=0;f<s.count;f++)s.getMatrixAt(f,l),l.decompose(c,u,d),c.toArray(r,f*3),u.toArray(o,f*4),d.toArray(a,f*3);let h={TRANSLATION:n.processAccessor(new Be(r,3)),ROTATION:n.processAccessor(new Be(o,4)),SCALE:n.processAccessor(new Be(a,3))};s.instanceColor&&(h._COLOR_0=n.processAccessor(s.instanceColor)),t.extensions=t.extensions||{},t.extensions[this.name]={attributes:h},n.extensionsUsed[this.name]=!0,n.extensionsRequired[this.name]=!0}};Ni.Utils={insertKeyframe:function(i,e){let n=i.getValueSize(),s=new i.TimeBufferType(i.times.length+1),r=new i.ValueBufferType(i.values.length+n),o=i.createInterpolant(new i.ValueBufferType(n)),a;if(i.times.length===0){s[0]=e;for(let l=0;l<n;l++)r[l]=0;a=0}else if(e<i.times[0]){if(Math.abs(i.times[0]-e)<.001)return 0;s[0]=e,s.set(i.times,1),r.set(o.evaluate(e),0),r.set(i.values,n),a=0}else if(e>i.times[i.times.length-1]){if(Math.abs(i.times[i.times.length-1]-e)<.001)return i.times.length-1;s[s.length-1]=e,s.set(i.times,0),r.set(i.values,0),r.set(o.evaluate(e),i.values.length),a=s.length-1}else for(let l=0;l<i.times.length;l++){if(Math.abs(i.times[l]-e)<.001)return l;if(i.times[l]<e&&i.times[l+1]>e){s.set(i.times.slice(0,l+1),0),s[l+1]=e,s.set(i.times.slice(l+1),l+2),r.set(i.values.slice(0,(l+1)*n),0),r.set(o.evaluate(e),(l+1)*n),r.set(i.values.slice((l+1)*n),(l+2)*n),a=l+1;break}}return i.times=s,i.values=r,a},mergeMorphTargetTracks:function(i,e){let t=[],n={},s=i.tracks;for(let r=0;r<s.length;++r){let o=s[r],a=rt.parseTrackName(o.name),l=rt.findNode(e,a.nodeName);if(a.propertyName!=="morphTargetInfluences"||a.propertyIndex===void 0){t.push(o);continue}if(o.createInterpolant!==o.InterpolantFactoryMethodDiscrete&&o.createInterpolant!==o.InterpolantFactoryMethodLinear){if(o.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline)throw new Error("THREE.GLTFExporter: Cannot merge tracks with glTF CUBICSPLINE interpolation.");console.warn("THREE.GLTFExporter: Morph target interpolation mode not yet supported. Using LINEAR instead."),o=o.clone(),o.setInterpolation(Is)}let c=l.morphTargetInfluences.length,u=l.morphTargetDictionary[a.propertyIndex];if(u===void 0)throw new Error("THREE.GLTFExporter: Morph target name not found: "+a.propertyIndex);let d;if(n[l.uuid]===void 0){d=o.clone();let f=new d.ValueBufferType(c*d.times.length);for(let g=0;g<d.times.length;g++)f[g*c+u]=d.values[g];d.name=(a.nodeName||"")+".morphTargetInfluences",d.values=f,n[l.uuid]=d,t.push(d);continue}let h=o.createInterpolant(new o.ValueBufferType(1));d=n[l.uuid];for(let f=0;f<d.times.length;f++)d.values[f*c+u]=h.evaluate(d.times[f]);for(let f=0;f<o.times.length;f++){let g=this.insertKeyframe(d,o.times[f]);d.values[g*c+u]=o.values[f]}}return i.tracks=t,i},toTypedBufferAttribute:function(i,e){let t=new Be(new e(i.count*i.itemSize),i.itemSize,!1);if(!i.normalized&&!i.isInterleavedBufferAttribute)return t.array.set(i.array),t;for(let n=0,s=i.count;n<s;n++)for(let r=0;r<i.itemSize;r++)t.setComponent(n,r,i.getComponent(n,r));return t}};var su=1,Vb="3D Avatar Maker (Marinara Engine)",Hp="Body, hair, skin and clothing: MakeHuman base mesh and system assets (CC0 1.0), and parts made in Blender by ThatOneCan (CC0 1.0).",Gp=`${Hp} No credit required.`;function iu(i){let e=Al(i);return e.length?`${Hp} From wardrobe packs: ${e.join("; ")}`:Gp}var Wp=1179937895,Xp=1313821514,Yp=5130562;function qp(i){let e=i instanceof Uint8Array?i:new Uint8Array(i),t=new DataView(e.buffer,e.byteOffset,e.byteLength);if(e.byteLength<20||t.getUint32(0,!0)!==Wp||t.getUint32(4,!0)!==2)throw new Error("This isn't a .glb file.");let n=null,s=null;for(let r=12;r+8<=e.byteLength;){let o=t.getUint32(r,!0),a=t.getUint32(r+4,!0),l=e.subarray(r+8,r+8+o);a===Xp&&!n?n=JSON.parse(new TextDecoder().decode(l)):a===Yp&&!s&&(s=l),r+=8+o}if(!n)throw new Error("This .glb file has no description in it.");return{json:n,bin:s}}function Hb(i,e=null){let t=(l,c)=>{let u=new Uint8Array(Math.ceil(l.byteLength/4)*4).fill(c);return u.set(l),u},n=t(new TextEncoder().encode(JSON.stringify(i)),32),s=e?t(e,0):null,r=20+n.byteLength+(s?8+s.byteLength:0),o=new Uint8Array(r),a=new DataView(o.buffer);if(a.setUint32(0,Wp,!0),a.setUint32(4,2,!0),a.setUint32(8,r,!0),a.setUint32(12,n.byteLength,!0),a.setUint32(16,Xp,!0),o.set(n,20),s){let l=20+n.byteLength;a.setUint32(l,s.byteLength,!0),a.setUint32(l+4,Yp,!0),o.set(s,l+8)}return o}function Gb(i,e){let t=i.index.array,n=new Int32Array(i.attributes.position.count).fill(-1),s=[],r=[],o=0;for(let c of e){let u=s.length;for(let d=c.start;d<c.start+c.count;d++){let h=t[d];n[h]<0&&(n[h]=o++),s.push(n[h])}s.length>u&&r.push({start:u,count:s.length-u,materialIndex:c.materialIndex})}let a=c=>{let u=c.itemSize,d=new c.array.constructor(o*u);for(let f=0;f<n.length;f++){let g=n[f];if(!(g<0))for(let y=0;y<u;y++)d[g*u+y]=c.array[f*u+y]}let h=new Be(d,u,c.normalized);return h.name=c.name,h},l=new Rt;for(let[c,u]of Object.entries(i.attributes)){let d=a(u);if(c==="normal")for(let h=0;h<d.array.length;h+=3){let f=Math.hypot(d.array[h],d.array[h+1],d.array[h+2])||1;d.array[h]/=f,d.array[h+1]/=f,d.array[h+2]/=f}l.setAttribute(c,d)}for(let[c,u]of Object.entries(i.morphAttributes))l.morphAttributes[c]=u.map(a);l.morphTargetsRelative=i.morphTargetsRelative,l.setIndex(o>65535?new Hi(s,1):new rn(s,1));for(let c of r)l.addGroup(c.start,c.count,c.materialIndex);return{geometry:l,vertices:o,triangles:s.length/3}}function Wb(i,e){let t=i.alphaTest>=.5;return new Rr({name:e,map:i.map??null,color:i.color,vertexColors:i.vertexColors,roughness:.9,metalness:0,side:i.side===Dt?Dt:On,alphaTest:t?i.alphaTest:0,transparent:!t&&i.transparent,depthWrite:t||!i.transparent})}function Xb(i,e){let{bones:t,boneInverses:n}=e.skeleton,s=e.matrixWorld.clone().multiply(e.bindMatrixInverse),r=t.map((y,m)=>new Ne().multiplyMatrices(y.matrixWorld,n[m]).premultiply(s).multiply(e.bindMatrix)),{position:o,normal:a,skinIndex:l,skinWeight:c}=i.attributes,u=new Float32Array(o.count*3),d=a?new Float32Array(a.count*3):null,h=new Float32Array(16),f=i.morphAttributes.position??[],g=f.map(y=>new Float32Array(y.array.length));for(let y=0;y<o.count;y++){h.fill(0);for(let C=0;C<4;C++){let I=c.getComponent(y,C);if(!I)continue;let L=l.getComponent(y,C),B=r[L].elements;for(let P=0;P<16;P++)h[P]+=I*B[P]}let[m,p,x]=[o.getX(y),o.getY(y),o.getZ(y)];if(u[y*3]=h[0]*m+h[4]*p+h[8]*x+h[12],u[y*3+1]=h[1]*m+h[5]*p+h[9]*x+h[13],u[y*3+2]=h[2]*m+h[6]*p+h[10]*x+h[14],f.forEach((C,I)=>{let[L,B,P]=[C.getX(y),C.getY(y),C.getZ(y)];g[I][y*3]=h[0]*L+h[4]*B+h[8]*P,g[I][y*3+1]=h[1]*L+h[5]*B+h[9]*P,g[I][y*3+2]=h[2]*L+h[6]*B+h[10]*P}),!d)continue;let[M,v,S]=[a.getX(y),a.getY(y),a.getZ(y)],A=h[0]*M+h[4]*v+h[8]*S,E=h[1]*M+h[5]*v+h[9]*S,_=h[2]*M+h[6]*v+h[10]*S,w=Math.hypot(A,E,_)||1;d.set([A/w,E/w,_/w],y*3)}i.setAttribute("position",new Be(u,3)),d&&i.setAttribute("normal",new Be(d,3)),f.length&&(i.morphAttributes.position=f.map((y,m)=>{let p=new Be(g[m],3);return p.name=y.name,p}))}var Yb="https://vrm.dev/licenses/1.0/",qb={avatarPermission:["onlyAuthor","onlySeparatelyLicensedPerson","everyone"],commercialUsage:["personalNonProfit","personalProfit","corporation"],sharing:["none","share","change","changeAndShare"],creditNotation:["required","unnecessary"]},$p=["allowExcessivelyViolentUsage","allowExcessivelySexualUsage","allowPoliticalOrReligiousUsage","allowAntisocialOrHateUsage"];function Ul(i={}){let e={};for(let[t,n]of Object.entries(qb))e[t]=n.includes(i?.[t])?i[t]:n[0];for(let t of $p)e[t]=i?.[t]===!0;return e.author=typeof i?.author=="string"?i.author.trim().slice(0,120):"",e}function $b(i,e,t){let n=Ul(t),s=iu(e)!==Gp;return{name:String(i??"").trim()||"Avatar",version:"1",authors:[n.author||"Unknown"],licenseUrl:Yb,avatarPermission:n.avatarPermission,commercialUsage:n.commercialUsage,allowRedistribution:n.sharing==="share"||n.sharing==="changeAndShare",modification:{change:"allowModification",changeAndShare:"allowModificationRedistribution"}[n.sharing]??"prohibited",creditNotation:s?"required":n.creditNotation,...Object.fromEntries($p.map(r=>[r,n[r]])),thirdPartyLicenses:iu(e)}}var jb=new Set(["happy","angry","sad","relaxed","surprised"]),Dl={sideways:20,up:11,down:14};function Zb(i,e,t){let n=new Map;for(let d of i.skins??[])for(let h of d.joints)n.has(i.nodes[h].name)||n.set(i.nodes[h].name,h);let s={};for(let[d,h]of Object.entries(Cn))n.has(h)&&(s[d]={node:n.get(h)});let r={specVersion:"1.0",meta:t,humanoid:{humanBones:s}},o={};i.nodes.forEach((d,h)=>{(d.mesh===void 0?null:i.meshes[d.mesh].extras?.targetNames)?.forEach((g,y)=>{cl.includes(g)&&(o[g]??={morphTargetBinds:[],isBinary:!1,...jb.has(g)?{overrideBlink:"blend"}:{}},o[g].morphTargetBinds.push({node:h,index:y,weight:1}))})}),Object.keys(o).length&&(r.expressions={preset:o});let[a,l]=[e.bones.get("eye_l"),e.bones.get("eye_r")];if(s.leftEye&&s.rightEye&&a&&l&&e.humanoid.head){let d=a.getWorldPosition(new N).add(l.getWorldPosition(new N)).multiplyScalar(.5),h=e.humanoid.head.worldToLocal(d),f=g=>({inputMaxValue:90,outputScale:g});r.lookAt={type:"bone",offsetFromHeadBone:h.toArray().map(g=>Math.round(g*1e5)/1e5),rangeMapHorizontalInner:f(Dl.sideways),rangeMapHorizontalOuter:f(Dl.sideways),rangeMapVerticalDown:f(Dl.down),rangeMapVerticalUp:f(Dl.up)}}i.extensions={...i.extensions,VRMC_vrm:r};let c=new Set(i.extensionsUsed??[]).add("VRMC_vrm"),u=(e.springs??[]).map(d=>({...d,bones:d.bones.filter(h=>n.has(h.name))})).filter(d=>d.bones.length>1);if(u.length){let d=p=>Math.round(p*1e5)/1e5,h=[...new Set(u.flatMap(p=>p.colliders))].filter(p=>n.has(p.bone.name)),f=h.map(({bone:p,radius:x,offset:M,tail:v})=>{let S={offset:M.toArray().map(d),radius:d(x)};return{node:n.get(p.name),shape:v?{capsule:{...S,tail:v.toArray().map(d)}}:{sphere:S}}}),g=[],y=new Map,m=u.map(({name:p,bones:x,joint:M,colliders:v})=>{let S=v.map(E=>h.indexOf(E)).filter(E=>E>=0),A=S.join();return S.length&&!y.has(A)&&(y.set(A,g.length),g.push({name:`Colliders for ${p}`,colliders:S})),{name:p,joints:x.map(E=>({node:n.get(E.name),...M})),...S.length?{colliderGroups:[y.get(A)]}:{}}});i.extensions.VRMC_springBone={specVersion:"1.0",colliders:f,colliderGroups:g,springs:m},c.add("VRMC_springBone")}i.extensionsUsed=[...c]}function jp(i,e={}){return Kp(i,e,null)}function Zp(i,{terms:e,...t}={}){return Kp(i,t,e??{})}async function Kp(i,{look:e={},name:t="",maxTextureSize:n=2048}={},s){await Sf();let r=s!==null;r?tr(i):Vn(i);let o=[...i.root.children],a=i.meshes.map(g=>g.morphTargetInfluences?.slice());for(let g of i.meshes)g.morphTargetInfluences?.fill(0);let l=[],c=[],u=new Map,d=new Map,h=0,f=0;try{if(i.meshes.forEach((x,M)=>{let v=Array.isArray(x.material)?x.material:[x.material],S=Array.isArray(x.material)?x.geometry.groups.map(({start:_,count:w,materialIndex:C})=>({start:_,count:w,materialIndex:C})):[{start:0,count:x.geometry.index.count,materialIndex:0}],A=Gb(x.geometry,S);r&&Xb(A.geometry,x),h+=A.vertices,f+=A.triangles;let E=v.map((_,w)=>{let C=Wb(_,`${x.name||"part"}-${M}-${w}`);if(C.map){let I=C.transparent||C.alphaTest>0;u.set(C.map,I||u.get(C.map)==="image/png"?"image/png":"image/jpeg")}return C});E.some(_=>_.vertexColors)||A.geometry.deleteAttribute("color"),l.push({mesh:x,geometry:x.geometry,material:x.material}),c.push(A.geometry,...E),x.geometry=A.geometry,x.material=Array.isArray(x.material)?E:E[0]}),r)for(let x of i.meshes){if(x.position.lengthSq()||x.scale.manhattanLength()!==3||x.quaternion.w!==1)throw new Error("A part of the avatar is placed in a way the VRM writer doesn't expect.");i.object.add(x);let{skeleton:M}=x;if(d.has(M))continue;d.set(M,M.boneInverses.map(S=>S.clone()));let v=x.bindMatrix.clone().invert();M.bones.forEach((S,A)=>M.boneInverses[A].copy(S.matrixWorld).invert().multiply(v))}i.object.updateMatrixWorld(!0);let g=new Map([...u.keys()].map(x=>[x,x.userData.mimeType]));for(let[x,M]of u)x.userData.mimeType=M;let y;try{y=await new Ni().parseAsync(i.object,{binary:!0,maxTextureSize:n})}finally{for(let[x,M]of g)M===void 0?delete x.userData.mimeType:x.userData.mimeType=M}let{json:m,bin:p}=qp(y);return m.asset={...m.asset,generator:Vb,copyright:iu(e)},m.extras={...m.extras,avatarMaker:{format:su,name:String(t??""),look:e}},r&&Zb(m,i,$b(t,e,s)),{bytes:Hb(m,p),vertices:h,triangles:f}}finally{for(let{mesh:g,geometry:y,material:m}of l)g.geometry=y,g.material=m;for(let g of c)g.dispose();i.meshes.forEach((g,y)=>a[y]&&g.morphTargetInfluences.splice(0,a[y].length,...a[y]));for(let[g,y]of d)y.forEach((m,p)=>g.boneInverses[p].copy(m));if(r){for(let g of i.meshes)g.parent!==i.root&&i.root.add(g);i.root.children.splice(0,i.root.children.length,...o),Vn(i)}}}function Jp(i){try{let e=qp(i).json.extras?.avatarMaker;return e&&typeof e.look=="object"&&e.look?{name:String(e.name??""),look:e.look}:null}catch{return null}}var Kb=1,em="avatar-pack.json",Jb=/^(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.pack\.png$/u,Qb=["male","female"],eS=/^(?:CC0-1\.0|CC-BY-[34]\.0)$/u,tS=500,nS=100,iS=.3,ii=(i,e)=>typeof i=="string"&&i.trim()&&i.length<=e?i.trim():null,sS=i=>Number.isInteger(i)&&i>=0&&i<=16777215,tm=(i,e)=>Array.isArray(i)&&i.every(t=>e.includes(t)),nm=(i,e)=>{let t=ii(i.version,40);return`/api/capability-packages/${i.id}/assets/${e}${t?`?v=${encodeURIComponent(t)}`:""}`};function im(i){let e=i?.id;return typeof e=="string"&&/^[a-z0-9-]{1,100}$/u.test(e)&&e.startsWith(`${Kt}-`)&&i.status==="active"&&Array.isArray(i.manifest?.contributions?.assets?.paths)&&i.manifest.contributions.assets.paths.includes(em)}var sm=(i,e)=>im(i)&&e?.format===1&&e.for===Kt&&e.body===Kb;function rm(i,e){if(!e||typeof e!="object")return null;let t=ii(e.label,60),n=ii(e.author,80),s=ii(e.licence,20),r=e.credit===null||e.credit===void 0?null:ii(e.credit,300),o=Array.isArray(e.bodies)?[...new Set(e.bodies)]:[];return t&&n&&eS.test(s??"")&&(s==="CC0-1.0"||r)&&(e.credit===null||e.credit===void 0||r)&&o.length&&tm(o,Qb)&&typeof e.bundle=="string"&&Jb.test(e.bundle)&&i.manifest.contributions.assets.paths.includes(e.bundle)?{label:t,bodies:o,licence:s,author:n,credit:r,url:nm(i,e.bundle)}:null}var om=i=>_l.test(i)&&!(i in Object.prototype)&&!Object.hasOwn(Ut,i)&&!Jt.some(([e])=>e===i);function rS(i,e){if(!sm(i,e))return[];let t=ii(e.name,80)??ii(i.manifest.name,80)??i.id,n=e.pieces&&typeof e.pieces=="object"?Object.entries(e.pieces):[],s=Pi.map(([a])=>a),r=or.map(([a])=>a),o=[];for(let[a,l]of n.slice(0,tS)){if(!om(a)||o.some(d=>d.piece===a))continue;let c=rm(i,l);c&&s.includes(l.slot)&&Number.isInteger(l.layer)&&l.layer>=0&&l.layer<=9&&tm(l.hides,Cp)&&(l.variants===void 0||Array.isArray(l.variants)&&l.variants.every(d=>_l.test(d)))&&(l.bone===void 0||l.bone===null||Ph.includes(l.bone))&&l.parts&&typeof l.parts=="object"&&c.bodies.every(d=>l.parts[d]===void 0||Array.isArray(l.parts[d])&&l.parts[d].every(h=>Array.isArray(h)&&h.length===2&&r.includes(h[0])&&sS(h[1])))&&o.push({piece:a,label:c.label,slot:l.slot,bodies:c.bodies,layer:l.layer,hides:[...l.hides],parts:Object.fromEntries(c.bodies.map(d=>[d,(l.parts[d]??[]).map(([h,f])=>[h,f])])),variants:[],bone:l.bone??null,url:c.url,pack:i.id,packName:t,licence:c.licence,author:c.author,credit:c.credit})}return o}function oS(i,e){if(!sm(i,e)||!e.hair||typeof e.hair!="object")return[];let t=ii(e.name,80)??ii(i.manifest.name,80)??i.id,n=e.pieces&&typeof e.pieces=="object"?e.pieces:{},s=[];for(let[r,o]of Object.entries(e.hair).slice(0,nS)){if(!om(r)||Object.hasOwn(n,r)||s.some(c=>c.style===r))continue;let a=rm(i,o),l=o?.swing??null;!a||!(l===null||Number.isFinite(l)&&l>=0&&l<=iS)||s.push({style:r,label:a.label,bodies:a.bodies,swing:l,url:a.url,pack:i.id,packName:t,licence:a.licence,author:a.author,credit:a.credit})}return s}var Qp=null;function am(){return Qp??=(async()=>{try{let i=await cr("/api/capability-packages/installed",1e4),e=(Array.isArray(i)?i:[]).filter(im).sort((s,r)=>s.id.localeCompare(r.id)),t=await Promise.all(e.map(s=>cr(nm(s,em),1e4))),n=[];return e.forEach((s,r)=>{let o=rS(s,t[r]);$f(o);let a=oS(s,t[r]);jf(a),n.push(...o,...a)}),n}catch(i){return console.warn(`[${Kt}] the wardrobe packs couldn't be read`,i),[]}})(),Qp}var aS={avatarPermission:[["onlyAuthor","Only the author"],["onlySeparatelyLicensedPerson","Only people the author allows"],["everyone","Anyone"]],commercialUsage:[["personalNonProfit","Personal use, not for money"],["personalProfit","Personal use, including for money"],["corporation","Any use, including by companies"]],sharing:[["none","Don't share it or change it"],["share","May share it as it is"],["change","May change it, but not share the changed one"],["changeAndShare","May change it and share the changed one"]],creditNotation:[["required","Required"],["unnecessary","Not needed"]]},lS=[["allowExcessivelyViolentUsage","excessively violent use"],["allowExcessivelySexualUsage","excessively sexual use"],["allowPoliticalOrReligiousUsage","political or religious use"],["allowAntisocialOrHateUsage","hateful or antisocial use"]],cS=[["start","Start"],["body","Body"],["face","Face"],["skin","Skin and eyes"],["hair","Hair"],["clothes","Clothes"],["save","Save"]];function ce(i,e={},...t){let n=document.createElement(i);for(let[s,r]of Object.entries(e??{}))r==null||r===!1||(s.startsWith("on")?n.addEventListener(s.slice(2),r):s==="class"?n.className=r:s in n&&s!=="list"?n[s]=r:n.setAttribute(s,r===!0?"":r));for(let s of t.flat())s!=null&&s!==!1&&n.append(s);return n}var hS=0,hm=()=>`am-${++hS}`,ru=(i,e)=>i.find(([t])=>t===e)?.[1]??e;function yt(i,e,t=""){let n=e.id||(e.id=hm());return ce("div",{class:"row"},ce("label",{class:"name",htmlFor:n,title:t||void 0},i),ce("div",{},e,t?ce("div",{class:"ends"},ce("span",{},t)):null))}function vt(i,e,t,n){let s=ce("select",{"aria-label":n,onchange:()=>t(s.value)});for(let[r,o]of i)s.append(new Option(o,r,!1,r===e));return s}function lm({name:i,says:e,ends:t,least:n,most:s,step:r=.01,at:o,onInput:a}){let l=hm(),c=ce("input",{id:l,type:"range",min:n,max:s,step:r,value:o,"aria-describedby":`${l}-says`,oninput:()=>a(Number(c.value))});return ce("div",{class:"row"},ce("label",{class:"name",htmlFor:l,title:e},i),ce("div",{},c,ce("div",{class:"ends",id:`${l}-says`},ce("span",{},t?.[0]??""),ce("span",{},t?.[1]??""))))}function Di(i,e,t,n,s=""){let r=ce("div",{class:"swatches",role:"group","aria-label":i});for(let[a,l]of e)r.append(ce("button",{class:"swatch",type:"button",title:l,"aria-label":`${i}: ${l}`,"aria-pressed":String(a===t),style:`background:${Oh(a)}`,onclick:()=>n(a,!0)}));let o=ce("input",{type:"color",value:Oh(t??e[0]?.[0]??8421504),title:`${i}: a colour of your own`,"aria-label":`${i}: a colour of your own`,oninput:()=>n(vp(o.value),!1)});return r.append(o),ce("div",{class:"row"},ce("span",{class:"name",title:s||void 0},i),ce("div",{},r,s?ce("div",{class:"ends"},ce("span",{},s)):null))}var cm=(i,e)=>{let t=Object.hasOwn(i,e)?i[e]:null;return t?ce("p",{class:"says"},`From ${t.packName}, by ${t.author}${t.credit?` (${t.licence.replace(/-/gu," ")})`:""}.`):null},Tt=(i,e,...t)=>ce("section",{class:"group"},ce("h2",{},i),e?ce("p",{class:"says"},e):null,...t);function um(i){let e=ce("div",{class:"tabs",role:"tablist","aria-label":"Avatar sections"}),t=ce("div",{class:"body",role:"tabpanel",tabIndex:0}),n=ce("section",{class:"panel","aria-label":"Avatar controls"},e,t),s={text:"",bad:!1},r=null,o=(p,x=!0)=>i.onChange(p,{redraw:x}),a={start:({filled:p})=>[Tt("Start from a ready-made look","A preset sets the body and its shape. Everything can be changed afterwards.",yt("Preset",vt([["","Choose one…"],...Dh.map((x,M)=>[String(M),x.name])],"",x=>{let M=Dh[Number(x)];x!==""&&M&&i.onNew(M.look)},"Start from a preset")),ce("div",{class:"swatches"},ce("button",{type:"button",onclick:()=>i.onNew({body:"female"})},"New female avatar"),ce("button",{type:"button",onclick:()=>i.onNew({body:"male"})},"New male avatar"))),Tt("Style","A starting point for the face and head. It sets the Face tab's sliders, so everything stays adjustable. An anime drawing style (flat shading and outlines) is planned for the saved file.",yt("Style",vt([["","Choose one…"],...vl.map(([x,M])=>[x,M])],"",x=>{let M=vl.find(([S])=>S===x);if(!M)return;let v=Object.fromEntries(kf.map(S=>[S,0]));o({shape:{...v,...M[3].shape},limbs:M[3].limbs})},"Style"),vl.map(([,x,M])=>`${x}: ${M}`).join(" "))),Tt("Where this avatar is",`Body: ${ru(xl,p.body)}. Your work is kept in this browser as you go. Use the Save tab to keep it as a file.`)],body:({filled:p,choices:x})=>[Tt("Body","",yt("Body",vt(xl,p.body,M=>o({body:M}),"Body"),"Each body has its own hair fits, underwear and some clothes."),yt("Race",vt([["","Choose one…"],...Rn.filter(([M])=>x.races.includes(M)).map(([M,v])=>[M,v])],"",M=>{if(!M)return;let v=Of(M,p.body);o({...v,shape:v.shape,limbs:v.limbs,colours:v.colours??{}})},"Start from a race"),"A preset: it sets the race sliders below, height, limb lengths and that race's usual extras. Change any of them after."),yt("Age",vt(Eh,p.age,M=>o({age:M}),"Age"),"Changes the body's shape and the skin picture."),u({name:"Height",says:"The whole figure, taller or shorter.",ends:["Short","Tall"],least:Ei[0],most:Ei[1],at:p.height,onInput:M=>o({height:M},!1)})),d("race","Race features","Each race's build and face, mixed as you like. A race chosen above sets these.",...Ci.filter(([M])=>sr(M,x.keys,p.body)).map(M=>f(M,p,x))),Tt("Build","The middle of each slider is the body's own shape.",...ss.filter(([M])=>sr(M,x.keys,p.body)).map(M=>f(M,p,x))),...Bf.map(([M,v,S])=>{let A=Ii.filter(([E,,,,,,_])=>_===M&&sr(E,x.keys,p.body));return A.length?d(`body-${M}`,v,S,...A.map(E=>f(E,p,x)),ce("button",{type:"button",onclick:()=>o({shape:Object.fromEntries(A.map(([E])=>[E,0]))})},`Back to the ${v.toLowerCase()} as made`)):null}),Tt("Proportions","",...rr.map(([M,v,S,A,E,_])=>u({name:v,says:E,ends:_,least:S,most:A,step:.005,at:p.limbs[M],onInput:w=>o({limbs:{[M]:w}},!1)})))],face:({filled:p,choices:x})=>[Tt("Face shape","The face's overall shape. Each part of the face has more below.",h("shape","Face outline"),...Ri.filter(([M])=>sr(M,x.keys,p.body)).map(M=>f(M,p,x))),...Ff.map(([M,v,S])=>{let A=In.filter(([E,,,,,,_])=>_===M&&sr(E,x.keys,p.body));return A.length?d(M,v,S,Mh[M]?h(M,"Ready-made"):null,...A.map(E=>f(E,p,x)),ce("button",{type:"button",onclick:()=>o({shape:Object.fromEntries(wh(M).map(E=>[E,0]))})},`Back to the ${v.toLowerCase()} as made`)):null}),Tt("Brows and lashes","",yt("Brows",vt(x.brows.map(M=>[String(M),Wf[M]??`Style ${M}`]),String(p.brows),M=>o({brows:Number(M)}),"Brow style")),yt("Lashes",vt(x.lashes.map(M=>[String(M),Xf[M]??`Style ${M}`]),String(p.lashes),M=>o({lashes:Number(M)}),"Lash style")),Di("Brow colour",ns,p.colours.brows,(M,v)=>o({colours:{brows:M}},v))),Tt("Accessories","Anyone can wear any of these, whatever their race.",...ir.filter(([M])=>(x[M]??[]).length).map(([M,v,S,A])=>yt(S,vt(v.filter(([E])=>E===xt||x[M].includes(E)),p[M],E=>o({[M]:E}),S),A)),p.horns!==xt?Di("Horn colour",rs,p.colours.horns,(M,v)=>o({colours:{horns:M}},v)):null,x.tail?yt("Tail",vt([["no","No tail"],["yes","A tiefling's tail"]],p.tail?"yes":"no",M=>o({tail:M==="yes"}),"Tail")):null)],skin:({filled:p})=>[Tt("Skin","",yt("Skin",vt(Sl(p.body),p.skin,x=>o({skin:x}),"Skin"),"A skin picture, or the plain skin in a colour of your own."),p.skin==="custom"?Di("Skin colour",ei,p.colours.skin,(x,M)=>o({skin:"custom",colours:{skin:x}},M)):null),Tt("Eyes","",yt("Eyes",vt([[Hn,"A colour of your own"],...Kr],p.eyePicture,x=>o({eyePicture:x}),"Eyes"),"A pictured eye, or the grey iris in a colour."),p.eyePicture===Hn?Di("Eye colour",Qr,p.colours.eyes,(x,M)=>o({colours:{eyes:x}},M)):null),Tt("Lips and nails","Left alone, each colour follows the skin.",yt("Fingernails",vt(Ml,p.nails,x=>o({nails:x}),"Fingernails"),"Their length, or none. Gloves hide them."),yt("Toenails",vt([["on","On"],["off","Off"]],p.toenails?"on":"off",x=>o({toenails:x==="on"}),"Toenails"),"Shoes hide them."),...Ch.filter(([x])=>x==="lips"||x==="nails").map(([x,M,v,S])=>Di(M,v,p.colours[x],(A,E)=>o({colours:{[x]:A}},E),S)),ce("button",{type:"button",onclick:()=>o({colours:{lips:void 0,nails:void 0}})},"Back to the skin's own lips and nails"))],hair:({look:p,filled:x,choices:M})=>[Tt("Hair","",so(p).hair?ce("p",{class:"says"},ro({...p,clothes:[]}).join(" ")):null,yt("Style",vt(Jt.filter(([v])=>M.hair.includes(v)),x.hair,v=>o({hair:v}),"Hair style"),"A hood or helm that covers the head hides the hair."),cm(ln,x.hair),Di("Hair colour",ns,x.hairColour,(v,S)=>o({hairTint:v,hairColour:void 0},S)))],clothes:({look:p,filled:x,choices:M})=>{let v=so(p).clothes,S=new Map(Pi.map(([_])=>[_,[]]));for(let _ of M.clothes)S.get(_.slot)?.push(_);let A=new Set(x.clothes),E=(_,w)=>{let C=x.clothes.filter(I=>S.get(_).every(L=>L.piece!==I));o({clothes:w?[...C,w]:C})};return[v.length?Tt("Not shown","Pieces from a wardrobe pack that isn't installed. They stay in the look and come back when the pack is installed again; a saved avatar leaves them out.",...v.map(_=>ce("div",{class:"piece"},ce("p",{class:"says"},ro({clothes:[_],fromPacks:p.fromPacks}).join(" ")),ce("button",{type:"button",onclick:()=>o({clothes:x.clothes.filter(w=>w!==_)})},"Take it out of the look")))):null,Tt("Ready-made outfits","Changes the clothes only.",yt("Outfit",vt([["","Choose one…"],...oo.map((_,w)=>[String(w),_.name]),["none","Nothing on"]],"",_=>{_==="none"?o({clothes:[],clothColours:void 0,variants:void 0}):_!==""&&o(g(Tl(oo[Number(_)],x.body)))},"Put on a ready-made outfit"))),Tt("Underwear","Hidden by whatever is worn over it.",M.tops.length?yt("Top",vt([[xt,"None"],...to.filter(([_])=>M.tops.includes(_))],x.underwear.top,_=>o({underwear:{top:_}}),"Underwear top")):null,yt("Bottom",vt([[xt,"None"],...no.filter(([_])=>M.bottoms.includes(_))],x.underwear.bottom,_=>o({underwear:{bottom:_}}),"Underwear bottom")),Di("Colour",eo,x.colours.underwear,(_,w)=>o({colours:{underwear:_}},w))),Tt("Clothes and armour","One piece in each place. Pieces further down the list are worn over the ones above where they overlap.",...Pi.filter(([_])=>S.get(_).length).map(([_,w,C])=>{let I=S.get(_),L=I.find(D=>A.has(D.piece)),B=yt(w,vt([["","None"],...I.map(D=>[D.piece,ru(io,D.piece)])],L?.piece??"",D=>E(_,D),w),C);if(!L)return B;let P=Lh[L.piece];return ce("div",{class:"piece"},B,cm(Qn,L.piece),P&&L.variants?.length?yt(P.label,vt(P.ways,x.variants[L.piece]??"",D=>o({variants:{[L.piece]:D||void 0}}),P.label),P.says):null,...L.parts.map(([D,Y])=>Di(ru(or,D),ar,x.clothColours[L.piece]?.[D]??Y,(G,ne)=>o({clothColours:{[L.piece]:{...x.clothColours[L.piece],[D]:G}}},ne))))}))]},save:({exported:p,terms:x,look:M})=>[Tt("Keep working on it later","A small file with every choice you made. Open it here again to carry on.",ce("div",{class:"swatches"},ce("button",{type:"button",onclick:i.onSaveLook},"Save the look (.json)"),ce("button",{type:"button",onclick:i.onOpen},"Open a look or avatar…"))),Tt("Save as a 3D avatar","A file with the body, hair, clothes and pictures in it, which also remembers your choices so it can be opened here again. A VRM stands in a T-pose, names its bones for any VRM app, carries the terms below, and swings long hair and a tail as the avatar moves. A GLB is a plain 3D model.",yt("Picture size",l=vt([["2048","Full (sharpest, largest file)"],["1024","Half (smaller file, good for phones)"],["512","Quarter (smallest)"]],l?.value??"2048",()=>{},"Picture size"),"How large the skin and clothing pictures are in the file."),ce("div",{class:"swatches"},ce("button",{class:"main",type:"button",onclick:()=>i.onExport({format:"vrm",maxTextureSize:Number(l.value)})},"Save as VRM"),ce("button",{type:"button",onclick:()=>i.onExport({format:"glb",maxTextureSize:Number(l.value)})},"Save as GLB")),p?ce("p",{class:"says"},`Saved ${p.file}: ${(p.bytes/1048576).toFixed(1)} MB, ${p.vertices.toLocaleString()} points, ${p.triangles.toLocaleString()} triangles.`):null),d("terms","The VRM's terms","What you allow others to do with the avatar, written into a VRM file under the VRM Public License 1.0 for the apps that open it. Kept in this browser for every avatar you save. A GLB carries none of this.",yt("Author",ce("input",{type:"text",value:x.author,maxLength:120,placeholder:"Your name or handle","aria-label":"Author",oninput:v=>i.onTerms({author:v.target.value})}),"Who made the avatar. Left empty, the file says Unknown."),...[["avatarPermission","Who may use it","Who may appear as this avatar."],["commercialUsage","Commercial use","Whether it may be used to earn money, and by whom."],["sharing","Sharing","Whether others may pass the file on, or change the avatar."],["creditNotation","Credit",Al(M).length?"Whether whoever uses it must name you. Always required while it wears a CC BY piece or hair style from a wardrobe pack, whose maker must be credited.":"Whether whoever uses it must name you."]].map(([v,S,A])=>yt(S,vt(aS[v],x[v],E=>i.onTerms({[v]:E}),S),A)),ce("p",{class:"says"},"Uses VRM forbids unless allowed:"),...lS.map(([v,S])=>ce("label",{class:"check"},ce("input",{type:"checkbox",checked:x[v],onchange:A=>i.onTerms({[v]:A.target.checked})}),` Allow ${S}`))),Tt("Use it in a chat","The 3D Avatars agent shows the file. It blinks, its mouth moves as it talks, and its face shows how the character feels. In a VRM the eyes move and long hair swings too.",ce("ol",{class:"steps"},ce("li",{},"Open Agents and install 3D Avatars from the Agent Organizer if you haven't."),ce("li",{},"Open 3D Avatars and pick the character or persona."),ce("li",{},"For a .vrm, under Avatar type choose VRM model, then Import VRM. For a .glb, choose GLB or FBX model, then Import GLB or FBX."),ce("li",{},"Turn on Show this avatar in chats, and add 3D Avatars to the chat under Chat Settings → Agents.")))]},l=null,c=new Set(["eyes"]);function u({least:p,most:x,at:M,onInput:v,...S}){let A=_=>_<1?-(1-_)/(1-p):(_-1)/(x-1),E=_=>Math.round((_<0?1+_*(1-p):1+_*(x-1))*1e3)/1e3;return lm({...S,least:-1,most:1,at:A(M),onInput:_=>v(E(_))})}function d(p,x,M,...v){let S=ce("details",{class:"group fold",open:c.has(p),ontoggle:()=>S.open?c.add(p):c.delete(p)},ce("summary",{},x),M?ce("p",{class:"says"},M):null,...v);return S}function h(p,x){let M=Mh[p]??[];return yt(x,vt([["","Choose one…"],...M.map(([v],S)=>[String(S),v])],"",v=>{let S=M[Number(v)];if(!S)return;let A=Object.fromEntries(wh(p).map(E=>[E,0]));o({shape:{...A,...S[1]}})},`${x} for the ${p==="shape"?"face":p}`),"Sets the sliders below; adjust them after.")}function f(p,x,M){let[v,S,,,A,E]=p,_=bl(p,M.keys);return lm({name:S,says:A,ends:E,least:_[0]<0?-1:0,most:1,at:zf(x.shape[v],_),onInput:w=>o({shape:{[v]:Math.round(Vf(w,_)*1e3)/1e3}},!1)})}let g=p=>({clothes:p.clothes??[],clothColours:{$set:p.clothColours??{}},variants:{$set:p.variants??{}}});function y(p){e.replaceChildren(...cS.map(([M,v])=>ce("button",{type:"button",role:"tab",id:`am-tab-${M}`,"aria-selected":String(M===p.tab),onclick:()=>i.onTab(M)},v))),t.setAttribute("aria-labelledby",`am-tab-${p.tab}`);let x=t.scrollTop;r=ce("p",{class:`status${s.bad?" bad":""}`,role:"status","aria-live":"polite"},s.text),t.replaceChildren(r,...(p.filled&&p.choices?a[p.tab](p):[]).filter(Boolean)),t.scrollTop=x}function m(p,x=!1){s={text:p,bad:x},r&&(r.textContent=p,r.className=`status${x?" bad":""}`)}return{element:n,render:y,setStatus:m}}var dm={type:"change"},au={type:"start"},pm={type:"end"},Ol=new Gi,fm=new sn,uS=Math.cos(70*Ki.DEG2RAD),Lt=new N,en=2*Math.PI,lt={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},ou=1e-6,Fl=class extends Dr{constructor(e,t=null){super(e,t),this.state=lt.NONE,this.target=new N,this.cursor=new N,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:bi.ROTATE,MIDDLE:bi.DOLLY,RIGHT:bi.PAN},this.touches={ONE:Si.ROTATE,TWO:Si.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new N,this._lastQuaternion=new dt,this._lastTargetPosition=new N,this._quat=new dt().setFromUnitVectors(e.up,new N(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Gs,this._sphericalDelta=new Gs,this._scale=1,this._panOffset=new N,this._rotateStart=new Fe,this._rotateEnd=new Fe,this._rotateDelta=new Fe,this._panStart=new Fe,this._panEnd=new Fe,this._panDelta=new Fe,this._dollyStart=new Fe,this._dollyEnd=new Fe,this._dollyDelta=new Fe,this._dollyDirection=new N,this._mouse=new Fe,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=fS.bind(this),this._onPointerDown=dS.bind(this),this._onPointerUp=pS.bind(this),this._onContextMenu=bS.bind(this),this._onMouseWheel=_S.bind(this),this._onKeyDown=xS.bind(this),this._onTouchStart=yS.bind(this),this._onTouchMove=vS.bind(this),this._onMouseDown=mS.bind(this),this._onMouseMove=gS.bind(this),this._interceptControlDown=SS.bind(this),this._interceptControlUp=MS.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=lt.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents();let e=this.domElement.getRootNode();e.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),e.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(dm),this.update(),this.state=lt.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){let t=this.object.position;Lt.copy(t).sub(this.target),Lt.applyQuaternion(this._quat),this._spherical.setFromVector3(Lt),this.autoRotate&&this.state===lt.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=en:n>Math.PI&&(n-=en),s<-Math.PI?s+=en:s>Math.PI&&(s-=en),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(Lt.setFromSpherical(this._spherical),Lt.applyQuaternion(this._quatInverse),t.copy(this.target).add(Lt),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){let a=Lt.length();o=this._clampDistance(a*this._scale);let l=a-o;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){let a=new N(this._mouse.x,this._mouse.y,0);a.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;let c=new N(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(a),this.object.updateMatrixWorld(),o=Lt.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(Ol.origin.copy(this.object.position),Ol.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Ol.direction))<uS?this.object.lookAt(this.target):(fm.setFromNormalAndCoplanarPoint(this.object.up,this.target),Ol.intersectPlane(fm,this.target))))}else if(this.object.isOrthographicCamera){let o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>ou||8*(1-this._lastQuaternion.dot(this.object.quaternion))>ou||this._lastTargetPosition.distanceToSquared(this.target)>ou?(this.dispatchEvent(dm),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?en/60*this.autoRotateSpeed*e:en/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Lt.setFromMatrixColumn(t,0),Lt.multiplyScalar(-e),this._panOffset.add(Lt)}_panUp(e,t){this.screenSpacePanning===!0?Lt.setFromMatrixColumn(t,1):(Lt.setFromMatrixColumn(t,0),Lt.crossVectors(this.object.up,Lt)),Lt.multiplyScalar(e),this._panOffset.add(Lt)}_pan(e,t){let n=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;Lt.copy(s).sub(this.target);let r=Lt.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/n.clientHeight,this.object.matrix),this._panUp(2*t*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),s=e-n.left,r=t-n.top,o=n.width,a=n.height;this._mouse.x=s/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(en*this._rotateDelta.x/t.clientHeight),this._rotateUp(en*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(en*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-en*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(en*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-en*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(n,s)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let n=this._getSecondPointerPosition(e),s=.5*(e.pageX+n.x),r=.5*(e.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(en*this._rotateDelta.x/t.clientHeight),this._rotateUp(en*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let o=(e.pageX+t.x)*.5,a=(e.pageY+t.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new Fe,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function dS(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function fS(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function pS(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(pm),this.state=lt.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function mS(i){let e;switch(i.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case bi.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=lt.DOLLY;break;case bi.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=lt.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=lt.ROTATE}break;case bi.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=lt.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=lt.PAN}break;default:this.state=lt.NONE}this.state!==lt.NONE&&this.dispatchEvent(au)}function gS(i){switch(this.state){case lt.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case lt.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case lt.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function _S(i){this.enabled===!1||this.enableZoom===!1||this.state!==lt.NONE||(i.preventDefault(),this.dispatchEvent(au),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(pm))}function xS(i){this.enabled!==!1&&this._handleKeyDown(i)}function yS(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case Si.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=lt.TOUCH_ROTATE;break;case Si.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=lt.TOUCH_PAN;break;default:this.state=lt.NONE}break;case 2:switch(this.touches.TWO){case Si.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=lt.TOUCH_DOLLY_PAN;break;case Si.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=lt.TOUCH_DOLLY_ROTATE;break;default:this.state=lt.NONE}break;default:this.state=lt.NONE}this.state!==lt.NONE&&this.dispatchEvent(au)}function vS(i){switch(this._trackPointer(i),this.state){case lt.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case lt.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case lt.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case lt.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=lt.NONE}}function bS(i){this.enabled!==!1&&i.preventDefault()}function SS(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function MS(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var mm=[["relaxed","Relaxed"],["moving","Moving: looks about, to show the hair swing"],["a","A-pose"],["t","T-pose"]];function gm(i){let e;try{e=new il({canvas:i,antialias:!0,alpha:!0,preserveDrawingBuffer:!1})}catch{return{failed:!0,show(){},setPose(){},setFace(){},view(){},resize(){},dispose(){}}}e.setPixelRatio(Math.min(2,globalThis.devicePixelRatio||1)),e.outputColorSpace=St;let t=new fi;t.add(new Lr(15397631,7364686,1.6));let n=new Hs(16773852,1.9);n.position.set(2,3.2,4);let s=new Hs(13623551,.5);s.position.set(-3,1.5,-2),t.add(n,s);let r=new Yt(new Er(.75,48),new Wi({color:0,transparent:!0,opacity:.16,depthWrite:!1}));r.rotation.x=-Math.PI/2,r.position.y=.002,t.add(r);let o=new Vt(30,1,.01,50),a=new Fl(o,i);a.enableDamping=!0,a.dampingFactor=.12,a.minDistance=.1,a.maxDistance=9,a.maxPolarAngle=Math.PI*.92,a.listenToKeyEvents(i);let l=null,c=null,u=0,d="relaxed",h="lively",f=0,g=!0,y=!1,m=performance.now(),p=globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches,x=new N;function M(){l&&(d==="t"?tr(l):d==="a"?Vn(l):d==="moving"&&!p?Cf(l,(performance.now()-m)/1e3):ph(l,p?0:(performance.now()-m)/1e3))}function v(w="body"){let C=l?l.humanoid.head.getWorldPosition(x).y+.12:1.75;if(w==="face"){let I=l?l.humanoid.head.getWorldPosition(x).y+.06:1.62;a.target.set(0,I,0),o.position.set(.18,I+.02,.95)}else w==="hand"&&l?.humanoid.leftHand?((l.humanoid.leftMiddleProximal??l.humanoid.leftHand).getWorldPosition(x),a.target.copy(x),d==="t"?o.position.set(x.x+.02,x.y+.42,x.z+.12):o.position.set(x.x+.12,x.y+.1,x.z+.42)):w==="feet"&&l?.humanoid.leftToes?(l.humanoid.leftToes.getWorldPosition(x),a.target.set(0,x.y,x.z),o.position.set(.05,x.y+.35,x.z+.45)):(a.target.set(0,C*.52,0),o.position.set(.5,C*.6,Math.max(2.6,C*2.3)));a.update()}function S(){let w=i.clientWidth,C=i.clientHeight;!w||!C||(e.setSize(w,C,!1),o.aspect=w/C,o.updateProjectionMatrix())}function A(){if(f=0,!y){if(g&&document.visibilityState!=="hidden"){let w=performance.now();(d==="relaxed"||d==="moving")&&!p&&M(),a.update(),l&&mf(l,h,(w-m)/1e3,o.position,p),c&&!p&&c.step(u?(w-u)/1e3:0),u=w,e.render(t,o)}f=requestAnimationFrame(A)}}let E=new ResizeObserver(S);E.observe(i);let _=new IntersectionObserver(([w])=>g=w.isIntersecting);return _.observe(i),S(),v("body"),f=requestAnimationFrame(A),{failed:!1,show(w){l&&(t.remove(l.object),l.dispose()),l=w,c=null,l&&(t.add(l.object),M(),c=yp(l))},setPose(w){d=w,M(),c?.reset()},setFace(w){h=w},view:v,resize:S,dispose(){y=!0,f&&cancelAnimationFrame(f),E.disconnect(),_.disconnect(),a.dispose(),l&&(t.remove(l.object),l.dispose(),l=null),r.geometry.dispose(),r.material.dispose(),e.dispose()}}}var _m=`
:host { display: block; width: 100%; height: 100%; }
* { box-sizing: border-box; }
.app {
  --bg: #16181d; --panel: #1f2229; --raised: #2a2e37; --line: #3a3f4b; --text: #e8eaf0; --soft: #a9afbd;
  --accent: #7aa2f7; --accent-text: #0f1320; --warn: #e0af68; --bad: #f7768e;
  position: absolute; inset: 0; display: flex; flex-direction: column; background: var(--bg); color: var(--text);
  font: 14px/1.45 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
@media (prefers-color-scheme: light) {
  .app { --bg: #eef0f4; --panel: #ffffff; --raised: #f1f3f7; --line: #cfd4de; --text: #1c1f26; --soft: #5a6172;
    --accent: #2f5fd0; --accent-text: #ffffff; --warn: #9a6a00; --bad: #c0304a; }
}
header { display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: center; padding: 8px 12px;
  background: var(--panel); border-bottom: 1px solid var(--line); }
header h1 { font-size: 16px; margin: 0 8px 0 0; font-weight: 650; }
header .grow { flex: 1 1 auto; }
label.field { display: inline-flex; gap: 6px; align-items: center; color: var(--soft); }
main { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, 440px); }
.stage { position: relative; min-height: 0; background: radial-gradient(ellipse at 50% 35%, #3b4254 0%, #20242d 70%); }
@media (prefers-color-scheme: light) { .stage { background: radial-gradient(ellipse at 50% 35%, #ffffff 0%, #cfd6e4 75%); } }
.stage canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; outline: none; }
.stage .views { position: absolute; left: 10px; bottom: 10px; display: flex; flex-wrap: wrap; gap: 6px; }
.stage .note { position: absolute; left: 10px; top: 10px; right: 10px; color: var(--text); pointer-events: none;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
.stage .note.bad { color: var(--bad); pointer-events: auto; }
.panel { display: flex; flex-direction: column; min-height: 0; background: var(--panel); border-left: 1px solid var(--line); }
.tabs { display: flex; flex-wrap: wrap; gap: 4px; padding: 8px; border-bottom: 1px solid var(--line); }
.tabs button[aria-selected="true"] { background: var(--accent); color: var(--accent-text); border-color: var(--accent); }
.body { flex: 1 1 auto; min-height: 0; overflow-y: auto; padding: 10px 12px 24px; }
.group { margin: 0 0 16px; }
.group > h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--soft); margin: 0 0 6px; font-weight: 650; }
.says { color: var(--soft); margin: 0 0 8px; }
details.fold { border: 1px solid var(--line); border-radius: 8px; padding: 6px 10px; background: var(--raised); }
details.fold > summary { cursor: pointer; font-weight: 650; padding: 4px 0; list-style-position: inside; }
details.fold[open] > summary { margin-bottom: 6px; }
details.fold > button { margin-top: 4px; }
.row { display: grid; grid-template-columns: 118px minmax(0, 1fr); gap: 6px 10px; align-items: center; margin: 0 0 8px; }
.row > .name { color: var(--text); }
.row .ends { display: flex; justify-content: space-between; color: var(--soft); font-size: 12px; }
button, select, input[type="text"] { font: inherit; color: var(--text); background: var(--raised); border: 1px solid var(--line);
  border-radius: 6px; padding: 6px 10px; min-height: 34px; }
button { cursor: pointer; }
button:hover:not(:disabled) { border-color: var(--accent); }
button:disabled { opacity: 0.55; cursor: default; }
button.main { background: var(--accent); color: var(--accent-text); border-color: var(--accent); font-weight: 600; }
select { max-width: 100%; }
input[type="range"] { width: 100%; accent-color: var(--accent); min-height: 28px; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.swatches { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.swatch { width: 28px; height: 28px; min-height: 28px; padding: 0; border-radius: 50%; border: 2px solid var(--line); }
.swatch[aria-pressed="true"] { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent); }
input[type="color"] { width: 38px; height: 30px; padding: 0; border: 1px solid var(--line); border-radius: 6px; background: var(--raised); }
.piece { border: 1px solid var(--line); border-radius: 8px; padding: 8px; margin: 0 0 8px; background: var(--raised); }
.piece .row { margin-bottom: 6px; }
.status { color: var(--soft); min-height: 1.4em; }
.status.bad { color: var(--bad); }
label.check { display: flex; gap: 8px; align-items: center; min-height: 28px; margin: 0 0 4px; }
label.check input { accent-color: var(--accent); width: 18px; height: 18px; margin: 0; }
ol.steps { margin: 6px 0 0; padding-left: 20px; color: var(--soft); }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media (max-width: 820px) {
  main { grid-template-columns: 1fr; grid-template-rows: minmax(240px, 42%) minmax(0, 1fr); }
  .panel { border-left: 0; border-top: 1px solid var(--line); }
  .row { grid-template-columns: 96px minmax(0, 1fr); }
}
@media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto; } }
`;var xm=`marinara-capability-${Kt}`,ym=i=>`${Kt}:draft:${i?`${i.type}:${i.id}`:"none"}`,lu=`${Kt}:last`,vm=`${Kt}:vrm-terms`,wS=["shape","limbs","colours","underwear","clothColours","variants"],AS=i=>Array.isArray(i)?i:Array.isArray(i?.items)?i.items:[];function TS(i){let e=i?.data;if(typeof e=="string")try{e=JSON.parse(e)}catch{e=null}let t=e?.name??e?.data?.name??i?.name;return typeof t=="string"&&t.trim()?t.trim():"Unnamed"}async function ES(){let[i,e]=await Promise.all([cr("/api/characters/personas/list"),cr("/api/characters")]),t=(n,s,r)=>AS(s).filter(o=>typeof o?.id=="string"&&o.id).map(o=>({type:n,id:o.id,name:r(o)})).sort((o,a)=>o.name.localeCompare(a.name));return[...t("persona",i,n=>typeof n.name=="string"&&n.name.trim()?n.name.trim():"Unnamed"),...t("character",e,TS)]}var ls={read(i){try{return JSON.parse(globalThis.localStorage?.getItem(i)??"null")}catch{return null}},write(i,e){try{globalThis.localStorage?.setItem(i,JSON.stringify(e))}catch{}}};function fo(i={}){let e=i.body==="male"?"male":"female",t=oo.find(n=>n.name==="Modern casual");return is({...Hf,body:e,...t?Tl(t,e):{},...i})}function CS(i,e){let t={...i};for(let[n,s]of Object.entries(e))if(s===void 0)delete t[n];else if(wS.includes(n)){let r=s.$set?{...s.$set}:{...t[n],...s};for(let o of Object.keys(r))r[o]===void 0&&delete r[o];t[n]=r}else t[n]=s;return e.hairTint!==void 0&&delete t.hairColour,is(t)}var bm=(i,e)=>`${(i||"avatar").trim().replace(/[^\p{L}\p{N} _-]+/gu,"").replace(/\s+/gu,"-").slice(0,60)||"avatar"}.${e}`;function Sm(i,e,t){let n=URL.createObjectURL(new Blob([i],{type:t})),s=ce("a",{href:n,download:e});document.body.append(s),s.click(),s.remove(),setTimeout(()=>URL.revokeObjectURL(n),1e4)}function RS(i,e){bf(e?.kitBase??`/api/capability-packages/${e?.packageId??Kt}/assets/kit/`,e?.packageVersion??"");let t=i.shadowRoot??i.attachShadow({mode:"open"}),n={owners:[],owner:null,name:"",look:fo(),tab:"start",filled:null,choices:null,exported:null,terms:Ul(ls.read(vm)??{}),building:0,figure:null,redraw:!0},s=ce("canvas",{tabIndex:0,role:"img","aria-label":"The avatar. Drag to turn it, scroll or pinch to zoom, arrow keys to move the view."}),r=ce("div",{class:"note",role:"status","aria-live":"polite"}),o=ce("select",{"aria-label":"Pose",title:"How the avatar stands in the preview. Moving turns its head now and then, so you can see the hair swing. A saved file rests in the A-pose (GLB) or the T-pose (VRM).",onchange:()=>y.setPose(o.value)});for(let[w,C]of mm)o.append(new Option(C,w));let a=ce("select",{"aria-label":"Face",title:"What the face does here: blinking and looking at you, talking, or one expression held",onchange:()=>y.setFace(a.value)});for(let[w,C]of pf)a.append(new Option(C,w));let l=ce("div",{class:"views"},ce("button",{type:"button",onclick:()=>y.view("body")},"Whole body"),ce("button",{type:"button",onclick:()=>y.view("face")},"Face"),ce("button",{type:"button",onclick:()=>y.view("hand")},"Hand"),ce("button",{type:"button",onclick:()=>y.view("feet")},"Feet"),o,a),c=ce("section",{class:"stage","aria-label":"Preview"},s,r,l),u=ce("select",{"aria-label":"Who this avatar is for",onchange:()=>v(u.value)}),d=ce("input",{type:"text","aria-label":"Avatar name",placeholder:"Avatar name",maxLength:60,oninput:()=>{n.name=d.value,p()}}),h=ce("input",{type:"file",accept:".vrm,.glb,.json,model/gltf-binary,application/json",class:"visually-hidden",tabIndex:-1,"aria-hidden":"true",onchange:()=>{let[w]=h.files??[];h.value="",w&&S(w)}}),f=um({onChange:(w,{redraw:C})=>{n.look=CS(n.look,w),n.redraw||=C,p(),x()},onTab:w=>{n.tab=w,m()},onNew:w=>{n.look=fo(w),n.exported=null,n.redraw=!0,p(),x()},onOpen:()=>h.click(),onSaveLook:()=>{let w=JSON.stringify({avatarMaker:"look",format:su,name:n.name,look:n.look},null,1);Sm(w,bm(n.name,"avatar.json"),"application/json"),f.setStatus("Saved the look as a file.")},onExport:w=>{A(w)},onTerms:w=>{n.terms=Ul({...n.terms,...w}),ls.write(vm,n.terms)}}),g=ce("div",{class:"app"},ce("header",{},ce("h1",{},"3D Avatar Maker"),ce("label",{class:"field"},"For",u),ce("label",{class:"field"},"Name",d),ce("span",{class:"grow"}),ce("button",{type:"button",onclick:()=>h.click()},"Open…"),ce("button",{class:"main",type:"button",onclick:()=>{n.tab="save",m()}},"Save…"),h),ce("main",{},c,f.element));t.replaceChildren(ce("style",{},_m),g);let y=gm(s);y.failed&&(r.className="note bad",r.textContent="This browser couldn't start 3D drawing (WebGL), so the avatar can't be shown here.");function m(){f.render({look:n.look,filled:n.filled,choices:n.choices,tab:n.tab,exported:n.exported,terms:n.terms})}function p(){ls.write(ym(n.owner),{name:n.name,look:n.look}),ls.write(lu,n.owner?{type:n.owner.type,id:n.owner.id}:null)}async function x(){let w=++n.building;try{let C=await Op(n.look,n.name||"avatar","auto");if(w!==n.building||E){C.dispose();return}let I=n.filled?.body!==C.avatar.body;n.figure=C,n.filled=C.avatar,(I||!n.choices)&&(n.choices=await Dp(C.avatar.body)),y.show(C),y.failed||(r.className="note",r.textContent=ro(n.look).join(" ")),(n.redraw||I)&&m(),n.redraw=!1}catch(C){if(w!==n.building)return;console.warn(`[${Kt}] the avatar couldn't be built`,C),r.className="note bad",r.textContent="The avatar's files couldn't be loaded. If you just installed or updated 3D Avatar Maker, reload the page and try again."}}function M(){u.replaceChildren(new Option("No one yet (a free draft)",""));for(let[w,C]of[["persona","Personas"],["character","Characters"]]){let I=n.owners.filter(B=>B.type===w);if(!I.length)continue;let L=ce("optgroup",{label:C});for(let B of I)L.append(new Option(B.name,`${B.type}:${B.id}`));u.append(L)}u.value=n.owner?`${n.owner.type}:${n.owner.id}`:""}function v(w){n.owner=n.owners.find(I=>`${I.type}:${I.id}`===w)??null;let C=ls.read(ym(n.owner));n.look=C?.look?is(C.look):fo(),n.look.body||(n.look=fo(n.look)),n.name=typeof C?.name=="string"&&C.name?C.name:n.owner?.name??"",d.value=n.name,n.exported=null,n.redraw=!0,ls.write(lu,n.owner?{type:n.owner.type,id:n.owner.id}:null),x()}async function S(w){try{let C=null;if(/\.(?:glb|vrm)$/iu.test(w.name))C=Jp(await w.arrayBuffer());else{let L=JSON.parse(await w.text());(L?.avatarMaker==="look"||L?.wanderworld==="look")&&(C={name:L.name,look:L.look})}let I=C?is(C.look):null;if(!I||!Object.keys(I).length){f.setStatus(/\.(?:glb|vrm)$/iu.test(w.name)?"That file wasn't saved by 3D Avatar Maker, so there is no look in it to open.":"That file isn't a saved look.",!0);return}n.look=I.body?I:fo(I),typeof C.name=="string"&&C.name&&(n.name=C.name.slice(0,60),d.value=n.name),n.exported=null,n.redraw=!0,p(),f.setStatus(`Opened ${w.name}.`),x()}catch{f.setStatus("That file couldn't be read.",!0)}}async function A({format:w,maxTextureSize:C}){if(n.figure){f.setStatus("Saving the avatar…");try{let I={look:Kf(n.look),name:n.name,maxTextureSize:C},{bytes:L,vertices:B,triangles:P}=w==="vrm"?await Zp(n.figure,{...I,terms:n.terms}):await jp(n.figure,I);y.setPose(o.value);let D=bm(n.name,w==="vrm"?"vrm":"glb");Sm(L,D,"model/gltf-binary"),n.exported={file:D,bytes:L.byteLength,vertices:B,triangles:P},m(),f.setStatus("Saved. The steps below say how to use it in a chat.")}catch(I){console.warn(`[${Kt}] the avatar couldn't be saved`,I),y.setPose(o.value),f.setStatus("The avatar couldn't be saved. Try a smaller picture size.",!0)}}}let E=!1;M(),d.value=n.name,m();let _=ES();return am().then(()=>E?null:(v(""),_)).then(w=>{if(E||!w)return;n.owners=w;let C=ls.read(lu),I=C?`${C.type}:${C.id}`:"";M(),I&&w.some(L=>`${L.type}:${L.id}`===I)&&(u.value=I,v(I))}),{destroy(){E=!0,n.building++,y.dispose(),t.replaceChildren()}}}var cu=class extends HTMLElement{constructor(){super(),this.props=null,this.mounted=null,this.onPropsEvent=()=>this.sync()}set capabilityProps(e){this.props=e,this.sync()}get capabilityProps(){return this.props}connectedCallback(){this.addEventListener("marinara-capability-props",this.onPropsEvent),this.sync()}disconnectedCallback(){this.removeEventListener("marinara-capability-props",this.onPropsEvent),this.mounted?.destroy(),this.mounted=null}sync(){try{if(this.getAttribute("view")!=="browser"||!this.isConnected||this.mounted)return;this.style.cssText+=";display:block;position:relative;overflow:hidden;width:100%;height:100%;",this.mounted=RS(this,this.props)}catch(e){let t=e instanceof Error?e.message:String(e);console.error(`[${Kt}]`,e),this.dispatchEvent(new CustomEvent("marinara-capability-runtime-error",{detail:{message:t}}))}}};customElements.get(xm)||customElements.define(xm,cu);})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
