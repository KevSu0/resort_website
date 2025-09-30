"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vite_1 = require("vite");
var plugin_react_1 = require("@vitejs/plugin-react");
var path_1 = require("path");
// https://vite.dev/config/
exports.default = (0, vite_1.defineConfig)(function (_a) {
    var mode = _a.mode;
    var env = (0, vite_1.loadEnv)(mode, process.cwd(), '');
    return {
        plugins: [(0, plugin_react_1.default)()],
        resolve: {
            alias: {
                '@': path_1.default.resolve(__dirname, '../src'),
            },
        },
        define: {
            // Expose environment variables to the client
            'import.meta.env.VITE_SITE_EMAIL_FROM': JSON.stringify(env.SITE_EMAIL_FROM || ''),
            'import.meta.env.VITE_WHATSAPP_CONTACT_NUMBER': JSON.stringify(env.WHATSAPP_CONTACT_NUMBER || ''),
        },
    };
});
