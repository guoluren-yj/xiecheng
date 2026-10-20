/**
 * SupplyCapacityInform - 供货能力信息
 * @date: 2019-12-13
 * @author: WXM <xiaomin.wang01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import moment from 'moment';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import { Input, Form, Button, Modal, DatePicker } from 'hzero-ui';
import { isNumber, sum, isEmpty, pullAllBy, cloneDeep, isUndefined } from 'lodash';

import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import Lov from 'components/Lov';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import LovMulti from 'srm-front-cuz/lib/custH0X/LovMulti';
import formatterCollections from 'utils/intl/formatterCollections';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import CommonImport from 'components/Import';
import { Button as PerButton } from 'components/Permission';
import { SRM_SSLM } from '_utils/config';

import notification from 'utils/notification';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import {
  getDateFormat,
  getEditTableData,
  addItemToPagination,
  delItemToPagination,
  delItemsToPagination,
  getCurrentOrganizationId,
} from 'utils/utils';
import { renderAttachmentText } from '@/routes/components/utils';
import queryString from 'querystring';

import styles from '@/routes/index.less';
// import NewLov from '@/routes/components/Lov'; // lov父级品类不可选
import AttachmentModal from './AttachmentModal';

const FormItem = Form.Item;
const organizationId = getCurrentOrganizationId();

const dateFormat = getDateFormat();

@connect(({ supplierInform, loading, user = {} }) => {
  const { currentUser: { themeConfigVO = {} } = {} } = user;
  const {
    enableThemeConfig, // 是否开启了新主题
    colorCode, // 主题色
    fontFileId,
    componentColorList, // 组件主题列表
  } = themeConfigVO;
  let themeConfig = {};
  if (enableThemeConfig) {
    const componentsColor = getComponentsThemeColor(componentColorList, colorCode);
    themeConfig = {
      primaryColor: colorCode,
      tabsPrimaryColor: componentsColor['tabs-primary-color'],
      linkColor: componentsColor['link-color'],
      anchorColor: componentsColor['anchor-primary-color'],
      fontFamily: `font-${fontFileId}`, // 字体
    };
  }
  return {
    supplierInform,
    allLoading: loading.effects[`supplierInform/querySupplierList`],
    ...themeConfig,
  };
})
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['sslm.supplyAbility', 'sslm.common'],
})
export default class SupplyCapacityInform extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [], // 选中的rowKeys
      modalVisible: false, // 附件上传模态框
      abilityLineId: null, // 供货能力清单行id
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) onRef(this);
    this.handleSuCapacity();
  }

  /**
   * 查询供货能力清单
   */
  @Bind()
  handleSuCapacity(page = {}) {
    const { dispatch, changeReqId, customizeUnitCode } = this.props;
    dispatch({
      type: 'supplierInform/querySupplierList',
      payload: {
        page,
        changeReqId,
        customizeUnitCode,
      },
    });
  }

  // 监测数据是否变化
  @Bind()
  checkData() {
    const {
      supplierInform: { supplyCapacityList = [] },
    } = this.props;
    const payloadData = getEditTableData(supplyCapacityList, ['_status', 'abilityLineId']);
    const isEdit = !!supplyCapacityList.find(n => n._status === 'create' || n._status === 'update');
    if (isEdit) {
      if (!isEmpty(payloadData)) {
        const newPayloadData = payloadData.map(n => {
          const dateFrom = n.dateFrom && moment(n.dateFrom).format(DEFAULT_DATE_FORMAT);
          const dateTo = n.dateTo && moment(n.dateTo).format(DEFAULT_DATE_FORMAT);
          return { ...n, dateFrom, dateTo };
        });
        return newPayloadData;
      } else {
        notification.warning({
          message: intl
            .get('sslm.common.view.message.supplyCapacityRequiredMsg')
            .d('供货能力清单信息填写有误'),
        });
        return false;
      }
    } else {
      return [];
    }
  }

  /**
   *保存编辑或者新建的数据
   */
  @Bind()
  handleSave() {
    const { dispatch, customizeUnitCode } = this.props;
    const payload = this.checkData();
    if (!isEmpty(payload)) {
      dispatch({
        type: 'supplierInform/saveSupplyCapacity',
        payload: {
          payload,
          customizeUnitCode,
        },
      }).then(res => {
        if (res) {
          notification.success();
          this.handleSuCapacity();
        }
      });
    }
  }

  /**
   * 新建
   */
  @Bind()
  handleAdd() {
    const {
      dispatch,
      changeReqId,
      supplierInform: { supplyCapacityList = [], supplyCapacityPagination = {} },
    } = this.props;
    dispatch({
      type: 'supplierInform/updateState',
      payload: {
        supplyCapacityList: [
          {
            abilityLineId: uuidv4(),
            tenantId: organizationId,
            changeReqId,
            _status: 'create', // 新建标记位
          },
          ...supplyCapacityList,
        ],
        supplyCapacityPagination: addItemToPagination(
          supplyCapacityList.length,
          supplyCapacityPagination
        ),
      },
    });
  }

  /**
   * 清除新建的行
   */
  @Bind()
  handleClean(record) {
    const {
      dispatch,
      supplierInform: { supplyCapacityList = [], supplyCapacityPagination },
    } = this.props;
    const newSupplyList = supplyCapacityList.filter(n => n.abilityLineId !== record.abilityLineId);
    dispatch({
      type: 'supplierInform/updateState',
      payload: {
        supplyCapacityList: newSupplyList,
        supplyCapacityPagination: delItemToPagination(
          supplyCapacityList.length,
          supplyCapacityPagination
        ),
      },
    });
  }

  /**
   * 批量编辑行
   * @param {object} record 每行数据
   */
  @Bind()
  handleEditRow(record) {
    const {
      supplierInform: { supplyCapacityList = [] },
      dispatch,
    } = this.props;
    const newSupplyList = supplyCapacityList.map(item =>
      record.abilityLineId === item.abilityLineId ? { ...item, _status: 'update' } : item
    );
    dispatch({
      type: 'supplierInform/updateState',
      payload: { supplyCapacityList: newSupplyList },
    });
  }

  /**
   * 取消编辑行
   * @param {object} record 行数据
   */
  @Bind()
  handleCancelRow(record) {
    const {
      supplierInform: { supplyCapacityList = [] },
      dispatch,
    } = this.props;
    const newSupplyList = supplyCapacityList.map(item => {
      if (item.abilityLineId === record.abilityLineId) {
        const { _status, ...other } = item;
        return other;
      } else {
        return item;
      }
    });
    dispatch({
      type: 'supplierInform/updateState',
      payload: { supplyCapacityList: newSupplyList },
    });
  }

  /**
   * 删除提示框
   */
  @Bind()
  deleteConfirm(onOk) {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk,
    });
  }

  /**
   * 删除新建行数据
   */
  @Bind()
  deleteNewRows(newList, newRows) {
    const {
      dispatch,
      supplierInform: { supplyCapacityList = [], supplyCapacityPagination = {} },
    } = this.props;
    dispatch({
      type: 'supplierInform/updateState',
      payload: {
        supplyCapacityList: newList,
        supplyCapacityPagination: delItemsToPagination(
          newRows.length,
          supplyCapacityList.length,
          supplyCapacityPagination
        ),
      },
    });
    notification.success();
    this.setState({ selectedRowKeys: [] });
  }

  /**
   * 接口删除
   */
  @Bind()
  deleteExistRows(deleteRowKeys) {
    const {
      dispatch,
      supplierInform: { supplyCapacityPagination },
    } = this.props;
    dispatch({
      type: 'supplierInform/deleteSupplyCapacity',
      payload: deleteRowKeys,
    }).then(res => {
      if (res) {
        notification.success();
        this.setState({ selectedRowKeys: [] });
        this.handleSuCapacity(supplyCapacityPagination);
      }
    });
  }

  /**
   * 删除行
   */
  @Bind()
  handleDelete() {
    const {
      dispatch,
      supplierInform: { supplyCapacityList, supplyCapacityPagination },
    } = this.props;
    const { selectedRowKeys } = this.state;
    const newSupplyCapacityList = cloneDeep(supplyCapacityList);

    // 根据selectedRowKeys查找出选中行
    const selectedRows = [];
    supplyCapacityList.forEach(i => {
      selectedRowKeys.forEach(j => {
        if (i.abilityLineId === j) {
          selectedRows.push(i);
        }
      });
    });
    if (!isEmpty(selectedRows)) {
      // 选中行的新建行
      const newRows = selectedRows.filter(n => n._status === 'create');
      // 选中行的已有行
      const existRows = selectedRows.filter(n => n._status !== 'create');
      const newList = pullAllBy(newSupplyCapacityList, newRows, 'abilityLineId');
      if (isEmpty(newRows)) {
        this.deleteConfirm(() => this.deleteExistRows(selectedRowKeys));
      } else if (isEmpty(existRows)) {
        this.deleteConfirm(() => this.deleteNewRows(newList, newRows));
      } else {
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
          onOk: () => {
            dispatch({
              type: 'supplierInform/deleteSupplyCapacity',
              payload: existRows.map(n => n.abilityLineId),
            }).then(res => {
              if (res) {
                this.handleSuCapacity(supplyCapacityPagination);
                dispatch({
                  type: 'supplierInform/updateState',
                  payload: {
                    supplyCapacityList: newList,
                  },
                });
                notification.success();
                this.setState({ selectedRowKeys: [] });
              }
            });
          },
        });
      }
    }
  }

  /**
   * 选中项发生变化时的回调
   */
  @Bind()
  handleSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  /**
   *  供货能力清单批量导入
   */
  @Bind()
  handleImport(changeReqId) {
    openTab({
      key: `/sslm/supplier-inform-change/comment-import/SSLM_SUP_CHANGE_ABILITY_LN`,
      title: intl.get('hzero.common.title.batchImport').d('批量导入'),
      search: queryString.stringify({
        key: '/sslm/supplier-inform-change/comment-import/SSLM_SUP_CHANGE_ABILITY_LN',
        action: intl.get('hzero.common.title.batchImport').d('批量导入'),
        auto: true,
        args: JSON.stringify({ changeReqId }),
      }),
    });
  }

  /**
   * 附件上传modal框
   */
  @Bind()
  handleAttamentModal(record = {}) {
    const { modalVisible } = this.state;
    const { changFlag } = this.props;
    const { abilityLineId, supplyReviewStatus } = record;
    if (modalVisible && !changFlag) {
      this.handleSuCapacity();
    }
    this.setState({ modalVisible: !modalVisible, abilityLineId, supplyReviewStatus });
  }

  render() {
    const { selectedRowKeys, modalVisible, abilityLineId, supplyReviewStatus } = this.state;
    const {
      pubEdit,
      changeReqId,
      supplierInform: { supplyCapacityList = [], detailHeader = {}, supplyCapacityPagination = {} },
      changFlag,
      allLoading,
      customizeTable,
      customizeBtnGroup = () => {},
      savePermissionFlag,
      linkColor,
    } = this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleSelectChange,
      getCheckboxProps: () => ({
        disabled: changFlag,
      }),
    };
    const attachmentModalProps = {
      changeReqId,
      isVisible: modalVisible,
      viewOnly: (!changFlag && savePermissionFlag) || supplyReviewStatus === 'REVIEWING',
      abilityLineId,
      supplyCapacityPagination,
      attCustomizeCode: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.ABILITY_LINE_ATTACHMENT',
      onCancel: this.handleAttamentModal,
      onQuery: this.handleSuCapacity,
    };
    const isSave = supplyCapacityList.filter(o => o._status === 'create' || o._status === 'update');
    const columns = [
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            return (
              <FormItem>
                {record.$form.getFieldDecorator('itemId', {
                  initialValue: record.itemId,
                })}
                {getFieldDecorator('itemCode', {
                  rules: [
                    {
                      required: !getFieldValue('categoryCode'),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sslm.supplyAbility.model.supplyAbility.itemCode`)
                          .d('物料编码'),
                      }),
                    },
                  ],
                  initialValue: val,
                })(
                  <Lov
                    disabled={changFlag}
                    code="SMDM.CUSTOMER_ITEM"
                    textField="itemCode"
                    textValue={record.itemCode}
                    lovOptions={{ displayField: 'itemCode', valueField: 'itemCode' }}
                    onChange={(_, lovRecord) => {
                      if (isUndefined(_)) {
                        record.$form.setFieldsValue({
                          itemName: '',
                          itemId: '',
                          categoryId: '',
                          categoryCode: '',
                          categoryName: '',
                        });
                      } else {
                        record.$form.setFieldsValue({
                          itemName: lovRecord.itemName,
                          itemId: lovRecord.itemId,
                          categoryId: lovRecord.itemCategoryId,
                          categoryCode: lovRecord.itemCategoryCode,
                          categoryName: lovRecord.itemCategoryName,
                        });
                      }
                    }}
                  />
                )}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.itemName`).d('物料描述'),
        dataIndex: 'itemName',
        width: 160,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('itemName', {
                initialValue: val,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCategoryCode`).d('品类代码'),
        dataIndex: 'categoryCode',
        width: 120,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            return (
              <FormItem>
                {record.$form.getFieldDecorator('categoryId', {
                  initialValue: record.categoryId,
                })}
                {getFieldDecorator('categoryCode', {
                  rules: [
                    {
                      required: !getFieldValue('itemCode'),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sslm.supplyAbility.model.supplyAbility.itemCategoryCode`)
                          .d('品类代码'),
                      }),
                    },
                  ],
                  initialValue: val,
                })(
                  <Lov
                    disabled={changFlag}
                    code="SMDM.CATEGORY.LEVEL_CONTROL_TREE"
                    queryParams={{
                      hzeroUIFlag: 1,
                      tenantId: getCurrentOrganizationId(),
                      businessObjectCode: 'SRM_C_SRM_SSLM_SUPPLY_ABILITY',
                    }}
                    textField="categoryCode"
                    textValue={record.categoryCode}
                    lovOptions={{
                      displayField: 'categoryCode',
                      valueField: 'categoryCode',
                    }}
                    onChange={(_, lovRecord) => {
                      if (isUndefined(_)) {
                        record.$form.setFieldsValue({
                          categoryName: '',
                          categoryCode: '',
                          categoryId: '',
                        });
                      } else {
                        record.$form.setFieldsValue({
                          categoryCode: lovRecord.categoryCode,
                          categoryName: lovRecord.categoryName,
                          categoryId: lovRecord.categoryId,
                        });
                      }
                    }}
                    tableDsProps={{
                      record: {
                        dynamicProps: {
                          selectable: lovRecord => lovRecord.get('isCheck') !== false,
                        },
                      },
                    }}
                    tableProps={{
                      treeAsync: true,
                      alwaysShowRowBox: true,
                      virtual: true,
                      virtualCell: true,
                      onRow: ({ record: lovRecord }) => {
                        const nodeProps = {};
                        if (lovRecord.get('hasChild') === '0') {
                          nodeProps.isLeaf = true;
                        }
                        return nodeProps;
                      },
                    }}
                    onBeforeSelect={lovRecord => {
                      const { selectable } = lovRecord || {};
                      return selectable;
                    }}
                  />
                )}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCategoryDesc`).d('品类描述'),
        dataIndex: 'categoryName',
        width: 160,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('categoryName', {
                initialValue: record.categoryName,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.supplyFlag`).d('是否可供'),
        width: 100,
        dataIndex: 'supplyFlag',
        render: (val, record) => {
          if (record._status === 'create' || record._status === 'update') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('supplyFlag', {
                  initialValue: record.supplyFlag === 0 ? 0 : 1,
                })(<Checkbox disabled={changFlag} />)}
              </Form.Item>
            );
          } else {
            return yesOrNoRender(val);
          }
        },
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.oneTimeFlag`).d('是否一次性供货'),
        width: 120,
        dataIndex: 'oneTimeFlag',
        render: (val, record) => {
          if (record._status === 'create' || record._status === 'update') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('oneTimeFlag', {
                  initialValue: record.oneTimeFlag === 0 ? 0 : 1,
                })(<Checkbox disabled={changFlag} />)}
              </Form.Item>
            );
          } else {
            return yesOrNoRender(val);
          }
        },
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.adapterProducts`).d('适配产品'),
        dataIndex: 'adapterProducts',
        width: 120,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('adapterProducts', {
                  initialValue: val,
                })(<Input disabled={changFlag} />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('sslm.supplyAbility.model.supplyAbility.countryIdMeaning').d('服务国家'),
        width: 150,
        dataIndex: 'countryIdMeaning',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, setFieldsValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('countryId', {
                  initialValue: record.countryId,
                })(
                  <Lov
                    disabled={changFlag}
                    code="HPFM.COUNTRY"
                    lovOptions={{ displayField: 'countryName', valueField: 'countryId' }}
                    textValue={record.countryIdMeaning}
                    onChange={(_, lovRecord) => {
                      setFieldsValue({
                        countryCode: lovRecord.countryCode,
                        countryIdMeaning: undefined,
                        regionId: undefined,
                        cityId: undefined,
                      });
                    }}
                    onClear
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('sslm.supplyAbility.model.supplyAbility.regionIdMeaning').d('服务地区'),
        width: 150,
        dataIndex: 'regionIdMeaning',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, setFieldsValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('regionId', {
                  initialValue: record.regionId,
                })(
                  <Lov
                    code="HPFM.REGION"
                    disabled={changFlag || !record.$form.getFieldValue('countryId')}
                    lovOptions={{
                      displayField: 'regionName',
                      valueField: 'regionId',
                    }}
                    queryParams={{
                      countryId: record.$form.getFieldValue('countryId'),
                    }}
                    textValue={val}
                    onChange={(value, lovRecord) => {
                      setFieldsValue({
                        regionCode: lovRecord.regionCode,
                        regionId: undefined,
                        cityId: undefined,
                      });
                    }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('sslm.supplyAbility.model.supplyAbility.cityIdMeaning').d('服务城市'),
        width: 150,
        dataIndex: 'cityIdMeaning',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('cityId', {
                  initialValue: record.cityId,
                })(
                  <Lov
                    disabled={changFlag || !record.$form.getFieldValue('regionId')}
                    code="HPFM.REGION"
                    textValue={val}
                    queryParams={{
                      parentRegionId: record.$form.getFieldValue('regionId'),
                    }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.dateFrom`).d('有效期从'),
        width: 120,
        dataIndex: 'dateFrom',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue, setFieldsValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('dateFrom', {
                  initialValue: record.dateFrom && moment(record.dateFrom, DEFAULT_DATE_FORMAT),
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
                    onChange={date => {
                      if (!date) {
                        setFieldsValue({ dateTo: null });
                      }
                    }}
                    disabled={changFlag}
                    disabledDate={currentDate =>
                      getFieldValue('dateTo') &&
                      moment(getFieldValue('dateTo')).isBefore(currentDate, 'day')
                    }
                  />
                )}
              </Form.Item>
            );
          } else {
            return dateRender(val);
          }
        },
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.dateTo`).d('有效期至'),
        width: 120,
        dataIndex: 'dateTo',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue, setFieldsValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('dateTo', {
                  initialValue: record.dateTo && moment(record.dateTo, DEFAULT_DATE_FORMAT),
                  rules: [
                    {
                      required: getFieldValue('dateFrom'),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sslm.supplyAbility.model.supplyAbility.dateTo`)
                          .d('有效期至'),
                      }),
                    },
                  ],
                })(
                  <DatePicker
                    disabled={changFlag}
                    placeholder=""
                    style={{ width: '100%' }}
                    format={dateFormat}
                    onChange={date => {
                      if (!date) {
                        setFieldsValue({ dateFrom: null });
                      }
                    }}
                    disabledDate={currentDate =>
                      getFieldValue('dateFrom') &&
                      moment(getFieldValue('dateFrom')).isAfter(currentDate, 'day')
                    }
                  />
                )}
              </Form.Item>
            );
          } else {
            return dateRender(val);
          }
        },
      },
      {
        title: intl
          .get(`sslm.supplyAbility.model.supplyAbility.inventoryOrganization`)
          .d('库存组织'),
        dataIndex: 'inventoryOrganizationId',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('inventoryOrganizationId', {
                  initialValue: val,
                })(
                  <LovMulti
                    viewOnly={changFlag}
                    code="SSLM.INV_ORGANIZATION"
                    translateData={record.inventoryOrganizationMeaning}
                  />
                )}
              </Form.Item>
            );
          } else {
            return (
              <LovMulti
                code="SSLM.INV_ORGANIZATION"
                value={record.inventoryOrganizationId}
                viewOnly
              />
            );
          }
        },
      },
      {
        title: intl
          .get(`sslm.supplyAbility.model.supplyAbility.purchasingOrganization`)
          .d('采购组织'),
        dataIndex: 'purchaseOrganizationId',
        width: 150,
        render: (_, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, setFieldsValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('purchaseOrganizationId', {
                  initialValue: record.purchaseOrganizationId,
                })(
                  <Lov
                    disabled={changFlag}
                    code="SPFM.USER_AUTH.PURORG"
                    lovOptions={{
                      displayField: 'organizationName',
                      valueField: 'purchaseOrgId',
                    }}
                    textValue={record.purchaseOrganizationName}
                    onChange={(_val, lovRecord) => {
                      setFieldsValue({
                        purchaseOrganizationCode: lovRecord.organizationCode,
                        purchaseOrganizationName: lovRecord.organizationName,
                        purchaseOrganizationId: lovRecord.purchaseOrgId,
                      });
                    }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return record.purchaseOrganizationName;
          }
        },
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.manufacturer`).d('生产厂家'),
        dataIndex: 'manufacturer',
        width: 150,
        render: (_, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('manufacturer', {
                  initialValue: record.manufacturer,
                })(<Input disabled={changFlag} />)}
              </Form.Item>
            );
          } else {
            return record.manufacturer;
          }
        },
      },
      {
        title: intl.get('hzero.common.upload.modal.title').d('附件'),
        dataIndex: 'attachment',
        width: 130,
        render: (_, record) => (
          <PerButton
            type="text"
            onClick={() => this.handleAttamentModal(record)}
            disabled={record._status === 'create' || record._status === 'update'}
            permissionList={[
              {
                code: 'srm.partner.my-partner.supplier-inform-change.ps.capacity.edit',
                type: 'button',
                meaning: '供货能力清单-上传附件',
              },
            ]}
          >
            {renderAttachmentText({
              editable: !(
                changFlag ||
                !savePermissionFlag ||
                record.supplyReviewStatus === 'REVIEWING'
              ),
              fileCount: record.fileCount,
              linkColor,
            })}
          </PerButton>
        ),
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'remark',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('remark', {
                  initialValue: val,
                  rules: [
                    {
                      max: 120,
                      message: intl.get('hzero.common.validation.max', {
                        max: 120,
                      }),
                    },
                  ],
                })(<Input disabled={changFlag} />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 75,
        dataIndex: 'option',
        render: (val, record) => (
          <span className="action-link">
            {record._status === 'update' && (
              <a onClick={() => this.handleCancelRow(record)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            )}
            {!(record._status === 'create') && !(record._status === 'update') && (
              <PerButton
                type="text"
                onClick={() => this.handleEditRow(record)}
                disabled={
                  pubEdit
                    ? !pubEdit
                    : changFlag || record.supplyReviewStatus === 'REVIEWING' || !savePermissionFlag
                }
                permissionList={[
                  {
                    code: 'srm.partner.my-partner.supplier-inform-change.ps.capacity.edit',
                    type: 'button',
                    meaning: '供货能力清单-操作',
                  },
                ]}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </PerButton>
            )}
            {record._status === 'create' && (
              <a disabled={changFlag} onClick={() => this.handleClean(record)}>
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            )}
          </span>
        ),
      },
    ].filter(Boolean);

    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));

    return (
      <Fragment>
        <div
          className={styles['table-list-btn']}
          style={{
            textAlign: 'right',
            display: changFlag || !savePermissionFlag ? 'none' : 'block',
          }}
        >
          {customizeBtnGroup(
            {
              // code: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.SUPPLY_CAPACITY.BTN_GROUP',
              code: '',
            },
            [
              <CommonImport
                data-name="commonImport"
                businessObjectTemplateCode="SSLM_SUP_CHANGE_ABILITY_LN"
                prefixPatch={SRM_SSLM}
                refreshButton
                buttonText={intl.get('hzero.common.title.batchImport').d('批量导入')}
                buttonProps={{
                  icon: '',
                  type: 'h0',
                  loading: allLoading,
                  permissionList: [
                    {
                      code:
                        'srm.partner.my-partner.supplier-inform-change.ps.supply.ability.import.model',
                      type: 'button',
                      meaning: '供货能力清单-导入',
                    },
                  ],
                }}
                args={{ changeReqId: detailHeader.changeReqId }}
                successCallBack={() => {
                  this.handleSuCapacity();
                }}
              />,
              <PerButton
                icon=""
                loading={allLoading}
                onClick={() => {
                  this.handleImport(detailHeader.changeReqId);
                }}
                permissionList={[
                  {
                    code:
                      'srm.partner.my-partner.supplier-inform-change.ps.supply.ability.import.old',
                    type: 'button',
                    meaning: '供货能力清单-导入',
                  },
                ]}
              >
                {intl.get('hzero.common.title.batchImport').d('批量导入')}
              </PerButton>,
              <PerButton
                loading={allLoading}
                disabled={isEmpty(selectedRowKeys)}
                onClick={this.handleDelete}
                permissionList={[
                  {
                    code: 'srm.partner.my-partner.supplier-inform-change.ps.capacity.delete',
                    type: 'button',
                    meaning: '供货能力清单-删除',
                  },
                ]}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </PerButton>,
              <Button onClick={this.handleSave} disabled={isEmpty(isSave)} loading={allLoading}>
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>,
              <PerButton
                type="primary"
                loading={allLoading}
                onClick={this.handleAdd}
                permissionList={[
                  {
                    code: 'srm.partner.my-partner.supplier-inform-change.ps.capacity.add',
                    type: 'button',
                    meaning: '供货能力清单-新建',
                  },
                ]}
              >
                {intl.get(`hzero.common.button.create`).d('新建')}
              </PerButton>,
            ]
          )}
        </div>
        {customizeTable(
          {
            code: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.CHANGE_ABILITY_LINE_TABLE',
            clearCache: (a, b, cb) => {
              if (a !== b) cb(a);
            },
            useNewValid: true,
          },
          <EditTable
            bordered
            rowKey="abilityLineId"
            columns={columns}
            rowSelection={changFlag || !savePermissionFlag ? null : rowSelection}
            dataSource={supplyCapacityList}
            scroll={{ x: scrollX }}
            loading={allLoading}
            pagination={supplyCapacityPagination}
            onChange={this.handleSuCapacity}
          />
        )}
        {/* 上传附件模态框 */}
        {modalVisible && <AttachmentModal {...attachmentModalProps} />}
      </Fragment>
    );
  }
}
