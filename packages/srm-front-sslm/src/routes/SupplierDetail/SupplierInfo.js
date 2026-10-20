/**
 * CompanyInfo - 供应商360度查询-企业信息
 * @date: 2018-08-20
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import moment from 'moment';
import { camelCase, isNumber, sum } from 'lodash';
import { connect } from 'dva';
import { Attachment } from 'choerodon-ui/pro';
import React, { PureComponent, Fragment } from 'react';
import { Row, Steps, Table, Tooltip, Icon, Badge, Modal, Form, Col, Spin } from 'hzero-ui';

import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { TopSection, SecondSection } from '_components/Section';
// import Upload from 'components/Upload';

import { Bind } from 'lodash-decorators';
// import { Content } from 'components/Page';
import ComposeTable from '@/routes/components/Compose/ComposeTable';
import { tableScrollWidth } from 'utils/utils';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import { enableRender, yesOrNoRender, dateRender, dateTimeRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
// import Upload from 'srm-front-boot/lib/components/Upload/index';
import LovMulti from 'srm-front-cuz/lib/custH0X/LovMulti';
import DynamicTable from '@/routes/components/DynamicTable/components/DynamicTable';
import {
  formatInternationalTel,
  isReview,
  reviewFile,
  downLoadFile,
  renderAttachmentText,
} from '@/routes/components/utils';
import PurchaseFinance from './PurchaseFinance';
// import './index.less';
import styles from './index.less';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

const { Step } = Steps;

/**
 * 供应商360度查询 - 供应商信息
 * @extends {Component} - React.Component
 * @reactProps {Object} contactsData - 联系人数据源
 * @reactProps {Object} addressData - 地址数据源
 * @reactProps {Object} bankAccountData - 银行账户数据源
 * @return React.element
 */
@formatterCollections({
  code: [
    'sslm.supplierDetail',
    'sslm.supplyAbility',
    'sslm.commonApplication',
    'sslm.evaluationQuery',
    'entity.bank',
    'sslm.supplierInform',
  ],
})
@connect(({ user = {} }) => {
  const { currentUser: { themeConfigVO = {} } = {} } = user;
  const {
    enableThemeConfig, // 是否开启了新主题
    colorCode, // 主题色
    fontFileId,
    componentColorList, // 组件主题列表
  } = themeConfigVO;
  let themeConfig = {};
  if (enableThemeConfig) {
    const componentsColor = getComponentsThemeColor(componentColorList, colorCode);
    themeConfig = {
      primaryColor: colorCode,
      tabsPrimaryColor: componentsColor['tabs-primary-color'],
      linkColor: componentsColor['link-color'],
      anchorColor: componentsColor['anchor-primary-color'],
      fontFamily: `font-${fontFileId}`, // 字体
    };
  }
  return {
    ...themeConfig,
  };
})
export default class EnterpriseInfo extends PureComponent {
  state = {
    hanldeSteps: 'hide-step', // 显示/隐藏样式
    showMoreStatus: intl.get('sslm.supplierDetail.model.button.more').d('更多...'), // 按钮显示状态
    ouVisible: false,
    attachmentModalVisible: false,
    ouList: [],
  };

  componentDidMount() {
    const { remote } = this.props;
    if (remote.event) {
      remote.event.fireEvent('supplierInfoInit', { that: this });
    }
  }

  /**
   * 控制供应商生命周期步骤显示隐藏
   */
  @Bind()
  handleSteps() {
    const { hanldeSteps } = this.state;
    this.setState({
      hanldeSteps: hanldeSteps === 'hide-step' ? 'show-step' : 'hide-step',
      showMoreStatus:
        hanldeSteps === 'hide-step'
          ? intl.get('sslm.supplierDetail.model.suDe.hidden').d('隐藏')
          : intl.get('sslm.supplierDetail.model.button.more').d('更多...'),
    });
  }

  /**
   * 获取ou层信息
   * @param {*} record
   */
  @Bind()
  handleFetchOu(record) {
    const { dispatch, modelName } = this.props;
    const { supplierSyncEbsAddrId } = record;
    this.setState({
      ouVisible: true,
    });
    dispatch({
      type: `${modelName}/fetchOuList`,
      payload: {
        supplierSyncEbsAddrId,
      },
    }).then(ouList => {
      if (ouList) {
        this.setState({
          ouList,
        });
      }
    });
  }

