import intl from 'utils/intl';

function getRegExpStatus(flagCount, regStr, value) {
  const regStrArr = [];
  for (let i = 0; i < flagCount; i++) {
    regStrArr.push(regStr);
  }
  const reg = new RegExp(`${regStrArr.join('')}`);
  return reg.test(value);
}

export function validatePasswordRule(value = '', validData = {}) {
  // if (!value) {
  //   return intl
  //     .get('hzero.common.validation.notNull', {
  //       name,
  //     })
  //     .d(`${name}不能为空`);
  // }
  if (value) {
    const {
      // loginName, // 登录名
      digitsCount = 1, // 数字位数
      lowerCaseCount = 1, // 小写字母位数
      maxLength = 12, // 最大位数
      minLength = 6, // 最小位数
      // notUsername, // 是否校验用户名重复
      specialCharCount = 1, //  特殊字符位数
      upperCaseCount = 1, // 大写字母位数
    } = validData;

    const lengthFlag = value.length < minLength || value.length > maxLength;
    const lowerCaseCountFlag =
      lowerCaseCount && !getRegExpStatus(lowerCaseCount, '([a-z].*)', value);
    const upperCaseCountFlag =
      upperCaseCount && !getRegExpStatus(upperCaseCount, '([A-Z].*)', value);
    const digitsCountFlag = digitsCount && !getRegExpStatus(digitsCount, '([0-9].*)', value);
    const specialCharCountFlag =
      specialCharCount &&
      !getRegExpStatus(specialCharCount, '([~`@#$%^&*\\\\-_=+|/()<>,.;:!\\[\\]].*)', value);

    // 校验密码字符长度是否符合
    if (
      lengthFlag ||
      lowerCaseCountFlag ||
      upperCaseCountFlag ||
      digitsCountFlag ||
      specialCharCountFlag
    ) {
      return intl
        .get('sslm.supplierEntryDetail.validation.password', {
          minLength,
          maxLength,
          lowerCaseCount,
          upperCaseCount,
          digitsCount,
          specialCharCount,
        })
        .d(
          `请输入${minLength}-${maxLength}位字符，至少包含${upperCaseCount}位大写字母、${lowerCaseCount}位小写字母、${digitsCount}位数字和${specialCharCount}位特殊字符`
        );
    }
  }
  return true;
}
