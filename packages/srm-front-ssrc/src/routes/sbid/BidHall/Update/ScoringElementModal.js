/**
 * create 创建招标
 * @date: 2019-05-28
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Modal, Button, Form, Input, Select, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import Checkbox from 'components/Checkbox';
import { Header } from 'components/Page';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

export default class ScoringElementModal extends Component {
  /**
   * 改变要素编码-获取供应商名称
   */
  @Bind()
  changeIndicateId(value, dataList, record) {
    const { indicateName, indicateCode, indicateType, minScore, maxScore } = dataList;
    record.$form.setFieldsValue({
      indicateName,
      indicateCode,
      indicateType,
      minScore,
      maxScore,
    });
  }

  /**
   * 改变必须通过/合格
   * 勾选时，要素类型为打分制，合格分值可编辑，必输，通过值时，合格分值不变
   * 不勾选时，要素类型为打分制，清空合格分值，通过值时，合格分值不变
   */
  @Bind()
  changeMustApprovedFlag(e, record) {
    if (!e.target.checked && record.$form.getFieldValue('indicateType') === 'SCORE') {
      record.$form.setFieldsValue({ qualifiedScore: undefined });
    }
  }

  render() {
    const {
      indicateType = [],
      loading,
      dataSource = [],
      rowSelection,
      visible = false,
      onCreateLine,
      onDeleteLine,
      onSaveLine,
      scoringElementSelectedRows = [],
      onCancel,
      saveScoringElementLoading,
      onSelectTemplateOk,
    } = this.props;

    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.indicateCode`).d('要素编码'),
        dataIndex: 'indicateCode',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('indicateId', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.bidHall.model.bidHall.indicateCode`).d('要素编码'),
                      }),
                    },
                  ],
                  initialValue: record.indicateId,
                })(
                  <Lov
                    code="SSRC.SCORE_INDIC"
                    onChange={(value, dataList) => this.changeIndicateId(value, dataList, record)}
                    textValue={record.indicateCode}
                  />
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('indicateCode', {})(<div />)}
              </Form.Item>
            </React.Fragment>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.indicateNames`).d('要素名称'),
        dataIndex: 'indicateName',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('indicateName', {
                  initialValue: val,
                })(<Input disabled />)}
              </Form.Item>
            </React.Fragment>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.indicateType`).d('要素类型'),
        dataIndex: 'indicateTypeMeaning',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('indicateType', {
                initialValue: record.indicateType,
              })(
                <Select disabled style={{ width: '100px' }}>
                  {indicateType &&
                    indicateType.map(item => (
                      <Select.Option key={item.value} value={item.value}>
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
        title: intl.get(`ssrc.bidHall.model.bidHall.fromScore`).d('分值从'),
        dataIndex: 'minScore',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('minScore', {
                initialValue: val,
                rules: [
                  {
                    required: record.$form.getFieldValue('indicateType') !== 'PASS',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.fromScore`).d('分值从'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  min={0}
                  precision={2}
                  disabled={record.$form.getFieldValue('indicateType') === 'PASS'}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.scoreEnd`).d('分值至'),
        dataIndex: 'maxScore',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('maxScore', {
                initialValue: val,
                rules: [
                  {
                    required: record.$form.getFieldValue('indicateType') !== 'PASS',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.scoreEnd`).d('分值至'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  min={0}
                  precision={2}
                  disabled={record.$form.getFieldValue('indicateType') === 'PASS'}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.mustApprovedFlag`).d('必须通过/合格'),
        dataIndex: 'mustApprovedFlag',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('mustApprovedFlag', {
                initialValue: val,
              })(<Checkbox onChange={e => this.changeMustApprovedFlag(e, record)} />)}
            </Form.Item>
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.qualifiedScore`).d('合格分值'),
        dataIndex: 'qualifiedScore',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('qualifiedScore', {
                initialValue: val,
                rules: [
                  {
                    required:
                      record.$form.getFieldValue('indicateType') === 'SCORE' &&
                      record.$form.getFieldValue('mustApprovedFlag'),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.qualifiedScore`).d('合格分值'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  min={0}
                  precision={1}
                  disabled={
                    record.$form.getFieldValue('indicateType') === 'PASS' ||
                    (!record.$form.getFieldValue('mustApprovedFlag') &&
                      record.$form.getFieldValue('indicateType') === 'SCORE')
                  }
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
    ];

    return (
      <Modal
        destroyOnClose
        width={800}
        visible={visible}
        onCancel={onCancel}
        footer={null}
        title={
          <Header
            title={intl
              .get(`ssrc.bidHall.view.message.title.scoringElementDefinition`)
              .d('评分要素定义')}
          >
            <Button
              type="primary"
              onClick={onSaveLine}
              loading={saveScoringElementLoading}
              disabled={dataSource.length === 0}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <Button
              type="default"
              onClick={onDeleteLine}
              disabled={scoringElementSelectedRows.length === 0}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
            <Button type="default" onClick={onCreateLine}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
            <Lov
              isButton
              type="default"
              onOk={onSelectTemplateOk}
              code="SSRC.REFERENCE_SCORE_TEMPL"
              queryParams={{
                templatePurpose: 'PREQUALIFICATION',
                // scoreMode: header.openBidOrder !== 'SYNC' ? 'DIFF' : 'NONE',
              }}
            >
              {intl.get(`ssrc.bidHall.view.button.referTemplate`).d('参考模板')}
            </Lov>
          </Header>
        }
      >
        <EditTable
          bordered
          rowKey="prequalScoreAssignId"
          loading={loading}
          columns={columns}
          rowSelection={rowSelection}
          dataSource={dataSource}
          pagination={false}
        />
      </Modal>
    );
  }
}
