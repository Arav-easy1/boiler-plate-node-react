const express = require("express"); // express를 가져와서
const app = express(); // express앱을 넣어서
const port = 3000; // port 번호를 정하고

// 유저 정보를 받아온다.
const { User } = require("./models/User");
// bodyParser도 넣어줌.
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const config = require("./config/key");
const { auth } = require("./middleware/auth");

// bodyParser 옵션
// application/x-www-form-urlencoded 이렇게 생긴 것을 분석해서 가져오는 옵션
app.use(bodyParser.urlencoded({ extended: true }));
// application/json 타입으로 된것을 분석해서 가져오는 옵션.
app.use(bodyParser.json());
app.use(cookieParser());

// npm install mongoose --save 해서 mongodb와 연결하는 라이브러리 설치해주고
// 요청한다.
// connect()안에 mongodb cluster connection안에 있는 소스를 copy해서 붙여 넣어주고, 뒤에 설정사항들을 적어준다(안적으면 에러날 확률이 높아짐)
const mongoose = require("mongoose");
const auth = require("./middleware/auth");
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  }) // 잘 연결이 됐으면 연결됐다고 뜨고 아니면 에러나오게 함.
  .then(() => console.log("MongoDB Connected.."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!~~~~~~~~~~~~~~~~~~~");
});

app.post("/api/users/register", (req, res) => {
  // 회원가입할 때 필요한 정보들을 client에서 가져오면 그것들을 DB에 넣어준다.
  const user = new User(req.body); //req.body는 json 형식임.

  // 이건 mongoDB에서 오는 함수임.
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err }); // error가 나면 json형식으로 success가 false라는 것도 전달해주고, err로 에러메세지도 전달해준다.
    // 성공했다면 status(200) 성공했다는 표시이고 역시 json 형식으로 success가 true라는 것을 전달.
    return res.status(200).json({
      success: true,
    });
  });
});

app.post("/api/users/login", (req, res) => {
  // 요청된 이메일을 DB에 있는지 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err)
      return res.json({
        loginSuccess: false,
        err,
      });
    // 해당하는 이메일을 가진 유저가 없다면 user가 없을테니
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다.",
      });
    }
    // 요청된 이메일이 DB에 있다면 비밀번호가 맞는지 확인.
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (err)
        return res.json({
          loginSuccess: false,
          err,
        });
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });

      // 비밀번호까지 같다면 토큰을 생성하기.
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        // 토큰을 저장한다. 어디에? 쿠키, 로컬스토리지
        // x_auth라는 이름으로 user.token에 담긴 값이 쿠키에 저장됨.
        res.cookie("x_auth", user.token).status(200).json({
          loginSuccess: true,
          userId: user._id,
        });
      });
    });
  });
});

app.get("/api/users/auth", auth, (req, res) => {
  // 여기까지 미들웨어를 통과해왔다는 얘기는 Authentication이 true라는 말.
  res.status(200).json({
    // 넘기고 싶은 정보만 넘기면 됨.
    _id: req.user._id,
    // role 0 -> 일반유저, role 0 이 아니면 관리자
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
