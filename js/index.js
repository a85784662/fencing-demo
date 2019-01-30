let editMode = false //判断是不是编辑模式
//关闭小图标的BASE64编码
var closeIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABS0lEQVQ4jZWTMUsDQRCFV7CxEQvtLCz9WwqCNlZiE4UF572QYgMihHCEFLG4QpYrUlisP0IU7ATBMqWFxeVubNxgNrmoA1Ps7nxvd2ZnjEms0+nsisgFgALAO4AJyTHJK5L7afzMVHWN5AnJRwDa4K8icm6t3VwQIHmzApxzkuMUPgBQOue03+83gqPRSHu9XhQ5M8YYY63d+s5VsyzTsizVe78Ae++1qirN8zzufbTb7T0D4DANTEUiHEJIhS8NSbfstiiyAlYAuSF5vyxf771Op1Ot67oJVhF5MgAelh0WRaF1XWtVVVoURVNhX4yIXKcHIQRVVQ0h/JbCnSF51AT/oYjWWGu3AUzis1M4FRkOh3Hvc9baInIMQAeDwc9/XvAsy9Q5F9etuW4EcPuPVg7W2vU5gW63uyEipwCeV8BvAFokdxqn8r/j/AW6rUJCBPyi3gAAAABJRU5ErkJggg=="

let options = {
    // render items
    renderItems: { featureInView: false, earth: true },
    // show mouse tip
    develop: true,
    // altizure api: contact altizure to get your developer key
    altizureApi: {
      key: '7MkQf8UggsPaadvrlKALspJWZejZAJOLHn3cnIy'
    }
}

let sandbox = new altizure.Solution('page-content', options)
let altmarker

// 在默认GPS位置填加项目

sandbox.add('AltizureProjectMarker', { pid: '5c29e4f08d4eda1f334f91f9' })
    .then((m) => {
        //altmarker = m
        m.dim()
        sandbox.camera.flyTo({  //刷新页面后视角自动飞到倾斜摄影加载的地方
            lng: m.position.lng,
            lat: m.position.lat,
            alt: 3000
        }, 1)
    })

///////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////

dat.GUI.prototype.removeFolder = function(name) {
    var folder = this.__folders[name];
    if (!folder) {
        return;
    }
    folder.close();
    this.__ul.removeChild(folder.domElement.parentNode);
    delete this.__folders[name];
    this.onResize();
}


dat.GUI.prototype.removeFolder2 = function(name) {
    var folder = this.__folders[name];
    if (!folder) {
        return;
    }
    folder.close();
    delete this.__folders[name];
    this.onResize();
}


//创建全局变量/////////////////////////////////////////////////////////////////////////
let allPolygonNameArry = [];//用来保存当前页面所有围栏对象的名字
let globalPointsArry = [] //用来保存所有围栏的坐标体系，传送给后台使用

let globalGuiSettings = { //dat.gui使用的控件对象（全局作用域）
    drawing: false,
    polygonIndex: 0
}
let drawingLine //鼠标左键点击后创建的围栏对象
let finalDataObjects = { 
    points: [] //用来存放左键点击每一个点的经纬度、高度
}

//鼠标左键点击事件执行方法：
let leftClickFunc = (e) => {
    if (!globalGuiSettings.drawing) return
    // 单击鼠标左键开始画线
    let pt = sandbox.window.toLngLatAlt(e) //把电脑屏幕坐标转换成经纬度、高度

    if (!pt) return
    if (drawingLine) {
        //drawingLine.points[0] 获取围栏坐标组中的起始点坐标（起点坐标和终点坐标相同）
        drawingLine.addPoint(drawingLine.points[0]) //给围栏增加一个点(这个点事添加到数组的最后形成一个完整的围栏坐标体系)
    } else {
        drawingLine = new altizure.PolyLineMarker({ //画围栏
            sandbox: sandbox,
            points: [pt, pt, pt],
            interactable: false,
            visible: true,
            fenceHeight: 60,
            labelsVisible: false
        })
    }
    finalDataObjects.points.push(pt)  ////所有左键点击后生成绘制点的坐标系（非鼠标移动产生的坐标点存进全局变量供后面使用
}

