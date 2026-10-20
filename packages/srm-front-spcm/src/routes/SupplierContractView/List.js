/**
 * index.js - 我收到的协议列表
 * @date: 2019-05-24
 * @author: zuoxaingyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
import { Bind } from 'lodash-decorators';
import { sum, isNumber } from 'lodash';
import { Tooltip } from 'hzero-ui';
import { Icon } from 'choerodon-ui';
import { connect } from 'dva';

import { Button as PermissionButton } from 'components/Permission';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import { dateRender, yesOrNoRender } from 'utils/renderer';
import UploadModal from 'components/Upload/index';
import { getCurrentOrganizationId, isUrl } from 'utils/utils';
import notification from 'utils/notification';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { querySealType } from '@/services/contractCommonService';
import ModalBtn from '../PurchaseContractView/Modal/CertificateModal/ModalBtn';

import styles from '../../index.less';

const commonPrompt = 'spcm.common.model';

@connect(({ contractCommon = {} }) => ({
  contractCommon,
}))
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
   * protocolType - 预览编辑render方法
   * @param {!object} record - 行数据
   * @param {any} text - 单元格文本数据
   */
  @Bind()
  protocolType(text, record) {
    const { redirectDetail = (e) => e, remote } = this.props;
    const { overdueRemindFlag, msgNum } = record;
    // return <a onClick={() => redirectDetail(record.pcHeaderId)}>{text}</a>;
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
    const rendererPcNum = () => {
      if (overdueRemindFlag === 1) {
        return (
          <>
            <a style={{ color: 'red' }} onClick={() => redirectDetail(record.pcHeaderId)}>
              {text}
            </a>
            {msgNumEle}
          </>
        );
      } else {
        return (
          <>
            <a onClick={() => redirectDetail(record.pcHeaderId)}>{text}</a>
            {msgNumEle}
          </>
        );
      }
    };
    return remote
      ? remote.process('SPCM_SUP_CONTRACT_VIEW_LIST_LISTTABLE_RENDERDERPCNUM', rendererPcNum(), {
          text,
          record,
          renderProps: this.props,
          redirectDetail,
        })
      : rendererPcNum();
  }

  @Bind()
  handleJumpViewCertificateDeposit(record) {
    const { dispatch } = this.props;
    const { sceneCertificateNo, pcHeaderId } = record;
    const tenantId = getCurrentOrganizationId();
    dispatch({
      type: 'contractCommon/queryViewCertificateDeposit',
      payload: {
        pcHeaderId,
        sceneCertificateNo,
        tenantId,
      },
    }).then((res) => {
      if (isUrl(res)) {
        window.open(res);
      } else if (res === 'Y') {
        notification.warning({
          message: intl
            .get('spcm.common.view.jurisdiction')
            .d('由于存证查看权限升级，该类历史存证仅能由签署人查看'),
        });
      } else if (res === 'N') {
        notification.warning({
          message: intl.get('spcm.common.view.noViewDepositPermission').d('无查看该存证权限'),
        });
      } else if (res === 'U') {
        notification.warning({
          message: intl
            .get('spcm.common.view.noRealNameCertificationOrCertification')
            .d('无实名认证或认证中'),
        });
      } else {
        notification.warning({
          message: intl.get('spcm.common.view.noQueryViewCertificateDeposit').d('暂未查询到数据！'),
        });
      }
    });
  }

  /**
   * 获取打印链接
   */
  @Bind()
  handleFetchPrintContract(pcHeaderId) {
    const { dispatch, onSearch } = this.props;
    dispatch({
      type: 'contractCommon/fetchLockPrintContract',
      payload: { pcHeaderId },
    }).then((res) => {
      if (res) {
        notification.success();
        onSearch();
      }
    });
  }

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const { sealType } = this.state;
    const { onControlTextComparison, remote } = this.props;
    const uploadProps = {
      icon: false,
      // btnText: intl.get('entity.attachment.upload').d('附件上传'),
      // showFilesNumber: false,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'spcm-supplier',
    };
    const columnArray = [
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'pcStatusCode',
        width: 85,
        render: (_, record) => record.pcStatusCodeMeaning,
      },
      {
        title: intl.get(`${commonPrompt}.common.purchaseAgreementNum`).d('采购协议编号'),
        dataIndex: 'pcNum',
        width: 180,
        render: this.protocolType,
      },
      {
        title: intl.get(`spcm.common.model.common.version`).d('版本号'),
        dataIndex: 'version',
        width: 80,
      },
      {
        title: intl.get(`${commonPrompt}.common.purchaseAgreementName`).d('采购协议名称'),
        dataIndex: 'pcName',
        width: 200,
        render: (val, record) => (
          <Tooltip placement="topLeft" title={record.pcName}>
            {record.pcName}
          </Tooltip>
        ),
      },
      {
        title: intl.get(`${commonPrompt}.agreementObject`).d('协议对象'),
        dataIndex: 'supplierCompanyName',
        width: 200,
        render: (val, record) => record.supplierCompanyName || record.supplierName,
      },
      {
        title: intl.get(`${commonPrompt}.common.pcKindCode`).d('协议性质'),
        dataIndex: 'pcKindCode',
        width: 100,
        render: (_, record) => record.pcKindCodeMeaning,
      },
      {
        title: intl.get(`entity.customer.tag`).d('客户'),
        dataIndex: 'companyName',
        width: 200,
      },
      {
        title: intl.get(`spcm.common.model.common.globalFlag`).d('是否全局协议'),
        dataIndex: 'globalFlag',
        width: 150,
        render: (val) => yesOrNoRender(val),
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
        title: intl.get(`spcm.purchaseContractView.model.getDate`).d('生效日期'),
        dataIndex: 'confirmedDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`${commonPrompt}.common.pcType`).d('协议类型'),
        dataIndex: 'pcTypeId',
        width: 120,
        render: (_, record) => record.pcTypeName,
      },
      {
        title: intl.get(`${commonPrompt}.common.pcTemplateId`).d('协议模板'),
        dataIndex: 'pcTemplateId',
        width: 120,
        render: (_, record) => record.templateName,
      },
      {
        title: intl.get(`${commonPrompt}.agreementSource`).d('协议来源'),
        dataIndex: 'pcSourceCode',
        width: 100,
        render: (_, record) => record.pcSourceCodeMeaning,
      },
      {
        title: intl.get(`${commonPrompt}.mainAgreementCode`).d('主协议编码'),
        dataIndex: 'mainContractId',
        width: 100,
        render: (_, record) => record.mainPcNum,
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
        title: intl.get(`spcm.common.attachmentUuid`).d('归档文件'),
        dataIndex: 'archiveAttachmentUuid',
        width: 130,
        render: (val, record) =>
          record.archiveAttachmentUuid && (
            <UploadModal viewOnly attachmentUUID={record.archiveAttachmentUuid} {...uploadProps} />
          ),
      },
      sealType?.includes('_SAAS') && {
        title: intl.get(`spcm.common.model.terminateSignStatus`).d('解约签署状态'),
        dataIndex: 'terminateSignStatus',
        width: 120,
        render: (_, record) => record.terminateSignStatusMeaning,
      },
      sealType?.includes('_SAAS') && {
        title: intl.get(`spcm.common.model.terminateSignFileUuid`).d('解约文件'),
        dataIndex: 'terminateSignFileUuid',
        width: 130,
        render: (val) =>
          val && (
            <UploadModal
              viewOnly
              attachmentUUID={val}
              {...uploadProps}
              bucketDirectory="purchase-contract"
            />
          ),
      },
      {
        title: intl.get(`spcm.common.model.terminationAttachment`).d('终止文件'),
        dataIndex: 'terminationAttachmentUuid',
        width: 130,
        render: (val, record) =>
          ['TERMINATION', 'TERMINATION_CONFIRM'].includes(record.pcStatusCode) &&
          record.terminationAttachmentUuid && (
            <UploadModal
              viewOnly
              attachmentUUID={record.terminationAttachmentUuid}
              icon={false}
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="purchaser-attachment"
            />
          ),
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
        width: 250,
        render: (_, record) => [
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
                    code: 'srm.pc-admin.pc-supplier.view.ps.text.comparison',
                    type: 'button',
                    meaning: '文本对比',
                  },
                ]}
                style={{ paddingRight: '1em' }}
                onClick={() => onControlTextComparison({ pcHeaderId: record.pcHeaderId })}
              >
                {intl.get('spcm.common.view.title.textComparison').d('文本对比')}
              </PermissionButton>
            ),
          !record?.authType?.includes('_SAAS') && (
            <ModalBtn
              record={record}
              onClickESIGN={() => this.handleJumpViewCertificateDeposit(record)}
            >
              <a
                style={{ paddingRight: '1em' }}
                disabled={
                  !record.authType
                    ? true
                    : record.authType === 'ESIGN'
                    ? // eslint-disable-next-line
                      (record?.orderSignFlag == 1 && record?.orderUnwillingSignFlag == 1) ||
                      !record.sceneCertificateNo
                    : !(
                        record.pcStatusCode === 'EFFECTED' ||
                        record.pcStatusCode === 'TERMINATION' ||
                        record.pcStatusCode === 'TERMINATION_CONFIRM' ||
                        record.pcStatusCode === 'ARCHIVE' ||
                        record.pcStatusCode === 'ARCHIVE_TO_APPROVAL' ||
                        record.pcStatusCode === 'TERMINATION_TO_APPROVAL'
                      ) ||
                      ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(record.pcKindCode) ||
                      record.electricSignFlag === 0
                }
              >
                {intl.get('spcm.common.view.title.viewCertificate').d('查看存证')}
              </a>
            </ModalBtn>
          ),
          <PermissionButton
            type="text"
            permissionList={[
              {
                code: 'srm.pc-admin.pc-purchaser.view.ps.jala.contract.lock.print',
                type: 'button',
                meaning: '获取打印链接',
              },
            ]}
            style={{ paddingRight: '1em' }}
            onClick={() => this.handleFetchPrintContract(record.pcHeaderId)}
          >
            {intl
              .get(`spcm.purchaseContractView.view.button.fetchLockPrintContract`)
              .d('获取打印链接')}
          </PermissionButton>,
        ],
      },
    ].filter(Boolean);
    return remote
      ? remote.process('SPCM_SUP_CONTRACT_VIEW_LIST_LINECOLUMNS', columnArray, {
          current: this,
        })
      : columnArray;
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
    } = this.props;
    const selectedRowKeys = selectedRows.map((item) => item.pcHeaderId);
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
      x: sum(tableProps.columns.map((n) => (isNumber(n.width) ? n.width : 100))) + 300,
      y: 'calc(100vh - 335px)',
    };

    return customizeTable(
      {
        code: 'SPCM.SUPPLIER_CONTRACT_VIEW.LIST',
      },
      <EditTable {...tableProps} />
    );
  }
}
