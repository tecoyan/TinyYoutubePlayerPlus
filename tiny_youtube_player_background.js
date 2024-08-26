/******************************************************************************
*TinyYoutubePlayerプラグインv2.0
*要件：「単一機能」
*主たる機能と無関係な機能は削除しています。
*
*tiny_youtube_player_background.js
*処理
*(1)g_nplayer.stopVideo()を監視で起動するため、"stopVideo"メッセージ
*(2)Changeイベントを処理するための監視メッセージ　""
*
******************************************************************************/
console.log("background.jsスタート!!!");
'using strict';
let tabs_array=[];
let tabs_popup = false;
let extId;
let active_tabId;
let tabId;
let vid;
let query_key;
let data;
let tabs_id_player=[]; 
let tabs_id_youtube=[];
let tabs_id_other=[];
/******************************************************************************
*このプラグインの拡張機能Idを取得 
* TiniYoutubePlayerプラグインv2.0
* 
*******************************************************************************/
extId = chrome.runtime.id;
/******************************************************************************
関数 ex_listener(msg, sender, sendResponse)
親タブからのエクステンションのバージョン要求
background.jsはmanifest.jsonファイルからバシージョン取得し、親タブへ応答します。

******************************************************************************/
function ex_listener(msg, sender, sendResponse){
        //
        set_tabs_array();
        //プレーヤーページからの要求    
        switch(msg.type){
        /*************************************************************************
         * get_tabIdメッセージを受信
         * 
         ***************************************************************************/            
        //tabIdを返す
        case "get_tabId":
            console.log("プレーヤーからの、get_tabIdメッセージ受信");
             if(sender.origin.indexOf("tecoyan.net")===-1){
                            return; 
                    }
                    //console.log("■get_tabid　msg.subdomain = "+msg.subdomain);
                    //subdomain = msg.subdomain;
                    tabs_id_player=[]; tabs_id_youtube=[];tabs_id_other=[];
                    //tabs.queryで、プレーヤーを見つける
                    chrome.tabs.query({}, tabs => {
                            //ttabs = tabs;
                            //parent_urlのタブid(active_tab_id)をチェック
                            for(let i=0; i<tabs.length; i++){
                                
                                    try{
                                        //**********************************************************
                                        //プレーヤータブ　                    
                                        //**********************************************************
                                        //ここで、プレーヤータブがあるかをチェック
                                        if(tabs[i].url.indexOf("https://") !== -1){
                                                 tabs_id_player.push(tabs[i].id);
                                                 opener = tabs[i].id;
                                                 console.log("関数 check_player_tab_exist() 変数 tabs_id_player "+tabs[i].id);
                                         }
                                         break;
                                    }catch(e){
                                        continue;

                                    }
                            }
                            //このタイミングで、tabs_id_playerがないケースあり?
                            //空の配列で初期値がない。
                            console.log("●●●配列は空かtabs_id_player　"+tabs_id_player);
                            if(tabs_id_player.length===0){
                                console.log("●●●配列は空");
                                return; 
                            }
                            //
                            let player_id = tabs_id_player.reduce(aryMin); //
                            let opener = player_id;
                            sendResponse({opener:opener});
                    });
            break;            

        /********************************************************************
        *disp_ameba_youtube_listメッセージを受信
        *iframeプレーヤーのリストへ表示 msg.content
        *ここで、リストのタイトルの色を表示
        *********************************************************************/    
        case "disp_ameba_youtube_list":
                    extId = chrome.runtime.id;
                    //リストデータ
                    data = msg.content.data[0];
                    let html = "";let thumb;
                    html += "<ul style='margin-left:-20px;margin-top:-5px;width:250px;clear:both;height:200px;'>";
                    for(let i=0;i<data.length-1;i++){
                        thumb = data[i]['サムネイル'].split("src=")[1].replace(/"/g,'').replace(/ \>/g,'');
                        thumb = thumb.replace(">","");
                        //リスト生成
                            html += "<li style='margin-left:-10%;font-size:0.9em;clear:both;'><img class='my_list' name='" + i + "'\n\
                 src='" + thumb + "' style='float:left;width:50px;'><span class='plist_title'>" + data[i]['タイトル'] + "</span></li>";
   
                    }  
                    html += "</ul>";
              
                    async function async_Loop_Disp(){      
                                //全タブのframeプレーヤーで再生する監視を起動
                                //tabs.query() Webnavigation
                                chrome.tabs.query({}, (tabs) => {
                                        const tab_arr = Object.values(tabs);
                                        (async ()=>{
                                                for await (const tab of tab_arr) {
                                                    console.log("for await ループ　"+tab.id);
                                                    tabId = tab.id;
                                                    try{
                                                            //urlをチェック                    
                                                            if (tab.url.indexOf("https://") !== -1) {
                                                                    //ここで、タブの全フレームデータを取得して保存
                                                                    chrome.webNavigation.getAllFrames({tabId: tabId,}).then(logFrameInfo3, onError);
                                                                    console.log("■　■　■getAllFrames()コール後　"+tabId);
                                                                    await sleep(0.5);
                                                            }else{

                                                            }

                                                    }catch(e){
                                                            //なし
                                                    }
                                                }
                                    })();
                                        /*
                                         *すべてのフレームの中から、プレーヤーフレームを検索して出力
                                         * 
                                         */
                                        function logFrameInfo3(framesInfo) {
                                                    console.log("■　■　■　logFrameInfo　" + framesInfo.length);
                                                    const frm_arr = Object.values(framesInfo);
                                                    (async () => {
                                                                //
                                                                for await (const frm of frm_arr) {
                                                                    try {
                                                                        //iframeプレーヤーチェック
                                                                        if (frm.url.indexOf("https://favorite.tecoyan.net") !== -1) {
                                                                                    console.log("●✖▼■フレームInfo url = " + frm.url + "  " + tabId);
                                                                                    //executeScript()を実行
                                                                                    //filesとfuncを同時に指定できないので分けて出す。
                                                                                    chrome.scripting.executeScript({
                                                                                        target: {tabId: tabId, frameIds: [frm.frameId]},
                                                                                        files: ["jquery.js"]
                                                                                    }).then(() => {
                                                                                            //ここでもexecuteScript()を出す
                                                                                            chrome.scripting.executeScript({
                                                                                                        //ターゲットのフレームIdのDOMへアクセス  
                                                                                                        target: {tabId: tabId, frameIds: [frm.frameId]},
                                                                                                        args: [html,extId],
                                                                                                                                                      
                                                                                                        //実行コード
                                                                                                        func: (html,extId) => {
                                                                                                            //$を使うには、先にfiles:指定しておく。
                                                                                                            //これでDOMにアクセス可能
                                                                                                            //msg.vid サムネイルのvidをパラメータで渡すには、
                                                                                                            //vidがないと? vidを渡せていない?
                                                                                                            //これは、index_radio_simple.jsでvidを参照している?
                                                                                                            $("#lists").html(html);
                                                                                                            $("#ex_id").html(extId);
                                                                                                            //リストの先頭のタイトルの色表示
                                                                                                            let aaa = $(".plist_title");
                                                                                                            $.each(aaa,(i,val)=>{
                                                                                                                    //
                                                                                                                val.style.color= "blue";
                                                                                                            });
                                                                                                            //先頭のタイトルを赤に
                                                                                                            $(".plist_title")[0].style.color = "red";       
                                                                                                            setTimeout(()=>{
                                                                                                                //**************************************************************************
                                                                                                                //サムネイルにエンター
                                                                                                                //**************************************************************************
                                                                                                                $(".my_list").on({
                                                                                                                        'mouseenter':function (e){
                                                                                                                                    //
                                                                                                                                    //alert("サムネイルを拡大");
                                                                                                                                    console.log("拡大");
                                                                                                                                    e.target.style.zoom = 2.5;
                                                                                                                          },
                                                                                                                          'mouseleave':function (e){
                                                                                                                                    //戻す。
                                                                                                                                    e.target.style.zoom = "";
                                                                                                                          }
                                                                                                                 });
                                                                                                                 $(".plist_title").on({     
                                                                                                                        'mouseenter':function (e){
                                                                                                                                    //
                                                                                                                                    //alert("タイトルを拡大");
                                                                                                                                    console.log("拡大");
                                                                                                                                    e.target.style.zoom = 1.5;
                                                                                                                                    e.target.style.display = "block";
                                                                                                                                    e.target.style.width = "300px";
                                                                                                                          },
                                                                                                                          'mouseleave':function (e){
                                                                                                                                    //戻す。
                                                                                                                                    e.target.style.zoom = "";
                                                                                                                          }
                                                                                                                 });
                                                                                                            },1000);
                                                                                                            
                                                                                                            
                                                                                                            //$('#observ2').attr('title', 'test');        //属性を変更して監視を起動
                                                                                                            //observ2の監視で.loadVideoById(vid)を実行
                                                                                                            $("li").css("background-color", "lightgrey");
                                                                                                            console.log("executeScript DispList");
                                                                                                        }
                                                                                            });
                                                                                    });
                                                                                    await sleep(0.5);

                                                                        }
                                                                        else {

                                                                        }
                                                                    }   //try
                                                                    
                                                                    catch (e) {

                                                                    }
                                                                }   //for
                                                    })();   //async
                                        }   //logFrameInfo3(framesInfo)
                                        //
                                        function onError(error) {
                                          console.error(`Error: ${error}`);
                                        }

                            });
                    }
                    (async ()=>{
                            async_Loop_Disp(); 
                
                    }).call();
            
            
            
            break;
     }

}
//

/******************************************************************************
//External(Webアプリ)からバージョンリクエスト受信待ち
******************************************************************************/
chrome.runtime.onMessageExternal.addListener(ex_listener);
/*****************************************************************************
 * chrome.tabs.onActivated.addListener
 * リスナー
 * 
 ********************************************************************************/
chrome.tabs.onActivated.addListener(function (activeInfo) {
            console.log("▼▼タブアクティベイトリスナー　タブid取得");
            
            active_tabId = activeInfo.tabId;
            
            
            
            let dd;let aa;
            chrome.tabs.query({}, (tabs) => {
                  tabs_array = [];  
                  for(let i=0;i<tabs.length;i++){
                      dd = {"active":tabs[i].active,"title":tabs[i].title,"url":tabs[i].url,"id":tabs[i].id};
                      tabs_array.push(dd);
                  }
                  /***********************************************************************
                   * ここで、content.jsへtabs_popupメッセージを送信
                   * アクティブタブへtabs_popupメッセージを送信
                   * そこで、tabId他の情報を表示
                   ************************************************************************/
                  //
                  dd = {"tabs_array":tabs_array,"tabs_popup":tabs_popup};
                  chrome.tabs.sendMessage(active_tabId, {type: 'tabs_popup',content:dd},(msg)=>{
                            //
                            
                                  
                  });
                  
                  
                  


              });
   
}); 


/******************************************************************************
 * sleep()関数
 *******************************************************************************/
const sleep = (s) => new Promise(f => setTimeout(f, s * 1000));
/*
 * 
 */
let sts;let message;
/****************************************************************
 *****************************************************************/
console.log("■■background.jsスタート");
extId = chrome.runtime.id;
/****************************************************************************
*リスナー  メッセージを受信する　tabは複数ありえる
*popup.js,content.js
*(1)cancel_popupメッセージ(from popup.js)
*(2)stop_videoメッセージ(from content.js)
**************************************************************************/
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    set_tabs_array();
    console.log("....jsから受信 送信元情報 "+sender.origin);
    console.log("....jsから受信 msg.data " +msg.data);
    //メッセージをチェック
    switch(msg.data){
        case "reset_tabs_popup":
                    //
                    tabs_popup = false;
        
                    break;
        case "cancel_popup":
                    //
                    //ここで、tabs_array[]から、activeのtabIdを取得して、セット
                    for (let i = 0; i < tabs_array.length; i++) {
                        //
                        if (tabs_array[i].active === true) {
                            tabId = tabs_array[i].id;
                            break;
                        }
                    }
                    chrome.tabs.sendMessage(tabId, {type: 'cancel_popup'},(msg)=>{
                            //
                            
                                  
                    });
            
            
            
            break;
        /***********************************************************************
         * popup.jsでモードのチェックボタンを選択
         * 
         ***********************************************************************/    
        case "play_mode":
                    //
                    tabs_popup = msg.content['tabs_popup'];
                    //
                    if(msg.content['mode']==="list"){
                            /**********************************************************
                            *リスト選択モードで実行
                            *プレーヤーを表示して、さらにリスト一覧を表示してリストを選択し再生
                            *ここで、
                            ***********************************************************/
                            //
                            extId = chrome.runtime.id;
                            //content.jsで $("#youtube_radio").css("display","block");を実行
                            //
                            chrome.tabs.sendMessage(active_tabId, {type: 'list_select'},(msg)=>{
                                  
                                  
                            });
                        
                    }else{
                            /**********************************************************
                             *randomモードで実行
                             *プレーヤーを表示してランダムリストで再生
                             *observ_randomを監視
                             ***********************************************************/     
                             //iframeプレーヤーのjsスクリプトへ監視の起動をセット
                            //ここで、executeScript()で$(ex_id).html(..)を実行
                            extId = chrome.runtime.id;
                    async function async_random_Loop(){      
                                //全タブのframeプレーヤーで再生する監視を起動
                                //tabs.query() Webnavigation
                                chrome.tabs.query({}, (tabs) => {

                                        const tab_arr = Object.values(tabs);
                                        (async ()=>{
                                                for await (const tab of tab_arr) {
                                                    console.log("for await ループ　"+tab.id);
                                                    tabId = tab.id;
                                                    try{
                                                            //urlをチェック                    
                                                            if (tab.url.indexOf("https://") !== -1) {
                                                                    //ここで、タブの全フレームデータを取得して保存
                                                                    chrome.webNavigation.getAllFrames({tabId: tabId,}).then(logFrameInfo_random, onError);
                                                                    console.log("■　■　■getAllFrames()コール後　"+tabId);
                                                                    await sleep(0.5);
                                                            }else{

                                                            }

                                                    }catch(e){
                                                            //なし
                                                    }
                                                }
                                    })();
                                        /*
                                         *すべてのフレームの中から、プレーヤーフレームを検索して出力
                                         * 
                                         */
                                        function logFrameInfo_random(framesInfo) {
                        console.log("■　■　■　logFrameInfo　" + framesInfo.length);
                        const frm_arr = Object.values(framesInfo);
                        (async () => {
                            for await (const frm of frm_arr) {
                                try {
                                    //iframeプレーヤーチェック
                                    if (frm.url.indexOf("https://favorite.tecoyan.net") !== -1) {
                                        console.log("●✖▼■フレームInfo url = " + frm.url + "  " + tabId);
                                        //executeScript()を実行
                                        //filesとfuncを同時に指定できないので分けて出す。
                                        chrome.scripting.executeScript({
                                            target: {tabId: tabId, frameIds: [frm.frameId]},
                                            files: ["jquery.js"]
                                        }).then(() => {
                                            //ここでもexecuteScript()を出す
                                            chrome.scripting.executeScript({
                                                //ターゲットのフレームIdのDOMへアクセス  
                                                target: {tabId: tabId, frameIds: [frm.frameId]},
                                                args:[extId],
                                                //実行コード
                                                func: (extId) => {
                                                    $("#ex_id").html(extId);
                                                   
                                                    
                                                    //$を使うには、先にfiles:指定しておく。
                                                    //これでDOMにアクセス可能
                                                    $('#observ_random').attr('title', 'test');        //属性を変更して監視を起動
                                                    //observ_randomの監視で
                                                    $("ul").css("background-color", "lightgrey");
                                                    console.log("executeScript randomテスト");
                                                }
                                            });
                                        });
                                        await sleep(0.5);

                                    }
                                    else {

                                    }
                                }
                                catch (e) {

                                }
                            }
                        })();
                    }
                                          //
                                          function onError(error) {
                                            console.error(`Error: ${error}`);
                                          }

                            });
                    }
                    (async ()=>{
                            async_random_Loop(); 
                
                    }).call();                            
                            
                            //ここで、
                            //ここで、tabs_array[]から、activeのtabIdを取得して、セット
                            for (let i = 0; i < tabs_array.length; i++) {
                                //
                                if (tabs_array[i].active === true) {
                                    tabId = tabs_array[i].id;
                                    break;
                                }
                            }
                            //content.jsで $("#youtube_radio").css("display","block");を実行
                            chrome.tabs.sendMessage(tabId, {type: 'random'},(msg)=>{
                                  
                                  
                            });
                        
                    }
                    break;
                    
        /***************************************************************
         *stop_videoメッセージを受信 
         * 全タブのframeプレーヤーで再生する監視を起動
         * 
         ****************************************************************/
        case "stop_video":
                    extId = chrome.runtime.id;
                    tabId;

                    async function async_Loop(){      
                                //全タブのframeプレーヤーで再生する監視を起動
                                //tabs.query() Webnavigation
                                chrome.tabs.query({}, (tabs) => {

                                        const tab_arr = Object.values(tabs);
                                        (async ()=>{
                                                for await (const tab of tab_arr) {
                                                    /*********************************************************
                                                    *iframeプレーヤーチェック
                                                    *ここで、今開いているタブのみにする　アクティブのタブ  
                                                    *********************************************************/
                                                    if(active_tabId === tab.id){
                                                            console.log("for await ループ　"+tab.id);
                                                            tabId = tab.id;
                                                            try{
                                                                    //urlをチェック                    
                                                                    if (tab.url.indexOf("https://") !== -1) {
                                                                            //ここで、タブの全フレームデータを取得して保存
                                                                            chrome.webNavigation.getAllFrames({tabId: tabId,}).then(logFrameInfo1, onError);
                                                                            console.log("■　■　■getAllFrames()コール後　"+tabId);
                                                                            await sleep(0.5);
                                                                    }else{

                                                                    }

                                                            }catch(e){
                                                                    //なし
                                                            }
                                                            break;
                                                    }
                                                }
                                    })();
                                        /*
                                         *すべてのフレームの中から、プレーヤーフレームを検索して出力
                                         * 
                                         */
                                        function logFrameInfo1(framesInfo) {
                        console.log("■　■　■　logFrameInfo　" + framesInfo.length);
                        const frm_arr = Object.values(framesInfo);
                        (async () => {
                            for await (const frm of frm_arr) {
                                try {
                                    /*********************************************************
                                    *iframeプレーヤーチェック
                                    *今開いているタブのみにする　アクティブのタブ  
                                     *********************************************************/
                                  
                                    if (frm.url.indexOf("https://favorite.tecoyan.net") !== -1) {
                                        console.log("●✖▼■フレームInfo url = " + frm.url + "  " + tabId);
                                        //executeScript()を実行
                                        //filesとfuncを同時に指定できないので分けて出す。
                                        chrome.scripting.executeScript({
                                            target: {tabId: tabId, frameIds: [frm.frameId]},
                                            files: ["jquery.js"]
                                        }).then(() => {
                                            //ここでもexecuteScript()を出す
                                            chrome.scripting.executeScript({
                                                //ターゲットのフレームIdのDOMへアクセス  
                                                target: {tabId: tabId, frameIds: [frm.frameId]},
                                                args:[extId],
                                                //実行コード
                                                func: (extId) => {
                                                    $("#ex_id").html(extId);
                                                    //$を使うには、先にfiles:指定しておく。
                                                    //これでDOMにアクセス可能
                                                    $('#observ1').attr('title', 'test');        //属性を変更して監視を起動
                                                    //observ1の監視でg_nplayer.stopVideo()を実行
                                                    $("ul").css("background-color", "lightgrey");
                                                    console.log("executeScript console.logテスト");
                                                }
                                            });
                                        });
                                        await sleep(0.5);

                                    }
                                    else {

                                    }
                                }
                                catch (e) {

                                }
                            }
                        })();
                    }
                                          //
                                          function onError(error) {
                                            console.error(`Error: ${error}`);
                                          }

                            });
                    }
                    (async ()=>{
                            async_Loop(); 
                
                    }).call();
                    
                    break; 
/***************************************************************
* UpdateListメッセージを受信
* リスト一覧の更新の監視を起動
*
*  
****************************************************************/
        case "UpdateList":
                    extId = chrome.runtime.id;
                    vid = msg.vid;
                    query_key = msg.query_key;
                    //let tabId;
                    async function async_Loop_UpdateList(){      
                                //全タブのframeプレーヤーで再生する監視を起動
                                //tabs.query() Webnavigation
                                chrome.tabs.query({}, (tabs) => {
                                        const tab_arr = Object.values(tabs);
                                        (async ()=>{
                                                for await (const tab of tab_arr) {
                                                    console.log("for await ループ　"+tab.id);
                                                    tabId = tab.id;
                                                    try{
                                                            //urlをチェック                    
                                                            if (tab.url.indexOf("https://") !== -1) {
                                                                    //ここで、タブの全フレームデータを取得して保存
                                                                    chrome.webNavigation.getAllFrames({tabId: tabId,}).then(logFrameInfo2, onError);
                                                                    console.log("■　■　■getAllFrames()コール後　"+tabId);
                                                                    await sleep(0.5);
                                                            }else{

                                                            }

                                                    }catch(e){
                                                            //なし
                                                    }
                                                }
                                    })();
                                        /*
                                         *すべてのフレームの中から、プレーヤーフレームを検索して出力
                                         * 
                                         */
                                        function logFrameInfo2(framesInfo) {
                                                    console.log("■　■　■　logFrameInfo　" + framesInfo.length);
                                                    const frm_arr = Object.values(framesInfo);
                                                    (async () => {
                                                                //
                                                                for await (const frm of frm_arr) {
                                                                    try {
                                                                        //iframeプレーヤーチェック
                                                                        if (frm.url.indexOf("https://favorite.tecoyan.net") !== -1) {
                                                                                    console.log("●✖▼■フレームInfo url = " + frm.url + "  " + tabId);
                                                                                    //executeScript()を実行
                                                                                    //filesとfuncを同時に指定できないので分けて出す。
                                                                                    chrome.scripting.executeScript({
                                                                                        target: {tabId: tabId, frameIds: [frm.frameId]},
                                                                                        files: ["jquery.js"]
                                                                                    }).then(() => {
                                                                                            //ここでもexecuteScript()を出す
                                                                                            chrome.scripting.executeScript({
                                                                                                        //ターゲットのフレームIdのDOMへアクセス  
                                                                                                        target: {tabId: tabId, frameIds: [frm.frameId]},
                                                                                                        args: [vid,query_key,extId],
                                                                                                                                                      
                                                                                                        //実行コード
                                                                                                        func: (vid,query_key,extId) => {
                                                                                                            $("#ex_id").html(extId);
                                                                                                            //$を使うには、先にfiles:指定しておく。
                                                                                                            //これでDOMにアクセス可能
                                                                                                            //msg.vid サムネイルのvidをパラメータで渡すには、
                                                                                                            //vidがないと? vidを渡せていない?
                                                                                                            //これは、index_radio_simple.jsでvidを参照している?
                                                                                                            $("#vid").html(vid);
                                                                                                            $("#query_key").html(query_key);
                                                                                                            $('#observ2').attr('title', 'test');        //属性を変更して監視を起動
                                                                                                            //observ2の監視で.loadVideoById(vid)を実行
                                                                                                            $("ul").css("background-color", "lightgrey");
                                                                                                            console.log("executeScript console.logテスト");


                                                                                                        }
                                                                                            });
                                                                                    });
                                                                                    await sleep(0.5);

                                                                        }
                                                                        else {

                                                                        }
                                                                    }   //try
                                                                    
                                                                    catch (e) {

                                                                    }
                                                                }   //for
                                                    })();   //async
                                        }   //logFrameInfo2(framesInfo)
                                        //
                                        function onError(error) {
                                          console.error(`Error: ${error}`);
                                        }

                            });
                    }
                    (async ()=>{
                            async_Loop_UpdateList(); 
                
                    }).call();
                    
                    break;         
                
    }
    return false;
});
/*******************************************************************
*関数 aryMin()
*配列の中の最小値(タブid)を取得
*複数のプレーヤータブがあるケース
*********************************************************************/
const aryMin = function (a, b) {
    return Math.min(a, b);
};
//
function callback(){
    
}
/*********************************************************************
 * 
 * tabs.queryで、アクティブを調べる
 * tabs_array = []
 * 
 * 
 **********************************************************************/
function set_tabs_array(){
        //
        chrome.tabs.query({}, tabs => {
                let dd;tabs_array=[];
                for(let i=0; i<tabs.length; i++){

                        try{
                            //**********************************************************
                            //https://を抽出して、　tabs_arrayに{　　　}オブジェクトをpush 　                    
                            //**********************************************************
                            //ここで、プレーヤータブがあるかをチェック
                            if(tabs[i].url.indexOf("https://") !== -1){
                                     dd = {"active":tabs[i].active,"id":tabs[i].id,"title":tabs[i].title,"url":tabs[i].url};
                                     tabs_array.push(dd);
                             }
                        }catch(e){
                            continue;

                        }
                }

        });
}
