export interface OutlookSubscriptionResource {
    changeType: string;
    notificationUrl: string;
    resource: string;
    expirationDateTime: string;
    clientState?: string;
    id: string;
    applicationId: string;
    creatorId: string;
    latestSupportedTlsVersion: string;
}

export interface OutlookEmailBodyResource {
    content: string;
    contentType: string; //can be 'text' or 'html'
}

export interface OutlookEmailAddressResource {
    address: string;
    name: string;
}

export interface OutlookEmailSenderResource {
    emailAddress: OutlookEmailAddressResource;
}

export interface OutlookEmailResource {
    body: OutlookEmailBodyResource;
    id: string;
    sender: OutlookEmailSenderResource;
    subject: string;
}