/**
 * CreateTable - 我的问题table
 * @date: 2019-6-14
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React from 'react';
import { connect } from 'dva';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import uuidv4 from 'uuid/v4';

import { valueMapMeaning } from 'utils/renderer';
import notification from 'utils/notification';
import { getCurrentOrganizationId, tableScrollWidth } from 'utils/utils';
import { Form, Button, Select, Input, Modal, Popover } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import EditTable from 'components/EditTable';
import { getActiveTabKey } from 'utils/menuTab';
import { Button as B } from 'components/Permission';
import Upload from 'srm-front-boot/lib/components/Upload';
import { PRIVATE_BUCKET } from '_utils/config';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import styles from './index.less';

const organizationId = getCurrentOrganizationId();

const { Option } = Select;

const promptCode = 'ssrc.supplierQuotation';

@Form.create({ fieldNameProp: null })
@connect(({ supplierQuotation, loading }) => ({
  supplierQuotation,
  code: supplierQuotation.code,
  loading: loading.effects['supplierQuotation/fetchQuestionRows'],
  questionRowsList: supplierQuotation.questionRowsList,
  questionRowsPagination: supplierQuotation.questionRowsPagination,
  deleteRowsLoading: loading.effects['supplierQuotation/deleteQuestionRows'],
}))
export default class CreateTable extends React.Component {
  constructor(props) {
    super(props);
    this.rowKey = 'issueLineId';
    this.state = {
      selectedRows: [], // 存储选择行
    };
  }

  /**
   * 删除
   */
  @Bind()
  handleRowDelete() {
    const {
      dispatch,
      // questionRowsPagination,
      // fetchMyQuestion,
      deleteRowsLoading,
      questionRowsList,
    } = this.props;
    const { selectedRows = [] } = this.state;
    const onOk = () => {
      // 存储新建行
      const arrCreateRow = [];
      // 存储已有行
      const arrRow = [];
      let newRowsList = [];
      selectedRows.forEach((item) => {
        if (item._status === 'create') {
          arrCreateRow.push(item);
        } else {
          arrRow.push(item);
        }
      });
      if (!isEmpty(arrCreateRow)) {
        // 合并去重保留未勾选
        const AlList = [...arrCreateRow, ...questionRowsList];
        const SetList = new Set(AlList);
        const AList = Array.from(SetList);
        newRowsList = [
          ...AList.filter((_) => !arrCreateRow.includes(_)),
          ...AList.filter((_) => !questionRowsList.includes(_)),
        ];
        dispatch({
          type: 'supplierQuotation/updateState',
          payload: {
            questionRowsList: newRowsList,
          },
        });
        this.setState({
          selectedRows: [],
        });
      }
      if (!isEmpty(arrRow)) {
        dispatch({
          type: 'supplierQuotation/deleteQuestionRows',
          payload: {
            issueLineIds: arrRow.map((item) => item.issueLineId),
          },
        }).then((res) => {
          if (res) {
            // fetchMyQuestion(questionRowsPagination);
            const arrRowsList = isEmpty(newRowsList) ? questionRowsList : newRowsList;
            const AlList = [...arrRow, ...arrRowsList];
            const SetList = new Set(AlList);
            const AList = Array.from(SetList);
            const RowsList = [
              ...AList.filter((_) => !arrRow.includes(_)),
              ...AList.filter((_) => !arrRowsList.includes(_)),
            ];
            dispatch({
              type: 'supplierQuotation/updateState',
              payload: {
                questionRowsList: RowsList,
              },
            });
            this.setState({
              selectedRows: [],
            });
            notification.success();
          }
        });
      }
    };
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      confirmLoading: deleteRowsLoading,
      onOk,
    });
  }

  /**
   * 新增
   */
  @Bind()
  handleRowCreate() {
    const { dispatch, questionRowsList } = this.props;
    dispatch({
      type: 'supplierQuotation/updateState',
      payload: {
        questionRowsList: [
          {
            _status: 'create',
            issueLineStatus: 'NEW',
            attachmentUuid: null,
            issueLineId: uuidv4(),
          },
          ...questionRowsList,
        ],
      },
    });
  }

  /**
   * 行编辑/取消
   */
  @Bind()
  handleRowEdit(record, flag) {
    const { questionRowsList = [], dispatch } = this.props;
    const newQuestionRowsList = questionRowsList.map((item) => {
      const { ...newItem } = item;
      if (item.issueLineId === record.issueLineId) {
        if (flag) {
          return { ...newItem, _status: 'update' };
        } else {
          return { ...newItem, _status: undefined };
        }
      } else {
        return newItem;
      }
    });
    dispatch({
      type: 'supplierQuotation/updateState',
      payload: {
        questionRowsList: newQuestionRowsList,
      },
    });
  }

  /**
   * 选择/取消选择某列的回调
   */
  @Bind()
  handleSelect(_, rows) {
    this.setState({
      selectedRows: rows,
    });
  }

  @Bind()
  onRow(record) {
    this.setState({
      issueLineId: record.issueLineId,
    });
  }

  /**
   * 保存Uuid
   */
  @Bind()
  afterOpenUploadModal(attachmentUUID) {
    const { dispatch, questionRowsList = [] } = this.props;
    const { issueLineId } = this.state;

    const index = questionRowsList.findIndex((item) => item[this.rowKey] === issueLineId);
    if (index !== -1) {
      const newDataSourceList = [
        ...questionRowsList.slice(0, index),
        {
          ...questionRowsList[index],
          attachmentUuid: attachmentUUID,
        },
        ...questionRowsList.slice(index + 1),
      ];
      dispatch({
        type: 'supplierQuotation/updateState',
        payload: {
          questionRowsList: newDataSourceList,
        },
      });
    }
  }

  render() {
    const {
      loading,
      sourceFrom,
      questionRowsList = [],
      questionRowsPagination = {},
      code: { clarifyType = [] },
      fetchMyQuestion,
      customizeTable,
      issueHeaderId,
      bidFlag,
    } = this.props;
    const { selectedRows } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRows.map((n) => n.issueLineId),
      onChange: this.handleSelect,
    };
    const columns = [
      {
        title: intl.get(`${promptCode}.model.supQuo.lineNo`).d('行号'),
        dataIndex: 'lineNum',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.supQuo.questionType`).d('澄清类型'),
        dataIndex: 'clarifyType',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('clarifyType', {
                initialValue: record.clarifyType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.supQuo.clarifyType`).d('澄清类型'),
                    }),
                  },
                ],
              })(
                <Select allowClear style={{ width: '100%' }}>
                  {clarifyType &&
                    clarifyType.map((item) => (
                      <Option key={item.meaning} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </Form.Item>
          ) : (
            valueMapMeaning(clarifyType, val)
          ),
      },
      {
        title: intl.get(`${promptCode}.model.supQuo.description`).d('描述'),
        dataIndex: 'description',
        width: 800,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('description', {
                initialValue: record.description,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.supQuo.description`).d('描述'),
                    }),
                  },
                  {
                    max: 480,
                    message: intl.get('hzero.common.validation.max', { max: 480 }),
                  },
                ],
              })(<Input style={{ width: '100%' }} />)}
            </Form.Item>
          ) : (
            <Popover
              overlayStyle={{ maxWidth: 600 }}
              placement="topLeft"
              content={record.description}
            >
              {record.description || ""}
            </Popover>
          ),
      },
      {
        title: intl.get(`${promptCode}.model.supQuo.operation`).d('操作'),
        dataIndex: 'attachmentUuid',
        // width: 240,
        render: (val, record) => {
          return (
            <React.Fragment>
              {record._status === 'update' && (
                <a onClick={() => this.handleRowEdit(record, false)} style={{ marginRight: 16 }}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </a>
              )}
              {!(record._status === 'create') && !(record._status === 'update') && (
                <a onClick={() => this.handleRowEdit(record, true)} style={{ marginRight: 16 }}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              )}
              <B
                type="text"
                permissionList={[
                  {
                    code: bidFlag
                      ? 'srm.ssrc.source.manage.tenderer.inquiry-hall.ps.button.upload'
                      : `srm.ssrc.source.manage.quoter.supplier-${
                          getActiveTabKey().indexOf('-reply') > -1 ? 'reply' : 'quotation'
                        }.ps.button.upload`,
                  },
                ]}
              >
                <Upload
                  filePreview
                  fileSize={FIlESIZE}
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-quotationheader"
                  attachmentUUID={val}
                  tenantId={organizationId}
                  afterOpenUploadModal={this.afterOpenUploadModal}
                  {...ChunkUploadProps}
                />
              </B>
            </React.Fragment>
          );
        },
      },
    ];

    const tableColumns = sourceFrom === 'RFX'
      ? columns
      : columns.filter((ele) => ele.dataIndex !== 'clarifyType');

    const scrollX = tableScrollWidth(tableColumns, 260);

    return (
      <React.Fragment>
        <div className={styles['my-question-btn']}>
          <Button
            onClick={this.handleRowDelete}
            disabled={isEmpty(selectedRows)}
            style={{ marginRight: 8 }}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <Button type="primary" onClick={this.handleRowCreate}>
            {intl.get('hzero.common.button.add').d('新增')}
          </Button>
        </div>
        {customizeTable(
          {
            code: `SSRC.${bidFlag ? 'BID_' : ''}SUPPLIER_CLARIFICATION.CREATE_QUESTION`,
            // cacheKey: supplierCompanyId,
          },
          <EditTable
            bordered
            rowKey="issueLineId"
            loading={loading}
            columns={tableColumns}
            pagination={!issueHeaderId ? false : questionRowsPagination}
            dataSource={questionRowsList}
            rowSelection={rowSelection}
            onChange={fetchMyQuestion}
            onRow={(record) => {
              return {
                onClick: () => this.onRow(record),
              };
            }}
            scroll={{ x: scrollX }}
          />
        )}
      </React.Fragment>
    );
  }
}
