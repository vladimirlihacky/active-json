import type { BaseModel, CreateData, DataSource, Matcher, Maybe, Updater } from "./types";


export class Model implements BaseModel {
    private static dataSource: DataSource;

    public static setDataSource(dataSource: DataSource) {
        Model.dataSource = dataSource;
    }

    public static findOne<T extends Model>(this: new () => T, matching: Matcher<T>): Promise<Maybe<T>> {
        return Model.dataSource.findOne(this, matching);
    }

    public static find<T extends Model>(this: new () => T, matching: Matcher<T>): Promise<T[]> {
        return Model.dataSource.find(this, matching);
    }

    public static updateOne<T extends Model>(this: new () => T, matching: Matcher<T>, update: Updater<T>): Promise<Maybe<T>> {
        return Model.dataSource.updateOne(this, matching, update);
    }

    public static update<T extends Model>(this: new () => T, matching: Matcher<T>, update: Updater<Omit<T, "serialize">>): Promise<T[]> {
        return Model.dataSource.update(this, matching, update);
    }

    public static createOne<T extends Model>(this: new () => T, data: CreateData<T>): Promise<Maybe<T>> {
        return Model.dataSource.createOne(this, data);
    }

    public static create<T extends Model>(this: new () => T, data: CreateData<T>[]): Promise<T[]> {
        return Model.dataSource.create(this, data);
    }

    public static deleteOne<T extends Model>(this: new () => T, matching: Matcher<T>): Promise<Maybe<T>> {
        return Model.dataSource.deleteOne(this, matching);
    }

    public static delete<T extends Model>(this: new () => T, matching: Matcher<T>): Promise<T[]> {
        return Model.dataSource.delete(this, matching);
    }

    public id: number = -1;
    public createdAt: number = Date.now();

    public static validate(data: any): Boolean {
        return true;
    };

    public serialize(): string {
        return JSON.stringify(this);
    }

    public static deserialize<T extends Model>(this: new () => T, str: string): T {
        const data = JSON.parse(str);
        const instance = new this();
        Object.assign(instance, data);
        return instance;
    }
}