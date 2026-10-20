import React from 'react';
import { Form, Input, Row, Col, Icon, Button, DatePicker } from 'hzero-ui';
import { Modal } from 'choerodon-ui';
import { DataSet, Select, Lov } from 'choerodon-ui/pro';
import { Bind, Debounce } from 'lodash-decorators';
import moment from 'moment';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import CroperModal from '@/routes/Components/CroperModal';

const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@Form.create()
export default class CreateChannelModal extends React.Component {
  channelModalDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'channelName',
        type: 'string',
      },
      {
        name: 'channelType', // 对象
        type: 'object',
        lookupCode: 'SMAL.CUSTOM_CHANNEL_TYPE',
        textField: 'meaning',
        valueField: 'value',
        required: true,
      },
      {
        name: 'supplier', // 供应商
        type: 'object',
        lookupCode: 'SMAL.TENANT_SUPPLIER_ALL',
        multiple: true,
        textField: 'supplierCompanyName',
        valueField: 'supplierCompanyId',
        required: true,
      },
      {
        name: 'category', // 分类
        type: 'object',
        lovCode: 'SMAL.PLAT_CATEGORY_THREE',
        multiple: true,
        textField: 'name',
        valueField: 'id',
        required: true,
      },
      {
        name: 'sale', // 销量(单选)
        type: 'object',
        lookupCode: 'SMAL.CUSTOM_CHANNEL_PRODUCT_SALE',
        textField: 'meaning',
        valueField: 'value',
        required: true,
      },
      {
        name: 'imagePath',
        type: 'string',
      },
      {
        name: 'startTime',
        type: 'date',
        format: DEFAULT_DATETIME_FORMAT,
        max: 'endTime',
      },
      {
        name: 'endTime',
        type: 'date',
        format: DEFAULT_DATETIME_FORMAT,
        min: 'startTime',
      },
    ],
  });

  croperModal;

  state = {
    customChannelRange: '',
  };

  componentDidMount() {
    if (!isEmpty(this.props.channelRecord)) {
      const { channelType, channelTypeName, customChannelRangeList } = this.props.channelRecord;
      const newRecord = {
        ...this.props.channelRecord,
        channelType: {
          meaning: channelTypeName,
          value: channelType,
        },
        category: customChannelRangeList.map((n) => ({ name: n.categoryName, id: n.categoryId })),
        supplier: customChannelRangeList.map((n) => ({
          supplierCompanyName: n.supplierCompanyName,
          supplierCompanyId: n.supplierCompanyId,
        })),
        sale: {
          meaning: customChannelRangeList[0].productSaleName,
          value: customChannelRangeList[0].productSale,
        },
      };
      this.props.form.setFieldsValue({
        ...this.props.channelRecord,
        startTime: this.props.channelRecord.startTime && moment(this.props.channelRecord.startTime),
        endTime: this.props.channelRecord.endTime && moment(this.props.channelRecord.endTime),
      });
      this.channelModalDs.create(newRecord);
    }
  }

  componentWillUnmount() {
    this.channelModalDs.reset();
  }

  /**
   * 确定
   */
  @Debounce(500)
  handleOk = (type = {}) => {
    const {
      onOk = (e) => e,
      form: { validateFields },
      channelRecord,
    } = this.props;
    validateFields((err, values) => {
      if (!err) {
        const dsData = isEmpty(channelRecord)
          ? { ...this.channelModalDs.toData()[0], ...values }
          : { ...channelRecord, ...values };
        const { channelType = {} } = dsData;
        const channelRangeName = (values?.channelType?.value || channelType).toLowerCase();
        let newRangeList = [];
        const customChannelRangeList = isEmpty(channelRecord)
          ? dsData[channelRangeName]
          : values.customChannelRangeList;
        switch (channelRangeName) {
          case 'supplier':
            newRangeList = customChannelRangeList;
            break;
          case 'category':
            newRangeList = customChannelRangeList.map((n) => {
              const { name, id } = n;
              return {
                categoryId: id,
                categoryName: name,
              };
            });
            break;
          case 'sale':
            newRangeList = customChannelRangeList.value
              ? [
                  {
                    productSale: customChannelRangeList.value,
                    productSaleName: customChannelRangeList.meaning,
                  },
                ]
              : customChannelRangeList.map((n) => ({
                  productSale: n.productSale,
                  productSaleName: n.productSaleName,
                }));
            break;
          default:
            break;
        }
        const params = {
          ...dsData,
          channelType: channelType.value || channelType,
          channelTypeName: channelType.meaning || dsData.channelTypeName,
          startTime: values.startTime
            ? values.startTime.format(DEFAULT_DATETIME_FORMAT)
            : undefined,
          endTime: values.endTime ? values.endTime.format(DEFAULT_DATETIME_FORMAT) : undefined,
          customChannelRangeList: isEmpty(newRangeList)
            ? values.customChannelRangeList
            : newRangeList,
        };
        onOk(params, type);
      }
    });
  };

  /**
   * 开始时间
   * @param {*} current
   */
  @Bind()
  selectDisabledDate(current) {
    const {
      form: { getFieldValue },
    } = this.props;
    if (getFieldValue('endTime')) {
      return (
        current < moment().subtract(1, 'days').endOf('day') - 1 ||
        moment(getFieldValue('endTime')).isBefore(current, 'day')
      );
    } else {
      // return current && current < moment().subtract(1, 'days').endOf('day') - 1;
      return moment(moment().format('YYYY-MM-DD HH:mm:ss')).isAfter(current, 'day');
    }
  }

  /**
   * 结束时间
   * @param {*} current
   */
  @Bind()
  selectToDisabledDate(current) {
    const {
      form: { getFieldValue },
    } = this.props;
    if (
      getFieldValue('startTime') &&
      current &&
      current <
        Math.max.apply(this, [
          moment(getFieldValue('startTime')).startOf('day'),
          moment(current).startOf('day'),
        ])
    ) {
      // return moment(getFieldValue('startTime')).isAfter(current, 'day');
      return true;
    } else {
      // return current && current < moment().subtract(1, 'days').endOf('day');
      return moment(moment().format('YYYY-MM-DD HH:mm:ss')).isAfter(current, 'day');
    }
  }

  /**
   * 对象值改变回调
   */
  @Bind()
  handleChannelTypeChange(channelType) {
    const channelRange = channelType?.value.toLowerCase();
    this.channelModalDs.current.set(channelRange, null);
    this.props.form.setFieldsValue({
      customChannelRangeList: null,
    });
    this.setState({
      customChannelRange: channelRange,
    });
  }

  /**
   * 图片上传成功回调
   */
  @Bind()
  uploadSuccess(file = { url: '' }) {
    const { url } = file;
    const { form } = this.props;
    if (url) {
      form.setFieldsValue({
        imagePath: url,
      });
    }
  }

  @Bind()
  handleInitRange(channelRecord = {}) {
    const { channelType, customChannelRangeList } = channelRecord;
    let initRange;
    switch (channelType) {
      case 'SUPPLIER':
        initRange = customChannelRangeList.map((n) => n.supplierCompanyName);
        break;
      case 'CATETORY':
        initRange = customChannelRangeList.map((n) => n.categoryName);
        break;
      case 'SALE':
        initRange = customChannelRangeList && customChannelRangeList[0]?.productSaleName;
        break;
      default:
        break;
    }
    return initRange;
  }

  render() {
    const {
      visible,
      loading,
      onCancel = (e) => e,
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
      channelRecord,
    } = this.props;
    const { customChannelRange } = this.state;
    const newCustomChannelRange = customChannelRange || channelRecord?.channelType?.toLowerCase();
    return (
      <Modal
        zIndex={999}
        visible={visible}
        maskClosable={false}
        destroyOnClose
        title={intl.get(`small.mallHomePlate.view.createChannel`).d('添加频道')}
        width={900}
        onCancel={() => {
          this.channelModalDs.reset();
          onCancel();
        }}
        confirmLoading={loading}
        footer={[
          <Button
            onClick={() => {
              this.channelModalDs.reset();
              onCancel();
            }}
          >
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>,
          <Button onClick={() => this.handleOk()}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>,
          <Button type="primary" onClick={() => this.handleOk({ shelfFlag: 1 })}>
            {intl.get(`small.customBar.model.customBar.onShelf`).d('上架')}
          </Button>,
        ]}
      >
        <Form>
          <Row gutter={48} className="writable-row">
            <Col span={8}>
              <Form.Item
                label={intl.get(`small.mallHomePlate.model.channelBarName`).d('栏目名称')}
                {...formLayout}
              >
                {getFieldDecorator('channelName', {
                  initialValue: channelRecord.channelName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`small.mallHomePlate.model.channeBarlName`).d('栏目名称'),
                      }),
                    },
                  ],
                })(<Input />)}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get('small.mallHomePlate.model.channelTypeName').d('对象')}
                {...formLayout}
              >
                {getFieldDecorator('channelType', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('small.mallHomePlate.model.channelTypeName').d('对象'),
                      }),
                    },
                  ],
                })(
                  <Select
                    value={{
                      channelType: 'SUPPLIER',
                      channelTypeName: intl
                        .get('small.mallHomePlate.model.select.supplier')
                        .d('供应商'),
                    }}
                    name="channelType"
                    defaultValue={channelRecord.channelType}
                    dataSet={this.channelModalDs}
                    onChange={this.handleChannelTypeChange}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get('small.mallHomePlate.model.customChannelRange').d('商品范围')}
                {...formLayout}
              >
                {getFieldDecorator('customChannelRangeList', {
                  // initialValue: this.handleInitRange(channelRecord),
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('small.mallHomePlate.model.customChannelRange')
                          .d('商品范围'),
                      }),
                    },
                  ],
                })(
                  newCustomChannelRange === 'category' ? (
                    <Lov
                      disabled={!newCustomChannelRange}
                      name={newCustomChannelRange}
                      dataSet={this.channelModalDs}
                      maxTagCount={2}
                      maxTagTextLength={3}
                      style={{ width: '100%' }}
                      defaultValue={this.handleInitRange(channelRecord)}
                    />
                  ) : (
                    <Select
                      searchable
                      disabled={!newCustomChannelRange}
                      name={newCustomChannelRange}
                      dataSet={this.channelModalDs}
                      maxTagCount={2}
                      maxTagTextLength={3}
                      style={{ width: '100%' }}
                      defaultValue={this.handleInitRange(channelRecord)}
                    />
                  )
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={48} className="writable-row">
            <Col span={8}>
              <Form.Item
                label={intl.get(`hzero.common.title.uploadImage`).d('上传图片')}
                extra={intl
                  .get(`small.mallHomePlate.model.bar.uploadSize`)
                  .d('上传格式：*.png;*.jpeg，上传大小：220x604px')}
                style={{ marginBottom: '0px' }}
                {...formLayout}
                required
              >
                <Button
                  onClick={() => {
                    if (this.croperModal && this.croperModal.toggle) this.croperModal.toggle();
                  }}
                >
                  <Icon type="upload" /> {intl.get('hzero.common.button.upload').d('上传')}
                </Button>
                {getFieldValue('imagePath') && (
                  <p
                    style={{
                      padding: 8,
                      borderRadius: 2,
                      border: '1px solid #d9d9d9',
                      position: 'relative',
                      marginTop: 8,
                    }}
                  >
                    <img style={{ width: 30 }} src={getFieldValue('imagePath')} alt="" />
                    <Icon
                      onClick={() => {
                        setFieldsValue({
                          imagePath: '',
                        });
                      }}
                      style={{ position: 'absolute', right: 4, top: 4, cursor: 'pointer' }}
                      type="close"
                    />
                  </p>
                )}
              </Form.Item>
              <Form.Item {...formLayout} style={{ marginBottom: '0px' }}>
                {getFieldDecorator('imagePath', {
                  initialValue: channelRecord.imagePath,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`hzero.common.title.uploadImage`).d('上传图片'),
                      }),
                    },
                  ],
                })(<div />)}
              </Form.Item>
            </Col>
            {newCustomChannelRange !== 'sale' && (
              <Col span={8}>
                <Form.Item
                  label={intl.get(`small.common.model.startTime`).d('开始时间')}
                  {...formLayout}
                >
                  {getFieldDecorator('startTime', {
                    initialValue: channelRecord.startTime
                      ? moment(channelRecord.startTime, DEFAULT_DATETIME_FORMAT)
                      : null,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`small.common.model.startTime`).d('开始时间'),
                        }),
                      },
                    ],
                  })(
                    <DatePicker
                      showTime
                      format={DEFAULT_DATETIME_FORMAT}
                      style={{ width: '100%' }}
                      disabledDate={this.selectDisabledDate}
                    />
                  )}
                </Form.Item>
              </Col>
            )}
            {newCustomChannelRange !== 'sale' && (
              <Col span={8}>
                <Form.Item
                  label={intl.get(`small.common.model.endTime`).d('截止时间')}
                  {...formLayout}
                >
                  {getFieldDecorator('endTime', {
                    initialValue: channelRecord.endTime
                      ? moment(channelRecord.endTime, DEFAULT_DATETIME_FORMAT)
                      : null,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`small.common.model.endTime`).d('截止时间'),
                        }),
                      },
                    ],
                  })(
                    <DatePicker
                      showTime
                      format={DEFAULT_DATETIME_FORMAT}
                      style={{ width: '100%' }}
                      disabledDate={this.selectToDisabledDate}
                    />
                  )}
                </Form.Item>
              </Col>
            )}
          </Row>
        </Form>
        <CroperModal
          fn={(ele) => {
            this.croperModal = ele;
          }}
          width={1}
          height={1}
          title={intl.get('small.mallHomePlate.bar.image').d('自定义栏图片')}
          canvasStyle={{ width: 230, height: 230 }}
          callback={this.uploadSuccess}
        />
      </Modal>
    );
  }
}
