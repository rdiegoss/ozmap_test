import express from 'express';
import './db/database';
import errorMiddleware from './middlewares/error.middleware';
import usersRoute from './routes/users.route';
import regionsRoute from './routes/regions.route';
import exportRoute from './routes/export.route';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from './swagger.json';
import logger from './middlewares/logger.middleware';

const PORT = process.env.API_PORT || 3002;

const server = express();

server.use(express.json());
server.use(logger);

server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

server.use('/users', usersRoute);
server.use('/regions', regionsRoute);
server.use('/export', exportRoute);

server.use(errorMiddleware);

export default server.listen(PORT, () => console.log('Server listening on port', PORT));
