/*
 * SubCheckBox - checkbox勾选框组件
 * @date: 2018-12-28
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Col } from 'hzero-ui';

import Checkbox from 'components/Checkbox';

/**
 * SubCheckBox - checkbox勾选框组件
 * @extends {Component} - React.Component
 * @reactProps {Function} { getFieldDecorator } - 表单绑定方法
 * @reactProps {String} { field } - 表单绑定Id
 * @reactProps {String} { initialValue } - 初始值
 * @reactProps {Function} { onChange } - 改变回调
 * @reactProps {String} { content } - 显示内容
 * @return React.element
 */

export default class SubCheckBox extends Component {
  render() {
    const {
      field,
      getFieldDecorator,
      initialValue,
      onChange = () => {},
      content,
      disabled = false,
      span = 24,
      style,
      otherComponnets,
    } = this.props;
    return (
      <Col span={span} className="sub-item-fields" style={style}>
        {getFieldDecorator([field], {
          initialValue,
        })(
          <Checkbox onChange={onChange} disabled={disabled}>
            {content}
          </Checkbox>
        )}
        {otherComponnets}
      </Col>
    );
  }
}
