const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true, // 입력값의 공백이나 그런것을 없애주는 역할을 함
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    type: Number,
    default: 0, // 지정하지 않으면 0으로
  },
  image: String,
  token: {
    // 토큰으로 나중에 유효성관리
    type: String,
  },
  tokenExp: {
    // 토큰 유효기간(토큰 사용할 수 있는 기간)
    type: Number,
  },
});

// 이 스키마를 모델로 감싸준다. mongoose.model('이 모델의 이름', 스키마) 넣어주기
const User = mongoose.model("User", userSchema);

module.exports = { User }; // 이것을 다른곳에서도 쓸수있게 module.export를 해준다.
