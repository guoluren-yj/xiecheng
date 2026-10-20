import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, InputNumber, Input, Button, Drawer } from 'hzero-ui';
import { Button as C7NButton } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import uuidv4 from 'uuid/v4';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

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

import { HistoryRenderPureHzero } from './utils';

const organizationId = getCurrentOrganizationId();
const { TextArea } = Input;

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
      rowKey: 'indicateAdjustId',
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
    let parentIndicateAdjustId;
    let sourceType;
    let lovChangeFlag = 0;
    // evaluateIndicAdjustId = null && indicateId = null 手工新建
    if (!record.evaluateIndicAdjustId && !record.indicateId) {
      parentIndicateAdjustId = null;
      sourceType = null;
    }
    // evaluateIndicAdjustId = null && indicateId != null lov新建
    if (!record.evaluateIndicAdjustId && record.indicateId) {
      parentIndicateAdjustId = record.indicateId;
      sourceType = 'TEMPLATE';
      lovChangeFlag = 1;
    }
    // evaluateIndicAdjustId != null 已存在
    if (record.evaluateIndicAdjustId) {
      // lov有变化
      if (changeLovFlag[record.evaluateIndicAdjustId]) {
        parentIndicateAdjustId = record.indicateId;
        sourceType = 'TEMPLATE';
        lovChangeFlag = 1;
      } else if (record._status === 'update') {
        parentIndicateAdjustId = record.evaluateIndicAdjustId;
        sourceType = 'MANUAL';
      } else {
        sourceType = 'MANUAL';
      }
    }
    return {
      organizationId,
      tenantId: organizationId,
      parentIndicateAdjustId,
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
      const { _status = null } = nextProps?.elementRecord || {};
      const API =
        _status === 'create'
          ? 'fetchElementsDetailLine'
          : 'fetchScoreDetailLevelTwoOfQuotationController';
      dispatch({
        type: `inquiryHall/${API}`,
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
  fetchElementsDetailLine(page = {}, params = {}) {
    const { dispatch, elementRecord = {} } = this.props;
    const { _status = null } = elementRecord || {};
    const API =
      _status === 'create'
        ? 'fetchElementsDetailLine'
        : 'fetchScoreDetailLevelTwoOfQuotationController';
    dispatch({
      type: `inquiryHall/${API}`,
      payload: {
        page,
        ...params,
        indicateLevel: 'TWO',
        templateEleDetailFlag: 1, // 模板评分要素下的评分要素细项标志
        sourceIndicateId: elementRecord.indicateId,
        ...this.renderQueryParams(elementRecord),
      },
    });
  }

  /**
   * 新建行---【屈臣氏】二开寻源过程控制-询价要求-评分要素-评分要素细项弹框
   */
  @Bind()
  handleCreateRows() {
    const { dispatch, inquiryHall = {}, elementRecord = {}, header = {} } = this.props;
    const { rowKey, dataListName, pagination } = this.state;
    const scoreIndicAdjustFields = [
      'indicateCode',
      'indicateName',
      'remark',
      'weight',
      'minScore',
      'maxScore',
      'defaultScore',
    ].join(',');

    dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        [dataListName]: [
          {
            [rowKey]: uuidv4(),
            indicateLevel: 'TWO',
            _status: 'create',
            ...this.renderQueryParams(elementRecord),
            weight: ['SCORE', 'SCORE_NEW'].includes(header.templateScoreType) ? 100 : '',
            minScore: header.templateScoreType === 'WEIGHT' ? 0 : '',
            maxScore: header.templateScoreType === 'WEIGHT' ? 100 : '',
            scoreIndicAdjustFields,
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
        type: 'inquiryHall/deleteScoreDetailLevelTwoOfQuotationController',
        payload: {
          data: selectedRowKeys,
          organizationId,
        },
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
    } = this.props;
    const { rowKey, dataListName } = this.state;
    let newDataList = getEditTableData(inquiryHall[dataListName], [rowKey]);
    newDataList = newDataList.map((item) => {
      if (!item) {
        return;
      }

      return {
        ...item,
      };
    });

    if (readonly) {
      onHideModal();
      return;
    }

    if (isEmpty(newDataList)) return;
    const saveData = {
      ...elementRecord,
      evaluateIndicAdjustId:
        elementRecord._status === 'update' ? elementRecord.evaluateIndicAdjustId : undefined,
      ...this.renderQueryParams(elementRecord),
      scoreIndicateList: newDataList,
    };
    dispatch({
      type: 'inquiryHall/updateScoreDetailLevelTwoOfQuotationController',
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
            type: 'bidHall/fetchScoreDetailLevelTwoOfQuotationController',
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

  updateAdjustField = (record = {}, name = '', value) => {
    const { $form = {}, sourceScoreIndic = {} } = record;
    const { getFieldValue, setFieldsValue } = $form;
    const min = getFieldValue('minScore');
    const max = getFieldValue('maxScore');
    if (name === 'minScore') {
      setFieldsValue({ [name]: value, maxScore: max });
    } else if (name === 'maxScore') {
      setFieldsValue({ [name]: value, minScore: min });
    }
    if (!name || record._status === 'create') {
      return;
    }

    const oldFields = getFieldValue('scoreIndicAdjustFields') || '';
    let newFields = oldFields.split(',').filter(Boolean);

    const currentIndex = oldFields.indexOf(name);
    const currentValue = getFieldValue(name) ?? null;
    const pristineValue = (sourceScoreIndic || {})[name];
    // eslint-disable-next-line eqeqeq
    if (currentIndex > -1 && currentValue == pristineValue) {
      newFields.splice(currentIndex, 1);
    } else if (!newFields.includes(name)) {
      newFields.push(name);
    }

    newFields = newFields.join(',');
    setFieldsValue({
      scoreIndicAdjustFields: newFields,
    });
  };

  render() {
    const {
      loading,
      visible,
      inquiryHall = {},
      save,
      deleting,
      readonly = false,
      header,
      custKey,
      customizeTable,
      closable = true, // 是否显示右上角的关闭按钮
      remote,
      bidFlag,
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
          const commontProps = {
            value: val,
            record,
            name: 'indicateCode',
            historyDTO: 'sourceScoreIndic',
          };
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;

            return (
              <Form.Item>
                <HistoryRenderPureHzero {...commontProps}>
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
                      onChange={() => this.updateAdjustField(record, 'indicateCode')}
                    />
                  )}
                  {getFieldDecorator('sourceScoreIndic', { initialValue: null })(<span />)}
                </HistoryRenderPureHzero>
              </Form.Item>
            );
          } else {
            return (
              <HistoryRenderPureHzero {...commontProps} readonly>
                {val}
              </HistoryRenderPureHzero>
            );
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
          const commontProps = {
            value: val,
            record,
            name: 'indicateName',
            historyDTO: 'sourceScoreIndic',
          };
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                <HistoryRenderPureHzero {...commontProps}>
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
                    <TLEditor
                      label={intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.indicateDetailName`)
                        .d('评分要素细项名称')}
                      field="indicateName"
                      token={record._token}
                      onChange={() => this.updateAdjustField(record, 'indicateName')}
                    />
                  )}
                </HistoryRenderPureHzero>
                {getFieldDecorator('scoreIndicAdjustFields')(<div />)}
                {getFieldDecorator('tenantId', {
                  initialValue: record.tenantId,
                })(<div />)}
              </Form.Item>
            );
          } else {
            return (
              <HistoryRenderPureHzero {...commontProps} readonly>
                {val}
              </HistoryRenderPureHzero>
            );
          }
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.elements.remark`).d('评分细则'),
        dataIndex: 'remark',
        width: 150,
        render: (val, record) => {
          const commontProps = {
            value: val,
            record,
            name: 'remark',
            historyDTO: 'sourceScoreIndic',
          };
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                <HistoryRenderPureHzero {...commontProps}>
                  {getFieldDecorator('remark', {
                    initialValue: record.remark,
                  })(
                    <TextArea
                      autosize={{ maxRows: 5 }}
                      defaultValue={record.remark}
                      disabled={readonly}
                      onChange={() => this.updateAdjustField(record, 'remark')}
                    />
                  )}
                </HistoryRenderPureHzero>
              </Form.Item>
            );
          } else {
            return (
              <HistoryRenderPureHzero {...commontProps} readonly>
                {val}
              </HistoryRenderPureHzero>
            );
          }
        },
      },
      !['SCORE', 'SCORE_NEW'].includes(header.templateScoreType)
        ? {
            title: <span>{intl.get(`ssrc.inquiryHall.model.inquiryHall.weight`).d('权重')}%</span>,
            dataIndex: 'weight',
            width: 100,
            render: (val, record) => {
              const commontProps = {
                value: val,
                record,
                name: 'weight',
                historyDTO: 'sourceScoreIndic',
              };
              if (['update', 'create'].includes(record._status)) {
                const { getFieldDecorator } = record.$form;
                return (
                  <Form.Item>
                    <HistoryRenderPureHzero {...commontProps}>
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
                          onChange={() => this.updateAdjustField(record, 'weight')}
                        />
                      )}
                    </HistoryRenderPureHzero>
                  </Form.Item>
                );
              } else {
                return (
                  <HistoryRenderPureHzero {...commontProps} readonly>
                    {val}
                  </HistoryRenderPureHzero>
                );
              }
            },
          }
        : null,
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.minScore`).d('最低分'),
        dataIndex: 'minScore',
        width: 100,
        render: (val, record) => {
          const commontProps = {
            value: val,
            record,
            name: 'minScore',
            historyDTO: 'sourceScoreIndic',
          };
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            return (
              <Form.Item>
                <HistoryRenderPureHzero {...commontProps}>
                  {getFieldDecorator('minScore', {
                    initialValue: record.minScore,
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
                          ? remote.process(
                              'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_TWO_ELEMENT_MIN_SCORE_MIN_VALUE',
                              0,
                              {
                                bidFlag,
                              }
                            )
                          : 0
                      }
                      max={9999999999}
                      onChange={(value) => this.updateAdjustField(record, 'minScore', value)}
                    />
                  )}
                </HistoryRenderPureHzero>
              </Form.Item>
            );
          } else {
            return (
              <HistoryRenderPureHzero {...commontProps} readonly>
                {val}
              </HistoryRenderPureHzero>
            );
          }
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.maxScore`).d('最高分'),
        dataIndex: 'maxScore',
        width: 100,
        render: (val, record) => {
          const commontProps = {
            value: val,
            record,
            name: 'maxScore',
            historyDTO: 'sourceScoreIndic',
          };
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            return (
              <Form.Item>
                <HistoryRenderPureHzero {...commontProps}>
                  {getFieldDecorator('maxScore', {
                    initialValue: record.maxScore,
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
                      max={99999999}
                      disabled={readonly}
                      onChange={(value) => this.updateAdjustField(record, 'maxScore', value)}
                    />
                  )}
                </HistoryRenderPureHzero>
              </Form.Item>
            );
          } else {
            return (
              <HistoryRenderPureHzero {...commontProps} readonly>
                {val}
              </HistoryRenderPureHzero>
            );
          }
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.defaultScore`).d('缺省分'),
        dataIndex: 'defaultScore',
        width: 100,
        render: (val, record) => {
          const commontProps = {
            value: val,
            record,
            name: 'defaultScore',
            historyDTO: 'sourceScoreIndic',
          };
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                <HistoryRenderPureHzero {...commontProps}>
                  {getFieldDecorator('defaultScore', {
                    initialValue: record.defaultScore,
                  })(
                    <InputNumber
                      style={{ width: '100%' }}
                      precision={2}
                      min={0}
                      max={99999999}
                      disabled={readonly}
                      onChange={() => this.updateAdjustField(record, 'defaultScore')}
                    />
                  )}
                </HistoryRenderPureHzero>
              </Form.Item>
            );
          } else {
            return (
              <HistoryRenderPureHzero {...commontProps} readonly>
                {val}
              </HistoryRenderPureHzero>
            );
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
      onChange: this.onSelectChange,
      getCheckboxProps: (record) => ({
        disabled: record._status === 'create',
      }),
    };
    return (
      <React.Fragment>
        <Drawer
          destroyOnClose
          width="1090px"
          visible={visible}
          // onOk={this.handleSaveRows}
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
                header.templateScoreType === 'WEIGHT'
                  ? `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.WEIGHT_TABLE`
                  : `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SCORE_TABLE`,
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
          </div>
        </Drawer>
      </React.Fragment>
    );
  }
}

const HOCComponent = (Com) => {
  return withCustomize({
    unitCode: [
      'SSRC.QUOTATION_CONTROLLER_DETAIL.WEIGHT_TABLE', // 询价要求-评分要素-评分要素细项-权重法
      'SSRC.QUOTATION_CONTROLLER_DETAIL.SCORE_TABLE', // 询价要求-评分要素-评分要素细项-二分法
    ],
  })(
    connect(({ inquiryHall, bidHall, loading }) => ({
      inquiryHall,
      bidHall,
      loading: loading.effects['inquiryHall/fetchScoreDetailLevelTwoOfQuotationController'],
      save: loading.effects['inquiryHall/updateScoreDetailLevelTwoOfQuotationController'],
      deleting: loading.effects['inquiryHall/deleteDetail'],
    }))(Com)
  );
};

export default HOCComponent(ScoreEleDetailModal);
export { ScoreEleDetailModal, HOCComponent };
