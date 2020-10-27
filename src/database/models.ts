import { nanoid } from 'nanoid'

const createModel = (db: any, table: any) => ({
    findOne(filter = {}){
        if (!filter) {
            return db.get(table)
                .head()
                .value()
        }
        return db.get(table)
            .find(filter)
            .value()
    },
    findMany: (filter ?: any) => {
        if (!filter) {
            return db.get(table)
                .orderBy(['createdAt'], ['desc'])
                .value()
        }
        return db.get(table)
            .find(filter)
            .orderBy(['createdAt'], ['desc'])
            .value()
    },
    findAll: () => {
        return db.get(table)
            .orderBy(['createdAt'], ['desc'])
            .value()
    },
    updateOne: (filter: {}, update: any) => {
        const match = db.get(table)
            .find(filter)
            .value()

        db.get(table)
            .find(filter)
            .assign(update)
            .write()

        return db.get(table)
            .find({id: match.id})
            .value()
    },
    remove: (filter: any) => {
        return db.get(table)
            .remove(filter)
            .write()
    },
    createOne: (fields: any) => {
        const item = {...fields, createdAt: Date.now(), id: nanoid(20)}
        db.get(table)
            .push(item)
            .write()

        return db.get(table).find({id: item.id}).value()
    },
    createMany: (toCreate: any[]) => {
        const manyToCreate = (Array.isArray(toCreate) ?
            toCreate :
            [toCreate]).map(item => ({
            ...item, createdAt: Date.now(), id: nanoid(20)
        }))

        return db.get(table)
            .push(...manyToCreate)
            .write()
    }
})
export default createModel
