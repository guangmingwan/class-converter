
import store from './store';
import { JosnType, BasicClass, StoreItemType } from './typing';
import { mylog } from './to-log';
import { isArray } from 'lodash';
// const xml2js = require('xml2js');
// Cross-browser xml parsing
declare let window: any;
declare let DOMParser: any;
declare let ActiveXObject: any;
declare let XMLSerializer: any;
var builder: any = null;
const { create } = require('xmlbuilder2');
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
const classToXml = <T>(keyStore: Map<string, StoreItemType>, instance: JosnType, Clazz: BasicClass<T>): void => {
  // let obj: JosnType = {};

  mylog('classToXml:', keyStore, instance, Clazz.name);

  const convertedKeys = new Map<string, any>();
  const guessCLassNameMap = new Map<string, any>();
  const guessCLassAliasMap = new Map<string, any>();
  const detectKeyStore = new Map<string, StoreItemType>(); // 自动检测类
  const manualKeyStore = new Map<string, StoreItemType>(); // 手动检测类
  keyStore.forEach((propertiesOption: StoreItemType, key: keyof JosnType) => {
    const { originalKey, serializer, targetClass, required, autoTypeDetection, array, dimension } = propertiesOption;
    if (autoTypeDetection) {
      detectKeyStore.set(key as any, propertiesOption);
      convertedKeys.set(propertiesOption.convertKey, {});
      guessCLassNameMap.set(propertiesOption.targetClass.name, propertiesOption.targetClass);
      guessCLassAliasMap.set(propertiesOption.targetClass.name, propertiesOption.originalKey);
    } else {
      manualKeyStore.set(key as any, propertiesOption);
    }
  });
  mylog('detectKeyStore,manualKeyStore\'s size:', detectKeyStore.size, manualKeyStore.size);
  // 开始自动检测
  if (detectKeyStore.size > 0) {
    convertedKeys.forEach((v: any, key: string) => {
      const convertStore = instance[key];
      mylog('detected for:', key, convertStore, guessCLassNameMap);
      // if (!isArray(obj)) {
      //   // type from obj convert to array
      //   mylog('init obj to array');
      //   obj = [];
      // }

      convertStore.forEach((instanceMixed: any) => {
        const itemClassName = instanceMixed.constructor.name;
        const GuessGlazz = guessCLassNameMap.get(itemClassName);
        const GuessAlias = guessCLassAliasMap.get(itemClassName);
        // obj.push(toXMLString(instanceMixed, GuessGlazz, GuessAlias));

      });
    });
  }
  // 对象修饰开始
  manualKeyStore.forEach((propertiesOption: StoreItemType, key: keyof JosnType) => {
    const instanceValue = instance[key];
    const { originalKey, serializer, targetClass, required, array, isProperty, dimension } = propertiesOption;
    if (instanceValue === undefined) {
      if (required) {
        // mylog("instance",instance);
        throw new Error(`Cannot map '${originalKey}' to ${Clazz.name}.${key}, property '${originalKey}' not found`);
      }
      return;
    }
    if (instanceValue === null) {
      builder.ele(originalKey);
      // obj[originalKey] = serializer ? serializer(instanceValue, instance, obj) : instanceValue;
      return;
    }
    let value = instanceValue;
    if (targetClass) {
      if (array) {
        if (dimension === 1) {
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          value = toXMLStrings(instanceValue, targetClass, originalKey);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          value = instanceValue.map((cur: any) => toXMLStrings(cur, targetClass), originalKey);
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        //builder = builder.ele(originalKey);
        value = toXMLString(instanceValue, targetClass, originalKey);
      }
    }
    else {
      if (isProperty) {
        // if (!obj._attribute) {
        //   obj._attribute = [];
        // }
        // obj._attribute[originalKey] = serializer ? serializer(value, instance, obj) : value;
        var propertyValue = serializer ? serializer(value, instance, null) : value
        console.log("set property", originalKey, propertyValue)
        builder.att(originalKey, propertyValue) //属性是上一个节点的

      } else {
        var nodeValue = serializer ? serializer(value, instance, null) : value
        console.log("create node", originalKey, nodeValue)
        builder = builder.ele(originalKey).txt(
          nodeValue
        ).up();

        // obj[originalKey] = serializer ? serializer(value, instance, obj) : value;
        // console.log("set obj value:", originalKey, obj[originalKey])
        //builder.ele(originalKey).txt(obj[originalKey]).up()
      }
    }
  });
  //builder.up();
  // return obj;
};
// 对象修饰结束

const getKeyStore = <T>(Clazz: BasicClass<T>) => {
  let curLayer = Clazz;
  const keyStore = new Map<string, StoreItemType>();
  while (curLayer.name) {
    const targetStore = store.get(curLayer);
    if (targetStore) {
      targetStore.forEach((storeItem: StoreItemType, key: string) => {
        if (!keyStore.has(key)) {
          keyStore.set(key, storeItem);
        }
      });
    }
    curLayer = Object.getPrototypeOf(curLayer);
  }
  return keyStore;
};
export const toXMLStrings = <T>(instances: (T | JosnType)[], Clazz: BasicClass<T>, key?: any): any[] => {
  mylog('toPlains', instances, Clazz.name);
  if (!isArray(instances)) {
    throw new Error(`${Clazz} instances must be a array`);
  }
  if (key) {
    console.log("create node", key);
    builder = builder.ele(key)
  }
  var v = instances.map((item: JosnType) => classToXml<T>(getKeyStore(Clazz), item, Clazz));
  if (key) {
    builder = builder.up();
  }
  return v;
};
export function toXMLString<T>(instance: any, Clazz: BasicClass<T>, key?: any): any {
  console.log("toXMLString", instance, Clazz.name, key)
  var rootkey = null;
  if (builder == null) {

    if ((<any>instance).$Meta && (<any>instance).$Meta.alias) {
      rootkey = (<any>instance).$Meta.alias;
    }
    console.log("create root node", rootkey);
    builder = create({ version: '1.0', encoding: "utf-8" })
    builder = builder.ele(rootkey)

  }
  if (key) {
    console.log("create node", key);
    builder = builder.ele(key)
  }

  classToXml<T>(getKeyStore(Clazz), instance, Clazz);


  if (key) {
    console.log("up")
    builder = builder.up();
  }

  if (rootkey) {
    builder = builder.up();
    //convert the XML tree to string
    const xml = builder.end({ prettyPrint: true });
    builder = null;
    return xml;
  }
}
export function toXMLDocument(data: any): any /* Document */ {
  console.log("toXMLDocument")
  if (typeof data === 'string') {
    // string
    return strToDocument(data);
  }

  return false;

  // else { //obj
  //   return classToXMLString(data);
  // }
}
