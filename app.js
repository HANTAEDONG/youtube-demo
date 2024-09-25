const express = require("express");
const app = express();
const port = 8000;

app.listen(port, () => {
  console.log(`서버가 ${port}번 포트에서 실행 중입니다.`);
});

const userRouter = require("./routes/users");
const channelRouter = require("./routes/channels");

app.use("/", userRouter);
app.use("/channels", channelRouter);
const maraidb = require("./mariadb");
maraidb.connect();
