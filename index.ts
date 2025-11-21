import bodyParser from "body-parser";
import express, { Application } from "express";
import router from "./src/routes/routes";

const app: Application = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", router);

const PORT = 8686;

app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(`API Documentation available at /auth`);
});
