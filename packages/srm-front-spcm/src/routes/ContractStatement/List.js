/*
 * @Description: index.js - 协议用章列表
 * @Author: MJQ <jiaqi.mao@hand-china.com>
 * @Date: 2019-08-23 11:14:15
 * @LastEditTime: 2026-03-12 17:34:06
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import EditTable from 'components/EditTable';
import { sum, isEmpty } from 'lodash';

import { Tooltip } from 'hzero-ui';
import intl from 'utils/intl';
import { dateRender, yesOrNoRender } from 'utils/renderer';

export default class List extends Component {
  /**
   * changeSkip - 协议类型编码render方法
   * @param {!object} record - 行数据
   * @param {any} text - 单元格文本数据
   */
  @Bind()
  changeSkip(text, record) {
    const { redirectDetail = (e) => e } = this.props;
    return <a onClick={() => redirectDetail(record.pcHeaderId, record.companyId)}>{text}</a>;
  }

  /**
   * editorPreview - 操作记录
   */
  @Bind()
  editorPreview(record) {
    const { handleModalVisibleList = (e) => e } = this.props;
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

  @Bind()
  getColumns(pcTermDetailDTOList) {
    const { onControlTextComparison } = this.props;
    const columnArray = [
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'pcStatusCodeMeaning',
        width: 85,
        fixed: 'left',
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
        width: 150,
        render: (val, record) => <Tooltip title={record.pcName}>{record.pcName}</Tooltip>,
        fixed: 'left',
      },
      {
        title: intl.get(`spcm.common.model.agreementObject`).d('协议对象'),
        dataIndex: 'supplierCompanyName',
        width: 150,
        render: (val, record) => record.supplierCompanyName || record.supplierName,
      },
      {
        title: intl.get(`spcm.common.model.legalRepName`).d('法人'),
        dataIndex: 'legalRepName',
        width: 150,
      },
      {
        title: intl.get(`spcm.common.model.telNum`).d('联系方式'),
        dataIndex: 'telNum',
        width: 150,
      },
      {
        title: intl.get(`spcm.common.model.taxRegistrationPhone`).d('税务登记电话'),
        dataIndex: 'taxRegistrationPhone',
        width: 150,
      },
      {
        title: intl.get(`spcm.common.model.pcKindCode`).d('协议性质'),
        dataIndex: 'pcKindCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`spcm.common.model.common.pcType`).d('协议类型'),
        dataIndex: 'pcTypeName',
        width: 100,
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
        render: (val) => yesOrNoRender(val),
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
        title: intl.get(`spcm.common.model.pcTemplateId`).d('协议模板'),
        dataIndex: 'templateName',
        width: 100,
      },
      {
        title: intl.get(`entity.roles.creator`).d('创建人'),
        dataIndex: 'createByRealName',
        width: 170,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.purchaseContractView.model.signDate`).d('签订日期'),
        dataIndex: 'signDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.purchaseContractView.model.getDate`).d('生效日期'),
        dataIndex: 'startDateActive',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.purchaseContractView.model.endDateActive`).d('失效日期'),
        dataIndex: 'endDateActive',
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
    ];
    const editorPreview = [
      {
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        width: 100,
        render: (_, record) => this.editorPreview(record),
      },
      {
        title: intl.get('hzero.common.button.operator').d('操作'),
        dataIndex: 'operator',
        width: 100,
        fixed: 'right',
        render: (_, record) => (
          <a onClick={() => onControlTextComparison({ pcHeaderId: record.pcHeaderId })}>
            {intl.get('spcm.common.view.title.textComparison').d('文本对比')}
          </a>
        ),
      },
    ];
    const columns = pcTermDetailDTOList.map((item) => {
      if (item.termType === 'DATE') {
        return {
          title: item.termTypeName,
          dataIndex: item.termTypeCode,
          render: dateRender,
        };
      }
      return {
        title: item.termTypeName,
        dataIndex: item.termTypeCode,
        width: 100,
        // render: (val, record) => record.termContent,
      };
    });
    return columnArray.concat(columns, editorPreview);
  }

  render() {
    const {
      selectedRowKeys,
      loading,
      onSearch,
      pagination,
      dataSource = [],
      onRowSelectChange = (e) => e,
    } = this.props;
    const { pcTermDetailDTOList } = isEmpty(dataSource)
      ? { pcTermDetailDTOList: [] }
      : dataSource[0];
    const newDate = dataSource.map((ele) => {
      let date = {};
      ele.pcTermDetailDTOList.forEach((item) => {
        const { termTypeCode, termContent } = item;
        date = { ...date, [termTypeCode]: termContent };
      });
      return { ...ele, ...date };
    });
    const rowSelection = {
      selectedRowKeys,
      onChange: onRowSelectChange,
    };

    const tableProps = {
      loading,
      dataSource: newDate,
      pagination,
      rowSelection,
      bordered: true,
      rowKey: 'pcHeaderId',
      columns: this.getColumns(pcTermDetailDTOList),
      onChange: onSearch,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map((n) => n.width)) };

    return <EditTable {...tableProps} />;
  }
}
