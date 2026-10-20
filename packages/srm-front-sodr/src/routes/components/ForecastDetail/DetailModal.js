import React, { PureComponent } from 'react';
import { Modal, Form, Button, InputNumber, Input, Checkbox, DatePicker } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';

import EditTable from 'components/EditTable';
import { isEmpty, sum, isNumber } from 'lodash';
import moment from 'moment';
import { getCurrentOrganizationId, getEditTableData, getDateFormat } from 'utils/utils';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT, DATETIME_MIN } from 'utils/constants';

// 设置sodr国际化前缀 - common - model
const modelPrompt = 'sodr.forecastDetail.model.common';
// 设置sodr国际化前缀 - common - message
const viewMessagePrompt = 'sodr.forecastDetail.view.message';

const organizationId = getCurrentOrganizationId();
/**
 * BOMModal - 业务组件 - 订单审批
 * @extends {Component} - React.Component
 * @reactProps {boolean} [visible=false] - 是否显示
 * @reactProps {string} actionkey - 组件查询数据唯一性主键
 * @reactProps {!Object} [processing={}] - dispatch处理过程
 * @return React.element
 */
@formatterCollections({
  code: ['sodr.forecastDetail', 'hzero.common'],
})
@Form.create({ fieldNameProp: null })
@connect(({ foreCaseDetail, loading }) => ({
  foreCaseDetail,
  processing: loading.effects['demandForecastDetail/getDetail'],
  tenantId: getCurrentOrganizationId(),
}))
export default class DetailModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      operateType: '',
      forecastStatus: '',
      dataSource: [],
      saveLoading: false,
    };
    // this.handleSave = this.handleSave.bind(this);
  }

  /**
   * getSnapshotBeforeUpdate 生命周期函数
   * 判断是否加载数据
   * @param {object} prevProps - 上一个状态下的props
   */
  getSnapshotBeforeUpdate(prevProps) {
    const { visible, actionkey } = this.props;
    return visible && prevProps.actionkey !== actionkey;
  }

  /**
   * componentDidMount 生命周期函数
   * 初始化数据
   */
  componentDidMount() {
    // 基础业务数据
    const { forecastDetailBase = {}, actionkey, operateType } = this.props;
    const {
      actionValue,
      forecastId,
      forecastStartDate,
      purchaserRemark,
      supplierRemark,
      forecastStatus,
    } = forecastDetailBase;
    this.setState({ operateType, forecastStatus });
    this.getDetail(forecastId, this.getBizType(actionkey, actionValue), operateType, () =>
      this.initData(
        actionkey,
        forecastStartDate,
        actionValue,
        forecastId,
        purchaserRemark,
        supplierRemark
      )
    );
  }

  initData(actionkey, forecastStartDate, actionValue, forecastId, purchaserRemark, supplierRemark) {
    const tempDs = [];
    // 如果ds为空初始化数据
    if (isEmpty(this.state.dataSource)) {
      // 添加日期生成逻辑
      switch (actionkey) {
        case 'week':
          for (let day = 1; day <= 7; day++) {
            tempDs.push({
              _status: 'create',
              demandDate: this.generateWeekDemandDate(forecastStartDate, actionValue, day),
              // 默认值
              demandQuality: this.state.operateType === 'purchaser' ? 0 : '',
              expectedArriveQuality: this.state.operateType === 'supplier' ? 0 : '',
              businessFlag: this.getBizType(actionkey, actionValue),
              forecastId,
              purchaserRemark,
              supplierRemark,
            });
          }
          break;
        case 'month':
          tempDs.push({
            _status: 'create',
            demandDate: this.generateMonthDemandDate(forecastStartDate, actionValue),
            // 默认值
            demandQuality: this.state.operateType === 'purchaser' ? 0 : '',
            expectedArriveQuality: this.state.operateType === 'supplier' ? 0 : '',
            businessFlag: this.getBizType(actionkey, actionValue),
            forecastId,
            purchaserRemark,
            supplierRemark,
          });
          break;
        default:
          break;
      }
    }
    // 渲染数据
    this.setState({ dataSource: tempDs });
  }

  /**
   * 获取bizType
   */
  getBizType(actionkey, actionValue) {
    switch (actionkey) {
      case 'week':
      case 'month':
        return actionkey.concat(actionValue);
      default:
        break;
    }
  }

  /**
   * 生成周期预测要求到货日期
   */
  generateWeekDemandDate(startDate, week, day) {
    const ONE_DAY_MILLS = 24 * 60 * 60 * 1000;
    const resultDate = new Date(
      new Date(startDate).getTime() + ONE_DAY_MILLS * ((week - 1) * 7 + day)
    );
    return moment(resultDate).format(DATETIME_MIN);
  }

  /**
   * 生成月度预测要求到货日期
   */
  generateMonthDemandDate(startMonth, monthNum) {
    // if(startMonth < moment().format('YYYYMM')) {
    //   return '';
    // }
    // 每个月的最后一天
    return moment(startMonth).add(monthNum, 'months').add(-1, 'days').format(DATETIME_MIN);
  }

  /**
   * cancel 取消(关闭)
   * 判断是否加载数据
   */
  cancel() {
    const { onCancel = (e) => e } = this.props;
    this.setState({
      dataSource: [],
    });
    onCancel();
  }

  /**
   * 获取列表
   */
  getDetail(forecastId, bizFlag, operateType, callback) {
    const { dispatch } = this.props;
    // 如果forcast不为空，先从接口查取数据
    if (forecastId) {
      dispatch({
        type: 'demandForecastDetail/getDetail',
        payload: {
          forecastId,
          bizFlag,
          operateType,
        },
      }).then((res) => {
        if (isEmpty(res)) {
          callback();
        } else {
          const { forecastDetailBase = {}, actionkey } = this.props;
          if (!res[0].demandDate && actionkey === 'month') {
            const { actionValue, forecastStartDate } = forecastDetailBase;
            res[0].demandDate = this.generateMonthDemandDate(forecastStartDate, actionValue);
            res[0].demandDateGenFlag = true;
          }
          this.setState({ dataSource: res });
        }
      });
    } else {
      callback();
    }
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { dataSource } = this.state;
    const { dispatch } = this.props;
    const tableData = getEditTableData(dataSource);
    if (isEmpty(tableData)) return;
    const data = tableData.map((item) => {
      return {
        tenantId: organizationId,
        ...item,
        demandDate:
          item.demandDate && item.demandDate._isAMomentObject
            ? item.demandDate.format(getDateFormat())
            : item.demandDate,
      };
    });
    if (data.length > 0) {
      this.setState({ saveLoading: true }, () => {
        dispatch({
          type: 'demandForecastDetail/detailSave',
          payload: {
            operateType: this.state.operateType,
            data,
          },
        })
          .then((res) => {
            if (res) {
              // 主页面刷新并提醒回调
              const { onSave = (e) => e } = this.props;
              this.setState({
                dataSource: [],
              });
              onSave();
            }
          })
          .finally(() => {
            this.setState({ saveLoading: false });
          });
      });
    }
  }

  @Bind()
  saveButtonDisabled() {
    const { forecastStatus, dataSource } = this.state;
    const { processing, operateType, actionkey } = this.props;
    // 小于当前日期按钮不可用
    if (actionkey === 'month' && dataSource.length > 0) {
      return dataSource[0].demandDate < moment().format(DEFAULT_DATE_FORMAT);
    }
    // 如果是采购方 待反馈和关闭不允许保存
    if (operateType === 'purchaser') {
      return processing || forecastStatus === 'RELEASE' || forecastStatus === 'CLOSED';
    }
    // 如果是供应商 只有供应商维护了详情&状态是待反馈才能保存
    if (operateType === 'supplier') {
      return (
        processing ||
        (forecastStatus !== 'RELEASE' && forecastStatus !== 'UPDATED') ||
        dataSource.filter((item) => !isNumber(item.demandQuality)).length === dataSource.length
      );
    }
  }

  /**
   * handleSearch 查询数据
   * @param {object} params - 查询条件
   */
  handleSearch(params = {}) {
    const { fetchBOM = (e) => e } = this.props;
    fetchBOM(params, (res) => {
      this.setState({
        ...res,
      });
    });
  }

  defaultRowkey = 'forcastDetailId';

  render() {
    const { actionkey, visible, processing } = this.props;
    const { operateType, forecastStatus, dataSource, saveLoading = false } = this.state;
    const columns = [
      // {
      //   title: intl.get(`${modelPrompt}.orderSeq`).d('序号'),
      //   align: 'center',
      //   dataIndex: 'orderSeq',
      //   width: 60,
      // },
      {
        title: intl.get(`${modelPrompt}.demandDate`).d('要求到货日期'),
        align: 'center',
        width: 120,
        dataIndex: 'demandDate',
        render: (text, record) => {
          if (actionkey === 'week') {
            return text ? moment(text).format(DEFAULT_DATE_FORMAT) : text;
          }
          const returnComponent =
            operateType !== 'purchaser' ||
            forecastStatus === 'RELEASE' ||
            forecastStatus === 'CLOSED' ||
            moment(record.demandDate).add(1, 'days') < moment() ? (
              record.forecastDetailId && !record.demandDateGenFlag ? (
                moment(text).format(DEFAULT_DATE_FORMAT)
              ) : (
                ''
              )
            ) : (
              <Form.Item>
                {record.$form.getFieldDecorator('demandDate', {
                  initialValue: moment(record.demandDate),
                  // rules: [{ type: 'object', required: true }],
                })(
                  <DatePicker
                    style={{ width: '105%' }}
                    // placeholder='只能选取当前月'
                    format={getDateFormat()}
                    defaultValue={moment(record.demandDate)}
                    disabledDate={(currentDate) => {
                      if (isEmpty(record.demandDate)) {
                        return false;
                      }
                      // 只能选择当月，且大于当前时间
                      return (
                        moment(record.demandDate).startOf('month').format('YYYYMMDD') >
                          moment(currentDate).format('YYYYMMDD') ||
                        moment().format('YYYYMMDD') > moment(currentDate).format('YYYYMMDD') ||
                        moment(record.demandDate).endOf('month').format('YYYYMMDD') <
                          moment(currentDate).format('YYYYMMDD')
                      );
                    }}
                  />
                )}
              </Form.Item>
            );
          return returnComponent;
        },
      },
      {
        title: intl.get(`${modelPrompt}.demandQuality`).d('要求到货数量'),
        align: 'center',
        width: 120,
        dataIndex: 'demandQuality',
        render: (text, record) => {
          const returnComponent =
            operateType !== 'purchaser' ||
            forecastStatus === 'RELEASE' ||
            forecastStatus === 'CLOSED' ||
            moment(record.demandDate).add(1, 'days') < moment() ? (
              text
            ) : (
              <Form.Item>
                {record.$form.getFieldDecorator('demandQuality', {
                  initialValue: record.demandQuality,
                })(<InputNumber min={0} style={{ width: '100%' }} />)}
              </Form.Item>
            );
          return returnComponent;
        },
      },
      {
        title: intl.get(`${modelPrompt}.purchaserRemark`).d('采购方备注'),
        align: 'center',
        width: 120,
        dataIndex: 'purchaserRemark',
        render: (text, record) => {
          const returnComponent =
            operateType !== 'purchaser' ||
            forecastStatus === 'RELEASE' ||
            forecastStatus === 'CLOSED' ||
            moment(record.demandDate).add(1, 'days') < moment() ? (
              text
            ) : (
              <Form.Item>
                {record.$form.getFieldDecorator('purchaserRemark', {
                  rules: [
                    {
                      max: 255,
                      message: intl.get(`hzero.common.validation.max`, {
                        max: 255,
                      }),
                    },
                  ],
                  initialValue: record.purchaserRemark,
                })(<Input />)}
              </Form.Item>
            );
          return returnComponent;
        },
      },
      {
        title: intl.get(`${modelPrompt}.enoughFlag`).d('是否满足'),
        align: 'center',
        width: 80,
        dataIndex: 'enoughFlag',
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('enoughFlag', {
              initialValue: record.enoughFlag,
            })(
              <Checkbox
                checkedValue={1}
                unCheckedValue={0}
                onChange={(value) => {
                  if (value.target.checked) {
                    // 为空 或者 判断提供是否比需求小 设置 提供=需求
                    if (
                      !isNumber(record.$form.getFieldValue('expectedArriveQuality')) ||
                      record.$form.getFieldValue('expectedArriveQuality') < record.demandQuality
                    ) {
                      record.$form.setFieldsValue({ expectedArriveQuality: record.demandQuality });
                    }
                  } else {
                    record.$form.setFieldsValue({ expectedArriveQuality: 0 });
                  }
                }}
                disabled={
                  operateType !== 'supplier' ||
                  (forecastStatus !== 'RELEASE' && forecastStatus !== 'UPDATED') ||
                  moment(record.demandDate).add(1, 'days') < moment() ||
                  !isNumber(record.demandQuality)
                }
              />
            )}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`${modelPrompt}.expectedArriveQuality`).d('预计可到货数量'),
        align: 'center',
        width: 120,
        dataIndex: 'expectedArriveQuality',
        render: (text, record) => {
          const returnComponent =
            operateType !== 'supplier' ||
            (forecastStatus !== 'RELEASE' && forecastStatus !== 'UPDATED') ||
            moment(record.demandDate).add(1, 'days') < moment() ||
            !isNumber(record.demandQuality) ? (
              text
            ) : (
              <Form.Item>
                {record.$form.getFieldDecorator('expectedArriveQuality', {
                  initialValue: record.expectedArriveQuality,
                })(
                  <InputNumber
                    min={0}
                    onChange={(val) => {
                      if (record.demandQuality >= 0 && val >= 0) {
                        if (val >= record.demandQuality) {
                          record.$form.setFieldsValue({ enoughFlag: 1 });
                        } else {
                          record.$form.setFieldsValue({ enoughFlag: 0 });
                        }
                      } else {
                        record.$form.setFieldsValue({ enoughFlag: 0 });
                      }
                    }}
                    style={{ width: '100%' }}
                  />
                )}
              </Form.Item>
            );
          return returnComponent;
        },
      },
      {
        title: intl.get(`${modelPrompt}.supplierRemark`).d('供应商备注'),
        align: 'center',
        width: 120,
        dataIndex: 'supplierRemark',
        render: (text, record) => {
          const returnComponent =
            operateType !== 'supplier' ||
            (forecastStatus !== 'RELEASE' && forecastStatus !== 'UPDATED') ||
            moment(record.demandDate).add(1, 'days') < moment() ||
            !isNumber(record.demandQuality) ? (
              text
            ) : (
              <Form.Item>
                {record.$form.getFieldDecorator('supplierRemark', {
                  rules: [
                    {
                      max: 255,
                      message: intl.get(`hzero.common.validation.max`, {
                        max: 255,
                      }),
                    },
                  ],
                  initialValue: record.supplierRemark,
                })(<Input />)}
              </Form.Item>
            );
          return returnComponent;
        },
      },
    ];

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const tableProps = {
      columns,
      rowKey: this.defaultRowkey,
      dataSource,
      pagination: false,
      loading: processing,
      bordered: true,
      scroll: { x: scrollX },
    };

    return (
      <Modal
        title={
          actionkey === 'week'
            ? intl.get(`${viewMessagePrompt}.title`).d('周期预测详情')
            : intl.get(`${viewMessagePrompt}.MonthDetail`).d('月度预测详情')
        }
        visible={visible}
        onCancel={this.cancel.bind(this)}
        destroyOnClose
        closable
        width={800}
        footer={[
          <Button
            icon="save"
            onClick={() => this.handleSave()}
            type="primary"
            loading={saveLoading}
            disabled={this.saveButtonDisabled()}
          >
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>,
        ]}
      >
        <EditTable {...tableProps} />
      </Modal>
    );
  }
}
