import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Form, InputNumber, Select, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import qs from 'querystring';
import uuidv4 from 'uuid/v4';
import { isEmpty } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { observer } from 'mobx-react';
import remoteHoc from 'hzero-front/lib/utils/remote';

import { Header, Content } from 'components/Page';
import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';
import intl from 'utils/intl';
import { delItemToPagination, addItemsToPagination, getEditTableData } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { enableRender, valueMapMeaning } from 'utils/renderer';

import { scoreFormulaRender } from '@/utils/renderer';
import FilterForm from '../Elements/FilterForm';
import ModalTable from './ModalTable';
import DetailModal from './DetailModal';
import RemarkModal from './RemarkModal';
import ManualReModal from './ManualReModal';

const promptCode = 'ssrc.score';
class ElementsDetail extends Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { templateId },
      },
      history: {
        location: { search = {} },
      },
    } = props;
    const routerParams = qs.parse(search.substr(1));
    this.state = {
      rowKey: 'tmplAssignId',
      dataListName: 'elementsDetailList',
      pagination: 'elementsDetailPagination',
      modalVisible: false,
      templateId,
      expertCategory: routerParams.expertCategory,
      indicateType: routerParams.indicateType,
      templatePurpose: routerParams.templatePurpose,
      scoreMode: routerParams.scoreMode,
      scoreTemplateScoreType: routerParams.scoreTemplateScoreType,
      selectedRowKeys: [],
      detailModalVisible: false, // 评分要素细项显隐
      elementRecord: {}, // 评分要素
      remarkVisible: false, //  评分细则Modal
      remarkRecord: {}, // 评分细则
      manualRemarkModal: false,
    };
  }

  componentDidMount() {
    const {
      score: { elementsDetailPagination = {} },
      dispatch,
    } = this.props;
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
    this.handleSearchDetail(elementsDetailPagination);
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'score/updateState',
      payload: {
        elementsDetailList: [],
        elementsDetailPagination: {},
      },
    });
  }

  /**
   * 查询评分模板定义
   * @param {Object} page
   */
  @Bind()
  handleSearchDetail(page = {}) {
    const { dispatch } = this.props;
    const { templateId, expertCategory } = this.state;
    const form = this.filterForm;
    const filterValues = form ? form.getFieldsValue() : {};
    dispatch({
      type: 'score/fetchDetail',
      payload: {
        page,
        templateId,
        expertCategory,
        ...filterValues,
        customizeUnitCode: 'SSRC.SCORE_TEMPLATE.TMPL_ASSIGN',
      },
    });
  }

  /**
   * 新建行
   */
  @Bind()
  handleCreateRows(rows = []) {
    const { dispatch, score = {} } = this.props;
    const {
      rowKey,
      dataListName,
      expertCategory,
      templateId,
      pagination,
      templatePurpose,
      scoreMode,
      scoreTemplateScoreType,
    } = this.state;
    const dataList = rows.map((item) => {
      const { _token, ...other } = item;
      return templatePurpose === 'EXPERT_SCORE' &&
        scoreMode === 'DIFF' &&
        scoreTemplateScoreType === 'WEIGHT'
        ? {
            ...other,
            maxScore: '', // 100
            minScore: '', // 0
            expertCategory,
            templateId,
            [rowKey]: uuidv4(),
            _status: 'create',
          }
        : {
            ...other,
            expertCategory,
            templateId,
            [rowKey]: uuidv4(),
            _status: 'create',
          };
    });
    const newDataList = [...dataList, ...score[dataListName]];
    // const newPagination = {...addItemToPagination(newDataList.length, score[pagination]), total: newDataList.length};
    dispatch({
      type: 'score/updateState',
      payload: {
        [dataListName]: newDataList,
        [pagination]: addItemsToPagination(
          dataList.length,
          score[dataListName].length,
          score[pagination]
        ),
      },
    });
    this.setState({ modalVisible: false });
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
   * 保存
   * 屈臣氏二开重写
   */
  @Bind()
  handleSave() {
    const { dispatch, score } = this.props;
    const {
      rowKey,
      dataListName,
      pagination,
      // indicateType,
      templatePurpose,
      scoreMode,
      scoreTemplateScoreType,
    } = this.state;
    // 先验证行内编辑
    const newDataList = getEditTableData(score[dataListName], [rowKey]).map((item) =>
      templatePurpose === 'EXPERT_SCORE' &&
      scoreMode === 'DIFF' &&
      ['SCORE', 'SCORE_NEW'].includes(scoreTemplateScoreType)
        ? { ...item, weight: 100 }
        : item
    );
    if (isEmpty(newDataList)) return;
    // let remoteWeightSum = 0;
    // if (score[dataListName].filter((item) => !item._status)) {
    //   remoteWeightSum = sumBy(
    //     score[dataListName].filter((item) => !item._status && item.enabledFlag),
    //     'weight'
    //   );
    // }
    // 当【模板用途】为专家评分，【评分方式】为分值法，【评分模式】为区分时,默认各评分要素权重为100，隐藏权重字段
    // const testFlag = scoreTemplateScoreType === 'SCORE';

    // if (
    //   remoteWeightSum +
    //     sumBy(
    //       newDataList.filter((item) => item.enabledFlag),
    //       'weight'
    //     ) ===
    //     100 ||
    //   indicateType === 'PASS' ||
    //   testFlag ||
    //   newDataList.every((item) => item.indicateType === 'PASS')
    // ) {
    dispatch({
      type: 'score/saveDetail',
      payload: {
        newDataList,
        customizeUnitCode: 'SSRC.SCORE_TEMPLATE.TMPL_ASSIGN',
      },
    }).then((res) => {
      if (res) {
        notification.success();
        dispatch({
          type: 'score/updateState',
          payload: {
            elementsDetailList: [],
            elementsDetailPagination: {},
          },
        });
        this.handleSearchDetail(score[pagination]);
      }
    });
    // } else {
    //   notification.warning({
    //     message: intl
    //       .get('ssrc.score.view.notification.weight.scoreSum')
    //       .d('保存失败，请保持评分要素权重之和为100！'),
    //   });
    // }
  }

  /**
   * 删除
   */
  @Bind()
  handleDelete() {
    const {
      dispatch,
      score: { elementsDetailPagination },
    } = this.props;
    const { selectedRowKeys } = this.state;
    dispatch({
      type: 'score/deleteDetail',
      payload: selectedRowKeys,
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({ selectedRowKeys: [] });
        this.handleSearchDetail(elementsDetailPagination);
      }
    });
  }

  /**
   * 保存选中的行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows 行数据
   */
  @Bind()
  onSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  /**
   * 控制modal显隐
   */
  @Bind()
  handleModalShow() {
    this.setState({ modalVisible: true });
  }

  /**
   * 控制modal显隐
   */
  @Bind()
  handleModalHide() {
    this.setState({ modalVisible: false });
  }

  /**
   * 要素细项-显隐
   */
  @Bind()
  handleDetailModalShow(record) {
    if (isEmpty(record)) return;
    // 可编辑一级评分要素
    if (record._status === 'create' || record._status === 'update') {
      record.$form.validateFields((err, values) => {
        if (!err) {
          this.setState({
            detailModalVisible: true,
            elementRecord: { ...record, ...values },
          });
        } else {
          notification.warning({
            message: intl
              .get(`ssrc.score.view.notification.openDetail.fail`)
              .d('打开评分要素细项弹框失败，请填写未填写项！'),
          });
        }
      });
    } else {
      // 列表形态一级评分要素
      this.setState({
        detailModalVisible: true,
        elementRecord: record,
      });
    }
  }

  /**
   * 要素细项-显隐
   */
  @Bind()
  handleDetailModalHide() {
    this.setState({ detailModalVisible: false, elementRecord: {} });
    this.props.dispatch({
      type: 'score/updateState',
      payload: {
        elementsDetailLineList: [],
        elementsDetailLinePagination: {},
      },
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
   * 改变启用评分要素细项 - 清空最小值，最大值，缺省分
   */
  @Bind()
  changeDetailEnabledFlag(val, dataList, record) {
    if (val) {
      record.$form.setFieldsValue({
        minScore: undefined,
        maxScore: undefined,
        defaultScore: undefined,
      });
    }
  }

  // 打开评分细则
  @Bind()
  handOpenremark(record) {
    if (record.$form.getFieldValue('calculateType') === 'AUTO' || record.calculateType === 'AUTO') {
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

  // 保存Modal信息
  @Bind()
  onChangeRemarkModal(record) {
    const { dispatch, score = {} } = this.props;
    const {
      scoreCode: { benchmarkPriceMethod = [], formula = [] },
    } = score;
    const { rowKey, dataListName } = this.state;
    const { scoreIndicDetail = [] } = record;
    const benchmarkPriceDetail = `${intl
      .get('ssrc.score.model.score.bPEmethod')
      .d('基准价计算方法')}:${valueMapMeaning(
      benchmarkPriceMethod,
      scoreIndicDetail.benchmarkPriceMethod
    )}, ${
      scoreIndicDetail.benchmarkPriceMethod === 'LOWEST_PRICE'
        ? `${intl.get('ssrc.score.model.score.basePrice').d('基准价=有效最低价')}`
        : `${intl.get('ssrc.score.model.score.aVTP').d('基准价=有效投标价格平均值*')}${
            scoreIndicDetail?.benchmarkPriceFactor || scoreIndicDetail?.benchmarkPriceFactor === 0
              ? scoreIndicDetail?.benchmarkPriceFactor
              : 100
          }%`
    }`;
    const formulaDetail = `${intl
      .get('ssrc.score.model.score.priceCFormula')
      .d('价格计算公式')}:${valueMapMeaning(
      formula,
      scoreIndicDetail.formula
    )}, ${this.renderScoreFormulaRender(scoreIndicDetail)}`;
    const remark =
      record.$form.getFieldValue('calculateType') === 'AUTO'
        ? `${benchmarkPriceDetail}${formulaDetail}`
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

  /**
   *  此方法被 [绝味] 重写
   * @protected
   */
  @Bind()
  renderScoreFormulaRender(scoreIndicDetail) {
    return scoreFormulaRender(scoreIndicDetail);
  }

  // 修改计算方式
  @Bind()
  handleChangeCal(val, record) {
    if (val === 'MANUAL') {
      record.$form.setFieldsValue({
        scoreType: null,
        indicateRemark: null,
        // calculateType: val,
      });
    } else {
      record.$form.setFieldsValue({
        detailEnabledFlag: 0,
        // calculateType: val,
      });
    }
  }

  /**
   * 评分细则弹框
   * @protected （水滴二开，绝味重写）禁止修改、删除此方法名
   */
  @Bind()
  renderRemarkModal(remarkModalProps) {
    return <RemarkModal {...remarkModalProps} />;
  }

  render() {
    const {
      loading,
      saving,
      customizeTable,
      deleting,
      score = {},
      customizeBtnGroup = () => {},
      custLoading = () => {},
      remote,
    } = this.props;
    const {
      rowKey,
      indicateType,
      dataListName,
      pagination,
      modalVisible,
      templatePurpose,
      selectedRowKeys,
      detailModalVisible = false,
      elementRecord = {},
      remarkVisible = false,
      remarkRecord = {},
      manualRemarkModal = false,
      expertCategory,
      scoreTemplateScoreType,
    } = this.state;
    const { elementsDetailList = [] } = score;
    const {
      scoreCode: { calculateType = [], scoreType = [] },
    } = score;
    const isSave = score[dataListName].filter(
      (o) => o._status === 'create' || o._status === 'update'
    );
    const filterProps = {
      onSearch: this.handleSearchDetail,
      onRef: this.handleBindRef,
    };

    const rowSelection = {
      onChange: this.onSelectChange,
      getCheckboxProps: (record) => ({
        disabled: record._status === 'create',
      }),
    };

    const modalProps = {
      indicateType,
      visible: modalVisible,
      onCreateRows: this.handleCreateRows,
      onHideModal: this.handleModalHide,
      expertCategory,
      templatePurpose,
    };

    const detailModalProps = {
      remote,
      record: elementRecord,
      visible: detailModalVisible,
      scoreTemplateScoreType,
      onHideModal: this.handleDetailModalHide,
      updateTemplateDetail: this.handleSearchDetail,
    };

    const remarkModalProps = {
      visible: remarkVisible,
      record: remarkRecord,
      elementsDetailList,
      onHideModal: this.closeRemarkModal,
      onChangeRemarkModal: this.onChangeRemarkModal,
    };

    const manualReModalProps = {
      visible: manualRemarkModal,
      record: remarkRecord,
      onHideModal: this.closeRemarkModal,
      onChangeRemarkModal: this.onChangeRemarkModal,
    };

    const columns = [
      {
        title: intl.get(`${promptCode}.model.score.indicateCode`).d('评分要素编码'),
        dataIndex: 'indicateCode',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.score.indicateName`).d('评分要素名称'),
        dataIndex: 'indicateName',
        width: 120,
        render: (val) => (
          <Tooltip title={val} placement="topLeft">
            <span>{val}</span>
          </Tooltip>
        ),
      },
      {
        title: intl.get(`${promptCode}.model.score.indicateType`).d('评分要素类型'),
        dataIndex: 'indicateTypeMeaning',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.score.calculateType`).d('计算方式'),
        dataIndex: 'calculateType',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('calculateType', {
                  initialValue: record.calculateType,
                })(
                  <Select
                    disabled
                    onChange={(e) => this.handleChangeCal(e, record)}
                    style={{ width: '100%' }}
                  >
                    {calculateType &&
                      calculateType.map((item) => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('calculateTypeMeaning', {
                  initialValue: record.calculateTypeMeaning,
                })(<div />)}
              </Form.Item>
            </React.Fragment>
          ) : (
            record.calculateTypeMeaning
          ),
      },
      {
        title: intl.get(`${promptCode}.model.score.ratingType`).d('评分类型'),
        dataIndex: 'scoreType',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('scoreType', {
                  initialValue: record.scoreTypeMeaning,
                })(
                  <Select disabled style={{ width: '100%' }}>
                    {scoreType &&
                      scoreType.map((item) => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('scoreTypeMeaning', {
                  initialValue: record.scoreTypeMeaning,
                })(<div />)}
              </Form.Item>
            </React.Fragment>
          ) : (
            record.scoreTypeMeaning
          ),
      },
      {
        title: intl.get(`${promptCode}.model.score.elements.remark`).d('评分细则'),
        dataIndex: 'remark',
        width: 120,
        render: (val) => {
          return (
            <Tooltip title={val} placement="topLeft">
              <span>{val}</span>
            </Tooltip>
          );
        },
      },
      !(['SCORE', 'SCORE_NEW'].includes(scoreTemplateScoreType))
        ? {
            title: <span>{intl.get(`${promptCode}.model.score.weight`).d('权重')}%</span>,
            dataIndex: 'weight',
            width: 120,
            render: (val, record) => {
              if (['update', 'create'].includes(record._status)) {
                const { getFieldDecorator } = record.$form;
                return (
                  <Form.Item>
                    {getFieldDecorator('weight', {
                      initialValue: record.weight,
                      rules: [
                        {
                          required: record.indicateType !== 'PASS',
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`${promptCode}.model.score.weight`).d('权重'),
                          }),
                        },
                        {
                          pattern: /^[0-9]{1,3}(.[0-9]{1,2})?/,
                          message: intl
                            .get(`${promptCode}.model.score.unsetsocore`)
                            .d('只能输入两位精度的非负数'),
                        },
                      ],
                    })(
                      <InputNumber
                        disabled={record.indicateType === 'PASS'}
                        style={{ width: '100%' }}
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
        title: intl.get(`${promptCode}.model.score.detailEnabledFlag`).d('启用评分要素细项'),
        dataIndex: 'detailEnabledFlag',
        width: 130,
        align: 'center',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('detailEnabledFlag', {
                  initialValue: record.indicateType === 'PASS' ? 0 : record.detailEnabledFlag,
                })(
                  <Checkbox
                    // disabled={record.calculateType === 'AUTO' && record.indicateType === 'SCORE'}
                    disabled
                    onChange={(value, dataList) =>
                      this.changeDetailEnabledFlag(value, dataList, record)
                    }
                    checkedValue={1}
                    unCheckedValue={0}
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
        title: intl.get(`${promptCode}.model.score.minScore`).d('最低分'),
        dataIndex: 'minScore',
        width: 120,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('minScore', {
                  initialValue: record.minScore,
                  rules:
                    record.indicateType === 'PASS'
                      ? []
                      : [
                          {
                            required: !record.$form.getFieldValue('detailEnabledFlag'),
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`${promptCode}.model.score.minScore`).d('最低分'),
                            }),
                          },
                        ],
                })(
                  <InputNumber
                    disabled={getFieldValue('detailEnabledFlag') || record.indicateType === 'PASS'}
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
        title: intl.get(`${promptCode}.model.score.maxScore`).d('最高分'),
        dataIndex: 'maxScore',
        width: 120,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('maxScore', {
                  initialValue: record.maxScore,
                  rules:
                    record.indicateType === 'PASS'
                      ? []
                      : [
                          {
                            required: !record.$form.getFieldValue('detailEnabledFlag'),
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`${promptCode}.model.score.maxScore`).d('最高分'),
                            }),
                          },
                        ],
                })(
                  <InputNumber
                    style={{ width: '100%' }}
                    precision={2}
                    min={0}
                    max={99999999999999999}
                    disabled={getFieldValue('detailEnabledFlag') || record.indicateType === 'PASS'}
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
        title: intl.get(`${promptCode}.model.score.defaultScore`).d('缺省分'),
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
                    disabled={
                      record.$form.getFieldValue('detailEnabledFlag') ||
                      record.indicateType === 'PASS'
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
        title: intl.get(`${promptCode}.model.score.elements.detail`).d('评分要素细项'),
        dataIndex: 'elementsDetail',
        width: 120,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldValue } = record.$form;
            return (
              <a
                disabled={getFieldValue('detailEnabledFlag') === 0}
                onClick={() => this.handleDetailModalShow(record)}
              >
                {intl.get(`${promptCode}.model.score.elements.detail`).d('评分要素细项')}
              </a>
            );
          } else {
            return (
              <a
                disabled={record.detailEnabledFlag === 0}
                onClick={() => this.handleDetailModalShow(record)}
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
        width: 75,
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
        dataIndex: 'operation',
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
                disabled={record.ssiEnabledFlag === 0}
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
    ].filter(Boolean);
    return (
      <React.Fragment>
        <Header
          backPath="/ssrc/score"
          title={intl.get(`${promptCode}.view.title.elements.maintain`).d('评分要素维护')}
        >
          {customizeBtnGroup(
            {
              code: 'SSRC.SCORE_TEMPLATE.HEADER_BUTTONS',
            },
            [
              <Button name="create" type="primary" icon="plus" onClick={this.handleModalShow}>
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>,
              <Button
                name="save"
                icon="save"
                disabled={isEmpty(isSave)}
                loading={saving}
                onClick={this.handleSave}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>,
              <Button
                icon="delete"
                name="delete"
                disabled={isEmpty(selectedRowKeys)}
                loading={deleting}
                onClick={this.handleDelete}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>,
            ]
          )}
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          {customizeTable(
            {
              code: 'SSRC.SCORE_TEMPLATE.TMPL_ASSIGN',
            },
            <EditTable
              bordered
              loading={loading}
              rowKey={rowKey}
              dataSource={elementsDetailList}
              columns={columns}
              pagination={score[pagination]}
              rowSelection={rowSelection}
              onChange={this.handleSearchDetail}
              custLoading={custLoading}
            />
          )}
        </Content>
        <ModalTable {...modalProps} />
        {remarkVisible && this.renderRemarkModal(remarkModalProps)}
        <DetailModal {...detailModalProps} />
        <ManualReModal {...manualReModalProps} />
      </React.Fragment>
    );
  }
}

const hocDetail = (NewComponent) => {
  return withCustomize({
    unitCode: [
      'SSRC.SCORE_TEMPLATE.TMPL_ASSIGN', // 评分要素表单
      'SSRC.SCORE_TEMPLATE.HEADER_BUTTONS', // 头部按钮
    ],
  })(
    formatterCollections({
      code: ['ssrc.score'],
    })(
      connect(({ score, loading }) => ({
        score,
        loading: loading.effects['score/fetchDetail'],
        saving: loading.effects['score/saveDetail'],
        deleting: loading.effects['score/deleteDetail'],
      }))(
        remoteHoc({
          code: 'SSRC_SCORE_TEMPLATE_DEFINE_DETAIL',
          name: 'remote',
        })(observer(NewComponent))
      )
    )
  );
};
const Detail = hocDetail(ElementsDetail);
export default Detail;

export { hocDetail, ElementsDetail };
