// 兼容旧版本的浏览器不支持 replaceAll
if (!String.prototype.replaceAll) {
  // eslint-disable-next-line no-extend-native
  String.prototype.replaceAll = function (search, replacement) {
    return this.replace(new RegExp(search, 'g'), replacement);
  };
}

// 兼容旧版本的浏览器不支持 array.at
if (!Array.prototype.at) {
  // eslint-disable-next-line no-extend-native
  Object.defineProperty(Array.prototype, 'at', {
    value(index) {
      // 处理负索引
      if (index < 0) {
        // eslint-disable-next-line no-param-reassign
        index = this.length + index;
      }
      // 检查索引是否有效
      if (index >= 0 && index < this.length) {
        return this[index];
      }
      // 如果索引无效，返回 undefined
      return undefined;
    },
    writable: false,
    configurable: true,
    enumerable: false,
  });
}
