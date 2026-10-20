/**
 * index.js - 协议审签署列表
 * @date: 2019-05-22
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
import { Icon } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';

import { Button as PermissionButton } from 'components/Permission';
import { dateRender, yesOrNoRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import { sum } from 'lodash';
import { Tooltip } from 'hzero-ui';
import { querySealType } from '@/services/contractCommonService';
import excpedited from '@/assets/icon-expedited.svg';

import styles from '../../index.less';

export default class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // selectedRowKeys: [],
      //   invOrganizationName: undefined,
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

  /**
   * changeSkip - 协议类型编码render方法
   * @param {!object} record - 行数据
   * @param {any} text - 单元格文本数据
   */
  @Bind()
  changeSkip(text, record) {
    const { redirectDetail = (e) => e, remote } = this.props;
    const { msgNum } = record;

    const msgNumEle =
      msgNum > 0 ? (
        <Tooltip
          title={intl
            .get('spcm.common.view.tooltip.unreadMessages', {
              msgNum: msgNum > 99 ? '99+' : msgNum,
            })
            .d('{msgNum}条在线沟通消息未读')}
        >
          <Icon type="notifications" className={styles['row-agent-column-icon']} />
        </Tooltip>
      ) : null;
    let params = [record.pcHeaderId, record.supplierCompanyId, record.electricSignFlag];
    params = remote
      ? remote.process('SPCM_CONTRACT_SIGN_VIEW_REDIRECTPARAMS', params, {
          current: this,
          record,
          text,
        })
      : params;
    return (
      <span>
        <a onClick={() => redirectDetail(...params)}>{text}</a>
        {record.pcStatusCode === 'TERMINATION_CONFIRM' ? (
          <Tooltip title={intl.get(`spcm.common.model.common.overSure`).d('终止确认')}>
            <img src={excpedited} alt="img" />
          </Tooltip>
        ) : (
          ''
        )}
        {msgNumEle}
      </span>
    );
  }

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const { sealType } = this.state;
    const { onControlTextComparison, remote } = this.props;
    const columnArray = [
      {
        title: intl.get(`spcm.contractSign.model.common.pcStatusCode`).d('状态'),
        dataIndex: 'pcStatusCode',
        width: 85,
        render: (_, record) => record.pcStatusCodeMeaning,
      },
      {
        title: intl.get(`spcm.common.model.common.purchaseAgreementNum`).d('采购协议编号'),
        dataIndex: 'pcNum',
        width: 200,
        render: this.changeSkip,
      },
      {
        title: intl.get(`spcm.common.model.common.version`).d('版本号'),
        dataIndex: 'version',
        width: 80,
      },
      {
        title: intl.get(`spcm.contractSign.model.common.electricSignFlag`).d('是否电签'),
        dataIndex: 'electricSignFlag',
        width: 100,
        render: (text, record) =>
          record.electricSignFlag === 1
            ? intl.get(`spcm.contractSign.model.common.yes`).d('是')
            : intl.get(`spcm.contractSign.model.common.no`).d('否'),
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
        width: 100,
        render: (_, record) => record.pcKindCodeMeaning,
      },
      {
        title: intl.get(`spcm.contractSign.model.common.customerName`).d('客户名称'),
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
        width: 100,
        render: (_, record) => record.purchaseAgentName,
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
        title: intl.get(`spcm.contractSign.model.common.releaseData`).d('发布日期'),
        dataIndex: 'approvedDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.common.model.pcType`).d('协议类型'),
        dataIndex: 'pcTypeId',
        width: 120,
        render: (_, record) => record.pcTypeName,
      },
      {
        title: intl.get(`spcm.common.model.pcTemplateId`).d('协议模板'),
        dataIndex: 'pcTemplateId',
        width: 120,
        render: (_, record) => record.templateName,
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
      sealType?.includes('_SAAS') && {
        title: intl.get(`spcm.common.model.terminateSignStatus`).d('解约签署状态'),
        dataIndex: 'terminateSignStatus',
        width: 120,
        render: (_, record) => record.terminateSignStatusMeaning,
      },
      {
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        dataIndex: 'operating',
        width: 100,
        render: (_, record) => this.editorPreview(record),
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
        title: intl.get('hzero.common.button.operator').d('操作'),
        dataIndex: 'operator',
        width: 100,
        fixed: 'right',
        render: (_, record) =>
          !(
            record.signatureType === 'ANNEX_SIGNATURE' &&
            record.electricSignFlag === 1 &&
            record.authType === 'ESIGN'
          ) &&
          !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(record.pcKindCode) && (
            <PermissionButton
              type="text"
              permissionList={[
                {
                  code: 'srm.pc-admin.pc-supplier.sign.ps.text.comparison',
                  type: 'button',
                  meaning: '文本对比',
                },
              ]}
              onClick={() => onControlTextComparison({ pcHeaderId: record.pcHeaderId })}
            >
              {intl.get('spcm.common.view.title.textComparison').d('文本对比')}
            </PermissionButton>
          ),
      },
    ].filter(Boolean);
    const remoteColumns = remote ? remote.process('SPCM_CONTRACT_SIGN_VIEW_LIST_PROCESS_TABLE_LIST_COLUMNS', columnArray, {}) : columnArray;
    return remoteColumns;
  }

  render() {
    const {
      loading,
      dataSource,
      onSearch,
      pagination,
      selectedRows,
      onRowSelectChange = (e) => e,
      customizeTable,
      // selectedRowKeys = [],
      remote,
    } = this.props;
    const selectedRowKeys = selectedRows.map((item) => item.pcHeaderId);
    const columns = this.getColumns();
    const rowSelection = {
      selectedRowKeys,
      onChange: onRowSelectChange,
    };
    let tableProps = {
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

    if (remote) {
      const newObject = remote.process(
        'SPCM_CONTRACT_SIGN_LIST_TABLEPROPS',
        { tableProps },
        {
          current: this,
        }
      );
      tableProps = newObject?.tableProps;
    }

    return customizeTable(
      {
        code: 'SPCM.CONTRACT.SIGN.LIST',
      },
      <EditTable {...tableProps} />
    );
  }
}