//鼠标移动事件执行方法：
let moveFunc = (e) => {
    // editing line
    if (!globalGuiSettings.drawing) return
    let pt = sandbox.window.toLngLatAlt(e)
    if (!pt) return
    if (drawingLine) {
        //drawingLine.pointsNumber 围栏里面现在“点”的个数
        //给围栏指定位置设置点，参数1表示被替换的点在数组的下标，参数2表示替换的新坐标
        drawingLine.setPoint(drawingLine.pointsNumber - 2, pt) 
    }
}


//鼠标右键点击事件执行方法开始：
let rightClickFunc = (e,editData) => {
    var wlcolor = (editData && editData.color)  || 0xb966ff;
    // right click to finish
    if(editData){
        var  points = editData.points
    }else{
        var points = finalDataObjects.points //所有左键点击后生成绘制点的坐标系
    }

    if (points.length >= 3) {
        //这里可以遍历坐标组对左键点击的点的坐标进行更改加工，比如把pt.alt替换为0，就把所有高度变为0了
        let lnglatpoints = points.map((pt) => { return new altizure.LngLatAlt(pt.lng, pt.lat, pt.alt) });

        if(editData){
            var boundary = lnglatpoints.slice()
        }else{
            var boundary = lnglatpoints.slice() //利用slice方法返回一个内容一样的全新数组
            boundary.push(boundary[0]) // 填加围栏的终点坐标系,形成完整的坐标体系（终点和起点必须是同一个点）;
        }

        /////////----//////////
        //var eleMsg = {"color":'0xb966ff',points:[]};
        //eleMsg.points.push(boundary)
        //globalPointsArry.push(eleMsg) //把每一个围栏坐标,和默认颜色保存到全局变量里
        /////////----//////////
        let polygon = new altizure.PolyLineMarker({
            sandbox: sandbox,
            interactable: false,
            visible: true,
            // for base Marker
            fenceHeight: 60,
            points: boundary,
            color: wlcolor,
            // textOptions: textOptions,
            labelsVisible: false
        });

        polygon.interactable = true  //允许交互
        polygon.on('click',(e) => {
            thisArea = computeSignedArea(boundary);
            thisArea = thisArea.toFixed(2);
            addAreaAlert(thisArea,closeIcon,'.tyl-close-icon');         
        })




    //  控制拖动标签
        let tagspoints;//所有的可拖动标签的坐标组
        if(editData){
           tagspoints =  lnglatpoints.slice();
           tagspoints.pop();
        }else{
          tagspoints =  lnglatpoints 
        }

        let tags = tagspoints.map((pt) => {

            let tag = new altizure.TagMarker({
                sandbox: sandbox,
                position: pt,
                scale: 1,
                pinLength: 10,
                imgUrl: '../public/assets/img/tag/normal/tagDemo.png',
                pivot: { x: 0.5, y: 0.1 }
            })

            return tag
        })

        var polygonName = 'Polygon ' + globalGuiSettings.polygonIndex.toString() //gui为每个围栏生成的标题名称
        allPolygonNameArry.push(polygonName);
        globalGuiSettings.polygonIndex += 1;

        //把每一个生成的围栏对象和对应的所有可拖动标签保存进全局数组里面
        globalGuiSettings[polygonName] = {
            polygon: polygon,
            tags: tags
        };

        tags.map((tag) => {
            tag.interactable = true //允许标签可以拖动
            //每个标签的拖动事件
            tag.on('mousedrag', (e) => {
                let pt = sandbox.window.toLngLatAlt(e) //转换为经纬度的新的标签的坐标系
                if (pt) {
                    tag.position = pt //设置拖动产生的新的单个标签的坐标点
                    // reconstruct polygon
                    let polygonBoundary = tags.map((tag) => {
                        let pos = tag.position
                        return new altizure.LngLatAlt(pos.lng, pos.lat, pt.alt)
                    });
                    //保存拖动标签后生成的全新的围栏坐标
                    polygonBoundary.push(polygonBoundary[0])//生成围栏完整坐标

                    let prevPolygon = globalGuiSettings[polygonName].polygon
                    //由于拖动了标签开始重绘围栏
                    let newPolygon = new altizure.PolyLineMarker({
                        sandbox: sandbox,
                        interactable: false,
                        visible: true,
                        // for base Marker
                        fenceHeight: prevPolygon.fenceHeight,
                        points: polygonBoundary,
                        color: prevPolygon.color,
                        // textOptions: textOptions,
                        labelsVisible: false
                    });
                    newPolygon.interactable = true  //允许交互
                    newPolygon.on('click',(e) => {
                        thisArea = computeSignedArea(boundary)
                        thisArea = thisArea.toFixed(2)
                        addAreaAlert(thisArea,closeIcon,'.tyl-close-icon');  

                    })
                    prevPolygon.destruct() //销毁拖动标签之前所对应的围栏对象
                    globalGuiSettings[polygonName].polygon = newPolygon //把拖动标签之后的新围栏对象保存在之前对应的名字(polygonName)下
                }
            })
        });
        // add gui
         addPolygon(polygonName)
    }
    enableGUIElement(0, '点此开启绘制')
    removeMessage()
    // reset parameters 销毁未点击右键之前创建的围栏对象
    if (drawingLine) { 
        drawingLine.destruct()
        drawingLine = undefined
    }
    finalDataObjects.points = []
    globalGuiSettings.drawing = false;
}
//鼠标右键点击事件执行方法结束/////////////////////////////////////



