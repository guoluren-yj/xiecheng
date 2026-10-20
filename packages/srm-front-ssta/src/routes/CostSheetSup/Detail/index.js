/* eslint-disable react/no-did-update-set-state */
/* @Description:
 * @Date: 2020-07-23 10:35:55
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { DataSet, Button, Form, Output, Modal, Attachment, Spin } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import querystring from 'querystring';
import { observer } from 'mobx-react';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import notification from 'utils/notification';

import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import { Header, Content } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';
import { getActiveTabKey, updateTab } from 'hzero-front/lib/utils/menuTab';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { btnsFormat } from '@/utils/utils';
import { FixedAnchor, FormItem, OperationApprove, getPermissions } from '@/routes/Components';
import { decimalPointAccuracy } from '@/routes/utils';
import { getDetail, amount, approveResolve, approveReject } from '@/services/costSheetSupService';
import Styles from '@/routes/common.less';
import { formDs, tableDs } from './mainDS';
import ExeResult from './ExeResult';
import FilledInfoModal from './FilledInfoModal';

// 租户id
const tenantId = getCurrentOrganizationId();

// 权限编码前缀
const permPrefix = `srm.settle-account.cost-sheet-sup-cost-sheet.ps.radio.button`;

const unitCode = [
  'SSTA.COST_SHEET_SUP_DETAIL.BASIC', // 费用单工作台详情-基本信息
  'SSTA.COST_SHEET_SUP_DETAIL.TRADINGPARTY', // 费用单工作台详情-交易方信息
  'SSTA.COST_SHEET_SUP_DETAIL.TRANSACTIONAMOUNT', // 费用单工作台详情-交易金额信息
  'SSTA.COST_SHEET_SUP_DETAIL.TRANSACTIONDETAIL', // 费用单工作台详情-交易明细信息
  'SSTA.COST_SHEET_SUP_DETAIL.OTHERS', // 费用单工作台详情-其他信息
  'SSTA.COST_SHEET_SUP_DETAIL.ENCLOSURE', // 费用单工作台详情-附件
  'SSTA.COST_SHEET_SUP_DETAIL.OTHERS.WORKFLOW',
  'SSTA.COST_SHEET_SUP_DETAIL.HEADER_BTNS',
  'SSTA.COST_SHEET_SUP_DETAIL.CONFIRM',
  'SSTA.COST_SHEET_SUP_DETAIL.RETURN',
];
const customizeUnitCode = unitCode.join();

@withCustomize({
  unitCode,
})
@formatterCollections({
  code: [
    'ssta.costSheet',
    'entity.attachment',
    'ssta.settlePool',
    'sbud.budgeting',
    'hwfp.common',
    'hzero.common',
  ],
})
@observer
export default class Detail extends PureComponent {
  /**
   * 查看执行情况弹窗
   */
  modal = null;

  /**
   * 头 DataSet
   */
  formDs = new DataSet(formDs(this));

  /**
   * 行 DataSet
   */
  tableDs = new DataSet(tableDs());

  /**
   * Creates an instance of Detail
   * @params {Object} props 属性
   */
  constructor(props) {
    super(props);
    const routerParams = querystring.parse(props.location.search.substr(1));
    const isPub = Number(props.location.pathname.indexOf('/pub/'));
    const {
      chargeHeaderId = null,
      updateFlag = 0,
      reverseFlag = 0,
      approveFlag = 0,
    } = routerParams;

    /**
     * 内部状态
     */
    this.state = {
      chargeHeaderId,
      updateFlag,
      editFlag: false,
      loading: true,
      chargeStatus: 'NEW',
      reverseFlag,
      approveFlag,
      readOnly: !(Number(reverseFlag) || Number(approveFlag) || Number(updateFlag)),
      isPub,
      permsMap: props.permsMap || new Map(), // 权限集数据 map
    };
  }

  /**
   * 组件挂载后触发方法
   */
  componentDidMount() {
    this.tableDs.init = this.init;
    this.init();
    this.getPermissions();
  }

  /**
   * 获取权限集数据
   */
  getPermissions = async () => {
    const data = await getPermissions([`${permPrefix}.audit`]);
    if (data) {
      this.setState({
        permsMap: data,
      });
    }
  };

  componentDidUpdate(preProps) {
    const { chargeStatus } = this.state;
    if (preProps.location.search !== this.props.location.search) {
      const routerParams = querystring.parse(this.props.location.search.substr(1));

      const {
        chargeHeaderId = null,
        updateFlag = 0,
        reverseFlag = 0,
        approveFlag = 0,
      } = routerParams;

      this.setState({
        chargeHeaderId,
        updateFlag,
        reverseFlag,
        approveFlag,
        readOnly: !(Number(reverseFlag) || Number(approveFlag) || Number(updateFlag)),
        editFlag:
          Number(updateFlag) === 0 &&
          Number(reverseFlag) === 1 &&
          ['SUBMITTED'].includes(chargeStatus),
      });
    }
  }

  /**
   * 页面初始化查询
   */
  init = async () => {
    const { chargeHeaderId, updateFlag, approveFlag, reverseFlag } = this.state;
    this.formDs.approveFlag = approveFlag;
    if (chargeHeaderId) {
      this.setState({ loading: true });
      const res = getResponse(await getDetail(chargeHeaderId, customizeUnitCode));
      if (res) {
        const {
          chargeStatus = 'NEW',
          taxIncludedEnableFlag = 0,
          currencyCode,
          companyId,
          supplierCompanyId,
          taxAmountUpdateFlag = 0,
          supplierId,
          ouId,
          camp,
          approveMethod,
          collaborativeMode,
        } = res;
        this.addEvents(currencyCode);
        this.tableDs.addField('currencyCode', {
          type: 'string',
          defaultValue: currencyCode,
        });
        this.tableDs.addField('companyId', {
          type: 'string',
          defaultValue: companyId,
        });
        this.tableDs.addField('taxIncludedEnableFlag', {
          name: 'taxIncludedEnableFlag',
          defaultValue: taxIncludedEnableFlag,
        });
        this.tableDs.addField('taxAmountUpdateFlag', {
          type: 'string',
          defaultValue: taxAmountUpdateFlag,
        });
        this.tableDs.addField('supplierCompanyId', {
          type: 'string',
          defaultValue: supplierCompanyId,
        });
        this.tableDs.addField('supplierId', {
          type: 'string',
          defaultValue: supplierId,
        });
        this.tableDs.addField('ouId', {
          type: 'string',
          defaultValue: ouId,
        });
        if (
          (Number(updateFlag) === 1 && ['NEW', 'UPDATE', 'RETURNED'].includes(chargeStatus)) ||
          (Number(updateFlag) === 0 &&
            Number(reverseFlag) === 1 &&
            ['SUBMITTED'].includes(chargeStatus))
        ) {
          this.setState({
            editFlag: true,
          });
        }
        this.setState({
          camp,
          loading: false,
          chargeStatus,
          approveMethod,
          collaborativeMode,
        });
        this.formDs.loadData([{ ...res }]);
      }
    } else {
      this.formDs.supplierEditFlag = true;
      this.setState({
        editFlag: true,
        loading: false,
      });
    }
  };

  /**
   * 行表格添加监听函数
   * @param {Number} currencyCode 币种精度
   */
  addEvents = async (currencyCode) => {
    try {
      const res = getResponse(await amount(currencyCode));
      if (res && !res.failed) {
        const { amount: amount1 } = res;
        this.tableDs.addEventListener('update', ({ record, name, value }) => {
          const taxIncludedEnableFlag = Number(record.get('taxIncludedEnableFlag')); // 1->含税价 0->不含税价
          const taxAmountUpdateFlag = Number(record.get('taxAmountUpdateFlag')); // 1->允许修改税额 0->不允许修改税额
          const netAmount = record.get('netAmount') || 0; // 不含税金额
          const taxIncludedAmount = record.get('taxIncludedAmount') || 0; // 含税金额
          const taxRate = Number(record.get('taxRate') || 0) / 100;
          let taxAmount = 0; // 税额

          /**
           *  taxAmountUpdateFlag = 0 , taxIncludedEnableFlag = 0 ,  taxIncludedAmount = netAmount*taxRate, taxAmount = taxIncludedAmount-netAmount
           *  taxAmountUpdateFlag = 0 , taxIncludedEnableFlag = 1 ,  税额taxAmount=round（含税金额taxIncludedAmount/（1+税率taxRate）*税率taxRate，2） 不含税金额netAmount=含税金额taxIncludedAmount-税额taxAmount
           */

          if (taxIncludedEnableFlag === 0 && name === 'netAmount') {
            taxAmount = math.toFixed(math.multipliedBy(netAmount, taxRate), amount1);
            record.set('taxAmount', taxAmount);
            record.set('taxIncludedAmount', math.toFixed(math.plus(taxAmount, netAmount), amount1));
          }
          if (taxIncludedEnableFlag === 1 && name === 'taxIncludedAmount') {
            const taxIncludedAmountDevRate = math.div(taxIncludedAmount, math.plus(1, taxRate));
            taxAmount = math.toFixed(math.multipliedBy(taxIncludedAmountDevRate, taxRate), amount1);
            record.set('taxAmount', taxAmount);
            record.set(
              'netAmount',
              math.toFixed(math.minus(taxIncludedAmount, taxAmount), amount1)
            );
          }
          if (taxAmountUpdateFlag === 1 && name === 'taxAmount') {
            const taxAmount1 = record.get('taxAmount') || 0;
            if (taxIncludedEnableFlag === 1) {
              record.set(
                'netAmount',
                math.toFixed(math.minus(taxIncludedAmount, taxAmount1), amount1)
              );
            }
            if (taxIncludedEnableFlag === 0) {
              record.set(
                'taxIncludedAmount',
                math.toFixed(math.plus(netAmount, taxAmount1), amount1)
              );
            }
          }
          if (taxIncludedEnableFlag === 0 && name === 'taxRateLov') {
            taxAmount = math.toFixed(math.multipliedBy(netAmount, taxRate), amount1);
            const taxIncludedAmount1 = math.toFixed(math.plus(taxAmount, netAmount), amount1);
            record.set('taxAmount', taxAmount);
            record.set('taxIncludedAmount', taxIncludedAmount1);
          }
          if (taxIncludedEnableFlag === 1 && name === 'taxRateLov') {
            const taxIncludedAmountDevRate = math.div(taxIncludedAmount, math.plus(1, taxRate));
            taxAmount = math.toFixed(math.multipliedBy(taxIncludedAmountDevRate, taxRate), amount1);
            const netAmount1 = math.toFixed(math.minus(taxIncludedAmount, taxAmount), amount1);
            record.set('taxAmount', taxAmount);
            record.set('netAmount', netAmount1);
          }
          if (['taxAmount', 'taxIncludedAmount', 'netAmount'].includes(name)) {
            record.set(name, math.toFixed(value, amount1));
          }
        });
      }
    } catch (error) {
      notification.error({ description: error });
    }
  };

  /**
   * 操作记录、审批记录
   * @param {*} record
   * @param {*} chargeHeaderId
   */
  openOprationModal = (record, chargeHeaderId) => {
    const recordModal = Modal.open({
      title: intl.get('hzero.common.button.operating').d('操作记录'),
      drawer: true,
      destroyOnClose: true,
      className: Styles['ssta-medium-modal'],
      children: <OperationApprove record={record} chargeHeaderId={chargeHeaderId} />,
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
   * 获取接口数据
   * @returns 数据
   */
  getSendData = async () => {
    this.formDs.current.status = 'add';
    const headerValidateFlag = await this.formDs.current?.validate(true);
    const linesValidateFlag = await this.tableDs.validate();
    if (headerValidateFlag && linesValidateFlag) {
      const headerData = this.formDs.toData()[0] ? this.formDs.toData()[0] : {};
      const lineData = this.tableDs.toData() ? this.tableDs.toData() : [];
      const sendData = {
        ...headerData,
        chargeLineList: lineData,
      };
      return sendData;
    } else {
      return false;
    }
  };

  /**
   * 响应弹窗
   * @param {Function} reqFun 请求函数
   * @param {Object} sendData 请求数据
   */
  handleFilledInfoOk = async (reqFun, sendData) => {
    const { history } = this.props;
    this.setState({ loading: true });
    const res = getResponse(await reqFun({ ...sendData, customizeUnitCode }));
    this.setState({ loading: false });
    if (res) {
      notification.success();
      history.push({
        pathname: '/ssta/cost-sheet-sup/list',
        state: { _back: 1 },
      });
    }
  };

  /**
   * 响应操作
   * @param {Function} reqFun 接口方法
   * @Modal
   */
  handleOpr = (reqFun, action) => {
    const { customizeForm, custConfig } = this.props;
    Modal.open({
      drawer: true,
      key: Modal.key(),
      closable: true,
      className: Styles['ssta-small-modal'],
      title: intl.get(`ssta.costSheet.view.message.panel.approveInfo`).d('审核信息'),
      children: (
        <FilledInfoModal
          reqFun={reqFun}
          action={action}
          headerDS={this.formDs}
          custConfig={custConfig}
          customizeForm={customizeForm}
          onOk={this.handleFilledInfoOk}
        />
      ),
    });
  };

  updateTabLink = (search, state) => {
    updateTab({
      key: getActiveTabKey(),
      search,
      state,
    });
  };

  linkToApproveDetail = () => {
    const {
      history,
      location: { pathname, search },
    } = this.props;
    const { chargeHeaderId } = this.state;
    this.updateTabLink(
      querystring.stringify({
        chargeHeaderId,
        updateFlag: 0,
        approveFlag: 1,
      }),
      {
        backPath: `${pathname}${search}`,
      }
    );
    history.push({
      pathname: '/ssta/cost-sheet-sup/detail',
      search: querystring.stringify({
        chargeHeaderId,
        updateFlag: 0,
        approveFlag: 1,
      }),
      state: {
        backPath: `${pathname}${search}`,
      },
    });
  };

  /**
   * 响应点击查看执行情况
   * @param {Object} record 行记录
   */
  viewExeResult = (record) => {
    const title = intl.get(`ssta.costSheet.view.message.panel.viewexeresult`).d('查看执行情况');
    const { chargeHeaderId } = this.state;
    const { history } = this.props;
    this.modal = Modal.open({
      key: 'viewexeresult',
      // mask: false,
      drawer: true,
      destroyOnClose: true,
      closable: true,
      className: Styles['ssta-medium-modal'],
      title,
      children: (
        <ExeResult
          record={record}
          chargeHeaderId={chargeHeaderId}
          history={history}
          closeExeResult={this.closeExeResult}
        />
      ),
    });
  };

  /**
   * 响应关闭执行情况弹窗
   */
  closeExeResult = () => {
    if (this.modal) {
      this.modal.close();
    }
  };

  /**
   *  标题条件渲染
   */
  titleRender = () => {
    const { reverseFlag, approveFlag, updateFlag, readOnly } = this.state;
    if (readOnly) {
      return intl.get(`ssta.costSheet.view.title.costView`).d('费用单查看');
    } else if (Number(updateFlag)) {
      return intl.get(`ssta.costSheet.view.title.costUpdate`).d('费用单维护');
    } else if (Number(approveFlag)) {
      return intl.get(`ssta.costSheet.view.title.costApprove`).d('费用单审核');
    } else if (Number(reverseFlag)) {
      return intl.get(`ssta.costSheet.view.title.costReverse`).d('费用单冲销');
    }
  };

  /**
   *  头按钮组
   */
  headerBtns = () => {
    const {
      camp,
      permsMap,
      chargeStatus,
      collaborativeMode,
      approveFlag,
      loading,
      editFlag,
      approveMethod,
      chargeHeaderId,
    } = this.state;
    const allBtns = [
      permsMap.get(`${permPrefix}.audit`) &&
        ((chargeStatus === 'SUBMITTED' &&
          camp === 'PURCHASER' &&
          approveMethod === 'FUNCTIONAL' &&
          collaborativeMode === 'DOUBLE') ||
          chargeStatus === 'SUPPLIER_TO_BE_CONFIRMED') &&
        Number(approveFlag) === 0 && {
          name: 'approve',
          child: intl.get('ssta.costSheet.view.button.approve').d('审核'),
          btnProps: {
            type: 'c7n-pro',
            icon: 'authorize',
            onClick: () => this.linkToApproveDetail(),
          },
        },
      Number(approveFlag) === 1 && {
        name: 'approveResolve',
        child: intl.get('ssta.costSheet.view.button.approveResolve').d('确认'),
        btnProps: {
          icon: 'check',
          loading,
          onClick: () => this.handleOpr(approveResolve, 'CONFIRM'),
        },
      },
      Number(approveFlag) === 1 && {
        name: 'approveReject',
        child: intl.get('ssta.costSheet.view.button.approveReject').d('退回'),
        btnProps: {
          icon: 'close',
          loading,
          onClick: () => this.handleOpr(approveReject, 'RETURN'),
        },
      },
      !editFlag && {
        name: 'export',
        btnComp: ExcelExport,
        btnProps: {
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            permissionList: [
              {
                code: `srm.settle-account.cost-sheet-sup-cost-sheet.ps.detailexport`,
                type: 'button',
              },
            ],
          },
          requestUrl: `/ssta/v1/${getCurrentOrganizationId()}/charge-headers/detail/export`,
          queryParams: { chargeHeaderId },
        },
      },
      !editFlag && {
        name: 'newExport',
        btnComp: ExcelExportPro,
        childFor: 'buttonText',
        child: intl.get('hzero.common.button.newExport').d('(新)导出'),
        btnProps: {
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            permissionList: [
              {
                code: `srm.settle-account.cost-sheet-sup-cost-sheet.ps.newdetailexport`,
                type: 'button',
              },
            ],
          },
          requestUrl: `/ssta/v1/${getCurrentOrganizationId()}/charge-headers/detail/export`,
          queryParams: { chargeHeaderId },
          templateCode: 'SSTA_CHARGE_DETAIL_SUPPLIER_EXPORT',
        },
      },
      chargeHeaderId && {
        name: 'operationRecord',
        child: intl.get('ssta.costSheet.view.button.operationRecord').d('操作记录'),
        btnProps: {
          icon: 'operation_service_request',
          loading,
          onClick: () => this.openOprationModal(this.formDs.current, chargeHeaderId),
        },
      },
    ];
    return btnsFormat(allBtns);
  };

  /**
   * 渲染方法
   * @returns Element
   */
  render() {
    const {
      customizeForm,
      customizeTable,
      customizeBtnGroup,
      location: { state },
    } = this.props;
    const {
      editFlag,
      chargeHeaderId,
      chargeStatus,
      approveFlag,
      updateFlag,
      readOnly,
      isPub,
    } = this.state;
    if (chargeHeaderId && !this.formDs.current?.get('chargeHeaderId')) return <Spin />;
    const {
      companyId,
      supplierCompanyId,
      currencyCode,
      // displayWorkflowHisFlag,
      ouId,
      amountPrecision,
    } = this.formDs.current?.toData() || {};
    const listColumns = [
      {
        name: 'costIdLov',
        width: 120,
        editor: editFlag,
      },
      {
        name: 'lineNum',
        width: 100,
      },
      {
        name: 'chargeLov',
        width: 120,
        editor: editFlag,
      },
      {
        name: 'chargeName',
        width: 120,
      },
      {
        name: 'netAmount', // 不含税金额
        width: 120,
        align: 'right',
        editor: editFlag,
        renderer: ({ value }) => {
          return decimalPointAccuracy(value, amountPrecision, {
            repair: true,
            check: true,
          });
        },
      },
      {
        name: 'taxRateLov',
        width: 120,
        align: 'right',
        editor: editFlag,
        renderer: ({ record }) => (record.toData().taxRate === 0 ? '0' : record.toData().taxRate),
      },
      {
        name: 'taxAmount', // 税额
        width: 120,
        align: 'right',
        editor: editFlag,
        renderer: ({ value }) => {
          return decimalPointAccuracy(value, amountPrecision, {
            repair: true,
            check: true,
          });
        },
      },
      {
        name: 'taxIncludedAmount', // 含税金额
        width: 120,
        align: 'right',
        editor: editFlag,
        renderer: ({ value }) => {
          return decimalPointAccuracy(value, amountPrecision, {
            repair: true,
            check: true,
          });
        },
      },
      {
        name: 'pcNumLov',
        width: 120,
        editor: editFlag,
      },
      {
        name: 'poNumLov',
        width: 120,
        editor: editFlag,
      },
      {
        name: 'lineRemarks',
        width: 150,
        editor: editFlag,
      },
      {
        name: 'treatmentMethod',
        width: 150,
        editor: editFlag,
      },
      !editFlag && {
        name: 'reverseLineNum',
        width: 150,
      },
      !editFlag && {
        name: 'pushSettleStatusMeaning',
        width: 150,
      },
      !editFlag && {
        name: 'pushBackMsg',
        width: 150,
        tooltip: 'overflow',
      },
      !editFlag &&
        ['REVERSED', 'COMPLETED'].includes(chargeStatus) && {
          name: 'opr',
          width: 150,
          renderer: ({ record }) => (
            <a onClick={() => this.viewExeResult(record)}>
              {intl.get(`ssta.costSheet.view.message.panel.viewexeresult`).d('查看执行情况')}
            </a>
          ),
        },
    ];
    const linkList = [
      {
        key: 'CostSheetSup-header',
        title: intl.get(`ssta.costSheet.view.message.panel.baseInfos`).d('基本信息'),
      },
      {
        key: 'CostSheetSup-tradingPartyInformation',
        title: intl
          .get(`ssta.costSheet.view.message.panel.tradingPartyInformation`)
          .d('交易方信息'),
      },
      {
        key: 'CostSheetSup-transactionAmountInformation',
        title: intl
          .get(`ssta.costSheet.view.message.panel.transactionAmountInformation`)
          .d('交易金额信息'),
      },
      {
        key: 'CostSheetSup-transactionDetailInformation',
        title: intl.get(`ssta.costSheet.view.message.panel.transactionDetails`).d('交易明细信息'),
      },
      {
        key: 'CostSheetSup-othersInf',
        title: intl.get(`ssta.costSheet.view.message.panel.othersInf`).d('其他信息'),
      },
      {
        key: 'CostSheetSup-attachment',
        title: intl.get(`ssta.costSheet.view.message.panel.attachment`).d('附件'),
      },
    ];
    return (
      <Fragment>
        <Header
          title={this.titleRender()}
          backPath={state?.backPath || '/ssta/cost-sheet-sup/list'}
          onBack={() => {
            if (state?.backPath) {
              this.updateTabLink(state?.backPath.split('?')[1], null);
            }
          }}
        >
          {customizeBtnGroup(
            { code: 'SSTA.COST_SHEET_SUP_DETAIL.HEADER_BTNS', pro: true },
            <DynamicButtons buttons={this.headerBtns()} />
          )}
        </Header>
        <div className={Styles['ssta-detail-content']} id="ssta-detail-content-CostSheetSup">
          <Content>
            <h3 className="ssta-form-title" id="CostSheetSup-header">
              {intl.get(`ssta.costSheet.view.message.panel.baseInfos`).d('基本信息')}
            </h3>
            {customizeForm(
              { code: 'SSTA.COST_SHEET_SUP_DETAIL.BASIC', readOnly },
              <Form dataSet={this.formDs} columns={3} labelLayout="vertical" useColon={false}>
                <Output name="chargeNum" />
                <Output name="chargeStatus" />
                <Output name="createdByName" />
                <Output name="creationDate" />
                <Output name="chargeHeaderSourceMeaning" />
                <Output name="reverseStatus" />
                <Output name="reverseNum" />
              </Form>
            )}
          </Content>
          <Content>
            <h3 className="ssta-form-title">
              {intl.get(`ssta.costSheet.view.message.panel.tradingInformation`).d('交易信息')}
            </h3>
            <Card
              bordered={false}
              id="CostSheetSup-tradingPartyInformation"
              className={DETAIL_CARD_CLASSNAME}
              title={intl
                .get(`ssta.costSheet.view.message.panel.tradingPartyInformation`)
                .d('交易方信息')}
            >
              {customizeForm(
                { code: 'SSTA.COST_SHEET_SUP_DETAIL.TRADINGPARTY', readOnly },
                <Form dataSet={this.formDs} columns={3} labelLayout="vertical" useColon={false}>
                  <Output name="companyNum" />
                  <Output name="companLov" />
                  <Output name="currencyLov" />
                  <Output name="displaySupplierNum" />
                  <Output name="supplierCompanyLov" />
                  <Output name="ouNameLov" />
                  <Output name="supplierSiteLov" />
                </Form>
              )}
            </Card>
            <Card
              bordered={false}
              id="CostSheetSup-transactionAmountInformation"
              className={DETAIL_CARD_CLASSNAME}
              title={intl
                .get(`ssta.costSheet.view.message.panel.transactionAmountInformation`)
                .d('交易金额信息')}
            >
              {customizeForm(
                { code: 'SSTA.COST_SHEET_SUP_DETAIL.TRANSACTIONAMOUNT', readOnly },
                <Form dataSet={this.formDs} columns={3} labelLayout="vertical" useColon={false}>
                  <Output
                    name="netAmount"
                    renderer={({ value, record }) => {
                      return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                        repair: true,
                        check: true,
                      });
                    }}
                  />
                  <Output
                    name="taxAmount"
                    renderer={({ value, record }) => {
                      return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                        repair: true,
                        check: true,
                      });
                    }}
                  />
                  <Output
                    name="taxIncludedAmount"
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
            {chargeHeaderId && (
              <Card
                bordered={false}
                id="CostSheetSup-transactionDetailInformation"
                className={DETAIL_CARD_CLASSNAME}
                title={intl
                  .get(`ssta.costSheet.view.message.panel.transactionDetails`)
                  .d('交易明细信息')}
              >
                {customizeTable(
                  { code: 'SSTA.COST_SHEET_SUP_DETAIL.TRANSACTIONDETAIL', readOnly },
                  <SearchBarTable
                    searchCode="SSTA.COST_SHEET_SUP_DETAIL.TRANSACTION_DETAIL_SEARCH"
                    columns={listColumns}
                    dataSet={this.tableDs}
                    queryFieldsLimit={3}
                    searchBarConfig={{
                      closeFilterSelector: true,
                      onQuery: ({ params }) => {
                        this.tableDs.queryDataSet.loadData([{ ...params, chargeHeaderId }]);
                        this.tableDs.query();
                      },
                      fieldProps: {
                        chargeCode: { lovPara: { tenantId } },
                        poNum: {
                          lovPara: {
                            tenantId,
                            currencyCode,
                            companyId,
                            supplierCompanyId,
                            ouId,
                          },
                        },
                        pcNum: {
                          lovPara: {
                            tenantId,
                            currencyCode,
                            companyId,
                            supplierCompanyId,
                            ouId,
                          },
                        },
                        taxCode: {
                          lovPara: {
                            companyId,
                            supplierCompanyId,
                            source: 'EXPENSE',
                          },
                        },
                        costId: {
                          lovPara: {
                            tenantId,
                            currencyCode,
                            companyId,
                            supplierCompanyId,
                          },
                        },
                      },
                    }}
                  />
                )}
              </Card>
            )}
          </Content>
          <Content>
            <h3 className="ssta-form-title" id="CostSheetSup-othersInf">
              {intl.get(`ssta.costSheet.view.message.panel.othersInf`).d('其他信息')}
            </h3>
            {customizeForm(
              { code: 'SSTA.COST_SHEET_SUP_DETAIL.OTHERS', readOnly },
              <Form
                dataSet={this.formDs}
                columns={3}
                useColon={false}
                labelLayout={editFlag ? 'float' : 'vertical'}
              >
                <FormItem
                  newLine
                  colSpan={2}
                  name="remarks"
                  editor="textarea"
                  resize="both"
                  editable={editFlag}
                />
                {!['NEW', 'UPDATE'].includes(chargeStatus) && !Number(approveFlag) && (
                  <FormItem
                    newLine
                    colSpan={2}
                    name="approvalOpinions"
                    editor="textarea"
                    resize="both"
                    editable={
                      Number(approveFlag) || (Number(updateFlag) && chargeStatus === 'RETURNED')
                    }
                    disabled={Number(updateFlag)}
                  />
                )}
              </Form>
            )}

            {customizeForm(
              { code: 'SSTA.COST_SHEET_SUP_DETAIL.OTHERS.WORKFLOW', readOnly: isPub !== 0 },
              <Form
                dataSet={this.formDs}
                columns={3}
                style={{ marginTop: 10 }}
                useColon={false}
                labelLayout={isPub === 0 ? 'float' : 'vertical'}
              />
            )}
          </Content>
          <Content wrapperClassName="ssta-last-page-content-wrapper">
            <h3 className="ssta-form-title" id="CostSheetSup-attachment">
              {intl.get(`ssta.costSheet.view.message.panel.attachment`).d('附件')}
            </h3>
            {
              ({
                code: 'SSTA.COST_SHEET_SUP_DETAIL.ENCLOSURE',
              },
              (
                <Form
                  dataSet={this.formDs}
                  columns={3}
                  useColon={false}
                  labelLayout={editFlag ? 'float' : 'vertical'}
                  className="ssta-form-form"
                >
                  <Attachment
                    name="chargeUuid"
                    showHistory={!editFlag}
                    labelLayout="float"
                    readOnly={!editFlag}
                    bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
                    bucketDirectory="ssta-file-bucket"
                  />
                </Form>
              ))
            }
          </Content>
          <FixedAnchor linkList={linkList} className="ssta-detail-content-CostSheetSup" />
        </div>
      </Fragment>
    );
  }
}
