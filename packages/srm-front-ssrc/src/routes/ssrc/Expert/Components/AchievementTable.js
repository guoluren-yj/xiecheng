/**
 * AchievementTable - 专业成果
 * @date: 2019-01-21
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import { Form, Button, Input } from 'hzero-ui';
import { isEmpty, noop } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import Upload from 'srm-front-boot/lib/components/Upload';
import EditTable from 'components/EditTable';
import { PRIVATE_BUCKET } from '_utils/config';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import styles from './index.less';

const promptCode = 'ssrc.expert';

/**
 * 专业成果
 * @extends {Component} - PureComponent
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */
class AchievementTable extends PureComponent {
  constructor(props) {
    super(props);
    const { isReq = true, expertReqId, expertId } = props;
    const dataListName = isReq ? 'achievementReqList' : 'achievementList';
    const rowKey = isReq ? 'expertAchvReqId' : 'expertAchievementId';
    const rowKeyValue = isReq ? expertReqId : expertId;
    this.state = {
      selectedRows: [],
      rowKey,
      rowKeyValue,
      dataListName,
      tenantId: getCurrentOrganizationId(),
    };
  }

  /**
   * 保存选中的行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows 行数据
   */
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   * 新建行
   */
  @Bind()
  createRow() {
    const { modelName = 'expert' } = this.props;
    const { dispatch, [modelName]: expert = {} } = this.props;
    const { rowKey, dataListName, tenantId, rowKeyValue } = this.state;
    dispatch({
      type: `${modelName}/queryUUID`,
      payload: { tenantId },
    }).then((res) => {
      if (res) {
        dispatch({
          type: `${modelName}/updateState`,
          payload: {
            [rowKeyValue]: {
              ...expert[rowKeyValue],
              [dataListName]: [
                {
                  [rowKey]: uuidv4(),
                  tenantId,
                  achvAttachmentUuid: res.content,
                  _status: 'create', // 新建标记位
                },
                ...expert[rowKeyValue][dataListName],
              ],
            },
          },
        });
      }
    });
  }

