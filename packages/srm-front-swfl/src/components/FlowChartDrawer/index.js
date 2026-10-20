/*
 * @Descripttion:流程图弹窗
 * @Date: 2021-05-21 10:44:59
 * @Author: xshen <xia.shen@going-link.com>
 * @version:
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Modal, Button } from 'choerodon-ui';
import uuid from 'uuid/v4';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import FlowChart from './FlowChart';
import styles from './index.less';

const { Sidebar } = Modal;

export default class FlowChartDrawer extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      visible: false,
    };
  }

  @Bind()
  handleToogleVisible() {
    this.setState({ visible: !this.state.visible });
  }

  render() {
    const { visible } = this.state;
    const { match, tenantId } = this.props;
    const flowProps = {
      tenantId,
      match,
      uselessParam: uuid(),
    };

    return (
      <Sidebar
        closable
        maskClosable={false}
        title={intl.get('hwfp.common.model.process.graph').d('流程图')}
        visible={visible}
        className={styles['modal-drawer']}
        width="64vw"
        style={{ maxWidth: '1200px' }}
        bodyStyle={{ flex: '1 1' }}
        onCancel={this.handleToogleVisible}
        footer={
          <Button funcType="raised" type="primary" onClick={this.handleToogleVisible}>
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>
        }
      >
        <FlowChart {...flowProps} />
      </Sidebar>
    );
  }
}
