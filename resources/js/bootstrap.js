import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
// Ensure the XSRF-TOKEN cookie is always read and sent back as X-XSRF-TOKEN,
// which Laravel's session-based CSRF guard requires for same-origin AJAX calls.
window.axios.defaults.withCredentials = true;
window.axios.defaults.withXSRFToken = true;
