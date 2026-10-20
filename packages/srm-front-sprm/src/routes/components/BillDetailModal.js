/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-04-07 17:19:10
 * @LastEditors: yanglin
 * @LastEditTime: 2023-01-17 15:51:26
 */
import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Table, DataSet } from 'choerodon-ui/pro';
import { Tabs, Radio } from 'choerodon-ui';
import { yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { fetchSettingTableNew } from '@/services/purchaseExecutionService';
import { getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import { billDetailDs } from './comomDs';
import { colorRender } from '../NewPurchaseDetail/hook';
import styles from './BillDetailModal.less';

const { TabPane } = Tabs;
const DISPLAY_TYPE = {
  FINAL: 'FINAL',
  HISTORY: 'HISTORY',
};

const BillDetailModal = (props) => {
  const { prLineId, pubPathFlag, customizeTable, history, uomPrecision, enableDisplayTabs } = props;
  const [activeDisplayType, setActiveDisplayType] = useState(DISPLAY_TYPE.FINAL);
  const [uiConfig, setUiconfig] = useState({});
  const [allLinks, setAllLinks] = useState({});
  const displayType = enableDisplayTabs ? activeDisplayType : undefined;

  const billDetailTableDs = new DataSet(billDetailDs(prLineId, uomPrecision, displayType));

  useEffect(() => {
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
      setUiconfig({
        contractUiConfig: !isEmpty(contractUiConfig),
        rfxUiConfig: !isEmpty(rfxUiConfig),
        orderUiConfig: !isEmpty(orderUiConfig),
      });
    });
    const menuLeafNodes = window?.dvaApp?._store?.getState()?.global?.menuLeafNode || [];
    const routeCheckList = [
      'srm.ssrc.source.manage.inquirer.new-inquiry-hall',
      'srm.ssrc.source.manage.inquirer.inquiry-hall',
      'srm.ssrc.source.manage.bidding.hall',
      'srm.ssrc.source.manage.new-bidding.bid-inquiry-hall',
      'srm.po-admin.po.order-workspace',
      'srm.po-admin.po.sended-order',
      'srm.pc-admin.pc-purchaser.workspace2',
      'srm.pc-admin.pc-purchaser.view',
      'srm.ssrc.source.manage.plan.source.project',
      'srm.ssrc.source.manage.plan.project-inquiry-hall',
      'srm.bg.management.project',
    ];
    const allCheckLinks = {};
    menuLeafNodes.forEach((node) => {
      if (routeCheckList.includes(node.functionMenuCode)) {
        const { functionMenuCode } = node;
        allCheckLinks[functionMenuCode] = true;
      }
    });
    setAllLinks(allCheckLinks);
  }, [prLineId]);

  /**
   * 根据执行单据类型跳转至对应页面
   *
   * @memberof ListTable
   */
  const clickJump = (_, record) => {
    const {
      executeBillType,
      executeBillHeaderId,
      executionBillNum,
      executeBillTypeNewFlag = 0,
    } = record.get([
      'executeBillType',
      'executeBillHeaderId',
      'executionBillNum',
      'executeBillTypeNewFlag',
    ]);
    // executeBillType 类型和对应跳转的链接
    const typeToPage = {
      SOURCE_RFX: !uiConfig.rfxUiConfig
        ? `/ssrc/new-inquiry-hall/rfx-detail/${executeBillHeaderId}`
        : `/ssrc/inquiry-hall/rfx-detail/${executeBillHeaderId}`,
      SOURCE_BID: `/ssrc/bid-hall/bid-detail/${executeBillHeaderId}`,
      PO: !uiConfig.orderUiConfig
        ? `/sodr/order-workspace/detail/all-orders/${executeBillHeaderId}`
        : `/sodr/send-order/detail/${executeBillHeaderId}`,
      CONTRACT: !uiConfig.contractUiConfig
        ? `/spcm/contract-workspace/view/${executeBillHeaderId}`
        : `/spcm/purchase-contract-view/detail?pcHeaderId=${executeBillHeaderId}`,
      CONTRACT_FRAMEWORK: !uiConfig.contractUiConfig
        ? `/spcm/contract-workspace/view/${executeBillHeaderId}`
        : `/spcm/purchase-contract-view/detail?pcHeaderId=${executeBillHeaderId}`,
      CONTRACT_SIMPLE: !uiConfig.contractUiConfig
        ? `/spcm/contract-workspace/view/${executeBillHeaderId}`
        : `/spcm/purchase-contract-view/detail?pcHeaderId=${executeBillHeaderId}`,
      SOURCE_PRO: allLinks['srm.ssrc.source.manage.plan.source.project']
        ? `/ssrc/project-setup/detail/${executeBillHeaderId}`
        : allLinks['srm.ssrc.source.manage.plan.project-inquiry-hall']
        ? `/ssrc/new-project-setup/detail/${executeBillHeaderId}`
        : null,
      PROJECT_INFO: `/sprm/project-workspace/read-detail/${executeBillHeaderId}`,
    };

    const routerMenuCode = {
      SOURCE_RFX: !uiConfig.rfxUiConfig
        ? 'srm.ssrc.source.manage.inquirer.new-inquiry-hall'
        : 'srm.ssrc.source.manage.inquirer.inquiry-hall',
      SOURCE_BID: 'srm.ssrc.source.manage.bidding.hall',
      PO: !uiConfig.orderUiConfig
        ? 'srm.po-admin.po.order-workspace'
        : 'srm.po-admin.po.sended-order',
      CONTRACT: !uiConfig.contractUiConfig
        ? 'srm.pc-admin.pc-purchaser.workspace2'
        : 'srm.pc-admin.pc-purchaser.view',
      CONTRACT_FRAMEWORK: !uiConfig.contractUiConfig
        ? 'srm.pc-admin.pc-purchaser.workspace2'
        : 'srm.pc-admin.pc-purchaser.view',
      CONTRACT_SIMPLE: !uiConfig.contractUiConfig
        ? 'srm.pc-admin.pc-purchaser.workspace2'
        : 'srm.pc-admin.pc-purchaser.view',
      SOURCE_PRO: 'srm.ssrc.source.manage.plan.source.project',
      SOURCE_PRO_NEW: 'srm.ssrc.source.manage.plan.project-inquiry-hall',
      PROJECT_INFO: 'srm.bg.management.project',
      NEWBID: 'srm.ssrc.source.manage.new-bidding.bid-inquiry-hall',
    };
    let url = typeToPage[executeBillType] || '';
    const detailCode = routerMenuCode[executeBillType] || '';
    let tabLinkCheck =
      executeBillType === 'SOURCE_PRO'
        ? allLinks['srm.ssrc.source.manage.plan.source.project'] ||
          allLinks['srm.ssrc.source.manage.plan.project-inquiry-hall'] ||
          false
        : allLinks[detailCode] || false;
    if (executeBillTypeNewFlag) {
      url = `/ssrc/new-bid-hall/bid-detail/${executeBillHeaderId}`;
      tabLinkCheck = allLinks['srm.ssrc.source.manage.new-bidding.bid-inquiry-hall'];
    }
    return (
      <a
        onClick={() => {
          if (tabLinkCheck && url) {
            history.push(url);
          } else {
            notification.error({
              message: intl
                .get('sprm.common.model.excute.link')
                .d('当前角色无对应菜单权限，请添加权限后再操作。'),
            });
          }
        }}
      >
        {executionBillNum}
      </a>
    );
  };

  const defaultCols = [
    { name: 'displayPrNum' },
    { name: 'lineNum' },
    { name: 'executeBillTypeMeaning' },
    {
      name: 'executionBillNum',
      renderer: ({ value, record }) => (!pubPathFlag ? value : clickJump(value, record)),
    },
    { name: 'executionBillLineNum' },
    { name: 'executeQuantity' },
    { name: 'supplier' },
    {
      name: 'billStatusMeaning',
      renderer: ({ value, record }) => colorRender(record.get('billStatus'), value),
    },
    { name: 'needDate' },
  ];

  const displayTabCols = [
    { name: 'executeBillTypeMeaning' },
    { name: 'supplier' },
    { name: 'needDate' },
    { name: 'displayPrNum' },
    { name: 'lineNum' },
    {
      name: 'executionBillNum',
      renderer: ({ value, record }) => (!pubPathFlag ? value : clickJump(value, record)),
    },
    { name: 'executionBillLineNum' },
    { name: 'executeQuantity' },
    {
      name: 'billStatusMeaning',
      renderer: ({ value, record }) => colorRender(record.get('billStatus'), value),
    },
  ];

  const displayRecordCols = [
    { name: 'executeBillTypeMeaning' },
    { name: 'executeOperationTypeMeaning' },
    { name: 'executeByName' },
    { name: 'executeDate', width: 180 },
    { name: 'executionBillNum' },
    { name: 'executionBillLineNum' },
    { name: 'executeQuantity' },
  ];

  const cols = enableDisplayTabs
    ? activeDisplayType === DISPLAY_TYPE.HISTORY
      ? displayRecordCols
      : displayTabCols
    : defaultCols;

  // if (isBid) {
  cols.push({
    name: 'executeBillTypeNewFlag',
    renderer: ({ value }) => (value || value === 0 ? yesOrNoRender(Number(value)) : null),
  });
  // }

  const table = customizeTable(
    {
      code: 'SPRM.PURCHASE_PLAFORM_QUERY.EXECUTIONBILL',
    },
    <Table dataSet={billDetailTableDs} columns={cols} />
  );

  if (!enableDisplayTabs) {
    return table;
  }

  return (
    <Tabs
      activeKey={activeDisplayType}
      animated
      className={styles['sprm-bill-detail-tabs']}
      tabBarExtraContent={
        <div className="sprm-execution-bill-mode">
          <Radio.Group
            value={activeDisplayType}
            onChange={(e) => {
              setActiveDisplayType(e.target.value);
            }}
          >
            <Radio.Button value={DISPLAY_TYPE.FINAL}>
              {intl.get('sprm.common.view.title.finalDisplay').d('最终展示')}
            </Radio.Button>
            <Radio.Button value={DISPLAY_TYPE.HISTORY}>
              {intl.get('sprm.common.view.title.displayRecord').d('展示记录')}
            </Radio.Button>
          </Radio.Group>
        </div>
      }
    >
      <TabPane key={activeDisplayType}>{table}</TabPane>
    </Tabs>
  );
};

export default formatterCollections({
  code: ['sprm.common', 'hzero.common', 'sprm.purchaseRequisitionInquiry'],
})(withRouter(connect()(BillDetailModal)));
