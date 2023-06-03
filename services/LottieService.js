let lottieInstance = null;

export default async function $lottie() {
  if (!lottieInstance) {
    lottieInstance = await import('lottie-web');
  }
  return lottieInstance;
}
