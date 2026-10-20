/* eslint-disable no-param-reassign */
/*
 * @Description: index.js - 印章管理
 * @Author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @Date: 2019-08-7
 * @LastEditTime: 2022-05-23 18:15:54
 */
import React, { Component } from 'react';
import { Drawer, Form, Input, Button, Modal, Tooltip, Select } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { connect } from 'dva';
import { isArray, isEmpty, omit } from 'lodash';

import notification from 'utils/notification';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import Switch from 'components/Switch';
import EditTable from 'components/EditTable';
import {
  addItemToPagination,
  getEditTableData,
  getCurrentOrganizationId,
  delItemsToPagination,
  createPagination,
  tableScrollWidth,
} from 'utils/utils';
import uuid from 'uuid/v4';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { queryIdpValue } from 'hzero-front/lib/services/api';

import warning from '@/assets/warning.svg';

import Upload from './Upload';
import styles from './index.less';

const FormItem = Form.Item;

@connect(({ loading = {}, sealMange = {} }) => ({
  queryModalListLoading: loading.effects['sealMange/queryModalList'],
  saveLoading: loading.effects['sealMange/update'],
  autoSignatureLoading: loading.effects['sealMange/autoSignature'],
  sealMange,
}))
export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
      selectedRows: [],
      selectedRowKeys: [],
      modalDataSource: [],
      modalPagination: {},
      tenantId: getCurrentOrganizationId(),
      sealTypeList: [],
    };
  }

  componentDidMount() {
    queryIdpValue('SPFM.SEAL_BIZ_TYPE').then((res) => {
      if (res && Array.isArray(res) && res.length) {
        this.setState({
          sealTypeList: [...res],
        });
      }
    });
  }

  getSnapshotBeforeUpdate(preProps) {
    const { visible } = preProps;
    if (!visible && visible !== this.props.visible) {
      return true;
    }
    return false;
  }

  componentDidUpdate(props, state, snap) {
    if (snap) {
      this.fetchList();
    }
  }

  @Bind()
  fetchList(page = {}, selectedRows = [], saveArr = []) {
    const { dispatch, companyId, authType } = this.props;
    const { tenantId } = this.state;
    this.setState({ selectedRows });
    dispatch({
      type: 'sealMange/queryModalList',
      payload: {
        page,
        companyId,
        tenantId,
        impowerType: authType === 'ESIGN' ? 'ESIGN' : '',
        sealType: authType,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          modalDataSource: [
            ...saveArr,
            ...res.content.map((n) => ({
              ...n,
              _status: 'update',
              impowerType: authType === 'ESIGN' ? 'ESIGN' : '',
              sealType: authType,
            })),
          ],
          modalPagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 新建列表
   * @param {String} sealId
   */
  @Bind()
  newProject() {
    const { authType, certificateResId } = this.props;
    const { modalDataSource, modalPagination } = this.state;
    const newDataSource = {
      enabledFlag: 1,
      edited: true,
      _status: 'create',
      sealId: uuid(),
      customerId: certificateResId,
      certificateResId,
      impowerType: authType === 'ESIGN' ? 'ESIGN' : '',
      sealType: authType,
    };
    this.setState({
      modalDataSource: [newDataSource, ...modalDataSource],
      modalPagination: addItemToPagination(modalDataSource.length, modalPagination),
    });
  }

  /**
   * delete - 删除列表
   */
  @Bind()
  delete() {
    const sourceField = `modalDataSource`;
    const paginationField = `modalPagination`;
    const selectedField = `selectedRows`;
    const rowKey = `sealId`;
    const {
      [selectedField]: selectedRows = [],
      [sourceField]: modalDataSource = [],
      [paginationField]: modalPagination = {},
    } = this.state;
    const { dispatch, companyId } = this.props;
    const newDataSource = [];
    const deleteList = [];
    Modal.confirm({
      title: intl.get(`spfm.sealmanage.view.message.title.remove`).d('是否删除'),
      onOk: () => {
        const selectedRowKeys = selectedRows.map((n) => n[rowKey]);
        modalDataSource.forEach((item) => {
          if (!selectedRowKeys.includes(item[rowKey])) {
            newDataSource.push(item);
          } else if (item._status !== 'create') {
            deleteList.push(omit(item, ['$form']));
          }
        });
        if (!isEmpty(deleteList)) {
          if (this.checkModified(rowKey, selectedRows, modalDataSource)) {
            Modal.confirm({
              title: intl
                .get(`spfm.sealmanage.view.message.title.whetherOrNotToContinue`)
                .d('当前数据有未保存。继续操作将造成数据丢失，是否继续？'),
              onOk: () => {
                dispatch({
                  type: `sealMange/deletes`,
                  payload: {
                    companyId,
                    body: deleteList, // 等待修改
                  },
                }).then((res) => {
                  if (res) {
                    this.setState({ [selectedField]: [] });
                    notification.success();
                    this.fetchList();
                  }
                });
              },
            });
          } else {
            dispatch({
              type: `sealMange/deletes`,
              payload: {
                companyId,
                body: deleteList, // 等待修改
              },
            }).then((res) => {
              if (res) {
                this.setState({ [selectedField]: [] });
                notification.success();
                this.fetchList();
              }
            });
          }
        } else {
          this.setState({
            [selectedField]: [],
            [paginationField]: [],
            [sourceField]: newDataSource,
            [paginationField]: delItemsToPagination(
              selectedRows.length,
              modalDataSource.length,
              modalPagination
            ),
          });
        }
      },
    });
  }

  @Bind()
  checkModified(rowkey, modalDataSource = []) {
    if (modalDataSource.some((i) => i.edited)) {
      return 1;
    } else {
      return null;
    }
  }

  /**
   * save - 保存明细数据
   * 保存明细头数据和行明细相关字段
   */
  @Bind()
  save() {
    const { dispatch, companyId, onHideDrawer, authType } = this.props;
    const { tenantId, modalDataSource, modalPagination } = this.state;
    const newDataSource = modalDataSource.filter(
      (item) => item.edited || item._status === 'create' || !item.sealFileUrl
    );
    const lines = getEditTableData(modalDataSource, ['sealId', '_status'], { force: true });

    if (newDataSource.length === 0 || (Array.isArray(lines) && lines.length !== 0)) {
      const headerData = {
        lines,
        companyId,
        tenantId,
        sealType: authType,
      };
      dispatch({
        type: 'sealMange/update',
        payload: { headerData },
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchList(modalPagination);
          this.setState({ selectedRows: [] });
          onHideDrawer(this);
        }
      });
    }
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  onRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  }

  /**
   *附件上传成功回调
   * @param {object} record
   * @param {object} args
   */
  @Bind()
  afterOpenLineUploadModal(record, args) {
    const { dispatch, companyId, authType } = this.props;
    const {
      $form: { resetFields },
    } = record;
    const { selectedRows, modalDataSource, modalPagination, tenantId } = this.state;
    const newRecord = Object.assign({}, record, { sealFileUrl: args.response || '', edited: true });
    const createRecord = modalDataSource.filter((item) => item._status === 'create');
    const newDataSource = modalDataSource.map((item) => {
      if (record.sealId === item.sealId) {
        return newRecord;
      }
      return item;
    });
    this.setState({
      modalDataSource: newDataSource,
    });
    if (!isEmpty(args.response)) {
      if (record._status !== 'create') {
        const lines = getEditTableData([newRecord], ['sealId', '_status'], { force: true });
        lines.forEach((item) => {
          if (!item.sealFileUrl.includes('response-cache-control')) {
            // 更改了图片 替换pic
            item.sealPictureUrl = item.sealFileUrl;
          }
        });
        dispatch({
          type: 'sealMange/update',
          payload: {
            headerData: {
              lines,
              companyId,
              tenantId,
              sealType: authType,
            },
          },
        }).then((res) => {
          if (res) {
            this.fetchList(modalPagination, selectedRows, createRecord);
            resetFields(['attachmentUuid']);
          }
        });
      }
    }
    resetFields(['attachmentUuid']);
  }

  /**
   *附件删除回调
   *
   * @param {object} record
   */
  @Bind()
  onDeleteUploadFile(record) {
    const { dispatch, companyId, authType } = this.props;
    const {
      $form: { resetFields },
    } = record;
    const { tenantId, selectedRows, modalPagination, modalDataSource } = this.state;
    const createRecord = modalDataSource.filter((item) => item._status === 'create');
    const newRecord = Object.assign({}, record, { sealFileUrl: null, edited: true });

    if (record._status !== 'create') {
      const newLine = getEditTableData([newRecord], ['sealId', '_status'], { force: true });
      const lines = newLine.map((item) => ({
        ...item,
        sealFileUrl: null,
      }));

      const headerData = {
        lines,
        companyId,
        tenantId,
        sealType: authType,
      };
      if (authType === 'FDD') {
        record.sealFileUrl = null;
        resetFields(['attachmentUuid']);
        return null;
      }

      dispatch({
        type: 'sealMange/update',
        payload: { headerData },
      }).then((res) => {
        if (res) {
          this.fetchList(modalPagination, selectedRows, createRecord);
          resetFields(['attachmentUuid']);
        }
      });
    } else {
      const newDataSource = modalDataSource.map((item) => {
        if (record.sealId === item.sealId) {
          return newRecord;
        }
        return item;
      });
      this.setState({
        modalDataSource: newDataSource,
      });
    }
    resetFields(['attachmentUuid']);
  }

  /**
   * validFunction - 自定义附件上传校验
   */
  @Bind()
  validUpload(callback, record) {
    if (!record.sealFileUrl) {
      callback(
        intl.get('hzero.common.validation.notNull', {
          name: intl.get(`spfm.sealmanage.view.message.title.sealPicture`).d('印章图片'),
        })
      );
    } else {
      callback();
    }
  }

  // 将图片信息同步到法大大
  @Bind()
  @Debounce(300)
  autoSignature(record) {
    const { dispatch, companyId } = this.props; // autoSignature
    const headerData = { record, companyId };
    dispatch({
      type: 'sealMange/autoSignature',
      payload: headerData,
    }).then((res) => {
      if (res) {
        this.fetchList();
      }
    });
  }

  @Bind()
  handleUpdateRecord(record, attachmentUuid) {
    const { modalDataSource } = this.state;
    const newDataSource = modalDataSource.map((item) => {
      if (item.sealId === record.sealId) {
        return {
          ...item,
          attachmentUuid,
        };
      }
      return item;
    });
    this.setState({
      modalDataSource: newDataSource,
    });
  }

  /**
   * 删除
   */
  @Bind()
  delModal() {
    const { onHideDrawer } = this.props;
    const { modalDataSource = [] } = this.state;
    if (modalDataSource.some((item) => item.edited || item._status === 'create')) {
      Modal.confirm({
        title: intl
          .get(`spfm.sealmanage.view.message.title.whetherOrNotToContinue`)
          .d('当前数据有未保存。继续操作将造成数据丢失，是否继续？'),
        onOk: () => {
          this.setState({ selectedRows: [] });
          onHideDrawer(this);
          modalDataSource.forEach((item) => {
            if (item.edited) {
              item.$form.resetFields();
            }
            return item;
          });
        },
      });
    } else {
      this.setState({ selectedRows: [] });
      onHideDrawer(this);
    }
  }

  @Bind()
  handleRecordChange(record) {
    const { modalDataSource } = this.state;
    const newDataSource = modalDataSource.map((item) => {
      if (item.sealId === record.sealId) {
        return {
          ...item,
          edited: true,
        };
      }
      return item;
    });
    this.setState({
      modalDataSource: newDataSource,
    });
  }

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const { remote } = this.props;
    const { sealTypeList } = this.state;

    // 二开埋点
    const isShow = remote
      ? remote.process(
          'SPFM_ELECTRONIC_SIGNATURE_SEALMANAGE_REMOTE_AUTHORIZED_MODAL_COLUMNS',
          null,
          {}
        )
      : false;

    const uploadProps = {
      single: true,
      icon: false,
      accept: '.png',
      title: intl.get(`spfm.sealmanage.view.message.title.sealPicture`).d('印章图片'),
      btnText: intl.get('hzero.common.button.upload').d('上传'),
      showFilesNumber: false,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'spfm-sign',
      fileType: 'image/png',
      fileSize: this.props.authType === 'ESIGN' ? 50 : 2 * 1024,
    };
    const columnArray = [
      {
        title: intl.get(`spfm.sealmanage.model.sealCode`).d('印章编码'),
        dataIndex: 'sealCode',
        width: 100,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`sealCode`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfm.sealmanage.model.sealCode`).d('印章编码'),
                    }),
                  },
                  {
                    pattern: /^[A-Z|\d]+$/,
                    message: intl
                      .get(`spfm.sealmanage.view.message.title.lettersOrNumbers`)
                      .d('印章编码只能由大写字母或数字组成'),
                  },
                  {
                    max: 13,
                    message: intl.get('hzero.common.validation.max', { max: 13 }),
                  },
                ],
                initialValue: record.sealCode,
              })(
                <Input
                  typeCase="upper"
                  inputChinese={false}
                  onChange={() => this.handleRecordChange(record)}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spfm.sealmanage.model.sealName`).d('印章名称'),
        dataIndex: 'sealName',
        width: 100,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`sealName`, {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`spfm.sealmanage.model.sealName`).d('印章名称'),
                  }),
                },
                {
                  max: 30,
                  message: intl.get('hzero.common.validation.max', { max: 30 }),
                },
              ],
              initialValue: record.sealName,
            })(<Input onChange={() => this.handleRecordChange(record)} />)}
          </FormItem>
        ),
      },
      isShow && {
        title: intl.get(`spfm.sealmanage.model.sealType`).d('印章类型'),
        dataIndex: 'sealBizType',
        width: 100,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`sealBizType`, {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`spfm.sealmanage.model.sealType`).d('印章类型'),
                  }),
                },
              ],
              initialValue: record.sealBizType,
            })(
              <Select style={{ width: '100%' }} onChange={() => this.handleRecordChange(record)}>
                {sealTypeList.map((item) => {
                  return (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Select.Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.sealmanage.view.message.title.sealPicture`).d('印章图片'),
        dataIndex: 'attachmentUuid',
        width: 60,
        render: (val, record) => (
          <div>
            <FormItem>
              {record.$form.getFieldDecorator(`attachmentUuid`, {
                initialValue: record.attachmentUuid,
                rules: [
                  {
                    validator: (rule, value, callback) => this.validUpload(callback, record),
                  },
                ],
              })(
                <Upload
                  viewOnly={
                    this.props.authType === 'FDD' &&
                    (record.sealStatus === 'APPLYING' || record.sealStatus === 'SUCCESS')
                  }
                  localRecord={record}
                  showFilesNumber={false}
                  removeCallback={() => this.onDeleteUploadFile(record)}
                  attachmentUUID={record.attachmentUuid}
                  uploadSuccess={(...args) => this.afterOpenLineUploadModal(record, ...args)}
                  afterOpenUploadModal={(attachmentUuid) =>
                    this.handleUpdateRecord(record, attachmentUuid)
                  }
                  {...uploadProps}
                />
              )}
            </FormItem>
            {/* {record.sealFileUrl && (
              <Tag className={styles['tag-type']} color="#108ee9">
                <div className={styles['div-type']}>1</div>
              </Tag>
            )} */}
            {!record.sealFileUrl && (
              <Tooltip
                className={styles['tag-type']}
                title={
                  this.props.authType === 'ESIGN'
                    ? intl
                        .get(`spfm.sealmanage.view.message.title.noUploadFile.transparent`)
                        .d('请确认上传透明底的印章图片')
                    : intl
                        .get(`spfm.sealmanage.view.message.title.noUploadFile.remark`)
                        .d('未上传文件(印章上传建议格式需为：42mm*42mm，透明底)')
                }
              >
                {<img src={warning} alt="img" />}
              </Tooltip>
            )}
          </div>
        ),
      },
      {
        title: intl.get(`spfm.sealmanage.model.sealStatus`).d('印章状态'),
        dataIndex: 'sealStatusMeaning',
        width: 60,
      },
      {
        title: intl.get(`spfm.sealmanage.model.sealResMsg`).d('同步消息'),
        dataIndex: 'sealResMsg',
        width: 80,
      },
      {
        title: intl.get(`hzero.common.status.enable`).d('启用'),
        dataIndex: 'enabledFlag',
        width: 50,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`enabledFlag`, {
              initialValue: record.enabledFlag === 0 ? 0 : 1,
            })(<Switch onChange={() => this.handleRecordChange(record)} />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`hzero.common.status.autoSignature`).d('同步'),
        dataIndex: 'signatureId',
        width: 50,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`signatureId`, {
              initialValue: record.signatureId,
            })(
              <a
                onClick={() => {
                  this.autoSignature(record);
                }}
                disabled={
                  this.props.authType === 'ESIGN'
                    ? record.signatureId || record._status === 'create'
                    : record.sealStatus === 'APPLYING' ||
                      record.sealStatus === 'SUCCESS' ||
                      !record.sealStatus ||
                      this.props.autoSignatureLoading
                }
              >
                {intl.get(`hzero.common.status.autoSignature`).d('同步')}
              </a>
            )}
          </FormItem>
        ),
      }, // signatureId
    ].filter(Boolean);
    return columnArray;
  }

  render() {
    const { queryModalListLoading, authType, saveLoading } = this.props;
    const { selectedRows, modalDataSource, modalPagination } = this.state;
    const selectedRowKeys = selectedRows.map((item) => item.sealId);
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onRowSelectChange,
    };
    const columns = this.getColumns();
    const tableProps = {
      columns:
        authType === 'ESIGN'
          ? columns.filter((ele) => {
              // e签宝不显示‘同步’‘印章状态’‘同步消息’
              const arr = ['signatureId', 'sealStatusMeaning', 'sealResMsg'];
              return !arr.includes(ele.dataIndex);
            })
          : columns,
      rowSelection,
      bordered: true,
      rowKey: 'sealId',
      dataSource: modalDataSource,
      pagination: modalPagination,
      loading: queryModalListLoading,
      onChange: (page) => this.fetchList(page),
      scroll: { x: tableScrollWidth(columns) },
    };
    const { visible } = this.props;
    const drawerProps = {
      visible,
      width: 800,
      mask: true,
      placement: 'right',
      onClose: this.delModal,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      title: intl.get(`spfm.sealmanage.view.message.title.controlOfStamping`).d('印章管理'),
      style: {
        height: 'calc(100% - 103px)',
        overflow: 'auto',
        padding: '0 24px 16px 24px',
      },
    };
    return (
      <Drawer {...drawerProps}>
        <div className={styles['drawer-page']}>
          <Header>
            <Button type="primary" onClick={this.newProject}>
              {intl.get('hzero.common.button.add').d('新增')}
            </Button>
            <Button
              onClick={this.delete}
              disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
            >
              {intl.get(`hzero.common.button.delete`).d('删除')}
            </Button>
          </Header>
          <Content>
            <EditTable {...tableProps} />
          </Content>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e9e9e9',
            padding: '10px 16px',
            background: '#fff',
            textAlign: 'right',
          }}
        >
          <Button onClick={this.delModal} style={{ marginRight: 8 }}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
          <Button type="primary" onClick={this.save} loading={saveLoading}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
        </div>
      </Drawer>
    );
  }
}
