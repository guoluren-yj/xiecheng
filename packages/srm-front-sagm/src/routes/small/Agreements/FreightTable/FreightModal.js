import React, { Component } from 'react';
import {
  Modal,
  Form,
  Select,
  Row,
  Col,
  Radio,
  Button,
  Input,
  TreeSelect,
  InputNumber,
  Spin,
  Table,
  Popover,
} from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { math } from 'choerodon-ui/dataset';
import uuidv4 from 'uuid/v4';

import { getEditTableData, getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';

import { addFreight, deleteFreightLine } from '@/services/mallProtocolManagementService';
import { isCustomNumber } from '@/utils/precision';

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@Form.create({ fieldNameProp: null })
export default class FreightModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rowKey: 'postageLineId',
      saveLoading: false,
      deleteLoading: false,
      ...this.initData(),
    };
  }

  @Bind()
  initData() {
    const { postages = {} } = this.props;
    const { postageLineList } = postages || {};
    const selectRegions = {};
    const defaultLine = [{ _status: 'create', postageLineId: uuidv4(), regionDefault: true }];
    const dataSource =
      postageLineList && postageLineList.length > 0
        ? postageLineList.map((f) => {
            const { postageRegionList: regions = [] } = f;
            selectRegions[f.postageLineId] = (regions || []).map((m) => m.regionId);
            return {
              ...f,
              _status: 'update',
              regionDefault: !(regions && regions.length > 0),
            };
          })
        : defaultLine;
    return {
      dataSource, // 初始化数据源
      selectRegions, // 初始化选择区域
    };
  }

  @Bind()
  handleOK() {
    const {
      onToggleModal,
      postages,
      supplierTenantId,
      onFetchList = (e) => e,
      form: { validateFields },
    } = this.props;
    const { dataSource } = this.state;
    const freightRules = getEditTableData(dataSource, ['postageLineId'], { force: true });
    validateFields((err, values) => {
      if (!err) {
        const freights = values;
        delete freights.id;
        const postageLineList = freightRules.map((item) => {
          const { postageRegionList: oldRegion = [], agreementRegions: newRegion } = item;
          const postageRegionList = (newRegion || []).map((r) => {
            const oldR = (oldRegion || []).find((f) => f.regionId === r);
            return oldR || { regionId: r };
          });
          return {
            ...item,
            postageRegionList,
          };
        });
        const newPostage = { ...(postages || {}), ...freights, enabled: 1, postageLineList };
        if (!(dataSource.length > 0 && freightRules.length === 0)) {
          this.setState({ saveLoading: true });
          addFreight({
            postage: newPostage,
            supplierTenantId: supplierTenantId || postages.supplierTenantId,
          })
            .then((res) => {
              const result = getResponse(res);
              if (result) {
                notification.success();
                onFetchList();
              }
            })
            .finally(() => {
              this.setState({ saveLoading: false });
            });
          onToggleModal();
        }
      }
    });
  }

  @Bind()
  getTreeData(regionTree, record) {
    const { dataSource, rowKey, selectRegions } = this.state;
    let selectedRegion = [];
    dataSource.forEach((i) => {
      if (i[rowKey] !== record[rowKey]) {
        const exited = selectRegions[i[rowKey]] || [];
        selectedRegion = [...exited, ...selectedRegion];
      }
    });
    const resultTree = regionTree.filter((r) => r.regionId !== 'ALL');
    return resultTree.map((item) => {
      const { children = [] } = item;
      const currentDisabled = selectedRegion.includes(item.regionId);
      if (children && children.length > 0) {
        const childDisabled = children.some((c) => selectedRegion.includes(c.regionId));
        return {
          ...item,
          key: item.regionId,
          value: item.regionId,
          title: item.regionName,
          children: children.map((c) => ({
            ...c,
            key: c.regionId,
            value: c.regionId,
            title: c.regionName,
            isLeaf: true,
            children: null,
            disabled: selectedRegion.includes(c.regionId) || currentDisabled,
          })),
          disabled: currentDisabled || childDisabled,
        };
      } else {
        return {
          ...item,
          key: item.regionId,
          value: item.regionId,
          title: item.regionName,
          isLeaf: true,
          disabled: currentDisabled,
        };
      }
    });
  }

  @Bind()
  getRegionsStatus(record) {
    const required = !record.regionDefault;
    return { disabled: !required, required };
  }

  @Bind()
  handleChangeRegion(regions, record) {
    const { dataSource, selectRegions, rowKey } = this.state;

    dataSource.forEach((i) => {
      if (i[rowKey] !== record[rowKey]) {
        i.$form.setFieldsValue({
          agreementRegions: i.$form.getFieldValue('agreementRegions'),
        });
      }
    });

    const newSelRegions = { ...selectRegions };
    newSelRegions[record[rowKey]] = regions;
    this.setState({
      selectRegions: newSelRegions,
    });
  }

  @Bind()
  getTableProps() {
    const {
      onlyRead = false,
      form: { getFieldValue },
      allCity = [],
      postages = {},
      agreementPricingTypes = [],
    } = this.props;
    const { dataSource, rowKey } = this.state;
    const { pricingMethod } = postages || {};
    const initMethod = getFieldValue('pricingMethod') || pricingMethod;
    const filterFlag = initMethod === 'PIECES' ? 1 : 0;

    const getPricingTypeMeaning = (pricingType) =>
      agreementPricingTypes.find((i) => i.value === pricingType)
        ? agreementPricingTypes.find((i) => i.value === pricingType).meaning
        : '';
    const columns = [
      {
        title: intl.get('small.freight.model.postageRegion').d('运送区域'),
        width: 200,
        dataIndex: 'postageRegionList',
        radioType: [0, 1],
        render: (_, record) => {
          const { postageRegionList: regions = [] } = record;
          const initialValue = (regions || []).map((m) => m.regionId);

          const getOnlyReadRegion = () => {
            const tablePopover = {
              columns: [
                {
                  title: intl.get('small.common.model.regionCode').d('区域编码'),
                  dataIndex: 'regionCode',
                  width: 120,
                },
                {
                  title: intl.get('small.common.model.regionName').d('区域名称'),
                  dataIndex: 'regionName',
                },
              ],
              rowKey: 'regionId',
              bordered: true,
              pagination: false,
              dataSource: regions,
            };
            const content = <Table {...tablePopover} />;
            return !(regions && regions.length > 0) ? (
              intl.get('small.common.model.defaultRegion').d('默认区域')
            ) : regions.length === 1 ? (
              regions[0].regionName
            ) : (
              <Popover placement="top" content={content}>
                <a>{intl.get('hzero.common.button.more').d('更多')}</a>
              </Popover>
            );
          };
          return onlyRead ? (
            getOnlyReadRegion()
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('agreementRegions', {
                initialValue,
                rules: [
                  {
                    required: this.getRegionsStatus(record).required,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('small.freight.model.postageRegion').d('运送区域'),
                    }),
                  },
                ],
              })(
                <TreeSelect
                  dropdownStyle={{ maxHeight: '30vh' }}
                  treeData={this.getTreeData(allCity, record)}
                  treeCheckable="true"
                  style={{ width: '100%' }}
                  onChange={(value) => this.handleChangeRegion(value, record)}
                  disabled={this.getRegionsStatus(record).disabled}
                  showCheckedStrategy={TreeSelect.SHOW_PARENT}
                  placeholder={
                    this.getRegionsStatus(record).disabled
                      ? intl.get('small.common.model.defaultRegion').d('默认区域')
                      : ''
                  }
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get('small.freight.model.minPackageNumber').d('最低包邮件数'),
        radioType: [1],
        dataIndex: 'minPackageNumber',
        width: 160,
        render: (_, record) => (
          <Form.Item>
            {onlyRead
              ? record.minPackageNumber
              : record.$form.getFieldDecorator('minPackageNumber', {
                  initialValue: record.minPackageNumber,
                  rules: [
                    {
                      validator: (rule, value, callback) => {
                        const next = record.$form.getFieldValue('firstPiece');
                        if (next && value && math.lte(value, next)) {
                          callback(
                            new Error(
                              intl
                                .get('small.freight.view.numberMaxFirstPiece')
                                .d('包邮件数必须大于首件数')
                            )
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
                    step={1}
                    precision={0}
                    min={0}
                    onChange={() => {
                      const firstPiece = record.$form.getFieldValue('firstPiece');
                      if (isCustomNumber(firstPiece)) {
                        record.$form.setFieldsValue({
                          firstPiece,
                        });
                      }
                    }}
                  />
                )}
          </Form.Item>
        ),
      },
      {
        title: intl.get('small.freight.model.minPackageAmount').d('最低包邮金额（元）'),
        radioType: [0, 1],
        width: 150,
        dataIndex: 'minPackageAmount',
        align: 'right',
        render: (_, record) => (
          <Form.Item>
            {onlyRead
              ? record.minPackageAmount
              : record.$form.getFieldDecorator('minPackageAmount', {
                  initialValue: record.minPackageAmount,
                  rules: [
                    // {
                    //   required: filterFlag === 1,
                    //   message: intl.get('hzero.common.validation.notNull', {
                    //     name: '最低包邮金额',
                    //   }),
                    // },
                    {
                      validator: (rule, value, callback) => {
                        const prevLength = math.floor(value).toLocaleString().replace(/,/g, '')
                          .length;
                        const nextLength = math.dp(value) || 0;
                        if (prevLength > 20) {
                          callback(
                            new Error(
                              intl
                                .get(`small.common.model.pointIntLengthTen`)
                                .d('整数位最多不超过二十位')
                            )
                          );
                        } else if (nextLength > 10) {
                          callback(
                            new Error(
                              intl
                                .get(`small.common.model.pointDecimalLengthTen`)
                                .d('小数位最多不超过十位')
                            )
                          );
                        } else {
                          callback();
                        }
                      },
                    },
                  ],
                })(<InputNumber min={0} style={{ width: '100%' }} />)}
          </Form.Item>
        ),
      },
      {
        title: intl.get('small.freight.model.pricingType').d('计价类型'),
        width: 150,
        dataIndex: 'pricingType',
        radioType: [0],
        render: (_, record) => (
          <Form.Item>
            {onlyRead
              ? getPricingTypeMeaning(record.pricingType)
              : record.$form.getFieldDecorator('pricingType', {
                  initialValue: record.pricingType,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('small.freight.model.pricingType').d('计价类型'),
                      }),
                    },
                  ],
                })(
                  <Select
                    style={{ width: '100%' }}
                    allowClear
                    onChange={(val) => {
                      const {
                        $form: { setFieldsValue },
                      } = record;
                      if (val === 'FIXED') {
                        setFieldsValue({ freightPercent: null, lowestAmount: null });
                      } else if (val === 'PERCENTAGE') {
                        setFieldsValue({ freightPurOrder: null });
                      } else {
                        setFieldsValue({
                          freightPercent: null,
                          freightPurOrder: null,
                          lowestAmount: null,
                        });
                      }
                    }}
                  >
                    {agreementPricingTypes.map((item) => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
          </Form.Item>
        ),
      },
      {
        title: intl.get('small.freight.model.freightPurOrder').d('每单固定运费（元）'),
        width: 150,
        dataIndex: 'freightPurOrder',
        radioType: [0],
        align: 'right',
        render: (_, record) => (
          <Form.Item>
            {onlyRead
              ? record.freightPurOrder
              : record.$form.getFieldDecorator('freightPurOrder', {
                  initialValue: record.freightPurOrder,
                  rules: [
                    {
                      required: record.$form.getFieldValue('pricingType') === 'FIXED',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('small.freight.model.freightOneOrder').d('每单固定运费'),
                      }),
                    },
                    {
                      validator: (rule, value, callback) => {
                        const prevLength = math.floor(value).toLocaleString().replace(/,/g, '')
                          .length;
                        const nextLength = math.dp(value) || 0;
                        if (prevLength > 20) {
                          callback(
                            new Error(
                              intl
                                .get(`small.common.model.pointIntLengthTen`)
                                .d('整数位最多不超过二十位')
                            )
                          );
                        } else if (nextLength > 10) {
                          callback(
                            new Error(
                              intl
                                .get(`small.common.model.pointDecimalLengthTen`)
                                .d('小数位最多不超过十位')
                            )
                          );
                        } else {
                          callback();
                        }
                      },
                    },
                  ],
                })(
                  <InputNumber
                    disabled={record.$form.getFieldValue('pricingType') !== 'FIXED'}
                    min={0}
                    style={{ width: '100%' }}
                  />
                )}
          </Form.Item>
        ),
      },
      {
        title: intl.get('small.freight.model.freightPercent').d('订单金额百分比'),
        radioType: [0],
        width: 160,
        dataIndex: 'freightPercent',
        render: (_, record) => (
          <Form.Item>
            {onlyRead
              ? record.freightPercent
              : record.$form.getFieldDecorator('freightPercent', {
                  initialValue: record.freightPercent,
                  rules: [
                    {
                      required: record.$form.getFieldValue('pricingType') === 'PERCENTAGE',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('small.freight.model.freightPercent').d('订单金额百分比'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    disabled={record.$form.getFieldValue('pricingType') !== 'PERCENTAGE'}
                    style={{ width: '100%' }}
                    step={0.01}
                    precision={2}
                    min={0}
                  />
                )}
          </Form.Item>
        ),
      },
      {
        title: intl.get('small.freight.model.firstPiece').d('首件数'),
        radioType: [1],
        width: 160,
        dataIndex: 'firstPiece',
        render: (_, record) => (
          <Form.Item>
            {onlyRead
              ? record.firstPiece
              : record.$form.getFieldDecorator('firstPiece', {
                  initialValue: record.firstPiece,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('small.freight.model.firstPiece').d('首件数'),
                      }),
                    },
                    {
                      validator: (rule, value, callback) => {
                        const prev = record.$form.getFieldValue('minPackageNumber');
                        if (prev && isCustomNumber(value) && math.gte(value, prev)) {
                          callback(
                            new Error(
                              intl
                                .get('small.freight.view.firstPieceMinNumber')
                                .d('首件数必须低于包邮件数')
                            )
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
                    step={1}
                    precision={0}
                    min={0}
                    onChange={() => {
                      const minPackageNumber = record.$form.getFieldValue('minPackageNumber');
                      if (isCustomNumber(minPackageNumber)) {
                        record.$form.setFieldsValue({
                          minPackageNumber,
                        });
                      }
                    }}
                  />
                )}
          </Form.Item>
        ),
      },
      {
        title: intl.get('small.freight.model.firstFreightYuan').d('首运费（元）'),
        width: 140,
        dataIndex: 'firstFreight',
        align: 'right',
        radioType: [1],
        render: (_, record) => (
          <Form.Item>
            {onlyRead
              ? record.firstFreight
              : record.$form.getFieldDecorator('firstFreight', {
                  initialValue: record.firstFreight,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('small.freight.model.firstFreight').d('首运费'),
                      }),
                    },
                    {
                      validator: (rule, value, callback) => {
                        const prevLength = math.floor(value).toLocaleString().replace(/,/g, '')
                          .length;
                        const nextLength = math.dp(value) || 0;
                        if (prevLength > 20) {
                          callback(
                            new Error(
                              intl
                                .get(`small.common.model.pointIntLengthTen`)
                                .d('整数位最多不超过二位')
                            )
                          );
                        } else if (nextLength > 10) {
                          callback(
                            new Error(
                              intl
                                .get(`small.common.model.pointDecimalLengthTen`)
                                .d('小数位最多不超过十位')
                            )
                          );
                        } else {
                          callback();
                        }
                      },
                    },
                  ],
                })(<InputNumber min={0} style={{ width: '100%' }} />)}
          </Form.Item>
        ),
      },
      {
        title: intl.get('small.freight.model.increasingNumber').d('续件'),
        radioType: [1],
        width: 120,
        dataIndex: 'increasingNumber',
        render: (_, record) => (
          <Form.Item>
            {onlyRead
              ? record.increasingNumber
              : record.$form.getFieldDecorator('increasingNumber', {
                  initialValue: record.increasingNumber,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('small.freight.model.increasingNumber').d('续件'),
                      }),
                    },
                  ],
                })(<InputNumber style={{ width: '100%' }} step={1} precision={0} min={0} />)}
          </Form.Item>
        ),
      },
      {
        title: intl.get('small.freight.model.renewalYuan').d('续费（元）'),
        width: 140,
        dataIndex: 'renewal',
        align: 'right',
        radioType: [1],
        render: (_, record) => (
          <Form.Item>
            {onlyRead
              ? record.renewal
              : record.$form.getFieldDecorator('renewal', {
                  initialValue: record.renewal,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('small.freight.model.renewal').d('续费'),
                      }),
                    },
                    {
                      validator: (rule, value, callback) => {
                        const prevLength = math.floor(value).toLocaleString().replace(/,/g, '')
                          .length;
                        const nextLength = math.dp(value) || 0;
                        if (prevLength > 20) {
                          callback(
                            new Error(
                              intl
                                .get(`small.common.model.pointIntLengthTen`)
                                .d('整数位最多不超过二位')
                            )
                          );
                        } else if (nextLength > 10) {
                          callback(
                            new Error(
                              intl
                                .get(`small.common.model.pointDecimalLengthTen`)
                                .d('小数位最多不超过十位')
                            )
                          );
                        } else {
                          callback();
                        }
                      },
                    },
                  ],
                })(<InputNumber min={0} style={{ width: '100%' }} />)}
          </Form.Item>
        ),
      },
      {
        title: intl.get('small.freight.model.lowestAmount').d('最低金额'),
        width: 140,
        dataIndex: 'lowestAmount',
        radioType: [0],
        align: 'right',
        render: (_, record) => (
          <Form.Item>
            {onlyRead
              ? record.lowestAmount
              : record.$form.getFieldDecorator('lowestAmount', {
                  initialValue: record.lowestAmount,
                  rules: [
                    {
                      validator: (rule, value, callback) => {
                        const prevLength = math.floor(value).toLocaleString().replace(/,/g, '')
                          .length;
                        const nextLength = math.dp(value) || 0;
                        if (prevLength > 20) {
                          callback(
                            new Error(
                              intl
                                .get(`small.common.model.pointIntLengthTen`)
                                .d('整数位最多不超过二十位')
                            )
                          );
                        } else if (nextLength > 10) {
                          callback(
                            new Error(
                              intl
                                .get(`small.common.model.pointDecimalLengthTen`)
                                .d('小数位最多不超过十位')
                            )
                          );
                        } else {
                          callback();
                        }
                      },
                    },
                  ],
                })(
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    disabled={record.$form.getFieldValue('pricingType') !== 'PERCENTAGE'}
                  />
                )}
          </Form.Item>
        ),
      },
      {
        title: intl.get('hzero.common.action').d('操作'),
        radioType: onlyRead ? [] : [0, 1],
        width: 80,
        render: (_, record) => {
          const disabledByRegion = this.getRegionsStatus(record).disabled;
          const disabledByExitLine =
            record._status === 'update' &&
            !(record.postageRegionList && record.postageRegionList.length > 0);
          return (
            <a
              disabled={disabledByRegion || disabledByExitLine}
              onClick={() => this.handleDelRule(record)}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </a>
          );
        },
      },
    ];
    const filterColumns = columns.filter((c) => c.radioType.includes(filterFlag));
    return {
      rowKey,
      columns: filterColumns,
      dataSource,
    };
  }

  @Bind()
  handleAddRules() {
    const { dataSource, rowKey } = this.state;
    const newRule = {
      [rowKey]: uuidv4(),
      _status: 'create',
    };
    this.setState({
      dataSource: [newRule, ...dataSource],
    });
  }

  @Bind()
  handleDelRule(record) {
    const { onFetchList = (e) => e } = this.props;
    const { rowKey } = this.state;
    if (record._status === 'update') {
      this.setState({ deleteLoading: true });
      deleteFreightLine({
        [rowKey]: record[rowKey],
      })
        .then((res) => {
          const result = getResponse(res);
          if (result) {
            notification.success();
            this.handleDelStatic(record);
            onFetchList();
          }
        })
        .finally(() => {
          this.setState({ deleteLoading: false });
        });
    } else {
      this.handleDelStatic(record);
    }
  }

  @Bind()
  handleDelStatic(record) {
    const { dataSource, rowKey } = this.state;
    const exitData = dataSource.filter((f) => f[rowKey] !== record[rowKey]);
    this.setState({
      dataSource: exitData,
    });
  }

  render() {
    const {
      form,
      visible,
      onlyRead,
      onToggleModal,
      postages,
      agreementPricingMethods = [],
    } = this.props;
    const { saveLoading, deleteLoading } = this.state;
    const { pricingMethod, itemId, itemName, taxRate, taxId } = postages || {};
    const { getFieldDecorator, setFieldsValue, getFieldValue } = form;
    const options = agreementPricingMethods.map((i) => ({ label: i.meaning, value: i.value }));

    const { columns } = this.getTableProps();
    const width = columns.map((i) => i.width).reduce((x, y) => x + y, 80);

    const getPricingMethodMeaning = () =>
      agreementPricingMethods.find((i) => i.value === pricingMethod)
        ? agreementPricingMethods.find((i) => i.value === pricingMethod).meaning
        : '';

    const modalProps = {};
    if (onlyRead) {
      modalProps.footer = (
        <Button type="primary" onClick={onToggleModal}>
          {intl.get('small.common.model.close').d('关闭')}
        </Button>
      );
    }

    return (
      <React.Fragment>
        <Modal
          title={intl.get('small.common.view.configFreightRule').d('配置运费规则')}
          destroyOnClose
          width={width}
          onCancel={onToggleModal}
          visible={visible}
          onOk={this.handleOK}
          confirmLoading={saveLoading}
          {...modalProps}
        >
          <Spin spinning={!!deleteLoading}>
            <div>
              <Row gutter={48}>
                <Col span={9}>
                  <Form.Item
                    label={intl.get('small.freight.model.pricingMethod').d('计价方式')}
                    {...formLayout}
                  >
                    {onlyRead
                      ? getPricingMethodMeaning()
                      : getFieldDecorator('pricingMethod', {
                          initialValue: pricingMethod || 'ORDER_AMOUNT',
                        })(<Radio.Group options={options} />)}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={intl.get('small.freight.model.freightRuleName').d('运费规则名称')}
                    {...formLayout}
                  >
                    {onlyRead
                      ? postages && postages.postageName
                      : getFieldDecorator('postageName', {
                          initialValue: (postages && postages.postageName) || '',
                          rules: [
                            {
                              required: true,
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl
                                  .get('small.freight.model.freightRuleName')
                                  .d('运费规则名称'),
                              }),
                            },
                          ],
                        })(<Input />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={48}>
                <Col span={9}>
                  <Form.Item
                    label={intl.get('small.freight.model.freightItem').d('运费物料')}
                    {...formLayout}
                  >
                    {getFieldDecorator('itemName', {
                      initialValue: itemName,
                    })}
                    {getFieldDecorator('itemId', { initialValue: itemId })}
                    {onlyRead
                      ? itemName
                      : getFieldDecorator('id', {
                          initialValue: itemId,
                          rules: [
                            {
                              required: true,
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl.get('small.freight.model.freightItem').d('运费物料'),
                              }),
                            },
                          ],
                        })(
                          <Lov
                            code="SMAL.CUSTOMER_ITEM"
                            queryParams={{ tenantId: getCurrentOrganizationId() }}
                            textValue={getFieldValue('itemName')}
                            lovOptions={{
                              valueField: 'id',
                              displayField: 'itemName',
                            }}
                            onChange={(_, item) => {
                              const _taxRate = typeof item.taxRate === 'number' ? item.taxRate : 6;
                              // intl.get('small.common.model.freight').d('运费')
                              setFieldsValue({
                                taxRate: _taxRate,
                                itemName: item.itemName,
                                itemId: item.itemId,
                              });
                            }}
                          />
                        )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={intl.get('small.common.model.tax').d('税率')} {...formLayout}>
                    {getFieldDecorator('taxRate')}
                    {onlyRead
                      ? taxRate
                      : getFieldDecorator('taxId', {
                          initialValue: taxId,
                          rules: [
                            {
                              required: true,
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl.get('small.common.model.tax').d('税率'),
                              }),
                            },
                          ],
                        })(
                          <Lov
                            lovOptions={{
                              displayField: 'taxRate',
                              valueField: 'taxId',
                            }}
                            textValue={postages && taxRate}
                            code="SMDM.TAX"
                            onChange={(_, item) => {
                              setFieldsValue({ taxRate: item.taxRate });
                            }}
                          />
                        )}
                  </Form.Item>
                </Col>
              </Row>
            </div>
            <div>
              {!onlyRead && (
                <div className="table-operator">
                  <Button icon="plus" onClick={this.handleAddRules}>
                    {intl.get('small.common.model.addLine').d('添加行')}
                  </Button>
                </div>
              )}
              <div style={{ maxHeight: 380, overflowY: 'auto', overflowX: 'hidden' }}>
                <EditTable {...this.getTableProps()} bordered pagination={false} />
              </div>
            </div>
          </Spin>
        </Modal>
      </React.Fragment>
    );
  }
}
