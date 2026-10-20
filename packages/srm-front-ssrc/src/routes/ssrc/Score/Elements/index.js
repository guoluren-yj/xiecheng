/**
 * ElementTable - 评分要素定义
 * @date: 2019-01-21
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
// import uuidv4 from 'uuid/v4';
import { Form, Input, Select, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { withRouter } from 'react-router';
import { isEmpty, noop } from 'lodash';
import remoteHoc from 'hzero-front/lib/utils/remote';

import intl from 'utils/intl';
import { delItemToPagination, filterNullValueObject } from 'utils/utils';
import { enableRender, valueMapMeaning } from 'utils/renderer';
import notification from 'utils/notification';
import TLEditor from 'components/TLEditor';
import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';

import { scoreFormulaRender } from '@/utils/renderer';
import RemarkModal from './RemarkModal';
import ManualReModal from './ManualReModal';
import FilterForm from './FilterForm';

const promptCode = 'ssrc.score';
const { TextArea } = Input;

/**
 * 评分要素定义
 * @extends {Component} - PureComponent
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */

class ElementsTable extends PureComponent {
  constructor(props) {
    super(props);
    const { onBindSearch } = props;
    if (onBindSearch) onBindSearch(this.handleSearchElements);

    this.initQueryTimer = null;

    this.state = {
      rowKey: 'indicateId',
      dataListName: 'elementsList',
      pagination: 'elementsPagination',
      remarkVisible: false, //  评分细则Modal
      remarkRecord: {}, // 评分细则
      manualRemarkModal: false, // 手动评分细则
    };
  }

  componentDidMount() {
    const {
      dispatch,
      // score: { elementsPagination = {} },
    } = this.props;
    this.queryTableData();
    const lovCodes = {
      indicateType: 'SSRC.INDICATE_TYPE', // 评分要素类型
      calculateType: 'SSRC.CALCULATE_TYPE', // 计算方式
      scoreType: 'SSRC.SCORE_TYPE', // 评分类型
      benchmarkPriceMethod: 'SSRC.BENCHMARK_PRICE_METHOD',
      formula: 'SSRC.INDIC_FORMULA',
    };
    dispatch({
      type: 'score/batchCode',
      payload: { lovCodes },
    });
  }

  componentDidUpdate() {
    // if (prevProps.custLoading && !this.props.custLoading) {
    //   // 这时this.props.form.getFormFieldsValue()可以拿到正确值
    //   // 注意去掉原来didmount中的查询，并在此处做初始查询逻辑
    //   // 注意控制查询次数，避免死循环
    //   this.queryTableData();
    // }
  }

  componentWillUnmount() {
    this.clearInitQueryTimer();
  }

  clearInitQueryTimer = () => {
    clearTimeout(this.initQueryTimer);
  };

  /**
   * 初次查询，需要获取到个性化的默认值，但是历史和写法和设计，多tab不能保证
   * 所以延迟查询，确保可以获取到个性化值
   *
   * 需要在调用customizeFilterForm的组件中，增加componentDidUpdate函数，个性化初始化完成的判断通过后才可以获取到正确值
   */
  queryTableData = () => {
    const { score: { elementsPagination = {} } = {} } = this.props;

    this.initQueryTimer = setTimeout(() => this.handleSearchElements(elementsPagination), 200);

    // this.handleSearchElements(elementsPagination);
  };

  /**
   * 查询评分模板定义
   * @param {Object} page
   */
  @Bind()
  handleSearchElements(page = {}) {
    const { dispatch } = this.props;
    const form = this.filterForm;
    const filterValues = form ? filterNullValueObject(form.getFieldsValue()) : {};

    dispatch({
      type: 'score/fetchElements',
      payload: {
        indicateLevel: 'ONE',
        page,
        customizeUnitCode:
          'SSRC.SCORE_TEMPLATE.SCORE_ELEMENT_LIST,SSRC.SCORE_TEMPLATE.SCORE_ELEMENT_FILTER',
        ...filterValues,
      },
    });
  }

  /**
   * 删除新建行
   */
  @Bind()
  deleteRow(record) {
    const { dispatch, score = {} } = this.props;
    const { rowKey, dataListName, pagination } = this.state;
    const newDataList = score[dataListName].filter((item) => item[rowKey] !== record[rowKey]);
    dispatch({
      type: 'score/updateState',
      payload: {
        [dataListName]: newDataList,
        [pagination]: delItemToPagination(score[dataListName].length, score[pagination]),
      },
    });
  }

