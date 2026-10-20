import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Drawer, Form, InputNumber, Input, Button, Tooltip } from 'hzero-ui';
import { Button as C7NButton, TextArea } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty, compose } from 'lodash';
import uuidv4 from 'uuid/v4';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import remoteHoc from 'hzero-front/lib/utils/remote';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import {
  getEditTableData,
  delItemToPagination,
  addItemToPagination,
  getCurrentOrganizationId,
} from 'utils/utils';
import notification from 'utils/notification';
import TLEditor from 'components/TLEditor';
import { INQUIRY, BID } from '@/utils/globalVariable';
import style from './index.less';

import HocTooltip from '../../components/HocTooltip';

const organizationId = getCurrentOrganizationId();

/**
 * 评分要素模态框Table
 * @extends {Component} - PureComponent
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */
class ScoreEleDetailModal extends PureComponent {
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
      parentIndicateId = null;
      sourceType = null;
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
      } else if (record._status === 'update') {
        parentIndicateId = record.evaluateIndicId;
        sourceType = 'MANUAL';
      } else {
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
    const { dispatch, elementRecord, templateScoreType, rfx: { unitCodeSymbol } = {} } = this.props;
    dispatch({
      type: 'inquiryHall/fetchElementsDetailLine',
      payload: {
        page,
        indicateLevel: 'TWO',
        templateEleDetailFlag: 1, // 模板评分要素下的评分要素细项标志
        sourceIndicateId: elementRecord.indicateId,
        ...this.renderQueryParams(elementRecord),
        customizeUnitCode:
          templateScoreType === 'WEIGHT'
            ? `SSRC.${unitCodeSymbol}.NEW_EDIT.HEADER.WEIGHT_TABLE`
            : `SSRC.${unitCodeSymbol}.NEW_EDIT.HEADER.SCORE_TABLE`,
      },
    });
  }

  /**
   * 新建行
   */
  @Bind()
  handleCreateRows() {
    const { dispatch, inquiryHall = {}, elementRecord = {}, templateScoreType } = this.props;
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
            weight: templateScoreType === 'SCORE' ? 100 : '',
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
    const { dispatch, inquiryHall, operationType = '' } = this.props;
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
        payload: operationType
          ? {
              operationType,
              selectedRowKeys,
            }
          : selectedRowKeys,
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
      sourceHeaderId,
      readonly = false,
      onHideModal = () => {},
      // onFetchScoring,
      fetchScoring = () => {},
      templateScoreType,
      operationType = '',
      rfx,
    } = this.props;
    const { rowKey, dataListName } = this.state;
    const { unitCodeSymbol } = rfx || {};

    const newDataList = getEditTableData(inquiryHall[dataListName], [rowKey]);
    if (readonly) {
      onHideModal();
      return;
    }

    if (isEmpty(newDataList)) return;
    const saveData = {
      ...elementRecord,
      evaluateIndicId:
        elementRecord._status === 'update' ? elementRecord.evaluateIndicId : undefined,
      ...this.renderQueryParams(elementRecord),
      scoreIndicateList: newDataList,
      customizeUnitCode:
        templateScoreType === 'WEIGHT'
          ? `SSRC.${unitCodeSymbol}.NEW_EDIT.HEADER.WEIGHT_TABLE`
          : `SSRC.${unitCodeSymbol}.NEW_EDIT.HEADER.SCORE_TABLE`,
      operationType,
    };
    dispatch({
      type: 'inquiryHall/saveElementsDetail',
      payload: saveData,
    }).then((res) => {
      if (res) {
        notification.success();

        this.handleModalHide(1);

        // 查询外层评分要素数据
        if (fetchScoring && typeof fetchScoring === 'function') {
          fetchScoring({
            queryFrom: 'queryAfterTwoElementSave',
            elementRecord,
          }); // 新维护查询
        } else {
          dispatch({
            type: 'bidHall/fetchTempelateDetailData',
            payload: {
              organizationId,
              sourceHeaderId,
              sourceFrom: 'RFX',
              indicStatus: 'SUBMITTED', // 查询提交后的评分要素数据
              indicateLevel: 'ONE', // 查询一级评分要素
            },
          });
        }
      }
    });
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

  // input组件的onChange
  @Bind()
  changeFieldsValue(value, name, record) {
    const { setFieldsValue, getFieldValue } = record.$form;
    const min = getFieldValue('minScore');
    const max = getFieldValue('maxScore');
    if (name === 'minScore') {
      setFieldsValue({ [name]: value, maxScore: max });
    } else if (name === 'maxScore') {
      setFieldsValue({ [name]: value, minScore: min });
    }
  }

  render() {
    const {
      loading,
      visible,
      inquiryHall = {},
      save,
      deleting,
      readonly = false,
      templateScoreType,
      customizeTable,
      rfx,
      closable = true, // 是否显示右上角的关闭按钮
      remote,
      detailFlag,
    } = this.props;
    const { rowKey, dataListName, pagination, selectedRowKeys = [] } = this.state;
    const { unitCodeSymbol, bidFlag } = rfx || {};

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
                })(<Input typeCase="upper" inputChinese={false} disabled={detailFlag} />)}
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
                      required: !readonly,
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
                  <HocTooltip
                    comp={TLEditor}
                    label={intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.indicateDetailName`)
                      .d('评分要素细项名称')}
                    field="indicateName"
                    token={record._token}
                    disabled={detailFlag}
                  />
                )}
              </Form.Item>
            );
          } else {
            return (
              <Tooltip title={val} placement="topLeft">
                {val}
              </Tooltip>
            );
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
                })(
                  <TextArea
                    disabled={readonly}
                    className="indicateRemark-textArea"
                    overlayStyle={{
                      whiteSpace: 'pre-wrap',
                      minWidth: '400',
                    }}
                    resize="both"
                    autoSize={{ maxRows: 5 }}
                    style={{ width: '100%' }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return (
              <Tooltip title={val} placement="topLeft">
                <span className={style['indicateRemark-span']}>{val}</span>
              </Tooltip>
            );
          }
        },
      },
      templateScoreType !== 'SCORE'
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
                    })(
                      <InputNumber
                        style={{ width: '100%' }}
                        disabled={readonly}
                        precision={2}
                        min={0}
                        max={100}
                      />
                    )}
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
            const { getFieldDecorator, getFieldValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('minScore', {
                  initialValue:
                    record.minScore || record.minScore === 0
                      ? record.minScore
                      : templateScoreType === 'WEIGHT'
                      ? 0
                      : null,
                  rules: [
                    {
                      validator: (_, value, callback) => {
                        const ruleMaxScore = getFieldValue('maxScore');
                        if (value && ruleMaxScore && value > ruleMaxScore) {
                          callback(
                            intl
                              .get(`ssrc.inquiryHall.model.inquiryHall.minLessThanMax`)
                              .d('最低分不能高于最高分')
                          );
                        } else {
                          callback();
                        }
                      },
                    },
                  ],
                })(
                  <InputNumber
                    disabled={readonly}
                    style={{ width: '100%' }}
                    precision={2}
                    min={
                      remote
                        ? remote.process('SSRC_TWO_SCORE_ELEMENT_PROCESS_MIN_SCORE_MIN_VALUE', 0, {
                            bidFlag,
                          })
                        : 0
                    }
                    max={99999999999999999}
                    onChange={(value) => this.changeFieldsValue(value, 'minScore', record)}
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
            const { getFieldDecorator, getFieldValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('maxScore', {
                  initialValue:
                    record.maxScore >= 0
                      ? record.maxScore
                      : templateScoreType === 'WEIGHT'
                      ? 0
                      : null,
                  rules: [
                    {
                      validator: (_, value, callback) => {
                        const ruleMinScore = getFieldValue('minScore');
                        if (value && ruleMinScore && value < ruleMinScore) {
                          callback(
                            intl
                              .get(`ssrc.inquiryHall.model.inquiryHall.maxGreaterThanMin`)
                              .d('最高分不能低于最低分')
                          );
                        } else {
                          callback();
                        }
                      },
                    },
                  ],
                })(
                  <InputNumber
                    style={{ width: '100%' }}
                    precision={2}
                    min={0}
                    max={99999999999999999}
                    disabled={readonly}
                    onChange={(value) => this.changeFieldsValue(value, 'maxScore', record)}
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
                    disabled={readonly}
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
            {record._status === 'create' && !readonly ? (
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
      selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps: (record) => ({
        disabled: record._status === 'create',
      }),
    };

    return (
      <React.Fragment>
        <Drawer
          destroyOnClose
          width="1090"
          visible={visible}
          onOk={this.handleSaveRows}
          onClose={this.handleModalHide}
          confirmLoading={save}
          title={intl.get('ssrc.inquiryHall.view.title.elementsDetail').d('评分要素细项')}
          okText={intl.get('hzero.common.button.save').d('保存')}
          closable={closable}
        >
          {!readonly ? (
            <div style={{ marginBottom: '16px' }}>
              <C7NButton
                funcType="flat"
                type="primary"
                color="primary"
                icon="playlist_add"
                onClick={this.handleCreateRows}
              >
                {intl.get('hzero.common.button.create').d('新建')}
              </C7NButton>
              <C7NButton
                funcType="flat"
                color="primary"
                disabled={isEmpty(selectedRowKeys)}
                loading={deleting}
                onClick={this.handleDelete}
                icon="delete"
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </C7NButton>
            </div>
          ) : null}
          {customizeTable(
            {
              code:
                templateScoreType === 'WEIGHT'
                  ? `SSRC.${unitCodeSymbol}.NEW_EDIT.HEADER.WEIGHT_TABLE`
                  : `SSRC.${unitCodeSymbol}.NEW_EDIT.HEADER.SCORE_TABLE`,
            },
            <EditTable
              bordered
              loading={loading}
              rowKey={rowKey}
              rowSelection={!readonly ? rowSelection : false}
              dataSource={inquiryHall[dataListName]}
              columns={columns}
              pagination={inquiryHall[pagination]}
              onChange={this.fetchElementsDetailLine}
              scroll={{ y: 'calc(100vh - 300px)' }}
            />
          )}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              borderTop: '1px solid #e8e8e8',
              padding: '10px 16px',
              textAlign: 'left',
              left: 0,
              background: '#fff',
              borderRadius: '0 0 4px 4px',
            }}
          >
            {!readonly ? (
              <>
                <Button
                  type="primary"
                  onClick={() => this.handleSaveRows()}
                  style={{ marginRight: '8px' }}
                  loading={save}
                >
                  {intl.get('hzero.common.button.save').d('保存')}
                </Button>
                <Button onClick={() => this.handleModalHide()}>
                  {intl.get('hzero.common.view.button.cancel').d('取消')}
                </Button>
              </>
            ) : (
              <Button onClick={() => this.handleModalHide()}>
                {intl.get('ssrc.inquiryHall.model.inquiryHall.closed').d('关闭')}
              </Button>
            )}
          </div>
        </Drawer>
      </React.Fragment>
    );
  }
}

const HOCComponent = (Comp, type = INQUIRY) => {
  return compose(
    withCustomize({
      unitCode: [
        `SSRC.${type}_HALL.NEW_EDIT.HEADER.WEIGHT_TABLE`, // 询价要求-评分要素-评分要素细项-权重法
        `SSRC.${type}_HALL.NEW_EDIT.HEADER.SCORE_TABLE`, // 询价要求-评分要素-评分要素细项-二分法
      ],
    }),
    connect(({ inquiryHall, bidHall, loading }) => ({
      inquiryHall,
      bidHall,
      loading: loading.effects['inquiryHall/fetchElementsDetailLine'],
      save: loading.effects['inquiryHall/saveElementsDetail'],
      deleting: loading.effects['inquiryHall/deleteDetail'],
    }))
  )(
    remoteHoc({
      code: 'SSRC_TWO_SCORE_ELEMENT',
      name: 'remote',
    })(Comp)
  );
};

const BidScoreEleDetailModal = HOCComponent(ScoreEleDetailModal, BID);

export default HOCComponent(ScoreEleDetailModal, INQUIRY);

export { HOCComponent, ScoreEleDetailModal, BidScoreEleDetailModal };
