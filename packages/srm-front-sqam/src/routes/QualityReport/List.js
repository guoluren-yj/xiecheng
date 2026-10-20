/**
 * index.js - 质量报表列表
 * @date: 2020-01-14
 * @author: lisbo <sibo.li@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
import { Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import { sum } from 'lodash';
// import { valueMapMeaning } from 'utils/renderer';
// import UploadModal from 'components/Upload';

import { thousandBitSeparator } from '@/routes/utils.js';

// const FormItem = Form.Item;
const modelPrompt = 'sqam.qualityReport.model';
export default class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // selectedRowKeys: [],
      //   invOrganizationName: undefined,
    };
  }

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const {
      // compromise,
      // goods,
      handleVisible = (e) => e,
    } = this.props;
    const columnArray = [
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.ouName`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.invOrganizationName`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.supplierCompanyCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyCode',
        width: 150,
        // render: this.protocolType,
      },
      {
        title: intl.get(`${modelPrompt}.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        // render: (val, record) => <Tooltip title={record.pcName}>{record.pcName}</Tooltip>,
      },
      {
        title: intl.get(`${modelPrompt}.categoryCode`).d('物料类别编码'),
        dataIndex: 'categoryCode',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.categoryName`).d('物料类别'),
        dataIndex: 'categoryName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.totalInspectionBatch`).d('检验总批次'),
        dataIndex: 'quantity',
        width: 100,
        render: (text) => thousandBitSeparator(Number(text)),
      },
      {
        title: intl.get(`${modelPrompt}.badQuantity`).d('不合格批次'),
        dataIndex: 'badQuantity',
        width: 100,
        render: (text) => thousandBitSeparator(Number(text)),
      },
      {
        title: intl.get(`${modelPrompt}.passRate`).d('合格率'),
        dataIndex: 'passRate',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.badRate`).d('不合格率'),
        dataIndex: 'badRate',
        width: 120,
      },
      {
        title: intl.get(`${modelPrompt}.inspectionLot`).d('检验批次明细'),
        dataIndex: '',
        width: 140,
        render: (val, record) => (
          <a onClick={() => handleVisible(true, record)}>{intl.get(`${modelPrompt}.`).d('查看')}</a>
        ),
      },
      {
        title: (
          <Tooltip
            title={intl
              .get(`${modelPrompt}.compromiseRateTooltip`)
              .d('总批次中决策结果为「让步接收」的让步批次率')}
          >
            {intl.get(`${modelPrompt}.compromiseRate`).d('让步率')}
          </Tooltip>
        ),
        dataIndex: 'compromiseRate',
        width: 120,
      },
      {
        title: (
          <Tooltip
            title={intl
              .get(`${modelPrompt}.returnRateTooltip`)
              .d('总批次中决策结果为「退货处理」的退货批次率')}
          >
            {intl.get(`${modelPrompt}.returnRate`).d('退货率')}
          </Tooltip>
        ),
        dataIndex: 'returnRate',
        width: 120,
      },
      {
        title: intl.get(`${modelPrompt}.exemptInspectionQuantity`).d('免检批次'),
        dataIndex: 'exemptInspectionQuantity',
        width: 120,
      },
      // {
      //   title: intl.get(`${modelPrompt}.fromItemCompromise`).d('来料-让步'),
      //   dataIndex: 'pcTypeName',
      //   width: 120,
      //   render: val => valueMapMeaning(compromise, val),
      // },
      // {
      //   title: intl.get(`${modelPrompt}.fromItemReturn`).d('来料-退货'),
      //   dataIndex: 'pcTypeName',
      //   width: 120,
      //   render: val => valueMapMeaning(goods, val),
      // },
    ];
    return columnArray;
  }

  render() {
    const {
      loading,
      dataSource,
      onSearch,
      pagination,
      selectedRows,
      onRowSelectChange = (e) => e,
      // selectedRowKeys = [],
    } = this.props;
    const selectedRowKeys = selectedRows.map((item) => item.pcHeaderId);
    const columns = this.getColumns();
    const rowSelection = {
      selectedRowKeys,
      onChange: onRowSelectChange,
    };
    const tableProps = {
      loading,
      columns,
      dataSource,
      rowSelection,
      bordered: true,
      rowKey: 'pcHeaderId',
      onChange: (page) => onSearch(page),
      pagination,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map((n) => n.width)) + 300 };

    return <EditTable {...tableProps} />;
  }
}
