import { isArray } from 'lodash';
import store from './store';
import { JosnType, OriginalStoreItemType, BasicClass, StoreItemType } from './typing';
import { toXMLString, toXMLDocument } from './to-xml';
import { mylog } from './to-log';
declare let window: any;
var getChilddren: any;
var getElementByTagName: any
function browser_getChildren(node: any) {
  return node.children;
}
function node_getChildren(node: any) {
  return node.childNodes;
}
if (typeof window !== 'undefined') {
  getChilddren = browser_getChildren;
  getElementByTagName = browser_getElementByTagName;
}
else {
  getChilddren = node_getChildren
  getElementByTagName = node_getElementByTagName;
}
function browser_getElementByTagName(node: any, tagName: string): any[] {
  var found: any = []
  mylog("getElementByTagName", tagName)
  Array.from(node.children).every((item: any) => {
    if (item.tagName === tagName) {
      found.push(item);
    }
    return true
  })
  if (found.length == 1) {
    if (found[0].children.length == 0 && found[0].attributes.length == 0) {
      return found[0].innerHTML;
    }
  }
  return found;
}
function node_getElementByTagName(node: any, tagName: string): any {
  var found: any = []
  mylog("getElementByTagName", tagName, node)
  if (node && node.childNodes) {
    Array.from(node.childNodes).every((item: any) => {
      if (item.tagName === tagName) {
        found.push(item);
      }
      return true
    })
  }
  mylog("found length", found.length)
  if (found.length == 1) {
    if (found[0].childNodes.length == 1) {
      // mylog("result",found[0].childNodes[0].nodeValue)
      return found[0].childNodes[0].nodeValue;
    }
    else if (found[0].childNodes.length == 0) {
      // mylog("result","")
      return "";
    }
  }
  // mylog("result",found)
  return found;
}
function setInstanceValue(instance: any, key: any, value: any, array: boolean, serializeWithCDATA?: boolean) {
  mylog(`setInstanceValue start :`, key, value, array)
  var newValue = value;
  if (!array) {
    if (isArray(value)) {
      console.log(value)
      throw (new Error(`the value Looks like an array, must define Class.${key} use @array(), or define it use @element('nodename',Class)`));
    }
    mylog("value not is array")
    var valtype = typeof value;
    var objType = typeof instance[key];
    mylog("object type, value type:", objType, valtype)
    if (valtype == "string") {
      if (objType == "number") {
        newValue = +newValue;
      }
      else if (objType == "boolean") {
        newValue = valtype.length > 0 ? JSON.parse(newValue) : false;
      }
    }

  }
  else {
    mylog("value is array")
  }

  if (serializeWithCDATA) {
    //var myString = "<![CDATA[A Survey of Applications of Identity-Based Cryptography in Mobile Ad-Hoc Networks]]>";
    if (-1 !== newValue.indexOf("]]>")) {
      var myRegexp = /<!\[CDATA\[(.[\s\S]*?)\]\]>/;
      var match = myRegexp.exec(newValue);
      instance[key] = match[1];
    }
    else {
      instance[key] = newValue;
    }
  }
  else {
    instance[key] = newValue;
  }
  mylog(`setInstanceValue done :`, key, newValue)

}
// import { UserModel, PackageModel, DepartmentModel, EmptyModel } from '../tests/models.spec';
const objectToClass = <T>(
  originalKeyStore: Map<string, OriginalStoreItemType[]>,
  document: any,//{ [key: string]: any },
  Clazz: BasicClass<T>,
): T => {
  const instance: any = new Clazz();

  // mylog("originalKeyStore:",originalKeyStore)
  // if (instance instanceof EmptyModel) {
  mylog(`new Clazz(${Clazz.name}) ===>`, instance, document)
  // }
  //originalKeyStore.filter(checkAdult);
  var detectKeyStore = new Map<string, OriginalStoreItemType[]>(); //自动检测类
  var manualKeyStore = new Map<string, OriginalStoreItemType[]>(); //手动检测类

  originalKeyStore.forEach((propertiesOption: OriginalStoreItemType[], originalKey) => {
    propertiesOption.forEach(
      ({ autoTypeDetection }: OriginalStoreItemType) => {
        if (autoTypeDetection) {
          mylog(`set autoDetection (${originalKey}) ===>`, propertiesOption)
          detectKeyStore.set(originalKey, propertiesOption);
        }
        else {
          mylog(`set manual (${originalKey}) ===>`, propertiesOption)
          manualKeyStore.set(originalKey, propertiesOption);
        }
      });
  });
  //开始自动检测
  if (detectKeyStore.size > 0) {

    mylog("start detect:", detectKeyStore, document, instance);

    Array.from(getChilddren(document)).map((item: any) => {

      var propertiesOption = detectKeyStore.get(item.tagName) //检测节点是否可以自动检测
      if (propertiesOption) {
        var GuessGlazz: any = undefined
        var GuessTo: any = undefined

        propertiesOption.forEach(({ key, convertKey, deserializer, targetClass, required, serializeWithCDATA, array, isProperty, dimension }: OriginalStoreItemType) => {

          GuessGlazz = targetClass;
          if (!GuessGlazz) {
            throw (new Error("I can't reflect class for tag:" + item.tagName + ",Please define a Class type for it at Class:" + Clazz.name));
          }
          GuessTo = convertKey;
          if (!instance[GuessTo]) {
            instance[GuessTo] = [];
          }
          mylog("GuessTo,GuessGlazz", GuessTo, GuessGlazz)

        });
        if (GuessGlazz) {
          var obj = objectToClass<T>(getOriginalKetStore(GuessGlazz), item, GuessGlazz);
          if ((obj as any).parent && instance) {
            (obj as any).parent = instance[GuessTo];
          }
          instance[GuessTo].push(obj)

        }
      }
    });
    mylog("end detect")

  }
  //结束自动检测
  mylog("originalKeyStore,detectKeyStore,manualKeyStore,", originalKeyStore, detectKeyStore, manualKeyStore)
  manualKeyStore.forEach((propertiesOption: OriginalStoreItemType[], originalKey) => {
    if (originalKey == undefined || originalKey == null || originalKey.length == 0) {
      throw (new Error("originalKey is empty"));
    }
    mylog("manual emu node:", originalKey)
    //var originalValue = xmlObj.count(originalKey) > 0 ? xmlObj.get(originalKey) : null;
    var originalValue = getElementByTagName(document, originalKey);
    if (originalValue.constructor.name.toLowerCase() == "string" && originalValue == "") {
      //空节点
    }
    else if (originalValue.length <= 0) {
      originalValue = null;
    }
    // if (instance instanceof EmptyModel && originalValue == null) {
    //   mylog(propertiesOption)
    //   mylog("originalKey is empty", originalKey, instance);
    // }

    propertiesOption.forEach(
      ({ key, deserializer, targetClass, required, serializeWithCDATA, array, isProperty, dimension }: OriginalStoreItemType) => {
        if (isProperty) {
          mylog(`parse property ${originalKey}`);
          if (!document.getAttribute) {
            mylog(document)
            if (required) {
              throw new Error(`Cannot map attribute '${originalKey}' to ${Clazz.name}.${key}, property '${originalKey}' not found`);
            }
          }
          else if (document.hasAttribute(originalKey)) {
            mylog(`found attribute ${originalKey}=> ${document.getAttribute(originalKey)}`)
            originalValue = document.getAttribute(originalKey) as any
            // mylog(`set property ${originalKey}=>${originalValue}`)
          }
        }
        else {
          mylog(`parse element ${originalKey}`);
        }

        if (originalValue === null) {
          if (required) {
            throw new Error(`Cannot map element '${originalKey}' to ${Clazz.name}.${key}, property '${originalKey}' not found`);
          }
          else {
            var instanceDefaultvalue = instance[key];
            var newValue = deserializer ? deserializer(originalValue, instance, document) : (originalValue == null ? null : originalValue);
            mylog("key,required,newValue,instanceDefaultvalue,instance[key]", key, required, newValue, instanceDefaultvalue, instance[key]);
            if (!required && (instanceDefaultvalue == undefined || instanceDefaultvalue == null) && (instance[key] == null || instance[key] == undefined || instance[key] == '')) {
              mylog("delete key", key)
              //delete instance[key];
            }
            else if (newValue != undefined && newValue != '') {
              //instance[key] = newValue
              setInstanceValue(instance, key, newValue, false, serializeWithCDATA)
            }
            return;
          }
        }
        else {
          let value = originalValue;
          if (targetClass) {
            if (array) {
              if (dimension === 1) {
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                var tmpValue = <any>(toClasses(instance, originalValue, targetClass));
                // if (instance instanceof EmptyModel) {
                //   mylog("tmpValue1:", tmpValue);
                // }
                value = tmpValue;
              } else {
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                var tmpValue = Array.from(originalValue).map((cur: any) => toClasses(instance, cur, targetClass)) as any;
                // if (instance instanceof EmptyModel) {
                //   mylog("tmpValue2:", tmpValue);
                // }
                value = tmpValue;
              }
            } else {
              // eslint-disable-next-line @typescript-eslint/no-use-before-define
              value = null;
              if (originalValue.length > 0) {
                value = toClass(originalValue[0], targetClass);
                if (value.parent && instance) {
                  value.parent = instance
                }
              }
            }
          }
          //mylog("===>",value);
          if (value != null && deserializer) {
            var newValue = deserializer(value, instance, document)
            setInstanceValue(instance, key, newValue, array, serializeWithCDATA);
          }
          else {
            setInstanceValue(instance, key, value, array, serializeWithCDATA)
          }
        }

        //instance[key] = deserializer ? deserializer(value.at(0).getValue(), instance, xmlObj) : (<any>value).getValue();
      },
    );
  });
  return instance;
};

