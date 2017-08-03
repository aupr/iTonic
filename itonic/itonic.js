(function (global, require, factory, helper) {

    "use strict";

    if (helper().compareVersion(require.fn.jquery,"3.0.0")>-1) {
        factory(global, require);
    } else {
        console.error("Minimum version of jQuery 3.0.0 is required");
    }

})(window, jQuery, function (window, $) {

    "use strict";

    var
        itonic = {
            version: "1.0.0"
        };


    /* pixel verification method*/
    itonic.isPixel = function (pixel) {
        if (!pixel) {
            return false;
        }
        if (pixel === "") {
            return false;
        }
        if (pixel === "inherit") {
            return false;
        }
        if (pixel === "auto") {
            return false;
        }
        var e = document.createElement("p");
        e.style.width = '10px';
        e.style.width = pixel;
        if (e.style.width !== '10px') {
            return true;
        }
        e.style.width = '20px';
        e.style.width = pixel;
        return e.style.width !== '20px';
    };

    /* Color verification method*/
    itonic.isColor = function (color) {
        if (!color) {
            return false;
        }
        if (color === "") {
            return false;
        }
        if (color === "inherit") {
            return false;
        }
        if (color === "transparent") {
            return false;
        }
        var e = document.createElement("p");
        e.style.color = "rgb(0, 0, 0)";
        e.style.color = color;
        if (e.style.color !== "rgb(0, 0, 0)") {
            return true;
        }
        e.style.color = "rgb(255, 255, 255)";
        e.style.color = color;
        return e.style.color !== "rgb(255, 255, 255)";
    };

    /* Text special character to entity conversion*/
    itonic.CCToEntity = function(text) {
        text.trim();
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    };

    /*
     URI query parser
     @urlWithQuery: Don't need give any url as input for current location.
     @isArray: it should be true if there is any array in the uri query otherwise skip it or put false
     */
    itonic.getURIQuery = function (considerArray, url) {
        if(typeof url !== 'string') url = window.location.href;
        var queryStart = url.indexOf("?") + 1;
        var queryEnd = url.indexOf("#") + 1 || url.length + 1;
        var query = url.slice(queryStart, queryEnd - 1);

        if (query + '#' === url || query === url || query === "") return;

        var pairs = query.replace(/\+/g, " ").split("&");
        var params = {};

        pairs.forEach(function(val){
            var indval = val.split("=", 2);
            var indname = decodeURIComponent(indval[0]);
            var value = decodeURIComponent(indval[1]);

            if(considerArray){
                if (!params.hasOwnProperty(indname)) params[indname] = [];
                params[indname].push(value);
            }else{
                params[indname] = value;
            }
        });
        return params;
    };


    //Appending hte existing html document as per library requirement
    $(function () {
        $("body").append('<div id="itonicModal"><div id="iM_-loadspinner"></div><div id="iM_-msg"></div>' +
            '<div id="iM_-content"><div id="iM_-header"><span id="iM_-close">&#10006;</span><h3></h3></div>' +
            '<div id="iM_-body"></div><div id="iM_-footer">' +
            '<button></button><button></button><button></button><button></button><button></button>' +
            '<button></button><button></button><button></button><button></button><button></button>' +
            '</div></div></div>');
    });


    var
        modal = {},
        modalElements = {
            modal: function () {
                return $("#itonicModal");
            },
            loadSpinner: function () {
                return $("#iM_-loadspinner");
            },
            loadMsg: function () {
                return $("#iM_-msg");
            },
            content: function () {
                return $("#iM_-content");
            },
            header: function () {
                return $("#iM_-header");
            },
            closeSpan: function () {
                return $("#iM_-close");
            },
            headerH3: function () {
                return $("#iM_-header h3");
            },
            body: function () {
                return $("#iM_-body");
            },
            footer: function () {
                return $("#iM_-footer");
            },
            footerButton: function () {
                return $("#iM_-footer button");
            },
            footerButtonChild: function (nthChild) {
                return $("#iM_-footer button:nth-child("+nthChild+")");
            }
        };

    modal.execute = function (propertyObject) {

        //headerText:           =>Header text
        //headerTextColor:      =>Header Text Color
        //headerColor:          =>Header Color only
        //footerColor:          =>Footer Color only
        //color:                =>Header Footer Combinedly set same Color
        //crossButtonColor:     =>Cancel button color
        //bodyHtml:             =>Body html content
        //bodyColor:            =>Modal background color
        //width:                =>modal size in pixel. ie: "400px"
        //createButton:         =>Write button names you want with comma saparated.
        //buttonColor:          =>Button background color
        //buttonTextColor:      =>Button text color
        //backLayerColor:       =>Modal back layer color
        //draggable:            =>boolean value true or false
        //aeris                 =>boolean value ture or false --(deprecated)
        //action:               =>Make a function with a variable. variable will return the value of button text at onClick button. Calcel button will return boolean false.


        if(typeof propertyObject !== "object") propertyObject = {};

        var
            defaultObj = {
                headerText: "Dialog Form.",
                headerTextColor: "#FFFFFF",
                headerColor: "#919191",
                footerColor: "#919191",
                color: undefined,
                crossButtonColor: "#FFFFFF",
                bodyHtml: "",
                bodyColor: "#FFFFFF",
                width: "400px",
                createButton: undefined,
                buttonColor: "#FFFFFF",
                buttonTextColor: "#444444",
                backLayerColor: "rgba(0,0,0,0.4)",
                draggable: true,
                action: undefined
            },
            obj = {
                headerText: typeof propertyObject.headerText === "string"?propertyObject.headerText:defaultObj.headerText,
                headerTextColor: itonic.isColor(propertyObject.headerTextColor)?propertyObject.headerTextColor:defaultObj.headerTextColor,
                headerColor: itonic.isColor(propertyObject.headerColor)?propertyObject.headerColor:defaultObj.headerColor,
                footerColor: itonic.isColor(propertyObject.footerColor)?propertyObject.footerColor:defaultObj.footerColor,
                color: itonic.isColor(propertyObject.color)?propertyObject.color:defaultObj.color,
                crossButtonColor: itonic.isColor(propertyObject.crossButtonColor)?propertyObject.crossButtonColor:defaultObj.crossButtonColor,
                bodyHtml: typeof propertyObject.bodyHtml === "string"?propertyObject.bodyHtml:defaultObj.bodyHtml,
                bodyColor: itonic.isColor(propertyObject.bodyColor)?propertyObject.bodyColor:defaultObj.bodyColor,
                width: itonic.isPixel(propertyObject.width)?propertyObject.width:defaultObj.width,
                createButton: typeof propertyObject.createButton === "string"?propertyObject.createButton:defaultObj.createButton,
                buttonColor: itonic.isColor(propertyObject.buttonColor)?propertyObject.buttonColor:defaultObj.buttonColor,
                buttonTextColor: itonic.isColor(propertyObject.buttonTextColor)?propertyObject.buttonTextColor:defaultObj.buttonTextColor,
                backLayerColor: itonic.isColor(propertyObject.backLayerColor)?propertyObject.backLayerColor:defaultObj.backLayerColor,
                draggable: typeof propertyObject.draggable === "boolean"?propertyObject.draggable:defaultObj.draggable,
                action: typeof propertyObject.action === "function"?propertyObject.action:defaultObj.action
            },
            invokeAction = function (reply) {
                if(obj.action) obj.action(reply);
                else console.error("Action method has not been defined!");
            };

        // Controlling buttons
        if(typeof obj.createButton === "string"){
            var btnAll = obj.createButton.split(",").reverse();
            btnAll.forEach(function(b,i){
                if(modalElements.footerButtonChild(i+1).length){
                    modalElements.footerButtonChild(i+1).text(b.trim()).css({
                        "display":"block"
                    });
                }
            });
        }

        modalElements.headerH3().html(obj.headerText);
        modalElements.body().html(obj.bodyHtml);
        modalElements.content().css({"width": obj.width});
        modalElements.modal().css({"background-color": obj.backLayerColor});
        modalElements.content().css({"background-color": obj.bodyColor});
        if (itonic.isColor(obj.color)){
            modalElements.header().css({"background-color": obj.color});
            modalElements.footer().css({"background-color": obj.color});
        } else {
            modalElements.header().css({"background-color": obj.headerColor});
            modalElements.footer().css({"background-color": obj.footerColor});
        }
        modalElements.headerH3().css({"color": obj.headerTextColor});
        modalElements.closeSpan().css({"color": obj.crossButtonColor});
        modalElements.footerButton().css({"background-color": obj.buttonColor, "color": obj.buttonTextColor});

        // Making draggable the modal section
        if (obj.draggable === true){
            if(typeof $.fn.draggable === "function") modalElements.content().draggable({cancel : "#iM_-body"});
            else console.warn("Missing jQuery-ui draggable function!");
        }

        modalElements.modal().css({"display": "block"});
        modalElements.content().css({"display": "block"});
        modalElements.loadSpinner().css({"display": "none"});
        modalElements.loadMsg().css({"display": "none"});

        modalElements.closeSpan().unbind("click");
        modalElements.closeSpan().click(function () {
            invokeAction(false);
        });

        modalElements.footerButton().unbind("click");
        modalElements.footerButton().click(function () {
            invokeAction($(this).text());
        });

        return true;
    };
    
    modal.onDuty = function (propertyObject) {
        //message           =>Loading window message text in html format
        //messageColor      =>
        //graphics          =>Loading window animation graphics link
        //backLayerColor:   =>Modal back layer color

        if(typeof propertyObject !== "object") propertyObject = {};

        var
            defaultObj = {
                message: "Execution is in progress....<br/>Please Wait !",
                messageColor: "#FFFFFF",
                graphics: undefined,
                backLayerColor: "rgba(0,0,0,0.4)"
            },
            obj = {
                message: typeof propertyObject.message === "string"?propertyObject.message:defaultObj.message,
                messageColor: itonic.isColor(propertyObject.messageColor)?propertyObject.messageColor:defaultObj.messageColor,
                graphics: typeof propertyObject.graphics === "string"?propertyObject.graphics:defaultObj.graphics,
                backLayerColor: itonic.isColor(propertyObject.backLayerColor)?propertyObject.backLayerColor:defaultObj.backLayerColor
            };

        modalElements.modal().css({"background-color": obj.backLayerColor});
        modalElements.loadMsg().css({"color": obj.messageColor});

        modalElements.loadMsg().html(obj.message);

        if ((typeof obj.graphics) === 'string') {
            modalElements.loadSpinner().css({
                "border": "none",
                "border-radius": "0",
                "animation": "none",
                "background-image": "url(" + obj.graphics + ")"
            });
        } else {
            modalElements.loadSpinner().css({
                "border": "5px solid white",
                "border-top-color": "#ff7000",
                "border-radius": "100%",
                "background-image": "none",
                "animation": "iM_Round 2s linear infinite"
            });
        }

        modalElements.modal().css({"display": "block"});
        modalElements.content().css({"display": "none"});
        modalElements.loadSpinner().css({"display": "block"});
        modalElements.loadMsg().css({"display": "block"});

    };

    modal.close = function () {
        modalElements.headerH3().html("");
        modalElements.body().html("");

        modalElements.footerButton().css({"display":"none"});
        modalElements.modal().css({"display": "none"});
        modalElements.content().css({"display": "none"});
        modalElements.loadSpinner().css({"display": "none"});
        modalElements.loadMsg().css({"display": "none"});
        return false;
    };

    var
        upload = {};

    upload.execute = function (propertyObject) {
        //targetUrl:                  => target upload url
        //inputFileId:                 => file input field id (only id is accepable no class or element)
        //inputName:                 => the pass name.. ie: $_FILE['name']
        //fileExtensions:               => define acceptable file formats in a string with comma saparation.
        //fileSizeMax:                 => give maximum file size in bytes.
        //filesMax:
        //progress:             => progress function return (0 to 100 parcent value, file size loaded, total file size, remaining file size)
        //success:              => status function return (status number, status comment/description)
        //fail:                 => response function return the oupu from target upload url as text format.

        if (typeof propertyObject !== "object") propertyObject = {};

        var
            defaultObj = {
                targetUrl: undefined,
                inputFileId: undefined,
                inputName: "file",
                format: undefined,
                size: 100000000,
                filesMax: 20,
                progress: undefined,
                success: undefined,
                fail: undefined
            },
            obj = {
                targetUrl: typeof propertyObject.targetUrl === "string"?propertyObject.targetUrl:defaultObj.targetUrl,
                inputFileId: typeof propertyObject.inputFileId === "string"?propertyObject.inputFileId:defaultObj.inputFileId,
                inputName: typeof propertyObject.inputName === "string"?propertyObject.inputName:defaultObj.inputName,
                format: typeof propertyObject.format === "string"?propertyObject.format:defaultObj.format,
                size: typeof propertyObject.size === "number"?propertyObject.size:defaultObj.size,
                filesMax: typeof propertyObject.filesMax === "number"?propertyObject.filesMax:defaultObj.filesMax,
                progress: typeof propertyObject.progress === "function"?propertyObject.progress:defaultObj.progress,
                success: typeof propertyObject.success === "function"?propertyObject.success:defaultObj.success,
                fail: typeof propertyObject.fail === "function"?propertyObject.fail:defaultObj.fail
            },
            invokeProgress = function (progress, event) {
                if (obj.progress) obj.progress(progress, event);
                //else console.error("Upload Progress function is not defined");
            },
            invokeSuccess = function (responseText, event) {
                if (obj.success) obj.success(responseText, event);
                //else console.error("Upload fail function is not defined!");
            },
            invokeFail = function (errorCode, comment, event) {
                if (obj.fail) obj.fail(errorCode, comment, event);
                //else console.error("Upload fail function is not defined!");
            };

        if (obj.targetUrl && obj.inputFileId) {
            //var crt = "Error: fail function is not defined!";
            //var ffc = typeof obj.fail === "function";
            //var filesize = 10000000000; //default file size
            //if (typeof obj.size === "number") filesize = obj.size;
            //var fpname = "file"; // default file pass name
            //if (typeof obj.name === "string") fpname = ;
            //alert(file.name+" | "+file.size+" | "+file.type);

            var allFiles = document.getElementById(obj.inputFileId);
            var numberOfFiles = allFiles.files.length;

            if (numberOfFiles === 0) {
                invokeFail(3, "Empty field!", {});
            } else if (numberOfFiles > obj.filesMax) {
                invokeFail(6, "Files limit exceeded!", {});
            } else {

                for (var i=0; i<numberOfFiles; i++) {

                    if (allFiles.files[i].size > obj.size) {
                        invokeFail(5, "Maximum file size exceeded!", {});
                        break;
                    }else if (typeof obj.format === "string" && obj.format !== "") {
                        var validExtension = false;
                        var fileExtensions = obj.format.split(",");
                        fileExtensions.forEach(function (extension) {
                            if (extension.toLowerCase().trim() === allFiles.files[i].inputName.split('.').pop().toLowerCase()) {
                                validExtension = true;
                            }
                        });
                        if (!validExtension) {
                            invokeFail(4, "Invalid file format!", {});
                            break;
                        }
                    }
                }


            }

            ///////////////////////

            var file = allFiles.files[0];
            //var fileExt = $('#' + obj.file).val().split('.').pop().toLowerCase();

            if ($('#' + obj.inputFileId).val().length === 0) {
                //invokeFail(3, "Empty field!", {});
            } else if (file.size > obj.size) {
                //invokeFail(5, "Maximum file size exceeded!");
            } else {
                /*var acceptableFileFormat = false;
                if (typeof obj.format === "string") {
                    var fileFormats = obj.format.split(",");
                    fileFormats.forEach(function (r) {
                        if (r.toLowerCase().trim() === fileExt) acceptableFileFormat = true;
                    });
                } else if (typeof obj.format === "undefined") {
                    acceptableFileFormat = true;
                }*/
                if (acceptableFileFormat) {
                    var formdata = new FormData();
                    formdata.append(obj.inputName, file);
                    var ajax = new XMLHttpRequest();
                    ajax.upload.addEventListener("progress", function (event) {
                        if (event.total > 145) {
                            var progress = {
                                single: Math.round((event.loaded / event.total) * 100),
                                multi: 4,
                                fileTotal: 0,
                                fileFlying: 4,
                                fileLoaded: 3,
                                fileRemaining: 0,
                                loaded: event.loaded,
                                total: event.total,
                                remaining: (event.total - event.loaded)
                            };
                            invokeProgress(progress, event);
                        }
                    }, false);
                    ajax.addEventListener("load", function (event) {
                        invokeSuccess(event.target.responseText, event);
                    }, false);
                    ajax.addEventListener("error", function (event) {
                        invokeFail(1, "File error!", event);
                    }, false);
                    ajax.addEventListener("abort", function (event) {
                        invokeFail(2, "File aborted!", event);
                    }, false);
                    ajax.open("POST", obj.targetUrl);
                    ajax.send(formdata);
                } else {
                    //invokeFail(4, "Invalid file format!", {});
                }
            }
        } else {
            console.log("Error: url or file parameter is missing in itonic upload section!");
        }
    };

    itonic.fullScrToggle = function (element) {
        if(!element) element = window.document.body;
        if ((document.fullScreenElement !== undefined && document.fullScreenElement === null) || (document.msFullscreenElement !== undefined && document.msFullscreenElement === null) || (document.mozFullScreen !== undefined && !document.mozFullScreen) || (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen)) {
            if (element.requestFullScreen) {
                element.requestFullScreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullScreen) {
                element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
            return true;
        } else {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            return false;
        }
    };

    itonic.upload = upload;
    itonic.modal = itonic.dialog = modal;
    window.iTonic = window.itonic = window.it = itonic;

    return itonic;

}, function () {
    var helperFunctions = {};

    /**
     * Checks if versionA is bigger, lower or equal versionB
     * It checks only pattern like 1.8.2 or 1.11.0
     * Major version, Minor version, patch release
     * @param strVersionA a version to compare
     * @param strVersionB the other version to compare
     * @returns {*} 1 if versionA is bigger than versionB, -1 if versionA is lower than versionB and 0 if both versions are equal
     * false if nothing worked
     */
    helperFunctions.compareVersion = function (strVersionA, strVersionB) {
        var arrVersionA = strVersionA.split('.');
        var arrVersionB = strVersionB.split('.');
        var intVersionA = (100000000 * parseInt(arrVersionA[0])) + (1000000 * parseInt(arrVersionA[1])) + (10000 * parseInt(arrVersionA[2]));
        var intVersionB = (100000000 * parseInt(arrVersionB[0])) + (1000000 * parseInt(arrVersionB[1])) + (10000 * parseInt(arrVersionB[2]));

        if (intVersionA > intVersionB) {
            return 1;
        }else if(intVersionA < intVersionB){
            return -1;
        }else{
            return 0;
        }
    };

    return helperFunctions;
});