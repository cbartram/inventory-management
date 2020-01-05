/**
 * Helper function which determines the correct API to hit (prod,dev) and the correct region to use.
 * Note: this defaults to the east region if the REACT_APP_API_REGION is not declared.
 * @param endpointURI String URI of the endpoint requested starting with '/' and ending without a '/'
 * i.e. (/users/find)
 * @returns {string}
 */
export const getRequestUrl = (endpointURI) => {
    let url = '';

    // Attempt to use prod
    if(IS_PROD)
        url = `${PROD_URL}${endpointURI}`;
    else
        url = `${DEV_URL}${endpointURI}`;

    return url;
};

/**
 * Helper variable to determine if the App is in the production environment. This decides which API call to make.
 * @type {boolean} True if the application is running in prod and false otherwise.
 */
export const IS_PROD = window.location.hostname !== 'localhost' || process.env.REACT_APP_NODE_ENV === 'production';
export const PROD_URL = 'http://raspberry-pi.servebeer.com';
export const DEV_URL = 'http://localhost:3010';

// Endpoints
export const GET_ALL_CATEGORIES = '/api/v1/category/';
export const CREATE_CATEGORY = '/api/v1/category/create';
export const CREATE_ITEM = '/api/v1/item/create';