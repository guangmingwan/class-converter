import { setStore } from './store';
import { DimensionRange } from './typing';

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

export function element(originalKey: string, targetClass?: { new (...args: any[]): any }, optional = false) {
  return (target: any, propertyKey: string) => {
    setStore(target, {
      originalKey,
      key: propertyKey,
      targetClass,
      optional,
    });
  };
}

export function property(originalKey: string, optional = false) {
  return (target: any, propertyKey: string) => {
    setStore(target, {
      originalKey,
      key: propertyKey,
      isProperty: true,
      optional,
    });
  };
}

export function detect() {
  return (target: any, propertyKey: string) => {
    console.log("@detect",target,propertyKey)
    setStore(target, {
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
