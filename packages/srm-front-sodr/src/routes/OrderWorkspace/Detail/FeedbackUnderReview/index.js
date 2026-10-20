/*
 * FeedbackUnderReview - 订单明细页-订单反馈审核中
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, useEffect, useMemo, useState, useCallback } from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { Spin, Radio, Collapse } from 'choerodon-ui';
import { compose, isEmpty, isFunction } from 'lodash';
import { observer } from 'mobx-react-lite';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getCurrentOrganizationId, getResponse, getCurrentUser } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  queryCommonDoubleUomConfig,
  rejectReasonModal,
  getDisplayDocAndDocFlow,
  handleOpenFundTermIdDetail,
} from '@/routes/components/utils';
// import { Button } from 'components/Permission';
import remotes from 'utils/remote';
import ChatRoom from 'srm-front-mobile/lib/components/Chat/Room';

import AttachmentInfo from '@/routes/components/AttachmentInfo';
import OrderAffix from '@/routes/components/OrderAffix';
import { reviewReject, agree, initChatOnlineRoom } from '@/services/orderWorkspaceService';
import C7nOperationApprove from '@/routes/components/C7nOperationApprove';
import C7nMessage from '@/routes/components/C7nMessage';
import Button from '@/routes/components/DotButton';
import { getFileList } from '@/services/orderReleaseService';
import { giftInfoDsConfig, GiftInfo } from '@/routes/components/GiftInfo';
import PaymentTermInfo, { paymentTermInfo } from '@/routes/components/PaymentTermInfo';
import remoteConfig from './remote';
import {
  basicInfo,
  organizationInfo,
  receiptInfo,
  billingInfo,
} from './store/feedbackUnderReviewDs';
import { detailInfo } from './store/OrderDetailLineDs';
import BasicInfo from './BasicInfo';
import OrganizationInfo from './OrganizationInfo';
import OrderDetailLine from './OrderDetailLine';
import ReceiptInfo from './ReceiptInfo';
import BillingInfo from './BillingInfo';
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
const FeedbackUnderReview = (props) => {
  const {
    history,
    match: {
      params: { id },
    },
    location: { state: { source, sourceType, sourceId } = {} },
    customizeForm,
    customizeTable,
    customizeBtnGroup,
    customizeCollapse,
    remote,
  } = props;
  const { beforeActionFn } = remote.props?.process || {};
  const [loadings, setLoadings] = useState({});
  const [fileList, setFileList] = useState([]);
  const [mode, setMode] = useState(1);
  const [displayDocAndDocFlow, setDisplayDocAndDocFlow] = useState({}); // 单据流与关联单据显示配置
  const backPath = useMemo(
    () =>
      source === 'all'
        ? `/sodr/order-workspace/detail/all-orders/${id}`
        : sourceType === 'copy'
        ? `/sodr/order-workspace/detail/all-orders/${sourceId}`
        : '/sodr/order-workspace/list',
    [source, sourceType]
  );
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
    []
  );
  const organizationInfoDs = useMemo(() => new DataSet(organizationInfo()), []);
  const detailInfoDs = useMemo(
    () =>
      new DataSet(
        remote.process('processDetailInfoDsConfig', {
          ...detailInfo(),
          transport: {
            read: () => {
              return {
                url: `${SRM_SPUC}/v1/${organizationId}/po-line/${id}/detail`,
                method: 'GET',
              };
            },
          },
        })
      ),
    []
  );
  const giftInfoDs = useMemo(
    () =>
      new DataSet(
        giftInfoDsConfig({
          poHeaderId: id,
          params: { customizeUnitCode: 'SODR.WORKSPACE_FEEDBACK_DETAIL.GIFTINFO' },
        })
      ),
    [id]
  );
  const paymentTermInfoDs = useMemo(() => new DataSet(paymentTermInfo()), [id]);
  const basicCurrent = basicInfoDs.current;
  const {
    giftFlag,
    poSourcePlatform,
    collByLineFlag,
    oldTermHideFlag,
    fundTermDimension,
  } = basicCurrent.get([
    'giftFlag',
    'poSourcePlatform',
    'collByLineFlag',
    'oldTermHideFlag',
    'fundTermDimension',
  ]);
  // 是否展示赠品行
  const hasGift = useMemo(() => {
    return id && giftFlag;
  }, [id, giftFlag]);
  const receiptInfoDs = useMemo(() => new DataSet(receiptInfo()), []);
  const billingInfoDs = useMemo(() => new DataSet(billingInfo()), []);
  const attachmentConfig = useMemo(
    () => ({
      readOnly: [1, 0, 1],
    }),
    []
  );
  // 金额字段是否根据sourceCode判断处理
  const bySourceCode = useMemo(() => remote.process('bySourceCode'), []);
  const fetchDetailPoLine = (e) => {
    const { value } = e?.target || {};
    setMode(value);
    detailInfoDs.setQueryParameter('lineDisplay', value ? 0 : 1);
    detailInfoDs.query();
  };

  const getValues = useCallback(() => {
    const poHeaderDetailDTO = basicInfoDs.toJSONData()[0];
    const poLineDetailDTOs = detailInfoDs.toJSONData();
    const values = {
      poHeaderDetailDTO: { ...poHeaderDetailDTO, poWorkbenchFlag: 1 },
      poLineDetailDTOs,
    };
    return values;
  }, [basicInfoDs, detailInfoDs]);

  const contentList = useMemo(() => {
    const list = [
      {
        key: 'basicInfo',
        content: (
          <Panel
            key="basicInfo"
            id="order-workSpace-detail-content-basicInfo"
            header={intl.get('sodr.workspace.view.panel.orderBasicInfo').d('订单基础信息')}
          >
            <BasicInfo ds={basicInfoDs} customizeForm={customizeForm} bySourceCode={bySourceCode} />
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
            extra={
              <div onClick={(e) => e.stopPropagation()}>
                <Radio.Group
                  onChange={fetchDetailPoLine}
                  className={styles['approval-radio-group']}
                  value={mode}
                >
                  <Radio.Button value={1}>
                    {intl.get('sodr.workspace.model.common.newLineDisplay').d('隐藏不可审核订单行')}
                  </Radio.Button>
                  <Radio.Button value={0}>
                    {intl.get('sodr.common.model.common.allDisplay').d('全部行')}
                  </Radio.Button>
                </Radio.Group>
              </div>
            }
          >
            <OrderDetailLine
              remote={remote}
              ds={detailInfoDs}
              basicInfoDs={basicInfoDs}
              customizeTable={customizeTable}
              bySourceCode={bySourceCode}
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
              code="SODR.WORKSPACE_FEEDBACK_DETAIL.GIFTINFO"
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
              customizeCode="SODR.WORKSPACE_FEEDBACK_DETAIL.PAYMENTTERMINFO"
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
              eSignShow={basicInfoDs.toJSONData()[0].electricSignFlag}
              eSignfileList={fileList}
              ds={basicInfoDs}
              poHeaderId={id}
              attachmentConfig={attachmentConfig}
              customizeForm={customizeForm}
              customizeCode={[
                'SODR.WORKSPACE_FEEDBACK_DETAIL.ATTACHMENTINFO',
                'SODR.WORKSPACE_FEEDBACK_DETAIL.ATTACHMENTINFO_EXTERNAL',
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

  const useSetstate = (state = {}) => {
    [basicInfoDs, organizationInfoDs, detailInfoDs].forEach((i) => {
      i.setState(state);
    });
  };

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

  useEffect(() => {
    useSetstate({
      loading,
      basicInfoDs,
      detailInfoDs,
      organizationInfoDs,
      doubleUnitEnabled: 0,
    });
    if (id) {
      loading({ all: true });
      fetchDoubleUom();
      getDisplayDocAndDocFlow(setDisplayDocAndDocFlow);
      basicInfoDs.query().then((res) => {
        loading({ all: false });
        if (res) {
          if (res.giftFlag) {
            giftInfoDs.query();
          }
          organizationInfoDs.loadData([res]);
          paymentTermInfoDs.loadData([res]);
          receiptInfoDs.create(res);
          billingInfoDs.create(res);
        }
        if (res.electricSignUrl) {
          getFileList([res.electricSignUrl]).then((v) => {
            if (getResponse(v)) {
              setFileList(v);
            }
          });
        }
      });
      // detailInfoDs.query();
    }
  }, []);

  const action = async (type) => {
    loading({ [type]: true });
    const { selected } = detailInfoDs;
    const isAgree = type === 'agree';
    if (isAgree) {
      const res = await handleOpenFundTermIdDetail('feedback', { body: getValues() });
      if (!res) return loading({ [type]: false });
    } else {
      const rejectModalRes = await rejectReasonModal({
        customizeForm,
        code: 'SODR.WORKSPACE_FEEDBACK_DETAIL.FEEDBACKMODAL',
      });
      if (!rejectModalRes) return loading({ [type]: false });
      basicInfoDs.current.set(rejectModalRes);
    }
    const byLine = collByLineFlag && !isEmpty(selected);
    const line = byLine ? selected.map((i) => ({ ...i.toJSONData() })) : detailInfoDs.toJSONData();
    // 添加弱校验埋点
    if (isFunction(beforeActionFn)) {
      const result = await beforeActionFn({
        loading,
        type,
        byLine,
        isAgree,
        basicInfoDs,
        detailInfoDs,
        organizationInfoDs,
      });
      if (!result) return false;
    }
    const data = [
      {
        ...basicInfoDs.toJSONData()[0],
        checkFlag: byLine ? 1 : 0,
        poWorkbenchFlag: 1,
        poLineLocationList: line.map((i) => {
          return isAgree
            ? { ...i, objectVersionNumber: i.locationVersionNumber }
            : { ...i, objectVersionNumber: i.locationVersionNumber, deliveryDateRejectFlag: 1 };
        }),
      },
    ];
    const query = {
      customizeUnitCode: String([
        'SODR.WORKSPACE_FEEDBACK_DETAIL.BASICINFO',
        'SODR.WORKSPACE_FEEDBACK_DETAIL.ORGANIZATIONINFO',
        'SODR.WORKSPACE_FEEDBACK_DETAIL.RECEIPTINFO',
        'SODR.WORKSPACE_FEEDBACK_DETAIL.BILLINGINFO',
        'SODR.WORKSPACE_FEEDBACK_DETAIL.ATTACHMENTINFO',
        'SODR.WORKSPACE_FEEDBACK_DETAIL.DETAILINFO',
        'SODR.WORKSPACE_FEEDBACK_DETAIL.ATTACHMENTINFO_EXTERNAL',
        'SODR.WORKSPACE_FEEDBACK_DETAIL.PAYMENTTERMINFO',
      ]),
    };
    (isAgree ? agree(data, query) : reviewReject(data, query)).then((res) => {
      loading({ [type]: false });
      if (getResponse(res)) {
        notification.success();
        history.push({
          pathname: backPath,
          state: { _back: -1 },
        });
      }
    });
  };
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

  const HeaderButtons = observer(() => {
    const record = basicInfoDs.current;
    const { msgNum } = record.get(['msgNum']);
    const { companyId, supplierCompanyId } = organizationInfoDs.current?.get([
      'companyId',
      'supplierCompanyId',
    ]);
    const headerBtnLoading =
      loadings.agree ||
      loadings.return ||
      basicInfoDs.status !== 'ready' ||
      detailInfoDs.status !== 'ready';
    const headerPreBtns = [
      {
        name: 'agree',
        btnComp: Button,
        child: intl.get(`sodr.workspace.view.button.agree`).d('同意'),
        btnProps: {
          wait: THROTTLE_TIME,
          icon: 'check',
          type: 'c7n-pro',
          funcType: 'raised',
          color: 'primary',
          onClick: () => action('agree'),
          loading: headerBtnLoading,
          permissionList: [
            {
              code: 'srm.po-admin.po.order-workspace.ps.button.underfdbackaudit.agree',
              type: 'c7n-pro',
              meaning: '订单工作台-反馈审核中明细-同意',
            },
          ],
        },
      },
      {
        name: 'return',
        btnComp: Button,
        child: intl.get(`sodr.workspace.view.button.return`).d('退回'),
        btnProps: {
          wait: THROTTLE_TIME,
          icon: 'reply',
          funcType: 'flat',
          type: 'c7n-pro',
          onClick: () => action('return'),
          loading: headerBtnLoading,
          permissionList: [
            {
              code: 'srm.po-admin.po.order-workspace.ps.button.underfdbackaudit.return',
              type: 'c7n-pro',
              meaning: '订单工作台-反馈审核中明细-退回',
            },
          ],
        },
      },
      {
        name: 'record',
        btnComp: Button,
        child: intl.get('sodr.workspace.view.button.operationRecord').d('操作记录'),
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          type: 'c7n-pro',
          onClick: handleRecord,
          permissionList: [
            {
              code: 'srm.po-admin.po.order-workspace.ps.button.underfdbackaudit.record',
              type: 'c7n-pro',
              meaning: '订单工作台-反馈审核中明细-操作记录',
            },
          ],
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
            permissionList: [
              {
                code: 'srm.po-admin.po.order-workspace.ps.button.underfdbackaudit.messageboard',
                type: 'c7n-pro',
                meaning: '订单工作台-反馈审核中明细-留言板',
              },
            ],
          },
          messageBoardName: intl.get('sodr.workspace.view.button.messageBoard').d('留言板'),
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
          permissionList: [
            {
              code: 'srm.po-admin.po.order-workspace.button.chatRoom',
              meaning: '订单工作台-详细页-在线沟通',
            },
          ],
        },
      },
    ];

    const headerBtns = remote
      ? remote.process('SODR.WORKSPACE_FEEDBACK_DETAIL_PROCESS_HEADER_BUTTONS', headerPreBtns, {
          props,
          loading,
          loadings,
          setLoadings,
          basicInfoDs,
          detailInfoDs,
        })
      : headerPreBtns;

    return customizeBtnGroup(
      {
        code: 'SODR.WORKSPACE_FEEDBACK_DETAIL.BUTTONS',
        pro: true,
      },
      <DynamicButtons buttons={headerBtns} />
    );
  });

  return (
    <Fragment>
      <OrderAffix />
      <Header
        backPath={backPath}
        title={intl.get('sodr.workspace.view.title.orderDetails').d('订单明细')}
      >
        <HeaderButtons />
      </Header>
      <div
        className={styles['order-workspace-detail-container']}
        id="order-workspace-detail-container"
      >
        <Spin spinning={loadings.all}>
          {customizeCollapse(
            {
              code: 'SODR.WORKSPACE_FEEDBACK_DETAIL.COLLAPSE',
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
      'SODR.WORKSPACE_FEEDBACK_DETAIL.BUTTONS',
      'SODR.WORKSPACE_FEEDBACK_DETAIL.BASICINFO',
      'SODR.WORKSPACE_FEEDBACK_DETAIL.ORGANIZATIONINFO',
      'SODR.WORKSPACE_FEEDBACK_DETAIL.DETAILINFO',
      // 'SODR.WORKSPACE_FEEDBACK_DETAIL.OTHERINFO',
      // 'SODR.WORKSPACE_FEEDBACK_DETAIL.PARTNER',
      'SODR.WORKSPACE_FEEDBACK_DETAIL.RECEIPTINFO',
      'SODR.WORKSPACE_FEEDBACK_DETAIL.BILLINGINFO',
      'SODR.WORKSPACE_FEEDBACK_DETAIL.BOM',
      // 'SODR.WORKSPACE_FEEDBACK_DETAIL.TABS',
      'SODR.WORKSPACE_FEEDBACK_DETAIL.ATTACHMENTINFO',
      'SODR.WORKSPACE_FEEDBACK_DETAIL.ATTACHMENTINFO_EXTERNAL',
      'SODR.WORKSPACE_FEEDBACK_DETAIL.COLLAPSE',
      'SODR.WORKSPACE_FEEDBACK_DETAIL.GIFTINFO',
      'SODR.WORKSPACE_FEEDBACK_DETAIL.FEEDBACKMODAL',
      'SODR.WORKSPACE_FEEDBACK_DETAIL.PAYMENTTERMINFO',
    ],
  }),
  formatterCollections({
    code: ['sodr.workspace', 'sodr.common'],
  }),
  remotes(...remoteConfig)
)(FeedbackUnderReview);
