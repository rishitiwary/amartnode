var conf = require('../config/appConfig');
var jwt = require('jsonwebtoken');
var md5 = require('md5');
var sha1 = require('sha1')
var fs = require('fs');

var Log = require('./Log');

var weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var weekfullday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var day_suffix = { 1: "st", 2: "nd", 3: "rd", 21: "st", 22: "nd", 23: "rd", 31: "st" };
var months = { 1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun", 7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec" };
var months_full = { 1: "January", 2: "Febuary", 3: "March", 4: "April", 5: "May", 6: "June", 7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December" };


class Util {
    static generatePassword(PasswdLen, Type = '') {
        var CharStr = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmanopqrstuvwxyz@_#!:+=';
        var CharLen = CharStr.length;
        if (Type.trim() === 'N') {
            CharLen = 9;
        } else if (Type.trim() === 'AN') {
            CharLen = 35;
        } else if (Type.trim() === 'AaN') {
            CharLen = 61;
        }
        var PasswdStr = "";
        while (PasswdStr.length < PasswdLen) {
            var RandChar = CharStr.substr(this.mt_rand(0, CharLen), 1);
            if (PasswdStr.indexOf(RandChar) !== -1) {
                continue;
            }
            PasswdStr += RandChar;
        }
        return PasswdStr;
    }

    static encryptPasswordSHA1(password, salt) {
        return sha1(salt + (sha1(salt + sha1(password))));
    }
     static combine(data, key, value, group) {
        let out = {};
        if (typeof data != 'object' || !key || !value || typeof key != 'string' || typeof value != 'string') {
            return out;
        }
        let [pi1, pv1] = key.split('.');
        let [pi2, pv2] = value.split('.');
        if (['{n}', '{s}', '{*}'].indexOf(pi1) === -1) {
            return out;
        }
        if (!group) {
            group = pi1;
        }
        let [pi3, pv3] = group.split('.');
        for (const k in data) {
            let r = data[k];
            if (pi1 !== pi2) { continue; }
            if (pi2 !== pi3) { continue; }
            if (pi1 == '{n}' && isNaN(k)) { continue; }
            if (pi1 == '{s}' && !isNaN(k)) { continue; }
            if (pv1 && r.hasOwnProperty(pv1)) {
                let v = r;
                if (pv2 && r.hasOwnProperty(pv2)) {
                    v = r[pv2];
                } else if (pv2 && !r.hasOwnProperty(pv2)) {
                    v = null
                }
                if (pv3 && r.hasOwnProperty(pv3)) {
                    if (!out.hasOwnProperty(r[pv3])) {
                        out[r[pv3]] = {};
                    }
                    out[r[pv3]][r[pv1]] = v;
                } else {
                    out[r[pv1]] = v;
                }
            }
        }
        return out;
    }
      static array_column(input, ColumnKey, IndexKey = null) {
        if (input !== null && (typeof input === 'object' || Array.isArray(input))) {
            var newarray = []
            if (typeof input === 'object') {
                let temparray = []
                for (let key of Object.keys(input)) {
                    temparray.push(input[key])
                }
                input = temparray
            }
            if (Array.isArray(input)) {
                for (let key of input.keys()) {
                    if (IndexKey && input[key][IndexKey]) {
                        if (ColumnKey) {
                            newarray[input[key][IndexKey]] = input[key][ColumnKey]
                        } else {
                            newarray[input[key][IndexKey]] = input[key]
                        }
                    } else {
                        if (ColumnKey) {
                            newarray.push(input[key][ColumnKey])
                        } else {
                            newarray.push(input[key])
                        }
                    }
                }
            }
            return Object.assign({}, newarray)
        }
    }

    static decrypt(encoded) {
        encoded = Buffer.from(encoded, 'base64').toString();
        return encoded.match(/.{1,2}/g)
            .map(hex => parseInt(hex, 16))
            .map(charCode => String.fromCharCode(charCode))
            .join('');
    }

    static mt_rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static log(fname, message) {
        if (typeof message === 'object') {
            message = JSON.stringify(message, null, 2);
        }
        fs.appendFileSync(__dirname + '/../logs/' + fname + '.log', this.get_curr_date() + ': ' + message + '\n');
    }

    static getFormatedResponse(err, result, query) {
        if (err) {
            result = {
                error: true,
                code: 500,
                message: err.message,
                data: {}
            };
            let [protocol, host] = conf.base_url.split('://');
            if (err.hasOwnProperty('sqlMessage')) {
                result.message = "We are facing some technical difficulties. Please try later.";
                Log.mysql_log({
                    get: () => { return host; }, protocol: protocol, originalUrl: '/fun_getFormatedResponse'
                }, err, (e, r) => { });
            } else {
                Log.error_log({
                    get: () => { return host; }, protocol: protocol, originalUrl: '/fun_getFormatedResponse'
                }, err, (e, r) => { });
            }
        } else if (typeof result === 'object') {
            var error = result.error || false;
            var code = result.code || (error === false ? 200 : 500);
            var message = result.message || '';
            delete result.error;
            delete result.code;
            delete result.message;
            result = {
                error: error,
                code: code,
                message: message,
                data: result
            };
        } else {
            result = {
                error: false,
                code: 200,
                message: '',
                data: result
            };
        }
        return result;
    }

    static md5(str) {
        return md5(str);
    }

    static validate_prams(InputArr, KeyArr, NameArr) {
        var key = null;
        var errors = [];
        for (key in KeyArr) {
            try {
                if (InputArr[key] !== undefined && typeof InputArr[key] === 'string') {
                    InputArr[key] = InputArr[key].trim();
                }
                if (InputArr[key] === undefined || InputArr[key] === null || InputArr[key] === '') {
                    throw new Error(`${NameArr[key] || key} is missing.`);
                } else if (typeof KeyArr[key] === 'object') {
                    this.validate_prams(InputArr[key] || {}, KeyArr[key], NameArr[key] || {}, err => {
                        if (err) {
                            errors.push(err.message);
                        }
                    });
                } else if (typeof InputArr[key] === 'object' || !this.regValidate(KeyArr[key], InputArr[key])) {
                    throw new Error(`${NameArr[key] || key} is in the wrong format.`);
                }
            } catch (err) {
                errors.push(err.message);
            }
        }

        return errors;
    }

    static regValidate(type, val) {
        switch (type) {
            case 'D':
                return /^\d{4}-\d{2}-\d{2}$/.test(val); //date Y-m-d
            case 'DT':
                return /^\d{4}-\d{2}-\d{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$/.test(val); //date time Y-m-d H:i:s
            case 'T':
                return /^[0-2]{1}[0-9]{1}:[0-5]{1}[0-9]{1}:[0-5]{1}[0-9]{1}$/.test(val); //date time Y-m-d H:i:s
            case 'A':
                return /^([A-Za-z]+)$/.test(val); //alpha without space
            case 'AS':
                return /^[A-Za-z ]+$/.test(val); //alpha with space
            case 'AN':
                return /^([A-Z0-9a-z]+)$/.test(val); //alpha numeric without space
            case 'ASN':
                return /^[A-Za-z 0-9]+$/.test(val); //alpha numeric with space
            case 'N':
                return /^(-)?\d+$/.test(val); //numeric
            case 'F':
                return /^(-)?\d+\.?\d*$/.test(val); //Float
            case 'ANS':
                return /^[A-Za-z 0-9_\-+!:=?.,'@#%\/\&\(\)\[\]]+$/.test(val); //text
            case 'EMAIL':
                return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,8})?$/.test(val); //email
            case 'EMAILS':
                return this.validateEmails(val); //email ids
            case 'PAN':
                return this.validatePAN(val); //PAN NO.
            case 'MNO':
                return this.is_valid_mobile(val); //Mobile no
            case 'PIN':
                return /^\d{6}$/.test(val); //Pin No.
            case 'AU':
                return /^[A-Za-z_]+$/.test(val); //alpha with underscore
            case 'URL':
                return /^http(s)?:\/\/[a-z0-9-]+(.[a-z0-9-]+)*(:[0-9]+)?(?:.)*?$/.test(val); //URL
            case 'VER':
                return /^\d{1,2}.\d{1,2}.\d{1,2}$/.test(val); //Version No.
            case 'IPV4':
                return /^([01]?\d\d?|2[0-4]\d|25[0-5]).([01]?\d\d?|2[0-4]\d|25[0-5]).([01]?\d\d?|2[0-4]\d|25[0-5]).([01]?\d\d?|2[0-4]\d|25[0-5])$/.test(val);
            case 'IPV4R':
                return /^([01]?\d\d?|2[0-4]\d|25[0-5]).([01]?\d\d?|2[0-4]\d|25[0-5]).([01]?\d\d?|2[0-4]\d|25[0-5]).([01]?\d\d?|2[0-4]\d|25[0-5])\/([01]?\d\d?|2[0-4]\d|25[0-5])$/.test(val);
            case 'ANY':
                return true;
            default:
                return false;
        }
    }

    static validateEmails(emails) {
        var valid_emails = this.getEmailArray(emails);
        return valid_emails.length > 0;
    }

    static validatePAN(pan_no) {
        var PANNO = pan_no.trim().toUpperCase();
        if (PANNO.length !== 10) {
            return false;
        }
        var pan_arr = PANNO.split('');
        for (var key = 0; key < 10; key++) {
            var val = pan_arr[key].charCodeAt(0);
            if ((key === 9 || key <= 4) && (val < 65 || val > 90)) {
                return false;
            } else if (key > 4 && key <= 8 && (val < 48 || val > 57)) {
                return false;
            } else if (key === 3 && (",A,B,C,F,G,H,J,L,P,T,").indexOf("," + pan_arr[key] + ",") !== -1) {
                return false;
            }
        }
        return true;
    }

    static is_valid_mobile(mno) {
        var m = mno.substr(-10);
        var e = mno.substr(0, (mno.length - 10));
        if (e.length > 3 || ['', '0', '91', '+91', '091'].indexOf(e) === -1) {
            return false;
        } else {
            return /^([6-9]{1})([0-9]{9})$/.test(m);
        }
    }

    static get_curr_date(format) {
        var dt = new Date();
        dt.setMinutes(dt.getMinutes() + 330 + Number(dt.getTimezoneOffset()));
        return this.get_formated_date(dt / 1000, format);
    }

    static get_formated_date(timestamp, format, time_zone = 330) {
        if (format === undefined) {
            format = "Y-m-d H:i:s";
        }
        if (timestamp === undefined) {
            timestamp = new Date() / 1000;
        }
        var dt;
        if (typeof timestamp === 'string') {
            if (timestamp.length == 10) {
                timestamp += ' 00:00:00';
            }
            dt = new Date(timestamp);
        } else if (typeof timestamp === 'object') {
            dt = new Date(timestamp);
        } else {
            dt = new Date(timestamp * 1000);
        }
        if (dt == "Invalid Date") {
            return null;
        }
        var Y = dt.getFullYear();
        if (Y.toString().length > 4) {
            dt = new Date(timestamp);
        }
        //dt.setMinutes(dt.getMinutes() + Number(time_zone) + Number(dt.getTimezoneOffset()));
        var dobj = {};
        dobj['Y'] = dt.getFullYear();
        dobj['y'] = dt.getYear();
        dobj['n'] = dt.getMonth() + 1;
        dobj['m'] = this.get_full_date_var(dobj.n);
        dobj['j'] = dt.getDate();
        dobj['d'] = this.get_full_date_var(dobj.j);
        if (dobj['Y'] + '-' + dobj['m'] + '-' + dobj['d'] == '1970-01-01') {
            return null;
        }
        dobj['w'] = dt.getDay();
        dobj['N'] = dobj.w;
        dobj['D'] = weekday[dobj.w];
        dobj['l'] = weekfullday[dobj.w];
        dobj['S'] = day_suffix[dobj.j] || "th";
        dobj['M'] = months[dobj.n];
        dobj['F'] = months_full[dobj.n];
        dobj['G'] = dt.getHours();
        dobj['H'] = this.get_full_date_var(dobj.G);
        dobj['i'] = this.get_full_date_var(dt.getMinutes());
        dobj['s'] = this.get_full_date_var(dt.getSeconds());
        dobj['g'] = dobj.G;
        dobj['t'] = this.get_full_date_var(new Date(dobj.Y, dobj.n, 0).getDate());
        dobj['A'] = ' AM';
        dobj['a'] = ' am';
        if (dobj['g'] >= 12) {
            dobj['g'] %= 12;
            dobj['A'] = ' PM';
            dobj['a'] = ' pm';
        }
        if (dobj['g'] == 0) {
            dobj['g'] = 12;
        }
        if (dobj.N == 0) {
            dobj.N = 7;
        }
        if (dobj.y >= 100) {
            dobj.y -= 100;
        }
        dobj['W'] = 1 + Math.round(((dt.getTime() - (new Date(dobj.Y, 0, 4)).getTime()) / 86400000 + 1) / 7);
        dobj['h'] = this.get_full_date_var(dobj.g);
        var date_str = '';
        format.toString().split("").forEach(fm => {
            date_str += (dobj.hasOwnProperty(fm)) ? dobj[fm] : fm;
        });
        return date_str;
    }

    static get_full_date_var(ip) {
        if (ip < 10) {
            ip = '0' + ip;
        }
        return ip;
    }

    static get_ipv4_addr(mixed) {
        var ipv4 = '';
        (mixed || '').split(':').forEach(function (v) {
            var ip = (v || '').split('.');
            if (ip.length === 4) {
                var f = true;
                ip.forEach(function (i) {
                    if (i < 0 || i > 255) {
                        f = false;
                    }
                });
                if (f) {
                    ipv4 = v;
                }
            }
            if (ipv4.length > 0) {
                return false;
            }
        });
        return ipv4;
    }

    static inIPV4Range(ipv4_ip, ipv4_range, prev_result) {
        if (!prev_result) {
            prev_result = false;
        }
        if (prev_result === false) {
            var ra = ipv4_range.split('.');
            var ia = ipv4_ip.split('.');
            var r = ra[3].split('/');
            var i = ia[3];
            delete ra[3];
            delete ia[3];
            if (ra.join('.') === ia.join('.') && i >= r[0] && i <= r[1]) {
                prev_result = true;
            }
        }
        return prev_result;
    }

    static update_log(fname, message) {
        if (typeof message === 'object') {
            message = JSON.stringify(message, null, 4);
        }
        fs.writeFileSync(__dirname + '/../logs/' + fname + '.log', this.get_curr_date() + ': ' + message + '\n');
    }

    static generateJwtToken(data) {
        var util = this;
        data = util.obj_merge({
            salt: util.generatePassword(32, 'AaN')
        }, data);
        return jwt.sign(data, 'vinay_kumar_key');
    }

    static obj_merge(target) {
        var sources = [].slice.call(arguments, 1);
        sources.forEach(function (source) {
            for (var prop in source) {
                target[prop] = source[prop];
            }
        });
        return target;
    }

    static validateJwtToken(token) {
        return jwt.verify(token, 'vinay_kumar_key');
    }

    static date_diff_toString(date1, date2) {
        var diff = Math.abs(this.date_diff(date1, date2, 'S'));
        var out = '' + (diff % 60) + 's';
        diff = Math.floor(diff / 60);
        if (diff >= 60) {
            out = '' + (diff % 60) + 'm ' + out;
            diff = Math.floor(diff / 60);
            if (diff >= 24) {
                out = '' + (diff % 24) + 'h ' + out;
                diff = Math.floor(diff / 24);
                if (diff > 0) {
                    out = '' + diff + 'd ' + out;
                }
            } else if (diff > 0) {
                out = '' + diff + 'h ' + out;
            }
        } else if (diff > 0) {
            out = '' + diff + 'm ' + out;
        }
        return out;
    }

    static date_diff(date1, date2, diff_in) {
        if (diff_in === undefined) {
            diff_in = 'D';
        }
        var date_1 = new Date(date1);
        var date_2 = new Date(date2);
        var Diff = date_1.getTime() - date_2.getTime();
        switch (diff_in) {
            case 'Y':
                Diff /= 12;
            case 'M':
                Diff /= 30;
            case 'D':
                Diff /= 24;
            case 'H':
                Diff /= 60;
            case 'I':
                Diff /= 60;
            case 'S':
            default:
                Diff /= 1000;
        }
        return Math.floor(Diff);
    }
}
module.exports = Util;