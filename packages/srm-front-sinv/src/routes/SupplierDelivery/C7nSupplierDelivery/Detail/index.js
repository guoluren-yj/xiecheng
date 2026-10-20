import React, { createContext, useMemo, useEffect, useCallback } from 'react';
import { useDataSet } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';
import { Header } from 'components/Page';
import { Button as PermissionButton } from 'components/Permission';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import remote from 'hzero-front/lib/utils/remote';
import { queryDetailHeader } from '@/services/supplierDeliveryService';
import {
  DeliverHeaderDataSet,
  ShipHeaderInfoDataSet,
} from '@/routes/SupplierDelivery/C7nSupplierDelivery/Detail/store/detailDs';
import { fetchConfigSheet } from '@/services/commonService';
import { compose, isEmpty } from 'lodash';
import qs from 'querystring';
import AttachmentList from './Attachment';
import {
  handleRouteJump,
  handleLogisticsChange,
  handleSave,
  handleNewPrint,
  handlePrint,
  handleOperateRecord,
  handleOpenMessage,
  handleReImport,
} from './func';

import DeliverHeader from './DeliverHeader';
import ShipHeaderInfo from './ShipHeaderInfo';
import ShipFooterInfo from './ShipFooterInfo';
import logisticsDataSet from './store/logisticsDs';
import baseInfoDataSet from './store/baseInfoDs';
import attachmentDataSet from './store/attachmentDs';
import { useSetState } from '@/routes/Hooks';
import Affix from './AffixDetail/index';
import styles from '../index.less';

export const Store = createContext();

