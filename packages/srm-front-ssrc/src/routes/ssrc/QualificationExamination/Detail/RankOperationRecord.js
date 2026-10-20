/**
 * RankOperationRecord - 评分明细
 * @date: 2019 1/1
 * @author: LC <chao.li03@hand-china>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Fragment, PureComponent } from 'react';
import { Modal, Form, Button, Input, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import EditTable from 'components/EditTable';
import { yesOrNoRender } from 'utils/renderer';

import intl from 'utils/intl';
import styles from '../../InquiryHall/Update/LadderLevelModal.less';

@Form.create({ fieldNameProp: null })
export default class OperationRecord extends PureComponent {
  /**
   *  初始化查询评分明细
   */
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  render() {
    const {
      visible,
      hideModal,
      dataSource,
      detailApprovedStatus,
      saveRank,
      prequalLineStatus,
      saveRankLoading,
      rankListLoading,
    } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.indicateCode`).d('要素编码'),
        dataIndex: 'indicateCode',
        width: 180,
      },
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.indicateName`).d('要素名称'),
        dataIndex: 'indicateName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.indicateType`).d('要素类型'),
        dataIndex: 'indicateTypeMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.scoreFrom`).d('分值从'),
        dataIndex: 'minScore',
        width: 100,
      },
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.scoreTo`).d('分值至'),
        dataIndex: 'maxScore',
        width: 100,
      },
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.mustApproved`).d('必须通过/合格'),
        dataIndex: 'mustApprovedFlag',
        width: 130,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.qualifiedScore`).d('合格分值'),
        dataIndex: 'qualifiedScore',
        width: 100,
      },
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.score`).d('分值'),
        dataIndex: 'score',
        width: 80,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('score', {
                initialValue: val,
                rules: [
                  {
                    required: record.indicateType === 'SCORE',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.qualiExam.model.qualiExam.score`).d('分值'),
                    }),
                  },
                ],
              })(
                <Input
                  disabled={record.indicateType !== 'SCORE' || prequalLineStatus !== 'SUBMITED'}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.pass`).d('通过'),
        dataIndex: 'detailApprovedStatus',
        width: 130,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('detailApprovedStatus', {
                initialValue: val,
                rules: [
                  {
                    required: record.indicateType !== 'SCORE',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.qualiExam.model.qualiExam.pass`).d('通过'),
                    }),
                  },
                ],
              })(
                <Select
                  disabled={record.indicateType === 'SCORE' || prequalLineStatus !== 'SUBMITED'}
                  allowClear
                  style={{ width: '104px' }}
                >
                  {detailApprovedStatus.map((item) => (
                    <Select.Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'approvedRemark',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('approvedRemark', {
                initialValue: val,
                rules: [
                  {
                    max: 500,
                    message: intl.get('hzero.common.validation.max', {
                      max: 500,
                    }),
                  },
                ],
              })(<Input disabled={prequalLineStatus !== 'SUBMITED'} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
    ];
    const scrollWidth = this.scrollWidth(columns);
    const modalProps = {
      visible,
      width: 940,
      footer: null,
      onCancel: hideModal,
    };
    const tableProps = {
      rowKey: (record, index) => index,
      columns,
      dataSource,
      pagination: false,
      onChange: (page) => this.handleSearch(page),
    };
    return (
      <Modal
        {...modalProps}
        title={
          <React.Fragment>
            <div className={styles['ladder-lever']}>
              <Form layout="inline">
                <span style={{ position: 'absolute', left: '24px' }}>
                  {intl.get(`ssrc.qualiExam.model.qualiExam.record`).d('评分明细')}
                </span>
                <Button
                  icon="save"
                  type="primary"
                  disabled={prequalLineStatus !== 'SUBMITED'}
                  style={{ margin: '0px 24px 0px 8px' }}
                  onClick={saveRank}
                  loading={saveRankLoading}
                >
                  {intl.get('hzero.common.button.save').d('保存')}
                </Button>
              </Form>
            </div>
          </React.Fragment>
        }
      >
        <Fragment>
          <EditTable
            scroll={{ x: scrollWidth }}
            loading={rankListLoading}
            {...tableProps}
            bordered
          />
        </Fragment>
      </Modal>
    );
  }
}
