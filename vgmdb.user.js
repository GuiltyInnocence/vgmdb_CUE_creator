// ==UserScript==
// @name         vgmdb
// @version      0.0.1
// @description  vgmdb CUE creator
// @author       guiltyinnocence
// @match        *://vgmdb.net/album/*
// ==/UserScript==

/*
    WE NEED JAPANESE!!!
    NO ROMAJI!!!
                        */
document.querySelectorAll("span[lang=en]").forEach(function (node){node.setAttribute("style","display:none")});
document.querySelectorAll("span[lang=ja]").forEach(function (node){node.setAttribute("style","display:inline")});

// create button
var pos=document.getElementsByClassName("label smallfont")[0];
var bat=document.createElement("a");
bat.href="javascript:void(0)";
bat.onclick=function(){download();}//ok it works
bat.innerHTML=" create CUE";
pos.appendChild(bat);
//console.log(bat);
// button created

var min=0,sec=0;
function theWorld(nu){if(nu<10)return `0${nu}`;else return nu;}
var t1="";
var download=function download() {
    console.log("Now download CUE...");
    try {
        var rel=document.getElementById("tlnav").querySelector("li.active").firstChild.getAttribute("rel");//烦死了，选中哪个生成哪个吧
    } catch (error) {
        alert("There is no tracklist!")
    }
    //var t1=document.querySelector("h1>span.albumtitle[lang=ja]");//OK
    t1=document.querySelector("h1>span.albumtitle[lang=ja]").childNodes[1].nodeValue;//to be test
    var cata=document.querySelector("#album_infobit_large").getElementsByTagName("td")[1].innerText; // Does not work if `catalog` field does not exist or is not the first child, todo!!!
    //who is SB?????? why `querySelectorAll("#album_infobit_large")[1]`??? the `id` is not unique!!!
    var performer=document.querySelectorAll("#album_infobit_large")[1].querySelector("span[title=Performer]").parentElement.parentElement.parentElement.nextElementSibling.innerText;// ??????
    var root=document.getElementById(rel);//span,display:inline
    var totalset=root.querySelectorAll("span>span.time");//playtime set
    var id=window.location.href.split("/")[4]; // I'm lazy~~~
    var tables=root.getElementsByTagName("table");//table of disc list, exclude [0]
    // console.log(tables[1]);
    for(var i=1;i<tables.length;i++) {//repeat disc
        var totaltime=totalset[i-1].innerText;// : divided string
        min=0;sec=0;
        var result=`REM vgmdb ${id}
REM CATALOG ${cata}
PERFORMER "${performer}"
TITLE "${t1}"
FILE "fill in by yourself" WAVE
`
        var trs=tables[i].getElementsByTagName("tr");
        for(var j=0;j<trs.length;j++){//discs
            var tds=trs[j].getElementsByTagName("td");
            if(sec>60){sec-=60;min+=1;}
            result+=`  TRACK ${tds[0].innerText} AUDIO
    TITLE "${tds[1].innerText}"
    PERFORMER "${performer}"
    INDEX 01 ${theWorld(min)}:${theWorld(sec)}:00
`
            min+=Number(tds[2].innerText.split(":")[0]);
            // console.log(tds[2].innerText.split(":")[0]);
            sec+=Number(tds[2].innerText.split(":")[1]);
        }
        createObject(result,i);
        // console.log(result);
    }
}
function createObject (content,noid) {
    var file = new File([content], `${t1}_DISC${noid}.cue`, { type: "text/plain;charset=utf-8" });
    saveAs(file);
}


/* FileSaver
 * A saveAs() FileSaver implementation.
 * ?.?.?
 * 20??-??-??
 * https://github.com/eligrey/FileSaver.js
 * By Eli Grey, http://eligrey.com
 * License: MIT
 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */
