window.onload = function () {
var state = {n:0,page:0,videos:[]}
state.config = {
    drag: 0.001,
    pages:2,
    videos: [
        // page 1
        "blueprint", "custommotionvectors", "voxellod", "eventfoo",
        "clouds", "space", "curves", "nncraft", "3dlife", "paralax",
        "allcolors", "bacteriathreads",
        // page 2
        "lattice", "nofish", "random", "spheres", "universe",
        "hottnet", "bundesnetz"/*"grapheditor"*/, "concepts", "bodysim",
        "heartsim", "circulartree", "graphsubdiv",
    ],
}
var google_id = {
    "3dlife": "1gs1m4oSH7YfRRvTSOBT6_xhv7InKNx4u",
    "allcolors": "1mNgTU9hL_ELZFNt4r4unan7z6wldCzYr",
    "bacteriathreads": "1UFTDxkKkGGfkOXhtKSUklPT1Hm2kpf1G",
    "blueprint": "1TV8pRjXnvAF4dBWaK3FjMEWzwb5Exnpd",
    "bodysim": "1bQXVmIuEpmYtS0ZnsJmRtxeg1EJfTq-E",
    "bundesnetz": "1cNgGvVQf55FeBLW-MSR0yPkX-T4g5DfV",
    "circulartree": "1xT7tFuVPFVNRIYuAaBYI3im7NYRs6u1R",
    "clouds": "1yicyRTrgNvdbucnwikTM8MPW0-lQ8gPk",
    "concepts": "1XoWFQrZh8t66OdFWvcLjXpAXmCkqOpTC",
    "curves": "11rU_nMtaPmsDOt7YQa1D9h5AIKxPH0l1",
    "custommotionvectors": "1qzJcLy7F_LyDNp-Ti3W-LH8ChZvBZVJM",
    "eventfoo": "1wCzCiph7K0x2-DkP9Q5Bp8wkmbbQ110H",
    "grapheditor": "14ZzRSI2MCTkjMUxNbKCJC88O4SF2_rbS",
    "graphsubdiv": "12zXV88YpLghlQKqlpZZx7ZXjZkHXkmUq",
    "heartsim": "1GGjil8M9q0OddbzWFLkTRLfpyWHuLB4f",
    "hottnet": "1VQyObaasVoqjV_9ujI8WzWR2gpEkZx7k",
    "lattice": "1Ri2zfdLOY8CNnzCYwYjDJ9vGEvoDgOyd",
    "nncraft": "1RDCyV7MPRkcyx2Ydhm-SC-830jvGPmwh",
    "nofish": "1EveSW7mF5s6ih0FR9BcpbC-7JcZCypbA",
    "paralax": "1wsQ_-Od-LyLxzv5iGFVq-rsjOAiLlANA",
    "random": "1GoH3OcChuMOJNgYJ0tw9pAkEH7Ak8P8e",
    "space": "1H9rcpxJWn681EzM1YO1MLNyipY1ZwDoX",
    "spheres": "1ybyGYzjWAyqgym9E71klJWW2AnCFbVsr",
    "universe": "1gvhBWwAevEgEfdhvzfnTlzdR5FQnoZKV",
    "voxellod": "1NE8rrgX88wwwi5tBMqT46GaaD38Epmjc",
}
var vec = {
    norm:function (v) {return vec.mul(v, 1/vec.mag(v))},
    ang:function (v) {return Math.atan2(v.y,v.x)},
    mag:function (v) {return Math.sqrt(v.x*v.x + v.y*v.y)},
    inc:function (a, b) {a.x += b.x ; a.y += b.y ; return a},
    dec:function (a, b) {a.x -= b.x ; a.y -= b.y ; return a},
    fac:function (v, s) {v.x *= s ; v.y *= s ; return v},
    add:function (a, b) {return {x:a.x+b.x, y:a.y+b.y}},
    sub:function (a, b) {return {x:a.x-b.x, y:a.y-b.y}},
    mul:function (v, s) {return {x:s*v.x, y:s*v.y}},
    dot:function (a, b) {return a.x*b.x + a.y*b.y},
    crs:function (a, b) {return a.x*b.y - a.y*b.x},
    rot:function (v, a) {
        var c = Math.cos(a), s = Math.sin(a)
        return {x:c*v.x-s*v.y, y:s*v.x+c*v.y}
    },
}
window.state = state
////////////////////////////////////////////////////////////////////////////////
function Node(id) {
    this.id = id
    this.weight = 1
    this.edges = []
    this[0] = [] // from connections
    this[1] = [] // to connections
}
Node.prototype.clone = function () {
    var clone = new Node(this.id)
    clone.weight = this.weight
    clone.color  = this.color
    clone.v = this.v
    return clone
}
Node.prototype.connectedTo = function (node) {
    return this[1].indexOf(node) !== -1
}
Node.prototype.connectedFrom = function (node) {
    return this[0].indexOf(node) !== -1
}
Node.prototype.connectedBy = function (edge) {
    return this.edges.indexOf(edge) !== -1
}
Node.prototype.connected = function (node) {
    return this.connectedTo(node) || this.connectedFrom(node)
}
function Edge(id, node0, node1) {
    this.id = id
    this[0] = node0
    this[1] = node1
    this.weight = 1
    if (!node0.connectedTo(  node1)) node0[1].push(node1)
    if (!node1.connectedFrom(node0)) node1[0].push(node0)
    if (!node0.connectedBy(this)) node0.edges.push(this)
    if (!node1.connectedBy(this)) node1.edges.push(this)
}
Edge.prototype.other = function (node) {
    return this[1] === node ? this[0] : this[1]
}
function Graph(id) {
    this.id = id
    this.nodes = []
    this.edges = []
    this.nodes.ids = {}
    this.edges.ids = {}
}
Graph.prototype.addNode = function (node) {
    this.nodes.ids[node.id] = node
    this.nodes.push(node)
    return node
}
Graph.prototype.addEdge = function (edge) {
    this.edges.ids[edge.id] = edge
    this.edges.push(edge)
    return edge
}
Graph.prototype.createNode = function (id) {
    return this.addNode(new Node(id))
}
Graph.prototype.createEdge = function (id, node0, node1) {
    return this.addEdge(new Edge(id, node0, node1))
}
Graph.prototype.getNodeById = function (id) {
    return this.nodes.ids[id]
}
Graph.prototype.getEdgeById = function (id) {
    return this.edges.ids[id]
}
Graph.prototype.normalize = function () {
    var wn = 1 / (this.nodes.reduce((weight, node) => Math.max(weight, Math.abs(node.weight)), 0) || 1)
    var we = 1 / (this.edges.reduce((weight, edge) => Math.max(weight, Math.abs(edge.weight)), 0) || 1)
    if (wn !== 1) this.nodes.forEach((node) => node.weight *= wn)
    if (we !== 1) this.edges.forEach((edge) => edge.weight *= we)
}
////////////////////////////////////////////////////////////////////////////////
function createRandomGraph(id, n, prob) {
    var nRelations = n * n * (prob + Math.random()) * prob
    var i,x,y,s = 1/(n+nRelations), graph = new Graph(id)
    for(i = 0; i < n; i++) {
        graph.createNode("n" + i)
    }
    for(i = 0; i < nRelations; i++) {
        x = Math.floor(n*Math.random())
        y = Math.floor(n*Math.random())
        graph.createEdge(x + "_" + y, graph.nodes[x], graph.nodes[y])//.color = default_color;
    }
    return graph
}
////////////////////////////////////////////////////////////////////////////////
function Forces2D(graph) {
    this.dEqRepulsors = 123
    this.dEqSprings = 64
    this.friction = 0.93
    this.k = 0.003
    this.edges = graph.edges
    this.nodes = graph.nodes
    this.nodes.forEach(function (node) {
        node.v = node.v || {x:0,y:0}
        node.x = node.x || 0
        node.y = node.y || 0
    })
}
Forces2D.prototype.update = function () {
    this.calculate()
    this.reposition()
}
Forces2D.prototype.reposition = function () {
    for (var node,i=0;node=this.nodes[i];i++) {
        vec.inc(node, vec.fac(node.v, this.friction))
    }
}
Forces2D.prototype.calculate = function () {
    for (var node,i=0;node=this.nodes[i];i++) {
        for (var other,j=0;other=this.nodes[j];j++) {
            if (node === other) {continue}
            var d = vec.sub(other, node), dist = vec.mag(d)
            if (!(dist < 0.01 || dist > this.dEqRepulsors)) {
                vec.inc(node.v, vec.fac(d, this.k * (dist - this.dEqRepulsors) / dist))
            }
        }
        for (var edge,j=0;edge=node.edges[j];j++) {
            var other = edge.other(node)
            if (node === other) {continue}
            var d = vec.sub(other, node), dist = vec.mag(d)
            if (!(d < 0.01)) {
                vec.inc(node.v, vec.fac(d, this.k * (dist - other.weight * this.dEqSprings) / dist))
            }
        }
    }
}
////////////////////////////////////////////////////////////////////////////////
function Network(graph) {
    this.position = {x:0, y:0}
    this.radius = 13
    this.graph = graph
    this.forces = new Forces2D(graph)
}
Network.prototype.draw = function (ctx) {
    var x=this.position.x+state.center.x, y=this.position.y+state.center.y
    ctx.beginPath()
    for (var node,i=0;node=this.graph.nodes[i];i++) {
        ctx.moveTo(x+node.x, y+node.y)
        ctx.arc(x+node.x, y+node.y, this.radius * node.weight, 0, Math.PI*2)
    }
    ctx.fill()
}
////////////////////////////////////////////////////////////////////////////////
function EventEmitter() {
    this._listeners = []
}
EventEmitter.prototype.on = function(event, callback, context) {
    // allow clients to subscribe to events on the canvas.
    callback.__context = context
    this._listeners[event] = this._listeners[event] || []
    this._listeners[event].push(callback)
    return this
}
EventEmitter.prototype.off = function (event, callback) {
    var index = this._listeners[event].indexOf(callback)
    if (index > -1) this._listeners[event].splice(index, 1)
    return this
}
EventEmitter.prototype.emit = function (event) {
    if (!this._listeners[event]) return
    var args = Array.prototype.slice.call(arguments, 1)
    var len = this._listeners[event].length
    for (var i = 0; i < len; i++) {
        var callback = this._listeners[event][i]
        callback.apply(callback.__context, args)
    }
    return this
}
////////////////////////////////////////////////////////////////////////////////
Animation.prototype = new EventEmitter()
function Animation() {
    EventEmitter.call(this)
    this.running = false
    this._step = this.step.bind(this)
    this.on('request', typeof requestAnimationFrame === 'function' ?
        function (cb) {requestAnimationFrame(cb)} :
        function (cb) {setTimeout(cb, 16)})
}
Animation.prototype.start = function () {
    if (this.running) return
    this.running = true
    this.emit('request', this._step)
}
Animation.prototype.stop = function () {
    this.running = false
}
Animation.prototype.step = function () {
    if (!this.running) return;
    this.emit('frame')
    this.emit('request', this._step)
}
////////////////////////////////////////////////////////////////////////////////
Input.prototype = new EventEmitter()
function Input(el, drag) {
    EventEmitter.call(this);
    this.element = el;
    this.pixelRatio = typeof window === 'undefined' ? 1 : window.devicePixelRatio;
//     this.hiding   = new HideDetection(this);
//     this.dragging = new DragDetection(this, drag);
//     this.gamepads = new Gamepad(this);
    var opts = {passive:true, capture:false};
    var onmouse = this.onmouse.bind(this);
    this.events.mouse.forEach(function (event) {
        el.addEventListener(event, onmouse, opts);
    });
    var ontouch = this.ontouch.bind(this);
    this.events.touch.forEach(function (event) {
        el.addEventListener(event, ontouch, opts);
    });
}
Input.prototype.events = {
    mouse: ['mousemove', 'mousedown', 'mouseup', 'mouseenter', 'mouseleave',
            'click',  'mousewheel',  'DOMMouseScroll'],
    touch: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
};
Input.prototype.update = function () {
    this.gamepads.update();
}
Input.prototype._getRelativeMousePos = function (e) {
    var rect = this.element.getBoundingClientRect();
    return {
      x: this.pixelRatio * (e.clientX - rect.left),
      y: this.pixelRatio * (e.clientY - rect.top)
    };
}
Input.prototype.onmouse = function (e) {
    var eventName = e.type;
    switch (eventName) {
    case 'mousemove':
    case 'mousedown':
    case 'mouseup':
        var pos = this._getRelativeMousePos(e);
        pos.prev = this.mouse;
        pos.pressed = pos.prev && pos.prev.pressed;
        this.mouse = pos;
        if (e.type == 'mousemove') break;
        else if (e.type == 'mouseup')
            this.mouse.pressed = false;
        else
            this.mouse.pressed = true;
        break;
    case 'mouseenter':
        this.mouse = this.mouse || this._getRelativeMousePos(e);
        break;
    case 'mouseleave':
        this.mouse = null;
        break;
    case 'DOMMouseScroll':
        eventName = 'mousewheel';
    case 'mousewheel':
        this.mouse = this.mouse || this._getRelativeMousePos(e);
        if (e.wheelDelta) {
            this.mouse.wheel = e.wheelDelta/120;
        } else if (e.detail) { /** Mozilla case. */
            this.mouse.wheel = -e.detail/3;
        }
        e.value = this.mouse.wheel;
        break;
    }
    this.emit(eventName, e);
}
Input.prototype.ontouch = function (e) {
//     e.preventDefault();
    switch (e.type) {
    case 'touchstart':
    case 'touchcancel':
    case 'touchend':
        if (e.changedTouches && e.changedTouches.length || 0 > 0) {
            var pos = this._getRelativeMousePos(e.changedTouches[0]);
            pos.prev = this.mouse;
            pos.pressed = pos.prev && pos.prev.pressed;
            pos.pitch = pos.prev && pos.prev.pitch;
            this.mouse = pos;
        }
        if (e.type === 'touchstart') {
            this.mouse.pressed = true;
            this.emit('mousedown', {type:'mousedown', originalEvent:e});
            break;
        }
        this.mouse.pressed = false;
        this.emit('mouseup', {type:'mouseup', originalEvent:e});
        break;
    case 'touchmove':
        var len = e.touches && e.touches.length || 0;
        if (len == 1) {
            var pos = this._getRelativeMousePos(e.changedTouches[0]);
            pos.prev = this.mouse;
            pos.pressed = pos.prev && pos.prev.pressed;
            pos.pitch = pos.prev && pos.prev.pitch;
            this.mouse = pos;
            this.emit('mousemove', {type:'mousemove', originalEvent:e});
        } else if (len > 1) {
            this.mouse.pressed = false;
            var d = 0, p = this._getRelativeMousePos(e.touches[0]);
            for(var i = 1; i < len; i++) {
                var p2 = this._getRelativeMousePos(e.touches[i]);
                d += Math.sqrt(Math.pow(p2.x-p.x,2) + Math.pow(p2.y-p.y,2));
            }
            d /= len-1;
            if (this.mouse.pitch) {
                this.mouse.wheel = d - this.mouse.pitch;
                this.emit('mousewheel', {type:'mousewheel', value:this.mouse.wheel, originalEvent:e});
            }
            this.mouse.pitch = d;
        }
        break;
    }
    return false;
}
////////////////////////////////////////////////////////////////////////////////

function circle(ctx, center, radius, start, stop) {
    ctx.beginPath()
    ctx.strokeStyle = 'red'
    ctx.arc(center.x, center.y, radius, start || 0, stop || (Math.PI*2))
    ctx.stroke()
    ctx.closePath()
}

function viddim(v) {return {x:v.videoWidth, y:v.videoHeight}}
function vidtoggle(v,b) { var prom = undefined
         if ( v.paused &&  b) {prom = v.play()}
    else if (!v.paused && !b) {prom = v.pause()}
    if (prom !== undefined) {prom.catch(function () {vidtoggle(v,b)})}
}

function triangle(ctx, vid, center, corner, color, active) {
//     vid = null
    var r = vec.sub(corner, center)
    var a = vec.inc(vec.rot(r, Math.PI*2/3), center)
    var b = vec.inc(vec.rot(r, Math.PI*4/3), center)
    var bary = barycentric(state.mouse, corner, a, b)
    if ((!state.current || !vid) && bary.a >= 0 && bary.b >= 0 && bary.c >= 0)
        state.over = {a:a, b:b, c:corner, v:vid, center:center}
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(corner.x, corner.y)
    ctx.lineTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.clip()
    if (vid) {
        var v = vec.inc(vec.fac(viddim(vid),-0.5), center)
        ctx.globalCompositeOperation = 'destination-over'
        ctx.drawImage(vid, v.x, v.y)
        vidtoggle(vid, active)
    } else {
        ctx.fillStyle = color || 'white'
        ctx.beginPath()
        ctx.moveTo(corner.x, corner.y)
        ctx.lineTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.fill()
        ctx.closePath()
    }
    if (state.over && state.over.center === center) {
        ctx.globalCompositeOperation = 'color-dodge'
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 20
        ctx.beginPath()
        ctx.moveTo(corner.x, corner.y)
        ctx.lineTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.lineTo(corner.x, corner.y)
        ctx.stroke()
        ctx.closePath()
    }
    ctx.restore()
}

function barycentric(p, a, b, c) {
    var v0 = vec.sub(b,a), v1 = vec.sub(c,a), v2 = vec.sub(p,a)
    var den = 1 / vec.crs(v0,v1)
    var res = {b:den * vec.crs(v2,v1), c:den * vec.crs(v0,v2)}
    res.a = 1 - res.b - res.c
    return res
}

function draw_selection() {var ctx = state.ctx
    if (state.network) {
        state.network.draw(ctx)
        ctx.globalCompositeOperation = 'source-out'
        ctx.beginPath()
        ctx.fillStyle = '#222'
        ctx.rect(0, 0, state.canvas.width, state.canvas.height)
        ctx.fill()
        ctx.globalCompositeOperation = 'copy'
    }
    triangle(ctx, 0, state.current.center, state.current.c, "rgba(255,255,255, 0.2)")

}

function draw_menu() {var ctx = state.ctx
    var a = {x:0, y:state.canvas.height*0.17}
    var b = vec.rot(a, Math.PI*2/3)
    var c = vec.rot(b, Math.PI*2/3)
    var p = {a:vec.add(state.center, a), b:vec.add(state.center, b), c:vec.add(state.center, c)}
    triangle(ctx, 0, state.center, p.a)
    var bary = barycentric(state.mouse,p.a,p.b,p.c)
    var e = 0, l = -1, h = 2, keys = ['a','b','c']
    keys.forEach(function (k,n) {
        var ll =     l/3+Math.max(0,bary[keys[(n+1)%3]])
        var lh = (2*h)/3-Math.max(0,bary[keys[(n+2)%3]])
        var ang = 0, v = vec.sub(state.center, p[k])
        for (i=0; i<4; i++) {
            ang += 1/3 ; v = vec.rot(v, Math.PI/3)
            triangle(ctx, state.videos[e++], vec.add(p[k],v), p[k], "rgba(255,255,255, 0.2)",  (ang >= ll-l/3 && ang <= lh-l/3))
        }
//         circle(ctx, p[k], 66, Math.PI*ll, Math.PI*lh)
        l += 2 ; h +=1//= h%3+1
    })
}

function draw() {
    state.over = null
    state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height)
    state.mouse = state.input.mouse || state.mouse
    if (state.network) {
        state.network.forces.update()
        if (state.network.radius > 0.5*(state.center.x+state.center.y))
        {state.network = null} else {state.network.radius += 2.3}

    }
    if (state.current) {draw_selection()} else {draw_menu()}
    if (state.over) {
        state.canvas.style.cursor = 'pointer'
    } else {
        state.canvas.style.cursor = 'default'
    }
}


