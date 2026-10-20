import React, { Fragment, useMemo, useState, useEffect } from 'react';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getResponse } from 'utils/utils';
import { Header } from 'components/Page';
import { DataSet, Spin, Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { compose, isEmpty } from 'lodash';
import DynamicButtons from '_components/DynamicButtons';
import cuxRemote from 'hzero-front/lib/utils/remote';
import { Button as PermissionButton } from 'components/Permission';
import notification from 'utils/notification';
import HeadInfoDataSet from './DataSource/HeadInfoDs';
import LineInfoDataSet from './DataSource/LineInfoDs';
import LogisticsDataSet from './DataSource/LogisticsDs';
import AttachInfo from './AttachInfo';
import BasicTable from './BasicTable';
import ReceiveInfo from './ReceiveInfo';
import ShipInfo from './ShipInfo';
import Affix from '../component/AffixDetail';
import {
  handleOpenMessage,
  handlePrint,
  handleOperationRecord,
  handleAddLogisticInfo,
} from '../../utils';
import { reImportERP, save, newPrintList } from '@/services/purchaserDeliveryService';
import { fetchConfigSheet } from '@/services/commonService';
import { globalPrint } from '@/routes/components/utils';

const Index = (props) => {
  const {
    match = {},
    customizeForm,
    customizeTable,
    customizeBtnGroup,
    customizeTabPane,
    remote,
  } = props;
  const { params } = match;

  // 可编辑标志
  const [editFlag, setEditFlag] = useState(false);
  // 同步按钮 可点击标志
  const [syncDisabled, setSyncDisabled] = useState(true);
  // 物流信息补录按钮 展示标志
  const [addLogisticsVisable, setAddLogisticsVisable] = useState(false);
  // 送货单头信息
  const [headerInfo, setHeaderInfo] = useState({});
  // 留言板未读条数 0
  const [messageCount, setMessageCount] = useState(null);
  // 按钮加载
  const [btnLoading, setBtnLoading] = useState(false);

  const [printLoading, setPrintLoading] = useState(false);

  const [configSheetFlag, setConfigSheetFlag] = useState(false); // 查询是否在配置表

  // 送货单id
  const asnHeaderId = useMemo(() => params.asnHeaderId, [match]);
  // 送货单头信息ds
  const HeadInfoDs = useMemo(() => new DataSet(HeadInfoDataSet()), [asnHeaderId]);
  // 送货单行信息ds
  const LineInfoDs = useMemo(() => new DataSet(LineInfoDataSet()), [asnHeaderId]);
  // 物流信息ds
  const LogisticsDs = useMemo(() => new DataSet(LogisticsDataSet()), [asnHeaderId]);
  // 留言板按钮未读条数 render
  const renderMessage = useMemo(
    () =>
      messageCount > 99 ? (
        <span style={{ color: 'red', marginLeft: '5px' }}>(99+)</span>
      ) : (
        <span style={{ color: 'red', marginLeft: '5px' }}>({messageCount})</span>
      ),
    [messageCount]
  );

  // 查询接口
  useEffect(() => {
    setBtnLoading(true);
    fetchConfig();
    HeadInfoDs.setQueryParameter('params', {
      asnHeaderId,
      customizeUnitCode:
        'SINV.SUPPLIER_DELIVERY.DETAIL.ADD_LOGISTICS,SINV.PURCHASER_DELIVERY.DETAIL.HEADER,SINV.SUPPLIER_DELIVERY.DETAIL.LOGISTICS,SINV.PURCHASER_DELIVERY.DETAIL.HEADERSHIP',
      userCampCode: 'PURCHASER',
    });
    HeadInfoDs.query().then((res) => {
      setSyncDisabled(
        !(
          ['SHIPPED', 'CANCELLED', 'CLOSED'].includes(res?.asnStatus) &&
          res?.submitSyncStatus === 'FAIL'
        )
      );
      setAddLogisticsVisable(res?.logisticsEnabledFlag === 1 || res?.logisticsEnabledFlag === '1');
      setMessageCount(res?.unReadCount);
      setHeaderInfo({ ...res });
      setBtnLoading(false);
    });
    LineInfoDs.setQueryParameter('params', {
      asnHeaderId,
      customizeUnitCode:
        'SINV.PURCHASER_DELIVERY.DETAIL.NEW_BASIC,SINV.PURCHASER_DELIVERY.DETAIL.OTHER',
    });
    LineInfoDs.query();
    LogisticsDs.setQueryParameter('params', {
      asnHeaderId,
    });
    LogisticsDs.query();
  }, [asnHeaderId]);

  // 查询配置表逻辑
  const fetchConfig = async () => {
    const res = await fetchConfigSheet({
      configCode: 'sinv_asn_logistics_information_phone_no_need',
    });
    if (getResponse(res)) {
      if (!isEmpty(res)) {
        setConfigSheetFlag(true);
      }
    }
  };

  // 保存
  const handleSaveList = async () => {
    // 校验
    const headFlag = await HeadInfoDs.validate();
    const lineFlag = await LineInfoDs.validate();
    if ((!headFlag || !lineFlag) && HeadInfoDs?.current?.get('_token')) {
      return;
    }
    setBtnLoading(true);
    const res = await save({
      customizeUnitCode:
        'SINV.PURCHASER_DELIVERY.DETAIL.HEADER,SINV.SUPPLIER_DELIVERY.DETAIL.LOGISTICS,SINV.PURCHASER_DELIVERY.DETAIL.NEW_BASIC,SINV.PURCHASER_DELIVERY.DETAIL.OTHER',
      data: {
        ...HeadInfoDs.toJSONData()[0],
        asnLineList: LineInfoDs.toJSONData(),
      },
    });
    // 处理返回的数据
    if (getResponse(res)) {
      notification.success();
      HeadInfoDs.query();
      LineInfoDs.query();
      LogisticsDs.query();
      setEditFlag(!editFlag);
    }
    setBtnLoading(false);
  };

  // 重新同步
  const handleAsyncRecord = async () => {
    setBtnLoading(true);
    const res = await reImportERP([
      {
        ...HeadInfoDs.toJSONData()[0],
        asnLineList: LineInfoDs.toJSONData(),
      },
    ]);
    // 处理返回的数据
    if (getResponse(res)) {
      notification.success();
      HeadInfoDs.query();
      LineInfoDs.query();
      LogisticsDs.query();
    }
    setBtnLoading(false);
  };

  // 留言框
  const openMessage = (id) => {
    setMessageCount(null);
    handleOpenMessage(id);
  };

  // 打印
  const print = (id) => {
    setBtnLoading(true);
    handlePrint(id, () => {
      setBtnLoading(false);
    });
  };

  const handleNewPrint = (DeliverHeaderDs) => {
    setPrintLoading(true);
    const originData = DeliverHeaderDs?.current?.toData();
    newPrintList([originData])
      .then((res) => {
        if (getResponse(res)) {
          globalPrint(res);
        }
        setPrintLoading(false);
      })
      .finally(() => {
        setPrintLoading(false);
      });
  };

  const headerBtns = () => {
    const btns = [
      editFlag && {
        name: 'save',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          icon: 'save',
          color: 'primary',
          disabled: !editFlag,
          onClick: () => handleSaveList(),
          loading: btnLoading,
        },
      },
      !editFlag && {
        name: 'edit',
        btnType: 'c7n-pro',
        child: editFlag
          ? intl.get('sinv.receiptExecution.model.receipt.cancel').d('取消编辑')
          : intl.get('hzero.common.button.edit').d('编辑'),
        btnProps: {
          icon: 'mode_edit',
          color: 'primary',
          onClick: () => setEditFlag(!editFlag),
        },
      },
      editFlag && {
        name: 'cancel',
        btnType: 'c7n-pro',
        child: editFlag
          ? intl.get('sinv.receiptExecution.model.receipt.cancel').d('取消编辑')
          : intl.get('hzero.common.button.edit').d('编辑'),
        btnProps: {
          icon: 'edit_off-o',
          funcType: 'flat',
          onClick: () => {
            HeadInfoDs.query();
            LineInfoDs.query();
            LogisticsDs.query();
            setEditFlag(!editFlag);
          },
        },
      },
      {
        name: 'printer',
        btnType: 'c7n-pro',
        child: intl.get(`sinv.common.view.message.button.print`).d('打印'),
        btnProps: {
          icon: 'print',
          funcType: 'flat',
          onClick: () => print(asnHeaderId),
          loading: btnLoading,
        },
      },
      {
        name: 'sync',
        btnType: 'c7n-pro',
        child: intl.get(`sinv.common.view.message.button.resync`).d('重新同步'),
        btnProps: {
          icon: 'sync',
          funcType: 'flat',
          disabled: syncDisabled,
          onClick: () => handleAsyncRecord(),
          loading: btnLoading,
        },
      },
      {
        name: 'operationRecord',
        btnType: 'c7n-pro',
        child: intl.get(`sinv.common.view.button.operationRecord`).d('操作记录'),
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          loading: btnLoading,
          onClick: () => handleOperationRecord(asnHeaderId),
        },
      },
      addLogisticsVisable && {
        name: 'addLogistics',
        btnType: 'c7n-pro',
        child: intl.get(`sinv.supplierDelivery.view.message.addLogistics.title`).d('物流信息补录'),
        btnProps: {
          icon: 'edit_calendar-o',
          funcType: 'flat',
          loading: btnLoading,
          onClick: () =>
            handleAddLogisticInfo(
              {
                customizeForm,
                customizeUnitCode: 'SINV.SUPPLIER_DELIVERY.DETAIL.ADD_LOGISTICS',
                headInfo: HeadInfoDs.toJSONData()[0],
                configSheetFlag,
              },
              () => {
                HeadInfoDs.query();
                LineInfoDs.query();
                LogisticsDs.query();
              }
            ),
        },
      },
      {
        name: 'message',
        group: true,
        child: (
          <PermissionButton
            data-name="message"
            funcType="flat"
            icon="message"
            type="c7n-pro"
            onClick={() => openMessage(asnHeaderId)}
            permissionList={[
              {
                code: `srm.logistics.ar.purchaser-delivery.ps.detail.button.messageboard`,
                type: 'button',
                meaning: '送货单查询-留言板',
              },
            ]}
          >
            {intl.get(`sinv.common.view.message.button.messageBoard`).d('留言板')}
            {messageCount ? renderMessage : null}
          </PermissionButton>
        ),
      },
      {
        name: 'newPrint',
        btnType: 'c7n-pro',
        child: (
          <Tooltip
            data-name="newPrint"
            style={{ marginLeft: 8 }}
            placement="bottomRight"
            title={intl
              .get('hzero.common.button.newQueryPrint')
              .d(
                '当点击打印出现【未能加载 PDF 文档】时，说明单据未取到对应的打印模板，请联系客户方检查配置后重试'
              )}
          >
            {intl.get('hzero.common.button.newPrint').d('打印（新）')}
          </Tooltip>
        ),
        btnProps: {
          loading: printLoading,
          funcType: 'flat',
          type: 'c7n-pro',
          icon: 'print',
          onClick: () => handleNewPrint(HeadInfoDs),
        },
      },
    ];
    return remote
      ? remote.process('SINV_PURCHASER_DELIVERY_QUERY_REMOTE_PROCESS_HEADER_BTNS', btns, {
          HeadInfoDs,
        })
      : btns;
  };

  const headBtns = headerBtns();

  const formProps = {
    ds: HeadInfoDs,
    customizeForm,
    editFlag,
  };

  const tableProp = {
    basicDs: LineInfoDs,
    otherDs: LineInfoDs,
    logisticsBasicDs: HeadInfoDs,
    headerInfo,
    customizeTable,
    customizeForm,
    customizeTabPane,
    editFlag,
  };

  const linkKeys = useMemo(() => ['shipInfo', 'receiveInfo', 'basicInfo', 'attachInfo'], []);

  return (
    <Fragment>
      <Affix linkKeys={linkKeys} hrefAttr="purchaser-delivery" />
      <Header
        title={intl.get(`sinv.purchaserDelivery.view.message.title.detail`).d('送货单明细')}
        backPath="/sinv/purchaser-delivery/list"
      >
        {customizeBtnGroup(
          { code: `SINV.PURCHASER_DELIVERY.DETAIL.BUTTONS.DETAIL_C7N`, pro: true },
          <DynamicButtons buttons={headBtns} />
        )}
      </Header>
      <div style={{ overflowY: 'auto' }}>
        <Spin spinning={false} wrapperClassName={DETAIL_DEFAULT_CLASSNAME}>
          {/* 发货 */}
          <ShipInfo {...formProps} />
          {/* 收货 */}
          <ReceiveInfo {...formProps} />
          {/* 基础/其他/物流 */}
          <BasicTable {...tableProp} />
          {/* 附件 */}
          <AttachInfo {...formProps} />
        </Spin>
      </div>
    </Fragment>
  );
};

