import React, { useState, useCallback } from 'react';
import { DataSet, Tooltip, Button, Icon } from 'choerodon-ui/pro';
import { isEmpty, compose } from 'lodash';
import { SRM_SPUC } from '_utils/config';
import { Tabs } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { Header, Content } from 'components/Page';
import { printList, newPrintList } from '@/services/supplierDeliveryService';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { globalPrint, useC7NComponent } from '@/routes/components/utils';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import intl from 'utils/intl';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
import DeliveryList from './DeliveryList';
import DetailSearch from './DetailSearch';
import OldIndex from '../index';
import { wholeDataSet, DetailDataSet } from './store/lineDs';

const { TabPane } = Tabs;
const tenantId = getCurrentOrganizationId();

function Index(props) {
  const { customizeBtnGroup, customizeTable, history, wholeDs, DetailDs, cacheTab } = props;
  const [activeKey, setActiveKey] = useState(cacheTab.get('key') || 'list');
  const [loadingPrint, setLoadingPrint] = useState(false);
  const currentDs = activeKey === 'list' ? wholeDs : DetailDs;

  const handlePrint = useCallback(async (type) => {
    setLoadingPrint(true);
    const selectedAsnHeaderIds = currentDs.selected
      .map((i) => i.toJSONData())
      .map((i) => i.asnHeaderId);
    const selectedList = currentDs.selected.map((i) => i.toJSONData());
    if (!selectedList.length) return false;
    const asnNum = currentDs.selected
      .filter((n) => n.printStatusFlag === 0)
      .map((m) => m.asnNum)[0];
    const disabledFlag = currentDs.selected.some((n) => n.printStatusFlag === 0);
    const res =
      type === 'new' ? await newPrintList(selectedList) : await printList(selectedAsnHeaderIds);
    const dataList = (
      <ul style={{ margin: 0, padding: 0 }}>
        <li>{`${asnNum}${intl.get(`sinv.supplierDelivery.view.notPrint`).d(`不可打印`)}`}</li>
      </ul>
    );
    // activeKey === null 先不启用校验功能，等待产品后续更新，根据需求修改逻辑
    if (disabledFlag && activeKey === null) {
      return notification.warning({
        message: dataList,
      });
    }
    globalPrint(res);
    setLoadingPrint(false);
  }, []);

  const handleChangeKey = useCallback((key) => {
    setActiveKey(key);
    cacheTab.set('key', key);
  }, []);

  const HeaderBtns = observer(({ dataSet }) => {
    const listQueryCondition = filterNullValueObject({
      ...dataSet?.queryParameter.params,
      ...dataSet?.queryParameter, // 初始参数
      ...dataSet?.queryDataSet?.toData()[0], // 个性化条件参数
    });
    const asnHeaderIds = dataSet?.selected
      .map((item) => item.toJSONData())
      .map((n) => n?.asnHeaderId);
    const asnLineIds = dataSet?.selected.map((item) => item.toJSONData()).map((n) => n.asnLineId);
    const buttons = {
      list: [
        {
          name: 'newPrint',
          group: true,
          child: (
            <Tooltip
              style={{ marginLeft: 8 }}
              placement="bottomRight"
              title={intl
                .get('sinv.supplierDelivery.view.message.newPrintMessage')
                .d(
                  '当点击打印出现【未能加载 PDF 文档】时，说明单据未取到对应的打印模板，请联系客户方检查配置后重试'
                )}
            >
              <Button
                style={{ marginLeft: 8 }}
                onClick={() => handlePrint('new')}
                loading={loadingPrint}
                disabled={isEmpty(dataSet?.selected)}
                funcType="flat"
                icon="print"
              >
                {intl.get('hzero.common.button.newPrint').d('打印（新）')}
                <Icon type="question-circle-o" />
              </Button>
            </Tooltip>
          ),
        },
        {
          name: 'print',
          group: true,
          child: (
            <>
              <Button
                icon="print"
                onClick={handlePrint}
                loading={loadingPrint}
                disabled={isEmpty(dataSet?.selected)}
                funcType="flat"
              >
                {intl.get('hzero.common.button.print').d('打印')}
              </Button>
            </>
          ),
        },
        {
          name: 'newExport',
          group: true,
          child: (
            <>
              <ExcelExportPro
                otherButtonProps={{
                  icon: 'unarchive',
                  type: 'c7n-pro',
                  funcType: 'flat',
                  loading: loadingPrint,
                  permissionList: [
                    {
                      code: 'srm.logistics.delivery.supplier-delivery.ps.button.newexport',
                      type: 'c7n-pro',
                      funcType: 'flat',
                    },
                  ],
                }}
                buttonText={
                  isEmpty(dataSet?.selected)
                    ? intl.get(`sinv.purchaserDelivery.view.button.newExport`).d('新版导出')
                    : intl
                        .get(`sinv.purchaserDelivery.view.button.newCheckExport`)
                        .d('新版勾选导出')
                }
                requestUrl={`${SRM_SPUC}/v1/${tenantId}/asn-header/for-supplier/export`}
                queryParams={isEmpty(dataSet?.selected) ? listQueryCondition : { asnHeaderIds }}
                templateCode="SPUC_SINV_ASN_HEADER_EXPORT"
              />
            </>
          ),
        },
      ],
      detail: [
        {
          name: 'newExport',
          group: true,
          child: (
            <div style={{ marginLeft: 8 }}>
              <ExcelExportPro
                data-name="newExport"
                otherButtonProps={{
                  icon: 'unarchive',
                  funcType: 'flat',
                  permissionList: [
                    {
                      code: 'srm.logistics.delivery.supplier-delivery.ps.button.line.newexport',
                    },
                  ],
                }}
                buttonText={
                  isEmpty(dataSet?.selected)
                    ? intl.get(`sinv.purchaserDelivery.view.button.newExport`).d('新版导出')
                    : intl
                        .get(`sinv.purchaserDelivery.view.button.newCheckExport`)
                        .d('新版勾选导出')
                }
                requestUrl={`${SRM_SPUC}/v1/${tenantId}/asn-header/lines/for-supplier/export-new`}
                queryParams={isEmpty(dataSet?.selected) ? listQueryCondition : { asnLineIds }}
                templateCode="SPUC_SINV_ASN_HEADER_DETAIL"
              />
            </div>
          ),
        },
      ],
    };

    if (activeKey === 'list') {
      return customizeBtnGroup(
        { code: `SINV.SUPPLIER_DELIVERY_LIST.LIST.BTN`, pro: true },
        <DynamicButtons buttons={buttons.list} />
      );
    }

    return customizeBtnGroup(
      { code: `SINV.SUPPLIER_DELIVERY_LIST.DETAIL.BTN`, pro: true },
      <DynamicButtons buttons={buttons.detail} />
    );
  });

  const listProps = {
    customizeTable,
    wholeDs,
    history,
  };
  const detailProps = {
    DetailDs,
    customizeTable,
    history,
  };

  return (
    <>
      <Header title={intl.get(`sinv.supplierDelivery.view.message.title`).d('我的送货单')}>
        <HeaderBtns dataSet={activeKey === 'list' ? wholeDs : DetailDs} />
      </Header>
      <Content>
        <Tabs defaultActiveKey={activeKey} onChange={(key) => handleChangeKey(key)}>
          <TabPane tab={intl.get(`sinv.supplierDelivery.view.tab.list`).d('送货单查询')} key="list">
            <DeliveryList {...listProps} />
          </TabPane>
          <TabPane
            tab={intl.get(`sinv.supplierDelivery.view.tab.detail`).d('按明细查询')}
            key="detail"
          >
            <DetailSearch {...detailProps} />
          </TabPane>
        </Tabs>
      </Content>
    </>
  );
}

