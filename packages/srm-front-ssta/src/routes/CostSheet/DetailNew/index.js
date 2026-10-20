/* eslint-disable react/no-did-update-set-state */
/* @Description:
 * @Date: 2020-07-23 10:35:55
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { DataSet, Button, Form, Modal, Attachment, Spin, Lov } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import querystring from 'querystring';
import { observer } from 'mobx-react';
import { math } from 'choerodon-ui/dataset';
import { checkPrintWindow, getPdfPreviewUrl } from 'srm-front-boot/lib/utils/utils';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import PrintProButton from '_components/PrintProButton';
import DocFlow from '_components/DocFlow';
import { queryIdpValue } from 'services/api';
// import Import from 'components/Import';

import { Header } from 'components/Page';
import SupplierLov from '_components/SupplierLov';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import DynamicButtons from 'srm-front-boot/lib/components/DynamicButtons';
import { getActiveTabKey, updateTab } from 'hzero-front/lib/utils/menuTab';
import {
  formatDynamicBtns,
  formatNumber,
  getSelectedNegActConfirmMsg,
  confirmDocNegAction,
} from '@/utils/utils';
import { FormItem, OperationApprove, getPermissions, NavigationAnchor } from '@/routes/Components';
import { confirmModal } from '@/routes/Components/ConfirmModal';
import { formatErrorInfo } from '@/routes/Components/ErrorInfo';
import { statusTagRender } from '@/utils/renderer';
import {
  getDetail,
  save,
  completed,
  cancel,
  reverse,
  approveResolve,
  approveReject,
  userDefaults,
  sync,
  print,
  submitValidate,
  copy,
  getDefaultFromCompany,
  getDefaultFromPurOrg,
  getClaimInfo,
  revoke,
} from '@/services/costSheetService';
import { queryUnifyIdpValue } from 'hzero-front/lib/services/api';
import Summary from '@/routes/Components/Summary';
import Styles from '@/routes/common.less';
import { formItemRender } from '@/utils/renderer';
import { getCuszTemplate, getSupLovConfig } from '@/utils/api';
import withRemote from 'hzero-front/lib/utils/remote';
import style from './index.less';
import { formDs, tableDs } from './mainDS';
import ExeResult from './ExeResult';
import SourceDocument from './SourceDocument';
import FilledInfoModal from './FilledInfoModal';
import { tagColor } from '../../ReconciliationWorkbench/dic';
import WorkflowCard from './WorkflowCard';
import WorkflowCaller from '@/components/WorkflowCaller';

const { Panel } = Collapse;

// 租户id
const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

// 权限编码前缀
const permPrefix = `srm.settle-account.cost-sheet.ux-cost-sheet.ps.radio.button`;
const permPrefixBtn = `srm.settle-account.cost-sheet.ux-cost-sheet.button`;

const headUnitCodes = [
  'SSTA.COST_SHEET_DETAIL.BASIC_INFO',
  'SSTA.COST_SHEET_DETAIL.OTHERS_INFO',
  'SSTA.COST_SHEET_DETAIL.ENCLOSURE',
  'SSTA.COST_SHEET_DETAIL.OTHERS.WORKFLOW',
  'SSTA.COST_SHEET_DETAIL.CONFIRM',
  'SSTA.COST_SHEET_DETAIL.RETURN',
  'SSTA.COST_SHEET_DETAIL.REVERSE',
  'SSTA.COST_SHEET_DETAIL.FLOW_BASIC_CARD',
  'SSTA.COST_SHEET_DETAIL.FLOW_EXTRA_CARD',
];
const lineUnitCodes = [
  'SSTA.COST_SHEET_DETAIL.TRANSACTIONDETAIL',
  'SSTA.COST_SHEET_DETAIL.TRANSACTION_DETAIL_SEARCH',
];
const unitCode = [
  ...headUnitCodes,
  ...lineUnitCodes,
  'SSTA.COST_SHEET_DETAIL.HEADER_BTNS', // 头按钮组
  'SSTA.COST_SHEET_DETAIL.COLLAPSE',
  'SSTA.COST_SHEET_DETAIL.LINE_BTNS', // 行按钮组
];

const customizeUnitCode = [...headUnitCodes, ...lineUnitCodes].join();

@withRemote(
  {
    code: 'SSTA_COSTSHEET_DETAIL',
    name: 'remote',
  },
  {
    events: {
      handleCuxAdd(eventProps) {
        const { ds, obj = {} } = eventProps || {};
        if (ds) ds.create(obj, 0);
      },
      async handleOprCuxBefore() {
        return true;
      },
    },
  }
)
@withCustomize({
  // unitCode,
  isTemplate: true,
})
@formatterCollections({
  code: [
    'ssta.costSheet',
    'entity.attachment',
    'ssta.settlePool',
    'sbud.budgeting',
    'hwfp.common',
    'hzero.common',
    'ssta.purchaseSettle',
    'ssta.purchaseSettlePool',
    'ssta.common',
    'ssta.invoiceSheet',
  ],
})
@observer
export default class Detail extends PureComponent {
  /**
   * 查看执行情况弹窗
   */
  modal = null;

  defaultActiveKey = ['basic', 'transaction', 'others', 'attachment'];

  /**
   * Creates an instance of Detail
   * @params {Object} props 属性
   */
  constructor(props) {
    super(props);
    const { location } = props;
    const routerParams = querystring.parse(location.search.substr(1));
    const isPub = Number(location.pathname.indexOf('/pub/'));
    const isCreate = location.pathname.indexOf('/new-cost-sheet/detail-create') !== -1;
    this.notPub = isPub === -1;
    const {
      type,
      chargeHeaderId = null,
      updateFlag = 0,
      reverseFlag = 0,
      approveFlag = 0,
      readeOnly = 0,
      syncFlag = 0,
      lineEdit, // 仅用于工作流行是否可编辑
      docLinkFlag = 0, // 单据查询只读页面，没有返回按钮，头按钮只有操作记录，行上没有单据流按钮
      flowPage, // 工作流新流程表单
    } = routerParams;
    /**
     * 内部状态
     */
    this.state = {
      type,
      readeOnly,
      chargeHeaderId,
      updateFlag,
      editFlag: false,
      chargeStatus: 'NEW',
      taxIncludedEnableFlag: 0,
      taxAmountUpdateFlag: 0,
      reverseFlag,
      approveFlag,
      syncFlag,
      lineSelect: [],
      readOnly: !(Number(reverseFlag) || Number(approveFlag) || Number(updateFlag)),
      isPub,
      permsMap: props.permsMap || new Map(), // 权限集数据 map
      pinFixed: this.notPub && Number(docLinkFlag) !== 1,
      lineEdit,
      templateInfo: {},
      supplierLovFlag: false,
      isCreate,
      docLinkFlag: Number(docLinkFlag) === 1,
      statusData: {},
      isNewPub: !this.notPub && Boolean(flowPage),
    };
    this.formDs = new DataSet(formDs());
    this.workflowCaller = new WorkflowCaller(this.formDs);

    const dsConfig = {
      ...tableDs(),
      events: {
        update: (params) => this.handleLineUpdate(params),
      },
    };
    this.tableDs = new DataSet(
      this.props.remote
        ? this.props.remote.process('SSTA_COSTSHEET_DETAIL.LINE_DSPROPS', dsConfig, {
            location,
            formDs: this.formDs,
          })
        : dsConfig
    );
  }

  /**
   * 组件挂载后触发方法
   */
  componentDidMount() {
    const { remote } = this.props;
    this.tableDs.init = this.init;
    this.tableDs.addEventListener('select', this.handleSelect);
    this.tableDs.addEventListener('unSelect', this.handleSelect);
    this.tableDs.addEventListener('selectAll', this.handleSelect);
    this.tableDs.addEventListener('unSelectAll', this.handleSelect);
    this.formDs.addEventListener('beforeLoad', this.handleBeforeLoad);
    this.getSupLovConfig();
    this.initCustomizeTemplate();
    this.getPermissions();
    this.fetchLov();
    // 监听formDs更新
    this.formDs.addEventListener('update', this.handleFormUpdate);
    if (remote) {
      remote.event.fireEvent('onComponentDidMount', {
        headerDs: this.formDs,
        lineDs: this.tableDs,
      });
    }
  }

  componentWillUnmount() {
    this.workflowCaller.destroy();
  }

  getSupLovConfig = async () => {
    const res = getResponse(await getSupLovConfig());
    if (isEmpty(res)) {
      this.setState({ supplierLovFlag: true });
    }
  };

  setLoading = (flag) => {
    this.formDs.status = flag ? 'loading' : 'ready';
  };

  fetchLov = async () => {
    const data = await queryIdpValue('SSTA.CHARGE_STATUS');
    if (data) {
      const statusData = {};
      data.forEach(({ value, tag }) => {
        statusData[value] = tag;
      });
      this.setState({ statusData });
    }
  };

  initCustomizeTemplate = async (initFlag) => {
    const { chargeHeaderId } = this.state;
    this.setLoading(true);
    const templateInfoRes = getResponse(
      await getCuszTemplate({
        templateCuszMethodCode: 'SSTA_CHARGE_HEADER_DETAIL_CUSZ_TEMPLATE',
        businessParam: { chargeHeaderId, role: 'PURCHASER' },
      })
    );
    await this.queryCuszFunc(templateInfoRes);
    this.setLoading(false);
    this.init(initFlag);
    if (chargeHeaderId) {
      this.tableDs.setQueryParameter('chargeHeaderId', chargeHeaderId);
      this.tableDs.query();
    }
  };

  queryCuszFunc = (templateInfoRes) => {
    if (!templateInfoRes) return;
    const { queryTemplateConfig, queryUnitConfig } = this.props;
    const { templateCode, templateVersion, useTemplateCusz } = templateInfoRes;
    if (useTemplateCusz) {
      this.setState({
        templateInfo: {
          cuszTplTemplateCode: templateCode,
          cuszTplVersion: templateVersion,
          cuszTplStageCode: 'COST.DETAIL',
          cuszTplPageCode: 'COST_DETAIL_BASIC',
        },
      });
      this.tableDs.setQueryParameter('cuszTplTemplateCode', templateCode);
      this.tableDs.setQueryParameter('cuszTplVersion', templateVersion);
      this.tableDs.setQueryParameter('cuszTplStageCode', 'COST.DETAIL');
      this.tableDs.setQueryParameter('cuszTplPageCode', 'COST_DETAIL_BASIC');
      return queryTemplateConfig(templateInfoRes, {
        stageCode: 'COST.DETAIL',
        pageCode: 'COST_DETAIL_BASIC',
      });
    } else {
      return queryUnitConfig(undefined, undefined, unitCode);
    }
  };

  /**
   * 获取权限集数据
   */
  getPermissions = async () => {
    const data = await getPermissions([
      `${permPrefix}.update`,
      `${permPrefix}.audit`,
      `${permPrefix}.completed`,
      `${permPrefix}.sync`,
      `${permPrefixBtn}.detailprint`,
      `${permPrefixBtn}.new-print-detail`,
      `${permPrefixBtn}.copy`,
      `${permPrefixBtn}.withdraw`,
      // `${permPrefixBtn}.lineImport`,
    ]);
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
        syncFlag = 0,
      } = routerParams;

      this.setState(
        {
          chargeHeaderId,
          updateFlag,
          reverseFlag,
          approveFlag,
          syncFlag,
          readOnly: !(Number(reverseFlag) || Number(approveFlag) || Number(updateFlag)),
          editFlag:
            (Number(updateFlag) === 1 && ['NEW', 'UPDATE', 'RETURNED'].includes(chargeStatus)) ||
            (Number(updateFlag) === 0 &&
              Number(reverseFlag) === 1 &&
              ['SUBMITTED'].includes(chargeStatus)),
        },
        () => this.initCustomizeTemplate(true)
      );
      // setState异步，避免未获取到正确的chargeHeaderId
    }
  }

  /**
   * 页面初始化查询
   */
  init = async (flag) => {
    const {
      chargeHeaderId,
      updateFlag,
      approveFlag,
      reverseFlag,
      readeOnly,
      templateInfo,
    } = this.state;
    const { onLoad, onFormLoaded } = this.props;
    this.formDs.approveFlag = approveFlag;
    if (chargeHeaderId) {
      this.setLoading(true);
      const res = getResponse(await getDetail(chargeHeaderId, headUnitCodes.join(), templateInfo));
      this.setLoading(false);
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
          supplierSiteEnableFlag,
          supplierSiteId,
          collaborativeMode,
        } = res;
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
        if (supplierSiteEnableFlag === 1) {
          this.tableDs.supplierSiteId = supplierSiteId;
        }

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
          chargeStatus,
          approveMethod,
          taxIncludedEnableFlag,
          taxAmountUpdateFlag,
          collaborativeMode,
        });
        this.formDs.loadData([res]);
        if (flag) {
          this.formDs.current.set({
            taxAmount: res.taxAmount,
            netAmount: res.netAmount,
            taxIncludedAmount: res.taxIncludedAmount,
            objectVersionNumber: res.objectVersionNumber,
          });
        } else {
          this.formDs.loadData([res]);
        }
      }
      if (onLoad && !readeOnly) {
        onLoad({
          submit: this.workFlowSubmit,
        });
      }
      // 在可编辑流程表单里注册onFormLoaded方法
      if (onFormLoaded && !readeOnly) onFormLoaded(true);
    } else {
      this.setLoading(true);
      const res = getResponse(await userDefaults());
      const companyLov = await queryUnifyIdpValue('HPFM.TENANT_COMPANY');
      this.setLoading(false);
      if (res && res.enabledFlag === 1 && companyLov && companyLov.length > 0) {
        this.formDs.loadData([
          {
            ...res,
            companyNum: companyLov.filter((item) => item.companyId === res.companyId)[0]
              ?.companyNum,
            invOrganizationId: res.organizationId,
            invOrganizationName: res.organizationName,
            purOrganizationId: res.purchaseOrgId,
            purOrganizationName: res.buyOrganizationName,
            chargeStatus: 'NEW',
            agentId: res.purchaseAgentId,
          },
        ]);
      }
      this.formDs.supplierEditFlag = true;
      this.setState({
        editFlag: true,
      });
    }
  };

  /**
   * 监听行勾选
   */
  handleSelect = () => {
    this.setState({
      lineSelect: this.tableDs.selected.map((item) => item.toData()),
    });
  };

  handleBeforeLoad = ({ dataSet, data }) => {
    const { remote: remoteProps } = this.props;
    if (remoteProps) {
      remoteProps.event.fireEvent('handleLoadFormDsCux', {
        data,
        dataSet,
      });
    }
  };

  handleFormUpdate = async ({ name, value, dataSet }) => {
    const { remote: remoteProps } = this.props;
    if (name === 'companLov') {
      const { currencyCode, currencyName, companyId } = value || {};
      let res = null;
      if (companyId) {
        res = getResponse(await getDefaultFromCompany({ companyId }));
      }
      const {
        ouId,
        ouCode,
        ouName,
        purchaseOrgId,
        purchaseOrgName,
        purchaseOrgCode: purOrganizationCode,
        invOrganizationId,
        invOrganizationName,
        invOrganizationCode,
      } = res || {};
      this.formDs.current.set({
        ouNameLov: res && ouId ? { ouId, ouCode, ouName } : null,
        supplierCompanyLov: null,
        currencyCode,
        currencyName,
        purOrganizationIdLov:
          res && purchaseOrgId
            ? {
                purOrganizationName: purchaseOrgName,
                purOrganizationId: purchaseOrgId,
                purchaseOrgId,
                organizationName: purchaseOrgName,
                purOrganizationCode,
                organizationCode: purOrganizationCode,
              }
            : null,
        invOrganizationLov:
          res && invOrganizationId
            ? {
                invOrganizationId,
                invOrganizationName,
                invOrganizationCode,
                organizationName: invOrganizationName,
                organizationId: invOrganizationId,
                organizationCode: invOrganizationCode,
              }
            : null,
      });
    } else if (name === 'ouNameLov') {
      const companyId = this.formDs.current?.get('companyId');
      const { ouId } = value || {};
      let res = null;
      if (ouId) {
        res = getResponse(await getDefaultFromCompany({ companyId, ouId }));
      }
      const {
        purchaseOrgId,
        purchaseOrgName,
        purchaseOrgCode: purOrganizationCode,
        invOrganizationId,
        invOrganizationName,
        invOrganizationCode,
      } = res || {};
      this.formDs.current.set({
        purOrganizationIdLov:
          res && purchaseOrgId
            ? {
                purOrganizationName: purchaseOrgName,
                purOrganizationId: purchaseOrgId,
                purchaseOrgId,
                organizationName: purchaseOrgName,
                purOrganizationCode,
                organizationCode: purOrganizationCode,
              }
            : null,
        invOrganizationLov:
          res && invOrganizationId
            ? {
                invOrganizationId,
                invOrganizationName,
                invOrganizationCode,
                organizationName: invOrganizationName,
                organizationId: invOrganizationId,
                organizationCode: invOrganizationCode,
              }
            : null,
      });
    } else if (name === 'purOrganizationIdLov') {
      const { purchaseOrgId } = value || {};
      let res = null;
      if (purchaseOrgId) {
        res = getResponse(await getDefaultFromPurOrg({ purchaseOrgId }));
      }
      const { purchaseAgentId, purchaseAgentName } = res || {};
      this.formDs.current.set({
        agentLov:
          res && purchaseAgentId
            ? { purchaseAgentId, purchaseAgentName, agentId: purchaseAgentId }
            : null,
      });
    }
    if (remoteProps) {
      remoteProps.event.fireEvent('handleUpdateFormDsCux', {
        name,
        value,
        formDs: this.formDs?.current,
        dataSet,
        tableDs: this.tableDs,
        state: this.state,
      });
    }
  };

  /**
   * 行表格添加监听函数
   * @param {Number} currencyCode 币种精度
   */
  handleLineUpdate = ({ record, name, value }) => {
    const amountPrecision = record.get('amountPrecision');
    const taxIncludedEnableFlag = Number(record.get('taxIncludedEnableFlag')); // 1->含税价 0->不含税价
    const taxAmountUpdateFlag = Number(record.get('taxAmountUpdateFlag')); // 1->允许修改税额 0->不允许修改税额
    const netAmount = record.get('netAmount') || 0; // 不含税金额
    const taxIncludedAmount = record.get('taxIncludedAmount') || 0; // 含税金额
    const taxRate = Number(record.get('taxRate') || 0) / 100;
    const taxRateType = record.get('taxRateType');
    const inPriceTaxFlag = taxRateType === 'IN_PRICE_TAX';
    let taxAmount = 0; // 税额

    /**
     *  taxAmountUpdateFlag = 0 , taxIncludedEnableFlag = 0 ,  taxIncludedAmount = netAmount*taxRate, taxAmount = taxIncludedAmount-netAmount
     *  taxAmountUpdateFlag = 0 , taxIncludedEnableFlag = 1 ,  税额taxAmount=round（含税金额taxIncludedAmount/（1+税率taxRate）*税率taxRate，2） 不含税金额netAmount=含税金额taxIncludedAmount-税额taxAmount
     */

    if (taxIncludedEnableFlag === 0 && name === 'netAmount') {
      // 价内税 税额 = 不含税金额*税率/（1-税率）
      taxAmount = inPriceTaxFlag
        ? math.toFixed(
            math.div(math.multipliedBy(netAmount, taxRate), math.minus(1, taxRate)),
            amountPrecision
          )
        : math.toFixed(math.multipliedBy(netAmount, taxRate), amountPrecision);
      record.set('taxAmount', taxAmount);
      record.set(
        'taxIncludedAmount',
        math.toFixed(math.plus(taxAmount, netAmount), amountPrecision)
      );
    }
    if (taxIncludedEnableFlag === 1 && name === 'taxIncludedAmount') {
      const taxIncludedAmountDivRate = math.div(taxIncludedAmount, math.plus(1, taxRate));
      // 价内税 税额 = 含税金额*税率
      taxAmount = inPriceTaxFlag
        ? math.toFixed(math.multipliedBy(taxIncludedAmount, taxRate), amountPrecision)
        : math.toFixed(math.multipliedBy(taxIncludedAmountDivRate, taxRate), amountPrecision);
      record.set('taxAmount', taxAmount);
      record.set(
        'netAmount',
        math.toFixed(math.minus(taxIncludedAmount, taxAmount), amountPrecision)
      );
    }
    if (taxAmountUpdateFlag === 1 && name === 'taxAmount') {
      const taxAmount1 = record.get('taxAmount') || 0;
      if (taxIncludedEnableFlag === 1) {
        record.set(
          'netAmount',
          math.toFixed(math.minus(taxIncludedAmount, taxAmount1), amountPrecision)
        );
      }
      if (taxIncludedEnableFlag === 0) {
        record.set(
          'taxIncludedAmount',
          math.toFixed(math.plus(netAmount, taxAmount1), amountPrecision)
        );
      }
    }
    if (taxIncludedEnableFlag === 0 && name === 'taxRateLov') {
      taxAmount = inPriceTaxFlag
        ? math.toFixed(
            math.div(math.multipliedBy(netAmount, taxRate), math.minus(1, taxRate)),
            amountPrecision
          )
        : math.toFixed(math.multipliedBy(netAmount, taxRate), amountPrecision);
      const taxIncludedAmount1 = math.toFixed(math.plus(taxAmount, netAmount), amountPrecision);
      record.set('taxAmount', taxAmount);
      record.set('taxIncludedAmount', taxIncludedAmount1);
    }
    if (taxIncludedEnableFlag === 1 && name === 'taxRateLov') {
      const taxIncludedAmountDivRate = math.div(taxIncludedAmount, math.plus(1, taxRate));
      taxAmount = inPriceTaxFlag
        ? math.toFixed(math.multipliedBy(taxIncludedAmount, taxRate), amountPrecision)
        : math.toFixed(math.multipliedBy(taxIncludedAmountDivRate, taxRate), amountPrecision);
      const netAmount1 = math.toFixed(math.minus(taxIncludedAmount, taxAmount), amountPrecision);
      record.set('taxAmount', taxAmount);
      record.set('netAmount', netAmount1);
    }
    if (['taxAmount', 'taxIncludedAmount', 'netAmount'].includes(name)) {
      record.set(name, math.toFixed(value, amountPrecision));
    }
  };

  /**
   * 动态渲染行操作按钮
   * @returns React.Element
   */
  getTableButtons = () => {
    const { editFlag, lineSelect } = this.state;
    const { remote: remoteProps } = this.props;
    const btns = [
      <Button name="add" icon="playlist_add" onClick={() => this.handleAdd(this.tableDs)} key="add">
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      <Button
        name="cancel"
        icon="delete_sweep"
        disabled={lineSelect.length <= 0}
        onClick={() => this.handleCancel(this.tableDs)}
        key="cancel"
      >
        {intl.get(`hzero.common.button.batchdelete`).d('批量删除')}
      </Button>,
      // permsMap.get(`${permPrefixBtn}.lineImport`) && (
      //   <Import
      //     name='import'
      //     buttonText={intl.get('ssta.common.button.newBatchUpdate').d('(新)批量编辑')}
      //     businessObjectTemplateCode="SSTA.CHARGE_LINE_EXCEL_IMPORT"
      //     buttonProps={{
      //       funcType: 'flat',
      //       color: 'primary',
      //       icon: 'archive',
      //     }}
      //     prefixPatch="/ssta"
      //     args={{
      //       tenantId,
      //       templateCode: 'SSTA.CHARGE_LINE_EXCEL_IMPORT',
      //       chargeHeaderId,
      //       camp: 'PURCHASER',
      //     }}
      //     successCallBack={() => {
      //       this.init();
      //       this.tableDs.query(undefined, undefined, true);
      //     }}
      //   />
      // ),
    ];
    const chargeHeaderSource = this.formDs?.current?.get('chargeHeaderSource');
    const standardBtns = editFlag && !['REBATE'].includes(chargeHeaderSource) ? btns : [];
    // 星巴克二开埋点 pur-17894
    return remoteProps
      ? remoteProps?.process('SSTA_COSTSHEET_DETAIL_BTN', standardBtns, {
          editFlag,
          btns,
          headerDs: this.formDs,
          lineDs: this.tableDs,
          handleSaveOpr: this.handleSaveOpr,
          setLoading: this.setLoading,
          handleSearchHeader: this.init,
          location: this.props.location,
        })
      : standardBtns;
  };

  /**
   * 操作记录、审批记录
   * @param {*} record
   * @param {*} chargeHeaderId
   */
  openOprationModal = (record, chargeHeaderId) => {
    const { history } = this.props;
    Modal.open({
      title: intl.get('hzero.common.button.operating').d('操作记录'),
      drawer: true,
      destroyOnClose: true,
      className: Styles['ssta-medium-modal'],
      children: (
        <OperationApprove
          record={record}
          chargeHeaderId={chargeHeaderId}
          roleSource="purchaser"
          history={history}
          isFilter
        />
      ),
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  /**
   * 响应行新增按钮点击
   * @param {Object} ds 行 DataSet
   */
  handleAdd = (ds) => {
    const { taxIncludedEnableFlag, chargeHeaderId, taxAmountUpdateFlag } = this.state;
    const chargeHeaderSource = this.formDs?.current?.get('chargeHeaderSource') || {};
    const amountPrecision = this.formDs.current?.get('amountPrecision');
    const obj = { taxIncludedEnableFlag, chargeHeaderId, taxAmountUpdateFlag, amountPrecision };
    const { remote: remoteProps } = this.props;
    if (['REBATE'].includes(chargeHeaderSource)) {
      obj.chargeLineSource = 'SRM';
    }
    if (remoteProps && remoteProps.event) {
      remoteProps.event.fireEvent('handleCuxAdd', {
        ds,
        obj,
        formDs: this.formDs,
      });
    } else {
      ds.create(obj, 0);
    }
  };

  /**
   * 响应行取消按钮点击
   * @param {Obejct} ds 行 DataSet
   */
  handleCancel = async (ds) => {
    const res = await ds.delete(ds.selected, getSelectedNegActConfirmMsg('delete', ds));
    if (res && res.success) {
      this.init(1);
      await this.tableDs.query(undefined, undefined, true);
      this.tableDs.clearCachedSelected();
    }
  };

  /**
   * 获取接口数据
   * @returns 数据
   */
  getSaveSendData = async () => {
    this.formDs.current.status = 'create';
    const headerValidateFlag = await this.formDs.current?.validate(true);
    const linesValidateFlag = await this.tableDs.validate();
    if (headerValidateFlag && linesValidateFlag) {
      // 卫龙埋点：解决编辑富文本时触发重新渲染导致的光标重新定位问题
      const { remote: remoteProps } = this.props;
      if (remoteProps) {
        remoteProps.event.fireEvent('handleSaveBeforeCux', {
          formDs: this.formDs,
        });
      }
      const headerData = this.formDs.toData()[0] ? this.formDs.toData()[0] : {};
      const lineData = this.tableDs.toData() ? this.tableDs.toData() : [];
      const sendData = {
        chargeHeader: { camp: 'PURCHASER', ...headerData },
        chargeLineList: lineData,
      };
      return remoteProps.process('SSTA_COST_SHEET_DETAIL_PROCESS_SENDDATA', sendData, {
        formDs: this.formDs,
        tableDs: this.tableDs,
      });
    } else {
      formatErrorInfo(
        this.formDs,
        this.tableDs,
        intl.get(`ssta.costSheet.view.message.panel.transactionDetails`).d('费用明细信息')
      );
      return false;
    }
  };

  /**
   * 获取接口数据
   * @returns 数据
   */
  getSendData = async () => {
    this.formDs.current.status = 'add';
    const headerValidateFlag = await this.formDs.validate();
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
      formatErrorInfo(
        this.formDs,
        this.tableDs,
        intl.get(`ssta.costSheet.view.message.panel.transactionDetails`).d('费用明细信息')
      );
      return false;
    }
  };

  /**
   * 响应弹窗
   * @param {Function} reqFun 请求函数
   * @param {Object} sendData 请求数据
   */
  handleFilledInfoOk = async (reqFun, sendData, action) => {
    const { history } = this.props;
    const { templateInfo } = this.state;
    let saveData = {};

    if (['REVERSE'].includes(action)) {
      const baseDatas = await this.getSendData();
      if (baseDatas) {
        // eslint-disable-next-line no-param-reassign
        saveData = await this.getSaveSendData();
        saveData.chargeHeader = {
          ...saveData.chargeHeader,
          ...sendData,
        };
        // eslint-disable-next-line no-param-reassign
        sendData = { ...sendData, ...baseDatas };
      } else {
        return false;
      }
    }
    // 冲销操作，先保存，再调冲销接口
    if (['REVERSE'].includes(action)) {
      this.setLoading(true);
      const saveRes = getResponse(await save(saveData, customizeUnitCode, templateInfo));
      this.setLoading(false);
      if (!saveRes) {
        return false;
      }
      const { chargeHeader, chargeLineList } = saveRes;
      this.formDs.loadData([chargeHeader]);
      this.tableDs.loadData(chargeLineList);
      sendData = { ...sendData, ...saveRes.chargeHeader, chargeLineList: saveRes.chargeLineList };
    }

    this.setLoading(true);
    const res = getResponse(await reqFun({ ...sendData, customizeUnitCode, templateInfo }));
    this.setLoading(false);
    if (res) {
      notification.success();
      history.push({
        pathname: '/ssta/new-cost-sheet/list',
        state: { _back: 1 },
      });
    } else {
      if (['REVERSE'].includes(action)) {
        this.init();
        await this.tableDs.query(undefined, undefined, true);
        this.tableDs.clearCachedSelected();
      }
      return false;
    }
  };

  /**
   * 响应操作
   * @param {Function} reqFun 接口方法
   */
  handleOpr = async (reqFun, action) => {
    const { customizeForm, custConfig, remote: remoteProps } = this.props;
    const { chargeHeaderId } = this.state;
    if (remoteProps?.event) {
      const res = await remoteProps.event.fireEvent('handleOprCuxBefore', {
        chargeHeaderId,
      });
      if (!res) {
        return false;
      }
    }
    Modal.open({
      drawer: true,
      key: Modal.key(),
      closable: true,
      className: ['REVERSE'].includes(action)
        ? style['ssta-reverse-modal']
        : Styles['ssta-small-modal'],
      title: ['REVERSE'].includes(action)
        ? intl.get(`ssta.costSheet.view.message.panel.reverseInfo`).d('冲销信息')
        : intl.get(`ssta.costSheet.view.message.panel.approveInfo`).d('审核信息'),
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

  // 点击打印
  handlePrint = async () => {
    const { chargeHeaderId } = this.state;
    const flag = checkPrintWindow();
    const params = {
      list: [chargeHeaderId],
      responseType: flag ? 'blob' : 'json',
      headers: flag ? {} : { 's-print-using-preview': '1' },
    };
    const printRes = getResponse(await print(params));
    if (printRes) {
      if (flag) {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const failedInfo = JSON.parse(reader.result);
            notification.error({
              description: failedInfo.message,
            });
          } catch (e) {
            const file = new Blob([printRes], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const printWindow = window.open(fileURL);
            if (printWindow?.print) {
              printWindow.print();
            }
          }
        };
        reader.readAsText(printRes);
      } else {
        // 添加如下代码
        const { fileUrl, bucketName, fileToken } = printRes || {};
        const url = await getPdfPreviewUrl({ fileUrl, bucketName, fileToken });
        window.open(url);
      }
    }
  };

  /**
   * 响应头取消按钮点击
   * @param {Function} reqFun 接口方法
   */
  handleOprCancel = async (reqFun) => {
    const headerData = this.formDs.toData()[0] ? this.formDs.toData()[0] : {};
    const lineData = this.tableDs.toData() ? this.tableDs.toData() : [];
    const sendData = {
      ...headerData,
      chargeLineList: lineData,
    };
    this.setLoading(true);
    const res = getResponse(await reqFun(sendData));
    this.setLoading(false);
    if (res) {
      notification.success();
      const { history } = this.props;
      history.push({
        pathname: '/ssta/new-cost-sheet/list',
        state: { _back: 1 },
      });
    }
  };

  operateBeforeConfirm = (reqFun) => {
    const { chargeStatusMeaning, chargeNum } = this.formDs.current?.toData();
    const documentTypeMeaning = `${chargeStatusMeaning}${intl
      .get('ssta.costSheet.model.expenseSheets')
      .d('费用单')}`;
    const info = {
      action: 'CANCEL',
      bills: `${documentTypeMeaning}${chargeNum}`,
      billType: documentTypeMeaning,
    };
    confirmModal(info, this.handleOprCancel, reqFun);
  };

  /**
   * 响应头提交按钮点击
   */
  handleFinishOpr = async () => {
    const sendData = await this.getSaveSendData();
    if (sendData) {
      const { templateInfo } = this.state;
      const validateOk = async () => {
        this.setLoading(true);
        const res = getResponse(await completed({ ...sendData, customizeUnitCode, templateInfo }));
        this.setLoading(false);
        if (res) {
          notification.success();
          const { history } = this.props;
          history.push({
            pathname: '/ssta/new-cost-sheet/list',
            state: { _back: 1 },
          });
        }
      };
      this.setLoading(true);
      const valiRes = getResponse(
        await submitValidate({ ...sendData, customizeUnitCode, templateInfo })
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

  // 点击同步
  handleSync = async () => {
    const data = this.formDs.current?.toData();
    this.setLoading(true);
    const res = getResponse(await sync([data]));
    this.setLoading(false);
    if (res) {
      const { errorMessage } = res;
      if (errorMessage) {
        notification.error({
          message: errorMessage,
        });
      } else {
        notification.success();
        const { history } = this.props;
        history.push({
          pathname: '/ssta/new-cost-sheet/list',
          state: { _back: 1 },
        });
      }
    }
  };

  /**
   * 响应头保存按钮点击
   */
  handleSaveOpr = async () => {
    const sendData = await this.getSaveSendData();
    const { isCreate } = this.state;
    if (sendData) {
      try {
        const { templateInfo } = this.state;
        this.setLoading(true);
        const res = getResponse(await save(sendData, customizeUnitCode, templateInfo));
        this.setLoading(false);
        if (res && !res.failed) {
          const {
            chargeHeader: { chargeHeaderId },
          } = res;
          this.setState(
            {
              chargeHeaderId,
            },
            () => {
              notification.success();
              this.init();
              this.tableDs.setQueryParameter('chargeHeaderId', chargeHeaderId);
              this.tableDs.query(undefined, undefined, false);
              const { history } = this.props;
              this.updateTabLink(querystring.stringify({ chargeHeaderId, updateFlag: 1 }), null);
              if (isCreate) {
                history.push({
                  pathname: '/ssta/new-cost-sheet/detail',
                  search: querystring.stringify({ chargeHeaderId, updateFlag: 1 }),
                });
              }
            }
          );
          return true;
        }
      } catch (error) {
        throw error;
      }
    }
  };

  handleRevoke = async () => {
    const confirmRes = await Modal.confirm({
      title: intl.get('ssta.common.view.title.tip').d('提示'),
      children: intl
        .get('ssta.common.view.message.confirmRevokeApprovalTip')
        .d(
          '是否确认撤销审批?撤销后您仍可再次提交发起审批(工作流审批时仅工作流审批发起人可执行撤销)'
        ),
    });
    if (confirmRes !== 'ok') return false;
    const { chargeHeaderId } = this.state;
    const res = getResponse(await revoke(chargeHeaderId));
    if (!res) return;
    notification.success();
    const { history } = this.props;
    history.push({
      pathname: '/ssta/new-cost-sheet/list',
      state: { _back: 1 },
    });
  };

  // 处理复制按钮
  handleCopy = async () => {
    const action = intl.get('hzero.common.button.copy').d('复制');
    const resVerify = await confirmDocNegAction({
      action,
      documentName: this.formDs.current?.get('chargeNum'),
      documentNum: intl.get('ssta.common.view.message.createCost').d('生成新的费用单'),
    });
    if (!resVerify) return;
    const sendData = await this.getSaveSendData();
    if (sendData) {
      try {
        const { templateInfo } = this.state;
        this.setLoading(true);
        const res = getResponse(await copy(sendData, customizeUnitCode, templateInfo));
        this.setLoading(false);
        if (res && !res.failed) {
          const {
            chargeHeader: { chargeHeaderId },
          } = res;
          notification.success();
          const { history } = this.props;
          this.updateTabLink(querystring.stringify({ chargeHeaderId, updateFlag: 1 }), null);
          history.push({
            pathname: '/ssta/new-cost-sheet/detail',
            search: querystring.stringify({ chargeHeaderId, updateFlag: 1 }),
          });
        }
      } catch (error) {
        throw error;
      }
    }
  };

  // 工作流的提交方法
  workFlowSubmit = (param) => {
    const { templateInfo } = this.state;
    return new Promise(async (resolve, reject) => {
      if (param === 'Approved') {
        const sendData = await this.getSaveSendData();
        if (sendData === false) {
          const errElement = document.getElementById('CostSheet-othersInf');
          if (errElement) {
            errElement.scrollIntoView(true);
          }
          const msg = this.props.remote.process(
            'SSTA_COST_SHEET_DETAIL_PROCESS_RJT_MSG',
            undefined,
            { formDs: this.formDs, tableDs: this.tableDs }
          );
          return reject(msg);
        }
        const res = getResponse(await save(sendData, customizeUnitCode, templateInfo));
        return res ? resolve() : reject();
      } else {
        return resolve();
      }
    });
  };

  updateTabLink = (search, state) => {
    updateTab({
      key: getActiveTabKey(),
      search,
      state,
    });
  };

  linkToUpdateDetail = () => {
    const {
      history,
      location: { pathname, search },
    } = this.props;
    const { chargeHeaderId } = this.state;
    this.updateTabLink(
      querystring.stringify({
        chargeHeaderId,
        updateFlag: 1,
      }),
      {
        backPath: `${pathname}${search}`,
      }
    );
    history.push({
      pathname: '/ssta/new-cost-sheet/detail',
      search: querystring.stringify({
        chargeHeaderId,
        updateFlag: 1,
      }),
      state: {
        backPath: `${pathname}${search}`,
      },
    });
  };

  linkToApproveDetail = () => {
    const {
      history,
      location: { pathname, search },
    } = this.props;
    const { approveMethod, chargeHeaderId } = this.state;
    if (approveMethod === 'WORKFLOW') {
      this.workflowCaller.goApprove({
        onSuccess: () => {
          notification.success();
          history.push({
            pathname: '/ssta/new-cost-sheet/list',
            state: { _back: 1 },
          });
        },
      });
      return;
    }
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
      pathname: '/ssta/new-cost-sheet/detail',
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

  linkToReverseDetail = () => {
    const {
      history,
      location: { pathname, search },
    } = this.props;
    const { chargeHeaderId } = this.state;
    this.updateTabLink(
      querystring.stringify({
        chargeHeaderId,
        updateFlag: 0,
        reverseFlag: 1,
      }),
      {
        backPath: `${pathname}${search}`,
      }
    );
    history.push({
      pathname: '/ssta/new-cost-sheet/detail',
      search: querystring.stringify({
        chargeHeaderId,
        updateFlag: 0,
        reverseFlag: 1,
      }),
      state: {
        backPath: `${pathname}${search}`,
      },
    });
  };

  // 跳转同步
  linkToSyncDetail = () => {
    const {
      history,
      location: { pathname, search },
    } = this.props;
    const { chargeHeaderId } = this.state;
    this.updateTabLink(
      querystring.stringify({
        chargeHeaderId,
        updateFlag: 0,
        syncFlag: 1,
      }),
      {
        backPath: `${pathname}${search}`,
      }
    );
    history.push({
      pathname: '/ssta/new-cost-sheet/detail',
      search: querystring.stringify({
        chargeHeaderId,
        updateFlag: 0,
        syncFlag: 1,
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
      // footer: null,
      title,
      children: <ExeResult record={record} chargeHeaderId={chargeHeaderId} history={history} />,
      // onCancel: () => { },
    });
  };

  // 点击查看来源单号
  viewSourceDocumentNum = (value) => {
    let dataSource = [];
    try {
      dataSource = JSON.parse(value) || [];
    } catch (e) {
      dataSource = [];
    }
    Modal.open({
      drawer: true,
      destroyOnClose: true,
      closable: true,
      className: Styles['ssta-medium-modal'],
      title: intl.get('ssta.common.view.title.sourceDocumentNum').d('来源单据号'),
      children: <SourceDocument dataSource={dataSource} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  /**
   * 响应行维护按钮点击
   */
  // updateDetail = () => {
  //   const { history } = this.props;
  //   const { chargeHeaderId } = this.state;
  //   history.push({
  //     pathname: '/ssta/cost-sheet/detail',
  //     search: querystring.stringify({ chargeHeaderId, updateFlag: 1 }),
  //   });
  // };

  supplierSiteChange = (record) => {
    const supplierSiteEnableFlag = this.formDs.current.get('supplierSiteEnableFlag');
    if (supplierSiteEnableFlag === 1) {
      this.tableDs.supplierSiteId = record ? record.supplierSiteId : undefined;
    }
  };

  /**
   *  标题条件渲染
   */
  titleRender = () => {
    const { reverseFlag, approveFlag, updateFlag, readOnly, chargeHeaderId, syncFlag } = this.state;
    if (!this.notPub) return null;
    if (readOnly) {
      return intl.get(`ssta.costSheet.view.title.costView`).d('费用单查看');
    } else if (Number(updateFlag)) {
      return chargeHeaderId
        ? intl.get(`ssta.costSheet.view.title.costUpdate`).d('编辑费用单')
        : intl.get(`ssta.costSheet.view.title.costCreate`).d('新建费用单');
    } else if (Number(approveFlag)) {
      return intl.get(`ssta.costSheet.view.title.costApprove`).d('费用单审核');
    } else if (Number(reverseFlag)) {
      return intl.get(`ssta.costSheet.view.title.costReverse`).d('费用单冲销');
    } else if (Number(syncFlag)) {
      return intl.get(`ssta.costSheet.view.title.costSync`).d('费用单同步');
    }
  };

  headerBtns = () => {
    const { remote: remoteProps } = this.props;
    const {
      camp,
      type,
      permsMap,
      chargeStatus,
      updateFlag,
      collaborativeMode,
      approveFlag,
      reverseFlag,
      editFlag,
      chargeHeaderId,
      syncFlag,
      approveMethod,
      docLinkFlag,
      isNewPub,
    } = this.state;
    const loading = this.formDs.status !== 'ready';
    const { reverseStatus, syncStatus, printBtnDisable, chargeHeaderSource } =
      this.formDs.current?.toData() || {};
    const update = !(
      this.tableDs.updated.length > 0 ||
      this.tableDs.created.length > 0 ||
      this.formDs.updated.length > 0
    );
    if (docLinkFlag) {
      return formatDynamicBtns([
        chargeHeaderId && {
          name: 'operationRecord',
          child: intl.get('ssta.costSheet.view.button.operationRecord').d('操作记录'),
          btnProps: {
            className: Styles['ssta-detail-button'],
            icon: 'operation_service_request',
            loading,
            onClick: () => this.openOprationModal(this.formDs.current, chargeHeaderId),
          },
        },
      ]);
    }
    const allBtns = [
      !loading &&
        permsMap.get(`${permPrefix}.update`) &&
        ['NEW', 'RETURNED'].includes(chargeStatus) &&
        camp === 'PURCHASER' &&
        Number(updateFlag) === 0 && {
          name: 'update',
          child: intl.get('ssta.costSheet.view.button.update').d('编辑'),
          btnProps: {
            type: 'c7n-pro',
            icon: 'mode_edit',
            loading,
            onClick: () => this.linkToUpdateDetail(),
          },
        },
      type === 'ALL' &&
        permsMap.get(`${permPrefix}.audit`) &&
        ((chargeStatus === 'SUBMITTED' &&
          approveMethod === 'FUNCTIONAL' &&
          (collaborativeMode === 'SINGLE' ||
            (collaborativeMode === 'DOUBLE' && camp === 'SUPPLIER'))) ||
          (['SUBMITTED_FOR_APPROVAL', 'REVERSE_WLF_APPROVING'].includes(chargeStatus) &&
            approveMethod === 'WORKFLOW' &&
            this.workflowCaller.getApproveFlag())) && {
          name: 'approve',
          child: intl.get('ssta.costSheet.view.button.approve').d('审核'),
          btnProps: {
            type: 'c7n-pro',
            icon: 'authorize',
            onClick: this.linkToApproveDetail,
            loading,
          },
        },
      permsMap.get(`${permPrefix}.sync`) &&
        ['COMPLETED', 'REVERSED'].includes(chargeStatus) &&
        ['UNSYNCHRONIZED', 'SYNC_FAILURE'].includes(syncStatus) &&
        Number(syncFlag) === 0 && {
          name: 'syncBtn',
          child: intl.get('ssta.purchaseSettlePool.view.button.sync').d('同步'),
          btnProps: {
            type: 'c7n-pro',
            icon: 'sync',
            onClick: this.linkToSyncDetail,
            loading,
          },
        },
      permsMap.get(`${permPrefix}.completed`) &&
        ['COMPLETED'].includes(chargeStatus) &&
        Number(reverseFlag) === 0 &&
        // 从全部页签进来点了同步按钮后不需要再显示冲销了
        Number(syncFlag) !== 1 &&
        Number(reverseStatus) !== 1 && {
          name: 'reverse',
          child: intl.get('ssta.costSheet.view.button.reverse').d('冲销'),
          btnProps: {
            type: 'c7n-pro',
            icon: 'test',
            onClick: this.linkToReverseDetail,
            loading,
          },
        },
      Number(reverseFlag) === 1 &&
        Number(reverseStatus) !== 1 && {
          name: 'writeOff',
          child: intl.get('ssta.costSheet.view.button.reverse').d('冲销'),
          btnProps: {
            className: Styles['ssta-detail-button'],
            icon: 'test',
            loading,
            onClick: async () => this.handleOpr(reverse, 'REVERSE'),
          },
        },
      permsMap.get(`${permPrefix}.sync`) &&
        ['COMPLETED', 'REVERSED'].includes(chargeStatus) &&
        ['UNSYNCHRONIZED', 'SYNC_FAILURE'].includes(syncStatus) &&
        Number(syncFlag) === 1 && {
          name: 'sync',
          child: intl.get('ssta.purchaseSettlePool.view.button.sync').d('同步'),
          btnProps: {
            type: 'c7n-pro',
            icon: 'sync',
            loading,
            onClick: () => this.handleSync(),
            wait: 1500,
          },
        },
      chargeHeaderId &&
        editFlag &&
        update && {
          name: 'submit',
          child: intl.get('ssta.costSheet.view.button.submit').d('提交'),
          btnProps: {
            className: Styles['ssta-detail-button'],
            icon: 'check',
            disabled: !editFlag,
            loading,
            onClick: () => this.handleFinishOpr(),
            wait: 1500,
          },
        },
      editFlag && {
        name: 'save',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          className: Styles['ssta-detail-button'],
          icon: 'save',
          disabled: !editFlag,
          loading,
          onClick: () => this.handleSaveOpr(),
          wait: 1500,
        },
      },
      chargeHeaderId &&
        editFlag && {
          name: 'cancel',
          child: intl.get('ssta.costSheet.view.button.cancel').d('取消'),
          btnProps: {
            className: Styles['ssta-detail-button'],
            icon: 'cancel',
            disabled: !['NEW', 'RETURNED'].includes(chargeStatus),
            loading,
            onClick: () => this.operateBeforeConfirm(cancel),
          },
        },
      Number(approveFlag) === 1 && {
        name: 'approveResolve',
        child: intl.get('ssta.costSheet.view.button.approveResolve').d('确认'),
        btnProps: {
          className: Styles['ssta-detail-button'],
          icon: 'check',
          loading,
          onClick: () => this.handleOpr(approveResolve, 'CONFIRM'),
        },
      },
      Number(approveFlag) === 1 && {
        name: 'approveReject',
        child: intl.get('ssta.costSheet.view.button.approveReject').d('退回'),
        btnProps: {
          className: Styles['ssta-detail-button'],
          icon: 'reply',
          loading,
          onClick: () => this.handleOpr(approveReject, 'RETURN'),
        },
      },
      !isNewPub &&
        chargeHeaderId &&
        permsMap.get(`${permPrefixBtn}.copy`) &&
        ['SRM', 'EXCEL'].includes(chargeHeaderSource) && {
          name: 'copy',
          child: intl.get('hzero.common.button.copy').d('复制'),
          btnProps: {
            icon: 'queue',
            type: 'c7n-pro',
            funcType: 'flat',
            color: 'default',
            className: Styles['ssta-detail-button'],
            loading,
            onClick: () => this.handleCopy(),
            wait: 1500,
          },
        },
      !isNewPub &&
        chargeHeaderId &&
        permsMap.get(`${permPrefixBtn}.withdraw`) &&
        camp === 'PURCHASER' &&
        ((['SUBMITTED_FOR_APPROVAL'].includes(chargeStatus) &&
          this.workflowCaller?.getRevokeFlag()) ||
          ['ES_SUBMITED_APPROVING', 'SUBMITTED'].includes(chargeStatus)) && {
          name: 'withdraw',
          child: intl.get('hzero.common.button.recall').d('撤回'),
          btnProps: {
            icon: 'reply',
            loading,
            wait: 1500,
            onClick: this.handleRevoke,
          },
        },
      printBtnDisable !== 1 &&
        chargeHeaderId &&
        permsMap.get(`${permPrefixBtn}.detailprint`) && {
          name: 'print',
          child: intl.get('hzero.common.button.print').d('打印'),
          btnProps: {
            loading,
            icon: 'print',
            onClick: () => this.handlePrint(),
            wait: 1500,
          },
        },
      printBtnDisable !== 1 &&
        chargeHeaderId &&
        permsMap.get(`${permPrefixBtn}.new-print-detail`) && {
          name: 'newPrint',
          btnComp: PrintProButton,
          childFor: 'buttonText',
          child: intl.get('ssta.common.view.button.newPrint').d('(新)打印'),
          btnProps: {
            loading,
            buttonProps: { funcType: 'flat' },
            requestUrl: `${apiPrefix}/charge-headers/list-print-new`,
            method: 'PUT',
            data: { chargeHeaderIdList: [chargeHeaderId] },
          },
        },
      !editFlag && {
        name: 'export',
        btnComp: ExcelExport,
        btnProps: {
          loading,
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            permissionList: [
              {
                code: `srm.settle-account.cost-sheet.ux-cost-sheet.ps.detailexport`,
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
            loading,
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            permissionList: [
              {
                code: `srm.settle-account.cost-sheet.ux-cost-sheet.ps.newdetailexport`,
                type: 'button',
              },
            ],
          },
          requestUrl: `/ssta/v1/${getCurrentOrganizationId()}/charge-headers/detail/export`,
          queryParams: { chargeHeaderId },
          templateCode: 'SSTA_CHARGE_DETAIL_PURCHASER_EXPORT',
        },
      },
      chargeHeaderId && {
        name: 'operationRecord',
        child: intl.get('ssta.costSheet.view.button.operationRecord').d('操作记录'),
        btnProps: {
          className: Styles['ssta-detail-button'],
          icon: 'operation_service_request',
          loading,
          onClick: () => this.openOprationModal(this.formDs.current, chargeHeaderId),
        },
      },
    ];
    const remoteBtns = remoteProps
      ? remoteProps.process('SSTA_COSTSHEET_DETAIL_CUX_HEADER_BTN', allBtns, {
          searchHeader: this.init,
          editFlag,
          headerDs: this.formDs,
          loading,
          tableDs: this.tableDs,
          location: this.props.location,
        })
      : allBtns;
    return formatDynamicBtns(remoteBtns);
  };

  lineFieldEditor = (record, name) => {
    const { editFlag } = this.state;
    if (name === 'lineRemarks') return editFlag; // 行备注不受返利影响
    return editFlag && !['REBATE'].includes(record?.get('chargeLineSource'));
  };

  handleToClaim = async (sourceNum) => {
    if (!sourceNum) return;
    const { history } = this.props;
    const res = await getClaimInfo({ formNum: sourceNum });
    if (getResponse(res)) {
      const { formHeaderId } = res;
      history.push({
        pathname: '/sqam/my-claim-form/detail',
        search: querystring.stringify({ formHeaderId }),
      });
    }
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
      customizeCollapse,
      customizeCommon,
      location: { state },
      custConfig = {},
      remote: remoteProps,
    } = this.props;
    const {
      editFlag,
      chargeHeaderId,
      chargeStatus,
      approveFlag,
      updateFlag,
      readOnly,
      isPub,
      pinFixed,
      lineEdit,
      supplierLovFlag,
      docLinkFlag,
      statusData,
      isNewPub,
      readeOnly,
    } = this.state;
    // 网络错误，接口错误拦截
    if (chargeHeaderId && !this.formDs.current?.get('chargeHeaderId')) return <Spin />;
    const loading = this.formDs.status !== 'ready';
    const {
      companyId,
      supplierCompanyId,
      currencyCode,
      ouId,
      supplierSiteEnableFlag,
      amountPrecision,
      chargeNum,
      taxAmount,
      taxIncludedAmount,
      netAmount,
      showUxFlag,
      chargeHeaderSource,
    } = this.formDs.current?.toData() || {};
    const listColumns = [
      {
        name: 'costIdLov',
        width: 120,
        editor: this.lineFieldEditor,
        renderer: ({ record }) => record.toData().costName,
      },
      {
        name: 'lineNum',
        width: 100,
      },
      {
        name: 'chargeLov',
        width: 120,
        editor: this.lineFieldEditor,
      },
      {
        name: 'chargeName',
        width: 120,
      },
      {
        name: 'netAmount', // 不含税金额
        width: 120,
        editor: this.lineFieldEditor,
      },
      {
        name: 'taxRateLov',
        width: 120,
        align: 'right',
        editor: this.lineFieldEditor,
        renderer: ({ record }) => (record.toData().taxRate === 0 ? '0' : record.toData().taxRate),
      },
      {
        name: 'taxAmount', // 税额
        width: 120,
        editor: this.lineFieldEditor,
      },
      {
        name: 'taxIncludedAmount', // 含税金额
        width: 120,
        editor: this.lineFieldEditor,
      },
      {
        name: 'pcNumLov',
        width: 120,
        editor: this.lineFieldEditor,
      },
      {
        name: 'poNumLov',
        width: 120,
        editor: this.lineFieldEditor,
      },
      {
        name: 'lineRemarks',
        width: 150,
        editor: !!lineEdit || this.lineFieldEditor,
      },
      {
        name: 'treatmentMethod',
        width: 150,
        editor: this.lineFieldEditor,
      },
      !editFlag && {
        name: 'reverseLineNum',
        width: 150,
      },
      !editFlag && {
        name: 'pushSettleStatusMeaning',
        width: 150,
        renderer: ({ value, record }) =>
          statusTagRender(value, tagColor[record?.get('pushSettleStatus')]),
      },
      !editFlag && {
        name: 'pushBackMsg',
        width: 150,
        tooltip: 'overflow',
      },
      !editFlag &&
        !docLinkFlag && {
          title: intl.get('hzero.common.button.docFlow').d('单据流'),
          name: 'docFlow',
          width: 100,
          renderer: ({ record }) => (
            <DocFlow tableName="ssta_charge_line" tablePk={record.get('chargeLineId')} />
          ),
        },
      !editFlag &&
        ['REVERSED', 'COMPLETED'].includes(chargeStatus) && {
          name: 'opr',
          width: 120,
          renderer: ({ record }) => (
            <a onClick={() => this.viewExeResult(record)}>
              {intl.get(`ssta.costSheet.view.message.panel.viewexeresult`).d('查看执行情况')}
            </a>
          ),
        },
      ['REBATE'].includes(chargeHeaderSource) && {
        name: 'sourceDocumentNum',
        width: 120,
        renderer: ({ value }) => (
          <a onClick={() => this.viewSourceDocumentNum(value)}>
            {intl.get('hzero.common.view.title.detail').d('详情')}
          </a>
        ),
      },
    ];
    const linkList = [
      {
        key: 'basic',
        href: `purchase-cost-basic-${chargeHeaderId}`,
        title: intl.get(`ssta.costSheet.view.message.panel.baseInfos`).d('基本信息'),
      },
      chargeHeaderId && {
        key: 'transaction',
        href: `purchase-cost-transaction-${chargeHeaderId}`,
        title: intl.get(`ssta.costSheet.view.message.panel.transactionDetails`).d('费用明细信息'),
      },
      {
        key: 'others',
        href: `purchase-cost-others-${chargeHeaderId}`,
        title: intl.get(`ssta.costSheet.view.message.panel.othersInf`).d('其他信息'),
      },
      {
        key: 'attachment',
        href: `purchase-cost-attachment-${chargeHeaderId}`,
        title: intl.get(`ssta.costSheet.view.message.panel.attachment`).d('附件'),
      },
    ].filter((item) => item);
    const summaryProps = {
      title: intl.get(`ssta.costSheet.model.expenseSheets`).d('费用单'),
      num: chargeNum,
      currencyCode,
      taxAmount: formatNumber(taxAmount, amountPrecision),
      taxIncludedAmount: formatNumber(taxIncludedAmount, amountPrecision),
      netAmount: formatNumber(netAmount, amountPrecision),
      desc: intl.get(`ssta.costSheet.view.message.cost`).d('费用'),
      changeFixed: () => {
        this.setState({ pinFixed: !pinFixed });
      },
      totalText: intl.get(`ssta.common.view.message.costOfReconciliation`).d('费用金额汇总'),
      pinFixed,
      notPub: this.notPub && !docLinkFlag,
      showCardFlag: showUxFlag,
    };
    return (
      <Fragment>
        {isNewPub && (
          <WorkflowCard
            headerBtns={this.headerBtns()}
            formDs={this.formDs}
            customizeBtnGroup={customizeBtnGroup}
            customizeCommon={customizeCommon}
          />
        )}
        {!isNewPub && (
          <Header
            title={this.titleRender()}
            backPath={
              this.notPub && !docLinkFlag ? state?.backPath || '/ssta/new-cost-sheet/list' : null
            }
            onBack={() => {
              if (state?.backPath) {
                this.updateTabLink(state?.backPath.split('?')[1], null);
              }
            }}
          >
            {customizeBtnGroup(
              { code: 'SSTA.COST_SHEET_DETAIL.HEADER_BTNS', pro: true },
              <DynamicButtons buttons={this.headerBtns()} maxNum={5} defaultBtnType="c7n-pro" />
            )}
          </Header>
        )}
        <div
          className={Styles['ssta-detail-content']}
          id={`purchase-cost-detail-content-${chargeHeaderId}`}
        >
          <Spin spinning={loading}>
            {chargeHeaderId && !isNewPub && <Summary summaryProps={summaryProps} />}
            <div className="ssta-detail-collapse-content">
              {customizeCollapse(
                {
                  code: 'SSTA.COST_SHEET_DETAIL.COLLAPSE',
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
                      key="basic"
                      dataSet={this.formDs}
                      id={`purchase-cost-basic-${chargeHeaderId}`}
                      header={intl.get(`ssta.costSheet.view.message.panel.baseInfos`).d('基本信息')}
                    >
                      {customizeForm(
                        { code: 'SSTA.COST_SHEET_DETAIL.BASIC_INFO', readOnly },
                        <Form
                          columns={3}
                          useColon={false}
                          dataSet={this.formDs}
                          labelLayout={editFlag ? 'float' : 'vertical'}
                          useWidthPercent
                        >
                          <FormItem name="chargeNum" disabled={editFlag} />
                          <FormItem
                            name="chargeStatus"
                            disabled={editFlag}
                            renderer={({ value, record }) =>
                              editFlag
                                ? record?.get('chargeStatusMeaning')
                                : statusTagRender(
                                    record?.get('chargeStatusMeaning'),
                                    statusData[value]
                                  )
                            }
                          />
                          <FormItem name="createdByName" disabled={editFlag} />
                          <FormItem name="createdUnitLov" editor="lov" editable={editFlag} />
                          <FormItem name="creationDate" disabled={editFlag} />
                          <FormItem name="chargeHeaderSourceMeaning" disabled={editFlag} />
                          <FormItem name="reverseStatus" disabled={editFlag} />
                          <FormItem name="reverseNum" disabled={editFlag} />
                          <FormItem name="reverseDesc" disabled={editFlag} />
                          <FormItem name="companyNum" disabled={editFlag} />
                          <FormItem
                            name="companLov"
                            editor="lov"
                            disabled={chargeHeaderId}
                            editable={editFlag}
                          />
                          <FormItem
                            name="currencyLov"
                            editor="lov"
                            disabled={chargeHeaderId}
                            editable={editFlag}
                          />
                          {formItemRender({
                            name: 'displaySupplierNum',
                            editorDisabled: editFlag,
                            renderer: ({ record }) => {
                              if (chargeHeaderId) {
                                return record?.get('supplierCompanyNum');
                              } else {
                                // 平台供应商值集没有displaySupplierNum，优先展示本地供应商编码
                                const { displaySupplierNum, supplierNum, supplierCompanyNum } =
                                  record?.get('supplierCompanyLov') || {};
                                return displaySupplierNum || supplierNum || supplierCompanyNum;
                              }
                            },
                          })}
                          {formItemRender({
                            name: 'supplierCompanyLov',
                            dataSet: this.formDs,
                            editor: SupplierLov,
                            editorable: editFlag,
                            editorDisabled: chargeHeaderId,
                            visible: supplierLovFlag,
                            renderer: ({ text, record }) => {
                              return chargeHeaderId ? record?.get('supplierCompanyName') : text;
                            },
                          })}
                          {formItemRender({
                            name: 'supplierCompanyLov',
                            editor: Lov,
                            editorable: editFlag,
                            editorDisabled: chargeHeaderId,
                            visible: !supplierLovFlag,
                            renderer: ({ text, record }) => {
                              return chargeHeaderId ? record?.get('supplierCompanyName') : text;
                            },
                          })}
                          <FormItem
                            name="ouNameLov"
                            editor="lov"
                            disabled={chargeHeaderId}
                            editable={editFlag}
                          />

                          {supplierSiteEnableFlag === 1 && (
                            <FormItem
                              name="supplierSiteLov"
                              editor="lov"
                              disabled={!editFlag}
                              editable={editFlag}
                              onChange={this.supplierSiteChange}
                            />
                          )}
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
                              name="approvalOpinions"
                              editor="textarea"
                              resize="both"
                              editable={
                                Number(approveFlag) ||
                                (Number(updateFlag) && chargeStatus === 'RETURNED')
                              }
                              disabled={Number(updateFlag)}
                            />
                          )}
                          {formItemRender({
                            name: 'purOrganizationIdLov',
                            editor: Lov,
                            editorable: editFlag,
                            editorDisabled: !editFlag,
                          })}
                          {formItemRender({
                            name: 'invOrganizationLov',
                            editor: Lov,
                            editorable: editFlag,
                            editorDisabled: !editFlag,
                          })}
                          {formItemRender({
                            name: 'agentLov',
                            editor: Lov,
                            editorable: editFlag,
                            editorDisabled: !editFlag,
                          })}
                          {formItemRender({
                            name: 'sourceNum',
                            editorable: editFlag,
                            editorDisabled: true,
                            renderer: ({ text }) => {
                              return chargeHeaderSource === 'CLAIM' ? (
                                <a onClick={() => this.handleToClaim(text)}>{text}</a>
                              ) : (
                                text
                              );
                            },
                          })}
                          {remoteProps ? (
                            remoteProps.process('SSTA_COSTSHEET_DETAIL_FORM_FIELD', '', {
                              formDs: this.formDs,
                              labelLayout: editFlag ? 'float' : 'vertical',
                              readOnly: readOnly || !editFlag,
                            })
                          ) : (
                            <></>
                          )}
                        </Form>
                      )}
                    </Panel>
                  )}
                  {chargeHeaderId && (
                    <Panel
                      forceRender
                      key="transaction"
                      dataSet={this.tableDs}
                      id={`purchase-cost-transaction-${chargeHeaderId}`}
                      header={intl
                        .get(`ssta.costSheet.view.message.panel.transactionDetails`)
                        .d('费用明细信息')}
                    >
                      {customizeTable(
                        {
                          code: 'SSTA.COST_SHEET_DETAIL.TRANSACTIONDETAIL',
                          readOnly: readOnly && !lineEdit,
                          buttonCode: 'SSTA.COST_SHEET_DETAIL.LINE_BTNS',
                        },
                        <SearchBarTable
                          searchCode="SSTA.COST_SHEET_DETAIL.TRANSACTION_DETAIL_SEARCH"
                          columns={
                            remoteProps
                              ? remoteProps.process('SSTA_COSTSHEET_DETAIL_COLUMN', listColumns, {
                                  lineEdit,
                                  formDs: this.formDs,
                                  tableDs: this.tableDs,
                                  readOnly,
                                  editFlag,
                                  location,
                                })
                              : listColumns
                          }
                          dataSet={this.tableDs}
                          queryFieldsLimit={3}
                          buttons={this.getTableButtons()}
                          selectionMode={editFlag ? 'rowbox' : 'none'}
                          searchBarConfig={{
                            autoQuery: false,
                            closeFilterSelector: true,
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
                    </Panel>
                  )}
                  {remoteProps &&
                    remoteProps.process('SSTA_COSTSHEET_DETAIL_APPORTION_LIST', '', {
                      formDs: this.formDs,
                      isNewPub,
                      editFlag,
                    })}
                  {!isNewPub && (
                    <Panel
                      forceRender
                      key="others"
                      dataSet={this.formDs}
                      id={`purchase-cost-others-${chargeHeaderId}`}
                      header={intl.get(`ssta.costSheet.view.message.panel.othersInf`).d('其他信息')}
                    >
                      {customizeForm(
                        { code: 'SSTA.COST_SHEET_DETAIL.OTHERS_INFO', readOnly },
                        <Form
                          dataSet={this.formDs}
                          columns={3}
                          useColon={false}
                          labelLayout={editFlag ? 'float' : 'vertical'}
                          useWidthPercent
                        />
                      )}
                      {isPub === 0 &&
                        customizeForm(
                          {
                            code: 'SSTA.COST_SHEET_DETAIL.OTHERS.WORKFLOW',
                            readOnly: readeOnly,
                          },
                          <Form
                            dataSet={this.formDs}
                            columns={3}
                            style={{ marginTop: 10 }}
                            useColon={false}
                            labelLayout={!readeOnly ? 'float' : 'vertical'}
                            useWidthPercent
                          />
                        )}
                    </Panel>
                  )}
                  <Panel
                    forceRender
                    key="attachment"
                    dataSet={this.formDs}
                    id={`purchase-cost-attachment-${chargeHeaderId}`}
                    header={intl.get(`ssta.costSheet.view.message.panel.attachment`).d('附件')}
                  >
                    {customizeForm(
                      {
                        code: 'SSTA.COST_SHEET_DETAIL.ENCLOSURE',
                      },
                      <Form
                        dataSet={this.formDs}
                        columns={2}
                        useColon={false}
                        labelLayout={editFlag ? 'float' : 'vertical'}
                        useWidthPercent
                      >
                        <Attachment
                          name="chargeUuid"
                          showHistory={!editFlag}
                          labelLayout="float"
                          readOnly={!editFlag}
                          bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
                          bucketDirectory="ssta-file-bucket"
                          fieldClassName={Styles['attachment-float-wrapper']}
                        />
                      </Form>
                    )}
                  </Panel>
                </Collapse>
              )}
            </div>
          </Spin>
        </div>
        <NavigationAnchor
          linkList={linkList}
          currentOffsetTop={200}
          id={`purchase-cost-detail-content-${chargeHeaderId}`}
          custConfig={custConfig['SSTA.COST_SHEET_DETAIL.COLLAPSE']}
        />
      </Fragment>
    );
  }
}
