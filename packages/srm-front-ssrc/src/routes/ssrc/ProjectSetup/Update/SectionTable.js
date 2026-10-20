/**
 * routes 寻源立项-维护 分标段/包
 * @date: 2020-12-29
 * @author: <xiaomin.wang01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent } from 'react';
import { isFunction, noop } from 'lodash';
import { Form, Button, Table, Input } from 'hzero-ui';
import { Attachment } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { tableScrollWidth } from 'utils/utils';
import Upload from 'srm-front-boot/lib/components/Upload';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import { PRIVATE_BUCKET } from '_utils/config';
import { TooltipButton } from '@/routes/components/TooltipButton';

export default class SectionTable extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    if (isFunction(onRef)) {
      onRef(this);
    }
    this.state = {};
  }

  // 渲染明细页表单
  renderDetailTableColumns() {
    const { organizationId, openAddMaterial } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        dataIndex: 'sectionNum',
        width: 80,
      },
      {
        title: intl.get(`ssrc.projectSetup.model.projectSetup.sectionNum`).d('标段/包编号'),
        dataIndex: 'sectionCode',
        width: 120,
      },
      {
        title: intl.get(`ssrc.projectSetup.model.projectSetup.sectionName`).d('标段/包名称'),
        dataIndex: 'sectionName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.projectSetup.model.projectSetup.addMaterial`).d('添加物料'),
        dataIndex: 'addMaterial',
        width: 120,
        render: (_, record) =>
          record.projectItemCount !== 0 ? (
            <a onClick={() => openAddMaterial(record)}>
              {intl.get(`ssrc.projectSetup.model.projectSetup.viewMaterial`).d('查看物料')}(
              {record.projectItemCount})
            </a>
          ) : (
            <a onClick={() => openAddMaterial(record)}>
              {intl.get(`ssrc.projectSetup.model.projectSetup.viewMaterial`).d('查看物料')}
            </a>
          ),
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'sectionRemark',
        width: 200,
      },
      {
        title: (
          <span>
            {intl.get(`ssrc.projectSetup.model.projectSetup.sectionAttachmentUuid`).d('附件')}
          </span>
        ),
        dataIndex: 'sectionAttachmentUuid',
        width: 120,
        render: (val) => (
          <Attachment
            readOnly
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rfx-rfxitem"
            viewMode="popup"
            value={val}
            data={{
              tenantId: organizationId,
            }}
          />
        ),
      },
    ];
    return columns;
  }

  // 渲染维护表单
  renderEditTableColumns() {
    const { organizationId, openAddMaterial } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        dataIndex: 'sectionNum',
        width: 80,
      },
      {
        title: intl.get(`ssrc.projectSetup.model.projectSetup.sectionNum`).d('标段/包编号'),
        dataIndex: 'sectionCode',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('sectionCode', {
                initialValue: record.sectionCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.projectSetup.model.projectSetup.sectionNum`)
                        .d('标段/包编号'),
                    }),
                  },
                ],
              })(<Input inputChinese={false} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.projectSetup.model.projectSetup.sectionName`).d('标段/包名称'),
        dataIndex: 'sectionName',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('sectionName', {
                initialValue: record.sectionName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.projectSetup.model.projectSetup.sectionName`)
                        .d('标段/包名称'),
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.projectSetup.model.projectSetup.addMaterial`).d('添加物料'),
        dataIndex: 'addMaterial',
        width: 120,
        render: (val, record) =>
          record._status !== 'create' ? (
            record.projectItemCount !== 0 ? (
              <a onClick={() => openAddMaterial(record)}>
                {intl.get(`ssrc.projectSetup.model.projectSetup.addMaterial`).d('查看物料')}(
                {record.projectItemCount})
              </a>
            ) : (
              <a onClick={() => openAddMaterial(record)}>
                {intl.get(`ssrc.projectSetup.model.projectSetup.addMaterial`).d('添加物料')}
              </a>
            )
          ) : null,
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'sectionRemark',
        width: 200,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('sectionRemark', {
                initialValue: record.sectionRemark,
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: (
          <span>
            {intl.get(`ssrc.projectSetup.model.projectSetup.sectionAttachmentUuid`).d('附件')}
          </span>
        ),
        dataIndex: 'sectionAttachmentUuid',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('sectionAttachmentUuid', {
                initialValue: val,
              })(
                <Upload
                  filePreview
                  fileSize={FIlESIZE}
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-rfxitem"
                  attachmentUUID={val}
                  tenantId={organizationId}
                  {...ChunkUploadProps}
                />
              )}
            </Form.Item>
          ) : null,
      },
    ];
    return columns;
  }

  render() {
    const {
      loading,
      saveLoading,
      detailFlag = false, // 是否是明细页表单
      dataSource = [],
      pagination = {},
      onSearch,
      onCreateLine,
      onSaveLine,
      onDeleteLines,
      sectionRowSelection,
      deleteLoading,
      sectionSelectedRowKeys = [],
      customizeTable = noop,
    } = this.props;

    const columns = detailFlag ? this.renderDetailTableColumns() : this.renderEditTableColumns();
    const scrollX = tableScrollWidth(columns || []);

    const CommonProps = {
      bordered: true,
      rowKey: 'projectLineSectionId',
      loading,
      columns,
      scroll: { x: scrollX, y: 480 },
      dataSource,
      pagination,
      onChange: (page) => onSearch(page),
    };
    if (detailFlag) {
      return customizeTable(
        {
          code: 'SSRC.PROJECT_SETUP_DETAIL.LINE_SECTION',
        },
        <Table {...CommonProps} />
      );
    } else {
      return (
        <React.Fragment>
          <div style={{ display: 'flex', flexDirection: 'row-reverse', marginBottom: '16px' }}>
            <Form layout="inline">
              <TooltipButton
                help={intl
                  .get('ssrc.common.view.message.section-line.select.tip')
                  .d('请先勾选标段/包行')}
                onClick={onDeleteLines}
                loading={deleteLoading}
                disabled={sectionSelectedRowKeys.length === 0}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </TooltipButton>
              <TooltipButton
                onClick={onSaveLine}
                help={intl.get('ssrc.common.view.message.section.add.tip').d('请先新增标段/包行')}
                disabled={dataSource.length === 0}
                style={{ marginLeft: '8px', marginRight: '8px' }}
                loading={saveLoading}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </TooltipButton>
              <Button type="primary" onClick={onCreateLine}>
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>
            </Form>
          </div>
          {customizeTable(
            {
              code: 'SSRC.PROJECT_SETUP_EDIT.LINE_SECTION',
            },
            <EditTable
              {...CommonProps}
              scrollX={{ x: scrollX }}
              rowSelection={sectionRowSelection}
            />
          )}
        </React.Fragment>
      );
    }
  }
}
