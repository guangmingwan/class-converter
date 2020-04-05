# class-converter-ts

class converter for typescript is a transformer to deserializable xml to typescript class and serializable class to xml.

# Why use it ?

Maybe this project is the best xml2ob solution in JS / TS, maybe not.

Npmjs.com has many XML to object projects. Why should I reinvent a wheel?

I have an AS3 project, which uses flexxb [https://github.com/alexandruciobanu/flexxb] for persistence support. Unfortunately, after the project is migrated to typescript, all projects cannot solve my problem:
```js
<root>

<a>1</a>

<b>2</b>

<a>3</a>

</root>
```

After it is converted into JSON, it becomes {A: [1,3], B: 2}. After it is converted into XML again, the order changes to:
```js
<root>

<a>1</a>

<a>3</a>

<b>2</b>

</root>
```
This is not what I want, so I created this project. According to the design idea of flexxb, I realized the sequential reservation function of mixed object nodes.

mixed xml node:
```js
<contents>

<calendar/>

<text_layer/>

<photo_layer/>

<decorate_layer/>

<photo_layer/>

</contents>
```
Class:
```js
export class Contents extends GraphiceObject {



@detect('layers')

@array ()

@element('calendar',CalendarLayer)

private calendar:CalendarLayer



@detect('layers')

@array ()

@element('text_layer',TextLayer)

private text_layer:TextLayer



@detect('layers')

@array ()

@element('decorate_layer',DecorateLayer)

private decorate_layer:DecorateLayer



@detect('layers')

@array ()

@element('photo_layer',PhotoLayer)

private photo_layer:PhotoLayer



public layers: Array < any >;



}
```
There is a simple example:

```js
@alias("user") // use to automatic detection type in  a mixed array, 
class UserModel {
  @property('version')
  private version: string;

  @element('i')
  id: number;

  @element('n')
  name: string;
}

const userXML = '<?xml version="1.0" encoding="utf-8" ?>
<user version="0.1">
    <i>123456</i>
    <n>user-name</n>
    <e>email@xx.com</e>
    <at>1a1b1b3b4c34d234</at>
</user>'

// use toClass to convert plain object to class
const userModel = toClass(userXML, UserModel);
// you will get a class, just like below one
// UserModel {
//   version: '0.1',
//   id: 1234,
//   name: 'name',
// }

const userVO = toPlain(userModel, UserModel);
// you will get a json object, just like below one
// {
//   _attribute: { version: '0.1' },
//   id: 1234,
//   name: 'name',
// }


const outputXML = toXMLString(userModel, UserModel);
// you will get xml like userXML
```

# Installation

```bash
npm install class-converter-ts npm install --save
```

# Methods

### toClass(raw: { [key: stirng]: any }, clazzType: ClassType) / toClasses(raw: { [key: stirng]: any }[], clazzType: ClassType)

convert a XML object to class

```js
const userModel = toClass(userRaw), UserModel);
const userModels = toClasses(userRaws), UserModel);
```

### toPlain(instance: ClassType | { [key: stirng]: any }, clazzType: ClassType) / toPlains(instances: ClassType | { [key: stirng]: any }[], clazzType: ClassType)

convert a plain/class object to rawPlain

```js
const userRaw = toPlain(userModel, UserModel);
const userRaws = toPlains(userModels, UserModel);
```

```js
### toXMLString<T>(instance: any, Clazz: BasicClass<T>, key?: any): any /  toXMLStrings<T>(instances: (T | JosnType)[], Clazz: BasicClass<T>, key?: any): any[]

convert a class to xml string

```

```js
### alias(classAlias: string)
define a model， classAlias will use to set the xml node name when convert class to XML .
model:

@alias("animal")
xml:
<animal>
</animal>
```

```js
### element(originalKey: string, targetClass?: { new (...args: any[]): any }, required = false)

convert a original key to your customized key, like `version => ver`
model:
@property('version')
private ver: string;
xml:
<node version="1.0"/>

```

```js
### property(key: string, clazzType?: any, required = false)

convert a original key to your customized key, like `i => id`
model:
@element('i')
id: number;
xml:
<i>
</i>

```

```js
import { property, deserialize } from 'class-converter-ts';
import moment from 'moment';

class UserEduModel {
  @element('i')
  id: number;

  @element('n')
  name: string;
}

class UserModel {
  @element('i')
  id: number;

  @element('n')
  name: string;

  @element('a', null, false)
  avatarUrl: string;

  @element('e', UserEduModel)
  edu: UserEduModel;
}

export class AdminUserModel extends UserModel {
  @element('r')
  role: number;
}
```

### detect(convertKey: string)
If the node is a mixed object, you need to use the detect keyword to set the object and node name that can be detected, and the parameter convertkey is the array attribute name added to the detected object

### array(dimension?: 1 | 2)

- [optional]dimension dimension of the array, default 1

```js
import { property, deserialize, array } from 'class-converter';
import moment from 'moment';

class UserModel {
  @element('i')
  id: number;

  @element('n')
  name: string;
}

class DepartmentModel {
  @element('i')
  id: number;

  @element('n')
  name: string;

  @array()
  @element('e', UserModel)
  employees: UserModel[];
}
```

### deserialize(deserializer: (value: any, instance: any, origin: any) => any

convert original value to customized data, it only be used when use toClass/toClasses function

```js
import { property, deserialize, toClass } from 'class-converter';

class UserModel {
  @element('i')
  id: number;

  @element('n')
  name: string;

  @deserialize((value: string) => `${value}@xxx.com`)
  @element('m')
  mail: string;
}

const user = toClass(
  {
    i: 1234,
    n: 'name',
    m: 'mail',
  },
  UserModel,
);

// you will get like this
// {
//   id: 1234,
//   name: 'name',
//   mail: 'mail@xxx.com',
// };
```

### serialize(serializer: (value: any, instance: any, origin: any) => any

convert customized value to original value, it only be used when use toPlain/toPlains function

```js
import { property, deserialize, serialize, toPlain } from 'class-converter';

class UserModel {
  @serialize((mail: string) => mail.replace('@xxx.com', ''))
  @deserialize((value: string) => `${value}@xxx.com`)
  @element('e')
  mail: string;
}

const user = toPlain({
  mail: 'mail@xxx.com',
}, UserModel);

// you will get like this
// const user = {
//   e: 'mail@xxx.com',
// };
```
