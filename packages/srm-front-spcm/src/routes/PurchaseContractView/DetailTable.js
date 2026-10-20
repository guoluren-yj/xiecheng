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
import { Tooltip } from 'hzero-ui';
import { Record } from 'choerodon-ui/dataset';

import { Button as PermissionButton } from 'components/Permission';
import EditTable from 'components/EditTable';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import BudgetModal from 'srm-front-sbud/lib/routes/BudgetOccupiedModal';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { dateRender, yesOrNoRender } from 'utils/renderer';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { tableScrollWidth, getCurrentUserId, getCurrentOrganizationId, isUrl } from 'utils/utils';
import OccupyModal from '@/routes/workspace/Component/Modal/OccupyModal';
import { renderThousandthNum, queryCommonDoubleUomConfig, getDynamicLabel } from '@/utils/util';
import DocFlow from '_components/DocFlow';
import ModalBtn from './Modal/CertificateModal/ModalBtn';

import TargetModal from './Modal/TargetModal';

const commonPrompt = 'spcm.common.model.common';
const modelPrompt = 'spcm.purchaseContractView.model';

const currentUserId = getCurrentUserId();

export default class DetailTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // selectedRowKeys: [],
      //   invOrganizationName: undefined,
      doubleUnitEnabled: 0,
    };
  }

  componentDidMount() {
    this.fetchDoubleUnitFlag();
  }

  /**
   * 双单位业务规则是否开启
   */
  @Bind()
  async fetchDoubleUnitFlag() {
    const res = await queryCommonDoubleUomConfig();
    this.setState({ doubleUnitEnabled: res });
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
    const { redirectDetail = (e) => e } = this.props;
    // return <a onClick={() => redirectDetail(record.pcHeaderId)}>{text}</a>;
    if (overdueRemindFlag === 1) {
      return (
        <a style={{ color: 'red' }} onClick={() => redirectDetail(record.pcHeaderId)}>
          {text}
        </a>
      );
    } else {
      return <a onClick={() => redirectDetail(record.pcHeaderId)}>{text}</a>;
    }
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
      payload: { dataDetailList: newDataSource },
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
    const { sceneCertificateNo = '', pcHeaderId } = record;
    const tenantId = getCurrentOrganizationId();
    dispatch({
      type: 'contractCommon/queryViewCertificateDeposit',
      payload: {
        pcHeaderId,
        sceneCertificateNo: sceneCertificateNo || '',
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
   * 获取列
   */
  @Bind()
  getColumns() {
    const { onControlDocumentModal, onControlTextComparison, relationDoc, remote, sealType } = this.props;
    const { doubleUnitEnabled } = this.state;
    const uploadProps = {
      icon: false,
      // btnText: intl.get('entity.attachment.upload').d('附件上传'),
      showFilesNumber: false,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'spcm-supplier',
    };

    const columnArray = [
      {
        title: intl.get(`${modelPrompt}.pcStatusCode`).d('状态'),
        dataIndex: 'pcStatusCode',
        width: 85,
        fixed: 'left',
        render: (_, record) => record.pcStatusCodeMeaning,
      },
      {
        title: intl.get(`${commonPrompt}.purchaseAgreementNum`).d('采购协议编号'),
        dataIndex: 'pcNum',
        width: 160,
        fixed: 'left',
        render: this.protocolType,
      },

      {
        title: intl.get(`${commonPrompt}.purchaseAgreementName`).d('采购协议名称'),
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
        width: 165,
        render: (val, record) => record.supplierCompanyName || record.supplierName,
      },
      {
        title: intl.get(`${commonPrompt}.pcKindCode`).d('协议性质'),
        dataIndex: 'pcKindCode',
        width: 100,
        render: (_, record) => record.pcKindCodeMeaning,
      },
      {
        title: intl.get(`${commonPrompt}.pcType`).d('协议类型'),
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
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 150,
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
        title: intl.get(`${commonPrompt}.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 180,
      },
      {
        title: intl.get(`${commonPrompt}.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 130,
      },
      {
        title: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
        dataIndex: 'categoryId',
        width: 120,
        render: (_, record) => record.categoryName,
      },
      {
        title: intl.get(`spcm.common.model.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.model.common.model`).d('型号'),
        dataIndex: 'model',
        width: 120,
      },
      {
        title: getDynamicLabel(doubleUnitEnabled),
        dataIndex: 'uomName',
        width: 140,
        render: (val, record) => (record.uomCodeAndName ? record.uomCodeAndName : val),
      },
      {
        title: getDynamicLabel(doubleUnitEnabled, 'quantity'),
        dataIndex: 'quantity',
        width: 120,
        render: (val) => renderThousandthNum(val),
      },
      doubleUnitEnabled && {
        title: intl.get(`${commonPrompt}.unit`).d('单位'),
        dataIndex: 'secondaryUomId',
        width: 140,
        render: (val, record) => record.secondaryUomCodeAndName || record.secondaryUomName,
      },
      doubleUnitEnabled && {
        title: intl.get(`${commonPrompt}.quantity`).d('数量'),
        dataIndex: 'secondaryQuantity',
        width: 120,
        render: (val) => renderThousandthNum(val),
      },
      {
        title: intl.get(`${commonPrompt}.executedQuantity`).d('已执行数量'),
        dataIndex: 'executedQuantity',
        width: 120,
        render: (val) => renderThousandthNum(val),
      },
      {
        title: intl.get(`${commonPrompt}.toExecuteQuantity`).d('待执行数量'),
        dataIndex: 'toExecuteQuantity',
        width: 120,
        render: (val) => renderThousandthNum(val),
      },
      {
        title: intl.get(`spcm.common.currencyCode`).d('原币币种'),
        dataIndex: 'currencyCode',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.purchaseCurrencyCode`).d('本币币种'),
        dataIndex: 'purchaseCurrencyCode',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.exchangeRate`).d('汇率:(本币/原币)'),
        dataIndex: 'exchangeRate',
        width: 160,
        render: (val) => (val ? `${val}:1` : ''),
      },
      {
        // title: intl.get(`spcm.common.model.unitPrice`).d('原币单价(不含税)'),
        title: getDynamicLabel(doubleUnitEnabled, 'unitPrice'),
        width: 140,
        dataIndex: 'unitPrice',
        align: 'right',
        render: (val) => renderThousandthNum(val),
      },
      doubleUnitEnabled && {
        title: intl.get(`spcm.common.model.unitPrice`).d('原币单价(不含税)'),
        width: 140,
        dataIndex: 'secondaryUnitPrice',
        align: 'right',
        render: (val) => renderThousandthNum(val),
      },
      {
        // title: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币含税单价'),
        title: getDynamicLabel(doubleUnitEnabled, 'taxIncludedUnitPrice'),
        width: 140,
        dataIndex: 'taxIncludedUnitPrice',
        align: 'right',
        render: (val) => renderThousandthNum(val),
      },
      doubleUnitEnabled && {
        title: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币含税单价'),
        width: 140,
        dataIndex: 'taxIncludedSecondaryUnitPrice',
        align: 'right',
        render: (val) => renderThousandthNum(val),
      },
      {
        title: intl.get(`spcm.common.model.purchaseTaxIncludedPrice`).d('本币含税单价'),
        dataIndex: 'purchaseTaxIncludedPrice',
        width: 120,
        align: 'right',
        render: (val) => renderThousandthNum(val),
      },
      {
        title: intl.get(`spcm.common.model.taxIncludedLineAmount`).d('原币含税行金额'),
        dataIndex: 'taxIncludedLineAmount',
        width: 120,
        align: 'right',
        render: (val) => renderThousandthNum(val),
      },
      {
        title: intl.get(`spcm.common.model.purchaseTaxLineAmount`).d('本币含税行金额'),
        dataIndex: 'purchaseTaxLineAmount',
        width: 160,
        align: 'right',
        render: (val) => renderThousandthNum(val),
      },
      {
        title: intl.get(`${commonPrompt}.executedAmount`).d('已执行金额'),
        dataIndex: 'executedAmount',
        width: 120,
        render: (val) => renderThousandthNum(val),
      },
      {
        title: intl.get(`${commonPrompt}.toExecuteAmount`).d('待执行金额'),
        dataIndex: 'toExecuteAmount',
        width: 120,
        render: (val) => renderThousandthNum(val),
      },
      {
        title: intl.get('spcm.common.model.common.subjectAcceptStatus').d('标的验收状态'),
        dataIndex: 'subjectAcceptStatus',
        width: 150,
        render: (_, record) => record.subAcceptStatusMeaning && record.subAcceptStatusMeaning,
      },
      {
        title: intl.get('spcm.common.model.common.contractAccept').d('协议验收'),
        dataIndex: 'acceptListNum',
        width: 150,
        render: (_, record) => (
          <TargetModal
            record={record}
            isLink
            detailFlag={1}
            disabled={record.acceptType === 'none' || record.acceptType === 'stage'}
          >
            {intl.get('spcm.common.model.common.contractAccept').d('协议验收')}
          </TargetModal>
        ),
      },
      {
        title: intl.get(`${commonPrompt}.taxType`).d('税种'),
        dataIndex: 'taxId',
        width: 120,
        render: (_, record) => record.taxCode,
      },
      {
        title: intl.get(`spcm.common.model.common.taxNum`).d('税率'),
        dataIndex: 'taxRate',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.model.common.globalFlag`).d('是否全局协议'),
        dataIndex: 'globalFlag',
        width: 150,
        render: yesOrNoRender,
      },
      // {
      //   title: intl.get('spcm.common.view.message.title.contractStage').d('协议阶段'),
      //   dataIndex: 'contractStage',
      //   width: 100,
      //   render: (_, record) => (
      //     <a onClick={() => onControlStageModal(record.pcHeaderId)}>
      //       {intl.get('spcm.common.view.message.title.contractStage').d('协议阶段')}
      //     </a>
      //   ),
      // },
      {
        title: intl.get(`spcm.common.model.agreementSource`).d('协议来源'),
        dataIndex: 'pcSourceCode',
        width: 100,
        render: (_, record) => record.pcSourceCodeMeaning,
      },
      {
        title: intl.get(`${commonPrompt}.sourceCode`).d('来源单据编号'),
        dataIndex: 'sourceCode',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.sourceLineNum`).d('来源单据行号'),
        dataIndex: 'sourceLineNum',
        width: 120,
        render: (value, record) =>
          record.pcSourceCode === 'PURCHASE_NEED' ? record.sourceDisplayLineNum : value,
      },
      ['1', 1].includes(relationDoc?.displayDoc) && {
        title: intl.get('spcm.common.view.message.title.executiveDocument').d('执行单据'),
        dataIndex: 'executiveDocument',
        width: 100,
        render: (_, record) => (
          <a onClick={() => onControlDocumentModal(record.pcSubjectId)}>
            {intl.get('spcm.common.view.message.title.executiveDocument').d('执行单据')}
          </a>
        ),
      },
      {
        title: intl.get(`${commonPrompt}.pcTemplateId`).d('协议模板'),
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
        title: intl.get(`hzero.common.date.creation`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.common.model.mainAgreementCode`).d('主协议编码'),
        dataIndex: 'mainContractId',
        width: 100,
        render: (_, record) => record.mainPcNum,
      },
      {
        title: intl.get(`spcm.common.model.priceSyncStatus`).d('价格库同步状态'),
        dataIndex: 'priceSyncStatus',
        width: 150,
        render: (_, record) => record.priceSyncStatusMeaning,
      },
      {
        title: intl.get(`spcm.common.model.priceSyncMessage`).d('价格库同步失败原因'),
        dataIndex: 'priceSyncMessage',
        width: 200,
      },
      {
        title: intl.get(`spcm.common.archiveCode`).d('归档码'),
        dataIndex: 'archiveCode',
        width: 100,
      },
      {
        title: intl.get(`spcm.common.releaseDate`).d('发布时间'),
        dataIndex: 'releaseDate',
        width: 100,
      },
      ['1', 1].includes(relationDoc?.displayDocFlow) && {
        title: intl.get(`spcm.common.documentFlow`).d('单据流'),
        dataIndex: 'documentFlow',
        width: 100,
        render: (_, record) => {
          return (
            <DocFlow tableName="spcm_pc_subject" tablePk={record.pcSubjectId} buttonType="button" />
          );
        },
      },
      {
        title: intl.get(`spcm.common.attachmentUuid`).d('归档文件'),
        dataIndex: 'archiveAttachmentUuid',
        width: 100,
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
          ['1', '2'].includes(record.budgetType) && (
            <BudgetModal
              documentType="PC"
              docLineId={record.budgetType === '1' ? record.pcSubjectId : record.pcHeaderId}
            />
          ),
      },
      {
        title: intl.get('spcm.common.model.common.occupyRecords').d('订单金额占用记录'),
        dataIndex: 'occupyRecords',
        width: 120,
        render: (_, record) => {
          const newRecord = new Record(record);
          return record.amountControlDimension === 'LINE' ? (
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
             && Number(record.electricSignFlag) === 1 &&
            (
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
        ],
      },
    ].filter(Boolean);
    return remote
      ? remote.process('SPCM_PUR_CONTRACT_VIEW_LIST_DETAILCOLUMNS', columnArray, {
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
      onDetailSelectChange = (e) => e,
      customizeTable,
      // selectedRowKeys = [],
    } = this.props;
    const selectedRowKeys = selectedRows.map((item) => item.pcSubjectId);
    const columns = this.getColumns();
    const rowSelection = {
      selectedRowKeys,
      onChange: onDetailSelectChange,
    };
    const scrollX = tableScrollWidth(columns, 100);
    const tableProps = {
      loading,
      columns,
      dataSource,
      rowSelection,
      bordered: true,
      rowKey: 'pcSubjectId',
      onChange: (page) => onSearch(page),
      pagination,
      scroll: { x: scrollX, y: 'calc(100vh - 400px)' },
    };

    return customizeTable(
      {
        code: 'SPCM.PURCHASE_CONTRACT_VIEW.DETAIL_LIST',
      },
      <EditTable {...tableProps} />
    );
  }
}
