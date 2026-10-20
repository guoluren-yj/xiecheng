/**
 * 注册服务/接口总数卡片
 * @author wanjun.feng@hand-china.com
 * @date 2021-1-14
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import React from 'react';
import { Icon } from 'choerodon-ui/pro';
import { Card, Statistic } from 'choerodon-ui';

export default class PanelCard extends React.Component {
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
    const { title, description, content, rate } = this.state;
    return (
      <Card
        key="interfaceServerSummaryCard"
        bordered={false}
        bodyStyle={{ padding: 10, overflow: 'hidden' }}
        title={<Statistic title={<h3>{title}</h3>} value={content} />}
      >
        <h3>
          {`${description} ${rate || '_'}`}
          {!rate || ((rate && parseFloat(rate)) === 0 && <Icon type="baseline-arrow_drop_up" />)}
          {rate && parseFloat(rate) < 0 && (
            <Icon style={{ color: 'green' }} type="baseline-arrow_drop_down" />
          )}
          {rate && parseFloat(rate) > 0 && (
            <Icon style={{ color: 'red' }} type="baseline-arrow_drop_up" />
          )}
        </h3>
      </Card>
    );
  }
}
