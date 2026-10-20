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
    const { forecast, match, tenantId } = this.props;
    const flowProps = {
      forecastData: forecast,
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
        width={1200}
        bodyStyle={{ flex: '1 1', overflow: 'hidden' }}
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
