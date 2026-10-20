/**
 * 注册服务/接口总数卡片
 * @author wanjun.feng@hand-china.com
 * @date 2021-1-14
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import React from 'react';

export default class ColorBlock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.setState({ ...this.props });
  }

  //  eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({ ...nextProps });
  }

  render() {
    const { backgroundColor, title, description } = this.state;
    return (
      <div
        style={{
          padding: '10px 15px',
          backgroundColor,
          boxShadow: '#888888 0px 0px 10px',
          textAlign: 'right',
          borderRadius: '15px',
        }}
      >
        <h1 style={{ marginBottom: 0, color: '#ffffff' }}>{title}</h1>
        <h3 style={{ color: '#ffffff' }}>{description}</h3>
      </div>
    );
  }
}
