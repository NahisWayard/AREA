import {Entity, model, property, hasMany} from '@loopback/repository';
import {AreaOption} from './area-option.model';

@model({settings: {strict: false, strictObjectIDCoercion: true}})
export class Reaction extends Entity {
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
    serviceReaction: string;
    @property({
        type: 'string',
    })
    areaId?: string;

    @hasMany(() => AreaOption)
    options: AreaOption[];
    // Define well-known properties here

    // Indexer property to allow additional data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [prop: string]: any;

    constructor(data?: Partial<Reaction>) {
        super(data);
    }
}

export interface ReactionRelations {
    // describe navigational properties here
}

export type ReactionWithRelations = Reaction & ReactionRelations;
