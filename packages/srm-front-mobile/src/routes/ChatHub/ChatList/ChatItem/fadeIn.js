class FadeIn {
  static initMap = {};

  static setInit(id) {
    this.initMap[id] = true;
  }

  static getInit(id) {
    return this.initMap[id];
  }
}

export default FadeIn;
