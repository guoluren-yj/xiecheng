/**
 * CompanyListTable -公司查询表格
 * @date: 2018-8-8
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Table, Form, Modal, Checkbox } from 'hzero-ui';
import classnames from 'classnames';
import moment from 'moment';

import { enableRender } from 'utils/renderer';
import intl from 'utils/intl';
import { getDateTimeFormat } from 'utils/utils';

import styles from '../index.less';

@Form.create({ fieldNameProp: null })
export default class DataTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortedInfo: null,
    };
  }

  groupTableEdit(record) {
    const { onHandleEditCompany } = this.props;
    onHandleEditCompany(record);
  }

  cancelEsign(record) {
    const { onCancelEsign } = this.props;
    Modal.confirm({
      title: intl.get('spfm.partnership.view.cancleEsignInfo').d('是否确认注销E签宝账号？'),
      onOk: () => {
        onCancelEsign(record);
      },
    });
  }

  render() {
    const {
      companyDataSource,
      onHandleStandardTableChange,
      loading,
      companyPagination,
    } = this.props;
    const { sortedInfo } = this.state;
    const columns = [
      {
        title: intl.get('entity.company.code').d('公司编码'),
        dataIndex: 'companyNum',
        width: 120,
        sorter: (a, b) => a.companyNum - b.companyNum,
        sortOrder: sortedInfo === 'companyNum' && sortedInfo.order,
      },
      {
        title: intl.get('entity.company.name').d('公司名称'),
        width: 200,
        dataIndex: 'companyName',
      },
      {
        title: intl.get('spfm.partnership.model.company.groupName').d('所属集团'),
        dataIndex: 'groupName',
        width: 200,
        sorter: (a, b) => a.groupName - b.groupName,
        sortOrder: sortedInfo === 'groupName' && sortedInfo.order,
      },
      {
        title: intl.get('spfm.partnership.model.company.tenantName').d('所属租户'),
        dataIndex: 'tenantName',
        width: 200,
      },
      {
        title: intl.get('spfm.partnership.model.company.unifiedSocialCode').d('统一社会信用代码'),
        width: 150,
        dataIndex: 'unifiedSocialCode',
      },
      {
        title: intl
          .get('spfm.partnership.model.company.organizingInstitutionCode')
          .d('组织机构代码'),
        width: 150,
        dataIndex: 'organizingInstitutionCode',
      },
      {
        title: intl.get('spfm.partnership.model.company.dunsCode').d('邓白氏编码'),
        width: 120,
        dataIndex: 'dunsCode',
      },
      {
        title: intl
          .get('spfm.partnership.model.company.businessRegistrationNumber')
          .d('商业注册登记号/税号'),
        width: 120,
        dataIndex: 'businessRegistrationNumber',
      },
      {
        title: intl.get('spfm.partnership.model.company.creationDate').d('注册时间'),
        dataIndex: 'creationDate',
        sorter: (a, b) => a.creationDate - b.creationDate,
        sortOrder: sortedInfo === 'creationDate' && sortedInfo.order,
        render: (text) => {
          return <span>{moment(text).format(getDateTimeFormat())}</span>;
        },
      },
      {
        title: intl.get('sslm.common.modal.field.certificationType').d('认证类型'),
        dataIndex: 'certificationTypeMeaning',
        width: 150,
      },
      {
        title: intl.get('sslm.common.modal.field.certificationRegion').d('认证地区'),
        dataIndex: 'certificationRegionIdMeaning',
        width: 150,
      },
      {
        title: intl.get('spfm.partnership.model.company.domesticOrForeign').d('境内/境外/个人'),
        dataIndex: 'domesticForeignRelationMeaning',
        width: 120,
      },
      {
        title: intl.get('spfm.partnership.model.company.IDOrPassportNo').d('个人身份证号/护照号'),
        dataIndex: 'idNum',
        width: 150,
        render: (val, record) => val || record.passport,
      },
      {
        title: intl.get('spfm.partnership.model.company.mainIdentity').d('主要身份'),
        dataIndex: 'mainIdentity',
        width: 200,
      },
      {
        title: intl.get('spfm.partnership.model.company.interBusinessShield').d('私有化'),
        dataIndex: 'interBusinessShield',
        width: 200,
        render: (val) => {
          return <Checkbox disabled checked={val === 1} />;
        },
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 80,
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      {
        title: intl.get('spfm.partnership.model.company.sourceCode').d('来源方式'),
        dataIndex: 'sourceCodeMeaning',
      },
      {
        title: intl.get('spfm.partnership.model.company.creditCheck').d('征信校验'),
        dataIndex: 'certificationStatusMeaning',
      },
      {
        title: intl.get('spfm.partnership.model.company.sourceTenantName').d('来源租户'),
        dataIndex: 'portalTenantName',
        width: 200,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 180,
        dataIndex: 'error',
        render: (val, record) => (
          <span className="action-link">
            <a
              onClick={() => {
                this.groupTableEdit(record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
            <a
              onClick={() => {
                this.cancelEsign(record);
              }}
            >
              {intl.get('hzero.common.button.cancelEsign').d('注销E签宝账号')}
            </a>
          </span>
        ),
      },
    ];

    return (
      <Table
        bordered
        className={classnames(styles.table)}
        columns={columns}
        dataSource={companyDataSource.content || []}
        onChange={onHandleStandardTableChange}
        loading={loading}
        pagination={companyPagination}
      />
    );
  }
}
