/*
 * OrderWorkspace - 订单工作台
 * @date: 2021/05/01 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { DataSet, Dropdown, Menu, Modal, Form, TextArea, Tooltip, Table } from 'choerodon-ui/pro';
import { Icon, Popover, Tabs } from 'choerodon-ui';
import { compose, isEmpty, isNil, isEqual, throttle, isArray, isArrayLike } from 'lodash';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { stringify, parse } from 'querystring';
import classNames from 'classnames';
import { connect } from 'dva';
import moment from 'moment';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import CommonImport from 'hzero-front/lib/components/Import';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import IMChatDraggable from '_components/IMChatDraggable';
import { checkPermission } from 'services/api';
import remotes from 'utils/remote';
import { Button } from 'components/Permission';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import { onBeforeMenuTabRemove, deleteBeforeMenuTabRemove } from 'utils/menuTab';
import DocFlow from '_components/DocFlow';
import ApproveRecordSimple from '_components/ApproveRecordSimple';
import { openApproveModal } from '_components/ApproveModal';

import { PermissionDoubleTabs } from '@/routes/components/Permission';
import DynamicButtons from '_components/DynamicButtons';
import Bom from '@/routes/components/Bom';
import BigNumber from 'bignumber.js';
import ImportModal from '@/routes/components/ImportModal';
import remoteConfig from './remote';
import {
  handleBudgetVerification,
  queryCommonDoubleUomConfig,
  handleBatchSubmitWarn,
  openTermsModal,
  renderStatus,
  renderAiPreReview,
  // previewGift,
  getPaymentPlanConfig,
  rejectReasonModal,
  getDisplayDocAndDocFlow,
  revokeWorkFlow,
  associatedPcAndAmountCheck,
  handleOpenFundTermIdDetail,
} from '@/routes/components/utils';
import { StatusTag } from '@/routes/components/StatusTag';
import ImportDetailModal from '@/routes/components/ImportDetailModal';
import { MutlTextFieldSearch } from '@/routes/components/MultipleSearch';
// import { getDecode } from '@/utils/utils';
import {
  submit,
  // approve,
  // reject,
  publish,
  agree,
  reviewReject,
  fullOrderUrgent,
  cancelUrgent,
  urgent,
  detailCancelUrgent,
  lineAgree,
  lineReject,
  copyOrder,
  queryCollByLine,
  closeLine,
  cancelLine,
  OrderQuantity,
  exportVendorSystemStatusReSync,
  retryBatch,
  reSyncBatch,
  closeOrCancelGift,
  getGiftConfig,
  cancelValidatePayment,
  createReturnPoNew,
  createReturnPoNewByLine,
  fundPlanValidCaccel,
} from '@/services/orderWorkspaceService';
import AssociatedDocument from './AssociatedDocument';
import { useAmountRender, usePriceRender, useQuantityRender } from './hooks';
import {
  toBeSubmited,
  underApproval,
  toBeReleased,
  toBeSigned,
  feedbackUnderReview,
  all,
  detailFeedback,
  detailAll,
  // orderCopy,
  reason,
  exportVendorSystemStatus,
} from './store/orderWorkspaceDs';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import ReferenceDocument from './ReferenceDocument';
import styles from './index.less';

const { Item } = Menu;
const { TabPane, TabGroup } = Tabs;
const organizationId = getCurrentOrganizationId();

const OrderWorkspace = (props) => {
  const {
    match,
    dispatch,
    orderWorkSpace,
    history,
    customizeTable,
    customizeForm,
    customizeTabPane,
    toBeSubmitedDs,
    underApprovalDs,
    toBeReleasedDs,
    toBeSignedDs,
    feedbackUnderReviewDs,
    allDs,
    cuxTableListDSObj,
    detailFeedbackDs,
    detailAllDs,
    location,
    customizeBtnGroup,
    remote,
  } = props;
  const { redioKey, activeKey, detailActiveKey, initFlag } = orderWorkSpace;
  const { state, search } = location;
  const { activeKey: tabKey, _back } = state || {};
  const { defaultTabIndex, activeDocKey, cardLinkReferKey } = parse(search.substr(1));
  // const filterFields = JSON.parse(getDecode(decodeURIComponent(filters)) || '{}');
  const { path: routerPath } = match;
  // 聚合视图状态key
  const [tabAggregation, setTabAggregation] = useState({
    toBeSubmited: false,
    underApproval: false,
    toBeReleased: false,
    toBeSigned: false,
    feedbackUnderReview: false,
    all: false,
    detailFeedback: false,
    detailAll: false,
  });
  const [counts, setCounts] = useState({});
  const [loadings, setLoadings] = useState({});
  const [collByLine, setCollByLine] = useState(undefined); // 是否按行协同
  const [permissions, setPermissions] = useState([]);
  const [doubleUnitEnabled, setDoubleUnitEnabled] = React.useState(0);
  const [isOpenClearCashed, setIsOpenClearCashed] = useState(true); // 记录是否开启清理缓存记录标识
  const [displayDocAndDocFlow, setDisplayDocAndDocFlow] = useState({}); // 单据流与关联单据显示配置
  const exportVendorSystemStatusDs = useMemo(() => new DataSet(exportVendorSystemStatus()), []);
  const toBeSubmitedDsRef = useRef();
  const underApprovalDsRef = useRef();
  const toBeReleasedDsRef = useRef();
  const toBeSignedDsRef = useRef();
  const feedbackUnderReviewDsRef = useRef();
  const allDsRef = useRef();
  const detailFeedbackDsRef = useRef();
  const detailAllDsRef = useRef();
  const giftFlag = useRef();
  // 二开新增tab的ref
  const cuxTabRefs = remote ? remote.process('SODR.WORKSPACE_LIST_PROCESS_TAB_REFS', {}, {}) : {};

  // 金额字段是否根据sourceCode判断处理
  const bySourceCode = useMemo(() => remote.process('bySourceCode'), []);
  const editorProps = useMemo(
    () => ({
      displayPoNum: {
        placeholder: intl.get('sodr.workspace.view.placeholder.orderNum').d('请输入订单编号'),
      },
      // tempKey: {
      //   // tableProps: { queryBarProps: { defaultShowMore: true } },
      //   searchFieldProps: {
      //     placeholder: intl.get('sodr.workspace.view.placeholder.supplierId').d('请输入供应商名称'),
      //   },
      // },
    }),
    []
  );
  const dsList = useMemo(
    () =>
      [
        { key: 'toBeSubmited', ds: toBeSubmitedDs },
        { key: 'underApproval', ds: underApprovalDs },
        { key: 'toBeReleased', ds: toBeReleasedDs },
        { key: 'toBeSigned', ds: toBeSignedDs },
        {
          key: 'feedbackUnderReview',
          ds: feedbackUnderReviewDs,
        },
        { key: 'all', ds: allDs },
        { key: 'detailFeedback', ds: detailFeedbackDs },
        { key: 'detailAll', ds: detailAllDs },
        ...(remote
          ? remote.process('SODR.WORKSPACE_LIST_PROCESS_KEY_TO_DS_LIST', [], {
              cuxTableListDSObj: cuxTableListDSObj || [],
            }) || []
          : []),
      ].filter(Boolean),
    [
      toBeSubmitedDs,
      underApprovalDs,
      underApprovalDs,
      toBeSignedDs,
      feedbackUnderReviewDs,
      allDs,
      detailFeedbackDs,
      detailAllDs,
      cuxTableListDSObj,
      remote,
    ]
  );
  // 表格渲染埋点统一入口
  const WarpSearchBarTable = useMemo(() => {
    return (warpSearchBarTableProps) => {
      const { warpKey, ...others } = warpSearchBarTableProps;
      const remoteOthers = remote
        ? remote.process('SODR.WORKSPACE_LIST_PROCESS_SEARCH_TABLE_FIELDS', others, { warpKey })
        : others;
      return remote.render('tableRender', <SearchBarTable {...remoteOthers} />, { warpKey });
    };
  }, [remote]);
  const dynamicButtonsRef = useRef(null);
  useEffect(() => {
    if (tabKey || defaultTabIndex) {
      setTimeout(() => {
        fetchLinkTab();
      }, 0);
    }
  }, [tabKey, defaultTabIndex]);

  useEffect(() => {
    fetchPermission();
    queryCollByLineConfig();
    fetchCount();
    fetchDoubleUom();
    queryGiftConfig();
    getDisplayDocAndDocFlow(setDisplayDocAndDocFlow);
  }, []);

  useEffect(() => {
    const menuTabKey = '/sodr/order-workspace';
    onBeforeMenuTabRemove(menuTabKey, initModelState);
    return () => {
      deleteBeforeMenuTabRemove(menuTabKey);
    };
  }, []);

  // 获取是否开启返利-赠品业务配置
  const queryGiftConfig = async () => {
    const res = getResponse(await getGiftConfig());
    if (res) {
      giftFlag.current = res.discountEnableFlag;
    }
  };

  const initModelState = () => {
    dispatch({
      type: 'orderWorkSpace/initState',
    });
  };
  const loading = useCallback(
    (key, value) => {
      setLoadings({ ...loadings, [key]: value });
    },
    [loadings]
  );
  // const [resetFlag, setResetFlag] = useState(false); // 筛选器重置标记
  const fetchCount = useCallback(async () => {
    const res = getResponse(await OrderQuantity());
    if (res) {
      setCounts(res);
    }
  }, [dsList, redioKey, activeKey, detailActiveKey, defaultTabIndex]);

  const fetchDoubleUom = async () => {
    const res = await queryCommonDoubleUomConfig();
    setDoubleUnitEnabled(res);
    [detailFeedbackDs, detailAllDs].map((i) => i.setState({ doubleUnitEnabled: res }));
  };

  // 根据卡片跳转不同tab页
  const fetchLinkTab = () => {
    if (tabKey) {
      dispatch({
        type: 'orderWorkSpace/updateState',
        payload: { activeKey: tabKey },
      });
    }
    if (defaultTabIndex) {
      if (defaultTabIndex === 'detailFeedback' || defaultTabIndex === 'detailAll') {
        dispatch({
          type: 'orderWorkSpace/updateState',
          payload: { redioKey: 'detail', detailActiveKey: defaultTabIndex },
        });
      } else {
        dispatch({
          type: 'orderWorkSpace/updateState',
          payload: { redioKey: 'wholeorder', activeKey: defaultTabIndex },
        });
      }
    }
    if (activeDocKey && detailAllDs?.current) {
      fetchLineDetail(detailAllDs.current);
    }
  };

  const fetchPermission = () => {
    const permissionList = [
      {
        code: 'srm.po-admin.po.order-workspace.ps.button.wholetobesubmited.submit',
        meaning: '订单工作台-整单待提交-提交',
      },
      {
        code: 'srm.po-admin.po.order-workspace.ps.button.wholetobereleased.release',
        meaning: '订单工作台-整单待发布-发布',
      },
      {
        code: 'srm.po-admin.po.order-workspace.ps.button.wholefdback.agree',
        meaning: '订单工作台-整单反馈审核中-同意',
      },
      {
        code: 'srm.po-admin.po.order-workspace.ps.button.changedetail.submit',
        meaning: '订单工作台-变更明细-提交',
      },
      {
        code: 'srm.po-admin.po.order-workspace.button.EC-change-detail.submit',
        meaning: '订单工作台-电商变更明细-提交',
      },
      {
        code: 'srm.po-admin.po.order-workspace.ps.button.canceldetail.close',
        meaning: '订单工作台-取消明细-关闭',
      },
      {
        code: 'srm.po-admin.po.order-workspace.ps.button.detailall.action.close',
        meaning: '订单工作台-明细列表全部-操作-关闭',
      },
      {
        code: 'srm.po-admin.po.order-workspace.ps.button.canceldetail.cancel',
        meaning: '订单工作台-取消明细-取消',
      },
      {
        code: 'srm.po-admin.po.order-workspace.ps.button.detailall.action.cancel',
        meaning: '订单工作台-明细列表全部-操作-取消',
      },
      {
        code: 'srm.po-admin.po.order-workspace.ps.button.canceldetail.copy',
        meaning: '订单工作台-待提交-复制',
      },
      {
        code: 'srm.po-admin.po.order-workspace.ps.button.wholetobesubmited.create.referbillcreate',
        meaning: '订单工作台-列表-新建-引用单据创建',
      },
      {
        code: 'srm.po-admin.po.order-workspace.ps.button.wholetobesubmited.create.createdmanually',
        meaning: '订单工作台-列表-新建-手工创建',
      },
      {
        code: 'srm.po-admin.po.order-workspace.ps.button.wholetobesubmited.create.batchimport',
        meaning: '订单工作台-列表-新建-批量导入',
      },
      {
        code:
          'srm.po-admin.po.order-workspace.ps.button.wholetobesubmited.create.newbatchimportpro',
        meaning: '订单工作台-列表-新建-新版批量导入',
      },
      {
        code: 'srm.po-admin.po.order-workspace.button.wholeall.asyncBatchimportpro',
        meaning: '订单工作台-异步批量导入',
      },
      {
        code: 'srm.po-admin.po.order-workspace.ps.button.changedetail.revoke',
        meaning: '订单工作台-变更明细-撤销变更',
      },
      {
        code: 'srm.po-admin.po.order-workspace.button.canceldetail.unifyRecall',
        meaning: '订单工作台-取消明细-撤销审批',
      },
      {
        code: 'srm.po-admin.po.order-workspace.button.cancelsigingdetail.terminate',
        meaning: '订单工作台-撤销签署明细-发起解约',
      },
      {
        code: 'srm.po-admin.po.order-workspace.button.revoke_approval',
        meaning: '订单工作台-详情-审批中-撤销审批',
      },
      {
        code: 'srm.po-admin.po.order-workspace.button.approval',
        meaning: '订单工作台-详情-审批中-审批',
      },
      {
        code: 'srm.po-admin.po.order-workspace.button.return_new',
        meaning: '订单工作台-整单-创建退货订单',
      },
      {
        // code: 'srm.po-admin.po.order-workspace.button.return_new_by_line',
        code: 'srm.po-admin.po.order-workspace.api.return_new_by_line',
        meaning: '订单工作台-明细列表全部-创建退货订单',
      },
    ];
    checkPermission(permissionList.map((i) => i.code)).then((res) => {
      if (getResponse(res)) {
        setPermissions(res);
      }
    });
  };

  // 查询业务规则定义按行协同配置
  const queryCollByLineConfig = () => {
    queryCollByLine().then((res) => {
      const result = getResponse(res);
      setCollByLine(result);
      if (!result) {
        dispatch({
          type: 'orderWorkSpace/updateState',
          payload: { detailActiveKey: 'detailAll' },
        });
      }
    });
  };

  const init = (keyList, cuzActiveKey) => {
    if (!initFlag) {
      dispatch({
        type: 'orderWorkSpace/updateState',
        payload: { initFlag: true },
      });
      onTabChange(cuzActiveKey);
    }
  };

  // 按钮操作合集
  const handleAction = useCallback(
    async (type) => {
      const actionConfig = [
        { type: 'submit', ds: toBeSubmitedDs, action: submit },
        { type: 'release', ds: toBeReleasedDs, action: publish },
        {
          type: 'agree',
          ds: feedbackUnderReviewDs,
          action: agree,
          query: { customizeUnitCode: `SODR.WORKSPACE_FEEDBACKUNDERREVIEW.LIST` },
        },
        {
          type: 'return',
          ds: feedbackUnderReviewDs,
          action: reviewReject,
          query: { customizeUnitCode: `SODR.WORKSPACE_FEEDBACKUNDERREVIEW.LIST` },
        },
        { type: 'fullOrderUrgent', ds: allDs, action: fullOrderUrgent },
        { type: 'cancelTheEmergency', ds: allDs, action: cancelUrgent },
        { type: 'urgent', ds: detailAllDs, action: urgent },
        { type: 'detailCancelUrgent', ds: detailAllDs, action: detailCancelUrgent },
        {
          type: 'detailAgree',
          ds: detailFeedbackDs,
          action: lineAgree,
          query: { customizeUnitCode: 'SODR.WORKSPACE_DETAILFEEDBACK.LIST' },
        },
        {
          type: 'detailReject',
          ds: detailFeedbackDs,
          action: lineReject,
          query: { customizeUnitCode: 'SODR.WORKSPACE_DETAILFEEDBACK.LIST' },
        },
      ];
      const config = actionConfig.find((i) => i.type === type);
      const { ds, action, query } = config;
      let data = ds.toJSONData().map((i) => ({ ...i, poWorkbenchFlag: 1 }));
      const beforHandleActionRes = await remote.process('beforHandleAction', true, {
        config,
        loading,
        data,
        ds,
      });
      if (!beforHandleActionRes) return;
      const onOk = async () => {
        loading(`${config.type}Loading`, true);
        const res = getResponse(await action(data, query));
        loading(`${config.type}Loading`, false);
        if (res) {
          if (['release'].includes(type)) {
            const list = Object.keys(res);
            if (list.length === 0) {
              notification.success();
            } else {
              notification.warning({
                message: `${JSON.stringify(list)}${res[list[0]].desc}`,
              });
            }
          } else {
            notification.success();
          }
          ds.query();
          ds.unSelectAll();
          ds.clearCachedRecords();
        }
        return res;
      };
      if (['submit'].includes(type)) {
        // const poHeaderIds = [];
        data =
          data &&
          data.map((item) => {
            // poHeaderIds.push(item?.poHeaderId);
            return { ...item, viewCode: 'PENDING_LIST_VIEW' };
          });
        // if (giftFlag.current) {
        //   const giftRes = await previewGift({ poHeaderIds });
        //   if (!giftRes) return;
        // }
        const associatedPcAndAmountCheckRes = await associatedPcAndAmountCheck(2, data);
        if (!associatedPcAndAmountCheckRes) return;
        const warnModalRes = await handleBatchSubmitWarn(
          data,
          {
            loading,
            key: 'submitLoading',
          },
          remote
        );
        if (warnModalRes === 'ok') {
          await handleBudgetVerification(data, onOk, {
            loading,
            key: 'submitLoading',
          });
        }
      } else if (['return', 'detailReject'].includes(type)) {
        const rejectModalRes = await rejectReasonModal({
          customizeForm,
          code:
            type === 'return'
              ? 'SODR.WORKSPACE_FEEDBACKUNDERREVIEW.FEEDBACKMODAL'
              : 'SODR.WORKSPACE_DETAILFEEDBACK.FEEDBACKMODAL',
        });
        // 勾选行插入反馈审核拒绝原因弹窗数据
        data = data.map((i) => ({ ...i, ...rejectModalRes }));
        if (rejectModalRes) onOk();
      } else {
        await onOk();
      }
    },
    [
      toBeSubmitedDs,
      toBeReleasedDs,
      feedbackUnderReviewDs,
      allDs,
      detailAllDs,
      detailFeedbackDs,
      remote,
      loading,
      customizeForm,
    ]
  );

  // 导入订单
  const handleImportOrder = useCallback(() => {
    history.push({
      pathname: `/sodr/order-workspace/data-import/SPUC.PO_IMPORT`,
      search: stringify({
        action: intl.get(`sodr.common.view.button.importOrder`).d('导入订单'),
        backPath: '/sodr/order-workspace/list',
      }),
    });
  }, [history]);

  const handleBatchImport = () => {
    history.push({
      pathname: '/sodr/order-workspace/data-import/PR.URGE_IMPORT',
      search: stringify({
        action: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
        backPath: '/sodr/order-workspace/list',
        args: JSON.stringify({
          tenantId: organizationId,
          templateCode: 'PR.URGE_IMPORT',
        }),
      }),
    });
  };

  // 跳转手工建订单
  const goCreateManually = useCallback((id) => {
    history.push({
      pathname: `/sodr/order-workspace/detail/created-manually/${id || 'new'}`,
    });
  }, []);

  // 复制订单
  const handleOrderCopy = async (poHeaderId) => {
    loading('handleOrderCopy', true);
    const res = await copyOrder({ poHeaderId });
    loading('handleOrderCopy', false);
    if (getResponse(res)) {
      notification.success();
      goCreateManually(res.poHeaderId);
    } else {
      return false;
    }
  };

  useEffect(() => {
    if (cardLinkReferKey) {
      goReferenceDocument(cardLinkReferKey);
      history.push({ pathname: '/sodr/order-workspace/list' });
    }
  }, []);

  // 跳转引用单据创建
  const goReferenceDocument = useCallback(
    (referKey) => {
      Modal.open({
        key: Modal.key(),
        title: intl.get('sodr.workspace.view.button.referenceCreation').d('引用单据创建'),
        drawer: true,
        destroyOnClose: true,
        style: { width: 1090 },
        children: (
          <ReferenceDocument
            dispatch={dispatch}
            orderWorkSpace={orderWorkSpace}
            history={history}
            referKey={referKey}
            parentProps={props}
          />
        ),
        footer: null,
      });
    },
    [orderWorkSpace]
  );

  // 新建下拉框
  const getCreationButton = () => {
    const mainProp =
      (redioKey === 'wholeorder' && ['underApproval', 'all'].includes(activeKey)) ||
      (redioKey === 'detail' && detailActiveKey === 'detailAll')
        ? { color: 'primary' }
        : { funcType: 'flat' };
    const defaultActions = [
      {
        code: 'srm.po-admin.po.order-workspace.ps.button.wholetobesubmited.create.referbillcreate',
        button: (
          <Item funcType="link" onClick={() => goReferenceDocument()}>
            {intl.get('sodr.workspace.view.button.referenceCreation').d('引用单据创建')}
          </Item>
        ),
      },
      {
        code: 'srm.po-admin.po.order-workspace.ps.button.wholetobesubmited.create.createdmanually',
        button: (
          <Item funcType="link" onClick={() => goCreateManually()}>
            {intl.get('sodr.workspace.view.button.createdManually').d('手工创建')}
          </Item>
        ),
      },
      {
        code: 'srm.po-admin.po.order-workspace.ps.button.wholetobesubmited.create.batchimport',
        button: (
          <Item funcType="link" onClick={handleImportOrder}>
            {intl.get('sodr.workspace.view.button.batchImport').d('批量导入')}
          </Item>
        ),
      },
      {
        code:
          'srm.po-admin.po.order-workspace.ps.button.wholetobesubmited.create.newbatchimportpro',
        button: (
          <CommonImport
            businessObjectTemplateCode="SPUC.PO_IMPORT"
            prefixPatch={SRM_SPUC}
            refreshButton
            buttonText={intl.get(`hzero.common.button.batchImport`).d('批量导入')}
            args={{ tenantId: organizationId, newImportFlag: 1 }}
            successCallBack={() => (redioKey === 'detail' ? detailAllDs.query() : allDs.query())} // 导入成功的回调
            buttonProps={{
              className: `c7n-menu-item ${styles['drop-group-import']}`,
              type: 'c7n-pro',
              icon: undefined,
              funcType: 'link',
            }}
          />
        ),
      },
    ];
    const getOverlay = () => {
      const actions = defaultActions.filter((i) => {
        const currenPer = permissions.find((n) => n.code === i.code) || {};
        return !(currenPer.controllerType === 'hidden' && !currenPer.approve);
      });
      return isEmpty(actions) ? false : <Menu>{actions.map((i) => i.button)}</Menu>;
    };
    const overlay = getOverlay();
    if (isEmpty(overlay)) return false;
    return (
      <Dropdown overlay={overlay}>
        {(
          <Button
            {...mainProp}
            icon="add"
            type="c7n-pro"
            permissionList={[
              {
                code: 'srm.po-admin.po.order-workspace.ps.button.wholetobesubmited.create',
                type: 'c7n-pro',
                meaning: '订单工作台-列表-新建',
              },
            ]}
          >
            {intl.get('hzero.common.button.creat').d('新建')}
            <Icon type="expand_more" style={{ marginLeft: 4 }} />
            <span className={styles['order-import-button-tag']}>NEW</span>
          </Button>
        ) || <span style={{ display: 'none' }} />}
      </Dropdown>
    );
  };

  // 新个性化下拉框
  const getCreationCustomButton = useCallback(() => {
    const currentDs = dsList.find((i) => i.key === activeKeys)?.ds;
    if (!currentDs) return;
    const { selected } = currentDs;
    const mainProp =
      (redioKey === 'wholeorder' && ['underApproval', 'toBeSigned', 'all'].includes(activeKey)) ||
      (redioKey === 'detail' && detailActiveKey === 'detailAll')
        ? { color: 'primary' }
        : { funcType: 'flat' };
    const defaultActions = [
      {
        code: 'srm.po-admin.po.order-workspace.ps.button.wholetobesubmited.create.referbillcreate',
        button: {
          name: 'referenceCreation',
          child: intl.get('sodr.workspace.view.button.referenceCreation').d('引用单据创建'),
          btnProps: {
            onClick: () => goReferenceDocument(),
          },
        },
      },
      {
        code: 'srm.po-admin.po.order-workspace.ps.button.wholetobesubmited.create.createdmanually',
        button: {
          name: 'createdManually',
          child: intl.get('sodr.workspace.view.button.createdManually').d('手工创建'),
          btnProps: {
            onClick: () => goCreateManually(),
          },
        },
      },
      {
        code: 'srm.po-admin.po.order-workspace.ps.button.wholetobesubmited.create.batchimport',
        button: {
          name: 'batchImport',
          child: intl.get('sodr.workspace.view.button.batchImport').d('批量导入'),
          btnProps: {
            onClick: handleImportOrder,
          },
        },
      },
      {
        code:
          'srm.po-admin.po.order-workspace.ps.button.wholetobesubmited.create.newbatchimportpro',
        button: {
          name: 'newBatchImport',
          btnComp: CommonImport,
          childFor: 'buttonText',
          child: intl.get(`hzero.common.button.batchImport`).d('批量导入'),
          btnProps: {
            businessObjectTemplateCode: 'SPUC.PO_IMPORT',
            prefixPatch: SRM_SPUC,
            refreshButton: true,
            args: { tenantId: organizationId, newImportFlag: 1 },
            successCallBack: () => (redioKey === 'detail' ? detailAllDs.query() : allDs.query()), // 导入成功的回调
            buttonProps: {
              // type: 'c7n-pro',
              // icon: 'archive',
              // funcType: 'flat',
              className: `c7n-menu-item ${styles['drop-group-import']}`,
              type: 'c7n-pro',
              icon: undefined,
              funcType: 'flat',
              // style: {
              //   lineHeight: '20px',
              //   marginTop: '10px',
              //   left: '6px',
              //   minWidth: '80px',
              //   border:'0px'
              // },
            },
          },
        },
      },
      {
        code: 'srm.po-admin.po.order-workspace.button.wholeall.asyncBatchimportpro',
        button: {
          name: 'asynchronousBatchImport',
          btnComp: CommonImport,
          childFor: 'buttonText',
          child: intl.get(`sodr.workspace.view.button.asynchronousBatchImport`).d('异步批量导入'),
          btnProps: {
            businessObjectTemplateCode: 'SPUC.PO_IMPORT',
            prefixPatch: SRM_SPUC,
            refreshButton: true,
            args: { tenantId: organizationId, newImportFlag: 1, syncImportFlag: 1 },
            successCallBack: () => (redioKey === 'detail' ? detailAllDs.query() : allDs.query()), // 导入成功的回调
            buttonProps: {
              className: `c7n-menu-item ${styles['drop-group-import']} c7n-pro-btn-block`,
              type: 'c7n-pro',
              icon: undefined,
              funcType: 'flat',
            },
          },
        },
      },
      activeKeys === 'detailAll' && {
        code: 'srm.po-admin.po.order-workspace.api.return_new_by_line',
        button: {
          name: 'return_new',
          child: intl.get(`sodr.common.view.button.choose_return_new`).d('勾选新建退货订单'),
          btnProps: {
            onClick: () => handleCreateReturnNew(selected),
            disabled: isEmpty(selected),
          },
        },
      },
    ];

    const getOverlay = () => {
      const actions = defaultActions.filter((i) => {
        const currenPer = permissions.find((n) => i && n.code === i.code) || {};
        return !(currenPer.controllerType === 'hidden' && !currenPer.approve);
      });
      return actions.map((i) => {
        return i.button;
      });
    };
    const overlay = getOverlay();
    if (isEmpty(overlay)) return { hidden: true };
    return {
      name: 'create',
      group: true,
      children: currentDs.status === 'ready' && overlay,
      btnProps: {
        loading: currentDs.status !== 'ready',
      },
      // btnProps:{
      //   permissionList:[
      //   {
      //     code: 'srm.po-admin.po.order-workspace.ps.button.wholetobesubmited.create',
      //     type: 'c7n-pro',
      //     meaning: '订单工作台-列表-新建',
      //   },
      // ]},
      child: (name) => {
        return (
          (
            <Button {...mainProp} icon="add" type="c7n-pro">
              {name || intl.get('hzero.common.button.creat').d('新建')}
              <Icon type="expand_more" style={{ marginLeft: 4 }} />
              <span className={styles['order-import-button-tag']}>NEW</span>
            </Button>
          ) || <span style={{ display: 'none' }} />
        );
      },
    };
  }, [
    dsList,
    activeKeys,
    goReferenceDocument,
    goCreateManually,
    handleImportOrder,
    detailAllDs,
    allDs,
    permissions,
    redioKey,
    detailActiveKey,
    activeKey,
  ]);

  const reImportERPOrDelivery = async () => {
    const { selected } = allDs;
    const selectedData = selected.map((i) => {
      return { poHeaderId: i.get('poHeaderId') };
    });
    loading('reImportERP', true);
    const res = getResponse(
      await retryBatch({
        data: selectedData,
      })
    );
    loading('reImportERP', false);
    if (res) {
      allDs.query();
      allDs.batchUnSelect(allDs.selected);
      notification.info({ message: res.msg });
    }
  };
  const reSync = async () => {
    const { selected } = detailAllDs;
    const selectedData = selected
      .filter((i) => ['FAIL', 'WAIT_SYNC'].includes(i.get('exportErpFlag')))
      .map((i) => {
        return { poLineLocationId: i.get('poLineLocationId') };
      });
    loading('reSync', true);
    const res = getResponse(
      await reSyncBatch({
        data: selectedData,
      })
    );
    loading('reSync', false);
    if (res) {
      detailAllDs.query();
      notification.info({
        message: intl
          .get(`sodr.common.view.message.resyncLoadingTip`)
          .d('正在重新同步订单数据，请稍后查看同步状态布'),
      });
    }
  };

  const getBtns = () => {
    let Buttons;
    const createBtn = getCreationButton();
    const createCustomBtn = getCreationCustomButton();
    if (redioKey === 'wholeorder') {
      switch (activeKey) {
        case 'underApproval':
          // Buttons = observer(({ dataSet }) => {
          //   return [
          //     <Button
          //       color="primary"
          //       icon="check_circle"
          //       disabled={!dataSet.selected.length}
          //       onClick={() => handleAction('approved')}
          //       loading={loadings.approvedLoading}
          //     >
          //       {intl.get(`sodr.workspace.view.button.approved`).d('审批通过')}
          //     </Button>,
          //     <Button
          //       icon="cancel"
          //       funcType="flat"
          //       disabled={!dataSet.selected.length}
          //       onClick={() => handleAction('approvalRejected')}
          //       loading={loadings.approvalRejectedLoading}
          //     >
          //       {intl.get(`sodr.workspace.view.button.approvalRejected`).d('审批拒绝')}
          //     </Button>,
          //   ];
          // });
          // return <Buttons dataSet={underApprovalDs} />;
          return remote
            ? remote.process('SODR.WORKSPACE_LIST_PROCESS_UNDER_APPROVAL_HEADER_BTN', [createBtn], {
                underApprovalDs,
              })
            : [createBtn];
        case 'toBeReleased':
          Buttons = observer(({ dataSet }) => {
            const preBtns = [
              <Button
                wait={THROTTLE_TIME}
                color="primary"
                type="c7n-pro"
                icon="publish2"
                disabled={!dataSet.selected.length}
                onClick={() => handleAction('release')}
                loading={loadings.releaseLoading}
                permissionList={[
                  {
                    code: 'srm.po-admin.po.order-workspace.ps.button.wholetobereleased.release',
                    type: 'c7n-pro',
                    meaning: '订单工作台-整单待发布-发布',
                  },
                ]}
              >
                {intl.get(`sodr.workspace.view.button.release`).d('发布')}
              </Button>,
              createBtn,
            ];
            return remote
              ? remote.process('SODR.WORKSPACE_LIST_PROCESS_RELEASED_HEADER_BTN', preBtns, {
                  dataSet,
                })
              : preBtns;
          });
          return <Buttons dataSet={toBeReleasedDs} />;
        case 'toBeSigned':
          Buttons = observer(({ dataSet }) => {
            const buttons = remote
              ? remote.process(
                  'SODR.WORKSPACE_LIST_PROCESS_TOBESIGNED_HEADER_BTN',
                  [createCustomBtn],
                  { dataSet }
                )
              : [createCustomBtn];
            return (
              <Fragment>
                {customizeBtnGroup(
                  { code: 'SODR.WORKSPACE_TOBESIGNED.BUTTONS', pro: true },
                  <DynamicButtons key="dynamicButtons" ref={dynamicButtonsRef} buttons={buttons} />
                )}
              </Fragment>
            );
          });
          return <Buttons dataSet={toBeSignedDs} />;
        case 'feedbackUnderReview':
          return (
            <FeedbackUnderReviewButtons
              dataSet={feedbackUnderReviewDs}
              handleAction={handleAction}
              loadings={loadings}
              createCustomBtn={createCustomBtn}
              customizeBtnGroup={customizeBtnGroup}
              remote={remote}
            />
          );
        case 'all':
          Buttons = observer(({ dataSet }) => {
            const { selected } = dataSet;
            const urgentFlagList = selected.map((i) => i.get('urgentFlag'));
            const hasDifferent = Array.from(new Set(urgentFlagList)).length > 1;
            const poHeaderIds = selected.map((i) => i.get('poHeaderId'));
            const disabledResync = selected.every(
              (i) => i.get('exportErpFlag') === 'FAIL' || i.get('syncStatus') === 'FAIL'
            );
            const queryParams = selected.length
              ? { poHeaderIds }
              : dataSet.queryDataSet
              ? dataSet.queryDataSet.toData()[0] || {}
              : {};
            Object.assign(queryParams, {
              poWorkbenchFlag: 1,
              customizeUnitCode:
                'SODR.WORKSPACE_ALL.EXPORT,SODR.WORKSPACE_ALL.SERARCH,SODR.WORKSPACE_ALL.LIST',
            });
            const postParams = {
              ...queryParams,
              statusCodes: queryParams.statusCodes?.split(','),
            };
            const isFullOrderUrgent = urgentFlagList.includes(0) || !selected.length;
            const buttons = [
              // ,
              createCustomBtn,
              {
                name: 'expedited',
                child: isFullOrderUrgent
                  ? intl.get(`sodr.workspace.view.button.fullOrderUrgent`).d('整单加急')
                  : intl.get(`sodr.workspace.view.button.cancelTheEmergency`).d('取消加急'),
                btnProps: {
                  wait: THROTTLE_TIME,
                  funcType: 'flat',
                  icon: isFullOrderUrgent ? 'flash_on' : 'flash_off',
                  disabled: !selected.length || hasDifferent,
                  onClick: () =>
                    isFullOrderUrgent
                      ? handleAction('fullOrderUrgent')
                      : handleAction('cancelTheEmergency'),
                  loading:
                    loadings[
                      isFullOrderUrgent ? 'fullOrderUrgentLoading' : 'cancelTheEmergencyLoading'
                    ],
                },
              },
              {
                name: 'exportPro',
                btnComp: ExcelExportPro,
                childFor: 'buttonText',
                child: selected.length
                  ? intl.get(`hzero.common.button.selectedExport`).d('勾选导出')
                  : intl.get(`hzero.common.button.export`).d('导出'),
                btnProps: {
                  templateCode: 'SRM_SODR_WORKBENCH_PO_HEADER', // 导出模板编码
                  exportAsync: true, // 是否异步
                  otherButtonProps: {
                    type: 'c7n-pro',
                    funcType: 'flat',
                    icon: 'unarchive',
                  },
                  requestUrl: `${SRM_SPUC}/v1/${organizationId}/po-workbench/export-pur/new-module`,
                  queryParams: postParams,
                  method: 'POST',
                  allBody: true,
                },
              },
              {
                name: 'importPro',
                btnComp: CommonImport,
                childFor: 'buttonText',
                child: intl.get(`hzero.common.button.batchUrgentImport`).d('批量导入加急'),
                btnProps: {
                  businessObjectTemplateCode: 'PR.URGE_IMPORT',
                  prefixPatch: SRM_SPUC,
                  refreshButton: true,
                  args: { tenantId: organizationId, newImportFlag: 1 },
                  successCallBack: () => {
                    allDs.query();
                  }, // 导入成功的回调
                  buttonProps: {
                    type: 'c7n-pro',
                    // icon="archive"
                    funcType: 'flat',
                  },
                },
              },
              {
                name: 'resync',
                child: intl.get(`sodr.workspace.view.button.resynchronize`).d('重新同步'),
                btnProps: {
                  funcType: 'flat',
                  icon: 'sync',
                  disabled: !selected.length || !disabledResync,
                  onClick: reImportERPOrDelivery,
                  loading: loadings.reImportERP,
                  wait: THROTTLE_TIME,
                },
              },
              {
                name: 'export',
                btnComp: ExcelExport,
                childFor: 'buttonText',
                child: selected.length
                  ? intl.get('hzero.common.button.exportSelect').d('勾选导出')
                  : intl.get('hzero.common.export').d('导出'),
                btnProps: {
                  otherButtonProps: {
                    type: 'c7n-pro',
                    icon: 'unarchive',
                    funcType: 'flat',
                  },
                  requestUrl: `${SRM_SPUC}/v1/${organizationId}/po-workbench/export-pur`,
                  queryParams: postParams,
                  method: 'POST',
                },
              },
              {
                name: 'batchImportExpedited',
                // btnComp: Button,
                type: 'c7n-pro',
                child: intl.get(`sodr.workspace.view.button.batchImportUrgent`).d('批量导入加急'),
                btnProps: {
                  style: { padding: '0 15px', textAlign: 'left' },
                  icon: 'archive',
                  funcType: 'flat',
                  type: 'c7n-pro',
                  onClick: handleBatchImport,
                },
              },
              {
                name: 'printNew',
                type: 'c7n-pro',
                childFor: 'buttonText',
                btnComp: PrintProButton,
                child: intl.get(`sodr.workspace.view.button.batch.printpro`).d('批量打印'),
                btnProps: {
                  buttonProps: {
                    funcType: 'flat',
                    type: 'c7n-pro',
                    wait: THROTTLE_TIME,
                    disabled: isEmpty(selected),
                    permissionList: [
                      {
                        code: 'srm.po-admin.po.order-workspace.button.wholeall.newBatchPrint',
                        type: 'c7n-pro',
                        meaning: '订单工作台-整单全部-(新)批量打印',
                      },
                    ],
                  },
                  method: 'POST',
                  data: poHeaderIds,
                  requestUrl: `${SRM_SPUC}/v1/${organizationId}/po-header/batch-print-token`,
                },
              },
              {
                name: 'exportSyncRecord',
                btnComp: ExcelExportPro,
                childFor: 'buttonText',
                child: selected.length
                  ? intl
                      .get('sodr.workspace.view.button.selectExportSyncRecord')
                      .d('勾选导出同步记录表')
                  : intl.get('sodr.workspace.view.button.exportSyncRecord').d('导出同步记录表'),
                btnProps: {
                  templateCode: 'SRM_C_SRM_SODR_PO_HEADER_PO_SYNC_STATUS', // 导出模板编码
                  exportAsync: true, // 是否异步
                  otherButtonProps: {
                    type: 'c7n-pro',
                    funcType: 'flat',
                    icon: 'unarchive',
                  },
                  requestUrl: `${SRM_SPUC}/v1/${organizationId}/po-sync/export-record/new-module`,
                  queryParams: postParams,
                  method: 'POST',
                  allBody: true,
                },
              },
              {
                name: 'importProChange',
                btnComp: CommonImport,
                childFor: 'buttonText',
                child: intl.get(`sodr.common.view.button.importProChange`).d('批量变更'),
                btnProps: {
                  businessObjectTemplateCode: 'SPUC.PO_BULK_CHANGES_IMPORT',
                  prefixPatch: SRM_SPUC,
                  refreshButton: true,
                  args: { tenantId: organizationId, newImportFlag: 1 },
                  successCallBack: () => {
                    allDs.query();
                  }, // 导入成功的回调
                  buttonProps: {
                    type: 'c7n-pro',
                    // icon="archive"
                    funcType: 'flat',
                  },
                },
              },
            ];
            return (
              <Fragment>
                {customizeBtnGroup(
                  { code: 'SODR.WORKSPACE_ALL.BUTTONS', pro: true },
                  <DynamicButtons
                    // 因为加急按钮使用了不同的权限集编码 所以需要区分key
                    key={isFullOrderUrgent ? 'fullOrderUrgent' : 'cancelTheEmergency'}
                    // ref={dynamicButtonsRef}
                    permissions={[
                      {
                        name: 'create',
                        code: 'srm.po-admin.po.order-workspace.ps.button.wholetobesubmited.create',
                        meaning: '订单工作台-列表-新建',
                      },
                      {
                        name: 'expedited',
                        code: isFullOrderUrgent
                          ? 'srm.po-admin.po.order-workspace.ps.button.wholeall.fullorderurgent'
                          : 'srm.po-admin.po.order-workspace.ps.button.wholeall.cancelurgent',
                        meaning: isFullOrderUrgent
                          ? '订单工作台-整单全部-整单加急'
                          : '订单工作台-整单全部-取消加急',
                      },
                      {
                        name: 'exportPro',
                        code: 'srm.po-admin.po.order-workspace.ps.button.wholeall.newexport',
                        meaning: '订单工作台-整单全部-新版导出',
                      },
                      {
                        name: 'importPro',
                        code:
                          'srm.po-admin.po.order-workspace.ps.button.wholeall.newbatchimportugent',
                        meaning: '订单工作台-整单全部-新版批量导入加急',
                      },
                      {
                        name: 'export',
                        code: 'srm.po-admin.po.order-workspace.ps.button.wholeall.export',
                        meaning: '订单工作台-整单全部-导出',
                      },
                      {
                        name: 'batchImportExpedited',
                        code: 'srm.po-admin.po.order-workspace.ps.button.wholeall.batchimportugent',
                        meaning: '订单工作台-整单全部-批量导入加急',
                      },
                      {
                        name: 'exportSyncRecord',
                        code: 'srm.po-admin.po.order-workspace.button.wholeall.exportSyncRecord',
                        meaning: '订单工作台-整单全部-导出同步记录表',
                      },
                      {
                        name: 'importProChange',
                        code: 'srm.po-admin.po.order-workspace.button.wholeall.importProChange',
                        meaning: '订单工作台-批量变更',
                      },
                    ]}
                    maxNum={5}
                    buttons={
                      remote
                        ? remote.process('SODR.WORKSPACE_LIST_PROCESS_ALL_BUTTONS', buttons, {
                            context: props,
                            dataSet,
                          })
                        : buttons
                    }
                    defaultBtnType="c7n-pro"
                  />
                )}
              </Fragment>
            );
          });
          return <Buttons dataSet={allDs} />;
        case 'toBeSubmited':
          Buttons = observer(({ dataSet }) => {
            const buttons = [
              {
                name: 'submit',
                btnComp: Button,
                type: 'c7n-pro',
                child: intl.get(`hzero.common.button.submit`).d('提交'),
                btnProps: {
                  wait: THROTTLE_TIME,
                  loading: loadings.submitLoading,
                  icon: 'check',
                  color: 'primary',
                  type: 'c7n-pro',
                  disabled: !dataSet.selected.length,
                  onClick: () => handleAction('submit'),
                  permissionList: [
                    {
                      code: 'srm.po-admin.po.order-workspace.ps.button.wholetobesubmited.submit',
                      type: 'c7n-pro',
                      meaning: '订单工作台-整单待提交-提交',
                    },
                  ],
                },
              },
              createCustomBtn,
            ];

            return (
              <Fragment>
                {customizeBtnGroup(
                  { code: 'SODR.WORKSPACE_TOBESUBMITED.BUTTONS', pro: true },
                  <DynamicButtons
                    key="dynamicButtons"
                    ref={dynamicButtonsRef}
                    buttons={
                      remote
                        ? remote.process('SODR.WORKSPACE_LIST_PROCESS_SUBMIT_HEADER_BTN', buttons, {
                            dataSet,
                          })
                        : buttons
                    }
                  />
                )}
              </Fragment>
            );
            // [
            //   <Button
            //     onClick={() => handleAction('submit')}
            //     loading={loadings.submitLoading}
            //     icon="check"
            //     color="primary"
            //     type="c7n-pro"
            //     disabled={!dataSet.selected.length}
            //     permissionList={[
            //       {
            //         code: 'srm.po-admin.po.order-workspace.ps.button.wholetobesubmited.submit',
            //         type: 'c7n-pro',
            //         meaning: '订单工作台-整单待提交-提交',
            //       },
            //     ]}
            //   >
            //     {intl.get(`hzero.common.button.submit`).d('提交')}
            //   </Button>,
            //   createBtn,
            // ];
          });
          return <Buttons dataSet={toBeSubmitedDs} />;
        default:
          return <Fragment />;
      }
    } else if (redioKey === 'detail') {
      switch (detailActiveKey) {
        case 'detailAll':
          Buttons = observer(({ dataSet }) => {
            const { selected, queryDataSet } = dataSet;
            const urgentFlagList = selected.map((i) => i.get('urgentFlag'));
            const hasDifferent = Array.from(new Set(urgentFlagList)).length > 1;
            const poLineLocationIds = selected.map((i) => i.get('poLineLocationId'));
            const queryParams = selected.length
              ? { poLineLocationIds }
              : queryDataSet
              ? queryDataSet.toData()[0] || {}
              : {};
            Object.assign(queryParams, {
              poWorkbenchFlag: 1,
              customizeUnitCode:
                'SODR.WORKSPACE_DETAILALL.EXPORT,SODR.WORKSPACE_DETAILALL.SEARCH,SODR.WORKSPACE_DETAILALL.LIST',
            });
            const postParams = {
              ...queryParams,
              statusCodes: queryParams.statusCodes?.split(','),
            };
            const editResync = selected.some((i) =>
              ['FAIL', 'WAIT_SYNC'].includes(i.get('exportErpFlag'))
            );
            const isUrgent = urgentFlagList.includes(0) || !selected.length;
            const buttons = [
              createCustomBtn,
              {
                name: 'expedited',
                child: isUrgent
                  ? intl.get(`sodr.workspace.view.button.urgent`).d('加急')
                  : intl.get(`sodr.workspace.view.button.cancelTheEmergency`).d('取消加急'),
                btnProps: {
                  wait: THROTTLE_TIME,
                  funcType: 'flat',
                  icon: isUrgent ? 'flash_on' : 'flash_off',
                  disabled: !selected.length || hasDifferent,
                  onClick: () =>
                    isUrgent ? handleAction('urgent') : handleAction('detailCancelUrgent'),
                  loading: loadings[isUrgent ? 'urgentLoading' : 'detailCancelUrgentLoading'],
                },
              },
              {
                name: 'exportPro',
                btnComp: ExcelExportPro,
                childFor: 'buttonText',
                child: selected.length
                  ? intl.get(`hzero.common.button.selectedExport`).d('勾选导出')
                  : intl.get(`hzero.common.button.export`).d('导出'),
                btnProps: {
                  templateCode: 'SRM_C_SODR_WORKBENCH_PO_LINE_LOCATION', // 导出模板编码
                  exportAsync: true, // 是否异步
                  otherButtonProps: {
                    type: 'c7n-pro',
                    funcType: 'flat',
                    icon: 'unarchive',
                  },
                  requestUrl: `${SRM_SPUC}/v1/${organizationId}/po-workbench/purchaser/export/new-module`,
                  queryParams: postParams,
                  method: 'POST',
                  allBody: true,
                },
              },
              {
                name: 'importPro',
                btnComp: CommonImport,
                childFor: 'buttonText',
                child: intl.get(`sodr.workspace.view.button.batchImportUrgent`).d('批量导入加急'),
                btnProps: {
                  businessObjectTemplateCode: 'PR.URGE_IMPORT',
                  prefixPatch: SRM_SPUC,
                  refreshButton: true,
                  args: { tenantId: organizationId, newImportFlag: 1 },
                  successCallBack: () => {
                    detailAllDs.query();
                  }, // 导入成功的回调
                  buttonProps: {
                    type: 'c7n-pro',
                    // icon="archive"
                    funcType: 'flat',
                  },
                },
              },
              {
                name: 'resync',
                child: intl.get(`sodr.workspace.view.button.resynchronize`).d('重新同步'),
                btnProps: {
                  icon: 'sync',
                  disabled: !selected.length || !editResync,
                  onClick: reSync,
                  loading: loadings.reSync,
                  wait: THROTTLE_TIME,
                  funcType: 'flat',
                },
              },
              {
                name: 'export',
                btnComp: ExcelExport,
                childFor: 'buttonText',
                child: selected.length
                  ? intl.get('hzero.common.button.exportSelect').d('勾选导出')
                  : intl.get('hzero.common.export').d('导出'),
                btnProps: {
                  otherButtonProps: {
                    type: 'c7n-pro',
                    icon: 'unarchive',
                    funcType: 'flat',
                  },
                  requestUrl: `${SRM_SPUC}/v1/${organizationId}/po-workbench/purchaser/export`,
                  queryParams: postParams,
                  method: 'POST',
                },
              },
              {
                name: 'batchImportExpedited',
                child: intl.get(`sodr.workspace.view.button.batchImportUrgent`).d('批量导入加急'),
                btnProps: {
                  icon: 'archive',
                  funcType: 'flat',
                  onClick: handleBatchImport,
                },
              },
              {
                name: 'batchClose',
                child: intl.get(`sodr.workspace.view.button.close`).d('关闭'),
                btnProps: {
                  icon: 'not_interested',
                  disabled:
                    isEmpty(selected) ||
                    !selected.every((i) => (i.get('operationList') || []).includes('CLOSE')),
                  onClick: () => handleBatchActionByLine('close'),
                  loading: loadings.handleBatchActionByLine,
                  funcType: 'flat',
                },
              },
              {
                name: 'batchCancel',
                child: intl.get(`sodr.workspace.view.button.cancel`).d('取消'),
                btnProps: {
                  icon: 'cancel',
                  disabled:
                    isEmpty(selected) ||
                    !selected.every((i) => (i.get('operationList') || []).includes('CANCEL')),
                  onClick: () => handleBatchActionByLine('cancel'),
                  loading: loadings.handleBatchActionByLine,
                  funcType: 'flat',
                },
              },
            ];

            return (
              <Fragment>
                {customizeBtnGroup(
                  { code: 'SODR.WORKSPACE_DETAILALL.BUTTONS', pro: true },
                  <DynamicButtons
                    // 因为加急按钮使用了不同的权限集编码 所以需要区分key
                    key={isUrgent ? 'urgent' : 'cancelurgent'}
                    // ref={dynamicButtonsRef}
                    permissions={[
                      {
                        name: 'create',
                        code: 'srm.po-admin.po.order-workspace.ps.button.wholetobesubmited.create',
                        type: 'c7n-pro',
                        meaning: '订单工作台-列表-新建',
                      },
                      {
                        name: 'expedited',
                        code: isUrgent
                          ? 'srm.po-admin.po.order-workspace.ps.button.detailsall.urgent'
                          : 'srm.po-admin.po.order-workspace.ps.button.detailsall.cancelurgent',
                        type: 'c7n-pro',
                        meaning: isUrgent
                          ? '订单工作台-明细列表全部-加急'
                          : '订单工作台-明细列表全部-取消加急',
                      },
                      {
                        name: 'exportPro',
                        code: 'srm.po-admin.po.order-workspace.ps.button.detailsall.newexport',
                        meaning: '订单工作台-明细列表全部-新版导出',
                      },
                      {
                        name: 'importPro',
                        code:
                          'srm.po-admin.po.order-workspace.ps.button.detailsall.newbatchimporturgen',
                        meaning: '订单工作台-明细列表全部-新版批量导入加急',
                      },
                      {
                        name: 'export',
                        code: 'srm.po-admin.po.order-workspace.ps.button.detailsall.export',
                        meaning: '订单工作台-明细列表全部-导出',
                      },
                      {
                        name: 'batchImportExpedited',
                        code:
                          'srm.po-admin.po.order-workspace.ps.button.detailsall.batchimporturgent',
                        meaning: '订单工作台-明细列表全部-批量导入加急',
                      },
                      {
                        name: 'batchClose',
                        code: 'srm.po-admin.po.order-workspace.ps.button.detailall.action.close',
                        meaning: '订单工作台-明细列表全部-操作-关闭',
                      },
                      {
                        name: 'batchCancel',
                        code: 'srm.po-admin.po.order-workspace.ps.button.detailall.action.cancel',
                        meaning: '订单工作台-明细列表全部-操作-取消',
                      },
                    ]}
                    maxNum={5}
                    buttons={buttons}
                    defaultBtnType="c7n-pro"
                  />
                )}
              </Fragment>
            );
          });
          return <Buttons dataSet={detailAllDs} />;
        case 'detailFeedback':
          Buttons = observer(({ dataSet }) => {
            const { selected } = dataSet;
            const buttons = [
              {
                name: 'agree',
                child: intl.get(`sodr.workspace.view.button.agree`).d('同意'),
                btnProps: {
                  color: 'primary',
                  icon: 'check_circle',
                  disabled: !selected.length,
                  onClick: () => handleAction('detailAgree'),
                  loading: loadings.detailAgreeLoading || loadings.detailRejectLoading,
                  wait: THROTTLE_TIME,
                },
              },
              {
                name: 'reject',
                child: intl.get(`sodr.workspace.view.button.return`).d('退回'),
                btnProps: {
                  funcType: 'flat',
                  icon: 'reply',
                  disabled: !selected.length,
                  onClick: () => handleAction('detailReject'),
                  loading:
                    dataSet.status !== 'ready' ||
                    loadings.detailAgreeLoading ||
                    loadings.detailRejectLoading,
                  wait: THROTTLE_TIME,
                },
              },
              createCustomBtn,
            ];
            return (
              <Fragment>
                {customizeBtnGroup(
                  {
                    code: 'SODR.WORKSPACE_DETAILFEEDBACK.BUTTONS',
                    pro: true,
                  },
                  <DynamicButtons
                    key="feedbackUnderReview"
                    permissions={[
                      {
                        name: 'create',
                        code: 'srm.po-admin.po.order-workspace.ps.button.wholetobesubmited.create',
                        type: 'c7n-pro',
                        meaning: '订单工作台-列表-新建',
                      },
                      {
                        name: 'agree',
                        code: 'srm.po-admin.po.order-workspace.ps.button.detailsfdback.agree',
                        meaning: '订单工作台-明细列表反馈审核中-同意',
                      },
                      {
                        name: 'reject',
                        code: 'srm.po-admin.po.order-workspace.ps.button.detailsfdback.return',
                        meaning: '订单工作台-明细列表反馈审核中-退回',
                      },
                    ]}
                    buttons={buttons}
                    maxNum={5}
                    defaultBtnType="c7n-pro"
                  />
                )}
              </Fragment>
            );
          });
          return <Buttons dataSet={detailFeedbackDs} />;
        default:
          return <Fragment />;
      }
    } else {
      return remote
        ? remote.render('SODR.WORKSPACE_LIST_RENDER_CUX_HEADER_BUTTON', null, {
            props,
            activeKey,
            detailActiveKey,
            redioKey,
          })
        : null;
    }
  };

  const validateGift = async (lineData, isCancel) => {
    if (!giftFlag.current) return true;
    const giftRes = getResponse(await closeOrCancelGift({ data: lineData }));
    if (giftRes) {
      if (giftRes.hasGiftFlag === 1) {
        const validateGiftModal = await Modal.confirm({
          title: isCancel
            ? intl
                .get('sodr.workspace.view.message.validateGiftCancel')
                .d('该行下存在赠品行，取消后将会同步取消赠品行，是否确认取消？')
            : intl
                .get('sodr.workspace.view.message.validateGiftClose')
                .d('该行下存在赠品行，关闭后将会同步关闭赠品行，是否确认关闭'),
        });
        return validateGiftModal === 'ok';
      }
      return true;
    }
    return false;
  };

  // 按行特殊操作
  const handleActionByLine = async (type, record) => {
    const reasonDs = new DataSet(reason());
    const isCancel = type === 'cancel';
    const code = isCancel
      ? 'SODR.WORKSPACE_DETAILALL.CANCEL_MODAL'
      : 'SODR.WORKSPACE_DETAILALL.CLOSE_MODAL';
    const lineData = record.toJSONData();
    const { fundTermDimension } = lineData;
    const validateGiftRes = await validateGift([lineData], isCancel);
    if (!validateGiftRes) return;
    const onOk = throttle(
      async () => {
        const status = await reasonDs.validate();
        if (!status) return false;
        loading(type, true);
        const data = [
          {
            ...lineData,
            ...reasonDs.toJSONData()[0],
          },
        ];
        const beforRes = await remote.process('beforLineCancelOrClose', {
          data,
          type,
          detailAllDs,
        });
        if (!beforRes) {
          loading(type, false);
          return beforRes !== false;
        }
        const res = getResponse(
          await (isCancel
            ? cancelLine(data, { customizeUnitCode: code })
            : closeLine(data, { customizeUnitCode: code }))
        );
        loading(type, false);
        if (res) {
          notification.success();
          detailAllDs.query();
        }
        return !!res;
      },
      THROTTLE_TIME,
      { trailing: false }
    );
    const modalProps = {
      drawer: true,
      style: { width: 380 },
      title: isCancel
        ? intl.get('sodr.workspace.model.common.cancellationReason').d('取消原因')
        : intl.get('sodr.workspace.model.common.closingReason').d('关闭原因'),
      children: customizeForm(
        {
          code,
        },
        <Form dataSet={reasonDs} columns={1} labelLayout="float">
          <TextArea
            name="closeCancelRemark"
            placeholder={
              isCancel
                ? intl.get('sodr.workspace.view.message.cancellationReason').d('请输入取消原因')
                : intl.get('sodr.workspace.view.message.closingReason').d('请输入关闭原因')
            }
          />
        </Form>
      ),
      onOk,
      afterClose: () => {
        reasonDs.reset();
      },
      okProps: { loading: loadings[type] },
    };
    if (isCancel) {
      // 按行取消管控维度为整单
      if (fundTermDimension === 'ORDER') {
        const handleOpenFundTermIdDetailRes = await handleOpenFundTermIdDetail(
          'line-cancel-submit',
          {
            body: lineData,
          }
        );
        if (!handleOpenFundTermIdDetailRes) return false;
      }
      if (
        record.get('paymentPlanNum') &&
        (await getPaymentPlanConfig({
          sourceCode: 'ORDER',
          sourceDisplayNum: record.get('displayPoNum'),
          termNum: record.get('termsCode'),
        }))
      ) {
        return openTermsModal({ type: 'lineCancel', record }, lineData, modalProps);
      }
    }
    if (remote?.event) {
      const beforRes = await remote?.event?.fireEvent('cuxIsCloseFn', {
        type,
        record,
        loading,
        detailAllDs,
      });
      if (!beforRes) return false;
    }
    if (
      await remote.process('processCancelOrCloseModal', {
        modalProps,
        isCancel,
        record,
        lineData,
        reasonDs,
      })
    ) {
      Modal.open(modalProps);
    }
  };

  // 全部-明细Tab按行批量操作（取消/关闭）
  const handleBatchActionByLine = async (type) => {
    const reasonDs = new DataSet(reason());
    const isCancel = type === 'cancel';
    const { selected } = detailAllDs;
    const data = selected.map((i) => ({ ...i.toData(), ...reasonDs.toJSONData()[0] }));
    if (isCancel) {
      const validateRes = getResponse(await cancelValidatePayment(data));
      if (!validateRes) return false;
      const fundPlanValidCaccelRes = getResponse(await fundPlanValidCaccel({ body: data }));
      if (!fundPlanValidCaccelRes) return false;
    }
    const code = isCancel
      ? 'SODR.WORKSPACE_DETAILALL.CANCEL_MODAL'
      : 'SODR.WORKSPACE_DETAILALL.CLOSE_MODAL';
    const beforRes = await remote.event.fireEvent('beforBatchActionByLine', true, {
      type,
      detailAllDs,
      data,
    });
    if (!beforRes) return false;
    Modal.open({
      drawer: true,
      style: { width: 380 },
      title: isCancel
        ? intl.get('sodr.workspace.model.common.cancellationReason').d('取消原因')
        : intl.get('sodr.workspace.model.common.closingReason').d('关闭原因'),
      children: customizeForm(
        {
          code,
        },
        <Form dataSet={reasonDs} columns={1} labelLayout="float">
          <TextArea
            name="closeCancelRemark"
            placeholder={
              isCancel
                ? intl.get('sodr.workspace.view.message.cancellationReason').d('请输入取消原因')
                : intl.get('sodr.workspace.view.message.closingReason').d('请输入关闭原因')
            }
          />
        </Form>
      ),
      onOk: async () => {
        const remarkData = selected.map((i) => ({ ...i.toData(), ...reasonDs.toJSONData()[0] }));
        const status = await reasonDs.validate();
        if (!status) return false;
        const res = getResponse(
          await (isCancel ? cancelLine : closeLine)(remarkData, { customizeUnitCode: code })
        );
        if (res) {
          notification.success();
          detailAllDs.query();
          detailAllDs.unSelectAll();
          detailAllDs.clearCachedRecords();
        }
        return res;
      },
      afterClose: () => {
        reasonDs.reset();
      },
    });
  };

  // 建议操作
  const renderAction = ({ record, dataSet }) => {
    // 订单状态
    // const summaryStatusCode = record.get('summaryStatusCode');
    const poHeaderId = record.get('poHeaderId');
    const approvalBtns = renderUnderApprovalAction({ record, dataSet }).filter((i) => i);
    const operationList = record.get('operationList') || []; // 后端返回可执行操作
    // 操作按钮
    const defaultActions = [
      {
        key: 'COPY',
        code: 'srm.po-admin.po.order-workspace.ps.button.canceldetail.copy',
        button: (
          <Button
            wait={THROTTLE_TIME}
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => handleOrderCopy(poHeaderId)}
          >
            {intl.get('sodr.workspace.view.option.copy').d('复制')}
          </Button>
        ),
      },
      {
        key: 'EDIT',
        code: 'srm.po-admin.po.order-workspace.ps.button.wholetobesubmited.submit',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => goDetail(record, 'toBeSubmited')}
          >
            {intl.get('sodr.workspace.view.option.edit').d('编辑')}
          </Button>
        ),
      },
      // FEEDBACK: <a>{intl.get('sodr.workspace.view.option.toExamine').d('审核')}</a>,
      {
        key: 'PUBLISH',
        code: 'srm.po-admin.po.order-workspace.ps.button.wholetobereleased.release',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => goDetail(record, 'toBeReleased')}
          >
            {intl.get('sodr.workspace.view.option.release').d('发布')}
          </Button>
        ),
      },
      {
        key: 'FEEDBACK',
        code: 'srm.po-admin.po.order-workspace.ps.button.wholefdback.agree',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => goDetail(record, 'feedbackUnderReview')}
          >
            {intl.get('sodr.workspace.view.option.feedbackAudit').d('反馈审核')}
          </Button>
        ),
      },
      {
        key: 'CHANGE',
        code: 'srm.po-admin.po.order-workspace.ps.button.changedetail.submit',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => goDetail(record, 'change')}
          >
            {intl.get('sodr.workspace.view.option.change').d('变更')}
          </Button>
        ),
      },
      {
        key: 'CHANGE_EC',
        code: 'srm.po-admin.po.order-workspace.button.EC-change-detail.submit',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => goDetail(record, 'changeEC')}
          >
            {intl.get('sodr.workspace.view.option.change').d('变更')}
          </Button>
        ),
      },
      {
        key: 'CLOSE',
        code:
          redioKey === 'detail' && detailActiveKey === 'detailAll'
            ? 'srm.po-admin.po.order-workspace.ps.button.detailall.action.close'
            : 'srm.po-admin.po.order-workspace.ps.button.canceldetail.close',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() =>
              redioKey === 'detail' && detailActiveKey === 'detailAll'
                ? handleActionByLine('close', record)
                : goDetail(record, 'close')
            }
          >
            {intl.get('sodr.workspace.view.option.close').d('关闭')}
          </Button>
        ),
      },
      // operationRecord: <C7nOperationRecord poHeaderId={poHeaderId} />,
      {
        key: 'CANCEL',
        code:
          redioKey === 'detail' && detailActiveKey === 'detailAll'
            ? 'srm.po-admin.po.order-workspace.ps.button.detailall.action.cancel'
            : 'srm.po-admin.po.order-workspace.ps.button.canceldetail.cancel',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() =>
              redioKey === 'detail' && detailActiveKey === 'detailAll'
                ? handleActionByLine('cancel', record)
                : goDetail(record, 'cancel')
            }
          >
            {intl.get('sodr.workspace.view.option.cancel').d('取消')}
          </Button>
        ),
      },
      {
        key: 'RECALL',
        code: 'srm.po-admin.po.order-workspace.ps.button.changedetail.revoke',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => goDetail(record, 'revoke')}
          >
            {intl.get(`sodr.common.model.common.revoke`).d('撤销变更')}
          </Button>
        ),
      },
      {
        key: 'UNIFY_RECALL',
        code: 'srm.po-admin.po.order-workspace.button.canceldetail.unifyRecall',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => goDetail(record, 'unifyRecall')}
          >
            {intl.get(`sodr.common.model.common.unifyRecall`).d('撤销审批')}
          </Button>
        ),
      },
      {
        key: 'TERMINATE',
        code: 'srm.po-admin.po.order-workspace.button.cancelsigingdetail.terminate',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => goDetail(record, 'terminate')}
          >
            {intl.get(`sodr.common.view.button.terminate`).d('发起解约')}
          </Button>
        ),
      },
      {
        key: 'RETURN_NEW',
        code: 'srm.po-admin.po.order-workspace.button.return_new',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => handleCreateReturnNew(record)}
          >
            {intl.get(`sodr.common.view.button.return_new`).d('新建退货订单')}
          </Button>
        ),
      },
    ];
    const cuxDefaultActions = remote.process('actionsBtnsFx', defaultActions, {
      record,
      redioKey,
      detailActiveKey,
      goDetail,
      handleActionByLine,
    });

    // 过滤鉴权结果为隐藏的操作
    const actions = cuxDefaultActions.filter((i) => {
      const currenPer = permissions.find((n) => n.code === i.code) || {};
      return !(currenPer.controllerType === 'hidden' && !currenPer.approve);
    });

    const getOverlay = (items = []) => {
      return isEmpty(items) ? (
        false
      ) : (
        <Menu className={styles['render-action']}>
          {items.map((i) => (
            <Item>{i.button}</Item>
          ))}
        </Menu>
      );
    };

    // 剩余能执行操作 (最多展示三个按钮，超过放入更多操作)
    const canActions = actions.filter((i) => operationList.includes(i.key)) || [];
    // 更多操作
    const moreActions = canActions.filter((i, index) => ![0, 1].includes(index));
    // 审批与撤销审批按钮不受后端operationList控制
    if (!isEmpty(approvalBtns)) {
      approvalBtns.forEach((i) => {
        (canActions.length < 2 ? canActions : moreActions).push({ button: i });
      });
    }
    const overlay = () => getOverlay(moreActions);
    const moreAction =
      moreActions.length > 1 ? (
        <Dropdown overlay={overlay} trigger={['hover']}>
          <Button type="c7n-pro" funcType="link" color="primary">
            {intl.get('hzero.common.button.higherOptions').d('更多')}
            <Icon type="expand_more" />
          </Button>
        </Dropdown>
      ) : (
        moreActions[0]?.button
      );
    const btns = [canActions[0]?.button, canActions[1]?.button, moreAction];
    return isEmpty(btns.filter((i) => i)) ? null : btns;
  };

  // 审批中Tab操作列 (审批/撤销审批)
  const renderUnderApprovalAction = ({ record, dataSet }) => {
    const approvaFlags = dataSet.getState('approvaFlags');
    const operationFlags = dataSet.getState('operationFlags');
    const workFlowBusinessKey = record.get('workFlowBusinessKey');
    const approvaFlag = approvaFlags?.[workFlowBusinessKey];
    const operationFlag = operationFlags?.[workFlowBusinessKey];
    const { taskId, processInstanceId } = approvaFlag || {};
    const revokeApprovalPermission =
      permissions.find(
        (i) => i.code === 'srm.po-admin.po.order-workspace.button.revoke_approval'
      ) || {};
    const approvalPermission =
      permissions.find((i) => i.code === 'srm.po-admin.po.order-workspace.button.approval') || {};
    return [
      approvaFlags && approvaFlag && approvalPermission.approve && (
        <Button
          wait={THROTTLE_TIME}
          type="c7n-pro"
          funcType="link"
          color="primary"
          onClick={() => {
            openApproveModal({
              modalProps: {
                closable: true,
              },
              taskId,
              processInstanceId,
              onSuccess: () => {
                const currentDs = dsList.find((i) => i.key === activeKeys)?.ds;
                if (currentDs) {
                  currentDs.query();
                  currentDs.unSelectAll();
                  currentDs.clearCachedRecords();
                }
              },
            });
          }}
        >
          {intl.get('sodr.workspace.view.option.approval').d('审批')}
        </Button>
      ),
      operationFlags && operationFlag?.REVOKE && revokeApprovalPermission.approve && (
        <Button
          wait={THROTTLE_TIME}
          type="c7n-pro"
          funcType="link"
          color="primary"
          onClick={async () => {
            const res = await revokeWorkFlow(workFlowBusinessKey);
            if (res) {
              const currentDs = dsList.find((i) => i.key === activeKeys)?.ds;
              if (currentDs) {
                currentDs.query();
                currentDs.unSelectAll();
                currentDs.clearCachedRecords();
              }
            }
          }}
        >
          {intl.get('sodr.workspace.view.option.revokeApproval').d('撤销审批')}
        </Button>
      ),
    ];
  };

  const handleCreateReturnNew = async (record) => {
    const isBatchLine = isArrayLike(record);
    if (isBatchLine) detailAllDs.status = 'submitting';
    const res = getResponse(
      await (isBatchLine
        ? createReturnPoNewByLine(record.map((i) => i.toData()))
        : createReturnPoNew(record.toData()))
    );
    if (isBatchLine) detailAllDs.status = 'ready';
    if (res) {
      const { poHeaderId } = res;
      goCreateManually(poHeaderId);
    }
  };

  const viewDetail = ({ record, dataSet }) => {
    const simpleApprovalHistoryData = dataSet.getState('simpleApprovalHistoryData') || {};
    return (
      <ApproveRecordSimple data={simpleApprovalHistoryData[record.get('workFlowBusinessKey')]} />
    );
  };

  const goDetail = (record, key, searchParams = {}) => {
    const poHeaderId = record.get('poHeaderId');
    const poSourcePlatform = record.get('poSourcePlatform');
    const sourceBillTypeCode = record.get('sourceBillTypeCode');
    let pathname;
    let pathParams = {};
    switch (key) {
      case 'toBeSubmited':
        if (poSourcePlatform === 'CATALOGUE') {
          pathname = `/sodr/order-workspace/detail/catalogue-request/${poHeaderId}`;
        } else if (poSourcePlatform === 'E-COMMERCE') {
          pathname = `/sodr/order-workspace/detail/ecommerce-request/${poHeaderId}`;
        } else {
          // SRM || SHOP || ERP
          const pathConfig = [
            {
              source: 'PURCHASE_ORDER',
              path: `/sodr/order-workspace/detail/created-manually/${poHeaderId}`,
            },
            {
              source: 'PURCHASE_REQUEST',
              path: `/sodr/order-workspace/detail/purchase-request/${poHeaderId}`,
            },
            {
              source: 'SOURCE',
              path: `/sodr/order-workspace/detail/sourcing-results/${poHeaderId}`,
            },
            {
              source: 'CONTRACT_ORDER',
              path: `/sodr/order-workspace/detail/purchase-agreement/${poHeaderId}`,
            },
          ];
          pathname = (pathConfig.find((i) => i.source === sourceBillTypeCode) || {}).path;
        }
        break;
      case 'underApproval':
        pathname = `/sodr/order-workspace/detail/under-approval/${poHeaderId}`;
        break;
      case 'toBeReleased':
        pathname = `/sodr/order-workspace/detail/to-be-released/${poHeaderId}`;
        break;
      case 'toBeSigned':
        pathname = `/sodr/order-workspace/detail/to-be-signed/${poHeaderId}`;
        break;
      case 'feedbackUnderReview':
        pathname = `/sodr/order-workspace/detail/feedback-under-review/${poHeaderId}`;
        break;
      case 'detailAll':
        pathname = `/sodr/order-workspace/detail/all-orders/${poHeaderId}`;
        break;
      case 'detailFeedback':
        pathname = `/sodr/order-workspace/detail/feedback-under-review/${poHeaderId}`;
        break;
      case 'all':
        pathname = routerPath.includes('pub')
          ? `/pub/sodr/order-workspace/detail/all-orders/${poHeaderId}`
          : `/sodr/order-workspace/detail/all-orders/${poHeaderId}`;
        break;
      case 'cancel':
        pathname = `/sodr/order-workspace/detail/cancel/${poHeaderId}`;
        pathParams = { action: key };
        break;
      case 'close':
        pathname = `/sodr/order-workspace/detail/cancel/${poHeaderId}`;
        pathParams = { action: key };
        break;
      case 'change':
        pathname = `/sodr/order-workspace/detail/change/${poHeaderId}`;
        break;
      case 'changeEC':
        pathname = `/sodr/order-workspace/detail/e-commerce-change/${poHeaderId}`;
        break;
      case 'revoke':
        pathname = `/sodr/order-workspace/detail/cancel/${poHeaderId}`;
        pathParams = { action: key };
        break;
      case 'unifyRecall':
        pathname = `/sodr/order-workspace/detail/cancel/${poHeaderId}`;
        pathParams = { action: key };
        break;
      case 'terminate':
        pathname = `/sodr/order-workspace/detail/cancel/${poHeaderId}`;
        pathParams = { action: key };
        break;
      default:
    }
    if (!pathname) return;
    const searchObj = stringify({ ...pathParams, ...searchParams });
    history.push({ pathname, search: searchObj });
  };

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
          // code="SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.BOM"
        />
      ),
    });
  };

  /**
   * 执行单据-关联订单状态
   * @param {*} record
   * @returns
   */
  const fetchLineDetail = (record) => {
    const {
      poLineLocationId,
      displayPoNum,
      displayLineNum,
      displayLineLocationNum,
      quantity,
    } = record.get([
      'poLineLocationId',
      'displayPoNum',
      'displayLineNum',
      'displayLineLocationNum',
      'quantity',
    ]);
    return Modal.open({
      key: Modal.key(),
      drawer: true,
      // title: intl.get('sodr.workspace.modal.contectDoc').d('关联单据'),
      title: `${displayPoNum}-${displayLineNum}-${displayLineLocationNum}-${intl
        .get('sodr.workspace.model.common.quantity')
        .d('数量')}:${quantity}`,
      bodyStyle: { padding: 0 },
      children: (
        <AssociatedDocument
          {...{
            activeDocKey,
            customizeTable,
            poLineLocationId,
            currentRecord: record,
            record,
            customizeTabPane,
          }}
        />
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onClose: () => {
        history.push({
          pathname: `/sodr/order-workspace/list`,
        });
      },
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
      style: { width: '1090px' },
    });
  };
  const handleImportStatus = (record) => {
    Modal.open({
      key: Modal.key(),
      title: intl.get(`sodr.workspace.modal.detailStatus`).d('状态明细'),
      drawer: true,
      destroyOnClose: true,
      style: { width: 800 },
      children: <ImportModal currentRecord={record} />,
      onOk: () => {},
      okText: intl.get('hzero.common.button.close').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };

  const handleImportDetailStatus = (record) => {
    Modal.open({
      key: Modal.key(),
      title: intl.get(`sodr.workspace.modal.detailStatus`).d('状态明细'),
      drawer: true,
      destroyOnClose: true,
      style: { width: 800 },
      children: <ImportDetailModal currentRecord={record} />,
      onOk: () => {},
      okText: intl.get('hzero.common.button.close').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };

  // 执行状态展示（发货状态｜接收状态｜对账状态｜开票状态）
  const renderExecutionStatus = ({ value, record, name }) => {
    const meaning = record.get(`${name}Meaning`);
    if (!(value && meaning)) return null;
    return (
      <StatusTag
        color={value === 'NOT_STARTED' ? 'gray' : value === 'FINISHED' ? 'green' : 'yellow'}
        // style={{ verticalAlign: 'text-top' }}
      >
        {record.get(`${name}Meaning`)}
      </StatusTag>
    );
  };

  const getColumns = (key) => {
    let columns = [];
    switch (key) {
      case 'underApproval':
        columns = [
          {
            name: 'statusCode',
            width: 100,
            renderer: ({ record }) =>
              renderStatus(record.get('statusCode'), record.get('statusCodeMeaning')),
          },
          {
            name: 'aiPreReview',
            width: 120,
            renderer: ({ record }) => renderAiPreReview({ record }),
          },
          {
            name: 'action',
            width: 160,
            align: 'left',
            renderer: renderUnderApprovalAction,
            className: classNames(
              styles[tabAggregation[key] ? 'aggregation-action-columns' : 'action-columns']
            ),
          },
          {
            key: 'orderInfo',
            aggregation: true,
            align: 'left',
            width: 190,
            aggregationLimit: 4,
            header: intl.get('sodr.workspace.model.common.numInfo').d('订单信息'),
            children: [
              {
                name: 'displayPoNum',
                width: 200,
                renderer: ({ value, record }) => (
                  <a onClick={() => goDetail(record, key)}>{value}</a>
                ),
              },
              {
                name: 'poTypeId',
                width: 200,
                renderer: ({ record }) => record.get('poTypeCodeMeaning'),
              },
              {
                name: 'releaseNum',
                width: 200,
              },
              {
                name: 'remark',
                width: 200,
              },
            ],
          },
          {
            name: 'viewDetail',
            width: 150,
            renderer: viewDetail,
            tooltip: 'none',
          },
          {
            key: 'supplierInfo',
            align: 'left',
            width: 200,
            header: intl.get('sodr.workspace.model.common.supplierInfo').d('供应商信息'),
            aggregation: true,
            children: [
              {
                name: 'supplierName',
                width: 230,
              },
              {
                name: 'supplierCode',
                width: 160,
              },
              {
                name: 'supplierSiteName',
                width: 200,
              },
            ],
          },
          {
            key: 'organizInfo',
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            width: 200,
            header: intl.get('sodr.workspace.model.common.organizInfo').d('组织信息'),
            children: [
              {
                name: 'companyId',
                width: 200,
                renderer: ({ record }) => record.get('companyName'),
              },
              {
                name: 'ouId',
                width: 200,
                renderer: ({ record }) => record.get('orgName'),
              },
              {
                name: 'purchaseOrgId',
                width: 200,
                renderer: ({ record }) => record.get('purOrganizationName'),
              },
              {
                name: 'agentId',
                width: 150,
                renderer: ({ record }) => record.get('agentName'),
              },
            ],
          },
          {
            key: 'receiptReceiptInfo',
            align: 'left',
            header: intl.get('sodr.workspace.model.common.receiptReceiptInfo').d('收货/收单信息'),
            aggregation: true,
            children: [
              {
                name: 'shipToLocationAddress',
                width: 160,
              },
              {
                name: 'billToLocationAddress',
                width: 160,
              },
            ],
          },
          {
            key: 'amountInfo',
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            width: 170,
            header: intl.get('sodr.workspace.model.common.amountInfo').d('金额信息'),
            children: [
              {
                name: 'taxIncludeAmount',
                width: 150,
                renderer: useAmountRender(null, { bySourceCode }),
              },
              {
                name: 'amount',
                width: 150,
                renderer: useAmountRender(null, { bySourceCode }),
              },
              {
                name: 'currencyCode',
                width: 100,
              },
            ],
          },
          {
            key: 'sourceInfo',
            align: 'left',
            width: 130,
            header: intl.get('sodr.workspace.model.common.sourceInfo').d('来源信息'),
            aggregation: true,
            aggregationLimit: 4,
            children: [
              {
                name: 'sourceBillTypeCode',
                width: 200,
                renderer: ({ record }) => record.get('sourceBillTypeCodeMeaning'),
              },
              {
                name: 'poSourcePlatform',
                width: 100,
                renderer: ({ record }) => record.get('poSourcePlatformMeaning'),
              },
            ],
          },
          {
            key: 'createInfo',
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            width: 190,
            header: intl.get('sodr.workspace.model.common.createInfo').d('创建信息'),
            children: [
              {
                name: 'realName',
                width: 120,
              },
              {
                name: 'creationDate',
                width: 150,
              },
            ],
          },
        ];
        break;
      case 'toBeReleased':
        columns = [
          {
            name: 'statusCode',
            width: 100,
            renderer: ({ record }) =>
              renderStatus(record.get('statusCode'), record.get('statusCodeMeaning')),
          },
          {
            key: 'orderInfo',
            aggregation: true,
            align: 'left',
            width: 190,
            header: intl.get('sodr.workspace.model.common.numInfo').d('订单信息'),
            children: [
              {
                name: 'displayPoNum',
                width: 200,
                renderer: ({ value, record }) => (
                  <a onClick={() => goDetail(record, key)}>{value}</a>
                ),
              },
              {
                name: 'poTypeId',
                width: 200,
                renderer: ({ record }) => record.get('poTypeCodeMeaning'),
              },
              {
                name: 'displayReleaseNum',
                width: 200,
              },
              {
                name: 'remark',
                width: 200,
              },
            ],
          },
          {
            key: 'supplierInfo',
            align: 'left',
            width: 200,
            header: intl.get('sodr.workspace.model.common.supplierInfo').d('供应商信息'),
            aggregation: true,
            children: [
              {
                name: 'supplierName',
                width: 200,
              },
              {
                name: 'supplierCode',
                width: 160,
              },
              {
                name: 'supplierSiteName',
                width: 200,
              },
            ],
          },
          {
            key: 'organizInfo',
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            width: 200,
            header: intl.get('sodr.workspace.model.common.organizInfo').d('组织信息'),
            children: [
              {
                name: 'companyId',
                width: 200,
                renderer: ({ record }) => record.get('companyName'),
              },
              {
                name: 'ouId',
                width: 260,
                renderer: ({ record }) => record.get('orgName'),
              },
              {
                name: 'purchaseOrgId',
                width: 200,
                renderer: ({ record }) => record.get('purOrganizationName'),
              },
              {
                name: 'agentId',
                width: 150,
                renderer: ({ record }) => record.get('agentName'),
              },
            ],
          },
          {
            key: 'receiptReceiptInfo',
            align: 'left',
            header: intl.get('sodr.workspace.model.common.receiptReceiptInfo').d('收货/收单信息'),
            aggregation: true,
            children: [
              {
                name: 'shipToLocationAddress',
                width: 160,
              },
              {
                name: 'billToLocationAddress',
                width: 160,
              },
            ],
          },
          {
            key: 'amountInfo',
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            width: 170,
            header: intl.get('sodr.workspace.model.common.amountInfo').d('金额信息'),
            children: [
              {
                name: 'taxIncludeAmount',
                width: 200,
                renderer: useAmountRender(null, { bySourceCode }),
              },
              {
                name: 'amount',
                width: 200,
                renderer: useAmountRender(null, { bySourceCode }),
              },
              {
                name: 'currencyCode',
                width: 200,
              },
            ],
          },
          {
            key: 'sourceInfo',
            align: 'left',
            width: 130,
            header: intl.get('sodr.workspace.model.common.sourceInfo').d('来源信息'),
            aggregation: true,
            aggregationLimit: 4,
            children: [
              {
                name: 'sourceBillTypeCode',
                width: 200,
                renderer: ({ record }) => record.get('sourceBillTypeCodeMeaning'),
              },
              {
                name: 'poSourcePlatform',
                width: 200,
                renderer: ({ record }) => record.get('poSourcePlatformMeaning'),
              },
            ],
          },
          {
            key: 'createInfo',
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            width: 190,
            header: intl.get('sodr.workspace.model.common.createInfo').d('创建信息'),
            children: [
              {
                name: 'realName',
                width: 200,
              },
              {
                name: 'creationDate',
                width: 200,
              },
            ],
          },
        ];
        break;
      case 'toBeSigned':
        columns = [
          {
            name: 'statusCode',
            width: 130,
            renderer: ({ record }) =>
              renderStatus(record.get('statusCode'), record.get('statusCodeMeaning')),
          },
          {
            key: 'orderInfo',
            aggregation: true,
            align: 'left',
            width: 190,
            aggregationLimit: 4,
            header: intl.get('sodr.workspace.model.common.numInfo').d('订单信息'),
            children: [
              {
                name: 'displayPoNum',
                width: 200,
                renderer: ({ value, record }) => (
                  <a onClick={() => goDetail(record, key)}>{value}</a>
                ),
              },
              {
                name: 'poTypeId',
                width: 200,
                renderer: ({ record }) => record.get('poTypeCodeMeaning'),
              },
              {
                name: 'displayReleaseNum',
                width: 200,
              },
              {
                name: 'electricSignFlag',
                width: 150,
                renderer: ({ value }) => yesOrNoRender(value),
              },
              {
                name: 'electricSignStatus',
                width: 150,
                renderer: ({ record }) =>
                  renderStatus(
                    record.get('electricSignStatus'),
                    record.get('electricSignStatusMeaning')
                  ),
              },
              {
                name: 'terminateSignStatus',
                width: 150,
                renderer: ({ record }) =>
                  renderStatus(
                    record.get('terminateSignStatus'),
                    record.get('terminateSignStatusMeaning')
                  ),
              },
              {
                name: 'remark',
                width: 200,
              },
            ],
          },
          {
            key: 'supplierInfo',
            align: 'left',
            width: 200,
            header: intl.get('sodr.workspace.model.common.supplierInfo').d('供应商信息'),
            aggregation: true,
            children: [
              {
                name: 'supplierName',
                width: 260,
              },
              {
                name: 'supplierCode',
                width: 160,
              },
              {
                name: 'supplierSiteName',
                width: 200,
              },
            ],
          },
          {
            key: 'organizInfo',
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            width: 200,
            header: intl.get('sodr.workspace.model.common.organizInfo').d('组织信息'),
            children: [
              {
                name: 'companyId',
                width: 200,
                renderer: ({ record }) => record.get('companyName'),
              },
              {
                name: 'ouId',
                width: 260,
                renderer: ({ record }) => record.get('orgName'),
              },
              {
                name: 'purchaseOrgId',
                width: 200,
                renderer: ({ record }) => record.get('purOrganizationName'),
              },
              {
                name: 'agentId',
                width: 200,
                renderer: ({ record }) => record.get('agentName'),
              },
            ],
          },
          {
            key: 'receiptReceiptInfo',
            align: 'left',
            header: intl.get('sodr.workspace.model.common.receiptReceiptInfo').d('收货/收单信息'),
            aggregation: true,
            children: [
              {
                name: 'shipToLocationAddress',
                width: 160,
              },
              {
                name: 'billToLocationAddress',
                width: 160,
              },
            ],
          },
          {
            key: 'amountInfo',
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            width: 170,
            header: intl.get('sodr.workspace.model.common.amountInfo').d('金额信息'),
            children: [
              {
                name: 'taxIncludeAmount',
                width: 200,
                renderer: useAmountRender(null, { bySourceCode }),
              },
              {
                name: 'amount',
                width: 200,
                renderer: useAmountRender(null, { bySourceCode }),
              },
              {
                name: 'currencyCode',
                width: 200,
              },
            ],
          },
          {
            key: 'sourceInfo',
            align: 'left',
            width: 130,
            header: intl.get('sodr.workspace.model.common.sourceInfo').d('来源信息'),
            aggregation: true,
            aggregationLimit: 4,
            children: [
              {
                name: 'sourceBillTypeCode',
                width: 200,
                renderer: ({ record }) => record.get('sourceBillTypeCodeMeaning'),
              },
              {
                name: 'poSourcePlatform',
                width: 200,
                renderer: ({ record }) => record.get('poSourcePlatformMeaning'),
              },
            ],
          },
          {
            key: 'createInfo',
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            width: 190,
            header: intl.get('sodr.workspace.model.common.createInfo').d('创建信息'),
            children: [
              {
                name: 'realName',
                width: 200,
              },
              {
                name: 'creationDate',
                width: 200,
              },
            ],
          },
        ];
        break;
      case 'feedbackUnderReview':
        columns = [
          {
            name: 'statusCode',
            width: 130,
            renderer: ({ record }) =>
              renderStatus(record.get('statusCode'), record.get('statusCodeMeaning')),
          },
          {
            key: 'orderInfo',
            aggregation: true,
            align: 'left',
            width: 190,
            aggregationLimit: 4,
            header: intl.get('sodr.workspace.model.common.numInfo').d('订单信息'),
            children: [
              {
                name: 'displayPoNum',
                width: 200,
                renderer: ({ value, record }) => {
                  const { urgentFlag, msgNum } = record.get(['urgentFlag', 'msgNum']);
                  return (
                    <Fragment>
                      <a onClick={() => goDetail(record, key)}>{value}</a>
                      {urgentFlag && Number(urgentFlag) ? (
                        <Tooltip
                          title={intl.get(`sodr.workspace.view.tooltip.urgent`).d('订单加急')}
                        >
                          <Icon type="flash_on" className={styles['row-agent-column-icon']} />
                        </Tooltip>
                      ) : null}
                      {msgNum > 0 ? (
                        <Tooltip
                          title={intl
                            .get('sodr.workspace.view.tooltip.unreadMessages', {
                              msgNum: msgNum > 99 ? '99+' : msgNum,
                            })
                            .d('{msgNum}条在线沟通消息未读')}
                        >
                          <Icon type="notifications" className={styles['row-agent-column-icon']} />
                        </Tooltip>
                      ) : null}
                    </Fragment>
                  );
                },
              },
              {
                name: 'poTypeId',
                width: 200,
                renderer: ({ record }) => record.get('poTypeCodeMeaning'),
              },
              {
                name: 'displayReleaseNum',
                width: 200,
              },
              { name: 'electricSignFlag', width: 150 },
              {
                name: 'electricSignStatus',
                width: 150,
                renderer: ({ record }) =>
                  renderStatus(
                    record.get('electricSignStatus'),
                    record.get('electricSignStatusMeaning')
                  ),
              },
              {
                name: 'remark',
                width: 200,
              },
            ],
          },
          {
            key: 'supplierInfo',
            align: 'left',
            width: 200,
            header: intl.get('sodr.workspace.model.common.supplierInfo').d('供应商信息'),
            aggregation: true,
            children: [
              {
                width: 200,
                name: 'supplierName',
              },
              {
                name: 'supplierCode',
                width: 160,
              },
              {
                name: 'supplierSiteName',
                width: 200,
              },
            ],
          },
          {
            key: 'organizInfo',
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            width: 200,
            header: intl.get('sodr.workspace.model.common.organizInfo').d('组织信息'),
            children: [
              {
                name: 'companyId',
                width: 200,
                renderer: ({ record }) => record.get('companyName'),
              },
              {
                name: 'ouId',
                width: 200,
                renderer: ({ record }) => record.get('orgName'),
              },
              {
                name: 'purchaseOrgId',
                width: 200,
                renderer: ({ record }) => record.get('purOrganizationName'),
              },
              {
                name: 'agentId',
                width: 150,
                renderer: ({ record }) => record.get('agentName'),
              },
            ],
          },
          {
            key: 'receiptReceiptInfo',
            align: 'left',
            header: intl.get('sodr.workspace.model.common.receiptReceiptInfo').d('收货/收单信息'),
            aggregation: true,
            children: [
              {
                name: 'shipToLocationAddress',
                width: 160,
              },
              {
                name: 'billToLocationAddress',
                width: 160,
              },
            ],
          },
          {
            key: 'amountInfo',
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            width: 170,
            header: intl.get('sodr.workspace.model.common.amountInfo').d('金额信息'),
            children: [
              {
                name: 'taxIncludeAmount',
                width: 150,
                renderer: useAmountRender(null, { bySourceCode }),
              },
              {
                name: 'amount',
                width: 150,
                renderer: useAmountRender(null, { bySourceCode }),
              },
              {
                name: 'currencyCode',
                width: 100,
              },
            ],
          },
          {
            key: 'sourceInfo',
            align: 'left',
            width: 130,
            header: intl.get('sodr.workspace.model.common.sourceInfo').d('来源信息'),
            aggregation: true,
            aggregationLimit: 4,
            children: [
              {
                name: 'sourceBillTypeCode',
                width: 150,
                renderer: ({ record }) => record.get('sourceBillTypeCodeMeaning'),
              },
              {
                name: 'poSourcePlatform',
                width: 100,
                renderer: ({ record }) => record.get('poSourcePlatformMeaning'),
              },
            ],
          },
          {
            key: 'creatTimeInfo',
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            width: 190,
            header: intl.get('sodr.workspace.model.common.creatTimeInfo').d('创建/时间信息'),
            children: [
              {
                name: 'realName',
                width: 120,
              },
              {
                name: 'creationDate',
                width: 150,
              },
              {
                name: 'releasedDate',
                width: 150,
              },
              {
                name: 'feedbackDate',
                width: 150,
              },
            ],
          },
        ];
        break;
      case 'all':
        columns = [
          {
            name: 'noExit',
            width: 50,
            renderer: ({ record }) => {
              const getIMRequestBody = {
                ...record.data,
                unreadCount: record.data.unreadCount === undefined ? 0 : record.data.unreadCount,
                ouName: record.data.orgName,
              };
              return [
                'PUBLISHED',
                'PART_FEED_BACK',
                // 'DELIVERY_DATE_REVIEW',
                'DELIVERY_DATE_REJECT',
                'CANCELTOBECOMFIRMED',
                'CLOSETOBECOMFIRMED',
              ].includes(record.get('statusCode')) ? (
                // 已发布、部分反馈、订单反馈审核拒绝、取消待确认、关闭待确认的订单发送“订单确认卡片”
                <IMChatDraggable
                  cardCode="PO_CONFIRM_DETAIL"
                  icon="baseline-drag_indicator"
                  tooltip=""
                  requestBody={getIMRequestBody}
                  dragText={`订单${record.get('displayPoNum')}`}
                />
              ) : (
                <IMChatDraggable
                  cardCode="PO_RECEIVE_DETAIL"
                  icon="baseline-drag_indicator"
                  tooltip=""
                  requestBody={getIMRequestBody}
                  dragText={`订单${record.get('displayPoNum')}`}
                />
              );
            },
          },
          {
            name: 'statusCode',
            width: 100,
            renderer: ({ record }) =>
              renderStatus(record.get('statusCode'), record.get('statusCodeMeaning')),
          },
          {
            name: 'action',
            width: 160,
            align: 'left',
            renderer: renderAction,
            className: classNames(
              styles[tabAggregation[key] ? 'aggregation-action-columns' : 'action-columns']
            ),
          },
          {
            key: 'orderInfo',
            aggregation: true,
            align: 'left',
            width: 190,
            aggregationLimit: 4,
            header: intl.get('sodr.workspace.model.common.numInfo').d('订单信息'),
            children: [
              {
                name: 'displayPoNum',
                width: 200,
                renderer: ({ value, record }) => {
                  const {
                    createSyncStatus,
                    createSyncResponseMsg,
                    deliverySyncStatus,
                    deliverySyncResponseMsg,
                    urgentFlag,
                    beyondQuantity,
                    unreadCount,
                    changeSyncStatus,
                    msgNum,
                  } = record.get([
                    'createSyncStatus',
                    'createSyncResponseMsg',
                    'deliverySyncStatus',
                    'deliverySyncResponseMsg',
                    'urgentFlag',
                    'beyondQuantity',
                    'unreadCount',
                    'changeSyncStatus',
                    'msgNum',
                  ]);
                  return (
                    <Fragment>
                      <a onClick={() => goDetail(record, key)}>{value}</a>
                      {createSyncStatus === 'FAIL' ? (
                        <Tooltip title={createSyncResponseMsg}>
                          <Icon type="archive" className={styles['row-agent-column-icon']} />
                        </Tooltip>
                      ) : null}
                      {deliverySyncStatus === 'FAIL' ? (
                        <Tooltip
                          title={
                            intl
                              .get(`sodr.common.view.message.orderFeedbackMsg`)
                              .d('ERP订单承诺交货日期同步失败：失败原因') +
                            (deliverySyncResponseMsg || '')
                          }
                        >
                          <Icon type="archive" className={styles['row-agent-column-icon']} />
                        </Tooltip>
                      ) : null}
                      {urgentFlag === 1 ? (
                        <Tooltip
                          title={intl.get(`sodr.workspace.view.tooltip.urgent`).d('订单加急')}
                        >
                          <Icon type="flash_on" className={styles['row-agent-column-icon']} />
                        </Tooltip>
                      ) : null}
                      {beyondQuantity > 0 ? (
                        <Tooltip
                          title={intl.get(`sodr.workspace.view.tooltip.yanqiImg`).d(`订单超期`)}
                        >
                          <Icon type="hourglass_full" className={styles['row-agent-column-icon']} />
                        </Tooltip>
                      ) : null}
                      {unreadCount ? (
                        <Tooltip
                          title={intl
                            .get(`sodr.workspace.view.tooltip.unreadCount`, {
                              num: unreadCount,
                            })
                            .d(`{num}条留言板消息未读`)}
                        >
                          <Icon type="contact_mail" className={styles['row-agent-column-icon']} />
                        </Tooltip>
                      ) : null}
                      {changeSyncStatus === 'FAIL' ? (
                        <Tooltip title={record.get('changeSyncResponseMsg')}>
                          <Icon type="archive" className={styles['row-agent-column-icon']} />
                        </Tooltip>
                      ) : null}
                      {msgNum > 0 ? (
                        <Tooltip
                          title={intl
                            .get('sodr.workspace.view.tooltip.unreadMessages', {
                              msgNum: msgNum > 99 ? '99+' : msgNum,
                            })
                            .d('{msgNum}条在线沟通消息未读')}
                        >
                          <Icon type="notifications" className={styles['row-agent-column-icon']} />
                        </Tooltip>
                      ) : null}
                    </Fragment>
                  );
                },
              },
              {
                name: 'poTypeId',
                width: 200,
                renderer: ({ record }) => record.get('poTypeCodeMeaning'),
              },
              {
                name: 'displayReleaseNum',
                width: 200,
              },
              {
                name: 'poNum',
                width: 150,
              },
              { name: 'electricSignFlag', width: 150 },
              {
                name: 'electricSignStatus',
                width: 150,
                renderer: ({ record }) =>
                  renderStatus(
                    record.get('electricSignStatus'),
                    record.get('electricSignStatusMeaning')
                  ),
              },
              {
                name: 'terminateSignStatus',
                width: 150,
                renderer: ({ record }) =>
                  renderStatus(
                    record.get('terminateSignStatus'),
                    record.get('terminateSignStatusMeaning')
                  ),
              },
              {
                name: 'remark',
                width: 200,
              },
            ],
          },
          {
            key: 'supplierInfo',
            align: 'left',
            width: 200,
            header: intl.get('sodr.workspace.model.common.supplierInfo').d('供应商信息'),
            aggregation: true,
            children: [
              {
                width: 200,
                name: 'supplierName',
              },
              {
                name: 'supplierCode',
                width: 160,
              },
              {
                name: 'supplierSiteName',
                width: 200,
              },
            ],
          },
          {
            key: 'organizInfo',
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            width: 200,
            header: intl.get('sodr.workspace.model.common.organizInfo').d('组织信息'),
            children: [
              {
                name: 'companyId',
                width: 200,
                renderer: ({ record }) => record.get('companyName'),
              },
              {
                name: 'ouId',
                width: 200,
                renderer: ({ record }) => record.get('orgName'),
              },
              {
                name: 'purchaseOrgId',
                width: 200,
                renderer: ({ record }) => record.get('purOrganizationName'),
              },
              {
                name: 'agentId',
                width: 200,
                renderer: ({ record }) => record.get('agentName'),
              },
            ],
          },
          {
            key: 'receiptReceiptInfo',
            align: 'left',
            header: intl.get('sodr.workspace.model.common.receiptReceiptInfo').d('收货/收单信息'),
            aggregation: true,
            children: [
              {
                name: 'shipToLocationAddress',
                width: 160,
              },
              {
                name: 'billToLocationAddress',
                width: 160,
              },
            ],
          },
          {
            key: 'amountInfo',
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            width: 170,
            header: intl.get('sodr.workspace.model.common.amountInfo').d('金额信息'),
            children: [
              {
                name: 'taxIncludeAmount',
                width: 150,
                renderer: useAmountRender(null, { bySourceCode }),
              },
              {
                name: 'amount',
                width: 150,
                renderer: useAmountRender(null, { bySourceCode }),
              },
              {
                name: 'currencyCode',
                width: 150,
              },
            ],
          },
          {
            key: 'sourceInfo',
            align: 'left',
            width: 130,
            header: intl.get('sodr.workspace.model.common.sourceInfo').d('来源信息'),
            aggregation: true,
            aggregationLimit: 4,
            children: [
              {
                name: 'sourceBillTypeCode',
                width: 150,
                renderer: ({ record }) => record.get('sourceBillTypeCodeMeaning'),
              },
              {
                name: 'poSourcePlatform',
                width: 150,
                renderer: ({ record }) => record.get('poSourcePlatformMeaning'),
              },
            ],
          },
          {
            key: 'creatTimeInfo',
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            width: 190,
            header: intl.get('sodr.workspace.model.common.creatTimeInfo').d('创建/时间信息'),
            children: [
              {
                name: 'realName',
                width: 200,
              },
              {
                name: 'releasedDate',
                width: 200,
              },
              {
                name: 'creationDate',
                width: 200,
              },
            ],
          },
          {
            name: 'exportErpFlag',
            width: 150,
            renderer: ({ record, value }) => {
              if (value) {
                const meaning = record.get(`exportErpFlagMeaning`);
                return (
                  <StatusTag
                    color={value ? (value === 'SUCCESS' ? 'green' : 'red') : 'blue'}
                    onClick={() => handleImportStatus(record)}
                  >
                    {meaning}
                    <Icon type="wysiwyg" />
                  </StatusTag>
                );
              }
            },
          },
          {
            name: 'syncSupplierStatus',
            width: 150,
            renderer: ({ value, record }) => {
              if (value) {
                return renderExportVendorSystemStatus(value, record);
              } else {
                return false;
              }
            },
          },
        ];
        break;
      case 'detailAll':
        columns = [
          {
            name: 'displayStatusCode',
            width: 80,
            renderer: ({ record }) =>
              renderStatus(record.get('displayStatusCode'), record.get('displayStatusMeaning')),
          },
          {
            name: 'action',
            width: 80,
            renderer: renderAction,
            className: classNames(
              styles[tabAggregation[key] ? 'aggregation-action-columns' : 'action-columns']
            ),
          },
          {
            key: 'orderInfo',
            aggregation: true,
            aggregationLimit: 4,
            align: 'left',
            width: 190,
            header: intl.get('sodr.workspace.model.common.numInfo').d('订单信息'),
            children: [
              {
                name: 'displayPoNum',
                width: 170,
                renderer: ({ value, record }) => (
                  <Fragment>
                    <a onClick={() => goDetail(record, key)}>
                      {`${value}-${record.get('displayLineNum')}`}
                    </a>
                    {record.get('deliverySyncStatus') === 'FAIL' ? (
                      <Tooltip
                        title={
                          intl
                            .get(`sodr.common.view.message.erpDetailFeedbackMsg`)
                            .d('ERP订单承诺交货日期同步失败：失败原因') +
                          (record.get('deliverySyncResponseMsg') || '')
                        }
                      >
                        <Icon type="archive" className={styles['row-agent-column-icon']} />
                      </Tooltip>
                    ) : null}
                    {record.get('urgentFlag') === 1 ? (
                      <Tooltip
                        title={intl.get(`sodr.workspace.view.tooltip.orderUrgent`).d('订单加急')}
                      >
                        <Icon type="flash_on" className={styles['row-agent-column-icon']} />
                      </Tooltip>
                    ) : null}
                    {record.get('beyondQuantity') > 0 ? (
                      <Tooltip
                        title={intl
                          .get(`sodr.workspace.view.tooltip.orderDelayDays`, {
                            num: moment(new Date()).diff(record.get('promiseDeliveryDate'), 'days'),
                          })
                          .d(`订单超期{num}天，请及时安排送货！`)}
                      >
                        <Icon type="hourglass_full" className={styles['row-agent-column-icon']} />
                      </Tooltip>
                    ) : null}
                  </Fragment>
                ),
              },
              {
                name: 'displayLineLocationNum',
              },
              {
                name: 'orderTypeCode',
                width: 150,
                renderer: ({ record }) => record.get('orderTypeName'),
              },
              {
                name: 'versionNum',
                width: 80,
              },
              {
                name: 'releaseNum',
                width: 150,
              },
              {
                name: 'checkContectDoc',
                width: 80,
                hidden: displayDocAndDocFlow.displayDoc !== '1',
                renderer: ({ record }) => {
                  return (
                    <a onClick={() => fetchLineDetail(record)}>
                      {intl.get('sodr.workspace.modal.checkContectDoc').d('查看执行单据')}
                    </a>
                  );
                },
              },
              {
                name: 'headerRemark',
                width: 200,
              },
            ],
          },
          {
            key: 'supplierInfo',
            align: 'left',
            width: 200,
            header: intl.get('sodr.workspace.model.common.supplierInfo').d('供应商信息'),
            aggregation: true,
            children: [
              {
                name: 'supplierName',
                width: 200,
              },
              {
                name: 'supplierCode',
                width: 120,
              },
              {
                name: 'supplierSiteName',
                width: 150,
              },
            ],
          },
          {
            key: 'materialInfo',
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            width: 170,
            header: intl.get('sodr.workspace.model.common.materialInfo').d('物料信息'),
            children: [
              {
                name: 'itemCode',
                width: 200,
              },
              {
                name: 'itemName',
                width: 200,
              },
              {
                name: 'categoryName',
                width: 200,
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
              doubleUnitEnabled && {
                name: 'secondaryQuantity',
                width: 200,
                renderer: ({ record, value }) =>
                  useQuantityRender(record, 'secondaryUomPrecision')({ record, value }),
              },
              doubleUnitEnabled && {
                name: 'secondaryUomCodeAndName',
                width: 150,
              },
              {
                name: 'quantity',
                width: 200,
                renderer: ({ record, value }) => useQuantityRender(record)({ record, value }),
              },
              {
                name: 'uomCodeAndName',
                width: 150,
              },
              {
                name: 'brand',
                width: 120,
              },
              {
                name: 'specifications',
                width: 120,
              },
              {
                name: 'model',
                width: 120,
              },
            ],
          },
          {
            key: 'amountInfo',
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            width: 170,
            header: intl.get('sodr.workspace.model.common.amountInfo').d('金额信息'),
            children: [
              {
                name: 'unitPrice',
                width: 150,
                renderer: usePriceRender(),
              },
              {
                name: 'lineAmount',
                width: 150,
                renderer: useAmountRender(null, { bySourceCode }),
              },
              {
                name: 'enteredTaxIncludedPrice',
                width: 150,
                renderer: usePriceRender(),
              },
              {
                name: 'taxIncludedLineAmount',
                width: 150,
                renderer: useAmountRender(null, { bySourceCode }),
              },
              {
                name: 'taxRate',
                width: 150,
              },
              {
                name: 'unitPriceBatch',
                width: 150,
              },
              {
                name: 'currencyCode',
                width: 100,
              },
            ],
          },
          {
            key: 'organizInfo',
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            width: 200,
            header: intl.get('sodr.workspace.model.common.organizInfo').d('组织信息'),
            children: [
              {
                name: 'companyName',
                width: 150,
              },
              {
                name: 'ouName',
                width: 150,
              },
              {
                name: 'purOrganizationName',
                width: 200,
              },
              {
                name: 'purchaseAgentName',
                width: 200,
              },
              {
                name: 'invOrganizationName',
                width: 200,
              },
              {
                name: 'inventoryName',
                width: 120,
              },
              {
                name: 'locationName',
                width: 120,
              },
            ],
          },
          {
            key: 'sourceInfo',
            align: 'left',
            width: 130,
            header: intl.get('sodr.workspace.model.common.sourceInfo').d('来源信息'),
            aggregation: true,
            aggregationLimit: 4,
            children: [
              {
                name: 'poSourcePlatform',
                renderer: ({ record }) => record.get('poSourcePlatformMeaning'),
              },
              {
                name: 'sourceBillTypeCode',
                renderer: ({ record }) => record.get('sourceBillTypeCodeMeaning'),
              },
            ],
          },
          {
            key: 'creatTimeInfo',
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            width: 190,
            header: intl.get('sodr.workspace.model.common.creatTimeInfo').d('创建/时间信息'),
            children: [
              {
                name: 'needByDate',
                width: 120,
              },
              {
                name: 'erpCreatedName',
                width: 120,
              },
              {
                name: 'creationDate',
                width: 150,
              },
              {
                name: 'promiseDeliveryDate',
                width: 120,
              },
              {
                name: 'urgentDate',
                width: 150,
              },
              {
                name: 'releasedDate',
                width: 150,
              },
              {
                name: 'confirmedDate',
                width: 150,
              },
            ],
          },
          {
            key: 'executionInfo',
            align: 'left',
            header: intl.get('sodr.workspace.model.common.executionInfo').d('执行信息'),
            aggregation: true,
            aggregationLimit: 4,
            children: [
              {
                name: 'netReceivedQuantity',
                width: 100,
              },
              {
                name: 'netDeliverQuantity',
                width: 100,
              },
              {
                name: 'notDeliverQuantity',
                width: 100,
              },
              {
                name: 'shippedQuantity',
                width: 100,
              },
              {
                name: 'billMatchedQuantity',
                width: 100,
              },
              {
                name: 'invoicedQuantity',
                width: 100,
              },
              {
                name: 'deliveryStatus',
                width: 100,
                renderer: renderExecutionStatus,
              },
              {
                name: 'receiptStatus',
                width: 100,
                renderer: renderExecutionStatus,
              },
              {
                name: 'reconciliationStatus',
                width: 100,
                renderer: renderExecutionStatus,
              },
              {
                name: 'invoicingStatus',
                width: 100,
                renderer: renderExecutionStatus,
              },
              {
                name: 'deliveryStrategyId',
                width: 120,
              },
              {
                name: 'strategyHeaderId',
                width: 120,
              },
            ],
          },
          {
            key: 'otherInfo',
            align: 'left',
            header: intl.get('sodr.workspace.model.common.otherInfo').d('其他信息'),
            aggregation: true,
            aggregationLimit: 4,
            children: [
              {
                name: 'shipToThirdPartyAddress',
                width: 160,
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
                name: 'costName',
                width: 100,
              },
              {
                name: 'departmentName',
                width: 120,
              },
              {
                name: 'projectCategory',
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
                // renderer: ({ record }) => <Bom record={record} readOnly />,
                renderer: ({ record }) => (
                  <a onClick={() => openBom(record)}>
                    {intl.get('hzero.common.button.look').d('查看')}
                  </a>
                ),
              },

              {
                name: 'delayFlag',
                width: 150,
                renderer: ({ value }) =>
                  yesOrNoRender(!isNil(value) ? (value === '1' ? 1 : 0) : null),
              },
              {
                name: 'urgentFlag',
                width: 150,
                renderer: ({ value }) => yesOrNoRender(value),
              },
              {
                name: 'prRequestedName',
                width: 150,
              },
              {
                name: 'docFlow',
                width: 100,
                className: styles['table-cell-height'],
                hidden: displayDocAndDocFlow.displayDocFlow !== '1',
                renderer: ({ record }) => (
                  <DocFlow
                    tableName="sodr_po_line_location"
                    tablePk={record.get('poLineLocationId')}
                  />
                ),
              },
              {
                name: 'exportErpFlag', // SUCCESS、FAIL、WAIT_SYNC、SYNCHRONIZING
                width: 120,
                renderer: ({ record, value }) => {
                  if (value) {
                    const meaning = record.get('exportErpFlagMeaning');
                    return (
                      <StatusTag
                        // className={`${
                        //   value === 'SUCCESS'
                        //     ? styles['tag-green']
                        //     : value === 'FAIL'
                        //     ? styles['tag-red']
                        //     : styles['tag-orange']
                        // }`}
                        color={value === 'SUCCESS' ? 'green' : value === 'FAIL' ? 'red' : 'yellow'}
                        onClick={() => handleImportDetailStatus(record)}
                      >
                        {meaning}
                        <Icon type="wysiwyg" style={{ fontWeight: 'initial' }} />
                      </StatusTag>
                    );
                  }
                },
              },
            ],
          },
        ];
        break;
      case 'detailFeedback':
        columns = [
          {
            key: 'orderInfo',
            aggregation: true,
            align: 'left',
            width: 190,
            header: intl.get('sodr.workspace.model.common.numInfo').d('订单信息'),
            children: [
              {
                name: 'displayPoNum',
                width: 200,
                renderer: ({ value, record }) => {
                  return (
                    <Fragment>
                      <a onClick={() => goDetail(record, key)}>
                        {`${value}-${record.get('displayLineNum')}`}
                      </a>
                      {record.get('urgentFlag') && Number(record.get('urgentFlag')) ? (
                        <Tooltip
                          title={intl.get(`sodr.workspace.view.tooltip.urgent`).d('订单加急')}
                        >
                          <Icon type="flash_on" className={styles['row-agent-column-icon']} />
                        </Tooltip>
                      ) : null}
                    </Fragment>
                  );
                },
              },
              {
                name: 'displayLineLocationNum',
                width: 100,
              },
              {
                name: 'poTypeCode',
                width: 200,
                renderer: ({ record }) => record.get('poTypeCodeMeaning'),
              },
              {
                name: 'headerRemark',
                width: 200,
              },
            ],
          },
          {
            key: 'supplierInfo',
            align: 'left',
            width: 200,
            header: intl.get('sodr.workspace.model.common.supplierInfo').d('供应商信息'),
            aggregation: true,
            children: [
              {
                name: 'supplierName',
                width: 200,
              },
              {
                name: 'supplierCode',
                width: 160,
              },
            ],
          },
          {
            key: 'materialInfo',
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            width: 170,
            header: intl.get('sodr.workspace.model.common.materialInfo').d('物料信息'),
            children: [
              {
                name: 'itemCode',
                width: 150,
              },
              {
                name: 'itemName',
                width: 150,
              },
            ],
          },
          {
            key: 'feedbackInfo',
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            header: intl.get('sodr.workspace.model.common.feedbackInfo').d('反馈信息'),
            // help: `${intl
            //   .get('sodr.workspace.view.tooltip.diffPromiseDeliveryDate')
            //   .d('承诺交货日期与需求日期不一致时，红色字体展示。')}
            //   ${intl
            //     .get('sodr.workspace.view.tooltip.diffQuantity')
            //     .d('反馈数量与订单原始数量不一致时，红色字体展示。')}`,
            children: [
              {
                name: 'originalQuantity',
                width: 150,
                renderer: ({ record, value }) => useQuantityRender(record)({ record, value }),
              },
              doubleUnitEnabled && {
                name: 'secondaryQuantity',
                width: 150,
                renderer: ({ record, value }) =>
                  !isEqual(
                    new BigNumber(record.get('secondaryQuantity')),
                    new BigNumber(record.get('originalQuantity'))
                  ) ? (
                    <span style={{ color: 'rgb(245, 102, 73)' }}>
                      {useQuantityRender(record, 'secondaryUomPrecision')({ record, value })}
                    </span>
                  ) : (
                    useQuantityRender(record, 'secondaryUomPrecision')({ record, value })
                  ),
              },
              {
                name: 'quantity',
                width: 150,
                renderer: ({ record, value }) =>
                  !doubleUnitEnabled &&
                  !isEqual(
                    new BigNumber(record.get('quantity')),
                    new BigNumber(record.get('originalQuantity'))
                  ) ? (
                    <Tooltip
                      title={intl
                        .get('sodr.workspace.view.tooltip.newDiffQuantity')
                        .d('反馈数量与订单原始数量不一致')}
                    >
                      <span style={{ color: 'rgb(245, 102, 73)' }}>
                        {useQuantityRender(record)({ record, value })}
                      </span>
                    </Tooltip>
                  ) : (
                    useQuantityRender(record)({ record, value })
                  ),
              },
              {
                name: 'needByDate',
                width: 150,
              },
              {
                name: 'promiseDeliveryDate',
                width: 150,
                renderer: ({ text, value, record }) =>
                  moment(record.get('needByDate')).diff(value) ? (
                    <Tooltip
                      title={intl
                        .get('sodr.workspace.view.tooltip.newDiffPromiseDeliveryDate')
                        .d('承诺交货日期与需求日期不一致')}
                    >
                      <span style={{ color: 'rgb(245, 102, 73)' }}>{text}</span>
                    </Tooltip>
                  ) : (
                    text
                  ),
              },
            ],
          },
          {
            key: 'organizInfo',
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            width: 200,
            header: intl.get('sodr.workspace.model.common.organizInfo').d('组织信息'),
            children: [
              {
                name: 'companyName',
                width: 200,
              },
              {
                name: 'orgName',
                width: 200,
              },
              {
                name: 'purOrganizationName',
                width: 200,
              },
              {
                name: 'agentName',
                width: 150,
              },
            ],
          },
          {
            key: 'sourceInfo',
            align: 'left',
            width: 130,
            header: intl.get('sodr.workspace.model.common.sourceInfo').d('来源信息'),
            aggregation: true,
            children: [
              {
                name: 'poSourcePlatform',
                renderer: ({ record }) => record.get('poSourcePlatformMeaning'),
              },
              {
                name: 'sourceBillTypeCode',
                renderer: ({ record }) => record.get('sourceBillTypeCodeMeaning'),
              },
            ],
          },
          {
            key: 'timeInfo',
            align: 'left',
            aggregation: true,
            width: 190,
            header: intl.get('sodr.workspace.model.common.timeInfo').d('时间信息'),
            children: [
              {
                name: 'feedbackDate',
                width: 200,
              },
              {
                name: 'creationDate',
                width: 150,
              },
            ],
          },
        ];
        break;
      default:
        columns = [
          {
            name: 'statusCode',
            width: 90,
            renderer: ({ record }) =>
              renderStatus(record.get('statusCode'), record.get('statusCodeMeaning')),
          },
          {
            name: 'aiPreReview',
            width: 120,
            renderer: ({ record }) => renderAiPreReview({ record }),
          },
          {
            key: 'orderInfo',
            aggregation: true,
            align: 'left',
            width: 190,
            aggregationLimit: 4,
            header: intl.get('sodr.workspace.model.common.numInfo').d('订单信息'),
            children: [
              {
                name: 'displayPoNum',
                width: 200,
                renderer: ({ value, record }) => (
                  <a onClick={() => goDetail(record, key)}>{value}</a>
                ),
              },
              {
                name: 'poTypeId',
                width: 200,
                renderer: ({ record }) => record.get('poTypeCodeMeaning'),
              },
              {
                name: 'displayReleaseNum',
                width: 200,
              },
              {
                name: 'remark',
                width: 200,
              },
            ],
          },
          {
            key: 'supplierInfo',
            align: 'left',
            width: 200,
            header: intl.get('sodr.workspace.model.common.supplierInfo').d('供应商信息'),
            aggregation: true,
            children: [
              {
                name: 'supplierName',
                width: 200,
              },
              {
                name: 'supplierCode',
                width: 160,
              },
              {
                name: 'supplierSiteName',
                width: 200,
              },
            ],
          },
          {
            key: 'organizInfo',
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            width: 200,
            header: intl.get('sodr.workspace.model.common.organizInfo').d('组织信息'),
            children: [
              {
                name: 'companyId',
                width: 200,
                renderer: ({ record }) => record.get('companyName'),
              },
              {
                name: 'ouId',
                width: 200,
                renderer: ({ record }) => record.get('ouName'),
              },
              {
                name: 'purchaseOrgId',
                width: 200,
                renderer: ({ record }) => record.get('purOrganizationName'),
              },
              {
                name: 'agentId',
                width: 200,
                renderer: ({ record }) => record.get('agentName'),
              },
            ],
          },
          {
            key: 'receiptReceiptInfo',
            align: 'left',
            header: intl.get('sodr.workspace.model.common.receiptReceiptInfo').d('收货/收单信息'),
            aggregation: true,
            children: [
              {
                name: 'shipToLocationAddress',
                width: 160,
              },
              {
                name: 'billToLocationAddress',
                width: 160,
              },
            ],
          },
          {
            key: 'amountInfo',
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            width: 170,
            header: intl.get('sodr.workspace.model.common.amountInfo').d('金额信息'),
            children: [
              {
                name: 'taxIncludeAmount',
                width: 150,
                renderer: useAmountRender(null, { bySourceCode }),
              },
              {
                name: 'amount',
                width: 150,
                renderer: useAmountRender(null, { bySourceCode }),
              },
              {
                name: 'currencyCode',
                width: 150,
              },
            ],
          },
          {
            key: 'sourceInfo',
            align: 'left',
            width: 130,
            header: intl.get('sodr.workspace.model.common.sourceInfo').d('来源信息'),
            aggregation: true,
            aggregationLimit: 4,
            children: [
              {
                name: 'sourceBillTypeCode',
                width: 200,
                renderer: ({ record }) => record.get('sourceBillTypeCodeMeaning'),
              },
              {
                name: 'poSourcePlatform',
                width: 200,
                renderer: ({ record }) => record.get('poSourcePlatformMeaning'),
              },
            ],
          },
          {
            key: 'createInfo',
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            width: 190,
            header: intl.get('sodr.workspace.model.common.createInfo').d('创建信息'),
            children: [
              {
                name: 'erpCreatedName',
                width: 150,
              },
              {
                name: 'creationDate',
                width: 150,
              },
            ],
          },
        ];
    }
    return remote.process('processColumns', columns, { key });
  };
  const renderExportVendorSystemStatus = (value, record) => {
    const colorConfigList = [
      {
        // 绿色
        status: ['SUCCESS'],
        color: 'green',
        name: intl.get('sodr.workspace.view.message.sucess').d('成功'),
      },
      {
        // 红色
        status: ['FAIL'],
        color: 'red',
        name: intl.get('sodr.workspace.view.message.failure').d('失败'),
      },
    ];
    const colorConfig = colorConfigList.find((i) => i.status.includes(value));
    return (
      <StatusTag color={colorConfig?.color} onClick={() => onExportVendorSystemStatus(record)}>
        {colorConfig?.name}
      </StatusTag>
    );
  };

  const onExportVendorSystemStatus = (record) => {
    const poHeaderId = record.get('poHeaderId');
    exportVendorSystemStatusDs.setQueryParameter('poHeaderId', poHeaderId);
    exportVendorSystemStatusDs.query();
    Modal.open({
      drawer: true,
      // title: intl.get('sodr.workspace.model.common.approvedRemark').d('审批意见'),
      children: <Table dataSet={exportVendorSystemStatusDs} columns={exportColumns()} />,
      style: { width: 850 },
      // onOk: async () => {
      //   const status = await approvalCommentsDs.validate();
      //   if (!status) return false;
      //   return onOk();
      // },
      // afterClose: () => {
      //   approvalCommentsDs.reset();
      // },
      // okProps: { loading: loadings[type] },
    });
  };

  const resynchronizeing = throttle(
    (record) => {
      record.setState('resynchronize', true);
      exportVendorSystemStatusReSync(record.toData()).then((res) => {
        if (res && !res.failed) {
          exportVendorSystemStatusDs.query();
        }
        record.setState('resynchronize', false);
      });
    },
    THROTTLE_TIME,
    { trailing: false }
  );

  const exportColumns = () => [
    { name: 'syncTypeMeaning', width: 100 },
    {
      name: 'syncStatusMeaning',
      width: 100,
    },
    { name: 'syncResponseMsg', width: 100 },
    { name: 'lastUpdateDate', width: 100 },
    { name: 'lastUpdatedName', width: 100 },
    {
      name: 'resynchronize',
      width: 100,
      renderer: ({ record }) => {
        const { syncStatus } = record ? record.toJSONData() : {};
        if (syncStatus === 'FAIL') {
          return (
            <a onClick={() => resynchronizeing(record)} disabled={record.getState('resynchronize')}>
              {intl.get('sodr.workspace.view.button.resynchronize').d('重新同步')}
            </a>
          );
        } else {
          intl.get('sodr.workspace.view.button.resynchronize').d('重新同步');
        }
      },
    },
    { name: 'externalSystemCode', width: 100 },
    { name: 'syncType', width: 100 },
  ];

  const onQuery = ({ params, currentPage }, ds) => {
    const { tempKey = '' } = params;
    // 保留筛选器中使用了老值集的 supplierInfoStrs 参数逻辑
    // 值集中没有supplierChooseFlag统一作老值集处理
    if (!tempKey.includes(':')) {
      // 供应商LOV单选多选传参统一
      const supplierInfoStrs = tempKey
        ? tempKey
            .split(',')
            .map((i) =>
              i
                .split('-')
                .map((j) => j || 'null')
                .join('-')
            )
            .join(',')
        : '';
      Object.assign(params, { supplierInfoStrs });
    }
    ds.queryDataSet.loadData([
      {
        ...params,
        multiPoNum: params.multiPoNum?.toString(),
      },
    ]);
    ds.query(currentPage);
    if (_back === -1 && isOpenClearCashed) {
      setIsOpenClearCashed(false);
    }
  };

  const getSiteLovProps = () => {
    const getIdFromObject = (record) => record.get('tempKey')?.supplierId;
    const getIdsFromArray = (list) =>
      list
        .get('tempKey')
        .filter((i) => i.supplierId)
        .map((i) => i.supplierId)
        .join(',');
    return {
      lovPara: ({ record }) => {
        return {
          supplierIds: record.get('tempKey')?.length
            ? getIdsFromArray(record)
            : getIdFromObject(record),
        };
      },
      disabled: ({ record }) => {
        return record.get('tempKey')?.length ? !getIdsFromArray(record) : !getIdFromObject(record);
      },
    };
  };

  // 聚合平铺状态对应table上的key
  const rightRender = (key) => {
    return (
      <div className={styles['search-layout']}>
        <Popover content={intl.get('sodr.workspace.model.workspace.flatTableView').d('平铺表视图')}>
          <div
            className={styles[!tabAggregation[key] ? 'isActive' : 'isNormal']}
            onClick={() => handleAggregationChange(false, key)}
          >
            <Icon type="reorder" className={styles['icon-font']} />
          </div>
        </Popover>
        <Popover
          content={intl.get('sodr.workspace.model.workspace.aggregateTableView').d('聚合表视图')}
        >
          <div
            className={styles[tabAggregation[key] ? 'isActive' : 'isNormal']}
            onClick={() => handleAggregationChange(true, key)}
          >
            <Icon type="view_day" className={styles['icon-font']} />
          </div>
        </Popover>
      </div>
    );
  };
  // 聚合视图改变时触发
  const handleAggregationChange = (aggregations, key) => {
    setTabAggregation({ ...tabAggregation, [key]: aggregations });
  };

  // 筛选器值变更事件
  const searchBarTableFieldChange = (key, config) => {
    remote.event.fireEvent('searchBarTableFieldChange', { key, config });
  };

  const getTableRender = (key) => {
    const aggregation = tabAggregation[key];
    let tableRender;
    // 二开的需要以cux开头，避免影响标准
    const remoteKey = key && key.startsWith('cux') ? 'cuxRemoteKey' : key;
    switch (remoteKey) {
      case 'toBeSubmited':
        tableRender = customizeTable(
          { code: 'SODR.WORKSPACE_TOBESUBMITED.LIST' },
          <WarpSearchBarTable
            warpKey={key}
            autoQuery={false}
            searchBarRef={(root) => {
              toBeSubmitedDsRef.current = root;
            }}
            aggregation={aggregation}
            onAggregationChange={(aggregations) => handleAggregationChange(aggregations, key)}
            cacheState
            searchCode="SODR.WORKSPACE_TOBESUBMITED.SEARCH"
            dataSet={toBeSubmitedDs}
            columns={getColumns('toBeSubmited')}
            pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
            style={{ maxHeight: 'calc(100vh - 260px)' }}
            virtual
            virtualCell
            searchBarConfig={{
              onQuery: (e) => onQuery(e, toBeSubmitedDs),
              editorProps,
              fieldProps: {
                tempKey: {
                  lovPara: {
                    tenantId: organizationId,
                  },
                },
                supplierSiteId: {
                  dynamicProps: getSiteLovProps(),
                },
              },
              left: {
                render: (_, ds) => (
                  <MutlTextFieldSearch
                    name="multiPoNum"
                    dataSet={ds}
                    placeholder={intl
                      .get('sodr.workspace.view.placeholder.poNumAndNum')
                      .d('请输入订单编号查询')}
                  />
                ),
              },
              right: {
                render: () => rightRender(key),
              },
            }}
          />
        );
        break;
      case 'underApproval':
        tableRender = customizeTable(
          { code: 'SODR.WORKSPACE_UNDERAPPROVAL.LIST' },
          <WarpSearchBarTable
            warpKey={key}
            autoQuery={false}
            searchBarRef={(root) => {
              underApprovalDsRef.current = root;
            }}
            aggregation={aggregation}
            onAggregationChange={(aggregations) => handleAggregationChange(aggregations, key)}
            cacheState
            searchCode="SODR.WORKSPACE_UNDERAPPROVAL.SEARCH"
            dataSet={underApprovalDs}
            columns={getColumns('underApproval')}
            pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
            style={{ maxHeight: 'calc(100vh - 260px)' }}
            virtual
            virtualCell
            searchBarConfig={{
              onQuery: (e) => onQuery(e, underApprovalDs),
              editorProps,
              fieldProps: {
                tempKey: {
                  dynamicProps: {
                    lovPara: ({ record }) => {
                      return {
                        tenantId: organizationId,
                        companyId: record.get('companyId')?.companyId,
                      };
                    },
                  },
                },
                supplierSiteId: {
                  dynamicProps: getSiteLovProps(),
                },
              },
              left: {
                render: (_, ds) => (
                  <MutlTextFieldSearch
                    name="multiPoNum"
                    dataSet={ds}
                    placeholder={intl
                      .get('sodr.workspace.view.placeholder.poNumAndNum')
                      .d('请输入订单编号查询')}
                  />
                ),
              },
              right: {
                render: () => rightRender(key),
              },
            }}
          />
        );
        break;
      case 'toBeReleased':
        tableRender = customizeTable(
          { code: 'SODR.WORKSPACE_TOBERELEASED.LIST' },
          <WarpSearchBarTable
            warpKey={key}
            autoQuery={false}
            searchBarRef={(root) => {
              toBeReleasedDsRef.current = root;
            }}
            aggregation={aggregation}
            onAggregationChange={(aggregations) => handleAggregationChange(aggregations, key)}
            cacheState
            searchCode="SODR.WORKSPACE_TOBERELEASED.SEARCH"
            dataSet={toBeReleasedDs}
            columns={getColumns('toBeReleased')}
            pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
            style={{ maxHeight: 'calc(100vh - 260px)' }}
            virtual
            virtualCell
            searchBarConfig={{
              onQuery: (e) => onQuery(e, toBeReleasedDs),
              editorProps,
              fieldProps: {
                tempKey: {
                  lovPara: {
                    tenantId: organizationId,
                  },
                },
                supplierSiteId: {
                  dynamicProps: getSiteLovProps(),
                },
              },
              left: {
                render: (_, ds) => (
                  <MutlTextFieldSearch
                    name="multiPoNum"
                    dataSet={ds}
                    placeholder={intl
                      .get('sodr.workspace.view.placeholder.poNumAndNum')
                      .d('请输入订单编号查询')}
                  />
                ),
              },
              right: {
                render: () => rightRender(key),
              },
            }}
          />
        );
        break;
      case 'toBeSigned':
        tableRender = customizeTable(
          { code: 'SODR.WORKSPACE_TOBESIGNED.LIST' },
          <WarpSearchBarTable
            warpKey={key}
            autoQuery={false}
            searchBarRef={(root) => {
              toBeSignedDsRef.current = root;
            }}
            aggregation={aggregation}
            onAggregationChange={(aggregations) => handleAggregationChange(aggregations, key)}
            cacheState
            searchCode="SODR.WORKSPACE_TOBESIGNED.SEARCH"
            dataSet={toBeSignedDs}
            columns={getColumns('toBeSigned')}
            pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
            style={{ maxHeight: 'calc(100vh - 260px)' }}
            virtual
            virtualCell
            searchBarConfig={{
              onQuery: (e) => onQuery(e, toBeSignedDs),
              editorProps,
              fieldProps: {
                tempKey: {
                  lovPara: {
                    tenantId: organizationId,
                  },
                },
                supplierSiteId: {
                  dynamicProps: getSiteLovProps(),
                },
              },
              left: {
                render: (_, ds) => (
                  <MutlTextFieldSearch
                    name="multiPoNum"
                    dataSet={ds}
                    placeholder={intl
                      .get('sodr.workspace.view.placeholder.poNumAndNum')
                      .d('请输入订单编号查询')}
                  />
                ),
              },
              right: {
                render: () => rightRender(key),
              },
            }}
          />
        );
        break;
      case 'feedbackUnderReview':
        tableRender = customizeTable(
          { code: 'SODR.WORKSPACE_FEEDBACKUNDERREVIEW.LIST' },
          <WarpSearchBarTable
            warpKey={key}
            autoQuery={false}
            searchBarRef={(root) => {
              feedbackUnderReviewDsRef.current = root;
            }}
            aggregation={aggregation}
            onAggregationChange={(aggregations) => handleAggregationChange(aggregations, key)}
            cacheState
            searchCode="SODR.WORKSPACE_FEEDBACKUNDERREVIEW.SEARCH"
            dataSet={feedbackUnderReviewDs}
            columns={getColumns('feedbackUnderReview')}
            pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
            style={{ maxHeight: 'calc(100vh - 260px)' }}
            virtual
            virtualCell
            searchBarConfig={{
              onQuery: (e) => onQuery(e, feedbackUnderReviewDs),
              editorProps,
              fieldProps: {
                tempKey: {
                  lovPara: {
                    tenantId: organizationId,
                  },
                },
                supplierSiteId: {
                  dynamicProps: getSiteLovProps(),
                },
              },
              left: {
                render: (_, ds) => (
                  <MutlTextFieldSearch
                    name="multiPoNum"
                    dataSet={ds}
                    placeholder={intl
                      .get('sodr.workspace.view.placeholder.poNumAndNum')
                      .d('请输入订单编号查询')}
                  />
                ),
              },
              right: {
                render: () => rightRender(key),
              },
            }}
          />
        );
        break;
      case 'all':
        tableRender = customizeTable(
          { code: 'SODR.WORKSPACE_ALL.LIST' },
          <WarpSearchBarTable
            warpKey={key}
            autoQuery={false}
            searchBarRef={(root) => {
              allDsRef.current = root;
            }}
            aggregation={aggregation}
            onAggregationChange={(aggregations) => handleAggregationChange(aggregations, key)}
            cacheState
            searchCode="SODR.WORKSPACE_ALL.SERARCH"
            dataSet={allDs}
            columns={getColumns('all')}
            pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
            style={{ maxHeight: 'calc(100vh - 260px)' }}
            virtual
            virtualCell
            spin={{ spinning: loadings.handleOrderCopy }}
            searchBarConfig={{
              onFieldChange: (e) => searchBarTableFieldChange(key, e),
              onQuery: (e) => onQuery(e, allDs),
              editorProps,
              fieldProps: {
                creationDate: {
                  defaultValue: [
                    moment().subtract(3, 'months').startOf('day'),
                    moment().endOf('day'),
                  ],
                },
                tempKey: {
                  lovPara: {
                    tenantId: organizationId,
                  },
                },
                supplierSiteId: {
                  dynamicProps: getSiteLovProps(),
                },
              },
              left: {
                render: (_, ds) => {
                  return (
                    <MutlTextFieldSearch
                      name="multiPoNum"
                      dataSet={ds}
                      placeholder={intl
                        .get('sodr.workspace.view.placeholder.poNumAndNum')
                        .d('请输入订单编号查询')}
                    />
                  );
                },
              },
              right: {
                render: () => rightRender(key),
              },
            }}
          />
        );
        break;
      case 'detailFeedback':
        tableRender = customizeTable(
          {
            code: 'SODR.WORKSPACE_DETAILFEEDBACK.LIST',
          },
          <WarpSearchBarTable
            warpKey={key}
            autoQuery={false}
            searchBarRef={(root) => {
              detailFeedbackDsRef.current = root;
            }}
            aggregation={aggregation}
            onAggregationChange={(aggregations) => handleAggregationChange(aggregations, key)}
            cacheState
            searchCode="SODR.WORKSPACE_DETAILFEEDBACK.SEARCH"
            dataSet={detailFeedbackDs}
            columns={getColumns('detailFeedback')}
            pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
            style={{ maxHeight: 'calc(100vh - 260px)' }}
            virtual
            virtualCell
            searchBarConfig={{
              onQuery: (e) => onQuery(e, detailFeedbackDs),
              editorProps: {
                ...editorProps,
                poNumAndLineNum: {
                  placeholder: intl
                    .get('sodr.workspace.view.placeholder.poNumAndLineNums')
                    .d('请输入订单编号-行号'),
                },
              },
              fieldProps: {
                itemCode: {
                  transformValue: (value, record) => {
                    if (record) {
                      const val = record.get('itemCode');
                      return isArray(toJS(val))
                        ? String(val.map((i) => i.itemCode))
                        : val?.itemCode;
                    }
                  },
                  lovPara: {
                    tenantId: organizationId,
                  },
                },
                tempKey: {
                  lovPara: {
                    tenantId: organizationId,
                  },
                },
                supplierSiteId: {
                  dynamicProps: getSiteLovProps(),
                },
              },
              left: {
                render: (_, ds) => (
                  <MutlTextFieldSearch
                    name="multiPoNum"
                    dataSet={ds}
                    placeholder={intl
                      .get('sodr.workspace.view.placeholder.poNumAndNum')
                      .d('请输入订单编号查询')}
                  />
                ),
              },
              right: {
                render: () => rightRender(key),
              },
            }}
          />
        );
        break;
      case 'cuxRemoteKey': // 二开的走这里
        tableRender = remote
          ? remote.process('SODR.WORKSPACE_LIST_PROCESS_MORE_TAB_TABLE', null, {
              cuxTabRefs,
              editorProps,
              aggregation,
              getColumns,
              loadings,
              getSiteLovProps,
              MutlTextFieldSearch,
              handleAggregationChange,
              onQuery,
              customizeTable,
              cuxTableListDSObj,
              rightRender,
            })
          : null;
        break;
      default:
        tableRender = customizeTable(
          {
            code: 'SODR.WORKSPACE_DETAILALL.LIST',
          },
          <WarpSearchBarTable
            warpKey={key}
            autoQuery={false}
            searchBarRef={(root) => {
              detailAllDsRef.current = root;
            }}
            aggregation={aggregation}
            onAggregationChange={(aggregations) => handleAggregationChange(aggregations, key)}
            cacheState
            spin={{ spinning: detailAllDs.status !== 'ready' || loadings.handleBatchActionByLine }}
            searchCode="SODR.WORKSPACE_DETAILALL.SEARCH"
            dataSet={detailAllDs}
            columns={getColumns('detailAll')}
            pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
            style={{ maxHeight: 'calc(100vh - 260px)' }}
            virtual
            virtualCell
            searchBarConfig={{
              onFieldChange: (e) => searchBarTableFieldChange(key, e),
              onQuery: (e) => onQuery(e, detailAllDs),
              editorProps: {
                ...editorProps,
                poNumAndLineNum: {
                  placeholder: intl
                    .get('sodr.workspace.view.placeholder.poNumAndLineNums')
                    .d('请输入订单编号-行号'),
                },
              },
              fieldProps: {
                creationDate: {
                  defaultValue: [
                    moment().subtract(3, 'months').startOf('day'),
                    moment().endOf('day'),
                  ],
                },
                itemCode: {
                  transformValue: (value, record) => {
                    if (record) {
                      const val = record.get('itemCode');
                      return isArray(toJS(val))
                        ? String(val.map((i) => i.itemCode))
                        : val?.itemCode;
                    }
                  },
                  lovPara: {
                    tenantId: organizationId,
                  },
                },
                tempKey: {
                  lovPara: {
                    tenantId: organizationId,
                  },
                },
                supplierSiteId: {
                  dynamicProps: getSiteLovProps(),
                },
              },
              left: {
                render: (_, ds) => (
                  <MutlTextFieldSearch
                    name="multiPoNum"
                    dataSet={ds}
                    placeholder={intl
                      .get('sodr.workspace.view.placeholder.poNumAndNum')
                      .d('请输入订单编号查询')}
                  />
                ),
              },
              right: {
                render: () => rightRender(key),
              },
            }}
          />
        );
        break;
    }
    return tableRender;
  };

  const cuxWholeDetails = remote
    ? remote.process('SODR.WORKSPACE_LIST_PROCESS_CUXWHOLEDETAILS', {}, { props })
    : {};

  const wholeDetails = {
    toBeSubmited: 'wholeorder',
    underApproval: 'wholeorder',
    toBeReleased: 'wholeorder',
    toBeSigned: 'wholeorder',
    feedbackUnderReview: 'wholeorder',
    all: 'wholeorder',
    detailFeedback: 'detail',
    detailAll: 'detail',
    ...cuxWholeDetails,
  };

  const activeKeys = useMemo(() => {
    const redioKeyFlag = remote
      ? remote.process('SODR.WORKSPACE_LIST_PROCESS_ACTIVEKEY', redioKey === 'detail', { redioKey })
      : redioKey === 'detail';
    if (redioKeyFlag) {
      return detailActiveKey;
    } else {
      return activeKey;
    }
  }, [detailActiveKey, activeKey, redioKey]);
  const onTabChange = (key) => {
    const MAP_REF = {
      ...(cuxTabRefs || {}),
      toBeSubmitedDsRef,
      underApprovalDsRef,
      toBeReleasedDsRef,
      toBeSignedDsRef,
      feedbackUnderReviewDsRef,
      allDsRef,
      detailFeedbackDsRef,
      detailAllDsRef,
    };
    // 适配个性化的新增Tab,非个性化Tab
    const cuzTabs = (props?.custConfig['SODR.WORKSPACE_LIST.TABS']?.fields || []).filter(
      (i) => !i?.standardField
    );
    const cuzGroup = cuzTabs.find((i) => i?.fieldCode === key)?.aggregationCode;
    if (wholeDetails[key] === 'wholeorder' || cuzGroup === 'wholeorder') {
      dispatch({
        type: 'orderWorkSpace/updateState',
        payload: { activeKey: key, redioKey: 'wholeorder' },
      });
    } else if (wholeDetails[key] === 'detail') {
      dispatch({
        type: 'orderWorkSpace/updateState',
        payload: { detailActiveKey: key, redioKey: 'detail' },
      });
    } else if (remote?.event) {
      remote.event.fireEvent('cuxTabChange', {
        props,
        wholeDetails,
        key,
      });
    }
    const curentDsRef = MAP_REF[`${key}DsRef`]?.current;
    if (curentDsRef && curentDsRef.handleQuery) {
      curentDsRef.handleQuery(true);
    }
  };

  // 二开
  const remoteCuxTab = useMemo(() => {
    return remote
      ? remote.process('SODR.WORKSPACE_LIST_PROCESS_MORE_WHOLE_ORDER_TAB', null, {
          getTableRender,
        })
      : null;
  }, [remote, getTableRender]);

  const remoteCuxTabGroup = () => {
    return remote
      ? remote.process('SODR.WORKSPACE_LIST_PROCESS_TAB_GROUP', null, {
          props,
          activeKey,
          cuxTabRefs,
          displayDocAndDocFlow,
        })
      : null;
  };

  return (
    <Fragment>
      <Header title={intl.get('sodr.workspace.view.title.orderWorkspace').d('订单工作台')}>
        {getBtns()}
      </Header>
      <Content className={classNames(styles['action-content-wide'])}>
        <PermissionDoubleTabs onCallback={init}>
          {customizeTabPane(
            { code: 'SODR.WORKSPACE_LIST.TABS', cascade: true },
            <Tabs keyboard={false} activeKey={activeKeys} onChange={onTabChange}>
              {remoteCuxTabGroup()}
              <TabGroup
                tab={intl.get('sodr.workspace.view.button.wholeorder').d('整单')}
                key="wholeorder"
                defaultActiveKey={activeKey}
              >
                <TabPane
                  key="toBeSubmited"
                  count={counts.pendingNum}
                  tab={intl.get('sodr.workspace.view.tabPane.toBeSubmited').d('待提交')}
                >
                  {getTableRender('toBeSubmited')}
                </TabPane>
                <TabPane
                  key="underApproval"
                  count={counts.submittedNum}
                  tab={intl.get('sodr.workspace.view.tabPane.underApproval').d('审批中')}
                >
                  {getTableRender('underApproval')}
                </TabPane>
                <TabPane
                  key="toBeReleased"
                  count={counts.approvedNum}
                  tab={intl.get('sodr.workspace.view.tabPane.toBeReleased').d('待发布')}
                >
                  {getTableRender('toBeReleased')}
                </TabPane>
                <TabPane
                  key="feedbackUnderReview"
                  count={counts.deliveyDateReviewNum}
                  tab={intl.get('sodr.workspace.view.tabPane.feedbackUnders').d('待反馈审核')}
                >
                  {getTableRender('feedbackUnderReview')}
                </TabPane>
                <TabPane
                  key="toBeSigned"
                  count={counts.signNum}
                  tab={intl.get('sodr.workspace.view.tabPane.toBeSigned').d('待签署')}
                >
                  {getTableRender('toBeSigned')}
                </TabPane>
                <TabPane
                  key="all"
                  count={counts.poHeaderNum}
                  tab={intl.get('sodr.workspace.view.tabPane.all').d('全部')}
                >
                  {getTableRender('all')}
                </TabPane>
                {remoteCuxTab}
              </TabGroup>
              <TabGroup
                tab={intl.get('sodr.workspace.view.button.detail').d('明细')}
                key="detail"
                defaultActiveKey={detailActiveKey}
              >
                {collByLine && (
                  <TabPane
                    key="detailFeedback"
                    count={counts.lineDeliveyNum}
                    tab={intl.get('sodr.workspace.view.tabPane.feedbackUnder').d('待反馈审核')}
                  >
                    {getTableRender('detailFeedback')}
                  </TabPane>
                )}
                <TabPane
                  key="detailAll"
                  count={counts.lineNum}
                  tab={intl.get('sodr.workspace.view.tabPane.all').d('全部')}
                >
                  {getTableRender('detailAll')}
                </TabPane>
              </TabGroup>
            </Tabs>
          )}
        </PermissionDoubleTabs>
      </Content>
    </Fragment>
  );
};

// OrderWorkspace.contextTypes = {
//   permission: PropTypes.object,
// };

export default compose(
  connect(({ orderWorkSpace }) => ({
    orderWorkSpace,
  })),
  formatterCollections({
    code: ['sodr.workspace', 'sodr.common', 'hzero.common', 'scux.sodr'],
  }),
  withCustomize({
    unitCode: [
      'SODR.WORKSPACE_TOBESUBMITED.LIST',
      'SODR.WORKSPACE_UNDERAPPROVAL.LIST',
      'SODR.WORKSPACE_TOBERELEASED.LIST',
      'SODR.WORKSPACE_TOBESIGNED.LIST',
      'SODR.WORKSPACE_FEEDBACKUNDERREVIEW.LIST',
      'SODR.WORKSPACE_ALL.LIST',
      'SODR.WORKSPACE_DETAILFEEDBACK.LIST',
      'SODR.WORKSPACE_DETAILALL.LIST',
      'SODR.WORKSPACE_LIST.TABS',
      'SODR.WORKSPACE_DETAILALL.BUTTONS',
      'SODR.WORKSPACE_ALL.BUTTONS',
      'SODR.WORKSPACE_TOBESIGNED.BUTTONS',
      'SODR.WORKSPACE_TOBESUBMITED.BUTTONS',
      'SODR.WORKSPACE_DETAILFEEDBACK.BUTTONS',
      'SODR.WORKSPACE_DETAILALL.CANCEL_MODAL',
      'SODR.WORKSPACE_DETAILALL.CLOSE_MODAL',
      'SODR.WORKSPACE_FEEDBACKUNDERREVIEW.FEEDBACKMODAL',
      'SODR.WORKSPACE_DETAILFEEDBACK.FEEDBACKMODAL',
      'SODR.WORKSPACE_FEEDBACKUNDERREVIEW.BUTTONS',
    ],
  }),
  remotes(...remoteConfig),
  withProps(
    (withProp = {}) => {
      const { remote } = withProp || {};
      const toBeSubmitedDs = new DataSet(toBeSubmited());
      const underApprovalDs = new DataSet(underApproval());
      const toBeReleasedDs = new DataSet(toBeReleased());
      const toBeSignedDs = new DataSet(toBeSigned(withProp));
      const feedbackUnderReviewDs = new DataSet(feedbackUnderReview());
      const allDs = new DataSet(all());
      const detailFeedbackDs = new DataSet(detailFeedback(withProp));
      const detailAllDs = new DataSet(detailAll());
      const cuxTableListDSObj = remote
        ? remote.process('SODR.WORKSPACE_LIST_PROCESS_TABLE_LIST_DS_OBJ', {}, { allDS: all })
        : {};
      return {
        toBeSubmitedDs,
        underApprovalDs,
        toBeReleasedDs,
        toBeSignedDs,
        feedbackUnderReviewDs,
        allDs,
        detailFeedbackDs,
        detailAllDs,
        cuxTableListDSObj,
      };
    },
    { cacheState: true }
  ),
  observer
)(OrderWorkspace);

const FeedbackUnderReviewButtons = observer(
  ({ dataSet, handleAction, loadings, createCustomBtn, customizeBtnGroup, remote }) => {
    const { selected } = dataSet;
    const buttons = [
      {
        name: 'agree',
        child: intl.get(`sodr.workspace.view.button.agree`).d('同意'),
        btnProps: {
          type: 'c7n-pro',
          wait: THROTTLE_TIME,
          color: 'primary',
          icon: 'check',
          disabled: !selected.length,
          onClick: () => handleAction('agree'),
          loading: loadings.agreeLoading || loadings.returnLoading,
        },
      },
      {
        name: 'return',
        child: intl.get(`sodr.workspace.view.button.return`).d('退回'),
        btnProps: {
          type: 'c7n-pro',
          wait: THROTTLE_TIME,
          funcType: 'flat',
          icon: 'reply',
          disabled: !selected.length,
          onClick: () => handleAction('return'),
          loading: loadings.returnLoading || loadings.agreeLoading,
        },
      },
      createCustomBtn,
    ];
    return customizeBtnGroup(
      { code: 'SODR.WORKSPACE_FEEDBACKUNDERREVIEW.BUTTONS', pro: true },
      <DynamicButtons
        buttons={
          remote
            ? remote.process('SODR.WORKSPACE_LIST_PROCESS_FEEDBACK_HEADER_BTN', buttons, {
                dataSet,
                loadings,
              })
            : buttons
        }
        permissions={[
          {
            name: 'agree',
            code: 'srm.po-admin.po.order-workspace.ps.button.wholefdback.agree',
            meaning: '订单工作台-整单反馈审核中-同意',
          },
          {
            name: 'return',
            code: 'srm.po-admin.po.order-workspace.ps.button.wholefdback.return',
            meaning: '订单工作台-整单反馈审核中-退回',
          },
        ]}
        maxNum={5}
        defaultBtnType="c7n-pro"
      />
    );
  }
);
