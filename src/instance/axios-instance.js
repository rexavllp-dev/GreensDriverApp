const axios = require('axios');
const instance = axios.create({
    // baseURL: 'http://192.168.1.14:8000/api/',
    // baseURL: 'http://192.168.1.5:8000/api/',
    baseURL: 'https://api.greens-intl.ae/api/v1/',
    // baseURL: 'http://10.0.2.2:5000/api/v1/',
    // baseURL: 'http://192.168.10.177:5000/api/v1/',
    // baseURL: 'http://192.168.10.142:5000/api/v1/',
    timeout: 10000,
});
export default instance;