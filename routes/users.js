const express = require("express");
const router = express.Router();
const connection = require("../mariadb");

router.use(express.json());

// 공통 에러 처리 함수
const handleError = (res, message, status = 500) => {
  res.status(status).json({ error: message });
};

// 로그인
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return handleError(res, "이메일과 비밀번호를 모두 입력해주세요", 400);
  }

  connection.query(
    `SELECT * FROM \`users\` WHERE email = ?`,
    [email],
    (err, results) => {
      if (err) return handleError(res, "서버 오류");

      if (results.length === 0) {
        return handleError(
          res,
          "해당 이메일을 가진 사용자를 찾을 수 없습니다.",
          404
        );
      }

      const user = results[0];
      if (user.password === password) {
        return res.status(200).json({ message: "로그인 성공", user });
      }

      return handleError(res, "비밀번호가 일치하지 않습니다.", 401);
    }
  );
});

// 회원가입
router.post("/join", (req, res) => {
  const { email, name, password, contact } = req.body;

  if (!email || !name || !password || !contact) {
    return handleError(res, "모든 필드를 입력해주세요", 400);
  }

  connection.query(
    `INSERT INTO \`users\` (email, name, contact, password) VALUES (?, ?, ?, ?)`,
    [email, name, contact, password],
    (err, result) => {
      if (err) return handleError(res, "서버 오류");

      return res.status(201).json({ message: "회원가입 성공", result });
    }
  );
});

// 사용자 정보 조회 및 삭제
router
  .route("/users")
  .get((req, res) => {
    const { email } = req.body;

    if (!email) {
      return handleError(res, "이메일을 입력해주세요", 400);
    }

    connection.query(
      `SELECT * FROM \`users\` WHERE email = ?`,
      [email],
      (err, results) => {
        if (err) return handleError(res, "서버 오류");

        if (results.length === 0) {
          return handleError(
            res,
            "해당 이메일을 가진 사용자를 찾을 수 없습니다.",
            404
          );
        }

        return res.status(200).json(results);
      }
    );
  })
  .delete((req, res) => {
    const { email } = req.body;

    if (!email) {
      return handleError(res, "이메일을 입력해주세요", 400);
    }

    connection.query(
      `DELETE FROM \`users\` WHERE email = ?`,
      [email],
      (err, results) => {
        if (err) return handleError(res, "서버 오류");

        if (results.affectedRows === 0) {
          return handleError(
            res,
            "해당 이메일을 가진 사용자를 찾을 수 없습니다.",
            404
          );
        }

        return res.status(200).json({ message: "사용자 삭제 성공", results });
      }
    );
  });

module.exports = router;
