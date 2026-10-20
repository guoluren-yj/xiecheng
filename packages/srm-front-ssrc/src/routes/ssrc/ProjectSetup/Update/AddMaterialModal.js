/**
 * routes 寻源立项-维护／供应商/批量添加Modal
 * @date: 2020-2-25
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import { Bind } from 'lodash-decorators';
import React, { Component } from 'react';
import { isEmpty, sum, isNumber } from 'lodash';
import { Drawer, Form, Button, Input, InputNumber, Badge } from 'hzero-ui';
import { Icon, Attachment } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import { Header, Content } from 'components/Page';
import Upload from 'srm-front-boot/lib/components/Upload';
import EditTable from 'components/EditTable';
import { calculateBasicQty, TooltipTitle, getQtyName, getUomName } from '@/utils/utils';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import QuotationDetailModal from '@/routes/components/QuotationDetailNew/Purchaser';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { TooltipButton } from '@/routes/components/TooltipButton';
import { numberSeparatorRender } from '@/utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import CommonImportNew from 'hzero-front/lib/components/Import';
import DynamicButtons from '_components/DynamicButtons';

import { ChunkUploadProps } from '@/utils/SsrcRegx';

@Form.create({ fieldNameProp: null })
export default class AddMaterialModal extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

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
    } else if (doubleUnitFlag) {
      setFieldsValue({
        requiredQuantity: getFieldValue('secondaryQuantity'),
        uomId: dataList.primaryUomId || undefined,
        uomName: dataList.uomName || undefined,
        secondaryUomId: dataList.primaryUomId || undefined,
        secondaryUomName: dataList.uomName || undefined,
      });
    } else {
      setFieldsValue({
        uomId: dataList.primaryUomId || undefined,
        uomName: dataList.uomName || undefined,
        secondaryUomId: dataList.primaryUomId || undefined,
        secondaryUomName: dataList.uomName || undefined,
      });
    }
    record.$form.setFieldsValue({
      itemId: val,
      itemName: dataList.itemName,
      itemCode: dataList.itemCode,
      specifications: dataList.specifications,
      model: dataList.model,
      itemCategoryId: dataList.categoryId,
      itemCategoryName: dataList.categoryName,
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
  changeOuId(val, dataList, record) {
    const { ssrcRemote } = this.props;
    const fields = {
      ouName: dataList.ouName,
      invOrganizationId: undefined,
      itemId: undefined,
      itemName: undefined,
      itemCode: undefined,
      uomId: undefined,
      uomName: undefined,
      secondaryUomId: undefined,
      secondaryUomName: undefined,
    };
    const fieldsValue = ssrcRemote
      ? ssrcRemote.process(
          'SSRC_PROJECT_SETUP_UPDATE_PROCESS_SECTION_CHANGE_OUID_FIELDS_VALUES',
          fields,
          {
            dataList,
          }
        )
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
      uomId: undefined,
      uomName: undefined,
      secondaryUomId: undefined,
      secondaryUomName: undefined,
    });
  }

  // 计算预算行金额
  calcPreLineAmt(record = {}) {
    const { detailFlag = false } = this.props;
    const { totalPrice = null } = record;
    if (detailFlag) {
      return totalPrice;
    }

    const {
      $form: { getFieldValue },
    } = record;

    const requiredQuantity = getFieldValue('secondaryQuantity');
    const costPrice = getFieldValue('costPrice');
    if (!requiredQuantity || !costPrice) {
      return;
    }

    const ALL = requiredQuantity * costPrice;
    const formatValue = numberSeparatorRender(ALL);
    return formatValue;
  }

  // 计算头上预算金额
  @Bind()
  changeQuantityOrCostPrice(val = null, record = {}) {
    const {
      $form: { getFieldValue },
    } = record;
    const estimatedPrice = getFieldValue('estimatedPrice');
    const costPrice = getFieldValue('costPrice');
    record.$form.setFieldsValue({
      estimatedAmount: math.multipliedBy(val, estimatedPrice || null) || '',
    });
    record.$form.setFieldsValue({
      totalPrice: math.multipliedBy(val, costPrice || null) || '',
    });
  }

  // 计算行预估金额
  @Bind()
  changeTalEstimatedAmount(val = null, record = {}) {
    record.$form.setFieldsValue({
      estimatedAmount: math.multipliedBy(
        val,
        record.$form.getFieldValue('secondaryQuantity') || ''
      ),
    });
  }

  // 计算行预算金额
  @Bind
  changeCostPrice(val, record) {
    record.$form.setFieldsValue({
      totalPrice: math.multipliedBy(val, record.$form.getFieldValue('secondaryQuantity')) || '',
    });
  }

  /**
   * 物料导入
   * @param {!string} type - 导入方式
   */
  @Bind()
  handleMaterialImport(type) {
    const { oneBatchImport, handleBatchExport } = this.props;
    if (type === 'excel') {
      return oneBatchImport();
    }
    if (type === 'newExcel') return;
    return handleBatchExport();
  }

  getButtons() {
    const {
      detailFlag,
      dataSource,
      saveMaterialLoading,
      deleteMaterialLoading,
      createSectionItem,
      saveSectionItemLine,
      deleteSectionItemLine,
      addMaterialSelectedRowKeys,
      importProps = {},
    } = this.props;
    return [
      !detailFlag && {
        name: 'batchImport',
        group: true,
        child: (
          <Button>
            {intl.get(`ssrc.projectSetup.view.message.selectOption.materialImport`).d('物料导入')}{' '}
            <Icon type="arrow_drop_down" />
          </Button>
        ),
        children: [
          {
            name: 'excelImport',
            child: intl
              .get(`ssrc.projectSetup.view.message.selectOption.excelImport`)
              .d('excel导入'),
            btnProps: {
              onClick: () => this.handleMaterialImport('excel'),
            },
          },
          {
            name: 'excelInfoNew',
            btnComp: CommonImportNew,
            btnProps: {
              name: 'excelInfoNew',
              ...importProps,
              buttonText: intl
                .get(`ssrc.projectSetup.view.message.selectOption.excelImportNew`)
                .d('(新)excel导入'),
              buttonProps: {
                style: { border: 'none' },
                icon: null,
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
              },
              onClick: () => this.handleMaterialImport('newExcel'),
            },
          },
          {
            name: 'selectedMaterialImport',
            child: intl
              .get(`ssrc.projectSetup.view.message.selectOption.selectedMaterialImport`)
              .d('已有物料导入'),
            btnProps: {
              onClick: () => this.handleMaterialImport('select'),
            },
          },
        ],
      },
      !detailFlag && {
        name: 'save',
        btnComp: TooltipButton,
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          type: 'primary',
          onClick: () => saveSectionItemLine(false),
          help: intl.get('ssrc.common.view.message.item-line.add.tip').d('请先新增物料行'),
          disabled: isEmpty(dataSource),
          loading: saveMaterialLoading,
          style: { marginRight: 5 },

        },
      },
      !detailFlag && {
        name: 'delete',
        btnComp: TooltipButton,
        child: intl.get('hzero.common.button.delete').d('删除'),
        btnProps: {
          type: 'primary',
          onClick: () => deleteSectionItemLine(),
          help: intl.get('ssrc.common.view.message.item-line.select.tip').d('请先勾选物料行'),
          disabled: addMaterialSelectedRowKeys.length === 0,
          loading: deleteMaterialLoading,
        },
      },
      !detailFlag && {
        name: 'create',
        child: intl.get('hzero.common.button.create').d('新建'),
        btnProps: {
          onClick: () => createSectionItem(),
          type: 'primary',
        },
      },
    ].filter(Boolean);
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

  // 改变基本数量
  @Bind()
  changeSecondaryQuantity(e, record = {}) {
    const { doubleUnitFlag = false } = this.props;
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
    const { doubleUnitFlag = false } = this.props;
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
    } else {
      setFieldsValue({
        requiredQuantity: getFieldValue('secondaryQuantity'),
        uomId: dataList.uomId || undefined,
        uomName: dataList.uomCodeAndName || undefined,
        secondaryUomId: dataList.uomId || undefined,
        secondaryUomName: dataList.uomCodeAndName || undefined,
      });
    }
  }

  render() {
    const {
      form,
      detailFlag,
      organizationId,
      visible,
      dataSource,
      loading,
      onCancel,
      pagination,
      onChange,
      rowSelection,
      customizeBtnGroup,
      doubleUnitFlag = false,
      saveSectionForce,
    } = this.props;

    const columns = [
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
                  textValue={record.ouName}
                  onChange={(value, dataList) => this.changeOuId(value, dataList, record)}
                />
              )}
              {record.$form.getFieldDecorator('ouName', { initialValue: record.ouName })}
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
                  }}
                  tableDsProps={{
                    autoCount: false,
                    asyncCountFlag: 'Y',
                  }}
                />
              )}
              {record.$form.getFieldDecorator('itemCode', { initialValue: record.itemCode })}
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
                  textValue={record.itemCategoryName}
                  textField="itemCategoryName"
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
                />
              )}
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
                      min={0}
                      max="99999999999999999999"
                      type="hzero"
                      uom={record.$form.getFieldValue('secondaryUomId')}
                      style={{ width: '100%' }}
                      onBlur={(e) => this.changeSecondaryQuantity(e, record)}
                      // onChange={(values) => this.changeQuantityOrCostPrice(values, record)}
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
                <React.Fragment>
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
                        queryParams={
                          doubleUnitFlag && record.$form.getFieldValue('itemId')
                            ? {
                                itemId: record.$form.getFieldValue('itemId'),
                                primaryUomId: record.$form.getFieldValue('uomId'),
                              }
                            : {}
                        }
                        onChange={(value, dataList) => this.changeUomId(value, dataList, record)}
                        disabled={record.prNum}
                      />
                    )}
                  </Form.Item>
                  <Form.Item style={{ display: 'none' }}>
                    {record.$form.getFieldDecorator('secondaryUomName', {
                      initialValue: record.secondaryUomName,
                    })(<div />)}
                  </Form.Item>
                </React.Fragment>
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
                  textValue={record.$form.getFieldValue('uomName') || record.uomName}
                  disabled={doubleUnitFlag || record.prNum}
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
          ['update', 'create'].includes(record._status) && !detailFlag ? (
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
                <InputNumber
                  max="99999999999999999999"
                  style={{ width: '100%' }}
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
                  disabled={record.prNum}
                />
              )}
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
          record.projectLineItemId ? (
            detailFlag ? (
              <QuotationDetail rowData={record} sourceFrom="PROJECT" />
            ) : (
              <>
                <QuotationDetailModal
                  rowData={record}
                  sourceFrom="PROJECT"
                  onOk={() => saveSectionForce(false)}
                />
                {record.quotationDetailRequire === 1 && (
                  <Badge style={{ marginLeft: '2px' }} status="error" />
                )}
              </>
            )
          ) : null,
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
                      min={0}
                      max="99999999999999999999"
                      type="hzero"
                      currency={form.getFieldValue('currencyCode')}
                      style={{ width: '100%' }}
                      // onChange={(values) => this.changeCostPrice(values, record)}
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
            render: (val, record) =>
              ['update', 'create'].includes(record._status) && !detailFlag ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('totalPrice', {
                    initialValue: val,
                  })(<Input disabled />)}
                </Form.Item>
              ) : (
                numberSeparatorRender(val)
              ),
          },
      form.getFieldValue('subjectMatterRule') === 'PACK'
        ? {
            title: (
              <TooltipTitle
                doubleUnitFlag={doubleUnitFlag}
                title={intl
                  .get(`ssrc.projectSetup.model.projectSetup.estimatedPrice`)
                  .d('预估单价')}
                tipValue={intl
                  .get(`ssrc.common.model.inquiryHall.estimatedSecondaryUnitPrice`)
                  .d('辅助单位对应的预估单价')}
              />
            ),
            textForTitle: intl
              .get(`ssrc.projectSetup.model.projectSetup.estimatedPrice`)
              .d('预估单价'),
            dataIndex: 'estimatedPrice',
            width: 120,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) && !detailFlag ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('estimatedPrice', {
                    initialValue: val,
                  })(
                    <PrecisionInputNumber
                      min={0}
                      max="99999999999999999999"
                      type="hzero"
                      style={{ width: '100%' }}
                      currency={form.getFieldValue('currencyCode')}
                      // onChange={(values) => this.changeTalEstimatedAmount(values, record)}
                    />
                  )}
                </Form.Item>
              ) : (
                numberSeparatorRender(val)
              ),
          }
        : null,
      form.getFieldValue('subjectMatterRule') === 'PACK'
        ? {
            title: intl.get(`ssrc.projectSetup.model.projectSetup.estimatedAmount`).d('预估行金额'),
            dataIndex: 'estimatedAmount',
            width: 120,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) && !detailFlag ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('estimatedAmount', {
                    initialValue: val,
                  })(<Input disabled />)}
                </Form.Item>
              ) : (
                numberSeparatorRender(val)
              ),
          }
        : null,
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
            val
          ),
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
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.prLineNum`).d('采购申请行号'),
        dataIndex: 'prLineNum',
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
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <Drawer
        closable
        destroyOnClose
        width={1000}
        zIndex={900}
        visible={visible}
        onClose={onCancel}
        title={
          !detailFlag
            ? intl.get(`ssrc.projectSetup.view.message.title.addMaterial`).d('添加物料')
            : intl.get(`ssrc.projectSetup.view.message.title.viewMaterial`).d('查看物料')
        }
      >
        <Header>
          {customizeBtnGroup(
            {
              code: 'SSRC.PROJECT_SETUP_EDIT.SECTION_LINE_ITEM_BUTTON',
              pro: true,
            },
            <DynamicButtons buttons={this.getButtons()} />
          )}
        </Header>
        <Content>
          <EditTable
            bordered
            rowKey="projectLineItemId"
            loading={loading}
            columns={columns}
            scroll={{ x: scrollX }}
            dataSource={dataSource}
            pagination={pagination}
            rowSelection={!detailFlag ? rowSelection : null}
            onChange={(page) => onChange(page)}
          />
        </Content>
      </Drawer>
    );
  }
}
