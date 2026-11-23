// 3D Avatar Maker 0.1.05 — Marinara Engine Home tab app (single-file client bundle, includes three.js 0.186.1, MIT)
// Built from packages/3d-avatar-maker/src by scripts/build-3d-avatar-maker-package.mjs. Do not edit; edit src/ and rebuild.
(()=>{var fi={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},pi={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},vu=0,$l=1,bu=2;var Rr=1,Su=2,Os=3,Pn=0,Yt=1,Nt=2,Ln=0,Fs=1,Zl=2,Kl=3,Jl=4,Mu=5;var Fi=100,wu=101,Tu=102,Au=103,Eu=104,Cu=200,Ru=201,Iu=202,Pu=203,jl=204,Ql=205,Lu=206,Nu=207,Du=208,Uu=209,Ou=210,Fu=211,Bu=212,ku=213,zu=214,Ro=0,Io=1,Po=2,xs=3,Lo=4,No=5,Do=6,Uo=7,ta=0,Vu=1,Hu=2,yn=0,ec=1,tc=2,nc=3,ic=4,sc=5,rc=6,oc=7,zl="attached",Gu="detached",ac=300,mi=301,Bi=302,na=303,ia=304,Ir=306,ys=1e3,ln=1001,vs=1002,wt=1003,sa=1004;var ki=1005;var Tt=1006,Bs=1007;var Nn=1008;var Kt=1009,lc=1010,cc=1011,ks=1012,ra=1013,vn=1014,cn=1015,bn=1016,oa=1017,aa=1018,zs=1020,hc=35902,uc=35899,dc=1021,fc=1022,qt=1023,Rn=1026,gi=1027,pc=1028,la=1029,_i=1030,ca=1031;var ha=1033,Pr=33776,Lr=33777,Nr=33778,Dr=33779,ua=35840,da=35841,fa=35842,pa=35843,ma=36196,ga=37492,_a=37496,xa=37488,ya=37489,Ur=37490,va=37491,ba=37808,Sa=37809,Ma=37810,wa=37811,Ta=37812,Aa=37813,Ea=37814,Ca=37815,Ra=37816,Ia=37817,Pa=37818,La=37819,Na=37820,Da=37821,Ua=36492,Oa=36494,Fa=36495,Ba=36283,ka=36284,Or=36285,za=36286;var Li=2300,bs=2301,Ao=2302,Vl=2303,Hl=2400,Gl=2401,Wl=2402;var Wu=3200;var Fr=0,Xu=1,Sn="",yt="srgb",ur="srgb-linear",dr="linear",at="srgb";var Eo=7680;var Yu=519,qu=512,$u=513,Zu=514,Va=515,Ku=516,Ju=517,Ha=518,ju=519,Qu=35044;var mc="300 es",mn=2e3,Ss=2001;function _p(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function xp(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Ms(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function ed(){let i=Ms("canvas");return i.style.display="block",i}var Yh={},ws=null;function gc(...i){let e="THREE."+i.shift();ws?ws("log",e,...i):console.log(e,...i)}function td(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Le(...i){i=td(i);let e="THREE."+i.shift();if(ws)ws("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function Fe(...i){i=td(i);let e="THREE."+i.shift();if(ws)ws("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function Pi(...i){let e=i.join(" ");e in Yh||(Yh[e]=!0,Le(...i))}function nd(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var id={[Ro]:Io,[Po]:Do,[Lo]:Uo,[xs]:No,[Io]:Ro,[Do]:Po,[Uo]:Lo,[No]:xs},_n=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}},Bt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],qh=1234567,cr=Math.PI/180,Ts=180/Math.PI;function zi(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Bt[i&255]+Bt[i>>8&255]+Bt[i>>16&255]+Bt[i>>24&255]+"-"+Bt[e&255]+Bt[e>>8&255]+"-"+Bt[e>>16&15|64]+Bt[e>>24&255]+"-"+Bt[t&63|128]+Bt[t>>8&255]+"-"+Bt[t>>16&255]+Bt[t>>24&255]+Bt[n&255]+Bt[n>>8&255]+Bt[n>>16&255]+Bt[n>>24&255]).toLowerCase()}function $e(i,e,t){return Math.max(e,Math.min(t,i))}function _c(i,e){return(i%e+e)%e}function yp(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function vp(i,e,t){return i!==e?(t-i)/(e-i):0}function hr(i,e,t){return(1-t)*i+t*e}function bp(i,e,t,n){return hr(i,e,1-Math.exp(-t*n))}function Sp(i,e=1){return e-Math.abs(_c(i,e*2)-e)}function Mp(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function wp(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Tp(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Ap(i,e){return i+Math.random()*(e-i)}function Ep(i){return i*(.5-Math.random())}function Cp(i){i!==void 0&&(qh=i);let e=qh+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Rp(i){return i*cr}function Ip(i){return i*Ts}function Pp(i){return i>0&&Number.isInteger(i)&&2**Math.round(Math.log2(i))===i}function Lp(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Np(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Dp(i,e,t,n,s){let r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),c=r((e+n)/2),d=o((e+n)/2),h=r((e-n)/2),u=o((e-n)/2),p=r((n-e)/2),_=o((n-e)/2);switch(s){case"XYX":i.set(a*d,l*h,l*u,a*c);break;case"YZY":i.set(l*u,a*d,l*h,a*c);break;case"ZXZ":i.set(l*h,l*u,a*d,a*c);break;case"XZX":i.set(a*d,l*_,l*p,a*c);break;case"YXY":i.set(l*p,a*d,l*_,a*c);break;case"ZYZ":i.set(l*_,l*p,a*d,a*c);break;default:Le("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function gs(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Gt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Vi={DEG2RAD:cr,RAD2DEG:Ts,generateUUID:zi,clamp:$e,euclideanModulo:_c,mapLinear:yp,inverseLerp:vp,lerp:hr,damp:bp,pingpong:Sp,smoothstep:Mp,smootherstep:wp,randInt:Tp,randFloat:Ap,randFloatSpread:Ep,seededRandom:Cp,degToRad:Rp,radToDeg:Ip,isPowerOfTwo:Pp,ceilPowerOfTwo:Lp,floorPowerOfTwo:Np,setQuaternionFromProperEuler:Dp,normalize:Gt,denormalize:gs},Oe=class i{static{i.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=$e(this.x,e.x,t.x),this.y=$e(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=$e(this.x,e,t),this.y=$e(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar($e(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos($e(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*s+e.x,this.y=r*s+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Lt=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,o,a){let l=n[s+0],c=n[s+1],d=n[s+2],h=n[s+3],u=r[o+0],p=r[o+1],_=r[o+2],v=r[o+3];if(h!==v||l!==u||c!==p||d!==_){let m=l*u+c*p+d*_+h*v;m<0&&(u=-u,p=-p,_=-_,v=-v,m=-m);let f=1-a;if(m<.9995){let b=Math.acos(m),T=Math.sin(b);f=Math.sin(f*b)/T,a=Math.sin(a*b)/T,l=l*f+u*a,c=c*f+p*a,d=d*f+_*a,h=h*f+v*a}else{l=l*f+u*a,c=c*f+p*a,d=d*f+_*a,h=h*f+v*a;let b=1/Math.sqrt(l*l+c*c+d*d+h*h);l*=b,c*=b,d*=b,h*=b}}e[t]=l,e[t+1]=c,e[t+2]=d,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,s,r,o){let a=n[s],l=n[s+1],c=n[s+2],d=n[s+3],h=r[o],u=r[o+1],p=r[o+2],_=r[o+3];return e[t]=a*_+d*h+l*p-c*u,e[t+1]=l*_+d*u+c*h-a*p,e[t+2]=c*_+d*p+a*u-l*h,e[t+3]=d*_-a*h-l*u-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),d=a(s/2),h=a(r/2),u=l(n/2),p=l(s/2),_=l(r/2);switch(o){case"XYZ":this._x=u*d*h+c*p*_,this._y=c*p*h-u*d*_,this._z=c*d*_+u*p*h,this._w=c*d*h-u*p*_;break;case"YXZ":this._x=u*d*h+c*p*_,this._y=c*p*h-u*d*_,this._z=c*d*_-u*p*h,this._w=c*d*h+u*p*_;break;case"ZXY":this._x=u*d*h-c*p*_,this._y=c*p*h+u*d*_,this._z=c*d*_+u*p*h,this._w=c*d*h-u*p*_;break;case"ZYX":this._x=u*d*h-c*p*_,this._y=c*p*h+u*d*_,this._z=c*d*_-u*p*h,this._w=c*d*h+u*p*_;break;case"YZX":this._x=u*d*h+c*p*_,this._y=c*p*h+u*d*_,this._z=c*d*_-u*p*h,this._w=c*d*h-u*p*_;break;case"XZY":this._x=u*d*h-c*p*_,this._y=c*p*h-u*d*_,this._z=c*d*_+u*p*h,this._w=c*d*h+u*p*_;break;default:Le("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],d=t[6],h=t[10],u=n+a+h;if(u>0){let p=.5/Math.sqrt(u+1);this._w=.25/p,this._x=(d-l)*p,this._y=(r-c)*p,this._z=(o-s)*p}else if(n>a&&n>h){let p=2*Math.sqrt(1+n-a-h);this._w=(d-l)/p,this._x=.25*p,this._y=(s+o)/p,this._z=(r+c)/p}else if(a>h){let p=2*Math.sqrt(1+a-n-h);this._w=(r-c)/p,this._x=(s+o)/p,this._y=.25*p,this._z=(l+d)/p}else{let p=2*Math.sqrt(1+h-n-a);this._w=(o-s)/p,this._x=(r+c)/p,this._y=(l+d)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs($e(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,d=t._w;return this._x=n*d+o*a+s*c-r*l,this._y=s*d+o*l+r*a-n*c,this._z=r*d+o*c+n*l-s*a,this._w=o*d-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,o=e._w,a=this.dot(e);a<0&&(n=-n,s=-s,r=-r,o=-o,a=-a);let l=1-t;if(a<.9995){let c=Math.acos(a),d=Math.sin(c);l=Math.sin(l*c)/d,t=Math.sin(t*c)/d,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},U=class i{static{i.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion($h.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion($h.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*n),d=2*(a*t-r*s),h=2*(r*n-o*t);return this.x=t+l*c+o*h-a*d,this.y=n+l*d+a*c-r*h,this.z=s+l*h+r*d-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=$e(this.x,e.x,t.x),this.y=$e(this.y,e.y,t.y),this.z=$e(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=$e(this.x,e,t),this.y=$e(this.y,e,t),this.z=$e(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar($e(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return _l.copy(this).projectOnVector(e),this.sub(_l)}reflect(e){return this.sub(_l.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos($e(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},_l=new U,$h=new Lt,ze=class i{static{i.prototype.isMatrix3=!0}constructor(e,t,n,s,r,o,a,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c)}set(e,t,n,s,r,o,a,l,c){let d=this.elements;return d[0]=e,d[1]=s,d[2]=a,d[3]=t,d[4]=r,d[5]=l,d[6]=n,d[7]=o,d[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],d=n[4],h=n[7],u=n[2],p=n[5],_=n[8],v=s[0],m=s[3],f=s[6],b=s[1],T=s[4],y=s[7],w=s[2],S=s[5],E=s[8];return r[0]=o*v+a*b+l*w,r[3]=o*m+a*T+l*S,r[6]=o*f+a*y+l*E,r[1]=c*v+d*b+h*w,r[4]=c*m+d*T+h*S,r[7]=c*f+d*y+h*E,r[2]=u*v+p*b+_*w,r[5]=u*m+p*T+_*S,r[8]=u*f+p*y+_*E,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],d=e[8];return t*o*d-t*a*c-n*r*d+n*a*l+s*r*c-s*o*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],d=e[8],h=d*o-a*c,u=a*l-d*r,p=c*r-o*l,_=t*h+n*u+s*p;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);let v=1/_;return e[0]=h*v,e[1]=(s*c-d*n)*v,e[2]=(a*n-s*o)*v,e[3]=u*v,e[4]=(d*t-s*l)*v,e[5]=(s*r-a*t)*v,e[6]=p*v,e[7]=(n*l-c*t)*v,e[8]=(o*t-n*r)*v,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return Pi("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(xl.makeScale(e,t)),this}rotate(e){return Pi("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(xl.makeRotation(-e)),this}translate(e,t){return Pi("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(xl.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},xl=new ze,Zh=new ze().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Kh=new ze().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Up(){let i={enabled:!0,workingColorSpace:ur,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===at&&(s.r=Gn(s.r),s.g=Gn(s.g),s.b=Gn(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===at&&(s.r=_s(s.r),s.g=_s(s.g),s.b=_s(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Sn?dr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Pi("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Pi("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[ur]:{primaries:e,whitePoint:n,transfer:dr,toXYZ:Zh,fromXYZ:Kh,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:yt},outputColorSpaceConfig:{drawingBufferColorSpace:yt}},[yt]:{primaries:e,whitePoint:n,transfer:at,toXYZ:Zh,fromXYZ:Kh,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:yt}}}),i}var je=Up();function Gn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function _s(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var ns,As=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{ns===void 0&&(ns=Ms("canvas")),ns.width=e.width,ns.height=e.height;let s=ns.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=ns}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Ms("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Gn(r[o]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Gn(t[n]/255)*255):t[n]=Gn(t[n]);return{data:t,width:e.width,height:e.height}}else return Le("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Op=0,Wn=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Op++}),this.uuid=zi(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(yl(s[o].image)):r.push(yl(s[o]))}else r=yl(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function yl(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?As.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Le("Texture: Unable to serialize Texture."),{})}var Fp=0,vl=new U,Ut=class i extends _n{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=ln,s=ln,r=Tt,o=Nn,a=qt,l=Kt,c=i.DEFAULT_ANISOTROPY,d=Sn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Fp++}),this.uuid=zi(),this.name="",this.source=new Wn(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Oe(0,0),this.repeat=new Oe(1,1),this.center=new Oe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ze,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(vl).x}get height(){return this.source.getSize(vl).y}get depth(){return this.source.getSize(vl).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){Le(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Le(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==ac)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ys:e.x=e.x-Math.floor(e.x);break;case ln:e.x=e.x<0?0:1;break;case vs:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ys:e.y=e.y-Math.floor(e.y);break;case ln:e.y=e.y<0?0:1;break;case vs:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Ut.DEFAULT_IMAGE=null;Ut.DEFAULT_MAPPING=ac;Ut.DEFAULT_ANISOTROPY=1;var lt=class i{static{i.prototype.isVector4=!0}constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],d=l[4],h=l[8],u=l[1],p=l[5],_=l[9],v=l[2],m=l[6],f=l[10];if(Math.abs(d-u)<.01&&Math.abs(h-v)<.01&&Math.abs(_-m)<.01){if(Math.abs(d+u)<.1&&Math.abs(h+v)<.1&&Math.abs(_+m)<.1&&Math.abs(c+p+f-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let T=(c+1)/2,y=(p+1)/2,w=(f+1)/2,S=(d+u)/4,E=(h+v)/4,g=(_+m)/4;return T>y&&T>w?T<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(T),s=S/n,r=E/n):y>w?y<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(y),n=S/s,r=g/s):w<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(w),n=E/r,s=g/r),this.set(n,s,r,t),this}let b=Math.sqrt((m-_)*(m-_)+(h-v)*(h-v)+(u-d)*(u-d));return Math.abs(b)<.001&&(b=1),this.x=(m-_)/b,this.y=(h-v)/b,this.z=(u-d)/b,this.w=Math.acos((c+p+f-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=$e(this.x,e.x,t.x),this.y=$e(this.y,e.y,t.y),this.z=$e(this.z,e.z,t.z),this.w=$e(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=$e(this.x,e,t),this.y=$e(this.y,e,t),this.z=$e(this.z,e,t),this.w=$e(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar($e(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Oo=class extends _n{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Tt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new lt(0,0,e,t),this.scissorTest=!1,this.viewport=new lt(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:n.depth},r=new Ut(s),o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Tt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new Wn(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Zt=class extends Oo{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},fr=class extends Ut{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=wt,this.minFilter=wt,this.wrapR=ln,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Fo=class extends Ut{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=wt,this.minFilter=wt,this.wrapR=ln,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var ke=class i{static{i.prototype.isMatrix4=!0}constructor(e,t,n,s,r,o,a,l,c,d,h,u,p,_,v,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c,d,h,u,p,_,v,m)}set(e,t,n,s,r,o,a,l,c,d,h,u,p,_,v,m){let f=this.elements;return f[0]=e,f[4]=t,f[8]=n,f[12]=s,f[1]=r,f[5]=o,f[9]=a,f[13]=l,f[2]=c,f[6]=d,f[10]=h,f[14]=u,f[3]=p,f[7]=_,f[11]=v,f[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,s=1/is.setFromMatrixColumn(e,0).length(),r=1/is.setFromMatrixColumn(e,1).length(),o=1/is.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),d=Math.cos(r),h=Math.sin(r);if(e.order==="XYZ"){let u=o*d,p=o*h,_=a*d,v=a*h;t[0]=l*d,t[4]=-l*h,t[8]=c,t[1]=p+_*c,t[5]=u-v*c,t[9]=-a*l,t[2]=v-u*c,t[6]=_+p*c,t[10]=o*l}else if(e.order==="YXZ"){let u=l*d,p=l*h,_=c*d,v=c*h;t[0]=u+v*a,t[4]=_*a-p,t[8]=o*c,t[1]=o*h,t[5]=o*d,t[9]=-a,t[2]=p*a-_,t[6]=v+u*a,t[10]=o*l}else if(e.order==="ZXY"){let u=l*d,p=l*h,_=c*d,v=c*h;t[0]=u-v*a,t[4]=-o*h,t[8]=_+p*a,t[1]=p+_*a,t[5]=o*d,t[9]=v-u*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let u=o*d,p=o*h,_=a*d,v=a*h;t[0]=l*d,t[4]=_*c-p,t[8]=u*c+v,t[1]=l*h,t[5]=v*c+u,t[9]=p*c-_,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let u=o*l,p=o*c,_=a*l,v=a*c;t[0]=l*d,t[4]=v-u*h,t[8]=_*h+p,t[1]=h,t[5]=o*d,t[9]=-a*d,t[2]=-c*d,t[6]=p*h+_,t[10]=u-v*h}else if(e.order==="XZY"){let u=o*l,p=o*c,_=a*l,v=a*c;t[0]=l*d,t[4]=-h,t[8]=c*d,t[1]=u*h+v,t[5]=o*d,t[9]=p*h-_,t[2]=_*h-p,t[6]=a*d,t[10]=v*h+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Bp,e,kp)}lookAt(e,t,n){let s=this.elements;return jt.subVectors(e,t),jt.lengthSq()===0&&(jt.z=1),jt.normalize(),ei.crossVectors(n,jt),ei.lengthSq()===0&&(Math.abs(n.z)===1?jt.x+=1e-4:jt.z+=1e-4,jt.normalize(),ei.crossVectors(n,jt)),ei.normalize(),ro.crossVectors(jt,ei),s[0]=ei.x,s[4]=ro.x,s[8]=jt.x,s[1]=ei.y,s[5]=ro.y,s[9]=jt.y,s[2]=ei.z,s[6]=ro.z,s[10]=jt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],d=n[1],h=n[5],u=n[9],p=n[13],_=n[2],v=n[6],m=n[10],f=n[14],b=n[3],T=n[7],y=n[11],w=n[15],S=s[0],E=s[4],g=s[8],A=s[12],R=s[1],P=s[5],O=s[9],k=s[13],I=s[2],F=s[6],$=s[10],X=s[14],ne=s[3],q=s[7],K=s[11],ee=s[15];return r[0]=o*S+a*R+l*I+c*ne,r[4]=o*E+a*P+l*F+c*q,r[8]=o*g+a*O+l*$+c*K,r[12]=o*A+a*k+l*X+c*ee,r[1]=d*S+h*R+u*I+p*ne,r[5]=d*E+h*P+u*F+p*q,r[9]=d*g+h*O+u*$+p*K,r[13]=d*A+h*k+u*X+p*ee,r[2]=_*S+v*R+m*I+f*ne,r[6]=_*E+v*P+m*F+f*q,r[10]=_*g+v*O+m*$+f*K,r[14]=_*A+v*k+m*X+f*ee,r[3]=b*S+T*R+y*I+w*ne,r[7]=b*E+T*P+y*F+w*q,r[11]=b*g+T*O+y*$+w*K,r[15]=b*A+T*k+y*X+w*ee,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],d=e[2],h=e[6],u=e[10],p=e[14],_=e[3],v=e[7],m=e[11],f=e[15],b=l*p-c*u,T=a*p-c*h,y=a*u-l*h,w=o*p-c*d,S=o*u-l*d,E=o*h-a*d;return t*(v*b-m*T+f*y)-n*(_*b-m*w+f*S)+s*(_*T-v*w+f*E)-r*(_*y-v*S+m*E)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],o=e[5],a=e[9],l=e[2],c=e[6],d=e[10];return t*(o*d-a*c)-n*(r*d-a*l)+s*(r*c-o*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],d=e[8],h=e[9],u=e[10],p=e[11],_=e[12],v=e[13],m=e[14],f=e[15],b=t*a-n*o,T=t*l-s*o,y=t*c-r*o,w=n*l-s*a,S=n*c-r*a,E=s*c-r*l,g=d*v-h*_,A=d*m-u*_,R=d*f-p*_,P=h*m-u*v,O=h*f-p*v,k=u*f-p*m,I=b*k-T*O+y*P+w*R-S*A+E*g;if(I===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let F=1/I;return e[0]=(a*k-l*O+c*P)*F,e[1]=(s*O-n*k-r*P)*F,e[2]=(v*E-m*S+f*w)*F,e[3]=(u*S-h*E-p*w)*F,e[4]=(l*R-o*k-c*A)*F,e[5]=(t*k-s*R+r*A)*F,e[6]=(m*y-_*E-f*T)*F,e[7]=(d*E-u*y+p*T)*F,e[8]=(o*O-a*R+c*g)*F,e[9]=(n*R-t*O-r*g)*F,e[10]=(_*S-v*y+f*b)*F,e[11]=(h*y-d*S-p*b)*F,e[12]=(a*A-o*P-l*g)*F,e[13]=(t*P-n*A+s*g)*F,e[14]=(v*T-_*w-m*b)*F,e[15]=(d*w-h*T+u*b)*F,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,c=r*o,d=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,d*a+n,d*l-s*o,0,c*l-s*a,d*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,o){return this.set(1,n,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,d=o+o,h=a+a,u=r*c,p=r*d,_=r*h,v=o*d,m=o*h,f=a*h,b=l*c,T=l*d,y=l*h,w=n.x,S=n.y,E=n.z;return s[0]=(1-(v+f))*w,s[1]=(p+y)*w,s[2]=(_-T)*w,s[3]=0,s[4]=(p-y)*S,s[5]=(1-(u+f))*S,s[6]=(m+b)*S,s[7]=0,s[8]=(_+T)*E,s[9]=(m-b)*E,s[10]=(1-(u+v))*E,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let o=is.set(s[0],s[1],s[2]).length(),a=is.set(s[4],s[5],s[6]).length(),l=is.set(s[8],s[9],s[10]).length();r<0&&(o=-o),dn.copy(this);let c=1/o,d=1/a,h=1/l;return dn.elements[0]*=c,dn.elements[1]*=c,dn.elements[2]*=c,dn.elements[4]*=d,dn.elements[5]*=d,dn.elements[6]*=d,dn.elements[8]*=h,dn.elements[9]*=h,dn.elements[10]*=h,t.setFromRotationMatrix(dn),n.x=o,n.y=a,n.z=l,this}makePerspective(e,t,n,s,r,o,a=mn,l=!1){let c=this.elements,d=2*r/(t-e),h=2*r/(n-s),u=(t+e)/(t-e),p=(n+s)/(n-s),_,v;if(l)_=r/(o-r),v=o*r/(o-r);else if(a===mn)_=-(o+r)/(o-r),v=-2*o*r/(o-r);else if(a===Ss)_=-o/(o-r),v=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=d,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=h,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=_,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,o,a=mn,l=!1){let c=this.elements,d=2/(t-e),h=2/(n-s),u=-(t+e)/(t-e),p=-(n+s)/(n-s),_,v;if(l)_=1/(o-r),v=o/(o-r);else if(a===mn)_=-2/(o-r),v=-(o+r)/(o-r);else if(a===Ss)_=-1/(o-r),v=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=d,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=h,c[9]=0,c[13]=p,c[2]=0,c[6]=0,c[10]=_,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},is=new U,dn=new ke,Bp=new U(0,0,0),kp=new U(1,1,1),ei=new U,ro=new U,jt=new U,Jh=new ke,jh=new Lt,In=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],d=s[9],h=s[2],u=s[6],p=s[10];switch(t){case"XYZ":this._y=Math.asin($e(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-d,p),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-$e(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin($e(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-h,p),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-$e(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(u,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin($e(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-d,c),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-$e(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-d,p),this._y=0);break;default:Le("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Jh.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Jh,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return jh.setFromEuler(this),this.setFromQuaternion(jh,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};In.DEFAULT_ORDER="XYZ";var pr=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},zp=0,Qh=new U,ss=new Lt,Bn=new ke,oo=new U,sr=new U,Vp=new U,Hp=new Lt,eu=new U(1,0,0),tu=new U(0,1,0),nu=new U(0,0,1),iu={type:"added"},Gp={type:"removed"},rs={type:"childadded",child:null},bl={type:"childremoved",child:null},Ot=class i extends _n{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:zp++}),this.uuid=zi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new U,t=new In,n=new Lt,s=new U(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ke},normalMatrix:{value:new ze}}),this.matrix=new ke,this.matrixWorld=new ke,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new pr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ss.setFromAxisAngle(e,t),this.quaternion.multiply(ss),this}rotateOnWorldAxis(e,t){return ss.setFromAxisAngle(e,t),this.quaternion.premultiply(ss),this}rotateX(e){return this.rotateOnAxis(eu,e)}rotateY(e){return this.rotateOnAxis(tu,e)}rotateZ(e){return this.rotateOnAxis(nu,e)}translateOnAxis(e,t){return Qh.copy(e).applyQuaternion(this.quaternion),this.position.add(Qh.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(eu,e)}translateY(e){return this.translateOnAxis(tu,e)}translateZ(e){return this.translateOnAxis(nu,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Bn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?oo.copy(e):oo.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),sr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Bn.lookAt(sr,oo,this.up):Bn.lookAt(oo,sr,this.up),this.quaternion.setFromRotationMatrix(Bn),s&&(Bn.extractRotation(s.matrixWorld),ss.setFromRotationMatrix(Bn),this.quaternion.premultiply(ss.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Fe("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(iu),rs.child=e,this.dispatchEvent(rs),rs.child=null):Fe("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Gp),bl.child=e,this.dispatchEvent(bl),bl.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Bn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Bn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Bn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(iu),rs.child=e,this.dispatchEvent(rs),rs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(sr,e,Vp),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(sr,Hp,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,d=l.length;c<d;c++){let h=l[c];r(e.shapes,h)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),d=o(e.images),h=o(e.shapes),u=o(e.skeletons),p=o(e.animations),_=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),d.length>0&&(n.images=d),h.length>0&&(n.shapes=h),u.length>0&&(n.skeletons=u),p.length>0&&(n.animations=p),_.length>0&&(n.nodes=_)}return n.object=s,n;function o(a){let l=[];for(let c in a){let d=a[c];delete d.metadata,l.push(d)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Ot.DEFAULT_UP=new U(0,1,0);Ot.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ot.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var gn=class extends Ot{constructor(){super(),this.isGroup=!0,this.type="Group"}},Wp={type:"move"},Es=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new gn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new gn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new gn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let v of e.hand.values()){let m=t.getJointPose(v,n),f=this._getHandJoint(c,v);m!==null&&(f.matrix.fromArray(m.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=m.radius),f.visible=m!==null}let d=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],u=d.position.distanceTo(h.position),p=.02,_=.005;c.inputState.pinching&&u>p+_?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&u<=p-_&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Wp)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new gn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},sd={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ti={h:0,s:0,l:0},ao={h:0,s:0,l:0};function Sl(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Be=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=yt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,je.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=je.workingColorSpace){return this.r=e,this.g=t,this.b=n,je.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=je.workingColorSpace){if(e=_c(e,1),t=$e(t,0,1),n=$e(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=Sl(o,r,e+1/3),this.g=Sl(o,r,e),this.b=Sl(o,r,e-1/3)}return je.colorSpaceToWorking(this,s),this}setStyle(e,t=yt){function n(r){r!==void 0&&parseFloat(r)<1&&Le("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Le("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);Le("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=yt){let n=sd[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Le("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Gn(e.r),this.g=Gn(e.g),this.b=Gn(e.b),this}copyLinearToSRGB(e){return this.r=_s(e.r),this.g=_s(e.g),this.b=_s(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=yt){return je.workingToColorSpace(kt.copy(this),e),Math.round($e(kt.r*255,0,255))*65536+Math.round($e(kt.g*255,0,255))*256+Math.round($e(kt.b*255,0,255))}getHexString(e=yt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=je.workingColorSpace){je.workingToColorSpace(kt.copy(this),t);let n=kt.r,s=kt.g,r=kt.b,o=Math.max(n,s,r),a=Math.min(n,s,r),l,c,d=(a+o)/2;if(a===o)l=0,c=0;else{let h=o-a;switch(c=d<=.5?h/(o+a):h/(2-o-a),o){case n:l=(s-r)/h+(s<r?6:0);break;case s:l=(r-n)/h+2;break;case r:l=(n-s)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=d,e}getRGB(e,t=je.workingColorSpace){return je.workingToColorSpace(kt.copy(this),t),e.r=kt.r,e.g=kt.g,e.b=kt.b,e}getStyle(e=yt){je.workingToColorSpace(kt.copy(this),e);let t=kt.r,n=kt.g,s=kt.b;return e!==yt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(ti),this.setHSL(ti.h+e,ti.s+t,ti.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(ti),e.getHSL(ao);let n=hr(ti.h,ao.h,t),s=hr(ti.s,ao.s,t),r=hr(ti.l,ao.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},kt=new Be;Be.NAMES=sd;var oi=class extends Ot{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new In,this.environmentIntensity=1,this.environmentRotation=new In,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},fn=new U,kn=new U,Ml=new U,zn=new U,os=new U,as=new U,su=new U,wl=new U,Tl=new U,Al=new U,El=new lt,Cl=new lt,Rl=new lt,ri=class i{constructor(e=new U,t=new U,n=new U){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),fn.subVectors(e,t),s.cross(fn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){fn.subVectors(s,t),kn.subVectors(n,t),Ml.subVectors(e,t);let o=fn.dot(fn),a=fn.dot(kn),l=fn.dot(Ml),c=kn.dot(kn),d=kn.dot(Ml),h=o*c-a*a;if(h===0)return r.set(0,0,0),null;let u=1/h,p=(c*l-a*d)*u,_=(o*d-a*l)*u;return r.set(1-p-_,_,p)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,zn)===null?!1:zn.x>=0&&zn.y>=0&&zn.x+zn.y<=1}static getInterpolation(e,t,n,s,r,o,a,l){return this.getBarycoord(e,t,n,s,zn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,zn.x),l.addScaledVector(o,zn.y),l.addScaledVector(a,zn.z),l)}static getInterpolatedAttribute(e,t,n,s,r,o){return El.setScalar(0),Cl.setScalar(0),Rl.setScalar(0),El.fromBufferAttribute(e,t),Cl.fromBufferAttribute(e,n),Rl.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(El,r.x),o.addScaledVector(Cl,r.y),o.addScaledVector(Rl,r.z),o}static isFrontFacing(e,t,n,s){return fn.subVectors(n,t),kn.subVectors(e,t),fn.cross(kn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return fn.subVectors(this.c,this.b),kn.subVectors(this.a,this.b),fn.cross(kn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,o,a;os.subVectors(s,n),as.subVectors(r,n),wl.subVectors(e,n);let l=os.dot(wl),c=as.dot(wl);if(l<=0&&c<=0)return t.copy(n);Tl.subVectors(e,s);let d=os.dot(Tl),h=as.dot(Tl);if(d>=0&&h<=d)return t.copy(s);let u=l*h-d*c;if(u<=0&&l>=0&&d<=0)return o=l/(l-d),t.copy(n).addScaledVector(os,o);Al.subVectors(e,r);let p=os.dot(Al),_=as.dot(Al);if(_>=0&&p<=_)return t.copy(r);let v=p*c-l*_;if(v<=0&&c>=0&&_<=0)return a=c/(c-_),t.copy(n).addScaledVector(as,a);let m=d*_-p*h;if(m<=0&&h-d>=0&&p-_>=0)return su.subVectors(r,s),a=(h-d)/(h-d+(p-_)),t.copy(s).addScaledVector(su,a);let f=1/(m+v+u);return o=v*f,a=u*f,t.copy(n).addScaledVector(os,o).addScaledVector(as,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},xn=class{constructor(e=new U(1/0,1/0,1/0),t=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(pn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(pn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=pn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,pn):pn.fromBufferAttribute(r,o),pn.applyMatrix4(e.matrixWorld),this.expandByPoint(pn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),lo.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),lo.copy(n.boundingBox)),lo.applyMatrix4(e.matrixWorld),this.union(lo)}let s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,pn),pn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(rr),co.subVectors(this.max,rr),ls.subVectors(e.a,rr),cs.subVectors(e.b,rr),hs.subVectors(e.c,rr),ni.subVectors(cs,ls),ii.subVectors(hs,cs),Ei.subVectors(ls,hs);let t=[0,-ni.z,ni.y,0,-ii.z,ii.y,0,-Ei.z,Ei.y,ni.z,0,-ni.x,ii.z,0,-ii.x,Ei.z,0,-Ei.x,-ni.y,ni.x,0,-ii.y,ii.x,0,-Ei.y,Ei.x,0];return!Il(t,ls,cs,hs,co)||(t=[1,0,0,0,1,0,0,0,1],!Il(t,ls,cs,hs,co))?!1:(ho.crossVectors(ni,ii),t=[ho.x,ho.y,ho.z],Il(t,ls,cs,hs,co))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,pn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(pn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Vn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Vn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Vn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Vn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Vn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Vn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Vn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Vn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Vn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Vn=[new U,new U,new U,new U,new U,new U,new U,new U],pn=new U,lo=new xn,ls=new U,cs=new U,hs=new U,ni=new U,ii=new U,Ei=new U,rr=new U,co=new U,ho=new U,Ci=new U;function Il(i,e,t,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){Ci.fromArray(i,r);let a=s.x*Math.abs(Ci.x)+s.y*Math.abs(Ci.y)+s.z*Math.abs(Ci.z),l=e.dot(Ci),c=t.dot(Ci),d=n.dot(Ci);if(Math.max(-Math.max(l,c,d),Math.min(l,c,d))>a)return!1}return!0}var Mt=new U,uo=new Oe,Xp=0,Ge=class extends _n{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Xp++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Qu,this.updateRanges=[],this.gpuType=cn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)uo.fromBufferAttribute(this,t),uo.applyMatrix3(e),this.setXY(t,uo.x,uo.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Mt.fromBufferAttribute(this,t),Mt.applyMatrix3(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Mt.fromBufferAttribute(this,t),Mt.applyMatrix4(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Mt.fromBufferAttribute(this,t),Mt.applyNormalMatrix(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Mt.fromBufferAttribute(this,t),Mt.transformDirection(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=gs(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Gt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=gs(t,this.array)),t}setX(e,t){return this.normalized&&(t=Gt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=gs(t,this.array)),t}setY(e,t){return this.normalized&&(t=Gt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=gs(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Gt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=gs(t,this.array)),t}setW(e,t){return this.normalized&&(t=Gt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Gt(t,this.array),n=Gt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Gt(t,this.array),n=Gt(n,this.array),s=Gt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=Gt(t,this.array),n=Gt(n,this.array),s=Gt(s,this.array),r=Gt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}};var Xn=class extends Ge{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Ni=class extends Ge{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var Wt=class extends Ge{constructor(e,t,n){super(new Float32Array(e),t,n)}},Yp=new xn,or=new U,Pl=new U,ai=class{constructor(e=new U,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):Yp.setFromPoints(e).getCenter(n);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;or.subVectors(e,this.center);let t=or.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(or,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Pl.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(or.copy(e.center).add(Pl)),this.expandByPoint(or.copy(e.center).sub(Pl))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},qp=0,an=new ke,Ll=new Ot,us=new U,Qt=new xn,ar=new xn,Pt=new U,At=class i extends _n{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:qp++}),this.uuid=zi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(_p(e)?Ni:Xn)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new ze().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return an.makeRotationFromQuaternion(e),this.applyMatrix4(an),this}rotateX(e){return an.makeRotationX(e),this.applyMatrix4(an),this}rotateY(e){return an.makeRotationY(e),this.applyMatrix4(an),this}rotateZ(e){return an.makeRotationZ(e),this.applyMatrix4(an),this}translate(e,t,n){return an.makeTranslation(e,t,n),this.applyMatrix4(an),this}scale(e,t,n){return an.makeScale(e,t,n),this.applyMatrix4(an),this}lookAt(e){return Ll.lookAt(e),Ll.updateMatrix(),this.applyMatrix4(Ll.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(us).negate(),this.translate(us.x,us.y,us.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let o=e[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Wt(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Le("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new xn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Fe("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];Qt.setFromBufferAttribute(r),this.morphTargetsRelative?(Pt.addVectors(this.boundingBox.min,Qt.min),this.boundingBox.expandByPoint(Pt),Pt.addVectors(this.boundingBox.max,Qt.max),this.boundingBox.expandByPoint(Pt)):(this.boundingBox.expandByPoint(Qt.min),this.boundingBox.expandByPoint(Qt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Fe('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ai);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Fe("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new U,1/0);return}if(e){let n=this.boundingSphere.center;if(Qt.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];ar.setFromBufferAttribute(a),this.morphTargetsRelative?(Pt.addVectors(Qt.min,ar.min),Qt.expandByPoint(Pt),Pt.addVectors(Qt.max,ar.max),Qt.expandByPoint(Pt)):(Qt.expandByPoint(ar.min),Qt.expandByPoint(ar.max))}Qt.getCenter(n);let s=0;for(let r=0,o=e.count;r<o;r++)Pt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Pt));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],l=this.morphTargetsRelative;for(let c=0,d=a.count;c<d;c++)Pt.fromBufferAttribute(a,c),l&&(us.fromBufferAttribute(e,c),Pt.add(us)),s=Math.max(s,n.distanceToSquared(Pt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Fe('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Fe("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new Ge(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));let a=[],l=[];for(let g=0;g<n.count;g++)a[g]=new U,l[g]=new U;let c=new U,d=new U,h=new U,u=new Oe,p=new Oe,_=new Oe,v=new U,m=new U;function f(g,A,R){c.fromBufferAttribute(n,g),d.fromBufferAttribute(n,A),h.fromBufferAttribute(n,R),u.fromBufferAttribute(r,g),p.fromBufferAttribute(r,A),_.fromBufferAttribute(r,R),d.sub(c),h.sub(c),p.sub(u),_.sub(u);let P=1/(p.x*_.y-_.x*p.y);isFinite(P)&&(v.copy(d).multiplyScalar(_.y).addScaledVector(h,-p.y).multiplyScalar(P),m.copy(h).multiplyScalar(p.x).addScaledVector(d,-_.x).multiplyScalar(P),a[g].add(v),a[A].add(v),a[R].add(v),l[g].add(m),l[A].add(m),l[R].add(m))}let b=this.groups;b.length===0&&(b=[{start:0,count:e.count}]);for(let g=0,A=b.length;g<A;++g){let R=b[g],P=R.start,O=R.count;for(let k=P,I=P+O;k<I;k+=3)f(e.getX(k+0),e.getX(k+1),e.getX(k+2))}let T=new U,y=new U,w=new U,S=new U;function E(g){w.fromBufferAttribute(s,g),S.copy(w);let A=a[g];T.copy(A),T.sub(w.multiplyScalar(w.dot(A))).normalize(),y.crossVectors(S,A);let P=y.dot(l[g])<0?-1:1;o.setXYZW(g,T.x,T.y,T.z,P)}for(let g=0,A=b.length;g<A;++g){let R=b[g],P=R.start,O=R.count;for(let k=P,I=P+O;k<I;k+=3)E(e.getX(k+0)),E(e.getX(k+1)),E(e.getX(k+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new Ge(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let u=0,p=n.count;u<p;u++)n.setXYZ(u,0,0,0);let s=new U,r=new U,o=new U,a=new U,l=new U,c=new U,d=new U,h=new U;if(e)for(let u=0,p=e.count;u<p;u+=3){let _=e.getX(u+0),v=e.getX(u+1),m=e.getX(u+2);s.fromBufferAttribute(t,_),r.fromBufferAttribute(t,v),o.fromBufferAttribute(t,m),d.subVectors(o,r),h.subVectors(s,r),d.cross(h),a.fromBufferAttribute(n,_),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,m),a.add(d),l.add(d),c.add(d),n.setXYZ(_,a.x,a.y,a.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let u=0,p=t.count;u<p;u+=3)s.fromBufferAttribute(t,u+0),r.fromBufferAttribute(t,u+1),o.fromBufferAttribute(t,u+2),d.subVectors(o,r),h.subVectors(s,r),d.cross(h),n.setXYZ(u+0,d.x,d.y,d.z),n.setXYZ(u+1,d.x,d.y,d.z),n.setXYZ(u+2,d.x,d.y,d.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Pt.fromBufferAttribute(e,t),Pt.normalize(),e.setXYZ(t,Pt.x,Pt.y,Pt.z)}toNonIndexed(){function e(a,l){let c=a.array,d=a.itemSize,h=a.normalized,u=new c.constructor(l.length*d),p=0,_=0;for(let v=0,m=l.length;v<m;v++){a.isInterleavedBufferAttribute?p=l[v]*a.data.stride+a.offset:p=l[v]*d;for(let f=0;f<d;f++)u[_++]=c[p++]}return new Ge(u,d,h)}if(this.index===null)return Le("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let a in s){let l=s[a],c=e(l,n);t.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let d=0,h=c.length;d<h;d++){let u=c[d],p=e(u,n);l.push(p)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],d=[];for(let h=0,u=c.length;h<u;h++){let p=c[h];d.push(p.toJSON(e.data))}d.length>0&&(s[l]=d,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let d=s[c];this.setAttribute(c,d.clone(t))}let r=e.morphAttributes;for(let c in r){let d=[],h=r[c];for(let u=0,p=h.length;u<p;u++)d.push(h[u].clone(t));this.morphAttributes[c]=d}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,d=o.length;c<d;c++){let h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var Nl=new U,$p=new U,Zp=new ze,en=class{constructor(e=new U(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=Nl.subVectors(n,t).cross($p.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let s=e.delta(Nl),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let o=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(o<0||o>1)?null:t.copy(e.start).addScaledVector(s,o)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Zp.getNormalMatrix(e),s=this.coplanarPoint(Nl).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Kp=0,Yn=class extends _n{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Kp++}),this.uuid=zi(),this.name="",this.type="Material",this.blending=Fs,this.side=Pn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=jl,this.blendDst=Ql,this.blendEquation=Fi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Be(0,0,0),this.blendAlpha=0,this.depthFunc=xs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Yu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Eo,this.stencilZFail=Eo,this.stencilZPass=Eo,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){Le(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Le(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(t){let r=s(e.textures),o=s(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Be().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new en().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Oe().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Oe().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var Hn=new U,Dl=new U,fo=new U,po=new U,Di=class{constructor(e=new U,t=new U(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Hn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Hn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Hn.copy(this.origin).addScaledVector(this.direction,t),Hn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Dl.copy(e).add(t).multiplyScalar(.5),fo.copy(t).sub(e).normalize(),po.copy(this.origin).sub(Dl);let r=e.distanceTo(t)*.5,o=-this.direction.dot(fo),a=po.dot(this.direction),l=-po.dot(fo),c=po.lengthSq(),d=Math.abs(1-o*o),h,u,p,_;if(d>0)if(h=o*l-a,u=o*a-l,_=r*d,h>=0)if(u>=-_)if(u<=_){let v=1/d;h*=v,u*=v,p=h*(h+o*u+2*a)+u*(o*h+u+2*l)+c}else u=r,h=Math.max(0,-(o*u+a)),p=-h*h+u*(u+2*l)+c;else u=-r,h=Math.max(0,-(o*u+a)),p=-h*h+u*(u+2*l)+c;else u<=-_?(h=Math.max(0,-(-o*r+a)),u=h>0?-r:Math.min(Math.max(-r,-l),r),p=-h*h+u*(u+2*l)+c):u<=_?(h=0,u=Math.min(Math.max(-r,-l),r),p=u*(u+2*l)+c):(h=Math.max(0,-(o*r+a)),u=h>0?r:Math.min(Math.max(-r,-l),r),p=-h*h+u*(u+2*l)+c);else u=o>0?-r:r,h=Math.max(0,-(o*u+a)),p=-h*h+u*(u+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(Dl).addScaledVector(fo,u),p}intersectSphere(e,t){if(e.radius<0)return null;Hn.subVectors(e.center,this.origin);let n=Hn.dot(this.direction),s=Hn.dot(Hn)-n*n,r=e.radius*e.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,o,a,l,c=1/this.direction.x,d=1/this.direction.y,h=1/this.direction.z,u=this.origin;return c>=0?(n=(e.min.x-u.x)*c,s=(e.max.x-u.x)*c):(n=(e.max.x-u.x)*c,s=(e.min.x-u.x)*c),d>=0?(r=(e.min.y-u.y)*d,o=(e.max.y-u.y)*d):(r=(e.max.y-u.y)*d,o=(e.min.y-u.y)*d),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),h>=0?(a=(e.min.z-u.z)*h,l=(e.max.z-u.z)*h):(a=(e.max.z-u.z)*h,l=(e.min.z-u.z)*h),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,Hn)!==null}intersectTriangle(e,t,n,s,r){let o=this.origin,a=this.direction,l=a.x,c=a.y,d=a.z,h=e.x-o.x,u=e.y-o.y,p=e.z-o.z,_=t.x-o.x,v=t.y-o.y,m=t.z-o.z,f=n.x-o.x,b=n.y-o.y,T=n.z-o.z,y=Math.abs(l),w=Math.abs(c),S=Math.abs(d),E,g,A,R,P,O,k,I,F,$,X,ne;if(y>=w&&y>=S?(A=l,O=h,F=_,ne=f,l>=0?(E=c,g=d,R=u,P=p,k=v,I=m,$=b,X=T):(E=d,g=c,R=p,P=u,k=m,I=v,$=T,X=b)):w>=S?(A=c,O=u,F=v,ne=b,c>=0?(E=d,g=l,R=p,P=h,k=m,I=_,$=T,X=f):(E=l,g=d,R=h,P=p,k=_,I=m,$=f,X=T)):(A=d,O=p,F=m,ne=T,d>=0?(E=l,g=c,R=h,P=u,k=_,I=v,$=f,X=b):(E=c,g=l,R=u,P=h,k=v,I=_,$=b,X=f)),A===0)return null;let q=E/A,K=g/A,ee=1/A,be=R-q*O,Se=P-K*O,tt=k-q*F,He=I-K*F,te=$-q*ne,H=X-K*ne,G=te*He-H*tt,oe=be*H-Se*te,Te=tt*Se-He*be;if(s){if(G<0||oe<0||Te<0)return null}else if((G<0||oe<0||Te<0)&&(G>0||oe>0||Te>0))return null;let de=G+oe+Te;if(de===0)return null;let Ne=ee*(G*O+oe*F+Te*ne);return(de>0?Ne<0:Ne>0)?null:this.at(Ne/de,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Ui=class extends Yn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Be(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new In,this.combine=ta,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},ru=new ke,Ri=new Di,mo=new ai,ou=new U,go=new U,_o=new U,xo=new U,Ul=new U,yo=new U,au=new U,vo=new U,Xt=class extends Ot{constructor(e=new At,t=new Ui){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let a=this.morphTargetInfluences;if(r&&a){yo.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let d=a[l],h=r[l];d!==0&&(Ul.fromBufferAttribute(h,e),o?yo.addScaledVector(Ul,d):yo.addScaledVector(Ul.sub(t),d))}t.add(yo)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),mo.copy(n.boundingSphere),mo.applyMatrix4(r),Ri.copy(e.ray).recast(e.near),!(mo.containsPoint(Ri.origin)===!1&&(Ri.intersectSphere(mo,ou)===null||Ri.origin.distanceToSquared(ou)>(e.far-e.near)**2))&&(ru.copy(r).invert(),Ri.copy(e.ray).applyMatrix4(ru),!(n.boundingBox!==null&&Ri.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Ri)))}_computeIntersections(e,t,n){let s,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,d=r.attributes.uv1,h=r.attributes.normal,u=r.groups,p=r.drawRange;if(a!==null)if(Array.isArray(o))for(let _=0,v=u.length;_<v;_++){let m=u[_],f=o[m.materialIndex],b=Math.max(m.start,p.start),T=Math.min(a.count,Math.min(m.start+m.count,p.start+p.count));for(let y=b,w=T;y<w;y+=3){let S=a.getX(y),E=a.getX(y+1),g=a.getX(y+2);s=bo(this,f,e,n,c,d,h,S,E,g),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let _=Math.max(0,p.start),v=Math.min(a.count,p.start+p.count);for(let m=_,f=v;m<f;m+=3){let b=a.getX(m),T=a.getX(m+1),y=a.getX(m+2);s=bo(this,o,e,n,c,d,h,b,T,y),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let _=0,v=u.length;_<v;_++){let m=u[_],f=o[m.materialIndex],b=Math.max(m.start,p.start),T=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let y=b,w=T;y<w;y+=3){let S=y,E=y+1,g=y+2;s=bo(this,f,e,n,c,d,h,S,E,g),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let _=Math.max(0,p.start),v=Math.min(l.count,p.start+p.count);for(let m=_,f=v;m<f;m+=3){let b=m,T=m+1,y=m+2;s=bo(this,o,e,n,c,d,h,b,T,y),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function Jp(i,e,t,n,s,r,o,a){let l;if(e.side===Yt?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,e.side===Pn,a),l===null)return null;vo.copy(a),vo.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(vo);return c<t.near||c>t.far?null:{distance:c,point:vo.clone(),object:i}}function bo(i,e,t,n,s,r,o,a,l,c){i.getVertexPosition(a,go),i.getVertexPosition(l,_o),i.getVertexPosition(c,xo);let d=Jp(i,e,t,n,go,_o,xo,au);if(d){let h=new U;ri.getBarycoord(au,go,_o,xo,h),s&&(d.uv=ri.getInterpolatedAttribute(s,a,l,c,h,new Oe)),r&&(d.uv1=ri.getInterpolatedAttribute(r,a,l,c,h,new Oe)),o&&(d.normal=ri.getInterpolatedAttribute(o,a,l,c,h,new U),d.normal.dot(n.direction)>0&&d.normal.multiplyScalar(-1));let u={a,b:l,c,normal:new U,materialIndex:0};ri.getNormal(go,_o,xo,u.normal),d.face=u,d.barycoord=h}return d}var lr=new lt,lu=new lt,cu=new lt,jp=new lt,hu=new ke,So=new U,Ol=new ai,uu=new ke,Fl=new Di,mr=class extends Xt{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=zl,this.bindMatrix=new ke,this.bindMatrixInverse=new ke,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new xn),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,So),this.boundingBox.expandByPoint(So)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new ai),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,So),this.boundingSphere.expandByPoint(So)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let n=this.material,s=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ol.copy(this.boundingSphere),Ol.applyMatrix4(s),e.ray.intersectsSphere(Ol)!==!1&&(uu.copy(s).invert(),Fl.copy(e.ray).applyMatrix4(uu),!(this.boundingBox!==null&&Fl.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Fl)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new lt,t=this.geometry.attributes.skinWeight;for(let n=0,s=t.count;n<s;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===zl?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Gu?this.bindMatrixInverse.copy(this.bindMatrix).invert():Le("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,s=this.geometry;lu.fromBufferAttribute(s.attributes.skinIndex,e),cu.fromBufferAttribute(s.attributes.skinWeight,e),t.isVector4?(lr.copy(t),t.set(0,0,0,0)):(lr.set(...t,1),t.set(0,0,0)),lr.applyMatrix4(this.bindMatrix);for(let r=0;r<4;r++){let o=cu.getComponent(r);if(o!==0){let a=lu.getComponent(r);hu.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(jp.copy(lr).applyMatrix4(hu),o)}}return t.isVector4&&(t.w=lr.w),t.applyMatrix4(this.bindMatrixInverse)}},Cs=class extends Ot{constructor(){super(),this.isBone=!0,this.type="Bone"}},gr=class extends Ut{constructor(e=null,t=1,n=1,s,r,o,a,l,c=wt,d=wt,h,u){super(null,o,a,l,c,d,s,r,h,u),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},du=new ke,Qp=new ke,_r=class i{constructor(e=[],t=[]){this.uuid=zi(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){Le("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,s=this.bones.length;n<s;n++)this.boneInverses.push(new ke)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new ke;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,s=this.boneTexture;for(let r=0,o=e.length;r<o;r++){let a=e[r]?e[r].matrixWorld:Qp;du.multiplyMatrices(a,t[r]),du.toArray(n,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new i(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new gr(t,e,e,qt,cn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,s=e.bones.length;n<s;n++){let r=e.bones[n],o=t[r];o===void 0&&(Le("Skeleton: No bone found with UUID:",r),o=new Cs),this.bones.push(o),this.boneInverses.push(new ke().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let s=0,r=t.length;s<r;s++){let o=t[s];e.bones.push(o.uuid);let a=n[s];e.boneInverses.push(a.toArray())}return e}};var Ii=new ai,em=new Oe(.5,.5),Mo=new U,Rs=class{constructor(e=new en,t=new en,n=new en,s=new en,r=new en,o=new en){this.planes=[e,t,n,s,r,o]}set(e,t,n,s,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=mn,n=!1){let s=this.planes,r=e.elements,o=r[0],a=r[1],l=r[2],c=r[3],d=r[4],h=r[5],u=r[6],p=r[7],_=r[8],v=r[9],m=r[10],f=r[11],b=r[12],T=r[13],y=r[14],w=r[15];if(s[0].setComponents(c-o,p-d,f-_,w-b).normalize(),s[1].setComponents(c+o,p+d,f+_,w+b).normalize(),s[2].setComponents(c+a,p+h,f+v,w+T).normalize(),s[3].setComponents(c-a,p-h,f-v,w-T).normalize(),n)s[4].setComponents(l,u,m,y).normalize(),s[5].setComponents(c-l,p-u,f-m,w-y).normalize();else if(s[4].setComponents(c-l,p-u,f-m,w-y).normalize(),t===mn)s[5].setComponents(c+l,p+u,f+m,w+y).normalize();else if(t===Ss)s[5].setComponents(l,u,m,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ii.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ii.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ii)}intersectsSprite(e){Ii.center.set(0,0,0);let t=em.distanceTo(e.center);return Ii.radius=.7071067811865476+t,Ii.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ii)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(Mo.x=s.normal.x>0?e.max.x:e.min.x,Mo.y=s.normal.y>0?e.max.y:e.min.y,Mo.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Mo)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var li=class extends Ut{constructor(e,t,n,s,r,o,a,l,c,d,h,u){super(null,o,a,l,c,d,s,r,h,u),this.isCompressedTexture=!0,this.image={width:t,height:n},this.mipmaps=e,this.flipY=!1,this.generateMipmaps=!1}};var xr=class extends Ut{constructor(e=[],t=mi,n,s,r,o,a,l,c,d){super(e,t,n,s,r,o,a,l,c,d),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},yr=class extends Ut{constructor(e,t,n,s,r,o,a,l,c){super(e,t,n,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var ci=class extends Ut{constructor(e,t,n=vn,s,r,o,a=wt,l=wt,c,d=Rn,h=1){if(d!==Rn&&d!==gi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:e,height:t,depth:h};super(u,s,r,o,a,l,d,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Wn(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Bo=class extends ci{constructor(e,t=vn,n=mi,s,r,o=wt,a=wt,l,c=Rn){let d={width:e,height:e,depth:1},h=[d,d,d,d,d,d];super(e,e,t,n,s,r,o,a,l,c),this.image=h,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},vr=class extends Ut{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Is=class i extends At{constructor(e=1,t=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],d=[],h=[],u=0,p=0;_("z","y","x",-1,-1,n,t,e,o,r,0),_("z","y","x",1,-1,n,t,-e,o,r,1),_("x","z","y",1,1,e,n,t,s,o,2),_("x","z","y",1,-1,e,n,-t,s,o,3),_("x","y","z",1,-1,e,t,n,s,r,4),_("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new Wt(c,3)),this.setAttribute("normal",new Wt(d,3)),this.setAttribute("uv",new Wt(h,2));function _(v,m,f,b,T,y,w,S,E,g,A){let R=y/E,P=w/g,O=y/2,k=w/2,I=S/2,F=E+1,$=g+1,X=0,ne=0,q=new U;for(let K=0;K<$;K++){let ee=K*P-k;for(let be=0;be<F;be++){let Se=be*R-O;q[v]=Se*b,q[m]=ee*T,q[f]=I,c.push(q.x,q.y,q.z),q[v]=0,q[m]=0,q[f]=S>0?1:-1,d.push(q.x,q.y,q.z),h.push(be/E),h.push(1-K/g),X+=1}}for(let K=0;K<g;K++)for(let ee=0;ee<E;ee++){let be=u+ee+F*K,Se=u+ee+F*(K+1),tt=u+(ee+1)+F*(K+1),He=u+(ee+1)+F*K;l.push(be,Se,He),l.push(Se,tt,He),ne+=6}a.addGroup(p,ne,A),p+=ne,u+=X}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var br=class i extends At{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);let r=[],o=[],a=[],l=[],c=new U,d=new Oe;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let h=0,u=3;h<=t;h++,u+=3){let p=n+h/t*s;c.x=e*Math.cos(p),c.y=e*Math.sin(p),o.push(c.x,c.y,c.z),a.push(0,0,1),d.x=(o[u]/e+1)/2,d.y=(o[u+1]/e+1)/2,l.push(d.x,d.y)}for(let h=1;h<=t;h++)r.push(h,h+1,0);this.setIndex(r),this.setAttribute("position",new Wt(o,3)),this.setAttribute("normal",new Wt(a,3)),this.setAttribute("uv",new Wt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.segments,e.thetaStart,e.thetaLength)}};var Sr=class i extends At{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(s),c=a+1,d=l+1,h=e/a,u=t/l,p=[],_=[],v=[],m=[];for(let f=0;f<d;f++){let b=f*u-o;for(let T=0;T<c;T++){let y=T*h-r;_.push(y,-b,0),v.push(0,0,1),m.push(T/a),m.push(1-f/l)}}for(let f=0;f<l;f++)for(let b=0;b<a;b++){let T=b+c*f,y=b+c*(f+1),w=b+1+c*(f+1),S=b+1+c*f;p.push(T,y,S),p.push(y,w,S)}this.setIndex(p),this.setAttribute("position",new Wt(_,3)),this.setAttribute("normal",new Wt(v,3)),this.setAttribute("uv",new Wt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};function Hi(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];if(fu(s))s.isRenderTargetTexture?(Le("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(fu(s[0])){let r=[];for(let o=0,a=s.length;o<a;o++)r[o]=s[o].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function Vt(i){let e={};for(let t=0;t<i.length;t++){let n=Hi(i[t]);for(let s in n)e[s]=n[s]}return e}function fu(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function tm(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function xc(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:je.workingColorSpace}var rd={clone:Hi,merge:Vt},nm=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,im=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,tn=class extends Yn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=nm,this.fragmentShader=im,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Hi(e.uniforms),this.uniformsGroups=tm(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new Be().setHex(s.value);break;case"v2":this.uniforms[n].value=new Oe().fromArray(s.value);break;case"v3":this.uniforms[n].value=new U().fromArray(s.value);break;case"v4":this.uniforms[n].value=new lt().fromArray(s.value);break;case"m3":this.uniforms[n].value=new ze().fromArray(s.value);break;case"m4":this.uniforms[n].value=new ke().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},ko=class extends tn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Mr=class extends Yn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Be(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Be(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Fr,this.normalScale=new Oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new In,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var Ps=class extends Yn{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Be(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Be(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Fr,this.normalScale=new Oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new In,this.combine=ta,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},zo=class extends Yn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Wu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Vo=class extends Yn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function ds(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function Bl(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var hi=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let o;t:{i:if(!(e<s)){for(let a=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=t[++n],e<s)break e}o=t.length;break t}if(!(e>=r)){let a=t[1];e<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}o=n,n=0;break t}break n}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Ho=class extends hi{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Hl,endingEnd:Hl}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,o=e+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case Gl:r=e,a=2*t-n;break;case Wl:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Gl:o=e,l=2*n-t;break;case Wl:o=1,l=n+s[1]-s[0];break;default:o=e-1,l=t}let c=(n-t)*.5,d=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=r*d,this._offsetNext=o*d}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,d=this._offsetPrev,h=this._offsetNext,u=this._weightPrev,p=this._weightNext,_=(n-t)/(s-t),v=_*_,m=v*_,f=-u*m+2*u*v-u*_,b=(1+u)*m+(-1.5-2*u)*v+(-.5+u)*_+1,T=(-1-p)*m+(1.5+p)*v+.5*_,y=p*m-p*v;for(let w=0;w!==a;++w)r[w]=f*o[d+w]+b*o[c+w]+T*o[l+w]+y*o[h+w];return r}},Go=class extends hi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,d=(n-t)/(s-t),h=1-d;for(let u=0;u!==a;++u)r[u]=o[c+u]*h+o[l+u]*d;return r}},Wo=class extends hi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},Xo=class extends hi{interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,d=this.inTangents,h=this.outTangents;if(!d||!h){let _=(n-t)/(s-t),v=1-_;for(let m=0;m!==a;++m)r[m]=o[c+m]*v+o[l+m]*_;return r}let u=a*2,p=e-1;for(let _=0;_!==a;++_){let v=o[c+_],m=o[l+_],f=p*u+_*2,b=h[f],T=h[f+1],y=e*u+_*2,w=d[y],S=d[y+1],E=rm(n,t,b,w,s);r[_]=od(E,v,T,S,m)}return r}};function od(i,e,t,n,s){let r=1-i;return r*r*r*e+3*r*r*i*t+3*r*i*i*n+i*i*i*s}function sm(i,e,t,n,s){let r=1-i;return 3*r*r*(t-e)+6*r*i*(n-t)+3*i*i*(s-n)}function rm(i,e,t,n,s){let r=(i-e)/(s-e);for(let o=0;o<8;o++){let a=od(r,e,t,n,s)-i;if(Math.abs(a)<1e-10)break;let l=sm(r,e,t,n,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-a/l))}return r}var nn=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=ds(t,this.TimeBufferType),this.values=ds(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:ds(e.times,Array),values:ds(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s),Bl(e.settings)&&(n.settings={inTangents:ds(e.settings.inTangents,Array),outTangents:ds(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Wo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Go(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Ho(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Xo(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Li:t=this.InterpolantFactoryMethodDiscrete;break;case bs:t=this.InterpolantFactoryMethodLinear;break;case Ao:t=this.InterpolantFactoryMethodSmooth;break;case Vl:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Le("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Li;case this.InterpolantFactoryMethodLinear:return bs;case this.InterpolantFactoryMethodSmooth:return Ao;case this.InterpolantFactoryMethodBezier:return Vl}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e;Bl(this.settings)&&(pu(this.settings.inTangents,e),pu(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Fe("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(Fe("KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){Fe("KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){Fe("KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(s!==void 0&&xp(s))for(let a=0,l=s.length;a!==l;++a){let c=s[a];if(isNaN(c)){Fe("KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Ao,r=e.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=e[a],d=e[a+1];if(c!==d&&(a!==1||c!==e[0]))if(s)l=!0;else{let h=a*n,u=h-n,p=h+n;for(let _=0;_!==n;++_){let v=t[h+_];if(v!==t[u+_]||v!==t[p+_]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let h=a*n,u=o*n;for(let p=0;p!==n;++p)t[u+p]=t[h+p]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,Bl(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function pu(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}nn.prototype.ValueTypeName="";nn.prototype.TimeBufferType=Float32Array;nn.prototype.ValueBufferType=Float32Array;nn.prototype.DefaultInterpolation=bs;var ui=class extends nn{constructor(e,t,n){super(e,t,n)}};ui.prototype.ValueTypeName="bool";ui.prototype.ValueBufferType=Array;ui.prototype.DefaultInterpolation=Li;ui.prototype.InterpolantFactoryMethodLinear=void 0;ui.prototype.InterpolantFactoryMethodSmooth=void 0;var Yo=class extends nn{constructor(e,t,n,s){super(e,t,n,s)}};Yo.prototype.ValueTypeName="color";var qo=class extends nn{constructor(e,t,n,s){super(e,t,n,s)}};qo.prototype.ValueTypeName="number";var $o=class extends hi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(s-t),c=e*a;for(let d=c+a;c!==d;c+=4)Lt.slerpFlat(r,0,o,c-a,o,c,l);return r}},wr=class extends nn{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new $o(this.times,this.values,this.getValueSize(),e)}};wr.prototype.ValueTypeName="quaternion";wr.prototype.InterpolantFactoryMethodSmooth=void 0;var di=class extends nn{constructor(e,t,n){super(e,t,n)}};di.prototype.ValueTypeName="string";di.prototype.ValueBufferType=Array;di.prototype.DefaultInterpolation=Li;di.prototype.InterpolantFactoryMethodLinear=void 0;di.prototype.InterpolantFactoryMethodSmooth=void 0;var Zo=class extends nn{constructor(e,t,n,s){super(e,t,n,s)}};Zo.prototype.ValueTypeName="vector";var Co={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(mu(i)||(this.files[i]=e))},get:function(i){if(this.enabled!==!1&&!mu(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function mu(i){try{let e=i.slice(i.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}var Ko=class{constructor(e,t,n){let s=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(d){a++,r===!1&&s.onStart!==void 0&&s.onStart(d,o,a),r=!0},this.itemEnd=function(d){o++,s.onProgress!==void 0&&s.onProgress(d,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(d){s.onError!==void 0&&s.onError(d)},this.resolveURL=function(d){return d=d.normalize("NFC"),l?l(d):d},this.setURLModifier=function(d){return l=d,this},this.addHandler=function(d,h){return c.push(d,h),this},this.removeHandler=function(d){let h=c.indexOf(d);return h!==-1&&c.splice(h,2),this},this.getHandler=function(d){for(let h=0,u=c.length;h<u;h+=2){let p=c[h],_=c[h+1];if(p.global&&(p.lastIndex=0),p.test(d))return _}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},ad=new Ko,Ls=class{constructor(e){this.manager=e!==void 0?e:ad,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};Ls.DEFAULT_MATERIAL_NAME="__DEFAULT";var fs=new WeakMap,Jo=class extends Ls{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=Co.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0);else{let h=fs.get(o);h===void 0&&(h=[],fs.set(o,h)),h.push({onLoad:t,onError:s})}return o}let a=Ms("img");function l(){d(),t&&t(this);let h=fs.get(this)||[];for(let u=0;u<h.length;u++){let p=h[u];p.onLoad&&p.onLoad(this)}fs.delete(this),r.manager.itemEnd(e)}function c(h){d(),s&&s(h),Co.remove(`image:${e}`);let u=fs.get(this)||[];for(let p=0;p<u.length;p++){let _=u[p];_.onError&&_.onError(h)}fs.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function d(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),Co.add(`image:${e}`,a),r.manager.itemStart(e),a.src=e,a}};var Oi=class extends Ls{constructor(e){super(e)}load(e,t,n,s){let r=new Ut,o=new Jo(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}},Tr=class extends Ot{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Be(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Ar=class extends Tr{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ot.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Be(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},kl=new ke,gu=new U,_u=new U,jo=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Oe(512,512),this.mapType=Kt,this.map=null,this.mapPass=null,this.matrix=new ke,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Rs,this._frameExtents=new Oe(1,1),this._viewportCount=1,this._viewports=[new lt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;gu.setFromMatrixPosition(e.matrixWorld),t.position.copy(gu),_u.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(_u),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){kl.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(kl,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,o=s?s.z/r.x:1,a=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===Ss||e.reversedDepth?t.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,1,0,0,0,0,1):t.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,.5,.5,0,0,0,1),t.multiply(kl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},wo=new U,To=new Lt,Cn=new U,Er=class extends Ot{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ke,this.projectionMatrix=new ke,this.projectionMatrixInverse=new ke,this.coordinateSystem=mn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(wo,To,Cn),Cn.x===1&&Cn.y===1&&Cn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(wo,To,Cn.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(wo,To,Cn),Cn.x===1&&Cn.y===1&&Cn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(wo,To,Cn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},si=new U,xu=new Oe,yu=new Oe,zt=class extends Er{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Ts*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(cr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ts*2*Math.atan(Math.tan(cr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){si.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(si.x,si.y).multiplyScalar(-e/si.z),si.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(si.x,si.y).multiplyScalar(-e/si.z)}getViewSize(e,t){return this.getViewBounds(e,xu,yu),t.subVectors(yu,xu)}setViewOffset(e,t,n,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(cr*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var Ns=class extends Er{constructor(e=-1,t=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,o=n+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,d=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=d*this.view.offsetY,l=a-d*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Xl=class extends jo{constructor(){super(new Ns(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ds=class extends Tr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ot.DEFAULT_UP),this.updateMatrix(),this.target=new Ot,this.shadow=new Xl}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var ps=-90,ms=1,Qo=class extends Ot{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new zt(ps,ms,e,t);s.layers=this.layers,this.add(s);let r=new zt(ps,ms,e,t);r.layers=this.layers,this.add(r);let o=new zt(ps,ms,e,t);o.layers=this.layers,this.add(o);let a=new zt(ps,ms,e,t);a.layers=this.layers,this.add(a);let l=new zt(ps,ms,e,t);l.layers=this.layers,this.add(l);let c=new zt(ps,ms,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,o,a,l]=t;for(let c of t)this.remove(c);if(e===mn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Ss)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,d]=this.children,h=e.getRenderTarget(),u=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),_=e.xr.enabled;e.xr.enabled=!1;let v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=v,e.setRenderTarget(n,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,d),e.setRenderTarget(h,u,p),e.xr.enabled=_,n.texture.needsPMREMUpdate=!0}},ea=class extends zt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var yc="\\[\\]\\.:\\/",om=new RegExp("["+yc+"]","g"),vc="[^"+yc+"]",am="[^"+yc.replace("\\.","")+"]",lm=/((?:WC+[\/:])*)/.source.replace("WC",vc),cm=/(WCOD+)?/.source.replace("WCOD",am),hm=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",vc),um=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",vc),dm=new RegExp("^"+lm+cm+hm+um+"$"),fm=["material","materials","bones","map"],Yl=class{constructor(e,t,n){let s=n||ot.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},ot=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(om,"")}static parseTrackName(e){let t=dm.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);fm.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let l=n(a.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Le("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){Fe("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Fe("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Fe("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let d=0;d<e.length;d++)if(e[d].name===c){c=d;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Fe("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Fe("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){Fe("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){Fe("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[s];if(o===void 0){let c=t.nodeName;Fe("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){Fe("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Fe("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ot.Composite=Yl;ot.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ot.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ot.prototype.GetterByBindingType=[ot.prototype._getValue_direct,ot.prototype._getValue_array,ot.prototype._getValue_arrayElement,ot.prototype._getValue_toArray];ot.prototype.SetterByBindingTypeAndVersioning=[[ot.prototype._setValue_direct,ot.prototype._setValue_direct_setNeedsUpdate,ot.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ot.prototype._setValue_array,ot.prototype._setValue_array_setNeedsUpdate,ot.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ot.prototype._setValue_arrayElement,ot.prototype._setValue_arrayElement_setNeedsUpdate,ot.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ot.prototype._setValue_fromArray,ot.prototype._setValue_fromArray_setNeedsUpdate,ot.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Vv=new Float32Array(1);var Us=class{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=$e(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos($e(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var ql=class i{static{i.prototype.isMatrix2=!0}constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};var Cr=class extends _n{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function bc(i,e,t,n){let s=pm(n);switch(t){case dc:return i*e;case pc:return i*e/s.components*s.byteLength;case la:return i*e/s.components*s.byteLength;case _i:return i*e*2/s.components*s.byteLength;case ca:return i*e*2/s.components*s.byteLength;case fc:return i*e*3/s.components*s.byteLength;case qt:return i*e*4/s.components*s.byteLength;case ha:return i*e*4/s.components*s.byteLength;case Pr:case Lr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Nr:case Dr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case da:case pa:return Math.max(i,16)*Math.max(e,8)/4;case ua:case fa:return Math.max(i,8)*Math.max(e,8)/2;case ma:case ga:case xa:case ya:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case _a:case Ur:case va:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ba:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Sa:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Ma:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case wa:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Ta:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Aa:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Ea:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Ca:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Ra:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Ia:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Pa:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case La:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Na:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Da:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Ua:case Oa:case Fa:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Ba:case ka:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Or:case za:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function pm(i){switch(i){case Kt:case lc:return{byteLength:1,components:1};case ks:case cc:case bn:return{byteLength:2,components:1};case oa:case aa:return{byteLength:2,components:4};case vn:case ra:case cn:return{byteLength:4,components:1};case hc:case uc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Le("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function Rd(){let i=null,e=!1,t=null,n=null;function s(r,o){n=i.requestAnimationFrame(s),t(r,o)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function mm(i){let e=new WeakMap;function t(a,l){let c=a.array,d=a.usage,h=c.byteLength,u=i.createBuffer();i.bindBuffer(l,u),i.bufferData(l,c,d),a.onUploadCallback();let p;if(c instanceof Float32Array)p=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)p=i.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=i.SHORT;else if(c instanceof Uint32Array)p=i.UNSIGNED_INT;else if(c instanceof Int32Array)p=i.INT;else if(c instanceof Int8Array)p=i.BYTE;else if(c instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:h}}function n(a,l,c){let d=l.array,h=l.updateRanges;if(i.bindBuffer(c,a),h.length===0)i.bufferSubData(c,0,d);else{h.sort((p,_)=>p.start-_.start);let u=0;for(let p=1;p<h.length;p++){let _=h[u],v=h[p];v.start<=_.start+_.count+1?_.count=Math.max(_.count,v.start+v.count-_.start):(++u,h[u]=v)}h.length=u+1;for(let p=0,_=h.length;p<_;p++){let v=h[p];i.bufferSubData(c,v.start*d.BYTES_PER_ELEMENT,d,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(i.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let d=e.get(a);(!d||d.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var gm=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,_m=`#ifdef USE_ALPHAHASH
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
#endif`,xm=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,ym=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,vm=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,bm=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Sm=`#ifdef USE_AOMAP
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
#endif`,Mm=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,wm=`#ifdef USE_BATCHING
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
#endif`,Tm=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Am=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Em=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Cm=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Rm=`#ifdef USE_IRIDESCENCE
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
#endif`,Im=`#ifdef USE_BUMPMAP
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
#endif`,Pm=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Lm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Nm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Dm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Um=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Om=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Fm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Bm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,km=`#define PI 3.141592653589793
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
} // validated`,zm=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Vm=`vec3 transformedNormal = objectNormal;
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
#endif`,Hm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Gm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Wm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Xm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Ym="gl_FragColor = linearToOutputTexel( gl_FragColor );",qm=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,$m=`#ifdef USE_ENVMAP
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
#endif`,Zm=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Km=`#ifdef USE_ENVMAP
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
#endif`,Jm=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,jm=`#ifdef USE_ENVMAP
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
#endif`,Qm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,eg=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,tg=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,ng=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,ig=`#ifdef USE_GRADIENTMAP
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
}`,sg=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,rg=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,og=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,ag=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,lg=`#ifdef USE_ENVMAP
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
#endif`,cg=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,hg=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,ug=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,dg=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,fg=`PhysicalMaterial material;
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
#endif`,pg=`uniform sampler2D dfgLUT;
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
}`,mg=`
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
#endif`,gg=`#if defined( RE_IndirectDiffuse )
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
#endif`,_g=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,xg=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,yg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,vg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,bg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Sg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Mg=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,wg=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Tg=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Ag=`#if defined( USE_POINTS_UV )
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
#endif`,Eg=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Cg=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Rg=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Ig=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Pg=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Lg=`#ifdef USE_MORPHTARGETS
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
#endif`,Ng=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Dg=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Ug=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Og=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Fg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Bg=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,kg=`#ifdef USE_NORMALMAP
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
#endif`,zg=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Vg=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Hg=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Gg=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Wg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Xg=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Yg=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,qg=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,$g=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Zg=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Kg=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Jg=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,jg=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Qg=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,e0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,t0=`float getShadowMask() {
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
}`,n0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,i0=`#ifdef USE_SKINNING
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
#endif`,s0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,r0=`#ifdef USE_SKINNING
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
#endif`,o0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,a0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,l0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,c0=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,h0=`#ifdef USE_TRANSMISSION
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
#endif`,u0=`#ifdef USE_TRANSMISSION
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
#endif`,d0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,f0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,p0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,m0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,g0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,_0=`uniform sampler2D t2D;
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
}`,x0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,y0=`#ifdef ENVMAP_TYPE_CUBE
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
}`,v0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,b0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,S0=`#include <common>
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
}`,M0=`#if DEPTH_PACKING == 3200
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
}`,w0=`#define DISTANCE
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
}`,T0=`#define DISTANCE
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
}`,A0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,E0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,C0=`uniform float scale;
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
}`,R0=`uniform vec3 diffuse;
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
}`,I0=`#include <common>
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
}`,P0=`uniform vec3 diffuse;
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
}`,L0=`#define LAMBERT
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
}`,N0=`#define LAMBERT
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
}`,D0=`#define MATCAP
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
}`,U0=`#define MATCAP
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
}`,O0=`#define NORMAL
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
}`,F0=`#define NORMAL
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
}`,B0=`#define PHONG
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
}`,k0=`#define PHONG
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
}`,z0=`#define STANDARD
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
}`,V0=`#define STANDARD
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
}`,H0=`#define TOON
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
}`,G0=`#define TOON
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
}`,W0=`uniform float size;
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
}`,X0=`uniform vec3 diffuse;
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
}`,Y0=`#include <common>
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
}`,q0=`uniform vec3 color;
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
}`,$0=`uniform float rotation;
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
}`,Z0=`uniform vec3 diffuse;
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
}`,Xe={alphahash_fragment:gm,alphahash_pars_fragment:_m,alphamap_fragment:xm,alphamap_pars_fragment:ym,alphatest_fragment:vm,alphatest_pars_fragment:bm,aomap_fragment:Sm,aomap_pars_fragment:Mm,batching_pars_vertex:wm,batching_vertex:Tm,begin_vertex:Am,beginnormal_vertex:Em,bsdfs:Cm,iridescence_fragment:Rm,bumpmap_pars_fragment:Im,clipping_planes_fragment:Pm,clipping_planes_pars_fragment:Lm,clipping_planes_pars_vertex:Nm,clipping_planes_vertex:Dm,color_fragment:Um,color_pars_fragment:Om,color_pars_vertex:Fm,color_vertex:Bm,common:km,cube_uv_reflection_fragment:zm,defaultnormal_vertex:Vm,displacementmap_pars_vertex:Hm,displacementmap_vertex:Gm,emissivemap_fragment:Wm,emissivemap_pars_fragment:Xm,colorspace_fragment:Ym,colorspace_pars_fragment:qm,envmap_fragment:$m,envmap_common_pars_fragment:Zm,envmap_pars_fragment:Km,envmap_pars_vertex:Jm,envmap_physical_pars_fragment:lg,envmap_vertex:jm,fog_vertex:Qm,fog_pars_vertex:eg,fog_fragment:tg,fog_pars_fragment:ng,gradientmap_pars_fragment:ig,lightmap_pars_fragment:sg,lights_lambert_fragment:rg,lights_lambert_pars_fragment:og,lights_pars_begin:ag,lights_toon_fragment:cg,lights_toon_pars_fragment:hg,lights_phong_fragment:ug,lights_phong_pars_fragment:dg,lights_physical_fragment:fg,lights_physical_pars_fragment:pg,lights_fragment_begin:mg,lights_fragment_maps:gg,lights_fragment_end:_g,lightprobes_pars_fragment:xg,logdepthbuf_fragment:yg,logdepthbuf_pars_fragment:vg,logdepthbuf_pars_vertex:bg,logdepthbuf_vertex:Sg,map_fragment:Mg,map_pars_fragment:wg,map_particle_fragment:Tg,map_particle_pars_fragment:Ag,metalnessmap_fragment:Eg,metalnessmap_pars_fragment:Cg,morphinstance_vertex:Rg,morphcolor_vertex:Ig,morphnormal_vertex:Pg,morphtarget_pars_vertex:Lg,morphtarget_vertex:Ng,normal_fragment_begin:Dg,normal_fragment_maps:Ug,normal_pars_fragment:Og,normal_pars_vertex:Fg,normal_vertex:Bg,normalmap_pars_fragment:kg,clearcoat_normal_fragment_begin:zg,clearcoat_normal_fragment_maps:Vg,clearcoat_pars_fragment:Hg,iridescence_pars_fragment:Gg,opaque_fragment:Wg,packing:Xg,premultiplied_alpha_fragment:Yg,project_vertex:qg,dithering_fragment:$g,dithering_pars_fragment:Zg,roughnessmap_fragment:Kg,roughnessmap_pars_fragment:Jg,shadowmap_pars_fragment:jg,shadowmap_pars_vertex:Qg,shadowmap_vertex:e0,shadowmask_pars_fragment:t0,skinbase_vertex:n0,skinning_pars_vertex:i0,skinning_vertex:s0,skinnormal_vertex:r0,specularmap_fragment:o0,specularmap_pars_fragment:a0,tonemapping_fragment:l0,tonemapping_pars_fragment:c0,transmission_fragment:h0,transmission_pars_fragment:u0,uv_pars_fragment:d0,uv_pars_vertex:f0,uv_vertex:p0,worldpos_vertex:m0,background_vert:g0,background_frag:_0,backgroundCube_vert:x0,backgroundCube_frag:y0,cube_vert:v0,cube_frag:b0,depth_vert:S0,depth_frag:M0,distance_vert:w0,distance_frag:T0,equirect_vert:A0,equirect_frag:E0,linedashed_vert:C0,linedashed_frag:R0,meshbasic_vert:I0,meshbasic_frag:P0,meshlambert_vert:L0,meshlambert_frag:N0,meshmatcap_vert:D0,meshmatcap_frag:U0,meshnormal_vert:O0,meshnormal_frag:F0,meshphong_vert:B0,meshphong_frag:k0,meshphysical_vert:z0,meshphysical_frag:V0,meshtoon_vert:H0,meshtoon_frag:G0,points_vert:W0,points_frag:X0,shadow_vert:Y0,shadow_frag:q0,sprite_vert:$0,sprite_frag:Z0},pe={common:{diffuse:{value:new Be(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ze},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ze}},envmap:{envMap:{value:null},envMapRotation:{value:new ze},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ze}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ze}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ze},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ze},normalScale:{value:new Oe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ze},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ze}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ze}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ze}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Be(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new U},probesMax:{value:new U},probesResolution:{value:new U}},points:{diffuse:{value:new Be(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0},uvTransform:{value:new ze}},sprite:{diffuse:{value:new Be(16777215)},opacity:{value:1},center:{value:new Oe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ze},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0}}},Un={basic:{uniforms:Vt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.fog]),vertexShader:Xe.meshbasic_vert,fragmentShader:Xe.meshbasic_frag},lambert:{uniforms:Vt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new Be(0)},envMapIntensity:{value:1}}]),vertexShader:Xe.meshlambert_vert,fragmentShader:Xe.meshlambert_frag},phong:{uniforms:Vt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new Be(0)},specular:{value:new Be(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Xe.meshphong_vert,fragmentShader:Xe.meshphong_frag},standard:{uniforms:Vt([pe.common,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.roughnessmap,pe.metalnessmap,pe.fog,pe.lights,{emissive:{value:new Be(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Xe.meshphysical_vert,fragmentShader:Xe.meshphysical_frag},toon:{uniforms:Vt([pe.common,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.gradientmap,pe.fog,pe.lights,{emissive:{value:new Be(0)}}]),vertexShader:Xe.meshtoon_vert,fragmentShader:Xe.meshtoon_frag},matcap:{uniforms:Vt([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,{matcap:{value:null}}]),vertexShader:Xe.meshmatcap_vert,fragmentShader:Xe.meshmatcap_frag},points:{uniforms:Vt([pe.points,pe.fog]),vertexShader:Xe.points_vert,fragmentShader:Xe.points_frag},dashed:{uniforms:Vt([pe.common,pe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Xe.linedashed_vert,fragmentShader:Xe.linedashed_frag},depth:{uniforms:Vt([pe.common,pe.displacementmap]),vertexShader:Xe.depth_vert,fragmentShader:Xe.depth_frag},normal:{uniforms:Vt([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,{opacity:{value:1}}]),vertexShader:Xe.meshnormal_vert,fragmentShader:Xe.meshnormal_frag},sprite:{uniforms:Vt([pe.sprite,pe.fog]),vertexShader:Xe.sprite_vert,fragmentShader:Xe.sprite_frag},background:{uniforms:{uvTransform:{value:new ze},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Xe.background_vert,fragmentShader:Xe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ze}},vertexShader:Xe.backgroundCube_vert,fragmentShader:Xe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Xe.cube_vert,fragmentShader:Xe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Xe.equirect_vert,fragmentShader:Xe.equirect_frag},distance:{uniforms:Vt([pe.common,pe.displacementmap,{referencePosition:{value:new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Xe.distance_vert,fragmentShader:Xe.distance_frag},shadow:{uniforms:Vt([pe.lights,pe.fog,{color:{value:new Be(0)},opacity:{value:1}}]),vertexShader:Xe.shadow_vert,fragmentShader:Xe.shadow_frag}};Un.physical={uniforms:Vt([Un.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ze},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ze},clearcoatNormalScale:{value:new Oe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ze},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ze},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ze},sheen:{value:0},sheenColor:{value:new Be(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ze},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ze},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ze},transmissionSamplerSize:{value:new Oe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ze},attenuationDistance:{value:0},attenuationColor:{value:new Be(0)},specularColor:{value:new Be(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ze},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ze},anisotropyVector:{value:new Oe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ze}}]),vertexShader:Xe.meshphysical_vert,fragmentShader:Xe.meshphysical_frag};var Ga={r:0,b:0,g:0},K0=new ke,Id=new ze;Id.set(-1,0,0,0,1,0,0,0,1);function J0(i,e,t,n,s,r){let o=new Be(0),a=s===!0?0:1,l,c,d=null,h=0,u=null;function p(b){let T=b.isScene===!0?b.background:null;if(T&&T.isTexture){let y=b.backgroundBlurriness>0;T=e.get(T,y)}return T}function _(b){let T=!1,y=p(b);y===null?m(o,a):y&&y.isColor&&(m(y,1),T=!0);let w=i.xr.getEnvironmentBlendMode();w==="additive"?t.buffers.color.setClear(0,0,0,1,r):w==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||T)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function v(b,T){let y=p(T);y&&(y.isCubeTexture||y.mapping===Ir)?(c===void 0&&(c=new Xt(new Is(1,1,1),new tn({name:"BackgroundCubeMaterial",uniforms:Hi(Un.backgroundCube.uniforms),vertexShader:Un.backgroundCube.vertexShader,fragmentShader:Un.backgroundCube.fragmentShader,side:Yt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(w,S,E){this.matrixWorld.copyPosition(E.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=y,c.material.uniforms.backgroundBlurriness.value=T.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(K0.makeRotationFromEuler(T.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Id),c.material.toneMapped=je.getTransfer(y.colorSpace)!==at,(d!==y||h!==y.version||u!==i.toneMapping)&&(c.material.needsUpdate=!0,d=y,h=y.version,u=i.toneMapping),c.layers.enableAll(),b.unshift(c,c.geometry,c.material,0,0,null)):y&&y.isTexture&&(l===void 0&&(l=new Xt(new Sr(2,2),new tn({name:"BackgroundMaterial",uniforms:Hi(Un.background.uniforms),vertexShader:Un.background.vertexShader,fragmentShader:Un.background.fragmentShader,side:Pn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=y,l.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,l.material.toneMapped=je.getTransfer(y.colorSpace)!==at,y.matrixAutoUpdate===!0&&y.updateMatrix(),l.material.uniforms.uvTransform.value.copy(y.matrix),(d!==y||h!==y.version||u!==i.toneMapping)&&(l.material.needsUpdate=!0,d=y,h=y.version,u=i.toneMapping),l.layers.enableAll(),b.unshift(l,l.geometry,l.material,0,0,null))}function m(b,T){b.getRGB(Ga,xc(i)),t.buffers.color.setClear(Ga.r,Ga.g,Ga.b,T,r)}function f(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(b,T=1){o.set(b),a=T,m(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(b){a=b,m(o,a)},render:_,addToRenderList:v,dispose:f}}function j0(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=u(null),r=s,o=!1;function a(P,O,k,I,F){let $=!1,X=h(P,I,k,O);r!==X&&(r=X,c(r.object)),$=p(P,I,k,F),$&&_(P,I,k,F),F!==null&&e.update(F,i.ELEMENT_ARRAY_BUFFER),($||o)&&(o=!1,y(P,O,k,I),F!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(F).buffer))}function l(){return i.createVertexArray()}function c(P){return i.bindVertexArray(P)}function d(P){return i.deleteVertexArray(P)}function h(P,O,k,I){let F=I.wireframe===!0,$=n[O.id];$===void 0&&($={},n[O.id]=$);let X=P.isInstancedMesh===!0?P.id:0,ne=$[X];ne===void 0&&(ne={},$[X]=ne);let q=ne[k.id];q===void 0&&(q={},ne[k.id]=q);let K=q[F];return K===void 0&&(K=u(l()),q[F]=K),K}function u(P){let O=[],k=[],I=[];for(let F=0;F<t;F++)O[F]=0,k[F]=0,I[F]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:O,enabledAttributes:k,attributeDivisors:I,object:P,attributes:{},index:null}}function p(P,O,k,I){let F=r.attributes,$=O.attributes,X=0,ne=k.getAttributes();for(let q in ne)if(ne[q].location>=0){let ee=F[q],be=$[q];if(be===void 0&&(q==="instanceMatrix"&&P.instanceMatrix&&(be=P.instanceMatrix),q==="instanceColor"&&P.instanceColor&&(be=P.instanceColor)),ee===void 0||ee.attribute!==be||be&&ee.data!==be.data)return!0;X++}return r.attributesNum!==X||r.index!==I}function _(P,O,k,I){let F={},$=O.attributes,X=0,ne=k.getAttributes();for(let q in ne)if(ne[q].location>=0){let ee=$[q];ee===void 0&&(q==="instanceMatrix"&&P.instanceMatrix&&(ee=P.instanceMatrix),q==="instanceColor"&&P.instanceColor&&(ee=P.instanceColor));let be={};be.attribute=ee,ee&&ee.data&&(be.data=ee.data),F[q]=be,X++}r.attributes=F,r.attributesNum=X,r.index=I}function v(){let P=r.newAttributes;for(let O=0,k=P.length;O<k;O++)P[O]=0}function m(P){f(P,0)}function f(P,O){let k=r.newAttributes,I=r.enabledAttributes,F=r.attributeDivisors;k[P]=1,I[P]===0&&(i.enableVertexAttribArray(P),I[P]=1),F[P]!==O&&(i.vertexAttribDivisor(P,O),F[P]=O)}function b(){let P=r.newAttributes,O=r.enabledAttributes;for(let k=0,I=O.length;k<I;k++)O[k]!==P[k]&&(i.disableVertexAttribArray(k),O[k]=0)}function T(P,O,k,I,F,$,X){X===!0?i.vertexAttribIPointer(P,O,k,F,$):i.vertexAttribPointer(P,O,k,I,F,$)}function y(P,O,k,I){v();let F=I.attributes,$=k.getAttributes(),X=O.defaultAttributeValues;for(let ne in $){let q=$[ne];if(q.location>=0){let K=F[ne];if(K===void 0&&(ne==="instanceMatrix"&&P.instanceMatrix&&(K=P.instanceMatrix),ne==="instanceColor"&&P.instanceColor&&(K=P.instanceColor)),K!==void 0){let ee=K.normalized,be=K.itemSize,Se=e.get(K);if(Se===void 0)continue;let tt=Se.buffer,He=Se.type,te=Se.bytesPerElement,H=He===i.INT||He===i.UNSIGNED_INT||K.gpuType===ra;if(K.isInterleavedBufferAttribute){let G=K.data,oe=G.stride,Te=K.offset;if(G.isInstancedInterleavedBuffer){for(let de=0;de<q.locationSize;de++)f(q.location+de,G.meshPerAttribute);P.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=G.meshPerAttribute*G.count)}else for(let de=0;de<q.locationSize;de++)m(q.location+de);i.bindBuffer(i.ARRAY_BUFFER,tt);for(let de=0;de<q.locationSize;de++)T(q.location+de,be/q.locationSize,He,ee,oe*te,(Te+be/q.locationSize*de)*te,H)}else{if(K.isInstancedBufferAttribute){for(let G=0;G<q.locationSize;G++)f(q.location+G,K.meshPerAttribute);P.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=K.meshPerAttribute*K.count)}else for(let G=0;G<q.locationSize;G++)m(q.location+G);i.bindBuffer(i.ARRAY_BUFFER,tt);for(let G=0;G<q.locationSize;G++)T(q.location+G,be/q.locationSize,He,ee,be*te,be/q.locationSize*G*te,H)}}else if(X!==void 0){let ee=X[ne];if(ee!==void 0)switch(ee.length){case 2:i.vertexAttrib2fv(q.location,ee);break;case 3:i.vertexAttrib3fv(q.location,ee);break;case 4:i.vertexAttrib4fv(q.location,ee);break;default:i.vertexAttrib1fv(q.location,ee)}}}}b()}function w(){A();for(let P in n){let O=n[P];for(let k in O){let I=O[k];for(let F in I){let $=I[F];for(let X in $)d($[X].object),delete $[X];delete I[F]}}delete n[P]}}function S(P){if(n[P.id]===void 0)return;let O=n[P.id];for(let k in O){let I=O[k];for(let F in I){let $=I[F];for(let X in $)d($[X].object),delete $[X];delete I[F]}}delete n[P.id]}function E(P){for(let O in n){let k=n[O];for(let I in k){let F=k[I];if(F[P.id]===void 0)continue;let $=F[P.id];for(let X in $)d($[X].object),delete $[X];delete F[P.id]}}}function g(P){for(let O in n){let k=n[O],I=P.isInstancedMesh===!0?P.id:0,F=k[I];if(F!==void 0){for(let $ in F){let X=F[$];for(let ne in X)d(X[ne].object),delete X[ne];delete F[$]}delete k[I],Object.keys(k).length===0&&delete n[O]}}}function A(){R(),o=!0,r!==s&&(r=s,c(r.object))}function R(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:A,resetDefaultState:R,dispose:w,releaseStatesOfGeometry:S,releaseStatesOfObject:g,releaseStatesOfProgram:E,initAttributes:v,enableAttribute:m,disableUnusedAttributes:b}}function Q0(i,e,t){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function o(l,c,d){d!==0&&(i.drawArraysInstanced(n,l,c,d),t.update(c,n,d))}function a(l,c,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,d);let u=0;for(let p=0;p<d;p++)u+=c[p];t.update(u,n,1)}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function e_(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let E=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(E.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(E){return!(E!==qt&&n.convert(E)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(E){let g=E===bn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(E!==Kt&&E!==cn&&!g&&n.convert(E)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(E){if(E==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";E="mediump"}return E==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",d=l(c);d!==c&&(Le("WebGLRenderer:",c,"not supported, using",d,"instead."),c=d);let h=t.logarithmicDepthBuffer===!0,u=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&u===!1&&Le("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),f=i.getParameter(i.MAX_VERTEX_ATTRIBS),b=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),T=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),w=i.getParameter(i.MAX_SAMPLES),S=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:h,reversedDepthBuffer:u,maxTextures:p,maxVertexTextures:_,maxTextureSize:v,maxCubemapSize:m,maxAttributes:f,maxVertexUniforms:b,maxVaryings:T,maxFragmentUniforms:y,maxSamples:w,samples:S}}function t_(i){let e=this,t=null,n=0,s=!1,r=!1,o=new en,a=new ze,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,u){let p=h.length!==0||u||n!==0||s;return s=u,n=h.length,p},this.beginShadows=function(){r=!0,d(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,u){t=d(h,u,0)},this.setState=function(h,u,p){let _=h.clippingPlanes,v=h.clipIntersection,m=h.clipShadows,f=i.get(h);if(!s||_===null||_.length===0||r&&!m)r?d(null):c();else{let b=r?0:n,T=b*4,y=f.clippingState||null;l.value=y,y=d(_,u,T,p);for(let w=0;w!==T;++w)y[w]=t[w];f.clippingState=y,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=b}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function d(h,u,p,_){let v=h!==null?h.length:0,m=null;if(v!==0){if(m=l.value,_!==!0||m===null){let f=p+v*4,b=u.matrixWorldInverse;a.getNormalMatrix(b),(m===null||m.length<f)&&(m=new Float32Array(f));for(let T=0,y=p;T!==v;++T,y+=4)o.copy(h[T]).applyMatrix4(b,a),o.normal.toArray(m,y),m[y+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,m}}var Hs=4,n_=6,i_=20,s_=256,Br=new Ns,ld=new Be,Sc=null,Mc=0,wc=0,Tc=!1,r_=new U,Gi=new U,Xa=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){let{size:o=256,position:a=r_}=r;Sc=this._renderer.getRenderTarget(),Mc=this._renderer.getActiveCubeFace(),wc=this._renderer.getActiveMipmapLevel(),Tc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ud(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=hd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Sc,Mc,wc),this._renderer.xr.enabled=Tc,e.scissorTest=!1,Vs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===mi||e.mapping===Bi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Sc=this._renderer.getRenderTarget(),Mc=this._renderer.getActiveCubeFace(),wc=this._renderer.getActiveMipmapLevel(),Tc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Tt,minFilter:Tt,generateMipmaps:!1,type:bn,format:qt,colorSpace:ur,depthBuffer:!1},s=cd(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=cd(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=o_(r)),this._blurMaterial=l_(r,e,t),this._ggxMaterial=a_(r,e,t)}return s}_compileMaterial(e){let t=new Xt(new At,e);this._renderer.compile(t,Br)}_sceneToCubeUV(e,t,n,s,r){let l=new zt(90,1,t,n),c=[1,-1,1,1,1,1],d=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,p=h.toneMapping;h.getClearColor(ld),h.toneMapping=yn,h.autoClear=!1,h.state.buffers.depth.getReversed()&&(h.setRenderTarget(s),h.clearDepth(),h.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Xt(new Is,new Ui({name:"PMREM.Background",side:Yt,depthWrite:!1,depthTest:!1})));let v=this._backgroundBox,m=v.material,f=!1,b=e.background;b?b.isColor&&(m.color.copy(b),e.background=null,f=!0):(m.color.copy(ld),f=!0);for(let T=0;T<6;T++){let y=T%3;y===0?(l.up.set(0,c[T],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+d[T],r.y,r.z)):y===1?(l.up.set(0,0,c[T]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+d[T],r.z)):(l.up.set(0,c[T],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+d[T]));let w=this._cubeSize;Vs(s,y*w,T>2?w:0,w,w),h.setRenderTarget(s),f&&h.render(v,l),h.render(e,l)}h.toneMapping=p,h.autoClear=u,e.background=b}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===mi||e.mapping===Bi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=ud()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=hd());let r=s?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;let a=r.uniforms;a.envMap.value=e;let l=this._cubeSize;Vs(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,Br)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){let s=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[n];a.material=o;let l=o.uniforms,c=n/(this._lodMeshes.length-1),d=t/(this._lodMeshes.length-1),h=Math.sqrt(c*c-d*d),u=c*1.25,p=h*u,{_lodMax:_}=this,v=this._sizeLods[n],m=3*v*(n>_-Hs?n-_+Hs:0),f=4*(this._cubeSize-v);l.envMap.value=e.texture,l.roughness.value=p,l.mipInt.value=_-t,Vs(r,m,f,3*v,2*v),s.setRenderTarget(r),s.render(a,Br),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=_-n,Vs(e,m,f,3*v,2*v),s.setRenderTarget(e),s.render(a,Br)}_blur(e,t,n,s){let r=this._pingPongRenderTarget,o=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(e,r,t,n,o),this._blurPass(r,e,n,n,o)}_blurPass(e,t,n,s,r){let o=this._renderer,a=this._blurMaterial,l=this._lodMeshes[s];l.material=a;let c=a.uniforms;c.envMap.value=e.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-n;let d=this._sizeLods[s],h=3*d*(s>this._lodMax-Hs?s-this._lodMax+Hs:0),u=4*(this._cubeSize-d);Vs(t,h,u,3*d,2*d),o.setRenderTarget(t),o.render(l,Br)}};function o_(i){let e=[],t=[],n=i,s=i-Hs+1+n_;for(let r=0;r<s;r++){let o=Math.pow(2,n);e.push(o);let a=1/(o-2),l=-a,c=1+a,d=[l,l,c,l,c,c,l,l,c,c,l,c],h=6,u=6,p=3,_=new Float32Array(p*u*h),v=new Float32Array(p*u*h);for(let f=0;f<h;f++){let b=f%3*2/3-1,T=f>2?0:-1,y=[b,T,0,b+2/3,T,0,b+2/3,T+1,0,b,T,0,b+2/3,T+1,0,b,T+1,0];_.set(y,p*u*f);for(let w=0;w<u;w++){let S=d[w*2]*2-1,E=d[w*2+1]*2-1;f===0?Gi.set(1,E,S):f===1?Gi.set(-S,1,-E):f===2?Gi.set(-S,E,1):f===3?Gi.set(-1,E,-S):f===4?Gi.set(-S,-1,E):Gi.set(S,E,-1),Gi.toArray(v,(f*u+w)*p)}}let m=new At;m.setAttribute("position",new Ge(_,p)),m.setAttribute("outputDirection",new Ge(v,p)),t.push(new Xt(m,null)),n>Hs&&n--}return{lodMeshes:t,sizeLods:e}}function cd(i,e,t){let n=new Zt(i,e,t);return n.texture.mapping=Ir,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Vs(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function a_(i,e,t){return new tn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:s_,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:$a(),fragmentShader:`

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
		`,blending:Ln,depthTest:!1,depthWrite:!1})}function l_(i,e,t){return new tn({name:"SphericalGaussianBlur",defines:{SAMPLES:i_,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:$a(),fragmentShader:`

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
		`,blending:Ln,depthTest:!1,depthWrite:!1})}function hd(){return new tn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:$a(),fragmentShader:`

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
		`,blending:Ln,depthTest:!1,depthWrite:!1})}function ud(){return new tn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:$a(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Ln,depthTest:!1,depthWrite:!1})}function $a(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var Ya=class extends Zt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new xr(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new Is(5,5,5),r=new tn({name:"CubemapFromEquirect",uniforms:Hi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Yt,blending:Ln});r.uniforms.tEquirect.value=t;let o=new Xt(s,r),a=t.minFilter;return t.minFilter===Nn&&(t.minFilter=Tt),new Qo(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,s);e.setRenderTarget(r)}};function c_(i){let e=new WeakMap,t=new WeakMap,n=null;function s(u,p=!1){return u==null?null:p?o(u):r(u)}function r(u){if(u&&u.isTexture){let p=u.mapping;if(p===na||p===ia)if(e.has(u)){let _=e.get(u).texture;return a(_,u.mapping)}else{let _=u.image;if(_&&_.height>0){let v=new Ya(_.height);return v.fromEquirectangularTexture(i,u),e.set(u,v),u.addEventListener("dispose",c),a(v.texture,u.mapping)}else return null}}return u}function o(u){if(u&&u.isTexture){let p=u.mapping,_=p===na||p===ia,v=p===mi||p===Bi;if(_||v){let m=t.get(u),f=m!==void 0?m.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==f)return n===null&&(n=new Xa(i)),m=_?n.fromEquirectangular(u,m):n.fromCubemap(u,m),m.texture.pmremVersion=u.pmremVersion,t.set(u,m),m.texture;if(m!==void 0)return m.texture;{let b=u.image;return _&&b&&b.height>0||v&&b&&l(b)?(n===null&&(n=new Xa(i)),m=_?n.fromEquirectangular(u):n.fromCubemap(u),m.texture.pmremVersion=u.pmremVersion,t.set(u,m),u.addEventListener("dispose",d),m.texture):null}}}return u}function a(u,p){return p===na?u.mapping=mi:p===ia&&(u.mapping=Bi),u}function l(u){let p=0,_=6;for(let v=0;v<_;v++)u[v]!==void 0&&p++;return p===_}function c(u){let p=u.target;p.removeEventListener("dispose",c);let _=e.get(p);_!==void 0&&(e.delete(p),_.dispose())}function d(u){let p=u.target;p.removeEventListener("dispose",d);let _=t.get(p);_!==void 0&&(t.delete(p),_.dispose())}function h(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:h}}function h_(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&Pi("WebGLRenderer: "+n+" extension not supported."),s}}}function u_(i,e,t,n){let s={},r=new WeakMap;function o(h){let u=h.target;u.index!==null&&e.remove(u.index);for(let _ in u.attributes)e.remove(u.attributes[_]);u.removeEventListener("dispose",o),delete s[u.id];let p=r.get(u);p&&(e.remove(p),r.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,t.memory.geometries--}function a(h,u){return s[u.id]===!0||(u.addEventListener("dispose",o),s[u.id]=!0,t.memory.geometries++),u}function l(h){let u=h.attributes;for(let p in u)e.update(u[p],i.ARRAY_BUFFER)}function c(h){let u=[],p=h.index,_=h.attributes.position,v=0;if(_===void 0)return;if(p!==null){let b=p.array;v=p.version;for(let T=0,y=b.length;T<y;T+=3){let w=b[T+0],S=b[T+1],E=b[T+2];u.push(w,S,S,E,E,w)}}else{let b=_.array;v=_.version;for(let T=0,y=b.length/3-1;T<y;T+=3){let w=T+0,S=T+1,E=T+2;u.push(w,S,S,E,E,w)}}let m=new(_.count>=65535?Ni:Xn)(u,1);m.version=v;let f=r.get(h);f&&e.remove(f),r.set(h,m)}function d(h){let u=r.get(h);if(u){let p=h.index;p!==null&&u.version<p.version&&c(h)}else c(h);return r.get(h)}return{get:a,update:l,getWireframeAttribute:d}}function d_(i,e,t){let n;function s(h){n=h}let r,o;function a(h){r=h.type,o=h.bytesPerElement}function l(h,u){i.drawElements(n,u,r,h*o),t.update(u,n,1)}function c(h,u,p){p!==0&&(i.drawElementsInstanced(n,u,r,h*o,p),t.update(u,n,p))}function d(h,u,p){if(p===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,u,0,r,h,0,p);let v=0;for(let m=0;m<p;m++)v+=u[m];t.update(v,n,1)}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=d}function f_(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(r/3);break;case i.LINES:t.lines+=a*(r/2);break;case i.LINE_STRIP:t.lines+=a*(r-1);break;case i.LINE_LOOP:t.lines+=a*r;break;case i.POINTS:t.points+=a*r;break;default:Fe("WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function p_(i,e,t){let n=new WeakMap,s=new lt;function r(o,a,l){let c=o.morphTargetInfluences,d=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=d!==void 0?d.length:0,u=n.get(a);if(u===void 0||u.count!==h){let A=function(){E.dispose(),n.delete(a),a.removeEventListener("dispose",A)};u!==void 0&&u.texture.dispose();let p=a.morphAttributes.position!==void 0,_=a.morphAttributes.normal!==void 0,v=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],f=a.morphAttributes.normal||[],b=a.morphAttributes.color||[],T=0;p===!0&&(T=1),_===!0&&(T=2),v===!0&&(T=3);let y=a.attributes.position.count*T,w=1;y>e.maxTextureSize&&(w=Math.ceil(y/e.maxTextureSize),y=e.maxTextureSize);let S=new Float32Array(y*w*4*h),E=new fr(S,y,w,h);E.type=cn,E.needsUpdate=!0;let g=T*4;for(let R=0;R<h;R++){let P=m[R],O=f[R],k=b[R],I=y*w*4*R;for(let F=0;F<P.count;F++){let $=F*g;p===!0&&(s.fromBufferAttribute(P,F),S[I+$+0]=s.x,S[I+$+1]=s.y,S[I+$+2]=s.z,S[I+$+3]=0),_===!0&&(s.fromBufferAttribute(O,F),S[I+$+4]=s.x,S[I+$+5]=s.y,S[I+$+6]=s.z,S[I+$+7]=0),v===!0&&(s.fromBufferAttribute(k,F),S[I+$+8]=s.x,S[I+$+9]=s.y,S[I+$+10]=s.z,S[I+$+11]=k.itemSize===4?s.w:1)}}u={count:h,texture:E,size:new Oe(y,w)},n.set(a,u),a.addEventListener("dispose",A)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let p=0;for(let v=0;v<c.length;v++)p+=c[v];let _=a.morphTargetsRelative?1:1-p;l.getUniforms().setValue(i,"morphTargetBaseInfluence",_),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",u.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",u.size)}return{update:r}}function m_(i,e,t,n,s){let r=new WeakMap;function o(c){let d=s.render.frame,h=c.geometry,u=e.get(c,h);if(r.get(u)!==d&&(e.update(u),r.set(u,d)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==d&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,d))),c.isSkinnedMesh){let p=c.skeleton;r.get(p)!==d&&(p.update(),r.set(p,d))}return u}function a(){r=new WeakMap}function l(c){let d=c.target;d.removeEventListener("dispose",l),n.releaseStatesOfObject(d),t.remove(d.instanceMatrix),d.instanceColor!==null&&t.remove(d.instanceColor)}return{update:o,dispose:a}}var g_={[ec]:"LINEAR_TONE_MAPPING",[tc]:"REINHARD_TONE_MAPPING",[nc]:"CINEON_TONE_MAPPING",[ic]:"ACES_FILMIC_TONE_MAPPING",[rc]:"AGX_TONE_MAPPING",[oc]:"NEUTRAL_TONE_MAPPING",[sc]:"CUSTOM_TONE_MAPPING"};function __(i,e,t,n,s,r){let o=new Zt(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,l=null,c=new At;c.setAttribute("position",new Wt([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new Wt([0,2,0,0,2,0],2));let d=new ko({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),h=new Xt(c,d),u=new Ns(-1,1,1,-1,0,1),p=null,_=null,v=!1,m,f=null,b=[],T=!1;this.setSize=function(y,w){o.setSize(y,w),a!==null&&a.setSize(y,w),l!==null&&l.setSize(y,w);for(let S=0;S<b.length;S++){let E=b[S];E.setSize&&E.setSize(y,w)}},this.setEffects=function(y){b=y,T=b.length>0&&b[0].isRenderPass===!0;let w=o.width,S=o.height;b.length>0&&a===null&&(a=new Zt(w,S,{type:bn,depthBuffer:!1,stencilBuffer:!1}),l=new Zt(w,S,{type:bn,depthBuffer:!1,stencilBuffer:!1}));for(let E=0;E<b.length;E++){let g=b[E];g.setSize&&g.setSize(w,S)}},this.begin=function(y,w){if(v||y.toneMapping===yn&&b.length===0)return!1;if(f=w,w!==null){let S=w.width,E=w.height;(o.width!==S||o.height!==E)&&this.setSize(S,E)}return T===!1&&y.setRenderTarget(o),m=y.toneMapping,y.toneMapping=yn,!0},this.hasRenderPass=function(){return T},this.end=function(y,w){y.toneMapping=m,v=!0;let S=o,E=a;for(let g=0;g<b.length;g++){let A=b[g];A.enabled!==!1&&(A.render(y,E,S,w),A.needsSwap!==!1&&(S=E,E=E===a?l:a))}if(p!==y.outputColorSpace||_!==y.toneMapping){p=y.outputColorSpace,_=y.toneMapping,d.defines={},je.getTransfer(p)===at&&(d.defines.SRGB_TRANSFER="");let g=g_[_];g&&(d.defines[g]=""),d.needsUpdate=!0}d.uniforms.tDiffuse.value=S.texture,y.setRenderTarget(f),y.render(h,u),f=null,v=!1},this.isCompositing=function(){return v},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),c.dispose(),d.dispose()}}var Pd=new Ut,Cc=new ci(1,1),Ld=new fr,Nd=new Fo,Dd=new xr,dd=[],fd=[],pd=new Float32Array(16),md=new Float32Array(9),gd=new Float32Array(4);function Ws(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=dd[s];if(r===void 0&&(r=new Float32Array(s),dd[s]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(r,a)}return r}function Et(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Ct(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Za(i,e){let t=fd[e];t===void 0&&(t=new Int32Array(e),fd[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function x_(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function y_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;i.uniform2fv(this.addr,e),Ct(t,e)}}function v_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Et(t,e))return;i.uniform3fv(this.addr,e),Ct(t,e)}}function b_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;i.uniform4fv(this.addr,e),Ct(t,e)}}function S_(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Et(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Ct(t,e)}else{if(Et(t,n))return;gd.set(n),i.uniformMatrix2fv(this.addr,!1,gd),Ct(t,n)}}function M_(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Et(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Ct(t,e)}else{if(Et(t,n))return;md.set(n),i.uniformMatrix3fv(this.addr,!1,md),Ct(t,n)}}function w_(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Et(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Ct(t,e)}else{if(Et(t,n))return;pd.set(n),i.uniformMatrix4fv(this.addr,!1,pd),Ct(t,n)}}function T_(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function A_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;i.uniform2iv(this.addr,e),Ct(t,e)}}function E_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Et(t,e))return;i.uniform3iv(this.addr,e),Ct(t,e)}}function C_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;i.uniform4iv(this.addr,e),Ct(t,e)}}function R_(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function I_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;i.uniform2uiv(this.addr,e),Ct(t,e)}}function P_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Et(t,e))return;i.uniform3uiv(this.addr,e),Ct(t,e)}}function L_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;i.uniform4uiv(this.addr,e),Ct(t,e)}}function N_(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Cc.compareFunction=t.isReversedDepthBuffer()?Ha:Va,r=Cc):r=Pd,t.setTexture2D(e||r,s)}function D_(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Nd,s)}function U_(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||Dd,s)}function O_(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Ld,s)}function F_(i){switch(i){case 5126:return x_;case 35664:return y_;case 35665:return v_;case 35666:return b_;case 35674:return S_;case 35675:return M_;case 35676:return w_;case 5124:case 35670:return T_;case 35667:case 35671:return A_;case 35668:case 35672:return E_;case 35669:case 35673:return C_;case 5125:return R_;case 36294:return I_;case 36295:return P_;case 36296:return L_;case 35678:case 36198:case 36298:case 36306:case 35682:return N_;case 35679:case 36299:case 36307:return D_;case 35680:case 36300:case 36308:case 36293:return U_;case 36289:case 36303:case 36311:case 36292:return O_}}function B_(i,e){i.uniform1fv(this.addr,e)}function k_(i,e){let t=Ws(e,this.size,2);i.uniform2fv(this.addr,t)}function z_(i,e){let t=Ws(e,this.size,3);i.uniform3fv(this.addr,t)}function V_(i,e){let t=Ws(e,this.size,4);i.uniform4fv(this.addr,t)}function H_(i,e){let t=Ws(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function G_(i,e){let t=Ws(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function W_(i,e){let t=Ws(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function X_(i,e){i.uniform1iv(this.addr,e)}function Y_(i,e){i.uniform2iv(this.addr,e)}function q_(i,e){i.uniform3iv(this.addr,e)}function $_(i,e){i.uniform4iv(this.addr,e)}function Z_(i,e){i.uniform1uiv(this.addr,e)}function K_(i,e){i.uniform2uiv(this.addr,e)}function J_(i,e){i.uniform3uiv(this.addr,e)}function j_(i,e){i.uniform4uiv(this.addr,e)}function Q_(i,e,t){let n=this.cache,s=e.length,r=Za(t,s);Et(n,r)||(i.uniform1iv(this.addr,r),Ct(n,r));let o;this.type===i.SAMPLER_2D_SHADOW?o=Cc:o=Pd;for(let a=0;a!==s;++a)t.setTexture2D(e[a]||o,r[a])}function ex(i,e,t){let n=this.cache,s=e.length,r=Za(t,s);Et(n,r)||(i.uniform1iv(this.addr,r),Ct(n,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||Nd,r[o])}function tx(i,e,t){let n=this.cache,s=e.length,r=Za(t,s);Et(n,r)||(i.uniform1iv(this.addr,r),Ct(n,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||Dd,r[o])}function nx(i,e,t){let n=this.cache,s=e.length,r=Za(t,s);Et(n,r)||(i.uniform1iv(this.addr,r),Ct(n,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||Ld,r[o])}function ix(i){switch(i){case 5126:return B_;case 35664:return k_;case 35665:return z_;case 35666:return V_;case 35674:return H_;case 35675:return G_;case 35676:return W_;case 5124:case 35670:return X_;case 35667:case 35671:return Y_;case 35668:case 35672:return q_;case 35669:case 35673:return $_;case 5125:return Z_;case 36294:return K_;case 36295:return J_;case 36296:return j_;case 35678:case 36198:case 36298:case 36306:case 35682:return Q_;case 35679:case 36299:case 36307:return ex;case 35680:case 36300:case 36308:case 36293:return tx;case 36289:case 36303:case 36311:case 36292:return nx}}var Rc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=F_(t.type)}},Ic=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=ix(t.type)}},Pc=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(e,t[a.id],n)}}},Ac=/(\w+)(\])?(\[|\.)?/g;function _d(i,e){i.seq.push(e),i.map[e.id]=e}function sx(i,e,t){let n=i.name,s=n.length;for(Ac.lastIndex=0;;){let r=Ac.exec(n),o=Ac.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){_d(t,c===void 0?new Rc(a,i,e):new Ic(a,i,e));break}else{let h=t.map[a];h===void 0&&(h=new Pc(a),_d(t,h)),t=h}}}var Gs=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){let a=e.getActiveUniform(t,o),l=e.getUniformLocation(t,a.name);sx(a,l,this)}let s=[],r=[];for(let o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,o=t.length;r!==o;++r){let a=t[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let o=e[s];o.id in t&&n.push(o)}return n}};function xd(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var rx=37297,ox=0;function ax(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}var yd=new ze;function lx(i){je._getMatrix(yd,je.workingColorSpace,i);let e=`mat3( ${yd.elements.map(t=>t.toFixed(4))} )`;switch(je.getTransfer(i)){case dr:return[e,"LinearTransferOETF"];case at:return[e,"sRGBTransferOETF"];default:return Le("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function vd(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+ax(i.getShaderSource(e),a)}else return r}function cx(i,e){let t=lx(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var hx={[ec]:"Linear",[tc]:"Reinhard",[nc]:"Cineon",[ic]:"ACESFilmic",[rc]:"AgX",[oc]:"Neutral",[sc]:"Custom"};function ux(i,e){let t=hx[e];return t===void 0?(Le("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Wa=new U;function dx(){je.getLuminanceCoefficients(Wa);let i=Wa.x.toFixed(4),e=Wa.y.toFixed(4),t=Wa.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function fx(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(zr).join(`
`)}function px(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function mx(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function zr(i){return i!==""}function bd(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Sd(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var gx=/^[ \t]*#include +<([\w\d./]+)>/gm;function Lc(i){return i.replace(gx,xx)}var _x=new Map;function xx(i,e){let t=Xe[e];if(t===void 0){let n=_x.get(e);if(n!==void 0)t=Xe[n],Le('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return Lc(t)}var yx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Md(i){return i.replace(yx,vx)}function vx(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function wd(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}var bx={[Rr]:"SHADOWMAP_TYPE_PCF",[Os]:"SHADOWMAP_TYPE_VSM"};function Sx(i){return bx[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Mx={[mi]:"ENVMAP_TYPE_CUBE",[Bi]:"ENVMAP_TYPE_CUBE",[Ir]:"ENVMAP_TYPE_CUBE_UV"};function wx(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":Mx[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var Tx={[Bi]:"ENVMAP_MODE_REFRACTION"};function Ax(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":Tx[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var Ex={[ta]:"ENVMAP_BLENDING_MULTIPLY",[Vu]:"ENVMAP_BLENDING_MIX",[Hu]:"ENVMAP_BLENDING_ADD"};function Cx(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":Ex[i.combine]||"ENVMAP_BLENDING_NONE"}function Rx(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function Ix(i,e,t,n){let s=i.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,l=Sx(t),c=wx(t),d=Ax(t),h=Cx(t),u=Rx(t),p=fx(t),_=px(r),v=s.createProgram(),m,f,b=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(zr).join(`
`),m.length>0&&(m+=`
`),f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(zr).join(`
`),f.length>0&&(f+=`
`)):(m=[wd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+d:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(zr).join(`
`),f=[wd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+d:"",t.envMap?"#define "+h:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==yn?"#define TONE_MAPPING":"",t.toneMapping!==yn?Xe.tonemapping_pars_fragment:"",t.toneMapping!==yn?ux("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Xe.colorspace_pars_fragment,cx("linearToOutputTexel",t.outputColorSpace),dx(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(zr).join(`
`)),o=Lc(o),o=bd(o,t),o=Sd(o,t),a=Lc(a),a=bd(a,t),a=Sd(a,t),o=Md(o),a=Md(a),t.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,f=["#define varying in",t.glslVersion===mc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===mc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);let T=b+m+o,y=b+f+a,w=xd(s,s.VERTEX_SHADER,T),S=xd(s,s.FRAGMENT_SHADER,y);s.attachShader(v,w),s.attachShader(v,S),t.index0AttributeName!==void 0?s.bindAttribLocation(v,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function E(P){if(i.debug.checkShaderErrors){let O=s.getProgramInfoLog(v)||"",k=s.getShaderInfoLog(w)||"",I=s.getShaderInfoLog(S)||"",F=O.trim(),$=k.trim(),X=I.trim(),ne=!0,q=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if(ne=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,v,w,S);else{let K=vd(s,w,"vertex"),ee=vd(s,S,"fragment");Fe("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+F+`
`+K+`
`+ee)}else F!==""?Le("WebGLProgram: Program Info Log:",F):($===""||X==="")&&(q=!1);q&&(P.diagnostics={runnable:ne,programLog:F,vertexShader:{log:$,prefix:m},fragmentShader:{log:X,prefix:f}})}s.deleteShader(w),s.deleteShader(S),g=new Gs(s,v),A=mx(s,v)}let g;this.getUniforms=function(){return g===void 0&&E(this),g};let A;this.getAttributes=function(){return A===void 0&&E(this),A};let R=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return R===!1&&(R=s.getProgramParameter(v,rx)),R},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=ox++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=w,this.fragmentShader=S,this}var Px=0,Nc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Dc(e),t.set(e,n)),n}},Dc=class{constructor(e){this.id=Px++,this.code=e,this.usedTimes=0}};function Lx(i){return i===_i||i===Ur||i===Or}function Nx(i,e,t,n,s,r){let o=new pr,a=new Nc,l=new Set,c=[],d=new Map,h=n.logarithmicDepthBuffer,u=n.precision,p={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(g){return l.add(g),g===0?"uv":`uv${g}`}function v(g,A,R,P,O,k){let I=P.fog,F=O.geometry,$=g.isMeshStandardMaterial||g.isMeshLambertMaterial||g.isMeshPhongMaterial?P.environment:null,X=g.isMeshStandardMaterial||g.isMeshLambertMaterial&&!g.envMap||g.isMeshPhongMaterial&&!g.envMap,ne=e.get(g.envMap||$,X),q=ne&&ne.mapping===Ir?ne.image.height:null,K=p[g.type];g.precision!==null&&(u=n.getMaxPrecision(g.precision),u!==g.precision&&Le("WebGLProgram.getParameters:",g.precision,"not supported, using",u,"instead."));let ee=F.morphAttributes.position||F.morphAttributes.normal||F.morphAttributes.color,be=ee!==void 0?ee.length:0,Se=0;F.morphAttributes.position!==void 0&&(Se=1),F.morphAttributes.normal!==void 0&&(Se=2),F.morphAttributes.color!==void 0&&(Se=3);let tt,He,te,H;if(K){let dt=Un[K];tt=dt.vertexShader,He=dt.fragmentShader}else{tt=g.vertexShader,He=g.fragmentShader;let dt=a.getVertexShaderStage(g),st=a.getFragmentShaderStage(g);a.update(g,dt,st),te=dt.id,H=st.id}let G=i.getRenderTarget(),oe=i.state.buffers.depth.getReversed(),Te=O.isInstancedMesh===!0,de=O.isBatchedMesh===!0,Ne=!!g.map,Ze=!!g.matcap,se=!!ne,Ue=!!g.aoMap,Ye=!!g.lightMap,Ie=!!g.bumpMap&&g.wireframe===!1,nt=!!g.normalMap,_t=!!g.displacementMap,Dt=!!g.emissiveMap,qe=!!g.metalnessMap,it=!!g.roughnessMap,L=g.anisotropy>0,pt=g.clearcoat>0,Qe=g.dispersion>0,C=g.retroreflectivity>0,x=g.iridescence>0,B=g.sheen>0,W=g.transmission>0,Z=L&&!!g.anisotropyMap,re=pt&&!!g.clearcoatMap,ae=pt&&!!g.clearcoatNormalMap,J=pt&&!!g.clearcoatRoughnessMap,Q=x&&!!g.iridescenceMap,le=x&&!!g.iridescenceThicknessMap,Ce=B&&!!g.sheenColorMap,fe=B&&!!g.sheenRoughnessMap,ce=!!g.specularMap,Re=!!g.specularColorMap,De=!!g.specularIntensityMap,Ve=W&&!!g.transmissionMap,D=W&&!!g.thicknessMap,he=!!g.gradientMap,j=!!g.alphaMap,ue=g.alphaTest>0,xe=!!g.alphaHash,ie=!!g.extensions,Pe=yn;g.toneMapped&&(G===null||G.isXRRenderTarget===!0)&&(Pe=i.toneMapping);let Ae={shaderID:K,shaderType:g.type,shaderName:g.name,vertexShader:tt,fragmentShader:He,defines:g.defines,customVertexShaderID:te,customFragmentShaderID:H,isRawShaderMaterial:g.isRawShaderMaterial===!0,glslVersion:g.glslVersion,precision:u,batching:de,batchingColor:de&&O._colorsTexture!==null,instancing:Te,instancingColor:Te&&O.instanceColor!==null,instancingMorph:Te&&O.morphTexture!==null,outputColorSpace:G===null?i.outputColorSpace:G.isXRRenderTarget===!0?G.texture.colorSpace:je.workingColorSpace,alphaToCoverage:!!g.alphaToCoverage,map:Ne,matcap:Ze,envMap:se,envMapMode:se&&ne.mapping,envMapCubeUVHeight:q,aoMap:Ue,lightMap:Ye,bumpMap:Ie,normalMap:nt,displacementMap:_t,emissiveMap:Dt,normalMapObjectSpace:nt&&g.normalMapType===Xu,normalMapTangentSpace:nt&&g.normalMapType===Fr,packedNormalMap:nt&&g.normalMapType===Fr&&Lx(g.normalMap.format),metalnessMap:qe,roughnessMap:it,anisotropy:L,anisotropyMap:Z,clearcoat:pt,clearcoatMap:re,clearcoatNormalMap:ae,clearcoatRoughnessMap:J,dispersion:Qe,retroreflection:C,iridescence:x,iridescenceMap:Q,iridescenceThicknessMap:le,sheen:B,sheenColorMap:Ce,sheenRoughnessMap:fe,specularMap:ce,specularColorMap:Re,specularIntensityMap:De,transmission:W,transmissionMap:Ve,thicknessMap:D,gradientMap:he,opaque:g.transparent===!1&&g.blending===Fs&&g.alphaToCoverage===!1,alphaMap:j,alphaTest:ue,alphaHash:xe,combine:g.combine,mapUv:Ne&&_(g.map.channel),aoMapUv:Ue&&_(g.aoMap.channel),lightMapUv:Ye&&_(g.lightMap.channel),bumpMapUv:Ie&&_(g.bumpMap.channel),normalMapUv:nt&&_(g.normalMap.channel),displacementMapUv:_t&&_(g.displacementMap.channel),emissiveMapUv:Dt&&_(g.emissiveMap.channel),metalnessMapUv:qe&&_(g.metalnessMap.channel),roughnessMapUv:it&&_(g.roughnessMap.channel),anisotropyMapUv:Z&&_(g.anisotropyMap.channel),clearcoatMapUv:re&&_(g.clearcoatMap.channel),clearcoatNormalMapUv:ae&&_(g.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:J&&_(g.clearcoatRoughnessMap.channel),iridescenceMapUv:Q&&_(g.iridescenceMap.channel),iridescenceThicknessMapUv:le&&_(g.iridescenceThicknessMap.channel),sheenColorMapUv:Ce&&_(g.sheenColorMap.channel),sheenRoughnessMapUv:fe&&_(g.sheenRoughnessMap.channel),specularMapUv:ce&&_(g.specularMap.channel),specularColorMapUv:Re&&_(g.specularColorMap.channel),specularIntensityMapUv:De&&_(g.specularIntensityMap.channel),transmissionMapUv:Ve&&_(g.transmissionMap.channel),thicknessMapUv:D&&_(g.thicknessMap.channel),alphaMapUv:j&&_(g.alphaMap.channel),vertexTangents:!!F.attributes.tangent&&(nt||L),vertexNormals:!!F.attributes.normal,vertexColors:g.vertexColors,vertexAlphas:g.vertexColors===!0&&!!F.attributes.color&&F.attributes.color.itemSize===4,pointsUvs:O.isPoints===!0&&!!F.attributes.uv&&(Ne||j),fog:!!I,useFog:g.fog===!0,fogExp2:!!I&&I.isFogExp2,flatShading:g.wireframe===!1&&(g.flatShading===!0||F.attributes.normal===void 0&&nt===!1&&(g.isMeshLambertMaterial||g.isMeshPhongMaterial||g.isMeshStandardMaterial||g.isMeshPhysicalMaterial)),sizeAttenuation:g.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:oe,skinning:O.isSkinnedMesh===!0,hasPositionAttribute:F.attributes.position!==void 0,morphTargets:F.morphAttributes.position!==void 0,morphNormals:F.morphAttributes.normal!==void 0,morphColors:F.morphAttributes.color!==void 0,morphTargetsCount:be,morphTextureStride:Se,numSunLights:A.sun.length,numDirLights:A.directional.length,numPointLights:A.point.length,numSpotLights:A.spot.length,numSpotLightMaps:A.spotLightMap.length,numRectAreaLights:A.rectArea.length,numHemiLights:A.hemi.length,numSunLightShadows:A.sunShadowMap.length,numDirLightShadows:A.directionalShadowMap.length,numPointLightShadows:A.pointShadowMap.length,numSpotLightShadows:A.spotShadowMap.length,numSpotLightShadowsWithMaps:A.numSpotLightShadowsWithMaps,numLightProbes:A.numLightProbes,numLightProbeGrids:k.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:g.dithering,shadowMapEnabled:i.shadowMap.enabled&&R.length>0,shadowMapType:i.shadowMap.type,toneMapping:Pe,decodeVideoTexture:Ne&&g.map.isVideoTexture===!0&&je.getTransfer(g.map.colorSpace)===at,decodeVideoTextureEmissive:Dt&&g.emissiveMap.isVideoTexture===!0&&je.getTransfer(g.emissiveMap.colorSpace)===at,premultipliedAlpha:g.premultipliedAlpha,doubleSided:g.side===Nt,flipSided:g.side===Yt,useDepthPacking:g.depthPacking>=0,depthPacking:g.depthPacking||0,index0AttributeName:g.index0AttributeName,extensionClipCullDistance:ie&&g.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ie&&g.extensions.multiDraw===!0||de)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:g.customProgramCacheKey()};return Ae.vertexUv1s=l.has(1),Ae.vertexUv2s=l.has(2),Ae.vertexUv3s=l.has(3),l.clear(),Ae}function m(g){let A=[];if(g.shaderID?A.push(g.shaderID):(A.push(g.customVertexShaderID),A.push(g.customFragmentShaderID)),g.defines!==void 0)for(let R in g.defines)A.push(R),A.push(g.defines[R]);return g.isRawShaderMaterial===!1&&(f(A,g),b(A,g),A.push(i.outputColorSpace)),A.push(g.customProgramCacheKey),A.join()}function f(g,A){g.push(A.precision),g.push(A.outputColorSpace),g.push(A.envMapMode),g.push(A.envMapCubeUVHeight),g.push(A.mapUv),g.push(A.alphaMapUv),g.push(A.lightMapUv),g.push(A.aoMapUv),g.push(A.bumpMapUv),g.push(A.normalMapUv),g.push(A.displacementMapUv),g.push(A.emissiveMapUv),g.push(A.metalnessMapUv),g.push(A.roughnessMapUv),g.push(A.anisotropyMapUv),g.push(A.clearcoatMapUv),g.push(A.clearcoatNormalMapUv),g.push(A.clearcoatRoughnessMapUv),g.push(A.iridescenceMapUv),g.push(A.iridescenceThicknessMapUv),g.push(A.sheenColorMapUv),g.push(A.sheenRoughnessMapUv),g.push(A.specularMapUv),g.push(A.specularColorMapUv),g.push(A.specularIntensityMapUv),g.push(A.transmissionMapUv),g.push(A.thicknessMapUv),g.push(A.combine),g.push(A.fogExp2),g.push(A.sizeAttenuation),g.push(A.morphTargetsCount),g.push(A.morphAttributeCount),g.push(A.numSunLights),g.push(A.numDirLights),g.push(A.numPointLights),g.push(A.numSpotLights),g.push(A.numSpotLightMaps),g.push(A.numHemiLights),g.push(A.numRectAreaLights),g.push(A.numSunLightShadows),g.push(A.numDirLightShadows),g.push(A.numPointLightShadows),g.push(A.numSpotLightShadows),g.push(A.numSpotLightShadowsWithMaps),g.push(A.numLightProbes),g.push(A.shadowMapType),g.push(A.toneMapping),g.push(A.numClippingPlanes),g.push(A.numClipIntersection),g.push(A.depthPacking)}function b(g,A){o.disableAll(),A.instancing&&o.enable(0),A.instancingColor&&o.enable(1),A.instancingMorph&&o.enable(2),A.matcap&&o.enable(3),A.envMap&&o.enable(4),A.normalMapObjectSpace&&o.enable(5),A.normalMapTangentSpace&&o.enable(6),A.clearcoat&&o.enable(7),A.iridescence&&o.enable(8),A.alphaTest&&o.enable(9),A.vertexColors&&o.enable(10),A.vertexAlphas&&o.enable(11),A.vertexUv1s&&o.enable(12),A.vertexUv2s&&o.enable(13),A.vertexUv3s&&o.enable(14),A.vertexTangents&&o.enable(15),A.anisotropy&&o.enable(16),A.alphaHash&&o.enable(17),A.batching&&o.enable(18),A.dispersion&&o.enable(19),A.retroreflection&&o.enable(24),A.batchingColor&&o.enable(20),A.gradientMap&&o.enable(21),A.packedNormalMap&&o.enable(22),A.vertexNormals&&o.enable(23),g.push(o.mask),o.disableAll(),A.fog&&o.enable(0),A.useFog&&o.enable(1),A.flatShading&&o.enable(2),A.logarithmicDepthBuffer&&o.enable(3),A.reversedDepthBuffer&&o.enable(4),A.skinning&&o.enable(5),A.morphTargets&&o.enable(6),A.morphNormals&&o.enable(7),A.morphColors&&o.enable(8),A.premultipliedAlpha&&o.enable(9),A.shadowMapEnabled&&o.enable(10),A.doubleSided&&o.enable(11),A.flipSided&&o.enable(12),A.useDepthPacking&&o.enable(13),A.dithering&&o.enable(14),A.transmission&&o.enable(15),A.sheen&&o.enable(16),A.opaque&&o.enable(17),A.pointsUvs&&o.enable(18),A.decodeVideoTexture&&o.enable(19),A.decodeVideoTextureEmissive&&o.enable(20),A.alphaToCoverage&&o.enable(21),A.numLightProbeGrids>0&&o.enable(22),A.hasPositionAttribute&&o.enable(23),g.push(o.mask)}function T(g){let A=p[g.type],R;if(A){let P=Un[A];R=rd.clone(P.uniforms)}else R=g.uniforms;return R}function y(g,A){let R=d.get(A);return R!==void 0?++R.usedTimes:(R=new Ix(i,A,g,s),c.push(R),d.set(A,R)),R}function w(g){if(--g.usedTimes===0){let A=c.indexOf(g);c[A]=c[c.length-1],c.pop(),d.delete(g.cacheKey),g.destroy()}}function S(g){a.remove(g)}function E(){a.dispose()}return{getParameters:v,getProgramCacheKey:m,getUniforms:T,acquireProgram:y,releaseProgram:w,releaseShaderCache:S,programs:c,dispose:E}}function Dx(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function Ux(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function Td(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Ad(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function o(u){let p=0;return u.isInstancedMesh&&(p+=2),u.isSkinnedMesh&&(p+=1),p}function a(u,p,_,v,m,f){let b=i[e];return b===void 0?(b={id:u.id,object:u,geometry:p,material:_,materialVariant:o(u),groupOrder:v,renderOrder:u.renderOrder,z:m,group:f},i[e]=b):(b.id=u.id,b.object=u,b.geometry=p,b.material=_,b.materialVariant=o(u),b.groupOrder=v,b.renderOrder=u.renderOrder,b.z=m,b.group=f),e++,b}function l(u,p,_,v,m,f,b){b.reversedDepth===!0&&(m=-m);let T=a(u,p,_,v,m,f);_.transmission>0?n.push(T):_.transparent===!0?s.push(T):t.push(T)}function c(u,p,_,v,m,f){let b=a(u,p,_,v,m,f);_.transmission>0?n.unshift(b):_.transparent===!0?s.unshift(b):t.unshift(b)}function d(u,p){t.length>1&&t.sort(u||Ux),n.length>1&&n.sort(p||Td),s.length>1&&s.sort(p||Td)}function h(){for(let u=e,p=i.length;u<p;u++){let _=i[u];if(_.id===null)break;_.id=null,_.object=null,_.geometry=null,_.material=null,_.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:h,sort:d}}function Ox(){let i=new WeakMap;function e(n,s){let r=i.get(n),o;return r===void 0?(o=new Ad,i.set(n,[o])):s>=r.length?(o=new Ad,r.push(o)):o=r[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function Fx(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new U,color:new Be};break;case"SpotLight":t={position:new U,direction:new U,color:new Be,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new U,color:new Be,distance:0,decay:0};break;case"HemisphereLight":t={direction:new U,skyColor:new Be,groundColor:new Be};break;case"RectAreaLight":t={color:new Be,position:new U,halfWidth:new U,halfHeight:new U};break}return i[e.id]=t,t}}}function Bx(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var kx=0;function zx(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function Vx(i){let e=new Fx,t=Bx(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new U);let s=new U,r=new ke,o=new ke;function a(c){let d=0,h=0,u=0;for(let O=0;O<9;O++)n.probe[O].set(0,0,0);let p=0,_=0,v=0,m=0,f=0,b=0,T=0,y=0,w=0,S=0,E=0,g=0,A=0,R=0;c.sort(zx);for(let O=0,k=c.length;O<k;O++){let I=c[O],F=I.color,$=I.intensity,X=I.distance,ne=null;if(I.shadow&&I.shadow.map&&(I.shadow.map.texture.format===_i?ne=I.shadow.map.texture:ne=I.shadow.map.depthTexture||I.shadow.map.texture),I.isAmbientLight)d+=F.r*$,h+=F.g*$,u+=F.b*$;else if(I.isLightProbe){for(let q=0;q<9;q++)n.probe[q].addScaledVector(I.sh.coefficients[q],$);R++}else if(I.isSunLight){let q=e.get(I);if(q.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let K=I.shadow,ee=t.get(I);ee.shadowIntensity=K.intensity,ee.shadowBias=K.bias,ee.shadowNormalBias=K.normalBias,ee.shadowRadius=K.radius,ee.shadowMapSize.copy(K.mapSize).multiply(K.getFrameExtents()),n.sunShadow[_]=ee,n.sunShadowMap[_]=ne;let be=K.getViewportCount();for(let Se=0;Se<be;Se++)n.sunShadowMatrix[v+Se]=K.getMatrix(Se),n.sunShadowCascade[v+Se]=K._cascadeData[Se];v+=be,_++}n.sun[p]=q,p++}else if(I.isDirectionalLight){let q=e.get(I);if(q.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let K=I.shadow,ee=t.get(I);ee.shadowIntensity=K.intensity,ee.shadowBias=K.bias,ee.shadowNormalBias=K.normalBias,ee.shadowRadius=K.radius,ee.shadowMapSize=K.mapSize,n.directionalShadow[m]=ee,n.directionalShadowMap[m]=ne,n.directionalShadowMatrix[m]=I.shadow.matrix,w++}n.directional[m]=q,m++}else if(I.isSpotLight){let q=e.get(I);q.position.setFromMatrixPosition(I.matrixWorld),q.color.copy(F).multiplyScalar($),q.distance=X,q.coneCos=Math.cos(I.angle),q.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),q.decay=I.decay,n.spot[b]=q;let K=I.shadow;if(I.map&&(n.spotLightMap[g]=I.map,g++,K.updateMatrices(I),I.castShadow&&A++),n.spotLightMatrix[b]=K.matrix,I.castShadow){let ee=t.get(I);ee.shadowIntensity=K.intensity,ee.shadowBias=K.bias,ee.shadowNormalBias=K.normalBias,ee.shadowRadius=K.radius,ee.shadowMapSize=K.mapSize,n.spotShadow[b]=ee,n.spotShadowMap[b]=ne,E++}b++}else if(I.isRectAreaLight){let q=e.get(I);q.color.copy(F).multiplyScalar($),q.halfWidth.set(I.width*.5,0,0),q.halfHeight.set(0,I.height*.5,0),n.rectArea[T]=q,T++}else if(I.isPointLight){let q=e.get(I);if(q.color.copy(I.color).multiplyScalar(I.intensity),q.distance=I.distance,q.decay=I.decay,I.castShadow){let K=I.shadow,ee=t.get(I);ee.shadowIntensity=K.intensity,ee.shadowBias=K.bias,ee.shadowNormalBias=K.normalBias,ee.shadowRadius=K.radius,ee.shadowMapSize=K.mapSize,ee.shadowCameraNear=K.camera.near,ee.shadowCameraFar=K.camera.far,n.pointShadow[f]=ee,n.pointShadowMap[f]=ne,n.pointShadowMatrix[f]=I.shadow.matrix,S++}n.point[f]=q,f++}else if(I.isHemisphereLight){let q=e.get(I);q.skyColor.copy(I.color).multiplyScalar($),q.groundColor.copy(I.groundColor).multiplyScalar($),n.hemi[y]=q,y++}}T>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=pe.LTC_FLOAT_1,n.rectAreaLTC2=pe.LTC_FLOAT_2):(n.rectAreaLTC1=pe.LTC_HALF_1,n.rectAreaLTC2=pe.LTC_HALF_2)),n.ambient[0]=d,n.ambient[1]=h,n.ambient[2]=u;let P=n.hash;(P.sunLength!==p||P.directionalLength!==m||P.pointLength!==f||P.spotLength!==b||P.rectAreaLength!==T||P.hemiLength!==y||P.numSunShadows!==_||P.numDirectionalShadows!==w||P.numPointShadows!==S||P.numSpotShadows!==E||P.numSpotMaps!==g||P.numLightProbes!==R)&&(n.sun.length=p,n.directional.length=m,n.spot.length=b,n.rectArea.length=T,n.point.length=f,n.hemi.length=y,n.sunShadow.length=_,n.sunShadowMap.length=_,n.sunShadowMatrix.length=v,n.sunShadowCascade.length=v,n.directionalShadow.length=w,n.directionalShadowMap.length=w,n.directionalShadowMatrix.length=w,n.pointShadow.length=S,n.pointShadowMap.length=S,n.pointShadowMatrix.length=S,n.spotShadow.length=E,n.spotShadowMap.length=E,n.spotLightMatrix.length=E+g-A,n.spotLightMap.length=g,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=R,P.sunLength=p,P.directionalLength=m,P.pointLength=f,P.spotLength=b,P.rectAreaLength=T,P.hemiLength=y,P.numSunShadows=_,P.numDirectionalShadows=w,P.numPointShadows=S,P.numSpotShadows=E,P.numSpotMaps=g,P.numLightProbes=R,n.version=kx++)}function l(c,d){let h=0,u=0,p=0,_=0,v=0,m=0,f=d.matrixWorldInverse;for(let b=0,T=c.length;b<T;b++){let y=c[b];if(y.isSunLight){let w=n.sun[h];w.direction.setFromMatrixPosition(y.matrixWorld),w.direction.transformDirection(f),h++}else if(y.isDirectionalLight){let w=n.directional[u];w.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),w.direction.sub(s),w.direction.transformDirection(f),u++}else if(y.isSpotLight){let w=n.spot[_];w.position.setFromMatrixPosition(y.matrixWorld),w.position.applyMatrix4(f),w.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),w.direction.sub(s),w.direction.transformDirection(f),_++}else if(y.isRectAreaLight){let w=n.rectArea[v];w.position.setFromMatrixPosition(y.matrixWorld),w.position.applyMatrix4(f),o.identity(),r.copy(y.matrixWorld),r.premultiply(f),o.extractRotation(r),w.halfWidth.set(y.width*.5,0,0),w.halfHeight.set(0,y.height*.5,0),w.halfWidth.applyMatrix4(o),w.halfHeight.applyMatrix4(o),v++}else if(y.isPointLight){let w=n.point[p];w.position.setFromMatrixPosition(y.matrixWorld),w.position.applyMatrix4(f),p++}else if(y.isHemisphereLight){let w=n.hemi[m];w.direction.setFromMatrixPosition(y.matrixWorld),w.direction.transformDirection(f),m++}}}return{setup:a,setupView:l,state:n}}function Ed(i){let e=new Vx(i),t=[],n=[],s=[];function r(u){h.camera=u,t.length=0,n.length=0,s.length=0}function o(u){t.push(u)}function a(u){n.push(u)}function l(u){s.push(u)}function c(){e.setup(t)}function d(u){e.setupView(t,u)}let h={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:h,setupLights:c,setupLightsView:d,pushLight:o,pushShadow:a,pushLightProbeGrid:l}}function Hx(i){let e=new WeakMap;function t(s,r=0){let o=e.get(s),a;return o===void 0?(a=new Ed(i),e.set(s,[a])):r>=o.length?(a=new Ed(i),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}var Gx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Wx=`uniform sampler2D shadow_pass;
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
}`,Xx=[new U(1,0,0),new U(-1,0,0),new U(0,1,0),new U(0,-1,0),new U(0,0,1),new U(0,0,-1)],Yx=[new U(0,-1,0),new U(0,-1,0),new U(0,0,1),new U(0,0,-1),new U(0,-1,0),new U(0,-1,0)],Cd=new ke,kr=new U,Ec=new U;function qx(i,e,t){let n=new Rs,s=new Oe,r=new Oe,o=new lt,a=new zo,l=new Vo,c={},d=t.maxTextureSize,h={[Pn]:Yt,[Yt]:Pn,[Nt]:Nt},u=new tn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Oe},radius:{value:4}},vertexShader:Gx,fragmentShader:Wx}),p=u.clone();p.defines.HORIZONTAL_PASS=1;let _=new At;_.setAttribute("position",new Ge(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let v=new Xt(_,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Rr;let f=this.type;this.render=function(S,E,g){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||S.length===0)return;this.type===Su&&(Le("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Rr);let A=i.getRenderTarget(),R=i.getActiveCubeFace(),P=i.getActiveMipmapLevel(),O=i.state;O.setBlending(Ln),O.buffers.depth.getReversed()===!0?O.buffers.color.setClear(0,0,0,0):O.buffers.color.setClear(1,1,1,1),O.buffers.depth.setTest(!0),O.setScissorTest(!1);let k=f!==this.type;k&&E.traverse(function(I){I.material&&(Array.isArray(I.material)?I.material.forEach(F=>F.needsUpdate=!0):I.material.needsUpdate=!0)});for(let I=0,F=S.length;I<F;I++){let $=S[I],X=$.shadow;if(X===void 0){Le("WebGLShadowMap:",$,"has no shadow.");continue}if(X.autoUpdate===!1&&X.needsUpdate===!1)continue;s.copy(X.mapSize);let ne=X.getFrameExtents();s.multiply(ne),r.copy(X.mapSize),(s.x>d||s.y>d)&&(s.x>d&&(r.x=Math.floor(d/ne.x),s.x=r.x*ne.x,X.mapSize.x=r.x),s.y>d&&(r.y=Math.floor(d/ne.y),s.y=r.y*ne.y,X.mapSize.y=r.y));let q=i.state.buffers.depth.getReversed();if(X.camera._reversedDepth=q,X.map===null||k===!0){if(X.map!==null&&(X.map.depthTexture!==null&&(X.map.depthTexture.dispose(),X.map.depthTexture=null),X.map.dispose()),this.type===Os){if($.isPointLight){Le("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}X.map=new Zt(s.x,s.y,{format:_i,type:bn,minFilter:Tt,magFilter:Tt,generateMipmaps:!1}),X.map.texture.name=$.name+".shadowMap",X.map.depthTexture=new ci(s.x,s.y,cn),X.map.depthTexture.name=$.name+".shadowMapDepth",X.map.depthTexture.format=Rn,X.map.depthTexture.compareFunction=null,X.map.depthTexture.minFilter=wt,X.map.depthTexture.magFilter=wt}else $.isPointLight?(X.map=new Ya(s.x),X.map.depthTexture=new Bo(s.x,vn)):(X.map=new Zt(s.x,s.y),X.map.depthTexture=new ci(s.x,s.y,vn)),X.map.depthTexture.name=$.name+".shadowMap",X.map.depthTexture.format=Rn,this.type===Rr?(X.map.depthTexture.compareFunction=q?Ha:Va,X.map.depthTexture.minFilter=Tt,X.map.depthTexture.magFilter=Tt):(X.map.depthTexture.compareFunction=null,X.map.depthTexture.minFilter=wt,X.map.depthTexture.magFilter=wt);X.camera.updateProjectionMatrix()}X.map.isWebGLCubeRenderTarget!==!0&&(X.map.width!==s.x||X.map.height!==s.y)&&X.map.setSize(s.x,s.y);let K=X.map.isWebGLCubeRenderTarget?6:X.getViewportCount();$.isPointLight!==!0&&X.updateMatrices($,g);for(let ee=0;ee<K;ee++){let be=X.getCamera(ee);if($.isPointLight){let Se=X.camera,tt=X.matrix,He=$.distance||Se.far;He!==Se.far&&(Se.far=He,Se.updateProjectionMatrix()),kr.setFromMatrixPosition($.matrixWorld),Se.position.copy(kr),Ec.copy(Se.position),Ec.add(Xx[ee]),Se.up.copy(Yx[ee]),Se.lookAt(Ec),Se.updateMatrixWorld(),tt.makeTranslation(-kr.x,-kr.y,-kr.z),Cd.multiplyMatrices(Se.projectionMatrix,Se.matrixWorldInverse),X._frustum.setFromProjectionMatrix(Cd,Se.coordinateSystem,Se.reversedDepth)}if(X.map.isWebGLCubeRenderTarget)i.setRenderTarget(X.map,ee),i.clear();else{ee===0&&(i.setRenderTarget(X.map),i.clear());let Se=X.getViewport(ee);o.set(r.x*Se.x,r.y*Se.y,r.x*Se.z,r.y*Se.w),O.viewport(o)}n=X.getFrustum(ee),y(E,g,be,$,this.type)}X.isPointLightShadow!==!0&&this.type===Os&&b(X,g),X.needsUpdate=!1}f=this.type,m.needsUpdate=!1,i.setRenderTarget(A,R,P)};function b(S,E){let g=e.update(v);u.defines.VSM_SAMPLES!==S.blurSamples&&(u.defines.VSM_SAMPLES=S.blurSamples,p.defines.VSM_SAMPLES=S.blurSamples,u.needsUpdate=!0,p.needsUpdate=!0),S.mapPass===null?S.mapPass=new Zt(s.x,s.y,{format:_i,type:bn}):(S.mapPass.width!==S.map.width||S.mapPass.height!==S.map.height)&&S.mapPass.setSize(S.map.width,S.map.height),u.uniforms.shadow_pass.value=S.map.depthTexture,u.uniforms.resolution.value.set(S.map.width,S.map.height),u.uniforms.radius.value=S.radius,i.setRenderTarget(S.mapPass),i.clear(),i.renderBufferDirect(E,null,g,u,v,null),p.uniforms.shadow_pass.value=S.mapPass.texture,p.uniforms.resolution.value.set(S.map.width,S.map.height),p.uniforms.radius.value=S.radius,i.setRenderTarget(S.map),i.clear(),i.renderBufferDirect(E,null,g,p,v,null)}function T(S,E,g,A){let R=null,P=g.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(P!==void 0)R=P;else if(R=g.isPointLight===!0?l:a,i.localClippingEnabled&&E.clipShadows===!0&&Array.isArray(E.clippingPlanes)&&E.clippingPlanes.length!==0||E.displacementMap&&E.displacementScale!==0||E.alphaMap&&E.alphaTest>0||E.map&&E.alphaTest>0||E.alphaToCoverage===!0){let O=R.uuid,k=E.uuid,I=c[O];I===void 0&&(I={},c[O]=I);let F=I[k];F===void 0&&(F=R.clone(),I[k]=F,E.addEventListener("dispose",w)),R=F}if(R.visible=E.visible,R.wireframe=E.wireframe,A===Os?R.side=E.shadowSide!==null?E.shadowSide:E.side:R.side=E.shadowSide!==null?E.shadowSide:h[E.side],R.alphaMap=E.alphaMap,R.alphaTest=E.alphaToCoverage===!0?.5:E.alphaTest,R.map=E.map,R.clipShadows=E.clipShadows,R.clippingPlanes=E.clippingPlanes,R.clipIntersection=E.clipIntersection,R.displacementMap=E.displacementMap,R.displacementScale=E.displacementScale,R.displacementBias=E.displacementBias,R.wireframeLinewidth=E.wireframeLinewidth,R.linewidth=E.linewidth,g.isPointLight===!0&&R.isMeshDistanceMaterial===!0){let O=i.properties.get(R);O.light=g}return R}function y(S,E,g,A,R){if(S.visible===!1)return;if(S.layers.test(E.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&R===Os)&&(!S.frustumCulled||S.intersectsFrustum(n))){S.modelViewMatrix.multiplyMatrices(g.matrixWorldInverse,S.matrixWorld);let k=e.update(S),I=S.material;if(Array.isArray(I)){let F=k.groups;for(let $=0,X=F.length;$<X;$++){let ne=F[$],q=I[ne.materialIndex];if(q&&q.visible){let K=T(S,q,A,R);S.onBeforeShadow(i,S,E,g,k,K,ne),i.renderBufferDirect(g,null,k,K,S,ne),S.onAfterShadow(i,S,E,g,k,K,ne)}}}else if(I.visible){let F=T(S,I,A,R);S.onBeforeShadow(i,S,E,g,k,F,null),i.renderBufferDirect(g,null,k,F,S,null),S.onAfterShadow(i,S,E,g,k,F,null)}}let O=S.children;for(let k=0,I=O.length;k<I;k++)y(O[k],E,g,A,R)}function w(S){S.target.removeEventListener("dispose",w);for(let g in c){let A=c[g],R=S.target.uuid;R in A&&(A[R].dispose(),delete A[R])}}}function $x(i,e){function t(){let D=!1,he=new lt,j=null,ue=new lt(0,0,0,0);return{setMask:function(xe){j!==xe&&!D&&(i.colorMask(xe,xe,xe,xe),j=xe)},setLocked:function(xe){D=xe},setClear:function(xe,ie,Pe,Ae,dt){dt===!0&&(xe*=Ae,ie*=Ae,Pe*=Ae),he.set(xe,ie,Pe,Ae),ue.equals(he)===!1&&(i.clearColor(xe,ie,Pe,Ae),ue.copy(he))},reset:function(){D=!1,j=null,ue.set(-1,0,0,0)}}}function n(){let D=!1,he=!1,j=null,ue=null,xe=null;return{setReversed:function(ie){if(he!==ie){let Pe=e.get("EXT_clip_control");ie?Pe.clipControlEXT(Pe.LOWER_LEFT_EXT,Pe.ZERO_TO_ONE_EXT):Pe.clipControlEXT(Pe.LOWER_LEFT_EXT,Pe.NEGATIVE_ONE_TO_ONE_EXT),he=ie;let Ae=xe;xe=null,this.setClear(Ae)}},getReversed:function(){return he},setTest:function(ie){ie?G(i.DEPTH_TEST):oe(i.DEPTH_TEST)},setMask:function(ie){j!==ie&&!D&&(i.depthMask(ie),j=ie)},setFunc:function(ie){if(he&&(ie=id[ie]),ue!==ie){switch(ie){case Ro:i.depthFunc(i.NEVER);break;case Io:i.depthFunc(i.ALWAYS);break;case Po:i.depthFunc(i.LESS);break;case xs:i.depthFunc(i.LEQUAL);break;case Lo:i.depthFunc(i.EQUAL);break;case No:i.depthFunc(i.GEQUAL);break;case Do:i.depthFunc(i.GREATER);break;case Uo:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}ue=ie}},setLocked:function(ie){D=ie},setClear:function(ie){xe!==ie&&(xe=ie,he&&(ie=1-ie),i.clearDepth(ie))},reset:function(){D=!1,j=null,ue=null,xe=null,he=!1}}}function s(){let D=!1,he=null,j=null,ue=null,xe=null,ie=null,Pe=null,Ae=null,dt=null;return{setTest:function(st){D||(st?G(i.STENCIL_TEST):oe(i.STENCIL_TEST))},setMask:function(st){he!==st&&!D&&(i.stencilMask(st),he=st)},setFunc:function(st,un,An){(j!==st||ue!==un||xe!==An)&&(i.stencilFunc(st,un,An),j=st,ue=un,xe=An)},setOp:function(st,un,An){(ie!==st||Pe!==un||Ae!==An)&&(i.stencilOp(st,un,An),ie=st,Pe=un,Ae=An)},setLocked:function(st){D=st},setClear:function(st){dt!==st&&(i.clearStencil(st),dt=st)},reset:function(){D=!1,he=null,j=null,ue=null,xe=null,ie=null,Pe=null,Ae=null,dt=null}}}let r=new t,o=new n,a=new s,l=new WeakMap,c=new WeakMap,d={},h={},u={},p=new WeakMap,_=[],v=null,m=!1,f=null,b=null,T=null,y=null,w=null,S=null,E=null,g=new Be(0,0,0),A=0,R=!1,P=null,O=null,k=null,I=null,F=null,$=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),X=!1,ne=0,q=i.getParameter(i.VERSION);q.indexOf("WebGL")!==-1?(ne=parseFloat(/^WebGL (\d)/.exec(q)[1]),X=ne>=1):q.indexOf("OpenGL ES")!==-1&&(ne=parseFloat(/^OpenGL ES (\d)/.exec(q)[1]),X=ne>=2);let K=null,ee={},be=i.getParameter(i.SCISSOR_BOX),Se=i.getParameter(i.VIEWPORT),tt=new lt().fromArray(be),He=new lt().fromArray(Se);function te(D,he,j,ue){let xe=new Uint8Array(4),ie=i.createTexture();i.bindTexture(D,ie),i.texParameteri(D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(D,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Pe=0;Pe<j;Pe++)D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY?i.texImage3D(he,0,i.RGBA,1,1,ue,0,i.RGBA,i.UNSIGNED_BYTE,xe):i.texImage2D(he+Pe,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,xe);return ie}let H={};H[i.TEXTURE_2D]=te(i.TEXTURE_2D,i.TEXTURE_2D,1),H[i.TEXTURE_CUBE_MAP]=te(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),H[i.TEXTURE_2D_ARRAY]=te(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),H[i.TEXTURE_3D]=te(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),G(i.DEPTH_TEST),o.setFunc(xs),Ie(!1),nt($l),G(i.CULL_FACE),Ue(Ln);function G(D){d[D]!==!0&&(i.enable(D),d[D]=!0)}function oe(D){d[D]!==!1&&(i.disable(D),d[D]=!1)}function Te(D,he){return u[D]!==he?(i.bindFramebuffer(D,he),u[D]=he,D===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=he),D===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=he),!0):!1}function de(D,he){let j=_,ue=!1;if(D){j=p.get(he),j===void 0&&(j=[],p.set(he,j));let xe=D.textures;if(j.length!==xe.length||j[0]!==i.COLOR_ATTACHMENT0){for(let ie=0,Pe=xe.length;ie<Pe;ie++)j[ie]=i.COLOR_ATTACHMENT0+ie;j.length=xe.length,ue=!0}}else j[0]!==i.BACK&&(j[0]=i.BACK,ue=!0);ue&&i.drawBuffers(j)}function Ne(D){return v!==D?(i.useProgram(D),v=D,!0):!1}let Ze={[Fi]:i.FUNC_ADD,[wu]:i.FUNC_SUBTRACT,[Tu]:i.FUNC_REVERSE_SUBTRACT};Ze[Au]=i.MIN,Ze[Eu]=i.MAX;let se={[Cu]:i.ZERO,[Ru]:i.ONE,[Iu]:i.SRC_COLOR,[jl]:i.SRC_ALPHA,[Ou]:i.SRC_ALPHA_SATURATE,[Du]:i.DST_COLOR,[Lu]:i.DST_ALPHA,[Pu]:i.ONE_MINUS_SRC_COLOR,[Ql]:i.ONE_MINUS_SRC_ALPHA,[Uu]:i.ONE_MINUS_DST_COLOR,[Nu]:i.ONE_MINUS_DST_ALPHA,[Fu]:i.CONSTANT_COLOR,[Bu]:i.ONE_MINUS_CONSTANT_COLOR,[ku]:i.CONSTANT_ALPHA,[zu]:i.ONE_MINUS_CONSTANT_ALPHA};function Ue(D,he,j,ue,xe,ie,Pe,Ae,dt,st){if(D===Ln){m===!0&&(oe(i.BLEND),m=!1);return}if(m===!1&&(G(i.BLEND),m=!0),D!==Mu){if(D!==f||st!==R){if((b!==Fi||w!==Fi)&&(i.blendEquation(i.FUNC_ADD),b=Fi,w=Fi),st)switch(D){case Fs:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Zl:i.blendFunc(i.ONE,i.ONE);break;case Kl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Jl:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Fe("WebGLState: Invalid blending: ",D);break}else switch(D){case Fs:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Zl:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Kl:Fe("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Jl:Fe("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Fe("WebGLState: Invalid blending: ",D);break}T=null,y=null,S=null,E=null,g.set(0,0,0),A=0,f=D,R=st}return}xe=xe||he,ie=ie||j,Pe=Pe||ue,(he!==b||xe!==w)&&(i.blendEquationSeparate(Ze[he],Ze[xe]),b=he,w=xe),(j!==T||ue!==y||ie!==S||Pe!==E)&&(i.blendFuncSeparate(se[j],se[ue],se[ie],se[Pe]),T=j,y=ue,S=ie,E=Pe),(Ae.equals(g)===!1||dt!==A)&&(i.blendColor(Ae.r,Ae.g,Ae.b,dt),g.copy(Ae),A=dt),f=D,R=!1}function Ye(D,he){D.side===Nt?oe(i.CULL_FACE):G(i.CULL_FACE);let j=D.side===Yt;he&&(j=!j),Ie(j),D.blending===Fs&&D.transparent===!1?Ue(Ln):Ue(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),o.setFunc(D.depthFunc),o.setTest(D.depthTest),o.setMask(D.depthWrite),r.setMask(D.colorWrite);let ue=D.stencilWrite;a.setTest(ue),ue&&(a.setMask(D.stencilWriteMask),a.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),a.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),Dt(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?G(i.SAMPLE_ALPHA_TO_COVERAGE):oe(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ie(D){P!==D&&(D?i.frontFace(i.CW):i.frontFace(i.CCW),P=D)}function nt(D){D!==vu?(G(i.CULL_FACE),D!==O&&(D===$l?i.cullFace(i.BACK):D===bu?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):oe(i.CULL_FACE),O=D}function _t(D){D!==k&&(X&&i.lineWidth(D),k=D)}function Dt(D,he,j){D?(G(i.POLYGON_OFFSET_FILL),(I!==he||F!==j)&&(I=he,F=j,o.getReversed()&&(he=-he),i.polygonOffset(he,j))):oe(i.POLYGON_OFFSET_FILL)}function qe(D){D?G(i.SCISSOR_TEST):oe(i.SCISSOR_TEST)}function it(D){D===void 0&&(D=i.TEXTURE0+$-1),K!==D&&(i.activeTexture(D),K=D)}function L(D,he,j){j===void 0&&(K===null?j=i.TEXTURE0+$-1:j=K);let ue=ee[j];ue===void 0&&(ue={type:void 0,texture:void 0},ee[j]=ue),(ue.type!==D||ue.texture!==he)&&(K!==j&&(i.activeTexture(j),K=j),i.bindTexture(D,he||H[D]),ue.type=D,ue.texture=he)}function pt(){let D=ee[K];D!==void 0&&D.type!==void 0&&(i.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function Qe(){try{i.compressedTexImage2D(...arguments)}catch(D){Fe("WebGLState:",D)}}function C(){try{i.compressedTexImage3D(...arguments)}catch(D){Fe("WebGLState:",D)}}function x(){try{i.texSubImage2D(...arguments)}catch(D){Fe("WebGLState:",D)}}function B(){try{i.texSubImage3D(...arguments)}catch(D){Fe("WebGLState:",D)}}function W(){try{i.compressedTexSubImage2D(...arguments)}catch(D){Fe("WebGLState:",D)}}function Z(){try{i.compressedTexSubImage3D(...arguments)}catch(D){Fe("WebGLState:",D)}}function re(){try{i.texStorage2D(...arguments)}catch(D){Fe("WebGLState:",D)}}function ae(){try{i.texStorage3D(...arguments)}catch(D){Fe("WebGLState:",D)}}function J(){try{i.texImage2D(...arguments)}catch(D){Fe("WebGLState:",D)}}function Q(){try{i.texImage3D(...arguments)}catch(D){Fe("WebGLState:",D)}}function le(D){return h[D]!==void 0?h[D]:i.getParameter(D)}function Ce(D,he){h[D]!==he&&(i.pixelStorei(D,he),h[D]=he)}function fe(D){tt.equals(D)===!1&&(i.scissor(D.x,D.y,D.z,D.w),tt.copy(D))}function ce(D){He.equals(D)===!1&&(i.viewport(D.x,D.y,D.z,D.w),He.copy(D))}function Re(D,he){let j=c.get(he);j===void 0&&(j=new WeakMap,c.set(he,j));let ue=j.get(D);ue===void 0&&(ue=i.getUniformBlockIndex(he,D.name),j.set(D,ue))}function De(D,he){let ue=c.get(he).get(D);l.get(he)!==ue&&(i.uniformBlockBinding(he,ue,D.__bindingPointIndex),l.set(he,ue))}function Ve(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),d={},h={},K=null,ee={},u={},p=new WeakMap,_=[],v=null,m=!1,f=null,b=null,T=null,y=null,w=null,S=null,E=null,g=new Be(0,0,0),A=0,R=!1,P=null,O=null,k=null,I=null,F=null,tt.set(0,0,i.canvas.width,i.canvas.height),He.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:G,disable:oe,bindFramebuffer:Te,drawBuffers:de,useProgram:Ne,setBlending:Ue,setMaterial:Ye,setFlipSided:Ie,setCullFace:nt,setLineWidth:_t,setPolygonOffset:Dt,setScissorTest:qe,activeTexture:it,bindTexture:L,unbindTexture:pt,compressedTexImage2D:Qe,compressedTexImage3D:C,texImage2D:J,texImage3D:Q,pixelStorei:Ce,getParameter:le,updateUBOMapping:Re,uniformBlockBinding:De,texStorage2D:re,texStorage3D:ae,texSubImage2D:x,texSubImage3D:B,compressedTexSubImage2D:W,compressedTexSubImage3D:Z,scissor:fe,viewport:ce,reset:Ve}}function Zx(i,e,t,n,s,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Oe,d=new WeakMap,h=new Set,u,p=new WeakMap,_=!1;try{_=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(C,x){return _?new OffscreenCanvas(C,x):Ms("canvas")}function m(C,x,B){let W=1,Z=Qe(C);if((Z.width>B||Z.height>B)&&(W=B/Math.max(Z.width,Z.height)),W<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let re=Math.floor(W*Z.width),ae=Math.floor(W*Z.height);u===void 0&&(u=v(re,ae));let J=x?v(re,ae):u;return J.width=re,J.height=ae,J.getContext("2d").drawImage(C,0,0,re,ae),Le("WebGLRenderer: Texture has been resized from ("+Z.width+"x"+Z.height+") to ("+re+"x"+ae+")."),J}else return"data"in C&&Le("WebGLRenderer: Image in DataTexture is too big ("+Z.width+"x"+Z.height+")."),C;return C}function f(C){return C.generateMipmaps}function b(C){i.generateMipmap(C)}function T(C){return C.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?i.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function y(C,x,B,W,Z,re=!1){if(C!==null){if(i[C]!==void 0)return i[C];Le("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let ae;W&&(ae=e.get("EXT_texture_norm16"),ae||Le("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let J=x;if(x===i.RED&&(B===i.FLOAT&&(J=i.R32F),B===i.HALF_FLOAT&&(J=i.R16F),B===i.UNSIGNED_BYTE&&(J=i.R8),B===i.UNSIGNED_SHORT&&ae&&(J=ae.R16_EXT),B===i.SHORT&&ae&&(J=ae.R16_SNORM_EXT)),x===i.RED_INTEGER&&(B===i.UNSIGNED_BYTE&&(J=i.R8UI),B===i.UNSIGNED_SHORT&&(J=i.R16UI),B===i.UNSIGNED_INT&&(J=i.R32UI),B===i.BYTE&&(J=i.R8I),B===i.SHORT&&(J=i.R16I),B===i.INT&&(J=i.R32I)),x===i.RG&&(B===i.FLOAT&&(J=i.RG32F),B===i.HALF_FLOAT&&(J=i.RG16F),B===i.UNSIGNED_BYTE&&(J=i.RG8),B===i.UNSIGNED_SHORT&&ae&&(J=ae.RG16_EXT),B===i.SHORT&&ae&&(J=ae.RG16_SNORM_EXT)),x===i.RG_INTEGER&&(B===i.UNSIGNED_BYTE&&(J=i.RG8UI),B===i.UNSIGNED_SHORT&&(J=i.RG16UI),B===i.UNSIGNED_INT&&(J=i.RG32UI),B===i.BYTE&&(J=i.RG8I),B===i.SHORT&&(J=i.RG16I),B===i.INT&&(J=i.RG32I)),x===i.RGB_INTEGER&&(B===i.UNSIGNED_BYTE&&(J=i.RGB8UI),B===i.UNSIGNED_SHORT&&(J=i.RGB16UI),B===i.UNSIGNED_INT&&(J=i.RGB32UI),B===i.BYTE&&(J=i.RGB8I),B===i.SHORT&&(J=i.RGB16I),B===i.INT&&(J=i.RGB32I)),x===i.RGBA_INTEGER&&(B===i.UNSIGNED_BYTE&&(J=i.RGBA8UI),B===i.UNSIGNED_SHORT&&(J=i.RGBA16UI),B===i.UNSIGNED_INT&&(J=i.RGBA32UI),B===i.BYTE&&(J=i.RGBA8I),B===i.SHORT&&(J=i.RGBA16I),B===i.INT&&(J=i.RGBA32I)),x===i.RGB&&(B===i.UNSIGNED_SHORT&&ae&&(J=ae.RGB16_EXT),B===i.SHORT&&ae&&(J=ae.RGB16_SNORM_EXT),B===i.UNSIGNED_INT_5_9_9_9_REV&&(J=i.RGB9_E5),B===i.UNSIGNED_INT_10F_11F_11F_REV&&(J=i.R11F_G11F_B10F)),x===i.RGBA){let Q=re?dr:je.getTransfer(Z);B===i.FLOAT&&(J=i.RGBA32F),B===i.HALF_FLOAT&&(J=i.RGBA16F),B===i.UNSIGNED_BYTE&&(J=Q===at?i.SRGB8_ALPHA8:i.RGBA8),B===i.UNSIGNED_SHORT&&ae&&(J=ae.RGBA16_EXT),B===i.SHORT&&ae&&(J=ae.RGBA16_SNORM_EXT),B===i.UNSIGNED_SHORT_4_4_4_4&&(J=i.RGBA4),B===i.UNSIGNED_SHORT_5_5_5_1&&(J=i.RGB5_A1)}return(J===i.R16F||J===i.R32F||J===i.RG16F||J===i.RG32F||J===i.RGBA16F||J===i.RGBA32F)&&e.get("EXT_color_buffer_float"),J}function w(C,x){let B;return C?x===null||x===vn||x===zs?B=i.DEPTH24_STENCIL8:x===cn?B=i.DEPTH32F_STENCIL8:x===ks&&(B=i.DEPTH24_STENCIL8,Le("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===vn||x===zs?B=i.DEPTH_COMPONENT24:x===cn?B=i.DEPTH_COMPONENT32F:x===ks&&(B=i.DEPTH_COMPONENT16),B}function S(C,x){return f(C)===!0||C.isFramebufferTexture&&C.minFilter!==wt&&C.minFilter!==Tt?Math.log2(Math.max(x.width,x.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?x.mipmaps.length:1}function E(C){let x=C.target;x.removeEventListener("dispose",E),A(x),x.isVideoTexture&&d.delete(x),x.isHTMLTexture&&h.delete(x)}function g(C){let x=C.target;x.removeEventListener("dispose",g),P(x)}function A(C){let x=n.get(C);if(x.__webglInit===void 0)return;let B=C.source,W=p.get(B);if(W){let Z=W[x.__cacheKey];Z.usedTimes--,Z.usedTimes===0&&R(C),Object.keys(W).length===0&&p.delete(B)}n.remove(C)}function R(C){let x=n.get(C);i.deleteTexture(x.__webglTexture);let B=C.source,W=p.get(B);delete W[x.__cacheKey],o.memory.textures--}function P(C){let x=n.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),n.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let W=0;W<6;W++){if(Array.isArray(x.__webglFramebuffer[W]))for(let Z=0;Z<x.__webglFramebuffer[W].length;Z++)i.deleteFramebuffer(x.__webglFramebuffer[W][Z]);else i.deleteFramebuffer(x.__webglFramebuffer[W]);x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer[W])}else{if(Array.isArray(x.__webglFramebuffer))for(let W=0;W<x.__webglFramebuffer.length;W++)i.deleteFramebuffer(x.__webglFramebuffer[W]);else i.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&i.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let W=0;W<x.__webglColorRenderbuffer.length;W++)x.__webglColorRenderbuffer[W]&&i.deleteRenderbuffer(x.__webglColorRenderbuffer[W]);x.__webglDepthRenderbuffer&&i.deleteRenderbuffer(x.__webglDepthRenderbuffer)}let B=C.textures;for(let W=0,Z=B.length;W<Z;W++){let re=n.get(B[W]);re.__webglTexture&&(i.deleteTexture(re.__webglTexture),o.memory.textures--),n.remove(B[W])}n.remove(C)}let O=0;function k(){O=0}function I(){return O}function F(C){O=C}function $(){let C=O;return C>=s.maxTextures&&Le("WebGLTextures: Trying to use "+(C+1)+" texture units while this GPU supports only "+s.maxTextures),O+=1,C}function X(C){let x=[];return x.push(C.wrapS),x.push(C.wrapT),x.push(C.wrapR||0),x.push(C.magFilter),x.push(C.minFilter),x.push(C.anisotropy),x.push(C.internalFormat),x.push(C.format),x.push(C.type),x.push(C.generateMipmaps),x.push(C.premultiplyAlpha),x.push(C.flipY),x.push(C.unpackAlignment),x.push(C.colorSpace),x.join()}function ne(C,x){let B=n.get(C);if(C.isVideoTexture&&L(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&B.__version!==C.version){let W=C.image;if(W===null)Le("WebGLRenderer: Texture marked for update but no image data found.");else if(W.complete===!1)Le("WebGLRenderer: Texture marked for update but image is incomplete");else{oe(B,C,x);return}}else C.isExternalTexture&&(B.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,B.__webglTexture,i.TEXTURE0+x)}function q(C,x){let B=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&B.__version!==C.version){oe(B,C,x);return}else C.isExternalTexture&&(B.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,B.__webglTexture,i.TEXTURE0+x)}function K(C,x){let B=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&B.__version!==C.version){oe(B,C,x);return}t.bindTexture(i.TEXTURE_3D,B.__webglTexture,i.TEXTURE0+x)}function ee(C,x){let B=n.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&B.__version!==C.version){Te(B,C,x);return}t.bindTexture(i.TEXTURE_CUBE_MAP,B.__webglTexture,i.TEXTURE0+x)}let be={[ys]:i.REPEAT,[ln]:i.CLAMP_TO_EDGE,[vs]:i.MIRRORED_REPEAT},Se={[wt]:i.NEAREST,[sa]:i.NEAREST_MIPMAP_NEAREST,[ki]:i.NEAREST_MIPMAP_LINEAR,[Tt]:i.LINEAR,[Bs]:i.LINEAR_MIPMAP_NEAREST,[Nn]:i.LINEAR_MIPMAP_LINEAR},tt={[qu]:i.NEVER,[ju]:i.ALWAYS,[$u]:i.LESS,[Va]:i.LEQUAL,[Zu]:i.EQUAL,[Ha]:i.GEQUAL,[Ku]:i.GREATER,[Ju]:i.NOTEQUAL};function He(C,x){if(x.type===cn&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===Tt||x.magFilter===Bs||x.magFilter===ki||x.magFilter===Nn||x.minFilter===Tt||x.minFilter===Bs||x.minFilter===ki||x.minFilter===Nn)&&Le("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(C,i.TEXTURE_WRAP_S,be[x.wrapS]),i.texParameteri(C,i.TEXTURE_WRAP_T,be[x.wrapT]),(C===i.TEXTURE_3D||C===i.TEXTURE_2D_ARRAY)&&i.texParameteri(C,i.TEXTURE_WRAP_R,be[x.wrapR]),i.texParameteri(C,i.TEXTURE_MAG_FILTER,Se[x.magFilter]),i.texParameteri(C,i.TEXTURE_MIN_FILTER,Se[x.minFilter]),x.compareFunction&&(i.texParameteri(C,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(C,i.TEXTURE_COMPARE_FUNC,tt[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===wt||x.minFilter!==ki&&x.minFilter!==Nn||x.type===cn&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||n.get(x).__currentAnisotropy){let B=e.get("EXT_texture_filter_anisotropic");i.texParameterf(C,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,s.getMaxAnisotropy())),n.get(x).__currentAnisotropy=x.anisotropy}}}function te(C,x){let B=!1;C.__webglInit===void 0&&(C.__webglInit=!0,x.addEventListener("dispose",E));let W=x.source,Z=p.get(W);Z===void 0&&(Z={},p.set(W,Z));let re=X(x);if(re!==C.__cacheKey){Z[re]===void 0&&(Z[re]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,B=!0),Z[re].usedTimes++;let ae=Z[C.__cacheKey];ae!==void 0&&(Z[C.__cacheKey].usedTimes--,ae.usedTimes===0&&R(x)),C.__cacheKey=re,C.__webglTexture=Z[re].texture}return B}function H(C,x,B){return Math.floor(Math.floor(C/B)/x)}function G(C,x,B,W){let re=C.updateRanges;if(re.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,x.width,x.height,B,W,x.data);else{re.sort((Ce,fe)=>Ce.start-fe.start);let ae=0;for(let Ce=1;Ce<re.length;Ce++){let fe=re[ae],ce=re[Ce],Re=fe.start+fe.count,De=H(ce.start,x.width,4),Ve=H(fe.start,x.width,4);ce.start<=Re+1&&De===Ve&&H(ce.start+ce.count-1,x.width,4)===De?fe.count=Math.max(fe.count,ce.start+ce.count-fe.start):(++ae,re[ae]=ce)}re.length=ae+1;let J=t.getParameter(i.UNPACK_ROW_LENGTH),Q=t.getParameter(i.UNPACK_SKIP_PIXELS),le=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,x.width);for(let Ce=0,fe=re.length;Ce<fe;Ce++){let ce=re[Ce],Re=Math.floor(ce.start/4),De=Math.ceil(ce.count/4),Ve=Re%x.width,D=Math.floor(Re/x.width),he=De,j=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,Ve),t.pixelStorei(i.UNPACK_SKIP_ROWS,D),t.texSubImage2D(i.TEXTURE_2D,0,Ve,D,he,j,B,W,x.data)}C.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,J),t.pixelStorei(i.UNPACK_SKIP_PIXELS,Q),t.pixelStorei(i.UNPACK_SKIP_ROWS,le)}}function oe(C,x,B){let W=i.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(W=i.TEXTURE_2D_ARRAY),x.isData3DTexture&&(W=i.TEXTURE_3D);let Z=te(C,x),re=x.source;t.bindTexture(W,C.__webglTexture,i.TEXTURE0+B);let ae=n.get(re);if(re.version!==ae.__version||Z===!0){if(t.activeTexture(i.TEXTURE0+B),(typeof ImageBitmap<"u"&&x.image instanceof ImageBitmap)===!1){let j=je.getPrimaries(je.workingColorSpace),ue=x.colorSpace===Sn?null:je.getPrimaries(x.colorSpace),xe=x.colorSpace===Sn||j===ue?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,xe)}t.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment);let Q=m(x.image,!1,s.maxTextureSize);Q=pt(x,Q);let le=r.convert(x.format,x.colorSpace),Ce=r.convert(x.type),fe=y(x.internalFormat,le,Ce,x.normalized,x.colorSpace,x.isVideoTexture);He(W,x);let ce,Re=x.mipmaps,De=x.isVideoTexture!==!0,Ve=ae.__version===void 0||Z===!0,D=re.dataReady,he=S(x,Q);if(x.isDepthTexture)fe=w(x.format===gi,x.type),Ve&&(De?t.texStorage2D(i.TEXTURE_2D,1,fe,Q.width,Q.height):t.texImage2D(i.TEXTURE_2D,0,fe,Q.width,Q.height,0,le,Ce,null));else if(x.isDataTexture)if(Re.length>0){De&&Ve&&t.texStorage2D(i.TEXTURE_2D,he,fe,Re[0].width,Re[0].height);for(let j=0,ue=Re.length;j<ue;j++)ce=Re[j],De?D&&t.texSubImage2D(i.TEXTURE_2D,j,0,0,ce.width,ce.height,le,Ce,ce.data):t.texImage2D(i.TEXTURE_2D,j,fe,ce.width,ce.height,0,le,Ce,ce.data);x.generateMipmaps=!1}else De?(Ve&&t.texStorage2D(i.TEXTURE_2D,he,fe,Q.width,Q.height),D&&G(x,Q,le,Ce)):t.texImage2D(i.TEXTURE_2D,0,fe,Q.width,Q.height,0,le,Ce,Q.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){De&&Ve&&t.texStorage3D(i.TEXTURE_2D_ARRAY,he,fe,Re[0].width,Re[0].height,Q.depth);for(let j=0,ue=Re.length;j<ue;j++)if(ce=Re[j],x.format!==qt)if(le!==null)if(De){if(D)if(x.layerUpdates.size>0){let xe=bc(ce.width,ce.height,x.format,x.type);for(let ie of x.layerUpdates){let Pe=ce.data.subarray(ie*xe/ce.data.BYTES_PER_ELEMENT,(ie+1)*xe/ce.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,j,0,0,ie,ce.width,ce.height,1,le,Pe)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,j,0,0,0,ce.width,ce.height,Q.depth,le,ce.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,j,fe,ce.width,ce.height,Q.depth,0,ce.data,0,0);else Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else De?D&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,j,0,0,0,ce.width,ce.height,Q.depth,le,Ce,ce.data):t.texImage3D(i.TEXTURE_2D_ARRAY,j,fe,ce.width,ce.height,Q.depth,0,le,Ce,ce.data);x.layerUpdates.size>0&&x.clearLayerUpdates()}else{De&&Ve&&t.texStorage2D(i.TEXTURE_2D,he,fe,Re[0].width,Re[0].height);for(let j=0,ue=Re.length;j<ue;j++)ce=Re[j],x.format!==qt?le!==null?De?D&&t.compressedTexSubImage2D(i.TEXTURE_2D,j,0,0,ce.width,ce.height,le,ce.data):t.compressedTexImage2D(i.TEXTURE_2D,j,fe,ce.width,ce.height,0,ce.data):Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):De?D&&t.texSubImage2D(i.TEXTURE_2D,j,0,0,ce.width,ce.height,le,Ce,ce.data):t.texImage2D(i.TEXTURE_2D,j,fe,ce.width,ce.height,0,le,Ce,ce.data)}else if(x.isDataArrayTexture)if(De){if(Ve&&t.texStorage3D(i.TEXTURE_2D_ARRAY,he,fe,Q.width,Q.height,Q.depth),D)if(x.layerUpdates.size>0){let j=bc(Q.width,Q.height,x.format,x.type);for(let ue of x.layerUpdates){let xe=Q.data.subarray(ue*j/Q.data.BYTES_PER_ELEMENT,(ue+1)*j/Q.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,ue,Q.width,Q.height,1,le,Ce,xe)}x.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,le,Ce,Q.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,fe,Q.width,Q.height,Q.depth,0,le,Ce,Q.data);else if(x.isData3DTexture)De?(Ve&&t.texStorage3D(i.TEXTURE_3D,he,fe,Q.width,Q.height,Q.depth),D&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,le,Ce,Q.data)):t.texImage3D(i.TEXTURE_3D,0,fe,Q.width,Q.height,Q.depth,0,le,Ce,Q.data);else if(x.isFramebufferTexture){if(Ve)if(De)t.texStorage2D(i.TEXTURE_2D,he,fe,Q.width,Q.height);else{let j=Q.width,ue=Q.height;for(let xe=0;xe<he;xe++)t.texImage2D(i.TEXTURE_2D,xe,fe,j,ue,0,le,Ce,null),j>>=1,ue>>=1}}else if(x.isHTMLTexture){if("texElementImage2D"in i){let j=i.canvas;if(j.hasAttribute("layoutsubtree")||j.setAttribute("layoutsubtree","true"),Q.parentNode!==j){j.appendChild(Q),h.add(x),j.onpaint=ue=>{let xe=ue.changedElements;for(let ie of h)xe.includes(ie.image)&&(ie.needsUpdate=!0)},j.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,Q);else{let xe=i.RGBA,ie=i.RGBA,Pe=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,xe,ie,Pe,Q)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Re.length>0){if(De&&Ve){let j=Qe(Re[0]);t.texStorage2D(i.TEXTURE_2D,he,fe,j.width,j.height)}for(let j=0,ue=Re.length;j<ue;j++)ce=Re[j],De?D&&t.texSubImage2D(i.TEXTURE_2D,j,0,0,le,Ce,ce):t.texImage2D(i.TEXTURE_2D,j,fe,le,Ce,ce);x.generateMipmaps=!1}else if(De){if(Ve){let j=Qe(Q);t.texStorage2D(i.TEXTURE_2D,he,fe,j.width,j.height)}D&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,le,Ce,Q)}else t.texImage2D(i.TEXTURE_2D,0,fe,le,Ce,Q);f(x)&&b(W),ae.__version=re.version,x.onUpdate&&x.onUpdate(x)}C.__version=x.version}function Te(C,x,B){if(x.image.length!==6)return;let W=te(C,x),Z=x.source;t.bindTexture(i.TEXTURE_CUBE_MAP,C.__webglTexture,i.TEXTURE0+B);let re=n.get(Z);if(Z.version!==re.__version||W===!0){t.activeTexture(i.TEXTURE0+B);let ae=je.getPrimaries(je.workingColorSpace),J=x.colorSpace===Sn?null:je.getPrimaries(x.colorSpace),Q=x.colorSpace===Sn||ae===J?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Q);let le=x.isCompressedTexture||x.image[0].isCompressedTexture,Ce=x.image[0]&&x.image[0].isDataTexture,fe=[];for(let ie=0;ie<6;ie++)!le&&!Ce?fe[ie]=m(x.image[ie],!0,s.maxCubemapSize):fe[ie]=Ce?x.image[ie].image:x.image[ie],fe[ie]=pt(x,fe[ie]);let ce=fe[0],Re=r.convert(x.format,x.colorSpace),De=r.convert(x.type),Ve=y(x.internalFormat,Re,De,x.normalized,x.colorSpace),D=x.isVideoTexture!==!0,he=re.__version===void 0||W===!0,j=Z.dataReady,ue=S(x,ce);He(i.TEXTURE_CUBE_MAP,x);let xe;if(le){D&&he&&t.texStorage2D(i.TEXTURE_CUBE_MAP,ue,Ve,ce.width,ce.height);for(let ie=0;ie<6;ie++){xe=fe[ie].mipmaps;for(let Pe=0;Pe<xe.length;Pe++){let Ae=xe[Pe];x.format!==qt?Re!==null?D?j&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Pe,0,0,Ae.width,Ae.height,Re,Ae.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Pe,Ve,Ae.width,Ae.height,0,Ae.data):Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):D?j&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Pe,0,0,Ae.width,Ae.height,Re,De,Ae.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Pe,Ve,Ae.width,Ae.height,0,Re,De,Ae.data)}}}else{if(xe=x.mipmaps,D&&he){xe.length>0&&ue++;let ie=Qe(fe[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,ue,Ve,ie.width,ie.height)}for(let ie=0;ie<6;ie++)if(Ce){D?j&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,fe[ie].width,fe[ie].height,Re,De,fe[ie].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,Ve,fe[ie].width,fe[ie].height,0,Re,De,fe[ie].data);for(let Pe=0;Pe<xe.length;Pe++){let dt=xe[Pe].image[ie].image;D?j&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Pe+1,0,0,dt.width,dt.height,Re,De,dt.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Pe+1,Ve,dt.width,dt.height,0,Re,De,dt.data)}}else{D?j&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,Re,De,fe[ie]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,Ve,Re,De,fe[ie]);for(let Pe=0;Pe<xe.length;Pe++){let Ae=xe[Pe];D?j&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Pe+1,0,0,Re,De,Ae.image[ie]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Pe+1,Ve,Re,De,Ae.image[ie])}}}f(x)&&b(i.TEXTURE_CUBE_MAP),re.__version=Z.version,x.onUpdate&&x.onUpdate(x)}C.__version=x.version}function de(C,x,B,W,Z,re){let ae=r.convert(B.format,B.colorSpace),J=r.convert(B.type),Q=y(B.internalFormat,ae,J,B.normalized,B.colorSpace),le=n.get(x),Ce=n.get(B);if(Ce.__renderTarget=x,!le.__hasExternalTextures){let fe=Math.max(1,x.width>>re),ce=Math.max(1,x.height>>re);Z===i.TEXTURE_3D||Z===i.TEXTURE_2D_ARRAY?t.texImage3D(Z,re,Q,fe,ce,x.depth,0,ae,J,null):t.texImage2D(Z,re,Q,fe,ce,0,ae,J,null)}t.bindFramebuffer(i.FRAMEBUFFER,C),it(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,W,Z,Ce.__webglTexture,0,qe(x)):(Z===i.TEXTURE_2D||Z>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&Z<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,W,Z,Ce.__webglTexture,re),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ne(C,x,B){if(i.bindRenderbuffer(i.RENDERBUFFER,C),x.depthBuffer){let W=x.depthTexture,Z=W&&W.isDepthTexture?W.type:null,re=w(x.stencilBuffer,Z),ae=x.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;it(x)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,qe(x),re,x.width,x.height):B?i.renderbufferStorageMultisample(i.RENDERBUFFER,qe(x),re,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,re,x.width,x.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ae,i.RENDERBUFFER,C)}else{let W=x.textures;for(let Z=0;Z<W.length;Z++){let re=W[Z],ae=r.convert(re.format,re.colorSpace),J=r.convert(re.type),Q=y(re.internalFormat,ae,J,re.normalized,re.colorSpace);it(x)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,qe(x),Q,x.width,x.height):B?i.renderbufferStorageMultisample(i.RENDERBUFFER,qe(x),Q,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,Q,x.width,x.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Ze(C,x,B){let W=x.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,C),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let Z=n.get(x.depthTexture);if(Z.__renderTarget=x,(!Z.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),W){if(Z.__webglInit===void 0&&(Z.__webglInit=!0,x.depthTexture.addEventListener("dispose",E)),Z.__webglTexture===void 0){Z.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,Z.__webglTexture),He(i.TEXTURE_CUBE_MAP,x.depthTexture);let le=r.convert(x.depthTexture.format),Ce=r.convert(x.depthTexture.type),fe;x.depthTexture.format===Rn?fe=i.DEPTH_COMPONENT24:x.depthTexture.format===gi&&(fe=i.DEPTH24_STENCIL8);for(let ce=0;ce<6;ce++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0,fe,x.width,x.height,0,le,Ce,null)}}else ne(x.depthTexture,0);let re=Z.__webglTexture,ae=qe(x),J=W?i.TEXTURE_CUBE_MAP_POSITIVE_X+B:i.TEXTURE_2D,Q=x.depthTexture.format===gi?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(x.depthTexture.format===Rn)it(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Q,J,re,0,ae):i.framebufferTexture2D(i.FRAMEBUFFER,Q,J,re,0);else if(x.depthTexture.format===gi)it(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Q,J,re,0,ae):i.framebufferTexture2D(i.FRAMEBUFFER,Q,J,re,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function se(C){let x=n.get(C),B=C.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==C.depthTexture){let W=C.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),W){let Z=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,W.removeEventListener("dispose",Z)};W.addEventListener("dispose",Z),x.__depthDisposeCallback=Z}x.__boundDepthTexture=W}if(C.depthTexture&&!x.__autoAllocateDepthBuffer)if(B)for(let W=0;W<6;W++)Ze(x.__webglFramebuffer[W],C,W);else{let W=C.texture.mipmaps;W&&W.length>0?Ze(x.__webglFramebuffer[0],C,0):Ze(x.__webglFramebuffer,C,0)}else if(B){x.__webglDepthbuffer=[];for(let W=0;W<6;W++)if(t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[W]),x.__webglDepthbuffer[W]===void 0)x.__webglDepthbuffer[W]=i.createRenderbuffer(),Ne(x.__webglDepthbuffer[W],C,!1);else{let Z=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,re=x.__webglDepthbuffer[W];i.bindRenderbuffer(i.RENDERBUFFER,re),i.framebufferRenderbuffer(i.FRAMEBUFFER,Z,i.RENDERBUFFER,re)}}else{let W=C.texture.mipmaps;if(W&&W.length>0?t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=i.createRenderbuffer(),Ne(x.__webglDepthbuffer,C,!1);else{let Z=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,re=x.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,re),i.framebufferRenderbuffer(i.FRAMEBUFFER,Z,i.RENDERBUFFER,re)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ue(C,x,B){let W=n.get(C);x!==void 0&&de(W.__webglFramebuffer,C,C.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),B!==void 0&&se(C)}function Ye(C){let x=C.texture,B=n.get(C),W=n.get(x);C.addEventListener("dispose",g);let Z=C.textures,re=C.isWebGLCubeRenderTarget===!0,ae=Z.length>1;if(ae||(W.__webglTexture===void 0&&(W.__webglTexture=i.createTexture()),W.__version=x.version,o.memory.textures++),re){B.__webglFramebuffer=[];for(let J=0;J<6;J++)if(x.mipmaps&&x.mipmaps.length>0){B.__webglFramebuffer[J]=[];for(let Q=0;Q<x.mipmaps.length;Q++)B.__webglFramebuffer[J][Q]=i.createFramebuffer()}else B.__webglFramebuffer[J]=i.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){B.__webglFramebuffer=[];for(let J=0;J<x.mipmaps.length;J++)B.__webglFramebuffer[J]=i.createFramebuffer()}else B.__webglFramebuffer=i.createFramebuffer();if(ae)for(let J=0,Q=Z.length;J<Q;J++){let le=n.get(Z[J]);le.__webglTexture===void 0&&(le.__webglTexture=i.createTexture(),o.memory.textures++)}if(C.samples>0&&it(C)===!1){B.__webglMultisampledFramebuffer=i.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let J=0;J<Z.length;J++){let Q=Z[J];B.__webglColorRenderbuffer[J]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,B.__webglColorRenderbuffer[J]);let le=r.convert(Q.format,Q.colorSpace),Ce=r.convert(Q.type),fe=y(Q.internalFormat,le,Ce,Q.normalized,Q.colorSpace,C.isXRRenderTarget===!0),ce=qe(C);i.renderbufferStorageMultisample(i.RENDERBUFFER,ce,fe,C.width,C.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+J,i.RENDERBUFFER,B.__webglColorRenderbuffer[J])}i.bindRenderbuffer(i.RENDERBUFFER,null),C.depthBuffer&&(B.__webglDepthRenderbuffer=i.createRenderbuffer(),Ne(B.__webglDepthRenderbuffer,C,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(re){t.bindTexture(i.TEXTURE_CUBE_MAP,W.__webglTexture),He(i.TEXTURE_CUBE_MAP,x);for(let J=0;J<6;J++)if(x.mipmaps&&x.mipmaps.length>0)for(let Q=0;Q<x.mipmaps.length;Q++)de(B.__webglFramebuffer[J][Q],C,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+J,Q);else de(B.__webglFramebuffer[J],C,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0);f(x)&&b(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ae){for(let J=0,Q=Z.length;J<Q;J++){let le=Z[J],Ce=n.get(le),fe=i.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(fe=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(fe,Ce.__webglTexture),He(fe,le),de(B.__webglFramebuffer,C,le,i.COLOR_ATTACHMENT0+J,fe,0),f(le)&&b(fe)}t.unbindTexture()}else{let J=i.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(J=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(J,W.__webglTexture),He(J,x),x.mipmaps&&x.mipmaps.length>0)for(let Q=0;Q<x.mipmaps.length;Q++)de(B.__webglFramebuffer[Q],C,x,i.COLOR_ATTACHMENT0,J,Q);else de(B.__webglFramebuffer,C,x,i.COLOR_ATTACHMENT0,J,0);f(x)&&b(J),t.unbindTexture()}C.depthBuffer&&se(C)}function Ie(C){let x=C.textures;for(let B=0,W=x.length;B<W;B++){let Z=x[B];if(f(Z)){let re=T(C),ae=n.get(Z).__webglTexture;t.bindTexture(re,ae),b(re),t.unbindTexture()}}}let nt=[],_t=[];function Dt(C){if(C.samples>0){if(it(C)===!1){let x=C.textures,B=C.width,W=C.height,Z=i.COLOR_BUFFER_BIT,re=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ae=n.get(C),J=x.length>1;if(J)for(let le=0;le<x.length;le++)t.bindFramebuffer(i.FRAMEBUFFER,ae.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+le,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ae.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+le,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ae.__webglMultisampledFramebuffer);let Q=C.texture.mipmaps;Q&&Q.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ae.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ae.__webglFramebuffer);for(let le=0;le<x.length;le++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(Z|=i.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(Z|=i.STENCIL_BUFFER_BIT)),J){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ae.__webglColorRenderbuffer[le]);let Ce=n.get(x[le]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Ce,0)}i.blitFramebuffer(0,0,B,W,0,0,B,W,Z,i.NEAREST),l===!0&&(nt.length=0,_t.length=0,nt.push(i.COLOR_ATTACHMENT0+le),C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&(nt.push(re),_t.push(re),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,_t)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,nt))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),J)for(let le=0;le<x.length;le++){t.bindFramebuffer(i.FRAMEBUFFER,ae.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+le,i.RENDERBUFFER,ae.__webglColorRenderbuffer[le]);let Ce=n.get(x[le]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ae.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+le,i.TEXTURE_2D,Ce,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ae.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&l){let x=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[x])}}}function qe(C){return Math.min(s.maxSamples,C.samples)}function it(C){let x=n.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function L(C){let x=o.render.frame;d.get(C)!==x&&(d.set(C,x),C.update())}function pt(C,x){let B=C.colorSpace,W=C.format,Z=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||B!==ur&&B!==Sn&&(je.getTransfer(B)===at?(W!==qt||Z!==Kt)&&Le("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Fe("WebGLTextures: Unsupported texture color space:",B)),x}function Qe(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=$,this.resetTextureUnits=k,this.getTextureUnits=I,this.setTextureUnits=F,this.setTexture2D=ne,this.setTexture2DArray=q,this.setTexture3D=K,this.setTextureCube=ee,this.rebindTextures=Ue,this.setupRenderTarget=Ye,this.updateRenderTargetMipmap=Ie,this.updateMultisampleRenderTarget=Dt,this.setupDepthRenderbuffer=se,this.setupFrameBufferTexture=de,this.useMultisampledRTT=it,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function Kx(i,e){function t(n,s=Sn){let r,o=je.getTransfer(s);if(n===Kt)return i.UNSIGNED_BYTE;if(n===oa)return i.UNSIGNED_SHORT_4_4_4_4;if(n===aa)return i.UNSIGNED_SHORT_5_5_5_1;if(n===hc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===uc)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===lc)return i.BYTE;if(n===cc)return i.SHORT;if(n===ks)return i.UNSIGNED_SHORT;if(n===ra)return i.INT;if(n===vn)return i.UNSIGNED_INT;if(n===cn)return i.FLOAT;if(n===bn)return i.HALF_FLOAT;if(n===dc)return i.ALPHA;if(n===fc)return i.RGB;if(n===qt)return i.RGBA;if(n===Rn)return i.DEPTH_COMPONENT;if(n===gi)return i.DEPTH_STENCIL;if(n===pc)return i.RED;if(n===la)return i.RED_INTEGER;if(n===_i)return i.RG;if(n===ca)return i.RG_INTEGER;if(n===ha)return i.RGBA_INTEGER;if(n===Pr||n===Lr||n===Nr||n===Dr)if(o===at)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Pr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Lr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Nr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Dr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Pr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Lr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Nr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Dr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===ua||n===da||n===fa||n===pa)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===ua)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===da)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===fa)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===pa)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===ma||n===ga||n===_a||n===xa||n===ya||n===Ur||n===va)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===ma||n===ga)return o===at?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===_a)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===xa)return r.COMPRESSED_R11_EAC;if(n===ya)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Ur)return r.COMPRESSED_RG11_EAC;if(n===va)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===ba||n===Sa||n===Ma||n===wa||n===Ta||n===Aa||n===Ea||n===Ca||n===Ra||n===Ia||n===Pa||n===La||n===Na||n===Da)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===ba)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Sa)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Ma)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===wa)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Ta)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Aa)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ea)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ca)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ra)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Ia)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Pa)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===La)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Na)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Da)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Ua||n===Oa||n===Fa)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Ua)return o===at?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Oa)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Fa)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Ba||n===ka||n===Or||n===za)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Ba)return r.COMPRESSED_RED_RGTC1_EXT;if(n===ka)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Or)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===za)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===zs?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var Jx=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,jx=`
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

}`,Uc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new vr(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new tn({vertexShader:Jx,fragmentShader:jx,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Xt(new Sr(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Oc=class extends _n{constructor(e,t){super();let n=this,s=null,r=1,o=null,a="local-floor",l=1,c=null,d=null,h=null,u=null,p=null,_=null,v=typeof XRWebGLBinding<"u",m=new Uc,f={},b=t.getContextAttributes(),T=null,y=null,w=[],S=[],E=new Oe,g=null,A=null,R=new zt;R.viewport=new lt;let P=new zt;P.viewport=new lt;let O=[R,P],k=new ea,I=null,F=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(H){let G=w[H];return G===void 0&&(G=new Es,w[H]=G),G.getTargetRaySpace()},this.getControllerGrip=function(H){let G=w[H];return G===void 0&&(G=new Es,w[H]=G),G.getGripSpace()},this.getHand=function(H){let G=w[H];return G===void 0&&(G=new Es,w[H]=G),G.getHandSpace()};function $(H){let G=S.indexOf(H.inputSource);if(G===-1)return;let oe=w[G];oe!==void 0&&(oe.update(H.inputSource,H.frame,c||o),oe.dispatchEvent({type:H.type,data:H.inputSource}))}function X(){s.removeEventListener("select",$),s.removeEventListener("selectstart",$),s.removeEventListener("selectend",$),s.removeEventListener("squeeze",$),s.removeEventListener("squeezestart",$),s.removeEventListener("squeezeend",$),s.removeEventListener("end",X),s.removeEventListener("inputsourceschange",ne);for(let H=0;H<w.length;H++){let G=S[H];G!==null&&(S[H]=null,w[H].disconnect(G))}I=null,F=null,m.reset();for(let H in f)delete f[H];if(e.setRenderTarget(T),p=null,u=null,h=null,s=null,y=null,te.stop(),n.isPresenting=!1,e.setPixelRatio(g),e.setSize(E.width,E.height,!1),A!==null){let H=A.camera;H.fov=A.fov,H.zoom=A.zoom,H.updateProjectionMatrix(),A=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(H){r=H,n.isPresenting===!0&&Le("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(H){a=H,n.isPresenting===!0&&Le("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(H){c=H},this.getBaseLayer=function(){return u!==null?u:p},this.getBinding=function(){return h===null&&v&&(h=new XRWebGLBinding(s,t)),h},this.getFrame=function(){return _},this.getSession=function(){return s},this.setSession=async function(H){if(s=H,s!==null){if(T=e.getRenderTarget(),s.addEventListener("select",$),s.addEventListener("selectstart",$),s.addEventListener("selectend",$),s.addEventListener("squeeze",$),s.addEventListener("squeezestart",$),s.addEventListener("squeezeend",$),s.addEventListener("end",X),s.addEventListener("inputsourceschange",ne),b.xrCompatible!==!0&&await t.makeXRCompatible(),g=e.getPixelRatio(),e.getSize(E),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let oe=null,Te=null,de=null;b.depth&&(de=b.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,oe=b.stencil?gi:Rn,Te=b.stencil?zs:vn);let Ne={colorFormat:t.RGBA8,depthFormat:de,scaleFactor:r};h=this.getBinding(),u=h.createProjectionLayer(Ne),s.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),y=new Zt(u.textureWidth,u.textureHeight,{format:qt,type:Kt,depthTexture:new ci(u.textureWidth,u.textureHeight,Te,void 0,void 0,void 0,void 0,void 0,void 0,oe),stencilBuffer:b.stencil,colorSpace:e.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{let oe={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,t,oe),s.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),y=new Zt(p.framebufferWidth,p.framebufferHeight,{format:qt,type:Kt,colorSpace:e.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),te.setContext(s),te.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function ne(H){for(let G=0;G<H.removed.length;G++){let oe=H.removed[G],Te=S.indexOf(oe);Te>=0&&(S[Te]=null,w[Te].disconnect(oe))}for(let G=0;G<H.added.length;G++){let oe=H.added[G],Te=S.indexOf(oe);if(Te===-1){for(let Ne=0;Ne<w.length;Ne++)if(Ne>=S.length){S.push(oe),Te=Ne;break}else if(S[Ne]===null){S[Ne]=oe,Te=Ne;break}if(Te===-1)break}let de=w[Te];de&&de.connect(oe)}}let q=new U,K=new U;function ee(H,G,oe){q.setFromMatrixPosition(G.matrixWorld),K.setFromMatrixPosition(oe.matrixWorld);let Te=q.distanceTo(K),de=G.projectionMatrix.elements,Ne=oe.projectionMatrix.elements,Ze=de[14]/(de[10]-1),se=de[14]/(de[10]+1),Ue=(de[9]+1)/de[5],Ye=(de[9]-1)/de[5],Ie=(de[8]-1)/de[0],nt=(Ne[8]+1)/Ne[0],_t=Ze*Ie,Dt=Ze*nt,qe=Te/(-Ie+nt),it=qe*-Ie;if(G.matrixWorld.decompose(H.position,H.quaternion,H.scale),H.translateX(it),H.translateZ(qe),H.matrixWorld.compose(H.position,H.quaternion,H.scale),H.matrixWorldInverse.copy(H.matrixWorld).invert(),de[10]===-1)H.projectionMatrix.copy(G.projectionMatrix),H.projectionMatrixInverse.copy(G.projectionMatrixInverse);else{let L=Ze+qe,pt=se+qe,Qe=_t-it,C=Dt+(Te-it),x=Ue*se/pt*L,B=Ye*se/pt*L;H.projectionMatrix.makePerspective(Qe,C,x,B,L,pt),H.projectionMatrixInverse.copy(H.projectionMatrix).invert()}}function be(H,G){G===null?H.matrixWorld.copy(H.matrix):H.matrixWorld.multiplyMatrices(G.matrixWorld,H.matrix),H.matrixWorldInverse.copy(H.matrixWorld).invert()}this.updateCamera=function(H){if(s===null)return;let G=H.near,oe=H.far;m.texture!==null&&(m.depthNear>0&&(G=m.depthNear),m.depthFar>0&&(oe=m.depthFar)),k.near=P.near=R.near=G,k.far=P.far=R.far=oe,(I!==k.near||F!==k.far)&&(s.updateRenderState({depthNear:k.near,depthFar:k.far}),I=k.near,F=k.far),k.layers.mask=H.layers.mask|6,R.layers.mask=k.layers.mask&-5,P.layers.mask=k.layers.mask&-3;let Te=H.parent,de=k.cameras;be(k,Te);for(let Ne=0;Ne<de.length;Ne++)be(de[Ne],Te);de.length===2?ee(k,R,P):k.projectionMatrix.copy(R.projectionMatrix),A===null&&H.isPerspectiveCamera&&(A={camera:H,fov:H.fov,zoom:H.zoom}),Se(H,k,Te)};function Se(H,G,oe){oe===null?H.matrix.copy(G.matrixWorld):(H.matrix.copy(oe.matrixWorld),H.matrix.invert(),H.matrix.multiply(G.matrixWorld)),H.matrix.decompose(H.position,H.quaternion,H.scale),H.updateMatrixWorld(!0),H.projectionMatrix.copy(G.projectionMatrix),H.projectionMatrixInverse.copy(G.projectionMatrixInverse),H.isPerspectiveCamera&&(H.fov=Ts*2*Math.atan(1/H.projectionMatrix.elements[5]),H.zoom=1)}this.getCamera=function(){return k},this.getFoveation=function(){if(!(u===null&&p===null))return l},this.setFoveation=function(H){l=H,u!==null&&(u.fixedFoveation=H),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=H)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(k)},this.getCameraTexture=function(H){return f[H]};let tt=null;function He(H,G){if(d=G.getViewerPose(c||o),_=G,d!==null){let oe=d.views;p!==null&&(e.setRenderTargetFramebuffer(y,p.framebuffer),e.setRenderTarget(y));let Te=!1;oe.length!==k.cameras.length&&(k.cameras.length=0,Te=!0);for(let se=0;se<oe.length;se++){let Ue=oe[se],Ye=null;if(p!==null)Ye=p.getViewport(Ue);else{let nt=h.getViewSubImage(u,Ue);Ye=nt.viewport,se===0&&(e.setRenderTargetTextures(y,nt.colorTexture,nt.depthStencilTexture),e.setRenderTarget(y))}let Ie=O[se];Ie===void 0&&(Ie=new zt,Ie.layers.enable(se),Ie.viewport=new lt,O[se]=Ie),Ie.matrix.fromArray(Ue.transform.matrix),Ie.matrix.decompose(Ie.position,Ie.quaternion,Ie.scale),Ie.projectionMatrix.fromArray(Ue.projectionMatrix),Ie.projectionMatrixInverse.copy(Ie.projectionMatrix).invert(),Ie.viewport.set(Ye.x,Ye.y,Ye.width,Ye.height),se===0&&(k.matrix.copy(Ie.matrix),k.matrix.decompose(k.position,k.quaternion,k.scale)),Te===!0&&k.cameras.push(Ie)}let de=s.enabledFeatures;if(de&&de.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&v){h=n.getBinding();let se=h.getDepthInformation(oe[0]);se&&se.isValid&&se.texture&&m.init(se,s.renderState)}if(de&&de.includes("camera-access")&&v){e.state.unbindTexture(),h=n.getBinding();for(let se=0;se<oe.length;se++){let Ue=oe[se].camera;if(Ue){let Ye=f[Ue];Ye||(Ye=new vr,f[Ue]=Ye);let Ie=h.getCameraImage(Ue);Ye.sourceTexture=Ie}}}}for(let oe=0;oe<w.length;oe++){let Te=S[oe],de=w[oe];Te!==null&&de!==void 0&&de.update(Te,G,c||o)}tt&&tt(H,G),G.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:G}),_=null}let te=new Rd;te.setAnimationLoop(He),this.setAnimationLoop=function(H){tt=H},this.dispose=function(){}}},Qx=new ke,Ud=new ze;Ud.set(-1,0,0,0,1,0,0,0,1);function ey(i,e){function t(m,f){m.matrixAutoUpdate===!0&&m.updateMatrix(),f.value.copy(m.matrix)}function n(m,f){f.color.getRGB(m.fogColor.value,xc(i)),f.isFog?(m.fogNear.value=f.near,m.fogFar.value=f.far):f.isFogExp2&&(m.fogDensity.value=f.density)}function s(m,f,b,T,y){f.isNodeMaterial?f.uniformsNeedUpdate=!1:f.isMeshBasicMaterial?r(m,f):f.isMeshLambertMaterial?(r(m,f),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)):f.isMeshToonMaterial?(r(m,f),h(m,f)):f.isMeshPhongMaterial?(r(m,f),d(m,f),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)):f.isMeshStandardMaterial?(r(m,f),u(m,f),f.isMeshPhysicalMaterial&&p(m,f,y)):f.isMeshMatcapMaterial?(r(m,f),_(m,f)):f.isMeshDepthMaterial?r(m,f):f.isMeshDistanceMaterial?(r(m,f),v(m,f)):f.isMeshNormalMaterial?r(m,f):f.isLineBasicMaterial?(o(m,f),f.isLineDashedMaterial&&a(m,f)):f.isPointsMaterial?l(m,f,b,T):f.isSpriteMaterial?c(m,f):f.isShadowMaterial?(m.color.value.copy(f.color),m.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function r(m,f){m.opacity.value=f.opacity,f.color&&m.diffuse.value.copy(f.color),f.emissive&&m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.bumpMap&&(m.bumpMap.value=f.bumpMap,t(f.bumpMap,m.bumpMapTransform),m.bumpScale.value=f.bumpScale,f.side===Yt&&(m.bumpScale.value*=-1)),f.normalMap&&(m.normalMap.value=f.normalMap,t(f.normalMap,m.normalMapTransform),m.normalScale.value.copy(f.normalScale),f.side===Yt&&m.normalScale.value.negate()),f.displacementMap&&(m.displacementMap.value=f.displacementMap,t(f.displacementMap,m.displacementMapTransform),m.displacementScale.value=f.displacementScale,m.displacementBias.value=f.displacementBias),f.emissiveMap&&(m.emissiveMap.value=f.emissiveMap,t(f.emissiveMap,m.emissiveMapTransform)),f.specularMap&&(m.specularMap.value=f.specularMap,t(f.specularMap,m.specularMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);let b=e.get(f),T=b.envMap,y=b.envMapRotation;T&&(m.envMap.value=T,m.envMapRotation.value.setFromMatrix4(Qx.makeRotationFromEuler(y)).transpose(),T.isCubeTexture&&T.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Ud),m.reflectivity.value=f.reflectivity,m.ior.value=f.ior,m.refractionRatio.value=f.refractionRatio),f.lightMap&&(m.lightMap.value=f.lightMap,m.lightMapIntensity.value=f.lightMapIntensity,t(f.lightMap,m.lightMapTransform)),f.aoMap&&(m.aoMap.value=f.aoMap,m.aoMapIntensity.value=f.aoMapIntensity,t(f.aoMap,m.aoMapTransform))}function o(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform))}function a(m,f){m.dashSize.value=f.dashSize,m.totalSize.value=f.dashSize+f.gapSize,m.scale.value=f.scale}function l(m,f,b,T){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.size.value=f.size*b,m.scale.value=T*.5,f.map&&(m.map.value=f.map,t(f.map,m.uvTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function c(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.rotation.value=f.rotation,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function d(m,f){m.specular.value.copy(f.specular),m.shininess.value=Math.max(f.shininess,1e-4)}function h(m,f){f.gradientMap&&(m.gradientMap.value=f.gradientMap)}function u(m,f){m.metalness.value=f.metalness,f.metalnessMap&&(m.metalnessMap.value=f.metalnessMap,t(f.metalnessMap,m.metalnessMapTransform)),m.roughness.value=f.roughness,f.roughnessMap&&(m.roughnessMap.value=f.roughnessMap,t(f.roughnessMap,m.roughnessMapTransform)),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)}function p(m,f,b){m.ior.value=f.ior,f.sheen>0&&(m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),m.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(m.sheenColorMap.value=f.sheenColorMap,t(f.sheenColorMap,m.sheenColorMapTransform)),f.sheenRoughnessMap&&(m.sheenRoughnessMap.value=f.sheenRoughnessMap,t(f.sheenRoughnessMap,m.sheenRoughnessMapTransform))),f.clearcoat>0&&(m.clearcoat.value=f.clearcoat,m.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(m.clearcoatMap.value=f.clearcoatMap,t(f.clearcoatMap,m.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,t(f.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(m.clearcoatNormalMap.value=f.clearcoatNormalMap,t(f.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===Yt&&m.clearcoatNormalScale.value.negate())),f.dispersion>0&&(m.dispersion.value=f.dispersion),f.retroreflectivity>0&&(m.retroreflectivity.value=f.retroreflectivity),f.iridescence>0&&(m.iridescence.value=f.iridescence,m.iridescenceIOR.value=f.iridescenceIOR,m.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(m.iridescenceMap.value=f.iridescenceMap,t(f.iridescenceMap,m.iridescenceMapTransform)),f.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=f.iridescenceThicknessMap,t(f.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),f.transmission>0&&(m.transmission.value=f.transmission,m.transmissionSamplerMap.value=b.texture,m.transmissionSamplerSize.value.set(b.width,b.height),f.transmissionMap&&(m.transmissionMap.value=f.transmissionMap,t(f.transmissionMap,m.transmissionMapTransform)),m.thickness.value=f.thickness,f.thicknessMap&&(m.thicknessMap.value=f.thicknessMap,t(f.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=f.attenuationDistance,m.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(m.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(m.anisotropyMap.value=f.anisotropyMap,t(f.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=f.specularIntensity,m.specularColor.value.copy(f.specularColor),f.specularColorMap&&(m.specularColorMap.value=f.specularColorMap,t(f.specularColorMap,m.specularColorMapTransform)),f.specularIntensityMap&&(m.specularIntensityMap.value=f.specularIntensityMap,t(f.specularIntensityMap,m.specularIntensityMapTransform))}function _(m,f){f.matcap&&(m.matcap.value=f.matcap)}function v(m,f){let b=e.get(f).light;m.referencePosition.value.setFromMatrixPosition(b.matrixWorld),m.nearDistance.value=b.shadow.camera.near,m.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function ty(i,e,t,n){let s={},r={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,w){let S=w.program;n.uniformBlockBinding(y,S)}function c(y,w){let S=s[y.id];S===void 0&&(m(y),S=d(y),s[y.id]=S,y.addEventListener("dispose",b));let E=w.program;n.updateUBOMapping(y,E);let g=e.render.frame;r[y.id]!==g&&(u(y),r[y.id]=g)}function d(y){let w=h();y.__bindingPointIndex=w;let S=i.createBuffer(),E=y.__size,g=y.usage;return i.bindBuffer(i.UNIFORM_BUFFER,S),i.bufferData(i.UNIFORM_BUFFER,E,g),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,w,S),S}function h(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return Fe("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(y){let w=s[y.id],S=y.uniforms,E=y.__cache;i.bindBuffer(i.UNIFORM_BUFFER,w);for(let g=0,A=S.length;g<A;g++){let R=S[g];if(Array.isArray(R))for(let P=0,O=R.length;P<O;P++)p(R[P],g,P,E);else p(R,g,0,E)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(y,w,S,E){if(v(y,w,S,E)===!0){let g=y.__offset,A=y.value;if(Array.isArray(A)){let R=0;for(let P=0;P<A.length;P++){let O=A[P],k=f(O);_(O,y.__data,R),typeof O!="number"&&typeof O!="boolean"&&!O.isMatrix3&&!ArrayBuffer.isView(O)&&(R+=k.storage/Float32Array.BYTES_PER_ELEMENT)}}else _(A,y.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,g,y.__data)}}function _(y,w,S){typeof y=="number"||typeof y=="boolean"?w[0]=y:y.isMatrix3?(w[0]=y.elements[0],w[1]=y.elements[1],w[2]=y.elements[2],w[3]=0,w[4]=y.elements[3],w[5]=y.elements[4],w[6]=y.elements[5],w[7]=0,w[8]=y.elements[6],w[9]=y.elements[7],w[10]=y.elements[8],w[11]=0):ArrayBuffer.isView(y)?w.set(new y.constructor(y.buffer,y.byteOffset,w.length)):y.toArray(w,S)}function v(y,w,S,E){let g=y.value,A=w+"_"+S;if(E[A]===void 0)return typeof g=="number"||typeof g=="boolean"?E[A]=g:ArrayBuffer.isView(g)?E[A]=g.slice():E[A]=g.clone(),!0;{let R=E[A];if(typeof g=="number"||typeof g=="boolean"){if(R!==g)return E[A]=g,!0}else{if(ArrayBuffer.isView(g))return!0;if(R.equals(g)===!1)return R.copy(g),!0}}return!1}function m(y){let w=y.uniforms,S=0,E=16;for(let A=0,R=w.length;A<R;A++){let P=Array.isArray(w[A])?w[A]:[w[A]];for(let O=0,k=P.length;O<k;O++){let I=P[O],F=Array.isArray(I.value)?I.value:[I.value];for(let $=0,X=F.length;$<X;$++){let ne=F[$],q=f(ne),K=S%E,ee=K%q.boundary,be=K+ee;S+=ee,be!==0&&E-be<q.storage&&(S+=E-be),I.__data=new Float32Array(q.storage/Float32Array.BYTES_PER_ELEMENT),I.__offset=S,S+=q.storage}}}let g=S%E;return g>0&&(S+=E-g),y.__size=S,y.__cache={},this}function f(y){let w={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(w.boundary=4,w.storage=4):y.isVector2?(w.boundary=8,w.storage=8):y.isVector3||y.isColor?(w.boundary=16,w.storage=12):y.isVector4?(w.boundary=16,w.storage=16):y.isMatrix3?(w.boundary=48,w.storage=48):y.isMatrix4?(w.boundary=64,w.storage=64):y.isTexture?Le("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(w.boundary=16,w.storage=y.byteLength):Le("WebGLRenderer: Unsupported uniform value type.",y),w}function b(y){let w=y.target;w.removeEventListener("dispose",b);let S=o.indexOf(w.__bindingPointIndex);o.splice(S,1),i.deleteBuffer(s[w.id]),delete s[w.id],delete r[w.id]}function T(){for(let y in s)i.deleteBuffer(s[y]);o=[],s={},r={}}return{bind:l,update:c,dispose:T}}var ny=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Dn=null;function iy(){return Dn===null&&(Dn=new gr(ny,16,16,_i,bn),Dn.name="DFG_LUT",Dn.minFilter=Tt,Dn.magFilter=Tt,Dn.wrapS=ln,Dn.wrapT=ln,Dn.generateMipmaps=!1,Dn.needsUpdate=!0),Dn}var qa=class{constructor(e={}){let{canvas:t=ed(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:d="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:u=!1,outputBufferType:p=Kt}=e;this.isWebGLRenderer=!0;let _;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");_=n.getContextAttributes().alpha}else _=o;let v=p,m=new Set([ha,ca,la]),f=new Set([Kt,vn,ks,zs,oa,aa]),b=new Uint32Array(4),T=new Int32Array(4),y=new U,w=null,S=null,E=[],g=[],A=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=yn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let R=this,P=!1,O=null,k=null,I=null,F=null;this._outputColorSpace=yt;let $=0,X=0,ne=null,q=-1,K=null,ee=new lt,be=new lt,Se=null,tt=new Be(0),He=0,te=t.width,H=t.height,G=1,oe=null,Te=null,de=new lt(0,0,te,H),Ne=new lt(0,0,te,H),Ze=!1,se=new Rs,Ue=!1,Ye=!1,Ie=new ke,nt=new U,_t=new lt,Dt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},qe=!1;function it(){return ne===null?G:1}let L=n;function pt(M,N){return t.getContext(M,N)}let Qe,C,x,B,W,Z,re,ae,J,Q,le,Ce,fe,ce,Re,De,Ve,D,he,j,ue,xe,ie;try{let M={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:d,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",dt,!1),t.addEventListener("webglcontextrestored",st,!1),t.addEventListener("webglcontextcreationerror",un,!1),L===null){let N="webgl2";if(L=pt(N,M),L===null)throw pt(N)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Pe()}catch(M){throw t.removeEventListener("webglcontextlost",dt,!1),t.removeEventListener("webglcontextrestored",st,!1),t.removeEventListener("webglcontextcreationerror",un,!1),Fe("WebGLRenderer: "+M.message),M}function Pe(){Qe=new h_(L),Qe.init(),ue=new Kx(L,Qe),C=new e_(L,Qe,e,ue),x=new $x(L,Qe),C.reversedDepthBuffer&&u&&x.buffers.depth.setReversed(!0),k=L.createFramebuffer(),I=L.createFramebuffer(),F=L.createFramebuffer(),B=new f_(L),W=new Dx,Z=new Zx(L,Qe,x,W,C,ue,B),re=new c_(R),ae=new mm(L),xe=new j0(L,ae),J=new u_(L,ae,B,xe),Q=new m_(L,J,ae,xe,B),D=new p_(L,C,Z),Re=new t_(W),le=new Nx(R,re,Qe,C,xe,Re),Ce=new ey(R,W),fe=new Ox,ce=new Hx(Qe),Ve=new J0(R,re,x,Q,_,l),De=new qx(R,Q,C),ie=new ty(L,B,C,x),he=new Q0(L,Qe,B),j=new d_(L,Qe,B),B.programs=le.programs,R.capabilities=C,R.extensions=Qe,R.properties=W,R.renderLists=fe,R.shadowMap=De,R.state=x,R.info=B}v!==Kt&&(A=new __(v,t.width,t.height,a,s,r));let Ae=new Oc(R,L);this.xr=Ae,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let M=Qe.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){let M=Qe.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return G},this.setPixelRatio=function(M){M!==void 0&&(G=M,this.setSize(te,H,!1))},this.getSize=function(M){return M.set(te,H)},this.setSize=function(M,N,Y=!0){if(Ae.isPresenting){Le("WebGLRenderer: Can't change size while VR device is presenting.");return}te=M,H=N,t.width=Math.floor(M*G),t.height=Math.floor(N*G),Y===!0&&(t.style.width=M+"px",t.style.height=N+"px"),A!==null&&A.setSize(t.width,t.height),this.setViewport(0,0,M,N)},this.getDrawingBufferSize=function(M){return M.set(te*G,H*G).floor()},this.setDrawingBufferSize=function(M,N,Y){te=M,H=N,G=Y,t.width=Math.floor(M*Y),t.height=Math.floor(N*Y),this.setViewport(0,0,M,N)},this.setEffects=function(M){if(v===Kt){Fe("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(M){for(let N=0;N<M.length;N++)if(M[N].isOutputPass===!0){Le("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}A.setEffects(M||[])},this.getCurrentViewport=function(M){return M.copy(ee)},this.getViewport=function(M){return M.copy(de)},this.setViewport=function(M,N,Y,z){M.isVector4?de.set(M.x,M.y,M.z,M.w):de.set(M,N,Y,z),x.viewport(ee.copy(de).multiplyScalar(G).round())},this.getScissor=function(M){return M.copy(Ne)},this.setScissor=function(M,N,Y,z){M.isVector4?Ne.set(M.x,M.y,M.z,M.w):Ne.set(M,N,Y,z),x.scissor(be.copy(Ne).multiplyScalar(G).round())},this.getScissorTest=function(){return Ze},this.setScissorTest=function(M){x.setScissorTest(Ze=M)},this.setOpaqueSort=function(M){oe=M},this.setTransparentSort=function(M){Te=M},this.getClearColor=function(M){return M.copy(Ve.getClearColor())},this.setClearColor=function(){Ve.setClearColor(...arguments)},this.getClearAlpha=function(){return Ve.getClearAlpha()},this.setClearAlpha=function(){Ve.setClearAlpha(...arguments)},this.clear=function(M=!0,N=!0,Y=!0){let z=0;if(M){let V=!1;if(ne!==null){let _e=ne.texture.format;V=m.has(_e)}if(V){let _e=ne.texture.type,ve=f.has(_e),ge=Ve.getClearColor(),Me=Ve.getClearAlpha(),Ee=ge.r,We=ge.g,Ke=ge.b;ve?(b[0]=Ee,b[1]=We,b[2]=Ke,b[3]=Me,L.clearBufferuiv(L.COLOR,0,b)):(T[0]=Ee,T[1]=We,T[2]=Ke,T[3]=Me,L.clearBufferiv(L.COLOR,0,T))}else z|=L.COLOR_BUFFER_BIT}N&&(z|=L.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Y&&(z|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),z!==0&&L.clear(z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(M){M.setRenderer(this),O=M},this.dispose=function(){t.removeEventListener("webglcontextlost",dt,!1),t.removeEventListener("webglcontextrestored",st,!1),t.removeEventListener("webglcontextcreationerror",un,!1),Ve.dispose(),fe.dispose(),ce.dispose(),W.dispose(),re.dispose(),Q.dispose(),xe.dispose(),ie.dispose(),le.dispose(),Ae.dispose(),Ae.removeEventListener("sessionstart",Fh),Ae.removeEventListener("sessionend",Bh),Ai.stop()};function dt(M){M.preventDefault(),gc("WebGLRenderer: Context Lost."),P=!0}function st(){gc("WebGLRenderer: Context Restored."),P=!1;let M=B.autoReset,N=De.enabled,Y=De.autoUpdate,z=De.needsUpdate,V=De.type;Pe(),B.autoReset=M,De.enabled=N,De.autoUpdate=Y,De.needsUpdate=z,De.type=V}function un(M){Fe("WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function An(M){let N=M.target;N.removeEventListener("dispose",An),hp(N)}function hp(M){up(M),W.remove(M)}function up(M){let N=W.get(M).programs;N!==void 0&&(N.forEach(function(Y){le.releaseProgram(Y)}),M.isShaderMaterial&&le.releaseShaderCache(M))}this.renderBufferDirect=function(M,N,Y,z,V,_e){N===null&&(N=Dt);let ve=V.isMesh&&V.matrixWorld.determinantAffine()<0,ge=pp(M,N,Y,z,V);x.setMaterial(z,ve);let Me=Y.index,Ee=1;if(z.wireframe===!0){if(Me=J.getWireframeAttribute(Y),Me===void 0)return;Ee=2}let We=Y.drawRange,Ke=Y.attributes.position,we=We.start*Ee,rt=(We.start+We.count)*Ee;_e!==null&&(we=Math.max(we,_e.start*Ee),rt=Math.min(rt,(_e.start+_e.count)*Ee)),Me!==null?(we=Math.max(we,0),rt=Math.min(rt,Me.count)):Ke!=null&&(we=Math.max(we,0),rt=Math.min(rt,Ke.count));let St=rt-we;if(St<0||St===1/0)return;xe.setup(V,z,ge,Y,Me);let mt,ut=he;if(Me!==null&&(mt=ae.get(Me),ut=j,ut.setIndex(mt)),V.isMesh)z.wireframe===!0?(x.setLineWidth(z.wireframeLinewidth*it()),ut.setMode(L.LINES)):ut.setMode(L.TRIANGLES);else if(V.isLine){let Ft=z.linewidth;Ft===void 0&&(Ft=1),x.setLineWidth(Ft*it()),V.isLineSegments?ut.setMode(L.LINES):V.isLineLoop?ut.setMode(L.LINE_LOOP):ut.setMode(L.LINE_STRIP)}else V.isPoints?ut.setMode(L.POINTS):V.isSprite&&ut.setMode(L.TRIANGLES);if(V.isBatchedMesh)if(Qe.get("WEBGL_multi_draw"))ut.renderMultiDraw(V._multiDrawStarts,V._multiDrawCounts,V._multiDrawCount);else{let Ft=V._multiDrawStarts,ye=V._multiDrawCounts,Ht=V._multiDrawCount,et=Me?ae.get(Me).bytesPerElement:1,on=W.get(z).currentProgram.getUniforms();for(let En=0;En<Ht;En++)on.setValue(L,"_gl_DrawID",En),ut.render(Ft[En]/et,ye[En])}else if(V.isInstancedMesh)ut.renderInstances(we,St,V.count);else if(Y.isInstancedBufferGeometry){let Ft=Y._maxInstanceCount!==void 0?Y._maxInstanceCount:1/0,ye=Math.min(Y.instanceCount,Ft);ut.renderInstances(we,St,ye)}else ut.render(we,St)};function Oh(M,N,Y,z){O!==null&&M.isNodeMaterial&&O.setObject(z,M),Ue===!0&&Re.setState(M,Y,!1),M.transparent===!0&&M.side===Nt&&M.forceSinglePass===!1?(M.side=Yt,M.needsUpdate=!0,so(M,N,z),M.side=Pn,M.needsUpdate=!0,so(M,N,z),M.side=Nt):so(M,N,z)}this.compile=function(M,N,Y=null){Y===null&&(Y=M),O!==null&&O.renderStart(M,N,Y),S=ce.get(Y),S.init(N),g.push(S),Y.traverseVisible(function(V){V.isLight&&V.layers.test(N.layers)&&(S.pushLight(V),V.castShadow&&S.pushShadow(V))}),M!==Y&&M.traverseVisible(function(V){V.isLight&&V.layers.test(N.layers)&&(S.pushLight(V),V.castShadow&&S.pushShadow(V))}),S.setupLights(),O!==null&&O.updateLights(S.state.lightsArray),Ye=this.localClippingEnabled,Ue=Re.init(this.clippingPlanes,Ye),Ue===!0&&Re.setGlobalState(this.clippingPlanes,N),O!==null&&De.render(S.state.shadowsArray,Y,N);let z=new Set;return M.traverse(function(V){if(!(V.isMesh||V.isPoints||V.isLine||V.isSprite))return;let _e=V.material;if(_e)if(Array.isArray(_e))for(let ve=0;ve<_e.length;ve++){let ge=_e[ve];Oh(ge,Y,N,V),z.add(ge)}else Oh(_e,Y,N,V),z.add(_e)}),S=g.pop(),O!==null&&O.renderEnd(),z},this.compileAsync=function(M,N,Y=null){let z=this.compile(M,N,Y);return new Promise(V=>{function _e(){if(z.forEach(function(ve){let Me=W.get(ve).currentProgram;(Me===void 0||Me.isReady())&&z.delete(ve)}),z.size===0){V(M);return}setTimeout(_e,10)}Qe.get("KHR_parallel_shader_compile")!==null?_e():setTimeout(_e,10)})};let ml=null;function dp(M){ml&&ml(M)}function Fh(){Ai.stop()}function Bh(){Ai.start()}let Ai=new Rd;Ai.setAnimationLoop(dp),typeof self<"u"&&Ai.setContext(self),this.setAnimationLoop=function(M){ml=M,Ae.setAnimationLoop(M),M===null?Ai.stop():Ai.start()},Ae.addEventListener("sessionstart",Fh),Ae.addEventListener("sessionend",Bh),this.render=function(M,N){if(N!==void 0&&N.isCamera!==!0){Fe("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(P===!0)return;O!==null&&O.renderStart(M,N);let Y=Ae.enabled===!0&&Ae.isPresenting===!0,z=A!==null&&(ne===null||Y)&&A.begin(R,ne);if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),Ae.enabled===!0&&Ae.isPresenting===!0&&(A===null||A.isCompositing()===!1)&&(Ae.cameraAutoUpdate===!0&&Ae.updateCamera(N),N=Ae.getCamera()),M.isScene===!0&&M.onBeforeRender(R,M,N,ne),S=ce.get(M,g.length),S.init(N),S.state.textureUnits=Z.getTextureUnits(),g.push(S),Ie.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),se.setFromProjectionMatrix(Ie,mn,N.reversedDepth),Ye=this.localClippingEnabled,Ue=Re.init(this.clippingPlanes,Ye),w=fe.get(M,E.length),w.init(),E.push(w),Ae.enabled===!0&&Ae.isPresenting===!0){let ve=R.xr.getDepthSensingMesh();ve!==null&&gl(ve,N,-1/0,R.sortObjects)}gl(M,N,0,R.sortObjects),w.finish(),O!==null&&O.updateLights(S.state.lightsArray),R.sortObjects===!0&&w.sort(oe,Te),qe=Ae.enabled===!1||Ae.isPresenting===!1||Ae.hasDepthSensing()===!1,qe&&Ve.addToRenderList(w,M),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Ue===!0&&Re.beginShadows();let V=S.state.shadowsArray;if(De.render(V,M,N),Ue===!0&&Re.endShadows(),(z&&A.hasRenderPass())===!1){let ve=w.opaque,ge=w.transmissive;if(S.setupLights(),N.isArrayCamera){let Me=N.cameras;if(ge.length>0)for(let Ee=0,We=Me.length;Ee<We;Ee++){let Ke=Me[Ee];zh(ve,ge,M,Ke)}qe&&Ve.render(M);for(let Ee=0,We=Me.length;Ee<We;Ee++){let Ke=Me[Ee];kh(w,M,Ke,Ke.viewport)}}else ge.length>0&&zh(ve,ge,M,N),qe&&Ve.render(M),kh(w,M,N)}ne!==null&&X===0&&(Z.updateMultisampleRenderTarget(ne),Z.updateRenderTargetMipmap(ne)),z&&A.end(R),M.isScene===!0&&M.onAfterRender(R,M,N),xe.resetDefaultState(),q=-1,K=null,g.pop(),g.length>0?(S=g[g.length-1],Z.setTextureUnits(S.state.textureUnits),Ue===!0&&Re.setGlobalState(R.clippingPlanes,S.state.camera)):S=null,E.pop(),E.length>0?w=E[E.length-1]:w=null,O!==null&&O.renderEnd()};function gl(M,N,Y,z){if(M.visible===!1)return;if(M.layers.test(N.layers)){if(M.isGroup)Y=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(N);else if(M.isLightProbeGrid)S.pushLightProbeGrid(M);else if(M.isLight)S.pushLight(M),M.castShadow&&S.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||M.intersectsFrustum(se)){z&&_t.setFromMatrixPosition(M.matrixWorld).applyMatrix4(Ie);let ve=Q.update(M),ge=M.material;ge.visible&&w.push(M,ve,ge,Y,_t.z,null,N)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||M.intersectsFrustum(se))){let ve=Q.update(M),ge=M.material;if(z&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),_t.copy(M.boundingSphere.center)):(ve.boundingSphere===null&&ve.computeBoundingSphere(),_t.copy(ve.boundingSphere.center)),_t.applyMatrix4(M.matrixWorld).applyMatrix4(Ie)),Array.isArray(ge)){let Me=ve.groups;for(let Ee=0,We=Me.length;Ee<We;Ee++){let Ke=Me[Ee],we=ge[Ke.materialIndex];we&&we.visible&&w.push(M,ve,we,Y,_t.z,Ke,N)}}else ge.visible&&w.push(M,ve,ge,Y,_t.z,null,N)}}let _e=M.children;for(let ve=0,ge=_e.length;ve<ge;ve++)gl(_e[ve],N,Y,z)}function kh(M,N,Y,z){let{opaque:V,transmissive:_e,transparent:ve}=M;S.setupLightsView(Y),Ue===!0&&Re.setGlobalState(R.clippingPlanes,Y),z&&x.viewport(ee.copy(z)),V.length>0&&io(V,N,Y),_e.length>0&&io(_e,N,Y),ve.length>0&&io(ve,N,Y),x.buffers.depth.setTest(!0),x.buffers.depth.setMask(!0),x.buffers.color.setMask(!0),x.setPolygonOffset(!1)}function zh(M,N,Y,z){if((Y.isScene===!0?Y.overrideMaterial:null)!==null)return;if(S.state.transmissionRenderTarget[z.id]===void 0){let we=Qe.has("EXT_color_buffer_half_float")||Qe.has("EXT_color_buffer_float");S.state.transmissionRenderTarget[z.id]=new Zt(1,1,{generateMipmaps:!0,type:we?bn:Kt,minFilter:Nn,samples:Math.max(4,C.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:je.workingColorSpace})}let _e=S.state.transmissionRenderTarget[z.id],ve=z.viewport||ee;_e.setSize(ve.z*R.transmissionResolutionScale,ve.w*R.transmissionResolutionScale);let ge=R.getRenderTarget(),Me=R.getActiveCubeFace(),Ee=R.getActiveMipmapLevel();R.setRenderTarget(_e),R.getClearColor(tt),He=R.getClearAlpha(),He<1&&R.setClearColor(16777215,.5),R.clear(),qe&&Ve.render(Y);let We=R.toneMapping;R.toneMapping=yn;let Ke=z.viewport;if(z.viewport!==void 0&&(z.viewport=void 0),S.setupLightsView(z),Ue===!0&&Re.setGlobalState(R.clippingPlanes,z),io(M,Y,z),Z.updateMultisampleRenderTarget(_e),Z.updateRenderTargetMipmap(_e),Qe.has("WEBGL_multisampled_render_to_texture")===!1){let we=!1;for(let rt=0,St=N.length;rt<St;rt++){let mt=N[rt],{object:ut,geometry:Ft,material:ye,group:Ht}=mt;if(ye.side===Nt&&ut.layers.test(z.layers)){let et=ye.side;ye.side=Yt,ye.needsUpdate=!0,Vh(ut,Y,z,Ft,ye,Ht),ye.side=et,ye.needsUpdate=!0,we=!0}}we===!0&&(Z.updateMultisampleRenderTarget(_e),Z.updateRenderTargetMipmap(_e))}R.setRenderTarget(ge,Me,Ee),R.setClearColor(tt,He),Ke!==void 0&&(z.viewport=Ke),R.toneMapping=We}function io(M,N,Y){let z=N.isScene===!0?N.overrideMaterial:null;for(let V=0,_e=M.length;V<_e;V++){let ve=M[V],{object:ge,geometry:Me,group:Ee}=ve,We=ve.material;We.allowOverride===!0&&z!==null&&(We=z),ge.layers.test(Y.layers)&&Vh(ge,N,Y,Me,We,Ee)}}function Vh(M,N,Y,z,V,_e){O!==null&&V.isNodeMaterial&&O.setObject(M,V),M.onBeforeRender(R,N,Y,z,V,_e),M.modelViewMatrix.multiplyMatrices(Y.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),V.onBeforeRender(R,N,Y,z,M,_e),V.transparent===!0&&V.side===Nt&&V.forceSinglePass===!1?(V.side=Yt,V.needsUpdate=!0,R.renderBufferDirect(Y,N,z,V,M,_e),V.side=Pn,V.needsUpdate=!0,R.renderBufferDirect(Y,N,z,V,M,_e),V.side=Nt):R.renderBufferDirect(Y,N,z,V,M,_e),M.onAfterRender(R,N,Y,z,V,_e)}function so(M,N,Y){N.isScene!==!0&&(N=Dt);let z=W.get(M),V=S.state.lights,_e=S.state.shadowsArray,ve=V.state.version,ge=le.getParameters(M,V.state,_e,N,Y,S.state.lightProbeGridArray),Me=le.getProgramCacheKey(ge),Ee=z.programs;z.environment=M.isMeshStandardMaterial||M.isMeshLambertMaterial||M.isMeshPhongMaterial?N.environment:null,z.fog=N.fog;let We=M.isMeshStandardMaterial||M.isMeshLambertMaterial&&!M.envMap||M.isMeshPhongMaterial&&!M.envMap;z.envMap=re.get(M.envMap||z.environment,We),z.envMapRotation=z.environment!==null&&M.envMap===null?N.environmentRotation:M.envMapRotation,Ee===void 0&&(M.addEventListener("dispose",An),Ee=new Map,z.programs=Ee);let Ke=Ee.get(Me);if(Ke!==void 0){if(z.currentProgram===Ke&&z.lightsStateVersion===ve)return Gh(M,ge),Ke}else ge.uniforms=le.getUniforms(M),O!==null&&M.isNodeMaterial&&O.build(M,Y,ge),M.onBeforeCompile(ge,R),Ke=le.acquireProgram(ge,Me),Ee.set(Me,Ke),z.uniforms=ge.uniforms;let we=z.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(we.clippingPlanes=Re.uniform),Gh(M,ge),z.needsLights=gp(M),z.lightsStateVersion=ve,z.needsLights&&(we.ambientLightColor.value=V.state.ambient,we.lightProbe.value=V.state.probe,we.sunLights.value=V.state.sun,we.sunLightShadows.value=V.state.sunShadow,we.directionalLights.value=V.state.directional,we.directionalLightShadows.value=V.state.directionalShadow,we.spotLights.value=V.state.spot,we.spotLightShadows.value=V.state.spotShadow,we.rectAreaLights.value=V.state.rectArea,we.ltc_1.value=V.state.rectAreaLTC1,we.ltc_2.value=V.state.rectAreaLTC2,we.pointLights.value=V.state.point,we.pointLightShadows.value=V.state.pointShadow,we.hemisphereLights.value=V.state.hemi,we.sunShadowMatrix.value=V.state.sunShadowMatrix,we.sunShadowCascade.value=V.state.sunShadowCascade,we.directionalShadowMatrix.value=V.state.directionalShadowMatrix,we.spotLightMatrix.value=V.state.spotLightMatrix,we.spotLightMap.value=V.state.spotLightMap,we.pointShadowMatrix.value=V.state.pointShadowMatrix),z.lightProbeGrid=S.state.lightProbeGridArray.length>0,z.currentProgram=Ke,z.uniformsList=null,Ke}function Hh(M){if(M.uniformsList===null){let N=M.currentProgram.getUniforms();M.uniformsList=Gs.seqWithValue(N.seq,M.uniforms)}return M.uniformsList}function Gh(M,N){let Y=W.get(M);Y.outputColorSpace=N.outputColorSpace,Y.batching=N.batching,Y.batchingColor=N.batchingColor,Y.instancing=N.instancing,Y.instancingColor=N.instancingColor,Y.instancingMorph=N.instancingMorph,Y.skinning=N.skinning,Y.morphTargets=N.morphTargets,Y.morphNormals=N.morphNormals,Y.morphColors=N.morphColors,Y.morphTargetsCount=N.morphTargetsCount,Y.numClippingPlanes=N.numClippingPlanes,Y.numIntersection=N.numClipIntersection,Y.vertexAlphas=N.vertexAlphas,Y.vertexTangents=N.vertexTangents,Y.toneMapping=N.toneMapping}function fp(M,N){if(M.length===0)return null;if(M.length===1)return M[0].texture!==null?M[0]:null;y.setFromMatrixPosition(N.matrixWorld);for(let Y=0,z=M.length;Y<z;Y++){let V=M[Y];if(V.texture!==null&&V.boundingBox.containsPoint(y))return V}return null}function pp(M,N,Y,z,V){N.isScene!==!0&&(N=Dt),Z.resetTextureUnits();let _e=N.fog,ve=z.isMeshStandardMaterial||z.isMeshLambertMaterial||z.isMeshPhongMaterial?N.environment:null,ge=ne===null?R.outputColorSpace:ne.isXRRenderTarget===!0?ne.texture.colorSpace:je.workingColorSpace,Me=z.isMeshStandardMaterial||z.isMeshLambertMaterial&&!z.envMap||z.isMeshPhongMaterial&&!z.envMap,Ee=re.get(z.envMap||ve,Me),We=z.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,Ke=!!Y.attributes.tangent&&(!!z.normalMap||z.anisotropy>0),we=!!Y.morphAttributes.position,rt=!!Y.morphAttributes.normal,St=!!Y.morphAttributes.color,mt=yn;z.toneMapped&&(ne===null||ne.isXRRenderTarget===!0)&&(mt=R.toneMapping);let ut=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,Ft=ut!==void 0?ut.length:0,ye=W.get(z),Ht=S.state.lights;if(Ue===!0&&(Ye===!0||M!==K)){let ft=M===K&&z.id===q;Re.setState(z,M,ft)}let et=!1;z.version===ye.__version?(ye.needsLights&&ye.lightsStateVersion!==Ht.state.version||ye.outputColorSpace!==ge||V.isBatchedMesh&&ye.batching===!1||!V.isBatchedMesh&&ye.batching===!0||V.isBatchedMesh&&ye.batchingColor===!0&&V._colorsTexture===null||V.isBatchedMesh&&ye.batchingColor===!1&&V._colorsTexture!==null||V.isInstancedMesh&&ye.instancing===!1||!V.isInstancedMesh&&ye.instancing===!0||V.isSkinnedMesh&&ye.skinning===!1||!V.isSkinnedMesh&&ye.skinning===!0||V.isInstancedMesh&&ye.instancingColor===!0&&V.instanceColor===null||V.isInstancedMesh&&ye.instancingColor===!1&&V.instanceColor!==null||V.isInstancedMesh&&ye.instancingMorph===!0&&V.morphTexture===null||V.isInstancedMesh&&ye.instancingMorph===!1&&V.morphTexture!==null||ye.envMap!==Ee||z.fog===!0&&ye.fog!==_e||ye.numClippingPlanes!==void 0&&(ye.numClippingPlanes!==Re.numPlanes||ye.numIntersection!==Re.numIntersection)||ye.vertexAlphas!==We||ye.vertexTangents!==Ke||ye.morphTargets!==we||ye.morphNormals!==rt||ye.morphColors!==St||ye.toneMapping!==mt||ye.morphTargetsCount!==Ft||!!ye.lightProbeGrid!=S.state.lightProbeGridArray.length>0)&&(et=!0):(et=!0,ye.__version=z.version);let on=ye.currentProgram;et===!0&&(on=so(z,N,V),O&&z.isNodeMaterial&&O.onUpdateProgram(z,on,ye));let En=!1,Jn=!1,es=!1,ht=on.getUniforms(),xt=ye.uniforms;if(x.useProgram(on.program)&&(En=!0,Jn=!0,es=!0),z.id!==q&&(q=z.id,Jn=!0),ye.needsLights){let ft=fp(S.state.lightProbeGridArray,V);ye.lightProbeGrid!==ft&&(ye.lightProbeGrid=ft,Jn=!0)}if(En||K!==M){x.buffers.depth.getReversed()&&M.reversedDepth!==!0&&(M._reversedDepth=!0,M.updateProjectionMatrix()),ht.setValue(L,"projectionMatrix",M.projectionMatrix),ht.setValue(L,"viewMatrix",M.matrixWorldInverse);let Qn=ht.map.cameraPosition;Qn!==void 0&&Qn.setValue(L,nt.setFromMatrixPosition(M.matrixWorld)),C.logarithmicDepthBuffer&&ht.setValue(L,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(z.isMeshPhongMaterial||z.isMeshToonMaterial||z.isMeshLambertMaterial||z.isMeshBasicMaterial||z.isMeshStandardMaterial||z.isShaderMaterial)&&ht.setValue(L,"isOrthographic",M.isOrthographicCamera===!0),K!==M&&(K=M,Jn=!0,es=!0)}if(ye.needsLights&&(Ht.state.sunShadowMap.length>0&&ht.setValue(L,"sunShadowMap",Ht.state.sunShadowMap,Z),Ht.state.directionalShadowMap.length>0&&ht.setValue(L,"directionalShadowMap",Ht.state.directionalShadowMap,Z),Ht.state.spotShadowMap.length>0&&ht.setValue(L,"spotShadowMap",Ht.state.spotShadowMap,Z),Ht.state.pointShadowMap.length>0&&ht.setValue(L,"pointShadowMap",Ht.state.pointShadowMap,Z)),V.isSkinnedMesh){ht.setOptional(L,V,"bindMatrix"),ht.setOptional(L,V,"bindMatrixInverse");let ft=V.skeleton;ft&&(ft.boneTexture===null&&ft.computeBoneTexture(),ht.setValue(L,"boneTexture",ft.boneTexture,Z))}V.isBatchedMesh&&(ht.setOptional(L,V,"batchingTexture"),ht.setValue(L,"batchingTexture",V._matricesTexture,Z),ht.setOptional(L,V,"batchingIdTexture"),ht.setValue(L,"batchingIdTexture",V._indirectTexture,Z),ht.setOptional(L,V,"batchingColorTexture"),V._colorsTexture!==null&&ht.setValue(L,"batchingColorTexture",V._colorsTexture,Z));let jn=Y.morphAttributes;if((jn.position!==void 0||jn.normal!==void 0||jn.color!==void 0)&&D.update(V,Y,on),(Jn||ye.receiveShadow!==V.receiveShadow)&&(ye.receiveShadow=V.receiveShadow,ht.setValue(L,"receiveShadow",V.receiveShadow)),(z.isMeshStandardMaterial||z.isMeshLambertMaterial||z.isMeshPhongMaterial)&&z.envMap===null&&N.environment!==null&&(xt.envMapIntensity.value=N.environmentIntensity),xt.dfgLUT!==void 0&&(xt.dfgLUT.value=iy()),Jn){if(ht.setValue(L,"toneMappingExposure",R.toneMappingExposure),ye.needsLights&&mp(xt,es),_e&&z.fog===!0&&Ce.refreshFogUniforms(xt,_e),Ce.refreshMaterialUniforms(xt,z,G,H,S.state.transmissionRenderTarget[M.id]),ye.needsLights&&ye.lightProbeGrid){let ft=ye.lightProbeGrid;xt.probesSH.value=ft.texture,xt.probesMin.value.copy(ft.boundingBox.min),xt.probesMax.value.copy(ft.boundingBox.max),xt.probesResolution.value.copy(ft.resolution)}Gs.upload(L,Hh(ye),xt,Z)}if(z.isShaderMaterial&&z.uniformsNeedUpdate===!0&&(Gs.upload(L,Hh(ye),xt,Z),z.uniformsNeedUpdate=!1),z.isSpriteMaterial&&ht.setValue(L,"center",V.center),ht.setValue(L,"modelViewMatrix",V.modelViewMatrix),ht.setValue(L,"normalMatrix",V.normalMatrix),ht.setValue(L,"modelMatrix",V.matrixWorld),z.uniformsGroups!==void 0){let ft=z.uniformsGroups;for(let Qn=0,ts=ft.length;Qn<ts;Qn++){let Xh=ft[Qn];ie.update(Xh,on),ie.bind(Xh,on)}}return on}function mp(M,N){M.ambientLightColor.needsUpdate=N,M.lightProbe.needsUpdate=N,M.sunLights.needsUpdate=N,M.sunLightShadows.needsUpdate=N,M.directionalLights.needsUpdate=N,M.directionalLightShadows.needsUpdate=N,M.pointLights.needsUpdate=N,M.pointLightShadows.needsUpdate=N,M.spotLights.needsUpdate=N,M.spotLightShadows.needsUpdate=N,M.rectAreaLights.needsUpdate=N,M.hemisphereLights.needsUpdate=N}function gp(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return $},this.getActiveMipmapLevel=function(){return X},this.getRenderTarget=function(){return ne},this.setRenderTargetTextures=function(M,N,Y){let z=W.get(M);z.__autoAllocateDepthBuffer=M.resolveDepthBuffer===!1,z.__autoAllocateDepthBuffer===!1&&(z.__useRenderToTexture=!1),W.get(M.texture).__webglTexture=N,W.get(M.depthTexture).__webglTexture=z.__autoAllocateDepthBuffer?void 0:Y,z.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(M,N){let Y=W.get(M);Y.__webglFramebuffer=N,Y.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(M,N=0,Y=0){ne=M,$=N,X=Y;let z=null,V=!1,_e=!1;if(M){let ge=W.get(M);if(ge.__useDefaultFramebuffer!==void 0){x.bindFramebuffer(L.FRAMEBUFFER,ge.__webglFramebuffer),ee.copy(M.viewport),be.copy(M.scissor),Se=M.scissorTest,x.viewport(ee),x.scissor(be),x.setScissorTest(Se),q=-1;return}else if(ge.__webglFramebuffer===void 0)Z.setupRenderTarget(M);else if(ge.__hasExternalTextures)Z.rebindTextures(M,W.get(M.texture).__webglTexture,W.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){let We=M.depthTexture;if(ge.__boundDepthTexture!==We){if(We!==null&&W.has(We)&&(M.width!==We.image.width||M.height!==We.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Z.setupDepthRenderbuffer(M)}}let Me=M.texture;(Me.isData3DTexture||Me.isDataArrayTexture||Me.isCompressedArrayTexture)&&(_e=!0);let Ee=W.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(Ee[N])?z=Ee[N][Y]:z=Ee[N],V=!0):M.samples>0&&Z.useMultisampledRTT(M)===!1?z=W.get(M).__webglMultisampledFramebuffer:Array.isArray(Ee)?z=Ee[Y]:z=Ee,ee.copy(M.viewport),be.copy(M.scissor),Se=M.scissorTest}else ee.copy(de).multiplyScalar(G).floor(),be.copy(Ne).multiplyScalar(G).floor(),Se=Ze;if(Y!==0&&(z=k),x.bindFramebuffer(L.FRAMEBUFFER,z)&&x.drawBuffers(M,z),x.viewport(ee),x.scissor(be),x.setScissorTest(Se),V){let ge=W.get(M.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+N,ge.__webglTexture,Y)}else if(_e){let ge=N;for(let Me=0;Me<M.textures.length;Me++){let Ee=W.get(M.textures[Me]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+Me,Ee.__webglTexture,Y,ge)}}else if(M!==null&&Y!==0){let ge=W.get(M.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,ge.__webglTexture,Y)}q=-1};function Wh(M){let N=W.get(M);return(N.__readFormat!==M.format||N.__readType!==M.type)&&(N.__readFormat=M.format,N.__readType=M.type,N.__formatReadable=C.textureFormatReadable(M.format),N.__typeReadable=C.textureTypeReadable(M.type)),N}this.readRenderTargetPixels=function(M,N,Y,z,V,_e,ve,ge=0){if(!(M&&M.isWebGLRenderTarget)){Fe("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Me=W.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&ve!==void 0&&(Me=Me[ve]),Me){x.bindFramebuffer(L.FRAMEBUFFER,Me);try{let Ee=M.textures[ge],We=Ee.format,Ke=Ee.type;M.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+ge);let we=Wh(Ee);if(we.__formatReadable===!1){Fe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(we.__typeReadable===!1){Fe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=M.width-z&&Y>=0&&Y<=M.height-V&&L.readPixels(N,Y,z,V,ue.convert(We),ue.convert(Ke),_e)}finally{let Ee=ne!==null?W.get(ne).__webglFramebuffer:null;x.bindFramebuffer(L.FRAMEBUFFER,Ee)}}},this.readRenderTargetPixelsAsync=async function(M,N,Y,z,V,_e,ve,ge=0){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Me=W.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&ve!==void 0&&(Me=Me[ve]),Me)if(N>=0&&N<=M.width-z&&Y>=0&&Y<=M.height-V){x.bindFramebuffer(L.FRAMEBUFFER,Me);let Ee=M.textures[ge],We=Ee.format,Ke=Ee.type;M.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+ge);let we=Wh(Ee);if(we.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(we.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let rt=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,rt),L.bufferData(L.PIXEL_PACK_BUFFER,_e.byteLength,L.STREAM_READ),L.readPixels(N,Y,z,V,ue.convert(We),ue.convert(Ke),0),L.bindBuffer(L.PIXEL_PACK_BUFFER,null);let St=ne!==null?W.get(ne).__webglFramebuffer:null;x.bindFramebuffer(L.FRAMEBUFFER,St);let mt=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await nd(L,mt,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,rt),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,_e),L.bindBuffer(L.PIXEL_PACK_BUFFER,null),L.deleteBuffer(rt),L.deleteSync(mt),_e}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(M,N=null,Y=0){let z=Math.pow(2,-Y),V=Math.floor(M.image.width*z),_e=Math.floor(M.image.height*z),ve=N!==null?N.x:0,ge=N!==null?N.y:0;Z.setTexture2D(M,0),L.copyTexSubImage2D(L.TEXTURE_2D,Y,0,0,ve,ge,V,_e),x.unbindTexture()},this.copyTextureToTexture=function(M,N,Y=null,z=null,V=0,_e=0){let ve,ge,Me,Ee,We,Ke,we,rt,St,mt=M.isCompressedTexture?M.mipmaps[_e]:M.image;if(Y!==null)ve=Y.max.x-Y.min.x,ge=Y.max.y-Y.min.y,Me=Y.isBox3?Y.max.z-Y.min.z:1,Ee=Y.min.x,We=Y.min.y,Ke=Y.isBox3?Y.min.z:0;else{let xt=Math.pow(2,-V);ve=Math.floor(mt.width*xt),ge=Math.floor(mt.height*xt),M.isDataArrayTexture?Me=mt.depth:M.isData3DTexture?Me=Math.floor(mt.depth*xt):Me=1,Ee=0,We=0,Ke=0}z!==null?(we=z.x,rt=z.y,St=z.z):(we=0,rt=0,St=0);let ut=ue.convert(N.format),Ft=ue.convert(N.type),ye;N.isData3DTexture?(Z.setTexture3D(N,0),ye=L.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(Z.setTexture2DArray(N,0),ye=L.TEXTURE_2D_ARRAY):(Z.setTexture2D(N,0),ye=L.TEXTURE_2D),x.activeTexture(L.TEXTURE0),x.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,N.flipY),x.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),x.pixelStorei(L.UNPACK_ALIGNMENT,N.unpackAlignment);let Ht=x.getParameter(L.UNPACK_ROW_LENGTH),et=x.getParameter(L.UNPACK_IMAGE_HEIGHT),on=x.getParameter(L.UNPACK_SKIP_PIXELS),En=x.getParameter(L.UNPACK_SKIP_ROWS),Jn=x.getParameter(L.UNPACK_SKIP_IMAGES);x.pixelStorei(L.UNPACK_ROW_LENGTH,mt.width),x.pixelStorei(L.UNPACK_IMAGE_HEIGHT,mt.height),x.pixelStorei(L.UNPACK_SKIP_PIXELS,Ee),x.pixelStorei(L.UNPACK_SKIP_ROWS,We),x.pixelStorei(L.UNPACK_SKIP_IMAGES,Ke);let es=M.isDataArrayTexture||M.isData3DTexture,ht=N.isDataArrayTexture||N.isData3DTexture;if(M.isDepthTexture){let xt=W.get(M),jn=W.get(N),ft=W.get(xt.__renderTarget),Qn=W.get(jn.__renderTarget);x.bindFramebuffer(L.READ_FRAMEBUFFER,ft.__webglFramebuffer),x.bindFramebuffer(L.DRAW_FRAMEBUFFER,Qn.__webglFramebuffer);for(let ts=0;ts<Me;ts++)es&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,W.get(M).__webglTexture,V,Ke+ts),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,W.get(N).__webglTexture,_e,St+ts)),L.blitFramebuffer(Ee,We,ve,ge,we,rt,ve,ge,L.DEPTH_BUFFER_BIT,L.NEAREST);x.bindFramebuffer(L.READ_FRAMEBUFFER,null),x.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(V!==0||M.isRenderTargetTexture||W.has(M)){let xt=W.get(M),jn=W.get(N);x.bindFramebuffer(L.READ_FRAMEBUFFER,I),x.bindFramebuffer(L.DRAW_FRAMEBUFFER,F);for(let ft=0;ft<Me;ft++)es?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,xt.__webglTexture,V,Ke+ft):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,xt.__webglTexture,V),ht?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,jn.__webglTexture,_e,St+ft):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,jn.__webglTexture,_e),V!==0?L.blitFramebuffer(Ee,We,ve,ge,we,rt,ve,ge,L.COLOR_BUFFER_BIT,L.NEAREST):ht?L.copyTexSubImage3D(ye,_e,we,rt,St+ft,Ee,We,ve,ge):L.copyTexSubImage2D(ye,_e,we,rt,Ee,We,ve,ge);x.bindFramebuffer(L.READ_FRAMEBUFFER,null),x.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else ht?M.isDataTexture||M.isData3DTexture?L.texSubImage3D(ye,_e,we,rt,St,ve,ge,Me,ut,Ft,mt.data):N.isCompressedArrayTexture?L.compressedTexSubImage3D(ye,_e,we,rt,St,ve,ge,Me,ut,mt.data):L.texSubImage3D(ye,_e,we,rt,St,ve,ge,Me,ut,Ft,mt):M.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,_e,we,rt,ve,ge,ut,Ft,mt.data):M.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,_e,we,rt,mt.width,mt.height,ut,mt.data):L.texSubImage2D(L.TEXTURE_2D,_e,we,rt,ve,ge,ut,Ft,mt);x.pixelStorei(L.UNPACK_ROW_LENGTH,Ht),x.pixelStorei(L.UNPACK_IMAGE_HEIGHT,et),x.pixelStorei(L.UNPACK_SKIP_PIXELS,on),x.pixelStorei(L.UNPACK_SKIP_ROWS,En),x.pixelStorei(L.UNPACK_SKIP_IMAGES,Jn),_e===0&&N.generateMipmaps&&L.generateMipmap(ye),x.unbindTexture()},this.initRenderTarget=function(M){W.get(M).__webglFramebuffer===void 0&&Z.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?Z.setTextureCube(M,0):M.isData3DTexture?Z.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?Z.setTexture2DArray(M,0):Z.setTexture2D(M,0),x.unbindTexture()},this.resetState=function(){$=0,X=0,ne=null,x.reset(),xe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return mn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=je._getDrawingBufferColorSpace(e),t.unpackColorSpace=je._getUnpackColorSpace()}};var sy=[137,80,78,71,13,10,26,10],Od=i=>typeof i=="string"?Uint8Array.from(atob(i),e=>e.charCodeAt(0)):i;function Fd(i,e){let t=Od(e);return new i(t.buffer,t.byteOffset,t.byteLength/i.BYTES_PER_ELEMENT)}function ry(i,e,t){let n=i.length/e,s=new Uint8Array(i.length),r={1:Uint8Array,2:Uint16Array,4:Uint32Array}[e],o=new r(n),a=new Uint8Array(o.buffer);for(let d=0;d<e;d++)for(let h=0;h<n;h++)a[h*e+d]=i[d*n+h];for(let d=1;d<n;d++)o[d]+=o[d-1];let l=n/t,c=new r(s.buffer);for(let d=0;d<t;d++)for(let h=0;h<l;h++)c[h*t+d]=o[d*l+h];return s}async function oy(i){let e=new Uint8Array(i);if(!sy.every((h,u)=>e[u]===h))return JSON.parse(new TextDecoder().decode(e));let t=new DataView(e.buffer,e.byteOffset,e.byteLength),n=[],s=0;for(let h=8;h+8<=e.length;){let u=t.getUint32(h),p=String.fromCharCode(...e.subarray(h+4,h+8));if(p==="IHDR"&&(s=t.getUint32(h+8)),p==="IDAT"&&n.push(e.subarray(h+8,h+8+u)),p==="IEND")break;h+=12+u}let r=new Blob(n).stream().pipeThrough(new DecompressionStream("deflate")),o=new Uint8Array(await new Response(r).arrayBuffer()),a=o.length/(s+1),l=new Uint8Array(a*s);for(let h=0;h<a;h++){if(o[h*(s+1)]!==0)throw new Error("A packed kit file has a filtered row");l.set(o.subarray(h*(s+1)+1,(h+1)*(s+1)),h*s)}let c=new DataView(l.buffer).getUint32(0,!0),d=(h,u)=>{let p=u?.["@"];if(!Array.isArray(p))return u;let[_,v,m,f]=p,b=l.slice(_,_+v);return f?ry(b,m,f):b};return JSON.parse(new TextDecoder().decode(l.subarray(4,4+c)),d)}var ay=new Oi;function Bd(i){let e=URL.createObjectURL(new Blob([Od(i)],{type:"image/webp"})),t=()=>URL.revokeObjectURL(e);return ay.load(e,t,void 0,t)}async function kd(i,e=i){let t=await fetch(i);if(!t.ok)throw new Error(`GET ${e} → ${t.status}`);return oy(await t.arrayBuffer())}var sn="3d-avatar-maker",zd=`/api/capability-packages/${sn}/assets/kit/`,Bc="";function Vd(i,e=""){zd=i.endsWith("/")?i:`${i}/`,Bc=e}var ly=i=>i.startsWith("avatar-outfit")?"wardrobe":"avatar",ja=i=>`${zd}${ly(i)}/${i}${Bc?`?v=${encodeURIComponent(Bc)}`:""}`,Ka=new Map,Ja=new Map,cy=new Oi,Vr=i=>kc(ja(i),i);function kc(i,e=i){if(!Ka.has(i)){let t=kd(i,e);t.catch(()=>Ka.delete(i)),Ka.set(i,t)}return Ka.get(i)}function Hr(i,e=null){if(!Ja.has(i)){let t=e?.find(s=>s.name===i)?.webp,n=t?Bd(t):cy.load(ja(`${i}.webp`));n.flipY=!1,n.colorSpace=yt,n.name=i,n.userData.shared=!0,Ja.set(i,n)}return Ja.get(i)}function Hd(){return Promise.all([...Ja.values()].map(i=>new Promise(e=>{let t=n=>{i.image?.complete!==!1&&(i.image?.width||n<=0)?e():setTimeout(()=>t(n-1),50)};t(200)})))}var Mn=Fd;function zc(i){let e=Mn(Int16Array,i.position),t=new Float32Array(e.length);for(let l=0;l<e.length;l++){let c=l%3,d=i.box[c],h=i.box[c+3]-d;t[l]=d+(e[l]+32768)/65535*h}let n=Float32Array.from(Mn(Int8Array,i.normal),l=>l/127),s=i.uv?Float32Array.from(Mn(Uint16Array,i.uv),l=>l/65535):null,r=new At;r.setAttribute("position",new Ge(t,3)),r.setAttribute("normal",new Ge(n,3)),s&&r.setAttribute("uv",new Ge(s,2)),r.setAttribute("skinIndex",new Xn(Uint16Array.from(Mn(Uint8Array,i.joints)),4));let o=Float32Array.from(Mn(Uint8Array,i.weights));for(let l=0;l<o.length;l+=4){let c=o[l]+o[l+1]+o[l+2]+o[l+3]||1;for(let d=0;d<4;d++)o[l+d]/=c}r.setAttribute("skinWeight",new Ge(o,4));let a=i.wide?Uint32Array:Uint16Array;return r.setIndex(new Ge(Mn(a,i.index),1)),r.computeBoundingBox(),r.computeBoundingSphere(),r}function Gd(i){let e=new gn,t=new Map,n=i.skeleton.names.map(s=>{let r=i.joints.indexOf(s);return new ke().fromArray(i.inverseBind,r*16).invert()});return i.skeleton.names.forEach((s,r)=>{let o=new Cs;o.name=s;let a=i.skeleton.parents[r];(a>=0?n[a].clone().invert().multiply(n[r]):n[r].clone()).decompose(o.position,o.quaternion,o.scale),t.set(s,o)}),i.skeleton.names.forEach((s,r)=>{let o=i.skeleton.parents[r];(o>=0?t.get(i.skeleton.names[o]):e).add(t.get(s))}),e.updateMatrixWorld(!0),{root:e,bones:t}}function Wd(i,e,t,n=null,s=null,r=null){let o=t.joints.map(l=>e.get(l)??i),a=t.joints.map((l,c)=>{let d=t.inverseBind?new ke().fromArray(t.inverseBind,c*16):new ke().fromArray(s.inverseBind,Math.max(0,s.joints.indexOf(l))*16),h=r?.get(l);h&&d.multiply(h);let u=n?.get(l);return u?d.premultiply(u):d});return new _r(o,a)}var qn={hips:"pelvis",spine:"spine_01",chest:"spine_02",upperChest:"spine_03",neck:"neck_01",head:"Head",leftShoulder:"clavicle_l",leftUpperArm:"upperarm_l",leftLowerArm:"lowerarm_l",leftHand:"hand_l",rightShoulder:"clavicle_r",rightUpperArm:"upperarm_r",rightLowerArm:"lowerarm_r",rightHand:"hand_r",leftUpperLeg:"thigh_l",leftLowerLeg:"calf_l",leftFoot:"foot_l",leftToes:"ball_l",rightUpperLeg:"thigh_r",rightLowerLeg:"calf_r",rightFoot:"foot_r",rightToes:"ball_r"};for(let[i,e]of[["left","l"],["right","r"]]){for(let[t,n]of[["Index","index"],["Middle","middle"],["Ring","ring"],["Little","pinky"]])qn[`${i}${t}Proximal`]=`${n}_01_${e}`,qn[`${i}${t}Intermediate`]=`${n}_02_${e}`,qn[`${i}${t}Distal`]=`${n}_03_${e}`;qn[`${i}ThumbMetacarpal`]=`thumb_01_${e}`,qn[`${i}ThumbProximal`]=`thumb_02_${e}`,qn[`${i}ThumbDistal`]=`thumb_03_${e}`}function Xd(i,e="auto",t={},n=Math.random){return t.body==="male"||t.body==="female"?{sex:t.body}:e==="male"||e==="female"?{sex:e}:{sex:n()<.5?"male":"female"}}var Vc=new U,hy=new U,Yd=new Lt,Qa=new Lt;function Xs(i,e,t){if(!i||!e)return;let n=e.getWorldPosition(Vc).sub(i.getWorldPosition(hy));n.lengthSq()!==0&&(Yd.setFromUnitVectors(n.normalize(),t),Qa.identity(),i.parent?.getWorldQuaternion(Qa),i.quaternion.premultiply(Qa).premultiply(Yd).premultiply(Qa.invert()),i.updateMatrixWorld(!0))}function qd(i,e,t=1){let n=new gn;n.add(i),i.scale.setScalar(t),i.updateMatrixWorld(!0);let s=i.children.filter(c=>c.isSkinnedMesh),r=new xn().setFromObject(i).min.y,o=e.get(qn.hips)?.getWorldPosition(Vc)??Vc.set(0,0,0);i.position.set(-o.x,Number.isFinite(r)?-r:0,-o.z),i.updateMatrixWorld(!0);let a={};for(let[c,d]of Object.entries(qn))e.has(d)&&(a[c]=e.get(d));let l=new Map([...e].map(([c,d])=>[c,d.quaternion.clone()]));return{object:n,root:i,bones:e,meshes:s,humanoid:a,rest:l}}function $d(i){Ys(i);let e=i.humanoid;for(let[t,n]of[["left",1],["right",-1]]){let s=new U(n,0,0);Xs(e[`${t}UpperArm`],e[`${t}LowerArm`],s),Xs(e[`${t}LowerArm`],e[`${t}Hand`],s);for(let r of["Index","Middle","Ring","Little"])Xs(e[`${t}${r}Proximal`],e[`${t}${r}Intermediate`],s),Xs(e[`${t}${r}Intermediate`],e[`${t}${r}Distal`],s)}i.root.updateMatrixWorld(!0)}function Ys(i){for(let[e,t]of i.bones)t.quaternion.copy(i.rest.get(e));i.root.updateMatrixWorld(!0)}function Zd(i,e=0){Ys(i);let t=i.humanoid,n=new U;for(let[o,a]of[["left",1],["right",-1]])n.set(a*.3,-1,.03).normalize(),Xs(t[`${o}UpperArm`],t[`${o}LowerArm`],n),n.set(a*.22,-1,.12).normalize(),Xs(t[`${o}LowerArm`],t[`${o}Hand`],n);let s=Math.sin(e*1.6)*.012,r=Math.sin(e*.55)*.012;t.chest&&t.chest.rotateX(-s),t.spine&&t.spine.rotateZ(r),t.head&&t.head.rotateZ(-r*.6),i.root.updateMatrixWorld(!0)}var Hc={peasant:{label:"Townsfolk",colours:[["clothes-a","Cream"],["clothes-b","Olive"],["clothes-blue","Blue"],["clothes-red","Rose"],["clothes-teal","Green"],["clothes-plum","Plum"],["clothes-grey","Grey"]]},ranger:{label:"Ranger",colours:[["ranger-a","Forest"],["ranger-b","Tan"],["ranger-wine","Violet"],["ranger-dusk","Dusk blue"],["ranger-rust","Rust"],["ranger-moss","Moss"],["ranger-grey","Grey"]]}},gt="none",uy=[...Object.keys(Hc),gt],dy={peasant:"colour",ranger:"rangerColour"},Kd=[["top","Top"],["arms","Sleeves"],["legs","Legs"],["feet","Boots"]],Jd=[["hood","Hood","ranger"],["pauldrons","Pauldrons","ranger"]];var $s=[["shaved","Shaved close"],["crop","Cropped"],["short","Short"],["mohawk","Mohawk"],["slicked","Slicked back"],["fringe","Short with a fringe"],["parted","Side-parted"],["curly","Curly"],["afro","Afro"],["bob","Bob"],["bob_angled","Angled bob"],["buns","Two buns"],["long","Long"],["ponytail","Ponytail"],["braid","Braid"],["none","None (bald)"]];var fy={buzzed:"short",buzzedfemale:"short",cropped:"short",simpleparted:"parted"},Wc={male:["short","parted","long","parted","crop","slicked","fringe","curly"],female:["buns","long","parted","short","ponytail","braid","bob","bob_angled"]},qi=[[2825492,"Dark brown"],[4861724,"Brown"],[8014374,"Chestnut"],[11569232,"Dark blond"],[14731408,"Blond"],[1710618,"Black"],[9187102,"Red"],[12369084,"Grey"],[15921906,"White"],[4878248,"Blue"],[8014490,"Violet"],[4164186,"Green"],[13658764,"Pink"]],jd=8,$n=[[15981003,"Pale"],[15581360,"Rosy"],[15254440,"Fair"],[14264714,"Light"],[14199152,"Golden"],[12618338,"Tan"],[11569498,"Olive"],[10841155,"Bronze"],[9263674,"Brown"],[7357226,"Deep brown"],[6044198,"Dark"],[4007450,"Ebony"]],py=[0,2,3,5,8,10],xi=[.55,1.15],qs=i=>Number.isInteger(i)&&i>=0&&i<=16777215,Wi=i=>!!i&&typeof i=="object"&&!Array.isArray(i),my=["vrm","glb-fbx","mmd","builtin"];function $i(i){if(!i||typeof i!="object"||Array.isArray(i))return{};let e={};(h=>Object.hasOwn(Hc,h))(i.outfit)&&(e.outfit=i.outfit);for(let[h]of Kd)uy.includes(i[h])&&(e[h]=i[h]);for(let[h]of Jd)typeof i[h]=="boolean"&&(e[h]=i[h]);for(let[h,u]of Object.entries(dy)){let p=Hc[h].colours.map(([v])=>v),_=[i[u],i.colour].find(v=>p.includes(v));_&&(e[u]=_)}let n={};for(let[h]of[...Kd,...Jd]){let u=Wi(i.tints)&&qs(i.tints[h])?i.tints[h]:i.tint;qs(u)&&(n[h]=u)}Object.keys(n).length&&(e.tints=n);let s=fy[i.hair]??i.hair;$s.some(([h])=>h===s)&&(e.hair=s);let r=(h,u)=>Number.isInteger(h)&&h>=0&&h<u;r(i.hairColour,qi.length)&&(e.hairColour=i.hairColour),qs(i.hairTint)&&(e.hairTint=i.hairTint);let o=i.skinSet===2?i.skin:py[i.skin];r(o,$n.length)&&Object.assign(e,{skin:o,skinSet:2}),qs(i.skinTint)&&(e.skinTint=i.skinTint),[...el,...Wr].some(([h])=>h===i.skin)&&(e.skin=i.skin),eh.some(([h])=>h===i.age)&&(e.age=i.age);for(let[h,u]of[["brows",xy],["lashes",yy]])Number.isFinite(i[h])&&(e[h]=Math.max(1,Math.min(u,Math.round(i[h]))));(i.eyePicture===On||Xr.some(([h])=>h===i.eyePicture))&&(e.eyePicture=i.eyePicture),al.some(([h])=>h===i.nails)&&(e.nails=i.nails),typeof i.toenails=="boolean"&&(e.toenails=i.toenails),typeof i.beard=="boolean"&&(e.beard=i.beard),(i.figure==="male"||i.figure==="female")&&(e.figure=i.figure),Number.isFinite(i.height)&&(e.height=Math.max(xi[0],Math.min(xi[1],Number(i.height)))),my.includes(i.avatar)&&(e.avatar=i.avatar),nl.some(([h])=>h===i.body)&&(e.body=i.body),Xc.some(([h])=>h===i.species)&&(e.species=i.species),typeof i.wings=="boolean"&&(e.wings=i.wings),wn.some(([h])=>h===i.race)&&(e.race=i.race);for(let[h,u]of Zs)u.some(([p])=>p===i[h])&&(e[h]=i[h]);typeof i.tail=="boolean"&&(e.tail=i.tail);for(let[h,u]of[["shape",[...Zi,...vi,...Tn,...bi,...yi,...Gr]],["limbs",Js]]){let p={};for(let[_,,v,m]of u){let f=Wi(i[h])?i[h][_]:void 0,b=jc[_]?.[0]?-1:v;Number.isFinite(f)&&(p[_]=Math.round(Math.max(b,Math.min(m,f))*1e3)/1e3)}Object.keys(p).length&&(e[h]=p)}let a={};for(let[h]of[...th,...wy,...Object.values(Ty).flat()])Wi(i.colours)&&qs(i.colours[h])&&(a[h]=i.colours[h]);Object.keys(a).length&&(e.colours=a);let l={};for(let[h,u]of[["top",Zr],["bottom",Kr]]){let p=Wi(i.underwear)?i.underwear[h]:void 0;(p===gt||u.some(([_])=>_===p))&&(l[h]=p)}if(Object.keys(l).length&&(e.underwear=l),Array.isArray(i.clothes)){let h=new Map;for(let u of i.clothes)Object.hasOwn($t,u)&&!h.has($t[u])&&h.set($t[u],u);e.clothes=[...h.values()]}let c={};for(let[h,u]of Object.entries(Wi(i.clothColours)?i.clothColours:{})){if(!Object.hasOwn($t,h)||!Wi(u))continue;let p={};for(let[_]of Qs)qs(u[_])&&(p[_]=u[_]);Object.keys(p).length&&(c[h]=p)}Object.keys(c).length&&(e.clothColours=c);let d={};for(let[h,u]of Object.entries(Wi(i.variants)?i.variants:{}))u&&sh[h]?.ways.some(([p])=>p===u)&&(d[h]=u);return Object.keys(d).length&&(e.variants=d),typeof i.preset=="string"&&i.preset.trim()&&(e.preset=i.preset.trim().slice(0,Ey)),e}var nl=[["male","Male body"],["female","Female body"]],Xc=[["human","Human"],["wolf","Anthro wolf"],["dragon","Anthro dragon"]],Qd={wolf:{head:1.18}},wn=[["human","Human"],["dwarf","Dwarf","race_dwarf",1,{height:.87,legs:.7,arms:.8,head:1.18}],["halfling","Halfling","race_halfling",1,{height:.58,legs:.86,arms:.9,head:1.2}],["gnome","Gnome","race_gnome",1,{height:.62,legs:.85,arms:.98,head:1.4}],["elf","Elf","race_elf",1,{height:1,legs:1.03,arms:1.02,head:.97}],["halfelf","Half-elf","race_elf",.5,{height:1,legs:1.015,arms:1.01,head:.985}],["halforc","Half-orc","race_halforc",1,{height:1.05,legs:1,arms:1.03,head:1}],["tiefling","Tiefling","race_tiefling",1,{height:1,legs:1,arms:1,head:1}]],yi=[["race_dwarf","Dwarf build",0,1,"Broad and stocky: thick limbs, big hands, a broad strong face.",["None","Full"]],["race_halfling","Halfling build",0,1,"A halfling's build and round, youthful face.",["None","Full"]],["race_gnome","Gnome build",0,1,"A gnome's build, big nose and round face.",["None","Full"]],["race_elf","Elf features",0,1,"Slender, with fine features and almond eyes (pointed ears are on the Face tab).",["None","Full"]],["race_halforc","Orc features",0,1,"Heavy-boned and strong, with a broad nose and jaw.",["None","Full"]],["race_tiefling","Tiefling features",0,1,"Sharper cheekbones and a narrower face.",["None","Full"]]];function ef(i,e="female"){let[,,t="",n=0,s={}]=wn.find(([a])=>a===i)??wn[0],r=Object.fromEntries(yi.map(([a])=>[a,a===t?n:0]));r.ears={elf:1,halfelf:.5}[i]??0;let o={halforc:$c[0][0],tiefling:qc[0][0]}[i];return{race:i,shape:r,height:s.height??1,limbs:{arms:s.arms??1,legs:s.legs??1,head:s.head??1},facialHair:i==="dwarf"&&e==="male"?"beard-02":gt,tusks:i==="halforc"?e==="male"?"tusks-02":"tusks-01":gt,horns:i==="tiefling"?"horns-01":gt,tail:i==="tiefling",...o?{skin:"custom",colours:{skin:o,eyes:i==="tiefling"?15253568:11569706}}:{}}}var il=i=>{let[,,e="",t=0,n={}]=wn.find(([s])=>s===i)??wn[0];return{key:e,weight:t,height:1,legs:1,arms:1,head:1,...n}},gy=[[gt,"None"],["moustache-01","Moustache"],["beard-05","Moustache and goatee"],["beard-01","Short beard"],["beard-02","Full beard"],["beard-03","Long beard"],["beard-04","Long beard with braids"]],_y=[[gt,"None"],["tusks-01","Small"],["tusks-02","Large"]],Yc=[[gt,"None"],["horns-03","Nubs"],["horns-01","Swept back"],["horns-02","Ram's curl"],["horns-04","Tall"]],Zs=[["facialHair",gy,"Facial hair","A beard or moustache, in the hair's colour."],["tusks",_y,"Tusks","A half-orc's lower tusks."],["horns",Yc,"Horns","A tiefling's horns."]],qc=[[11747898,"Red"],[4876968,"Blue"],[8014490,"Purple"]],$c=[[8227946,"Grey-green"],[9080706,"Grey"]],Zc=new Set(["head","brow","feet"]),Zi=[["weight","Weight",-1,1,"Thinner to heavier, all over.",["Thin","Heavy"]],["muscle","Muscle",-.5,1,"Softer to more muscular.",["Soft","Muscular"]],["chest","Chest",-.5,1,"A flatter or fuller chest (her bust).",["Flat","Full"]],["hips","Hips",-.5,1,"Narrower or wider hips and seat.",["Narrow","Wide"]],["waist","Waist",-1,.5,"A narrower or wider waist.",["Narrow","Wide"]],["belly","Belly",-.5,1,"A flatter or rounder belly.",["Flat","Round"]],["shoulders","Shoulders",-.5,1,"Narrower or broader shoulders.",["Narrow","Broad"]],["neck","Neck",-.5,1,"A slimmer or thicker neck.",["Slim","Thick"]]],vi=[["jaw","Jaw",-.5,1,"A softer or a squarer, stronger jaw and chin.",["Soft","Strong"]],["cheeks","Cheekbones",-.5,1,"Flatter or higher, fuller cheekbones.",["Flat","Full"]],["nose","Nose",-.5,1,"A smaller or larger nose.",["Small","Large"]],["eyes","Eyes",-.5,1,"Smaller or larger eyes.",["Small","Large"]],["ears","Pointed ears",0,1,"Round ears to long, pointed ones, as an elf's.",["Round","Pointed"]]],tf=[["eyes","Eyes","Where the eyes sit and their shape. Eye size is under Face shape."],["brows","Brows","The brow line. The brow hair's style and colour are below."],["nose","Nose","Its shape in detail. Overall size is under Face shape."],["mouth","Mouth and lips",""],["jaw","Jaw and chin",""],["cheeks","Cheeks",""],["ears","Ears","Pointed ears are under Face shape."],["head","Forehead, head and neck","Hair and hats follow the head's shape."]],Tn=[["eye_height","Height",-1,1,"Where the eyes sit on the face.",["Lower","Higher"],"eyes"],["eye_spacing","Spacing",-1,1,"Closer together or further apart.",["Close","Wide"],"eyes"],["eye_depth","Depth",-1,1,"Standing out or set deep under the brow.",["Prominent","Deep-set"],"eyes"],["eye_tilt","Tilt",-1,1,"The outer corners lower or higher than the inner.",["Down","Up"],"eyes"],["eye_opening","Opening",-1,1,"Narrower or wider open.",["Narrow","Wide"],"eyes"],["eyelid","Eyelids",-1,1,"More of the upper lid showing, or a heavier, hooded lid.",["Open","Hooded"],"eyes"],["eye_inner_fold","Inner fold",-1,1,"The fold of skin over the inner corner.",["Less","More"],"eyes"],["eye_bags","Under the eyes",-1,1,"Smooth or puffy under the eyes.",["Smooth","Puffy"],"eyes"],["brow_height","Height",-1,1,"The brows lower or higher.",["Lower","Higher"],"brows"],["brow_angle","Angle",-1,1,"The brows' outer ends lower or higher.",["Down","Up"],"brows"],["brow_ridge","Ridge",-1,1,"A flat brow, or a heavy ridge standing out.",["Flat","Heavy"],"brows"],["nose_length","Length",-1,1,"A shorter or longer nose, top to tip.",["Short","Long"],"nose"],["nose_width","Width",-1,1,"A narrower or wider nose.",["Narrow","Wide"],"nose"],["nose_depth","Projection",-1,1,"How far the nose stands out from the face.",["Flat","Projecting"],"nose"],["nose_bridge","Bridge",-1,1,"A scooped or a humped bridge.",["Scooped","Humped"],"nose"],["nose_tip","Tip",-1,1,"The tip turned down or up.",["Down","Up"],"nose"],["nose_tip_width","Tip width",-1,1,"A fine or a broad tip.",["Fine","Broad"],"nose"],["nostrils","Nostrils",-1,1,"Narrower or flared nostrils.",["Narrow","Flared"],"nose"],["nose_height","Height",-1,1,"The nose lower or higher on the face.",["Lower","Higher"],"nose"],["mouth_width","Width",-1,1,"A narrower or wider mouth.",["Narrow","Wide"],"mouth"],["mouth_height","Height",-1,1,"The mouth lower or higher on the face.",["Lower","Higher"],"mouth"],["mouth_depth","Depth",-1,1,"The mouth set back or pushed forward.",["Back","Forward"],"mouth"],["upper_lip","Upper lip",-1,1,"A thinner or fuller upper lip.",["Thin","Full"],"mouth"],["lower_lip","Lower lip",-1,1,"A thinner or fuller lower lip.",["Thin","Full"],"mouth"],["cupids_bow","Cupid's bow",-1,1,"A flat or a deeply curved upper lip line.",["Flat","Curved"],"mouth"],["mouth_corners","Corners",-1,1,"The corners of the mouth turned down or up.",["Down","Up"],"mouth"],["jaw_forward","Jaw forward",-1,1,"The lower jaw back (an overbite) or forward (an underbite).",["Back","Forward"],"jaw"],["jaw_width","Jaw width",-1,1,"A narrower or wider jaw at its angles.",["Narrow","Wide"],"jaw"],["chin_height","Chin height",-1,1,"A shorter or longer chin.",["Short","Long"],"jaw"],["chin_width","Chin width",-1,1,"A pointed or a broad chin.",["Pointed","Broad"],"jaw"],["chin_prominence","Chin forward",-1,1,"A receding or a prominent chin.",["Receding","Prominent"],"jaw"],["chin_cleft","Cleft",-1,1,"A smooth chin or a cleft in it.",["Smooth","Cleft"],"jaw"],["cheekbones","Cheekbones",-1,1,"Flat or high, strong cheekbones.",["Flat","High"],"cheeks"],["cheek_fullness","Fullness",-1,1,"Thinner or fuller cheeks.",["Thin","Full"],"cheeks"],["cheek_hollows","Hollows",-1,1,"Full under the cheekbones, or hollow.",["Full","Hollow"],"cheeks"],["ear_size","Size",-1,1,"Smaller or larger ears.",["Small","Large"],"ears"],["ear_angle","Angle",-1,1,"Ears lying flat or standing out.",["Flat","Out"],"ears"],["ear_lobes","Lobes",-1,1,"Smaller or larger lobes.",["Small","Large"],"ears"],["ear_height","Height",-1,1,"The ears lower or higher.",["Lower","Higher"],"ears"],["forehead_height","Forehead height",-1,1,"A lower or higher forehead.",["Low","High"],"head"],["forehead_slope","Forehead slope",-1,1,"A sloping or an upright forehead.",["Sloping","Upright"],"head"],["temples","Temples",-1,1,"Hollow or full temples.",["Hollow","Full"],"head"],["head_width","Head width",-1,1,"A narrower or wider head.",["Narrow","Wide"],"head"],["head_height","Head height",-1,1,"A shorter or taller head.",["Short","Tall"],"head"],["head_depth","Head depth",-1,1,"A shallower or deeper head, front to back.",["Shallow","Deep"],"head"],["neck_length","Neck length",-1,1,"A shorter or longer neck.",["Short","Long"],"head"],["cheeks_round_high","Round, high",0,1,"Round, chipmunk cheeks, high on the face.",["None","Round"],"cheeks"],["cheeks_round_low","Round, low",0,1,"Round, chipmunk cheeks, lower down.",["None","Round"],"cheeks"],["cheekbones_chubby","Soft cheekbones",0,1,"High cheekbones with soft, full flesh over them.",["None","Full"],"cheeks"],["jowls","Jowls",0,1,"Flesh hanging at the jaw line, as with age.",["None","Heavy"],"cheeks"],["cheeks_sunken","Sunken",0,1,"Cheeks sunk in below the cheekbones.",["None","Sunken"],"cheeks"],["ears_flared","Flared",0,1,"The top of the ears flaring out.",["None","Flared"],"ears"],["ears_flatter","Flatter",0,1,"The ears' folds flatter.",["None","Flat"],"ears"],["lobes_out","Lobes out",0,1,"The lobes turned out from the head.",["None","Out"],"ears"],["detail_ears","Ear detail",0,1,"Finer folds and rims in the ears.",["Plain","Detailed"],"ears"],["detail_ear_inner","Inner ear",0,1,"A deeper bowl inside the ear.",["Plain","Deep"],"ears"],["detail_ear_canal","Ear canal",0,1,"An opening into the ear.",["None","Open"],"ears"],["nose_bulbous","Bulbous",0,1,"A round, bulbous tip.",["None","Bulbous"],"nose"],["nose_base_wide","Wide base",0,1,"The nose wider where it meets the face.",["None","Wide"],"nose"],["nose_greek","Greek",0,1,"A straight line from the brow to the tip, as on a Greek statue.",["None","Greek"],"nose"],["nostrils_up","Nostrils up",0,1,"Nostrils turned up, showing more from the front.",["None","Up"],"nose"],["nostrils_small","Small nostrils",0,1,"Smaller nostril openings.",["None","Small"],"nose"],["nostrils_round","Round nostrils",0,1,"Rounder wings at the sides of the nostrils.",["None","Round"],"nose"],["detail_nose_crease","Crease",0,1,"The crease where the nostril wings meet the cheek.",["Plain","Creased"],"nose"],["detail_columella","Columella",0,1,"A straight strip of skin between the nostrils.",["Plain","Straight"],"nose"],["detail_nostril_rims","Nostril rims",0,1,"Sharper rims round the nostrils.",["Soft","Sharp"],"nose"]],nf=[["arms","Arms","Arm length is under Proportions."],["hands","Hands","The nails' length and colour are under Skin and eyes."],["legs","Legs","Leg length is under Proportions."],["torso","Torso and hips",""],["bust","Bust","Its size is the Chest slider above."]],bi=[["upper_arms","Upper arms",-1,1,"Slimmer or thicker upper arms.",["Slim","Thick"],"arms"],["forearms","Forearms",-1,1,"Slimmer or thicker forearms.",["Slim","Thick"],"arms"],["arm_muscle","Arm muscle",-1,1,"Softer or more muscular arms.",["Soft","Muscular"],"arms"],["thighs","Thighs",-1,1,"Slimmer or thicker thighs.",["Slim","Thick"],"legs"],["calves","Calves",-1,1,"Slimmer or thicker calves.",["Slim","Thick"],"legs"],["leg_muscle","Leg muscle",-1,1,"Softer or more muscular legs.",["Soft","Muscular"],"legs"],["buttocks","Buttocks",-1,1,"Flatter or fuller buttocks.",["Flat","Full"],"torso"],["torso_taper","Taper",-1,1,"A straight torso, or one narrowing from the shoulders.",["Straight","V-shaped"],"torso"],["back_muscle","Back",-1,1,"A narrower or broader, more muscled back.",["Narrow","Broad"],"torso"],["stomach_tone","Stomach",-1,1,"A softer or more toned stomach.",["Soft","Toned"],"torso"],["hip_width","Hip bones",-1,1,"Narrower or wider hip bones (Hips above is the hips and seat).",["Narrow","Wide"],"torso"],["bust_height","Height",-1,1,"The bust lower or higher.",["Lower","Higher"],"bust"],["bust_spacing","Spacing",-1,1,"Closer together or further apart.",["Close","Apart"],"bust"],["bust_shape","Shape",-1,1,"Rounder or more pointed.",["Round","Pointed"],"bust"],["bust_lift","Lift",-1,1,"Fuller below or above.",["Low","Lifted"],"bust"],["detail_upper_arms","Upper arm shape",0,1,"The shape of the upper arm's muscles.",["Plain","Shaped"],"arms"],["detail_forearms","Forearm shape",0,1,"The shape of the forearm's muscles.",["Plain","Shaped"],"arms"],["detail_wrists","Wrist bone",0,1,"The bone at the outside of the wrist.",["Plain","Showing"],"arms"],["detail_armpits","Armpits",0,1,"A truer hollow under the arm.",["Plain","Shaped"],"arms"],["elbow_dimples","Elbow dimples",0,1,"Soft dimples at the elbows.",["None","Dimpled"],"arms"],["detail_fingers","Fingers",0,1,"Truer fingers, with their joints.",["Plain","Shaped"],"hands"],["detail_palm","Palm",0,1,"The pad at the little finger's side of the palm.",["Plain","Shaped"],"hands"],["detail_thumb","Thumb pad",0,1,"The pad at the base of the thumb.",["Plain","Shaped"],"hands"],["knuckles_knobby","Knuckles",0,1,"Knobbly knuckles, as with age or hard work.",["Smooth","Knobbly"],"hands"]],Kc={shape:[["Round",{head_width:.4,cheek_fullness:.6,jaw_width:-.2,chin_width:.2,chin_height:-.3}],["Oval",{head_height:.3,jaw_width:-.3,chin_width:-.2}],["Square",{jaw_width:.8,chin_width:.6,head_width:.3}],["Heart",{jaw_width:-.6,chin_width:-.8,temples:.5,forehead_height:.3}],["Long",{head_height:.7,chin_height:.6,head_width:-.3}],["Diamond",{cheekbones:.8,jaw_width:-.4,chin_width:-.6,temples:-.4}]],eyes:[["Almond",{eye_opening:-.3,eye_tilt:.3}],["Round",{eye_opening:.6,eyelid:-.4}],["Upturned",{eye_tilt:.8}],["Downturned",{eye_tilt:-.7,eyelid:.3}],["Hooded",{eyelid:.9,eye_opening:-.2}],["Deep-set",{eye_depth:.8}],["Wide-set",{eye_spacing:.7}],["Close-set",{eye_spacing:-.7}],["Inner fold",{eye_inner_fold:.9,eyelid:.4,eye_opening:-.3}]],brows:[["Arched",{brow_angle:.6,brow_height:.3}],["Straight",{brow_angle:-.3}],["Heavy",{brow_ridge:.8,brow_height:-.4}],["Raised",{brow_height:.8}]],nose:[["Button",{nose_length:-.5,nose_tip:.5,nose_tip_width:.3,nose_depth:-.3}],["Roman",{nose_bridge:.8,nose_length:.4,nose_tip:-.3}],["Snub",{nose_tip:.9,nose_length:-.4}],["Narrow",{nose_width:-.6,nose_tip_width:-.5,nostrils:-.4}],["Broad",{nose_width:.6,nostrils:.7,nose_tip_width:.5}],["Scooped",{nose_bridge:-.8,nose_tip:.4}]],mouth:[["Full lips",{upper_lip:.8,lower_lip:.8}],["Thin lips",{upper_lip:-.7,lower_lip:-.6}],["Wide",{mouth_width:.7}],["Small",{mouth_width:-.6,upper_lip:.2,lower_lip:.2}],["Bow-shaped",{cupids_bow:.9,upper_lip:.4}],["Smiling corners",{mouth_corners:.6}]],jaw:[["Strong",{jaw_width:.7,chin_width:.5,chin_prominence:.4}],["Soft",{jaw_width:-.6,chin_width:-.3}],["Pointed chin",{chin_width:-.9,chin_height:.3}],["Underbite",{jaw_forward:.9,chin_prominence:.4}],["Overbite",{jaw_forward:-.8,chin_prominence:-.4}],["Cleft chin",{chin_cleft:.9}]],cheeks:[["High cheekbones",{cheekbones:.8,cheek_hollows:.3}],["Full cheeks",{cheek_fullness:.8,cheek_hollows:-.4}],["Gaunt",{cheek_fullness:-.6,cheek_hollows:.8,temples:-.3}]],ears:[["Small and flat",{ear_size:-.5,ear_angle:-.6}],["Large",{ear_size:.7,ear_lobes:.4}],["Sticking out",{ear_angle:.9}]],head:[["High forehead",{forehead_height:.8}],["Long neck",{neck_length:.8}],["Short neck",{neck_length:-.7}]]},sl=[["semireal","Semi-real","The body and face as made.",{shape:{},limbs:{head:1}}],["anime","Anime proportions (trial)","Large eyes set low and apart, a small nose and mouth, a narrow pointed chin and a slightly larger head. A trial on the semi-real head: the anime look itself (its eyes, flat shading and outlines) is still to come.",{shape:{eyes:1,eye_height:-.35,eye_spacing:.35,eye_opening:.7,eye_tilt:.15,eyelid:-.5,eye_depth:-.5,brow_ridge:-.8,brow_height:.4,nose:-.5,nose_width:-.6,nose_depth:-.6,nose_length:-.4,nostrils:-.8,nose_tip:.4,nose_bridge:-.4,mouth_width:-.5,upper_lip:-.5,lower_lip:-.2,jaw:-.5,jaw_width:-.7,chin_width:-.8,chin_height:-.2,chin_prominence:-.2,cheeks:-.3,cheekbones:-.4,cheek_fullness:.3,cheek_hollows:-.6,forehead_height:.5,head_height:.2,head_width:.1},limbs:{head:1.1}}]],Gc=([i])=>!i.startsWith("detail_"),sf=[...vi.map(([i])=>i),...Tn.filter(Gc).map(([i])=>i)],Jc=i=>i==="shape"?Tn.filter(Gc).filter(([,,,,,,e])=>["jaw","cheeks","head"].includes(e)).map(([e])=>e):Tn.filter(Gc).filter(([,,,,,,e])=>e===i).map(([e])=>e),Gr=[["muzzle","Muzzle",-1,1,"A shorter or a longer muzzle.",["Short","Long"],"face"],["earSize","Ears",-1,1,"Smaller or taller ears.",["Small","Tall"],"face"],["horns","Horns",-1,1,"Smaller or larger horns.",["Small","Large"],"face"],["tailLength","Tail length",-1,1,"A shorter or a longer tail.",["Short","Long"],"build"],["tail","Tail thickness",0,1,"A slim tail to a thicker one.",["Slim","Thick"],"build"]],jc={weight:["thin","heavy"],neck:["neck_slim","neck"],ears:[null,"ears_pointed"],muzzle:["muzzle_short","muzzle"],earSize:["ears_small","ears_tall"],horns:["horns_small","horns"],tailLength:["tail_short","tail_long"],eyes:["eye_size.lo","eyes"],...Object.fromEntries([...Tn,...bi].map(([i])=>[i,[`${i}.lo`,`${i}.hi`]]))},Qc=(i,e)=>jc[i]??[null,i==="chest"&&e==="female"?"bust":i],Ks=(i,e,t)=>e.includes(Qc(i,t)[1]),rl=([i,,e,t],n)=>[n.includes(jc[i]?.[0])?-1:e,t],rf=(i,[e,t])=>i<0?-i/e:i/t,of=(i,[e,t])=>i<0?-i*e:i*t,Js=[["arms","Arm length",.75,1.2,"Shorter or longer arms, no thicker.",["Short","Long"]],["legs","Leg length",.65,1.2,"Shorter or longer legs, no thicker. Longer legs stand taller.",["Short","Long"]],["head","Head size",.85,1.45,"A smaller or larger head (and its hair).",["Small","Large"]]],af={shape:{...Object.fromEntries([...Zi,...vi,...Tn,...bi,...yi,...Gr].map(([i])=>[i,0])),detail_ears:1,detail_ear_inner:.5,detail_ear_canal:.6,detail_nose_crease:.6,detail_nostril_rims:.5,detail_fingers:1,detail_palm:.6,detail_thumb:.6,detail_armpits:1,detail_wrists:.5},limbs:Object.fromEntries(Js.map(([i])=>[i,1])),height:1},eh=[["young","Young adult"],["middle","Middle-aged (about 50)"],["old","Old (about 72)"]],el=[["caucasian","Caucasian"],["african","African"],["asian","Asian"],["custom","A colour of your own"]],Wr=[["creamy","Creamy",["female"]],["redhead","Redhead's",["female"]],["freckles","Light, freckled",["female","male"]],["ginger","Light, ginger",["female","male"]],["bronze","Bronzed",["female","male"]],["eurasian-young","Eurasian, young",["female"]],["eurasian-middle","Eurasian, middle-aged",["female"]],["eurasian-old","Eurasian, old",["female","male"]],["aksel","Fair, weathered",["male"]],["natural-makeup","Light, natural make-up",["female"]],["classic-makeup","Light, make-up",["female"]],["violet-makeup","Light, violet make-up",["female"]],["bronze-makeup","Bronzed, make-up",["female"]],["eyeliner","Light, eyeliner",["male"]],["goth-makeup","Light, goth make-up",["male"]],["emo-eyes","Light, dark eye make-up",["male"]],["tattooed","Tattooed",["male"]]],ol=i=>[...el.slice(0,-1),...Wr.filter(([,,e])=>e.includes(i)).map(([e,t])=>[e,t]),...el.slice(-1)],lf=(i,e,t)=>i==="custom"?null:Wr.some(([n])=>n===i)?`avatar-${e}-skin-${i}`:`avatar-${e}-skin-${t}-${i}`,On="tint",Xr=[["brownlight","Brown"],["brown","Red-brown"],["green","Green"],["bluegreen","Blue-green"],["blue","Blue"],["lightblue","Light blue"],["deepblue","Deep blue"],["grey","Grey"],["ice","Ice"],["amber","Amber"],["hazel","Hazel"],["seabreeze","Sea green"],["clearblue","Clear blue"],["steel","Steel grey"],["darkbrown","Dark brown"],["sapphire","Sapphire"],["cat-blue","Cat's eye, blue"],["cat-brown","Cat's eye, brown"],["cat-green","Cat's eye, green"],["cat-sapphire","Cat's eye, sapphire"],["cat-yellow","Cat's eye, yellow"],["reptile","Reptile, fiery"],["dragon","Dragon"],["anime-navy","Anime, navy (trial)"]],Yr=5,xy=16,yy=6,cf={13:"Thin, fine hairs",14:"Natural, fine hairs",15:"Thick, fine hairs",16:"Arched, fine hairs"},hf={5:"Natural, fine",6:"Full, fine"},qr=[[3877406,"Dark brown"],[7031338,"Brown"],[9071162,"Hazel"],[10123818,"Amber"],[5208639,"Green"],[4157322,"Blue"],[8030874,"Grey"],[5917306,"Violet"]],vy=[[12088428,"Rose"],[13208190,"Pale pink"],[10113096,"Deep rose"],[11024954,"Red"],[6957626,"Berry"],[8014394,"Brown"],[4860458,"Dark"]],by=[[15780028,"Natural"],[16050400,"Pale"],[12595258,"Red"],[14192808,"Pink"],[3824282,"Blue"],[2779722,"Green"],[1710618,"Black"]],$r=[[15262940,"Off-white"],[16185078,"White"],[14207144,"Cream"],[9079434,"Grey"],[2763310,"Black"],[3820154,"Navy"],[9058874,"Red"],[4876874,"Green"],[6965810,"Brown"],[13672624,"Pink"],[6965882,"Violet"]],th=[["skin","Skin",$n,"The skin all over."],["eyes","Eyes",qr,"The colour of the eyes."],["lips","Lips",vy,"The lips."],["nails","Nails",by,"Finger and toe nails."],["brows","Brows",qi,"Eyebrows and lashes (else the hair's colour, a little darker)."],["underwear","Underwear",$r,"The underwear's cloth."]],Xi=[[7235682,"Grey",15261648],[9407104,"Timber grey",15261648],[11118756,"Silver",16052714],[15328990,"White",16052714],[2367775,"Black",3814963],[6046771,"Brown",13216124],[9065008,"Red",15261648],[10846810,"Tawny",15261648],[14207144,"Cream",16052714]],Sy=[[15261648,"Cream"],[16052714,"White"],[12762806,"Pale grey"],[13216124,"Tan"],[8223348,"Grey"],[3814963,"Charcoal"]],nh=[[2828069,"Black"],[4008738,"Dark brown"],[6964792,"Liver"],[12618372,"Pink"]],tl=[[14260779,"Amber"],[14726714,"Gold"],[14207050,"Yellow"],[14711326,"Orange"],[7031338,"Brown"],[6261311,"Green"],[9091288,"Ice blue"],[4157338,"Blue"],[11545122,"Red"],[8014490,"Violet"]],ih=[[2828326,"Black"],[4865331,"Dark horn"],[9073752,"Horn"],[14208436,"Bone"],[15789282,"White"]],Yi=[[2763310,"Black",6974064],[3104666,"Blue",14271114],[12098122,"Brass",14998728],[9071162,"Bronze",14271114],[12085818,"Copper",14998728],[13936682,"Gold",15787720],[4160063,"Green",14271114],[10496546,"Red",14271114],[11843776,"Silver",15133422],[15133422,"White",11059416]],My=[[14271114,"Pale gold"],[14998728,"Bone"],[15787720,"Cream"],[15133422,"White"],[6974064,"Ash"],[3815998,"Charcoal"],[11059416,"Pale blue"],[11061408,"Pale green"],[14198944,"Rose"]],Ki=[[14141863,"Bone"],[15788760,"Ivory"],[6967352,"Horn brown"],[2762790,"Black"],[9078916,"Grey"],[13148240,"Gold"]],wy=[["horns","Horns",Ki,"The horns."]],Ty={wolf:[["fur","Fur",Xi,"The coat: the back, head, limbs and tail. The neck ruff's tufts follow it."],["fur2","Lighter fur",Sy,"The muzzle, throat, chest, belly and the tail's underside."],["nose","Nose",nh,"The nose and the paw pads."],["eyes","Eyes",tl,"The colour of the eyes."],["claws","Claws",ih,"The claws on hands and feet."]],dragon:[["scales","Scales",Yi,"The scales all over: the back, head, limbs, tail and wings."],["scales2","Underside",My,"The throat, chest, belly and the wings' skin."],["horns","Horns",Ki,"The horns, spines and claws."],["eyes","Eyes",tl,"The colour of the eyes."]]};var Zr=[["bra","Bra"],["sports_bra","Sports bra"],["bralette","Bralette"],["undershirt","Undershirt"]],Kr=[["briefs","Briefs"],["boxer_briefs","Boxer briefs"],["boxers","Boxers"],["boyshorts","Boyshorts"],["bikini","Bikini"],["thong","Thong"]],js=[["head","Head","A hood, a helm or a hat. Most hide the hair.","head"],["brow","Brow","A circlet on the brow.","head"],["face","Glasses","Glasses or a mask over the eyes.","accessories"],["mouth","Face mask","A mask over the mouth and nose.","accessories"],["ears","Earrings","A pair of earrings.","accessories"],["neck","Neck","A scarf.","accessories"],["back","Cloak or coat","Worn over everything else.","body"],["body","Whole outfit","A dress, gown, robe or one-piece: top and legs in one.","body"],["top","Shirt or top","Next to the skin, under everything else.","tops"],["over","Over the shirt","A tunic, vest, corset, padded gambeson or jacket.","tops"],["armour","Body armour","Mail, scale, brigandine, leather or a harness.","armour"],["plate","Breastplate","A plate cuirass, over mail or a gambeson.","armour"],["shoulders","Shoulders","Plate pauldrons.","armour"],["arms","Forearms","Leather bracers.","hands"],["hands","Hands","Gloves or plate gauntlets.","hands"],["fingers","Rings","A ring. Gloves hide it.","accessories"],["waist","Belt","A belt with pouches.","accessories"],["apron","Apron","A work apron, as a smith or a cook wears.","accessories"],["legs","Legs","Trousers, skirts, shorts and the like.","legs"],["thighs","Thigh plates","Plate tassets hung from the waist.","armour"],["shins","Shins","Plate greaves.","armour"],["socks","Socks","Socks or leg warmers, under the shoes.","feet"],["feet","Feet","Boots, shoes or sandals.","feet"]],uf=[["nails","Fingernails","Short, medium or long.","hands"],["toenails","Toenails","On the toes.","feet"]],al=[["short","Short"],["medium","Medium"],["long","Long"],["none","None"]],Ay={nails:["hands"],toenails:["feet","socks"],fingers:["hands"]},ll=(i,e)=>(Ay[i]??[]).some(t=>e.has(t)),Jr=[["hood","Hood","head"],["helm","Open helm","head"],["full_helm","Full helm","head"],["mh_fedora","Fedora","head"],["mh_fedora_cocked","Fedora, tilted","head"],["circlet","Circlet","brow"],["scarf","Scarf","neck"],["cloak","Cloak","back"],["long_coat","Long coat","back"],["dress","Dress","body"],["gown","Gown","body"],["robe","Robe","body"],["one_piece_swimsuit","Swimsuit","body"],["mh_workwear","Work overalls and shirt","body"],["shirt","Linen shirt","top"],["t_shirt","T-shirt","top"],["tank_top","Tank top","top"],["crop_top","Crop top","top"],["blouse","Blouse","top"],["bikini_top","Bikini top","top"],["mh_tee","Tee","top"],["mh_long_tee","Long tee","top"],["mh_longsleeve_tee","Long-sleeved tee","top"],["mh_denim_shirt","Denim shirt","top"],["mh_plaid_shirt","Plaid shirt","top"],["mh_female_tee","Tee","top"],["mh_female_loose_tee","Loose tee","top"],["mh_female_sport_top","Sports top","top"],["tunic","Tunic","over"],["vest","Vest","over"],["corset","Corset","over"],["gambeson","Gambeson","over"],["mh_jacket","Jacket","over"],["mh_suit_jacket","Suit jacket","over"],["mh_female_blazer","Blazer","over"],["chainmail","Chainmail","armour"],["scale_mail","Scale mail","armour"],["brigandine","Brigandine","armour"],["leather_armour","Leather armour","armour"],["bikini_armour","Bikini armour","armour"],["barbarian_harness","Barbarian harness","armour"],["plate_cuirass","Plate cuirass","plate"],["pauldrons","Pauldrons","shoulders"],["bracers","Bracers","arms"],["gloves","Leather gloves","hands"],["gauntlets","Gauntlets","hands"],["belt_pouches","Belt and pouches","waist"],["apron","Apron","apron"],["trousers","Trousers","legs"],["leggings","Leggings","legs"],["shorts","Shorts","legs"],["skirt","Long skirt","legs"],["short_skirt","Short skirt","legs"],["pleated_skirt","Pleated skirt","legs"],["loincloth","Loincloth","legs"],["swim_trunks","Swim trunks","legs"],["bikini_bottom","Bikini bottom","legs"],["mh_jeans","Jeans","legs"],["mh_jeans_dark","Dark jeans","legs"],["mh_suit_trousers","Suit trousers","legs"],["mh_overalls","Overalls","legs"],["mh_female_jeans","Jeans","legs"],["mh_female_leggings","Leggings","legs"],["mh_female_shorts","Shorts","legs"],["mh_female_skirt","Skirt","legs"],["tassets","Tassets","thighs"],["greaves","Greaves","shins"],["boots","Boots","feet"],["tall_boots","Tall boots","feet"],["shoes","Shoes","feet"],["sandals","Sandals","feet"],["sabatons","Sabatons","feet"],["mh_boots_black","Black boots","feet"],["mh_shoes_black","Black shoes","feet"],["mh_shoes_brown","Brown shoes","feet"],["mh_trainers_white","White trainers","feet"],["mh_trainers_blue","Blue trainers","feet"],["mh_trainers_worn","Worn trainers","feet"],["nails_short","Short nails","nails"],["nails_medium","Medium nails","nails"],["nails_long","Long nails","nails"],["toenails","Toenails","toenails"]],$t=Object.fromEntries(Jr.map(([i,,e])=>[i,e])),Si={};function df(i){for(let e of i)Object.hasOwn($t,e.piece)||(Jr.push([e.piece,e.label,e.slot]),$t[e.piece]=e.slot,Si[e.piece]=e)}var sh={cloak:{label:"Hood",says:"The cloak's hood down on the shoulders, or up over the head (which hides the hair).",ways:[["","Down"],["hood_up","Up"]]}},Qs=[["cloth","Cloth"],["nail","Nail"],["trim","Trim"],["lining","Lining"],["bodice","Bodice"],["shirt","Shirt"],["suit","Suit"],["under","Underlayer"],["felt","Felt"],["laces","Laces"],["cord","Cord"],["leather","Leather"],["belt","Belt"],["pouch","Pouches"],["fur","Fur"],["sole","Soles"],["shoe","Shoe"],["sock","Sock"],["mail","Mail"],["scale","Scales"],["plate","Plate"],["metal","Metal fittings"],["gem","Gem"],["frame","Frame"]],er=[[15261900,"Undyed linen"],[16053488,"White"],[2763310,"Black"],[8026746,"Grey"],[6965810,"Brown"],[10123858,"Tan"],[9054762,"Red"],[6957642,"Wine"],[11565610,"Ochre"],[5925418,"Olive"],[3103290,"Green"],[3099258,"Blue"],[2042442,"Navy"],[5913210,"Purple"],[12618394,"Rose"],[12105920,"Steel"],[13148240,"Brass"],[14202976,"Gold"]],rh={"clothes-a":14734520,"clothes-b":8223306,"clothes-blue":4876954,"clothes-red":11561578,"clothes-teal":5212792,"clothes-plum":7688303,"clothes-grey":9079434,"ranger-a":4151861,"ranger-b":11573872,"ranger-wine":6961754,"ranger-dusk":4543866,"ranger-rust":10115637,"ranger-moss":6978111,"ranger-grey":7303023};var Ey=40;var oh=[{name:"Everyday man",look:{body:"male"}},{name:"Broad smith",look:{body:"male",shape:{weight:.35,muscle:.8,shoulders:.7,neck:.5,jaw:.5},limbs:{arms:1.04},height:1.04}},{name:"Lean ranger",look:{body:"male",shape:{weight:-.45,muscle:.35,cheeks:.4},limbs:{legs:1.05},height:1.05}},{name:"Stout elder",look:{body:"male",shape:{weight:.7,belly:.8,muscle:-.2},age:"old",hairColour:7,hair:"short",height:.95}},{name:"Male elf",look:{body:"male",race:"elf",shape:{weight:-.35,jaw:-.2,cheeks:.6,ears:1},hair:"long",hairColour:4,height:1.06}},{name:"Everyday woman",look:{body:"female"}},{name:"Strong woman",look:{body:"female",shape:{muscle:.8,shoulders:.5,weight:.15},height:1.04}},{name:"Slender woman",look:{body:"female",shape:{weight:-.5,waist:-.4,hips:.2},limbs:{legs:1.05}}},{name:"Curvy woman",look:{body:"female",shape:{weight:.3,chest:.6,hips:.7,waist:-.3}}},{name:"Female elf",look:{body:"female",race:"elf",shape:{weight:-.4,cheeks:.6,eyes:.3,ears:1},hair:"long",hairColour:4,height:1.04}},...["dwarf","halfling","gnome","halfelf","halforc","tiefling"].map(i=>({name:wn.find(([e])=>e===i)[1],look:{race:i}})),...[["Grey wolf",0,14260779],["White wolf",3,9091288],["Black wolf",4,14726714]].map(([i,e,t])=>({name:i,look:{species:"wolf",colours:{fur:Xi[e][0],fur2:Xi[e][2],eyes:t}}})),...[["Red dragon",7,14726714],["Gold dragon",5,14711326],["Blue dragon",1,14207050],["Silver dragon",8,9091288]].map(([i,e,t])=>({name:i,look:{species:"dragon",colours:{scales:Yi[e][0],scales2:Yi[e][2],eyes:t}}}))].map(i=>({...i,look:$i(i.look)})),jr=[{name:"Peasant",male:["tunic","trousers","shoes"],female:["blouse","skirt","shoes"],clothColours:{tunic:{cloth:10123858},skirt:{cloth:6965810},trousers:{cloth:6965810}}},{name:"Townsperson",male:["shirt","vest","trousers","shoes"],female:["dress","shoes"],clothColours:{vest:{cloth:3099258},dress:{cloth:3103290}}},{name:"Ranger",both:["shirt","leather_armour","trousers","tall_boots","gloves","cloak"],clothColours:{cloak:{cloth:3103290},trousers:{cloth:5925418}},variants:{cloak:"hood_up"}},{name:"Mage",both:["robe","shoes","circlet"],clothColours:{robe:{cloth:2042442,trim:13148240}}},{name:"Knight",both:["gambeson","chainmail","plate_cuirass","pauldrons","gauntlets","trousers","tassets","greaves","sabatons","full_helm"]},{name:"Barbarian",male:["loincloth","barbarian_harness","bracers","sandals"],female:["bikini_armour","loincloth","bracers","sandals"]},{name:"Beach",male:["swim_trunks","sandals"],female:["bikini_top","bikini_bottom","sandals"],clothColours:{swim_trunks:{cloth:3099258},bikini_top:{cloth:9054762},bikini_bottom:{cloth:9054762}}},{name:"Modern casual",male:["mh_tee","mh_jeans","mh_trainers_white"],female:["mh_female_tee","mh_female_jeans","mh_trainers_white"]}];function cl(i,e){let t=i[e]??i.both??[],n=(s={})=>Object.fromEntries(Object.entries(s).filter(([r])=>t.includes(r)));return $i({clothes:t,clothColours:n(i.clothColours),variants:n(i.variants)})}var Fn=64,Qr=16777215,Cy=2048,Ry=()=>typeof globalThis.document?.createElement("canvas")?.getContext=="function",hl=new Map;function pf(i){if(!hl.has(i)){let e=new Promise((t,n)=>{let s=new Image;s.decoding="async",s.onload=()=>t(s),s.onerror=()=>n(new Error(`the picture ${i} couldn't be loaded`)),s.src=ja(i.endsWith(".png")?i:`${i}.webp`)});e.catch(()=>hl.delete(i)),hl.set(i,e)}return hl.get(i)}var ah=new Map;function Iy(i,e){let t=`${i}:${e}`;if(!ah.has(t)){let n=pf(`avatar-${i}-masks.png`).then(s=>{let r=document.createElement("canvas");r.width=r.height=e;let o=r.getContext("2d",{willReadFrequently:!0});o.drawImage(s,0,0,e,e);let{data:a}=o.getImageData(0,0,e,e),l=new Uint8Array(e*e),c=Math.ceil(e/Fn),d=new Set;for(let h=0;h<l.length;h++)l[h]=a[h*4+1],l[h]&&d.add(Math.floor(Math.floor(h/e)/Fn)*c+Math.floor(h%e/Fn));return{lips:l,tiles:[...d].map(h=>({x:h%c*Fn,y:Math.floor(h/c)*Fn}))}}).catch(()=>null);ah.set(t,n)}return ah.get(t)}var Zn=new Map,Py=3,ff=i=>[i>>16&255,i>>8&255,i&255];async function mf({sex:i,base:e,skin:t=Qr,lips:n=Qr}){if(!Ry()||t===Qr&&n===Qr)return null;let s=[i,e,t,n].join("|");if(Zn.has(s)){let u=Zn.get(s);return Zn.delete(s),Zn.set(s,u),u}let r=await pf(e),o=Math.max(Cy,r.naturalWidth||r.width),a=await Iy(i,o),l=document.createElement("canvas");l.width=l.height=o;let c=l.getContext("2d",{willReadFrequently:!0});c.drawImage(r,0,0,o,o);let d=a?a.tiles.map(({x:u,y:p})=>c.getImageData(u,p,Fn,Fn)):[];if(t!==Qr&&(c.globalCompositeOperation="multiply",c.fillStyle=`#${t.toString(16).padStart(6,"0")}`,c.fillRect(0,0,o,o),c.globalCompositeOperation="source-over"),a){let[u,p,_]=ff(t),[v,m,f]=ff(n);a.tiles.forEach(({x:b,y:T},y)=>{let w=d[y],S=w.data;for(let E=0;E<Fn;E++)for(let g=0;g<Fn;g++){let A=a.lips[(T+E)*o+b+g]/255,R=(E*Fn+g)*4;S[R]=S[R]*(u+(v-u)*A)/255,S[R+1]=S[R+1]*(p+(m-p)*A)/255,S[R+2]=S[R+2]*(_+(f-_)*A)/255}c.putImageData(w,b,T)})}let h=new yr(l);for(h.flipY=!1,h.colorSpace=yt,h.name=`${e}-painted`,h.userData.shared=!0,Zn.set(s,h);Zn.size>Py;){let[u]=Zn.keys();Zn.get(u).dispose(),Zn.delete(u)}return h}function Ji(i){let e=2166136261;for(let t=0;t<i.length;t++)e^=i.charCodeAt(t),e=Math.imul(e,16777619);return e>>>0}function tr(i){let e=i>>>0;return()=>{e=e+1831565813|0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}var lh=i=>`#${(i>>>0).toString(16).padStart(6,"0").slice(-6)}`,gf=i=>/^#?[0-9a-f]{6}$/iu.test(i??"")?parseInt(i.replace("#",""),16):null;async function nr(i,e=2e4){try{let t=await fetch(i,{headers:{Accept:"application/json"},signal:AbortSignal.timeout(e)});return t.ok?await t.json():null}catch{return null}}var Mf={Head:"head",neck_01:"neck",spine_01:"torso",spine_02:"torso",spine_03:"torso",clavicle_l:"torso",clavicle_r:"torso",pelvis:"hips",upperarm_l:"upperarms",upperarm_r:"upperarms",lowerarm_l:"forearms",lowerarm_r:"forearms",hand_l:"hands",hand_r:"hands",...Object.fromEntries(["l","r"].flatMap(i=>["thumb","index","middle","ring","pinky"].flatMap(e=>[1,2,3].map(t=>[`${e}_0${t}_${i}`,"hands"])))),thigh_l:"thighs",thigh_r:"thighs",calf_l:"calves",calf_r:"calves",foot_l:"feet",foot_r:"feet",ball_l:"feet",ball_r:"feet"},_f=!0;var wf=[...new Set(Object.values(Mf)),"underwear","underwear-top","underwear-bottom","hair"],Ly=new Set(["skin","nails","underwear","underwear_trim","fur","fur2","fur_tufts","fur2_tufts","nose","claws","scales","scales2","horns"]),Ny=new Set(["neck","back","armour","plate"]),Dy=(i,e)=>i==="human"?`avatar-${e}`:`anthro-${i}-${e}`,Uy={arms:[["upperarm_l","lowerarm_l"],["lowerarm_l","hand_l"],["upperarm_r","lowerarm_r"],["lowerarm_r","hand_r"]],legs:[["thigh_l","calf_l"],["calf_l","foot_l"],["thigh_r","calf_r"],["calf_r","foot_r"]]},ji=16777215,xf={male:[1,2,4,9,10,12],female:[3,5,6,7,8,11]},yf={male:[1,3],female:[2,4]},Oy=i=>i<.65?"young":i<.9?"middle":"old",Fy=[0,3,4,5,6,7,8,9,10,11,12].map(i=>er[i][0]),By=[6,7,10,12,13,2].map(i=>er[i][0]),ky=[0,3,4,5].map(i=>er[i][0]),ch=[{job:"townsperson",share:40,male:[["shirt","vest","trousers","shoes"],["shirt","tunic","trousers","boots"]],female:[["dress","shoes"],["blouse","skirt","shoes"],["blouse","corset","skirt","shoes"]]},{job:"farmer",share:22,male:[["tunic","trousers","boots"]],female:[["tunic","skirt","boots"],["blouse","skirt","boots"]]},{job:"smith",share:8,male:[["shirt","trousers","boots","apron"]],female:[["shirt","trousers","boots","apron"]]},{job:"guard",share:14,male:[["gambeson","trousers","boots"],["shirt","brigandine","trousers","boots"]],female:[["gambeson","trousers","boots"],["shirt","brigandine","trousers","boots"]]},{job:"noble",share:8,dyes:By,male:[["shirt","long_coat","trousers","tall_boots"]],female:[["gown","shoes"],["blouse","long_coat","skirt","tall_boots"]]},{job:"priest",share:8,dyes:ky,male:[["robe","sandals"]],female:[["robe","sandals"]]}];function zy(i,e){let t=tr(Ji(`${i||"wanderer"}:clothes`)),n=t()*ch.reduce((c,d)=>c+d.share,0),s=ch.find(c=>(n-=c.share)<0)??ch[0],r=s[e]??s.male,o=r[Math.floor(t()*r.length)],a=s.dyes??Fy,l={};for(let c of o){let d=a[Math.floor(t()*a.length)];["apron","boots","shoes","tall_boots","sandals"].includes(c)||(l[c]=c==="gown"?{bodice:d,cloth:d}:{cloth:d})}return{job:s.job,clothes:o,clothColours:l}}var ir=(i,e,t)=>Math.max(e,Math.min(t,i)),Mi=(i,e,t)=>{let n=s=>Math.round((i>>s&255)*(1-t)+(e>>s&255)*t);return n(16)<<16|n(8)<<8|n(0)};function Vy(i,e="auto",t={}){let{sex:n,gender:s}=Xd(i,e,t),r=Xc.some(([se])=>se===t.species)?t.species:"human",o=r!=="human",a=!o&&wn.some(([se])=>se===t.race)?t.race:"human",l=tr(Ji(`${i||"wanderer"}:avatar-race`)),c=se=>se[Math.floor(l()*se.length)],d={facialHair:a==="dwarf"&&n==="male"?c(["beard-02","beard-03","beard-04","beard-04"]):gt,tusks:a==="halforc"?n==="male"?c(["tusks-01","tusks-02"]):"tusks-01":gt,horns:a==="tiefling"?c(Yc.slice(1))[0]:gt},{key:h,weight:u,...p}=il(a),_=!!h&&t.shape?.[h]===void 0,v=se=>_?p[se]:1,m={halforc:$c,tiefling:qc}[a],f=m?c(m)[0]:void 0,b=tr(Ji(`${i||"wanderer"}:avatar`)),T=se=>(b()+b()-1)*se,y={weight:.5,muscle:.35,chest:.35,hips:.3,waist:.3,belly:.25,shoulders:.3,neck:.25},w={};for(let[se,,Ue,Ye]of[...Zi,...vi]){let Ie=se==="ears"?{elf:1,halfelf:.5}[a]??0:ir(T(y[se]??.35),Ue,Ye);w[se]=t.shape?.[se]??Math.round(Ie*100)/100}let S={};for(let[se]of[...Tn,...bi])w[se]=t.shape?.[se]??0;for(let[se]of yi)w[se]=t.shape?.[se]??(_&&se===h?u:0);for(let[se,,Ue,Ye]of Js){let Ie=t.limbs?.[se]??Math.round(ir(1+T(se==="head"?.02:.03),Ue,Ye)*1e3)/1e3;S[se]=ir(Ie*v(se),Ue,Ye)}let E=.94+b()*.12,g=Math.floor(b()*$n.length),A=qr[Math.floor(b()*7)][0],R=Wc[n][Math.floor(b()*Wc[n].length)],P=Math.floor(b()*jd),O=$r[Math.floor(b()*4)][0],k=t.colours?.skin??t.skinTint??(Number.isInteger(t.skin)?$n[t.skin][0]:void 0),I=k??f??$n[g][0],F=ol(n).some(([se])=>se===t.skin)?t.skin:Wr.some(([se])=>se===t.skin)?"caucasian":(k??f)!==void 0?"custom":["caucasian","asian","african"][Math.floor(g*3/$n.length)],$=F!=="custom",X=tr(Ji(`${i||"wanderer"}:avatar-age`)),ne=Oy(X()),q=xf[n][Math.floor(X()*xf[n].length)],K=yf[n][Math.floor(X()*yf[n].length)],ee=tr(Ji(`${i||"wanderer"}:avatar-anthro`));for(let[se,,Ue,Ye]of Gr){let Ie=ir((ee()+ee()-1)*.35,Ue,Ye);w[se]=t.shape?.[se]??Math.round(Ie*100)/100}let be=t.colours??{},Se=(se,Ue,Ye)=>se.find(([Ie])=>Ie===Ue)?.[2]??Mi(Ue,Ye,.6),tt=Xi[Math.floor(ee()*Xi.length)][0],He=Yi[Math.floor(ee()*Yi.length)][0],te=tl[Math.floor(ee()*5)][0],[H,G]=[be.fur??tt,be.scales??He],oe=t.hairTint??qi[t.hairColour??P][0],Te=zy(i,n),de=(t.clothes??Te.clothes).filter(se=>!o||!Zc.has($t[se])),Ne={};for(let se of de){let Ue={...t.clothes?{}:Te.clothColours[se],...t.clothColours?.[se]};Object.keys(Ue).length&&(Ne[se]=Ue)}let Ze={skin:I,eyes:be.eyes??(o?te:{halforc:11569706,tiefling:15253568}[a]??A),...o?{}:{horns:be.horns??Ki[3][0]},...r==="wolf"?{fur:H,fur2:be.fur2??Se(Xi,H,15788248),nose:be.nose??nh[0][0],claws:be.claws??ih[0][0]}:{},...r==="dragon"?{scales:G,scales2:be.scales2??Se(Yi,G,15787720),horns:be.horns??Ki[0][0]}:{},lips:t.colours?.lips??($?ji:I===f?Mi(I,0,.3):Mi(Mi(I,10502208,.35),0,.12)),nails:t.colours?.nails??($?ji:Mi(I,16180960,.4)),brows:t.colours?.brows??Mi(oe,0,.25),underwear:t.colours?.underwear??t.tints?.top??rh[t.colour]??rh[t.rangerColour]??O};return{body:n,species:r,wings:t.wings!==!1,race:a,...Object.fromEntries(Zs.map(([se])=>[se,o?gt:t[se]??d[se]])),tail:!o&&(t.tail??a==="tiefling"),gender:s,shape:w,limbs:S,height:ir((t.height??E)*v("height"),xi[0],xi[1]),colours:Ze,hair:o?gt:$s.some(([se])=>se===t.hair)?t.hair:R,hairColour:oe,underwear:{top:t.underwear?.top??(_f&&n==="female"?"bra":gt),bottom:t.underwear?.bottom??(_f?"briefs":gt)},clothes:de,clothColours:Ne,variants:o?{}:t.variants??{},job:t.clothes?null:Te.job,age:t.age??ne,skin:o?"custom":F,brows:t.brows??q,lashes:t.lashes??K,eyePicture:o?On:t.eyePicture??On,nails:o?"none":t.nails??"short",toenails:!o&&t.toenails!==!1,seed:Ji(`${i}:motion`)}}function Hy(i,e,t,n=!1){let s={age_middle:i.age==="middle"?1:0,age_old:i.age==="old"?1:0,ruff_flat:n?1:0,collar_fit:n?1:0};for(let r of[...Zi,...vi,...Tn,...bi,...yi,...Gr]){let[o]=r,[a,l]=Qc(o,e),[c,d]=rl(r,t),h=ir(i.shape[o],c,d)*(o==="waist"?-1:1);a&&t.includes(a)?(s[a]=Math.max(0,-h),s[l]=Math.max(0,h)):s[l]=h}for(let r of Object.keys(s))t.includes(r)||delete s[r];return s}function Tf(i,e=0){let t={};for(let[n,s]of Object.entries(i.morphs??{})){let r=Uint32Array.from(Mn(i.count>65535?Uint32Array:Uint16Array,s.ids),c=>c+e),o=s.q??32767,a=Float32Array.from(Mn(Int16Array,s.delta),(c,d)=>c/o*s.d[d%3]),l=Float32Array.from(Mn(Int8Array,s.normal),(c,d)=>c/127*s.n[d%3]);t[n]={ids:r,delta:a,normal:l}}return t}function vf(i,e,t,n){let s=i.slice(),r=e.slice(),o=!1;for(let[a,l]of Object.entries(t)){let c=n[a]??0;if(c){for(let{ids:d,delta:h,normal:u}of l)for(let p=0;p<d.length;p++){let _=d[p]*3;for(let v=0;v<3;v++)s[_+v]+=h[p*3+v]*c,r[_+v]+=u[p*3+v]*c}o=!0}}if(o)for(let a=0;a<r.length;a+=3){let l=Math.hypot(r[a],r[a+1],r[a+2])||1;r[a]/=l,r[a+1]/=l,r[a+2]/=l}return{position:s,normal:r}}var ul=new Map;function Af(i,e="human"){let t=Dy(e,i);if(!ul.has(t)){let n=Vr(`${t}.pack.png`).then(s=>{let r=s.meshes.map((E,g)=>({mesh:E,i:g})).sort((E,g)=>!!E.mesh.alpha-!!g.mesh.alpha||String(E.mesh.alpha).localeCompare(String(g.mesh.alpha))||String(E.mesh.texture).localeCompare(String(g.mesh.texture))||E.i-g.i),o=r.reduce((E,{mesh:g})=>E+g.count,0),a=E=>new U().setFromMatrixPosition(new ke().fromArray(s.inverseBind,s.joints.indexOf(E)*16).invert()),l=a("neck_01").y+.03,c=new Float32Array(o*3),d=new Float32Array(o*3),h=new Float32Array(o*2),u=new Uint16Array(o*4),p=new Float32Array(o*4),_=new Array(o),v={},m=[],f=0;for(let{mesh:E}of r){let g=zc(E),{attributes:A}=g;c.set(A.position.array,f*3),d.set(A.normal.array,f*3),A.uv&&h.set(A.uv.array,f*2),u.set(A.skinIndex.array,f*4),p.set(A.skinWeight.array,f*4);for(let I=0;I<E.count;I++){let F=0;for(let X=1;X<4;X++)A.skinWeight.array[I*4+X]>A.skinWeight.array[I*4+F]&&(F=X);let $=Mf[s.joints[A.skinIndex.array[I*4+F]]]??"";_[f+I]=$==="torso"&&A.position.array[I*3+1]>l?"neck":$}let{full:R,far:P}=g.userData.distant??{full:{count:g.index.count}},O=I=>Uint32Array.from(g.index.array.subarray(I.start??0,(I.start??0)+I.count),F=>F+f),k=O(R);for(let[I,F]of Object.entries(Tf(E,f)))(v[I]??=[]).push(F);m.push({...E,start:f,index:k,far:P?O(P):k,group:`${E.alpha||"solid"}:${E.texture}`}),g.dispose(),f+=E.count}let b=new Set,T=new Set,y={brows:[],lashes:[]};for(let E of m){let g=/^underwear-(top|bottom)-(.+)$/u.exec(E.piece??"");g&&(g[1]==="top"?b:T).add(g[2]);let A=/^eye(brows|lashes)-(\d+)$/u.exec(E.piece??"");A&&y[A[1]].push(Number(A[2])),E.piece==="underwear-legacy"&&(T.add("briefs"),i==="female"&&b.add("bra"))}let w=(E,g)=>E.filter(([A])=>g.has(A)).map(([A])=>A),S=new At;return S.setAttribute("position",new Ge(c,3)),S.computeBoundingBox(),S.computeBoundingSphere(),{file:s,sex:i,position:c,normal:d,regions:_,morphs:v,meshes:m,boundingBox:S.boundingBox,boundingSphere:S.boundingSphere,shared:{uv:new Ge(h,2),skinIndex:new Ge(u,4),skinWeight:new Ge(p,4)},indices:new Map,tops:w(Zr,b),bottoms:w(Kr,T),brows:y.brows.sort((E,g)=>E-g),lashes:y.lashes.sort((E,g)=>E-g),eyeUvs:new Map,tucked:{head:a("Head").add(new U(0,.08,0)).toArray(),hips:a("pelvis").toArray()}}});n.catch(()=>ul.delete(t)),ul.set(t,n)}return ul.get(t)}function uh(i,e,t){if(!i.piece)return!0;if(i.piece==="wings")return e.wings;if(i.piece==="tail-tiefling")return e.tail;let n=/^(beard|moustache|tusks|horns)-\d+$/u.exec(i.piece);if(n)return i.piece===e[{tusks:"tusks",horns:"horns"}[n[1]]??"facialHair"];let s=/^eye(brows|lashes)-(\d+)$/u.exec(i.piece);if(s)return Number(s[2])===e[s[1]];let{underwear:r}=e;if(i.piece==="underwear-legacy")return r.bottom==="briefs"||t==="female"&&r.top==="bra";let o=/^underwear-(top|bottom)-(.+)$/u.exec(i.piece);return!!o&&r[o[1]]===o[2]}function Gy(i,e,t){let{underwear:n}=e,s=`${n.top}|${n.bottom}|${e.brows}|${e.lashes}|${e.wings}|${e.facialHair}|${e.tusks}|${e.horns}|${e.tail}|${[...t].sort().join(",")}`;if(!i.indices.has(s)){let r=u=>/^underwear/u.test(u.part)&&(t.has("underwear")||u.piece&&t.has(u.piece.replace(/-[^-]+$/u,"")))?()=>!0:Ly.has(u.part)?(p,_,v)=>t.has(i.regions[p])&&t.has(i.regions[_])&&t.has(i.regions[v]):()=>!1,o=[],a=[],l=[],c=(u,p,_)=>{for(let v=0;v<p.length;v+=3){let[m,f,b]=[p[v],p[v+1],p[v+2]];_(m,f,b)||u.push(m,f,b)}};for(let u of i.meshes){if(!uh(u,e,i.sex))continue;let p=r(u);o.at(-1)?.name!==u.group&&o.push({name:u.group,start:a.length,count:0,farStart:l.length,farCount:0,mesh:u}),c(a,u.index,p),c(l,u.far??u.index,p),o.at(-1).count=a.length-o.at(-1).start,o.at(-1).farCount=l.length-o.at(-1).farStart}let d=i.position.length/3>65535?Uint32Array:Uint16Array,h=new d(a.length+l.length);h.set(a),h.set(l,a.length),i.indices.set(s,{index:new Ge(h,1),groups:o.filter(u=>u.count).map(u=>({...u,farStart:a.length+u.farStart}))})}return i.indices.get(s)}function Wy(i,e){if(!i.eyeUvs.has(e)){let t=Xr.findIndex(([a])=>a===e),[n,s]=[t%Yr,Math.floor(t/Yr)],r=i.shared.uv.array.slice(),o=i.meshes.find(a=>a.part==="iris")?.texture;for(let a of i.meshes.filter(l=>l.texture===o&&!l.alpha))for(let l=a.start;l<a.start+a.count;l++)r[l*2]=(n+r[l*2])/Yr,r[l*2+1]=(s+r[l*2+1]*512/384)/Yr;i.eyeUvs.set(e,new Ge(r,2))}return i.eyeUvs.get(e)}var Ef="avatar-hair-index.json",Cf="avatar-outfits-index.json",dl=i=>Vr(i).catch(()=>({}));async function Xy(i,e){let t=(await dl(Ef))[i];if(!t?.bodies.includes(e))return null;let n=await Vr(`${t.bundle}.pack.png`).catch(()=>null),s=n?.styles?.[i]?.[e];return s?{key:`hair:${i}:${e}`,part:s,pictures:n.pictures}:null}async function Yy(i,e,t=""){let n=Si[i],s=n??(await dl(Cf))[i];if(!s?.bodies.includes(e))return null;let r=await(n?kc(n.url):Vr(`${s.bundle}.pack.png`)).catch(()=>null),o=r?.pieces?.[i],a=!n&&o?.variants?.[t]?.[e]?o.variants[t]:o;return a?.[e]?{key:`outfit:${i}:${e}:${a===o?"":t}`,piece:i,slot:n?n.slot:o.slot,layer:n?n.layer:o.layer??0,hides:n?n.hides:a.hides??[],part:a[e],pictures:n?[r.pictures??[]].flat().filter(c=>String(c?.name).startsWith(`${n.pack}-`)):r.pictures}:null}var qy=new Set(["brow","face","mouth","ears","fingers","neck","waist","arms"]),hh=new Map;function $y(i,e,t=!1){return hh.has(i)||hh.set(i,e.meshes.map(n=>{let s=zc(n);if(s.userData.shared=!0,t){let r=s.userData.distant?.full??{start:0,count:s.index.count};s.userData.distant={full:r,far:{start:r.start,count:0}}}return{mesh:n,geometry:s,morphs:Object.fromEntries(Object.entries(Tf(n)).map(([r,o])=>[r,[o]])),colours:new Map}})),hh.get(i)}async function Rf(i,e="human"){let t=e!=="human",n=await Af(i,e),[s,r]=await Promise.all([dl(Ef),dl(Cf)]);return{keys:n.file.keys,wings:n.meshes.some(o=>o.piece==="wings"),...Object.fromEntries(Zs.map(([o,a])=>[o,a.map(([l])=>l).filter(l=>n.meshes.some(c=>c.piece===l))])),tail:n.meshes.some(o=>o.piece==="tail-tiefling"),races:wn.map(([o])=>o).filter(o=>!il(o).key||n.file.keys.includes(il(o).key)),tops:n.tops,bottoms:n.bottoms,brows:n.brows,lashes:n.lashes,hair:t?[]:$s.map(([o])=>o).filter(o=>o===gt||s[o]?.bodies.includes(i)),clothes:Object.entries({...r,...Si}).filter(([o,a])=>a.bodies.includes(i)&&$t[o]&&!uf.some(([l])=>l===$t[o])).filter(([o])=>!t||!Zc.has($t[o])).map(([o,a])=>({piece:o,slot:a.slot,parts:a.parts[i]??[],variants:t?[]:a.variants??[]}))}}var eo=.04,hn=4,Zy=8,If=(i,e,t)=>i+512<<20|e+512<<10|t+512;function Ky(i){if(!i.cells){i.cells=new Map;let e=new Set;for(let{ids:t,delta:n}of i.morphs.ears_pointed??[])for(let s=0;s<t.length;s++)Math.hypot(n[s*3],n[s*3+1],n[s*3+2])>.001&&e.add(t[s]);for(let t of i.meshes)if(!(t.piece||t.part!=="skin"))for(let n=t.start;n<t.start+t.count;n++){if(e.has(n))continue;let s=If(Math.floor(i.position[n*3]/eo),Math.floor(i.position[n*3+1]/eo),Math.floor(i.position[n*3+2]/eo));i.cells.has(s)||i.cells.set(s,[]),i.cells.get(s).push(n)}}return i.cells}function bf(i,e){let t=Ky(i),n=i.position,s=e.length/3,r=new Uint32Array(s*hn),o=new Float32Array(s*hn),a=new Float64Array(hn),l=new Uint32Array(hn);for(let c=0;c<s;c++){let[d,h,u]=[e[c*3],e[c*3+1],e[c*3+2]],[p,_,v]=[d,h,u].map(b=>Math.floor(b/eo)),m=0;for(let b=1;b<=Zy;b++){m=0;for(let T=-b;T<=b;T++)for(let y=-b;y<=b;y++)for(let w=-b;w<=b;w++)for(let S of t.get(If(p+T,_+y,v+w))??[]){let E=(n[S*3]-d)**2+(n[S*3+1]-h)**2+(n[S*3+2]-u)**2;if(m===hn&&E>=a[m-1])continue;let g=m<hn?m++:m-1;for(;g>0&&a[g-1]>E;g--)a[g]=a[g-1],l[g]=l[g-1];a[g]=E,l[g]=S}if(m===hn&&a[m-1]<=(b*eo)**2)break}let f=0;for(let b=0;b<m;b++)f+=1/(a[b]+1e-6);for(let b=0;b<m;b++)r[c*hn+b]=l[b],o[c*hn+b]=1/(a[b]+1e-6)/f}return{ids:r,shares:o}}function Sf(i,e,t,n,s=0){if(i.moves??=new Map,!i.moves.has(e)){let l=new Float32Array(i.position.length);for(let{ids:c,delta:d}of i.morphs[e]??[])for(let h=0;h<c.length;h++)for(let u=0;u<3;u++)l[c[h]*3+u]+=d[h*3+u];i.moves.set(e,l)}let r=i.moves.get(e),o=[],a=[];for(let l=0;l<t.length/3;l++){let c=[0,0,0];for(let d=0;d<hn;d++){let h=n.shares[l*hn+d],u=n.ids[l*hn+d];for(let p=0;p<3;p++)c[p]+=r[u*3+p]*h}Math.max(Math.abs(c[0]),Math.abs(c[1]),Math.abs(c[2]))<1e-4||(o.push(l+s),a.push(...c))}return{ids:Uint32Array.from(o),delta:Float32Array.from(a),normal:new Float32Array(o.length*3)}}function Jy(i,e,t,n){let s=new Map;for(let[a,l]of Object.entries(t??{})){let c=n[a]??0;if(c)for(let[d,h]of Object.entries(l))e.has(d)&&(s.has(d)||s.set(d,new U),s.get(d).add(new U(...h).multiplyScalar(c)))}if(!s.size)return null;i.updateMatrixWorld(!0);let r=i.matrixWorld.clone().invert(),o=new Map;for(let[a,l]of e){let c=r.clone().multiply(l.matrixWorld),d=s.get(a);d&&c.premultiply(new ke().makeTranslation(d.x,d.y,d.z)),o.set(a,c)}for(let[a,l]of e){let c=l.parent?.isBone?o.get(l.parent.name):null;(c?c.clone().invert().multiply(o.get(a)):o.get(a)).decompose(l.position,l.quaternion,l.scale)}return i.updateMatrixWorld(!0),new Map([...s].map(([a,l])=>[a,new ke().makeTranslation(-l.x,-l.y,-l.z)]))}async function Pf(i={},e="",t="auto"){let n=Vy(e,t,i),s=n.body,r=new Set(n.clothes.map(te=>$t[te])),o=n.clothes.filter(te=>!ll($t[te],r)),a=[...n.nails!=="none"&&!ll("nails",r)?[`nails_${n.nails}`]:[],...n.toenails&&!ll("toenails",r)?["toenails"]:[]],l={...n.clothColours};if(n.colours.nails!==ji)for(let te of a)l[te]={nail:n.colours.nails};let[c,d,h]=await Promise.all([Af(s,n.species),n.hair===gt?null:Xy(n.hair,s),Promise.all([...o,...a].map(te=>Yy(te,s,n.variants[te])))]),{root:u,bones:p}=Gd(c.file),_=null,v=new Set,m=h.filter(Boolean).sort((te,H)=>te.layer-H.layer);for(let te of m)for(let H of te.hides)v.add(H);let f=v.has("neck")||v.has("torso")||m.some(te=>Ny.has(te.slot)),b=Hy(n,s,c.file.keys,f);_=Jy(u,p,c.file.jointMoves,b);let T={height:1,legs:1,arms:1,head:1,...Qd[n.species]},y=te=>te.startsWith("race_");for(let[te,H]of Object.entries(b))if(!(!H||!(y(te)||te.includes("."))||!c.morphs[te]))for(let G of c.meshes){if(!G.piece||G.morphs?.[te]||!uh(G,n,s)||y(te)&&!/^underwear/u.test(G.piece)||(G.carried??=new Set,G.carried.has(te)))continue;G.carried.add(te);let oe=c.position.subarray(G.start*3,(G.start+G.count)*3);c.morphs[te].push(Sf(c,te,oe,G.near??=bf(c,oe),G.start))}let w=new Map;for(let[te,H]of Object.entries(Uy)){let G=n.limbs[te]*T[te]-1;if(G)for(let[oe,Te]of H){let de=p.get(Te);if(!p.has(oe)||!de)continue;let{x:Ne,y:Ze,z:se}=de.position.clone().normalize();w.set(oe,new ke().set(1+G*Ne*Ne,G*Ne*Ze,G*Ne*se,0,G*Ze*Ne,1+G*Ze*Ze,G*Ze*se,0,G*se*Ne,G*se*Ze,1+G*se*se,0,0,0,0,1)),de.position.multiplyScalar(1+G)}}let S=n.limbs.head*T.head;S!==1&&w.set("Head",new ke().makeScale(S,S,S)),u.updateMatrixWorld(!0);let E=[],g=(te,H,G,oe=null)=>{let Te=new mr(te,H);return Te.frustumCulled=!1,Te.name=oe?"piece":"body",Te.userData.sharedShadow=!0,u.add(Te),Te.bind(Wd(u,p,G,w,oe,_),Te.matrixWorld),Te},{position:A,normal:R}=vf(c.position,c.normal,c.morphs,b);for(let te of c.meshes){if(!/^(?:beard|moustache|tusks|horns|tail)-/u.test(te.piece??"")||uh(te,n,s))continue;let H=c.tucked[te.piece.startsWith("tail")?"hips":"head"];for(let G=te.start;G<te.start+te.count;G++)A.set(H,G*3)}let P=te=>c.meshes.find(H=>H.part===te)?.texture,O=new Map,k=lf(n.skin,s,n.age);k&&O.set(P("skin"),Hr(k)),n.eyePicture!==On&&O.set(P("iris"),Hr("avatar-eyes"));let I=n.species!=="human",F=I||!c.file.keys?null:await mf({sex:s,base:k??P("skin"),skin:n.skin==="custom"?n.colours.skin:ji,lips:n.colours.lips}).catch(()=>null);F&&O.set(P("skin"),F);let $=new Set(F?["skin","lips"]:[]),X=te=>$.has(te)?ji:{skin:n.skin==="custom"?n.colours.skin:ji,underwear:n.colours.underwear,underwear_trim:Mi(n.colours.underwear,0,.3),iris:n.eyePicture===On?n.colours.eyes:ji,eyes:n.colours.eyes,eyebrows:n.colours.brows,eyelashes:I?void 0:Mi(n.colours.brows,0,.5),lips:n.colours.lips,nails:n.colours.nails,fur:n.colours.fur,fur_tufts:n.colours.fur,fur2:n.colours.fur2,fur2_tufts:n.colours.fur2,nose:n.colours.nose,claws:n.colours.claws??n.colours.horns,scales:n.colours.scales,scales2:n.colours.scales2,horns:n.colours.horns,hair:n.hairColour}[te],ne=new Uint16Array(A.length),q=new Be;for(let te of c.meshes){let H=X(te.part);H===void 0?q.setRGB(...te.colour):q.setHex(H);for(let G=te.start;G<te.start+te.count;G++)ne[G*3]=Math.round(q.r*65535),ne[G*3+1]=Math.round(q.g*65535),ne[G*3+2]=Math.round(q.b*65535)}let K=new At;K.setAttribute("position",new Ge(A,3)),K.setAttribute("normal",new Ge(R,3)),K.setAttribute("color",new Ge(ne,3,!0));for(let[te,H]of Object.entries(c.shared))K.setAttribute(te,H);n.eyePicture!==On&&K.setAttribute("uv",Wy(c,n.eyePicture));let{index:ee,groups:be}=Gy(c,n,v);K.setIndex(ee),K.userData.distant={groups:!0};let Se=be.map((te,H)=>{K.addGroup(te.start,te.count,H),K.groups[H].distant={full:{start:te.start,count:te.count},far:{start:te.farStart,count:te.farCount}};let G=!!te.mesh.alpha,oe=te.mesh.alpha==="MASK";return new Ps({map:O.get(te.mesh.texture)??(te.mesh.texture?Hr(te.mesh.texture,c.file.pictures):null),vertexColors:!0,side:Nt,...oe?{alphaTest:.5}:G?{transparent:!0,depthWrite:!1,alphaTest:.05}:{}})});K.boundingBox=c.boundingBox.clone(),K.boundingSphere=c.boundingSphere.clone(),g(K,Se,c.file),E.push(()=>{for(let te of Object.keys(c.shared))K.deleteAttribute(te);K.setIndex(null),K.dispose();for(let te of Se)te.dispose()});let tt=({key:te,part:H,pictures:G,slot:oe,piece:Te},de)=>{for(let Ne of $y(te,H,qy.has(oe))){let{mesh:Ze,geometry:se,morphs:Ue,colours:Ye}=Ne;for(let[qe,it]of Object.entries(b))if(it&&(qe.includes(".")||y(qe))&&!Ue[qe]&&c.morphs[qe]){let L=se.attributes.position.array;Ue[qe]=[Sf(c,qe,L,Ne.near??=bf(c,L))]}let Ie=se,nt=null;if(Ze.partOf){let qe=Ze.parts.map(({part:L})=>l[Te]?.[L]??null),it=qe.join();if(!Ye.has(it)){let L=Ze.parts.map(({colour:C},x)=>qe[x]===null?new Be().setRGB(...C):new Be().setHex(qe[x])),pt=Mn(Uint8Array,Ze.partOf),Qe=new Uint16Array(pt.length*3);pt.forEach((C,x)=>{Qe[x*3]=Math.round(L[C].r*65535),Qe[x*3+1]=Math.round(L[C].g*65535),Qe[x*3+2]=Math.round(L[C].b*65535)}),Ye.set(it,new Ge(Qe,3,!0))}nt=Ye.get(it)}let _t=Object.keys(Ue).length>0;if(_t||nt){let qe=_t?vf(se.attributes.position.array,se.attributes.normal.array,Ue,b):null,it=["uv","skinIndex","skinWeight",..._t?[]:["position","normal"]];Ie=new At,qe&&(Ie.setAttribute("position",new Ge(qe.position,3)),Ie.setAttribute("normal",new Ge(qe.normal,3)));for(let pt of it)se.attributes[pt]&&Ie.setAttribute(pt,se.attributes[pt]);nt&&(Ie.setAttribute("color",nt),it.push("color")),Ie.setIndex(se.index),Ie.userData.distant=se.userData.distant,Ie.boundingBox=se.boundingBox,Ie.boundingSphere=se.boundingSphere;let L=Ie;E.push(()=>{for(let pt of it)L.deleteAttribute(pt);L.setIndex(null),L.dispose()})}let Dt=new Ps({map:Ze.texture?Hr(Ze.texture,G):null,color:de(Ze),vertexColors:!!nt,...Ze.alpha?{alphaTest:.5,side:Nt}:{}});E.push(()=>Dt.dispose()),g(Ie,Dt,H,c.file)}};d&&!v.has("hair")&&tt(d,()=>new Be(n.hairColour));for(let te of m)tt(te,H=>H.partOf?16777215:new Be().setRGB(...H.colour));let He=qd(u,p,n.height*T.height);return He.dispose=()=>{for(let te of E)te()},He.avatar=n,He.kit=c,He}var Lf={POSITION:["byte","byte normalized","unsigned byte","unsigned byte normalized","short","short normalized","unsigned short","unsigned short normalized"],NORMAL:["byte normalized","short normalized"],TANGENT:["byte normalized","short normalized"],TEXCOORD:["byte","byte normalized","unsigned byte","short","short normalized","unsigned short"]},wi=class{constructor(){this.textureUtils=null,this.pluginCallbacks=[],this.register(function(e){return new gh(e)}),this.register(function(e){return new _h(e)}),this.register(function(e){return new bh(e)}),this.register(function(e){return new Sh(e)}),this.register(function(e){return new Mh(e)}),this.register(function(e){return new wh(e)}),this.register(function(e){return new xh(e)}),this.register(function(e){return new yh(e)}),this.register(function(e){return new vh(e)}),this.register(function(e){return new Th(e)}),this.register(function(e){return new Ah(e)}),this.register(function(e){return new Eh(e)}),this.register(function(e){return new Ch(e)}),this.register(function(e){return new Rh(e)})}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}setTextureUtils(e){return this.textureUtils=e,this}parse(e,t,n,s){let r=new mh,o=[];for(let a=0,l=this.pluginCallbacks.length;a<l;a++)o.push(this.pluginCallbacks[a](r));r.setPlugins(o),r.setTextureUtils(this.textureUtils),r.writeAsync(e,t,s).catch(n)}parseAsync(e,t){let n=this;return new Promise(function(s,r){n.parse(e,s,r,t)})}},Je={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,BYTE:5120,UNSIGNED_BYTE:5121,SHORT:5122,UNSIGNED_SHORT:5123,INT:5124,UNSIGNED_INT:5125,FLOAT:5126,ARRAY_BUFFER:34962,ELEMENT_ARRAY_BUFFER:34963,NEAREST:9728,LINEAR:9729,NEAREST_MIPMAP_NEAREST:9984,LINEAR_MIPMAP_NEAREST:9985,NEAREST_MIPMAP_LINEAR:9986,LINEAR_MIPMAP_LINEAR:9987,CLAMP_TO_EDGE:33071,MIRRORED_REPEAT:33648,REPEAT:10497},dh="KHR_mesh_quantization",rn={};rn[wt]=Je.NEAREST;rn[sa]=Je.NEAREST_MIPMAP_NEAREST;rn[ki]=Je.NEAREST_MIPMAP_LINEAR;rn[Tt]=Je.LINEAR;rn[Bs]=Je.LINEAR_MIPMAP_NEAREST;rn[Nn]=Je.LINEAR_MIPMAP_LINEAR;rn[ln]=Je.CLAMP_TO_EDGE;rn[ys]=Je.REPEAT;rn[vs]=Je.MIRRORED_REPEAT;var Nf={scale:"scale",position:"translation",quaternion:"rotation",morphTargetInfluences:"weights"},jy=new Be,Df=12,Qy=1179937895,ev=2,Uf=8,tv=1313821514,nv=5130562;function Kn(i,e){return i.length===e.length&&i.every(function(t,n){return t===e[n]})}function iv(i){return new TextEncoder().encode(i).buffer}function sv(i){return Kn(i.elements,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}function rv(i,e,t){let n={min:new Array(i.itemSize).fill(Number.POSITIVE_INFINITY),max:new Array(i.itemSize).fill(Number.NEGATIVE_INFINITY)};for(let s=e;s<e+t;s++)for(let r=0;r<i.itemSize;r++){let o;i.itemSize>4?o=i.array[s*i.itemSize+r]:(r===0?o=i.getX(s):r===1?o=i.getY(s):r===2?o=i.getZ(s):r===3&&(o=i.getW(s)),i.normalized===!0&&(o=Vi.normalize(o,i.array))),n.min[r]=Math.min(n.min[r],o),n.max[r]=Math.max(n.max[r],o)}return n}function Of(i){return Math.ceil(i/4)*4}function fh(i,e=0){let t=Of(i.byteLength);if(t!==i.byteLength){let n=new Uint8Array(t);if(n.set(new Uint8Array(i)),e!==0)for(let s=i.byteLength;s<t;s++)n[s]=e;return n.buffer}return i}function ph(){return typeof document>"u"&&typeof OffscreenCanvas<"u"?new OffscreenCanvas(1,1):document.createElement("canvas")}function ov(i,e){if(typeof OffscreenCanvas<"u"&&i instanceof OffscreenCanvas){let t;return e==="image/jpeg"?t=.92:e==="image/webp"&&(t=.8),i.convertToBlob({type:e,quality:t})}else return new Promise(t=>i.toBlob(t,e))}var mh=class{constructor(){this.plugins=[],this.options={},this.pending=[],this.buffers=[],this.byteOffset=0,this.buffers=[],this.nodeMap=new Map,this.skins=[],this.extensionsUsed={},this.extensionsRequired={},this.uids=new Map,this.uid=0,this.json={asset:{version:"2.0",generator:"THREE.GLTFExporter r186"}},this.cache={meshes:new Map,attributes:new Map,attributesNormalized:new Map,materials:new Map,textures:new Map,images:new Map,normalMaps:new Map},this.textureUtils=null}setPlugins(e){this.plugins=e}setTextureUtils(e){this.textureUtils=e}async writeAsync(e,t,n={}){this.options=Object.assign({binary:!1,trs:!1,onlyVisible:!0,maxTextureSize:1/0,animations:[],includeCustomExtensions:!1,copyright:null},n),this.options.animations.length>0&&(this.options.trs=!0),await this.processInputAsync(e),await Promise.all(this.pending);let s=this,r=s.buffers,o=s.json;n=s.options;let a=s.extensionsUsed,l=s.extensionsRequired,c=new Blob(r,{type:"application/octet-stream"}),d=Object.keys(a),h=Object.keys(l);if(d.length>0&&(o.extensionsUsed=d),h.length>0&&(o.extensionsRequired=h),o.buffers&&o.buffers.length>0&&(o.buffers[0].byteLength=c.size),n.copyright&&(o.asset.copyright=n.copyright),n.binary===!0){let u=new FileReader;u.readAsArrayBuffer(c),u.onloadend=function(){let p=fh(u.result),_=new DataView(new ArrayBuffer(Uf));_.setUint32(0,p.byteLength,!0),_.setUint32(4,nv,!0);let v=fh(iv(JSON.stringify(o)),32),m=new DataView(new ArrayBuffer(Uf));m.setUint32(0,v.byteLength,!0),m.setUint32(4,tv,!0);let f=new ArrayBuffer(Df),b=new DataView(f);b.setUint32(0,Qy,!0),b.setUint32(4,ev,!0);let T=Df+m.byteLength+v.byteLength+_.byteLength+p.byteLength;b.setUint32(8,T,!0);let y=new Blob([f,m,v,_,p],{type:"application/octet-stream"}),w=new FileReader;w.readAsArrayBuffer(y),w.onloadend=function(){t(w.result)}}}else if(o.buffers&&o.buffers.length>0){let u=new FileReader;u.readAsDataURL(c),u.onloadend=function(){let p=u.result;o.buffers[0].uri=p,t(o)}}else t(o)}serializeUserData(e,t){if(Object.keys(e.userData).length===0)return;let n=this.options,s=this.extensionsUsed;try{let r=JSON.parse(JSON.stringify(e.userData));if(n.includeCustomExtensions&&r.gltfExtensions){t.extensions===void 0&&(t.extensions={});for(let o in r.gltfExtensions)t.extensions[o]=r.gltfExtensions[o],s[o]=!0;delete r.gltfExtensions}Object.keys(r).length>0&&(t.extras=r)}catch(r){console.warn("THREE.GLTFExporter: userData of '"+e.name+"' won't be serialized because of JSON.stringify error - "+r.message)}}getUID(e,t=!1){if(this.uids.has(e)===!1){let s=new Map;s.set(!0,this.uid++),s.set(!1,this.uid++),this.uids.set(e,s)}return this.uids.get(e).get(t)}isNormalizedNormalAttribute(e){if(this.cache.attributesNormalized.has(e))return!1;let n=new U;for(let s=0,r=e.count;s<r;s++)if(Math.abs(n.fromBufferAttribute(e,s).length()-1)>5e-4)return!1;return!0}createNormalizedNormalAttribute(e){let t=this.cache;if(t.attributesNormalized.has(e))return t.attributesNormalized.get(e);let n=e.clone(),s=new U;for(let r=0,o=n.count;r<o;r++)s.fromBufferAttribute(n,r),s.x===0&&s.y===0&&s.z===0?s.setX(1):s.normalize(),n.setXYZ(r,s.x,s.y,s.z);return t.attributesNormalized.set(e,n),n}applyTextureTransform(e,t){let n=!1,s={};(t.offset.x!==0||t.offset.y!==0)&&(s.offset=t.offset.toArray(),n=!0),t.rotation!==0&&(s.rotation=t.rotation,n=!0),(t.repeat.x!==1||t.repeat.y!==1)&&(s.scale=t.repeat.toArray(),n=!0),n&&(e.extensions=e.extensions||{},e.extensions.KHR_texture_transform=s,this.extensionsUsed.KHR_texture_transform=!0)}async buildMetalRoughTextureAsync(e,t){if(e===t)return e;function n(p){return p.colorSpace===yt?function(v){return v<.04045?v*.0773993808:Math.pow(v*.9478672986+.0521327014,2.4)}:function(v){return v}}e instanceof li&&(e=await this.decompressTextureAsync(e)),t instanceof li&&(t=await this.decompressTextureAsync(t));let s=e?e.image:null,r=t?t.image:null,o=Math.max(s?s.width:0,r?r.width:0),a=Math.max(s?s.height:0,r?r.height:0),l=ph();l.width=o,l.height=a;let c=l.getContext("2d",{willReadFrequently:!0});c.fillStyle="#00ffff",c.fillRect(0,0,o,a);let d=c.getImageData(0,0,o,a);if(s){c.drawImage(s,0,0,o,a);let p=n(e),_=c.getImageData(0,0,o,a).data;for(let v=2;v<_.length;v+=4)d.data[v]=p(_[v]/256)*256}if(r){c.drawImage(r,0,0,o,a);let p=n(t),_=c.getImageData(0,0,o,a).data;for(let v=1;v<_.length;v+=4)d.data[v]=p(_[v]/256)*256}c.putImageData(d,0,0);let u=(e||t).clone();return u.source=new Wn(l),u.colorSpace=Sn,u.channel=(e||t).channel,e&&t&&e.channel!==t.channel&&console.warn("THREE.GLTFExporter: UV channels for metalnessMap and roughnessMap textures must match."),console.warn("THREE.GLTFExporter: Merged metalnessMap and roughnessMap textures."),u}async buildNormalMapTextureAsync(e,t,n){e instanceof li&&(e=await this.decompressTextureAsync(e));let s=e.image,r=ph();r.width=s.width,r.height=s.height;let o=r.getContext("2d",{willReadFrequently:!0});o.drawImage(s,0,0,r.width,r.height);let a=o.getImageData(0,0,r.width,r.height),l=a.data;for(let d=0;d<l.length;d+=4)t&&(l[d+0]=255-l[d+0]),n&&(l[d+1]=255-l[d+1]);o.putImageData(a,0,0);let c=e.clone();return c.source=new Wn(r),c}async decompressTextureAsync(e,t=1/0){if(this.textureUtils===null)throw new Error("THREE.GLTFExporter: setTextureUtils() must be called to process compressed textures.");return await this.textureUtils.decompress(e,t)}processBuffer(e){let t=this.json,n=this.buffers;return t.buffers||(t.buffers=[{byteLength:0}]),n.push(e),0}processBufferView(e,t,n,s,r){let o=this.json;o.bufferViews||(o.bufferViews=[]);let a;switch(t){case Je.BYTE:case Je.UNSIGNED_BYTE:a=1;break;case Je.SHORT:case Je.UNSIGNED_SHORT:a=2;break;default:a=4}let l=e.itemSize*a;r===Je.ARRAY_BUFFER&&(l=Math.ceil(l/4)*4);let c=Of(s*l),d=new DataView(new ArrayBuffer(c)),h=0;for(let _=n;_<n+s;_++){for(let v=0;v<e.itemSize;v++){let m;e.itemSize>4?m=e.array[_*e.itemSize+v]:(v===0?m=e.getX(_):v===1?m=e.getY(_):v===2?m=e.getZ(_):v===3&&(m=e.getW(_)),e.normalized===!0&&(m=Vi.normalize(m,e.array))),t===Je.FLOAT?d.setFloat32(h,m,!0):t===Je.INT?d.setInt32(h,m,!0):t===Je.UNSIGNED_INT?d.setUint32(h,m,!0):t===Je.SHORT?d.setInt16(h,m,!0):t===Je.UNSIGNED_SHORT?d.setUint16(h,m,!0):t===Je.BYTE?d.setInt8(h,m):t===Je.UNSIGNED_BYTE&&d.setUint8(h,m),h+=a}h%l!==0&&(h+=l-h%l)}let u={buffer:this.processBuffer(d.buffer),byteOffset:this.byteOffset,byteLength:c};return r!==void 0&&(u.target=r),r===Je.ARRAY_BUFFER&&(u.byteStride=l),this.byteOffset+=c,o.bufferViews.push(u),{id:o.bufferViews.length-1,byteLength:0}}processBufferViewImage(e){let t=this,n=t.json;return n.bufferViews||(n.bufferViews=[]),new Promise(function(s){let r=new FileReader;r.readAsArrayBuffer(e),r.onloadend=function(){let o=fh(r.result),a={buffer:t.processBuffer(o),byteOffset:t.byteOffset,byteLength:o.byteLength};t.byteOffset+=o.byteLength,s(n.bufferViews.push(a)-1)}})}processAccessor(e,t,n,s){let r=this.json,o={1:"SCALAR",2:"VEC2",3:"VEC3",4:"VEC4",9:"MAT3",16:"MAT4"},a;if(e.array.constructor===Float32Array)a=Je.FLOAT;else if(e.array.constructor===Int32Array)a=Je.INT;else if(e.array.constructor===Uint32Array)a=Je.UNSIGNED_INT;else if(e.array.constructor===Int16Array)a=Je.SHORT;else if(e.array.constructor===Uint16Array)a=Je.UNSIGNED_SHORT;else if(e.array.constructor===Int8Array)a=Je.BYTE;else if(e.array.constructor===Uint8Array)a=Je.UNSIGNED_BYTE;else throw new Error("THREE.GLTFExporter: Unsupported bufferAttribute component type: "+e.array.constructor.name);if(n===void 0&&(n=0),(s===void 0||s===1/0)&&(s=e.count),s===0)return null;let l=rv(e,n,s),c;t!==void 0&&(c=e===t.index?Je.ELEMENT_ARRAY_BUFFER:Je.ARRAY_BUFFER);let d=this.processBufferView(e,a,n,s,c),h={bufferView:d.id,byteOffset:d.byteOffset,componentType:a,count:s,max:l.max,min:l.min,type:o[e.itemSize]};return e.normalized===!0&&(h.normalized=!0),r.accessors||(r.accessors=[]),r.accessors.push(h)-1}processImage(e,t,n,s="image/png"){if(e!==null){let r=this,o=r.cache,a=r.json,l=r.options,c=r.pending;o.images.has(e)||o.images.set(e,{});let d=o.images.get(e),h=s+":flipY/"+n.toString();if(d[h]!==void 0)return d[h];a.images||(a.images=[]);let u={mimeType:s},p=ph();p.width=Math.min(e.width,l.maxTextureSize),p.height=Math.min(e.height,l.maxTextureSize);let _=p.getContext("2d",{willReadFrequently:!0});if(n===!0&&(_.translate(0,p.height),_.scale(1,-1)),e.data!==void 0){t!==qt&&console.error("GLTFExporter: Only RGBAFormat is supported.",t),(e.width>l.maxTextureSize||e.height>l.maxTextureSize)&&console.warn("GLTFExporter: Image size is bigger than maxTextureSize",e);let m=new Uint8ClampedArray(e.height*e.width*4);for(let f=0;f<m.length;f+=4)m[f+0]=e.data[f+0],m[f+1]=e.data[f+1],m[f+2]=e.data[f+2],m[f+3]=e.data[f+3];_.putImageData(new ImageData(m,e.width,e.height),0,0)}else if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap||typeof OffscreenCanvas<"u"&&e instanceof OffscreenCanvas)_.drawImage(e,0,0,p.width,p.height);else throw new Error("THREE.GLTFExporter: Invalid image type. Use HTMLImageElement, HTMLCanvasElement, ImageBitmap or OffscreenCanvas.");l.binary===!0?c.push(ov(p,s).then(m=>r.processBufferViewImage(m)).then(m=>{u.bufferView=m})):u.uri=As.getDataURL(p,s);let v=a.images.push(u)-1;return d[h]=v,v}else throw new Error("THREE.GLTFExporter: No valid image data found. Unable to process texture.")}processSampler(e){let t=this.json;t.samplers||(t.samplers=[]);let n={magFilter:rn[e.magFilter],minFilter:rn[e.minFilter],wrapS:rn[e.wrapS],wrapT:rn[e.wrapT]};return t.samplers.push(n)-1}async processTextureAsync(e){let n=this.options,s=this.cache,r=this.json;if(s.textures.has(e))return s.textures.get(e);r.textures||(r.textures=[]),e instanceof li&&(e=await this.decompressTextureAsync(e,n.maxTextureSize));let o=e.userData.mimeType,a=this.processImage(e.image,e.format,e.flipY,o),l={sampler:this.processSampler(e)};o==="image/webp"?(l.extensions=l.extensions||{},l.extensions.EXT_texture_webp={source:a},this.extensionsUsed.EXT_texture_webp=!0,this.extensionsRequired.EXT_texture_webp=!0):l.source=a,e.name&&(l.name=e.name),await this._invokeAllAsync(async function(d){d.writeTexture&&await d.writeTexture(e,l)});let c=r.textures.push(l)-1;return s.textures.set(e,c),c}async processMaterialAsync(e,t){let n=this.cache,s=this.json,r=t!==void 0&&t.hasAttribute("tangent"),o=e.normalMap?e.uuid+":"+r:e.uuid;if(n.materials.has(o))return n.materials.get(o);if(e.isShaderMaterial)return console.warn("GLTFExporter: THREE.ShaderMaterial not supported."),null;s.materials||(s.materials=[]);let a={pbrMetallicRoughness:{}};e.isMeshStandardMaterial!==!0&&e.isMeshBasicMaterial!==!0&&console.warn("GLTFExporter: Use MeshStandardMaterial or MeshBasicMaterial for best results.");let l=e.color.toArray().concat([e.opacity]);if(Kn(l,[1,1,1,1])||(a.pbrMetallicRoughness.baseColorFactor=l),e.isMeshStandardMaterial?(a.pbrMetallicRoughness.metallicFactor=e.metalness,a.pbrMetallicRoughness.roughnessFactor=e.roughness):(a.pbrMetallicRoughness.metallicFactor=0,a.pbrMetallicRoughness.roughnessFactor=1),e.metalnessMap||e.roughnessMap){let d=await this.buildMetalRoughTextureAsync(e.metalnessMap,e.roughnessMap),h={index:await this.processTextureAsync(d),texCoord:d.channel};this.applyTextureTransform(h,d),a.pbrMetallicRoughness.metallicRoughnessTexture=h}if(e.map){let d={index:await this.processTextureAsync(e.map),texCoord:e.map.channel};this.applyTextureTransform(d,e.map),a.pbrMetallicRoughness.baseColorTexture=d}if(e.emissive){let d=e.emissive;if(Math.max(d.r,d.g,d.b)>0&&(a.emissiveFactor=e.emissive.toArray()),e.emissiveMap){let u={index:await this.processTextureAsync(e.emissiveMap),texCoord:e.emissiveMap.channel};this.applyTextureTransform(u,e.emissiveMap),a.emissiveTexture=u}}if(e.normalMap){let d=e.normalScale,h=d.x<0,u=r?d.y<0:d.y>0,p=e.normalMap;if(h||u){n.normalMaps.has(e.normalMap)===!1&&n.normalMaps.set(e.normalMap,{});let v=n.normalMaps.get(e.normalMap),m=`${h}:${u}`;v[m]===void 0&&(v[m]=await this.buildNormalMapTextureAsync(e.normalMap,h,u)),p=v[m]}let _={index:await this.processTextureAsync(p),texCoord:e.normalMap.channel};Math.abs(d.x)!==1&&(_.scale=Math.abs(d.x)),this.applyTextureTransform(_,e.normalMap),a.normalTexture=_}if(e.aoMap){let d={index:await this.processTextureAsync(e.aoMap),texCoord:e.aoMap.channel};e.aoMapIntensity!==1&&(d.strength=e.aoMapIntensity),this.applyTextureTransform(d,e.aoMap),a.occlusionTexture=d}e.transparent?a.alphaMode="BLEND":e.alphaTest>0&&(a.alphaMode="MASK",a.alphaCutoff=e.alphaTest),e.side===Nt&&(a.doubleSided=!0),e.name!==""&&(a.name=e.name),this.serializeUserData(e,a),await this._invokeAllAsync(async function(d){d.writeMaterialAsync&&await d.writeMaterialAsync(e,a)});let c=s.materials.push(a)-1;return n.materials.set(o,c),c}async processMeshAsync(e){let t=this.cache,n=this.json,s=[e.geometry.uuid];if(Array.isArray(e.material))for(let y=0,w=e.material.length;y<w;y++)s.push(e.material[y].uuid);else s.push(e.material.uuid);let r=s.join(":");if(t.meshes.has(r))return t.meshes.get(r);let o=e.geometry,a;e.isLineSegments?a=Je.LINES:e.isLineLoop?a=Je.LINE_LOOP:e.isLine?a=Je.LINE_STRIP:e.isPoints?a=Je.POINTS:a=e.material.wireframe?Je.LINES:Je.TRIANGLES;let l={},c={},d=[],h=[],u={uv:"TEXCOORD_0",uv1:"TEXCOORD_1",uv2:"TEXCOORD_2",uv3:"TEXCOORD_3",color:"COLOR_0",skinWeight:"WEIGHTS_0",skinIndex:"JOINTS_0"},p=o.getAttribute("normal");p!==void 0&&!this.isNormalizedNormalAttribute(p)&&(console.warn("THREE.GLTFExporter: Creating normalized normal attribute from the non-normalized one."),o.setAttribute("normal",this.createNormalizedNormalAttribute(p)));let _=null;for(let y in o.attributes){if(y.slice(0,5)==="morph")continue;let w=o.attributes[y];if(y=u[y]||y.toUpperCase(),!/^(POSITION|NORMAL|TANGENT|TEXCOORD_\d+|COLOR_\d+|JOINTS_\d+|WEIGHTS_\d+)$/.test(y)&&!y.startsWith("_")&&(y="_"+y),t.attributes.has(this.getUID(w))){c[y]=t.attributes.get(this.getUID(w));continue}_=null;let E=w.array;y==="JOINTS_0"&&!(E instanceof Uint16Array)&&!(E instanceof Uint8Array)?(console.warn('GLTFExporter: Attribute "skinIndex" converted to type UNSIGNED_SHORT.'),_=wi.Utils.toTypedBufferAttribute(w,Uint16Array)):(E instanceof Uint32Array||E instanceof Int32Array)&&!y.startsWith("_")&&(console.warn(`GLTFExporter: Attribute "${y}" converted to type FLOAT.`),_=wi.Utils.toTypedBufferAttribute(w,Float32Array));let g=this.processAccessor(_||w,o);g!==null&&(y.startsWith("_")||this.detectMeshQuantization(y,w),c[y]=g,t.attributes.set(this.getUID(w),g))}if(p!==void 0&&o.setAttribute("normal",p),Object.keys(c).length===0)return null;if(e.morphTargetInfluences!==void 0&&e.morphTargetInfluences.length>0){let y=[],w=[],S={};if(e.morphTargetDictionary!==void 0)for(let E in e.morphTargetDictionary)S[e.morphTargetDictionary[E]]=E;for(let E=0;E<e.morphTargetInfluences.length;++E){let g={},A=!1;for(let R in o.morphAttributes){if(R!=="position"&&R!=="normal"){A||(console.warn("GLTFExporter: Only POSITION and NORMAL morph are supported."),A=!0);continue}let P=o.morphAttributes[R][E],O=R.toUpperCase(),k=o.attributes[R];if(t.attributes.has(this.getUID(P,!0))){g[O]=t.attributes.get(this.getUID(P,!0));continue}let I=P.clone();if(!o.morphTargetsRelative)for(let F=0,$=P.count;F<$;F++)for(let X=0;X<P.itemSize;X++)X===0&&I.setX(F,P.getX(F)-k.getX(F)),X===1&&I.setY(F,P.getY(F)-k.getY(F)),X===2&&I.setZ(F,P.getZ(F)-k.getZ(F)),X===3&&I.setW(F,P.getW(F)-k.getW(F));g[O]=this.processAccessor(I,o),t.attributes.set(this.getUID(k,!0),g[O])}h.push(g),y.push(e.morphTargetInfluences[E]),e.morphTargetDictionary!==void 0&&w.push(S[E])}l.weights=y,w.length>0&&(l.extras={},l.extras.targetNames=w)}let v=Array.isArray(e.material);if(v&&o.groups.length===0)return null;let m=!1;if(v&&o.index===null){let y=[];for(let w=0,S=o.attributes.position.count;w<S;w++)y[w]=w;o.setIndex(y),m=!0}let f=v?e.material:[e.material],b=v?o.groups:[{materialIndex:0,start:void 0,count:void 0}];for(let y=0,w=b.length;y<w;y++){let S={mode:a,attributes:c};if(this.serializeUserData(o,S),h.length>0&&(S.targets=h),o.index!==null){let g=this.getUID(o.index);(b[y].start!==void 0||b[y].count!==void 0)&&(g+=":"+b[y].start+":"+b[y].count),t.attributes.has(g)?S.indices=t.attributes.get(g):(S.indices=this.processAccessor(o.index,o,b[y].start,b[y].count),t.attributes.set(g,S.indices)),S.indices===null&&delete S.indices}let E=await this.processMaterialAsync(f[b[y].materialIndex],o);E!==null&&(S.material=E),d.push(S)}m===!0&&o.setIndex(null),l.primitives=d,n.meshes||(n.meshes=[]),await this._invokeAllAsync(function(y){y.writeMesh&&y.writeMesh(e,l)});let T=n.meshes.push(l)-1;return t.meshes.set(r,T),T}detectMeshQuantization(e,t){if(this.extensionsUsed[dh])return;let n;switch(t.array.constructor){case Int8Array:n="byte";break;case Uint8Array:n="unsigned byte";break;case Int16Array:n="short";break;case Uint16Array:n="unsigned short";break;default:return}t.normalized&&(n+=" normalized");let s=e.split("_",1)[0];Lf[s]&&Lf[s].includes(n)&&(this.extensionsUsed[dh]=!0,this.extensionsRequired[dh]=!0)}processCamera(e){let t=this.json;t.cameras||(t.cameras=[]);let n=e.isOrthographicCamera,s={type:n?"orthographic":"perspective"};return n?s.orthographic={xmag:e.right*2,ymag:e.top*2,zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near}:s.perspective={aspectRatio:e.aspect,yfov:Vi.degToRad(e.fov),zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near},e.name!==""&&(s.name=e.type),t.cameras.push(s)-1}processAnimation(e,t){let n=this.json,s=this.nodeMap;n.animations||(n.animations=[]),e=wi.Utils.mergeMorphTargetTracks(e.clone(),t);let r=e.tracks,o=[],a=[];for(let c=0;c<r.length;++c){let d=r[c],h=ot.parseTrackName(d.name),u=ot.findNode(t,h.nodeName),p=Nf[h.propertyName];if(h.objectName==="bones"&&(u.isSkinnedMesh===!0?u=u.skeleton.getBoneByName(h.objectIndex):u=void 0),!u||!p){console.warn('THREE.GLTFExporter: Could not export animation track "%s".',d.name);continue}let _=1,v=d.values.length/d.times.length;p===Nf.morphTargetInfluences&&(v/=u.morphTargetInfluences.length);let m;d.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline===!0?(m="CUBICSPLINE",v/=3):d.getInterpolation()===Li?m="STEP":m="LINEAR",a.push({input:this.processAccessor(new Ge(d.times,_)),output:this.processAccessor(new Ge(d.values,v)),interpolation:m}),o.push({sampler:a.length-1,target:{node:s.get(u),path:p}})}let l={name:e.name||"clip_"+n.animations.length,samplers:a,channels:o};return this.serializeUserData(e,l),n.animations.push(l),n.animations.length-1}processSkin(e){let t=this.json,n=this.nodeMap,s=t.nodes[n.get(e)],r=e.skeleton;if(r===void 0)return null;let o=e.skeleton.bones[0];if(o===void 0)return null;let a=[],l=new Float32Array(r.bones.length*16),c=new ke;for(let h=0;h<r.bones.length;++h)a.push(n.get(r.bones[h])),c.copy(r.boneInverses[h]),c.multiply(e.bindMatrix).toArray(l,h*16);return t.skins===void 0&&(t.skins=[]),t.skins.push({inverseBindMatrices:this.processAccessor(new Ge(l,16)),joints:a,skeleton:n.get(o)}),s.skin=t.skins.length-1}async processNodeAsync(e){let t=this.json,n=this.options,s=this.nodeMap;if(t.nodes||(t.nodes=[]),e.pivot!==null)return await this._processNodeWithPivotAsync(e);let r={};if(n.trs){let a=e.quaternion.toArray(),l=e.position.toArray(),c=e.scale.toArray();Kn(a,[0,0,0,1])||(r.rotation=a),Kn(l,[0,0,0])||(r.translation=l),Kn(c,[1,1,1])||(r.scale=c)}else e.matrixAutoUpdate&&e.updateMatrix(),sv(e.matrix)===!1&&(r.matrix=e.matrix.elements);if(e.name!==""&&(r.name=String(e.name)),this.serializeUserData(e,r),e.isMesh||e.isLine||e.isPoints){let a=await this.processMeshAsync(e);a!==null&&(r.mesh=a)}else e.isCamera&&(r.camera=this.processCamera(e));e.isSkinnedMesh&&this.skins.push(e);let o=t.nodes.push(r)-1;if(s.set(e,o),e.children.length>0){let a=[];for(let l=0,c=e.children.length;l<c;l++){let d=e.children[l];if(d.visible||n.onlyVisible===!1){let h=await this.processNodeAsync(d);h!==null&&a.push(h)}}a.length>0&&(r.children=a)}return await this._invokeAllAsync(function(a){a.writeNode&&a.writeNode(e,r)}),o}async _processNodeWithPivotAsync(e){let t=this.json,n=this.options,s=this.nodeMap,r=e.pivot,o={},a=e.quaternion.toArray(),l=[e.position.x+r.x,e.position.y+r.y,e.position.z+r.z],c=e.scale.toArray();Kn(a,[0,0,0,1])||(o.rotation=a),Kn(l,[0,0,0])||(o.translation=l),Kn(c,[1,1,1])||(o.scale=c),o.extras={pivot:r.toArray()},e.name!==""&&(o.name=String(e.name)),this.serializeUserData(e,o);let d=t.nodes.push(o)-1;s.set(e,d);let h={},u=[-r.x,-r.y,-r.z];if(Kn(u,[0,0,0])||(h.translation=u),e.isMesh||e.isLine||e.isPoints){let v=await this.processMeshAsync(e);v!==null&&(h.mesh=v)}else e.isCamera&&(h.camera=this.processCamera(e));e.isSkinnedMesh&&this.skins.push(e);let _=[t.nodes.push(h)-1];if(e.children.length>0){let v=[];for(let m=0,f=e.children.length;m<f;m++){let b=e.children[m];if(b.visible||n.onlyVisible===!1){let T=await this.processNodeAsync(b);T!==null&&v.push(T)}}v.length>0&&(h.children=v)}return o.children=_,await this._invokeAllAsync(function(v){v.writeNode&&v.writeNode(e,o)}),d}async processSceneAsync(e){let t=this.json,n=this.options;t.scenes||(t.scenes=[],t.scene=0);let s={};e.name!==""&&(s.name=e.name),t.scenes.push(s);let r=[];for(let o=0,a=e.children.length;o<a;o++){let l=e.children[o];if(l.visible||n.onlyVisible===!1){let c=await this.processNodeAsync(l);c!==null&&r.push(c)}}r.length>0&&(s.nodes=r),this.serializeUserData(e,s)}async processObjectsAsync(e){let t=new oi;t.name="AuxScene";for(let n=0;n<e.length;n++)t.children.push(e[n]);await this.processSceneAsync(t)}async processInputAsync(e){let t=this.options;e=e instanceof Array?e:[e],await this._invokeAllAsync(function(s){s.beforeParse&&s.beforeParse(e)});let n=[];for(let s=0;s<e.length;s++)e[s]instanceof oi?await this.processSceneAsync(e[s]):n.push(e[s]);n.length>0&&await this.processObjectsAsync(n);for(let s=0;s<this.skins.length;++s)this.processSkin(this.skins[s]);if(e.length===1)for(let s=0;s<t.animations.length;++s)this.processAnimation(t.animations[s],e[0]);else for(let s=0;s<e.length;s++){let r=t.animations[s]||[];for(let o=0;o<r.length;++o)this.processAnimation(r[o],e[s])}await this._invokeAllAsync(function(s){s.afterParse&&s.afterParse(e)})}async _invokeAllAsync(e){for(let t=0,n=this.plugins.length;t<n;t++)await e(this.plugins[t])}},gh=class{constructor(e){this.writer=e,this.name="KHR_lights_punctual"}writeNode(e,t){if(!e.isLight)return;if(!e.isDirectionalLight&&!e.isPointLight&&!e.isSpotLight){console.warn("THREE.GLTFExporter: Only directional, point, and spot lights are supported.",e);return}let n=this.writer,s=n.json,r=n.extensionsUsed,o={};e.name&&(o.name=e.name),o.color=e.color.toArray(),o.intensity=e.intensity,e.isDirectionalLight?o.type="directional":e.isPointLight?(o.type="point",e.distance>0&&(o.range=e.distance)):e.isSpotLight&&(o.type="spot",e.distance>0&&(o.range=e.distance),o.spot={},o.spot.innerConeAngle=(1-e.penumbra)*e.angle,o.spot.outerConeAngle=e.angle),e.decay!==void 0&&e.decay!==2&&console.warn("THREE.GLTFExporter: Light decay may be lost. glTF is physically-based, and expects light.decay=2."),e.target&&(e.target.parent!==e||e.target.position.x!==0||e.target.position.y!==0||e.target.position.z!==-1)&&console.warn("THREE.GLTFExporter: Light direction may be lost. For best results, make light.target a child of the light with position 0,0,-1."),r[this.name]||(s.extensions=s.extensions||{},s.extensions[this.name]={lights:[]},r[this.name]=!0);let a=s.extensions[this.name].lights;a.push(o),t.extensions=t.extensions||{},t.extensions[this.name]={light:a.length-1}}},_h=class{constructor(e){this.writer=e,this.name="KHR_materials_unlit"}async writeMaterialAsync(e,t){if(!e.isMeshBasicMaterial)return;let s=this.writer.extensionsUsed;t.extensions=t.extensions||{},t.extensions[this.name]={},s[this.name]=!0,t.pbrMetallicRoughness.metallicFactor=0,t.pbrMetallicRoughness.roughnessFactor=.9}},xh=class{constructor(e){this.writer=e,this.name="KHR_materials_clearcoat"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.clearcoat===0)return;let n=this.writer,s=n.extensionsUsed,r={};if(r.clearcoatFactor=e.clearcoat,e.clearcoatMap){let o={index:await n.processTextureAsync(e.clearcoatMap),texCoord:e.clearcoatMap.channel};n.applyTextureTransform(o,e.clearcoatMap),r.clearcoatTexture=o}if(r.clearcoatRoughnessFactor=e.clearcoatRoughness,e.clearcoatRoughnessMap){let o={index:await n.processTextureAsync(e.clearcoatRoughnessMap),texCoord:e.clearcoatRoughnessMap.channel};n.applyTextureTransform(o,e.clearcoatRoughnessMap),r.clearcoatRoughnessTexture=o}if(e.clearcoatNormalMap){let o={index:await n.processTextureAsync(e.clearcoatNormalMap),texCoord:e.clearcoatNormalMap.channel};e.clearcoatNormalScale.x!==1&&(o.scale=e.clearcoatNormalScale.x),n.applyTextureTransform(o,e.clearcoatNormalMap),r.clearcoatNormalTexture=o}t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},yh=class{constructor(e){this.writer=e,this.name="KHR_materials_dispersion"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.dispersion===0)return;let s=this.writer.extensionsUsed,r={};r.dispersion=e.dispersion,t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},vh=class{constructor(e){this.writer=e,this.name="KHR_materials_iridescence"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.iridescence===0)return;let n=this.writer,s=n.extensionsUsed,r={};if(r.iridescenceFactor=e.iridescence,e.iridescenceMap){let o={index:await n.processTextureAsync(e.iridescenceMap),texCoord:e.iridescenceMap.channel};n.applyTextureTransform(o,e.iridescenceMap),r.iridescenceTexture=o}if(r.iridescenceIor=e.iridescenceIOR,r.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],r.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1],e.iridescenceThicknessMap){let o={index:await n.processTextureAsync(e.iridescenceThicknessMap),texCoord:e.iridescenceThicknessMap.channel};n.applyTextureTransform(o,e.iridescenceThicknessMap),r.iridescenceThicknessTexture=o}t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},bh=class{constructor(e){this.writer=e,this.name="KHR_materials_transmission"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.transmission===0)return;let n=this.writer,s=n.extensionsUsed,r={};if(r.transmissionFactor=e.transmission,e.transmissionMap){let o={index:await n.processTextureAsync(e.transmissionMap),texCoord:e.transmissionMap.channel};n.applyTextureTransform(o,e.transmissionMap),r.transmissionTexture=o}t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Sh=class{constructor(e){this.writer=e,this.name="KHR_materials_volume"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.transmission===0)return;let n=this.writer,s=n.extensionsUsed,r={};if(r.thicknessFactor=e.thickness,e.thicknessMap){let o={index:await n.processTextureAsync(e.thicknessMap),texCoord:e.thicknessMap.channel};n.applyTextureTransform(o,e.thicknessMap),r.thicknessTexture=o}e.attenuationDistance!==1/0&&(r.attenuationDistance=e.attenuationDistance),r.attenuationColor=e.attenuationColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Mh=class{constructor(e){this.writer=e,this.name="KHR_materials_ior"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.ior===1.5)return;let s=this.writer.extensionsUsed,r={};r.ior=e.ior,t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},wh=class{constructor(e){this.writer=e,this.name="KHR_materials_specular"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.specularIntensity===1&&e.specularColor.equals(jy)&&!e.specularIntensityMap&&!e.specularColorMap)return;let n=this.writer,s=n.extensionsUsed,r={};if(e.specularIntensityMap){let o={index:await n.processTextureAsync(e.specularIntensityMap),texCoord:e.specularIntensityMap.channel};n.applyTextureTransform(o,e.specularIntensityMap),r.specularTexture=o}if(e.specularColorMap){let o={index:await n.processTextureAsync(e.specularColorMap),texCoord:e.specularColorMap.channel};n.applyTextureTransform(o,e.specularColorMap),r.specularColorTexture=o}r.specularFactor=e.specularIntensity,r.specularColorFactor=e.specularColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Th=class{constructor(e){this.writer=e,this.name="KHR_materials_sheen"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.sheen==0)return;let n=this.writer,s=n.extensionsUsed,r={};if(e.sheenRoughnessMap){let o={index:await n.processTextureAsync(e.sheenRoughnessMap),texCoord:e.sheenRoughnessMap.channel};n.applyTextureTransform(o,e.sheenRoughnessMap),r.sheenRoughnessTexture=o}if(e.sheenColorMap){let o={index:await n.processTextureAsync(e.sheenColorMap),texCoord:e.sheenColorMap.channel};n.applyTextureTransform(o,e.sheenColorMap),r.sheenColorTexture=o}r.sheenRoughnessFactor=e.sheenRoughness,r.sheenColorFactor=e.sheenColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Ah=class{constructor(e){this.writer=e,this.name="KHR_materials_anisotropy"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.anisotropy==0)return;let n=this.writer,s=n.extensionsUsed,r={};if(e.anisotropyMap){let o={index:await n.processTextureAsync(e.anisotropyMap)};n.applyTextureTransform(o,e.anisotropyMap),r.anisotropyTexture=o}r.anisotropyStrength=e.anisotropy,r.anisotropyRotation=e.anisotropyRotation,t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Eh=class{constructor(e){this.writer=e,this.name="KHR_materials_emissive_strength"}async writeMaterialAsync(e,t){if(!e.isMeshStandardMaterial||e.emissiveIntensity===1)return;let s=this.writer.extensionsUsed,r={};r.emissiveStrength=e.emissiveIntensity,t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Ch=class{constructor(e){this.writer=e,this.name="EXT_materials_bump"}async writeMaterialAsync(e,t){if(!e.isMeshStandardMaterial||e.bumpScale===1&&!e.bumpMap)return;let n=this.writer,s=n.extensionsUsed,r={};if(e.bumpMap){let o={index:await n.processTextureAsync(e.bumpMap),texCoord:e.bumpMap.channel};n.applyTextureTransform(o,e.bumpMap),r.bumpTexture=o}r.bumpFactor=e.bumpScale,t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Rh=class{constructor(e){this.writer=e,this.name="EXT_mesh_gpu_instancing"}writeNode(e,t){if(!e.isInstancedMesh)return;let n=this.writer,s=e,r=new Float32Array(s.count*3),o=new Float32Array(s.count*4),a=new Float32Array(s.count*3),l=new ke,c=new U,d=new Lt,h=new U;for(let p=0;p<s.count;p++)s.getMatrixAt(p,l),l.decompose(c,d,h),c.toArray(r,p*3),d.toArray(o,p*4),h.toArray(a,p*3);let u={TRANSLATION:n.processAccessor(new Ge(r,3)),ROTATION:n.processAccessor(new Ge(o,4)),SCALE:n.processAccessor(new Ge(a,3))};s.instanceColor&&(u._COLOR_0=n.processAccessor(s.instanceColor)),t.extensions=t.extensions||{},t.extensions[this.name]={attributes:u},n.extensionsUsed[this.name]=!0,n.extensionsRequired[this.name]=!0}};wi.Utils={insertKeyframe:function(i,e){let n=i.getValueSize(),s=new i.TimeBufferType(i.times.length+1),r=new i.ValueBufferType(i.values.length+n),o=i.createInterpolant(new i.ValueBufferType(n)),a;if(i.times.length===0){s[0]=e;for(let l=0;l<n;l++)r[l]=0;a=0}else if(e<i.times[0]){if(Math.abs(i.times[0]-e)<.001)return 0;s[0]=e,s.set(i.times,1),r.set(o.evaluate(e),0),r.set(i.values,n),a=0}else if(e>i.times[i.times.length-1]){if(Math.abs(i.times[i.times.length-1]-e)<.001)return i.times.length-1;s[s.length-1]=e,s.set(i.times,0),r.set(i.values,0),r.set(o.evaluate(e),i.values.length),a=s.length-1}else for(let l=0;l<i.times.length;l++){if(Math.abs(i.times[l]-e)<.001)return l;if(i.times[l]<e&&i.times[l+1]>e){s.set(i.times.slice(0,l+1),0),s[l+1]=e,s.set(i.times.slice(l+1),l+2),r.set(i.values.slice(0,(l+1)*n),0),r.set(o.evaluate(e),(l+1)*n),r.set(i.values.slice((l+1)*n),(l+2)*n),a=l+1;break}}return i.times=s,i.values=r,a},mergeMorphTargetTracks:function(i,e){let t=[],n={},s=i.tracks;for(let r=0;r<s.length;++r){let o=s[r],a=ot.parseTrackName(o.name),l=ot.findNode(e,a.nodeName);if(a.propertyName!=="morphTargetInfluences"||a.propertyIndex===void 0){t.push(o);continue}if(o.createInterpolant!==o.InterpolantFactoryMethodDiscrete&&o.createInterpolant!==o.InterpolantFactoryMethodLinear){if(o.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline)throw new Error("THREE.GLTFExporter: Cannot merge tracks with glTF CUBICSPLINE interpolation.");console.warn("THREE.GLTFExporter: Morph target interpolation mode not yet supported. Using LINEAR instead."),o=o.clone(),o.setInterpolation(bs)}let c=l.morphTargetInfluences.length,d=l.morphTargetDictionary[a.propertyIndex];if(d===void 0)throw new Error("THREE.GLTFExporter: Morph target name not found: "+a.propertyIndex);let h;if(n[l.uuid]===void 0){h=o.clone();let p=new h.ValueBufferType(c*h.times.length);for(let _=0;_<h.times.length;_++)p[_*c+d]=h.values[_];h.name=(a.nodeName||"")+".morphTargetInfluences",h.values=p,n[l.uuid]=h,t.push(h);continue}let u=o.createInterpolant(new o.ValueBufferType(1));h=n[l.uuid];for(let p=0;p<h.times.length;p++)h.values[p*c+d]=u.evaluate(h.times[p]);for(let p=0;p<o.times.length;p++){let _=this.insertKeyframe(h,o.times[p]);h.values[_*c+d]=o.values[p]}}return i.tracks=t,i},toTypedBufferAttribute:function(i,e){let t=new Ge(new e(i.count*i.itemSize),i.itemSize,!1);if(!i.normalized&&!i.isInterleavedBufferAttribute)return t.array.set(i.array),t;for(let n=0,s=i.count;n<s;n++)for(let r=0;r<i.itemSize;r++)t.setComponent(n,r,i.getComponent(n,r));return t}};var Ih=1,av="3D Avatar Maker (Marinara Engine)",Ff="Body, hair, skin and clothing: MakeHuman base mesh and system assets (CC0 1.0), and parts made in Blender by ThatOneCan (CC0 1.0).",lv=`${Ff} No credit required.`;function cv(i){let e=[...new Set((i?.clothes??[]).map(t=>Si[t]?.credit).filter(Boolean))];return e.length?`${Ff} Clothing from wardrobe packs: ${e.join("; ")}`:lv}var Bf=1179937895,kf=1313821514,zf=5130562;function Vf(i){let e=i instanceof Uint8Array?i:new Uint8Array(i),t=new DataView(e.buffer,e.byteOffset,e.byteLength);if(e.byteLength<20||t.getUint32(0,!0)!==Bf||t.getUint32(4,!0)!==2)throw new Error("This isn't a .glb file.");let n=null,s=null;for(let r=12;r+8<=e.byteLength;){let o=t.getUint32(r,!0),a=t.getUint32(r+4,!0),l=e.subarray(r+8,r+8+o);a===kf&&!n?n=JSON.parse(new TextDecoder().decode(l)):a===zf&&!s&&(s=l),r+=8+o}if(!n)throw new Error("This .glb file has no description in it.");return{json:n,bin:s}}function hv(i,e=null){let t=(l,c)=>{let d=new Uint8Array(Math.ceil(l.byteLength/4)*4).fill(c);return d.set(l),d},n=t(new TextEncoder().encode(JSON.stringify(i)),32),s=e?t(e,0):null,r=20+n.byteLength+(s?8+s.byteLength:0),o=new Uint8Array(r),a=new DataView(o.buffer);if(a.setUint32(0,Bf,!0),a.setUint32(4,2,!0),a.setUint32(8,r,!0),a.setUint32(12,n.byteLength,!0),a.setUint32(16,kf,!0),o.set(n,20),s){let l=20+n.byteLength;a.setUint32(l,s.byteLength,!0),a.setUint32(l+4,zf,!0),o.set(s,l+8)}return o}function uv(i,e){let t=i.index.array,n=new Int32Array(i.attributes.position.count).fill(-1),s=[],r=[],o=0;for(let l of e){let c=s.length;for(let d=l.start;d<l.start+l.count;d++){let h=t[d];n[h]<0&&(n[h]=o++),s.push(n[h])}s.length>c&&r.push({start:c,count:s.length-c,materialIndex:l.materialIndex})}let a=new At;for(let[l,c]of Object.entries(i.attributes)){let d=c.itemSize,h=new c.array.constructor(o*d);for(let u=0;u<n.length;u++){let p=n[u];if(!(p<0))for(let _=0;_<d;_++)h[p*d+_]=c.array[u*d+_]}if(l==="normal")for(let u=0;u<h.length;u+=3){let p=Math.hypot(h[u],h[u+1],h[u+2])||1;h[u]/=p,h[u+1]/=p,h[u+2]/=p}a.setAttribute(l,new Ge(h,d,c.normalized))}a.setIndex(o>65535?new Ni(s,1):new Xn(s,1));for(let l of r)a.addGroup(l.start,l.count,l.materialIndex);return{geometry:a,vertices:o,triangles:s.length/3}}function dv(i,e){let t=i.alphaTest>=.5;return new Mr({name:e,map:i.map??null,color:i.color,vertexColors:i.vertexColors,roughness:.9,metalness:0,side:i.side===Nt?Nt:Pn,alphaTest:t?i.alphaTest:0,transparent:!t&&i.transparent,depthWrite:t||!i.transparent})}async function Hf(i,{look:e={},name:t="",maxTextureSize:n=2048}={}){await Hd(),Ys(i);let s=[],r=[],o=new Map,a=0,l=0;try{i.meshes.forEach((p,_)=>{let v=Array.isArray(p.material)?p.material:[p.material],m=Array.isArray(p.material)?p.geometry.groups.map(({start:T,count:y,materialIndex:w})=>({start:T,count:y,materialIndex:w})):[{start:0,count:p.geometry.index.count,materialIndex:0}],f=uv(p.geometry,m);a+=f.vertices,l+=f.triangles;let b=v.map((T,y)=>{let w=dv(T,`${p.name||"part"}-${_}-${y}`);if(w.map){let S=w.transparent||w.alphaTest>0;o.set(w.map,S||o.get(w.map)==="image/png"?"image/png":"image/jpeg")}return w});b.some(T=>T.vertexColors)||f.geometry.deleteAttribute("color"),s.push({mesh:p,geometry:p.geometry,material:p.material}),r.push(f.geometry,...b),p.geometry=f.geometry,p.material=Array.isArray(p.material)?b:b[0]});let c=new Map([...o.keys()].map(p=>[p,p.userData.mimeType]));for(let[p,_]of o)p.userData.mimeType=_;let d;try{d=await new wi().parseAsync(i.object,{binary:!0,maxTextureSize:n})}finally{for(let[p,_]of c)_===void 0?delete p.userData.mimeType:p.userData.mimeType=_}let{json:h,bin:u}=Vf(d);return h.asset={...h.asset,generator:av,copyright:cv(e)},h.extras={...h.extras,avatarMaker:{format:Ih,name:String(t??""),look:e}},{bytes:hv(h,u),vertices:a,triangles:l}}finally{for(let{mesh:c,geometry:d,material:h}of s)c.geometry=d,c.material=h;for(let c of r)c.dispose()}}function Gf(i){try{let e=Vf(i).json.extras?.avatarMaker;return e&&typeof e.look=="object"&&e.look?{name:String(e.name??""),look:e.look}:null}catch{return null}}var fv=1,qf="avatar-pack.json",Wf=/^[a-z0-9_]{1,64}$/u,pv=/^(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.pack\.png$/u,mv=["male","female"],gv=/^(?:CC0-1\.0|CC-BY-[34]\.0)$/u,_v=500,Qi=(i,e)=>typeof i=="string"&&i.trim()&&i.length<=e?i.trim():null,xv=i=>Number.isInteger(i)&&i>=0&&i<=16777215,Xf=(i,e)=>Array.isArray(i)&&i.every(t=>e.includes(t)),$f=(i,e)=>{let t=Qi(i.version,40);return`/api/capability-packages/${i.id}/assets/${e}${t?`?v=${encodeURIComponent(t)}`:""}`};function Zf(i){let e=i?.id;return typeof e=="string"&&/^[a-z0-9-]{1,100}$/u.test(e)&&e.startsWith(`${sn}-`)&&i.status==="active"&&Array.isArray(i.manifest?.contributions?.assets?.paths)&&i.manifest.contributions.assets.paths.includes(qf)}function yv(i,e){if(!Zf(i)||e?.format!==1||e.for!==sn||e.body!==fv)return[];let t=i.manifest.contributions.assets.paths,n=Qi(e.name,80)??Qi(i.manifest.name,80)??i.id,s=e.pieces&&typeof e.pieces=="object"?Object.entries(e.pieces):[],r=js.map(([l])=>l),o=Qs.map(([l])=>l),a=[];for(let[l,c]of s.slice(0,_v)){if(!Wf.test(l)||l in Object.prototype||Object.hasOwn($t,l)||a.some(m=>m.piece===l)||!c||typeof c!="object")continue;let d=Qi(c.label,60),h=Qi(c.author,80),u=Qi(c.licence,20),p=c.credit===null||c.credit===void 0?null:Qi(c.credit,300),_=Array.isArray(c.bodies)?[...new Set(c.bodies)]:[];d&&h&&gv.test(u??"")&&(u==="CC0-1.0"||p)&&(c.credit===null||c.credit===void 0||p)&&r.includes(c.slot)&&_.length&&Xf(_,mv)&&Number.isInteger(c.layer)&&c.layer>=0&&c.layer<=9&&Xf(c.hides,wf)&&(c.variants===void 0||Array.isArray(c.variants)&&c.variants.every(m=>Wf.test(m)))&&c.parts&&typeof c.parts=="object"&&_.every(m=>c.parts[m]===void 0||Array.isArray(c.parts[m])&&c.parts[m].every(f=>Array.isArray(f)&&f.length===2&&o.includes(f[0])&&xv(f[1])))&&typeof c.bundle=="string"&&pv.test(c.bundle)&&t.includes(c.bundle)&&a.push({piece:l,label:d,slot:c.slot,bodies:_,layer:c.layer,hides:[...c.hides],parts:Object.fromEntries(_.map(m=>[m,(c.parts[m]??[]).map(([f,b])=>[f,b])])),variants:[],url:$f(i,c.bundle),pack:i.id,packName:n,licence:u,author:h,credit:p})}return a}var Yf=null;function Kf(){return Yf??=(async()=>{try{let i=await nr("/api/capability-packages/installed",1e4),e=(Array.isArray(i)?i:[]).filter(Zf).sort((s,r)=>s.id.localeCompare(r.id)),t=await Promise.all(e.map(s=>nr($f(s,qf),1e4))),n=[];return e.forEach((s,r)=>{let o=yv(s,t[r]);df(o),n.push(...o)}),n}catch(i){return console.warn(`[${sn}] the wardrobe packs couldn't be read`,i),[]}})(),Yf}var vv=[["start","Start"],["body","Body"],["face","Face"],["skin","Skin and eyes"],["hair","Hair"],["clothes","Clothes"],["save","Save"]];function me(i,e={},...t){let n=document.createElement(i);for(let[s,r]of Object.entries(e??{}))r==null||r===!1||(s.startsWith("on")?n.addEventListener(s.slice(2),r):s==="class"?n.className=r:s in n&&s!=="list"?n[s]=r:n.setAttribute(s,r===!0?"":r));for(let s of t.flat())s!=null&&s!==!1&&n.append(s);return n}var bv=0,jf=()=>`am-${++bv}`,Ph=(i,e)=>i.find(([t])=>t===e)?.[1]??e;function vt(i,e,t=""){let n=e.id||(e.id=jf());return me("div",{class:"row"},me("label",{class:"name",htmlFor:n,title:t||void 0},i),me("div",{},e,t?me("div",{class:"ends"},me("span",{},t)):null))}function bt(i,e,t,n){let s=me("select",{"aria-label":n,onchange:()=>t(s.value)});for(let[r,o]of i)s.append(new Option(o,r,!1,r===e));return s}function Jf({name:i,says:e,ends:t,least:n,most:s,step:r=.01,at:o,onInput:a}){let l=jf(),c=me("input",{id:l,type:"range",min:n,max:s,step:r,value:o,"aria-describedby":`${l}-says`,oninput:()=>a(Number(c.value))});return me("div",{class:"row"},me("label",{class:"name",htmlFor:l,title:e},i),me("div",{},c,me("div",{class:"ends",id:`${l}-says`},me("span",{},t?.[0]??""),me("span",{},t?.[1]??""))))}function Ti(i,e,t,n,s=""){let r=me("div",{class:"swatches",role:"group","aria-label":i});for(let[a,l]of e)r.append(me("button",{class:"swatch",type:"button",title:l,"aria-label":`${i}: ${l}`,"aria-pressed":String(a===t),style:`background:${lh(a)}`,onclick:()=>n(a,!0)}));let o=me("input",{type:"color",value:lh(t??e[0]?.[0]??8421504),title:`${i}: a colour of your own`,"aria-label":`${i}: a colour of your own`,oninput:()=>n(gf(o.value),!1)});return r.append(o),me("div",{class:"row"},me("span",{class:"name",title:s||void 0},i),me("div",{},r,s?me("div",{class:"ends"},me("span",{},s)):null))}var Rt=(i,e,...t)=>me("section",{class:"group"},me("h2",{},i),e?me("p",{class:"says"},e):null,...t);function Qf(i){let e=me("div",{class:"tabs",role:"tablist","aria-label":"Avatar sections"}),t=me("div",{class:"body",role:"tabpanel",tabIndex:0}),n=me("section",{class:"panel","aria-label":"Avatar controls"},e,t),s={text:"",bad:!1},r=null,o=(f,b=!0)=>i.onChange(f,{redraw:b}),a={start:({filled:f})=>[Rt("Start from a ready-made look","A preset sets the body and its shape. Everything can be changed afterwards.",vt("Preset",bt([["","Choose one…"],...oh.map((b,T)=>[String(T),b.name])],"",b=>{let T=oh[Number(b)];b!==""&&T&&i.onNew(T.look)},"Start from a preset")),me("div",{class:"swatches"},me("button",{type:"button",onclick:()=>i.onNew({body:"female"})},"New female avatar"),me("button",{type:"button",onclick:()=>i.onNew({body:"male"})},"New male avatar"))),Rt("Style","A starting point for the face and head. It sets the Face tab's sliders, so everything stays adjustable. An anime drawing style (flat shading and outlines) is planned for the saved file.",vt("Style",bt([["","Choose one…"],...sl.map(([b,T])=>[b,T])],"",b=>{let T=sl.find(([w])=>w===b);if(!T)return;let y=Object.fromEntries(sf.map(w=>[w,0]));o({shape:{...y,...T[3].shape},limbs:T[3].limbs})},"Style"),sl.map(([,b,T])=>`${b}: ${T}`).join(" "))),Rt("Where this avatar is",`Body: ${Ph(nl,f.body)}. Your work is kept in this browser as you go. Use the Save tab to keep it as a file.`)],body:({filled:f,choices:b})=>[Rt("Body","",vt("Body",bt(nl,f.body,T=>o({body:T}),"Body"),"Each body has its own hair fits, underwear and some clothes."),vt("Race",bt([["","Choose one…"],...wn.filter(([T])=>b.races.includes(T)).map(([T,y])=>[T,y])],"",T=>{if(!T)return;let y=ef(T,f.body);o({...y,shape:y.shape,limbs:y.limbs,colours:y.colours??{}})},"Start from a race"),"A preset: it sets the race sliders below, height, limb lengths and that race's usual extras. Change any of them after."),vt("Age",bt(eh,f.age,T=>o({age:T}),"Age"),"Changes the body's shape and the skin picture."),d({name:"Height",says:"The whole figure, taller or shorter.",ends:["Short","Tall"],least:xi[0],most:xi[1],at:f.height,onInput:T=>o({height:T},!1)})),h("race","Race features","Each race's build and face, mixed as you like. A race chosen above sets these.",...yi.filter(([T])=>Ks(T,b.keys,f.body)).map(T=>p(T,f,b))),Rt("Build","The middle of each slider is the body's own shape.",...Zi.filter(([T])=>Ks(T,b.keys,f.body)).map(T=>p(T,f,b))),...nf.map(([T,y,w])=>{let S=bi.filter(([E,,,,,,g])=>g===T&&Ks(E,b.keys,f.body));return S.length?h(`body-${T}`,y,w,...S.map(E=>p(E,f,b)),me("button",{type:"button",onclick:()=>o({shape:Object.fromEntries(S.map(([E])=>[E,0]))})},`Back to the ${y.toLowerCase()} as made`)):null}),Rt("Proportions","",...Js.map(([T,y,w,S,E,g])=>d({name:y,says:E,ends:g,least:w,most:S,step:.005,at:f.limbs[T],onInput:A=>o({limbs:{[T]:A}},!1)})))],face:({filled:f,choices:b})=>[Rt("Face shape","The face's overall shape. Each part of the face has more below.",u("shape","Face outline"),...vi.filter(([T])=>Ks(T,b.keys,f.body)).map(T=>p(T,f,b))),...tf.map(([T,y,w])=>{let S=Tn.filter(([E,,,,,,g])=>g===T&&Ks(E,b.keys,f.body));return S.length?h(T,y,w,Kc[T]?u(T,"Ready-made"):null,...S.map(E=>p(E,f,b)),me("button",{type:"button",onclick:()=>o({shape:Object.fromEntries(Jc(T).map(E=>[E,0]))})},`Back to the ${y.toLowerCase()} as made`)):null}),Rt("Brows and lashes","",vt("Brows",bt(b.brows.map(T=>[String(T),cf[T]??`Style ${T}`]),String(f.brows),T=>o({brows:Number(T)}),"Brow style")),vt("Lashes",bt(b.lashes.map(T=>[String(T),hf[T]??`Style ${T}`]),String(f.lashes),T=>o({lashes:Number(T)}),"Lash style")),Ti("Brow colour",qi,f.colours.brows,(T,y)=>o({colours:{brows:T}},y))),Rt("Accessories","Anyone can wear any of these, whatever their race.",...Zs.filter(([T])=>(b[T]??[]).length).map(([T,y,w,S])=>vt(w,bt(y.filter(([E])=>E===gt||b[T].includes(E)),f[T],E=>o({[T]:E}),w),S)),f.horns!==gt?Ti("Horn colour",Ki,f.colours.horns,(T,y)=>o({colours:{horns:T}},y)):null,b.tail?vt("Tail",bt([["no","No tail"],["yes","A tiefling's tail"]],f.tail?"yes":"no",T=>o({tail:T==="yes"}),"Tail")):null)],skin:({filled:f})=>[Rt("Skin","",vt("Skin",bt(ol(f.body),f.skin,b=>o({skin:b}),"Skin"),"A skin picture, or the plain skin in a colour of your own."),f.skin==="custom"?Ti("Skin colour",$n,f.colours.skin,(b,T)=>o({skin:"custom",colours:{skin:b}},T)):null),Rt("Eyes","",vt("Eyes",bt([[On,"A colour of your own"],...Xr],f.eyePicture,b=>o({eyePicture:b}),"Eyes"),"A pictured eye, or the grey iris in a colour."),f.eyePicture===On?Ti("Eye colour",qr,f.colours.eyes,(b,T)=>o({colours:{eyes:b}},T)):null),Rt("Lips and nails","Left alone, each colour follows the skin.",vt("Fingernails",bt(al,f.nails,b=>o({nails:b}),"Fingernails"),"Their length, or none. Gloves hide them."),vt("Toenails",bt([["on","On"],["off","Off"]],f.toenails?"on":"off",b=>o({toenails:b==="on"}),"Toenails"),"Shoes hide them."),...th.filter(([b])=>b==="lips"||b==="nails").map(([b,T,y,w])=>Ti(T,y,f.colours[b],(S,E)=>o({colours:{[b]:S}},E),w)),me("button",{type:"button",onclick:()=>o({colours:{lips:void 0,nails:void 0}})},"Back to the skin's own lips and nails"))],hair:({filled:f,choices:b})=>[Rt("Hair","",vt("Style",bt($s.filter(([T])=>b.hair.includes(T)),f.hair,T=>o({hair:T}),"Hair style"),"A hood or helm that covers the head hides the hair."),Ti("Hair colour",qi,f.hairColour,(T,y)=>o({hairTint:T,hairColour:void 0},y)))],clothes:({filled:f,choices:b})=>{let T=new Map(js.map(([S])=>[S,[]]));for(let S of b.clothes)T.get(S.slot)?.push(S);let y=new Set(f.clothes),w=(S,E)=>{let g=f.clothes.filter(A=>T.get(S).every(R=>R.piece!==A));o({clothes:E?[...g,E]:g})};return[Rt("Ready-made outfits","Changes the clothes only.",vt("Outfit",bt([["","Choose one…"],...jr.map((S,E)=>[String(E),S.name]),["none","Nothing on"]],"",S=>{S==="none"?o({clothes:[],clothColours:void 0,variants:void 0}):S!==""&&o(_(cl(jr[Number(S)],f.body)))},"Put on a ready-made outfit"))),Rt("Underwear","Hidden by whatever is worn over it.",b.tops.length?vt("Top",bt([[gt,"None"],...Zr.filter(([S])=>b.tops.includes(S))],f.underwear.top,S=>o({underwear:{top:S}}),"Underwear top")):null,vt("Bottom",bt([[gt,"None"],...Kr.filter(([S])=>b.bottoms.includes(S))],f.underwear.bottom,S=>o({underwear:{bottom:S}}),"Underwear bottom")),Ti("Colour",$r,f.colours.underwear,(S,E)=>o({colours:{underwear:S}},E))),Rt("Clothes and armour","One piece in each place. Pieces further down the list are worn over the ones above where they overlap.",...js.filter(([S])=>T.get(S).length).map(([S,E,g])=>{let A=T.get(S),R=A.find(I=>y.has(I.piece)),P=vt(E,bt([["","None"],...A.map(I=>[I.piece,Ph(Jr,I.piece)])],R?.piece??"",I=>w(S,I),E),g);if(!R)return P;let O=sh[R.piece],k=Si[R.piece];return me("div",{class:"piece"},P,k?me("p",{class:"says"},`From ${k.packName}, by ${k.author}${k.credit?` (${k.licence.replace(/-/gu," ")})`:""}.`):null,O&&R.variants?.length?vt(O.label,bt(O.ways,f.variants[R.piece]??"",I=>o({variants:{[R.piece]:I||void 0}}),O.label),O.says):null,...R.parts.map(([I,F])=>Ti(Ph(Qs,I),er,f.clothColours[R.piece]?.[I]??F,($,X)=>o({clothColours:{[R.piece]:{...f.clothColours[R.piece],[I]:$}}},X))))}))]},save:({exported:f})=>[Rt("Keep working on it later","A small file with every choice you made. Open it here again to carry on.",me("div",{class:"swatches"},me("button",{type:"button",onclick:i.onSaveLook},"Save the look (.json)"),me("button",{type:"button",onclick:i.onOpen},"Open a look or avatar…"))),Rt("Save as a 3D avatar","A .glb file with the body, hair, clothes and pictures in it. The file also remembers your choices, so it can be opened here again.",vt("Picture size",l=bt([["2048","Full (sharpest, largest file)"],["1024","Half (smaller file, good for phones)"],["512","Quarter (smallest)"]],l?.value??"2048",()=>{},"Picture size"),"How large the skin and clothing pictures are in the file."),me("button",{class:"main",type:"button",onclick:()=>i.onExport({maxTextureSize:Number(l.value)})},"Save as GLB"),f?me("p",{class:"says"},`Saved ${f.file}: ${(f.bytes/1048576).toFixed(1)} MB, ${f.vertices.toLocaleString()} points, ${f.triangles.toLocaleString()} triangles.`):null),Rt("Use it in a chat","The 3D Avatars agent shows the file. This version has a still face: it blinks and talks once face movement is added to the bodies.",me("ol",{class:"steps"},me("li",{},"Open Agents and install 3D Avatars from the Agent Organizer if you haven't."),me("li",{},"Open 3D Avatars and pick the character or persona."),me("li",{},"Under Avatar type choose GLB or FBX model, then Import GLB or FBX and choose the saved file."),me("li",{},"Turn on Show this avatar in chats, and add 3D Avatars to the chat under Chat Settings → Agents.")))]},l=null,c=new Set(["eyes"]);function d({least:f,most:b,at:T,onInput:y,...w}){let S=g=>g<1?-(1-g)/(1-f):(g-1)/(b-1),E=g=>Math.round((g<0?1+g*(1-f):1+g*(b-1))*1e3)/1e3;return Jf({...w,least:-1,most:1,at:S(T),onInput:g=>y(E(g))})}function h(f,b,T,...y){let w=me("details",{class:"group fold",open:c.has(f),ontoggle:()=>w.open?c.add(f):c.delete(f)},me("summary",{},b),T?me("p",{class:"says"},T):null,...y);return w}function u(f,b){let T=Kc[f]??[];return vt(b,bt([["","Choose one…"],...T.map(([y],w)=>[String(w),y])],"",y=>{let w=T[Number(y)];if(!w)return;let S=Object.fromEntries(Jc(f).map(E=>[E,0]));o({shape:{...S,...w[1]}})},`${b} for the ${f==="shape"?"face":f}`),"Sets the sliders below; adjust them after.")}function p(f,b,T){let[y,w,,,S,E]=f,g=rl(f,T.keys);return Jf({name:w,says:S,ends:E,least:g[0]<0?-1:0,most:1,at:rf(b.shape[y],g),onInput:A=>o({shape:{[y]:Math.round(of(A,g)*1e3)/1e3}},!1)})}let _=f=>({clothes:f.clothes??[],clothColours:{$set:f.clothColours??{}},variants:{$set:f.variants??{}}});function v(f){e.replaceChildren(...vv.map(([T,y])=>me("button",{type:"button",role:"tab",id:`am-tab-${T}`,"aria-selected":String(T===f.tab),onclick:()=>i.onTab(T)},y))),t.setAttribute("aria-labelledby",`am-tab-${f.tab}`);let b=t.scrollTop;r=me("p",{class:`status${s.bad?" bad":""}`,role:"status","aria-live":"polite"},s.text),t.replaceChildren(r,...(f.filled&&f.choices?a[f.tab](f):[]).filter(Boolean)),t.scrollTop=b}function m(f,b=!1){s={text:f,bad:b},r&&(r.textContent=f,r.className=`status${b?" bad":""}`)}return{element:n,render:v,setStatus:m}}var ep={type:"change"},Nh={type:"start"},np={type:"end"},fl=new Di,tp=new en,Sv=Math.cos(70*Vi.DEG2RAD),It=new U,Jt=2*Math.PI,ct={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Lh=1e-6,pl=class extends Cr{constructor(e,t=null){super(e,t),this.state=ct.NONE,this.target=new U,this.cursor=new U,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:fi.ROTATE,MIDDLE:fi.DOLLY,RIGHT:fi.PAN},this.touches={ONE:pi.ROTATE,TWO:pi.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new U,this._lastQuaternion=new Lt,this._lastTargetPosition=new U,this._quat=new Lt().setFromUnitVectors(e.up,new U(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Us,this._sphericalDelta=new Us,this._scale=1,this._panOffset=new U,this._rotateStart=new Oe,this._rotateEnd=new Oe,this._rotateDelta=new Oe,this._panStart=new Oe,this._panEnd=new Oe,this._panDelta=new Oe,this._dollyStart=new Oe,this._dollyEnd=new Oe,this._dollyDelta=new Oe,this._dollyDirection=new U,this._mouse=new Oe,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=wv.bind(this),this._onPointerDown=Mv.bind(this),this._onPointerUp=Tv.bind(this),this._onContextMenu=Lv.bind(this),this._onMouseWheel=Cv.bind(this),this._onKeyDown=Rv.bind(this),this._onTouchStart=Iv.bind(this),this._onTouchMove=Pv.bind(this),this._onMouseDown=Av.bind(this),this._onMouseMove=Ev.bind(this),this._interceptControlDown=Nv.bind(this),this._interceptControlUp=Dv.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=ct.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents();let e=this.domElement.getRootNode();e.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),e.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(ep),this.update(),this.state=ct.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){let t=this.object.position;It.copy(t).sub(this.target),It.applyQuaternion(this._quat),this._spherical.setFromVector3(It),this.autoRotate&&this.state===ct.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=Jt:n>Math.PI&&(n-=Jt),s<-Math.PI?s+=Jt:s>Math.PI&&(s-=Jt),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(It.setFromSpherical(this._spherical),It.applyQuaternion(this._quatInverse),t.copy(this.target).add(It),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){let a=It.length();o=this._clampDistance(a*this._scale);let l=a-o;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){let a=new U(this._mouse.x,this._mouse.y,0);a.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;let c=new U(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(a),this.object.updateMatrixWorld(),o=It.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(fl.origin.copy(this.object.position),fl.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(fl.direction))<Sv?this.object.lookAt(this.target):(tp.setFromNormalAndCoplanarPoint(this.object.up,this.target),fl.intersectPlane(tp,this.target))))}else if(this.object.isOrthographicCamera){let o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>Lh||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Lh||this._lastTargetPosition.distanceToSquared(this.target)>Lh?(this.dispatchEvent(ep),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?Jt/60*this.autoRotateSpeed*e:Jt/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){It.setFromMatrixColumn(t,0),It.multiplyScalar(-e),this._panOffset.add(It)}_panUp(e,t){this.screenSpacePanning===!0?It.setFromMatrixColumn(t,1):(It.setFromMatrixColumn(t,0),It.crossVectors(this.object.up,It)),It.multiplyScalar(e),this._panOffset.add(It)}_pan(e,t){let n=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;It.copy(s).sub(this.target);let r=It.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/n.clientHeight,this.object.matrix),this._panUp(2*t*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),s=e-n.left,r=t-n.top,o=n.width,a=n.height;this._mouse.x=s/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(Jt*this._rotateDelta.x/t.clientHeight),this._rotateUp(Jt*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(Jt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-Jt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(Jt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-Jt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(n,s)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let n=this._getSecondPointerPosition(e),s=.5*(e.pageX+n.x),r=.5*(e.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(Jt*this._rotateDelta.x/t.clientHeight),this._rotateUp(Jt*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let o=(e.pageX+t.x)*.5,a=(e.pageY+t.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new Oe,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function Mv(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function wv(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function Tv(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(np),this.state=ct.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function Av(i){let e;switch(i.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case fi.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=ct.DOLLY;break;case fi.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=ct.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=ct.ROTATE}break;case fi.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=ct.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=ct.PAN}break;default:this.state=ct.NONE}this.state!==ct.NONE&&this.dispatchEvent(Nh)}function Ev(i){switch(this.state){case ct.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case ct.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case ct.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function Cv(i){this.enabled===!1||this.enableZoom===!1||this.state!==ct.NONE||(i.preventDefault(),this.dispatchEvent(Nh),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(np))}function Rv(i){this.enabled!==!1&&this._handleKeyDown(i)}function Iv(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case pi.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=ct.TOUCH_ROTATE;break;case pi.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=ct.TOUCH_PAN;break;default:this.state=ct.NONE}break;case 2:switch(this.touches.TWO){case pi.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=ct.TOUCH_DOLLY_PAN;break;case pi.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=ct.TOUCH_DOLLY_ROTATE;break;default:this.state=ct.NONE}break;default:this.state=ct.NONE}this.state!==ct.NONE&&this.dispatchEvent(Nh)}function Pv(i){switch(this._trackPointer(i),this.state){case ct.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case ct.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case ct.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case ct.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=ct.NONE}}function Lv(i){this.enabled!==!1&&i.preventDefault()}function Nv(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Dv(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var ip=[["relaxed","Relaxed"],["a","A-pose"],["t","T-pose"]];function sp(i){let e;try{e=new qa({canvas:i,antialias:!0,alpha:!0,preserveDrawingBuffer:!1})}catch{return{failed:!0,show(){},setPose(){},view(){},resize(){},dispose(){}}}e.setPixelRatio(Math.min(2,globalThis.devicePixelRatio||1)),e.outputColorSpace=yt;let t=new oi;t.add(new Ar(15397631,7364686,1.6));let n=new Ds(16773852,1.9);n.position.set(2,3.2,4);let s=new Ds(13623551,.5);s.position.set(-3,1.5,-2),t.add(n,s);let r=new Xt(new br(.75,48),new Ui({color:0,transparent:!0,opacity:.16,depthWrite:!1}));r.rotation.x=-Math.PI/2,r.position.y=.002,t.add(r);let o=new zt(30,1,.01,50),a=new pl(o,i);a.enableDamping=!0,a.dampingFactor=.12,a.minDistance=.1,a.maxDistance=9,a.maxPolarAngle=Math.PI*.92,a.listenToKeyEvents(i);let l=null,c="relaxed",d=0,h=!0,u=!1,p=performance.now(),_=globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches,v=new U;function m(){l&&(c==="t"?$d(l):c==="a"?Ys(l):Zd(l,_?0:(performance.now()-p)/1e3))}function f(S="body"){let E=l?l.humanoid.head.getWorldPosition(v).y+.12:1.75;if(S==="face"){let g=l?l.humanoid.head.getWorldPosition(v).y+.06:1.62;a.target.set(0,g,0),o.position.set(.18,g+.02,.95)}else S==="hand"&&l?.humanoid.leftHand?((l.humanoid.leftMiddleProximal??l.humanoid.leftHand).getWorldPosition(v),a.target.copy(v),c==="t"?o.position.set(v.x+.02,v.y+.42,v.z+.12):o.position.set(v.x+.12,v.y+.1,v.z+.42)):S==="feet"&&l?.humanoid.leftToes?(l.humanoid.leftToes.getWorldPosition(v),a.target.set(0,v.y,v.z),o.position.set(.05,v.y+.35,v.z+.45)):(a.target.set(0,E*.52,0),o.position.set(.5,E*.6,Math.max(2.6,E*2.3)));a.update()}function b(){let S=i.clientWidth,E=i.clientHeight;!S||!E||(e.setSize(S,E,!1),o.aspect=S/E,o.updateProjectionMatrix())}function T(){d=0,!u&&(h&&document.visibilityState!=="hidden"&&(c==="relaxed"&&!_&&m(),a.update(),e.render(t,o)),d=requestAnimationFrame(T))}let y=new ResizeObserver(b);y.observe(i);let w=new IntersectionObserver(([S])=>h=S.isIntersecting);return w.observe(i),b(),f("body"),d=requestAnimationFrame(T),{failed:!1,show(S){l&&(t.remove(l.object),l.dispose()),l=S,l&&(t.add(l.object),m())},setPose(S){c=S,m()},view:f,resize:b,dispose(){u=!0,d&&cancelAnimationFrame(d),y.disconnect(),w.disconnect(),a.dispose(),l&&(t.remove(l.object),l.dispose(),l=null),r.geometry.dispose(),r.material.dispose(),e.dispose()}}}var rp=`
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
ol.steps { margin: 6px 0 0; padding-left: 20px; color: var(--soft); }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media (max-width: 820px) {
  main { grid-template-columns: 1fr; grid-template-rows: minmax(240px, 42%) minmax(0, 1fr); }
  .panel { border-left: 0; border-top: 1px solid var(--line); }
  .row { grid-template-columns: 96px minmax(0, 1fr); }
}
@media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto; } }
`;var op=`marinara-capability-${sn}`,ap=i=>`${sn}:draft:${i?`${i.type}:${i.id}`:"none"}`,Dh=`${sn}:last`,Uv=["shape","limbs","colours","underwear","clothColours","variants"],Ov=i=>Array.isArray(i)?i:Array.isArray(i?.items)?i.items:[];function Fv(i){let e=i?.data;if(typeof e=="string")try{e=JSON.parse(e)}catch{e=null}let t=e?.name??e?.data?.name??i?.name;return typeof t=="string"&&t.trim()?t.trim():"Unnamed"}async function Bv(){let[i,e]=await Promise.all([nr("/api/characters/personas/list"),nr("/api/characters")]),t=(n,s,r)=>Ov(s).filter(o=>typeof o?.id=="string"&&o.id).map(o=>({type:n,id:o.id,name:r(o)})).sort((o,a)=>o.name.localeCompare(a.name));return[...t("persona",i,n=>typeof n.name=="string"&&n.name.trim()?n.name.trim():"Unnamed"),...t("character",e,Fv)]}var to={read(i){try{return JSON.parse(globalThis.localStorage?.getItem(i)??"null")}catch{return null}},write(i,e){try{globalThis.localStorage?.setItem(i,JSON.stringify(e))}catch{}}};function no(i={}){let e=i.body==="male"?"male":"female",t=jr.find(n=>n.name==="Modern casual");return $i({...af,body:e,...t?cl(t,e):{},...i})}function kv(i,e){let t={...i};for(let[n,s]of Object.entries(e))if(s===void 0)delete t[n];else if(Uv.includes(n)){let r=s.$set?{...s.$set}:{...t[n],...s};for(let o of Object.keys(r))r[o]===void 0&&delete r[o];t[n]=r}else t[n]=s;return e.hairTint!==void 0&&delete t.hairColour,$i(t)}var lp=(i,e)=>`${(i||"avatar").trim().replace(/[^\p{L}\p{N} _-]+/gu,"").replace(/\s+/gu,"-").slice(0,60)||"avatar"}.${e}`;function cp(i,e,t){let n=URL.createObjectURL(new Blob([i],{type:t})),s=me("a",{href:n,download:e});document.body.append(s),s.click(),s.remove(),setTimeout(()=>URL.revokeObjectURL(n),1e4)}function zv(i,e){Vd(e?.kitBase??`/api/capability-packages/${e?.packageId??sn}/assets/kit/`,e?.packageVersion??"");let t=i.shadowRoot??i.attachShadow({mode:"open"}),n={owners:[],owner:null,name:"",look:no(),tab:"start",filled:null,choices:null,exported:null,building:0,figure:null,redraw:!0},s=me("canvas",{tabIndex:0,role:"img","aria-label":"The avatar. Drag to turn it, scroll or pinch to zoom, arrow keys to move the view."}),r=me("div",{class:"note",role:"status","aria-live":"polite"}),o=me("select",{"aria-label":"Pose",onchange:()=>_.setPose(o.value)});for(let[g,A]of ip)o.append(new Option(A,g));let a=me("div",{class:"views"},me("button",{type:"button",onclick:()=>_.view("body")},"Whole body"),me("button",{type:"button",onclick:()=>_.view("face")},"Face"),me("button",{type:"button",onclick:()=>_.view("hand")},"Hand"),me("button",{type:"button",onclick:()=>_.view("feet")},"Feet"),o),l=me("section",{class:"stage","aria-label":"Preview"},s,r,a),c=me("select",{"aria-label":"Who this avatar is for",onchange:()=>T(c.value)}),d=me("input",{type:"text","aria-label":"Avatar name",placeholder:"Avatar name",maxLength:60,oninput:()=>{n.name=d.value,m()}}),h=me("input",{type:"file",accept:".glb,.json,model/gltf-binary,application/json",class:"visually-hidden",tabIndex:-1,"aria-hidden":"true",onchange:()=>{let[g]=h.files??[];h.value="",g&&y(g)}}),u=Qf({onChange:(g,{redraw:A})=>{n.look=kv(n.look,g),n.redraw||=A,m(),f()},onTab:g=>{n.tab=g,v()},onNew:g=>{n.look=no(g),n.exported=null,n.redraw=!0,m(),f()},onOpen:()=>h.click(),onSaveLook:()=>{let g=JSON.stringify({avatarMaker:"look",format:Ih,name:n.name,look:n.look},null,1);cp(g,lp(n.name,"avatar.json"),"application/json"),u.setStatus("Saved the look as a file.")},onExport:g=>{w(g)}}),p=me("div",{class:"app"},me("header",{},me("h1",{},"3D Avatar Maker"),me("label",{class:"field"},"For",c),me("label",{class:"field"},"Name",d),me("span",{class:"grow"}),me("button",{type:"button",onclick:()=>h.click()},"Open…"),me("button",{class:"main",type:"button",onclick:()=>{n.tab="save",v()}},"Save…"),h),me("main",{},l,u.element));t.replaceChildren(me("style",{},rp),p);let _=sp(s);_.failed&&(r.className="note bad",r.textContent="This browser couldn't start 3D drawing (WebGL), so the avatar can't be shown here.");function v(){u.render({look:n.look,filled:n.filled,choices:n.choices,tab:n.tab,exported:n.exported})}function m(){to.write(ap(n.owner),{name:n.name,look:n.look}),to.write(Dh,n.owner?{type:n.owner.type,id:n.owner.id}:null)}async function f(){let g=++n.building;try{let A=await Pf(n.look,n.name||"avatar","auto");if(g!==n.building||S){A.dispose();return}let R=n.filled?.body!==A.avatar.body;n.figure=A,n.filled=A.avatar,(R||!n.choices)&&(n.choices=await Rf(A.avatar.body)),_.show(A),_.failed||(r.textContent=""),(n.redraw||R)&&v(),n.redraw=!1}catch(A){if(g!==n.building)return;console.warn(`[${sn}] the avatar couldn't be built`,A),r.className="note bad",r.textContent="The avatar's files couldn't be loaded. If you just installed or updated 3D Avatar Maker, reload the page and try again."}}function b(){c.replaceChildren(new Option("No one yet (a free draft)",""));for(let[g,A]of[["persona","Personas"],["character","Characters"]]){let R=n.owners.filter(O=>O.type===g);if(!R.length)continue;let P=me("optgroup",{label:A});for(let O of R)P.append(new Option(O.name,`${O.type}:${O.id}`));c.append(P)}c.value=n.owner?`${n.owner.type}:${n.owner.id}`:""}function T(g){n.owner=n.owners.find(R=>`${R.type}:${R.id}`===g)??null;let A=to.read(ap(n.owner));n.look=A?.look?$i(A.look):no(),n.look.body||(n.look=no(n.look)),n.name=typeof A?.name=="string"&&A.name?A.name:n.owner?.name??"",d.value=n.name,n.exported=null,n.redraw=!0,to.write(Dh,n.owner?{type:n.owner.type,id:n.owner.id}:null),f()}async function y(g){try{let A=null;if(/\.glb$/iu.test(g.name))A=Gf(await g.arrayBuffer());else{let P=JSON.parse(await g.text());(P?.avatarMaker==="look"||P?.wanderworld==="look")&&(A={name:P.name,look:P.look})}let R=A?$i(A.look):null;if(!R||!Object.keys(R).length){u.setStatus(/\.glb$/iu.test(g.name)?"That file wasn't saved by 3D Avatar Maker, so there is no look in it to open.":"That file isn't a saved look.",!0);return}n.look=R.body?R:no(R),typeof A.name=="string"&&A.name&&(n.name=A.name.slice(0,60),d.value=n.name),n.exported=null,n.redraw=!0,m(),u.setStatus(`Opened ${g.name}.`),f()}catch{u.setStatus("That file couldn't be read.",!0)}}async function w({maxTextureSize:g}){if(n.figure){u.setStatus("Saving the avatar…");try{let{bytes:A,vertices:R,triangles:P}=await Hf(n.figure,{look:n.look,name:n.name,maxTextureSize:g});_.setPose(o.value);let O=lp(n.name,"glb");cp(A,O,"model/gltf-binary"),n.exported={file:O,bytes:A.byteLength,vertices:R,triangles:P},v(),u.setStatus("Saved. The steps below say how to use it in a chat.")}catch(A){console.warn(`[${sn}] the avatar couldn't be saved`,A),_.setPose(o.value),u.setStatus("The avatar couldn't be saved. Try a smaller picture size.",!0)}}}let S=!1;b(),d.value=n.name,v();let E=Bv();return Kf().then(()=>S?null:(T(""),E)).then(g=>{if(S||!g)return;n.owners=g;let A=to.read(Dh),R=A?`${A.type}:${A.id}`:"";b(),R&&g.some(P=>`${P.type}:${P.id}`===R)&&(c.value=R,T(R))}),{destroy(){S=!0,n.building++,_.dispose(),t.replaceChildren()}}}var Uh=class extends HTMLElement{constructor(){super(),this.props=null,this.mounted=null,this.onPropsEvent=()=>this.sync()}set capabilityProps(e){this.props=e,this.sync()}get capabilityProps(){return this.props}connectedCallback(){this.addEventListener("marinara-capability-props",this.onPropsEvent),this.sync()}disconnectedCallback(){this.removeEventListener("marinara-capability-props",this.onPropsEvent),this.mounted?.destroy(),this.mounted=null}sync(){try{if(this.getAttribute("view")!=="browser"||!this.isConnected||this.mounted)return;this.style.cssText+=";display:block;position:relative;overflow:hidden;width:100%;height:100%;",this.mounted=zv(this,this.props)}catch(e){let t=e instanceof Error?e.message:String(e);console.error(`[${sn}]`,e),this.dispatchEvent(new CustomEvent("marinara-capability-runtime-error",{detail:{message:t}}))}}};customElements.get(op)||customElements.define(op,Uh);})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
