const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const connection = require("../mariadb");

router.use(express.json());

// 공통 에러 처리 함수
const handleError = (res, message, status = 500) => {
  res.status(status).json({ error: message });
};

// 공통 유효성 검사 결과 처리 함수
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// 로그인
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("유효한 이메일 주소를 입력해주세요."),
    body("password").notEmpty().withMessage("비밀번호를 입력해주세요."),
  ],
  handleValidationErrors,
  (req, res) => {
    const { email, password } = req.body;

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
  }
);

// 회원가입
router.post(
  "/join",
  [
    body("email").isEmail().withMessage("유효한 이메일 주소를 입력해주세요."),
    body("name").notEmpty().withMessage("이름을 입력해주세요."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("비밀번호는 최소 6자리여야 합니다."),
    body("contact").notEmpty().withMessage("연락처를 입력해주세요."),
  ],
  handleValidationErrors,
  (req, res) => {
    const { email, name, password, contact } = req.body;

    connection.query(
      `INSERT INTO \`users\` (email, name, contact, password) VALUES (?, ?, ?, ?)`,
      [email, name, contact, password],
      (err, result) => {
        if (err) return handleError(res, "서버 오류");

        return res.status(201).json({ message: "회원가입 성공", result });
      }
    );
  }
);

// 사용자 정보 조회 및 삭제
router
  .route("/users")
  .get(
    [body("email").isEmail().withMessage("유효한 이메일 주소를 입력해주세요.")],
    handleValidationErrors,
    (req, res) => {
      const { email } = req.body;

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
    }
  )
  .delete(
    [body("email").isEmail().withMessage("유효한 이메일 주소를 입력해주세요.")],
    handleValidationErrors,
    (req, res) => {
      const { email } = req.body;

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
    }
  );

module.exports = router;