const getOriginalKetStore = <T>(Clazz: BasicClass<T>) => {
  let curLayer = Clazz;
  const originalKeyStore = new Map<string, OriginalStoreItemType[]>();
  while (curLayer.name) {
    const targetStore = store.get(curLayer);
    if (targetStore) {
      targetStore.forEach((storeItem: StoreItemType, key: string) => {
        const item = {
          key,
          ...storeItem,
        };
        if (!originalKeyStore.has(storeItem.originalKey)) {
          originalKeyStore.set(storeItem.originalKey, [item]);
        } else {
          const exists = originalKeyStore.get(storeItem.originalKey);
          if (!exists.find((exist: OriginalStoreItemType) => exist.key === key)) {
            originalKeyStore.set(storeItem.originalKey, [...originalKeyStore.get(storeItem.originalKey), item]);
          }
        }
      });
    }
    curLayer = Object.getPrototypeOf(curLayer);
  }
  //mylog("OriginalKeyStore:", originalKeyStore);
  return originalKeyStore;
};

export const toClasses = <T>(parent: any, rawXMLList: any, Clazz: BasicClass<T>): T[] => {

  mylog("toClasses", typeof rawXMLList, rawXMLList)
  return Array.from(rawXMLList).map((item: any) => {
    var value = objectToClass<T>(getOriginalKetStore(Clazz), item, Clazz)
    if ((value as any).parent && parent) {
      (value as any).parent = parent
    }
    return value;

  });
};

export const toClass = <T>(xmlOrStr: any/* string */, Clazz: BasicClass<T>): T => {
  mylog("toClass", typeof xmlOrStr, xmlOrStr)
  var document;
  if (typeof xmlOrStr == "string") {
    document = toXMLDocument(xmlOrStr).documentElement;
  }
  else {
    document = xmlOrStr;
  }

  return objectToClass<T>(getOriginalKetStore(Clazz), document, Clazz);
};
