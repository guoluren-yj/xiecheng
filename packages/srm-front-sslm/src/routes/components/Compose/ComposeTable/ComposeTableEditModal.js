import React from 'react';
import {
  filter,
  findIndex,
  forEach,
  isFunction,
  map,
  omit,
  isEmpty,
  isNull,
  isArray,
  divide,
  round,
  isFinite,
  isNil,
} from 'lodash';
import { Modal, Popover } from 'hzero-ui';
import uuid from 'uuid/v4';
import { Attachment } from 'choerodon-ui/pro';
import notification from 'utils/notification';

import intl from 'utils/intl';
// import Upload from 'components/Upload';
import {
  addItemToPagination,
  delItemToPagination,
  getCurrentLanguage,
  getResponse,
  getCurrentOrganizationId,
} from 'utils/utils';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import formatterCollections from 'utils/intl/formatterCollections';
import TransferLov from 'srm-front-cuz/lib/components/Customize/LovMulti/index';
import { yesOrNoRender } from 'utils/renderer';

import UploadModal from '@/routes/components/UploadModal';
import { updateLastUploadDate } from '@/services/investigationService';
import BaseComposeTable from './BaseComposeTable';
import ComposeForm from '../ComposeForm';
import { getComponentProps } from '../ComposeForm/utils';
import { getDisplayValue, getWidthFromWord, queryAttachmentTypeList } from '../utils';

import SupplierCateModal from './SupplierCateModal';

const language = getCurrentLanguage();
const locale = language?.replace('_', '-');

/**
 * 获取计算得来的属性(且耗时多)
 * @param {Object} props
 */
