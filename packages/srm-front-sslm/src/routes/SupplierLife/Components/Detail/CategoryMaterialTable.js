/**
 * Recommend - 供应商生命周期配置 - 推荐物料品类
 * @date: 2018-9-6
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import moment from 'moment';
import React, { PureComponent, Fragment } from 'react';
import { Table, Button, Drawer, Form, Badge, Input, DatePicker, Row, Col } from 'hzero-ui';
import uuid from 'uuid/v4';
import querystring from 'querystring';
import { isEmpty, isNumber, sum, isArray } from 'lodash';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import Switch from 'components/Switch';
import ValueList from 'components/ValueList';
import CommonImport from 'components/Import';
import { SRM_SSLM } from '_utils/config';
import { dateRender } from 'utils/renderer';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import LovMultiple from '@/routes/components/LovMultiple';
import LovMulti from 'srm-front-cuz/lib/custH0X/LovMulti';
import { Button as PerButton } from 'components/Permission';
import intl from 'utils/intl';
import { getDateFormat, filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

// import NewLov from '@/routes/components/Lov'; // lov父级品类不可选
import C7nLovMultiple from '@/routes/components/C7nLovMultiple';
import { renderAttachmentText } from '@/routes/components/utils';
import styles from './index.less';
import AttachmentModal from './AttachmentModal';

const FormItem = Form.Item;

const dateFormat = getDateFormat();
const businessObjectCode = 'SRM_C_SRM_SSLM_LIFE_CYCLE'; // 业务规则定义-品类code

const rowKey = 'itemLineId';

/**
 * 申请单供应商能力表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form 表单
 * @return React.element
 */
