/* eslint-disable react/jsx-indent */
import React, { PureComponent, Fragment } from 'react';
import { DataSet, Button, Form, Modal, NumberField, Attachment } from 'choerodon-ui/pro';
import { Card, Tabs, Popover, Spin } from 'choerodon-ui';
import { observer } from 'mobx-react';
import queryString from 'querystring';
import { isEmpty, isArray } from 'lodash';
import { math } from 'choerodon-ui/dataset';
import { Throttle } from 'lodash-decorators';

import intl from 'utils/intl';
import DocFlow from '_components/DocFlow';
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';
import Import from 'components/Import';
import ExcelExportPro from 'components/ExcelExportPro';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getActiveTabKey, updateTab } from 'utils/menuTab';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import IMChatDraggable from '_components/IMChatDraggable';
import DynamicButtons from '_components/DynamicButtons';

import { decimalPointAccuracy } from '@/routes/utils';
import { billLineConfig } from '@/utils/amountConfig';
import { getResponse, amountLocalRender, btnsFormat, recordsCommit } from '@/utils/utils';
import { confirmModal } from '@/routes/Components/ConfirmModal';

import {
  FormItem,
  FixedAnchor,
  ReconciliationWorkbenchRecord,
  getPermissions,
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
  fetchCurrencyCode,
  submitValidate,
  getBillLinesByIds,
} from '@/services/reconciliationWorkbenchService';
import Styles from '@/routes/common.less';
import { formDs, tableDs } from './mainDS';
import FilledInfoModal from './FilledInfoModal';
import DetailDrawer from '../DetailDrawerNew';
import AddModal from './AddModal';

const camp = 'PURCHASER';
const { TabPane } = Tabs;
const organizationId = getCurrentOrganizationId();
const permPrefix = 'srm.settle-account.reconciliation-workbench.purchaser.ps';

