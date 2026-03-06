// Mock AbortSignal.timeout if not available in test env
if (!AbortSignal.timeout) {
  AbortSignal.timeout = function (ms) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
  };
}