const Index = (props) => {
  const {
    match: { params = {} },
  } = props;
  const { asnHeaderId } = params;
  const { printStatusFlag } = qs.parse(props?.location?.search.substr(1));
  const { customizeBtnGroup, customizeForm, customizeTable, customizeTabPane, cuxRemote } = props;

  const [state, setState] = useSetState({
    loading: false,
    editFlag: true,
    unReadCount: '',
    logisticsBtnVisible: 0,
  });

  const DeliverHeaderDs = useDataSet(() => DeliverHeaderDataSet(), []);
  const ShipHeaderInfoDs = useDataSet(() => ShipHeaderInfoDataSet(), []);
  const LogisticsDs = useDataSet(() => logisticsDataSet(), []);
  const baseInfoDs = useDataSet(() => baseInfoDataSet(), []);
  const attachmentDs = useDataSet(() => attachmentDataSet(DeliverHeaderDs), [DeliverHeaderDs]);

  const handleQueryInfo = useCallback(async () => {
    setState({
      loading: true,
    });
    const param = {
      asnHeaderId,
      userCampCode: 'SUPPLIER',
      customizeUnitCode:
        'SINV.SUPPLIER_DELIVERY.DETAIL.HEADER,SINV.SUPPLIER_DELIVERY.DETAIL.ADD_LOGISTICS,SINV.SUPPLIER_DELIVERY.DETAIL.HEADERSHIP,SINV.SUPPLIER_DELIVERY.DETAIL.LOGISTICS',
    };
    const headerRes = await queryDetailHeader(param);
    // const LineRes = await queryDetailLines({
    //   asnHeaderId,
    //   customizeUnitCode:
    //     'SINV.SUPPLIER_DELIVERY.DETAIL.BASIC_C7N,SINV.SUPPLIER_DELIVERY.DETAIL.OTHER',
    // });

    baseInfoDs.setQueryParameter('params', {
      asnHeaderId,
      customizeUnitCode:
        'SINV.SUPPLIER_DELIVERY.DETAIL.BASIC_C7N,SINV.SUPPLIER_DELIVERY.DETAIL.OTHER',
    });
    baseInfoDs.query();

    if (getResponse(headerRes)) {
      DeliverHeaderDs.loadData([headerRes]);
      ShipHeaderInfoDs.loadData([headerRes]);
      LogisticsDs.loadData([headerRes]);
      attachmentDs.loadData([headerRes]);
      setState({
        loading: false,
        editFlag: true,
        unReadCount: headerRes.unReadCount,
        logisticsBtnVisible: headerRes.logisticsEnabledFlag,
      });
    } else {
      setState({
        loading: false,
      });
    }
  }, []);

  const renderMessage = useMemo(
    () =>
      state.unReadCount > 99 ? (
        <span style={{ color: 'red', marginLeft: '5px' }}>(99+)</span>
      ) : (
        <span style={{ color: 'red', marginLeft: '5px' }}>({state.unReadCount})</span>
      ),
    [state.unReadCount]
  );

  useEffect(() => {
    fetchConfig();
    handleQueryInfo();
  }, []);

  // 查询配置表逻辑
  const fetchConfig = async () => {
    const res = await fetchConfigSheet({
      configCode: 'sinv_asn_logistics_information_phone_no_need',
    });
    if (getResponse(res)) {
      if (!isEmpty(res)) {
        LogisticsDs.setState('configSheetFlag', true);
      }
    }
  };

  const headerButtons = () => {
    const { loading, editFlag } = state;
    const btns = [
      {
        name: 'labelPrint',
        btnType: 'c7n-pro',
        child: intl.get(`sinv.common.view.message.button.labelPrint`).d('标签打印'),
        btnProps: {
          loading,
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: () => handleRouteJump(DeliverHeaderDs),
        },
      },
      state.logisticsBtnVisible === 1 && {
        name: 'addLogistics',
        btnType: 'c7n-pro',
        child: intl.get(`sinv.supplierDelivery.view.message.addLogistics.title`).d('物流信息补录'),
        btnProps: {
          loading,
          icon: 'form',
          color: 'primary',
          onClick: () => handleLogisticsChange(LogisticsDs, customizeForm, handleQueryInfo),
        },
      },
      editFlag && {
        name: 'edit',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.status.edit').d('编辑'),
        btnProps: {
          loading,
          icon: 'mode_edit',
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: () => setState((prev) => ({ editFlag: !prev })),
        },
      },
      !editFlag && {
        name: 'editCancel',
        btnType: 'c7n-pro',
        child: intl.get('sinv.receiptExecution.model.receipt.cancel').d('取消编辑'),
        btnProps: {
          loading,
          icon: 'cancel',
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: () => {
            handleQueryInfo();
            setState((prev) => ({ editFlag: !prev }));
          },
        },
      },
      {
        name: 'save',
        btnType: 'c7n-pro',
        child: intl.get(`sinv.common.view.button.save`).d('保存'),
        btnProps: {
          loading,
          icon: 'save',
          type: 'c7n-pro',
          funcType: 'flat',
          disabled: editFlag,
          onClick: () => handleSave(DeliverHeaderDs, ShipHeaderInfoDs, baseInfoDs, handleQueryInfo),
        },
      },
      Number(printStatusFlag) && {
        name: 'print',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.print').d('打印'),
        btnProps: {
          loading,
          icon: 'print',
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: () => handlePrint(asnHeaderId),
        },
      },
      {
        name: 'operating',
        btnType: 'c7n-pro',
        child: intl.get(`sinv.common.view.button.operationRecord`).d('操作记录'),
        btnProps: {
          loading,
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: () => handleOperateRecord(DeliverHeaderDs),
        },
      },
      {
        name: 'resync',
        btnType: 'c7n-pro',
        child: intl.get(`sinv.common.view.message.button.resync`).d('重新同步'),
        btnProps: {
          loading,
          icon: 'sync',
          type: 'c7n-pro',
          funcType: 'flat',
          disabled: !(
            ['SHIPPED', 'CANCELLED', 'CLOSED'].includes(
              DeliverHeaderDs?.current?.get('asnStatus')
            ) && DeliverHeaderDs?.current?.get('submitSyncStatus') === 'FAIL'
          ),
          onClick: () => handleReImport(DeliverHeaderDs, baseInfoDs, handleQueryInfo),
        },
      },
      {
        name: 'message',
        group: true,
        child: (
          <PermissionButton
            funcType="flat"
            data-name="message"
            icon="message"
            type="c7n-pro"
            onClick={() => handleOpenMessage(asnHeaderId)}
            permissionList={[
              {
                code: `srm.logistics.delivery.supplier-delivery.ps.detail.button.messageboard`,
                type: 'button',
                meaning: '我的送货单-留言板',
              },
            ]}
          >
            {intl.get(`sinv.common.view.message.button.messageBoard`).d('留言板')}
            {state.unReadCount ? renderMessage : null}
          </PermissionButton>
        ),
      },
      {
        name: 'newPrint',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.newPrint').d('打印（新）'),
        btnProps: {
          loading,
          funcType: 'flat',
          type: 'c7n-pro',
          icon: 'print',
          onClick: () => handleNewPrint(DeliverHeaderDs),
        },
      },
    ];
    return cuxRemote
      ? cuxRemote.process('SINV_PURCHASER_DELIVERY_REMOTE_PROCESS_HEADER_BTNS', btns, {
          DeliverHeaderDs,
        })
      : btns;
  };

  const value = {
    customizeForm,
    customizeTable,
    customizeTabPane,
    ShipHeaderInfoDs,
    baseInfoDs,
    otherInfoDs: baseInfoDs,
    DeliverHeaderDs,
    LogisticsDs,
    asnHeaderId,
    headerInfo: LogisticsDs.toJSONData(),
    loading: state.loading,
    editFlag: state.editFlag,
  };

  const linkKeys = useMemo(() => ['shipInfo', 'receiveInfo', 'basicInfo', 'attachInfo'], []);

  return (
    <>
      <Affix linkKeys={linkKeys} hrefAttr="supplier-delivery" />
      <Header
        title={intl.get(`sinv.common.model.common.deliveryDetail`).d('送货单明细')}
        backPath="/sinv/supplier-delivery/list"
      >
        {customizeBtnGroup(
          { code: `SINV.SUPPLIER_DELIVERY.DETAIL.BUTTONS.C7NBTNS`, pro: true },
          <DynamicButtons buttons={headerButtons()} />
        )}
      </Header>

      <div style={{ overflowY: 'auto' }}>
        <div className={styles.pageWrapperOne}>
          <div className={styles.pageWrap}>
            <h3 className={styles.pageTitle} id="supplier-delivery-shipInfo">
              {intl.get(`sinv.purchaserDelivery.view.message.title.orderHeaderShip`).d('发货信息')}
            </h3>
          </div>
          <Store.Provider value={value}>
            <DeliverHeader />
          </Store.Provider>
        </div>

        <div className={styles.pageWrapperTwo}>
          <div className={styles.pageWrap}>
            <h3 className={styles.pageTitle} id="supplier-delivery-receiveInfo">
              {intl.get(`sinv.purchaserDelivery.view.message.title.headerDispatched`).d('收货信息')}
            </h3>
          </div>
          <Store.Provider value={value}>
            <ShipHeaderInfo />
          </Store.Provider>
        </div>

        <div className={styles.pageWrapperTwo}>
          <Store.Provider value={value}>
            <ShipFooterInfo />
          </Store.Provider>
        </div>

        <div className={styles.pageWrapperThree}>
          <div className={styles.pageWrap}>
            <h3 className={styles.pageTitle} id="supplier-delivery-attachInfo">
              {intl.get('sinv.common.attachment.upload').d('附件管理')}
            </h3>
          </div>
          <AttachmentList attachmentDs={attachmentDs} editFlag={state.editFlag} />
        </div>
      </div>
    </>
  );
};

