/******************************************************************************
*表題：　　　　　TinyYoutubePlayerプラグインv2.0
*要件：           「単一機能」
*                   主たる機能と無関係な機能は削除しています。
*プラグイン：   このプラグインは、任意のwebページで動作する小型のyoutubeプレーヤーです。
*                  再生リストは、「ランダムリスト」または「リスト一覧」から選択することができます。 
*                   iframeでサイトのurlをロードし再生します。
*                   url=https://favorite.tecoyan.net/slim/index_radio_simple.php
*
*ファイル名：   tiny_youtube_player_content.js
*説明：           すべてのタブで動作するcontent.jsファイルです。このスクリプトでbody要素に
*                   iframeプレーヤーをアペンドします。
*                   検索結果を保存します。
*                   リストキーと本体データ(サムネイルとタイトルの配列)
*                   あらかじめ、jquery.jsをロードしています。
*ロード元:      C:\拡張プラグイン\TinyYoutubePlayer
******************************************************************************/
//このファイルで使用している変数のみにする
let extId;
let params;
let tab_sw;
let p_element;
//グローバルオブジェクト変数
let other;
/*********************************************************************************
* このファイル(tiny_youtube_player_content.js)の拡張機能Idを取得します。
**********************************************************************************/
extId = chrome.runtime.id;

