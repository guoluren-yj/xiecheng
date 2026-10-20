/*
 * SubMessage - 选项底部提示信息
 * @date: 2018-12-28
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Col } from 'hzero-ui';

/**
 * SubMessage - 选项底部提示信息
 * @extends {Component} - React.Component
 * @reactProps {String} [content] - 显示内容
 * @return React.element
 */

export default class SubMessage extends Component {
  render() {
    const { style } = this.props;
    return (
      <Col span={24} className="sub-message" style={style}>
        {this.props.content}
      </Col>
    );
  }
}
