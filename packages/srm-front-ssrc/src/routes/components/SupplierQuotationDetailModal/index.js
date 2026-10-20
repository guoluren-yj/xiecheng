/**
 * 供应商报价/物品明细/报价明细
 * @date: 2020-02-20
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Modal, Form, Row, Col, Button, InputNumber, Input, Select, DatePicker } from 'hzero-ui';
import { isEmpty } from 'lodash';
import moment from 'moment';

import { EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { getDateFormat, tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

import Lov from 'components/Lov';
import Switch from 'components/Switch';
import Checkbox from 'components/Checkbox';
import Upload from 'srm-front-boot/lib/components/Upload';
import TLEditor from 'components/TLEditor';
import EditTable from 'components/EditTable';
import style from '@/routes/ssrc/common.less';
import styles from './index.less';

import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';

const { Option } = Select;
const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class SupplierQuotationDetailModal extends Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) {
      onRef(this);
    }

    this.state = {
      abandonedFlag: 0, // 禁用标识
    };
  }

  componentDidMount() {
    const {
      itemRecord: { abandonedFlag = 0 },
    } = this.props;
    this.setState({
      abandonedFlag,
    });
  }

  /**
   * 渲染表格数据源
   *
   * @param {*} [itemLineQuotationDetail=[]]
   * @returns
   * @memberof ScoreElementTable
   */
  renderDataSource(itemLineQuotationDetail = []) {
    if (!itemLineQuotationDetail) {
      return [];
    }
    const DetailList = itemLineQuotationDetail.map((item) => {
      let newQuotationColumns = [];
      let elementValue = {};
      const { quotationColumns = [] } = item;
      if (!quotationColumns) {
        return item;
      }
      newQuotationColumns = quotationColumns.map((newItem) => {
        elementValue = {
          ...elementValue,
          [newItem.columnName]: newItem.supQuotationColumnValue || null,
          [`${newItem.columnName}Required`]:
            newItem.quotationColumnValue || newItem.requiredFlag || null,
        };
        return newItem;
      });
      return {
        ...item,
        ...elementValue,
        quotationColumns: newQuotationColumns,
      };
    });

    return DetailList;
  }

  // 整理组件基本属性
  collectAttrProps(attrs = [], itemData = {}) {
    if (!attrs || !Array.isArray(attrs) || !attrs.length) {
      return {};
    }

    let data = {};
    attrs.forEach((item) => {
      const { attributeName = '', attributeValue = null } = item;
      const BoolAttrs = ['allowThousandth', 'showToday'];
      const NumberAttrs = ['maxLength', 'max', 'min', 'step', 'precision'];

      if (attributeValue === 'null' || !attributeValue) {
        return;
      }

      if (BoolAttrs.includes(attributeName)) {
        data = Object.assign(data, {
          [attributeName]: !(attributeValue === '0' || !attributeValue),
        });
      } else if (NumberAttrs.includes(attributeName)) {
        data = Object.assign(data, {
          [attributeName]: Number(attributeValue) || null,
        });
      } else if (attributeValue !== 'null') {
        const values = this.getFormatValue(attributeValue, itemData);
        data = Object.assign(data, {
          [attributeName]: values,
        });
      }
    });
    return data;
  }

  /**
   * 组件渲染
   *
   * @param {*} [data={}]
   * @returns
   * @memberof ItemQutationDetailModal
   */
  renderCurComponent(record = {}, data = {}) {
    const { organizationId, code, quotationStatus = null } = this.props;
    const { abandonedFlag = 0 } = this.state;
    const { componentType, lovCode, quotationColumnCmpts = [] } = data;
    const allAttributesProps = this.collectAttrProps(quotationColumnCmpts, data);
    const isDisable = quotationStatus === 'QUOTED' ? true : this.isDisabled(record, data);
    const alls = {
      ...allAttributesProps,
      code: lovCode,
      disabled: isDisable || abandonedFlag,
      style: { width: '100%' },
    };

    switch (componentType) {
      case 'Input':
        return <Input {...alls} />;
      case 'InputNumber':
        return <InputNumber {...alls} />;
      case 'TextArea':
        return <Input.TextArea {...alls} />;
      case 'ValueList':
        return (
          <Select {...alls}>
            {code[lovCode] &&
              code[lovCode].map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.meaning}
                </Option>
              ))}
          </Select>
        );
      case 'DatePicker':
        return <DatePicker format={getDateFormat()} />;
      // components
      case 'Lov':
        return <Lov {...alls} />;
      case 'Switch':
        return <Switch {...alls} />;
      case 'Upload':
        return <Upload tenantId={organizationId} filePreview {...alls} />;
      case 'Checkbox':
        return <Checkbox {...alls} />;

      default:
        return <Input />;
    }
  }

  /**
   * 表格列渲染
   *
   * @param {*} [dataSource=[]]
   * @returns
   * @memberof ItemQutationDetailModal
   */
  renderColumns(dataSource = []) {
    const {
      quotationHeader: { quotationStatus = '' },
    } = this.props;
    const { abandonedFlag = 0 } = this.state;
    let rowColumns = [];

    if (isEmpty(dataSource)) {
      return [
        {
          title: intl.get(`ssrc.inquiryHall.model.template.quoConfigName`).d('报价明细项'),
          dataIndex: 'configName',
          width: 180,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {this.props.form.getFieldDecorator(`configName#${record.supQuotationDetailId}`, {
                  initialValue: record.configName,
                })(
                  <TLEditor
                    label={intl
                      .get(`ssrc.inquiryHall.model.template.quoConfigName`)
                      .d('报价明细项')}
                    field="configName"
                    token={record._token}
                    disabled={
                      record.createFlag !== 1 || quotationStatus === 'QUOTED' || abandonedFlag
                    }
                  />
                )}
              </FormItem>
            ) : (
              val
            ),
        },
      ];
    } else {
      rowColumns = dataSource.map((item) => {
        return {
          dataIndex: `${item.columnName}`,
          title: `${item.columnName}`,
          width: 150,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {this.props.form.getFieldDecorator(
                  `inputTypeCode#${record.supQuotationDetailId}#${item.quotationColumnId}`,
                  {
                    initialValue: this.getFormatValue(val, item),
                    rules: [
                      {
                        required: this.isRequired(record, item),
                        message: intl.get('hzero.common.validation.notNull', {
                          name: `${item.columnName}`,
                        }),
                      },
                    ],
                  }
                )(this.renderCurComponent(record, item))}
              </FormItem>
            ) : (
              val
            ),
        };
      });

      return [
        {
          title: intl.get(`ssrc.inquiryHall.model.template.quoConfigName`).d('报价明细项'),
          dataIndex: 'configName',
          width: 180,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {this.props.form.getFieldDecorator(`configName#${record.supQuotationDetailId}`, {
                  initialValue: record.configName,
                })(
                  <TLEditor
                    label={intl
                      .get(`ssrc.inquiryHall.model.template.quoConfigDetailName`)
                      .d('报价明细项名称')}
                    field="configName"
                    token={record._token}
                    disabled={
                      record.createFlag !== 1 || quotationStatus === 'QUOTED' || abandonedFlag
                    }
                  />
                )}
              </FormItem>
            ) : (
              val
            ),
        },
        ...rowColumns,
      ];
    }
  }

  /**
   * 获取格式化值
   *
   * @param {*} [val=null]
   * @param {*} item
   */
  getFormatValue(val = null, item = {}) {
    const { componentType } = item;
    if (componentType === 'DatePicker') {
      return val ? moment(val) : null;
    }

    return val;
  }

  /**
   * 组件的属性提取
   *
   * @param {*} [record={}]
   * @param {*} [item={}]
   * @returns
   * @memberof ItemQutationDetailModal
   */
  isRequired(record = {}, item = {}) {
    const { columnName = null } = item;
    if (!columnName) {
      return false;
    }
    const isRequiredValue = record[`${columnName}Required`] || null;
    const result =
      isRequiredValue === 'REQUIRED' || isRequiredValue === 1 || isRequiredValue === '1';
    return result;
  }

  /**
   * 组件是否禁用
   *
   * @param {*} [record={}]
   * @param {*} [item={}]
   * @returns
   * @memberof ItemQutationDetailModal
   */
  isDisabled(record = {}, item = {}) {
    const { columnName = null } = item;
    if (!columnName) {
      return false;
    }

    const result = record[`${columnName}Required`] === 'READONLY';
    return result;
  }

  render() {
    const {
      itemRecord = {},
      quotationHeader = {},
      organizationId,
      form = {},
      visible = false,
      fetchQuotationDetail,
      saveLoading,
      deleteLoading,
      fetchLoading,
      itemLineQuotationDetail = [],
      closeQuotationData,
      itemQuotationPagination = {},
      QuotationDetailDataSource = {},
      rowSelection,
      handleElementAdd,
      handleElememntDelete,
      saveEditElement,
      selectedRowKeys = [],
    } = this.props;
    const { abandonedFlag = 0 } = this.state;
    const { getFieldDecorator } = form;

    const { quotationStatus = null } = quotationHeader;
    const {
      attachmentNeedFlag,
      attachmentUuid,
      templateNum,
      templateName,
      allowCreateFlag,
    } = QuotationDetailDataSource;
    let supAtmUUId = null;
    if (!QuotationDetailDataSource.quoDetailAttachmentUuid) {
      supAtmUUId = itemLineQuotationDetail.filter((item) => item && item.quoDetailAttachmentUuid);
      supAtmUUId = supAtmUUId && supAtmUUId.length ? supAtmUUId[0].quoDetailAttachmentUuid : null;
    } else {
      supAtmUUId = QuotationDetailDataSource.quoDetailAttachmentUuid;
    }

    let newDataSource = [];
    let columns = [];
    let scrollX = null;

    if (!isEmpty(itemLineQuotationDetail)) {
      newDataSource = this.renderDataSource(itemLineQuotationDetail) || [];
      columns = this.renderColumns(itemLineQuotationDetail[0].quotationColumns || []);
      scrollX = tableScrollWidth(columns) || 0;
    }

    return (
      <Modal
        visible={visible}
        title={intl.get(`ssrc.inquiryHall.view.message.title.quotationDetail`).d('报价明细')}
        onCancel={closeQuotationData}
        confirmLoading={saveLoading}
        onOk={saveEditElement}
        width="70%"
      >
        <div>
          <Row className={style.headerInfo}>
            <Col span={12}>
              <FormItem>{templateNum ? `${templateNum} - ${templateName}` : null}</FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.attachmentRequired`)
                  .d('附件必传')}
              >
                {getFieldDecorator('attachmentNeedFlag', {
                  initialValue: attachmentNeedFlag,
                })(<Checkbox disabled style={{ marginRight: '16px' }} />)}
                {attachmentNeedFlag ? (
                  <React.Fragment>
                    {getFieldDecorator('quoDetailAttachmentUuid', {
                      initialValue: supAtmUUId,
                    })(
                      <Upload
                        viewOnly={quotationStatus === 'QUOTED' || abandonedFlag}
                        bucketName={PRIVATE_BUCKET}
                        bucketDirectory="ssrc-rfx-rfxheader"
                        attachmentUUID={supAtmUUId}
                        tenantId={organizationId}
                        filePreview
                        fileSize={FIlESIZE}
                        {...ChunkUploadProps}
                      />
                    )}
                  </React.Fragment>
                ) : null}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label={intl
                  .get(`ssrc.inquiryHall.model.template.allowCreateFlag`)
                  .d('允许供应商新建明细行')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                <Checkbox checked={allowCreateFlag} disabled />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label={intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.purchaseAttachmentUpload`)
                  .d('采购方附件上传')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                <Upload
                  viewOnly
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="quotation-template"
                  attachmentUUID={attachmentUuid}
                  tenantId={organizationId}
                  icon="download"
                  filePreview
                  fileSize={FIlESIZE}
                />
              </FormItem>
            </Col>
          </Row>
        </div>
        {allowCreateFlag === 1 && quotationStatus !== 'QUOTED' && (
          <div>
            <Form layout="inline" className={styles['ssrc-quotation-detail-buttons-groups']}>
              <Button type="primary" disabled={abandonedFlag} onClick={handleElementAdd}>
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>
              <Button
                onClick={handleElememntDelete}
                disabled={isEmpty(selectedRowKeys) || abandonedFlag}
                loading={deleteLoading}
                style={{ marginRight: '16px' }}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
            </Form>
          </div>
        )}
        <EditTable
          bordered
          rowKey="supQuotationDetailId"
          columns={columns}
          dataSource={newDataSource}
          scroll={{ x: scrollX }}
          loading={fetchLoading}
          rowSelection={allowCreateFlag === 1 ? rowSelection : false}
          onChange={(page) => fetchQuotationDetail(page, itemRecord)}
          pagination={itemQuotationPagination}
        />
      </Modal>
    );
  }
}
