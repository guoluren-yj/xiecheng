/*
 * @Descripttion: xxxx管理信息--Index
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2023-09-06 15:51:52
 * @LastEditors: yiping.liu
 */
import React, { Component } from 'react';
import uuid from 'uuid/v4';
import { Form, Button, Spin } from 'hzero-ui';
import { noop } from 'lodash';
import { Bind } from 'lodash-decorators';

import ValueList from 'components/ValueList';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';

export default class ContentInfo extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
  }

  /**
   * 渲染操作
   * 处理状态：NEW/未审核；SUBMITTED/审核中；APPROVED/审核通过；REJECTED/审核拒绝
   */
  /**
   * 新建行 有问题
   */
  @Bind()
  handleCreateRow() {
    const { dispatch, contentTable } = this.props;
    dispatch({
      type: 'scoreRptTemplate/updateState',
      payload: {
        contentTable: [
          {
            _status: 'create',
            scoreRptTemplateLineId: uuid(),
          },
          ...contentTable,
        ],
      },
    });
  }

  /**
   * 清除新建行
   * @param {Object} record
   * @memberof StoreRoom
   */
  // @Bind()
  // cancelRow(record) {
  //   const { dispatch, contentTable } = this.props;
  //   const newContentTable = contentTable.filter(
  //     (item) => item.scoreRptTemplateLineId !== record.scoreRptTemplateLineId
  //   );
  //   dispatch({
  //     type: 'scoreRptTemplate/updateState',
  //     payload: {
  //       contentTable: newContentTable,
  //     },
  //   });
  // }

  render() {
    const {
      viewOnly = false,
      contentTable = [],
      viewRow = noop,
      fetchLineLoading = false,
      deleteLineLoading = false,
      showUploadModal = noop,
      deleteTemplateLine = noop,
    } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.scoreRptTemplate.model.scoreRptTemplate.lang`).d('语言'),
        dataIndex: 'lang',
        width: 300,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !viewOnly ? (
            <Form.Item>
              {record.$form.getFieldDecorator('lang', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.scoreRptTemplate.model.scoreRptTemplate.lang`).d('语言'),
                    }),
                  },
                ],
              })(
                <ValueList
                  lovCode="HPFM.LANGUAGE_LIST_TENANT"
                  lazyLoad={false}
                  style={{ width: '100%' }}
                  allowClear
                />
              )}
            </Form.Item>
          ) : (
            record.langMeaning
          ),
      },
      {
        title: intl.get(`hzero.common.creationDate`).d('创建时间'),
        dataIndex: 'creationDate',
      },
      // {
      //   title: intl.get(`hzero.common.status.isEnable`).d('是否启用'),
      //   dataIndex: 'enabledFlag',
      //   render: (_, record) => record.enabledFlagMeaning,
      // },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'edit',
        width: 300,
        render: (_, record) => (
          <span className="action-link">
            {!viewOnly ? (
              <a onClick={() => showUploadModal(record)} disabled={record.templateFileUrl}>
                {intl.get(`ssrc.scoreRptTemplate.model.scoreRptTemplate.upload`).d('上传文档')}
              </a>
            ) : null}
            <a onClick={() => viewRow(record)} disabled={record._status === 'create'}>
              {intl.get('hzero.common.view.title.view').d('查看')}
            </a>
            {!viewOnly ? (
              <a onClick={() => deleteTemplateLine(record)}>
                {intl.get('hzero.common.button.detele').d('删除')}
              </a>
            ) : null}
          </span>
        ),
      },
    ];

    return (
      <React.Fragment>
        {!viewOnly && (
          <div
            className="table-list-search"
            style={{ display: 'flex', justifyContent: 'flex-start' }}
          >
            <Button onClick={this.handleCreateRow} icon="plus" type="link">
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          </div>
        )}
        <Spin spinning={fetchLineLoading || deleteLineLoading}>
          <EditTable
            bordered
            rowKey="scoreRptTemplateLineId"
            dataSource={contentTable}
            columns={columns}
            pagination={false}
            rowSelection={null}
          />
        </Spin>
      </React.Fragment>
    );
  }
}
