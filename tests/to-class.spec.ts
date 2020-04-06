// eslint-disable-next-line max-classes-per-file
import assert from 'assert';
import { property, deserialize, toClass, toClasses, array, toXMLDocument } from '../src';

import {describe} from 'mocha';
import path = require("path");

import fs = require("fs");

import { UserModel, PackageModel, DepartmentModel, EmptyModel } from './models.spec';
import { mylog } from '../src/to-log';

//import user from './fixtures/user.json';
const user = fs.readFileSync(path.resolve('tests/fixtures/user.xml'), 'utf8');
// import users from './fixtures/users.json';
const users:any = fs.readFileSync(path.resolve('tests/fixtures/users.xml'), 'utf8');
// import pkg from './fixtures/pkg.json';
const pkg = fs.readFileSync(path.resolve('tests/fixtures/pkg.xml'), 'utf8');
// import department from './fixtures/department.json';
const department = fs.readFileSync(path.resolve('tests/fixtures/department.xml'), 'utf8');
// import empty from './fixtures/empty.json';
const empty = fs.readFileSync(path.resolve('tests/fixtures/empty.xml'), 'utf8');




describe('toClass / toClasses', () => {
  it('should return UserModel instance', () => {
    const userModel = toClass(user, UserModel);
    //mylog("user",user);
    mylog("userModel",userModel);
    assert(userModel instanceof UserModel);
    assert.deepEqual(userModel, {
      id: 123456,
      name: 'user-name',
      email: 'email@xx.com',
      avatar: '1a1b1b3b4c34d234',
      avatarUrl: 'https://cdn.com/avatar/1a1b1b3b4c34d234.png',
    });
  });

  // it('should return array of UserModel instance', () => {
  //   var xml = toXMLDocument(users);
  //   var arrayElement = xml[0].children || xml[0].childNodes
  //   console.log(arrayElement)
  //   const userModels = toClasses(arrayElement, UserModel);
  //   userModels.forEach( (u:any) => {
  //     assert(u instanceof UserModel);
  //   });
  //   mylog("userModels",userModels);
  //   assert.deepEqual(userModels, [
  //     {
  //       id: 123451,
  //       name: 'user-name1',
  //       email: 'email@xx.com1',
  //       avatar: '1a1b1b3b4c34d231',
  //       avatarUrl: 'https://cdn.com/avatar/1a1b1b3b4c34d231.png',
  //       node_id: 'abc'
  //     },
  //     {
  //       id: 123452,
  //       name: 'user-name2',
  //       email: 'email@xx.com2',
  //       avatar: '1a1b1b3b4c34d232',
  //       avatarUrl: 'https://cdn.com/avatar/1a1b1b3b4c34d232.png',
  //       node_id: 'cba'
  //     },
  //   ]);
  // });

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
    mylog(departmentModel);
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
    mylog("emptyModel",emptyModel.depart.employees)
    assert(emptyModel instanceof EmptyModel);
    assert.deepEqual(emptyModel, {
      title: 'empty',
      name: 'default-name',
      timeStamp: 1581314281152,
      depart:  {
        employees: [
           {
            avatar: '1a1b1b3b4c34d231',
            avatarUrl: 'https://cdn.com/avatar/1a1b1b3b4c34d231.png',
            email: 'email1@xx.com',
            id: 20001,
            name: 'name1'
          }
        ],
        id: 20002,
        name: 'name2'
      },
    });
  });
});
