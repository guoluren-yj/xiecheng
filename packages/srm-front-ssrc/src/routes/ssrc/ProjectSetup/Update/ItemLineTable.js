/**
 * routes 寻源立项-维护／详情/物品
 * @date: 2020-2-24
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Input, Button, Table, Row, Col, Badge } from 'hzero-ui';
import { isFunction, isEmpty, isUndefined, noop } from 'lodash';
import { Bind } from 'lodash-decorators';
import { math } from 'choerodon-ui/dataset';
import { Attachment, Button as C7nButton } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { tableScrollWidth, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import EditTable from 'components/EditTable';
import Upload from 'srm-front-boot/lib/components/Upload';
import Lov from 'components/Lov';
import DocFlow from '_components/DocFlow';
import CommonImportNew from 'hzero-front/lib/components/Import';
import { EDIT_FORM_ITEM_LAYOUT, FORM_COL_4_LAYOUT } from 'utils/constants';
import { PRIVATE_BUCKET } from '_utils/config';

import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import { numberSeparatorRender } from '@/utils/renderer';
import { calculateBasicQty, TooltipTitle, getQtyName, getUomName } from '@/utils/utils';
import QuotationDetailModal from '@/routes/components/QuotationDetailNew/Purchaser';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import QuotationDetailImport from '@/routes/components/QuotationDetailImport';
import { TooltipButton } from '@/routes/components/TooltipButton';
import { releaseApplyApi } from '@/services/projectSetupService';

export default class ItemLineTable extends PureComponent {
  constructor(props) {
    super(props);

    const { onRef } = this.props;
    if (isFunction(onRef)) {
      onRef(this);
    }

    this.state = { releaseApplyLoading: false };
  }

  componentDidMount() {}

  /**
   * 税率改变
   */
  @Bind()
  setValue(e, val, record) {
    if (e.target.checked === 0) {
      record.$form.setFieldsValue({ taxId: undefined, taxRate: undefined });
    }
  }

  /**
   * updateState
   * 保存以改变的行
   */
  @Bind()
  changeDataSoruce(record, data) {
    const { dispatch } = this.props;
    dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        itemLine: data,
      },
    });
  }

  // 计算基本数量
  getCalculateQty = (record = {}, val = '') => {
    const {
      $form: { getFieldValue, setFieldsValue },
    } = record;
    if (getFieldValue('secondaryQuantity') && getFieldValue('secondaryUomId')) {
      calculateBasicQty({
        secondaryQuantity: getFieldValue('secondaryQuantity'),
        itemId: val || getFieldValue('itemId'),
        businessKey: -1,
        doublePrimaryUomId: getFieldValue('uomId'),
        secondaryUomId: getFieldValue('secondaryUomId'),
      }).then((res) => {
        setFieldsValue({
          requiredQuantity: res ?? undefined,
        });
      });
    } else if (getFieldValue('secondaryQuantity') === 0) {
      setFieldsValue({
        requiredQuantity: 0,
      });
    }
  };

  /**
   * 改变物料编码-获取物品描述、单位、双单位、单位转换率
   */
  @Bind()
  changeItemId(val = null, dataList = {}, record = {}) {
    const { doubleUnitFlag } = this.props;
    const {
      $form: { setFieldsValue, getFieldValue },
    } = record;
    if (doubleUnitFlag && val) {
      setFieldsValue({
        secondaryUomId: dataList.secondaryUomId || dataList.uomId,
        secondaryUomName: dataList.secondaryUomName || dataList.uomName,
        uomId: dataList.uomId,
        uomName: dataList.uomName,
      });
      if (dataList.secondaryUomId && dataList.secondaryUomId !== dataList.uomId) {
        setFieldsValue({
          priceBatch: 1,
        });
      }
      this.getCalculateQty(record, val);
    } else {
      setFieldsValue({
        requiredQuantity: getFieldValue('secondaryQuantity'),
        uomId: dataList.orderUomId || dataList.primaryUomId,
        uomName: dataList.orderUomName || dataList.uomName,
        secondaryUomId: dataList.orderUomId || dataList.primaryUomId,
        secondaryUomName: dataList.orderUomName || dataList.uomName,
      });
    }
    setFieldsValue({
      itemId: val,
      itemName: dataList.itemName,
      itemCode: dataList.itemCode,
      specifications: dataList.specifications,
      model: dataList.model,
      itemCategoryId: dataList.categoryId,
      itemCategoryName: dataList.categoryName,
    });
  }

  // 改变基本数量
  @Bind()
  changeSecondaryQuantity(e, record = {}) {
    const { doubleUnitFlag } = this.props;
    const {
      $form: { setFieldsValue, getFieldValue },
    } = record;
    if (e.target.value) {
      if (doubleUnitFlag && getFieldValue('itemId')) {
        this.getCalculateQty(record);
      } else {
        setFieldsValue({
          requiredQuantity: getFieldValue('secondaryQuantity'),
        });
      }
    }
  }

  // 改变单位
  @Bind()
  // eslint-disable-next-line no-unused-vars
  changeUomId(val = null, dataList = {}, record = {}) {
    const { doubleUnitFlag } = this.props;
    const {
      $form: { setFieldsValue, getFieldValue },
    } = record;
    if (doubleUnitFlag && getFieldValue('itemId')) {
      setFieldsValue({
        secondaryUomId: dataList.uomId || undefined,
        secondaryUomName: dataList.uomName || undefined,
      });
      if (dataList.uomId && dataList.uomId !== getFieldValue('uomId')) {
        setFieldsValue({
          priceBatch: 1,
        });
      }
      this.getCalculateQty(record);
    } else if (doubleUnitFlag) {
      setFieldsValue({
        requiredQuantity: getFieldValue('secondaryQuantity'),
        uomId: dataList.uomId || undefined,
        uomName: dataList.uomCodeAndName || undefined,
        secondaryUomId: dataList.uomId || undefined,
        secondaryUomName: dataList.uomCodeAndName || undefined,
      });
    } else {
      setFieldsValue({
        uomId: dataList.uomId || undefined,
        uomName: dataList.uomCodeAndName || undefined,
        secondaryUomId: dataList.uomId || undefined,
        secondaryUomName: dataList.uomCodeAndName || undefined,
      });
    }
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
      itemCategoryId: val,
      itemCategoryName: dataList.categoryName,
    });
  }

  /**
   * 改变税率-获取税率显示值
   */
  @Bind()
  changeTaxId(val, dataList, record) {
    record.$form.setFieldsValue({
      taxRate: dataList.taxRate,
      taxId: dataList.taxId,
    });
  }

  @Bind()
  changeApplicantor(val, dataList, record) {
    record.$form.setFieldsValue({
      requestUserId: val,
      requestUserName: dataList.realName,
    });
  }

  /**
   * 改变业务实体 - 清空库存组织-物料编码-物品描述
   */
  @Bind()
  changeOuId(val, dataList = {}, record) {
    const { ssrcRemote } = this.props;
    const fields = {
      ouName: dataList.ouName,
      invOrganizationId: dataList.invOrganizationId,
      invOrganizationName: dataList.invOrganizationName,
      itemId: undefined,
      itemName: undefined,
      itemCode: undefined,
      secondaryUomId: undefined,
      secondaryUomName: undefined,
      uomId: undefined,
      uomName: undefined,
    };
    const fieldsValue = ssrcRemote
      ? ssrcRemote.process('SSRC_PROJECT_SETUP_UPDATE_PROCESS_CHANGE_OUID_FIELDS_VALUES', fields, {
          dataList,
        })
      : fields;
    record.$form.setFieldsValue(fieldsValue);
  }

  /**
   * 改变库存组织 - 清空物料编码-物品描述
   */
  @Bind()
  changeInvOrganizationId(val, dataList, record) {
    record.$form.setFieldsValue({
      invOrganizationName: dataList.organizationName,
      itemId: undefined,
      itemName: undefined,
      itemCode: undefined,
      secondaryUomId: undefined,
      secondaryUomName: undefined,
      uomId: undefined,
      uomName: undefined,
    });
  }

  // 计算预算行金额
  calcPreLineAmnt(record = {}) {
    const { detailFlag = false } = this.props;
    const { totalPrice = null } = record;
    if (detailFlag) {
      return numberSeparatorRender(totalPrice);
    }
    const {
      $form: { getFieldValue },
    } = record;
    const requiredQuantity = getFieldValue('requiredQuantity');
    const costPrice = getFieldValue('costPrice');
    if (!requiredQuantity || !costPrice) {
      return;
    }

    const ALL = math.multipliedBy(requiredQuantity, costPrice);
    const formatValue = numberSeparatorRender(ALL);
    return formatValue;
  }

  /**
   * 检查表格内容值发生变化
   */
  @Bind()
  hasChangeData(record, changeValues) {
    const { onChangeTableData } = this.props;
    if (!isEmpty(changeValues)) {
      onChangeTableData();
    }
  }

  // 计算预算行金额
  calEstimatedAmount(record = {}) {
    const { detailFlag = false } = this.props;
    const { estimatedAmount = null } = record;
    if (detailFlag) {
      return estimatedAmount;
    }
    const { $form: { getFieldValue = noop } = {} } = record || {};
    const requiredQuantity = getFieldValue('requiredQuantity');
    const estimatedPrice = getFieldValue('estimatedPrice');
    if (!requiredQuantity || !estimatedPrice) {
      return;
    }
    const ALL = math.multipliedBy(requiredQuantity, estimatedPrice);
    const formatValue = numberSeparatorRender(ALL);
    return formatValue;
  }

  changeCategory = (val, dataList = {}, record = {}) => {
    const {
      $form: { setFieldsValue },
    } = record;
    setFieldsValue({
      itemCategoryId: val || undefined,
      itemCategoryName: (dataList || {}).categoryName || undefined,
    });
  };

  // 渲染维护表单
  renderEditTableColumns() {
    const {
      detailFlag = false,
      organizationId,
      linktoPrNumDetail,
      form,
      sourceProjectId,
      doubleUnitFlag,
      onForceSaveLine,
      ssrcRemote,
      sourceProject,
      header,
    } = this.props;

    const columns = [
      form.getFieldValue('subjectMatterRule') === 'PACK'
        ? {
            title: intl.get(`ssrc.projectSetup.model.projectSetup.sectionNum`).d('标段/包编号'),
            dataIndex: 'sectionCode',
            width: 160,
            render: (val, record) => {
              return ['update', 'create'].includes(record._status) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('sectionCode', {
                    initialValue: record.sectionCode,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.projectSetup.model.projectSetup.sectionNum`)
                            .d('标段/包编号'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      style={{ width: '100%' }}
                      textField="sectionCode"
                      queryParams={{ organizationId, sourceProjectId }}
                      code="SSRC.PROJECT_SRCTION"
                      lovOptions={{
                        displayField: 'sectionCode',
                        valueField: 'sectionCode',
                      }}
                      onChange={(value, lovRecord) => {
                        if (isUndefined(value)) {
                          record.$form.setFieldsValue({
                            sectionCode: '',
                            sectionName: '',
                            projectLineSectionId: '',
                          });
                        } else {
                          record.$form.setFieldsValue({
                            sectionCode: lovRecord.sectionCode,
                            sectionName: lovRecord.sectionName,
                            projectLineSectionId: lovRecord.projectLineSectionId,
                          });
                          if (ssrcRemote?.event) {
                            ssrcRemote.event.fireEvent('remoteHandleSectionCodeLov', {
                              record,
                              lovRecord,
                            });
                          }
                        }
                      }}
                    />
                  )}
                  {ssrcRemote
                    ? ssrcRemote.process('SSRC_PROJECT_SETUP_UPDATE_PROCESS_SECTIONNUMBER', null, {
                        record,
                        pageDetailFlag: detailFlag,
                        header,
                      })
                    : null}
                </Form.Item>
              ) : (
                val
              );
            },
          }
        : null,
      form.getFieldValue('subjectMatterRule') === 'PACK'
        ? {
            title: intl.get(`ssrc.projectSetup.model.projectSetup.sectionName`).d('标段/包名称'),
            dataIndex: 'sectionName',
            width: 120,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('sectionName', {
                    initialValue: record.sectionName,
                  })(<Input disabled />)}
                  {record.$form.getFieldDecorator('projectLineSectionId', {
                    initialValue: record.projectLineSectionId,
                  })}
                </Form.Item>
              ) : (
                val
              ),
          }
        : null,
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        dataIndex: 'projectLineItemNum',
        width: 80,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessUnit`).d('业务实体'),
        dataIndex: 'ouId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !detailFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('ouId', {
                initialValue: record.ouId,
              })(
                <Lov
                  disabled={record.prNum}
                  code="SPFM.USER_AUTH.OU"
                  textValue={record.$form.getFieldValue('ouName') || record.ouName}
                  onChange={(value, dataList) => this.changeOuId(value, dataList, record)}
                />
              )}
              {record.$form.getFieldDecorator('ouName', {
                initialValue: record.ouName,
              })}
            </Form.Item>
          ) : (
            record.ouName
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`).d('库存组织'),
        dataIndex: 'invOrganizationId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !detailFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('invOrganizationId', {
                initialValue: val,
              })(
                <Lov
                  code="HPFM.INV_ORG"
                  textValue={
                    record.$form.getFieldValue('invOrganizationName') || record.invOrganizationName
                  }
                  disabled={!record.$form.getFieldValue('ouId') || record.prNum}
                  onChange={(value, dataList) =>
                    this.changeInvOrganizationId(value, dataList, record)
                  }
                  queryParams={{
                    ouId: record.$form.getFieldValue('ouId'),
                    enabledFlag: 1,
                    organizationId,
                  }}
                />
              )}
              {record.$form.getFieldDecorator('invOrganizationName', {
                initialValue: record.invOrganizationName,
              })}
            </Form.Item>
          ) : (
            record.invOrganizationName
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        dataIndex: 'itemId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !detailFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('itemId', {
                initialValue: val,
              })(
                <Lov
                  code="SSRC.NEW_CUSTOMER_ITEM"
                  textValue={record.itemCode}
                  disabled={record.prNum}
                  onChange={(value, dataList) => this.changeItemId(value, dataList, record)}
                  queryParams={{
                    invOrganizationId: record.$form.getFieldValue('invOrganizationId'),
                    itemCategoryId: record.$form.getFieldValue('itemCategoryId'),
                    ouId: record.$form.getFieldValue('ouId'),
                    companyId: form.getFieldValue('companyId'),
                  }}
                  tableDsProps={{
                    autoCount: false,
                    asyncCountFlag: 'Y',
                  }}
                />
              )}
              {record.$form.getFieldDecorator('itemCode', {
                initialValue: record.itemCode,
              })}
              {record.$form.getFieldDecorator('sourceProjectId', {
                initialValue: record.sourceProjectId,
              })}
            </Form.Item>
          ) : (
            record.itemCode
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemDescs`).d('物料描述'),
        dataIndex: 'itemName',
        width: 200,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !detailFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('itemName', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemDescs`).d('物料描述'),
                    }),
                  },
                ],
              })(<Input disabled={record.prNum} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategory`).d('物料类别'),
        dataIndex: 'itemCategoryId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !detailFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('itemCategoryId', {
                initialValue: val,
              })(
                <Lov
                  code="SMDM.CATEGORY.LEVEL_CONTROL_TREE"
                  textValue={
                    record.$form.getFieldValue('itemCategoryName') || record.itemCategoryName
                  }
                  // textField="itemCategoryName"
                  queryParams={{
                    tenantId: organizationId,
                    itemId: record.$form.getFieldValue('itemId'),
                    hzeroUIFlag: 1,
                    businessObjectCode: 'SRM_C_SRM_SSRC_SOURCE_PROJECT',
                  }}
                  tableDsProps={{
                    record: {
                      dynamicProps: {
                        selectable: (_record) => _record.get('isCheck') !== false,
                      },
                    },
                  }}
                  tableProps={{
                    virtual: true,
                    maxHeight: '500px',
                  }}
                  disabled={record.prNum}
                  onChange={(value, dataList) => this.changeCategory(value, dataList, record)}
                />
              )}
              {record.$form.getFieldDecorator('itemCategoryName', {
                initialValue: record.itemCategoryName,
              })}
            </Form.Item>
          ) : (
            record.itemCategoryName
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !detailFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('specifications', {
                initialValue: val,
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
            dataIndex: 'secondaryQuantity',
            width: 120,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) && !detailFlag ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('secondaryQuantity', {
                    initialValue: val,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.inquiryHall.model.inquiryHall.quantity`)
                            .d('需求数量'),
                        }),
                      },
                    ],
                  })(
                    <PrecisionInputNumber
                      // disabled={record.prNum}
                      type="hzero"
                      uom={record.$form.getFieldValue('secondaryUomId')}
                      renderHandler={() => null}
                      min={0}
                      max="99999999999999999999"
                      style={{ width: '100%' }}
                      onBlur={(e) => this.changeSecondaryQuantity(e, record)}
                    />
                  )}
                </Form.Item>
              ) : (
                numberSeparatorRender(val)
              ),
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
            dataIndex: 'secondaryUomId',
            width: 150,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) && !detailFlag ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('secondaryUomId', {
                    initialValue: val,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code={
                        doubleUnitFlag && record.$form.getFieldValue('itemId')
                          ? 'SMDM_ITEM_ORG_UOM'
                          : 'SSRC.UOM'
                      }
                      textValue={
                        record.$form.getFieldValue('secondaryUomName') || record.secondaryUomName
                      }
                      disabled={record.prNum}
                      queryParams={
                        doubleUnitFlag && record.$form.getFieldValue('itemId')
                          ? {
                              itemId: record.$form.getFieldValue('itemId'),
                              primaryUomId: record.$form.getFieldValue('uomId'),
                            }
                          : {}
                      }
                      onChange={(value, dataList) => this.changeUomId(value, dataList, record)}
                    />
                  )}
                  {record.$form.getFieldDecorator('secondaryUomName', {
                    initialValue: record.secondaryUomName,
                  })}
                </Form.Item>
              ) : (
                record.secondaryUomName
              ),
          }
        : null,
      {
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'requiredQuantity',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !detailFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('requiredQuantity', {
                initialValue: val,
                rules: [
                  {
                    required: !doubleUnitFlag,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: getQtyName(doubleUnitFlag),
                    }),
                  },
                ],
              })(
                <PrecisionInputNumber
                  disabled={doubleUnitFlag}
                  type="hzero"
                  uom={record.$form.getFieldValue('uomId')}
                  renderHandler={() => null}
                  min={0}
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                />
              )}
              {!doubleUnitFlag
                ? record.$form.getFieldDecorator('secondaryQuantity', {
                    initialValue: record.secondaryQuantity,
                  })
                : null}
            </Form.Item>
          ) : (
            numberSeparatorRender(val)
          ),
      },
      {
        title: getUomName(doubleUnitFlag),
        dataIndex: 'uomId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !detailFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('uomId', {
                initialValue: val,
                rules: [
                  {
                    required: !doubleUnitFlag,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: getUomName(doubleUnitFlag),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SSRC.UOM"
                  disabled={doubleUnitFlag || record.prNum}
                  textValue={record.$form.getFieldValue('uomName') || record.uomName}
                  onChange={(value, dataList) => this.changeUomId(value, dataList, record)}
                />
              )}
              {record.$form.getFieldDecorator('uomName', {
                initialValue: record.uomName,
              })}
              {!doubleUnitFlag
                ? record.$form.getFieldDecorator('secondaryUomId', {
                    initialValue: record.secondaryUomId,
                  })
                : null}
              {!doubleUnitFlag
                ? record.$form.getFieldDecorator('secondaryUomName', {
                    initialValue: record.secondaryUomName,
                  })
                : null}
            </Form.Item>
          ) : (
            record.uomName
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceBatch`).d('价格批量'),
        dataIndex: 'priceBatch',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('priceBatch', {
                initialValue: val || val === 0 ? val : 1,
                rules: [
                  {
                    required: !(
                      doubleUnitFlag &&
                      record.$form.getFieldValue('itemId') &&
                      record.$form.getFieldValue('secondaryUomId') &&
                      record.$form.getFieldValue('uomId') !==
                        record.$form.getFieldValue('secondaryUomId')
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceBatch`).d('价格批量'),
                    }),
                  },
                  {
                    pattern: /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/,
                    message: intl
                      .get('ssrc.common.pleaseEnterGreatThanZeroNumber')
                      .d('请输入大于0的数值'),
                  },
                ],
              })(
                <PrecisionInputNumber
                  type="hzero"
                  min={0}
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                  renderHandler={() => null}
                  currency={form.getFieldValue('currencyCode')}
                  disabled={
                    doubleUnitFlag &&
                    record.$form.getFieldValue('itemId') &&
                    record.$form.getFieldValue('secondaryUomId') &&
                    record.$form.getFieldValue('uomId') !==
                      record.$form.getFieldValue('secondaryUomId')
                  }
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      doubleUnitFlag
        ? null
        : {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.predictUnitPrice`)
              .d('预算单价(元)'),
            dataIndex: 'costPrice',
            width: 120,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) && !detailFlag ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('costPrice', {
                    initialValue: val,
                  })(
                    <PrecisionInputNumber
                      type="hzero"
                      // precision={2}
                      currency={form.getFieldValue('currencyCode')}
                      renderHandler={() => null}
                      min={0}
                      max="99999999999999999999"
                      // disabled={record.prNum}
                      style={{ width: '100%' }}
                    />
                  )}
                </Form.Item>
              ) : (
                numberSeparatorRender(val)
              ),
          },
      doubleUnitFlag
        ? null
        : {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.forLineAmnt`).d('预算行金额(元)'),
            dataIndex: 'totalPrice',
            width: 120,
            align: 'right',
            render: numberSeparatorRender,
          },
      {
        title: (
          <TooltipTitle
            doubleUnitFlag={doubleUnitFlag}
            title={intl.get(`ssrc.projectSetup.model.projectSetup.estimatedPrice`).d('预估单价')}
            tipValue={intl
              .get(`ssrc.common.model.inquiryHall.estimatedSecondaryUnitPrice`)
              .d('辅助单位对应的预估单价')}
          />
        ),
        textForTitle: intl.get(`ssrc.projectSetup.model.projectSetup.estimatedPrice`).d('预估单价'),
        dataIndex: 'estimatedPrice',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !detailFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('estimatedPrice', {
                initialValue: val,
              })(
                <PrecisionInputNumber
                  type="hzero"
                  renderHandler={() => null}
                  min={0}
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.projectSetup.model.projectSetup.estimatedAmount`).d('预估行金额'),
        dataIndex: 'estimatedAmount',
        width: 100,
        render: numberSeparatorRender,
        // render: (val, record) =>
        //   !detailFlag ? this.calEstimatedAmount(record) : numberSeparatorRender(val),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemRemark`).d('备注'),
        dataIndex: 'itemRemark',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !detailFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('itemRemark', {
                initialValue: val,
              })(<Input disabled={record.prNum} />)}
            </Form.Item>
          ) : (
            numberSeparatorRender(val)
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationTemplateName`).d('报价模板'),
        dataIndex: 'quotationTemplateId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !detailFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('quotationTemplateId', {
                initialValue: val,
              })(
                <Lov
                  code="SSRC.QUOTATION_TEMPLATE"
                  textValue={record.templateName}
                  textField="templateName"
                  queryParams={{
                    tenantId: organizationId,
                  }}
                  // disabled={record.prNum}
                />
              )}
              {record.$form.getFieldDecorator('templateName', {
                initialValue: record.templateName,
              })}
            </Form.Item>
          ) : (
            record.templateName
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        dataIndex: 'quotationDetail',
        width: 100,
        render: (val, record) =>
          (record.itemCategoryId || record.itemId || record.quotationTemplateId) &&
          record.projectLineItemId &&
          record._status !== 'create' ? (
            <>
              <QuotationDetailModal
                rowData={record}
                sourceFrom="PROJECT"
                onOk={() => onForceSaveLine()}
              />
              {record.quotationDetailRequire === 1 && (
                <Badge style={{ marginLeft: '2px' }} status="error" />
              )}
            </>
          ) : null,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineAttachment`).d('行附件'),
        dataIndex: 'itemAttachmentUuid',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !detailFlag ? (
            record.prNum ? (
              <Attachment
                readOnly
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="ssrc-rfx-rfxitem"
                viewMode="popup"
                value={val}
                data={{
                  tenantId: organizationId,
                }}
              />
            ) : (
              <Form.Item>
                {record.$form.getFieldDecorator('itemAttachmentUuid', {
                  initialValue: val,
                })(
                  <Upload
                    filePreview
                    fileSize={FIlESIZE}
                    // viewOnly={record.prNum}
                    // disabled={record.prNum}
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="ssrc-rfx-rfxitem"
                    attachmentUUID={val}
                    tenantId={organizationId}
                    {...ChunkUploadProps}
                  />
                )}
              </Form.Item>
            )
          ) : (
            <Attachment
              readOnly
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-rfxitem"
              viewMode="popup"
              value={val}
              data={{
                tenantId: organizationId,
              }}
            />
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.prNum`).d('采购申请编号'),
        dataIndex: 'prNum',
        width: 150,
        render: (val, record) => (
          <a disabled={!record.prLinkFlag} onClick={() => linktoPrNumDetail(record)}>
            {val}
          </a>
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.prLineNum`).d('采购申请行号'),
        dataIndex: 'prDisplayLineNum',
        width: 150,
      },
      {
        title: intl.get('ssrc.bidHall.model.bidHall.applicant').d('申请人'),
        dataIndex: 'requestUserId',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !detailFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('requestUserId', {
                initialValue: val,
              })(
                <Lov
                  code="HIAM.TENANT.USER"
                  queryParams={{
                    organizationId,
                  }}
                  disabled={record.prNum}
                  textValue={record.requestUserName || null}
                  lovOptions={{
                    displayField: 'realName',
                  }}
                  onChange={(values, data) => this.changeApplicantor(values, data, record)}
                />
              )}
              {record.$form.getFieldDecorator('requestUserName', {
                initialValue: record.requestUserName,
              })}
            </Form.Item>
          ) : (
            record.requestUserName
          ),
      },
      {
        title: intl.get('ssrc.common.model.common.projectTaskNme').d('项目任务名称'),
        dataIndex: 'projectTaskId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !detailFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('projectTaskId', {
                initialValue: val,
              })(
                <Lov
                  code="SIEC.PROJECT_TASK_TREE"
                  disabled={Number(record.projectTaskDisableFlag) === 1}
                  textValue={record.projectTaskName || null}
                  textField="taskName"
                  onChange={(value, lovRecord) => {
                    record.$form.setFieldsValue({
                      projectTaskId: lovRecord?.taskId,
                      projectTaskName: lovRecord?.taskName,
                    });
                  }}
                  queryParams={{
                    hzeroUIFlag: 1,
                    businessObjectCode: 'SRM_C_SRM_SSRC_SOURCE_PROJECT',
                  }}
                  tableDsProps={{
                    record: {
                      dynamicProps: {
                        selectable: (_record) => _record.get('isCheck') !== false,
                      },
                    },
                  }}
                  tableProps={{
                    virtual: true,
                    maxHeight: '500px',
                  }}
                />
              )}
              {record.$form.getFieldDecorator('projectTaskName', {
                initialValue: record.projectTaskName,
              })}
            </Form.Item>
          ) : (
            record.projectTaskName
          ),
      },
    ].filter(Boolean);

    if (!ssrcRemote) return columns;
    return ssrcRemote.process(
      'SSRC_PROJECT_SETUP_UPDATE_PROCESS_ITEM_TABLE_EDIT_COLUMNS',
      columns,
      {
        detailFlag,
        sourceProject,
      }
    );
  }

  // 渲染明细页表单
  renderDetailTableColumns() {
    const {
      organizationId,
      linktoPrNumDetail,
      header = {},
      doubleUnitFlag,
      ssrcRemote,
      sourceProject,
    } = this.props;
    const { releaseApplyLoading } = this.state;

    const { sourceProjectStatus } = header || {};

    const columns = [
      header.subjectMatterRule === 'PACK'
        ? {
            title: intl.get(`ssrc.projectSetup.model.projectSetup.sectionNum`).d('标段/包编号'),
            dataIndex: 'sectionCode',
            width: 120,
          }
        : null,
      header.subjectMatterRule === 'PACK'
        ? {
            title: intl.get(`ssrc.projectSetup.model.projectSetup.sectionName`).d('标段/包名称'),
            dataIndex: 'sectionName',
            width: 120,
          }
        : null,
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        dataIndex: 'projectLineItemNum',
        width: 80,
        fixed: 'left',
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.docFlow').d('单据流'),
        dataIndex: 'docFlow',
        width: 80,
        render: (_, record) => (
          <DocFlow tableName="ssrc_project_line_item" tablePk={record.projectLineItemId} />
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessUnit`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemDescs`).d('物料描述'),
        dataIndex: 'itemName',
        width: 200,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategory`).d('物料类别'),
        dataIndex: 'itemCategoryName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 120,
      },

      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
            dataIndex: 'secondaryQuantity',
            width: 120,
            render: numberSeparatorRender,
          }
        : null,

      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
            dataIndex: 'secondaryUomName',
            width: 150,
          }
        : null,
      {
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'requiredQuantity',
        width: 120,
        render: numberSeparatorRender,
      },
      {
        title: getUomName(doubleUnitFlag),
        dataIndex: 'uomName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceBatch`).d('价格批量'),
        dataIndex: 'priceBatch',
        align: 'right',
        width: 100,
      },
      doubleUnitFlag
        ? null
        : {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.predictUnitPrice`)
              .d('预算单价(元)'),
            dataIndex: 'costPrice',
            width: 120,
            render: numberSeparatorRender,
          },
      doubleUnitFlag
        ? null
        : {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.forLineAmnt`).d('预算行金额(元)'),
            dataIndex: 'totalPrice',
            width: 120,
            align: 'right',
            render: numberSeparatorRender,
          },
      {
        title: (
          <TooltipTitle
            doubleUnitFlag={doubleUnitFlag}
            title={intl.get(`ssrc.projectSetup.model.projectSetup.estimatedPrice`).d('预估单价')}
            tipValue={intl
              .get(`ssrc.common.model.inquiryHall.estimatedSecondaryUnitPrice`)
              .d('辅助单位对应的预估单价')}
          />
        ),
        dataIndex: 'estimatedPrice',
        width: 110,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.projectSetup.model.projectSetup.estimatedAmount`).d('预估行金额'),
        dataIndex: 'estimatedAmount',
        width: 110,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemRemark`).d('备注'),
        dataIndex: 'itemRemark',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationTemplateName`).d('报价模板'),
        dataIndex: 'templateName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        dataIndex: 'quotationDetail',
        width: 150,
        render: (val, record) => <QuotationDetail rowData={record} sourceFrom="PROJECT" />,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineAttachment`).d('行附件'),
        dataIndex: 'itemAttachmentUuid',
        width: 150,
        render: (val) =>
          val ? (
            <Attachment
              readOnly
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-rfxitem"
              viewMode="popup"
              value={val}
              data={{
                tenantId: organizationId,
              }}
            />
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.prNum`).d('采购申请编号'),
        dataIndex: 'prNum',
        width: 150,
        render: (val, record) => (
          <a disabled={!record.prLinkFlag} onClick={() => linktoPrNumDetail(record)}>
            {val}
          </a>
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.prLineNum`).d('采购申请行号'),
        dataIndex: 'prDisplayLineNum',
        width: 150,
      },
      {
        title: intl.get('ssrc.bidHall.model.bidHall.applicant').d('申请人'),
        dataIndex: 'requestUserName',
        width: 120,
      },
      {
        title: intl.get('ssrc.common.model.common.projectTaskNme').d('项目任务名称'),
        dataIndex: 'projectTaskName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.executingStatus`).d('立项执行状态'),
        dataIndex: 'executingStatusMeaning',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.occupiedQuantities`).d('已占用数量'),
        dataIndex: 'occupiedQuantity',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.executableQuantity`).d('可执行数量'),
        dataIndex: 'executableQuantity',
        width: 150,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'action',
        width: 150,
        render: (_, record) => {
          const { executingStatus, prLineId, isShowReleaseButton } = record || {};
          // 【释放申请】按钮显示逻辑：
          // 【立项头状态】= 【完成】 && 【立项行执行状态】= 【未寻源】 ||【部分寻源】 && 当前行为申请转的行
          const isShowReleaseFlag =
            sourceProjectStatus === 'FINISHED' &&
            ['UNSOURCED', 'PARTIALLY_SOURCED'].includes(executingStatus) &&
            !!prLineId &&
            isShowReleaseButton !== 0;

          return isShowReleaseFlag ? (
            <C7nButton
              onClick={() => this.handleReleaseApply(record)}
              loading={releaseApplyLoading}
              funcType="link"
            >
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.releaseApply`).d('释放申请')}
            </C7nButton>
          ) : null;
        },
      },
    ].filter(Boolean);
    if (!ssrcRemote) return columns;
    return ssrcRemote.process(
      'SSRC_PROJECT_SETUP_UPDATE_PROCESS_ITEM_TABLE_DETAIL_COLUMNS',
      columns,
      {
        sourceProject,
      }
    );
  }

  @Bind()
  async handleReleaseApply(record) {
    const { onSearch } = this.props;
    const data = Object.assign({}, record);
    delete data._status;

    this.setState({ releaseApplyLoading: true });

    try {
      const res = await releaseApplyApi([data]);
      if (getResponse(res)) {
        notification.success();
        // 重新刷新数据
        onSearch();
      }
    } finally {
      this.setState({ releaseApplyLoading: false });
    }
  }

  @Bind()
  renderButtons() {
    const {
      sourceProjectId,
      form,
      saveLoading,
      dataSource = [],
      onCreateLine,
      onSaveLine,
      fetchItemLine,
      onDeleteLines,
      batchMainItemLine,
      deleteLoading,
      itemLineSelectedRowKeys = [],
      importProps = {},
      onBatchImport = () => {},
      onCopyLines,
      header,
      handleQuoteApproval,
      ssrcRemote,
      fetchSectionLine,
      handleItemLineRowSelectChange,
      itemLineSelectedRows,
    } = this.props;

    const quotationTemplateFlag = dataSource.length
      ? dataSource[0]?.quotationTemplateFlag !== 1
      : true;
    const buttons = [
      <Button placement="bottomLeft" type="primary" onClick={onCreateLine} name="create">
        {intl.get('hzero.common.button.create').d('新建')}
      </Button>,
      <TooltipButton
        onClick={onSaveLine}
        help={intl.get('ssrc.common.view.message.item-line.add.tip').d('请先新增物料行')}
        disabled={dataSource.length === 0}
        style={{ marginLeft: '8px', marginRight: '8px' }}
        loading={saveLoading}
        name="save"
      >
        {intl.get('hzero.common.button.save').d('保存')}
      </TooltipButton>,
      <TooltipButton
        onClick={onDeleteLines}
        help={intl.get('ssrc.common.view.message.item-line.select.tip').d('请先勾选物料行')}
        loading={deleteLoading}
        disabled={itemLineSelectedRowKeys.length === 0}
        style={{ marginLeft: '8px' }}
        name="delete"
      >
        {intl.get('hzero.common.button.delete').d('删除')}
      </TooltipButton>,

      <TooltipButton
        help={intl.get('ssrc.common.view.message.item-line.select.tip').d('请先勾选物料行')}
        onClick={onCopyLines}
        disabled={itemLineSelectedRowKeys.length === 0}
        name="copy"
        style={{ marginLeft: '8px' }}
      >
        {intl.get('hzero.common.button.copy').d('复制')}
      </TooltipButton>,
      <Button
        onClick={onBatchImport}
        style={{ marginLeft: '8px', marginRight: '8px' }}
        name="batchImport"
      >
        {intl.get(`ssrc.projectSetup.view.message.button.materialImport`).d('物料导入')}
      </Button>,
      <CommonImportNew
        {...importProps}
        buttonText={intl
          .get(`ssrc.projectSetup.view.message.button.materialImportNew`)
          .d('(新)物料导入')}
        buttonProps={{
          style: {
            marginLeft: '8px',
            marginRight: '8px',
          },
          permissionList: [
            {
              code: `ssrc.new-project-setup.update.button.material-import-new`,
              type: 'button',
              meaning:
                intl.get('ssrc.projectSetup.view.message.title.projectSetup').d('寻源立项') -
                intl
                  .get(`ssrc.projectSetup.view.message.button.materialImportNew`)
                  .d('(新)物料导入'),
            },
          ],
        }}
        name="batchImportNew"
      />,
      form.getFieldValue('subjectMatterRule') === 'PACK' && (
        <TooltipButton
          // style={{ marginRight: '55px' }}
          onClick={batchMainItemLine}
          help={intl.get('ssrc.common.view.message.item-line.select.tip').d('请先勾选物料行')}
          disabled={itemLineSelectedRowKeys.length === 0}
          name="batchMaintenance"
        >
          {intl.get('ssrc.supplierQuotation.view.button.batchMaintenance').d('批量维护')}
        </TooltipButton>
      ),
      <span style={{ marginLeft: '8px', marginRight: '8px' }} name="quotationDetailImport">
        <QuotationDetailImport
          name="supplierQuotation"
          sourceHeaderId={sourceProjectId}
          isDisabled={quotationTemplateFlag}
          templateCode=" SSRC.PROJECT_QUO_DETAIL"
          sourceFrom="PROJECT"
          isH0Btn
          buttonText={intl
            .get(`ssrc.inquiryHall.view.message.title.supplierQuotation`)
            .d('报价明细导入')}
          onOk={fetchItemLine}
          onClose={fetchItemLine}
          buttonTooltip={intl
            .get('ssrc.projectSetup.view.message.save.template.tip')
            .d('请先维护物料行的报价模板并保存')}
        />
      </span>,
      header.projectFrom === 'REFERENCE' && (
        <Button
          onClick={handleQuoteApproval}
          name="quoteApproval"
          style={{ marginLeft: '8px', marginRight: '8px' }}
        >
          {intl.get(`ssrc.projectSetup.view.message.button.quoteApproval`).d('引用申请立项')}
        </Button>
      ),
    ].filter(Boolean);

    if (!ssrcRemote) return buttons;

    return ssrcRemote.process('SSRC_PROJECT_SETUP_UPDATE_PROCESS_ITEM_BUTTONS', buttons, {
      form,
      sourceProjectId,
      fetchItemLine,
      fetchSectionLine,
      itemLineSelectedRowKeys,
      handleItemLineRowSelectChange,
      itemLineSelectedRows,
      currentThis: this,
      dataSource,
    });
  }

  render() {
    const {
      organizationId,
      sourceProjectId,
      form,
      loading,
      detailFlag = false,
      dataSource = [],
      pagination = {},
      onSearch,
      customizeTable,
      custLoading = false,
      fetchItemLine,
      itemLineRowSelection,
      customizeBtnGroup,
      ssrcRemote,
    } = this.props;

    const columns = detailFlag ? this.renderDetailTableColumns() : this.renderEditTableColumns();
    const scrollX = tableScrollWidth(columns || []);

    const CommonProps = {
      bordered: true,
      rowKey: 'projectLineItemId',
      loading,
      columns,
      scroll: { x: scrollX, y: 480 },
      dataSource,
      pagination,
      onChange: (page) => onSearch(page),
      custLoading,
      fetchItemLine,
    };

    const batchEditNode = form.getFieldValue('subjectMatterRule') === 'PACK' && (
      <Form className="writable-row-custom">
        <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_4_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.sectionNum`).d('标段/包编号')}
            >
              {form.getFieldDecorator('sectionCode')(
                <Lov
                  style={{ width: '100%' }}
                  queryParams={{ organizationId, sourceProjectId }}
                  code="SSRC.PROJECT_SRCTION"
                  lovOptions={{
                    displayField: 'sectionName',
                    valueField: 'sectionCode',
                  }}
                  onChange={(value, lovRecord) => {
                    if (isUndefined(value)) {
                      form.setFieldsValue({
                        sectionCode: '',
                        sectionName: '',
                      });
                    } else {
                      form.setFieldsValue({
                        sectionCode: lovRecord.sectionCode,
                        sectionName: lovRecord.sectionName,
                        projectLineSectionId: lovRecord.projectLineSectionId,
                      });
                    }
                  }}
                  {...(ssrcRemote
                    ? ssrcRemote.process(
                        'SSRC_PROJECT_SETUP_UPDATE_PROCESS_PROJECT_SECTION_CODE_CONFIG',
                        {},
                        {}
                      ) || {}
                    : {})}
                />
              )}
            </Form.Item>
            <Form.Item style={{ display: 'none' }}>
              {form.getFieldDecorator('sectionName', {
                initialValue: form.getFieldValue('sectionName') || '',
              })(<Input />)}
            </Form.Item>
            <Form.Item style={{ display: 'none' }}>
              {form.getFieldDecorator('projectLineSectionId', {
                initialValue: form.getFieldValue('projectLineSectionId') || '',
              })(<Input />)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );

    const buttonWarpStyle = {
      display: 'flex',
      flexDirection: 'row-reverse',
      marginBottom: form.getFieldValue('subjectMatterRule') !== 'PACK' ? '16px' : null,
      marginTop: form.getFieldValue('subjectMatterRule') === 'PACK' ? '-51px' : null,
    };

    if (detailFlag) {
      return customizeTable(
        {
          code: 'SSRC.PROJECT_SETUP_DETAIL.LINE_ITEM', // 单元编码，必传
        },
        <Table {...CommonProps} />
      );
    } else {
      return (
        <React.Fragment>
          {ssrcRemote
            ? ssrcRemote.render('SSRC_PROJECT_SETUP_UPDATE_RENDER_BATCH_EDIT_FORM', batchEditNode)
            : batchEditNode}
          <div
            style={
              ssrcRemote
                ? ssrcRemote.process(
                    'SSRC_PROJECT_SETUP_UPDATE_PROCESS_BUTTON_WARP_STYLE',
                    buttonWarpStyle
                  )
                : buttonWarpStyle
            }
          >
            {customizeBtnGroup(
              { code: 'SSRC.PROJECT_SETUP_EDIT.LINE_ITEM_BUTTON' },
              this.renderButtons()
            )}
          </div>
          {customizeTable(
            {
              code: 'SSRC.PROJECT_SETUP_EDIT.LINE_ITEM',
            },
            <EditTable
              {...CommonProps}
              scrollX={{ x: scrollX }}
              rowSelection={itemLineRowSelection}
            />
          )}
        </React.Fragment>
      );
    }
  }
}