export default compose(
  WithCustomize({
    unitCode: [
      'SINV.PURCHASER_DELIVERY.DETAIL.LINE_TABS',
      'SINV.PURCHASER_DELIVERY.DETAIL.HEADER',
      'SINV.PURCHASER_DELIVERY.DETAIL.NEW_BASIC',
      'SINV.PURCHASER_DELIVERY.DETAIL.OTHER',
      'SINV.PURCHASER_DELIVERY.DETAIL.HEADERSHIP',
      'SINV.PURCHASER_DELIVERY.DETAIL.BUTTONS.DETAIL_C7N',
      'SINV.SUPPLIER_DELIVERY.DETAIL.LOGISTICS',
      'SINV.SUPPLIER_DELIVERY.DETAIL.ADD_LOGISTICS',
    ],
  }),
  formatterCollections({
    code: [
      'sinv.purchaserDelivery',
      'sinv.supplierDelivery',
      'sinv.common',
      'sinv.purchaseReception',
      'entity.item',
      'entity.supplier',
      'entity.customer',
      'entity.organization',
      'entity.roles',
      'entity.attachment',
      'entity.item',
      'sinv.receiptExecution',
    ],
  }),
  cuxRemote({
    code: 'SINV_PURCHASER_DELIVERY_QUERY_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  })
)(Index);
