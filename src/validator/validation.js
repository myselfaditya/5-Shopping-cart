const isValidMail = (/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/);

const isValidName = (/^[a-zA-Z. ]{1,20}$/)

const isValid = (value) => {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false
    return true
}

const isValidfield = (value) => {
    if (typeof value === "string" && value.trim().length === 0) return false
    return true
}

const isValidRequestBody = (value) => {
    return Object.keys(value).length > 0
}

const isValidMobile = /^[6-9]{1}[0-9]{9}$/;
const validPin = /^[1-9][0-9]{5}$/;

const isValidPassword = function (value) {
    if (/^(?=.?[A-Z])(?=.?[a-z])(?=.?[0-9])(?=.?[#?!@$%^&*-]).{8,15}$/.test(value)) return true;
    return false;
};

let imgUrl = /^https?:\/\/(.+\/)+.+(\.(gif|png|jpg|jpeg|webp|svg|psd|bmp|tif))$/i

module.exports = {
    isValidMail, isValid, isValidName, isValidRequestBody, isValidfield, isValidMobile, isValidPassword, imgUrl, validPin
}