export default compose(
  WithCustomize({
    unitCode: [
      'SINV.SUPPLIER_DELIVERY.DETAIL.HEADER',
      'SINV.SUPPLIER_DELIVERY.DETAIL.BASIC_C7N',
      'SINV.SUPPLIER_DELIVERY.DETAIL.OTHER',
      'SINV.SUPPLIER_DELIVERY.DETAIL.ADD_LOGISTICS',
      'SINV.SUPPLIER_DELIVERY.DETAIL.HEADERSHIP',
      'SINV.SUPPLIER_DELIVERY.DETAIL.BUTTONS.C7NBTNS',
      'SINV.SUPPLIER_DELIVERY.DETAIL.LOGISTICS',
      'SINV.SUPPLIER_DELIVERY.DETAIL.LINE_TABS',
    ],
  }),
  formatterCollections({
    code: [
      'sinv.supplierDelivery',
      'sinv.purchaserDelivery',
      'sinv.common',
      'entity.supplier',
      'entity.customer',
      'entity.organization',
      'entity.roles',
      'entity.attachment',
      'entity.item',
      'sinv.receiptExecution',
    ],
  }),
  remote({
    code: 'SINV_PURCHASER_DELIVERY_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'cuxRemote', // 默认 'remote'， 如有属性冲突可以改此属性
  })
)(Index);
