// OperateSectionPromptModal 分标段提示信息

import React, { Component } from 'react';
import { Modal, Button, Table } from 'hzero-ui';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';

import CPopover from '@/routes/ssrc/components/CPopover';

@formatterCollections({
  code: ['ssrc.inquiryHall', 'ssrc.common'],
})
export default class OperateSectionPromptModal extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.state = {
      hasStrongValidateFlag: false,
    };
  }

  componentDidMount() {
    const { dataList = [] } = this.props;
    const hasStrongValidateFlag = dataList.some((item) => item.interceptFlag);
    this.setState({
      hasStrongValidateFlag,
    });
  }

  batchValidateParams(list = []) {
    if (isEmpty(list)) {
      return null;
    }

    const data = list.sort((a, b) => a - b);
    let message = '';
    data.forEach((item) => {
      message += `"${item}"、 `;
    });
    return <CPopover content={message}>{message}</CPopover>;
  }

  columns() {
    const { hasStrongValidateFlag } = this.state;
    const Columns = [
      {
        title: intl.get('ssrc.common.problemList').d('问题列表'),
        dataIndex: 'messageCode',
        width: 200,
      },
      {
        title: intl.get('ssrc.common.relativeSectionItem').d('对应标段'),
        dataIndex: 'batchValidateParams',
        render: (value) => this.batchValidateParams(value),
      },
      hasStrongValidateFlag
        ? {
            title: intl.get('ssrc.common.ifPassValidateToSubmit').d('是否验证通过才能提交'),
            dataIndex: 'interceptFlag',
            width: 200,
            render: yesOrNoRender,
          }
        : null,
    ].filter(Boolean);

    return Columns;
  }

  render() {
    const {
      visible = false,
      dataList = [],
      title = intl.get('ssrc.common.view.promptMessage').d('提示信息'),
      handleCancel,
      handleOk,
    } = this.props;
    const { hasStrongValidateFlag } = this.state;
    const columns = this.columns();
    const scrollWidth = columns.reduce(
      (accumulator, current) => accumulator + current.width || 200,
      0
    );

    return (
      <Modal
        visible={visible}
        closable
        maskClosable
        destroyOnClose
        title={title}
        onCancel={handleCancel}
        onOk={handleOk}
        footer={
          hasStrongValidateFlag ? (
            <Button onClick={handleCancel} type="primary">
              {intl.get('ssrc.common.view.button.iKnowIt').d('我知道了')}
            </Button>
          ) : (
            <React.Fragment>
              <Button onClick={() => handleCancel()}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>
              <Button type="primary" onClick={() => handleOk()}>
                {intl.get('ssrc.inquiryHall.model.inquiryHall.continueSubmit').d('继续提交')}
              </Button>
            </React.Fragment>
          )
        }
        width="50%"
      >
        <Table
          bordered
          rowKey="validateKey"
          columns={columns}
          scroll={{ x: scrollWidth }}
          dataSource={dataList}
          pagination={false}
        />
      </Modal>
    );
  }
}