function set_menu() {
    document.body.classList.remove('selected')
    if (state.current.v) state.current.v.classList.remove('selected')
    state.current = null
}

function set_selection() {
    state.current = state.over
    state.videos.forEach(function (v) {
        vidtoggle(v, v === state.current.v)
    })
    if (state.current.v) state.current.v.classList.add('selected')
    document.body.classList.add('selected')
}


function createVideo(name) {
    if (/github/.test(document.location.host))
    {name = "https://drive.google.com/uc?authuser=0&export=download&id="+google_id[name]}
    else {name += ".mp4"}
    var vid = document.createElement('video')
    var src = document.createElement('source')
    vid.setAttribute('loop', "loop")
    src.setAttribute('type', "video/mp4")
    src.setAttribute('src', name)
    vid.appendChild(src)
    document.body.appendChild(vid)
    return vid
}

function fill_page() {
    for (i=0;i<12;i++) {
        state.videos[i] = createVideo(state.config.videos[state.page*12+i])
    }
}
function next_page() {
    state.videos.forEach(function (v) {v.remove()})
    state.page = (++state.page) % state.config.pages
    fill_page()
}

function createNetwork() {
    state.network = new Network(createRandomGraph(state.n++,100,0.042))
    state.network.radius = state.canvas.height * 0.17 * 0.1
    state.network.forces.dEqRepulsors = state.network.radius * 12
    state.network.forces.dEqSprings = state.network.radius * 9.9
    state.network.radius = 0.01
//     console.log(state.network)
    state.network.position = vec.sub(state.mouse, state.center)
    state.network.graph.nodes.forEach(function (node) {
        node.weight = 0.5 + Math.random()
        node.x = (1-2*Math.random()) * 0.1
        node.y = (1-2*Math.random()) * 0.1
    })
}


