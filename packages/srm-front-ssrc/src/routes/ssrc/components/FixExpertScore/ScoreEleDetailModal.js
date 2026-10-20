import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Form, InputNumber, Input, Button, Popover } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, sumBy } from 'lodash';
import uuidv4 from 'uuid/v4';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { getEditTableData, delItemToPagination, addItemToPagination } from 'utils/utils';
import notification from 'utils/notification';
import TLEditor from 'components/TLEditor';

/**
 * 评分要素模态框Table
 * @extends {Component} - PureComponent
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */
@withCustomize({
  unitCode: [
    'SSRC.QUOTATION_CONTROLLER_DETAIL.WEIGHT_TABLE', // 询价要求-评分要素-评分要素细项-权重法
    'SSRC.QUOTATION_CONTROLLER_DETAIL.SCORE_TABLE', // 询价要求-评分要素-评分要素细项-二分法
  ],
})
@connect(({ inquiryHall, bidHall, loading }) => ({
  inquiryHall,
  bidHall,
  loading: loading.effects['inquiryHall/fetchElementsDetailLine'],
  save: loading.effects['inquiryHall/saveElementsDetail'],
  deleting: loading.effects['inquiryHall/deleteDetail'],
}))
export default class ScoreEleDetailModal extends PureComponent {
  constructor(props) {
    super(props);
    const { onBindSearch } = props;
    if (onBindSearch) onBindSearch(this.fetchElementsDetailLine);
    this.state = {
      rowKey: 'indicateId',
      dataListName: 'elementsDetailLineList',
      pagination: 'elementsDetailLinePagination',
      selectedRowKeys: [], // 勾选删除主键
    };
  }

  componentDidMount() {
    const { inquiryHall } = this.props;
    const { pagination } = this.state;
    this.fetchElementsDetailLine(inquiryHall[pagination]);
  }

  /**
   * 渲染parentIndicateId和sourceType参数传值
   */
  renderQueryParams(record) {
    const { changeLovFlag = {} } = this.props;
    let parentIndicateId;
    let sourceType;
    let lovChangeFlag = 0;
    // evaluateIndicId = null && indicateId = null 手工新建
    if (!record.evaluateIndicId && !record.indicateId) {
      parentIndicateId = undefined;
      sourceType = undefined;
    }
    // evaluateIndicId = null && indicateId != null lov新建
    if (!record.evaluateIndicId && record.indicateId) {
      parentIndicateId = record.indicateId;
      sourceType = 'TEMPLATE';
      lovChangeFlag = 1;
    }
    // evaluateIndicId != null 已存在
    if (record.evaluateIndicId) {
      // lov有变化
      if (changeLovFlag[record.evaluateIndicId]) {
        parentIndicateId = record.indicateId;
        sourceType = 'TEMPLATE';
        lovChangeFlag = 1;
      } else {
        parentIndicateId = record.evaluateIndicId;
        sourceType = 'MANUAL';
      }
    }
    return {
      parentIndicateId,
      sourceType,
      lovChangeFlag,
    };
  }

