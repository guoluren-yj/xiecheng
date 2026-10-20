/**
 * IdMapper — ID 压缩工具
 *
 * 使用 Base62 编码将长数字 ID 压缩为短字符串。
 * 目的：减少发给 LLM 的 Token 用量。
 *
 * 示例：123456789012345678 → "00"
 *
 * @date: 2026-06-12
 */

const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

class IdMapper {
  /**
   * @param {Object} [existingMapping]
   * @param {Object} [existingMapping.encode]
   * @param {Object} [existingMapping.decode]
   */
  constructor(existingMapping) {
    /** @type {Map<string, string>} */
    this.encodeMap = new Map();

    /** @type {Map<string, string>} */
    this.decodeMap = new Map();

    this.counter = 0;

    if (existingMapping) {
      if (existingMapping.encode) {
        Object.entries(existingMapping.encode).forEach(([k, v]) => this.encodeMap.set(k, v));
      }
      if (existingMapping.decode) {
        Object.entries(existingMapping.decode).forEach(([k, v]) => this.decodeMap.set(k, v));
      }
      this.counter = this.decodeMap.size;
    }
  }

  /**
   * 将原始 ID 编码为短 ID
   * @param {string} originalId
   * @returns {string}
   */
  encode(originalId) {
    const existing = this.encodeMap.get(String(originalId));
    if (existing) return existing;

    const shortId = this._toBase62(this.counter++);
    const strId = String(originalId);
    this.encodeMap.set(strId, shortId);
    this.decodeMap.set(shortId, strId);
    return shortId;
  }

  /**
   * 将短 ID 解码为原始 ID
   * @param {string} shortId
   * @returns {string|undefined}
   */
  decode(shortId) {
    return this.decodeMap.get(shortId);
  }

  /**
   * 序列化为可传输的 JSON 对象
   * @returns {{ encode: Record<string, string>, decode: Record<string, string> }}
   */
  serialize() {
    const encode = {};
    const decode = {};
    this.encodeMap.forEach((v, k) => {
      encode[k] = v;
    });
    this.decodeMap.forEach((v, k) => {
      decode[k] = v;
    });
    return { encode, decode };
  }

  /**
   * 将数字转为 Base62 字符串
   * @param {number} num
   * @returns {string}
   */
  _toBase62(num) {
    if (num === 0) return '00';
    let result = '';
    let n = num;
    while (n > 0) {
      result = BASE62_CHARS[n % 62] + result;
      n = Math.floor(n / 62);
    }
    return result.padStart(2, '0');
  }
}

export default IdMapper;
