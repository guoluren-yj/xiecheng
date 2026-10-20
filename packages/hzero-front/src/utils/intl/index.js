/* eslint-disable no-proto */
/* eslint-disable guard-for-in */
/* eslint-disable func-names */
/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
/* eslint-disable no-multi-assign */
/* eslint-disable no-extend-native */
import intl from 'react-intl-universal';
import IntlMessageFormat from 'intl-messageformat';
import invariant from 'invariant';
import escapeHtml from 'escape-html';
import { isFunction } from 'lodash';
import { getCurrentOrganizationId } from '../utils/user';
import { getEnvConfig } from '../iocUtils/helpers';

const { ENV_FLAG } = getEnvConfig();

String.prototype.defaultMessage = String.prototype.d = function (msg) {
  const currentOrganizationId = getCurrentOrganizationId();
  if (
    ENV_FLAG === 'dev' &&
    (currentOrganizationId === 0 || currentOrganizationId === 30 || currentOrganizationId === 1052) // 只有 srm平台 | 甄云租户 | 森林木有限公司(商城使用) 可以刷入多语言
  ) {
    const splitKey = this.split('.');
    const reg = /[\u4e00-\u9fa5| ]/;
    if (isFunction(intl.getDescendantProp) && !reg.test(this)) {
      const isExist = intl.getDescendantProp(intl.options.locales, this);
      if (!isExist && splitKey.length > 2) {
        intl.missPrompt = intl.missPrompt
          ? intl.missPrompt.find((p) => p.key === this)
            ? [...intl.missPrompt]
            : [...intl.missPrompt, { key: this, value: msg }]
          : [];
        // 此处对模型页面进行特殊处理进行过滤，待模型正式发布并且多语言处理后，再进行删除。
        if (window.location.pathname.includes('/hmde/')) {
          return msg;
        } else {
          return isExist ? msg : this;
        }
      } else {
        return this;
      }
    }
  }
  return this || msg || '';
};

intl.__proto__.get = function (key, variables) {
  invariant(key, 'key is required');
  const { locales, currentLocale, formats } = this.options;
  const currentOrganizationId = getCurrentOrganizationId();

  if (!locales || !locales[currentLocale]) {
    this.options.warningHandler(`react-intl-universal locales data "${currentLocale}" not exists.`);
    return '';
  }
  const msg = this.getDescendantProp(locales[currentLocale], key);
  if (msg == null) {
    this.options.warningHandler(
      `react-intl-universal key "${key}"  not defined in ${currentLocale}`
    );
    // return window && window.PROMPT_INSERT === 'start' ? `${key}` : '';
    return ENV_FLAG === 'dev' &&
    (currentOrganizationId === 0 ||
      currentOrganizationId === 30 ||
      currentOrganizationId === 1052)
      ? `${key}`
      : '';
  }

  if (variables) {
    variables = Object.assign({}, variables);
    // HTML message with variables. Escape it to avoid XSS attack.
    for (const i in variables) {
      let value = variables[i];
      if (
        this.options.escapeHtml === true &&
        (typeof value === 'string' || value instanceof String) &&
        value.indexOf('<') >= 0 &&
        value.indexOf('>') >= 0
      ) {
        value = escapeHtml(value);
      }
      variables[i] = value;
    }
  }

  try {
    const msgFormatter = new IntlMessageFormat(msg, currentLocale, formats);
    return msgFormatter.format(variables);
  } catch (err) {
    this.options.warningHandler(
      `react-intl-universal format message failed for key='${key}'.`,
      err.message
    );
    return msg;
  }
};

// TODO: 因为 react-intl-universal 切换语言时候会加载外网的一个js，此文件为了将来改造方便而创建.
export default intl;

window.intl = intl;
