import AuthService from '~/background/services/AuthService';
import {
    fromHexString,
} from '~/utils/encryptedViewingKey';
import decodePrivateKey from '~/background/utils/decodePrivateKey';

export default async function decryptViewingKey(viewingKey) {
    if (!viewingKey) {
        return '';
    }

    const keyStore = await AuthService.getKeyStore();
    const {
        pwDerivedKey,
    } = await AuthService.getSession() || {};
    if (!keyStore || !pwDerivedKey) {
        return '';
    }

    let decryptedViewingKey;
    try {
        const privateKey = decodePrivateKey(keyStore, pwDerivedKey);
        decryptedViewingKey = fromHexString(viewingKey).decrypt(privateKey);
    } catch (e) {
        return '';
    }

    return decryptedViewingKey;
}
