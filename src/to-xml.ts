// Cross-browser xml parsing
declare var window: any
declare var DOMParser: any
declare var ActiveXObject: any
export function toXML(data: any): any /* Document */ {
    var xml, tmp;
    try {
        if (typeof window !== 'undefined') { // Browser Env
            if (window.DOMParser) { // Standard
                tmp = new DOMParser();
                xml = tmp.parseFromString(data, "text/xml");
            } else { // IE
                xml = new ActiveXObject("Microsoft.XMLDOM");
                xml.async = "false";
                xml.loadXML(data);
            }
        }
        else { // Node Env
            var DOMParser = require('xmldom').DOMParser;
            xml = new DOMParser().parseFromString(data)
        }
    } catch (e) {
        xml = undefined;
    }
    if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
        new Error("Invalid XML: " + data);
    } 
    return xml;
}