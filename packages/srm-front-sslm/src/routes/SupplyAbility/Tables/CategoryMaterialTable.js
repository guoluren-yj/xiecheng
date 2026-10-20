/**
 * CategoryTable - 供货能力清单定义Table
 * @date: 2018-9-25
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Form, Button, Drawer, Input, Badge, DatePicker, Row, Col, Spin } from 'hzero-ui';
import { isEmpty, sum, isNumber, isArray, isFunction, isString } from 'lodash';
import { Bind } from 'lodash-decorators';
import uuidv4 from 'uuid/v4';

import Lov from 'components/Lov';
import Switch from 'components/Switch';
import ValueList from 'components/ValueList';
import LovMulti from 'srm-front-cuz/lib/custH0X/LovMulti';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { filterNullValueObject, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import Table from '_components/EditTable';
import formatterCollections from 'utils/intl/formatterCollections';
import { dateRender } from 'utils/renderer';
import notification from 'utils/notification';

import LovMultiple from '@/routes/components/LovMultiple';
import C7nLovMultiple from '@/routes/components/C7nLovMultiple';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import { renderAttachmentText } from '@/routes/components/utils';
import { queryItemCategory, checkCategory } from '@/services/supplyAbilityService';
import AttachmentModal from './AttachmentModal';
import FilterForm from '../components/FilterForm';
import styles from '../index.less';

const FormItem = Form.Item;
const { TextArea } = Input;

/**
 * 自主品类分配定义
 * @extends {Component} - PureComponent
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */
@formatterCollections({
  code: ['sslm.supplyAbility', 'sslm.common'],
})
@Form.create({ fieldNameProp: null })
@connect(({ user = {} }) => {
  const { currentUser: { themeConfigVO = {} } = {} } = user;
  const {
    enableThemeConfig, // 是否开启了新主题
    colorCode, // 主题色
    fontFileId,
    componentColorList, // 组件主题列表
  } = themeConfigVO;
  if (enableThemeConfig) {
    const componentsColor = getComponentsThemeColor(componentColorList, colorCode);
    return {
      primaryColor: colorCode,
      linkColor: componentsColor['link-color'],
      anchorColor: componentsColor['anchor-primary-color'],
      fontFamily: `font-${fontFileId}`, // 字体
    };
  }
  return {};
})
// @formatterCollections({ code: 'smdm.supplyAbility' })
export default class CategoryTable extends PureComponent {
  state = {
    drawerVisible: false,
    recordSource: {},
    selectedRows: [],
    idList: [],
    isCategory: false, // 判断是否必输
    isItem: false, // 判断是否必输
    itemCategoryId: null, // 品类代码id
    modalVisible: false, // 附件上传模态框
    abilityLineId: null, // 供货能力清单行id
    supplyAbilityId: null, // 供货能力清单id
    categoryLoading: false, // 查询物料下品类的loading
    itemSelectRows: [],
    itemCategorySelectRows: [],
    batchEditFlag: false, // 批量编辑
  };

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) onRef(this);
  }

  /**
   * 更新勾选行
   */
  @Bind()
  handleUpdateSelectedRows(selectedRows) {
    const { changeSelectedRows } = this.props;
    this.setState({ selectedRows });
    changeSelectedRows(selectedRows);
  }

  /**
   * 保存选择行的数据
   * @param {Array} selectedRowKeys - 选中行主键
   * @param {Array} selectedRows - 选中行信息
   */
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    const { dataSource = [], updateState, changeSelectedRows } = this.props;
    const idList = [];
    selectedRows.forEach(item => {
      if (!item.isLocal) {
        idList.push(item.abilityLineId);
      }
    });
    this.setState({ selectedRows, idList });
    changeSelectedRows(selectedRows);
    // 选择行增加selected标识，用于个性化按钮获取勾选行
    const newList = dataSource.map(item => {
      if (selectedRowKeys.includes(item.abilityLineId)) {
        return { ...item, selected: true };
      } else {
        return { ...item, selected: false };
      }
    });
    if (isFunction(updateState)) {
      updateState({ categoryMaterialData: newList });
    }
  }

  /**
   * 打开modal 保存或者编辑
   * @param {Object} recordSource 编辑的数据
   */
  @Bind()
  onOpen(recordSource = {}) {
    if (!isEmpty(recordSource)) {
      this.setState({ drawerVisible: true, recordSource });
    } else {
      this.setState({ drawerVisible: true, recordSource: {} });
    }
    if (recordSource.itemId) {
      this.setState({ isItem: true });
    }
    if (recordSource.itemCategoryId) {
      this.setState({ isCategory: true, itemCategoryId: recordSource.itemCategoryId });
    }
  }

  /**
   * 批量编辑
   */
  @Bind()
  handleBatchEdit() {
    const { queryCategoryMaterialData = () => {} } = this.props;

    const { selectedRows } = this.state;
    // 判断勾选的行是否有评审中状态然后报错
    if (!isEmpty(selectedRows)) {
      const notAllowEditFlag = (selectedRows || []).find(i => i.supplyReviewStatus === 'REVIEWING');
      if (notAllowEditFlag) {
        notification.error({
          message: intl
            .get('sslm.supplyAbility.view.message.notAllowEdit')
            .d('勾选的物料行中存在状态为评审中的行，不允许批量编辑'),
        });
        return;
      }
      this.setState({ drawerVisible: true, recordSource: {}, batchEditFlag: true });
    } else {
      // 全量保存
      // 调接口查询评审中的单据
      const payload = {
        supplyReviewStatus: 'REVIEWING',
      };
      queryCategoryMaterialData(
        {
          bodyData: payload,
        },
        data => {
          if (!isEmpty(data)) {
            // 有评审中状态然后报错
            notification.error({
              message: intl
                .get('sslm.supplyAbility.view.message.existNotAllowEdit')
                .d('物料行中存在状态为评审中的行，不允许批量编辑'),
            });
            return;
          }
          this.setState({ drawerVisible: true, recordSource: {}, batchEditFlag: true });
        }
      );
    }
  }

  /**
   * 批量编辑保存
   */
  @Bind()
  handleFormSave() {
    const { batchEditFlag } = this.state;
    if (!batchEditFlag) {
      this.saveFormData();
    } else {
      this.handleBatchEditSave();
    }
  }

  /**
   * 批量编辑保存
   */
  @Bind()
  handleBatchEditSave() {
    const { form, handleSaveBatchLine = () => {}, dataSource = [] } = this.props;
    const { selectedRows } = this.state;
    // 需判断新建的勾选
    const dateFormat = DEFAULT_DATE_FORMAT;
    form.validateFields({ force: true }, (err, fieldsValues) => {
      if (!err) {
        const fieldsValuesObj = {
          ...fieldsValues,
          dateFrom: fieldsValues.dateFrom && fieldsValues.dateFrom.format(dateFormat),
          dateTo: fieldsValues.dateTo && fieldsValues.dateTo.format(dateFormat),
        };
        const formData = filterNullValueObject(fieldsValuesObj);
        if (isEmpty(formData)) {
          // 只打开没维护数据仅关闭弹窗
          this.onClose();
          return;
        }
        let payload = {};
        if (isEmpty(selectedRows)) {
          // 全量保存
          // 获取新增的行
          const createLines = dataSource
            .filter(item => item.isLocal)
            .map(item => {
              const { abilityLineId, ...other } = item;
              return { ...other };
            });
          // 获取查询参数
          const queryParam = this.getTableFilterFromParam();
          payload = {
            selectAllFlag: 1,
            supplyAbilityLineUpDTO: formData,
            lineQueryParam: queryParam,
            supplyAbilityLines: createLines,
          };
        } else {
          // 勾选保存
          // 这里不能直接把勾选行传给后端，因为勾选的行在进行编辑之后，勾选的行不能更新成新的数据
          // 1.匹配到dataSource的取dataSource
          // 2.匹配不到的取selectedRows（跨页勾选）
          const selectedLine = selectedRows.map(item => {
            const { abilityLineId } = item;
            const selectDataSource = dataSource.find(i => i.abilityLineId === abilityLineId);
            if (!isEmpty(selectDataSource)) {
              return selectDataSource;
            } else {
              return item;
            }
          });
          const saveLineData = selectedLine.map(item => {
            if (item.isLocal) {
              const { abilityLineId, ...otherLineInfo } = item;
              return { ...otherLineInfo, ...formData };
            } else {
              return { ...item, ...formData };
            }
          });
          payload = {
            selectAllFlag: 0,
            supplyAbilityLines: saveLineData,
          };
        }
        handleSaveBatchLine(payload);
        this.onClose();
      }
    });
  }

  /**
   * 关闭modal并清空form
   */
  @Bind()
  onClose() {
    this.props.form.resetFields();
    this.setState({
      drawerVisible: false,
      recordSource: {},
      isCategory: false,
      isItem: false,
      itemSelectRows: [],
      itemCategorySelectRows: [],
      batchEditFlag: false,
    });
    this.props.form.setFieldsValue({ itemCategoryIds: null, itemIds: null });
  }

  /**
   * 保存新增或者编辑的数据
   */
  @Bind()
  saveFormData() {
    const { form, dataSource = [], onAdd, basicForm } = this.props;
    const { recordSource = {}, itemSelectRows, itemCategorySelectRows } = this.state;
    const dateFormat = DEFAULT_DATE_FORMAT;
    form.validateFields({ force: true }, (err, fieldsValues) => {
      if (!err) {
        // 判断 新增/编辑
        const isEditing = recordSource.abilityLineId;
        // 判断是否有数据变更
        let flag = true;

        const { itemIds, itemCategoryIds } = fieldsValues;
        const isBatchAdd =
          (itemIds && itemIds.split(',').length > 1) ||
          (itemCategoryIds && itemCategoryIds.split(',').length > 1);

        const fieldsValuesObj = {
          ...fieldsValues,
          dateFrom: fieldsValues.dateFrom && fieldsValues.dateFrom.format(dateFormat),
          dateTo: fieldsValues.dateTo && fieldsValues.dateTo.format(dateFormat),
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
              isUpdate: !flag,
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
                  abilityLineId: uuidv4(),
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
                  abilityLineId: uuidv4(),
                };
              })
          : {
              ...recordSource,
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
              abilityLineId: uuidv4(),
            };
        let newDataSource = isEmpty(dataSource) ? [] : [...dataSource];
        if (isArray(newFieldsValues)) {
          newFieldsValues.forEach(itemDataSource => {
            newDataSource.push(itemDataSource);
          });
        } else if (newFieldsValues.isCreat) {
          newDataSource.push(newFieldsValues);
        } else {
          const { abilityLineId } = newFieldsValues;
          newDataSource = dataSource.map(item => {
            if (item.abilityLineId === abilityLineId) {
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
        const addList = isEditing
          ? []
          : isArray(newFieldsValues)
          ? newFieldsValues
          : [newFieldsValues];
        if (isBatchAdd || !isEditing) {
          // 新建时增加校验，编辑时无需校验
          const { supplierCompanyId, companyId } = basicForm?.getFieldsValue() || {};
          const checkList = addList.map(data => {
            const { abilityLineId, ...rest } = data;
            return { ...rest, supplierCompanyId, companyId };
          });
          checkCategory(checkList).then(response => {
            const res = getResponse(response);
            if (res) {
              onAdd(dataList, 'categoryMaterialData', true, addList);
              this.onClose();
            }
          });
        } else {
          onAdd(dataList, 'categoryMaterialData', true, addList);
          this.onClose();
        }
      }
    });
  }

  /**
   * 删除选中行
   */
  @Bind()
  handleDelete() {
    const { dataSource = [], onDeleteRows } = this.props;
    // const { content = [] } = dataSource;
    const { selectedRows, idList } = this.state;

    const newSelectedRows = selectedRows.map(item => {
      return item.abilityLineId;
    });
    const newDataSource = dataSource.filter(item => {
      return newSelectedRows.indexOf(item.abilityLineId) > -1 === false;
    });
    // this.setState({ selectedRows: [] });
    onDeleteRows(
      newDataSource,
      idList,
      'deleteCategoryMaterialData',
      'categoryMaterialData',
      true,
      selectedRows
    );
  }

  // /**
  //  * 校验是否必输
  //  */
  // @Bind()
  // handleValidFields(formName) {
  //   const { form: { validateFields } } = this.props;
  //   const temp = formName === 'itemCategoryId' ? 'isItem' : 'isCategory';
  //   const newTemp = formName === 'itemCategoryId' ? 'isCategory' : 'isItem';
  //   this.setState({ [temp]: true, [newTemp]: false }, () => {
  //     validateFields([formName], { force: true });
  //   });
  // }

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

  /**
   * 根据物料带出该物料下的主营品类
   * @param {String} itemId 物料id
   */
  @Bind()
  handleSetCategory(itemId) {
    const {
      form: { setFieldsValue, getFieldValue },
    } = this.props;
    this.setState({ categoryLoading: true });
    const currentCategory = getFieldValue('itemCategoryId');
    queryItemCategory(itemId).then(res => {
      if (res) {
        const mainCategory = res.filter(n => n.defaultFlag);
        const { categoryId, categoryCode, categoryName } = mainCategory[0] || {};
        if (!currentCategory) {
          setFieldsValue({
            itemCategoryId: categoryId,
            itemCategoryCode: categoryCode,
            itemCategoryName: categoryName,
          });
        }
      }
      this.setState({ categoryLoading: false });
    });
  }

  /**
   * 附件上传modal框
   */
  @Bind()
  handleAttamentModal(record = {}) {
    const { modalVisible } = this.state;
    const { abilityLineId, supplyAbilityId, supplyReviewStatus } = record;
    this.setState({
      modalVisible: !modalVisible,
      abilityLineId,
      supplyAbilityId,
      supplyReviewStatus,
    });
  }

  // 一键拓展回调
  @Bind()
  handleExpand() {
    const { onExpand } = this.props;
    const { selectedRows } = this.state;
    onExpand(selectedRows);
  }

  // 物料改变额外触发的事件
  @Bind()
  async extraItemChange(props) {
    const { remote } = this.props;
    if (remote && remote.event) {
      const eventProps = {
        ...props,
      };
      await remote.event.fireEvent('cuxItemChange', eventProps);
    }
  }

  @Bind()
  renderForm() {
    const { form, customizeForm } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
    const {
      recordSource,
      isCategory,
      isItem,
      itemCategoryId,
      itemSelectRows,
      itemCategorySelectRows,
      batchEditFlag,
    } = this.state;
    const formLayOut = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    const dateFormat = DEFAULT_DATE_FORMAT;
    getFieldDecorator('itemCode', { initialValue: recordSource.itemCode });
    getFieldDecorator('itemCategoryCode', { initialValue: recordSource.itemCategoryCode });
    getFieldDecorator('countryIdMeaning', { initialValue: recordSource.countryIdMeaning });
    getFieldDecorator('regionIdMeaning', { initialValue: recordSource.regionIdMeaning });
    getFieldDecorator('cityIdMeaning', { initialValue: recordSource.cityIdMeaning });
    getFieldDecorator('purchaseOrganizationCode', {
      initialValue: recordSource.purchaseOrganizationCode,
    });
    getFieldDecorator('purchaseOrganizationName', {
      initialValue: recordSource.purchaseOrganizationName,
    });

    const isEditing = Boolean(recordSource.abilityLineId);

    return customizeForm(
      {
        code: batchEditFlag
          ? 'SSLM.SUPPLIER_ABLILITY_DEFINITION.ITEM_BATCH_FORM'
          : 'SSLM.SUPPLIER_ABLILITY_DEFINITION.ITEM_FORM',
        form,
        dataSource: recordSource,
        isCreate: isEmpty(recordSource),
      },
      <Form layout="horizontal">
        {!batchEditFlag && (
          <Row>
            <Col span={24}>
              <FormItem
                {...formLayOut}
                label={
                  isEditing
                    ? intl.get(`sslm.supplyAbility.model.supplyAbility.itemCode`).d('物料编码')
                    : intl.get(`sslm.supplyAbility.model.supplyAbility.itemName`).d('物料描述')
                }
              >
                {isEditing
                  ? getFieldDecorator('itemId', {
                      rules: [
                        {
                          required: !isCategory,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`sslm.supplyAbility.model.supplyAbility.itemCode`)
                              .d('物料编码'),
                          }),
                        },
                      ],
                      initialValue: recordSource.itemId,
                    })(
                      <Lov
                        code="SMDM.CUSTOMER_ITEM"
                        textValue={recordSource.itemCode}
                        textField="itemCode"
                        queryParams={{
                          categoryId:
                            (recordSource.abilityLineId ? itemCategoryId : null) ||
                            getFieldValue('itemCategoryId'),
                        }}
                        onChange={(text, record = {}) => {
                          const formValue = {
                            itemName: record.itemName,
                            itemCode: record.itemCode,
                          };
                          this.handleLovChange(
                            formValue,
                            text,
                            getFieldValue('itemCategoryId'),
                            'isItem',
                            'isCategory'
                          );
                          if (text) {
                            this.handleSetCategory(text);
                          }
                          this.extraItemChange({
                            form,
                            record,
                          });
                        }}
                      />
                    )
                  : getFieldDecorator('itemIds', {
                      rules: [
                        {
                          required: !getFieldValue('itemCategoryIds'),
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`sslm.supplyAbility.model.supplyAbility.itemName`)
                              .d('物料描述'),
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
                          if (text && isString(text) && text.split(',').length > 1) {
                            setFieldsValue({ itemCategoryIds: undefined });
                          } else {
                            const itemCategoryIds = getFieldValue('itemCategoryIds');
                            if (!itemCategoryIds) {
                              setFieldsValue({
                                itemCategoryIds: lovRecords[0]?.categoryId?.toString() || null,
                                itemCategoryId: lovRecords[0]?.categoryId || null,
                                itemCategoryCode: lovRecords[0]?.categoryCode || null,
                                categoryName: lovRecords[0]?.categoryName || null,
                                itemCategoryName: lovRecords[0]?.categoryName || null,
                              });
                            }
                          }
                          this.extraItemChange({
                            form,
                            record: lovRecords,
                          });
                        }}
                      />
                    )}
              </FormItem>
            </Col>
          </Row>
        )}
        {!batchEditFlag && (
          <Row>
            <Col span={24}>
              <FormItem
                {...formLayOut}
                label={intl.get(`sslm.supplyAbility.model.supplyAbility.itemName`).d('物料描述')}
              >
                {isEditing
                  ? getFieldDecorator('itemName', {
                      initialValue: recordSource.itemName,
                    })(<Input disabled />)
                  : null}
              </FormItem>
            </Col>
          </Row>
        )}
        {!batchEditFlag && (
          <Row>
            <Col span={24}>
              <FormItem
                {...formLayOut}
                label={
                  isEditing
                    ? intl
                        .get(`sslm.supplyAbility.model.supplyAbility.itemCategoryCode`)
                        .d('品类代码')
                    : intl.get(`sslm.supplyAbility.model.supplyAbility.itemCategory`).d('品类')
                }
              >
                {isEditing
                  ? getFieldDecorator('itemCategoryId', {
                      rules: [
                        {
                          required: !isItem,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`sslm.supplyAbility.model.supplyAbility.itemCategoryCode`)
                              .d('品类代码'),
                          }),
                        },
                      ],
                      initialValue: recordSource.itemCategoryId,
                    })(
                      <Lov
                        code="SMDM.CATEGORY.LEVEL_CONTROL_TREE"
                        textField="itemCategoryCode"
                        queryParams={{
                          enabledFlag: 1,
                          hzeroUIFlag: 1,
                          itemId: getFieldValue('itemId'),
                          businessObjectCode: 'SRM_C_SRM_SSLM_SUPPLY_ABILITY',
                        }}
                        lovOptions={{ displayField: 'categoryCode', valueField: 'categoryId' }}
                        onClear={() => {
                          this.setState({ itemCategoryId: null });
                        }}
                        onChange={(text, record = {}) => {
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
                              .get(`sslm.supplyAbility.model.supplyAbility.itemCategory`)
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
                          businessObjectCode: 'SRM_C_SRM_SSLM_SUPPLY_ABILITY',
                          ...(getFieldValue('itemIds') &&
                          getFieldValue('itemIds').split(',').length < 2
                            ? { itemId: getFieldValue('itemIds') }
                            : {}),
                        }}
                        onClear={() => {
                          this.setState({ itemCategoryId: null });
                        }}
                        textField="categoryName"
                        selectedRows={itemCategorySelectRows}
                        changeSelectRows={newSelectedRows =>
                          this.setState({ itemCategorySelectRows: newSelectedRows })
                        }
                        disabled={
                          getFieldValue('itemIds') &&
                          getFieldValue('itemIds').split(',').length >= 2
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
        )}
        {!batchEditFlag && (
          <Row>
            <Col span={24}>
              <FormItem
                {...formLayOut}
                label={intl.get(`sslm.supplyAbility.model.supplyAbility.itemCategory`).d('品类')}
              >
                {isEditing
                  ? getFieldDecorator('itemCategoryName', {
                      initialValue: recordSource.itemCategoryName,
                    })(<Input disabled />)
                  : null}
              </FormItem>
            </Col>
          </Row>
        )}
        {!batchEditFlag && (
          <Row>
            <Col span={24}>
              <FormItem
                {...formLayOut}
                label={intl.get(`sslm.supplyAbility.model.supplyAbility.supplyFlag`).d('是否可供')}
              >
                {getFieldDecorator('supplyFlag', {
                  initialValue: isNumber(recordSource.supplyFlag) ? recordSource.supplyFlag : 1,
                })(<Switch />)}
              </FormItem>
            </Col>
          </Row>
        )}
        {batchEditFlag && (
          <Row>
            <Col span={24}>
              <FormItem
                {...formLayOut}
                label={intl.get(`sslm.supplyAbility.model.supplyAbility.supplyFlag`).d('是否可供')}
              >
                {getFieldDecorator('supplyFlag', {})(
                  <ValueList lazyLoad={false} lovCode="HPFM.FLAG" allowClear />
                )}
              </FormItem>
            </Col>
          </Row>
        )}
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl
                .get(`sslm.supplyAbility.model.supplyAbility.adapterProducts`)
                .d('适配产品')}
            >
              {getFieldDecorator('adapterProducts', {
                initialValue: recordSource.adapterProducts,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item
              {...formLayOut}
              label={intl
                .get(`sslm.supplyAbility.model.supplyAbility.countryIdMeaning`)
                .d('服务国家')}
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
                      // countryIdMeaning: undefined,
                      regionId: undefined,
                      cityId: undefined,
                      regionIdMeaning: undefined,
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
              label={intl
                .get(`sslm.supplyAbility.model.supplyAbility.regionIdMeaning`)
                .d('服务地区')}
            >
              {getFieldDecorator('regionId', {
                initialValue: recordSource.regionId,
              })(
                <Lov
                  code="HPFM.REGION"
                  lovOptions={{
                    displayField: 'regionName',
                    valueField: 'regionId',
                  }}
                  queryParams={{
                    countryId: getFieldValue('countryId'),
                  }}
                  disabled={!getFieldValue('countryId')}
                  textValue={recordSource.regionIdMeaning}
                  onChange={(value, lovRecord) => {
                    setFieldsValue({
                      regionIdMeaning: lovRecord.regionName,
                      // regionId: undefined,
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
              label={intl.get(`sslm.supplyAbility.model.supplyAbility.cityIdMeaning`).d('服务城市')}
            >
              {getFieldDecorator('cityId', {
                initialValue: recordSource.cityId,
              })(
                <Lov
                  code="HPFM.REGION"
                  textValue={recordSource.cityIdMeaning}
                  queryParams={{
                    parentRegionId: getFieldValue('regionId'),
                  }}
                  disabled={!getFieldValue('regionId')}
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
              label={intl.get(`sslm.supplyAbility.model.supplyAbility.dateFrom`).d('有效期从')}
            >
              {getFieldDecorator('dateFrom', {
                initialValue: recordSource.dateFrom && moment(recordSource.dateFrom, dateFormat),
                rules: [
                  {
                    required: getFieldValue('dateTo'),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sslm.supplyAbility.model.supplyAbility.dateFrom`)
                        .d('有效期从'),
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
              label={intl.get(`sslm.supplyAbility.model.supplyAbility.dateTo`).d('有效期至')}
            >
              {getFieldDecorator('dateTo', {
                initialValue: recordSource.dateTo && moment(recordSource.dateTo, dateFormat),
                rules: [
                  {
                    required: getFieldValue('dateFrom'),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sslm.supplyAbility.model.supplyAbility.dateTo`).d('有效期至'),
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
        <Row>
          <Col span={22}>
            <FormItem {...formLayOut} label={intl.get(`hzero.common.remark`).d('备注')}>
              {getFieldDecorator('remark', {
                initialValue: recordSource.remark,
              })(<TextArea />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  @Bind()
  getTableFilterFromParam() {
    // 处理查询参数
    let queryParam = {};
    if (this.categoryFilterForm) {
      const { getFieldsValue } = this.categoryFilterForm;
      const filteValue = getFieldsValue();
      const { itemCategoryIdList, categoryName, itemIdList, itemName, ...others } = filteValue;
      const newItemCategoryIdList = (itemCategoryIdList && itemCategoryIdList.split(',')) || [];
      const newItemIds = (itemIdList && itemIdList.split(',')) || [];
      queryParam = filterNullValueObject({
        ...others,
        itemCategoryIdList: newItemCategoryIdList,
        itemIdList: newItemIds,
      });
    }
    return queryParam;
  }

  /**
   * 列表分页函数
   * @param {Number} [params.page = 0] - 数据页码
   * @param {Number} [params.size = 10] - 分页大小
   */
  @Bind()
  handleTableChange(pagination) {
    // 获取查询参数
    const queryParam = this.getTableFilterFromParam();
    this.props.onTableChange(pagination, queryParam);
  }

  render() {
    const {
      drawerVisible,
      recordSource,
      selectedRows,
      modalVisible,
      abilityLineId,
      supplyAbilityId,
      categoryLoading,
      supplyReviewStatus,
      batchEditFlag,
    } = this.state;
    const {
      isEdit = true,
      dataSource,
      customizeTable,
      optional = undefined,
      handleAttrChange = () => {},
      pagination,
      customizeBtnGroup,
      isCompanyDimension,
      linkColor,
      customizeFilterForm,
      filterCode = '',
      queryCategoryMaterialData = () => {},
    } = this.props;
    const columns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'supplyReviewStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.itemName`).d('物料描述'),
        dataIndex: 'itemName',
        width: 200,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCategoryCode`).d('品类代码'),
        dataIndex: 'itemCategoryCode',
        width: 100,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCategory`).d('品类'),
        dataIndex: 'itemCategoryName',
        width: 100,
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
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.adapterProducts`).d('适配产品'),
        dataIndex: 'adapterProducts',
        width: 100,
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
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'remark',
        width: 200,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.quotaRatio`).d('配额'),
        dataIndex: 'quotaRatio',
        width: 200,
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
        title: intl
          .get(`sslm.supplyAbility.model.supplyAbility.lastUpdateUserName`)
          .d('最后更新人'),
        dataIndex: 'lastUpdateUserName',
        width: 150,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.lastUpdateDate`).d('最后更新日期'),
        dataIndex: 'lastUpdateDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get('hzero.common.upload.modal.title').d('附件'),
        dataIndex: 'attachment',
        width: 130,
        fixed: 'right',
        render: (_, record) => (
          <a onClick={() => this.handleAttamentModal(record)} disabled={record.isLocal}>
            {renderAttachmentText({
              editable: record.supplyReviewStatus !== 'REVIEWING',
              fileCount: record.fileCount,
              linkColor,
            })}
          </a>
        ),
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
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 75,
        dataIndex: 'option',
        fixed: 'right',
        render: (_, record) => {
          return (
            <a
              onClick={() => {
                this.onOpen(record);
              }}
              disabled={record.supplyReviewStatus === 'REVIEWING'}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];
    const rowSelection = {
      selectedRows,
      onChange: this.onSelectChange,
      selectedRowKeys: selectedRows.map(n => n.abilityLineId),
    };
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));
    const attachmentModalProps = {
      supplyAbilityId,
      viewOnly: supplyReviewStatus !== 'REVIEWING',
      isVisible: modalVisible,
      supplyAbilityLineId: abilityLineId,
      optional,
      onCancel: this.handleAttamentModal,
      handleAttrChange,
      attCustomizeCode: 'SSLM.SUPPLIER_ABLILITY_DEFINITION.LINE_ATTACHMENT',
    };
    return (
      <React.Fragment>
        <div className="table-list-search" style={{ textAlign: 'right' }}>
          {customizeBtnGroup({ code: 'SSLM.SUPPLIER_ABLILITY_DEFINITION.ITEM_BTNS' }, [
            <Button
              data-name="create"
              type="primary"
              onClick={() => {
                this.onOpen();
              }}
            >
              {intl.get(`sslm.supplyAbility.view.message.category.create`).d('新建品类物料')}
            </Button>,
            <Button
              data-name="delete"
              disabled={isEmpty(selectedRows)}
              style={{ marginRight: 8 }}
              onClick={this.handleDelete}
            >
              {intl.get(`sslm.supplyAbility.view.message.category.delete`).d('删除品类物料')}
            </Button>,
            <Button
              data-name="batchEdit"
              disabled={isEmpty(dataSource)}
              style={{ marginRight: 8 }}
              onClick={() => this.handleBatchEdit()}
            >
              {isEmpty(selectedRows)
                ? intl.get('hzero.common.button.batchEdit').d('批量编辑')
                : intl.get('sslm.common.button.batchCheckEdit').d('勾选批量编辑')}
            </Button>,
            <Button
              data-name="expand"
              disabled={isEmpty(selectedRows) || !isCompanyDimension}
              style={{ marginRight: 8 }}
              onClick={this.handleExpand}
            >
              {intl.get(`sslm.supplyAbility.view.btn.vistaExpand`).d('一键拓展')}
            </Button>,
          ])}
        </div>
        {isEdit && (
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
        )}
        {customizeTable(
          {
            code: 'SSLM.SUPPLIER_ABLILITY_DEFINITION.ITEM_LINE',
          },
          <Table
            rowKey="abilityLineId"
            dataSource={dataSource}
            columns={columns}
            bordered
            pagination={pagination}
            rowSelection={rowSelection}
            onChange={page => this.handleTableChange(page)}
            scroll={{ x: scrollX }}
          />
        )}
        {drawerVisible && (
          <Drawer
            title={
              recordSource.abilityLineId || batchEditFlag
                ? intl.get(`sslm.supplyAbility.view.message.category.edit`).d('编辑品类物料')
                : intl.get(`sslm.supplyAbility.view.message.category.create`).d('新建品类物料')
            }
            placement="right"
            width={520}
            destroyOnClose
            onClose={this.onClose}
            visible={drawerVisible}
            style={{
              height: 'calc(100% - 55px)',
              overflow: 'auto',
              paddingBottom: 53,
            }}
          >
            <Spin spinning={categoryLoading}>
              <div style={{ marginBottom: 40 }}>{drawerVisible && this.renderForm()}</div>
            </Spin>
            <div className={styles['modal-button']}>
              <Button
                style={{
                  marginRight: 8,
                }}
                onClick={this.onClose}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>
              <Button onClick={() => this.handleFormSave()} type="primary">
                {intl.get('hzero.common.button.ok').d('确定')}
              </Button>
            </div>
          </Drawer>
        )}
        {modalVisible && <AttachmentModal {...attachmentModalProps} />}
      </React.Fragment>
    );
  }
}