  /**
   * 取消编辑行
   */
  @Bind()
  cancelRow(record) {
    const { dispatch, score = {} } = this.props;
    const { rowKey, dataListName } = this.state;
    const newDataList = score[dataListName].map((item) => {
      if (item[rowKey] === record[rowKey]) {
        const { _status, ...other } = item;
        return other;
      } else {
        return item;
      }
    });
    dispatch({
      type: 'score/updateState',
      payload: { [dataListName]: newDataList },
    });
  }

  /**
   * 编辑行
   */
  @Bind()
  editRow(record) {
    const { dispatch, score = {} } = this.props;
    const { rowKey, dataListName } = this.state;
    const newDataList = score[dataListName].map((item) =>
      record[rowKey] === item[rowKey] ? { ...item, _status: 'update' } : item
    );
    dispatch({
      type: 'score/updateState',
      payload: { [dataListName]: newDataList },
    });
  }

  /**
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.filterForm = ref.props.form;
  }

  /**
   * 跳转到评分要素细项
   */
  @Bind()
  handleJumpElementsDetails(record) {
    if (isEmpty(record)) return;
    // 新增跳转
    const indicateId = record._status === 'create' ? 'create' : record.indicateId;
    // 新增/可编辑一级评分要素跳转
    if (record._status === 'create' || record._status === 'update') {
      record.$form.validateFields((err, values) => {
        if (!err) {
          sessionStorage.setItem('query', JSON.stringify({ ...record, ...values }));
          this.props.history.push({
            pathname: `/ssrc/score/elements/detail/${indicateId}`,
          });
        } else {
          notification.warning({
            message: intl
              .get(`ssrc.score.view.notification.jumpDetail.fail`)
              .d('进入评分要素细项页面失败，请填写未填写项！'),
          });
        }
      });
    } else {
      // 列表形态一级评分要素跳转
      sessionStorage.setItem('query', JSON.stringify(record));
      this.props.history.push({
        pathname: `/ssrc/score/elements/detail/${indicateId}`,
      });
    }
  }

  /**
   * 改变要素类型 - 设置启用评分要素细项
   */
  @Bind()
  changeIndicateType(value, record) {
    if (value === 'PASS' || record.$form.getFieldValue('detailEnabledFlag') === 1) {
      record.$form.setFieldsValue({ detailEnabledFlag: 0 });
    }
    if (value === 'PASS') {
      record.$form.setFieldsValue({
        calculateType: null,
        scoreType: null,
      });
    }
  }

  // 打开评分细则
  @Bind()
  handOpenRemark(record) {
    if (record.$form.getFieldValue('calculateType') === 'AUTO') {
      this.setState({
        remarkVisible: true,
        remarkRecord: record,
      });
    } else {
      this.setState({
        manualRemarkModal: true,
        remarkRecord: record,
      });
    }
  }

  // 关闭评分信则
  @Bind()
  closeRemarkModal() {
    this.setState({
      remarkVisible: false,
      manualRemarkModal: false,
      remarkRecord: {},
    });
  }

  @Bind()
  renderScoreFormulaRender(scoreIndicDetail) {
    const { remote: { event } = {} } = this.props;
    let value;
    const scoreFormula = (params = {}) => {
      const { customizeRenderFn = noop, ...otherParams } = params;
      value = customizeRenderFn(otherParams);
    };
    const eventProps = {
      scoreIndicDetail,
      scoreFormula,
      customizeRenderFn: scoreFormulaRender,
    };
    if (event) {
      event.fireEvent('handleScoreFormulaRender', eventProps);
      return value;
    } else {
      return scoreFormulaRender(scoreIndicDetail);
    }
  }

