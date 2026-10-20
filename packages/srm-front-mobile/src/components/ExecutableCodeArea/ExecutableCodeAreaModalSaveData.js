export default class ExecutableCodeAreaModalSaveData {
  static inputingData = {};

  static debugParams = {};

  static removeAutoSaveData(id) {
    if (id) {
      this.inputingData[id] = null;
    }
  }

  // 保存测试参数
  static saveDebugParam(id, param) {
    if (!id) {
      return;
    }
    this.debugParams[id] = param;
    localStorage.setItem(id, param || '');
  }

  // 获取调试参数
  static getDebugParam(id) {
    // 二级缓存：内存有使用内存的；内存中没有，在localStorage中获取
    if (!id) {
      return null;
    }
    let result = this.debugParams[id];
    if (!result) {
      result = localStorage.getItem(id);
    }
    return result;
  }
}
