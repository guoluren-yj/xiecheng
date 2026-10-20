import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { isEmpty, noop, compose, isArray } from 'lodash';
import { Throttle } from 'lodash-decorators';
import { Table, Lov, DataSet, Button, Attachment } from 'choerodon-ui/pro';
import { Table as H0Table } from 'hzero-ui';
// import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import Upload from 'srm-front-boot/lib/components/Upload';
import { TooltipButtonPro } from '@/routes/components/TooltipButton';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId, createPagination } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import notification from 'utils/notification';
import DynamicButtons from '_components/DynamicButtons';

import CPopover from '@/routes/components/CPopover/';

import { idValidation } from '@/routes/components/Widget/dataVerification';
import { queryFileList } from 'services/api';

import {
  fetchAttTemplateDataByAttType,
  generateAttTemplate,
  fetchAttachmentTableList,
} from '@/services/inquiryHallService';

import { fileTemplateAttachmentDS } from './storeDS';

/**
 * headerDS
 * headerData
 * editorFlag 是否可编辑
 * unitCodeSymbol string 页面标识 主要区分页面和个性化
 *
 *   老核价维护/审批-附件表格 oldUpdateOrApproval
     新核价/审批/明细 newUpdateOrApproval
     老核价明细-附件表格 checkPriceDetail
     核价概览 approvalOverView
 * */

class FileTemplateAttachmentCheckPricePage extends Component {
  constructor(props) {
    super(props);
    const { editorFlag, onRef } = this.props;
    if (onRef) {
      onRef(this);
    }

    this.organizationId = getCurrentOrganizationId();

    this.state = {
      tableData: [],
      tablePagination: {},
    };

    this.lineDS = new DataSet(
      fileTemplateAttachmentDS({
        select: editorFlag ? 'multiple' : false,
        editorFlag,
        node: this.getSourceNode(),
      })
    );
  }

