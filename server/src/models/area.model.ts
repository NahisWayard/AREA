import {Entity, model, property, hasMany, hasOne, belongsTo} from '@loopback/repository';
import {Reaction} from './reaction.model';
import {Action} from "./action.model";
import {User} from "./user.model";

@model({settings: {strictObjectIDCoercion: true}})
export class Area extends Entity {
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
    name: string;

    @property({
        type: 'boolean',
        required: true,
    })
    enabled: boolean;

    @belongsTo(() => User, {name: 'user', keyTo: 'email'})
    ownerId?: string;

    @property({
        type: 'object',
        default: {},
        required: false
    })
    data?: object;

    @hasMany(() => Reaction, {keyTo: 'areaId'})
    reactions: Reaction[];

    @hasOne(() => Action, {keyTo: 'areaID'})
    action?: Action;
    // Define well-known properties here

    // Indexer property to allow additional data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [prop: string]: any;

    constructor(data?: Partial<Area>) {
        super(data);
    }
}

export interface AreaRelations {
    // describe navigational properties here
}

export type AreaWithRelations = Area & AreaRelations;
