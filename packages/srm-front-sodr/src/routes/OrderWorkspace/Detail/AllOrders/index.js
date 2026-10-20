/*
 * AllOrders - 订单明细页-全部
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, useEffect, useMemo, useState, useCallback } from 'react';
import { DataSet, Modal, TextArea, Form } from 'choerodon-ui/pro';
import { Spin, Collapse } from 'choerodon-ui';
import { compose, isFunction, throttle } from 'lodash';
import { observer } from 'mobx-react-lite';
import { THROTTLE_TIME, SAAS_SIGN } from '@/routes/components/utils/constant';
import intl from 'utils/intl';
import querystring from 'querystring';
import { SRM_SPUC } from '_utils/config';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getCurrentOrganizationId, getResponse, getCurrentUser } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import IMChatDraggable from '_components/IMChatDraggable';
import DynamicButtons from '_components/DynamicButtons';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import remotes from 'utils/remote';
import { openApproveModal } from '_components/ApproveModal';
import ChatRoom from 'srm-front-mobile/lib/components/Chat/Room';

import { getFileList } from '@/services/orderReleaseService';
import AttachmentInfo from '@/routes/components/AttachmentInfo';
import {
  getJsonBlob,
  queryCommonDoubleUomConfig,
  getDisplayDocAndDocFlow,
  revokeWorkFlow,
} from '@/routes/components/utils';
import OrderAffix from '@/routes/components/OrderAffix';
import C7nOperationApprove from '@/routes/components/C7nOperationApprove';
import C7nMessage from '@/routes/components/C7nMessage';
import { giftInfoDsConfig, GiftInfo } from '@/routes/components/GiftInfo';
import PaymentTermInfo, { paymentTermInfo } from '@/routes/components/PaymentTermInfo';
import Button from '@/routes/components/DotButton';
import {
  print,
  retryBatch,
  copyOrder,
  supplementary,
  initChatOnlineRoom,
  createReturnPoNew,
} from '@/services/orderWorkspaceService';
import remoteConfig from './remote';
import {
  basicInfo,
  organizationInfo,
  receiptInfo,
  billingInfo,
  supplementaryInfo,
} from './store/allOrdersDs';
import { detailInfo } from './store/OrderDetailLineDs';
import BasicInfo from './BasicInfo';
import OrganizationInfo from './OrganizationInfo';
import OrderDetailLine from './OrderDetailLine';
import ReceiptInfo from './ReceiptInfo';
import BillingInfo from './BillingInfo';
import AlertTooltip from '../../AlertTooltip';
import styles from '../index.less';

const organizationId = getCurrentOrganizationId();
const currentUser = getCurrentUser();
const prefix = 'sodr.workspace';
const { Panel } = Collapse;
const defaultActiveKey = [
  'basicInfo',
  'organizationInfo',
  'detailInfo',
  'giftInfo',
  'receiptInfo',
  'billingInfo',
  'paymentTermInfo',
];
const AllOrders = (props) => {
  const {
    match: {
      params: { id },
      path: routerPath,
    },
    history,
    location: { search },
    customizeForm,
    customizeTable,
    customizeBtnGroup,
    toggleLoading,
    customizeCollapse,
    remote,
  } = props;
  const { openFrom, isBackFlag = 1 } = querystring.parse(search.substr(1));
  const [loadings, setLoadings] = useState({});
  const [fileList, setFileList] = useState([]);
  const [displayDocAndDocFlow, setDisplayDocAndDocFlow] = useState({}); // 单据流与关联单据显示配置
  const [reviewStatus, setReviewStatus] = useState(''); // 预审结果状态
  const [aiReviewParams, setAiReviewParams] = useState(null); // 预审结果参数
  const basicInfoDs = useMemo(
    () =>
      new DataSet({
        ...basicInfo(),
        transport: {
          read: () => {
            return {
              url: `${SRM_SPUC}/v1/${organizationId}/po-header/${id}/detail`,
              method: 'GET',
            };
          },
          submit: ({ dataSet }) => {
            const lineDs = dataSet.getState('detailInfoDs');
            return {
              url: `${SRM_SPUC}/v1/${organizationId}/po-header/detail-approve`,
              method: 'POST',
              data: [
                {
                  poHeaderDetailDTO: dataSet.toJSONData()[0],
                  poLineDetailDTOs: lineDs.toJSONData(),
                },
              ],
            };
          },
        },
      }),
    [id]
  );
  const organizationInfoDs = useMemo(() => new DataSet(organizationInfo()), [id]);
  const detailInfoRemote = {
    ...detailInfo(),
    transport: {
      read: () => {
        return {
          url: `${SRM_SPUC}/v1/${organizationId}/po-line/${id}/detail`,
          method: 'GET',
        };
      },
    },
  };
  const detailInfoDs = useMemo(
    () =>
      new DataSet(
        remote
          ? remote.process(
              'SODR.WORKSPACE_ALLORDERS_DETAIL_PROCESS_DETAIL_INFO_DS',
              detailInfoRemote,
              { props, basicInfoDs }
            )
          : detailInfoRemote
      ),
    [id]
  );

  const giftInfoDs = useMemo(
    () =>
      new DataSet(
        giftInfoDsConfig({
          poHeaderId: id,
          params: { customizeUnitCode: 'SODR.WORKSPACE_ALLORDERS_DETAIL.GIFTINFO' },
        })
      ),
    [id]
  );
  const paymentTermInfoDs = useMemo(() => new DataSet(paymentTermInfo()), [id]);
  const basicCurrent = basicInfoDs.current;
  const { giftFlag, workFlowBusinessKey, oldTermHideFlag, fundTermDimension } = basicCurrent.get([
    'giftFlag',
    'workFlowBusinessKey',
    'oldTermHideFlag',
    'fundTermDimension',
  ]);
  // 是否展示赠品行
  const hasGift = useMemo(() => {
    return id && giftFlag;
  }, [id, giftFlag]);
  const receiptInfoDs = useMemo(() => new DataSet(receiptInfo()), [id]);
  const billingInfoDs = useMemo(() => new DataSet(billingInfo()), [id]);
  const supplementaryInfoDs = useMemo(() => new DataSet(supplementaryInfo()), [id]);
  const attachmentConfig = useMemo(
    () => ({
      readOnly: [1, 1, 1],
    }),
    []
  );
  const viewOnly = useMemo(() => openFrom === 'modal', [openFrom]); // 从弹框打开标识
  const isDocFlowLink = useMemo(() => openFrom === 'docFlow', [openFrom]); // 单据流页面标识
  const isSettleLink = useMemo(() => openFrom === 'settle', [openFrom]); // 结算模块跳转标识
  // 金额字段是否根据sourceCode判断处理
  const bySourceCode = useMemo(() => remote.process('bySourceCode'), []);
  const getValues = useCallback(() => {
    const getCurrentValue = (ds) => {
      const record = ds?.current || {};
      (ds.fields || []).forEach((i) => {
        if (i.isDirty(record)) {
          basicInfoDs.current.set({ [i.name]: record.get(i.name) });
        }
      });
    };
    [organizationInfoDs].forEach((i) => getCurrentValue(i));
    const poHeaderDetailDTO = basicInfoDs.toJSONData()[0];
    const poLineDetailDTOs = detailInfoDs.toJSONData();
    return {
      poHeaderDetailDTO,
      poLineDetailDTOs,
    };
  }, [id]);
  const contentList = useMemo(() => {
    const { authType, poSourcePlatform, electricSignFlag } = basicInfoDs?.current?.get([
      'authType',
      'poSourcePlatform',
      'electricSignFlag',
    ]);
    const list = [
      {
        key: 'basicInfo',
        content: (
          <Panel
            key="basicInfo"
            id="order-workSpace-detail-content-basicInfo"
            header={intl.get('sodr.workspace.view.panel.orderBasicInfo').d('订单基础信息')}
          >
            <BasicInfo
              ds={basicInfoDs}
              customizeForm={customizeForm}
              bySourceCode={bySourceCode}
              remote={remote}
            />
          </Panel>
        ),
      },
      {
        key: 'organizationInfo',
        content: (
          <Panel
            key="organizationInfo"
            id="order-workSpace-detail-content-organizationInfo"
            header={intl.get('sodr.workspace.view.panel.organization').d('交易方及采买组织信息')}
          >
            <OrganizationInfo ds={organizationInfoDs} customizeForm={customizeForm} />
          </Panel>
        ),
      },
      {
        key: 'detailInfo',
        content: (
          <Panel
            key="detailInfo"
            id="order-workSpace-detail-content-detailInfo"
            header={intl.get('sodr.workspace.view.panel.detailInfo').d('订单明细信息')}
          >
            <OrderDetailLine
              remote={remote}
              ds={detailInfoDs}
              basicInfoDs={basicInfoDs}
              customizeTable={customizeTable}
              bySourceCode={bySourceCode}
              isDocFlowLink={isDocFlowLink}
              displayDocAndDocFlow={displayDocAndDocFlow}
              fundTermDimension={fundTermDimension}
            />
          </Panel>
        ),
      },
      {
        key: 'giftInfo',
        content: (
          <Panel
            hidden={!hasGift}
            key="giftInfo"
            id="order-workSpace-detail-content-giftInfo"
            header={intl.get('sodr.workspace.view.panel.giftInfo').d('赠品明细信息')}
          >
            <GiftInfo
              ds={giftInfoDs}
              customizeTable={customizeTable}
              code="SODR.WORKSPACE_ALLORDERS_DETAIL.GIFTINFO"
            />
          </Panel>
        ),
      },
      {
        key: 'paymentTermInfo',
        content: (
          <Panel
            hidden={!oldTermHideFlag}
            key="paymentTermInfo"
            id="order-workSpace-detail-content-paymentTermInfo"
            header={intl.get('sodr.workspace.view.panel.paymentTermInfo').d('订单付款条款信息')}
          >
            <PaymentTermInfo
              ds={paymentTermInfoDs}
              customizeForm={customizeForm}
              customizeCode="SODR.WORKSPACE_ALLORDERS_DETAIL.PAYMENTTERMINFO"
              getValues={getValues}
            />
          </Panel>
        ),
      },
      {
        key: 'receiptInfo',
        content: (
          <Panel
            key="receiptInfo"
            id="order-workSpace-detail-content-receiptInfo"
            header={intl.get('sodr.workspace.view.panel.receiptInfo').d('收货/收单信息')}
          >
            <ReceiptInfo ds={receiptInfoDs} customizeForm={customizeForm} />
          </Panel>
        ),
      },
      {
        key: 'billingInfo',
        content: (
          <Panel
            key="billingInfo"
            id="order-workSpace-detail-content-billingInfo"
            header={intl.get('sodr.workspace.view.panel.billingInfo').d('开票信息')}
          >
            <BillingInfo ds={billingInfoDs} customizeForm={customizeForm} />
          </Panel>
        ),
      },
      {
        key: 'attachmentInfo',
        content: (
          <Content className={styles['order-workspace-detail-content']}>
            <AttachmentInfo
              viewOnly
              poHeaderId={id}
              ds={basicInfoDs}
              eSignfileList={fileList}
              eSignShow={electricSignFlag}
              attachmentConfig={attachmentConfig}
              terminateSignShow={electricSignFlag && SAAS_SIGN.test(authType)}
              customizeForm={customizeForm}
              customizeCode={[
                'SODR.WORKSPACE_ALLORDERS_DETAIL.ATTACHMENTINFO',
                'SODR.WORKSPACE_ALLORDERS_DETAIL.ATTACHMENTINFO_EXTERNAL',
              ]}
            />
          </Content>
        ),
      },
    ];
    const panels = remote.process('processPanels', list, { basicInfoDs, id });
    if (poSourcePlatform === 'CATALOGUE') {
      return panels.filter((i) => i.key !== 'billingInfo');
    } else if (poSourcePlatform === 'E-COMMERCE') {
      return panels;
    } else {
      return panels.filter((i) => !['receiptInfo', 'billingInfo'].includes(i.key));
    }
  });

  const fetchHeader = () => {
    loading({ all: true });
    if (isFunction(toggleLoading)) {
      toggleLoading(true);
    }
    fetchDoubleUom();
    basicInfoDs.query().then((res) => {
      loading({ all: false });
      if (remote?.event) {
        remote.event.fireEvent('detailSelection', {
          detailInfoDs,
          basicInfo: res,
        });
      }
      if (res) {
        if (res.giftFlag) {
          giftInfoDs.query();
        }
        setAiReviewParams(res?.poAiApproveResult?.searchDetailParams);
        setReviewStatus(res?.poAiApproveResult?.aiApproveStatus);
        organizationInfoDs.loadData([res]);
        paymentTermInfoDs.loadData([res]);
        receiptInfoDs.create(res);
        billingInfoDs.loadData([res]);
      }
      if (res.electricSignUrl) {
        getFileList([res.electricSignUrl]).then((v) => {
          if (getResponse(v)) {
            setFileList(v);
          }
        });
      }

      // 判断父组件有无传递toggleLoading
      if (isFunction(toggleLoading)) {
        toggleLoading();
      }
    });
  };

  const fetchLine = () => {
    detailInfoDs.query();
  };

  const useSetstate = (state = {}) => {
    [basicInfoDs, organizationInfoDs, detailInfoDs].forEach((i) => {
      i.setState(state);
    });
  };

  useEffect(() => {
    useSetstate({
      loading,
      basicInfoDs,
      detailInfoDs,
      organizationInfoDs,
      doubleUnitEnabled: 0,
    });
    if (id) {
      fetchHeader();
      // fetchLine();
      getDisplayDocAndDocFlow(setDisplayDocAndDocFlow);
    }
  }, [id]);

  const loading = (state = {}) => {
    setLoadings((preState) => ({ ...preState, ...state }));
  };

  // 查询业务规则定义双单位配置
  const fetchDoubleUom = async () => {
    loading({ fetchDoubleUom: true });
    const res = await queryCommonDoubleUomConfig();
    useSetstate({ doubleUnitEnabled: Number(res) });
    loading({ fetchDoubleUom: false });
  };

  const handleSupplementaryInfo = async () => {
    const beforRes = await remote.event.fireEvent('beforSupplementaryInfo', {
      basicInfoDs,
      detailInfoDs,
      organizationInfoDs,
      supplementaryInfoDs,
    });
    if (!beforRes) return;
    const handleBatchOk = async () => {
      const status = await supplementaryInfoDs.validate();
      if (status) {
        loading({ save: true });
        const { poHeaderDetailDTO } = getValues();
        const res = getResponse(
          await supplementary({
            query: {
              customizeUnitCode: 'SODR.WORKSPACE_ALLORDERS_DETAIL.SUPPLEMENT',
            },
            ...poHeaderDetailDTO,
            ...supplementaryInfoDs.current.toJSONData(),
          })
        );
        loading({ save: false });
        if (getResponse(res)) {
          notification.success();
          fetchHeader();
          fetchLine();
        }
        return res;
      }
      return false;
    };
    Modal.open({
      drawer: true,
      style: { width: 380 },
      title: intl.get(`sodr.workspace.view.button.recordingOfInformation`).d('信息补录'),
      children: customizeForm(
        { code: 'SODR.WORKSPACE_ALLORDERS_DETAIL.SUPPLEMENT' },
        <Form dataSet={supplementaryInfoDs} columns={1} labelLayout="float">
          <TextArea name="remark" resize="vertical" />
          {remote.process('supplementaryInfoExtraForm', {
            basicInfoDs,
            detailInfoDs,
            organizationInfoDs,
            supplementaryInfoDs,
          })}
        </Form>
      ),
      onOk: throttle(handleBatchOk, THROTTLE_TIME, { trailing: false }),
      afterClose: () => {
        supplementaryInfoDs.reset();
      },
    });
  };

  /**
   * 重新同步
   *
   */
  const reImportDelivery = () => {
    const poHeaderId = basicInfoDs?.current?.get('poHeaderId');
    const payload = { data: [{ poHeaderId }] };
    loading({ reImportDelivery: true });
    retryBatch(payload).then((res) => {
      loading({ reImportDelivery: false });
      if (getResponse(res)) {
        notification.success({
          message: intl.get('sodr.workspace.view.message.reImportERP').d('同步成功'),
        });
        fetchHeader();
        fetchLine();
      }
    });
  };

  const handlePrint = () => {
    loading({ print: true });
    print(id).then((res) => {
      loading({ print: false });
      if (res && res.type !== 'application/json') {
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const printWindow = window.open(fileURL);
        if (printWindow && printWindow.print) {
          printWindow.print();
        }
      } else if (res) {
        getJsonBlob(res)
          .then((response) => {
            notification.error({ message: response.message });
          })
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error('Error print:', error);
          });
      }
    });
  };

  const goDetail = (record, key, searchParams = {}) => {
    const poHeaderId = record?.get('poHeaderId');
    const poSourcePlatform = record?.get('poSourcePlatform');
    const sourceBillTypeCode = record?.get('sourceBillTypeCode');
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
        pathname = `/sodr/order-workspace/detail/all-orders/${poHeaderId}`;
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
    history.push({
      pathname,
      state: { source: 'all' },
      search: querystring.stringify({ ...pathParams, ...searchParams }),
    });
  };

  // 复制订单
  const handleOrderCopy = async (poHeaderId) => {
    loading({ handleOrderCopy: true });
    const res = await copyOrder({ poHeaderId });
    loading({ handleOrderCopy: false });
    if (getResponse(res)) {
      notification.success();
      history.push({
        pathname: `/sodr/order-workspace/detail/created-manually/${res.poHeaderId}`,
        state: { source: 'all', sourceId: poHeaderId, sourceType: 'copy' },
      });
    } else {
      return false;
    }
  };

  const Buttons = useMemo(
    () =>
      observer(({ dataSet, lineDs }) => {
        const record = dataSet?.current || {};
        const { companyId, supplierCompanyId } =
          organizationInfoDs.current?.get(['companyId', 'supplierCompanyId']) || {};
        const {
          // displaySyncFlag,
          deliverySyncStatus,
          approvedSyncStatus,
          createSyncFlag,
          syncStatus,
          operationList = [], // 后端返回可执行操作
          changeSyncStatus,
          msgNum,
        } = record.get([
          // 'displaySyncFlag',
          'deliverySyncStatus',
          'approvedSyncStatus',
          'createSyncFlag',
          'syncStatus',
          'operationList',
          'statusCode',
          'changeSyncStatus',
          'msgNum',
        ]);
        const headerBtnLoading =
          Object.values(loadings).includes(true) ||
          dataSet.status !== 'ready' ||
          lineDs.status !== 'ready';
        // 操作按钮(受后端控制)
        const defaultActions = [
          {
            name: 'EDIT',
            child: intl.get('sodr.workspace.view.option.edit').d('编辑'),
            btnProps: {
              funcType: 'flat',
              icon: 'mode_edit',
              onClick: () => goDetail(record, 'toBeSubmited'),
            },
          },
          {
            name: 'PUBLISH',
            child: intl.get('sodr.workspace.view.option.release').d('发布'),
            btnProps: {
              funcType: 'flat',
              icon: 'publish2',
              onClick: () => goDetail(record, 'toBeReleased'),
            },
          },
          {
            name: 'FEEDBACK',
            child: intl.get('sodr.workspace.view.option.feedbackAudit').d('反馈审核'),
            btnProps: {
              funcType: 'flat',
              icon: 'authorize',
              onClick: () => goDetail(record, 'feedbackUnderReview'),
            },
          },
          {
            name: 'CHANGE',
            child: intl.get('sodr.workspace.view.option.change').d('变更'),
            btnProps: {
              funcType: 'flat',
              icon: 'mode_edit',
              onClick: () => goDetail(record, 'change'),
            },
          },
          {
            name: 'CHANGE_EC',
            child: intl.get('sodr.workspace.view.option.change').d('变更'),
            btnProps: {
              funcType: 'flat',
              icon: 'mode_edit',
              onClick: () => goDetail(record, 'changeEC'),
            },
          },
          {
            name: 'CLOSE',
            child: intl.get('sodr.workspace.view.option.close').d('关闭'),
            btnProps: {
              funcType: 'flat',
              icon: 'not_interested',
              onClick: () => goDetail(record, 'close'),
            },
          },
          {
            name: 'CANCEL',
            child: intl.get('sodr.workspace.view.option.cancel').d('取消'),
            btnProps: {
              funcType: 'flat',
              icon: 'cancel',
              onClick: () => goDetail(record, 'cancel'),
            },
          },
          {
            name: 'COPY',
            child: intl.get('sodr.workspace.view.option.copy').d('复制'),
            btnProps: {
              funcType: 'flat',
              icon: 'queue',
              onClick: () => handleOrderCopy(id),
              loading: headerBtnLoading,
            },
          },
          {
            name: 'RECALL',
            child: intl.get(`sodr.common.model.common.revoke`).d('撤销变更'),
            btnProps: {
              funcType: 'flat',
              icon: 'close',
              onClick: () => goDetail(record, 'revoke'),
              loading: headerBtnLoading,
            },
          },
          {
            name: 'UNIFY_RECALL',
            child: intl.get(`sodr.common.view.button.unifyRecall`).d('撤销审批'),
            btnProps: {
              funcType: 'flat',
              icon: 'close',
              onClick: () => goDetail(record, 'unifyRecall'),
              loading: headerBtnLoading,
            },
          },
          {
            name: 'TERMINATE',
            child: intl.get(`sodr.common.view.button.terminate`).d('发起解约'),
            btnProps: {
              funcType: 'flat',
              icon: 'remove_done',
              onClick: () => goDetail(record, 'terminate'),
              loading: headerBtnLoading,
            },
          },
          {
            name: 'RETURN_NEW',
            child: intl.get(`sodr.common.view.button.return_new`).d('新建退货订单'),
            btnProps: {
              funcType: 'flat',
              icon: 'add',
              onClick: () => handleCreateReturnNew(basicCurrent),
              loading: headerBtnLoading,
            },
          },
        ];
        const handleRecord = () => {
          const modal = Modal.open({
            key: Modal.key(),
            title: intl.get(`${prefix}.view.title.operationHistory`).d('操作记录'),
            drawer: true,
            destroyOnClose: true,
            style: { width: 800 },
            children: <C7nOperationApprove poHeaderId={id} modal={modal} />,
            onOk: () => {},
            okText: intl.get('hzero.common.button.close').d('关闭'),
          });
        };
        const disabledERP = !(
          changeSyncStatus === 'FAIL' ||
          approvedSyncStatus === 'SYNCHRONIZING' ||
          syncStatus === 'FAIL' ||
          approvedSyncStatus === 'FAIL' ||
          deliverySyncStatus === 'FAIL' ||
          deliverySyncStatus === 'SYNCHRONIZING' ||
          createSyncFlag === 1
        );
        // createSyncFlag是undefined时disabledERP为true
        const disabledDelivery = disabledERP === 0 ? true : disabledERP;
        const approvaFlags = dataSet.getState('approvaFlags');
        const operationFlags = dataSet.getState('operationFlags');
        const approvaFlag = approvaFlags?.[workFlowBusinessKey];
        const operationFlag = operationFlags?.[workFlowBusinessKey];
        const { taskId, processInstanceId } = approvaFlag || {};
        const buttons = [
          {
            name: 'approval',
            btnComp: Button,
            hidden: !(approvaFlags && approvaFlag),
            child: intl.get('sodr.workspace.view.option.approval').d('审批'),
            btnProps: {
              wait: THROTTLE_TIME,
              funcType: 'flat',
              icon: 'authorize',
              type: 'c7n-pro',
              onClick: async () => {
                openApproveModal({
                  modalProps: {
                    closable: true,
                  },
                  taskId,
                  processInstanceId,
                  onSuccess: () => {
                    history.push({
                      pathname: '/sodr/order-workspace/list',
                    });
                  },
                });
              },
              permissionList: [
                {
                  code: 'srm.po-admin.po.order-workspace.button.approval',
                  meaning: '订单工作台-详情-审批中-审批',
                },
              ],
            },
          },
          {
            name: 'revokeApproval',
            btnComp: Button,
            hidden: !(operationFlags && operationFlag?.REVOKE),
            child: intl.get('sodr.workspace.view.option.revokeApproval').d('撤销审批'),
            btnProps: {
              wait: THROTTLE_TIME,
              funcType: 'flat',
              icon: 'reply',
              type: 'c7n-pro',
              onClick: async () => {
                const res = await revokeWorkFlow(workFlowBusinessKey);
                if (res) {
                  history.push({
                    pathname: '/sodr/order-workspace/list',
                  });
                }
              },
              permissionList: [
                {
                  code: 'srm.po-admin.po.order-workspace.button.revoke_approval',
                  meaning: '订单工作台-详情-审批中-撤销审批',
                },
              ],
            },
          },
          {
            name: 'supplementaryRecording',
            child: intl.get(`sodr.workspace.view.button.recordingOfInformation`).d('信息补录'),
            btnProps: {
              icon: 'mode_edit',
              funcType: 'flat',
              onClick: handleSupplementaryInfo,
              loading: headerBtnLoading,
            },
          },
          {
            name: 'operationRecord',
            child: intl.get('sodr.workspace.view.button.operationRecord').d('操作记录'),
            btnProps: {
              icon: 'operation_service_request',
              funcType: 'flat',
              onClick: handleRecord,
            },
          },
          {
            name: 'messageBoard',
            btnComp: C7nMessage,
            childFor: 'messageBoardName',
            btnProps: {
              poHeaderId: id,
              btnProps: {
                icon: 'message2',
                funcType: 'flat',
                type: 'c7n-pro',
              },
              messageBoardName: intl.get('sodr.workspace.view.button.messageBoard').d('留言板'),
            },
          },
          {
            name: 'print',
            child: intl.get(`sodr.workspace.view.button.print`).d('打印'),
            btnProps: {
              wait: THROTTLE_TIME,
              icon: 'print',
              funcType: 'flat',
              onClick: handlePrint,
              loading: headerBtnLoading,
            },
          },
          {
            name: 'printNew',
            btnComp: PrintProButton,
            child: intl.get(`sodr.workspace.view.button.print`).d('打印'),
            childFor: 'buttonText',
            btnProps: {
              loading: headerBtnLoading,
              buttonProps: {
                funcType: 'flat',
                type: 'c7n-pro',
                wait: THROTTLE_TIME,
              },
              requestUrl: `${SRM_SPUC}/v1/${organizationId}/po-header/${id}/print-token`,
              method: 'GET',
              // buttonText: intl.get(`sodr.workspace.view.button.print`).d('打印'),
            },
          },
          {
            name: 'resync',
            child: intl.get(`sodr.workspace.view.button.resynchronize`).d('重新同步'),
            btnProps: {
              wait: THROTTLE_TIME,
              icon: 'sync',
              funcType: 'flat',
              onClick: reImportDelivery,
              loading: headerBtnLoading,
              disabled: disabledDelivery,
            },
          },
          {
            name: 'chatRoom',
            btnComp: Button,
            hidden: !supplierCompanyId,
            child: intl.get(`sodr.workspace.view.button.chatRoom`).d('在线沟通'),
            btnProps: {
              notificationDot: msgNum > 0,
              wait: THROTTLE_TIME,
              icon: 'headset',
              funcType: 'flat',
              type: 'c7n-pro',
              onClick: async () => {
                const res = getResponse(await initChatOnlineRoom({ poHeaderId: id, camp: 'pur' }));
                if (res) {
                  record.set({ msgNum: 0 });
                  const chatRoomModal = Modal.open({
                    resizable: true,
                    style: { width: 742 },
                    bodyStyle: { padding: 0 },
                    footer: null,
                    header: null,
                    drawer: true,
                    children: (
                      <ChatRoom
                        contentClass={styles.chatRoom}
                        onClose={() => chatRoomModal.close()}
                        showClose
                        roomParams={{
                          businessNo: id,
                          businessCode: 'sodr',
                          purchaseTenantId: organizationId,
                          currentUser: {
                            tenantId: organizationId,
                            companyId,
                            userId: currentUser.id,
                          },
                        }}
                      />
                    ),
                  });
                }
              },
            },
          },
        ];

        const docFlowButtons = [
          {
            name: 'operationRecord',
            type: 'c7n-pro',
            btnComp: Button,
            child: intl.get('sodr.workspace.view.button.operationRecord').d('操作记录'),
            btnProps: {
              icon: 'operation_service_request',
              funcType: 'flat',
              type: 'c7n-pro',
              onClick: handleRecord,
            },
          },
        ];
        if (isDocFlowLink || isSettleLink) {
          return <DynamicButtons buttons={docFlowButtons} />;
        }

        const newBtns = [
          ...buttons,
          ...defaultActions.filter((i) => operationList.includes(i.name)),
        ];

        const dynamicButtons = remote
          ? remote.process('dynamicButtons', newBtns, {
              dataSet,
              lineDs,
              fetchHeader,
              fetchLine,
              props,
              loading,
              loadings,
              setLoadings,
            })
          : newBtns;

        return (
          <Fragment>
            {customizeBtnGroup(
              { code: 'SODR.WORKSPACE_ALLORDERS_DETAIL.BUTTONS', pro: true },
              <DynamicButtons
                buttons={dynamicButtons}
                maxNum={5}
                defaultBtnType="c7n-pro"
                permissions={[
                  {
                    name: 'supplementaryRecording',
                    code: 'srm.po-admin.po.order-workspace.ps.button.allorderdetail.save',
                    meaning: '订单工作台-全部明细-保存',
                  },
                  {
                    name: 'operationRecord',
                    code: 'srm.po-admin.po.order-workspace.ps.button.allorderdetail.record',
                    meaning: '订单工作台-全部明细-操作记录',
                  },
                  {
                    name: 'messageBoard',
                    code: 'srm.po-admin.po.order-workspace.ps.button.allorderdetail.messageboard',
                    meaning: '订单工作台-全部明细-留言板',
                  },
                  {
                    name: 'print',
                    code: 'srm.po-admin.po.order-workspace.ps.button.allorderdetail.print',
                    meaning: '订单工作台-全部明细-打印',
                  },
                  {
                    name: 'printNew',
                    code: 'srm.po-admin.po.order-workspace.button.allorderdetail.printnew',
                    meaning: '订单工作台-全部明细-新打印',
                  },
                  {
                    name: 'resync',
                    code: 'srm.po-admin.po.order-workspace.ps.button.allorderdetail.resynchronize',
                    meaning: '订单工作台-全部明细-重新同步',
                  },
                  {
                    name: 'EDIT',
                    code: 'srm.po-admin.po.order-workspace.ps.button.wholetobesubmited.submit',
                    type: 'button',
                    meaning: '订单工作台-整单待提交-提交',
                  },
                  {
                    name: 'PUBLISH',
                    code: 'srm.po-admin.po.order-workspace.ps.button.wholetobereleased.release',
                    type: 'button',
                    meaning: '订单工作台-整单待发布-发布',
                  },
                  {
                    name: 'FEEDBACK',
                    code: 'srm.po-admin.po.order-workspace.ps.button.wholefdback.agree',
                    type: 'button',
                    meaning: '订单工作台-整单反馈审核中-同意',
                  },
                  {
                    name: 'CHANGE',
                    code: 'srm.po-admin.po.order-workspace.ps.button.changedetail.submit',
                    type: 'button',
                    meaning: '订单工作台-变更明细-提交',
                  },
                  {
                    name: 'CHANGE_EC',
                    code: 'srm.po-admin.po.order-workspace.button.EC-change-detail.submit',
                    type: 'button',
                    meaning: '订单工作台-电商变更明细-提交',
                  },
                  {
                    name: 'CLOSE',
                    code: 'srm.po-admin.po.order-workspace.ps.button.canceldetail.close',
                    type: 'button',
                    meaning: '订单工作台-取消明细-关闭',
                  },
                  {
                    name: 'CANCEL',
                    code: 'srm.po-admin.po.order-workspace.ps.button.canceldetail.cancel',
                    type: 'button',
                    meaning: '订单工作台-取消明细-取消',
                  },
                  {
                    name: 'COPY',
                    code: 'srm.po-admin.po.order-workspace.ps.button.canceldetail.copy',
                    type: 'button',
                    meaning: '订单工作台-待提交-复制',
                  },
                  {
                    name: 'RECALL',
                    code: 'srm.po-admin.po.order-workspace.ps.button.changedetail.revoke',
                    type: 'button',
                    meaning: '订单工作台-撤销变更',
                  },
                  {
                    name: 'UNIFY_RECALL',
                    code: 'srm.po-admin.po.order-workspace.button.canceldetail.unifyRecall',
                    type: 'button',
                    meaning: '订单工作台-撤销审批',
                  },
                  {
                    name: 'TERMINATE',
                    code: 'srm.po-admin.po.order-workspace.button.cancelsigingdetail.terminate',
                    type: 'button',
                    meaning: '订单工作台-撤销签署明细-发起解约',
                  },
                  {
                    name: 'chatRoom',
                    code: 'srm.po-admin.po.order-workspace.button.chatRoom',
                    type: 'button',
                    meaning: '订单工作台-详细页-在线沟通',
                  },
                  {
                    name: 'RETURN_NEW',
                    code: 'srm.po-admin.po.order-workspace.button.return_new',
                    type: 'button',
                    meaning: '订单工作台-整单-创建退货订单',
                  },
                ]}
              />
            )}
          </Fragment>
        );
      }),
    [id, loadings, handleCreateReturnNew, basicCurrent, workFlowBusinessKey, fetchHeader, fetchLine]
  );

  const handleCreateReturnNew = useCallback(
    async (record) => {
      basicInfoDs.status = 'submitting';
      const res = getResponse(await createReturnPoNew(record.toData()));
      if (res) {
        const { poHeaderId } = res;
        history.push({
          pathname: `/sodr/order-workspace/detail/created-manually/${poHeaderId || 'new'}`,
        });
      }
      basicInfoDs.status = 'ready';
    },
    [basicInfoDs]
  );

  const getIMRequestBody = () => ({
    ...basicInfoDs?.records[0].data,
    unreadCount:
      basicInfoDs?.records[0].data.unreadCount === undefined
        ? 0
        : basicInfoDs?.records[0].data.unreadCount,
  });

  const backPath = useMemo(() => {
    return Number(isBackFlag) !== 1
      ? null
      : routerPath.includes('pub')
      ? '/pub/sodr/order-workspace/list'
      : '/sodr/order-workspace/list';
  }, [isBackFlag]);
  return (
    <Fragment>
      <OrderAffix />
      {viewOnly && (
        <Header title={intl.get('sodr.workspace.view.title.orderDetails').d('订单明细')} />
      )}
      {!viewOnly && (
        <Header
          backPath={backPath}
          title={
            [
              'PUBLISHED',
              'PART_FEED_BACK',
              // 'DELIVERY_DATE_REVIEW',
              'DELIVERY_DATE_REJECT',
              'CANCELTOBECOMFIRMED',
              'CLOSETOBECOMFIRMED',
            ].includes(basicInfoDs.records[0].data.statusCode) ? (
              // 已发布、部分反馈、订单反馈审核拒绝、取消待确认、关闭待确认的订单发送“订单确认卡片”
              <IMChatDraggable
                showDetail
                cardCode="PO_CONFIRM_DETAIL"
                icon="baseline-drag_indicator"
                tooltip=""
                requestBody={getIMRequestBody}
                dragText={`${intl.get('sodr.workspace.model.operationRecord.order').d('订单')}${
                  basicInfoDs.records[0].data.displayPoNum
                }`}
              >
                {intl.get('sodr.workspace.view.title.orderDetails').d('订单明细')}
              </IMChatDraggable>
            ) : (
              <IMChatDraggable
                showDetail
                cardCode="PO_RECEIVE_DETAIL"
                icon="baseline-drag_indicator"
                tooltip=""
                requestBody={getIMRequestBody}
                dragText={`${intl.get('sodr.workspace.model.operationRecord.order').d('订单')}${
                  basicInfoDs.records[0].data.displayPoNum
                }`}
              >
                {intl.get('sodr.workspace.view.title.orderDetails').d('订单明细')}
              </IMChatDraggable>
            )
          }
        >
          <Buttons dataSet={basicInfoDs} lineDs={detailInfoDs} />
        </Header>
      )}
      <AlertTooltip reviewStatus={reviewStatus} aiReviewParams={aiReviewParams} />
      <div
        className={styles['order-workspace-detail-container']}
        id="order-workspace-detail-container"
      >
        <Spin spinning={loadings.all}>
          {customizeCollapse(
            {
              code: 'SODR.WORKSPACE_ALLORDERS_DETAIL.COLLAPSE',
            },
            <Collapse
              trigger="text-icon"
              ghost
              expandIconPosition="text-right"
              defaultActiveKey={defaultActiveKey}
            >
              {contentList.map((i) => i.content)}
            </Collapse>
          )}
        </Spin>
      </div>
    </Fragment>
  );
};

