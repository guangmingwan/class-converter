// Cross-browser xml parsing
declare let window: any;
declare let DOMParser: any;
declare let ActiveXObject: any;
export function toXML(data: any): any /* Document */ {
  let xml;
  let tmp;
  try {
    if (typeof window !== 'undefined') {
      // Browser Env
      if (window.DOMParser) {
        // Standard
        tmp = new DOMParser();
        xml = tmp.parseFromString(data, 'text/xml');
      } else {
        // IE
        xml = new ActiveXObject('Microsoft.XMLDOM');
        xml.async = 'false';
        xml.loadXML(data);
      }
    } else {
      // Node Env
      // eslint-disable-line global-require
      const NDOMParser = require('xmldom').DOMParser;
      xml = new NDOMParser().parseFromString(data);
    }
  } catch (e) {
    xml = undefined;
  }
  if (!xml || !xml.documentElement || xml.getElementsByTagName('parsererror').length) {
    throw new Error(`Invalid XML: ${data}`);
  }
  return xml;
}
