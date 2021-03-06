import {Entity, model, property, hasMany} from '@loopback/repository';
import {Area} from './area.model';

@model({
    settings: {
        strictObjectIDCoercion: true,
        hiddenProperties: ['password', 'validationToken', 'resetToken', 'twoFactorAuthenticationSecret', 'services'],
        indexes: {
            uniqueEmail: {
                keys: {
                    email: 1,
                },
                options: {
                    unique: true,
                },
            },
        },
    },
})
export class User extends Entity {
    @property({
        type: 'string',
        id: true,
        generated: true,
    })
    id?: string;

    @property({
        type: 'string',
        required: true,
    })
    email: string;

    @property({
        type: 'string',
    })
    password?: string;

    @property({
        type: 'array',
        itemType: 'string',
        default: [],
    })
    role?: string[];

    @property({
        type: 'object',
        default: {},
    })
    services?: object;

    @property({
        type: 'array',
        itemType: 'string',
        required: false
    })
    servicesList?: string[];

    @property({
        type: 'string',
        required: false,
    })
    validationToken?: string;

    @property({
        type: 'string',
    })
    resetToken?: string;

    @property({
        type: 'string',
    })
    twoFactorAuthenticationSecret?: string;

    @property({
        type: 'boolean',
        default: false,
    })
    twoFactorAuthenticationEnabled: boolean;

    @property({
        type: 'array',
        itemType: 'object',
        required: false,
        default: []
    })
    authServices?: object[];

    @hasMany(() => Area, {keyTo: 'ownerId'})
    areas: Area[];
    // Define well-known properties here

    // Indexer property to allow additional data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [prop: string]: any;

    constructor(data?: Partial<User>) {
        super(data);
    }
}

export interface UserRelations {
    // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;