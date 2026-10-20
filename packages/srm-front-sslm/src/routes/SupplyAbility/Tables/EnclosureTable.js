/**
 * EnclosureTable - 附件表
 * @date: 2018-9-6
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Table, Button, Drawer, Form, Input, DatePicker } from 'hzero-ui';
import { isEmpty, isUndefined, sum, isNumber } from 'lodash';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { getDateFormat } from 'utils/utils';
import { dateRender, dateTimeRender } from 'utils/renderer';
import { DATETIME_MIN } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { isReview, reviewFile, downLoadFile } from '@/routes/components/utils';
import styles from '../index.less';

const FormItem = Form.Item;

/**
 * 附件表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} showEditModal 显示编辑模态框
 * @reactProps {Object} form 表单
 * @return React.element
 */
@formatterCollections({
  code: ['sslm.supplyAbility', 'sslm.common'],
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
    const { onClearRows } = this.props;
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
    const { dataSource, onDeleteRows } = this.props;
    const { selectedRows, attachmentLineIdList } = this.state;

    const newSelectedRows = selectedRows.map(item => {
      return item.attachmentLineId;
    });
    const newDataSource = dataSource.filter(item => {
      return newSelectedRows.indexOf(item.attachmentLineId) > -1 === false;
    });
    this.setState({ selectedRows: [] });
    onDeleteRows(
      newDataSource,
      attachmentLineIdList,
      'deleteEnclosureTableData',
      'enclosureData',
      false,
      [],
      selectedRows
    );
  }

  /**
   * 打开modal的函数
   */
  @Bind()
  handleUpload() {
    this.props.onUpload();
  }

  /**
   * 打开modal 保存或者编辑
   * @param {Object} recordSource 编辑的数据
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
   * 关闭modal并清空form
   */
  @Bind()
  onClose() {
    this.setState({ drawerVisible: false });
  }

  /**
   * 保存新增或者编辑的数据
   */
  @Bind()
  saveFormData() {
    const { form, dataSource = [], onAdd } = this.props;
    const { recordSource } = this.state;
    form.validateFields((err, fieldsValues) => {
      if (!err) {
        const { attachmentDesc, remark, attachmentType, effectiveDate, expiryDate } = fieldsValues;
        const newDataSource = dataSource.map(item => {
          if (item.attachmentLineId === recordSource.attachmentLineId) {
            return {
              ...recordSource,
              attachmentDesc,
              remark,
              attachmentType,
              effectiveDate: effectiveDate ? effectiveDate.format(DATETIME_MIN) : undefined,
              expiryDate: expiryDate ? expiryDate.format(DATETIME_MIN) : undefined,
            };
          } else {
            return item;
          }
        });
        onAdd(newDataSource, 'enclosureData', false);
        this.setState({ drawerVisible: false });
      }
    });
  }

  renderForm() {
    const {
      form: { getFieldDecorator, getFieldValue },
    } = this.props;
    const { recordSource } = this.state;
    const dateFormat = getDateFormat();
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
          label={intl.get('sslm.common.view.attachment.size').d('附件大小(MB)')}
          {...formLayOut}
        >
          {getFieldDecorator('attachmentSize', {
            initialValue:
              !isUndefined(recordSource.attachmentSize) &&
              `${recordSource.attachmentSize / (1024 * 1024)}`.substring(0, 5),
          })(<Input disabled />)}
        </FormItem>
        <FormItem
          label={intl.get(`sslm.supplyAbility.model.supplyAbility.realName`).d('上传人')}
          {...formLayOut}
        >
          {getFieldDecorator('realName', {
            initialValue: recordSource.realName,
          })(<Input disabled />)}
        </FormItem>
        <FormItem
          label={intl.get(`sslm.supplyAbility.model.supplyAbility.uploadDate`).d('上传时间')}
          {...formLayOut}
        >
          {getFieldDecorator('uploadDate', {
            initialValue: recordSource.uploadDate && moment(recordSource.uploadDate),
          })(<DatePicker disabled showTime />)}
        </FormItem>
        <FormItem label={intl.get(`hzero.common.remark`).d('备注')} {...formLayOut}>
          {getFieldDecorator('remark', {
            initialValue: recordSource.remark,
          })(<Input />)}
        </FormItem>
        <FormItem
          label={intl.get(`sslm.supplyAbility.model.supplyAbility.attachmentCode`).d('文件编号')}
          {...formLayOut}
        >
          {getFieldDecorator('attachmentCode  ', {
            initialValue: recordSource.attachmentCode,
          })(<Input disabled />)}
        </FormItem>
        <FormItem
          label={intl.get(`sslm.supplyAbility.model.supplyAbility.attachmentType`).d('文件类型')}
          {...formLayOut}
        >
          {getFieldDecorator('attachmentType', {
            initialValue: recordSource.attachmentType,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl
                    .get(`sslm.supplyAbility.model.supplyAbility.attachmentType`)
                    .d('文件类型'),
                }),
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem
          {...formLayOut}
          label={intl.get(`sslm.supplyAbility.model.supplyAbility.effectiveDate`).d('文件生效期')}
        >
          {getFieldDecorator('effectiveDate', {
            initialValue: recordSource.effectiveDate && moment(recordSource.effectiveDate),
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl
                    .get(`sslm.supplyAbility.model.supplyAbility.effectiveDate`)
                    .d('文件生效期'),
                }),
              },
            ],
          })(
            <DatePicker
              placeholder=""
              format={dateFormat}
              disabledDate={currentDate =>
                getFieldValue('expiryDate') &&
                moment(getFieldValue('expiryDate')).isBefore(currentDate, 'day')
              }
              style={{ width: '100%' }}
            />
          )}
        </FormItem>
        <FormItem
          {...formLayOut}
          label={intl.get(`sslm.supplyAbility.model.supplyAbility.expiryDate`).d('文件失效期')}
        >
          {getFieldDecorator('expiryDate', {
            initialValue: recordSource.expiryDate && moment(recordSource.expiryDate),
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl
                    .get(`sslm.supplyAbility.model.supplyAbility.expiryDate`)
                    .d('文件失效期'),
                }),
              },
            ],
          })(
            <DatePicker
              placeholder=""
              format={dateFormat}
              disabledDate={currentDate =>
                getFieldValue('effectiveDate') &&
                moment(getFieldValue('effectiveDate')).isAfter(currentDate, 'day')
              }
              style={{ width: '100%' }}
            />
          )}
        </FormItem>
      </Form>
    );
  }

  render() {
    const { dataSource = [], isOperate = true } = this.props;
    const { drawerVisible, selectedRows } = this.state;
    const columns = [
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.attachmentCode`).d('文件编号'),
        width: 120,
        dataIndex: 'attachmentCode',
      },
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
        title: intl.get('sslm.common.view.attachment.size').d('附件大小(MB)'),
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
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.realName`).d('上传人'),
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
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.uploadDate`).d('上传时间'),
        width: 170,
        dataIndex: 'uploadDate',
        render: dateTimeRender,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.attachmentType`).d('文件类型'),
        width: 120,
        dataIndex: 'attachmentType',
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.effectiveDate`).d('文件生效期'),
        width: 120,
        dataIndex: 'effectiveDate',
        render: dateRender,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.expiryDate`).d('文件失效期'),
        width: 120,
        dataIndex: 'expiryDate',
        render: dateRender,
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'remark',
        // width: 120,
      },
    ];
    columns.push({
      title: intl.get('hzero.common.button.action').d('操作'),
      // width: 150,
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
            {isOperate && (
              <a
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
    // if (isOperate) {
    //   columns.push({
    //     title: intl.get('hzero.common.button.action').d('操作'),
    //     width: 100,
    //     dataIndex: 'option',
    //     render: (_, record) => {
    //       return (
    //         <a
    //           onClick={() => {
    //             this.onOpen(record);
    //           }}
    //         >
    //           {intl.get('hzero.common.button.edit').d('编辑')}
    //         </a>
    //       );
    //     },
    //   });
    // }
    const rowSelection = {
      onChange: this.onSelectChange,
      // getCheckboxProps: record => ({
      //   disabled: record.uploadUserId !== id,
      // }),
    };
    const scrollX = sum(columns.map(item => (isNumber(item.width) ? item.width : 150)));
    return (
      <Fragment>
        {isOperate && (
          <div className="table-list-search" style={{ textAlign: 'right' }}>
            <Button
              style={{ marginRight: 8 }}
              disabled={isEmpty(selectedRows)}
              onClick={this.handleDelete}
            >
              {intl.get(`sslm.supplyAbility.view.message.enclosure.delete`).d('删除附件')}
            </Button>
            <Button type="primary" onClick={this.handleUpload}>
              {intl.get(`sslm.supplyAbility.view.message.enclosure.create`).d('新建附件')}
            </Button>
          </div>
        )}
        <Table
          rowKey="attachmentLineId"
          bordered
          columns={columns}
          dataSource={dataSource}
          rowSelection={isOperate ? rowSelection : null}
          pagination={false}
          scroll={{ x: scrollX }}
        />
        <Drawer
          title={intl.get('sslm.supplyAbility.view.title.editEnclosure').d('编辑附件')}
          placement="right"
          width="520px"
          destroyOnClose
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
