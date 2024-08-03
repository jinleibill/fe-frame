export function isNotBlankOrEmptyString(str) {
    return isNotEmptyString(str.trim())
}

export function isNotEmptyString(str) {
    return str !== ""
}