function getComputeTableProps(props) {
  const {
    onRowEdit,
    fields,
    editable,
    addable,
    context,
    removable,
    _status,
    configName,
    sourceKey,
    investgRemote,
    remoteParams,
  } = props;
  // let index = 0;
  // columnWith 在 删除模式下 需要 加上 checkbox 的宽度
  let columnsWidth = removable ? 60 : 0;
  const columns = map(fields, (field) => {
    // const required = field.requiredFlag !== 0;
    // 获取对应字段的配置属性
    const componentProps = getComponentProps({
      field,
      componentType: fields.componentType,
      context,
    });

    const columnWidth = getWidthFromWord({
      word: field.fieldDescription,
      minWidth: 80,
      fontWidth: 14,
      defaultWidth: 100,
      paddingWidth: 36,
    });
    columnsWidth += columnWidth;
    const column = {
      dataIndex: field.fieldCode,
      title: field.fieldDescription,
      width: componentProps.mobilephoneFlag ? 240 : columnWidth,
    };
    if (field.componentType === 'Upload') {
      const uploadProps = getComponentProps({
        field,
        componentType: 'Upload',
        context,
      });
      column.render = (_, record) => {
        const attachmentUUID = record[field.fieldCode];
        if (uploadProps.isAttachmentUrl) {
          return <UploadModal {...uploadProps} record={record} isViewOnly />;
        } else if (sourceKey === '360_PAGE') {
          // 老360附件查看用c7n组件，处理协鑫权限问题
          let template = {};
          if (+uploadProps.hasTemplate) {
            template = {
              attachmentUUID: uploadProps.templateAttachmentUUID,
              bucketName: uploadProps.bucketName,
              bucketDirectory: uploadProps.bucketDirectory,
            };
          }
          return (
            attachmentUUID && (
              <Attachment
                {...uploadProps}
                readOnly
                template={template}
                value={attachmentUUID}
                viewMode="popup"
                queryArgs={{ body: { pageCode: '360_PAGE' } }}
              />
            )
          );
        } else {
          return (
            attachmentUUID && (
              <Upload {...uploadProps} viewOnly attachmentUUID={attachmentUUID} filePreview />
            )
          );
        }
      };
    } else if (field.componentType === 'Checkbox' || field.componentType === 'Switch') {
      column.render = (item) => {
        return !isNil(item) ? yesOrNoRender(+item) : '';
      };
    } else if (field.componentType === 'TransferLov') {
      const transferLovProps = getComponentProps({
        field,
        componentType: 'TransferLov',
        context,
      });
      column.render = (_, record) => {
        return <TransferLov {...transferLovProps} value={record[field.fieldCode]} viewOnly />;
      };
    } else if (field.componentType === 'InputNumber' && +componentProps.allowThousandth) {
      const precision = componentProps.precision && Number(componentProps.precision);
      // 获取浏览器语言，toLocaleString的默认语言为浏览器语言，为保持原有逻辑
      const browserLanguage = navigator.language;
      column.render = (val) => {
        if (
          configName === 'sslmInvestgFin' &&
          (field.fieldCode === 'totalAssets' ||
            field.fieldCode === 'totalLiabilities' ||
            field.fieldCode === 'currentAssets' ||
            field.fieldCode === 'currentLiabilities' ||
            field.fieldCode === 'revenue' ||
            field.fieldCode === 'netProfit')
        ) {
          return (
            (val || val === 0) &&
            parseFloat(val).toLocaleString(locale, { maximumFractionDigits: precision || 4 })
          );
        }
        return (
          (val || val === 0) &&
          (precision
            ? parseFloat(val).toLocaleString(browserLanguage, { maximumFractionDigits: precision })
            : parseFloat(val).toLocaleString())
        );
      };
    } else {
      column.render = (val, record) => {
        if (componentProps.mobilephoneFlag && record.internationalTelMeaning && val) {
          return (
            <Popover content={`${record.internationalTelMeaning} | ${val}`}>
              {`${record.internationalTelMeaning} | ${val}`}
            </Popover>
          );
        }
        if (['attachmentType', 'authenticationType'].includes(field.fieldCode)) {
          return record[`${field.fieldCode}Meaning`] || record[field.fieldCode];
        }
        return getDisplayValue({ field, dataSource: record, _status });
      };
    }
    return column;
  });
  if (editable) {
    columns.unshift({
      title: intl.get('hzero.common.button.action').d('操作'),
      key: 'edit',
      width: 80,
      render: (_, record) => {
        return (
          <a
            onClick={() => {
              onRowEdit(record);
            }}
            disabled={Boolean(record.extSourceAccountFlag)}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        );
      },
    });
  } else if (addable) {
    columns.unshift({
      title: intl.get('hzero.common.button.action').d('操作'),
      key: 'edit',
      width: 80,
      render: (_, record) => {
        if (record.isCreate) {
          return (
            <a
              onClick={() => {
                onRowEdit(record);
              }}
              disabled={Boolean(record.extSourceAccountFlag)}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        }
      },
    });
  }
  const newColumns = investgRemote
    ? investgRemote.process('SSLM_OLD_INVESTIGATION_TAB_TABLE_COLUMNS', columns, {
        ...(remoteParams || {}),
        sourceKey,
        configName,
      })
    : columns;
  return {
    scroll: { x: columnsWidth + 160 }, // 160 = checkbox宽度 + 操作列宽度
    columns: newColumns,
  };
}

@formatterCollections({
  code: ['sslm.investigationDefinition', 'sslm.common'],
})
export default class ComposeTableEditModal extends React.PureComponent {
  state = {
    attachmentTypeList: [],
  };

  // composeForm 的this
  composeForm;

  // supplierCateModal 的this
  supplierCateModal;

  /**
   * 控制半受控属性 dataSource
   * 当 父组件 dataSource 改变时, 使用父组件的 dataSource, 之后都是本组件自己的dataSource
   * @param {Object} nextProps - 接收的属性
   * @param {Object} prevState - 上一个State
   */
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.dataSource !== prevState.prevDataSource) {
      return {
        dataSource: nextProps.dataSource || [],
        pagination: nextProps.pagination,
        prevDataSource: nextProps.dataSource,
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    this.init = this.init.bind(this);
    this.getDataSource = this.getDataSource.bind(this);
    this.getValidateDataSource = this.getValidateDataSource.bind(this);
    this.refComposeForm = this.refComposeForm.bind(this);
    this.handleRowSelectionChange = this.handleRowSelectionChange.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.dataSourceRemove = this.dataSourceRemove.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleRowEdit = this.handleRowEdit.bind(this);
    this.handleModalOkBtnClick = this.handleModalOkBtnClick.bind(this);
    this.handleFinValues = this.handleFinValues.bind(this);
    this.handleModalCancelBtnClick = this.handleModalCancelBtnClick.bind(this);
    this.handleAfterModalClose = this.handleAfterModalClose.bind(this);
    this.handleSupplierCateModalCancel = this.handleSupplierCateModalCancel.bind(this);
    this.refSupplierCateModal = this.refSupplierCateModal.bind(this);
    this.handleSupplierCateModalOk = this.handleSupplierCateModalOk.bind(this);
    this.handleFieldMultiple = this.handleFieldMultiple.bind(this);
    this.handleLastUploadDate = this.handleLastUploadDate.bind(this);
  }

  componentDidMount() {
    const { onGetValidateDataSourceHook, onGetDataSourceHook } = this.props;
    if (isFunction(onGetValidateDataSourceHook)) {
      onGetValidateDataSourceHook(this.getValidateDataSource);
    }
    if (isFunction(onGetDataSourceHook)) {
      onGetDataSourceHook(this.getDataSource);
    }
    // 查询值集
    this.init();
  }

  /**
   * 值集查询
   */
  init() {
    // 查询附件类型值集
    const { organizationId, configName } = this.props;
    if (['sslmInvestgAttachment'].includes(configName)) {
      queryAttachmentTypeList({
        organizationId: organizationId || getCurrentOrganizationId(),
      }).then((res) => {
        if (res) {
          this.setState({
            attachmentTypeList: res,
          });
        }
      });
    }
  }

  getDataSource() {
    const { dataSource } = this.state;
    return map(
      filter(dataSource, (r) => {
        return r.isCreate || r.isUpdate;
      }),
      (r) => {
        return omit(r, ['isCreate', 'isUpdate']);
      }
    );
  }

  getValidateDataSource() {
    const { dataSource } = this.state;
    const { rowKey = 'id' } = this.props;
    return Promise.resolve(
      map(
        filter(dataSource, (r) => {
          return r.isCreate || r.isUpdate;
        }),
        (r) => {
          if (r.isCreate) {
            return omit(r, ['isCreate', 'isUpdate', rowKey]);
          } else {
            return omit(r, ['isCreate', 'isUpdate']);
          }
        }
      )
    );
  }

  refComposeForm(composeForm) {
    const { refEditComposeForm } = this.props;
    this.composeForm = composeForm;
    if (isFunction(refEditComposeForm)) {
      refEditComposeForm(composeForm);
    }
  }

  // 删除

  /**
   *
   * @param {Array} selectedRowKeys - 选中记录的rowKey
   * @param {Array} selectedRows - 选中记录
   */
  handleRowSelectionChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  handleRemove(configName) {
    const { dataSource, selectedRowKeys } = this.state;
    const { rowKey } = this.props;
    const removeRows = [];
    forEach(dataSource, (r) => {
      if (
        findIndex(selectedRowKeys, (rowId) => {
          return rowId === r[rowKey];
        }) !== -1
      ) {
        if (!r.isCreate) {
          removeRows.push(r);
        }
      }
    });
    if (removeRows.length > 0) {
      // 调用 父组件 传进来的 方法
      const { onRemove } = this.props;
      if (isFunction(onRemove)) {
        this.setState({
          removeLoading: true,
        });
        onRemove(
          map(removeRows, (row) => row[rowKey]),
          removeRows,
          {
            onOk: () => this.dataSourceRemove(configName),
          }
        );
      }
    } else {
      this.dataSourceRemove(configName);
    }
  }

  dataSourceRemove(configName) {
    const { dataSource = [], pagination, selectedRowKeys } = this.state;
    const { rowKey } = this.props;
    const nextDataSource = [];
    forEach(dataSource, (r) => {
      if (
        findIndex(selectedRowKeys, (rowId) => {
          return rowId === r[rowKey];
        }) === -1
      ) {
        nextDataSource.push(r);
      }
    });
    this.setState({
      selectedRowKeys: [],
      selectedRows: [],
      dataSource: nextDataSource,
      pagination:
        configName === 'sslmInvestgProservice'
          ? delItemToPagination(dataSource.length, pagination)
          : false,
      removeLoading: false,
    });
  }

  handleSave() {
    const { dataSource } = this.state;
    const { rowKey, investgHeaderId, organizationId } = this.props;
    const saveRows = dataSource
      .filter((data) => data.isCreate || data.isUpdate)
      .map((data) => {
        if (data.isCreate) {
          const newDate = { ...data };
          delete newDate[rowKey];
          return { ...newDate, investgHeaderId, tenantId: organizationId };
        } else {
          return { ...data, investgHeaderId, tenantId: organizationId };
        }
      });
    if (!isEmpty(saveRows)) {
      const { onSave } = this.props;
      if (isFunction(onSave)) {
        this.setState({
          saveLoading: true,
        });
        onSave(saveRows, {
          onOk: () => {
            this.setState({
              saveLoading: false,
            });
          },
        });
      }
    }
  }

  // 编辑

  /**
   * 打开新增模态框
   */
  handleAdd() {
    const { rowKey, fetchSupplierCate, configName, defaultBankInfo } = this.props;
    if (rowKey !== 'investgSupplierCateId') {
      let dataSource = {};
      if (configName === 'sslmInvestgBankAccount') {
        const isFirst = isEmpty(this.state.dataSource);
        const { domesticForeignRelation, partnerCompanyName, countryName, countryId } =
          defaultBankInfo || {};
        dataSource =
          domesticForeignRelation === 1
            ? {
                bankCountryId: countryId,
                bankCountryIdMeaning: countryName,
                bankAccountName: partnerCompanyName,
                mainAccountFlag: isFirst ? 1 : 0,
                enabledFlag: 1,
              }
            : {
                mainAccountFlag: isFirst ? 1 : 0,
                enabledFlag: 1,
              };
      }
      if (configName === 'sslmInvestgContact') {
        const isFirst = isEmpty(this.state.dataSource);
        dataSource = {
          enabled: 1,
          defaultContactFlag: isFirst ? 1 : 0,
        };
      }
      this.setState({
        isUpdate: false,
        editRecord: {},
        modalProps: {
          visible: true,
        },
        composeFormProps: {
          dataSource,
          rowKey: this.props.rowKey,
        },
      });
    } else {
      this.setState({
        supplierCateModal: true,
      });
      fetchSupplierCate();
    }
  }

  /**
   * 点击编辑触发
   * @param {Object} record - 编辑的属性
   */
  handleRowEdit(record) {
    this.setState({
      isUpdate: true,
      editRecord: record,
      modalProps: {
        visible: true,
      },
      composeFormProps: {
        dataSource: record,
        rowKey: this.props.rowKey,
      },
    });
  }

  // 处理多选下拉框格式
  handleFieldMultiple({ fields = [], fieldsValue = {} }) {
    const newFieldsValue = fieldsValue || {};
    fields.forEach((field) => {
      if (field.componentType === 'ValueList' && !isEmpty(field.props)) {
        const { attributeValue = false } =
          field.props.find((item) => item.attributeName === 'multiple') || {};
        if (attributeValue) {
          newFieldsValue[field.fieldCode] = (newFieldsValue[field.fieldCode] || []).join();
          // 处理显示字段
          let displayFieldCode = `${field.fieldCode}Meaning`;
          forEach(field.props, (prop) => {
            if (prop.attributeName === 'displayFieldCode') {
              displayFieldCode = prop.attributeValue;
            }
          });
          if (isArray(newFieldsValue[displayFieldCode])) {
            newFieldsValue[displayFieldCode] = (newFieldsValue[displayFieldCode] || []).join();
          }
        }
      }
    });
    return newFieldsValue;
  }

  // 处理财务页签的取值
  handleFinValues(divisor, dividend) {
    let value = null;
    if ((divisor || divisor === 0) && (dividend || dividend === 0)) {
      const divideValue = divide(divisor, dividend);
      value = isFinite(divideValue) ? `${(round(divideValue, 4) * 100).toFixed(2)}%` : null;
    }
    return value;
  }

  /**
   * 编辑模态框 确认按钮点击
   */
  handleModalOkBtnClick(configName) {
    if (this.composeForm) {
      const { form } = this.composeForm.props;
      form.validateFields({ force: true }, (err, fieldsValue) => {
        if (!err) {
          const { fields } = this.props;
          const { isUpdate, editRecord = {} } = this.state;
          const fieldValue = fieldsValue;
          const { fileUpdateFlag } = fieldsValue;
          if (configName === 'sslmInvestgFin') {
            const {
              totalLiabilities,
              totalAssets,
              currentAssets,
              currentLiabilities,
              netProfit,
              assetLiabilityRatio,
              currentRatio,
              returnOnTotalAssets,
            } = fieldsValue;
            const newAssetLiabilityRatio = this.handleFinValues(totalLiabilities, totalAssets);
            fieldValue.assetLiabilityRatio = newAssetLiabilityRatio || assetLiabilityRatio || '--';
            const newCurrentRatio = this.handleFinValues(currentAssets, currentLiabilities);
            fieldValue.currentRatio = newCurrentRatio || currentRatio || '--';
            const newReturnOnTotalAssets = this.handleFinValues(netProfit, totalAssets);
            fieldValue.returnOnTotalAssets = newReturnOnTotalAssets || returnOnTotalAssets || '--';
          }
          const newFieldsValue = this.handleFieldMultiple({
            fields,
            fieldsValue: fieldValue,
          });
          if (isUpdate) {
            if (fileUpdateFlag) {
              this.handleLastUploadDate(
                {
                  ...editRecord,
                  ...newFieldsValue,
                  // 这里取功能表的uuid，当功能表存上uuid的时候才更新行上的相关信息
                  supplierAttachmentUuid: editRecord.supplierAttachmentUuid,
                  attachmentUuid: editRecord.attachmentUuid,
                },
                form
              );
            }
            this.rowUpdate(newFieldsValue, configName);
          } else {
            this.rowCreate(newFieldsValue, configName);
          }
        }
      });
    }
  }

  // 特殊处理附件/资质信息上次附件更新最后上传日期
  handleLastUploadDate(record = {}, form) {
    const { configName } = this.props;
    const { isUpdate, dataSource = [] } = this.state;
    const { isCreate, supplierAttachmentUuid, attachmentUuid } = record;
    const hasUUid = ['sslmInvestgAttachment'].includes(configName)
      ? supplierAttachmentUuid
      : attachmentUuid;
    if (
      !isEmpty(record) &&
      !isCreate &&
      isUpdate &&
      hasUUid &&
      ['sslmInvestgAttachment', 'sslmInvestgAuth'].includes(configName)
    ) {
      this.setState({
        saveLoading: true,
      });
      updateLastUploadDate({
        ...record,
        configName,
      })
        .then((res) => {
          if (getResponse(res)) {
            const rowKey =
              configName === 'sslmInvestgAuth' ? 'investgAuthId' : 'investgAttachmentId';
            const { objectVersionNumber, lastUploadDate, expirationDate, longEffectiveFlag } = res;
            let extraField = {};
            // 如果是附件页签额外更新其他字段
            if (['sslmInvestgAttachment'].includes(configName)) {
              extraField = {
                expirationDate,
                longEffectiveFlag,
              };
            }
            this.setState({
              dataSource: map(dataSource, (r) => {
                if (r[rowKey] === record[rowKey]) {
                  return {
                    ...r,
                    ...record,
                    lastUploadDate,
                    objectVersionNumber,
                    ...extraField,
                    isUpdate: true,
                    fileUpdateFlag: undefined,
                  };
                } else {
                  return r;
                }
              }),
            });
          }
        })
        .finally(() => {
          form.setFieldsValue({
            fileUpdateFlag: false,
          });
          this.setState({
            saveLoading: false,
          });
        });
    }
  }

  /**
   * 更新记录
   * @param {Object}} fieldsValue - 编辑的数据
   */
  rowUpdate(fieldsValue, configName) {
    const { editRecord = {}, dataSource = [] } = this.state;
    const { context: { handleClearState } = {} } = this.props;
    let regionIdList = [];
    if (this.composeForm) {
      const { regionValue = [] } = this.composeForm.state;
      regionIdList = regionValue;
    }
    // 采购方模板编辑不校验
    // if (editRecord.purchaserFlag === 1 || this.checkAttachmentType(fieldsValue)) {
    let finalValue = fieldsValue;
    if (configName === 'sslmInvestgAddress') {
      finalValue = {
        ...fieldsValue,
        regionIdList,
      };
    }
    this.setState(
      {
        editRecord: null,
        modalProps: {},
        composeFormProps: {},
        dataSource: map(dataSource, (r) => {
          if (r === editRecord) {
            return {
              ...r,
              ...finalValue,
              isUpdate: true,
            };
          } else {
            return r;
          }
        }),
      },
      () => {
        if (isFunction(handleClearState)) {
          handleClearState();
        }
      }
    );
    // } else {
    //   this.setState({
    //     editRecord: null,
    //     modalProps: {},
    //     composeFormProps: {},
    //   });
    // }
  }

  /**
   * 新增记录
   * @param {Object}} fieldsValue - 编辑的数据
   */
  rowCreate(fieldsValue, configName) {
    const { dataSource = [], pagination = {} } = this.state;
    const { rowKey, context: { handleClearState } = {} } = this.props;
    let regionIdList = [];
    if (this.composeForm) {
      const { regionValue = [] } = this.composeForm.state;
      regionIdList = regionValue;
    }
    // if (!this.checkAttachmentType(fieldsValue)) {
    //   this.setState({
    //     editRecord: null,
    //     modalProps: {},
    //     composeFormProps: {},
    //   });
    // } else {
    let newDataSource = [{ ...fieldsValue, [rowKey]: uuid(), isCreate: true }, ...dataSource];
    if (configName === 'sslmInvestgAddress') {
      newDataSource = [
        {
          ...fieldsValue,
          regionIdList,
          [rowKey]: uuid(),
          isCreate: true,
        },
        ...dataSource,
      ];
    }
    this.setState(
      {
        editRecord: null,
        modalProps: {},
        composeFormProps: {},
        dataSource: newDataSource,
        pagination:
          configName === 'sslmInvestgProservice'
            ? addItemToPagination(dataSource.length, pagination)
            : false,
      },
      () => {
        if (isFunction(handleClearState)) {
          handleClearState();
        }
      }
    );
    // }
  }

  /**
   * 校验附件类型重复
   * @param {*} fieldsValue
   */
  checkAttachmentType(fieldsValue) {
    const { dataSource = [], editRecord } = this.state;
    const { rowKey } = this.props;
    // 校验附件类型
    if (rowKey === 'investgAttachmentId') {
      let validateFlag = true;
      for (const line of dataSource) {
        if (
          (line.attachmentType === fieldsValue.attachmentType ||
            line.attachmentTypeMeaning === fieldsValue.attachmentType) &&
          (!editRecord || editRecord.investgAttachmentId !== line.investgAttachmentId)
        ) {
          notification.error({
            description: `${intl
              .get(`sslm.investigationDefinition.attachmentType.duplicate`)
              .d('已存在相同类型的附件')}: ${fieldsValue.attachmentType}}`,
          });
          validateFlag = false;
        }
      }
      return validateFlag;
    } else {
      return true;
    }
  }

  /**
   * 编辑模态框 取消按钮点击
   */
  handleModalCancelBtnClick() {
    const { context: { handleClearState } = {} } = this.props;
    if (this.composeForm) {
      const { form } = this.composeForm.props;
      const { editRecord = {} } = this.state;
      const { lastUploadDate, fileUpdateFlag } = form.getFieldsValue();
      if (fileUpdateFlag) {
        this.handleLastUploadDate(
          {
            ...editRecord,
            lastUploadDate,
          },
          form
        );
      }
    }
    this.setState(
      {
        editRecord: null,
        modalProps: {},
        composeFormProps: {},
      },
      () => {
        if (isFunction(handleClearState)) {
          handleClearState();
        }
      }
    );
  }

  /**
   * 编辑模态框 关闭
   */
  handleAfterModalClose() {
    if (this.composeForm) {
      const { form } = this.composeForm.props;
      form.resetFields();
    }
  }

  /**
   * 供应商分类取消回调
   */
  handleSupplierCateModalCancel() {
    this.setState({ supplierCateModal: false });
  }

  /**
   * 供应商分类确定回调
   */
  handleSupplierCateModalOk() {
    if (this.supplierCateModal) {
      const { selectedRows = [] } = this.supplierCateModal.state;
      const { dataSource = [] } = this.state;
      // 判断是否是新增的数据且判断历史数据与新增数据是否一致
      const flagList = [];
      dataSource.forEach((n) => {
        selectedRows.forEach((m) => {
          if (n.categoryCode === m.categoryCode) {
            flagList.push(m);
          }
        });
      });
      if (isEmpty(flagList)) {
        const { rowKey } = this.props;
        const data = selectedRows
          .filter((n) => isNull(n.childrenCount))
          .map((n) => ({ ...n, enabledFlag: 1, [rowKey]: uuid(), isCreate: true }));
        this.setState({
          dataSource: [...dataSource, ...data],
        });
        this.handleSupplierCateModalCancel();
      } else {
        notification.warning({
          message: intl
            .get('sslm.investigationDefinition.view.message.duplicateClassify')
            .d('不可选择已存在分类'),
        });
      }
    }
  }

  /**
   * 绑定SupplierCateModal
   */
  refSupplierCateModal(supplierCateModal) {
    this.supplierCateModal = supplierCateModal;
  }

  render() {
    const {
      modalProps = {},
      composeFormProps = {},
      dataSource,
      pagination,
      confirmLoading,
      removeLoading,
      saveLoading,
      selectedRowKeys,
      selectedRows,
      supplierCateModal,
      attachmentTypeList = [],
    } = this.state;
    const {
      fields,
      editModalTitle,
      fieldLabelWidth = 200,
      organizationId,
      context,
      loading,
      supplierCateProps,
      fetchSupplierCate,
      configName,
      templateData = {},
      defaultBankInfo,
      investgRemote,
    } = this.props;
    const composeTableProps = this.props;
    return (
      <React.Fragment>
        <BaseComposeTable
          getComputeTableProps={getComputeTableProps}
          {...composeTableProps}
          onRef={this.refComposeTable}
          dataSource={dataSource}
          pagination={pagination}
          onRowEdit={this.handleRowEdit}
          onAdd={this.handleAdd}
          onRemove={this.handleRemove}
          onSave={this.handleSave}
          onRowSelectionChange={this.handleRowSelectionChange}
          selectedRowKeys={selectedRowKeys}
          selectedRows={selectedRows}
          loading={loading || removeLoading || saveLoading}
          templateData={templateData}
        />
        {modalProps.visible && (
          <Modal
            {...modalProps}
            title={editModalTitle}
            onOk={() => this.handleModalOkBtnClick(configName)}
            onCancel={this.handleModalCancelBtnClick}
            wrapClassName="ant-modal-sidebar-right"
            transitionName="move-right"
            width={1000}
            afterClose={this.handleAfterModalClose}
            confirmLoading={confirmLoading}
          >
            <ComposeForm
              {...composeFormProps}
              context={context}
              organizationId={organizationId}
              fieldLabelWidth={fieldLabelWidth}
              editable
              col={2}
              fields={fields}
              configName={configName}
              onRef={this.refComposeForm}
              defaultBankInfo={defaultBankInfo}
              attachmentTypeList={attachmentTypeList}
              investgRemote={investgRemote}
            />
          </Modal>
        )}
        {supplierCateModal && (
          <Modal
            width={800}
            title={editModalTitle}
            visible={supplierCateModal}
            onCancel={this.handleSupplierCateModalCancel}
            onOk={this.handleSupplierCateModalOk}
          >
            <SupplierCateModal
              fields={fields}
              loading={loading}
              onRef={this.refSupplierCateModal}
              onSearch={fetchSupplierCate}
              {...supplierCateProps}
            />
          </Modal>
        )}
      </React.Fragment>
    );
  }
}
