/*
 * FeedbackAlready - 订单执行工作台-已反馈明细
 * @date: 2021/11/01 20:26:14
 * @author: mjq <jiaqi.mao@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, PureComponent } from 'react';
import { Collapse } from 'choerodon-ui';
import { DataSet, Modal, Spin, Form, SelectBox } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { reaction } from 'mobx';
import { isEmpty, isNumber, isArray, throttle } from 'lodash';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import remotes from 'utils/remote';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import notification from 'utils/notification';
import DynamicButtons from '_components/DynamicButtons';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getCurrentOrganizationId,
  getResponse,
  getUserOrganizationId,
  getCurrentUser,
} from 'utils/utils';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import ChatRoom from 'srm-front-mobile/lib/components/Chat/Room';
import Button from 'srm-front-sodr/lib/routes/components/DotButton';
import PaymentTermInfo, {
  paymentTermInfo,
} from 'srm-front-sodr/lib/routes/components/PaymentTermInfo';

import {
  SAAS_SIGN,
  BUCKET_NAME,
  SUPPLIER_DIRECTORY,
} from '@/routes/OrderExecutionWorkbench/components/utils/constant';
import {
  getJsonBlob,
  queryCommonDoubleUomConfig,
} from '@/routes/OrderExecutionWorkbench/components/utils';
import { getFileList, initChatOnlineRoom } from '@/services/orderExecutionWorkbenchService';
import remoteConfig from './remote';
import OrderAffix from '../../components/OrderAffix';
import C7nMessage from '../../components/C7nMessage';
import AttachmentInfo from '../../components/AttachmentInfo';
import C7nOperationApprove from '../../components/C7nOperationApprove/newIndex';
import PreviewModal from '../../components/PreviewModal';
import { giftInfoDsConfig, GiftInfo } from '../../components/GiftInfo';
import BasicInfo from './BasicInfo';
import OrganizationInfo from './OrganizationInfo';
import DetailInfo from './DetailInfo';
import BillingInfo from './BillingInfo';
import ReceiptInfo from './ReceiptInfo';
import {
  basicInfo,
  organizationInfo,
  detailInfo,
  receiptInfo,
  billingInfo,
  batchMaintenance,
  filterLine,
} from './store/feedbackAlreadyDs';

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
@connect(({ orderExecutionWorkbench, loading }) => ({
  submitAfterConfirmLoading: loading.effects['orderExecutionWorkbench/submitAfterConfirm'],
  queryFileListOrgLoading: loading.effects['orderExecutionWorkbench/queryFileListOrg'],
  orderExecutionWorkbench,
}))
@formatterCollections({
  code: ['slod.orderExecution', 'sodr.workspace', 'sodr.common', 'sodr.orderChange'],
})
@withCustomize({
  unitCode: [
    'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.ATTACHMENTINFO',
    'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.ATTACHMENTINFO_EXTERNAL',
    'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.BASICINFO',
    'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.BILLINGINFO',
    'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.BOM',
    'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.DETAILINFO',
    'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.ORGANIZATIONINFO',
    'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.RECEIPTINFO',
    'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.BATCHEDITING',
    'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.BUTTONS',
    'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.COLLAPSE',
    'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.FORM',
    'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.GIFTINFO',
    'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.PAYMENTTERMINFO',
  ],
})
@remotes(...remoteConfig)
@observer
export default class FeedbackAlready extends PureComponent {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { id },
      },
      remote,
    } = props;
    this.state = {
      id,
      attachmentConfig: {
        readOnly: [1, 1, 0],
        title: [undefined, intl.get('slod.orderExecution.view.attachment.attachment').d('附件')],
      },
      collByLine: 0,
      setting: '0',
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
    this.detailInfoDs = new DataSet(
      remote
        ? remote.process(
            'SODR.SUPPLIERWORKSPACE_FEEDBACKALREADY_DETAIL_PROCESS_DETAIL_DS',
            detailInfoRemote,
            { that: this }
          )
        : detailInfoRemote
    );
    this.giftInfoDs = new DataSet(
      giftInfoDsConfig({
        poHeaderId: id,
        type: 'feedbackAlready',
        params: { customizeUnitCode: 'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.GIFTINFO' },
      })
    );
    this.paymentTermInfoDs = new DataSet(paymentTermInfo());
    this.receiptInfoDs = new DataSet(receiptInfo());
    this.billingInfoDs = new DataSet(billingInfo());
    this.batchMaintenanceDs = new DataSet(batchMaintenance());
    this.filterLineDs = new DataSet(filterLine({ detailInfoDs: this.detailInfoDs }));
    // 金额字段是否根据sourceCode判断处理
    this.bySourceCode = props.remote.process('bySourceCode');
    this.dsMap = {
      basicInfoDs: this.basicInfoDs,
      organizationInfoDs: this.organizationInfoDs,
      detailInfoDs: this.detailInfoDs,
      receiptInfoDs: this.receiptInfoDs,
      billingInfoDs: this.billingInfoDs,
      batchMaintenanceDs: this.batchMaintenanceDs,
      paymentTermInfoDs: this.paymentTermInfoDs,
    };
    this.initDs();
  }

  @Bind()
  initDs() {
    const { doubleUnitEnabled } = this.state;
    Object.keys(this.dsMap).forEach((i) => {
      this.dsMap[i].setState({
        ...this.dsMap,
        doubleUnitEnabled,
        loading: this.loadingAll,
      });
      this.dsMap[i].setState({ allBatchMap: null });
    });
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

  /**
   * @param Boolean fristFlag 是否初次查询标识
   */
  @Bind()
  async handleQuery(fristFlag = false) {
    this.setState({ loadingAll: true });
    try {
      this.queryDoubleUomConfig();
      const res = await this.basicInfoDs.query();
      if (res) {
        this.setState({ headerInfo: res });
        this.organizationInfoDs.loadData([res]);
        this.receiptInfoDs.loadData([res]);
        this.billingInfoDs.loadData([res]);
        this.paymentTermInfoDs.loadData([res]);
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
      if (!fristFlag) await this.detailInfoDs.query();
      await this.queryCollByLine();
      await this.fetchSettings();
    } finally {
      this.setState({ loadingAll: false });
    }
  }

  componentDidMount() {
    this.handleQuery(true);
  }

  @Bind()
  queryCollByLine() {
    const { dispatch } = this.props;
    return dispatch({ type: 'orderExecutionWorkbench/queryCollByLine' }).then((res) => {
      if (isNumber(res)) {
        this.setState({ collByLine: res });
      }
    });
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
            this.detailInfoDs.query();
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
    const { id, attachmentConfig, collByLine } = this.state;
    const {
      giftFlag,
      authType,
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
              <div className={styles['approval-radio-group']}>
                {customizeForm(
                  {
                    code: 'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.FORM',
                    afterCustomizeDs: this.afterCustomizeDs,
                  },
                  <Form dataSet={this.filterLineDs}>
                    <SelectBox mode="button" name="lineDisplay" />
                  </Form>
                )}
              </div>
            }
          >
            <DetailInfo
              remote={remote}
              ds={this.detailInfoDs}
              customizeForm={customizeForm}
              customizeTable={customizeTable}
              collByLine={collByLine}
              batchMaintenanceDs={this.batchMaintenanceDs}
              filterLineDs={this.filterLineDs}
              basicInfoDs={this.basicInfoDs}
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
              code="SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.GIFTINFO"
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
              ds={this.paymentTermInfoDs}
              customizeForm={customizeForm}
              customizeCode="SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.PAYMENTTERMINFO"
              getValues={this.getValues}
              isSupplier
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
                'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.ATTACHMENTINFO',
                'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.ATTACHMENTINFO_EXTERNAL',
              ]}
              insideAttachment={false}
              remote={remote}
            />
          </Content>
        ),
      },
    ];
    const panels = remote?.process('processPanels', list, { basicInfoDs: this.basicInfoDs, id });
    if (poSourcePlatform === 'CATALOGUE') {
      return panels.filter((i) => i.key !== 'billingInfo');
    } else if (poSourcePlatform === 'E-COMMERCE') {
      return panels;
    } else {
      return panels.filter((i) => !['receiptInfo', 'billingInfo'].includes(i.key));
    }
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
  getValues(type = 'save') {
    const { selected } = this.detailInfoDs;
    const fieldMap = this.detailInfoDs.getState('fieldMap');
    const poHeaderDetailDTO = this.basicInfoDs.toJSONData()[0];
    const newFieldMap = Object.keys(fieldMap || {})
      .map((i) => {
        const fieldType = this.batchMaintenanceDs.getField(i).get('type');
        return [
          i,
          fieldMap[i]?._isAMomentObject
            ? fieldMap[i].format(
                fieldType === 'date' ? DEFAULT_DATE_FORMAT : DEFAULT_DATETIME_FORMAT
              )
            : fieldMap[i],
        ];
      })
      .filter((i) => typeof fieldMap[i] !== 'object');
    const values = {
      poHeaderDetailDTO: Object.assign(
        poHeaderDetailDTO,
        !isEmpty(selected) ? { checkFlag: 1 } : {}
      ),
      poLineDetailDTOs: [
        ...(!isEmpty(selected) && type !== 'save'
          ? selected.map((i) => i.toJSONData())
          : this.detailInfoDs.toJSONData()),
        ...this.giftInfoDs.toJSONData(),
      ],
    };
    if (fieldMap) {
      values.fieldMap = {
        ...Object.fromEntries(newFieldMap),
        unitCode: 'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.BATCHEDITING',
      };
    }
    return values;
  }

  @Bind()
  fetchSupplierAttachmentList(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'orderExecutionWorkbench/queryFileListOrg',
      payload,
    });
  }

  /**
   * fetchDetailHeader - 查询配置中心
   */
  @Bind()
  fetchSettings() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'orderExecutionWorkbench/fetchSettings',
    }).then((res) => {
      if (res) {
        this.setState({
          setting: res['010219'],
        });
      }
    });
  }

  @Bind()
  async getValidateStatus() {
    const { collByLine } = this.state;
    const { selected } = this.detailInfoDs;
    const contentListKeys = this.getContent().map((i) => i.key);
    const validateLine =
      collByLine === 2 && !isEmpty(selected) ? [...selected] : [this.detailInfoDs, this.giftInfoDs];
    const validateList = [
      this.basicInfoDs,
      this.organizationInfoDs,
      this.giftInfoDs,
      ...validateLine,
    ];
    if (contentListKeys.includes('receiptInfo')) {
      validateList.push(this.receiptInfoDs);
    }
    if (contentListKeys.includes('billingInfo')) {
      validateList.push(this.billingInfoDs);
    }
    const allValidateStatus = await Promise.all(validateList.map((i) => i.validate()));
    return allValidateStatus.every((i) => i);
  }

  @Bind()
  async handleFeedback() {
    const { dispatch, remote } = this.props;
    const { poHeaderDetailDTO, poLineDetailDTOs, fieldMap } = this.getValues('feedback');
    const data = {
      poHeaderDetailDTO: { ...poHeaderDetailDTO, poWorkbenchFlag: 1 },
      poLineDetailDTOs,
      fieldMap,
    };
    // 校验数据是否变更。判断行数据变更 或 fieldMap有值集
    const fieldMapEmpty = isEmpty(this.detailInfoDs.getState('fieldMap'));
    const headerChange = this.basicInfoDs.current.dirty === false;
    const lineChange = this.detailInfoDs.all.every((ele) => ele.dirty === false);
    // 使用到的二开租户：SRM-LUENFUNG
    const othersChange = this.basicInfoDs.getState('modifyDataFlag');
    if (headerChange && lineChange && fieldMapEmpty && !othersChange) {
      notification.warning({
        message: intl.get(`sodr.orderChange.view.message.noModifyData`).d('未修改任何数据'),
      });
      return;
    }
    const validateStatus = await this.getValidateStatus();
    if (!validateStatus) return;
    const customizeUnitCode = String([
      'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.BASICINFO',
      'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.BILLINGINFO',
      'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.ORGANIZATIONINFO',
      'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.RECEIPTINFO',
      'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.DETAILINFO',
      'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.ATTACHMENTINFO',
      'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.ATTACHMENTINFO_EXTERNAL',
    ]);
    Modal.confirm({
      title: intl.get('sodr.common.model.common.errorMessage').d('提示'),
      children: intl.get('slod.orderExecution.view.confirm.feedback').d('是否确认反馈订单'),
      onOk: throttle(
        async () => {
          const { supplierAttachmentUuid, displayPoNum } = this.basicInfoDs.current.get([
            'supplierAttachmentUuid',
            'displayPoNum',
          ]);
          const { setting } = this.state;
          const failedCallback = () => {
            notification.warning({
              message: intl
                .get(`slod.orderExecution.view.message.accessoryNotNull1`, {
                  poNum: displayPoNum,
                })
                .d('订单:[{poNum}]附件不能为空'),
            });
          };
          const feedbackAlreadyOrder = async () => {
            const res = await dispatch({
              type: 'orderExecutionWorkbench/submitAfterConfirm',
              payload: {
                data,
                query: {
                  poWorkbenchFlag: 1,
                  customizeUnitCode,
                },
              },
            });
            if (res) {
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname: '/sodr/order-execution-workbench/list',
                })
              );
            }
          };
          const beforFeedbackRes = await remote.event.fireEvent('beforFeedback', {
            data,
            basicInfoDs: this.basicInfoDs,
            organizationInfoDs: this.organizationInfoDs,
            detailInfoDs: this.detailInfoDs,
          });
          if (!beforFeedbackRes) return;
          if (setting === '1') {
            if (supplierAttachmentUuid) {
              const fileList = await this.fetchSupplierAttachmentList({
                bucketName: BUCKET_NAME,
                bucketDirectory: SUPPLIER_DIRECTORY,
                attachmentUUID: supplierAttachmentUuid,
              });
              if (fileList && !fileList.failed && isArray(fileList)) {
                if (fileList.length === 0) {
                  failedCallback();
                } else {
                  feedbackAlreadyOrder();
                }
              }
            } else {
              failedCallback();
            }
          } else {
            feedbackAlreadyOrder();
          }
        },
        THROTTLE_TIME,
        { trailing: false }
      ),
    });
  }

  render() {
    const contentList = this.getContent();
    const { id, fileList, headerInfo, loadingAll } = this.state;
    const { electricSignFlag } = headerInfo || {};
    const record = this.basicInfoDs.current;
    const { msgNum } = record.get(['msgNum']);
    const { supplierCompanyId } = this.organizationInfoDs.current?.get(['supplierCompanyId']) || {};
    const {
      remote,
      customizeCollapse,
      customizeBtnGroup,
      submitAfterConfirmLoading,
      queryFileListOrgLoading,
      location: { state: { source } = {} },
    } = this.props;
    const backPath =
      source === 'all'
        ? `/sodr/order-execution-workbench/all-orders/${id}`
        : '/sodr/order-execution-workbench/list';

    const previewModalProps = {
      fileList,
      btnText: intl
        .get(`slod.orderExecution.view.title.electronicSignatureAttachment`)
        .d('电子签章附件'),
      btnProps: { icon: 'attach_file', funcType: 'flat' },
    };
    const loading =
      loadingAll ||
      !!submitAfterConfirmLoading ||
      !!queryFileListOrgLoading ||
      this.detailInfoDs.status !== 'ready' ||
      this.basicInfoDs.status !== 'ready' ||
      this.giftInfoDs.status !== 'ready';
    const buttons = [
      {
        name: 'feedbackAgain',
        btnComp: Button,
        child: intl.get('slod.orderExecution.view.option.feedbackAgain').d('再次反馈'),
        btnProps: {
          loading,
          color: 'primary',
          icon: 'forum-o',
          type: 'c7n-pro',
          onClick: this.handleFeedback,
          permissionList: [
            {
              code: 'srm.logistics.delivery.order.execution.workbench.button.all.feedbackAgain',
              type: 'c7n-pro',
              meaning: '销售方订单工作台-整单-再次反馈',
            },
          ],
        },
      },
      {
        name: 'print',
        btnComp: Button,
        child: intl.get('slod.orderExecution.view.button.print').d('打印'),
        btnProps: {
          loading,
          funcType: 'flat',
          icon: 'print',
          type: 'c7n-pro',
          wait: THROTTLE_TIME,
          onClick: this.handlePrint,
          permissionList: [
            {
              code:
                'srm.logistics.delivery.order.execution.workbench.button.detail.feedbackalready.print',
              type: 'c7n-pro',
              meaning: '销售方订单工作台-全部-已反馈-老打印',
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
            funcType: 'flat',
            icon: 'print',
            type: 'c7n-pro',
            wait: THROTTLE_TIME,
            permissionList: [
              {
                code:
                  'srm.logistics.delivery.order.execution.workbench.button.detail.feedbackalready.printnew',
                type: 'c7n-pro',
                meaning: '销售方订单工作台-全部-已反馈-新打印',
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
            const res = getResponse(await initChatOnlineRoom({ poHeaderId: id, camp: 'supplier' }));
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
    return (
      <Fragment>
        <Header
          title={intl.get('slod.orderExecution.view.title.orderDetails').d('订单明细')}
          backPath={backPath}
        >
          {customizeBtnGroup(
            { code: 'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.BUTTONS', pro: true },
            <DynamicButtons
              buttons={
                remote
                  ? remote.process('processButtons', buttons, {
                      loading,
                      record,
                      lineDs: this.detailInfoDs,
                      handleQuery: this.handleQuery,
                    })
                  : buttons
              }
            />
          )}
          {electricSignFlag === 1 && <PreviewModal {...previewModalProps} />}
        </Header>
        <div
          className={styles['order-workspace-detail-container']}
          id="order-workspace-detail-container"
        >
          <OrderAffix linkKeys={contentList.map((i) => i.key)} />
          <Spin spinning={loading}>
            {customizeCollapse(
              {
                code: 'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.COLLAPSE',
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
