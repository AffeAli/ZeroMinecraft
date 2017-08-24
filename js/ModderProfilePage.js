class ModderProfilePage extends ZeroFrame {

    fillList() {
        var query = "SELECT * FROM topic LEFT JOIN json USING(json_id) WHERE directory=\"users/" + this.site_info.auth_address + "\" ORDER BY added DESC"
        this.cmd("dbQuery", [query], (topics) => {
            /*var html = "<ul class=\"project-list\">"
            for(var i = 0; i < topics.length; i++) {
                html += "<li class=\"project-list-item\"><a class=\"project-link\" href=\"mod_entry.html?mod_address=" + topics[i].topic_id + topics[i].directory.replace("users/", "_") + "\">" + topics[i].name + "</a></li>"
            }
            document.getElementById("mod_list").innerHTML = html*/
            if(document.getElementById("main_list"))
                document.getElementById("mod_list").removeChild(document.getElementById("main_list"))
            
            var list = document.createElement("ul")
            list.id = "main_list"
            list.className = "project-list"
            for(var i = 0; i < topics.length; i++) {
                var item = document.createElement("li")
                item.className = "project-list-item"
                    var div_avatar = document.createElement("div")
                    div_avatar.className = "avatar"
                        var icon_link = document.createElement("a")
                        icon_link.href = "mod_entry.html?mod_address=" + topics[i].topic_id + topics[i].directory.replace("users/", "_")
                            var icon = document.createElement("img")
                            icon.src = "data/" + topics[i].directory + "/topicicon_" + topics[i].topic_id + ".jpg"
                            icon_link.append(icon)
                        div_avatar.append(icon_link)
                    item.append(div_avatar)
                    
                    var div_details = document.createElement("div")
                    div_details.className = "details"
                        var mod_link = document.createElement("a")
                        mod_link.href = "mod_entry.html?mod_address=" + topics[i].topic_id + topics[i].directory.replace("users/", "_")
                        mod_link.className = "project-link"
                        mod_link.innerHTML = topics[i].name
                        div_details.append(mod_link)
                        
                        var category_icon = document.createElement("img")
                        category_icon.className = "list-category-icon"
                        category_icon.src = "icons/cat_" + topics[i].category + ".png"
                        div_details.append(category_icon)
                    item.append(div_details)
                list.append(item)
            }
            document.getElementById("mod_list").append(list)
        })
    }

    selectUser() {
        this.cmd("certSelect", {accepted_domains: ["zeroid.bit"]})
        return false
    }
    
    editProfile() {
        document.getElementById("content_div").style = "display: none;"
        document.getElementById("create_div").style = ""
    }
    
    submitAccount() {
        var data_inner_path = "data/users/" + this.site_info.auth_address + "/data.json"
        var content_inner_path = "data/users/" + this.site_info.auth_address + "/content.json"
        this.cmd("fileGet", {"inner_path": data_inner_path, "required": false}, (data) => {
            if(data)
                data = JSON.parse(data)
            else
                data = { "username": "","topic": [], "deps": [], "files": [] }
            
            var name_unprocessed = document.getElementById("input_name").value
            if(!(/^[a-z0-9]+$/i.test(name_unprocessed))) {
                this.cmd("wrapperNotification", [ "error", "Invalid username" ])
                return false;
            }
            
            data.username = name_unprocessed
            data.description = document.getElementById("input_desc").value
            data.date_updated = Date.now()
            
            
            var json_raw = unescape(encodeURIComponent(JSON.stringify(data, undefined, '\t')))
            this.cmd("fileWrite", [data_inner_path, btoa(json_raw)], (res) => {
                if(res == "ok") {
                    document.getElementById("content_div").style = ""
                    document.getElementById("create_div").style = "display: none;"
                    this.load()
                    this.cmd("siteSign", {"inner_path": content_inner_path}, (res) => {
                        this.cmd("sitePublish", {"inner_path": content_inner_path, "sign": false})
                    })
                }
            })
        })
    }
    
    avatarSubmit() {
        //this.checkOptionalRegex()
        var file = document.getElementById("avatar_input").files[0]
        var fileReader = new FileReader()
        var that = this
        fileReader.onload = function(evt) {
            var fileData = evt.target.result;
            var bytes = new Uint8Array(fileData);
            var binaryText = '';

            for (var index = 0; index < bytes.byteLength; index++) {
                binaryText += String.fromCharCode( bytes[index] );
            }
            
            var path = "data/users/" + that.site_info.auth_address + "/avatar.jpg"
            that.cmd("fileWrite", [path, btoa(binaryText)], (res) => {
                that.cmd("wrapperNotification", ["done", "Saved file"])
            })
        }
        fileReader.readAsArrayBuffer(file)
    }

	load() {
        var url = new URL(window.location.href)
        var auth_address = url.searchParams.get("auth_address")
        
        var data_inner_path = "data/users/" + auth_address + "/data.json"
        this.cmd("fileGet", {"inner_path": data_inner_path, "required": false}, (data) => {
            var content_div = document.getElementById("content_div")
            if(data) {
                var results = JSON.parse(data)
                this.cmd("dbQuery", ["SELECT cert_user_id FROM json WHERE directory=\"users/" + auth_address + "\""], (results) => {
                    document.getElementById("div_name").innerHTML = results[0].cert_user_id
                })
                if(!(/^.+$/.test(results.description)))
                    results.description = "No description available"
                document.getElementById("content_desc").innerHTML = results.description
                document.getElementById("input_desc").innerHTML = results.description
                
                document.getElementById("modder_icon_display").src = "data/users/" + auth_address + "/avatar.jpg"
                
                if(auth_address == this.site_info.auth_address)
                    document.getElementById("edit_button").style = ""
            }
            else {
                if(auth_address == this.site_info.auth_address) {
                    document.getElementById("content_div").style = "display: none;"
                    document.getElementById("create_div").style = ""
                }
                else {
                    content_div.innerHTML = "This account does not exist"
                }
            }
        })
        this.fillList()
    }
    
	onOpenWebsocket() {
		this.cmd("siteInfo", {}, (site_info) => {
            if(site_info.cert_user_id)
                document.getElementById("select_user").innerHTML = site_info.cert_user_id
            this.site_info = site_info
            this.load()
        })
	}

	onRequest(cmd, message) {
		if (cmd == "setSiteInfo") {
            if(message.params.cert_user_id)
                document.getElementById("select_user").innerHTML = message.params.cert_user_id
            else
                document.getElementById("select_user").innerHTML = "Select User"
			this.site_info = message.params
			this.load()
        }
		else
			this.log("Unknown incoming message:", cmd)
	}
}
