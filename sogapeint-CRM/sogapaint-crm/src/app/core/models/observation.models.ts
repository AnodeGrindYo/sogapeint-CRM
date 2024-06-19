// observation.model.ts

export interface Observation {
    _id: string;
    dateAdd?: Date;
    user?: string;
    comment?: string;
    processed?: boolean;
}
