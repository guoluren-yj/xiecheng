/**
 * 送货单查询
 * @date: 2022-5-11
 * @author: Mya
 * @version: 0.0.1
 */
import React, { useState } from 'react';
import { getCurrentOrganizationId, getResponse, filterNullValueObject } from 'utils/utils';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import formatterCollections from 'utils/intl/formatterCollections';
import { async } from '@/services/purchaserDeliveryService';
import { useC7NComponent } from '@/routes/components/utils';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';
import { SRM_SPUC } from '_utils/config';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import { observer } from 'mobx-react-lite';
import { compose, isEmpty, isNil } from 'lodash';
import { DataSet } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { detailDataSet } from './NewDetailSearch/indexDs';
import { btnNumber } from '../utils';
import DeliveryList from './NewList';
import DetailSearch from './NewDetailSearch';
import { allDataSet } from './NewList/indexDs';
import OldIndex from '../index';

// 组织id
const tenantId = getCurrentOrganizationId();

const { TabPane } = Tabs;

const C7NIndex = (props) => {
  const {
    customizeTable,
    customizeBtnGroup,
    history,
    allSearchDs,
    detailSearchDs,
    currentTab,
  } = props;

  // TAB allSearch: 按单  detailSearch: 按明细
  const [activeKey, setActiveKey] = useState(currentTab[0]);

  // 重新同步按钮
  const asyncList = async () => {
    // 拿到选中单据的 asnHeaderId 集合
    const ids = allSearchDs.selected.reduce((init, current) => {
      if (!isNil(current.get('asnHeaderId'))) {
        init.push(current.get('asnHeaderId'));
      }
      return init;
    }, []);
    if (ids.length > 0) {
      const res = await async({ asnHeaderIds: ids });
      // 处理返回的数据
      if (getResponse(res)) {
        notification.success();
        allSearchDs.query();
      }
    }
  };

  // 头部按钮
  const HeaderBtns = observer(({ dataSet }) => {
    // 列表查询的参数
    const listQueryCondition = filterNullValueObject({
      ...dataSet.queryParameter, // 初始参数
      ...dataSet.queryDataSet?.toData()[0], // 个性化条件参数
    });
    // 拿到选中单据的 asnHeaderId / asnLineId 集合
    const ids = dataSet.selected
      .reduce((init, current) => {
        if (!isNil(current.get('asnHeaderId'))) {
          init.push(current.get('asnHeaderId'));
        }
        return init;
      }, [])
      .join(',');
    const lineIds = dataSet.selected
      .reduce((init, current) => {
        if (!isNil(current.get('asnLineId'))) {
          init.push(current.get('asnLineId'));
        }
        return init;
      }, [])
      .join(',');
    const buttons = {
      allSearch: [
        {
          name: 'sync',
          child: intl.get(`sinv.common.model.common.sync`).d('重新同步'),
          btnProps: {
            icon: 'sync',
            disabled: isEmpty(dataSet?.selected),
            onClick: () => asyncList(),
          },
        },
        {
          name: 'new-import',
          group: true,
          child: (
            <ExcelExportPro
              buttonText={
                isEmpty(dataSet?.selected)
                  ? intl.get(`sinv.purchaserDelivery.view.button.newExport`).d('新版导出')
                  : intl.get(`sinv.purchaserDelivery.view.button.newCheckExport`).d('新版勾选导出')
              }
              otherButtonProps={{
                icon: 'unarchive',
                funcType: 'flat',
                permissionList: [
                  {
                    code: 'srm.logistics.ar.purchaser-delivery.ps.button.newexport',
                  },
                ],
              }}
              requestUrl={`${SRM_SPUC}/v1/${tenantId}/asn-header/for-purchase/export`}
              queryParams={
                // 勾选导出
                !isEmpty(dataSet?.selected) ? { asnHeaderIds: ids } : listQueryCondition
              }
              templateCode="SPUC_SINV_ASN_HEADER_PURCHASE_EXPORT"
            />
          ),
        },
      ],
      detailSearch: [
        {
          name: 'new-import',
          group: true,
          child: (
            <ExcelExportPro
              buttonText={
                isEmpty(dataSet?.selected)
                  ? intl.get(`sinv.purchaserDelivery.view.button.newExport`).d('新版导出')
                  : intl.get(`sinv.purchaserDelivery.view.button.newCheckExport`).d('新版勾选导出')
              }
              otherButtonProps={{
                color: 'primary',
                icon: 'unarchive',
                permissionList: [
                  {
                    code: 'srm.logistics.ar.purchaser-delivery.ps.button.line.newexport',
                  },
                ],
              }}
              requestUrl={`${SRM_SPUC}/v1/${tenantId}/asn-header/lines/for-purchase/export-new`}
              queryParams={
                // 勾选导出
                !isEmpty(dataSet?.selected) ? { asnLineIds: lineIds } : listQueryCondition
              }
              templateCode="SPUC_SINV_ASN_HEADER_PURCHASE_DETAIL"
            />
          ),
        },
      ],
    };
    if (activeKey === 'allSearch') {
      return customizeBtnGroup(
        { code: `SINV.PURCHASER_DELIVERY_LIST.BUTTONS.ALL_SEARCH`, pro: true },
        <DynamicButtons buttons={btnNumber(buttons.allSearch)} />
      );
    } else {
      return customizeBtnGroup(
        { code: `SINV.PURCHASER_DELIVERY_LIST.BUTTONS.DETAIL_SEARCH`, pro: true },
        <DynamicButtons buttons={btnNumber(buttons.detailSearch)} />
      );
    }
  });

  // 多选查询
  const MutlTextFieldSearchComp = observer(({ name, placeholder }) => {
    return (
      <>
        <MutlTextFieldSearch
          name={name}
          dataSet={activeKey === 'allSearch' ? allSearchDs : detailSearchDs}
          placeholder={placeholder}
        />
      </>
    );
  });

  // 跳转明细
  const handleToDetail = (record) => {
    const id = record.get('asnHeaderId');
    // 前端判空/未定义
    if (!isNil(id)) {
      history.push({ pathname: `/sinv/purchaser-delivery/new-detail/${id}` });
    }
  };

  // tab切换
  const changeTab = (key) => {
    currentTab[0] = key;
    setActiveKey(key);
  };

  const listProps = {
    history,
    customizeTable,
    ds: activeKey === 'allSearch' ? allSearchDs : detailSearchDs,
    MutlTextFieldSearchComp,
    handleToDetail,
  };
  return (
    <React.Fragment>
      <Header title={intl.get(`sinv.purchaserDelivery.view.messageb.title`).d('采购方送货单查询')}>
        {/* 头部按钮 */}
        <HeaderBtns dataSet={activeKey === 'allSearch' ? allSearchDs : detailSearchDs} />
      </Header>
      <Content>
        <Tabs defaultActiveKey={activeKey} onChange={(key) => changeTab(key)} animated={false}>
          <TabPane
            tab={intl.get(`sinv.purchaserDelivery.view.tab.list`).d('送货单查询')}
            key="allSearch"
          >
            <DeliveryList {...listProps} />
          </TabPane>
          <TabPane
            tab={intl.get(`sinv.purchaserDelivery.view.tab.detail`).d('按明细查询')}
            key="detailSearch"
          >
            <DetailSearch {...listProps} />
          </TabPane>
        </Tabs>
      </Content>
    </React.Fragment>
  );
};

