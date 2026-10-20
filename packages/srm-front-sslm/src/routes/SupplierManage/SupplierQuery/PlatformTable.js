/**
 * PlatformTable -平台供应商查询表格
 * @date: 2018-8-16
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Table, Tooltip, Drawer } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import qs from 'querystring';
import { sum, isNumber, isEmpty, round } from 'lodash';
import { getCurrentLanguage, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { dateRender, dateTimeRender } from 'utils/renderer';
import {
  formatInternationalTel,
  renderThirdServiceAuthStatus,
  downLoadFile,
} from '@/routes/components/utils';

import { riskScan } from '@/routes/LifeCycleManage/utils';

const language = getCurrentLanguage();
const locale = language?.replace('_', '-');

@formatterCollections({
  code: ['sslm.supplierManage', 'sslm.common'],
})
export default class PlatformTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      lifeCycleData: [],
    };
  }

  groupTableEdit(record) {
    const { getEditDate } = this.props;
    getEditDate(record);
  }

  /**
   * 生命周期升降级记录-弹窗
   */
  @Bind()
  handleOpenModal(visible, record = {}) {
    const { querySupplierLifeCycle } = this.props;
    this.setState({
      visible,
    });
    if (!isEmpty(record)) {
      querySupplierLifeCycle(record).then(res => {
        if (res) {
          this.setState({
            lifeCycleData: res,
          });
        }
      });
    } else {
      this.setState({
        lifeCycleData: [],
      });
    }
  }

  /**
   * 生命周期升降级记录-弹窗
   */
  @Bind()
  onRedirect(record = {}) {
    const { history } = this.props;
    const { requisitionId, toStageId, lifeCycleUrl, documentType } = record;
    this.handleOpenModal(false);
    history.push({
      pathname: documentType ? '/sslm/life-cycle-manage/read' : lifeCycleUrl,
      search: qs.stringify(
        filterNullValueObject({
          requisitionId,
          toStageId,
          documentType,
        })
      ),
    });
  }

  /**
   * 生命周期升降级记录-列
   */
  @Bind()
  handlelifeCycleColumns() {
    return [
      {
        title: intl.get('sslm.supplierManage.model.supplierManage.lifeStage').d('生命阶段'),
        dataIndex: 'reqStage',
        width: 120,
      },
      {
        title: intl.get('sslm.common.field.action').d('动作'),
        dataIndex: 'documentFromHistoryMeaning',
        width: 140,
        render: val => val || '-',
      },
      {
        title: intl.get('hzero.common.date.creation').d('创建日期'),
        dataIndex: 'reqProcessDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get('sslm.supplierManage.model.supplierManage.proposer').d('申请人'),
        dataIndex: 'proposer',
        width: 120,
        render: (value, data) => (data.documentFromHistory === 'MANUALLY' ? value : '-'),
      },
      {
        title: intl.get('sslm.supplierManage.model.supplierManage.approver').d('审批人'),
        dataIndex: 'approver',
        width: 120,
        render: (value, data) => (data.documentFromHistory === 'MANUALLY' ? value : '-'),
      },
      {
        title: intl.get('sslm.supplierManage.model.supplierManage.viewApplication').d('申请单查看'),
        dataIndex: 'approver',
        width: 120,
        render: (val, record) => (
          <a disabled={!record.applyFlag} onClick={() => this.onRedirect(record)}>
            {intl.get('sslm.supplierManage.model.supplierManage.viewApplication').d('申请单查看')}
          </a>
        ),
      },
    ];
  }

  /**
   * 处理列渲染Tooltip起泡跑偏的问题
   * @param {*} val
   * @returns
   */
  @Bind()
  renderCellTooltip(val) {
    return (
      <Tooltip title={val} overlayStyle={{ maxWidth: 440 }}>
        {val}
      </Tooltip>
    );
  }

  @Bind()
  handleRiskReport(record) {
    const { fileUrl } = record;
    const url = downLoadFile({ tenantId: getCurrentOrganizationId(), attachmentUrl: fileUrl });
    window.open(url);
  }

  // 历史版本跳转
  @Bind()
  jumpHistoryVersion(record) {
    const { history } = this.props;
    const {
      tenantId,
      companyId,
      supplierCompanyId,
      spfmCompanyId,
      supplierTenantId,
      spfmSupplierCompanyId,
    } = record;
    history.push({
      pathname: '/sslm/supplier-manager/version-history',
      search: qs.stringify({
        tenantId,
        companyId,
        spfmCompanyId,
        supplierCompanyId,
        partnerCompanyId: supplierCompanyId,
        partnerTenantId: supplierTenantId,
        spfmPartnerCompanyId: spfmSupplierCompanyId,
        source: 'collectQuery',
      }),
    });
  }

  /**
   * 渲染Ca状态
   * @param {*} val
   * @param {*} status
   * @param {*} caAuthTime
   * @returns
   */
  @Bind()
  renderCaAuthStatus(val, status, caAuthTime, enabledFlag) {
    let textColor;
    let textBackgroundColor;
    // 未申请:NOT_APPLY | 申请中:APPLYING | 已出证:CA_SUCCESS | 申请失败:APPLY_FAILURE | 人工初审通过:MANUAL_APPROVE
    switch (status) {
      case 'NOT_APPLY':
        textColor = 'rgba(0,0,0,0.65)';
        textBackgroundColor = 'rgba(0,0,0,0.06)';
        break;
      case 'APPLYING':
        textColor = '#F88D10';
        textBackgroundColor = 'rgba(252,160,0,0.10)';
        break;
      case 'CA_SUCCESS':
      case 'MANUAL_APPROVE':
        textColor = '#47B881';
        textBackgroundColor = 'rgba(71,184,129,0.10)';
        break;
      case 'APPLY_FAILURE':
        textColor = '#F56349';
        textBackgroundColor = 'rgba(245,99,73,0.10)';
        break;
      default:
        textColor = 'rgba(0,0,0,0.65)';
        textBackgroundColor = 'rgba(0,0,0,0.06)';
        break;
    }
    return (
      <span>
        <span
          style={{
            padding: '1px 7px',
            color: +enabledFlag ? '#47B881' : '#F56349',
            backgroundColor: +enabledFlag ? 'rgba(71,184,129,0.10)' : 'rgba(245,99,73,0.10)',
          }}
        >
          {+enabledFlag
            ? intl.get('sslm.supplierManage.modal.status.enable').d('已启用')
            : intl.get('sslm.supplierManage.modal.status.forbidden').d('未启用')}
        </span>
        <span
          style={{
            padding: '1px 7px',
            color: textColor,
            margin: '0 5px',
            backgroundColor: textBackgroundColor,
          }}
        >
          {val}
        </span>
        <span
          style={{
            padding: '1px 7px',
            color: 'rgba(0,0,0,0.65)',
            backgroundColor: 'rgba(0,0,0,0.06)',
          }}
        >
          # {caAuthTime}
        </span>
      </span>
    );
  }

  render() {
    const {
      supplierList,
      loading,
      onSearch,
      pagination,
      customizeTable,
      custLoading,
      onJump,
      queryLifeCycleLoading,
    } = this.props;
    const { visible, lifeCycleData } = this.state;
    const columns = [
      {
        title: intl.get('sslm.common.view.supplier.code').d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 120,
        render: (val, record) => <a onClick={() => onJump(record)}>{record.supplierCompanyNum}</a>,
      },
      {
        title: intl.get('sslm.common.view.supplier.name').d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 200,
      },
      {
        title: intl.get('sslm.common.view.button.isScan').d('风险扫描'),
        dataIndex: 'riskScan',
        width: 120,
        render: (val, record) => {
          return (
            <a
              onClick={() => {
                riskScan(record, false, false);
              }}
            >
              {intl.get('sslm.common.view.button.isScan').d('风险扫描')}
            </a>
          );
        },
      },
      {
        title: intl.get('sslm.common.view.common.riskScanDate').d('最新风险扫描时间'),
        dataIndex: 'riskScanDate',
        width: 140,
        render: dateTimeRender,
      },
      {
        title: intl.get('sslm.common.view.common.riskLevel').d('风险等级'),
        dataIndex: 'riskLevelMeaning',
        width: 120,
      },
      {
        title: intl.get('sslm.common.view.common.latestRiskReport').d('最新风险报告'),
        dataIndex: 'fileUrl',
        width: 120,
        render: (val, record) => {
          const { fileUrl } = record;
          if (!fileUrl) {
            return '';
          }
          return (
            <a
              onClick={() => {
                this.handleRiskReport(record);
              }}
            >
              {intl.get('sslm.common.view.message.riskReport').d('风险报告')}
            </a>
          );
        },
      },
      {
        title: intl
          .get('sslm.supplierManage.model.supplierManage.supplierShortName')
          .d('供应商简称'),
        dataIndex: 'supplierCompanyShortName',
        width: 180,
      },
      {
        title: intl.get('sslm.common.view.company.name').d('公司'),
        dataIndex: 'companyNameMeaning',
        width: 200,
      },
      {
        title: intl.get('sslm.supplierManage.model.supplierManage.erpFlag').d('ERP供应商'),
        dataIndex: 'erpFlagMeaning',
        width: 100,
      },
      {
        title: intl
          .get('sslm.supplierManage.model.supplierManage.erpSupplierCode')
          .d('ERP供应商编码'),
        dataIndex: 'supplierErpNum',
        width: 150,
      },
      {
        title: intl.get('sslm.supplierManage.model.supplierManage.specialSupplier').d('特准供应商'),
        dataIndex: 'authorizeFlagMeaning',
        width: 100,
      },
      {
        title: intl.get('sslm.supplierManage.model.supplierManage.blacklistFlag').d('黑名单供应商'),
        dataIndex: 'blacklistFlagMeaning',
        width: 120,
      },
      {
        title: intl
          .get('sslm.supplierManage.model.supplierManage.esignCaAuthStatus')
          .d('E签宝CA状态'),
        dataIndex: 'esignCaAuthStatusMeaning',
        width: 190,
        render: (val, record) =>
          this.renderCaAuthStatus(
            val,
            record.esignCaAuthStatus,
            record.esignCaAuthTime,
            record.esignCaEnabledFlag
          ),
      },
      {
        title: intl
          .get('sslm.supplierManage.model.supplier.platform.fddCaAuthStatus')
          .d('法大大签CA状态'),
        dataIndex: 'fddCaAuthStatusMeaning',
        width: 190,
        render: (val, record) =>
          this.renderCaAuthStatus(
            val,
            record.fddCaAuthStatus,
            record.fddCaAuthTime,
            record.fddCaEnabledFlag
          ),
      },
      {
        title: intl
          .get('sslm.common.model.supplier.platform.thirdServiceAuthStatus')
          .d('电子签章认证状态'),
        dataIndex: 'thirdServiceAuthStatusMeaning',
        width: 190,
        render: (val, record) => renderThirdServiceAuthStatus(record),
      },
      {
        title: intl.get('sslm.supplierManage.model.supplierManage.lifeStage').d('生命阶段'),
        dataIndex: 'stageDescription',
        width: 100,
      },
      {
        title: intl.get('sslm.supplierManage.model.supplierManage.categoryName').d('供应商分类'),
        dataIndex: 'categoryName',
        width: 100,
        render: val => <Tooltip title={val}>{val}</Tooltip>,
      },
      {
        title: intl
          .get('sslm.supplierManage.model.supplierManage.lifeStageAgent')
          .d('生命阶段经办人'),
        dataIndex: 'chargeName',
        width: 120,
      },
      {
        title: intl
          .get('sslm.supplierManage.model.supplierManage.lifeStageCreation')
          .d('生命阶段创建时间'),
        dataIndex: 'creationDate',
        render: dateTimeRender,
        width: 160,
      },
      {
        title: intl
          .get('sslm.supplierManage.model.supplierManage.lifeUpAndDownRecord')
          .d('生命周期升降级记录'),
        dataIndex: 'lifeUpAndDownRecord',
        width: 160,
        render: (val, record) => {
          return (
            <a onClick={() => this.handleOpenModal(true, record)}>
              {intl.get(`hzero.common.button.view`).d('查看')}
            </a>
          );
        },
      },
      {
        title: intl.get('sslm.supplierInform.model.otherInform.purchaseAgent').d('采购员'),
        dataIndex: 'purchaseAgentNameJoint',
        width: 180,
        render: this.renderCellTooltip,
      },
      {
        title: intl
          .get('sslm.supplierManage.model.supplierManage.unifiedSocialCode')
          .d('统一社会信用代码'),
        dataIndex: 'unifiedSocialCode',
        width: 180,
      },
      {
        title: intl
          .get('sslm.supplierManage.model.supplierManage.organizeInsCode')
          .d('组织机构代码'),
        dataIndex: 'organizingInstitutionCode',
        width: 160,
      },
      {
        title: intl
          .get('sslm.supplierManage.model.supplierManage.businessRegistrationNumber')
          .d('商业注册登记号/税号'),
        dataIndex: 'businessRegistrationNumber',
        width: 150,
      },
      {
        title: intl.get('sslm.supplierManage.model.supplierManage.industryName').d('行业类型'),
        dataIndex: 'industryName',
        width: 200,
        render: this.renderCellTooltip,
      },
      {
        title: intl
          .get('sslm.supplierManage.model.supplierManage.industryCategoryName')
          .d('主营品类'),
        width: 200,
        dataIndex: 'industryCategoryName',
        render: this.renderCellTooltip,
      },
      {
        title: intl
          .get('sslm.supplierManage.model.supplierManage.companyDescription')
          .d('公司简介'),
        width: 200,
        dataIndex: 'companyDescription',
        render: this.renderCellTooltip,
      },
      {
        title: intl.get('sslm.supplierManage.model.supplierManage.businessNature').d('经营性质'),
        dataIndex: 'businessNature',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierManage.model.supplierManage.ForeignRelation').d('认证地区'),
        dataIndex: 'domesticForeignRelationMeaning',
        width: 100,
      },
      {
        title: intl.get('sslm.common.modal.field.certificationType').d('认证类型'),
        dataIndex: 'certificationTypeMeaning',
        width: 100,
      },
      {
        title: intl.get('sslm.common.modal.field.certificationRegion').d('认证地区'),
        dataIndex: 'certificationRegionIdMeaning',
        width: 140,
      },
      {
        title: intl.get('sslm.supplierManage.model.supplierManage.dunsCode').d('邓白氏编码'),
        dataIndex: 'dunsCode',
        width: 150,
      },
      {
        title: intl.get('sslm.supplierManage.model.supplierManage.companyType').d('企业类型'),
        dataIndex: 'companyTypeMeaning',
        width: 150,
      },
      {
        title: intl
          .get('sslm.supplierManage.model.supplierManage.taxpayerTypeMeans')
          .d('纳税人标识'),
        dataIndex: 'taxpayerTypeMeaning',
        width: 150,
      },
      {
        title: intl
          .get('sslm.supplierManage.model.supplierManage.registeredCapital')
          .d('注册资金(万元)'),
        dataIndex: 'registeredCapital',
        width: 120,
        render: val => {
          const value = language === 'en_US' ? (val ? round(val / 100, 8) : val) : val;
          return value && parseFloat(value).toLocaleString(locale, { maximumFractionDigits: 8 });
        },
      },
      {
        title: intl.get('sslm.common.model.registeredRegionName').d('注册地址'),
        dataIndex: 'registeredRegionName',
        width: 150,
        render: this.renderCellTooltip,
      },
      {
        title: intl.get('sslm.supplierManage.model.supplierManage.contactName').d('联系人姓名'),
        dataIndex: 'contactName',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierManage.model.supplierManage.contactMail').d('邮箱'),
        dataIndex: 'contactMail',
        width: 200,
      },
      {
        title: intl.get('sslm.supplierManage.model.supplierManage.contactPhone').d('手机号码'),
        dataIndex: 'contactPhone',
        width: 240,
        render: (val, record) => formatInternationalTel(record.internationalTelMeaning, val),
      },
      {
        title: intl.get('sslm.supplierManage.model.supplierManage.legalRepName').d('法定代表人'),
        dataIndex: 'legalRepName',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierManage.model.supplierManage.buildDate').d('成立日期'),
        dataIndex: 'buildDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get('sslm.supplierManage.model.supplierManage.addressDetail').d('详细地址'),
        dataIndex: 'addressDetail',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierManage.model.supplierManage.updateTimes').d('更新次数'),
        dataIndex: 'updateCount',
        width: 120,
        render: (val, record) =>
          val && (
            <span>
              {val}
              {intl.get('sslm.supplierDetail.model.supplierDetail.editedInfo.count').d('次')}
              <a onClick={() => this.jumpHistoryVersion(record)}>
                {intl
                  .get('sslm.supplierDetail.model.supplierDetail.editedInfo.history')
                  .d('历史版本')}
              </a>
            </span>
          ),
      },
      {
        title: intl.get('sslm.supplierManage.model.supplierManage.newUpdateDate').d('最近更新时间'),
        dataIndex: 'newUpdateDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get('sslm.supplierDetail.model.bankAccountData.bankAccountName').d('账户名称'),
        dataIndex: 'bankAccountName',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.bankAccountNum').d('银行账号'),
        dataIndex: 'bankAccountNum',
        width: 120,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.invoice.bankAccountNum').d('开户行账号'),
        dataIndex: 'bankAccountNumSsi',
        width: 120,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.bank.bankBranchName').d('开户行名称'),
        dataIndex: 'bankBranchName',
        width: 120,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.bank.bankFirm').d('联行行号'),
        dataIndex: 'bankFirm',
        width: 120,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.bank.bankName').d('银行名称'),
        dataIndex: 'bankName',
        width: 120,
      },
      {
        title: intl
          .get('sslm.supplierDetail.model.suDe.companyInfo.currencyCode')
          .d('注册资本币种'),
        dataIndex: 'currencyName',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierManage.model.supplierManage.evaluationLevel').d('供应商评级'),
        dataIndex: 'evaluationLevel',
        width: 120,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.invoice.depositBank').d('开户行'),
        dataIndex: 'depositBank',
        width: 120,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.invoice.receiveMail').d('收票人邮箱'),
        dataIndex: 'receiveMail',
        width: 120,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.invoice.receivePhone').d('收票人手机号'),
        dataIndex: 'receivePhone',
        width: 120,
        render: (val, record) => formatInternationalTel(record.receiveTelCodeMeaning, val),
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.invoice.taxAddress').d('税务登记地址'),
        dataIndex: 'taxRegistrationAddress',
        width: 120,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.invoice.taxPhone').d('税务登记电话'),
        dataIndex: 'taxRegistrationPhone',
        width: 120,
      },
      {
        title: intl
          .get('sslm.enterpriseInform.view.model.business.serviceAreaReqList')
          .d('送货服务范围'),
        dataIndex: 'serviceAreaCodeMeaning',
      },
    ];
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SSLM.SUPPLIER_LIFE_CYCLE.SUMMARY_TABLE',
          },
          <Table
            bordered
            dataSource={supplierList.content}
            pagination={pagination}
            onChange={page => onSearch(page)}
            columns={columns}
            rowKey="id"
            scroll={{ x: scrollX, y: 'calc(100vh - 395px)' }}
            loading={loading}
            custLoading={custLoading}
          />
        )}
        <Drawer
          width={720}
          destroyOnClose
          title={intl
            .get('sslm.supplierManage.model.supplierManage.lifeUpAndDownRecord')
            .d('生命周期升降级记录')}
          visible={visible}
          closable
          onClose={() => this.handleOpenModal(false)}
          maskClosable={false}
        >
          <Table
            loading={queryLifeCycleLoading}
            rowKey="requisitionId"
            bordered
            columns={this.handlelifeCycleColumns()}
            dataSource={lifeCycleData}
            pagination={false}
          />
        </Drawer>
      </React.Fragment>
    );
  }
}
