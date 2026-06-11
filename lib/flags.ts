/** Master switch for monetization UI. Keep FALSE until RevenueCat products are live
 *  in App Store Connect — flipping it on (and wiring purchases) is the launch step. */
export const MONETIZATION_ENABLED = false;

/** Master switch for the anonymous co-presence feed. Keep FALSE until the v1.1
 *  review cycle updates the App Privacy label (the published label says
 *  "Data Not Collected"; opt-in presence sharing adds anonymized Usage Data). */
export const PRESENCE_ENABLED = false;
