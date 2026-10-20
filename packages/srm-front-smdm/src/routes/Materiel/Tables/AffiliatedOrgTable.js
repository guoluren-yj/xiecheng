/**
 * AffiliatedOrgTable - 所属组织
 * @date: 2018-9-25
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import {
  Form,
  Button,
  Table,
  Drawer,
  Input,
  Tooltip,
  InputNumber,
  Select,
  Row,
  Col,
} from 'hzero-ui';
import { isEmpty, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import Switch from 'components/Switch';
import { enableRender } from 'utils/renderer';

import uuidv4 from 'uuid/v4';
import Lov from 'components/Lov';
import ExcelExport from 'components/ExcelExport';
import { createPagination } from 'utils/utils';
import intl from 'utils/intl';
import { SRM_MDM } from '_utils/config';
import { EDIT_FORM_ROW_LAYOUT } from 'utils/constants';
// import notification from 'utils/notification';
import styles from '../index.less';
import DemandExecutorModal from './demandExecutorModal';
import LovM from './LovM';

const { Option } = Select;
const FormItem = Form.Item;

const FORM_COL_1_LAYOUT = {
  span: 24,
};

/**
 * 所属组织
 * @extends {Component} - PureComponent
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */
@connect(({ materiel }) => ({
  materiel,
}))
@Form.create({ fieldNameProp: null })
// @formatterCollections({ code: 'smdm.materiel' })
export default class AffiliatedOrgTable extends PureComponent {
  state = {
    drawerVisible: false,
    recordSource: {},
    selectedRows: [],
    idList: [],
    itemFlag: false,
    showOrg: true,
    reItemAllOrgFlag: false,
  };

  componentDidMount() {
    const { onClearRows } = this.props;
    if (onClearRows) onClearRows(this.handleClearSelectedRows);
    const { itemAllOrgFlag, dataSource = {} } = this.props;
    let newRecordSource = {};
    const basicSource = (dataSource.content || [])[0];
    if (!isEmpty(basicSource)) {
      if (itemAllOrgFlag === 1) {
        newRecordSource = {
          ...basicSource,
          orgRelationId: undefined,
          organizationId: undefined,
          relOrganizationId: undefined,
          organizationCode: undefined,
          organizationName: undefined,
        };
      } else {
        newRecordSource = {
          minPackQuantity: basicSource.minPackQuantity,
          leadDays: basicSource.leadDays,
          forSalesFlag: basicSource.forSalesFlag,
          forPurchaseFlag: basicSource.forPurchaseFlag,
          consignmentFlag: basicSource.consignmentFlag,
          exemptInspectionFlag: basicSource.exemptInspectionFlag,
          internalBatchFlag: basicSource.internalBatchFlag,
          externalBatchFlag: basicSource.externalBatchFlag,
          validPeriodFlag: basicSource.validPeriodFlag,
          enabledFlag: basicSource.enabledFlag,
          lpnFlag: basicSource.lpnFlag,
          minOrderQuantity: basicSource.minOrderQuantity,
          minDeliveryRate: basicSource.minDeliveryRate,
          maxDeliveryRate: basicSource.maxDeliveryRate,
          firstReminderList: basicSource.firstReminderList,
          secondReminderList: basicSource.secondReminderList,
          thirdReminderList: basicSource.thirdReminderList,
        };
      }
    } else {
      newRecordSource = {
        forSalesFlag: 1,
        forPurchaseFlag: 1,
        internalBatchFlag: 1,
        externalBatchFlag: 1,
        validPeriodFlag: 1,
        enabledFlag: 1,
        lpnFlag: 0,
        exemptInspectionFlag: 0,
        consignmentFlag: 0,
      };
    }
    this.setState({
      itemFlag: itemAllOrgFlag === 1,
      recordSource: newRecordSource,
      reItemAllOrgFlag: itemAllOrgFlag === 1,
    });
    // if (itemId) {
    //   onTableChange({}, 'queryAffliated').then(() => {

    //   });
    // }
  }

  /**
   * 将selectedRows置空
   */
  @Bind()
  handleClearSelectedRows() {
    this.setState({ selectedRows: [] });
  }

