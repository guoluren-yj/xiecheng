import { action, observable } from 'mobx';

class Countdown {
  @observable count = 0;

  startTime = 0;

  @action
  setCount() {
    // 计算时间差
    const millis = Date.now() - this.startTime;
    const currentCount = 60 - Math.floor(millis / 1000);
    this.count = currentCount < 0 ? 0 : currentCount;
  }

  start(countStorage) {
    this.startTime = countStorage || Date.now();
    // 将请求验证码的时间放入sessionStorage
    window.sessionStorage.setItem('sendCaptchaTime', this.startTime);
    const timer = setInterval(() => {
      this.setCount();
      // 倒计时结束
      if (this.count <= 0) {
        clearInterval(timer);
        window.sessionStorage.removeItem('sendCaptchaTime');
      }
    }, 1000 / 3);
  }
}
const countdown = new Countdown();
export default countdown;