  getSnapshotBeforeUpdate(prevProps = {}) {
    const { rfxHeaderId: preRfxHeaderId } = prevProps;
    const { rfxHeaderId } = this.props;
    const updateFlag = rfxHeaderId && rfxHeaderId !== preRfxHeaderId;
    return updateFlag;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.initPage();
    }
  }

  componentDidMount() {
    this.initPage();
  }

  getSourceNode = () => {
    const node = 'CHECK';

    return node;
  };

  getHeaderFieldsValue = () => {
    const { headerDS, headerData } = this.props;
    const { current } = headerDS || {};

    const { templateId } = current ? current.get(['templateId']) : headerData || {};

    const data = {
      templateId,
    };
    return data;
  };

  initPage = async (options = {}) => {
    const { rfxHeaderId, headerDS, unitCodeSymbol, hzeroFlag = 0 } = this.props;
    const { page = null } = options || {};

    idValidation(rfxHeaderId);

    if (headerDS) {
      this.lineDS.setState('headerDS', headerDS);
    }

    const commons = {
      sourceId: rfxHeaderId,
      organizationId: this.organizationId,
      sourceNode: this.getSourceNode(),
      unitCodeSymbol,
      customizeUnitCode: this.getCustomizeUnitCode(`${unitCodeSymbol}-Table`),
      tablePage: page,
      sourceCategory: 'RFX',
    };

    if (!hzeroFlag) {
      this.lineDS.setQueryParameter('commons', commons);
      this.lineDS.query();
    } else {
      let result = await fetchAttachmentTableList(commons);
      result = getResponse(result);
      if (!result) {
        return;
      }

      const { content = [] } = result || {};
      const pagination = createPagination(result);

      this.setState({
        tableData: content,
        tablePagination: pagination,
      });
    }
  };

  getAttachmentListData = () => {
    const attachmentLineList = this.lineDS.toJSONData() || [];
    return attachmentLineList;
  };

  validateAttachmentListTable = async () => {
    let attachmentTableValidate = null;
    this.lineDS.forEach((itemLine = {}) => {
      itemLine.set('status', 'update');
    });
    attachmentTableValidate = await this.lineDS.validate();

    return attachmentTableValidate;
  };

  getTableValidateErros = () => {
    const errors = this.lineDS.getAllValidationErrors() || [];
    return errors;
  };

  // change attachment type
  handleChangeAttachmentType = (value, record) => {
    const { uniqueKey, sourceNode } = value || {};

    const { templateId } = this.getHeaderFieldsValue();
    if (!templateId || !uniqueKey) {
      return;
    }

    const params = {
      sourceCategory: 'RFX',
      templateId,
      attachmentType: uniqueKey,
      organizationId: this.organizationId,
    };

    fetchAttTemplateDataByAttType(params).then((res) => {
      const result = getResponse(res);
      if (isEmpty(result)) {
        // 模板没有维护，数据为空
        record.set({
          sourceNode,
        });
        return;
      }

      const { attachmentType, ...others } = result || {}; // attachmentType 默认更新
      record.set(others);
    });
  };

  // 附件表格 字段类型个性化，表格列个性化
  getCurrentTableAndLineCustomizeUnitCode = () => {
    const { unitCodeSymbol } = this.props;

    const unitCode = this.getCustomizeUnitCode([unitCodeSymbol, `${unitCodeSymbol}-Table`]);

    return unitCode;
  };

  /**
   *
   * */
  getCustomizeUnitCode = (type = null) => {
    const { bidFlag } = this.props;

    if (!type || isEmpty(type)) {
      return null;
    }

    const RfxCodeMap = new Map([
      ['oldUpdateOrApproval', 'SSRC.INQUIRY_HALL_CHECK_PRICE.ATTACHMENT_TABLE'],
      ['newUpdateOrApproval', 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.ATTACHMENT_TABLE'],
      ['approvalOverView', 'SSRC.INQUIRY_HALL_CHECK_PRICE_OVERVIEW.ATTACHMENT_TABLE'],
      ['checkPriceDetail', 'SSRC.INQUIRY_HALL_DETAIL.CHECK_PRICE_ATTACHMENT_TABLE'],

      ['oldUpdateOrApproval-Table', 'SSRC.INQUIRY_HALL_CHECK_PRICE.ATTACHMENT_TABLE_COLUMNS'],
      ['newUpdateOrApproval-Table', 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.ATTACHMENT_TABLE_COLUMNS'],
      ['approvalOverView-Table', 'SSRC.INQUIRY_HALL_CHECK_PRICE_OVERVIEW.ATTACHMENT_TABLE_COLUMNS'],
      ['checkPriceDetail-Table', 'SSRC.INQUIRY_HALL_DETAIL.CHECK_PRICE_ATTACHMENT_TABLE_COLUMNS'],

      ['oldUpdateOrApproval-Btn', 'SSRC.INQUIRY_HALL_CHECK_PRICE.ATTACHMENT_TABLE_BUTTON_GROUP'],
      [
        'newUpdateOrApproval-Btn',
        'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.ATTACHMENT_TABLE_BUTTON_GROUP',
      ],
    ]);

    const BidCodeMap = new Map([
      ['oldUpdateOrApproval', 'SSRC.NEW_BID_HALL_CHECK_PRICE.ATTACHMENT_TABLE'],
      ['newUpdateOrApproval', 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ATTACHMENT_TABLE'],
      ['approvalOverView', 'SSRC.BID_HALL_CHECK_PRICE_OVERVIEW.ATTACHMENT_TABLE'],
      ['checkPriceDetail', 'SSRC.INQUIRY_BID_DETAIL.CHECK_PRICE_ATTACHMENT_TABLE'],

      ['oldUpdateOrApproval-Table', 'SSRC.NEW_BID_HALL_CHECK_PRICE.ATTACHMENT_TABLE_COLUMNS'],
      ['newUpdateOrApproval-Table', 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ATTACHMENT_TABLE_COLUMNS'],
      ['approvalOverView-Table', 'SSRC.BID_HALL_CHECK_PRICE_OVERVIEW.ATTACHMENT_TABLE_COLUMNS'],
      ['checkPriceDetail-Table', 'SSRC.INQUIRY_BID_DETAIL.CHECK_PRICE_ATTACHMENT_TABLE_COLUMNS'],

      ['oldUpdateOrApproval-Btn', 'SSRC.NEW_BID_HALL_CHECK_PRICE.ATTACHMENT_TABLE_BUTTON_GROUP'],
      [
        'newUpdateOrApproval-Btn',
        'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ATTACHMENT_TABLE_BUTTON_GROUP',
      ],
    ]);

    const CodeDataMap = !bidFlag ? RfxCodeMap : BidCodeMap;
    let currentUnitCode = null;

    if (typeof type === 'string') {
      currentUnitCode = CodeDataMap.get(type);
    }

    if (isArray(type)) {
      const codeSet = new Set();
      type.forEach((unitCode) => {
        const currentCode = CodeDataMap.get(unitCode);
        if (!currentCode) {
          return;
        }
        codeSet.add(currentCode);
      });

      currentUnitCode = codeSet.size ? [...codeSet].join(',') : null;
    }

    return currentUnitCode;
  };

  // 生成附件
  @Throttle(1200)
  handleGenerateAttachment = (record) => {
    const { rfxHeaderId } = this.props;
    const { fileManageId, attachmentUuid: lineUuid = null, editableFlag } =
      record.get(['fileManageId', 'attachmentUuid', 'editableFlag']) || {};

    if (!fileManageId) return;

    const params = {
      fileManageId,
      sourceCategory: 'RFX',
      sourceId: rfxHeaderId,
      ...(editableFlag === 1 ? {} : { attachmentUuid: lineUuid }), // 注意：editableFlag为1 表示寻源模板上的附件要求【限制文件不可修改】= 1
      organizationId: this.organizationId,
    };

    return generateAttTemplate(params).then((res) => {
      const result = getResponse(res);
      if (!result) {
        return;
      }
      const { attachmentUuid } = result || {};

      notification.success();
      if (!lineUuid) {
        record.set('attachmentUuid', attachmentUuid);
      } else {
        record.set('attachmentUuid', null);
        record.set('attachmentUuid', attachmentUuid);
        queryFileList({
          organizationId: this.organizationId,
          bucketName: PRIVATE_BUCKET,
          bucketDirectory: 'ssrc-template-requirement',
          attachmentUUID: attachmentUuid,
        }).then((fileList) => {
          if (getResponse(fileList)) {
            const field = record.getField('attachmentUuid');
            if (field) {
              field.setAttachmentCount(fileList?.length || 0);
            }
          }
        });
      }
    });
  };

  // table columns
  getColumns = () => {
    const { editorFlag = 0 } = this.props;

    const columns = [
      {
        name: 'attachmentType',
        width: 180,
        editor: (record) => {
          return (
            <Lov
              record={record}
              name="attachmentType"
              onChange={(value) => this.handleChangeAttachmentType(value, record)}
            />
          );
        },
      },
      {
        name: 'templateAttachment',
        width: 180,
        renderer: ({ record }) => {
          const { fileManageId, tempAttachmentUuid } =
            record.get(['fileManageId', 'tempAttachmentUuid']) || {};

          if (fileManageId) {
            if (!editorFlag) {
              return '-';
            }

            // 来自于寻源模板的招标文件管理中的
            return (
              <Button
                funcType="link"
                waitType="throttle"
                wait={1200}
                disabled={!editorFlag}
                onClick={() => this.handleGenerateAttachment(record)}
              >
                {intl
                  .get('ssrc.inquiryHall.model.fileTemplateAttachment.generateAttachment')
                  .d('生成附件')}
              </Button>
            );
          } else if (tempAttachmentUuid) {
            // 来自于寻源模板的上传本地附件
            return (
              <Attachment
                record={record}
                name="tempAttachmentUuid"
                viewMode="popup"
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="ssrc-template-requirement"
                readOnly
                funcType="link"
              >
                {intl.get('hzero.common.upload.view').d('查看附件')}
              </Attachment>
            );
          }
          return '';
        },
      },
      {
        name: 'editorOnline',
        hidden: !!editorFlag,
        width: 180,
      },
      { name: 'remark' },
      {
        name: 'attachmentUuid',
        editor: !!editorFlag,
        width: 180,
      },
    ];

    return columns;
  };

  // hzeo table column
  getH0TableColumns = () => {
    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.fileTemplateAttachment.attachType`).d('附件类型'),
        dataIndex: 'attachmentType',
        width: 180,
        render: (_, record) => {
          const { attachmentTypeMeaning = '' } = record || {};
          if (!attachmentTypeMeaning) {
            return '-';
          }
          return <CPopover content={attachmentTypeMeaning}>{attachmentTypeMeaning}</CPopover>;
        },
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.fileTemplateAttachment.attachmentTemplate`)
          .d('模板附件'),
        dataIndex: 'templateAttachment',
        width: 180,
        render: (_, record) => {
          const { tempAttachmentUuid } = record || {};

          return (
            <Upload
              filePreview
              viewOnly
              icon="download"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-template-requirement"
              attachmentUUID={tempAttachmentUuid}
              tenantId={this.organizationId}
            >
              {intl.get('hzero.common.upload.view').d('查看附件')}
            </Upload>
          );
        },
      },
      // {
      //   title: intl.get(`ssrc.common.view.editorOnline`).d('在线编辑'),
      //   dataIndex: 'editorOnline',
      //   hidden: !!editorFlag,
      //   width: 180,
      // },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.fileTemplateAttachment.describeTemplate`)
          .d('模板描述'),
        dataIndex: 'remark',
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.common.model.common.attachment`).d('附件'),
        dataIndex: 'attachmentUuid',
        width: 180,
        render: (_, record) => {
          const { attachmentUuid } = record || {};

          return (
            <Upload
              filePreview
              viewOnly
              icon="download"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-template-requirement"
              attachmentUUID={attachmentUuid}
              tenantId={this.organizationId}
            >
              {intl.get('hzero.common.upload.view').d('查看附件')}
            </Upload>
          );
        },
      },
    ];

    return columns;
  };

  // batch delete
  handleBatchDeleteAttachment = () => {
    const selectedRecords = this.lineDS?.selected || [];
    const addRecords = selectedRecords?.filter((r) => r?.status === 'add') || [];
    const oldRecords = selectedRecords?.filter((r) => r?.get('attachmentLineId')) || [];

    // 删除新增数据
    this.lineDS.remove(addRecords);

    if (!isEmpty(oldRecords)) {
      // 删除线上数据
      this.lineDS.delete(oldRecords, {
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: intl
          .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
          .d('确认删除选中行？'),
      });
    }
  };

  // 新增
  handleAdd = () => {
    this.lineDS.create({}, 0);
  };

  // 批量删除按钮、复制禁用逻辑
  batchDisabledFlag = () => {
    const { selected, status } = this.lineDS || {};

    return !selected?.length || status === 'loading';
  };

  // 表格按钮
  renderButtons = () => {
    const { customizeBtnGroup = noop, editorFlag = 0, unitCodeSymbol = '' } = this.props;

    if (editorFlag === 0 || editorFlag === false) {
      return '';
    }

    const disabled = this.batchDisabledFlag();

    const buttons = [
      {
        name: 'delete',
        btnType: 'c7n-pro',
        btnComp: TooltipButtonPro,
        child: intl.get('hzero.common.button.batchdelete').d('批量删除'),
        btnProps: {
          icon: 'delete_sweep',
          funcType: 'flat',
          waitType: 'debounce',
          wait: 500,
          onClick: this.handleBatchDeleteAttachment,
          disabled,
          help: intl.get('ssrc.common.view.message.attachment-line.select.tip').d('请先勾选附件行'),
        },
      },
      {
        name: 'add',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.add').d('新增'),
        btnProps: {
          icon: 'playlist_add',
          funcType: 'flat',
          onClick: this.handleAdd,
        },
      },
    ];
    return customizeBtnGroup(
      {
        code: this.getCustomizeUnitCode(`${unitCodeSymbol}-Btn`),
        pro: true,
      },
      <DynamicButtons buttons={buttons} />
    );
  };

  render() {
    const { unitCodeSymbol, customizeTable = () => {}, hzeroFlag = 0 } = this.props;
    const { tableData = [], tablePagination = {} } = this.state;

    let tableProps = {};

    if (hzeroFlag === 1) {
      tableProps = {
        rowKey: 'quotationLineId',
        scroll: { x: scrollX, y: 360 },
        dataSource: tableData,
        pagination: tablePagination,
        columns: this.getH0TableColumns(),
        onChange: (page) => this.initPage({ page }),
      };
    }

    const tableUnitCode = this.getCustomizeUnitCode(`${unitCodeSymbol}-Table`);

    return (
      <div style={{ marginTop: '16px' }}>
        <div style={{ marginBottom: '4px' }}>{this.renderButtons()}</div>

        {!hzeroFlag
          ? customizeTable(
              { code: tableUnitCode },
              <Table
                rowKey="attachmentLineId"
                dataSet={this.lineDS}
                columns={this.getColumns()}
                style={{ maxHeight: '500px' }}
              />
            )
          : customizeTable({ code: tableUnitCode }, <H0Table {...tableProps} />)}
      </div>
    );
  }
}

/**
 * // 表格类型
  'SSRC.INQUIRY_HALL_CHECK_PRICE.ATTACHMENT_TABLE', // 老核价维护/审批-附件表格 oldUpdateOrApproval
  'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.ATTACHMENT_TABLE', // 新核价/审批/明细 newUpdateOrApproval
  'SSRC.INQUIRY_HALL_DETAIL.CHECK_PRICE_ATTACHMENT_TABLE', // 老核价明细-附件表格 checkPriceDetail
  'SSRC.INQUIRY_HALL_CHECK_PRICE_OVERVIEW.ATTACHMENT_TABLE', // 核价概览 approvalOverView

  // 表格列
  'SSRC.INQUIRY_HALL_CHECK_PRICE.ATTACHMENT_TABLE_COLUMNS',
  'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.ATTACHMENT_TABLE_COLUMNS',
  'SSRC.INQUIRY_HALL_DETAIL.CHECK_PRICE_ATTACHMENT_TABLE_COLUMNS',
  'SSRC.INQUIRY_HALL_CHECK_PRICE_OVERVIEW.ATTACHMENT_TABLE_COLUMNS',

  // 可编辑表格-按钮组
  'SSRC.INQUIRY_HALL_CHECK_PRICE.ATTACHMENT_TABLE_BUTTON_GROUP',
  'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.ATTACHMENT_TABLE_BUTTON_GROUP',

  // bid
  'SSRC.NEW_BID_HALL_CHECK_PRICE.ATTACHMENT_TABLE',
  'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ATTACHMENT_TABLE',
  'SSRC.INQUIRY_BID_DETAIL.CHECK_PRICE_ATTACHMENT_TABLE',
  'SSRC.BID_HALL_CHECK_PRICE_OVERVIEW.ATTACHMENT_TABLE',

  'SSRC.NEW_BID_HALL_CHECK_PRICE.ATTACHMENT_TABLE_COLUMNS',
  'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ATTACHMENT_TABLE_COLUMNS',
  'SSRC.INQUIRY_BID_DETAIL.CHECK_PRICE_ATTACHMENT_TABLE_COLUMNS',
  'SSRC.BID_HALL_CHECK_PRICE_OVERVIEW.ATTACHMENT_TABLE_COLUMNS',

  'SSRC.NEW_BID_HALL_CHECK_PRICE.ATTACHMENT_TABLE_BUTTON_GROUP',
  'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ATTACHMENT_TABLE_BUTTON_GROUP',
*/

const HocComponent = (NewComponent) => {
  return compose(
    formatterCollections({
      code: [
        'ssrc.inquiryHall',
        'ssrc.supplierQuotation',
        'ssrc.common',
        'scux.ssrc',
        'sscux.ssrc',
      ],
    })
  )(observer(NewComponent));
};

export default HocComponent(FileTemplateAttachmentCheckPricePage);