//
other = {

//
    main: function () {
            /********************************************************************************
             *iframeのsrcに指定しているURLのphpファイルでheader("Access-Control-Allow-Origin: *");を
             *指定しているため、このhtmlページはすべてのサイトで動作可能
             *
             *********************************************************************************/
            //プレーヤー要素の追加
            //alert("youtube_radio要素をアペンドします。");
            let html ="<!-- youtubeラジオ　-->\n\
<div id='youtube_radio' title='ここでclickするとプラグインの説明を表示します。' style='background-color:lightyellow;z-index:999999;border: 10px solid lawngreen; width: 170px;height: 265px; position: fixed;zoom: 1.5;top:42px;right:0px;zoom:1.5;'>\n\
<img style='zoom:0.5;' src='https://favorite.tecoyan.net/slim/images/radio_small.png'><span  style='zoom:0.9;position:absolute;top:0px;right:10px;font-size:10px;'>TinyYoutubePlayerプラグインv2.0</span>\n\
<iframe id='iframe_radio' style='position:relative;top:0px;border:solid 2px orange; width:150px;height:250px;' src='https://favorite.tecoyan.net/slim/index_radio_simple_private.php?vid=YNQT68uHpyg&title=%E4%BB%8A%E6%97%A5%E3%81%AE%E6%97%A5%E3%81%AF%E3%81%95%E3%82%88%E3%81%86%E3%81%AA%E3%82%89%E3%80%80%E6%A3%AE%E5%B1%B1%E8%89%AF%E5%AD%90%E3%80%801967&url=&db_id=3120'></iframe>\n\
</div>";
            

            $("body").append(html);
            $("#youtube_radio").css("display","none");
            extId = chrome.runtime.id;
            
            //$("#youtube_radio").draggable();
            //
             document.getElementById("youtube_radio").onpointermove = function(event){
                      if(event.buttons){
                          this.style.left     = this.offsetLeft + event.movementX + 'px';
                          this.style.top      = this.offsetTop  + event.movementY + 'px';
                          this.style.position = 'absolute';
                          this.draggable      = false;
                          this.setPointerCapture(event.pointerId);
                      }
                      //
                      $("#youtube_radio").css("position","fixed");

              };
    }
};
/************************************************************************
*youtubeプレーヤで再生しますか?メッセージ 
*今回は不使用
*popup.htmlで対応 
*補完として
************************************************************************/
$("body").on('click',(e)=>{
    if(e.ctrlKey===true){

        if(window.confirm("youtubeプレーヤで再生しますか?")){
             $("#youtube_radio").css("display","block");

        }else{// 「キャンセル」時の処理開始
            $("#youtube_radio").css("display","none");
            //ここで再生を停止
            //プラグインからiframeのプレーヤーへ再生停止要求を出すには。
            //テスト的に"stop_video"メッセージをbackground.jsへ出す
            chrome.runtime.sendMessage({data: 'stop_video'}, function (msg) {
                       //応答は? 特になし。     
                            
            });
            return;
        }  
    }else if(e.altKey===true){
            //リスト一覧を表示して、リストを選択する。
            //alert("altKey");
            var resp = $.ajax({
                url: 'https://favorite.tecoyan.net/slim/get_ameba_youtube_list_ichiran.php',
                type: 'GET',
                dataType: 'json',
                cache: false,
                //data: params,
                async: false
            }).responseText;
            let response = JSON.parse(resp);
            //{"サムネイル":thumb  ,"タイトル": title}
            //リスト一覧(ichiran)リストを生成
            let dd ="<ul>";
            $.each(response,(i,val)=>{
                    //サムネイルのwidth:100px;にする。
                    //val.data[0].サムネイル
                    val.data[0].サムネイル = val.data[0].サムネイル.replace("<img","<img class=\"ichiran\" style=\"clear:both;width:50px;\""); 
                   
                    dd += "<li>"+val.data[0].サムネイル+" <span class=\"qkey\" style=\"width:200px;\">"+val.query_key+"</span></li>";
                    //dd += "<li>"+val.data[0].サムネイル+"</li>";
            });
            dd += "</ul>";
            //
            if($("#popup_panel").length===0){
                    //popup_panel要素をappend
                    let html = "<div id='popup_panel' style='overflow:scroll;background-color:lightyellow;z-index:999999;border: 10px solid lawngreen; width: 170px;height: 265px; position: fixed;zoom: 1.5;top:42px;left:67%'>"+dd+"</div>";
                    $("body").append(html);
                    $("#popup_panel").draggable();
            
             }else{
                    //
                    $("#popup_panel").html(dd);
                    $("#popup_panel").draggable();
             }
             //サムネイルをクリックするイベントリスナー定義
             setTimeout(()=>{
                        //class='ichiran'
                        let aaa = $(".ichiran");
                        $.each(aaa,(i,val)=>{
                                    //
                                    //val.    
                                    $(val).on('click',(e)=>{
                                        //ここで、イベントを登録
                                        //このサムネイルで再生します。
                                        //この時、このiframeプレーヤーで再生するため、
                                        //tabId,iframeIdを使用して、executeScriptでプレーヤーのスクリプトへ監視を起動して
                                        //そこで、.loadVideoById(vid)を実行。
                                        //ここで、background.jsへ"UpdateList"メッセージを送信
                                        //サムネイルのvidを
                                        let vid = e.target.src.split("vi/")[1].split("/")[0];
                                        let query_key = e.target.nextElementSibling.innerText;
                                        chrome.runtime.sendMessage({data: 'UpdateList',vid:vid,query_key:query_key}, function (msg) {
                                        //応答は? 特になし。     
                            
                                        });
                                        
                                        
                                    });
                        });
                 
             },1000);
        
    }else{
        //
        if(e.target.id==='youtube_radio'){
                    alert("プラグインの説明\n\
このプラグインはTinyYoutubePlayerプラグインです。\n\
リストのサムネイルをクリックすると再生します。\n\
リストはランダムで連続自動再生します。\n\
\n\
このiframeプレーヤーはすべてのwebページで再生します。\n\
");
                    return false;
        }

    }
    
});
//
tab_sw = tab_case();
/********************************************************************************
*タブ処理へ分岐  
*                   slim_content.jsは、タブ毎に処理空間を持つ
*                   タブ毎の処理を分岐　タブ毎にオブジェクト定義　その中のmain()メソッドをコールしている
*                   tab_swで分岐
*                   ここで、#temp_pluginをチェックして、オンオフにより、
********************************************************************************/
switch (tab_sw) {
    case "other":
            other.main();     
            break;
}

