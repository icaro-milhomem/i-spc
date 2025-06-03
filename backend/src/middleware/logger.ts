import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

// Cria o diretório de logs se não existir
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Função para formatar a data
const formatDate = (date: Date): string => {
  return date.toISOString().replace('T', ' ').substring(0, 19);
};

// Função para escrever no arquivo de log
const writeLog = (message: string) => {
  const date = new Date();
  const fileName = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.log`;
  const filePath = path.join(logDir, fileName);
  
  const logMessage = `[${formatDate(date)}] ${message}\n`;
  
  fs.appendFileSync(filePath, logMessage);
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log da requisição
  const requestLog = `REQUEST: ${req.method} ${req.url} - IP: ${req.ip}`;
  writeLog(requestLog);
  
  // Log do corpo da requisição (exceto senhas)
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.senha) {
      sanitizedBody.senha = '******';
    }
    writeLog(`REQUEST BODY: ${JSON.stringify(sanitizedBody)}`);
  }
  
  // Intercepta a resposta
  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - start;
    
    // Log da resposta
    const responseLog = `RESPONSE: ${req.method} ${req.url} - Status: ${res.statusCode} - Duration: ${duration}ms`;
    writeLog(responseLog);
    
    // Log do corpo da resposta (exceto senhas)
    if (body) {
      try {
        const parsedBody = JSON.parse(body.toString());
        const sanitizedBody = { ...parsedBody };
        if (sanitizedBody.senha) {
          sanitizedBody.senha = '******';
        }
        writeLog(`RESPONSE BODY: ${JSON.stringify(sanitizedBody)}`);
      } catch (e) {
        // Ignora erros de parsing
      }
    }
    
    return originalSend.call(this, body);
  };
  
  next();
};

export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const errorLog = `ERROR: ${req.method} ${req.url} - ${err.message}\n${err.stack}`;
  writeLog(errorLog);
  next(err);
}; 