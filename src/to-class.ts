import { isArray } from 'lodash';
import store from './store';
import { JosnType, OriginalStoreItemType, BasicClass, StoreItemType } from './typing';
import { toXML } from './to-xml';
import { mylog } from './to-log';

function getElementByTagName(node: any, tagName: string):any[] {
  var found:any = []
  mylog("getElementByTagName",tagName)
  Array.from(node.children).every((item: any) => {
    if (item.tagName === tagName) {
      found.push(item);
      return false
    } else {
      return true
    }
  })
  if(found.length==1) {
    if(found[0].children.length ==0) {
      return found[0].innerHTML;
    }
  }
  return found ;
}
function setInstanceValue(instance: any, key: any, value: any) {

  instance[key] = value;
  mylog(`set value :`, key, value)

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
  if (detectKeyStore.size > 0) {
    //开始自动检测
    mylog("start detect:", detectKeyStore, document, instance);

    Array.from(document.children).map((item: any) => {

      var propertiesOption = detectKeyStore.get(item.tagName)
      var GuessGlazz: any = undefined
      var GuessTo: any = undefined
      propertiesOption.forEach(({ key, convertKey, deserializer, targetClass, optional, array, isProperty, dimension }: OriginalStoreItemType) => {
        
        GuessGlazz = targetClass;
        GuessTo = convertKey;
        if(!instance[GuessTo]) {
          instance[GuessTo] = [];
        }
        mylog("GuessTo,GuessGlazz",GuessTo,GuessGlazz)

      });
      if (GuessGlazz) {
        var obj = objectToClass<T>(getOriginalKetStore(GuessGlazz), item, GuessGlazz);

        instance[GuessTo].push(obj)

      }
    });
    mylog("end detect")

  }
  mylog("originalKeyStore,detectKeyStore,manualKeyStore,", originalKeyStore, detectKeyStore, manualKeyStore)
  manualKeyStore.forEach((propertiesOption: OriginalStoreItemType[], originalKey) => {
    if (originalKey == undefined || originalKey == null || originalKey.length == 0) {
      throw (new Error("originalKey is empty"));
    }

    //var originalValue = xmlObj.count(originalKey) > 0 ? xmlObj.get(originalKey) : null;
    var originalValue = getElementByTagName(document,originalKey).length > 0 ? getElementByTagName(document,originalKey) : null;
    // if (instance instanceof EmptyModel && originalValue == null) {
    //   mylog(propertiesOption)
    //   mylog("originalKey is empty", originalKey, instance);
    // }

    propertiesOption.forEach(
      ({ key, deserializer, targetClass, optional, array, isProperty, dimension }: OriginalStoreItemType) => {
        if (isProperty) {
          if (!document.getAttribute) {
            mylog(document)
          }
          if (document.getAttribute(originalKey) > 0) {
            originalValue = document.getAttribute(originalKey) as any
            // mylog(`set property ${originalKey}=>${originalValue}`)
          }
        }
        if (originalValue === undefined) {
          if (!optional) {
            throw new Error(`Cannot map '${originalKey}' to ${Clazz.name}.${key}, property '${originalKey}' not found`);
          }
          return;
        }
        if (originalValue === null) {
          var instanceDefaultvalue = instance[key];
          var newValue = deserializer ? deserializer(originalValue, instance, document) : (originalValue == null ? null : originalValue);
          if (optional && instanceDefaultvalue == undefined && (instance[key] == null || instance[key] == '')) {
            delete instance[key];
          }
          if (newValue != undefined && newValue != '') {
            //instance[key] = newValue
            setInstanceValue(instance, key, newValue)
          }

          return;
        }
        let value = originalValue;

        // if (instance instanceof EmptyModel) {
        //   mylog("set value from originalValue", value);
        // }
        if (targetClass) {
          if (array) {
            if (dimension === 1) {
              // eslint-disable-next-line @typescript-eslint/no-use-before-define
              var tmpValue = <any>(toClasses(originalValue, targetClass));
              // if (instance instanceof EmptyModel) {
              //   mylog("tmpValue1:", tmpValue);
              // }
              value = tmpValue;
            } else {
              // eslint-disable-next-line @typescript-eslint/no-use-before-define
              var tmpValue = Array.from(originalValue).map((cur: any) => toClasses(cur, targetClass)) as any;
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
            }
          }
        }
        //mylog("===>",value);
        if (value == null) {
          setInstanceValue(instance, key, value)
        }
        else {
          if (deserializer) {
            //instance[key] = deserializer(value.at(0).getValue(), instance, xmlObj)
            var newValue = deserializer(value[0].getValue(), instance, document)
            setInstanceValue(instance, key, newValue)
          }
          else {
            if (value.length) { //XMLList
              //mylog("Clazz.prototype[key]:",Clazz.name, key, typeof instance[key])
              if (typeof instance[key] == "number") {
                //mylog("type of ",key, typeof instance[key]);
                //instance[key] = +value.at(0).getValue()
                var newValue: any = +((typeof value == "string") ? value : value[0]);
                setInstanceValue(instance, key, newValue)
              }
              else {
                // if (instance instanceof EmptyModel) {
                //   mylog(`set value [${value.at(0).getValue()}]=>[${key}]`)
                // }
                //instance[key] = value.at(0).getValue()
                var newValue: any = (typeof value == "string") ? value : value[0];
                setInstanceValue(instance, key, newValue)
              }
            }
            else {
              //mylog("type of ",key, typeof instance[key]);
              //instance[key] = value;
              //instance[key] = value;
              setInstanceValue(instance, key, value)

            }
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

export const toClasses = <T>(rawXMLList: any, Clazz: BasicClass<T>): T[] => {
  if (!rawXMLList.map) {
    mylog(rawXMLList)
  }
  return Array.from(rawXMLList).map((item: any) => objectToClass<T>(getOriginalKetStore(Clazz), item, Clazz));
};

export const toClass = <T>(xmlOrStr: any/* string */, Clazz: BasicClass<T>): T => {
  mylog("toClass", typeof xmlOrStr)
  var document;
  if (typeof xmlOrStr == "string") {
    document = toXML(xmlOrStr).documentElement;
  }
  else {
    document = xmlOrStr;
  }

  return objectToClass<T>(getOriginalKetStore(Clazz), document, Clazz);
};
