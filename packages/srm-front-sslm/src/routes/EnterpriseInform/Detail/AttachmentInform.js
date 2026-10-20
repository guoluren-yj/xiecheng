/**
 * AttachmentInform - 附件信息
 * @date: 2019-10-31
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import { Input, Form, DatePicker, Cascader, Modal } from 'hzero-ui';
import moment from 'moment';
import Debounce from 'lodash-decorators/debounce';
import { isUndefined, isEmpty, isFunction, isNil } from 'lodash';
import uuidv4 from 'uuid/v4';
import { getEditTableData, getDateFormat, getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';
import { Button } from 'components/Permission';
import notification from 'utils/notification';
import { PRIVATE_BUCKET } from '_utils/config';
import { dateTimeRender, yesOrNoRender, dateRender } from 'utils/renderer';

const organizationId = getCurrentOrganizationId();
const FormItem = Form.Item;
@connect(({ enterpriseInform, loading }) => ({
  enterpriseInform,
  queryLoading: loading.effects[`enterpriseInform/queryAttachmentsList`],
  saveLoading:
    loading.effects[`enterpriseInform/addAttachment`] ||
    loading.effects[`enterpriseInform/queryAttachmentsList`] ||
    loading.effects['enterpriseInform/deleteAttachment'] ||
    loading.effects['enterpriseInform/updateUploadDate'],
}))
@Form.create({ fieldNameProp: null })
export default class AttachmentInform extends Component {
  constructor(props) {
    super(props);
    const { supplierFlag = 1 } = this.props;
    // 当supplierFlag为0 代表是企业信息变更，并且对应变更采购方的值为空，则走平台接口，无需更换主键ID
    this.defaultRowKey = supplierFlag === 0 ? 'comAttachmentReqId' : 'attachmentReqId';
  }

  state = {
    selectedRowKeys: [], // 选中的rowKeys
    // addRows: [],
    selectedRows: [],
    editRow: [],
    saveable: true,
  };

  componentDidMount() {
    const { dispatch, onRef, partnerTenantId, source } = this.props;
    if (onRef) onRef(this);
    this.handleAttachmentsList();
    dispatch({
      type: 'enterpriseInform/fetchAttachmentType',
      payload: {
        'SPFM.COMPANY.ATTACHMENT_TYPE': 1,
        'SPFM.COMPANY.SUB_ATTACHMENT': 2,
        tenantId:
          source === 'supplier' || partnerTenantId === '-1' ? organizationId : partnerTenantId,
      },
    }).then(res => {
      if (res) {
        const childrenList = res.filter(n => n.children);
        if (isEmpty(childrenList)) {
          notification.warning({
            message: intl
              .get('sslm.enterpriseInform.view.message.checkChild')
              .d('请检查【附件类型】值集是否关联子值集'),
          });
        }
      }
    });
  }

  /**
   * 查询附件信息
   */
  @Bind()
  handleAttachmentsList() {
    const {
      dispatch,
      companyId,
      changeReqId,
      supplierFlag = 1,
      supplierCompanyId,
      source = '',
      customizeUnitCode,
      customizeTenantId = null,
    } = this.props;
    dispatch({
      type: 'enterpriseInform/queryAttachmentsList',
      payload: {
        changeReqId,
        companyId,
        supplierFlag,
        supplierCompanyId,
        dataSource: source === 'enterprise' ? 1 : 2, // 1企业信息变更 2供应商信息变更
        customizeUnitCode,
        customizeTenantId,
      },
    });
  }

  /**
   * 数据校验
   */
  @Bind()
  checkData() {
    const {
      enterpriseInform: { attachmentsList = [] },
      isPub = false,
      pubEdit = false,
    } = this.props;
    const { editRow = [], saveable } = this.state;
    const params = getEditTableData(attachmentsList, [], {
      force: true,
    });
    const isEditing = !!attachmentsList.find(d => d._status === 'create' || d._status === 'update');
    let uuidExisted = true;
    // 判断每一行记录是否都有上传
    const hasNoFileRecord = attachmentsList && attachmentsList.find(d => d.attachmentCount === 0);
    if (Array.isArray(params) && params.length !== 0 && isEditing) {
      const arr = params.map(param => {
        const editData = editRow.find(
          row =>
            row[this.defaultRowKey] === param[this.defaultRowKey] && !isUndefined(param.uploadDate)
        );
        uuidExisted = !!editData;
        const {
          description,
          uploadDate,
          remark,
          longEffectiveFlag,
          supplierAttFlag,
          tenantId,
        } = param;
        if (param._status === 'create') {
          return {
            ...param,
            [this.defaultRowKey]: null,
            description,
            uploadDate,
            attachmentType: param.attachmentFileType[0],
            subAttachment: param.attachmentFileType[1],
            attachmentUuid: editData ? editData.attachmentUuid : editData,
            endDate: param.endDate ? param.endDate.format(DEFAULT_DATE_FORMAT) : param.endDate,
            remark,
            longEffectiveFlag,
            supplierAttFlag,
            tenantId,
          };
        } else {
          return {
            ...param,
            description,
            uploadDate,
            companyAttachmentId: param.companyAttachmentId,
            [this.defaultRowKey]: param[this.defaultRowKey],
            attachmentType: param.attachmentFileType[0],
            subAttachment: param.attachmentFileType[1],
            attachmentUuid: editData ? editData.attachmentUuid : editData,
            objectVersionNumber: param.objectVersionNumber,
            endDate: param.endDate ? param.endDate.format(DEFAULT_DATE_FORMAT) : param.endDate,
            remark,
            longEffectiveFlag,
            supplierAttFlag,
            tenantId,
          };
        }
      });
      if (uuidExisted) {
        return arr;
      } else {
        notification.error({
          message: intl.get('sslm.enterpriseInform.view.message.error').d('附件未上传!'),
        });
      }
    } // 工作流审批时不是可编辑表单，附件信息不校验附件必填
    else if (isPub && !pubEdit && params.length === 0 && !isEditing) {
      return [];
    } else if (params.length === 0 && !isEditing && saveable && !hasNoFileRecord) {
      return [];
    } else {
      notification.error({
        message: intl.get('sslm.enterpriseInform.view.message.error').d('附件未上传!'),
      });
    }
  }

  /**
   * 批量保存数据
   */
  @Debounce(500)
  handleAddAttachment() {
    const {
      dispatch,
      companyId,
      changeReqId,
      source = '',
      supplierFlag = 1,
      customizeUnitCode,
    } = this.props;
    const comAttachmentReqs = this.checkData();

    if (comAttachmentReqs) {
      dispatch({
        type: 'enterpriseInform/addAttachment',
        payload: {
          supplierFlag,
          dataSource: source === 'enterprise' ? 1 : 2, // 1企业信息变更 2供应商信息变更
          comAttachmentReqs,
          changeReqId,
          companyId,
          customizeUnitCode,
        },
      }).then(response => {
        if (response) {
          notification.success();
          this.handleAttachmentsList();
        }
      });
    }
  }

  /**
   * 使当前行变成可编辑状态
   * @param {object} record 当前行记录
   * @param {boolean} flag 编辑状态
   */
  @Bind()
  handleEditAttachment(record, flag) {
    const {
      dispatch,
      enterpriseInform: { attachmentsList = [] },
    } = this.props;
    const { editRow = [] } = this.state;
    let finalData = editRow;
    // 过滤可编辑数据
    const filterData = editRow.filter(n => n[this.defaultRowKey] !== record[this.defaultRowKey]);
    if (!flag) {
      finalData = filterData;
    } else {
      finalData = [
        ...filterData,
        {
          [this.defaultRowKey]: record[this.defaultRowKey],
          attachmentUuid: record.attachmentUuid,
        },
      ];
    }
    this.setState({
      editRow: [...finalData],
    });
    const newAttachmentsList = attachmentsList.map(item => {
      if (item[this.defaultRowKey] === record[this.defaultRowKey]) {
        return { ...item, _status: flag ? 'update' : '' };
      } else {
        return item;
      }
    });
    dispatch({
      type: 'enterpriseInform/updateState',
      payload: {
        attachmentsList: newAttachmentsList,
      },
    });
  }

  /**
   * 设置uuuid
   * @param {string} id 行id
   * @param {string} uuid 唯一编码
   */
  @Bind()
  setUuid(id, uuid) {
    const data = this.state.editRow;
    // 过滤重复数据
    const filterData = data.filter(n => n[this.defaultRowKey] !== id);
    this.setState({
      editRow: [
        ...filterData,
        {
          [this.defaultRowKey]: id,
          attachmentUuid: uuid,
        },
      ],
    });
  }

  /**
   * 控制uuid
   * @param {object} record 行数据
   * @param {string} uuid 唯一编码
   */
  @Bind()
  handleUuid(record, uuid) {
    this.setUuid(record[this.defaultRowKey], uuid);
  }

  /**
   * 点击取消按钮
   * @param {object} record 当前行记录
   */
  @Bind()
  cancel(record) {
    const {
      dispatch,
      enterpriseInform: { attachmentsList = [] },
    } = this.props;
    if (record._status === 'create') {
      const listData = attachmentsList.filter(
        item => item[this.defaultRowKey] !== record[this.defaultRowKey]
      );
      dispatch({
        type: 'enterpriseInform/updateState',
        payload: {
          attachmentsList: listData,
        },
      });
    } else {
      dispatch({
        type: 'enterpriseInform/fetchFileNumber',
        payload: {
          bucketName: PRIVATE_BUCKET,
          directory: 'spfm-comp',
          attachmentUUID: record.attachmentUuid,
        },
      }).then(res => {
        if (!isUndefined(res)) {
          this.handleEditAttachment(
            {
              ...record,
              attachmentCount: res,
            },
            false
          );
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
      enterpriseInform: { attachmentsList = [] },
      source,
      partnerTenantId = '-1',
    } = this.props;
    const newLine =
      partnerTenantId !== '-1'
        ? {
            _status: 'create',
            [this.defaultRowKey]: uuidv4(),
            longEffectiveFlag: source === 'supplier' ? 0 : undefined,
            tenantId: partnerTenantId,
          }
        : {
            _status: 'create',
            [this.defaultRowKey]: uuidv4(),
            longEffectiveFlag: source === 'supplier' ? 0 : undefined,
          };
    dispatch({
      type: 'enterpriseInform/updateState',
      payload: {
        attachmentsList: [newLine, ...attachmentsList],
      },
    });
  }

  // 删除行回调
  @Bind()
  handleDelete() {
    const {
      dispatch,
      changeLevel,
      enterpriseInform: { attachmentsList = [] },
      customizeUnitCode,
    } = this.props;
    const { selectedRows } = this.state;
    // 数据库中的数据
    const deleteRows = selectedRows.filter(n => n._status !== 'create');
    // 前端新建的数据
    const createRowKyes = selectedRows
      .filter(n => n._status === 'create')
      .map(m => m[this.defaultRowKey]);
    const newList = attachmentsList.filter(n => !createRowKyes.includes(n[this.defaultRowKey]));
    Modal.confirm({
      title: intl.get('sslm.common.view.message.sureDeleteSelectedRows').d('确认删除选中行？'),
      onOk: () => {
        dispatch({
          type: 'enterpriseInform/updateState',
          payload: {
            attachmentsList: newList,
          },
        });
        if (!isEmpty(deleteRows)) {
          dispatch({
            type: 'enterpriseInform/deleteAttachment',
            payload: {
              changeLevel,
              deleteRows,
              customizeUnitCode,
            },
          }).then(res => {
            if (res) {
              this.setState({
                selectedRows: [],
                selectedRowKeys: [],
              });
              notification.success();
              this.handleAttachmentsList();
            }
          });
        }
      },
    });
  }

  /**
   * 设置最新更新时间
   * @param {object} record 行数据
   */
  @Bind()
  setLastUploadTime(record) {
    const { companyId, dispatch, changeReqId } = this.props;
    const time = moment();
    if (record._status === 'create' || record._status === 'update') {
      record.$form.registerField('fileUpdateFlag');
      record.$form.setFieldsValue({
        [`uploadDate`]: time,
        fileUpdateFlag: true,
      });
    } else {
      const arr = [
        {
          ...record,
          uploadDate: time.format(DEFAULT_DATETIME_FORMAT),
        },
      ];
      dispatch({
        type: 'enterpriseInform/addAttachment',
        payload: {
          comAttachmentReqs: arr,
          companyId,
          changeReqId,
        },
      }).then(response => {
        if (response) {
          this.setState(
            {
              saveable: true,
            },
            () => {
              this.refresh();
            }
          );
        } else {
          this.setState({
            saveable: false,
          });
        }
      });
    }
  }

  // 更新附件最后上传日期
  @Bind()
  handleUpdateUploadDate(param) {
    const { dispatch, supplierFlag = 1 } = this.props;
    const { curentEditrecord = {}, ...others } = param;
    const { $form, ...otherFieldValues } = curentEditrecord;
    const payload = {
      ...otherFieldValues,
      ...others,
      isPlatformFlag: supplierFlag === 0,
    };
    dispatch({
      type: 'enterpriseInform/updateUploadDate',
      payload,
    })
      .then(res => {
        if (res) {
          const { objectVersionNumber, uploadDate } = res;
          curentEditrecord.objectVersionNumber = objectVersionNumber;
          curentEditrecord.uploadDate = uploadDate;
        }
      })
      .finally(() => {
        curentEditrecord.$form.setFieldsValue({
          fileUpdateFlag: false,
        });
      });
  }

  /**
   * 渲染行
   * @returns
   */
  @Bind()
  handlecolumns() {
    const {
      pubEdit,
      enterpriseInform: { attachmentCode: { AttachmentType } = {} },
      changFlag,
      crossTenant,
      savePermissionFlag = true,
    } = this.props;
    const columns = [
      {
        title: intl.get('sslm.enterpriseInform.view.model.attachment.attMeaning').d('附件类型'),
        dataIndex: 'attachmentFileType',
        width: 200,
        render: (text, record) => {
          if (record._status === 'update' || record._status === 'create') {
            return (
              <FormItem>
                {record.$form.getFieldDecorator(`attachmentFileType`, {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sslm.enterpriseInform.view.model.attachment.attMeaning')
                          .d('附件类型'),
                      }),
                    },
                  ],
                  initialValue:
                    record.attachmentType === undefined && record.subAttachment === undefined
                      ? null
                      : [record.attachmentType, record.subAttachment],
                })(
                  <Cascader
                    fieldNames={{ label: 'meaning', value: 'value', children: 'children' }}
                    options={AttachmentType.filter(n => n.children)}
                    expandTrigger="hover"
                    placeholder=""
                    disabled={changFlag}
                  />
                )}
              </FormItem>
            );
          } else {
            return <div>{`${record.attachmentTypeMeaning}/${record.subAttachmentMeaning}`}</div>;
          }
        },
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.attachment.description').d('附件描述'),
        dataIndex: 'description',
        width: 150,
        render: (text, record) => {
          if (record._status === 'update' || record._status === 'create') {
            return (
              <FormItem>
                {record.$form.getFieldDecorator(`description`, {
                  initialValue: record.description,
                })(<Input disabled={changFlag} />)}
              </FormItem>
            );
          } else {
            return text;
          }
        },
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.attachment.endDate').d('文件到期日'),
        dataIndex: 'endDate',
        width: 150,
        align: 'left',
        render: (text, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const longEffectiveFlagValue = isNil(record.$form.getFieldValue('longEffectiveFlag'))
              ? record.longEffectiveFlag
              : record.$form.getFieldValue('longEffectiveFlag');
            return (
              <FormItem>
                {record.$form.getFieldDecorator(`endDate`, {
                  initialValue: record.endDate ? moment(record.endDate, DEFAULT_DATE_FORMAT) : null,
                  rules: [
                    {
                      required: !longEffectiveFlagValue,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sslm.enterpriseInform.view.model.attachment.endDate')
                          .d('文件到期日'),
                      }),
                      validator: (_, value, cb) => {
                        // 必填校验
                        if (!value && !record.$form.getFieldValue('longEffectiveFlag')) {
                          cb(
                            intl
                              .get('spfm.investigationDefinition.view.validation.endDate')
                              .d('文件到期日必填')
                          );
                        } else {
                          const expirationDate = record.$form.getFieldValue('endDate');
                          const lastUploadDate = record.$form.getFieldValue('uploadDate');
                          // eslint-disable-next-line prefer-destructuring
                          let longEffectiveFlag = record.longEffectiveFlag;
                          longEffectiveFlag = record.$form.getFieldValue('longEffectiveFlag');
                          if (longEffectiveFlag) {
                            cb();
                          } else if (expirationDate && lastUploadDate) {
                            const flag = moment(lastUploadDate).isAfter(expirationDate, 'day');
                            if (flag) {
                              cb(
                                intl
                                  .get('spfm.investigationDefinition.view.validation.date')
                                  .d('文件到期日要大于最后上传日期')
                              );
                            } else {
                              cb();
                            }
                          } else {
                            cb();
                          }
                        }
                      },
                    },
                  ],
                })(
                  <DatePicker
                    format={getDateFormat()}
                    placeholder=""
                    disabled={changFlag || longEffectiveFlagValue}
                    disabledDate={currentDate => {
                      const lastUploadDate = record.$form.getFieldValue('uploadDate');
                      return lastUploadDate
                        ? currentDate && currentDate < moment(lastUploadDate).endOf('day')
                        : currentDate && currentDate < moment().endOf('day');
                    }}
                  />
                )}
              </FormItem>
            );
          } else {
            return dateRender(text);
          }
        },
      },
      {
        title: intl.get('sslm.supplierInform.model.attachment.longEffective').d('是否长期有效'),
        dataIndex: 'longEffectiveFlag',
        width: 120,
        render: (text, record) => {
          if (record._status === 'update' || record._status === 'create') {
            return (
              <FormItem>
                {record.$form.getFieldDecorator(`longEffectiveFlag`, {
                  initialValue: record.longEffectiveFlag === 1 ? record.longEffectiveFlag : 0,
                })(
                  <Checkbox
                    disabled={changFlag}
                    onChange={e => {
                      if (e.target.checked) {
                        record.$form.setFieldsValue({ endDate: undefined });
                      }
                    }}
                  />
                )}
              </FormItem>
            );
          } else {
            return yesOrNoRender(text);
          }
        },
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.attachment.uploadDate').d('最后上传时间'),
        dataIndex: 'uploadDate',
        width: 160,
        align: 'left',
        render: (text, record) => {
          if (record._status === 'update' || record._status === 'create') {
            return (
              <FormItem>
                {record.$form.getFieldDecorator(`uploadDate`, {
                  initialValue: record.uploadDate
                    ? moment(record.uploadDate, DEFAULT_DATETIME_FORMAT)
                    : null,
                })(<DatePicker disabled showTime style={{ width: '100%' }} />)}
              </FormItem>
            );
          } else {
            return dateTimeRender(text);
          }
        },
      },
      // {
      //   title: intl
      //     .get('sslm.enterpriseInform.model.attachment.supplierAttFlag')
      //     .d('供方附件是否必传'),
      //   dataIndex: 'supplierAttFlag',
      //   width: 130,
      //   render: (text, record) => {
      //     if (record._status === 'update' || record._status === 'create') {
      //       return (
      //         <FormItem>
      //           {record.$form.getFieldDecorator('supplierAttFlag', {
      //             initialValue: record.supplierAttFlag || 0,
      //           })(<Checkbox disabled={source === 'enterprise'} />)}
      //         </FormItem>
      //       );
      //     } else {
      //       return yesOrNoRender(text);
      //     }
      //   },
      // },
      {
        title: intl.get('sslm.enterpriseInform.view.model.attachment.upload').d('附件上传'),
        dataIndex: 'attachmentUuid',
        width: 120,
        align: 'left',
        render: (_, record) => {
          return (
            <div>
              <UploadModal
                crossTenant={crossTenant}
                filePreview
                viewOnly={changFlag || !record._status}
                disabled={changFlag || !record._status}
                uploadSuccess={() => this.setLastUploadTime(record)}
                attachmentUUID={record.attachmentUuid}
                afterOpenUploadModal={uuid => this.handleUuid(record, uuid)}
                removeCallback={() => this.setLastUploadTime(record)}
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="spfm-comp"
                fileSize={500 * 1024 * 1024}
                onCloseUploadModal={() => {
                  if (record._status === 'update') {
                    const { uploadDate, fileUpdateFlag } = record.$form.getFieldsValue();
                    if (uploadDate && fileUpdateFlag) {
                      const payload = {
                        curentEditrecord: record,
                        uploadDate,
                      };
                      this.handleUpdateUploadDate(payload);
                    }
                  }
                }}
                // filesNumber={record.attachmentCount}
              />
            </div>
          );
        },
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 200,
        render: (text, record) => {
          if (record._status === 'update' || record._status === 'create') {
            return (
              <FormItem>
                {record.$form.getFieldDecorator(`remark`, {
                  initialValue: record.remark,
                })(<Input disabled={changFlag} dbc2sbc={false} />)}
              </FormItem>
            );
          } else {
            return text;
          }
        },
      },
      {
        title: intl.get(`hzero.common.button.action`).d('操作'),
        dataIndex: 'options',
        width: 80,
        align: 'left',
        render: (_, record) => {
          return (
            <div>
              {record._status === 'create' || record._status === 'update' ? (
                <a onClick={() => this.cancel(record)}>
                  {record._status === 'create'
                    ? intl.get('hzero.common.button.clean').d('清除')
                    : intl.get('hzero.common.button.cancel').d('取消')}
                </a>
              ) : (
                <a
                  disabled={pubEdit ? !pubEdit : changFlag || !savePermissionFlag}
                  onClick={() => this.handleEditAttachment(record, true)}
                >
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              )}
            </div>
          );
        },
      },
    ];
    return columns;
  }

  // 选中项发生改变时的回调
  @Bind()
  handleSelectChange(selectedRowKeys, selectedRows) {
    const { partnerTenantId, source } = this.props;
    this.setState({
      selectedRowKeys,
      selectedRows: selectedRows.map(rows => ({
        ...rows,
        partnerTenantId: source === 'supplier' || partnerTenantId === '-1' ? null : partnerTenantId,
      })),
    });
  }

  render() {
    const { selectedRowKeys, selectedRows } = this.state;
    const rowSelection = {
      selectedRowKeys,
      selectedRows,
      onChange: this.handleSelectChange,
      getCheckboxProps: record => {
        return {
          disabled: +record.supplierAttFlag, // 供方附件必传时不可删除
        };
      },
    };
    const {
      enterpriseInform: { attachmentsList = [] },
      queryLoading,
      changFlag,
      saveLoading,
      savePermissionFlag = true,
      source,
      changeLevel,
      customizeTable,
      customizeUnitCode,
      infoChangeRemote,
    } = this.props;
    const allLoading = queryLoading || saveLoading;
    const columns = this.handlecolumns();
    // 删除按钮权限集
    const deletePermissionCode =
      changeLevel === 'PLATFORM'
        ? 'srm.mdm.firm-info-change.ps.button.platform-attachment-delete'
        : source === 'enterprise'
        ? 'srm.mdm.firm-info-change.ps.button.tenant-attachment-delete'
        : 'srm.partner.my-partner.supplier-inform-change.ps.button.tenant-attachment-delete';
    const addPermissionCode =
      changeLevel === 'PLATFORM'
        ? 'srm.mdm.firm-info-change.api.ps.button.platform-attachment-add'
        : source === 'enterprise'
        ? 'srm.mdm.firm-info-change.api.button.tenant-attachment-add'
        : 'srm.partner.my-partner.supplier-inform-change.api.ps.button.tenant-attachment-add';

    return (
      <Fragment>
        {infoChangeRemote &&
          infoChangeRemote.render('SSLM.INFO_CHANGE_ATTACHMENT_INFO_RENDER', <></>, {})}
        <div
          style={{
            textAlign: 'right',
            paddingBottom: 16,
            display: changFlag || !savePermissionFlag ? 'none' : 'block',
          }}
        >
          <Button
            onClick={this.handleDelete}
            loading={allLoading}
            disabled={isEmpty(selectedRows)}
            permissionList={[
              {
                code: deletePermissionCode,
                type: 'button',
                meaning: '附件信息-删除',
              },
            ]}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <Button
            onClick={this.handleAddAttachment.bind(this)}
            loading={allLoading}
            style={{ marginLeft: 8 }}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            type="primary"
            style={{ marginLeft: 8 }}
            onClick={this.handleAdd}
            loading={allLoading}
            permissionList={[
              {
                code: addPermissionCode,
                type: 'button',
                meaning: '附件信息-新建',
              },
            ]}
          >
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>
        </div>
        {isFunction(customizeTable) ? (
          customizeTable(
            {
              code: customizeUnitCode,
              clearCache: (a, b, cb) => {
                if (a !== b) cb(a);
              },
              useNewValid: true,
            },
            <EditTable
              bordered
              columns={columns}
              loading={allLoading}
              rowKey={this.defaultRowKey}
              rowSelection={changFlag ? null : rowSelection}
              dataSource={attachmentsList}
              pagination={false}
            />
          )
        ) : (
          <EditTable
            bordered
            columns={columns}
            loading={allLoading}
            rowKey={this.defaultRowKey}
            rowSelection={changFlag ? null : rowSelection}
            dataSource={attachmentsList}
            pagination={false}
          />
        )}
      </Fragment>
    );
  }
}
