// Polyfills for Jest testing environment

// TextEncoder and TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// AbortController
global.AbortController = AbortController;

// Request and Response
global.Request = Request;
global.Response = Response;

// Headers
global.Headers = Headers;

// FormData
global.FormData = FormData;

// URL and URLSearchParams
global.URL = URL;
global.URLSearchParams = URLSearchParams;

// Performance API
global.performance = performance;

// Structured Clone
global.structuredClone = structuredClone;

// Crypto API
if (!global.crypto) {
  global.crypto = require('crypto');
}

// Atomics
global.Atomics = Atomics;

// SharedArrayBuffer
global.SharedArrayBuffer = SharedArrayBuffer;

// WebAssembly
global.WebAssembly = WebAssembly;