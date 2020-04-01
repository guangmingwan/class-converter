// eslint-disable-next-line max-classes-per-file
import assert from 'assert';
import { property, deserialize, toClass, toClasses, array } from '../src';

import {describe} from 'mocha';
import path = require("path");

import fs = require("fs");
import sxml = require("sxml");
 
import XML = sxml.XML;
import XMLList = sxml.XMLList;



//import user from './fixtures/user.json';
const user = new XML(fs.readFileSync(path.resolve('tests/fixtures/user.xml'), 'utf8'));
// import users from './fixtures/users.json';
const users:XMLList = new XML(fs.readFileSync(path.resolve('tests/fixtures/users.xml'), 'utf8')).get("u");
console.log("users.size#" + users.size()); // #3
// import pkg from './fixtures/pkg.json';
const pkg = new XML(fs.readFileSync(path.resolve('tests/fixtures/pkg.xml'), 'utf8'));
// import department from './fixtures/department.json';
const department = new XML(fs.readFileSync(path.resolve('tests/fixtures/department.xml'), 'utf8'));
// import empty from './fixtures/empty.json';
const empty = new XML(fs.readFileSync(path.resolve('tests/fixtures/empty.xml'), 'utf8'));



abstract class AvatarModel {
  @deserialize((value: number) => value * 10)
  @property('i')
  id: number;

  @property('at')
  avatar: string;

  @deserialize((value: string) => `https://cdn.com/avatar/${value}.png`)
  @property('at')
  avatarUrl: string;
}

class UserModel extends AvatarModel {
  @property('i')
  id: number = 0;

  @property('n')
  name: string;

  @property('e')
  email: string;
}

class PackageModel {
  @property('i')
  id: number = 0;

  @property('n')
  name: string;

  @property('u', UserModel)
  creator: UserModel;
}

class DepartmentModel {
  @property('i')
  id: number = 0;

  @property('n')
  name: string;

  @array()
  @property('e', UserModel)
  employees: UserModel[];
}

class EmptyModel {
  @property('e')
  title: string;

  @property('t')
  timeStamp: number =0;

  @property('u')
  user: UserModel;

  @property('n', null, true)
  name = 'default-name';

  @property('m', null, true)
  mode: number;
}

describe('toClass / toClasses', () => {
  it('should return UserModel instance', () => {
    const userModel = toClass(user, UserModel);
    //console.log("user",user);
    console.log("userModel",userModel);
    assert(userModel instanceof UserModel);
    assert.deepEqual(userModel, {
      id: 123456,
      name: 'user-name',
      email: 'email@xx.com',
      avatar: '1a1b1b3b4c34d234',
      avatarUrl: 'https://cdn.com/avatar/1a1b1b3b4c34d234.png',
    });
  });

  it('should return array of UserModel instance', () => {
    const userModels = toClasses(users, UserModel);
    userModels.forEach( (u:any) => {
      assert(u instanceof UserModel);
    });
    console.log("userModels",userModels);
    assert.deepEqual(userModels, [
      {
        id: 123451,
        name: 'user-name1',
        email: 'email@xx.com1',
        avatar: '1a1b1b3b4c34d231',
        avatarUrl: 'https://cdn.com/avatar/1a1b1b3b4c34d231.png',
      },
      {
        id: 123452,
        name: 'user-name2',
        email: 'email@xx.com2',
        avatar: '1a1b1b3b4c34d232',
        avatarUrl: 'https://cdn.com/avatar/1a1b1b3b4c34d232.png',
      },
    ]);
  });

  it('should return PackageModel instance', () => {
    const packageModel = toClass(pkg, PackageModel);
    assert(packageModel instanceof PackageModel);
    assert(packageModel.creator instanceof UserModel);
    assert.deepEqual(packageModel, {
      id: 10000,
      name: 'name',
      creator: {
        id: 20000,
        name: 'name1',
        email: 'email1@xx.com',
        avatar: '1a1b1b3b4c34d234',
        avatarUrl: 'https://cdn.com/avatar/1a1b1b3b4c34d234.png',
      },
    });
  });

  it('should return DepartmentModel instance', () => {
    const departmentModel = toClass(department, DepartmentModel);
    assert(departmentModel instanceof DepartmentModel);
    departmentModel.employees.forEach(e => {
      assert(e instanceof UserModel);
    });
    console.log(departmentModel);
    assert.deepEqual(departmentModel, {
      id: 10000,
      name: 'department',
      employees: [
        {
          id: 20001,
          name: 'name1',
          email: 'email1@xx.com',
          avatar: '1a1b1b3b4c34d231',
          avatarUrl: 'https://cdn.com/avatar/1a1b1b3b4c34d231.png',
        },
        {
          id: 20002,
          name: 'name2',
          email: 'email2@xx.com',
          avatar: '1a1b1b3b4c34d232',
          avatarUrl: 'https://cdn.com/avatar/1a1b1b3b4c34d232.png',
        },
      ],
    });
  });

  it('should filter value', () => {
    const emptyModel = toClass(empty, EmptyModel);
    assert(emptyModel instanceof EmptyModel);
    assert.deepEqual(emptyModel, {
      title: 'empty',
      user: null,
      name: 'default-name',
      timeStamp: 1581314281152,
    });
  });
});
