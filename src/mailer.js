import nodemailer from "nodemailer";
import config from "./config";
import { db } from "./models";

export default {
  sendOtp: (email, key, otp) => {
    return new Promise((resolve, reject) => {
      try {
        db.customer.findOne({ where: { email: email } }).then((user) => {
          if (user) {
            var smtpTransport = nodemailer.createTransport({
              host: process.env.MAIL_HOST,
              port: process.env.MAIL_PORT,
              secure: false,
              auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
              },
              tls: { rejectUnauthorized: false },
            });
            smtpTransport.sendMail(
              {
                from: process.env.MAIL_FROM,
                to: email,
                subject: "grozep: OTP for Verify Email",
                html:
                  "Dear user,<br><br> Thank you for registering with grozep.<br> <br> <b> <strong>One Time OTP:</strong> " +
                  otp +
                  " </b><br> <br> This link will expire in 30sec. <br> This is a system generated mail. Please do not reply to this email ID.<br>Warm Regards,<br> Customer Care<br> grozep",
                // html:
                //   "Hi <br>" +
                //   "Your One Time Password(OTP) for completing your registeration on grozep is  " +
                //   otp +
                //   " .Please do not share OTP with anyone .<br> Best Regards, <br> Team grozep",
              },
              function (error, info) {
                if (error) {
                  return reject({
                    name: "grozepException",
                    message: "Email Sending Failed",
                    error: error,
                  });
                }
                return resolve(true);
              }
            );
          } else
            throw {
              name: "GrocerrryException",
              msg: "Email Body not available",
            };
        });
      } catch (err) {
        reject(err);
      }
    });
  },
  sendEmployeePassword: (email, key) => {
    return new Promise((resolve, reject) => {
      try {
        db.customer.findOne({ where: { email: email } }).then((user) => {
          if (user) {
            var smtpTransport = nodemailer.createTransport({
              host: process.env.MAIL_HOST,
              port: process.env.MAIL_PORT,
              secure: false,
              auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
              },
              tls: { rejectUnauthorized: false },
            });
            smtpTransport.sendMail(
              {
                from: process.env.MAIL_FROM,
                to: email,
                subject: "grozep: Online Shopping Center",
                html:
                  "Dear user,<br><br> Thank you for registering with Janakpur.<br> <br> <b> <strong>Click Here:</strong> " +
                  process.env.SALON_URL +
                  "/verify/" +
                  email +
                  "/" +
                  key +
                  " </b><br> <br> This link will expire in 30sec. <br> This is a system generated mail. Please do not reply to this email ID.<br>Warm Regards,<br> Customer Care<br> grozep",
                // html: "Hi <br>" + "Your One Time Password(OTP) for completing your registeration on KDMARC is  " + password + " .Please do not share OTP with anyone .<br> Best Regards, <br> Team KDMARC",
              },
              function (error, info) {
                if (error) {
                  return reject({
                    name: "grozepException",
                    msg: "Email Sending Failed",
                  });
                }
                return resolve(true);
              }
            );
          } else
            throw {
              name: "GrocerrryException",
              msg: "Email Body not available",
            };
        });
      } catch (err) {
        reject(err);
      }
    });
  },
  sendEmailToVendor: (email, productName) => {
    var smtpTransport = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      ignoreTLS: false,
      secure: false,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    });
    smtpTransport.sendMail(
      {
        from: process.env.MAIL_FROM,
        to: email,
        subject: "New Order",
        text: `You Just received an order for ${productName}`,
      },
      function (error, info) {
        if (error || (info && info.rejected.length)) {
          return reject({
            name: "Exception",
            msg: "Email Sending Failed",
            error: error,
          });
        }
        return resolve(true);
      }
    );
  },
  sendResetPassword: (email, key, otp) => {
    return new Promise((resolve, reject) => {
      try {
        db.customer.findOne({ where: { email: email } }).then((user) => {
          if (user) {
            var smtpTransport = nodemailer.createTransport({
              host: process.env.MAIL_HOST,
              port: process.env.MAIL_PORT,
              secure: false,
              auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
              },
              tls: { rejectUnauthorized: false },
            });
            smtpTransport.sendMail(
              {
                from: process.env.MAIL_FROM,
                to: email,
                subject: "grozep: OTP Sent",
                html:
                  "Dear user,<br><br> Thank you for Reset Password with grozep.<br> <br> <b> <strong>One Time OTP:</strong> " +
                  otp +
                  " </b><br> <br> This link will expire in 30sec. <br> This is a system generated mail. Please do not reply to this email ID.<br>Warm Regards,<br> Customer Care<br> grozep",
                // html:
                //   "Hi <br>" +
                //   "Your One Time Password(OTP) for completing your registeration on grozep is  " +
                //   otp +
                //   " .Please do not share OTP with anyone .<br> Best Regards, <br> Team grozep",
              },
              function (error, info) {
                if (error) {
                  return reject({
                    name: "grozepException",
                    message: "Email Sending Failed",
                    error: error,
                  });
                }
                return resolve(true);
              }
            );
          } else
            throw {
              name: "GrocerrryException",
              msg: "Email Body not available",
            };
        });
      } catch (err) {
        reject(err);
      }
    });
  },

  sendInvoiceForCustomer: (body, list, addrdetails, name, orderNo, user) => {
    const htmlHeader = `<html>
        <body
          style="background-color:#fbfbfb;font-family: Open Sans, sans-serif;font-size:100%;font-weight:400;line-height:1.4;color:#000;">
          <table
            style="min-width:650px;margin:50px auto 10px;background-color:#fff;padding:50px;-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px;-webkit-box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);-moz-box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24); border-top: solid 10px #88b433;">
            <thead>
              <tr>
                <th style="text-align:left;"><img style="max-width: 80px;height:70px"
                    src="https://grociproduct.s3.ap-south-1.amazonaws.com/favicon.png" width='80' alt="grozep"></th>
                <th style="text-align:right;font-weight:bold;font-size: 14px;">${new Date()
                  .toISOString()
                  .slice(0, 10)}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="height:35px;"></td>
              </tr>
        
              <tr>
                <td style="width:50%;padding:2px;vertical-align:top">
                  <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span
                      style="display:block;font-weight:bold;font-size:14px">Name</span> ${name}</p>
        
                </td>
                <td style="width:50%;padding:2px;vertical-align:top">
                  <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span
                      style="display:block;font-weight:bold;font-size:14px;">Email</span> ${
                        user.email
                      }</p>
        
                </td>
              </tr>
        
        
              <tr>
                <td colspan="2" style="border: solid 1px #ddd; padding:10px 20px;">
                  <p style="font-size:14px;margin:0 0 6px 0;"><span
                      style="font-weight:bold;display:inline-block;min-width:150px">Order status</span><b
                      style="color:green;font-weight:normal;margin:0">Success</b></p>
                  <p style="font-size:14px;margin:0 0 6px 0;"><span
                      style="font-weight:bold;display:inline-block;min-width:146px">Order ID</span> ${orderNo}</p>
                  <p style="font-size:14px;margin:0 0 0 0;"><span
                      style="font-weight:bold;display:inline-block;min-width:146px">Order amount</span> Rs. ${
                        body.grandTotal
                      }</p>
                <p style="font-size:14px;margin:0 0 6px 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Phone No</span> ${
                  addrdetails ? addrdetails.phone : body.deliveryAddress.phone
                }</p>
                      <p style="font-size:14px;margin:0 0 0 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Shipping Address</span>${
                        addrdetails
                          ? addrdetails.shipping
                          : body.deliveryAddress.ShippingAddress
                      }  </p>
                </td>
              </tr>
              <tr>
                <td style="height:20px;"></td>
              </tr>
        
              <tr>
                <td colspan="2" style="font-size:14px;padding:2px;font-weight: bold;">Items</td>
              </tr>
              ${list
                .map(function (item) {
                  return `
              <tr style="border:solid 1px #ddd;">
                <td style="padding:2px;width:50%;">
                  <p style="font-size:14px;margin:0;">${item.productName}</p>
                </td>
                <td style="padding:2px;width:50%;text-align: right;">
                  <p style="font-size:14px;margin:0;"> Rs.${
                    item.qty + "*" + item.netPrice
                  }</p>
                </td>
              </tr>
              `;
                })
                .join("")}
              `;

    const htmlFooter = ` </tbody>
            <tfooter>
              <tr>
              <tr>
                <td style="height:50px;"></td>
              </tr>
        
              <td colspan="2" style="font-size:14px;padding:2px;">
                <strong style="display:block;margin:0 0 10px 0;">Regards,</strong>Team grozep<br><br>
                For any queries please contact us at: <b>support@grozep.com</b>
              </td>
              </tr>
            </tfooter>
            
          </table>
        </body>
        
        </html>`;
    const totalHtml = htmlHeader + htmlFooter;
    return new Promise((resolve, reject) => {
      try {
        db.customer.findOne({ where: { email: user.email } }).then((user) => {
          if (user && user.verify == 1) {
            var key = Math.random().toString(36).slice(2);
            db.customer
              .update({ verf_key: key }, { where: { id: user.id } })
              .then((r) => {
                var smtpTransport = nodemailer.createTransport({
                  host: process.env.MAIL_HOST,
                  port: process.env.MAIL_PORT,
                  ignoreTLS: false,
                  secure: false,
                  auth: {
                    user: process.env.MAIL_USERNAME,
                    pass: process.env.MAIL_PASSWORD,
                  },
                  tls: { rejectUnauthorized: false },
                });
                smtpTransport.sendMail(
                  {
                    from: process.env.MAIL_FROM,
                    to: user.email,
                    subject:
                      "Your grozep Order Confirmation. Please share your feedback",
                    html: totalHtml,
                  },
                  function (error, info) {
                    if (error || (info && info.rejected.length)) {
                      return reject({
                        name: "Exception",
                        msg: "Email Sending Failed",
                        error: error,
                      });
                    }
                    return resolve(true);
                  }
                );
              });
          } else {
            reject(new Error("user not valid"));
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  },

  sendInvoiceForCustomerNew: (body, addrdetails, orderNo, user) => {
    const htmlHeader = `<html>
        <body
          style="background-color:#fbfbfb;font-family: Open Sans, sans-serif;font-size:100%;font-weight:400;line-height:1.4;color:#000;">
          <table
            style="min-width:650px;margin:50px auto 10px;background-color:#fff;padding:50px;-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px;-webkit-box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);-moz-box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24); border-top: solid 10px #88b433;">
            <thead>
              <tr>
                <th style="text-align:left;"><img style="max-width: 80px;height:70px"
                    src="https://grociproduct.s3.ap-south-1.amazonaws.com/favicon.png" width='80' alt="grozep"></th>
                <th style="text-align:right;font-weight:bold;font-size: 14px;">${new Date()
                  .toISOString()
                  .slice(0, 10)}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="height:35px;"></td>
              </tr>
        
              <tr>
                <td style="width:50%;padding:2px;vertical-align:top">
                  <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span
                      style="display:block;font-weight:bold;font-size:14px">Name</span> ${
                        addrdetails.fullname
                      }</p>
        
                </td>
                <td style="width:50%;padding:2px;vertical-align:top">
                  <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span
                      style="display:block;font-weight:bold;font-size:14px;">Email</span> ${
                        user.email
                      }</p>
        
                </td>
              </tr>
        
        
              <tr>
                <td colspan="2" style="border: solid 1px #ddd; padding:10px 20px;">
                  <p style="font-size:14px;margin:0 0 6px 0;"><span
                      style="font-weight:bold;display:inline-block;min-width:150px">Order status</span><b
                      style="color:green;font-weight:normal;margin:0">Success</b></p>
                  <p style="font-size:14px;margin:0 0 6px 0;"><span
                      style="font-weight:bold;display:inline-block;min-width:146px">Order ID</span> ${orderNo}</p>
                  <p style="font-size:14px;margin:0 0 0 0;"><span
                      style="font-weight:bold;display:inline-block;min-width:146px">Order amount</span> Rs. ${
                        body.total
                      }</p>
                <p style="font-size:14px;margin:0 0 6px 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Phone No</span> ${
                  addrdetails ? addrdetails.phone : body.deliveryAddress.phone
                }</p>
                      <p style="font-size:14px;margin:0 0 0 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Shipping Address</span>${
                        addrdetails.shipping +
                        ", " +
                        addrdetails.city +
                        ", " +
                        addrdetails.states
                      }  </p>
                </td>
              </tr>
              <tr>
                <td style="height:20px;"></td>
              </tr>
        
              <tr>
                <td colspan="2" style="font-size:14px;padding:2px;font-weight: bold;">Items</td>
              </tr>
              ${body.cart
                .map(function (item) {
                  return `
              <tr style="border:solid 1px #ddd;">
                <td style="padding:2px;width:50%;">
                  <p style="font-size:14px;margin:0;"><img src=${
                    item.thumbnail
                  } alt=${item.productName} height="50px"/></p>
                </td>
                <td style="padding:2px;width:50%;">
                  <p style="font-size:14px;margin:0;">${item.productName}</p>
                </td>
                <td style="padding:2px;width:50%;text-align: right;">
                  <p style="font-size:14px;margin:0;"> Rs.${
                    item.quantity +
                    "*" +
                    item.netPrice +
                    "=" +
                    item.quantity * item.netPrice
                  }</p>
                </td>
              </tr>
              `;
                })
                .join("")}
              `;

    const htmlFooter = ` </tbody>
            <tfooter>
              <tr>
              <tr>
                <td style="height:50px;"></td>
              </tr>
        
              <td colspan="2" style="font-size:14px;padding:2px;">
                <strong style="display:block;margin:0 0 10px 0;">Regards,</strong>Team grozep<br><br>
                For any queries please contact us at: <b>support@grozep.com</b>
              </td>
              </tr>
            </tfooter>
            
          </table>
        </body>
        
        </html>`;
    const totalHtml = htmlHeader + htmlFooter;
    return new Promise((resolve, reject) => {
      try {
        db.customer.findOne({ where: { email: user.email } }).then((user) => {
          if (user && user.verify == 1) {
            var key = Math.random().toString(36).slice(2);
            db.customer
              .update({ verf_key: key }, { where: { id: user.id } })
              .then((r) => {
                var smtpTransport = nodemailer.createTransport({
                  host: process.env.MAIL_HOST,
                  port: process.env.MAIL_PORT,
                  ignoreTLS: false,
                  secure: false,
                  auth: {
                    user: process.env.MAIL_USERNAME,
                    pass: process.env.MAIL_PASSWORD,
                  },
                  tls: { rejectUnauthorized: false },
                });
                smtpTransport.sendMail(
                  {
                    from: process.env.MAIL_FROM,
                    to: user.email,
                    subject:
                      "Your grozep Order Confirmation. Please share your feedback",
                    html: totalHtml,
                  },
                  function (error, info) {
                    if (error || (info && info.rejected.length)) {
                      return reject({
                        name: "Exception",
                        msg: "Email Sending Failed",
                        error: error,
                      });
                    }
                    return resolve(true);
                  }
                );
              });
          } else {
            reject(new Error("user not valid"));
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  },
  sendInvoiceForSeller: (body, addrdetails, orderNo, customer, email) => {
    const htmlHeader = `<html>
        <body
          style="background-color:#fbfbfb;font-family: Open Sans, sans-serif;font-size:100%;font-weight:400;line-height:1.4;color:#000;">
          <table
            style="min-width:650px;margin:50px auto 10px;background-color:#fff;padding:50px;-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px;-webkit-box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);-moz-box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24); border-top: solid 10px #88b433;">
            <thead>
              <tr>
                <th style="text-align:left;"><img style="max-width: 80px;height:70px"
                    src="https://grociproduct.s3.ap-south-1.amazonaws.com/favicon.png" width='80' alt="grozep"></th>
                <th style="text-align:right;font-weight:bold;font-size: 14px;">${new Date()
                  .toISOString()
                  .slice(0, 10)}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="height:35px;"></td>
              </tr>
        
              <tr>
                <td style="width:50%;padding:2px;vertical-align:top">
                  <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span
                      style="display:block;font-weight:bold;font-size:14px">Name</span> ${
                        addrdetails.fullname
                      }</p>
        
                </td>
                <td style="width:50%;padding:2px;vertical-align:top">
                  <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span
                      style="display:block;font-weight:bold;font-size:14px;">Email</span> ${
                        customer.email
                      }</p>
        
                </td>
              </tr>
        
        
              <tr>
                <td colspan="2" style="border: solid 1px #ddd; padding:10px 20px;">
                  <p style="font-size:14px;margin:0 0 6px 0;"><span
                      style="font-weight:bold;display:inline-block;min-width:150px">Order status</span><b
                      style="color:green;font-weight:normal;margin:0">Success</b></p>
                  <p style="font-size:14px;margin:0 0 6px 0;"><span
                      style="font-weight:bold;display:inline-block;min-width:146px">Order ID</span> ${orderNo}</p>
                  <p style="font-size:14px;margin:0 0 0 0;"><span
                      style="font-weight:bold;display:inline-block;min-width:146px">Order amount</span> Rs. ${
                        body.netPrice
                      }</p>
                <p style="font-size:14px;margin:0 0 6px 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Phone No</span> ${
                  addrdetails ? addrdetails.phone : body.deliveryAddress.phone
                }</p>
                <p style="font-size:14px;margin:0 0 6px 0;"><span
                style="font-weight:bold;display:inline-block;min-width:146px">CustName</span> ${
                  customer.name
                }</p>
                      <p style="font-size:14px;margin:0 0 0 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Shipping Address</span>${
                        addrdetails.shipping +
                        ", " +
                        addrdetails.city +
                        ", " +
                        addrdetails.states
                      }  </p>
                </td>
              </tr>
              <tr>
                <td style="height:20px;"></td>
              </tr>
        
              <tr>
                <td colspan="2" style="font-size:14px;padding:2px;font-weight: bold;">Items</td>
              </tr>
              
              <tr style="border:solid 1px #ddd;">
                <td style="padding:2px;width:50%;">
                  <p style="font-size:14px;margin:0;"><img src=${
                    body.thumbnail
                  } alt=${body.productName} height="50px"/></p>
                </td>
                <td style="padding:2px;width:50%;">
                  <p style="font-size:14px;margin:0;">${body.productName}</p>
                </td>
                
                <td style="padding:2px;width:50%;text-align: right;">
                  <p style="font-size:14px;margin:0;"> Rs.${
                    body.qty +
                    "*" +
                    body.netPrice +
                    "=" +
                    body.qty * body.netPrice
                  }</p>
                </td>
              </tr>
              `;

    const htmlFooter = `</tbody> <tfooter> <tr> <tr> <td style="height:50px;"></td> </tr> <td colspan="2" style="font-size:14px;padding:2px;"> <strong style="display:block;margin:0 0 10px 0;">Regards,</strong>Team grozep<br><br> For any queries please contact us at: <b>support@grozep.com</b> </td> </tr> </tfooter> </table> </body> </html>`;
    const totalHtml = htmlHeader + htmlFooter;
    return new Promise((resolve, reject) => {
      try {
        const query = {};
        query.where = {};

        query.where.email = email;
        query.where.role = "seller";
        query.where.verify = 1;

        db.user.findOne(query).then((user) => {
          if (user && user.id) {
            const smtpTransport = nodemailer.createTransport({
              host: process.env.MAIL_HOST,
              port: process.env.MAIL_PORT,
              ignoreTLS: false,
              secure: false,
              auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
              },
              tls: { rejectUnauthorized: false },
            });
            smtpTransport.sendMail(
              {
                from: process.env.MAIL_FROM,
                to: user.email,
                subject:
                  "You have order. please check your dashboard for more details",
                html: totalHtml,
              },
              function (error, info) {
                if (error || (info && info.rejected.length)) {
                  return reject({
                    name: "Exception",
                    msg: "Email Sending Failed",
                    error: error,
                  });
                }
                return resolve(true);
              }
            );
          } else {
            reject(new Error("user not valid"));
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  },
};