let lastDownEvent
// sandbox.renderer.domElement 整个地球元素
// 整个Altizure绑定鼠标按下事件
sandbox.renderer.domElement.addEventListener('mousedown', (e) => {
    lastDownEvent = e
})
// 整个Altizure绑定鼠标松开事件
sandbox.renderer.domElement.addEventListener('mouseup', (e) => {
    if (e.button === lastDownEvent.button && Math.abs(e.x - lastDownEvent.x) <= 3 && Math.abs(e.y - lastDownEvent.y) <= 3) {
        if (e.button === 0) {
            leftClickFunc(e)
        } else if (e.button === 2) {
            rightClickFunc(e)
        }
    }
})
// 整个Altizure绑定鼠标移动事件
sandbox.renderer.domElement.addEventListener('mousemove', (e) => {
    moveFunc(e)
})

//控制开始绘制围栏的开关函数
globalGuiSettings.createPolygon = () => {
    if (globalGuiSettings.drawing) return
    globalGuiSettings.drawing = true    //控制是否可以开始绘制围栏
    disableGUIElement(0, '单击右键结束')
}
var gui = new dat.GUI({ autoplace: false, width: 300 })
gui.add(globalGuiSettings, 'createPolygon').name('点此开启绘制')
$('.dg').hide();


///每创建一个围栏对应生成一个GUI控件菜单的总体方法/////////////////////////
function addPolygon(name) {
    let polygonFolder = gui.addFolder(name)
    let polygonSettings = {  //创建gui控件对象变量
        "围栏高度": globalGuiSettings[name].polygon.fenceHeight,
        //bottom: globalGuiSettings[name].polygon.bottom,
        "颜色": globalGuiSettings[name].polygon.color,
        "透明度": globalGuiSettings[name].polygon.opacity,
        "删除": () => {
            var nameIndex = allPolygonNameArry.indexOf(name);
            allPolygonNameArry.splice(nameIndex,1); //删除当前页面所有围栏对象数组中要删除的对应的围栏对象名字
            gui.removeFolder(name)
            globalGuiSettings[name].polygon.destruct()
            globalGuiSettings[name].tags.map((tag) => {
                tag.destruct()
            })
            delete globalGuiSettings[name]
        }
    }
    addEntry(polygonFolder, polygonSettings, '围栏高度', 'number', 0, 300, 1, (v) => {
        polygonSettings.fenceHeight = v
        globalGuiSettings[name].polygon.fenceHeight = v
    })

    addEntry(polygonFolder, polygonSettings, '颜色', 'color', 0, 300, 1, (v) => {
        polygonSettings.color = v
        globalGuiSettings[name].polygon.color = colorInt(v)
        function colorInt(v) {
            let c = v
            if (typeof v === 'object') c = v.r * 256 * 256 + v.g * 256 + v.b
            return c
        }
    })
    addEntry(polygonFolder, polygonSettings, '透明度', 'number', 0, 1, 0.05, (v) => {
        polygonSettings.opacity = v
        globalGuiSettings[name].polygon.opacity = v
    })
    addEntry(polygonFolder, polygonSettings, '删除')
}

