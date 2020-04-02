import { deserialize, property, array, serialize } from "../src/decorators";

abstract class AvatarModel {
    @deserialize((value: number) => value * 10)
    @property('i')
    id: number;

    @property('at')
    avatar: string;
    @serialize((value: string) => String(value).replace(/https:\/\/cdn.com\/avatar\/([\d\w]+)\.png$/, '$1'))
    @deserialize((value: string) => `https://cdn.com/avatar/${value}.png`)
    @property('at')
    avatarUrl: string;
}

export class UserModel extends AvatarModel {
    @property('i')
    id: number = 0;

    @property('n')
    name: string;

    @property('e')
    email: string;
}

export class PackageModel {
    @property('i')
    id: number = 0;

    @property('n')
    name: string;

    @property('u', UserModel)
    creator: UserModel;
}

export class DepartmentModel {
    @property('i')
    id: number = 0;

    @property('n')
    name: string;

    @array()
    @property('e', UserModel)
    employees: UserModel[];
}

export class EmptyModel {
    @property('e')
    title: string;

    @property('t')
    timeStamp: number = 0;

    @property('u', UserModel)
    user: UserModel;

    @property('n', null, true)
    name = 'default-name';

    @property('m', null, true)
    mode: number;

    @property('d',DepartmentModel, true)
    depart: DepartmentModel;
}

