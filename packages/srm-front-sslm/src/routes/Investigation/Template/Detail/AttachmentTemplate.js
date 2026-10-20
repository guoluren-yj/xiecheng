/**
 * 附件
 * @date: 2018-8-15
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Form, Input, Button, Row, InputNumber, Cascader } from 'hzero-ui';
import { isEmpty, isNil } from 'lodash';
import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import Checkbox from 'components/Checkbox';
// import ValueList from 'components/ValueList';
import Upload from 'srm-front-boot/lib/components/Upload/index';
// import Upload from 'components/Upload';
import {
  getAccessToken,
  getEditTableData,
  getCurrentOrganizationId,
  getResponse,
} from 'utils/utils';
import notification from 'utils/notification';
import EditTable from 'components/EditTable';

import { queryAttachmentType } from '@/services/enterpriseInformService';

const FormItem = Form.Item;

@formatterCollections({
  code: ['spfm.investigationDefinition'],
})
@Form.create({ fieldNameProp: null })
export default class AttachmentTemplate extends PureComponent {
  constructor(props) {
    super(props);
    this.rowKey = 'investgCfAttTemplId';
    this.updateState = props.onUpdateState;
    this.saveDispatch = props.onSaveDispatch;
    this.deleteDispatch = props.onDeleteDispatch;
    this.queryDispatch = props.onQueryDispatch;
    this.state = {
      selectedRows: [],
      tenantId: getCurrentOrganizationId(),
      attachmentTypeList: [],
    };
  }

  componentDidMount() {
    this.handleSearch();
    this.handleAttachmentTypeList();
  }

  // 查询附件类型
  handleAttachmentTypeList() {
    const payload = {
      'SPFM.COMPANY.ATTACHMENT_TYPE': 1,
      'SPFM.COMPANY.SUB_ATTACHMENT': 2,
      tenantId: getCurrentOrganizationId(),
    };
    queryAttachmentType(payload).then(res => {
      if (getResponse(res)) {
        const arr = [];
        res.map(d => {
          return arr.push({
            ...d,
            isLeaf: false,
          });
        });
        const childrenList = arr.filter(n => n.children);
        if (isEmpty(childrenList)) {
          notification.warning({
            message: intl
              .get('sslm.common.view.message.checkChild')
              .d('请检查【附件类型】值集是否关联子值集'),
          });
        }
        this.setState({
          attachmentTypeList: arr,
        });
      }
    });
  }

  @Bind()
  handleSearch() {
    const { investigateTemplateId } = this.props;
    const payload = {
      investigateTemplateId,
    };

    this.queryDispatch(payload).then(res => {
      if (!isEmpty(res)) {
        this.setState({
          selectedRows: [],
        });
      }
    });
  }

  /**
   * 编辑行
   * @param {Obj} record
   */
  @Bind()
  handleEdit(record) {
    const { attachmentList = [] } = this.props;
    const index = attachmentList.findIndex(item => item[this.rowKey] === record[this.rowKey]);
    const newAttachmentList = [
      ...attachmentList.slice(0, index),
      {
        ...record,
        _status: 'update',
      },
      ...attachmentList.slice(index + 1),
    ];

    this.updateState('attachmentList', newAttachmentList);
  }

  /**
   * 新建行
   */
  @Bind()
  handleCreate() {
    const { attachmentList = [], investigateTemplateId } = this.props;
    const newLine = {
      investigateTemplateId,
      _status: 'create',
      attachmentFileType: null,
      description: '',
      investgCfAttTemplId: uuidv4(),
      purchaseTemplUuid: '',
      supplierAttFlag: 0,
    };
    const newAttachmentList = [newLine, ...attachmentList];
    this.updateState('attachmentList', newAttachmentList);
  }

  /**
   * 取消编辑行
   * @param {Obj} record
   * @memberof StoreRoom
   */
  @Bind()
  handleCancel(record) {
    const { attachmentList = [] } = this.props;
    const index = attachmentList.findIndex(item => item[this.rowKey] === record[this.rowKey]);
    const { _status, ...other } = record;
    const newAttachmentList = [
      ...attachmentList.slice(0, index),
      other,
      ...attachmentList.slice(index + 1),
    ];

    this.updateState('attachmentList', newAttachmentList);
  }

  /**
   * 删除新建行
   * @param {Object} record
   */
  @Bind()
  handleRemove(record) {
    const { attachmentList = [] } = this.props;
    const newAttachmentList = attachmentList.filter(
      item => item[this.rowKey] !== record[this.rowKey]
    );

    this.updateState('attachmentList', newAttachmentList);
  }

  /**
   * 保存，校验成功保存新增行和修改行
   * @memberof StoreRoom
   */
  @Bind()
  handleSave() {
    const { attachmentList = [], updateInvestigateTemplateId } = this.props;
    const body = getEditTableData(attachmentList, [this.rowKey]);
    const params = {
      updateInvestigateTemplateId,
      body,
    };
    if (!isEmpty(params.body)) {
      const data = params.body.map(item => {
        const { attachmentFileType, ...others } = item;
        return {
          ...others,
          parentAttachmentType: attachmentFileType ? attachmentFileType[0] : null,
          attachmentType: attachmentFileType ? attachmentFileType[1] : null,
        };
      });
      params.body = data;
      this.saveDispatch(params).then(res => {
        if (res) {
          notification.success();
          this.handleSearch();
        }
      });
    }
  }

  /**
   * 删除行
   * @param {*} record
   */
  @Bind()
  handleDelete() {
    const { updateInvestigateTemplateId, attachmentList = [] } = this.props;
    const { selectedRows } = this.state;
    const deleteSourceList = selectedRows
      .filter(item => !item._status)
      .map(item => item[this.rowKey]);
    const localDeleteList = selectedRows
      .filter(item => item._status)
      .map(item => item[this.rowKey]);

    if (!isEmpty(deleteSourceList)) {
      this.deleteDispatch({
        updateInvestigateTemplateId,
        body: deleteSourceList,
      }).then(() => {
        this.handleSearch();
        notification.success();
      });
    } else if (!isEmpty(localDeleteList)) {
      const newAttachmentList = attachmentList.filter(
        item => !localDeleteList.includes(item[this.rowKey])
      );
      this.updateState('attachmentList', newAttachmentList);
      notification.success();
    }
  }

  /**
   * 保存Uuid
   */
  @Bind()
  afterOpenUploadModal(attachmentUUID) {
    const { attachmentList = [] } = this.props;
    const { investgCfAttTemplId } = this.state;

    const index = attachmentList.findIndex(item => item[this.rowKey] === investgCfAttTemplId);
    const newAttachmentList = [
      ...attachmentList.slice(0, index),
      {
        ...attachmentList[index],
        purchaseTemplUuid: attachmentUUID,
      },
      ...attachmentList.slice(index + 1),
    ];

    this.updateState('attachmentList', newAttachmentList);
  }

  @Bind()
  onRow(record) {
    this.setState({
      investgCfAttTemplId: record.investgCfAttTemplId,
    });
  }

  render() {
    const { loading, attachmentList = [] } = this.props;
    const { selectedRows, tenantId, attachmentTypeList } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRows.map(item => item[this.rowKey]),
      onChange: (_, selectedRecords) => {
        this.setState({
          selectedRows: selectedRecords,
        });
      },
    };
    const accessToken = getAccessToken();
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }

    const columns = [
      {
        title: intl.get(`spfm.investigationDefinition.view.attachment.type`).d('附件类型'),
        width: 200,
        dataIndex: 'attachmentFileType',
        render: (value, record) => {
          if (record._status === 'create' || record._status === 'update') {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('attachmentFileType', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`spfm.investigationDefinition.view.attachment.type`)
                          .d('附件类型'),
                      }),
                    },
                  ],
                  initialValue:
                    isNil(record.parentAttachmentType) && isNil(record.attachmentType)
                      ? null
                      : isNil(record.parentAttachmentType)
                      ? [null, record.attachmentType]
                      : [record.parentAttachmentType, record.attachmentType],
                })(
                  <Cascader
                    fieldNames={{ label: 'meaning', value: 'value', children: 'children' }}
                    options={attachmentTypeList.filter(n => n.children)}
                    expandTrigger="hover"
                    placeholder=""
                  />
                )}
              </FormItem>
            );
          } else {
            return record.attachmentTypeMeaning;
          }
        },
      },
      {
        title: intl.get(`spfm.investigationDefinition.view.attachmentDesc`).d('附件描述'),
        dataIndex: 'description',
        width: 200,
        render: (value, record) => {
          if (record._status === 'create' || record._status === 'update') {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('description', {
                  initialValue: record.description,
                })(<Input />)}
              </FormItem>
            );
          } else {
            return value;
          }
        },
      },
      {
        title: intl.get(`spfm.investigationDefinition.view.purchaseTemplUuid`).d('采购方上传模板'),
        width: 150,
        dataIndex: 'purchaseTemplUuid',
        render: (value, record) => {
          if (record._status === 'create' || record._status === 'update') {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('purchaseTemplUuid', {
                  initialValue: value,
                  // rules: [
                  //   {
                  //     required: true,
                  //     message: intl.get('hzero.common.validation.notNull', {
                  //       name: intl
                  //         .get(`spfm.investigationDefinition.view.purchase.TemplUuid`)
                  //         .d('模板上传附件'),
                  //     }),
                  //   },
                  // ],
                })(
                  <Upload
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="sslm-lifecycle"
                    attachmentUUID={value}
                    tenantId={tenantId}
                    afterOpenUploadModal={this.afterOpenUploadModal}
                    filePreview
                  />
                )}
              </FormItem>
            );
          } else {
            return (
              <Upload
                viewOnly
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="sslm-lifecycle"
                attachmentUUID={value}
                tenantId={tenantId}
                afterOpenUploadModal={this.afterOpenUploadModal}
                filePreview
              />
            );
          }
        },
      },
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.orderSeq`).d('排序'),
        dataIndex: 'orderSeq',
        width: 100,
        render: (value, record) => {
          if (record._status === 'create' || record._status === 'update') {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('orderSeq', {
                  initialValue: isNil(value) ? 1 : value,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`spfm.investigationDefinition.model.definition.orderSeq`)
                          .d('排序'),
                      }),
                    },
                  ],
                })(<InputNumber min={0} step={1} precision={0} style={{ width: '100%' }} />)}
              </FormItem>
            );
          } else {
            return value;
          }
        },
      },
      {
        title: intl.get(`spfm.investigationDefinition.view.asupplierAttFlag`).d('供方附件是否必传'),
        dataIndex: 'supplierAttFlag',
        width: 160,
        render: (value, record) => {
          if (record._status === 'create' || record._status === 'update') {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('supplierAttFlag', {
                  initialValue: record.supplierAttFlag,
                })(<Checkbox />)}
              </FormItem>
            );
          } else {
            return <Checkbox value={value} disabled />;
          }
        },
      },
      {
        title: intl
          .get(`spfm.investigationDefinition.view.freezeControlFlag`)
          .d('供应商记账冻结管控'),
        dataIndex: 'freezeControlFlag',
        width: 160,
        render: (value, record) => {
          if (record._status === 'create' || record._status === 'update') {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('freezeControlFlag', {
                  initialValue: record.freezeControlFlag,
                })(<Checkbox />)}
              </FormItem>
            );
          } else {
            return <Checkbox value={value} disabled />;
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 90,
        render: (_, record) => (
          <React.Fragment>
            {record._status === 'update' && (
              <a onClick={() => this.handleCancel(record)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            )}
            {!(record._status === 'create') && !(record._status === 'update') && (
              <a onClick={() => this.handleEdit(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
            {record._status === 'create' && (
              <a onClick={() => this.handleRemove(record)}>
                {intl.get('hzero.common.button.delete').d('删除')}
              </a>
            )}
          </React.Fragment>
        ),
      },
    ];

    return (
      <Fragment>
        <Row style={{ marginBottom: 24, textAlign: 'right' }}>
          <Button
            disabled={isEmpty(selectedRows)}
            onClick={this.handleDelete}
            style={{ marginRight: 10 }}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <Button onClick={this.handleSave} style={{ marginRight: 10 }}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button type="primary" onClick={this.handleCreate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Row>
        <EditTable
          bordered
          loading={loading}
          rowKey={this.rowKey}
          rowSelection={rowSelection}
          columns={columns}
          dataSource={attachmentList}
          pagination={false}
          // onChange={this.handleSearch}
          onRow={record => {
            return {
              onClick: () => this.onRow(record),
            };
          }}
        />
      </Fragment>
    );
  }
}
