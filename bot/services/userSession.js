const userStates = new Map();
const userData = new Map();
const userProfiles = new Map();

class UserSession {
    static setUserState(chatId, state) {
        userStates.set(chatId, state);
    }

    static getUserState(chatId) {
        return userStates.get(chatId);
    }

    static setUserData(chatId, data) {
        userData.set(chatId, { ...userData.get(chatId), ...data });
    }

    static getUserData(chatId) {
        return userData.get(chatId) || {};
    }

    static clearUserState(chatId) {
        userStates.delete(chatId);
        userData.delete(chatId);
    }

    static getUserProfile(chatId) {
        return userProfiles.get(chatId);
    }

    static setUserProfile(chatId, profile) {
        userProfiles.set(chatId, profile);
    }

    static getAllUsers() {
        return {
            states: Array.from(userStates.entries()),
            data: Array.from(userData.entries()),
            profiles: Array.from(userProfiles.entries())
        };
    }
}

module.exports = UserSession;
