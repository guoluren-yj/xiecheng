import React, { PureComponent, Fragment } from 'react';
import { Form, InputNumber, DatePicker, Modal, Icon, Alert, Row, Col } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { MAX_QUAN_NUMBER, THROTTLE_TIME } from '@/routes/components/utils/constant';
import Lov from 'components/Lov';
import { isEmpty, isNil } from 'lodash';
import intl from 'utils/intl';
import { getPrecision } from '@/routes/components/utils';
import { getDateFormat, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import styles from './index.less';

const EDIT_FORM_ITEM_LAYOUT = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};
const FORM_COL_LAYOUT = {
  span: 24,
};

const FormItem = Form.Item;
const tenantId = getCurrentOrganizationId();
// const organizationId = getUserOrganizationId();
@Form.create({ fieldNameProp: null })
export default class BatchEditModal extends PureComponent {
  currentData = {};
  // @Bind()
  // handleTaxAll(field, lovRecord){
  //   console.log('field', field, 'lovRecord', lovRecord);
  //   const {form}=this.props;
  //   form.setFieldsValue({ a: 123});

  // }

  // componentDidUpdate(prevProps) {
  // this.currentData = prevProps.form.getFieldsValue();
  //  console.log('currentData', this.currentData, 'form', prevProps.form);
  // }

  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  async handleBatchOk() {
    //  const { handleBatchOk } = this.props;
    //  handleBatchOk();
    const {
      validateItemAndInv,
      hasPriceLibrary,
      dataSource,
      form,
      onChangeListData,
      selectedListRows,
      headerInfo,
    } = this.props;
    const { sourceBillTypeCode } = headerInfo;
    const keys = selectedListRows.map((n) => n.poLineId);
    const currentData = filterNullValueObject(form.getFieldsValue());
    let invFlag = false;
    if (currentData.invOrganizationId) {
      invFlag = await validateItemAndInv(currentData.invOrganizationId);
      if (invFlag) {
        return;
      }
    }
    const newDataSource = dataSource.map((item) => {
      if (isEmpty(selectedListRows) || keys.includes(item.poLineId)) {
        const params = { ...currentData };
        Object.keys(currentData).forEach(async (key) => {
          if (
            ['taxId', 'taxRate', 'enteredTaxIncludedPrice', 'unitPrice'].includes(key) &&
            hasPriceLibrary &&
            item.$form.getFieldValue('priceLibraryId')
          ) {
            params[key] = undefined;
          } else if (['invOrganizationId', 'invOrganizationName'].includes(key) && invFlag) {
            params[key] = undefined;
          } else if (
            ['taxId', 'taxRate', 'invOrganizationId', 'invOrganizationName'].includes(key) &&
            (sourceBillTypeCode === 'SOURCE' || sourceBillTypeCode === 'CONTRACT_ORDER') &&
            !isNil(item.$form.getFieldValue(key))
          ) {
            params[key] = undefined; // 寻源和协议库存组织和税率有值就不可编辑
          } else {
            item.$form.setFieldsValue({ [key]: params[key] });
          }
        });
        return {
          ...item,
          ...filterNullValueObject(params),
        };
      } else {
        return {
          ...item,
        };
      }
    });
    onChangeListData(newDataSource);
    this.closeModel();
    form.resetFields();
  }

  @Bind()
  getCustomizeCode() {
    const { headerInfo = {} } = this.props;
    const { poSourcePlatform } = headerInfo;
    let code;
    switch (poSourcePlatform) {
      case 'ERP':
        code = 'SODR.ORDER_CREATE_LINE_LIST.BATCH_ERP';
        break;
      //    case 'E-COMMERCE':
      //      code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_EC';
      //      break;
      case 'SRM':
        code = 'SODR.ORDER_CREATE_LINE_LIST.BATCH_SRM';
        break;
      case 'SHOP':
        code = 'SODR.ORDER_CREATE_LINE_LIST.BATCH_SRM';
        break;
      case 'CATALOGUE':
        code = 'SODR.ORDER_CREATE_LINE_LIST.BATCH_CATALOGUE';
        break;
      default:
        code = null;
        break;
    }
    return code;
  }

  @Bind()
  closeModel() {
    const { closeModel } = this.props;
    closeModel();
  }

