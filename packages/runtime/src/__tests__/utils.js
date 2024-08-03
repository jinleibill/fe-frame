export function singleHtmlLine(str) {
    return str[0].replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim()
}