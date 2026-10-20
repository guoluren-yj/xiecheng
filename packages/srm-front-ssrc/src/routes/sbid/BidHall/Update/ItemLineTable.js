/**
 * create 创建招标
 * @date: 2019-05-28
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Button, DatePicker, Form, Input, Modal, Tabs, Tooltip } from 'hzero-ui';
import { isEmpty, isNumber, map, sum, noop } from 'lodash';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import queryString from 'querystring';
import { dateTimeRender, enableRender, yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getDateFormat, getEditTableData, getCurrentOrganizationId } from 'utils/utils';
import moment from 'moment';
import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';
import Lov from 'components/Lov';
import formatterCollections from 'utils/intl/formatterCollections';
import { openTab } from 'utils/menuTab';
import ItemLineQutationDetailModal from '@/routes/ssrc/InquiryHall/Update/ItemLineQutationDetailModal.js';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
// import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import CommonImportNew from 'hzero-front/lib/components/Import';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Purchaser';
import QuotationDetailImport from '@/routes/components/QuotationDetailImport';
import { FILE_SIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import { PRIVATE_BUCKET, SRM_SSRC } from '_utils/config';
import SectionDetailModal from './SectionDetailModal';
import OtherSectionModal from './OtherSectionModal';
import styles from './index.less';

@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['ssrc.bidHall'] })
@connect(({ bidHall, loading }) => ({
  bidHall,
  fetchSectionDetailDataLoading: loading.effects['bidHall/fetchSectionDetailData'],
  saveSectionDetailDataLoading: loading.effects['bidHall/saveSectionDetailData'],
  fetchMoveSectionDataLoading: loading.effects['bidHall/fetchMoveSectionData'],
  moveOtherSectionDataLoading: loading.effects['bidHall/moveOtherSectionData'],
  fetchItemLineQuotationDetailLoading: loading.effects['bidHall/fetchItemLineQuotationDetail'],
}))
export default class ItemLineTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sectionModelVisible: false, // 新增或修改标段模态框
      activeKey: '', // 标签页activeKey
      moveModelVisible: false, // 移到其它标段模态框
      isUpdate: false, // 新增/修改标段信息标识
    };
  }

  componentDidMount() {
    this.fetchItemLine();
  }

  /**
   * 批量导入
   */
  @Bind()
  handleBatchExport(item) {
    if (item.constructor && item.constructor === Object) {
      const { bidLineItemId, bidHeaderId } = item;
      openTab({
        key: '/ssrc/bid-hall/bid-update/comment-import/SSRC.BID_LINE_ITEM',
        // key: '/hpfm/hr/staff/data-import/SCUX.PORSCHE_EMPLOYEE',
        search: queryString.stringify({
          key: '/ssrc/bid-hall/bid-update/comment-import/SSRC.BID_LINE_ITEM',
          title: 'hzero.common.title.batchImport',
          action: intl.get('hzero.common.title.batchImport').d('批量导入'),
          backPath: `/ssrc/bid-hall/bid-update/${bidHeaderId}`,
          auto: true,
          args: JSON.stringify({
            bidHeaderId,
            bidLineItemId,
          }),
        }),
      });
    } else {
      const bidHeaderId = item;
      openTab({
        key: '/ssrc/bid-hall/bid-update/comment-import/SSRC.BID_LINE_ITEM',
        search: queryString.stringify({
          key: '/ssrc/bid-hall/bid-update/comment-import/SSRC.BID_LINE_ITEM',
          title: 'hzero.common.title.batchImport',
          action: intl.get('hzero.common.title.batchImport').d('批量导入'),
          backPath: `/ssrc/bid-hall/bid-update/${bidHeaderId}`,
          auto: true,
          args: JSON.stringify({
            bidHeaderId,
          }),
        }),
      });
    }
  }

  /**
   * 查询物品明细-若分标段，则设置第一个数据activity
   */
  @Bind()
  fetchItemLine() {
    const {
      dispatch,
      organizationId,
      match,
      localSubjectMatterRule,
      subjectMatterRule,
    } = this.props;
    const { params } = match;
    // 查询物品明细
    dispatch({
      type: 'bidHall/fetchItemLine',
      payload: {
        organizationId,
        bidHeaderId: params.bidId,
        subjectMatterRule: localSubjectMatterRule,
        customizeUnitCode:
          subjectMatterRule === 'PACK'
            ? 'SSRC.BID_HALL_EDIT.EDIT_LINE'
            : 'SSRC.BID_HALL_EDIT.EDIT_LINE_NONE',
      },
    }).then((res) => {
      if (res && localSubjectMatterRule === 'PACK') {
        this.setState({
          activeKey: res && res.length && `${res[0].bidLineItemId}`,
        });
      }
    });
  }

  /**
   * 税率改变
   */
  @Bind()
  setValue(e, val, record) {
    const { checked } = e.target;
    if (!checked) {
      record.$form.setFieldsValue({ taxId: null, taxRate: '' });
    }
  }

  /**
   * 改变物料编码-获取物品描述、单位
   */
  @Bind()
  changeItemId(val, dataList, record) {
    record.$form.setFieldsValue({
      itemName: val ? dataList.itemName : '',
      itemCode: val ? dataList.itemCode : '',
      itemId: val ? dataList.partnerItemId : null,
      uomId: val ? dataList.orderUomId || dataList.primaryUomId : null,
      uomName: val ? dataList.orderUomName || dataList.uomName : '',
      uomCode: val ? dataList.uomCode : '',
      specifications: val ? dataList.specifications : '',
      model: val ? dataList.model : '',

      itemCategoryId: val ? dataList.categoryId : null,
      itemCategoryName: val ? dataList.categoryName : '',
      // itemCategoryCode: val ? dataList.categoryCode : '',
      quotationTemplateId: val ? dataList.quotationTemplateId : null,
      quotationTemplateName: val ? dataList.quotationTemplateName : '',
    });
    // this.props.handleQuotationDetail(record, false);
  }

  /**
   * 改变税率-获取税率显示值
   */
  @Bind()
  changeTaxId(val, dataList, record) {
    record.$form.setFieldsValue({
      taxRate: val ? dataList.taxRate : undefined,
      taxId: val ? dataList.taxId : null,
    });
  }

  /**
   * 改变业务实体 - 清空库存组织-物料编码-物品描述
   */
  @Bind()
  changeOuId(val, dataList, record) {
    if (record.children) {
      if (val && dataList) {
        record.children.forEach((item) => {
          if (item && item.$form) {
            return item.$form.setFieldsValue({
              oumId: dataList.ouId,
              oumName: dataList.ouName,
              ouCode: dataList.ouCode,
            });
          }
        });
      } else {
        // 禁用且清空物料编码
        record.children.forEach((item) => {
          if (item.$form) {
            return item.$form.setFieldsValue({
              oumId: undefined,
              oumName: undefined,
              ouCode: undefined,
              invOrganizationName: undefined,
              invOrganizationId: null,
              itemId: null,
              itemName: '',
              itemCode: '',
              itemCategoryCode: '',
              itemCategoryId: null,
              itemCategoryName: '',
              uomCode: '',
              uomId: null,
              specifications: '',
              model: '',
            });
          }
        });

        if (!val) {
          record.$form.setFieldsValue({
            oumId: undefined,
            oumName: undefined,
            ouCode: undefined,
            invOrganizationName: undefined,
            invOrganizationId: undefined,
          });
        }
      }
    } else {
      if (!val) {
        record.$form.setFieldsValue({
          oumId: undefined,
          oumName: undefined,
          ouCode: undefined,
          invOrganizationName: undefined,
          invOrganizationId: undefined,
        });
        return;
      }
      record.$form.setFieldsValue({
        oumId: dataList.ouId,
        oumName: dataList.ouName,
        ouCode: dataList.ouCode,
        invOrganizationName: dataList.organizationName,
        invOrganizationId: dataList.organizationId,
        itemId: null,
        itemName: '',
        itemCode: '',
        itemCategoryCode: '',
        itemCategoryId: null,
        itemCategoryName: '',
        uomCode: '',
        uomId: null,
        specifications: '',
        model: '',
      });
    }
  }

  /**
   * 改变库存组织 - 清空物料编码-物品描述
   */
  @Bind()
  changeInvOrganization(val, dataList, record) {
    if (record.children) {
      if (val) {
        record.children.forEach((item) => {
          if (item && item.$form) {
            return item.$form.setFieldsValue({
              invOrganizationId: val,
            });
          }
        });
      } else {
        // 禁用且清空物料编码
        record.children.forEach((item) => {
          if (item.$form) {
            return item.$form.setFieldsValue({
              invOrganizationId: null,
              invOrganizationName: undefined,
              itemId: null,
              itemName: '',
              itemCode: '',
              itemCategoryCode: '',
              itemCategoryId: null,
              itemCategoryName: '',
              uomCode: '',
              uomId: null,
            });
          }
        });
      }
    } else {
      if (!val) {
        record.$form.setFieldsValue({
          itemName: '',
          itemCode: '',
        });
        return;
      }
      record.$form.setFieldsValue({
        invOrganizationName: dataList.organizationName,
        invOrganizationId: dataList.organizationId,
        itemId: null,
        itemName: '',
        itemCode: '',
        itemCategoryCode: '',
        itemCategoryId: null,
        itemCategoryName: '',
        uomCode: '',
        uomId: null,
      });
    }
  }

  // 是否分配供应商
  @Bind()
  whetherAssign(val, dataList, record) {
    record.$form.setFieldsValue({
      assignFlag: record.assignFlag,
    });
  }

  /**
   * 改变物品分类
   *
   * @param {*} val
   * @param {*} dataList
   * @param {*} record
   * @memberof ItemLineTablePrepare
   */
  @Bind()
  changeItemCategory(val, dataList, record) {
    record.$form.setFieldsValue({
      itemCategoryId: val ? dataList.categoryId : null,
      itemCategoryName: val ? dataList.categoryName : '',
      quotationTemplateId: val ? dataList.quotationTemplateId : null,
      quotationTemplateName: val ? dataList.quotationTemplateName : '',
    });
    // this.props.handleQuotationDetail(record, false);
  }

  /**
   * 检查表格内容值发生变化
   */
  // @Bind()
  // hasChangeData(record, changeValues) {
  //   const { onChangeTableData } = this.props;
  //   if (!isEmpty(changeValues)) {
  //     onChangeTableData();
  //   }
  // }

  /**
   * 检查表格内容值发生变化
   * @param {*} record
   * @param {*} changeValues
   */
  @Bind()
  hasChangeData() {
    setTimeout(() => this.forceUpdate(), 500);
  }

  /**
   * 数据初始化
   *
   * @param {*} [data=[]]
   * @returns
   * @memberof ItemLineTablePrepare
   */
  changeDataSource(data = []) {
    if (!data.length) {
      return data;
    }

    const newData = data.map((item) => {
      const orgId = item.invOrganizationId;
      if (!item.children || !Array.isArray(item.children) || !item.children.lenth) {
        return item;
      }

      const newChildren = item.children.map((child) => {
        return {
          ...child,
          invOrganizationId: orgId,
        };
      });
      return {
        ...item,
        children: newChildren,
      };
    });

    return newData;
  }

  /**
   * 渲染标段只读行信息
   * sectionItemLine
   */
  @Bind()
  renderSectionItemLine(children = [], bidLineItemId) {
    const {
      organizationId,
      companyId = null,
      onDistributeSupplierForItemLine,
      sourceMethod,
      itemLineRowSelection,
      customizeTable,
      form,
      match,
    } = this.props;
    const { params } = match;
    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.bidLineItemNum`).d('行号'),
        dataIndex: 'bidLineItemNum',
        width: 80,
        fixed: 'left',
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.businessUnit`).d('业务实体'),
        dataIndex: 'ouId',
        width: 200,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('ouId', {
                initialValue: record.ouId,
              })(
                <Lov
                  code="SPFM.USER_AUTH.OU"
                  textValue={record.ouName}
                  onChange={(value, dataList) => this.changeOuId(value, dataList, record)}
                  disabled={record.prHeaderId}
                  queryParams={{ companyId }}
                />
              )}
            </Form.Item>
          ) : (
            record.ouName
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.inventoryOrg`).d('库存组织'),
        dataIndex: 'invOrganizationId',
        width: 200,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('invOrganizationId', {
                initialValue: val,
              })(
                <Lov
                  code="HPFM.INV_ORG"
                  textValue={record.invOrganizationName}
                  disabled={!record.$form.getFieldValue('ouId') || record.prHeaderId}
                  onChange={(value, dataList) =>
                    this.changeInvOrganization(value, dataList, record)
                  }
                  queryParams={{
                    ouId: record.$form.getFieldValue('ouId'),
                    enabledFlag: 1,
                    organizationId,
                  }}
                />
              )}
            </Form.Item>
          ) : (
            record.invOrganizationName
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.freightIncludedFlag`).d('是否含运费'),
        dataIndex: 'freightIncludedFlag',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('freightIncludedFlag', {
                initialValue: val,
              })(<Checkbox checkedValue={1} unCheckedValue={0} />)}
            </Form.Item>
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.itemCode`).d('物料编码'),
        dataIndex: 'itemId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('itemId', {
                initialValue: val,
              })(
                <Lov
                  code="SSRC.NEW_CUSTOMER_ITEM"
                  textValue={record.itemCode}
                  disabled={record.sectionFlag || record.prHeaderId}
                  onChange={(value, dataList) => this.changeItemId(value, dataList, record)}
                  queryParams={{
                    invOrganizationId: record.$form.getFieldValue('invOrganizationId'),
                    itemCategoryId: record.$form.getFieldValue('itemCategoryId'),
                    ouId: record.$form.getFieldValue('ouId') || null,
                    companyId,
                  }}
                />
              )}
              {record.$form.getFieldDecorator('itemCode', { initialValue: record.itemCode })}
            </Form.Item>
          ) : (
            record.itemCode
          ),
      },
      {
        title: intl.get(`ssrc.common.goodsDescription`).d('物品描述'),
        dataIndex: 'itemName',
        width: 200,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('itemName', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.common.goodsDescription`).d('物品描述'),
                    }),
                  },
                  {
                    max: 200,
                    message: intl.get('hzero.common.validation.max', {
                      max: 200,
                    }),
                  },
                ],
              })(<Input disabled={record.$form.getFieldValue('itemId') || record.prHeaderId} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.itemCategory`).d('物品分类'),
        dataIndex: 'itemCategoryId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('itemCategoryId', {
                initialValue: record.itemCategoryId,
              })(
                <Lov
                  code="SMDM.TREE_ITEM_CATEGORY"
                  textValue={record.itemCategoryName}
                  textField="itemCategoryName"
                  queryParams={{
                    tenantId: organizationId,
                    itemId: record.$form.getFieldValue('itemId'),
                  }}
                  onChange={(value, dataList) => this.changeItemCategory(value, dataList, record)}
                />
              )}
              {record.$form.getFieldDecorator('itemCategoryName', {
                initialValue: record.itemCategoryName,
              })(<Input style={{ display: 'none' }} />)}
            </Form.Item>
          ) : (
            record.itemCategoryName
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.quotationTemplateName`).d('报价模板'),
        dataIndex: 'quotationTemplateId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('quotationTemplateId', {
                  initialValue: record.quotationTemplateId,
                })(
                  <Lov
                    code="SSRC.QUOTATION_TEMPLATE"
                    textValue={record.quotationTemplateName}
                    // textField="quotationTemplateName"
                    queryParams={{
                      tenantId: organizationId,
                    }}
                  />
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('quotationTemplateName', {
                  initialValue: record.quotationTemplateName || '',
                })(<Input />)}
              </Form.Item>
            </React.Fragment>
          ) : (
            record.quotationTemplateName
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.quotationDetails`).d('报价明细'),
        dataIndex: 'quotationDetail',
        width: 100,
        render: (val, record) => {
          return ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              {(record.$form.getFieldValue('itemId') ||
                record.$form.getFieldValue('itemCategoryId') ||
                record.$form.getFieldValue('quotationTemplateId')) &&
              params.bidId &&
              record._status !== 'create' ? (
                <QuotationDetail rowData={record} sourceFrom="BID" />
              ) : null}
            </React.Fragment>
          ) : (
            ''
          );
        },
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('specifications', {
                initialValue: val,
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.model`).d('型号'),
        dataIndex: 'model',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('model', {
                initialValue: val,
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('demandDate', {
                initialValue: val && moment(val),
              })(<DatePicker style={{ width: '100%' }} placeholder="" format={getDateFormat()} />)}
            </Form.Item>
          ) : (
            dateTimeRender(record.demandDate)
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.bidQuantity`).d('需求数量'),
        dataIndex: 'bidQuantity',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('bidQuantity', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.bidQuantity`).d('需求数量'),
                    }),
                  },
                ],
              })(
                <PrecisionInputNumber
                  // precision={6}
                  type="hzero"
                  uom={record.$form.getFieldValue('uomId')}
                  min={0}
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                  disabled={record.prHeaderId}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.unit`).d('单位'),
        dataIndex: 'uomId',
        width: 200,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('uomId', {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.bidHall.model.bidHall.unit`).d('单位'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SSRC.UOM"
                    textValue={record.uomName || record.$form.getFieldValue('uomName')}
                  />
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('uomName', { initialValue: record.uomName })(
                  <div />
                )}
              </Form.Item>
            </React.Fragment>
          ) : (
            record.uomName
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.costPrice`).d('标底单价'),
        dataIndex: 'costPrice',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('costPrice', {
                initialValue: val,
              })(
                <PrecisionInputNumber
                  type="hzero"
                  currency={form.getFieldValue('currencyCode')}
                  min={0}
                  max="99999999999999999999"
                />
              )}
            </Form.Item>
          ) : (
            enableRender(val)
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.taxIncludedFlag`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('taxIncludedFlag', {
                initialValue: val,
              })(
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  onChange={(e) => this.setValue(e, val, record)}
                />
              )}
            </Form.Item>
          ) : (
            enableRender(val)
          ),
      },
      {
        title: <span>{intl.get(`ssrc.bidHall.model.bidHall.taxRate`).d('税率')}%</span>,
        dataIndex: 'taxId',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('taxId', {
                  initialValue: val,
                  rules: [
                    {
                      required: record.$form.getFieldValue('taxIncludedFlag') === 1,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.bidHall.model.bidHall.taxRate`).d('税率'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SMDM.TAX"
                    textField="taxRate"
                    textValue={record.taxRate}
                    disabled={!record.$form.getFieldValue('taxIncludedFlag')}
                    onChange={(value, dataList) => this.changeTaxId(value, dataList, record)}
                  />
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('taxRate', { initialValue: record.taxRate })(
                  <div />
                )}
              </Form.Item>
            </React.Fragment>
          ) : (
            record.taxRate
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.prNum`).d('采购申请号'),
        dataIndex: 'prNum',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.lineNum`).d('采购申请行号'),
        dataIndex: 'prLineNum',
        width: 120,
      },
      {
        title: intl.get(`hzero.common.button.action`).d('操作'),
        dataIndex: 'action',
        width: 80,
        fixed: 'right',
        render: (_, record) =>
          record.bidLineItemNum && sourceMethod === 'INVITE' && record._status === 'update' ? (
            <Form.Item>
              <a onClick={() => onDistributeSupplierForItemLine(record)}>
                {intl.get(`ssrc.bidHall.view.message.button.distribution`).d('分配')}
              </a>
            </Form.Item>
          ) : (
            ''
          ),
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SSRC.BID_HALL_EDIT.EDIT_LINE',
            cacheKey: bidLineItemId,
          },
          <EditTable
            bordered
            rowKey="bidLineItemId"
            columns={columns}
            rowSelection={itemLineRowSelection}
            scroll={{ x: scrollX }}
            dataSource={children || []}
            pagination={false}
            onDataChange={this.hasChangeData}
          />
        )}
      </React.Fragment>
    );
  }

  /**
   *切换标段
   *
   * @memberof BidEvaluation
   */
  @Bind()
  changeTabs(activeKey) {
    this.setState({ activeKey });
  }

  /**
   * 浮动文字tabs
   */
  @Bind()
  renderTooTipTabs = (item) => {
    return (
      <Tooltip title={`${item.sectionNum}--${item.sectionName}`} placement="topLeft">
        {item.sectionName}
      </Tooltip>
    );
  };

  /**
   * 打开新增标段模态框
   */
  @Bind()
  addSectionTab() {
    this.setState({
      sectionModelVisible: true,
      isUpdate: false,
    });
  }

  /**
   * 隐藏标段信息模态框
   */
  @Bind()
  handleCancelSectionDetail() {
    this.props.dispatch({
      type: 'bidHall/updateState',
      payload: {
        setionDetailList: {}, // 标段信息明细数据
      },
    });
    this.setState({
      sectionModelVisible: false,
    });
  }

  /**
   * 修改标段信息
   * 分标段，打开标段修改信息Modal
   * @memberof updateSectionTab
   */
  @Bind()
  updateSectionTab() {
    this.setState({
      sectionModelVisible: true,
      isUpdate: true,
    });
    this.fetchSectionDetailData();
  }

  /**
   * 查询-单个标段信息数据
   */
  @Bind()
  fetchSectionDetailData() {
    const { dispatch, header, dataSource = [] } = this.props;
    const { activeKey } = this.state;
    let firstSectionId;
    if (dataSource[0]) {
      firstSectionId = dataSource[0].bidLineItemId;
    }
    dispatch({
      type: 'bidHall/fetchSectionDetailData',
      payload: {
        bidHeaderId: header.bidHeaderId,
        sectionId: activeKey || firstSectionId,
      },
    });
  }

  // 保存单个标段信息
  @Bind()
  saveSectionDetailData(values) {
    const { dispatch, header, onFetchItemLine } = this.props;
    const { isUpdate } = this.state;
    if (isUpdate) {
      if (values && values.flag) {
        Modal.confirm({
          title: intl
            .get(`ssrc.bidHall.view.message.confirmModifySectionInfoYesOrNot`)
            .d('修改业务实体或库存组织，将清空该标段下的所有物品行，是否确认修改？'),
          onOk: () => {
            dispatch({
              type: 'bidHall/saveSectionDetailData',
              payload: {
                bidHeaderId: header.bidHeaderId,
                values,
              },
            }).then((res) => {
              if (res) {
                this.setState({ sectionModelVisible: false });
                dispatch({
                  type: 'bidHall/updateState',
                  payload: {
                    setionDetailList: {},
                  },
                });
                notification.success();
                onFetchItemLine();
              }
            });
          },
          onCancel: () => {
            this.setState({ sectionModelVisible: false });
          },
        });
      } else {
        dispatch({
          type: 'bidHall/saveSectionDetailData',
          payload: {
            bidHeaderId: header.bidHeaderId,
            values,
          },
        }).then((res) => {
          if (res) {
            this.setState({ sectionModelVisible: false });
            dispatch({
              type: 'bidHall/updateState',
              payload: {
                setionDetailList: {},
              },
            });
            notification.success();
            onFetchItemLine();
          }
        });
      }
    } else {
      dispatch({
        type: 'bidHall/saveSectionDetailData',
        payload: {
          bidHeaderId: header.bidHeaderId,
          values,
        },
      }).then((res) => {
        if (res) {
          this.setState({ sectionModelVisible: false, activeKey: `${res.bidLineItemId}` });
          dispatch({
            type: 'bidHall/updateState',
            payload: {
              setionDetailList: {},
            },
          });
          notification.success();
          onFetchItemLine();
        }
      });
    }
  }

  @Bind()
  handleTabsEdit(targetKey, action) {
    if (action === 'remove') {
      this.handleTabPaneRemove(targetKey);
    }
  }

  /**
   * 删除某一个 tabPane
   */
  @Bind()
  handleTabPaneRemove(tabPaneKey) {
    const { dispatch, header, onFetchItemLine } = this.props;
    const { activeKey } = this.state;
    Modal.confirm({
      title: intl
        .get(`ssrc.bidHall.message.confirm.removeSectionAandItem`)
        .d('是否确认删除该标段，以及该标段下的物品?'),
      onOk: () => {
        dispatch({
          type: 'bidHall/deleteTabPane',
          payload: {
            bidHeaderId: header.bidHeaderId,
            sectionId: tabPaneKey,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            // 若activeKey === tabPaneKey,则需更新activity
            if (activeKey === tabPaneKey) {
              this.fetchItemLine();
            } else {
              onFetchItemLine();
            }
          }
        });
      },
    });
  }

  /**
   *  移到其它标段Modal
   */
  @Bind()
  moveOtherSection() {
    this.setState({
      moveModelVisible: true,
    });
    this.fetchMoveSectionData();
  }

  /**
   * 查询-移动其它标段信息数据
   */
  @Bind()
  fetchMoveSectionData() {
    const { dispatch, header, dataSource = [] } = this.props;
    const { activeKey } = this.state;
    let firstSectionId;
    if (dataSource[0]) {
      firstSectionId = dataSource[0].bidLineItemId;
    }
    dispatch({
      type: 'bidHall/fetchMoveSectionData',
      payload: {
        bidHeaderId: header.bidHeaderId,
        sectionId: activeKey || firstSectionId,
      },
    });
  }

  /**
   * 隐藏标段信息模态框
   */
  @Bind()
  handleCancelOtherSection() {
    this.props.dispatch({
      type: 'bidHall/updateState',
      payload: {
        moveSectionDetailList: [], // 某个标书下所有标段信息数据
      },
    });
    this.setState({
      moveModelVisible: false,
    });
  }

  /**
   * 移到其它标段操作
   */
  @Bind()
  moveOtherSectionData(selectedRows = []) {
    const {
      dispatch,
      header,
      itemLineSelectedRows,
      onFetchItemLine,
      onClearSelectedRows,
      dataSource = [],
    } = this.props;
    let sectionId;
    let parentSectionNum;
    selectedRows.forEach((n) => {
      sectionId = n.bidLineItemId;
      parentSectionNum = n.bidLineItemNum;
    });
    const needRemoteDeleteItem =
      itemLineSelectedRows && itemLineSelectedRows.filter((item) => item._status === 'update');
    const remoteDelete = getEditTableData(needRemoteDeleteItem, ['bidLineItemId']);
    const localeDelete =
      itemLineSelectedRows && itemLineSelectedRows.filter((item) => item._status === 'create');
    const localeMoveId = localeDelete.map((o) => o.bidLineItemId);

    if (!isEmpty(localeDelete)) {
      const newDataSource = dataSource.map((item) => {
        if (!item.children || !item.children.length) {
          if (sectionId === item.bidLineItemId) {
            const newlocaleMove = localeDelete.map((i) => {
              const iData = i.$form ? i.$form.getFieldsValue() : false;
              return {
                ...iData,
                bidHeaderId: i.bidHeaderId,
                bidLineItemId: i.bidLineItemId,
                tenantId: i.tenantId,
                $form: i.$form,
                _status: i._status,
                parentSectionId: item.bidLineItemId,
                parentSectionNum: item.bidLineItemNum,
              };
            });
            return {
              ...item,
              children: newlocaleMove.filter(Boolean),
            };
          }
          return item;
        } else {
          if (sectionId === item.bidLineItemId) {
            const newlocaleMove = localeDelete.map((i) => {
              const iData = i.$form ? i.$form.getFieldsValue() : false;
              return {
                ...iData,
                $form: i.$form,
                bidHeaderId: i.bidHeaderId,
                bidLineItemId: i.bidLineItemId,
                tenantId: i.tenantId,
                _status: i._status,
                parentSectionId: item.bidLineItemId,
                parentSectionNum: item.bidLineItemNum,
              };
            });
            return {
              ...item,
              children: [...item.children, ...newlocaleMove],
            };
          }
          const newItemChildren = item.children.map((child) => {
            if (localeMoveId.includes(child.bidLineItemId)) {
              return false;
            } else {
              return child;
            }
          });

          return {
            ...item,
            children: newItemChildren.filter(Boolean),
          };
        }
      });

      dispatch({
        type: 'bidHall/updateState',
        payload: {
          itemLine: newDataSource,
        },
      });

      this.setState({ moveModelVisible: false, activeKey: `${sectionId}` });
      onClearSelectedRows();
    }

    if (!isEmpty(remoteDelete)) {
      dispatch({
        type: 'bidHall/moveOtherSectionData',
        payload: {
          sectionId,
          parentSectionNum,
          bidLineItems: remoteDelete,
          bidHeaderId: header.bidHeaderId,
        },
      }).then((res) => {
        if (res) {
          this.setState({ moveModelVisible: false, activeKey: `${sectionId}` });
          notification.success();
          onFetchItemLine();
          onClearSelectedRows();
        }
      });
    }
  }

  /**
   * 渲染标段tabs
   */
  @Bind()
  renderTabs() {
    const {
      saveLoading,
      dataSource = [],
      onCreateItemLineSon,
      onSaveLine,
      onDeleteLines,
      itemLineSelectedRowKeys = [],
      allowAddItems,
      customizeBtnGroup = noop,
    } = this.props;
    const { activeKey } = this.state;
    const operations = (
      <React.Fragment>
        {!isEmpty(dataSource) ? (
          <a onClick={this.updateSectionTab}>
            {intl.get(`ssrc.bidHall.model.bidHall.editItemLineInfo`).d('修改标段信息')}
          </a>
        ) : (
          ''
        )}
      </React.Fragment>
    );

    return (
      <div>
        <Tabs
          hideAdd
          className={styles.tabStyle}
          tabBarExtraContent={operations}
          onChange={this.changeTabs}
          animated={false}
          type="editable-card"
          onEdit={this.handleTabsEdit}
          activeKey={activeKey}
        >
          {/* 循环标段数据,渲染tabs标段 */}
          {map(dataSource, (item) => {
            return (
              <Tabs.TabPane
                tab={this.renderTooTipTabs(item)}
                key={[item.bidLineItemId]}
                forceRender
              >
                <div className={styles['item-list-search']}>
                  <Form layout="inline">
                    {customizeBtnGroup(
                      { code: 'SSRC.BID_HALL_EDIT.ITEM.TABLE_HEADER' },
                      [
                        <Button
                          type="primary"
                          onClick={() => onCreateItemLineSon(item)}
                          disabled={!allowAddItems}
                          name="create"
                        >
                          {intl.get('hzero.common.button.create').d('新建')}
                        </Button>,
                        <Button onClick={onSaveLine} loading={saveLoading} name="save">
                          {intl.get('hzero.common.button.save').d('保存')}
                        </Button>,
                        <Button
                          onClick={onDeleteLines}
                          disabled={
                            !(
                              activeKey &&
                              `${item.bidLineItemId}` === activeKey &&
                              item.children &&
                              item.children.some((ele) =>
                                itemLineSelectedRowKeys.includes(ele.bidLineItemId)
                              )
                            )
                          }
                          name="delete"
                        >
                          {intl.get('hzero.common.button.delete').d('删除')}
                        </Button>,
                        <Button
                          onClick={this.moveOtherSection}
                          disabled={
                            !(
                              activeKey &&
                              `${item.bidLineItemId}` === activeKey &&
                              item.children &&
                              item.children.some((ele) =>
                                itemLineSelectedRowKeys.includes(ele.bidLineItemId)
                              )
                            )
                          }
                          name="moveOtherSection"
                        >
                          {intl
                            .get(`ssrc.bidHall.model.bidHall.moveOtherSection`)
                            .d('移到其它标段')}
                        </Button>,
                        <Button
                          onClick={() => this.handleBatchExport(item)}
                          disabled={!allowAddItems}
                          name="batchImport"
                        >
                          {intl.get('hzero.common.title.batchImport').d('批量导入')}
                        </Button>,
                        <CommonImportNew
                          auto
                          icon="archive"
                          businessObjectTemplateCode="SSRC.BID_LINE_ITEM"
                          prefixPatch={SRM_SSRC}
                          args={{
                            bidHeaderId: item.bidHeaderId,
                            bidLineItemId: item.bidLineItemId,
                          }}
                          buttonProps={{
                            permissionList: [
                              {
                                code: `ssrc.bid-hall.bid-update.button.batch-import-new`,
                                type: 'button',
                                meaning:
                                  intl
                                    .get(`ssrc.bidHall.view.message.title.bidMaintenance`)
                                    .d('招标书维护') -
                                  intl.get('hzero.common.title.batchImportNew').d('(新)批量导入'),
                              },
                            ],
                          }}
                          buttonText={intl
                            .get('hzero.common.title.batchImportNew')
                            .d('(新)批量导入')}
                          tenantId={getCurrentOrganizationId()}
                          successCallBack={this.fetchItemLine}
                          name="batchImportNew"
                        />,
                        item?.quotationTemplateFlag === 1 && (
                          <QuotationDetailImport
                            sourceHeaderId={item.bidHeaderId}
                            templateCode="SSRC.PROJECT_QUO_DETAIL"
                            sourceFrom="BID"
                            isH0Btn
                            onOk={this.fetchItemLine}
                            onClose={this.fetchItemLine}
                            name="quotationDetailImport"
                          />
                        ),
                      ].filter(Boolean)
                    )}
                  </Form>
                </div>
                <div style={{ marginTop: '24px' }}>
                  {this.renderSectionItemLine(item.children, item.bidLineItemId)}
                </div>
              </Tabs.TabPane>
            );
          })}
        </Tabs>
      </div>
    );
  }

  /**
   * 分配供应商弹窗
   *
   * @returns modal
   * @memberof ItemLineTablePrepare
   */
  renderModal() {
    const {
      header,
      subjectMatterRule,
      distributeSupplierForItemLIne,
      cancelDistribute,
      distributeModalVisible,
      supplierData,
      supplierRecordLoading,
    } = this.props;

    const supplierColumns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 200,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierNum`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 200,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.whetherDistribute`).d('是否分配'),
        dataIndex: 'assignFlag',
        width: 100,
        render: (val, record) => {
          return (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('assignFlag', {
                  initialValue: val,
                })(
                  <Checkbox
                    checkedValue={1}
                    unCheckedValue={0}
                    onChange={(e) => this.whetherAssign(e, val, record)}
                  />
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('subjectMatterRule', {
                  initialValue: subjectMatterRule || header.subjectMatterRule,
                })(<Input />)}
              </Form.Item>
            </React.Fragment>
          );
        },
      },
    ];

    const scrollX = sum(supplierColumns.map((n) => (isNumber(n.width) ? n.width : 0)));

    return (
      <Modal
        visible={distributeModalVisible}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{intl.get(`ssrc.bidHall.model.bidHall.assignSupplier`).d('分配供应商')}</span>
            <div style={{ paddingRight: '20px' }}>
              <Button key="create" type="primary" onClick={distributeSupplierForItemLIne}>
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
            </div>
          </div>
        }
        footer={null}
        width="65%"
        onCancel={cancelDistribute}
      >
        <Form>
          <EditTable
            bordered
            columns={supplierColumns}
            rowKey="itemSupAssignId"
            dataSource={supplierData}
            srcoll={{ x: scrollX }}
            loading={supplierRecordLoading}
            pagination={false}
            onDataChange={this.hasChangeData}
          />
        </Form>
      </Modal>
    );
  }

  render() {
    const {
      match,
      form,
      companyId = null,
      loading,
      saveLoading,
      dataSource = [],
      onCreateLine,
      onSaveLine,
      onDeleteLines,
      organizationId,
      subjectMatterRule,
      itemLineRowSelection,
      itemLineSelectedRowKeys = [],
      onDistributeSupplierForItemLine,
      sourceMethod,
      itemLineExpandedKeys,
      handleExpandRow,
      itemLineQuotationDetailModalVisible,
      bidHall: { setionDetailList = {}, moveSectionDetailList = [], itemLine = [] },
      fetchSectionDetailDataLoading,
      saveSectionDetailDataLoading,
      fetchMoveSectionDataLoading,
      moveOtherSectionDataLoading,
      itemLineEditoringId = '',
      sureItemLineQutationDetail,
      cancelItemLineQutationDetail,
      fetchItemLineQuotationDetailLoading,
      settings,
      customizeTable,
      allowAddItems,
      customizeBtnGroup = noop,
    } = this.props;
    const setting000112 = settings['000112'] && settings['000112'].settingValue;
    const sectionFlag = itemLine.length > 0 ? itemLine[0].sectionFlag : 0;
    const { params } = match;
    const { sectionModelVisible, moveModelVisible, activeKey } = this.state;

    const newData = this.changeDataSource(dataSource);

    // 标段信息
    const sectionDetailProps = {
      organizationId,
      loading: fetchSectionDetailDataLoading,
      saveLoading: saveSectionDetailDataLoading,
      visible: sectionModelVisible,
      onCancel: this.handleCancelSectionDetail,
      onSave: this.saveSectionDetailData,
      dataSource: setionDetailList,
    };
    // 移到其它标段信息
    const otherSectionProps = {
      moveModelVisible,
      loading: fetchMoveSectionDataLoading,
      saveLoading: moveOtherSectionDataLoading,
      onCancel: this.handleCancelOtherSection,
      onChange: this.fetchMoveSectionData,
      dataSource: moveSectionDetailList,
      onMove: this.moveOtherSectionData,
    };

    const itemLineQuotationDetails = dataSource.filter(
      (item) => item.bidLineItemId === itemLineEditoringId
    );

    let ItemLineQutationDetailProps;
    if (sectionFlag) {
      const sectionFlagItemLine = dataSource.filter((item) => {
        if (item.children) {
          return (
            item.children &&
            item.children.length > 0 &&
            item.children.some((child) => child.bidLineItemId === itemLineEditoringId)
          );
        }
        return [];
      });

      const childQuotationDetails =
        sectionFlagItemLine &&
        sectionFlagItemLine.length &&
        sectionFlagItemLine[0].children &&
        sectionFlagItemLine[0].children.length &&
        sectionFlagItemLine[0].children.filter(
          (child) => child.bidLineItemId === itemLineEditoringId
        );

      ItemLineQutationDetailProps = {
        form,
        organizationId,
        itemLineQuotationDetail:
          (childQuotationDetails &&
            childQuotationDetails.length &&
            childQuotationDetails[0].quotationDetails) ||
          [],
        record:
          (childQuotationDetails && childQuotationDetails.length && childQuotationDetails[0]) || {},
        fetchItemLineQuotationDetailLoading,
        itemLineQuotationDetailModalVisible,
        cancelItemLineQutationDetail,
        sureItemLineQutationDetail,
        activeKey,
      };
    } else {
      ItemLineQutationDetailProps = {
        form,
        organizationId,
        itemLineQuotationDetail: itemLineQuotationDetails.length
          ? itemLineQuotationDetails[0].quotationDetails
          : [],
        fetchItemLineQuotationDetailLoading,
        itemLineQuotationDetailModalVisible,
        cancelItemLineQutationDetail,
        sureItemLineQutationDetail,
      };
    }

    // 标的规则  不区分
    const columnsNone = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.bidLineItemNum`).d('行号'),
        dataIndex: 'bidLineItemNum',
        width: 80,
        fixed: 'left',
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.businessUnit`).d('业务实体'),
        dataIndex: 'ouId',
        width: 200,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('ouId', {
                initialValue: record.ouId,
              })(
                <Lov
                  code="SPFM.USER_AUTH.OU"
                  textValue={record.ouName}
                  onChange={(value, dataList) => this.changeOuId(value, dataList, record)}
                  disabled={record.prHeaderId}
                />
              )}
            </Form.Item>
          ) : (
            record.ouName
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.inventoryOrg`).d('库存组织'),
        dataIndex: 'invOrganizationId',
        width: 200,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('invOrganizationId', {
                initialValue: val,
              })(
                <Lov
                  code="HPFM.INV_ORG"
                  textValue={record.invOrganizationName}
                  disabled={!record.$form.getFieldValue('ouId') || record.prHeaderId}
                  onChange={(value, dataList) =>
                    this.changeInvOrganization(value, dataList, record)
                  }
                  queryParams={{
                    ouId: record.$form.getFieldValue('ouId'),
                    enabledFlag: 1,
                    organizationId,
                  }}
                />
              )}
            </Form.Item>
          ) : (
            record.invOrganizationName
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.freightIncludedFlag`).d('是否含运费'),
        dataIndex: 'freightIncludedFlag',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('freightIncludedFlag', {
                initialValue: val,
              })(<Checkbox checkedValue={1} unCheckedValue={0} />)}
            </Form.Item>
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.itemCode`).d('物料编码'),
        dataIndex: 'itemId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('itemId', {
                initialValue: val,
              })(
                <Lov
                  code="SSRC.NEW_CUSTOMER_ITEM"
                  textValue={record.itemCode}
                  disabled={record.prHeaderId}
                  onChange={(value, dataList) => this.changeItemId(value, dataList, record)}
                  queryParams={{
                    invOrganizationId: record.$form.getFieldValue('invOrganizationId'),
                    itemCategoryId: record.$form.getFieldValue('itemCategoryId'),
                    ouId: record.$form.getFieldValue('ouId') || null,
                    companyId,
                  }}
                />
              )}
              {record.$form.getFieldDecorator('itemCode', { initialValue: record.itemCode })}
            </Form.Item>
          ) : (
            record.itemCode
          ),
      },
      {
        title: intl.get(`ssrc.common.goodsDescription`).d('物品描述'),
        dataIndex: 'itemName',
        width: 200,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('itemName', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.common.goodsDescription`).d('物品描述'),
                    }),
                  },
                  {
                    max: 200,
                    message: intl.get('hzero.common.validation.max', {
                      max: 200,
                    }),
                  },
                ],
              })(<Input disabled={record.$form.getFieldValue('itemId') || record.prHeaderId} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.itemCategory`).d('物品分类'),
        dataIndex: 'itemCategoryId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('itemCategoryId', {
                initialValue: record.itemCategoryId,
              })(
                <Lov
                  code="SMDM.TREE_ITEM_CATEGORY"
                  textValue={record.itemCategoryName}
                  textField="itemCategoryName"
                  queryParams={{
                    tenantId: organizationId,
                    itemId: record.$form.getFieldValue('itemId'),
                  }}
                  onChange={(value, dataList) => this.changeItemCategory(value, dataList, record)}
                />
              )}
              {record.$form.getFieldDecorator('itemCategoryName', {
                initialValue: record.itemCategoryName,
              })(<Input style={{ display: 'none' }} />)}
            </Form.Item>
          ) : (
            record.itemCategoryName
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.quotationTemplateName`).d('报价模板'),
        dataIndex: 'quotationTemplateId',
        width: 150,
        render: (val, record) => {
          return ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('quotationTemplateId', {
                  initialValue: record.quotationTemplateId,
                })(
                  <Lov
                    code="SSRC.QUOTATION_TEMPLATE"
                    textValue={record.quotationTemplateName}
                    // textField="quotationTemplateName"
                    queryParams={{
                      tenantId: organizationId,
                    }}
                  />
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('quotationTemplateName', {
                  initialValue: record.quotationTemplateName || '',
                })(<Input />)}
              </Form.Item>
            </React.Fragment>
          ) : (
            record.quotationTemplateName
          );
        },
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.quotationDetails`).d('报价明细'),
        dataIndex: 'quotationDetail',
        width: 100,
        render: (val, record) => {
          return ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              {(record.$form.getFieldValue('itemId') ||
                record.$form.getFieldValue('itemCategoryId') ||
                record.$form.getFieldValue('quotationTemplateId')) &&
              params.bidId &&
              record._status !== 'create' ? (
                <QuotationDetail rowData={record} sourceFrom="BID" />
              ) : null}
            </React.Fragment>
          ) : (
            ''
          );
        },
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('specifications', {
                initialValue: val,
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.model`).d('型号'),
        dataIndex: 'model',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('model', {
                initialValue: val,
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('demandDate', {
                initialValue: val && moment(val),
              })(<DatePicker style={{ width: '100%' }} placeholder="" format={getDateFormat()} />)}
            </Form.Item>
          ) : (
            dateTimeRender(record.demandDate)
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.bidQuantity`).d('需求数量'),
        dataIndex: 'bidQuantity',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('bidQuantity', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.bidQuantity`).d('需求数量'),
                    }),
                  },
                ],
              })(
                <PrecisionInputNumber
                  // precision={6}
                  type="hzero"
                  uom={record.$form.getFieldValue('uomId')}
                  min={0}
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                  // disabled={record.prHeaderId}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.unit`).d('单位'),
        dataIndex: 'uomId',
        width: 200,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('uomId', {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.bidHall.model.bidHall.unit`).d('单位'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    disabled={
                      setting000112 === '1' &&
                      (record.itemCode || record.$form.getFieldValue('itemCode'))
                    }
                    code="SSRC.UOM"
                    textField="uomName"
                  />
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('uomName', { initialValue: record.uomName })(
                  <div />
                )}
              </Form.Item>
            </React.Fragment>
          ) : (
            record.uomName
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.costPrice`).d('标底单价'),
        dataIndex: 'costPrice',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('costPrice', {
                initialValue: val,
              })(
                <PrecisionInputNumber
                  type="hzero"
                  currency={form.getFieldValue('currencyCode')}
                  min={0}
                  max="99999999999999999999"
                />
              )}
            </Form.Item>
          ) : (
            enableRender(val)
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.taxIncludedFlag`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('taxIncludedFlag', {
                initialValue: val,
              })(
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  onChange={(e) => this.setValue(e, val, record)}
                />
              )}
            </Form.Item>
          ) : (
            enableRender(val)
          ),
      },
      {
        title: <span>{intl.get(`ssrc.bidHall.model.bidHall.taxRate`).d('税率')}%</span>,
        dataIndex: 'taxId',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('taxId', {
                  initialValue: val,
                  rules: [
                    {
                      required: record.$form.getFieldValue('taxIncludedFlag') === 1,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.bidHall.model.bidHall.taxRate`).d('税率'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SMDM.TAX"
                    textField="taxRate"
                    textValue={record.taxRate}
                    disabled={!record.$form.getFieldValue('taxIncludedFlag')}
                    onChange={(value, dataList) => this.changeTaxId(value, dataList, record)}
                  />
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('taxRate', { initialValue: record.taxRate })(
                  <div />
                )}
              </Form.Item>
            </React.Fragment>
          ) : (
            record.taxRate
          ),
      },
      {
        title: <span>{intl.get(`ssrc.bidHall.model.bidHall.lineAttachmentUuid`).d('行附件')}</span>,
        dataIndex: 'lineAttachmentUuid',
        width: 120,
        render: (val, record) => (
          <React.Fragment>
            <Form.Item>
              {record.$form.getFieldDecorator('lineAttachmentUuid', {
                initialValue: val,
              })(
                <UploadModal
                  filePreview
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-bid-bidItem"
                  attachmentUUID={val}
                  tenantId={organizationId}
                  text={intl.get(`ssrc.qualiExam.model.button.upload`).d('上传附件')}
                  afterOpenUploadModal={this.afterOpenUploadModal}
                  {...ChunkUploadProps}
                  fileSize={FILE_SIZE}
                />
              )}
            </Form.Item>
          </React.Fragment>
        ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.prNum`).d('采购申请号'),
        dataIndex: 'prNum',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.lineNum`).d('采购申请行号'),
        dataIndex: 'prLineNum',
        width: 120,
      },
      {
        title: intl.get(`hzero.common.button.action`).d('操作'),
        dataIndex: 'action',
        width: 80,
        fixed: 'right',
        render: (_, record) =>
          record.bidLineItemNum && sourceMethod === 'INVITE' && record._status === 'update' ? (
            <Form.Item>
              <a onClick={() => onDistributeSupplierForItemLine(record)}>
                {intl.get(`ssrc.bidHall.view.message.button.distribution`).d('分配')}
              </a>
            </Form.Item>
          ) : (
            ''
          ),
      },
    ];

    const scrollX = sum(columnsNone.map((n) => (isNumber(n.width) ? n.width : 0)));

    return (
      <React.Fragment>
        <div className={styles.detailTitle}>
          <div className={styles.titleLeft}>
            <h3 className={styles.titleName}>
              {intl.get('hzero.common.bidHall.itemLine').d('物品明细')}
            </h3>
          </div>
          {subjectMatterRule === 'PACK' && (
            <div className={styles.titleRight}>
              <Button
                style={{ border: 0, backgroundColor: '#fafafa' }}
                icon="plus"
                onClick={() => this.addSectionTab()}
              >
                {intl.get(`ssrc.bidHall.view.message.button.addSection`).d('新增标段')}
              </Button>
            </div>
          )}
          <div style={{ clear: 'both' }} />
        </div>
        {subjectMatterRule === 'NONE' ? (
          <div>
            <div className={styles['item-list-search']}>
              <Form layout="inline">
                {customizeBtnGroup(
                  { code: 'SSRC.BID_HALL_EDIT.ITEM.TABLE_HEADER' },
                  [
                    <Button
                      type="primary"
                      onClick={onCreateLine}
                      disabled={!allowAddItems}
                      name="create"
                    >
                      {intl.get('hzero.common.button.create').d('新建')}
                    </Button>,
                    <Button
                      onClick={onSaveLine}
                      disabled={dataSource.length === 0}
                      loading={saveLoading}
                      name="save"
                    >
                      {intl.get('hzero.common.button.save').d('保存')}
                    </Button>,
                    <Button
                      onClick={onDeleteLines}
                      disabled={itemLineSelectedRowKeys.length === 0}
                      name="delete"
                    >
                      {intl.get('hzero.common.button.delete').d('删除')}
                    </Button>,
                    <Button
                      onClick={() => this.handleBatchExport(params.bidId)}
                      disabled={!allowAddItems}
                      name="batchImport"
                    >
                      {intl.get('hzero.common.title.batchImport').d('批量导入')}
                    </Button>,
                    <CommonImportNew
                      auto
                      icon="archive"
                      businessObjectTemplateCode="SSRC.BID_LINE_ITEM"
                      prefixPatch={SRM_SSRC}
                      args={{
                        bidHeaderId: params.bidId,
                      }}
                      buttonProps={{
                        permissionList: [
                          {
                            code: `ssrc.bid-hall.bid-update.button.batch-import-new`,
                            type: 'button',
                            meaning:
                              intl
                                .get(`ssrc.bidHall.view.message.title.bidMaintenance`)
                                .d('招标书维护') -
                              intl.get('hzero.common.title.batchImportNew').d('(新)批量导入'),
                          },
                        ],
                      }}
                      buttonText={intl.get('hzero.common.title.batchImportNew').d('(新)批量导入')}
                      tenantId={getCurrentOrganizationId()}
                      successCallBack={this.fetchItemLine}
                      name="batchImportNew"
                    />,
                    newData?.[0]?.quotationTemplateFlag === 1 && (
                      <QuotationDetailImport
                        sourceHeaderId={params.bidId}
                        templateCode="SSRC.PROJECT_QUO_DETAIL"
                        sourceFrom="BID"
                        isH0Btn
                        onOk={this.fetchItemLine}
                        onClose={this.fetchItemLine}
                        name="quotationDetailImport"
                      />
                    ),
                  ].filter(Boolean)
                )}
              </Form>
            </div>

            {customizeTable(
              {
                code: 'SSRC.BID_HALL_EDIT.EDIT_LINE_NONE',
                clearCache: (data = [], dataList = [], callBack) => {
                  if (data.length !== dataList.length) {
                    callBack();
                  }
                },
                useNewValid: true,
              },
              <EditTable
                bordered
                rowKey="bidLineItemId"
                loading={loading}
                columns={columnsNone}
                rowSelection={itemLineRowSelection}
                expandedRowKeys={itemLineExpandedKeys}
                uncontrolled
                scroll={{ x: scrollX }}
                dataSource={newData}
                pagination={false}
                onExpand={handleExpandRow}
                onDataChange={this.hasChangeData}
              />
            )}
          </div>
        ) : (
          this.renderTabs()
        )}
        {this.renderModal()}
        {sectionModelVisible && <SectionDetailModal {...sectionDetailProps} />}
        {moveModelVisible && <OtherSectionModal {...otherSectionProps} />}
        {itemLineQuotationDetailModalVisible && (
          <ItemLineQutationDetailModal {...ItemLineQutationDetailProps} />
        )}
      </React.Fragment>
    );
  }
}
