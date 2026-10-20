import React, { PureComponent } from 'react';
import { Table, Popover } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

export default class ListTable extends PureComponent {
  @Bind()
  onChange(pagination) {
    const { handleOnChange = (e) => e } = this.props;
    handleOnChange(pagination);
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
      customizeTable = () => {},
      custLoading = false,
    } = this.props;
    const columns = [
      {
        title: intl
          .get('spfm.certificationApproval.model.certification.registrationSource')
          .d('注册来源'),
        dataIndex: 'supRegisteredSourceMeaning',
        width: 100,
      },
      {
        title: intl
          .get('spfm.certificationApproval.model.certification.processStatus')
          .d('认证状态'),
        dataIndex: 'basicProcessStatus',
        width: 140,
        render: (text, record) =>
          text === 'SUBMIT'
            ? intl.get('spfm.certificationApproval.model.certification.pending').d('待审批')
            : record.basicProcessStatusMeaning,
      },
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
        title: intl.get('spfm.certificationApproval.model.certification.Relation').d('认证地区'),
        dataIndex: 'domesticForeignRelationMeaning',
        width: 100,
      },
      {
        title: intl
          .get('spfm.certificationApproval.model.certification.SocialCode')
          .d('统一社会信用代码'),
        dataIndex: 'unifiedSocialCode',
        width: 150,
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
        width: 200,
      },
      {
        title: intl.get('spfm.certificationApproval.model.certification.processDate').d('申请时间'),
        dataIndex: 'processDate',
        width: 160,
      },
      {
        title: intl
          .get('spfm.certificationApproval.model.certification.inviterCompanyName')
          .d('发起邀请的公司'),
        dataIndex: 'inviterCompanyName',
        width: 140,
      },
      {
        title: intl
          .get('spfm.certificationApproval.model.certification.purchaseAgentName')
          .d('采购员'),
        dataIndex: 'purchaseAgentNameJoint',
        width: 160,
        render: (value) => <Popover content={value}>{value}</Popover>,
      },
    ];
    const rowSelection = {
      selectedRowKeys: selectedRows.map((n) => n.companyActionId),
      onChange: this.setSelectedRows,
      getCheckboxProps: (record) => {
        return { disabled: record.basicProcessStatus === 'APPROVING' };
      },
    };
    return customizeTable(
      {
        code: 'SPFM.CERTIFICATION_TENANT_APPROVAL.LIST',
      },
      <Table
        loading={loading}
        dataSource={dataSource}
        pagination={pagination}
        onChange={this.onChange}
        columns={columns}
        rowSelection={rowSelection}
        rowKey="companyActionId"
        bordered
        custLoading={custLoading}
      />
    );
  }
}
