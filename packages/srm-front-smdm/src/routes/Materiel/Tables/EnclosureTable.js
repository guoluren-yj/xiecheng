/**
 * EnclosureTable - 附件表
 * @date: 2018-9-6
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Table, Button, Drawer, Form, Input, Row, Col } from 'hzero-ui';
import { isEmpty, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import { PRIVATE_BUCKET } from '_utils/config';
import { isFunction } from 'lodash';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { getCurrentOrganizationId, getAttachmentUrl } from 'utils/utils';
import styles from '../index.less';

const FormItem = Form.Item;
const bucketName = PRIVATE_BUCKET;
const bucketDirectory = 'smdm-materiel';

/**
 * 附件表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} showEditModal 显示编辑模态框
 * @reactProps {Object} form 表单
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class EnclosureTable extends PureComponent {
  state = {
    selectedRows: [],
    attachmentIdList: [],
    drawerVisible: false,
    recordSource: {},
    tenantId: getCurrentOrganizationId(),
  };

  componentDidMount() {
    const { onClearRows, itemId, onTableChange } = this.props;
    if (onClearRows) onClearRows(this.handleClearSelectedRows);
    if (itemId) {
      onTableChange({}, 'queryEnclosure');
    }
  }

  /**
   * 将selectedRows置空
   */
  @Bind()
  handleClearSelectedRows() {
    this.setState({ selectedRows: [] });
  }

  /**
   * 勾选
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    // const localRows = selectedRows.filter(item => {
    //   return item.isLocal === true;
    // });
    const attachmentIdList = [];
    selectedRows.forEach((item) => {
      if (!item.isLocal) {
        attachmentIdList.push(item.attachmentId);
      }
    });
    this.setState({ selectedRows, attachmentIdList });
  }

  /**
   * 删除附件
   */
  @Bind()
  handleDelete() {
    const { dataSource, onDeleteRows } = this.props;
    const { selectedRows, attachmentIdList } = this.state;

    const newSelectedRows = selectedRows.map((item) => {
      return item.attachmentId;
    });
    const newDataSource = dataSource.filter((item) => {
      return newSelectedRows.indexOf(item.attachmentId) > -1 === false;
    });
    this.setState({ selectedRows: [] });
    onDeleteRows(
      newDataSource,
      attachmentIdList,
      'deleteEnclosureTableData',
      'enclosureDataSource',
      false
    );
  }

  /**
   * 上传附件
   */
  @Bind()
  handleUpload() {
    this.props.onUpload();
  }

  /**
   * 打开侧边模态框
   */
  @Bind()
  onOpen(recordSource) {
    if (recordSource) {
      this.setState({ drawerVisible: true, recordSource });
    } else {
      this.setState({ drawerVisible: true, recordSource: {} });
    }
  }

  /**
   * 关闭侧边模态框
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
    const { form, dataSource = [], onAdd } = this.props;
    const { recordSource } = this.state;
    form.validateFields((err, fieldsValues) => {
      if (!err) {
        const { attachmentSize, ...other } = fieldsValues;
        const newDataSource = dataSource.map((item) => {
          if (item.attachmentId === recordSource.attachmentId) {
            return { ...recordSource, ...other };
          } else {
            return item;
          }
        });
        onAdd(newDataSource, 'enclosureDataSource', false);
        this.setState({ drawerVisible: false });
      }
    });
  }

  renderForm() {
    const {
      form,
      form: { getFieldDecorator },
      customizeForm,
    } = this.props;
    const { recordSource } = this.state;
    const formLayOut = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return customizeForm(
      {
        code: 'SMDM_MATERIEL_ATTACHMENT.EDIT_FROM',
        form,
        dataSource: recordSource,
      },
      <Form layout="horizontal">
        <Row>
          <Col span={24}>
            <FormItem label={intl.get('entity.attachment.name').d('附件名称')} {...formLayOut}>
              {getFieldDecorator('attachmentDesc', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.attachment.name').d('附件名称'),
                    }),
                  },
                ],
                initialValue: recordSource.attachmentDesc,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem label={intl.get('entity.attachment.size').d('附件大小(Mb)')} {...formLayOut}>
              {getFieldDecorator('attachmentSize', {
                initialValue:
                  !isUndefined(recordSource.attachmentSize) &&
                  `${recordSource.attachmentSize / (1024 * 1024)}`.substring(0, 5),
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              label={intl.get(`smdm.materiel.model.materiel.realName`).d('上传人')}
              {...formLayOut}
            >
              {getFieldDecorator('realName', {
                initialValue: recordSource.realName,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              label={intl.get(`smdm.materiel.model.materiel.uploadDate`).d('上传时间')}
              {...formLayOut}
            >
              {getFieldDecorator('uploadDate', {
                initialValue: recordSource.uploadDate,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              label={intl.get(`smdm.materiel.model.materiel.remark`).d('备注')}
              {...formLayOut}
            >
              {getFieldDecorator('remark', {
                initialValue: recordSource.remark,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { dataSource = [], customizeTable, remote } = this.props;
    const { handleEnclosureOperate } = remote?.props?.process || {};
    const { drawerVisible, selectedRows, tenantId } = this.state;
    const columns = [
      {
        title: intl.get(`smdm.materiel.model.materiel.attachmentDesc`).d('附件名称'),
        width: 200,
        dataIndex: 'attachmentDesc',
        render: (value, record) => (
          <a
            href={getAttachmentUrl(record.attachmentUrl, bucketName, tenantId, bucketDirectory)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {value}
          </a>
        ),
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.attachmentSize`).d('附件大小(Mb)'),
        width: 120,
        dataIndex: 'attachmentSize',
        render: (text) => {
          if (text) {
            const size = `${text / (1024 * 1024)}`;
            return size.substring(0, 5);
          } else {
            return 0;
          }
        },
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.realName`).d('上传人'),
        width: 150,
        dataIndex: 'realName',
        render: (text, record) => (isEmpty(text) ? record.loginName : text),
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.uploadDate`).d('上传时间'),
        width: 150,
        dataIndex: 'uploadDate',
        render: dateTimeRender,
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.remark`).d('备注'),
        dataIndex: 'remark',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        align: 'center',
        dataIndex: 'option',
        render: (_, record) => {
          return (
            <a
              onClick={() => {
                this.onOpen(record);
              }}
              disabled={
                isFunction(handleEnclosureOperate) ? handleEnclosureOperate('edit', record) : false
              }
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];
    const rowSelection = {
      onChange: this.onSelectChange,
      // getCheckboxProps: record => ({
      //   disabled: record.uploadUserId !== id,
      // }),
    };
    return (
      <Fragment>
        <div className="table-list-search" style={{ textAlign: 'right' }}>
          <Button
            style={{ marginRight: 8 }}
            disabled={
              isFunction(handleEnclosureOperate)
                ? handleEnclosureOperate('delete', selectedRows)
                : isEmpty(selectedRows)
            }
            onClick={this.handleDelete}
          >
            {intl.get(`smdm.materiel.view.message.toolTip.enclosure.delete`).d('删除附件')}
          </Button>
          <Button onClick={this.handleUpload} type="primary">
            {intl.get(`smdm.materiel.view.message.toolTip.enclosure.create`).d('新建附件')}
          </Button>
        </div>
        {customizeTable(
          {
            code: 'SMDM_MATERIEL_ATTACHMENT.LIST',
          },
          <Table
            bordered
            rowKey="attachmentId"
            columns={columns}
            dataSource={dataSource}
            rowSelection={rowSelection}
            pagination={false}
          />
        )}
        <Drawer
          destroyOnClose
          title={intl.get(`smdm.materiel.view.message.toolTip.enclosure.edit`).d('编辑附件')}
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