  /**
   *  此方法被 [绝味] 重写
   * @protected
   */
  // 保存Modal信息
  @Bind()
  onChangeRemarkModal(record) {
    const { dispatch, score = {}, remote } = this.props;
    const { rowKey, dataListName } = this.state;
    const { scoreCode: { benchmarkPriceMethod = [], formula = [] } = {} } = score || {};
    const { scoreIndicDetail = [] } = record;
    const priceDesc = `${intl
      .get('ssrc.score.model.score.bPEmethod')
      .d('基准价计算方法')}:${valueMapMeaning(
      benchmarkPriceMethod,
      scoreIndicDetail.benchmarkPriceMethod
    )}, ${
      scoreIndicDetail.benchmarkPriceMethod === 'LOWEST_PRICE'
        ? `${intl.get('ssrc.score.model.score.basePrice').d('基准价=有效最低价')}`
        : scoreIndicDetail.benchmarkPriceMethod === 'HIGH_PRICE'
        ? intl.get('ssrc.score.model.score.baseHighPrice').d('基准价=有效最高价')
        : `${intl.get('ssrc.score.model.score.aVTP').d('基准价=有效投标价格平均值*')}${
            scoreIndicDetail?.benchmarkPriceFactor || scoreIndicDetail?.benchmarkPriceFactor === 0
              ? scoreIndicDetail?.benchmarkPriceFactor
              : 100
          }${intl.get('ssrc.score.model.score.percentSign').d('%')}`
    }`;
    const benchmarkPriceDetail = remote
      ? remote.process('SSRC_SCORE_ELEMENTS_REMARK_PROCESS_BENCH_MARK_PRICE_DESC', priceDesc, {
          record,
          valueMapMeaning,
          scoreIndicDetail,
          benchmarkPriceMethod,
        })
      : priceDesc;
    // 有效报价供应商≥ []家时，去除最低/最高报价计算投标价格平均值
    const enableRemoveExtremesDesc = scoreIndicDetail.enableRemoveExtremes
      ? intl
          .get('ssrc.score.model.score.enableRemoveExtremesDesc', {
            limitSupplierQuantity: scoreIndicDetail.limitSupplierQuantity,
          })
          .d(
            '（有效报价供应商 ≥ {limitSupplierQuantity}家时，去除最低/最高报价计算投标价格平均值），'
          )
      : '';

    // 价格计算公式描述
    const calculateRuleDesc = `${intl
      .get('ssrc.score.model.score.priceCFormula')
      .d('价格计算公式')}:${valueMapMeaning(formula, scoreIndicDetail.formula)}`;
    const formulaDetail = `${calculateRuleDesc}, ${
      this.renderScoreFormulaRender(scoreIndicDetail) || ''
    }`;

    // 线性映射法计算方式
    const linearMappingNotice = `${intl
      .get('ssrc.score.model.score.linearMapping.calculateHelp')
      .d(
        '供应商报价得分=最低分+[(最高价-供应商报价)/(最高价-最低价)]*(最高分-最低分)'
      )}，${intl
      .get('ssrc.score.model.score.linearMapping.note')
      .d(
        '注：最高分、最低分取自单据中要素行上维护的分数。当评分方式=权重法时，最低分默认为0，最高分默认为100。'
      )}`;

    // 评分细则行文本显示
    const scoreRuleDesc =
      scoreIndicDetail.formula === 'LINEAR_MAPPING'
        ? `${calculateRuleDesc}, ${linearMappingNotice || ''}`
        : `${benchmarkPriceDetail}${enableRemoveExtremesDesc}${formulaDetail}`;

    const remark =
      record.$form.getFieldValue('calculateType') === 'AUTO'
        ? scoreRuleDesc
        : `${scoreIndicDetail.remark}`;
    const newDataList = score[dataListName].map((item) =>
      record[rowKey] === item[rowKey] ? { ...item, ...record, remark } : item
    );
    record.$form.setFieldsValue({
      remark,
    });
    dispatch({
      type: 'score/updateState',
      payload: { [dataListName]: newDataList },
    });
  }

  // 修改计算方式
  @Bind()
  handleChangeCal(val, record) {
    if (val === 'MANUAL') {
      record.$form.setFieldsValue({
        scoreType: null,
        remark: null,
        calculateType: val,
      });
    } else {
      record.$form.setFieldsValue({
        detailEnabledFlag: 0,
        calculateType: val,
        remark: null,
      });
    }
  }

  @Bind()
  renderRemarkModal(remarkModalProps) {
    return <RemarkModal {...remarkModalProps} />;
  }

