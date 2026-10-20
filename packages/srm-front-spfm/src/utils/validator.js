import React from 'react';
import { Icon } from 'choerodon-ui';
import styles from './index.less';

let msgDom = '';

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
    <p>
      {flag ? (
        <Icon type="check_circle" className={styles.icon} style={{ color: '#47B881' }} />
      ) : (
        <Icon type="check_circle" className={styles.icon} style={{ color: 'rgba(0,0,0,0.25)' }} />
      )}
      <span style={{ marginLeft: 2, color: flag ? '#47B881' : 'rgba(0,0,0,0.25)' }}>{msg}</span>
    </p>
  );
}

export function validatePasswordRule(value = '', validData = {}, oauthIntl) {
  if (!value) {
    // 没有值不做校验
    msgDom = '';
    return msgDom;
  }
  const {
    loginName,
    digitsCount,
    lowerCaseCount,
    maxLength,
    minLength,
    notUsername,
    specialCharCount,
    upperCaseCount,
  } = validData;
  const msg = [];
  let allFlag = false;
  if (minLength && maxLength) {
    const flag = value.length < minLength || value.length > maxLength;
    allFlag = !flag;
    msg.push(
      renderMsgContent(
        (oauthIntl['hzero.common.validation.passwordLength'] || `{min}-{max}个字符`)
          .replace('{min}', `${minLength}`)
          .replace('{max}', `${maxLength}`),
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
          oauthIntl['hzero.common.validation.notUsername'] || '密码不能与登录名相同',
          false
        )
      );
    }
  }
  if (lowerCaseCount) {
    const flag = getRegExpStatus(lowerCaseCount, '([a-z].*)', value);
    allFlag = flag && allFlag;
    msg.push(
      renderMsgContent(
        (
          oauthIntl['hzero.common.validation.lowercaseCount'] || `至少包含{lower}个小写字符`
        ).replace('{lower}', lowerCaseCount),
        flag
      )
    );
  }
  if (upperCaseCount) {
    const flag = getRegExpStatus(upperCaseCount, '([A-Z].*)', value);
    allFlag = flag && allFlag;
    msg.push(
      renderMsgContent(
        (
          oauthIntl['hzero.common.validation.uppercaseCount'] || `至少包含{upper}个大写字符`
        ).replace('{upper}', upperCaseCount),
        flag
      )
    );
  }
  if (digitsCount) {
    const flag = getRegExpStatus(digitsCount, '([0-9].*)', value);
    allFlag = flag && allFlag;
    msg.push(
      renderMsgContent(
        (oauthIntl['hzero.common.validation.digits.min'] || `至少包含{digitsCount}个数字`).replace(
          '{digitsCount}',
          digitsCount
        ),
        flag
      )
    );
  }
  if (specialCharCount) {
    const flag = getRegExpStatus(
      specialCharCount,
      '([~`@#$%^&*\\\\-_=+|/()<>,.;:!\\[\\]].*)',
      value
    );
    allFlag = flag && allFlag;
    msg.push(
      renderMsgContent(
        (
          oauthIntl['hzero.common.validation.new.specialChart.min'] ||
          `至少包含{specialCount}个特殊字符~\`@#$%^&*\\-_=+|/()<>,.;:![]`
        ).replace('{specialCount}', specialCharCount),
        flag
      )
    );
  }
  if (value) {
    if (msg.length > 0) {
      msgDom = msg.map((item) => (
        <div key={item} className={styles.validator}>
          {item}
        </div>
      ));
    } else {
      msgDom = '';
    }
    return allFlag ? '' : msgDom;
  }
}
