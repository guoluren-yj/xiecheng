import React, { Fragment, useMemo, useState, useEffect } from 'react';
import { DataSet, Spin, Modal, Tabs } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { compose, findIndex, isNil, isEmpty } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { Header } from 'components/Page';
import { queryFileListOrg, removeFile } from 'services/api';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import DynamicButtons from '_components/DynamicButtons';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { SRM_SPUC } from '_utils/config';
import notification from 'utils/notification';
// import uuid from 'uuid/v4';
import {
  submitDelivery,
  saveDetail,
  addDetailLines,
  batchDeleteDelivery,
  deleteDetailLines,
  fetchDetailTable,
  // getHeaderAttachmentUuid,
} from '@/services/deliveryCreationService';
import { fetchConfigSheet } from '@/services/commonService';
import { HeaderInfoForm } from './HeaderInfoForm';
import { ShipInfoForm } from './ShipmentForm';
import { AttachmentList } from './Attachment';
import { List } from './List';
// import UploadModal from './UploadModal';
import {
  headerFormDataSet,
  shipmentFormDataSet,
  logisticsFormDataSet,
  attachmentDataSet,
} from './FormDS';
import { lineListDataSet, addListDataSet } from './ListDS';
import LineItemModal from './LineItemModal';

import styles from './index.less';

const viewMessagePrompt = 'sinv.common.view.message';

const organizationId = getCurrentOrganizationId();

const { TabPane } = Tabs;

