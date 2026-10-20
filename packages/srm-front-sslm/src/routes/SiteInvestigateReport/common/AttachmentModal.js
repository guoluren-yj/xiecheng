/*
 * @Date: 2021-11-17 11:20:22
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { connect } from 'dva';
import Bind from 'lodash-decorators/bind';
import { isEmpty } from 'lodash';
import React, { Component } from 'react';

import uuidv4 from 'uuid/v4';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentUser, createPagination, addItemsToPagination } from 'utils/utils';

import H0UploadList from '../../components/H0UploadList';

const { id, loginName, realName } = getCurrentUser();
const rowKey = 'attachmentLineId';

@formatterCollections({ code: ['sslm.common'] })
@connect(({ siteInvestigateReport, loading }) => ({
  siteInvestigateReport,
  allLoading:
    loading.effects['siteInvestigateReport/queryGradeAttachment'] ||
    loading.effects['siteInvestigateReport/saveGradeAttachment'] ||
    loading.effects['siteInvestigateReport/deleteGradeAttachment'],
}))
export default class AttachmentModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      pagination: {},
    };
  }

  componentDidMount() {
    this.queryGradeAttachment();
  }

  // 附件上传确认按钮回调
  @Bind()
  handleUploadOk(fileList) {
    const { dataSource, pagination } = this.state;
    const { evalHeaderId, evalLineId } = this.props;
    const fileData = !isEmpty(fileList)
      ? fileList.map(file => ({
          loginName,
          evalLineId,
          evalHeaderId,
          uploadUserId: id,
          uploadUserName: realName,
          attachmentName: file.name,
          attachmentUrl: file.response,
          [rowKey]: uuidv4(),
          _status: 'create',
        }))
      : [];
    const newDataSource = [...fileData, ...dataSource];
    this.setState({
      dataSource: newDataSource,
      pagination: addItemsToPagination(fileData.length, dataSource.length, pagination),
    });
  }

  // 查询评分信息行 评分附件
  @Bind()
  queryGradeAttachment(page) {
    const {
      dispatch,
      evalLineId,
      uploadUserId,
      updateLineFileCount,
      isPub = false,
      submitUserId = '',
    } = this.props;
    dispatch({
      type: 'siteInvestigateReport/queryGradeAttachment',
      payload: {
        page,
        evalLineId,
        uploadUserId: isPub ? submitUserId : uploadUserId,
      },
    }).then(res => {
      if (res) {
        this.setState({
          dataSource: res.content,
          pagination: createPagination(res),
        });
        const { totalElements } = res;
        // 回调更新行附件数量
        if (updateLineFileCount) {
          updateLineFileCount(totalElements);
        }
      }
    });
  }

  // 保存
  @Bind()
  handleSave(payload) {
    const { dispatch } = this.props;
    dispatch({
      type: 'siteInvestigateReport/saveGradeAttachment',
      payload,
    }).then(res => {
      if (res) {
        notification.success();
        this.queryGradeAttachment();
      }
    });
  }

  // 删除
  @Bind()
  handleDelete(payload) {
    const { dispatch } = this.props;
    dispatch({
      type: 'siteInvestigateReport/deleteGradeAttachment',
      payload,
    }).then(res => {
      if (res) {
        notification.success();
        this.queryGradeAttachment();
      }
    });
  }

  render() {
    const { visible, isEdit, allLoading, onCancel } = this.props;
    const { dataSource, pagination } = this.state;

    return (
      <H0UploadList
        isEdit={isEdit}
        visible={visible}
        onCancel={onCancel}
        dataSource={dataSource}
        pagination={pagination}
        rowKey="attachmentLineId"
        allLoading={allLoading}
        onOk={this.handleUploadOk}
        onSave={this.handleSave}
        onDelete={this.handleDelete}
        onChange={this.queryGradeAttachment}
      />
    );
  }
}
