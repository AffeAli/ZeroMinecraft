class ModEntryPage extends ZeroFrame {
    
    //var pending_image_tasks = -1
    
    test() {
        var file = document.getElementById("mod_icon_upload").files[0]
        var reader = new FileReader();
        reader.onload = function(evt) {
            var fileData = evt.target.result;
            var bytes = new Uint8Array(fileData);
            var binaryText = '';

            for (var index = 0; index < bytes.byteLength; index++) {
                binaryText += String.fromCharCode( bytes[index] );
            }

            console.log(btoa(binaryText));

        };
        reader.readAsArrayBuffer(file);
    }

    load() {
        var md = window.markdownit()
        md.set({ html: true })
        
        var url = new URL(window.location.href)
        var mod_address = url.searchParams.get("mod_address")
        var data_array = mod_address.split("_")
        var version, mod_id, modder_auth
        if(data_array.length > 2) {
            version = data_array[0]
            mod_id = data_array[1]
            modder_auth = data_array[2]
        }
        else {
            mod_id = data_array[0]
            modder_auth = data_array[1]
        }
        
        this.cmd("dbQuery", ["SELECT * FROM topic LEFT JOIN json USING (json_id) WHERE directory=\"users/" + modder_auth + "\" AND topic_id=" + mod_id], (details) => {
            if(details.length > 1) {
                this.log("Error: DB Query returned multiple mods")
                return false
            }
            if(details.length == 0) {
                if(modder_auth == this.site_info.auth_address) {
                    document.getElementById("create_mod").style = ""
                }
                else {
                    document.getElementById("content").innerHTML = "This mod does not exist"
                }
                return false
            }
            document.getElementById("creator_link").innerHTML = details[0].cert_user_id
            document.getElementById("creator_link").href = "modder_profile.html?auth_address=" + details[0].directory.replace("users/", "")
            if(details[0].license && details[0].license != "")
                document.getElementById("license_link").innerHTML = details[0].license
            document.getElementById("div_name").innerHTML = details[0].name
            document.getElementById("mod_name_input").value = details[0].name
            document.getElementById("div_desc").innerHTML = md.render(details[0].description)
            document.getElementById("mod_desc_input").value = details[0].description
            //document.getElementById("div_category").innerHTML = details[0].category
            document.getElementById("category_input").value = details[0].category
            document.getElementById("mod_icon_display").src = "data/" + details[0].directory + "/topicicon_" + details[0].topic_id + ".jpg"
            if(details[0].license && details[0].license != "") {
                document.getElementById("license_input").value = details[0].license
                document.getElementById("license_link").innerHTML = details[0].license
            }
            
            if(modder_auth == this.site_info.auth_address) {
                document.getElementById("mod_owner_options").style = ""
            }
        })
    }
    
    newFile() {
        document.getElementById("mod_details").style = "display: none;"
        document.getElementById("new_file").style = ""
    }
    
    saveModFile() {
        this.checkOptionalRegex()
        var file = document.getElementById("mod_file_input").files[0]
        var reader = new FileReader();
        var that = this
        reader.onload = function(evt) {
            var fileData = evt.target.result;
            var bytes = new Uint8Array(fileData);
            var binaryText = '';

            for (var index = 0; index < bytes.byteLength; index++) {
                binaryText += String.fromCharCode( bytes[index] );
            }
            var data_inner_path = "data/users/" + that.site_info.auth_address + "/data.json"
            that.cmd("fileGet", { "inner_path": data_inner_path }, (data) => {
                data = JSON.parse(data)
                var file_id = 1
                if(data.next_file_id) {
                    file_id = data.next_file_id
                }
                var path = "data/users/" + that.site_info.auth_address + "/" + file_id + "_" + that.getURLArgument("mod_address") + ".jar"
                that.cmd("fileWrite", [path, btoa(binaryText)], (res) => {
                    if(res == "ok") {
                        //TODO success
                    }
                })
            })
        }
        reader.readAsArrayBuffer(file)
    }
    
    submitFile() {
        var data_inner_path = "data/users/" + this.site_info.auth_address + "/data.json"
        var content_inner_path = "data/users/" + this.site_info.auth_address + "/content.json"
        this.cmd("fileGet", { "inner_path": data_inner_path }, (data) => {
            data = JSON.parse(data)
            
            var file_id = 1
            if(data.next_file_id) {
                file_id = data.next_file_id
                data.next_file_id += 1
            }
            else
                data.next_file_id = 2
            
            var topic_id = this.getURLArgument("mod_id")
            
            data.files.push({
                "file_id": file_id,
                "topic_id": topic_id,
                "version": document.getElementById("version_input").value,
                "added": Date.now(),
                "type": document.getElementById("release_input").value
            })
            
            var json_raw = unescape(encodeURIComponent(JSON.stringify(data, undefined, '\t')))
            this.cmd("fileWrite", [data_inner_path, btoa(json_raw)], (res) => {
                this.cmd("siteSign", { "inner_path": content_inner_path }, (res) => {
                    this.cmd("sitePublish", { "inner_path": content_inner_path, "sign": false })
                })
            })
        })
    }
    
    getURLArgument(part) {
        var url = new URL(window.location.href)
        var mod_address = url.searchParams.get("mod_address")
        var data_array = mod_address.split("_")
        var version, mod_id, modder_auth
        if(data_array.length > 2) {
            version = data_array[0]
            mod_id = data_array[1]
            modder_auth = data_array[2]
        }
        else {
            mod_id = data_array[0]
            modder_auth = data_array[1]
        }
        if(part == "mod_id") return parseInt(mod_id, 10)
        else if(part == "modder_auth") return modder_auth
        else if(part == "version") return parseInt(version, 10)
        else if(part == "mod_address") return mod_id + "_" + modder_auth
        else this.log("wrong argument: " + part)
    }
    
    modIconUploadClick() {
        this.checkOptionalRegex()
        var file = document.getElementById("mod_icon_input").files[0]
        var reader = new FileReader();
        var that = this
        reader.onload = function(evt) {
            var fileData = evt.target.result;
            var bytes = new Uint8Array(fileData);
            var binaryText = '';

            for (var index = 0; index < bytes.byteLength; index++) {
                binaryText += String.fromCharCode( bytes[index] );
            }
            
            var path = "data/users/" + that.site_info.auth_address + "/topicicon_" + that.getURLArgument("mod_id") + ".jpg"
            that.cmd("fileWrite", [path, btoa(binaryText)], (res) => {
                if(res == "ok") {
                    var button = document.getElementById("mod_icon_upload_button")
                    button.style = "color: green;"
                    button.enabled = false
                }
            })

        };
        reader.readAsArrayBuffer(file);
    }
    
    submitMod() {
        var data_inner_path = "data/users/" + this.site_info.auth_address + "/data.json"
        var content_inner_path = "data/users/" + this.site_info.auth_address + "/content.json"
        this.cmd("fileGet", { "inner_path": data_inner_path, "required": true }, (file) => {
            file = JSON.parse(file)
            var topic_id = this.getURLArgument("mod_id")
            var newTopic = false
            if(topic_id == 99) {//TODO fix increasing next_topic_id
                newTopic = true
                if(file.next_topic_id)
                    topic_id = file.next_topic_id
                else {
                    file.next_topic_id = 1
                    topic_id = 1
                }
                file.next_topic_id += 1
            }
            
            if(newTopic) {
                file.topic.push({
                    "topic_id": topic_id,
                    "name": document.getElementById("mod_name_input").value,
                    "description": document.getElementById("mod_desc_input").value,
                    "category": document.getElementById("category_input").value,
                    "license": document.getElementById("license_input"),
                    "added": Date.now()
                })
            }
            else {
                var index = file.topic.findIndex(function(node) {
                    return node.topic_id == topic_id
                })
                file.topic[index].name = document.getElementById("mod_name_input").value,
                file.topic[index].description = document.getElementById("mod_desc_input").value,
                file.topic[index].category = document.getElementById("category_input").value,
                file.topic[index].license = document.getElementById("license_input").value
            }
            var json_raw = unescape(encodeURIComponent(JSON.stringify(file, undefined, '\t')))
            
            this.cmd("fileWrite", [data_inner_path, btoa(json_raw)], (res) => {
                if(res == "ok") {
                    this.cmd("siteSign", {"inner_path": content_inner_path}, (res) => {
                        if(res != "ok") {
                            this.cmd("wrapperNotification", ["error", "Signing failed: #{res}"])
                            return false
                        }
                        window.location.href = "mod_entry.html?mod_address=" + topic_id + "_" + this.site_info.auth_address
                        this.cmd("wrapperNotification", ["done", "Mod created"])
                        this.cmd("sitePublish", {"inner_path": content_inner_path, "sign": false})
                    })
                }
                else
                    this.cmd("wrapperNotification", ["error", "File write error: #{res}"])
            })
        })
    }
    
    checkOptionalRegex(json) {
        this.cmd("fileGet", { "inner_path": json, "required": true }, (file) => {
            file = JSON.parse(file)
            if(file.optional != "(.+jpg|.+jar)") {
                file.optional = "(.+jpg|.+jar)"
                var json_raw = unescape(encodeURIComponent(JSON.stringify(file, undefined, '\t')))
                this.cmd("fileWrite", [json, btoa(json_raw)], (res) => {
                    this.cmd("wrapperNotification", ["done", "Added optional regex: #{res}"])
                })
            }
        })
    }
    
    editMod() {
        document.getElementById("create_mod").style = ""
        document.getElementById("mod_details").style = "display: none;"
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
        this.load()
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
	
	tabSelect(tab) {
        if(tab == "tab_files") {
            var fileList = document.getElementById("file_list")
            var query = "SELECT file_id, version, added, type, directory FROM files LEFT JOIN json USING (json_id) WHERE topic_id=" + this.getURLArgument("mod_id") + " AND directory=\"users/" + this.getURLArgument("modder_auth") + "\" ORDER BY added DESC"
            this.cmd("dbQuery", [query], (files) => {
                for(var i = 0; i < files.length; i++) {
                    var row = document.createElement("tr")
                        var cellType = document.createElement("td")
                            var typeDiv = document.createElement("div")
                            typeDiv.className = "release-type"
                            switch(files[i].type) {
                                case "release":
                                    typeDiv.innerHTML = "R"
                                    typeDiv.style = "background-color: green;"
                                    break;
                                case "beta":
                                    typeDiv.innerHTML = "B"
                                    typeDiv.style = "background-color: yellow;"
                                    break;
                                case "alpha":
                                    typeDiv.innerHTML = "A"
                                    typeDiv.style = "background-color: red;"
                                    break;
                                case "experimental":
                                    typeDiv.innerHTML = "E"
                                    typeDiv.className += " rainbow"
                                    break;
                            }
                            cellType.append(typeDiv)
                        row.append(cellType)
                        
                        var cellVersion = document.createElement("td")
                        cellVersion.innerHTML = files[i].version
                        row.append(cellVersion)
                        
                        var cellDownload = document.createElement("td")
                            var downLink = document.createElement("a")
                            downLink.href = "data/" + files[i].directory + "/" + files[i].file_id + "_" + this.getURLArgument("mod_address") + ".jar"
                            //downLink.target = "_blank"
                            downLink.download = files[i].version + ".jar"
                            downLink.innerHTML = downLink.download + ".jar"
                            cellDownload.append(downLink)
                        row.append(cellDownload)
                        
                        var cellSize = document.createElement("td")
                        row.append(cellSize)
                        
                        var cellPeers = document.createElement("td")
                            var divStatus = document.createElement("div")
                            divStatus.innerHTML = "&#10060;"
                            cellPeers.append(divStatus)
                            
                            var divPeerNumber = document.createElement("div")
                            cellPeers.append(divPeerNumber)
                        row.append(cellPeers)
                        
                        var cellAdded = document.createElement("td")
                        cellAdded.innerHTML = this.timeSince(files[i].added) + " ago"
                        row.append(cellAdded)
                    
                    this.cmd("optionalFileInfo", ["data/" + files[i].directory + "/" + files[i].file_id + "_" + this.getURLArgument("mod_address") + ".jar"], (data) => {
                        this.log(data)
                        this.log(downLink.href)
                        divPeerNumber.innerHTML = data.peer
                        cellSize.innerHTML = data.size
                        if(data.is_downloaded == 1)
                            divStatus.innerHTML = "&#10003;"
                    })
                    fileList.append(row)
                    
                }
            })
        }
    }
    
    timeSince(date) {
        var seconds = Math.floor((new Date() - date) / 1000);
        var interval = Math.floor(seconds / 31536000);
        if (interval > 1) {
            return interval + " years";
        }
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) {
            return interval + " months";
        }
        interval = Math.floor(seconds / 86400);
        if (interval > 1) {
            return interval + " days";
        }
        interval = Math.floor(seconds / 3600);
        if (interval > 1) {
            return interval + " hours";
        }
        interval = Math.floor(seconds / 60);
        if (interval > 1) {
            return interval + " minutes";
        }
        return Math.floor(seconds) + " seconds";
    }
} 
