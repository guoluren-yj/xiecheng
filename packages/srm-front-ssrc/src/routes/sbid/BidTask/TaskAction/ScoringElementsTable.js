import React, { PureComponent } from 'react';
import { Form, Button, Modal, Input, InputNumber, Select, Tooltip } from 'hzero-ui';
import { sum, isNumber, isFunction, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
// import Upload from 'srm-front-boot/lib/components/Upload';
import Lov from 'components/Lov';
import notification from 'utils/notification';
import { valueMapMeaning } from 'utils/renderer';

import { scoreFormulaRender } from '@/utils/renderer';
import RemarkModal from '../../components/ScoreRemark/RemarkModal';

import styles from './index.less';

const { Search } = Input;

@Form.create({ fieldNameProp: null })
export default class ScoringElementsTable extends PureComponent {
  constructor(props) {
    super(props);
    this.rowKey = 'evaluateIndicId';
    this.state = {
      onDistributionVisible: false,
      remarkVisible: false, // 评分细则modal
      remarkRecord: {}, // 评分细则
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (isFunction(onRef)) {
      onRef(this);
    }
  }

  @Bind()
  onReferTemplateOk(value) {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidTask/fetchScoringTemplate',
      payload: {
        organizationId,
        sourceHeaderId: params.bidId,
        sourceFrom: 'BID',
        team: 'DIFF',
        templateId: value.templateId,
        templatePurpose: value.templatePurpose,
      },
    }).then((res) => {
      if (res) {
        // 刷新当前单据
        dispatch({
          type: 'bidTask/fetchScoringElement',
          // payload: { organizationId, bidHeaderId: params.bidId, sourceFrom, path },
          payload: { organizationId, bidHeaderId: params.bidId, sourceFrom: 'BID' },
        });
        notification.success();
      }
    });
  }

  @Bind()
  onNoneReferTemplateOk(value) {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidTask/fetchScoringTemplate',
      payload: {
        organizationId,
        sourceHeaderId: params.bidId,
        sourceFrom: 'BID',
        team: 'NONE',
        templateId: value.templateId,
        templatePurpose: value.templatePurpose,
      },
    }).then((res) => {
      if (res) {
        // 刷新当前单据
        dispatch({
          type: 'bidTask/fetchScoringElement',
          // payload: { organizationId, bidHeaderId: params.bidId, sourceFrom, path },
          payload: { organizationId, bidHeaderId: params.bidId, sourceFrom: 'BID' },
        });
        notification.success();
      }
    });
  }

  /**
   * 不区分专家分配
   */
  @Bind()
  onAssign(val) {
    const {
      match: { path },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidTask/fetchScoringAssign',
      payload: { organizationId, evaluateIndicId: val.evaluateIndicId, path },
    });

    this.setState({
      onDistributionVisible: true,
    });
  }

  /**
   * 商务专家分配
   */
  @Bind()
  onBussAssign(val) {
    const {
      match: { path },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidTask/fetchScoringAssign',
      payload: {
        organizationId,
        evaluateIndicId: val.evaluateIndicId,
        path,
        evaluateIndicCategory: 'BUSINESS',
      },
    });
    this.setState({
      onDistributionVisible: true,
    });
  }

  /**
   * 技术专家分配
   */
  @Bind()
  onTechAssign(val) {
    const {
      match: { path },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidTask/fetchScoringAssign',
      payload: {
        organizationId,
        evaluateIndicId: val.evaluateIndicId,
        path,
        evaluateIndicCategory: 'TECHNOLOGY',
      },
    });
    this.setState({
      onDistributionVisible: true,
    });
  }

  @Bind()
  handleDistributionCancel() {
    this.setState({
      onDistributionVisible: false,
    });
  }

  /**
   * 是否分配
   */
  @Bind()
  setValue(e, val, record) {
    if (e.target.checked === 0) {
      record.$form.setFieldsValue({ assignFlag: 0 });
    }
  }

  /**
   * 分配保存
   */
  @Bind()
  scoringAssignSave() {
    const { onScoringAssignSave } = this.props;
    this.setState({
      onDistributionVisible: false,
    });
    onScoringAssignSave();
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
      ScoringElement,
      code: { benchmarkPriceMethod = [], formula = [] },
      ScoringElement: { businessIndicList = [], technologyIndicList = [], otherIndicList = [] },
    } = this.props;
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
        ? otherIndicList.map((item) =>
            record[this.rowKey] === item[this.rowKey]
              ? { ...item, ...record, evaluateIndicDetail, indicateRemark }
              : item
          )
        : record.expertCategory === 'BUSINESS'
        ? businessIndicList.map((item) =>
            record[this.rowKey] === item[this.rowKey]
              ? { ...item, ...record, evaluateIndicDetail, indicateRemark }
              : item
          )
        : technologyIndicList.map((item) =>
            record[this.rowKey] === item[this.rowKey]
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

    const covertElement =
      expertCategory === 'BUSINESS_TECHNOLOGY'
        ? { otherIndicList: newDataList }
        : expertCategory === 'BUSINESS'
        ? { businessIndicList: newDataList }
        : { technologyIndicList: newDataList };

    dispatch({
      type: 'bidTask/updateState',
      payload: {
        ScoringElement: {
          ...ScoringElement,
          ...covertElement,
        },
      },
    });
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
   * render
   * @returns React.element
   */
  render() {
    const {
      code,
      customizeTable,
      loading,
      saveLoading,
      saveScorLoading,
      deleteScorLoading,
      saveAssignLoading,
      deleteScoringLoading,
      // dispatch,
      match: { params },
      ScoringElement,
      onCreateBusiness,
      onCreateTech,
      onCreateLine,
      onDeleteBusiness,
      onDeleteTech,
      onDeleteLine,
      onSaveBusiness,
      onSaveTech,
      onSaveLine,
      businessScoringRowSelection,
      businessScoringRowKeys = [],
      techScoringRowSelection,
      techScoringRowKeys = [],
      scoringRowSelection,
      scoringRowKeys = [],
      ScoringAssign,
      // organizationId,
    } = this.props;
    const { onDistributionVisible, remarkVisible = false, remarkRecord = {} } = this.state;

    const {
      benchmarkPriceMethod = [],
      formula = [],
      scoreTypes = [],
      calculateTypes = [],
      indicateTypes = [],
    } = code || {};

    // 若所选寻源模板中评标步制（即之前的开标步制）为【同时评标】（即之前的同时开标），为columns
    const columns = [
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.indicateCode`).d('要素编码'),
        dataIndex: 'indicateId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('indicateId', {
                  initialValue: record.indicateId,
                })(
                  <Lov
                    code="SSRC.SCORE_INDIC"
                    textValue={record.indicateCode}
                    onChange={(value, dataList) =>
                      this.changeScoringElement(value, dataList, record)
                    }
                    queryParams={{
                      expertCategory: 'BUSINESS_TECHNOLOGY',
                      indicateType: 'SCORE',
                    }}
                    // onChange={(value, dataList) => this.changeOuId(value, dataList, record)}
                  />
                )}
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
            </React.Fragment>
          ) : (
            record.indicateCode
          ),
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.indicateName`).d('要素名称'),
        dataIndex: 'indicateName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('indicateName', {
                initialValue: record.indicateName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidTask.model.bidTask.indicateNames`).d('要素名称'),
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
        title: intl.get(`ssrc.bidTask.model.bidTask.indicateType`).d('要素类型'),
        dataIndex: 'indicateTypeMeaning',
        width: 200,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('indicateType', {
                initialValue: record.indicateType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidTask.model.bidTask.indicateType`).d('要素类型'),
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
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.calculateType`).d('计算方式'),
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
                      name: intl.get(`ssrc.bidTask.model.bidTask.calculateType`).d('计算方式'),
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
                      <Select.Option key={item.value} value={item.value}>
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
        title: intl.get(`ssrc.bidTask.model.bidTask.scoreType`).d('评分类型'),
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
                      name: intl.get(`ssrc.bidTask.model.bidTask.scoreType`).d('评分类型'),
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
        title: intl.get(`ssrc.bidTask.model.bidTask.scoreDetails`).d('评分细则'),
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
                      name: intl.get(`ssrc.bidTask.model.bidTask.scoreDetails`).d('评分细则'),
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
      params.templateScoreType !== 'SCORE'
        ? {
            title: intl.get(`ssrc.bidTask.model.bidTask.weight`).d('权重'),
            dataIndex: 'weight',
            width: 150,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('weight', {
                    initialValue: record.weight,
                    rules: [
                      {
                        required:
                          record.$form.getFieldValue('indicateType') === 'SCORE' &&
                          params.templateScoreType === 'WEIGHT',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.bidTask.model.bidTask.weight`).d('权重'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      precision={2}
                      style={{ width: '100%' }}
                      disabled={record.$form.getFieldValue('indicateType') === 'PASS'}
                    />
                  )}
                </Form.Item>
              ) : (
                record.weight
              ),
          }
        : null,
      params.templateScoreType !== 'WEIGHT'
        ? {
            title: intl.get(`ssrc.bidTask.model.bidTask.minScore`).d('最低分'),
            dataIndex: 'minScore',
            width: 150,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('minScore', {
                    initialValue: record.minScore,
                    rules: [
                      {
                        required:
                          record.$form.getFieldValue('scoreType') !== 'PRICE' &&
                          params.templateScoreType === 'SCORE',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.bidTask.model.bidTask.minScore`).d('最低分'),
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
                        params.templateScoreType !== 'SCORE'
                      }
                    />
                  )}
                </Form.Item>
              ) : (
                record.minScore
              ),
          }
        : null,
      params.templateScoreType !== 'WEIGHT'
        ? {
            title: intl.get(`ssrc.bidTask.model.bidTask.maxScore`).d('最高分'),
            dataIndex: 'maxScore',
            width: 150,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('maxScore', {
                    initialValue: record.maxScore,
                    rules: [
                      {
                        required: params.templateScoreType === 'SCORE',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.bidTask.model.bidTask.maxScore`).d('最高分'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      precision={2}
                      style={{ width: '100%' }}
                      disabled={params.templateScoreType !== 'SCORE'}
                    />
                  )}
                </Form.Item>
              ) : (
                record.maxScore
              ),
          }
        : null,
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.expertAssignent`).d('专家分配'),
        dataIndex: 'expertDistribute',
        width: 100,
        render: (_, record) => (
          <Form.Item>
            {record._status === 'update' ? (
              <a onClick={() => this.onAssign(record)}>
                {intl.get(`ssrc.bidTask.view.message.button.distribution`).d('分配')}
              </a>
            ) : (
              ''
            )}
          </Form.Item>
        ),
      },
    ].filter(Boolean);
    // 否则为商务组columnsBusiness、技术组columnsTech
    const columnsBusiness = [
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.indicateCode`).d('要素编码'),
        dataIndex: 'indicateId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('indicateId', {
                  initialValue: record.indicateId,
                })(
                  <Lov
                    code="SSRC.SCORE_INDIC"
                    textValue={record.indicateCode}
                    onChange={(value, dataList) =>
                      this.changeScoringElement(value, dataList, record)
                    }
                    queryParams={{
                      expertCategory: 'BUSINESS',
                      indicateType: 'SCORE',
                    }}
                    // onChange={(value, dataList) => this.changeOuId(value, dataList, record)}
                  />
                )}
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
            </React.Fragment>
          ) : (
            record.indicateCode
          ),
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.indicateName`).d('要素名称'),
        dataIndex: 'indicateName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('indicateName', {
                initialValue: record.indicateName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidTask.model.bidTask.indicateNames`).d('要素名称'),
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
        title: intl.get(`ssrc.bidTask.model.bidTask.indicateType`).d('要素类型'),
        dataIndex: 'indicateTypeMeaning',
        width: 200,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('indicateType', {
                initialValue: record.indicateType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidTask.model.bidTask.indicateType`).d('要素类型'),
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
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.calculateType`).d('计算方式'),
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
                      name: intl.get(`ssrc.bidTask.model.bidTask.calculateType`).d('计算方式'),
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
                      <Select.Option key={item.value} value={item.value}>
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
        title: intl.get(`ssrc.bidTask.model.bidTask.scoreType`).d('评分类型'),
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
                      name: intl.get(`ssrc.bidTask.model.bidTask.scoreType`).d('评分类型'),
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
        title: intl.get(`ssrc.bidTask.model.bidTask.scoreDetails`).d('评分细则'),
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
                      name: intl.get(`ssrc.bidTask.model.bidTask.scoreDetails`).d('评分细则'),
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
      params.templateScoreType !== 'SCORE'
        ? {
            title: intl.get(`ssrc.bidTask.model.bidTask.businessWeight`).d('权重'),
            dataIndex: 'businessWeight',
            width: 150,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('weight', {
                    initialValue: record.weight,
                    rules: [
                      {
                        required:
                          record.$form.getFieldValue('indicateType') === 'SCORE' &&
                          params.templateScoreType === 'WEIGHT',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.bidTask.model.bidTask.weight`).d('权重'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      precision={2}
                      style={{ width: '100%' }}
                      disabled={record.$form.getFieldValue('indicateType') === 'PASS'}
                    />
                  )}
                </Form.Item>
              ) : (
                record.weight
              ),
          }
        : null,
      params.templateScoreType !== 'WEIGHT'
        ? {
            title: intl.get(`ssrc.bidTask.model.bidTask.minScore`).d('最低分'),
            dataIndex: 'minScore',
            width: 150,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('minScore', {
                    initialValue: record.minScore,
                    rules: [
                      {
                        required:
                          record.$form.getFieldValue('indicateType') === 'SCORE' &&
                          params.templateScoreType === 'SCORE',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.bidTask.model.bidTask.minScore`).d('最低分'),
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
                        params.templateScoreType !== 'SCORE'
                      }
                    />
                  )}
                </Form.Item>
              ) : (
                record.minScore
              ),
          }
        : null,
      params.templateScoreType !== 'WEIGHT'
        ? {
            title: intl.get(`ssrc.bidTask.model.bidTask.maxScore`).d('最高分'),
            dataIndex: 'maxScore',
            width: 150,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('maxScore', {
                    initialValue: record.maxScore,
                    rules: [
                      {
                        required: params.templateScoreType === 'SCORE',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.bidTask.model.bidTask.maxScore`).d('最高分'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      precision={2}
                      style={{ width: '100%' }}
                      disabled={params.templateScoreType !== 'SCORE'}
                    />
                  )}
                </Form.Item>
              ) : (
                record.maxScore
              ),
          }
        : null,
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.expertAssignent`).d('专家分配'),
        dataIndex: 'expertDistribute',
        width: 100,
        render: (_, record) => (
          <Form.Item>
            {record._status === 'update' ? (
              <a onClick={() => this.onBussAssign(record)}>
                {intl.get(`ssrc.bidTask.view.message.button.distribution`).d('分配')}
              </a>
            ) : (
              ''
            )}
          </Form.Item>
        ),
      },
    ].filter(Boolean);
    const columnsTech = [
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.indicateCode`).d('要素编码'),
        dataIndex: 'indicateId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('indicateId', {
                  initialValue: record.indicateId,
                })(
                  <Lov
                    code="SSRC.SCORE_INDIC"
                    textValue={record.indicateCode}
                    onChange={(value, dataList) =>
                      this.changeScoringElement(value, dataList, record)
                    }
                    queryParams={{ expertCategory: 'TECHNOLOGY', indicateType: 'SCORE' }}
                    // onChange={(value, dataList) => this.changeOuId(value, dataList, record)}
                  />
                )}
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
            </React.Fragment>
          ) : (
            record.indicateCode
          ),
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.indicateName`).d('要素名称'),
        dataIndex: 'indicateName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('indicateName', {
                initialValue: record.indicateName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidTask.model.bidTask.indicateNames`).d('要素名称'),
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
        title: intl.get(`ssrc.bidTask.model.bidTask.indicateType`).d('要素类型'),
        dataIndex: 'indicateTypeMeaning',
        width: 200,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('indicateType', {
                initialValue: record.indicateType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidTask.model.bidTask.indicateType`).d('要素类型'),
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
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.calculateType`).d('计算方式'),
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
                      name: intl.get(`ssrc.bidTask.model.bidTask.calculateType`).d('计算方式'),
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
                        disabled={item.value === 'AUTO'}
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
        title: intl.get(`ssrc.bidTask.model.bidTask.scoreType`).d('评分类型'),
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
                      name: intl.get(`ssrc.bidTask.model.bidTask.scoreType`).d('评分类型'),
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
        title: intl.get(`ssrc.bidTask.model.bidTask.scoreDetails`).d('评分细则'),
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
                      name: intl.get(`ssrc.bidTask.model.bidTask.scoreDetails`).d('评分细则'),
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
      params.templateScoreType !== 'SCORE'
        ? {
            title: intl.get(`ssrc.bidTask.model.bidTask.businessWeight`).d('权重'),
            dataIndex: 'technologyWeight',
            width: 150,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('weight', {
                    initialValue: record.weight,
                    rules: [
                      {
                        required:
                          record.$form.getFieldValue('indicateType') === 'SCORE' &&
                          params.templateScoreType === 'WEIGHT',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.bidTask.model.bidTask.weight`).d('权重'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      precision={2}
                      style={{ width: '100%' }}
                      disabled={record.$form.getFieldValue('indicateType') === 'PASS'}
                    />
                  )}
                </Form.Item>
              ) : (
                record.weight
              ),
          }
        : null,
      params.templateScoreType !== 'WEIGHT'
        ? {
            title: intl.get(`ssrc.bidTask.model.bidTask.minScore`).d('最低分'),
            dataIndex: 'minScore',
            width: 150,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('minScore', {
                    initialValue: record.minScore,
                    rules: [
                      {
                        required:
                          record.$form.getFieldValue('scoreType') !== 'PRICE' &&
                          params.templateScoreType === 'SCORE',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.bidTask.model.bidTask.minScore`).d('最低分'),
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
                        params.templateScoreType !== 'SCORE'
                      }
                    />
                  )}
                </Form.Item>
              ) : (
                record.minScore
              ),
          }
        : null,
      params.templateScoreType !== 'WEIGHT'
        ? {
            title: intl.get(`ssrc.bidTask.model.bidTask.maxScore`).d('最高分'),
            dataIndex: 'maxScore',
            width: 150,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('maxScore', {
                    initialValue: record.maxScore,
                    rules: [
                      {
                        required: params.templateScoreType === 'SCORE',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.bidTask.model.bidTask.maxScore`).d('最高分'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      precision={2}
                      style={{ width: '100%' }}
                      disabled={params.templateScoreType !== 'SCORE'}
                    />
                  )}
                </Form.Item>
              ) : (
                record.maxScore
              ),
          }
        : null,
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.expertAssignent`).d('专家分配'),
        dataIndex: 'expertDistribute',
        width: 100,
        render: (_, record) => (
          <Form.Item>
            {record._status === 'update' ? (
              <a onClick={() => this.onTechAssign(record)}>
                {intl.get(`ssrc.bidTask.view.message.button.distribution`).d('分配')}
              </a>
            ) : (
              ''
            )}
          </Form.Item>
        ),
      },
    ].filter(Boolean);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const scrollXBusiness = sum(columnsBusiness.map((n) => (isNumber(n.width) ? n.width : 0)));
    const scrollXTech = sum(columnsTech.map((n) => (isNumber(n.width) ? n.width : 0)));
    // 专家分配
    const columnsAssign = [
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.expertSubAccount`).d('专家子账户'),
        dataIndex: 'loginName',
        width: 100,
        render: (val) => val,
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.expertName`).d('专家姓名'),
        dataIndex: 'expertName',
        width: 100,
        render: (val) => val,
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.leaderFlag`).d('专家组长'),
        dataIndex: 'leaderFlag',
        width: 60,
        render: (val) => (
          <Form.Item>
            <Checkbox checkedValue={1} unCheckedValue={0} defaultChecked={val} disabled />
          </Form.Item>
        ),
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.assignFlag`).d('是否分配'),
        dataIndex: 'assignFlag',
        width: 60,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('assignFlag', {
              initialValue: val,
            })(
              <Checkbox
                checkedValue={1}
                unCheckedValue={0}
                defaultChecked={val}
                onChange={(e) => this.setValue(e, val, record)}
              />
            )}
          </Form.Item>
        ),
      },
    ];
    const scrollXAssign = sum(columnsAssign.map((n) => (isNumber(n.width) ? n.width : 0)));

    const remarkModalProps = {
      visible: remarkVisible,
      record: remarkRecord,
      benchmarkPriceMethod,
      formula,
      onHideModal: this.handleCloseRemarkModal,
      onChangeRemarkModal: this.handleChangeRemarkModal,
    };

    return (
      <React.Fragment>
        {params.bidRuleType === 'DIFF' && (
          <React.Fragment>
            <div className={styles['item-list-search']}>
              <Form layout="inline">
                <Lov
                  isButton
                  type="default"
                  onOk={this.onReferTemplateOk}
                  queryParams={{
                    scoreMode: params.bidRuleType,
                    // bidRuleType: header.bidRuleType,
                    templatePurpose: 'EXPERT_SCORE',
                    scoreTemplateScoreType: params.templateScoreType,
                  }}
                  code="SSRC.REFERENCE_SCORE_TEMPL"
                >
                  {intl.get('hzero.common.button.referTemplate').d('参考模板')}
                </Lov>
              </Form>
            </div>
            <h3 style={{ float: 'left', display: 'inline-block' }}>
              {intl.get(`ssrc.bidTask.model.bidTask.buss`).d('商务组：')}
            </h3>
            {/* 商务组 */}
            <div className={styles['item-list-search']}>
              <Form layout="inline">
                <Button type="primary" onClick={onCreateBusiness}>
                  {intl.get('hzero.common.button.create').d('新建')}
                </Button>
                <Button
                  onClick={onSaveBusiness}
                  disabled={ScoringElement ? isEmpty(ScoringElement.businessIndicList) : true}
                  loading={saveScorLoading === 'business' && saveLoading}
                >
                  {intl.get('hzero.common.button.save').d('保存')}
                </Button>
                <Button
                  onClick={onDeleteBusiness}
                  loading={deleteScorLoading === 'business' && deleteScoringLoading}
                  disabled={businessScoringRowKeys.length === 0}
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </Button>
              </Form>
            </div>
            {customizeTable(
              {
                code: 'SSRC.BID_HALL_EDIT.SCORE_INDICS',
                dataSource: ScoringElement?.businessIndicList,
              },
              <EditTable
                bordered
                rowKey="evaluateIndicId"
                loading={loading}
                columns={columnsBusiness}
                rowSelection={businessScoringRowSelection}
                scroll={{ x: scrollXBusiness }}
                pagination={false}
                dataSource={ScoringElement ? ScoringElement.businessIndicList : []}
              />
            )}
            {/* 技术组 */}
            <div className={styles['item-list-search']} style={{ marginTop: '32px' }}>
              <h3 style={{ float: 'left', display: 'inline-block' }}>
                {intl.get(`ssrc.bidTask.model.bidTask.tech`).d('技术组')}:
              </h3>
              <Form layout="inline">
                <Button type="primary" onClick={onCreateTech}>
                  {intl.get('hzero.common.button.create').d('新建')}
                </Button>
                <Button
                  onClick={onSaveTech}
                  disabled={ScoringElement ? isEmpty(ScoringElement.technologyIndicList) : true}
                  loading={saveScorLoading === 'tech' && saveLoading}
                >
                  {intl.get('hzero.common.button.save').d('保存')}
                </Button>
                <Button
                  onClick={onDeleteTech}
                  loading={deleteScorLoading === 'tech' && deleteScoringLoading}
                  disabled={techScoringRowKeys.length === 0}
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </Button>
              </Form>
            </div>
            {customizeTable(
              {
                code: 'SSRC.BID_HALL_EDIT.SCORE_INDICS_TECHNOLOGY',
                dataSource: ScoringElement?.technologyIndicList,
              },
              <EditTable
                bordered
                rowKey="evaluateIndicId"
                loading={loading}
                columns={columnsTech}
                rowSelection={techScoringRowSelection}
                scroll={{ x: scrollXTech }}
                pagination={false}
                dataSource={ScoringElement ? ScoringElement.technologyIndicList : []}
                // onDataChange={this.hasChangeData}
              />
            )}
          </React.Fragment>
        )}
        {params.bidRuleType === 'NONE' && (
          <React.Fragment>
            {/* 组 */}
            <div className={styles['item-list-search']}>
              <Form layout="inline">
                <Lov
                  isButton
                  type="default"
                  onOk={this.onNoneReferTemplateOk}
                  queryParams={{
                    scoreMode: params.bidRuleType,
                    templatePurpose: 'EXPERT_SCORE',
                    scoreTemplateScoreType: params.templateScoreType,
                  }}
                  code="SSRC.REFERENCE_SCORE_TEMPL"
                >
                  {intl.get('hzero.common.button.referTemplate').d('参考模板')}
                </Lov>
              </Form>
            </div>
            <div className={styles['item-list-search']}>
              <Form layout="inline">
                <Button type="primary" onClick={onCreateLine}>
                  {intl.get('hzero.common.button.create').d('新建')}
                </Button>
                <Button
                  onClick={onSaveLine}
                  disabled={ScoringElement ? isEmpty(ScoringElement.otherIndicList) : true}
                  loading={saveLoading}
                >
                  {intl.get('hzero.common.button.save').d('保存')}
                </Button>
                <Button
                  onClick={onDeleteLine}
                  loading={deleteScoringLoading}
                  disabled={scoringRowKeys.length === 0}
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </Button>
              </Form>
            </div>
            {customizeTable(
              {
                code: 'SSRC.BID_HALL_EDIT.SCORE_INDICS',
                dataSource: ScoringElement?.otherIndicList,
              },
              <EditTable
                bordered
                rowKey="evaluateIndicId"
                loading={loading}
                columns={columns}
                rowSelection={scoringRowSelection}
                scroll={{ x: scrollX }}
                pagination={false}
                dataSource={ScoringElement ? ScoringElement.otherIndicList : []}
              />
            )}
          </React.Fragment>
        )}
        <Modal
          visible={onDistributionVisible}
          title={intl.get(`ssrc.bidTask.view.message.title.distributeExpert`).d('分配')}
          // onOk={this.handleOk}
          onCancel={this.handleDistributionCancel}
          footer={
            <Button
              key="save"
              type="primary"
              onClick={this.scoringAssignSave}
              loading={saveAssignLoading}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          }
        >
          <EditTable
            bordered
            rowKey="indicAssginId"
            loading={loading}
            columns={columnsAssign}
            scroll={{ x: scrollXAssign }}
            pagination={false}
            dataSource={ScoringAssign}
          />
        </Modal>
        {remarkVisible && <RemarkModal {...remarkModalProps} />}
      </React.Fragment>
    );
  }
}
