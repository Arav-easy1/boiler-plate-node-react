const express = require("express"); // express를 가져와서
const app = express(); // express앱을 넣어서
const port = 3000; // port 번호를 정하고

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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
