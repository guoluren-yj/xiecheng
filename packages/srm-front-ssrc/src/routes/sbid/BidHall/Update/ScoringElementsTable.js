/**
 * create 创建招标
 * @date: 2019-05-28
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Input, Button, InputNumber, Modal, Checkbox, Select, Tooltip } from 'hzero-ui';
import { sum, isNumber, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import { SRM_SSRC } from '_utils/config';
import CommonImportNew from 'hzero-front/lib/components/Import';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import { valueMapMeaning } from 'utils/renderer';

import { scoreFormulaRender } from '@/utils/renderer';
import Editing from '@/assets/editing.svg';
import RemarkModal from '../../components/ScoreRemark/RemarkModal';
import styles from './index.less';

const { Search } = Input;

export default class ScoringElementsTable extends PureComponent {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.businessWeight = 0;
    this.technologyWeight = 0;

    this.state = {
      weightType: '',
      weightData: [],
      inputWeightModalVisible: false,
      remarkVisible: false, // 评分细则modal
      remarkRecord: {}, // 评分细则
      rowKey: 'evaluateIndicId',
    };
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
    const { scoringBusinessTempelate = [], scoringTechnologyTempelate = [] } = this.props;

    if (!scoringBusinessTempelate.length) {
      this.businessWeight = 0.0;
    }

    if (!scoringTechnologyTempelate.length) {
      this.technologyWeight = 0.0;
    }
  }

  /**
   * 改变要素编码
   */
  @Bind()
  changeScoringElement(val, dataList, record) {
    record.$form.setFieldsValue({
      indicateCode: dataList.indicateCode,
      indicateId: dataList.indicateId,
      indicateName: dataList.indicateName,
      indicateType: dataList.indicateType || 'SCORE',
      maxScore: dataList.maxScore || 100,
      minScore:
        (dataList.calculateType === 'AUTO'
          ? dataList.scoreIndicDetail?.lowestScore
          : dataList.minScore) || 0,
      objectVersionNumber: dataList.objectVersionNumber,
      indicateRemark: dataList.remark,
      scoreIndicId: dataList.scoreIndicId,
      weight: dataList.weight,
      calculateType: dataList.calculateType,
      scoreType: dataList.scoreType,
      evaluateIndicDetail: dataList.scoreIndicDetail || null,
    });
  }

  /**
   * 检查表格内容值发生变化
   */
  @Bind()
  hasChangeData(record, changeValues) {
    const { onChangeTableData } = this.props;
    if (!isEmpty(changeValues)) {
      onChangeTableData();
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

    const data = dataList.filter((item) => item && item.templateId);
    if (!data.length) {
      return dataList[0][type];
    }

    return data[0][type];
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
        weightTitleZH = intl.get(`ssrc.bidHall.model.bidHall.business`).d('商务');
        break;
      case 'TECHNOLOGY':
        weightField = 'technologyWeight';
        weightTitleEng = weightType.toLowerCase();
        weightTitleZH = intl.get(`ssrc.bidHall.model.bidHall.technology`).d('技术');
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
    this[field] = val;
    dataList.forEach((item) => {
      if (!item.$form) {
        return;
      }

      item.$form.setFieldsValue({
        [field]: val,
      });
    });
  }

  /**
   * 打开修改权重modal
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
   * 关闭修改权重modal
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
   * 渲染改变权重输入框
   *
   * @param {string} [type='']
   * @param {*} [dataList=[]]
   * @returns
   * @memberof ScoringElementsTable
   */
  renderWeight(type = '', dataList = []) {
    if (!type || !dataList.length) {
      return;
    }

    if (type === 'BUSINESS') {
      return (
        <React.Fragment>
          (
          <span style={{ marginRight: '6px' }}>
            {this.businessWeight || this.setInputDefault('businessWeight', dataList) || 50} %
          </span>
          <img src={Editing} alt="" onClick={() => this.openWeightModal(type, dataList)} />)
        </React.Fragment>
      );
    } else if (type === 'TECHNOLOGY') {
      return (
        <React.Fragment>
          (
          <span style={{ marginRight: '6px' }}>
            {this.technologyWeight || this.setInputDefault('technologyWeight', dataList) || 50} %
          </span>
          <img src={Editing} alt="" onClick={() => this.openWeightModal(type, dataList)} />)
        </React.Fragment>
      );
    } else {
      return null;
    }
  }

  setWeightModalTitle() {
    const { weightTitleEng = '' } = this.dividerExpert();

    return (
      <div>
        {intl.get(`ssrc.bidHall.model.bidHall.modification`).d('修改')}
        {weightTitleEng === 'business'
          ? intl.get(`ssrc.bidHall.model.bidHall.business`).d('商务')
          : intl.get(`ssrc.bidHall.model.bidHall.technology`).d('技术')}
        {intl.get(`ssrc.bidHall.model.bidHall.weight`).d('权重')}
      </div>
    );
  }

  // 评分细则modal
  @Bind()
  handleShowRemarkModal(record = {}) {
    const recordFormData = record.$form.getFieldsValue();
    const { calculateType, evaluateIndicDetail } = recordFormData;
    if (calculateType === 'AUTO') {
      this.setState({
        remarkVisible: true,
        remarkRecord: {
          ...record,
          ...recordFormData,
          evaluateIndicDetail: { ...evaluateIndicDetail, indicId: undefined },
        },
      });
    }
  }

  /**
   * 修改计算方式
   */
  @Bind()
  handleChangeCalculateType(value, record) {
    record.$form.setFieldsValue(
      Object.assign(
        {
          indicateRemark: null,
        },
        value !== 'AUTO' && { scoreType: null, evaluateIndicDetail: null }
      )
    );
  }

  // 关闭弹窗
  @Bind()
  handleCloseRemarkModal() {
    this.setState({
      remarkVisible: false,
      remarkRecord: {},
    });
  }

  // 保存Modal信息
  @Bind()
  handleChangeRemarkModal(record = {}) {
    const {
      dispatch,
      scoringNoneTempelate,
      scoringBusinessTempelate,
      scoringTechnologyTempelate,
      code: { benchmarkPriceMethod = [], formula = [] },
    } = this.props;
    const { rowKey } = this.state;
    const { evaluateIndicDetail = {}, expertCategory } = record;
    const {
      scoreType,
      calculateType,
      maxScore = null,
      minScore = null,
    } = record.$form.getFieldsValue();

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

    const formulaDetail = `${intl
      .get('ssrc.score.model.score.priceCFormula')
      .d('价格计算公式')}:${valueMapMeaning(
      formula,
      evaluateIndicDetail.formula
    )}, ${scoreFormulaRender(evaluateIndicDetail)}`;
    const indicateRemark =
      calculateType === 'AUTO'
        ? `${benchmarkPriceDetail}${formulaDetail}`
        : `${evaluateIndicDetail.remark}`;
    let calcMinScore = minScore;
    if (scoreType === 'PRICE' && maxScore) {
      calcMinScore = (evaluateIndicDetail.lowestScore * maxScore) / 100;
    }

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

    record.$form.setFieldsValue({
      indicateRemark,
      evaluateIndicDetail: {
        ...evaluateIndicDetail,
      },
      minScore: calcMinScore,
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

  renderModalInput() {
    const { weightData = [], weightField = '' } = this.dividerExpert();

    return (
      <Form.Item>
        <InputNumber
          onChange={(val) => this.changeWeight(val, weightData, weightField)}
          min={0}
          max={100}
          style={{ width: '100%' }}
          precision={2}
          defaultValue={this[weightField] || this.setInputDefault(weightField, weightData) || 50}
        />
      </Form.Item>
    );
  }

  // 批量新增
  newImportButton = (type = '') => {
    const { match = {}, organizationId, header = {}, fetchScoring = () => {} } = this.props;
    const { bidHeaderId, templateId } = header || {};
    const code = 'SSRC.BID_EVALUATE_INDIC';

    const ImportProps = {
      businessObjectTemplateCode: code,
      prefixPatch: SRM_SSRC,
      refreshButton: true,
      name: 'itemImportNew',
      args: {
        sourceHeaderId: bidHeaderId,
        tenantId: organizationId,
        templateId,
        expertCategory: type,
        teamWeight: type === 'BUSINESS' || type === 'TECHNOLOGY' ? 50 : 100,
        sourceFrom: 'BID',
      },
      buttonProps: {
        style: {
          marginLeft: '8px',
        },
        // funcType: 'flat',
        icon: 'archive',
        // color: 'primary',
        permissionList: [
          {
            code: `${match?.path}.button.batch-import-detail-new`.toLowerCase(),
            type: 'button',
            meaning:
              intl.get(`ssrc.bidHall.view.message.title.bidMaintenance`).d('招标书维护') -
              `${intl.get('ssrc.inquiryHall.view.button.allCreate').d('批量创建')}(New)`,
          },
        ],
      },
      buttonText: `${intl.get('ssrc.inquiryHall.view.button.allCreate').d('批量创建')}(New)`,
      autoRefreshInterval: 5000,
      tenantId: organizationId,
      action: 'hzero.common.title.batchImport',
      auto: true,
      successCallBack: fetchScoring,
    };

    return <CommonImportNew {...ImportProps} />;
  };

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
      // onSaveScoringElements,
      onCreateScoringElements,
      onDeleteScoringElements,
      saveAllScoringTemplate,
      onImportScoringElements,
      // saveLoading,
      loading,
      header,
      // scoringSaveType,
      scoringElementSelectedRowKeys,
      scoringLineRowSelection,
      openAssignExpertModal,
      indicateTypes,
      customizeTable,
      calculateTypes = [],
      scoreTypes = [],
      selectedInfo = {},
    } = this.props;
    const { scoringElementSelectedRows = [], onChange = () => {} } = scoringLineRowSelection;
    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.indicateCode`).d('要素编码'),
        dataIndex: 'indicateId',
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
                {/* {record.$form.getFieldDecorator('evaluateIndicDetail', {
                  initialValue: record.evaluateIndicDetail,
                })} */}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {!loading &&
                  record.$form.getFieldDecorator('evaluateIndicDetail', {
                    initialValue: record.evaluateIndicDetail,
                  })(<div />)}
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
                      initialValue: record.businessWeight || 50,
                    })(<div />)}
                  </React.Fragment>
                ) : (
                  ''
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {type === 'TECHNOLOGY' ? (
                  <React.Fragment>
                    {record.$form.getFieldDecorator('technologyWeight', {
                      initialValue: record.technologyWeight || 50,
                    })(<div />)}
                  </React.Fragment>
                ) : (
                  ''
                )}
              </Form.Item>
            </React.Fragment>
          ) : (
            record.ouName
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.indicateNames`).d('要素名称'),
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
                      name: intl.get(`ssrc.bidHall.model.bidHall.indicateNames`).d('要素名称'),
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
        title: intl.get(`ssrc.bidHall.model.bidHall.indicateType`).d('要素类型'),
        dataIndex: 'indicateTypeMeaning',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('indicateType', {
                  initialValue: record.indicateType,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.bidHall.model.bidHall.indicateType`).d('要素类型'),
                      }),
                    },
                  ],
                })(
                  <Select style={{ width: '100px' }}>
                    {indicateTypes &&
                      indicateTypes.map((item) => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                  </Select>
                )}
              </Form.Item>
            </React.Fragment>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.calculateType`).d('计算方式'),
        dataIndex: 'calculateType',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('calculateType', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.calculateType`).d('计算方式'),
                    }),
                  },
                ],
              })(
                <Select
                  disabled={record.$form.getFieldValue('indicateId')}
                  style={{ width: '100%' }}
                  onChange={(value) => this.handleChangeCalculateType(value, record)}
                >
                  {calculateTypes &&
                    calculateTypes.map((item) => (
                      <Select.Option
                        key={item.value}
                        value={item.value}
                        disabled={type === 'TECHNOLOGY' && item.value === 'AUTO'}
                      >
                        {item.meaning}
                      </Select.Option>
                    ))}
                </Select>
              )}
            </Form.Item>
          ) : (
            record.calculateTypeMeaning
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.scoreType`).d('评分类型'),
        dataIndex: 'scoreType',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('scoreType', {
                initialValue: val,
                rules: [
                  {
                    required: record.$form.getFieldValue('calculateType') === 'AUTO',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.scoreType`).d('评分类型'),
                    }),
                  },
                ],
              })(
                <Select
                  disabled={
                    record.$form.getFieldValue('calculateType') === 'MANUAL' ||
                    record.$form.getFieldValue('indicateId')
                  }
                  style={{ width: '100%' }}
                >
                  {scoreTypes &&
                    scoreTypes.map((item) => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                </Select>
              )}
            </Form.Item>
          ) : (
            record.scoreTypeMeaning
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.scoreDetails`).d('评分细则'),
        dataIndex: 'indicateRemark',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('indicateRemark', {
                initialValue: record.indicateRemark,
                rules: [
                  {
                    required: record.$form.getFieldValue('calculateType') === 'AUTO',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.scoreDetails`).d('评分细则'),
                    }),
                  },
                ],
              })(
                record.$form.getFieldValue('calculateType') === 'AUTO' ? (
                  record.$form.getFieldValue('indicateRemark') ? (
                    <Tooltip title={<span>{record.$form.getFieldValue('indicateRemark')}</span>}>
                      <Search
                        readOnly
                        value={record.$form.getFieldValue('indicateRemark')}
                        style={{ width: '100%' }}
                        onSearch={() => this.handleShowRemarkModal(record)}
                      />
                    </Tooltip>
                  ) : (
                    <Search
                      readOnly
                      value={record.$form.getFieldValue('indicateRemark')}
                      style={{ width: '100%' }}
                      onSearch={() => this.handleShowRemarkModal(record)}
                    />
                  )
                ) : (
                  <Input style={{ width: '100%' }} />
                )
              )}
            </Form.Item>
          ) : (
            record.indicateRemark
          ),
      },
      header.templateScoreType !== 'SCORE'
        ? {
            title: intl.get(`ssrc.bidHall.model.bidHall.weight`).d('权重'),
            dataIndex: 'weight',
            width: 120,
            render: (val, record) =>
              ['create', 'update'].includes(record._status) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('weight', {
                    initialValue: record.weight,
                    rules: [
                      {
                        required:
                          // record.$form.getFieldValue('indicateType') === 'SCORE' &&
                          header.templateScoreType === 'WEIGHT',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.bidHall.model.bidHall.weight`).d('权重'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      precision={2}
                      style={{ width: '100%' }}
                      // disabled={record.$form.getFieldValue('indicateType') === 'PASS'}
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
            title: intl.get(`ssrc.bidHall.model.bidHall.minScore`).d('最低分'),
            dataIndex: 'minScore',
            width: 120,
            render: (val, record) =>
              ['create', 'update'].includes(record._status) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('minScore', {
                    initialValue: record.minScore,
                    rules: [
                      {
                        required:
                          record.$form.getFieldValue('scoreType') !== 'PRICE' &&
                          header.templateScoreType === 'SCORE',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.bidHall.model.bidHall.minScore`).d('最低分'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      precision={2}
                      style={{ width: '100%' }}
                      disabled={
                        record.$form.getFieldValue('scoreType') === 'PRICE' ||
                        header.templateScoreType !== 'SCORE'
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
            title: intl.get(`ssrc.bidHall.model.bidHall.maxScore`).d('最高分'),
            dataIndex: 'maxScore',
            width: 120,
            render: (val, record) =>
              ['create', 'update'].includes(record._status) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('maxScore', {
                    initialValue: record.maxScore,
                    rules: [
                      {
                        required: header.templateScoreType === 'SCORE',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.bidHall.model.bidHall.maxScore`).d('最高分'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      precision={2}
                      style={{ width: '100%' }}
                      disabled={header.templateScoreType !== 'SCORE'}
                    />
                  )}
                </Form.Item>
              ) : (
                record.maxScore
              ),
          }
        : null,
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.expertDistribution`).d('专家分配'),
        width: 100,
        fixed: 'right',
        render: (_, record) => (
          <Form.Item>
            {record._status === 'update' ? (
              <a onClick={() => openAssignExpertModal(record)}>
                {intl.get(`ssrc.bidHall.view.message.button.distribution`).d('分配')}
              </a>
            ) : (
              ''
            )}
          </Form.Item>
        ),
      },
    ].filter(Boolean);

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 300)));
    const getDelDisabledFlag = () => {
      // 对应技术组有选中数据时才可点击删除按钮
      const isEmptyFlag = scoringElementSelectedRowKeys.length === 0;
      if (type === 'BUSINESS') {
        const flag =
          (selectedInfo?.selectedBUSINESS || []).some((i) => i.team !== 'BUSINESS') ||
          isEmptyFlag ||
          isEmpty(selectedInfo?.selectedBUSINESS);
        return flag;
      }
      if (type === 'TECHNOLOGY') {
        const flag =
          (selectedInfo?.selectedTECHNOLOGY || []).some((i) => i.team !== 'TECHNOLOGY') ||
          isEmptyFlag ||
          isEmpty(selectedInfo?.selectedTECHNOLOGY);
        return flag;
      }
      return isEmptyFlag;
    };
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
            <Button
              type="primary"
              onClick={() =>
                onCreateScoringElements(type, {
                  businessWeight: this.businessWeight,
                  technologyWeight: this.technologyWeight,
                })
              }
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
            {/* <Button
              onClick={() => onSaveScoringElements(type)}
              loading={scoringSaveType === type ? saveLoading : ''}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button> */}
            <Button
              icon="arrow-down"
              onClick={() => onImportScoringElements(type)}
              // loading={deleteLoading}
            >
              {intl.get('ssrc.inquiryHall.view.button.allCreate').d('批量创建')}
            </Button>
            {this.newImportButton(type)}
            <Lov
              isButton
              type="default"
              onOk={saveAllScoringTemplate}
              queryParams={{
                enabledFlag: 1,
                expertCategory: type,
                bidRuleType: header.bidRuleType,
                templatePurpose: 'EXPERT_SCORE',
                scoreMode: type ? 'DIFF' : 'NONE',
                sourceFrom: 'BID',
                scoreTemplateScoreType: header.templateScoreType,
              }}
              code="SSRC.SCORE_TEMPL"
            >
              {intl.get(`ssrc.bidHall.view.button.referTemplate`).d('参考模板')}
            </Lov>
            <Button onClick={() => onDeleteScoringElements(type)} disabled={getDelDisabledFlag()}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          </Form>
        </div>
        {customizeTable(
          {
            code:
              type === 'TECHNOLOGY'
                ? 'SSRC.BID_HALL_EDIT.SCORE_INDICS_TECHNOLOGY'
                : 'SSRC.BID_HALL_EDIT.SCORE_INDICS',
            dataSource: dataLists,
          },
          <EditTable
            bordered
            rowKey="evaluateIndicId"
            loading={loading}
            columns={columns}
            // rowSelection={scoringLineRowSelection}
            rowSelection={{
              scoringElementSelectedRows,
              onChange: (...args) => onChange(...args, type),
            }}
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

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      code,
      header,
      scoringNoneTempelate,
      scoringBusinessTempelate,
      scoringTechnologyTempelate,
      evaluateAssignModalVisible,
      cancelAssignExpert,
      saveScoringAssignExpert,
      currentScoringExperts,
      fetchEvaluateIndicAssignLoading,
    } = this.props;

    const { remarkVisible = false, remarkRecord = {} } = this.state;

    const { benchmarkPriceMethod = [], formula = [] } = code || {};

    const expertColumns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.expertAcct`).d('专家子账户'),
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
        title: intl.get(`ssrc.bidHall.model.bidHall.expertName`).d('专家名称'),
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
        title: intl.get(`ssrc.bidHall.model.bidHall.whetherDistribute`).d('是否分配'),
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

    const remarkModalProps = {
      visible: remarkVisible,
      record: remarkRecord,
      benchmarkPriceMethod,
      formula,
      onHideModal: this.handleCloseRemarkModal,
      onChangeRemarkModal: this.handleChangeRemarkModal,
    };

    return (
      <div>
        {header.bidRuleType === 'NONE' && this._renderTableList('', '', scoringNoneTempelate)}
        {header.bidRuleType !== 'NONE' &&
          this._renderTableList(
            intl.get(`ssrc.bidHall.model.bidHall.businessTeam`).d('商务组'),
            'BUSINESS',
            scoringBusinessTempelate
          )}
        {header.bidRuleType !== 'NONE' &&
          this._renderTableList(
            intl.get(`ssrc.bidHall.model.bidHall.technologyTeam`).d('技术组'),
            'TECHNOLOGY',
            scoringTechnologyTempelate
          )}
        <Modal
          visible={evaluateAssignModalVisible}
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{intl.get(`ssrc.bidHall.model.bidHall.assignExpert`).d('分配专家')}</span>
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
        {remarkVisible && <RemarkModal {...remarkModalProps} />}
      </div>
    );
  }
}