var saveAs = saveAs || (function(view) {
    "use strict";
    // IE <10 is explicitly unsupported
    if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
        return;
    }
    var
          doc = view.document
          // only get URL when necessary in case Blob.js hasn't overridden it yet
        , get_URL = function() {
            return view.URL || view.webkitURL || view;
        }
        , save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
        , can_use_save_link = "download" in save_link
        , click = function(node) {
            var event = new MouseEvent("click");
            node.dispatchEvent(event);
        }
        , is_safari = /constructor/i.test(view.HTMLElement) || view.safari
        , is_chrome_ios =/CriOS\/[\d]+/.test(navigator.userAgent)
        , throw_outside = function(ex) {
            (view.setImmediate || view.setTimeout)(function() {
                throw ex;
            }, 0);
        }
        , force_saveable_type = "application/octet-stream"
        // the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
        , arbitrary_revoke_timeout = 1000 * 40 // in ms
        , revoke = function(file) {
            var revoker = function() {
                if (typeof file === "string") { // file is an object URL
                    get_URL().revokeObjectURL(file);
                } else { // file is a File
                    file.remove();
                }
            };
            setTimeout(revoker, arbitrary_revoke_timeout);
        }
        , dispatch = function(filesaver, event_types, event) {
            event_types = [].concat(event_types);
            var i = event_types.length;
            while (i--) {
                var listener = filesaver["on" + event_types[i]];
                if (typeof listener === "function") {
                    try {
                        listener.call(filesaver, event || filesaver);
                    } catch (ex) {
                        throw_outside(ex);
                    }
                }
            }
        }
        , auto_bom = function(blob) {
            // prepend BOM for UTF-8 XML and text/* types (including HTML)
            // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
            if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
                return new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
            }
            return blob;
        }
        , FileSaver = function(blob, name, no_auto_bom) {
            if (!no_auto_bom) {
                blob = auto_bom(blob);
            }
            // First try a.download, then web filesystem, then object URLs
            var
                  filesaver = this
                , type = blob.type
                , force = type === force_saveable_type
                , object_url
                , dispatch_all = function() {
                    dispatch(filesaver, "writestart progress write writeend".split(" "));
                }
                // on any filesys errors revert to saving with object URLs
                , fs_error = function() {
                    if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
                        // Safari doesn't allow downloading of blob urls
                        var reader = new FileReader();
                        reader.onloadend = function() {
                            var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
                            var popup = view.open(url, '_blank');
                            if(!popup) view.location.href = url;
                            url=undefined; // release reference before dispatching
                            filesaver.readyState = filesaver.DONE;
                            dispatch_all();
                        };
                        reader.readAsDataURL(blob);
                        filesaver.readyState = filesaver.INIT;
                        return;
                    }
                    // don't create more object URLs than needed
                    if (!object_url) {
                        object_url = get_URL().createObjectURL(blob);
                    }
                    if (force) {
                        view.location.href = object_url;
                    } else {
                        var opened = view.open(object_url, "_blank");
                        if (!opened) {
                            // Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
                            view.location.href = object_url;
                        }
                    }
                    filesaver.readyState = filesaver.DONE;
                    dispatch_all();
                    revoke(object_url);
                }
            ;
            filesaver.readyState = filesaver.INIT;

            if (can_use_save_link) {
                object_url = get_URL().createObjectURL(blob);
                setTimeout(function() {
                    save_link.href = object_url;
                    save_link.download = name;
                    click(save_link);
                    dispatch_all();
                    revoke(object_url);
                    filesaver.readyState = filesaver.DONE;
                });
                return;
            }

            fs_error();
        }
        , FS_proto = FileSaver.prototype
        , saveAs = function(blob, name, no_auto_bom) {
            return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
        }
    ;
    // IE 10+ (native saveAs)
    if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
        return function(blob, name, no_auto_bom) {
            name = name || blob.name || "download";

            if (!no_auto_bom) {
                blob = auto_bom(blob);
            }
            return navigator.msSaveOrOpenBlob(blob, name);
        };
    }

    FS_proto.abort = function(){};
    FS_proto.readyState = FS_proto.INIT = 0;
    FS_proto.WRITING = 1;
    FS_proto.DONE = 2;

    FS_proto.error =
    FS_proto.onwritestart =
    FS_proto.onprogress =
    FS_proto.onwrite =
    FS_proto.onabort =
    FS_proto.onerror =
    FS_proto.onwriteend =
        null;

    return saveAs;
}(
       typeof self !== "undefined" && self
    || typeof window !== "undefined" && window
    || this.content
));
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window

if (typeof module !== "undefined" && module.exports) {
  module.exports.saveAs = saveAs;
} else if ((typeof define !== "undefined" && define !== null) && (define.amd !== null)) {
  define("FileSaver.js", function() {
    return saveAs;
  });
}