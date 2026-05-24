type Creator = {
    id: number;
    is_bot: boolean;
    first_name: string;
    username: string;
}

export class InviteLinkInfo {
    invite_link: string;
    creator: Creator;
    creates_join_request?: boolean;
    is_primary?: boolean;
    is_revoked?: boolean;
    name?: string;
    expire_date?: number;
    member_limit?: number;
    pending_join_request_count?: number;

    constructor(invite_link: string, creator: Creator, creates_join_request?: boolean, is_primary?: boolean, is_revoked?: boolean, name?: string, expire_date?: number, member_limit?: number, pending_join_request_count?: number) {
        this.invite_link = invite_link;
        this.creator = creator;
        this.creates_join_request = creates_join_request;
        this.is_primary = is_primary;
        this.is_revoked = is_revoked;
        this.name = name;
        this.expire_date = expire_date;
        this.member_limit = member_limit;
        this.pending_join_request_count = pending_join_request_count;
    }
}