  render() {
    const {
      loading,
      score = {},
      score: {
        elementsList = [],
        scoreCode: { indicateType = [], calculateType = [], scoreType = [] } = {},
      } = {},
      customizeTable = noop,
      customizeFilterForm,
      remote,
    } = this.props;
    const {
      rowKey,
      pagination,
      remarkVisible = false,
      manualRemarkModal = false,
      remarkRecord = {},
    } = this.state;
    const filterProps = {
      onSearch: this.handleSearchElements,
      onRef: this.handleBindRef,
      customizeFilterForm,
    };

    const columns = [
      {
        title: intl.get(`${promptCode}.model.score.indicateCode`).d('评分要素编码'),
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
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.model.score.indicateCode`).d('评分要素编码'),
                      }),
                    },
                    {
                      max: 30,
                      message: intl.get('hzero.common.validation.max', {
                        max: 30,
                      }),
                    },
                  ],
                })(
                  <Input
                    disabled={record._status === 'update'}
                    typeCase="upper"
                    inputChinese={false}
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
        title: intl.get(`${promptCode}.model.score.indicateName`).d('评分要素名称'),
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
                        name: intl.get(`${promptCode}.model.score.indicateName`).d('评分要素名称'),
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
                    label={intl.get(`${promptCode}.model.score.indicateName`).d('评分要素名称')}
                    field="indicateName"
                    token={record._token}
                  />
                )}
              </Form.Item>
            );
          } else {
            return (
              <Tooltip title={val} placement="topLeft">
                <span>{val}</span>
              </Tooltip>
            );
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.score.indicateType`).d('评分要素类型'),
        dataIndex: 'indicateTypeMeaning',
        width: 150,
        render: (val, record) => {
          return record._status === 'create' || record._status === 'update' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('indicateType', {
                initialValue: record.indicateType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.score.indicateType`).d('评分要素类型'),
                    }),
                  },
                ],
              })(
                <Select
                  style={{ width: '100px' }}
                  disabled={record._status === 'update'}
                  onChange={(selectValue) => this.changeIndicateType(selectValue, record)}
                >
                  {indicateType &&
                    indicateType.map((item) => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                </Select>
              )}
              {record.$form.getFieldDecorator('indicateTypeMeaning', {
                initialValue: record.indicateTypeMeaning,
              })(<div />)}
            </Form.Item>
          ) : (
            val
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.score.calculateType`).d('计算方式'),
        dataIndex: 'calculateType',
        width: 130,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('calculateType', {
                  initialValue:
                    getFieldValue('indicateType') === 'SCORE' ? record.calculateType : null,
                  rules: [
                    {
                      required: getFieldValue('indicateType') === 'SCORE',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.model.score.calculateType`).d('计算方式'),
                      }),
                    },
                  ],
                })(
                  <Select
                    onChange={(e) => this.handleChangeCal(e, record)}
                    disabled={record.$form.getFieldValue('indicateType') !== 'SCORE'}
                    style={{ width: '100%' }}
                  >
                    {calculateType.map((item) => (
                      <Select.Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
                {record.$form.getFieldDecorator('calculateTypeMeaning', {
                  initialValue: record.calculateTypeMeaning,
                })(<div />)}
              </Form.Item>
            );
          } else {
            return record.calculateTypeMeaning;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.score.scoreType`).d('评分类型'),
        dataIndex: 'scoreType',
        width: 120,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('scoreType', {
                  initialValue:
                    getFieldValue('indicateType') === 'SCORE' &&
                    getFieldValue('calculateType') === 'AUTO'
                      ? record.scoreType
                      : null,
                  rules: [
                    {
                      required:
                        getFieldValue('indicateType') === 'SCORE' &&
                        getFieldValue('calculateType') === 'AUTO',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.model.score.ratingType`).d('评分类型'),
                      }),
                    },
                  ],
                })(
                  <Select
                    disabled={
                      !(
                        getFieldValue('indicateType') === 'SCORE' &&
                        getFieldValue('calculateType') === 'AUTO'
                      )
                    }
                    style={{ width: '100%' }}
                  >
                    {scoreType.map((item) => (
                      <Select.Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
                {record.$form.getFieldDecorator('scoreTypeMeaning', {
                  initialValue: record.scoreTypeMeaning,
                })(<div />)}
              </Form.Item>
            );
          } else {
            return record.scoreTypeMeaning;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.score.elements.remark`).d('评分细则'),
        dataIndex: 'remark',
        width: 120,
        render: (val, record) => {
          const renderRemarkDom = () => {
            if (['update', 'create'].includes(record._status)) {
              return record.$form.getFieldValue('calculateType') === 'AUTO' &&
                record.$form.getFieldValue('scoreType') === 'PRICE' ? (
                  <Form.Item>
                    {record.$form.getFieldDecorator('remark', {
                    initialValue: record.remark,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${promptCode}.model.score.remark`).d('评分细则'),
                        }),
                      },
                    ],
                  })(<Input.Search readOnly onSearch={() => this.handOpenRemark(record)} />)}
                  </Form.Item>
              ) : (
                <Form.Item>
                  {record.$form.getFieldDecorator('remark', {
                    initialValue: record.remark,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${promptCode}.model.score.remark`).d('评分细则'),
                        }),
                      },
                    ],
                  })(<TextArea autosize={{ maxRows: 5 }} />)}
                </Form.Item>
              );
            } else {
              return (
                <Tooltip
                  placement="topLeft"
                  popupStyle={{
                    whiteSpace: 'pre-wrap',
                    minWidth: '400',
                  }}
                  title={() => <span>{val}</span>}
                >
                  {val}
                </Tooltip>
              );
            }
          };

          if (!remote) return renderRemarkDom();
          return remote.render('SSRC_SCORE_ELEMENTS_RENDER_REMARK', renderRemarkDom(), {
            val,
            record,
          });
        },
      },
      {
        title: intl.get(`${promptCode}.model.score.detailEnabledFlag`).d('启用评分要素细项'),
        dataIndex: 'detailEnabledFlag',
        width: 120,
        align: 'center',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('detailEnabledFlag', {
                  initialValue: record.detailEnabledFlag,
                })(
                  <Checkbox
                    disabled={
                      getFieldValue('indicateType') === 'PASS' ||
                      (getFieldValue('calculateType') === 'AUTO' &&
                        getFieldValue('indicateType') === 'SCORE')
                    }
                  />
                )}
              </Form.Item>
            );
          } else {
            return enableRender(val);
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.score.elements.detail`).d('评分要素细项'),
        dataIndex: 'elementsDetail',
        width: 140,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldValue } = record.$form;
            return (
              <a
                disabled={
                  getFieldValue('indicateType') === 'PASS' ||
                  getFieldValue('detailEnabledFlag') === 0
                }
                onClick={() => this.handleJumpElementsDetails(record)}
              >
                {intl.get(`${promptCode}.model.score.elements.detail`).d('评分要素细项')}
              </a>
            );
          } else {
            return (
              <a
                disabled={record.indicateType === 'PASS' || record.detailEnabledFlag === 0}
                onClick={() => this.handleJumpElementsDetails(record)}
              >
                {intl.get(`${promptCode}.model.score.elements.detail`).d('评分要素细项')}
              </a>
            );
          }
        },
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        align: 'center',
        width: 100,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('enabledFlag', {
                  initialValue: record.enabledFlag,
                })(<Checkbox />)}
              </Form.Item>
            );
          } else {
            return enableRender(val);
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'center',
        dataIndex: 'edit',
        width: 90,
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
            ) : record._status === 'update' ? (
              <a
                onClick={() => {
                  this.cancelRow(record);
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            ) : (
              <a
                onClick={() => {
                  this.editRow(record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </span>
        ),
      },
    ];

    const remarkModalProps = {
      remote,
      visible: remarkVisible,
      record: remarkRecord,
      elementsList,
      onHideModal: this.closeRemarkModal,
      onChangeRemarkModal: this.onChangeRemarkModal,
    };
    const manualReModalProps = {
      visible: manualRemarkModal,
      record: remarkRecord,
      elementsList,
      onHideModal: this.closeRemarkModal,
      onChangeRemarkModal: this.onChangeRemarkModal,
    };
    return (
      <React.Fragment>
        <div className="table-list-search">
          <FilterForm {...filterProps} />
        </div>
        {customizeTable(
          {
            code: 'SSRC.SCORE_TEMPLATE.SCORE_ELEMENT_LIST',
          },
          <EditTable
            bordered
            loading={loading}
            rowKey={rowKey}
            dataSource={elementsList}
            columns={columns}
            pagination={score[pagination]}
            onChange={this.handleSearchElements}
          />
        )}
        {remarkVisible && this.renderRemarkModal(remarkModalProps)}
        <ManualReModal {...manualReModalProps} />
      </React.Fragment>
    );
  }
}

const hocElementsTable = (NewComponent) => {
  return connect(({ score, loading }) => ({
    score,
    loading: loading.effects['score/fetchElements'],
  }))(
    withRouter(
      remoteHoc(
        {
          code: 'SSRC_SCORE_ELEMENTS',
          name: 'remote',
        },
        {
          events: {
            handleScoreFormulaRender(props = {}) {
              const {
                scoreIndicDetail = {},
                scoreFormula = noop,
                customizeRenderFn = noop,
              } = props;
              const params = {
                ...scoreIndicDetail,
                customizeRenderFn,
              };
              scoreFormula(params);
            },
            handleBPriceMethodOnChange() {},
          },
        }
      )(NewComponent)
    )
  );
};

export default hocElementsTable(ElementsTable);
export { ElementsTable, hocElementsTable };
