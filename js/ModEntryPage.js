class ModEntryPage extends ZeroFrame {

    load() {
        var md = window.markdownit()
        md.set({ html: true })
        
        if(this.getURLArgument("new_mod") == "1") {
            $("create_mod").style = ""
            return
        }
        
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
                    $("create_mod").style = ""
                }
                else {
                    $("content").innerHTML = "This mod does not exist"
                }
                return false
            }
            $("creator_link").innerHTML = details[0].cert_user_id
            $("creator_link").href = "modder_profile.html?auth_address=" + details[0].directory.replace("users/", "")
            if(details[0].license && details[0].license != "")
                $("license_link").innerHTML = details[0].license
            $("div_name").innerHTML = details[0].name
            $("mod_name_input").value = details[0].name
            $("div_desc").innerHTML = md.render(details[0].description)
            $("mod_desc_input").value = details[0].description
            $("category_input").value = details[0].category
            $("mod_summary_input").value = details[0].summary
            $("mod_icon_display").src = "data/" + details[0].directory + "/topicicon_" + details[0].topic_id + ".jpg"
            if(details[0].license && details[0].license != "") {
                $("license_input").value = details[0].license
                $("license_link").innerHTML = details[0].license
            }
            
            if(modder_auth == this.site_info.auth_address) {
                $("mod_owner_options").style = ""
            }
        })
    }
    
    newFile() {
        $("mod_details").style = "display: none;"
        $("new_file").style = ""
    }
    
    saveModFile() {
        this.checkOptionalRegex()
        var file = $("mod_file_input").files[0]
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
                "version": $("version_input").value,
                "added": Date.now(),
                "type": $("release_input").value,
                "changelog": $("changelog_input").value
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
        if(mod_address) {
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
        }
        if(part == "mod_id") return parseInt(mod_id, 10)
        else if(part == "modder_auth") return modder_auth
        else if(part == "version") return parseInt(version, 10)
        else if(part == "mod_address") return mod_id + "_" + modder_auth
        else return url.searchParams.get(part)
    }
    
    modIconUploadClick() {
        this.checkOptionalRegex()
        var file = $("mod_icon_input").files[0]
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
                    var button = $("mod_icon_upload_button")
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
                    "name": $("mod_name_input").value,
                    "description": $("mod_desc_input").value,
                    "category": $("category_input").value,
                    "license": $("license_input"),
                    "summary": $("mod_summary_input"),
                    "added": Date.now()
                })
            }
            else {
                var index = file.topic.findIndex(function(node) {
                    return node.topic_id == topic_id
                })
                file.topic[index].name = $("mod_name_input").value,
                file.topic[index].description = $("mod_desc_input").value,
                file.topic[index].category = $("category_input").value,
                file.topic[index].license = $("license_input").value,
                file.topic[index].summary = $("mod_summary_input").value
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
        $("create_mod").style = ""
        $("mod_details").style = "display: none;"
    }

	onOpenWebsocket() {
		this.cmd("siteInfo", {}, (site_info) => {
            if(site_info.cert_user_id)
                $("select_user").innerHTML = site_info.cert_user_id
            this.site_info = site_info
        })
        this.load()
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
	
	tabSelect(tab) {
        if(tab == "tab_files") {
            if(this.filesFilled == true)
                return false
            var fileList = $("file_list")
            var query = "SELECT file_id, version, mc_version, added, type, directory, ipfs, clearnet FROM files LEFT JOIN json USING (json_id) WHERE topic_id=" + this.getURLArgument("mod_id") + " AND directory=\"users/" + this.getURLArgument("modder_auth") + "\" ORDER BY added DESC"
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
                        
                        var cellMCVersion = document.createElement("td")
                        cellMCVersion.innerHTML = files[i].mc_version
                        row.append(cellMCVersion)
                        
                        var cellVersion = document.createElement("td")
                        cellVersion.innerHTML = files[i].version
                        row.append(cellVersion)
                        
                        var cellDownload = document.createElement("td")
                            var downLink = document.createElement("a")
                            downLink.href = "data/" + files[i].directory + "/" + files[i].file_id + "_" + this.getURLArgument("mod_address") + ".jar"
                            var fileName
                            if(files[i].mc_version && files[i].mc_version != "")
                                fileName = $("div_name").innerHTML + "-" + files[i].mc_version + "-" + files[i].version + ".jar"
                            else
                                fileName = 
                                $("div_name").innerHTML + "-" + files[i].version + ".jar"
                            downLink.download = fileName
                            downLink.innerHTML = fileName
                            cellDownload.append(downLink)
                        row.append(cellDownload)
                        
                        var cellSize = document.createElement("td")
                        cellSize.id = "cellSize" + files[i].file_id
                        row.append(cellSize)
                        
                        var cellPeers = document.createElement("td")
                            var divStatus = document.createElement("div")
                            divStatus.id = "divStatus" + files[i].file_id
                            divStatus.innerHTML = "&#10060;"
                            cellPeers.append(divStatus)
                            
                            var divPeerNumber = document.createElement("div")
                            divPeerNumber.id ="divPeerNumber" + files[i].file_id
                            cellPeers.append(divPeerNumber)
                        row.append(cellPeers)
                        
                        var cellAdded = document.createElement("td")
                        cellAdded.innerHTML = this.timeSince(files[i].added) + " ago"
                        row.append(cellAdded)
                        
                        var cellAltDown = document.createElement("td")
                            var ipfsLink = document.createElement("a")
                            if(files[i].ipfs) {
                                ipfsLink.href = files[i].ipfs
                                ipfsLink.innerHTML = "IPFS"
                            }
                            cellAltDown.append(ipfsLink)
                            
                            var clearLink = document.createElement("a")
                            clearLink.style = "padding-left: 10px;"
                            if(files[i].clearnet) {
                                clearLink.href = files[i].clearnet
                                clearLink.innerHTML = "clearnet"
                            }
                            cellAltDown.append(clearLink)
                        row.append(cellAltDown)
                    
                    this.cmd("optionalFileInfo", ["data/" + files[i].directory + "/" + files[i].file_id + "_" + this.getURLArgument("mod_address") + ".jar"], (data) => {
                        var fileID = data.inner_path.replace("data/users/" + this.getURLArgument("modder_auth") + "/", "").replace("_" + this.getURLArgument("mod_address") + ".jar", "")
                        $("divPeerNumber" + fileID).innerHTML = data.peer
                        $("cellSize" + fileID).innerHTML = data.size
                        this.log(i + " " + data.peer)
                        if(data.is_downloaded == 1)
                            $("divStatus" + fileID).innerHTML = "&#10003;"
                    })
                    fileList.append(row)
                    this.filesFilled = true
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
