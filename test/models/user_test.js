/**
 * Created by andrew.li on 2018-03-24 17:06
 * Copyright © 2018年 andrew.li  All rights reserved.
 */
const User = require("./../../models/user")
const log = console.log.bind(console)
const test = async () => {
    const self = User
    ////1、query all
    // const d = await self.all()
    // log("all docs： ",d)

    //// 2、findone
    // const data = await self.get(1)
    // log("get one： ",data)

    //// 3、save
    // const data = await self.get(1)
    // log('before: ', data)
    // data.password = 1238888
    // data.note = 666
    // await self.saveById(data)

    //// 4、add
    // const fields = {
    //     note: 'andrew4',
    //     role: 'andrew4',
    //     password: '1234',
    //     username: '1234',
    // }
    // await self.create(fields)



}

if (require.main === module) {
    test()
}
