/**
 * Created by andrew.li on 2018-03-24 16:56
 * Copyright © 2018年 andrew.li  All rights reserved.
 */

const Model = require("./main")
class User extends Model {
    constructor(form={}) {
        super()
    }
    static _fields(form={}) {
        const f = [
            ['username', 'String', form.username || '' ],
            ['password', 'String', form.password || '' ],
            ['role', 'String', form.role || '' ],
            ['note', 'String', form.note || '' ],
            ['avatar', 'String', form.avatar || '' ],
        ]
        const l = super._fields().concat(f)
        return l
    }


}


module.exports = User