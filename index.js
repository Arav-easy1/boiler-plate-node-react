const express = require("express"); // express를 가져와서
const app = express(); // express앱을 넣어서
const port = 3000; // port 번호를 정하고

// 유저 정보를 받아온다.
const { User } = require("./models/User");
// bodyParser도 넣어줌.
const bodyParser = require("body-parser");

// bodyParser 옵션
// application/x-www-form-urlencoded 이렇게 생긴 것을 분석해서 가져오는 옵션
app.use(bodyParser.urlencoded({ extended: true }));
// application/json 타입으로 된것을 분석해서 가져오는 옵션.
app.use(bodyParser.json());

// npm install mongoose --save 해서 mongodb와 연결하는 라이브러리 설치해주고
// 요청한다.
// connect()안에 mongodb cluster connection안에 있는 소스를 copy해서 붙여 넣어주고, 뒤에 설정사항들을 적어준다(안적으면 에러날 확률이 높아짐)
const mongoose = require("mongoose");
mongoose
  .connect(
    "mongodb+srv://arav-easy1:arav1234@boilerplate.h0gtw.mongodb.net/<dbname>?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
  ) // 잘 연결이 됐으면 연결됐다고 뜨고 아니면 에러나오게 함.
  .then(() => console.log("MongoDB Connected.."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/register", (req, res) => {
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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
