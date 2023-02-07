import express from 'express';
import { createServer, Server } from 'http';
import {MultiPartService} from "../service/multi-part-service";
import cors from 'cors';
import {MorganMiddleware} from "../service/morgan-middleware";
let env  = require("../.env.json");

export class ExpressServer {
    private readonly _app: express.Application;
    private readonly server: Server;
    private readonly port: string | number;
    private service:MultiPartService;
    constructor (port:number, service:MultiPartService) {
        this.service = service;
        this.port = port;
        this._app = express();
        this._app.use(express.json());
        this._app.use(express.urlencoded({ extended: true }));
        this._app.use(cors(env.cors));
        this._app.use(MorganMiddleware);
        this._app.enable("trust proxy");
        this.server = createServer(this._app);
        this.listen();
        this.routes();
    }

    private listen (): void {
        console.log("init listen");
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });
    }

    private routes (): void {
        console.log("init routes");
        this._app.get("/status",    (req, res) => {
            console.log((env.cors.origin === "https://4based.com") ? "your on the production system" : "your on the staging system");
            res.send(((env.cors.origin === "https://4based.com") ? "your on the production system" : "your on the staging system"));
        });
        this._app.post("/uploads/initializeMultipartUpload",    (req, res) => {
            (async () => {
                await this.service.initializeMultipartUpload(req, res);
            })();
        });
        this._app.post("/uploads/getMultipartPreSignedUrls",    (req, res) => {
            (async () => {
                await this.service.getMultipartPreSignedUrls(req, res);
            })();
        });
        this._app.post("/uploads/finalizeMultipartUpload",(req, res) => {
            (async () => {
                await this.service.finalizeMultipartUpload(req, res);
            })();
        });
    }

    get app (): express.Application {
        return this._app;
    }
}
