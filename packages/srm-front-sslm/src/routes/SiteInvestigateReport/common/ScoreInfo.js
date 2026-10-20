/**
 * ScoreInfo -评分信息
 * @date: 2020-05-08
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isFunction, isArray, isNumber, sum, isEmpty } from 'lodash';
import React, { Component, Fragment } from 'react';
import { Form, Input, InputNumber } from 'hzero-ui';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import { yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { PRIVATE_BUCKET } from '_utils/config';

const FormItem = Form.Item;
@formatterCollections({
  code: ['sslm.siteInvestigateReport'],
})
@connect(({ siteInvestigateReport, loading }) => ({
  siteInvestigateReport,
  queryScoreInfoLoading: loading.effects['siteInvestigateReport/queryScoreInfo'],
}))
export default class ScoreInfo extends Component {
  constructor(props) {
    super(props);
    const { onRef = e => e } = this.props;
    onRef(this);
    this.state = {
      dataSource: [],
      expandedRowKeys: [],
      allScoreRowKey: [],
    };
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { evalHeaderId: prevEvalHeaderId } = prevProps;
    const { evalHeaderId } = this.props;
    return evalHeaderId !== prevEvalHeaderId;
  }

  componentDidUpdate(...rest) {
    const snapshot = rest[2];
    if (snapshot) {
      this.queryScoreInfo();
    }
  }

  componentDidMount() {
    this.queryScoreInfo();
  }

  /**
   * 获取评分信息所有非父级节点id
   */
  @Bind()
  getScoreLeafNodeId(dataSource) {
    const evalLineIdList = [];
    const recursiveFunction = arr => {
      arr.forEach(item => {
        if (item.children) {
          recursiveFunction(item.children);
        } else {
          evalLineIdList.push(item.evalLineId);
        }
      });
    };
    recursiveFunction(dataSource);
    return evalLineIdList;
  }

  /**
   * 评分信息查询
   */
  @Bind()
  queryScoreInfo() {
    const {
      dispatch,
      evalHeaderId,
      customizeUnitCode = '',
      setEvalLineIdList,
      supplierEvalFlag,
      isAlreadyFeedback,
    } = this.props;
    dispatch({
      type: 'siteInvestigateReport/queryScoreInfo',
      payload: {
        isAlreadyFeedback,
        evalHeaderId,
        customizeUnitCode,
        supplierEvalFlag,
      },
    }).then(res => {
      if (res) {
        const addUpdateToChildren = arr => {
          if (Array.isArray(arr)) {
            return arr.map(item => {
              const items = item;
              if (Array.isArray(item.children)) {
                items.children = addUpdateToChildren(item.children);
              }
              return { ...items, _status: 'update' };
            });
          } else {
            return arr;
          }
        };
        const result = addUpdateToChildren(res);
        // 获取所有评分行id
        const allScoreRowKey = [];
        const flatKeys = scoreInfo => {
          if (isArray(scoreInfo.children) && !isEmpty(scoreInfo.children)) {
            allScoreRowKey.push(scoreInfo.evalLineId);
            scoreInfo.children.forEach(item => flatKeys(item));
          } else {
            allScoreRowKey.push(scoreInfo.evalLineId);
          }
        };
        res.forEach(item => {
          flatKeys(item);
        });

        if (setEvalLineIdList) {
          setEvalLineIdList(this.getScoreLeafNodeId(result));
        }
        this.setState({
          dataSource: result,
          allScoreRowKey,
          expandedRowKeys: allScoreRowKey,
        });
      }
    });
  }

  /**
   * 展开全部评分信息
   */
  @Bind()
  expandAll() {
    const { allScoreRowKey } = this.state;
    this.setState({
      expandedRowKeys: allScoreRowKey,
    });
  }

  /**
   * 收起全部评分信息
   */
  @Bind()
  collapseAll() {
    this.setState({
      expandedRowKeys: [],
    });
  }

  @Bind()
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 180,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  /**
   * 树形结构点击展开收起时的回调
   */
  @Bind()
  onExpand(expanded, record) {
    const { evalLineId } = record;
    const { expandedRowKeys } = this.state;

    if (expanded) {
      this.setState({
        expandedRowKeys: [...expandedRowKeys, evalLineId],
      });
    } else {
      const newExpandRowKeys = expandedRowKeys.filter(item => item !== evalLineId);
      this.setState({
        expandedRowKeys: newExpandRowKeys,
      });
    }
  }

  render() {
    const {
      queryScoreInfoLoading,
      entrance = '',
      isView = false,
      isPub = false,
      customizeTable,
      customizeUnitCode = '',
      custLoading,
    } = this.props;
    const { dataSource, expandedRowKeys } = this.state;

    const scoreInfoColumns = [
      {
        width: 150,
        dataIndex: 'indicatorCode',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.projectCode').d('考察项目编码'),
      },
      {
        width: 200,
        dataIndex: 'indicatorName',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.projectName').d('考察项目名称'),
        onCell: this.onCell,
      },
      {
        width: 100,
        dataIndex: 'scoreTypeMeaning',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.scoreWay').d('评分方式'),
      },
      {
        width: 150,
        dataIndex: 'evalStandard',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.scoreCriteria').d('评分标准'),
        onCell: this.onCell,
      },
      {
        width: 150,
        dataIndex: 'indicatorTypeMeaning',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.projectType').d('考察项目类型'),
      },
      {
        width: 100,
        dataIndex: 'scoreFrom',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.scoreFrom').d('分值从'),
      },
      {
        width: 100,
        dataIndex: 'scoreTo',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.scoreTo').d('分值至'),
      },
      {
        width: 140,
        dataIndex: 'supplierScore',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.supplierScore').d('供应商自评得分'),
        render: (val, record) => {
          if (
            !isView &&
            !isPub &&
            entrance === 'feedBack' &&
            ['create', 'update'].includes(record._status) &&
            !record.children
          ) {
            // const limits =
            //   record.indicatorType === 'SCORE'
            //     ? { min: record.scoreFrom, max: record.scoreTo }
            //     : {};
            const limits = { min: record.scoreFrom, max: record.scoreTo };
            return (
              <FormItem>
                {record.$form.getFieldDecorator('supplierScore', {
                  initialValue: val,
                })(<InputNumber {...limits} />)}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        width: 120,
        dataIndex: 'supplierRemarks',
        title: intl
          .get('sslm.siteInvestigateReport.modal.mange.supplierRemarks')
          .d('供应商自评意见'),
        render: (val, record) => {
          if (
            !isView &&
            !isPub &&
            entrance === 'feedBack' &&
            ['create', 'update'].includes(record._status)
          ) {
            return (
              <FormItem>
                {record.$form.getFieldDecorator('supplierRemarks', {
                  initialValue: val,
                })(<Input />)}
              </FormItem>
            );
          } else {
            return val;
          }
        },
        onCell: this.onCell,
      },
      {
        width: 120,
        dataIndex: 'attachmentUuid',
        title: intl
          .get('sslm.siteInvestigateReport.modal.mange.supplierAttachement')
          .d('供应商反馈附件'),
        render: (val, record) => {
          if (
            !isView &&
            !isPub &&
            entrance === 'feedBack' &&
            ['create', 'update'].includes(record._status)
          ) {
            return (
              <FormItem>
                {record.$form.getFieldDecorator('attachmentUuid', {
                  initialValue: val,
                })(
                  <Upload
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="sslm-report-score"
                    attachmentUUID={val}
                    filePreview
                  />
                )}
              </FormItem>
            );
          } else {
            return (
              <Upload
                viewOnly
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="sslm-report-score"
                attachmentUUID={val}
                filePreview
              />
            );
          }
        },
      },
    ];

    if (entrance !== 'feedBack') {
      scoreInfoColumns.push(
        ...[
          {
            width: 100,
            dataIndex: 'evalWeight',
            title: intl.get('sslm.siteInvestigateReport.modal.mange.weight').d('权重'),
          },
          {
            width: 120,
            dataIndex: 'finalScore',
            title: intl.get('sslm.siteInvestigateReport.modal.mange.score').d('得分'),
          },
          {
            width: 100,
            dataIndex: 'defaultScore',
            title: intl.get('sslm.siteInvestigateReport.modal.mange.defaultScore').d('缺省分值'),
          },
          {
            width: 150,
            dataIndex: 'respRemarks',
            title: intl.get('sslm.siteInvestigateReport.modal.mange.respRemarks').d('反馈备注'),
            onCell: this.onCell,
          },
        ]
      );
    }

    // 反馈不添加
    if (entrance !== 'feedBack') {
      scoreInfoColumns.splice(12, 0, {
        width: 120,
        dataIndex: 'isStandard',
        title: intl.get('sslm.siteInvestigateReport.modal.scorer.isCriteria').d('符合评分标准'),
        render: val => yesOrNoRender(val),
      });
      scoreInfoColumns.splice(13, 0, {
        width: 100,
        dataIndex: 'isVeto',
        title: intl.get('sslm.siteInvestigateReport.modal.scorer.isVeto').d('否决该项'),
        render: val => yesOrNoRender(val),
      });
    }
    const scrollX = sum(scoreInfoColumns.map(n => (isNumber(n.width) ? n.width : 150)));
    return (
      <Fragment>
        {isFunction(customizeTable) ? (
          customizeTable(
            {
              code: customizeUnitCode,
            },
            <EditTable
              bordered
              rowKey="evalLineId"
              dataSource={dataSource}
              columns={scoreInfoColumns}
              loading={queryScoreInfoLoading}
              pagination={false}
              scroll={{ x: scrollX, y: 353.4 }}
              onChange={this.queryScoreInfo}
              custLoading={custLoading}
              onExpand={this.onExpand}
              expandedRowKeys={expandedRowKeys}
            />
          )
        ) : (
          <EditTable
            bordered
            rowKey="evalLineId"
            dataSource={dataSource}
            columns={scoreInfoColumns}
            loading={queryScoreInfoLoading}
            scroll={{ x: scrollX, y: 353.4 }}
            pagination={false}
            onChange={this.queryScoreInfo}
            onExpand={this.onExpand}
            expandedRowKeys={expandedRowKeys}
          />
        )}
      </Fragment>
    );
  }
}
