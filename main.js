/*
 * @Author: alextang
 * @Description: qwan usage
 */

//  ==================== Game Init ====================
$(function(){ 
    gameLoad()
});

var gameUpdate = function(e) {
    if (e.paused) {
        return
    }

    console.log('>> game frame udpate :');
}

var gameLoad = function(){
    qwan.init({canvasId: 'game', onUpdate: gameUpdate})

    // load res
    var imgPath = './ossweb-img/'
    var resArr = [
        'nico.jpg',
        'boom.mp3',
        'ss_run.json',
    ]

    var loadedTxt = qwan.makeTxt(qwan.stage, [350, 350], '0%', { fontSize: 30,  color: '#3399ff'})
    qwan.loadRes(resArr, imgPath, (e)=>{
        var loaded = (e.loaded * 100 | 0) + '%' ;
        // console.log('>> loaded :', loaded);
        loadedTxt.text = loaded
    }, ()=>{
        gameMain()
    })
}

// game main logic
var gameMain = function() {
    var bg = qwan.stage 

    // make img
    var myImg = qwan.makeImg(qwan.stage, 'nico_jpg', ['center','middle'])
    
    var myTxt = qwan.makeTxt(qwan.stage, [100,20], '一起来玩', {fontWeight: 'bold', fontSize: 60, fontFamily: 'Arial', color: '#ff8800'})

    
    // sprite
    var anim = qwan.makeSprite(qwan.stage, [200,300], 'ss_run_json', 'RunRight')

    // rect
    var rect1 = qwan.makeRect(qwan.stage, ['center', 'middle', '50%','5%'], '#3399ff', {offsetX: 50, offsetY: 100})

    
    // btn
    var btn1 = qwan.makeBtn(bg, ['center', 350, 200, 80], 'Play Boom', '#ff9900')
    btn1.on('click', ()=>{
        qwan.playAudio('boom_mp3')
    })
    var btn2 = qwan.makeBtn(bg, ['right', 350, 200, 80], 'Pause update', '#ff00cc')
    btn2.on('click', ()=>{
        createjs.Ticker.paused = true
    })
}