const Index = (props) => {
  const { customizeForm, customizeTable, customizeBtnGroup, history } = props;

  const headerFormDs = useMemo(() => new DataSet(headerFormDataSet()), []);

  const shipmentFormDs = useMemo(() => new DataSet(shipmentFormDataSet()), []);

  const logisticsFormDs = useMemo(() => new DataSet(logisticsFormDataSet()), []);

  const lineListDs = useMemo(() => new DataSet(lineListDataSet()), []);

  const addListDs = useMemo(() => new DataSet(addListDataSet()), []);

  const attachmentDs = useMemo(() => new DataSet(attachmentDataSet(headerFormDs)), []);

  const [state, useSetState] = useState({
    visible: false,
    lineVisible: false,
    loadVisible: false,
    asnStatus: null,
    attachmentUuid: null,
    objectVersionNumber: null,
    otherAttachmentUuid: null,
    reviewAttachmentUuid: null,
    approveAttachmentUuid: null,
    supplierAttachmentUuid: null,
    dimensions: [], // tab数据
    asnLineIdList: {}, // 初始化的id(对象内置id)
    nowId: null, // 当前tab页的id
  });

  useEffect(() => {
    fetchConfig();
    fetchDetailTables();
  }, []);

  // 查询配置表逻辑
  const fetchConfig = async () => {
    const res = await fetchConfigSheet({
      configCode: 'sinv_asn_logistics_information_phone_no_need',
    });
    if (getResponse(res)) {
      if (!isEmpty(res)) {
        logisticsFormDs.setState('configSheetFlag', true);
      }
    }
  };

  const fetchDetailTables = async (numId) => {
    try {
      const res = await fetchDetailTable();
      if (getResponse(res) && Array.isArray(res) && res.length) {
        const id = numId || res[0].asnHeaderId || null;
        useSetState({
          ...state,
          dimensions: res instanceof Array ? res : [],
          asnLineIdList: res[0] || {}, // 默认获取第一条数据,取id
          nowId: res[0].asnHeaderId || null, // 默认获取第一条数据id
          asnStatus: res[0].asnStatus || 'NEW',
        });
        // 前端判空/未定义
        if (!isNil(id)) {
          headerQueryList(id);
        }
      }
    } catch (e) {
      throw e;
    }
  };

  const headerQueryList = (numId) => {
    headerFormDs.setQueryParameter('params', {
      asnHeaderId: numId,
      customizeUnitCode:
        'SINV.DELIVERY_CREATION_DETAIL.HEADER,SINV.DELIVERY_CREATION_DETAIL.HEADERSHIP,SINV.DELIVERY_CREATION_DETAIL.LOGISTICS',
    });
    headerFormDs.query().then((res) => {
      attachmentDs.loadData([res]);
      logisticsFormDs.loadData([res]);
      shipmentFormDs.loadData([res]);
    });
    lineListDs.setQueryParameter('params', {
      asnHeaderId: numId,
      customizeUnitCode: 'SINV.DELIVERY_CREATION_DETAIL.LINE_BASIC',
    });
    lineListDs.query();
    logisticsFormDs.setQueryParameter('params', {
      asnHeaderId: numId,
      customizeUnitCode: 'SINV.DELIVERY_CREATION_DETAIL.LOGISTICS',
    });
    logisticsFormDs.query();
  };

  // 保存
  const handleSaveList = async () => {
    useSetState({ ...state, loadVisible: true });
    const headerFlag = await headerFormDs.validate();
    const shipFlag = await shipmentFormDs.validate();
    const lineFlag = await lineListDs.validate();
    const attrchMentFlag = await attachmentDs.validate();
    const logisticsFlag = await logisticsFormDs.validate();
    const dataForm = headerFormDs?.current?.toData(); // 获取所有值
    const headerInfo = headerFormDs?.current?.toJSONData(); // 获取修改值
    const shipmentInfo = shipmentFormDs?.current?.toJSONData(); // 获取修改值
    const logisticsInfo = logisticsFormDs?.current?.toJSONData(); // 获取修改值
    const attrchMentInfo = attachmentDs?.current?.toJSONData();
    const lineListInfo = lineListDs.toJSONData();
    // 解构所有值和修改值，用修改值覆盖所有值
    const data = {
      ...dataForm,
      ...headerInfo,
      ...shipmentInfo,
      ...logisticsInfo,
      ...attrchMentInfo,
      asnLineList: lineListInfo,
    };
    const param = {
      customizeUnitCode:
        'SINV.DELIVERY_CREATION_DETAIL.LINE_BASIC,SINV.DELIVERY_CREATION_DETAIL.HEADER,SINV.DELIVERY_CREATION_DETAIL.LOGISTICS,SINV.DELIVERY_CREATION_DETAIL.HEADERSHIP',
      data,
    };
    const flag = headerFlag && lineFlag && shipFlag && attrchMentFlag;
    if (logisticsFlag) {
      if (flag && headerFormDs.current?.get('_token')) {
        try {
          const res = await saveDetail(param);
          const { asnLineList } = res || {};
          const quantityInvalidFlagList =
            asnLineList?.map(
              (item) => item.quantityInvalidFlag && item.quantityInvalidFlag !== 1
            ) || [];
          if (quantityInvalidFlagList.length === 0 && !res?.failed) {
            notification.success();
            headerFormDs.query().then((rec) => {
              attachmentDs.loadData([rec]);
              logisticsFormDs.loadData([rec]);
              shipmentFormDs.loadData([rec]);
            });
            lineListDs.query();
            useSetState({ ...state, loadVisible: false });
          } else {
            useSetState({ ...state, loadVisible: false });
            saveErrorResponse(res);
          }
        } catch (e) {
          throw e;
        } finally {
          useSetState({ ...state, loadVisible: false });
        }
      } else {
        useSetState({ ...state, loadVisible: false });
      }
    } else {
      Modal.warning({
        title: intl
          .get(`sinv.common.model.common.logistics.message`)
          .d('物流信息页面存在必填字段未填写'),
      });
      useSetState({ ...state, loadVisible: false });
    }
  };

  // 提交
  const handleSubmitList = async () => {
    useSetState({ ...state, loadVisible: true });
    const headerFlag = await headerFormDs.validate();
    const shipFlag = await shipmentFormDs.validate();
    const logisticsFlag = await logisticsFormDs.validate();
    const lineFlag = await lineListDs.validate();
    const attrchMentFlag = await attachmentDs.validate();
    const dataForm = headerFormDs?.current?.toData(); // 获取所有值
    const headerInfo = headerFormDs?.current?.toJSONData(); // 获取修改值
    const shipmentInfo = shipmentFormDs?.current?.toJSONData(); // 获取修改值
    const logisticsInfo = logisticsFormDs?.current?.toJSONData(); // 获取修改值
    const attrchMentInfo = attachmentDs?.current?.toJSONData();
    const lineListInfo = lineListDs.toJSONData();
    const data = {
      ...dataForm,
      ...headerInfo,
      ...shipmentInfo,
      ...logisticsInfo,
      ...attrchMentInfo,
      asnLineList: lineListInfo,
    };
    const param = {
      customizeUnitCode:
        'SINV.DELIVERY_CREATION_DETAIL.LINE_BASIC,SINV.DELIVERY_CREATION_DETAIL.HEADER,SINV.DELIVERY_CREATION_DETAIL.LOGISTICS,SINV.DELIVERY_CREATION_DETAIL.HEADERSHIP',
      data: [data],
    };
    const flag = headerFlag && lineFlag && shipFlag && attrchMentFlag;
    if (logisticsFlag) {
      if (flag && headerFormDs.current?.get('_token')) {
        useSetState({ ...state, loadVisible: false });
        Modal.confirm({
          title: intl.get(`sinv.common.model.common.confirmSubmit`).d('是否确认提交送货单'),
          okText: intl.get('hzero.common.button.sure').d('确定'),
          cancelText: intl.get('hzero.common.button.cancel').d('取消'),
          onOk: async () => {
            try {
              const res = await submitDelivery(param);
              const { asnLineList } = (Array.isArray(res) && res.length && res[0]) || {};
              const quantityInvalidFlag =
                asnLineList?.map(
                  (item) => item.quantityInvalidFlag && item.quantityInvalidFlag !== 1
                ) || [];
              if (quantityInvalidFlag.length === 0 && !res?.failed) {
                if (state.dimensions.length !== 1) {
                  if (res) {
                    useSetState({ ...state, loadVisible: false });
                    notification.success();
                    fetchDetailTables();
                  } else {
                    saveErrorResponse(res[0]);
                  }
                } else {
                  notification.success();
                  history.push({
                    pathname: `/sinv/delivery-creation/list`,
                  });
                }
              } else {
                useSetState({ ...state, loadVisible: false });
                saveErrorResponse(res);
              }
            } catch (e) {
              throw e;
            } finally {
              useSetState({ ...state, loading: false });
            }
          },
        });
      } else {
        useSetState({ ...state, loadVisible: false });
      }
    } else {
      useSetState({ ...state, loadVisible: false });
      Modal.warning({
        title: intl
          .get(`sinv.common.model.common.logistics.message`)
          .d('物流信息页面存在必填字段未填写'),
      });
    }
  };

  /**
   * saveErrorResponse - 处理保存和提交时返回值错误信息
   * @param {object} [res={}] - 返回值
   */
  const saveErrorResponse = (res = {}) => {
    const { response = {} } = res;
    const { message, asnLineList = [] } = response;
    const defaultDataSource = lineListDs.toData();
    const description = (
      <ul style={{ margin: 0, padding: 0 }}>
        {asnLineList
          .filter((o) => o.quantityInvalidFlag === 1)
          .map((n) => {
            const num = findIndex(defaultDataSource, (o) => o.asnLineId === n.asnLineId) + 1;
            return (
              <li key={n.asnLineId}>
                {`${intl
                  .get(`sinv.common.model.common.displayAsnLineNum4`, { num })
                  .d(`第${num}行`)},${intl
                  .get(`sinv.purchaseReception.view.message.lineNum`)
                  .d('行号')}: ${n.displayAsnLineNum || ''}, ${intl
                  .get(`sinv.common.model.common.displayAsnLineNum2`)
                  .d('本次发货数量大于可发货数量')}\n`}
              </li>
            );
          })}
      </ul>
    );
    notification.error({
      description: message || description,
    });
  };

  // 删除
  const handleDeleteList = () => {
    useSetState({ ...state, loadVisible: true });
    const dataForm = headerFormDs?.current?.toData(); // 获取所有值
    // const headerInfo = headerFormDs.current.toJSONData();
    // const shipmentInfo = shipmentFormDs.current.toJSONData();
    const { _token, objectVersionNumber } = dataForm;
    const objDelete = {
      ...dataForm,
      // ...headerInfo,
      // ...shipmentInfo,
    };
    const objCancel = { _token, objectVersionNumber, asnHeaderId: state.nowId };
    const data = state.asnStatus === 'NEW' ? objDelete : objCancel;
    Modal.confirm({
      title:
        state.asnStatus === 'NEW'
          ? intl.get(`sinv.common.model.common.confirmDelete`).d('是否删除送货单')
          : intl.get(`sinv.common.model.common.confirmDestroy`).d('是否确认作废送货单'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => {
        try {
          batchDeleteDelivery([data]).then(() => {
            useSetState({ ...state, loadVisible: false });
            if (state.dimensions.length !== 1) {
              notification.success();
              fetchDetailTables();
            } else {
              notification.success();
              history.push({
                pathname: `/sinv/delivery-creation/list`,
              });
            }
          });
        } catch (e) {
          throw e;
        } finally {
          useSetState({ ...state, loadVisible: false });
        }
      },
      onCancel: () => {
        useSetState({ ...state, loadVisible: false });
      },
    });
  };

  const saveList = async () => {
    const data = addListDs.selected.map((item) => item.toJSONData());
    try {
      const res = await addDetailLines(state.nowId, data);
      if (getResponse(res)) {
        notification.success();
        headerFormDs.query();
        shipmentFormDs.query();
        lineListDs.query();
      }
    } catch (e) {
      throw e;
    }
  };

  // 行-删除
  const lineDelete = async () => {
    const data = lineListDs.selected.map((item) => item.toJSONData());
    // const list = data.filter((item) => item._status === 'create');
    const deleteFlag = data.some((i) => i.asnLineId);
    if (deleteFlag) {
      try {
        const res = await deleteDetailLines(state.nowId, data);
        if (getResponse(res)) {
          notification.success();
          headerFormDs.query();
          shipmentFormDs.query();
          lineListDs.query();
        }
      } catch (e) {
        throw e;
      }
    } else {
      lineListDs.remove(lineListDs.selected);
    }
  };

  const tabChange = (n) => {
    const numId = n;
    fetchDetailTables(numId);
    useSetState({
      ...state,
      nowId: numId, // 获取当前tab页的id
    });
  };

  const headerBtns = () => {
    const btns = [
      {
        name: 'submit',
        child: intl.get('hzero.common.button.submit').d('提交'),
        btnProps: {
          icon: 'check',
          color: 'primary',
          type: 'c7n-pro',
          loading: state.loadVisible,
          // disabled: !opreateFlag,
          onClick: () => handleSubmitList(),
        },
      },
      {
        name: 'save',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          icon: 'save',
          type: 'c7n-pro',
          loading: state.loadVisible,
          onClick: () => handleSaveList(),
        },
      },
      state.asnStatus === 'NEW' && {
        name: 'delete',
        child: intl.get(`hzero.common.button.delete`).d('删除'),
        btnProps: {
          icon: 'delete',
          type: 'c7n-pro',
          loading: state.loadVisible,
          onClick: () => handleDeleteList(),
        },
      },
      state.asnStatus === 'REJECTED' && {
        name: 'invalid',
        child: intl.get(`hzero.common.button.invalid`).d('作废'),
        btnProps: {
          icon: 'delete',
          type: 'c7n-pro',
          loading: state.loadVisible,
          onClick: () => handleDeleteList(),
        },
      },
      {
        name: 'newExport',
        group: true,
        child: (
          <ExcelExportPro
            style={{ border: 'none' }}
            buttonText={intl.get(`sinv.common.view.button.newExportDetail`).d('新版导出明细行')}
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              permissionList: [
                {
                  code: 'srm.logistics.delivery.delivery-creation.ps.button.detail.newexport',
                  type: 'c7n-pro',
                  funcType: 'flat',
                },
              ],
            }}
            requestUrl={`${SRM_SPUC}/v1/${organizationId}/asn-header/${state.nowId}/lines/export-new`}
            templateCode="SPUC_SINV_ASN_HEADER_MAINTAIN_DETAIL"
          />
        ),
      },
      // {
      //   name: 'attachment',
      //   child: intl.get('sinv.common.attachment.upload').d('附件管理'),
      //   btnProps: {
      //     icon: 'paper-clip',
      //     type: 'c7n-pro',
      //     // loading: spinning,
      //     onClick: () => openUploadModal(),
      //   },
      // },
    ];
    return btns;
  };

  const attachmentUuidList = (val, record) => {
    useSetState({
      ...state,
      lineVisible: true,
      asnLineId: record.get('asnLineId'),
      attachmentUuid: record.get('attachmentUuid'),
      objectVersionNumber: record.get('objectVersionNumber'),
      otherAttachmentUuid: record.get('otherAttachmentUuid'), // 采购方uuid
      reviewAttachmentUuid: record.get('reviewAttachmentUuid'), // 采购方uuid
      approveAttachmentUuid: record.get('approveAttachmentUuid'), // 采购方uuid
    });
  };

  const lineHideAttachment = () => {
    useSetState({ ...state, lineVisible: false });
  };

  /**
   * 查询采购方附件列表
   * @param {Object} payload
   * @param {String} payload.attachmentUUID 附件uuid
   * @param {string} payload.bucketName 桶名
   * @returns Promise
   */
  const fetchPurchaserAttachmentList = async (payload) => {
    const res = await queryFileListOrg(payload);
    return getResponse(res);
  };

  /**
   * 查询供应商附件列表
   * @param {Object} payload
   * @param {String} payload.attachmentUUID 附件uuid
   * @param {string} payload.bucketName 桶名
   * @returns Promise
   */
  // const fetchSupplierAttachmentList = async (payload) => {
  //   const res = await queryFileListOrg(payload);
  //   return getResponse(res);
  // };

  /**
   * 删除附件
   * @param {Object} payload
   * @param {String} payload.attachmentUUID 附件uuid
   * @param {string} payload.bucketName 桶名
   * @param {string} payload.urls 要删除附件的url
   * @returns Promise
   */
  const removeAttachment = async (payload) => {
    const res = await removeFile(payload);
    return getResponse(res);
  };

  /**
   * hideAttachment - 关闭附件弹窗
   */
  // const hideAttachment = () => {
  //   useSetState({
  //     ...state,
  //     visible: false,
  //   });
  // };

  const renderDimensions = () => {
    const formProps = {
      headerFormDs,
      shipmentFormDs,
      asnHeaderId: state.nowId,
      customizeForm,
    };
    const listProps = {
      addListDs,
      lineListDs,
      customizeForm,
      customizeTable,
      customizeBtnGroup,
      logisticsFormDs,
      asnHeaderId: state.nowId,
      lineDelete: () => lineDelete(),
      saveList: () => saveList(),
      attachmentUuidList: (a, b) => attachmentUuidList(a, b),
    };
    const lineAttachmentProps = {
      lineVisible: state.lineVisible,
      otherAttachmentUuid: state.otherAttachmentUuid, // 采购方uuid查询
      reviewAttachmentUuid: state.reviewAttachmentUuid, // 采购方uuid复审
      approveAttachmentUuid: state.approveAttachmentUuid, // 采购方uuid审批
      hideAttachment: () => lineHideAttachment(),
      onFetchPurchaserAttachmentList: (obj) => fetchPurchaserAttachmentList(obj), // 查询采购方附件
      bucketName: 'private-bucket',
      bucketDirectory: 'sodr-order',
      onRemoveAttachment: () => removeAttachment(),
    };
    const basicProps = {
      attachmentDs,
    };
    return state.dimensions.map((item) => {
      return (
        <TabPane tab={item.asnNum} key={item.asnHeaderId}>
          <HeaderInfoForm {...formProps} />
          <ShipInfoForm {...formProps} />
          <List {...listProps} />
          <AttachmentList {...basicProps} />
          {state.lineVisible && <LineItemModal {...lineAttachmentProps} />}
        </TabPane>
      );
    });
  };
  const buttons = headerBtns();
  return (
    <Fragment>
      <Header
        title={intl.get(`${viewMessagePrompt}.title.detail`).d('送货单明细')}
        backPath="/sinv/delivery-creation/list"
      >
        {customizeBtnGroup(
          { code: `SINV.DELIVERY_CREATION.DETAIL.BUTTONS.BTN`, pro: true },
          <DynamicButtons buttons={buttons} />
        )}
      </Header>
      <div style={{ overflowY: 'auto' }}>
        <Spin spinning={false}>
          <Tabs
            animated={false}
            onTabClick={(key) => tabChange(key)}
            tabPosition="left"
            className={styles['sub-accout-tabs']}
          >
            {renderDimensions()}
          </Tabs>
        </Spin>
      </div>
    </Fragment>
  );
};

export default compose(
  WithCustomize({
    unitCode: [
      'SINV.DELIVERY_CREATION_DETAIL.HEADER',
      'SINV.DELIVERY_CREATION_DETAIL.LINE_BASIC',
      'SINV.DELIVERY_CREATION_DETAIL.LOGISTICS',
      'SINV.DELIVERY_CREATION_DETAIL.HEADERSHIP',
      'SINV.DELIVERY_CREATION.DETAIL.BUTTONS.BTN',
      'SINV.DELIVERY_CREATION_DETAIL.BBUTTONS.BASIC_BTN',
    ],
  }),
  formatterCollections({
    code: [
      'sinv.deliveryCreation',
      'sinv.purchaserDelivery',
      'sinv.common',
      'entity.company',
      'entity.customer',
      'entity.supplier',
      'entity.item',
      'entity.roles',
      'sinv.cuxDeliveryCreation',
      'entity.attachment',
      'sinv.receiptExecution',
    ],
  })
)(Index);
