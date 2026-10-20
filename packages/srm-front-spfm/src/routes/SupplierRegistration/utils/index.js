/* eslint-disable no-useless-escape */
/* eslint-disable no-template-curly-in-string */
/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-07-07 16:37:31
 * @FilePath: /srm-front-spfm/src/routes/SupplierRegistration/utils/index.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */

import { isEmpty } from 'lodash';

const getRegExpStatus = (flagCount, regStr, value) => {
  const regStrArr = [];
  for (let i = 0; i < flagCount; i++) {
    regStrArr.push(regStr);
  }
  const reg = new RegExp(`${regStrArr.join('')}`);
  return reg.test(value);
};

// 密码策略校验
const validatePasswordRule = (value, validData = {}, name, intl = {}) => {
  const checkPasswordReg = new RegExp(
    /^(?![0-9]+$)(?![a-zA-Z]+$)(?![a-z]+$)(?![!@#$%^&*=.,/;'{}<>?:\"\`\~\[\]\(\)\_\+\-]+$)[0-9A-Za-z!@#$%^&*=.,/;'{}<>?:\"\`\~\[\]\(\)\_\+\-]{6,30}$/
  );
  if (!value) {
    return (
      (intl['hzero.common.validation.notNull'] &&
        intl['hzero.common.validation.notNull'].replace('{name}', name)) ||
      `${name}不能为空`
    );
  }
  if (/[\u4e00-\u9fa5 ]/.test(value)) {
    return (
      intl['hzero.common.validation.passwordNotIncludeChinese'] || '密码中不可包含中文或者空格'
    );
  }
  if (/[，《。》？；：！￥’“【「】」——）（……·]/.test(value)) {
    return (
      intl['hzero.common.validation.includeChineseChar'] ||
      '密码中不支持录入中文符号，如，《。》？；：’“【「】」——）（……·等'
    );
  }
  if (!/^[a-zA-Z0-9~'`@#\$%\^&\*\\\-_=\+\|/\(\)<>,\.;:!\[\]]+$/.test(value)) {
    return (
      intl['hzero.common.validation.new.specialChart'] ||
      '特殊符号仅支持录入的内容有 ~`@#$%^&*-_=+|/()<>,.;:![]'
    );
  }
  if (!isEmpty(validData)) {
    const {
      // loginName, // 登录名
      digitsCount = 1, // 数字位数
      lowercaseCount = 1, // 小写字母位数
      maxLength = 12, // 最大位数
      minLength = 6, // 最小位数
      // notUsername, // 是否校验用户名重复
      specialCharCount = 1, //  特殊字符位数
      uppercaseCount = 1, // 大写字母位数
    } = validData;

    const lengthFlag = value.length < minLength || value.length > maxLength;
    const lowerCaseCountFlag =
      lowercaseCount && !getRegExpStatus(lowercaseCount, '([a-z].*)', value);
    const upperCaseCountFlag =
      uppercaseCount && !getRegExpStatus(uppercaseCount, '([A-Z].*)', value);
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
      if (intl['srm.oauth.password.validation.error']) {
        let err = intl['srm.oauth.password.validation.error'];
        err = err.replace('${minLength}', minLength);
        err = err.replace('${maxLength}', maxLength);
        err = err.replace('${upperCaseCount}', uppercaseCount);
        err = err.replace('${lowerCaseCount}', lowercaseCount);
        err = err.replace('${digitsCount}', digitsCount);
        err = err.replace('${specialCharCount}', specialCharCount);
        return (
          err ||
          `请输入${minLength}-${maxLength}位字符，至少包含${uppercaseCount}位大写字母、${lowercaseCount}位小写字母、${digitsCount}位数字和${specialCharCount}位特殊字符`
        );
      }
    }
  } else if (!checkPasswordReg.test(value)) {
    return (
      intl['srm.oauth.resetPassword.passwordIsIlleagal'] ||
      '至少包含两种不同类型的字符且长度在6-30位'
    );
  }
  return true;
};

const VERIFY_METHOD_VALUE = {
  PHONE: 'PHONE',
  EMAIL: 'EMAIL',
};

const getOptions = (intl, verifyMethods = []) => {
  return [
    {
      value: VERIFY_METHOD_VALUE.PHONE,
      meaning: intl['srm.oauth.enterprise.recovery.phone'] || '手机',
    },
    { value: VERIFY_METHOD_VALUE.EMAIL, meaning: intl['srm.oauth.passwordFind.email'] || '邮箱' },
  ].filter((item) => verifyMethods.includes(item.value));
};

export { validatePasswordRule, getOptions, VERIFY_METHOD_VALUE };