@withCustomize({
  unitCode: [
    'SSTA.PURCHASER_BILL_DETAIL.BASIC',
    'SSTA.PURCHASER_BILL_DETAIL.TRADING_PARTY',
    'SSTA.PURCHASER_BILL_DETAIL.TRANSACTION_AMOUNT',
    'SSTA.PURCHASER_BILL_DETAIL.TRANSACTION_DETAILS',
    'SSTA.PURCHASER_BILL_DETAIL.SETTLE_CONFIG',
    'SSTA.PURCHASER_BILL_DETAIL.OTHERS',
    'SSTA.PURCHASER_BILL_DETAIL.ENCLOSURE',
    'SSTA.PURCHASER_BILL_DETAIL.HEADER_BTNS',
    'SSTA.PURCHASER_BILL_DETAIL.PRE_CONFIRM',
    'SSTA.PURCHASER_BILL_DETAIL.PRE_RETURN',
    'SSTA.PURCHASER_BILL_DETAIL.PRE_CANCEL',
  ],
})
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
      loading: true,
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
      readOnlyFlag: false, // 单据只读，有返回按钮，头按钮只有操作记录
    };

    /**
     * 头 DataSet
     */
    this.formDs = new DataSet(formDs());

    /**
     * 行 DataSet
     */
    this.tableDs = new DataSet({
      ...tableDs(this.props),
      events: {
        update: ({ record, name }) => this.handleUpdateLine(record, name),
      },
    });
  }

  componentDidMount() {
    this.init();
    this.getPermissions();
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

  /**
   * 页面初始化
   */
  init = (lineFlag) => {
    const routerParams = queryString.parse(this.props.location.search.substr(1));
    const { editFlag = 0, billList: strBillList, action, type, readOnlyFlag } = routerParams;
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
        readOnlyFlag: Number(readOnlyFlag) === 1,
      },
      () => {
        this.handleFetch();
        if (lineFlag) {
          this.tableDs.setQueryParameter('billHeaderId', billHeaderId);
          this.tableDs.query();
        }
      }
    );
  };

  /**
   * 查询头行
   */
  handleFetch = async (flag) => {
    const { billHeaderId } = this.state;
    if (billHeaderId) {
      this.setState({ loading: true });
      const remarks = this.formDs.current.get('remark');
      const { action, editFlag } = queryString.parse(this.props.location.search.slice(1));
      const res = getResponse(await getDetail(billHeaderId, camp, action, editFlag));
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
            ...Object.fromEntries(
              (res.customizeRefreshFields || []).map((item) => [item, res[item]])
            ),
          });
        } else {
          this.formDs.loadData([newRes]);
        }
        this.setState({ loading: false });
      } else {
        this.setState({ loading: false });
      }
    } else {
      this.setState({
        loading: false,
      });
    }
    this.setState({
      loading: false,
    });
  };

  /**
   * 行修改监听事件
   * @param {Object} record 行记录
   * @param {String} name 字段名称
   */
  handleUpdateLine = (record, name) => {
    const get = (field) => record.get(field);
    const set = (field, value) => record.set(field, value);

    if (name === 'quantity') {
      set('quantity', decimalPointAccuracy(get('quantity'), get('uomPrecision')));
    }
  };

  /**
   * 响应行新增按钮
   */
  handleAdd = () => {
    const {
      originData: { headerData },
    } = this.state;
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
        />
      ),
      footer: null,
    });
  };

  /**
   * 取消行数据方法
   */
  handleCancelLines = async () => {
    const data = this.tableDs.selected.map((item) => item.toData());
    if (data) {
      this.setState({ loading: true });
      const res = getResponse(await cancelLines(data));
      this.setState({ loading: false });
      if (res) {
        notification.success();
        this.handleFetch(1);
        await this.tableDs.query();
        this.tableDs.clearCachedSelected();
      }
    }
  };

  /**
   * 响应行导入按钮
   */
  handleRoleImport = () => {
    const { billHeaderId } = this.state;
    const { history } = this.props;
    history.push({
      pathname: '/ssta/reconciliation-workbench/data-import/SSTA.BILL_LINE_BATCH_UPDATE',
      search: queryString.stringify({
        action: intl.get('ssta.common.button.batchUpdate').d('批量编辑'),
        backPath: `/ssta/reconciliation-workbench/detail${location.search}`,
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
      children: <DetailDrawer record={record} {...this.props} />,
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
        children: <DetailDrawer record={record} type="F" {...this.props} />,
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
    this.tableDs.query();
  };

  /**
   * 响应弹窗
   * @param {Function} reqFun 请求函数
   * @param {Object} sendData 请求数据
   */
  handleFilledInfoOk = async (reqFun, sendData) => {
    this.setState({ loading: true });
    const res = getResponse(await reqFun([sendData]));
    this.setState({ loading: false });
    if (res) {
      this.afterSplitAction();
    }
  };

  /**
   * 响应操作按钮
   * @param {Function} reqFun 请求函数
   * @param {String} operation 按钮执行操作
   */
  handleOpr = (reqFun, operation) => {
    const { editFlag, action } = this.state;
    const { customizeForm, custConfig } = this.props;
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
        this.handleCancelLoading(reqFun, operation);
      }
    }
  };

  handleCancelLoading = async (reqFun, operation) => {
    const headerData = this.formDs.current.toData();
    const sendData = operation === 'SYNC' ? [headerData] : headerData;
    this.setState({ loading: true });
    const res = getResponse(await reqFun(sendData));
    this.setState({ loading: false });
    if (res) {
      this.afterSplitAction(operation === 'DELETE');
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
      return null;
    }
  };

  updateTabLink = (search, state) => {
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
        pathname: '/ssta/reconciliation-workbench/detail',
        search: queryString.stringify({
          action,
          editFlag: Number(editFlag),
          billList: JSON.stringify(filterList),
        }),
      });
    } else {
      // history.push('/ssta/reconciliation-workbench/list');
      history.push({
        pathname: '/ssta/reconciliation-workbench/list',
        state: { _back: 1 },
      });
    }
  };

  handleSave = async () => {
    const sendData = await this.getSendData();
    if (sendData) {
      this.setState({ loading: true });
      const res = getResponse(await save(sendData));
      this.setState({ loading: false });
      if (res) {
        notification.success();
        this.handleFetch();
        if (!isEmpty(sendData.billLineList)) {
          const refreshedLines = getResponse(
            await getBillLinesByIds({
              billLineIds: sendData.billLineList.map((item) => item.billLineId),
              customizeUnitCode:
                'SSTA.PURCHASER_BILL_DETAIL.TRANSACTION_DETAIL_SEARCH,SSTA.PURCHASER_BILL_DETAIL.TRANSACTION_DETAILS',
            })
          );
          if (refreshedLines) {
            recordsCommit(refreshedLines, this.tableDs, 'billLineId');
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
    const sendData = await this.getSendData(true);
    const validateOk = async () => {
      this.setState({ loading: true });
      const res = getResponse(await submit(sendData));
      this.setState({ loading: false });
      if (res) {
        this.afterSplitAction(true);
      }
    };
    if (sendData) {
      this.setState({ loading: true });
      const valiRes = getResponse(
        await submitValidate({
          body: sendData,
          role: 'purchaser',
        })
      );
      this.setState({ loading: false });
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
    const { action } = this.state;
    // 添加金额隐藏逻辑
    if (billLineConfig[name].preEditor(record, action) && record.get('priceShiledFlag') !== 1) {
      return <NumberField onChange={(value) => this.onUpdateLine(value, record, name)} />;
    }
  };

  // 数量修改 ：️基准金额️ => 税额️ => 对方金额️ => 对方单价
  // 基准单价修改：️基准金额️ => 税额️ => 对方金额️ => 对方单价
  // 金额修改：基准金额修改 => 税额️ => 对方金额
  onUpdateLine = (value, record, name) => {
    const { amount, price } = this.state;
    const netPrice = record.get('netPrice');
    const taxIncludedPrice = record.get('taxIncludedPrice');
    const netAmount = record.get('netAmount');
    const taxIncludedAmount = record.get('taxIncludedAmount');
    const quantity = record.get('quantity');
    const unitPriceBatch = record.get('unitPriceBatch');
    const taxRate = math.div(record.get('taxRate'), 100);
    const netFlag = record.get('settleBasePrice') === 'NET_PRICE';
    if (name === 'netPrice' || (name === 'quantity' && netFlag)) {
      const newNetPrice = name === 'netPrice' ? math.toFixed(value, price) : netPrice;
      const newQuantity = name === 'quantity' ? value : quantity;
      // if (newQuantity == 1) debugger;
      const newNetAmount = math.toFixed(
        math.div(math.multipliedBy(newNetPrice, newQuantity), unitPriceBatch),
        amount
      );
      const newTaxAmount = math.toFixed(math.multipliedBy(newNetAmount, taxRate), amount);
      const newTaxIncludedAmount = math.toFixed(math.plus(newNetAmount, newTaxAmount), amount);
      const newTaxIncludedPrice = math.toFixed(
        math.multipliedBy(math.div(newTaxIncludedAmount, newQuantity), unitPriceBatch),
        price
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
      const newTaxAmount = math.toFixed(
        math.multipliedBy(newTaxIncludedAmountDivRate, taxRate),
        amount
      );
      const newNetAmount = math.toFixed(math.minus(newTaxIncludedAmount, newTaxAmount), amount);
      const newNetPrice = math.toFixed(
        math.multipliedBy(math.div(newNetAmount, newQuantity), unitPriceBatch),
        price
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
        ? math.toFixed(math.multipliedBy(newNetAmount, taxRate), amount)
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
  handlePrint = () => {
    this.setState({ loading: true });
    const { billHeaderId } = this.state;
    print({ billHeaderId }).then((res) => {
      if (!res) return;
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result;
        try {
          const failedInfo = JSON.parse(content);
          notification.error({
            description: failedInfo.message,
          });
          this.setState({ loading: false });
        } catch (e) {
          const file = new Blob([res], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          window.open(fileURL);
          this.setState({ loading: false });
        }
      };
      reader.readAsText(res);
    });
  };

  /**
   * 操作记录、审批记录
   * @param {*} record
   * @param {*} chargeHeaderId
   */
  openOprationModal = (record, billHeaderId) => {
    const recordModal = Modal.open({
      title: intl.get('hzero.common.button.operating').d('操作记录'),
      drawer: true,
      destroyOnClose: true,
      className: Styles['ssta-medium-modal'],
      children: <ReconciliationWorkbenchRecord record={record} billHeaderId={billHeaderId} />,
      footer: () => (
        <div className="footerContainer">
          <div className="close">
            <Button onClick={() => recordModal.close()} color="primary">
              {intl.get('hzero.common.button.close').d('关闭')}
            </Button>
          </div>
          {/* <div className="flowSheet">
            <Icon type="branch" />
            {intl.get('ssta.costSheet.model.costSheet.flowSheet').d('流程图')}
          </div> */}
        </div>
      ),
    });
  };

  /**
   * 字段隐藏渲染
   * @param {Object} param0 record 行记录 value 字段值 name 字段名称
   * @returns Any
   */
  priceShiledRender = ({ record, value, name }) =>
    record.get('priceShiledFlag') === 1
      ? record.get(`${name}Meaning`)
      : decimalPointAccuracy(value, record?.get('amountPrecision'), { repair: true, check: true });

  /**
   * 字段高亮显示 & 隐藏渲染
   * @param {Object} param0 record 行记录 value 字段值 name 字段名称
   * @returns Any
   */
  priceShiledRenderAndHighLight = ({ record, value, name }) => {
    // 判断应用页面
    const { action } = this.state;
    const {
      originData: { headerData },
    } = this.state;
    const { billStatus } = headerData;
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
          content={`${intl.get('ssta.common.view.message.beforeUpdate').d('更改前')}:${record.get(
            'orignPrice'
          )}`}
        >
          <span style={{ color: 'red' }}>
            {record.get('priceShiledFlag') === 1
              ? record.get(`${name}Meaning`)
              : amountLocalRender({ value })}
          </span>
        </Popover>
      );
    } else {
      return record.get('priceShiledFlag') === 1
        ? record.get(`${name}Meaning`)
        : amountLocalRender({ value });
    }
  };

  /**
   * 标题条件渲染
   * @returns String
   */
  titleRender = () => {
    const {
      action,
      originData: { headerData },
    } = this.state;
    // switch (action) {
    //   case 'UPDATE':
    //     return intl.get('ssta.reconciliationWorkbench.view.title.billDetailUpdate').d('对账单维护');
    //   case 'SYNC':
    //     return intl.get('ssta.reconciliationWorkbench.view.title.billDetailSync').d('对账单同步');
    //   case 'APPROVE':
    //     return this.formatHeaderTitle('APPROVE', billStatus, billNum, headerData);
    //   case 'CANCEL':
    //     return intl.get('ssta.reconciliationWorkbench.view.title.billDetailCancel').d('对账单取消');
    //   default:
    //     return this.formatHeaderTitle('ALL', billStatus, billNum, headerData);
    // }
    return this.formatHeaderTitle(action, headerData);
  };

  // 格式化类型为approve和all的header标题
  formatHeaderTitle = (type, headerData) => {
    const { billStatus, billNum, supplierViewFlag, confirmCollaborativeMode } = headerData;
    const { source } = queryString.parse(this.props.location.search.substring(1));
    // const title =
    //   type === 'APPROVE'
    //     ? intl.get('ssta.reconciliationWorkbench.view.title.billDetailApprove').d('对账单审核')
    //     : intl.get('ssta.reconciliationWorkbench.view.title.billDetailView').d('对账单查看');
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

    if (check) {
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

  /**
   * 行columns渲染
   */
  listColumnsRender = () => {
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
        renderer: amountLocalRender,
      },
      {
        name: 'enableAmountMeaning',
        width: 180,
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
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
        renderer: amountLocalRender,
      },
      {
        width: 100,
        name: 'sourceTaxIncludedPrice',
        renderer: amountLocalRender,
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
      {
        header: intl.get('hzero.common.button.docFlow').d('单据流'),
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
    const { action, billHeaderId, permsMap, notPub } = this.state;
    if (action === 'UPDATE') {
      return [
        (permsMap.get(`${permPrefix}.rowimport`) || !notPub) && (
          <Button onClick={this.handleRoleImport} funcType="flat" color="primary" icon="archive">
            {intl.get('ssta.common.button.batchUpdate').d('批量编辑')}
          </Button>
        ),
        (permsMap.get(`${permPrefix}.rowexport`) || !notPub) && (
          <ExcelExport
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
        (permsMap.get(`${permPrefix}.newrowimport`) || !notPub) && (
          <Import
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
        <Button
          icon="playlist_add"
          onClick={this.handleAdd}
          key="add"
          funcType="flat"
          color="primary"
        >
          {intl.get('hzero.common.button.add').d('新增')}
        </Button>,
        <Button
          icon="cancel"
          key="delete"
          onClick={this.handleCancelLines}
          disabled={isEmpty(this.tableDs.selected)}
          funcType="flat"
          color="primary"
        >
          {intl.get('hzero.common.button.cancel').d('取消')}
        </Button>,
      ];
    } else {
      return [
        (permsMap.get(`${permPrefix}.rowexport`) || !notPub) && (
          <ExcelExport
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
    return [
      {
        key: 'ReconciliationWorkbench-header',
        title: intl.get(`ssta.reconciliationWorkbench.view.message.panel.baseInfos`).d('基本信息'),
      },
      {
        key: 'ReconciliationWorkbench-tradingPartyInformation',
        title: intl
          .get(`ssta.reconciliationWorkbench.view.message.panel.tradingPartyInformation`)
          .d('交易方信息'),
      },
      {
        key: 'ReconciliationWorkbench-transactionAmountInformation',
        title: intl
          .get(`ssta.reconciliationWorkbench.view.message.panel.transactionAmountInformation`)
          .d('交易金额信息'),
      },
      {
        key: 'ReconciliationWorkbench-transactionDetailInformation',
        title: intl
          .get(`ssta.reconciliationWorkbench.view.message.panel.transactionDetails`)
          .d('交易明细信息'),
      },
      {
        key: 'ReconciliationWorkbench-settleConfigInfo',
        title: intl
          .get(`ssta.reconciliationWorkbench.view.message.panel.settleConfigInfo`)
          .d('主策略信息'),
      },
      {
        key: 'ReconciliationWorkbench-othersInf',
        title: intl.get(`ssta.reconciliationWorkbench.view.message.panel.othersInf`).d('其他信息'),
      },
      {
        key: 'ReconciliationWorkbench-attachment',
        title: intl.get(`ssta.reconciliationWorkbench.view.message.panel.attachment`).d('附件'),
      },
    ];
  };

  detailTabPaneRender = (billHeaderId) => {
    const {
      loading,
      editFlag,
      originData: {
        headerData: { billStatus, autoIssue },
      },
      action,
    } = this.state;
    const { customizeForm, customizeTable } = this.props;
    return (
      <Spin spinning={loading}>
        <Content>
          <h3 className="ssta-form-title" id="ReconciliationWorkbench-header">
            {intl.get(`ssta.reconciliationWorkbench.view.message.panel.baseInfos`).d('基本信息')}
          </h3>
          {customizeForm(
            { code: 'SSTA.PURCHASER_BILL_DETAIL.BASIC', readOnly: !editFlag },
            <Form
              columns={3}
              useColon={false}
              dataSet={this.formDs}
              labelLayout={action === 'UPDATE' ? 'float' : 'vertical'}
            >
              <FormItem name="billNum" disabled={action === 'UPDATE'} />
              <FormItem name="billStatus" editor="select" disabled={action === 'UPDATE'} />
              <FormItem name="camp" editor="select" disabled={action === 'UPDATE'} />
              <FormItem name="creationDate" disabled={action === 'UPDATE'} />
              <FormItem name="createdUserName" disabled={action === 'UPDATE'} />
            </Form>
          )}
        </Content>
        <Content>
          <h3 className="ssta-form-title">
            {intl
              .get(`ssta.reconciliationWorkbench.view.message.panel.tradingInformation`)
              .d('交易信息')}
          </h3>
          <Card
            id="ReconciliationWorkbench-tradingPartyInformation"
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl
              .get(`ssta.reconciliationWorkbench.view.message.panel.tradingPartyInformation`)
              .d('交易方信息')}
          >
            {customizeForm(
              { code: 'SSTA.PURCHASER_BILL_DETAIL.TRADING_PARTY', readOnly: !editFlag },
              <Form
                dataSet={this.formDs}
                columns={3}
                useColon={false}
                labelLayout={action === 'UPDATE' ? 'float' : 'vertical'}
              >
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
              </Form>
            )}
          </Card>
          <Card
            id="ReconciliationWorkbench-transactionAmountInformation"
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl
              .get(`ssta.reconciliationWorkbench.view.message.panel.transactionAmountInformation`)
              .d('交易金额信息')}
          >
            {customizeForm(
              { code: 'SSTA.PURCHASER_BILL_DETAIL.TRANSACTION_AMOUNT', readOnly: !editFlag },
              <Form
                columns={3}
                useColon={false}
                dataSet={this.formDs}
                labelLayout={action === 'UPDATE' ? 'float' : 'vertical'}
              >
                <FormItem
                  name="netAmountMeaning"
                  disabled={action === 'UPDATE'}
                  renderer={({ value, record }) => {
                    return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                      repair: true,
                      check: true,
                    });
                  }}
                />
                <FormItem
                  name="taxAmountMeaning"
                  disabled={action === 'UPDATE'}
                  renderer={({ value, record }) => {
                    return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                      repair: true,
                      check: true,
                    });
                  }}
                />
                <FormItem
                  name="taxIncludedAmountMeaning"
                  disabled={action === 'UPDATE'}
                  renderer={({ value, record }) => {
                    return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                      repair: true,
                      check: true,
                    });
                  }}
                />
              </Form>
            )}
          </Card>
          <Card
            bordered={false}
            id="ReconciliationWorkbench-transactionDetailInformation"
            className={DETAIL_CARD_CLASSNAME}
            title={intl
              .get(`ssta.reconciliationWorkbench.view.message.panel.transactionDetails`)
              .d('交易明细信息')}
          >
            {customizeTable(
              {
                code: 'SSTA.PURCHASER_BILL_DETAIL.TRANSACTION_DETAILS',
                readOnly: action !== 'UPDATE',
              },
              <SearchBarTable
                searchCode="SSTA.PURCHASER_BILL_DETAIL.TRANSACTION_DETAIL_SEARCH"
                buttons={this.getTableButtons()}
                dataSet={this.tableDs}
                columns={this.listColumnsRender()}
                queryBar="none"
                style={{ maxHeight: 360 }}
                maxPageSize={1000}
                pagination={{ pageSizeOptions: ['10', '50', '100', '500', '1000'] }}
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
          </Card>
        </Content>
        <Content>
          <h3 className="ssta-form-title" id="ReconciliationWorkbench-settleConfigInfo">
            {intl
              .get(`ssta.reconciliationWorkbench.view.message.panel.settleConfigInfo`)
              .d('主策略信息')}
          </h3>
          {customizeForm(
            { code: 'SSTA.PURCHASER_BILL_DETAIL.SETTLE_CONFIG', readOnly: !editFlag },
            <Form
              columns={3}
              useColon={false}
              dataSet={this.formDs}
              labelLayout={action === 'UPDATE' ? 'float' : 'vertical'}
            >
              <FormItem name="settleConfigNum" disabled={action === 'UPDATE'} />
              <FormItem name="settleConfigName" disabled={action === 'UPDATE'} />
              <FormItem name="configVersionNumber" disabled={action === 'UPDATE'} />
              {!editFlag ||
                (['NEW', 'RETURN', 'SUBMITED', 'SUBMITED_APPROVING', 'CONFIRM'].includes(
                  billStatus
                ) && (
                  <FormItem name="confirmCollaborativeModeMeaning" disabled={action === 'UPDATE'} />
                ))}
              {!editFlag ||
                (['NEW', 'RETURN', 'SUBMITED', 'SUBMITED_APPROVING', 'CONFIRM'].includes(
                  billStatus
                ) && (
                  <FormItem name="confirmApproveMethodMeaning" disabled={action === 'UPDATE'} />
                ))}
              <FormItem name="autoIssueMeaning" disabled={action === 'UPDATE'} />
              {!editFlag ||
                (['CANCELING', 'CANCEL_APPROVING', 'CONFIRM'].includes(billStatus) && (
                  <FormItem name="cancelCollaborativeModeMeaning" disabled={action === 'UPDATE'} />
                ))}
              {!editFlag ||
                (['CANCELING', 'CANCEL_APPROVING', 'CONFIRM'].includes(billStatus) && (
                  <FormItem name="cancelApproveMethodMeaning" disabled={action === 'UPDATE'} />
                ))}
              <FormItem
                name="lineLimitQuantity"
                disabled={action === 'UPDATE'}
                renderer={({ value, record }) => {
                  return record?.get('enableLineLimitFlag')
                    ? value
                    : intl.get('ssta.reconciliationWorkbench.view.message.noLimit').d('无限制');
                }}
              />
            </Form>
          )}
        </Content>
        <Content>
          <h3 className="ssta-form-title" id="ReconciliationWorkbench-othersInf">
            {intl.get(`ssta.reconciliationWorkbench.view.message.panel.othersInf`).d('其他信息')}
          </h3>
          {customizeForm(
            { code: 'SSTA.PURCHASER_BILL_DETAIL.OTHERS', readOnly: !editFlag },
            <Form
              columns={3}
              useColon={false}
              dataSet={this.formDs}
              labelLayout={action === 'UPDATE' ? 'float' : 'vertical'}
            >
              {['EC_BILL'].includes(autoIssue) && (
                <FormItem name="ecBillNum" disabled={action === 'UPDATE'} />
              )}
              <FormItem name="termCode" disabled={action === 'UPDATE'} />
              <FormItem name="invOrganizationName" disabled={action === 'UPDATE'} />
              <FormItem
                name="remark"
                editor="textarea"
                editable={action === 'UPDATE'}
                newLine
                colSpan={2}
              />
              {action !== 'CANCEL' && (
                <FormItem
                  name="canceledReason"
                  newLine
                  colSpan={2}
                  editor="textarea"
                  disabled={action === 'UPDATE'}
                />
              )}
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
                  ['CANCELING', 'CANCEL_APPROVING', 'WAIT_SUPPLIER_CANCEL'].includes(billStatus) &&
                  editFlag
                ) && (
                  <FormItem
                    name="canceledRemark"
                    newLine
                    colSpan={2}
                    editor="textarea"
                    disabled={action === 'UPDATE'}
                  />
                )}
              <FormItem name="sourceSettleNum" disabled={action === 'UPDATE'} />
              <FormItem name="purOrganizationName" disabled={action === 'UPDATE'} />
            </Form>
          )}
        </Content>
        <Content wrapperClassName="ssta-last-page-content-wrapper">
          <h3 className="ssta-form-title" id="ReconciliationWorkbench-attachment">
            {intl.get(`ssta.reconciliationWorkbench.view.message.panel.attachment`).d('附件')}
          </h3>
          {customizeForm(
            {
              code: 'SSTA.PURCHASER_BILL_DETAIL.ENCLOSURE',
              readOnly: !editFlag,
            },
            <Form
              columns={3}
              useColon={false}
              dataSet={this.formDs}
              labelLayout={action === 'UPDATE' ? 'float' : 'vertical'}
              className="ssta-form-form"
            >
              <Attachment
                dataSet={this.formDs}
                name="attachmentUuid"
                showHistory
                labelLayout="float"
                bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
                bucketDirectory="ssta-file-bucket"
                readOnly={action !== 'UPDATE'}
                downloadAll={action !== 'UPDATE'}
              />
            </Form>
          )}
        </Content>
      </Spin>
    );
  };

  linkToUpdateDetail = (action) => {
    const {
      history,
      location: { pathname, search },
    } = this.props;
    const { billHeaderId, billNum } = this.state;
    this.updateTabLink(
      queryString.stringify({
        action,
        editFlag: 1,
        billList: JSON.stringify([{ billHeaderId, billNum }]),
      }),
      {
        backPath: `${pathname}${search}`,
      }
    );
    history.push({
      pathname: '/ssta/reconciliation-workbench/detail',
      search: queryString.stringify({
        action,
        editFlag: 1,
        billList: JSON.stringify([{ billHeaderId, billNum }]),
      }),
      state: {
        backPath: `${pathname}${search}`,
      },
    });
  };

  formatHeaderBtn = () => {
    const {
      editFlag,
      loading,
      billHeaderId,
      action,
      type,
      originData: { headerData },
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
    } = headerData;
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
    if (readOnlyFlag) {
      return btnsFormat([operateBtn]);
    }
    const btns = [
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
      type &&
        ['NEW', 'RETURN'].includes(billStatus) &&
        headerData.camp === 'PURCHASER' && {
          name: 'edit',
          child: intl.get('hzero.common.button.edit').d('编辑'),
          btnProps: {
            icon: 'mode_edit',
            onClick: () => this.linkToUpdateDetail('UPDATE'),
            loading,
            permissionList: [
              {
                code:
                  'srm.settle-account.reconciliation-workbench.purchaser.ps.radio.button.update',
                type: 'button',
              },
            ],
          },
        },
      type &&
        ((billStatus === 'SUBMITED' &&
          confirmApproveMethod === 'FUNCTIONAL' &&
          (confirmCollaborativeMode === 'SINGLE' ||
            (confirmCollaborativeMode === 'DOUBLE' && headerData.camp === 'SUPPLIER'))) ||
          (billStatus === 'CANCELING' &&
            cancelApproveMethod === 'FUNCTIONAL' &&
            (cancelCollaborativeMode === 'SINGLE' ||
              (cancelCollaborativeMode === 'DOUBLE' && cancelCamp === 'SUPPLIER')))) && {
          name: 'approve',
          child: intl.get('ssta.common.button.approve').d('审核'),
          btnProps: {
            icon: 'authorize',
            onClick: () => this.linkToUpdateDetail('APPROVE'),
            loading,
            permissionList: [
              {
                code: 'srm.settle-account.reconciliation-workbench.purchaser.ps.radio.button.audit',
                type: 'button',
              },
            ],
          },
        },
      type &&
        billStatus === 'CONFIRM' &&
        autoIssue !== 'EC_BILL' &&
        !(billCancelType === 'ERP' && syncStatus === 'SYNC_SUCCESS') && {
          name: 'cancel',
          child: intl.get('hzero.common.button.cancel').d('取消'),
          btnProps: {
            icon: 'cancel',
            onClick: () => this.linkToUpdateDetail('CANCEL'),
            loading,
            permissionList: [
              {
                code:
                  'srm.settle-account.reconciliation-workbench.purchaser.ps.radio.button.cancel',
                type: 'button',
              },
            ],
          },
        },
      type &&
        ((billStatus === 'CONFIRM' && ['UNSYNCHRONIZED', 'SYNC_FAILURE'].includes(syncStatus)) ||
          (billStatus === 'CANCELING' && ['ERP_CANCEL_FAILURE'].includes(syncStatus))) &&
        Boolean(billSyncFlag) && {
          name: 'sync',
          child: intl.get('hzero.common.button.sync').d('同步'),
          btnProps: {
            icon: 'sync',
            onClick: () => this.linkToUpdateDetail('SYNC'),
          },
        },
      {
        name: 'print',
        child: intl.get('ssta.reconciliationWorkbench.view.button.print').d('打印'),
        btnProps: {
          icon: 'print',
          funcType: 'flat',
          color: 'default',
          onClick: () => Throttle(this.handlePrint(), 2000),
          loading,
        },
      },
      operateBtn,
    ];
    return btnsFormat(btns);
  };

  /**
   * 渲染函数
   * @returns Element
   */
  render() {
    const { billHeaderId, billList, listFlag, notPub } = this.state;
    const {
      location: { state },
      customizeBtnGroup,
    } = this.props;
    if (billHeaderId && !this.formDs.current?.get('billHeaderId')) return <Spin />;
    return (
      <Fragment>
        <Header
          title={this.titleRender()}
          backPath={notPub ? state?.backPath || '/ssta/reconciliation-workbench/list' : null}
          onBack={() => {
            if (notPub && state?.backPath) {
              this.updateTabLink(state?.backPath.split('?')[1], null);
            }
          }}
        >
          {customizeBtnGroup(
            { code: 'SSTA.PURCHASER_BILL_DETAIL.HEADER_BTNS', pro: true },
            <DynamicButtons buttons={this.formatHeaderBtn()} />
          )}
        </Header>
        <div
          className={Styles['ssta-detail-content']}
          id="ssta-detail-content-ReconciliationWorkbench"
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
          <FixedAnchor
            linkList={this.linkListRender()}
            className="ssta-detail-content-ReconciliationWorkbench"
          />
        </div>
      </Fragment>
    );
  }
}
