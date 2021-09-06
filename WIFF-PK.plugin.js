/**
 * @name WIFF-PK
 * @invite undefined
 * @authorLink undefined
 * @donate undefined
 * @patreon undefined
 * @website 
 * @source 
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
    const config = {"info":{"name":"WIFF-PK","authors":[{"name":"programing-monkey","discord_id":"362337748536786945","github_username":"programing-monkey"}],"version":"v1.0.1","description":"Shows who is fronting for PluralKit","github":"","github_raw":""},"main":"index.js","defaultConfig":[]};

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
    const {Logger, Patcher, DiscordAPI,  Settings} = Library;
    window.WIFF_PK = {};
    window.WIFF_PK.SYSTEMS_LIST = [];
    window.WIFF_PK.SYSTEMS_LIST_JSON = window.BdApi.loadData("WIFF-PK","pluralSystemsData");
    function JSON_request(url){
        // request object
        var xmlHttp = new XMLHttpRequest();

        // generates a request for 'url'
        xmlHttp.open( "GET", url, false);

        // sends the get request
        xmlHttp.send(null);

        // extracts then returns the JSON from the response, also returns the plaintext of the json
        return [JSON.parse(xmlHttp.response), xmlHttp.response];
    }

    // Data class for System Members made from some json
    class Member {
        constructor(jsonData) {
            this.PluralKitMemberID = jsonData.id;
            this.name = jsonData.name;
            this.color = jsonData.color;
            this.displayName = jsonData.display_name;
            this.birthday = jsonData.birthday;
            this.pronouns = jsonData.pronouns;
            this.avatar_url = jsonData.avatar_url;
            this.description = jsonData.description;
        }
    }

    // class for Systems
    class System {
        constructor(jsonData) {
            // set some important data
            this.discordID = jsonData.discordID;
            this.pluralKitID = jsonData.pluralKitID;
            this.hasHefaultFronter = jsonData.hasHefaultFronter;


            // get the system members through a JSON_request
            [this.membersJSON, this.membersJSONtext] = JSON_request('https://api.pluralkit.me/v1/s/' + this.pluralKitID + '/members');
            // makes a list of Member objects with the membersJSON data
            this.members = this.membersJSON.map(memberjson => new Member(memberjson));

            // get the current system fronters through a JSON_request
            [this.frontersJSON, this.frontersJSONtext] = JSON_request("https://api.pluralkit.me/v1/s/" + this.pluralKitID + "/fronters");
            // makes a list of ids of fronting members
            this.fronters = this.frontersJSON.members.map(frontersjson => frontersjson.id);
            // ['baldi', 'idada']


            this.refresh = {
                // parent of 'refresh' is the 'System'
                parent : this,
                all : function() {
                },
                // makes sure that the members are up to date
                members : function() {
                    let [new_json, new_json_text] = JSON_request('https://api.pluralkit.me/v1/s/' + this.parent.pluralKitID + '/members');
                    if(this.parent.membersJSONtext != new_json_text){
                        this.parent.membersJSONtext = new_json_text;
                        this.parent.membersJSON = new_json;
                        this.parent.members = new_json.map(memberjson => new Member(memberjson));
                        return true;
                    }
                    return false;
                },
                // makes sure that the fronters are up to date
                fronters : function() {
                    [this.parent.frontersJSON, this.parent.frontersJSONtext] = JSON_request("https://api.pluralkit.me/v1/s/" + this.parent.pluralKitID + "/fronters");
                    this.parent.fronters = this.parent.frontersJSON.members.map(frontersjson => frontersjson.id);
                },
                screen : function() {
                    let parent = this.parent;
                    let pfp_url = "https://cdn.discordapp.com/avatars/"+parent.discordID+"/"+DiscordAPI.users.find(user => user.id == parent.discordID).discordObject.avatar+".webp?size=128";

                    let frontingMembers = parent.members.filter(member => parent.fronters.find(fronter => fronter == member.PluralKitMemberID));
                    if (frontingMembers.length == 0){
                        if(jsonData.hasHefaultFronter == true){
                            return;
                        }
                    }
                    if (frontingMembers.length == 1){
                        if(frontingMembers[0].avatar_url != null){
                            pfp_url = frontingMembers[0].avatar_url;
                        }else{
                            frontingMembers[0].avatar_url = pfp_url;
                        }
                    }
                    
                    let name = frontingMembers.map(frontingMember => frontingMember.displayName).join(" / ");
                    if (DiscordAPI.currentGuild != null){
                        var found = false;
                        for (var i = DiscordAPI.currentGuild.members.length - 1; i >= 0; i--) {
                            if(DiscordAPI.currentGuild.members[i].discordObject.userId == parent.discordID){
                                found = true;
                                if(name.length == 0){
                                    name = DiscordAPI.currentGuild.members[i].discordObject.nick;
                                }
                            }
                        }
                        if(!found){
                            return;
                        }
                    }

                    try{
                        let user_in_member_list_panel = document.querySelector('[class="WIFF_PK_'+parent.discordID+'_MEMBERLIST"]');
                        if (user_in_member_list_panel == null){
                            user_in_member_list_panel = document.querySelector('[data-list-id*="members"]').querySelector('[data-user-id="'+parent.discordID+'"]').children[0];
                            user_in_member_list_panel.classList.add('WIFF_PK_'+parent.discordID+'_MEMBERLIST');
                        }
                        user_in_member_list_panel.children[0].querySelector('img[class*="avatar-"]').setAttribute('src', pfp_url);
                        user_in_member_list_panel.children[1].querySelector('[class*="roleColor-"]').innerHTML = name;
                    }catch(err){}



                    try{
                        let user_in_channel_list_panel = document.querySelector('[class="WIFF_PK_'+parent.discordID+'_VOICECHAT"]');
                        if (user_in_channel_list_panel == null){
                            document.querySelector('[id="channels"]').querySelectorAll('[class*="voiceUser"]').forEach(function(vcuser){
                                let user_to_try = vcuser.querySelector('[style*="'+parent.discordID+'"]');
                                if (user_to_try != null){
                                    user_in_channel_list_panel = user_to_try.parentElement;
                                }
                            });
                            user_in_channel_list_panel.classList.add("WIFF_PK_"+parent.discordID+"_VOICECHAT");
                        }
                        user_in_channel_list_panel.querySelector('[class*="avatarContainer"]').setAttribute('style', 'background-image: url("'+pfp_url+'");');
                        user_in_channel_list_panel.querySelector('[class*="usernameFont"]').innerHTML = name;
                    }catch(err){}

                    

                    try{
                        let user_popout_imag = document.querySelector('[class="WIFF_PK_'+parent.discordID+'_USER_POPOUT_AVATAR"]');
                        if (user_popout_imag == null){
                            user_popout_imag = document.querySelector('div[id*="popout_"] div[data-user-id*="'+parent.discordID+'"] div[class*="avatarWrapperNormal"] img[class*="avatar"]');
                            user_popout_imag.classList.add("WIFF_PK_"+parent.discordID+"_USER_POPOUT_AVATAR");
                        }
                        let user_popout_name = document.querySelector('[class="WIFF_PK_'+parent.discordID+'_USER_POPOUT_NAME"]');
                        if (user_popout_name == null){
                            user_popout_name = document.querySelector('div[id*="popout_"] div[data-user-id*="'+parent.discordID+'"] div[class*="headerText"] h3[class*="nickname"]');
                            user_popout_name.classList.add("WIFF_PK_"+parent.discordID+"_USER_POPOUT_NAME");
                        }
                        user_popout_imag.setAttribute('src', pfp_url);
                        user_popout_name.innerHTML = name;
                    }catch(err){}
                }
            }
        }
    }


    return class WIFF_PK extends Plugin {
        onStart() {
            Logger.log("Started");
            for (var i = window.WIFF_PK.SYSTEMS_LIST_JSON.length - 1; i >= 0; i--) {
                window.WIFF_PK.SYSTEMS_LIST.push(new System(window.WIFF_PK.SYSTEMS_LIST_JSON[i]));
            }

            window.setInterval(function(){
                for (var i = window.WIFF_PK.SYSTEMS_LIST.length - 1; i >= 0; i--) {
                    window.WIFF_PK.SYSTEMS_LIST[i].refresh.screen();
                }
            },  0.1 * 1000);
            
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
                        const pluralSystemsData = JSON.parse(pluralSystemsDatastr);
                        window.WIFF_PK.SYSTEMS_LIST_JSON = [];
                        window.WIFF_PK.SYSTEMS_LIST = [];
                        for (var i = pluralSystemsData.length - 1; i >= 0; i--) {
                            window.WIFF_PK.SYSTEMS_LIST_JSON.push(pluralSystemsData[i]);
                            window.WIFF_PK.SYSTEMS_LIST.push(new System(pluralSystemsData[i]));
                        }
                        window.BdApi.saveData("WIFF-PK", "pluralSystemsData", window.WIFF_PK.SYSTEMS_LIST_JSON);
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
