import React, { Component } from 'react';
import { Modal, Table } from 'hzero-ui';

import { dateRender } from 'utils/renderer';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import { renderThousandthNum } from '@/utils/util';

export default class ContractStageModal extends Component {
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
        title: intl.get(`spcm.common.model.common.stageCode`).d('阶段编码'),
        dataIndex: 'stageCode',
        width: 165,
      },
      {
        title: intl.get(`spcm.common.model.common.stageName`).d('阶段名称'),
        dataIndex: 'stageName',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.model.common.prepaymentStage`).d('预付款阶段'),
        dataIndex: 'prepaymentStage',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.model.common.milestoneTime`).d('里程碑时间'),
        dataIndex: 'milestoneTime',
        width: 175,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.common.currencyCode`).d('原币币种'),
        dataIndex: 'supplierCurrencyCode',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.purchaseCurrencyCode`).d('本币币种'),
        dataIndex: 'purchaseCurrencyCode',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.exchangeRate`).d('汇率:(本币/原币)'),
        dataIndex: 'exchangeRate',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.supplierCostQuantity`).d('原币费用'),
        dataIndex: 'costQuantity',
        width: 175,
        render: (val) => renderThousandthNum(val, 2),
      },
      {
        title: intl.get('spcm.common.model.purchaseCostQuantity').d('本币费用'),
        dataIndex: 'purchaseCostQuantity',
        width: 150,
        render: (val) => renderThousandthNum(val, 2),
      },
      {
        title: intl.get('spcm.common.model.common.termId').d('付款条款'),
        dataIndex: 'termName',
        width: 150,
      },
      {
        title: intl.get('spcm.common.model.common.typeId').d('付款方式'),
        dataIndex: 'typeName',
        width: 150,
      },
      {
        title: intl.get('hzero.common.explain').d('说明'),
        dataIndex: 'remark',
        width: 175,
      },
      {
        title: intl.get('spcm.common.model.common.acceptStatus').d('验收状态'),
        dataIndex: 'acceptStatusMeaning',
        width: 150,
      },
      {
        title: intl.get('spcm.common.model.common.acceptListNum').d('验收单据'),
        dataIndex: 'acceptListNum',
        width: 150,
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