  /**
   * 查询表单数据
   * @param {*} functionName 函数名
   * @param {*} itemId 物料Id
   * @param {*} page 分页参数
   */
  @Bind()
  queryAllOrg(page = {}, pageChange) {
    const {
      dispatch,
      organizationId,
      form,
      onAdd,
      materiel: { materielDetail },
    } = this.props;
    const { recordSource } = this.state;
    dispatch({
      type: `materiel/querAllOrg`,
      payload: {
        organizationId,
        enabledFlag: 1,
        page,
        // customizeUnitCode: 'SMDM_MATERIEL_ORG.LIST',
      },
    }).then((res) => {
      if (res) {
        form.validateFields((err, fieldsValues) => {
          if (!err) {
            const {
              orgRelationId,
              organizationId: curOrganizationId,
              relOrganizationId,
              organizationCode,
              organizationName,
              ...others
            } = fieldsValues;
            const newDataSource = isEmpty(res.content) ? [] : [...res.content];
            let dataList = [];
            if (pageChange) {
              dataList = newDataSource.map((item) => {
                return { ...recordSource, ...item, orgRelationId: uuidv4() };
              });
              onAdd(dataList, 'affliatedData', true, true);
              dispatch({
                type: 'materiel/updateState',
                payload: {
                  materielDetail: { ...materielDetail, itemAllOrgFlag: 1, queryAllFlag: true },
                },
              });
            } else {
              dataList = newDataSource.map((item) => {
                return {
                  ...recordSource,
                  ...item,
                  ...others,
                  organizationCode: item.organizationCode,
                  orgRelationId: uuidv4(),
                };
              });
              onAdd(dataList, 'affliatedData', true, true);
              const { dimensionQc = [] } = others;
              dispatch({
                type: 'materiel/updateState',
                payload: {
                  itemOrgRelAttributeVO: { ...others, dimensionQc: String(dimensionQc) },
                  materielDetail: { ...materielDetail, itemAllOrgFlag: 1, queryAllFlag: true },
                },
              });
              this.setState({
                drawerVisible: false,
                itemFlag: true,
                recordSource: {
                  ...others,
                  ...dataList[0],
                  orgRelationId: undefined,
                  organizationId: undefined,
                  relOrganizationId: undefined,
                  organizationCode: undefined,
                  organizationName: undefined,
                },
              });
            }
          }
        });
      }
    });
  }