export default compose(
  formatterCollections({
    code: [
      'sinv.supplierDelivery',
      'sinv.purchaserDelivery',
      'sinv.deliveryClosed',
      'sinv.common',
      'entity.supplier',
      'entity.customer',
      'entity.organization',
      'entity.roles',
      'entity.attachment',
      'entity.company',
      'entity.item',
      'hzero.common',
      'sinv.receiptExecution',
    ],
  }),
  useC7NComponent(OldIndex, 'my_delivery'),
  WithCustomize({
    unitCode: [
      'SINV.SUPPLIER_DELIVERY_LIST.GRID',
      'SINV.SUPPLIER_DELIVERY_LIST.GRID_BY_DETAIL',
      'SINV.SUPPLIER_DELIVERY_LIST.QUERY',
      'SINV.SUPPLIER_DELIVERY_LIST.QUERY_BY_DETAIL',
      'SINV.SUPPLIER_DELIVERY_LIST.LIST.BTN',
      'SINV.SUPPLIER_DELIVERY_LIST.DETAIL.BTN',
      'SINV.SUPPLIER_DELIVERY_LIST.NEW_FILTER',
      'SINV.SUPPLIER_DELIVERY_LIST.NEW_FILTER_BY_DETAIL',
    ],
  }),
  withProps(
    () => {
      const wholeDs = new DataSet(wholeDataSet());
      const DetailDs = new DataSet(DetailDataSet());
      const cacheTab = new Map();
      return { wholeDs, DetailDs, cacheTab };
    },
    { cacheState: true },
    { cacheKey: '/sinv/supplier-delivery/list' }
  )
)(Index);
