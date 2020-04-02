import { deserialize, element,property, array, serialize } from "../src/decorators";

abstract class AvatarModel {
    @deserialize((value: number) => value * 10)
    @element('i')
    id: number;

    @element('at')
    avatar: string;
    @serialize((value: string) => String(value).replace(/https:\/\/cdn.com\/avatar\/([\d\w]+)\.png$/, '$1'))
    @deserialize((value: string) => `https://cdn.com/avatar/${value}.png`)
    @element('at')
    avatarUrl: string;
}

export class UserModel extends AvatarModel {
    @property('id', true)
    node_id:string;

    @element('i')
    id: number = 0;

    @element('n')
    name: string;

    @element('e')
    email: string;
}

export class PackageModel {
    @element('i')
    id: number = 0;

    @element('n')
    name: string;

    @element('u', UserModel)
    creator: UserModel;
}

export class DepartmentModel {
    @element('i')
    id: number = 0;

    @element('n')
    name: string;

    @array()
    @element('e', UserModel)
    employees: UserModel[];
}

export class EmptyModel {
    @element('e')
    title: string;

    @element('t')
    timeStamp: number = 0;

    @element('u', UserModel)
    user: UserModel;

    @element('n', null, true)
    name = 'default-name';

    @element('m', null, true)
    mode: number;

    @element('d',DepartmentModel, true)
    depart: DepartmentModel;
}

