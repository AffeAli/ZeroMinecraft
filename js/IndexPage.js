class IndexPage extends ZeroFrame {

    fillList() {
        this.cmd("dbQuery", ["SELECT * FROM topic LEFT JOIN json USING(json_id) ORDER BY added DESC"], (topics) => {
            /*var html = "<ul class=\"project-list\">"
            for(var i = 0; i < topics.length; i++) {
                html += "<li class=\"project-list-item\"><a class=\"project-link\" href=\"mod_entry.html?mod_address=" + topics[i].topic_id + topics[i].directory.replace("users/", "_") + "\">" + topics[i].name + "</a>" + "<img class=\"list-category-item\" src=\"icons/cat_" + topics[i].category + ".png\">"
                html += "</li>"
            }
            html += "</ul>"
            document.getElementById("new_mod_list").innerHTML = html*/
            var list = document.createElement("ul")
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
            document.getElementById("new_mod_list").append(list)
        })
    }

    newMod() {
        if(!this.site_info.cert_user_id) {
            this.cmd("wrapperNotification", ["info", "Please, select your account."])
            return false
        }
        var data_path = "data/users/" + this.site_info.auth_address + "/data.json"
        this.cmd("fileGet", { "inner_path": data_path, "required": false }, (file) => {
            if(file) {
                //TODO fix link  window.location.href = "mod_entry.html?mod_address=99_" + this.site_info.auth_address
                //TODO Check if valid
            }
            else {
                if(confirm("To create a new mod, you need to create a modder profile first\nDo you want to create one?") == true)
                    window.location.href = "modder_profile.html?auth_address=" + this.site_info.auth_address
                else
                    alert("mod creation cancelled!")
            }
        })
        
        return false
    }
    
    ownPage() {
        window.location.href = "modder_profile.html?auth_address=" + this.site_info.auth_address
        return false
    }
    
    selectUser() {
        this.cmd("certSelect", {accepted_domains: ["zeroid.bit"]})
        return false
    }

	onOpenWebsocket() {
		this.cmd("siteInfo", {}, (site_info) => {
            if(site_info.cert_user_id)
                document.getElementById("select_user").innerHTML = site_info.cert_user_id
            this.site_info = site_info
        })
        this.fillList()
	}

	onRequest(cmd, message) {
		if (cmd == "setSiteInfo") {
            if(message.params.cert_user_id)
                document.getElementById("select_user").innerHTML = message.params.cert_user_id
            else
                document.getElementById("select_user").innerHTML = "Select User"
			this.site_info = message.params
        }
		else
			this.log("Unknown incoming message:", cmd)
	}
} 