function mkconvinient(canvas) {
    var pixelRatio = typeof window === 'undefined' ? 1 : window.devicePixelRatio
    function resize () {
        var w = window.innerWidth, h = window.innerHeight
        canvas.width = pixelRatio * w
        canvas.height = pixelRatio * h
        canvas.style.width = w + 'px'
        canvas.style.height = h + 'px'
        state.center = vec.fac({x:canvas.width, y:canvas.height}, 0.5)
    }
    state.canvas = canvas
    state.ctx = canvas.getContext('2d')
    resize()
    window.addEventListener('resize', resize, false)
    return canvas
}
function main() {
    fill_page()
    state.animation = new Animation()
    mkconvinient(document.querySelector('body > canvas'))
    state.canvas.addEventListener('click', function () {
        if (state.current) {
            if (state.over) {set_menu()}
        } else {
            if (state.over) {
                if (state.over.v) {
                    createNetwork()
                    set_selection()
                } else {
                    next_page()
                }
            }
        }
    })
    state.input = new Input(state.canvas, state.config.drag)
    state.mouse = {x:-9999,y:-999999}
    state.input.mode = 'mouse'
    state.animation.on('frame', draw)
    state.animation.start()
    console.log("booted")
}

////////////////////////////////////////////////////////////////////////////////
main();
};
