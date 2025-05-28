"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLogger = exports.requestLogger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logDir = path_1.default.join(__dirname, '../../logs');
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir);
}
const formatDate = (date) => {
    return date.toISOString().replace('T', ' ').substring(0, 19);
};
const writeLog = (message) => {
    const date = new Date();
    const fileName = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.log`;
    const filePath = path_1.default.join(logDir, fileName);
    const logMessage = `[${formatDate(date)}] ${message}\n`;
    fs_1.default.appendFileSync(filePath, logMessage);
};
const requestLogger = (req, res, next) => {
    const start = Date.now();
    const requestLog = `REQUEST: ${req.method} ${req.url} - IP: ${req.ip}`;
    writeLog(requestLog);
    if (req.body && Object.keys(req.body).length > 0) {
        const sanitizedBody = Object.assign({}, req.body);
        if (sanitizedBody.senha) {
            sanitizedBody.senha = '******';
        }
        writeLog(`REQUEST BODY: ${JSON.stringify(sanitizedBody)}`);
    }
    const originalSend = res.send;
    res.send = function (body) {
        const duration = Date.now() - start;
        const responseLog = `RESPONSE: ${req.method} ${req.url} - Status: ${res.statusCode} - Duration: ${duration}ms`;
        writeLog(responseLog);
        if (body) {
            try {
                const parsedBody = JSON.parse(body.toString());
                const sanitizedBody = Object.assign({}, parsedBody);
                if (sanitizedBody.senha) {
                    sanitizedBody.senha = '******';
                }
                writeLog(`RESPONSE BODY: ${JSON.stringify(sanitizedBody)}`);
            }
            catch (e) {
            }
        }
        return originalSend.call(this, body);
    };
    next();
};
exports.requestLogger = requestLogger;
const errorLogger = (err, req, res, next) => {
    const errorLog = `ERROR: ${req.method} ${req.url} - ${err.message}\n${err.stack}`;
    writeLog(errorLog);
    next(err);
};
exports.errorLogger = errorLogger;
