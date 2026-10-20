/**
 * Recommend - 供应商生命周期配置 - 申请单附件表
 * @date: 2018-9-6
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import moment from 'moment';
import React, { PureComponent, Fragment } from 'react';
import { Table, Button, Drawer, Form, Input, DatePicker } from 'hzero-ui';
import { isEmpty, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';

import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import notification from 'utils/notification';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { isReview, reviewFile, downLoadFile } from '@/routes/components/utils';
import styles from './index.less';

const FormItem = Form.Item;

/**
 * 申请单附件表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form 表单
 * @return React.element
 */
@formatterCollections({
  code: ['sslm.supplierReview', 'sslm.common'],
})
@Form.create({ fieldNameProp: null })
export default class EnclosureTable extends PureComponent {
  state = {
    selectedRows: [],
    attachmentLineIdList: [],
    drawerVisible: false,
    recordSource: {},
  };

  componentDidMount() {
    const {
      tableProps: { onClearRows },
    } = this.props;
    if (onClearRows) onClearRows(this.handleClearSelectedRows);
  }

  /**
   * 将selectedRows置空
   */
  @Bind()
  handleClearSelectedRows() {
    this.setState({ selectedRows: [] });
  }

  /**
   * 保存选择行的数据
   * @param {Array} selectedRowKeys - 选中行主键
   * @param {Array} selectedRows - 选中行信息
   */
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    const attachmentLineIdList = [];
    selectedRows.forEach(item => {
      if (!item.isLocal) {
        attachmentLineIdList.push(item.attachmentLineId);
      }
    });
    this.setState({ selectedRows, attachmentLineIdList });
  }

  /**
   * 删除选中行
   */
  @Bind()
  handleDelete() {
    const {
      tableProps: { dataSource, onDeleteRows },
    } = this.props;
    const { selectedRows, attachmentLineIdList } = this.state;
    if (isEmpty(selectedRows) && isEmpty(attachmentLineIdList)) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一条数据'),
      });
    } else {
      const newSelectedRows = selectedRows.map(item => {
        return item.attachmentLineId;
      });
      const newDataSource = dataSource.filter(item => {
        return newSelectedRows.indexOf(item.attachmentLineId) > -1 === false;
      });
      this.setState({ selectedRows: [] });
      onDeleteRows(newDataSource, attachmentLineIdList);
    }
  }

  /**
   * 打开侧边模态框
   * @param {Object} recordSource - 编辑带入的行数据
   */
  @Bind()
  onOpen(recordSource) {
    this.setState({ drawerVisible: true, recordSource });
  }

  /**
   * 关闭上传或者编辑modal
   */
  @Bind()
  onClose() {
    this.setState({ drawerVisible: false });
  }

  /**
   * 更新附件表数据
   */
  @Bind()
  saveFormData() {
    const {
      form,
      tableProps: { dataSource = [], onUpdateRow },
    } = this.props;
    const { recordSource } = this.state;
    form.validateFields((err, fieldsValues) => {
      if (!err) {
        const { attachmentDesc, remark } = fieldsValues;
        const newDataSource = dataSource.map(item => {
          if (item.attachmentLineId === recordSource.attachmentLineId) {
            return { ...recordSource, attachmentDesc, remark };
          } else {
            return item;
          }
        });
        onUpdateRow(newDataSource);
        this.setState({ drawerVisible: false });
      }
    });
  }

  /**
   * 查询表单渲染
   */
  renderForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { recordSource } = this.state;
    const formLayOut = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return (
      <Form layout="horizontal">
        <FormItem
          label={intl.get('sslm.common.view.attachment.name').d('附件名称')}
          {...formLayOut}
        >
          {getFieldDecorator('attachmentDesc', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('sslm.common.view.attachment.name').d('附件名称'),
                }),
              },
            ],
            initialValue: recordSource.attachmentDesc,
          })(<Input />)}
        </FormItem>
        <FormItem
          label={intl.get(`sslm.common.view.attachment.size`).d('附件大小(MB)')}
          {...formLayOut}
        >
          {getFieldDecorator('attachmentSize', {
            initialValue:
              !isUndefined(recordSource.attachmentSize) &&
              `${recordSource.attachmentSize / (1024 * 1024)}`.substring(0, 5),
          })(<Input disabled />)}
        </FormItem>
        <FormItem
          label={intl.get(`sslm.supplierReview.model.supplierReview.realNameUpdater`).d('上传人')}
          {...formLayOut}
        >
          {getFieldDecorator('realName', {
            initialValue: recordSource.realName,
          })(<Input disabled />)}
        </FormItem>
        <FormItem
          label={intl.get(`sslm.supplierReview.model.supplierReview.uploadDate`).d('上传时间')}
          {...formLayOut}
        >
          {getFieldDecorator('uploadDate', {
            initialValue: recordSource.uploadDate
              ? moment(recordSource.uploadDate, DEFAULT_DATE_FORMAT)
              : null,
          })(<DatePicker disabled />)}
        </FormItem>
        <FormItem label={intl.get('hzero.common.remark').d('备注')} {...formLayOut}>
          {getFieldDecorator('remark', {
            initialValue: recordSource.remark,
          })(<Input />)}
        </FormItem>
      </Form>
    );
  }

  render() {
    const {
      tableProps: { dataSource = [], currentUser = {} },
      isEdit,
    } = this.props;
    const { drawerVisible, selectedRows } = this.state;
    const { id } = currentUser;
    const columns = [
      {
        title: intl.get('sslm.common.view.attachment.name').d('附件名称'),
        width: 200,
        dataIndex: 'attachmentDesc',
        render: (val, record) => {
          return isReview(record.attachmentDesc) && record.attachmentUrl ? (
            <a
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => reviewFile(record.attachmentDesc, record.attachmentUrl)}
            >
              {val}
            </a>
          ) : (
            val
          );
        },
      },
      {
        title: intl.get(`sslm.common.view.attachment.size`).d('附件大小(MB)'),
        width: 150,
        dataIndex: 'attachmentSize',
        render: text => {
          if (text) {
            const size = `${text / (1024 * 1024)}`;
            return size.substring(0, 5);
          } else {
            return 0;
          }
        },
      },
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.realNameUpdater`).d('上传人'),
        width: 150,
        dataIndex: 'realName',
        render: (text, record) => {
          if (isEmpty(text)) {
            return record.loginName;
          } else {
            return text;
          }
        },
      },
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.uploadDate`).d('上传时间'),
        width: 150,
        dataIndex: 'uploadDate',
        render: dateRender,
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
      },
    ];
    columns.push({
      title: intl.get('hzero.common.button.action').d('操作'),
      width: 110,
      dataIndex: 'option',
      render: (val, record) => {
        const { tenantId, attachmentUrl } = record;
        return (
          <span className="action-link">
            {record.attachmentUrl && (
              <a
                href={downLoadFile({ tenantId, attachmentUrl })}
                target="_blank"
                rel="noopener noreferrer"
              >
                {intl.get('hzero.common.button.download').d('下载')}
              </a>
            )}
            {isEdit === true && (
              <a
                disabled={record.uploadUserId !== id}
                onClick={() => {
                  this.onOpen(record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </span>
        );
      },
    });
    const rowSelection = {
      onChange: this.onSelectChange,
      getCheckboxProps: record => ({
        disabled: record.uploadUserId !== id,
      }),
    };
    return (
      <Fragment>
        <div className={classNames({ [styles['table-list-search']]: true })}>
          {isEdit && (
            <Button disabled={isEmpty(selectedRows)} onClick={this.handleDelete}>
              {intl.get('sslm.supplierReview.view.button.delete').d('删除附件')}
            </Button>
          )}
        </div>
        <Table
          rowKey="attachmentLineId"
          bordered
          columns={columns}
          dataSource={dataSource}
          rowSelection={isEdit ? rowSelection : null}
          pagination={false}
        />
        <Drawer
          destroyOnClose
          title={intl.get(`sslm.common.view.attachment.edit`).d('编辑附件')}
          placement="right"
          width="520px"
          onClose={this.onClose}
          visible={drawerVisible}
        >
          {this.renderForm()}
          <div className={styles['modal-button']}>
            <Button
              style={{
                marginRight: 8,
              }}
              onClick={this.onClose}
            >
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
            <Button onClick={this.saveFormData} type="primary">
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
          </div>
        </Drawer>
      </Fragment>
    );
  }
}
