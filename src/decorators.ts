import { setStore } from './store';
import { DimensionRange } from './typing';
import { mylog } from './to-log';

export function alias(classAlias: string) {
  return (target: any) => {
    !target.prototype.$Meta && (target.prototype.$Meta = {});
    target.prototype.$Meta.alias = classAlias;
  };
}
export function serialize(serializer: (value: any, instance: any, origin: any) => any) {
  return (target: any, propertyKey: string) => {
    setStore(target, {
      key: propertyKey,
      serializer,
    });
  };
}

export function deserialize(deserializer: (value: any, instance: any, origin: any) => any) {
  return (target: any, propertyKey: string) => {
    setStore(target, {
      key: propertyKey,
      deserializer,
    });
  };
}

export function element(originalKey: string, targetClass?: { new (...args: any[]): any }, required = false) {
  return (target: any, propertyKey: string) => {
    setStore(target, {
      originalKey,
      key: propertyKey,
      targetClass,
      required,
    });
  };
}

export function property(originalKey: string, required = false) {
  return (target: any, propertyKey: string) => {
    setStore(target, {
      originalKey,
      key: propertyKey,
      isProperty: true,
      required,
    });
  };
}

export function detect(convertKey: string) {
  return (target: any, propertyKey: string) => {
    mylog('@detect', convertKey, propertyKey, target);
    setStore(target, {
      convertKey,
      key: propertyKey,
      autoTypeDetection: true,
    });
  };
}

export function array(dimension: DimensionRange = 1) {
  return (target: any, propertyKey: string) => {
    setStore(target, {
      key: propertyKey,
      array: true,
      dimension,
    });
  };
}
