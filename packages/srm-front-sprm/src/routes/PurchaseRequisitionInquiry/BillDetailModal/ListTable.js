import React, { Component } from 'react';
import { Table } from 'hzero-ui';

import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { tableScrollWidth, getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import { numberPrecision } from '@/routes/utils.js';
import { fetchSettingTableNew } from '@/services/purchaseExecutionService';

const modelPrompt = 'sprm.purchaseRequisitionInquiry.model.purchaseRequisitionInquiry';
const commonPrompt = 'sprm.common.model.common';

export default class ListTable extends Component {
  state = {};

  componentDidMount() {
    Promise.all([
      fetchSettingTableNew({
        organizationId: getCurrentOrganizationId(),
        tenantNum: getCurrentTenant().tenantNum,
        tableCode: 'spcm_old_contract_tenant',
      }),
      fetchSettingTableNew({
        organizationId: getCurrentOrganizationId(),
        tenant: getCurrentTenant().tenantNum,
        tableCode: 'source_old_ui_config',
      }),
      fetchSettingTableNew({
        organizationId: getCurrentOrganizationId(),
        tenantNum: getCurrentTenant().tenantNum,
        tableCode: 'spuc_old_order_tenant',
      }),
    ]).then((res) => {
      const [contractUiConfig, rfxUiConfig, orderUiConfig] = res || [];
      this.setState({
        uiConfig: {
          contractUiConfig: !isEmpty(contractUiConfig),
          rfxUiConfig: !isEmpty(rfxUiConfig),
          orderUiConfig: !isEmpty(orderUiConfig),
        },
      });
    });
  }

  /**
   * 根据执行单据类型跳转至对应页面
   *
   * @memberof ListTable
   */
  clickJump = (_, record) => {
    const { onJumpToOtherPage } = this.props;
    const { uiConfig = {} } = this.state;
    const {
      executeBillType,
      executeBillHeaderId,
      executionBillNum,
      executeBillTypeNewFlag = 0,
    } = record;
    // executeBillType 类型和对应跳转的链接
    const typeToPage = {
      SOURCE_RFX: !uiConfig?.rfxUiConfig
        ? `/ssrc/new-inquiry-hall/rfx-detail/${executeBillHeaderId}`
        : `/ssrc/inquiry-hall/rfx-detail/${executeBillHeaderId}`,
      SOURCE_BID: `/ssrc/bid-hall/bid-detail/${executeBillHeaderId}`,
      PO: !uiConfig?.orderUiConfig
        ? `/sodr/order-workspace/detail/all-orders/${executeBillHeaderId}`
        : `/sodr/send-order/detail/${executeBillHeaderId}`,
      CONTRACT: !uiConfig?.contractUiConfig
        ? `/spcm/contract-workspace/view/${executeBillHeaderId}`
        : `/spcm/purchase-contract-view/detail?pcHeaderId=${executeBillHeaderId}`,
      CONTRACT_FRAMEWORK: !uiConfig.contractUiConfig
        ? `/spcm/contract-workspace/view/${executeBillHeaderId}`
        : `/spcm/purchase-contract-view/detail?pcHeaderId=${executeBillHeaderId}`,
      CONTRACT_SIMPLE: !uiConfig.contractUiConfig
        ? `/spcm/contract-workspace/view/${executeBillHeaderId}`
        : `/spcm/purchase-contract-view/detail?pcHeaderId=${executeBillHeaderId}`,
      SOURCE_PRO: `/ssrc/project-setup/detail/${executeBillHeaderId}`,
    };
    let url = typeToPage[executeBillType] || '';
    if (executeBillTypeNewFlag) {
      url = `/ssrc/new-bid-hall/bid-detail/${executeBillHeaderId}`;
    }
    return <a onClick={() => onJumpToOtherPage(url)}>{executionBillNum}</a>;
  };

  render() {
    const {
      dataSource = [],
      pagination,
      loading,
      onSearch,
      customizeTable,
      pubPathFlag,
      currentRecord = {},
    } = this.props;
    const columns = [
      {
        title: intl.get(`${modelPrompt}.prNum`).d('单据编号'),
        width: 120,
        dataIndex: 'displayPrNum',
      },
      {
        title: intl.get(`${commonPrompt}.lineNumber`).d('行号'),
        width: 100,
        dataIndex: 'lineNum',
      },
      {
        title: intl.get(`${modelPrompt}.executeBillType`).d('执行单据类型'),
        width: 120,
        dataIndex: 'executeBillTypeMeaning',
      },
      {
        title: intl.get(`${modelPrompt}.executionBillNum`).d('执行单据编号'),
        width: 120,
        dataIndex: 'executionBillNum',
        render: (value, record) => (!pubPathFlag ? value : this.clickJump(value, record)),
      },
      {
        title: intl.get(`${modelPrompt}.executionBillLineNum`).d('执行单据行号'),
        width: 120,
        dataIndex: 'executionBillLineNum',
      },
      {
        title: intl.get(`${modelPrompt}.executeQuantity`).d('有效数量'),
        width: 120,
        dataIndex: 'executeQuantity',
        render: (val) => {
          return numberPrecision(val, currentRecord?.uomPrecision);
        },
      },
      {
        title: intl.get(`${modelPrompt}.supplier`).d('供应商'),
        width: 165,
        dataIndex: 'supplier',
      },
      {
        title: intl.get(`${modelPrompt}.billStatus`).d('状态'),
        width: 165,
        dataIndex: 'billStatusMeaning',
      },
      {
        title: intl.get(`${modelPrompt}.needDate`).d('需求日期'),
        width: 165,
        dataIndex: 'needDate',
        align: 'left',
        render: dateRender,
      },
    ];
    // const { executeBillType = '' } = dataSource?.[0] || [];

    // if (executeBillType && executeBillType === 'SOURCE_BID') {
    columns.push({
      title: intl.get(`${modelPrompt}.executeBillTypeNewFlag`).d('是否新招标'),
      dataIndex: 'executeBillTypeNewFlag',
      name: 'executeBillTypeNewFlag',
      render: (value) => (value || value === 0 ? yesOrNoRender(Number(value)) : null),
    });
    // }

    const tableProps = {
      columns,
      loading,
      dataSource,
      pagination,
      bordered: true,
      rowKey: 'historyId',
      onChange: (page) => onSearch(page),
      scroll: { x: tableScrollWidth(columns) },
    };
    return customizeTable(
      {
        code: 'SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.EXECUTIONBILL',
      },
      <Table {...tableProps} />
    );
  }
}
