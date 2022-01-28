const FileBoxesApi = require("./server").FileBoxesApi;

const API = new FileBoxesApi(
    { PORT: 5000 },
    { useNewUrlParser: true, useUnifiedTopology: true }
);

API.start();
