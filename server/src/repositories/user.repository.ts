import {
    DefaultCrudRepository,
    juggler,
} from '@loopback/repository';
import {User} from '../models';
import {inject} from '@loopback/core';
import {EmailManager} from "../services";

export type Credentials = {
    email: string;
    password: string;
};

export class UserRepository extends DefaultCrudRepository<
    User,
    typeof User.prototype.id
    > {
    constructor(
        @inject('datasources.mongo') protected datasource: juggler.DataSource,
        @inject('services.email') protected emailService: EmailManager
    ) {
        super(User, datasource);
    }

    async validateEmail(userId: string): Promise<User|null> {
        const user: User|null = await this.findById(userId);
        if (!user)
            return null;
        const newRoles = user.role?.filter((role: string) => {return role !== 'email_not_validated' && role !== 'user'});
        if (newRoles)
            newRoles.push('user');
        await this.updateById(userId, {
            validationToken: undefined,
            role: newRoles
        });
        return this.findById(userId);
    }

    async updatePassword(userId: string, password: string): Promise<User|null> {
        const user: User|null = await this.findById(userId);
        if (!user)
            return null;

        const htmlData: string = await this.emailService.getHtmlFromTemplate("passwordValidateReset", {});
        const textData: string = await this.emailService.getTextFromTemplate("passwordValidateReset", {});

        await this.updateById(userId, {
            password: password,
            resetToken: undefined
        });
        this.emailService.sendMail({
            from: "AREA <noreply@b12powered.com>",
            to: user.email,
            subject: "Password changed",
            html: htmlData,
            text: textData
        }).catch(e => console.log("Failed to deliver password reset validation email: ", e));
        return this.findById(userId);
    }
}