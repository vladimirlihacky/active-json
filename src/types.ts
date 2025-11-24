export type Matcher<T> = (t: T) => boolean;
export const MatchAll = () => true; 
export const MatchNothing = () => false;

export type Updater<T> = (t: T) => T;

export type Maybe<T> = T | null | undefined;
export type CreateData<T> = Partial<Omit<T, "id">>;

export interface BaseModel {
    id: number;
}

export interface DataSource {
    findOne<T extends BaseModel>(entity: new () => T, matching: Matcher<T>): Promise<Maybe<T>>;
    updateOne<T extends BaseModel>(entity: new () => T, matching: Matcher<T>, update: Updater<T>): Promise<Maybe<T>>;
    createOne<T extends BaseModel>(entity: new () => T, data: CreateData<T>): Promise<Maybe<T>>;
    deleteOne<T extends BaseModel>(entity: new () => T, matching: Matcher<T>): Promise<Maybe<T>>;
    find<T extends BaseModel>(entity: new () => T, matching: Matcher<T>): Promise<T[]>;
    update<T extends BaseModel>(entity: new () => T, matching: Matcher<T>, update: Updater<T>): Promise<T[]>;
    create<T extends BaseModel>(entity: new () => T, data: CreateData<T>[]): Promise<T[]>;
    delete<T extends BaseModel>(entity: new () => T, matching: Matcher<T>): Promise<T[]>;
}