  render() {
    const {
      hasPriceLibrary,
      form,
      selectedListRows,
      headerInfo,
      batchModalVisible,
      customizeForm,
    } = this.props;
    const { getFieldDecorator } = form;
    // console.log('customizeCode', customizeCode, 'form', form, form.getFieldsValue(), 'selectedListRows', selectedListRows);
    const { poSourcePlatform, benchmarkPriceType, defaultPrecision, companyId, ouId } = headerInfo;
    const invOrganizationId = form.getFieldValue('invOrganizationId');
    return (
      <Modal
        title={intl.get(`sodr.workspace.view.button.batchEdit`).d('批量编辑')}
        width="380px"
        visible={batchModalVisible}
        onOk={this.handleBatchOk}
        onCancel={this.closeModel}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
      >
        <Fragment>
          <Alert
            className={styles['order-top-title-alert']}
            border={false}
            message={
              <div>
                <Icon type="help" />

                {!isEmpty(selectedListRows)
                  ? intl
                      .get(`sodr.workspace.view.alert.batchAllMaintainData`, {
                        num: selectedListRows.length,
                      })
                      .d(`已勾选{num}条数据进行批量编辑`)
                  : intl
                      .get('sodr.workspace.view.alert.currentPagebatchAllMaintain')
                      .d('针对当前页全部数据进行批量编辑')}
              </div>
            }
            closable
          />
          {customizeForm(
            {
              form,
              code: this.getCustomizeCode(),
            },
            <Form>
              <Row>
                <Col {...FORM_COL_LAYOUT}>
                  <FormItem
                    {...EDIT_FORM_ITEM_LAYOUT}
                    label={intl.get('sodr.workspace.model.common.invOrganizationId').d('库存组织')}
                  >
                    {getFieldDecorator(`invOrganizationId`)(
                      <Lov
                        code="SPUC.SMDM.INV_ORG"
                        // disabled={!organizationId}
                        textField="invOrganizationName"
                        queryParams={{
                          enabledFlag: 1,
                          tenantId,
                          ouId,
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col {...FORM_COL_LAYOUT}>
                  <FormItem
                    {...EDIT_FORM_ITEM_LAYOUT}
                    label={intl.get('sodr.workspace.model.common.invInventoryId').d('收货库房')}
                  >
                    {getFieldDecorator(`invInventoryId`)(
                      <Lov
                        code="SODR.INVENTORY"
                        disabled={!invOrganizationId}
                        queryParams={{
                          enabledFlag: 1,
                          tenantId,
                          //  organizationId,
                          invOrganizationId, // organizationId,invOrganizationId都可以，不过h0二开值集用organizationId会有问题
                        }}
                        textField="inventoryName"
                        lovOptions={{ valueField: 'inventoryId', displayField: 'inventoryName' }}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col {...FORM_COL_LAYOUT}>
                  <Form.Item
                    label={intl.get('sodr.workspace.model.common.needByDate').d('需求日期')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator(`needByDate`)(<DatePicker format={getDateFormat()} />)}
                  </Form.Item>
                </Col>
              </Row>
              {poSourcePlatform !== 'CATALOGUE' && (
                <Row>
                  <Col {...FORM_COL_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl.get('sodr.workspace.model.common.taxId').d('税率')}
                    >
                      {getFieldDecorator(`taxId`)(
                        <Lov
                          code="SMDM.TAX"
                          textField="taxRate"
                          lovOptions={{ valueField: 'taxId', displayField: 'taxRate' }}
                          queryParams={{ enabledFlag: 1, tenantId }}
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
              )}
              <Row>
                <Col {...FORM_COL_LAYOUT}>
                  <FormItem
                    {...EDIT_FORM_ITEM_LAYOUT}
                    label={intl.get('sodr.workspace.model.common.costId').d('成本中心')}
                  >
                    {getFieldDecorator(`costId`)(
                      <Lov
                        disabled={!companyId}
                        code="SPRM.COST_CENTER"
                        textField="costName"
                        lovOptions={{ valueField: 'costId', displayField: 'costName' }}
                        queryParams={{
                          companyId,
                          tenantId,
                          ouId,
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
              {hasPriceLibrary && poSourcePlatform !== 'CATALOGUE' && (
                <Row>
                  <Col {...FORM_COL_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl
                        .get('sodr.common.model.common.taxedEnteredUnitPrice')
                        .d('原币含税单价')}
                    >
                      {getFieldDecorator(`enteredTaxIncludedPrice`)(
                        <InputNumber
                          style={{ width: '100%' }}
                          min={0}
                          max={MAX_QUAN_NUMBER}
                          precision={getPrecision(defaultPrecision)}
                          disabled={benchmarkPriceType === 'NET_PRICE'}
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
              )}
              {hasPriceLibrary && poSourcePlatform !== 'CATALOGUE' && (
                <Row>
                  <Col {...FORM_COL_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl.get('sodr.workspace.model.common.unitPrice').d('不含税单价')}
                    >
                      {getFieldDecorator(`unitPrice`)(
                        <InputNumber
                          style={{ width: '100%' }}
                          min={0}
                          max={MAX_QUAN_NUMBER}
                          precision={getPrecision(defaultPrecision)}
                          disabled={
                            benchmarkPriceType === 'TAX_INCLUDED_PRICE' ||
                            benchmarkPriceType === undefined
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
              )}
            </Form>
          )}
        </Fragment>
      </Modal>
    );
  }
}
