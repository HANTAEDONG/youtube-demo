const express = require("express");
const router = express.Router();
const connection = require("../mariadb");
const { body, param, validationResult } = require("express-validator");

router.use(express.json());

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router
  .route("/")
  // 채널 생성
  // 채널 생성 전에 중복 이름 확인
  .post(
    [
      body("userId").notEmpty().isInt().withMessage("숫자를 입력해주세요!"),
      body("name")
        .notEmpty()
        .isString()
        .withMessage("문자 형식으로 입력해주세요"),
    ],
    handleValidationErrors,
    (req, res, next) => {
      const { name } = req.body;
      const query = `SELECT * FROM \`channels\` WHERE name = ?`;
      connection.query(query, [name], (err, results) => {
        if (err) return res.status(500).json({ error: "서버 오류" });
        if (results.length > 0) {
          return res
            .status(400)
            .json({ error: "이미 존재하는 채널 이름입니다." });
        }
        next(); // 중복되지 않았으면 다음 미들웨어로
      });
    },
    (req, res) => {
      const { name, userId } = req.body;
      const query = `INSERT INTO \`channels\` (name, user_id) VALUES (?, ?)`;
      connection.query(query, [name, userId], (err, result) => {
        if (err) return res.status(500).json({ error: "서버 오류" });
        res.status(201).json({ message: `${name} 채널을 응원합니다.` });
      });
    }
  )
  // 특정 회원 조회
  .get((req, res) => {
    const query = `SELECT * FROM \`channels\``;
    connection.query(query, (err, results) => {
      if (err) return res.status(500).json({ error: "서버 오류" });
      if (results.length === 0) {
        return res
          .status(404)
          .json({ error: "해당 사용자를 찾을 수 없습니다." });
      }
      res.status(200).json(results); // 결과를 리스트 형태로 반환
    });
  });

router
  // SELECT 채널 개별 "조회" : GET /channels/:id
  .route("/:id")
  .get(
    [param("id").notEmpty().isInt().withMessage("채널 ID는 숫자여야 합니다.")],
    handleValidationErrors,
    (req, res) => {
      const { id } = req.params;
      const query = `SELECT * FROM \`channels\` WHERE id = ?`;
      connection.query(query, [id], (err, results) => {
        // 서버 에러
        if (err) return res.status(500).json({ error: "서버 오류" });
        // 해당 id에 대한 데이터가 없는 경우
        if (results.length === 0) {
          return res
            .status(404)
            .json({ error: "해당 채널을 찾을 수 없습니다." });
        }
        // 정상적으로 데이터 반환
        res.status(200).json(results[0]); // 개별 채널 정보 반환
      });
    }
  )
  .put(
    [
      param("id").isInt().withMessage("채널 ID는 숫자여야 합니다."),
      body("name").notEmpty().isString().withMessage("채널 이름을 입력하세요."),
    ],
    handleValidationErrors,
    (req, res, next) => {
      const { id } = req.params;
      const { name } = req.body;
      const query = `SELECT * FROM \`channels\` WHERE name = ? AND id != ?`;
      connection.query(query, [name, id], (err, results) => {
        if (err) return res.status(500).json({ error: "서버 오류" });
        if (results.length > 0) {
          return res
            .status(400)
            .json({ error: "이미 존재하는 채널 이름입니다." });
        }
        next(); // 이름이 중복되지 않았을 때만 업데이트 진행
      });
    },
    (req, res) => {
      const { id } = req.params;
      const { name } = req.body;
      const query = `UPDATE \`channels\` SET name = ? WHERE id = ?`;
      connection.query(query, [name, id], (err, result) => {
        if (err) return res.status(500).json({ error: "서버 오류" });
        if (result.affectedRows === 0) {
          return res
            .status(404)
            .json({ error: "해당 채널을 찾을 수 없습니다." });
        }
        res.status(200).json({
          message: `채널명이 성공적으로 수정되었습니다. 기존: ${id} -> 수정: ${name}`,
        });
      });
    }
  )

  .delete(
    [param("id").notEmpty().isInt().withMessage("채널 ID는 숫자여야 합니다.")],
    handleValidationErrors,
    (req, res) => {
      const { id } = req.params;
      const query = `DELETE FROM \`channels\` WHERE id = ?`;
      connection.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ error: "서버 오류" });
        if (result.affectedRows === 0) {
          return res
            .status(404)
            .json({ error: "해당 채널을 찾을 수 없습니다." });
        }
        res
          .status(200)
          .json({ message: `채널이 정상적으로 삭제되었습니다. ID: ${id}` });
      });
    }
  );

module.exports = router;
