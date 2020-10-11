const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

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

// mongoose에서 가져온 funcion임.
// 저장하기 전에 무엇을 하게한다.
userSchema.pre("save", function (next) {
  var user = this;

  // password에 변화가 있을 때만! 비밀번호 암호화하는 bcrypt가 실행되게 한다. (다른거 수정할때도 실행되면 번잡스러우니까)
  if (user.isModified("password")) {
    // 비밀번호를 암호화 시킨다.
    bcrypt.genSalt(saltRounds, function (err, salt) {
      // 에러 났으면 next()다음 동작 에 err을 넘겨준다.
      if (err) return next(err);

      // 암호화되지 않은 비밀번호와, salt, 그리고 function을 써준다. hash는 암호화된 비밀번호를 의미한다.
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        // Store hash in your password DB.
        user.password = hash; // hash된 비밀번호로 user.password를 바꿔준다.
        next();
      });
    });
  }
  // password를 건드리지 않은 경우에는 바로 next()를 써서 빠져나갈 수 있도록 한다. (안쓰면 못 빠져나가고 여기 머물러있음.)
  else {
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  // plainPassword test1234   암호화된 비밀번호 $2b$10$QcN2ClIsBFFTr23VnJnI9ub0WeBcughMhL2CEeXl1GkSDEb86GBca
  // 이 둘이 같은지를 체크한다.
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  var user = this;
  // jsonwebtoken을 이용해서 token을 생성하기.
  var token = jwt.sign(user._id.toHexString(), "secretToken");
  // user._id + 'secretToken' = token
  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

userSchema.statics.findByToken = function (token, cb) {
  var user = this;

  // 토큰을 decode한다.
  jwt.verify(token, "secretToken", function (err, decoded) {
    // 유저 아이디를 이용해서 유저를 찾은 다음에
    // 클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인
    user.findOne({ _id: decoded, token: token }, function (err, user) {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};

// 이 스키마를 모델로 감싸준다. mongoose.model('이 모델의 이름', 스키마) 넣어주기
const User = mongoose.model("User", userSchema);

module.exports = { User }; // 이것을 다른곳에서도 쓸수있게 module.export를 해준다.