//生成一个GUI功能子菜单的子方法
function addEntry(folder, settings, key, type, low, high, interval, onChangeFunc) {
    //参数onChangeFunc为GUI空间改变后要执行的方法
    if (type === 'number') {
        folder.add(settings, key, low, high, interval).onChange(onChangeFunc)
    } else if (type === 'color') {
        folder.addColor(settings, key).onChange(onChangeFunc)
    } else {
        folder.add(settings, key)
    }
    folder.open()
}

function removeMessage() {
    gui.removeFolder('Message')
}



//改变控制悬浮框文字方法/////////////////////////////////////////////////////////////////////
function enableGUIElement(index, msg) {
    gui.domElement.children[1].children[index].style.background = ''
    gui.domElement.children[1].children[index].children[0].children[0].textContent = msg
}

function disableGUIElement(index, msg) {
    gui.domElement.children[1].children[index].style.background = 'gray'
    gui.domElement.children[1].children[index].children[0].children[0].textContent = msg
}


////////////以下是与服务端交互的执行方法/////////////////////////////////////////////


$('.tyl-btn-wrap').click(function(){
    //editMode判断目前按钮是编辑状态还是保存状态
    if(editMode){

        //点击保存执行的方法开始////////////
        editMode = false;
        $('.folder').remove();
        $('.dg').hide();//让GUI菜单框隐藏
        $(this).text('编辑');
        globalPointsArry = []; //用来保存所有围栏的坐标体系，传送给后台使用

        allPolygonNameArry.forEach(function(name){
            if(globalGuiSettings[name].tags){

              globalGuiSettings[name].tags.map((tag) => {
                tag.destruct()
              }) 
              delete globalGuiSettings[name].tags
            }       
        });

        allPolygonNameArry.forEach(function(item){
            var eleMsg = {};
            eleMsg.color = globalGuiSettings[item].polygon.color;
            eleMsg.points = globalGuiSettings[item].polygon.points;
            globalPointsArry.push(eleMsg)
        });
        //向服务端发起保存数据的请求，globalPointsArry是要传给服务端保存的数据集
        var globalPointsArry = JSON.stringify(globalPointsArry)
        $.ajax({
            url: '/api/data/box',
            type: 'POST',
            dataType: 'json',
            data: globalPointsArry
        })
        .done(function(msg) {
            addTipsEle('success','数据保存成功')
        })
        .fail(function(err) {
            addTipsEle('false','数据保存失败')
            console.log(err);
        })

    }else{

        //点击编辑执行的方法开始//////////////

        editMode = true //开启编辑模式
        $('.dg').show();//让GUI菜单框显示出来
        $(this).text('保存');

        allPolygonNameArry.forEach(function(name){
            globalGuiSettings[name].polygon.destruct();
            if(globalGuiSettings[name].tags){
              globalGuiSettings[name].tags.map((tag) => {
                tag.destruct()
              }) 
            }
            
            delete globalGuiSettings[name]
            gui.removeFolder2(name)
        });

        allPolygonNameArry = [];

        //从获取服务端的围栏数据//////////////////////////
        $.ajax({
            url: '/api/data/box',
            type: 'GET'
        })
        .done(function(data) {
            var data = JSON.parse(data);
            globalGuiSettings = { //dat.gui使用的控件对象（全局作用域）
                drawing: false,
                polygonIndex: 0
            };            
            data.forEach(function(data){
                rightClickFunc(data.points,data);
            })
            console.log("success");
        })
        .fail(function(err) {
            console.log("error"+err);
        })
        //////////////////////////////////////////////////////////

    }
});

