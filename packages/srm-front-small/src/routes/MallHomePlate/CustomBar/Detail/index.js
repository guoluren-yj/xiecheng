/**
 * CustomBar\PlatformDetail\Detail.js - 平台自定义栏管理编辑界面
 * @date: 2019年3月2日 09:03:41
 * @author: Jehu <zhihao.zeng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { connect } from 'dva';
import {
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Spin,
  Tabs,
  Collapse,
  Icon,
  Popover,
} from 'hzero-ui';
import { DataSet, Table, Dropdown, Menu, Button } from 'choerodon-ui/pro';
import moment from 'moment';
import qs from 'querystring';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined, map } from 'lodash';
import React, { Component, Fragment } from 'react';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import { Content, Header } from 'components/Page';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getEditTableData,
  filterNullValueObject,
  getCurrentOrganizationId,
  getResponse,
} from 'utils/utils';
import QuickModal from './QuickAddModal';
import FilterForm from './FilterForm';
import CroperModal from '@/routes/Components/CroperModal';
import ImageViewer from '@/routes/Components/ImageViewer';
import { sortChannel } from '@/services/mallHomePlateManageService';
import MultipleSelectionLov from '../MultipleSelectionLov';
import { channelTableDs } from './channelTableDs';
import CreateChannelModal from './CreateChannelModal';

const { Panel } = Collapse;
const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
@connect(({ loading, mallHomePlate }) => ({
  mallHomePlate,
  barLoading: loading.effects['mallHomePlate/fetchBarHeader'],
  saveLoading: loading.effects['mallHomePlate/saveBar'],
  quickLoading: loading.effects['mallHomePlate/quickAddProduct'],
  barAssignLoading: loading.effects['mallHomePlate/getBarProduct'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'small.customBar',
    'small.groupCustomBar',
    'small.mallHomePlate',
    'small.common',
    'small.ecProductQuery',
  ],
})
export default class Detail extends Component {
  filterForm;

  barId = this.props.match.params.barId;

  companyId = this.props.match.params.companyId;

  channelTableDs = new DataSet(channelTableDs);

  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: {},
      selectedRowKeys: [],
      selectedRows: {},
      barId: props.match.params.barId,
      visible: false,
      createChannelVisible: false,
      imgList: [],
      viewVisible: false,
      channelRecord: {},
      imageType: 1, // pc端图片还是移动端
    };
    this.mtpLovRecord = React.createRef();
  }

  croperModal;

  /**
   * 绑定供应商ref
   */
  @Bind()
  handleBindMtpLovRef(ref = {}) {
    this.mtpLovRecord = ref;
  }

  componentDidMount() {
    const {
      dispatch,
      location: { state = { _back: 1 } },
    } = this.props;
    const data = { barId: this.barId, companyId: this.companyId };
    if (!this.barId) {
      dispatch({
        type: 'mallHomePlate/updateState',
        payload: {
          barHeaderInfo: {},
          barProductList: [],
        },
      });
    } else if (!isUndefined(data.barId) && state && state._back !== -1) {
      this.fetchBarData();
      dispatch({
        type: 'mallHomePlate/getBarProduct',
        payload: data,
      });
    }
    this.fetchTree();
    if (this.barId) {
      this.channelTableDs.setQueryParameter('barId', this.barId);
      this.channelTableDs.query();
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'mallHomePlate/updateState',
      payload: {
        barHeaderInfo: {},
        barType: '',
      },
    });
  }

  /**
   *
   * @param {object} ref - 绑定表单ref
   */
  @Bind()
  handleRef(ref = {}) {
    this.filterForm = (ref.props || {}).form;
  }

  @Bind()
  fetchTree() {
    const { dispatch } = this.props;
    dispatch({
      type: 'mallHomePlate/fetchTypeTree',
    });
  }

  /**
   * 开始时间
   * @param {*} current
   */
  @Bind()
  selectDisabledDate(current) {
    const {
      form: { getFieldValue },
    } = this.props;
    if (getFieldValue('endDate')) {
      return (
        current < moment().subtract(1, 'days').endOf('day') - 1 ||
        moment(getFieldValue('endDate')).isBefore(current, 'day')
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
      getFieldValue('startDate') &&
      current &&
      current <
        Math.max.apply(this, [
          moment(getFieldValue('startDate')).startOf('day'),
          moment(current).startOf('day'),
        ])
    ) {
      // return moment(getFieldValue('startDate')).isAfter(current, 'day');
      return true;
    } else {
      // return current && current < moment().subtract(1, 'days').endOf('day');
      return moment(moment().format('YYYY-MM-DD HH:mm:ss')).isAfter(current, 'day');
    }
  }

  /**
   * 数据保存
   */
  @Bind()
  handleDataSave() {
    const {
      dispatch,
      form,
      mallHomePlate: { barHeaderInfo = {}, barProductList = [] },
    } = this.props;
    const editData = getEditTableData(barProductList, ['barAssginId']);
    // if (Array.isArray(barProductList) && barProductList.length !== 0) {
    //   return;
    // }
    const data = {
      ...barHeaderInfo,
      customBarAssignList: [...editData],
      companyId: this.companyId,
    };
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        const payload = {
          ...data,
          ...values,
          startDate: values.startDate
            ? values.startDate.format(DEFAULT_DATETIME_FORMAT)
            : undefined,
          endDate: values.endDate ? values.endDate.format(DEFAULT_DATETIME_FORMAT) : undefined,
          tenantId: getCurrentOrganizationId(),
        };
        dispatch({
          type: 'mallHomePlate/saveBar',
          payload,
        }).then((res) => {
          if (res) {
            this.setState({
              barId: res.barId,
            });
            notification.success();
            this.fetchBarData();
            this.fetchAssignData();
          }
        });
      }
    });
  }

  /**
   * 图片上传成功后的回调
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

  /**
   * 图片删除成功后的回调
   */
  @Bind()
  cancelSuccess(file) {
    const { form } = this.props;
    if (file) {
      form.setFieldsValue({
        imagePath: '',
      });
    }
  }

  /**
   * 图片上传成功后的回调
   */
  @Bind()
  uploadMobileSuccess(file) {
    const { url } = file;
    const { form } = this.props;
    if (url) {
      form.setFieldsValue({
        iconPath: url,
      });
    }
  }

  /**
   * 图片删除成功后的回调
   */
  @Bind()
  cancelMobileSuccess(file) {
    const { form } = this.props;
    if (file) {
      form.setFieldsValue({
        iconPath: '',
      });
    }
  }

  /**
   * 查询自定义栏明细数据
   */
  @Bind()
  fetchBarData(page = {}) {
    const { dispatch } = this.props;
    const { barId } = this.state;
    dispatch({
      type: 'mallHomePlate/fetchBarHeader',
      payload: {
        page,
        barId,
      },
    });
  }

  /**
   * 查询商品数据
   */
  @Bind()
  fetchAssignData(page = {}) {
    const { dispatch } = this.props;
    const { barId } = this.state;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    dispatch({
      type: 'mallHomePlate/getBarProduct',
      payload: {
        page,
        barId,
        ...filterValues,
      },
    });
  }

  /**
   * 非首页清空目录化商品
   */
  @Bind()
  clearCatalogTable() {
    const { dispatch } = this.props;
    dispatch({
      type: 'mallHomePlate/updateState',
      payload: {
        barProductList: [],
      },
    });
  }

  /**
   * 点击添商品
   */
  @Bind()
  handleProductCreate() {
    this.mtpLovRecord.handleSupplierModal();
  }

  @Bind()
  handleQuickCreate() {
    this.setState({ visible: true });
  }

  /**
   * 商品-表格内容改变
   */
  @Bind()
  changeTableData() {
    const {
      dispatch,
      mallHomePlate: { productBarDataChange = false },
    } = this.props;
    if (!productBarDataChange) {
      dispatch({
        type: 'mallHomePlate/updateState',
        payload: {
          productBarDataChange: true,
        },
      });
    }
  }

  /**
   * 勾选点击删除商品
   */
  @Bind()
  handleProductRemove() {
    const {
      dispatch,
      mallHomePlate: { barProductList = [] },
    } = this.props;
    const { selectedRows } = this.state;
    const updateRecord = [];
    const createRecord = [];
    selectedRows.forEach((item) => {
      if (item._status === 'update') {
        updateRecord.push(item);
      }
      if (item._status === 'create') {
        createRecord.push(item);
      }
    });
    // 过滤掉新建的数据
    const record = barProductList.filter((item) => !createRecord.includes(item));
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: () => {
        dispatch({
          type: 'mallHomePlate/updateState',
          payload: {
            barProductList: [...record],
          },
        });
        // 调用删除接口删除已保存的数据
        if (updateRecord.length > 0) {
          dispatch({
            type: 'mallHomePlate/delBarGoodsLines',
            payload: updateRecord,
          }).then((res) => {
            if (res) {
              this.fetchAssignData();
            }
          });
        }
        notification.success();
        this.setState({ selectedRowKeys: [], selectedRows: {} });
      },
    });
  }

  /**
   *选中行
   */
  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys, selectedRows });
  };

  /**
   * 修改自定义栏类型
   * @param {自定义栏类型} value
   */
  @Bind()
  handleTypeChange(value, item) {
    const { dispatch, form } = this.props;
    dispatch({
      type: 'mallHomePlate/updateState',
      payload: {
        barType: value,
      },
    });
    form.setFieldsValue({
      barTypeName: item ? item.props.children : undefined,
      barType: value,
    });
    // getFieldDecorator('barTypeName', { initialValue: item ? item.props.children : undefined });
  }

  /**
   * 行内编辑表格change事件
   * @param {分页} page
   */
  @Bind()
  handleEditTableChange(page = {}) {
    const {
      dispatch,
      mallHomePlate: { productBarDataChange = false },
    } = this.props;
    if (productBarDataChange) {
      Modal.confirm({
        title: intl
          .get(`small.mallHomePlate.view.saveFirstBeforeChange`)
          .d('切换分页前请先保存数据！'),
        onOk: () => {
          this.setState({});
        },
        onCancel: () => {
          this.fetchAssignData(page);
          dispatch({
            type: 'mallHomePlate/updateState',
            payload: {
              productBarDataChange: false,
            },
          });
        },
      });
    } else {
      this.fetchAssignData(page);
    }
  }

  /**
   * 打开商品预览框
   */
  @Bind()
  productPreview(record) {
    const { getFieldValue } = record.$form;
    if (!record.productId) {
      Modal.confirm({
        title: intl.get(`small.mallHomePlate.view.selectProducts`).d('请选择商品！'),
        onOk: () => {
          this.setState();
        },
      });
      return;
    }
    openTab({
      key: `/small/commom-goods-preview`,
      title: intl.get('small.common.button.previewGoods').d('商品预览'),
      search: qs.stringify({
        productId: record.productId,
        sourceFrom: getFieldValue('sourceFrom') || record.sourceFrom,
        companyId: this.companyId,
      }),
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(arr, key) {
    const { collapseKeys } = this.state;
    this.setState({
      collapseKeys: {
        ...collapseKeys,
        [key]: arr,
      },
    });
  }

  /**
   * 禁用的时间范围
   * @param {*} start
   * @param {*} end
   */
  @Bind
  range(start, end) {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  }

  /**
   * 时间禁用
   */
  @Bind
  disabledDateTime(currentDate) {
    const startDate = this.props.form.getFieldValue('startDate');
    if (moment(currentDate).format('YYYYMMDD') === moment(startDate).format('YYYYMMDD')) {
      return {
        disabledHours: () => this.range(0, 24).splice(0, moment(startDate).hours()),
        disabledMinutes: (selectedHour) => {
          if (selectedHour === moment(startDate).hours()) {
            return this.range(0, 60).splice(0, moment(startDate).minutes());
          } else {
            return [];
          }
        },
        disabledSeconds: (selectedHour, selectedMinute) => {
          if (
            selectedHour === moment(startDate).hours() &&
            selectedMinute === moment(startDate).minutes()
          ) {
            return this.range(0, 60).splice(0, moment(startDate).seconds());
          } else {
            return [];
          }
        },
      };
    }
  }

  /**
   * 生成行表格
   * @returns
   */
  @Bind()
  getProductColumns() {
    this.productColumns = [
      {
        title: intl.get(`small.common.model.queue.number`).d('排序号'),
        dataIndex: 'orderSeq',
        render: (val, record) => {
          const { getFieldDecorator } = record.$form;
          return record._status === 'update' || (record._status === 'create' && record.$form) ? (
            <FormItem>
              {getFieldDecorator('orderSeq', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`small.common.model.queue.number`).d('排序号'),
                    }),
                  },
                ],
                initialValue: record.orderSeq,
              })(<InputNumber min={1} max={99999999} style={{ width: '80px' }} />)}
            </FormItem>
          ) : (
            val
          );
        },
      },
      {
        title: intl.get(`small.common.model.sourceType`).d('商品类型'),
        dataIndex: 'sourceFrom',
        render: (val) =>
          val === 'CATA'
            ? intl.get('small.common.model.common.directory').d('目录化')
            : intl.get('small.common.model.common.E-commerce').d('电商'),
      },
      {
        title: intl.get(`small.common.model.supplier`).d('供应商'),
        dataIndex: 'supplierCompanyName',
      },
      {
        title: intl.get(`small.common.model.productCode`).d('商品编码'),
        dataIndex: 'productNum',
      },
      {
        title: intl.get(`small.common.model.productName`).d('商品名称'),
        dataIndex: 'productName',
        width: 400,
      },
      {
        title: intl.get('small.common.model.product.status').d('商品状态'),
        dataIndex: 'shelfFlag',
        width: 90,
        render: (_, record) => {
          const { shelfFlag, shelfErrorMessage } = record;
          return shelfFlag === 1 ? (
            intl.get('small.common.model.shelves').d('上架')
          ) : (
            <Popover
              content={
                shelfErrorMessage || intl.get('small.common.view.manual.unShelf').d('手动下架')
              }
            >
              {intl.get('small.common.model.unShelves').d('下架')}
            </Popover>
          );
        },
      },
      // {
      //   title: intl.get(`small.common.model.operation`).d('操作'),
      //   dataIndex: 'operation',
      //   width: 60,
      //   render: (_, record) => (
      //     <a onClick={() => this.productPreview(record)}>
      //       {intl.get(`small.common.model.preview`).d('预览')}
      //     </a>
      //   ),
      // },
    ];
    return this.productColumns;
  }

  /**
   * 渲染自定义栏明细
   */
  renderCustomBarForm() {
    const {
      mallHomePlate: { customBarType = [], barHeaderInfo = {}, barType, nostockType = [] },
    } = this.props;

    const { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form;
    getFieldDecorator('barTypeName', { initialValue: barHeaderInfo.barTypeName });
    return (
      <Form>
        <Row gutter={48} className="writable-row">
          {/* <Col span={8}>
            <FormItem label={intl.get(`small.common.model.queue.number`).d('排序号')} {...formLayout}>
              {getFieldDecorator('orderSeq', {
                initialValue: barHeaderInfo.orderSeq,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`small.common.model.queue.number`).d('排序号'),
                    }),
                  },
                ],
              })(<InputNumber min={1} max={99999999} style={{ width: '100%' }} />)}
            </FormItem>
          </Col> */}
          <Col span={8}>
            <FormItem
              label={intl.get(`small.mallHomePlate.model.barName`).d('自定义栏名称')}
              {...formLayout}
            >
              {getFieldDecorator('barName', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`small.mallHomePlate.model.barName`).d('自定义栏名称'),
                    }),
                  },
                  {
                    max: 120,
                    message: intl.get('hzero.common.validation.max', {
                      max: 120,
                    }),
                  },
                ],
                initialValue: barHeaderInfo.barName,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`small.mallHomePlate.model.barType`).d('自定义栏类型')}
              {...formLayout}
            >
              {getFieldDecorator('barType', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`small.mallHomePlate.model.barType`).d('自定义栏类型'),
                    }),
                  },
                ],
                initialValue: barHeaderInfo.barType,
              })(
                <Select allowClear onChange={this.handleTypeChange}>
                  {map(customBarType, (item) => {
                    return (
                      <Select.Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Select.Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`small.mallHomePlate.model.quickPositName`).d('快速定位栏名称')}
              {...formLayout}
            >
              {getFieldDecorator('mallBarName', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`small.mallHomePlate.model.quickPositName`)
                        .d('快速定位栏名称'),
                    }),
                  },
                  {
                    max: 6,
                    message: intl.get('hzero.common.validation.max', {
                      max: 6,
                    }),
                  },
                ],
                initialValue: barHeaderInfo.mallBarName,
              })(<Input maxLength={6} />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          {/* <Col span={8}>
            <FormItem
              label={intl.get(`small.mallHomePlate.model.labelCode`).d('标签页')}
              {...formLayout}
            >
              {getFieldDecorator('labelCode', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`small.mallHomePlate.model.labelCode`).d('标签页'),
                    }),
                  },
                ],
                initialValue: barHeaderInfo.labelCode || 'ALL',
              })(
                <Lov
                  code="SMAL.CUSTOM_BAR_LABEL_CODE"
                  textValue={
                    barHeaderInfo.labelName || intl.get('small.common.view.homeIndex').d('首页')
                  }
                  queryParams={{
                    tenantId: getCurrentOrganizationId(),
                    companyId: this.companyId,
                  }}
                  disabled
                />
              )}
            </FormItem>
          </Col> */}
          <Col span={8}>
            <FormItem
              label={intl.get(`small.common.model.startTime`).d('开始时间')}
              {...formLayout}
            >
              {getFieldDecorator('startDate', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`small.common.model.startTime`).d('开始时间'),
                    }),
                  },
                ],
                initialValue: barHeaderInfo.startDate
                  ? moment(barHeaderInfo.startDate, DEFAULT_DATETIME_FORMAT)
                  : null,
              })(
                <DatePicker
                  showTime
                  format={DEFAULT_DATETIME_FORMAT}
                  style={{ width: '100%' }}
                  disabledDate={this.selectDisabledDate}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get(`small.common.model.endTime`).d('截止时间')} {...formLayout}>
              {getFieldDecorator('endDate', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`small.common.model.endTime`).d('截止时间'),
                    }),
                  },
                ],
                initialValue: barHeaderInfo.endDate
                  ? moment(barHeaderInfo.endDate, DEFAULT_DATETIME_FORMAT)
                  : null,
              })(
                <DatePicker
                  showTime
                  format={DEFAULT_DATETIME_FORMAT}
                  style={{ width: '100%' }}
                  disabledDate={this.selectToDisabledDate}
                  disabledTime={this.disabledDateTime}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`small.common.only.show.stock`).d('包含无货商品')}
              {...formLayout}
            >
              {getFieldDecorator('stockAvailableEnabled', {
                initialValue: barHeaderInfo.stockAvailableEnabled || '1',
              })(
                <Select>
                  {nostockType &&
                    nostockType.map((item) => (
                      <Select.Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        {barType === 'IMAGE' && (
          <Row gutter={48} className="writable-row">
            <Col span={8}>
              <FormItem
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
                    this.setState({ imageType: 1 });
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
              </FormItem>
              <FormItem wrapperCol={{ span: 15, offset: 6 }} style={{ marginBottom: '0px' }}>
                {getFieldDecorator('imagePath', {
                  initialValue: barHeaderInfo.imagePath,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`hzero.common.title.uploadImage`).d('上传图片'),
                      }),
                    },
                  ],
                })(<div />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label={intl.get(`small.mallHomePlate.model.uploadMobileImage`).d('上传移动端图片')}
                extra={intl
                  .get(`small.common.model.customer.uploadMobileSize`)
                  .d('上传格式：*.png;*.jpeg，上传大小：321x74px')}
                style={{ marginBottom: '0px' }}
                {...formLayout}
              >
                <Button
                  onClick={() => {
                    this.setState({ imageType: 2 });
                    if (this.croperModal && this.croperModal.toggle) this.croperModal.toggle();
                  }}
                >
                  <Icon type="upload" /> {intl.get('hzero.common.button.upload').d('上传')}
                </Button>
                {getFieldValue('iconPath') && (
                  <p
                    style={{
                      padding: 8,
                      borderRadius: 2,
                      border: '1px solid #d9d9d9',
                      position: 'relative',
                      marginTop: 8,
                    }}
                  >
                    <img style={{ width: 90 }} src={getFieldValue('iconPath')} alt="" />
                    <Icon
                      onClick={() => {
                        setFieldsValue({
                          iconPath: '',
                        });
                      }}
                      style={{ position: 'absolute', right: 4, top: 4, cursor: 'pointer' }}
                      type="close"
                    />
                  </p>
                )}
              </FormItem>
              <FormItem wrapperCol={{ span: 15, offset: 6 }} style={{ marginBottom: '0px' }}>
                {getFieldDecorator('iconPath', {
                  initialValue: barHeaderInfo.iconPath,
                })(<div />)}
              </FormItem>
            </Col>
          </Row>
        )}
      </Form>
    );
  }

  handleOk = (cid) => {
    const {
      dispatch,
      mallHomePlate: { barProductList = [] },
    } = this.props;
    const { barId } = this.state;

    const isCreateData = barProductList.some((d) => d._status === 'create');

    const updateFn = () => {
      dispatch({
        type: 'mallHomePlate/quickAddProduct',
        payload: {
          cid,
          barId,
          companyId: this.companyId,
          orderSeq: barProductList[barProductList.length - 1]
            ? barProductList[barProductList.length - 1].orderSeq
            : 0,
        },
      }).then(() => {
        notification.success();
        this.setState({ visible: false });
        this.fetchBarData();
        this.fetchAssignData();
      });
    };

    if (isCreateData) {
      Modal.confirm({
        title: intl
          .get('small.mallHomePlate.model.quickAddMsg')
          .d('当前存在未保存商品行，快速添加商品将会重置商品行?'),
        onOk: () => {
          updateFn();
        },
      });
    } else {
      updateFn();
    }
  };

  /**
   * 频道图片预览
   */
  @Bind()
  handleViewImg(imagePath) {
    this.setState({
      viewVisible: true,
      imgList: [{ fileUrl: imagePath }],
    });
  }

  /**
   * 渲染编辑列
   */
  @Bind()
  renderOptions({ record }) {
    let operate = '';
    const menu = (
      <Menu>
        <Menu.Item>
          <a
            disabled={record.data.shelfFlag === '1'}
            onClick={() =>
              this.setState({ createChannelVisible: true, channelRecord: record.data })
            }
          >
            {intl.get('hzero.common.model.edit').d('编辑')}
          </a>
        </Menu.Item>
        {record.data.shelfFlag === '0' && (
          <Menu.Item>
            <a onClick={() => this.channelTableDs.delete([record])}>
              {intl.get('hzero.common.btn.delete').d('删除')}
            </a>
          </Menu.Item>
        )}
      </Menu>
    );

    operate = (
      <span className="action-link">
        {record.data.shelfFlag === '1' ? (
          <a onClick={() => this.handleCreateChannel(record.data, { shelfFlag: 0 })}>
            {intl.get('small.common.model.unShelves').d('下架')}
          </a>
        ) : (
          <a onClick={() => this.handleCreateChannel(record.data, { shelfFlag: 1 })}>
            {intl.get('small.common.model.shelves').d('上架')}
          </a>
        )}
        {/* <a
          disabled={record.get('barType') === 'NORMAL'}
          onClick={() => this.handleViewImg(record.get('imagePath'))}
        >
          {intl.get('small.common.model.preview').d('预览')}
        </a> */}
        <Dropdown overlay={menu}>
          <a>
            {intl.get('small.common.view.button.more').d('更多操作')}
            <Icon type="arrow_drop_down" />
          </a>
        </Dropdown>
      </span>
    );
    return operate;
  }

  /**
   * 创建/上下架频道
   */
  @Bind()
  handleCreateChannel(params, type = {}) {
    const {
      dispatch,
      mallHomePlate: { barHeaderInfo = {} },
    } = this.props;
    const { barId } = barHeaderInfo;
    dispatch({
      type: 'mallHomePlate/saveChannel',
      payload: [
        {
          ...params,
          ...type,
          barId,
        },
      ],
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({ createChannelVisible: false });
        this.channelTableDs.setQueryParameter('barId', barId);
        this.channelTableDs.query();
      }
    });
  }

  /**
   * 拖拽排序
   */
  @Bind()
  async handleDragEnd() {
    const data = this.channelTableDs.toData();
    const { currentPage, totalCount, pageSize } = this.channelTableDs;
    const params = {
      pageSize,
      customChannelList: data,
      totalNum: totalCount,
      pageNum: currentPage,
    };
    const res = await sortChannel(params);
    getResponse(res);
    this.channelTableDs.query(this.channelTableDs.currentPage);
  }

  /**
   * 通用导入
   */
  @Bind()
  handleImport() {
    openTab({
      key: `/small/data-import/company/SMAL.CUSTOM_BAR_IMPORT`,
      title: 'hzero.common.button.import',
      search: qs.stringify({
        action: 'hzero.common.button.import',
        backPath: `/small/mall-home-plate/edit-bar/${this.companyId}/${this.barId}`,
        args: JSON.stringify({ barId: this.barId }),
      }),
    });
  }

  addButton = (
    <Button
      icon="add"
      key="add"
      onClick={() => this.setState({ createChannelVisible: true, channelRecord: {} })}
    >
      {intl.get('hzero.common.button.create').d('新增')}
    </Button>
  );

  render() {
    const {
      saveLoading,
      barLoading,
      quickLoading,
      barAssignLoading,
      mallHomePlate: {
        barHeaderInfo = {},
        barProductList = [],
        treeList = [],
        barProductPage = {},
      },
    } = this.props;

    const { barId } = barHeaderInfo;
    const {
      selectedRowKeys,
      collapseKeys,
      visible,
      createChannelVisible,
      viewVisible,
      imgList,
      channelRecord,
    } = this.state;

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    const filterProps = {
      companyId: this.companyId,
      onSearch: this.fetchAssignData,
      onRef: this.handleRef,
    };

    const multipleLovProps = {
      barId,
      rowKey: 'skuId',
      onRef: this.handleBindMtpLovRef,
    };

    const quickProps = {
      treeList,
      visible,
      loading: quickLoading,
      onOk: this.handleOk,
      onCancel: () => this.setState({ visible: false }),
    };

    const createChannelProps = {
      visible: createChannelVisible,
      channelRecord,
      onOk: this.handleCreateChannel,
      onCancel: () => this.setState({ createChannelVisible: false }),
    };

    const buttons = [this.addButton, 'delete'];

    const channelColumns = [
      {
        name: 'lineNum',
        width: 80,
      },
      {
        name: 'channelName',
      },
      {
        name: 'channelTypeName',
        width: 150,
      },
      {
        name: 'customChannelRangeList',
        width: 200,
        renderer: ({ record }) => {
          const { channelType, customChannelRangeList = [] } = record.data;
          const newCustomChannelRange = customChannelRangeList.map((n) => {
            let channelRange;
            switch (channelType) {
              case 'SUPPLIER':
                channelRange = n.supplierCompanyName;
                break;
              case 'CATEGORY':
                channelRange = n.categoryName;
                break;
              case 'SALE':
                channelRange = n.productSaleName;
                break;
              default:
                break;
            }
            return channelRange;
          });
          return newCustomChannelRange.join('/');
        },
      },
      {
        name: 'quantity',
        width: 150,
      },
      {
        name: 'shelfFlag',
        width: 100,
        renderer: ({ record }) => {
          return record.data.shelfFlag === '1'
            ? intl.get('small.ecProductQuery.model.ecProductQuery.onShelves').d('已上架')
            : intl.get('small.ecProductQuery.model.ecProductQuery.notOnShelves').d('未上架');
        },
      },
      {
        name: 'option',
        width: 200,
        lock: 'right',
        renderer: this.renderOptions,
      },
    ];

    return (
      <Fragment>
        <Header
          title={
            this.barId
              ? intl.get(`small.mallHomePlate.view.customBar.edit`).d('编辑自定义栏')
              : intl.get(`small.mallHomePlate.view.customBar.create`).d('新建自定义栏')
          }
          backPath="/small/mall-home-plate/list?key=bar"
        >
          <Button
            icon="save"
            type="primary"
            onClick={this.handleDataSave}
            loading={saveLoading || barLoading || barAssignLoading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={!!barLoading} wrapperClassName="ued-detail-wrapper">
            <Collapse
              defaultActiveKey={['customBarDetail']}
              onChange={(arr) => this.onCollapseChange(arr, 'customBarDetail')}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {intl.get(`small.mallHomePlate.view.customBar.detail`).d('自定义栏明细')}
                    </h3>
                    <a>
                      {collapseKeys.customBarDetail
                        ? collapseKeys.customBarDetail.some((o) => o === 'customBarDetail')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')
                        : intl.get(`hzero.common.button.up`).d('收起')}
                    </a>
                    <Icon
                      type={
                        collapseKeys.customBarDetail
                          ? collapseKeys.customBarDetail.some((o) => o === 'customBarDetail')
                            ? 'up'
                            : 'down'
                          : 'up'
                      }
                    />
                  </Fragment>
                }
                key="customBarDetail"
              >
                {this.renderCustomBarForm()}
              </Panel>
            </Collapse>
            {barId &&
              (barHeaderInfo.barType !== 'CHANNEL' ? (
                <Tabs defaultActiveKey="goods" animated={false}>
                  <Tabs.TabPane tab={intl.get(`small.common.model.goods`).d('商品')} key="goods">
                    <Fragment>
                      <div className="table-list-search">
                        <FilterForm {...filterProps} />
                      </div>
                      <div className="table-operator">
                        <Button onClick={this.handleProductCreate} type="primary" icon="plus">
                          {intl.get('small.common.model.add').d('添加')}
                        </Button>
                        <Button onClick={this.handleQuickCreate} icon="plus">
                          {intl.get('small.common.model.quickAdd').d('快速添加')}
                        </Button>
                        <Button
                          onClick={this.handleProductRemove}
                          disabled={selectedRowKeys.length === 0}
                          icon="delete"
                        >
                          {intl.get('hzero.common.button.delete').d('删除')}
                        </Button>
                        <Button onClick={this.handleImport}>
                          {intl.get('hzero.common.button.batchImport').d('批量导入')}
                        </Button>
                      </div>
                      <EditTable
                        dataSource={barProductList}
                        pagination={barProductPage}
                        loading={barAssignLoading}
                        columns={this.getProductColumns()}
                        onChange={this.handleEditTableChange}
                        onChangeTableData={this.changeTableData}
                        rowSelection={rowSelection}
                        rowKey="barAssginId"
                        bordered
                      />
                    </Fragment>
                  </Tabs.TabPane>
                </Tabs>
              ) : (
                <Tabs defaultActiveKey="channel" animated={false}>
                  <Tabs.TabPane
                    tab={intl.get(`small.mallHomePlate.view.channel`).d('频道')}
                    key="channel"
                  >
                    <Table
                      key="channelId"
                      pristine
                      rowDraggable
                      border={null}
                      buttons={buttons}
                      queryFieldsLimit={3}
                      columns={channelColumns}
                      dataSet={this.channelTableDs}
                      onDragEnd={this.handleDragEnd}
                    />
                  </Tabs.TabPane>
                </Tabs>
              ))}
          </Spin>
        </Content>
        <MultipleSelectionLov ref={this.mtpLovRecord} {...multipleLovProps} />
        <QuickModal {...quickProps} />
        <CroperModal
          fn={(ele) => {
            this.croperModal = ele;
          }}
          width={this.state.imageType === 1 ? 55 : 321}
          height={this.state.imageType === 1 ? 151 : 74}
          title={
            this.state.imageType === 1
              ? intl.get('small.mallHomePlate.bar.image').d('自定义栏图片')
              : intl.get('small.mallHomePlate.bar.mobileImage').d('自定义栏移动端图片')
          }
          canvasStyle={
            this.state.imageType === 1 ? { width: 55, height: 151 } : { width: 321, height: 74 }
          }
          callback={this.state.imageType === 1 ? this.uploadSuccess : this.uploadMobileSuccess}
        />
        {createChannelVisible && <CreateChannelModal {...createChannelProps} />}
        {viewVisible && (
          <ImageViewer
            imgList={imgList}
            closeModal={() => this.setState({ viewVisible: false, imgList: [] })}
          />
        )}
      </Fragment>
    );
  }
}
