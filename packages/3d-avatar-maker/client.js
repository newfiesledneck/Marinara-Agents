// 3D Avatar Maker 0.1.06 — Marinara Engine Home tab app (single-file client bundle, includes three.js 0.186.1, MIT)
// Built from packages/3d-avatar-maker/src by scripts/build-3d-avatar-maker-package.mjs. Do not edit; edit src/ and rebuild.
(()=>{var pi={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},mi={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Mu=0,Kl=1,wu=2;var Ir=1,Tu=2,Bs=3,Ln=0,Yt=1,Nt=2,Nn=0,ks=1,Jl=2,jl=3,Ql=4,Au=5;var Fi=100,Eu=101,Cu=102,Ru=103,Iu=104,Pu=200,Lu=201,Nu=202,Du=203,ec=204,tc=205,Uu=206,Ou=207,Fu=208,Bu=209,ku=210,zu=211,Vu=212,Hu=213,Gu=214,Ro=0,Io=1,Po=2,vs=3,Lo=4,No=5,Do=6,Uo=7,ta=0,Wu=1,Xu=2,yn=0,nc=1,ic=2,sc=3,rc=4,oc=5,ac=6,lc=7,Hl="attached",Yu="detached",cc=300,gi=301,Bi=302,na=303,ia=304,Pr=306,bs=1e3,ln=1001,Ss=1002,wt=1003,sa=1004;var ki=1005;var Tt=1006,zs=1007;var Dn=1008;var Kt=1009,hc=1010,uc=1011,Vs=1012,ra=1013,vn=1014,cn=1015,bn=1016,oa=1017,aa=1018,Hs=1020,dc=35902,fc=35899,pc=1021,mc=1022,qt=1023,In=1026,_i=1027,gc=1028,la=1029,xi=1030,ca=1031;var ha=1033,Lr=33776,Nr=33777,Dr=33778,Ur=33779,ua=35840,da=35841,fa=35842,pa=35843,ma=36196,ga=37492,_a=37496,xa=37488,ya=37489,Or=37490,va=37491,ba=37808,Sa=37809,Ma=37810,wa=37811,Ta=37812,Aa=37813,Ea=37814,Ca=37815,Ra=37816,Ia=37817,Pa=37818,La=37819,Na=37820,Da=37821,Ua=36492,Oa=36494,Fa=36495,Ba=36283,ka=36284,Fr=36285,za=36286;var Li=2300,Ms=2301,Ao=2302,Gl=2303,Wl=2400,Xl=2401,Yl=2402;var qu=3200;var Br=0,$u=1,Sn="",bt="srgb",dr="srgb-linear",fr="linear",at="srgb";var Eo=7680;var Zu=519,Ku=512,Ju=513,ju=514,Va=515,Qu=516,ed=517,Ha=518,td=519,nd=35044;var _c="300 es",mn=2e3,ws=2001;function wp(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Tp(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Ts(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function id(){let i=Ts("canvas");return i.style.display="block",i}var Zh={},As=null;function xc(...i){let e="THREE."+i.shift();As?As("log",e,...i):console.log(e,...i)}function sd(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Le(...i){i=sd(i);let e="THREE."+i.shift();if(As)As("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function Fe(...i){i=sd(i);let e="THREE."+i.shift();if(As)As("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function Pi(...i){let e=i.join(" ");e in Zh||(Zh[e]=!0,Le(...i))}function rd(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var od={[Ro]:Io,[Po]:Do,[Lo]:Uo,[vs]:No,[Io]:Ro,[Do]:Po,[Uo]:Lo,[No]:vs},_n=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}},Bt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Kh=1234567,hr=Math.PI/180,Es=180/Math.PI;function zi(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Bt[i&255]+Bt[i>>8&255]+Bt[i>>16&255]+Bt[i>>24&255]+"-"+Bt[e&255]+Bt[e>>8&255]+"-"+Bt[e>>16&15|64]+Bt[e>>24&255]+"-"+Bt[t&63|128]+Bt[t>>8&255]+"-"+Bt[t>>16&255]+Bt[t>>24&255]+Bt[n&255]+Bt[n>>8&255]+Bt[n>>16&255]+Bt[n>>24&255]).toLowerCase()}function $e(i,e,t){return Math.max(e,Math.min(t,i))}function yc(i,e){return(i%e+e)%e}function Ap(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function Ep(i,e,t){return i!==e?(t-i)/(e-i):0}function ur(i,e,t){return(1-t)*i+t*e}function Cp(i,e,t,n){return ur(i,e,1-Math.exp(-t*n))}function Rp(i,e=1){return e-Math.abs(yc(i,e*2)-e)}function Ip(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function Pp(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Lp(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Np(i,e){return i+Math.random()*(e-i)}function Dp(i){return i*(.5-Math.random())}function Up(i){i!==void 0&&(Kh=i);let e=Kh+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Op(i){return i*hr}function Fp(i){return i*Es}function Bp(i){return i>0&&Number.isInteger(i)&&2**Math.round(Math.log2(i))===i}function kp(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function zp(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Vp(i,e,t,n,s){let r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),c=r((e+n)/2),d=o((e+n)/2),u=r((e-n)/2),h=o((e-n)/2),p=r((n-e)/2),g=o((n-e)/2);switch(s){case"XYX":i.set(a*d,l*u,l*h,a*c);break;case"YZY":i.set(l*h,a*d,l*u,a*c);break;case"ZXZ":i.set(l*u,l*h,a*d,a*c);break;case"XZX":i.set(a*d,l*g,l*p,a*c);break;case"YXY":i.set(l*p,a*d,l*g,a*c);break;case"ZYZ":i.set(l*g,l*p,a*d,a*c);break;default:Le("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function xs(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Gt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Vi={DEG2RAD:hr,RAD2DEG:Es,generateUUID:zi,clamp:$e,euclideanModulo:yc,mapLinear:Ap,inverseLerp:Ep,lerp:ur,damp:Cp,pingpong:Rp,smoothstep:Ip,smootherstep:Pp,randInt:Lp,randFloat:Np,randFloatSpread:Dp,seededRandom:Up,degToRad:Op,radToDeg:Fp,isPowerOfTwo:Bp,ceilPowerOfTwo:kp,floorPowerOfTwo:zp,setQuaternionFromProperEuler:Vp,normalize:Gt,denormalize:xs},Oe=class i{static{i.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=$e(this.x,e.x,t.x),this.y=$e(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=$e(this.x,e,t),this.y=$e(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar($e(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos($e(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*s+e.x,this.y=r*s+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Lt=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,o,a){let l=n[s+0],c=n[s+1],d=n[s+2],u=n[s+3],h=r[o+0],p=r[o+1],g=r[o+2],b=r[o+3];if(u!==b||l!==h||c!==p||d!==g){let m=l*h+c*p+d*g+u*b;m<0&&(h=-h,p=-p,g=-g,b=-b,m=-m);let f=1-a;if(m<.9995){let y=Math.acos(m),T=Math.sin(y);f=Math.sin(f*y)/T,a=Math.sin(a*y)/T,l=l*f+h*a,c=c*f+p*a,d=d*f+g*a,u=u*f+b*a}else{l=l*f+h*a,c=c*f+p*a,d=d*f+g*a,u=u*f+b*a;let y=1/Math.sqrt(l*l+c*c+d*d+u*u);l*=y,c*=y,d*=y,u*=y}}e[t]=l,e[t+1]=c,e[t+2]=d,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,s,r,o){let a=n[s],l=n[s+1],c=n[s+2],d=n[s+3],u=r[o],h=r[o+1],p=r[o+2],g=r[o+3];return e[t]=a*g+d*u+l*p-c*h,e[t+1]=l*g+d*h+c*u-a*p,e[t+2]=c*g+d*p+a*h-l*u,e[t+3]=d*g-a*u-l*h-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),d=a(s/2),u=a(r/2),h=l(n/2),p=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=h*d*u+c*p*g,this._y=c*p*u-h*d*g,this._z=c*d*g+h*p*u,this._w=c*d*u-h*p*g;break;case"YXZ":this._x=h*d*u+c*p*g,this._y=c*p*u-h*d*g,this._z=c*d*g-h*p*u,this._w=c*d*u+h*p*g;break;case"ZXY":this._x=h*d*u-c*p*g,this._y=c*p*u+h*d*g,this._z=c*d*g+h*p*u,this._w=c*d*u-h*p*g;break;case"ZYX":this._x=h*d*u-c*p*g,this._y=c*p*u+h*d*g,this._z=c*d*g-h*p*u,this._w=c*d*u+h*p*g;break;case"YZX":this._x=h*d*u+c*p*g,this._y=c*p*u+h*d*g,this._z=c*d*g-h*p*u,this._w=c*d*u-h*p*g;break;case"XZY":this._x=h*d*u-c*p*g,this._y=c*p*u-h*d*g,this._z=c*d*g+h*p*u,this._w=c*d*u+h*p*g;break;default:Le("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],d=t[6],u=t[10],h=n+a+u;if(h>0){let p=.5/Math.sqrt(h+1);this._w=.25/p,this._x=(d-l)*p,this._y=(r-c)*p,this._z=(o-s)*p}else if(n>a&&n>u){let p=2*Math.sqrt(1+n-a-u);this._w=(d-l)/p,this._x=.25*p,this._y=(s+o)/p,this._z=(r+c)/p}else if(a>u){let p=2*Math.sqrt(1+a-n-u);this._w=(r-c)/p,this._x=(s+o)/p,this._y=.25*p,this._z=(l+d)/p}else{let p=2*Math.sqrt(1+u-n-a);this._w=(o-s)/p,this._x=(r+c)/p,this._y=(l+d)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs($e(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,d=t._w;return this._x=n*d+o*a+s*c-r*l,this._y=s*d+o*l+r*a-n*c,this._z=r*d+o*c+n*l-s*a,this._w=o*d-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,o=e._w,a=this.dot(e);a<0&&(n=-n,s=-s,r=-r,o=-o,a=-a);let l=1-t;if(a<.9995){let c=Math.acos(a),d=Math.sin(c);l=Math.sin(l*c)/d,t=Math.sin(t*c)/d,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},O=class i{static{i.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Jh.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Jh.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*n),d=2*(a*t-r*s),u=2*(r*n-o*t);return this.x=t+l*c+o*u-a*d,this.y=n+l*d+a*c-r*u,this.z=s+l*u+r*d-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=$e(this.x,e.x,t.x),this.y=$e(this.y,e.y,t.y),this.z=$e(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=$e(this.x,e,t),this.y=$e(this.y,e,t),this.z=$e(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar($e(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return yl.copy(this).projectOnVector(e),this.sub(yl)}reflect(e){return this.sub(yl.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos($e(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},yl=new O,Jh=new Lt,ze=class i{static{i.prototype.isMatrix3=!0}constructor(e,t,n,s,r,o,a,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c)}set(e,t,n,s,r,o,a,l,c){let d=this.elements;return d[0]=e,d[1]=s,d[2]=a,d[3]=t,d[4]=r,d[5]=l,d[6]=n,d[7]=o,d[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],d=n[4],u=n[7],h=n[2],p=n[5],g=n[8],b=s[0],m=s[3],f=s[6],y=s[1],T=s[4],v=s[7],w=s[2],S=s[5],E=s[8];return r[0]=o*b+a*y+l*w,r[3]=o*m+a*T+l*S,r[6]=o*f+a*v+l*E,r[1]=c*b+d*y+u*w,r[4]=c*m+d*T+u*S,r[7]=c*f+d*v+u*E,r[2]=h*b+p*y+g*w,r[5]=h*m+p*T+g*S,r[8]=h*f+p*v+g*E,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],d=e[8];return t*o*d-t*a*c-n*r*d+n*a*l+s*r*c-s*o*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],d=e[8],u=d*o-a*c,h=a*l-d*r,p=c*r-o*l,g=t*u+n*h+s*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let b=1/g;return e[0]=u*b,e[1]=(s*c-d*n)*b,e[2]=(a*n-s*o)*b,e[3]=h*b,e[4]=(d*t-s*l)*b,e[5]=(s*r-a*t)*b,e[6]=p*b,e[7]=(n*l-c*t)*b,e[8]=(o*t-n*r)*b,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return Pi("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(vl.makeScale(e,t)),this}rotate(e){return Pi("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(vl.makeRotation(-e)),this}translate(e,t){return Pi("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(vl.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},vl=new ze,jh=new ze().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Qh=new ze().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Hp(){let i={enabled:!0,workingColorSpace:dr,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===at&&(s.r=Wn(s.r),s.g=Wn(s.g),s.b=Wn(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===at&&(s.r=ys(s.r),s.g=ys(s.g),s.b=ys(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Sn?fr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Pi("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Pi("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[dr]:{primaries:e,whitePoint:n,transfer:fr,toXYZ:jh,fromXYZ:Qh,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:bt},outputColorSpaceConfig:{drawingBufferColorSpace:bt}},[bt]:{primaries:e,whitePoint:n,transfer:at,toXYZ:jh,fromXYZ:Qh,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:bt}}}),i}var je=Hp();function Wn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function ys(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var ss,Cs=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{ss===void 0&&(ss=Ts("canvas")),ss.width=e.width,ss.height=e.height;let s=ss.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=ss}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Ts("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Wn(r[o]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Wn(t[n]/255)*255):t[n]=Wn(t[n]);return{data:t,width:e.width,height:e.height}}else return Le("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Gp=0,Xn=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Gp++}),this.uuid=zi(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(bl(s[o].image)):r.push(bl(s[o]))}else r=bl(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function bl(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Cs.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Le("Texture: Unable to serialize Texture."),{})}var Wp=0,Sl=new O,Ut=class i extends _n{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=ln,s=ln,r=Tt,o=Dn,a=qt,l=Kt,c=i.DEFAULT_ANISOTROPY,d=Sn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Wp++}),this.uuid=zi(),this.name="",this.source=new Xn(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Oe(0,0),this.repeat=new Oe(1,1),this.center=new Oe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ze,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Sl).x}get height(){return this.source.getSize(Sl).y}get depth(){return this.source.getSize(Sl).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){Le(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Le(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==cc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case bs:e.x=e.x-Math.floor(e.x);break;case ln:e.x=e.x<0?0:1;break;case Ss:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case bs:e.y=e.y-Math.floor(e.y);break;case ln:e.y=e.y<0?0:1;break;case Ss:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Ut.DEFAULT_IMAGE=null;Ut.DEFAULT_MAPPING=cc;Ut.DEFAULT_ANISOTROPY=1;var lt=class i{static{i.prototype.isVector4=!0}constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],d=l[4],u=l[8],h=l[1],p=l[5],g=l[9],b=l[2],m=l[6],f=l[10];if(Math.abs(d-h)<.01&&Math.abs(u-b)<.01&&Math.abs(g-m)<.01){if(Math.abs(d+h)<.1&&Math.abs(u+b)<.1&&Math.abs(g+m)<.1&&Math.abs(c+p+f-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let T=(c+1)/2,v=(p+1)/2,w=(f+1)/2,S=(d+h)/4,E=(u+b)/4,_=(g+m)/4;return T>v&&T>w?T<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(T),s=S/n,r=E/n):v>w?v<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(v),n=S/s,r=_/s):w<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(w),n=E/r,s=_/r),this.set(n,s,r,t),this}let y=Math.sqrt((m-g)*(m-g)+(u-b)*(u-b)+(h-d)*(h-d));return Math.abs(y)<.001&&(y=1),this.x=(m-g)/y,this.y=(u-b)/y,this.z=(h-d)/y,this.w=Math.acos((c+p+f-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=$e(this.x,e.x,t.x),this.y=$e(this.y,e.y,t.y),this.z=$e(this.z,e.z,t.z),this.w=$e(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=$e(this.x,e,t),this.y=$e(this.y,e,t),this.z=$e(this.z,e,t),this.w=$e(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar($e(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Oo=class extends _n{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Tt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new lt(0,0,e,t),this.scissorTest=!1,this.viewport=new lt(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:n.depth},r=new Ut(s),o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Tt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new Xn(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Zt=class extends Oo{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},pr=class extends Ut{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=wt,this.minFilter=wt,this.wrapR=ln,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Fo=class extends Ut{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=wt,this.minFilter=wt,this.wrapR=ln,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var Be=class i{static{i.prototype.isMatrix4=!0}constructor(e,t,n,s,r,o,a,l,c,d,u,h,p,g,b,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c,d,u,h,p,g,b,m)}set(e,t,n,s,r,o,a,l,c,d,u,h,p,g,b,m){let f=this.elements;return f[0]=e,f[4]=t,f[8]=n,f[12]=s,f[1]=r,f[5]=o,f[9]=a,f[13]=l,f[2]=c,f[6]=d,f[10]=u,f[14]=h,f[3]=p,f[7]=g,f[11]=b,f[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,s=1/rs.setFromMatrixColumn(e,0).length(),r=1/rs.setFromMatrixColumn(e,1).length(),o=1/rs.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),d=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){let h=o*d,p=o*u,g=a*d,b=a*u;t[0]=l*d,t[4]=-l*u,t[8]=c,t[1]=p+g*c,t[5]=h-b*c,t[9]=-a*l,t[2]=b-h*c,t[6]=g+p*c,t[10]=o*l}else if(e.order==="YXZ"){let h=l*d,p=l*u,g=c*d,b=c*u;t[0]=h+b*a,t[4]=g*a-p,t[8]=o*c,t[1]=o*u,t[5]=o*d,t[9]=-a,t[2]=p*a-g,t[6]=b+h*a,t[10]=o*l}else if(e.order==="ZXY"){let h=l*d,p=l*u,g=c*d,b=c*u;t[0]=h-b*a,t[4]=-o*u,t[8]=g+p*a,t[1]=p+g*a,t[5]=o*d,t[9]=b-h*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let h=o*d,p=o*u,g=a*d,b=a*u;t[0]=l*d,t[4]=g*c-p,t[8]=h*c+b,t[1]=l*u,t[5]=b*c+h,t[9]=p*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let h=o*l,p=o*c,g=a*l,b=a*c;t[0]=l*d,t[4]=b-h*u,t[8]=g*u+p,t[1]=u,t[5]=o*d,t[9]=-a*d,t[2]=-c*d,t[6]=p*u+g,t[10]=h-b*u}else if(e.order==="XZY"){let h=o*l,p=o*c,g=a*l,b=a*c;t[0]=l*d,t[4]=-u,t[8]=c*d,t[1]=h*u+b,t[5]=o*d,t[9]=p*u-g,t[2]=g*u-p,t[6]=a*d,t[10]=b*u+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Xp,e,Yp)}lookAt(e,t,n){let s=this.elements;return Qt.subVectors(e,t),Qt.lengthSq()===0&&(Qt.z=1),Qt.normalize(),ti.crossVectors(n,Qt),ti.lengthSq()===0&&(Math.abs(n.z)===1?Qt.x+=1e-4:Qt.z+=1e-4,Qt.normalize(),ti.crossVectors(n,Qt)),ti.normalize(),ro.crossVectors(Qt,ti),s[0]=ti.x,s[4]=ro.x,s[8]=Qt.x,s[1]=ti.y,s[5]=ro.y,s[9]=Qt.y,s[2]=ti.z,s[6]=ro.z,s[10]=Qt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],d=n[1],u=n[5],h=n[9],p=n[13],g=n[2],b=n[6],m=n[10],f=n[14],y=n[3],T=n[7],v=n[11],w=n[15],S=s[0],E=s[4],_=s[8],A=s[12],R=s[1],P=s[5],U=s[9],k=s[13],I=s[2],F=s[6],$=s[10],X=s[14],ne=s[3],q=s[7],K=s[11],ee=s[15];return r[0]=o*S+a*R+l*I+c*ne,r[4]=o*E+a*P+l*F+c*q,r[8]=o*_+a*U+l*$+c*K,r[12]=o*A+a*k+l*X+c*ee,r[1]=d*S+u*R+h*I+p*ne,r[5]=d*E+u*P+h*F+p*q,r[9]=d*_+u*U+h*$+p*K,r[13]=d*A+u*k+h*X+p*ee,r[2]=g*S+b*R+m*I+f*ne,r[6]=g*E+b*P+m*F+f*q,r[10]=g*_+b*U+m*$+f*K,r[14]=g*A+b*k+m*X+f*ee,r[3]=y*S+T*R+v*I+w*ne,r[7]=y*E+T*P+v*F+w*q,r[11]=y*_+T*U+v*$+w*K,r[15]=y*A+T*k+v*X+w*ee,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],d=e[2],u=e[6],h=e[10],p=e[14],g=e[3],b=e[7],m=e[11],f=e[15],y=l*p-c*h,T=a*p-c*u,v=a*h-l*u,w=o*p-c*d,S=o*h-l*d,E=o*u-a*d;return t*(b*y-m*T+f*v)-n*(g*y-m*w+f*S)+s*(g*T-b*w+f*E)-r*(g*v-b*S+m*E)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],o=e[5],a=e[9],l=e[2],c=e[6],d=e[10];return t*(o*d-a*c)-n*(r*d-a*l)+s*(r*c-o*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],d=e[8],u=e[9],h=e[10],p=e[11],g=e[12],b=e[13],m=e[14],f=e[15],y=t*a-n*o,T=t*l-s*o,v=t*c-r*o,w=n*l-s*a,S=n*c-r*a,E=s*c-r*l,_=d*b-u*g,A=d*m-h*g,R=d*f-p*g,P=u*m-h*b,U=u*f-p*b,k=h*f-p*m,I=y*k-T*U+v*P+w*R-S*A+E*_;if(I===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let F=1/I;return e[0]=(a*k-l*U+c*P)*F,e[1]=(s*U-n*k-r*P)*F,e[2]=(b*E-m*S+f*w)*F,e[3]=(h*S-u*E-p*w)*F,e[4]=(l*R-o*k-c*A)*F,e[5]=(t*k-s*R+r*A)*F,e[6]=(m*v-g*E-f*T)*F,e[7]=(d*E-h*v+p*T)*F,e[8]=(o*U-a*R+c*_)*F,e[9]=(n*R-t*U-r*_)*F,e[10]=(g*S-b*v+f*y)*F,e[11]=(u*v-d*S-p*y)*F,e[12]=(a*A-o*P-l*_)*F,e[13]=(t*P-n*A+s*_)*F,e[14]=(b*T-g*w-m*y)*F,e[15]=(d*w-u*T+h*y)*F,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,c=r*o,d=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,d*a+n,d*l-s*o,0,c*l-s*a,d*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,o){return this.set(1,n,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,d=o+o,u=a+a,h=r*c,p=r*d,g=r*u,b=o*d,m=o*u,f=a*u,y=l*c,T=l*d,v=l*u,w=n.x,S=n.y,E=n.z;return s[0]=(1-(b+f))*w,s[1]=(p+v)*w,s[2]=(g-T)*w,s[3]=0,s[4]=(p-v)*S,s[5]=(1-(h+f))*S,s[6]=(m+y)*S,s[7]=0,s[8]=(g+T)*E,s[9]=(m-y)*E,s[10]=(1-(h+b))*E,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let o=rs.set(s[0],s[1],s[2]).length(),a=rs.set(s[4],s[5],s[6]).length(),l=rs.set(s[8],s[9],s[10]).length();r<0&&(o=-o),dn.copy(this);let c=1/o,d=1/a,u=1/l;return dn.elements[0]*=c,dn.elements[1]*=c,dn.elements[2]*=c,dn.elements[4]*=d,dn.elements[5]*=d,dn.elements[6]*=d,dn.elements[8]*=u,dn.elements[9]*=u,dn.elements[10]*=u,t.setFromRotationMatrix(dn),n.x=o,n.y=a,n.z=l,this}makePerspective(e,t,n,s,r,o,a=mn,l=!1){let c=this.elements,d=2*r/(t-e),u=2*r/(n-s),h=(t+e)/(t-e),p=(n+s)/(n-s),g,b;if(l)g=r/(o-r),b=o*r/(o-r);else if(a===mn)g=-(o+r)/(o-r),b=-2*o*r/(o-r);else if(a===ws)g=-o/(o-r),b=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=d,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=u,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=b,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,o,a=mn,l=!1){let c=this.elements,d=2/(t-e),u=2/(n-s),h=-(t+e)/(t-e),p=-(n+s)/(n-s),g,b;if(l)g=1/(o-r),b=o/(o-r);else if(a===mn)g=-2/(o-r),b=-(o+r)/(o-r);else if(a===ws)g=-1/(o-r),b=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=d,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=u,c[9]=0,c[13]=p,c[2]=0,c[6]=0,c[10]=g,c[14]=b,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},rs=new O,dn=new Be,Xp=new O(0,0,0),Yp=new O(1,1,1),ti=new O,ro=new O,Qt=new O,eu=new Be,tu=new Lt,Pn=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],d=s[9],u=s[2],h=s[6],p=s[10];switch(t){case"XYZ":this._y=Math.asin($e(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-d,p),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-$e(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin($e(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-u,p),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-$e(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(h,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin($e(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-d,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-$e(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-d,p),this._y=0);break;default:Le("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return eu.makeRotationFromQuaternion(e),this.setFromRotationMatrix(eu,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return tu.setFromEuler(this),this.setFromQuaternion(tu,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Pn.DEFAULT_ORDER="XYZ";var mr=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},qp=0,nu=new O,os=new Lt,kn=new Be,oo=new O,rr=new O,$p=new O,Zp=new Lt,iu=new O(1,0,0),su=new O(0,1,0),ru=new O(0,0,1),ou={type:"added"},Kp={type:"removed"},as={type:"childadded",child:null},Ml={type:"childremoved",child:null},Ot=class i extends _n{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:qp++}),this.uuid=zi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new O,t=new Pn,n=new Lt,s=new O(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Be},normalMatrix:{value:new ze}}),this.matrix=new Be,this.matrixWorld=new Be,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new mr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return os.setFromAxisAngle(e,t),this.quaternion.multiply(os),this}rotateOnWorldAxis(e,t){return os.setFromAxisAngle(e,t),this.quaternion.premultiply(os),this}rotateX(e){return this.rotateOnAxis(iu,e)}rotateY(e){return this.rotateOnAxis(su,e)}rotateZ(e){return this.rotateOnAxis(ru,e)}translateOnAxis(e,t){return nu.copy(e).applyQuaternion(this.quaternion),this.position.add(nu.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(iu,e)}translateY(e){return this.translateOnAxis(su,e)}translateZ(e){return this.translateOnAxis(ru,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(kn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?oo.copy(e):oo.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),rr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?kn.lookAt(rr,oo,this.up):kn.lookAt(oo,rr,this.up),this.quaternion.setFromRotationMatrix(kn),s&&(kn.extractRotation(s.matrixWorld),os.setFromRotationMatrix(kn),this.quaternion.premultiply(os.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Fe("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(ou),as.child=e,this.dispatchEvent(as),as.child=null):Fe("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Kp),Ml.child=e,this.dispatchEvent(Ml),Ml.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),kn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),kn.multiply(e.parent.matrixWorld)),e.applyMatrix4(kn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(ou),as.child=e,this.dispatchEvent(as),as.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(rr,e,$p),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(rr,Zp,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,d=l.length;c<d;c++){let u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),d=o(e.images),u=o(e.shapes),h=o(e.skeletons),p=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),d.length>0&&(n.images=d),u.length>0&&(n.shapes=u),h.length>0&&(n.skeletons=h),p.length>0&&(n.animations=p),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){let l=[];for(let c in a){let d=a[c];delete d.metadata,l.push(d)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Ot.DEFAULT_UP=new O(0,1,0);Ot.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ot.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var gn=class extends Ot{constructor(){super(),this.isGroup=!0,this.type="Group"}},Jp={type:"move"},Rs=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new gn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new gn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new O,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new O),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new gn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new O,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new O,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let b of e.hand.values()){let m=t.getJointPose(b,n),f=this._getHandJoint(c,b);m!==null&&(f.matrix.fromArray(m.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=m.radius),f.visible=m!==null}let d=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],h=d.position.distanceTo(u.position),p=.02,g=.005;c.inputState.pinching&&h>p+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=p-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Jp)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new gn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},ad={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ni={h:0,s:0,l:0},ao={h:0,s:0,l:0};function wl(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var ke=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=bt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,je.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=je.workingColorSpace){return this.r=e,this.g=t,this.b=n,je.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=je.workingColorSpace){if(e=yc(e,1),t=$e(t,0,1),n=$e(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=wl(o,r,e+1/3),this.g=wl(o,r,e),this.b=wl(o,r,e-1/3)}return je.colorSpaceToWorking(this,s),this}setStyle(e,t=bt){function n(r){r!==void 0&&parseFloat(r)<1&&Le("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Le("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);Le("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=bt){let n=ad[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Le("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Wn(e.r),this.g=Wn(e.g),this.b=Wn(e.b),this}copyLinearToSRGB(e){return this.r=ys(e.r),this.g=ys(e.g),this.b=ys(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=bt){return je.workingToColorSpace(kt.copy(this),e),Math.round($e(kt.r*255,0,255))*65536+Math.round($e(kt.g*255,0,255))*256+Math.round($e(kt.b*255,0,255))}getHexString(e=bt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=je.workingColorSpace){je.workingToColorSpace(kt.copy(this),t);let n=kt.r,s=kt.g,r=kt.b,o=Math.max(n,s,r),a=Math.min(n,s,r),l,c,d=(a+o)/2;if(a===o)l=0,c=0;else{let u=o-a;switch(c=d<=.5?u/(o+a):u/(2-o-a),o){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=d,e}getRGB(e,t=je.workingColorSpace){return je.workingToColorSpace(kt.copy(this),t),e.r=kt.r,e.g=kt.g,e.b=kt.b,e}getStyle(e=bt){je.workingToColorSpace(kt.copy(this),e);let t=kt.r,n=kt.g,s=kt.b;return e!==bt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(ni),this.setHSL(ni.h+e,ni.s+t,ni.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(ni),e.getHSL(ao);let n=ur(ni.h,ao.h,t),s=ur(ni.s,ao.s,t),r=ur(ni.l,ao.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},kt=new ke;ke.NAMES=ad;var ai=class extends Ot{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Pn,this.environmentIntensity=1,this.environmentRotation=new Pn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},fn=new O,zn=new O,Tl=new O,Vn=new O,ls=new O,cs=new O,au=new O,Al=new O,El=new O,Cl=new O,Rl=new lt,Il=new lt,Pl=new lt,oi=class i{constructor(e=new O,t=new O,n=new O){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),fn.subVectors(e,t),s.cross(fn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){fn.subVectors(s,t),zn.subVectors(n,t),Tl.subVectors(e,t);let o=fn.dot(fn),a=fn.dot(zn),l=fn.dot(Tl),c=zn.dot(zn),d=zn.dot(Tl),u=o*c-a*a;if(u===0)return r.set(0,0,0),null;let h=1/u,p=(c*l-a*d)*h,g=(o*d-a*l)*h;return r.set(1-p-g,g,p)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Vn)===null?!1:Vn.x>=0&&Vn.y>=0&&Vn.x+Vn.y<=1}static getInterpolation(e,t,n,s,r,o,a,l){return this.getBarycoord(e,t,n,s,Vn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Vn.x),l.addScaledVector(o,Vn.y),l.addScaledVector(a,Vn.z),l)}static getInterpolatedAttribute(e,t,n,s,r,o){return Rl.setScalar(0),Il.setScalar(0),Pl.setScalar(0),Rl.fromBufferAttribute(e,t),Il.fromBufferAttribute(e,n),Pl.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(Rl,r.x),o.addScaledVector(Il,r.y),o.addScaledVector(Pl,r.z),o}static isFrontFacing(e,t,n,s){return fn.subVectors(n,t),zn.subVectors(e,t),fn.cross(zn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return fn.subVectors(this.c,this.b),zn.subVectors(this.a,this.b),fn.cross(zn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,o,a;ls.subVectors(s,n),cs.subVectors(r,n),Al.subVectors(e,n);let l=ls.dot(Al),c=cs.dot(Al);if(l<=0&&c<=0)return t.copy(n);El.subVectors(e,s);let d=ls.dot(El),u=cs.dot(El);if(d>=0&&u<=d)return t.copy(s);let h=l*u-d*c;if(h<=0&&l>=0&&d<=0)return o=l/(l-d),t.copy(n).addScaledVector(ls,o);Cl.subVectors(e,r);let p=ls.dot(Cl),g=cs.dot(Cl);if(g>=0&&p<=g)return t.copy(r);let b=p*c-l*g;if(b<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(cs,a);let m=d*g-p*u;if(m<=0&&u-d>=0&&p-g>=0)return au.subVectors(r,s),a=(u-d)/(u-d+(p-g)),t.copy(s).addScaledVector(au,a);let f=1/(m+b+h);return o=b*f,a=h*f,t.copy(n).addScaledVector(ls,o).addScaledVector(cs,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},xn=class{constructor(e=new O(1/0,1/0,1/0),t=new O(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(pn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(pn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=pn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,pn):pn.fromBufferAttribute(r,o),pn.applyMatrix4(e.matrixWorld),this.expandByPoint(pn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),lo.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),lo.copy(n.boundingBox)),lo.applyMatrix4(e.matrixWorld),this.union(lo)}let s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,pn),pn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(or),co.subVectors(this.max,or),hs.subVectors(e.a,or),us.subVectors(e.b,or),ds.subVectors(e.c,or),ii.subVectors(us,hs),si.subVectors(ds,us),Ei.subVectors(hs,ds);let t=[0,-ii.z,ii.y,0,-si.z,si.y,0,-Ei.z,Ei.y,ii.z,0,-ii.x,si.z,0,-si.x,Ei.z,0,-Ei.x,-ii.y,ii.x,0,-si.y,si.x,0,-Ei.y,Ei.x,0];return!Ll(t,hs,us,ds,co)||(t=[1,0,0,0,1,0,0,0,1],!Ll(t,hs,us,ds,co))?!1:(ho.crossVectors(ii,si),t=[ho.x,ho.y,ho.z],Ll(t,hs,us,ds,co))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,pn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(pn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Hn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Hn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Hn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Hn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Hn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Hn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Hn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Hn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Hn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Hn=[new O,new O,new O,new O,new O,new O,new O,new O],pn=new O,lo=new xn,hs=new O,us=new O,ds=new O,ii=new O,si=new O,Ei=new O,or=new O,co=new O,ho=new O,Ci=new O;function Ll(i,e,t,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){Ci.fromArray(i,r);let a=s.x*Math.abs(Ci.x)+s.y*Math.abs(Ci.y)+s.z*Math.abs(Ci.z),l=e.dot(Ci),c=t.dot(Ci),d=n.dot(Ci);if(Math.max(-Math.max(l,c,d),Math.min(l,c,d))>a)return!1}return!0}var Mt=new O,uo=new Oe,jp=0,Ve=class extends _n{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:jp++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=nd,this.updateRanges=[],this.gpuType=cn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)uo.fromBufferAttribute(this,t),uo.applyMatrix3(e),this.setXY(t,uo.x,uo.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Mt.fromBufferAttribute(this,t),Mt.applyMatrix3(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Mt.fromBufferAttribute(this,t),Mt.applyMatrix4(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Mt.fromBufferAttribute(this,t),Mt.applyNormalMatrix(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Mt.fromBufferAttribute(this,t),Mt.transformDirection(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=xs(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Gt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=xs(t,this.array)),t}setX(e,t){return this.normalized&&(t=Gt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=xs(t,this.array)),t}setY(e,t){return this.normalized&&(t=Gt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=xs(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Gt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=xs(t,this.array)),t}setW(e,t){return this.normalized&&(t=Gt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Gt(t,this.array),n=Gt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Gt(t,this.array),n=Gt(n,this.array),s=Gt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=Gt(t,this.array),n=Gt(n,this.array),s=Gt(s,this.array),r=Gt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}};var Yn=class extends Ve{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Ni=class extends Ve{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var Wt=class extends Ve{constructor(e,t,n){super(new Float32Array(e),t,n)}},Qp=new xn,ar=new O,Nl=new O,li=class{constructor(e=new O,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):Qp.setFromPoints(e).getCenter(n);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ar.subVectors(e,this.center);let t=ar.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(ar,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Nl.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ar.copy(e.center).add(Nl)),this.expandByPoint(ar.copy(e.center).sub(Nl))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},em=0,an=new Be,Dl=new Ot,fs=new O,en=new xn,lr=new xn,Pt=new O,At=class i extends _n{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:em++}),this.uuid=zi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(wp(e)?Ni:Yn)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new ze().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return an.makeRotationFromQuaternion(e),this.applyMatrix4(an),this}rotateX(e){return an.makeRotationX(e),this.applyMatrix4(an),this}rotateY(e){return an.makeRotationY(e),this.applyMatrix4(an),this}rotateZ(e){return an.makeRotationZ(e),this.applyMatrix4(an),this}translate(e,t,n){return an.makeTranslation(e,t,n),this.applyMatrix4(an),this}scale(e,t,n){return an.makeScale(e,t,n),this.applyMatrix4(an),this}lookAt(e){return Dl.lookAt(e),Dl.updateMatrix(),this.applyMatrix4(Dl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(fs).negate(),this.translate(fs.x,fs.y,fs.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let o=e[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Wt(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Le("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new xn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Fe("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new O(-1/0,-1/0,-1/0),new O(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];en.setFromBufferAttribute(r),this.morphTargetsRelative?(Pt.addVectors(this.boundingBox.min,en.min),this.boundingBox.expandByPoint(Pt),Pt.addVectors(this.boundingBox.max,en.max),this.boundingBox.expandByPoint(Pt)):(this.boundingBox.expandByPoint(en.min),this.boundingBox.expandByPoint(en.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Fe('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new li);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Fe("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new O,1/0);return}if(e){let n=this.boundingSphere.center;if(en.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];lr.setFromBufferAttribute(a),this.morphTargetsRelative?(Pt.addVectors(en.min,lr.min),en.expandByPoint(Pt),Pt.addVectors(en.max,lr.max),en.expandByPoint(Pt)):(en.expandByPoint(lr.min),en.expandByPoint(lr.max))}en.getCenter(n);let s=0;for(let r=0,o=e.count;r<o;r++)Pt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Pt));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],l=this.morphTargetsRelative;for(let c=0,d=a.count;c<d;c++)Pt.fromBufferAttribute(a,c),l&&(fs.fromBufferAttribute(e,c),Pt.add(fs)),s=Math.max(s,n.distanceToSquared(Pt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Fe('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Fe("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new Ve(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));let a=[],l=[];for(let _=0;_<n.count;_++)a[_]=new O,l[_]=new O;let c=new O,d=new O,u=new O,h=new Oe,p=new Oe,g=new Oe,b=new O,m=new O;function f(_,A,R){c.fromBufferAttribute(n,_),d.fromBufferAttribute(n,A),u.fromBufferAttribute(n,R),h.fromBufferAttribute(r,_),p.fromBufferAttribute(r,A),g.fromBufferAttribute(r,R),d.sub(c),u.sub(c),p.sub(h),g.sub(h);let P=1/(p.x*g.y-g.x*p.y);isFinite(P)&&(b.copy(d).multiplyScalar(g.y).addScaledVector(u,-p.y).multiplyScalar(P),m.copy(u).multiplyScalar(p.x).addScaledVector(d,-g.x).multiplyScalar(P),a[_].add(b),a[A].add(b),a[R].add(b),l[_].add(m),l[A].add(m),l[R].add(m))}let y=this.groups;y.length===0&&(y=[{start:0,count:e.count}]);for(let _=0,A=y.length;_<A;++_){let R=y[_],P=R.start,U=R.count;for(let k=P,I=P+U;k<I;k+=3)f(e.getX(k+0),e.getX(k+1),e.getX(k+2))}let T=new O,v=new O,w=new O,S=new O;function E(_){w.fromBufferAttribute(s,_),S.copy(w);let A=a[_];T.copy(A),T.sub(w.multiplyScalar(w.dot(A))).normalize(),v.crossVectors(S,A);let P=v.dot(l[_])<0?-1:1;o.setXYZW(_,T.x,T.y,T.z,P)}for(let _=0,A=y.length;_<A;++_){let R=y[_],P=R.start,U=R.count;for(let k=P,I=P+U;k<I;k+=3)E(e.getX(k+0)),E(e.getX(k+1)),E(e.getX(k+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new Ve(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let h=0,p=n.count;h<p;h++)n.setXYZ(h,0,0,0);let s=new O,r=new O,o=new O,a=new O,l=new O,c=new O,d=new O,u=new O;if(e)for(let h=0,p=e.count;h<p;h+=3){let g=e.getX(h+0),b=e.getX(h+1),m=e.getX(h+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,b),o.fromBufferAttribute(t,m),d.subVectors(o,r),u.subVectors(s,r),d.cross(u),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,b),c.fromBufferAttribute(n,m),a.add(d),l.add(d),c.add(d),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(b,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let h=0,p=t.count;h<p;h+=3)s.fromBufferAttribute(t,h+0),r.fromBufferAttribute(t,h+1),o.fromBufferAttribute(t,h+2),d.subVectors(o,r),u.subVectors(s,r),d.cross(u),n.setXYZ(h+0,d.x,d.y,d.z),n.setXYZ(h+1,d.x,d.y,d.z),n.setXYZ(h+2,d.x,d.y,d.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Pt.fromBufferAttribute(e,t),Pt.normalize(),e.setXYZ(t,Pt.x,Pt.y,Pt.z)}toNonIndexed(){function e(a,l){let c=a.array,d=a.itemSize,u=a.normalized,h=new c.constructor(l.length*d),p=0,g=0;for(let b=0,m=l.length;b<m;b++){a.isInterleavedBufferAttribute?p=l[b]*a.data.stride+a.offset:p=l[b]*d;for(let f=0;f<d;f++)h[g++]=c[p++]}return new Ve(h,d,u)}if(this.index===null)return Le("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let a in s){let l=s[a],c=e(l,n);t.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let d=0,u=c.length;d<u;d++){let h=c[d],p=e(h,n);l.push(p)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],d=[];for(let u=0,h=c.length;u<h;u++){let p=c[u];d.push(p.toJSON(e.data))}d.length>0&&(s[l]=d,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let d=s[c];this.setAttribute(c,d.clone(t))}let r=e.morphAttributes;for(let c in r){let d=[],u=r[c];for(let h=0,p=u.length;h<p;h++)d.push(u[h].clone(t));this.morphAttributes[c]=d}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,d=o.length;c<d;c++){let u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var Ul=new O,tm=new O,nm=new ze,tn=class{constructor(e=new O(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=Ul.subVectors(n,t).cross(tm.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let s=e.delta(Ul),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let o=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(o<0||o>1)?null:t.copy(e.start).addScaledVector(s,o)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||nm.getNormalMatrix(e),s=this.coplanarPoint(Ul).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},im=0,qn=class extends _n{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:im++}),this.uuid=zi(),this.name="",this.type="Material",this.blending=ks,this.side=Ln,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ec,this.blendDst=tc,this.blendEquation=Fi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ke(0,0,0),this.blendAlpha=0,this.depthFunc=vs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Zu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Eo,this.stencilZFail=Eo,this.stencilZPass=Eo,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){Le(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Le(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(t){let r=s(e.textures),o=s(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new ke().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new tn().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Oe().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Oe().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var Gn=new O,Ol=new O,fo=new O,po=new O,Di=class{constructor(e=new O,t=new O(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Gn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Gn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Gn.copy(this.origin).addScaledVector(this.direction,t),Gn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Ol.copy(e).add(t).multiplyScalar(.5),fo.copy(t).sub(e).normalize(),po.copy(this.origin).sub(Ol);let r=e.distanceTo(t)*.5,o=-this.direction.dot(fo),a=po.dot(this.direction),l=-po.dot(fo),c=po.lengthSq(),d=Math.abs(1-o*o),u,h,p,g;if(d>0)if(u=o*l-a,h=o*a-l,g=r*d,u>=0)if(h>=-g)if(h<=g){let b=1/d;u*=b,h*=b,p=u*(u+o*h+2*a)+h*(o*u+h+2*l)+c}else h=r,u=Math.max(0,-(o*h+a)),p=-u*u+h*(h+2*l)+c;else h=-r,u=Math.max(0,-(o*h+a)),p=-u*u+h*(h+2*l)+c;else h<=-g?(u=Math.max(0,-(-o*r+a)),h=u>0?-r:Math.min(Math.max(-r,-l),r),p=-u*u+h*(h+2*l)+c):h<=g?(u=0,h=Math.min(Math.max(-r,-l),r),p=h*(h+2*l)+c):(u=Math.max(0,-(o*r+a)),h=u>0?r:Math.min(Math.max(-r,-l),r),p=-u*u+h*(h+2*l)+c);else h=o>0?-r:r,u=Math.max(0,-(o*h+a)),p=-u*u+h*(h+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(Ol).addScaledVector(fo,h),p}intersectSphere(e,t){if(e.radius<0)return null;Gn.subVectors(e.center,this.origin);let n=Gn.dot(this.direction),s=Gn.dot(Gn)-n*n,r=e.radius*e.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,o,a,l,c=1/this.direction.x,d=1/this.direction.y,u=1/this.direction.z,h=this.origin;return c>=0?(n=(e.min.x-h.x)*c,s=(e.max.x-h.x)*c):(n=(e.max.x-h.x)*c,s=(e.min.x-h.x)*c),d>=0?(r=(e.min.y-h.y)*d,o=(e.max.y-h.y)*d):(r=(e.max.y-h.y)*d,o=(e.min.y-h.y)*d),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),u>=0?(a=(e.min.z-h.z)*u,l=(e.max.z-h.z)*u):(a=(e.max.z-h.z)*u,l=(e.min.z-h.z)*u),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,Gn)!==null}intersectTriangle(e,t,n,s,r){let o=this.origin,a=this.direction,l=a.x,c=a.y,d=a.z,u=e.x-o.x,h=e.y-o.y,p=e.z-o.z,g=t.x-o.x,b=t.y-o.y,m=t.z-o.z,f=n.x-o.x,y=n.y-o.y,T=n.z-o.z,v=Math.abs(l),w=Math.abs(c),S=Math.abs(d),E,_,A,R,P,U,k,I,F,$,X,ne;if(v>=w&&v>=S?(A=l,U=u,F=g,ne=f,l>=0?(E=c,_=d,R=h,P=p,k=b,I=m,$=y,X=T):(E=d,_=c,R=p,P=h,k=m,I=b,$=T,X=y)):w>=S?(A=c,U=h,F=b,ne=y,c>=0?(E=d,_=l,R=p,P=u,k=m,I=g,$=T,X=f):(E=l,_=d,R=u,P=p,k=g,I=m,$=f,X=T)):(A=d,U=p,F=m,ne=T,d>=0?(E=l,_=c,R=u,P=h,k=g,I=b,$=f,X=y):(E=c,_=l,R=h,P=u,k=b,I=g,$=y,X=f)),A===0)return null;let q=E/A,K=_/A,ee=1/A,be=R-q*U,Se=P-K*U,tt=k-q*F,Ge=I-K*F,te=$-q*ne,H=X-K*ne,G=te*Ge-H*tt,ae=be*H-Se*te,Te=tt*Se-Ge*be;if(s){if(G<0||ae<0||Te<0)return null}else if((G<0||ae<0||Te<0)&&(G>0||ae>0||Te>0))return null;let fe=G+ae+Te;if(fe===0)return null;let Ne=ee*(G*U+ae*F+Te*ne);return(fe>0?Ne<0:Ne>0)?null:this.at(Ne/fe,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Ui=class extends qn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ke(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Pn,this.combine=ta,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},lu=new Be,Ri=new Di,mo=new li,cu=new O,go=new O,_o=new O,xo=new O,Fl=new O,yo=new O,hu=new O,vo=new O,Xt=class extends Ot{constructor(e=new At,t=new Ui){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let a=this.morphTargetInfluences;if(r&&a){yo.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let d=a[l],u=r[l];d!==0&&(Fl.fromBufferAttribute(u,e),o?yo.addScaledVector(Fl,d):yo.addScaledVector(Fl.sub(t),d))}t.add(yo)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),mo.copy(n.boundingSphere),mo.applyMatrix4(r),Ri.copy(e.ray).recast(e.near),!(mo.containsPoint(Ri.origin)===!1&&(Ri.intersectSphere(mo,cu)===null||Ri.origin.distanceToSquared(cu)>(e.far-e.near)**2))&&(lu.copy(r).invert(),Ri.copy(e.ray).applyMatrix4(lu),!(n.boundingBox!==null&&Ri.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Ri)))}_computeIntersections(e,t,n){let s,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,d=r.attributes.uv1,u=r.attributes.normal,h=r.groups,p=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,b=h.length;g<b;g++){let m=h[g],f=o[m.materialIndex],y=Math.max(m.start,p.start),T=Math.min(a.count,Math.min(m.start+m.count,p.start+p.count));for(let v=y,w=T;v<w;v+=3){let S=a.getX(v),E=a.getX(v+1),_=a.getX(v+2);s=bo(this,f,e,n,c,d,u,S,E,_),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,p.start),b=Math.min(a.count,p.start+p.count);for(let m=g,f=b;m<f;m+=3){let y=a.getX(m),T=a.getX(m+1),v=a.getX(m+2);s=bo(this,o,e,n,c,d,u,y,T,v),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,b=h.length;g<b;g++){let m=h[g],f=o[m.materialIndex],y=Math.max(m.start,p.start),T=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let v=y,w=T;v<w;v+=3){let S=v,E=v+1,_=v+2;s=bo(this,f,e,n,c,d,u,S,E,_),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,p.start),b=Math.min(l.count,p.start+p.count);for(let m=g,f=b;m<f;m+=3){let y=m,T=m+1,v=m+2;s=bo(this,o,e,n,c,d,u,y,T,v),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function sm(i,e,t,n,s,r,o,a){let l;if(e.side===Yt?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,e.side===Ln,a),l===null)return null;vo.copy(a),vo.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(vo);return c<t.near||c>t.far?null:{distance:c,point:vo.clone(),object:i}}function bo(i,e,t,n,s,r,o,a,l,c){i.getVertexPosition(a,go),i.getVertexPosition(l,_o),i.getVertexPosition(c,xo);let d=sm(i,e,t,n,go,_o,xo,hu);if(d){let u=new O;oi.getBarycoord(hu,go,_o,xo,u),s&&(d.uv=oi.getInterpolatedAttribute(s,a,l,c,u,new Oe)),r&&(d.uv1=oi.getInterpolatedAttribute(r,a,l,c,u,new Oe)),o&&(d.normal=oi.getInterpolatedAttribute(o,a,l,c,u,new O),d.normal.dot(n.direction)>0&&d.normal.multiplyScalar(-1));let h={a,b:l,c,normal:new O,materialIndex:0};oi.getNormal(go,_o,xo,h.normal),d.face=h,d.barycoord=u}return d}var cr=new lt,uu=new lt,du=new lt,rm=new lt,fu=new Be,So=new O,Bl=new li,pu=new Be,kl=new Di,gr=class extends Xt{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Hl,this.bindMatrix=new Be,this.bindMatrixInverse=new Be,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new xn),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,So),this.boundingBox.expandByPoint(So)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new li),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,So),this.boundingSphere.expandByPoint(So)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let n=this.material,s=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Bl.copy(this.boundingSphere),Bl.applyMatrix4(s),e.ray.intersectsSphere(Bl)!==!1&&(pu.copy(s).invert(),kl.copy(e.ray).applyMatrix4(pu),!(this.boundingBox!==null&&kl.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,kl)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new lt,t=this.geometry.attributes.skinWeight;for(let n=0,s=t.count;n<s;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===Hl?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Yu?this.bindMatrixInverse.copy(this.bindMatrix).invert():Le("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,s=this.geometry;uu.fromBufferAttribute(s.attributes.skinIndex,e),du.fromBufferAttribute(s.attributes.skinWeight,e),t.isVector4?(cr.copy(t),t.set(0,0,0,0)):(cr.set(...t,1),t.set(0,0,0)),cr.applyMatrix4(this.bindMatrix);for(let r=0;r<4;r++){let o=du.getComponent(r);if(o!==0){let a=uu.getComponent(r);fu.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(rm.copy(cr).applyMatrix4(fu),o)}}return t.isVector4&&(t.w=cr.w),t.applyMatrix4(this.bindMatrixInverse)}},Is=class extends Ot{constructor(){super(),this.isBone=!0,this.type="Bone"}},_r=class extends Ut{constructor(e=null,t=1,n=1,s,r,o,a,l,c=wt,d=wt,u,h){super(null,o,a,l,c,d,s,r,u,h),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},mu=new Be,om=new Be,xr=class i{constructor(e=[],t=[]){this.uuid=zi(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){Le("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,s=this.bones.length;n<s;n++)this.boneInverses.push(new Be)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new Be;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,s=this.boneTexture;for(let r=0,o=e.length;r<o;r++){let a=e[r]?e[r].matrixWorld:om;mu.multiplyMatrices(a,t[r]),mu.toArray(n,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new i(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new _r(t,e,e,qt,cn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,s=e.bones.length;n<s;n++){let r=e.bones[n],o=t[r];o===void 0&&(Le("Skeleton: No bone found with UUID:",r),o=new Is),this.bones.push(o),this.boneInverses.push(new Be().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let s=0,r=t.length;s<r;s++){let o=t[s];e.bones.push(o.uuid);let a=n[s];e.boneInverses.push(a.toArray())}return e}};var Ii=new li,am=new Oe(.5,.5),Mo=new O,Ps=class{constructor(e=new tn,t=new tn,n=new tn,s=new tn,r=new tn,o=new tn){this.planes=[e,t,n,s,r,o]}set(e,t,n,s,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=mn,n=!1){let s=this.planes,r=e.elements,o=r[0],a=r[1],l=r[2],c=r[3],d=r[4],u=r[5],h=r[6],p=r[7],g=r[8],b=r[9],m=r[10],f=r[11],y=r[12],T=r[13],v=r[14],w=r[15];if(s[0].setComponents(c-o,p-d,f-g,w-y).normalize(),s[1].setComponents(c+o,p+d,f+g,w+y).normalize(),s[2].setComponents(c+a,p+u,f+b,w+T).normalize(),s[3].setComponents(c-a,p-u,f-b,w-T).normalize(),n)s[4].setComponents(l,h,m,v).normalize(),s[5].setComponents(c-l,p-h,f-m,w-v).normalize();else if(s[4].setComponents(c-l,p-h,f-m,w-v).normalize(),t===mn)s[5].setComponents(c+l,p+h,f+m,w+v).normalize();else if(t===ws)s[5].setComponents(l,h,m,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ii.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ii.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ii)}intersectsSprite(e){Ii.center.set(0,0,0);let t=am.distanceTo(e.center);return Ii.radius=.7071067811865476+t,Ii.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ii)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(Mo.x=s.normal.x>0?e.max.x:e.min.x,Mo.y=s.normal.y>0?e.max.y:e.min.y,Mo.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Mo)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var ci=class extends Ut{constructor(e,t,n,s,r,o,a,l,c,d,u,h){super(null,o,a,l,c,d,s,r,u,h),this.isCompressedTexture=!0,this.image={width:t,height:n},this.mipmaps=e,this.flipY=!1,this.generateMipmaps=!1}};var yr=class extends Ut{constructor(e=[],t=gi,n,s,r,o,a,l,c,d){super(e,t,n,s,r,o,a,l,c,d),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},vr=class extends Ut{constructor(e,t,n,s,r,o,a,l,c){super(e,t,n,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var hi=class extends Ut{constructor(e,t,n=vn,s,r,o,a=wt,l=wt,c,d=In,u=1){if(d!==In&&d!==_i)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let h={width:e,height:t,depth:u};super(h,s,r,o,a,l,d,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Xn(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Bo=class extends hi{constructor(e,t=vn,n=gi,s,r,o=wt,a=wt,l,c=In){let d={width:e,height:e,depth:1},u=[d,d,d,d,d,d];super(e,e,t,n,s,r,o,a,l,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},br=class extends Ut{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Ls=class i extends At{constructor(e=1,t=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],d=[],u=[],h=0,p=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,s,o,2),g("x","z","y",1,-1,e,n,-t,s,o,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new Wt(c,3)),this.setAttribute("normal",new Wt(d,3)),this.setAttribute("uv",new Wt(u,2));function g(b,m,f,y,T,v,w,S,E,_,A){let R=v/E,P=w/_,U=v/2,k=w/2,I=S/2,F=E+1,$=_+1,X=0,ne=0,q=new O;for(let K=0;K<$;K++){let ee=K*P-k;for(let be=0;be<F;be++){let Se=be*R-U;q[b]=Se*y,q[m]=ee*T,q[f]=I,c.push(q.x,q.y,q.z),q[b]=0,q[m]=0,q[f]=S>0?1:-1,d.push(q.x,q.y,q.z),u.push(be/E),u.push(1-K/_),X+=1}}for(let K=0;K<_;K++)for(let ee=0;ee<E;ee++){let be=h+ee+F*K,Se=h+ee+F*(K+1),tt=h+(ee+1)+F*(K+1),Ge=h+(ee+1)+F*K;l.push(be,Se,Ge),l.push(Se,tt,Ge),ne+=6}a.addGroup(p,ne,A),p+=ne,h+=X}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var Sr=class i extends At{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);let r=[],o=[],a=[],l=[],c=new O,d=new Oe;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let u=0,h=3;u<=t;u++,h+=3){let p=n+u/t*s;c.x=e*Math.cos(p),c.y=e*Math.sin(p),o.push(c.x,c.y,c.z),a.push(0,0,1),d.x=(o[h]/e+1)/2,d.y=(o[h+1]/e+1)/2,l.push(d.x,d.y)}for(let u=1;u<=t;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new Wt(o,3)),this.setAttribute("normal",new Wt(a,3)),this.setAttribute("uv",new Wt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.segments,e.thetaStart,e.thetaLength)}};var Mr=class i extends At{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(s),c=a+1,d=l+1,u=e/a,h=t/l,p=[],g=[],b=[],m=[];for(let f=0;f<d;f++){let y=f*h-o;for(let T=0;T<c;T++){let v=T*u-r;g.push(v,-y,0),b.push(0,0,1),m.push(T/a),m.push(1-f/l)}}for(let f=0;f<l;f++)for(let y=0;y<a;y++){let T=y+c*f,v=y+c*(f+1),w=y+1+c*(f+1),S=y+1+c*f;p.push(T,v,S),p.push(v,w,S)}this.setIndex(p),this.setAttribute("position",new Wt(g,3)),this.setAttribute("normal",new Wt(b,3)),this.setAttribute("uv",new Wt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};function Hi(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];if(gu(s))s.isRenderTargetTexture?(Le("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(gu(s[0])){let r=[];for(let o=0,a=s.length;o<a;o++)r[o]=s[o].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function Vt(i){let e={};for(let t=0;t<i.length;t++){let n=Hi(i[t]);for(let s in n)e[s]=n[s]}return e}function gu(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function lm(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function vc(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:je.workingColorSpace}var ld={clone:Hi,merge:Vt},cm=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,hm=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,nn=class extends qn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=cm,this.fragmentShader=hm,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Hi(e.uniforms),this.uniformsGroups=lm(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new ke().setHex(s.value);break;case"v2":this.uniforms[n].value=new Oe().fromArray(s.value);break;case"v3":this.uniforms[n].value=new O().fromArray(s.value);break;case"v4":this.uniforms[n].value=new lt().fromArray(s.value);break;case"m3":this.uniforms[n].value=new ze().fromArray(s.value);break;case"m4":this.uniforms[n].value=new Be().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},ko=class extends nn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},wr=class extends qn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new ke(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ke(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Br,this.normalScale=new Oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Pn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var Ns=class extends qn{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new ke(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ke(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Br,this.normalScale=new Oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Pn,this.combine=ta,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},zo=class extends qn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=qu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Vo=class extends qn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function ps(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function zl(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var ui=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let o;t:{i:if(!(e<s)){for(let a=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=t[++n],e<s)break e}o=t.length;break t}if(!(e>=r)){let a=t[1];e<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}o=n,n=0;break t}break n}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Ho=class extends ui{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Wl,endingEnd:Wl}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,o=e+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case Xl:r=e,a=2*t-n;break;case Yl:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Xl:o=e,l=2*n-t;break;case Yl:o=1,l=n+s[1]-s[0];break;default:o=e-1,l=t}let c=(n-t)*.5,d=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=r*d,this._offsetNext=o*d}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,d=this._offsetPrev,u=this._offsetNext,h=this._weightPrev,p=this._weightNext,g=(n-t)/(s-t),b=g*g,m=b*g,f=-h*m+2*h*b-h*g,y=(1+h)*m+(-1.5-2*h)*b+(-.5+h)*g+1,T=(-1-p)*m+(1.5+p)*b+.5*g,v=p*m-p*b;for(let w=0;w!==a;++w)r[w]=f*o[d+w]+y*o[c+w]+T*o[l+w]+v*o[u+w];return r}},Go=class extends ui{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,d=(n-t)/(s-t),u=1-d;for(let h=0;h!==a;++h)r[h]=o[c+h]*u+o[l+h]*d;return r}},Wo=class extends ui{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},Xo=class extends ui{interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,d=this.inTangents,u=this.outTangents;if(!d||!u){let g=(n-t)/(s-t),b=1-g;for(let m=0;m!==a;++m)r[m]=o[c+m]*b+o[l+m]*g;return r}let h=a*2,p=e-1;for(let g=0;g!==a;++g){let b=o[c+g],m=o[l+g],f=p*h+g*2,y=u[f],T=u[f+1],v=e*h+g*2,w=d[v],S=d[v+1],E=dm(n,t,y,w,s);r[g]=cd(E,b,T,S,m)}return r}};function cd(i,e,t,n,s){let r=1-i;return r*r*r*e+3*r*r*i*t+3*r*i*i*n+i*i*i*s}function um(i,e,t,n,s){let r=1-i;return 3*r*r*(t-e)+6*r*i*(n-t)+3*i*i*(s-n)}function dm(i,e,t,n,s){let r=(i-e)/(s-e);for(let o=0;o<8;o++){let a=cd(r,e,t,n,s)-i;if(Math.abs(a)<1e-10)break;let l=um(r,e,t,n,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-a/l))}return r}var sn=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=ps(t,this.TimeBufferType),this.values=ps(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:ps(e.times,Array),values:ps(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s),zl(e.settings)&&(n.settings={inTangents:ps(e.settings.inTangents,Array),outTangents:ps(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Wo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Go(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Ho(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Xo(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Li:t=this.InterpolantFactoryMethodDiscrete;break;case Ms:t=this.InterpolantFactoryMethodLinear;break;case Ao:t=this.InterpolantFactoryMethodSmooth;break;case Gl:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Le("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Li;case this.InterpolantFactoryMethodLinear:return Ms;case this.InterpolantFactoryMethodSmooth:return Ao;case this.InterpolantFactoryMethodBezier:return Gl}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e;zl(this.settings)&&(_u(this.settings.inTangents,e),_u(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Fe("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(Fe("KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){Fe("KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){Fe("KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(s!==void 0&&Tp(s))for(let a=0,l=s.length;a!==l;++a){let c=s[a];if(isNaN(c)){Fe("KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Ao,r=e.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=e[a],d=e[a+1];if(c!==d&&(a!==1||c!==e[0]))if(s)l=!0;else{let u=a*n,h=u-n,p=u+n;for(let g=0;g!==n;++g){let b=t[u+g];if(b!==t[h+g]||b!==t[p+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let u=a*n,h=o*n;for(let p=0;p!==n;++p)t[h+p]=t[u+p]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,zl(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function _u(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}sn.prototype.ValueTypeName="";sn.prototype.TimeBufferType=Float32Array;sn.prototype.ValueBufferType=Float32Array;sn.prototype.DefaultInterpolation=Ms;var di=class extends sn{constructor(e,t,n){super(e,t,n)}};di.prototype.ValueTypeName="bool";di.prototype.ValueBufferType=Array;di.prototype.DefaultInterpolation=Li;di.prototype.InterpolantFactoryMethodLinear=void 0;di.prototype.InterpolantFactoryMethodSmooth=void 0;var Yo=class extends sn{constructor(e,t,n,s){super(e,t,n,s)}};Yo.prototype.ValueTypeName="color";var qo=class extends sn{constructor(e,t,n,s){super(e,t,n,s)}};qo.prototype.ValueTypeName="number";var $o=class extends ui{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(s-t),c=e*a;for(let d=c+a;c!==d;c+=4)Lt.slerpFlat(r,0,o,c-a,o,c,l);return r}},Tr=class extends sn{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new $o(this.times,this.values,this.getValueSize(),e)}};Tr.prototype.ValueTypeName="quaternion";Tr.prototype.InterpolantFactoryMethodSmooth=void 0;var fi=class extends sn{constructor(e,t,n){super(e,t,n)}};fi.prototype.ValueTypeName="string";fi.prototype.ValueBufferType=Array;fi.prototype.DefaultInterpolation=Li;fi.prototype.InterpolantFactoryMethodLinear=void 0;fi.prototype.InterpolantFactoryMethodSmooth=void 0;var Zo=class extends sn{constructor(e,t,n,s){super(e,t,n,s)}};Zo.prototype.ValueTypeName="vector";var Co={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(xu(i)||(this.files[i]=e))},get:function(i){if(this.enabled!==!1&&!xu(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function xu(i){try{let e=i.slice(i.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}var Ko=class{constructor(e,t,n){let s=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(d){a++,r===!1&&s.onStart!==void 0&&s.onStart(d,o,a),r=!0},this.itemEnd=function(d){o++,s.onProgress!==void 0&&s.onProgress(d,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(d){s.onError!==void 0&&s.onError(d)},this.resolveURL=function(d){return d=d.normalize("NFC"),l?l(d):d},this.setURLModifier=function(d){return l=d,this},this.addHandler=function(d,u){return c.push(d,u),this},this.removeHandler=function(d){let u=c.indexOf(d);return u!==-1&&c.splice(u,2),this},this.getHandler=function(d){for(let u=0,h=c.length;u<h;u+=2){let p=c[u],g=c[u+1];if(p.global&&(p.lastIndex=0),p.test(d))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},hd=new Ko,Ds=class{constructor(e){this.manager=e!==void 0?e:hd,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};Ds.DEFAULT_MATERIAL_NAME="__DEFAULT";var ms=new WeakMap,Jo=class extends Ds{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=Co.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0);else{let u=ms.get(o);u===void 0&&(u=[],ms.set(o,u)),u.push({onLoad:t,onError:s})}return o}let a=Ts("img");function l(){d(),t&&t(this);let u=ms.get(this)||[];for(let h=0;h<u.length;h++){let p=u[h];p.onLoad&&p.onLoad(this)}ms.delete(this),r.manager.itemEnd(e)}function c(u){d(),s&&s(u),Co.remove(`image:${e}`);let h=ms.get(this)||[];for(let p=0;p<h.length;p++){let g=h[p];g.onError&&g.onError(u)}ms.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function d(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),Co.add(`image:${e}`,a),r.manager.itemStart(e),a.src=e,a}};var Oi=class extends Ds{constructor(e){super(e)}load(e,t,n,s){let r=new Ut,o=new Jo(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}},Ar=class extends Ot{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new ke(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Er=class extends Ar{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ot.DEFAULT_UP),this.updateMatrix(),this.groundColor=new ke(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Vl=new Be,yu=new O,vu=new O,jo=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Oe(512,512),this.mapType=Kt,this.map=null,this.mapPass=null,this.matrix=new Be,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ps,this._frameExtents=new Oe(1,1),this._viewportCount=1,this._viewports=[new lt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;yu.setFromMatrixPosition(e.matrixWorld),t.position.copy(yu),vu.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(vu),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){Vl.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(Vl,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,o=s?s.z/r.x:1,a=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===ws||e.reversedDepth?t.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,1,0,0,0,0,1):t.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,.5,.5,0,0,0,1),t.multiply(Vl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},wo=new O,To=new Lt,Rn=new O,Cr=class extends Ot{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Be,this.projectionMatrix=new Be,this.projectionMatrixInverse=new Be,this.coordinateSystem=mn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(wo,To,Rn),Rn.x===1&&Rn.y===1&&Rn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(wo,To,Rn.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(wo,To,Rn),Rn.x===1&&Rn.y===1&&Rn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(wo,To,Rn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},ri=new O,bu=new Oe,Su=new Oe,zt=class extends Cr{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Es*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(hr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Es*2*Math.atan(Math.tan(hr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){ri.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ri.x,ri.y).multiplyScalar(-e/ri.z),ri.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ri.x,ri.y).multiplyScalar(-e/ri.z)}getViewSize(e,t){return this.getViewBounds(e,bu,Su),t.subVectors(Su,bu)}setViewOffset(e,t,n,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(hr*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var Us=class extends Cr{constructor(e=-1,t=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,o=n+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,d=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=d*this.view.offsetY,l=a-d*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},ql=class extends jo{constructor(){super(new Us(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Os=class extends Ar{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ot.DEFAULT_UP),this.updateMatrix(),this.target=new Ot,this.shadow=new ql}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var gs=-90,_s=1,Qo=class extends Ot{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new zt(gs,_s,e,t);s.layers=this.layers,this.add(s);let r=new zt(gs,_s,e,t);r.layers=this.layers,this.add(r);let o=new zt(gs,_s,e,t);o.layers=this.layers,this.add(o);let a=new zt(gs,_s,e,t);a.layers=this.layers,this.add(a);let l=new zt(gs,_s,e,t);l.layers=this.layers,this.add(l);let c=new zt(gs,_s,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,o,a,l]=t;for(let c of t)this.remove(c);if(e===mn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===ws)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,d]=this.children,u=e.getRenderTarget(),h=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let b=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=b,e.setRenderTarget(n,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,d),e.setRenderTarget(u,h,p),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},ea=class extends zt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var bc="\\[\\]\\.:\\/",fm=new RegExp("["+bc+"]","g"),Sc="[^"+bc+"]",pm="[^"+bc.replace("\\.","")+"]",mm=/((?:WC+[\/:])*)/.source.replace("WC",Sc),gm=/(WCOD+)?/.source.replace("WCOD",pm),_m=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Sc),xm=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Sc),ym=new RegExp("^"+mm+gm+_m+xm+"$"),vm=["material","materials","bones","map"],$l=class{constructor(e,t,n){let s=n||ot.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},ot=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(fm,"")}static parseTrackName(e){let t=ym.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);vm.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let l=n(a.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Le("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){Fe("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Fe("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Fe("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let d=0;d<e.length;d++)if(e[d].name===c){c=d;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Fe("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Fe("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){Fe("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){Fe("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[s];if(o===void 0){let c=t.nodeName;Fe("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){Fe("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Fe("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ot.Composite=$l;ot.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ot.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ot.prototype.GetterByBindingType=[ot.prototype._getValue_direct,ot.prototype._getValue_array,ot.prototype._getValue_arrayElement,ot.prototype._getValue_toArray];ot.prototype.SetterByBindingTypeAndVersioning=[[ot.prototype._setValue_direct,ot.prototype._setValue_direct_setNeedsUpdate,ot.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ot.prototype._setValue_array,ot.prototype._setValue_array_setNeedsUpdate,ot.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ot.prototype._setValue_arrayElement,ot.prototype._setValue_arrayElement_setNeedsUpdate,ot.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ot.prototype._setValue_fromArray,ot.prototype._setValue_fromArray_setNeedsUpdate,ot.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var nb=new Float32Array(1);var Fs=class{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=$e(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos($e(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var Zl=class i{static{i.prototype.isMatrix2=!0}constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};var Rr=class extends _n{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function Mc(i,e,t,n){let s=bm(n);switch(t){case pc:return i*e;case gc:return i*e/s.components*s.byteLength;case la:return i*e/s.components*s.byteLength;case xi:return i*e*2/s.components*s.byteLength;case ca:return i*e*2/s.components*s.byteLength;case mc:return i*e*3/s.components*s.byteLength;case qt:return i*e*4/s.components*s.byteLength;case ha:return i*e*4/s.components*s.byteLength;case Lr:case Nr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Dr:case Ur:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case da:case pa:return Math.max(i,16)*Math.max(e,8)/4;case ua:case fa:return Math.max(i,8)*Math.max(e,8)/2;case ma:case ga:case xa:case ya:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case _a:case Or:case va:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ba:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Sa:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Ma:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case wa:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Ta:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Aa:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Ea:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Ca:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Ra:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Ia:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Pa:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case La:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Na:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Da:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Ua:case Oa:case Fa:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Ba:case ka:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Fr:case za:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function bm(i){switch(i){case Kt:case hc:return{byteLength:1,components:1};case Vs:case uc:case bn:return{byteLength:2,components:1};case oa:case aa:return{byteLength:2,components:4};case vn:case ra:case cn:return{byteLength:4,components:1};case dc:case fc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Le("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function Ld(){let i=null,e=!1,t=null,n=null;function s(r,o){n=i.requestAnimationFrame(s),t(r,o)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function Sm(i){let e=new WeakMap;function t(a,l){let c=a.array,d=a.usage,u=c.byteLength,h=i.createBuffer();i.bindBuffer(l,h),i.bufferData(l,c,d),a.onUploadCallback();let p;if(c instanceof Float32Array)p=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)p=i.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=i.SHORT;else if(c instanceof Uint32Array)p=i.UNSIGNED_INT;else if(c instanceof Int32Array)p=i.INT;else if(c instanceof Int8Array)p=i.BYTE;else if(c instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,l,c){let d=l.array,u=l.updateRanges;if(i.bindBuffer(c,a),u.length===0)i.bufferSubData(c,0,d);else{u.sort((p,g)=>p.start-g.start);let h=0;for(let p=1;p<u.length;p++){let g=u[h],b=u[p];b.start<=g.start+g.count+1?g.count=Math.max(g.count,b.start+b.count-g.start):(++h,u[h]=b)}u.length=h+1;for(let p=0,g=u.length;p<g;p++){let b=u[p];i.bufferSubData(c,b.start*d.BYTES_PER_ELEMENT,d,b.start,b.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(i.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let d=e.get(a);(!d||d.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var Mm=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,wm=`#ifdef USE_ALPHAHASH
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
#endif`,Tm=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Am=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Em=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Cm=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Rm=`#ifdef USE_AOMAP
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
#endif`,Im=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Pm=`#ifdef USE_BATCHING
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
#endif`,Lm=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Nm=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Dm=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Um=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Om=`#ifdef USE_IRIDESCENCE
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
#endif`,Fm=`#ifdef USE_BUMPMAP
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
#endif`,Bm=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,km=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,zm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Vm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Hm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Gm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Wm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Xm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,Ym=`#define PI 3.141592653589793
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
} // validated`,qm=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,$m=`vec3 transformedNormal = objectNormal;
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
#endif`,Zm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Km=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Jm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,jm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Qm="gl_FragColor = linearToOutputTexel( gl_FragColor );",eg=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,tg=`#ifdef USE_ENVMAP
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
#endif`,ng=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,ig=`#ifdef USE_ENVMAP
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
#endif`,sg=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,rg=`#ifdef USE_ENVMAP
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
#endif`,og=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,ag=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,lg=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,cg=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,hg=`#ifdef USE_GRADIENTMAP
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
}`,ug=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,dg=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,fg=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,pg=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,mg=`#ifdef USE_ENVMAP
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
#endif`,gg=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,_g=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,xg=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,yg=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,vg=`PhysicalMaterial material;
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
#endif`,bg=`uniform sampler2D dfgLUT;
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
}`,Sg=`
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
#endif`,Mg=`#if defined( RE_IndirectDiffuse )
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
#endif`,wg=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Tg=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,Ag=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Eg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Cg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Rg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Ig=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Pg=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Lg=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Ng=`#if defined( USE_POINTS_UV )
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
#endif`,Dg=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Ug=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Og=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Fg=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Bg=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,kg=`#ifdef USE_MORPHTARGETS
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
#endif`,zg=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Vg=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Hg=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Gg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Wg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Xg=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Yg=`#ifdef USE_NORMALMAP
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
#endif`,qg=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,$g=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Zg=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Kg=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Jg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,jg=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Qg=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,e0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,t0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,n0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,i0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,s0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,r0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,o0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,a0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,l0=`float getShadowMask() {
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
}`,c0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,h0=`#ifdef USE_SKINNING
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
#endif`,u0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,d0=`#ifdef USE_SKINNING
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
#endif`,f0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,p0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,m0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,g0=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,_0=`#ifdef USE_TRANSMISSION
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
#endif`,x0=`#ifdef USE_TRANSMISSION
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
#endif`,y0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,v0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,b0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,S0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,M0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,w0=`uniform sampler2D t2D;
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
}`,T0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,A0=`#ifdef ENVMAP_TYPE_CUBE
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
}`,E0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,C0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,R0=`#include <common>
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
}`,I0=`#if DEPTH_PACKING == 3200
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
}`,P0=`#define DISTANCE
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
}`,L0=`#define DISTANCE
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
}`,N0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,D0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,U0=`uniform float scale;
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
}`,O0=`uniform vec3 diffuse;
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
}`,F0=`#include <common>
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
}`,B0=`uniform vec3 diffuse;
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
}`,k0=`#define LAMBERT
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
}`,z0=`#define LAMBERT
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
}`,V0=`#define MATCAP
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
}`,H0=`#define MATCAP
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
}`,G0=`#define NORMAL
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
}`,W0=`#define NORMAL
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
}`,X0=`#define PHONG
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
}`,Y0=`#define PHONG
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
}`,q0=`#define STANDARD
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
}`,$0=`#define STANDARD
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
}`,Z0=`#define TOON
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
}`,K0=`#define TOON
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
}`,J0=`uniform float size;
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
}`,j0=`uniform vec3 diffuse;
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
}`,Q0=`#include <common>
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
}`,e_=`uniform vec3 color;
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
}`,t_=`uniform float rotation;
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
}`,n_=`uniform vec3 diffuse;
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
}`,Xe={alphahash_fragment:Mm,alphahash_pars_fragment:wm,alphamap_fragment:Tm,alphamap_pars_fragment:Am,alphatest_fragment:Em,alphatest_pars_fragment:Cm,aomap_fragment:Rm,aomap_pars_fragment:Im,batching_pars_vertex:Pm,batching_vertex:Lm,begin_vertex:Nm,beginnormal_vertex:Dm,bsdfs:Um,iridescence_fragment:Om,bumpmap_pars_fragment:Fm,clipping_planes_fragment:Bm,clipping_planes_pars_fragment:km,clipping_planes_pars_vertex:zm,clipping_planes_vertex:Vm,color_fragment:Hm,color_pars_fragment:Gm,color_pars_vertex:Wm,color_vertex:Xm,common:Ym,cube_uv_reflection_fragment:qm,defaultnormal_vertex:$m,displacementmap_pars_vertex:Zm,displacementmap_vertex:Km,emissivemap_fragment:Jm,emissivemap_pars_fragment:jm,colorspace_fragment:Qm,colorspace_pars_fragment:eg,envmap_fragment:tg,envmap_common_pars_fragment:ng,envmap_pars_fragment:ig,envmap_pars_vertex:sg,envmap_physical_pars_fragment:mg,envmap_vertex:rg,fog_vertex:og,fog_pars_vertex:ag,fog_fragment:lg,fog_pars_fragment:cg,gradientmap_pars_fragment:hg,lightmap_pars_fragment:ug,lights_lambert_fragment:dg,lights_lambert_pars_fragment:fg,lights_pars_begin:pg,lights_toon_fragment:gg,lights_toon_pars_fragment:_g,lights_phong_fragment:xg,lights_phong_pars_fragment:yg,lights_physical_fragment:vg,lights_physical_pars_fragment:bg,lights_fragment_begin:Sg,lights_fragment_maps:Mg,lights_fragment_end:wg,lightprobes_pars_fragment:Tg,logdepthbuf_fragment:Ag,logdepthbuf_pars_fragment:Eg,logdepthbuf_pars_vertex:Cg,logdepthbuf_vertex:Rg,map_fragment:Ig,map_pars_fragment:Pg,map_particle_fragment:Lg,map_particle_pars_fragment:Ng,metalnessmap_fragment:Dg,metalnessmap_pars_fragment:Ug,morphinstance_vertex:Og,morphcolor_vertex:Fg,morphnormal_vertex:Bg,morphtarget_pars_vertex:kg,morphtarget_vertex:zg,normal_fragment_begin:Vg,normal_fragment_maps:Hg,normal_pars_fragment:Gg,normal_pars_vertex:Wg,normal_vertex:Xg,normalmap_pars_fragment:Yg,clearcoat_normal_fragment_begin:qg,clearcoat_normal_fragment_maps:$g,clearcoat_pars_fragment:Zg,iridescence_pars_fragment:Kg,opaque_fragment:Jg,packing:jg,premultiplied_alpha_fragment:Qg,project_vertex:e0,dithering_fragment:t0,dithering_pars_fragment:n0,roughnessmap_fragment:i0,roughnessmap_pars_fragment:s0,shadowmap_pars_fragment:r0,shadowmap_pars_vertex:o0,shadowmap_vertex:a0,shadowmask_pars_fragment:l0,skinbase_vertex:c0,skinning_pars_vertex:h0,skinning_vertex:u0,skinnormal_vertex:d0,specularmap_fragment:f0,specularmap_pars_fragment:p0,tonemapping_fragment:m0,tonemapping_pars_fragment:g0,transmission_fragment:_0,transmission_pars_fragment:x0,uv_pars_fragment:y0,uv_pars_vertex:v0,uv_vertex:b0,worldpos_vertex:S0,background_vert:M0,background_frag:w0,backgroundCube_vert:T0,backgroundCube_frag:A0,cube_vert:E0,cube_frag:C0,depth_vert:R0,depth_frag:I0,distance_vert:P0,distance_frag:L0,equirect_vert:N0,equirect_frag:D0,linedashed_vert:U0,linedashed_frag:O0,meshbasic_vert:F0,meshbasic_frag:B0,meshlambert_vert:k0,meshlambert_frag:z0,meshmatcap_vert:V0,meshmatcap_frag:H0,meshnormal_vert:G0,meshnormal_frag:W0,meshphong_vert:X0,meshphong_frag:Y0,meshphysical_vert:q0,meshphysical_frag:$0,meshtoon_vert:Z0,meshtoon_frag:K0,points_vert:J0,points_frag:j0,shadow_vert:Q0,shadow_frag:e_,sprite_vert:t_,sprite_frag:n_},me={common:{diffuse:{value:new ke(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ze},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ze}},envmap:{envMap:{value:null},envMapRotation:{value:new ze},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ze}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ze}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ze},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ze},normalScale:{value:new Oe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ze},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ze}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ze}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ze}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ke(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new O},probesMax:{value:new O},probesResolution:{value:new O}},points:{diffuse:{value:new ke(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0},uvTransform:{value:new ze}},sprite:{diffuse:{value:new ke(16777215)},opacity:{value:1},center:{value:new Oe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ze},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0}}},On={basic:{uniforms:Vt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.fog]),vertexShader:Xe.meshbasic_vert,fragmentShader:Xe.meshbasic_frag},lambert:{uniforms:Vt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new ke(0)},envMapIntensity:{value:1}}]),vertexShader:Xe.meshlambert_vert,fragmentShader:Xe.meshlambert_frag},phong:{uniforms:Vt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new ke(0)},specular:{value:new ke(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Xe.meshphong_vert,fragmentShader:Xe.meshphong_frag},standard:{uniforms:Vt([me.common,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.roughnessmap,me.metalnessmap,me.fog,me.lights,{emissive:{value:new ke(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Xe.meshphysical_vert,fragmentShader:Xe.meshphysical_frag},toon:{uniforms:Vt([me.common,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.gradientmap,me.fog,me.lights,{emissive:{value:new ke(0)}}]),vertexShader:Xe.meshtoon_vert,fragmentShader:Xe.meshtoon_frag},matcap:{uniforms:Vt([me.common,me.bumpmap,me.normalmap,me.displacementmap,me.fog,{matcap:{value:null}}]),vertexShader:Xe.meshmatcap_vert,fragmentShader:Xe.meshmatcap_frag},points:{uniforms:Vt([me.points,me.fog]),vertexShader:Xe.points_vert,fragmentShader:Xe.points_frag},dashed:{uniforms:Vt([me.common,me.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Xe.linedashed_vert,fragmentShader:Xe.linedashed_frag},depth:{uniforms:Vt([me.common,me.displacementmap]),vertexShader:Xe.depth_vert,fragmentShader:Xe.depth_frag},normal:{uniforms:Vt([me.common,me.bumpmap,me.normalmap,me.displacementmap,{opacity:{value:1}}]),vertexShader:Xe.meshnormal_vert,fragmentShader:Xe.meshnormal_frag},sprite:{uniforms:Vt([me.sprite,me.fog]),vertexShader:Xe.sprite_vert,fragmentShader:Xe.sprite_frag},background:{uniforms:{uvTransform:{value:new ze},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Xe.background_vert,fragmentShader:Xe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ze}},vertexShader:Xe.backgroundCube_vert,fragmentShader:Xe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Xe.cube_vert,fragmentShader:Xe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Xe.equirect_vert,fragmentShader:Xe.equirect_frag},distance:{uniforms:Vt([me.common,me.displacementmap,{referencePosition:{value:new O},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Xe.distance_vert,fragmentShader:Xe.distance_frag},shadow:{uniforms:Vt([me.lights,me.fog,{color:{value:new ke(0)},opacity:{value:1}}]),vertexShader:Xe.shadow_vert,fragmentShader:Xe.shadow_frag}};On.physical={uniforms:Vt([On.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ze},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ze},clearcoatNormalScale:{value:new Oe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ze},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ze},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ze},sheen:{value:0},sheenColor:{value:new ke(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ze},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ze},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ze},transmissionSamplerSize:{value:new Oe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ze},attenuationDistance:{value:0},attenuationColor:{value:new ke(0)},specularColor:{value:new ke(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ze},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ze},anisotropyVector:{value:new Oe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ze}}]),vertexShader:Xe.meshphysical_vert,fragmentShader:Xe.meshphysical_frag};var Ga={r:0,b:0,g:0},i_=new Be,Nd=new ze;Nd.set(-1,0,0,0,1,0,0,0,1);function s_(i,e,t,n,s,r){let o=new ke(0),a=s===!0?0:1,l,c,d=null,u=0,h=null;function p(y){let T=y.isScene===!0?y.background:null;if(T&&T.isTexture){let v=y.backgroundBlurriness>0;T=e.get(T,v)}return T}function g(y){let T=!1,v=p(y);v===null?m(o,a):v&&v.isColor&&(m(v,1),T=!0);let w=i.xr.getEnvironmentBlendMode();w==="additive"?t.buffers.color.setClear(0,0,0,1,r):w==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||T)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function b(y,T){let v=p(T);v&&(v.isCubeTexture||v.mapping===Pr)?(c===void 0&&(c=new Xt(new Ls(1,1,1),new nn({name:"BackgroundCubeMaterial",uniforms:Hi(On.backgroundCube.uniforms),vertexShader:On.backgroundCube.vertexShader,fragmentShader:On.backgroundCube.fragmentShader,side:Yt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(w,S,E){this.matrixWorld.copyPosition(E.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=v,c.material.uniforms.backgroundBlurriness.value=T.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(i_.makeRotationFromEuler(T.backgroundRotation)).transpose(),v.isCubeTexture&&v.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Nd),c.material.toneMapped=je.getTransfer(v.colorSpace)!==at,(d!==v||u!==v.version||h!==i.toneMapping)&&(c.material.needsUpdate=!0,d=v,u=v.version,h=i.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null)):v&&v.isTexture&&(l===void 0&&(l=new Xt(new Mr(2,2),new nn({name:"BackgroundMaterial",uniforms:Hi(On.background.uniforms),vertexShader:On.background.vertexShader,fragmentShader:On.background.fragmentShader,side:Ln,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=v,l.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,l.material.toneMapped=je.getTransfer(v.colorSpace)!==at,v.matrixAutoUpdate===!0&&v.updateMatrix(),l.material.uniforms.uvTransform.value.copy(v.matrix),(d!==v||u!==v.version||h!==i.toneMapping)&&(l.material.needsUpdate=!0,d=v,u=v.version,h=i.toneMapping),l.layers.enableAll(),y.unshift(l,l.geometry,l.material,0,0,null))}function m(y,T){y.getRGB(Ga,vc(i)),t.buffers.color.setClear(Ga.r,Ga.g,Ga.b,T,r)}function f(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(y,T=1){o.set(y),a=T,m(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(y){a=y,m(o,a)},render:g,addToRenderList:b,dispose:f}}function r_(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=h(null),r=s,o=!1;function a(P,U,k,I,F){let $=!1,X=u(P,I,k,U);r!==X&&(r=X,c(r.object)),$=p(P,I,k,F),$&&g(P,I,k,F),F!==null&&e.update(F,i.ELEMENT_ARRAY_BUFFER),($||o)&&(o=!1,v(P,U,k,I),F!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(F).buffer))}function l(){return i.createVertexArray()}function c(P){return i.bindVertexArray(P)}function d(P){return i.deleteVertexArray(P)}function u(P,U,k,I){let F=I.wireframe===!0,$=n[U.id];$===void 0&&($={},n[U.id]=$);let X=P.isInstancedMesh===!0?P.id:0,ne=$[X];ne===void 0&&(ne={},$[X]=ne);let q=ne[k.id];q===void 0&&(q={},ne[k.id]=q);let K=q[F];return K===void 0&&(K=h(l()),q[F]=K),K}function h(P){let U=[],k=[],I=[];for(let F=0;F<t;F++)U[F]=0,k[F]=0,I[F]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:U,enabledAttributes:k,attributeDivisors:I,object:P,attributes:{},index:null}}function p(P,U,k,I){let F=r.attributes,$=U.attributes,X=0,ne=k.getAttributes();for(let q in ne)if(ne[q].location>=0){let ee=F[q],be=$[q];if(be===void 0&&(q==="instanceMatrix"&&P.instanceMatrix&&(be=P.instanceMatrix),q==="instanceColor"&&P.instanceColor&&(be=P.instanceColor)),ee===void 0||ee.attribute!==be||be&&ee.data!==be.data)return!0;X++}return r.attributesNum!==X||r.index!==I}function g(P,U,k,I){let F={},$=U.attributes,X=0,ne=k.getAttributes();for(let q in ne)if(ne[q].location>=0){let ee=$[q];ee===void 0&&(q==="instanceMatrix"&&P.instanceMatrix&&(ee=P.instanceMatrix),q==="instanceColor"&&P.instanceColor&&(ee=P.instanceColor));let be={};be.attribute=ee,ee&&ee.data&&(be.data=ee.data),F[q]=be,X++}r.attributes=F,r.attributesNum=X,r.index=I}function b(){let P=r.newAttributes;for(let U=0,k=P.length;U<k;U++)P[U]=0}function m(P){f(P,0)}function f(P,U){let k=r.newAttributes,I=r.enabledAttributes,F=r.attributeDivisors;k[P]=1,I[P]===0&&(i.enableVertexAttribArray(P),I[P]=1),F[P]!==U&&(i.vertexAttribDivisor(P,U),F[P]=U)}function y(){let P=r.newAttributes,U=r.enabledAttributes;for(let k=0,I=U.length;k<I;k++)U[k]!==P[k]&&(i.disableVertexAttribArray(k),U[k]=0)}function T(P,U,k,I,F,$,X){X===!0?i.vertexAttribIPointer(P,U,k,F,$):i.vertexAttribPointer(P,U,k,I,F,$)}function v(P,U,k,I){b();let F=I.attributes,$=k.getAttributes(),X=U.defaultAttributeValues;for(let ne in $){let q=$[ne];if(q.location>=0){let K=F[ne];if(K===void 0&&(ne==="instanceMatrix"&&P.instanceMatrix&&(K=P.instanceMatrix),ne==="instanceColor"&&P.instanceColor&&(K=P.instanceColor)),K!==void 0){let ee=K.normalized,be=K.itemSize,Se=e.get(K);if(Se===void 0)continue;let tt=Se.buffer,Ge=Se.type,te=Se.bytesPerElement,H=Ge===i.INT||Ge===i.UNSIGNED_INT||K.gpuType===ra;if(K.isInterleavedBufferAttribute){let G=K.data,ae=G.stride,Te=K.offset;if(G.isInstancedInterleavedBuffer){for(let fe=0;fe<q.locationSize;fe++)f(q.location+fe,G.meshPerAttribute);P.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=G.meshPerAttribute*G.count)}else for(let fe=0;fe<q.locationSize;fe++)m(q.location+fe);i.bindBuffer(i.ARRAY_BUFFER,tt);for(let fe=0;fe<q.locationSize;fe++)T(q.location+fe,be/q.locationSize,Ge,ee,ae*te,(Te+be/q.locationSize*fe)*te,H)}else{if(K.isInstancedBufferAttribute){for(let G=0;G<q.locationSize;G++)f(q.location+G,K.meshPerAttribute);P.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=K.meshPerAttribute*K.count)}else for(let G=0;G<q.locationSize;G++)m(q.location+G);i.bindBuffer(i.ARRAY_BUFFER,tt);for(let G=0;G<q.locationSize;G++)T(q.location+G,be/q.locationSize,Ge,ee,be*te,be/q.locationSize*G*te,H)}}else if(X!==void 0){let ee=X[ne];if(ee!==void 0)switch(ee.length){case 2:i.vertexAttrib2fv(q.location,ee);break;case 3:i.vertexAttrib3fv(q.location,ee);break;case 4:i.vertexAttrib4fv(q.location,ee);break;default:i.vertexAttrib1fv(q.location,ee)}}}}y()}function w(){A();for(let P in n){let U=n[P];for(let k in U){let I=U[k];for(let F in I){let $=I[F];for(let X in $)d($[X].object),delete $[X];delete I[F]}}delete n[P]}}function S(P){if(n[P.id]===void 0)return;let U=n[P.id];for(let k in U){let I=U[k];for(let F in I){let $=I[F];for(let X in $)d($[X].object),delete $[X];delete I[F]}}delete n[P.id]}function E(P){for(let U in n){let k=n[U];for(let I in k){let F=k[I];if(F[P.id]===void 0)continue;let $=F[P.id];for(let X in $)d($[X].object),delete $[X];delete F[P.id]}}}function _(P){for(let U in n){let k=n[U],I=P.isInstancedMesh===!0?P.id:0,F=k[I];if(F!==void 0){for(let $ in F){let X=F[$];for(let ne in X)d(X[ne].object),delete X[ne];delete F[$]}delete k[I],Object.keys(k).length===0&&delete n[U]}}}function A(){R(),o=!0,r!==s&&(r=s,c(r.object))}function R(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:A,resetDefaultState:R,dispose:w,releaseStatesOfGeometry:S,releaseStatesOfObject:_,releaseStatesOfProgram:E,initAttributes:b,enableAttribute:m,disableUnusedAttributes:y}}function o_(i,e,t){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function o(l,c,d){d!==0&&(i.drawArraysInstanced(n,l,c,d),t.update(c,n,d))}function a(l,c,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,d);let h=0;for(let p=0;p<d;p++)h+=c[p];t.update(h,n,1)}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function a_(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let E=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(E.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(E){return!(E!==qt&&n.convert(E)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(E){let _=E===bn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(E!==Kt&&E!==cn&&!_&&n.convert(E)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(E){if(E==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";E="mediump"}return E==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",d=l(c);d!==c&&(Le("WebGLRenderer:",c,"not supported, using",d,"instead."),c=d);let u=t.logarithmicDepthBuffer===!0,h=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&h===!1&&Le("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),b=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),f=i.getParameter(i.MAX_VERTEX_ATTRIBS),y=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),T=i.getParameter(i.MAX_VARYING_VECTORS),v=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),w=i.getParameter(i.MAX_SAMPLES),S=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:h,maxTextures:p,maxVertexTextures:g,maxTextureSize:b,maxCubemapSize:m,maxAttributes:f,maxVertexUniforms:y,maxVaryings:T,maxFragmentUniforms:v,maxSamples:w,samples:S}}function l_(i){let e=this,t=null,n=0,s=!1,r=!1,o=new tn,a=new ze,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,h){let p=u.length!==0||h||n!==0||s;return s=h,n=u.length,p},this.beginShadows=function(){r=!0,d(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,h){t=d(u,h,0)},this.setState=function(u,h,p){let g=u.clippingPlanes,b=u.clipIntersection,m=u.clipShadows,f=i.get(u);if(!s||g===null||g.length===0||r&&!m)r?d(null):c();else{let y=r?0:n,T=y*4,v=f.clippingState||null;l.value=v,v=d(g,h,T,p);for(let w=0;w!==T;++w)v[w]=t[w];f.clippingState=v,this.numIntersection=b?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function d(u,h,p,g){let b=u!==null?u.length:0,m=null;if(b!==0){if(m=l.value,g!==!0||m===null){let f=p+b*4,y=h.matrixWorldInverse;a.getNormalMatrix(y),(m===null||m.length<f)&&(m=new Float32Array(f));for(let T=0,v=p;T!==b;++T,v+=4)o.copy(u[T]).applyMatrix4(y,a),o.normal.toArray(m,v),m[v+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=b,e.numIntersection=0,m}}var Ws=4,c_=6,h_=20,u_=256,kr=new Us,ud=new ke,wc=null,Tc=0,Ac=0,Ec=!1,d_=new O,Gi=new O,Xa=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){let{size:o=256,position:a=d_}=r;wc=this._renderer.getRenderTarget(),Tc=this._renderer.getActiveCubeFace(),Ac=this._renderer.getActiveMipmapLevel(),Ec=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=pd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=fd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(wc,Tc,Ac),this._renderer.xr.enabled=Ec,e.scissorTest=!1,Gs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===gi||e.mapping===Bi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),wc=this._renderer.getRenderTarget(),Tc=this._renderer.getActiveCubeFace(),Ac=this._renderer.getActiveMipmapLevel(),Ec=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Tt,minFilter:Tt,generateMipmaps:!1,type:bn,format:qt,colorSpace:dr,depthBuffer:!1},s=dd(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=dd(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=f_(r)),this._blurMaterial=m_(r,e,t),this._ggxMaterial=p_(r,e,t)}return s}_compileMaterial(e){let t=new Xt(new At,e);this._renderer.compile(t,kr)}_sceneToCubeUV(e,t,n,s,r){let l=new zt(90,1,t,n),c=[1,-1,1,1,1,1],d=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,p=u.toneMapping;u.getClearColor(ud),u.toneMapping=yn,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(s),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Xt(new Ls,new Ui({name:"PMREM.Background",side:Yt,depthWrite:!1,depthTest:!1})));let b=this._backgroundBox,m=b.material,f=!1,y=e.background;y?y.isColor&&(m.color.copy(y),e.background=null,f=!0):(m.color.copy(ud),f=!0);for(let T=0;T<6;T++){let v=T%3;v===0?(l.up.set(0,c[T],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+d[T],r.y,r.z)):v===1?(l.up.set(0,0,c[T]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+d[T],r.z)):(l.up.set(0,c[T],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+d[T]));let w=this._cubeSize;Gs(s,v*w,T>2?w:0,w,w),u.setRenderTarget(s),f&&u.render(b,l),u.render(e,l)}u.toneMapping=p,u.autoClear=h,e.background=y}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===gi||e.mapping===Bi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=pd()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=fd());let r=s?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;let a=r.uniforms;a.envMap.value=e;let l=this._cubeSize;Gs(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,kr)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){let s=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[n];a.material=o;let l=o.uniforms,c=n/(this._lodMeshes.length-1),d=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-d*d),h=c*1.25,p=u*h,{_lodMax:g}=this,b=this._sizeLods[n],m=3*b*(n>g-Ws?n-g+Ws:0),f=4*(this._cubeSize-b);l.envMap.value=e.texture,l.roughness.value=p,l.mipInt.value=g-t,Gs(r,m,f,3*b,2*b),s.setRenderTarget(r),s.render(a,kr),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=g-n,Gs(e,m,f,3*b,2*b),s.setRenderTarget(e),s.render(a,kr)}_blur(e,t,n,s){let r=this._pingPongRenderTarget,o=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(e,r,t,n,o),this._blurPass(r,e,n,n,o)}_blurPass(e,t,n,s,r){let o=this._renderer,a=this._blurMaterial,l=this._lodMeshes[s];l.material=a;let c=a.uniforms;c.envMap.value=e.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-n;let d=this._sizeLods[s],u=3*d*(s>this._lodMax-Ws?s-this._lodMax+Ws:0),h=4*(this._cubeSize-d);Gs(t,u,h,3*d,2*d),o.setRenderTarget(t),o.render(l,kr)}};function f_(i){let e=[],t=[],n=i,s=i-Ws+1+c_;for(let r=0;r<s;r++){let o=Math.pow(2,n);e.push(o);let a=1/(o-2),l=-a,c=1+a,d=[l,l,c,l,c,c,l,l,c,c,l,c],u=6,h=6,p=3,g=new Float32Array(p*h*u),b=new Float32Array(p*h*u);for(let f=0;f<u;f++){let y=f%3*2/3-1,T=f>2?0:-1,v=[y,T,0,y+2/3,T,0,y+2/3,T+1,0,y,T,0,y+2/3,T+1,0,y,T+1,0];g.set(v,p*h*f);for(let w=0;w<h;w++){let S=d[w*2]*2-1,E=d[w*2+1]*2-1;f===0?Gi.set(1,E,S):f===1?Gi.set(-S,1,-E):f===2?Gi.set(-S,E,1):f===3?Gi.set(-1,E,-S):f===4?Gi.set(-S,-1,E):Gi.set(S,E,-1),Gi.toArray(b,(f*h+w)*p)}}let m=new At;m.setAttribute("position",new Ve(g,p)),m.setAttribute("outputDirection",new Ve(b,p)),t.push(new Xt(m,null)),n>Ws&&n--}return{lodMeshes:t,sizeLods:e}}function dd(i,e,t){let n=new Zt(i,e,t);return n.texture.mapping=Pr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Gs(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function p_(i,e,t){return new nn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:u_,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:$a(),fragmentShader:`

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
		`,blending:Nn,depthTest:!1,depthWrite:!1})}function m_(i,e,t){return new nn({name:"SphericalGaussianBlur",defines:{SAMPLES:h_,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:$a(),fragmentShader:`

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
		`,blending:Nn,depthTest:!1,depthWrite:!1})}function fd(){return new nn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:$a(),fragmentShader:`

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
		`,blending:Nn,depthTest:!1,depthWrite:!1})}function pd(){return new nn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:$a(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Nn,depthTest:!1,depthWrite:!1})}function $a(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var Ya=class extends Zt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new yr(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new Ls(5,5,5),r=new nn({name:"CubemapFromEquirect",uniforms:Hi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Yt,blending:Nn});r.uniforms.tEquirect.value=t;let o=new Xt(s,r),a=t.minFilter;return t.minFilter===Dn&&(t.minFilter=Tt),new Qo(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,s);e.setRenderTarget(r)}};function g_(i){let e=new WeakMap,t=new WeakMap,n=null;function s(h,p=!1){return h==null?null:p?o(h):r(h)}function r(h){if(h&&h.isTexture){let p=h.mapping;if(p===na||p===ia)if(e.has(h)){let g=e.get(h).texture;return a(g,h.mapping)}else{let g=h.image;if(g&&g.height>0){let b=new Ya(g.height);return b.fromEquirectangularTexture(i,h),e.set(h,b),h.addEventListener("dispose",c),a(b.texture,h.mapping)}else return null}}return h}function o(h){if(h&&h.isTexture){let p=h.mapping,g=p===na||p===ia,b=p===gi||p===Bi;if(g||b){let m=t.get(h),f=m!==void 0?m.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==f)return n===null&&(n=new Xa(i)),m=g?n.fromEquirectangular(h,m):n.fromCubemap(h,m),m.texture.pmremVersion=h.pmremVersion,t.set(h,m),m.texture;if(m!==void 0)return m.texture;{let y=h.image;return g&&y&&y.height>0||b&&y&&l(y)?(n===null&&(n=new Xa(i)),m=g?n.fromEquirectangular(h):n.fromCubemap(h),m.texture.pmremVersion=h.pmremVersion,t.set(h,m),h.addEventListener("dispose",d),m.texture):null}}}return h}function a(h,p){return p===na?h.mapping=gi:p===ia&&(h.mapping=Bi),h}function l(h){let p=0,g=6;for(let b=0;b<g;b++)h[b]!==void 0&&p++;return p===g}function c(h){let p=h.target;p.removeEventListener("dispose",c);let g=e.get(p);g!==void 0&&(e.delete(p),g.dispose())}function d(h){let p=h.target;p.removeEventListener("dispose",d);let g=t.get(p);g!==void 0&&(t.delete(p),g.dispose())}function u(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:u}}function __(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&Pi("WebGLRenderer: "+n+" extension not supported."),s}}}function x_(i,e,t,n){let s={},r=new WeakMap;function o(u){let h=u.target;h.index!==null&&e.remove(h.index);for(let g in h.attributes)e.remove(h.attributes[g]);h.removeEventListener("dispose",o),delete s[h.id];let p=r.get(h);p&&(e.remove(p),r.delete(h)),n.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,t.memory.geometries--}function a(u,h){return s[h.id]===!0||(h.addEventListener("dispose",o),s[h.id]=!0,t.memory.geometries++),h}function l(u){let h=u.attributes;for(let p in h)e.update(h[p],i.ARRAY_BUFFER)}function c(u){let h=[],p=u.index,g=u.attributes.position,b=0;if(g===void 0)return;if(p!==null){let y=p.array;b=p.version;for(let T=0,v=y.length;T<v;T+=3){let w=y[T+0],S=y[T+1],E=y[T+2];h.push(w,S,S,E,E,w)}}else{let y=g.array;b=g.version;for(let T=0,v=y.length/3-1;T<v;T+=3){let w=T+0,S=T+1,E=T+2;h.push(w,S,S,E,E,w)}}let m=new(g.count>=65535?Ni:Yn)(h,1);m.version=b;let f=r.get(u);f&&e.remove(f),r.set(u,m)}function d(u){let h=r.get(u);if(h){let p=u.index;p!==null&&h.version<p.version&&c(u)}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:d}}function y_(i,e,t){let n;function s(u){n=u}let r,o;function a(u){r=u.type,o=u.bytesPerElement}function l(u,h){i.drawElements(n,h,r,u*o),t.update(h,n,1)}function c(u,h,p){p!==0&&(i.drawElementsInstanced(n,h,r,u*o,p),t.update(h,n,p))}function d(u,h,p){if(p===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,h,0,r,u,0,p);let b=0;for(let m=0;m<p;m++)b+=h[m];t.update(b,n,1)}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=d}function v_(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(r/3);break;case i.LINES:t.lines+=a*(r/2);break;case i.LINE_STRIP:t.lines+=a*(r-1);break;case i.LINE_LOOP:t.lines+=a*r;break;case i.POINTS:t.points+=a*r;break;default:Fe("WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function b_(i,e,t){let n=new WeakMap,s=new lt;function r(o,a,l){let c=o.morphTargetInfluences,d=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=d!==void 0?d.length:0,h=n.get(a);if(h===void 0||h.count!==u){let A=function(){E.dispose(),n.delete(a),a.removeEventListener("dispose",A)};h!==void 0&&h.texture.dispose();let p=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,b=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],f=a.morphAttributes.normal||[],y=a.morphAttributes.color||[],T=0;p===!0&&(T=1),g===!0&&(T=2),b===!0&&(T=3);let v=a.attributes.position.count*T,w=1;v>e.maxTextureSize&&(w=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);let S=new Float32Array(v*w*4*u),E=new pr(S,v,w,u);E.type=cn,E.needsUpdate=!0;let _=T*4;for(let R=0;R<u;R++){let P=m[R],U=f[R],k=y[R],I=v*w*4*R;for(let F=0;F<P.count;F++){let $=F*_;p===!0&&(s.fromBufferAttribute(P,F),S[I+$+0]=s.x,S[I+$+1]=s.y,S[I+$+2]=s.z,S[I+$+3]=0),g===!0&&(s.fromBufferAttribute(U,F),S[I+$+4]=s.x,S[I+$+5]=s.y,S[I+$+6]=s.z,S[I+$+7]=0),b===!0&&(s.fromBufferAttribute(k,F),S[I+$+8]=s.x,S[I+$+9]=s.y,S[I+$+10]=s.z,S[I+$+11]=k.itemSize===4?s.w:1)}}h={count:u,texture:E,size:new Oe(v,w)},n.set(a,h),a.addEventListener("dispose",A)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let p=0;for(let b=0;b<c.length;b++)p+=c[b];let g=a.morphTargetsRelative?1:1-p;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",h.size)}return{update:r}}function S_(i,e,t,n,s){let r=new WeakMap;function o(c){let d=s.render.frame,u=c.geometry,h=e.get(c,u);if(r.get(h)!==d&&(e.update(h),r.set(h,d)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==d&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,d))),c.isSkinnedMesh){let p=c.skeleton;r.get(p)!==d&&(p.update(),r.set(p,d))}return h}function a(){r=new WeakMap}function l(c){let d=c.target;d.removeEventListener("dispose",l),n.releaseStatesOfObject(d),t.remove(d.instanceMatrix),d.instanceColor!==null&&t.remove(d.instanceColor)}return{update:o,dispose:a}}var M_={[nc]:"LINEAR_TONE_MAPPING",[ic]:"REINHARD_TONE_MAPPING",[sc]:"CINEON_TONE_MAPPING",[rc]:"ACES_FILMIC_TONE_MAPPING",[ac]:"AGX_TONE_MAPPING",[lc]:"NEUTRAL_TONE_MAPPING",[oc]:"CUSTOM_TONE_MAPPING"};function w_(i,e,t,n,s,r){let o=new Zt(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,l=null,c=new At;c.setAttribute("position",new Wt([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new Wt([0,2,0,0,2,0],2));let d=new ko({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),u=new Xt(c,d),h=new Us(-1,1,1,-1,0,1),p=null,g=null,b=!1,m,f=null,y=[],T=!1;this.setSize=function(v,w){o.setSize(v,w),a!==null&&a.setSize(v,w),l!==null&&l.setSize(v,w);for(let S=0;S<y.length;S++){let E=y[S];E.setSize&&E.setSize(v,w)}},this.setEffects=function(v){y=v,T=y.length>0&&y[0].isRenderPass===!0;let w=o.width,S=o.height;y.length>0&&a===null&&(a=new Zt(w,S,{type:bn,depthBuffer:!1,stencilBuffer:!1}),l=new Zt(w,S,{type:bn,depthBuffer:!1,stencilBuffer:!1}));for(let E=0;E<y.length;E++){let _=y[E];_.setSize&&_.setSize(w,S)}},this.begin=function(v,w){if(b||v.toneMapping===yn&&y.length===0)return!1;if(f=w,w!==null){let S=w.width,E=w.height;(o.width!==S||o.height!==E)&&this.setSize(S,E)}return T===!1&&v.setRenderTarget(o),m=v.toneMapping,v.toneMapping=yn,!0},this.hasRenderPass=function(){return T},this.end=function(v,w){v.toneMapping=m,b=!0;let S=o,E=a;for(let _=0;_<y.length;_++){let A=y[_];A.enabled!==!1&&(A.render(v,E,S,w),A.needsSwap!==!1&&(S=E,E=E===a?l:a))}if(p!==v.outputColorSpace||g!==v.toneMapping){p=v.outputColorSpace,g=v.toneMapping,d.defines={},je.getTransfer(p)===at&&(d.defines.SRGB_TRANSFER="");let _=M_[g];_&&(d.defines[_]=""),d.needsUpdate=!0}d.uniforms.tDiffuse.value=S.texture,v.setRenderTarget(f),v.render(u,h),f=null,b=!1},this.isCompositing=function(){return b},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),c.dispose(),d.dispose()}}var Dd=new Ut,Ic=new hi(1,1),Ud=new pr,Od=new Fo,Fd=new yr,md=[],gd=[],_d=new Float32Array(16),xd=new Float32Array(9),yd=new Float32Array(4);function Ys(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=md[s];if(r===void 0&&(r=new Float32Array(s),md[s]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(r,a)}return r}function Et(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Ct(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Za(i,e){let t=gd[e];t===void 0&&(t=new Int32Array(e),gd[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function T_(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function A_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;i.uniform2fv(this.addr,e),Ct(t,e)}}function E_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Et(t,e))return;i.uniform3fv(this.addr,e),Ct(t,e)}}function C_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;i.uniform4fv(this.addr,e),Ct(t,e)}}function R_(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Et(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Ct(t,e)}else{if(Et(t,n))return;yd.set(n),i.uniformMatrix2fv(this.addr,!1,yd),Ct(t,n)}}function I_(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Et(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Ct(t,e)}else{if(Et(t,n))return;xd.set(n),i.uniformMatrix3fv(this.addr,!1,xd),Ct(t,n)}}function P_(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Et(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Ct(t,e)}else{if(Et(t,n))return;_d.set(n),i.uniformMatrix4fv(this.addr,!1,_d),Ct(t,n)}}function L_(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function N_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;i.uniform2iv(this.addr,e),Ct(t,e)}}function D_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Et(t,e))return;i.uniform3iv(this.addr,e),Ct(t,e)}}function U_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;i.uniform4iv(this.addr,e),Ct(t,e)}}function O_(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function F_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;i.uniform2uiv(this.addr,e),Ct(t,e)}}function B_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Et(t,e))return;i.uniform3uiv(this.addr,e),Ct(t,e)}}function k_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;i.uniform4uiv(this.addr,e),Ct(t,e)}}function z_(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Ic.compareFunction=t.isReversedDepthBuffer()?Ha:Va,r=Ic):r=Dd,t.setTexture2D(e||r,s)}function V_(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Od,s)}function H_(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||Fd,s)}function G_(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Ud,s)}function W_(i){switch(i){case 5126:return T_;case 35664:return A_;case 35665:return E_;case 35666:return C_;case 35674:return R_;case 35675:return I_;case 35676:return P_;case 5124:case 35670:return L_;case 35667:case 35671:return N_;case 35668:case 35672:return D_;case 35669:case 35673:return U_;case 5125:return O_;case 36294:return F_;case 36295:return B_;case 36296:return k_;case 35678:case 36198:case 36298:case 36306:case 35682:return z_;case 35679:case 36299:case 36307:return V_;case 35680:case 36300:case 36308:case 36293:return H_;case 36289:case 36303:case 36311:case 36292:return G_}}function X_(i,e){i.uniform1fv(this.addr,e)}function Y_(i,e){let t=Ys(e,this.size,2);i.uniform2fv(this.addr,t)}function q_(i,e){let t=Ys(e,this.size,3);i.uniform3fv(this.addr,t)}function $_(i,e){let t=Ys(e,this.size,4);i.uniform4fv(this.addr,t)}function Z_(i,e){let t=Ys(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function K_(i,e){let t=Ys(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function J_(i,e){let t=Ys(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function j_(i,e){i.uniform1iv(this.addr,e)}function Q_(i,e){i.uniform2iv(this.addr,e)}function ex(i,e){i.uniform3iv(this.addr,e)}function tx(i,e){i.uniform4iv(this.addr,e)}function nx(i,e){i.uniform1uiv(this.addr,e)}function ix(i,e){i.uniform2uiv(this.addr,e)}function sx(i,e){i.uniform3uiv(this.addr,e)}function rx(i,e){i.uniform4uiv(this.addr,e)}function ox(i,e,t){let n=this.cache,s=e.length,r=Za(t,s);Et(n,r)||(i.uniform1iv(this.addr,r),Ct(n,r));let o;this.type===i.SAMPLER_2D_SHADOW?o=Ic:o=Dd;for(let a=0;a!==s;++a)t.setTexture2D(e[a]||o,r[a])}function ax(i,e,t){let n=this.cache,s=e.length,r=Za(t,s);Et(n,r)||(i.uniform1iv(this.addr,r),Ct(n,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||Od,r[o])}function lx(i,e,t){let n=this.cache,s=e.length,r=Za(t,s);Et(n,r)||(i.uniform1iv(this.addr,r),Ct(n,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||Fd,r[o])}function cx(i,e,t){let n=this.cache,s=e.length,r=Za(t,s);Et(n,r)||(i.uniform1iv(this.addr,r),Ct(n,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||Ud,r[o])}function hx(i){switch(i){case 5126:return X_;case 35664:return Y_;case 35665:return q_;case 35666:return $_;case 35674:return Z_;case 35675:return K_;case 35676:return J_;case 5124:case 35670:return j_;case 35667:case 35671:return Q_;case 35668:case 35672:return ex;case 35669:case 35673:return tx;case 5125:return nx;case 36294:return ix;case 36295:return sx;case 36296:return rx;case 35678:case 36198:case 36298:case 36306:case 35682:return ox;case 35679:case 36299:case 36307:return ax;case 35680:case 36300:case 36308:case 36293:return lx;case 36289:case 36303:case 36311:case 36292:return cx}}var Pc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=W_(t.type)}},Lc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=hx(t.type)}},Nc=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(e,t[a.id],n)}}},Cc=/(\w+)(\])?(\[|\.)?/g;function vd(i,e){i.seq.push(e),i.map[e.id]=e}function ux(i,e,t){let n=i.name,s=n.length;for(Cc.lastIndex=0;;){let r=Cc.exec(n),o=Cc.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){vd(t,c===void 0?new Pc(a,i,e):new Lc(a,i,e));break}else{let u=t.map[a];u===void 0&&(u=new Nc(a),vd(t,u)),t=u}}}var Xs=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){let a=e.getActiveUniform(t,o),l=e.getUniformLocation(t,a.name);ux(a,l,this)}let s=[],r=[];for(let o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,o=t.length;r!==o;++r){let a=t[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let o=e[s];o.id in t&&n.push(o)}return n}};function bd(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var dx=37297,fx=0;function px(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}var Sd=new ze;function mx(i){je._getMatrix(Sd,je.workingColorSpace,i);let e=`mat3( ${Sd.elements.map(t=>t.toFixed(4))} )`;switch(je.getTransfer(i)){case fr:return[e,"LinearTransferOETF"];case at:return[e,"sRGBTransferOETF"];default:return Le("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Md(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+px(i.getShaderSource(e),a)}else return r}function gx(i,e){let t=mx(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var _x={[nc]:"Linear",[ic]:"Reinhard",[sc]:"Cineon",[rc]:"ACESFilmic",[ac]:"AgX",[lc]:"Neutral",[oc]:"Custom"};function xx(i,e){let t=_x[e];return t===void 0?(Le("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Wa=new O;function yx(){je.getLuminanceCoefficients(Wa);let i=Wa.x.toFixed(4),e=Wa.y.toFixed(4),t=Wa.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function vx(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Vr).join(`
`)}function bx(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Sx(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function Vr(i){return i!==""}function wd(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Td(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var Mx=/^[ \t]*#include +<([\w\d./]+)>/gm;function Dc(i){return i.replace(Mx,Tx)}var wx=new Map;function Tx(i,e){let t=Xe[e];if(t===void 0){let n=wx.get(e);if(n!==void 0)t=Xe[n],Le('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return Dc(t)}var Ax=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ad(i){return i.replace(Ax,Ex)}function Ex(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Ed(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}var Cx={[Ir]:"SHADOWMAP_TYPE_PCF",[Bs]:"SHADOWMAP_TYPE_VSM"};function Rx(i){return Cx[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Ix={[gi]:"ENVMAP_TYPE_CUBE",[Bi]:"ENVMAP_TYPE_CUBE",[Pr]:"ENVMAP_TYPE_CUBE_UV"};function Px(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":Ix[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var Lx={[Bi]:"ENVMAP_MODE_REFRACTION"};function Nx(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":Lx[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var Dx={[ta]:"ENVMAP_BLENDING_MULTIPLY",[Wu]:"ENVMAP_BLENDING_MIX",[Xu]:"ENVMAP_BLENDING_ADD"};function Ux(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":Dx[i.combine]||"ENVMAP_BLENDING_NONE"}function Ox(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function Fx(i,e,t,n){let s=i.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,l=Rx(t),c=Px(t),d=Nx(t),u=Ux(t),h=Ox(t),p=vx(t),g=bx(r),b=s.createProgram(),m,f,y=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Vr).join(`
`),m.length>0&&(m+=`
`),f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Vr).join(`
`),f.length>0&&(f+=`
`)):(m=[Ed(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+d:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Vr).join(`
`),f=[Ed(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+d:"",t.envMap?"#define "+u:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==yn?"#define TONE_MAPPING":"",t.toneMapping!==yn?Xe.tonemapping_pars_fragment:"",t.toneMapping!==yn?xx("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Xe.colorspace_pars_fragment,gx("linearToOutputTexel",t.outputColorSpace),yx(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Vr).join(`
`)),o=Dc(o),o=wd(o,t),o=Td(o,t),a=Dc(a),a=wd(a,t),a=Td(a,t),o=Ad(o),a=Ad(a),t.isRawShaderMaterial!==!0&&(y=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,f=["#define varying in",t.glslVersion===_c?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===_c?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);let T=y+m+o,v=y+f+a,w=bd(s,s.VERTEX_SHADER,T),S=bd(s,s.FRAGMENT_SHADER,v);s.attachShader(b,w),s.attachShader(b,S),t.index0AttributeName!==void 0?s.bindAttribLocation(b,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(b,0,"position"),s.linkProgram(b);function E(P){if(i.debug.checkShaderErrors){let U=s.getProgramInfoLog(b)||"",k=s.getShaderInfoLog(w)||"",I=s.getShaderInfoLog(S)||"",F=U.trim(),$=k.trim(),X=I.trim(),ne=!0,q=!0;if(s.getProgramParameter(b,s.LINK_STATUS)===!1)if(ne=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,b,w,S);else{let K=Md(s,w,"vertex"),ee=Md(s,S,"fragment");Fe("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(b,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+F+`
`+K+`
`+ee)}else F!==""?Le("WebGLProgram: Program Info Log:",F):($===""||X==="")&&(q=!1);q&&(P.diagnostics={runnable:ne,programLog:F,vertexShader:{log:$,prefix:m},fragmentShader:{log:X,prefix:f}})}s.deleteShader(w),s.deleteShader(S),_=new Xs(s,b),A=Sx(s,b)}let _;this.getUniforms=function(){return _===void 0&&E(this),_};let A;this.getAttributes=function(){return A===void 0&&E(this),A};let R=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return R===!1&&(R=s.getProgramParameter(b,dx)),R},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(b),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=fx++,this.cacheKey=e,this.usedTimes=1,this.program=b,this.vertexShader=w,this.fragmentShader=S,this}var Bx=0,Uc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Oc(e),t.set(e,n)),n}},Oc=class{constructor(e){this.id=Bx++,this.code=e,this.usedTimes=0}};function kx(i){return i===xi||i===Or||i===Fr}function zx(i,e,t,n,s,r){let o=new mr,a=new Uc,l=new Set,c=[],d=new Map,u=n.logarithmicDepthBuffer,h=n.precision,p={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(_){return l.add(_),_===0?"uv":`uv${_}`}function b(_,A,R,P,U,k){let I=P.fog,F=U.geometry,$=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?P.environment:null,X=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,ne=e.get(_.envMap||$,X),q=ne&&ne.mapping===Pr?ne.image.height:null,K=p[_.type];_.precision!==null&&(h=n.getMaxPrecision(_.precision),h!==_.precision&&Le("WebGLProgram.getParameters:",_.precision,"not supported, using",h,"instead."));let ee=F.morphAttributes.position||F.morphAttributes.normal||F.morphAttributes.color,be=ee!==void 0?ee.length:0,Se=0;F.morphAttributes.position!==void 0&&(Se=1),F.morphAttributes.normal!==void 0&&(Se=2),F.morphAttributes.color!==void 0&&(Se=3);let tt,Ge,te,H;if(K){let dt=On[K];tt=dt.vertexShader,Ge=dt.fragmentShader}else{tt=_.vertexShader,Ge=_.fragmentShader;let dt=a.getVertexShaderStage(_),st=a.getFragmentShaderStage(_);a.update(_,dt,st),te=dt.id,H=st.id}let G=i.getRenderTarget(),ae=i.state.buffers.depth.getReversed(),Te=U.isInstancedMesh===!0,fe=U.isBatchedMesh===!0,Ne=!!_.map,Ze=!!_.matcap,se=!!ne,Ue=!!_.aoMap,Ye=!!_.lightMap,Ie=!!_.bumpMap&&_.wireframe===!1,nt=!!_.normalMap,xt=!!_.displacementMap,Dt=!!_.emissiveMap,qe=!!_.metalnessMap,it=!!_.roughnessMap,L=_.anisotropy>0,pt=_.clearcoat>0,Qe=_.dispersion>0,C=_.retroreflectivity>0,x=_.iridescence>0,B=_.sheen>0,W=_.transmission>0,Z=L&&!!_.anisotropyMap,re=pt&&!!_.clearcoatMap,le=pt&&!!_.clearcoatNormalMap,J=pt&&!!_.clearcoatRoughnessMap,Q=x&&!!_.iridescenceMap,ce=x&&!!_.iridescenceThicknessMap,Ce=B&&!!_.sheenColorMap,pe=B&&!!_.sheenRoughnessMap,he=!!_.specularMap,Re=!!_.specularColorMap,De=!!_.specularIntensityMap,He=W&&!!_.transmissionMap,D=W&&!!_.thicknessMap,ue=!!_.gradientMap,j=!!_.alphaMap,de=_.alphaTest>0,xe=!!_.alphaHash,ie=!!_.extensions,Pe=yn;_.toneMapped&&(G===null||G.isXRRenderTarget===!0)&&(Pe=i.toneMapping);let Ae={shaderID:K,shaderType:_.type,shaderName:_.name,vertexShader:tt,fragmentShader:Ge,defines:_.defines,customVertexShaderID:te,customFragmentShaderID:H,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:h,batching:fe,batchingColor:fe&&U._colorsTexture!==null,instancing:Te,instancingColor:Te&&U.instanceColor!==null,instancingMorph:Te&&U.morphTexture!==null,outputColorSpace:G===null?i.outputColorSpace:G.isXRRenderTarget===!0?G.texture.colorSpace:je.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:Ne,matcap:Ze,envMap:se,envMapMode:se&&ne.mapping,envMapCubeUVHeight:q,aoMap:Ue,lightMap:Ye,bumpMap:Ie,normalMap:nt,displacementMap:xt,emissiveMap:Dt,normalMapObjectSpace:nt&&_.normalMapType===$u,normalMapTangentSpace:nt&&_.normalMapType===Br,packedNormalMap:nt&&_.normalMapType===Br&&kx(_.normalMap.format),metalnessMap:qe,roughnessMap:it,anisotropy:L,anisotropyMap:Z,clearcoat:pt,clearcoatMap:re,clearcoatNormalMap:le,clearcoatRoughnessMap:J,dispersion:Qe,retroreflection:C,iridescence:x,iridescenceMap:Q,iridescenceThicknessMap:ce,sheen:B,sheenColorMap:Ce,sheenRoughnessMap:pe,specularMap:he,specularColorMap:Re,specularIntensityMap:De,transmission:W,transmissionMap:He,thicknessMap:D,gradientMap:ue,opaque:_.transparent===!1&&_.blending===ks&&_.alphaToCoverage===!1,alphaMap:j,alphaTest:de,alphaHash:xe,combine:_.combine,mapUv:Ne&&g(_.map.channel),aoMapUv:Ue&&g(_.aoMap.channel),lightMapUv:Ye&&g(_.lightMap.channel),bumpMapUv:Ie&&g(_.bumpMap.channel),normalMapUv:nt&&g(_.normalMap.channel),displacementMapUv:xt&&g(_.displacementMap.channel),emissiveMapUv:Dt&&g(_.emissiveMap.channel),metalnessMapUv:qe&&g(_.metalnessMap.channel),roughnessMapUv:it&&g(_.roughnessMap.channel),anisotropyMapUv:Z&&g(_.anisotropyMap.channel),clearcoatMapUv:re&&g(_.clearcoatMap.channel),clearcoatNormalMapUv:le&&g(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:J&&g(_.clearcoatRoughnessMap.channel),iridescenceMapUv:Q&&g(_.iridescenceMap.channel),iridescenceThicknessMapUv:ce&&g(_.iridescenceThicknessMap.channel),sheenColorMapUv:Ce&&g(_.sheenColorMap.channel),sheenRoughnessMapUv:pe&&g(_.sheenRoughnessMap.channel),specularMapUv:he&&g(_.specularMap.channel),specularColorMapUv:Re&&g(_.specularColorMap.channel),specularIntensityMapUv:De&&g(_.specularIntensityMap.channel),transmissionMapUv:He&&g(_.transmissionMap.channel),thicknessMapUv:D&&g(_.thicknessMap.channel),alphaMapUv:j&&g(_.alphaMap.channel),vertexTangents:!!F.attributes.tangent&&(nt||L),vertexNormals:!!F.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!F.attributes.color&&F.attributes.color.itemSize===4,pointsUvs:U.isPoints===!0&&!!F.attributes.uv&&(Ne||j),fog:!!I,useFog:_.fog===!0,fogExp2:!!I&&I.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||F.attributes.normal===void 0&&nt===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:ae,skinning:U.isSkinnedMesh===!0,hasPositionAttribute:F.attributes.position!==void 0,morphTargets:F.morphAttributes.position!==void 0,morphNormals:F.morphAttributes.normal!==void 0,morphColors:F.morphAttributes.color!==void 0,morphTargetsCount:be,morphTextureStride:Se,numSunLights:A.sun.length,numDirLights:A.directional.length,numPointLights:A.point.length,numSpotLights:A.spot.length,numSpotLightMaps:A.spotLightMap.length,numRectAreaLights:A.rectArea.length,numHemiLights:A.hemi.length,numSunLightShadows:A.sunShadowMap.length,numDirLightShadows:A.directionalShadowMap.length,numPointLightShadows:A.pointShadowMap.length,numSpotLightShadows:A.spotShadowMap.length,numSpotLightShadowsWithMaps:A.numSpotLightShadowsWithMaps,numLightProbes:A.numLightProbes,numLightProbeGrids:k.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&R.length>0,shadowMapType:i.shadowMap.type,toneMapping:Pe,decodeVideoTexture:Ne&&_.map.isVideoTexture===!0&&je.getTransfer(_.map.colorSpace)===at,decodeVideoTextureEmissive:Dt&&_.emissiveMap.isVideoTexture===!0&&je.getTransfer(_.emissiveMap.colorSpace)===at,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===Nt,flipSided:_.side===Yt,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:ie&&_.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ie&&_.extensions.multiDraw===!0||fe)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return Ae.vertexUv1s=l.has(1),Ae.vertexUv2s=l.has(2),Ae.vertexUv3s=l.has(3),l.clear(),Ae}function m(_){let A=[];if(_.shaderID?A.push(_.shaderID):(A.push(_.customVertexShaderID),A.push(_.customFragmentShaderID)),_.defines!==void 0)for(let R in _.defines)A.push(R),A.push(_.defines[R]);return _.isRawShaderMaterial===!1&&(f(A,_),y(A,_),A.push(i.outputColorSpace)),A.push(_.customProgramCacheKey),A.join()}function f(_,A){_.push(A.precision),_.push(A.outputColorSpace),_.push(A.envMapMode),_.push(A.envMapCubeUVHeight),_.push(A.mapUv),_.push(A.alphaMapUv),_.push(A.lightMapUv),_.push(A.aoMapUv),_.push(A.bumpMapUv),_.push(A.normalMapUv),_.push(A.displacementMapUv),_.push(A.emissiveMapUv),_.push(A.metalnessMapUv),_.push(A.roughnessMapUv),_.push(A.anisotropyMapUv),_.push(A.clearcoatMapUv),_.push(A.clearcoatNormalMapUv),_.push(A.clearcoatRoughnessMapUv),_.push(A.iridescenceMapUv),_.push(A.iridescenceThicknessMapUv),_.push(A.sheenColorMapUv),_.push(A.sheenRoughnessMapUv),_.push(A.specularMapUv),_.push(A.specularColorMapUv),_.push(A.specularIntensityMapUv),_.push(A.transmissionMapUv),_.push(A.thicknessMapUv),_.push(A.combine),_.push(A.fogExp2),_.push(A.sizeAttenuation),_.push(A.morphTargetsCount),_.push(A.morphAttributeCount),_.push(A.numSunLights),_.push(A.numDirLights),_.push(A.numPointLights),_.push(A.numSpotLights),_.push(A.numSpotLightMaps),_.push(A.numHemiLights),_.push(A.numRectAreaLights),_.push(A.numSunLightShadows),_.push(A.numDirLightShadows),_.push(A.numPointLightShadows),_.push(A.numSpotLightShadows),_.push(A.numSpotLightShadowsWithMaps),_.push(A.numLightProbes),_.push(A.shadowMapType),_.push(A.toneMapping),_.push(A.numClippingPlanes),_.push(A.numClipIntersection),_.push(A.depthPacking)}function y(_,A){o.disableAll(),A.instancing&&o.enable(0),A.instancingColor&&o.enable(1),A.instancingMorph&&o.enable(2),A.matcap&&o.enable(3),A.envMap&&o.enable(4),A.normalMapObjectSpace&&o.enable(5),A.normalMapTangentSpace&&o.enable(6),A.clearcoat&&o.enable(7),A.iridescence&&o.enable(8),A.alphaTest&&o.enable(9),A.vertexColors&&o.enable(10),A.vertexAlphas&&o.enable(11),A.vertexUv1s&&o.enable(12),A.vertexUv2s&&o.enable(13),A.vertexUv3s&&o.enable(14),A.vertexTangents&&o.enable(15),A.anisotropy&&o.enable(16),A.alphaHash&&o.enable(17),A.batching&&o.enable(18),A.dispersion&&o.enable(19),A.retroreflection&&o.enable(24),A.batchingColor&&o.enable(20),A.gradientMap&&o.enable(21),A.packedNormalMap&&o.enable(22),A.vertexNormals&&o.enable(23),_.push(o.mask),o.disableAll(),A.fog&&o.enable(0),A.useFog&&o.enable(1),A.flatShading&&o.enable(2),A.logarithmicDepthBuffer&&o.enable(3),A.reversedDepthBuffer&&o.enable(4),A.skinning&&o.enable(5),A.morphTargets&&o.enable(6),A.morphNormals&&o.enable(7),A.morphColors&&o.enable(8),A.premultipliedAlpha&&o.enable(9),A.shadowMapEnabled&&o.enable(10),A.doubleSided&&o.enable(11),A.flipSided&&o.enable(12),A.useDepthPacking&&o.enable(13),A.dithering&&o.enable(14),A.transmission&&o.enable(15),A.sheen&&o.enable(16),A.opaque&&o.enable(17),A.pointsUvs&&o.enable(18),A.decodeVideoTexture&&o.enable(19),A.decodeVideoTextureEmissive&&o.enable(20),A.alphaToCoverage&&o.enable(21),A.numLightProbeGrids>0&&o.enable(22),A.hasPositionAttribute&&o.enable(23),_.push(o.mask)}function T(_){let A=p[_.type],R;if(A){let P=On[A];R=ld.clone(P.uniforms)}else R=_.uniforms;return R}function v(_,A){let R=d.get(A);return R!==void 0?++R.usedTimes:(R=new Fx(i,A,_,s),c.push(R),d.set(A,R)),R}function w(_){if(--_.usedTimes===0){let A=c.indexOf(_);c[A]=c[c.length-1],c.pop(),d.delete(_.cacheKey),_.destroy()}}function S(_){a.remove(_)}function E(){a.dispose()}return{getParameters:b,getProgramCacheKey:m,getUniforms:T,acquireProgram:v,releaseProgram:w,releaseShaderCache:S,programs:c,dispose:E}}function Vx(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function Hx(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function Cd(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Rd(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function o(h){let p=0;return h.isInstancedMesh&&(p+=2),h.isSkinnedMesh&&(p+=1),p}function a(h,p,g,b,m,f){let y=i[e];return y===void 0?(y={id:h.id,object:h,geometry:p,material:g,materialVariant:o(h),groupOrder:b,renderOrder:h.renderOrder,z:m,group:f},i[e]=y):(y.id=h.id,y.object=h,y.geometry=p,y.material=g,y.materialVariant=o(h),y.groupOrder=b,y.renderOrder=h.renderOrder,y.z=m,y.group=f),e++,y}function l(h,p,g,b,m,f,y){y.reversedDepth===!0&&(m=-m);let T=a(h,p,g,b,m,f);g.transmission>0?n.push(T):g.transparent===!0?s.push(T):t.push(T)}function c(h,p,g,b,m,f){let y=a(h,p,g,b,m,f);g.transmission>0?n.unshift(y):g.transparent===!0?s.unshift(y):t.unshift(y)}function d(h,p){t.length>1&&t.sort(h||Hx),n.length>1&&n.sort(p||Cd),s.length>1&&s.sort(p||Cd)}function u(){for(let h=e,p=i.length;h<p;h++){let g=i[h];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:u,sort:d}}function Gx(){let i=new WeakMap;function e(n,s){let r=i.get(n),o;return r===void 0?(o=new Rd,i.set(n,[o])):s>=r.length?(o=new Rd,r.push(o)):o=r[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function Wx(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new O,color:new ke};break;case"SpotLight":t={position:new O,direction:new O,color:new ke,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new O,color:new ke,distance:0,decay:0};break;case"HemisphereLight":t={direction:new O,skyColor:new ke,groundColor:new ke};break;case"RectAreaLight":t={color:new ke,position:new O,halfWidth:new O,halfHeight:new O};break}return i[e.id]=t,t}}}function Xx(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var Yx=0;function qx(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function $x(i){let e=new Wx,t=Xx(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new O);let s=new O,r=new Be,o=new Be;function a(c){let d=0,u=0,h=0;for(let U=0;U<9;U++)n.probe[U].set(0,0,0);let p=0,g=0,b=0,m=0,f=0,y=0,T=0,v=0,w=0,S=0,E=0,_=0,A=0,R=0;c.sort(qx);for(let U=0,k=c.length;U<k;U++){let I=c[U],F=I.color,$=I.intensity,X=I.distance,ne=null;if(I.shadow&&I.shadow.map&&(I.shadow.map.texture.format===xi?ne=I.shadow.map.texture:ne=I.shadow.map.depthTexture||I.shadow.map.texture),I.isAmbientLight)d+=F.r*$,u+=F.g*$,h+=F.b*$;else if(I.isLightProbe){for(let q=0;q<9;q++)n.probe[q].addScaledVector(I.sh.coefficients[q],$);R++}else if(I.isSunLight){let q=e.get(I);if(q.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let K=I.shadow,ee=t.get(I);ee.shadowIntensity=K.intensity,ee.shadowBias=K.bias,ee.shadowNormalBias=K.normalBias,ee.shadowRadius=K.radius,ee.shadowMapSize.copy(K.mapSize).multiply(K.getFrameExtents()),n.sunShadow[g]=ee,n.sunShadowMap[g]=ne;let be=K.getViewportCount();for(let Se=0;Se<be;Se++)n.sunShadowMatrix[b+Se]=K.getMatrix(Se),n.sunShadowCascade[b+Se]=K._cascadeData[Se];b+=be,g++}n.sun[p]=q,p++}else if(I.isDirectionalLight){let q=e.get(I);if(q.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let K=I.shadow,ee=t.get(I);ee.shadowIntensity=K.intensity,ee.shadowBias=K.bias,ee.shadowNormalBias=K.normalBias,ee.shadowRadius=K.radius,ee.shadowMapSize=K.mapSize,n.directionalShadow[m]=ee,n.directionalShadowMap[m]=ne,n.directionalShadowMatrix[m]=I.shadow.matrix,w++}n.directional[m]=q,m++}else if(I.isSpotLight){let q=e.get(I);q.position.setFromMatrixPosition(I.matrixWorld),q.color.copy(F).multiplyScalar($),q.distance=X,q.coneCos=Math.cos(I.angle),q.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),q.decay=I.decay,n.spot[y]=q;let K=I.shadow;if(I.map&&(n.spotLightMap[_]=I.map,_++,K.updateMatrices(I),I.castShadow&&A++),n.spotLightMatrix[y]=K.matrix,I.castShadow){let ee=t.get(I);ee.shadowIntensity=K.intensity,ee.shadowBias=K.bias,ee.shadowNormalBias=K.normalBias,ee.shadowRadius=K.radius,ee.shadowMapSize=K.mapSize,n.spotShadow[y]=ee,n.spotShadowMap[y]=ne,E++}y++}else if(I.isRectAreaLight){let q=e.get(I);q.color.copy(F).multiplyScalar($),q.halfWidth.set(I.width*.5,0,0),q.halfHeight.set(0,I.height*.5,0),n.rectArea[T]=q,T++}else if(I.isPointLight){let q=e.get(I);if(q.color.copy(I.color).multiplyScalar(I.intensity),q.distance=I.distance,q.decay=I.decay,I.castShadow){let K=I.shadow,ee=t.get(I);ee.shadowIntensity=K.intensity,ee.shadowBias=K.bias,ee.shadowNormalBias=K.normalBias,ee.shadowRadius=K.radius,ee.shadowMapSize=K.mapSize,ee.shadowCameraNear=K.camera.near,ee.shadowCameraFar=K.camera.far,n.pointShadow[f]=ee,n.pointShadowMap[f]=ne,n.pointShadowMatrix[f]=I.shadow.matrix,S++}n.point[f]=q,f++}else if(I.isHemisphereLight){let q=e.get(I);q.skyColor.copy(I.color).multiplyScalar($),q.groundColor.copy(I.groundColor).multiplyScalar($),n.hemi[v]=q,v++}}T>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=me.LTC_FLOAT_1,n.rectAreaLTC2=me.LTC_FLOAT_2):(n.rectAreaLTC1=me.LTC_HALF_1,n.rectAreaLTC2=me.LTC_HALF_2)),n.ambient[0]=d,n.ambient[1]=u,n.ambient[2]=h;let P=n.hash;(P.sunLength!==p||P.directionalLength!==m||P.pointLength!==f||P.spotLength!==y||P.rectAreaLength!==T||P.hemiLength!==v||P.numSunShadows!==g||P.numDirectionalShadows!==w||P.numPointShadows!==S||P.numSpotShadows!==E||P.numSpotMaps!==_||P.numLightProbes!==R)&&(n.sun.length=p,n.directional.length=m,n.spot.length=y,n.rectArea.length=T,n.point.length=f,n.hemi.length=v,n.sunShadow.length=g,n.sunShadowMap.length=g,n.sunShadowMatrix.length=b,n.sunShadowCascade.length=b,n.directionalShadow.length=w,n.directionalShadowMap.length=w,n.directionalShadowMatrix.length=w,n.pointShadow.length=S,n.pointShadowMap.length=S,n.pointShadowMatrix.length=S,n.spotShadow.length=E,n.spotShadowMap.length=E,n.spotLightMatrix.length=E+_-A,n.spotLightMap.length=_,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=R,P.sunLength=p,P.directionalLength=m,P.pointLength=f,P.spotLength=y,P.rectAreaLength=T,P.hemiLength=v,P.numSunShadows=g,P.numDirectionalShadows=w,P.numPointShadows=S,P.numSpotShadows=E,P.numSpotMaps=_,P.numLightProbes=R,n.version=Yx++)}function l(c,d){let u=0,h=0,p=0,g=0,b=0,m=0,f=d.matrixWorldInverse;for(let y=0,T=c.length;y<T;y++){let v=c[y];if(v.isSunLight){let w=n.sun[u];w.direction.setFromMatrixPosition(v.matrixWorld),w.direction.transformDirection(f),u++}else if(v.isDirectionalLight){let w=n.directional[h];w.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),w.direction.sub(s),w.direction.transformDirection(f),h++}else if(v.isSpotLight){let w=n.spot[g];w.position.setFromMatrixPosition(v.matrixWorld),w.position.applyMatrix4(f),w.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),w.direction.sub(s),w.direction.transformDirection(f),g++}else if(v.isRectAreaLight){let w=n.rectArea[b];w.position.setFromMatrixPosition(v.matrixWorld),w.position.applyMatrix4(f),o.identity(),r.copy(v.matrixWorld),r.premultiply(f),o.extractRotation(r),w.halfWidth.set(v.width*.5,0,0),w.halfHeight.set(0,v.height*.5,0),w.halfWidth.applyMatrix4(o),w.halfHeight.applyMatrix4(o),b++}else if(v.isPointLight){let w=n.point[p];w.position.setFromMatrixPosition(v.matrixWorld),w.position.applyMatrix4(f),p++}else if(v.isHemisphereLight){let w=n.hemi[m];w.direction.setFromMatrixPosition(v.matrixWorld),w.direction.transformDirection(f),m++}}}return{setup:a,setupView:l,state:n}}function Id(i){let e=new $x(i),t=[],n=[],s=[];function r(h){u.camera=h,t.length=0,n.length=0,s.length=0}function o(h){t.push(h)}function a(h){n.push(h)}function l(h){s.push(h)}function c(){e.setup(t)}function d(h){e.setupView(t,h)}let u={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:c,setupLightsView:d,pushLight:o,pushShadow:a,pushLightProbeGrid:l}}function Zx(i){let e=new WeakMap;function t(s,r=0){let o=e.get(s),a;return o===void 0?(a=new Id(i),e.set(s,[a])):r>=o.length?(a=new Id(i),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}var Kx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Jx=`uniform sampler2D shadow_pass;
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
}`,jx=[new O(1,0,0),new O(-1,0,0),new O(0,1,0),new O(0,-1,0),new O(0,0,1),new O(0,0,-1)],Qx=[new O(0,-1,0),new O(0,-1,0),new O(0,0,1),new O(0,0,-1),new O(0,-1,0),new O(0,-1,0)],Pd=new Be,zr=new O,Rc=new O;function ey(i,e,t){let n=new Ps,s=new Oe,r=new Oe,o=new lt,a=new zo,l=new Vo,c={},d=t.maxTextureSize,u={[Ln]:Yt,[Yt]:Ln,[Nt]:Nt},h=new nn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Oe},radius:{value:4}},vertexShader:Kx,fragmentShader:Jx}),p=h.clone();p.defines.HORIZONTAL_PASS=1;let g=new At;g.setAttribute("position",new Ve(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let b=new Xt(g,h),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ir;let f=this.type;this.render=function(S,E,_){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||S.length===0)return;this.type===Tu&&(Le("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Ir);let A=i.getRenderTarget(),R=i.getActiveCubeFace(),P=i.getActiveMipmapLevel(),U=i.state;U.setBlending(Nn),U.buffers.depth.getReversed()===!0?U.buffers.color.setClear(0,0,0,0):U.buffers.color.setClear(1,1,1,1),U.buffers.depth.setTest(!0),U.setScissorTest(!1);let k=f!==this.type;k&&E.traverse(function(I){I.material&&(Array.isArray(I.material)?I.material.forEach(F=>F.needsUpdate=!0):I.material.needsUpdate=!0)});for(let I=0,F=S.length;I<F;I++){let $=S[I],X=$.shadow;if(X===void 0){Le("WebGLShadowMap:",$,"has no shadow.");continue}if(X.autoUpdate===!1&&X.needsUpdate===!1)continue;s.copy(X.mapSize);let ne=X.getFrameExtents();s.multiply(ne),r.copy(X.mapSize),(s.x>d||s.y>d)&&(s.x>d&&(r.x=Math.floor(d/ne.x),s.x=r.x*ne.x,X.mapSize.x=r.x),s.y>d&&(r.y=Math.floor(d/ne.y),s.y=r.y*ne.y,X.mapSize.y=r.y));let q=i.state.buffers.depth.getReversed();if(X.camera._reversedDepth=q,X.map===null||k===!0){if(X.map!==null&&(X.map.depthTexture!==null&&(X.map.depthTexture.dispose(),X.map.depthTexture=null),X.map.dispose()),this.type===Bs){if($.isPointLight){Le("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}X.map=new Zt(s.x,s.y,{format:xi,type:bn,minFilter:Tt,magFilter:Tt,generateMipmaps:!1}),X.map.texture.name=$.name+".shadowMap",X.map.depthTexture=new hi(s.x,s.y,cn),X.map.depthTexture.name=$.name+".shadowMapDepth",X.map.depthTexture.format=In,X.map.depthTexture.compareFunction=null,X.map.depthTexture.minFilter=wt,X.map.depthTexture.magFilter=wt}else $.isPointLight?(X.map=new Ya(s.x),X.map.depthTexture=new Bo(s.x,vn)):(X.map=new Zt(s.x,s.y),X.map.depthTexture=new hi(s.x,s.y,vn)),X.map.depthTexture.name=$.name+".shadowMap",X.map.depthTexture.format=In,this.type===Ir?(X.map.depthTexture.compareFunction=q?Ha:Va,X.map.depthTexture.minFilter=Tt,X.map.depthTexture.magFilter=Tt):(X.map.depthTexture.compareFunction=null,X.map.depthTexture.minFilter=wt,X.map.depthTexture.magFilter=wt);X.camera.updateProjectionMatrix()}X.map.isWebGLCubeRenderTarget!==!0&&(X.map.width!==s.x||X.map.height!==s.y)&&X.map.setSize(s.x,s.y);let K=X.map.isWebGLCubeRenderTarget?6:X.getViewportCount();$.isPointLight!==!0&&X.updateMatrices($,_);for(let ee=0;ee<K;ee++){let be=X.getCamera(ee);if($.isPointLight){let Se=X.camera,tt=X.matrix,Ge=$.distance||Se.far;Ge!==Se.far&&(Se.far=Ge,Se.updateProjectionMatrix()),zr.setFromMatrixPosition($.matrixWorld),Se.position.copy(zr),Rc.copy(Se.position),Rc.add(jx[ee]),Se.up.copy(Qx[ee]),Se.lookAt(Rc),Se.updateMatrixWorld(),tt.makeTranslation(-zr.x,-zr.y,-zr.z),Pd.multiplyMatrices(Se.projectionMatrix,Se.matrixWorldInverse),X._frustum.setFromProjectionMatrix(Pd,Se.coordinateSystem,Se.reversedDepth)}if(X.map.isWebGLCubeRenderTarget)i.setRenderTarget(X.map,ee),i.clear();else{ee===0&&(i.setRenderTarget(X.map),i.clear());let Se=X.getViewport(ee);o.set(r.x*Se.x,r.y*Se.y,r.x*Se.z,r.y*Se.w),U.viewport(o)}n=X.getFrustum(ee),v(E,_,be,$,this.type)}X.isPointLightShadow!==!0&&this.type===Bs&&y(X,_),X.needsUpdate=!1}f=this.type,m.needsUpdate=!1,i.setRenderTarget(A,R,P)};function y(S,E){let _=e.update(b);h.defines.VSM_SAMPLES!==S.blurSamples&&(h.defines.VSM_SAMPLES=S.blurSamples,p.defines.VSM_SAMPLES=S.blurSamples,h.needsUpdate=!0,p.needsUpdate=!0),S.mapPass===null?S.mapPass=new Zt(s.x,s.y,{format:xi,type:bn}):(S.mapPass.width!==S.map.width||S.mapPass.height!==S.map.height)&&S.mapPass.setSize(S.map.width,S.map.height),h.uniforms.shadow_pass.value=S.map.depthTexture,h.uniforms.resolution.value.set(S.map.width,S.map.height),h.uniforms.radius.value=S.radius,i.setRenderTarget(S.mapPass),i.clear(),i.renderBufferDirect(E,null,_,h,b,null),p.uniforms.shadow_pass.value=S.mapPass.texture,p.uniforms.resolution.value.set(S.map.width,S.map.height),p.uniforms.radius.value=S.radius,i.setRenderTarget(S.map),i.clear(),i.renderBufferDirect(E,null,_,p,b,null)}function T(S,E,_,A){let R=null,P=_.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(P!==void 0)R=P;else if(R=_.isPointLight===!0?l:a,i.localClippingEnabled&&E.clipShadows===!0&&Array.isArray(E.clippingPlanes)&&E.clippingPlanes.length!==0||E.displacementMap&&E.displacementScale!==0||E.alphaMap&&E.alphaTest>0||E.map&&E.alphaTest>0||E.alphaToCoverage===!0){let U=R.uuid,k=E.uuid,I=c[U];I===void 0&&(I={},c[U]=I);let F=I[k];F===void 0&&(F=R.clone(),I[k]=F,E.addEventListener("dispose",w)),R=F}if(R.visible=E.visible,R.wireframe=E.wireframe,A===Bs?R.side=E.shadowSide!==null?E.shadowSide:E.side:R.side=E.shadowSide!==null?E.shadowSide:u[E.side],R.alphaMap=E.alphaMap,R.alphaTest=E.alphaToCoverage===!0?.5:E.alphaTest,R.map=E.map,R.clipShadows=E.clipShadows,R.clippingPlanes=E.clippingPlanes,R.clipIntersection=E.clipIntersection,R.displacementMap=E.displacementMap,R.displacementScale=E.displacementScale,R.displacementBias=E.displacementBias,R.wireframeLinewidth=E.wireframeLinewidth,R.linewidth=E.linewidth,_.isPointLight===!0&&R.isMeshDistanceMaterial===!0){let U=i.properties.get(R);U.light=_}return R}function v(S,E,_,A,R){if(S.visible===!1)return;if(S.layers.test(E.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&R===Bs)&&(!S.frustumCulled||S.intersectsFrustum(n))){S.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,S.matrixWorld);let k=e.update(S),I=S.material;if(Array.isArray(I)){let F=k.groups;for(let $=0,X=F.length;$<X;$++){let ne=F[$],q=I[ne.materialIndex];if(q&&q.visible){let K=T(S,q,A,R);S.onBeforeShadow(i,S,E,_,k,K,ne),i.renderBufferDirect(_,null,k,K,S,ne),S.onAfterShadow(i,S,E,_,k,K,ne)}}}else if(I.visible){let F=T(S,I,A,R);S.onBeforeShadow(i,S,E,_,k,F,null),i.renderBufferDirect(_,null,k,F,S,null),S.onAfterShadow(i,S,E,_,k,F,null)}}let U=S.children;for(let k=0,I=U.length;k<I;k++)v(U[k],E,_,A,R)}function w(S){S.target.removeEventListener("dispose",w);for(let _ in c){let A=c[_],R=S.target.uuid;R in A&&(A[R].dispose(),delete A[R])}}}function ty(i,e){function t(){let D=!1,ue=new lt,j=null,de=new lt(0,0,0,0);return{setMask:function(xe){j!==xe&&!D&&(i.colorMask(xe,xe,xe,xe),j=xe)},setLocked:function(xe){D=xe},setClear:function(xe,ie,Pe,Ae,dt){dt===!0&&(xe*=Ae,ie*=Ae,Pe*=Ae),ue.set(xe,ie,Pe,Ae),de.equals(ue)===!1&&(i.clearColor(xe,ie,Pe,Ae),de.copy(ue))},reset:function(){D=!1,j=null,de.set(-1,0,0,0)}}}function n(){let D=!1,ue=!1,j=null,de=null,xe=null;return{setReversed:function(ie){if(ue!==ie){let Pe=e.get("EXT_clip_control");ie?Pe.clipControlEXT(Pe.LOWER_LEFT_EXT,Pe.ZERO_TO_ONE_EXT):Pe.clipControlEXT(Pe.LOWER_LEFT_EXT,Pe.NEGATIVE_ONE_TO_ONE_EXT),ue=ie;let Ae=xe;xe=null,this.setClear(Ae)}},getReversed:function(){return ue},setTest:function(ie){ie?G(i.DEPTH_TEST):ae(i.DEPTH_TEST)},setMask:function(ie){j!==ie&&!D&&(i.depthMask(ie),j=ie)},setFunc:function(ie){if(ue&&(ie=od[ie]),de!==ie){switch(ie){case Ro:i.depthFunc(i.NEVER);break;case Io:i.depthFunc(i.ALWAYS);break;case Po:i.depthFunc(i.LESS);break;case vs:i.depthFunc(i.LEQUAL);break;case Lo:i.depthFunc(i.EQUAL);break;case No:i.depthFunc(i.GEQUAL);break;case Do:i.depthFunc(i.GREATER);break;case Uo:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}de=ie}},setLocked:function(ie){D=ie},setClear:function(ie){xe!==ie&&(xe=ie,ue&&(ie=1-ie),i.clearDepth(ie))},reset:function(){D=!1,j=null,de=null,xe=null,ue=!1}}}function s(){let D=!1,ue=null,j=null,de=null,xe=null,ie=null,Pe=null,Ae=null,dt=null;return{setTest:function(st){D||(st?G(i.STENCIL_TEST):ae(i.STENCIL_TEST))},setMask:function(st){ue!==st&&!D&&(i.stencilMask(st),ue=st)},setFunc:function(st,un,En){(j!==st||de!==un||xe!==En)&&(i.stencilFunc(st,un,En),j=st,de=un,xe=En)},setOp:function(st,un,En){(ie!==st||Pe!==un||Ae!==En)&&(i.stencilOp(st,un,En),ie=st,Pe=un,Ae=En)},setLocked:function(st){D=st},setClear:function(st){dt!==st&&(i.clearStencil(st),dt=st)},reset:function(){D=!1,ue=null,j=null,de=null,xe=null,ie=null,Pe=null,Ae=null,dt=null}}}let r=new t,o=new n,a=new s,l=new WeakMap,c=new WeakMap,d={},u={},h={},p=new WeakMap,g=[],b=null,m=!1,f=null,y=null,T=null,v=null,w=null,S=null,E=null,_=new ke(0,0,0),A=0,R=!1,P=null,U=null,k=null,I=null,F=null,$=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),X=!1,ne=0,q=i.getParameter(i.VERSION);q.indexOf("WebGL")!==-1?(ne=parseFloat(/^WebGL (\d)/.exec(q)[1]),X=ne>=1):q.indexOf("OpenGL ES")!==-1&&(ne=parseFloat(/^OpenGL ES (\d)/.exec(q)[1]),X=ne>=2);let K=null,ee={},be=i.getParameter(i.SCISSOR_BOX),Se=i.getParameter(i.VIEWPORT),tt=new lt().fromArray(be),Ge=new lt().fromArray(Se);function te(D,ue,j,de){let xe=new Uint8Array(4),ie=i.createTexture();i.bindTexture(D,ie),i.texParameteri(D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(D,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Pe=0;Pe<j;Pe++)D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY?i.texImage3D(ue,0,i.RGBA,1,1,de,0,i.RGBA,i.UNSIGNED_BYTE,xe):i.texImage2D(ue+Pe,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,xe);return ie}let H={};H[i.TEXTURE_2D]=te(i.TEXTURE_2D,i.TEXTURE_2D,1),H[i.TEXTURE_CUBE_MAP]=te(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),H[i.TEXTURE_2D_ARRAY]=te(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),H[i.TEXTURE_3D]=te(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),G(i.DEPTH_TEST),o.setFunc(vs),Ie(!1),nt(Kl),G(i.CULL_FACE),Ue(Nn);function G(D){d[D]!==!0&&(i.enable(D),d[D]=!0)}function ae(D){d[D]!==!1&&(i.disable(D),d[D]=!1)}function Te(D,ue){return h[D]!==ue?(i.bindFramebuffer(D,ue),h[D]=ue,D===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=ue),D===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=ue),!0):!1}function fe(D,ue){let j=g,de=!1;if(D){j=p.get(ue),j===void 0&&(j=[],p.set(ue,j));let xe=D.textures;if(j.length!==xe.length||j[0]!==i.COLOR_ATTACHMENT0){for(let ie=0,Pe=xe.length;ie<Pe;ie++)j[ie]=i.COLOR_ATTACHMENT0+ie;j.length=xe.length,de=!0}}else j[0]!==i.BACK&&(j[0]=i.BACK,de=!0);de&&i.drawBuffers(j)}function Ne(D){return b!==D?(i.useProgram(D),b=D,!0):!1}let Ze={[Fi]:i.FUNC_ADD,[Eu]:i.FUNC_SUBTRACT,[Cu]:i.FUNC_REVERSE_SUBTRACT};Ze[Ru]=i.MIN,Ze[Iu]=i.MAX;let se={[Pu]:i.ZERO,[Lu]:i.ONE,[Nu]:i.SRC_COLOR,[ec]:i.SRC_ALPHA,[ku]:i.SRC_ALPHA_SATURATE,[Fu]:i.DST_COLOR,[Uu]:i.DST_ALPHA,[Du]:i.ONE_MINUS_SRC_COLOR,[tc]:i.ONE_MINUS_SRC_ALPHA,[Bu]:i.ONE_MINUS_DST_COLOR,[Ou]:i.ONE_MINUS_DST_ALPHA,[zu]:i.CONSTANT_COLOR,[Vu]:i.ONE_MINUS_CONSTANT_COLOR,[Hu]:i.CONSTANT_ALPHA,[Gu]:i.ONE_MINUS_CONSTANT_ALPHA};function Ue(D,ue,j,de,xe,ie,Pe,Ae,dt,st){if(D===Nn){m===!0&&(ae(i.BLEND),m=!1);return}if(m===!1&&(G(i.BLEND),m=!0),D!==Au){if(D!==f||st!==R){if((y!==Fi||w!==Fi)&&(i.blendEquation(i.FUNC_ADD),y=Fi,w=Fi),st)switch(D){case ks:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Jl:i.blendFunc(i.ONE,i.ONE);break;case jl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Ql:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Fe("WebGLState: Invalid blending: ",D);break}else switch(D){case ks:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Jl:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case jl:Fe("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Ql:Fe("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Fe("WebGLState: Invalid blending: ",D);break}T=null,v=null,S=null,E=null,_.set(0,0,0),A=0,f=D,R=st}return}xe=xe||ue,ie=ie||j,Pe=Pe||de,(ue!==y||xe!==w)&&(i.blendEquationSeparate(Ze[ue],Ze[xe]),y=ue,w=xe),(j!==T||de!==v||ie!==S||Pe!==E)&&(i.blendFuncSeparate(se[j],se[de],se[ie],se[Pe]),T=j,v=de,S=ie,E=Pe),(Ae.equals(_)===!1||dt!==A)&&(i.blendColor(Ae.r,Ae.g,Ae.b,dt),_.copy(Ae),A=dt),f=D,R=!1}function Ye(D,ue){D.side===Nt?ae(i.CULL_FACE):G(i.CULL_FACE);let j=D.side===Yt;ue&&(j=!j),Ie(j),D.blending===ks&&D.transparent===!1?Ue(Nn):Ue(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),o.setFunc(D.depthFunc),o.setTest(D.depthTest),o.setMask(D.depthWrite),r.setMask(D.colorWrite);let de=D.stencilWrite;a.setTest(de),de&&(a.setMask(D.stencilWriteMask),a.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),a.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),Dt(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?G(i.SAMPLE_ALPHA_TO_COVERAGE):ae(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ie(D){P!==D&&(D?i.frontFace(i.CW):i.frontFace(i.CCW),P=D)}function nt(D){D!==Mu?(G(i.CULL_FACE),D!==U&&(D===Kl?i.cullFace(i.BACK):D===wu?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):ae(i.CULL_FACE),U=D}function xt(D){D!==k&&(X&&i.lineWidth(D),k=D)}function Dt(D,ue,j){D?(G(i.POLYGON_OFFSET_FILL),(I!==ue||F!==j)&&(I=ue,F=j,o.getReversed()&&(ue=-ue),i.polygonOffset(ue,j))):ae(i.POLYGON_OFFSET_FILL)}function qe(D){D?G(i.SCISSOR_TEST):ae(i.SCISSOR_TEST)}function it(D){D===void 0&&(D=i.TEXTURE0+$-1),K!==D&&(i.activeTexture(D),K=D)}function L(D,ue,j){j===void 0&&(K===null?j=i.TEXTURE0+$-1:j=K);let de=ee[j];de===void 0&&(de={type:void 0,texture:void 0},ee[j]=de),(de.type!==D||de.texture!==ue)&&(K!==j&&(i.activeTexture(j),K=j),i.bindTexture(D,ue||H[D]),de.type=D,de.texture=ue)}function pt(){let D=ee[K];D!==void 0&&D.type!==void 0&&(i.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function Qe(){try{i.compressedTexImage2D(...arguments)}catch(D){Fe("WebGLState:",D)}}function C(){try{i.compressedTexImage3D(...arguments)}catch(D){Fe("WebGLState:",D)}}function x(){try{i.texSubImage2D(...arguments)}catch(D){Fe("WebGLState:",D)}}function B(){try{i.texSubImage3D(...arguments)}catch(D){Fe("WebGLState:",D)}}function W(){try{i.compressedTexSubImage2D(...arguments)}catch(D){Fe("WebGLState:",D)}}function Z(){try{i.compressedTexSubImage3D(...arguments)}catch(D){Fe("WebGLState:",D)}}function re(){try{i.texStorage2D(...arguments)}catch(D){Fe("WebGLState:",D)}}function le(){try{i.texStorage3D(...arguments)}catch(D){Fe("WebGLState:",D)}}function J(){try{i.texImage2D(...arguments)}catch(D){Fe("WebGLState:",D)}}function Q(){try{i.texImage3D(...arguments)}catch(D){Fe("WebGLState:",D)}}function ce(D){return u[D]!==void 0?u[D]:i.getParameter(D)}function Ce(D,ue){u[D]!==ue&&(i.pixelStorei(D,ue),u[D]=ue)}function pe(D){tt.equals(D)===!1&&(i.scissor(D.x,D.y,D.z,D.w),tt.copy(D))}function he(D){Ge.equals(D)===!1&&(i.viewport(D.x,D.y,D.z,D.w),Ge.copy(D))}function Re(D,ue){let j=c.get(ue);j===void 0&&(j=new WeakMap,c.set(ue,j));let de=j.get(D);de===void 0&&(de=i.getUniformBlockIndex(ue,D.name),j.set(D,de))}function De(D,ue){let de=c.get(ue).get(D);l.get(ue)!==de&&(i.uniformBlockBinding(ue,de,D.__bindingPointIndex),l.set(ue,de))}function He(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),d={},u={},K=null,ee={},h={},p=new WeakMap,g=[],b=null,m=!1,f=null,y=null,T=null,v=null,w=null,S=null,E=null,_=new ke(0,0,0),A=0,R=!1,P=null,U=null,k=null,I=null,F=null,tt.set(0,0,i.canvas.width,i.canvas.height),Ge.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:G,disable:ae,bindFramebuffer:Te,drawBuffers:fe,useProgram:Ne,setBlending:Ue,setMaterial:Ye,setFlipSided:Ie,setCullFace:nt,setLineWidth:xt,setPolygonOffset:Dt,setScissorTest:qe,activeTexture:it,bindTexture:L,unbindTexture:pt,compressedTexImage2D:Qe,compressedTexImage3D:C,texImage2D:J,texImage3D:Q,pixelStorei:Ce,getParameter:ce,updateUBOMapping:Re,uniformBlockBinding:De,texStorage2D:re,texStorage3D:le,texSubImage2D:x,texSubImage3D:B,compressedTexSubImage2D:W,compressedTexSubImage3D:Z,scissor:pe,viewport:he,reset:He}}function ny(i,e,t,n,s,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Oe,d=new WeakMap,u=new Set,h,p=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function b(C,x){return g?new OffscreenCanvas(C,x):Ts("canvas")}function m(C,x,B){let W=1,Z=Qe(C);if((Z.width>B||Z.height>B)&&(W=B/Math.max(Z.width,Z.height)),W<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let re=Math.floor(W*Z.width),le=Math.floor(W*Z.height);h===void 0&&(h=b(re,le));let J=x?b(re,le):h;return J.width=re,J.height=le,J.getContext("2d").drawImage(C,0,0,re,le),Le("WebGLRenderer: Texture has been resized from ("+Z.width+"x"+Z.height+") to ("+re+"x"+le+")."),J}else return"data"in C&&Le("WebGLRenderer: Image in DataTexture is too big ("+Z.width+"x"+Z.height+")."),C;return C}function f(C){return C.generateMipmaps}function y(C){i.generateMipmap(C)}function T(C){return C.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?i.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function v(C,x,B,W,Z,re=!1){if(C!==null){if(i[C]!==void 0)return i[C];Le("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let le;W&&(le=e.get("EXT_texture_norm16"),le||Le("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let J=x;if(x===i.RED&&(B===i.FLOAT&&(J=i.R32F),B===i.HALF_FLOAT&&(J=i.R16F),B===i.UNSIGNED_BYTE&&(J=i.R8),B===i.UNSIGNED_SHORT&&le&&(J=le.R16_EXT),B===i.SHORT&&le&&(J=le.R16_SNORM_EXT)),x===i.RED_INTEGER&&(B===i.UNSIGNED_BYTE&&(J=i.R8UI),B===i.UNSIGNED_SHORT&&(J=i.R16UI),B===i.UNSIGNED_INT&&(J=i.R32UI),B===i.BYTE&&(J=i.R8I),B===i.SHORT&&(J=i.R16I),B===i.INT&&(J=i.R32I)),x===i.RG&&(B===i.FLOAT&&(J=i.RG32F),B===i.HALF_FLOAT&&(J=i.RG16F),B===i.UNSIGNED_BYTE&&(J=i.RG8),B===i.UNSIGNED_SHORT&&le&&(J=le.RG16_EXT),B===i.SHORT&&le&&(J=le.RG16_SNORM_EXT)),x===i.RG_INTEGER&&(B===i.UNSIGNED_BYTE&&(J=i.RG8UI),B===i.UNSIGNED_SHORT&&(J=i.RG16UI),B===i.UNSIGNED_INT&&(J=i.RG32UI),B===i.BYTE&&(J=i.RG8I),B===i.SHORT&&(J=i.RG16I),B===i.INT&&(J=i.RG32I)),x===i.RGB_INTEGER&&(B===i.UNSIGNED_BYTE&&(J=i.RGB8UI),B===i.UNSIGNED_SHORT&&(J=i.RGB16UI),B===i.UNSIGNED_INT&&(J=i.RGB32UI),B===i.BYTE&&(J=i.RGB8I),B===i.SHORT&&(J=i.RGB16I),B===i.INT&&(J=i.RGB32I)),x===i.RGBA_INTEGER&&(B===i.UNSIGNED_BYTE&&(J=i.RGBA8UI),B===i.UNSIGNED_SHORT&&(J=i.RGBA16UI),B===i.UNSIGNED_INT&&(J=i.RGBA32UI),B===i.BYTE&&(J=i.RGBA8I),B===i.SHORT&&(J=i.RGBA16I),B===i.INT&&(J=i.RGBA32I)),x===i.RGB&&(B===i.UNSIGNED_SHORT&&le&&(J=le.RGB16_EXT),B===i.SHORT&&le&&(J=le.RGB16_SNORM_EXT),B===i.UNSIGNED_INT_5_9_9_9_REV&&(J=i.RGB9_E5),B===i.UNSIGNED_INT_10F_11F_11F_REV&&(J=i.R11F_G11F_B10F)),x===i.RGBA){let Q=re?fr:je.getTransfer(Z);B===i.FLOAT&&(J=i.RGBA32F),B===i.HALF_FLOAT&&(J=i.RGBA16F),B===i.UNSIGNED_BYTE&&(J=Q===at?i.SRGB8_ALPHA8:i.RGBA8),B===i.UNSIGNED_SHORT&&le&&(J=le.RGBA16_EXT),B===i.SHORT&&le&&(J=le.RGBA16_SNORM_EXT),B===i.UNSIGNED_SHORT_4_4_4_4&&(J=i.RGBA4),B===i.UNSIGNED_SHORT_5_5_5_1&&(J=i.RGB5_A1)}return(J===i.R16F||J===i.R32F||J===i.RG16F||J===i.RG32F||J===i.RGBA16F||J===i.RGBA32F)&&e.get("EXT_color_buffer_float"),J}function w(C,x){let B;return C?x===null||x===vn||x===Hs?B=i.DEPTH24_STENCIL8:x===cn?B=i.DEPTH32F_STENCIL8:x===Vs&&(B=i.DEPTH24_STENCIL8,Le("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===vn||x===Hs?B=i.DEPTH_COMPONENT24:x===cn?B=i.DEPTH_COMPONENT32F:x===Vs&&(B=i.DEPTH_COMPONENT16),B}function S(C,x){return f(C)===!0||C.isFramebufferTexture&&C.minFilter!==wt&&C.minFilter!==Tt?Math.log2(Math.max(x.width,x.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?x.mipmaps.length:1}function E(C){let x=C.target;x.removeEventListener("dispose",E),A(x),x.isVideoTexture&&d.delete(x),x.isHTMLTexture&&u.delete(x)}function _(C){let x=C.target;x.removeEventListener("dispose",_),P(x)}function A(C){let x=n.get(C);if(x.__webglInit===void 0)return;let B=C.source,W=p.get(B);if(W){let Z=W[x.__cacheKey];Z.usedTimes--,Z.usedTimes===0&&R(C),Object.keys(W).length===0&&p.delete(B)}n.remove(C)}function R(C){let x=n.get(C);i.deleteTexture(x.__webglTexture);let B=C.source,W=p.get(B);delete W[x.__cacheKey],o.memory.textures--}function P(C){let x=n.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),n.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let W=0;W<6;W++){if(Array.isArray(x.__webglFramebuffer[W]))for(let Z=0;Z<x.__webglFramebuffer[W].length;Z++)i.deleteFramebuffer(x.__webglFramebuffer[W][Z]);else i.deleteFramebuffer(x.__webglFramebuffer[W]);x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer[W])}else{if(Array.isArray(x.__webglFramebuffer))for(let W=0;W<x.__webglFramebuffer.length;W++)i.deleteFramebuffer(x.__webglFramebuffer[W]);else i.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&i.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let W=0;W<x.__webglColorRenderbuffer.length;W++)x.__webglColorRenderbuffer[W]&&i.deleteRenderbuffer(x.__webglColorRenderbuffer[W]);x.__webglDepthRenderbuffer&&i.deleteRenderbuffer(x.__webglDepthRenderbuffer)}let B=C.textures;for(let W=0,Z=B.length;W<Z;W++){let re=n.get(B[W]);re.__webglTexture&&(i.deleteTexture(re.__webglTexture),o.memory.textures--),n.remove(B[W])}n.remove(C)}let U=0;function k(){U=0}function I(){return U}function F(C){U=C}function $(){let C=U;return C>=s.maxTextures&&Le("WebGLTextures: Trying to use "+(C+1)+" texture units while this GPU supports only "+s.maxTextures),U+=1,C}function X(C){let x=[];return x.push(C.wrapS),x.push(C.wrapT),x.push(C.wrapR||0),x.push(C.magFilter),x.push(C.minFilter),x.push(C.anisotropy),x.push(C.internalFormat),x.push(C.format),x.push(C.type),x.push(C.generateMipmaps),x.push(C.premultiplyAlpha),x.push(C.flipY),x.push(C.unpackAlignment),x.push(C.colorSpace),x.join()}function ne(C,x){let B=n.get(C);if(C.isVideoTexture&&L(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&B.__version!==C.version){let W=C.image;if(W===null)Le("WebGLRenderer: Texture marked for update but no image data found.");else if(W.complete===!1)Le("WebGLRenderer: Texture marked for update but image is incomplete");else{ae(B,C,x);return}}else C.isExternalTexture&&(B.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,B.__webglTexture,i.TEXTURE0+x)}function q(C,x){let B=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&B.__version!==C.version){ae(B,C,x);return}else C.isExternalTexture&&(B.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,B.__webglTexture,i.TEXTURE0+x)}function K(C,x){let B=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&B.__version!==C.version){ae(B,C,x);return}t.bindTexture(i.TEXTURE_3D,B.__webglTexture,i.TEXTURE0+x)}function ee(C,x){let B=n.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&B.__version!==C.version){Te(B,C,x);return}t.bindTexture(i.TEXTURE_CUBE_MAP,B.__webglTexture,i.TEXTURE0+x)}let be={[bs]:i.REPEAT,[ln]:i.CLAMP_TO_EDGE,[Ss]:i.MIRRORED_REPEAT},Se={[wt]:i.NEAREST,[sa]:i.NEAREST_MIPMAP_NEAREST,[ki]:i.NEAREST_MIPMAP_LINEAR,[Tt]:i.LINEAR,[zs]:i.LINEAR_MIPMAP_NEAREST,[Dn]:i.LINEAR_MIPMAP_LINEAR},tt={[Ku]:i.NEVER,[td]:i.ALWAYS,[Ju]:i.LESS,[Va]:i.LEQUAL,[ju]:i.EQUAL,[Ha]:i.GEQUAL,[Qu]:i.GREATER,[ed]:i.NOTEQUAL};function Ge(C,x){if(x.type===cn&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===Tt||x.magFilter===zs||x.magFilter===ki||x.magFilter===Dn||x.minFilter===Tt||x.minFilter===zs||x.minFilter===ki||x.minFilter===Dn)&&Le("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(C,i.TEXTURE_WRAP_S,be[x.wrapS]),i.texParameteri(C,i.TEXTURE_WRAP_T,be[x.wrapT]),(C===i.TEXTURE_3D||C===i.TEXTURE_2D_ARRAY)&&i.texParameteri(C,i.TEXTURE_WRAP_R,be[x.wrapR]),i.texParameteri(C,i.TEXTURE_MAG_FILTER,Se[x.magFilter]),i.texParameteri(C,i.TEXTURE_MIN_FILTER,Se[x.minFilter]),x.compareFunction&&(i.texParameteri(C,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(C,i.TEXTURE_COMPARE_FUNC,tt[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===wt||x.minFilter!==ki&&x.minFilter!==Dn||x.type===cn&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||n.get(x).__currentAnisotropy){let B=e.get("EXT_texture_filter_anisotropic");i.texParameterf(C,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,s.getMaxAnisotropy())),n.get(x).__currentAnisotropy=x.anisotropy}}}function te(C,x){let B=!1;C.__webglInit===void 0&&(C.__webglInit=!0,x.addEventListener("dispose",E));let W=x.source,Z=p.get(W);Z===void 0&&(Z={},p.set(W,Z));let re=X(x);if(re!==C.__cacheKey){Z[re]===void 0&&(Z[re]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,B=!0),Z[re].usedTimes++;let le=Z[C.__cacheKey];le!==void 0&&(Z[C.__cacheKey].usedTimes--,le.usedTimes===0&&R(x)),C.__cacheKey=re,C.__webglTexture=Z[re].texture}return B}function H(C,x,B){return Math.floor(Math.floor(C/B)/x)}function G(C,x,B,W){let re=C.updateRanges;if(re.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,x.width,x.height,B,W,x.data);else{re.sort((Ce,pe)=>Ce.start-pe.start);let le=0;for(let Ce=1;Ce<re.length;Ce++){let pe=re[le],he=re[Ce],Re=pe.start+pe.count,De=H(he.start,x.width,4),He=H(pe.start,x.width,4);he.start<=Re+1&&De===He&&H(he.start+he.count-1,x.width,4)===De?pe.count=Math.max(pe.count,he.start+he.count-pe.start):(++le,re[le]=he)}re.length=le+1;let J=t.getParameter(i.UNPACK_ROW_LENGTH),Q=t.getParameter(i.UNPACK_SKIP_PIXELS),ce=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,x.width);for(let Ce=0,pe=re.length;Ce<pe;Ce++){let he=re[Ce],Re=Math.floor(he.start/4),De=Math.ceil(he.count/4),He=Re%x.width,D=Math.floor(Re/x.width),ue=De,j=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,He),t.pixelStorei(i.UNPACK_SKIP_ROWS,D),t.texSubImage2D(i.TEXTURE_2D,0,He,D,ue,j,B,W,x.data)}C.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,J),t.pixelStorei(i.UNPACK_SKIP_PIXELS,Q),t.pixelStorei(i.UNPACK_SKIP_ROWS,ce)}}function ae(C,x,B){let W=i.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(W=i.TEXTURE_2D_ARRAY),x.isData3DTexture&&(W=i.TEXTURE_3D);let Z=te(C,x),re=x.source;t.bindTexture(W,C.__webglTexture,i.TEXTURE0+B);let le=n.get(re);if(re.version!==le.__version||Z===!0){if(t.activeTexture(i.TEXTURE0+B),(typeof ImageBitmap<"u"&&x.image instanceof ImageBitmap)===!1){let j=je.getPrimaries(je.workingColorSpace),de=x.colorSpace===Sn?null:je.getPrimaries(x.colorSpace),xe=x.colorSpace===Sn||j===de?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,xe)}t.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment);let Q=m(x.image,!1,s.maxTextureSize);Q=pt(x,Q);let ce=r.convert(x.format,x.colorSpace),Ce=r.convert(x.type),pe=v(x.internalFormat,ce,Ce,x.normalized,x.colorSpace,x.isVideoTexture);Ge(W,x);let he,Re=x.mipmaps,De=x.isVideoTexture!==!0,He=le.__version===void 0||Z===!0,D=re.dataReady,ue=S(x,Q);if(x.isDepthTexture)pe=w(x.format===_i,x.type),He&&(De?t.texStorage2D(i.TEXTURE_2D,1,pe,Q.width,Q.height):t.texImage2D(i.TEXTURE_2D,0,pe,Q.width,Q.height,0,ce,Ce,null));else if(x.isDataTexture)if(Re.length>0){De&&He&&t.texStorage2D(i.TEXTURE_2D,ue,pe,Re[0].width,Re[0].height);for(let j=0,de=Re.length;j<de;j++)he=Re[j],De?D&&t.texSubImage2D(i.TEXTURE_2D,j,0,0,he.width,he.height,ce,Ce,he.data):t.texImage2D(i.TEXTURE_2D,j,pe,he.width,he.height,0,ce,Ce,he.data);x.generateMipmaps=!1}else De?(He&&t.texStorage2D(i.TEXTURE_2D,ue,pe,Q.width,Q.height),D&&G(x,Q,ce,Ce)):t.texImage2D(i.TEXTURE_2D,0,pe,Q.width,Q.height,0,ce,Ce,Q.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){De&&He&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ue,pe,Re[0].width,Re[0].height,Q.depth);for(let j=0,de=Re.length;j<de;j++)if(he=Re[j],x.format!==qt)if(ce!==null)if(De){if(D)if(x.layerUpdates.size>0){let xe=Mc(he.width,he.height,x.format,x.type);for(let ie of x.layerUpdates){let Pe=he.data.subarray(ie*xe/he.data.BYTES_PER_ELEMENT,(ie+1)*xe/he.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,j,0,0,ie,he.width,he.height,1,ce,Pe)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,j,0,0,0,he.width,he.height,Q.depth,ce,he.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,j,pe,he.width,he.height,Q.depth,0,he.data,0,0);else Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else De?D&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,j,0,0,0,he.width,he.height,Q.depth,ce,Ce,he.data):t.texImage3D(i.TEXTURE_2D_ARRAY,j,pe,he.width,he.height,Q.depth,0,ce,Ce,he.data);x.layerUpdates.size>0&&x.clearLayerUpdates()}else{De&&He&&t.texStorage2D(i.TEXTURE_2D,ue,pe,Re[0].width,Re[0].height);for(let j=0,de=Re.length;j<de;j++)he=Re[j],x.format!==qt?ce!==null?De?D&&t.compressedTexSubImage2D(i.TEXTURE_2D,j,0,0,he.width,he.height,ce,he.data):t.compressedTexImage2D(i.TEXTURE_2D,j,pe,he.width,he.height,0,he.data):Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):De?D&&t.texSubImage2D(i.TEXTURE_2D,j,0,0,he.width,he.height,ce,Ce,he.data):t.texImage2D(i.TEXTURE_2D,j,pe,he.width,he.height,0,ce,Ce,he.data)}else if(x.isDataArrayTexture)if(De){if(He&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ue,pe,Q.width,Q.height,Q.depth),D)if(x.layerUpdates.size>0){let j=Mc(Q.width,Q.height,x.format,x.type);for(let de of x.layerUpdates){let xe=Q.data.subarray(de*j/Q.data.BYTES_PER_ELEMENT,(de+1)*j/Q.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,de,Q.width,Q.height,1,ce,Ce,xe)}x.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,ce,Ce,Q.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,pe,Q.width,Q.height,Q.depth,0,ce,Ce,Q.data);else if(x.isData3DTexture)De?(He&&t.texStorage3D(i.TEXTURE_3D,ue,pe,Q.width,Q.height,Q.depth),D&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,ce,Ce,Q.data)):t.texImage3D(i.TEXTURE_3D,0,pe,Q.width,Q.height,Q.depth,0,ce,Ce,Q.data);else if(x.isFramebufferTexture){if(He)if(De)t.texStorage2D(i.TEXTURE_2D,ue,pe,Q.width,Q.height);else{let j=Q.width,de=Q.height;for(let xe=0;xe<ue;xe++)t.texImage2D(i.TEXTURE_2D,xe,pe,j,de,0,ce,Ce,null),j>>=1,de>>=1}}else if(x.isHTMLTexture){if("texElementImage2D"in i){let j=i.canvas;if(j.hasAttribute("layoutsubtree")||j.setAttribute("layoutsubtree","true"),Q.parentNode!==j){j.appendChild(Q),u.add(x),j.onpaint=de=>{let xe=de.changedElements;for(let ie of u)xe.includes(ie.image)&&(ie.needsUpdate=!0)},j.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,Q);else{let xe=i.RGBA,ie=i.RGBA,Pe=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,xe,ie,Pe,Q)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Re.length>0){if(De&&He){let j=Qe(Re[0]);t.texStorage2D(i.TEXTURE_2D,ue,pe,j.width,j.height)}for(let j=0,de=Re.length;j<de;j++)he=Re[j],De?D&&t.texSubImage2D(i.TEXTURE_2D,j,0,0,ce,Ce,he):t.texImage2D(i.TEXTURE_2D,j,pe,ce,Ce,he);x.generateMipmaps=!1}else if(De){if(He){let j=Qe(Q);t.texStorage2D(i.TEXTURE_2D,ue,pe,j.width,j.height)}D&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ce,Ce,Q)}else t.texImage2D(i.TEXTURE_2D,0,pe,ce,Ce,Q);f(x)&&y(W),le.__version=re.version,x.onUpdate&&x.onUpdate(x)}C.__version=x.version}function Te(C,x,B){if(x.image.length!==6)return;let W=te(C,x),Z=x.source;t.bindTexture(i.TEXTURE_CUBE_MAP,C.__webglTexture,i.TEXTURE0+B);let re=n.get(Z);if(Z.version!==re.__version||W===!0){t.activeTexture(i.TEXTURE0+B);let le=je.getPrimaries(je.workingColorSpace),J=x.colorSpace===Sn?null:je.getPrimaries(x.colorSpace),Q=x.colorSpace===Sn||le===J?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Q);let ce=x.isCompressedTexture||x.image[0].isCompressedTexture,Ce=x.image[0]&&x.image[0].isDataTexture,pe=[];for(let ie=0;ie<6;ie++)!ce&&!Ce?pe[ie]=m(x.image[ie],!0,s.maxCubemapSize):pe[ie]=Ce?x.image[ie].image:x.image[ie],pe[ie]=pt(x,pe[ie]);let he=pe[0],Re=r.convert(x.format,x.colorSpace),De=r.convert(x.type),He=v(x.internalFormat,Re,De,x.normalized,x.colorSpace),D=x.isVideoTexture!==!0,ue=re.__version===void 0||W===!0,j=Z.dataReady,de=S(x,he);Ge(i.TEXTURE_CUBE_MAP,x);let xe;if(ce){D&&ue&&t.texStorage2D(i.TEXTURE_CUBE_MAP,de,He,he.width,he.height);for(let ie=0;ie<6;ie++){xe=pe[ie].mipmaps;for(let Pe=0;Pe<xe.length;Pe++){let Ae=xe[Pe];x.format!==qt?Re!==null?D?j&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Pe,0,0,Ae.width,Ae.height,Re,Ae.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Pe,He,Ae.width,Ae.height,0,Ae.data):Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):D?j&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Pe,0,0,Ae.width,Ae.height,Re,De,Ae.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Pe,He,Ae.width,Ae.height,0,Re,De,Ae.data)}}}else{if(xe=x.mipmaps,D&&ue){xe.length>0&&de++;let ie=Qe(pe[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,de,He,ie.width,ie.height)}for(let ie=0;ie<6;ie++)if(Ce){D?j&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,pe[ie].width,pe[ie].height,Re,De,pe[ie].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,He,pe[ie].width,pe[ie].height,0,Re,De,pe[ie].data);for(let Pe=0;Pe<xe.length;Pe++){let dt=xe[Pe].image[ie].image;D?j&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Pe+1,0,0,dt.width,dt.height,Re,De,dt.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Pe+1,He,dt.width,dt.height,0,Re,De,dt.data)}}else{D?j&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,Re,De,pe[ie]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,He,Re,De,pe[ie]);for(let Pe=0;Pe<xe.length;Pe++){let Ae=xe[Pe];D?j&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Pe+1,0,0,Re,De,Ae.image[ie]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Pe+1,He,Re,De,Ae.image[ie])}}}f(x)&&y(i.TEXTURE_CUBE_MAP),re.__version=Z.version,x.onUpdate&&x.onUpdate(x)}C.__version=x.version}function fe(C,x,B,W,Z,re){let le=r.convert(B.format,B.colorSpace),J=r.convert(B.type),Q=v(B.internalFormat,le,J,B.normalized,B.colorSpace),ce=n.get(x),Ce=n.get(B);if(Ce.__renderTarget=x,!ce.__hasExternalTextures){let pe=Math.max(1,x.width>>re),he=Math.max(1,x.height>>re);Z===i.TEXTURE_3D||Z===i.TEXTURE_2D_ARRAY?t.texImage3D(Z,re,Q,pe,he,x.depth,0,le,J,null):t.texImage2D(Z,re,Q,pe,he,0,le,J,null)}t.bindFramebuffer(i.FRAMEBUFFER,C),it(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,W,Z,Ce.__webglTexture,0,qe(x)):(Z===i.TEXTURE_2D||Z>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&Z<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,W,Z,Ce.__webglTexture,re),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ne(C,x,B){if(i.bindRenderbuffer(i.RENDERBUFFER,C),x.depthBuffer){let W=x.depthTexture,Z=W&&W.isDepthTexture?W.type:null,re=w(x.stencilBuffer,Z),le=x.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;it(x)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,qe(x),re,x.width,x.height):B?i.renderbufferStorageMultisample(i.RENDERBUFFER,qe(x),re,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,re,x.width,x.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,le,i.RENDERBUFFER,C)}else{let W=x.textures;for(let Z=0;Z<W.length;Z++){let re=W[Z],le=r.convert(re.format,re.colorSpace),J=r.convert(re.type),Q=v(re.internalFormat,le,J,re.normalized,re.colorSpace);it(x)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,qe(x),Q,x.width,x.height):B?i.renderbufferStorageMultisample(i.RENDERBUFFER,qe(x),Q,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,Q,x.width,x.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Ze(C,x,B){let W=x.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,C),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let Z=n.get(x.depthTexture);if(Z.__renderTarget=x,(!Z.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),W){if(Z.__webglInit===void 0&&(Z.__webglInit=!0,x.depthTexture.addEventListener("dispose",E)),Z.__webglTexture===void 0){Z.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,Z.__webglTexture),Ge(i.TEXTURE_CUBE_MAP,x.depthTexture);let ce=r.convert(x.depthTexture.format),Ce=r.convert(x.depthTexture.type),pe;x.depthTexture.format===In?pe=i.DEPTH_COMPONENT24:x.depthTexture.format===_i&&(pe=i.DEPTH24_STENCIL8);for(let he=0;he<6;he++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+he,0,pe,x.width,x.height,0,ce,Ce,null)}}else ne(x.depthTexture,0);let re=Z.__webglTexture,le=qe(x),J=W?i.TEXTURE_CUBE_MAP_POSITIVE_X+B:i.TEXTURE_2D,Q=x.depthTexture.format===_i?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(x.depthTexture.format===In)it(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Q,J,re,0,le):i.framebufferTexture2D(i.FRAMEBUFFER,Q,J,re,0);else if(x.depthTexture.format===_i)it(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Q,J,re,0,le):i.framebufferTexture2D(i.FRAMEBUFFER,Q,J,re,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function se(C){let x=n.get(C),B=C.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==C.depthTexture){let W=C.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),W){let Z=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,W.removeEventListener("dispose",Z)};W.addEventListener("dispose",Z),x.__depthDisposeCallback=Z}x.__boundDepthTexture=W}if(C.depthTexture&&!x.__autoAllocateDepthBuffer)if(B)for(let W=0;W<6;W++)Ze(x.__webglFramebuffer[W],C,W);else{let W=C.texture.mipmaps;W&&W.length>0?Ze(x.__webglFramebuffer[0],C,0):Ze(x.__webglFramebuffer,C,0)}else if(B){x.__webglDepthbuffer=[];for(let W=0;W<6;W++)if(t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[W]),x.__webglDepthbuffer[W]===void 0)x.__webglDepthbuffer[W]=i.createRenderbuffer(),Ne(x.__webglDepthbuffer[W],C,!1);else{let Z=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,re=x.__webglDepthbuffer[W];i.bindRenderbuffer(i.RENDERBUFFER,re),i.framebufferRenderbuffer(i.FRAMEBUFFER,Z,i.RENDERBUFFER,re)}}else{let W=C.texture.mipmaps;if(W&&W.length>0?t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=i.createRenderbuffer(),Ne(x.__webglDepthbuffer,C,!1);else{let Z=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,re=x.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,re),i.framebufferRenderbuffer(i.FRAMEBUFFER,Z,i.RENDERBUFFER,re)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ue(C,x,B){let W=n.get(C);x!==void 0&&fe(W.__webglFramebuffer,C,C.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),B!==void 0&&se(C)}function Ye(C){let x=C.texture,B=n.get(C),W=n.get(x);C.addEventListener("dispose",_);let Z=C.textures,re=C.isWebGLCubeRenderTarget===!0,le=Z.length>1;if(le||(W.__webglTexture===void 0&&(W.__webglTexture=i.createTexture()),W.__version=x.version,o.memory.textures++),re){B.__webglFramebuffer=[];for(let J=0;J<6;J++)if(x.mipmaps&&x.mipmaps.length>0){B.__webglFramebuffer[J]=[];for(let Q=0;Q<x.mipmaps.length;Q++)B.__webglFramebuffer[J][Q]=i.createFramebuffer()}else B.__webglFramebuffer[J]=i.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){B.__webglFramebuffer=[];for(let J=0;J<x.mipmaps.length;J++)B.__webglFramebuffer[J]=i.createFramebuffer()}else B.__webglFramebuffer=i.createFramebuffer();if(le)for(let J=0,Q=Z.length;J<Q;J++){let ce=n.get(Z[J]);ce.__webglTexture===void 0&&(ce.__webglTexture=i.createTexture(),o.memory.textures++)}if(C.samples>0&&it(C)===!1){B.__webglMultisampledFramebuffer=i.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let J=0;J<Z.length;J++){let Q=Z[J];B.__webglColorRenderbuffer[J]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,B.__webglColorRenderbuffer[J]);let ce=r.convert(Q.format,Q.colorSpace),Ce=r.convert(Q.type),pe=v(Q.internalFormat,ce,Ce,Q.normalized,Q.colorSpace,C.isXRRenderTarget===!0),he=qe(C);i.renderbufferStorageMultisample(i.RENDERBUFFER,he,pe,C.width,C.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+J,i.RENDERBUFFER,B.__webglColorRenderbuffer[J])}i.bindRenderbuffer(i.RENDERBUFFER,null),C.depthBuffer&&(B.__webglDepthRenderbuffer=i.createRenderbuffer(),Ne(B.__webglDepthRenderbuffer,C,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(re){t.bindTexture(i.TEXTURE_CUBE_MAP,W.__webglTexture),Ge(i.TEXTURE_CUBE_MAP,x);for(let J=0;J<6;J++)if(x.mipmaps&&x.mipmaps.length>0)for(let Q=0;Q<x.mipmaps.length;Q++)fe(B.__webglFramebuffer[J][Q],C,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+J,Q);else fe(B.__webglFramebuffer[J],C,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0);f(x)&&y(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(le){for(let J=0,Q=Z.length;J<Q;J++){let ce=Z[J],Ce=n.get(ce),pe=i.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(pe=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(pe,Ce.__webglTexture),Ge(pe,ce),fe(B.__webglFramebuffer,C,ce,i.COLOR_ATTACHMENT0+J,pe,0),f(ce)&&y(pe)}t.unbindTexture()}else{let J=i.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(J=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(J,W.__webglTexture),Ge(J,x),x.mipmaps&&x.mipmaps.length>0)for(let Q=0;Q<x.mipmaps.length;Q++)fe(B.__webglFramebuffer[Q],C,x,i.COLOR_ATTACHMENT0,J,Q);else fe(B.__webglFramebuffer,C,x,i.COLOR_ATTACHMENT0,J,0);f(x)&&y(J),t.unbindTexture()}C.depthBuffer&&se(C)}function Ie(C){let x=C.textures;for(let B=0,W=x.length;B<W;B++){let Z=x[B];if(f(Z)){let re=T(C),le=n.get(Z).__webglTexture;t.bindTexture(re,le),y(re),t.unbindTexture()}}}let nt=[],xt=[];function Dt(C){if(C.samples>0){if(it(C)===!1){let x=C.textures,B=C.width,W=C.height,Z=i.COLOR_BUFFER_BIT,re=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,le=n.get(C),J=x.length>1;if(J)for(let ce=0;ce<x.length;ce++)t.bindFramebuffer(i.FRAMEBUFFER,le.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ce,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,le.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ce,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,le.__webglMultisampledFramebuffer);let Q=C.texture.mipmaps;Q&&Q.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,le.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,le.__webglFramebuffer);for(let ce=0;ce<x.length;ce++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(Z|=i.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(Z|=i.STENCIL_BUFFER_BIT)),J){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,le.__webglColorRenderbuffer[ce]);let Ce=n.get(x[ce]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Ce,0)}i.blitFramebuffer(0,0,B,W,0,0,B,W,Z,i.NEAREST),l===!0&&(nt.length=0,xt.length=0,nt.push(i.COLOR_ATTACHMENT0+ce),C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&(nt.push(re),xt.push(re),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,xt)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,nt))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),J)for(let ce=0;ce<x.length;ce++){t.bindFramebuffer(i.FRAMEBUFFER,le.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ce,i.RENDERBUFFER,le.__webglColorRenderbuffer[ce]);let Ce=n.get(x[ce]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,le.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ce,i.TEXTURE_2D,Ce,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,le.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&l){let x=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[x])}}}function qe(C){return Math.min(s.maxSamples,C.samples)}function it(C){let x=n.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function L(C){let x=o.render.frame;d.get(C)!==x&&(d.set(C,x),C.update())}function pt(C,x){let B=C.colorSpace,W=C.format,Z=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||B!==dr&&B!==Sn&&(je.getTransfer(B)===at?(W!==qt||Z!==Kt)&&Le("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Fe("WebGLTextures: Unsupported texture color space:",B)),x}function Qe(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=$,this.resetTextureUnits=k,this.getTextureUnits=I,this.setTextureUnits=F,this.setTexture2D=ne,this.setTexture2DArray=q,this.setTexture3D=K,this.setTextureCube=ee,this.rebindTextures=Ue,this.setupRenderTarget=Ye,this.updateRenderTargetMipmap=Ie,this.updateMultisampleRenderTarget=Dt,this.setupDepthRenderbuffer=se,this.setupFrameBufferTexture=fe,this.useMultisampledRTT=it,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function iy(i,e){function t(n,s=Sn){let r,o=je.getTransfer(s);if(n===Kt)return i.UNSIGNED_BYTE;if(n===oa)return i.UNSIGNED_SHORT_4_4_4_4;if(n===aa)return i.UNSIGNED_SHORT_5_5_5_1;if(n===dc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===fc)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===hc)return i.BYTE;if(n===uc)return i.SHORT;if(n===Vs)return i.UNSIGNED_SHORT;if(n===ra)return i.INT;if(n===vn)return i.UNSIGNED_INT;if(n===cn)return i.FLOAT;if(n===bn)return i.HALF_FLOAT;if(n===pc)return i.ALPHA;if(n===mc)return i.RGB;if(n===qt)return i.RGBA;if(n===In)return i.DEPTH_COMPONENT;if(n===_i)return i.DEPTH_STENCIL;if(n===gc)return i.RED;if(n===la)return i.RED_INTEGER;if(n===xi)return i.RG;if(n===ca)return i.RG_INTEGER;if(n===ha)return i.RGBA_INTEGER;if(n===Lr||n===Nr||n===Dr||n===Ur)if(o===at)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Lr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Nr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Dr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Ur)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Lr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Nr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Dr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Ur)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===ua||n===da||n===fa||n===pa)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===ua)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===da)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===fa)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===pa)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===ma||n===ga||n===_a||n===xa||n===ya||n===Or||n===va)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===ma||n===ga)return o===at?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===_a)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===xa)return r.COMPRESSED_R11_EAC;if(n===ya)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Or)return r.COMPRESSED_RG11_EAC;if(n===va)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===ba||n===Sa||n===Ma||n===wa||n===Ta||n===Aa||n===Ea||n===Ca||n===Ra||n===Ia||n===Pa||n===La||n===Na||n===Da)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===ba)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Sa)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Ma)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===wa)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Ta)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Aa)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ea)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ca)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ra)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Ia)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Pa)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===La)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Na)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Da)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Ua||n===Oa||n===Fa)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Ua)return o===at?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Oa)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Fa)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Ba||n===ka||n===Fr||n===za)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Ba)return r.COMPRESSED_RED_RGTC1_EXT;if(n===ka)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Fr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===za)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Hs?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var sy=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,ry=`
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

}`,Fc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new br(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new nn({vertexShader:sy,fragmentShader:ry,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Xt(new Mr(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Bc=class extends _n{constructor(e,t){super();let n=this,s=null,r=1,o=null,a="local-floor",l=1,c=null,d=null,u=null,h=null,p=null,g=null,b=typeof XRWebGLBinding<"u",m=new Fc,f={},y=t.getContextAttributes(),T=null,v=null,w=[],S=[],E=new Oe,_=null,A=null,R=new zt;R.viewport=new lt;let P=new zt;P.viewport=new lt;let U=[R,P],k=new ea,I=null,F=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(H){let G=w[H];return G===void 0&&(G=new Rs,w[H]=G),G.getTargetRaySpace()},this.getControllerGrip=function(H){let G=w[H];return G===void 0&&(G=new Rs,w[H]=G),G.getGripSpace()},this.getHand=function(H){let G=w[H];return G===void 0&&(G=new Rs,w[H]=G),G.getHandSpace()};function $(H){let G=S.indexOf(H.inputSource);if(G===-1)return;let ae=w[G];ae!==void 0&&(ae.update(H.inputSource,H.frame,c||o),ae.dispatchEvent({type:H.type,data:H.inputSource}))}function X(){s.removeEventListener("select",$),s.removeEventListener("selectstart",$),s.removeEventListener("selectend",$),s.removeEventListener("squeeze",$),s.removeEventListener("squeezestart",$),s.removeEventListener("squeezeend",$),s.removeEventListener("end",X),s.removeEventListener("inputsourceschange",ne);for(let H=0;H<w.length;H++){let G=S[H];G!==null&&(S[H]=null,w[H].disconnect(G))}I=null,F=null,m.reset();for(let H in f)delete f[H];if(e.setRenderTarget(T),p=null,h=null,u=null,s=null,v=null,te.stop(),n.isPresenting=!1,e.setPixelRatio(_),e.setSize(E.width,E.height,!1),A!==null){let H=A.camera;H.fov=A.fov,H.zoom=A.zoom,H.updateProjectionMatrix(),A=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(H){r=H,n.isPresenting===!0&&Le("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(H){a=H,n.isPresenting===!0&&Le("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(H){c=H},this.getBaseLayer=function(){return h!==null?h:p},this.getBinding=function(){return u===null&&b&&(u=new XRWebGLBinding(s,t)),u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(H){if(s=H,s!==null){if(T=e.getRenderTarget(),s.addEventListener("select",$),s.addEventListener("selectstart",$),s.addEventListener("selectend",$),s.addEventListener("squeeze",$),s.addEventListener("squeezestart",$),s.addEventListener("squeezeend",$),s.addEventListener("end",X),s.addEventListener("inputsourceschange",ne),y.xrCompatible!==!0&&await t.makeXRCompatible(),_=e.getPixelRatio(),e.getSize(E),b&&"createProjectionLayer"in XRWebGLBinding.prototype){let ae=null,Te=null,fe=null;y.depth&&(fe=y.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ae=y.stencil?_i:In,Te=y.stencil?Hs:vn);let Ne={colorFormat:t.RGBA8,depthFormat:fe,scaleFactor:r};u=this.getBinding(),h=u.createProjectionLayer(Ne),s.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),v=new Zt(h.textureWidth,h.textureHeight,{format:qt,type:Kt,depthTexture:new hi(h.textureWidth,h.textureHeight,Te,void 0,void 0,void 0,void 0,void 0,void 0,ae),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}else{let ae={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,t,ae),s.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),v=new Zt(p.framebufferWidth,p.framebufferHeight,{format:qt,type:Kt,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),te.setContext(s),te.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function ne(H){for(let G=0;G<H.removed.length;G++){let ae=H.removed[G],Te=S.indexOf(ae);Te>=0&&(S[Te]=null,w[Te].disconnect(ae))}for(let G=0;G<H.added.length;G++){let ae=H.added[G],Te=S.indexOf(ae);if(Te===-1){for(let Ne=0;Ne<w.length;Ne++)if(Ne>=S.length){S.push(ae),Te=Ne;break}else if(S[Ne]===null){S[Ne]=ae,Te=Ne;break}if(Te===-1)break}let fe=w[Te];fe&&fe.connect(ae)}}let q=new O,K=new O;function ee(H,G,ae){q.setFromMatrixPosition(G.matrixWorld),K.setFromMatrixPosition(ae.matrixWorld);let Te=q.distanceTo(K),fe=G.projectionMatrix.elements,Ne=ae.projectionMatrix.elements,Ze=fe[14]/(fe[10]-1),se=fe[14]/(fe[10]+1),Ue=(fe[9]+1)/fe[5],Ye=(fe[9]-1)/fe[5],Ie=(fe[8]-1)/fe[0],nt=(Ne[8]+1)/Ne[0],xt=Ze*Ie,Dt=Ze*nt,qe=Te/(-Ie+nt),it=qe*-Ie;if(G.matrixWorld.decompose(H.position,H.quaternion,H.scale),H.translateX(it),H.translateZ(qe),H.matrixWorld.compose(H.position,H.quaternion,H.scale),H.matrixWorldInverse.copy(H.matrixWorld).invert(),fe[10]===-1)H.projectionMatrix.copy(G.projectionMatrix),H.projectionMatrixInverse.copy(G.projectionMatrixInverse);else{let L=Ze+qe,pt=se+qe,Qe=xt-it,C=Dt+(Te-it),x=Ue*se/pt*L,B=Ye*se/pt*L;H.projectionMatrix.makePerspective(Qe,C,x,B,L,pt),H.projectionMatrixInverse.copy(H.projectionMatrix).invert()}}function be(H,G){G===null?H.matrixWorld.copy(H.matrix):H.matrixWorld.multiplyMatrices(G.matrixWorld,H.matrix),H.matrixWorldInverse.copy(H.matrixWorld).invert()}this.updateCamera=function(H){if(s===null)return;let G=H.near,ae=H.far;m.texture!==null&&(m.depthNear>0&&(G=m.depthNear),m.depthFar>0&&(ae=m.depthFar)),k.near=P.near=R.near=G,k.far=P.far=R.far=ae,(I!==k.near||F!==k.far)&&(s.updateRenderState({depthNear:k.near,depthFar:k.far}),I=k.near,F=k.far),k.layers.mask=H.layers.mask|6,R.layers.mask=k.layers.mask&-5,P.layers.mask=k.layers.mask&-3;let Te=H.parent,fe=k.cameras;be(k,Te);for(let Ne=0;Ne<fe.length;Ne++)be(fe[Ne],Te);fe.length===2?ee(k,R,P):k.projectionMatrix.copy(R.projectionMatrix),A===null&&H.isPerspectiveCamera&&(A={camera:H,fov:H.fov,zoom:H.zoom}),Se(H,k,Te)};function Se(H,G,ae){ae===null?H.matrix.copy(G.matrixWorld):(H.matrix.copy(ae.matrixWorld),H.matrix.invert(),H.matrix.multiply(G.matrixWorld)),H.matrix.decompose(H.position,H.quaternion,H.scale),H.updateMatrixWorld(!0),H.projectionMatrix.copy(G.projectionMatrix),H.projectionMatrixInverse.copy(G.projectionMatrixInverse),H.isPerspectiveCamera&&(H.fov=Es*2*Math.atan(1/H.projectionMatrix.elements[5]),H.zoom=1)}this.getCamera=function(){return k},this.getFoveation=function(){if(!(h===null&&p===null))return l},this.setFoveation=function(H){l=H,h!==null&&(h.fixedFoveation=H),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=H)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(k)},this.getCameraTexture=function(H){return f[H]};let tt=null;function Ge(H,G){if(d=G.getViewerPose(c||o),g=G,d!==null){let ae=d.views;p!==null&&(e.setRenderTargetFramebuffer(v,p.framebuffer),e.setRenderTarget(v));let Te=!1;ae.length!==k.cameras.length&&(k.cameras.length=0,Te=!0);for(let se=0;se<ae.length;se++){let Ue=ae[se],Ye=null;if(p!==null)Ye=p.getViewport(Ue);else{let nt=u.getViewSubImage(h,Ue);Ye=nt.viewport,se===0&&(e.setRenderTargetTextures(v,nt.colorTexture,nt.depthStencilTexture),e.setRenderTarget(v))}let Ie=U[se];Ie===void 0&&(Ie=new zt,Ie.layers.enable(se),Ie.viewport=new lt,U[se]=Ie),Ie.matrix.fromArray(Ue.transform.matrix),Ie.matrix.decompose(Ie.position,Ie.quaternion,Ie.scale),Ie.projectionMatrix.fromArray(Ue.projectionMatrix),Ie.projectionMatrixInverse.copy(Ie.projectionMatrix).invert(),Ie.viewport.set(Ye.x,Ye.y,Ye.width,Ye.height),se===0&&(k.matrix.copy(Ie.matrix),k.matrix.decompose(k.position,k.quaternion,k.scale)),Te===!0&&k.cameras.push(Ie)}let fe=s.enabledFeatures;if(fe&&fe.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&b){u=n.getBinding();let se=u.getDepthInformation(ae[0]);se&&se.isValid&&se.texture&&m.init(se,s.renderState)}if(fe&&fe.includes("camera-access")&&b){e.state.unbindTexture(),u=n.getBinding();for(let se=0;se<ae.length;se++){let Ue=ae[se].camera;if(Ue){let Ye=f[Ue];Ye||(Ye=new br,f[Ue]=Ye);let Ie=u.getCameraImage(Ue);Ye.sourceTexture=Ie}}}}for(let ae=0;ae<w.length;ae++){let Te=S[ae],fe=w[ae];Te!==null&&fe!==void 0&&fe.update(Te,G,c||o)}tt&&tt(H,G),G.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:G}),g=null}let te=new Ld;te.setAnimationLoop(Ge),this.setAnimationLoop=function(H){tt=H},this.dispose=function(){}}},oy=new Be,Bd=new ze;Bd.set(-1,0,0,0,1,0,0,0,1);function ay(i,e){function t(m,f){m.matrixAutoUpdate===!0&&m.updateMatrix(),f.value.copy(m.matrix)}function n(m,f){f.color.getRGB(m.fogColor.value,vc(i)),f.isFog?(m.fogNear.value=f.near,m.fogFar.value=f.far):f.isFogExp2&&(m.fogDensity.value=f.density)}function s(m,f,y,T,v){f.isNodeMaterial?f.uniformsNeedUpdate=!1:f.isMeshBasicMaterial?r(m,f):f.isMeshLambertMaterial?(r(m,f),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)):f.isMeshToonMaterial?(r(m,f),u(m,f)):f.isMeshPhongMaterial?(r(m,f),d(m,f),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)):f.isMeshStandardMaterial?(r(m,f),h(m,f),f.isMeshPhysicalMaterial&&p(m,f,v)):f.isMeshMatcapMaterial?(r(m,f),g(m,f)):f.isMeshDepthMaterial?r(m,f):f.isMeshDistanceMaterial?(r(m,f),b(m,f)):f.isMeshNormalMaterial?r(m,f):f.isLineBasicMaterial?(o(m,f),f.isLineDashedMaterial&&a(m,f)):f.isPointsMaterial?l(m,f,y,T):f.isSpriteMaterial?c(m,f):f.isShadowMaterial?(m.color.value.copy(f.color),m.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function r(m,f){m.opacity.value=f.opacity,f.color&&m.diffuse.value.copy(f.color),f.emissive&&m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.bumpMap&&(m.bumpMap.value=f.bumpMap,t(f.bumpMap,m.bumpMapTransform),m.bumpScale.value=f.bumpScale,f.side===Yt&&(m.bumpScale.value*=-1)),f.normalMap&&(m.normalMap.value=f.normalMap,t(f.normalMap,m.normalMapTransform),m.normalScale.value.copy(f.normalScale),f.side===Yt&&m.normalScale.value.negate()),f.displacementMap&&(m.displacementMap.value=f.displacementMap,t(f.displacementMap,m.displacementMapTransform),m.displacementScale.value=f.displacementScale,m.displacementBias.value=f.displacementBias),f.emissiveMap&&(m.emissiveMap.value=f.emissiveMap,t(f.emissiveMap,m.emissiveMapTransform)),f.specularMap&&(m.specularMap.value=f.specularMap,t(f.specularMap,m.specularMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);let y=e.get(f),T=y.envMap,v=y.envMapRotation;T&&(m.envMap.value=T,m.envMapRotation.value.setFromMatrix4(oy.makeRotationFromEuler(v)).transpose(),T.isCubeTexture&&T.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Bd),m.reflectivity.value=f.reflectivity,m.ior.value=f.ior,m.refractionRatio.value=f.refractionRatio),f.lightMap&&(m.lightMap.value=f.lightMap,m.lightMapIntensity.value=f.lightMapIntensity,t(f.lightMap,m.lightMapTransform)),f.aoMap&&(m.aoMap.value=f.aoMap,m.aoMapIntensity.value=f.aoMapIntensity,t(f.aoMap,m.aoMapTransform))}function o(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform))}function a(m,f){m.dashSize.value=f.dashSize,m.totalSize.value=f.dashSize+f.gapSize,m.scale.value=f.scale}function l(m,f,y,T){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.size.value=f.size*y,m.scale.value=T*.5,f.map&&(m.map.value=f.map,t(f.map,m.uvTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function c(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.rotation.value=f.rotation,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function d(m,f){m.specular.value.copy(f.specular),m.shininess.value=Math.max(f.shininess,1e-4)}function u(m,f){f.gradientMap&&(m.gradientMap.value=f.gradientMap)}function h(m,f){m.metalness.value=f.metalness,f.metalnessMap&&(m.metalnessMap.value=f.metalnessMap,t(f.metalnessMap,m.metalnessMapTransform)),m.roughness.value=f.roughness,f.roughnessMap&&(m.roughnessMap.value=f.roughnessMap,t(f.roughnessMap,m.roughnessMapTransform)),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)}function p(m,f,y){m.ior.value=f.ior,f.sheen>0&&(m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),m.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(m.sheenColorMap.value=f.sheenColorMap,t(f.sheenColorMap,m.sheenColorMapTransform)),f.sheenRoughnessMap&&(m.sheenRoughnessMap.value=f.sheenRoughnessMap,t(f.sheenRoughnessMap,m.sheenRoughnessMapTransform))),f.clearcoat>0&&(m.clearcoat.value=f.clearcoat,m.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(m.clearcoatMap.value=f.clearcoatMap,t(f.clearcoatMap,m.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,t(f.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(m.clearcoatNormalMap.value=f.clearcoatNormalMap,t(f.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===Yt&&m.clearcoatNormalScale.value.negate())),f.dispersion>0&&(m.dispersion.value=f.dispersion),f.retroreflectivity>0&&(m.retroreflectivity.value=f.retroreflectivity),f.iridescence>0&&(m.iridescence.value=f.iridescence,m.iridescenceIOR.value=f.iridescenceIOR,m.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(m.iridescenceMap.value=f.iridescenceMap,t(f.iridescenceMap,m.iridescenceMapTransform)),f.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=f.iridescenceThicknessMap,t(f.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),f.transmission>0&&(m.transmission.value=f.transmission,m.transmissionSamplerMap.value=y.texture,m.transmissionSamplerSize.value.set(y.width,y.height),f.transmissionMap&&(m.transmissionMap.value=f.transmissionMap,t(f.transmissionMap,m.transmissionMapTransform)),m.thickness.value=f.thickness,f.thicknessMap&&(m.thicknessMap.value=f.thicknessMap,t(f.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=f.attenuationDistance,m.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(m.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(m.anisotropyMap.value=f.anisotropyMap,t(f.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=f.specularIntensity,m.specularColor.value.copy(f.specularColor),f.specularColorMap&&(m.specularColorMap.value=f.specularColorMap,t(f.specularColorMap,m.specularColorMapTransform)),f.specularIntensityMap&&(m.specularIntensityMap.value=f.specularIntensityMap,t(f.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,f){f.matcap&&(m.matcap.value=f.matcap)}function b(m,f){let y=e.get(f).light;m.referencePosition.value.setFromMatrixPosition(y.matrixWorld),m.nearDistance.value=y.shadow.camera.near,m.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function ly(i,e,t,n){let s={},r={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(v,w){let S=w.program;n.uniformBlockBinding(v,S)}function c(v,w){let S=s[v.id];S===void 0&&(m(v),S=d(v),s[v.id]=S,v.addEventListener("dispose",y));let E=w.program;n.updateUBOMapping(v,E);let _=e.render.frame;r[v.id]!==_&&(h(v),r[v.id]=_)}function d(v){let w=u();v.__bindingPointIndex=w;let S=i.createBuffer(),E=v.__size,_=v.usage;return i.bindBuffer(i.UNIFORM_BUFFER,S),i.bufferData(i.UNIFORM_BUFFER,E,_),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,w,S),S}function u(){for(let v=0;v<a;v++)if(o.indexOf(v)===-1)return o.push(v),v;return Fe("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(v){let w=s[v.id],S=v.uniforms,E=v.__cache;i.bindBuffer(i.UNIFORM_BUFFER,w);for(let _=0,A=S.length;_<A;_++){let R=S[_];if(Array.isArray(R))for(let P=0,U=R.length;P<U;P++)p(R[P],_,P,E);else p(R,_,0,E)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(v,w,S,E){if(b(v,w,S,E)===!0){let _=v.__offset,A=v.value;if(Array.isArray(A)){let R=0;for(let P=0;P<A.length;P++){let U=A[P],k=f(U);g(U,v.__data,R),typeof U!="number"&&typeof U!="boolean"&&!U.isMatrix3&&!ArrayBuffer.isView(U)&&(R+=k.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(A,v.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,_,v.__data)}}function g(v,w,S){typeof v=="number"||typeof v=="boolean"?w[0]=v:v.isMatrix3?(w[0]=v.elements[0],w[1]=v.elements[1],w[2]=v.elements[2],w[3]=0,w[4]=v.elements[3],w[5]=v.elements[4],w[6]=v.elements[5],w[7]=0,w[8]=v.elements[6],w[9]=v.elements[7],w[10]=v.elements[8],w[11]=0):ArrayBuffer.isView(v)?w.set(new v.constructor(v.buffer,v.byteOffset,w.length)):v.toArray(w,S)}function b(v,w,S,E){let _=v.value,A=w+"_"+S;if(E[A]===void 0)return typeof _=="number"||typeof _=="boolean"?E[A]=_:ArrayBuffer.isView(_)?E[A]=_.slice():E[A]=_.clone(),!0;{let R=E[A];if(typeof _=="number"||typeof _=="boolean"){if(R!==_)return E[A]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(R.equals(_)===!1)return R.copy(_),!0}}return!1}function m(v){let w=v.uniforms,S=0,E=16;for(let A=0,R=w.length;A<R;A++){let P=Array.isArray(w[A])?w[A]:[w[A]];for(let U=0,k=P.length;U<k;U++){let I=P[U],F=Array.isArray(I.value)?I.value:[I.value];for(let $=0,X=F.length;$<X;$++){let ne=F[$],q=f(ne),K=S%E,ee=K%q.boundary,be=K+ee;S+=ee,be!==0&&E-be<q.storage&&(S+=E-be),I.__data=new Float32Array(q.storage/Float32Array.BYTES_PER_ELEMENT),I.__offset=S,S+=q.storage}}}let _=S%E;return _>0&&(S+=E-_),v.__size=S,v.__cache={},this}function f(v){let w={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(w.boundary=4,w.storage=4):v.isVector2?(w.boundary=8,w.storage=8):v.isVector3||v.isColor?(w.boundary=16,w.storage=12):v.isVector4?(w.boundary=16,w.storage=16):v.isMatrix3?(w.boundary=48,w.storage=48):v.isMatrix4?(w.boundary=64,w.storage=64):v.isTexture?Le("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(v)?(w.boundary=16,w.storage=v.byteLength):Le("WebGLRenderer: Unsupported uniform value type.",v),w}function y(v){let w=v.target;w.removeEventListener("dispose",y);let S=o.indexOf(w.__bindingPointIndex);o.splice(S,1),i.deleteBuffer(s[w.id]),delete s[w.id],delete r[w.id]}function T(){for(let v in s)i.deleteBuffer(s[v]);o=[],s={},r={}}return{bind:l,update:c,dispose:T}}var cy=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Un=null;function hy(){return Un===null&&(Un=new _r(cy,16,16,xi,bn),Un.name="DFG_LUT",Un.minFilter=Tt,Un.magFilter=Tt,Un.wrapS=ln,Un.wrapT=ln,Un.generateMipmaps=!1,Un.needsUpdate=!0),Un}var qa=class{constructor(e={}){let{canvas:t=id(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:d="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:h=!1,outputBufferType:p=Kt}=e;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=o;let b=p,m=new Set([ha,ca,la]),f=new Set([Kt,vn,Vs,Hs,oa,aa]),y=new Uint32Array(4),T=new Int32Array(4),v=new O,w=null,S=null,E=[],_=[],A=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=yn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let R=this,P=!1,U=null,k=null,I=null,F=null;this._outputColorSpace=bt;let $=0,X=0,ne=null,q=-1,K=null,ee=new lt,be=new lt,Se=null,tt=new ke(0),Ge=0,te=t.width,H=t.height,G=1,ae=null,Te=null,fe=new lt(0,0,te,H),Ne=new lt(0,0,te,H),Ze=!1,se=new Ps,Ue=!1,Ye=!1,Ie=new Be,nt=new O,xt=new lt,Dt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},qe=!1;function it(){return ne===null?G:1}let L=n;function pt(M,N){return t.getContext(M,N)}let Qe,C,x,B,W,Z,re,le,J,Q,ce,Ce,pe,he,Re,De,He,D,ue,j,de,xe,ie;try{let M={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:d,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",dt,!1),t.addEventListener("webglcontextrestored",st,!1),t.addEventListener("webglcontextcreationerror",un,!1),L===null){let N="webgl2";if(L=pt(N,M),L===null)throw pt(N)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Pe()}catch(M){throw t.removeEventListener("webglcontextlost",dt,!1),t.removeEventListener("webglcontextrestored",st,!1),t.removeEventListener("webglcontextcreationerror",un,!1),Fe("WebGLRenderer: "+M.message),M}function Pe(){Qe=new __(L),Qe.init(),de=new iy(L,Qe),C=new a_(L,Qe,e,de),x=new ty(L,Qe),C.reversedDepthBuffer&&h&&x.buffers.depth.setReversed(!0),k=L.createFramebuffer(),I=L.createFramebuffer(),F=L.createFramebuffer(),B=new v_(L),W=new Vx,Z=new ny(L,Qe,x,W,C,de,B),re=new g_(R),le=new Sm(L),xe=new r_(L,le),J=new x_(L,le,B,xe),Q=new S_(L,J,le,xe,B),D=new b_(L,C,Z),Re=new l_(W),ce=new zx(R,re,Qe,C,xe,Re),Ce=new ay(R,W),pe=new Gx,he=new Zx(Qe),He=new s_(R,re,x,Q,g,l),De=new ey(R,Q,C),ie=new ly(L,B,C,x),ue=new o_(L,Qe,B),j=new y_(L,Qe,B),B.programs=ce.programs,R.capabilities=C,R.extensions=Qe,R.properties=W,R.renderLists=pe,R.shadowMap=De,R.state=x,R.info=B}b!==Kt&&(A=new w_(b,t.width,t.height,a,s,r));let Ae=new Bc(R,L);this.xr=Ae,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let M=Qe.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){let M=Qe.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return G},this.setPixelRatio=function(M){M!==void 0&&(G=M,this.setSize(te,H,!1))},this.getSize=function(M){return M.set(te,H)},this.setSize=function(M,N,Y=!0){if(Ae.isPresenting){Le("WebGLRenderer: Can't change size while VR device is presenting.");return}te=M,H=N,t.width=Math.floor(M*G),t.height=Math.floor(N*G),Y===!0&&(t.style.width=M+"px",t.style.height=N+"px"),A!==null&&A.setSize(t.width,t.height),this.setViewport(0,0,M,N)},this.getDrawingBufferSize=function(M){return M.set(te*G,H*G).floor()},this.setDrawingBufferSize=function(M,N,Y){te=M,H=N,G=Y,t.width=Math.floor(M*Y),t.height=Math.floor(N*Y),this.setViewport(0,0,M,N)},this.setEffects=function(M){if(b===Kt){Fe("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(M){for(let N=0;N<M.length;N++)if(M[N].isOutputPass===!0){Le("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}A.setEffects(M||[])},this.getCurrentViewport=function(M){return M.copy(ee)},this.getViewport=function(M){return M.copy(fe)},this.setViewport=function(M,N,Y,z){M.isVector4?fe.set(M.x,M.y,M.z,M.w):fe.set(M,N,Y,z),x.viewport(ee.copy(fe).multiplyScalar(G).round())},this.getScissor=function(M){return M.copy(Ne)},this.setScissor=function(M,N,Y,z){M.isVector4?Ne.set(M.x,M.y,M.z,M.w):Ne.set(M,N,Y,z),x.scissor(be.copy(Ne).multiplyScalar(G).round())},this.getScissorTest=function(){return Ze},this.setScissorTest=function(M){x.setScissorTest(Ze=M)},this.setOpaqueSort=function(M){ae=M},this.setTransparentSort=function(M){Te=M},this.getClearColor=function(M){return M.copy(He.getClearColor())},this.setClearColor=function(){He.setClearColor(...arguments)},this.getClearAlpha=function(){return He.getClearAlpha()},this.setClearAlpha=function(){He.setClearAlpha(...arguments)},this.clear=function(M=!0,N=!0,Y=!0){let z=0;if(M){let V=!1;if(ne!==null){let _e=ne.texture.format;V=m.has(_e)}if(V){let _e=ne.texture.type,ve=f.has(_e),ge=He.getClearColor(),Me=He.getClearAlpha(),Ee=ge.r,We=ge.g,Ke=ge.b;ve?(y[0]=Ee,y[1]=We,y[2]=Ke,y[3]=Me,L.clearBufferuiv(L.COLOR,0,y)):(T[0]=Ee,T[1]=We,T[2]=Ke,T[3]=Me,L.clearBufferiv(L.COLOR,0,T))}else z|=L.COLOR_BUFFER_BIT}N&&(z|=L.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Y&&(z|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),z!==0&&L.clear(z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(M){M.setRenderer(this),U=M},this.dispose=function(){t.removeEventListener("webglcontextlost",dt,!1),t.removeEventListener("webglcontextrestored",st,!1),t.removeEventListener("webglcontextcreationerror",un,!1),He.dispose(),pe.dispose(),he.dispose(),W.dispose(),re.dispose(),Q.dispose(),xe.dispose(),ie.dispose(),ce.dispose(),Ae.dispose(),Ae.removeEventListener("sessionstart",zh),Ae.removeEventListener("sessionend",Vh),Ai.stop()};function dt(M){M.preventDefault(),xc("WebGLRenderer: Context Lost."),P=!0}function st(){xc("WebGLRenderer: Context Restored."),P=!1;let M=B.autoReset,N=De.enabled,Y=De.autoUpdate,z=De.needsUpdate,V=De.type;Pe(),B.autoReset=M,De.enabled=N,De.autoUpdate=Y,De.needsUpdate=z,De.type=V}function un(M){Fe("WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function En(M){let N=M.target;N.removeEventListener("dispose",En),_p(N)}function _p(M){xp(M),W.remove(M)}function xp(M){let N=W.get(M).programs;N!==void 0&&(N.forEach(function(Y){ce.releaseProgram(Y)}),M.isShaderMaterial&&ce.releaseShaderCache(M))}this.renderBufferDirect=function(M,N,Y,z,V,_e){N===null&&(N=Dt);let ve=V.isMesh&&V.matrixWorld.determinantAffine()<0,ge=bp(M,N,Y,z,V);x.setMaterial(z,ve);let Me=Y.index,Ee=1;if(z.wireframe===!0){if(Me=J.getWireframeAttribute(Y),Me===void 0)return;Ee=2}let We=Y.drawRange,Ke=Y.attributes.position,we=We.start*Ee,rt=(We.start+We.count)*Ee;_e!==null&&(we=Math.max(we,_e.start*Ee),rt=Math.min(rt,(_e.start+_e.count)*Ee)),Me!==null?(we=Math.max(we,0),rt=Math.min(rt,Me.count)):Ke!=null&&(we=Math.max(we,0),rt=Math.min(rt,Ke.count));let St=rt-we;if(St<0||St===1/0)return;xe.setup(V,z,ge,Y,Me);let mt,ut=ue;if(Me!==null&&(mt=le.get(Me),ut=j,ut.setIndex(mt)),V.isMesh)z.wireframe===!0?(x.setLineWidth(z.wireframeLinewidth*it()),ut.setMode(L.LINES)):ut.setMode(L.TRIANGLES);else if(V.isLine){let Ft=z.linewidth;Ft===void 0&&(Ft=1),x.setLineWidth(Ft*it()),V.isLineSegments?ut.setMode(L.LINES):V.isLineLoop?ut.setMode(L.LINE_LOOP):ut.setMode(L.LINE_STRIP)}else V.isPoints?ut.setMode(L.POINTS):V.isSprite&&ut.setMode(L.TRIANGLES);if(V.isBatchedMesh)if(Qe.get("WEBGL_multi_draw"))ut.renderMultiDraw(V._multiDrawStarts,V._multiDrawCounts,V._multiDrawCount);else{let Ft=V._multiDrawStarts,ye=V._multiDrawCounts,Ht=V._multiDrawCount,et=Me?le.get(Me).bytesPerElement:1,on=W.get(z).currentProgram.getUniforms();for(let Cn=0;Cn<Ht;Cn++)on.setValue(L,"_gl_DrawID",Cn),ut.render(Ft[Cn]/et,ye[Cn])}else if(V.isInstancedMesh)ut.renderInstances(we,St,V.count);else if(Y.isInstancedBufferGeometry){let Ft=Y._maxInstanceCount!==void 0?Y._maxInstanceCount:1/0,ye=Math.min(Y.instanceCount,Ft);ut.renderInstances(we,St,ye)}else ut.render(we,St)};function kh(M,N,Y,z){U!==null&&M.isNodeMaterial&&U.setObject(z,M),Ue===!0&&Re.setState(M,Y,!1),M.transparent===!0&&M.side===Nt&&M.forceSinglePass===!1?(M.side=Yt,M.needsUpdate=!0,so(M,N,z),M.side=Ln,M.needsUpdate=!0,so(M,N,z),M.side=Nt):so(M,N,z)}this.compile=function(M,N,Y=null){Y===null&&(Y=M),U!==null&&U.renderStart(M,N,Y),S=he.get(Y),S.init(N),_.push(S),Y.traverseVisible(function(V){V.isLight&&V.layers.test(N.layers)&&(S.pushLight(V),V.castShadow&&S.pushShadow(V))}),M!==Y&&M.traverseVisible(function(V){V.isLight&&V.layers.test(N.layers)&&(S.pushLight(V),V.castShadow&&S.pushShadow(V))}),S.setupLights(),U!==null&&U.updateLights(S.state.lightsArray),Ye=this.localClippingEnabled,Ue=Re.init(this.clippingPlanes,Ye),Ue===!0&&Re.setGlobalState(this.clippingPlanes,N),U!==null&&De.render(S.state.shadowsArray,Y,N);let z=new Set;return M.traverse(function(V){if(!(V.isMesh||V.isPoints||V.isLine||V.isSprite))return;let _e=V.material;if(_e)if(Array.isArray(_e))for(let ve=0;ve<_e.length;ve++){let ge=_e[ve];kh(ge,Y,N,V),z.add(ge)}else kh(_e,Y,N,V),z.add(_e)}),S=_.pop(),U!==null&&U.renderEnd(),z},this.compileAsync=function(M,N,Y=null){let z=this.compile(M,N,Y);return new Promise(V=>{function _e(){if(z.forEach(function(ve){let Me=W.get(ve).currentProgram;(Me===void 0||Me.isReady())&&z.delete(ve)}),z.size===0){V(M);return}setTimeout(_e,10)}Qe.get("KHR_parallel_shader_compile")!==null?_e():setTimeout(_e,10)})};let _l=null;function yp(M){_l&&_l(M)}function zh(){Ai.stop()}function Vh(){Ai.start()}let Ai=new Ld;Ai.setAnimationLoop(yp),typeof self<"u"&&Ai.setContext(self),this.setAnimationLoop=function(M){_l=M,Ae.setAnimationLoop(M),M===null?Ai.stop():Ai.start()},Ae.addEventListener("sessionstart",zh),Ae.addEventListener("sessionend",Vh),this.render=function(M,N){if(N!==void 0&&N.isCamera!==!0){Fe("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(P===!0)return;U!==null&&U.renderStart(M,N);let Y=Ae.enabled===!0&&Ae.isPresenting===!0,z=A!==null&&(ne===null||Y)&&A.begin(R,ne);if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),Ae.enabled===!0&&Ae.isPresenting===!0&&(A===null||A.isCompositing()===!1)&&(Ae.cameraAutoUpdate===!0&&Ae.updateCamera(N),N=Ae.getCamera()),M.isScene===!0&&M.onBeforeRender(R,M,N,ne),S=he.get(M,_.length),S.init(N),S.state.textureUnits=Z.getTextureUnits(),_.push(S),Ie.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),se.setFromProjectionMatrix(Ie,mn,N.reversedDepth),Ye=this.localClippingEnabled,Ue=Re.init(this.clippingPlanes,Ye),w=pe.get(M,E.length),w.init(),E.push(w),Ae.enabled===!0&&Ae.isPresenting===!0){let ve=R.xr.getDepthSensingMesh();ve!==null&&xl(ve,N,-1/0,R.sortObjects)}xl(M,N,0,R.sortObjects),w.finish(),U!==null&&U.updateLights(S.state.lightsArray),R.sortObjects===!0&&w.sort(ae,Te),qe=Ae.enabled===!1||Ae.isPresenting===!1||Ae.hasDepthSensing()===!1,qe&&He.addToRenderList(w,M),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Ue===!0&&Re.beginShadows();let V=S.state.shadowsArray;if(De.render(V,M,N),Ue===!0&&Re.endShadows(),(z&&A.hasRenderPass())===!1){let ve=w.opaque,ge=w.transmissive;if(S.setupLights(),N.isArrayCamera){let Me=N.cameras;if(ge.length>0)for(let Ee=0,We=Me.length;Ee<We;Ee++){let Ke=Me[Ee];Gh(ve,ge,M,Ke)}qe&&He.render(M);for(let Ee=0,We=Me.length;Ee<We;Ee++){let Ke=Me[Ee];Hh(w,M,Ke,Ke.viewport)}}else ge.length>0&&Gh(ve,ge,M,N),qe&&He.render(M),Hh(w,M,N)}ne!==null&&X===0&&(Z.updateMultisampleRenderTarget(ne),Z.updateRenderTargetMipmap(ne)),z&&A.end(R),M.isScene===!0&&M.onAfterRender(R,M,N),xe.resetDefaultState(),q=-1,K=null,_.pop(),_.length>0?(S=_[_.length-1],Z.setTextureUnits(S.state.textureUnits),Ue===!0&&Re.setGlobalState(R.clippingPlanes,S.state.camera)):S=null,E.pop(),E.length>0?w=E[E.length-1]:w=null,U!==null&&U.renderEnd()};function xl(M,N,Y,z){if(M.visible===!1)return;if(M.layers.test(N.layers)){if(M.isGroup)Y=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(N);else if(M.isLightProbeGrid)S.pushLightProbeGrid(M);else if(M.isLight)S.pushLight(M),M.castShadow&&S.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||M.intersectsFrustum(se)){z&&xt.setFromMatrixPosition(M.matrixWorld).applyMatrix4(Ie);let ve=Q.update(M),ge=M.material;ge.visible&&w.push(M,ve,ge,Y,xt.z,null,N)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||M.intersectsFrustum(se))){let ve=Q.update(M),ge=M.material;if(z&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),xt.copy(M.boundingSphere.center)):(ve.boundingSphere===null&&ve.computeBoundingSphere(),xt.copy(ve.boundingSphere.center)),xt.applyMatrix4(M.matrixWorld).applyMatrix4(Ie)),Array.isArray(ge)){let Me=ve.groups;for(let Ee=0,We=Me.length;Ee<We;Ee++){let Ke=Me[Ee],we=ge[Ke.materialIndex];we&&we.visible&&w.push(M,ve,we,Y,xt.z,Ke,N)}}else ge.visible&&w.push(M,ve,ge,Y,xt.z,null,N)}}let _e=M.children;for(let ve=0,ge=_e.length;ve<ge;ve++)xl(_e[ve],N,Y,z)}function Hh(M,N,Y,z){let{opaque:V,transmissive:_e,transparent:ve}=M;S.setupLightsView(Y),Ue===!0&&Re.setGlobalState(R.clippingPlanes,Y),z&&x.viewport(ee.copy(z)),V.length>0&&io(V,N,Y),_e.length>0&&io(_e,N,Y),ve.length>0&&io(ve,N,Y),x.buffers.depth.setTest(!0),x.buffers.depth.setMask(!0),x.buffers.color.setMask(!0),x.setPolygonOffset(!1)}function Gh(M,N,Y,z){if((Y.isScene===!0?Y.overrideMaterial:null)!==null)return;if(S.state.transmissionRenderTarget[z.id]===void 0){let we=Qe.has("EXT_color_buffer_half_float")||Qe.has("EXT_color_buffer_float");S.state.transmissionRenderTarget[z.id]=new Zt(1,1,{generateMipmaps:!0,type:we?bn:Kt,minFilter:Dn,samples:Math.max(4,C.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:je.workingColorSpace})}let _e=S.state.transmissionRenderTarget[z.id],ve=z.viewport||ee;_e.setSize(ve.z*R.transmissionResolutionScale,ve.w*R.transmissionResolutionScale);let ge=R.getRenderTarget(),Me=R.getActiveCubeFace(),Ee=R.getActiveMipmapLevel();R.setRenderTarget(_e),R.getClearColor(tt),Ge=R.getClearAlpha(),Ge<1&&R.setClearColor(16777215,.5),R.clear(),qe&&He.render(Y);let We=R.toneMapping;R.toneMapping=yn;let Ke=z.viewport;if(z.viewport!==void 0&&(z.viewport=void 0),S.setupLightsView(z),Ue===!0&&Re.setGlobalState(R.clippingPlanes,z),io(M,Y,z),Z.updateMultisampleRenderTarget(_e),Z.updateRenderTargetMipmap(_e),Qe.has("WEBGL_multisampled_render_to_texture")===!1){let we=!1;for(let rt=0,St=N.length;rt<St;rt++){let mt=N[rt],{object:ut,geometry:Ft,material:ye,group:Ht}=mt;if(ye.side===Nt&&ut.layers.test(z.layers)){let et=ye.side;ye.side=Yt,ye.needsUpdate=!0,Wh(ut,Y,z,Ft,ye,Ht),ye.side=et,ye.needsUpdate=!0,we=!0}}we===!0&&(Z.updateMultisampleRenderTarget(_e),Z.updateRenderTargetMipmap(_e))}R.setRenderTarget(ge,Me,Ee),R.setClearColor(tt,Ge),Ke!==void 0&&(z.viewport=Ke),R.toneMapping=We}function io(M,N,Y){let z=N.isScene===!0?N.overrideMaterial:null;for(let V=0,_e=M.length;V<_e;V++){let ve=M[V],{object:ge,geometry:Me,group:Ee}=ve,We=ve.material;We.allowOverride===!0&&z!==null&&(We=z),ge.layers.test(Y.layers)&&Wh(ge,N,Y,Me,We,Ee)}}function Wh(M,N,Y,z,V,_e){U!==null&&V.isNodeMaterial&&U.setObject(M,V),M.onBeforeRender(R,N,Y,z,V,_e),M.modelViewMatrix.multiplyMatrices(Y.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),V.onBeforeRender(R,N,Y,z,M,_e),V.transparent===!0&&V.side===Nt&&V.forceSinglePass===!1?(V.side=Yt,V.needsUpdate=!0,R.renderBufferDirect(Y,N,z,V,M,_e),V.side=Ln,V.needsUpdate=!0,R.renderBufferDirect(Y,N,z,V,M,_e),V.side=Nt):R.renderBufferDirect(Y,N,z,V,M,_e),M.onAfterRender(R,N,Y,z,V,_e)}function so(M,N,Y){N.isScene!==!0&&(N=Dt);let z=W.get(M),V=S.state.lights,_e=S.state.shadowsArray,ve=V.state.version,ge=ce.getParameters(M,V.state,_e,N,Y,S.state.lightProbeGridArray),Me=ce.getProgramCacheKey(ge),Ee=z.programs;z.environment=M.isMeshStandardMaterial||M.isMeshLambertMaterial||M.isMeshPhongMaterial?N.environment:null,z.fog=N.fog;let We=M.isMeshStandardMaterial||M.isMeshLambertMaterial&&!M.envMap||M.isMeshPhongMaterial&&!M.envMap;z.envMap=re.get(M.envMap||z.environment,We),z.envMapRotation=z.environment!==null&&M.envMap===null?N.environmentRotation:M.envMapRotation,Ee===void 0&&(M.addEventListener("dispose",En),Ee=new Map,z.programs=Ee);let Ke=Ee.get(Me);if(Ke!==void 0){if(z.currentProgram===Ke&&z.lightsStateVersion===ve)return Yh(M,ge),Ke}else ge.uniforms=ce.getUniforms(M),U!==null&&M.isNodeMaterial&&U.build(M,Y,ge),M.onBeforeCompile(ge,R),Ke=ce.acquireProgram(ge,Me),Ee.set(Me,Ke),z.uniforms=ge.uniforms;let we=z.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(we.clippingPlanes=Re.uniform),Yh(M,ge),z.needsLights=Mp(M),z.lightsStateVersion=ve,z.needsLights&&(we.ambientLightColor.value=V.state.ambient,we.lightProbe.value=V.state.probe,we.sunLights.value=V.state.sun,we.sunLightShadows.value=V.state.sunShadow,we.directionalLights.value=V.state.directional,we.directionalLightShadows.value=V.state.directionalShadow,we.spotLights.value=V.state.spot,we.spotLightShadows.value=V.state.spotShadow,we.rectAreaLights.value=V.state.rectArea,we.ltc_1.value=V.state.rectAreaLTC1,we.ltc_2.value=V.state.rectAreaLTC2,we.pointLights.value=V.state.point,we.pointLightShadows.value=V.state.pointShadow,we.hemisphereLights.value=V.state.hemi,we.sunShadowMatrix.value=V.state.sunShadowMatrix,we.sunShadowCascade.value=V.state.sunShadowCascade,we.directionalShadowMatrix.value=V.state.directionalShadowMatrix,we.spotLightMatrix.value=V.state.spotLightMatrix,we.spotLightMap.value=V.state.spotLightMap,we.pointShadowMatrix.value=V.state.pointShadowMatrix),z.lightProbeGrid=S.state.lightProbeGridArray.length>0,z.currentProgram=Ke,z.uniformsList=null,Ke}function Xh(M){if(M.uniformsList===null){let N=M.currentProgram.getUniforms();M.uniformsList=Xs.seqWithValue(N.seq,M.uniforms)}return M.uniformsList}function Yh(M,N){let Y=W.get(M);Y.outputColorSpace=N.outputColorSpace,Y.batching=N.batching,Y.batchingColor=N.batchingColor,Y.instancing=N.instancing,Y.instancingColor=N.instancingColor,Y.instancingMorph=N.instancingMorph,Y.skinning=N.skinning,Y.morphTargets=N.morphTargets,Y.morphNormals=N.morphNormals,Y.morphColors=N.morphColors,Y.morphTargetsCount=N.morphTargetsCount,Y.numClippingPlanes=N.numClippingPlanes,Y.numIntersection=N.numClipIntersection,Y.vertexAlphas=N.vertexAlphas,Y.vertexTangents=N.vertexTangents,Y.toneMapping=N.toneMapping}function vp(M,N){if(M.length===0)return null;if(M.length===1)return M[0].texture!==null?M[0]:null;v.setFromMatrixPosition(N.matrixWorld);for(let Y=0,z=M.length;Y<z;Y++){let V=M[Y];if(V.texture!==null&&V.boundingBox.containsPoint(v))return V}return null}function bp(M,N,Y,z,V){N.isScene!==!0&&(N=Dt),Z.resetTextureUnits();let _e=N.fog,ve=z.isMeshStandardMaterial||z.isMeshLambertMaterial||z.isMeshPhongMaterial?N.environment:null,ge=ne===null?R.outputColorSpace:ne.isXRRenderTarget===!0?ne.texture.colorSpace:je.workingColorSpace,Me=z.isMeshStandardMaterial||z.isMeshLambertMaterial&&!z.envMap||z.isMeshPhongMaterial&&!z.envMap,Ee=re.get(z.envMap||ve,Me),We=z.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,Ke=!!Y.attributes.tangent&&(!!z.normalMap||z.anisotropy>0),we=!!Y.morphAttributes.position,rt=!!Y.morphAttributes.normal,St=!!Y.morphAttributes.color,mt=yn;z.toneMapped&&(ne===null||ne.isXRRenderTarget===!0)&&(mt=R.toneMapping);let ut=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,Ft=ut!==void 0?ut.length:0,ye=W.get(z),Ht=S.state.lights;if(Ue===!0&&(Ye===!0||M!==K)){let ft=M===K&&z.id===q;Re.setState(z,M,ft)}let et=!1;z.version===ye.__version?(ye.needsLights&&ye.lightsStateVersion!==Ht.state.version||ye.outputColorSpace!==ge||V.isBatchedMesh&&ye.batching===!1||!V.isBatchedMesh&&ye.batching===!0||V.isBatchedMesh&&ye.batchingColor===!0&&V._colorsTexture===null||V.isBatchedMesh&&ye.batchingColor===!1&&V._colorsTexture!==null||V.isInstancedMesh&&ye.instancing===!1||!V.isInstancedMesh&&ye.instancing===!0||V.isSkinnedMesh&&ye.skinning===!1||!V.isSkinnedMesh&&ye.skinning===!0||V.isInstancedMesh&&ye.instancingColor===!0&&V.instanceColor===null||V.isInstancedMesh&&ye.instancingColor===!1&&V.instanceColor!==null||V.isInstancedMesh&&ye.instancingMorph===!0&&V.morphTexture===null||V.isInstancedMesh&&ye.instancingMorph===!1&&V.morphTexture!==null||ye.envMap!==Ee||z.fog===!0&&ye.fog!==_e||ye.numClippingPlanes!==void 0&&(ye.numClippingPlanes!==Re.numPlanes||ye.numIntersection!==Re.numIntersection)||ye.vertexAlphas!==We||ye.vertexTangents!==Ke||ye.morphTargets!==we||ye.morphNormals!==rt||ye.morphColors!==St||ye.toneMapping!==mt||ye.morphTargetsCount!==Ft||!!ye.lightProbeGrid!=S.state.lightProbeGridArray.length>0)&&(et=!0):(et=!0,ye.__version=z.version);let on=ye.currentProgram;et===!0&&(on=so(z,N,V),U&&z.isNodeMaterial&&U.onUpdateProgram(z,on,ye));let Cn=!1,jn=!1,ns=!1,ht=on.getUniforms(),vt=ye.uniforms;if(x.useProgram(on.program)&&(Cn=!0,jn=!0,ns=!0),z.id!==q&&(q=z.id,jn=!0),ye.needsLights){let ft=vp(S.state.lightProbeGridArray,V);ye.lightProbeGrid!==ft&&(ye.lightProbeGrid=ft,jn=!0)}if(Cn||K!==M){x.buffers.depth.getReversed()&&M.reversedDepth!==!0&&(M._reversedDepth=!0,M.updateProjectionMatrix()),ht.setValue(L,"projectionMatrix",M.projectionMatrix),ht.setValue(L,"viewMatrix",M.matrixWorldInverse);let ei=ht.map.cameraPosition;ei!==void 0&&ei.setValue(L,nt.setFromMatrixPosition(M.matrixWorld)),C.logarithmicDepthBuffer&&ht.setValue(L,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(z.isMeshPhongMaterial||z.isMeshToonMaterial||z.isMeshLambertMaterial||z.isMeshBasicMaterial||z.isMeshStandardMaterial||z.isShaderMaterial)&&ht.setValue(L,"isOrthographic",M.isOrthographicCamera===!0),K!==M&&(K=M,jn=!0,ns=!0)}if(ye.needsLights&&(Ht.state.sunShadowMap.length>0&&ht.setValue(L,"sunShadowMap",Ht.state.sunShadowMap,Z),Ht.state.directionalShadowMap.length>0&&ht.setValue(L,"directionalShadowMap",Ht.state.directionalShadowMap,Z),Ht.state.spotShadowMap.length>0&&ht.setValue(L,"spotShadowMap",Ht.state.spotShadowMap,Z),Ht.state.pointShadowMap.length>0&&ht.setValue(L,"pointShadowMap",Ht.state.pointShadowMap,Z)),V.isSkinnedMesh){ht.setOptional(L,V,"bindMatrix"),ht.setOptional(L,V,"bindMatrixInverse");let ft=V.skeleton;ft&&(ft.boneTexture===null&&ft.computeBoneTexture(),ht.setValue(L,"boneTexture",ft.boneTexture,Z))}V.isBatchedMesh&&(ht.setOptional(L,V,"batchingTexture"),ht.setValue(L,"batchingTexture",V._matricesTexture,Z),ht.setOptional(L,V,"batchingIdTexture"),ht.setValue(L,"batchingIdTexture",V._indirectTexture,Z),ht.setOptional(L,V,"batchingColorTexture"),V._colorsTexture!==null&&ht.setValue(L,"batchingColorTexture",V._colorsTexture,Z));let Qn=Y.morphAttributes;if((Qn.position!==void 0||Qn.normal!==void 0||Qn.color!==void 0)&&D.update(V,Y,on),(jn||ye.receiveShadow!==V.receiveShadow)&&(ye.receiveShadow=V.receiveShadow,ht.setValue(L,"receiveShadow",V.receiveShadow)),(z.isMeshStandardMaterial||z.isMeshLambertMaterial||z.isMeshPhongMaterial)&&z.envMap===null&&N.environment!==null&&(vt.envMapIntensity.value=N.environmentIntensity),vt.dfgLUT!==void 0&&(vt.dfgLUT.value=hy()),jn){if(ht.setValue(L,"toneMappingExposure",R.toneMappingExposure),ye.needsLights&&Sp(vt,ns),_e&&z.fog===!0&&Ce.refreshFogUniforms(vt,_e),Ce.refreshMaterialUniforms(vt,z,G,H,S.state.transmissionRenderTarget[M.id]),ye.needsLights&&ye.lightProbeGrid){let ft=ye.lightProbeGrid;vt.probesSH.value=ft.texture,vt.probesMin.value.copy(ft.boundingBox.min),vt.probesMax.value.copy(ft.boundingBox.max),vt.probesResolution.value.copy(ft.resolution)}Xs.upload(L,Xh(ye),vt,Z)}if(z.isShaderMaterial&&z.uniformsNeedUpdate===!0&&(Xs.upload(L,Xh(ye),vt,Z),z.uniformsNeedUpdate=!1),z.isSpriteMaterial&&ht.setValue(L,"center",V.center),ht.setValue(L,"modelViewMatrix",V.modelViewMatrix),ht.setValue(L,"normalMatrix",V.normalMatrix),ht.setValue(L,"modelMatrix",V.matrixWorld),z.uniformsGroups!==void 0){let ft=z.uniformsGroups;for(let ei=0,is=ft.length;ei<is;ei++){let $h=ft[ei];ie.update($h,on),ie.bind($h,on)}}return on}function Sp(M,N){M.ambientLightColor.needsUpdate=N,M.lightProbe.needsUpdate=N,M.sunLights.needsUpdate=N,M.sunLightShadows.needsUpdate=N,M.directionalLights.needsUpdate=N,M.directionalLightShadows.needsUpdate=N,M.pointLights.needsUpdate=N,M.pointLightShadows.needsUpdate=N,M.spotLights.needsUpdate=N,M.spotLightShadows.needsUpdate=N,M.rectAreaLights.needsUpdate=N,M.hemisphereLights.needsUpdate=N}function Mp(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return $},this.getActiveMipmapLevel=function(){return X},this.getRenderTarget=function(){return ne},this.setRenderTargetTextures=function(M,N,Y){let z=W.get(M);z.__autoAllocateDepthBuffer=M.resolveDepthBuffer===!1,z.__autoAllocateDepthBuffer===!1&&(z.__useRenderToTexture=!1),W.get(M.texture).__webglTexture=N,W.get(M.depthTexture).__webglTexture=z.__autoAllocateDepthBuffer?void 0:Y,z.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(M,N){let Y=W.get(M);Y.__webglFramebuffer=N,Y.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(M,N=0,Y=0){ne=M,$=N,X=Y;let z=null,V=!1,_e=!1;if(M){let ge=W.get(M);if(ge.__useDefaultFramebuffer!==void 0){x.bindFramebuffer(L.FRAMEBUFFER,ge.__webglFramebuffer),ee.copy(M.viewport),be.copy(M.scissor),Se=M.scissorTest,x.viewport(ee),x.scissor(be),x.setScissorTest(Se),q=-1;return}else if(ge.__webglFramebuffer===void 0)Z.setupRenderTarget(M);else if(ge.__hasExternalTextures)Z.rebindTextures(M,W.get(M.texture).__webglTexture,W.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){let We=M.depthTexture;if(ge.__boundDepthTexture!==We){if(We!==null&&W.has(We)&&(M.width!==We.image.width||M.height!==We.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Z.setupDepthRenderbuffer(M)}}let Me=M.texture;(Me.isData3DTexture||Me.isDataArrayTexture||Me.isCompressedArrayTexture)&&(_e=!0);let Ee=W.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(Ee[N])?z=Ee[N][Y]:z=Ee[N],V=!0):M.samples>0&&Z.useMultisampledRTT(M)===!1?z=W.get(M).__webglMultisampledFramebuffer:Array.isArray(Ee)?z=Ee[Y]:z=Ee,ee.copy(M.viewport),be.copy(M.scissor),Se=M.scissorTest}else ee.copy(fe).multiplyScalar(G).floor(),be.copy(Ne).multiplyScalar(G).floor(),Se=Ze;if(Y!==0&&(z=k),x.bindFramebuffer(L.FRAMEBUFFER,z)&&x.drawBuffers(M,z),x.viewport(ee),x.scissor(be),x.setScissorTest(Se),V){let ge=W.get(M.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+N,ge.__webglTexture,Y)}else if(_e){let ge=N;for(let Me=0;Me<M.textures.length;Me++){let Ee=W.get(M.textures[Me]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+Me,Ee.__webglTexture,Y,ge)}}else if(M!==null&&Y!==0){let ge=W.get(M.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,ge.__webglTexture,Y)}q=-1};function qh(M){let N=W.get(M);return(N.__readFormat!==M.format||N.__readType!==M.type)&&(N.__readFormat=M.format,N.__readType=M.type,N.__formatReadable=C.textureFormatReadable(M.format),N.__typeReadable=C.textureTypeReadable(M.type)),N}this.readRenderTargetPixels=function(M,N,Y,z,V,_e,ve,ge=0){if(!(M&&M.isWebGLRenderTarget)){Fe("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Me=W.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&ve!==void 0&&(Me=Me[ve]),Me){x.bindFramebuffer(L.FRAMEBUFFER,Me);try{let Ee=M.textures[ge],We=Ee.format,Ke=Ee.type;M.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+ge);let we=qh(Ee);if(we.__formatReadable===!1){Fe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(we.__typeReadable===!1){Fe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=M.width-z&&Y>=0&&Y<=M.height-V&&L.readPixels(N,Y,z,V,de.convert(We),de.convert(Ke),_e)}finally{let Ee=ne!==null?W.get(ne).__webglFramebuffer:null;x.bindFramebuffer(L.FRAMEBUFFER,Ee)}}},this.readRenderTargetPixelsAsync=async function(M,N,Y,z,V,_e,ve,ge=0){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Me=W.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&ve!==void 0&&(Me=Me[ve]),Me)if(N>=0&&N<=M.width-z&&Y>=0&&Y<=M.height-V){x.bindFramebuffer(L.FRAMEBUFFER,Me);let Ee=M.textures[ge],We=Ee.format,Ke=Ee.type;M.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+ge);let we=qh(Ee);if(we.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(we.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let rt=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,rt),L.bufferData(L.PIXEL_PACK_BUFFER,_e.byteLength,L.STREAM_READ),L.readPixels(N,Y,z,V,de.convert(We),de.convert(Ke),0),L.bindBuffer(L.PIXEL_PACK_BUFFER,null);let St=ne!==null?W.get(ne).__webglFramebuffer:null;x.bindFramebuffer(L.FRAMEBUFFER,St);let mt=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await rd(L,mt,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,rt),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,_e),L.bindBuffer(L.PIXEL_PACK_BUFFER,null),L.deleteBuffer(rt),L.deleteSync(mt),_e}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(M,N=null,Y=0){let z=Math.pow(2,-Y),V=Math.floor(M.image.width*z),_e=Math.floor(M.image.height*z),ve=N!==null?N.x:0,ge=N!==null?N.y:0;Z.setTexture2D(M,0),L.copyTexSubImage2D(L.TEXTURE_2D,Y,0,0,ve,ge,V,_e),x.unbindTexture()},this.copyTextureToTexture=function(M,N,Y=null,z=null,V=0,_e=0){let ve,ge,Me,Ee,We,Ke,we,rt,St,mt=M.isCompressedTexture?M.mipmaps[_e]:M.image;if(Y!==null)ve=Y.max.x-Y.min.x,ge=Y.max.y-Y.min.y,Me=Y.isBox3?Y.max.z-Y.min.z:1,Ee=Y.min.x,We=Y.min.y,Ke=Y.isBox3?Y.min.z:0;else{let vt=Math.pow(2,-V);ve=Math.floor(mt.width*vt),ge=Math.floor(mt.height*vt),M.isDataArrayTexture?Me=mt.depth:M.isData3DTexture?Me=Math.floor(mt.depth*vt):Me=1,Ee=0,We=0,Ke=0}z!==null?(we=z.x,rt=z.y,St=z.z):(we=0,rt=0,St=0);let ut=de.convert(N.format),Ft=de.convert(N.type),ye;N.isData3DTexture?(Z.setTexture3D(N,0),ye=L.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(Z.setTexture2DArray(N,0),ye=L.TEXTURE_2D_ARRAY):(Z.setTexture2D(N,0),ye=L.TEXTURE_2D),x.activeTexture(L.TEXTURE0),x.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,N.flipY),x.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),x.pixelStorei(L.UNPACK_ALIGNMENT,N.unpackAlignment);let Ht=x.getParameter(L.UNPACK_ROW_LENGTH),et=x.getParameter(L.UNPACK_IMAGE_HEIGHT),on=x.getParameter(L.UNPACK_SKIP_PIXELS),Cn=x.getParameter(L.UNPACK_SKIP_ROWS),jn=x.getParameter(L.UNPACK_SKIP_IMAGES);x.pixelStorei(L.UNPACK_ROW_LENGTH,mt.width),x.pixelStorei(L.UNPACK_IMAGE_HEIGHT,mt.height),x.pixelStorei(L.UNPACK_SKIP_PIXELS,Ee),x.pixelStorei(L.UNPACK_SKIP_ROWS,We),x.pixelStorei(L.UNPACK_SKIP_IMAGES,Ke);let ns=M.isDataArrayTexture||M.isData3DTexture,ht=N.isDataArrayTexture||N.isData3DTexture;if(M.isDepthTexture){let vt=W.get(M),Qn=W.get(N),ft=W.get(vt.__renderTarget),ei=W.get(Qn.__renderTarget);x.bindFramebuffer(L.READ_FRAMEBUFFER,ft.__webglFramebuffer),x.bindFramebuffer(L.DRAW_FRAMEBUFFER,ei.__webglFramebuffer);for(let is=0;is<Me;is++)ns&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,W.get(M).__webglTexture,V,Ke+is),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,W.get(N).__webglTexture,_e,St+is)),L.blitFramebuffer(Ee,We,ve,ge,we,rt,ve,ge,L.DEPTH_BUFFER_BIT,L.NEAREST);x.bindFramebuffer(L.READ_FRAMEBUFFER,null),x.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(V!==0||M.isRenderTargetTexture||W.has(M)){let vt=W.get(M),Qn=W.get(N);x.bindFramebuffer(L.READ_FRAMEBUFFER,I),x.bindFramebuffer(L.DRAW_FRAMEBUFFER,F);for(let ft=0;ft<Me;ft++)ns?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,vt.__webglTexture,V,Ke+ft):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,vt.__webglTexture,V),ht?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Qn.__webglTexture,_e,St+ft):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Qn.__webglTexture,_e),V!==0?L.blitFramebuffer(Ee,We,ve,ge,we,rt,ve,ge,L.COLOR_BUFFER_BIT,L.NEAREST):ht?L.copyTexSubImage3D(ye,_e,we,rt,St+ft,Ee,We,ve,ge):L.copyTexSubImage2D(ye,_e,we,rt,Ee,We,ve,ge);x.bindFramebuffer(L.READ_FRAMEBUFFER,null),x.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else ht?M.isDataTexture||M.isData3DTexture?L.texSubImage3D(ye,_e,we,rt,St,ve,ge,Me,ut,Ft,mt.data):N.isCompressedArrayTexture?L.compressedTexSubImage3D(ye,_e,we,rt,St,ve,ge,Me,ut,mt.data):L.texSubImage3D(ye,_e,we,rt,St,ve,ge,Me,ut,Ft,mt):M.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,_e,we,rt,ve,ge,ut,Ft,mt.data):M.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,_e,we,rt,mt.width,mt.height,ut,mt.data):L.texSubImage2D(L.TEXTURE_2D,_e,we,rt,ve,ge,ut,Ft,mt);x.pixelStorei(L.UNPACK_ROW_LENGTH,Ht),x.pixelStorei(L.UNPACK_IMAGE_HEIGHT,et),x.pixelStorei(L.UNPACK_SKIP_PIXELS,on),x.pixelStorei(L.UNPACK_SKIP_ROWS,Cn),x.pixelStorei(L.UNPACK_SKIP_IMAGES,jn),_e===0&&N.generateMipmaps&&L.generateMipmap(ye),x.unbindTexture()},this.initRenderTarget=function(M){W.get(M).__webglFramebuffer===void 0&&Z.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?Z.setTextureCube(M,0):M.isData3DTexture?Z.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?Z.setTexture2DArray(M,0):Z.setTexture2D(M,0),x.unbindTexture()},this.resetState=function(){$=0,X=0,ne=null,x.reset(),xe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return mn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=je._getDrawingBufferColorSpace(e),t.unpackColorSpace=je._getUnpackColorSpace()}};var uy=[137,80,78,71,13,10,26,10],kd=i=>typeof i=="string"?Uint8Array.from(atob(i),e=>e.charCodeAt(0)):i;function zd(i,e){let t=kd(e);return new i(t.buffer,t.byteOffset,t.byteLength/i.BYTES_PER_ELEMENT)}function dy(i,e,t){let n=i.length/e,s=new Uint8Array(i.length),r={1:Uint8Array,2:Uint16Array,4:Uint32Array}[e],o=new r(n),a=new Uint8Array(o.buffer);for(let d=0;d<e;d++)for(let u=0;u<n;u++)a[u*e+d]=i[d*n+u];for(let d=1;d<n;d++)o[d]+=o[d-1];let l=n/t,c=new r(s.buffer);for(let d=0;d<t;d++)for(let u=0;u<l;u++)c[u*t+d]=o[d*l+u];return s}async function fy(i){let e=new Uint8Array(i);if(!uy.every((u,h)=>e[h]===u))return JSON.parse(new TextDecoder().decode(e));let t=new DataView(e.buffer,e.byteOffset,e.byteLength),n=[],s=0;for(let u=8;u+8<=e.length;){let h=t.getUint32(u),p=String.fromCharCode(...e.subarray(u+4,u+8));if(p==="IHDR"&&(s=t.getUint32(u+8)),p==="IDAT"&&n.push(e.subarray(u+8,u+8+h)),p==="IEND")break;u+=12+h}let r=new Blob(n).stream().pipeThrough(new DecompressionStream("deflate")),o=new Uint8Array(await new Response(r).arrayBuffer()),a=o.length/(s+1),l=new Uint8Array(a*s);for(let u=0;u<a;u++){if(o[u*(s+1)]!==0)throw new Error("A packed kit file has a filtered row");l.set(o.subarray(u*(s+1)+1,(u+1)*(s+1)),u*s)}let c=new DataView(l.buffer).getUint32(0,!0),d=(u,h)=>{let p=h?.["@"];if(!Array.isArray(p))return h;let[g,b,m,f]=p,y=l.slice(g,g+b);return f?dy(y,m,f):y};return JSON.parse(new TextDecoder().decode(l.subarray(4,4+c)),d)}var py=new Oi;function Vd(i){let e=URL.createObjectURL(new Blob([kd(i)],{type:"image/webp"})),t=()=>URL.revokeObjectURL(e);return py.load(e,t,void 0,t)}async function Hd(i,e=i){let t=await fetch(i);if(!t.ok)throw new Error(`GET ${e} → ${t.status}`);return fy(await t.arrayBuffer())}var Jt="3d-avatar-maker",Gd=`/api/capability-packages/${Jt}/assets/kit/`,zc="";function Wd(i,e=""){Gd=i.endsWith("/")?i:`${i}/`,zc=e}var my=i=>i.startsWith("avatar-outfit")?"wardrobe":"avatar",ja=i=>`${Gd}${my(i)}/${i}${zc?`?v=${encodeURIComponent(zc)}`:""}`,Ka=new Map,Ja=new Map,gy=new Oi,Hr=i=>Vc(ja(i),i);function Vc(i,e=i){if(!Ka.has(i)){let t=Hd(i,e);t.catch(()=>Ka.delete(i)),Ka.set(i,t)}return Ka.get(i)}function Gr(i,e=null){if(!Ja.has(i)){let t=e?.find(s=>s.name===i)?.webp,n=t?Vd(t):gy.load(ja(`${i}.webp`));n.flipY=!1,n.colorSpace=bt,n.name=i,n.userData.shared=!0,Ja.set(i,n)}return Ja.get(i)}function Xd(){return Promise.all([...Ja.values()].map(i=>new Promise(e=>{let t=n=>{i.image?.complete!==!1&&(i.image?.width||n<=0)?e():setTimeout(()=>t(n-1),50)};t(200)})))}var Mn=zd;function Hc(i){let e=Mn(Int16Array,i.position),t=new Float32Array(e.length);for(let l=0;l<e.length;l++){let c=l%3,d=i.box[c],u=i.box[c+3]-d;t[l]=d+(e[l]+32768)/65535*u}let n=Float32Array.from(Mn(Int8Array,i.normal),l=>l/127),s=i.uv?Float32Array.from(Mn(Uint16Array,i.uv),l=>l/65535):null,r=new At;r.setAttribute("position",new Ve(t,3)),r.setAttribute("normal",new Ve(n,3)),s&&r.setAttribute("uv",new Ve(s,2)),r.setAttribute("skinIndex",new Yn(Uint16Array.from(Mn(Uint8Array,i.joints)),4));let o=Float32Array.from(Mn(Uint8Array,i.weights));for(let l=0;l<o.length;l+=4){let c=o[l]+o[l+1]+o[l+2]+o[l+3]||1;for(let d=0;d<4;d++)o[l+d]/=c}r.setAttribute("skinWeight",new Ve(o,4));let a=i.wide?Uint32Array:Uint16Array;return r.setIndex(new Ve(Mn(a,i.index),1)),r.computeBoundingBox(),r.computeBoundingSphere(),r}function Yd(i){let e=new gn,t=new Map,n=i.skeleton.names.map(s=>{let r=i.joints.indexOf(s);return new Be().fromArray(i.inverseBind,r*16).invert()});return i.skeleton.names.forEach((s,r)=>{let o=new Is;o.name=s;let a=i.skeleton.parents[r];(a>=0?n[a].clone().invert().multiply(n[r]):n[r].clone()).decompose(o.position,o.quaternion,o.scale),t.set(s,o)}),i.skeleton.names.forEach((s,r)=>{let o=i.skeleton.parents[r];(o>=0?t.get(i.skeleton.names[o]):e).add(t.get(s))}),e.updateMatrixWorld(!0),{root:e,bones:t}}function qd(i,e,t,n=null,s=null,r=null){let o=t.joints.map(l=>e.get(l)??i),a=t.joints.map((l,c)=>{let d=t.inverseBind?new Be().fromArray(t.inverseBind,c*16):new Be().fromArray(s.inverseBind,Math.max(0,s.joints.indexOf(l))*16),u=r?.get(l);u&&d.multiply(u);let h=n?.get(l);return h?d.premultiply(h):d});return new xr(o,a)}var wn={hips:"pelvis",spine:"spine_01",chest:"spine_02",upperChest:"spine_03",neck:"neck_01",head:"Head",leftShoulder:"clavicle_l",leftUpperArm:"upperarm_l",leftLowerArm:"lowerarm_l",leftHand:"hand_l",rightShoulder:"clavicle_r",rightUpperArm:"upperarm_r",rightLowerArm:"lowerarm_r",rightHand:"hand_r",leftUpperLeg:"thigh_l",leftLowerLeg:"calf_l",leftFoot:"foot_l",leftToes:"ball_l",rightUpperLeg:"thigh_r",rightLowerLeg:"calf_r",rightFoot:"foot_r",rightToes:"ball_r"};for(let[i,e]of[["left","l"],["right","r"]]){for(let[t,n]of[["Index","index"],["Middle","middle"],["Ring","ring"],["Little","pinky"]])wn[`${i}${t}Proximal`]=`${n}_01_${e}`,wn[`${i}${t}Intermediate`]=`${n}_02_${e}`,wn[`${i}${t}Distal`]=`${n}_03_${e}`;wn[`${i}ThumbMetacarpal`]=`thumb_01_${e}`,wn[`${i}ThumbProximal`]=`thumb_02_${e}`,wn[`${i}ThumbDistal`]=`thumb_03_${e}`}function $d(i,e="auto",t={},n=Math.random){return t.body==="male"||t.body==="female"?{sex:t.body}:e==="male"||e==="female"?{sex:e}:{sex:n()<.5?"male":"female"}}var Gc=new O,_y=new O,Zd=new Lt,Qa=new Lt;function qs(i,e,t){if(!i||!e)return;let n=e.getWorldPosition(Gc).sub(i.getWorldPosition(_y));n.lengthSq()!==0&&(Zd.setFromUnitVectors(n.normalize(),t),Qa.identity(),i.parent?.getWorldQuaternion(Qa),i.quaternion.premultiply(Qa).premultiply(Zd).premultiply(Qa.invert()),i.updateMatrixWorld(!0))}function Kd(i,e,t=1){let n=new gn;n.add(i),i.scale.setScalar(t),i.updateMatrixWorld(!0);let s=i.children.filter(c=>c.isSkinnedMesh),r=new xn().setFromObject(i).min.y,o=e.get(wn.hips)?.getWorldPosition(Gc)??Gc.set(0,0,0);i.position.set(-o.x,Number.isFinite(r)?-r:0,-o.z),i.updateMatrixWorld(!0);let a={};for(let[c,d]of Object.entries(wn))e.has(d)&&(a[c]=e.get(d));let l=new Map([...e].map(([c,d])=>[c,d.quaternion.clone()]));return{object:n,root:i,bones:e,meshes:s,humanoid:a,rest:l}}function el(i){Wi(i);let e=i.humanoid;for(let[t,n]of[["left",1],["right",-1]]){let s=new O(n,0,0);qs(e[`${t}UpperArm`],e[`${t}LowerArm`],s),qs(e[`${t}LowerArm`],e[`${t}Hand`],s);for(let r of["Index","Middle","Ring","Little"])qs(e[`${t}${r}Proximal`],e[`${t}${r}Intermediate`],s),qs(e[`${t}${r}Intermediate`],e[`${t}${r}Distal`],s)}i.root.updateMatrixWorld(!0)}function Wi(i){for(let[e,t]of i.bones)t.quaternion.copy(i.rest.get(e));i.root.updateMatrixWorld(!0)}function Jd(i,e=0){Wi(i);let t=i.humanoid,n=new O;for(let[o,a]of[["left",1],["right",-1]])n.set(a*.3,-1,.03).normalize(),qs(t[`${o}UpperArm`],t[`${o}LowerArm`],n),n.set(a*.22,-1,.12).normalize(),qs(t[`${o}LowerArm`],t[`${o}Hand`],n);let s=Math.sin(e*1.6)*.012,r=Math.sin(e*.55)*.012;t.chest&&t.chest.rotateX(-s),t.spine&&t.spine.rotateZ(r),t.head&&t.head.rotateZ(-r*.6),i.root.updateMatrixWorld(!0)}var Wc={peasant:{label:"Townsfolk",colours:[["clothes-a","Cream"],["clothes-b","Olive"],["clothes-blue","Blue"],["clothes-red","Rose"],["clothes-teal","Green"],["clothes-plum","Plum"],["clothes-grey","Grey"]]},ranger:{label:"Ranger",colours:[["ranger-a","Forest"],["ranger-b","Tan"],["ranger-wine","Violet"],["ranger-dusk","Dusk blue"],["ranger-rust","Rust"],["ranger-moss","Moss"],["ranger-grey","Grey"]]}},gt="none",xy=[...Object.keys(Wc),gt],yy={peasant:"colour",ranger:"rangerColour"},jd=[["top","Top"],["arms","Sleeves"],["legs","Legs"],["feet","Boots"]],Qd=[["hood","Hood","ranger"],["pauldrons","Pauldrons","ranger"]];var Zs=[["shaved","Shaved close"],["crop","Cropped"],["short","Short"],["mohawk","Mohawk"],["slicked","Slicked back"],["fringe","Short with a fringe"],["parted","Side-parted"],["curly","Curly"],["afro","Afro"],["bob","Bob"],["bob_angled","Angled bob"],["buns","Two buns"],["long","Long"],["ponytail","Ponytail"],["braid","Braid"],["none","None (bald)"]];var vy={buzzed:"short",buzzedfemale:"short",cropped:"short",simpleparted:"parted"},Yc={male:["short","parted","long","parted","crop","slicked","fringe","curly"],female:["buns","long","parted","short","ponytail","braid","bob","bob_angled"]},$i=[[2825492,"Dark brown"],[4861724,"Brown"],[8014374,"Chestnut"],[11569232,"Dark blond"],[14731408,"Blond"],[1710618,"Black"],[9187102,"Red"],[12369084,"Grey"],[15921906,"White"],[4878248,"Blue"],[8014490,"Violet"],[4164186,"Green"],[13658764,"Pink"]],ef=8,$n=[[15981003,"Pale"],[15581360,"Rosy"],[15254440,"Fair"],[14264714,"Light"],[14199152,"Golden"],[12618338,"Tan"],[11569498,"Olive"],[10841155,"Bronze"],[9263674,"Brown"],[7357226,"Deep brown"],[6044198,"Dark"],[4007450,"Ebony"]],by=[0,2,3,5,8,10],yi=[.55,1.15],$s=i=>Number.isInteger(i)&&i>=0&&i<=16777215,Xi=i=>!!i&&typeof i=="object"&&!Array.isArray(i),Sy=["vrm","glb-fbx","mmd","builtin"];function Zi(i){if(!i||typeof i!="object"||Array.isArray(i))return{};let e={};(u=>Object.hasOwn(Wc,u))(i.outfit)&&(e.outfit=i.outfit);for(let[u]of jd)xy.includes(i[u])&&(e[u]=i[u]);for(let[u]of Qd)typeof i[u]=="boolean"&&(e[u]=i[u]);for(let[u,h]of Object.entries(yy)){let p=Wc[u].colours.map(([b])=>b),g=[i[h],i.colour].find(b=>p.includes(b));g&&(e[h]=g)}let n={};for(let[u]of[...jd,...Qd]){let h=Xi(i.tints)&&$s(i.tints[u])?i.tints[u]:i.tint;$s(h)&&(n[u]=h)}Object.keys(n).length&&(e.tints=n);let s=vy[i.hair]??i.hair;Zs.some(([u])=>u===s)&&(e.hair=s);let r=(u,h)=>Number.isInteger(u)&&u>=0&&u<h;r(i.hairColour,$i.length)&&(e.hairColour=i.hairColour),$s(i.hairTint)&&(e.hairTint=i.hairTint);let o=i.skinSet===2?i.skin:by[i.skin];r(o,$n.length)&&Object.assign(e,{skin:o,skinSet:2}),$s(i.skinTint)&&(e.skinTint=i.skinTint),[...tl,...Xr].some(([u])=>u===i.skin)&&(e.skin=i.skin),nh.some(([u])=>u===i.age)&&(e.age=i.age);for(let[u,h]of[["brows",Ty],["lashes",Ay]])Number.isFinite(i[u])&&(e[u]=Math.max(1,Math.min(h,Math.round(i[u]))));(i.eyePicture===Fn||Yr.some(([u])=>u===i.eyePicture))&&(e.eyePicture=i.eyePicture),ll.some(([u])=>u===i.nails)&&(e.nails=i.nails),typeof i.toenails=="boolean"&&(e.toenails=i.toenails),typeof i.beard=="boolean"&&(e.beard=i.beard),(i.figure==="male"||i.figure==="female")&&(e.figure=i.figure),Number.isFinite(i.height)&&(e.height=Math.max(yi[0],Math.min(yi[1],Number(i.height)))),Sy.includes(i.avatar)&&(e.avatar=i.avatar),il.some(([u])=>u===i.body)&&(e.body=i.body),qc.some(([u])=>u===i.species)&&(e.species=i.species),typeof i.wings=="boolean"&&(e.wings=i.wings),Tn.some(([u])=>u===i.race)&&(e.race=i.race);for(let[u,h]of Ks)h.some(([p])=>p===i[u])&&(e[u]=i[u]);typeof i.tail=="boolean"&&(e.tail=i.tail);for(let[u,h]of[["shape",[...Ki,...bi,...An,...Si,...vi,...Wr]],["limbs",js]]){let p={};for(let[g,,b,m]of h){let f=Xi(i[u])?i[u][g]:void 0,y=eh[g]?.[0]?-1:b;Number.isFinite(f)&&(p[g]=Math.round(Math.max(y,Math.min(m,f))*1e3)/1e3)}Object.keys(p).length&&(e[u]=p)}let a={};for(let[u]of[...ih,...Py,...Object.values(Ly).flat()])Xi(i.colours)&&$s(i.colours[u])&&(a[u]=i.colours[u]);Object.keys(a).length&&(e.colours=a);let l={};for(let[u,h]of[["top",Kr],["bottom",Jr]]){let p=Xi(i.underwear)?i.underwear[u]:void 0;(p===gt||h.some(([g])=>g===p))&&(l[u]=p)}if(Object.keys(l).length&&(e.underwear=l),Array.isArray(i.clothes)){let u=new Map;for(let h of i.clothes)Object.hasOwn($t,h)&&!u.has($t[h])&&u.set($t[h],h);e.clothes=[...u.values()]}let c={};for(let[u,h]of Object.entries(Xi(i.clothColours)?i.clothColours:{})){if(!Object.hasOwn($t,u)||!Xi(h))continue;let p={};for(let[g]of er)$s(h[g])&&(p[g]=h[g]);Object.keys(p).length&&(c[u]=p)}Object.keys(c).length&&(e.clothColours=c);let d={};for(let[u,h]of Object.entries(Xi(i.variants)?i.variants:{}))h&&oh[u]?.ways.some(([p])=>p===h)&&(d[u]=h);return Object.keys(d).length&&(e.variants=d),typeof i.preset=="string"&&i.preset.trim()&&(e.preset=i.preset.trim().slice(0,Dy)),e}var il=[["male","Male body"],["female","Female body"]],qc=[["human","Human"],["wolf","Anthro wolf"],["dragon","Anthro dragon"]],tf={wolf:{head:1.18}},Tn=[["human","Human"],["dwarf","Dwarf","race_dwarf",1,{height:.87,legs:.7,arms:.8,head:1.18}],["halfling","Halfling","race_halfling",1,{height:.58,legs:.86,arms:.9,head:1.2}],["gnome","Gnome","race_gnome",1,{height:.62,legs:.85,arms:.98,head:1.4}],["elf","Elf","race_elf",1,{height:1,legs:1.03,arms:1.02,head:.97}],["halfelf","Half-elf","race_elf",.5,{height:1,legs:1.015,arms:1.01,head:.985}],["halforc","Half-orc","race_halforc",1,{height:1.05,legs:1,arms:1.03,head:1}],["tiefling","Tiefling","race_tiefling",1,{height:1,legs:1,arms:1,head:1}]],vi=[["race_dwarf","Dwarf build",0,1,"Broad and stocky: thick limbs, big hands, a broad strong face.",["None","Full"]],["race_halfling","Halfling build",0,1,"A halfling's build and round, youthful face.",["None","Full"]],["race_gnome","Gnome build",0,1,"A gnome's build, big nose and round face.",["None","Full"]],["race_elf","Elf features",0,1,"Slender, with fine features and almond eyes (pointed ears are on the Face tab).",["None","Full"]],["race_halforc","Orc features",0,1,"Heavy-boned and strong, with a broad nose and jaw.",["None","Full"]],["race_tiefling","Tiefling features",0,1,"Sharper cheekbones and a narrower face.",["None","Full"]]];function nf(i,e="female"){let[,,t="",n=0,s={}]=Tn.find(([a])=>a===i)??Tn[0],r=Object.fromEntries(vi.map(([a])=>[a,a===t?n:0]));r.ears={elf:1,halfelf:.5}[i]??0;let o={halforc:Kc[0][0],tiefling:Zc[0][0]}[i];return{race:i,shape:r,height:s.height??1,limbs:{arms:s.arms??1,legs:s.legs??1,head:s.head??1},facialHair:i==="dwarf"&&e==="male"?"beard-02":gt,tusks:i==="halforc"?e==="male"?"tusks-02":"tusks-01":gt,horns:i==="tiefling"?"horns-01":gt,tail:i==="tiefling",...o?{skin:"custom",colours:{skin:o,eyes:i==="tiefling"?15253568:11569706}}:{}}}var sl=i=>{let[,,e="",t=0,n={}]=Tn.find(([s])=>s===i)??Tn[0];return{key:e,weight:t,height:1,legs:1,arms:1,head:1,...n}},My=[[gt,"None"],["moustache-01","Moustache"],["beard-05","Moustache and goatee"],["beard-01","Short beard"],["beard-02","Full beard"],["beard-03","Long beard"],["beard-04","Long beard with braids"]],wy=[[gt,"None"],["tusks-01","Small"],["tusks-02","Large"]],$c=[[gt,"None"],["horns-03","Nubs"],["horns-01","Swept back"],["horns-02","Ram's curl"],["horns-04","Tall"]],Ks=[["facialHair",My,"Facial hair","A beard or moustache, in the hair's colour."],["tusks",wy,"Tusks","A half-orc's lower tusks."],["horns",$c,"Horns","A tiefling's horns."]],Zc=[[11747898,"Red"],[4876968,"Blue"],[8014490,"Purple"]],Kc=[[8227946,"Grey-green"],[9080706,"Grey"]],Jc=new Set(["head","brow","feet"]),Ki=[["weight","Weight",-1,1,"Thinner to heavier, all over.",["Thin","Heavy"]],["muscle","Muscle",-.5,1,"Softer to more muscular.",["Soft","Muscular"]],["chest","Chest",-.5,1,"A flatter or fuller chest (her bust).",["Flat","Full"]],["hips","Hips",-.5,1,"Narrower or wider hips and seat.",["Narrow","Wide"]],["waist","Waist",-1,.5,"A narrower or wider waist.",["Narrow","Wide"]],["belly","Belly",-.5,1,"A flatter or rounder belly.",["Flat","Round"]],["shoulders","Shoulders",-.5,1,"Narrower or broader shoulders.",["Narrow","Broad"]],["neck","Neck",-.5,1,"A slimmer or thicker neck.",["Slim","Thick"]]],bi=[["jaw","Jaw",-.5,1,"A softer or a squarer, stronger jaw and chin.",["Soft","Strong"]],["cheeks","Cheekbones",-.5,1,"Flatter or higher, fuller cheekbones.",["Flat","Full"]],["nose","Nose",-.5,1,"A smaller or larger nose.",["Small","Large"]],["eyes","Eyes",-.5,1,"Smaller or larger eyes.",["Small","Large"]],["ears","Pointed ears",0,1,"Round ears to long, pointed ones, as an elf's.",["Round","Pointed"]]],sf=[["eyes","Eyes","Where the eyes sit and their shape. Eye size is under Face shape."],["brows","Brows","The brow line. The brow hair's style and colour are below."],["nose","Nose","Its shape in detail. Overall size is under Face shape."],["mouth","Mouth and lips",""],["jaw","Jaw and chin",""],["cheeks","Cheeks",""],["ears","Ears","Pointed ears are under Face shape."],["head","Forehead, head and neck","Hair and hats follow the head's shape."]],An=[["eye_height","Height",-1,1,"Where the eyes sit on the face.",["Lower","Higher"],"eyes"],["eye_spacing","Spacing",-1,1,"Closer together or further apart.",["Close","Wide"],"eyes"],["eye_depth","Depth",-1,1,"Standing out or set deep under the brow.",["Prominent","Deep-set"],"eyes"],["eye_tilt","Tilt",-1,1,"The outer corners lower or higher than the inner.",["Down","Up"],"eyes"],["eye_opening","Opening",-1,1,"Narrower or wider open.",["Narrow","Wide"],"eyes"],["eyelid","Eyelids",-1,1,"More of the upper lid showing, or a heavier, hooded lid.",["Open","Hooded"],"eyes"],["eye_inner_fold","Inner fold",-1,1,"The fold of skin over the inner corner.",["Less","More"],"eyes"],["eye_bags","Under the eyes",-1,1,"Smooth or puffy under the eyes.",["Smooth","Puffy"],"eyes"],["brow_height","Height",-1,1,"The brows lower or higher.",["Lower","Higher"],"brows"],["brow_angle","Angle",-1,1,"The brows' outer ends lower or higher.",["Down","Up"],"brows"],["brow_ridge","Ridge",-1,1,"A flat brow, or a heavy ridge standing out.",["Flat","Heavy"],"brows"],["nose_length","Length",-1,1,"A shorter or longer nose, top to tip.",["Short","Long"],"nose"],["nose_width","Width",-1,1,"A narrower or wider nose.",["Narrow","Wide"],"nose"],["nose_depth","Projection",-1,1,"How far the nose stands out from the face.",["Flat","Projecting"],"nose"],["nose_bridge","Bridge",-1,1,"A scooped or a humped bridge.",["Scooped","Humped"],"nose"],["nose_tip","Tip",-1,1,"The tip turned down or up.",["Down","Up"],"nose"],["nose_tip_width","Tip width",-1,1,"A fine or a broad tip.",["Fine","Broad"],"nose"],["nostrils","Nostrils",-1,1,"Narrower or flared nostrils.",["Narrow","Flared"],"nose"],["nose_height","Height",-1,1,"The nose lower or higher on the face.",["Lower","Higher"],"nose"],["mouth_width","Width",-1,1,"A narrower or wider mouth.",["Narrow","Wide"],"mouth"],["mouth_height","Height",-1,1,"The mouth lower or higher on the face.",["Lower","Higher"],"mouth"],["mouth_depth","Depth",-1,1,"The mouth set back or pushed forward.",["Back","Forward"],"mouth"],["upper_lip","Upper lip",-1,1,"A thinner or fuller upper lip.",["Thin","Full"],"mouth"],["lower_lip","Lower lip",-1,1,"A thinner or fuller lower lip.",["Thin","Full"],"mouth"],["cupids_bow","Cupid's bow",-1,1,"A flat or a deeply curved upper lip line.",["Flat","Curved"],"mouth"],["mouth_corners","Corners",-1,1,"The corners of the mouth turned down or up.",["Down","Up"],"mouth"],["jaw_forward","Jaw forward",-1,1,"The lower jaw back (an overbite) or forward (an underbite).",["Back","Forward"],"jaw"],["jaw_width","Jaw width",-1,1,"A narrower or wider jaw at its angles.",["Narrow","Wide"],"jaw"],["chin_height","Chin height",-1,1,"A shorter or longer chin.",["Short","Long"],"jaw"],["chin_width","Chin width",-1,1,"A pointed or a broad chin.",["Pointed","Broad"],"jaw"],["chin_prominence","Chin forward",-1,1,"A receding or a prominent chin.",["Receding","Prominent"],"jaw"],["chin_cleft","Cleft",-1,1,"A smooth chin or a cleft in it.",["Smooth","Cleft"],"jaw"],["cheekbones","Cheekbones",-1,1,"Flat or high, strong cheekbones.",["Flat","High"],"cheeks"],["cheek_fullness","Fullness",-1,1,"Thinner or fuller cheeks.",["Thin","Full"],"cheeks"],["cheek_hollows","Hollows",-1,1,"Full under the cheekbones, or hollow.",["Full","Hollow"],"cheeks"],["ear_size","Size",-1,1,"Smaller or larger ears.",["Small","Large"],"ears"],["ear_angle","Angle",-1,1,"Ears lying flat or standing out.",["Flat","Out"],"ears"],["ear_lobes","Lobes",-1,1,"Smaller or larger lobes.",["Small","Large"],"ears"],["ear_height","Height",-1,1,"The ears lower or higher.",["Lower","Higher"],"ears"],["forehead_height","Forehead height",-1,1,"A lower or higher forehead.",["Low","High"],"head"],["forehead_slope","Forehead slope",-1,1,"A sloping or an upright forehead.",["Sloping","Upright"],"head"],["temples","Temples",-1,1,"Hollow or full temples.",["Hollow","Full"],"head"],["head_width","Head width",-1,1,"A narrower or wider head.",["Narrow","Wide"],"head"],["head_height","Head height",-1,1,"A shorter or taller head.",["Short","Tall"],"head"],["head_depth","Head depth",-1,1,"A shallower or deeper head, front to back.",["Shallow","Deep"],"head"],["neck_length","Neck length",-1,1,"A shorter or longer neck.",["Short","Long"],"head"],["cheeks_round_high","Round, high",0,1,"Round, chipmunk cheeks, high on the face.",["None","Round"],"cheeks"],["cheeks_round_low","Round, low",0,1,"Round, chipmunk cheeks, lower down.",["None","Round"],"cheeks"],["cheekbones_chubby","Soft cheekbones",0,1,"High cheekbones with soft, full flesh over them.",["None","Full"],"cheeks"],["jowls","Jowls",0,1,"Flesh hanging at the jaw line, as with age.",["None","Heavy"],"cheeks"],["cheeks_sunken","Sunken",0,1,"Cheeks sunk in below the cheekbones.",["None","Sunken"],"cheeks"],["ears_flared","Flared",0,1,"The top of the ears flaring out.",["None","Flared"],"ears"],["ears_flatter","Flatter",0,1,"The ears' folds flatter.",["None","Flat"],"ears"],["lobes_out","Lobes out",0,1,"The lobes turned out from the head.",["None","Out"],"ears"],["detail_ears","Ear detail",0,1,"Finer folds and rims in the ears.",["Plain","Detailed"],"ears"],["detail_ear_inner","Inner ear",0,1,"A deeper bowl inside the ear.",["Plain","Deep"],"ears"],["detail_ear_canal","Ear canal",0,1,"An opening into the ear.",["None","Open"],"ears"],["nose_bulbous","Bulbous",0,1,"A round, bulbous tip.",["None","Bulbous"],"nose"],["nose_base_wide","Wide base",0,1,"The nose wider where it meets the face.",["None","Wide"],"nose"],["nose_greek","Greek",0,1,"A straight line from the brow to the tip, as on a Greek statue.",["None","Greek"],"nose"],["nostrils_up","Nostrils up",0,1,"Nostrils turned up, showing more from the front.",["None","Up"],"nose"],["nostrils_small","Small nostrils",0,1,"Smaller nostril openings.",["None","Small"],"nose"],["nostrils_round","Round nostrils",0,1,"Rounder wings at the sides of the nostrils.",["None","Round"],"nose"],["detail_nose_crease","Crease",0,1,"The crease where the nostril wings meet the cheek.",["Plain","Creased"],"nose"],["detail_columella","Columella",0,1,"A straight strip of skin between the nostrils.",["Plain","Straight"],"nose"],["detail_nostril_rims","Nostril rims",0,1,"Sharper rims round the nostrils.",["Soft","Sharp"],"nose"]],rf=[["arms","Arms","Arm length is under Proportions."],["hands","Hands","The nails' length and colour are under Skin and eyes."],["legs","Legs","Leg length is under Proportions."],["torso","Torso and hips",""],["bust","Bust","Its size is the Chest slider above."]],Si=[["upper_arms","Upper arms",-1,1,"Slimmer or thicker upper arms.",["Slim","Thick"],"arms"],["forearms","Forearms",-1,1,"Slimmer or thicker forearms.",["Slim","Thick"],"arms"],["arm_muscle","Arm muscle",-1,1,"Softer or more muscular arms.",["Soft","Muscular"],"arms"],["thighs","Thighs",-1,1,"Slimmer or thicker thighs.",["Slim","Thick"],"legs"],["calves","Calves",-1,1,"Slimmer or thicker calves.",["Slim","Thick"],"legs"],["leg_muscle","Leg muscle",-1,1,"Softer or more muscular legs.",["Soft","Muscular"],"legs"],["buttocks","Buttocks",-1,1,"Flatter or fuller buttocks.",["Flat","Full"],"torso"],["torso_taper","Taper",-1,1,"A straight torso, or one narrowing from the shoulders.",["Straight","V-shaped"],"torso"],["back_muscle","Back",-1,1,"A narrower or broader, more muscled back.",["Narrow","Broad"],"torso"],["stomach_tone","Stomach",-1,1,"A softer or more toned stomach.",["Soft","Toned"],"torso"],["hip_width","Hip bones",-1,1,"Narrower or wider hip bones (Hips above is the hips and seat).",["Narrow","Wide"],"torso"],["bust_height","Height",-1,1,"The bust lower or higher.",["Lower","Higher"],"bust"],["bust_spacing","Spacing",-1,1,"Closer together or further apart.",["Close","Apart"],"bust"],["bust_shape","Shape",-1,1,"Rounder or more pointed.",["Round","Pointed"],"bust"],["bust_lift","Lift",-1,1,"Fuller below or above.",["Low","Lifted"],"bust"],["detail_upper_arms","Upper arm shape",0,1,"The shape of the upper arm's muscles.",["Plain","Shaped"],"arms"],["detail_forearms","Forearm shape",0,1,"The shape of the forearm's muscles.",["Plain","Shaped"],"arms"],["detail_wrists","Wrist bone",0,1,"The bone at the outside of the wrist.",["Plain","Showing"],"arms"],["detail_armpits","Armpits",0,1,"A truer hollow under the arm.",["Plain","Shaped"],"arms"],["elbow_dimples","Elbow dimples",0,1,"Soft dimples at the elbows.",["None","Dimpled"],"arms"],["detail_fingers","Fingers",0,1,"Truer fingers, with their joints.",["Plain","Shaped"],"hands"],["detail_palm","Palm",0,1,"The pad at the little finger's side of the palm.",["Plain","Shaped"],"hands"],["detail_thumb","Thumb pad",0,1,"The pad at the base of the thumb.",["Plain","Shaped"],"hands"],["knuckles_knobby","Knuckles",0,1,"Knobbly knuckles, as with age or hard work.",["Smooth","Knobbly"],"hands"]],jc={shape:[["Round",{head_width:.4,cheek_fullness:.6,jaw_width:-.2,chin_width:.2,chin_height:-.3}],["Oval",{head_height:.3,jaw_width:-.3,chin_width:-.2}],["Square",{jaw_width:.8,chin_width:.6,head_width:.3}],["Heart",{jaw_width:-.6,chin_width:-.8,temples:.5,forehead_height:.3}],["Long",{head_height:.7,chin_height:.6,head_width:-.3}],["Diamond",{cheekbones:.8,jaw_width:-.4,chin_width:-.6,temples:-.4}]],eyes:[["Almond",{eye_opening:-.3,eye_tilt:.3}],["Round",{eye_opening:.6,eyelid:-.4}],["Upturned",{eye_tilt:.8}],["Downturned",{eye_tilt:-.7,eyelid:.3}],["Hooded",{eyelid:.9,eye_opening:-.2}],["Deep-set",{eye_depth:.8}],["Wide-set",{eye_spacing:.7}],["Close-set",{eye_spacing:-.7}],["Inner fold",{eye_inner_fold:.9,eyelid:.4,eye_opening:-.3}]],brows:[["Arched",{brow_angle:.6,brow_height:.3}],["Straight",{brow_angle:-.3}],["Heavy",{brow_ridge:.8,brow_height:-.4}],["Raised",{brow_height:.8}]],nose:[["Button",{nose_length:-.5,nose_tip:.5,nose_tip_width:.3,nose_depth:-.3}],["Roman",{nose_bridge:.8,nose_length:.4,nose_tip:-.3}],["Snub",{nose_tip:.9,nose_length:-.4}],["Narrow",{nose_width:-.6,nose_tip_width:-.5,nostrils:-.4}],["Broad",{nose_width:.6,nostrils:.7,nose_tip_width:.5}],["Scooped",{nose_bridge:-.8,nose_tip:.4}]],mouth:[["Full lips",{upper_lip:.8,lower_lip:.8}],["Thin lips",{upper_lip:-.7,lower_lip:-.6}],["Wide",{mouth_width:.7}],["Small",{mouth_width:-.6,upper_lip:.2,lower_lip:.2}],["Bow-shaped",{cupids_bow:.9,upper_lip:.4}],["Smiling corners",{mouth_corners:.6}]],jaw:[["Strong",{jaw_width:.7,chin_width:.5,chin_prominence:.4}],["Soft",{jaw_width:-.6,chin_width:-.3}],["Pointed chin",{chin_width:-.9,chin_height:.3}],["Underbite",{jaw_forward:.9,chin_prominence:.4}],["Overbite",{jaw_forward:-.8,chin_prominence:-.4}],["Cleft chin",{chin_cleft:.9}]],cheeks:[["High cheekbones",{cheekbones:.8,cheek_hollows:.3}],["Full cheeks",{cheek_fullness:.8,cheek_hollows:-.4}],["Gaunt",{cheek_fullness:-.6,cheek_hollows:.8,temples:-.3}]],ears:[["Small and flat",{ear_size:-.5,ear_angle:-.6}],["Large",{ear_size:.7,ear_lobes:.4}],["Sticking out",{ear_angle:.9}]],head:[["High forehead",{forehead_height:.8}],["Long neck",{neck_length:.8}],["Short neck",{neck_length:-.7}]]},rl=[["semireal","Semi-real","The body and face as made.",{shape:{},limbs:{head:1}}],["anime","Anime proportions (trial)","Large eyes set low and apart, a small nose and mouth, a narrow pointed chin and a slightly larger head. A trial on the semi-real head: the anime look itself (its eyes, flat shading and outlines) is still to come.",{shape:{eyes:1,eye_height:-.35,eye_spacing:.35,eye_opening:.7,eye_tilt:.15,eyelid:-.5,eye_depth:-.5,brow_ridge:-.8,brow_height:.4,nose:-.5,nose_width:-.6,nose_depth:-.6,nose_length:-.4,nostrils:-.8,nose_tip:.4,nose_bridge:-.4,mouth_width:-.5,upper_lip:-.5,lower_lip:-.2,jaw:-.5,jaw_width:-.7,chin_width:-.8,chin_height:-.2,chin_prominence:-.2,cheeks:-.3,cheekbones:-.4,cheek_fullness:.3,cheek_hollows:-.6,forehead_height:.5,head_height:.2,head_width:.1},limbs:{head:1.1}}]],Xc=([i])=>!i.startsWith("detail_"),of=[...bi.map(([i])=>i),...An.filter(Xc).map(([i])=>i)],Qc=i=>i==="shape"?An.filter(Xc).filter(([,,,,,,e])=>["jaw","cheeks","head"].includes(e)).map(([e])=>e):An.filter(Xc).filter(([,,,,,,e])=>e===i).map(([e])=>e),Wr=[["muzzle","Muzzle",-1,1,"A shorter or a longer muzzle.",["Short","Long"],"face"],["earSize","Ears",-1,1,"Smaller or taller ears.",["Small","Tall"],"face"],["horns","Horns",-1,1,"Smaller or larger horns.",["Small","Large"],"face"],["tailLength","Tail length",-1,1,"A shorter or a longer tail.",["Short","Long"],"build"],["tail","Tail thickness",0,1,"A slim tail to a thicker one.",["Slim","Thick"],"build"]],eh={weight:["thin","heavy"],neck:["neck_slim","neck"],ears:[null,"ears_pointed"],muzzle:["muzzle_short","muzzle"],earSize:["ears_small","ears_tall"],horns:["horns_small","horns"],tailLength:["tail_short","tail_long"],eyes:["eye_size.lo","eyes"],...Object.fromEntries([...An,...Si].map(([i])=>[i,[`${i}.lo`,`${i}.hi`]]))},th=(i,e)=>eh[i]??[null,i==="chest"&&e==="female"?"bust":i],Js=(i,e,t)=>e.includes(th(i,t)[1]),ol=([i,,e,t],n)=>[n.includes(eh[i]?.[0])?-1:e,t],af=(i,[e,t])=>i<0?-i/e:i/t,lf=(i,[e,t])=>i<0?-i*e:i*t,js=[["arms","Arm length",.75,1.2,"Shorter or longer arms, no thicker.",["Short","Long"]],["legs","Leg length",.65,1.2,"Shorter or longer legs, no thicker. Longer legs stand taller.",["Short","Long"]],["head","Head size",.85,1.45,"A smaller or larger head (and its hair).",["Small","Large"]]],cf={shape:{...Object.fromEntries([...Ki,...bi,...An,...Si,...vi,...Wr].map(([i])=>[i,0])),detail_ears:1,detail_ear_inner:.5,detail_ear_canal:.6,detail_nose_crease:.6,detail_nostril_rims:.5,detail_fingers:1,detail_palm:.6,detail_thumb:.6,detail_armpits:1,detail_wrists:.5},limbs:Object.fromEntries(js.map(([i])=>[i,1])),height:1},nh=[["young","Young adult"],["middle","Middle-aged (about 50)"],["old","Old (about 72)"]],tl=[["caucasian","Caucasian"],["african","African"],["asian","Asian"],["custom","A colour of your own"]],Xr=[["creamy","Creamy",["female"]],["redhead","Redhead's",["female"]],["freckles","Light, freckled",["female","male"]],["ginger","Light, ginger",["female","male"]],["bronze","Bronzed",["female","male"]],["eurasian-young","Eurasian, young",["female"]],["eurasian-middle","Eurasian, middle-aged",["female"]],["eurasian-old","Eurasian, old",["female","male"]],["aksel","Fair, weathered",["male"]],["natural-makeup","Light, natural make-up",["female"]],["classic-makeup","Light, make-up",["female"]],["violet-makeup","Light, violet make-up",["female"]],["bronze-makeup","Bronzed, make-up",["female"]],["eyeliner","Light, eyeliner",["male"]],["goth-makeup","Light, goth make-up",["male"]],["emo-eyes","Light, dark eye make-up",["male"]],["tattooed","Tattooed",["male"]]],al=i=>[...tl.slice(0,-1),...Xr.filter(([,,e])=>e.includes(i)).map(([e,t])=>[e,t]),...tl.slice(-1)],hf=(i,e,t)=>i==="custom"?null:Xr.some(([n])=>n===i)?`avatar-${e}-skin-${i}`:`avatar-${e}-skin-${t}-${i}`,Fn="tint",Yr=[["brownlight","Brown"],["brown","Red-brown"],["green","Green"],["bluegreen","Blue-green"],["blue","Blue"],["lightblue","Light blue"],["deepblue","Deep blue"],["grey","Grey"],["ice","Ice"],["amber","Amber"],["hazel","Hazel"],["seabreeze","Sea green"],["clearblue","Clear blue"],["steel","Steel grey"],["darkbrown","Dark brown"],["sapphire","Sapphire"],["cat-blue","Cat's eye, blue"],["cat-brown","Cat's eye, brown"],["cat-green","Cat's eye, green"],["cat-sapphire","Cat's eye, sapphire"],["cat-yellow","Cat's eye, yellow"],["reptile","Reptile, fiery"],["dragon","Dragon"],["anime-navy","Anime, navy (trial)"]],qr=5,Ty=16,Ay=6,uf={13:"Thin, fine hairs",14:"Natural, fine hairs",15:"Thick, fine hairs",16:"Arched, fine hairs"},df={5:"Natural, fine",6:"Full, fine"},$r=[[3877406,"Dark brown"],[7031338,"Brown"],[9071162,"Hazel"],[10123818,"Amber"],[5208639,"Green"],[4157322,"Blue"],[8030874,"Grey"],[5917306,"Violet"]],Ey=[[12088428,"Rose"],[13208190,"Pale pink"],[10113096,"Deep rose"],[11024954,"Red"],[6957626,"Berry"],[8014394,"Brown"],[4860458,"Dark"]],Cy=[[15780028,"Natural"],[16050400,"Pale"],[12595258,"Red"],[14192808,"Pink"],[3824282,"Blue"],[2779722,"Green"],[1710618,"Black"]],Zr=[[15262940,"Off-white"],[16185078,"White"],[14207144,"Cream"],[9079434,"Grey"],[2763310,"Black"],[3820154,"Navy"],[9058874,"Red"],[4876874,"Green"],[6965810,"Brown"],[13672624,"Pink"],[6965882,"Violet"]],ih=[["skin","Skin",$n,"The skin all over."],["eyes","Eyes",$r,"The colour of the eyes."],["lips","Lips",Ey,"The lips."],["nails","Nails",Cy,"Finger and toe nails."],["brows","Brows",$i,"Eyebrows and lashes (else the hair's colour, a little darker)."],["underwear","Underwear",Zr,"The underwear's cloth."]],Yi=[[7235682,"Grey",15261648],[9407104,"Timber grey",15261648],[11118756,"Silver",16052714],[15328990,"White",16052714],[2367775,"Black",3814963],[6046771,"Brown",13216124],[9065008,"Red",15261648],[10846810,"Tawny",15261648],[14207144,"Cream",16052714]],Ry=[[15261648,"Cream"],[16052714,"White"],[12762806,"Pale grey"],[13216124,"Tan"],[8223348,"Grey"],[3814963,"Charcoal"]],sh=[[2828069,"Black"],[4008738,"Dark brown"],[6964792,"Liver"],[12618372,"Pink"]],nl=[[14260779,"Amber"],[14726714,"Gold"],[14207050,"Yellow"],[14711326,"Orange"],[7031338,"Brown"],[6261311,"Green"],[9091288,"Ice blue"],[4157338,"Blue"],[11545122,"Red"],[8014490,"Violet"]],rh=[[2828326,"Black"],[4865331,"Dark horn"],[9073752,"Horn"],[14208436,"Bone"],[15789282,"White"]],qi=[[2763310,"Black",6974064],[3104666,"Blue",14271114],[12098122,"Brass",14998728],[9071162,"Bronze",14271114],[12085818,"Copper",14998728],[13936682,"Gold",15787720],[4160063,"Green",14271114],[10496546,"Red",14271114],[11843776,"Silver",15133422],[15133422,"White",11059416]],Iy=[[14271114,"Pale gold"],[14998728,"Bone"],[15787720,"Cream"],[15133422,"White"],[6974064,"Ash"],[3815998,"Charcoal"],[11059416,"Pale blue"],[11061408,"Pale green"],[14198944,"Rose"]],Ji=[[14141863,"Bone"],[15788760,"Ivory"],[6967352,"Horn brown"],[2762790,"Black"],[9078916,"Grey"],[13148240,"Gold"]],Py=[["horns","Horns",Ji,"The horns."]],Ly={wolf:[["fur","Fur",Yi,"The coat: the back, head, limbs and tail. The neck ruff's tufts follow it."],["fur2","Lighter fur",Ry,"The muzzle, throat, chest, belly and the tail's underside."],["nose","Nose",sh,"The nose and the paw pads."],["eyes","Eyes",nl,"The colour of the eyes."],["claws","Claws",rh,"The claws on hands and feet."]],dragon:[["scales","Scales",qi,"The scales all over: the back, head, limbs, tail and wings."],["scales2","Underside",Iy,"The throat, chest, belly and the wings' skin."],["horns","Horns",Ji,"The horns, spines and claws."],["eyes","Eyes",nl,"The colour of the eyes."]]};var Kr=[["bra","Bra"],["sports_bra","Sports bra"],["bralette","Bralette"],["undershirt","Undershirt"]],Jr=[["briefs","Briefs"],["boxer_briefs","Boxer briefs"],["boxers","Boxers"],["boyshorts","Boyshorts"],["bikini","Bikini"],["thong","Thong"]],Qs=[["head","Head","A hood, a helm or a hat. Most hide the hair.","head"],["brow","Brow","A circlet on the brow.","head"],["face","Glasses","Glasses or a mask over the eyes.","accessories"],["mouth","Face mask","A mask over the mouth and nose.","accessories"],["ears","Earrings","A pair of earrings.","accessories"],["neck","Neck","A scarf.","accessories"],["back","Cloak or coat","Worn over everything else.","body"],["body","Whole outfit","A dress, gown, robe or one-piece: top and legs in one.","body"],["top","Shirt or top","Next to the skin, under everything else.","tops"],["over","Over the shirt","A tunic, vest, corset, padded gambeson or jacket.","tops"],["armour","Body armour","Mail, scale, brigandine, leather or a harness.","armour"],["plate","Breastplate","A plate cuirass, over mail or a gambeson.","armour"],["shoulders","Shoulders","Plate pauldrons.","armour"],["arms","Forearms","Leather bracers.","hands"],["hands","Hands","Gloves or plate gauntlets.","hands"],["fingers","Rings","A ring. Gloves hide it.","accessories"],["waist","Belt","A belt with pouches.","accessories"],["apron","Apron","A work apron, as a smith or a cook wears.","accessories"],["legs","Legs","Trousers, skirts, shorts and the like.","legs"],["thighs","Thigh plates","Plate tassets hung from the waist.","armour"],["shins","Shins","Plate greaves.","armour"],["socks","Socks","Socks or leg warmers, under the shoes.","feet"],["feet","Feet","Boots, shoes or sandals.","feet"]],ff=[["nails","Fingernails","Short, medium or long.","hands"],["toenails","Toenails","On the toes.","feet"]],ll=[["short","Short"],["medium","Medium"],["long","Long"],["none","None"]],Ny={nails:["hands"],toenails:["feet","socks"],fingers:["hands"]},cl=(i,e)=>(Ny[i]??[]).some(t=>e.has(t)),jr=[["hood","Hood","head"],["helm","Open helm","head"],["full_helm","Full helm","head"],["mh_fedora","Fedora","head"],["mh_fedora_cocked","Fedora, tilted","head"],["circlet","Circlet","brow"],["scarf","Scarf","neck"],["cloak","Cloak","back"],["long_coat","Long coat","back"],["dress","Dress","body"],["gown","Gown","body"],["robe","Robe","body"],["one_piece_swimsuit","Swimsuit","body"],["mh_workwear","Work overalls and shirt","body"],["shirt","Linen shirt","top"],["t_shirt","T-shirt","top"],["tank_top","Tank top","top"],["crop_top","Crop top","top"],["blouse","Blouse","top"],["bikini_top","Bikini top","top"],["mh_tee","Tee","top"],["mh_long_tee","Long tee","top"],["mh_longsleeve_tee","Long-sleeved tee","top"],["mh_denim_shirt","Denim shirt","top"],["mh_plaid_shirt","Plaid shirt","top"],["mh_female_tee","Tee","top"],["mh_female_loose_tee","Loose tee","top"],["mh_female_sport_top","Sports top","top"],["tunic","Tunic","over"],["vest","Vest","over"],["corset","Corset","over"],["gambeson","Gambeson","over"],["mh_jacket","Jacket","over"],["mh_suit_jacket","Suit jacket","over"],["mh_female_blazer","Blazer","over"],["chainmail","Chainmail","armour"],["scale_mail","Scale mail","armour"],["brigandine","Brigandine","armour"],["leather_armour","Leather armour","armour"],["bikini_armour","Bikini armour","armour"],["barbarian_harness","Barbarian harness","armour"],["plate_cuirass","Plate cuirass","plate"],["pauldrons","Pauldrons","shoulders"],["bracers","Bracers","arms"],["gloves","Leather gloves","hands"],["gauntlets","Gauntlets","hands"],["belt_pouches","Belt and pouches","waist"],["apron","Apron","apron"],["trousers","Trousers","legs"],["leggings","Leggings","legs"],["shorts","Shorts","legs"],["skirt","Long skirt","legs"],["short_skirt","Short skirt","legs"],["pleated_skirt","Pleated skirt","legs"],["loincloth","Loincloth","legs"],["swim_trunks","Swim trunks","legs"],["bikini_bottom","Bikini bottom","legs"],["mh_jeans","Jeans","legs"],["mh_jeans_dark","Dark jeans","legs"],["mh_suit_trousers","Suit trousers","legs"],["mh_overalls","Overalls","legs"],["mh_female_jeans","Jeans","legs"],["mh_female_leggings","Leggings","legs"],["mh_female_shorts","Shorts","legs"],["mh_female_skirt","Skirt","legs"],["tassets","Tassets","thighs"],["greaves","Greaves","shins"],["boots","Boots","feet"],["tall_boots","Tall boots","feet"],["shoes","Shoes","feet"],["sandals","Sandals","feet"],["sabatons","Sabatons","feet"],["mh_boots_black","Black boots","feet"],["mh_shoes_black","Black shoes","feet"],["mh_shoes_brown","Brown shoes","feet"],["mh_trainers_white","White trainers","feet"],["mh_trainers_blue","Blue trainers","feet"],["mh_trainers_worn","Worn trainers","feet"],["nails_short","Short nails","nails"],["nails_medium","Medium nails","nails"],["nails_long","Long nails","nails"],["toenails","Toenails","toenails"]],$t=Object.fromEntries(jr.map(([i,,e])=>[i,e])),Zn={};function pf(i){for(let e of i)Object.hasOwn($t,e.piece)||(jr.push([e.piece,e.label,e.slot]),$t[e.piece]=e.slot,Zn[e.piece]=e)}var oh={cloak:{label:"Hood",says:"The cloak's hood down on the shoulders, or up over the head (which hides the hair).",ways:[["","Down"],["hood_up","Up"]]}},er=[["cloth","Cloth"],["nail","Nail"],["trim","Trim"],["lining","Lining"],["bodice","Bodice"],["shirt","Shirt"],["suit","Suit"],["under","Underlayer"],["felt","Felt"],["laces","Laces"],["cord","Cord"],["leather","Leather"],["belt","Belt"],["pouch","Pouches"],["fur","Fur"],["sole","Soles"],["shoe","Shoe"],["sock","Sock"],["mail","Mail"],["scale","Scales"],["plate","Plate"],["metal","Metal fittings"],["gem","Gem"],["frame","Frame"]],tr=[[15261900,"Undyed linen"],[16053488,"White"],[2763310,"Black"],[8026746,"Grey"],[6965810,"Brown"],[10123858,"Tan"],[9054762,"Red"],[6957642,"Wine"],[11565610,"Ochre"],[5925418,"Olive"],[3103290,"Green"],[3099258,"Blue"],[2042442,"Navy"],[5913210,"Purple"],[12618394,"Rose"],[12105920,"Steel"],[13148240,"Brass"],[14202976,"Gold"]],ah={"clothes-a":14734520,"clothes-b":8223306,"clothes-blue":4876954,"clothes-red":11561578,"clothes-teal":5212792,"clothes-plum":7688303,"clothes-grey":9079434,"ranger-a":4151861,"ranger-b":11573872,"ranger-wine":6961754,"ranger-dusk":4543866,"ranger-rust":10115637,"ranger-moss":6978111,"ranger-grey":7303023};var Dy=40;var lh=[{name:"Everyday man",look:{body:"male"}},{name:"Broad smith",look:{body:"male",shape:{weight:.35,muscle:.8,shoulders:.7,neck:.5,jaw:.5},limbs:{arms:1.04},height:1.04}},{name:"Lean ranger",look:{body:"male",shape:{weight:-.45,muscle:.35,cheeks:.4},limbs:{legs:1.05},height:1.05}},{name:"Stout elder",look:{body:"male",shape:{weight:.7,belly:.8,muscle:-.2},age:"old",hairColour:7,hair:"short",height:.95}},{name:"Male elf",look:{body:"male",race:"elf",shape:{weight:-.35,jaw:-.2,cheeks:.6,ears:1},hair:"long",hairColour:4,height:1.06}},{name:"Everyday woman",look:{body:"female"}},{name:"Strong woman",look:{body:"female",shape:{muscle:.8,shoulders:.5,weight:.15},height:1.04}},{name:"Slender woman",look:{body:"female",shape:{weight:-.5,waist:-.4,hips:.2},limbs:{legs:1.05}}},{name:"Curvy woman",look:{body:"female",shape:{weight:.3,chest:.6,hips:.7,waist:-.3}}},{name:"Female elf",look:{body:"female",race:"elf",shape:{weight:-.4,cheeks:.6,eyes:.3,ears:1},hair:"long",hairColour:4,height:1.04}},...["dwarf","halfling","gnome","halfelf","halforc","tiefling"].map(i=>({name:Tn.find(([e])=>e===i)[1],look:{race:i}})),...[["Grey wolf",0,14260779],["White wolf",3,9091288],["Black wolf",4,14726714]].map(([i,e,t])=>({name:i,look:{species:"wolf",colours:{fur:Yi[e][0],fur2:Yi[e][2],eyes:t}}})),...[["Red dragon",7,14726714],["Gold dragon",5,14711326],["Blue dragon",1,14207050],["Silver dragon",8,9091288]].map(([i,e,t])=>({name:i,look:{species:"dragon",colours:{scales:qi[e][0],scales2:qi[e][2],eyes:t}}}))].map(i=>({...i,look:Zi(i.look)})),Qr=[{name:"Peasant",male:["tunic","trousers","shoes"],female:["blouse","skirt","shoes"],clothColours:{tunic:{cloth:10123858},skirt:{cloth:6965810},trousers:{cloth:6965810}}},{name:"Townsperson",male:["shirt","vest","trousers","shoes"],female:["dress","shoes"],clothColours:{vest:{cloth:3099258},dress:{cloth:3103290}}},{name:"Ranger",both:["shirt","leather_armour","trousers","tall_boots","gloves","cloak"],clothColours:{cloak:{cloth:3103290},trousers:{cloth:5925418}},variants:{cloak:"hood_up"}},{name:"Mage",both:["robe","shoes","circlet"],clothColours:{robe:{cloth:2042442,trim:13148240}}},{name:"Knight",both:["gambeson","chainmail","plate_cuirass","pauldrons","gauntlets","trousers","tassets","greaves","sabatons","full_helm"]},{name:"Barbarian",male:["loincloth","barbarian_harness","bracers","sandals"],female:["bikini_armour","loincloth","bracers","sandals"]},{name:"Beach",male:["swim_trunks","sandals"],female:["bikini_top","bikini_bottom","sandals"],clothColours:{swim_trunks:{cloth:3099258},bikini_top:{cloth:9054762},bikini_bottom:{cloth:9054762}}},{name:"Modern casual",male:["mh_tee","mh_jeans","mh_trainers_white"],female:["mh_female_tee","mh_female_jeans","mh_trainers_white"]}];function hl(i,e){let t=i[e]??i.both??[],n=(s={})=>Object.fromEntries(Object.entries(s).filter(([r])=>t.includes(r)));return Zi({clothes:t,clothColours:n(i.clothColours),variants:n(i.variants)})}var Bn=64,eo=16777215,Uy=2048,Oy=()=>typeof globalThis.document?.createElement("canvas")?.getContext=="function",ul=new Map;function gf(i){if(!ul.has(i)){let e=new Promise((t,n)=>{let s=new Image;s.decoding="async",s.onload=()=>t(s),s.onerror=()=>n(new Error(`the picture ${i} couldn't be loaded`)),s.src=ja(i.endsWith(".png")?i:`${i}.webp`)});e.catch(()=>ul.delete(i)),ul.set(i,e)}return ul.get(i)}var ch=new Map;function Fy(i,e){let t=`${i}:${e}`;if(!ch.has(t)){let n=gf(`avatar-${i}-masks.png`).then(s=>{let r=document.createElement("canvas");r.width=r.height=e;let o=r.getContext("2d",{willReadFrequently:!0});o.drawImage(s,0,0,e,e);let{data:a}=o.getImageData(0,0,e,e),l=new Uint8Array(e*e),c=Math.ceil(e/Bn),d=new Set;for(let u=0;u<l.length;u++)l[u]=a[u*4+1],l[u]&&d.add(Math.floor(Math.floor(u/e)/Bn)*c+Math.floor(u%e/Bn));return{lips:l,tiles:[...d].map(u=>({x:u%c*Bn,y:Math.floor(u/c)*Bn}))}}).catch(()=>null);ch.set(t,n)}return ch.get(t)}var Kn=new Map,By=3,mf=i=>[i>>16&255,i>>8&255,i&255];async function _f({sex:i,base:e,skin:t=eo,lips:n=eo}){if(!Oy()||t===eo&&n===eo)return null;let s=[i,e,t,n].join("|");if(Kn.has(s)){let h=Kn.get(s);return Kn.delete(s),Kn.set(s,h),h}let r=await gf(e),o=Math.max(Uy,r.naturalWidth||r.width),a=await Fy(i,o),l=document.createElement("canvas");l.width=l.height=o;let c=l.getContext("2d",{willReadFrequently:!0});c.drawImage(r,0,0,o,o);let d=a?a.tiles.map(({x:h,y:p})=>c.getImageData(h,p,Bn,Bn)):[];if(t!==eo&&(c.globalCompositeOperation="multiply",c.fillStyle=`#${t.toString(16).padStart(6,"0")}`,c.fillRect(0,0,o,o),c.globalCompositeOperation="source-over"),a){let[h,p,g]=mf(t),[b,m,f]=mf(n);a.tiles.forEach(({x:y,y:T},v)=>{let w=d[v],S=w.data;for(let E=0;E<Bn;E++)for(let _=0;_<Bn;_++){let A=a.lips[(T+E)*o+y+_]/255,R=(E*Bn+_)*4;S[R]=S[R]*(h+(b-h)*A)/255,S[R+1]=S[R+1]*(p+(m-p)*A)/255,S[R+2]=S[R+2]*(g+(f-g)*A)/255}c.putImageData(w,y,T)})}let u=new vr(l);for(u.flipY=!1,u.colorSpace=bt,u.name=`${e}-painted`,u.userData.shared=!0,Kn.set(s,u);Kn.size>By;){let[h]=Kn.keys();Kn.get(h).dispose(),Kn.delete(h)}return u}function ji(i){let e=2166136261;for(let t=0;t<i.length;t++)e^=i.charCodeAt(t),e=Math.imul(e,16777619);return e>>>0}function nr(i){let e=i>>>0;return()=>{e=e+1831565813|0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}var hh=i=>`#${(i>>>0).toString(16).padStart(6,"0").slice(-6)}`,xf=i=>/^#?[0-9a-f]{6}$/iu.test(i??"")?parseInt(i.replace("#",""),16):null;async function ir(i,e=2e4){try{let t=await fetch(i,{headers:{Accept:"application/json"},signal:AbortSignal.timeout(e)});return t.ok?await t.json():null}catch{return null}}var Tf={Head:"head",neck_01:"neck",spine_01:"torso",spine_02:"torso",spine_03:"torso",clavicle_l:"torso",clavicle_r:"torso",pelvis:"hips",upperarm_l:"upperarms",upperarm_r:"upperarms",lowerarm_l:"forearms",lowerarm_r:"forearms",hand_l:"hands",hand_r:"hands",...Object.fromEntries(["l","r"].flatMap(i=>["thumb","index","middle","ring","pinky"].flatMap(e=>[1,2,3].map(t=>[`${e}_0${t}_${i}`,"hands"])))),thigh_l:"thighs",thigh_r:"thighs",calf_l:"calves",calf_r:"calves",foot_l:"feet",foot_r:"feet",ball_l:"feet",ball_r:"feet"},yf=!0;var Af=[...new Set(Object.values(Tf)),"underwear","underwear-top","underwear-bottom","hair"],ky=new Set(["skin","nails","underwear","underwear_trim","fur","fur2","fur_tufts","fur2_tufts","nose","claws","scales","scales2","horns"]),zy=new Set(["neck","back","armour","plate"]),Vy=(i,e)=>i==="human"?`avatar-${e}`:`anthro-${i}-${e}`,Hy={arms:[["upperarm_l","lowerarm_l"],["lowerarm_l","hand_l"],["upperarm_r","lowerarm_r"],["lowerarm_r","hand_r"]],legs:[["thigh_l","calf_l"],["calf_l","foot_l"],["thigh_r","calf_r"],["calf_r","foot_r"]]},Qi=16777215,vf={male:[1,2,4,9,10,12],female:[3,5,6,7,8,11]},bf={male:[1,3],female:[2,4]},Gy=i=>i<.65?"young":i<.9?"middle":"old",Wy=[0,3,4,5,6,7,8,9,10,11,12].map(i=>tr[i][0]),Xy=[6,7,10,12,13,2].map(i=>tr[i][0]),Yy=[0,3,4,5].map(i=>tr[i][0]),uh=[{job:"townsperson",share:40,male:[["shirt","vest","trousers","shoes"],["shirt","tunic","trousers","boots"]],female:[["dress","shoes"],["blouse","skirt","shoes"],["blouse","corset","skirt","shoes"]]},{job:"farmer",share:22,male:[["tunic","trousers","boots"]],female:[["tunic","skirt","boots"],["blouse","skirt","boots"]]},{job:"smith",share:8,male:[["shirt","trousers","boots","apron"]],female:[["shirt","trousers","boots","apron"]]},{job:"guard",share:14,male:[["gambeson","trousers","boots"],["shirt","brigandine","trousers","boots"]],female:[["gambeson","trousers","boots"],["shirt","brigandine","trousers","boots"]]},{job:"noble",share:8,dyes:Xy,male:[["shirt","long_coat","trousers","tall_boots"]],female:[["gown","shoes"],["blouse","long_coat","skirt","tall_boots"]]},{job:"priest",share:8,dyes:Yy,male:[["robe","sandals"]],female:[["robe","sandals"]]}];function qy(i,e){let t=nr(ji(`${i||"wanderer"}:clothes`)),n=t()*uh.reduce((c,d)=>c+d.share,0),s=uh.find(c=>(n-=c.share)<0)??uh[0],r=s[e]??s.male,o=r[Math.floor(t()*r.length)],a=s.dyes??Wy,l={};for(let c of o){let d=a[Math.floor(t()*a.length)];["apron","boots","shoes","tall_boots","sandals"].includes(c)||(l[c]=c==="gown"?{bodice:d,cloth:d}:{cloth:d})}return{job:s.job,clothes:o,clothColours:l}}var sr=(i,e,t)=>Math.max(e,Math.min(t,i)),Mi=(i,e,t)=>{let n=s=>Math.round((i>>s&255)*(1-t)+(e>>s&255)*t);return n(16)<<16|n(8)<<8|n(0)};function $y(i,e="auto",t={}){let{sex:n,gender:s}=$d(i,e,t),r=qc.some(([se])=>se===t.species)?t.species:"human",o=r!=="human",a=!o&&Tn.some(([se])=>se===t.race)?t.race:"human",l=nr(ji(`${i||"wanderer"}:avatar-race`)),c=se=>se[Math.floor(l()*se.length)],d={facialHair:a==="dwarf"&&n==="male"?c(["beard-02","beard-03","beard-04","beard-04"]):gt,tusks:a==="halforc"?n==="male"?c(["tusks-01","tusks-02"]):"tusks-01":gt,horns:a==="tiefling"?c($c.slice(1))[0]:gt},{key:u,weight:h,...p}=sl(a),g=!!u&&t.shape?.[u]===void 0,b=se=>g?p[se]:1,m={halforc:Kc,tiefling:Zc}[a],f=m?c(m)[0]:void 0,y=nr(ji(`${i||"wanderer"}:avatar`)),T=se=>(y()+y()-1)*se,v={weight:.5,muscle:.35,chest:.35,hips:.3,waist:.3,belly:.25,shoulders:.3,neck:.25},w={};for(let[se,,Ue,Ye]of[...Ki,...bi]){let Ie=se==="ears"?{elf:1,halfelf:.5}[a]??0:sr(T(v[se]??.35),Ue,Ye);w[se]=t.shape?.[se]??Math.round(Ie*100)/100}let S={};for(let[se]of[...An,...Si])w[se]=t.shape?.[se]??0;for(let[se]of vi)w[se]=t.shape?.[se]??(g&&se===u?h:0);for(let[se,,Ue,Ye]of js){let Ie=t.limbs?.[se]??Math.round(sr(1+T(se==="head"?.02:.03),Ue,Ye)*1e3)/1e3;S[se]=sr(Ie*b(se),Ue,Ye)}let E=.94+y()*.12,_=Math.floor(y()*$n.length),A=$r[Math.floor(y()*7)][0],R=Yc[n][Math.floor(y()*Yc[n].length)],P=Math.floor(y()*ef),U=Zr[Math.floor(y()*4)][0],k=t.colours?.skin??t.skinTint??(Number.isInteger(t.skin)?$n[t.skin][0]:void 0),I=k??f??$n[_][0],F=al(n).some(([se])=>se===t.skin)?t.skin:Xr.some(([se])=>se===t.skin)?"caucasian":(k??f)!==void 0?"custom":["caucasian","asian","african"][Math.floor(_*3/$n.length)],$=F!=="custom",X=nr(ji(`${i||"wanderer"}:avatar-age`)),ne=Gy(X()),q=vf[n][Math.floor(X()*vf[n].length)],K=bf[n][Math.floor(X()*bf[n].length)],ee=nr(ji(`${i||"wanderer"}:avatar-anthro`));for(let[se,,Ue,Ye]of Wr){let Ie=sr((ee()+ee()-1)*.35,Ue,Ye);w[se]=t.shape?.[se]??Math.round(Ie*100)/100}let be=t.colours??{},Se=(se,Ue,Ye)=>se.find(([Ie])=>Ie===Ue)?.[2]??Mi(Ue,Ye,.6),tt=Yi[Math.floor(ee()*Yi.length)][0],Ge=qi[Math.floor(ee()*qi.length)][0],te=nl[Math.floor(ee()*5)][0],[H,G]=[be.fur??tt,be.scales??Ge],ae=t.hairTint??$i[t.hairColour??P][0],Te=qy(i,n),fe=(t.clothes??Te.clothes).filter(se=>!o||!Jc.has($t[se])),Ne={};for(let se of fe){let Ue={...t.clothes?{}:Te.clothColours[se],...t.clothColours?.[se]};Object.keys(Ue).length&&(Ne[se]=Ue)}let Ze={skin:I,eyes:be.eyes??(o?te:{halforc:11569706,tiefling:15253568}[a]??A),...o?{}:{horns:be.horns??Ji[3][0]},...r==="wolf"?{fur:H,fur2:be.fur2??Se(Yi,H,15788248),nose:be.nose??sh[0][0],claws:be.claws??rh[0][0]}:{},...r==="dragon"?{scales:G,scales2:be.scales2??Se(qi,G,15787720),horns:be.horns??Ji[0][0]}:{},lips:t.colours?.lips??($?Qi:I===f?Mi(I,0,.3):Mi(Mi(I,10502208,.35),0,.12)),nails:t.colours?.nails??($?Qi:Mi(I,16180960,.4)),brows:t.colours?.brows??Mi(ae,0,.25),underwear:t.colours?.underwear??t.tints?.top??ah[t.colour]??ah[t.rangerColour]??U};return{body:n,species:r,wings:t.wings!==!1,race:a,...Object.fromEntries(Ks.map(([se])=>[se,o?gt:t[se]??d[se]])),tail:!o&&(t.tail??a==="tiefling"),gender:s,shape:w,limbs:S,height:sr((t.height??E)*b("height"),yi[0],yi[1]),colours:Ze,hair:o?gt:Zs.some(([se])=>se===t.hair)?t.hair:R,hairColour:ae,underwear:{top:t.underwear?.top??(yf&&n==="female"?"bra":gt),bottom:t.underwear?.bottom??(yf?"briefs":gt)},clothes:fe,clothColours:Ne,variants:o?{}:t.variants??{},job:t.clothes?null:Te.job,age:t.age??ne,skin:o?"custom":F,brows:t.brows??q,lashes:t.lashes??K,eyePicture:o?Fn:t.eyePicture??Fn,nails:o?"none":t.nails??"short",toenails:!o&&t.toenails!==!1,seed:ji(`${i}:motion`)}}function Zy(i,e,t,n=!1){let s={age_middle:i.age==="middle"?1:0,age_old:i.age==="old"?1:0,ruff_flat:n?1:0,collar_fit:n?1:0};for(let r of[...Ki,...bi,...An,...Si,...vi,...Wr]){let[o]=r,[a,l]=th(o,e),[c,d]=ol(r,t),u=sr(i.shape[o],c,d)*(o==="waist"?-1:1);a&&t.includes(a)?(s[a]=Math.max(0,-u),s[l]=Math.max(0,u)):s[l]=u}for(let r of Object.keys(s))t.includes(r)||delete s[r];return s}function Ef(i,e=0){let t={};for(let[n,s]of Object.entries(i.morphs??{})){let r=Uint32Array.from(Mn(i.count>65535?Uint32Array:Uint16Array,s.ids),c=>c+e),o=s.q??32767,a=Float32Array.from(Mn(Int16Array,s.delta),(c,d)=>c/o*s.d[d%3]),l=Float32Array.from(Mn(Int8Array,s.normal),(c,d)=>c/127*s.n[d%3]);t[n]={ids:r,delta:a,normal:l}}return t}function Sf(i,e,t,n){let s=i.slice(),r=e.slice(),o=!1;for(let[a,l]of Object.entries(t)){let c=n[a]??0;if(c){for(let{ids:d,delta:u,normal:h}of l)for(let p=0;p<d.length;p++){let g=d[p]*3;for(let b=0;b<3;b++)s[g+b]+=u[p*3+b]*c,r[g+b]+=h[p*3+b]*c}o=!0}}if(o)for(let a=0;a<r.length;a+=3){let l=Math.hypot(r[a],r[a+1],r[a+2])||1;r[a]/=l,r[a+1]/=l,r[a+2]/=l}return{position:s,normal:r}}var dl=new Map;function Cf(i,e="human"){let t=Vy(e,i);if(!dl.has(t)){let n=Hr(`${t}.pack.png`).then(s=>{let r=s.meshes.map((E,_)=>({mesh:E,i:_})).sort((E,_)=>!!E.mesh.alpha-!!_.mesh.alpha||String(E.mesh.alpha).localeCompare(String(_.mesh.alpha))||String(E.mesh.texture).localeCompare(String(_.mesh.texture))||E.i-_.i),o=r.reduce((E,{mesh:_})=>E+_.count,0),a=E=>new O().setFromMatrixPosition(new Be().fromArray(s.inverseBind,s.joints.indexOf(E)*16).invert()),l=a("neck_01").y+.03,c=new Float32Array(o*3),d=new Float32Array(o*3),u=new Float32Array(o*2),h=new Uint16Array(o*4),p=new Float32Array(o*4),g=new Array(o),b={},m=[],f=0;for(let{mesh:E}of r){let _=Hc(E),{attributes:A}=_;c.set(A.position.array,f*3),d.set(A.normal.array,f*3),A.uv&&u.set(A.uv.array,f*2),h.set(A.skinIndex.array,f*4),p.set(A.skinWeight.array,f*4);for(let I=0;I<E.count;I++){let F=0;for(let X=1;X<4;X++)A.skinWeight.array[I*4+X]>A.skinWeight.array[I*4+F]&&(F=X);let $=Tf[s.joints[A.skinIndex.array[I*4+F]]]??"";g[f+I]=$==="torso"&&A.position.array[I*3+1]>l?"neck":$}let{full:R,far:P}=_.userData.distant??{full:{count:_.index.count}},U=I=>Uint32Array.from(_.index.array.subarray(I.start??0,(I.start??0)+I.count),F=>F+f),k=U(R);for(let[I,F]of Object.entries(Ef(E,f)))(b[I]??=[]).push(F);m.push({...E,start:f,index:k,far:P?U(P):k,group:`${E.alpha||"solid"}:${E.texture}`}),_.dispose(),f+=E.count}let y=new Set,T=new Set,v={brows:[],lashes:[]};for(let E of m){let _=/^underwear-(top|bottom)-(.+)$/u.exec(E.piece??"");_&&(_[1]==="top"?y:T).add(_[2]);let A=/^eye(brows|lashes)-(\d+)$/u.exec(E.piece??"");A&&v[A[1]].push(Number(A[2])),E.piece==="underwear-legacy"&&(T.add("briefs"),i==="female"&&y.add("bra"))}let w=(E,_)=>E.filter(([A])=>_.has(A)).map(([A])=>A),S=new At;return S.setAttribute("position",new Ve(c,3)),S.computeBoundingBox(),S.computeBoundingSphere(),{file:s,sex:i,position:c,normal:d,regions:g,morphs:b,meshes:m,boundingBox:S.boundingBox,boundingSphere:S.boundingSphere,shared:{uv:new Ve(u,2),skinIndex:new Ve(h,4),skinWeight:new Ve(p,4)},indices:new Map,tops:w(Kr,y),bottoms:w(Jr,T),brows:v.brows.sort((E,_)=>E-_),lashes:v.lashes.sort((E,_)=>E-_),eyeUvs:new Map,tucked:{head:a("Head").add(new O(0,.08,0)).toArray(),hips:a("pelvis").toArray()}}});n.catch(()=>dl.delete(t)),dl.set(t,n)}return dl.get(t)}function fh(i,e,t){if(!i.piece)return!0;if(i.piece==="wings")return e.wings;if(i.piece==="tail-tiefling")return e.tail;let n=/^(beard|moustache|tusks|horns)-\d+$/u.exec(i.piece);if(n)return i.piece===e[{tusks:"tusks",horns:"horns"}[n[1]]??"facialHair"];let s=/^eye(brows|lashes)-(\d+)$/u.exec(i.piece);if(s)return Number(s[2])===e[s[1]];let{underwear:r}=e;if(i.piece==="underwear-legacy")return r.bottom==="briefs"||t==="female"&&r.top==="bra";let o=/^underwear-(top|bottom)-(.+)$/u.exec(i.piece);return!!o&&r[o[1]]===o[2]}function Ky(i,e,t){let{underwear:n}=e,s=`${n.top}|${n.bottom}|${e.brows}|${e.lashes}|${e.wings}|${e.facialHair}|${e.tusks}|${e.horns}|${e.tail}|${[...t].sort().join(",")}`;if(!i.indices.has(s)){let r=h=>/^underwear/u.test(h.part)&&(t.has("underwear")||h.piece&&t.has(h.piece.replace(/-[^-]+$/u,"")))?()=>!0:ky.has(h.part)?(p,g,b)=>t.has(i.regions[p])&&t.has(i.regions[g])&&t.has(i.regions[b]):()=>!1,o=[],a=[],l=[],c=(h,p,g)=>{for(let b=0;b<p.length;b+=3){let[m,f,y]=[p[b],p[b+1],p[b+2]];g(m,f,y)||h.push(m,f,y)}};for(let h of i.meshes){if(!fh(h,e,i.sex))continue;let p=r(h);o.at(-1)?.name!==h.group&&o.push({name:h.group,start:a.length,count:0,farStart:l.length,farCount:0,mesh:h}),c(a,h.index,p),c(l,h.far??h.index,p),o.at(-1).count=a.length-o.at(-1).start,o.at(-1).farCount=l.length-o.at(-1).farStart}let d=i.position.length/3>65535?Uint32Array:Uint16Array,u=new d(a.length+l.length);u.set(a),u.set(l,a.length),i.indices.set(s,{index:new Ve(u,1),groups:o.filter(h=>h.count).map(h=>({...h,farStart:a.length+h.farStart}))})}return i.indices.get(s)}function Jy(i,e){if(!i.eyeUvs.has(e)){let t=Yr.findIndex(([a])=>a===e),[n,s]=[t%qr,Math.floor(t/qr)],r=i.shared.uv.array.slice(),o=i.meshes.find(a=>a.part==="iris")?.texture;for(let a of i.meshes.filter(l=>l.texture===o&&!l.alpha))for(let l=a.start;l<a.start+a.count;l++)r[l*2]=(n+r[l*2])/qr,r[l*2+1]=(s+r[l*2+1]*512/384)/qr;i.eyeUvs.set(e,new Ve(r,2))}return i.eyeUvs.get(e)}var Rf="avatar-hair-index.json",If="avatar-outfits-index.json",fl=i=>Hr(i).catch(()=>({}));async function jy(i,e){let t=(await fl(Rf))[i];if(!t?.bodies.includes(e))return null;let n=await Hr(`${t.bundle}.pack.png`).catch(()=>null),s=n?.styles?.[i]?.[e];return s?{key:`hair:${i}:${e}`,part:s,pictures:n.pictures}:null}async function Qy(i,e,t=""){let n=Zn[i],s=n??(await fl(If))[i];if(!s?.bodies.includes(e))return null;let r=await(n?Vc(n.url):Hr(`${s.bundle}.pack.png`)).catch(()=>null),o=r?.pieces?.[i],a=!n&&o?.variants?.[t]?.[e]?o.variants[t]:o;return a?.[e]?{key:`outfit:${i}:${e}:${a===o?"":t}`,piece:i,slot:n?n.slot:o.slot,layer:n?n.layer:o.layer??0,hides:n?n.hides:a.hides??[],part:a[e],pictures:n?[r.pictures??[]].flat().filter(c=>String(c?.name).startsWith(`${n.pack}-`)):r.pictures}:null}var ev=new Set(["brow","face","mouth","ears","fingers","neck","waist","arms"]),dh=new Map;function tv(i,e,t=!1){return dh.has(i)||dh.set(i,e.meshes.map(n=>{let s=Hc(n);if(s.userData.shared=!0,t){let r=s.userData.distant?.full??{start:0,count:s.index.count};s.userData.distant={full:r,far:{start:r.start,count:0}}}return{mesh:n,geometry:s,morphs:Object.fromEntries(Object.entries(Ef(n)).map(([r,o])=>[r,[o]])),colours:new Map}})),dh.get(i)}async function Pf(i,e="human"){let t=e!=="human",n=await Cf(i,e),[s,r]=await Promise.all([fl(Rf),fl(If)]);return{keys:n.file.keys,wings:n.meshes.some(o=>o.piece==="wings"),...Object.fromEntries(Ks.map(([o,a])=>[o,a.map(([l])=>l).filter(l=>n.meshes.some(c=>c.piece===l))])),tail:n.meshes.some(o=>o.piece==="tail-tiefling"),races:Tn.map(([o])=>o).filter(o=>!sl(o).key||n.file.keys.includes(sl(o).key)),tops:n.tops,bottoms:n.bottoms,brows:n.brows,lashes:n.lashes,hair:t?[]:Zs.map(([o])=>o).filter(o=>o===gt||s[o]?.bodies.includes(i)),clothes:Object.entries({...r,...Zn}).filter(([o,a])=>a.bodies.includes(i)&&$t[o]&&!ff.some(([l])=>l===$t[o])).filter(([o])=>!t||!Jc.has($t[o])).map(([o,a])=>({piece:o,slot:a.slot,parts:a.parts[i]??[],variants:t?[]:a.variants??[]}))}}var to=.04,hn=4,nv=8,Lf=(i,e,t)=>i+512<<20|e+512<<10|t+512;function iv(i){if(!i.cells){i.cells=new Map;let e=new Set;for(let{ids:t,delta:n}of i.morphs.ears_pointed??[])for(let s=0;s<t.length;s++)Math.hypot(n[s*3],n[s*3+1],n[s*3+2])>.001&&e.add(t[s]);for(let t of i.meshes)if(!(t.piece||t.part!=="skin"))for(let n=t.start;n<t.start+t.count;n++){if(e.has(n))continue;let s=Lf(Math.floor(i.position[n*3]/to),Math.floor(i.position[n*3+1]/to),Math.floor(i.position[n*3+2]/to));i.cells.has(s)||i.cells.set(s,[]),i.cells.get(s).push(n)}}return i.cells}function Mf(i,e){let t=iv(i),n=i.position,s=e.length/3,r=new Uint32Array(s*hn),o=new Float32Array(s*hn),a=new Float64Array(hn),l=new Uint32Array(hn);for(let c=0;c<s;c++){let[d,u,h]=[e[c*3],e[c*3+1],e[c*3+2]],[p,g,b]=[d,u,h].map(y=>Math.floor(y/to)),m=0;for(let y=1;y<=nv;y++){m=0;for(let T=-y;T<=y;T++)for(let v=-y;v<=y;v++)for(let w=-y;w<=y;w++)for(let S of t.get(Lf(p+T,g+v,b+w))??[]){let E=(n[S*3]-d)**2+(n[S*3+1]-u)**2+(n[S*3+2]-h)**2;if(m===hn&&E>=a[m-1])continue;let _=m<hn?m++:m-1;for(;_>0&&a[_-1]>E;_--)a[_]=a[_-1],l[_]=l[_-1];a[_]=E,l[_]=S}if(m===hn&&a[m-1]<=(y*to)**2)break}let f=0;for(let y=0;y<m;y++)f+=1/(a[y]+1e-6);for(let y=0;y<m;y++)r[c*hn+y]=l[y],o[c*hn+y]=1/(a[y]+1e-6)/f}return{ids:r,shares:o}}function wf(i,e,t,n,s=0){if(i.moves??=new Map,!i.moves.has(e)){let l=new Float32Array(i.position.length);for(let{ids:c,delta:d}of i.morphs[e]??[])for(let u=0;u<c.length;u++)for(let h=0;h<3;h++)l[c[u]*3+h]+=d[u*3+h];i.moves.set(e,l)}let r=i.moves.get(e),o=[],a=[];for(let l=0;l<t.length/3;l++){let c=[0,0,0];for(let d=0;d<hn;d++){let u=n.shares[l*hn+d],h=n.ids[l*hn+d];for(let p=0;p<3;p++)c[p]+=r[h*3+p]*u}Math.max(Math.abs(c[0]),Math.abs(c[1]),Math.abs(c[2]))<1e-4||(o.push(l+s),a.push(...c))}return{ids:Uint32Array.from(o),delta:Float32Array.from(a),normal:new Float32Array(o.length*3)}}function sv(i,e,t,n){let s=new Map;for(let[a,l]of Object.entries(t??{})){let c=n[a]??0;if(c)for(let[d,u]of Object.entries(l))e.has(d)&&(s.has(d)||s.set(d,new O),s.get(d).add(new O(...u).multiplyScalar(c)))}if(!s.size)return null;i.updateMatrixWorld(!0);let r=i.matrixWorld.clone().invert(),o=new Map;for(let[a,l]of e){let c=r.clone().multiply(l.matrixWorld),d=s.get(a);d&&c.premultiply(new Be().makeTranslation(d.x,d.y,d.z)),o.set(a,c)}for(let[a,l]of e){let c=l.parent?.isBone?o.get(l.parent.name):null;(c?c.clone().invert().multiply(o.get(a)):o.get(a)).decompose(l.position,l.quaternion,l.scale)}return i.updateMatrixWorld(!0),new Map([...s].map(([a,l])=>[a,new Be().makeTranslation(-l.x,-l.y,-l.z)]))}async function Nf(i={},e="",t="auto"){let n=$y(e,t,i),s=n.body,r=new Set(n.clothes.map(te=>$t[te])),o=n.clothes.filter(te=>!cl($t[te],r)),a=[...n.nails!=="none"&&!cl("nails",r)?[`nails_${n.nails}`]:[],...n.toenails&&!cl("toenails",r)?["toenails"]:[]],l={...n.clothColours};if(n.colours.nails!==Qi)for(let te of a)l[te]={nail:n.colours.nails};let[c,d,u]=await Promise.all([Cf(s,n.species),n.hair===gt?null:jy(n.hair,s),Promise.all([...o,...a].map(te=>Qy(te,s,n.variants[te])))]),{root:h,bones:p}=Yd(c.file),g=null,b=new Set,m=u.filter(Boolean).sort((te,H)=>te.layer-H.layer);for(let te of m)for(let H of te.hides)b.add(H);let f=b.has("neck")||b.has("torso")||m.some(te=>zy.has(te.slot)),y=Zy(n,s,c.file.keys,f);g=sv(h,p,c.file.jointMoves,y);let T={height:1,legs:1,arms:1,head:1,...tf[n.species]},v=te=>te.startsWith("race_");for(let[te,H]of Object.entries(y))if(!(!H||!(v(te)||te.includes("."))||!c.morphs[te]))for(let G of c.meshes){if(!G.piece||G.morphs?.[te]||!fh(G,n,s)||v(te)&&!/^underwear/u.test(G.piece)||(G.carried??=new Set,G.carried.has(te)))continue;G.carried.add(te);let ae=c.position.subarray(G.start*3,(G.start+G.count)*3);c.morphs[te].push(wf(c,te,ae,G.near??=Mf(c,ae),G.start))}let w=new Map;for(let[te,H]of Object.entries(Hy)){let G=n.limbs[te]*T[te]-1;if(G)for(let[ae,Te]of H){let fe=p.get(Te);if(!p.has(ae)||!fe)continue;let{x:Ne,y:Ze,z:se}=fe.position.clone().normalize();w.set(ae,new Be().set(1+G*Ne*Ne,G*Ne*Ze,G*Ne*se,0,G*Ze*Ne,1+G*Ze*Ze,G*Ze*se,0,G*se*Ne,G*se*Ze,1+G*se*se,0,0,0,0,1)),fe.position.multiplyScalar(1+G)}}let S=n.limbs.head*T.head;S!==1&&w.set("Head",new Be().makeScale(S,S,S)),h.updateMatrixWorld(!0);let E=[],_=(te,H,G,ae=null)=>{let Te=new gr(te,H);return Te.frustumCulled=!1,Te.name=ae?"piece":"body",Te.userData.sharedShadow=!0,h.add(Te),Te.bind(qd(h,p,G,w,ae,g),Te.matrixWorld),Te},{position:A,normal:R}=Sf(c.position,c.normal,c.morphs,y);for(let te of c.meshes){if(!/^(?:beard|moustache|tusks|horns|tail)-/u.test(te.piece??"")||fh(te,n,s))continue;let H=c.tucked[te.piece.startsWith("tail")?"hips":"head"];for(let G=te.start;G<te.start+te.count;G++)A.set(H,G*3)}let P=te=>c.meshes.find(H=>H.part===te)?.texture,U=new Map,k=hf(n.skin,s,n.age);k&&U.set(P("skin"),Gr(k)),n.eyePicture!==Fn&&U.set(P("iris"),Gr("avatar-eyes"));let I=n.species!=="human",F=I||!c.file.keys?null:await _f({sex:s,base:k??P("skin"),skin:n.skin==="custom"?n.colours.skin:Qi,lips:n.colours.lips}).catch(()=>null);F&&U.set(P("skin"),F);let $=new Set(F?["skin","lips"]:[]),X=te=>$.has(te)?Qi:{skin:n.skin==="custom"?n.colours.skin:Qi,underwear:n.colours.underwear,underwear_trim:Mi(n.colours.underwear,0,.3),iris:n.eyePicture===Fn?n.colours.eyes:Qi,eyes:n.colours.eyes,eyebrows:n.colours.brows,eyelashes:I?void 0:Mi(n.colours.brows,0,.5),lips:n.colours.lips,nails:n.colours.nails,fur:n.colours.fur,fur_tufts:n.colours.fur,fur2:n.colours.fur2,fur2_tufts:n.colours.fur2,nose:n.colours.nose,claws:n.colours.claws??n.colours.horns,scales:n.colours.scales,scales2:n.colours.scales2,horns:n.colours.horns,hair:n.hairColour}[te],ne=new Uint16Array(A.length),q=new ke;for(let te of c.meshes){let H=X(te.part);H===void 0?q.setRGB(...te.colour):q.setHex(H);for(let G=te.start;G<te.start+te.count;G++)ne[G*3]=Math.round(q.r*65535),ne[G*3+1]=Math.round(q.g*65535),ne[G*3+2]=Math.round(q.b*65535)}let K=new At;K.setAttribute("position",new Ve(A,3)),K.setAttribute("normal",new Ve(R,3)),K.setAttribute("color",new Ve(ne,3,!0));for(let[te,H]of Object.entries(c.shared))K.setAttribute(te,H);n.eyePicture!==Fn&&K.setAttribute("uv",Jy(c,n.eyePicture));let{index:ee,groups:be}=Ky(c,n,b);K.setIndex(ee),K.userData.distant={groups:!0};let Se=be.map((te,H)=>{K.addGroup(te.start,te.count,H),K.groups[H].distant={full:{start:te.start,count:te.count},far:{start:te.farStart,count:te.farCount}};let G=!!te.mesh.alpha,ae=te.mesh.alpha==="MASK";return new Ns({map:U.get(te.mesh.texture)??(te.mesh.texture?Gr(te.mesh.texture,c.file.pictures):null),vertexColors:!0,side:Nt,...ae?{alphaTest:.5}:G?{transparent:!0,depthWrite:!1,alphaTest:.05}:{}})});K.boundingBox=c.boundingBox.clone(),K.boundingSphere=c.boundingSphere.clone(),_(K,Se,c.file),E.push(()=>{for(let te of Object.keys(c.shared))K.deleteAttribute(te);K.setIndex(null),K.dispose();for(let te of Se)te.dispose()});let tt=({key:te,part:H,pictures:G,slot:ae,piece:Te},fe)=>{for(let Ne of tv(te,H,ev.has(ae))){let{mesh:Ze,geometry:se,morphs:Ue,colours:Ye}=Ne;for(let[qe,it]of Object.entries(y))if(it&&(qe.includes(".")||v(qe))&&!Ue[qe]&&c.morphs[qe]){let L=se.attributes.position.array;Ue[qe]=[wf(c,qe,L,Ne.near??=Mf(c,L))]}let Ie=se,nt=null;if(Ze.partOf){let qe=Ze.parts.map(({part:L})=>l[Te]?.[L]??null),it=qe.join();if(!Ye.has(it)){let L=Ze.parts.map(({colour:C},x)=>qe[x]===null?new ke().setRGB(...C):new ke().setHex(qe[x])),pt=Mn(Uint8Array,Ze.partOf),Qe=new Uint16Array(pt.length*3);pt.forEach((C,x)=>{Qe[x*3]=Math.round(L[C].r*65535),Qe[x*3+1]=Math.round(L[C].g*65535),Qe[x*3+2]=Math.round(L[C].b*65535)}),Ye.set(it,new Ve(Qe,3,!0))}nt=Ye.get(it)}let xt=Object.keys(Ue).length>0;if(xt||nt){let qe=xt?Sf(se.attributes.position.array,se.attributes.normal.array,Ue,y):null,it=["uv","skinIndex","skinWeight",...xt?[]:["position","normal"]];Ie=new At,qe&&(Ie.setAttribute("position",new Ve(qe.position,3)),Ie.setAttribute("normal",new Ve(qe.normal,3)));for(let pt of it)se.attributes[pt]&&Ie.setAttribute(pt,se.attributes[pt]);nt&&(Ie.setAttribute("color",nt),it.push("color")),Ie.setIndex(se.index),Ie.userData.distant=se.userData.distant,Ie.boundingBox=se.boundingBox,Ie.boundingSphere=se.boundingSphere;let L=Ie;E.push(()=>{for(let pt of it)L.deleteAttribute(pt);L.setIndex(null),L.dispose()})}let Dt=new Ns({map:Ze.texture?Gr(Ze.texture,G):null,color:fe(Ze),vertexColors:!!nt,...Ze.alpha?{alphaTest:.5,side:Nt}:{}});E.push(()=>Dt.dispose()),_(Ie,Dt,H,c.file)}};d&&!b.has("hair")&&tt(d,()=>new ke(n.hairColour));for(let te of m)tt(te,H=>H.partOf?16777215:new ke().setRGB(...H.colour));let Ge=Kd(h,p,n.height*T.height);return Ge.dispose=()=>{for(let te of E)te()},Ge.avatar=n,Ge.kit=c,Ge}var Df={POSITION:["byte","byte normalized","unsigned byte","unsigned byte normalized","short","short normalized","unsigned short","unsigned short normalized"],NORMAL:["byte normalized","short normalized"],TANGENT:["byte normalized","short normalized"],TEXCOORD:["byte","byte normalized","unsigned byte","short","short normalized","unsigned short"]},wi=class{constructor(){this.textureUtils=null,this.pluginCallbacks=[],this.register(function(e){return new xh(e)}),this.register(function(e){return new yh(e)}),this.register(function(e){return new Mh(e)}),this.register(function(e){return new wh(e)}),this.register(function(e){return new Th(e)}),this.register(function(e){return new Ah(e)}),this.register(function(e){return new vh(e)}),this.register(function(e){return new bh(e)}),this.register(function(e){return new Sh(e)}),this.register(function(e){return new Eh(e)}),this.register(function(e){return new Ch(e)}),this.register(function(e){return new Rh(e)}),this.register(function(e){return new Ih(e)}),this.register(function(e){return new Ph(e)})}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}setTextureUtils(e){return this.textureUtils=e,this}parse(e,t,n,s){let r=new _h,o=[];for(let a=0,l=this.pluginCallbacks.length;a<l;a++)o.push(this.pluginCallbacks[a](r));r.setPlugins(o),r.setTextureUtils(this.textureUtils),r.writeAsync(e,t,s).catch(n)}parseAsync(e,t){let n=this;return new Promise(function(s,r){n.parse(e,s,r,t)})}},Je={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,BYTE:5120,UNSIGNED_BYTE:5121,SHORT:5122,UNSIGNED_SHORT:5123,INT:5124,UNSIGNED_INT:5125,FLOAT:5126,ARRAY_BUFFER:34962,ELEMENT_ARRAY_BUFFER:34963,NEAREST:9728,LINEAR:9729,NEAREST_MIPMAP_NEAREST:9984,LINEAR_MIPMAP_NEAREST:9985,NEAREST_MIPMAP_LINEAR:9986,LINEAR_MIPMAP_LINEAR:9987,CLAMP_TO_EDGE:33071,MIRRORED_REPEAT:33648,REPEAT:10497},ph="KHR_mesh_quantization",rn={};rn[wt]=Je.NEAREST;rn[sa]=Je.NEAREST_MIPMAP_NEAREST;rn[ki]=Je.NEAREST_MIPMAP_LINEAR;rn[Tt]=Je.LINEAR;rn[zs]=Je.LINEAR_MIPMAP_NEAREST;rn[Dn]=Je.LINEAR_MIPMAP_LINEAR;rn[ln]=Je.CLAMP_TO_EDGE;rn[bs]=Je.REPEAT;rn[Ss]=Je.MIRRORED_REPEAT;var Uf={scale:"scale",position:"translation",quaternion:"rotation",morphTargetInfluences:"weights"},rv=new ke,Of=12,ov=1179937895,av=2,Ff=8,lv=1313821514,cv=5130562;function Jn(i,e){return i.length===e.length&&i.every(function(t,n){return t===e[n]})}function hv(i){return new TextEncoder().encode(i).buffer}function uv(i){return Jn(i.elements,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}function dv(i,e,t){let n={min:new Array(i.itemSize).fill(Number.POSITIVE_INFINITY),max:new Array(i.itemSize).fill(Number.NEGATIVE_INFINITY)};for(let s=e;s<e+t;s++)for(let r=0;r<i.itemSize;r++){let o;i.itemSize>4?o=i.array[s*i.itemSize+r]:(r===0?o=i.getX(s):r===1?o=i.getY(s):r===2?o=i.getZ(s):r===3&&(o=i.getW(s)),i.normalized===!0&&(o=Vi.normalize(o,i.array))),n.min[r]=Math.min(n.min[r],o),n.max[r]=Math.max(n.max[r],o)}return n}function Bf(i){return Math.ceil(i/4)*4}function mh(i,e=0){let t=Bf(i.byteLength);if(t!==i.byteLength){let n=new Uint8Array(t);if(n.set(new Uint8Array(i)),e!==0)for(let s=i.byteLength;s<t;s++)n[s]=e;return n.buffer}return i}function gh(){return typeof document>"u"&&typeof OffscreenCanvas<"u"?new OffscreenCanvas(1,1):document.createElement("canvas")}function fv(i,e){if(typeof OffscreenCanvas<"u"&&i instanceof OffscreenCanvas){let t;return e==="image/jpeg"?t=.92:e==="image/webp"&&(t=.8),i.convertToBlob({type:e,quality:t})}else return new Promise(t=>i.toBlob(t,e))}var _h=class{constructor(){this.plugins=[],this.options={},this.pending=[],this.buffers=[],this.byteOffset=0,this.buffers=[],this.nodeMap=new Map,this.skins=[],this.extensionsUsed={},this.extensionsRequired={},this.uids=new Map,this.uid=0,this.json={asset:{version:"2.0",generator:"THREE.GLTFExporter r186"}},this.cache={meshes:new Map,attributes:new Map,attributesNormalized:new Map,materials:new Map,textures:new Map,images:new Map,normalMaps:new Map},this.textureUtils=null}setPlugins(e){this.plugins=e}setTextureUtils(e){this.textureUtils=e}async writeAsync(e,t,n={}){this.options=Object.assign({binary:!1,trs:!1,onlyVisible:!0,maxTextureSize:1/0,animations:[],includeCustomExtensions:!1,copyright:null},n),this.options.animations.length>0&&(this.options.trs=!0),await this.processInputAsync(e),await Promise.all(this.pending);let s=this,r=s.buffers,o=s.json;n=s.options;let a=s.extensionsUsed,l=s.extensionsRequired,c=new Blob(r,{type:"application/octet-stream"}),d=Object.keys(a),u=Object.keys(l);if(d.length>0&&(o.extensionsUsed=d),u.length>0&&(o.extensionsRequired=u),o.buffers&&o.buffers.length>0&&(o.buffers[0].byteLength=c.size),n.copyright&&(o.asset.copyright=n.copyright),n.binary===!0){let h=new FileReader;h.readAsArrayBuffer(c),h.onloadend=function(){let p=mh(h.result),g=new DataView(new ArrayBuffer(Ff));g.setUint32(0,p.byteLength,!0),g.setUint32(4,cv,!0);let b=mh(hv(JSON.stringify(o)),32),m=new DataView(new ArrayBuffer(Ff));m.setUint32(0,b.byteLength,!0),m.setUint32(4,lv,!0);let f=new ArrayBuffer(Of),y=new DataView(f);y.setUint32(0,ov,!0),y.setUint32(4,av,!0);let T=Of+m.byteLength+b.byteLength+g.byteLength+p.byteLength;y.setUint32(8,T,!0);let v=new Blob([f,m,b,g,p],{type:"application/octet-stream"}),w=new FileReader;w.readAsArrayBuffer(v),w.onloadend=function(){t(w.result)}}}else if(o.buffers&&o.buffers.length>0){let h=new FileReader;h.readAsDataURL(c),h.onloadend=function(){let p=h.result;o.buffers[0].uri=p,t(o)}}else t(o)}serializeUserData(e,t){if(Object.keys(e.userData).length===0)return;let n=this.options,s=this.extensionsUsed;try{let r=JSON.parse(JSON.stringify(e.userData));if(n.includeCustomExtensions&&r.gltfExtensions){t.extensions===void 0&&(t.extensions={});for(let o in r.gltfExtensions)t.extensions[o]=r.gltfExtensions[o],s[o]=!0;delete r.gltfExtensions}Object.keys(r).length>0&&(t.extras=r)}catch(r){console.warn("THREE.GLTFExporter: userData of '"+e.name+"' won't be serialized because of JSON.stringify error - "+r.message)}}getUID(e,t=!1){if(this.uids.has(e)===!1){let s=new Map;s.set(!0,this.uid++),s.set(!1,this.uid++),this.uids.set(e,s)}return this.uids.get(e).get(t)}isNormalizedNormalAttribute(e){if(this.cache.attributesNormalized.has(e))return!1;let n=new O;for(let s=0,r=e.count;s<r;s++)if(Math.abs(n.fromBufferAttribute(e,s).length()-1)>5e-4)return!1;return!0}createNormalizedNormalAttribute(e){let t=this.cache;if(t.attributesNormalized.has(e))return t.attributesNormalized.get(e);let n=e.clone(),s=new O;for(let r=0,o=n.count;r<o;r++)s.fromBufferAttribute(n,r),s.x===0&&s.y===0&&s.z===0?s.setX(1):s.normalize(),n.setXYZ(r,s.x,s.y,s.z);return t.attributesNormalized.set(e,n),n}applyTextureTransform(e,t){let n=!1,s={};(t.offset.x!==0||t.offset.y!==0)&&(s.offset=t.offset.toArray(),n=!0),t.rotation!==0&&(s.rotation=t.rotation,n=!0),(t.repeat.x!==1||t.repeat.y!==1)&&(s.scale=t.repeat.toArray(),n=!0),n&&(e.extensions=e.extensions||{},e.extensions.KHR_texture_transform=s,this.extensionsUsed.KHR_texture_transform=!0)}async buildMetalRoughTextureAsync(e,t){if(e===t)return e;function n(p){return p.colorSpace===bt?function(b){return b<.04045?b*.0773993808:Math.pow(b*.9478672986+.0521327014,2.4)}:function(b){return b}}e instanceof ci&&(e=await this.decompressTextureAsync(e)),t instanceof ci&&(t=await this.decompressTextureAsync(t));let s=e?e.image:null,r=t?t.image:null,o=Math.max(s?s.width:0,r?r.width:0),a=Math.max(s?s.height:0,r?r.height:0),l=gh();l.width=o,l.height=a;let c=l.getContext("2d",{willReadFrequently:!0});c.fillStyle="#00ffff",c.fillRect(0,0,o,a);let d=c.getImageData(0,0,o,a);if(s){c.drawImage(s,0,0,o,a);let p=n(e),g=c.getImageData(0,0,o,a).data;for(let b=2;b<g.length;b+=4)d.data[b]=p(g[b]/256)*256}if(r){c.drawImage(r,0,0,o,a);let p=n(t),g=c.getImageData(0,0,o,a).data;for(let b=1;b<g.length;b+=4)d.data[b]=p(g[b]/256)*256}c.putImageData(d,0,0);let h=(e||t).clone();return h.source=new Xn(l),h.colorSpace=Sn,h.channel=(e||t).channel,e&&t&&e.channel!==t.channel&&console.warn("THREE.GLTFExporter: UV channels for metalnessMap and roughnessMap textures must match."),console.warn("THREE.GLTFExporter: Merged metalnessMap and roughnessMap textures."),h}async buildNormalMapTextureAsync(e,t,n){e instanceof ci&&(e=await this.decompressTextureAsync(e));let s=e.image,r=gh();r.width=s.width,r.height=s.height;let o=r.getContext("2d",{willReadFrequently:!0});o.drawImage(s,0,0,r.width,r.height);let a=o.getImageData(0,0,r.width,r.height),l=a.data;for(let d=0;d<l.length;d+=4)t&&(l[d+0]=255-l[d+0]),n&&(l[d+1]=255-l[d+1]);o.putImageData(a,0,0);let c=e.clone();return c.source=new Xn(r),c}async decompressTextureAsync(e,t=1/0){if(this.textureUtils===null)throw new Error("THREE.GLTFExporter: setTextureUtils() must be called to process compressed textures.");return await this.textureUtils.decompress(e,t)}processBuffer(e){let t=this.json,n=this.buffers;return t.buffers||(t.buffers=[{byteLength:0}]),n.push(e),0}processBufferView(e,t,n,s,r){let o=this.json;o.bufferViews||(o.bufferViews=[]);let a;switch(t){case Je.BYTE:case Je.UNSIGNED_BYTE:a=1;break;case Je.SHORT:case Je.UNSIGNED_SHORT:a=2;break;default:a=4}let l=e.itemSize*a;r===Je.ARRAY_BUFFER&&(l=Math.ceil(l/4)*4);let c=Bf(s*l),d=new DataView(new ArrayBuffer(c)),u=0;for(let g=n;g<n+s;g++){for(let b=0;b<e.itemSize;b++){let m;e.itemSize>4?m=e.array[g*e.itemSize+b]:(b===0?m=e.getX(g):b===1?m=e.getY(g):b===2?m=e.getZ(g):b===3&&(m=e.getW(g)),e.normalized===!0&&(m=Vi.normalize(m,e.array))),t===Je.FLOAT?d.setFloat32(u,m,!0):t===Je.INT?d.setInt32(u,m,!0):t===Je.UNSIGNED_INT?d.setUint32(u,m,!0):t===Je.SHORT?d.setInt16(u,m,!0):t===Je.UNSIGNED_SHORT?d.setUint16(u,m,!0):t===Je.BYTE?d.setInt8(u,m):t===Je.UNSIGNED_BYTE&&d.setUint8(u,m),u+=a}u%l!==0&&(u+=l-u%l)}let h={buffer:this.processBuffer(d.buffer),byteOffset:this.byteOffset,byteLength:c};return r!==void 0&&(h.target=r),r===Je.ARRAY_BUFFER&&(h.byteStride=l),this.byteOffset+=c,o.bufferViews.push(h),{id:o.bufferViews.length-1,byteLength:0}}processBufferViewImage(e){let t=this,n=t.json;return n.bufferViews||(n.bufferViews=[]),new Promise(function(s){let r=new FileReader;r.readAsArrayBuffer(e),r.onloadend=function(){let o=mh(r.result),a={buffer:t.processBuffer(o),byteOffset:t.byteOffset,byteLength:o.byteLength};t.byteOffset+=o.byteLength,s(n.bufferViews.push(a)-1)}})}processAccessor(e,t,n,s){let r=this.json,o={1:"SCALAR",2:"VEC2",3:"VEC3",4:"VEC4",9:"MAT3",16:"MAT4"},a;if(e.array.constructor===Float32Array)a=Je.FLOAT;else if(e.array.constructor===Int32Array)a=Je.INT;else if(e.array.constructor===Uint32Array)a=Je.UNSIGNED_INT;else if(e.array.constructor===Int16Array)a=Je.SHORT;else if(e.array.constructor===Uint16Array)a=Je.UNSIGNED_SHORT;else if(e.array.constructor===Int8Array)a=Je.BYTE;else if(e.array.constructor===Uint8Array)a=Je.UNSIGNED_BYTE;else throw new Error("THREE.GLTFExporter: Unsupported bufferAttribute component type: "+e.array.constructor.name);if(n===void 0&&(n=0),(s===void 0||s===1/0)&&(s=e.count),s===0)return null;let l=dv(e,n,s),c;t!==void 0&&(c=e===t.index?Je.ELEMENT_ARRAY_BUFFER:Je.ARRAY_BUFFER);let d=this.processBufferView(e,a,n,s,c),u={bufferView:d.id,byteOffset:d.byteOffset,componentType:a,count:s,max:l.max,min:l.min,type:o[e.itemSize]};return e.normalized===!0&&(u.normalized=!0),r.accessors||(r.accessors=[]),r.accessors.push(u)-1}processImage(e,t,n,s="image/png"){if(e!==null){let r=this,o=r.cache,a=r.json,l=r.options,c=r.pending;o.images.has(e)||o.images.set(e,{});let d=o.images.get(e),u=s+":flipY/"+n.toString();if(d[u]!==void 0)return d[u];a.images||(a.images=[]);let h={mimeType:s},p=gh();p.width=Math.min(e.width,l.maxTextureSize),p.height=Math.min(e.height,l.maxTextureSize);let g=p.getContext("2d",{willReadFrequently:!0});if(n===!0&&(g.translate(0,p.height),g.scale(1,-1)),e.data!==void 0){t!==qt&&console.error("GLTFExporter: Only RGBAFormat is supported.",t),(e.width>l.maxTextureSize||e.height>l.maxTextureSize)&&console.warn("GLTFExporter: Image size is bigger than maxTextureSize",e);let m=new Uint8ClampedArray(e.height*e.width*4);for(let f=0;f<m.length;f+=4)m[f+0]=e.data[f+0],m[f+1]=e.data[f+1],m[f+2]=e.data[f+2],m[f+3]=e.data[f+3];g.putImageData(new ImageData(m,e.width,e.height),0,0)}else if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap||typeof OffscreenCanvas<"u"&&e instanceof OffscreenCanvas)g.drawImage(e,0,0,p.width,p.height);else throw new Error("THREE.GLTFExporter: Invalid image type. Use HTMLImageElement, HTMLCanvasElement, ImageBitmap or OffscreenCanvas.");l.binary===!0?c.push(fv(p,s).then(m=>r.processBufferViewImage(m)).then(m=>{h.bufferView=m})):h.uri=Cs.getDataURL(p,s);let b=a.images.push(h)-1;return d[u]=b,b}else throw new Error("THREE.GLTFExporter: No valid image data found. Unable to process texture.")}processSampler(e){let t=this.json;t.samplers||(t.samplers=[]);let n={magFilter:rn[e.magFilter],minFilter:rn[e.minFilter],wrapS:rn[e.wrapS],wrapT:rn[e.wrapT]};return t.samplers.push(n)-1}async processTextureAsync(e){let n=this.options,s=this.cache,r=this.json;if(s.textures.has(e))return s.textures.get(e);r.textures||(r.textures=[]),e instanceof ci&&(e=await this.decompressTextureAsync(e,n.maxTextureSize));let o=e.userData.mimeType,a=this.processImage(e.image,e.format,e.flipY,o),l={sampler:this.processSampler(e)};o==="image/webp"?(l.extensions=l.extensions||{},l.extensions.EXT_texture_webp={source:a},this.extensionsUsed.EXT_texture_webp=!0,this.extensionsRequired.EXT_texture_webp=!0):l.source=a,e.name&&(l.name=e.name),await this._invokeAllAsync(async function(d){d.writeTexture&&await d.writeTexture(e,l)});let c=r.textures.push(l)-1;return s.textures.set(e,c),c}async processMaterialAsync(e,t){let n=this.cache,s=this.json,r=t!==void 0&&t.hasAttribute("tangent"),o=e.normalMap?e.uuid+":"+r:e.uuid;if(n.materials.has(o))return n.materials.get(o);if(e.isShaderMaterial)return console.warn("GLTFExporter: THREE.ShaderMaterial not supported."),null;s.materials||(s.materials=[]);let a={pbrMetallicRoughness:{}};e.isMeshStandardMaterial!==!0&&e.isMeshBasicMaterial!==!0&&console.warn("GLTFExporter: Use MeshStandardMaterial or MeshBasicMaterial for best results.");let l=e.color.toArray().concat([e.opacity]);if(Jn(l,[1,1,1,1])||(a.pbrMetallicRoughness.baseColorFactor=l),e.isMeshStandardMaterial?(a.pbrMetallicRoughness.metallicFactor=e.metalness,a.pbrMetallicRoughness.roughnessFactor=e.roughness):(a.pbrMetallicRoughness.metallicFactor=0,a.pbrMetallicRoughness.roughnessFactor=1),e.metalnessMap||e.roughnessMap){let d=await this.buildMetalRoughTextureAsync(e.metalnessMap,e.roughnessMap),u={index:await this.processTextureAsync(d),texCoord:d.channel};this.applyTextureTransform(u,d),a.pbrMetallicRoughness.metallicRoughnessTexture=u}if(e.map){let d={index:await this.processTextureAsync(e.map),texCoord:e.map.channel};this.applyTextureTransform(d,e.map),a.pbrMetallicRoughness.baseColorTexture=d}if(e.emissive){let d=e.emissive;if(Math.max(d.r,d.g,d.b)>0&&(a.emissiveFactor=e.emissive.toArray()),e.emissiveMap){let h={index:await this.processTextureAsync(e.emissiveMap),texCoord:e.emissiveMap.channel};this.applyTextureTransform(h,e.emissiveMap),a.emissiveTexture=h}}if(e.normalMap){let d=e.normalScale,u=d.x<0,h=r?d.y<0:d.y>0,p=e.normalMap;if(u||h){n.normalMaps.has(e.normalMap)===!1&&n.normalMaps.set(e.normalMap,{});let b=n.normalMaps.get(e.normalMap),m=`${u}:${h}`;b[m]===void 0&&(b[m]=await this.buildNormalMapTextureAsync(e.normalMap,u,h)),p=b[m]}let g={index:await this.processTextureAsync(p),texCoord:e.normalMap.channel};Math.abs(d.x)!==1&&(g.scale=Math.abs(d.x)),this.applyTextureTransform(g,e.normalMap),a.normalTexture=g}if(e.aoMap){let d={index:await this.processTextureAsync(e.aoMap),texCoord:e.aoMap.channel};e.aoMapIntensity!==1&&(d.strength=e.aoMapIntensity),this.applyTextureTransform(d,e.aoMap),a.occlusionTexture=d}e.transparent?a.alphaMode="BLEND":e.alphaTest>0&&(a.alphaMode="MASK",a.alphaCutoff=e.alphaTest),e.side===Nt&&(a.doubleSided=!0),e.name!==""&&(a.name=e.name),this.serializeUserData(e,a),await this._invokeAllAsync(async function(d){d.writeMaterialAsync&&await d.writeMaterialAsync(e,a)});let c=s.materials.push(a)-1;return n.materials.set(o,c),c}async processMeshAsync(e){let t=this.cache,n=this.json,s=[e.geometry.uuid];if(Array.isArray(e.material))for(let v=0,w=e.material.length;v<w;v++)s.push(e.material[v].uuid);else s.push(e.material.uuid);let r=s.join(":");if(t.meshes.has(r))return t.meshes.get(r);let o=e.geometry,a;e.isLineSegments?a=Je.LINES:e.isLineLoop?a=Je.LINE_LOOP:e.isLine?a=Je.LINE_STRIP:e.isPoints?a=Je.POINTS:a=e.material.wireframe?Je.LINES:Je.TRIANGLES;let l={},c={},d=[],u=[],h={uv:"TEXCOORD_0",uv1:"TEXCOORD_1",uv2:"TEXCOORD_2",uv3:"TEXCOORD_3",color:"COLOR_0",skinWeight:"WEIGHTS_0",skinIndex:"JOINTS_0"},p=o.getAttribute("normal");p!==void 0&&!this.isNormalizedNormalAttribute(p)&&(console.warn("THREE.GLTFExporter: Creating normalized normal attribute from the non-normalized one."),o.setAttribute("normal",this.createNormalizedNormalAttribute(p)));let g=null;for(let v in o.attributes){if(v.slice(0,5)==="morph")continue;let w=o.attributes[v];if(v=h[v]||v.toUpperCase(),!/^(POSITION|NORMAL|TANGENT|TEXCOORD_\d+|COLOR_\d+|JOINTS_\d+|WEIGHTS_\d+)$/.test(v)&&!v.startsWith("_")&&(v="_"+v),t.attributes.has(this.getUID(w))){c[v]=t.attributes.get(this.getUID(w));continue}g=null;let E=w.array;v==="JOINTS_0"&&!(E instanceof Uint16Array)&&!(E instanceof Uint8Array)?(console.warn('GLTFExporter: Attribute "skinIndex" converted to type UNSIGNED_SHORT.'),g=wi.Utils.toTypedBufferAttribute(w,Uint16Array)):(E instanceof Uint32Array||E instanceof Int32Array)&&!v.startsWith("_")&&(console.warn(`GLTFExporter: Attribute "${v}" converted to type FLOAT.`),g=wi.Utils.toTypedBufferAttribute(w,Float32Array));let _=this.processAccessor(g||w,o);_!==null&&(v.startsWith("_")||this.detectMeshQuantization(v,w),c[v]=_,t.attributes.set(this.getUID(w),_))}if(p!==void 0&&o.setAttribute("normal",p),Object.keys(c).length===0)return null;if(e.morphTargetInfluences!==void 0&&e.morphTargetInfluences.length>0){let v=[],w=[],S={};if(e.morphTargetDictionary!==void 0)for(let E in e.morphTargetDictionary)S[e.morphTargetDictionary[E]]=E;for(let E=0;E<e.morphTargetInfluences.length;++E){let _={},A=!1;for(let R in o.morphAttributes){if(R!=="position"&&R!=="normal"){A||(console.warn("GLTFExporter: Only POSITION and NORMAL morph are supported."),A=!0);continue}let P=o.morphAttributes[R][E],U=R.toUpperCase(),k=o.attributes[R];if(t.attributes.has(this.getUID(P,!0))){_[U]=t.attributes.get(this.getUID(P,!0));continue}let I=P.clone();if(!o.morphTargetsRelative)for(let F=0,$=P.count;F<$;F++)for(let X=0;X<P.itemSize;X++)X===0&&I.setX(F,P.getX(F)-k.getX(F)),X===1&&I.setY(F,P.getY(F)-k.getY(F)),X===2&&I.setZ(F,P.getZ(F)-k.getZ(F)),X===3&&I.setW(F,P.getW(F)-k.getW(F));_[U]=this.processAccessor(I,o),t.attributes.set(this.getUID(k,!0),_[U])}u.push(_),v.push(e.morphTargetInfluences[E]),e.morphTargetDictionary!==void 0&&w.push(S[E])}l.weights=v,w.length>0&&(l.extras={},l.extras.targetNames=w)}let b=Array.isArray(e.material);if(b&&o.groups.length===0)return null;let m=!1;if(b&&o.index===null){let v=[];for(let w=0,S=o.attributes.position.count;w<S;w++)v[w]=w;o.setIndex(v),m=!0}let f=b?e.material:[e.material],y=b?o.groups:[{materialIndex:0,start:void 0,count:void 0}];for(let v=0,w=y.length;v<w;v++){let S={mode:a,attributes:c};if(this.serializeUserData(o,S),u.length>0&&(S.targets=u),o.index!==null){let _=this.getUID(o.index);(y[v].start!==void 0||y[v].count!==void 0)&&(_+=":"+y[v].start+":"+y[v].count),t.attributes.has(_)?S.indices=t.attributes.get(_):(S.indices=this.processAccessor(o.index,o,y[v].start,y[v].count),t.attributes.set(_,S.indices)),S.indices===null&&delete S.indices}let E=await this.processMaterialAsync(f[y[v].materialIndex],o);E!==null&&(S.material=E),d.push(S)}m===!0&&o.setIndex(null),l.primitives=d,n.meshes||(n.meshes=[]),await this._invokeAllAsync(function(v){v.writeMesh&&v.writeMesh(e,l)});let T=n.meshes.push(l)-1;return t.meshes.set(r,T),T}detectMeshQuantization(e,t){if(this.extensionsUsed[ph])return;let n;switch(t.array.constructor){case Int8Array:n="byte";break;case Uint8Array:n="unsigned byte";break;case Int16Array:n="short";break;case Uint16Array:n="unsigned short";break;default:return}t.normalized&&(n+=" normalized");let s=e.split("_",1)[0];Df[s]&&Df[s].includes(n)&&(this.extensionsUsed[ph]=!0,this.extensionsRequired[ph]=!0)}processCamera(e){let t=this.json;t.cameras||(t.cameras=[]);let n=e.isOrthographicCamera,s={type:n?"orthographic":"perspective"};return n?s.orthographic={xmag:e.right*2,ymag:e.top*2,zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near}:s.perspective={aspectRatio:e.aspect,yfov:Vi.degToRad(e.fov),zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near},e.name!==""&&(s.name=e.type),t.cameras.push(s)-1}processAnimation(e,t){let n=this.json,s=this.nodeMap;n.animations||(n.animations=[]),e=wi.Utils.mergeMorphTargetTracks(e.clone(),t);let r=e.tracks,o=[],a=[];for(let c=0;c<r.length;++c){let d=r[c],u=ot.parseTrackName(d.name),h=ot.findNode(t,u.nodeName),p=Uf[u.propertyName];if(u.objectName==="bones"&&(h.isSkinnedMesh===!0?h=h.skeleton.getBoneByName(u.objectIndex):h=void 0),!h||!p){console.warn('THREE.GLTFExporter: Could not export animation track "%s".',d.name);continue}let g=1,b=d.values.length/d.times.length;p===Uf.morphTargetInfluences&&(b/=h.morphTargetInfluences.length);let m;d.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline===!0?(m="CUBICSPLINE",b/=3):d.getInterpolation()===Li?m="STEP":m="LINEAR",a.push({input:this.processAccessor(new Ve(d.times,g)),output:this.processAccessor(new Ve(d.values,b)),interpolation:m}),o.push({sampler:a.length-1,target:{node:s.get(h),path:p}})}let l={name:e.name||"clip_"+n.animations.length,samplers:a,channels:o};return this.serializeUserData(e,l),n.animations.push(l),n.animations.length-1}processSkin(e){let t=this.json,n=this.nodeMap,s=t.nodes[n.get(e)],r=e.skeleton;if(r===void 0)return null;let o=e.skeleton.bones[0];if(o===void 0)return null;let a=[],l=new Float32Array(r.bones.length*16),c=new Be;for(let u=0;u<r.bones.length;++u)a.push(n.get(r.bones[u])),c.copy(r.boneInverses[u]),c.multiply(e.bindMatrix).toArray(l,u*16);return t.skins===void 0&&(t.skins=[]),t.skins.push({inverseBindMatrices:this.processAccessor(new Ve(l,16)),joints:a,skeleton:n.get(o)}),s.skin=t.skins.length-1}async processNodeAsync(e){let t=this.json,n=this.options,s=this.nodeMap;if(t.nodes||(t.nodes=[]),e.pivot!==null)return await this._processNodeWithPivotAsync(e);let r={};if(n.trs){let a=e.quaternion.toArray(),l=e.position.toArray(),c=e.scale.toArray();Jn(a,[0,0,0,1])||(r.rotation=a),Jn(l,[0,0,0])||(r.translation=l),Jn(c,[1,1,1])||(r.scale=c)}else e.matrixAutoUpdate&&e.updateMatrix(),uv(e.matrix)===!1&&(r.matrix=e.matrix.elements);if(e.name!==""&&(r.name=String(e.name)),this.serializeUserData(e,r),e.isMesh||e.isLine||e.isPoints){let a=await this.processMeshAsync(e);a!==null&&(r.mesh=a)}else e.isCamera&&(r.camera=this.processCamera(e));e.isSkinnedMesh&&this.skins.push(e);let o=t.nodes.push(r)-1;if(s.set(e,o),e.children.length>0){let a=[];for(let l=0,c=e.children.length;l<c;l++){let d=e.children[l];if(d.visible||n.onlyVisible===!1){let u=await this.processNodeAsync(d);u!==null&&a.push(u)}}a.length>0&&(r.children=a)}return await this._invokeAllAsync(function(a){a.writeNode&&a.writeNode(e,r)}),o}async _processNodeWithPivotAsync(e){let t=this.json,n=this.options,s=this.nodeMap,r=e.pivot,o={},a=e.quaternion.toArray(),l=[e.position.x+r.x,e.position.y+r.y,e.position.z+r.z],c=e.scale.toArray();Jn(a,[0,0,0,1])||(o.rotation=a),Jn(l,[0,0,0])||(o.translation=l),Jn(c,[1,1,1])||(o.scale=c),o.extras={pivot:r.toArray()},e.name!==""&&(o.name=String(e.name)),this.serializeUserData(e,o);let d=t.nodes.push(o)-1;s.set(e,d);let u={},h=[-r.x,-r.y,-r.z];if(Jn(h,[0,0,0])||(u.translation=h),e.isMesh||e.isLine||e.isPoints){let b=await this.processMeshAsync(e);b!==null&&(u.mesh=b)}else e.isCamera&&(u.camera=this.processCamera(e));e.isSkinnedMesh&&this.skins.push(e);let g=[t.nodes.push(u)-1];if(e.children.length>0){let b=[];for(let m=0,f=e.children.length;m<f;m++){let y=e.children[m];if(y.visible||n.onlyVisible===!1){let T=await this.processNodeAsync(y);T!==null&&b.push(T)}}b.length>0&&(u.children=b)}return o.children=g,await this._invokeAllAsync(function(b){b.writeNode&&b.writeNode(e,o)}),d}async processSceneAsync(e){let t=this.json,n=this.options;t.scenes||(t.scenes=[],t.scene=0);let s={};e.name!==""&&(s.name=e.name),t.scenes.push(s);let r=[];for(let o=0,a=e.children.length;o<a;o++){let l=e.children[o];if(l.visible||n.onlyVisible===!1){let c=await this.processNodeAsync(l);c!==null&&r.push(c)}}r.length>0&&(s.nodes=r),this.serializeUserData(e,s)}async processObjectsAsync(e){let t=new ai;t.name="AuxScene";for(let n=0;n<e.length;n++)t.children.push(e[n]);await this.processSceneAsync(t)}async processInputAsync(e){let t=this.options;e=e instanceof Array?e:[e],await this._invokeAllAsync(function(s){s.beforeParse&&s.beforeParse(e)});let n=[];for(let s=0;s<e.length;s++)e[s]instanceof ai?await this.processSceneAsync(e[s]):n.push(e[s]);n.length>0&&await this.processObjectsAsync(n);for(let s=0;s<this.skins.length;++s)this.processSkin(this.skins[s]);if(e.length===1)for(let s=0;s<t.animations.length;++s)this.processAnimation(t.animations[s],e[0]);else for(let s=0;s<e.length;s++){let r=t.animations[s]||[];for(let o=0;o<r.length;++o)this.processAnimation(r[o],e[s])}await this._invokeAllAsync(function(s){s.afterParse&&s.afterParse(e)})}async _invokeAllAsync(e){for(let t=0,n=this.plugins.length;t<n;t++)await e(this.plugins[t])}},xh=class{constructor(e){this.writer=e,this.name="KHR_lights_punctual"}writeNode(e,t){if(!e.isLight)return;if(!e.isDirectionalLight&&!e.isPointLight&&!e.isSpotLight){console.warn("THREE.GLTFExporter: Only directional, point, and spot lights are supported.",e);return}let n=this.writer,s=n.json,r=n.extensionsUsed,o={};e.name&&(o.name=e.name),o.color=e.color.toArray(),o.intensity=e.intensity,e.isDirectionalLight?o.type="directional":e.isPointLight?(o.type="point",e.distance>0&&(o.range=e.distance)):e.isSpotLight&&(o.type="spot",e.distance>0&&(o.range=e.distance),o.spot={},o.spot.innerConeAngle=(1-e.penumbra)*e.angle,o.spot.outerConeAngle=e.angle),e.decay!==void 0&&e.decay!==2&&console.warn("THREE.GLTFExporter: Light decay may be lost. glTF is physically-based, and expects light.decay=2."),e.target&&(e.target.parent!==e||e.target.position.x!==0||e.target.position.y!==0||e.target.position.z!==-1)&&console.warn("THREE.GLTFExporter: Light direction may be lost. For best results, make light.target a child of the light with position 0,0,-1."),r[this.name]||(s.extensions=s.extensions||{},s.extensions[this.name]={lights:[]},r[this.name]=!0);let a=s.extensions[this.name].lights;a.push(o),t.extensions=t.extensions||{},t.extensions[this.name]={light:a.length-1}}},yh=class{constructor(e){this.writer=e,this.name="KHR_materials_unlit"}async writeMaterialAsync(e,t){if(!e.isMeshBasicMaterial)return;let s=this.writer.extensionsUsed;t.extensions=t.extensions||{},t.extensions[this.name]={},s[this.name]=!0,t.pbrMetallicRoughness.metallicFactor=0,t.pbrMetallicRoughness.roughnessFactor=.9}},vh=class{constructor(e){this.writer=e,this.name="KHR_materials_clearcoat"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.clearcoat===0)return;let n=this.writer,s=n.extensionsUsed,r={};if(r.clearcoatFactor=e.clearcoat,e.clearcoatMap){let o={index:await n.processTextureAsync(e.clearcoatMap),texCoord:e.clearcoatMap.channel};n.applyTextureTransform(o,e.clearcoatMap),r.clearcoatTexture=o}if(r.clearcoatRoughnessFactor=e.clearcoatRoughness,e.clearcoatRoughnessMap){let o={index:await n.processTextureAsync(e.clearcoatRoughnessMap),texCoord:e.clearcoatRoughnessMap.channel};n.applyTextureTransform(o,e.clearcoatRoughnessMap),r.clearcoatRoughnessTexture=o}if(e.clearcoatNormalMap){let o={index:await n.processTextureAsync(e.clearcoatNormalMap),texCoord:e.clearcoatNormalMap.channel};e.clearcoatNormalScale.x!==1&&(o.scale=e.clearcoatNormalScale.x),n.applyTextureTransform(o,e.clearcoatNormalMap),r.clearcoatNormalTexture=o}t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},bh=class{constructor(e){this.writer=e,this.name="KHR_materials_dispersion"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.dispersion===0)return;let s=this.writer.extensionsUsed,r={};r.dispersion=e.dispersion,t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Sh=class{constructor(e){this.writer=e,this.name="KHR_materials_iridescence"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.iridescence===0)return;let n=this.writer,s=n.extensionsUsed,r={};if(r.iridescenceFactor=e.iridescence,e.iridescenceMap){let o={index:await n.processTextureAsync(e.iridescenceMap),texCoord:e.iridescenceMap.channel};n.applyTextureTransform(o,e.iridescenceMap),r.iridescenceTexture=o}if(r.iridescenceIor=e.iridescenceIOR,r.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],r.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1],e.iridescenceThicknessMap){let o={index:await n.processTextureAsync(e.iridescenceThicknessMap),texCoord:e.iridescenceThicknessMap.channel};n.applyTextureTransform(o,e.iridescenceThicknessMap),r.iridescenceThicknessTexture=o}t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Mh=class{constructor(e){this.writer=e,this.name="KHR_materials_transmission"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.transmission===0)return;let n=this.writer,s=n.extensionsUsed,r={};if(r.transmissionFactor=e.transmission,e.transmissionMap){let o={index:await n.processTextureAsync(e.transmissionMap),texCoord:e.transmissionMap.channel};n.applyTextureTransform(o,e.transmissionMap),r.transmissionTexture=o}t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},wh=class{constructor(e){this.writer=e,this.name="KHR_materials_volume"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.transmission===0)return;let n=this.writer,s=n.extensionsUsed,r={};if(r.thicknessFactor=e.thickness,e.thicknessMap){let o={index:await n.processTextureAsync(e.thicknessMap),texCoord:e.thicknessMap.channel};n.applyTextureTransform(o,e.thicknessMap),r.thicknessTexture=o}e.attenuationDistance!==1/0&&(r.attenuationDistance=e.attenuationDistance),r.attenuationColor=e.attenuationColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Th=class{constructor(e){this.writer=e,this.name="KHR_materials_ior"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.ior===1.5)return;let s=this.writer.extensionsUsed,r={};r.ior=e.ior,t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Ah=class{constructor(e){this.writer=e,this.name="KHR_materials_specular"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.specularIntensity===1&&e.specularColor.equals(rv)&&!e.specularIntensityMap&&!e.specularColorMap)return;let n=this.writer,s=n.extensionsUsed,r={};if(e.specularIntensityMap){let o={index:await n.processTextureAsync(e.specularIntensityMap),texCoord:e.specularIntensityMap.channel};n.applyTextureTransform(o,e.specularIntensityMap),r.specularTexture=o}if(e.specularColorMap){let o={index:await n.processTextureAsync(e.specularColorMap),texCoord:e.specularColorMap.channel};n.applyTextureTransform(o,e.specularColorMap),r.specularColorTexture=o}r.specularFactor=e.specularIntensity,r.specularColorFactor=e.specularColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Eh=class{constructor(e){this.writer=e,this.name="KHR_materials_sheen"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.sheen==0)return;let n=this.writer,s=n.extensionsUsed,r={};if(e.sheenRoughnessMap){let o={index:await n.processTextureAsync(e.sheenRoughnessMap),texCoord:e.sheenRoughnessMap.channel};n.applyTextureTransform(o,e.sheenRoughnessMap),r.sheenRoughnessTexture=o}if(e.sheenColorMap){let o={index:await n.processTextureAsync(e.sheenColorMap),texCoord:e.sheenColorMap.channel};n.applyTextureTransform(o,e.sheenColorMap),r.sheenColorTexture=o}r.sheenRoughnessFactor=e.sheenRoughness,r.sheenColorFactor=e.sheenColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Ch=class{constructor(e){this.writer=e,this.name="KHR_materials_anisotropy"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.anisotropy==0)return;let n=this.writer,s=n.extensionsUsed,r={};if(e.anisotropyMap){let o={index:await n.processTextureAsync(e.anisotropyMap)};n.applyTextureTransform(o,e.anisotropyMap),r.anisotropyTexture=o}r.anisotropyStrength=e.anisotropy,r.anisotropyRotation=e.anisotropyRotation,t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Rh=class{constructor(e){this.writer=e,this.name="KHR_materials_emissive_strength"}async writeMaterialAsync(e,t){if(!e.isMeshStandardMaterial||e.emissiveIntensity===1)return;let s=this.writer.extensionsUsed,r={};r.emissiveStrength=e.emissiveIntensity,t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Ih=class{constructor(e){this.writer=e,this.name="EXT_materials_bump"}async writeMaterialAsync(e,t){if(!e.isMeshStandardMaterial||e.bumpScale===1&&!e.bumpMap)return;let n=this.writer,s=n.extensionsUsed,r={};if(e.bumpMap){let o={index:await n.processTextureAsync(e.bumpMap),texCoord:e.bumpMap.channel};n.applyTextureTransform(o,e.bumpMap),r.bumpTexture=o}r.bumpFactor=e.bumpScale,t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Ph=class{constructor(e){this.writer=e,this.name="EXT_mesh_gpu_instancing"}writeNode(e,t){if(!e.isInstancedMesh)return;let n=this.writer,s=e,r=new Float32Array(s.count*3),o=new Float32Array(s.count*4),a=new Float32Array(s.count*3),l=new Be,c=new O,d=new Lt,u=new O;for(let p=0;p<s.count;p++)s.getMatrixAt(p,l),l.decompose(c,d,u),c.toArray(r,p*3),d.toArray(o,p*4),u.toArray(a,p*3);let h={TRANSLATION:n.processAccessor(new Ve(r,3)),ROTATION:n.processAccessor(new Ve(o,4)),SCALE:n.processAccessor(new Ve(a,3))};s.instanceColor&&(h._COLOR_0=n.processAccessor(s.instanceColor)),t.extensions=t.extensions||{},t.extensions[this.name]={attributes:h},n.extensionsUsed[this.name]=!0,n.extensionsRequired[this.name]=!0}};wi.Utils={insertKeyframe:function(i,e){let n=i.getValueSize(),s=new i.TimeBufferType(i.times.length+1),r=new i.ValueBufferType(i.values.length+n),o=i.createInterpolant(new i.ValueBufferType(n)),a;if(i.times.length===0){s[0]=e;for(let l=0;l<n;l++)r[l]=0;a=0}else if(e<i.times[0]){if(Math.abs(i.times[0]-e)<.001)return 0;s[0]=e,s.set(i.times,1),r.set(o.evaluate(e),0),r.set(i.values,n),a=0}else if(e>i.times[i.times.length-1]){if(Math.abs(i.times[i.times.length-1]-e)<.001)return i.times.length-1;s[s.length-1]=e,s.set(i.times,0),r.set(i.values,0),r.set(o.evaluate(e),i.values.length),a=s.length-1}else for(let l=0;l<i.times.length;l++){if(Math.abs(i.times[l]-e)<.001)return l;if(i.times[l]<e&&i.times[l+1]>e){s.set(i.times.slice(0,l+1),0),s[l+1]=e,s.set(i.times.slice(l+1),l+2),r.set(i.values.slice(0,(l+1)*n),0),r.set(o.evaluate(e),(l+1)*n),r.set(i.values.slice((l+1)*n),(l+2)*n),a=l+1;break}}return i.times=s,i.values=r,a},mergeMorphTargetTracks:function(i,e){let t=[],n={},s=i.tracks;for(let r=0;r<s.length;++r){let o=s[r],a=ot.parseTrackName(o.name),l=ot.findNode(e,a.nodeName);if(a.propertyName!=="morphTargetInfluences"||a.propertyIndex===void 0){t.push(o);continue}if(o.createInterpolant!==o.InterpolantFactoryMethodDiscrete&&o.createInterpolant!==o.InterpolantFactoryMethodLinear){if(o.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline)throw new Error("THREE.GLTFExporter: Cannot merge tracks with glTF CUBICSPLINE interpolation.");console.warn("THREE.GLTFExporter: Morph target interpolation mode not yet supported. Using LINEAR instead."),o=o.clone(),o.setInterpolation(Ms)}let c=l.morphTargetInfluences.length,d=l.morphTargetDictionary[a.propertyIndex];if(d===void 0)throw new Error("THREE.GLTFExporter: Morph target name not found: "+a.propertyIndex);let u;if(n[l.uuid]===void 0){u=o.clone();let p=new u.ValueBufferType(c*u.times.length);for(let g=0;g<u.times.length;g++)p[g*c+d]=u.values[g];u.name=(a.nodeName||"")+".morphTargetInfluences",u.values=p,n[l.uuid]=u,t.push(u);continue}let h=o.createInterpolant(new o.ValueBufferType(1));u=n[l.uuid];for(let p=0;p<u.times.length;p++)u.values[p*c+d]=h.evaluate(u.times[p]);for(let p=0;p<o.times.length;p++){let g=this.insertKeyframe(u,o.times[p]);u.values[g*c+d]=o.values[p]}}return i.tracks=t,i},toTypedBufferAttribute:function(i,e){let t=new Ve(new e(i.count*i.itemSize),i.itemSize,!1);if(!i.normalized&&!i.isInterleavedBufferAttribute)return t.array.set(i.array),t;for(let n=0,s=i.count;n<s;n++)for(let r=0;r<i.itemSize;r++)t.setComponent(n,r,i.getComponent(n,r));return t}};var Nh=1,pv="3D Avatar Maker (Marinara Engine)",kf="Body, hair, skin and clothing: MakeHuman base mesh and system assets (CC0 1.0), and parts made in Blender by ThatOneCan (CC0 1.0).",zf=`${kf} No credit required.`;function Lh(i){let e=[...new Set((i?.clothes??[]).map(t=>Zn[t]?.credit).filter(Boolean))];return e.length?`${kf} Clothing from wardrobe packs: ${e.join("; ")}`:zf}var Vf=1179937895,Hf=1313821514,Gf=5130562;function Wf(i){let e=i instanceof Uint8Array?i:new Uint8Array(i),t=new DataView(e.buffer,e.byteOffset,e.byteLength);if(e.byteLength<20||t.getUint32(0,!0)!==Vf||t.getUint32(4,!0)!==2)throw new Error("This isn't a .glb file.");let n=null,s=null;for(let r=12;r+8<=e.byteLength;){let o=t.getUint32(r,!0),a=t.getUint32(r+4,!0),l=e.subarray(r+8,r+8+o);a===Hf&&!n?n=JSON.parse(new TextDecoder().decode(l)):a===Gf&&!s&&(s=l),r+=8+o}if(!n)throw new Error("This .glb file has no description in it.");return{json:n,bin:s}}function mv(i,e=null){let t=(l,c)=>{let d=new Uint8Array(Math.ceil(l.byteLength/4)*4).fill(c);return d.set(l),d},n=t(new TextEncoder().encode(JSON.stringify(i)),32),s=e?t(e,0):null,r=20+n.byteLength+(s?8+s.byteLength:0),o=new Uint8Array(r),a=new DataView(o.buffer);if(a.setUint32(0,Vf,!0),a.setUint32(4,2,!0),a.setUint32(8,r,!0),a.setUint32(12,n.byteLength,!0),a.setUint32(16,Hf,!0),o.set(n,20),s){let l=20+n.byteLength;a.setUint32(l,s.byteLength,!0),a.setUint32(l+4,Gf,!0),o.set(s,l+8)}return o}function gv(i,e){let t=i.index.array,n=new Int32Array(i.attributes.position.count).fill(-1),s=[],r=[],o=0;for(let l of e){let c=s.length;for(let d=l.start;d<l.start+l.count;d++){let u=t[d];n[u]<0&&(n[u]=o++),s.push(n[u])}s.length>c&&r.push({start:c,count:s.length-c,materialIndex:l.materialIndex})}let a=new At;for(let[l,c]of Object.entries(i.attributes)){let d=c.itemSize,u=new c.array.constructor(o*d);for(let h=0;h<n.length;h++){let p=n[h];if(!(p<0))for(let g=0;g<d;g++)u[p*d+g]=c.array[h*d+g]}if(l==="normal")for(let h=0;h<u.length;h+=3){let p=Math.hypot(u[h],u[h+1],u[h+2])||1;u[h]/=p,u[h+1]/=p,u[h+2]/=p}a.setAttribute(l,new Ve(u,d,c.normalized))}a.setIndex(o>65535?new Ni(s,1):new Yn(s,1));for(let l of r)a.addGroup(l.start,l.count,l.materialIndex);return{geometry:a,vertices:o,triangles:s.length/3}}function _v(i,e){let t=i.alphaTest>=.5;return new wr({name:e,map:i.map??null,color:i.color,vertexColors:i.vertexColors,roughness:.9,metalness:0,side:i.side===Nt?Nt:Ln,alphaTest:t?i.alphaTest:0,transparent:!t&&i.transparent,depthWrite:t||!i.transparent})}function xv(i,e){let{bones:t,boneInverses:n}=e.skeleton,s=e.matrixWorld.clone().multiply(e.bindMatrixInverse),r=t.map((g,b)=>new Be().multiplyMatrices(g.matrixWorld,n[b]).premultiply(s).multiply(e.bindMatrix)),{position:o,normal:a,skinIndex:l,skinWeight:c}=i.attributes,d=new Float32Array(o.count*3),u=a?new Float32Array(a.count*3):null,h=new Float32Array(16),p=new Set;for(let g=0;g<o.count;g++){h.fill(0);for(let A=0;A<4;A++){let R=c.getComponent(g,A);if(!R)continue;let P=l.getComponent(g,A);p.add(t[P].name);let U=r[P].elements;for(let k=0;k<16;k++)h[k]+=R*U[k]}let[b,m,f]=[o.getX(g),o.getY(g),o.getZ(g)];if(d[g*3]=h[0]*b+h[4]*m+h[8]*f+h[12],d[g*3+1]=h[1]*b+h[5]*m+h[9]*f+h[13],d[g*3+2]=h[2]*b+h[6]*m+h[10]*f+h[14],!u)continue;let[y,T,v]=[a.getX(g),a.getY(g),a.getZ(g)],w=h[0]*y+h[4]*T+h[8]*v,S=h[1]*y+h[5]*T+h[9]*v,E=h[2]*y+h[6]*T+h[10]*v,_=Math.hypot(w,S,E)||1;u.set([w/_,S/_,E/_],g*3)}return i.setAttribute("position",new Ve(d,3)),u&&i.setAttribute("normal",new Ve(u,3)),p}var yv="https://vrm.dev/licenses/1.0/",vv={avatarPermission:["onlyAuthor","onlySeparatelyLicensedPerson","everyone"],commercialUsage:["personalNonProfit","personalProfit","corporation"],sharing:["none","share","change","changeAndShare"],creditNotation:["required","unnecessary"]},Xf=["allowExcessivelyViolentUsage","allowExcessivelySexualUsage","allowPoliticalOrReligiousUsage","allowAntisocialOrHateUsage"];function pl(i={}){let e={};for(let[t,n]of Object.entries(vv))e[t]=n.includes(i?.[t])?i[t]:n[0];for(let t of Xf)e[t]=i?.[t]===!0;return e.author=typeof i?.author=="string"?i.author.trim().slice(0,120):"",e}function bv(i,e,t){let n=pl(t),s=Lh(e)!==zf;return{name:String(i??"").trim()||"Avatar",version:"1",authors:[n.author||"Unknown"],licenseUrl:yv,avatarPermission:n.avatarPermission,commercialUsage:n.commercialUsage,allowRedistribution:n.sharing==="share"||n.sharing==="changeAndShare",modification:{change:"allowModification",changeAndShare:"allowModificationRedistribution"}[n.sharing]??"prohibited",creditNotation:s?"required":n.creditNotation,...Object.fromEntries(Xf.map(r=>[r,n[r]])),thirdPartyLicenses:Lh(e)}}var Sv=["tail_01","tail_02","tail_03","tail_04","tail_05"],Mv={hitRadius:.02,stiffness:1.5,gravityPower:.1,gravityDir:[0,-1,0],dragForce:.4},wv=.07;function Tv(i,e,t,n){let s=new Map;for(let l of i.skins??[])for(let c of l.joints)s.has(i.nodes[c].name)||s.set(i.nodes[c].name,c);let r={};for(let[l,c]of Object.entries(wn))s.has(c)&&(r[l]={node:s.get(c)});i.extensions={...i.extensions,VRMC_vrm:{specVersion:"1.0",meta:t,humanoid:{humanBones:r}}};let o=new Set(i.extensionsUsed??[]).add("VRMC_vrm"),a=Sv.filter(l=>s.has(l));if(a.length>1&&n.has(a[1])){let l=["l","r"].flatMap(c=>{let[d,u]=[e.bones.get(`thigh_${c}`),e.bones.get(`calf_${c}`)];return!s.has(d?.name)||!u?[]:[{node:s.get(d.name),shape:{capsule:{offset:[0,0,0],radius:wv,tail:u.position.toArray()}}}]});i.extensions.VRMC_springBone={specVersion:"1.0",colliders:l,colliderGroups:l.length?[{name:"Legs",colliders:l.map((c,d)=>d)}]:[],springs:[{name:"Tail",joints:a.map(c=>({node:s.get(c),...Mv})),...l.length?{colliderGroups:[0]}:{}}]},o.add("VRMC_springBone")}i.extensionsUsed=[...o]}function Yf(i,e={}){return $f(i,e,null)}function qf(i,{terms:e,...t}={}){return $f(i,t,e??{})}async function $f(i,{look:e={},name:t="",maxTextureSize:n=2048}={},s){await Xd();let r=s!==null;r?el(i):Wi(i);let o=[...i.root.children],a=[],l=[],c=new Map,d=new Map,u=new Set,h=0,p=0;try{if(i.meshes.forEach((y,T)=>{let v=Array.isArray(y.material)?y.material:[y.material],w=Array.isArray(y.material)?y.geometry.groups.map(({start:_,count:A,materialIndex:R})=>({start:_,count:A,materialIndex:R})):[{start:0,count:y.geometry.index.count,materialIndex:0}],S=gv(y.geometry,w);if(r)for(let _ of xv(S.geometry,y))u.add(_);h+=S.vertices,p+=S.triangles;let E=v.map((_,A)=>{let R=_v(_,`${y.name||"part"}-${T}-${A}`);if(R.map){let P=R.transparent||R.alphaTest>0;c.set(R.map,P||c.get(R.map)==="image/png"?"image/png":"image/jpeg")}return R});E.some(_=>_.vertexColors)||S.geometry.deleteAttribute("color"),a.push({mesh:y,geometry:y.geometry,material:y.material}),l.push(S.geometry,...E),y.geometry=S.geometry,y.material=Array.isArray(y.material)?E:E[0]}),r)for(let y of i.meshes){if(y.position.lengthSq()||y.scale.manhattanLength()!==3||y.quaternion.w!==1)throw new Error("A part of the avatar is placed in a way the VRM writer doesn't expect.");i.object.add(y);let{skeleton:T}=y;if(d.has(T))continue;d.set(T,T.boneInverses.map(w=>w.clone()));let v=y.bindMatrix.clone().invert();T.bones.forEach((w,S)=>T.boneInverses[S].copy(w.matrixWorld).invert().multiply(v))}i.object.updateMatrixWorld(!0);let g=new Map([...c.keys()].map(y=>[y,y.userData.mimeType]));for(let[y,T]of c)y.userData.mimeType=T;let b;try{b=await new wi().parseAsync(i.object,{binary:!0,maxTextureSize:n})}finally{for(let[y,T]of g)T===void 0?delete y.userData.mimeType:y.userData.mimeType=T}let{json:m,bin:f}=Wf(b);return m.asset={...m.asset,generator:pv,copyright:Lh(e)},m.extras={...m.extras,avatarMaker:{format:Nh,name:String(t??""),look:e}},r&&Tv(m,i,bv(t,e,s),u),{bytes:mv(m,f),vertices:h,triangles:p}}finally{for(let{mesh:g,geometry:b,material:m}of a)g.geometry=b,g.material=m;for(let g of l)g.dispose();for(let[g,b]of d)b.forEach((m,f)=>g.boneInverses[f].copy(m));if(r){for(let g of i.meshes)g.parent!==i.root&&i.root.add(g);i.root.children.splice(0,i.root.children.length,...o),Wi(i)}}}function Zf(i){try{let e=Wf(i).json.extras?.avatarMaker;return e&&typeof e.look=="object"&&e.look?{name:String(e.name??""),look:e.look}:null}catch{return null}}var Av=1,Qf="avatar-pack.json",Kf=/^[a-z0-9_]{1,64}$/u,Ev=/^(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.pack\.png$/u,Cv=["male","female"],Rv=/^(?:CC0-1\.0|CC-BY-[34]\.0)$/u,Iv=500,es=(i,e)=>typeof i=="string"&&i.trim()&&i.length<=e?i.trim():null,Pv=i=>Number.isInteger(i)&&i>=0&&i<=16777215,Jf=(i,e)=>Array.isArray(i)&&i.every(t=>e.includes(t)),ep=(i,e)=>{let t=es(i.version,40);return`/api/capability-packages/${i.id}/assets/${e}${t?`?v=${encodeURIComponent(t)}`:""}`};function tp(i){let e=i?.id;return typeof e=="string"&&/^[a-z0-9-]{1,100}$/u.test(e)&&e.startsWith(`${Jt}-`)&&i.status==="active"&&Array.isArray(i.manifest?.contributions?.assets?.paths)&&i.manifest.contributions.assets.paths.includes(Qf)}function Lv(i,e){if(!tp(i)||e?.format!==1||e.for!==Jt||e.body!==Av)return[];let t=i.manifest.contributions.assets.paths,n=es(e.name,80)??es(i.manifest.name,80)??i.id,s=e.pieces&&typeof e.pieces=="object"?Object.entries(e.pieces):[],r=Qs.map(([l])=>l),o=er.map(([l])=>l),a=[];for(let[l,c]of s.slice(0,Iv)){if(!Kf.test(l)||l in Object.prototype||Object.hasOwn($t,l)||a.some(m=>m.piece===l)||!c||typeof c!="object")continue;let d=es(c.label,60),u=es(c.author,80),h=es(c.licence,20),p=c.credit===null||c.credit===void 0?null:es(c.credit,300),g=Array.isArray(c.bodies)?[...new Set(c.bodies)]:[];d&&u&&Rv.test(h??"")&&(h==="CC0-1.0"||p)&&(c.credit===null||c.credit===void 0||p)&&r.includes(c.slot)&&g.length&&Jf(g,Cv)&&Number.isInteger(c.layer)&&c.layer>=0&&c.layer<=9&&Jf(c.hides,Af)&&(c.variants===void 0||Array.isArray(c.variants)&&c.variants.every(m=>Kf.test(m)))&&c.parts&&typeof c.parts=="object"&&g.every(m=>c.parts[m]===void 0||Array.isArray(c.parts[m])&&c.parts[m].every(f=>Array.isArray(f)&&f.length===2&&o.includes(f[0])&&Pv(f[1])))&&typeof c.bundle=="string"&&Ev.test(c.bundle)&&t.includes(c.bundle)&&a.push({piece:l,label:d,slot:c.slot,bodies:g,layer:c.layer,hides:[...c.hides],parts:Object.fromEntries(g.map(m=>[m,(c.parts[m]??[]).map(([f,y])=>[f,y])])),variants:[],url:ep(i,c.bundle),pack:i.id,packName:n,licence:h,author:u,credit:p})}return a}var jf=null;function np(){return jf??=(async()=>{try{let i=await ir("/api/capability-packages/installed",1e4),e=(Array.isArray(i)?i:[]).filter(tp).sort((s,r)=>s.id.localeCompare(r.id)),t=await Promise.all(e.map(s=>ir(ep(s,Qf),1e4))),n=[];return e.forEach((s,r)=>{let o=Lv(s,t[r]);pf(o),n.push(...o)}),n}catch(i){return console.warn(`[${Jt}] the wardrobe packs couldn't be read`,i),[]}})(),jf}var Nv={avatarPermission:[["onlyAuthor","Only the author"],["onlySeparatelyLicensedPerson","Only people the author allows"],["everyone","Anyone"]],commercialUsage:[["personalNonProfit","Personal use, not for money"],["personalProfit","Personal use, including for money"],["corporation","Any use, including by companies"]],sharing:[["none","Don't share it or change it"],["share","May share it as it is"],["change","May change it, but not share the changed one"],["changeAndShare","May change it and share the changed one"]],creditNotation:[["required","Required"],["unnecessary","Not needed"]]},Dv=[["allowExcessivelyViolentUsage","excessively violent use"],["allowExcessivelySexualUsage","excessively sexual use"],["allowPoliticalOrReligiousUsage","political or religious use"],["allowAntisocialOrHateUsage","hateful or antisocial use"]],Uv=[["start","Start"],["body","Body"],["face","Face"],["skin","Skin and eyes"],["hair","Hair"],["clothes","Clothes"],["save","Save"]];function oe(i,e={},...t){let n=document.createElement(i);for(let[s,r]of Object.entries(e??{}))r==null||r===!1||(s.startsWith("on")?n.addEventListener(s.slice(2),r):s==="class"?n.className=r:s in n&&s!=="list"?n[s]=r:n.setAttribute(s,r===!0?"":r));for(let s of t.flat())s!=null&&s!==!1&&n.append(s);return n}var Ov=0,sp=()=>`am-${++Ov}`,Dh=(i,e)=>i.find(([t])=>t===e)?.[1]??e;function _t(i,e,t=""){let n=e.id||(e.id=sp());return oe("div",{class:"row"},oe("label",{class:"name",htmlFor:n,title:t||void 0},i),oe("div",{},e,t?oe("div",{class:"ends"},oe("span",{},t)):null))}function yt(i,e,t,n){let s=oe("select",{"aria-label":n,onchange:()=>t(s.value)});for(let[r,o]of i)s.append(new Option(o,r,!1,r===e));return s}function ip({name:i,says:e,ends:t,least:n,most:s,step:r=.01,at:o,onInput:a}){let l=sp(),c=oe("input",{id:l,type:"range",min:n,max:s,step:r,value:o,"aria-describedby":`${l}-says`,oninput:()=>a(Number(c.value))});return oe("div",{class:"row"},oe("label",{class:"name",htmlFor:l,title:e},i),oe("div",{},c,oe("div",{class:"ends",id:`${l}-says`},oe("span",{},t?.[0]??""),oe("span",{},t?.[1]??""))))}function Ti(i,e,t,n,s=""){let r=oe("div",{class:"swatches",role:"group","aria-label":i});for(let[a,l]of e)r.append(oe("button",{class:"swatch",type:"button",title:l,"aria-label":`${i}: ${l}`,"aria-pressed":String(a===t),style:`background:${hh(a)}`,onclick:()=>n(a,!0)}));let o=oe("input",{type:"color",value:hh(t??e[0]?.[0]??8421504),title:`${i}: a colour of your own`,"aria-label":`${i}: a colour of your own`,oninput:()=>n(xf(o.value),!1)});return r.append(o),oe("div",{class:"row"},oe("span",{class:"name",title:s||void 0},i),oe("div",{},r,s?oe("div",{class:"ends"},oe("span",{},s)):null))}var Rt=(i,e,...t)=>oe("section",{class:"group"},oe("h2",{},i),e?oe("p",{class:"says"},e):null,...t);function rp(i){let e=oe("div",{class:"tabs",role:"tablist","aria-label":"Avatar sections"}),t=oe("div",{class:"body",role:"tabpanel",tabIndex:0}),n=oe("section",{class:"panel","aria-label":"Avatar controls"},e,t),s={text:"",bad:!1},r=null,o=(f,y=!0)=>i.onChange(f,{redraw:y}),a={start:({filled:f})=>[Rt("Start from a ready-made look","A preset sets the body and its shape. Everything can be changed afterwards.",_t("Preset",yt([["","Choose one…"],...lh.map((y,T)=>[String(T),y.name])],"",y=>{let T=lh[Number(y)];y!==""&&T&&i.onNew(T.look)},"Start from a preset")),oe("div",{class:"swatches"},oe("button",{type:"button",onclick:()=>i.onNew({body:"female"})},"New female avatar"),oe("button",{type:"button",onclick:()=>i.onNew({body:"male"})},"New male avatar"))),Rt("Style","A starting point for the face and head. It sets the Face tab's sliders, so everything stays adjustable. An anime drawing style (flat shading and outlines) is planned for the saved file.",_t("Style",yt([["","Choose one…"],...rl.map(([y,T])=>[y,T])],"",y=>{let T=rl.find(([w])=>w===y);if(!T)return;let v=Object.fromEntries(of.map(w=>[w,0]));o({shape:{...v,...T[3].shape},limbs:T[3].limbs})},"Style"),rl.map(([,y,T])=>`${y}: ${T}`).join(" "))),Rt("Where this avatar is",`Body: ${Dh(il,f.body)}. Your work is kept in this browser as you go. Use the Save tab to keep it as a file.`)],body:({filled:f,choices:y})=>[Rt("Body","",_t("Body",yt(il,f.body,T=>o({body:T}),"Body"),"Each body has its own hair fits, underwear and some clothes."),_t("Race",yt([["","Choose one…"],...Tn.filter(([T])=>y.races.includes(T)).map(([T,v])=>[T,v])],"",T=>{if(!T)return;let v=nf(T,f.body);o({...v,shape:v.shape,limbs:v.limbs,colours:v.colours??{}})},"Start from a race"),"A preset: it sets the race sliders below, height, limb lengths and that race's usual extras. Change any of them after."),_t("Age",yt(nh,f.age,T=>o({age:T}),"Age"),"Changes the body's shape and the skin picture."),d({name:"Height",says:"The whole figure, taller or shorter.",ends:["Short","Tall"],least:yi[0],most:yi[1],at:f.height,onInput:T=>o({height:T},!1)})),u("race","Race features","Each race's build and face, mixed as you like. A race chosen above sets these.",...vi.filter(([T])=>Js(T,y.keys,f.body)).map(T=>p(T,f,y))),Rt("Build","The middle of each slider is the body's own shape.",...Ki.filter(([T])=>Js(T,y.keys,f.body)).map(T=>p(T,f,y))),...rf.map(([T,v,w])=>{let S=Si.filter(([E,,,,,,_])=>_===T&&Js(E,y.keys,f.body));return S.length?u(`body-${T}`,v,w,...S.map(E=>p(E,f,y)),oe("button",{type:"button",onclick:()=>o({shape:Object.fromEntries(S.map(([E])=>[E,0]))})},`Back to the ${v.toLowerCase()} as made`)):null}),Rt("Proportions","",...js.map(([T,v,w,S,E,_])=>d({name:v,says:E,ends:_,least:w,most:S,step:.005,at:f.limbs[T],onInput:A=>o({limbs:{[T]:A}},!1)})))],face:({filled:f,choices:y})=>[Rt("Face shape","The face's overall shape. Each part of the face has more below.",h("shape","Face outline"),...bi.filter(([T])=>Js(T,y.keys,f.body)).map(T=>p(T,f,y))),...sf.map(([T,v,w])=>{let S=An.filter(([E,,,,,,_])=>_===T&&Js(E,y.keys,f.body));return S.length?u(T,v,w,jc[T]?h(T,"Ready-made"):null,...S.map(E=>p(E,f,y)),oe("button",{type:"button",onclick:()=>o({shape:Object.fromEntries(Qc(T).map(E=>[E,0]))})},`Back to the ${v.toLowerCase()} as made`)):null}),Rt("Brows and lashes","",_t("Brows",yt(y.brows.map(T=>[String(T),uf[T]??`Style ${T}`]),String(f.brows),T=>o({brows:Number(T)}),"Brow style")),_t("Lashes",yt(y.lashes.map(T=>[String(T),df[T]??`Style ${T}`]),String(f.lashes),T=>o({lashes:Number(T)}),"Lash style")),Ti("Brow colour",$i,f.colours.brows,(T,v)=>o({colours:{brows:T}},v))),Rt("Accessories","Anyone can wear any of these, whatever their race.",...Ks.filter(([T])=>(y[T]??[]).length).map(([T,v,w,S])=>_t(w,yt(v.filter(([E])=>E===gt||y[T].includes(E)),f[T],E=>o({[T]:E}),w),S)),f.horns!==gt?Ti("Horn colour",Ji,f.colours.horns,(T,v)=>o({colours:{horns:T}},v)):null,y.tail?_t("Tail",yt([["no","No tail"],["yes","A tiefling's tail"]],f.tail?"yes":"no",T=>o({tail:T==="yes"}),"Tail")):null)],skin:({filled:f})=>[Rt("Skin","",_t("Skin",yt(al(f.body),f.skin,y=>o({skin:y}),"Skin"),"A skin picture, or the plain skin in a colour of your own."),f.skin==="custom"?Ti("Skin colour",$n,f.colours.skin,(y,T)=>o({skin:"custom",colours:{skin:y}},T)):null),Rt("Eyes","",_t("Eyes",yt([[Fn,"A colour of your own"],...Yr],f.eyePicture,y=>o({eyePicture:y}),"Eyes"),"A pictured eye, or the grey iris in a colour."),f.eyePicture===Fn?Ti("Eye colour",$r,f.colours.eyes,(y,T)=>o({colours:{eyes:y}},T)):null),Rt("Lips and nails","Left alone, each colour follows the skin.",_t("Fingernails",yt(ll,f.nails,y=>o({nails:y}),"Fingernails"),"Their length, or none. Gloves hide them."),_t("Toenails",yt([["on","On"],["off","Off"]],f.toenails?"on":"off",y=>o({toenails:y==="on"}),"Toenails"),"Shoes hide them."),...ih.filter(([y])=>y==="lips"||y==="nails").map(([y,T,v,w])=>Ti(T,v,f.colours[y],(S,E)=>o({colours:{[y]:S}},E),w)),oe("button",{type:"button",onclick:()=>o({colours:{lips:void 0,nails:void 0}})},"Back to the skin's own lips and nails"))],hair:({filled:f,choices:y})=>[Rt("Hair","",_t("Style",yt(Zs.filter(([T])=>y.hair.includes(T)),f.hair,T=>o({hair:T}),"Hair style"),"A hood or helm that covers the head hides the hair."),Ti("Hair colour",$i,f.hairColour,(T,v)=>o({hairTint:T,hairColour:void 0},v)))],clothes:({filled:f,choices:y})=>{let T=new Map(Qs.map(([S])=>[S,[]]));for(let S of y.clothes)T.get(S.slot)?.push(S);let v=new Set(f.clothes),w=(S,E)=>{let _=f.clothes.filter(A=>T.get(S).every(R=>R.piece!==A));o({clothes:E?[..._,E]:_})};return[Rt("Ready-made outfits","Changes the clothes only.",_t("Outfit",yt([["","Choose one…"],...Qr.map((S,E)=>[String(E),S.name]),["none","Nothing on"]],"",S=>{S==="none"?o({clothes:[],clothColours:void 0,variants:void 0}):S!==""&&o(g(hl(Qr[Number(S)],f.body)))},"Put on a ready-made outfit"))),Rt("Underwear","Hidden by whatever is worn over it.",y.tops.length?_t("Top",yt([[gt,"None"],...Kr.filter(([S])=>y.tops.includes(S))],f.underwear.top,S=>o({underwear:{top:S}}),"Underwear top")):null,_t("Bottom",yt([[gt,"None"],...Jr.filter(([S])=>y.bottoms.includes(S))],f.underwear.bottom,S=>o({underwear:{bottom:S}}),"Underwear bottom")),Ti("Colour",Zr,f.colours.underwear,(S,E)=>o({colours:{underwear:S}},E))),Rt("Clothes and armour","One piece in each place. Pieces further down the list are worn over the ones above where they overlap.",...Qs.filter(([S])=>T.get(S).length).map(([S,E,_])=>{let A=T.get(S),R=A.find(I=>v.has(I.piece)),P=_t(E,yt([["","None"],...A.map(I=>[I.piece,Dh(jr,I.piece)])],R?.piece??"",I=>w(S,I),E),_);if(!R)return P;let U=oh[R.piece],k=Zn[R.piece];return oe("div",{class:"piece"},P,k?oe("p",{class:"says"},`From ${k.packName}, by ${k.author}${k.credit?` (${k.licence.replace(/-/gu," ")})`:""}.`):null,U&&R.variants?.length?_t(U.label,yt(U.ways,f.variants[R.piece]??"",I=>o({variants:{[R.piece]:I||void 0}}),U.label),U.says):null,...R.parts.map(([I,F])=>Ti(Dh(er,I),tr,f.clothColours[R.piece]?.[I]??F,($,X)=>o({clothColours:{[R.piece]:{...f.clothColours[R.piece],[I]:$}}},X))))}))]},save:({exported:f,terms:y,look:T})=>[Rt("Keep working on it later","A small file with every choice you made. Open it here again to carry on.",oe("div",{class:"swatches"},oe("button",{type:"button",onclick:i.onSaveLook},"Save the look (.json)"),oe("button",{type:"button",onclick:i.onOpen},"Open a look or avatar…"))),Rt("Save as a 3D avatar","A file with the body, hair, clothes and pictures in it, which also remembers your choices so it can be opened here again. A VRM stands in a T-pose, names its bones for any VRM app, carries the terms below, and swings a tail if one is worn. A GLB is a plain 3D model.",_t("Picture size",l=yt([["2048","Full (sharpest, largest file)"],["1024","Half (smaller file, good for phones)"],["512","Quarter (smallest)"]],l?.value??"2048",()=>{},"Picture size"),"How large the skin and clothing pictures are in the file."),oe("div",{class:"swatches"},oe("button",{class:"main",type:"button",onclick:()=>i.onExport({format:"vrm",maxTextureSize:Number(l.value)})},"Save as VRM"),oe("button",{type:"button",onclick:()=>i.onExport({format:"glb",maxTextureSize:Number(l.value)})},"Save as GLB")),f?oe("p",{class:"says"},`Saved ${f.file}: ${(f.bytes/1048576).toFixed(1)} MB, ${f.vertices.toLocaleString()} points, ${f.triangles.toLocaleString()} triangles.`):null),u("terms","The VRM's terms","What you allow others to do with the avatar, written into a VRM file under the VRM Public License 1.0 for the apps that open it. Kept in this browser for every avatar you save. A GLB carries none of this.",_t("Author",oe("input",{type:"text",value:y.author,maxLength:120,placeholder:"Your name or handle","aria-label":"Author",oninput:v=>i.onTerms({author:v.target.value})}),"Who made the avatar. Left empty, the file says Unknown."),...[["avatarPermission","Who may use it","Who may appear as this avatar."],["commercialUsage","Commercial use","Whether it may be used to earn money, and by whom."],["sharing","Sharing","Whether others may pass the file on, or change the avatar."],["creditNotation","Credit",(T?.clothes??[]).some(v=>Zn[v]?.credit)?"Whether whoever uses it must name you. Always required while it wears a CC BY piece from a wardrobe pack, whose maker must be credited.":"Whether whoever uses it must name you."]].map(([v,w,S])=>_t(w,yt(Nv[v],y[v],E=>i.onTerms({[v]:E}),w),S)),oe("p",{class:"says"},"Uses VRM forbids unless allowed:"),...Dv.map(([v,w])=>oe("label",{class:"check"},oe("input",{type:"checkbox",checked:y[v],onchange:S=>i.onTerms({[v]:S.target.checked})}),` Allow ${w}`))),Rt("Use it in a chat","The 3D Avatars agent shows the file. This version has a still face: it blinks and talks once face movement is added to the bodies.",oe("ol",{class:"steps"},oe("li",{},"Open Agents and install 3D Avatars from the Agent Organizer if you haven't."),oe("li",{},"Open 3D Avatars and pick the character or persona."),oe("li",{},"For a .vrm, under Avatar type choose VRM model, then Import VRM. For a .glb, choose GLB or FBX model, then Import GLB or FBX."),oe("li",{},"Turn on Show this avatar in chats, and add 3D Avatars to the chat under Chat Settings → Agents.")))]},l=null,c=new Set(["eyes"]);function d({least:f,most:y,at:T,onInput:v,...w}){let S=_=>_<1?-(1-_)/(1-f):(_-1)/(y-1),E=_=>Math.round((_<0?1+_*(1-f):1+_*(y-1))*1e3)/1e3;return ip({...w,least:-1,most:1,at:S(T),onInput:_=>v(E(_))})}function u(f,y,T,...v){let w=oe("details",{class:"group fold",open:c.has(f),ontoggle:()=>w.open?c.add(f):c.delete(f)},oe("summary",{},y),T?oe("p",{class:"says"},T):null,...v);return w}function h(f,y){let T=jc[f]??[];return _t(y,yt([["","Choose one…"],...T.map(([v],w)=>[String(w),v])],"",v=>{let w=T[Number(v)];if(!w)return;let S=Object.fromEntries(Qc(f).map(E=>[E,0]));o({shape:{...S,...w[1]}})},`${y} for the ${f==="shape"?"face":f}`),"Sets the sliders below; adjust them after.")}function p(f,y,T){let[v,w,,,S,E]=f,_=ol(f,T.keys);return ip({name:w,says:S,ends:E,least:_[0]<0?-1:0,most:1,at:af(y.shape[v],_),onInput:A=>o({shape:{[v]:Math.round(lf(A,_)*1e3)/1e3}},!1)})}let g=f=>({clothes:f.clothes??[],clothColours:{$set:f.clothColours??{}},variants:{$set:f.variants??{}}});function b(f){e.replaceChildren(...Uv.map(([T,v])=>oe("button",{type:"button",role:"tab",id:`am-tab-${T}`,"aria-selected":String(T===f.tab),onclick:()=>i.onTab(T)},v))),t.setAttribute("aria-labelledby",`am-tab-${f.tab}`);let y=t.scrollTop;r=oe("p",{class:`status${s.bad?" bad":""}`,role:"status","aria-live":"polite"},s.text),t.replaceChildren(r,...(f.filled&&f.choices?a[f.tab](f):[]).filter(Boolean)),t.scrollTop=y}function m(f,y=!1){s={text:f,bad:y},r&&(r.textContent=f,r.className=`status${y?" bad":""}`)}return{element:n,render:b,setStatus:m}}var op={type:"change"},Oh={type:"start"},lp={type:"end"},ml=new Di,ap=new tn,Fv=Math.cos(70*Vi.DEG2RAD),It=new O,jt=2*Math.PI,ct={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Uh=1e-6,gl=class extends Rr{constructor(e,t=null){super(e,t),this.state=ct.NONE,this.target=new O,this.cursor=new O,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:pi.ROTATE,MIDDLE:pi.DOLLY,RIGHT:pi.PAN},this.touches={ONE:mi.ROTATE,TWO:mi.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new O,this._lastQuaternion=new Lt,this._lastTargetPosition=new O,this._quat=new Lt().setFromUnitVectors(e.up,new O(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Fs,this._sphericalDelta=new Fs,this._scale=1,this._panOffset=new O,this._rotateStart=new Oe,this._rotateEnd=new Oe,this._rotateDelta=new Oe,this._panStart=new Oe,this._panEnd=new Oe,this._panDelta=new Oe,this._dollyStart=new Oe,this._dollyEnd=new Oe,this._dollyDelta=new Oe,this._dollyDirection=new O,this._mouse=new Oe,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=kv.bind(this),this._onPointerDown=Bv.bind(this),this._onPointerUp=zv.bind(this),this._onContextMenu=qv.bind(this),this._onMouseWheel=Gv.bind(this),this._onKeyDown=Wv.bind(this),this._onTouchStart=Xv.bind(this),this._onTouchMove=Yv.bind(this),this._onMouseDown=Vv.bind(this),this._onMouseMove=Hv.bind(this),this._interceptControlDown=$v.bind(this),this._interceptControlUp=Zv.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=ct.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents();let e=this.domElement.getRootNode();e.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),e.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(op),this.update(),this.state=ct.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){let t=this.object.position;It.copy(t).sub(this.target),It.applyQuaternion(this._quat),this._spherical.setFromVector3(It),this.autoRotate&&this.state===ct.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=jt:n>Math.PI&&(n-=jt),s<-Math.PI?s+=jt:s>Math.PI&&(s-=jt),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(It.setFromSpherical(this._spherical),It.applyQuaternion(this._quatInverse),t.copy(this.target).add(It),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){let a=It.length();o=this._clampDistance(a*this._scale);let l=a-o;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){let a=new O(this._mouse.x,this._mouse.y,0);a.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;let c=new O(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(a),this.object.updateMatrixWorld(),o=It.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(ml.origin.copy(this.object.position),ml.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(ml.direction))<Fv?this.object.lookAt(this.target):(ap.setFromNormalAndCoplanarPoint(this.object.up,this.target),ml.intersectPlane(ap,this.target))))}else if(this.object.isOrthographicCamera){let o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>Uh||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Uh||this._lastTargetPosition.distanceToSquared(this.target)>Uh?(this.dispatchEvent(op),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?jt/60*this.autoRotateSpeed*e:jt/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){It.setFromMatrixColumn(t,0),It.multiplyScalar(-e),this._panOffset.add(It)}_panUp(e,t){this.screenSpacePanning===!0?It.setFromMatrixColumn(t,1):(It.setFromMatrixColumn(t,0),It.crossVectors(this.object.up,It)),It.multiplyScalar(e),this._panOffset.add(It)}_pan(e,t){let n=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;It.copy(s).sub(this.target);let r=It.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/n.clientHeight,this.object.matrix),this._panUp(2*t*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),s=e-n.left,r=t-n.top,o=n.width,a=n.height;this._mouse.x=s/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(jt*this._rotateDelta.x/t.clientHeight),this._rotateUp(jt*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(jt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-jt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(jt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-jt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(n,s)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let n=this._getSecondPointerPosition(e),s=.5*(e.pageX+n.x),r=.5*(e.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(jt*this._rotateDelta.x/t.clientHeight),this._rotateUp(jt*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let o=(e.pageX+t.x)*.5,a=(e.pageY+t.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new Oe,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function Bv(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function kv(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function zv(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(lp),this.state=ct.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function Vv(i){let e;switch(i.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case pi.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=ct.DOLLY;break;case pi.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=ct.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=ct.ROTATE}break;case pi.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=ct.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=ct.PAN}break;default:this.state=ct.NONE}this.state!==ct.NONE&&this.dispatchEvent(Oh)}function Hv(i){switch(this.state){case ct.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case ct.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case ct.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function Gv(i){this.enabled===!1||this.enableZoom===!1||this.state!==ct.NONE||(i.preventDefault(),this.dispatchEvent(Oh),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(lp))}function Wv(i){this.enabled!==!1&&this._handleKeyDown(i)}function Xv(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case mi.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=ct.TOUCH_ROTATE;break;case mi.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=ct.TOUCH_PAN;break;default:this.state=ct.NONE}break;case 2:switch(this.touches.TWO){case mi.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=ct.TOUCH_DOLLY_PAN;break;case mi.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=ct.TOUCH_DOLLY_ROTATE;break;default:this.state=ct.NONE}break;default:this.state=ct.NONE}this.state!==ct.NONE&&this.dispatchEvent(Oh)}function Yv(i){switch(this._trackPointer(i),this.state){case ct.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case ct.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case ct.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case ct.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=ct.NONE}}function qv(i){this.enabled!==!1&&i.preventDefault()}function $v(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Zv(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var cp=[["relaxed","Relaxed"],["a","A-pose"],["t","T-pose"]];function hp(i){let e;try{e=new qa({canvas:i,antialias:!0,alpha:!0,preserveDrawingBuffer:!1})}catch{return{failed:!0,show(){},setPose(){},view(){},resize(){},dispose(){}}}e.setPixelRatio(Math.min(2,globalThis.devicePixelRatio||1)),e.outputColorSpace=bt;let t=new ai;t.add(new Er(15397631,7364686,1.6));let n=new Os(16773852,1.9);n.position.set(2,3.2,4);let s=new Os(13623551,.5);s.position.set(-3,1.5,-2),t.add(n,s);let r=new Xt(new Sr(.75,48),new Ui({color:0,transparent:!0,opacity:.16,depthWrite:!1}));r.rotation.x=-Math.PI/2,r.position.y=.002,t.add(r);let o=new zt(30,1,.01,50),a=new gl(o,i);a.enableDamping=!0,a.dampingFactor=.12,a.minDistance=.1,a.maxDistance=9,a.maxPolarAngle=Math.PI*.92,a.listenToKeyEvents(i);let l=null,c="relaxed",d=0,u=!0,h=!1,p=performance.now(),g=globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches,b=new O;function m(){l&&(c==="t"?el(l):c==="a"?Wi(l):Jd(l,g?0:(performance.now()-p)/1e3))}function f(S="body"){let E=l?l.humanoid.head.getWorldPosition(b).y+.12:1.75;if(S==="face"){let _=l?l.humanoid.head.getWorldPosition(b).y+.06:1.62;a.target.set(0,_,0),o.position.set(.18,_+.02,.95)}else S==="hand"&&l?.humanoid.leftHand?((l.humanoid.leftMiddleProximal??l.humanoid.leftHand).getWorldPosition(b),a.target.copy(b),c==="t"?o.position.set(b.x+.02,b.y+.42,b.z+.12):o.position.set(b.x+.12,b.y+.1,b.z+.42)):S==="feet"&&l?.humanoid.leftToes?(l.humanoid.leftToes.getWorldPosition(b),a.target.set(0,b.y,b.z),o.position.set(.05,b.y+.35,b.z+.45)):(a.target.set(0,E*.52,0),o.position.set(.5,E*.6,Math.max(2.6,E*2.3)));a.update()}function y(){let S=i.clientWidth,E=i.clientHeight;!S||!E||(e.setSize(S,E,!1),o.aspect=S/E,o.updateProjectionMatrix())}function T(){d=0,!h&&(u&&document.visibilityState!=="hidden"&&(c==="relaxed"&&!g&&m(),a.update(),e.render(t,o)),d=requestAnimationFrame(T))}let v=new ResizeObserver(y);v.observe(i);let w=new IntersectionObserver(([S])=>u=S.isIntersecting);return w.observe(i),y(),f("body"),d=requestAnimationFrame(T),{failed:!1,show(S){l&&(t.remove(l.object),l.dispose()),l=S,l&&(t.add(l.object),m())},setPose(S){c=S,m()},view:f,resize:y,dispose(){h=!0,d&&cancelAnimationFrame(d),v.disconnect(),w.disconnect(),a.dispose(),l&&(t.remove(l.object),l.dispose(),l=null),r.geometry.dispose(),r.material.dispose(),e.dispose()}}}var up=`
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
`;var dp=`marinara-capability-${Jt}`,fp=i=>`${Jt}:draft:${i?`${i.type}:${i.id}`:"none"}`,Fh=`${Jt}:last`,pp=`${Jt}:vrm-terms`,Kv=["shape","limbs","colours","underwear","clothColours","variants"],Jv=i=>Array.isArray(i)?i:Array.isArray(i?.items)?i.items:[];function jv(i){let e=i?.data;if(typeof e=="string")try{e=JSON.parse(e)}catch{e=null}let t=e?.name??e?.data?.name??i?.name;return typeof t=="string"&&t.trim()?t.trim():"Unnamed"}async function Qv(){let[i,e]=await Promise.all([ir("/api/characters/personas/list"),ir("/api/characters")]),t=(n,s,r)=>Jv(s).filter(o=>typeof o?.id=="string"&&o.id).map(o=>({type:n,id:o.id,name:r(o)})).sort((o,a)=>o.name.localeCompare(a.name));return[...t("persona",i,n=>typeof n.name=="string"&&n.name.trim()?n.name.trim():"Unnamed"),...t("character",e,jv)]}var ts={read(i){try{return JSON.parse(globalThis.localStorage?.getItem(i)??"null")}catch{return null}},write(i,e){try{globalThis.localStorage?.setItem(i,JSON.stringify(e))}catch{}}};function no(i={}){let e=i.body==="male"?"male":"female",t=Qr.find(n=>n.name==="Modern casual");return Zi({...cf,body:e,...t?hl(t,e):{},...i})}function eb(i,e){let t={...i};for(let[n,s]of Object.entries(e))if(s===void 0)delete t[n];else if(Kv.includes(n)){let r=s.$set?{...s.$set}:{...t[n],...s};for(let o of Object.keys(r))r[o]===void 0&&delete r[o];t[n]=r}else t[n]=s;return e.hairTint!==void 0&&delete t.hairColour,Zi(t)}var mp=(i,e)=>`${(i||"avatar").trim().replace(/[^\p{L}\p{N} _-]+/gu,"").replace(/\s+/gu,"-").slice(0,60)||"avatar"}.${e}`;function gp(i,e,t){let n=URL.createObjectURL(new Blob([i],{type:t})),s=oe("a",{href:n,download:e});document.body.append(s),s.click(),s.remove(),setTimeout(()=>URL.revokeObjectURL(n),1e4)}function tb(i,e){Wd(e?.kitBase??`/api/capability-packages/${e?.packageId??Jt}/assets/kit/`,e?.packageVersion??"");let t=i.shadowRoot??i.attachShadow({mode:"open"}),n={owners:[],owner:null,name:"",look:no(),tab:"start",filled:null,choices:null,exported:null,terms:pl(ts.read(pp)??{}),building:0,figure:null,redraw:!0},s=oe("canvas",{tabIndex:0,role:"img","aria-label":"The avatar. Drag to turn it, scroll or pinch to zoom, arrow keys to move the view."}),r=oe("div",{class:"note",role:"status","aria-live":"polite"}),o=oe("select",{"aria-label":"Pose",onchange:()=>g.setPose(o.value)});for(let[_,A]of cp)o.append(new Option(A,_));let a=oe("div",{class:"views"},oe("button",{type:"button",onclick:()=>g.view("body")},"Whole body"),oe("button",{type:"button",onclick:()=>g.view("face")},"Face"),oe("button",{type:"button",onclick:()=>g.view("hand")},"Hand"),oe("button",{type:"button",onclick:()=>g.view("feet")},"Feet"),o),l=oe("section",{class:"stage","aria-label":"Preview"},s,r,a),c=oe("select",{"aria-label":"Who this avatar is for",onchange:()=>T(c.value)}),d=oe("input",{type:"text","aria-label":"Avatar name",placeholder:"Avatar name",maxLength:60,oninput:()=>{n.name=d.value,m()}}),u=oe("input",{type:"file",accept:".vrm,.glb,.json,model/gltf-binary,application/json",class:"visually-hidden",tabIndex:-1,"aria-hidden":"true",onchange:()=>{let[_]=u.files??[];u.value="",_&&v(_)}}),h=rp({onChange:(_,{redraw:A})=>{n.look=eb(n.look,_),n.redraw||=A,m(),f()},onTab:_=>{n.tab=_,b()},onNew:_=>{n.look=no(_),n.exported=null,n.redraw=!0,m(),f()},onOpen:()=>u.click(),onSaveLook:()=>{let _=JSON.stringify({avatarMaker:"look",format:Nh,name:n.name,look:n.look},null,1);gp(_,mp(n.name,"avatar.json"),"application/json"),h.setStatus("Saved the look as a file.")},onExport:_=>{w(_)},onTerms:_=>{n.terms=pl({...n.terms,..._}),ts.write(pp,n.terms)}}),p=oe("div",{class:"app"},oe("header",{},oe("h1",{},"3D Avatar Maker"),oe("label",{class:"field"},"For",c),oe("label",{class:"field"},"Name",d),oe("span",{class:"grow"}),oe("button",{type:"button",onclick:()=>u.click()},"Open…"),oe("button",{class:"main",type:"button",onclick:()=>{n.tab="save",b()}},"Save…"),u),oe("main",{},l,h.element));t.replaceChildren(oe("style",{},up),p);let g=hp(s);g.failed&&(r.className="note bad",r.textContent="This browser couldn't start 3D drawing (WebGL), so the avatar can't be shown here.");function b(){h.render({look:n.look,filled:n.filled,choices:n.choices,tab:n.tab,exported:n.exported,terms:n.terms})}function m(){ts.write(fp(n.owner),{name:n.name,look:n.look}),ts.write(Fh,n.owner?{type:n.owner.type,id:n.owner.id}:null)}async function f(){let _=++n.building;try{let A=await Nf(n.look,n.name||"avatar","auto");if(_!==n.building||S){A.dispose();return}let R=n.filled?.body!==A.avatar.body;n.figure=A,n.filled=A.avatar,(R||!n.choices)&&(n.choices=await Pf(A.avatar.body)),g.show(A),g.failed||(r.textContent=""),(n.redraw||R)&&b(),n.redraw=!1}catch(A){if(_!==n.building)return;console.warn(`[${Jt}] the avatar couldn't be built`,A),r.className="note bad",r.textContent="The avatar's files couldn't be loaded. If you just installed or updated 3D Avatar Maker, reload the page and try again."}}function y(){c.replaceChildren(new Option("No one yet (a free draft)",""));for(let[_,A]of[["persona","Personas"],["character","Characters"]]){let R=n.owners.filter(U=>U.type===_);if(!R.length)continue;let P=oe("optgroup",{label:A});for(let U of R)P.append(new Option(U.name,`${U.type}:${U.id}`));c.append(P)}c.value=n.owner?`${n.owner.type}:${n.owner.id}`:""}function T(_){n.owner=n.owners.find(R=>`${R.type}:${R.id}`===_)??null;let A=ts.read(fp(n.owner));n.look=A?.look?Zi(A.look):no(),n.look.body||(n.look=no(n.look)),n.name=typeof A?.name=="string"&&A.name?A.name:n.owner?.name??"",d.value=n.name,n.exported=null,n.redraw=!0,ts.write(Fh,n.owner?{type:n.owner.type,id:n.owner.id}:null),f()}async function v(_){try{let A=null;if(/\.(?:glb|vrm)$/iu.test(_.name))A=Zf(await _.arrayBuffer());else{let P=JSON.parse(await _.text());(P?.avatarMaker==="look"||P?.wanderworld==="look")&&(A={name:P.name,look:P.look})}let R=A?Zi(A.look):null;if(!R||!Object.keys(R).length){h.setStatus(/\.(?:glb|vrm)$/iu.test(_.name)?"That file wasn't saved by 3D Avatar Maker, so there is no look in it to open.":"That file isn't a saved look.",!0);return}n.look=R.body?R:no(R),typeof A.name=="string"&&A.name&&(n.name=A.name.slice(0,60),d.value=n.name),n.exported=null,n.redraw=!0,m(),h.setStatus(`Opened ${_.name}.`),f()}catch{h.setStatus("That file couldn't be read.",!0)}}async function w({format:_,maxTextureSize:A}){if(n.figure){h.setStatus("Saving the avatar…");try{let R={look:n.look,name:n.name,maxTextureSize:A},{bytes:P,vertices:U,triangles:k}=_==="vrm"?await qf(n.figure,{...R,terms:n.terms}):await Yf(n.figure,R);g.setPose(o.value);let I=mp(n.name,_==="vrm"?"vrm":"glb");gp(P,I,"model/gltf-binary"),n.exported={file:I,bytes:P.byteLength,vertices:U,triangles:k},b(),h.setStatus("Saved. The steps below say how to use it in a chat.")}catch(R){console.warn(`[${Jt}] the avatar couldn't be saved`,R),g.setPose(o.value),h.setStatus("The avatar couldn't be saved. Try a smaller picture size.",!0)}}}let S=!1;y(),d.value=n.name,b();let E=Qv();return np().then(()=>S?null:(T(""),E)).then(_=>{if(S||!_)return;n.owners=_;let A=ts.read(Fh),R=A?`${A.type}:${A.id}`:"";y(),R&&_.some(P=>`${P.type}:${P.id}`===R)&&(c.value=R,T(R))}),{destroy(){S=!0,n.building++,g.dispose(),t.replaceChildren()}}}var Bh=class extends HTMLElement{constructor(){super(),this.props=null,this.mounted=null,this.onPropsEvent=()=>this.sync()}set capabilityProps(e){this.props=e,this.sync()}get capabilityProps(){return this.props}connectedCallback(){this.addEventListener("marinara-capability-props",this.onPropsEvent),this.sync()}disconnectedCallback(){this.removeEventListener("marinara-capability-props",this.onPropsEvent),this.mounted?.destroy(),this.mounted=null}sync(){try{if(this.getAttribute("view")!=="browser"||!this.isConnected||this.mounted)return;this.style.cssText+=";display:block;position:relative;overflow:hidden;width:100%;height:100%;",this.mounted=tb(this,this.props)}catch(e){let t=e instanceof Error?e.message:String(e);console.error(`[${Jt}]`,e),this.dispatchEvent(new CustomEvent("marinara-capability-runtime-error",{detail:{message:t}}))}}};customElements.get(dp)||customElements.define(dp,Bh);})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
