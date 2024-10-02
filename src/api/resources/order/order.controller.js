import mailer from '../../../mailer';
import { db } from '../../../models';
import { findVendorWithLowestPrice } from '../../../utils';
var Util = require("../../../helpers/Util");
var Sequelize = require("sequelize");
const { Op } = require("sequelize");

var findProductList = (array) => {
    return new Promise((resolve, reject) => {
        db.ProductVariant.findAll({
            attributes: ["id", "productName", "netPrice", "qty"],
            where: {
                productId: {
                    [Op.in]: array
                }
            },
            // include:[{ model: db.ProductVariant, attributes:["id","productName","netPrice"]},{ model: db.productphoto, attributes:["imgUrl"]}]

        })
            .then(list => {
                return Promise.all(list);
            })
            .then(r => {
                resolve(r);
            })
            .catch(err => {
                console.log(err);
                reject(err);
            })
    });
}

var findAddressList = (id) => {
    return new Promise((resolve, reject) => {
        db.Address.findOne({
            where: {
                id: id
            },
        })
            .then(list => {
                return list;
            })
            .then(r => {
                resolve(r);
            })
            .catch(err => {
                console.log(err);
                reject(err);
            })
    });
}

export default {
    /* Add user api start here................................*/
    async index(req, res, next) {
        try {
            const { paymentmethod, deliveryAddress, grandTotal, deliveryId } = req.body;
            let list = JSON.stringify(req.body.product);
            let productList = JSON.parse(list)
            db.customer.findOne({ where: { id: req.user.id } })
                .then(async p => {
                    const t = await db.sequelize.transaction();
                    let orderId = "OD" + Math.floor(Math.random() * Math.floor(Math.random() * Date.now()))
                    if (p.id) {
                        try {
                            if (deliveryAddress) {
                                var address = await db.Address.create({
                                    // orderId: order.id,
                                    custId: req.user.id,
                                    fullname: deliveryAddress.name,
                                    phone: deliveryAddress.phone,
                                    city: deliveryAddress.city,
                                    states: deliveryAddress.states,
                                    StreetAddress: deliveryAddress.StreetAddress,
                                    shipping: deliveryAddress.ShippingAddress,
                                }, { transaction: t })
                            }

                            const order = await db.Order.create({
                                addressId: address ? address.id : parseInt(deliveryId),
                                custId: p.id,
                                number: orderId,
                                grandtotal: grandTotal,
                                paymentmethod: paymentmethod
                            }, { transaction: t })

                            let cartEntries = [];
                            for (var i = 0; i < productList.length; i++) {
                                cartEntries.push({
                                    orderId: order.id,
                                    custId: req.user.id,
                                    addressId: address ? address.id : parseInt(deliveryId),
                                    productId: productList[i].id,
                                    varientId: productList[i].selectedVariant.id,
                                    qty: productList[i].selectedVariant.qty,
                                })
                            }
                            if (cartEntries.length)
                                await db.Cart_Detail.bulkCreate(cartEntries, { transaction: t })
                            await db.OrderNotification.create({
                                orderId: order.id,
                                userId: req.user.id
                            })

                            // find product list in cart

                            let array = []
                            for (var i = 0; i < productList.length; i++) {
                                array.push(productList[i].id)
                            }
                            let list = await findProductList(array, { transaction: t })
                            let addrId = deliveryId ? deliveryId : address.id;
                            let addrdetails = await findAddressList(addrId, { transaction: t })
                            //end
                            let fullName = !deliveryId ? deliveryAddress.name : req.user.firstName
                            await mailer.sendInvoiceForCustomer(req.body, list, addrdetails, fullName, orderId, req.user, { transaction: t })
                            return t.commit();
                        }
                        catch (err) {
                            console.log(err)
                            await t.rollback()
                            throw new RequestError('Error', err);
                        }
                    }
                    return res.status(500).json({ 'errors': ['User is not found'] });
                })
                .then((success) => {
                    // for(const item of productList){
                    //     findVendorWithLowestPrice(item.id).then(({vendor,productList})=>{
                    //         //    console.log({vendor}); 
                    //         mailer.sendEmailToVendor(vendor.email,item.name);
                    //     });
                    // }
                    // sendMailToVendor("");

                    res.status(200).json({ 'success': true });
                })
                .catch(function (err) {
                    console.log(err)
                    res.status(500).json({ 'errors': ['Error adding cart'] });
                });
        }
        catch (err) {
            throw new RequestError(err);
        }
    },

    async getAllOrderList(req, res, next) {
        const arrData = [];
        const query = {};
        query.where = {};
        const whereCond = {};
        whereCond.where = {};

        if(req.body.status){
            whereCond.where.status = req.body.status
        }
        if(req.body.searchString){
            query.where.number = {
                [Op.like] : req.body.searchString
            }
        }
        whereCond.attributes = ["id", "qty", "status", "deliveryDate"]
        const limit = req.body.limit ? Number(req.body.limit) : 10;
        const page = req.body.page ? Number(req.body.page) : 1;
        query.offset = (page - 1) * limit;
        query.limit = limit;

        query.attributes = ["id", 'paymentmethod',"number", "grandtotal", "createdAt"];
        query.order = [["createdAt", "DESC"]];
        query.include = [
          { model: db.Cart_Detail , whereCond,
            include: [
                {
                    model: db.ProductVariant,
                    as: "varient",
                    attributes: ["id", "productId", "productName", "thumbnail",'sellerPrice', 'discount',"netPrice"],
                    include:[
                        { model: db.product, attributes: ["id"], include:[{ model: db.user, as: 'users' , attributes:["id","firstName", "lastName"]}]}
                    ]
                  },
            ]
            }, 
          { model: db.customer, as: 'user' ,attributes: ['id','email']},
          { model: db.Address, as: 'address' }
        ];
        try {
            db.Order.findAndCountAll(query)
            .then((list) => {
                // console.log(JSON.stringify(list))
                if (list) {
                  list.rows.forEach((value) => {
                    const dataList = {
                      id: value.id,
                      payment: value.paymentmethod,
                      OrderNo: value.number,
                      CustomerName: value.address?value.address.fullname: null,
                      shipping: value.address?value.address.shipping: null,
                      phone: value.address?value.address.phone: null,
                      StreetAddress: value.address?value.address.StreetAddress: null,
                      email: value.user?value.user.email: null,
                      OrderDate: value.createdAt,
                      Status: value.name,
                      Total: value.grandtotal,
                      count: value.Cart_Details.length,
                      Items: value.Cart_Details,
                    };
                    arrData.push(dataList);
                  });
        
                  let pages = Math.ceil(list.count / limit);
                  const finalResult = {
                    count: list.count,
                    pages: pages,
                    items: arrData,
                  };
                  var response = Util.getFormatedResponse(false, finalResult, {
                    message: "Success",
                  });
                  res.status(response.code).json(response);
                } else {
                  var response = Util.getFormatedResponse(false, {
                    message: "No found data",
                  });
                  res.status(response.code).json(response);
                }
              });
        }
        catch (err) {
            res.status(500).json({ 'errors': "" + err });
        }
    },
    async statusUpdate(req, res, next) {
        try {
            const { id, status, deliverydate } = req.body;
            db.Cart_Detail.findOne({ where: { id: id } })
                .then(list => {
                    return db.Cart_Detail.update({
                        status: status,
                        deliveryDate: deliverydate ? deliverydate : list.deliverydate
                    }, { where: { id: id } })
                })
                .then((success) => {
                    res.status(200).json({ 'success': true, msg: "Successfully Updated Status" });
                })
                .catch(function (err) {
                    next(err)
                });
        }
        catch (err) {
            res.status(500).json({ 'errors': "" + err });
        }
    },

    async getAllOrderListById(req, res, next) {
        try {
            db.Order.findAll({
                attributes: ["id", "number", "grandtotal"],
                where: { custId: req.user.id },
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: db.Cart_Detail, attributes: ["id", "qty", "status", "deliveryDate"],
                        include: [
                            { model: db.product, as: "product", attributes: ["id", "name"] },
                            { model: db.ProductVariant, as: "varient" },
                            { model: db.productphoto, as: "thumbnail", attributes: ["productId", "imgUrl"] },
                        ]
                    },
                    { model: db.Address }
                ],
            })
                .then(list => {
                    res.status(200).json({ 'success': true, order: list });
                })
                .catch(function (err) {
                    console.log(err)
                    next(err)
                });
        }
        catch (err) {
            console.log(err)
            res.status(500).json({ 'errors': "" + err });
        }
    },
    async getAllOrderStatus(req, res, next) {
        try {
            db.Order.findAll({
                where: { status: req.body.status },
                order: [['createdAt', 'DESC']],
                include: [{ model: db.Address, include: [{ model: db.Cart }] }],
            })
                .then(list => {
                    res.status(200).json({ 'success': true, order: list });
                })
                .catch(function (err) {
                    next(err)
                });
        }
        catch (err) {
            res.status(500).json({ 'errors': "" + err });
        }
    },
    async getAllOrderCount(req, res, next) {
        try {
            db.Cart_Detail.findAll({
                attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('status')), 'total']],
                group: ['status']
            })
                .then(list => {
                    res.status(200).json({ 'success': true, data: list });
                })
                .catch(function (err) {
                    next(err)
                });
        }
        catch (err) {
            res.status(500).json({ 'errors': "" + err });
        }
    },
    async getOrderNotifications(req, res, next) {
        const TODAY_START = new Date().setHours(0, 0, 0, 0);
        const tomorrow = new Date(TODAY_START)
        tomorrow.setDate(tomorrow.getDate() + 1)

        try {
            db.OrderNotification.findAll({
                attributes: ["id", "orderId"],
                where: {
                    createdAt: {
                        [Op.gt]: TODAY_START,
                        [Op.lt]: tomorrow
                    }
                },
                include: [
                    {
                        model: db.Cart_Detail, attributes: ["id", "productId"], as: "details",
                        include: [{
                            model: db.product, as: "product_detail",
                            include: [{ model: db.productphoto, attributes: ["imgurl"] }]
                        }]
                    }
                ],
            })
                .then(list => {
                    res.status(200).json({ 'success': true, data: list, count: list.length });
                })
                .catch(function (err) {
                    next(err)
                });
        }
        catch (err) {
            res.status(500).json({ 'errors': "" + err });
        }
    },

    async getOrderDetailsById(req, res, next) {
        try {
            db.Cart_Detail.findOne({
                attributes: ["id", "qty", "status", "deliveryDate"],
                where: { id: req.body.id, /* custId: req.user.id */ },
                include: [
                    { model: db.Address, as: "address" },
                    { model: db.Order, as: "order", attributes: ["id", "number"] },
                    { model: db.product, as: "product", attributes: ["id", "name"] },
                    { model: db.ProductVariant, as: "varient" },
                    { model: db.productphoto, as: "thumbnail", attributes: ["productId", "imgUrl"] },
                ]
            })
                .then(list => {
                    res.status(200).json({ 'success': true, data: list });
                })
                .catch(function (err) {
                    next(err)
                });
        }
        catch (err) {
            res.status(500).json({ 'errors': "" + err });
        }
    },

    async getOrderDeleteByProduct(req, res, next) {
        let { orderId, cartId, price } = req.body;
        try {
            db.Order.findOne({
                where: { id: orderId, custId: req.user.id },
                include: [{ model: db.Cart_Detail }]
            })
                .then(async list => {
                    const t = await db.sequelize.transaction();
                    if (list) {
                        let newPrice = Math.round(list.grandtotal - price)
                        try {
                            let cart = await db.Cart_Detail.destroy({
                                where: { id: cartId }
                            }, { transaction: t })

                            let order = await db.Order.update({
                                grandtotal: newPrice
                            }, { where: { id: orderId } })

                            return t.commit();
                        }
                        catch (err) {
                            console.log(err)
                            await t.rollback()
                            throw new RequestError('Error', err);
                        }

                    }
                })
                .then(success => {
                    res.status(200).json({ 'success': true, message: "Successfully Deleted Product from list" });
                })

        }
        catch (err) {
            res.status(500).json({ 'errors': "" + err });
        }
    },

    async deleteOrderList(req, res, next) {
        try {
            db.Order.findOne({
                where: { id: req.body.id },
            })
                .then(async list => {
                    return db.Order.destroy({
                        where: { id: list.id }
                    })
                })
                .then(success => {
                    res.status(200).json({ 'success': true, message: "Successfully Deleted Order from list" });
                })

        }
        catch (err) {
            res.status(500).json({ 'errors': "" + err });
        }
    },

    async orderStatusIssue(req, res, next) {
        let { id, orderId, productId, issue, comment } = req.body;
        try {
            db.Order_Details_Status.findOne({
                where: { id: id, custId: req.user.id },
            })
                .then(async list => {
                    if (!list) {
                        return db.Order_Details_Status.create({
                            orderId: orderId,
                            issue: issue,
                            comment: comment,
                        })
                    }
                })
                .then(success => {
                    res.status(200).json({ 'success': true, message: "Successfully add status in the list" });
                })

        }
        catch (err) {
            res.status(500).json({ success: false, message: "Unfortuntely something is wrong" });
        }
    },

    async getOrderCancel(req, res, next) {
        let { cartId, orderId, issue, comment } = req.body;
        try {
            db.Cart_Detail.findOne({
                where: { id: cartId, orderId: orderId, },
            })
                .then(async list => {
                    const t = await db.sequelize.transaction();
                    if (list) {
                        try {
                            await db.Order_Details_Status.create({
                                orderId: orderId,
                                custId: req.user.id,
                                productId: list.productId,
                                status: 0,
                                issue: issue,
                                comment: comment,
                            }, { transaction: t })

                            await db.Cart_Detail.update({
                                status: "cancelRequest",
                                deliveryDate: new Date(),
                            }, { where: { id: list.id } })

                            return t.commit();
                        }
                        catch (err) {
                            console.log(err)
                            await t.rollback()
                            throw new RequestError('Error', err);
                        }

                    }
                })
                .then(success => {
                    res.status(200).json({ 'success': true, message: "Successfully canceled orderlist" });
                })

        }
        catch (err) {
            res.status(500).json({ success: false, message: "Unfortuntely something is wrong" });
        }
    },
}


