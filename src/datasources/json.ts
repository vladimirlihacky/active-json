import { type DataSource, type Maybe, type Matcher, type Updater, type CreateData, type BaseModel } from "../types"
import { writeFile, readFile } from "node:fs/promises"
import { existsSync } from "node:fs";

export class JsonDataSource implements DataSource {
    private filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    private async readData(): Promise<any> {
        if (!existsSync(this.filePath)) {
            return {
                __metadata: {
                    lastIds: {}
                }
            };
        }
        const data = await readFile(this.filePath, 'utf-8');
        const parsed = JSON.parse(data || '{}');
        
        if (!parsed.__metadata) {
            parsed.__metadata = { lastIds: {} };
        }
        if (!parsed.__metadata.lastIds) {
            parsed.__metadata.lastIds = {};
        }
        return parsed;
    }

    private async writeData(data: any): Promise<void> {
        await writeFile(this.filePath, JSON.stringify(data, null, 2));
    }

    private getEntityName<T>(entity: new () => T): string {
        return entity.name;
    }

    private async getNextId<T>(entity: new () => T): Promise<number> {
        const data = await this.readData();
        const entityName = this.getEntityName(entity);

        if (!data.__metadata.lastIds[entityName]) {
            data.__metadata.lastIds[entityName] = 1;
        } else {
            data.__metadata.lastIds[entityName]++;
        }

        await this.writeData(data);
        return data.__metadata.lastIds[entityName];
    }

    private async getEntities<T>(entity: new () => T): Promise<T[]> {
        const data = await this.readData();
        const entityName = this.getEntityName(entity);
        return (data[entityName] || []).map((item: any) => {
            return (entity as any).deserialize(JSON.stringify(item));
        });
    }

    private async saveEntities<T extends BaseModel>(entity: new () => T, entities: T[]): Promise<void> {
        const data = await this.readData();
        const entityName = this.getEntityName(entity);

        const maxId = entities.reduce((max, e) => Math.max(max, e.id), 0);
        if (!data.__metadata.lastIds[entityName] || data.__metadata.lastIds[entityName] < maxId) {
            data.__metadata.lastIds[entityName] = maxId;
        }

        data[entityName] = entities.map(e => {
            const obj: any = {};
            Object.keys(e).forEach(key => {
                obj[key] = (e as any)[key];
            });
            return obj;
        });

        await this.writeData(data);
    }

    async findOne<T>(entity: new () => T, matching: Matcher<T>): Promise<Maybe<T>> {
        const entities = await this.getEntities(entity);
        return entities.find(matching) || null;
    }

    async find<T>(entity: new () => T, matching: Matcher<T>): Promise<T[]> {
        const entities = await this.getEntities(entity);
        return entities.filter(matching);
    }

    async updateOne<T extends BaseModel>(entity: new () => T, matching: Matcher<T>, update: Updater<T>): Promise<Maybe<T>> {
        const entities = await this.getEntities(entity);
        
        for (let i = 0; i < entities.length; i++) {
            const instance = entities[i] as T; 

            if (matching(instance)) {
                entities[i] = update(instance);
                await this.saveEntities(entity, entities);
                return entities[i];
            }
        }

        return null;
    }

    async update<T extends BaseModel>(entity: new () => T, matching: Matcher<T>, update: Updater<T>): Promise<T[]> {
        const entities = await this.getEntities(entity);
        const updated: T[] = [];

        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i] as T;

            if (matching(entity)) {
                entities[i] = update(entity);
                updated.push(entity);
            }
        }

        if (updated.length > 0) {
            await this.saveEntities(entity, entities);
        }

        return updated;
    }

    async createOne<T extends BaseModel>(entity: new () => T, data: CreateData<T>): Promise<Maybe<T>> {
        const instance = new entity() as T;
        const nextId = await this.getNextId(entity);

        Object.assign(instance, { ...data, id: nextId, createdAt: Date.now() });
        const entities = await this.getEntities(entity);
        entities.push(instance);
        await this.saveEntities(entity, entities);

        return instance;
    }

    async create<T extends BaseModel>(entity: new () => T, data: CreateData<T>[]): Promise<T[]> {
        const instances: T[] = [];
        const entities = await this.getEntities(entity);

        for (const item of data) {
            const instance = new entity();
            const nextId = await this.getNextId(entity);
            Object.assign(instance, { ...item, id: nextId, createdAt: Date.now() });
            instances.push(instance);
            entities.push(instance);
        }

        if (instances.length > 0) {
            await this.saveEntities(entity, entities);
        }

        return instances;
    }

    async deleteOne<T extends BaseModel>(entity: new () => T, matching: Matcher<T>): Promise<Maybe<T>> {
        const entities = await this.getEntities(entity);
        
        for (let i = 0; i < entities.length; i++) {
            if (matching(entities[i] as T)) {
                const deleted = entities[i];
                entities.splice(i, 1);
                await this.saveEntities(entity, entities);
                return deleted;
            }
        }

        return null;
    }

    async delete<T extends BaseModel>(entity: new () => T, matching: Matcher<T>): Promise<T[]> {
        const entities = await this.getEntities(entity);
        const toDelete: T[] = [];
        const toKeep: T[] = [];

        for (const e of entities) {
            if (matching(e)) {
                toDelete.push(e);
            } else {
                toKeep.push(e);
            }
        }

        if (toDelete.length > 0) {
            await this.saveEntities(entity, toKeep);
        }

        return toDelete;
    }
}