"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weeklyLeaderboardSnapshot = exports.processDuckEvent = void 0;
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
const USERS = 'users';
const DUCK_EVENTS = 'duckEvents';
const LEADERBOARDS = 'leaderboards';
const BASE_FIRST_DUCK = 5;
const BASE_REGULAR = 3;
const NIGHT_OWL_BONUS = 2;
const REVENGE_MULTIPLIER = 2;
const CHAIN_BONUS = 10;
const SELF_DUCK_PENALTY = -5;
function getRankTitle(totalPoints) {
    if (totalPoints >= 200)
        return 'Supreme Duckinator';
    if (totalPoints >= 50)
        return 'Quack Assassin';
    if (totalPoints >= 10)
        return 'Quack Lord';
    return 'Sitting Duck';
}
function isNightOwl(ts) {
    const d = ts.toDate();
    const hour = d.getUTCHours();
    return hour >= 22 || hour < 6;
}
exports.processDuckEvent = functions.firestore
    .document(`${DUCK_EVENTS}/{eventId}`)
    .onCreate(async (snap, context) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const eventId = context.params.eventId;
    const data = snap.data();
    const fromUid = data.fromUid;
    const toUid = data.toUid;
    const timestamp = data.timestamp;
    if (!fromUid || !toUid)
        return;
    const isSelfDuck = fromUid === toUid;
    let points = 0;
    let isRevenge = false;
    let chainLength = 0;
    if (isSelfDuck) {
        points = SELF_DUCK_PENALTY;
    }
    else {
        const [firstDuckSnap, revengeSnap, fromEventsSnap] = await Promise.all([
            db.collection(DUCK_EVENTS).where('toUid', '==', toUid).limit(1).get(),
            db.collection(DUCK_EVENTS).where('fromUid', '==', toUid).where('toUid', '==', fromUid).limit(1).get(),
            db.collection(DUCK_EVENTS).where('fromUid', '==', fromUid).orderBy('timestamp', 'desc').limit(10).get(),
        ]);
        const isFirstDuckOnUser = firstDuckSnap.empty || (firstDuckSnap.docs.length === 1 && firstDuckSnap.docs[0].id === eventId);
        const basePoints = isFirstDuckOnUser ? BASE_FIRST_DUCK : BASE_REGULAR;
        points = basePoints;
        if (isNightOwl(timestamp))
            points += NIGHT_OWL_BONUS;
        if (!revengeSnap.empty) {
            isRevenge = true;
            points *= REVENGE_MULTIPLIER;
        }
        const fromEvents = fromEventsSnap.docs;
        if (fromEvents.length >= 3) {
            chainLength = fromEvents.length;
            points += CHAIN_BONUS;
            points *= 2;
        }
    }
    await snap.ref.update({
        pointsAwarded: points,
        isRevenge: isSelfDuck ? false : isRevenge,
        chainLength: chainLength || admin.firestore.FieldValue.delete(),
    });
    const fromUserSnap = await db.collection(USERS).doc(fromUid).get();
    const toUserSnap = await db.collection(USERS).doc(toUid).get();
    const fromData = fromUserSnap.data();
    const toData = toUserSnap.data();
    const fromTotalPoints = ((_a = fromData === null || fromData === void 0 ? void 0 : fromData.totalPoints) !== null && _a !== void 0 ? _a : 0) + points;
    const fromTotalDucksGiven = ((_b = fromData === null || fromData === void 0 ? void 0 : fromData.totalDucksGiven) !== null && _b !== void 0 ? _b : 0) + 1;
    const toTotalDucksReceived = ((_c = toData === null || toData === void 0 ? void 0 : toData.totalDucksReceived) !== null && _c !== void 0 ? _c : 0) + 1;
    const newStreak = ((_d = fromData === null || fromData === void 0 ? void 0 : fromData.currentStreak) !== null && _d !== void 0 ? _d : 0) + 1;
    const newBestStreak = Math.max(((_e = fromData === null || fromData === void 0 ? void 0 : fromData.bestStreak) !== null && _e !== void 0 ? _e : 0), newStreak);
    await db.collection(USERS).doc(fromUid).update({
        totalDucksGiven: fromTotalDucksGiven,
        totalPoints: fromTotalPoints,
        currentStreak: newStreak,
        bestStreak: newBestStreak,
        rankTitle: getRankTitle(fromTotalPoints),
    });
    await db.collection(USERS).doc(toUid).update({
        totalDucksReceived: toTotalDucksReceived,
        currentStreak: 0,
    });
    const fromDisplayName = (_g = (_f = fromData === null || fromData === void 0 ? void 0 : fromData.displayName) !== null && _f !== void 0 ? _f : fromData === null || fromData === void 0 ? void 0 : fromData.username) !== null && _g !== void 0 ? _g : 'Someone';
    const pushToken = toData === null || toData === void 0 ? void 0 : toData.pushToken;
    if (pushToken && !isSelfDuck) {
        try {
            await admin.messaging().send({
                token: pushToken,
                notification: {
                    title: "You've been ducked!",
                    body: `You just got ducked by ${fromDisplayName}!`,
                },
            });
        }
        catch (_) {
            // ignore FCM errors
        }
    }
});
function getWeekStart(d) {
    const day = d.getUTCDay();
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d);
    monday.setUTCDate(diff);
    return monday.toISOString().slice(0, 10);
}
exports.weeklyLeaderboardSnapshot = functions.pubsub
    .schedule('0 0 * * 0')
    .timeZone('UTC')
    .onRun(async (_context) => {
    const now = new Date();
    const weekStartStr = getWeekStart(now);
    const weekStartDate = new Date(weekStartStr + 'T00:00:00.000Z');
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 7);
    const eventsSnap = await db
        .collection(DUCK_EVENTS)
        .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(weekStartDate))
        .where('timestamp', '<', admin.firestore.Timestamp.fromDate(weekEndDate))
        .get();
    const scores = {};
    eventsSnap.docs.forEach((doc) => {
        var _a, _b;
        const d = doc.data();
        const fromUid = d.fromUid;
        const pts = (_a = d.pointsAwarded) !== null && _a !== void 0 ? _a : 0;
        if (fromUid)
            scores[fromUid] = ((_b = scores[fromUid]) !== null && _b !== void 0 ? _b : 0) + pts;
    });
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const batch = db.batch();
    sorted.forEach(([userId, score], index) => {
        const ref = db.collection(LEADERBOARDS).doc(`${weekStartStr}_${userId}`);
        batch.set(ref, { weekStart: weekStartStr, userId, score, rank: index + 1 });
    });
    await batch.commit();
});
//# sourceMappingURL=index.js.map