/**
 * ReviewTable
 * @date: 2018-10-9
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import {
  Form,
  Badge,
  Drawer,
  Button,
  Input,
  Row,
  Col,
  InputNumber,
  DatePicker,
  Tooltip,
  Icon,
} from 'hzero-ui';
import { sum, isNumber, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import Table from 'srm-front-boot/lib/components/Table';
import intl from 'utils/intl';
import { createPagination, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { dateRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import Switch from 'components/Switch';
import ValueList from 'components/ValueList';
import LovMulti from 'srm-front-cuz/lib/custH0X/LovMulti';
import Lov from 'components/Lov';
import { renderAttachmentText } from '@/routes/components/utils';
import AttachmentModal from './AttachmentModal';
import FilterForm from '../components/FilterForm';
import styles from '../index.less';

const FormItem = Form.Item;

const dateFormat = DEFAULT_DATE_FORMAT;

/**
 * 推荐物料/品类
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} showEditModal 显示编辑模态框
 * @reactProps {Object} form 表单
 * @return React.element
 */
@formatterCollections({
  code: ['sslm.supplyAbility', 'sslm.common'],
})
@Form.create({ fieldNameProp: null })
export default class ReviewTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      drawerVisible: false,
      recordSource: {},
      abilityLineId: null, // 供货能力清单行id
      supplyAbilityId: null, // 供货能力清单id
      selectedRows: [], // 选中的rowKeys
      uploadModalEdit: true, // 附件是否可上传
    };
  }

  componentDidMount() {
    const { onClearRows } = this.props;
    if (isFunction(onClearRows)) onClearRows(this.handleClearSelectedRows);
  }

  /**
   * 将selectedRows置空
   */
  @Bind()
  handleClearSelectedRows() {
    this.setState({ selectedRows: [] });
  }

  /**
   * 保存编辑的数据
   */
  @Bind()
  saveFormData() {
    const { form, dataSource = {}, onAdd, handleReviewSave = () => {} } = this.props;
    const newContent = dataSource.content;
    const { recordSource = {} } = this.state;

    form.validateFields((err, fieldsValues) => {
      if (!err) {
        const { psaFinishDate, spaFinishDate, dateFrom, dateTo } = fieldsValues;
        const dateObject = {
          psaFinishDate: psaFinishDate && moment(psaFinishDate).format(DEFAULT_DATE_FORMAT),
          spaFinishDate: spaFinishDate && moment(spaFinishDate).format(DEFAULT_DATE_FORMAT),
          dateFrom: dateFrom && moment(dateFrom).format(DEFAULT_DATE_FORMAT),
          dateTo: dateTo && moment(dateTo).format(DEFAULT_DATE_FORMAT),
        };
        const newFieldsValues = {
          ...recordSource,
          ...fieldsValues,
          ...dateObject,
          tenantId: getCurrentOrganizationId(),
        };
        let flag = true;
        const fieldsValuesObj = {
          ...fieldsValues,
          ...dateObject,
        };
        for (const key in fieldsValuesObj) {
          if (Object.prototype.hasOwnProperty.call(fieldsValuesObj, key)) {
            if (recordSource[key] !== fieldsValuesObj[key]) {
              flag = false;
            }
          }
        }
        let newDataSource = [];
        const { abilityLineId } = newFieldsValues;
        newDataSource =
          newContent &&
          newContent.map(item => {
            if (item.abilityLineId === abilityLineId) {
              return { ...item, ...newFieldsValues, _status: flag ? null : 'update' };
            } else {
              return item;
            }
          });
        onAdd(newDataSource, 'categoryMaterialData', true);
        if (!flag) {
          const savaData = { ...newFieldsValues, _status: 'update' };
          handleReviewSave(savaData, this.onClose);
        }
        // this.onClose();
      }
    });
  }

  /**
   * 列表分页函数
   * @param {Number} [params.page = 0] - 数据页码
   * @param {Number} [params.size = 10] - 分页大小
   */
  @Bind()
  handleTableChange(pagination) {
    // 处理查询参数
    let queryParam = {};
    if (this.categoryFilterForm) {
      const { getFieldsValue } = this.categoryFilterForm;
      const filteValue = getFieldsValue();
      const { itemCategoryIdList, categoryName, itemIdList, itemName, ...others } = filteValue;
      const newItemCategoryIdList = (itemCategoryIdList && itemCategoryIdList.split(',')) || [];
      const newItemIds = (itemIdList && itemIdList.split(',')) || [];
      // 如果验证成功,则执行onSearch
      queryParam = filterNullValueObject({
        ...others,
        itemCategoryIdList: newItemCategoryIdList,
        itemIdList: newItemIds,
      });
    }
    this.props.onTableChange(pagination, queryParam);
  }

  /**
   * 打开modal 保存或者编辑
   * @param {Object} recordSource 编辑的数据
   */
  @Bind()
  onOpen(recordSource = {}) {
    if (recordSource) {
      this.setState({ drawerVisible: true, recordSource });
    } else {
      this.setState({ drawerVisible: true, recordSource: {} });
    }
  }

  /**
   * 关闭modal并清空form
   */
  @Bind()
  onClose() {
    this.props.form.resetFields();
    this.setState({ drawerVisible: false, recordSource: {} });
  }

  /**
   * 附件上传modal框
   */
  @Bind()
  handleAttamentModal(record = {}, uploadEdit = true) {
    const { modalVisible } = this.state;
    const { abilityLineId, supplyAbilityId } = record;
    this.setState({
      modalVisible: !modalVisible,
      abilityLineId,
      supplyAbilityId,
      uploadModalEdit: uploadEdit,
    });
  }

  renderForm() {
    const { form, customizeForm = () => {} } = this.props;
    const { getFieldDecorator } = form;
    const { recordSource } = this.state;
    const formLayOut = {
      labelCol: { span: 9 },
      wrapperCol: { span: 15 },
    };
    const style = { margin: 0, padding: 0, whiteSpace: 'nowrap' };
    const supplyStatusTip = (
      <React.Fragment>
        <p style={style}>
          {intl.get(`sslm.supplyAbility.model.supAbility.supplyStatus`).d('可供状态')}-G：
          {intl.get(`sslm.supplyAbility.view.message.supplyStatusG`).d('Green, 表示供货能力强')};
        </p>
        <p style={style}>
          {intl.get(`sslm.supplyAbility.model.supAbility.supplyStatus`).d('可供状态')}-Y：
          {intl
            .get(`sslm.supplyAbility.view.message.supplyStatusY`)
            .d('Yellow, 表示供货能力有风险')}
          ;
        </p>
        <p style={style}>
          {intl.get(`sslm.supplyAbility.model.supAbility.supplyStatus`).d('可供状态')}-R：
          {intl.get(`sslm.supplyAbility.view.message.supplyStatusR`).d('Red, 表示供货能力严重不足')}
          ;
        </p>
      </React.Fragment>
    );
    const psaTip = intl
      .get(`sslm.supplyAbility.view.message.psaShortTip`)
      .d(
        'PSA即Probabilistic Safety Assessment，概率安全评价，也常称为概率风险评价（PRA），是以概率论为基础的风险量化评价技术。'
      );
    const psaScoreTip = intl
      .get(`sslm.supplyAbility.view.message.psaScoreTip`)
      .d(
        'PSA即Probabilistic  Safety Assessment，概率安全评价，也常称为概率风险评价（PRA），是以概率论为基础的风险量化评价技术。PSA评分即将概率风险指标量化，进行打分。'
      );
    const psaFinishDate = intl
      .get(`sslm.supplyAbility.view.message.psaFinishDate`)
      .d('风险量化评价的完成时间。');
    const spaTip = intl
      .get(`sslm.supplyAbility.view.message.spaTip`)
      .d(
        'SPA即Safety Comprehensive Assessment，安全综合评价，可避免企业选用不安全的流程或原材料，可降低或消除现实危险性。SPA评级即将安全指标量化，划分等级。'
      );
    const spaScore = intl
      .get(`sslm.supplyAbility.view.message.spaScore`)
      .d(
        'SPA即Safety Comprehensive Assessment，安全综合评价，可避免企业选用不安全的流程或原材料，可降低或消除现实危险性。SPA评分即将安全指标量化，进行打分。'
      );
    const spaFinishDate = intl
      .get(`sslm.supplyAbility.view.message.spaFinishDate`)
      .d('安全综合评价的完成时间。');
    return customizeForm(
      {
        code: 'SSLM.SUPPLIER_ABILITY_REVIEW.ITEM_FORM',
        form,
        dataSource: recordSource,
      },
      <Form layout="horizontal">
        <Row gutter={24}>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl.get(`sslm.supplyAbility.model.supplyAbility.itemCode`).d('物料编码')}
            >
              {getFieldDecorator('itemCode', {
                initialValue: recordSource.itemCode,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl.get(`sslm.supplyAbility.model.supplyAbility.itemRelName`).d('物料名称')}
            >
              {getFieldDecorator('itemName', {
                initialValue: recordSource.itemName,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl
                .get(`sslm.supplyAbility.model.supplyAbility.itemCategoryCode`)
                .d('品类代码')}
            >
              {getFieldDecorator('itemCategoryCode', {
                initialValue: recordSource.itemCategoryCode,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl
                .get(`sslm.supplyAbility.model.supplyAbility.itemCategoryName`)
                .d('品类名称')}
            >
              {getFieldDecorator('itemCategoryName', {
                initialValue: recordSource.itemCategoryName,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl.get(`sslm.supplyAbility.model.supplyAbility.supplyFlag`).d('是否可供')}
            >
              {getFieldDecorator('supplyFlag', {
                initialValue: recordSource.supplyFlag || 0,
              })(<Switch disabled />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl
                .get(`sslm.supplyAbility.model.supplyAbility.adapterProducts`)
                .d('适配产品')}
            >
              {getFieldDecorator('adapterProducts', {
                initialValue: recordSource.adapterProducts,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl
                .get(`sslm.supplyAbility.model.supplyAbility.countryIdMeaning`)
                .d('服务国家')}
            >
              {getFieldDecorator('countryIdMeaning', {
                initialValue: recordSource.countryIdMeaning,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl
                .get(`sslm.supplyAbility.model.supplyAbility.regionIdMeaning`)
                .d('服务地区')}
            >
              {getFieldDecorator('regionIdMeaning', {
                initialValue: recordSource.regionIdMeaning,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl.get(`sslm.supplyAbility.model.supplyAbility.cityIdMeaning`).d('服务城市')}
            >
              {getFieldDecorator('cityIdMeaning', {
                initialValue: recordSource.cityIdMeaning,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              // dateFrom: 有效日期从,
              {...formLayOut}
              label={intl.get(`sslm.supplyAbility.model.supplyAbility.dateFrom`).d('有效期从')}
            >
              {getFieldDecorator('dateFrom', {
                initialValue: recordSource.dateFrom && moment(recordSource.dateFrom, dateFormat),
              })(<DatePicker disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <FormItem
              // dateTo: 有效日期至,
              {...formLayOut}
              label={intl.get(`sslm.supplyAbility.model.supplyAbility.dateTo`).d('有效期至')}
            >
              {getFieldDecorator('dateTo', {
                initialValue: recordSource.dateTo && moment(recordSource.dateTo, dateFormat),
              })(<DatePicker disabled />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={
                <Tooltip title={supplyStatusTip}>
                  <Icon style={{ fontSize: 14 }} type="exclamation" />
                  {intl.get(`sslm.supplyAbility.model.supplyAbility.supplyStatus`).d('可供状态')}
                </Tooltip>
              }
            >
              {getFieldDecorator('supplyStatus', {
                initialValue: recordSource.supplyStatus,
              })(
                <ValueList
                  lovCode="SSLM.SUPPLYING_STATUS"
                  textValue={recordSource.supplyStatusMeaning}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={
                <Tooltip title={psaTip}>
                  <Icon style={{ fontSize: 14 }} type="exclamation" />
                  {intl
                    .get(`sslm.supplyAbility.model.supplyAbility.psaEvaluationLevel`)
                    .d('PSA评级')}
                </Tooltip>
              }
            >
              {getFieldDecorator('psaEvaluationLevel', {
                initialValue: recordSource.psaEvaluationLevel,
              })(<ValueList lovCode="SSLM.EVALUATION_LEVEL" />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={
                <Tooltip title={psaScoreTip}>
                  <Icon style={{ fontSize: 14 }} type="exclamation" />
                  {intl
                    .get(`sslm.supplyAbility.model.supplyAbility.psaEvaluationScore`)
                    .d('PSA评分')}
                </Tooltip>
              }
            >
              {getFieldDecorator('psaEvaluationScore', {
                initialValue: recordSource.psaEvaluationScore,
              })(<InputNumber min={0} precision={2} style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={
                <Tooltip title={psaFinishDate}>
                  <Icon style={{ fontSize: 14 }} type="exclamation" />
                  {intl
                    .get(`sslm.supplyAbility.model.supplyAbility.psaFinishDate`)
                    .d('PSA完成时间')}
                </Tooltip>
              }
            >
              {getFieldDecorator('psaFinishDate', {
                initialValue:
                  recordSource.psaFinishDate && moment(recordSource.psaFinishDate, dateFormat),
              })(<DatePicker placeholder="" style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={
                <Tooltip title={spaTip}>
                  <Icon style={{ fontSize: 14 }} type="exclamation" />
                  {intl.get(`sslm.supplyAbility.model.supplyAbility.spaLevel`).d('SPA评级')}
                </Tooltip>
              }
            >
              {getFieldDecorator('spaEvaluationLevel', {
                initialValue: recordSource.spaEvaluationLevel,
              })(<ValueList lovCode="SSLM.EVALUATION_LEVEL" />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={
                <Tooltip title={spaScore}>
                  <Icon style={{ fontSize: 14 }} type="exclamation" />
                  {intl.get(`sslm.supplyAbility.model.supplyAbility.spaScore`).d('SPA评分')}
                </Tooltip>
              }
            >
              {getFieldDecorator('spaEvaluationScore', {
                initialValue: recordSource.spaEvaluationScore,
              })(<InputNumber min={0} precision={2} style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={
                <Tooltip title={spaFinishDate}>
                  <Icon style={{ fontSize: 14 }} type="exclamation" />
                  {intl
                    .get(`sslm.supplyAbility.model.supplyAbility.spaFinishDate`)
                    .d('SPA完成时间')}
                </Tooltip>
              }
            >
              {getFieldDecorator('spaFinishDate', {
                initialValue:
                  recordSource.spaFinishDate && moment(recordSource.spaFinishDate, dateFormat),
              })(<DatePicker placeholder="" style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl
                .get(`sslm.supplyAbility.model.supplyAbility.evaluateRemark`)
                .d('评价信息')}
            >
              {getFieldDecorator('evaluateRemark', {
                initialValue: recordSource.evaluateRemark,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl
                .get(`sslm.supplyAbility.model.supplyAbility.inventoryOrganization`)
                .d('库存组织')}
            >
              {getFieldDecorator('inventoryOrganizationId', {
                initialValue: recordSource.inventoryOrganizationId,
              })(
                <LovMulti
                  code="SSLM.INV_ORGANIZATION"
                  translateData={recordSource.inventoryOrganizationMeaning}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl
                .get(`sslm.supplyAbility.model.supplyAbility.purchasingOrganization`)
                .d('采购组织')}
            >
              {getFieldDecorator('purchaseOrganizationId', {
                initialValue: recordSource.purchaseOrganizationId,
              })(
                <Lov
                  code="SPFM.USER_AUTH.PURORG"
                  lovOptions={{
                    displayField: 'organizationName',
                    valueField: 'purchaseOrgId',
                  }}
                  textValue={recordSource.purchaseOrganizationName}
                  disabled
                />
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl.get(`sslm.supplyAbility.model.supplyAbility.manufacturer`).d('生产厂家')}
            >
              {getFieldDecorator('manufacturer', {
                initialValue: recordSource.manufacturer,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 选中项发生变化时的回调
   */
  @Bind()
  handleSelectChange(selectedRowKeys, selectedRows) {
    const { onSelectChange } = this.props;
    this.setState({ selectedRows });
    if (isFunction(onSelectChange)) {
      onSelectChange(selectedRows);
    }
  }

  render() {
    const {
      dataSource = {},
      viewOnly = false,
      isEdit = false,
      isPub = false,
      isReview = false,
      optional = undefined,
      customizeTable = () => {},
      handleAttrChange = () => {},
      customizeCode = '',
      customizeFilterForm = () => {},
      queryCategoryMaterialData,
      filterCode,
      linkColor,
      attCustomizeCode,
    } = this.props;
    const {
      drawerVisible,
      modalVisible,
      abilityLineId,
      supplyAbilityId,
      selectedRows,
      uploadModalEdit,
    } = this.state;
    const style = { margin: 0, padding: 0, whiteSpace: 'nowrap' };
    const supplyStatusTip = (
      <React.Fragment>
        <p style={style}>
          {intl.get(`sslm.supplyAbility.model.supAbility.supplyStatus`).d('可供状态')}-G：
          {intl.get(`sslm.supplyAbility.view.message.supplyStatusG`).d('Green, 表示供货能力强')};
        </p>
        <p style={style}>
          {intl.get(`sslm.supplyAbility.model.supAbility.supplyStatus`).d('可供状态')}-Y：
          {intl
            .get(`sslm.supplyAbility.view.message.supplyStatusY`)
            .d('Yellow, 表示供货能力有风险')}
          ;
        </p>
        <p style={style}>
          {intl.get(`sslm.supplyAbility.model.supAbility.supplyStatus`).d('可供状态')}-R：
          {intl.get(`sslm.supplyAbility.view.message.supplyStatusR`).d('Red, 表示供货能力严重不足')}
          ;
        </p>
      </React.Fragment>
    );
    const psaTip = intl
      .get(`sslm.supplyAbility.view.message.psaShortTip`)
      .d(
        'PSA即Probabilistic Safety Assessment，概率安全评价，也常称为概率风险评价（PRA），是以概率论为基础的风险量化评价技术。'
      );
    const psaScoreTip = intl
      .get(`sslm.supplyAbility.view.message.psaScoreTip`)
      .d(
        'PSA即Probabilistic  Safety Assessment，概率安全评价，也常称为概率风险评价（PRA），是以概率论为基础的风险量化评价技术。PSA评分即将概率风险指标量化，进行打分。'
      );
    const psaFinishDate = intl
      .get(`sslm.supplyAbility.view.message.psaFinishDate`)
      .d('风险量化评价的完成时间。');
    const spaTip = intl
      .get(`sslm.supplyAbility.view.message.spaTip`)
      .d(
        'SPA即Safety Comprehensive Assessment，安全综合评价，可避免企业选用不安全的流程或原材料，可降低或消除现实危险性。SPA评级即将安全指标量化，划分等级。'
      );
    const spaScore = intl
      .get(`sslm.supplyAbility.view.message.spaScore`)
      .d(
        'SPA即Safety Comprehensive Assessment，安全综合评价，可避免企业选用不安全的流程或原材料，可降低或消除现实危险性。SPA评分即将安全指标量化，进行打分。'
      );
    const spaFinishDate = intl
      .get(`sslm.supplyAbility.view.message.spaFinishDate`)
      .d('安全综合评价的完成时间。');

    const attachmentModalProps = {
      supplyAbilityId,
      viewOnly,
      isPub,
      isVisible: modalVisible,
      uploadModalEdit,
      supplyAbilityLineId: abilityLineId,
      optional,
      onCancel: this.handleAttamentModal,
      handleAttrChange,
      attCustomizeCode,
    };
    const columns = [
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.lineStatus`).d('行状态'),
        width: 120,
        dataIndex: 'supplyReviewStatusMeaning',
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCode`).d('物料编码'),
        width: 150,
        dataIndex: 'itemCode',
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.itemName`).d('物料描述'),
        width: 150,
        dataIndex: 'itemName',
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCategoryCode`).d('品类代码'),
        width: 150,
        dataIndex: 'itemCategoryCode',
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.categoryName`).d('品类名称'),
        width: 150,
        dataIndex: 'itemCategoryName',
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.adapterProducts`).d('适配产品'),
        width: 150,
        dataIndex: 'adapterProducts',
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.supplyFlag`).d('是否可供'),
        width: 100,
        dataIndex: 'supplyFlag',
        render: value => {
          return (
            <Badge
              status={value === 1 ? 'success' : 'error'}
              text={
                value === 1
                  ? intl.get('hzero.common.status.yes').d('是')
                  : intl.get('hzero.common.status.no').d('否')
              }
            />
          );
        },
      },
      {
        title: intl.get('sslm.supplyAbility.model.supplyAbility.countryIdMeaning').d('服务国家'),
        width: 100,
        dataIndex: 'countryIdMeaning',
      },
      {
        title: intl.get('sslm.supplyAbility.model.supplyAbility.regionIdMeaning').d('服务地区'),
        width: 100,
        dataIndex: 'regionIdMeaning',
      },
      {
        title: intl.get('sslm.supplyAbility.model.supplyAbility.cityIdMeaning').d('服务城市'),
        width: 100,
        dataIndex: 'cityIdMeaning',
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.dateFrom`).d('有效期从'),
        dataIndex: 'dateFrom',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.dateTo`).d('有效期至'),
        dataIndex: 'dateTo',
        width: 120,
        render: dateRender,
      },
      {
        title: intl
          .get(`sslm.supplyAbility.model.supplyAbility.purchasingOrganization`)
          .d('采购组织'),
        dataIndex: 'purchaseOrganizationName',
        width: 150,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.manufacturer`).d('生产厂家'),
        dataIndex: 'manufacturer',
        width: 150,
      },
      {
        title: (
          <Tooltip title={supplyStatusTip}>
            {intl.get(`sslm.supplyAbility.model.supAbility.supplyStatus`).d('可供状态')}
            <Icon style={{ fontSize: 14 }} type="exclamation" />
          </Tooltip>
        ),
        width: 100,
        dataIndex: 'supplyStatus',
        onCell: record => {
          if (record.supplyStatus === 'G') {
            return { className: styles['table-column-g'] };
          } else if (record.supplyStatus === 'Y') {
            return { className: styles['table-column-y'] };
          } else if (record.supplyStatus === 'R') {
            return { className: styles['table-column-r'] };
          } else {
            return {};
          }
        },
        render: (val, record) => record.supplyStatusMeaning || record.supplyStatus,
      },
      {
        title: (
          <Tooltip title={psaTip}>
            {intl.get(`sslm.supplyAbility.model.supplyAbility.psaLevel`).d('PSA评级')}
            <Icon style={{ fontSize: 14 }} type="exclamation" />
          </Tooltip>
        ),
        width: 100,
        dataIndex: 'psaEvaluationLevel',
      },
      {
        title: (
          <Tooltip title={psaScoreTip}>
            {intl.get(`sslm.supplyAbility.model.supplyAbility.psaScore`).d('PSA评分')}
            <Icon style={{ fontSize: 14 }} type="exclamation" />
          </Tooltip>
        ),
        width: 100,
        dataIndex: 'psaEvaluationScore',
      },
      {
        title: (
          <Tooltip title={psaFinishDate}>
            {intl.get(`sslm.supplyAbility.model.supplyAbility.psaFinishDate`).d('PSA完成时间')}
            <Icon style={{ fontSize: 14 }} type="exclamation" />
          </Tooltip>
        ),
        width: 120,
        dataIndex: 'psaFinishDate',
        render: dateRender,
      },
      {
        title: (
          <Tooltip title={spaTip}>
            {intl.get(`sslm.supplyAbility.model.supplyAbility.spaLevel`).d('SPA评级')}
            <Icon style={{ fontSize: 14 }} type="exclamation" />
          </Tooltip>
        ),
        width: 100,
        dataIndex: 'spaEvaluationLevel',
      },
      {
        title: (
          <Tooltip title={spaScore}>
            {intl.get(`sslm.supplyAbility.model.supplyAbility.spaScore`).d('SPA评分')}
            <Icon style={{ fontSize: 14 }} type="exclamation" />
          </Tooltip>
        ),
        width: 100,
        dataIndex: 'spaEvaluationScore',
      },
      {
        title: (
          <Tooltip title={spaFinishDate}>
            {intl.get(`sslm.supplyAbility.model.supplyAbility.spaFinishDate`).d('SPA完成时间')}
            <Icon style={{ fontSize: 14 }} type="exclamation" />
          </Tooltip>
        ),
        width: 120,
        dataIndex: 'spaFinishDate',
        render: dateRender,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.evaluateRemark`).d('评价信息'),
        width: 200,
        dataIndex: 'evaluateRemark',
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.quotaRatio`).d('配额'),
        width: 120,
        dataIndex: 'quotaRatio',
      },
      {
        title: intl
          .get(`sslm.supplyAbility.model.supplyAbility.inventoryOrganization`)
          .d('库存组织'),
        dataIndex: 'inventoryOrganizationId',
        width: 100,
        render: value => {
          return <LovMulti code="SSLM.INV_ORGANIZATION" value={value} viewOnly />;
        },
      },
      {
        title: intl
          .get(`sslm.supplyAbility.model.supplyAbility.lastUpdateUserName`)
          .d('最后更新人'),
        dataIndex: 'lastUpdateUserName',
        width: 150,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.lastUpdateDate`).d('最后更新日期'),
        dataIndex: 'lastUpdateDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get('sslm.supplyAbility.model.supplyAbility.documentType').d('寻源单据类型'),
        dataIndex: 'dataSource',
      },
      {
        title: intl
          .get('sslm.supplyAbility.model.supplyAbility.docNumAndLineNum')
          .d('寻源单据编号'),
        dataIndex: 'docNumAndLineNum',
      },
      {
        title: intl.get('hzero.common.upload.modal.title').d('附件'),
        width: 120,
        fixed: 'right',
        dataIndex: 'attachmentUuid',
        render: (_, record) => {
          const uploadEdit = isReview
            ? viewOnly && !isPub && record.supplyReviewStatus !== 'REVIEWING'
            : viewOnly && !isPub;
          return (
            <a onClick={() => this.handleAttamentModal(record, uploadEdit)}>
              {renderAttachmentText({
                editable: uploadEdit,
                fileCount: record.fileCount,
                linkColor,
              })}
            </a>
          );
        },
      },
    ];
    if (isEdit && !isPub) {
      columns.push({
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        fixed: 'right',
        dataIndex: 'option',
        render: (_, record) => {
          return (
            <a
              disabled={record.supplyReviewStatus === 'REVIEWING'}
              onClick={() => {
                this.onOpen(record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      });
    }
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));
    const rowSelection = {
      selectedRowKeys: selectedRows.map(n => n.abilityLineId),
      selectedRows,
      onChange: this.handleSelectChange,
      // getCheckboxProps: record => ({
      //   disabled:
      //     record &&
      //     (record.supplyReviewStatus === 'REVIEWING' || record.supplyReviewStatus === 'REVIEWED'),
      // }),
    };

    return (
      <Fragment>
        <div style={{ marginBottom: 20 }}>
          <FilterForm
            customizeFilterForm={customizeFilterForm}
            code={filterCode}
            onSearch={queryCategoryMaterialData}
            onRef={ref => {
              this.categoryFilterForm = ref.props.form;
            }}
          />
        </div>
        {customizeTable(
          {
            code: customizeCode,
          },
          <Table
            rowKey="abilityLineId"
            bordered
            columns={columns}
            dataSource={dataSource.content}
            pagination={createPagination(dataSource)}
            onChange={pagination => this.handleTableChange(pagination)}
            scroll={{ x: scrollX }}
            rowSelection={isReview && !isPub ? rowSelection : null}
          />
        )}
        <Drawer
          title={intl.get(`sslm.supplyAbility.view.message.categoryedit`).d('编辑自主品类物料')}
          placement="right"
          width={800}
          destroyOnClose
          onClose={this.onClose}
          visible={drawerVisible}
        >
          <div style={{ marginBottom: 40 }}>{this.renderForm()}</div>
          <div className={styles['modal-button']}>
            <Button
              style={{
                marginRight: 8,
              }}
              onClick={this.onClose}
            >
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
            <Button onClick={this.saveFormData} type="primary">
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
          </div>
        </Drawer>
        {/* 上传附件模态框 */}
        {modalVisible && <AttachmentModal {...attachmentModalProps} />}
      </Fragment>
    );
  }
}
