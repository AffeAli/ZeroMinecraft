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
