import { Request, Response, NextFunction } from 'express';

const redTerminalColor = '\x1b[31m';
const greenTerminalColor = '\x1b[32m';
const blueTerminalColor = '\x1b[36m';

const logger = (req: Request, res: Response, next: NextFunction) => {
  const startAt = process.hrtime();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const { statusCode } = res;
    const diff = process.hrtime(startAt);

    const responseTime = diff[0] * 1e3 + diff[1] * 1e-6;
    const now = new Date();
    const date = now.toLocaleDateString('pt-BR');
    const hour = now.toLocaleTimeString('pt-BR');
    const logContent = `${date} ${hour} [${method}] ${originalUrl} ${statusCode} ${responseTime.toFixed(2)}ms - ${ip}`;

    if (statusCode >= 500) console.log(`${redTerminalColor} ${logContent}`);
    else if (statusCode >= 400) console.log(`${blueTerminalColor} ${logContent}`);
    else console.log(`${greenTerminalColor} ${logContent}`);
  });

  next();
};

export default logger;