//页面首次加载从服务端获取初始围栏数据////////////////////////////
$.ajax({
        url: '/api/data/box',
        type: 'GET'
    })
    .done(function(data) {
        var data = JSON.parse(data);
       //开始创建围栏
        data.forEach(function(item){
            let polygon = new altizure.PolyLineMarker({
                sandbox: sandbox,
                interactable: false,
                visible: true,
                // for base Marker
                fenceHeight: 60,
                points: item.points,
                color: item.color,
                // textOptions: textOptions,
                labelsVisible: false
            });
            //初始化全局变量
            var polygonName = 'Polygon ' + globalGuiSettings.polygonIndex.toString() //gui为每个围栏生成的标题名称
            allPolygonNameArry.push(polygonName);
            globalGuiSettings.polygonIndex += 1;
            globalGuiSettings[polygonName] = {
                polygon: polygon
            };
            polygon.interactable = true  //允许交互
            polygon.on('click',(e) => {
                thisArea = computeSignedArea(item.points)
                thisArea = thisArea.toFixed(2)
                addAreaAlert(thisArea,closeIcon,'.tyl-close-icon');
            })
        })         
        console.log("success");
    })
    .fail(function(err) {
        console.log("error"+err);
    })
/////////////////////////////////////////////////////////////////

//js根据经纬度计算多边形面积
function computeSignedArea(path) {
    let radius= 6371009
    let len = path.length;
    if (len < 3) return 0; 
    let total = 0;
    let  prev = path[len - 1];
    let prevTanLat = Math.tan(((Math.PI / 2 - prev.lat/180*Math.PI) / 2));
    let prevLng = (prev.lng)/180*Math.PI;
    for (let i in path) {
        let tanLat = Math.tan((Math.PI / 2 -
            (path[i].lat)/180*Math.PI) / 2);
        let lng = (path[i].lng)/180*Math.PI;
        total += polarTriangleArea(tanLat, lng, prevTanLat, prevLng);
        prevTanLat = tanLat;
        prevLng = lng;
    }
    return Math.abs(total * (radius * radius));
}

function polarTriangleArea(tan1,lng1,tan2,lng2) {
        let deltaLng = lng1 - lng2;
        let t = tan1 * tan2;
        return 2 * Math.atan2(t * Math.sin(deltaLng), 1 + t * Math.cos(deltaLng));
}


//面积弹出框相关方法
function addAreaAlert(thisArea,closeIcon,closeEle){
    var alertEle = `<div class="tyl-alert">面积： <span>${thisArea}</span>m²<img class="tyl-close-icon" src="${closeIcon}" alt="关闭"></div>`
    $('.tyl-alert').remove();
    $('body').append(alertEle);
    closeArea(closeEle);
    function closeArea(ele){
        $('body').on('click',ele,function(){
            $(this).parents('.tyl-alert').remove();
        })
    }
};


//提示框方法
function addTipsEle(type,text){
  var tipsEle = `<div class="tyl-tips ${type}">${text}</div>`
  $('.tyl-tips').remove();
  $('body').append(tipsEle);
  setTimeout(function(){
    $('.tyl-tips').fadeOut().remove(); 
  }, 1000);
};



































