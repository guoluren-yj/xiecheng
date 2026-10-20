/*
 * AttachmentInfo - 附件信息
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
// import { yesOrNoRender } from 'utils/renderer';
// import { formatInternationalTel } from '@/routes/components/utils';

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

  componentDidMount() {
    const { dataSet, changeReqId } = this.props;
    dataSet.setQueryParameter('changeReqId', changeReqId);
    dataSet.query();
  }

  /**
   * 处理列
   */
  @Bind()
  handleColumns() {
    const columns = [
      {
        name: 'attachmentType',
        renderer: ({ record }) => {
          const { attachmentTypeMeaning, subAttachmentMeaning } = record.get([
            'attachmentTypeMeaning',
            'subAttachmentMeaning',
          ]);
          if (attachmentTypeMeaning && subAttachmentMeaning) {
            return <span>{`${attachmentTypeMeaning} / ${subAttachmentMeaning}`}</span>;
          } else {
            return <span>{attachmentTypeMeaning || subAttachmentMeaning}</span>;
          }
        },
      },
      {
        name: 'description',
      },
      {
        name: 'endDate',
      },
      {
        name: 'uploadDate',
      },
      {
        name: 'attachmentUuid',
      },
      {
        name: 'remark',
      },
    ];
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
