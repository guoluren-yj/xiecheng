import React, { Component } from 'react';
import {
  Form,
  InputNumber,
  Input,
  Select,
  DatePicker,
  Modal,
  Popover,
  Button,
  Table,
} from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isEmpty, isArray } from 'lodash';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import { numberRender, dateRender } from 'utils/renderer';
import { getDateFormat, getEditTableData, getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import TransferWrapper from './TransferWrapper';

const { Option } = Select;
const promptCode = 'ssrc.searchResultImport';
const { TextArea } = Input;

// 处理数据
const dealWithData = (data, fieldName, titleName) => {
  const temp = data.map((item) => {
    return {
      ...item,
      key: item[fieldName],
      title: item[titleName],
    };
  });
  return temp;
};

@connect(({ inquiryHall, searchResultImport, loading }) => ({
  inquiryHall,
  searchResultImport,
  organizationId: getCurrentOrganizationId(),
  Loading: loading.effects['searchResultImport/fetchModleList'],
  importToErpLoading: loading.effects['searchResultImport/sourceImportToErp'],
  entityLoading: loading.effects['searchResultImport/fetchGetBusinessOu'], // 获取业务实体
  orgLoading: loading.effects['searchResultImport/fetchGetInventoryOrg'], // 获取库存组织
  createSourceResultLoading: loading.effects['searchResultImport/fetchCreateSourceResult'], // 创建复制行数据temp
  saveSourceResultLoading: loading.effects['searchResultImport/fetchSaveSourceResult'], // 修改复制行数据temp
  querySourceResultLoading: loading.effects['searchResultImport/fetchQuerySourceResult'], // 查询复制行数据temp
  importErpWithSourceResultLoading:
    loading.effects['searchResultImport/fetchImportErpWithSourceResult'], // 查询复制行数据temp
}))
export default class QuotedPriceModel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowNextStepBtn: true,
      entityAllField: [], // 业务实体数据源
      entitySelectFieldList: [], // 业务实体勾选数据
      orgAllField: [], // 库存组织数据源
      orgSelectFieldList: [], // 库存组织勾选数据
      impErrModalVisible: false,
      operationUnitList: [], // 业务实体不匹配的数据源
      operationInvOrgList: [], // 库存组织不匹配的数据源
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    this.fetchData();
    // 查询配置中心
    dispatch({
      type: 'inquiryHall/querySetting',
      payload: {
        '011115': '011115',
      },
    });
    this.handleGetBusinessOu();
    this.handleGetInventoryOrg();
  }

  @Bind()
  fetchData() {
    const { resultImportSelectedRowKeys, dispatch, organizationId, activeKey } = this.props;
    if (!resultImportSelectedRowKeys || resultImportSelectedRowKeys.length === 0) {
      dispatch({
        type: 'searchResultImport/updateState',
        payload: {
          modelList: [],
        },
      });
    } else {
      dispatch({
        type: 'searchResultImport/fetchModleList',
        payload: {
          organizationId,
          systemType: activeKey,
          resultIds: resultImportSelectedRowKeys,
        },
      });
    }
  }

  /**
   * 穿梭框变更
   * @param {Array} targetKeys - 右侧已勾选数据
   */
  @Bind()
  handleChange(activeKey, targetKeys) {
    this.setState({
      [activeKey === 'businessEntity' ? 'entitySelectFieldList' : 'orgSelectFieldList']: targetKeys,
    });
  }

  /**
   * 切换tab页签
   * @param {string} activeKey - change后tab对应的key
   */
  @Bind()
  handleCleanData(activeKey) {
    if (activeKey === 'businessEntity') {
      // 切换业务实体, 需要清空库存组织已勾选数据
      this.setState({
        orgSelectFieldList: [],
      });
    } else {
      // 切换库存组织, 需要清空业务实体已勾选数据
      this.setState({
        entitySelectFieldList: [],
      });
    }
  }

  // 获取业务实体
  handleGetBusinessOu() {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'searchResultImport/fetchGetBusinessOu',
      payload: {
        organizationId,
        page: 0,
        size: 9999,
      },
    }).then((result) => {
      if (result) {
        this.setState({
          entityAllField: dealWithData(result.content || [], 'ouId', 'ouName'),
        });
      }
    });
  }

  // 获取库存组织
  handleGetInventoryOrg() {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'searchResultImport/fetchGetInventoryOrg',
      payload: {
        organizationId,
        page: 0,
        size: 9999,
      },
    }).then((result) => {
      if (result) {
        this.setState({
          orgAllField: dealWithData(result.content || [], 'organizationId', 'organizationName'),
        });
      }
    });
  }

  /**
   * 获取勾选框数据
   * @param {Array} dataSource - 行内编辑数据源
   * @returns data - 接口所需数据
   */
  getEditTableDataWithEmptyFields(dataSource = []) {
    const data = dataSource.map((item) => {
      const form = item.$form;
      const {
        quotationExpiryDateFrom,
        quotationExpiryDateTo,
        validPromisedDate,
      } = form.getFieldsValue();
      return {
        ...item,
        ...form.getFieldsValue(),
        validPromisedDate: validPromisedDate
          ? moment(validPromisedDate).format(DEFAULT_DATETIME_FORMAT)
          : undefined,
        quotationExpiryDateFrom: quotationExpiryDateFrom
          ? moment(quotationExpiryDateFrom).format(DEFAULT_DATETIME_FORMAT)
          : undefined,
        quotationExpiryDateTo: quotationExpiryDateTo
          ? moment(quotationExpiryDateTo).format(DEFAULT_DATETIME_FORMAT)
          : undefined,
      };
    });
    return data;
  }

  // 根据业务实体/库存组织以及外层勾选数据, 来创建复制数据
  @Bind()
  handleCreateSourceResult() {
    const { dispatch, organizationId, resultImportSelectedRowKeys = [] } = this.props;
    const {
      entityAllField = [],
      entitySelectFieldList = [],
      orgAllField = [],
      orgSelectFieldList = [],
    } = this.state;
    if (isEmpty(entitySelectFieldList) && isEmpty(orgSelectFieldList)) {
      notification.warning({
        message: intl
          .get(`${promptCode}.view.message.nextStepValidateMsg`)
          .d('请选择业务实体或库存组织'),
      });
      return;
    }
    // const temp = this.getEditTableDataWithEmptyFields(selectRows);
    const operationUnitDTOS = entityAllField.filter(
      (item) => entitySelectFieldList.indexOf(item.ouId) > -1
    );
    const operationInvOrgDTOS = orgAllField.filter(
      (item) => orgSelectFieldList.indexOf(item.organizationId) > -1
    );
    // 拿到外层勾选框数据
    dispatch({
      type: 'searchResultImport/fetchCreateSourceResult',
      payload: {
        organizationId,
        operationUnitDTOS, // 业务实体
        operationInvOrgDTOS, // 库存组织
        // listResultsDTOList: temp, // 勾选框数据
        resultIds: resultImportSelectedRowKeys, // 外层勾选框数据
      },
    }).then((res) => {
      if (res) {
        const {
          operationUnitDTOS: operationUnitList = [],
          operationInvOrgDTOS: operationInvOrgList = [],
        } = res;
        this.setState(
          {
            operationUnitList: isArray(operationUnitList)
              ? operationUnitList.map((item) => ({
                  rowKey: item.itemId + item.ouId,
                  ...item,
                }))
              : [],
            operationInvOrgList: isArray(operationInvOrgList)
              ? operationInvOrgList.map((item) => ({
                  rowKey: item.itemId + item.organizationId,
                  ...item,
                }))
              : [],
            isShowNextStepBtn: false,
            impErrModalVisible: !isEmpty(operationUnitList) || !isEmpty(operationInvOrgList),
          },
          () => {
            this.handleQuerySourceResult();
          }
        );
      }
    });
  }

  // 查询复制数据
  handleQuerySourceResult(page = {}) {
    const {
      dispatch,
      organizationId,
      searchResultImport: { sourceResultTempList = [] },
    } = this.props;

    if (!isEmpty(page)) {
      // 切换分页时, 需要先保存再查询
      // 直接保存数据
      const tempData = this.getEditTableDataWithEmptyFields(sourceResultTempList);
      dispatch({
        type: 'searchResultImport/fetchSaveSourceResult',
        payload: {
          tempData,
          organizationId,
        },
      }).then((res) => {
        if (res) {
          dispatch({
            type: 'searchResultImport/fetchQuerySourceResult',
            payload: {
              page,
              organizationId,
            },
          });
        }
      });
    } else {
      dispatch({
        type: 'searchResultImport/fetchQuerySourceResult',
        payload: {
          page,
          organizationId,
        },
      });
    }
  }

  // 保存复制数据
  @Bind()
  handleSaveSourceResult() {
    const { dispatch } = this.props;
    dispatch({
      type: 'searchResultImport/fetchSaveSourceResult',
      payload: {},
    });
  }

  // 返回业务实体/库存组织页面
  @Bind()
  handleBackSelectPage() {
    this.setState({
      isShowNextStepBtn: true,
    });
  }

  // 导入erp
  @Bind()
  handleImportErp() {
    const {
      dispatch,
      onSearch,
      organizationId,
      onAfterImportErp,
      searchResultImport: { sourceResultTempList = [], sourceResultTempPagination = {} },
    } = this.props;
    // const tempData = this.getEditTableDataWithEmptyFields(sourceResultTempList);
    const data = getEditTableData(sourceResultTempList, 'resultTempId');
    if (isEmpty(data)) {
      notification.warning({
        message: intl.get(`${promptCode}.view.message.requiredFields`).d('检验不通过，必输项必填'),
      });
    } else {
      const tempData = data.map((item) => {
        const { quotationExpiryDateFrom, quotationExpiryDateTo, validPromisedDate } = item;
        return {
          ...item,
          validPromisedDate: validPromisedDate
            ? moment(validPromisedDate).format(DEFAULT_DATETIME_FORMAT)
            : undefined,
          quotationExpiryDateFrom: quotationExpiryDateFrom
            ? moment(quotationExpiryDateFrom).format(DEFAULT_DATETIME_FORMAT)
            : undefined,
          quotationExpiryDateTo: quotationExpiryDateTo
            ? moment(quotationExpiryDateTo).format(DEFAULT_DATETIME_FORMAT)
            : undefined,
        };
      });
      dispatch({
        type: 'searchResultImport/fetchSaveSourceResult',
        payload: {
          tempData,
          organizationId,
        },
      }).then((res) => {
        if (res) {
          dispatch({
            type: 'searchResultImport/fetchQuerySourceResult',
            payload: {
              organizationId,
              page: sourceResultTempPagination,
            },
          }); // 需要刷新数据
          dispatch({
            type: 'searchResultImport/fetchImportErpWithSourceResult',
            payload: {
              organizationId,
              systemType: sourceResultTempList[0] && sourceResultTempList[0].systemType,
            },
          }).then((result) => {
            if (result) {
              notification.success();
              // 刷新外层列表数据
              onAfterImportErp();
              onSearch();
            }
          });
        }
      });
    }
  }

  // 关闭物料不匹配导入失败的弹窗
  @Bind()
  handleCloseImpErrModal() {
    this.setState({
      impErrModalVisible: false,
    });
  }

  render() {
    const {
      code,
      cancle,
      visible,
      onDetail,
      tableType,
      changeOuId,
      organizationId,
      changeSupplierId,
      viewLadderLevelModal,
      changeInvOrganization,
      changeSupplierLocation,
      entityLoading = false,
      orgLoading = false,
      createSourceResultLoading = false,
      saveSourceResultLoading = false,
      querySourceResultLoading = false,
      importErpWithSourceResultLoading = false,
      searchResultImport: { sourceResultTempList = [], sourceResultTempPagination = {} },
    } = this.props;
    const {
      isShowNextStepBtn,
      impErrModalVisible,
      entityAllField = [],
      entitySelectFieldList = [],
      orgAllField = [],
      orgSelectFieldList = [],
      operationUnitList = [],
      operationInvOrgList = [],
    } = this.state;
    const transferWrapperProps = {
      entityLoading,
      orgLoading,
      entityAllField,
      entitySelectFieldList,
      orgAllField,
      orgSelectFieldList,
      onCleanData: this.handleCleanData,
      onChange: this.handleChange,
    };
    let columns = [];
    if (tableType === 'SAP') {
      columns = [
        {
          title: intl.get(`${promptCode}.model.searchResImt.syncStatus`).d('导入状态'),
          dataIndex: 'syncStatusMeaning',
          width: 100,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.erpNumber`).d('采购信息记录编号'),
          dataIndex: 'erpNumber',
          width: 150,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.syncResponseMsg`).d('反馈信息'),
          dataIndex: 'syncResponseMsg',
          width: 120,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.purchaseAgentNameGroup`).d('采购组'),
          dataIndex: 'purchaseAgentName',
          width: 120,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) ? (
              <Form.Item>
                {record.$form.getFieldDecorator('purchaseAgentId', {
                  initialValue: record.purchaseAgentId,
                })(
                  <Lov code="SPFM.USER_AUTH.PURCHASE_AGENT" textValue={record.purchaseAgentName} />
                )}
              </Form.Item>
            ) : (
              record.purchaseAgentName
            ),
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.purOrgCode`).d('采购组织编码'),
          dataIndex: 'purOrganizationCode',
          width: 140,
          render: (val, record) => {
            if (['update', 'create'].includes(record._status)) {
              const form = record.$form;
              // 供应商改变，给相应的来源外部系统赋值
              const onChangePurOrganizationCode = (_, value) => {
                form.setFieldsValue({
                  purOrganizationName: value.organizationName,
                  purOrganizationId: value.purchaseOrgId,
                  purchaseOrgId: value.purchaseOrgId,
                });
              };
              return (
                <React.Fragment>
                  <Form.Item>
                    {record.$form.getFieldDecorator('purchaseOrgId', {
                      initialValue: record.purchaseOrgId,
                    })(
                      <Lov
                        code="SPFM.USER_AUTH.PURCHASE_ORG"
                        onChange={onChangePurOrganizationCode}
                        textValue={record.purOrganizationCode}
                      />
                    )}
                    {record.$form.getFieldDecorator('purOrganizationId', {
                      initialValue: record.purOrganizationId,
                    })}
                  </Form.Item>
                </React.Fragment>
              );
            } else {
              return record.purOrganizationCode;
            }
          },
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.purOrgName`).d('采购组织名称'),
          dataIndex: 'purOrganizationName',
          width: 150,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) ? (
              <Form.Item>
                {record.$form.getFieldDecorator('purOrganizationName', {
                  initialValue: val,
                })(<Input disabled />)}
              </Form.Item>
            ) : (
              val
            ),
        },
        // {
        //   title: intl.get(`${promptCode}.model.searchResImt.purchaseAgentName`).d('采购员'),
        //   dataIndex: 'purchaseAgentName',
        //   width: 120,
        //   render: (val, record) =>
        //     ['update', 'create'].includes(record._status) ? (
        //       <Form.Item>
        //         {record.$form.getFieldDecorator('purchaseAgentId', {
        //           initialValue: record.purchaseAgentId,
        //         })(<Lov code="SPFM.USER_AUTH.PURCHASE_AGENT" textValue={record.purchaseAgentName} />)}
        //       </Form.Item>
        //     ) : (
        //       record.purchaseAgentName
        //     ),
        // },
        {
          title: intl.get(`${promptCode}.model.searchResImt.ouName`).d('业务实体'),
          dataIndex: 'ouName',
          width: 150,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) ? (
              <Form.Item>
                {record.$form.getFieldDecorator('ouId', {
                  initialValue: record.ouId,
                })(
                  <Lov
                    code="SPFM.USER_AUTH.OU"
                    textField="ouName"
                    onChange={(value, dataList) => changeOuId(value, dataList, record)}
                  />
                )}
                {record.$form.getFieldDecorator('ouName', { initialValue: record.ouName })}
                {record.$form.getFieldDecorator('ouCode', { initialValue: record.ouCode })}
              </Form.Item>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.invOrgs`).d('库存组织'),
          dataIndex: 'invOrganizationName',
          width: 150,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) ? (
              <Form.Item>
                {record.$form.getFieldDecorator('invOrganizationName', {
                  initialValue: record.invOrganizationName,
                })(
                  <Lov
                    code="HPFM.INV_ORG"
                    textValue={record.invOrganizationName}
                    queryParams={{
                      ouId: record.$form.getFieldValue('ouId'),
                      enabledFlag: 1,
                      organizationId,
                    }}
                    onChange={(value, dataList) => changeInvOrganization(value, dataList, record)}
                  />
                )}
                {record.$form.getFieldDecorator('invOrganizationId', {
                  initialValue: record.invOrganizationId,
                })}
              </Form.Item>
            ) : (
              record.invOrganizationName
            ),
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.ERPsupplierName`).d('ERP供应商名称'),
          dataIndex: 'supplierName',
          width: 150,
          render: (val, record) => {
            if (
              ['update', 'create'].includes(record._status) &&
              record.syncStatus !== 'SYNCHRONIZING' &&
              record.syncStatus !== 'SYNCHRONIZED'
            ) {
              const form = record.$form;
              // 供应商改变，给相应的来源外部系统赋值
              const onChange = (_, value) => {
                form.setFieldsValue({
                  externalSystemCode: value.externalSystemCode,
                });
              };
              return (
                <React.Fragment>
                  <Form.Item>
                    {record.$form.getFieldDecorator('supplierId', {
                      initialValue: record.supplierId,
                    })(
                      <Lov
                        code="SSRC.COMPANY_SUPPLIER"
                        onChange={onChange}
                        textValue={record.supplierName}
                        queryParams={{
                          tenantId: organizationId,
                          companyId: record.supplierCompanyId,
                          sourceCode: 'SAP',
                        }}
                      />
                    )}
                  </Form.Item>
                </React.Fragment>
              );
            } else {
              return record.supplierName;
            }
          },
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.extSystemCode`).d('来源外部系统'),
          dataIndex: 'externalSystemCode',
          width: 120,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) ? (
              <Form.Item>
                {record.$form.getFieldDecorator('externalSystemCode', {
                  initialValue: val,
                })(<Input disabled />)}
              </Form.Item>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.SRMSupplierName`).d('SRM供应商名称'),
          dataIndex: 'supplierCompanyName',
          width: 140,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.infoType`).d('信息类别'),
          dataIndex: 'infoTypeMeaning',
          width: 120,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) &&
            record.syncStatus !== 'SYNCHRONIZING' &&
            record.syncStatus !== 'SYNCHRONIZED' ? (
              <Form.Item>
                {record.$form.getFieldDecorator('infoType', {
                  initialValue: record.infoType,
                })(
                  <Select style={{ width: '100%' }}>
                    {code.infoType &&
                      code.infoType.map((index) => (
                        <Option key={index.value} value={index.value}>
                          {index.meaning}
                        </Option>
                      ))}
                  </Select>
                )}
              </Form.Item>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.categoryName`).d('物料类别'),
          dataIndex: 'categoryName',
          width: 100,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.itemCode`).d('物料编码'),
          dataIndex: 'itemCode',
          width: 100,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.itemDescroption`).d('物料名称'),
          dataIndex: 'itemName',
          width: 100,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.unitPrice`).d('单价'),
          dataIndex: 'unitPrice',
          align: 'right',
          width: 80,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.priceUomName`).d('价格单位'),
          dataIndex: 'uomName',
          width: 100,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.baseUomName`).d('基本单位'),
          dataIndex: 'primaryUomName',
          width: 100,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.orderUomName`).d('订单单位'),
          dataIndex: 'orderUomName',
          width: 100,
        },
        // {
        //   title: intl.get(`${promptCode}.model.searchResImt.biUomId`).d('双单位'),
        //   dataIndex: 'biUomName',
        //   width: 100,
        // },
        {
          title: intl
            .get(`${promptCode}.model.searchResImt.baseConversionRatio`)
            .d('转换比例(基本-订单单位)'),
          dataIndex: 'baseUomConversionRate',
          width: 170,
          render: (value, record) => {
            if (record.itemCode) {
              const baseUomConversionRate = `${record.baseOrderRateSub || ''}:${
                record.baseOrderRatePar || ''
              }`;
              return (
                <div>
                  <Form.Item>
                    {record.$form.getFieldDecorator('baseUomConversionRate', {
                      initialValue: baseUomConversionRate,
                      rules: [
                        {
                          pattern: /^([0-9]+(\.[0-9]{1,2})?:[0-9]+(\.[0-9]{1,2})?)$|^:$/,
                          message: intl
                            .get(`${promptCode}.view.conversion.format`)
                            .d('只能输入*: *格式的内容'),
                        },
                      ],
                    })(<Input />)}
                  </Form.Item>
                </div>
              );
            } else {
              return '';
            }
          },
        },
        {
          title: intl
            .get(`${promptCode}.model.searchResImt.priceConversionRatio`)
            .d('转换比例(价格-订单单位)'),
          dataIndex: 'priceUomConversionRate',
          width: 180,
          render: (value, record) => {
            if (record.itemCode) {
              const priceUomConversionRate = `${record.priceOrderRateSub || ''}:${
                record.priceOrderRatePar || ''
              }`;
              return (
                <div>
                  <Form.Item>
                    {record.$form.getFieldDecorator('priceUomConversionRate', {
                      initialValue: priceUomConversionRate,
                      rules: [
                        {
                          pattern: /^([0-9]+(\.[0-9]{1,2})?:[0-9]+(\.[0-9]{1,2})?)$|^:$/,
                          message: intl
                            .get(`${promptCode}.view.conversion.format`)
                            .d('只能输入*: *格式的内容'),
                        },
                      ],
                    })(<Input />)}
                  </Form.Item>
                </div>
              );
            } else {
              return '';
            }
          },
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.priceQuantity`).d('价格批量'),
          dataIndex: 'priceBatchQuantity',
          width: 120,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) &&
            record.syncStatus !== 'SYNCHRONIZING' &&
            record.syncStatus !== 'SYNCHRONIZED' ? (
              <Form.Item>
                {record.$form.getFieldDecorator('priceBatchQuantity', {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.searchResImt.priceQuantity`)
                          .d('价格批量'),
                      }),
                    },
                  ],
                })(<InputNumber min={0} max={99999999999999} style={{ width: '100%' }} />)}
              </Form.Item>
            ) : (
              val
            ),
        },
        // {
        //   title: intl.get(`${promptCode}.model.searchResImt.batchPrice`).d('批量价格'),
        //   dataIndex: 'batchQuantityPrice',
        //   align: 'right',
        //   width: 100,
        // },
        {
          title: intl.get(`${promptCode}.model.searchResImt.taxCode`).d('税码'),
          dataIndex: 'taxCode',
          width: 80,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.taxRate(%)`).d('税率(%)'),
          dataIndex: 'taxRate',
          width: 80,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.currencyCode`).d('币种'),
          dataIndex: 'currencyCode',
          width: 80,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.exchangeRate`).d('汇率'),
          dataIndex: 'rate',
          width: 80,
          render: (val) => numberRender(val, 8, false),
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.quoExpDateFrom`).d('报价有效期从'),
          dataIndex: 'quotationExpiryDateFrom',
          width: 150,
          // render: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
          render: (value, record) => {
            return ['update', 'create'].includes(record._status) ? (
              <Form.Item>
                {record.$form.getFieldDecorator('quotationExpiryDateFrom', {
                  initialValue: value && moment(value),
                  // rules: [
                  //   {
                  //     required: true,
                  //     message: intl.get('hzero.common.validation.notNull', {
                  //       name: intl
                  //         .get(`${promptCode}.model.searchResImt.quoExpDateFrom`)
                  //         .d('报价有效期从'),
                  //     }),
                  //   },
                  // ],
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    format={getDateFormat()}
                    placeholder={null}
                    disabledDate={(currentDate) =>
                      (record.$form.getFieldValue('quotationExpiryDateTo') &&
                        moment(record.$form.getFieldValue('quotationExpiryDateTo')).isBefore(
                          currentDate,
                          'day'
                        )) ||
                      moment().isAfter(currentDate, 'day')
                    }
                  />
                )}
              </Form.Item>
            ) : (
              value && moment(value)
            );
          },
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.quoExpDateTo`).d('报价有效期至'),
          dataIndex: 'quotationExpiryDateTo',
          width: 150,
          render: (value, record) => {
            return ['update', 'create'].includes(record._status) ? (
              <Form.Item>
                {record.$form.getFieldDecorator('quotationExpiryDateTo', {
                  initialValue: value && moment(value),
                  // rules: [
                  //   {
                  //     required: true,
                  //     message: intl.get('hzero.common.validation.notNull', {
                  //       name: intl
                  //         .get(`${promptCode}.model.searchResImt.quoExpDateTo`)
                  //         .d('报价有效期至'),
                  //     }),
                  //   },
                  // ],
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    format={getDateFormat()}
                    placeholder={null}
                    disabledDate={(currentDate) =>
                      (record.$form.getFieldValue('quotationExpiryDateFrom') &&
                        moment(record.$form.getFieldValue('quotationExpiryDateFrom')).isAfter(
                          currentDate,
                          'day'
                        )) ||
                      moment().isAfter(currentDate, 'day')
                    }
                  />
                )}
              </Form.Item>
            ) : (
              value && moment(value)
            );
          },
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.sourceType`).d('寻源类型'),
          dataIndex: 'sourceTypeMeaning',
          width: 100,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.priceCategory`).d('价格类型'),
          dataIndex: 'priceCategoryMeaning',
          width: 100,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.sourceFromNumber`).d('来源单号'),
          dataIndex: 'sourceNum',
          width: 160,
          render: (val, record) => <a onClick={() => onDetail(record)}>{val}</a>,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.lineNo`).d('行号'),
          dataIndex: 'itemNum',
          width: 60,
        },
        {
          title: intl.get(`ssrc.supplierQuotation.model.supQuo.specs`).d('规格'),
          dataIndex: 'specs',
          width: 80,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.itemRemarks`).d('物品说明'),
          dataIndex: 'itemRemark',
          width: 100,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) &&
            record.syncStatus !== 'SYNCHRONIZING' &&
            record.syncStatus !== 'SYNCHRONIZED' ? (
              <Form.Item>
                {record.$form.getFieldDecorator('itemRemark', {
                  initialValue: val,
                  rules: [
                    {
                      max: 200,
                      message: intl.get('hzero.common.validation.max', {
                        max: 200,
                      }),
                    },
                  ],
                })(<Input />)}
              </Form.Item>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`${promptCode}.model.inquiryHall.minPackageQuantity`).d('最小包装量'),
          dataIndex: 'minPackageQuantity',
          width: 120,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) &&
            record.syncStatus !== 'SYNCHRONIZING' &&
            record.syncStatus !== 'SYNCHRONIZED' ? (
              <Form.Item>
                {record.$form.getFieldDecorator('minPackageQuantity', {
                  initialValue: record.minPackageQuantity,
                })(<InputNumber style={{ width: '100%' }} min={0} max={999999999999999} />)}
              </Form.Item>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.minPurchaseQuantity`).d('最小采购量'),
          dataIndex: 'minPurchaseQuantity',
          width: 120,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) &&
            record.syncStatus !== 'SYNCHRONIZING' &&
            record.syncStatus !== 'SYNCHRONIZED' ? (
              <Form.Item>
                {record.$form.getFieldDecorator('minPurchaseQuantity', {
                  initialValue: record.minPurchaseQuantity,
                })(<InputNumber style={{ width: '100%' }} min={0} max={999999999999999} />)}
              </Form.Item>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.ladderInquiry`).d('阶梯报价'),
          dataIndex: 'ladderInquiryFlag',
          width: 100,
          render: (val, record) =>
            val === 1 ? (
              <a onClick={() => viewLadderLevelModal(record)}>
                {intl.get(`${promptCode}.model.searchResImt.ladderInquiry`).d('阶梯报价')}
              </a>
            ) : null,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.promisedDeliveryDate`).d('承诺交货期'),
          dataIndex: 'validPromisedDate',
          width: 150,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) &&
            record.syncStatus !== 'SYNCHRONIZING' &&
            record.syncStatus !== 'SYNCHRONIZED' ? (
              <Form.Item>
                {record.$form.getFieldDecorator('validPromisedDate', {
                  initialValue: val && moment(val),
                })(
                  <DatePicker
                    format={getDateFormat()}
                    placeholder={null}
                    style={{ width: '100%' }}
                  />
                )}
              </Form.Item>
            ) : (
              dateRender(val)
            ),
        },
        {
          title: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
          dataIndex: 'validDeliveryCycle',
          width: 120,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) &&
            record.syncStatus !== 'SYNCHRONIZING' &&
            record.syncStatus !== 'SYNCHRONIZED' ? (
              <Form.Item>
                {record.$form.getFieldDecorator('validDeliveryCycle', {
                  initialValue: record.validDeliveryCycle,
                })(<InputNumber min={1} />)}
              </Form.Item>
            ) : (
              record.validDeliveryCycle
            ),
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.firstReminder`).d('第一封催询单'),
          dataIndex: 'firstReminder',
          width: 180,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) &&
            record.syncStatus !== 'SYNCHRONIZING' &&
            record.syncStatus !== 'SYNCHRONIZED' ? (
              <Form.Item>
                {record.$form.getFieldDecorator('firstReminder', {
                  initialValue: val,
                  rules: [
                    {
                      pattern: /^[0-9]*$/,
                      message: intl.get(`${promptCode}.view.message.onlyNumber`).d('只能输入整数'),
                    },
                  ],
                })(<Input />)}
              </Form.Item>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.secondReminder`).d('第二封催询单'),
          dataIndex: 'secondReminder',
          width: 180,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) &&
            record.syncStatus !== 'SYNCHRONIZING' &&
            record.syncStatus !== 'SYNCHRONIZED' ? (
              <Form.Item>
                {record.$form.getFieldDecorator('secondReminder', {
                  initialValue: val,
                  rules: [
                    {
                      pattern: /^[0-9]*$/,
                      message: intl.get(`${promptCode}.view.message.onlyNumber`).d('只能输入整数'),
                    },
                  ],
                })(<Input />)}
              </Form.Item>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.thirdReminder`).d('第三封催询单'),
          dataIndex: 'thirdReminder',
          width: 180,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) &&
            record.syncStatus !== 'SYNCHRONIZING' &&
            record.syncStatus !== 'SYNCHRONIZED' ? (
              <Form.Item>
                {record.$form.getFieldDecorator('thirdReminder', {
                  initialValue: val,
                  rules: [
                    {
                      pattern: /^[0-9]*$/,
                      message: intl.get(`${promptCode}.view.message.onlyNumber`).d('只能输入整数'),
                    },
                  ],
                })(<Input />)}
              </Form.Item>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.limitNonDelivery`).d('极限不发货'),
          dataIndex: 'nonDelivery',
          width: 150,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) &&
            record.syncStatus !== 'SYNCHRONIZING' &&
            record.syncStatus !== 'SYNCHRONIZED' ? (
              <Form.Item>
                {record.$form.getFieldDecorator('nonDelivery', {
                  initialValue: val,
                })(
                  <InputNumber
                    min={0}
                    max={99.9}
                    step={0.1}
                    precision={1}
                    formatter={(value) => `${value}%`}
                    parser={(value) => (value && value.replace ? value.replace('%', '') : value)}
                  />
                )}
              </Form.Item>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.extremeOverDelivery`).d('极限过度发货'),
          dataIndex: 'excessiveDelivery',
          width: 150,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) &&
            record.syncStatus !== 'SYNCHRONIZING' &&
            record.syncStatus !== 'SYNCHRONIZED' ? (
              <Form.Item>
                {record.$form.getFieldDecorator('excessiveDelivery', {
                  initialValue: val,
                })(
                  <InputNumber
                    min={0}
                    max={99.9}
                    step={0.1}
                    precision={1}
                    formatter={(value) => `${value}%`}
                    parser={(value) => (value && value.replace ? value.replace('%', '') : value)}
                  />
                )}
              </Form.Item>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.purchaseOrderRemark`).d('采购订单文本'),
          dataIndex: 'purchaseOrderRemark',
          width: 120,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) &&
            record.syncStatus !== 'SYNCHRONIZING' &&
            record.syncStatus !== 'SYNCHRONIZED' ? (
              <Form.Item>
                {record.$form.getFieldDecorator('purchaseOrderRemark', {
                  initialValue: val,
                })(<TextArea trim rows={1} />)}
              </Form.Item>
            ) : (
              <Popover content={<div style={{ maxWidth: '300px' }}>{val}</div>}>
                <p>{val}</p>
              </Popover>
            ),
        },
        {
          title: intl
            .get(`${promptCode}.model.searchResImt.noteRecordInformation`)
            .d('附注记录信息'),
          dataIndex: 'remark',
          width: 150,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) &&
            record.syncStatus !== 'SYNCHRONIZING' &&
            record.syncStatus !== 'SYNCHRONIZED' ? (
              <Form.Item>
                {record.$form.getFieldDecorator('remark', {
                  initialValue: val,
                })(<TextArea trim rows={1} maxLength={160} />)}
              </Form.Item>
            ) : (
              <Popover content={<div style={{ maxWidth: '300px' }}>{val}</div>}>
                <p>{val}</p>
              </Popover>
            ),
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.rfxCreated`).d('创建人'),
          dataIndex: 'rfxCreated',
          width: 100,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.finishDate`).d('完成时间'),
          dataIndex: 'finishDate',
          width: 140,
          render: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
        },
      ];
    } else if (tableType === 'EBS') {
      columns = [
        {
          title: intl.get(`${promptCode}.model.searchResImt.syncStatus`).d('导入状态'),
          dataIndex: 'syncStatusMeaning',
          width: 100,
        },
        {
          title: intl
            .get(`${promptCode}.model.searchResImt.externalSystemNumber`)
            .d('外部系统编号'),
          dataIndex: 'externalSystemNumber',
          width: 120,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.syncResponseMsg`).d('反馈信息'),
          dataIndex: 'syncResponseMsg',
          width: 120,
        },
        // {
        //   title: intl.get(`${promptCode}.model.searchResImt.purchaseAgentNameGroup`).d('采购组'),
        //   dataIndex: 'purchaseAgentName',
        //   width: 120,
        //   render: (val, record) =>
        //     ['update', 'create'].includes(record._status) ? (
        //       <Form.Item>
        //         {record.$form.getFieldDecorator('purchaseAgentId', {
        //           initialValue: record.purchaseAgentId,
        //         })(<Lov code="SPFM.USER_AUTH.PURCHASE_AGENT" textValue={record.purchaseAgentName} />)}
        //       </Form.Item>
        //     ) : (
        //       record.purchaseAgentName
        //     ),
        // },
        {
          title: intl.get(`${promptCode}.model.searchResImt.purOrgCode`).d('采购组织编码'),
          dataIndex: 'purOrganizationCode',
          width: 140,
          render: (val, record) => {
            if (['update', 'create'].includes(record._status)) {
              const form = record.$form;
              // 供应商改变，给相应的来源外部系统赋值
              const onChangePurOrganizationCode = (_, value) => {
                form.setFieldsValue({
                  purOrganizationName: value.organizationName,
                  purOrganizationId: value.purchaseOrgId,
                  purchaseOrgId: value.purchaseOrgId,
                });
              };
              return (
                <React.Fragment>
                  <Form.Item>
                    {record.$form.getFieldDecorator('purchaseOrgId', {
                      initialValue: record.purchaseOrgId,
                    })(
                      <Lov
                        code="SPFM.USER_AUTH.PURCHASE_ORG"
                        onChange={onChangePurOrganizationCode}
                        textValue={record.purOrganizationCode}
                      />
                    )}
                    {record.$form.getFieldDecorator('purOrganizationId', {
                      initialValue: record.purOrganizationId,
                    })}
                  </Form.Item>
                </React.Fragment>
              );
            } else {
              return record.purOrganizationCode;
            }
          },
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.purOrgName`).d('采购组织名称'),
          dataIndex: 'purOrganizationName',
          width: 150,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) ? (
              <Form.Item>
                {record.$form.getFieldDecorator('purOrganizationName', {
                  initialValue: val,
                })(<Input disabled />)}
              </Form.Item>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.purchaseAgentName`).d('采购员'),
          dataIndex: 'purchaseAgentName',
          width: 120,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) ? (
              <Form.Item>
                {record.$form.getFieldDecorator('purchaseAgentId', {
                  initialValue: record.purchaseAgentId,
                })(
                  <Lov code="SPFM.USER_AUTH.PURCHASE_AGENT" textValue={record.purchaseAgentName} />
                )}
              </Form.Item>
            ) : (
              record.purchaseAgentName
            ),
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.company`).d('公司'),
          dataIndex: 'companyName',
          width: 120,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.ouName`).d('业务实体'),
          dataIndex: 'ouName',
          width: 150,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) ? (
              <Form.Item>
                {record.$form.getFieldDecorator('ouId', {
                  initialValue: record.ouId,
                })(
                  <Lov
                    code="SPFM.USER_AUTH.OU"
                    textField="ouName"
                    onChange={(value, dataList) => changeOuId(value, dataList, record)}
                  />
                )}
                {record.$form.getFieldDecorator('ouName', { initialValue: record.ouName })}
                {record.$form.getFieldDecorator('ouCode', { initialValue: record.ouCode })}
              </Form.Item>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.invOrgs`).d('库存组织'),
          dataIndex: 'invOrganizationName',
          width: 150,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) ? (
              <Form.Item>
                {record.$form.getFieldDecorator('invOrganizationName', {
                  initialValue: record.invOrganizationName,
                })(
                  <Lov
                    code="HPFM.INV_ORG"
                    textValue={record.invOrganizationName}
                    queryParams={{
                      ouId: record.$form.getFieldValue('ouId'),
                      enabledFlag: 1,
                      organizationId,
                    }}
                    onChange={(value, dataList) => changeInvOrganization(value, dataList, record)}
                  />
                )}
                {record.$form.getFieldDecorator('invOrganizationId', {
                  initialValue: record.invOrganizationId,
                })}
              </Form.Item>
            ) : (
              record.invOrganizationName
            ),
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.ERPsupplierName`).d('ERP供应商名称'),
          dataIndex: 'supplierName',
          width: 150,
          render: (val, record) => {
            if (
              ['update', 'create'].includes(record._status) &&
              record.syncStatus !== 'SYNCHRONIZING' &&
              record.syncStatus !== 'SYNCHRONIZED'
            ) {
              return (
                <React.Fragment>
                  <Form.Item>
                    {record.$form.getFieldDecorator('supplierId', {
                      initialValue: record.supplierId,
                    })(
                      <Lov
                        code="SSRC.COMPANY_SUPPLIER"
                        textValue={record.supplierName}
                        queryParams={{
                          tenantId: organizationId,
                          companyId: record.supplierCompanyId,
                          sourceCode: 'EBS',
                        }}
                        onChange={(value, dataList) => changeSupplierId(value, dataList, record)}
                      />
                    )}
                  </Form.Item>
                </React.Fragment>
              );
            } else {
              return record.supplierName;
            }
          },
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.extSystemCode`).d('来源外部系统'),
          dataIndex: 'externalSystemCode',
          width: 120,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) ? (
              <Form.Item>
                {record.$form.getFieldDecorator('externalSystemCode', {
                  initialValue: val,
                })(<Input disabled />)}
              </Form.Item>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.SRMSupplierName`).d('SRM供应商名称'),
          dataIndex: 'supplierCompanyName',
          width: 140,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.categoryName`).d('物料类别'),
          dataIndex: 'categoryName',
          width: 100,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.itemCode`).d('物料编码'),
          dataIndex: 'itemCode',
          width: 100,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.itemName`).d('物料名称'),
          dataIndex: 'itemName',
          width: 100,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.unitPrice`).d('单价'),
          dataIndex: 'unitPrice',
          align: 'right',
          width: 80,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.uomName`).d('单位'),
          dataIndex: 'uomName',
          width: 100,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.taxCode`).d('税码'),
          dataIndex: 'taxCode',
          width: 80,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.taxRate(%)`).d('税率(%)'),
          dataIndex: 'taxRate',
          width: 80,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.currencyCode`).d('币种'),
          dataIndex: 'currencyCode',
          width: 80,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.exchangeRate`).d('汇率'),
          dataIndex: 'rate',
          width: 80,
          render: (val) => numberRender(val, 8, false),
        },
        {
          title: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
          dataIndex: 'validDeliveryCycle',
          width: 120,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.quoExpDateFrom`).d('报价有效期从'),
          dataIndex: 'quotationExpiryDateFrom',
          width: 150,
          // render: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
          render: (value, record) => {
            return ['update', 'create'].includes(record._status) ? (
              <Form.Item>
                {record.$form.getFieldDecorator('quotationExpiryDateFrom', {
                  initialValue: value && moment(value),
                  // rules: [
                  //   {
                  //     required: true,
                  //     message: intl.get('hzero.common.validation.notNull', {
                  //       name: intl
                  //         .get(`${promptCode}.model.searchResImt.quoExpDateFrom`)
                  //         .d('报价有效期从'),
                  //     }),
                  //   },
                  // ],
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    format={getDateFormat()}
                    placeholder={null}
                    disabledDate={(currentDate) =>
                      (record.$form.getFieldValue('quotationExpiryDateTo') &&
                        moment(record.$form.getFieldValue('quotationExpiryDateTo')).isBefore(
                          currentDate,
                          'day'
                        )) ||
                      moment().isAfter(currentDate, 'day')
                    }
                  />
                )}
              </Form.Item>
            ) : (
              value && moment(value)
            );
          },
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.quoExpDateTo`).d('报价有效期至'),
          dataIndex: 'quotationExpiryDateTo',
          width: 150,
          render: (value, record) => {
            return ['update', 'create'].includes(record._status) ? (
              <Form.Item>
                {record.$form.getFieldDecorator('quotationExpiryDateTo', {
                  initialValue: value && moment(value),
                  // rules: [
                  //   {
                  //     required: true,
                  //     message: intl.get('hzero.common.validation.notNull', {
                  //       name: intl
                  //         .get(`${promptCode}.model.searchResImt.quoExpDateTo`)
                  //         .d('报价有效期至'),
                  //     }),
                  //   },
                  // ],
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    format={getDateFormat()}
                    placeholder={null}
                    disabledDate={(currentDate) =>
                      (record.$form.getFieldValue('quotationExpiryDateFrom') &&
                        moment(record.$form.getFieldValue('quotationExpiryDateFrom')).isAfter(
                          currentDate,
                          'day'
                        )) ||
                      moment().isAfter(currentDate, 'day')
                    }
                  />
                )}
              </Form.Item>
            ) : (
              value && moment(value)
            );
          },
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.sourceType`).d('寻源类型'),
          dataIndex: 'sourceTypeMeaning',
          width: 100,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.priceCategory`).d('价格类型'),
          dataIndex: 'priceCategoryMeaning',
          width: 100,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.sourceFromNumber`).d('来源单号'),
          dataIndex: 'sourceNum',
          width: 160,
          render: (val, record) => <a onClick={() => onDetail(record)}>{val}</a>,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.lineNo`).d('行号'),
          dataIndex: 'itemNum',
          width: 60,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.brand`).d('品牌'),
          dataIndex: 'brand',
          width: 100,
        },
        {
          title: intl.get(`ssrc.supplierQuotation.model.supQuo.specs`).d('规格'),
          dataIndex: 'specs',
          width: 80,
        },
        {
          title: intl.get(`${promptCode}.model.inquiryHall.minPackageQuantity`).d('最小包装量'),
          dataIndex: 'minPackageQuantity',
          width: 100,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.minPurchaseQuantity`).d('最小采购量'),
          dataIndex: 'minPurchaseQuantity',
          width: 120,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.ladderInquiry`).d('阶梯报价'),
          dataIndex: 'ladderInquiryFlag',
          width: 100,
          render: (val, record) =>
            val === 1 ? (
              <a onClick={() => viewLadderLevelModal(record)}>
                {intl.get(`${promptCode}.model.searchResImt.ladderInquiry`).d('阶梯报价')}
              </a>
            ) : null,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.Manufacturer`).d('制造商'),
          dataIndex: 'manufacturer',
          width: 100,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.supplierLocation`).d('供应商地点'),
          dataIndex: 'supplierSiteId',
          width: 150,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) ? (
              <Form.Item>
                {record.$form.getFieldDecorator('supplierSiteId', {
                  initialValue: record.supplierSiteId,
                })(
                  <Lov
                    code="SSLM.SUPPLIER_SITE"
                    textValue={record.supplierSiteName}
                    lovOptions={{
                      displayField: 'supplierSiteName',
                    }}
                    queryParams={{
                      organizationId,
                      supplierId: record.$form.getFieldValue('supplierId'),
                    }}
                    onChange={(value, dataList) => changeSupplierLocation(value, dataList, record)}
                    disabled={!record.$form.getFieldValue('supplierId')}
                  />
                )}
                {record.$form.getFieldDecorator('supplierSiteName', {
                  initialValue: record.supplierSiteName,
                })}
              </Form.Item>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.reasonsForSelection`).d('选用理由'),
          dataIndex: 'suggestedRemark',
          width: 100,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.remark`).d('备注'),
          dataIndex: 'remark',
          width: 180,
          render: (val, record) =>
            ['update', 'create'].includes(record._status) &&
            record.syncStatus !== 'SYNCHRONIZING' &&
            record.syncStatus !== 'SYNCHRONIZED' ? (
              <Form.Item>
                {record.$form.getFieldDecorator('remark', {
                  initialValue: val,
                })(<Input.TextArea rows={1} />)}
              </Form.Item>
            ) : (
              <Popover content={val}>{val}</Popover>
            ),
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.rfxCreated`).d('创建人'),
          dataIndex: 'rfxCreated',
          width: 100,
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.finishDate`).d('完成时间'),
          dataIndex: 'finishDate',
          width: 140,
          render: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
        },
        {
          title: intl.get(`${promptCode}.model.searchResImt.sourceCategory`).d('寻源类别'),
          dataIndex: 'sourceCategoryMeaning',
          width: 100,
        },
      ];
    }
    const scrollWidth = columns.reduce(
      (prev, current) => prev + (current.width ? current.width : 0),
      0
    );
    const anchor = 'right';

    const impErrColumns = [
      {
        title: intl.get(`${promptCode}.model.searchResImt.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 140,
        render: (val) => (
          <Popover content={val} placement="topLeft">
            {val}
          </Popover>
        ),
      },
      {
        title: isEmpty(entitySelectFieldList)
          ? intl.get(`${promptCode}.model.searchResImt.invOrgs`).d('库存组织')
          : intl.get(`${promptCode}.model.searchResImt.ouName`).d('业务实体'),
        dataIndex: isEmpty(entitySelectFieldList) ? 'organizationName' : 'ouName',
        width: 140,
        render: (val) => (
          <Popover content={val} placement="topLeft">
            {val}
          </Popover>
        ),
      },
    ];

    return (
      <Modal
        destroyOnClose
        title={intl.get('ssrc.searchResultImport.view.message.button.quotedPrice').d('引用价格')}
        onCancel={cancle}
        visible={visible}
        width={900}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        footer={[
          isShowNextStepBtn ? (
            <React.Fragment>
              <Button onClick={cancle}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>,
              <Button
                onClick={this.handleCreateSourceResult}
                type="primary"
                loading={createSourceResultLoading}
              >
                {intl.get('hzero.common.button.next').d('下一步')}
              </Button>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Button onClick={this.handleBackSelectPage} type="primary">
                {intl.get('hzero.common.button.previous').d('上一步')}
              </Button>
              <Button
                onClick={this.handleImportErp}
                type="primary"
                loading={importErpWithSourceResultLoading}
              >
                {intl.get(`${promptCode}.view.message.button.importERP`).d('导入ERP')}
              </Button>
            </React.Fragment>
          ),
        ]}
      >
        <div style={{ display: isShowNextStepBtn ? 'block' : 'none' }}>
          <TransferWrapper {...transferWrapperProps} />
        </div>
        {!isShowNextStepBtn && (
          <EditTable
            scroll={{ x: scrollWidth }}
            dataSource={sourceResultTempList}
            rowKey="resultTempId"
            columns={columns}
            bordered
            pagination={sourceResultTempPagination}
            onChange={(page) => this.handleQuerySourceResult(page)}
            loading={querySourceResultLoading || saveSourceResultLoading}
          />
        )}
        <Modal
          maskClosable
          width={550}
          visible={impErrModalVisible}
          onCancel={this.handleCloseImpErrModal}
          title={
            isEmpty(entitySelectFieldList)
              ? intl
                  .get(`${promptCode}.view.message.title.importFailedWithOrg`)
                  .d('以下物料与库存组织不匹配')
              : intl
                  .get(`${promptCode}.view.message.title.importFailedWithBusinessEntity`)
                  .d('以下物料与业务实体不匹配')
          }
          footer={
            <Button type="primary" onClick={this.handleCloseImpErrModal}>
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
          }
        >
          <Table
            bordered
            columns={impErrColumns}
            rowKey="rowKey"
            dataSource={isEmpty(entitySelectFieldList) ? operationInvOrgList : operationUnitList}
            pagination={false}
          />
        </Modal>
      </Modal>
    );
  }
}
