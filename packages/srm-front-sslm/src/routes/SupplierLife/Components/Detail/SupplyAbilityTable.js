/**
 * ReviewTable 潜在／合格／供应商评审 供货能力清单表格复用
 * @date: 2018-10-9
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import {
  Form,
  Table,
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
import Lov from 'components/Lov';
import uuid from 'uuid/v4';
import querystring from 'querystring';
import { isEmpty, sum, isNumber, isArray } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import intl from 'utils/intl';
import { getDateFormat, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { connect } from 'dva';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { dateRender } from 'utils/renderer';
import LovMultiple from '@/routes/components/LovMultiple';
import formatterCollections from 'utils/intl/formatterCollections';
import Switch from 'components/Switch';
import ValueList from 'components/ValueList';
import LovMulti from 'srm-front-cuz/lib/custH0X/LovMulti';
import CommonImport from 'components/Import';
import { Button as PerButton } from 'components/Permission';
import { SRM_SSLM } from '_utils/config';

import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import { renderAttachmentText } from '@/routes/components/utils';
import C7nLovMultiple from '@/routes/components/C7nLovMultiple';
import AttachmentModal from './AttachmentModal';
import styles from './index.less';

const FormItem = Form.Item;
// const promptCode = 'sslm.supplyAbility';

const dateFormat = getDateFormat();
const businessObjectCode = 'SRM_C_SRM_SSLM_LIFE_CYCLE'; // 业务规则定义-品类code

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
export default class SupplyAbilityTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      drawerVisible: false,
      recordSource: {},
      selectedRows: [],
      idList: [],
      isCategory: false, // 判断是否必输
      isItem: false, // 判断是否必输
      modalVisible: false, // 附件上传模态框
      selectedRowKeys: [],
      itemSelectRows: [],
      itemCategorySelectRows: [],
      curAbilityLine: {}, // 打开上传附件时的当前行
      attachmentTotal: {}, // 附件弹框的总total
    };
  }

  componentDidMount() {
    const { onClearRows } = this.props;
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
   * getRowKey -获取主键
   * @param {*} stageCode 生命阶段code
   */
  @Bind()
  getRowKey(stageCode) {
    switch (stageCode) {
      case 'POTENTIAL': {
        return 'potentialLineId';
      }
      case 'QUALIFIED':
      case 'PREPARE': {
        return 'supplyRecordId';
      }
      default:
        return 'id'; // 供应商评审无主键
    }
  }

  /**
   * 保存选择行的数据
   * @param {Array} selectedRowKeys - 选中行主键
   * @param {Array} selectedRows - 选中行信息
   */
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    const { stageCode } = this.props;
    const idList = [];
    const rowKey = this.getRowKey(stageCode);
    selectedRows.forEach(item => {
      if (!item.isLocal) {
        idList.push(item[rowKey]);
      }
    });
    this.setState({ selectedRows, selectedRowKeys, idList });
  }

  /**
   * 保存新增或者编辑的数据
   */
  @Bind()
  saveFormData() {
    const { form, dataSource = [], onAdd, stageCode } = this.props;
    const { recordSource = {}, itemSelectRows, itemCategorySelectRows } = this.state;
    const rowKey = this.getRowKey(stageCode);
    this.setState({
      selectedRows: [],
    });
    form.validateFields((err, fieldsValues) => {
      if (!err) {
        // 判断 新增/编辑
        const isEditing =
          recordSource.potentialLineId || recordSource.supplyRecordId || recordSource.abilityLineId;
        const {
          psaFinishDate,
          spaFinishDate,
          dateFrom,
          dateTo,
          itemIds,
          itemCategoryIds,
        } = fieldsValues;
        const isBatchAdd =
          (itemIds && itemIds.split(',').length > 1) ||
          (itemCategoryIds && itemCategoryIds.split(',').length > 1);
        const dateObject = {
          psaFinishDate: psaFinishDate && moment(psaFinishDate).format(DEFAULT_DATE_FORMAT),
          spaFinishDate: spaFinishDate && moment(spaFinishDate).format(DEFAULT_DATE_FORMAT),
          dateFrom: dateFrom && moment(dateFrom).format(DEFAULT_DATE_FORMAT),
          dateTo: dateTo && moment(dateTo).format(DEFAULT_DATE_FORMAT),
        };
        const fieldsValuesObj = {
          ...fieldsValues,
          ...dateObject,
        };
        let updateFlag = true;
        if (isEditing) {
          for (const key in fieldsValuesObj) {
            if (Object.prototype.hasOwnProperty.call(fieldsValuesObj, key)) {
              if (fieldsValuesObj[key] !== recordSource[key]) {
                updateFlag = false;
              }
            }
          }
        }
        const newFieldsValues = isEditing
          ? {
              ...recordSource,
              ...fieldsValuesObj,
              _status: updateFlag ? null : 'update',
              tenantId: getCurrentOrganizationId(),
            }
          : isBatchAdd
          ? itemIds
            ? itemIds.split(',').map(itemId => {
                return {
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
                  [rowKey]: uuid(),
                  tenantId: getCurrentOrganizationId(),
                  _status: 'create',
                };
              })
            : itemCategoryIds.split(',').map(itemCategoryId => {
                return {
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
                  [rowKey]: uuid(),
                  tenantId: getCurrentOrganizationId(),
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
              [rowKey]: uuid(),
              tenantId: getCurrentOrganizationId(),
              _status: 'create',
            };
        let newDataSource = dataSource;
        if (isArray(newFieldsValues)) {
          newFieldsValues.forEach(itemDataSource => {
            newDataSource.push(itemDataSource);
          });
        } else if (newFieldsValues.isCreat) {
          newDataSource.push(newFieldsValues);
        } else {
          const { potentialLineId, supplyRecordId, abilityLineId } = newFieldsValues;
          newDataSource = dataSource.map(item => {
            if (potentialLineId) {
              if (item.potentialLineId === potentialLineId) {
                return { ...item, ...newFieldsValues };
              } else {
                return item;
              }
            } else if (supplyRecordId) {
              if (item.supplyRecordId === supplyRecordId) {
                return { ...item, ...newFieldsValues };
              } else {
                return item;
              }
            } else if (item.abilityLineId === abilityLineId) {
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
        onAdd(dataList, 'categoryMaterialData', true);
        this.onClose();
      }
    });
  }

  /**
   * 删除数据
   */
  @Bind()
  handleDelete() {
    const { onDeleteRows, stageCode, dataSource = [] } = this.props;
    const { selectedRows, idList } = this.state;

    const rowKey = this.getRowKey(stageCode);

    const newSelectedRows = selectedRows.map(item => {
      return item[rowKey];
    });
    const newDataSource = dataSource.filter(item => {
      return newSelectedRows.indexOf(item[rowKey]) > -1 === false;
    });
    this.setState({ selectedRows: [] });
    onDeleteRows(newDataSource, idList);
  }

  /**
   * 列表分页函数
   * @param {Number} [params.page = 0] - 数据页码
   * @param {Number} [params.size = 10] - 分页大小
   */
  @Bind()
  handleTableChange(page) {
    this.props.onTableChange(page);
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

    if (recordSource.itemId) {
      this.setState({ isItem: true });
    }
    if (recordSource.itemCategoryId) {
      this.setState({ isCategory: true });
    }
  }

  /**
   * 关闭modal并清空form
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
   *  批量导入
   */
  @Bind()
  handleImport() {
    const { requisitionId, stageCode, supplierCompanyId, history = {}, location = '' } = this.props;
    const queryParams = querystring.parse(location.search?.substr(1));
    history.push({
      pathname: `/sslm/supplier-life-manage/comment-import/SSLM_LFCYCLE_SUP_ABI`,
      search: querystring.stringify({
        action: intl.get('hzero.common.title.batchImport').d('批量导入'),
        args: JSON.stringify({ requisitionId, stageCode, supplierCompanyId }),
        backPath: `${
          stageCode === 'POTENTIAL'
            ? '/sslm/supplier-life-manage/potential'
            : stageCode === 'PREPARE'
            ? '/sslm/supplier-life-manage/prepare'
            : '/sslm/supplier-life-manage/qualified'
        }?${querystring.stringify(queryParams)}`,
      }),
    });
  }

  /**
   * 附件上传modal框
   */
  @Bind()
  handleAttamentModal(record = {}, recordAttachmentTotal = {}) {
    const { modalVisible, attachmentTotal } = this.state;
    const { potentialLineId, supplyRecordId, abilityLineId } = record;
    this.setState({
      curAbilityLine: record,
      modalVisible: !modalVisible,
      itemLineId: potentialLineId || supplyRecordId,
      abilityLineId,
      attachmentTotal: { ...attachmentTotal, ...recordAttachmentTotal },
    });
  }

  renderForm() {
    const { form, customizeForm = () => {}, formCode } = this.props;
    const { getFieldDecorator, setFieldsValue, getFieldValue } = form;
    // setFieldsValue, getFieldValue
    const { recordSource, isCategory, isItem, itemSelectRows, itemCategorySelectRows } = this.state;
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

    const isEditing =
      recordSource.potentialLineId || recordSource.supplyRecordId || recordSource.abilityLineId;

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
    return customizeForm(
      {
        code: formCode,
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
              {isEditing
                ? getFieldDecorator('itemId', {
                    initialValue: recordSource.itemId,
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
                  })(
                    <Lov
                      code="SSLM.RELATED_CATEGORY_ITEM"
                      textField="itemCode"
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
                      textField="itemCode"
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
                            itemName: lovRecords[0]?.itemName || null,
                            itemCategoryIds: lovRecords[0]?.categoryId?.toString() || null,
                            itemCategoryId: lovRecords[0]?.categoryId || null,
                            categoryCode: lovRecords[0]?.categoryCode || null,
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
              {isEditing
                ? getFieldDecorator('itemCategoryId', {
                    initialValue: recordSource.itemCategoryId,
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
                  })(
                    <Lov
                      code="SMDM.CATEGORY.LEVEL_CONTROL_TREE"
                      textField="itemCategoryCode"
                      lovOptions={{ displayField: 'categoryCode', valueField: 'categoryId' }}
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
                            .get(`sslm.supplyAbility.model.supplyAbility.itemCategoryCode`)
                            .d('品类代码'),
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
                      textField="categoryCode"
                      lovOptions={{ displayField: 'categoryCode' }}
                      selectedRows={itemCategorySelectRows}
                      changeSelectRows={newSelectedRows =>
                        this.setState({ itemCategorySelectRows: newSelectedRows })
                      }
                      disabled={
                        getFieldValue('itemIds') && getFieldValue('itemIds').split(',').length >= 2
                      }
                      onChange={(text, lovRecords) => {
                        if (text && text.split(',').length > 1) {
                          setFieldsValue({ itemIds: undefined });
                        } else {
                          setFieldsValue({
                            itemCategoryName: lovRecords[0]?.categoryName || null,
                          });
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
                initialValue: isNumber(recordSource.supplyFlag) ? recordSource.supplyFlag : 1,
              })(<Switch />)}
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
              })(<Input />)}
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
          <Col span={12}>
            <FormItem
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
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl.get(`sslm.supplyAbility.model.supplyAbility.cityIdMeaning`).d('服务城市')}
            >
              {getFieldDecorator('cityId', {
                initialValue: recordSource.cityId,
              })(
                <Lov
                  disabled={!getFieldValue('regionId')}
                  code="HPFM.REGION"
                  textValue={recordSource.cityIdMeaning}
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
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              // dateFrom: 有效日期从,
              {...formLayOut}
              label={intl.get(`sslm.supplyAbility.model.supplyAbility.dateFrom`).d('有效期从')}
            >
              {getFieldDecorator('dateFrom', {
                initialValue:
                  recordSource.dateFrom && moment(recordSource.dateFrom, DEFAULT_DATE_FORMAT),
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
        <Row gutter={24}>
          <Col span={12}>
            <FormItem
              // dateTo: 有效日期至,
              {...formLayOut}
              label={intl.get(`sslm.supplyAbility.model.supplyAbility.dateTo`).d('有效期至')}
            >
              {getFieldDecorator('dateTo', {
                initialValue:
                  recordSource.dateTo && moment(recordSource.dateTo, DEFAULT_DATE_FORMAT),
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
              })(<ValueList disabled lovCode="SSLM.SUPPLYING_STATUS" />)}
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
              })(<ValueList disabled lovCode="SSLM.EVALUATION_LEVEL" />)}
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
              })(<InputNumber disabled min={0} precision={2} style={{ width: '100%' }} />)}
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
                  recordSource.psaFinishDate &&
                  moment(recordSource.psaFinishDate, DEFAULT_DATE_FORMAT),
              })(<DatePicker disabled placeholder="" style={{ width: '100%' }} />)}
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
              })(<ValueList disabled lovCode="SSLM.EVALUATION_LEVEL" />)}
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
              })(<InputNumber disabled min={0} precision={2} style={{ width: '100%' }} />)}
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
                  recordSource.spaFinishDate &&
                  moment(recordSource.spaFinishDate, DEFAULT_DATE_FORMAT),
              })(<DatePicker disabled placeholder="" style={{ width: '100%' }} />)}
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
              })(<Input disabled />)}
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
          <Col span={12}>
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
      stageCode,
      dataSource = [],
      pagination = {},
      isOperate = true, // 是否显示评价信息、附件
      isSupplyFlag = true, // 是否显示 是否可供
      isEdit = false,
      isImport = false,
      customizeTable = () => {},
      customizeBtnGroup = () => {},
      tableCode,
      requisitionId,
      btnCode = '',
      supplierCompanyId,
      onAdd,
      linkColor,
      attCustomizeCode,
    } = this.props;
    const {
      drawerVisible,
      selectedRows,
      recordSource,
      modalVisible,
      itemLineId,
      abilityLineId,
      curAbilityLine,
      selectedRowKeys,
      attachmentTotal,
    } = this.state;
    // const evaluateRemarkDataIndex = isSupplyFlag ? 'evaluateRemark' : 'remark';
    const rowKey = this.getRowKey(stageCode);
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
      onAdd,
      itemLineId,
      requisitionId,
      abilityLineId,
      curAbilityLine,
      viewOnly: isEdit,
      isVisible: modalVisible,
      lineDataSource: dataSource,
      abilityRowKey: rowKey,
      attCustomizeCode,
      customizeTable,
      onCancel: this.handleAttamentModal,
    };

    const columns = [
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
        width: 150,
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
        width: 150,
        dataIndex: 'spaFinishDate',
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
    ];
    if (isOperate) {
      columns.push(
        {
          title: intl.get(`sslm.supplyAbility.model.supplyAbility.evaluateRemark`).d('评价信息'),
          width: 200,
          dataIndex: 'evaluateRemark',
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
          title: intl.get('hzero.common.upload.modal.title').d('附件'),
          width: 130,
          fixed: 'right',
          dataIndex: 'attachmentUuid',
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
        }
      );
    }
    if (isEdit) {
      columns.push({
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
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
    if (isSupplyFlag) {
      const supplyFlagArray = [
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
      ];
      columns.splice(4, 0, ...supplyFlagArray);
    }
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));
    return (
      <Fragment>
        <div className="table-list-search" style={{ textAlign: 'right' }}>
          {isEdit && (
            <React.Fragment>
              {customizeBtnGroup(
                {
                  code: btnCode,
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
                        code:
                          stageCode === 'PREPARE'
                            ? 'srm.partner.suplier-lifecycle.management.ps.ps.button.import.old'
                            : 'srm.partner.suplier-lifecycle.management.ps.qualified.tem.import.old',
                        type: 'button',
                        meaning: '预留/合格/潜在供货能力清单-批量导入',
                      },
                    ]}
                  >
                    {intl.get('hzero.common.title.batchImport').d('批量导入')}
                  </PerButton>,
                  <CommonImport
                    data-name="commonImport"
                    businessObjectTemplateCode="SSLM_LFCYCLE_SUP_ABI"
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
                            stageCode === 'PREPARE'
                              ? 'srm.partner.suplier-lifecycle.management.ps.ps.button.import.new'
                              : 'srm.partner.suplier-lifecycle.management.ps.qualified.tem.import.model',
                          type: 'button',
                          meaning: '预留/合格/潜在供货能力清单-批量导入',
                        },
                      ],
                    }}
                    buttonText={intl.get('hzero.common.button.newBatchImport').d('(新)批量导入')}
                    args={{ requisitionId, stageCode, supplierCompanyId }}
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
              )}
            </React.Fragment>
          )}
        </div>
        {customizeTable(
          {
            code: tableCode,
          },
          <Table
            rowKey={rowKey}
            bordered
            rowSelection={isEdit && rowSelection}
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
            onChange={this.handleTableChange}
            scroll={{ x: scrollX }}
          />
        )}
        {drawerVisible && (
          <Drawer
            title={
              recordSource.supplyAbilityId
                ? intl.get(`sslm.supplyAbility.view.message.categoryedit`).d('编辑自主品类物料')
                : intl.get(`sslm.supplyAbility.view.message.categoryadd`).d('新建自主品类物料')
            }
            placement="right"
            width={800}
            destroyOnClose
            onClose={this.onClose}
            visible={drawerVisible}
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
        {/* 上传附件模态框 */}
        {modalVisible && <AttachmentModal {...attachmentModalProps} />}
      </Fragment>
    );
  }
}
