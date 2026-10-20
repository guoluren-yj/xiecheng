/*
 * AttachmentInfo - 附件信息
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Table, Attachment } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { PRIVATE_BUCKET } from '_utils/config';
import { yesOrNoRender } from 'utils/renderer';

/**
 * 附件信息
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} investigationTemDefineOrg - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
export default class AttachmentInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * 处理列
   */
  @Bind()
  handleColumns() {
    const { attachmentInfo = {} } = this.props;
    const { enableFieldList = [] } = attachmentInfo;
    const columns = [
      {
        name: 'attachmentTypeMerge',
        width: 220,
        tooltip: 'none',
      },
      {
        name: 'description',
        width: 180,
      },
      {
        name: 'endDate',
        width: 180,
      },
      {
        name: 'longEffectiveFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'uploadDate',
        width: 180,
      },
      {
        name: 'attachmentUuid',
        width: 150,
        editor: () => (
          <Attachment
            name="attachmentUuid"
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="spfm-comp"
            funcType="link"
            viewMode="popup"
            readOnly
          />
        ),
      },
      {
        name: 'remark',
        width: 200,
      },
    ].filter(item => {
      return enableFieldList.includes(item.name);
    });
    return columns;
  }

  render() {
    const { dataSet } = this.props;
    return (
      <React.Fragment>
        <Table dataSet={dataSet} columns={this.handleColumns()} />
      </React.Fragment>
    );
  }
}
