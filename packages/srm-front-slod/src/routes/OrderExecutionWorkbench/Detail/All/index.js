/*
 * All - 订单执行工作台-全部明细
 * @date: 2021/11/01 20:26:14
 * @author: mjq <jiaqi.mao@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, PureComponent } from 'react';
import { Collapse } from 'choerodon-ui';
import { DataSet, Modal, Spin, Form, SelectBox } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { observer } from 'mobx-react';
import { reaction } from 'mobx';
import querystring from 'querystring';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import notification from 'utils/notification';
import DynamicButtons from '_components/DynamicButtons';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getCurrentOrganizationId,
  getCurrentUser,
  getUserOrganizationId,
  getResponse,
} from 'utils/utils';
import remotes from 'utils/remote';
import Button from 'srm-front-sodr/lib/routes/components/DotButton';
import ChatRoom from 'srm-front-mobile/lib/components/Chat/Room';

import { THROTTLE_TIME, SAAS_SIGN } from '@/routes/components/utils/constant';
import {
  getJsonBlob,
  queryCommonDoubleUomConfig,
} from '@/routes/OrderExecutionWorkbench/components/utils';
import { getFileList, initChatOnlineRoom } from '@/services/orderExecutionWorkbenchService';
import { paymentTermInfo } from 'srm-front-sodr/lib/routes/components/PaymentTermInfo';
import remoteConfig from './remote';
import C7nOperationApprove from '../../components/C7nOperationApprove/newIndex';
import C7nMessage from '../../components/C7nMessage';
import OrderAffix from '../../components/OrderAffix';
import AttachmentInfo from '../../components/AttachmentInfo';
import PreviewModal from '../../components/PreviewModal';
import { giftInfoDsConfig, GiftInfo } from '../../components/GiftInfo';
import BasicInfo from './BasicInfo';
import OrganizationInfo from './OrganizationInfo';
import DetailInfo from './DetailInfo';
import BillingInfo from './BillingInfo';
import ReceiptInfo from './ReceiptInfo';
import PaymentTermsInfo from './PaymentTermInfo';
import {
  basicInfo,
  organizationInfo,
  detailInfo,
  receiptInfo,
  billingInfo,
  filterLine,
} from './store/allDs';
import styles from '../index.less';

const organizationId = getCurrentOrganizationId();
const tenantId = getUserOrganizationId();
const currentUser = getCurrentUser();
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
@connect(({ orderExecutionWorkbench }) => ({
  orderExecutionWorkbench,
}))
@formatterCollections({
  code: ['slod.orderExecution', 'sodr.workspace', 'sodr.common'],
})
@withCustomize({
  unitCode: [
    'SINV.ORDER_EXECUTION_ALL_DETAIL.ATTACHMENTINFO',
    'SINV.ORDER_EXECUTION_ALL_DETAIL.ATTACHMENTINFO_EXTERNAL',
    'SINV.ORDER_EXECUTION_ALL_DETAIL.BASICINFO',
    'SINV.ORDER_EXECUTION_ALL_DETAIL.BILLINGINFO',
    'SINV.ORDER_EXECUTION_ALL_DETAIL.BOM',
    'SINV.ORDER_EXECUTION_ALL_DETAIL.DETAILINFO',
    'SINV.ORDER_EXECUTION_ALL_DETAIL.ORGANIZATIONINFO',
    'SINV.ORDER_EXECUTION_ALL_DETAIL.RECEIPTINFO',
    'SINV.ORDER_EXECUTION_ALL_DETAIL.BUTTONS',
    'SINV.ORDER_EXECUTION_ALL_DETAIL.COLLAPSE',
    'SINV.ORDER_EXECUTION_ALL_DETAIL.FORM',
    'SINV.ORDER_EXECUTION_ALL_DETAIL.GIFTINFO',
    'SINV.ORDER_EXECUTION_ALL_DETAIL.PAYMENTTERMINFO',
  ],
})
@remotes(...remoteConfig)
@observer
export default class All extends PureComponent {
  constructor(props) {
    super(props);
    const {
      match: {
        path,
        params: { id },
      },
      history: {
        location: { search },
      },
      remote,
    } = props;
    const { openFrom, isBackFlag = 1 } = querystring.parse(search.substr(1));
    this.state = {
      isBackFlag,
      isSettleLink: openFrom === 'settle',
      sourceFromPub: path.includes('pub'),
      id,
      attachmentConfig: {
        readOnly: [1, 1, 1],
        title: [undefined, intl.get('slod.orderExecution.view.attachment.attachment').d('附件')],
      },
      fileList: [], // 获取预览的文件列表信息
      loadingAll: false,
      doubleUnitEnabled: 0,
    };
    this.basicInfoDs = new DataSet({
      ...basicInfo(),
      transport: {
        read: () => {
          return {
            url: `${SRM_SPUC}/v1/${organizationId}/po-header/${id}/detail`,
            method: 'GET',
          };
        },
      },
    });
    this.organizationInfoDs = new DataSet(organizationInfo());
    this.detailInfoRemote = {
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
    this.detailInfoDs = new DataSet(
      remote
        ? remote.process(
            'SODR.SUPPLIERWORKSPACE_ALL_DETAIL_PROCESS_DETAIL_INFO_DS',
            this.detailInfoRemote,
            { id }
          )
        : this.detailInfoRemote
    );
    this.giftInfoDs = new DataSet(
      giftInfoDsConfig({
        poHeaderId: id,
        type: 'feedbackAlready',
        params: { customizeUnitCode: 'SINV.ORDER_EXECUTION_ALL_DETAIL.GIFTINFO' },
      })
    );
    // this.paymentTermInfoDs = new DataSet(paymentTermInfo());
    this.receiptInfoDs = new DataSet(receiptInfo());
    this.billingInfoDs = new DataSet(billingInfo());
    this.filterLineDs = new DataSet(filterLine({ detailInfoDs: this.detailInfoDs }));
    // 金额字段是否根据sourceCode判断处理
    this.bySourceCode = props.remote.process('bySourceCode');
    this.dsMap = {
      basicInfoDs: this.basicInfoDs,
      organizationInfoDs: this.organizationInfoDs,
      detailInfoDs: this.detailInfoDs,
      receiptInfoDs: this.receiptInfoDs,
      billingInfoDs: this.billingInfoDs,
      // paymentTermInfoDs: this.paymentTermInfoDs,
    };
    this.initDs();
  }

  @Bind()
  loadingAll(flag) {
    this.setState({ loadingAll: flag });
  }

  // 查询双单位配置
  @Bind()
  async queryDoubleUomConfig() {
    const result = await queryCommonDoubleUomConfig();
    this.setState({
      doubleUnitEnabled: result,
    });
    Object.keys(this.dsMap).forEach((i) =>
      this.dsMap[i].setState({
        ...this.dsMap,
        doubleUnitEnabled: result,
      })
    );
  }

  async componentDidMount() {
    this.setState({ loadingAll: true });
    try {
      this.queryDoubleUomConfig();
      const res = await this.basicInfoDs.query();
      if (res) {
        this.setState({ headerInfo: res });
        this.organizationInfoDs.loadData([res]);
        this.receiptInfoDs.loadData([res]);
        this.billingInfoDs.loadData([res]);
        // this.paymentTermInfoDs.loadData([res]);
        if (res.electricSignUrl) {
          getFileList([res.electricSignUrl]).then((v) => {
            if (v && !v.failed) {
              this.setState({
                fileList: v,
              });
            }
          });
        }
      }
    } finally {
      this.setState({ loadingAll: false });
    }
  }

  @Bind()
  initDs() {
    const { doubleUnitEnabled } = this.state;
    Object.keys(this.dsMap).forEach((i) =>
      this.dsMap[i].setState({
        ...this.dsMap,
        doubleUnitEnabled,
        loading: this.loadingAll,
      })
    );
  }

  @Bind()
  async afterCustomizeDs(_, formDs) {
    const newRecord = await formDs.create();
    reaction(
      () => this.basicInfoDs.status,
      (status, action) => {
        if (status === 'ready') {
          setTimeout(() => {
            const lineDisplay = newRecord.get('lineDisplay');
            this.detailInfoDs.setQueryParameter('lineDisplay', lineDisplay);
            // this.detailInfoDs.query();
            action.dispose();
          }, 0);
        }
      },
      { fireImmediately: true }
    );
  }

  @Bind()
  getContent() {
    const { customizeForm, customizeTable, dispatch, remote } = this.props;
    const { id, attachmentConfig, doubleUnitEnabled, headerInfo = {} } = this.state;
    const {
      authType,
      giftFlag,
      poSourcePlatform,
      electricSignFlag,
      oldTermHideFlag,
    } = this.basicInfoDs.current.get([
      'giftFlag',
      'authType',
      'poSourcePlatform',
      'electricSignFlag',
      'oldTermHideFlag',
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
              ds={this.basicInfoDs}
              customizeForm={customizeForm}
              bySourceCode={this.bySourceCode}
              oldTermHideFlag={oldTermHideFlag}
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
            <OrganizationInfo ds={this.organizationInfoDs} customizeForm={customizeForm} />
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
              <div
                onClick={(e) => e.stopPropagation()}
                className={styles['approval-line-change-tab']}
              >
                <div className={styles['approval-radio-group']}>
                  {customizeForm(
                    {
                      code: 'SINV.ORDER_EXECUTION_ALL_DETAIL.FORM',
                      afterCustomizeDs: this.afterCustomizeDs,
                    },
                    <Form dataSet={this.filterLineDs}>
                      <SelectBox mode="button" name="lineDisplay" />
                    </Form>
                  )}
                </div>
              </div>
            }
          >
            <DetailInfo
              remote={remote}
              ds={this.detailInfoDs}
              basicInfoDs={this.basicInfoDs}
              customizeTable={customizeTable}
              bySourceCode={this.bySourceCode}
            />
          </Panel>
        ),
      },
      {
        key: 'giftInfo',
        content: (
          <Panel
            hidden={!giftFlag}
            key="giftInfo"
            id="order-workSpace-detail-content-giftInfo"
            header={intl.get('sodr.workspace.view.panel.giftInfo').d('赠品明细信息')}
          >
            <GiftInfo
              ds={this.giftInfoDs}
              type="feedbackAlready"
              customizeTable={customizeTable}
              code="SINV.ORDER_EXECUTION_ALL_DETAIL.GIFTINFO"
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
            {/* <PaymentTermInfo
              ds={this.paymentTermInfoDs}
              customizeForm={customizeForm}
              customizeCode="SINV.ORDER_EXECUTION_ALL_DETAIL.PAYMENTTERMINFO"
              getValues={this.getValues}
              isSupplier
            /> */}
            <PaymentTermsInfo
              isSupplier
              dsMap={this.dsMap}
              headerInfo={headerInfo}
              loading={this.loadingAll}
              customizeForm={customizeForm}
              paymentTermInfo={paymentTermInfo}
              doubleUnitEnabled={doubleUnitEnabled}
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
            <ReceiptInfo ds={this.receiptInfoDs} customizeForm={customizeForm} />
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
            <BillingInfo ds={this.billingInfoDs} customizeForm={customizeForm} />
          </Panel>
        ),
      },
      {
        key: 'attachmentInfo',
        content: (
          <Content className={styles['order-workspace-detail-content']}>
            <AttachmentInfo
              dispatch={dispatch}
              poHeaderId={id}
              viewOnly
              ds={this.basicInfoDs}
              attachmentConfig={attachmentConfig}
              customizeForm={customizeForm}
              terminateSignShow={electricSignFlag && SAAS_SIGN.test(authType)}
              customizeCode={[
                'SINV.ORDER_EXECUTION_ALL_DETAIL.ATTACHMENTINFO',
                'SINV.ORDER_EXECUTION_ALL_DETAIL.ATTACHMENTINFO_EXTERNAL',
              ]}
              insideAttachment={false}
              remote={remote}
            />
          </Content>
        ),
      },
    ];
    const panels = remote.process('processPanels', list, { basicInfoDs: this.basicInfoDs, id });
    if (poSourcePlatform === 'CATALOGUE') {
      return panels.filter((i) => i.key !== 'billingInfo');
    } else if (poSourcePlatform === 'E-COMMERCE') {
      return panels;
    } else {
      return panels.filter((i) => !['receiptInfo', 'billingInfo'].includes(i.key));
    }
  }

  @Bind()
  handlePrint() {
    const { id } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'orderExecutionWorkbench/print',
      payload: id,
    }).then((res) => {
      if (res && res.type !== 'application/json') {
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const printWindow = window.open(fileURL);
        if (printWindow) {
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
  }

  @Bind()
  handleRecord = () => {
    const { remote } = this.props;
    const { id } = this.state;
    Modal.open({
      key: Modal.key(),
      title: intl.get(`slod.orderExecution.view.title.operationHistory`).d('操作记录'),
      drawer: true,
      destroyOnClose: true,
      style: { width: 742 },
      children: <C7nOperationApprove poHeaderId={id} remote={remote} />,
      onOk: () => {},
      okText: intl.get('hzero.common.button.close').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };

  @Bind()
  goDetail = (key) => {
    const record = this.basicInfoDs.current;
    const { history } = this.props;
    const poHeaderId = record?.get('poHeaderId');
    let pathname;
    switch (key) {
      case 'feedback':
        pathname = `/sodr/order-execution-workbench/to-be-fed-back/${poHeaderId}`;
        break;
      case 'feedbackAgain':
        pathname = `/sodr/order-execution-workbench/feedback-already/${poHeaderId}`;
        break;
      default:
    }
    if (!pathname) return;
    history.push({ pathname, state: { source: 'all' } });
  };

  @Bind()
  getDynamicButton() {
    const allBtns = [
      {
        key: 'FEEDBACK',
        button: (
          <Button
            type="c7n-pro"
            // funcType="flat"
            icon="forum-o"
            onClick={() => this.goDetail('feedback')}
            color="primary"
          >
            {intl.get('slod.orderExecution.view.option.feedback').d('反馈')}
          </Button>
        ),
      },
      {
        key: 'FEEDBACK_AGAIN',
        button: (
          <Button
            type="c7n-pro"
            // funcType="flat"
            icon="forum-o"
            onClick={() => this.goDetail('feedbackAgain')}
            color="primary"
          >
            {intl.get('slod.orderExecution.view.option.feedbackAgain').d('再次反馈')}
          </Button>
        ),
      },
      {
        key: 'SIGN',
        button: (
          <Button
            type="c7n-pro"
            funcType="flat"
            icon="authorize"
            onClick={() => this.goDetail('feedback')}
          >
            {intl.get(`hzero.common.button.sign`).d('签章')}
          </Button>
        ),
      },
    ];
    const Buttons = observer(({ dataSet }) => {
      const operationList = dataSet?.current.get('operationList') || [];
      return allBtns.filter((i) => operationList.includes(i.key)).map((i) => i.button);
    });

    return <Buttons dataSet={this.basicInfoDs} />;
  }

  render() {
    const contentList = this.getContent();
    const {
      id,
      fileList,
      headerInfo,
      loadingAll,
      sourceFromPub,
      isBackFlag,
      isSettleLink,
    } = this.state;
    const { operationList = [] } = headerInfo || {};
    const electricSignFlag = this.basicInfoDs.current?.get('electricSignFlag');
    const previewModalProps = {
      fileList,
      btnText: intl
        .get(`slod.orderExecution.view.title.electronicSignatureAttachment`)
        .d('电子签章附件'),
      btnProps: { icon: 'attach_file', funcType: 'flat' },
    };
    const { customizeBtnGroup, customizeCollapse, remote } = this.props;
    const loading = loadingAll;

    const getHeaderButtons = () => {
      if (isSettleLink) {
        const buttons = [
          {
            name: 'operationBoard',
            btnComp: Button,
            child: intl.get('slod.orderExecution.view.button.operationRecord').d('操作记录'),
            btnProps: {
              loading,
              icon: 'operation_service_request',
              type: 'c7n-pro',
              funcType: 'flat',
              onClick: this.handleRecord,
            },
          },
        ];
        return <DynamicButtons buttons={buttons} />;
      }
      const record = this.basicInfoDs.current;
      const { msgNum } = record.get(['msgNum']);
      const { supplierCompanyId } = this.organizationInfoDs?.current.get(['supplierCompanyId']);
      const buttons = [
        operationList.includes('FEEDBACK') && {
          name: 'feedback',
          btnComp: Button,
          child: intl.get('slod.orderExecution.view.option.feedback').d('反馈'),
          btnProps: {
            loading,
            color: 'primary',
            icon: 'forum-o',
            type: 'c7n-pro',
            permissionList: [
              {
                code: 'srm.logistics.delivery.order.execution.workbench.button.all.feedback',
                type: 'c7n-pro',
                meaning: '销售方订单工作台-整单-反馈',
              },
            ],
            onClick: () => {
              this.goDetail('feedback');
            },
          },
        },
        operationList.includes('FEEDBACK_AGAIN') && {
          name: 'feedbackAgain',
          btnComp: Button,
          child: intl.get('slod.orderExecution.view.option.feedbackAgain').d('再次反馈'),
          btnProps: {
            loading,
            color: 'primary',
            icon: 'forum-o',
            type: 'c7n-pro',
            permissionList: [
              {
                code: 'srm.logistics.delivery.order.execution.workbench.button.all.feedbackAgain',
                type: 'c7n-pro',
                meaning: '销售方订单工作台-整单-再次反馈',
              },
            ],
            onClick: () => {
              this.goDetail('feedbackAgain');
            },
          },
        },
        operationList.includes('SIGN') && {
          name: 'sign',
          btnComp: Button,
          child: intl.get(`hzero.common.button.sign`).d('签章'),
          btnProps: {
            loading,
            icon: 'authorize',
            funcType: 'flat',
            type: 'c7n-pro',
            onClick: () => {
              this.goDetail('feedback');
            },
          },
        },
        {
          name: 'print',
          btnComp: Button,
          child: intl.get('slod.orderExecution.view.button.print').d('打印'),
          btnProps: {
            loading,
            funcType: 'flat',
            // color:'primary',
            icon: 'print',
            type: 'c7n-pro',
            wait: THROTTLE_TIME,
            onClick: this.handlePrint,
            permissionList: [
              {
                code: 'srm.logistics.delivery.order.execution.workbench.button.detail.all.print',
                type: 'c7n-pro',
                meaning: '销售方订单工作台-全部-详情-老打印',
              },
            ],
          },
        },
        {
          name: 'printNew',
          btnComp: PrintProButton,
          child: intl.get('slod.orderExecution.view.button.print').d('打印'),
          childFor: 'buttonText',
          btnProps: {
            loading,
            buttonProps: {
              icon: 'print',
              type: 'c7n-pro',
              funcType: 'flat',
              wait: THROTTLE_TIME,
              permissionList: [
                {
                  code:
                    'srm.logistics.delivery.order.execution.workbench.button.detail.all.printnew',
                  type: 'c7n-pro',
                  meaning: '销售方订单工作台-全部-详情-新打印',
                },
              ],
            },
            requestUrl: `${SRM_SPUC}/v1/${organizationId}/po-header/${id}/print-token`,
            method: 'GET',
            // buttonText: intl.get('slod.orderExecution.view.button.print').d('打印'),
          },
        },
        {
          name: 'operationBoard',
          btnComp: Button,
          child: intl.get('slod.orderExecution.view.button.operationRecord').d('操作记录'),
          btnProps: {
            loading,
            icon: 'operation_service_request',
            type: 'c7n-pro',
            funcType: 'flat',
            onClick: this.handleRecord,
          },
        },
        {
          name: 'messageBoard',
          type: 'c7n-pro',
          btnComp: C7nMessage,
          childFor: 'messageBoardName',
          btnProps: {
            poHeaderId: id,
            btnProps: {
              loading,
              icon: 'message2',
              funcType: 'flat',
              type: 'c7n-pro',
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
              const res = getResponse(
                await initChatOnlineRoom({ poHeaderId: id, camp: 'supplier' })
              );
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
                          tenantId,
                          companyId: supplierCompanyId,
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
                code: 'srm.logistics.delivery.order.execution.workbench.button.chatRoom',
                meaning: '销售方工作台-详细页-在线沟通',
              },
            ],
          },
        },
      ];

      const dynamicButtons = remote
        ? remote.process('dynamicButtons', buttons, { current: this })
        : buttons;

      return customizeBtnGroup(
        { code: 'SINV.ORDER_EXECUTION_ALL_DETAIL.BUTTONS', pro: true },
        <DynamicButtons buttons={dynamicButtons} />
      );
    };

    const backPath =
      (sourceFromPub && !isSettleLink) || Number(isBackFlag) !== 1
        ? false
        : '/sodr/order-execution-workbench/list';
    return (
      <Fragment>
        <Header
          title={intl.get('slod.orderExecution.view.title.orderDetails').d('订单明细')}
          backPath={backPath}
        >
          {getHeaderButtons()}
          {electricSignFlag === 1 && <PreviewModal {...previewModalProps} />}
        </Header>
        <div
          className={styles['order-workspace-detail-container']}
          id="order-workspace-detail-container"
        >
          <OrderAffix linkKeys={contentList.map((i) => i.key)} />
          <Spin dataSet={this.basicInfoDs}>
            {customizeCollapse(
              {
                code: 'SINV.ORDER_EXECUTION_ALL_DETAIL.COLLAPSE',
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
  }
}
