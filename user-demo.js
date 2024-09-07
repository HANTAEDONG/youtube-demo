const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

const userInfoMap = new Map();
userInfoMap.set(1, {
  name: "강남",
  id: 1,
  pwd: "123dkjf24",
});

app.post("/login", (req, res) => {
  const loginInfo = req.body;
  const userInfo = userInfoMap.get(loginInfo.id); // 유저 정보를 가져옵니다.
  if (userInfo) {
    res.status(200).json({
      message: `${userInfo.name}님 로그인 되셨습니다.`,
    });
    console.log(userInfo); // 유저 정보가 있을 때만 로그를 남깁니다.
  } else {
    res.status(404).json({
      message: "찾을 수 없는 회원입니다.",
    });
  }
});

app.post("/join", (req, res) => {
  const userInfo = req.body;
  // 기존 맵과 비교하여 겹치는 아이디 있나 확인
  if (userInfoMap.get(userInfo.id)) {
    res.json({
      message: "중복된 아이디입니다.",
    });
  }
  userInfoMap.set(userInfo.id, userInfo);
  console.log(userInfoMap.get(userInfo.id));
  const newUser = userInfoMap.get(userInfo.id);
  if (newUser) {
    res
      .status(201)
      .json({ message: `${newUser.name}님 회원이 되신 것을 환영합니다.` });
  } else {
    res.status(404).json({
      message: "오류가 발생했습니다.",
    });
  }
});

app.get("/user/:id", (req, res) => {
  let id = req.params;
  id = parseInt(id);
  if (userInfoMap.get(id)) {
    console.log(userInfoMap.get(id));
    res.status(201).json({ message: userInfoMap.get(id) });
  }
});

app.listen(port, () => {
  console.log(`http://localhost:${port}/ 서버 구동됨.`);
});
