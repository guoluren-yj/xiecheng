import React, { Component, Fragment } from 'react';
import { Modal, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber } from 'lodash';

import intl from 'utils/intl';
import { dateRender, dateTimeRender } from 'utils/renderer';
import { thousandBitSeparator } from '@/routes/utils.js';

const modelPrompt = 'sqam.qualityReport.model';

export default class InspectionLotModal extends Component {
  addCorrelation;

  constructor(props) {
    super(props);
    this.state = {};
  }

  @Bind()
  getColumns() {
    const columns = [
      {
        title: intl.get(`${modelPrompt}.inspectionNum`).d('来料检验批号'),
        dataIndex: 'inspectionNum',
        width: 150,
      },
      {
        title: intl.get(`entity.item.code.`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
      },
      {
        title: intl.get(`entity.item.name.`).d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
      },
      {
        title: intl.get(`${modelPrompt}.assessmentResultMeaning`).d('评估结果'),
        dataIndex: 'assessmentResultMeaning',
        width: 120,
      },
      {
        title: intl.get(`${modelPrompt}.decisionResultMeaning`).d('决策结果'),
        dataIndex: 'decisionResultMeaning',
        width: 120,
      },
      {
        title: intl.get(`${modelPrompt}.batchQuantity`).d('检验批数量'),
        dataIndex: 'batchQuantity',
        width: 120,
        render: (text) => thousandBitSeparator(Number(text)),
      },
      {
        title: intl.get(`${modelPrompt}.sampleSize`).d('采样大小'),
        dataIndex: 'sampleSize',
        width: 120,
        render: (text) => thousandBitSeparator(Number(text)),
      },
      {
        title: intl.get(`${modelPrompt}.badQuantity`).d('不良数量'),
        dataIndex: 'badQuantity',
        width: 120,
        render: (text) => thousandBitSeparator(Number(text)),
      },
      {
        title: intl.get(`${modelPrompt}.creationDate`).d('批次创建日期'),
        dataIndex: 'creationDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`${modelPrompt}.startDate`).d('检验开始时间'),
        dataIndex: 'startDate',
        width: 160,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${modelPrompt}.endDate`).d('检验结束时间'),
        dataIndex: 'endDate',
        width: 160,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${modelPrompt}.transactionNum`).d('事务编号'),
        dataIndex: 'transactionNum',
        width: 200,
      },
    ];
    return columns;
  }

  render() {
    const {
      loading,
      visible,
      dataSource,
      pagination,
      handleVisible = (e) => e,
      fetchInspectionLotList = (e) => e,
    } = this.props;
    const columns = this.getColumns();
    const scrollX = sum(columns.map((item) => (isNumber(item.width) ? item.width : 0)));
    const tableProps = {
      loading,
      columns,
      dataSource,
      pagination,
      bordered: true,
      scroll: { x: scrollX },
      onChange: fetchInspectionLotList,
    };
    const modalProps = {
      visible,
      width: 1200,
      footer: null,
      onCancel: () => handleVisible(false),
      title: intl.get(`${modelPrompt}.inspectionLot`).d('检验批次明细'),
    };
    return (
      <Fragment>
        <Modal {...modalProps}>
          <Table {...tableProps} />
        </Modal>
      </Fragment>
    );
  }
}
