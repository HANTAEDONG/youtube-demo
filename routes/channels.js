const express = require("express");
const router = express.Router();

// JSON 데이터를 파싱하기 위한 미들웨어
router.use(express.json());

// 가정: 'db'는 키-값 쌍을 저장하고 있으며, 'size'와 'forEach' 메서드를 지원합니다.
const db = new Map(); // 예시 데이터베이스 구현
db.set("channel1", { id: 1, name: "Channel One" });
db.set("channel2", { id: 2, name: "Channel Two" });

// 모든 채널 목록 조회 (기존 코드)
router.get("/channels", (req, res) => {
  if (db.size) {
    // db에 데이터가 있는지 확인
    var channels = [];
    db.forEach(function (value, key) {
      // db의 모든 항목을 순회
      channels.push(value); // 각 항목의 값을 'channels' 배열에 추가
    });
    res.status(200).json(channels); // 200 상태 코드와 함께 채널 목록을 JSON 형태로 반환
  } else {
    res.status(404).json({ message: "존재하는 채널이 없습니다." }); // 채널이 없을 경우 404 상태 코드와 오류 메시지 반환
  }
});

// 특정 ID의 채널 조회 (새 코드)
router.get(" /:id", (req, res) => {
  const id = parseInt(req.params.id);
  let channel = null;

  // ID를 기준으로 Map에서 채널 검색
  db.forEach((value, key) => {
    if (value.id === id) {
      channel = value;
    }
  });

  if (channel) {
    res.status(200).json(channel); // 채널이 존재하면 반환
  } else {
    res.status(404).json({ message: "해당 ID의 채널을 찾을 수 없습니다." });
  }
});

// 채널 추가 (POST 요청 - 새 코드)
router.post("/channels", (req, res) => {
  const newChannel = req.body;

  if (!newChannel.id || !newChannel.name) {
    return res.status(400).json({ message: "ID와 이름이 필요합니다." });
  }

  if (db.has(`channel${newChannel.id}`)) {
    return res
      .status(400)
      .json({ message: "해당 ID의 채널이 이미 존재합니다." });
  }

  db.set(`channel${newChannel.id}`, newChannel);
  res
    .status(201)
    .json({ message: "새 채널이 추가되었습니다.", channel: newChannel });
});

// 채널 정보 수정 (PUT 요청 - 새 코드)
router.put("/channels/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const updatedChannel = req.body;

  if (!db.has(`channel${id}`)) {
    return res
      .status(404)
      .json({ message: "해당 ID의 채널을 찾을 수 없습니다." });
  }

  db.set(`channel${id}`, { id, ...updatedChannel });
  res.status(200).json({
    message: "채널 정보가 업데이트되었습니다.",
    channel: updatedChannel,
  });
});

// 채널 삭제 (DELETE 요청 - 새 코드)
router.delete("/channels/:id", (req, res) => {
  const id = parseInt(req.params.id);

  if (!db.has(`channel${id}`)) {
    return res
      .status(404)
      .json({ message: "해당 ID의 채널을 찾을 수 없습니다." });
  }

  db.delete(`channel${id}`);
  res.status(200).json({ message: "채널이 삭제되었습니다." });
});

module.exports = router;
