/**
 * rfx维护 评分要素
 * @date: 2019-05-28
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Input, Button, InputNumber, Modal, Select } from 'hzero-ui';
import { sum, isNumber, isEmpty, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';
import Lov from 'components/Lov';
import { enableRender, valueMapMeaning } from 'utils/renderer';
import notification from 'utils/notification';
import { scoreFormulaRender } from '@/utils/renderer';
import Editing from '@/assets/editing.svg';
import styles from './index.less';

import DetailModal from './ScoreEleDetailModal';
import RemarkModal from './RemarkModal';
import ManualReModal from './ManualReModal';

export default class ScoringElementsTable extends PureComponent {
  constructor(props) {
    super(props);
    const { header = {} } = this.props;
    this.businessWeight = header.businessWeight || 0.0;
    this.technologyWeight = header.technologyWeight || 0.0;

    this.state = {
      weightType: '',
      weightData: [],
      inputWeightModalVisible: false,
      lovBringOutFlag: {}, // lov带出flag
      changeLovFlag: {}, // 真实数据，是否改变lov
      detailModalVisible: false, // 评分要素细项显隐
      elementRecord: {}, // 评分要素
      dataListName: 'elementsList',
      remarkVisible: false, // 评分细则Modal
      remarkRecord: {}, // 评分细则
      manualRemarkModal: false,
      rowKey: 'evaluateIndicId',
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (isFunction(onRef)) {
      onRef(this);
    }
  }

  componentDidUpdate() {
    this.handleUpdated();
  }

  /**
   * 数据有变动 更新全局变量
   *
   * @memberof ScoringElementsTable
   */
  handleUpdated() {
    const {
      header = {},
      scoringBusinessTempelate = [],
      scoringTechnologyTempelate = [],
    } = this.props;
    if (!scoringBusinessTempelate.length) {
      this.businessWeight = header.businessWeight || 0.0;
    }

    if (!scoringTechnologyTempelate.length) {
      this.technologyWeight = 0.0;
      this.technologyWeight = header.technologyWeight || 0.0;
    }
  }

  /**
   * 改变要素编码
   */
  @Bind()
  changeScoringElement(val, dataList, record) {
    const { lovBringOutFlag = {}, changeLovFlag = {} } = this.state;
    record.$form.setFieldsValue({
      indicateCode: dataList.indicateCode,
      indicateId: dataList.indicateId,
      indicateName: dataList.indicateName,
      indicateType: dataList.indicateType,
      indicateTypeMeaning: dataList.indicateTypeMeaning,
      maxScore: dataList.maxScore,
      minScore: dataList.minScore,
      objectVersionNumber: dataList.objectVersionNumber,
      indicateRemark: dataList.remark,
      scoreIndicId: dataList.scoreIndicId,
      weight: dataList.weight,
      detailEnabledFlag: dataList.detailEnabledFlag,
      lovChangeFlag: 1,
      calculateType: dataList.calculateType,
      scoreType: dataList.scoreType,
      evaluateIndicDetail: dataList.scoreIndicDetail,
    });
    if (val) {
      this.setState({ lovBringOutFlag: { ...lovBringOutFlag, [record.evaluateIndicId]: true } });
    } else {
      this.setState({ lovBringOutFlag: { ...lovBringOutFlag, [record.evaluateIndicId]: false } });
    }
    // 真实数据，并且改了lov的，二级保存需要传lov中id
    if (record._status === 'update') {
      this.setState({ changeLovFlag: { ...changeLovFlag, [record.evaluateIndicId]: true } });
    }
  }

  /**
   * 改变启用评分要素细项 - 清空最小值，最大值，缺省分
   */
  @Bind()
  changeDetailEnabledFlag(val, dataList, record) {
    if (val) {
      record.$form.setFieldsValue({
        maxScore: undefined,
        minScore: undefined,
      });
    }
  }

  @Bind()
  changeMaxScore(value, record) {
    const { evaluateIndicDetail = {}, scoreType } = record.$form.getFieldsValue();
    if (value && scoreType === 'PRICE' && String(evaluateIndicDetail.lowestScore)) {
      record.$form.setFieldsValue({
        minScore: (evaluateIndicDetail.lowestScore * value) / 100,
      });
    }
  }

  /**
   * 默认权重输入框的值
   *
   * @param {*} type
   * @param {*} dataList
   * @returns
   * @memberof ScoringElementsTable
   */
  setInputDefault(type, dataList) {
    if (!type || !dataList.length) {
      return 0.0;
    }

    // const data = dataList.filter((item) => item && item.templateId);
    if (!dataList.length) {
      return dataList[0][type];
    }

    return dataList[0][type];
  }

  /**
   * 区分专家类别，定义对应字段
   *
   * @returns
   * @memberof ScoringElementsTable
   */
  dividerExpert() {
    const { weightData = [], weightType = '' } = this.state;

    let weightField = '';
    let weightTitleEng = '';
    let weightTitleZH = '';

    switch (weightType) {
      case 'BUSINESS':
        weightField = 'businessWeight';
        weightTitleEng = weightType.toLowerCase();
        weightTitleZH = intl.get(`ssrc.inquiryHall.model.inquiryHall.business`).d('商务');
        break;
      case 'TECHNOLOGY':
        weightField = 'technologyWeight';
        weightTitleEng = weightType.toLowerCase();
        weightTitleZH = intl.get(`ssrc.inquiryHall.model.inquiryHall.technology`).d('技术');
        break;
      default:
        break;
    }

    return {
      weightData,
      weightType,
      weightField,
      weightTitleEng,
      weightTitleZH,
    };
  }

  /**
   * 输入框改变后改变所有数据的值
   *
   * @param {*} val
   * @param {*} dataList
   * @param {*} field
   * @memberof ScoringElementsTable
   */
  @Bind()
  changeWeight(val, dataList, field) {
    dataList.forEach((item) => {
      if (!item.$form) {
        return;
      }

      item.$form.setFieldsValue({
        [field]: val,
      });
    });

    this[field] = val;
  }

  /**
   * 打开修改权重model
   *
   * @param {string} [type='']
   * @param {*} [dataList=[]]
   * @memberof ScoringElementsTable
   */
  @Bind()
  openWeightModal(type = '', dataList = []) {
    this.setState({
      weightType: type,
      weightData: dataList,
      inputWeightModalVisible: true,
    });
  }

  /**
   * 关闭修改权重model
   *
   * @memberof ScoringElementsTable
   */
  @Bind()
  closeWeightModal() {
    this.setState({
      weightType: '',
      weightData: [],
      inputWeightModalVisible: false,
    });
  }

  /**
   * 要素细项-显隐
   */
  @Bind()
  handleDetailModalShow(record) {
    if (isEmpty(record)) return;
    record.$form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          detailModalVisible: true,
          elementRecord: { ...record, ...values },
        });
      } else {
        notification.warning({
          message: intl
            .get(`ssrc.inquiryHall.view.notification.openDetail.fail`)
            .d('打开评分要素细项弹框失败，请填写未填写项！'),
        });
      }
    });
  }

  /**
   * 要素细项-显隐
   * 保存后关闭弹框，需要重置lovBringOutFlag，changeLovFlag
   */
  @Bind()
  handleDetailModalHide(saveFlag) {
    this.setState({ detailModalVisible: false, elementRecord: {} });
    if (saveFlag) {
      this.setState({ lovBringOutFlag: {}, changeLovFlag: {} });
    }
  }

  // insert weight
  judgeWeight = (headerWeight = null, inputWeight = null, defaultWeight = 50) => {
    const result =
      headerWeight || headerWeight === 0 || headerWeight === '0' || headerWeight === '0.0'
        ? headerWeight
        : inputWeight || inputWeight === 0 || inputWeight === '0' || inputWeight === '0.0'
        ? inputWeight
        : defaultWeight;
    return result;
  };

  /**
   * 渲染改变权重输入框
   *
   * @param {string} [type='']
   * @param {*} [dataList=[]]
   * @returns
   * @memberof ScoringElementsTable
   */
  renderWeight(type = '', dataList = []) {
    const { header = {} } = this.props;

    if (!type) {
      return;
    }

    if (type === 'BUSINESS') {
      return (
        <React.Fragment>
          (
          <span style={{ marginRight: '6px' }}>
            {this.judgeWeight(
              this.businessWeight,
              this.setInputDefault('businessWeight', dataList)
            )}{' '}
            %
          </span>
          {header.sourceFrom === 'PROJECT' ? null : (
            <img src={Editing} alt="" onClick={() => this.openWeightModal(type, dataList)} />
          )}
          )
        </React.Fragment>
      );
    } else if (type === 'TECHNOLOGY') {
      return (
        <React.Fragment>
          (
          <span style={{ marginRight: '6px' }}>
            {this.judgeWeight(
              this.technologyWeight,
              this.setInputDefault('technologyWeight', dataList)
            )}{' '}
            %
          </span>
          {header.sourceFrom === 'PROJECT' ? null : (
            <img src={Editing} alt="" onClick={() => this.openWeightModal(type, dataList)} />
          )}
          )
        </React.Fragment>
      );
    } else {
      return null;
    }
  }

  /**
   * 设置权重model title
   *
   * @returns
   * @memberof ScoringElementsTable
   */
  setWeightModalTitle() {
    // const { weightTitleEng = '', weightTitleZH = '' } = this.dividerExpert();
    const { weightTitleEng = '' } = this.dividerExpert();

    return (
      <div>
        {intl.get(`ssrc.inquiryHall.model.inquiryHall.modification`).d('修改')}
        {weightTitleEng === 'business'
          ? intl.get(`ssrc.inquiryHall.model.inquiryHall.business`).d('商务')
          : intl.get(`ssrc.inquiryHall.model.inquiryHall.technology`).d('技术')}
        {intl.get(`ssrc.inquiryHall.model.inquiryHall.weight`).d('权重')}
      </div>
    );
  }

  /**
   * 权重输入框
   *
   * @returns
   * @memberof ScoringElementsTable
   */
  renderModalInput() {
    const { weightData = [], weightField } = this.dividerExpert();

    return (
      <Form.Item>
        <InputNumber
          onChange={(val) => this.changeWeight(val, weightData, weightField)}
          min={0}
          max={100}
          style={{ width: '100%' }}
          precision={2}
          defaultValue={this[weightField] || this.setInputDefault(weightField, weightData) || 50.0}
        />
      </Form.Item>
    );
  }

  /**
   * 判断是否有选择数据
   */
  isSelectedData(data = [], keys = []) {
    let result = false;
    if (!data.length || !keys.length) {
      return result;
    }

    keys.forEach((key) => {
      const filterData = data.filter((item) => item.evaluateIndicId === key);
      if (filterData.length !== 0) {
        result = true;
      }
    });

    return result;
  }

  /**
   * 渲染数据表单
   *
   * @param {string} [title=""]
   * @param {string} [type=""]
   * @param {*} [dataLists=[]]
   * @returns
   * @memberof ScoringElementsTable
   */
  _renderTableList(title = '', type = '', dataLists = []) {
    const {
      onCreateScoringElements,
      onDeleteScoringElements,
      onImportScoringElements,
      loading,
      scoringLineRowSelection,
      openAssignExpertModal,
      deleteLoading,
      calculateType,
      scoreType,
      header,
      customizeTable,
    } = this.props;

    const { lovBringOutFlag = {} } = this.state;

    const isSelected = this.isSelectedData(dataLists, scoringLineRowSelection.selectedRowKeys);

    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateCode`).d('要素编码'),
        dataIndex: 'indicateId',
        width: 180,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('indicateId', {
                  initialValue: val,
                })(
                  <Lov
                    code="SSRC.SCORE_INDIC"
                    queryParams={{
                      expertCategory: type,
                      indicateType: 'SCORE',
                    }}
                    textValue={record.indicateCode}
                    onChange={(value, dataList) =>
                      this.changeScoringElement(value, dataList, record)
                    }
                  />
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('indicateCode', {
                  initialValue: record.indicateCode,
                })(<div />)}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('expertCategory', {
                  initialValue: record.expertCategory,
                })(<div />)}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {type === 'BUSINESS' ? (
                  <React.Fragment>
                    {record.$form.getFieldDecorator('businessWeight', {
                      initialValue: record.businessWeight ?? 50,
                    })(<div />)}
                  </React.Fragment>
                ) : (
                  ''
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('lovChangeFlag', {
                  initialValue: 0,
                })(<div />)}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {type === 'TECHNOLOGY' ? (
                  <React.Fragment>
                    {record.$form.getFieldDecorator('technologyWeight', {
                      initialValue: record.technologyWeight ?? 50,
                    })(<div />)}
                  </React.Fragment>
                ) : (
                  ''
                )}
                {record.$form.getFieldDecorator('evaluateIndicDetail', {
                  initialValue: record.evaluateIndicDetail,
                })}
              </Form.Item>
            </React.Fragment>
          ) : (
            record.indicateCode
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateName`).d('要素名称'),
        dataIndex: 'indicateName',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('indicateName', {
                initialValue: record.indicateName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.indicateName`)
                        .d('要素名称'),
                    }),
                  },
                ],
              })(<Input disabled={record.$form.getFieldValue('indicateId')} />)}
            </Form.Item>
          ) : (
            record.indicateName
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.calculateType`).d('计算方式'),
        dataIndex: 'calculateType',
        width: 120,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            return (
              <React.Fragment>
                <Form.Item>
                  {getFieldDecorator('calculateType', {
                    initialValue:
                      getFieldValue('indicateType') === 'SCORE' ? record.calculateType : null,
                    rules: [
                      {
                        required: getFieldValue('indicateType') === 'SCORE',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.inquiryHall.model.inquiryHall.calculateType`)
                            .d('计算方式'),
                        }),
                      },
                    ],
                  })(
                    <Select
                      disabled={record.$form.getFieldValue('indicateId')}
                      onChange={(value) => this.handleChangeCal(value, record)}
                      style={{ width: '100%' }}
                    >
                      {calculateType &&
                        calculateType.map((item) => (
                          <Select.Option
                            disabled={type === 'TECHNOLOGY' && item.value === 'AUTO'}
                            value={item.value}
                            key={item.value}
                          >
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
                <Form.Item style={{ display: 'none' }}>
                  {record.$form.getFieldDecorator('indicateType', {
                    initialValue: record.indicateType,
                  })(<div />)}
                </Form.Item>
              </React.Fragment>
            );
          } else {
            return record.calculateTypeMeaning;
          }
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.scoreType`).d('评分类型'),
        dataIndex: 'scoreType',
        width: 120,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            return (
              <React.Fragment>
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
                          name: intl
                            .get(`ssrc.inquiryHall.model.inquiryHall.scoreType`)
                            .d('评分类型'),
                        }),
                      },
                    ],
                  })(
                    <Select
                      disabled={
                        record.$form.getFieldValue('indicateId') ||
                        getFieldValue('calculateType') === 'MANUAL'
                      }
                      style={{ width: '100%' }}
                    >
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
            );
          } else {
            return record.scoreTypeMeaning;
          }
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.scoreRemark`).d('评分细则'),
        dataIndex: 'indicateRemark',
        width: 120,
        render: (val, record) => {
          const { getFieldValue } = record.$form;
          if (['update', 'create'].includes(record._status)) {
            return record.$form.getFieldValue('calculateType') === 'AUTO' ? (
              <React.Fragment>
                <Form.Item>
                  {record.$form.getFieldDecorator('indicateRemark', {
                    initialValue: record.indicateRemark,
                    rules: [
                      {
                        required: getFieldValue('calculateType') === 'AUTO',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.inquiryHall.model.inquiryHall.scoreRemark`)
                            .d('评分细则'),
                        }),
                      },
                    ],
                  })(
                    <Input.Search
                      readOnly
                      defaultValue={record.indicateRemark}
                      onSearch={() => this.handOpenRemark(record)}
                    />
                  )}
                </Form.Item>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Form.Item>
                  {record.$form.getFieldDecorator('indicateRemark', {
                    initialValue: record.indicateRemark,
                    rules: [
                      {
                        required: getFieldValue('calculateType') === 'AUTO',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.inquiryHall.model.inquiryHall.scoreRemark`)
                            .d('评分细则'),
                        }),
                      },
                    ],
                  })(<Input />)}
                </Form.Item>
              </React.Fragment>
            );
          } else {
            return record.indicateRemark;
          }
        },
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.detailEnabledFlag`)
          .d('启用评分要素细项'),
        dataIndex: 'detailEnabledFlag',
        width: 150,
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
                      lovBringOutFlag[record.evaluateIndicId] ||
                      (getFieldValue('indicateType') === 'SCORE' &&
                        getFieldValue('calculateType') === 'AUTO')
                    }
                    onChange={(value, dataList) =>
                      this.changeDetailEnabledFlag(value, dataList, record)
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.elements.detail`).d('评分要素细项'),
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
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.elements.detail`).d('评分要素细项')}
              </a>
            );
          }
        },
      },
      header.templateScoreType !== 'SCORE'
        ? {
            title: <span>{intl.get(`ssrc.inquiryHall.model.inquiryHall.weight`).d('权重')}%</span>,
            dataIndex: 'weight',
            width: 120,
            render: (val, record) =>
              ['create', 'update'].includes(record._status) ? (
                <Form.Item
                  style={{
                    visibility: record.indicateType !== 'SCORE' ? 'hidden' : '',
                  }}
                >
                  {record.$form.getFieldDecorator('weight', {
                    initialValue: record.weight,
                    rules: [
                      {
                        required: record.indicateType === 'SCORE',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.inquiryHall.model.inquiryHall.weight`).d('权重'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      precision={2}
                      style={{ width: '100%' }}
                      disabled={record.indicateType === 'PASS'}
                    />
                  )}
                </Form.Item>
              ) : (
                record.weight
              ),
          }
        : null,
      header.templateScoreType !== 'WEIGHT'
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.minScore`).d('最低分'),
            dataIndex: 'minScore',
            width: 120,
            render: (val, record) =>
              ['create', 'update'].includes(record._status) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('minScore', {
                    // 价格类型的要素，最低分为只读，无需编辑，根据评分细则中的【最低扣至】自动带出；
                    initialValue: record.minScore,
                    rules: [
                      {
                        required: !(
                          record.$form.getFieldValue('detailEnabledFlag') ||
                          record.$form.getFieldValue('scoreType') === 'PRICE'
                        ),
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.inquiryHall.model.inquiryHall.minScore`).d('最低分'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      precision={2}
                      style={{ width: '100%' }}
                      disabled={
                        record.$form.getFieldValue('detailEnabledFlag') ||
                        record.$form.getFieldValue('scoreType') === 'PRICE'
                      }
                    />
                  )}
                </Form.Item>
              ) : (
                record.minScore
              ),
          }
        : null,
      header.templateScoreType !== 'WEIGHT'
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.maxScore`).d('最高分'),
            dataIndex: 'maxScore',
            width: 120,
            render: (val, record) =>
              ['create', 'update'].includes(record._status) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('maxScore', {
                    initialValue: record.maxScore,
                    rules: [
                      {
                        required: !record.$form.getFieldValue('detailEnabledFlag'),
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.inquiryHall.model.inquiryHall.maxScore`).d('最高分'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      precision={2}
                      style={{ width: '100%' }}
                      disabled={record.$form.getFieldValue('detailEnabledFlag')}
                      onChange={(value) => this.changeMaxScore(value, record)}
                    />
                  )}
                </Form.Item>
              ) : (
                record.maxScore
              ),
          }
        : null,
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertAllocation`).d('专家分配'),
        width: 100,
        dataIndex: 'expertAllocation',
        fixed: 'right',
        render: (_, record) => (
          <Form.Item>
            {record._status === 'update' ? (
              <a onClick={() => openAssignExpertModal(record)}>
                {intl.get(`ssrc.inquiryHall.view.message.button.distribution`).d('分配')}
              </a>
            ) : (
              ''
            )}
          </Form.Item>
        ),
      },
    ].filter(Boolean);

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 300)));

    return (
      <React.Fragment>
        <div
          className={styles['item-list-search']}
          style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}
        >
          <div style={{ paddingTop: '5px', flex: 'inline-flex', alignItems: 'center' }}>
            {title}
            {this.renderWeight(type, dataLists)}
          </div>

          <Form layout="inline">
            <Button type="primary" onClick={() => onCreateScoringElements(type)}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
            {/* <Button
              onClick={() => onSaveScoringElements(type)}
              loading={scoringSaveType === type ? saveLoading : ''}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button> */}
            <Button
              onClick={() => onDeleteScoringElements(type)}
              // disabled={scoringElementSelectedRowKeys.length === 0}
              disabled={!isSelected}
              loading={deleteLoading}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
            <Button
              icon="arrow-down"
              onClick={() => onImportScoringElements(type)}
              loading={deleteLoading}
            >
              {intl.get('ssrc.inquiryHall.view.button.allCreate').d('批量创建')}
            </Button>
          </Form>
        </div>
        {customizeTable(
          {
            code:
              type === 'TECHNOLOGY'
                ? 'SSRC.INQUIRY_HALL_EDIT.HEADER.SCORE_INDICS_TECHNOLOGY'
                : 'SSRC.INQUIRY_HALL.EDIT_HEADER_INDICS',
          },
          <EditTable
            bordered
            rowKey="evaluateIndicId"
            loading={loading}
            columns={columns}
            rowSelection={scoringLineRowSelection}
            scroll={{ x: scrollX }}
            dataSource={dataLists}
            pagination={false}
          />
        )}
        {this.state.inputWeightModalVisible ? (
          <Modal
            visible={this.state.inputWeightModalVisible}
            title={this.setWeightModalTitle()}
            onCancel={this.closeWeightModal}
            onOk={this.closeWeightModal}
          >
            <Form>{this.renderModalInput()}</Form>
          </Modal>
        ) : (
          ''
        )}
      </React.Fragment>
    );
  }

  // 打开评分细则
  @Bind()
  handOpenRemark(record) {
    const getData = record.$form.getFieldsValue();
    if (record.$form.getFieldValue('calculateType') === 'AUTO') {
      this.setState({
        remarkVisible: true,
        remarkRecord: {
          ...record,
          evaluateIndicDetail: { ...getData.evaluateIndicDetail, indicId: undefined },
        },
      });
    } else {
      this.setState({
        manualRemarkModal: true,
        remarkRecord: {
          ...record,
          evaluateIndicDetail: { ...getData.evaluateIndciDetail, indicId: undefined },
        },
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
    const {
      dispatch,
      scoringNoneTempelate,
      scoringBusinessTempelate,
      scoringTechnologyTempelate,
      benchmarkPriceMethod = [],
      formula = [],
    } = this.props;
    const { rowKey } = this.state;
    const { evaluateIndicDetail = [], expertCategory } = record;
    const benchmarkPriceDetail = `${intl
      .get('ssrc.score.model.score.bPEmethod')
      .d('基准价计算方法')}:${valueMapMeaning(
      benchmarkPriceMethod,
      evaluateIndicDetail.benchmarkPriceMethod
    )}, ${
      evaluateIndicDetail.benchmarkPriceMethod === 'LOWEST_PRICE'
        ? `${intl.get('ssrc.score.model.score.basePrice').d('基准价=有效最低价')}`
        : `${intl.get('ssrc.score.model.score.aVTP').d('基准价=有效投标价格平均值*')}${
            evaluateIndicDetail.benchmarkPriceFactor
          }%`
    }`;
    // 价格计算公式描述
    const calculateRuleDesc = `${intl
      .get('ssrc.score.model.score.priceCFormula')
      .d('价格计算公式')}:${valueMapMeaning(formula, evaluateIndicDetail.formula)}`;
    const formulaDetail = `${calculateRuleDesc}, ${scoreFormulaRender(evaluateIndicDetail)}`;
    // 有效报价供应商≥ []家时，去除最低/最高报价计算投标价格平均值
    const enableRemoveExtremesDesc = evaluateIndicDetail.enableRemoveExtremes
      ? intl
          .get('ssrc.score.model.score.enableRemoveExtremesDesc', {
            limitSupplierQuantity: evaluateIndicDetail.limitSupplierQuantity,
          })
          .d(
            '（有效报价供应商 ≥ {limitSupplierQuantity}家时，去除最低/最高报价计算投标价格平均值），'
          )
      : '';
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
      evaluateIndicDetail.formula === 'LINEAR_MAPPING'
        ? `${calculateRuleDesc}, ${linearMappingNotice}`
        : `${benchmarkPriceDetail}${enableRemoveExtremesDesc}${formulaDetail}`;

    const indicateRemark =
      record.$form.getFieldValue('calculateType') === 'AUTO'
        ? scoreRuleDesc
        : `${evaluateIndicDetail.remark}`;
    const newDataList =
      record.expertCategory === 'BUSINESS_TECHNOLOGY'
        ? scoringNoneTempelate.map((item) =>
            record[rowKey] === item[rowKey]
              ? { ...item, ...record, evaluateIndicDetail, indicateRemark }
              : item
          )
        : record.expertCategory === 'BUSINESS'
        ? scoringBusinessTempelate.map((item) =>
            record[rowKey] === item[rowKey]
              ? { ...item, ...record, evaluateIndicDetail, indicateRemark }
              : item
          )
        : scoringTechnologyTempelate.map((item) =>
            record[rowKey] === item[rowKey]
              ? { ...item, ...record, evaluateIndicDetail, indicateRemark }
              : item
          );
    const maxScore = record.$form.getFieldValue('maxScore') || null;
    // 价格类型的要素，最低分为只读，无需编辑，根据评分细则中的【最低扣至】自动带出
    if (record.$form.getFieldValue('scoreType') === 'PRICE' && maxScore) {
      record.$form.setFieldsValue({
        minScore: (evaluateIndicDetail.lowestScore * maxScore) / 100,
      });
    }
    record.$form.setFieldsValue({
      indicateRemark,
      evaluateIndicDetail,
    });
    dispatch({
      type: 'bidHall/updateState',
      payload:
        expertCategory === 'BUSINESS_TECHNOLOGY'
          ? { scoringNoneTempelate: newDataList }
          : expertCategory === 'BUSINESS'
          ? { scoringBusinessTempelate: newDataList }
          : { scoringTechnologyTempelate: newDataList },
    });
  }

  // 修改计算方式
  @Bind()
  handleChangeCal(val, record) {
    if (val === 'MANUAL') {
      record.$form.setFieldsValue({
        scoreType: null,
        indicateRemark: null,
        calculateType: val,
      });
    } else {
      record.$form.setFieldsValue({
        detailEnabledFlag: 0,
        calculateType: val,
      });
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      header,
      scoringNoneTempelate,
      scoringBusinessTempelate,
      scoringTechnologyTempelate,
      evaluateAssignModalVisible,
      cancelAssignExpert,
      saveScoringAssignExpert,
      currentScoringExperts,
      fetchEvaluateIndicAssignLoading,
      match: { params },
      benchmarkPriceMethod = [],
      formula = [],
    } = this.props;

    const {
      elementRecord = {},
      detailModalVisible = false,
      lovBringOutFlag = {},
      changeLovFlag = {},
      remarkVisible = false,
      remarkRecord = {},
      manualRemarkModal = false,
    } = this.state;

    const detailModalProps = {
      lovBringOutFlag,
      changeLovFlag,
      elementRecord,
      templateScoreType: header.templateScoreType,
      sourceHeaderId: params.rfxId,
      visible: detailModalVisible,
      onHideModal: this.handleDetailModalHide,
    };
    const remarkModalProps = {
      visible: remarkVisible,
      record: remarkRecord,
      benchmarkPriceMethod,
      formula,
      onHideModal: this.closeRemarkModal,
      onChangeRemarkModal: this.onChangeRemarkModal,
    };

    const manualReModalProps = {
      visible: manualRemarkModal,
      record: remarkRecord,
      onHideModal: this.closeRemarkModal,
      onChangeRemarkModal: this.onChangeRemarkModal,
    };

    const expertColumns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertSubAccount`).d('专家子账户'),
        dataIndex: 'loginName',
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('loginName', {
              initialValue: record.loginName,
            })(<Input disabled />)}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertName`).d('专家姓名'),
        dataIndex: 'expertName',
        width: 150,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('expertName', {
              initialValue: record.expertName,
            })(<Input disabled />)}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherAssign`).d('是否分配'),
        dataIndex: 'assignFlag',
        width: 120,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('assignFlag', {
              initialValue: record.assignFlag,
            })(<Checkbox defaultValue={record.assignFlag} checkedValue={1} unCheckedValue={0} />)}
          </Form.Item>
        ),
      },
    ];

    const scrollX = sum(expertColumns.map((n) => (isNumber(n.width) ? n.width : 0)));

    return (
      <div>
        {header.bidRuleType === 'NONE' &&
          this._renderTableList('', 'BUSINESS_TECHNOLOGY', scoringNoneTempelate)}
        {header.bidRuleType !== 'NONE' &&
          this._renderTableList(
            intl.get(`ssrc.inquiryHall.model.inquiryHall.businessTeam`).d('商务组'),
            'BUSINESS',
            scoringBusinessTempelate
          )}
        {header.bidRuleType !== 'NONE' &&
          this._renderTableList(
            intl.get(`ssrc.inquiryHall.model.inquiryHall.technologyTeam`).d('技术组'),
            'TECHNOLOGY',
            scoringTechnologyTempelate
          )}
        <Modal
          visible={evaluateAssignModalVisible}
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.assignExpert`).d('分配专家')}
              </span>
              <div style={{ paddingRight: '20px' }}>
                <Button key="create" type="primary" onClick={saveScoringAssignExpert}>
                  {intl.get('hzero.common.button.save').d('保存')}
                </Button>
              </div>
            </div>
          }
          footer={null}
          onCancel={cancelAssignExpert}
        >
          <Form>
            <EditTable
              bordered
              loading={fetchEvaluateIndicAssignLoading}
              columns={expertColumns}
              rowKey="evaluateExpertId"
              dataSource={currentScoringExperts}
              srcoll={{ x: scrollX }}
              pagination={false}
            />
          </Form>
        </Modal>
        <DetailModal {...detailModalProps} />
        {remarkVisible && <RemarkModal {...remarkModalProps} />}
        <ManualReModal {...manualReModalProps} />
      </div>
    );
  }
}
