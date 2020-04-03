import xml2js from 'xml2js';
import { toPlain } from './to-plain';
import { JosnType, BasicClass, StoreItemType } from './typing';
// const xml2js = require('xml2js');
// Cross-browser xml parsing
declare let window: any;
declare let DOMParser: any;
declare let ActiveXObject: any;
declare let XMLSerializer: any;
function strToDocument(data: any): any {
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
export function toXMLString<T>(instance: any, Clazz: BasicClass<T>): any {
  // class to jsonObject
  const jsonObject = toPlain(instance, Clazz);
  // jsonObject to xml

  // const parser = new xml2js.Parser({
  //   attrkey: '_attribute',
  //   explicitArray: false,
  //   //parseNumbers: true,
  //   //parseBooleans: true,
  //   explicitChildren: false,
  //   charkey: 'content',
  //   preserveChildrenOrder: true,
  // });

  const builder = new xml2js.Builder({ attrkey: '_attribute', explicitArray: false /*  rootname: 'project' */ });
  let obj: any = {};
  obj = jsonObject;
  // console.log("obj", obj);
  const xmlString = builder.buildObject(obj);

  // let xmlString;

  // if (window.ActiveXObject) {
  //   xmlString = xmlData[0].xml;
  // }

  // if (xmlString === undefined) {
  //   const oSerializer = new XMLSerializer();
  //   xmlString = oSerializer.serializeToString(xmlData[0]);
  // }

  return xmlString;
}
export function toXMLDocument(data: any): any /* Document */ {
  if (typeof data === 'string') {
    // string
    return strToDocument(data);
  }

  return false;

  // else { //obj
  //   return classToXMLString(data);
  // }
}
