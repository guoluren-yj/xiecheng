import React, { Component } from 'react';
import { DataSet, Modal, Button } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
// import settlementRecordDS from './settlementRecordDS';
import receivingRecordDS from './receivingRecordDS';
import TableMenu from './TableMenu';

export default class TargetModal extends Component {
  @Bind()
  openModel() {
    const { record } = this.props;
    // this.recordDS.query();
    this.receivingDs = null;
    this.receivingDs = new DataSet(receivingRecordDS(record.pcHeaderId));
    // this.settlementDs = new DataSet(settlementRecordDS());
    Modal.open({
      key: Modal.key(),
      drawer: true,
      title: intl.get(`spcm.common.model.common.implementationOfTheAgreement`).d('协议执行情况'),
      style: {
        width: 1000,
      },
      closable: true,
      bodyStyle: {
        padding: 0,
      },
      okCancel: false,
      okText: intl.get('hzero.common.model.button.close').d('关闭'),
      children: (
        <TableMenu
          record={record}
          receivingDs={this.receivingDs}
          settlementDs={this.settlementDs}
        />
      ),
      onOk: () => null,
      onCancel: () => null,
      afterClose: () => null,
    });
  }

  render() {
    // isLink 本来button有一个link属性的 结果这组件
    const { children, isLink = true, record, ...restPorps } = this.props;
    return isLink ? (
      <a {...restPorps} onClick={this.openModel}>
        {children}
      </a>
    ) : (
      <Button {...restPorps} onClick={this.openModel}>
        {children}
      </Button>
    );
  }
}