//******************************************************************************
//スイッチ変数
//タブ処理分岐
//******************************************************************************
function tab_case() {

           //その他
           return "other";
}
/********************************************************************************
*background.jsより、メッセージを受信
*play_modeメッセージで、
*・プレーヤー表示
*・リスト一覧を表示 
*********************************************************************************/
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        //応答
        //
        switch (msg.type) {
            case "tabs_popup":
                       if(msg.content['tabs_popup']===true){ 
                                //
                                let data = msg.content['tabs_array']; 
                                /*******************************************************************
                                * ここで、popupして情報を表示
                                * tabs_arrayの情報を表示
                                *******************************************************************/
                                //let html = "<ul>";
                                let html ="";
                                for(let i=0;i<data.length;i++){
                                         //先にアクティブをチェックして
                                         if(data[i]['active']===true){
                                                 //
                                                 if(location.href === data[i]['url']){
                                                          html =data[i]['id'];

                                                 }
                                                 break;
                                         }   
                                }
                                 //
                                 if($("#tabs_panel").length !== 0){
                                           $("#tabs_panell").html("");
                                           //あり
                                           $("#tabs_panell").html(html);
                                 }else{
                                           //なし
                                           $("body").append("<div id='tabs_panel'>"+html+"</div>");
                                 }
                                 //スタイルをセット
                                 $("#tabs_panel").css({"padding-top": "5px","zoom":"1.4","z-index":"9999","background-color":"lightpink" ,"position":"fixed","top":"5%","left":"1%","width":"100px","height":"30px"});
                                 $("#tabs_panel").draggable();
                                 /*
                                  * 
                                  */
                                 /*******************************************************************
                                 * ここで、popupして情報を表示
                                 * tabs_arrayの情報を表示
                                 *******************************************************************/
                                 html = "<ul>";
                                 for(let i=0;i<data.length;i++){
                                          //
                                          if(data[i]['active']===true){
                                                       html += "<li> ("+i+") <span style='color:blue;'>"+data[i]['active']+"</span>　"+data[i]['id']+"　"+data[i]['title']+"　"+data[i]['url']+"</li><br>";
                                                    }else{
                                                       html += "<li> ("+i+") <span style='color:red;'>"+data[i]['active']+"</span>　"+data[i]['id']+"　"+data[i]['title']+"　"+data[i]['url']+"</li><br>";

                                          }
                                 }
                                 html += "</ul><button id='cancel_tabs_popup'>キャンセル</button>";

                                 //
                                 if($("#tabs_panel1").length !== 0){
                                           $("#tabs_panel1").html("");
                                           //あり
                                           $("#tabs_panel1").html(html);
                                 }else{
                                           //なし
                                           $("body").append("<div id='tabs_panel1'>"+html+"</div>");
                                 }
                                 //スタイルをセット
                                 $("#tabs_panel1").css({"padding": "5px","zoom":"1.4","z-index":"9999","overflow":"scroll","background-color":"lightpink" ,"position":"fixed","top":"5%","left":"55%","width":"500px","height":"200px"});
                                 $("#tabs_panel1").draggable();
                                 $("#cancel_tabs_popup").on('click',()=>{
                                             //
                                             //$("#tabs_popup").css("display","none");
                                             $("#tabs_panel1").remove();
                                             $("#tabs_panel").remove();
                                             //background.jsのtabs_popupをリセットする
                                             chrome.runtime.sendMessage({data: 'reset_tabs_popup'}, function (msg) {
                                            //応答は? 特になし。     

                                            });
                                             
                                             //alert("テスト");
                                 });
                        }
                        break;
            
                //
                case "cancel_popup":
                        //
                        document.querySelector("#youtube_radio").style.display = "none";
                        if($("#popup_panel").length !== 0){
                                document.querySelector("#popup_panel").style.display = "none";
                        }
                        //ここで再生を停止
                        //プラグインからiframeのプレーヤーへ再生停止要求を出すには。
                        //テスト的に"stop_video"メッセージをbackground.jsへ出す
                        chrome.runtime.sendMessage({data: 'stop_video'}, function (msg) {
                                   //応答は? 特になし。     

                        });
                        
                        break;
                //リスト選択モード        
                case "list_select":
                        //
                        $("#youtube_radio").css("display","block");
                        $("#popup_panel").css("display","block");
                        //リスト一覧を表示
                        //trigger Alt+click
                        //
                        var ee = jQuery.Event('click');
                        ee.altKey = true;
                        $('body').trigger(ee);


                        break;
                //ランダムリスト    
                case "random" :
                        //
                        $("#youtube_radio").css("display","block");
                        extId = chrome.runtime.id;
                        //ここで、ctrl+clickのtriggerを実行
                        ee= jQuery.Event('click');
                        ee.ctrlKey = true;
                        $('body').trigger(ee);
                                                
                        break;
            
        }
        
        
});
//

//