  @Bind()
  handleOuClose() {
    const { dispatch, modelName } = this.props;
    this.setState({
      ouVisible: false,
    });
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        ouList: [],
      },
    });
  }

  @Bind()
  renderText(_, record) {
    if (record.attachmentTypeMeaning && record.subAttachmentMeaning) {
      return <span>{`${record.attachmentTypeMeaning} / ${record.subAttachmentMeaning}`}</span>;
    } else {
      return <span>{record.attachmentTypeMeaning || record.subAttachmentMeaning}</span>;
    }
  }

  /**
   * 开票信息
   */
  @Bind()
  renderInvoiceForm() {
    const {
      companyInfo: { invoice = {} } = {},
      customizeForm,
      form: { getFieldDecorator },
    } = this.props;
    return customizeForm(
      { code: 'SSLM.SUPPLIER_LIFE_CYCLE.INVOICE_INFO' },
      <Form className="ued-edit-form" id="invoiceInfo">
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierDetail.model.companyInfo.invoiceHeader').d('发票头')}
            >
              {getFieldDecorator('invoiceHeader', {
                initialValue: invoice && invoice.invoiceHeader,
              })(<span>{invoice && invoice.invoiceHeader}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.enterpriseInform.view.model.invoice.taxNumber').d('税务登记号')}
            >
              {getFieldDecorator('taxRegistrationNumber', {
                initialValue: invoice && invoice.taxRegistrationNumber,
              })(<span>{invoice && invoice.taxRegistrationNumber}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.enterpriseInform.view.model.invoice.depositBank').d('开户行')}
            >
              {getFieldDecorator('depositBank', {
                initialValue: invoice && invoice.depositBank,
              })(<span>{invoice && invoice.depositBank}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.view.model.invoice.bankAccountNum')
                .d('开户行账号')}
            >
              {getFieldDecorator('bankAccountNum', {
                initialValue: invoice && invoice.bankAccountNum,
              })(<span>{invoice && invoice.bankAccountNum}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="half-row">
          <Col span={12}>
            <FormItem
              label={intl.get('sslm.supplierDetail.model.companyInfo.taxAddress').d('税务登记地址')}
            >
              {getFieldDecorator('taxRegistrationAddress', {
                initialValue: invoice && invoice.taxRegistrationAddress,
              })(<span>{invoice && invoice.taxRegistrationAddress}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierDetail.model.companyInfo.taxPhone').d('税务登记电话')}
            >
              {getFieldDecorator('taxRegistrationPhone', {
                initialValue: invoice && invoice.taxRegistrationPhone,
              })(<span>{invoice && invoice.taxRegistrationPhone}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.model.invoice.taker').d('收票人')}
            >
              {getFieldDecorator('receiver', {
                initialValue: invoice && invoice.receiver,
              })(<span>{invoice && invoice.receiver}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.view.model.invoice.receiveMail')
                .d('收票人邮箱')}
            >
              {getFieldDecorator('receiveMail', {
                initialValue: invoice && invoice.receiveMail,
              })(<span>{invoice && invoice.receiveMail}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.supplierDetail.model.companyInfo.receivePhone')
                .d('收票人手机号')}
            >
              {getFieldDecorator('receivePhone', {
                initialValue: formatInternationalTel(
                  invoice && invoice.internationalTelMeaning,
                  invoice && invoice.receivePhone
                ),
              })(
                <span>
                  {formatInternationalTel(
                    invoice && invoice.internationalTelMeaning,
                    invoice && invoice.receivePhone
                  )}
                </span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="half-row">
          <Col span={12}>
            <FormItem label={intl.get('sslm.common.model.invoice.ticketAddress').d('收票地址')}>
              {getFieldDecorator('receiveAddress', {
                initialValue: invoice && invoice.receiveAddress,
              })(<span>{invoice && invoice.receiveAddress}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 其他信息
   */
  @Bind()
  renderOtherForm() {
    const {
      customizeForm,
      form,
      form: { getFieldDecorator },
      otherInfo = {},
    } = this.props;
    return customizeForm(
      {
        code: 'SSLM.SUPPLIER_LIFE_CYCLE.OTHER_INFO',
        form,
        dataSource: otherInfo,
      },
      <Form className="ued-edit-form" id="otherInfo">
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.commonApplication.model.coApp.blacklistExpiryDate')
                .d('黑名单失效时间')}
            >
              {getFieldDecorator('blacklistExpiryDate', {
                initialValue: otherInfo.blacklistExpiryDate
                  ? moment(otherInfo.blacklistExpiryDate, DEFAULT_DATE_FORMAT)
                  : null,
              })(<span>{dateRender(otherInfo.blacklistExpiryDate)}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.model.paymentTerms').d('付款条款')}
            >
              {getFieldDecorator('termName', {
                initialValue: otherInfo && otherInfo.termName,
              })(<span>{otherInfo && otherInfo.termName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.model.paymentWay').d('付款方式')}
            >
              {getFieldDecorator('typeName', {
                initialValue: otherInfo && otherInfo.typeName,
              })(<span>{otherInfo && otherInfo.typeName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem {...formItemLayout} label={intl.get('sslm.common.stage.temporary').d('临时')}>
              {getFieldDecorator('tempFlag', {
                initialValue: otherInfo && otherInfo.tempFlag,
              })(<span>{otherInfo && yesOrNoRender(otherInfo.tempFlag)}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.model.dateTo').d('有效期至')}
            >
              {getFieldDecorator('tempEndDate', {
                initialValue: otherInfo.tempEndDate
                  ? moment(otherInfo.tempEndDate, DEFAULT_DATE_FORMAT)
                  : null,
              })(<span>{otherInfo.tempEndDate ? dateRender(otherInfo.tempEndDate) : '-'}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 供货能力清单附件modal的显示、隐藏
   */
  @Bind()
  handleAttachmentModal(record = {}) {
    const { abilityLineId } = record;
    const { attachmentModalVisible } = this.state;
    const { queryAttachment, capacityAttachmentPagination } = this.props;
    this.setState({ attachmentModalVisible: !attachmentModalVisible, abilityLineId });
    if (!attachmentModalVisible) {
      queryAttachment(capacityAttachmentPagination, abilityLineId);
    }
  }

  // 渲染阶段表单
  @Bind()
  renderStageForm({ data, onRedirect, isPub }) {
    const {
      form,
      custLoading,
      customizeForm,
      form: { getFieldDecorator },
    } = this.props;
    const { documentFromHistory } = data || {};
    return customizeForm(
      {
        code: 'SSLM.SUPPLIER_LIFE_CYCLE.STAGE_FORM',
        form,
        dataSource: data,
      },
      <Form className={styles['stage-form']} custLoading={custLoading}>
        <Row gutter={24}>
          <Col span={6}>
            <FormItem {...formItemLayout}>
              {getFieldDecorator('reqProcessDate', {
                initialValue: data && data.reqProcessDate,
              })(<span>{data && data.reqProcessDate}</span>)}
            </FormItem>
          </Col>
          {!isPub && (
            <Col span={6}>
              <FormItem {...formItemLayout}>
                {getFieldDecorator('viewApplicationForm')(
                  <a
                    className="aIconstyle"
                    onClick={() => onRedirect(data)}
                    style={data.applyFlag === 0 ? { display: 'none' } : { display: '' }}
                  >
                    {intl
                      .get('sslm.supplierDetail.view.message.step.viewApplicationForm')
                      .d('申请单查看')}
                  </a>
                )}
              </FormItem>
            </Col>
          )}
          {documentFromHistory === 'MANUALLY' && (
            <Col span={6}>
              <FormItem
                {...formItemLayout}
                label={intl.get('sslm.supplierDetail.view.message.step.proposer').d('申请人')}
              >
                {getFieldDecorator('proposer', {
                  initialValue: data && data.proposer,
                })(<span>{data && data.proposer}</span>)}
              </FormItem>
            </Col>
          )}
          {documentFromHistory === 'MANUALLY' && (
            <Col span={6}>
              <FormItem
                {...formItemLayout}
                label={intl.get('sslm.supplierDetail.view.message.step.approver').d('审批人')}
              >
                {getFieldDecorator('approver', {
                  initialValue: data && data.approver,
                })(<span>{data && data.approver}</span>)}
              </FormItem>
            </Col>
          )}
        </Row>
      </Form>
    );
  }

  render() {
    const {
      form,
      remote,
      contactsData = [],
      addressData = [],
      bankAccountData = [],
      questionnaireTmpl = [],
      lifeCycleSteps = [],
      tmplDataSource = {},
      supplierCatagoryData = [], // 供应商分类数据
      supplierCapacityData = [], // 供货能力清单数据
      onRedirect,
      queryAttachment,
      purchaseList = [], // 采购/财务信息
      purchaseListPagination = {}, // 采购/财务信息分页
      queryPurchaseList = () => {},
      purchaseFormList = {}, // 采购/财务表单信息
      destinationList = [], // 地点层信息
      // ouList = [], // ou层信息
      loading,
      // headerInfo = {}, // Modal头信息
      customizeForm,
      customizeTable,
      getHocInstance,
      capacityAttachmentData,
      capacityAttachmentPagination,
      companyInfo = {},
      tableList = [],
      siteFlag = 0,
      isPub = false,
      localDestinationList = [], // 本地地点层信息
      queryOtherLoading,
      linkColor,
    } = this.props;
    // 调查表银行账户 // 调查表联系人 // 调查表地址信息
    const {
      sslminvestgbankaccount = [],
      sslminvestgcontact = [],
      sslminvestgaddress = [],
      sslminvestgattachment = [],
    } = tmplDataSource;
    const {
      hanldeSteps,
      showMoreStatus,
      ouVisible,
      attachmentModalVisible,
      abilityLineId,
      ouList = [], // ou层信息
    } = this.state;
    const investgContact =
      questionnaireTmpl.length > 0 &&
      questionnaireTmpl.find(item => item.configName === 'sslm_investg_contact') &&
      questionnaireTmpl.find(item => item.configName === 'sslm_investg_contact')
        .investigateConfigLines &&
      questionnaireTmpl
        .find(item => item.configName === 'sslm_investg_contact')
        .investigateConfigLines.map(line => {
          return { ...line, fieldCode: camelCase(line.fieldCode) };
        });
    const investgAddress =
      questionnaireTmpl.length > 0 &&
      questionnaireTmpl.find(item => item.configName === 'sslm_investg_address') &&
      questionnaireTmpl.find(item => item.configName === 'sslm_investg_address')
        .investigateConfigLines &&
      questionnaireTmpl
        .find(item => item.configName === 'sslm_investg_address')
        .investigateConfigLines.map(line => {
          return { ...line, fieldCode: camelCase(line.fieldCode) };
        });
    const investgBankAccount =
      questionnaireTmpl.length > 0 &&
      questionnaireTmpl.find(item => item.configName === 'sslm_investg_bank_account') &&
      questionnaireTmpl.find(item => item.configName === 'sslm_investg_bank_account')
        .investigateConfigLines &&
      questionnaireTmpl
        .find(item => item.configName === 'sslm_investg_bank_account')
        .investigateConfigLines.map(line => {
          return { ...line, fieldCode: camelCase(line.fieldCode) };
        });
    // 附件信息
    const investgAttachment =
      questionnaireTmpl.length > 0 &&
      questionnaireTmpl.find(item => item.configName === 'sslm_investg_attachment') &&
      questionnaireTmpl.find(item => item.configName === 'sslm_investg_attachment')
        .investigateConfigLines &&
      questionnaireTmpl
        .find(item => item.configName === 'sslm_investg_attachment')
        .investigateConfigLines.map(line => {
          return { ...line, fieldCode: camelCase(line.fieldCode) };
        });
    const { attachmentList } = companyInfo;
    const style = { margin: 0, padding: 0, whiteSpace: 'nowrap' };
    // 采购财务props
    const purchaseFinanceProps = {
      form,
      customizeForm,
      customizeTable,
      purchaseFormList,
      purchaseList,
      purchaseListPagination,
      queryPurchaseList,
    };
    const supplyStatusTip = (
      <React.Fragment>
        <p style={style}>
          {intl.get(`sslm.supplyAbility.model.supAbility.supplyStatus`).d('可供状态')}-G：
          {intl.get(`sslm.supplyAbility.view.message.supplyStatusG`).d('Green, 表示供货能力强')};
        </p>
        <p style={style}>
          {intl.get(`sslm.supplyAbility.model.supAbility.supplyStatus`).d('可供状态')}-Y：
          {intl
            .get(`sslm.supplyAbility.view.message.supplyStatusY`)
            .d('Yellow, 表示供货能力有风险')}
          ;
        </p>
        <p style={style}>
          {intl.get(`sslm.supplyAbility.model.supAbility.supplyStatus`).d('可供状态')}-R：
          {intl.get(`sslm.supplyAbility.view.message.supplyStatusR`).d('Red, 表示供货能力严重不足')}
          ;
        </p>
      </React.Fragment>
    );
    // 复用
    const psaTip = intl
      .get(`sslm.supplyAbility.view.message.psaTip`)
      .d(
        'PSA即Probabilistic  Safety Assessment，概率安全评价，也常称为概率风险评价（PRA），是以概率论为基础的风险量化评价技术。PSA评级即将概率风险指标量化，划分等级。'
      );
    const psaScoreTip = intl
      .get(`sslm.supplyAbility.view.message.psaScoreTip`)
      .d(
        'PSA即Probabilistic  Safety Assessment，概率安全评价，也常称为概率风险评价（PRA），是以概率论为基础的风险量化评价技术。PSA评分即将概率风险指标量化，进行打分。'
      );
    const psaFinishDate = intl
      .get(`sslm.supplyAbility.view.message.psaFinishDate`)
      .d('风险量化评价的完成时间。');
    const spaTip = intl
      .get(`sslm.supplyAbility.view.message.spaTip`)
      .d(
        'SPA即Safety Comprehensive Assessment，安全综合评价，可避免企业选用不安全的流程或原材料，可降低或消除现实危险性。SPA评级即将安全指标量化，划分等级。'
      );
    const spaScore = intl
      .get(`sslm.supplyAbility.view.message.spaScore`)
      .d(
        'SPA即Safety Comprehensive Assessment，安全综合评价，可避免企业选用不安全的流程或原材料，可降低或消除现实危险性。SPA评分即将安全指标量化，进行打分。'
      );
    const spaFinishDate = intl
      .get(`sslm.supplyAbility.view.message.spaFinishDate`)
      .d('安全综合评价的完成时间。');
    const supplierCatagoryColumns = [
      {
        title: intl.get('sslm.commonApplication.model.coApp.supCategoryCode').d('供应商分类代码'),
        width: 200,
        dataIndex: 'categoryCode',
      },
      {
        title: intl
          .get('sslm.commonApplication.model.coApp.supCategoryDescription')
          .d('供应商分类描述'),
        width: 200,
        dataIndex: 'categoryDescription',
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.supEvaluationLevel').d('评级'),
        width: 160,
        dataIndex: 'evaluationLevel',
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.supEvaluationScore').d('评分'),
        width: 120,
        dataIndex: 'evaluationScore',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 120,
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      // {
      //   title: intl.get('sslm.commonApplication.model.coApp.alterReason').d('变更理由'),
      //   width: 140,
      //   dataIndex: 'alterReason',
      // },
      // {
      //   title: intl.get('sslm.commonApplication.model.coApp.alterDate').d('变更时间'),
      //   width: 140,
      //   dataIndex: 'alterDate',
      //   render: dateRender,
      // },
    ];
    //  供货能力清单
    const supplierCapacityColumns = [
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 140,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.itemName`).d('物料描述'),
        dataIndex: 'itemName',
        width: 140,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCategoryCode`).d('品类代码'),
        dataIndex: 'itemCategoryCode',
        width: 140,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.categoryName`).d('品类名称'),
        dataIndex: 'itemCategoryName',
        width: 140,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.supplyFlag`).d('是否可供'),
        dataIndex: 'supplyFlag',
        width: 90,
        render: value => {
          return (
            <Badge
              status={value === 1 ? 'success' : 'error'}
              text={
                value === 1
                  ? intl.get('hzero.common.status.yes').d('是')
                  : intl.get('hzero.common.status.no').d('否')
              }
            />
          );
        },
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.adapterProducts`).d('适配产品'),
        dataIndex: 'adapterProducts',
        width: 140,
      },
      {
        title: intl.get('sslm.supplyAbility.model.supplyAbility.countryIdMeaning').d('服务国家'),
        width: 140,
        dataIndex: 'countryIdMeaning',
      },
      {
        title: intl.get('sslm.supplyAbility.model.supplyAbility.regionIdMeaning').d('服务地区'),
        width: 140,
        dataIndex: 'regionIdMeaning',
      },
      {
        title: intl.get('sslm.supplyAbility.model.supplyAbility.cityIdMeaning').d('服务城市'),
        width: 140,
        dataIndex: 'cityIdMeaning',
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.dateFrom`).d('有效期从'),
        dataIndex: 'dateFrom',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.dateTo`).d('有效期至'),
        dataIndex: 'dateTo',
        width: 120,
        render: dateRender,
      },
      {
        title: (
          <Tooltip title={supplyStatusTip}>
            {intl.get(`sslm.supplyAbility.model.supplyAbility.supplyStatus`).d('可供状态')}
            <Icon style={{ fontSize: 14 }} type="exclamation" />
          </Tooltip>
        ),
        width: 140,
        dataIndex: 'supplyStatus',
        onCell: record => {
          if (record.supplyStatus === 'G') {
            return { className: styles['table-column-g'] };
          } else if (record.supplyStatus === 'Y') {
            return { className: styles['table-column-y'] };
          } else if (record.supplyStatus === 'R') {
            return { className: styles['table-column-r'] };
          } else {
            return {};
          }
        },
      },
      {
        title: (
          <Tooltip title={psaTip}>
            {intl.get(`sslm.supplyAbility.model.supplyAbility.psaLevel`).d('PSA评级')}
            <Icon style={{ fontSize: 14 }} type="exclamation" />
          </Tooltip>
        ),
        width: 140,
        dataIndex: 'psaEvaluationLevel',
      },
      {
        title: (
          <Tooltip title={psaScoreTip}>
            {intl.get(`sslm.supplyAbility.model.supplyAbility.psaScore`).d('PSA评分')}
            <Icon style={{ fontSize: 14 }} type="exclamation" />
          </Tooltip>
        ),
        width: 160,
        dataIndex: 'psaEvaluationScore',
      },
      {
        title: (
          <Tooltip title={psaFinishDate}>
            {intl.get(`sslm.supplyAbility.model.supplyAbility.psaFinishDate`).d('PSA完成时间')}
            <Icon style={{ fontSize: 14 }} type="exclamation" />
          </Tooltip>
        ),
        width: 160,
        dataIndex: 'psaFinishDate',
        render: dateRender,
      },
      {
        title: (
          <Tooltip title={spaTip}>
            {intl.get(`sslm.supplyAbility.model.supplyAbility.spaLevel`).d('SPA评级')}
            <Icon style={{ fontSize: 14 }} type="exclamation" />
          </Tooltip>
        ),
        width: 160,
        dataIndex: 'spaEvaluationLevel',
      },
      {
        title: (
          <Tooltip title={spaScore}>
            {intl.get(`sslm.supplyAbility.model.supplyAbility.spaScore`).d('SPA评分')}
            <Icon style={{ fontSize: 14 }} type="exclamation" />
          </Tooltip>
        ),
        width: 160,
        dataIndex: 'spaEvaluationScore',
      },
      {
        title: (
          <Tooltip title={spaFinishDate}>
            {intl.get(`sslm.supplyAbility.model.supplyAbility.spaFinishDate`).d('SPA完成时间')}
            <Icon style={{ fontSize: 14 }} type="exclamation" />
          </Tooltip>
        ),
        width: 160,
        dataIndex: 'spaFinishDate',
        render: dateRender,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.evaluateRemark`).d('评价信息'),
        width: 200,
        dataIndex: 'evaluateRemark',
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.quotaRatio`).d('配额'),
        dataIndex: 'quotaRatio',
        width: 200,
      },
      {
        title: intl
          .get(`sslm.supplyAbility.model.supplyAbility.inventoryOrganization`)
          .d('库存组织'),
        width: 100,
        dataIndex: 'inventoryOrganizationId',
        render: value => {
          return <LovMulti code="SSLM.INV_ORGANIZATION" value={value} viewOnly />;
        },
      },
      {
        title: intl.get('hzero.common.upload.modal.title').d('附件'),
        width: 130,
        dataIndex: 'attachmentUuid',
        render: (_, record) => (
          <a onClick={() => this.handleAttachmentModal(record)}>
            {renderAttachmentText({ editable: false, fileCount: record.fileCount, linkColor })}
          </a>
        ),
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.purchGroup`).d('采购组'),
        width: 120,
        dataIndex: 'createUserDepartment',
      },
      {
        title: intl
          .get(`sslm.supplyAbility.model.supplyAbility.purchasingOrganization`)
          .d('采购组织'),
        dataIndex: 'purchaseOrganizationName',
        width: 150,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.manufacturer`).d('生产厂家'),
        dataIndex: 'manufacturer',
        width: 150,
      },
      {
        title: intl
          .get(`sslm.supplyAbility.model.supplyAbility.lastUpdateUserName`)
          .d('最后更新人'),
        dataIndex: 'lastUpdateUserName',
        width: 150,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.lastUpdateDate`).d('最后更新日期'),
        dataIndex: 'lastUpdateDate',
        width: 150,
        render: dateRender,
      },
    ];
    // 供货能力清单附件
    const capacityAttachmentColumns = [
      {
        title: intl.get('sslm.common.view.attachment.name').d('附件名称'),
        dataIndex: 'attachmentDesc',
        width: 150,
        render: (val, record) => {
          return isReview(record.attachmentDesc) && record.attachmentUrl ? (
            <a
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => reviewFile(record.attachmentDesc, record.attachmentUrl)}
            >
              {val}
            </a>
          ) : (
            val
          );
        },
      },
      {
        title: intl.get('sslm.common.view.attachment.size').d('附件大小(MB)'),
        dataIndex: 'attachmentSize',
        width: 130,
        render: value => {
          if (value) {
            const size = `${value / (1024 * 1024)}`;
            return size.substring(0, 5);
          } else {
            return 0;
          }
        },
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.realName`).d('上传人'),
        dataIndex: 'uploadUserName',
        width: 120,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.uploadDate`).d('上传时间'),
        dataIndex: 'uploadDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.attachmentType`).d('文件类型'),
        width: 150,
        dataIndex: 'attachmentType',
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.maturityDate`).d('文件到期日'),
        width: 200,
        dataIndex: 'dueDate',
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 200,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'option',
        width: 80,
        render: (_, record) => {
          const { tenantId, attachmentUrl } = record;
          return (
            record.attachmentUrl && (
              <a
                href={downLoadFile({ tenantId, attachmentUrl })}
                target="_blank"
                rel="noopener noreferrer"
              >
                {intl.get('hzero.common.button.download').d('下载')}
              </a>
            )
          );
        },
      },
    ];
    // 地点层信息
    const destinationColumns = [
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.countryName').d('国家'),
        dataIndex: 'countryName',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.regionIds').d('地区'),
        dataIndex: 'regionName',
        width: 100,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.city').d('城市'),
        dataIndex: 'city',
        width: 150,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.addressDetail').d('详细地址'),
        dataIndex: 'address',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.supplierAddress').d('供应商地点'),
        dataIndex: 'supplierAddressMeaning',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.name').d('联系人'),
        dataIndex: 'name',
        width: 100,
      },
      {
        title: intl
          .get('sslm.supplierInform.model.supplierInform.partnerContactPhone')
          .d('联系方式'),
        width: 120,
        dataIndex: 'mobilephone',
      },
      {
        title: intl.get('sslm.supplierInform.button.button.ou').d('OU层信息'),
        width: 100,
        dataIndex: 'receivePhone',
        render: (_, record) => {
          return (
            <span className="action-link">
              <a onClick={() => this.handleFetchOu(record)}>
                {intl.get('sslm.supplierInform.button.button.ou').d('OU层信息')}
              </a>
            </span>
          );
        },
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        width: 60,
        render: val => {
          return yesOrNoRender(val);
        },
      },
    ];
    // 本地供应商地点层信息
    const localDestinationColumns = [
      {
        title: intl.get('sslm.supplierDetail.model.supplierDetail.supplierSiteName').d('地点名称'),
        dataIndex: 'supplierSiteName',
        width: 180,
      },
      {
        title: intl.get('sslm.supplierDetail.model.supplierDetail.ouCode').d('业务实体'),
        dataIndex: 'ouName',
        width: 180,
      },
    ];
    // OU层信息
    const ouColumns = [
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.ouId').d('OU层'),
        dataIndex: 'ouName',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.billPeriod').d('账期'),
        width: 200,
        dataIndex: 'billPeriodMeaning',
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.paymentTypeCode').d('付款方式'),
        dataIndex: 'typeName',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.ticketDay').d('票据天数'),
        dataIndex: 'ticketDay',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierInform.view.model.supplierInform.supplyPoint').d('付款条件'),
        dataIndex: 'termName',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.bankCode').d('银行代码'),
        dataIndex: 'bankCode',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.bankName').d('银行名称'),
        dataIndex: 'bankName',
        width: 150,
      },
      {
        title: intl
          .get('sslm.supplierInform.view.model.supplierInform.depositBank')
          .d('开户行名称'),
        dataIndex: 'bankBranchName',
        width: 150,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.bankAccountNum').d('银行账号'),
        dataIndex: 'bankAccountNum',
        width: 150,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.bankFirm').d('联行行号'),
        dataIndex: 'bankFirm',
        width: 150,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.taxRate').d('税率'),
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.currencyName').d('币种'),
        dataIndex: 'currencyName',
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.createDate').d('层创建日期'),
        dataIndex: 'creationDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.expirationDate').d('层失效日期'),
        dataIndex: 'expirationDate', // TODO: 字段待确认
        width: 120,
        render: dateRender,
      },
    ];
    //
    const contactsColumns = [
      {
        title: intl.get('sslm.supplierDetail.model.suDe.contactsData.name').d('姓名'),
        dataIndex: 'name',
        width: 100,
      },
      {
        title: intl.get('sslm.supplierDetail.model.suDe.contactsData.gender').d('性别'),
        dataIndex: 'genderMeaning',
        width: 60,
      },
      {
        title: intl.get('sslm.supplierDetail.model.suDe.contactsData.mail').d('邮箱'),
        dataIndex: 'mail',
        width: 180,
      },
      {
        title: intl.get('sslm.supplierDetail.model.suDe.contactsData.mobilephone').d('手机号码'),
        dataIndex: 'mobilephone',
        width: 200,
        render: (val, record) => formatInternationalTel(record.internationalTelMeaning, val),
      },
      {
        title: intl.get('sslm.supplierDetail.view.model.contactPerson.contactType').d('联系人类型'),
        dataIndex: 'contactTypeMeaning',
        width: 100,
      },
      {
        title: intl.get('sslm.supplierDetail.model.suDe.contactsData.department').d('部门'),
        dataIndex: 'department',
        width: 100,
      },
      {
        title: intl.get('sslm.supplierDetail.model.suDe.contactsData.position').d('职位'),
        dataIndex: 'position',
        width: 100,
      },
      {
        title: intl.get('sslm.supplierDetail.model.suDe.contactsData.telephone').d('固定电话'),
        dataIndex: 'telephone',
        width: 150,
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'description',
        width: 150,
      },
      {
        title: intl.get('sslm.supplierDetail.model.suDe.contactsData.defaultFlag').d('默认联系人'),
        dataIndex: 'defaultFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        width: 80,
        render: yesOrNoRender,
      },
    ];
    const addressColumns = [
      {
        title: intl.get('sslm.supplierDetail.model.suDe.addressData.countryName').d('国家'),
        dataIndex: 'countryName',
        width: 120,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.address.regionPathName').d('省/市/区'),
        dataIndex: 'regionName',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierDetail.model.suDe.addressData.businessAddress').d('经营地址'),
        dataIndex: 'addressDetail',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierDetail.model.suDe.addressData.postCode').d('邮政编码'),
        dataIndex: 'postCode',
        width: 120,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.address.description').d('地址备注'),
        dataIndex: 'description',
        width: 150,
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        width: 80,
        render: yesOrNoRender,
      },
    ];
    const bankAccountColumns = [
      {
        title: intl.get('sslm.supplierDetail.view.message.bankCountryName').d('国家'),
        width: 150,
        dataIndex: 'bankCountryId',
        render: (_, record) => record.bankCountryName,
      },
      {
        title: intl.get('sslm.supplierDetail.view.message.bankCode').d('银行编码'),
        dataIndex: 'bankCode',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierDetail.view.message.bankName').d('银行名称'),
        dataIndex: 'bankName',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierDetail.view.message.bankFirm').d('联行行号'),
        dataIndex: 'bankFirm',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierDetail.model.bankAccountData.bankBranchName').d('开户行名称'),
        dataIndex: 'bankBranchName',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierDetail.model.bankAccountData.bankAccountName').d('账户名称'),
        dataIndex: 'bankAccountName',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierDetail.view.message.bankAccount').d('银行账户'),
        dataIndex: 'bankAccountNum',
        width: 120,
      },
      {
        title: intl.get('spfm.bank.model.bank.intlBankAccount').d('IBAN码'),
        dataIndex: 'intlBankAccountNum',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierDetail.view.message.accountNature').d('账户性质'),
        dataIndex: 'accountNatureMeaning',
        width: 160,
      },
      {
        title: intl.get('sslm.supplierDetail.view.message.accountPurpose').d('账户用途'),
        dataIndex: 'accountPurposeMeaning',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierDetail.view.message.currencyName').d('币种'),
        dataIndex: 'currencyIdMeaning',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierDetail.view.message.paymentType').d('付款方式'),
        dataIndex: 'paymentTypeIdMeaning',
        width: 120,
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        width: 80,
        render: yesOrNoRender,
      },
      {
        title: intl.get('sslm.supplierDetail.view.message.primaryAccount').d('主账号'),
        dataIndex: 'masterFlag',
        width: 100,
        render: (_, record) => yesOrNoRender(record.mainAccountFlag),
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 200,
      },
    ];
    // 附件信息(企业认证)
    const attachmentColumns = [
      {
        title: intl.get('sslm.supplierDetail.model.supplierDetail.attachmentType').d('附件类型'),
        dataIndex: 'attachmentTypeMeaning',
        width: 160,
        render: this.renderText,
      },
      {
        title: intl.get('sslm.supplierDetail.model.supplierDetail.description').d('附件描述'),
        dataIndex: 'description',
        width: 160,
      },
      {
        title: intl.get('sslm.supplierDetail.model.supplierDetail.attachmentMessage').d('附件信息'),
        dataIndex: 'attachmentUuid',
        width: 160,
        render: text => (
          <Attachment
            icon=""
            readOnly
            value={text}
            viewMode="popup"
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="sslm-attachment"
            queryArgs={{ body: { pageCode: '360_PAGE' } }}
          />
        ),
      },
      {
        title: intl.get('sslm.supplierDetail.model.supplierDetail.endDate').d('文件到期日'),
        dataIndex: 'endDate',
        width: 160,
      },
      {
        title: intl.get('sslm.supplierInform.model.attachment.longEffective').d('是否长期有效'),
        dataIndex: 'longEffectiveFlag',
        width: 120,
        render: text => yesOrNoRender(text),
      },
      {
        title: intl
          .get('sslm.enterpriseInform.model.attachment.supplierAttFlag')
          .d('供方附件是否必传'),
        dataIndex: 'supplierAttFlag',
        width: 130,
        render: text => yesOrNoRender(text),
      },
      {
        title: intl.get('sslm.supplierDetail.model.supplierDetail.addressDetail').d('最后上传日期'),
        dataIndex: 'uploadDate',
        width: 160,
        render: dateRender,
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 200,
      },
    ];
    const supplierCapacityScrollX = sum(
      supplierCapacityColumns.map(n => (isNumber(n.width) ? n.width : 0))
    );
    const destinationScrollX = sum(destinationColumns.map(n => (isNumber(n.width) ? n.width : 0)));
    return (
      <Fragment>
        <TopSection
          title={intl
            .get('sslm.supplierDetail.view.message.title.supplierInformation')
            .d('供应商信息')}
          code="SSLM.SUPPLIER_LIFE_CYCLE.SUPPLIER_INFO_CARDS"
          getHocInstance={getHocInstance}
          className={styles['supplier-top-section']}
        >
          <SecondSection
            title={intl
              .get('sslm.supplierDetail.view.message.title.supplierLifetime')
              .d('供应商生命周期')}
            code="supplierLifetime"
          >
            <div id="supplierLifetime">
              <Steps direction="vertical" size="small" className="supplier-steps">
                {lifeCycleSteps.length > 0 &&
                  lifeCycleSteps.map((step, index) => {
                    return (
                      <Step
                        key={step.reqProcessDate}
                        status={step.processStatus ? 'process' : 'finish'}
                        title={step.reqStage}
                        className={index <= 1 ? 'show-step' : hanldeSteps}
                        // description={`${date} 申请人：${step.proposer} 审批人：${step.approver}`}
                        description={
                          <React.Fragment>
                            {(step.documentFromHistoryMeaning || step.relationNumber) && (
                              <div style={{ padding: '4px 0' }}>
                                {step.documentFromHistoryMeaning && (
                                  <span>【{step.documentFromHistoryMeaning}】</span>
                                )}
                                {step.relationNumber && (
                                  <Fragment>
                                    <span>
                                      {intl
                                        .get('sslm.supplierDetail.view.step.relationNumber')
                                        .d('单据号')}
                                      :{' '}
                                    </span>
                                    <span>{step.relationNumber}</span>
                                  </Fragment>
                                )}
                              </div>
                            )}
                            {this.renderStageForm({ data: step, onRedirect, isPub })}
                          </React.Fragment>
                        }
                      />
                    );
                  })}
              </Steps>
              {lifeCycleSteps.length > 0 && lifeCycleSteps.length > 2 && (
                <Row style={{ marginLeft: '24px' }}>
                  <a onClick={this.handleSteps}>{showMoreStatus}</a>
                </Row>
              )}
            </div>
          </SecondSection>
          {remote &&
            remote.render('SSLM_SUPPLIER_DETAIL_SUPPLIER_INFO_AFTER_LIFE_TIME_INFO', <></>, {
              _this: this,
            })}
          <SecondSection
            title={intl.get('sslm.supplierDetail.view.message.title.supplierContact').d('联系人')}
            code="supplierContact"
          >
            <div id="supplierContact">
              {questionnaireTmpl.length > 0 &&
              questionnaireTmpl.find(item => item.configName === 'sslm_investg_contact') ? (
                <ComposeTable
                  fields={investgContact}
                  dataSource={sslminvestgcontact}
                  addable={false}
                  editable={false}
                  removable={false}
                  pagination={false}
                  rowKey="id"
                  fieldLabelWidth={150}
                />
              ) : (
                customizeTable(
                  {
                    code: 'SSLM.SUPPLIER_LIFE_CYCLE.CONTACTS_INFO',
                    readOnly: true,
                  },
                  <Table
                    rowKey="id"
                    dataSource={contactsData}
                    columns={contactsColumns}
                    pagination={false}
                    bordered
                  />
                )
              )}
            </div>
          </SecondSection>
          <SecondSection
            title={intl.get('sslm.supplierDetail.view.title.supplierAddress').d('地址')}
            code="supplierAddress"
          >
            <div id="supplierAddress">
              {questionnaireTmpl.length > 0 &&
              questionnaireTmpl.find(item => item.configName === 'sslm_investg_address') ? (
                <ComposeTable
                  fields={investgAddress}
                  dataSource={sslminvestgaddress}
                  addable={false}
                  editable={false}
                  removable={false}
                  pagination={false}
                  rowKey="id"
                  fieldLabelWidth={150}
                />
              ) : (
                customizeTable(
                  {
                    code: 'SSLM.SUPPLIER_LIFE_CYCLE.ADDRESS_INFO',
                    readOnly: true,
                  },
                  <Table
                    rowKey="id"
                    dataSource={addressData}
                    pagination={false}
                    columns={addressColumns}
                    bordered
                  />
                )
              )}
            </div>
          </SecondSection>
          {remote &&
            remote.render('SSLM_SUPPLIER_DETAIL_SUPPLIER_INFO_AFTER_ADDRESS_INFO', <></>, {
              that: this,
            })}
          <SecondSection
            title={intl.get('sslm.supplierDetail.view.message.bankInfo').d('银行信息')}
            code="supplierBankAccount"
          >
            <div id="supplierBankAccount">
              {questionnaireTmpl.length > 0 &&
              questionnaireTmpl.find(item => item.configName === 'sslm_investg_bank_account') ? (
                <ComposeTable
                  fields={investgBankAccount}
                  dataSource={sslminvestgbankaccount}
                  addable={false}
                  editable={false}
                  removable={false}
                  pagination={false}
                  rowKey="id"
                  fieldLabelWidth={150}
                />
              ) : (
                customizeTable(
                  {
                    code: 'SSLM.SUPPLIER_LIFE_CYCLE.BANK_INFO', // 单元编码，必传
                  },
                  <Table
                    dataSource={bankAccountData}
                    columns={bankAccountColumns}
                    pagination={false}
                    bordered
                  />
                )
              )}
            </div>
          </SecondSection>
          <SecondSection
            title={intl.get('sslm.supplierDetail.view.message.invoiceInfo').d('开票信息')}
            code="invoiceInfo"
          >
            {this.renderInvoiceForm()}
          </SecondSection>
          <SecondSection
            title={intl
              .get('sslm.supplierDetail.model.supplierDetail.attachmentMessage')
              .d('附件信息')}
            code="supplierAttchmentInfo"
          >
            <div id="supplierAttchmentInfo" className={styles['attachemnt-wrap']}>
              {questionnaireTmpl.length > 0 &&
              questionnaireTmpl.find(item => item.configName === 'sslm_investg_attachment') ? (
                <ComposeTable
                  fields={investgAttachment}
                  dataSource={sslminvestgattachment}
                  addable={false}
                  editable={false}
                  removable={false}
                  pagination={false}
                  rowKey="id"
                  fieldLabelWidth={150}
                  sourceKey="360_PAGE"
                  investgRemote={remote}
                  configName="sslm_investg_attachment"
                />
              ) : (
                customizeTable(
                  { code: 'SSLM.SUPPLIER_LIFE_CYCLE.ATTACHMENT_LIST' },
                  <Table
                    rowKey="id"
                    dataSource={attachmentList}
                    columns={attachmentColumns}
                    pagination={false}
                    bordered
                  />
                )
              )}
            </div>
          </SecondSection>
          <SecondSection
            title={intl.get('sslm.supplierDetail.view.message.title.supplierClass').d('供应商分类')}
            code="supplierCatagory"
          >
            {customizeTable(
              { code: 'SSLM.SUPPLIER_LIFE_CYCLE.SUP_CAT_LIST' },
              <Table
                rowKey="id"
                dataSource={supplierCatagoryData}
                columns={supplierCatagoryColumns}
                pagination={false}
                bordered
                id="supplierCatagory"
              />
            )}
          </SecondSection>
          <SecondSection
            title={intl
              .get('sslm.supplierDetail.view.message.title.supplyCapacityList')
              .d('供货能力清单')}
            code="supplierCapacity"
          >
            {customizeTable(
              {
                code: 'SSLM.SUPPLIER_LIFE_CYCLE.ABILITY_LINE_TABLE',
              },
              <Table
                rowKey="id"
                dataSource={supplierCapacityData}
                columns={supplierCapacityColumns}
                scroll={{ x: supplierCapacityScrollX }}
                pagination={false}
                bordered
                id="supplierCapacity"
              />
            )}
          </SecondSection>
          <SecondSection
            title={intl
              .get('sslm.supplierDetail.view.message.title.purchaseList')
              .d('采购/财务信息')}
            code="purchaseList"
          >
            <PurchaseFinance {...purchaseFinanceProps} />
          </SecondSection>
          <SecondSection
            title={
              siteFlag
                ? intl
                    .get('sslm.supplierDetail.view.message.title.localAddress')
                    .d('本地供应商地点层信息')
                : intl.get('sslm.supplierDetail.view.message.title.address').d('地点层信息')
            }
            code="addressList"
          >
            <div id="addressList">
              {siteFlag ? (
                customizeTable(
                  {
                    code: 'SSLM.SUPPLIER_LIFE_CYCLE.LOCAL_SUPPLIER_SITE',
                  },
                  <Table
                    rowKey="supplierSiteId"
                    dataSource={localDestinationList}
                    columns={localDestinationColumns}
                    pagination={false}
                    bordered
                  />
                )
              ) : (
                <Table
                  rowKey="supChangeAddId"
                  dataSource={destinationList}
                  columns={destinationColumns}
                  scroll={{ x: destinationScrollX }}
                  pagination={false}
                  bordered
                />
              )}
            </div>
          </SecondSection>
          <SecondSection
            title={intl.get('sslm.supplierDetail.view.message.otherInfo').d('其他信息')}
            code="otherInfo"
          >
            <Spin spinning={queryOtherLoading || false}>{this.renderOtherForm()}</Spin>
          </SecondSection>
        </TopSection>
        {tableList.map(n => {
          const { relationId, ...others } = n;
          return (
            <div>
              <Row style={{ marginTop: '40px' }}>
                <div id={n.tableCode} className="second-title">
                  <span className="vertical-line" />
                  {n.tableName}
                </div>
              </Row>
              <Row>
                <DynamicTable
                  readOnly
                  rowKey="dataId"
                  modelTable={others}
                  relationId={relationId}
                />
              </Row>
            </div>
          );
        })}
        <Modal
          title={intl.get('hzero.common.upload.modal.title').d('附件')}
          visible={attachmentModalVisible}
          onCancel={this.handleAttachmentModal}
          width={1000}
          footer={null}
        >
          <Table
            bordered
            rowKey="attId"
            columns={capacityAttachmentColumns}
            dataSource={capacityAttachmentData}
            pagination={capacityAttachmentPagination}
            onChange={page => queryAttachment(page, abilityLineId)}
          />
        </Modal>
        <Modal
          title={intl.get('sslm.supplierInform.view.title.ouMessage').d('OU层信息')}
          visible={ouVisible}
          onOk={this.handleOuClose}
          onCancel={this.handleOuClose}
          width={1000}
        >
          <Table
            bordered
            rowKey="supChangeOuId"
            columns={ouColumns}
            dataSource={ouList}
            pagination={false}
            loading={loading}
            scroll={{ x: tableScrollWidth(ouColumns) }}
          />
        </Modal>
      </Fragment>
    );
  }
}
