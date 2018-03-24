/**
 * Created by andrew.li on 2018-03-24 16:54
 * Copyright © 2018年 andrew.li  All rights reserved.
 */
const log = console.log.bind(console)
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
//debug mode
mongoose.set('debug', true);
const autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);
// database config
const config = require("./../config")

//connect to database
const connectMongo = () => {
    const url = `mongodb://${config.mongodbIp}/${config.mongodbName}`
    const db = mongoose.connect(url, {useMongoClient: true,}).catch(e => {
        throw  e;
    });
    return db
}


class Model {
    static _fields() {
        const f = [
            // [field_name, field_type, field_value]
            ['deleted', 'Boolean', false],
            ['created_time', 'Number', 0],
            ['updated_time', 'Number', 0],
        ]
        return f
    }

    //change _fields like this
    //     // name: {
    //     //     type: String,
    //            default: 0
    //     // },
    // })
    static initSchema() {
        const data = this._fields()
        const schema = {}
        for (let f of data) {
            schema[`${f[0]}`] = {
                'type': f[1],
                'default': `${f[2]}`
            }
        }
        return schema
    }

    static getDocument() {
        const schema = this.initSchema()
        const classname = this.name.toLowerCase()
        const modelschema = new Schema(schema, {
            versionKey: false,
            collection: classname
        });
        modelschema.plugin(autoIncrement.plugin, classname);
        if (this.modelDoc === undefined) {
            // init once
            connectMongo()
            this.modelDoc = mongoose.model(classname, modelschema);
        }
        return this.modelDoc
    }


    /**
     * add doc
     * @param tForm
     * @returns {Promise.<*>}
     */
    static async create(tForm = {}) {
        const form = this._fields(tForm)
        //
        const documents = this.getDocument()
        const models = new documents(form)
        //form-key overwrite default value
        Object.keys(form).forEach((k) => {
            const c = form[k]
            models[`${c[0]}`] = c[2]
        })
        const ts = Date.now()
        models.created_time = ts
        models.updated_time = ts
        //
        await models.save()
        return models
    }


    /**
     * query
     * @param con
     * @returns {Promise}
     */
    static query(con) {
        const documents = this.getDocument()
        return new Promise(function (resolve, reject) {
            var query = documents.find({});
            query.where(con.$where || {});
            // query.sort(con.sort || {});
            // query.or(con.or || []);
            // query.and(con.and || {});
            if (con.pageNum !== undefined && con.pageid !== undefined) {
                query.limit(con.pageNum);
                query.skip(con.pageid)
            }
            query.exec(function (err, docs) {
                if (err === null) {
                    resolve(docs);
                } else {
                    reject(err);
                }
            })
        });
    }


    /**
     * query by key and value
     * @param key
     * @param value
     * @returns {Promise}
     */
    static find(key , value) {
        const documents = this.getDocument()
        const con = {
            key : value
        }
        return new Promise(function (resolve, reject) {
            const query = documents.find({});
            query.where(con.where || {});
            if (con.pageNum !== undefined && con.pageid !== undefined) {
                query.limit(con.pageNum);
                query.skip(con.pageid);
            }
            query.exec(function (err, docs) {
                if (err === null) {
                    resolve(docs);
                } else {
                    reject(err);
                }
            })
        });
    }


    /**
     * find one record
     * @param query
     * @returns {Promise}
     */
    static findOne(query) {
        const documents = this.getDocument()
        return new Promise(function (resolve, reject) {
            documents.findOne(query, function (err, docs) {
                if (err === null) {
                    resolve(docs);
                } else {
                    reject(err);
                }
            });
        });
    }

    /**
     * query all data
     * @returns {Promise}
     */
    static all() {
        const documents = this.getDocument()
        return new Promise(function (resolve, reject) {
            documents.find({}, function (err, docs) {
                if (err === null) {
                    resolve(docs);
                } else {
                    reject(err);
                }
            });
        });
    }


    /**
     * get one record
     * @param formid
     * @returns {Promise.<*>}
     */
    static async get (formid) {
        const data = await this.findOne({_id: formid})
        return data
    }

    /**
     * update records
     * @param query
     * @param form
     */
    static save(query, form) {
        const document = this.getDocument()
        document.update(query, form, function (err) {
            if (err !== null) {
                log(err)
            } else {
                log(`update success`)
            }
        });
    }

    /**
     * update by key
     * @param form
     */
    static saveById(form) {
        const document = this.getDocument()
        document.update({_id: form.id}, form, function (err) {
            if (err !== null) {
                log(err)
            } else {
                log(`update success！`)
            }
        });
    }

    /**
     * batch update records
     * @param qurey
     * @param form
     */
    static saveAll(qurey, form) {
        const document = this.getDocument()
        document.updateMany(qurey, form, function (err) {
            if (err !== null) {
                log(err)
            } else {
                log(`update all success！`)
            }
        });
    }


    /**
     * delete records
     * @param formid
     */
    static remove(formid) {
        const document = this.getDocument()
        document.remove({id: formid}, function (err) {
            if (err !== null) {
                log(err)
            } else {
                log(`delete ${formid} success！`)
            }
        });
    }

    toString() {
        const s = JSON.stringify(this, null, 2)
        return s
    }


    /**
     * update includes frozenKeys
     * @param form
     * @param frozenKeys
     * @returns {Promise.<void>}
     */
    static async updateFilter(form , frozenKeys=[]) {
        frozenKeys.push(['created_time' ,'id'])
        const id = Number(form.id)
        log('debug update id: ', id)
        const newkeys = {}
        Object.keys(form).forEach((k) => {
            if (!frozenKeys.includes(k)) {
                newkeys[k] = form[k]
            }
        })
        newkeys.updated_time = Date.now()
        await this.saveById(newkeys)
    }
}


module.exports = Model