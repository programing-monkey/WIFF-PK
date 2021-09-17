/**
 * @name WIFF-PK
 * @invite undefined
 * @authorLink undefined
 * @donate undefined
 * @patreon undefined
 * @website https://github.com/programing-monkey/WIFF-PK/
 * @source https://raw.githubusercontent.com/programing-monkey/WIFF-PK/main/WIFF-PK.plugin.js
 */
/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();

@else@*/

module.exports = (() => {
    const config = {"info":{"name":"WIFF-PK","authors":[{"name":"programing-monkey","discord_id":"362337748536786945","github_username":"programing-monkey"}],"version":"1.1.0-alpha1","description":"Shows who is fronting for PluralKit","github":"https://github.com/programing-monkey/WIFF-PK/","github_raw":"https://raw.githubusercontent.com/programing-monkey/WIFF-PK/main/WIFF-PK.plugin.js"},"changelog":[{"title":"New Stuff","items":["Added changelog"]},{"title":"Improvements","type":"improved","items":["plural kit id is no longer used","the format for the json file has changed"]}],"main":"index.js","defaultConfig":[]};

    return !global.ZeresPluginLibrary ? class {
        constructor() {this._config = config;}
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Library) => {
    const {Logger, Patcher, DiscordAPI, Settings} = Library;
    var xmlHttp = new XMLHttpRequest();
    window.WIFF_PK = {};
    function JSON_request(url){
        xmlHttp.open( "GET", url, false);
        try{
            xmlHttp.send(null);
            return JSON.parse(xmlHttp.response);
        }catch(e){
            return null;
        }
    }


    return class WIFF_PK extends Plugin {
        onStart() {
            Logger.log("Started");
            window.WIFF_PK.pluralSystemsData = window.BdApi.loadData("WIFF-PK", "plural_system_discord_and_plural_account_ids");
            window.WIFF_PK.pluralSystemsFronters = {};
            window.setInterval(function(){
                let keys = Object.keys(window.WIFF_PK.pluralSystemsData);
                for (var i = keys.length - 1; i >= 0; i--) {
                    window.WIFF_PK.pluralSystemsFronters[keys[i]] = JSON_request("https://api.pluralkit.me/v1/s/" + window.WIFF_PK.pluralSystemsData[keys[i]].id + "/fronters");
                }
            },  10 * 1000);
            window.setInterval(function(){
                if (DiscordAPI.currentGuild != null && window.WIFF_PK.pluralSystemsData != undefined){
                    for (var i = DiscordAPI.currentGuild.members.length -1; i >= 0; i--){
                        if(DiscordAPI.currentGuild.members[i].user.isBot){
                            continue;
                        }
                        let currentID = DiscordAPI.currentGuild.members[i].userId;
                        if(Object.keys(window.WIFF_PK.pluralSystemsData).includes(currentID)){
                            let user_in_member_list_panel = document.querySelector('[class="WIFF_PK_'+currentID+'_MEMBERLIST"]');
                            if (user_in_member_list_panel == null){
                                try{
                                    user_in_member_list_panel = document.querySelector('[data-list-id*="members"]').querySelector('[data-user-id="'+currentID+'"]').children[0];
                                }catch(e){}
                                if (user_in_member_list_panel != null){
                                    user_in_member_list_panel.classList.add('WIFF_PK_'+currentID+'_MEMBERLIST');
                                }
                                }


                            let user_in_channel_list_panel = document.querySelector('[class="WIFF_PK_'+currentID+'_VOICECHAT"]');
                            if (user_in_channel_list_panel == null){
                                try{
                                    document.querySelector('[id="channels"]').querySelectorAll('[class*="voiceUser"]').forEach(function(vcuser){
                                        let user_to_try = vcuser.querySelector('[style*="'+currentID+'"]');
                                        if (user_to_try != null){
                                            user_in_channel_list_panel = user_to_try.parentElement;
                                        }
                                    });
                                }catch(e){}
                                if (user_in_channel_list_panel != null){
                                    user_in_channel_list_panel.classList.add("WIFF_PK_"+currentID+"_VOICECHAT");
                                }
                                }


                            let user_popout_imag = document.querySelector('[class="WIFF_PK_'+currentID+'_USER_POPOUT_AVATAR"]');
                            if (user_popout_imag == null){
                                try{
                                    user_popout_imag = document.querySelector('div[id*="popout_"] div[data-user-id*="'+currentID+'"] div[class*="avatarWrapperNormal"] img[class*="avatar"]');
                                }catch(e){}
                                if (user_popout_imag != null){
                                    user_popout_imag.classList.add("WIFF_PK_"+currentID+"_USER_POPOUT_AVATAR");
                                }
                                }


                            let user_popout_name = document.querySelector('[class="WIFF_PK_'+currentID+'_USER_POPOUT_NAME"]');
                            if (user_popout_name == null){
                                try{
                                    user_popout_name = document.querySelector('div[id*="popout_"] div[data-user-id*="'+currentID+'"] div[class*="headerText"] h3[class*="nickname"]');
                                }catch(e){}
                                if (user_popout_name != null){
                                    user_popout_name.classList.add("WIFF_PK_"+currentID+"_USER_POPOUT_NAME");
                                }
                                }

                            let fronters = window.WIFF_PK.pluralSystemsFronters[currentID].members;
                            let pfp_url = window.WIFF_PK.pluralSystemsData.avatar_url;
                            if (fronters.length == 1){
                                if(fronters[0].avatar_url != null){
                                    pfp_url = fronters[0].avatar_url;
                                }
                            }

                            let name = fronters.map(fronter => fronter.name).join(" / ");


                            if (user_in_member_list_panel != null){
                                user_in_member_list_panel.children[0].querySelector('img[class*="avatar-"]').setAttribute('src', pfp_url);
                                user_in_member_list_panel.children[1].querySelector('[class*="roleColor-"]').innerHTML = name;
                                }
                            if (user_in_channel_list_panel != null){
                                user_in_channel_list_panel.querySelector('[class*="avatarContainer"]').setAttribute('style', 'background-image: url("'+pfp_url+'");');
                                user_in_channel_list_panel.querySelector('[class*="usernameFont"]').innerHTML = name;
                                }
                            if (user_popout_imag != null){
                                user_popout_imag.setAttribute('src', pfp_url);
                                }
                            if (user_popout_name != null){
                                user_popout_name.innerHTML = name;
                                }

                            }

                        }
                    }
            },  1 * 1000);

        }

        onStop() {
            Logger.log("Stopped");
            Patcher.unpatchAll();
        }

        getSettingsPanel() {
            const panel = this.buildSettingsPanel();
            panel.append(this.buildSetting(
            {
                type: "file",
                id: "jsondat",
                name: "json data",
                note: "Description of the textbox setting",
                onChange: function(value) {
                    value.text().then(function(pluralSystemsDatastr){
                        let id_list = JSON.parse(pluralSystemsDatastr);
                        let pluralSystemsData = {};
                        for (var i = id_list.length - 1; i >= 0; i--) {
                            pluralSystemsData[id_list[i]] = JSON_request("https://api.pluralkit.me/v1/a/"+id_list[i]);
                        }
                        window.WIFF_PK.pluralSystemsData = pluralSystemsData;
                        window.BdApi.saveData("WIFF-PK", "plural_system_discord_and_plural_account_ids", pluralSystemsData);
                    });
                }
            }));
            return panel.getElement();
        }
    }

};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
