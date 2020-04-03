import { isArray } from 'lodash';
import store from './store';
import { JosnType, BasicClass, StoreItemType } from './typing';
import { mylog } from './to-log';

const classToObject = <T>(keyStore: Map<string, StoreItemType>, instance: JosnType, Clazz: BasicClass<T>): JosnType => {
  let obj: JosnType = {};

  mylog('classToObject:', keyStore, instance, Clazz.name);

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
  // 开始自动检测
  if (detectKeyStore.size > 0) {
    convertedKeys.forEach((v: any, key: string) => {
      const convertStore = instance[key];
      mylog('detected for:', key, convertStore, guessCLassNameMap);
      if (!isArray(obj)) {
        // type from obj convert to array
        mylog('init obj to array');
        obj = [];
      }
      convertStore.map((instanceMixed: any) => {
        const itemClassName = instanceMixed.constructor.name;
        const GuessGlazz = guessCLassNameMap.get(itemClassName);
        const GuessAlias = guessCLassAliasMap.get(itemClassName);
        obj.push(toPlain(instanceMixed, GuessGlazz, GuessAlias));
      });
    });
  }
  // 对象修饰开始
  manualKeyStore.forEach((propertiesOption: StoreItemType, key: keyof JosnType) => {
    const instanceValue = instance[key];
    const { originalKey, serializer, targetClass, required, array, dimension } = propertiesOption;
    if (instanceValue === undefined) {
      if (required) {
        // mylog("instance",instance);
        throw new Error(`Cannot map '${originalKey}' to ${Clazz.name}.${key}, property '${originalKey}' not found`);
      }
      return;
    }
    if (instanceValue === null) {
      obj[originalKey] = serializer ? serializer(instanceValue, instance, obj) : instanceValue;
      return;
    }
    let value = instanceValue;
    if (targetClass) {
      if (array) {
        if (dimension === 1) {
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          value = toPlains(instanceValue, targetClass);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          value = instanceValue.map((cur: any) => toPlains(cur, targetClass));
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        value = toPlain(instanceValue, targetClass);
      }
    }
    obj[originalKey] = serializer ? serializer(value, instance, obj) : value;
  });
  return obj;
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

export const toPlains = <T>(instances: (T | JosnType)[], Clazz: BasicClass<T>): any[] => {
  mylog('toPlains', instances, Clazz);
  if (!isArray(instances)) {
    throw new Error(`${Clazz} instances must be a array`);
  }
  return instances.map((item: JosnType) => classToObject<T>(getKeyStore(Clazz), item, Clazz));
};

export const toPlain = <T>(instance: T | JosnType, Clazz: BasicClass<T>, key?: string): any => {
  mylog('toPlain', instance, Clazz, key);
  if (!key) {
    if ((<any>instance).$Meta && (<any>instance).$Meta.alias) {
      key = (<any>instance).$Meta.alias;
    }
  }
  if (key) {
    const o: any = {};
    o[key] = classToObject<T>(getKeyStore(Clazz), instance, Clazz);
    return o;
  }

  return classToObject<T>(getKeyStore(Clazz), instance, Clazz);
};
