/*
 * BasicInfo - 订单明细页-明细信息
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useMemo, useState } from 'react';
import { Table, Modal } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import Bom from '@/routes/components/Bom';
import CustomSpecsModal from '@/routes/components/CustomSpecsModal';

const { TabPane } = Tabs;

const DetailInfo = (props) => {
  const { ds, otherInfoDs, partnerDs, customizeTable, customizeTabPane } = props;

  const [activeKey, setActiveKey] = useState('basicInfo');

  const openBom = (record) => {
    Modal.open({
      footer: (okBtn, cancelBtn) => cancelBtn,
      cancelText: intl.get('sodr.workspace.view.button.close').d('关闭'),
      cancelProps: { color: 'primary' },
      closable: true,
      drawer: true,
      style: { width: 742 },
      title: intl.get('sodr.workspace.view.title.bom').d('外协BOM'),
      children: (
        <Bom
          readOnly
          record={record}
          customizeTable={customizeTable}
          code="SODR.WORKSPACE_ALLORDERS_DETAIL.BOM"
        />
      ),
    });
  };

  const columns = useMemo(
    () => [
      {
        name: 'displayStatusCode',
        width: 120,
        renderer: ({ record }) => record.get('displayStatusMeaning'),
      },
      {
        name: 'displayLineNum',
        width: 80,
      },
      {
        name: 'displayLineLocationNum',
        width: 100,
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'quantity',
        width: 150,
      },
      {
        name: 'uomCodeAndName',
        width: 150,
      },
      {
        name: 'needByDate',
        width: 150,
      },
      {
        name: 'unitPrice',
        width: 150,
      },
      {
        name: 'lineAmount',
        width: 120,
        renderer: ({ text, record }) => (record.get('priceShieldFlag') === 1 ? '******' : text),
      },
      {
        name: 'enteredTaxIncludedPrice',
        width: 150,
      },
      {
        name: 'taxIncludedLineAmount',
        width: 120,
        renderer: ({ text, record }) => (record.get('priceShieldFlag') === 1 ? '******' : text),
      },
      {
        name: 'taxRate',
        width: 80,
      },
      {
        name: 'unitPriceBatch',
        width: 80,
      },
      {
        name: 'currencyCode',
        width: 150,
      },
      {
        name: 'promiseDeliveryDate',
        width: 150,
      },
      {
        name: 'categoryName',
        width: 150,
      },
      {
        name: 'invOrganizationName',
        width: 150,
      },
      {
        name: 'inventoryName',
        width: 150,
      },
      {
        name: 'locationName',
        width: 150,
      },
      {
        name: 'departmentName',
        width: 150,
      },
      {
        name: 'costName',
        width: 150,
      },
      {
        name: 'accountSubjectName',
        width: 150,
      },
      {
        name: 'wbs',
        width: 150,
      },
      {
        name: 'projectCategory',
        width: 150,
        renderer: ({ record }) => record.get('projectCategoryMeaning'),
      },
      // {
      //   name: 'freeFlag',
      //   width: 150,
      // },
      // {
      //   name: 'returnedFlag',
      //   width: 150,
      // },
      // {
      //   name: 'displayPrNumAndDisplayPrLineNum',
      //   width: 150,
      // },
      // {
      //   name: 'sourceNumAndLine',
      //   width: 150,
      //   renderer: ({ text, record }) =>
      //     text === '|' ? '' : record.get('sourceNumAndLine') || record.get('sourceCodeNum'),
      // },
      // {
      //   name: 'contractNum',
      //   width: 150,
      //   renderer: ({ text }) => (text === '|' ? '' : text),
      // },
      // {
      //   name: 'prRequestedName',
      //   width: 150,
      // },
      {
        name: 'remark',
        width: 150,
      },
      {
        name: 'attachmentUuid',
        width: 150,
      },
      // {
      //   name: 'lastPurchasePrice',
      //   width: 150,
      // }
      {
        name: 'domesticUnitPrice',
        width: 150,
      },
      {
        name: 'domesticLineAmount',
        width: 150,
      },
      {
        name: 'domesticTaxIncludedPrice',
        width: 150,
      },
      {
        name: 'domesticTaxIncludedLineAmount',
        width: 150,
      },
      {
        name: 'exchangeRate',
        width: 150,
      },
    ],
    []
  );

  const otherColumns = useMemo(() => [
    {
      name: 'displayStatusCode',
      width: 120,
      renderer: ({ record }) => record.get('displayStatusMeaning'),
    },
    {
      name: 'displayLineNum',
      width: 150,
    },
    {
      name: 'displayLineLocationNum',
      width: 100,
    },
    {
      name: 'itemCode',
      width: 150,
    },
    {
      name: 'itemName',
      width: 150,
    },
    {
      name: 'consignedFlag',
      width: 150,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'returnedFlag',
      width: 150,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'freeFlag',
      width: 150,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'bom',
      width: 150,
      // renderer: ({ record }) => (
      //   <Bom
      //     record={record}
      //     readOnly
      //     customizeTable={customizeTable}
      //     code="SODR.WORKSPACE_ALLORDERS_DETAIL.BOM"
      //   />
      // ),
      renderer: ({ record }) => (
        <a onClick={() => openBom(record)}>{intl.get('hzero.common.button.look').d('查看')}</a>
      ),
    },
    {
      name: 'displayPrNumAndDisplayPrLineNum',
      width: 150,
    },
    {
      name: 'sourceNumAndLine',
      width: 150,
    },
    {
      name: 'contractNum',
      width: 150,
    },
    {
      name: 'prRequestedName',
      width: 150,
    },
    {
      name: 'productNum',
      width: 150,
    },
    {
      name: 'productName',
      width: 150,
    },
    {
      name: 'catalogName',
      width: 150,
    },
    {
      name: 'shipToThirdPartyAddress',
      width: 150,
    },
    {
      name: 'shipToThirdPartyContact',
      width: 150,
    },
    {
      name: 'receiveTelNum',
      width: 150,
    },
    {
      name: 'brand',
      width: 150,
    },
    {
      name: 'specifications',
      width: 150,
    },
    {
      name: 'model',
      width: 150,
    },
    {
      name: 'skuType',
      width: 120,
    },
    {
      name: 'customUomName',
      width: 120,
    },
    {
      name: 'customQuantity',
      width: 120,
    },
    {
      name: 'packageQuantity',
      width: 120,
    },
    {
      name: 'customSpecsJson',
      width: 120,
      renderer: ({ value }) => (
        <CustomSpecsModal type="customSpecs" data={value ? JSON.parse(value) : []} />
      ),
    },
    {
      name: 'customSpecs',
      width: 150,
    },
    {
      name: 'productSpecsJson',
      width: 120,
      renderer: ({ value }) => (
        <CustomSpecsModal type="productSpecs" data={value ? JSON.parse(value) : []} />
      ),
    },
    {
      name: 'productSpecs',
      width: 150,
    },
    {
      name: 'priceSource',
      width: 150,
      renderer: ({ record }) => record.get('priceSourceMeaning'),
    },
    {
      name: 'priceSourceNum',
      width: 150,
    },
    {
      name: 'priceSourceLineNum',
      width: 150,
    },
    {
      name: 'accountAssignTypeCode',
      width: 150,
    },
    {
      name: 'receiveToleranceQuantity',
      width: 150,
    },
    {
      name: 'budgetAccountName',
      width: 150,
    },
    // {
    //   name: 'invOrganizationName',
    //   width: 150,
    // },
    // {
    //   name: 'categoryName',
    //   width: 150,
    // },
    // {
    //   name: 'immedShippedFlag',
    //   width: 150,
    //   renderer: ({ value }) => yesOrNoRender(value),
    // },
    // {
    //   name: 'shipToThirdPartyName',
    //   width: 150,
    // },
    // {
    //   name: 'priceUomName',
    //   width: 150,
    // },
    // {
    //   name: 'priceUomConversion',
    //   width: 150,
    // },
  ]);

  const partnerColumns = useMemo(
    () => [
      {
        name: 'partnerType',
        width: 150,
      },
      {
        name: 'partnerNum',
        width: 150,
      },
      {
        name: 'partnerName',
        width: 150,
      },
      {
        name: 'externalSystemCode',
        width: 150,
      },
    ],
    []
  );
  return customizeTabPane(
    {
      code: 'SODR.WORKSPACE_ALLORDERS_DETAIL.TABS',
    },
    <Tabs activeKey={activeKey} onChange={setActiveKey} animated={false}>
      <TabPane tab={intl.get('sodr.workspace.view.panel.basicInfo').d('基础信息')} key="basicInfo">
        {customizeTable(
          {
            code: 'SODR.WORKSPACE_ALLORDERS_DETAIL.DETAILINFO',
          },
          <Table dataSet={ds} columns={columns} />
        )}
      </TabPane>
      <TabPane tab={intl.get('sodr.workspace.view.panel.otherInfo').d('其他信息')} key="otherInfo">
        {customizeTable(
          {
            code: 'SODR.WORKSPACE_ALLORDERS_DETAIL.OTHERINFO',
          },
          <Table dataSet={otherInfoDs} columns={otherColumns} />
        )}
      </TabPane>
      <TabPane tab={intl.get('sodr.workspace.view.panel.partner').d('合作方')} key="partner">
        {customizeTable(
          {
            code: 'SODR.WORKSPACE_ALLORDERS_DETAIL.PARTNER',
          },
          <Table dataSet={partnerDs} columns={partnerColumns} />
        )}
      </TabPane>
    </Tabs>
  );
};

export default DetailInfo;
