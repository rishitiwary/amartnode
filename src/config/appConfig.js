var confConst = require('./confConst');
module.exports = {
    app_prod_mode: confConst.prod_mode,
    accounts_db: {
        host: confConst.db_host,
        user: confConst.db_user,
        password: confConst.db_password,
        database: confConst.accounts_db
    },
    zim_tech_db: {
        host: confConst.db_host,
        user: confConst.db_user,
        password: confConst.db_password,
        database: confConst.hrms_payroll_db,
    },
    marketplace_db: {
        host: confConst.db_host,
        user: confConst.db_user,
        password: confConst.db_password,
        database: confConst.marketplace_db
    },
    performance_db: {
        host: confConst.db_host,
        user: confConst.db_user,
        password: confConst.db_password,
        database: confConst.performance_db
    },
    session: {
        model: 'session',
        table: 'sessions',
        expire: confConst.sesion_expire_in_min || 120,/* expire in minuts */
        history_table: 'session_histories'
    },
    auth: {
        allow_base: [
            '/user',
            '/api/user',
            '/ats/user',
            '/admin/user',
            '/payroll/v1/user'
        ],
        allow: [
            'register',
            'verify',
            'forget_passwd',
            'getToken',
            'check_min_req_ver'
        ]
    }, payment: {
        KEY_ID: confConst.razor_pay_key,/* razorpay `KEY_ID` */
        KEY_SECRET: confConst.razor_pay_secret,/* razorpay `KEY_SECRET` */
        gst_rate: 18
    },
    log_mail_insted_sending: confConst.log_mail || false,
    file_base_path: `${__dirname}/../uploads/`,
    file_base_url: `${confConst.api_base_url}/file/`,
    user_block_duration: 30,/* in minuts */
    max_invalid_try: 5,/* no of invalid password hit. */
    base_url: confConst.api_base_url,
    logo_url: confConst.accounts_base_url + '/assets/img/logo.png',
    payroll_base_url: confConst.payroll_base_url,
    base_file_url: confConst.hrms_base_url + '/uploads/organization/',
    proof_url:  'uploads/payroll/declration',
    hrms_logo_url: confConst.hrms_base_url + '/uploads/organization/',
    php_api_base_url: confConst.hrms_base_url + '/api/setting_api/',
    hrms_base_url: confConst.hrms_base_url + '/',
    ats_base_url: confConst.ats_base_url + '/',
    api_base_url: confConst.api_base_url + '/',
    performance_base_url: confConst.performance_base_url + '/',
    masert_field_basic: ['ci_csrf_token', 'CANDIDATE_NAME', 'CANDIDATE_EMAIL', 'CANDIDATE_LOCATION',
        'CANDIDATE_DESIGNATION', 'CANDIDATE_DEPARTMENT', 'CANDIDATE_BUSINESS_UNIT_ID', 'CANDIDATE_ENTITY_ID', 'JOINING_DATE',
        'CANDIDATE_CTC', 'SALARY_STRACTURE'],
    master_fields: [163, 164, 165, 166, 167, 168]
}
