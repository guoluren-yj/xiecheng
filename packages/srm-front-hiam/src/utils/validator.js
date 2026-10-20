import React from 'react';
import { Icon } from 'hzero-ui';

import intl from 'utils/intl';

function getRegExpStatus(flagCount, regStr, value) {
  const regStrArr = [];
  for (let i = 0; i < flagCount; i++) {
    regStrArr.push(regStr);
  }
  const reg = new RegExp(`${regStrArr.join('')}`);
  return reg.test(value);
}

function renderMsgContent(msg, flag) {
  return (
    <>
      {flag ? (
        <Icon type="check-circle-o" style={{ color: '#52c41a' }} />
      ) : (
        <Icon type="close-circle-o" style={{ color: '#f5222d' }} />
      )}
      <span style={{ marginLeft: 2, color: flag ? '#52c41a' : '#f5222d' }}>{msg}</span>
    </>
  );
}

export function validatePasswordRule(value = '', callback = (e) => e, validData = {}) {
  const {
    loginName,
    digitsCount,
    lowercaseCount,
    maxLength,
    minLength,
    notUsername,
    specialCharCount,
    uppercaseCount,
  } = validData;
  const msg = [];
  let allFlag = false;
  if (minLength && maxLength) {
    const flag = value.length < minLength || value.length > maxLength;
    allFlag = !flag;
    msg.push(
      renderMsgContent(
        intl
          .get('hzero.common.validation.passwordLength', {
            min: minLength,
            max: maxLength,
          })
          .d(`${minLength}-${maxLength}个字符`),
        !flag
      )
    );
  }
  if (!notUsername) {
    const flag = value === loginName;
    allFlag = !flag && allFlag;
    if (flag) {
      msg.push(
        renderMsgContent(
          intl.get('hzero.common.validation.notUsername').d(`密码不能与登录名相同`),
          false
        )
      );
    }
  }
  if (lowercaseCount) {
    const flag = getRegExpStatus(lowercaseCount, '([a-z].*)', value);
    allFlag = flag && allFlag;
    msg.push(
      renderMsgContent(
        intl
          .get('hzero.common.validation.lowercaseCount', {
            lower: lowercaseCount,
          })
          .d(`至少包含${lowercaseCount}个小写字符`),
        flag
      )
    );
  }
  if (uppercaseCount) {
    const flag = getRegExpStatus(uppercaseCount, '([A-Z].*)', value);
    allFlag = flag && allFlag;
    msg.push(
      renderMsgContent(
        intl
          .get('hzero.common.validation.uppercaseCount', {
            upper: uppercaseCount,
          })
          .d(`至少包含${uppercaseCount}个大写字符`),
        flag
      )
    );
  }
  if (digitsCount) {
    const flag = getRegExpStatus(digitsCount, '([0-9].*)', value);
    allFlag = flag && allFlag;
    msg.push(
      renderMsgContent(
        intl
          .get('hzero.common.validation.digits.min', { digitsCount })
          .d(`至少包含${digitsCount}个数字`),
        flag
      )
    );
  }
  if (specialCharCount) {
    const flag = getRegExpStatus(
      specialCharCount,
      '([~`@#$%^&*\\\\\\-_=+|/()<>,.;:!\\[\\]].*)',
      value
    );
    allFlag = flag && allFlag;
    msg.push(
      renderMsgContent(
        intl
          .get('hzero.common.validation.new.specialChart.min', { specialCount: specialCharCount })
          .d(`至少包含${specialCharCount}个特殊字符~\`@#$%^&*\\-_=+|/()<>,.;:![]`),
        flag
      )
    );
  }
  if (value) {
    if (msg.length > 0) {
      const msgDom = msg.map((item) => <div key={item}>{item}</div>);
      callback(allFlag ? undefined : msgDom);
    } else {
      callback();
    }
  } else {
    callback();
  }
}

export function validatePasswordRuleNew(value = '', validData = {}) {
  const {
    loginName,
    digitsCount,
    lowercaseCount,
    maxLength,
    minLength,
    notUsername,
    specialCharCount,
    uppercaseCount,
  } = validData;
  if (value && /[\u4e00-\u9fa5 ]/.test(value)) {
    return intl.get('hzero.common.validation.passwordNotIncludeChinese').d(`不能包含中文`);
  }
  if (value && /[，《。》？；：！￥’“【「】」——）（……·]/.test(value)) {
    return intl.get('hzero.common.validation.includeChineseChar').d(`不能包含中文符号`);
  }
  if (minLength && maxLength && (value.length < minLength || value.length > maxLength)) {
    return intl
      .get('hzero.common.validation.passwordLength', {
        min: minLength,
        max: maxLength,
      })
      .d(`${minLength}-${maxLength}个字符`);
  }
  if (!notUsername && value === loginName) {
    return intl.get('hzero.common.validation.notUsername').d(`密码不能与登录名相同`);
  }
  if (lowercaseCount && !getRegExpStatus(lowercaseCount, '([a-z].*)', value)) {
    return intl
      .get('hzero.common.validation.lowercaseCount', {
        lower: lowercaseCount,
      })
      .d(`至少包含${lowercaseCount}个小写字符`);
  }
  if (uppercaseCount && !getRegExpStatus(uppercaseCount, '([A-Z].*)', value)) {
    return intl
      .get('hzero.common.validation.uppercaseCount', {
        upper: uppercaseCount,
      })
      .d(`至少包含${uppercaseCount}个大写字符`);
  }
  if (digitsCount && !getRegExpStatus(digitsCount, '([0-9].*)', value)) {
    return intl
      .get('hzero.common.validation.digits.min', { digitsCount })
      .d(`至少包含${digitsCount}个数字`);
  }
  if (
    specialCharCount &&
    !getRegExpStatus(specialCharCount, '([~`@#$%^&*\\\\\\-_=+|/()<>,.;:!\\[\\]].*)', value)
  ) {
    return intl
      .get('hzero.common.validation.new.specialChart.min', { specialCount: specialCharCount })
      .d(`至少包含${specialCharCount}个特殊字符~\`@#$%^&*\\-_=+|/()<>,.;:![]`);
  }
  if (!/^[a-zA-Z0-9~'`@#\$%\^&\*\\\-_=\+\|/\(\)<>,\.;:!\[\]]+$/.test(value)) {
    return intl.get('hzero.common.validation.new.specialChart').d('特殊符号仅支持录入的内容有 ~`@#$%^&*-_=+|/()<>,.;:![]');
  }
}
