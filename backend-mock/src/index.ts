import express from "express";
import morgan from "morgan";
import { MainController } from "./controller";
import { errorHandler } from "./helpers/error-handler";
import cors from 'cors';

const PORT = 3333;

export const CreateApp = (): express.Express => {
    // App setup
    const app = express();
    app.use(cors())
    app.use(express.json());
    app.use(morgan("combined"));

    // Register controllers
    const mainController = new MainController();
    mainController.registerRoutes(app);

    // Register error handler
    app.use(errorHandler);

    return app;
};

// Main entrypoint
(() => {
    const app = CreateApp();
    app.listen(PORT, () => {
        console.log(`Service started successfully on port ${PORT}`);
    });
})();
