/*
 * OrderApproval - 订单明细页-订单审批
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, useEffect, useMemo, useState, useCallback } from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { Spin, Radio, Collapse } from 'choerodon-ui';
import { compose } from 'lodash';
import { observer } from 'mobx-react-lite';

import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
// import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { Button } from 'components/Permission';
import DynamicButtons from '_components/DynamicButtons';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import remotes from 'utils/remote';
import { openApproveModal } from '_components/ApproveModal';

import AttachmentInfo from '@/routes/components/AttachmentInfo';
import C7nOperationApprove from '@/routes/components/C7nOperationApprove';
import {
  queryCommonDoubleUomConfig,
  getDisplayDocAndDocFlow,
  revokeWorkFlow,
} from '@/routes/components/utils';
import OrderAffix from '@/routes/components/OrderAffix';
import { giftInfoDsConfig, GiftInfo } from '@/routes/components/GiftInfo';
import PaymentTermInfo, { paymentTermInfo } from '@/routes/components/PaymentTermInfo';
import { print } from '@/services/orderWorkspaceService';
import AlertTooltip from '../../AlertTooltip';
import remoteConfig from './remote';
import {
  basicInfo,
  organizationInfo,
  // approvalComments,
  receiptInfo,
  billingInfo,
} from './store/orderApprovalDs';
import { detailInfo } from './store/OrderDetailLineDs';
import BasicInfo from './BasicInfo';
import OrganizationInfo from './OrganizationInfo';
import OrderDetailLine from './OrderDetailLine';
import ReceiptInfo from './ReceiptInfo';
import BillingInfo from './BillingInfo';
import styles from '../index.less';

const organizationId = getCurrentOrganizationId();
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
const OrderApproval = (props) => {
  const {
    history,
    match: {
      params: { poHeaderId },
      path,
    },
    location: { state: { source, sourceType, sourceId } = {} },
    customizeForm,
    customizeTable,
    customizeBtnGroup,
    customizeCollapse,
    remote,
    onLoad,
    onFormLoaded,
  } = props;
  const isApprovalFlag = path.includes('pub');
  const [loadings, setLoadings] = useState({});
  const [displayDocAndDocFlow, setDisplayDocAndDocFlow] = useState({}); // 单据流与关联单据显示配置
  const [isNewApprove, setIsNewApprove] = useState(false); // 是否是新建审批
  const [mode, setMode] = useState('onlyChange');
  const [reviewStatus, setReviewStatus] = useState(''); // 预审结果状态
  const [aiReviewParams, setAiReviewParams] = useState(null); // 预审结果参数
  const backPath = useMemo(
    () =>
      source === 'all'
        ? `/sodr/order-workspace/detail/all-orders/${poHeaderId}`
        : sourceType === 'copy'
        ? `/sodr/order-workspace/detail/all-orders/${sourceId}`
        : '/sodr/order-workspace/list',
    [source, sourceType]
  );

  const basicInfoRemote = {
    ...basicInfo(),
    transport: {
      read: () => {
        return {
          url: `${SRM_SPUC}/v1/${organizationId}/po-header/${poHeaderId}/detail`,
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
  };

  const basicInfoDs = useMemo(
    () =>
      new DataSet(
        remote
          ? remote.process(
              'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL_PROCESS_BASIC_DS',
              basicInfoRemote,
              { poHeaderId, context: props }
            )
          : basicInfoRemote
      ),
    []
  );
  const organizationInfoDs = useMemo(() => new DataSet(organizationInfo()), []);
  const detailRemote = {
    ...detailInfo(),
    transport: {
      read: () => {
        return {
          url: `${SRM_SPUC}/v1/${organizationId}/po-line/${poHeaderId}/detail`,
          method: 'GET',
        };
      },
    },
  };
  const detailInfoDs = useMemo(
    () =>
      new DataSet(
        remote
          ? remote.process('SODR.WORKSPACE_ORDERAPPROVAL_DETAIL_PROCESS_DETAIL_DS', detailRemote, {
              props,
              isApprovalFlag,
            })
          : detailRemote
      ),
    []
  );
  const giftInfoDs = useMemo(
    () =>
      new DataSet(
        giftInfoDsConfig({
          poHeaderId,
          params: { customizeUnitCode: 'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.GIFTINFO' },
        })
      ),
    [poHeaderId]
  );
  const paymentTermInfoDs = useMemo(() => new DataSet(paymentTermInfo()), [poHeaderId]);
  const basicCurrent = basicInfoDs.current;
  const { giftFlag, poSourcePlatform, workFlowBusinessKey, oldTermHideFlag } = basicCurrent.get([
    'giftFlag',
    'poSourcePlatform',
    'workFlowBusinessKey',
    'oldTermHideFlag',
  ]);
  // 是否展示赠品行
  const hasGift = useMemo(() => {
    return poHeaderId && giftFlag;
  }, [poHeaderId, giftFlag]);
  // const approvalCommentsDs = useMemo(() => new DataSet(approvalComments()), []);
  const receiptInfoDs = useMemo(() => new DataSet(receiptInfo()), []);
  const billingInfoDs = useMemo(() => new DataSet(billingInfo()), []);
  const attachmentConfig = useMemo(
    () => ({
      readOnly: [1, 1, 1],
    }),
    []
  );
  // 金额字段是否根据sourceCode判断处理
  const bySourceCode = useMemo(() => remote.process('bySourceCode'), []);
  const fetchDetailPoLine = (e) => {
    const { value } = e?.target || {};
    setMode(value);
    detailInfoDs.setQueryParameter('changeEditFlag', value === 'onlyChange' ? 1 : 0);
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

  const { changeFlag } = basicInfoDs?.current?.get(['changeFlag']) || {};
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
              changeFlag === 1 && (
                <div
                  className={styles['approval-line-change-tab']}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Radio.Group
                    onChange={fetchDetailPoLine}
                    value={mode}
                    className={styles['approval-radio-group']}
                  >
                    <Radio.Button value="onlyChange">
                      {intl.get('sodr.common.model.common.changeLineDisplay').d('仅展示变更行')}
                    </Radio.Button>
                    <Radio.Button value="all">
                      {intl.get('sodr.common.model.common.allDisplay').d('全部行')}
                    </Radio.Button>
                  </Radio.Group>
                </div>
              )
            }
          >
            <OrderDetailLine
              remote={remote}
              ds={detailInfoDs}
              basicInfoDs={basicInfoDs}
              customizeTable={customizeTable}
              bySourceCode={bySourceCode}
              isApprovalFlag={isApprovalFlag}
              displayDocAndDocFlow={displayDocAndDocFlow}
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
              code="SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.GIFTINFO"
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
              customizeCode="SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.PAYMENTTERMINFO"
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
              ds={basicInfoDs}
              poHeaderId={poHeaderId}
              attachmentConfig={attachmentConfig}
              customizeForm={customizeForm}
              customizeCode={[
                'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.ATTACHMENTINFO',
                'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.ATTACHMENTINFO_EXTERNAL',
              ]}
            />
          </Content>
        ),
      },
    ];
    const panels = remote.process('processPanels', list, { basicInfoDs, id: poHeaderId });
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

  useEffect(() => {
    if (onLoad) {
      onLoad({
        submit: (approveResult) =>
          remote.process(
            // 工作流审批提交处理promise
            'approvalPromise',
            {
              basicInfoDs,
              detailInfoDs,
              organizationInfoDs,
              props,
            },
            approveResult
          ),
      });
    }
    useSetstate({
      loading,
      basicInfoDs,
      detailInfoDs,
      organizationInfoDs,
      doubleUnitEnabled: 0,
    });
    if (poHeaderId) {
      loading({ all: true });
      fetchDoubleUom();
      getDisplayDocAndDocFlow(setDisplayDocAndDocFlow);
      basicInfoDs.query().then((res) => {
        loading({ all: false });
        if (res) {
          if (res.giftFlag) {
            giftInfoDs.query();
          }
          if (res.statusCode === 'SUBMITTED_WFL') {
            setIsNewApprove(true);
            setAiReviewParams(res?.poAiApproveResult?.searchDetailParams);
            setReviewStatus(res?.poAiApproveResult?.aiApproveStatus);
          } else {
            setIsNewApprove(false);
          }
          organizationInfoDs.loadData([res]);
          paymentTermInfoDs.loadData([res]);
          receiptInfoDs.create(res);
          billingInfoDs.loadData([res]);
          if (remote) {
            remote.process('addEventCux', { path, data: res });
          }
        }
      });

      // detailInfoDs.query();
    }
    if (onFormLoaded) onFormLoaded(true);
  }, []);

  // 查询业务规则定义双单位配置
  const fetchDoubleUom = async () => {
    loading({ fetchDoubleUom: true });
    const res = await queryCommonDoubleUomConfig();
    useSetstate({ doubleUnitEnabled: Number(res) });
    loading({ fetchDoubleUom: false });
  };

  // const action = (type) => {
  //   approvalCommentsDs.setState({ type });
  //   const onOk = async () => {
  //     const status = await approvalCommentsDs.validate();
  //     if (!status) return false;
  //     loading({ [type]: true });
  //     const data = [
  //       {
  //         poHeaderDetailDTO: {
  //           ...basicInfoDs.toJSONData()[0],
  //           ...approvalCommentsDs.toJSONData()[0],
  //         },
  //         poLineDetailDTOs: detailInfoDs.toJSONData(),
  //       },
  //     ];
  //     const res = await (type === 'approved' ? detailApprove(data) : detailReject(data));
  //     loading({ [type]: false });
  //     if (res) {
  //       notification.success();
  //       history.push({
  //         pathname: '/sodr/order-workspace/list',
  //       });
  //     }
  //     return res;
  //   };
  //   Modal.open({
  //     drawer: true,
  //     title: intl.get('sodr.workspace.model.common.approvedRemark').d('审批意见'),
  //     children: (
  //       <Form dataSet={approvalCommentsDs} columns={1} labelLayout="none">
  //         <TextArea
  //           name="approvedRemark"
  //           required={type === 'rejected'}
  //           placeholder={intl.get('sodr.workspace.view.message.approvedRemark').d('请输入审批理由')}
  //         />
  //       </Form>
  //     ),
  //     onOk,
  //     afterClose: () => {
  //       approvalCommentsDs.reset();
  //     },
  //     okProps: { loading: loadings[type] },
  //   });
  // };
  const handleRecord = () => {
    const modal = Modal.open({
      key: Modal.key(),
      title: intl.get(`${prefix}.view.title.operationHistory`).d('操作记录'),
      drawer: true,
      destroyOnClose: true,
      style: { width: 800 },
      children: <C7nOperationApprove poHeaderId={poHeaderId} modal={modal} />,
      onOk: () => {},
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };
  const handlePrint = () => {
    loading({ handlePrint: true });
    print(poHeaderId).then((res) => {
      if (res) {
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const printWindow = window.open(fileURL);
        if (printWindow && printWindow.print) {
          loading({ handlePrint: false });
          printWindow.print();
        }
      }
    });
  };
  const headerBtns = () => {
    const approvaFlags = basicInfoDs.getState('approvaFlags');
    const operationFlags = basicInfoDs.getState('operationFlags');
    const approvaFlag = approvaFlags?.[workFlowBusinessKey];
    const operationFlag = operationFlags?.[workFlowBusinessKey];
    const { taskId, processInstanceId } = approvaFlag || {};
    return [
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
              code: 'srm.po-admin.po.order-workspace.ps.button.peddingapproval.record',
              type: 'c7n-pro',
              meaning: '订单工作台-待审批明细-操作记录',
            },
          ],
        },
      },
      {
        name: 'print',
        btnComp: Button,
        child: intl.get(`sodr.workspace.view.button.print`).d('打印'),
        btnProps: {
          wait: THROTTLE_TIME,
          icon: 'print',
          funcType: 'flat',
          type: 'c7n-pro',
          onClick: handlePrint,
          loading: loadings.handlePrint,
          permissionList: [
            {
              code: 'srm.po-admin.po.order-workspace.button.detail.under-approval.print',
              type: 'c7n-pro',
              meaning: '订单工作台-详情-审批中-老打印',
            },
          ],
        },
      },
      {
        name: 'printNew',
        btnComp: PrintProButton,
        child: intl.get(`sodr.workspace.view.button.print`).d('打印'),
        childFor: 'buttonText',
        btnProps: {
          loading: loadings.all,
          buttonProps: {
            wait: THROTTLE_TIME,
            funcType: 'flat',
            icon: 'print',
            type: 'c7n-pro',
            permissionList: [
              {
                code: 'srm.po-admin.po.order-workspace.button.detail.under-approval.printnew',
                type: 'c7n-pro',
                meaning: '订单工作台-详情-审批中-新打印',
              },
            ],
          },
          requestUrl: `${SRM_SPUC}/v1/${organizationId}/po-header/${poHeaderId}/print-token`,
          method: 'GET',
          // buttonText: intl.get(`sodr.workspace.view.button.print`).d('打印'),
        },
      },
      {
        name: 'approval',
        btnComp: Button,
        hidden: isApprovalFlag || !(approvaFlags && approvaFlag),
        child: intl.get('sodr.workspace.view.option.approval').d('审批'),
        btnProps: {
          wait: THROTTLE_TIME,
          funcType: 'flat',
          icon: 'authorize',
          type: 'c7n-pro',
          disabled: isApprovalFlag,
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
        hidden: isApprovalFlag || !(operationFlags && operationFlag?.REVOKE),
        child: intl.get('sodr.workspace.view.option.revokeApproval').d('撤销审批'),
        btnProps: {
          disabled: isApprovalFlag,
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
    ];
  };
  return (
    <Fragment>
      <OrderAffix />
      <Header
        backPath={
          path.includes('/pub/sodr/order-workspace/detail/under-approval') ? false : backPath
        }
        title={intl.get('sodr.workspace.view.title.orderDetails').d('订单明细')}
      >
        {customizeBtnGroup(
          {
            code: 'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.BUTTONS',
            pro: true,
          },
          <DynamicButtons
            {...remote.process(
              'transformHeaderButtonProps',
              { buttons: headerBtns() },
              { basicInfoDs, props, detailInfoDs, loading, loadings, setLoadings }
            )}
          />
        )}
      </Header>
      {isNewApprove ? (
        <AlertTooltip reviewStatus={reviewStatus} aiReviewParams={aiReviewParams} />
      ) : null}
      <div
        className={styles['order-workspace-detail-container']}
        id="order-workspace-detail-container"
      >
        <Spin spinning={loadings.all}>
          {customizeCollapse(
            {
              code: 'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.COLLAPSE',
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
      'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.BASICINFO',
      'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.ORGANIZATIONINFO',
      'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.DETAILINFO',
      // 'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.OTHERINFO',
      // 'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.PARTNER',
      'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.RECEIPTINFO',
      'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.BILLINGINFO',
      'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.BOM',
      'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.TABS',
      'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.ATTACHMENTINFO',
      'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.ATTACHMENTINFO_EXTERNAL',
      'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.BUTTONS',
      'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.COLLAPSE',
      'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.GIFTINFO',
      'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.PAYMENTTERMINFO',
    ],
  }),
  formatterCollections({
    code: ['sodr.workspace', 'sodr.common'],
  }),
  remotes(...remoteConfig),
  observer
)(OrderApproval);
