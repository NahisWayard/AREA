import {applyPlaceholders, OperationStatus, WorkableObject} from "../../../services-interfaces";
import {Context} from "@loopback/context";
import {ReactionRepository, UserRepository} from "../../../repositories";
import {Reaction} from "../../../models";
import ServiceController from "../controller";
import {TokensResponse} from "../interfaces";
import {YoutubeHelper} from "../YoutubeHelper";
import {google} from "googleapis";

interface RateReactionOptions {
    userId: string,
    video: string,
    rate: string
}

export enum RateEnum {
    LIKE = "like",
    DISLIKE = "dislike",
    UNRATED = "none"
}

export class RateReactionHelper {
    static async trigger(params: WorkableObject): Promise<void> {
        const reactionOptions: RateReactionOptions = params.reactionOptions as RateReactionOptions;
        const preparedData: TokensResponse = params.reactionPreparedData as TokensResponse;
        const video = applyPlaceholders(reactionOptions.video, params.actionPlaceholders);

        const googleOAuthClient = YoutubeHelper.getAuthClient();
        googleOAuthClient.setCredentials({
            // eslint-disable-next-line @typescript-eslint/camelcase
            refresh_token: preparedData.refresh_token,
            // eslint-disable-next-line @typescript-eslint/camelcase
            access_token: preparedData.access_token,
            // eslint-disable-next-line @typescript-eslint/camelcase
            token_type: preparedData.token_type,
        });
        const youtube = google.youtube({
            version: 'v3',
            auth: googleOAuthClient
        });

        try {
            await youtube.videos.rate({
                id: video,
                rating: reactionOptions.rate
            });
        } catch (e) {
            console.debug(`Failed to rate video`, e.response.data.error.code, e.response.data.error.message);
            if (e.response.data) {
                for (const err of e.response.data.error.errors)
                    console.log(err);
            }
            return;
        }
    }

    static async prepareData(reactionId: string, ctx: Context): Promise<object> {
        let reactionRepository : ReactionRepository | undefined = undefined;
        let userRepository : UserRepository | undefined = undefined;
        try {
            reactionRepository = await ctx.get('repositories.ReactionRepository');
            userRepository = await ctx.get('repositories.UserRepository');
        } catch (e) {
            throw new Object({success: false, error: "Failed to resolve repositories", detail: e});
        }
        if (!reactionRepository || !userRepository) {
            throw new Object({success: false, error: "Failed to resolve repositories"});
        }
        const reaction: Reaction = await reactionRepository.findById(reactionId);
        const reactionConfig : RateReactionOptions = reaction.options as RateReactionOptions;

        let tokens: TokensResponse | undefined = undefined;
        try {
            tokens = await userRepository.getServiceInformation(reactionConfig.userId, ServiceController.serviceName) as TokensResponse;
        } catch (e) {
            throw new Object({ success: false, error: `Failed to resolve ${ServiceController.serviceName} token`, details: e });
        }
        if (!tokens) {
            throw new Object({ success: false, error: `Failed to resolve ${ServiceController.serviceName} token` });
        }
        return tokens;
    }

    static async createReaction(userId: string, reactionConfig: Object, ctx: Context, rate: RateEnum): Promise<OperationStatus> {
        const rateReactionConfig : RateReactionOptions = reactionConfig as RateReactionOptions;
        if (!rateReactionConfig.video) {
            return {success: false, error: "Missing video id in config"};
        }

        return {
            success: true,
            options: {
                userId: userId,
                video: rateReactionConfig.video,
                rate: rate
            }
        }
    }

    static async updateReaction(reactionId: string, oldReactionConfig: Object, newReactionConfig: Object, ctx: Context, rate: RateEnum): Promise<OperationStatus> {
        const newRateReactionConfig : RateReactionOptions = newReactionConfig as RateReactionOptions;
        if (!newRateReactionConfig.video) {
            return {success: false, error: "Missing video id in config"};
        }
        const oldForkReactionConfig : RateReactionOptions = oldReactionConfig as RateReactionOptions;
        if (!oldForkReactionConfig.video || !oldForkReactionConfig.rate || !oldForkReactionConfig.userId) {
            return {success: false, error: "Error with stored config please contact area help team."};
        }
        return {
            success: true,
            options: {
                userId: oldForkReactionConfig.userId,
                video: newRateReactionConfig.video,
                rate: rate
            }
        };
    }

    static async deleteReaction(reactionId: string, reactionConfig: Object, ctx: Context): Promise<OperationStatus> {
        return {
            success: true,
            options: reactionConfig
        }
    }
}