export default compose(
  withCustomize({
    unitCode: [
      'SODR.WORKSPACE_ALLORDERS_DETAIL.BASICINFO',
      'SODR.WORKSPACE_ALLORDERS_DETAIL.ORGANIZATIONINFO',
      'SODR.WORKSPACE_ALLORDERS_DETAIL.DETAILINFO',
      // 'SODR.WORKSPACE_ALLORDERS_DETAIL.OTHERINFO',
      // 'SODR.WORKSPACE_ALLORDERS_DETAIL.PARTNER',
      'SODR.WORKSPACE_ALLORDERS_DETAIL.RECEIPTINFO',
      'SODR.WORKSPACE_ALLORDERS_DETAIL.BILLINGINFO',
      'SODR.WORKSPACE_ALLORDERS_DETAIL.BOM',
      // 'SODR.WORKSPACE_ALLORDERS_DETAIL.TABS',
      'SODR.WORKSPACE_ALLORDERS_DETAIL.ATTACHMENTINFO',
      'SODR.WORKSPACE_ALLORDERS_DETAIL.ATTACHMENTINFO_EXTERNAL',
      'SODR.WORKSPACE_ALLORDERS_DETAIL.SUPPLEMENT',
      'SODR.WORKSPACE_ALLORDERS_DETAIL.BUTTONS',
      'SODR.WORKSPACE_ALLORDERS_DETAIL.COLLAPSE',
      'SODR.WORKSPACE_ALLORDERS_DETAIL.GIFTINFO',
      'SODR.WORKSPACE_ALLORDERS_DETAIL.PAYMENTTERMINFO',
    ],
  }),
  formatterCollections({
    code: ['sodr.workspace', 'sodr.common'],
  }),
  remotes(...remoteConfig)
)(AllOrders);
