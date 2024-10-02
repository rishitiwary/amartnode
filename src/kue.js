import kue from "kue";
import { db } from "./models";
import config from "./config";
const { Op } = require("sequelize");

export var queue = kue.createQueue({
  prefix: "q",
  redis: {
    host: config.redis.host,
    port: config.redis.port,
    auth: config.redis.password,
  },
});
let getTargetProduct = (targets) => {
  var targetProduct = [];
  for (var i = 0; targets && i < targets.length; i++) {
    targetProduct.push(targets[i].id);
  }
  return targetProduct;
};
export default {
  init: () => {
    queue.process("img-upload", function (job, done) {
      Promise.all([
        db.productphoto.bulkCreate(job.data.attachmentEntries),
        db.productphoto.destroy({
          where: {
            id: job.data.productId,
          },
        }),
      ])
        .then((r) => {
          done(true);
        })
        .catch((err) => {
          console.log("error - " + err);
          done(false);
        });
    });
    queue.process("product-update", (job, done) => {
      const targets = job.data.productList;
      const discount = job.data.discount;
      const targetProduct = getTargetProduct(targets);
      db.ProductVariant.findAll({
        attributes: [
          "id",
          "productCode",
          "productId",
          "distributorPrice",
          "buyerPrice",
          "qty",
          "sellerPrice",
        ],
        distinct: true,
        where: {
          productId: {
            [Op.in]: targetProduct,
          },
        },
      })
        .then(async (varient) => {
          const t = await db.sequelize.transaction();
          try {
            let itemEntries = [];
            for (var i = 0; i < varient.length; i++) {
              const discountPer = discount;
              const discountPrice = Math.round(
                (varient[i].distributorPrice * discountPer) / 100
              );
              const total = Math.round(
                varient[i].distributorPrice - discountPrice
              );
              const netPrice = Math.round(
                varient[i].distributorPrice - discountPrice
              );
              itemEntries.push({
                distributorPrice: varient[i].distributorPrice,
                buyerPrice: varient[i].buyerPrice,
                qty: varient[i].qty,
                productId: varient[i].productId,
                id: varient[i].id,
                productCode: varient[i].productCode,
                discount: discountPrice,
                discountPer: discountPer,
                total: total,
                netPrice: netPrice,
              });
            }
            if (itemEntries.length)
              await db.ProductVariant.bulkCreate(
                itemEntries,
                {
                  updateOnDuplicate: Object.keys(itemEntries[0]),
                },
                {
                  transaction: t,
                }
              );

            return t.commit();
          } catch (err) {
            await t.rollback();
            throw err;
          }
        })
        .then((r) => {
          done(null, true);
        })
        .catch((err) => {
          console.log(err);
          done(null, false);
        });
    });
  },
};
