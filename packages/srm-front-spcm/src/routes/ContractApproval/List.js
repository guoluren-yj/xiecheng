/**
 * index.js - 协议审批列表
 * @date: 2019-05-20
 * @author: zuoxaingyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
import { Bind } from 'lodash-decorators';
import { sum } from 'lodash';
import { Tooltip } from 'hzero-ui';

import { Button as PermissionButton } from 'components/Permission';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import UploadModal from 'components/Upload';
import { dateRender, yesOrNoRender } from 'utils/renderer';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';

export default class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // selectedRowKeys: [],
      //   invOrganizationName: undefined,
    };
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
          handleModalVisibleList('operationRecordVisible', true, { pcHeaderId: record.pcHeaderId })
        }
      >
        {intl.get(`hzero.common.button.operating`).d('操作记录')}
      </a>
    );
  }

  /**
   * upTemplate - 上传文件render方法
   * @param {object} record - 行数据
   */
  @Bind()
  upTemplate(text, record) {
    const { afterOpenLineUploadModal = (e) => e } = this.props;
    const uploadModalProps = {
      showFilesNumber: false,
      icon: false,
      templateFileURL: record.templateFileUrl,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'sodr-order',
      afterOpenUploadModal: (uuid) => afterOpenLineUploadModal(uuid, record),
    };
    return <UploadModal {...uploadModalProps} />;
  }

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

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const { onControlTextComparison } = this.props;
    const columnArray = [
      {
        title: intl.get(`spcm.contractApproval.model.pcStatusCode`).d('状态'),
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
        title: intl.get(`spcm.common.model.common.purchaseAgreementName`).d('采购协议名称'),
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
        width: 200,
        render: (val, record) => record.supplierCompanyName || record.supplierName,
      },
      {
        title: intl.get(`spcm.common.model.common.pcKindCode`).d('协议性质'),
        dataIndex: 'pcKindCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`spcm.contractApproval.model.pcType`).d('协议类型'),
        dataIndex: 'pcTypeName',
        width: 100,
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
        title: intl.get(`spcm.common.model.common.termId`).d('付款条款'),
        dataIndex: 'termsName',
        width: 150,
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
        width: 100,
      },
      {
        title: intl.get(`entity.roles.creator`).d('创建人'),
        dataIndex: 'createByRealName',
        width: 180,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建时间'),
        dataIndex: 'creationDate',
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
      {
        title: intl.get(`spcm.common.archiveFlag`).d('归档状态'),
        dataIndex: 'archiveFlag',
        width: 120,
        render: (_, record) => record.archiveFlagMeaning,
      },
      {
        title: intl.get(`spcm.common.signatureTypeMeaning`).d('签署方式'),
        dataIndex: 'signatureTypeMeaning',
        width: 100,
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
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        width: 100,
        render: (_, record) => this.editorPreview(record),
      },
      {
        title: intl.get('hzero.common.button.operator').d('操作'),
        dataIndex: 'operator',
        width: 100,
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
                    code: 'srm.pc-admin.pc-purchaser.approval.ps.text.comparison',
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
    ];
    return columnArray;
  }

  render() {
    const {
      loading,
      dataSource,
      onSearch,
      pagination,
      onRowSelectChange = (e) => e,
      selectedRowKeys = [],
      customizeTable,
    } = this.props;
    const columns = this.getColumns();
    const rowSelection = {
      selectedRowKeys,
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
      pagination,
    };
    tableProps.scroll = {
      x: sum(tableProps.columns.map((n) => n.width)) + 300,
      y: 'calc(100vh - 335px)',
    };

    return customizeTable(
      {
        code: 'SPCM.PURCHASE_CONTRACT_APPROVAL.LIST',
      },
      <EditTable {...tableProps} />
    );
  }
}
