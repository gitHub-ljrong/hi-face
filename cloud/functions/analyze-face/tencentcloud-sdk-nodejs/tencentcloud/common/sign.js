const TencentCloudSDKHttpException = require("./exception/tencent_cloud_sdk_exception");
const crypto = require('crypto');

/**
 * @inner
 */
class Sign {

    static sign(secretKey, signStr, signMethod) {
        let signMethodMap = {
            HmacSHA1: "sha1",
            HmacSHA256: "sha256",
            'TC3-HMAC-SHA256': 'TC3-HMAC-SHA256'
        };

        if (!signMethodMap.hasOwnProperty(signMethod)) {
            throw new TencentCloudSDKHttpException("signMethod invalid, signMethod only support (HmacSHA1, HmacSHA256)");
        }
        let hmac = crypto.createHmac(signMethodMap[signMethod], secretKey || "");
        return hmac.update(Buffer.from(signStr, 'utf8')).digest('base64')
    }

    static sign_tc3(secretKey, date, service, str2sign, signMethod) {

        if (signMethod !== "TC3-HMAC-SHA256") {
            throw new TencentCloudSDKHttpException("signMethod invalid, signMethod only support 'TC3-HMAC-SHA256'");
        }

        let signingKey = this.getSignatureKey(secretKey, date, service);
        let signature = this.hmacSha256(signingKey, str2sign, 'hex');
        return signature;
    }

    static hmacSha256(key, msg, method) {
        let hmac = crypto.createHmac("sha256", key || "");
        return hmac.update(Buffer.from(msg, 'utf8')).digest(method);
    }

    static getSignatureKey(key, date, service) {
        let kDate = this.hmacSha256(('TC3' + key), date, '');
        let kService = this.hmacSha256(kDate, service, '');
        let kSigning = this.hmacSha256(kService, 'tc3_request', '');
        return kSigning;
    }
}
module.exports = Sign;