@formatterCollections({ code: ['sslm.commonApplication', 'sslm.supplyAbility'] })
@Form.create({ fieldNameProp: null })
export default class CategoryMaterialTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      drawerVisible: false, // 模态框状态
      recordSource: {},
      selectedRows: [],
      itemLineIdList: [],
      isCategory: false, // 判断是否必输
      isItem: false, // 判断是否必输
      itemSelectRows: [],
      itemCategorySelectRows: [],
      attachmentModalVisible: false,
      currentRows: {}, // 推荐物料/品类当前行
      attachmentTotal: {}, // 附件弹框的总total
    };
  }

  componentDidMount() {
    const {
      tableProps: { onClearRows },
    } = this.props;
    if (onClearRows) onClearRows(this.handleClearSelectedRows);
  }

  /**
   * 将selectedRows置空
   */
  @Bind()
  handleClearSelectedRows() {
    this.setState({ selectedRows: [] });
  }

  /**
   * 保存选择行的数据
   * @param {Array} selectedRowKeys - 选中行主键
   * @param {Array} selectedRows - 选中行信息
   */
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    const itemLineIdList = [];
    selectedRows.forEach(item => {
      if (!item.isLocal) {
        itemLineIdList.push(item.itemLineId);
      }
    });
    this.setState({ selectedRows, itemLineIdList });
  }

  /**
   * 删除选中行
   */
  @Bind()
  handleDelete() {
    const {
      tableProps: { dataSource, onDeleteRows },
    } = this.props;
    const { selectedRows, itemLineIdList } = this.state;

    // const newSelectedRows = selectedRows.map(item => {
    //   return item.itemLineId;
    // });
    // const newDataSource = dataSource.filter(item => {
    //   return newSelectedRows.indexOf(item.itemLineId) > -1 === false;
    // });
    const newDataSource = selectedRows.map(item => ({ ...item, enabledFlag: 0 }));
    // const localRows = unionBy(newDataSource, dataSource, 'itemLineId');
    const newLocalRows = newDataSource.map(n => n.itemLineId);
    const localRows = dataSource.filter(n => {
      return newLocalRows.indexOf(n.itemLineId) > -1 === false;
    });

    this.setState({ selectedRows: [] });
    onDeleteRows(localRows, itemLineIdList);
  }

  /**
   * 打开侧边模态框
   * @param {Object} recordSource - 编辑带入的行数据
   */
  @Bind()
  onOpen(recordSource = {}) {
    if (recordSource) {
      this.setState({ drawerVisible: true, recordSource });
    } else {
      this.setState({ drawerVisible: true, recordSource: {} });
    }
    if (recordSource.itemId) {
      this.setState({ isItem: true });
    }
    if (recordSource.itemCategoryId) {
      this.setState({ isCategory: true });
    }
  }

  /**
   * 关闭上传或者编辑modal
   */
  @Bind()
  onClose() {
    this.props.form.resetFields();
    this.setState({
      drawerVisible: false,
      isCategory: false,
      isItem: false,
      recordSource: {},
      itemSelectRows: [],
      itemCategorySelectRows: [],
    });
    this.props.form.setFieldsValue({ itemCategoryIds: null, itemIds: null });
  }

  /**
   *  批量导入
   */
  @Bind()
  handleImport() {
    const {
      tableProps: { requisitionId, history, location },
    } = this.props;
    const queryParams = querystring.parse(location.search.substr(1));

    history.push({
      pathname: `/sslm/supplier-life-manage/comment-import/SSLM_LFCYCLE_ITEM_CATE`,
      search: querystring.stringify({
        action: intl.get('hzero.common.title.batchImport').d('批量导入'),
        args: JSON.stringify({ requisitionId }),
        backPath: `/sslm/supplier-life-manage/recommend?${querystring.stringify(queryParams)}`,
      }),
    });
  }

  /**
   * 保存新增或者编辑的数据
   */
  @Bind()
  saveFormData() {
    const {
      form,
      tableProps: { dataSource = [], onAdd, organizationId },
    } = this.props;
    const { recordSource = {}, itemSelectRows, itemCategorySelectRows } = this.state;
    form.validateFields((err, fieldsValues) => {
      if (!err) {
        // 判断 新增/编辑
        const isEditing = recordSource.itemLineId;
        const { dateFrom, dateTo, itemIds, itemCategoryIds } = fieldsValues;
        const isBatchAdd =
          (itemIds && itemIds.split(',').length > 1) ||
          (itemCategoryIds && itemCategoryIds.split(',').length > 1);
        let flag = true;
        const newDateFrom = dateFrom && moment(dateFrom).format(DEFAULT_DATE_FORMAT);
        const newDateTo = dateTo && moment(dateTo).format(DEFAULT_DATE_FORMAT);
        const fieldsValuesObj = {
          ...fieldsValues,
          dateFrom: newDateFrom,
          dateTo: newDateTo,
        };
        if (isEditing) {
          for (const key in fieldsValuesObj) {
            if (Object.prototype.hasOwnProperty.call(fieldsValuesObj, key)) {
              if (recordSource[key] !== fieldsValuesObj[key]) {
                flag = false;
              }
            }
          }
        }
        const newFieldsValues = isEditing
          ? {
              ...recordSource,
              ...fieldsValuesObj,
              _status: flag ? null : 'update',
            }
          : isBatchAdd
          ? itemIds
            ? itemIds.split(',').map(itemId => {
                return {
                  ...recordSource,
                  ...fieldsValuesObj,
                  itemId,
                  itemCode: itemSelectRows.find(i => i.itemId === itemId)?.itemCode || null,
                  itemName: itemSelectRows.find(i => i.itemId === itemId)?.itemName || null,
                  // itemCategoryId: fieldsValues.itemCategoryIds,
                  itemCategoryId: itemSelectRows.find(i => i.itemId === itemId)?.categoryId || null,
                  itemCategoryCode:
                    itemSelectRows.find(i => i.itemId === itemId)?.categoryCode || null,
                  itemCategoryName:
                    itemSelectRows.find(i => i.itemId === itemId)?.categoryName || null,
                  isCreat: true,
                  isLocal: true,
                  enabledFlag: 1,
                  tenantId: organizationId,
                  itemLineId: uuid(),
                  _status: 'create',
                };
              })
            : itemCategoryIds.split(',').map(itemCategoryId => {
                return {
                  ...recordSource,
                  ...fieldsValuesObj,
                  itemId: fieldsValues.itemIds,
                  itemCode: undefined,
                  itemName: undefined,
                  itemCategoryId,
                  itemCategoryName:
                    itemCategorySelectRows.find(i => i.categoryId === itemCategoryId)
                      ?.categoryName || null,
                  itemCategoryCode:
                    itemCategorySelectRows.find(i => i.categoryId === itemCategoryId)
                      ?.categoryCode || null,
                  isCreat: true,
                  isLocal: true,
                  enabledFlag: 1,
                  tenantId: organizationId,
                  itemLineId: uuid(),
                  _status: 'create',
                };
              })
          : {
              ...fieldsValuesObj,
              itemId: fieldsValues.itemIds,
              itemCategoryId: fieldsValues.itemCategoryIds || fieldsValues.itemCategoryId,
              itemCode:
                itemSelectRows.find(i => i.itemId === fieldsValues.itemIds)?.itemCode || null,
              itemName:
                itemSelectRows.find(i => i.itemId === fieldsValues.itemIds)?.itemName || null,
              itemCategoryName:
                itemCategorySelectRows.find(i => i.categoryId === fieldsValues.itemCategoryIds)
                  ?.categoryName ||
                fieldsValues.itemCategoryName ||
                null,
              itemCategoryCode:
                itemCategorySelectRows.find(i => i.categoryId === fieldsValues.itemCategoryIds)
                  ?.categoryCode ||
                fieldsValues.itemCategoryCode ||
                null,
              isCreat: true,
              isLocal: true,
              enabledFlag: 1,
              tenantId: organizationId,
              itemLineId: uuid(),
              _status: 'create',
            };
        let newDataSource = isEmpty(dataSource) ? [] : [...dataSource];
        if (isArray(newFieldsValues)) {
          newFieldsValues.forEach(itemDataSource => {
            newDataSource.push(itemDataSource);
          });
        } else if (newFieldsValues.isCreat) {
          newDataSource.push(newFieldsValues);
        } else {
          const { itemLineId } = newFieldsValues;
          newDataSource = dataSource.map(item => {
            if (item.itemLineId === itemLineId) {
              return { ...item, ...newFieldsValues };
            } else {
              return item;
            }
          });
        }
        const dataList = newDataSource.map(item => {
          if (item.isCreat) {
            const { isCreat, ...other } = item;
            return other;
          } else {
            return item;
          }
        });
        onAdd(dataList);
        this.onClose();
      }
    });
  }

  /**
   * lovChange时执行
   * @param {Object} formValue 需要设置的表单对象
   * @param {String} text lov返回值
   * @param {String} otherText form取的值
   * @param {String} stateFalse 修改的state
   * @param {String} stateTrue 修改的state
   */
  @Bind()
  handleLovChange(formValue, text, otherText, stateFalse, stateTrue) {
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue(formValue);
    if (!text) {
      if (text || otherText) {
        this.setState({ [stateFalse]: false, [stateTrue]: true });
      } else {
        this.setState({ [stateFalse]: false, [stateTrue]: false });
      }
    } else {
      this.setState({ [stateFalse]: true, [stateTrue]: false });
      if (!otherText) {
        // eslint-disable-next-line no-unused-expressions
        stateFalse === 'isCategory'
          ? setFieldsValue({ itemId: undefined })
          : setFieldsValue({ itemCategoryId: undefined });
      }
    }
  }

  // 附件弹框
  @Bind()
  handleAttamentModal(record = {}, recordAttachmentTotal = {}) {
    const { attachmentModalVisible, attachmentTotal } = this.state;
    this.setState({
      currentRows: record,
      attachmentModalVisible: !attachmentModalVisible,
      attachmentTotal: { ...attachmentTotal, ...recordAttachmentTotal },
    });
  }

  renderForm() {
    const {
      form,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      tableProps: { customizeForm = () => {} },
    } = this.props;
    const {
      recordSource = {},
      isCategory,
      isItem,
      itemSelectRows,
      itemCategorySelectRows,
    } = this.state;
    const formLayOut = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };

    const isEditing = recordSource.itemLineId;

    getFieldDecorator(`itemCode`, { initialValue: recordSource.itemCode });
    getFieldDecorator(`itemName`, { initialValue: recordSource.itemName });

    getFieldDecorator(`itemCategoryName`, { initialValue: recordSource.itemCategoryName });
    getFieldDecorator(`itemCategoryCode`, { initialValue: recordSource.itemCategoryCode });

    getFieldDecorator(`marketCompetitionMeaning`, {
      initialValue: recordSource.marketCompetitionMeaning,
    });
    getFieldDecorator(`priceLevelMeaning`, { initialValue: recordSource.priceLevelMeaning });

    getFieldDecorator('countryIdMeaning', { initialValue: recordSource.countryIdMeaning });
    getFieldDecorator('regionIdMeaning', { initialValue: recordSource.regionIdMeaning });
    getFieldDecorator('cityIdMeaning', { initialValue: recordSource.cityIdMeaning });
    getFieldDecorator('purchaseOrganizationCode', {
      initialValue: recordSource.purchaseOrganizationCode,
    });
    getFieldDecorator('purchaseOrganizationName', {
      initialValue: recordSource.purchaseOrganizationName,
    });

    return customizeForm(
      {
        code: 'SSLM.SUPPLIER_LIFE_MANAGE.RECOMMEND_ITEM_FORM',
        form,
        dataSource: recordSource,
      },
      <Form layout="horizontal" className={styles['drawer-from']}>
        <Row>
          <Col span={24}>
            <FormItem
              label={intl.get('sslm.commonApplication.model.coApp.itemName').d('物料')}
              {...formLayOut}
            >
              {isEditing
                ? getFieldDecorator('itemId', {
                    rules: [
                      {
                        required: !isCategory,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('sslm.commonApplication.model.coApp.itemName').d('物料'),
                        }),
                      },
                    ],
                    initialValue: recordSource.itemId,
                  })(
                    <Lov
                      code="SSLM.RELATED_CATEGORY_ITEM"
                      textField="itemName"
                      queryParams={filterNullValueObject({
                        categoryId: getFieldValue('itemCategoryId'),
                      })}
                      onChange={(text, record) => {
                        const formValue = {
                          itemName: record.itemName,
                          itemCode: record.itemCode,
                        };
                        setFieldsValue({
                          itemCategoryId: record.categoryId,
                          itemCategoryCode: record.categoryCode,
                          itemCategoryName: record.categoryName,
                          categoryName: record.categoryName,
                        });
                        this.handleLovChange(
                          formValue,
                          text,
                          getFieldValue('itemCategoryId'),
                          'isItem',
                          'isCategory'
                        );
                      }}
                    />
                  )
                : getFieldDecorator('itemIds', {
                    rules: [
                      {
                        required: !getFieldValue('itemCategoryIds'),
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('sslm.commonApplication.model.coApp.itemName').d('物料'),
                        }),
                      },
                    ],
                  })(
                    <LovMultiple
                      code="SSLM.RELATED_CATEGORY_ITEM"
                      queryParams={{
                        ...(getFieldValue('itemCategoryIds') &&
                        getFieldValue('itemCategoryIds').split(',').length < 2
                          ? { categoryId: getFieldValue('itemCategoryIds') }
                          : {}),
                      }}
                      lovOptions={{ displayField: 'itemName' }}
                      textField="itemName"
                      selectedRows={itemSelectRows}
                      changeSelectRows={newSelectedRows =>
                        this.setState({ itemSelectRows: newSelectedRows })
                      }
                      disabled={
                        getFieldValue('itemCategoryIds') &&
                        getFieldValue('itemCategoryIds').split(',').length >= 2
                      }
                      onChange={(text, lovRecords) => {
                        if (text && text.split(',').length > 1) {
                          setFieldsValue({ itemCategoryIds: undefined });
                        } else {
                          setFieldsValue({
                            itemCategoryIds: lovRecords[0]?.categoryId?.toString() || null,
                            itemCategoryId: lovRecords[0]?.categoryId || null,
                            itemCategoryCode: lovRecords[0]?.categoryCode || null,
                            categoryName: lovRecords[0]?.categoryName || null,
                            itemCategoryName: lovRecords[0]?.categoryName || null,
                          });
                        }
                      }}
                    />
                  )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              label={intl.get('sslm.commonApplication.model.coApp.itemCategoryName').d('品类')}
              {...formLayOut}
            >
              {isEditing
                ? getFieldDecorator('itemCategoryId', {
                    rules: [
                      {
                        required: !isItem,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.commonApplication.model.coApp.itemCategoryName')
                            .d('品类'),
                        }),
                      },
                    ],
                    initialValue: recordSource.itemCategoryId,
                  })(
                    <Lov
                      code="SMDM.CATEGORY.LEVEL_CONTROL_TREE"
                      textValue={recordSource.itemCategoryName}
                      textField="categoryName"
                      queryParams={{
                        enabledFlag: 1,
                        itemId: getFieldValue('itemId'),
                        hzeroUIFlag: 1,
                        businessObjectCode,
                      }}
                      onChange={(text, record) => {
                        const formValue = {
                          itemCategoryName: record.categoryName,
                          itemCategoryCode: record.categoryCode,
                        };
                        this.handleLovChange(
                          formValue,
                          text,
                          getFieldValue('itemId'),
                          'isCategory',
                          'isItem'
                        );
                      }}
                      tableDsProps={{
                        record: {
                          dynamicProps: {
                            selectable: record => record.get('isCheck') !== false,
                          },
                        },
                      }}
                      tableProps={{
                        treeAsync: true,
                        alwaysShowRowBox: true,
                        virtual: true,
                        virtualCell: true,
                        onRow: ({ record }) => {
                          const nodeProps = {};
                          if (record.get('hasChild') === '0') {
                            nodeProps.isLeaf = true;
                          }
                          return nodeProps;
                        },
                      }}
                      onBeforeSelect={record => {
                        const { selectable } = record || {};
                        return selectable;
                      }}
                    />
                  )
                : getFieldDecorator('itemCategoryIds', {
                    rules: [
                      {
                        required: !getFieldValue('itemIds'),
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.commonApplication.model.coApp.itemCategoryName')
                            .d('品类'),
                        }),
                      },
                    ],
                  })(
                    <C7nLovMultiple
                      code="SMDM.CATEGORY.LEVEL_CONTROL_TREE"
                      queryParams={{
                        enabledFlag: 1,
                        hzeroUIFlag: 1,
                        businessObjectCode,
                        ...(getFieldValue('itemIds') &&
                        getFieldValue('itemIds').split(',').length < 2
                          ? { itemId: getFieldValue('itemIds') }
                          : {}),
                      }}
                      textField="categoryName"
                      selectedRows={itemCategorySelectRows}
                      changeSelectRows={newSelectedRows =>
                        this.setState({ itemCategorySelectRows: newSelectedRows })
                      }
                      disabled={
                        getFieldValue('itemIds') && getFieldValue('itemIds').split(',').length >= 2
                      }
                      onChange={text => {
                        if (text && text.split(',').length > 1) {
                          setFieldsValue({ itemIds: undefined });
                        }
                      }}
                      tableDsProps={{
                        selection: 'multiple',
                        record: {
                          dynamicProps: {
                            selectable: record => record.get('isCheck') !== false,
                          },
                        },
                      }}
                      tableProps={{
                        treeAsync: true,
                        alwaysShowRowBox: true,
                        virtual: true,
                        virtualCell: true,
                        onRow: ({ record }) => {
                          const nodeProps = {};
                          if (record.get('hasChild') === '0') {
                            nodeProps.isLeaf = true;
                          }
                          return nodeProps;
                        },
                      }}
                      onBeforeSelect={record => {
                        const { selectable } = record || {};
                        return selectable;
                      }}
                    />
                  )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              label={intl.get('sslm.commonApplication.model.coApp.supplyFlag').d('是否可供')}
              {...formLayOut}
            >
              {getFieldDecorator('supplyFlag', {
                // rules: [{ required: true }],
                initialValue: isNumber(recordSource.supplyFlag) ? recordSource.supplyFlag : 1,
              })(<Switch />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              label={intl.get('sslm.commonApplication.model.coApp.adapterProducts').d('适配产品')}
              {...formLayOut}
            >
              {getFieldDecorator('adapterProducts', {
                initialValue: recordSource.adapterProducts,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              label={intl.get('sslm.commonApplication.model.coApp.countryName').d('服务国家')}
              {...formLayOut}
            >
              {getFieldDecorator('countryId', {
                initialValue: recordSource.countryId,
              })(
                <Lov
                  code="HPFM.COUNTRY"
                  lovOptions={{ displayField: 'countryName', valueField: 'countryId' }}
                  textValue={recordSource.countryIdMeaning}
                  onChange={(_, lovRecord) => {
                    setFieldsValue({
                      countryIdMeaning: lovRecord.countryName,
                      regionId: undefined,
                      cityId: undefined,
                      regionIdMeaning: undefined,
                      cityIdMeaning: undefined,
                    });
                  }}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item
              {...formLayOut}
              label={intl.get('sslm.commonApplication.model.coApp.regionName').d('服务地区')}
            >
              {getFieldDecorator('regionId', {
                initialValue: recordSource.regionId,
              })(
                <Lov
                  code="HPFM.REGION"
                  disabled={!getFieldValue('countryId')}
                  lovOptions={{
                    displayField: 'regionName',
                    valueField: 'regionId',
                  }}
                  queryParams={{
                    countryId: getFieldValue('countryId'),
                  }}
                  textValue={recordSource.regionIdMeaning}
                  onChange={(value, lovRecord) => {
                    setFieldsValue({
                      regionIdMeaning: lovRecord.regionName,
                      cityId: undefined,
                      cityIdMeaning: undefined,
                    });
                  }}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item
              {...formLayOut}
              label={intl.get('sslm.commonApplication.model.coApp.cityName').d('服务城市')}
            >
              {getFieldDecorator('cityId', {
                initialValue: recordSource.cityId,
              })(
                <Lov
                  code="HPFM.REGION"
                  textValue={recordSource.cityIdMeaning}
                  disabled={!getFieldValue('regionId')}
                  queryParams={{
                    parentRegionId: getFieldValue('regionId'),
                  }}
                  onChange={(value, lovRecord) => {
                    setFieldsValue({
                      cityIdMeaning: lovRecord.regionName,
                    });
                  }}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`sslm.commonApplication.model.coApp.dateFrom`).d('有效期从')}
            >
              {getFieldDecorator('dateFrom', {
                initialValue:
                  recordSource.dateFrom && moment(recordSource.dateFrom, DEFAULT_DATE_FORMAT),
                rules: [
                  {
                    required: getFieldValue('dateTo'),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sslm.commonApplication.model.coApp.dateFrom`).d('有效期从'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  placeholder=""
                  style={{ width: '100%' }}
                  format={dateFormat}
                  disabledDate={currentDate =>
                    getFieldValue('dateTo') &&
                    moment(getFieldValue('dateTo')).isBefore(currentDate, 'day')
                  }
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`sslm.commonApplication.model.coApp.dateTo`).d('有效期至')}
            >
              {getFieldDecorator('dateTo', {
                initialValue:
                  recordSource.dateTo && moment(recordSource.dateTo, DEFAULT_DATE_FORMAT),
                rules: [
                  {
                    required: getFieldValue('dateFrom'),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sslm.commonApplication.model.coApp.dateTo`).d('有效期至'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  placeholder=""
                  style={{ width: '100%' }}
                  format={dateFormat}
                  disabledDate={currentDate =>
                    getFieldValue('dateFrom') &&
                    moment(getFieldValue('dateFrom')).isAfter(currentDate, 'day')
                  }
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              label={intl
                .get('sslm.commonApplication.model.coApp.marketCompetitionCode')
                .d('市场竞争力')}
              {...formLayOut}
            >
              {getFieldDecorator('marketCompetitionCode', {
                initialValue: recordSource.marketCompetitionCode,
              })(
                <ValueList
                  lovCode="SSLM.MARKET_COMPETITION"
                  textValue={recordSource.marketCompetitionMeaning}
                  onChange={(_, record) => {
                    setFieldsValue({ marketCompetitionMeaning: record.props.children });
                  }}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              label={intl.get('sslm.commonApplication.model.coApp.priceLevel').d('价格水平')}
              {...formLayOut}
            >
              {getFieldDecorator('priceLevel', {
                initialValue: recordSource.priceLevel,
              })(
                <ValueList
                  lovCode="SSLM.PRICE_LEVEL"
                  textValue={recordSource.priceLevelMeaning}
                  onChange={(_, record) => {
                    setFieldsValue({ priceLevelMeaning: record.props.children });
                  }}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              label={intl.get('sslm.commonApplication.model.coApp.mainCustomers').d('主要客户')}
              {...formLayOut}
            >
              {getFieldDecorator('mainCustomers', {
                initialValue: recordSource.mainCustomers,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              label={intl.get('sslm.commonApplication.model.coApp.mainProducts').d('主要项目')}
              {...formLayOut}
            >
              {getFieldDecorator('mainProducts', {
                initialValue: recordSource.mainProducts,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem label={intl.get('hzero.common.remark').d('备注')} {...formLayOut}>
              {getFieldDecorator('remark', {
                initialValue: recordSource.remark,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
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
        <Row>
          <Col span={24}>
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
                  onChange={(_val, lovRecord) => {
                    setFieldsValue({
                      purchaseOrganizationCode: lovRecord.organizationCode,
                      purchaseOrganizationName: lovRecord.organizationName,
                      purchaseOrganizationId: lovRecord.purchaseOrgId,
                    });
                  }}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`sslm.supplyAbility.model.supplyAbility.manufacturer`).d('生产厂家')}
            >
              {getFieldDecorator('manufacturer', {
                initialValue: recordSource.manufacturer,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      isEdit,
      isImport,
      tableProps: {
        dataSource = [],
        customizeTable = () => {},
        customizeBtnGroup,
        requisitionId,
        linkColor = '',
        onAdd = () => {},
      },
      customizeBtnGroupCode,
    } = this.props;
    const {
      drawerVisible,
      recordSource,
      selectedRows,
      currentRows,
      attachmentTotal,
      attachmentModalVisible,
    } = this.state;
    const displayDataSource = dataSource.filter(item => item.enabledFlag === 1);
    const columns = [
      {
        title: intl.get('sslm.commonApplication.model.coApp.itemCode').d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.itemName').d('物料'),
        dataIndex: 'itemName',
        width: 150,
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.itemCategoryCode').d('品类代码'),
        dataIndex: 'itemCategoryCode',
        width: 150,
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.itemCategoryName').d('品类'),
        dataIndex: 'itemCategoryName',
        width: 150,
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.supplyFlag').d('是否可供'),
        width: 100,
        dataIndex: 'supplyFlag',
        render: text => {
          if (text === 1) {
            return <Badge status="success" text={intl.get('hzero.common.status.yes').d('是')} />;
          } else {
            return <Badge status="error" text={intl.get('hzero.common.status.no').d('否')} />;
          }
        },
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.adapterProducts').d('适配产品'),
        dataIndex: 'adapterProducts',
        width: 100,
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.countryName').d('服务国家'),
        width: 100,
        dataIndex: 'countryIdMeaning',
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.regionName').d('服务地区'),
        width: 100,
        dataIndex: 'regionIdMeaning',
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.cityName').d('服务城市'),
        width: 100,
        dataIndex: 'cityIdMeaning',
      },
      {
        title: intl.get(`sslm.commonApplication.model.coApp.dateFrom`).d('有效期从'),
        dataIndex: 'dateFrom',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`sslm.commonApplication.model.coApp.dateTo`).d('有效期至'),
        dataIndex: 'dateTo',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.marketCompetitionCode').d('市场竞争力'),
        width: 100,
        dataIndex: 'marketCompetitionCode',
        render: (_, record) => record.marketCompetitionMeaning,
        // render: text => {
        //   switch (text) {
        //     case 'STRONG':
        //       return '强';
        //     case 'MEDIUM':
        //       return '中等';
        //     case 'NORMAL':
        //       return '一般';
        //     default:
        //       return null;
        //   }
        // },
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.priceLevel').d('价格水平'),
        width: 100,
        dataIndex: 'priceLevel',
        render: (_, record) => record.priceLevelMeaning,
        // render: text => {
        //   switch (text) {
        //     case 'VERY_HIGN':
        //       return '极高';
        //     case 'HIGH':
        //       return '高';
        //     case 'LOW':
        //       return '低';
        //     case 'VERY_LOW':
        //       return '极低';
        //     default:
        //       return null;
        //   }
        // },
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.mainCustomers').d('主要客户'),
        dataIndex: 'mainCustomers',
        width: 100,
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.mainProducts').d('主要项目'),
        dataIndex: 'mainProducts',
        width: 100,
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 100,
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
        title: intl.get('hzero.common.upload.modal.title').d('附件'),
        width: 130,
        fixed: 'right',
        dataIndex: 'attachment',
        render: (text, record) => (
          <a
            onClick={() => this.handleAttamentModal(record)}
            disabled={!(requisitionId || requisitionId === 0) || record.isLocal}
          >
            {renderAttachmentText({
              editable: isEdit,
              fileCount:
                attachmentTotal[record[rowKey]] || attachmentTotal[record[rowKey]] === 0
                  ? attachmentTotal[record[rowKey]]
                  : record.fileCount,
              linkColor,
            })}
          </a>
        ),
      },
    ].filter(Boolean);
    if (isEdit === true) {
      columns.push({
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 75,
        fixed: 'right',
        dataIndex: 'option',
        render: (_, record) => {
          return (
            <a
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
    const rowSelection = { onChange: this.onSelectChange };
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));
    const attachmentModalProps = {
      onAdd,
      requisitionId,
      viewOnly: isEdit,
      abilityRowKey: rowKey,
      curAbilityLine: currentRows,
      isVisible: attachmentModalVisible,
      itemLineId: currentRows.itemLineId,
      lineDataSource: displayDataSource,
      abilityLineId: currentRows.abilityLineId,
      onCancel: this.handleAttamentModal,
    };
    return (
      <Fragment>
        {isEdit && (
          <div className="table-list-search" style={{ textAlign: 'right' }}>
            {customizeBtnGroup ? (
              customizeBtnGroup(
                {
                  code: customizeBtnGroupCode,
                },
                [
                  <PerButton
                    icon=""
                    onClick={this.handleImport}
                    style={{ marginRight: 8 }}
                    disabled={!isImport}
                    data-name="importCategory"
                    permissionList={[
                      {
                        code: `srm.partner.suplier-lifecycle.management.ps.recommend.item.import.old`,
                        type: 'button',
                        meaning: '推荐物料/品类-批量导入',
                      },
                    ]}
                  >
                    {intl.get('hzero.common.title.batchImport').d('批量导入')}
                  </PerButton>,
                  <CommonImport
                    data-name="commonImport"
                    businessObjectTemplateCode="SSLM_LFCYCLE_ITEM_CATE"
                    prefixPatch={SRM_SSLM}
                    refreshButton
                    buttonProps={{
                      icon: '',
                      style: { marginRight: 8 },
                      type: 'h0',
                      disabled: !isImport,
                      permissionList: [
                        {
                          code:
                            'srm.partner.suplier-lifecycle.management.ps.recommend.item.import.model',
                          type: 'button',
                          meaning: '推荐物料/品类-批量导入',
                        },
                      ],
                    }}
                    buttonText={intl.get('hzero.common.button.newBatchImport').d('(新)批量导入')}
                    args={{ requisitionId }}
                  />,
                  <Button
                    disabled={isEmpty(selectedRows)}
                    onClick={this.handleDelete}
                    style={{ marginRight: 8 }}
                    data-name="deleteCategory"
                  >
                    {intl
                      .get('sslm.commonApplication.view.categoryMaterial.delete')
                      .d('删除物料/品类')}
                  </Button>,
                  <Button
                    type="primary"
                    onClick={() => {
                      this.onOpen();
                    }}
                    data-name="createCategory"
                  >
                    {intl
                      .get('sslm.commonApplication.view.button.addCategoryMaterial')
                      .d('新建物料/品类')}
                  </Button>,
                ]
              )
            ) : (
              <Fragment>
                <PerButton
                  icon=""
                  onClick={this.handleImport}
                  style={{ marginRight: 8 }}
                  disabled={!isImport}
                  permissionList={[
                    {
                      code: `srm.partner.suplier-lifecycle.management.ps.recommend.item.import.old`,
                      type: 'button',
                      meaning: '推荐物料/品类-批量导入',
                    },
                  ]}
                >
                  {intl.get('hzero.common.title.batchImport').d('批量导入')}
                </PerButton>
                <CommonImport
                  businessObjectTemplateCode="SSLM_LFCYCLE_ITEM_CATE"
                  prefixPatch={SRM_SSLM}
                  refreshButton
                  buttonProps={{
                    icon: '',
                    style: { marginRight: 8 },
                    type: 'h0',
                    disabled: !isImport,
                    permissionList: [
                      {
                        code:
                          'srm.partner.suplier-lifecycle.management.ps.recommend.item.import.model',
                        type: 'button',
                        meaning: '推荐物料/品类-批量导入',
                      },
                    ],
                  }}
                  buttonText={intl.get('hzero.common.button.newBatchImport').d('(新)批量导入')}
                  args={{ requisitionId }}
                />
                <Button
                  disabled={isEmpty(selectedRows)}
                  onClick={this.handleDelete}
                  style={{ marginRight: 8 }}
                >
                  {intl
                    .get('sslm.commonApplication.view.categoryMaterial.delete')
                    .d('删除物料/品类')}
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    this.onOpen();
                  }}
                >
                  {intl
                    .get('sslm.commonApplication.view.button.addCategoryMaterial')
                    .d('新建物料/品类')}
                </Button>
              </Fragment>
            )}
          </div>
        )}
        {customizeTable(
          {
            code: 'SSLM.SUPPLIER_LIFE_MANAGE.RECOMMEND_ITEM_TABLE',
          },
          <Table
            bordered
            rowKey={rowKey}
            columns={columns}
            scroll={{ x: scrollX }}
            dataSource={displayDataSource}
            rowSelection={isEdit ? rowSelection : null}
            pagination={false}
          />
        )}
        {drawerVisible && (
          <Drawer
            title={
              recordSource.itemLineId
                ? intl
                    .get('sslm.commonApplication.view.tittle.editCategoryMaterial')
                    .d('编辑物料/品类')
                : intl
                    .get('sslm.commonApplication.view.tittle.addCategoryMaterial')
                    .d('新建物料/品类')
            }
            placement="right"
            width="520px"
            destroyOnClose
            onClose={this.onClose}
            visible={drawerVisible}
            wrapClassName={styles['ability-drawer']}
          >
            {drawerVisible && this.renderForm()}
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
        )}
        {attachmentModalVisible && <AttachmentModal {...attachmentModalProps} />}
      </Fragment>
    );
  }
}
