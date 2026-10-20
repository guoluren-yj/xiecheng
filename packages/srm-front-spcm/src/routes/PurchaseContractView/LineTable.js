/**
 * index.js - 我发起的协议列表
 * @date: 2019-05-23
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
import { Bind } from 'lodash-decorators';
// import { connect } from 'dva';
import { Tooltip, Icon } from 'hzero-ui';
import { Record } from 'choerodon-ui/dataset';
import IMChatDraggable from '_components/IMChatDraggable';
import { Button as PermissionButton } from 'components/Permission';
import EditTable from 'components/EditTable';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import BudgetModal from 'srm-front-sbud/lib/routes/BudgetOccupiedModal';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { dateRender, yesOrNoRender } from 'utils/renderer';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { tableScrollWidth, getCurrentUserId, getCurrentOrganizationId, isUrl } from 'utils/utils';
import OccupyModal from '@/routes/workspace/Component/Modal/OccupyModal';
import { autoChangePo } from '@/services/contractCommonService';
import { renderThousandthNum } from '@/utils/util';
import TargetModal from './Modal/TargetModal';
import Srm77750Modal from './Modal/Srm77750Modal';
import ModalBtn from './Modal/CertificateModal/ModalBtn';

const currentUserId = getCurrentUserId();

export default class LineTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // selectedRowKeys: [],
      //   invOrganizationName: undefined,
      regenerateOrderLoading: false,
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
   * protocolType - 预览编辑render方法
   * @param {!object} record - 行数据
   * @param {any} text - 单元格文本数据
   */
  @Bind()
  protocolType(text, record) {
    const { overdueRemindFlag } = record;
    const { redirectDetail = (e) => e, remote } = this.props;

    const { interRecords } = record;
    const isAllSuccuss =
      Array.isArray(interRecords) &&
      interRecords.length > 0 &&
      interRecords[0].importStatus === '0'; // 第一条推送失败则失败
    // return <a onClick={() => redirectDetail(record.pcHeaderId)}>{text}</a>;
    const IconCom = isAllSuccuss ? (
      <Tooltip
        title={intl.get(`spcm.purchaseContractView.model.pushsap.status.fail`).d('推送失败')}
      >
        <Icon style={{ color: 'red' }} type="close" />
      </Tooltip>
    ) : (
      ''
    );
    const rendererPcNum = () => {
      if (overdueRemindFlag === 1) {
        return (
          <a style={{ color: 'red' }} onClick={() => redirectDetail(record.pcHeaderId)}>
            {text}
            {IconCom}
          </a>
        );
      } else {
        return (
          <a onClick={() => redirectDetail(record.pcHeaderId)}>
            {text}
            {IconCom}
          </a>
        );
      }
    };
    return remote
      ? remote.process('SPCM_PUR_CONTRACT_VIEW_LIST_LINETABLE_RENDERERPCNUM', rendererPcNum(), {
          text,
          record,
          renderProps: this.props,
          IconCom,
          redirectDetail,
        })
      : rendererPcNum();
  }

  @Bind()
  handleUpdateRecord(record, archiveAttachmentUuid) {
    const { dataSource, dispatch } = this.props;
    const newDataSource = dataSource.map((item) => {
      if (item.pcHeaderId === record.pcHeaderId) {
        return {
          ...item,
          archiveAttachmentUuid,
        };
      }
      return item;
    });
    // this.setState({
    //   dataSource: newDataSource,
    // });
    dispatch({
      type: 'purchaseContractView/updateState',
      payload: { dataLineList: newDataSource },
    });
  }

  @Bind()
  afterOpenLineUploadModal(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseContractView/uploads',
      payload: {
        pcHeaderId: record.pcHeaderId,
        archiveAttachmentUuid: record.archiveAttachmentUuid,
      },
    });
  }

  // e签宝查看存证
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
    const { dispatch, onSearch, currentPage } = this.props;
    // const { currentPage } = this.state;
    dispatch({
      type: 'contractCommon/fetchLockPrintContract',
      payload: { pcHeaderId },
    }).then((res) => {
      if (res) {
        notification.success();
        onSearch(currentPage);
      }
    });
  }

  /**
   * 获取契约锁合同附件
   */
  @Bind()
  handleFetchLockContFile(pcHeaderId) {
    const { dispatch, onSearch, currentPage } = this.props;
    // const { currentPage } = this.state;
    dispatch({
      type: 'contractCommon/fetchLockContractFile',
      payload: { pcHeaderId },
    }).then((res) => {
      if (res) {
        notification.success();
        onSearch(currentPage);
      }
    });
  }

  /**
   * 重新生成订单
   */
  @Bind()
  async handleRegenerateOrder(record) {
    const { onSearch, currentPage } = this.props;
    this.setState({
      regenerateOrderLoading: true,
    });
    const res = await autoChangePo(record);
    this.setState({
      regenerateOrderLoading: false,
    });
    if (getResponse(res)) {
      notification.success();
      onSearch(currentPage);
    }
  }

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const { onControlTextComparison, remote, relationDoc, sealType } = this.props;
    const uploadProps = {
      icon: false,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'spcm-supplier',
    };

    const columnArray = [
      {
        dataIndex: 'noExit',
        width: 50,
        fixed: 'left',
        render: (_, record = {}) => (
          <IMChatDraggable
            cardCode="PURCHASE_CONTRACT_VIEW"
            icon="baseline-drag_indicator"
            tooltip=""
            showDetail
            requestBody={() => record}
            dragText={`协议${record.pcNum || ''}`}
          />
        ),
      },
      {
        title: intl.get(`spcm.purchaseContractView.model.pcStatusCode`).d('状态'),
        dataIndex: 'pcStatusCode',
        width: 85,
        fixed: 'left',
        render: (_, record) => record.pcStatusCodeMeaning,
      },
      {
        title: intl.get(`spcm.common.model.common.purchaseAgreementNum`).d('采购协议编号'),
        dataIndex: 'pcNum',
        width: 180,
        fixed: 'left',
        render: this.protocolType,
      },
      ['1', 1].includes(relationDoc?.displayDoc) && {
        title: intl.get('spcm.common.model.common.checkTheImplementation').d('查看执行情况'),
        dataIndex: 'contractStageAndAccept',
        width: 120,
        fixed: 'left',
        render: (_, record) => (
          <Srm77750Modal record={record}>
            {intl.get('spcm.common.model.common.checkTheImplementationView').d('查看')}
          </Srm77750Modal>
        ),
      },
      {
        title: intl.get(`spcm.common.model.common.version`).d('版本号'),
        dataIndex: 'version',
        width: 80,
        fixed: 'left',
      },
      {
        title: intl.get(`spcm.common.model.common.purchaseAgreementName`).d('采购协议名称'),
        dataIndex: 'pcName',
        width: 200,
        fixed: 'left',
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
        width: 200,
      },
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 150,
        // render: (val, record) => record.supplierCompanyName || record.supplierName,
      },
      {
        title: intl.get(`spcm.common.model.common.globalFlag`).d('是否全局协议'),
        dataIndex: 'globalFlag',
        width: 150,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`spcm.common.model.common.amount`).d('协议总额'),
        dataIndex: 'taxIncludeAmount',
        width: 150,
        render: (val) => renderThousandthNum(val),
      },
      {
        title: intl.get(`spcm.common.model.common.executedAmount`).d('已执行金额'),
        dataIndex: 'executedAmount',
        width: 150,
        render: (val) => renderThousandthNum(val),
      },
      {
        title: intl.get(`spcm.common.model.common.toExecuteAmount`).d('待执行金额'),
        dataIndex: 'toExecuteAmount',
        width: 150,
        render: (val) => renderThousandthNum(val),
      },
      {
        title: intl.get('spcm.common.model.common.contractAcceptStatus').d('协议验收状态'),
        dataIndex: 'acceptStatus',
        width: 150,
        render: (_, record) => record.acceptStatusMeaning && record.acceptStatusMeaning,
      },
      {
        title: intl.get('spcm.common.model.common.contractAccept').d('协议验收'),
        dataIndex: 'acceptListNum',
        width: 150,
        render: (_, record) => (
          <TargetModal
            record={record}
            isLink
            detailFlag={0}
            disabled={record.acceptType === 'none'}
          >
            {intl.get('spcm.common.model.common.contractAccept').d('协议验收')}
          </TargetModal>
        ),
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
        title: intl.get(`spcm.common.model.common.pcTemplateId`).d('协议模板'),
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
        title: intl.get(`spcm.purchaseContractView.model.signDate`).d('签订日期'),
        dataIndex: 'signDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.purchaseContractView.model.startDateActive`).d('生效日期'),
        dataIndex: 'startDateActive',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.purchaseContractView.model.endDateActive`).d('失效日期'),
        dataIndex: 'endDateActive',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.common.model.remainDate`).d('剩余有效期'),
        dataIndex: 'remainDate',
        width: 120,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建时间'),
        dataIndex: 'creationDate',
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
        title: intl.get(`spcm.common.archiveFlag`).d('归档状态'),
        dataIndex: 'archiveFlag',
        width: 120,
        render: (_, record) => record.archiveFlagMeaning,
      },
      {
        title: intl.get(`spcm.common.releaseDate`).d('发布时间'),
        dataIndex: 'releaseDate',
        width: 100,
      },
      {
        title: intl.get(`spcm.common.submitDate`).d('提交时间'),
        dataIndex: 'submitDate',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.archiveDate`).d('归档日期'),
        dataIndex: 'archiveDate',
        width: 120,
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
        render: (val, record) => {
          const {
            pcStatusCode,
            archiveAttachmentUuid,
            enabledArchiveFlag,
            createdBy,
            enableWhiteSettingFlag,
          } = record;
          return (
            (pcStatusCode === 'ARCHIVE' || archiveAttachmentUuid) && ( // 已归档文件或者已上传过归档文件
              <UploadModal
                viewOnly={
                  enabledArchiveFlag !== 1 ||
                  createdBy !== currentUserId ||
                  enableWhiteSettingFlag !== '0'
                }
                attachmentUUID={archiveAttachmentUuid}
                afterOpenUploadModal={(uuid) => this.handleUpdateRecord(record, uuid)}
                onUploadSuccess={() => this.afterOpenLineUploadModal(record)}
                showUploadList={{
                  showRemoveIcon: record.pcStatusCode !== 'ARCHIVE', // 已归档状态不能删除
                }}
                {...uploadProps}
              />
            )
          );
        },
      },
      {
        title: intl.get(`spcm.common.model.terminationAttachment`).d('终止文件'),
        dataIndex: 'terminationAttachmentUuid',
        width: 130,
        render: (val, record) =>
          ['TERMINATION', 'TERMINATION_CONFIRM', 'TERMINATION_TO_APPROVAL'].includes(
            record.pcStatusCode
          ) &&
          (val || record.createdBy === currentUserId) && (
            <UploadModal
              viewOnly={record.createdBy !== currentUserId}
              attachmentUUID={record.terminationAttachmentUuid}
              icon={false}
              showUploadList={{
                showRemoveIcon: false,
              }}
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="purchaser-attachment"
            />
          ),
      },
      {
        title: intl.get(`spcm.common.model.occupancyRecords`).d('金额占用记录查询'),
        dataIndex: 'occupancyRecords',
        width: 120,
        // 预算类型,1代表行生成预算，2代表头生成预算，0代表没有生成
        render: (_, record) =>
          record.budgetType === '2' && (
            <BudgetModal documentType="PC" docLineId={record.pcHeaderId} />
          ),
      },
      {
        title: intl.get('spcm.common.model.common.occupyRecords').d('订单金额占用记录'),
        dataIndex: 'occupyRecords',
        width: 120,
        render: (_, record) => {
          const newRecord = new Record(record);
          return record.amountControlDimension === 'HEAD' ? (
            <OccupyModal record={newRecord} />
          ) : (
            '-'
          );
        },
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
        width: 330,
        render: (_, record) => [
          record.pcStatusCode !== 'PENDING' &&
            !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(record.pcKindCode) &&
            !(
              record.signatureType === 'ANNEX_SIGNATURE' &&
              record.electricSignFlag === 1 &&
              record.authType === 'ESIGN'
            ) && (
              <PermissionButton
                type="text"
                permissionList={[
                  {
                    code: 'srm.pc-admin.pc-purchaser.view.ps.text.comparison',
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
            (
              (!(record?.orderSignFlag == 1 && record?.orderUnwillingSignFlag == 1) && record.sceneCertificateNo)
              || (!record.sceneCertificateNo && !(record.electronicOrderType || sealType)?.includes('_SAAS'))
            )
          && Number(record.electricSignFlag) === 1
           && (
              ['EFFECTED', 'TERMINATION', 'TERMINATION_CONFIRM', 'ARCHIVE', 'ARCHIVE_TO_APPROVAL', 'TERMINATION_TO_APPROVAL', 'EXPIRED', 'SUPPLEMENT_COMPLETE', 'FIRST_EDITION'].includes(record.pcStatusCode)
            ) && (
              <ModalBtn
                record={{...record, authType: record.sceneCertificateNo? "ESIGN" : record.electronicOrderType || sealType}}
                onClickESIGN={() => this.handleJumpViewCertificateDeposit(record)}
              >
                <a style={{ paddingRight: '1em' }}>
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
          <PermissionButton
            type="text"
            permissionList={[
              {
                code: 'srm.pc-admin.pc-purchaser.view.ps.jala.contract.lock.print.file',
                type: 'button',
                meaning: '获取合同附件',
              },
            ]}
            style={{ paddingRight: '1em' }}
            onClick={() => this.handleFetchLockContFile(record.pcHeaderId)}
          >
            {intl
              .get(`spcm.purchaseContractView.view.button.fetchLockContractFile`)
              .d('获取合同附件')}
          </PermissionButton>,
        ],
      },
      {
        title: intl.get(`spcm.purchaseContractView.model.pushsap.status`).d('推送状态'),
        dataIndex: 'interRecords',
        width: 100,
        render: (value, record) => {
          const { interRecords } = record;

          if (Array.isArray(interRecords) && interRecords.length > 0) {
            const isAllSuccuss = interRecords[0].importStatus === '0'; // 第一条推送失败则失败
            return (
              <a onClick={() => this.props.handleExectRecord(record)}>
                {isAllSuccuss ? (
                  <span style={{ color: 'red' }}>
                    {intl.get(`spcm.purchaseContractView.model.pushsap.status.fail`).d('推送失败')}
                  </span>
                ) : (
                  <span>
                    {intl
                      .get(`spcm.purchaseContractView.model.pushsap.status.success`)
                      .d('推送成功')}
                  </span>
                )}
              </a>
            );
          }
        },
      },
      {
        title: intl.get(`spcm.common.model.common.transferOrderStatus`).d('自动转订单状态'),
        dataIndex: 'transferOrderStatus',
        width: 140,
        render: (value, record) => {
          const { transferOrderReason, transferOrderStatusMeaning } = record;
          if (value === 'TRANSFER_FAIL') {
            return <Tooltip title={transferOrderReason}>{transferOrderStatusMeaning}</Tooltip>;
          } else {
            return transferOrderStatusMeaning;
          }
        },
      },
      {
        title: intl.get(`spcm.common.model.common.regenerateOrder`).d('重新生成订单'),
        dataIndex: 'regenerateOrder',
        width: 120,
        render: (_, record) => {
          if (record.transferOrderStatus !== 'TRANSFER_FAIL') return '-';
          // 转单失败
          return (
            <PermissionButton type="text" onClick={() => this.handleRegenerateOrder(record)}>
              {intl.get(`spcm.common.model.common.regenerateOrder`).d('重新生成订单')}
            </PermissionButton>
          );
        },
      },
    ].filter(Boolean);
    return remote
      ? remote.process('SPCM_PUR_CONTRACT_VIEW_LIST_LINECOLUMNS', columnArray, {
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
      columnsHook,
      // selectedRowKeys = [],
    } = this.props;
    const { regenerateOrderLoading = false } = this.state;
    const selectedRowKeys = selectedRows.map((item) => item.pcHeaderId);
    let columns = this.getColumns();
    columns = columnsHook ? columnsHook(columns) : columns;
    const rowSelection = {
      selectedRowKeys,
      onChange: onRowSelectChange,
    };
    const scrollX = tableScrollWidth(columns, 100);
    const tableProps = {
      columns,
      dataSource,
      rowSelection,
      loading: loading || regenerateOrderLoading,
      bordered: true,
      rowKey: 'pcHeaderId',
      onChange: (page) => onSearch(page),
      pagination,
      scroll: { x: scrollX, y: 'calc(100vh - 400px)' },
    };

    return customizeTable(
      {
        code: 'SPCM.PURCHASE_CONTRACT_VIEW.LINE_LIST',
      },
      <EditTable {...tableProps} />
    );
  }
}
