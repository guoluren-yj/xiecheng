/**
 * docDimension-单据维度
 * @date: 2019-09-19
 * @author: jinmingyang <mingyang.jin@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Form, Input, InputNumber, Modal, Select, Spin } from 'hzero-ui';
// import { Lov as C7NLov } from 'choerodon-ui/pro';
import TransferLov from 'srm-front-cuz/lib/components/Customize/LovMulti/index';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';

import TLEditor from 'components/TLEditor';
import Switch from 'components/Switch';
import Lov from 'components/Lov';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { MODAL_FORM_ITEM_LAYOUT } from 'utils/constants';
import { CODE_UPPER } from 'utils/regExp';

const { Option } = Select;

@Form.create({ fieldNameProp: null })
export default class CreateDrawer extends Component {
  /**
   * 确定
   */
  @Bind()
  handleOk() {
    const { form, onOk, initData } = this.props;
    const { valueSourceType,
      valueSource,
      relatedTableName = '',
      relatedTableCodeColumn,
      relatedTableNameColumn,
      relatedTablePkColumn,
      relatedTableMultiFlag,
      customerTypeFlag,
      ...other } = initData;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        const data = {
          tenantId: getCurrentOrganizationId(),
          ...other,
          ...fieldsValue,
        };
        if (fieldsValue.dimensionType !== 'USER') {
          data.valueSourceType = fieldsValue.valueSourceType || valueSourceType;
          data.valueSource = fieldsValue.valueSource || valueSource;
          data.relatedTableName = fieldsValue.relatedTableName || relatedTableName;
          data.relatedTableCodeColumn = fieldsValue.relatedTableCodeColumn || relatedTableCodeColumn;
          data.relatedTablePkColumn = fieldsValue.relatedTablePkColumn || relatedTablePkColumn;
          data.relatedTableMultiFlag = fieldsValue.relatedTableMultiFlag || relatedTableMultiFlag;
          data.customerTypeFlag = fieldsValue.customerTypeFlag || customerTypeFlag;
          data.relatedTableNameColumn = fieldsValue.relatedTableNameColumn || relatedTableNameColumn;
        }
        onOk(data);
      }
    });
  }

  @Bind()
  dimensionTypeChange(value) {
    const { form } = this.props;
    if (value === 'USER') {
      form.setFieldsValue({
        valueSourceType: '',
        valueSource: '',
        relatedTableName: null,
        relatedTableCodeColumn: null,
        relatedTablePkColumn: null,
        relatedTableMultiFlag: null,
        customerTypeFlag: null,
        relatedTableNameColumn: null
      });
    }
  }


  @Bind()
  dimensionTypeChange(value) {
    const { form } = this.props;
    if (value === 'USER') {
      form.setFieldsValue({
        valueSourceType: '',
        valueSource: '',
        relatedTableName: null,
        relatedTableCodeColumn: null,
        relatedTablePkColumn: null,
        relatedTableMultiFlag: null,
        customerTypeFlag: null,
        relatedTableNameColumn: null
      });
    }
  }

  @Bind()
  changeDocTypeDimRelTenantList(value, rowData) {
    const { form, initData } = this.props;
    if (value) {
      const docTypeDimRelTenantList = Object.keys(rowData).map(i => ({ relTenantId: i, relTenantName: rowData[i], dimensionId: initData?.dimensionId }))
      form.setFieldsValue({
        docTypeDimRelTenantList,
      });
    }
  }


  render() {
    const {
      form,
      title,
      tenantId,
      initData,
      onCancel,
      initLoading,
      modalVisible,
      confirmLoading,
      dimensionTypeList = [],
      dimensionScopeList = [],
      valueSourceTypeList = [],
    } = this.props;
    const {
      dimensionId,
      dimensionCode = '',
      dimensionName = '',
      dimensionType = '',
      orderSeq = '',
      valueSourceType = '',
      viewName = '',
      valueSource = '',
      enabledFlag = 1,
      dimensionScope = null,
      relatedTableName = '',
      relatedTableCodeColumn,
      relatedTableNameColumn,
      relatedTablePkColumn,
      relatedTableMultiFlag = 0,
      customerTypeFlag = 0,
      _token,
      docTypeDimRelTenantList = [],
    } = initData;
    const { getFieldDecorator, getFieldValue } = form;
    return (
      <Modal
        destroyOnClose
        title={title}
        visible={modalVisible}
        transitionName="move-right"
        wrapClassName="ant-modal-sidebar-right"
        onCancel={onCancel}
        onOk={this.handleOk}
        confirmLoading={confirmLoading}
      >
        <Spin spinning={initLoading}>
          <Form>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hiam.docDimension.model.docDimension.dimensionCode').d('维度编码')}
            >
              {getFieldDecorator('dimensionCode', {
                initialValue: dimensionCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hiam.docDimension.model.docDimension.dimensionCode')
                        .d('维度编码'),
                    }),
                  },
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', {
                      max: 30,
                    }),
                  },
                  {
                    pattern: CODE_UPPER,
                    message: intl
                      .get('hzero.common.validation.codeUpper')
                      .d('全大写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
                  },
                ],
              })(
                <Input disabled={!isUndefined(dimensionId)} inputChinese={false} typeCase="upper" />
              )}
            </Form.Item>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hiam.docDimension.model.docDimension.dimensionName').d('维度名称')}
            >
              {getFieldDecorator('dimensionName', {
                initialValue: dimensionName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hiam.docDimension.model.docDimension.dimensionName')
                        .d('维度名称'),
                    }),
                  },
                  {
                    max: 60,
                    message: intl.get('hzero.common.validation.max', {
                      max: 60,
                    }),
                  },
                ],
              })(
                <TLEditor
                  label={intl
                    .get('hiam.docDimension.model.docDimension.dimensionName')
                    .d('维度名称')}
                  field="dimensionName"
                  token={_token}
                />
              )}
            </Form.Item>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hiam.docDimension.model.docDimension.dimensionType').d('维度类型')}
            >
              {getFieldDecorator('dimensionType', {
                initialValue: dimensionType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hiam.docDimension.model.docDimension.dimensionType')
                        .d('维度类型'),
                    }),
                  },
                ],
              })(
                <Select allowClear onChange={this.dimensionTypeChange}>
                  {dimensionTypeList.map((item) => (
                    <Option value={item.value} key={item.meaning}>
                      {item.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hiam.docDimension.model.docDimension.dimensionScope').d('维度范围')}
            >
              {getFieldDecorator('dimensionScope', {
                initialValue: dimensionScope,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hiam.docDimension.model.docDimension.dimensionScope')
                        .d('维度范围'),
                    }),
                  },
                ],
              })(
                <Select allowClear>
                  {dimensionScopeList.map((item) => (
                    <Option value={item.value} key={item.meaning}>
                      {item.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            {getFieldValue('dimensionScope') === 'TENANT_LEVEL' && <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hiam.docDimension.model.docDimension.docTypeDimRelTenantList').d('所属租户')}
            >
              {getFieldDecorator('docTypeDimRelTenantLists', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hiam.docDimension.model.docDimension.docTypeDimRelTenantList')
                        .d('所属租户'),
                    }),
                  },
                ],
                initialValue: docTypeDimRelTenantList?.map(i => i?.relTenantId)?.join(',')
              })(
                <TransferLov
                  style={{ width: '100%' }}
                  code='HPFM.TENANT'
                  translateData={docTypeDimRelTenantList?.map(i => i?.relTenantName)?.join(',')}
                  onChange={this.changeDocTypeDimRelTenantList}
                />
              )}
              {getFieldDecorator('docTypeDimRelTenantList', { initialValue: docTypeDimRelTenantList })}
            </Form.Item>
            }
            {getFieldValue('dimensionType') !== 'USER' && (
              <>
                <Form.Item
                  {...MODAL_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('hiam.docDimension.model.docDimension.valueSourceType')
                    .d('值来源类型')}
                >
                  {getFieldDecorator('valueSourceType', {
                    initialValue: valueSourceType,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('hiam.docDimension.model.docDimension.valueSourceType')
                            .d('值来源类型'),
                        }),
                      },
                    ],
                  })(
                    <Select
                      allowClear
                      onChange={() => {
                        form.setFieldsValue({ valueSource: undefined });
                      }}
                    >
                      {valueSourceTypeList.map((item) => (
                        <Option value={item.value} key={item.meaning}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item
                  label={intl.get('hiam.docDimension.model.docDimension.valueSource').d('值来源')}
                  {...MODAL_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('valueSource', {
                    initialValue: valueSource,
                    rules: [
                      getFieldValue('valueSourceType') !== 'LOV' && {
                        max: 30,
                        message: intl.get('hzero.common.validation.max', {
                          max: 30,
                        }),
                      },
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('hiam.docDimension.model.docDimension.valueSource')
                            .d('值来源'),
                        }),
                      },
                    ].filter(Boolean),
                  })(
                    getFieldValue('valueSourceType') === 'LOV' ? (
                      <Lov
                        code="HPFM.LOV_VIEW.CODE"
                        textValue={viewName}
                        queryParams={{ tenantId }}
                        allowClear
                      />
                    ) : (
                      <Input />
                    )
                  )}
                </Form.Item>
                <Form.Item
                  {...MODAL_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('hiam.docDimension.model.docDimension.relatedTableName')
                    .d('业务对象表名')}
                >
                  {getFieldDecorator('relatedTableName', {
                    initialValue: relatedTableName,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('hiam.docDimension.model.docDimension.valueSourceType')
                            .d('业务对象表名'),
                        }),
                      },
                    ],
                  })(
                    <Input />
                  )}
                </Form.Item>
                <Form.Item
                  {...MODAL_FORM_ITEM_LAYOUT}
                  label={intl.get('hzero.common.label.id').d('主键')}
                >
                  {getFieldDecorator('relatedTablePkColumn', {
                    initialValue: relatedTablePkColumn,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hzero.common.label.id').d('主键'),
                        }),
                      },
                    ],
                  })(
                    <Input inputChinese={false} />
                  )}
                </Form.Item>
                <Form.Item
                  {...MODAL_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('hiam.docDimension.model.docDimension.relatedTableCodeColumn')
                    .d('编码')}
                >
                  {getFieldDecorator('relatedTableCodeColumn', {
                    initialValue: relatedTableCodeColumn,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('hiam.docDimension.model.docDimension.relatedTableCodeColumn')
                            .d('编码'),
                        }),
                      },
                    ],
                  })(
                    <Input inputChinese={false} />
                  )}
                </Form.Item>
                <Form.Item
                  {...MODAL_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('hiam.docDimension.model.docDimension.relatedTableNameColumn')
                    .d('名称')}
                >
                  {getFieldDecorator('relatedTableNameColumn', {
                    initialValue: relatedTableNameColumn,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('hiam.docDimension.model.docDimension.relatedTableNameColumn')
                            .d('名称'),
                        }),
                      },
                    ],
                  })(
                    <Input />
                  )}
                </Form.Item>
                <Form.Item
                  {...MODAL_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('hiam.docDimension.model.docDimension.relatedTableMultiFlag')
                    .d('是否包含多语言')}
                >
                  {getFieldDecorator('relatedTableMultiFlag', {
                    initialValue: relatedTableMultiFlag,
                  })(
                    <Switch />
                  )}
                </Form.Item>
                <Form.Item
                  {...MODAL_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('hiam.docDimension.model.docDimension.customerTypeFlag')
                    .d('是否客户数据')}
                >
                  {getFieldDecorator('customerTypeFlag', {
                    initialValue: customerTypeFlag,
                  })(
                    <Switch />
                  )}
                </Form.Item>
              </>
            )}
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hiam.docDimension.model.docDimension.orderSeq').d('排序号')}
            >
              {getFieldDecorator('orderSeq', {
                initialValue: orderSeq,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hiam.docDimension.model.docDimension.orderSeq').d('排序号'),
                    }),
                  },
                ],
              })(<InputNumber precision={0} min={0} />)}
            </Form.Item>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hzero.common.status').d('状态')}
            >
              {getFieldDecorator('enabledFlag', {
                initialValue: enabledFlag,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hzero.common.status').d('状态'),
                    }),
                  },
                ],
              })(<Switch />)}
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    );
  }
}
