function $(text) {
    return document.getElementById(text)
}

function ownPage(that) {
    window.location.href = "modder_profile.html?auth_address=" + that.site_info.auth_address
    return false
}

function selectUser(that) {
    that.cmd("certSelect", {accepted_domains: ["zeroid.bit", "kaffie.bit"]})
    return false
}

function checkOptionalRegex(that, json) {
    that.cmd("fileGet", { "inner_path": json, "required": true }, (file) => {
        file = JSON.parse(file)
        if(file.optional != "(.+jpg|.+jar)") {
            file.optional = "(.+jpg|.+jar)"
            var json_raw = unescape(encodeURIComponent(JSON.stringify(file, undefined, '\t')))
            that.cmd("fileWrite", [json, btoa(json_raw)], (res) => {
                that.log("Added optional regex")
            })
        }
    })
}

function tV(ID, value) { //Toggle visibility
    if(value)
        $(ID).style.display = ""
    else
        $(ID).style.display = "none"
}

function getURLArgument(part) {
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
