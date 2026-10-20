import React from 'react';
import { Bind } from 'lodash-decorators';

import { Tooltip } from 'hzero-ui';

import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import { sum } from 'lodash';
import { dateRender } from 'utils/renderer';

export default class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // selectedRowKeys: [],
      //   invOrganizationName: undefined,
    };
  }

  /**
   * editorPreview - 操作记录
   */
  @Bind()
  editorPreview(record) {
    const { handleModalVisibleList } = this.props;
    return (
      <a
        onClick={() =>
          handleModalVisibleList('operationRecordVisible', true, { pcHeaderId: record.pcHeaderId })
        }
      >
        {intl.get(`hzero.common.button.operating`).d('操作记录')}
      </a>
    );
  }

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const columnArray = [
      {
        title: intl.get(`spcm.purchaseContractView.model.pcStatusCode`).d('状态'),
        dataIndex: 'pcStatusCodeMeaning',
        width: 85,
      },
      {
        title: intl.get(`spcm.common.model.common.purchaseAgreementNum`).d('采购协议编号'),
        dataIndex: 'pcNum',
        width: 160,
      },

      {
        title: intl.get(`spcm.common.model.common.purchaseAgreementName`).d('采购协议名称'),
        dataIndex: 'pcName',
        width: 200,
        render: (val, record) => <Tooltip placement="topLeft" title={record.pcName}>{record.pcName}</Tooltip>,
      },
      {
        title: intl.get(`spcm.common.model.agreementObject`).d('协议对象'),
        dataIndex: 'supplierCompanyName',
        width: 165,
        render: (val, record) => record.supplierCompanyName || record.supplierName,
      },
      {
        title: intl.get(`spcm.common.model.common.pcKindCode`).d('协议性质'),
        dataIndex: 'pcKindCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`spcm.common.model.common.pcType`).d('协议类型'),
        dataIndex: 'pcTypeName',
        width: 120,
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
        width: 200,
      },
      {
        title: intl.get(`entity.business.tag`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl.get('entity.organization.class.purchase').d('采购组织'),
        dataIndex: 'purchaseOrgName',
        width: 150,
      },
      {
        title: intl.get('spcm.common.model.common.agentName').d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 100,
      },
      {
        title: intl.get(`spcm.common.model.common.pcTemplateId`).d('协议模板'),
        dataIndex: 'templateName',
        width: 120,
      },
      {
        title: intl.get(`entity.roles.creator`).d('创建人'),
        dataIndex: 'createByRealName',
        width: 140,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.purchaseContractView.model.getDate`).d('生效日期'),
        dataIndex: 'confirmedDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.common.model.agreementSource`).d('协议来源'),
        dataIndex: 'pcSourceCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`spcm.common.model.mainAgreementCode`).d('主协议编码'),
        dataIndex: 'mainPcNum',
        width: 100,
      },
      {
        title: intl.get(`spcm.common.archiveCode`).d('归档码'),
        dataIndex: 'archiveCode',
        width: 100,
      },
      // {
      //   title: intl.get(`hzero.common.button.operating`).d('操作记录'),
      //   width: 100,
      //   render: this.editorPreview,
      // },
    ];
    return columnArray;
  }

  render() {
    const {
      loading,
      dataSource,
      onSearch,
      pagination,
      selectedRows,
      onRowSelectChange = (e) => e,
    } = this.props;
    const selectedRowKeys = selectedRows.map((item) => item.pcHeaderId);
    const columns = this.getColumns();
    const rowSelection = {
      selectedRowKeys,
      type: 'radio',
      onChange: onRowSelectChange,
    };
    const tableProps = {
      loading,
      columns,
      dataSource,
      rowSelection,
      bordered: true,
      rowKey: 'pcHeaderId',
      onChange: (page) => onSearch(page),
      onRow: (record) => {
        return {
          onClick: (event) => {
            onRowSelectChange(event, [record]);
          },
        };
      },
      pagination,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map((n) => n.width)) + 300 };

    return <EditTable {...tableProps} />;
  }
}