  /**
   * 保存选中的行
   * @param {*} selectedRowKeys
   * @param {Array} selectedRows 行数据
   */
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    const idList = [];
    selectedRows.forEach((item) => {
      if (!item.isLocal) {
        idList.push(item.orgRelationId);
      }
    });
    this.setState({ selectedRows, idList });
  }

  @Bind()
  handleTableChange(pagination) {
    const { itemFlag } = this.state;
    const { queryAllFlag = false } = this.props;
    if (queryAllFlag && itemFlag) {
      this.queryAllOrg(pagination, true);
    } else {
      this.props.onTableChange(pagination, 'queryAffliated');
    }
  }

  @Bind()
  onOpen(orgFlag, recordSource) {
    const { form } = this.props;
    if (recordSource) {
      this.setState({ drawerVisible: true, showOrg: orgFlag, recordSource }, () => {
        // eslint-disable-next-line no-unused-expressions
        form?.resetFields();
      });
    } else {
      const newRecordSource = {
        forSalesFlag: 1,
        forPurchaseFlag: 1,
        internalBatchFlag: 1,
        externalBatchFlag: 1,
        validPeriodFlag: 1,
        enabledFlag: 1,
        lpnFlag: 0,
        exemptInspectionFlag: 0,
        consignmentFlag: 0,
      };
      this.setState(
        { drawerVisible: true, showOrg: orgFlag, recordSource: newRecordSource },
        () => {
          // eslint-disable-next-line no-unused-expressions
          form?.resetFields();
        }
      );
    }
  }

  @Bind()
  onClose() {
    this.setState({ drawerVisible: false });
  }

  @Bind()
  saveAll() {
    const { showOrg } = this.state;
    if (showOrg) {
      this.saveFormData();
    } else {
      this.queryAllOrg();
    }
  }

  /**
   * 保存
   */
  @Bind()
  saveFormData() {
    const { form, dataSource = {}, onAdd, itemId } = this.props;
    const { content = [] } = dataSource;
    const { recordSource = {} } = this.state;
    form.validateFields((err, fieldsValues) => {
      const { dimensionQc } = fieldsValues;
      if (!err) {
        const newFieldsValues = recordSource.orgRelationId
          ? {
            ...recordSource,
            ...fieldsValues,
            itemId,
            dimensionQc: String(dimensionQc),
          }
          : {
            ...recordSource,
            ...fieldsValues,
            isCreat: true,
            isLocal: true,
            itemId,
            orgRelationId: uuidv4(),
            dimensionQc: String(dimensionQc),
          };
        let newDataSource = isEmpty(content) ? [] : [...content];
        if (newFieldsValues.isCreat) {
          newDataSource.push(newFieldsValues);
        } else {
          const { orgRelationId } = newFieldsValues;
          newDataSource = content.map((item) => {
            if (item.orgRelationId === orgRelationId) {
              return { ...item, ...newFieldsValues };
            } else {
              return item;
            }
          });
        }
        const dataList = newDataSource.map((item) => {
          if (item.isCreat) {
            const { isCreat, ...other } = item;
            return other;
          } else {
            return item;
          }
        });
        onAdd(dataList, 'affliatedData', true);
        this.setState({ drawerVisible: false });
      }
    });
  }

  /**
   * 超出数量类型改变
   */
  @Bind()
  handleChangeOverTye(value) {
    const { form } = this.props;
    // const { setFieldsValue } = form;
    if (value === 'overPercent') {
      form.setFieldsValue({ overQuantity: null });
    } else {
      form.setFieldsValue({ overPercent: null });
    }
  }

  /**
   * 删除数据
   */
  @Bind()
  handleDelete(allDelete) {
    const {
      dataSource = {},
      onDeleteRows,
      dispatch,
      materiel: { materielDetail },
    } = this.props;
    const { content = [] } = dataSource;
    const { selectedRows, idList } = this.state;
    if (allDelete) {
      onDeleteRows([], [], 'deleteAffiatedTableData', 'affliatedData', true, true);
      this.setState({ itemFlag: false });
    } else {
      const newSelectedRows = selectedRows.map((item) => {
        return item.orgRelationId;
      });
      const newDataSource = content.filter((item) => {
        return newSelectedRows.indexOf(item.orgRelationId) > -1 === false;
      });
      this.setState({ selectedRows: [] });
      onDeleteRows(newDataSource, idList, 'deleteAffiatedTableData', 'affliatedData', true);
    }
    dispatch({
      type: 'materiel/updateState',
      payload: {
        materielDetail: { ...materielDetail, itemAllOrgFlag: 0, queryAllFlag: false },
      },
    });
  }
  /**
   * 查询需求执行人
   */

  @Bind()
  onExecutorChange(demandExecutor, demandExecutorBys, lovType) {
    const { form } = this.props;
    const { setFieldsValue } = form;
    if (lovType === 'orderExecutor') {
      setFieldsValue({
        orderExecutor: demandExecutor,
        orderExecutorBys: demandExecutorBys,
      });
    } else if (lovType === 'sourceExecutor') {
      setFieldsValue({
        sourceExecutor: demandExecutor,
        sourceExecutorBys: demandExecutorBys,
      });
    } else {
      setFieldsValue({
        demandExecutor,
        demandExecutorBys,
      });
    }
  }

  renderForm() {
    const {
      form,
      onValid,
      isEdit,
      ExecutorData = [],
      ExtorPagination = {},
      dispatch,
      demanding,
      allowExcessTypeList = [],
      dimensionQcList = [],
      id,
      organizationId,
      customizeForm,
    } = this.props;
    const { getFieldDecorator, setFieldsValue, getFieldValue } = form;
    const { recordSource = {}, showOrg, reItemAllOrgFlag, itemNameTipFlag } = this.state;
    const formLayOut = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    if (showOrg) {
      getFieldDecorator('organizationCode', { initialValue: recordSource.organizationCode });
    }
    getFieldDecorator('demandExecutorBys', { initialValue: recordSource.demandExecutorBys });
    getFieldDecorator('demandExecutor', { initialValue: recordSource.demandExecutor });
    getFieldDecorator('orderExecutorBys', { initialValue: recordSource.orderExecutorBys });
    getFieldDecorator('orderExecutor', { initialValue: recordSource.orderExecutor });
    getFieldDecorator('purchaseAgentName', { initialValue: recordSource.purchaseAgentName });
    const demandProp = {
      text: form.getFieldValue('demandExecutor'),
      demandValue: form.getFieldValue('demandExecutorBys'),
      dispatch,
      ExecutorData,
      ExtorPagination,
      onChange: this.onExecutorChange,
      demanding,
      lovType: 'demandExecutor',
    };
    const orderExecutorProps = {
      text: form.getFieldValue('orderExecutor'),
      orderExecutorValue: form.getFieldValue('orderExecutorBys'),
      dispatch,
      ExecutorData,
      ExtorPagination,
      onChange: this.onExecutorChange,
      demanding,
      lovType: 'orderExecutor',
    };
    const sourceExecutorProps = {
      text: form.getFieldValue('sourceExecutor'),
      sourceExecutorValue: form.getFieldValue('sourceExecutorBys'),
      dispatch,
      ExecutorData,
      ExtorPagination,
      onChange: this.onExecutorChange,
      demanding,
      lovType: 'sourceExecutor',
    };
    getFieldDecorator('dimensionQcMeaning', { initialValue: recordSource.dimensionQcMeaning });
    getFieldDecorator('multiInventoryName', {
      initialValue: recordSource.multiInventoryName,
    });
    return customizeForm(
      {
        code: 'SMDM_MATERIEL_ORG.EDITFORM', // 必传，和unitCode一一对应
        form, // 无论个性化单元是否只读，均必传
        dataSource: recordSource, // 必传，从后端接口获取到的数据
      },
      <Form layout="horizontal">
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_1_LAYOUT}>
            {showOrg && (
              <FormItem
                {...formLayOut}
                label={intl.get(`smdm.materiel.model.materiel.organizationCode`).d('库存组织代码')}
              >
                {getFieldDecorator('organizationId', {
                  rules: [
                    {
                      required: showOrg,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`smdm.materiel.model.materiel.organizationCode`)
                          .d('库存组织代码'),
                      }),
                    },
                  ],
                  initialValue: recordSource.organizationId,
                })(
                  <Lov
                    code="HPFM.INV_ORG"
                    textValue={recordSource.organizationCode}
                    queryParams={{ enabledFlag: 1 }}
                    onChange={(value, record) => {
                      setFieldsValue({
                        organizationCode: record.organizationCode,
                        organizationName: record.organizationName,
                        ouName: record.ouName,
                        companyName: record.companyName,
                        inventoryIds: [],
                        multiInventoryName: '',
                      });
                      if (isEdit && !reItemAllOrgFlag) {
                        onValid(form, 'relOrganizationId', value);
                      }
                    }}
                  />
                )}
              </FormItem>
            )}
          </Col>
          <Col {...FORM_COL_1_LAYOUT}>
            {showOrg && (
              <FormItem
                {...formLayOut}
                label={intl.get(`smdm.materiel.model.materiel.organizationName`).d('库存组织描述')}
              >
                {getFieldDecorator('organizationName', {
                  initialValue: recordSource.organizationName,
                })(<Input disabled />)}
              </FormItem>
            )}
          </Col>
          <Col {...FORM_COL_1_LAYOUT}>
            {showOrg && (
              <FormItem
                {...formLayOut}
                label={intl.get(`smdm.materiel.model.materiel.company`).d('公司')}
              >
                {getFieldDecorator('companyName', {
                  initialValue: recordSource.companyName,
                })(<Input disabled />)}
              </FormItem>
            )}
          </Col>
          <Col {...FORM_COL_1_LAYOUT}>
            {showOrg && (
              <FormItem
                {...formLayOut}
                label={intl.get(`smdm.materiel.model.materiel.ouName`).d('业务实体')}
              >
                {getFieldDecorator('ouName', {
                  initialValue: recordSource.ouName,
                })(<Input disabled />)}
              </FormItem>
            )}
          </Col>
          <Col {...FORM_COL_1_LAYOUT}>
            <FormItem
              {...formLayOut}
              label={intl
                .get(`smdm.materiel.model.materiel.includeAllInventoryFlag`)
                .d('加入全部库房')}
            >
              {getFieldDecorator('includeAllInventoryFlag', {
                initialValue:
                  recordSource.includeAllInventoryFlag === 0
                    ? recordSource.includeAllInventoryFlag
                    : 1,
              })(<Switch checkedValue={1} unCheckedValue={0} disabled={!showOrg} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_1_LAYOUT}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.inventory`).d('库房')}
            >
              <Tooltip
                placement="topLeft"
                title={recordSource.multiInventoryName}
                visible={form.getFieldValue('multiInventoryName') && itemNameTipFlag}
              />
              {getFieldDecorator('inventoryIds', {
                initialValue: recordSource.inventoryIds,
              })(
                <LovM
                  onMouseEnter={() => this.setState({ itemNameTipFlag: true })}
                  onMouseLeave={() => this.setState({ itemNameTipFlag: false })}
                  code="HPFM.INVENTORY"
                  disabled={
                    getFieldValue('includeAllInventoryFlag') || !getFieldValue('organizationId')
                  }
                  queryParams={{
                    tenantId: organizationId,
                    invOrganizationId: getFieldValue('organizationId'),
                  }}
                  lovOptions={{ displayField: 'inventoryName', valueField: 'inventoryId' }}
                  textValue={recordSource.multiInventoryName}
                  title={intl.get(`smdm.materiel.model.materiel.inventory`).d('库房')}
                  onChangeSelf={(list) => {
                    const name = list.map((item) => item.inventoryName).toString();
                    this.setState({ recordSource: { ...recordSource, multiInventoryName: name } });
                    setFieldsValue({
                      multiInventoryName: name,
                    });
                  }}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_1_LAYOUT}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.minPackQuantity`).d('最小包装数量')}
            >
              {getFieldDecorator('minPackQuantity', {
                initialValue: recordSource.minPackQuantity,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_1_LAYOUT}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.leadDays`).d('前置时间(天)')}
            >
              {getFieldDecorator('leadDays', {
                initialValue: recordSource.leadDays,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_1_LAYOUT}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.allowExcessQuantity`).d('允许超收')}
              className={styles.bgfff}
            >
              {/* <FormItem {...formLayOut} style={{ display: 'inline-block' }}> */}
              {getFieldDecorator('allowExcessAmount', {
                rules: [
                  {
                    required: getFieldValue('allowExcessType'),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('smdm.materiel.model.materiel.allowExcessQuantity')
                        .d('允许超收数量'),
                    }),
                  },
                  {
                    validator: (rule, value, callback) => {
                      if (isEmpty(getFieldValue('allowExcessType'))) {
                        callback();
                      } else if (
                        value > (getFieldValue('allowExcessType') === 'RATIO' ? 100 : Infinity)
                      ) {
                        callback(
                          new Error(
                            intl.get('smdm.rateOrg.view.validation.bigger').d(`不能大于100`)
                          )
                        );
                      } else if (value < 0) {
                        callback(
                          new Error(intl.get('smdm.rateOrg.view.validation.smaller').d(`不能小于0`))
                        );
                      } else {
                        callback();
                      }
                    },
                  },
                ],
                initialValue: recordSource.allowExcessAmount,
              })(
                <Input
                  type="number"
                  addonBefore={getFieldDecorator('allowExcessType', {
                    initialValue: recordSource.allowExcessType,
                  })(
                    <Select
                      allowClear
                      style={{ width: 120 }}
                      onChange={() => setFieldsValue({ allowExcessAmount: null })}
                    >
                      {allowExcessTypeList.map((n) => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                  min={0}
                  step={0.001}
                  max={getFieldValue('allowExcessType') === 'RATIO' ? 100 : Infinity}
                  disabled={!getFieldValue('allowExcessType')}
                // style={{ width: 160 }}
                />
              )}
              {/* </FormItem> */}
            </FormItem>
          </Col>
          <Col {...FORM_COL_1_LAYOUT}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.minOrderQuantity`).d('最小订货数量')}
            >
              {getFieldDecorator('minOrderQuantity', {
                initialValue: recordSource.minOrderQuantity,
              })(<InputNumber precision={2} min={0} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_1_LAYOUT}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.checkInterval`).d('检查间隔(天)')}
            >
              {getFieldDecorator('checkInterval', {
                initialValue: recordSource.checkInterval,
              })(<InputNumber precision={0} min={0} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_1_LAYOUT}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.receiveProcess`).d('收货处理时间(天)')}
            >
              {getFieldDecorator('receiveProcess', {
                initialValue: recordSource.receiveProcess,
              })(<InputNumber precision={0} min={0} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_1_LAYOUT}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.purchaseAgent`).d('采购员')}
            >
              {getFieldDecorator('purchaseAgentId', {
                initialValue: recordSource.purchaseAgentId,
              })(
                <Lov
                  code="SPFM.USER_AUTH.PURCHASE_AGENT"
                  textValue={recordSource.purchaseAgentName}
                  onChange={(_, record) => {
                    setFieldsValue({
                      purchaseAgentName: record.purchaseAgentName,
                    });
                  }}
                  queryParams={{ tenantId: organizationId, userId: id }}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_1_LAYOUT}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.demandExecutor`).d('需求执行人')}
            >
              {getFieldDecorator('demandExecutor', {
                initialValue: recordSource.demandExecutor,
              })(<DemandExecutorModal {...demandProp} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_1_LAYOUT}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.orderExecutor`).d('订单执行人')}
            >
              {getFieldDecorator('orderExecutor', {
                initialValue: recordSource.orderExecutor,
              })(<DemandExecutorModal {...orderExecutorProps} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_1_LAYOUT}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.sourceExecutor`).d('寻源执行人')}
            >
              {getFieldDecorator('sourceExecutor', {
                initialValue: recordSource.sourceExecutor,
              })(<DemandExecutorModal {...sourceExecutorProps} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_1_LAYOUT}>
            <Form.Item
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.view.dimensionQc`).d('质检维度')}
            >
              {getFieldDecorator('dimensionQc', {
                initialValue: recordSource.dimensionQc
                  ? typeof recordSource.dimensionQc === 'string'
                    ? recordSource.dimensionQc.split(',')
                    : recordSource.dimensionQc
                  : [],
              })(
                <Select
                  allowClear
                  mode="multiple"
                  onChange={(_, option) => {
                    setFieldsValue({
                      dimensionQcMeaning: String(option.map((e) => e.props.children)),
                    });
                  }}
                >
                  {dimensionQcList.map((item) => (
                    <Select.Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_1_LAYOUT}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.lpnFlag`).d('物料运输组')}
            >
              {getFieldDecorator('lpnFlag', {
                initialValue: recordSource.lpnFlag,
              })(<Switch disabled />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_1_LAYOUT}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.forSalesFlag`).d('是否用于销售')}
            >
              {getFieldDecorator('forSalesFlag', {
                initialValue: recordSource.forSalesFlag,
              })(<Switch />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_1_LAYOUT}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.forPurchaseFlag`).d('是否用于采购')}
            >
              {getFieldDecorator('forPurchaseFlag', {
                initialValue: recordSource.forPurchaseFlag,
              })(<Switch />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_1_LAYOUT}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.exemptInspectionFlag`).d('是否免检')}
            >
              {getFieldDecorator('exemptInspectionFlag', {
                initialValue: recordSource.exemptInspectionFlag,
              })(<Switch />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_1_LAYOUT}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.consignmentFlag`).d('是否寄售')}
            >
              {getFieldDecorator('consignmentFlag', {
                initialValue: recordSource.consignmentFlag,
              })(<Switch />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_1_LAYOUT}>
            <FormItem
              {...formLayOut}
              label={intl
                .get(`smdm.materiel.model.materiel.internalBatchFlag`)
                .d('是否启用内部批次')}
            >
              {getFieldDecorator('internalBatchFlag', {
                initialValue: recordSource.internalBatchFlag,
              })(<Switch />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_1_LAYOUT}>
            <FormItem
              {...formLayOut}
              label={intl
                .get(`smdm.materiel.model.materiel.externalBatchFlag`)
                .d('是否启用外部批次')}
            >
              {getFieldDecorator('externalBatchFlag', {
                initialValue: recordSource.externalBatchFlag,
              })(<Switch />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_1_LAYOUT}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.validPeriodFlag`).d('是否启用有效期')}
            >
              {getFieldDecorator('validPeriodFlag', {
                initialValue: recordSource.validPeriodFlag,
              })(<Switch />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_1_LAYOUT}>
            <FormItem {...formLayOut} label={intl.get('hzero.common.status.enable').d('启用')}>
              {getFieldDecorator('enabledFlag', {
                initialValue: recordSource.enabledFlag,
              })(<Switch disabled={!showOrg} />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { drawerVisible, recordSource, selectedRows, itemFlag } = this.state;
    const { dataSource, organizationId, itemId, isEdit, customizeTable, editAble } = this.props;
    const { content = [] } = dataSource;
    const columns = [
      {
        title: intl.get(`smdm.materiel.model.materiel.organizationCode`).d('库存组织代码'),
        width: 150,
        dataIndex: 'organizationCode',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.organizationName`).d('库存组织描述'),
        width: 150,
        dataIndex: 'organizationName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.inventory`).d('库房'),
        width: 250,
        dataIndex: 'multiInventoryName',
        render: (val) => (
          <Tooltip placement="topLeft" title={val}>
            {val}
          </Tooltip>
        ),
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.company`).d('公司'),
        width: 150,
        dataIndex: 'companyName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.ouName`).d('业务实体'),
        width: 100,
        dataIndex: 'ouName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.minPackQuantity`).d('最小包装数量'),
        width: 150,
        dataIndex: 'minPackQuantity',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.leadDays`).d('前置时间(天)'),
        width: 150,
        dataIndex: 'leadDays',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.allowExcessAmount`).d('允许超收数量/比例'),
        width: 150,
        dataIndex: 'allowExcessAmount',
        render: (text, record) => {
          return !isNil(text) && record.allowExcessType === 'RATIO' ? `${text} %` : text;
        },
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.minOrderQuantity`).d('最小订货数量'),
        width: 150,
        dataIndex: 'minOrderQuantity',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.plannedDelivery`).d('计划交货时间'),
        width: 150,
        dataIndex: 'plannedDelivery',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.checkInterval`).d('检查间隔(天)'),
        width: 150,
        dataIndex: 'checkInterval',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.receiveProcess`).d('收货处理时间(天)'),
        width: 150,
        dataIndex: 'receiveProcess',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.purchaseAgent`).d('采购员'),
        width: 150,
        dataIndex: 'purchaseAgentName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.demandExecutor`).d('需求执行人'),
        width: 150,
        dataIndex: 'demandExecutor',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.orderExecutor`).d('订单执行人'),
        width: 150,
        dataIndex: 'orderExecutor',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.sourceExecutor`).d('寻源执行人'),
        width: 150,
        dataIndex: 'sourceExecutor',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.view.dimensionQc`).d('质检维度'),
        width: 150,
        dataIndex: 'dimensionQcMeaning',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.lpnFlag`).d('物料运输组'),
        dataIndex: 'lpnFlag',
        width: 100,
        align: 'center',
        render: (val) => ['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val,
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.forSalesFlag`).d('是否用于销售'),
        dataIndex: 'forSalesFlag',
        width: 120,
        align: 'center',
        render: (val) => ['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val,
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.forPurchaseFlag`).d('是否用于采购'),
        dataIndex: 'forPurchaseFlag',
        width: 120,
        align: 'center',
        render: (val) => ['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val,
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.exemptInspectionFlag`).d('是否免检'),
        dataIndex: 'exemptInspectionFlag',
        width: 120,
        align: 'center',
        render: (val) => ['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val,
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.consignmentFlag`).d('是否寄售'),
        dataIndex: 'consignmentFlag',
        width: 120,
        align: 'center',
        render: (val) => ['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val,
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.internalBatchFlag`).d('是否启用内部批次'),
        dataIndex: 'internalBatchFlag',
        width: 150,
        align: 'center',
        render: (val) => ['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val,
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.externalBatchFlag`).d('是否启用外部批次'),
        dataIndex: 'externalBatchFlag',
        width: 150,
        align: 'center',
        render: (val) => ['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val,
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.validPeriodFlag`).d('是否启用有效期'),
        dataIndex: 'validPeriodFlag',
        width: 150,
        align: 'center',
        render: (val) => ['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val,
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.enabledFlag`).d('启用'),
        dataIndex: 'enabledFlag',
        width: 100,
        align: 'center',
        render: (val) => ['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val,
      },
      editAble && {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        align: 'center',
        fixed: 'right',
        dataIndex: 'option',
        render: (_, record) => (
          <a onClick={() => this.onOpen(true, record)} disabled={itemFlag}>
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
      },
    ].filter(Boolean);
    const rowSelection = {
      onChange: this.onSelectChange,
      getCheckboxProps: () => ({
        disabled: itemFlag || !editAble,
      }),
    };
    const otherButtonProps = {
      type: 'default',
      icon: 'download',
    };
    return (
      <React.Fragment>
        <div className="table-list-search" style={{ textAlign: 'right' }}>
          {!itemFlag && editAble && (
            <React.Fragment>
              <Tooltip
                placement="top"
                title={intl
                  .get(`smdm.materiel.view.message.toolTip.affiliated.addAllMsg`)
                  .d('"加入全部组织"自动扩充所有组织，无需再手工添加')}
              >
                <Button
                  style={{ marginRight: 8 }}
                  onClick={() => {
                    this.onOpen(false);
                  }}
                >
                  {intl
                    .get(`smdm.materiel.view.message.toolTip.affiliated.addAll`)
                    .d('加入全部组织')}
                </Button>
              </Tooltip>
              <Button
                style={{ marginRight: 8 }}
                disabled={isEmpty(selectedRows)}
                onClick={() => {
                  this.handleDelete(false);
                }}
              >
                {intl.get(`smdm.materiel.view.message.toolTip.affiliated.delete`).d('删除组织')}
              </Button>
              <Button
                style={{ marginRight: 8 }}
                type="primary"
                onClick={() => {
                  this.onOpen(true);
                }}
              >
                {intl.get(`smdm.materiel.view.message.toolTip.affiliated.create`).d('新建组织')}
              </Button>
            </React.Fragment>
          )}
          {itemFlag && editAble && (
            <React.Fragment>
              <Tooltip
                placement="top"
                title={intl
                  .get(`smdm.materiel.view.message.toolTip.affiliated.deleteAllMsg`)
                  .d('取消加入全部"将删除已加入的库存组织，需要重新维护库存组织')}
              >
                <Button
                  style={{ marginRight: 8 }}
                  onClick={() => {
                    this.handleDelete(true);
                  }}
                >
                  {intl
                    .get(`smdm.materiel.view.message.toolTip.affiliated.deleteAll`)
                    .d('取消加入全部')}
                </Button>
              </Tooltip>
              <Button
                style={{ marginRight: 8 }}
                type="primary"
                onClick={() => {
                  this.onOpen(false, recordSource);
                }}
              >
                {intl.get(`smdm.materiel.view.message.toolTip.affiliated.changeAll`).d('属性维护')}
              </Button>
            </React.Fragment>
          )}
          {isEdit && !isEmpty(content) && (
            <ExcelExport
              requestUrl={`${SRM_MDM}/v1/${organizationId}/item-org-rels/${itemId}/export`}
              otherButtonProps={otherButtonProps}
            />
          )}
        </div>
        {customizeTable(
          {
            code: 'SMDM_MATERIEL_ORG.LIST',
          },
          <Table
            rowKey="orgRelationId"
            dataSource={content}
            columns={columns}
            bordered
            scroll={{ x: 1500 }}
            pagination={createPagination(dataSource)}
            rowSelection={rowSelection}
            onChange={this.handleTableChange}
          />
        )}
        {drawerVisible && (
          <Drawer
            title={
              recordSource.orgRelationId
                ? intl.get(`smdm.materiel.view.message.toolTip.affiliated.edit`).d('编辑组织')
                : intl.get(`smdm.materiel.view.message.toolTip.affiliated.create`).d('新建组织')
            }
            placement="right"
            width="520px"
            destroyOnClose
            onClose={this.onClose}
            visible={drawerVisible}
          >
            <div style={{ marginBottom: 50 }}>{this.renderForm()}</div>
            <div className={styles['modal-button']}>
              <Button
                style={{
                  marginRight: 8,
                }}
                onClick={this.onClose}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>
              <Button onClick={this.saveAll} type="primary">
                {intl.get('hzero.common.button.ok').d('确定')}
              </Button>
            </div>
          </Drawer>
        )}
      </React.Fragment>
    );
  }
}
