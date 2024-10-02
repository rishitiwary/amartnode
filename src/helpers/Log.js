const fs = require('fs');

class Log {
	static mysql_log(req, err) {
		let sql_log = {
			org_id: req.hasOwnProperty('user') && req.user ? req.user.org_id || null : (req.hasOwnProperty('decoded') && req.decoded ? req.decoded.org_id || null : null),
			user_id: req.hasOwnProperty('user') && req.user ? req.user.user_id || null : (req.hasOwnProperty('decoded') && req.decoded ? req.decoded.user_id || null : null),
			url: (req.protocol + '://' + req.get('host') + req.originalUrl).split('?')[0],
			code: err.parent.code,
			errno: err.parent.errno,
			sql_message: err.parent.sqlMessage,
			sql_state: err.original.sqlState,
			sql: err.parent.sql,
			err_stack: err.parent.sqlMessage,
        }
        return sql_log
	}

	static error_log(req, err) {
        console.log(JSON.stringify(req.user))
		let sql_log = {
			org_id: req.hasOwnProperty('user') && req.user ? req.user.org_id || null : (req.hasOwnProperty('decoded') && req.decoded ? req.decoded.org_id || null : null),
			user_id: req.hasOwnProperty('user') && req.user ? req.user.user_id || null : (req.hasOwnProperty('decoded') && req.decoded ? req.decoded.user_id || null : null),
			url: (req.protocol + '://' + req.get('host') + req.originalUrl).split('?')[0],
			code: 500,
			error_class: err.constructor.name,
			message: err.message,
			err_stack: err.stack,
        }
        return sql_log
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

module.exports = Log;