  /* eslint-disable-next-line */
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { visible, inquiryHall, dispatch } = this.props;
    const { pagination } = this.state;
    if (
      nextProps.visible === true &&
      nextProps.visible !== visible &&
      !isEmpty(nextProps.elementRecord)
    ) {
      dispatch({
        type: 'inquiryHall/fetchElementsDetailLine',
        payload: {
          page: inquiryHall[pagination],
          indicateLevel: 'TWO',
          templateEleDetailFlag: 1, // 模板评分要素下的评分要素细项标志
          ...this.renderQueryParams(nextProps.elementRecord),
        },
      });
    }
  }

  /**
   * 评分要素-行-查询
   * @param {Object} page
   */
  @Bind()
  fetchElementsDetailLine(page = {}) {
    const { dispatch, elementRecord } = this.props;
    dispatch({
      type: 'inquiryHall/fetchElementsDetailLine',
      payload: {
        page,
        indicateLevel: 'TWO',
        templateEleDetailFlag: 1, // 模板评分要素下的评分要素细项标志
        ...this.renderQueryParams(elementRecord),
      },
    });
  }

  /**
   * 新建行
   */
  @Bind()
  handleCreateRows() {
    const { dispatch, inquiryHall = {}, elementRecord = {} } = this.props;
    const { rowKey, dataListName, pagination } = this.state;
    dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        [dataListName]: [
          {
            [rowKey]: uuidv4(),
            indicateLevel: 'TWO',
            _status: 'create',
            ...this.renderQueryParams(elementRecord),
          },
          ...inquiryHall[dataListName],
        ],
        [pagination]: addItemToPagination(
          inquiryHall[dataListName].length,
          inquiryHall[pagination]
        ),
      },
    });
  }

  /**
   * 删除新建行
   */
  @Bind()
  deleteRow(record) {
    const { dispatch, inquiryHall = {} } = this.props;
    const { rowKey, dataListName, pagination } = this.state;
    const newDataList = inquiryHall[dataListName].filter((item) => item[rowKey] !== record[rowKey]);
    dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        [dataListName]: newDataList,
        [pagination]: delItemToPagination(
          inquiryHall[dataListName].length,
          inquiryHall[pagination]
        ),
      },
    });
  }

  /**
   * 删除
   */
  @Bind()
  handleDelete() {
    const { dispatch, inquiryHall } = this.props;
    const { selectedRowKeys, dataListName, pagination } = this.state;
    let localData = 0;
    if (inquiryHall[dataListName].some((item) => item._status === 'create')) {
      localData = inquiryHall[dataListName].filter((item) => item._status === 'create').length;
    }
    if (selectedRowKeys.length === inquiryHall[pagination].total - localData) {
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.view.notification.elementsDetail.one')
          .d('请至少保留一项评分要素细项！'),
      });
    } else {
      dispatch({
        type: 'inquiryHall/deleteElementsDetail',
        payload: selectedRowKeys,
      }).then((res) => {
        if (res) {
          notification.success();
          this.setState({ selectedRowKeys: [] });
          this.fetchElementsDetailLine(inquiryHall.elementsDetailPagination);
        }
      });
    }
  }

  /**
   * 弹框-保存
   */
  @Bind()
  handleSaveRows() {
    const {
      dispatch,
      inquiryHall,
      elementRecord = {},
      ds,
      header = {},
      // onFetchScoring,
    } = this.props;
    const { rowKey, dataListName } = this.state;
    const newDataList = getEditTableData(inquiryHall[dataListName], [rowKey]);
    if (isEmpty(newDataList)) return;
    if (sumBy(newDataList, 'weight') === 100 || header.templateScoreType === 'SCORE') {
      const saveData = {
        ...elementRecord,
        evaluateIndicId: elementRecord.evaluateIndicId,
        ...this.renderQueryParams(elementRecord),
        scoreIndicateList: newDataList,
      };
      dispatch({
        type: 'inquiryHall/saveElementsDetail',
        payload: saveData,
      }).then((res) => {
        if (res) {
          notification.success();

          this.handleModalHide(1);
          ds.query();
          // 查询外层评分要素数据
          // dispatch({
          //   type: 'bidHall/fetchTempelateDetailData',
          //   payload: {
          //     organizationId,
          //     sourceHeaderId,
          //     sourceFrom: 'RFX',
          //     indicStatus: 'SUBMITTED', // 查询提交后的评分要素数据
          //     indicateLevel: 'ONE', // 查询一级评分要素
          //   },
          // });
        }
      });
    } else {
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.view.notification.weight.sum')
          .d('保存失败，请保持评分要素细项权重之和为100！'),
      });
    }
  }

  /**
   * 设置勾选行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows 行数据
   */
  @Bind()
  onSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  /**
   * 关闭modal
   */
  @Bind()
  handleModalHide() {
    this.props.onHideModal(0);
    this.props.dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        elementsDetailLineList: [],
        elementsDetailLinePagination: {},
      },
    });
  }

  render() {
    const {
      loading,
      visible,
      inquiryHall = {},
      save,
      deleting,
      lovBringOutFlag = {},
      elementRecord,
      header = {},
      customizeTable,
    } = this.props;
    const { rowKey, dataListName, pagination, selectedRowKeys = [] } = this.state;

    const columns = [
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.indicateDetailCode`)
          .d('评分要素细项编码'),
        dataIndex: 'indicateCode',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('indicateCode', {
                  initialValue: record.indicateCode,
                  rules: [
                    {
                      max: 30,
                      message: intl.get('hzero.common.validation.max', {
                        max: 30,
                      }),
                    },
                  ],
                })(
                  <Input
                    typeCase="upper"
                    inputChinese={false}
                    disabled={
                      lovBringOutFlag[elementRecord.evaluateIndicId] && record._status === 'update'
                    }
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.indicateDetailName`)
          .d('评分要素细项名称'),
        dataIndex: 'indicateName',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('indicateName', {
                  initialValue: record.indicateName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`ssrc.inquiryHall.model.inquiryHall.indicateDetailName`)
                          .d('评分要素细项名称'),
                      }),
                    },
                    {
                      max: 240,
                      message: intl.get('hzero.common.validation.max', {
                        max: 240,
                      }),
                    },
                  ],
                })(
                  <TLEditor
                    label={intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.indicateDetailName`)
                      .d('评分要素细项名称')}
                    field="indicateName"
                    token={record._token}
                    disabled={
                      lovBringOutFlag[elementRecord.evaluateIndicId] && record._status === 'update'
                    }
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.elements.remark`).d('评分细则'),
        dataIndex: 'remark',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('remark', {
                  initialValue: record.remark,
                  rules: [
                    {
                      max: 240,
                      message: intl.get('hzero.common.validation.max', {
                        max: 240,
                      }),
                    },
                  ],
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return <Popover content={val}>{val}</Popover>;
          }
        },
      },
      header.templateScoreType !== 'SCORE'
        ? {
            title: <span>{intl.get(`ssrc.inquiryHall.model.inquiryHall.weight`).d('权重')}%</span>,
            dataIndex: 'weight',
            width: 100,
            render: (val, record) => {
              if (['update', 'create'].includes(record._status)) {
                const { getFieldDecorator } = record.$form;
                return (
                  <Form.Item>
                    {getFieldDecorator('weight', {
                      initialValue: record.weight,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`ssrc.inquiryHall.model.inquiryHall.weight`).d('权重'),
                          }),
                        },
                        {
                          pattern: /^[0-9]{1,3}(.[0-9]{1,2})?/,
                          message: intl
                            .get(`ssrc.inquiryHall.model.inquiryHall.unsetsocore`)
                            .d('只能输入两位精度的非负数'),
                        },
                      ],
                    })(<InputNumber style={{ width: '100%' }} precision={2} min={0} max={100} />)}
                  </Form.Item>
                );
              } else {
                return val;
              }
            },
          }
        : null,
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.minScore`).d('最低分'),
        dataIndex: 'minScore',
        width: 100,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('minScore', {
                  initialValue: record.minScore,
                })(
                  <InputNumber
                    style={{ width: '100%' }}
                    precision={2}
                    min={0}
                    max={99999999999999999}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.maxScore`).d('最高分'),
        dataIndex: 'maxScore',
        width: 100,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('maxScore', {
                  initialValue: record.maxScore,
                })(
                  <InputNumber
                    style={{ width: '100%' }}
                    precision={2}
                    min={0}
                    max={99999999999999999}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.defaultScore`).d('缺省分'),
        dataIndex: 'defaultScore',
        width: 100,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('defaultScore', {
                  initialValue: record.defaultScore,
                })(
                  <InputNumber
                    style={{ width: '100%' }}
                    precision={2}
                    min={0}
                    max={99999999999999999}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'center',
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
            ) : (
              ''
            )}
          </span>
        ),
      },
    ].filter(Boolean);

    const rowSelection = {
      onChange: this.onSelectChange,
      getCheckboxProps: (record) => ({
        disabled: record._status === 'create',
      }),
    };

    return (
      <React.Fragment>
        <Modal
          destroyOnClose
          width="70%"
          visible={visible}
          onOk={this.handleSaveRows}
          onCancel={this.handleModalHide}
          confirmLoading={save}
          title={intl.get('ssrc.inquiryHall.view.title.elementsDetail').d('评分要素细项')}
          okText={intl.get('hzero.common.button.save').d('保存')}
        >
          <div style={{ textAlign: 'right', marginBottom: '16px' }}>
            <Button
              disabled={isEmpty(selectedRowKeys)}
              loading={deleting}
              onClick={this.handleDelete}
              style={{ marginRight: '8px' }}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
            <Button type="primary" onClick={this.handleCreateRows}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          </div>
          {customizeTable(
            {
              code:
                header.templateScoreType === 'WEIGHT'
                  ? 'SSRC.QUOTATION_CONTROLLER_DETAIL.WEIGHT_TABLE'
                  : 'SSRC.QUOTATION_CONTROLLER_DETAIL.SCORE_TABLE',
            },
            <EditTable
              bordered
              loading={loading}
              rowKey={rowKey}
              rowSelection={rowSelection}
              dataSource={inquiryHall[dataListName]}
              columns={columns}
              pagination={inquiryHall[pagination]}
              onChange={this.fetchElementsDetailLine}
            />
          )}
        </Modal>
      </React.Fragment>
    );
  }
}
