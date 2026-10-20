import React, { PureComponent } from 'react';
import { Table, Popover } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

export default class ListTable extends PureComponent {
  state = {};

  @Bind()
  onChange(pagination, _, sorter = {}) {
    const { field, order } = sorter;
    const { handleOnChange = (e) => e } = this.props;
    handleOnChange({
      page: pagination,
      sort:
        field === undefined || field === undefined
          ? {}
          : {
              field,
              order,
            },
    });
  }

  @Bind()
  setSelectedRows(selectedRowKeys, selectedRows) {
    const { handleSetSelectedRows = (e) => e } = this.props;
    handleSetSelectedRows(selectedRows);
  }

  render() {
    const {
      dataSource = [],
      pagination = {},
      loading = false,
      handleRedirectDetail = (e) => e,
      selectedRows = [],
    } = this.props;
    const { sortedInfo } = this.state;
    const columns = [
      {
        title: intl.get('spfm.certificationApproval.model.certification.companyNum').d('企业编码'),
        dataIndex: 'companyNum',
        width: 100,
      },
      {
        title: intl.get('spfm.certificationApproval.model.certification.company').d('企业名称'),
        dataIndex: 'companyName',
        width: 200,
        render: (text, record) => (
          <Popover
            content={
              record.ccompanyEnglishName ? `${text} ${record.ccompanyEnglishName}` : `${text}`
            }
          >
            <a onClick={() => handleRedirectDetail(record.companyId, record.processUser || 1)}>
              {record.ccompanyEnglishName ? `${text} ${record.ccompanyEnglishName}` : `${text}`}
            </a>
          </Popover>
        ),
      },
      {
        title: intl.get('spfm.certificationApproval.model.certification.groupName').d('集团'),
        dataIndex: 'groupName',
        width: 200,
      },
      {
        title: intl.get('spfm.certificationApproval.model.certification.tenantNum').d('租户编码'),
        dataIndex: 'tenantNum',
        width: 100,
      },
      {
        title: intl.get('spfm.certificationApproval.model.certification.Relation').d('认证地区'),
        dataIndex: 'domesticForeignRelationMeaning',
        width: 100,
      },
      {
        title: intl
          .get('spfm.certificationApproval.model.certification.SocialCode')
          .d('统一社会信用代码'),
        dataIndex: 'unifiedSocialCode',
        width: 160,
      },
      {
        title: intl
          .get('spfm.certificationApproval.model.certification.organizingInstitutionCode')
          .d('组织机构代码'),
        dataIndex: 'organizingInstitutionCode',
        width: 150,
      },
      {
        title: intl.get('spfm.certificationApproval.model.certification.dunsCode').d('邓白氏编码'),
        dataIndex: 'dunsCode',
        width: 150,
      },
      {
        title: intl
          .get('spfm.certificationApproval.model.certification.businessRegistrationNumber')
          .d('商业注册登记号/税号'),
        dataIndex: 'businessRegistrationNumber',
        width: 150,
      },
      {
        title: intl
          .get('spfm.certificationApproval.model.certification.mainIdentity')
          .d('主要身份'),
        dataIndex: 'mainIdentity',
        width: 150,
        render: (_, { purchaseFlag = 0, saleFlag = 0 }) =>
          `${
            purchaseFlag === 1
              ? `${intl
                  .get('spfm.certificationApproval.model.detailForm.purchaseFlag')
                  .d('我要采购')}，`
              : ''
          }${
            saleFlag === 1
              ? intl.get('spfm.certificationApproval.model.detailForm.saleFlag').d('我要销售')
              : ''
          }`,
      },
      {
        title: intl
          .get('spfm.certificationApproval.model.certification.legalRepName')
          .d('法定代表人'),
        dataIndex: 'legalRepName',
        width: 150,
      },
      {
        title: intl
          .get('spfm.certificationApproval.model.certification.contactName')
          .d('默认联系人'),
        dataIndex: 'contactName',
        width: 100,
      },
      {
        title: intl.get('spfm.certificationApproval.model.certification.contactMail').d('邮箱'),
        dataIndex: 'contactMail',
        width: 150,
      },
      {
        title: intl.get('spfm.certificationApproval.model.certification.processDate').d('申请时间'),
        dataIndex: 'processDate',
        sorter: (a, b) => a.processDate - b.processDate,
        sortOrder: sortedInfo === 'processDate' && sortedInfo.order,
        width: 150,
      },
      {
        title: intl
          .get('spfm.certificationApproval.model.certification.tenantApproval')
          .d('审批方式'),
        dataIndex: 'tenantApprovalMeaning',
        width: 150,
      },
      {
        title: intl
          .get('spfm.certificationApproval.model.certification.tenantName')
          .d('注册域名所属租户'),
        dataIndex: 'tenantName',
        width: 200,
      },
    ];
    const rowSelection = {
      selectedRowKeys: selectedRows.map((n) => n.companyActionId),
      onChange: this.setSelectedRows,
    };
    return (
      <Table
        loading={loading}
        dataSource={dataSource}
        pagination={pagination}
        onChange={this.onChange}
        columns={columns}
        rowSelection={rowSelection}
        rowKey="companyActionId"
        bordered
      />
    );
  }
}
