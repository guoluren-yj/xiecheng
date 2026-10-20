// 操作记录 C7N 侧弹窗

import React, { Component } from 'react';
import { Table, Modal, Button, DataSet, Icon } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import { TableDS } from './DS';

import styles from './index.less';

@formatterCollections({
  code: ['ssrc.inquiryHall', 'ssrc.common'],
})
export default class OperateRecords extends Component {
  constructor(props) {
    super(props);

    const { operationRecordRef = () => {} } = props;
    operationRecordRef(this);

    this.state = {};
  }

  componentDidMount() {
    this.initDS();
  }

  initDS() {
    this.TableDS = new DataSet(TableDS());
  }

  @Bind()
  search() {
    const { organizationId, id, afterSearchFunc, modalProps = {} } = this.props;
    this.TableDS.setQueryParameter('commonProps', {
      organizationId,
      id,
    });
    this.TableDS.query();

    const modalKey = Modal.key();
    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      title: intl.get(`ssrc.inquiryHall.view.message.button.record`).d('操作记录'),
      children: (
        <Table columns={this.getColumns()} rowKey="rfxActionId" dataSet={this.TableDS} border />
      ),
      style: { width: '800px' },
      onOk: () => this.handleOk(),
      onCancel: () => this.handleCancel(),
      ...modalProps,
    });

    if (afterSearchFunc && typeof afterSearchFunc === 'function') {
      afterSearchFunc();
    }
  }

  handleOk() {
    this.TableDS.loadData();

    const { afterOk = null } = this.props;
    if (afterOk && typeof afterOk === 'function') {
      afterOk();
    }
  }

  @Bind()
  handleCancel() {
    this.TableDS.loadData();
    Modal.destroyAll();

    const { afterCancel = null } = this.props;
    if (afterCancel && typeof afterCancel === 'function') {
      afterCancel();
    }
  }

  getColumns() {
    const Columns = [
      {
        name: 'processOperationMeaning',
        width: 150,
      },
      {
        name: 'processRemark',
      },
      {
        name: 'realName',
        width: 150,
      },
      {
        name: 'processDate',
        width: 160,
      },
    ];

    return Columns;
  }

  render() {
    const {
      isButton = 1,
      noBorderBtn = 1,
      icon = <Icon type="operation_subtask" style={{ fontSize: '12px' }} />,
      ...others
    } = this.props;

    const ButtonClassNames = noBorderBtn ? 'no-border-btn' : '';
    const ButtonText = intl.get(`ssrc.inquiryHall.view.message.button.record`).d('操作记录');

    return (
      <>
        {isButton ? (
          <Button className={ButtonClassNames} onClick={this.search} {...others}>
            {icon}
            <span>{ButtonText}</span>
          </Button>
        ) : (
          <span onClick={this.search} className={styles['like-button-text']} {...others}>
            {icon}
            <span>{ButtonText}</span>
          </span>
        )}
      </>
    );
  }
}
