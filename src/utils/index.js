import { db } from "../models";
import sequelize from 'sequelize';
// import vendor from "../models/vendor";
export  async function findVendorWithLowestPrice(productId){
    try{
      const value = await db.vendor_product.findAll({
            limit:1,
            order:['price'],
            where: {
             productId 
            },
            include:[
                {association:'vendor',attributes:['id','email']},
                // {association:'product',attributes:['name']}
            ]
            
             
            // raw: true,
        });
        return Promise.resolve({vendor:value[0]});
    }catch(err){
        return  Promise.reject({err});
    }
        // db.sequelize.query(`SELECT supplierId,price from vendor_product`)
}