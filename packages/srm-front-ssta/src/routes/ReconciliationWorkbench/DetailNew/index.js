/* eslint-disable react/jsx-indent */
import React, { PureComponent, Fragment, isValidElement } from 'react';
import { Tabs, DataSet, Button, Form, Modal, NumberField, Attachment } from 'choerodon-ui/pro';
import { Popover, Spin, Tooltip, Collapse } from 'choerodon-ui';
import { observer } from 'mobx-react';
import queryString from 'querystring';
import { isEmpty, isArray, isFunction } from 'lodash';
import { math } from 'choerodon-ui/dataset';
import { checkPrintWindow, getPdfPreviewUrl } from 'srm-front-boot/lib/utils/utils';
import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import DocFlow from '_components/DocFlow';
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';
import Import from 'components/Import';
import ExcelExportPro from 'components/ExcelExportPro';
import { Header } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getActiveTabKey, updateTab } from 'utils/menuTab';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import IMChatDraggable from '_components/IMChatDraggable';
import DynamicButtons from 'srm-front-boot/lib/components/DynamicButtons';
import PrintProButton from '_components/PrintProButton';
import { queryIdpValue } from 'services/api';
import withRemote from 'hzero-front/lib/utils/remote';

import { billLineConfig } from '@/utils/amountConfig';
import {
  getResponse,
  formatNumber,
  formatDynamicBtns,
  recordsCommit,
  getAttachmentUrlWithToken,
  getIncTaxAmountByNetPrice,
  getNetPriceByTaxIncPrice,
} from '@/utils/utils';
import { confirmModal } from '@/routes/Components/ConfirmModal';
import { formatErrorInfo } from '@/routes/Components/ErrorInfo';
import { getCalculateConfig } from '@/utils/api';

import {
  FormItem,
  ReconciliationWorkbenchRecord,
  getPermissions,
  NavigationAnchor,
} from '@/routes/Components';
import {
  getDetail,
  save,
  submit,
  cancel,
  sync,
  comfirm,
  deleteData,
  returnData,
  cancelLines,
  print,
  withdraw,
  fetchCurrencyCode,
  submitValidate,
  confirmValidate,
  getBillLinesByIds,
  rejectedSignature,
  createInvoiceSettle,
  getInvoiceConfig,
  getSignatureLInk,
  downloadSignatureTec,
  downloadSignatureNotary,
  signatureBack,
  commonSignature,
  commonCancelSignature,
  commonDownloadSignature,
  commonTerminateSignature,
  downloadTerminate,
} from '@/services/reconciliationWorkbenchService';
import Summary from '@/routes/Components/Summary';
import Styles from '@/routes/common.less';
import { statusTagRender } from '@/utils/renderer';
import { formDs, tableDs } from './mainDS';
import SignatureModal from './SignatureModal';
import FilledInfoModal from './FilledInfoModal';
import DetailDrawer from '../DetailDrawerNew';
import MainStrategy from './MainStrategy';
import AddModal from './AddModal';
import BatchModifyModal from './BatchModifyModal';
import WorkflowCard from './WorkflowCard';
import { tagColor } from '../dic';
import InvoiceStatementRecords from '../components/InvoiceStatementRecords';
import style from './index.less';
import WorkflowCaller from '@/components/WorkflowCaller';

const numberShiledRender = ({ text, record }) =>
  Number(record.get('priceShiledFlag')) === 1 ? '****' : text;

