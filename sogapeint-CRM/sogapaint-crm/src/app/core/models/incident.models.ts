// incident.model.ts

export interface Incident {
    _id: string;
    user?: string;
    comment?: string;
    dateAdd?: Date;
    processed?: boolean;
}
