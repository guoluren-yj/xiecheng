/*
 * ContractBusinessTerms - 业务条款
 * @date: 2019-05-14
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Input, InputNumber, DatePicker, Popover, Select, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction, find, isArray, isEmpty } from 'lodash';
import moment from 'moment';

import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { tableScrollWidth } from 'utils/utils';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import LovMultiple from '@/routes/components/LovMultiple';
import { renderThousandthNum } from '@/utils/util';
import styles from './index.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const viewMessagePrompt = 'spcm.common.view.message';

/**
 * ContractBusinessTerms - 业务条款
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Array} collapseKeys - 折叠面板数组
 * @reactProps {Boolean} editable - 编辑状态
 * @reactProps {Object} dataSource - 数据源
 * @return React.element
 */
export default class ContractBusinessTerms extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // tenantId: getCurrentOrganizationId(),
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  /**
   * 改变设置已编辑标识
   */
  @Bind()
  handleChangeFormItem() {
    const { onChangeState } = this.props;
    onChangeState({ termEdited: true });
  }

  /**
   * 表单域监听
   */
  @Bind()
  handleDataChange() {
    const { dispatch = () => {}, formChanged } = this.props;
    if (!formChanged) {
      dispatch({
        type: 'contractCommon/updateState',
        payload: {
          formChanged: true,
        },
      });
    }
  }

  /**
   * 根据值集编码获得值集数据
   * @param {*} record 行数据
   */
  @Bind()
  handleSelectFocus = (record) => {
    const { dispatch = () => {} } = this.props;
    dispatch({
      type: 'contractCommon/fetchTermContentSelect',
      payload: record.termTypeLov,
    }).then((res) => {
      record.$form.setFieldsValue({ termTypeList: res });
    });
  };

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const { editable, maintainEditable, headerInfo = {}, dataSource = [] } = this.props;
    const { pcTypeId } = headerInfo;
    const columnArray = [
      {
        title: intl.get(`spcm.purchaseRequisitionCreation.model.termTypeCode`).d('业务条款编码'),
        dataIndex: 'termTypeCode',
        width: 80,
      },
      {
        title: intl.get(`spcm.purchaseRequisitionCreation.model.termTypeName`).d('业务条款名称'),
        dataIndex: 'termTypeName',
        width: 230,
        // render: (val, record) =>
        //   ['create', 'update'].includes(record._status) &&
        //   (editable || maintainEditable) &&
        //   pcTypeId ? (
        //     <FormItem>
        //       {record.$form.getFieldDecorator(`termTypeName`, {
        //         rules: [
        //           {
        //             required: true,
        //             message: intl.get('hzero.common.validation.notNull', {
        //               name: intl
        //                 .get(`spcm.purchaseRequisitionCreation.model.termTypeName`)
        //                 .d('业务条款名称'),
        //             }),
        //           },
        //         ],
        //         initialValue: record.termTypeCode,
        //       })(
        //         <Lov
        //           code="SPCM.PC_TERM_TYPE"
        //           textValue={val}
        //           onChange={(value, lovRecord = {}) => {
        //             const {
        //               termTypeCode,
        //               termContentDefault: termContent,
        //               remark,
        //               termType,
        //               termTypeLov,
        //               termTypeId,
        //               termTypeList,
        //               nullableFlag,
        //             } = lovRecord || {};
        //             Object.assign(record, {
        //               remark,
        //               termType,
        //               termTypeCode,
        //               termContent,
        //               termTypeLov,
        //               termTypeId,
        //               termTypeList,
        //               nullableFlag,
        //             });
        //             this.handleChangeFormItem();
        //           }}
        //           queryParams={{
        //             pcTypeId,
        //             excludeTermCodes: dataSource
        //               ?.filter((item) => item.termTypeCode)
        //               .map((item) => item.termTypeCode)
        //               .toString(),
        //           }}
        //         />
        //       )}
        //     </FormItem>
        //   ) : (
        //     val
        //   ),
      },
      {
        title: intl.get(`spcm.purchaseRequisitionCreation.model.termContent`).d('业务条款内容'),
        dataIndex: 'termContent',
        width: 300,
        render: (val, record) => {
          let Com;
          const businessTermsContentSelectDefaultValues = record.termTypeList || [];
          let termContentReadOnlyVal = '';
          const termContentReadOnlyObj = find(record.termTypeList, { value: record.termContent });
          if (termContentReadOnlyObj) {
            termContentReadOnlyVal = termContentReadOnlyObj.meaning;
          } else {
            termContentReadOnlyVal = val;
          }
          switch (record.termType) {
            case 'VARCAHR':
              Com = <TextArea onChange={this.handleChangeFormItem} />;
              break;
            case 'TEXT':
              Com = <TextArea onChange={this.handleChangeFormItem} />;
              break;
            case 'DECIMAL':
              Com = (
                <InputNumber
                  style={{ width: '100%' }}
                  max={99999999999999}
                  allowThousandth
                  onChange={this.handleChangeFormItem}
                />
              );
              break;
            case 'DATE':
              Com = (
                <DatePicker
                  style={{ width: '100%' }}
                  onChange={this.handleChangeFormItem}
                  format={DEFAULT_DATE_FORMAT}
                />
              );
              break;
            case 'DATETIME':
              Com = (
                <DatePicker
                  style={{ width: '100%' }}
                  showTime
                  onChange={this.handleChangeFormItem}
                  placeholder={intl.get(`${viewMessagePrompt}.timePlaceholder`).d('请输入时间')}
                  format={DEFAULT_DATETIME_FORMAT}
                />
              );
              break;
            case 'LOV':
              Com = (
                <Select
                  showSearch
                  allowClear
                  style={{ width: '100%' }}
                  onChange={this.handleChangeFormItem}
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {businessTermsContentSelectDefaultValues.length &&
                    businessTermsContentSelectDefaultValues.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              );
              break;
            default:
              Com = <Input />;
              break;
          }
          const rules = [
            {
              required: record.nullableFlag === 0,
              message: intl.get('hzero.common.validation.notNull', {
                name: intl
                  .get(`spcm.purchaseRequisitionCreation.model.termContent`)
                  .d('业务条款内容'),
              }),
            },
          ];
          if (record.termType === 'VARCAHR') {
            rules.push({
              max: 480,
              message: intl.get('hzero.common.validation.max', { max: 480 }),
            });
          } else if (record.termType === 'TEXT') {
            rules.push({
              max: 2000,
              message: intl.get('hzero.common.validation.max', { max: 2000 }),
            });
          }
          // else if (record.termType === 'DECIMAL') {
          //   rules.push({
          //     validator: (rule, value, callback) => {
          //       if (isString(value) && value.length > 14) {
          //         callback(intl.get('hzero.common.validation.max', { max: 14 }));
          //       }
          //       callback();
          //     },
          //   });
          // }
          if (['create', 'update'].includes(record._status) && (editable || maintainEditable)) {
            let initialValue;
            if (record.termType === 'DATE') {
              initialValue = record.termContent
                ? moment(record.termContent, DEFAULT_DATE_FORMAT)
                : null;
            } else if (record.termType === 'DATETIME') {
              initialValue = record.termContent ? moment(record.termContent) : null;
            } else if (record.termType === 'LOV') {
              // const termContentObj = find(record.termTypeList, { value: record.termContent });
              // if (termContentObj) {
              // initialValue = termContentObj.meaning;
              // }
              initialValue = record.termContent;
            } else if (record.termType === 'DECIMAL') {
              initialValue =
                record.termContent || record.termContent === 0 ? record.termContent : null;
            } else {
              initialValue = record.termContent;
            }
            return (
              <FormItem>
                {record.$form.getFieldDecorator(`termContent`, {
                  rules,
                  initialValue,
                })(Com)}
              </FormItem>
            );
          } else {
            return (
              <Popover
                content={
                  record.termType === 'DECIMAL' ? renderThousandthNum(val) : termContentReadOnlyVal
                }
                overlayStyle={{ width: '346px', wordWrap: 'break-word' }}
                placement="bottomLeft"
                trigger="hover"
              >
                {record.termType === 'DECIMAL' ? renderThousandthNum(val) : termContentReadOnlyVal}
              </Popover>
            );
          }
        },
      },
      {
        title: intl.get(`spcm.purchaseRequisitionCreation.model.termRemark`).d('业务条款说明'),
        dataIndex: 'remark',
        width: 120,
        render: (_, record) => (
          <Popover
            content={record.remark}
            overlayStyle={{ width: '492px', wordWrap: 'break-word' }}
            placement="bottomLeft"
            trigger="hover"
          >
            {record.remark}
          </Popover>
        ),
      },
    ];
    return columnArray;
  }

  /**
   * 选中行改变回调
   * @param {*} selectedRowKeys
   * @param {*} selectedRows
   */
  @Bind()
  handleChangeSelection(selectedRowKeys, selectedRows) {
    const { onSelectionChange } = this.props;
    onSelectionChange(selectedRowKeys, selectedRows, 'term');
  }

  render() {
    const {
      loading,
      onSearch,
      pagination = {},
      dataSource = [],
      headerInfo = {},
      checkArtificial,
      deleting = false,
      editable,
      maintainEditable,
      selectedRows = [],
      onAdd = () => {},
      onDelete = () => {},
      customizeBtnGroup = () => {},
    } = this.props;
    const { pcTypeId } = headerInfo;
    const rowKey = 'termId';
    const selectedRowKeys = selectedRows.map((n) => n[rowKey]);
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleChangeSelection,
    };
    const columns = this.getColumns();
    const scrollX = tableScrollWidth(columns);
    const editTableProps = {
      loading,
      columns,
      pagination,
      dataSource,
      rowKey,
      rowSelection: checkArtificial && rowSelection,
      bordered: true,
      onChange: (page) => onSearch(page),
      scroll: { x: scrollX },
      className: styles['contract-busi-terms'],
      onDataChange: this.handleDataChange,
    };
    return (
      <>
        {(editable || maintainEditable) && (
          <div className={styles['btn-wrapper']}>
            {customizeBtnGroup(
              {
                code: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.BUSINESSTERMS.BTN_GROUP',
              },
              [
                <LovMultiple
                  isButton
                  data-name="create"
                  type="primary"
                  changeSelectRows={onAdd}
                  queryParams={{
                    pcTypeId,
                    excludeTermCodes: dataSource
                      ?.filter((item) => item.termTypeCode)
                      .map((item) => item.termTypeCode)
                      .toString(),
                  }}
                  code="SPCM.PC_TERM_TYPE"
                  buttonText={intl.get(`hzero.common.button.create`).d('新建')}
                />,
                <Button
                  data-name="delete"
                  loading={deleting}
                  onClick={onDelete}
                  disabled={isArray(selectedRows) && isEmpty(selectedRows)}
                >
                  {intl.get(`hzero.common.button.delete`).d('删除')}
                </Button>,
              ]
            )}
          </div>
        )}
        <EditTable {...editTableProps} />
      </>
    );
  }
}
