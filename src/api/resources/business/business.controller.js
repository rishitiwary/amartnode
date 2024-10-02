import { db } from '../../../models';

export default {
    async getAllBill(req, res, next) {
        db.Cart_Detail.findAll({
            order: [['createdAt', 'DESC']],
            attributes: ["id", "qty", "deliveryDate", "status"],
            where: { status: 'delivered' },
            include: [
                { model: db.Order, as: 'order', attributes:["id","number","grandtotal"] },
                { model: db.productphoto, as: 'thumbnail' }, 
                { model: db.ProductVariant, as: 'varient' }
            ],
        })
            .then(list => {
                if (list) {
                    let cartEntries = [];
                    for (var i = 0; i < list.length; i++) {
                        cartEntries.push({
                            orderNumber: list[i].order ? list[i].order.number :'',
                            grandTotal: list[i].order ? list[i].order.grandtotal :'',
                            thumbnail: list[i].thumbnail ? list[i].thumbnail.imgUrl:'',
                            productName: list[i].varient.productName,
                            qty: list[i].qty,
                            status: list[i].status,
                            distributorPrice: list[i].varient.distributorPrice,
                            marginPrice: list[i].varient.marginPrice,
                            distributorPrice: list[i].varient.distributorPrice,
                            buyerPrice: list[i].varient.buyerPrice,
                            sellerPrice: list[i].varient.buyerPrice,
                            discount: list[i].varient.discount,
                            netPrice: list[i].varient.netPrice,
                            profit: Math.round(list[i].varient.netPrice - list[i].varient.buyerPrice)
                            
                        })
                    }
                    res.status(200).json({ success: true, data: cartEntries });
                }
            })
            .catch(err => {
                console.log(err)
                return res.status(500).json({ success: false, msg: err });
            })
    },


}




