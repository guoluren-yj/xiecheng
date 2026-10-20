/**
 * GlobalPhone - 国际化手机号组件
 * @date: 2021-03-15
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import { map } from 'lodash';
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Input, Select, Tooltip } from 'hzero-ui';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { queryIdpValue } from 'services/api';
import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';

export default class GlobalPhone extends Component {
  state = {
    idd: [],
  };

  componentDidMount() {
    this.init();
  }

  /**
   * 值集查询
   */
  @Bind()
  init() {
    queryIdpValue('HPFM.IDD').then((response) => {
      const res = getResponse(response);
      if (res) {
        this.setState({ idd: res });
      }
    });
  }

  /**
   * 区号改变 需要 重置手机号的校验状态
   * phoneField - 手机号文本域
   * telCodeField - 国别码文本域
   */
  @Bind()
  reValidationPhone(value) {
    const { form, phoneField, telCodeField } = this.props;
    const prevInternationalTelCode = form.getFieldValue(`${telCodeField}`);
    if (value === '+86' || prevInternationalTelCode === '+86') {
      // 只要 +86 出现在 中间态 就需要重新手动校验 phone
      const curPhone = form.getFieldValue(`${phoneField}`);
      let errors = null;
      if (curPhone) {
        const testReg = value === '+86' ? PHONE : NOT_CHINA_PHONE;
        if (!testReg.test(curPhone)) {
          errors = [new Error(intl.get('hzero.common.validation.phone').d('手机格式不正确'))];
        }
      }
      form.setFields({
        [phoneField]: {
          value: curPhone,
          errors,
        },
      });
    }
  }

  render() {
    const { form, initialValue, telCodeField, phoneValue = '', ...otherProps } = this.props;
    const { idd } = this.state;
    return (
      <Tooltip title={phoneValue} placement="topRight">
        <Input
          addonBefore={form.getFieldDecorator(`${telCodeField}`, {
            initialValue: initialValue || '+86',
          })(
            <Select onChange={this.reValidationPhone} disabled={this.props.disabled}>
              {map(idd, (r) => (
                <Select.Option key={r.value} value={r.value}>
                  {r.meaning}
                </Select.Option>
              ))}
            </Select>
          )}
          {...otherProps}
        />
      </Tooltip>
    );
  }
}