const camp = 'PURCHASER';
const { TabPane } = Tabs;
const { Panel } = Collapse;
const organizationId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${organizationId}`;
const permPrefix = 'srm.settle-account.reconciliation-workbench.ux-purchaser.ps';
const buttonPermPrefix = `srm.settle-account.reconciliation-workbench.ux-purchaser.button`;

const headUnitCodes = [
  'SSTA.PURCHASER_BILL_DETAIL.BASIC_INFO',
  'SSTA.PURCHASER_BILL_DETAIL.SETTLE_CONFIG',
  'SSTA.PURCHASER_BILL_DETAIL.OTHERS_INFO',
  'SSTA.PURCHASER_BILL_DETAIL.ENCLOSURE',
  'SSTA.PURCHASER_BILL_DETAIL.PRE_CONFIRM',
  'SSTA.PURCHASER_BILL_DETAIL.PRE_RETURN',
  'SSTA.PURCHASER_BILL_DETAIL.PRE_CANCEL',
  'SSTA.PURCHASER_BILL_DETAIL.FLOW_BASIC_CARD',
  'SSTA.PURCHASER_BILL_DETAIL.FLOW_EXTRA_CARD',
];
const lineUnitCodes = [
  'SSTA.PURCHASER_BILL_DETAIL.TRANSACTION_DETAILS',
  'SSTA.PURCHASER_BILL_DETAIL.TRANSACTION_DETAIL_SEARCH',
];
const unitCode = [
  ...headUnitCodes,
  ...lineUnitCodes,
  'SSTA.PURCHASER_BILL_DETAIL.HEADER_BTNS',
  'SSTA.PURCHASER_BILL_DETAIL.COLLAPSE',
  'SSTA.PURCHASER_BILL_DETAIL.HEADER_BTNS_UPDATE',
  'SSTA.PURCHASER_BILL_DETAIL.BATCH_MODIFY_LINE',
  'SSTA.PURCHASER_BILL_DETAIL.LINE_BTNS',
];

const customizeUnit = [...headUnitCodes, ...lineUnitCodes].join();
let signatureModal;

@withCustomize({
  unitCode,
})
@withRemote(
  {
    code: 'SSTA_RECONCILIATION_DETAIL_CUX',
    name: 'remote',
  },
  {
    events: {
      afterInit: () => {},
    },
  }
)
@formatterCollections({
  code: [
    'ssta.reconciliationWorkbench',
    'ssta.common',
    'entity.attachment',
    'ssta.settlePool',
    'hzero.c7nProUI',
    'hzero.c7nProU',
    'hwfp.common',
    'ssta.costSheet',
    'entity.attachment',
    'ssta.purchaseSettlePool',
    'ssta.purchaseSettle',
  ],
})
@observer
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    const {
      location: { pathname },
    } = this.props;

    /**
     * 内部状态
     */
    this.state = {
      billList: [],
      listFlag: false,
      billHeaderId: '',
      editFlag: false,
      originData: {
        headerData: {},
        lineDatas: [],
      },
      action: null,
      notPub: pathname.split('/')[1] !== 'pub',
      // fileCount: 0,
      type: '',
      billNum: '',
      permsMap: new Map(),
      pinFixed: false,
      showInvoiceBtn: false,
      otherEdit: false, // 工作流其他信息和附件可编辑
      docLinkFlag: false, // 单据查询只读页面，没有返回按钮，头按钮只有操作记录，行上没有单据流按钮
      readOnlyFlag: false, // 单据只读，有返回按钮，头按钮只有操作记录
      statusData: {},
      isNewPub: false, // 新审批工作量表单
      priceCalPrecisionFlag: false, // 单价计算精度标识，如果为true使用单价单价精度(原计算方式)
    };

    /**
     * 头 DataSet
     */
    this.formDs = new DataSet(formDs());

    /**
     * 行 DataSet
     */
    this.tableDs = new DataSet(
      this.props.remote
        ? this.props.remote.process(
            'SSTA_RECONCILIATION_DETAIL_CUX.LINE_DSPROPS',
            tableDs(this.props),
            {}
          )
        : tableDs(this.props)
    );

    this.workflowCaller = new WorkflowCaller(this.formDs);

    this.defaultActiveKey = ['base', 'transaction', 'others', 'attachment'];
  }

  componentDidMount() {
    this.formDs.setState('handleFetch', this.handleFetch);
    this.init();
    this.getPermissions();
    this.fetchLov();
    this.fetchPriceCalculateConfig();
  }

  /**
   * 获取操作按钮权限集
   */
  getPermissions = () => {
    getPermissions([
      `${permPrefix}.rowimport`,
      `${permPrefix}.rowexport`,
      `${permPrefix}.newrowimport`,
      `${permPrefix}.newrowexport`,
      `${permPrefix}.radio.button.update`,
      `${permPrefix}.radio.button.audit`,
      `${permPrefix}.radio.button.cancel`,
      `${permPrefix}.radio.button.signature`, // 全部页签下的签章权限集 & 驳回签章权限
      `${permPrefix}.radio.button.sync`,
      `${permPrefix}.radio.button.recall`,
      `${buttonPermPrefix}.line-add`,
      `${buttonPermPrefix}.line-delete`,
      `${buttonPermPrefix}.allBaseOnPrice`,
      `${buttonPermPrefix}.baseOnPrice`,
      `${buttonPermPrefix}.print-detail`,
      `${buttonPermPrefix}.new-print-detail`,
      `${buttonPermPrefix}.lineBatchModify`,
      `${buttonPermPrefix}.workflow_newrowimport`,
      `${buttonPermPrefix}.signatureLink`, // 签章链接按钮权限
      `${buttonPermPrefix}.downloadSignatureTec`,
      `${buttonPermPrefix}.downloadSignatureNotary`,
      `${buttonPermPrefix}.signatureBack`, // 取消签章按钮权限
      `${buttonPermPrefix}.detail.signature`, // 签章页签下的签章按钮权限
      `${buttonPermPrefix}.commonSignature`,
      `${buttonPermPrefix}.cancelSignature`,
      `${buttonPermPrefix}.signatureDownload`,
      `${buttonPermPrefix}.terminate`,
      `${buttonPermPrefix}.downloadTerminate`,
      `${buttonPermPrefix}.invoiceRecord`,
    ]).then((data) => {
      if (data) {
        this.setState({
          permsMap: data,
        });
      }
    });
  };

  componentDidUpdate(preProps) {
    if (preProps.location.search !== this.props.location.search) {
      this.init(true);
    }
  }

  fetchLov = async () => {
    const data = await queryIdpValue('SSTA.BILL_STATUS');
    if (data) {
      const statusData = {};
      data.forEach(({ value, tag }) => {
        statusData[value] = tag;
      });
      this.setState({ statusData });
    }
  };

  // 获取计算方式配置
  fetchPriceCalculateConfig = async () => {
    const data = getResponse(await getCalculateConfig());
    if (data) {
      const flag = data?.some((v) => v.algorithm === 'CURRENCY_PRECISION');
      this.setState({
        priceCalPrecisionFlag: flag,
      });
    }
  };

  /**
   * 页面初始化
   */
  init = (lineFlag) => {
    const { notPub } = this.state;
    const { onLoad, onFormLoaded, remote: remoteProps } = this.props;
    const routerParams = queryString.parse(this.props.location.search.substr(1));
    const {
      editFlag = 0,
      billList: strBillList,
      action,
      type,
      otherEdit,
      docLinkFlag = 0,
      readOnlyFlag = 0,
      flowPage,
    } = routerParams;
    const billList = JSON.parse(strBillList);
    const listFlag = billList.length > 1;
    const billHeaderId = billList[0] ? billList[0].billHeaderId : '';
    const billNum = billList[0] ? billList[0].billNum : '';
    this.tableDs.action = action;
    this.setState(
      {
        billList,
        listFlag,
        action,
        editFlag: Number(editFlag) === 1,
        billHeaderId,
        type,
        billNum,
        otherEdit,
        docLinkFlag: Number(docLinkFlag) === 1,
        readOnlyFlag: Number(readOnlyFlag) === 1,
        isNewPub: !notPub && Boolean(flowPage),
      },
      async () => {
        const res = await this.handleFetch();
        if (lineFlag) {
          this.tableDs.setQueryParameter('billHeaderId', billHeaderId);
          this.tableDs.query();
        }
        // 初始化后置埋点
        if (remoteProps && remoteProps.event) {
          remoteProps.event.fireEvent('afterInit', {
            billHeaderId,
            that: this,
            formDs: this.formDs,
            tableDs: this.tableDs,
          });
        }
        // 在可编辑流程表单里注册onFormLoaded方法
        if (onFormLoaded && otherEdit && res) onFormLoaded(true);
      }
    );
    if (action === 'SIGNATURE') {
      // 如果是签章页面初始化先关闭所有modal,避免点上面页签刷新出现签章列表侧弹框未关闭情况
      if (signatureModal) {
        signatureModal.close();
      }
    }
    // 工作流保存
    if (onLoad && otherEdit) {
      onLoad({
        submit: this.workFlowSubmit,
      });
    }
  };

  workFlowSubmit = (param) => {
    const { remote: remoteProps } = this.props;
    return new Promise(async (resolve, reject) => {
      if (param === 'Approved') {
        const sendData = await this.getSendData();
        if (sendData === false) {
          return reject();
        }
        const res = getResponse(await save(sendData, customizeUnit));
        return res ? resolve() : reject();
      } else {
        if (remoteProps && remoteProps.event) {
          const eventRes = await remoteProps.event.fireEvent('beforeEditWorkflowReject', {
            getSendData: this.getSendData,
            handleSaveHeader: (sendData) => save(sendData, customizeUnit),
          });
          if (eventRes === false) return reject();
        }
        return resolve();
      }
    });
  };

  setLoading = (flag) => {
    this.formDs.status = flag ? 'loading' : 'ready';
  };

  /**
   * 查询头行
   */
  handleFetch = async (flag) => {
    const { billHeaderId } = this.state;
    if (billHeaderId) {
      const remarks = this.formDs.current.get('remark');
      const { action, editFlag } = queryString.parse(this.props.location.search.slice(1));
      this.setLoading(true);
      const res = getResponse(
        await getDetail(billHeaderId, camp, action, editFlag, headUnitCodes.join())
      );
      this.setLoading(false);
      const newRes = remarks ? { ...res, remarks } : res;
      if (res) {
        const { currencyCode, companyId, supplierCompanyId } = res;
        const currencyCodeRes = getResponse(await fetchCurrencyCode(currencyCode));
        if (currencyCodeRes) {
          this.setState({
            amount: currencyCodeRes.amount,
            price: currencyCodeRes.price,
          });
        }
        this.tableDs.addField('currencyCode', {
          name: 'currencyCode',
          type: 'string',
          defaultValue: currencyCode,
        });
        this.tableDs.addField('companyId', {
          name: 'companyId',
          type: 'string',
          defaultValue: companyId,
        });
        this.tableDs.addField('supplierCompanyId', {
          name: 'supplierCompanyId',
          type: 'string',
          defaultValue: supplierCompanyId,
        });
        this.setState({
          originData: {
            headerData: newRes,
            lineDatas: [],
          },
        });
        if (flag === 1) {
          this.formDs.current.set({
            netAmount: res.netAmount,
            taxIncludedAmount: res.taxIncludedAmount,
            taxAmount: res.taxAmount,
            objectVersionNumber: res.objectVersionNumber,
            netAmountMeaning: res.netAmountMeaning,
            taxAmountMeaning: res.taxAmountMeaning,
            taxIncludedAmountMeaning: res.taxIncludedAmountMeaning,
            quantity: res.quantity,
            ...Object.fromEntries(
              (res.customizeRefreshFields || []).map((item) => [item, res[item]])
            ),
          });
        } else if (flag === 2) {
          this.formDs.current.set({
            netAmount: res.netAmount,
            taxIncludedAmount: res.taxIncludedAmount,
            taxAmount: res.taxAmount,
            objectVersionNumber: res.objectVersionNumber,
            settleConfigId: res.settleConfigId,
            settleConfigNum: res.settleConfigNum,
            settleConfigName: res.settleConfigName,
            configVersionNumber: res.configVersionNumber,
            confirmApproveMethod: res.confirmApproveMethod,
            cancelApproveMethod: res.cancelApproveMethod,
            confirmCollaborativeMode: res.confirmCollaborativeMode,
            cancelCollaborativeMode: res.cancelCollaborativeMode,
            autoIssue: res.autoIssue,
            supplierViewFlag: res.supplierViewFlag,
            netAmountMeaning: res.netAmountMeaning,
            taxAmountMeaning: res.taxAmountMeaning,
            taxIncludedAmountMeaning: res.taxIncludedAmountMeaning,
            quantity: res.quantity,
            ...Object.fromEntries(
              (res.customizeRefreshFields || []).map((item) => [item, res[item]])
            ),
          });
        } else {
          this.formDs.loadData([newRes]);
        }
        this.getInvoiceConfig();
      }
      return res;
    }
    return false;
  };

  /**
   * 响应行新增按钮
   */
  handleAdd = () => {
    const {
      originData: { headerData },
      permsMap,
    } = this.state;
    const { remote: remoteProps } = this.props;
    Modal.open({
      drawer: true,
      title: intl.get('ssta.reconciliationWorkbench.view.title.add').d('新增'),
      key: Modal.key(),
      className: Styles['ssta-large-modal'],
      children: (
        <AddModal
          viewLineDetail={this.viewLineDetail}
          afterAddLines={this.afterAddLines}
          headerInfo={headerData}
          permsMap={permsMap}
          remote={remoteProps}
          detailLineDs={this.tableDs}
        />
      ),
      footer: null,
    });
  };

  /**
   * 取消行数据方法
   */
  handleCancelLines = async () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
        .d('确认删除选中行？'),
      onOk: async () => {
        const data = this.tableDs.selected.map((item) => item.toData());
        if (data) {
          this.setLoading(true);
          const res = getResponse(await cancelLines(data, customizeUnit));
          this.setLoading(false);
          if (res) {
            notification.success();
            this.handleFetch(1);
            await this.tableDs.query(undefined, undefined, true);
            this.tableDs.clearCachedSelected();
          }
        }
      },
      onCancel: () => {},
    });
  };

  /**
   * 响应行导入按钮
   */
  handleRoleImport = () => {
    const { billHeaderId } = this.state;
    const { history } = this.props;
    history.push({
      pathname: '/ssta/new-reconciliation-workbench/data-import/SSTA.BILL_LINE_BATCH_UPDATE',
      search: queryString.stringify({
        action: intl.get('ssta.common.button.batchUpdate').d('批量编辑'),
        backPath: `/ssta/new-reconciliation-workbench/detail${location.search}`,
        historyButton: false,
        args: JSON.stringify({
          tenantId: organizationId,
          a: 1,
          b: 2,
          templateCode: 'SSTA.BILL_LINE_BATCH_UPDATE',
          billHeaderId,
        }),
      }),
    });
  };

  /**
   * 查看行详情
   * @param {Object} record 行记录
   */
  handleViewDetail = (record) => {
    const title = intl.get('hzero.common.button.viewDetail').d('查看详情');
    const closeModal = Modal.open({
      drawer: true,
      key: 'settlePool',
      destroyOnClose: true,
      closable: true,
      title,
      className: Styles['ssta-detailDrawer-modal'],
      children: <DetailDrawer record={record} isNew {...this.props} />,
      footer: (
        <Button color="primary" onClick={() => closeModal.close()}>
          {intl.get('hzero.common.button.close').d('关闭')}
        </Button>
      ),
    });
  };

  /**
   * 查看新增行详情
   * @param {Object} record 行记录
   * @returns Promise
   */
  viewLineDetail = (record) => {
    const { billHeaderId } = this.state;
    record.set('billHeaderId', billHeaderId);
    const title = intl.get('hzero.common.button.viewDetail').d('查看详情');
    return new Promise((resolve) => {
      const closeModal = Modal.open({
        drawer: true,
        key: Modal.key(),
        destroyOnClose: true,
        closable: true,
        style: {
          width: 1000,
        },
        className: Styles['ssta-detailDrawer-modal'],
        title,
        children: <DetailDrawer record={record} isNew type="F" {...this.props} />,
        footer: (
          <Button color="primary" onClick={() => closeModal.close()}>
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>
        ),
        onCancel: resolve,
        onOk: resolve,
      });
    });
  };

  /**
   * 新增行后查询
   * @param {Object} data 勾选行数据
   */
  afterAddLines = () => {
    this.handleFetch(2);
    this.tableDs.query(undefined, undefined, true);
  };

  /**
   * 响应弹窗
   * @param {Function} reqFun 请求函数
   * @param {Object} sendData 请求数据
   */
  handleFilledInfoOk = async (reqFun, sendData, action) => {
    const { remote: remoteProps } = this.props;
    const confirmValidateOk = async () => {
      const processSendData = remoteProps
        ? remoteProps.process('SSTA_RECONCILIATION_DETAIL_CUX.FILL_INFO_BEFORE', sendData, {
            action,
            lineDs: this.tableDs,
          })
        : sendData;
      this.setLoading(true);
      const res = getResponse(await reqFun([processSendData], customizeUnit));
      this.setLoading(false);
      if (!res) return false;
      this.afterSplitAction();
    };
    if (action === 'CONFIRM') {
      this.setLoading(true);
      const valiRes = getResponse(
        await confirmValidate({
          body: [sendData],
          role: 'purchaser',
          customizeUnit,
        })
      );
      this.setLoading(false);
      const { validatedCode, msg } = valiRes || {};
      if (validatedCode === 'WARNING') {
        Modal.confirm({
          children: msg,
          onOk: confirmValidateOk,
        });
        return false;
      } else if (validatedCode === 'ERROR') {
        notification.error({
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description: msg,
        });
        return false;
      } else if (valiRes) {
        return confirmValidateOk();
      }
    } else {
      return confirmValidateOk();
    }
  };

  /**
   * 响应操作按钮
   * @param {Function} reqFun 请求函数
   * @param {String} operation 按钮执行操作
   */
  handleOpr = (reqFun, operation) => {
    const { editFlag, action } = this.state;
    // 角色工作台和普通工作台的区别
    const { customizeForm, custConfig, modal } = this.props;
    // 确认、退回、取消操作打开弹窗
    if (['CONFIRM', 'RETURN', 'CANCEL'].includes(operation)) {
      Modal.open({
        drawer: true,
        key: Modal.key(),
        destroyOnClose: true,
        closable: true,
        className: Styles['ssta-small-modal'],
        title:
          action === 'APPROVE'
            ? intl.get('ssta.common.alert.confirms').d('审核信息')
            : action === 'CANCEL' && intl.get('ssta.common.alert.cancel').d('取消信息'),
        children: (
          <FilledInfoModal
            reqFun={reqFun}
            action={operation}
            editFlag={editFlag}
            headerDS={this.formDs}
            custConfig={custConfig}
            customizeForm={customizeForm}
            onOk={this.handleFilledInfoOk}
          />
        ),
      });
    } else if (['SIGNATURE'].includes(operation)) {
      signatureModal = Modal.open({
        drawer: true,
        key: Modal.key(),
        destroyOnClose: true,
        closable: true,
        mask: modal,
        className: modal ? {} : Styles['ssta-signature-modal'],
        style: {
          width: '220px',
        },
        title: intl.get('ssta.common.view.title.chapter').d('用章'),
        children: (
          <SignatureModal
            headerDS={this.formDs}
            customizeForm={customizeForm}
            onOk={this.afterSplitAction}
            actionCamp="PURCHASER"
          />
        ),
      });
    } else {
      // 同步、删除
      const routerParams = queryString.parse(this.props.location.search.substr(1)).action;
      if (routerParams === 'UPDATE') {
        const { billStatusMeaning, billNum } = this.formDs.current?.toData();
        const documentTypeMeaning = `${billStatusMeaning}${intl
          .get('ssta.costSheet.model.costSheet.reconciliation')
          .d('对账单')}`;
        const info = {
          action: 'CANCEL',
          bills: `${documentTypeMeaning}${billNum}`,
          billType: documentTypeMeaning,
        };
        confirmModal(info, this.handleCancelLoading, reqFun, operation);
      } else {
        return this.handleCancelLoading(reqFun, operation);
      }
    }
  };

  handleCancelLoading = async (reqFun, operation) => {
    const headerData = this.formDs.current.toData();
    let sendData =
      operation === 'SYNC'
        ? [headerData]
        : ['CANCELSIGNATURE', 'SIGNATUREREJECT'].includes(operation)
        ? { ...headerData, actionCamp: 'PURCHASER', documentType: 'BILL' }
        : headerData;
    if (operation === 'INVOICE') {
      sendData = {
        billHeader: headerData,
      };
    }
    this.setLoading(true);
    const res = getResponse(await reqFun(sendData, customizeUnit));
    this.setLoading(false);
    if (operation === 'INVOICE') {
      this.getInvoiceConfig();
      return;
    }
    if (res) {
      this.afterSplitAction(operation === 'DELETE');
    }
  };

  // 获取是否已开票
  getInvoiceConfig = async () => {
    const billNum = this.formDs.current?.get('billNum');
    if (!billNum) return;
    const res = getResponse(await getInvoiceConfig({ billNum }));
    if (res) {
      this.setState({
        showInvoiceBtn: res?.invoiceFlag !== 1,
      });
    }
  };

  /**
   * 获取请求数据
   * @param {Boolean} linesFlag 是否为行接口
   * @returns Object
   */
  getSendData = async (linesFlag) => {
    const headerValidateFlag = await this.formDs.current?.validate(true);
    const linesValidateFlag = await this.tableDs.validate();
    if (headerValidateFlag && linesValidateFlag) {
      const headerData = this.formDs.current.toData() ? this.formDs.current.toData() : {};
      const lineData = this.tableDs.toJSONData() ? this.tableDs.toJSONData() : [];
      const sendData = {
        ...headerData,
        billLineList: lineData,
      };
      return linesFlag ? [sendData] : sendData;
    } else {
      formatErrorInfo(
        this.formDs,
        this.tableDs,
        intl
          .get(`ssta.reconciliationWorkbench.view.message.panel.tradingInformation`)
          .d('对账明细信息')
      );
      return null;
    }
  };

  updateTabLink = (search, state) => {
    const { action } = this.state;
    if (action === 'SIGNATURE') {
      // 如果是签章返回签章modal打开的时候，关闭modal
      Modal.destroyAll();
    }
    updateTab({
      key: getActiveTabKey(),
      search,
      state,
    });
  };

  /**
   * 拆单后操作不跳回列表页
   */
  afterSplitAction = (needSplit) => {
    notification.success();
    const { billList, billHeaderId, action, editFlag } = this.state;
    const { history } = this.props;
    if (needSplit && isArray(billList) && billList.length > 1) {
      const filterList = billList.filter((item) => item.billHeaderId !== billHeaderId);
      this.updateTabLink(
        queryString.stringify({
          action,
          editFlag: Number(editFlag),
          billList: JSON.stringify(filterList),
        }),
        null
      );
      history.replace({
        pathname: '/ssta/new-reconciliation-workbench/detail',
        search: queryString.stringify({
          action,
          editFlag: Number(editFlag),
          billList: JSON.stringify(filterList),
        }),
      });
    } else {
      history.push({
        pathname: '/ssta/new-reconciliation-workbench/list',
        state: { _back: 1 },
      });
    }
  };

  handleSave = async () => {
    const { remote } = this.props;
    const sendData = await this.getSendData();
    if (sendData) {
      this.setLoading(true);
      const extraPromises = remote
        ? remote.process('SSTA_RECONCILIATION_DETAIL_CUX_SAVE_EXTRA_PROMISES', [], {
            sendData,
            customizeUnit,
            formDs: this.formDs,
            tableDs: this.tableDs,
          })
        : [];
      const [res] = await Promise.all([save(sendData, customizeUnit), ...extraPromises]);
      this.setLoading(false);
      if (getResponse(res)) {
        notification.success();
        this.handleFetch();
        const { refreshBillLine } = res || {};
        // refreshBillLine === '1'直接更新行数据，避免虽然前端没编辑过行但是后端更改了行数据未刷新的情况
        if (refreshBillLine === '1') {
          await this.tableDs.query();
          this.tableDs.clearCachedSelected();
          return;
        }
        if (!isEmpty(sendData.billLineList)) {
          this.setLoading(true);
          const refreshedLines = getResponse(
            await getBillLinesByIds({
              billLineIds: sendData.billLineList.map((item) => item.billLineId),
              customizeUnitCode:
                'SSTA.PURCHASER_BILL_DETAIL.TRANSACTION_DETAIL_SEARCH,SSTA.PURCHASER_BILL_DETAIL.TRANSACTION_DETAILS',
            })
          );
          this.setLoading(false);
          if (refreshedLines) {
            recordsCommit(refreshedLines, this.tableDs, 'billLineId');
            // 避免操作第二页数据后返回第一页再保存，然后再提交时导致该数据被提交，但是第二页的数据又无法更新版本号的情况
            this.tableDs.clearCachedRecords();
          }
        }
      }
    }
  };

  /**
   * 批量提交
   * @param {*} reqFun
   * @param {*} opr
   * @returns
   */
  handleSubmit = async () => {
    const { remote: remoteProps, history } = this.props;
    const { editFlag } = this.state;
    let sendData = await this.getSendData(true);
    if (sendData) {
      sendData = sendData.map((elem) => ({ ...elem, submitPoint: 'DETAIL' }));
    }
    // 不知道为什么这个埋点放在这个位置，暂时不动，新增一个埋点
    if (remoteProps) {
      // 校验埋点
      const beforeSubmitRes = await remoteProps.event.fireEvent('handleBeforeSubmitCux', {
        formDs: this.formDs,
        tableDs: this.tableDs,
        handleFetch: this.handleFetch,
        editFlag,
        sendData,
        history,
      });
      if (beforeSubmitRes === false) return false;
    }
    const validateOk = async () => {
      this.setLoading(true);
      if (remoteProps) {
        const beforeSubmitFinalRes = await remoteProps.event.fireEvent('beforeSubmitFinal', {
          sendData,
          customizeUnit,
          formDs: this.formDs,
          tableDs: this.tableDs,
        });
        if (beforeSubmitFinalRes === false) {
          this.setLoading(false);
          return false;
        }
      }
      const res = getResponse(await submit(sendData, customizeUnit));
      this.setLoading(false);
      if (res) {
        this.afterSplitAction(true);
      }
    };
    if (sendData) {
      this.setLoading(true);
      const valiRes = getResponse(
        await submitValidate({
          body: sendData,
          role: 'purchaser',
          customizeUnit,
        })
      );
      this.setLoading(false);
      const { validatedCode, msg } = valiRes || {};
      if (validatedCode === 'WARNING') {
        Modal.confirm({
          children: msg,
          onOk: validateOk,
        });
      } else if (validatedCode === 'ERROR') {
        notification.error({
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description: msg,
        });
      } else if (valiRes) {
        return validateOk();
      }
    }
  };

  // 电子签章sass整合
  // 签章
  handleCommonSignature = async () => {
    const { billHeaderId, companyId } = this.formDs.current?.get(['billHeaderId', 'companyId']);
    this.setLoading(true);
    const res = getResponse(
      await commonSignature({
        actionCamp: 'PURCHASER',
        billHeaderId,
        companyId,
        documentType: 'BILL',
      })
    );
    this.setLoading(false);
    if (!res) return;
    // 如果存在sealLink，直接打开,不存在是静默签，异步返回列表
    if (res?.sealLink) {
      window.open(res?.sealLink);
    } else {
      this.afterSplitAction();
    }
  };

  // 取消签章
  handleCommonCancelSignature = () => {
    const billNum = this.formDs.current?.get('billNum');
    const info = {
      action: 'CANCELSIGNATURE',
      bills: billNum,
    };
    confirmModal(info, this.handleCancelLoading, commonCancelSignature, 'CANCELSIGNATURE');
  };

  // 解约
  handleTerminateSignature = () => {
    const billNum = this.formDs.current?.get('billNum');
    const info = {
      action: 'TERMINATE',
      bills: billNum,
    };
    confirmModal(info, this.handleGetTerminateLink, commonTerminateSignature, 'TERMINATE');
  };

  // 获取解约链接
  handleGetTerminateLink = async () => {
    const { billHeaderId, companyId, taskId, billNum } = this.formDs.current?.get([
      'billHeaderId',
      'companyId',
      'taskId',
      'billNum',
    ]);
    this.setLoading(true);
    const res = await commonTerminateSignature({
      actionCamp: 'PURCHASER',
      billHeaderId,
      companyId,
      documentType: 'BILL',
      taskId,
      billNum,
    });
    let result = null;
    try {
      result = JSON.parse(res);
    } catch (e) {
      result = res;
    }
    this.setLoading(false);
    if (!getResponse(result)) return;
    window.open(result);
  };

  // 下载解约文件
  handleCommonDownloadTerminate = async () => {
    const { billHeaderId, companyId, taskId, billNum } = this.formDs.current?.get([
      'billHeaderId',
      'companyId',
      'taskId',
      'billNum',
    ]);
    this.setLoading(true);
    const res = getResponse(
      await downloadTerminate({
        actionCamp: 'PURCHASER',
        billHeaderId,
        companyId,
        documentType: 'BILL',
        taskId,
        billNum,
      })
    );
    this.setLoading(false);
    if (!res) return;
    const { fileUrl } = res[0] || {};
    if (fileUrl) getAttachmentUrlWithToken(fileUrl, true);
  };

  // 下载签章
  handleCommonDownloadSignature = async () => {
    const { billHeaderId } = this.formDs.current?.get(['billHeaderId']);
    this.setLoading(true);
    const res = getResponse(await commonDownloadSignature({ billHeaderId, documentType: 'BILL' }));
    this.setLoading(false);
    if (!res) return;
    const { fileUrl } = res[0] || {};
    if (fileUrl) getAttachmentUrlWithToken(fileUrl, true);
  };

  // 获取签章链接
  handleGetSignatureLink = async () => {
    const { billHeaderId, companyId } = this.formDs.current?.get(['billHeaderId', 'companyId']);
    this.setLoading(true);
    const res = getResponse(
      await getSignatureLInk({ actionCamp: 'PURCHASER', billHeaderId, companyId, authType: 'FDD' })
    );
    this.setLoading(false);
    if (!res) return;
    window.open(res?.sealLink);
  };

  // 撤回签章
  handleSignatureBack = async () => {
    const { billHeaderId } = this.formDs.current?.get(['billHeaderId']);
    this.setLoading(true);
    const res = getResponse(await signatureBack({ billHeaderId }));
    this.setLoading(false);
    if (!res) return;
    this.afterSplitAction();
  };

  // 下载技术报告
  handleDownloadSignatureTec = async () => {
    const { billHeaderId } = this.formDs.current?.get(['billHeaderId']);
    this.setLoading(true);
    const res = getResponse(await downloadSignatureTec({ billHeaderId }));
    this.setLoading(false);
    if (!res) return;
    const { fileUrl } = res[0] || {};
    if (fileUrl) getAttachmentUrlWithToken(fileUrl);
  };

  // 下载公证报告
  handleDownloadSignatureNotary = async () => {
    const { billHeaderId } = this.formDs.current?.get(['billHeaderId']);
    this.setLoading(true);
    const res = getResponse(await downloadSignatureNotary({ billHeaderId }));
    this.setLoading(false);
    if (!res) return;
    const { fileUrl } = res[0] || {};
    if (fileUrl) getAttachmentUrlWithToken(fileUrl);
  };

  /**
   * 响应拆单切换tab页
   * @param {String} activeKey 切换到tab页的key
   */
  onTabChange = (activeKey) => {
    this.setState(
      {
        billHeaderId: activeKey,
      },
      () => {
        this.handleFetch();
        this.tableDs.setQueryParameter('billHeaderId', activeKey);
        this.tableDs.query();
      }
    );
  };

  /**
   * 行金额编辑组件渲染
   * @param {Object} record 行记录
   * @param {String} name 字段名称
   * @returns
   */
  editorRender = (record, name) => {
    const { action, otherEdit } = this.state;
    const { remote: remoteProps } = this.props;
    // 基于标准场景的行字段可编辑
    const forceUpdateFlag = remoteProps
      ? remoteProps.process('SSTA_RECONCILIATION_DETAIL_CUX_LINE_ACTION_UPDATE_FLAG', false, {
          name,
          record,
          action,
          otherEditPub: otherEdit,
        })
      : false;
    // 添加金额隐藏逻辑
    if (
      billLineConfig[name].preEditor(record, forceUpdateFlag ? 'UPDATE' : action) &&
      record.get('priceShiledFlag') !== 1
    ) {
      return <NumberField onChange={(value) => this.onUpdateLine(value, record, name)} />;
    }
  };

  // 数量修改 ：️基准金额️ => 税额️ => 对方金额️ => 对方单价
  // 基准单价修改：️基准金额️ => 税额️ => 对方金额️ => 对方单价
  // 金额修改：基准金额修改 => 税额️ => 对方金额
  // priceCalPrecisionFlag 读取的配置表数据，如果有配置使用原计算方式
  onUpdateLine = (value, record, name) => {
    const { amount, price, priceCalPrecisionFlag } = this.state;
    const netPrice = record.get('netPrice');
    const taxIncludedPrice = record.get('taxIncludedPrice');
    const netAmount = record.get('netAmount');
    const taxIncludedAmount = record.get('taxIncludedAmount');
    const quantity = record.get('quantity');
    const unitPriceBatch = record.get('unitPriceBatch');
    const taxRate = math.div(record.get('taxRate'), 100);
    const netFlag = record.get('settleBasePrice') === 'NET_PRICE';
    const taxRateType = record.get('taxRateType');
    const inPriceTaxFlag = taxRateType === 'IN_PRICE_TAX';
    if (name === 'netPrice' || (name === 'quantity' && netFlag)) {
      const newNetPrice = name === 'netPrice' ? math.toFixed(value, price) : netPrice;
      const newQuantity = name === 'quantity' ? value : quantity;
      const newNetAmount = math.toFixed(
        math.div(math.multipliedBy(newNetPrice, newQuantity), unitPriceBatch),
        amount
      );
      const newTaxAmount = inPriceTaxFlag
        ? math.toFixed(
            math.div(math.multipliedBy(newNetAmount, taxRate), math.minus(1, taxRate)),
            amount
          )
        : math.toFixed(math.multipliedBy(newNetAmount, taxRate), amount);
      const newTaxIncludedAmount = math.toFixed(math.plus(newNetAmount, newTaxAmount), amount);
      const newTaxIncludedPrice = priceCalPrecisionFlag
        ? math.toFixed(
            math.multipliedBy(math.div(newTaxIncludedAmount, newQuantity), unitPriceBatch),
            price
          )
        : getIncTaxAmountByNetPrice(
            newNetPrice,
            newQuantity,
            record.get('taxRate'),
            price,
            unitPriceBatch,
            inPriceTaxFlag
          );
      record.set('netPrice', newNetPrice);
      record.set('quantity', newQuantity);
      record.set('netAmount', newNetAmount);
      record.set('taxAmount', newTaxAmount);
      record.set('taxIncludedAmount', newTaxIncludedAmount);
      record.set('taxIncludedPrice', newTaxIncludedPrice);
    } else if (name === 'taxIncludedPrice' || (name === 'quantity' && !netFlag)) {
      const newTaxIncludedPrice =
        name === 'taxIncludedPrice' ? math.toFixed(value, price) : taxIncludedPrice;
      const newQuantity = name === 'quantity' ? value : quantity;
      const newTaxIncludedAmount = math.toFixed(
        math.div(math.multipliedBy(newTaxIncludedPrice, newQuantity), unitPriceBatch),
        amount
      );
      const newTaxIncludedAmountDivRate = math.div(newTaxIncludedAmount, math.plus(1, taxRate));
      const newTaxAmount = inPriceTaxFlag
        ? math.toFixed(math.multipliedBy(newTaxIncludedAmount, taxRate), amount)
        : math.toFixed(math.multipliedBy(newTaxIncludedAmountDivRate, taxRate), amount);
      const newNetAmount = math.toFixed(math.minus(newTaxIncludedAmount, newTaxAmount), amount);
      const newNetPrice = priceCalPrecisionFlag
        ? math.toFixed(
            math.multipliedBy(math.div(newNetAmount, newQuantity), unitPriceBatch),
            price
          )
        : getNetPriceByTaxIncPrice(
            newTaxIncludedPrice,
            newQuantity,
            record.get('taxRate'),
            price,
            unitPriceBatch,
            inPriceTaxFlag
          );
      record.set('taxIncludedPrice', newTaxIncludedPrice);
      record.set('quantity', newQuantity);
      record.set('netAmount', newNetAmount);
      record.set('taxAmount', newTaxAmount);
      record.set('taxIncludedAmount', newTaxIncludedAmount);
      record.set('netPrice', newNetPrice);
    } else if (name === 'netAmount') {
      const newNetAmount = math.toFixed(value, amount);
      const taxIncludedAmountDivRate = math.div(taxIncludedAmount, math.plus(1, taxRate));
      const newTaxAmount = netFlag
        ? inPriceTaxFlag
          ? math.toFixed(
              math.div(math.multipliedBy(newNetAmount, taxRate), math.minus(1, taxRate)),
              amount
            )
          : math.toFixed(math.multipliedBy(newNetAmount, taxRate), amount)
        : math.toFixed(math.multipliedBy(taxIncludedAmountDivRate, taxRate), amount);
      const newTaxIncludedAmount = math.toFixed(math.plus(newNetAmount, newTaxAmount), amount);
      record.set('netAmount', newNetAmount);
      record.set('taxAmount', newTaxAmount);
      record.set('taxIncludedAmount', newTaxIncludedAmount);
    } else if (name === 'taxIncludedAmount') {
      const newTaxIncludedAmount = math.toFixed(value, amount);
      const newTaxIncludedAmountDivRate = math.div(newTaxIncludedAmount, math.plus(1, taxRate));
      const newTaxAmount = netFlag
        ? math.toFixed(math.multipliedBy(netAmount, taxRate), amount)
        : inPriceTaxFlag
        ? math.toFixed(math.multipliedBy(newTaxIncludedAmount, taxRate), amount)
        : math.toFixed(math.multipliedBy(newTaxIncludedAmountDivRate, taxRate), amount);
      const newNetAmount = math.toFixed(math.minus(newTaxIncludedAmount, newTaxAmount), amount);
      record.set('taxIncludedAmount', newTaxIncludedAmount);
      record.set('netAmount', newNetAmount);
      record.set('taxAmount', newTaxAmount);
    }
  };

  /**
   * 响应打印按钮
   */
  handlePrint = async () => {
    const flag = checkPrintWindow();
    const { billHeaderId } = this.state;
    this.setLoading(true);
    const res = await print({
      billHeaderId,
      responseType: flag ? 'blob' : 'json',
      headers: flag ? {} : { 's-print-using-preview': '1' },
    });
    this.setLoading(false);
    if (!res) return;
    if (flag) {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result;
        try {
          const failedInfo = JSON.parse(content);
          notification.error({
            description: failedInfo.message,
          });
        } catch (e) {
          const file = new Blob([res], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          window.open(fileURL);
        }
      };
      reader.readAsText(res);
    } else {
      // 添加如下代码
      const { fileUrl, bucketName, fileToken } = res || {};
      const url = await getPdfPreviewUrl({ fileUrl, bucketName, fileToken });
      window.open(url);
    }
  };

  /**
   * 操作记录、审批记录
   * @param {*} record
   * @param {*} chargeHeaderId
   */
  openOprationModal = (record, billHeaderId) => {
    Modal.open({
      title: intl.get('hzero.common.button.operating').d('操作记录'),
      drawer: true,
      destroyOnClose: true,
      className: Styles['ssta-medium-modal'],
      children: (
        <ReconciliationWorkbenchRecord isFilter record={record} billHeaderId={billHeaderId} />
      ),
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  /**
   * 字段隐藏渲染
   * @param {Object} param0 record 行记录 value 字段值 name 字段名称
   * @returns Any
   */
  priceShiledRender = ({ record, name, text }) =>
    record.get('priceShiledFlag') === 1 ? record.get(`${name}Meaning`) : text;

  /**
   * 字段高亮显示 & 隐藏渲染
   * @param {Object} param0 record 行记录 value 字段值 name 字段名称
   * @returns Any
   */
  priceShiledRenderAndHighLight = ({ record, text, name }) => {
    // 判断应用页面
    const { action } = this.state;
    const { remote: remoteProps } = this.props;
    const {
      originData: { headerData },
    } = this.state;
    const { billStatus } = headerData;
    const priceShiledFlag = record.get('priceShiledFlag');
    if (Number(priceShiledFlag) === 1) return '****';
    const fieldName =
      record.get('settleBasePrice') === 'NET_PRICE' ? 'netPrice' : 'taxIncludedPrice';

    if (
      (action === undefined || action === 'APPROVE' || action === 'CANCEL' || action === 'SYNC') &&
      billStatus !== 'NEW' &&
      billStatus !== 'RETURN' &&
      name === fieldName &&
      record.get('priceLightFlag') === 1
    ) {
      return (
        <Popover
          content={`${intl.get('ssta.common.view.message.beforeUpdate').d('更改前')}:${formatNumber(
            record.get('orignPriceMeaning')
          )}`}
        >
          <span style={{ color: 'red' }}>
            {record.get('priceShiledFlag') === 1 ? record.get(`${name}Meaning`) : text}
          </span>
        </Popover>
      );
    } else {
      const showText = record.get('priceShiledFlag') === 1 ? record.get(`${name}Meaning`) : text;
      return remoteProps
        ? remoteProps.process('SSTA_RECONCILIATION_DETAIL_CUX_LINE_PRICE_RENDER', showText, {
            record,
            text,
            name,
            action,
          })
        : showText;
    }
  };

  /**
   * 标题条件渲染
   * @returns String
   */
  titleRender = () => {
    const {
      action,
      notPub,
      originData: { headerData },
    } = this.state;
    if (!notPub) return null;
    return this.formatHeaderTitle(action, headerData);
  };

  // 格式化类型为approve和all的header标题
  formatHeaderTitle = (type, headerData) => {
    const { billStatus, billNum, supplierViewFlag, confirmCollaborativeMode } = headerData;
    const { source } = queryString.parse(this.props.location.search.substring(1));
    const title =
      type === 'APPROVE'
        ? intl.get('ssta.reconciliationWorkbench.view.title.billDetailApprove').d('对账单审核')
        : type === 'UPDATE'
        ? source === 'create'
          ? intl.get('ssta.reconciliationWorkbench.view.title.createUpdate').d('新建对账单')
          : intl.get('ssta.reconciliationWorkbench.view.title.billDetailUpdate').d('对账单维护')
        : type === 'SYNC'
        ? intl.get('ssta.reconciliationWorkbench.view.title.billDetailSync').d('对账单同步')
        : type === 'CANCEL'
        ? intl.get('ssta.reconciliationWorkbench.view.title.billDetailCancel').d('对账单取消')
        : type === 'SIGNATURE'
        ? intl.get('ssta.common.model.common.billSign').d('对账单签章')
        : intl.get('ssta.reconciliationWorkbench.view.title.billDetailView').d('对账单查看');

    const singleCheck = ['SINGLE'].includes(confirmCollaborativeMode)
      ? !['SUBMITED', 'RETURN'].includes(billStatus)
      : true;
    const check =
      supplierViewFlag &&
      !['NEW', 'SUBMITED_APPROVING', 'ES_SUBMITED_APPROVING', 'SYSTEM_SUBMITING'].includes(
        billStatus
      ) &&
      singleCheck;
    const { docLinkFlag } = this.state;
    if (check && !docLinkFlag) {
      return (
        <div className={Styles['im-chat-draggable']}>
          <IMChatDraggable
            cardCode="SSTA_RECONCILIATION_ATTENTION"
            icon="baseline-drag_indicator"
            tooltip=""
            requestBody={{
              ...headerData,
            }}
            dragText={`${intl
              .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.billNum')
              .d('对账单编号')}${billNum}`}
          >
            {title}
          </IMChatDraggable>
        </div>
      );
    } else {
      return title;
    }
  };

  getEditField = (firstSelectedRecord) => {
    const column = this.listColumnsRender();
    if (!firstSelectedRecord) return [];
    const editorColumnNameList = column.reduce((total, col) => {
      if (!col) return total;
      const { name, editor } = col;
      if (editor === true || isValidElement(editor)) {
        return [...total, name];
      } else if (isFunction(editor)) {
        const funcEditor = editor(firstSelectedRecord, name);
        if (funcEditor === true || isValidElement(funcEditor)) {
          return [...total, name];
        }
      }
      return total;
    }, []);
    const editFieldNameList = editorColumnNameList.reduce((total, name) => {
      const field = this.tableDs.getField(name, firstSelectedRecord);
      return field.get('disabled') ? total : [...total, name];
    }, []);
    return editFieldNameList;
  };

  // 点击了批量编辑
  handleBatchModify = () => {
    let editFieldNameList = [];
    const { customizeForm } = this.props;
    const { selected } = this.tableDs;
    const firstRecord = selected.length ? selected[0] : this.tableDs.get(0);
    editFieldNameList = this.getEditField(firstRecord);
    Modal.open({
      drawer: true,
      title: intl.get('ssta.common.button.batchModify').d('批量修改'),
      key: Modal.key(),
      style: { width: 400 },
      children: (
        <BatchModifyModal
          customizeForm={customizeForm}
          editFieldNameList={editFieldNameList}
          tableDs={this.tableDs}
          closeCallback={this.closeCallback}
          formDs={this.formDs}
        />
      ),
    });
  };

  closeCallback = async () => {
    this.handleFetch(1);
    await this.tableDs.query();
    this.tableDs.clearCachedSelected();
  };

  /**
   * 行columns渲染
   */
  listColumnsRender = () => {
    const { docLinkFlag } = this.state;
    return [
      {
        name: 'lineNum',
        width: 100,
      },
      {
        name: 'settleNum',
        width: 170,
      },
      {
        name: 'sourceSettleNumAndLineNum',
        width: 180,
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'quantity',
        width: 120,
        editor: this.editorRender,
      },
      {
        name: 'netPrice',
        width: 180,
        editor: this.editorRender,
        renderer: this.priceShiledRenderAndHighLight,
      },

      {
        name: 'unitPriceBatch',
        width: 120,
      },
      {
        name: 'netAmount',
        width: 180,
        editor: this.editorRender,
        renderer: this.priceShiledRender,
      },
      {
        name: 'taxRate',
        width: 120,
      },
      {
        name: 'taxAmount',
        width: 180,
        align: 'right',
        renderer: this.priceShiledRender,
      },
      {
        name: 'taxIncludedPrice',
        width: 180,
        editor: this.editorRender,
        renderer: this.priceShiledRenderAndHighLight,
      },
      {
        name: 'taxIncludedAmount',
        width: 270,
        editor: this.editorRender,
        renderer: this.priceShiledRender,
        sortable: true,
      },
      {
        name: 'settleMatchDimensionMeaning',
        width: 180,
      },
      {
        name: 'settleBasePriceMeaning',
        width: 180,
      },
      {
        name: 'enableQuantity',
        width: 120,
      },
      {
        name: 'orignPriceMeaning',
        width: 180,
        align: 'right',
        renderer: numberShiledRender,
      },
      {
        name: 'enableAmountMeaning',
        header: ({ title }) => (
          <Tooltip
            title={intl
              .get('ssta.common.view.message.enableAmountMeaning')
              .d('根据基准价判断含税/不含税')}
          >
            {title}
          </Tooltip>
        ),
        width: 180,
        align: 'right',
        renderer: numberShiledRender,
      },
      {
        width: 100,
        name: 'priceSourceMeaning',
      },
      {
        width: 100,
        name: 'sourceUnitPriceBatch',
      },
      {
        width: 100,
        name: 'libPrice',
      },
      {
        width: 100,
        name: 'priceActionMeaning',
      },
      {
        width: 100,
        name: 'priceTime',
      },
      {
        width: 100,
        name: 'sourceNetPrice',
      },
      {
        width: 100,
        name: 'sourceTaxIncludedPrice',
      },
      {
        width: 100,
        name: 'libUnitPriceBatch',
      },
      {
        width: 200,
        name: 'multiDealTrxNum',
      },
      {
        width: 200,
        name: 'multiDealTrxLineNum',
      },
      {
        width: 200,
        name: 'multiDealPoNum',
      },
      {
        width: 200,
        name: 'multiDealPoLineNum',
      },
      {
        name: 'operation',
        width: 120,
        // lock: 'right',
        renderer: ({ record }) => (
          <a onClick={() => this.handleViewDetail(record)}>
            {intl.get(`ssta.reconciliationWorkbench.view.message.panel.viewDetail`).d('查看详情')}
          </a>
        ),
      },
      !docLinkFlag && {
        title: intl.get('hzero.common.button.docFlow').d('单据流'),
        name: 'docFlow',
        width: 100,
        renderer: ({ record }) => (
          <DocFlow tableName="ssta_bill_line" tablePk={record.get('billLineId')} />
        ),
      },
    ];
  };

  /**
   * 行buttons渲染
   * @returns Element
   */
  getTableButtons = () => {
    const { action, billHeaderId, permsMap, notPub, otherEdit } = this.state;
    const { remote: remoteProps } = this.props;
    const billStatus = this.formDs.current?.get('billStatus');
    let buttons = [];
    if (action === 'UPDATE') {
      buttons = [
        permsMap.get(`${buttonPermPrefix}.line-add`) && (
          <Button
            icon="playlist_add"
            onClick={this.handleAdd}
            key="add"
            funcType="flat"
            color="primary"
            name="add"
          >
            {intl.get('hzero.common.button.add').d('新增')}
          </Button>
        ),
        (permsMap.get(`${permPrefix}.rowimport`) || !notPub) && (
          <Button
            name="batchUpdate"
            onClick={this.handleRoleImport}
            funcType="flat"
            color="primary"
            icon="archive"
          >
            {intl.get('ssta.common.button.batchUpdate').d('批量编辑')}
          </Button>
        ),
        (permsMap.get(`${permPrefix}.rowexport`) || !notPub) && (
          <ExcelExport
            name="lineExport"
            buttonText={
              !isEmpty(this.tableDs.selected)
                ? intl.get('ssta.common.button.LineTickExport').d('行勾选导出')
                : intl.get('ssta.common.button.LineExport').d('行导出')
            }
            otherButtonProps={{
              type: 'c7n-pro',
              funcType: 'flat',
              color: 'primary',
              icon: 'unarchive',
            }}
            requestUrl={this.requestUrl()}
            queryParams={this.getExportParams}
            method="POST"
          />
        ),

        (notPub
          ? permsMap.get(`${permPrefix}.newrowimport`)
          : permsMap.get(`${buttonPermPrefix}.workflow_newrowimport`)) && (
          <Import
            name="newBatchUpdate"
            buttonText={intl.get('ssta.common.button.newBatchUpdate').d('(新)批量编辑')}
            businessObjectTemplateCode="SSTA.BILL_LINE_BATCH_UPDATE"
            buttonProps={{
              funcType: 'flat',
              color: 'primary',
              icon: 'archive',
            }}
            prefixPatch="/ssta"
            args={{
              tenantId: organizationId,
              a: 1,
              b: 2,
              templateCode: 'SSTA.BILL_LINE_BATCH_UPDATE',
              billHeaderId,
            }}
            successCallBack={() => {
              this.handleFetch(1);
              this.tableDs.query();
            }}
          />
        ),
        (permsMap.get(`${permPrefix}.newrowexport`) || !notPub) && (
          <ExcelExportPro
            name="newLineExport"
            buttonText={
              !isEmpty(this.tableDs.selected)
                ? intl.get('ssta.common.button.newLineTickExport').d('(新)行勾选导出')
                : intl.get('ssta.common.button.newLineExport').d('(新)行导出')
            }
            templateCode="SSTA_BILL_DETAIL_PURCHASER_EXPORT"
            otherButtonProps={{
              type: 'c7n-pro',
              funcType: 'flat',
              color: 'primary',
              icon: 'unarchive',
            }}
            requestUrl={this.requestNewUrl()}
            queryParams={this.getExportParams}
            method="POST"
            allBody
          />
        ),
        permsMap.get(`${buttonPermPrefix}.line-delete`) && (
          <Button
            name="delete"
            icon="delete_sweep"
            key="delete"
            onClick={this.handleCancelLines}
            disabled={isEmpty(this.tableDs.selected)}
            funcType="flat"
            color="primary"
          >
            {intl.get(`hzero.common.button.batchdelete`).d('批量删除')}
          </Button>
        ),
        permsMap.get(`${buttonPermPrefix}.lineBatchModify`) &&
          ['NEW', 'RETURN'].includes(billStatus) && (
            <Button
              name="batchEdit"
              icon="mode_edit"
              onClick={this.handleBatchModify}
              disabled={!this.tableDs.length}
            >
              {isEmpty(this.tableDs.selected)
                ? intl.get('ssta.common.button.batchModify').d('批量修改')
                : intl.get('ssta.common.button.selectedBatchModify').d('勾选批量修改')}
            </Button>
          ),
      ];
    } else {
      buttons = [
        !notPub && permsMap.get(`${buttonPermPrefix}.workflow_newrowimport`) && (
          <Import
            name="newBatchUpdate"
            buttonText={intl.get('ssta.common.button.newBatchUpdate').d('(新)批量编辑')}
            businessObjectTemplateCode="SSTA.BILL_LINE_BATCH_UPDATE"
            buttonProps={{
              funcType: 'flat',
              color: 'primary',
              icon: 'archive',
            }}
            prefixPatch="/ssta"
            args={{
              tenantId: organizationId,
              a: 1,
              b: 2,
              templateCode: 'SSTA.BILL_LINE_BATCH_UPDATE',
              billHeaderId,
            }}
            successCallBack={() => {
              this.handleFetch(1);
              this.tableDs.query(undefined, undefined, true);
            }}
          />
        ),
        (permsMap.get(`${permPrefix}.rowexport`) || !notPub) && (
          <ExcelExport
            name="lineExport"
            buttonText={
              !isEmpty(this.tableDs.selected)
                ? intl.get('ssta.common.button.LineTickExport').d('行勾选导出')
                : intl.get('ssta.common.button.LineExport').d('行导出')
            }
            otherButtonProps={{
              type: 'c7n-pro',
              funcType: 'flat',
              color: 'primary',
              icon: 'unarchive',
            }}
            requestUrl={this.requestUrl()}
            queryParams={this.getExportParams}
            method="POST"
          />
        ),
        (permsMap.get(`${permPrefix}.newrowexport`) || !notPub) && (
          <ExcelExportPro
            name="newLineExport"
            buttonText={
              !isEmpty(this.tableDs.selected)
                ? intl.get('ssta.common.button.newLineTickExport').d('(新)行勾选导出')
                : intl.get('ssta.common.button.newLineExport').d('(新)行导出')
            }
            templateCode="SSTA_BILL_DETAIL_PURCHASER_EXPORT"
            otherButtonProps={{
              type: 'c7n-pro',
              funcType: 'flat',
              color: 'primary',
              icon: 'unarchive',
            }}
            requestUrl={this.requestNewUrl()}
            queryParams={this.getExportParams}
            method="POST"
            allBody
          />
        ),
      ];
    }
    return remoteProps
      ? remoteProps.process('SSTA_RECONCILIATION_DETAIL_CUX_LINE_BTNS', buttons, {
          action,
          permsMap,
          formDs: this.formDs,
          tableDs: this.tableDs,
          handleFetch: this.handleFetch,
          init: this.init,
          otherEditPub: otherEdit,
          handleBatchModify: this.handleBatchModify,
        })
      : buttons;
  };

  /**
   * 行导出接口
   * @returns String
   */
  requestUrl = () => {
    const { billHeaderId } = this.state;
    const customizeUnitCode =
      'SSTA.PURCHASER_BILL_DETAIL.TRANSACTION_DETAILS,SSTA.PURCHASER_BILL_DETAIL.TRANSACTION_DETAIL_SEARCH';
    return `/ssta/v1/${organizationId}/bill-lines/export/${billHeaderId}?customizeUnitCode=${customizeUnitCode}`;
  };

  /**
   * 行导出接口
   * @returns String
   */
  requestNewUrl = () => {
    const { billHeaderId } = this.state;
    const customizeUnitCode =
      'SSTA.PURCHASER_BILL_DETAIL.TRANSACTION_DETAILS,SSTA.PURCHASER_BILL_DETAIL.TRANSACTION_DETAIL_SEARCH';
    return `/ssta/v1/${organizationId}/bill-lines/export/new/${billHeaderId}?customizeUnitCode=${customizeUnitCode}`;
  };

  /**
   * 行导出参数
   * @returns Object
   */
  getExportParams = () => {
    const billLineIds = this.tableDs.selected.map((item) => item.get('billLineId'));
    const queryData = this.tableDs.queryDataSet.current?.toData() || {};
    if (this.tableDs.selected?.length > 0) {
      return filterNullValueObject({ billLineIds });
    } else {
      return filterNullValueObject({ ...queryData });
    }
  };

  linkListRender = () => {
    const { billHeaderId } = this.state;
    return [
      {
        key: 'base',
        href: `purchase-bill-base-${billHeaderId}`,
        title: intl.get(`ssta.reconciliationWorkbench.view.message.panel.baseInfos`).d('基本信息'),
      },
      {
        key: 'transaction',
        href: `purchase-bill-transaction-${billHeaderId}`,
        title: intl
          .get(`ssta.reconciliationWorkbench.view.message.panel.tradingInformation`)
          .d('对账明细信息'),
      },
      {
        key: 'others',
        href: `purchase-bill-others-${billHeaderId}`,
        title: intl.get(`ssta.reconciliationWorkbench.view.message.panel.othersInf`).d('其他信息'),
      },
      {
        key: 'attachment',
        href: `purchase-bill-attachment-${billHeaderId}`,
        title: intl.get(`ssta.reconciliationWorkbench.view.message.panel.attachment`).d('附件'),
      },
    ];
  };

  detailTabPaneRender = (billHeaderId) => {
    const {
      editFlag,
      originData: {
        headerData: { billStatus, autoIssue },
      },
      action,
      pinFixed,
      notPub,
      otherEdit,
      docLinkFlag,
      statusData,
      isNewPub,
    } = this.state;
    const loading = this.formDs.status !== 'ready';
    const { customizeForm, customizeTable, customizeCollapse, remote: remoteProps } = this.props;
    const {
      billNum = '',
      currencyCode = '',
      taxAmountMeaning = '',
      taxIncludedAmountMeaning = '',
      netAmountMeaning = '',
      amountPrecision = '',
      showUxFlag,
      billQuantitySumFlag,
      quantity,
    } = this.formDs.current?.toData();
    const normalSummaryProps = {
      title: intl.get(`ssta.costSheet.model.costSheet.reconciliation`).d('对账单'),
      num: billNum,
      currencyCode,
      taxAmount: formatNumber(taxAmountMeaning, amountPrecision),
      taxIncludedAmount: formatNumber(taxIncludedAmountMeaning, amountPrecision),
      netAmount: formatNumber(netAmountMeaning, amountPrecision),
      desc: intl.get(`ssta.costSheet.view.message.reconciliation`).d('对账'),
      changeFixed: () => {
        this.setState({ pinFixed: !pinFixed });
      },
      totalText: intl.get(`ssta.common.view.message.summaryOfReconciliation`).d('对账金额汇总'),
      pinFixed,
      notPub: notPub && !docLinkFlag,
      showCardFlag: showUxFlag,
      billQuantitySumFlag,
      quantity,
    };
    const summaryProps = remoteProps
      ? remoteProps.process('SSTA_RECONCILIATION_DETAIL_CUX_SUMMARY_PROPS', normalSummaryProps, {
          headerDs: this.formDs,
        })
      : normalSummaryProps;
    const normalLineCuszReadOnly = action !== 'UPDATE';
    const basicInfoCuszFormProps = remoteProps
      ? remoteProps.process(
          'SSTA_RECONCILIATION_DETAIL_CUX_BASIC_CUSZ_FORM_PROPS',
          {},
          {
            editFlag,
            otherEdit,
          }
        )
      : {};
    const processLineCuszReadOnly = remoteProps
      ? remoteProps.process(
          'SSTA_RECONCILIATION_DETAIL_CUX_LINE_CUSZ_READONLY',
          normalLineCuszReadOnly,
          {
            editFlag,
            otherEdit,
          }
        )
      : normalLineCuszReadOnly;
    return (
      <Spin spinning={loading}>
        {!isNewPub && <Summary summaryProps={summaryProps} />}
        <div className="ssta-detail-collapse-content">
          {customizeCollapse(
            {
              code: 'SSTA.PURCHASER_BILL_DETAIL.COLLAPSE',
            },
            <Collapse
              ghost
              trigger="icon"
              expandIconPosition="text-right"
              defaultActiveKey={this.defaultActiveKey}
            >
              {!isNewPub && (
                <Panel
                  forceRender
                  key="base"
                  dataSet={this.formDs}
                  id={`purchase-bill-base-${billHeaderId}`}
                  header={intl
                    .get(`ssta.reconciliationWorkbench.view.message.panel.baseInfos`)
                    .d('基本信息')}
                >
                  {customizeForm(
                    {
                      code: 'SSTA.PURCHASER_BILL_DETAIL.BASIC_INFO',
                      readOnly: !editFlag,
                      __force_record_to_update__: true,
                      ...basicInfoCuszFormProps,
                    },
                    <Form
                      columns={3}
                      useColon={false}
                      dataSet={this.formDs}
                      labelLayout={action === 'UPDATE' ? 'float' : 'vertical'}
                      useWidthPercent
                    >
                      <FormItem name="billNum" disabled={action === 'UPDATE'} />
                      <FormItem
                        name="billStatus"
                        editor="select"
                        disabled={action === 'UPDATE'}
                        renderer={({ value, record }) =>
                          action === 'UPDATE'
                            ? record?.get('billStatusMeaning')
                            : statusTagRender(record?.get('billStatusMeaning'), statusData[value])
                        }
                      />
                      <FormItem name="camp" editor="select" disabled={action === 'UPDATE'} />
                      <FormItem name="creationDate" disabled={action === 'UPDATE'} />
                      <FormItem name="createdUserName" disabled={action === 'UPDATE'} />
                      <FormItem name="createdUnitLov" editor="lov" editable={editFlag} />
                      <FormItem name="companLov" editor="select" disabled={action === 'UPDATE'} />
                      <FormItem name="companyName" disabled={action === 'UPDATE'} />
                      <FormItem name="currencyLov" editor="select" disabled={action === 'UPDATE'} />
                      <FormItem
                        name="supplierCompanyLov"
                        editor="select"
                        disabled={action === 'UPDATE'}
                      />
                      <FormItem name="supplierCompanyName" disabled={action === 'UPDATE'} />
                      <FormItem name="ouName" disabled={action === 'UPDATE'} />
                      <FormItem name="sourceSupplierCompanyName" disabled={action === 'UPDATE'} />
                      <FormItem name="sourceSupplierCompanyNum" disabled={action === 'UPDATE'} />
                      <FormItem name="supplierSiteCode" disabled={action === 'UPDATE'} />
                      <FormItem name="unitName" disabled={action === 'UPDATE'} />
                      <FormItem
                        name="purchaserESignStatusMeaning"
                        disabled={action === 'UPDATE'}
                        renderer={({ value, record }) =>
                          action === 'UPDATE'
                            ? value
                            : statusTagRender(value, tagColor[record?.get('purchaserESignStatus')])
                        }
                      />
                      <FormItem
                        name="supplierESignStatusMeaning"
                        disabled={action === 'UPDATE'}
                        renderer={({ value, record }) =>
                          action === 'UPDATE'
                            ? value
                            : statusTagRender(value, tagColor[record?.get('supplierESignStatus')])
                        }
                      />
                      <FormItem name="eSignOrderMeaning" disabled={action === 'UPDATE'} />
                      <FormItem
                        name="purchaserEvidenceStatusMeaning"
                        disabled={action === 'UPDATE'}
                        renderer={({ value, record }) =>
                          action === 'UPDATE'
                            ? value
                            : statusTagRender(
                                value,
                                tagColor[record?.get('purchaserEvidenceStatus')]
                              )
                        }
                      />
                      <FormItem
                        name="supplierEvidenceStatusMeaning"
                        disabled={action === 'UPDATE'}
                        renderer={({ value, record }) =>
                          action === 'UPDATE'
                            ? value
                            : statusTagRender(
                                value,
                                tagColor[record?.get('supplierEvidenceStatus')]
                              )
                        }
                      />
                      <FormItem name="purchaserESignMsg" disabled={action === 'UPDATE'} />
                      <FormItem name="supplierESignMsg" disabled={action === 'UPDATE'} />
                      <FormItem
                        name="terminateSignStatus"
                        disabled={action === 'UPDATE'}
                        renderer={({ value, record }) =>
                          action === 'UPDATE'
                            ? record?.get('terminateSignStatusMeaning')
                            : statusTagRender(
                                record?.get('terminateSignStatusMeaning'),
                                tagColor[value]
                              )
                        }
                      />
                      <FormItem
                        name="remark"
                        editor="textarea"
                        editable={action === 'UPDATE'}
                        newLine
                        colSpan={2}
                      />
                      {billStatus !== 'NEW' &&
                        !(
                          ['SUBMITED', 'SUBMITED_APPROVING', 'WAIT_SUPPLIER_CONFIRM'].includes(
                            billStatus
                          ) && editFlag
                        ) && (
                          <FormItem
                            name="approvedRemark"
                            newLine
                            colSpan={2}
                            editor="textarea"
                            disabled={action === 'UPDATE'}
                          />
                        )}
                      {!['NEW', 'SUBMITED', 'SUBMITED_APPROVING'].includes(billStatus) &&
                        !(
                          ['CANCELING', 'CANCEL_APPROVING', 'WAIT_SUPPLIER_CANCEL'].includes(
                            billStatus
                          ) && editFlag
                        ) && (
                          <FormItem
                            name="canceledReason"
                            newLine
                            colSpan={2}
                            editor="textarea"
                            disabled={action === 'UPDATE'}
                          />
                        )}
                      {action !== 'CANCEL' && (
                        <FormItem
                          name="canceledReason"
                          newLine
                          colSpan={2}
                          editor="textarea"
                          disabled={action === 'UPDATE'}
                        />
                      )}
                      {remoteProps
                        ? remoteProps.process('SSTA_RECONCILIATION_DETAIL_CUX_INFO', '', {
                            formDs: this.formDs,
                            handleFetch: this.handleFetch,
                          })
                        : []}
                    </Form>
                  )}
                </Panel>
              )}
              <Panel
                forceRender
                key="transaction"
                dataSet={this.tableDs}
                id={`purchase-bill-transaction-${billHeaderId}`}
                header={intl
                  .get(`ssta.reconciliationWorkbench.view.message.panel.tradingInformation`)
                  .d('对账明细信息')}
              >
                {customizeTable(
                  {
                    code: 'SSTA.PURCHASER_BILL_DETAIL.TRANSACTION_DETAILS',
                    readOnly: processLineCuszReadOnly,
                    buttonCode: 'SSTA.PURCHASER_BILL_DETAIL.LINE_BTNS',
                  },
                  <SearchBarTable
                    searchCode="SSTA.PURCHASER_BILL_DETAIL.TRANSACTION_DETAIL_SEARCH"
                    buttons={this.getTableButtons()}
                    dataSet={this.tableDs}
                    columns={this.listColumnsRender()}
                    queryBar="none"
                    style={{ maxHeight: 820 }}
                    maxPageSize={1000}
                    pagination={{ pageSizeOptions: ['10', '20', '50', '100', '500', '1000'] }}
                    searchBarConfig={{
                      closeFilterSelector: true,
                      onQuery: async ({ params }) => {
                        this.tableDs.queryDataSet.loadData([{ ...params, billHeaderId }]);
                        const lineDatas = await this.tableDs.query();
                        if (lineDatas) {
                          this.setState({
                            originData: {
                              ...this.state.originData,
                              lineDatas,
                            },
                          });
                        }
                      },
                      fieldProps: {
                        costId: {
                          lovPara: {
                            tenantId: organizationId,
                          },
                        },
                      },
                    }}
                  />
                )}
              </Panel>
              {!isNewPub && (
                <Panel
                  forceRender
                  key="others"
                  dataSet={this.formDs}
                  id={`purchase-bill-others-${billHeaderId}`}
                  header={intl
                    .get(`ssta.reconciliationWorkbench.view.message.panel.othersInf`)
                    .d('其他信息')}
                >
                  {customizeForm(
                    {
                      code: 'SSTA.PURCHASER_BILL_DETAIL.OTHERS_INFO',
                      readOnly: !editFlag && !otherEdit,
                    },
                    <Form
                      columns={3}
                      useColon={false}
                      dataSet={this.formDs}
                      labelLayout={action === 'UPDATE' || otherEdit ? 'float' : 'vertical'}
                      useWidthPercent
                    >
                      {['EC_BILL'].includes(autoIssue) && (
                        <FormItem name="ecBillNum" disabled={action === 'UPDATE'} />
                      )}
                      <FormItem name="termCode" disabled={action === 'UPDATE'} />
                      <FormItem name="invOrganizationName" disabled={action === 'UPDATE'} />
                      <FormItem name="sourceSettleNum" disabled={action === 'UPDATE'} />
                      <FormItem name="purOrganizationName" disabled={action === 'UPDATE'} />
                    </Form>
                  )}
                </Panel>
              )}
              <Panel
                forceRender
                key="attachment"
                dataSet={this.formDs}
                id={`purchase-bill-attachment-${billHeaderId}`}
                header={intl
                  .get(`ssta.reconciliationWorkbench.view.message.panel.attachment`)
                  .d('附件')}
              >
                {customizeForm(
                  {
                    code: 'SSTA.PURCHASER_BILL_DETAIL.ENCLOSURE',
                    readOnly: !editFlag && !otherEdit,
                  },
                  <Form
                    columns={2}
                    useColon={false}
                    dataSet={this.formDs}
                    labelLayout={action === 'UPDATE' || otherEdit ? 'float' : 'vertical'}
                    useWidthPercent
                  >
                    <Attachment
                      dataSet={this.formDs}
                      name="attachmentUuid"
                      showHistory
                      labelLayout="float"
                      bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
                      readOnly={action !== 'UPDATE' && !otherEdit}
                      downloadAll={action !== 'UPDATE'}
                      fieldClassName={Styles['attachment-float-wrapper']}
                      bucketDirectory="ssta-file-bucket"
                    />
                    <Attachment
                      dataSet={this.formDs}
                      name="signUuid"
                      showHistory
                      labelLayout="float"
                      bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
                      readOnly
                      downloadAll={action !== 'UPDATE'}
                      fieldClassName={Styles['attachment-float-wrapper']}
                    />
                    {remoteProps &&
                      remoteProps.process('SSTA_RECONCILIATION_DETAIL_CUX_ATTACHMENT_INFO', '', {
                        formDs: this.formDs,
                        handleFetch: this.handleFetch,
                        editFlag,
                      })}
                  </Form>
                )}
              </Panel>
              {(remoteProps
                ? remoteProps.process('SSTA_RECONCILIATION_DETAIL_CUX_OTHER_PANELS', [], {
                    action,
                    editFlag,
                    formDs: this.formDs,
                  })
                : []
              ).map((item) => item)}
            </Collapse>
          )}
        </div>
      </Spin>
    );
  };

  linkToUpdateDetail = (action) => {
    const {
      history,
      location: { pathname, search },
    } = this.props;
    const { billHeaderId, billNum } = this.state;
    const editFlag = action === 'SIGNATURE' ? 0 : 1;
    this.updateTabLink(
      queryString.stringify({
        action,
        editFlag,
        billList: JSON.stringify([{ billHeaderId, billNum }]),
      }),
      {
        backPath: `${pathname}${search}`,
      }
    );
    history.push({
      pathname: '/ssta/new-reconciliation-workbench/detail',
      search: queryString.stringify({
        action,
        editFlag,
        billList: JSON.stringify([{ billHeaderId, billNum }]),
      }),
      state: {
        backPath: `${pathname}${search}`,
      },
    });
  };

  handleApprove = () => {
    const { history } = this.props;
    const billStatus = this.formDs.current?.get('billStatus');
    if (['SUBMITED_APPROVING', 'CANCEL_APPROVING'].includes(billStatus)) {
      this.workflowCaller.goApprove({
        onSuccess: () => {
          notification.success();
          history.push({
            pathname: '/ssta/new-reconciliation-workbench/list',
            state: { _back: 1 },
          });
        },
      });
    } else {
      this.linkToUpdateDetail('APPROVE');
    }
  };

  handleRevoke = async () => {
    const { history } = this.props;
    const confirmRes = await Modal.confirm({
      title: intl.get('ssta.common.view.title.tip').d('提示'),
      children: intl
        .get('ssta.common.view.message.confirmRevokeApprovalTip')
        .d(
          '是否确认撤销审批?撤销后您仍可再次提交发起审批(工作流审批时仅工作流审批发起人可执行撤销)'
        ),
    });
    if (confirmRes !== 'ok') return false;
    const headerData = this.formDs.current?.toData() || {};
    this.setLoading(true);
    const res = getResponse(await withdraw(headerData));
    this.setLoading(false);
    if (!res) return false;
    notification.success();
    history.push({
      pathname: '/ssta/new-reconciliation-workbench/list',
      state: { _back: 1 },
    });
  };

  handleMainStrategy = () => {
    const {
      editFlag,
      action,
      originData: {
        headerData: { billStatus },
      },
    } = this.state;
    Modal.open({
      drawer: true,
      title: intl.get(`ssta.purchaseSettle.message.panel.mainStrategyInfo`).d('主策略信息'),
      key: Modal.key(),
      className: Styles['ssta-large-modal'],
      children: (
        <MainStrategy
          editFlag={editFlag}
          action={action}
          formDs={this.formDs}
          billStatus={billStatus}
          {...this.props}
        />
      ),
      okText: intl.get('hzero.common.button.close').d('关闭'),
      okCancel: false,
    });
  };

  handleViewInvRecord = () => {
    const { billHeaderId } = this.state;
    if (!billHeaderId) return;
    const { customizeTable, history } = this.props;
    Modal.open({
      drawer: true,
      title: intl
        .get('ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceApplicationInfo')
        .d('发票申请信息'),
      closable: true,
      key: Modal.key(),
      className: Styles['ssta-medium-modal'],
      children: (
        <InvoiceStatementRecords
          history={history}
          customizeTable={customizeTable}
          billHeaderId={billHeaderId}
        />
      ),
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  formatHeaderBtn = () => {
    const { remote, history } = this.props;
    const {
      editFlag,
      billHeaderId,
      action,
      type,
      originData: { headerData },
      permsMap,
      showInvoiceBtn,
      docLinkFlag,
      readOnlyFlag,
    } = this.state;
    const {
      billStatus,
      autoIssue,
      cancelCamp,
      billSyncFlag,
      confirmApproveMethod,
      cancelApproveMethod,
      confirmCollaborativeMode,
      cancelCollaborativeMode,
      billCancelType,
      syncStatus,
      purchaserESignStatus,
      eSignOrder,
      supplierESignStatus,
      supplierEvidenceStatus,
      purchaserEvidenceStatus,
      printBtnDisable,
      taskId,
      eSignFlag,
      billErpSyncNode,
      terminateSignStatus,
      invoiceButtonFlag,
      enableChargeDebitFlag,
      autoInvoiceScenarioType,
      debitEffectiveNode,
    } = headerData;
    const loading = this.formDs.status !== 'ready';
    // 显示签章按钮逻辑
    const showSignature =
      ['CONFIRM'].includes(billStatus) &&
      !(
        ['EVIDENCED'].includes(purchaserEvidenceStatus) &&
        ['EVIDENCED'].includes(supplierEvidenceStatus)
      ) &&
      ['UN_SIGNED', 'SIGN_FAILED'].includes(purchaserESignStatus) &&
      (eSignOrder === 'PURCHASER' ||
        (eSignOrder === 'SUPPLIER' && ['SIGNED'].includes(supplierESignStatus)));
    // 显示签章拒绝逻辑
    const showRejectSignature =
      ['CONFIRM'].includes(billStatus) &&
      ['EVIDENCED'].includes(supplierEvidenceStatus) &&
      ['SIGNED'].includes(supplierESignStatus) &&
      ['UN_EVIDENCE'].includes(purchaserEvidenceStatus) &&
      ['UN_SIGNED'].includes(purchaserESignStatus);
    // 显示解约按钮逻辑  未解约或采购方解约中
    const showTerminateBtn =
      ['CANCEL'].includes(billStatus) &&
      ['NOT_TERMINATED', 'PURCHASER_TERMINATING'].includes(terminateSignStatus);
    const operateBtn = {
      name: 'operationRecord',
      child: intl.get('ssta.reconciliationWorkbench.view.button.operationRecord').d('操作记录'),
      btnProps: {
        icon: 'operation_service_request',
        funcType: 'flat',
        color: 'default',
        onClick: () => this.openOprationModal(this.formDs.current, billHeaderId),
        loading,
      },
    };
    let btns = [];
    if (docLinkFlag || readOnlyFlag) {
      btns = [operateBtn];
    } else {
      btns = [
        action === 'UPDATE' && {
          name: 'submit',
          child: intl.get('ssta.reconciliationWorkbench.view.button.submit').d('提交'),
          btnProps: {
            icon: 'check',
            onClick: this.handleSubmit,
            disabled: !editFlag,
            loading,
            wait: 1000,
            waitType: 'throttle',
          },
        },
        action === 'UPDATE' && {
          name: 'save',
          child: intl.get('hzero.common.button.save').d('保存'),
          btnProps: {
            icon: 'save',
            onClick: this.handleSave,
            disabled: !editFlag,
            loading,
            wait: 1500,
            waitType: 'throttle',
          },
        },
        action === 'APPROVE' && {
          name: 'confirm',
          child: intl.get('hzero.common.button.confirm').d('确认'),
          btnProps: {
            icon: 'check',
            onClick: () => this.handleOpr(comfirm, 'CONFIRM'),
            loading,
            wait: 1500,
            waitType: 'throttle',
          },
        },
        action === 'APPROVE' && {
          name: 'back',
          child: intl.get('ssta.reconciliationWorkbench.view.button.return').d('退回'),
          btnProps: {
            icon: 'reply',
            onClick: () => this.handleOpr(returnData, 'RETURN'),
            loading,
            wait: 1500,
            waitType: 'throttle',
          },
        },
        ['UPDATE', 'CANCEL'].includes(action) && {
          name: 'cancel',
          child: intl.get('ssta.reconciliationWorkbench.view.button.cancel').d('取消'),
          btnProps: {
            icon: 'cancel',
            onClick: () =>
              action === 'CANCEL'
                ? this.handleOpr(cancel, 'CANCEL')
                : this.handleOpr(deleteData, 'DELETE'),
            loading,
            wait: 1500,
            waitType: 'throttle',
          },
        },
        action === 'SYNC' && {
          name: 'sync',
          child: intl.get('hzero.common.button.sync').d('同步'),
          btnProps: {
            icon: 'sync',
            onClick: () => this.handleOpr(sync, 'SYNC'),
            loading,
            wait: 1500,
            waitType: 'throttle',
          },
        },
        // sass整合通用签章
        action === 'SIGNATURE' &&
          eSignFlag === 1 &&
          permsMap.get(`${buttonPermPrefix}.commonSignature`) &&
          showSignature && {
            name: 'signatureCommon',
            child: intl.get('ssta.common.model.common.eSign').d('签章'),
            btnProps: {
              icon: 'authorize',
              onClick: () => this.handleCommonSignature(),
              loading,
            },
          },
        // sass整合通用签章
        action === 'SIGNATURE' &&
          ['SIGNED'].includes(purchaserESignStatus) &&
          !['SIGNED'].includes(supplierESignStatus) &&
          ['CONFIRM'].includes(billStatus) &&
          taskId &&
          permsMap.get(`${buttonPermPrefix}.cancelSignature`) && {
            name: 'signatureBackCommon',
            child: intl.get('ssta.common.model.common.eSignLinkCancel').d('取消签章'),
            btnProps: {
              icon: 'cancel',
              onClick: () => this.handleCommonCancelSignature(),
              loading,
            },
          },
        action === 'SIGNATURE' &&
          eSignFlag === 1 &&
          permsMap.get(`${buttonPermPrefix}.detail.signature`) &&
          showSignature && {
            name: 'signature',
            child: intl.get('ssta.common.model.common.eSign').d('签章'),
            btnProps: {
              icon: 'authorize',
              onClick: () => this.handleOpr(null, 'SIGNATURE'),
              loading,
              wait: 1500,
              waitType: 'throttle',
            },
          },
        action === 'SIGNATURE' &&
          taskId &&
          permsMap.get(`${buttonPermPrefix}.terminate`) &&
          showTerminateBtn && {
            name: 'signatureTerminate',
            child: intl.get('ssta.common.model.common.terminate').d('解约'),
            btnProps: {
              icon: 'authorize',
              onClick: () => this.handleTerminateSignature(),
            },
          },
        action === 'SIGNATURE' &&
          eSignFlag === 1 &&
          permsMap.get(`${permPrefix}.radio.button.signature`) &&
          showRejectSignature && {
            name: 'signatureReject',
            child: intl.get('ssta.common.model.common.rejectSign').d('驳回签章'),
            btnProps: {
              icon: 'authorize',
              onClick: () => this.handleOpr(rejectedSignature, 'SIGNATUREREJECT'),
              loading,
              wait: 1500,
              waitType: 'throttle',
            },
          },
        type &&
          permsMap.get(`${permPrefix}.radio.button.update`) &&
          ['NEW', 'RETURN'].includes(billStatus) &&
          headerData.camp === 'PURCHASER' && {
            name: 'edit',
            child: intl.get('hzero.common.button.edit').d('编辑'),
            btnProps: {
              icon: 'mode_edit',
              onClick: () => this.linkToUpdateDetail('UPDATE'),
              loading,
            },
          },
        type &&
          permsMap.get(`${permPrefix}.radio.button.audit`) &&
          ((billStatus === 'SUBMITED' &&
            confirmApproveMethod === 'FUNCTIONAL' &&
            (confirmCollaborativeMode === 'SINGLE' ||
              (confirmCollaborativeMode === 'DOUBLE' && headerData.camp === 'SUPPLIER'))) ||
            (billStatus === 'CANCELING' &&
              ['UNSYNCHRONIZED', 'SYNC_SUCCESS', 'SYNC_FAILURE'].includes(syncStatus) &&
              cancelApproveMethod === 'FUNCTIONAL' &&
              (cancelCollaborativeMode === 'SINGLE' ||
                (cancelCollaborativeMode === 'DOUBLE' && cancelCamp === 'SUPPLIER'))) ||
            (['SUBMITED_APPROVING', 'CANCEL_APPROVING'].includes(billStatus) &&
              this.workflowCaller.getApproveFlag())) && {
            name: 'approve',
            child: intl.get('ssta.common.button.approve').d('审核'),
            btnProps: {
              icon: 'authorize',
              onClick: this.handleApprove,
              loading,
            },
          },
        type &&
          permsMap.get(`${permPrefix}.radio.button.recall`) &&
          (billStatus === 'SUBMITED' ||
            (['SUBMITED_APPROVING'].includes(billStatus) &&
              this.workflowCaller?.getRevokeFlag())) &&
          headerData.camp === 'PURCHASER' && {
            name: 'revoke',
            child: intl.get('hzero.common.button.recall').d('撤回'),
            btnProps: {
              type: 'c7n-pro',
              icon: 'reply',
              wait: 1500,
              onClick: this.handleRevoke,
              loading,
            },
          },
        // 开启签章且采购方签章状态不是已签章显示
        action === 'SIGNATURE' &&
          eSignFlag === 1 &&
          !['SIGNED'].includes(purchaserESignStatus) &&
          permsMap.get(`${buttonPermPrefix}.signatureLink`) && {
            name: 'signatureLink',
            child: intl.get('ssta.common.model.common.eSignLink').d('签章链接'),
            btnProps: {
              icon: 'link2',
              onClick: () => this.handleGetSignatureLink(),
              loading,
              wait: 1500,
              waitType: 'throttle',
            },
          },
        action === 'SIGNATURE' &&
          taskId &&
          permsMap.get(`${buttonPermPrefix}.signatureBack`) && {
            name: 'signatureBack',
            child: intl.get('ssta.common.model.common.eSignLinkCancel').d('取消签章'),
            btnProps: {
              icon: 'link2',
              onClick: () => this.handleSignatureBack(),
              loading,
              wait: 1500,
              waitType: 'throttle',
            },
          },
        type &&
          permsMap.get(`${permPrefix}.radio.button.cancel`) &&
          billStatus === 'CONFIRM' &&
          autoIssue !== 'EC_BILL' &&
          !(billCancelType === 'ERP' && syncStatus === 'SYNC_SUCCESS') && {
            name: 'cancel',
            child: intl.get('hzero.common.button.cancel').d('取消'),
            btnProps: {
              icon: 'cancel',
              onClick: () => this.linkToUpdateDetail('CANCEL'),
              loading,
            },
          },
        type &&
          eSignFlag === 1 &&
          permsMap.get(`${permPrefix}.radio.button.signature`) &&
          showSignature && {
            name: 'signature',
            child: intl.get('ssta.common.model.common.eSign').d('签章'),
            btnProps: {
              icon: 'authorize',
              onClick: () => this.linkToUpdateDetail('SIGNATURE'),
            },
          },
        type &&
          taskId &&
          permsMap.get(`${buttonPermPrefix}.terminate`) &&
          showTerminateBtn && {
            name: 'signatureTerminate',
            child: intl.get('ssta.common.model.common.terminate').d('解约'),
            btnProps: {
              icon: 'authorize',
              onClick: () => this.linkToUpdateDetail('SIGNATURE'),
            },
          },
        type &&
          ['SIGNED'].includes(purchaserESignStatus) &&
          !['SIGNED'].includes(supplierESignStatus) &&
          ['CONFIRM'].includes(billStatus) &&
          taskId &&
          permsMap.get(`${buttonPermPrefix}.cancelSignature`) && {
            name: 'signatureBackCommon',
            child: intl.get('ssta.common.model.common.eSignLinkCancel').d('取消签章'),
            btnProps: {
              icon: 'cancel',
              onClick: () => this.linkToUpdateDetail('SIGNATURE'),
              loading,
            },
          },
        type &&
          permsMap.get(`${permPrefix}.radio.button.sync`) &&
          ((billStatus === 'CONFIRM' &&
            ['UNSYNCHRONIZED', 'SYNC_FAILURE'].includes(syncStatus) &&
            (billErpSyncNode?.includes('COMPLETED') ||
              (purchaserESignStatus === 'SIGNED' &&
                supplierESignStatus === 'SIGNED' &&
                billErpSyncNode?.includes('SIGNED')))) ||
            (billStatus === 'CANCELING' && ['ERP_CANCEL_FAILURE'].includes(syncStatus))) &&
          Boolean(billSyncFlag) && {
            name: 'sync',
            child: intl.get('hzero.common.button.sync').d('同步'),
            btnProps: {
              icon: 'sync',
              onClick: () => this.linkToUpdateDetail('SYNC'),
            },
          },
        type &&
          eSignFlag === 1 &&
          !['SIGNED'].includes(purchaserESignStatus) &&
          permsMap.get(`${buttonPermPrefix}.signatureLink`) && {
            name: 'signatureLink',
            child: intl.get('ssta.common.model.common.eSignLink').d('签章链接'),
            btnProps: {
              icon: 'link2',
              onClick: () => this.linkToUpdateDetail('SIGNATURE'),
              loading,
              wait: 1500,
              waitType: 'throttle',
            },
          },
        Number(enableChargeDebitFlag) === 1 &&
          autoInvoiceScenarioType === 'EC' &&
          debitEffectiveNode === ' SETTLE_OR_BILLED' &&
          showInvoiceBtn &&
          ['CONFIRM'].includes(billStatus) && {
            name: 'invoice',
            child: (
              <Tooltip
                title={intl
                  .get('ssta.reconciliationWorkbench.model.button.createInvoiceSettleTips')
                  .d(
                    '点击则，电商线上对账模式即自动出单=电商账单推送，对账单关联的电商对账单所有行及其子订单关联的冲销行自动按照结算策略生成开票结算单  ；电商线下对账模式，即自动出单=无需自动，    srm对账单关联的结算事务行以及结算事务行关联的售后事务行（关联同一电商子订单号）自动按照结算策略生成开票结算单'
                  )}
              >
                {intl
                  .get('ssta.reconciliationWorkbench.model.button.createInvoiceSettle')
                  .d('生成开票结算单')}
              </Tooltip>
            ),
            btnProps: {
              icon: 'note_add',
              loading,
              wait: 1500,
              waitType: 'throttle',
              onClick: () => this.handleOpr(createInvoiceSettle, 'INVOICE'),
            },
          },
        taskId &&
          ['TERMINATED'].includes(terminateSignStatus) &&
          permsMap.get(`${buttonPermPrefix}.downloadTerminate`) && {
            name: 'downloadTerminate',
            child: intl.get('ssta.common.model.common.downloadTerminate').d('下载解约文件'),
            btnProps: {
              icon: 'sim_card_download',
              onClick: () => this.handleCommonDownloadTerminate(),
              loading,
            },
          },
        taskId &&
          permsMap.get(`${buttonPermPrefix}.signatureDownload`) &&
          ['SIGNED'].includes(purchaserESignStatus) && {
            name: 'downloadSignature',
            child: intl.get('ssta.common.model.common.downloadSignature').d('下载签章'),
            btnProps: {
              icon: 'sim_card_download',
              onClick: () => this.handleCommonDownloadSignature(),
              loading,
            },
          },
        taskId &&
          permsMap.get(`${buttonPermPrefix}.downloadSignatureTec`) &&
          ['SIGNED'].includes(purchaserESignStatus) && {
            name: 'downloadSignatureTec',
            child: intl.get('ssta.common.model.common.downloadSignatureTec').d('下载技术报告'),
            btnProps: {
              icon: 'sim_card_download',
              onClick: () => this.handleDownloadSignatureTec(),
              loading,
              wait: 1500,
              waitType: 'throttle',
            },
          },
        taskId &&
          permsMap.get(`${buttonPermPrefix}.downloadSignatureNotary`) &&
          ['SIGNED'].includes(purchaserESignStatus) && {
            name: 'downloadSignatureNotary',
            child: intl.get('ssta.common.model.common.downloadSignatureNotary').d('下载公证报告'),
            btnProps: {
              icon: 'bookmark_added',
              onClick: () => this.handleDownloadSignatureNotary(),
              loading,
              wait: 1500,
              waitType: 'throttle',
            },
          },
        printBtnDisable !== 1 &&
          permsMap.get(`${buttonPermPrefix}.print-detail`) && {
            name: 'print',
            child: intl.get('ssta.reconciliationWorkbench.view.button.print').d('打印'),
            btnProps: {
              icon: 'print',
              funcType: 'flat',
              color: 'default',
              onClick: this.handlePrint,
              loading,
              wait: 1500,
            },
          },
        printBtnDisable !== 1 &&
          permsMap.get(`${buttonPermPrefix}.new-print-detail`) && {
            name: 'newPrint',
            btnComp: PrintProButton,
            childFor: 'buttonText',
            child: intl.get('ssta.common.view.button.newPrint').d('(新)打印'),
            btnProps: {
              buttonProps: { funcType: 'flat' },
              requestUrl: `${apiPrefix}/bill-headers/list-print-new`,
              method: 'PUT',
              data: { billHeaderIdList: [billHeaderId] },
              loading,
            },
          },
        operateBtn,
        {
          name: 'mainStrategy',
          child: intl.get('ssta.common.button.mainStrategyInfo').d('主策略信息'),
          btnProps: {
            loading,
            icon: 'ballot',
            onClick: this.handleMainStrategy,
          },
        },
        permsMap.get(`${buttonPermPrefix}.invoiceRecord`) &&
          Number(invoiceButtonFlag) === 1 && {
            name: 'invoiceRecord',
            child: intl
              .get('ssta.common.model.common.invoiceStatementRecords')
              .d('发票申请执行记录'),
            btnProps: {
              loading,
              icon: 'receipt',
              onClick: this.handleViewInvRecord,
            },
          },
      ];
    }
    const processBtns = remote
      ? remote.process('SSTA_RECONCILIATION_DETAIL_CUX.HEAD_BTNS', btns, {
          loading,
          history,
          headerDs: this.formDs,
          init: this.init,
        })
      : btns;
    return formatDynamicBtns(processBtns);
  };

  /**
   * 渲染函数
   * @returns Element
   */
  render() {
    const { billHeaderId, billList, listFlag, notPub, action, docLinkFlag, isNewPub } = this.state;
    const {
      location: { state },
      customizeBtnGroup,
      customizeCommon,
      custConfig = {},
    } = this.props;
    // 网络错误，接口错误拦截
    if (billHeaderId && !this.formDs.current?.get('billHeaderId')) return <Spin />;
    return (
      <Fragment>
        {isNewPub && (
          <WorkflowCard
            headerBtns={this.formatHeaderBtn()}
            formDs={this.formDs}
            customizeBtnGroup={customizeBtnGroup}
            customizeCommon={customizeCommon}
          />
        )}
        {!isNewPub && (
          <Header
            title={this.titleRender()}
            backPath={
              notPub && !docLinkFlag
                ? state?.backPath || '/ssta/new-reconciliation-workbench/list'
                : null
            }
            onBack={() => {
              if (notPub && state?.backPath) {
                this.updateTabLink(state?.backPath.split('?')[1], null);
              }
            }}
          >
            {customizeBtnGroup(
              {
                code:
                  action === 'UPDATE'
                    ? 'SSTA.PURCHASER_BILL_DETAIL.HEADER_BTNS_UPDATE'
                    : 'SSTA.PURCHASER_BILL_DETAIL.HEADER_BTNS',
                pro: true,
              },
              <DynamicButtons
                buttons={this.formatHeaderBtn()}
                maxNum={5}
                defaultBtnType="c7n-pro"
              />
            )}
          </Header>
        )}
        <div
          className={`${Styles['ssta-detail-content']} ${style['ssta-detail-render']}`}
          id={`purchase-bill-detail-content-${billHeaderId}`}
        >
          {!listFlag ? (
            this.detailTabPaneRender(billHeaderId)
          ) : (
            <Tabs defaultActiveKey={billHeaderId} tabPosition="left" onChange={this.onTabChange}>
              {billList.map((item) => (
                <TabPane tab={item.billNum} key={item.billHeaderId}>
                  {this.detailTabPaneRender(item.billHeaderId)}
                </TabPane>
              ))}
            </Tabs>
          )}
          <NavigationAnchor
            currentOffsetTop={200}
            linkList={this.linkListRender()}
            id={`purchase-bill-detail-content-${billHeaderId}`}
            custConfig={custConfig['SSTA.PURCHASER_BILL_DETAIL.COLLAPSE']}
          />
        </div>
      </Fragment>
    );
  }
}