  /**
   * 删除新建行
   */
  @Bind()
  deleteRow(record) {
    const { modelName = 'expert' } = this.props;
    const { dispatch, [modelName]: expert = {} } = this.props;
    const { rowKey, dataListName, rowKeyValue } = this.state;
    const newDataList = expert[rowKeyValue][dataListName].filter(
      (item) => item[rowKey] !== record[rowKey]
    );
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        [rowKeyValue]: {
          ...expert[rowKeyValue],
          [dataListName]: newDataList,
        },
      },
    });
  }

  /**
   * 取消编辑行
   */
  @Bind()
  cancelRow(record) {
    const { modelName = 'expert' } = this.props;
    const { dispatch, [modelName]: expert = {} } = this.props;
    const { rowKey, dataListName, rowKeyValue } = this.state;
    const newDataList = expert[rowKeyValue][dataListName].map((item) => {
      if (item[rowKey] === record[rowKey]) {
        const { _status, ...other } = item;
        return other;
      } else {
        return item;
      }
    });
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        [rowKeyValue]: {
          ...expert[rowKeyValue],
          [dataListName]: newDataList,
        },
      },
    });
  }

  /**
   * 编辑行
   */
  @Bind()
  editRow(record) {
    const { modelName = 'expert' } = this.props;
    const { dispatch, [modelName]: expert = {} } = this.props;
    const { rowKey, dataListName, rowKeyValue } = this.state;
    const newDataList = expert[rowKeyValue][dataListName].map((item) =>
      record[rowKey] === item[rowKey] ? { ...item, _status: 'update' } : item
    );
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        [rowKeyValue]: {
          ...expert[rowKeyValue],
          [dataListName]: newDataList,
        },
      },
    });
  }

  /**
   * 删除数据
   */
  @Bind()
  handleDelete() {
    const { dispatch, onReload, isReq = true, modelName = 'expert' } = this.props;
    const { selectedRows, rowKey } = this.state;
    const idList = selectedRows.map((o) => o[rowKey]);
    dispatch({
      type: `${modelName}/tableDelete`,
      payload: {
        isReq,
        idList,
        functionName: 'achievement',
      },
    }).then((res) => {
      if (res) {
        onReload();
        notification.success();
        this.setState({ selectedRows: [] });
      }
    });
  }

  /**
   * 如果没有 Uuid，保存查出的Uuid
   * @param {String} attUuid
   * @param {Object} record 行数据
   */
  // @Bind()
  // saveUuid(attUuid, record) {
  //   const { rowKey, dataListName } = this.state;
  //   const { dispatch, expert = {} } = this.props;
  //   if (!record.achvAttachmentUuid) {
  //     const newDataList = expert[dataListName].map(
  //       item =>
  //         record[rowKey] === item[rowKey]
  //           ? { ...item, achvAttachmentUuid: attUuid, _status: 'update' }
  //           : item
  //     );
  //     dispatch({
  //       type: 'expert/updateState',
  //       payload: { [dataListName]: newDataList },
  //     });
  //   }
  // }

  render() {
    const { modelName = 'expert', customizeTable = noop, achievemenTableCode = '' } = this.props;
    const { deleting, isEdit = true, [modelName]: expert = {} } = this.props;
    const { selectedRows, rowKey, dataListName, tenantId, rowKeyValue } = this.state;
    const dataListIdMap = expert[rowKeyValue] || {};
    const dataList = dataListIdMap[dataListName] || [];
    const columns = [
      {
        title: intl
          .get(`${promptCode}.model.expert.achvRemark`)
          .d('专业成果（包含但不限于专业奖项，专业论文，专业著作，理论，案例）'),
        dataIndex: 'achvRemark',
        width: 500,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('achvRemark', {
                  initialValue: record.achvRemark,
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('hzero.common.upload.modal.title').d('附件'),
        dataIndex: 'achvAttachmentUuid',
        width: 100,
        render: (val) => (
          <Upload
            filePreview
            icon=""
            viewOnly={!isEdit}
            tenantId={tenantId}
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="srm-source"
            attachmentUUID={val}
            fileSize={FIlESIZE}
            {...ChunkUploadProps}
            // afterOpenUploadModal={attUuid => this.saveUuid(attUuid, record)}
          />
        ),
      },
    ];
    if (isEdit) {
      columns.push({
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'edit',
        width: 75,
        render: (_, record) => (
          <span className="action-link">
            {record._status === 'create' ? (
              <a
                onClick={() => {
                  this.deleteRow(record);
                }}
              >
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            ) : record._status === 'update' ? (
              <a
                onClick={() => {
                  this.cancelRow(record);
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            ) : (
              <a
                onClick={() => {
                  this.editRow(record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </span>
        ),
      });
    }
    const rowSelection = {
      onChange: this.onSelectChange,
      getCheckboxProps: (record) => ({
        disabled: record._status === 'create',
      }),
    };
    return (
      <React.Fragment>
        {isEdit && (
          <div className={styles['item-list-search']}>
            <Form layout="inline">
              <Button
                type="primary"
                icon="plus"
                style={{ marginRight: 8 }}
                onClick={this.createRow}
              >
                {intl.get(`${promptCode}.view.message.toolTip.achievement.create`).d('新建成果')}
              </Button>
              <Button
                icon="delete"
                loading={deleting}
                style={{ marginRight: 8 }}
                disabled={isEmpty(selectedRows)}
                onClick={this.handleDelete}
              >
                {intl.get(`${promptCode}.view.message.toolTip.achievement.delete`).d('删除成果')}
              </Button>
            </Form>
          </div>
        )}

        {customizeTable(
          {
            code: achievemenTableCode,
          },
          <EditTable
            bordered
            rowKey={rowKey}
            dataSource={dataList}
            columns={columns}
            pagination={false}
            rowSelection={isEdit ? rowSelection : null}
          />
        )}
      </React.Fragment>
    );
  }
}

const HOCComponent = (Comp) => {
  return connect(({ expert, loading }) => ({
    expert,
    modelName: 'expert',
    deleting: loading.effects['expert/tableDelete'],
  }))(Comp);
};

export default HOCComponent(AchievementTable);

export { HOCComponent, AchievementTable };
