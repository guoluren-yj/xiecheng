/*
 * @Description: List - 协议变更列表
 * @author: zhutian <tian.zhu@hand-china.com>
 * @Date: 2019-11-12 11:14:15
 */
import React, { Component } from 'react';
import { Tooltip } from 'hzero-ui';
import { sum } from 'lodash';
import { Bind } from 'lodash-decorators';

import { Button as PermissionButton } from 'components/Permission';
import intl from 'utils/intl';
import { dateRender, yesOrNoRender } from 'utils/renderer';
import EditTable from 'components/EditTable';

export default class List extends Component {
  /**
   * changeSkip - 协议类型编码render方法
   * @param {!object} record - 行数据
   * @param {any} text - 单元格文本数据
   */
  @Bind()
  changeSkip(text, record) {
    const { redirectDetail = (e) => e } = this.props;
    return <a onClick={() => redirectDetail(record.pcHeaderId)}>{text}</a>;
  }

  /*
   * editorPreview - 操作记录
   */
  @Bind()
  editorPreview(record) {
    const { handleModalVisibleList } = this.props;
    return (
      <a
        onClick={() =>
          handleModalVisibleList('operationRecordVisible', true, {
            pcHeaderId: record.pcHeaderId,
          })
        }
      >
        {intl.get(`hzero.common.button.operating`).d('操作记录')}
      </a>
    );
  }

  render() {
    const { onControlTextComparison } = this.props;
    const columns = [
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'pcStatusCode',
        width: 85,
        fixed: 'left',
        render: (_, record) => record.pcStatusCodeMeaning,
      },
      {
        title: intl.get(`spcm.common.model.common.purchaseAgreementNum`).d('采购协议编号'),
        dataIndex: 'pcNum',
        width: 160,
        render: this.changeSkip,
        fixed: 'left',
      },
      {
        title: intl.get(`spcm.common.model.common.version`).d('版本号'),
        dataIndex: 'version',
        width: 80,
        fixed: 'left',
      },
      {
        title: intl.get(`spcm.common.model.purchaseAgreementName`).d('采购协议名称'),
        dataIndex: 'pcName',
        width: 130,
        render: (val, record) => (
          <Tooltip placement="topLeft" title={record.pcName}>
            {record.pcName}
          </Tooltip>
        ),
        fixed: 'left',
      },
      {
        title: intl.get(`spcm.common.model.agreementObject`).d('协议对象'),
        dataIndex: 'supplierCompanyName',
        width: 160,
        render: (val, record) => record.supplierCompanyName || record.supplierName,
      },
      {
        title: intl.get(`spcm.common.model.pcKindCode`).d('协议性质'),
        dataIndex: 'pcKindCode',
        width: 100,
        render: (_, record) => record.pcKindCodeMeaning,
      },
      {
        title: intl.get(`spcm.common.model.common.pcType`).d('协议类型'),
        dataIndex: 'pcTypeId',
        width: 120,
        render: (_, record) => record.pcTypeName,
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get(`spcm.common.model.common.globalFlag`).d('是否全局协议'),
        dataIndex: 'globalFlag',
        width: 150,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`entity.business.tag`).d('业务实体'),
        dataIndex: 'ouId',
        width: 150,
        render: (_, record) => record.ouName,
      },
      {
        title: intl.get('entity.organization.class.purchase').d('采购组织'),
        dataIndex: 'purchaseOrgId',
        width: 150,
        render: (_, record) => record.purchaseOrgName,
      },
      {
        title: intl.get('spcm.common.model.common.agentName').d('采购员'),
        dataIndex: 'purchaseAgentId',
        width: 100,
        render: (_, record) => record.purchaseAgentName,
      },
      {
        title: intl.get(`spcm.common.model.pcTemplateId`).d('协议模板'),
        dataIndex: 'pcTemplateId',
        width: 120,
        render: (_, record) => record.templateName,
      },
      {
        title: intl.get(`entity.roles.creator`).d('创建人'),
        dataIndex: 'createdBy',
        width: 140,
        render: (_, record) => record.createByRealName,
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
        dataIndex: 'pcSourceCode',
        width: 100,
        render: (_, record) => record.pcSourceCodeMeaning,
      },
      {
        title: intl.get(`spcm.common.model.mainAgreementCode`).d('主协议编码'),
        dataIndex: 'mainContractId',
        width: 100,
        render: (_, record) => record.mainPcNum,
      },
      {
        title: intl.get(`spcm.common.archiveCode`).d('归档码'),
        dataIndex: 'archiveCode',
        width: 100,
      },
      {
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        dataIndex: 'operating',
        width: 100,
        render: (_, record) => this.editorPreview(record),
      },
      {
        title: intl.get('hzero.common.button.operator').d('操作'),
        dataIndex: 'operator',
        width: 100,
        fixed: 'right',
        render: (_, record) => (
          <PermissionButton
            type="text"
            permissionList={[
              {
                code: 'srm.pc-admin.pc-purchaser.change.ps.text.comparison',
                type: 'button',
                meaning: intl.get('spcm.common.view.title.textComparison').d('文本对比'),
              },
            ]}
            onClick={() => onControlTextComparison({ pcHeaderId: record.pcHeaderId })}
          >
            {intl.get('spcm.common.view.title.textComparison').d('文本对比')}
          </PermissionButton>
        ),
      },
    ];
    const {
      loading,
      onSearch,
      // pagination,
      dataSource,
      selectedRowKeys,
      onRowSelectChange,
      customizeTable,
    } = this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange: onRowSelectChange,
    };

    const tableProps = {
      loading,
      dataSource,
      pagination: false,
      rowSelection,
      columns,
      bordered: true,
      rowKey: 'pcHeaderId',
      onChange: onSearch,
      scroll: { x: sum(columns.map((n) => n.width)) + 200 },
    };

    return customizeTable(
      {
        code: 'SPCM.CONTRACT.CHANGE.LIST',
      },
      <EditTable {...tableProps} />
    );
  }
}