export default compose(
  useC7NComponent(OldIndex, 'query'),
  // 个性化编码
  WithCustomize({
    unitCode: [
      'SINV.PURCHASER_DELIVERY_LIST.GRID',
      'SINV.PURCHASER_DELIVERY_LIST.GRID_BY_DETAIL',
      'SINV.PURCHASER_DELIVERY.SEARCH.ALL_SEARCH',
      'SINV.PURCHASER_DELIVERY.SEARCH.DETAIL_SEARCH',
      'SINV.PURCHASER_DELIVERY_LIST.BUTTONS.ALL_SEARCH',
      'SINV.PURCHASER_DELIVERY_LIST.BUTTONS.DETAIL_SEARCH',
    ],
  }),
  // 多语言
  formatterCollections({
    code: [
      'sinv.purchaserDelivery',
      'sinv.purchaseReception',
      'sinv.common',
      'sinv.purchaseReception',
      'sinv.purchaserDelivery',
      'sinv.supplierDelivery',
      'sinv.deliveryClosed',
      'entity.supplier',
      'entity.item',
      'entity.customer',
      'entity.organization',
      'entity.roles',
      'entity.attachment',
      'entity.company',
      'sodr.quotePurchase',
      'hpfm.employee',
      'hzero.common',
      'sinv.receiptExecution',
    ],
  }),
  withProps(
    () => {
      // 送货单查询ds
      const allSearchDs = new DataSet(allDataSet());
      // 送货单按明细查询ds
      const detailSearchDs = new DataSet(detailDataSet());
      // 缓存tab
      const currentTab = ['allSearch'];
      return { allSearchDs, detailSearchDs, currentTab };
    },
    { cacheState: true },
    { cacheKey: '/sinv/purchaser-delivery/list' }
  )
)(C7NIndex);
