class IndexPage extends ZeroFrame {

    fillList() {
        this.cmd("dbQuery", ["SELECT * FROM topic LEFT JOIN json USING(json_id) ORDER BY added DESC"], (topics) => {
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
                        
                        var creator_link = document.createElement("a")
                        creator_link.className = "nolink creator"
                        creator_link.href = "modder_profile.html?auth_address=" + topics[i].directory.replace("users/", "")
                        creator_link.innerHTML = " by " + topics[i].cert_user_id
                        div_details.append(creator_link)
                        
                        var category_icon = document.createElement("img")
                        category_icon.className = "list-category-icon"
                        category_icon.style = "display: none;"
                        category_icon.src = "icons/cat_" + topics[i].category + ".png"
                        div_details.append(category_icon)
                        
                        var summary_div = document.createElement("div")
                        summary_div.style = "color: black; margin-top: 20px;"
                        summary_div.innerHTML = topics[i].summary
                        div_details.append(summary_div)
                    item.append(div_details)
                list.append(item)
            }
            $("new_mod_list").append(list)
        })
    }

	onOpenWebsocket() {
		this.cmd("siteInfo", {}, (site_info) => {
            if(site_info.cert_user_id)
                $("select_user").innerHTML = site_info.cert_user_id
            this.site_info = site_info
        })
        this.fillList()
	}

	onRequest(cmd, message) {
		if (cmd == "setSiteInfo") {
            if(message.params.cert_user_id)
                $("select_user").innerHTML = message.params.cert_user_id
            else
                $("select_user").innerHTML = "Select User"
			this.site_info = message.params
        }
		else
			this.log("Unknown incoming message:", cmd)
	}
} 
