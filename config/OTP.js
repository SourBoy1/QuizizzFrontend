export default {
  ValidOTPActions: {
    forgotPassword: 'forgotPassword',
    reactivate: 'reactivate',
    deactivate: 'deactivate',
  },

  OTPRequestTypes: {
    generateOtp: 'generateOtp',
    verifyOtpAndRedirect: 'verifyOtpAndRedirect',
    resendOtp: 'resendOtp',
  },

  OTPErrorStates: {
    EXPIRED: 'expired',
    SUCCESS: 'success',
    EXISTS: 'exists',
    INCORRECT: 'incorrect',
    BLACKLIST: 'blacklisted',
    UNKNOWN: 'unknown',
  },
};
