/******************************************************************************
*TinyYoutubePlayerプラグイン v2.0
*popup.js
*実行モードを選択して再生
*
******************************************************************************/
'use strict';
/*
 * 
 */
window.addEventListener('load', function () {
         let dd;
         //   
         $("#tabs_popup").on('click',() => {
                $("#tabs_popup")[0].checked  = true;
                //リスト選択モードで実行
//                chrome.runtime.sendMessage({data: 'play_mode',content:"list"},sendResponse);
//
//                function sendResponse(){
//
//                }
//                $("#radio_panel").css("display","none");
         });
         /*************************************************
          * リスト選択モード
          *************************************************/   
         //alert("htmlは、ロードされました。");
         $("#list").on('click',() => {
                $("#list")[0].checked  = true;
                $("#random")[0].checked  = false;
                //リスト選択モードで実行
                dd = {"mode":"list","tabs_popup":$("#tabs_popup")[0].checked};
                chrome.runtime.sendMessage({data: 'play_mode',content:dd},sendResponse);

                function sendResponse(){

                }
                $("#radio_panel").css("display","none");
         });
         /*****************************************************
          * ランダムリストモード
          * チェックすると"play_mode"メッセージをbackground.jsへ送信
          ******************************************************/
         $("#random").on('click',() => {
                $("#list")[0].checked  = false;
                $("#random")[0].checked  = true;
                //ランダムモードで実行
                dd = {"mode":"random","tabs_popup":$("#tabs_popup")[0].checked};
                chrome.runtime.sendMessage({data: 'play_mode',content:dd},sendResponse);

                function sendResponse(){

                }
                $("#radio_panel").css("display","none");
         });
         /***********************************************************
          * プレーヤー、リストを削除
          ***************************************************************/
         //
         //
         $("#cancel").on('click',() => {
                //
                //alert("cancel");
 
                
                chrome.runtime.sendMessage({data: 'cancel_popup'},sendResponse);
                
                function sendResponse(){}
                //
                  document.getElementById("radio_panel").remove();             
                //$("#youtube_radio").css("display","none");
                //$("#radio_panel").css("display","none");
                
         
         });

         
    
});
