/*
 * @Description: index.js - 协议用章列表
 * @Author: MJQ <jiaqi.mao@hand-china.com>
 * @Date: 2019-08-23 11:14:15
 * @LastEditTime: 2024-08-09 14:57:10
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import EditTable from 'components/EditTable';
import { sum } from 'lodash';
import { Tooltip } from 'hzero-ui';

import { Button as PermissionButton } from 'components/Permission';
import intl from 'utils/intl';
import { dateRender, yesOrNoRender } from 'utils/renderer';
import { querySealType } from '@/services/contractCommonService';

export default class List extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sealType: '',
    };
  }

  componentDidMount() {
    this.fetchSealType();
  }

  fetchSealType = async () => {
    const res = await querySealType();
    // 此处不要用getResponse处理，因为‘核企未开通签章套餐’也会作为错误抛出，但是我们不需要将此错误可视化。
    this.setState({ sealType: res?.sealType });
  };

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
          handleModalVisibleList('operationRecordVisible', true, { pcHeaderId: record.pcHeaderId })
        }
      >
        {intl.get(`hzero.common.button.operating`).d('操作记录')}
      </a>
    );
  }

  @Bind()
  getColumns() {
    const { sealType } = this.state;
    const { onControlTextComparison, remote } = this.props;
    const columnArray = [
      {
        title: intl.get(`spcm.contractChapter.model.common.pcStatusCode`).d('状态'),
        dataIndex: 'pcStatusCode',
        width: 85,
        render: (_, record) => record.pcStatusCodeMeaning,
      },
      {
        title: intl.get(`spcm.common.model.common.purchaseAgreementNum`).d('采购协议编号'),
        dataIndex: 'pcNum',
        width: 160,
        render: this.changeSkip,
      },
      {
        title: intl.get(`spcm.common.model.common.version`).d('版本号'),
        dataIndex: 'version',
        width: 80,
      },
      {
        title: intl.get(`spcm.common.model.purchaseAgreementName`).d('采购协议名称'),
        dataIndex: 'pcName',
        width: 200,
        render: (val, record) => (
          <Tooltip placement="topLeft" title={record.pcName}>
            {record.pcName}
          </Tooltip>
        ),
      },
      {
        title: intl.get(`spcm.common.model.agreementObject`).d('协议对象'),
        dataIndex: 'supplierCompanyName',
        width: 150,
        render: (val, record) => record.supplierCompanyName || record.supplierName,
      },
      {
        title: intl.get(`spcm.common.model.pcKindCode`).d('协议性质'),
        dataIndex: 'pcKindCode',
        width: 150,
        render: (_, record) => record.pcKindCodeMeaning,
      },
      {
        title: intl.get(`spcm.contractChapter.model.common.pcType`).d('协议类型'),
        dataIndex: 'pcTypeId',
        width: 150,
        render: (_, record) => record.pcTypeName,
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
        width: 200,
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
        width: 150,
        render: (_, record) => record.purchaseAgentName,
      },
      {
        title: intl.get(`spcm.common.model.pcTemplateId`).d('协议模板'),
        dataIndex: 'pcTemplateId',
        width: 160,
        render: (_, record) => record.templateName,
      },
      {
        title: intl.get(`spcm.contractChapter.model.common.releaseData`).d('创建人'),
        dataIndex: 'createdBy',
        width: 140,
        render: (_, record) => record.createByRealName,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.common.model.agreementSource`).d('协议来源'),
        dataIndex: 'pcSourceCode',
        width: 150,
        render: (_, record) => record.pcSourceCodeMeaning,
      },
      {
        title: intl.get(`spcm.common.model.mainAgreementCode`).d('主协议编码'),
        dataIndex: 'mainContractId',
        width: 150,
        render: (_, record) => record.mainPcNum,
      },
      sealType?.includes('_SAAS') && {
        title: intl.get(`spcm.common.model.terminateSignStatus`).d('解约签署状态'),
        dataIndex: 'terminateSignStatus',
        width: 120,
        render: (_, record) => record.terminateSignStatusMeaning,
      },
      {
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        dataIndex: 'operating',
        width: 150,
        render: (_, record) => this.editorPreview(record),
      },
      {
        title: intl.get(`spcm.common.signatureTypeMeaning`).d('签署方式'),
        dataIndex: 'signatureTypeMeaning',
        width: 150,
        render: (_, record) => {
          if (record.electricSignFlag === 1 && record.authType === 'ESIGN') {
            if (
              ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(record.pcKindCode) &&
              record.signatureType === 'TEXT_SIGNATURE'
            ) {
              return '';
            }
            return record.signatureTypeMeaning;
          }
        },
      },
      {
        title: intl.get('hzero.common.button.operator').d('操作'),
        dataIndex: 'operator',
        width: 150,
        fixed: 'right',
        render: (_, record) => {
          const isAttachmentSignUpload =
            record.signatureType === 'ANNEX_SIGNATURE' &&
            record.electricSignFlag === 1 &&
            record.authType === 'ESIGN';
          return (
            !isAttachmentSignUpload &&
            !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(record.pcKindCode) && (
              <PermissionButton
                type="text"
                permissionList={[
                  {
                    code: 'srm.pc-admin.pc-purchaser.chapter.ps.text.comparison',
                    type: 'button',
                    meaning: '文本对比',
                  },
                ]}
                onClick={() => onControlTextComparison({ pcHeaderId: record.pcHeaderId })}
              >
                {intl.get('spcm.common.view.title.textComparison').d('文本对比')}
              </PermissionButton>
            )
          );
        },
      },
    ].filter(Boolean);
    return remote
      ? remote.process('SPCM_CONTRACT_CHAPTER_VIEW_LIST_LINECOLUMNS', columnArray, {
          current: this,
        })
      : columnArray;
  }

  render() {
    const {
      selectedRowKeys,
      loading,
      onSearch,
      pagination,
      dataSource,
      onRowSelectChange = (e) => e,
      customizeTable,
    } = this.props;

    // const selectedRowKeys = selectedRows.map(item => item.pcHeaderId);
    const rowSelection = {
      selectedRowKeys,
      onChange: onRowSelectChange,
    };

    const tableProps = {
      loading,
      dataSource,
      pagination,
      rowSelection,
      bordered: true,
      rowKey: 'pcHeaderId',
      columns: this.getColumns(),
      onChange: onSearch,
    };

    tableProps.scroll = {
      x: sum(tableProps.columns.map((n) => n.width)) + 300,
      y: 'calc(100vh - 335px)',
    };

    return customizeTable(
      {
        code: 'SPCM.CONTRACT.CHAPTER.LIST',
      },
      <EditTable {...tableProps} />
    );
  }
}
