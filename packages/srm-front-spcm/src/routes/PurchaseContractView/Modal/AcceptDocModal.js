import React, { Component } from 'react';
import { Modal, Table } from 'hzero-ui';

import { dateRender } from 'utils/renderer';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import { renderThousandthNum } from '@/utils/util';

const commonPrompt = 'spcm.common.model.common';

export default class AcceptDocModal extends Component {
  render() {
    const { title, width = 800, visible, footer = null, onCancel, tableProps } = this.props;
    const modalProps = {
      title,
      width,
      visible,
      footer,
      onCancel,
    };
    const columns = [
      {
        title: intl.get(`${commonPrompt}.orderSeq`).d('序号'),
        dataIndex: 'lineNum',
        width: 80,
        render: (val) => Number(val),
      },
      {
        title: intl.get(`${commonPrompt}.pcStatusCode`).d('状态'),
        dataIndex: 'statusCodeMeaning',
        width: 85,
      },
      {
        title: intl.get(`${commonPrompt}.acceptListNumber`).d('验收单据编号'),
        dataIndex: 'acceptListNum',
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.acceptListTitle`).d('验收单据标题'),
        dataIndex: 'title',
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.acceptedQuantity`).d('本次验收数量'),
        dataIndex: 'acceptedQuantity',
        width: 150,
        render: (val) => renderThousandthNum(val, 2),
      },
      {
        title: intl.get(`${commonPrompt}.accepterUserName`).d('验收人'),
        dataIndex: 'acceptorNameList',
        width: 150,
        render: (val) => val.join(','),
      },
      {
        title: intl.get(`${commonPrompt}.acceptDate`).d('验收日期'),
        dataIndex: 'acceptDate',
        width: 150,
        render: dateRender,
      },
    ];
    const scrollX = tableScrollWidth(columns);
    return (
      <Modal {...modalProps}>
        <Table bordered columns={columns} scroll={{ x: scrollX }} {...tableProps} />
      </Modal>
    );
  }
}
