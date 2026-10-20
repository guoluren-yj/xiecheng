import React from 'react';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import uuidv4 from 'uuid/v4';
import {
  getEditTableData,
  getCurrentOrganizationId,
  addItemToPagination,
  delItemToPagination,
} from 'utils/utils';
import Checkbox from 'components/Checkbox';
import notification from 'utils/notification';
import { Form, Button, Input, Modal, Popover } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { yesOrNoRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
import Upload from 'srm-front-boot/lib/components/Upload';
import { PRIVATE_BUCKET } from '_utils/config';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';

import styles from './index.less';

const organizationId = getCurrentOrganizationId();

@Form.create({ fieldNameProp: null })
class CreateTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * 删除
   */
  @Bind()
  handleRowDelete(record = {}) {
    const {
      dispatch,
      deleteRowsLoading,
      questionRowsList,
      questionRowsPagination,
      modelName = 'inquiryHall',
    } = this.props;
    const onOk = () => {
      // 存储新建行
      const arrCreateRow = [];
      // 存储已有行
      const arrRow = [];
      let newRowsList = [];
      if (record._status === 'create') {
        arrCreateRow.push(record);
      } else {
        arrRow.push(record);
      }
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
          type: `${modelName}/updateState`,
          payload: {
            questionRowsList: newRowsList,
          },
        });
      }
      if (!isEmpty(arrRow)) {
        dispatch({
          type: `${modelName}/deleteQuestionRows`,
          payload: {
            clarifyIssues: arrRow.map((item) => item.clarifyIssueId),
            questionRowsPagination: delItemToPagination(
              questionRowsPagination.length,
              questionRowsPagination
            ),
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
              type: `${modelName}/updateState`,
              payload: {
                questionRowsList: RowsList,
              },
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
    const {
      dispatch,
      questionRowsList,
      questionRowsPagination,
      modelName = 'inquiryHall',
    } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        questionRowsList: [
          {
            _status: 'create',
            leaderAttachmentUuid: null,
            clarifyIssueId: uuidv4(),
            referenceFlag: 1,
            editStatus: 1,
            issueFrom: 'LEADER',
          },
          ...questionRowsList,
        ],
        questionRowsPagination: addItemToPagination(
          questionRowsList.length,
          questionRowsPagination
        ),
      },
    });
  }

  /**
   * 行编辑/取消
   */
  @Bind()
  handleRowEdit(record, flag) {
    const { questionRowsList = [], dispatch, modelName = 'inquiryHall' } = this.props;
    const newQuestionRowsList = questionRowsList.map((item) => {
      const { ...newItem } = item;
      if (item.clarifyIssueId === record.clarifyIssueId) {
        return { ...newItem, editStatus: flag ? 1 : 0 };
      } else {
        return newItem;
      }
    });
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        questionRowsList: newQuestionRowsList,
      },
    });
  }

  @Bind()
  onRow(record) {
    this.setState({
      clarifyIssueId: record.clarifyIssueId,
    });
  }

  /**
   * 保存Uuid
   */
  @Bind()
  afterOpenUploadModal(leaderAttachmentUuid) {
    this.setState({
      leaderAttachmentUuid,
    });
  }

  /**
   * 对应行数据关联附件Uuid
   */
  @Bind()
  uploadSuccess() {
    const { dispatch, questionRowsList = [], modelName = 'inquiryHall' } = this.props;
    const { clarifyIssueId, leaderAttachmentUuid } = this.state;
    let priceInfo = null;
    questionRowsList.forEach((item, index) => {
      if (item.clarifyIssueId === clarifyIssueId) {
        priceInfo = index;
      }
    });
    // const index = questionRowsList.findIndex(item => item[clarifyIssueId] === clarifyIssueId);
    const newDataSourceList = [
      ...questionRowsList.slice(0, priceInfo),
      {
        ...questionRowsList[priceInfo],
        leaderAttachmentUuid,
      },
      ...questionRowsList.slice(priceInfo + 1),
    ];
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        questionRowsList: newDataSourceList,
      },
    });
  }

  /**
   * 物品明细-保存
   */
  @Bind(500)
  handleRowSave() {
    const {
      routerParam,
      dispatch,
      fetchMyQuestion,
      modelName = 'inquiryHall',
      inquiryHall: { questionRowsList = [], questionRowsPagination = {} },
    } = this.props;
    // const createItemLine = itemLine && itemLine.filter(item => item._status === 'create');
    const newParams = getEditTableData(questionRowsList, ['clarifyIssueId']);
    const newList = newParams.filter((item) => item.referenceFlag === 1);
    if (!isEmpty(newParams)) {
      if (isEmpty(newList)) {
        return notification.warning({
          message: intl
            .get(`ssrc.inquiryHall.model.inquiryHall.notNllcontent`)
            .d('引用问题至少一个!'),
        });
      }
      const clarifyIssues = newParams.map((item) => {
        return {
          ...item,
          clarifyNotifyId: routerParam.clarifyNotifyId,
        };
      });
      dispatch({
        type: `${modelName}/saveQuestRowLine`,
        payload: {
          sourceFrom: routerParam.sourceFrom,
          issueFrom: 'LEADER',
          clarifyIssues,
          sourceHeaderId: routerParam.sourceHeaderId,
          quotationHeaderId: routerParam.quotationHeaderId,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          fetchMyQuestion(questionRowsPagination);
        }
      });
    }
  }

  render() {
    const {
      loading,
      questionRowsList = [],
      questionRowsPagination = {},
      fetchMyQuestion,
      saveQuestRowLineLoading,
    } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.Referenced`).d('是否引用'),
        dataIndex: 'referenceFlag',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('referenceFlag', {
                initialValue: val,
              })(<Checkbox checkedValue={1} unCheckedValue={0} />)}
            </Form.Item>
          ) : (
            <span>{yesOrNoRender(val)}</span>
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.requestionDescription`).d('问题描述'),
        dataIndex: 'leaderDescription',
        width: 600,
        render: (_, record) =>
          ['create', 'update'].includes(record._status) && record.editStatus === 1 ? (
            <Form.Item>
              {record.$form.getFieldDecorator('leaderDescription', {
                initialValue: record.leaderDescription || record.description,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.requestionDescription`)
                        .d('问题描述'),
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
            <Popover content={record.leaderDescription || record.description}>
              {record.leaderDescription || record.description}
            </Popover>
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.submitName`).d('提交人'),
        dataIndex: 'askedByName',
        render: (val) => (val ? <Popover content={val}>{val}</Popover> : { val }),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.operations`).d('操作'),
        dataIndex: 'leaderAttachmentUuid' || 'attachmentUuid',
        width: 230,
        render: (val, record) => {
          return (
            <React.Fragment>
              {record.editStatus === 1 && !(record._status === 'create') && (
                <a onClick={() => this.handleRowEdit(record, false)} style={{ marginRight: 16 }}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </a>
              )}
              {record.editStatus === 0 && !(record._status === 'create') && (
                <a onClick={() => this.handleRowEdit(record, true)} style={{ marginRight: 16 }}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              )}
              {record.issueFrom === 'LEADER' && (
                <Upload
                  filePreview
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-quotationheader"
                  attachmentUUID={record.leaderAttachmentUuid}
                  tenantId={organizationId}
                  afterOpenUploadModal={this.afterOpenUploadModal}
                  uploadSuccess={this.uploadSuccess}
                  fileSize={FIlESIZE}
                  {...ChunkUploadProps}
                />
              )}
              {record.issueFrom === 'EXPERT' && (
                <Upload
                  filePreview
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-quotationheader"
                  attachmentUUID={record.attachmentUuid}
                  tenantId={organizationId}
                  icon="download"
                  viewOnly
                />
              )}
              {record.issueFrom === 'LEADER' && (
                <a
                  onClick={() => this.handleRowDelete(record)}
                  style={{ margin: '0 16px', float: 'right' }}
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </a>
              )}
            </React.Fragment>
          );
        },
      },
    ];
    return (
      <React.Fragment>
        <div className={styles['my-question-btn']}>
          <Button onClick={this.handleRowSave} loading={saveQuestRowLineLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button type="primary" onClick={this.handleRowCreate} style={{ marginLeft: '8px' }}>
            {intl.get('hzero.common.button.add').d('新增')}
          </Button>
        </div>
        <EditTable
          bordered
          rowKey="clarifyIssueId"
          loading={loading}
          columns={columns}
          pagination={questionRowsPagination}
          dataSource={questionRowsList}
          onChange={fetchMyQuestion}
          onRow={(record) => {
            return {
              onClick: () => this.onRow(record),
            };
          }}
        />
      </React.Fragment>
    );
  }
}

export default CreateTable;
