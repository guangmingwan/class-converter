# class-converter-ts

class converter for typescript is a transformer to deserializable xml to typescript class and serializable class to xml.
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
const userModel = toClass(new XML(userRaw), UserModel);
const userModels = toClasses(new XMLList(userRaws), UserModel);
```

### toPlain(instance: ClassType | { [key: stirng]: any }, clazzType: ClassType) / toPlains(instances: ClassType | { [key: stirng]: any }[], clazzType: ClassType)

convert a plain/class object to rawPlain

```js
const userRaw = toPlain(userModel, UserModel);
const userRaws = toPlains(userModels, UserModel);
```

### property(key: string, clazzType?: any, required = false)

convert a original key to your customized key, like `n => name`

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
