import React, { PureComponent } from 'react';
import { Button, Table, Form, Row, Col, Divider } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { isEmpty, isFunction, isArray, sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import qs from 'querystring';
import intl from 'utils/intl';
import { getCurrentLanguage } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import DetailForm from './Form';
import OperationRecord from './OperationRecord';
import styles from './index.less';

const language = getCurrentLanguage();

@connect(({ loading, certificationApproval }) => ({
  queryDetailLoading: loading.effects['certificationApproval/queryDetail'],
  approveLoading: loading.effects['certificationApproval/approve'],
  rejectLoading: loading.effects['certificationApproval/reject'],
  certificationLoaing: loading.effects['certificationApproval/certificationBusiness'],
  effectLoading:
    loading.effects['certificationApproval/queryDetail'] ||
    loading.effects['certificationApproval/queryRecord'],
  certificationApproval,
}))
@formatterCollections({
  code: [
    'spfm.certificationApproval',
    'spfm.supplier',
    'spfm.certificateAuthority',
    'hzero.common',
    'spfm.invoice',
    'entity.attachment',
    'spfm.investigationDefinition',
    'spfm.enterprise',
    'spfm.common',
    'spfm.contactPerson',
    'spfm.supplierRegister',
  ],
})
@Form.create({ fieldNameProp: null })
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    const queryParams = qs.parse(props.location.search.substr(1));
    const { processUser } = queryParams;
    // 方法注册
    ['onCell'].forEach((method) => {
      this[method] = this[method].bind(this);
    });
    this.state = {
      isReject: false,
      visible: false,
      processUser,
      settingOneFlag: false,
      settingTwoFlag: false,
      eSignFlag: false, // 平台征信配置是否开启E签宝配置
    };
  }

  componentDidMount() {
    const { match = {} } = this.props;
    const { params = {} } = match;
    const { processUser } = this.state;
    if (processUser) {
      this.fetchDetail({ companyId: params.id, processUser });
      // 查询征信配置
      this.querySettings();
    } else {
      this.handleRedirectList();
    }
  }

  @Bind()
  handleRedirectList() {
    const { dispatch } = this.props;
    dispatch(routerRedux.push({ pathname: `/spfm/certification-approval/list` }));
  }

  @Bind()
  approve() {
    const {
      dispatch,
      form: { getFieldsValue },
      certificationApproval: { detail = {} },
      match: { params = {} },
    } = this.props;
    const { id } = params;
    const { action = {}, basic = {} } = detail;
    const { processUser } = this.state;
    dispatch({
      type: 'certificationApproval/approve',
      payload: {
        data: [
          {
            ...getFieldsValue(['processMsg']),
            companyActionId: action.companyActionId,
            companyBasicId: basic.companyBasicId,
            companyId: id,
          },
        ],
      },
    }).then((res) => {
      if (isEmpty(res)) {
        notification.success();
        this.handleRedirectList();
      } else {
        notification.error({
          description: isArray(res)
            ? (res[0] || {}).processMsg
            : res && res.failed
            ? res.message
            : null,
        });
        this.fetchDetail({ companyId: params.id, processUser });
      }
    });
  }

  @Bind()
  reject() {
    const {
      form: { validateFields },
      dispatch,
      match: { params = {} },
      certificationApproval: { detail = {} },
      // location: { state = {} },
    } = this.props;
    const { id } = params;
    const { action = {} } = detail;
    // const { processUser } = state;
    this.setIsReject(true, () => {
      validateFields((err, values) => {
        if (isEmpty(err)) {
          dispatch({
            type: 'certificationApproval/reject',
            payload: { ...values, companyActionId: action.companyActionId, companyId: id },
          }).then((res) => {
            if (isEmpty(res)) {
              notification.success();
              // this.fetchDetail({ companyId: params.id, processUser });
              this.handleRedirectList();
            } else {
              notification.error({
                description: res.message,
              });
            }
          });
        }
      });
    });
  }

  @Bind()
  fetchDetail(payload) {
    const { dispatch } = this.props;
    dispatch({ type: 'certificationApproval/queryDetail', payload });
  }

  @Bind()
  querySettings() {
    const { dispatch } = this.props;
    dispatch({ type: 'certificationApproval/fetchSettings' }).then((res) => {
      if (res) {
        // 启信宝配置开启
        const settingOne = res['000105'] === '1';
        // 斯瑞德配置开启
        const settingTwo = res['000101'] === '1';
        // E签宝配置开启
        const eSignFlag = res['000107'] === '1';
        this.setState({
          eSignFlag,
          settingOneFlag: settingOne,
          settingTwoFlag: settingTwo,
        });
      }
    });
  }

  @Bind()
  fetchRecord() {
    const {
      dispatch,
      match: { params = {} },
    } = this.props;
    const { id } = params;
    dispatch({ type: 'certificationApproval/queryRecord', payload: id });
  }

  @Bind()
  handleOpenVisible() {
    this.fetchRecord();
    this.setRecordDrawerVisible(true);
  }

  @Bind()
  setRecordDrawerVisible(visible) {
    this.setState({
      visible,
    });
  }

  setIsReject(isReject, cb) {
    this.setState(
      {
        isReject,
      },
      () => {
        if (isFunction(cb)) {
          cb();
        }
      }
    );
  }

  /**
   * 三证验证
   */
  @Bind()
  handleCertification() {
    const {
      dispatch,
      history,
      match = {},
      certificationApproval: { detail = {} },
    } = this.props;
    const { params = {} } = match;
    const { processUser } = this.state;
    const {
      action = {},
      basic: { companyBasicId },
    } = detail;
    dispatch({
      type: 'certificationApproval/certificationBusiness',
      payload: {
        ...action,
        companyBasicId,
        companyId: params.id,
        processUser,
        levelTypeFlag: 0, // 区分租户级，平台级认证标识
      },
    }).then((res) => {
      if (res) {
        const { processStatus } = res;
        // 暂处理
        if (processStatus === 'REJECT') {
          notification.warning({
            message: intl
              .get('spfm.certification.approval.message.CertificationFail')
              .d('认证失败'),
          });
          history.push('/spfm/certification-approval/list');
        } else {
          notification.success();
          this.handleRedirectList();
        }
      }
    });
  }

  /**
   * onCell
   * @param {number} maxWidth - 单元格最大宽度
   */
  onCell(maxWidth) {
    return {
      style: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: maxWidth || 180,
        whiteSpace: 'nowrap',
      },
      onClick: (e) => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  render() {
    const {
      certificationApproval = {},
      form,
      queryDetailLoading,
      effectLoading,
      approveLoading,
      rejectLoading,
      certificationLoaing,
    } = this.props;
    const { isReject, visible, settingOneFlag, settingTwoFlag, eSignFlag } = this.state;
    const { detail = {}, record = [] } = certificationApproval;
    const {
      attachmentList = [],
      financeList = [],
      bankAccountList = [],
      addressList = [],
      contactList = [],
      business = {},
      basic = {},
      action = {},
      invoice = {},
    } = detail;
    // UNCERTIFIED未认证， PASS认证通过，FAIL认证失败
    const { certificationStatus, processMsg, appealReason } = action;
    const formProps = {
      certificationStatus,
      appealReason,
      processMsg,
      form,
      isReject,
      suppressionWarning: this.setIsReject.bind(this, false),
      loading: queryDetailLoading,
      dataSource: {
        ...business,
        ...basic,
      },
    };
    const { domesticForeignRelation } = basic;
    const domesticFlag = domesticForeignRelation === 0 ? !settingOneFlag : false;
    const buttonDisabled =
      domesticForeignRelation === 2
        ? !eSignFlag
        : (!settingOneFlag && !settingTwoFlag) || domesticFlag;

    const contactTableProps = {
      columns: [
        {
          title: intl.get('spfm.certificationApproval.model.contactTable.name').d('姓名'),
          align: 'left',
          dataIndex: 'name',
          width: 120,
        },
        {
          title: intl.get('spfm.certificationApproval.model.contactTable.gender').d('性别'),
          align: 'left',
          dataIndex: 'gender',
          width: 60,
          render: (text) =>
            text === 1
              ? intl.get('hzero.common.gender.male').d('男')
              : text === 0
              ? intl.get('hzero.common.gender.female').d('女')
              : null,
        },
        {
          title: intl.get('spfm.certificationApproval.model.contactTable.mail').d('邮箱'),
          dataIndex: 'mail',
          align: 'left',
          width: 120,
          onCell: this.onCell,
        },
        {
          title: intl
            .get('spfm.certificationApproval.model.contactTable.mobilephone')
            .d('手机号码'),
          align: 'left',
          width: 120,
          dataIndex: 'mobilephone',
          render: (text, recordData) => `${recordData.internationalTelMeaning} | ${text}`,
        },
        {
          title: intl.get('spfm.certificationApproval.model.contactTable.telephone').d('固定电话'),
          align: 'left',
          dataIndex: 'telephone',
          width: 120,
        },
        {
          title: intl.get('spfm.certificationApproval.model.contactTable.department').d('部门'),
          dataIndex: 'department',
          width: 150,
          align: 'left',
          onCell: this.onCell,
        },
        {
          title: intl.get('spfm.certificationApproval.model.contactTable.position').d('职位'),
          dataIndex: 'position',
          width: 150,
          align: 'left',
          onCell: this.onCell,
        },
        {
          title: intl.get('hzero.common.remark').d('备注'),
          dataIndex: 'description',
          width: 180,
          align: 'left',
          onCell: this.onCell,
        },
        {
          title: intl
            .get('spfm.certificationApproval.model.contactTable.defaultFlag')
            .d('默认联系人'),
          align: 'left',
          dataIndex: 'defaultFlag',
          width: 140,
          render: (text) => yesOrNoRender(text),
        },
        {
          title: intl.get('hzero.common.status.enable').d('启用'),
          align: 'left',
          dataIndex: 'enabledFlag',
          width: 90,
          render: (text) => yesOrNoRender(text),
        },
      ],
      pagination: false,
      dataSource: contactList,
      bordered: true,
      rowKey: 'companyContactId',
    };
    contactTableProps.scroll = { x: sum(contactTableProps.columns.map((n) => n.width)) };
    const addressTableProps = {
      columns: [
        {
          title: intl.get('spfm.certificationApproval.model.addressTable.countryName').d('国家'),
          align: 'left',
          dataIndex: 'countryName',
          width: 120,
          onCell: this.onCell,
        },
        {
          title: intl
            .get('spfm.certificationApproval.model.addressTable.regionPathName')
            .d('省/市'),
          align: 'left',
          dataIndex: 'regionPathName',
          width: 120,
          onCell: this.onCell,
        },
        {
          title: intl
            .get('spfm.certificationApproval.model.addressTable.businessAddress')
            .d('经营地址'),
          dataIndex: 'addressDetail',
          width: 180,
          align: 'left',
          onCell: this.onCell,
        },
        {
          title: intl.get('spfm.certificationApproval.model.addressTable.postCode').d('邮政编码'),
          align: 'left',
          dataIndex: 'postCode',
          width: 120,
          onCell: this.onCell,
        },
        {
          title: intl
            .get('spfm.certificationApproval.model.addressTable.description')
            .d('地址备注'),
          dataIndex: 'description',
          width: 180,
          align: 'left',
          onCell: this.onCell,
        },
        {
          title: intl.get('hzero.common.status.enable').d('启用'),
          align: 'left',
          dataIndex: 'enabledFlag',
          render: (text) => yesOrNoRender(text),
          width: 90,
        },
      ],
      pagination: false,
      dataSource: addressList,
      bordered: true,
      rowKey: 'companyAddressId',
    };
    addressTableProps.scroll = { x: sum(addressTableProps.columns.map((n) => n.width)) };
    const bankTableProps = {
      columns: [
        {
          title: intl.get('spfm.supplier.model.erpSupplierDetail.bankCountryName').d('国家'),
          align: 'left',
          dataIndex: 'bankCountryName',
          width: 150,
          onCell: this.onCell,
        },
        {
          title: intl.get('spfm.supplier.model.erpSupplierDetail.bankCode').d('银行代码'),
          align: 'left',
          dataIndex: 'bankCode',
          width: 150,
          onCell: this.onCell,
        },
        {
          title: intl.get('spfm.supplier.model.erpSupplierDetail.bankName').d('银行名称'),
          align: 'left',
          dataIndex: 'bankName',
          width: 180,
          onCell: this.onCell,
        },
        {
          title: intl.get('spfm.certificationApproval.model.bankTable.bankFirm').d('联行行号'),
          width: 150,
          dataIndex: 'bankFirm',
          onCell: this.onCell,
        },
        {
          title: intl
            .get('spfm.certificationApproval.model.bankTable.bankBranchName')
            .d('开户行名称'),
          align: 'left',
          dataIndex: 'bankBranchName',
          width: 180,
          onCell: this.onCell,
        },
        {
          title: intl
            .get('spfm.certificationApproval.model.bankTable.bankAccountName')
            .d('账户名称'),
          align: 'left',
          dataIndex: 'bankAccountName',
          width: 220,
          onCell: this.onCell,
        },
        {
          title: intl
            .get('spfm.certificationApproval.model.bankTable.bankAccountNum')
            .d('银行账号'),
          align: 'left',
          dataIndex: 'bankAccountNum',
          width: 240,
          onCell: this.onCell,
        },
        {
          dataIndex: "bankIdentifyCodeTypeMeaning",
          width: 120,
          title: intl.get("sslm.common.model.bank.bankIdentifyCodeType").d("银行识别码类型"),
        },
        {
          dataIndex: "bankIdentifyCode",
          width: 200,
          title: intl.get("sslm.common.model.bank.bankIdentifyCode").d("银行识别码"),
        },
        {
          title: intl.get('spfm.certificationApproval.model.bankTable.masterFlag').d('主账号'),
          width: 100,
          dataIndex: 'masterFlag',
          onCell: this.onCell,
          render: (value) => yesOrNoRender(value),
        },
        {
          title: intl.get('hzero.common.status.enable').d('启用'),
          align: 'left',
          dataIndex: 'enabledFlag',
          width: 90,
          render: (text) => yesOrNoRender(text),
        },
        {
          title: intl.get('hzero.common.remark').d('备注'),
          width: 200,
          dataIndex: 'remark',
          onCell: this.onCell,
        },
      ],
      pagination: false,
      dataSource: bankAccountList,
      bordered: true,
      rowKey: 'companyBankAccountId',
    };
    bankTableProps.scroll = { x: sum(bankTableProps.columns.map((n) => n.width)) };
    const financeTableProps = {
      columns: [
        {
          title: intl.get('spfm.certificationApproval.model.financeTable.year').d('年份'),
          dataIndex: 'year',
          width: 70,
        },
        {
          title: intl.get('spfm.common.model.currency').d('币种'),
          dataIndex: 'currencyName',
          width: 130,
        },
        {
          title: intl
            .get('spfm.certificationApproval.model.financeTable.totalAssets')
            .d('企业总资产(万)'),
          align: 'right',
          dataIndex: 'totalAssets',
          width: 180,
          onCell: this.onCell,
          render: (text) => (language === 'en_US' ? text / 100 : text),
        },
        {
          title: intl
            .get('spfm.certificationApproval.model.financeTable.totalLiab')
            .d('总负债(万)'),
          align: 'right',
          dataIndex: 'totalLiabilities',
          width: 150,
          onCell: this.onCell,
          render: (text) => (language === 'en_US' ? text / 100 : text),
        },
        {
          title: intl
            .get('spfm.certificationApproval.model.financeTable.currentAssets')
            .d('流动资产(万)'),
          align: 'right',
          dataIndex: 'currentAssets',
          width: 150,
          onCell: this.onCell,
          render: (text) => (language === 'en_US' ? text / 100 : text),
        },
        {
          title: intl
            .get('spfm.certificationApproval.model.financeTable.liabilities')
            .d('流动负债(万)'),
          align: 'right',
          dataIndex: 'currentLiabilities',
          width: 150,
          onCell: this.onCell,
          render: (text) => (language === 'en_US' ? text / 100 : text),
        },
        {
          title: intl
            .get('spfm.certificationApproval.model.financeTable.revenue')
            .d('营业收入(万)'),
          align: 'right',
          dataIndex: 'revenue',
          width: 150,
          onCell: this.onCell,
          render: (text) => (language === 'en_US' ? text / 100 : text),
        },
        {
          title: intl
            .get('spfm.certificationApproval.model.financeTable.netProfit')
            .d('净利润(万)'),
          align: 'right',
          dataIndex: 'netProfit',
          width: 150,
          onCell: this.onCell,
          render: (text) => (language === 'en_US' ? text / 100 : text),
        },
        {
          title: intl
            .get('spfm.certificationApproval.model.financeTable.liabilityRatio')
            .d('资产负债率'),
          align: 'left',
          dataIndex: 'assetLiabilityRatio',
          width: 150,
          onCell: this.onCell,
        },
        {
          title: intl
            .get('spfm.certificationApproval.model.financeTable.currentRatio')
            .d('流动比率'),
          align: 'left',
          dataIndex: 'currentRatio',
          width: 120,
          onCell: this.onCell,
        },
        {
          title: intl
            .get('spfm.certificationApproval.model.financeTable.totalRatio')
            .d('总资产收益率'),
          align: 'left',
          dataIndex: 'totalAssetsEarningsRatio',
          width: 150,
          onCell: this.onCell,
        },
        {
          title: intl.get('hzero.common.remark').d('备注'),
          dataIndex: 'remark',
          width: 200,
          onCell: this.onCell,
        },
      ],
      pagination: false,
      dataSource: financeList,
      bordered: true,
      rowKey: 'companyFinanceId',
    };
    financeTableProps.scroll = { x: sum(financeTableProps.columns.map((n) => n.width)) };
    const attachmentTableProps = {
      columns: [
        {
          title: intl.get('entity.attachment.type').d('附件类型'),
          align: 'left',
          width: 120,
          dataIndex: 'attachmentTypeMeaning',
          render: (_, recordData) => {
            if (recordData.attachmentTypeMeaning && recordData.subAttachmentMeaning) {
              return (
                <span>{`${recordData.attachmentTypeMeaning} / ${recordData.subAttachmentMeaning}`}</span>
              );
            } else {
              return (
                <span>{recordData.attachmentTypeMeaning || recordData.subAttachmentMeaning}</span>
              );
            }
          },
        },
        {
          title: intl.get('entity.attachment.description').d('附件描述'),
          dataIndex: 'description',
          width: 180,
          onCell: this.onCell,
        },
        {
          title: intl
            .get('spfm.certificationApproval.model.attachmentTable.endDate')
            .d('文件到期日'),
          align: 'left',
          dataIndex: 'endDate',
          width: 120,
        },
        {
          title: intl.get('spfm.certificationApproval.model.attachment.longEffective').d('是否长期有效'),
          dataIndex: 'longEffectiveFlag',
          width: 120,
          render: (text, record) => {
              return yesOrNoRender(text);
            },
        },
        {
          title: intl
            .get('spfm.certificationApproval.model.attachmentTable.uploadDate')
            .d('最后上传时间'),
          align: 'left',
          dataIndex: 'uploadDate',
          width: 140,
        },
        {
          title: intl
            .get('spfm.certificationApproval.model.attachmentTable.attachment')
            .d('附件上传'),
          align: 'left',
          dataIndex: 'attachmentUrl',
          width: 140,
          render: (text, rowData) => (
            <UploadModal
              attachmentUUID={rowData.attachmentUuid}
              viewOnly
              filePreview
              filesNumber={rowData.attachmentCount}
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="spfm-comp"
            />
          ),
        },
        {
          title: intl.get('hzero.common.remark').d('备注'),
          dataIndex: 'remark',
          width: 200,
          onCell: this.onCell,
        },
      ],
      pagination: false,
      dataSource: attachmentList,
      bordered: true,
      rowKey: 'companyAttachmentId',
    };
    const operationRecordProps = {
      visible,
      onCancel: this.setRecordDrawerVisible.bind(this, false),
      dataSource: record,
    };
    const allLoading =
      queryDetailLoading ||
      effectLoading ||
      certificationLoaing ||
      approveLoading ||
      rejectLoading ||
      false;
    return (
      <div className={styles['spfm-certification-approval-detail']}>
        <Header
          title={intl
            .get('spfm.certificationApproval.view.title.certificationDetail')
            .d('企业认证审批明细')}
          backPath="/spfm/certification-approval/list"
        >
          {certificationStatus === 'UNCERTIFIED' && (
            <Button
              type="primary"
              icon="safety"
              loading={allLoading}
              onClick={this.handleCertification}
              disabled={buttonDisabled}
            >
              {intl.get('spfm.certificationApproval.view.button.verify').d('三证验证')}
            </Button>
          )}
          <Button type="primary" icon="check" loading={allLoading} onClick={this.approve}>
            {intl.get('spfm.certificationApproval.view.button.approval').d('审批通过')}
          </Button>
          <Button icon="exclamation-circle-o" onClick={this.reject} loading={allLoading}>
            {intl.get('spfm.certificationApproval.view.button.reject').d('审批拒绝')}
          </Button>
          <Button icon="info-circle-o" onClick={this.handleOpenVisible} loading={allLoading}>
            {intl.get('spfm.certificationApproval.view.button.actionHistory').d('操作记录')}
          </Button>
        </Header>
        <Content>
          <DetailForm {...formProps} />
          <br />
          <h3>
            {intl.get('spfm.certificationApproval.view.title.tab.contactTable').d('联系人信息')}
          </h3>
          <Table {...contactTableProps} />
          <br />
          <h3>
            {intl.get('spfm.certificationApproval.view.title.tab.addressTable').d('地址信息')}
          </h3>
          <Table {...addressTableProps} />
          <br />
          <h3>{intl.get('spfm.enterprise.view.message.page.bankInfo').d('银行信息')}</h3>
          <Table {...bankTableProps} />
          <br />
          <h3>{intl.get('spfm.enterprise.view.message.page.invoiceInfo').d('开票信息')}</h3>
          <Row gutter={4}>
            <Col>
              <Row>
                <Col span={3} className={styles.fields}>
                  <span className={styles.fields}>
                    {intl.get('spfm.invoice.view.message.invoiceHeader').d('发票头：')}
                  </span>
                </Col>
                <Col span={18} className={styles['fields-content']}>
                  <span>{invoice.invoiceHeader}</span>
                </Col>
              </Row>
            </Col>
          </Row>
          <Divider dashed style={{ margin: '8px 0' }} />
          <Row gutter={4}>
            <Col>
              <Row>
                <Col span={3} className={styles.fields}>
                  <span className={styles.fields}>
                    {intl.get('spfm.invoice.view.message.taxRegistrationNumber').d('税务登记号：')}
                  </span>
                </Col>
                <Col span={18} className={styles['fields-content']}>
                  <span>{invoice.taxRegistrationNumber}</span>
                </Col>
              </Row>
            </Col>
          </Row>
          <Divider dashed style={{ margin: '8px 0' }} />
          <Row>
            <Col>
              <Row>
                <Col span={3} className={styles.fields}>
                  <span className={styles.fields}>
                    {intl.get('spfm.invoice.view.message.depositBank').d('开户行：')}
                  </span>
                </Col>
                <Col span={18} className={styles['fields-content']}>
                  <span>{invoice.depositBank}</span>
                </Col>
              </Row>
            </Col>
          </Row>
          <Divider dashed style={{ margin: '8px 0' }} />
          <Row gutter={4}>
            <Col>
              <Row>
                <Col span={3} className={styles.fields}>
                  <span className={styles.fields}>
                    {intl.get('spfm.invoice.view.message.bankAccountNum').d('开户行账号：')}
                  </span>
                </Col>
                <Col span={18} className={styles['fields-content']}>
                  <span>{invoice.bankAccountNum}</span>
                </Col>
              </Row>
            </Col>
          </Row>
          <Divider dashed style={{ margin: '8px 0' }} />
          <Row gutter={4}>
            <Col>
              <Row>
                <Col span={3} className={styles.fields}>
                  <span className={styles.fields}>
                    {intl
                      .get('spfm.invoice.view.message.taxRegistrationAddress')
                      .d('税务登记地址：')}
                  </span>
                </Col>
                <Col span={18} className={styles['fields-content']}>
                  <span>{invoice.taxRegistrationAddress}</span>
                </Col>
              </Row>
            </Col>
          </Row>
          <Divider dashed style={{ margin: '8px 0' }} />
          <Row gutter={4}>
            <Col>
              <Row>
                <Col span={3} className={styles.fields}>
                  <span className={styles.fields}>
                    {intl.get('spfm.invoice.view.message.taxRegistrationPhone').d('税务登记电话：')}
                  </span>
                </Col>
                <Col span={18} className={styles['fields-content']}>
                  <span>{invoice.taxRegistrationPhone}</span>
                </Col>
              </Row>
            </Col>
          </Row>
          <Divider dashed style={{ margin: '8px 0' }} />
          <Row gutter={4}>
            <Col>
              <Row>
                <Col span={3} className={styles.fields}>
                  <span className={styles.fields}>
                    {intl.get('spfm.invoice.view.message.receiver').d('收票人：')}
                  </span>
                </Col>
                <Col span={18} className={styles['fields-content']}>
                  <span>{invoice.receiver}</span>
                </Col>
              </Row>
            </Col>
          </Row>
          <Divider dashed style={{ margin: '8px 0' }} />
          <Row gutter={4}>
            <Col>
              <Row>
                <Col span={3} className={styles.fields}>
                  <span className={styles.fields}>
                    {intl.get('spfm.invoice.view.message.receiveMail').d('收票人邮箱：')}
                  </span>
                </Col>
                <Col span={18} className={styles['fields-content']}>
                  <span>{invoice.receiveMail}</span>
                </Col>
              </Row>
            </Col>
          </Row>
          <Divider dashed style={{ margin: '8px 0' }} />
          <Row gutter={4}>
            <Col>
              <Row>
                <Col span={3} className={styles.fields}>
                  <span className={styles.fields}>
                    {intl.get('spfm.invoice.view.message.receivePhone').d('收票人手机号：')}
                  </span>
                </Col>
                <Col span={18} className={styles['fields-content']}>
                  <span>
                    {invoice.internationalTelMeaning && invoice.receivePhone
                      ? `${invoice.internationalTelMeaning} | ${invoice.receivePhone}`
                      : invoice.receivePhone}
                  </span>
                </Col>
              </Row>
            </Col>
          </Row>
          <Divider dashed style={{ margin: '8px 0' }} />
          <Row gutter={4}>
            <Col>
              <Row>
                <Col span={3} className={styles.fields}>
                  <span className={styles.fields}>
                    {intl.get('spfm.invoice.view.message.receiveAddress').d('收票地址：')}
                  </span>
                </Col>
                <Col span={18} className={styles['fields-content']}>
                  <span>{invoice.receiveAddress}</span>
                </Col>
              </Row>
            </Col>
          </Row>
          <Divider dashed style={{ margin: '8px 0' }} />
          <br />
          <h3>
            {intl.get('spfm.certificationApproval.view.title.tab.financeTable').d('财务信息')}
          </h3>
          <Table {...financeTableProps} />
          <br />
          <h3>
            {intl.get('spfm.investigationDefinition.view.message.tab.attachment').d('附件信息')}
          </h3>
          <Table {...attachmentTableProps} />
        </Content>
        <OperationRecord {...operationRecordProps} />
      </div>
    );
  }
}
