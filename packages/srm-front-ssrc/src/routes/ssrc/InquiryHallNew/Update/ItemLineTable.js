import React, { useCallback, useMemo, useState, useImperativeHandle } from 'react';
import {
  Button,
  DataSet,
  Lov,
  Modal,
  ModalProvider,
  Table,
  Attachment,
  Tooltip,
  CheckBox,
  Select,
} from 'choerodon-ui/pro';
import { Icon, Badge } from 'choerodon-ui';
import { action } from 'mobx';
import { filter, isEmpty, noop, isNil, throttle, omit } from 'lodash';
import { routerRedux } from 'dva/router';
import { Modal as ModalHzero } from 'hzero-ui';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import { observer, useComputed } from 'mobx-react-lite';
import request from 'utils/request';
import remoteHoc from 'hzero-front/lib/utils/remote';

import { getEditTableData, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import CommonImportNew from 'hzero-front/lib/components/Import';
import CommonImport from 'hzero-front-himp/lib/components/CommonImport';
import { SRM_SSRC } from '_utils/config';
import { numberSeparatorRender } from '@/utils/renderer';

import { TooltipButtonPro } from '@/routes/components/TooltipButton';
import { handleFormDSFieldsValue } from '@/routes/components/Widget/Forms/handleFormDSFieldsValue';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import QuotationDetailModal from '@/routes/components/QuotationDetailNew/Purchaser';
import QuotationDetailImport from '@/routes/components/QuotationDetailImport';
import { withOverride, TooltipTitle, calculateBasicQty } from '@/utils/utils';
import { validatorConfirmModal } from '@/routes/components/ConfirmModal';

import LadderLevelModal from './LadderLevelModal';
import LadderLevelModalBid from './LadderLevelModalBid';
import BatchCreateItemForm from './BatchCreateItemForm';
import {
  batchUpdateLines,
  isClearMaterial,
  updateOuIdFiled,
  updateInvOrganizationFiled,
  getBatchMainItemData,
  updateExpandInvOrganizationFiled,
} from './utils/utils';
import BatchMaintainItemForm from './BatchMaintainItemForm';
import PurchaseRequestContent from './PurchaseRequestContent';

import BatchMaintainItemDS from './BatchMaintainItemDS';
import PurchaseRequestDS from './PurchaseRequestDS';
import BatchCreateItemDS from './BatchCreateItemDS';

import { QuotationRange } from './Components';

import style from './index.less';

const ItemLineTable = observer((props) => {
  const {
    rfxId,
    itemLineTableDS,
    dispatch,
    organizationId,
    inquiryHall: { ladderLevelData = [], LadderLevelChange = false },
    custLoading,
    customizeTable,
    customizeBtnGroup = noop,
    customizeForm,
    clearProperties = noop,
    batchCreateItemDS,
    header = {},
    rfxInfoDS,
    bidFlag,
    changeRfxQuantity,
    copyItemLine,
    createItemLine,
    saveItemLine,
    applyToInquiryNewFlag,
    proxyDsCreate = {},
    configSheet = {},
    destroyItemLine,
    supplierListTableDS,
    rfx = {},
    viewApplicationOrgModal = () => {},
    isNewRfx = false,
    operationType = '',
    match,
    updateBatchCreateItemDS = noop,
    doubleUnitFlag = false,
    saveForceItemLine,
    itemRemote,
    setBatchMainItems = noop,
    isNewBiddingFlag = noop,
    afterSaveItemLineUpdateHeader = noop,
    isNewTemplateConfigFlag = false,
    togglePageLoading = noop,
    sourceResultsData = [],
  } = props;
  const { sourceKey = 'INQUIRY' } = rfx;
  const { priceTypeCode, sourceFrom } = header;

  const { templateId } = rfxInfoDS?.current ? rfxInfoDS.current?.get(['templateId']) : {};

  const [ladderLevelSelectedRowKeys, setLadderLevelSelectedRowKeys] = useState([]); // 阶梯报价选中id
  const [viewLadderLevelVisible, setViewLadderLevelVisible] = useState(false); // 阶梯报价模态框
  const [ladderLevelHeaderData, setLadderLevelHeaderData] = useState({}); // 阶梯报价头部数据
  const [modalLoading, toggleModalLoading] = useState(false); // open modal loading
  const batchMaintainItemDS = useMemo(
    () =>
      new DataSet(
        itemRemote
          ? itemRemote.process(
              'SSRC_INQUIRYHALLNEW_UPDATE_ITEMLINETABLE_PROCESS_BATCHEDIT_DS',
              BatchMaintainItemDS({ remote: itemRemote, rfxInfoDS }),
              {
                bidFlag,
                rfxInfoDS,
              }
            )
          : BatchMaintainItemDS()
      ),
    [rfxInfoDS]
  );
  const purchaseRequestDS = useMemo(
    () =>
      new DataSet(
        itemRemote
          ? itemRemote.process(
              'SSRC_INQUIRYHALLNEW_UPDATE_ITEMLINETABLE_PROCESS_PURCHASEREQUEST_DS',
              PurchaseRequestDS(sourceKey),
              {
                bidFlag,
                rfxInfoDS,
                pageProps: props,
              }
            )
          : PurchaseRequestDS(sourceKey)
      ),
    [sourceKey]
  );
  const [itemChooseContent, setItemChooseContent] = useState({}); // 保存所选行

  // hooks继承挂载二开需要的方法变量等
  useImperativeHandle(props?.forwardRef, () => ({
    getHeaderButtons,
    handleOkBatchCreate,
  }));

  const batchSetQueryParameter = useCallback(() => {
    batchMaintainItemDS.setQueryParameter('headers', {
      ...header,
      organizationId,
      companyId: rfxInfoDS?.current?.get('companyId'),
      allowChangeItemsFlag: !allowChangeItemsFlag && sourceFrom === 'PROJECT',
    });
    batchMaintainItemDS.create({});
  }, [batchMaintainItemDS, rfxInfoDS, header]);

  // 单据来源为采购申请转立项转寻源
  const purchaseRequestFlag = itemLineTableDS?.some((item) => item && item?.get('prLineId'));

  /**
   * 物品明细-获取删除选中行
   *
   * @param {*} selectedRowKeys
   * @memberof EditForm
   */
  const handleLadderLevelRowSelectChange = useCallback((selectedRowKeys = []) => {
    setLadderLevelSelectedRowKeys(selectedRowKeys);
  }, []);

  /**
   * 阶梯报价-新增行
   */
  const createLadderLine = useCallback(
    throttle((rfxLineItemId) => {
      const handleLineCreate = () => {
        const newLine = {
          rfxLineItemId,
          ladderInquiryId: uuidv4(),
          rfxLadderLineNum: undefined,
          ladderFrom: undefined,
          ladderTo: undefined,
          tenantId: organizationId,
          remark: undefined,
          _status: 'create',
        };
        if (!isEmpty(ladderLevelData)) {
          const lastLine = ladderLevelData[ladderLevelData.length - 1] || {};
          newLine.ladderFrom = lastLine.$form ? lastLine.$form.getFieldValue('ladderTo') : null;
          newLine.secondaryLadderFrom = lastLine.$form
            ? lastLine.$form.getFieldValue('secondaryLadderTo')
            : null;
        }

        dispatch({
          type: 'inquiryHall/updateState',
          payload: {
            ladderLevelData: [...ladderLevelData, newLine],
          },
        });
      };
      if (itemRemote?.event) {
        itemRemote.event.fireEvent('remoteCreateLadderLine', {
          rfxLineItemId,
          ladderLevelData,
          handleLineCreate,
          ...props,
        });
      } else {
        handleLineCreate();
      }
    }, 500),
    [dispatch, organizationId, ladderLevelData, ladderLevelData?.length, itemRemote]
  );

  /**
   * 阶梯报价-保存
   */
  const saveLadderLevel = useCallback(
    throttle((rfxLineItemId, afterSubmitCloseModalFlag = false) => {
      const newParams = getEditTableData(ladderLevelData, ['ladderInquiryId']);

      if (!isEmpty(newParams)) {
        const newParameters = newParams.map((item, index) => {
          return {
            ...item,
            rfxLadderLineNum: index + 1,
          };
        });
        toggleModalLoading(true);
        dispatch({
          type: 'inquiryHall/saveLadderLevel',
          payload: {
            newParameters,
            organizationId,
            rfxLineItemId,
            customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.ITEMLINE_LADDER_LEVEL`,
          },
        }).then((res) => {
          toggleModalLoading();
          if (res) {
            dispatch({
              type: 'inquiryHall/updateState',
              payload: {
                LadderLevelChange: false,
              },
            });
            dispatch({
              type: 'inquiryHall/fetchLadderLevelyTable',
              payload: {
                rfxLineItemId,
                organizationId,
                customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.ITEMLINE_LADDER_LEVEL`,
              },
            });
            notification.success();
            handleLadderLevelRowSelectChange();
            if (afterSubmitCloseModalFlag) {
              hideLadderLevelModal();
            }
          }
        });
      }
    }, 800),
    [
      dispatch,
      organizationId,
      ladderLevelData,
      hideLadderLevelModal,
      ladderLevelData?.length,
      sourceKey,
    ]
  );

  /**
   * 阶梯报价 - 批量删除
   */
  const deleteLadderLevel = useCallback(
    throttle((rfxLineItemId) => {
      if (isEmpty(ladderLevelSelectedRowKeys)) {
        return;
      }

      const newParameters = []; // 勾选数据(非新建行)
      const newLadderLevel = []; // 所有数据(非新建行)
      const allUnselectLine = []; // all un selected line

      ladderLevelData.forEach((item) => {
        const { ladderInquiryId, _status } = item || {};
        if (_status !== 'create') {
          newLadderLevel.push(item);

          if (ladderLevelSelectedRowKeys.includes(ladderInquiryId)) {
            newParameters.push(item);
          }
        }
        if (!ladderLevelSelectedRowKeys.includes(ladderInquiryId)) {
          allUnselectLine.push(item);
        }
      });
      // 正常的最后几条
      const endLadderList = newLadderLevel.slice(newLadderLevel.length - newParameters.length);
      // 二者相同项
      const commonLadderList = filter(endLadderList, (item) => {
        return newParameters.find((param) => param.ladderInquiryId === item.ladderInquiryId);
      });

      if (
        newParameters.length &&
        newParameters.length < newLadderLevel.length &&
        commonLadderList.length < newParameters.length
      ) {
        notification.warning({
          message: intl
            .get(`ssrc.inquiryHall.model.inquiryHall.onlySelectedLast`)
            .d('只能从最后一行已保存行开始删除!'),
        });
      } else {
        ModalHzero.confirm({
          title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
          onOk: () => {
            if (isEmpty(newParameters)) {
              dispatch({
                type: 'inquiryHall/updateState',
                payload: {
                  ladderLevelData: allUnselectLine,
                },
              });
              handleLadderLevelRowSelectChange();
            } else {
              dispatch({
                type: 'inquiryHall/deleteLadderLevelLines',
                payload: { remoteDelete: newParameters, organizationId, rfxLineItemId },
              }).then((res) => {
                if (res) {
                  notification.success();
                  dispatch({
                    type: 'inquiryHall/updateState',
                    payload: {
                      ladderLevelData: newLadderLevel,
                    },
                  });
                  handleLadderLevelRowSelectChange();
                  dispatch({
                    type: 'inquiryHall/fetchLadderLevelyTable',
                    payload: {
                      rfxLineItemId,
                      organizationId,
                      customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.ITEMLINE_LADDER_LEVEL`,
                    },
                  });
                }
              });
            }
          },
        });
      }
    }, 600),
    [
      dispatch,
      organizationId,
      ladderLevelData,
      ladderLevelSelectedRowKeys,
      handleLadderLevelRowSelectChange,
      sourceKey,
    ]
  );

  /**
   * 阶梯报价-表格内容改变
   */
  const changeLadderLevelTableData = useCallback(() => {
    if (!LadderLevelChange) {
      dispatch({
        type: 'inquiryHall/updateState',
        payload: {
          LadderLevelChange: true,
        },
      });
    }
  }, [dispatch, LadderLevelChange]);
  /**
   * 打开阶梯报价模态框
   */
  const viewLadderLevelModal = useCallback(
    (record = {}) => {
      const {
        itemId,
        itemCode,
        itemName,
        rfxLineItemId,
        uomId,
        supplierCompanyName,
        secondaryUomId,
      } = record.get([
        'itemId',
        'itemCode',
        'itemName',
        'rfxLineItemId',
        'uomId',
        'supplierCompanyName',
        'secondaryUomId',
      ]);
      if (doubleUnitFlag && itemId) {
        if (!uomId || !secondaryUomId) {
          notification.warning({
            message: intl.get(`ssrc.common.model.inquiryHall.chooseUnit`).d('请先填写单位！'),
          });
          return;
        }
      }
      setViewLadderLevelVisible(true);
      setItemChooseContent(record);
      setLadderLevelHeaderData({
        itemId,
        itemCode,
        itemName,
        rfxLineItemId,
        uomId,
        secondaryUomId,
        supplierCompanyName,
      });
      dispatch({
        type: 'inquiryHall/fetchLadderLevelyTable',
        payload: {
          rfxLineItemId,
          organizationId,
          customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.ITEMLINE_LADDER_LEVEL`,
        },
      });
    },
    [dispatch, organizationId, doubleUnitFlag, sourceKey]
  );

  /**
   * hideOperationRecord - 关闭阶梯报价弹窗
   */
  const hideLadderLevelModal = useCallback(() => {
    setViewLadderLevelVisible(false);
    dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        ladderLevelData: [],
      },
    });
  }, [dispatch]);

  const batchImportOk = withOverride.call(
    props,
    useCallback(
      function batchImportOk() {
        itemLineTableDS.query();
        const sourceMethod = rfxInfoDS?.current?.get('sourceMethod');
        // 寻源方式为邀请
        if (sourceMethod === 'INVITE') {
          supplierListTableDS.query();
        }
      },
      [itemLineTableDS]
    ),
    'batchImportOk'
  );

  const purchaseRequestOk = useCallback(async () => {
    const { selected } = purchaseRequestDS;
    const selectedRowKeys = [];
    const selectedRows = [];
    selected.map((item) => {
      selectedRowKeys.push(item.toData().prLineId);
      selectedRows.push(item.toData());
      return '';
    });
    if (selected && selected.length > 0) {
      const createParams = {
        organizationId,
        prLineIdList: selectedRowKeys,
        prLineList: selectedRows,
        sourceFrom: 'DEMAND_POOL',
        configCenterCode: 'SITE.SSRC.RFX_PURCHASE_MERGE_RULE',
        rfxHeaderId: rfxId,
        sourceDocumentType: sourceKey === 'BID' ? 'NEW_BID' : 'RFX',
      };
      const remoteCreateParams = itemRemote
        ? itemRemote?.process(
            'SSRC_INQUIRYHALLNEW_UPDATE_ITEMLINETABLE_CREATE_PR_PARAMS',
            createParams,
            {
              createParams,
              bidFlag,
            }
          )
        : createParams;
      // 调用引用申请接口
      const createPurchaseRequest = (payload = {}) => {
        return dispatch({
          type: 'inquiryHall/createPurchaseRequest',
          payload: {
            ...remoteCreateParams,
            ...(payload || {}),
          },
        });
      };

      // 请求接口之后的操作 ps: 为了不影响埋点的功能给封装到方法里面
      const handleAfterSuccessRequest = async (requestRes) => {
        // 标准埋点 采购申请之后执行一些操作
        if (itemRemote?.event) {
          const ras = await itemRemote.event.fireEvent('remoteHandleSomeOperateAfterPR', {
            bidFlag,
            that: this,
            saveRes: requestRes || {},
            itemLineTableDS,
            rfxHeaderId: rfxId,
            afterSaveItemLineUpdateHeader,
          });
          if (ras && ras === 'false') return false;
        }
        itemLineTableDS.query();
        supplierListTableDS.query();
      };
      const res = await createPurchaseRequest();

      if (res && !res.failed) {
        // 因为 res的结果已经经过了getResponse 处理，此处加此判断
        validatorConfirmModal({
          response: res,
          validatorType: 'highestValidatorType',
          validatorArrName: 'validateResults',
          showErrorType: 'notification',
          onOk: throttle(() => {
            try {
              return createPurchaseRequest({ confirmFlag: 1 }).then((confirmRes) => {
                if (getResponse(confirmRes)) {
                  handleAfterSuccessRequest(confirmRes);
                }
              });
            } catch (err) {
              throw err;
            }
          }, 1200),
          firstValidateSuccessCallback: async () => {
            try {
              await handleAfterSuccessRequest(res);
            } catch (err) {
              throw err;
            }
          },
        });
      }
    } else {
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.message.pleaseSelectAtleastOneData')
          .d('请至少选择一条数据'),
      });
      return false;
    }
  }, [
    dispatch,
    organizationId,
    purchaseRequestDS,
    rfxId,
    itemLineTableDS,
    supplierListTableDS,
    sourceKey,
    bidFlag,
    afterSaveItemLineUpdateHeader,
    itemRemote,
  ]);

  const purchaseRequestCancel = useCallback(() => {
    purchaseRequestDS.clearCachedSelected();
    purchaseRequestDS.loadData();
  }, [purchaseRequestDS]);

  /**
   * 批量导入
   */
  const handleBatchExport = useCallback(() => {
    if (!rfxId || rfxId === 'null') {
      return;
    }

    const Props = {
      historyButton: 'true',
      code: 'SSRC.RFX_QUOTATION.ITEM',
      organizationId,
      prefixPatch: SRM_SSRC,
      args: JSON.stringify({
        tenantId: organizationId,
        organizationId,
        rfxHeaderId: rfxId,
        templateId,
        templateCode: 'SSRC.RFX_QUOTATION.ITEM',
      }),
      autoRefreshInterval: 5000,
      backPath: undefined,
      tenantId: organizationId,
      action: 'hzero.common.title.batchImport',
      key: '/ssrc/inquiry-hall/rfx-update/comment-import/SSRC.RFX_QUOTATION.ITEM',
      auto: true,
    };

    const ImportProps = itemRemote
      ? itemRemote.process('SSRC_INQUIRYHALLNEW_UPDATE_ITEMLINETABLE_IMPORT_PROPS', Props, {
          pageProps: props,
          rfxHeaderId: rfxId,
          templateId,
        })
      : Props;

    const modalKey = Modal.key();

    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      bodyStyle: {
        maxHeight: 'calc(100vh - 2.5rem)',
      },
      title: intl.get(`ssrc.inquiryHall.view.message.tab.itemDetails`).d('物品明细'),
      children: <CommonImport {...ImportProps} />,
      style: { width: '80%' },
      onOk: batchImportOk,
    });
  }, [rfxId, organizationId, batchImportOk, templateId]);

  const purchaseRequest = useCallback(() => {
    if (!rfxId || rfxId === 'null') {
      return;
    }

    const modalKey = Modal.key();
    purchaseRequestDS.setState('doubleUnitFlag', doubleUnitFlag);
    purchaseRequestDS.clearCachedSelected();
    const Props = {
      organizationId,
      rfxId,
      dispatch,
      PurchaseRequestDS: purchaseRequestDS,
      customizeTable,
      sourceKey,
      doubleUnitFlag,
    };
    Modal.open({
      destroyOnClose: true,
      key: modalKey,
      drawer: true,
      title: intl.get('sodr.workspace.view.tabPane.purchaseRequest').d('引用采购申请'),
      children: <PurchaseRequestContent {...Props} />,
      style: { width: '80%' },
      onOk: purchaseRequestOk,
      onClose: purchaseRequestCancel,
      onCancel: purchaseRequestCancel,
      footer: (okBtn, cancelBtn, modal) => {
        const standandBtns = [okBtn, cancelBtn];
        return itemRemote
          ? itemRemote.process(
              'SSRC_INQUIRYHALLNEW_UPDATE_ITEMLINETABLE_APPLY_TO_INQUIRY_FOOTER',
              standandBtns,
              {
                standandBtns,
                okBtn,
                cancelBtn,
                modal,
                bidFlag,
                purchaseRequestOk,
                purchaseRequestDS,
              }
            )
          : standandBtns;
      },
    });
  }, [rfxId, organizationId, purchaseRequestOk, purchaseRequestDS, sourceKey, doubleUnitFlag]);

  // 批量维护cancel
  const cancelBatchMaintain = useCallback(async () => {
    batchMaintainItemDS.loadData();
  }, [batchMaintainItemDS]);

  // 批量操作ok
  const batchMaintain = useCallback(() => {
    // const NewData = batchMaintainItemDS?.current?.toData() || {};
    let SelectedItems = itemLineTableDS.selected;
    let allEditFlag = 0;
    if (isEmpty(SelectedItems)) {
      SelectedItems = itemLineTableDS;
      allEditFlag = 1;
    }
    const _currentData = handleFormDSFieldsValue({
      ds: batchMaintainItemDS,
    });
    const currentData = itemRemote
      ? itemRemote.process(
          'SSRC_INQUIRYHALLNEW_UPDATE_ITEMLINETABLE_PROCESS_BATCH_MAINTAIN_CURRENT_DATA',
          _currentData,
          { batchMaintainItemDS }
        )
      : _currentData;
    getBatchMainItemData({ batchMaintainItemDS }); // 处理批量编辑数据
    const data = omit(batchMaintainItemDS?.current?.toData(), '__dirty');
    setBatchMainItems({
      // 存储值
      batchEditRfxLineItemData: data,
      batchEditRfxLineItemDTO: currentData,
      batchMaintainItemDS,
      allEditFlag,
    });
    batchUpdateLines({
      // 更新值
      batchEditRfxLineItemDTO: currentData,
      itemLineDS: itemLineTableDS,
      batchMaintainItemDS,
      allEditFlag,
      rfxInfoDS,
    });
    cancelBatchMaintain();
    itemLineTableDS.unSelectAll();
    itemLineTableDS.clearCachedSelected();
  }, [itemLineTableDS, batchMaintainItemDS, cancelBatchMaintain]);

  // 批量维护物品行
  const handleBatchMaintain = useCallback(() => {
    batchSetQueryParameter();

    const {
      expandResultsFlag = 0,
      resultsExpandingDimensions = '',
      resultsExpandingHierarchy = '',
    } =
      rfxInfoDS?.current?.get([
        'expandResultsFlag', // 拓展寻源结果
        'resultsExpandingDimensions', // 拓展寻源结果维度
        'resultsExpandingHierarchy', // 拓展寻源结果层级
      ]) || {};
    // 显示 拓展寻源结果+寻源拓展维度为【整单】
    const expandCompanyVisible =
      [1, '1'].includes(expandResultsFlag) && resultsExpandingDimensions === 'ITEM_LINE';
    // 显示 拓展寻源结果+寻源拓展维度为【整单】+ 寻源拓展层级为【库存组织】
    const expandInvOrganizationVisible =
      [1, '1'].includes(expandResultsFlag) &&
      resultsExpandingDimensions === 'ITEM_LINE' &&
      resultsExpandingHierarchy === 'INV_ORGANIZATION';
    const Props = {
      rfx,
      custLoading,
      customizeForm,
      clearProperties,
      expandCompanyVisible,
      expandInvOrganizationVisible,
      BatchMaintainItemDS: batchMaintainItemDS,
      tableDs: itemLineTableDS,
      remote: itemRemote,
    };

    // const modalKey = Modal.key();

    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: 'batchEditItemLine',
      drawer: true,
      title: intl.get('ssrc.inquiryHall.model.inquiryHall.batchMaintenance').d('批量维护'),
      children: <BatchMaintainItemForm {...Props} />,
      style: { width: '380px' },
      onOk: batchMaintain,
      onCancel: cancelBatchMaintain,
    });
  }, [
    custLoading,
    customizeForm,
    itemLineTableDS,
    clearProperties,
    batchMaintainItemDS,
    rfxInfoDS,
    header,
    batchMaintain,
    cancelBatchMaintain,
  ]);

  // 采购申请行跳转
  const linktoPrNumDetail = useCallback(
    (record = {}, prHeaderId = '') => {
      const { sprmOldUiConfig = false } = configSheet;
      const prSourcePlatform = record.get('prSourcePlatform') || null;
      const isErp = prSourcePlatform && prSourcePlatform.toLowerCase() === 'erp';
      let pathUrl = null;
      if (!sprmOldUiConfig) {
        // 记录一个标识, 实现跳转的采购申请工作台明细后,点击返回按钮，返回采购申请工作台主页面的【整单-全部】页签
        // 需要去采购申请工作台去适配此方案
        // NOTE window.ssrc.directionToPurchasePlatform = 'inquiryHallNewUpdate,inquiryHallNewDetail';
        window.ssrcDirectionToPurchasePlatformSymbol = 'inquiryHallNewUpdate';

        // 采购申请工作台
        pathUrl = isErp
          ? `/sprm/purchase-platform/erp-detail/${prHeaderId}`
          : `/sprm/purchase-platform/noerp-detail/${prHeaderId}`;
      } else {
        pathUrl = isErp
          ? `/sprm/purchase-requisition-inquiry/erp-detail/${prHeaderId}`
          : `/sprm/purchase-requisition-inquiry/not-erp-detail/${prHeaderId}`;
      }

      dispatch(
        routerRedux.push({
          pathname: pathUrl,
        })
      );
    },
    [dispatch, configSheet]
  );

  let newBatchCreateItemDS = null;

  /**
   * 点击确定
   * @protected 此方法被【绝味】二开调用，请勿修改此方法名，谨慎修改内容
   */
  const handleOkBatchCreate = withOverride.call(
    props,
    useCallback(
      async function handleOkBatchCreate(newBatchCreateItemLineDS = {}) {
        if (isEmpty(newBatchCreateItemLineDS)) {
          return;
        }

        const validateFlag = await newBatchCreateItemLineDS?.validate();
        updateBatchCreateItemDS(newBatchCreateItemLineDS);
        if (validateFlag) {
          // 提交数据
          const result = getResponse(await newBatchCreateItemLineDS?.submit());
          if (result) {
            itemLineTableDS.query();
            newBatchCreateItemLineDS.reset();
            const sourceMethod = rfxInfoDS?.current?.get('sourceMethod');
            // 寻源方式为邀请
            if (sourceMethod === 'INVITE') {
              supplierListTableDS.query();
            }
            return true;
          }
          return false;
        }
        return false;
      },
      [batchCreateItemDS, itemLineTableDS, newBatchCreateItemDS]
    ),
    'handleOkBatchCreate'
  );

  const allowChangeItemsFlag = useComputed(() => {
    const { current } = rfxInfoDS;
    if (current) {
      return current.get('allowChangeItemsFlag') === 0 && current.get('sourceFrom') === 'PROJECT';
    }
    return true;
  }, [rfxInfoDS]);

  // 重新构造一个批量创建ds
  const reFactorBatchCreateDS = useCallback(
    action(() => {
      const headerData = rfxInfoDS?.current?.toData() || {};
      const { companyId } = headerData;
      newBatchCreateItemDS = new DataSet(
        itemRemote
          ? itemRemote.process(
              'SSRC_INQUIRYHALLNEW_UPDATE_ITEMLINETABLE_PROCESS_BATCH_CREATE_ITEM_DS',
              BatchCreateItemDS({ rfxInfoDS }),
              {
                bidFlag,
                rfxInfoDS,
              }
            )
          : BatchCreateItemDS({ rfxInfoDS })
      );

      newBatchCreateItemDS.setQueryParameter('commonProps', {
        customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.BATCH_CREATE_FORM`,
        ...headerData,
      });

      newBatchCreateItemDS.setQueryParameter('headers', headerData);
      newBatchCreateItemDS.setQueryParameter('company', {
        companyId,
      });

      return newBatchCreateItemDS;
    }),
    [sourceKey, rfxInfoDS, rfxInfoDS.current, newBatchCreateItemDS, bidFlag]
  );

  /**
   * 批量创建
   * @protected 此方法被【绝味】二开，请勿修改此方法名
   */
  const handleBatchCreate = withOverride.call(
    props,
    useCallback(async () => {
      const currentDS = reFactorBatchCreateDS();

      const record = rfxInfoDS.current;
      const taxIncludedFlag = record.get('templateTaxIncludedFlag') || 0;
      const taxId = record.get('templateTaxId');
      const freightIncludedFlag = record.get('templateFreightIncludedFlag');
      const taxRate = record.get('templateTaxRate');
      const batchCreateItemDSRecord = currentDS?.current || newBatchCreateItemDS?.current;
      const newDataSet = currentDS || newBatchCreateItemDS;

      if (!batchCreateItemDSRecord || !batchCreateItemDSRecord.set) {
        return;
      }

      // 老模板(此套逻辑) 新模板(不走赋值逻辑，个性化默认值生效)
      if (!isNewTemplateConfigFlag) {
        batchCreateItemDSRecord.set('taxIncludedFlag', taxIncludedFlag);
        if (taxId) {
          batchCreateItemDSRecord.set('taxId', taxId);
        }
        if (taxRate) {
          batchCreateItemDSRecord.set('taxRate', taxRate);
        }
        if (freightIncludedFlag) {
          batchCreateItemDSRecord.set('freightIncludedFlag', freightIncludedFlag);
        }
        // 税率值集视图配置的显示字段
        const taxTextField = batchCreateItemDSRecord.getField('taxIdLov')?.get('textField');
        if (taxTextField && !['taxId', 'taxRate'].includes(taxTextField)) {
          const taxIdMeaning = record.get('taxIdMeaning');
          batchCreateItemDSRecord.set(taxTextField, taxIdMeaning);
        }
      }

      const modalProps = {
        rfx,
        custLoading,
        customizeForm,
        dataSet: newDataSet,
        doubleUnitFlag,
        remote: itemRemote,
      };
      Modal.open({
        key: Modal.key(),
        closable: true,
        drawer: true,
        destroyOnClose: true,
        title: intl.get(`ssrc.inquiryHall.view.message.title.batchCreate`).d('批量创建'),
        style: { width: '380px' },
        children: <BatchCreateItemForm {...modalProps} />,
        onOk: () => handleOkBatchCreate(newDataSet),
        // onCancel: () => batchCreateItemDS.reset(),
        onClose: () => {
          newDataSet.reset();
        },
        // onClose: () => batchCreateItemDS.reset(),
      });
    }, [
      batchCreateItemDS,
      handleOkBatchCreate,
      rfxInfoDS,
      doubleUnitFlag,
      reFactorBatchCreateDS,
      newBatchCreateItemDS,
      newBatchCreateItemDS?.current,
      isNewTemplateConfigFlag,
    ]),
    'handleBatchCreate'
  );

  // 适用范围
  const viewItemLineApplicationOrgModal = (record) => {
    const { rfxLineItemId, applicationScopeFlag = 0 } = record?.get([
      'rfxLineItemId',
      'applicationScopeFlag',
    ]);
    viewApplicationOrgModal({
      sourceLineItemId: rfxLineItemId,
      applicationScopeFlag,
    });
  };

  // 适用范围勾选
  // const changeApplicationScopeFlag = useCallback((checked = 0, record) => {
  //   record.set('applicationScopeFlag', checked ? 1 : 0);
  // });

  // 价格批量变更
  const batchPriceChange = useCallback(
    (e = null, record) => {
      const currentValue = e?.target?.value;
      const currentBatchPrice =
        currentValue === 0 || Number(currentValue) === 0 ? null : currentValue;
      record.set('batchPrice', currentBatchPrice);
    },
    [rfxInfoDS, rfxId, itemLineTableDS]
  );

  // 切换业务实体lov
  const changeOuIdLov = (value = {}, record) => {
    const currentValue = value;
    isClearMaterial({ isInvOrgId: false, record, rfxInfoDS, value: currentValue });
    updateOuIdFiled({ currentValue, record });
    if (itemRemote?.event) {
      itemRemote.event.fireEvent('remoteHandleOuIdChangeEvent', {
        record,
        currentValue,
        bidFlag,
      });
    }
  };

  // 切换库存组织lov
  const changeInvOrganizationIdLov = (value = {}, record) => {
    const currentValue = value ?? {};
    isClearMaterial({ isInvOrgId: true, record, rfxInfoDS, value: currentValue });
    updateInvOrganizationFiled({ currentValue: currentValue || {}, record });
  };

  // 切换物料编码lov
  const changeItemIdLov = (value = {}, record) => {
    const currentValue = value ?? {};

    let newData = {
      itemId: currentValue.partnerItemId,
      itemCode: currentValue.itemCode,
      itemName: currentValue.itemName,
      biUomId: currentValue.biUomId,
      biUomName: currentValue.biUomName,
      uomConversionRate: currentValue.uomConversionRate,
      drawingNum: currentValue.drawingNum,
      drawingVersionNumber: currentValue.drawingVersionNumber,
      commonName: currentValue.commonName,
      referencePrice: currentValue.referencePrice,
      specs: currentValue.specifications,
      supplierItemNumDesc: currentValue.supplierItemNumDesc,
      itemCategoryId: currentValue.categoryId,
      itemCategoryName: currentValue.categoryName,
      model: currentValue.model,
    };
    newData = itemRemote
      ? itemRemote.process(
          'SSRC_INQUIRYHALLNEW_UPDATE_ITEMLINETABLE_PROCESS_ITEM_LOV_CHANGE_DATA',
          newData,
          {
            record,
            currentValue,
            pageProps: props,
          }
        )
      : newData;
    newData = newData || {};

    record.set(newData);
    if (itemRemote?.event) {
      itemRemote.event.fireEvent('remoteHandleSetRecordValue', {
        record,
        value,
        pageProps: props,
      });
    }
    if (isEmpty(currentValue)) {
      record.set({
        secondaryUomId: null,
        secondaryUomName: null,
        uomId: null,
        uomName: null,
        uomIdLov: null,
        secondaryUomIdLov: null,
      });
      return;
    }

    const { itemId, secondaryQuantity } = record.get(['itemId', 'secondaryQuantity']) || {};
    if (!isEmpty(currentValue)) {
      if (doubleUnitFlag && itemId) {
        // 物料lov和单位lov任意一个变动都重新计算基本数量
        record.set({
          secondaryUomId: currentValue.secondaryUomId || currentValue.uomId,
          secondaryUomName: currentValue.secondaryUomName || currentValue.uomName,
          uomId: currentValue.uomId,
          uomName: currentValue.uomName,
        });
        calculateQtyAfterItemOrSecUomChange({ record });
      } else {
        // 开启双单位没有物料 直接将数量给到基本数量
        if (doubleUnitFlag && !itemId) {
          record.set('rfxQuantity', secondaryQuantity);
        }
        // 没有物料直接选择单位lov赋值给基本单位
        // 有物料但是未开启双单位，基本单位跟着单位走
        record.set({
          secondaryUomId: currentValue.orderUomId || currentValue.primaryUomId,
          secondaryUomName: currentValue.orderUomName || currentValue.uomName,
          uomId: currentValue.orderUomId || currentValue.primaryUomId,
          uomName: currentValue.orderUomName || currentValue.uomName,
        });
      }
    }

    if (itemRemote?.event) {
      itemRemote.event.fireEvent('remoteHandleSetRecordValueChangeItemId', {
        record,
        value,
        pageProps: props,
      });
    }
  };

  // 改变辅助单位lov
  const changeSecondaryUomIdLov = (value = {}, record) => {
    const currentValue = value ?? {};
    const { itemId, secondaryQuantity } = record.get(['itemId', 'secondaryQuantity']) || {};
    if (doubleUnitFlag && itemId) {
      // 物料lov和单位lov任意一个变动都重新计算基本数量
      if (currentValue) {
        record.set('secondaryUomId', currentValue.uomId || null);
        record.set('secondaryUomName', currentValue.uomCodeAndName || currentValue.uomName || null);
      }
      calculateQtyAfterItemOrSecUomChange({ record });
    } else {
      // 开启双单位没有物料 直接将数量给到基本数量
      if (doubleUnitFlag && !itemId) {
        record.set('rfxQuantity', secondaryQuantity);
      }
      // 没有物料直接选择单位lov赋值给基本单位
      // 有物料但是未开启双单位，基本单位跟着单位走
      record.set({
        secondaryUomId: currentValue.uomId || null,
        secondaryUomName: currentValue.uomCodeAndName || null,
        uomId: currentValue.uomId || null,
        uomName: currentValue.uomCodeAndName || null,
      });
    }
  };

  // 物料lov和单位lov任意一个变动都重新计算基本数量
  const calculateQtyAfterItemOrSecUomChange = ({ record }) => {
    const { secondaryUomId, uomId, secondaryQuantity, rfxLineItemId, itemId } = record.get([
      'secondaryUomId',
      'uomId',
      'secondaryQuantity',
      'rfxLineItemId',
      'itemId',
    ]);
    if (secondaryUomId !== uomId) {
      record.set('batchPrice', 1);
    }
    if (secondaryQuantity && secondaryUomId) {
      calculateBasicQty({
        secondaryQuantity,
        itemId,
        businessKey: rfxLineItemId || record.id,
        doublePrimaryUomId: uomId,
        secondaryUomId,
      }).then((res) => {
        record.set('rfxQuantity', res ?? '');
      });
    } else if (secondaryQuantity === 0) {
      record.set('rfxQuantity', secondaryQuantity);
    }
  };

  // 改变拓展公司
  const changeExpandCompany = (value = [], oldValue = [], record) => {
    // 清除对应公司下的库存组织
    if (!record) return;
    const deleteFlag = value?.length < oldValue?.length || value === null;
    if (!deleteFlag) return;
    updateExpandInvOrganizationFiled({ value, oldValue, record, sourceResultsData });
  };

  // 单据来源=申请转询价支持拆分
  const splitLine = (record) => {
    // const item = record.toJSONData();
    const data =
      record.get([
        'itemIdLov',
        'itemName',
        'ouIdLov',
        'invOrganizationIdLov',
        'prNum',
        'prData',
        'prHeaderId',
        'prLineNum',
        'prLineId',
        'prDisplayLineNum',
        'attachmentUuid',
        'ladderInquiryFlag',
        // 'quotationTemplateIdLov',
        'specs',
        'model',
        'itemCategoryIdLov',
        'rfxQuantity',
        'secondaryQuantity',
        'uomIdLov',
        'secondaryUomIdLov',
        'estimatedPrice',
        'netEstimatedPrice',
        'batchPrice',
        'taxIncludedFlag',
        'taxIdLov',
        'demandDate',
        'projectTaskId',
        'startingBiddingPrice',
        'safePrice',
        'floatType',
        'quotationRange',
        'expandInvOrganization',
        'freightIncludedFlag',
        'prTaxBudgetUnitPrice', // 采购申请预算含税单价
      ]) || {};
    const newRecord = itemLineTableDS.create({});
    newRecord.init({
      ...data,
      expandInvOrganization: !isEmpty(data.expandInvOrganization)
        ? data.expandInvOrganization
        : null,
    });
    newRecord.setState('isSplitFlag', true);
  };

  // table columns
  const columns = useComputed(() => {
    const {
      biddingMode,
      // quotationOrderType,
      biddingTarget,
      // quotationType,
      // openerFlag,
      // sealedQuotationFlag,
      expandResultsFlag = 0,
      resultsExpandingDimensions = '',
      resultsExpandingHierarchy = '',
      isBritishBidTrafficLight,
      biddingTrialBiddingFlag,
    } =
      rfxInfoDS?.current?.get([
        'biddingMode', // 竞价模式
        'quotationOrderType', // 竞价大厅使用的 报价次序
        'biddingTarget', // 竞价对象
        'quotationType',
        'openerFlag',
        'sealedQuotationFlag',
        'expandResultsFlag', // 拓展寻源结果
        'resultsExpandingDimensions', // 拓展寻源结果维度
        'resultsExpandingHierarchy', // 拓展寻源结果层级
        'isBritishBidTrafficLight',
        'biddingTrialBiddingFlag',
      ]) || {};

    // 竞价大厅
    // sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1') 为竞价大厅
    const newBiddingFlag = isNewBiddingFlag();

    // 起竞价显示标识 【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【单价竞价】，任一不满足时隐藏
    const startingBiddingPriceFlag =
      newBiddingFlag && biddingMode === 'BRITISH_BIDDING' && biddingTarget === 'UNIT_PRICE';

    // 显示 拓展寻源结果+寻源拓展维度为【整单】
    const expandCompanyVisible =
      [1, '1'].includes(expandResultsFlag) && resultsExpandingDimensions === 'ITEM_LINE';
    // 显示 拓展寻源结果+寻源拓展维度为【整单】+ 寻源拓展层级为【库存组织】
    const expandInvOrganizationVisible =
      [1, '1'].includes(expandResultsFlag) &&
      resultsExpandingDimensions === 'ITEM_LINE' &&
      resultsExpandingHierarchy === 'INV_ORGANIZATION';

    // 单价竞价-启用红绿灯
    const unitPriceTrafficLight = startingBiddingPriceFlag && isBritishBidTrafficLight;

    // 单价竞价 - 试竞价 - 启用红绿灯
    const trialUnitPriceTrafficLight = unitPriceTrafficLight && biddingTrialBiddingFlag;

    const column = [
      {
        name: 'split',
        width: 70,
        hidden: sourceFrom !== 'DEMAND_POOL',
        renderer: ({ record }) => {
          const prData = record.get('prData');
          // 不可编辑： 非【原行】|| 【单据来源】 ≠【申请】|| 不存在prLineId || 【并单】
          const flag =
            !record.get('rfxLineItemNum') ||
            sourceFrom !== 'DEMAND_POOL' ||
            !record.get('prLineId') ||
            !isEmpty(prData);
          return (
            <a disabled={flag} onClick={() => splitLine(record)}>
              {intl.get(`ssrc.common.view.button.split`).d('拆分')}
            </a>
          );
        },
      },
      {
        name: 'rfxLineItemNum',
        width: 80,
        align: 'left',
      },
      {
        name: 'ouIdLov',
        width: 150,
        // editor: true,
        editor: (record) => {
          return (
            <Lov
              editor
              dataSet={itemLineTableDS}
              name="ouIdLov"
              onChange={(value) => changeOuIdLov(value, record)}
            />
          );
        },
      },
      {
        // editor: true,
        name: 'invOrganizationIdLov',
        width: 150,
        hidden: expandInvOrganizationVisible, // 隐藏 拓展寻源结果+寻源拓展维度为【整单】+ 寻源拓展层级为【库存组织】
        editor: (record) => {
          return (
            <Lov
              editor
              dataSet={itemLineTableDS}
              name="invOrganizationIdLov"
              onChange={(value) => changeInvOrganizationIdLov(value, record)}
            />
          );
        },
      },
      /**
       * 此列二开，禁止修改参数名
       */
      {
        // editor: true,
        name: 'itemIdLov',
        width: 150,
        editor: (record) => {
          return (
            <Lov
              editor
              dataSet={itemLineTableDS}
              name="itemIdLov"
              onChange={(value) => changeItemIdLov(value, record)}
            />
          );
        },
      },
      /**
       * 此列二开，禁止修改参数名
       */
      {
        name: 'itemName',
        editor: true,
        width: 150,
      },
      {
        name: 'specs',
        editor: true,
        width: 150,
      },
      {
        name: 'itemCategoryIdLov',
        editor: (record) => {
          const lovCode = itemLineTableDS.getField('itemCategoryIdLov')?.get('lovCode');
          let otherProps = {
            virtual: true,
            style: {
              maxHeight: '500px',
            },
          };
          if (lovCode === 'SSRC.ITEM_TREE_CATEGORY') {
            otherProps = {
              treeLoadData: ({ record: lovRecord, dataSet }) => {
                const { categoryId } = lovRecord.get(['hasChild', 'categoryId']);
                const {
                  performance: { url },
                  pageSize,
                  currentPage,
                } = dataSet;
                return new Promise((resolve) => {
                  request(url, {
                    method: 'GET',
                    query: {
                      companyId: rfxInfoDS?.current?.get('companyId'),
                      parentCategoryId: categoryId,
                      page: currentPage - 1,
                      size: pageSize,
                    },
                  })
                    .then((res) => {
                      const result = getResponse(res);
                      if (result && result?.content.length) {
                        dataSet.appendData(result.content, lovRecord);
                      }
                      resolve();
                    })
                    .catch(() => {
                      resolve();
                    });
                });
              },
            };
          } else if (lovCode === 'SMDM.TREE_ITEM_CATEGORY_TILED_NEW') {
            otherProps = {
              onRow: (row) => {
                const handleSelect = ({ dataSet, record: _record }) => {
                  if (dataSet && _record) {
                    dataSet.select(_record);
                  }
                };
                return {
                  onClick: () => handleSelect(row),
                  onDoubleClick: () => {
                    if (row?.record?.selectable) {
                      handleSelect(row);
                      record.set({
                        itemCategoryIdLov: row?.record?.toData(),
                      });
                      Modal.destroyAll();
                    }
                  },
                };
              },
            };
          }
          return (
            <Lov
              editor
              dataSet={itemLineTableDS}
              name="itemCategoryIdLov"
              tableProps={{
                selectionMode: [
                  'SMDM.TREE_ITEM_CATEGORY_TILED_NEW',
                  'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
                ].includes(lovCode)
                  ? 'rowbox'
                  : '',
                ...otherProps,
              }}
            />
          );
        },
        width: 150,
      },
      doubleUnitFlag
        ? {
            name: 'secondaryQuantity',
            width: 120,
            align: 'left',
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="secondaryQuantity"
                  record={record}
                  // dataSet={itemLineTableDS}
                  uom="secondaryUomId"
                  onChange={(val) => changeRfxQuantity(val, record, 'secondaryQuantity')}
                />
              );
            },
            renderer: ({ record, value }) =>
              numberSeparatorRender(value, record.getState('uom_precision')),
          }
        : null,
      doubleUnitFlag
        ? {
            // editor: true,
            name: 'secondaryUomIdLov',
            width: 150,
            ignore: 'always',
            editor: (record) => {
              return (
                <Lov
                  editor
                  dataSet={itemLineTableDS}
                  name="secondaryUomIdLov"
                  onChange={(value) => changeSecondaryUomIdLov(value, record)}
                />
              );
            },
          }
        : null,
      {
        name: 'rfxQuantity',
        editor: (record) => {
          return <C7nPrecisionInputNumber name="rfxQuantity" record={record} uom="uomId" />;
        },
        renderer: ({ record, value }) =>
          doubleUnitFlag && record.get('itemId')
            ? numberSeparatorRender(value)
            : numberSeparatorRender(value, record.getState('uom_precision')),
      },
      {
        editor: true,
        name: 'uomIdLov',
        width: 150,
      },
      priceTypeCode === 'TAX_INCLUDED_PRICE'
        ? {
            name: 'estimatedPrice',
            width: 150,
            align: 'right',
            header: (
              <TooltipTitle
                tipValue={intl
                  .get(`ssrc.common.model.offlineEntry.secondaryEstimatedPrice`)
                  .d('辅助单位对应的预估单价(含税)')}
                title={intl
                  .get(`ssrc.inquiryHall.model.offlineEntry.estimatedPrice`)
                  .d('预估单价(含税)')}
                doubleUnitFlag={doubleUnitFlag}
              />
            ),
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="estimatedPrice"
                  record={record}
                  currency="currencyCode"
                  // onChange={(val) => changeRfxQuantity(val, record, 'estimatedPrice')}
                />
              );
            },
            renderer: ({ record, value }) =>
              numberSeparatorRender(value, record.getState('currency_precision')),
          }
        : {
            name: 'netEstimatedPrice',
            width: 150,
            align: 'right',
            header: (
              <TooltipTitle
                tipValue={intl
                  .get(`ssrc.common.model.offlineEntry.secondaryEetEstimatedPrice`)
                  .d('辅助单位对应的预估单价(不含税)')}
                title={intl
                  .get(`ssrc.inquiryHall.model.offlineEntry.netEstimatedPrice`)
                  .d('预估单价(不含税)')}
                doubleUnitFlag={doubleUnitFlag}
              />
            ),
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="netEstimatedPrice"
                  record={record}
                  currency="currencyCode"
                  // onChange={(val) => changeRfxQuantity(val, record, 'netEstimatedPrice')}
                />
              );
            },
            renderer: ({ record, value }) =>
              numberSeparatorRender(value, record.getState('currency_precision')),
          },
      priceTypeCode === 'TAX_INCLUDED_PRICE'
        ? {
            name: 'estimatedAmount',
            width: 150,
            align: 'right',
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : {
            name: 'netEstimatedAmount',
            width: 150,
            align: 'right',
            renderer: ({ value }) => numberSeparatorRender(value),
          },
      {
        name: 'batchPrice',
        width: 150,
        align: 'right',
        editor: (record = {}) => {
          return (
            <C7nPrecisionInputNumber
              type="c7n-pro"
              name="batchPrice"
              record={record}
              currency="currencyCode"
              onBlur={(e) => batchPriceChange(e, record)}
            />
          );
        },
        renderer: ({ record, value }) => {
          if (isNil(value) || value === 0 || value === '0') {
            return intl.get('ssrc.common.pleaseEnterGreatThanZeroNumber').d('请输入大于0的数值');
          }
          return numberSeparatorRender(value, record.getState('currency_precision'), {
            omitZeroFlag: true, // 不补零标识
          });
        },
      },
      {
        // editor: true,
        name: 'taxIncludedFlag',
        width: 100,
        align: 'left',
        editor: (record) => (
          <CheckBox
            onChange={(value) => {
              if (!value) {
                record.set('taxId', null);
                record.set('taxRate', null);
              }
            }}
          />
        ),
      },
      {
        editor: (record) => {
          return (
            <Lov
              record={record}
              name="taxIdLov"
              paramMatcher={({ text }) => {
                return !isNaN(text) ? { taxRate: text } : { taxCode: text };
              }}
            />
          );
        },
        width: 150,
        name: 'taxIdLov',
        align: 'right',
      },
      {
        editor: true,
        width: 150,
        name: 'demandDate',
      },
      startingBiddingPriceFlag && isBritishBidTrafficLight !== 1
        ? {
            // 【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【单价竞价】，任一不满足时隐藏
            // 红绿灯模式 不显示
            width: 150,
            name: 'startingBiddingPrice',
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="startingBiddingPrice"
                  record={record}
                  currency="currencyCode"
                  headerRecord={rfxInfoDS?.current}
                  omitZeroFlag
                />
              );
            },
            renderer: ({ record, value }) =>
              numberSeparatorRender(value, record.getState('currency_precision'), {
                omitZeroFlag: true,
              }),
          }
        : null,
      startingBiddingPriceFlag
        ? {
            name: 'biddingQuotationRange',
            width: 240,
            minWidth: 240,
            className: 'inquiry-update-itemLine-biddingQuotationRange',
            tooltip: 'none',
            renderer: ({ record }) => {
              return (
                <QuotationRange
                  name="biddingQuotationRange"
                  record={record}
                  rfxInfoDS={rfxInfoDS}
                  type="unitPrice"
                />
              );
            },
          }
        : null,
      startingBiddingPriceFlag
        ? {
            // 【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【单价竞价】，任一不满足时隐藏
            name: 'safePrice',
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="safePrice"
                  record={record}
                  currency="currencyCode"
                  headerRecord={rfxInfoDS?.current}
                  omitZeroFlag
                />
              );
            },
            renderer: ({ record, value }) =>
              numberSeparatorRender(value, record.getState('currency_precision'), {
                omitZeroFlag: true,
              }),
          }
        : null,
      !newBiddingFlag
        ? {
            editor: true,
            width: 120,
            name: 'ladderInquiryFlag',
            align: 'left',
          }
        : null,
      !newBiddingFlag
        ? {
            name: 'ladderOffer',
            width: 100,
            renderer: ({ record, name, dataSet }) => {
              return record.get('ladderInquiryFlag') && record.get('rfxLineItemId') ? (
                <a
                  onClick={() => viewLadderLevelModal(record)}
                  disabled={dataSet.getField(name).get('disabled')}
                >
                  {intl.get(`ssrc.inquiryHall.view.message.button.ladderLevel`).d('阶梯报价')}
                </a>
              ) : null;
            },
          }
        : null,
      !newBiddingFlag
        ? {
            editor: true,
            width: 150,
            name: 'quotationTemplateIdLov',
          }
        : null,
      !newBiddingFlag
        ? {
            name: 'quotationDetail',
            width: 100,
            renderer: ({ record }) =>
              (record.get('itemCategoryId') ||
                record.get('itemId') ||
                record.get('quotationTemplateId')) &&
              rfxId &&
              rfxId !== 'null' &&
              record.get('rfxLineItemId') ? (
                <>
                  <QuotationDetailModal
                    rowData={record}
                    uiType="c7n"
                    sourceFrom="RFX"
                    operationType={operationType}
                    onOk={saveForceItemLine}
                    buttonText={intl.get('hzero.common.button.edit').d('编辑')}
                    headerData={rfxInfoDS}
                    bidFlag={bidFlag}
                    totalSaveNoNotification={1}
                    tableDs={itemLineTableDS}
                  />
                  {record.get('quotationDetailRequire') === 1 && (
                    <Badge style={{ marginLeft: '2px' }} status="error" />
                  )}
                </>
              ) : null,
          }
        : null,
      !newBiddingFlag
        ? {
            name: 'floatType',
            width: 140,
            // editor: true,
            editor: (record) => (
              <Select
                name="floatType"
                onChange={(value) => {
                  record.set('floatType', value || null);
                  if (!value) {
                    record.set('quotationRange', null);
                  }
                }}
              />
            ),
          }
        : null,
      !newBiddingFlag
        ? {
            name: 'quotationRange',
            width: 140,
            editor: true,
          }
        : null,
      purchaseRequestFlag // 是否申请转询价
        ? {
            name: 'prNum',
            width: 150,
            renderer: ({ record, value }) => {
              const prData = record.get('prData');
              const prHeaderId = record.get('prHeaderId');
              if (prHeaderId) {
                if (prData) {
                  return JSON.parse(prData).map((prItem) => {
                    return (
                      <a onClick={() => linktoPrNumDetail(record, prItem.prHeaderId)}>
                        {`${prItem.displayPrNum}|${prItem.displayLineNum}`}{' '}
                      </a>
                    );
                  });
                } else {
                  return <a onClick={() => linktoPrNumDetail(record, prHeaderId)}>{value}</a>;
                }
              } else {
                return value;
              }
            },
          }
        : null,
      purchaseRequestFlag
        ? {
            name: 'prDisplayLineNum',
            width: 150,
          }
        : null,
      {
        name: 'projectTaskId',
        width: 150,
        editor: (record) => {
          const otherProps = {
            virtual: true,
            style: {
              maxHeight: '500px',
            },
          };
          return (
            <Lov
              editor
              record={record}
              name="projectTaskId"
              tableProps={{
                selectionMode: 'rowbox',
                ...otherProps,
              }}
            />
          );
        },
      },
      {
        name: 'attachmentUuid',
        width: 150,
        editor: true,
        renderer: ({ record }) => (
          <Attachment name="attachmentUuid" record={record} viewMode="popup" />
        ),
      },
      {
        name: 'applicationScopeFlag',
        width: 140,
        renderer: ({ value, record }) => {
          const { rfxLineItemId = null } = record?.get(['rfxLineItemId', 'applicationScopeFlag']);

          return (
            <a
              disabled={!value || isNewRfx || !rfxLineItemId}
              onClick={() => viewItemLineApplicationOrgModal(record)}
            >
              {intl.get(`hzero.common.view.button.edit`).d('编辑')}
            </a>
          );
        },
      },
      {
        name: 'expandCompany',
        width: 250,
        hidden: !expandCompanyVisible,
        editor: (record) => {
          return (
            <Lov
              record={record}
              name="expandCompany"
              onChange={(value, oldValue) => changeExpandCompany(value, oldValue, record)}
            />
          );
        },
      },
      {
        name: 'expandInvOrganization',
        width: 250,
        hidden: !expandInvOrganizationVisible,
        editor: true,
      },
      unitPriceTrafficLight
        ? {
            name: 'targetPriceLowerLimit',
            width: 180,
            align: 'right',
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="targetPriceLowerLimit"
                  record={record}
                  headerRecord={rfxInfoDS?.current}
                  currency="currencyCode"
                />
              );
            },
            renderer: ({ value }) => {
              return numberSeparatorRender(value);
            },
          }
        : null,
      unitPriceTrafficLight
        ? {
            name: 'targetPriceUpperLimit',
            width: 180,
            align: 'right',
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="targetPriceUpperLimit"
                  record={record}
                  headerRecord={rfxInfoDS?.current}
                  currency="currencyCode"
                />
              );
            },
            renderer: ({ value }) => {
              return numberSeparatorRender(value);
            },
          }
        : null,
      trialUnitPriceTrafficLight
        ? {
            name: 'trialTargetPriceLowerLimit',
            width: 180,
            align: 'right',
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="trialTargetPriceLowerLimit"
                  record={record}
                  headerRecord={rfxInfoDS?.current}
                  currency="currencyCode"
                />
              );
            },
            renderer: ({ value }) => {
              return numberSeparatorRender(value);
            },
          }
        : null,
      trialUnitPriceTrafficLight
        ? {
            name: 'trialTargetPriceUpperLimit',
            width: 180,
            align: 'right',
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="trialTargetPriceUpperLimit"
                  record={record}
                  headerRecord={rfxInfoDS?.current}
                  currency="currencyCode"
                />
              );
            },
            renderer: ({ value }) => {
              return numberSeparatorRender(value);
            },
          }
        : null,
    ].filter(Boolean);
    return itemRemote
      ? itemRemote.process(
          'SSRC_INQUIRYHALLNEW_UPDATE_ITEMLINETABLE_PROCESS_TABLE_COLUMNS',
          column,
          {
            bidFlag,
            rfxInfoDS,
            itemLineTableDS,
            linktoPrNumDetail,
            changeItemIdLov,
            rfxId,
          }
        )
      : column;
  }, [
    itemRemote,
    doubleUnitFlag,
    allowChangeItemsFlag,
    priceTypeCode,
    organizationId,
    rfxInfoDS,
    rfxId,
    itemLineTableDS,
    changeRfxQuantity,
    viewLadderLevelModal,
    linktoPrNumDetail,
    batchPriceChange,
    purchaseRequestFlag,
    isNewBiddingFlag,
    changeItemIdLov,
    bidFlag,
  ]);

  const IsNewInquiry = !rfxId || rfxId === 'null';

  const ladderLevelRowSelection = useMemo(
    () => ({
      selectedRowKeys: ladderLevelSelectedRowKeys,
      onChange: handleLadderLevelRowSelectChange,
    }),
    [ladderLevelSelectedRowKeys, handleLadderLevelRowSelectChange]
  );

  const ladderLevelModalProps = {
    remote: itemRemote,
    visible: viewLadderLevelVisible,
    hideModal: hideLadderLevelModal,
    ladderLevelData,
    doubleUnitFlag,
    saveLadderLevelLoading: modalLoading,
    onSaveLadderLine: saveLadderLevel,
    onCreateLadderLine: createLadderLine,
    onDeleteLadderLines: deleteLadderLevel,
    LadderLevelHeaderData: ladderLevelHeaderData,
    onChangeLadderTableData: changeLadderLevelTableData,
    ladderLevelRowSelection,
    ladderLevelSelectedRowKeys,
    record: itemChooseContent,
    sourceKey,
  };
  const templateCode = header?.importTemplateCode || 'SSRC.RFX_QUOTATION.ITEM';
  const otherImportProps = itemRemote
    ? itemRemote.process('SSRC_INQUIRYHALLNEW_UPDATE_ITEMLINETABLE_PROCESS_IMPORT_PROPS', {}, props)
    : {};
  // 导入
  const ImportProps = {
    businessObjectTemplateCode: templateCode,
    prefixPatch: SRM_SSRC,
    refreshButton: true,
    name: 'itemImportNew',
    buttonTooltip: IsNewInquiry
      ? intl.get('ssrc.common.view.message.save.tip').d('请先保存')
      : null,
    args: {
      tenantId: organizationId,
      organizationId,
      rfxHeaderId: rfxId,
      templateCode,
      templateId,
    },
    buttonProps: {
      funcType: 'flat',
      icon: 'archive',
      color: 'primary',
      disabled: IsNewInquiry || allowChangeItemsFlag || !applyToInquiryNewFlag,
      permissionList: [
        {
          code: `${match.path}.button.item-import`.toLowerCase(),
          type: 'button',
          meaning:
            intl.get(`ssrc.inquiryHall.view.message.title.RFXMaintenance`).d('编辑RFX') -
            `${intl.get(`ssrc.inquiryHall.view.message.button.itemImport`).d('物料导入')}(New)`,
        },
      ],
    },
    buttonText: intl.get(`ssrc.inquiryHall.view.message.button.itemImport`).d('物料导入'),
    autoRefreshInterval: 5000,
    tenantId: organizationId,
    action: 'hzero.common.title.batchImport',
    auto: true,
    successCallBack: batchImportOk,
    ...otherImportProps,
  };

  const EmptySelectedFlag = useComputed(
    () => !itemLineTableDS || isEmpty(itemLineTableDS.selected),
    [itemLineTableDS]
  );

  const EmptyItemLineTableDS = useComputed(
    () => !itemLineTableDS.length && !itemLineTableDS?.cachedRecords?.length,
    [itemLineTableDS]
  );

  /**
   * 何勇二开调用此方法, jinergy二开此方法
   *
   * 后续若加按钮，有用到动态变化的变量，传入params中
   */
  const getHeaderButtons = (params) => {
    const { IsNewInquiry: currentRFXIsNewInquiry } = params || {};
    const buttonCommonProps = {
      color: 'primary',
      funcType: 'flat',
    };

    const buttons = [
      <Button
        disabled={params.allowChangeItemsFlag || !params.applyToInquiryNewFlag}
        icon="playlist_add"
        onClick={createItemLine}
        name="create"
        {...buttonCommonProps}
      >
        {intl.get('hzero.common.button.increase').d('新增')}
      </Button>,
      <TooltipButtonPro
        icon="playlist_add"
        disabled={
          params.IsNewInquiry || params.allowChangeItemsFlag || !params.applyToInquiryNewFlag
        }
        onClick={handleBatchCreate}
        name="batchCreate"
        help={
          params.IsNewInquiry
            ? intl.get('ssrc.common.view.message.document.save.tip').d('请先保存单据')
            : ''
        }
        {...buttonCommonProps}
      >
        {intl.get(`ssrc.inquiryHall.view.message.button.batchCreate`).d('批量新建')}
      </TooltipButtonPro>,
      <TooltipButtonPro
        onClick={destroyItemLine}
        disabled={params.EmptyItemLineTableDS || params.EmptySelectedFlag}
        icon="delete_sweep"
        name="delete"
        help={intl.get('ssrc.common.view.message.item-line.select.tip').d('请先勾选物料行')}
        {...buttonCommonProps}
      >
        {intl.get('hzero.common.button.batchdelete').d('批量删除')}
      </TooltipButtonPro>,
      <TooltipButtonPro
        onClick={copyItemLine}
        disabled={
          params.allowChangeItemsFlag ||
          params.EmptyItemLineTableDS ||
          params.EmptySelectedFlag ||
          !params.applyToInquiryNewFlag
        }
        icon="content_copy"
        name="copy"
        help={intl.get('ssrc.common.view.message.item-line.select.tip').d('请先勾选物料行')}
        {...buttonCommonProps}
      >
        {intl.get('hzero.common.button.copy').d('复制')}
      </TooltipButtonPro>,
      <TooltipButtonPro
        icon="save"
        onClick={saveItemLine}
        disabled={params.EmptyItemLineTableDS || currentRFXIsNewInquiry}
        name="save"
        wait={500}
        waitType="debounce"
        help={
          currentRFXIsNewInquiry
            ? intl.get('ssrc.common.view.message.document.save.tip').d('请先保存单据')
            : intl.get('ssrc.common.view.message.item-line.add.tip').d('请先新增物料行')
        }
        {...buttonCommonProps}
      >
        {intl.get('hzero.common.button.save').d('保存')}
      </TooltipButtonPro>,
      <TooltipButtonPro
        disabled={
          // params.IsNewInquiry ||
          params.EmptyItemLineTableDS
        }
        onClick={handleBatchMaintain}
        icon="mode_edit"
        name="batchMaintain"
        help={intl.get('ssrc.common.view.message.item-line.add.tip').d('请先新增物料行')}
        {...buttonCommonProps}
      >
        <Tooltip
          title={
            params.EmptySelectedFlag
              ? intl
                  .get('ssrc.inquiryHall.model.inquiryHall.batchAllPageDataToEdit')
                  .d('针对全部数据进行批量编辑')
              : ''
          }
        >
          {params.EmptySelectedFlag
            ? intl.get('ssrc.inquiryHall.model.inquiryHall.batchMaintenance').d('批量维护')
            : intl.get('ssrc.inquiryHall.model.inquiryHall.batchCheckData').d('勾选批量编辑')}
        </Tooltip>
      </TooltipButtonPro>,
      <TooltipButtonPro
        disabled={
          params.IsNewInquiry || params.allowChangeItemsFlag || !params.applyToInquiryNewFlag
        }
        onClick={handleBatchExport}
        name="itemImport"
        help={
          params.IsNewInquiry ? intl.get('ssrc.common.view.message.save.tip').d('请先保存') : ''
        }
        {...buttonCommonProps}
      >
        <Icon
          type="archive"
          style={{ fontSize: '0.14rem', marginRight: '0.05rem', fontWeight: 400 }}
        />
        {intl.get(`ssrc.inquiryHall.view.message.button.itemImport`).d('物料导入')}
      </TooltipButtonPro>,
      itemRemote ? (
        itemRemote.render(
          'SSRC_INQUIRYHALLNEW_UPDATE_ITEMLINETABLE_PROCESS_TABLE_BUTTONS_IMPORT_NEW',
          <CommonImportNew {...ImportProps} />,
          props
        )
      ) : (
        <CommonImportNew {...ImportProps} />
      ),
      // 申请转询价
      sourceFrom === 'DEMAND_POOL' && (
        <Button
          disabled={params.IsNewInquiry}
          onClick={purchaseRequest}
          icon="root"
          name="purchaseRequest"
          {...buttonCommonProps}
        >
          {intl.get('sodr.workspace.view.tabPane.purchaseRequest').d('引用采购申请')}
        </Button>
      ),
      itemLineTableDS?.get?.(0)?.get?.('quotationTemplateFlag') === 1 && (
        <QuotationDetailImport
          sourceHeaderId={rfxId}
          templateCode="SSRC.PROJECT_QUO_DETAIL"
          sourceFrom="RFX"
          buttonProps={{
            ...buttonCommonProps,
          }}
          operationType={operationType}
          onOk={batchImportOk}
          onClose={batchImportOk}
          name="quotationDetailImport"
        />
      ),
    ].filter(Boolean);
    // otherProps 二开需要的参数-喜姐炸串
    const otherProps = {
      rfxId,
      itemLineTableDS,
      ...params,
      rfxInfoDS,
      buttonCommonProps,
      afterSaveItemLineUpdateHeader,
      batchImportOk,
      organizationId,
      togglePageLoading,
    };
    return itemRemote
      ? itemRemote.process(
          'SSRC_INQUIRYHALLNEW_UPDATE_ITEMLINETABLE_PROCESS_TABLE_BUTTONS',
          buttons,
          otherProps
        )
      : buttons;
  };

  /**
   * @protected 何勇二开, jinergy二开
   */
  const getOverrideHeaderButtons = withOverride.call(
    props,
    getHeaderButtons,
    'getOverrideHeaderButtons'
  );

  // 头部按钮所需参数，因hooks二开挂载变量有更新延迟问题，故采用此方式传入
  const buttonsParams = {
    IsNewInquiry,
    allowChangeItemsFlag,
    applyToInquiryNewFlag,
    EmptySelectedFlag,
    EmptyItemLineTableDS,
    bidFlag,
  };

  const tableProps = {
    bordered: true,
    custLoading,
    dataSet: itemLineTableDS,
    rowKey: 'rfxLineItemId',
    columns,
    style: { maxHeight: 520 },
  };

  const tableOptions = { code: `SSRC.${sourceKey}_HALL.NEW_EDIT.LINE_ITEM`, proxyDsCreate };

  const renderLadderLevelModal = (ladderProps) => {
    return !bidFlag ? (
      <LadderLevelModal {...ladderProps} />
    ) : (
      <LadderLevelModalBid {...ladderProps} />
    );
  };

  return (
    <ModalProvider>
      <div style={{ marginBottom: '4px' }}>
        {customizeBtnGroup(
          { code: `SSRC.${sourceKey}_HALL.NEW_EDIT.LINE_ITEM_BUTTONS` },
          getOverrideHeaderButtons(buttonsParams)
        )}
      </div>
      <div className={style['inquiry-update-itemLine']}>
        {itemRemote
          ? itemRemote.render(
              'SSRC_INQUIRYHALLNEW_UPDATE_ITEMLINETABLE_RENDER_TABLE',
              customizeTable(tableOptions, <Table {...tableProps} />),
              {
                tableOptions,
                tableProps,
                sourceKey,
                customizeTable,
              }
            )
          : customizeTable(
              tableOptions,
              <Table className="inquiry-update-itemLine" {...tableProps} />
            )}
      </div>
      {viewLadderLevelVisible && renderLadderLevelModal(ladderLevelModalProps)}
    </ModalProvider>
  );
});

const hocItemLineTable = (NewComponent) => {
  return remoteHoc(
    {
      code: 'SSRC_INQUIRYHALLNEW_UPDATE_ITEMLINETABLE',
      name: 'itemRemote', // 与外层remote区分
    },
    {
      events: {
        remoteHandleSomeOperateAfterPR() {},
        remoteHandleSetRecordValue() {},
        // 改变业务实体埋点事件
        remoteHandleOuIdChangeEvent() {},
        remoteCreateLadderLine({ handleLineCreate = noop }) {
          handleLineCreate();
        },
        remoteHandleLadder({ handleLadderOrigin = noop }) {
          handleLadderOrigin();
        },
        remoteHandleSetRecordValueChangeItemId() {}, // 改变物料后最后的二开埋点
        remoteBatchCreateItemLIneChangeItemIdAfter() {},
      },
    }
  )(
    connect(({ inquiryHall, bidHall, user }) => ({
      user,
      inquiryHall,
      bidHall,
    }))((props) => <NewComponent {...props} />)
  );
};

export default hocItemLineTable(ItemLineTable);
export { hocItemLineTable, ItemLineTable };
