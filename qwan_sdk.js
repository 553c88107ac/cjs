/*
 * @Author: alextang
 * @Description: qwan sdk
 */

// core
var qwan = {
    init: function(config){
        this.compatibleGame()
        window.addEventListener('resize', this.compatibleGame, false) ;

        this.sw = config.width || 750 
        this.sh = config.height || 1334

        var stage = new createjs.Stage(config.canvasId)
        stage.canvas.width = this.sw
        stage.canvas.height = this.sh
        createjs.Touch.enable(stage);
        this.stage = stage

        createjs.Ticker.timingMode = createjs.Ticker.RAF;
        createjs.Ticker.addEventListener("tick", this.stage);
        createjs.Ticker.addEventListener("tick", config.onUpdate);
    },

    queue: null,
    loadRes: function(resArr, imgPath, cbProgress, cbFinish){
        var manifest = []
        resArr.forEach(function(item){
            const srcObj = {id: item.replace(/\./g, '_'), src:  imgPath + item}
            if (item.indexOf('.json') > -1) {
                srcObj.type = 'spritesheet'
            }
            manifest.push(srcObj)
        })
        var preload = new createjs.LoadQueue(true);
        preload.installPlugin(createjs.Sound);

        preload.on("fileprogress", cbProgress, this);
        preload.on("complete", cbFinish, this);
        preload.loadManifest(manifest)
        this.queue = preload
    },

    setPosAndSize: function(parent, posAndSize, el, ext = {}){
        parent = parent || {width: 0, height: 0}
        var parentSize = [parent.width || parent.canvas.width || 0, parent.height || parent.canvas.height ||  0] 
        ext.offsetX = ext.offsetX || 0
        ext.offsetY = ext.offsetY || 0
        var elWidth = posAndSize[2];
        var elHeight = posAndSize[3];

        if (typeof elWidth === 'string' && elWidth.indexOf('%') > -1) {
            elWidth = Number(elWidth.replace('%', '')) / 100 * parentSize[0]
        }
        if (typeof elHeight === 'string' && elHeight.indexOf('%') > -1) {
            elHeight = Number(elHeight.replace('%', '')) / 100 * parentSize[1]
        }

        var finalX = posAndSize[0]
        
        if (typeof finalX === 'string') {
            var tempX  = 0;
            if (!elWidth) {
                return console.error('>> QwanError : 使用语义定位必须制定当前元素的宽高');
            }
            (finalX === 'center') && (tempX = (parentSize[0] - elWidth) / 2);
            (finalX === 'right') && (tempX = (parentSize[0] - elWidth) );
            finalX = tempX 
            
        }
        finalX += ext.offsetX

        var finalY = posAndSize[1]
        if (typeof finalY === 'string') {
            var tempY  = 0;
            if (!elHeight) {
                return console.error('>> QwanError : 使用语义定位必须制定当前元素的宽高');
            }
            (finalY === 'middle') && (tempY = (parentSize[1] - elHeight) / 2);
            (finalY === 'bottom') && (tempY = (parentSize[1] - elHeight) );
            finalY = tempY 
        }
        finalY += ext.offsetY

        if (!el) {
            return [finalX, finalY, elWidth, elHeight]
        }

        // set data for el
        el.x = finalX
        el.y = finalY ;
        elWidth && (el.width = elWidth)
        elHeight && (el.height = elHeight)
        
        return [finalX, finalY, elWidth, elHeight]
    },

    makeImg: function( parent,imgName, pos){
        pos = pos || []
        var res = this.queue.getResult(imgName)
        var el = new createjs.Bitmap(res)
        
        var bd = el.getBounds()

        if (pos[0] == 'center') { 
            el.x = (this.sw - bd.width)/2
        }else{
            el.x = pos[0] || 0
        }

        if (pos[1] == 'middle') { 
            el.y = (this.sh - bd.height)/2
        }else{
            el.y = pos[1] || 0
        }

        // if (pos[2]) {
        //     el.scaleX = pos[2] 
        //     el.scaleY = pos[2] 
        // }

        parent.addChild(el)
        return el
    },
    makeSprite: function(parent, pos, ssJson, animation){
        var ssData = this.queue.getResult(ssJson)
        if (!ssData) {
            console.error('>> 缺少sprite的sprite数据，请检查拼写', ssJson );
            return
        }
        var s = new createjs.Sprite(ssData, animation);
        parent && parent.addChild(s)
        s.x = pos[0]
        s.y = pos[1]

        return s
    },

    makeTxt: function(parent, pos, txt, style = {}){
        var fontStyle = ''
        if (style.fontWeight == 'bold') {
            fontStyle += 'bold'
        }
        // todo tac
        fontStyle += ` ${style.fontSize ? style.fontSize : '24'}px`
        fontStyle += ` ${style.fontFamily ? style.fontFamily : 'Arial'}`
        var fontColor = style.color || '#333333'

        var el = new createjs.Text(txt, fontStyle, fontColor)

        var finalX = pos[0]
        if (typeof finalX === 'string') {
            var tempX  = 0;
            (finalX === 'center') && (tempX = (parent.width - el.getBounds().width) / 2);
            (finalX === 'right') && (tempX = (parent.width - el.getBounds().width) );
            finalX = tempX
        }
        el.x = finalX

        var finalY = pos[1]
        if (typeof finalY === 'string') {
            var tempY  = 0;
            (finalY === 'middle') && (tempY = (parent.height - el.getBounds().height) / 2);
            (finalY === 'bottom') && (tempY = (parent.height - el.getBounds().height) );
            finalY = tempY
        }
        el.y = finalY


        parent && parent.addChild(el)
        return el
    },

    // todo
    makeDiv: function(parent, posAndSize, ext = {}){
        var el = new createjs.Container()
        this.setPosAndSize(parent, posAndSize, el, ext)

        parent && parent.addChild(el)
        return el
    },

    makeRect: function(parent, posAndSize, bgColor, ext = {}){
        // D: [x,y,w,h]
        var D = this.setPosAndSize(parent, posAndSize, null, ext)
        
        var rect = new createjs.Graphics().beginFill(bgColor).drawRect(0,0, D[2], D[3])
        var el = new createjs.Shape(rect)
        el.x = D[0]
        el.y = D[1]
        parent && parent.addChild(el)
        return el
    },

    // todo
    makeBtn: function(parent, posAndSize, text, bgColor, ext = {}){
        var div = qwan.makeDiv(parent, posAndSize )
        var r = qwan.makeRect(div, [0,0,posAndSize[2], posAndSize[3]], bgColor)
        var t = qwan.makeTxt(div, ['center', 'middle'], text, {color: '#ffffff'})
        return t
    },

    playAudio: function(audioName){
        createjs.Sound.play(audioName)
    },

    CLICK: $.isMobile ? 'mousedown': 'click' ,
}

// compatible
qwan.compatibleGame = function(){
    $('#gameBox').css({height: $(window).height()})
}

// tool
qwan.tool = {
    getRandom: function(min, max){
        return 1*(Math.random() * (max-min)).toFixed() + min
    },
    inArray: function(arr, item){
        for (var index = 0; index < arr.length; index++) {
            if (arr[index] == item) {
                return true
            }
        }
        return false
    },
    shuffleArr: function(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
}