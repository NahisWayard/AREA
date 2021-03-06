import {RestBindings, Response, get, Request} from '@loopback/rest';
import {inject} from '@loopback/context';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
const readdir = util.promisify(fs.readdir);

class ConfigShema {
    name: string;
    description: string;
    type: string;
    required: boolean;
    default?: number|string|boolean;
}

class Placeholder {
    name: string;
    description: string;
}

class Action {
    name: string;
    displayName: string;
    description: string;
    configSchema: ConfigShema[];
    placeholders: Placeholder[];
}

class Reaction {
    name: string;
    displayName: string;
    description: string;
    configSchema: ConfigShema[];
}

class Service {
    name: string;
    displayName: string;
    description: string;
    icon: string;
    color: string;
    actions: Array<Action>;
    reactions: Array<Reaction>;
}

export class AboutController {
    constructor(
        @inject(RestBindings.Http.REQUEST) protected request: Request,
        @inject(RestBindings.Http.RESPONSE) protected response: Response
    ) {}

    @get('/about.json', {
        responses: {
            '200': {
                description: 'Return a json file containing informations'
            }
        }
    })
    async about(): Promise<Object> {
        return {
            client: {
                host: this.request.ip
            },
            server: {
                //EPITECH MANDATORY
                // eslint-disable-next-line @typescript-eslint/camelcase
                current_time: Math.floor(Date.now() / 1000),
                services: await this.parseServices()
            }
        }
    }

    async parseServices(): Promise<Array<Service>> {
        const services: Array<Service> = [];
        const servicesPath = path.join(__dirname, '../area-services/');
        let serviceDirs: Array<string> = [];
        try {
            serviceDirs = await readdir(servicesPath);
        } catch (e) {
            console.error(`Unable to scan directory ${servicesPath}: ${e}`);
            return services;
        }
        for (const serviceName of serviceDirs) {
            if (serviceName === "example")
                continue;
            const newService = new Service;
            const serviceControllerPath = path.join(servicesPath, serviceName, 'controller.js');
            try {
                const module = await import(serviceControllerPath);
                if (!module.default) {
                    console.error("The service controller class is not exported as default in " + serviceName)
                }
                const controller = module.default;
                if (!controller.getConfig) {
                    console.error("Static method getConfig not found in " + serviceName + " controller");
                    continue;
                }
                const config = await controller.getConfig();
                newService.name = serviceName;
                newService.displayName = config.displayName;
                newService.description = config.description;
                newService.icon = config.icon;
                newService.color = config.color;
                newService.actions = [];
                newService.reactions = [];
            } catch (e){
                console.error(`${serviceControllerPath} module not found.`);
            }

            const serviceActionsPath = path.join(servicesPath, serviceName, 'actions');
            let actionDirs: Array<string> = [];
            try {
                actionDirs = await readdir(serviceActionsPath);
                // eslint-disable-next-line no-empty
            } catch (e) {
            }
            for (const actionName of actionDirs) {
                if (!fs.lstatSync(path.join(serviceActionsPath, actionName)).isDirectory())
                    continue;
                const newAction = new Action;
                const actionControllerPath = path.join(serviceActionsPath, actionName, 'controller.js');
                try {
                    const module = await import(actionControllerPath);
                    if (!module.default) {
                        console.error("The service controller class is not exported as default in " + serviceName + ' (action: ' + actionName + ')');
                    }
                    const controller = module.default;
                    if (!controller.getConfig) {
                        console.error("Static method getConfig not found in " + serviceName + " controller (action: " + actionName + ')');
                        continue;
                    }
                    const config = await controller.getConfig();
                    newAction.name = actionName;
                    newAction.displayName = config.displayName;
                    newAction.description = config.description;
                    newAction.configSchema = config.configSchema;
                    newAction.placeholders = config.placeholders;
                } catch (e) {
                    if (e.code !== 'MODULE_NOT_FOUND') {
                        console.error('Error ', e.code, ' while loading ', actionControllerPath);
                        continue;
                    }
                    console.error(`ActionController could not be found in ${actionControllerPath}`);
                    continue;
                }
                newService.actions.push(newAction);
            }

            const serviceReactionsPath = path.join(servicesPath, serviceName, 'reactions');
            let reactionDirs: Array<string> = [];
            try {
                reactionDirs = await readdir(serviceReactionsPath);
                // eslint-disable-next-line no-empty
            } catch (e) {
            }
            for (const reactionName of reactionDirs) {
                if (!fs.lstatSync(path.join(serviceReactionsPath, reactionName)).isDirectory())
                    continue;
                const newReaction = new Reaction;
                const reactionControllerPath = path.join(serviceReactionsPath, reactionName, 'controller.js');
                try {
                    const module = await import(reactionControllerPath);
                    const controller = module.default;
                    if (!controller)
                        console.error("The service controller class is not exported as default in " + serviceName + ' (reaction: ' + reactionName + ')');
                    const config = await controller.getConfig();
                    newReaction.name = reactionName;
                    newReaction.displayName = config.displayName;
                    newReaction.description = config.description;
                    newReaction.configSchema = config.configSchema;
                } catch (e) {
                    if (e.code !== 'MODULE_NOT_FOUND') {
                        console.error('Error ', e.code, ' while loading ', reactionControllerPath);
                        continue;
                    }
                    console.error(`ReactionController could not be found in ${reactionControllerPath}`);
                    continue;
                }
                newService.reactions.push(newReaction);
            }

            services.push(newService);
        }
        return services;
    }
}
