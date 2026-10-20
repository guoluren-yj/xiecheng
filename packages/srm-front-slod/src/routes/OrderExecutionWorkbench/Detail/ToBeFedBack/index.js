/*
 * ToBeFedBack - 订单执行工作台-待反馈明细
 * @date: 2021/11/01 20:26:14
 * @author: mjq <jiaqi.mao@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, PureComponent } from 'react';
import { Collapse } from 'choerodon-ui';
import { DataSet, Modal, Spin, SelectBox, Form } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { reaction } from 'mobx';
import { isEmpty, isNumber, isArray } from 'lodash';
import { routerRedux } from 'dva/router';
import { Bind, Throttle } from 'lodash-decorators';
import { observer } from 'mobx-react';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { SRM_SPUC } from '_utils/config';
import notification from 'utils/notification';
import DynamicButtons from '_components/DynamicButtons';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getCurrentOrganizationId,
  getUserOrganizationId,
  getResponse,
  getCurrentUser,
} from 'utils/utils';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import remotes from 'utils/remote';
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
import {
  getFileList,
  signRetry,
  initChatOnlineRoom,
} from '@/services/orderExecutionWorkbenchService';
import OrderAffix from '../../components/OrderAffix';
import C7nMessage from '../../components/C7nMessage';
import AttachmentInfo from '../../components/AttachmentInfo';
import C7nOperationApprove from '../../components/C7nOperationApprove/newIndex';
import MessageVerification from '../../components/MessageVerification';
import PreviewModal from '../../components/PreviewModal';
import SealModal from '../../components/SealModal';
import { giftInfoDsConfig, GiftInfo } from '../../components/GiftInfo';
import BasicInfo from './BasicInfo';
import OrganizationInfo from './OrganizationInfo';
import DetailInfo from './DetailInfo';
import BillingInfo from './BillingInfo';
import ReceiptInfo from './ReceiptInfo';
import remoteConfig from './remote';
import {
  basicInfo,
  organizationInfo,
  detailInfo,
  receiptInfo,
  billingInfo,
  batchMaintenance,
  filterLine,
} from './store/toBeFedBackDs';
import styles from '../index.less';
import FeedbackGetVerificationTable from '@/routes/OrderExecutionWorkbench/components/FeedbackGetVerificationTable';

const organizationId = getCurrentOrganizationId();
const tenantId = getUserOrganizationId();
const currentUser = getCurrentUser();
const isSupplier = organizationId !== tenantId;
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
@connect(({ loading, orderExecutionWorkbench }) => ({
  saveDetailLoading: loading.effects['orderExecutionWorkbench/saveDetail'],
  confirmChapterLoading: loading.effects['orderExecutionWorkbench/confirmChapter'],
  confirmMobileChapterLoading: loading.effects['orderExecutionWorkbench/confirmMobileChapter'],
  fetchVerifyPhoneNumLoading: loading.effects['orderExecutionWorkbench/fetchVerifyPhoneNumLoading'],
  confirmDetailLoading: loading.effects['orderExecutionWorkbench/confirmDetail'],
  getFeedbackVerificationListLoading:
    loading.effects['orderExecutionWorkbench/getFeedbackVerificationList'],
  orderExecutionWorkbench,
}))
@formatterCollections({
  code: [
    'slod.orderExecution',
    'sodr.orderExecution',
    'sodr.workspace',
    'sodr.common',
    'scux.slod',
  ],
})
@withCustomize({
  unitCode: [
    'SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.BASICINFO',
    'SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.ORGANIZATIONINFO',
    'SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.DETAILINFO',
    'SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.BILLINGINFO',
    'SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.RECEIPTINFO',
    'SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.ATTACHMENTINFO',
    'SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.ATTACHMENTINFO_EXTERNAL',
    'SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.BOM',
    'SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.BATCHEDITING',
    'SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.BUTTONS',
    'SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.COLLAPSE',
    'SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.FORM',
    'SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.GIFTINFO',
    'SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.PAYMENTTERMINFO',
  ],
})
@remotes(...remoteConfig)
@observer
export default class ToBeFedBack extends PureComponent {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { id },
      },
    } = props;
    this.state = {
      id,
      attachmentConfig: {
        readOnly: [1, 1, 0],
        title: [undefined, intl.get('slod.orderExecution.view.attachment.attachment').d('附件')],
      },
      collByLine: 0,
      setting: '0',
      picDataSource: [], // 印章图片
      focusStatus: '', // 选中印章图片标识
      currentPic: 0, // 当前图片位置
      phoneNum: null, // 手机号码
      smsVerifyVisible: false, // 短信验证
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
    this.detailInfoDs = new DataSet({
      ...(props?.remote
        ? props?.remote.process(
            'SODR.SUPPLIERWORKSPACE_TOFEEDBACK_DETAIL_PROCESS_DETAILINFO_DS',
            detailInfo()
          )
        : detailInfo()),
      transport: {
        read: () => {
          return {
            url: `${SRM_SPUC}/v1/${organizationId}/po-line/${id}/detail`,
            method: 'GET',
          };
        },
      },
    });
    this.giftInfoDs = new DataSet(
      giftInfoDsConfig({
        poHeaderId: id,
        type: 'toBeFeedback',
        params: { customizeUnitCode: 'SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.GIFTINFO' },
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

  /**
   * 获取印章图片
   */
  @Bind()
  fetchSealPictures(header) {
    const { dispatch } = this.props;
    const { companyId, authType, supplierCompanyId, electricSignStatus } = header;
    const isSupplierSign = electricSignStatus && electricSignStatus === 'SUPPLIER_SIGN_CONTRACT';
    const _companyId = !isSupplier ? companyId : supplierCompanyId;
    const __companyId = isSupplierSign ? supplierCompanyId : _companyId;
    dispatch({
      type: 'orderExecutionWorkbench/fetchSealPictures',
      payload: {
        lovCode: 'SPFM.COMPANY_SEAL',
        companyId: __companyId,
        tenantId: getUserOrganizationId(),
        sealType: authType,
      },
    }).then((res) => {
      if (res) {
        const picDataSource = res.filter((item) => {
          return item.sealFileUrl !== null && item.enabledFlag !== 0;
        });
        this.setState({
          picDataSource,
        });
      }
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
        this.organizationInfoDs.loadData([res]);
        this.receiptInfoDs.loadData([res]);
        this.billingInfoDs.loadData([res]);
        this.paymentTermInfoDs.loadData([res]);
        if (res.authType) {
          this.fetchSealPictures(res);
        }
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
                    code: 'SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.FORM',
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
              basicInfoDs={this.basicInfoDs}
              ds={this.detailInfoDs}
              customizeTable={customizeTable}
              customizeForm={customizeForm}
              collByLine={collByLine}
              batchMaintenanceDs={this.batchMaintenanceDs}
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
              type="toBeFeedback"
              customizeTable={customizeTable}
              code="SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.GIFTINFO"
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
              customizeCode="SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.PAYMENTTERMINFO"
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
                'SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.ATTACHMENTINFO',
                'SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.ATTACHMENTINFO_EXTERNAL',
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
        unitCode: 'SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.BATCHEDITING',
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
      collByLine === 2 && !isEmpty(selected) ? [...selected] : [this.detailInfoDs];
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
    const data = [
      {
        poHeaderDetailDTO: { ...poHeaderDetailDTO, poWorkbenchFlag: 1 },
        poLineDetailDTOs,
        fieldMap,
      },
    ];
    const validateStatus = await this.getValidateStatus();
    if (!validateStatus) return;
    const handleComfirm = async () => {
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

      const feedBackOrder = async () => {
        this.setState({ loadingAll: true });
        const res = await dispatch({
          type: 'orderExecutionWorkbench/confirmDetail',
          payload: {
            query: {
              poWorkbenchFlag: 1,
              customizeUnitCode: `SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.BASICINFO,SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.ORGANIZATIONINFO,SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.DETAILINFO,SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.PAYMENTTERMINFO,SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.ATTACHMENTINFO,SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.ATTACHMENTINFO_EXTERNAL`,
            },
            data,
          },
        });
        this.setState({ loadingAll: false });
        if (res) {
          notification.success();
          dispatch(
            routerRedux.push({
              pathname: '/sodr/order-execution-workbench/list',
            })
          );
          return true;
        }
        return false;
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
              return false;
            }
            return feedBackOrder();
          }
        } else {
          failedCallback();
          return false;
        }
      } else {
        feedBackOrder();
      }
    };
    const getVerification = await dispatch({
      type: 'orderExecutionWorkbench/getFeedbackVerificationList',
      payload: {
        poHeaderList: this.basicInfoDs.toJSONData(),
      },
    });
    if (!getVerification) {
      return;
    }
    const queryFun = () => ({
      url: `${SRM_SPUC}/v1/${getCurrentOrganizationId()}/po-workbench/po-header/feedback/verify/sidebar`,
      method: 'POST',
      data: this.basicInfoDs.toJSONData(),
      responseType: 'text',
    });
    const { content } = JSON.parse(getVerification);
    if (content && !isEmpty(content)) {
      Modal.confirm({
        title: (
          <span style={{ marginLeft: '20px' }}>
            {intl.get('slod.orderExecution.view.confirm.feedback').d('是否确认反馈订单')}
          </span>
        ),
        children: (
          <FeedbackGetVerificationTable
            queryFun={queryFun}
            message={intl
              .get('sodr.common.model.common.feedbackForLists')
              .d(
                '以下订单含有【取消待确认】，或者【关闭待确认】的订单信息，确认反馈会将【取消待确认】或者【关闭待确认】的订单行同时进行确认，请确认是否继续确认反馈'
              )}
          />
        ),
        onOk: handleComfirm,
        style: { width: '795px' },
        bodyStyle: { padding: '20px 0 0 0' },
        destroyOnClose: true,
        drawer: true,
        okText: intl.get('sodr.common.model.common.determineFeedback').d('确定反馈'),
      });
    } else {
      handleComfirm();
    }
  }

  @Bind()
  async handleSave() {
    const { dispatch, remote } = this.props;
    const { poHeaderDetailDTO, poLineDetailDTOs, fieldMap } = this.getValues();
    const validateStatus = await this.getValidateStatus();
    if (!validateStatus) return;
    const beforeSave = await remote?.event?.fireEvent('beforeSave', {
      that: this,
      basicInfoDs: this.basicInfoDs,
    });
    if (!beforeSave) return;
    const res = await dispatch({
      type: 'orderExecutionWorkbench/saveDetail',
      payload: {
        query: {
          customizeUnitCode: `SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.BASICINFO,SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.ORGANIZATIONINFO,SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.DETAILINFO,SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.PAYMENTTERMINFO`,
        },
        data: {
          poHeaderDetailDTO: { ...poHeaderDetailDTO, poWorkbenchFlag: 1 },
          poLineDetailDTOs,
          fieldMap,
        },
      },
    });
    if (res) {
      notification.success();
      this.handleQuery();
    }
  }

  /**
   * 跳转到印章管理
   */
  @Bind()
  skipToSealManage() {
    openTab({
      key: '/spfm/seal-mange',
      title: 'srm.bg.manager.seal.manage',
    });
  }

  /**
   * handleClickImg 印章点击样式改变
   * @param {string} index
   */
  @Bind()
  handleClickImg(index) {
    const { focusStatus, picDataSource } = this.state;
    this.setState({
      focusStatus: focusStatus === index + 1 ? '' : index + 1,
      sealPictureUrl: picDataSource[index].sealPictureUrl,
      sealId: picDataSource[index].sealId,
    });
  }

  /**
   * 点击按钮图片移动
   */
  @Bind()
  goToPictureSign(type) {
    const { currentPic, imgHeight } = this.state;
    this.setState({
      currentPic: type === 'up' ? currentPic - (imgHeight + 16) : currentPic + (imgHeight + 16),
    });
  }

  // 判断是否为供应商
  isSupplier = () => {
    return getUserOrganizationId() !== getCurrentOrganizationId();
  };

  /**
   * FDD签章重试确认
   */
  handleRetryConfirmModal = async (data) => {
    await Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: (
        <>
          <p>
            {intl
              .get('sodr.common.modal.sign.retry.tip')
              .d('当前订单已在法大大签署完成，本次签章仅更新SRM订单签署状态')}
          </p>
          <p>{intl.get('sodr.common.modal.sign.retry.confirm').d('是否确认签章？')}</p>
        </>
      ),
      onOk: async () => {
        const ras = getResponse(await signRetry(JSON.parse(data.compensationData || null)));
        if (!ras) return false;
        if (ras) {
          notification.success();
          this.handleQuery();
        }
      },
    });
  };

  /**
   * authType FDD来源直接跳转
   * handleClickSeal 无手机验证签章
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  handleClickSeal() {
    const { dispatch, remote } = this.props;
    const { sealId, sealPictureUrl } = this.state;
    const {
      supplierCompanyId,
      mobileVerifyFlag,
      authType,
      companyId,
      pcHeaderId,
      certificateResId,
      electricSignStatus,
    } =
      this.basicInfoDs.current?.get([
        'supplierCompanyId',
        'mobileVerifyFlag',
        'authType',
        'companyId',
        'pcHeaderId',
        'certificateResId',
        'electricSignStatus',
      ]) || {};
    const isSupplierSign = electricSignStatus && electricSignStatus === 'SUPPLIER_SIGN_CONTRACT';
    const _companyId = !isSupplier ? companyId : supplierCompanyId;
    const __companyId = isSupplierSign ? supplierCompanyId : _companyId;
    const _supplierCompanyId = !isSupplier ? supplierCompanyId : companyId;
    const __supplierCompanyId = isSupplierSign ? companyId : _supplierCompanyId;

    const signTypeEstimateFlag = remote?.process('signTypeEstimateFn', null, {
      dispatch,
      authType,
      pcHeaderId,
      certificateResId,
      companyId: __companyId,
      type: 'orderExecutionWorkbench/confirmChapter',
    });
    if (signTypeEstimateFlag) return;

    if (mobileVerifyFlag && authType !== 'FDD' && !SAAS_SIGN.test(authType)) {
      if (!sealId) {
        notification.warning({
          message: intl.get('sodr.common.button.selectedSignTip').d('请选择印章'),
        });
        return false;
      }
      return dispatch({
        type: 'orderExecutionWorkbench/fetchVerifyPhoneNum',
        payload: {
          authType,
          companyId: __companyId,
          supplierCompanyId: __supplierCompanyId,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            smsVerifyVisible: true,
            phoneNum: res.phone,
          });
        }
        return res;
      });
    } else if (authType === 'FDD') {
      if (!pcHeaderId) return;
      return dispatch({
        type: 'orderExecutionWorkbench/confirmChapter',
        payload: {
          authType,
          pcHeaderId,
          certificateResId,
          companyId: __companyId,
        },
      }).then((res) => {
        if (res) {
          if (res.compensationFlag === 1) {
            this.handleRetryConfirmModal(res);
          } else {
            notification.success();
            window.open(res.signUrl);
          }
        }
        return res;
      });
    } else if (SAAS_SIGN.test(authType)) {
      if (!pcHeaderId) return;
      return dispatch({
        type: 'orderExecutionWorkbench/confirmChapter',
        payload: {
          authType,
          pcHeaderId,
          companyId: __companyId,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          window.open(res.signUrl);
        }
        return res;
      });
    } else {
      if (!sealId) {
        notification.warning({
          message: intl.get('sodr.common.button.selectedSignTip').d('请选择印章'),
        });
        return false;
      }
      if (!pcHeaderId) return;
      return dispatch({
        type: 'orderExecutionWorkbench/confirmChapter',
        payload: {
          authType,
          companyId: __companyId,
          pcHeaderId,
          sealId,
          sealPictureUrl,
          certificateResId,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          dispatch(
            routerRedux.push({
              pathname: '/sodr/order-execution-workbench/list',
            })
          );
        }
        return res;
      });
    }
  }

  /**
   * 获取手机验证码
   */
  @Bind()
  getVerifyCode() {
    const { dispatch } = this.props;
    const { certificateResId, pcHeaderId, companyId, supplierCompanyId, electricSignStatus } =
      this.basicInfoDs.current?.get([
        'certificateResId',
        'pcHeaderId',
        'companyId',
        'supplierCompanyId',
        'electricSignStatus',
      ]) || {};
    const isSupplierSign = electricSignStatus && electricSignStatus === 'SUPPLIER_SIGN_CONTRACT';
    const _companyId = !isSupplier ? companyId : supplierCompanyId;
    const __companyId = isSupplierSign ? supplierCompanyId : _companyId;
    const phoneNum = this.smsVerifyForm.getFieldValue('phoneNum') || {};
    this.smsVerifyForm.validateFields(['phoneNum'], (err) => {
      if (!err) {
        dispatch({
          type: 'orderExecutionWorkbench/getVerifyCode',
          payload: {
            companyId: __companyId,
            mobile: phoneNum,
            certificateResId,
            pcHeaderId,
          },
        });
      }
    });
  }

  /**
   * handleSmsVerifyOk - 手机验证签章
   */
  handleSmsVerifyOk = () => {
    const { validateFields, getFieldsValue } = this.smsVerifyForm;
    const { dispatch } = this.props;
    const smsVerifyData = getFieldsValue();
    const { sealId, sealPictureUrl } = this.state;
    const {
      authType,
      companyId,
      pcHeaderId,
      certificateResId,
      supplierCompanyId,
      electricSignStatus,
    } =
      this.basicInfoDs.current?.get([
        'authType',
        'companyId',
        'pcHeaderId',
        'certificateResId',
        'supplierCompanyId',
        'electricSignStatus',
      ]) || {};
    const isSupplierSign = electricSignStatus && electricSignStatus === 'SUPPLIER_SIGN_CONTRACT';
    const _companyId = !isSupplier ? companyId : supplierCompanyId;
    const __companyId = isSupplierSign ? supplierCompanyId : _companyId;
    validateFields((err) => {
      if (isEmpty(err)) {
        // 获取当前用户手机号 带验证码签章 调用签章接口
        const { phoneNum, verifyCode } = smsVerifyData;
        if (!pcHeaderId) return;
        dispatch({
          type: 'orderExecutionWorkbench/confirmMobileChapter',
          payload: {
            authType,
            companyId: __companyId,
            pcHeaderId,
            sealId,
            sealPictureUrl,
            certificateResId,
            verifiCode: verifyCode,
            mobile: phoneNum,
          },
        }).then((res) => {
          if (res) {
            this.handleSmsVerifyCancel();
            dispatch(
              routerRedux.push({
                pathname: '/sodr/order-execution-workbench/list',
              })
            );
          }
        });
      }
    });
  };

  /**
   * handleSmsVerifyCancel - 短信验证取消
   */
  handleSmsVerifyCancel = () => {
    this.setState({ smsVerifyVisible: false });
    if (this.smsVerifyForm) {
      this.smsVerifyForm.resetFields();
    }
  };

  render() {
    const contentList = this.getContent();
    const {
      id,
      currentPic,
      focusStatus,
      picDataSource,
      smsVerifyVisible,
      fileList,
      phoneNum,
      loadingAll,
    } = this.state;
    const record = this.basicInfoDs.current;
    const { confirmedFlag, electricSignStatus, electricSignFlag, statusCode, authType, msgNum } =
      record?.get([
        'confirmedFlag',
        'electricSignStatus',
        'electricSignFlag',
        'statusCode',
        'authType',
        'msgNum',
      ]) || {};
    const { supplierCompanyId } = this.organizationInfoDs.current?.get(['supplierCompanyId']) || {};
    const {
      customizeBtnGroup,
      saveDetailLoading = false,
      location: { state: { source } = {} },
      confirmChapterLoading,
      fetchVerifyPhoneNumLoading,
      confirmMobileChapterLoading,
      confirmDetailLoading,
      getFeedbackVerificationListLoading,
      customizeCollapse,
      remote,
    } = this.props;
    const backPath =
      source === 'all'
        ? `/sodr/order-execution-workbench/all-orders/${id}`
        : '/sodr/order-execution-workbench/list';

    const sealModalProps = {
      currentPic,
      focusStatus,
      picDataSource,
      electricSignStatus,
      sealMenuFlag: false,
      confirmChapterLoading,
      fetchVerifyPhoneNumLoading,
      onRef: (node) => {
        this.sealModalRef = node;
      },
      btnProps: { icon: 'authorize', funcType: 'flat' },
      onModalOk: this.handleClickSeal,
      onSkipToSealManage: this.skipToSealManage,
      onHandleClickImg: this.handleClickImg,
      onGoToPictureSign: this.goToPictureSign,
      disableBtn: electricSignFlag === 1 && confirmedFlag !== 1,
    };
    const messageVerifyProps = {
      phoneNum,
      smsVerifyVisible,
      confirmMobileChapterLoading,
      handleOk: this.handleSmsVerifyOk,
      getVerifyCode: this.getVerifyCode,
      handleCancel: this.handleSmsVerifyCancel,
      ref: (node) => {
        this.smsVerifyForm = node;
      },
    };
    const previewModalProps = {
      fileList,
      btnText: intl
        .get(`slod.orderExecution.view.title.electronicSignatureAttachment`)
        .d('电子签章附件'),
      btnProps: { icon: 'attach_file', funcType: 'flat' },
    };
    const loading =
      loadingAll ||
      !!saveDetailLoading ||
      !!confirmChapterLoading ||
      !!confirmMobileChapterLoading ||
      !!fetchVerifyPhoneNumLoading ||
      !!confirmDetailLoading ||
      !!getFeedbackVerificationListLoading ||
      this.detailInfoDs.status !== 'ready' ||
      this.basicInfoDs.status !== 'ready' ||
      this.giftInfoDs.status !== 'ready';
    const buttons = [
      !((electricSignFlag === 1 && statusCode === 'CONFIRMED') || statusCode === 'CANCELED') && {
        name: 'feedback',
        btnComp: Button,
        child: intl.get('slod.orderExecution.view.option.feedback').d('反馈'),
        btnProps: {
          loading,
          funcType: 'raised',
          color: 'primary',
          icon: 'forum-o',
          type: 'c7n-pro',
          wait: THROTTLE_TIME,
          onClick: () => {
            this.handleFeedback();
          },
          permissionList: [
            {
              code: 'srm.logistics.delivery.order.execution.workbench.button.all.feedback',
              type: 'c7n-pro',
              meaning: '销售方订单工作台-整单-反馈',
            },
          ],
        },
      },
      !((electricSignFlag === 1 && statusCode === 'CONFIRMED') || statusCode === 'CANCELED') && {
        name: 'save',
        btnComp: Button,
        child: intl.get('slod.orderExecution.view.option.save').d('保存'),
        btnProps: {
          loading,
          funcType: 'flat',
          icon: 'save',
          type: 'c7n-pro',
          wait: THROTTLE_TIME,
          onClick: () => {
            this.handleSave();
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
          icon: 'print',
          type: 'c7n-pro',
          wait: THROTTLE_TIME,
          onClick: this.handlePrint,
          permissionList: [
            {
              code:
                'srm.logistics.delivery.order.execution.workbench.button.detail.tobefedback.print',
              type: 'c7n-pro',
              meaning: '销售方订单工作台-全部-待反馈-老打印',
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
                  'srm.logistics.delivery.order.execution.workbench.button.detail.tobefedback.printnew',
                type: 'c7n-pro',
                meaning: '销售方订单工作台-全部-待反馈-新打印',
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
    let signBtn = {};
    const disabledBtn = electricSignFlag === 1 && confirmedFlag !== 1;
    const singFlag = remote
      ? remote.process(
          'SODR.SUPPLIERWORKSPACE_TOFEEDBACK_DETAIL_PROCESS_SIGN',
          authType === 'FDD' || SAAS_SIGN.test(authType),
          { authType }
        )
      : authType === 'FDD' || SAAS_SIGN.test(authType);
    if (singFlag) {
      signBtn = {
        name: 'sign',
        btnType: 'c7n-pro',
        child: intl.get(`hzero.common.button.sign`).d('签章'),
        btnProps: {
          loading,
          icon: 'authorize',
          funcType: 'flat',
          disabled: disabledBtn,
          onClick: this.handleClickSeal,
        },
      };
    } else {
      signBtn = {
        name: 'sign',
        btnComp: SealModal,
        childFor: 'sealName',
        btnProps: {
          ...sealModalProps,
          btnProps: {
            loading,
            icon: 'authorize',
            funcType: 'flat',
            type: 'c7n-pro',
          },
          sealName: intl.get(`hzero.common.button.sign`).d('签章'),
        },
      };
    }
    if (electricSignFlag === 1) {
      buttons.unshift(signBtn);
    }
    const newBtns = remote
      ? remote.process('toBeFedBackDetailButtons', buttons, {
          current: this,
          loading,
        })
      : buttons;
    return (
      <Fragment>
        <Header
          title={intl.get('slod.orderExecution.view.title.orderDetails').d('订单明细')}
          backPath={backPath}
        >
          {customizeBtnGroup(
            { code: 'SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.BUTTONS', pro: true },
            <DynamicButtons buttons={newBtns} />
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
                code: 'SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.COLLAPSE',
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
        <MessageVerification {...messageVerifyProps} />
      </Fragment>
    );
  }
}
