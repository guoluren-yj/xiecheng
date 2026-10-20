/**
 * index.js - 协议模板管理列表渲染
 * @date: 2019-05-15
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Input, Tooltip, Select, Dropdown, Menu, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
// import withCustomize from 'srm-front-cuz';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import { getCurrentOrganizationId, getEditTableData, tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import Checkbox from 'components/Checkbox';
import warning from '@/assets/warning.svg';
import { isFunction } from 'lodash';
import notification from 'utils/notification';
import FlexLinkModal from '@/routes/components/FlexLinkModal';
import DatePicker from '../components/Form/DatePicker';

const FormItem = Form.Item;
const TemplateRowKey = 'pcTemplateId';
const commonPrompt = 'spcm.contractTemplate.model';
const common = 'spcm.common.model';

export default class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      // getFieldValue: getFieldValue(),
    };
  }

  /**
   * 级联事件--组织结构
   * @returns supplierId
   * @memberof record
   */
  @Bind()
  handleChangePrompt(record) {
    const {
      $form: { setFieldsValue },
    } = record;
    setFieldsValue({ pcTypeId: null });
  }

  /**
   * 获取操作按钮
   */
  @Bind()
  getOperatorContent() {
    const olist = [
      {
        name: intl.get(`hzero.common.button.editor`).d('编辑'),
        type: 'edit',
        handleClick: (record) => {
          const {
            $form: { setFieldsValue },
          } = record;
          setFieldsValue({ editable: true });
          // 页面个性化控制字段是否可编辑
          record.customizeEditType = 'update';
        },
        renderFilter: (record) =>
          ['PENDING', 'BEEN_UPDATED', 'REJECTED'].includes(record.templateStatus),
      },
      {
        name: intl.get(`hzero.common.button.submit`).d('提交'),
        type: 'submit',
        handleClick: (record) => {
          if (!record.dataFlag) {
            notification.warning({
              message: intl.get(`spcm.common.view.title.assignedCompany`).d('您尚未分配任何公司'),
            });
          } else {
            const { onSubmit, contractTemplate } = this.props;
            const { dataSource = [], pagination } = contractTemplate;
            const newDataSource = dataSource.filter(
              (item) => item[TemplateRowKey] === record[TemplateRowKey]
            );
            const lines = getEditTableData(newDataSource, [
              'pcTemplateId',
              '_status',
              'editable',
              'customizeEditType',
            ]);
            if (newDataSource.length === 0 || (Array.isArray(lines) && lines.length !== 0)) {
              // eslint-disable-next-line
              isFunction(onSubmit) && onSubmit(newDataSource, pagination);
            }
          }
        },
        renderFilter: (record) =>
          ['PENDING', 'BEEN_UPDATED', 'REJECTED'].includes(record.templateStatus),
      },
      {
        name: intl.get(`hzero.common.button.unlock`).d('解锁'),
        type: 'update',
        handleClick: (record) => {
          const { onUnLock, contractTemplate } = this.props;
          const { dataSource = [], pagination } = contractTemplate;
          const newDataSource = dataSource.filter(
            (item) => item[TemplateRowKey] === record[TemplateRowKey]
          );
          if (newDataSource.length !== 0) {
            // eslint-disable-next-line
            isFunction(onUnLock) && onUnLock(newDataSource, pagination);
          }
        },
        renderFilter: (record) => ['END_APPROVAL', 'EXPIRED'].includes(record.templateStatus),
      },
      {
        name: intl.get('hzero.common.title.copy').d('复制'),
        type: 'copy',
        handleClick: (record) => {
          this.props.onCopy(record);
        },
      },
      {
        name: intl.get(`spcm.contractTemplate.btn.retrieve`).d('重新获取清稿文件'),
        type: 'retrieve',
        handleClick: (record) => {
          if (isFunction(this.props.onClearRevisions)) {
            this.props.onClearRevisions(record);
          }
        },
        renderFilter: (record) => record.templateStatus === 'CLEAR_FAIL',
      },
      {
        name: intl.get(`spcm.contractTemplate.btn.backToNew`).d('回退至新建'),
        type: 'backToNew',
        handleClick: (record) => {
          if (isFunction(this.props.onBackToNew)) {
            this.props.onBackToNew(record);
          }
        },
        renderFilter: (record) => record.templateStatus === 'CLEAR_FAIL',
      },
    ];

    // ((['edit', 'submit'].includes(item.type) &&
    //   ['PENDING', 'BEEN_UPDATED'].includes(record.templateStatus)) ||
    //   (item.type === 'update' && ['END_APPROVAL'].includes(record.templateStatus))) &&

    return ((list) => (record) => {
      const renderList = list
        .map(
          (item) =>
            (item.renderFilter && item.renderFilter(record) && item) || (!item.renderFilter && item)
        )
        .filter(Boolean);

      return renderList.length > 0 ? (
        <Menu>
          {renderList.map((item) => (
            <Menu.Item onClick={() => item.handleClick(record)}>{item.name}</Menu.Item>
          ))}
        </Menu>
      ) : null;
    })(olist);
  }

  /**
   * 页面跳转处理
   * @param {object} record 列表
   * @param {object} flags
   * @param {string} isHistory 是查看历史，还是查看模板明细
   * @returns
   */
  linkElement = (record = {}, flags, isHistory) => {
    const { onLoad, onJumpTemplate, onJumpVersion } = this.props;
    const { isCreate, editable, isPENDING, isRecordFlag } = flags;
    const { pcTemplateId, templateStatus } = record;
    // include审批特殊处理，使用弹框加载页面。
    if (onLoad) {
      const path = isHistory
        ? `/spcm/contract-template/version/${pcTemplateId}`
        : `/spcm/contract-template/config/${pcTemplateId}`;
      const _location = {
        hash: '',
        pathname: path,
      };
      const flexLinkProps = {
        path,
        type: 'c7n',
        text: isHistory
          ? intl.get(`${commonPrompt}.view`).d('查看')
          : intl.get(`spcm.contractTemplate.model.templateConfig`).d('模板配置'),
        location: _location,
        match: {
          path,
          params: { pcTemplateId },
          state: { onLoad },
        },
        history: {
          ...window.dvaApp._history,
          location: _location,
        },
        modalProps: {
          closable: false,
          footer: (okBtn, cancelBtn) => cancelBtn,
          cancelText: intl.get('hzero.common.btn.close').d('关闭'),
          cancelProps: {
            color: 'primary',
          },
        },
      };
      return <FlexLinkModal {...flexLinkProps} />;
    } else if (isHistory) {
      return (
        <a
          disabled={isPENDING || isCreate || isRecordFlag}
          onClick={() => onJumpVersion(pcTemplateId, templateStatus, !!editable)}
        >
          {intl.get(`${commonPrompt}.view`).d('查看')}
        </a>
      );
    } else {
      return (
        <a
          disabled={isCreate}
          onClick={() => onJumpTemplate(pcTemplateId, templateStatus, !!editable)}
        >
          {intl.get(`spcm.contractTemplate.model.templateConfig`).d('模板配置')}
        </a>
      );
    }
  };

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const { tenantId } = this.state;
    const {
      isPub,
      onHandleRecord,
      handleCompany,
      enumMap: { templateType = [] },
      remote,
    } = this.props;
    // const operatorList = [
    //   {name: '编辑', }
    // ]
    // const operatorContent = (list) => {
    //   return (
    //     <ul>
    //       {list.map(l => (
    //         <li onClick={l.handleClick}>
    //           <a>{l.name}</a>
    //         </li>
    //       ))}
    //     </ul>
    //   )
    // }

    const columnArray = [
      {
        title: intl.get(`${commonPrompt}.templateCode`).d('协议模板编码'),
        width: 150,
        dataIndex: 'templateCode',
        fixed: 'left',
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`templateCode`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.templateCode`).d('协议模板编码'),
                    }),
                  },
                  {
                    pattern: /^[A-Z\d]+$/,
                    message: intl
                      .get(`${commonPrompt}.TypeOnlyCapitalLettersOrNumbers`)
                      .d('协议类型编码只能由大写字母或数字组成'),
                  },
                  {
                    max: 20,
                    message: intl.get('hzero.common.validation.max', { max: 20 }),
                  },
                ],
                initialValue: record.templateCode,
              })(<Input onChange={() => onHandleRecord(record)} typeCase="upper" />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.agreementTemplateName`).d('协议模板名称'),
        dataIndex: 'templateName',
        width: 250,
        fixed: 'left',
        render: (val, record) =>
          ['create'].includes(record._status) || record.$form.getFieldValue('editable') ? (
            <FormItem>
              {record.$form.getFieldDecorator(`templateName`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.agreementTemplateName`).d('协议模板名称'),
                    }),
                  },
                  {
                    max: 120,
                    message: intl.get('hzero.common.validation.max', { max: 120 }),
                  },
                ],
                initialValue: record.templateName,
              })(<Input onChange={() => onHandleRecord(record)} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${common}.pcType`).d('协议类型'),
        dataIndex: 'pcTypeId',
        width: 260,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`pcTypeId`, {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${common}.pcType`).d('协议类型'),
                  }),
                },
              ],
              initialValue: val,
            })(
              record._status === 'create' || record.$form.getFieldValue('editable') ? (
                <Lov
                  code="SPCM.PC_TYPE"
                  onChange={() => onHandleRecord(record)}
                  textValue={record.pcTypeName}
                  queryParams={{
                    enabledFlag: 1,
                    tenantId,
                    // companyId: record.$form.getFieldValue('companyId'),
                  }}
                  // disabled={record.$form.getFieldValue('companyId') == null}
                />
              ) : (
                <span>{record.pcTypeName}</span>
              )
            )}
          </FormItem>
        ),
      },
      {
        title: intl.get(`${commonPrompt}.startDateActive`).d('模板起始日期'),
        dataIndex: 'startDateActive',
        width: 200,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`startDateActive`, {
              rules: [
                {
                  required: false,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${commonPrompt}.startDateActive`).d('模板起始日期'),
                  }),
                },
              ],
              initialValue: val ? moment(val, DEFAULT_DATE_FORMAT) : null,
            })(
              record._status === 'create' || record.$form.getFieldValue('editable') ? (
                <DatePicker
                  style={{ width: '100%' }}
                  onChange={() => onHandleRecord(record)}
                  format={DEFAULT_DATE_FORMAT}
                  disabledDate={(currentDate) => {
                    const endDateActive = record.$form.getFieldValue('endDateActive');
                    return endDateActive && moment(endDateActive).isBefore(currentDate, 'day');
                  }}
                />
              ) : (
                <span>{record.startDateActive}</span>
              )
            )}
          </FormItem>
        ),
      },
      {
        title: intl.get(`${commonPrompt}.endDateActive`).d('模板终止日期'),
        dataIndex: 'endDateActive',
        width: 200,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`endDateActive`, {
              rules: [
                {
                  required: false,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${commonPrompt}.endDateActive`).d('模板终止日期'),
                  }),
                },
              ],
              initialValue: val ? moment(val, DEFAULT_DATE_FORMAT) : null,
            })(
              record._status === 'create' || record.$form.getFieldValue('editable') ? (
                <DatePicker
                  style={{ width: '100%' }}
                  onChange={() => onHandleRecord(record)}
                  format={DEFAULT_DATE_FORMAT}
                  disabledDate={(currentDate) => {
                    const startDateActive = record.$form.getFieldValue('startDateActive');
                    const nowDate = new Date().getTime();
                    return (
                      (startDateActive && moment(startDateActive).isAfter(currentDate, 'day')) ||
                      moment(nowDate).isAfter(currentDate, 'day')
                    );
                  }}
                />
              ) : (
                <span>{val}</span>
              )
            )}
          </FormItem>
        ),
      },
      {
        title: intl.get(`${common}.templateType`).d('模板类型'),
        dataIndex: 'templateType',
        width: 180,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`templateType`, {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${common}.templateType`).d('模板类型'),
                  }),
                },
              ],
              initialValue: val?.split(','),
            })(
              record._status === 'create' || record.$form.getFieldValue('editable') ? (
                <Select
                  allowClear
                  mode="multiple"
                  style={{ width: 150 }}
                  onChange={() => onHandleRecord(record)}
                >
                  {templateType.map((n) => (
                    <Select.Option key={n.value} value={n.value}>
                      {n.meaning}
                    </Select.Option>
                  ))}
                </Select>
              ) : (
                <span>{record.templateTypeMeaning}</span>
              )
            )}
          </FormItem>
        ),
      },
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'templateStatus',
        width: 180,
        render: (val, record) => record.templateStatusMeaning,
      },
      {
        title: intl.get(`spcm.contractTemplate.model.companyList`).d('分配适用公司'),
        dataIndex: 'companyId',
        width: 150,
        render: (_, record) => {
          const editable = record.$form.getFieldValue('editable'); // 行是否可以编辑
          const isCreate = record._status === 'create'; // 是否为新增行
          return ['update'].includes(record._status) ? (
            <div>
              <span>
                {!editable && !isCreate ? (
                  <Tooltip
                    title={intl
                      .get(`spcm.common.view.title.isCompanyReadonly`)
                      .d('编辑模式下方可操作公司配列表置，当前处于只读状态')}
                  >
                    <a
                      onClick={() =>
                        handleCompany(
                          record.$form.getFieldValue('pcTypeId') || record.pcTypeId,
                          record.pcTemplateId,
                          !!editable
                        )
                      }
                    >
                      {intl.get(`spcm.contractTemplate.view.title.companyList`).d('公司列表')}
                    </a>
                  </Tooltip>
                ) : (
                  <a
                    onClick={() =>
                      handleCompany(
                        record.$form.getFieldValue('pcTypeId') || record.pcTypeId,
                        record.pcTemplateId,
                        !!editable
                      )
                    }
                  >
                    {intl.get(`spcm.contractTemplate.view.title.companyList`).d('公司列表')}
                  </a>
                )}
              </span>
              {record.dataFlag ? null : (
                <span style={{ marginLeft: 4 }}>
                  <Tooltip
                    title={intl
                      .get(`spcm.common.view.title.assignedCompany`)
                      .d('您尚未分配任何公司')}
                  >
                    <img src={warning} alt="img" />
                  </Tooltip>
                </span>
              )}
            </div>
          ) : (
            <Tooltip
              title={intl.get(`spcm.common.view.title.assignedCompany`).d('您尚未分配任何公司')}
            >
              <img src={warning} alt="img" />
            </Tooltip>
          );
        },
      },
      {
        title: intl.get(`spcm.contractTemplate.model.templateConfig`).d('模板配置'),
        dataIndex: 'templateConfig',
        width: 150,
        render: (_, record) => {
          const editable = record.$form.getFieldValue('editable');
          const isCreate = record._status === 'create';
          return !editable && !isCreate ? (
            <Tooltip
              title={intl
                .get(`spcm.common.view.title.isTemplateReadonly`)
                .d('编辑模式下方可操作模板配置，当前处于只读状态')}
            >
              {this.linkElement(record, { isCreate, editable })}
            </Tooltip>
          ) : (
            this.linkElement(record, { isCreate, editable })
          );
        },
      },
      {
        title: intl.get(`hzero.common.status.enable`).d('启用'),
        dataIndex: 'enabledFlag',
        width: 60,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`enabledFlag`, {
              initialValue: record.enabledFlag === 0 ? 0 : 1,
            })(
              <Checkbox
                disabled={record._status !== 'create' && !record.$form.getFieldValue('editable')}
                onChange={() => onHandleRecord(record)}
              />
            )}
          </FormItem>
        ),
      },
      {
        title: intl.get(`${commonPrompt}.version`).d('版本历史记录'),
        dataIndex: 'version',
        width: 150,
        render: (_, record) => {
          const editable = record.$form.getFieldValue('editable');
          const isCreate = record._status === 'create';
          const isRecordFlag = record.recordFlag === 0;
          const isPENDING = record.templateStatus === 'PENDING';
          return this.linkElement(
            record,
            { isPENDING, isCreate, isRecordFlag, editable },
            'history'
          );
        },
      },
    ];

    if (!isPub) {
      columnArray.push({
        title: intl.get('hzero.common.button.operator').d('操作'),
        dataIndex: 'operator',
        width: 100,
        render: (val, record) => this.opratorBtnsRender(record),
      });
    }
    return remote
      ? remote.process('SPCM_CONTRACT_TEMPLATE_LIST_COLUMNS', columnArray, {
          current: this,
        })
      : columnArray;
  }

  /**
   * 操作按钮渲染逻辑
   */
  opratorBtnsRender(record) {
    const operatorContent = this.getOperatorContent();
    const { onCancelNewLine } = this.props;

    if (record._status === 'create') {
      return (
        <a onClick={() => onCancelNewLine(record)}>
          {intl.get('hzero.common.button.cancel').d('取消')}
        </a>
      );
    } else if (record.$form.getFieldValue('editable')) {
      return (
        <a
          onClick={() => {
            record.$form.resetFields();
            record.$form.setFieldsValue({ editable: false });
            // 页面个性化控制字段是否可编辑
            record.customizeEditType = 'view';
          }}
        >
          {intl.get('hzero.common.button.cancel').d('取消')}
        </a>
      );
    } else {
      const menu = operatorContent(record);
      return (
        menu && (
          <Dropdown trigger={['click']} placement="bottomRight" overlay={menu}>
            <a className="ant-dropdown-link">
              {intl.get('hzero.common.button.operator').d('操作')} <Icon type="down" />
            </a>
          </Dropdown>
        )
      );
    }
  }

  render() {
    const {
      isPub,
      loading,
      dataSource,
      onSearch,
      pagination,
      selectedRows,
      onRowSelectChange = (e) => e,
      customizeTable,
    } = this.props;
    const columns = this.getColumns();
    const selectedRowKeys = selectedRows.map((item) => item.pcTemplateId);
    const rowSelection = {
      selectedRowKeys,
      onChange: onRowSelectChange,
      getCheckboxProps: (record) => ({
        disabled:
          record[TemplateRowKey] &&
          !['PENDING', 'BEEN_UPDATED', 'REJECTED'].includes(record.templateStatus),
      }),
    };
    const tableProps = {
      loading,
      columns,
      dataSource,
      rowSelection: !isPub ? rowSelection : null,
      bordered: true,
      rowKey: 'pcTemplateId',
      onChange: (page) => onSearch(page),
      pagination,
    };
    // 工作流固定写死会导致表格高度撑不起来
    tableProps.scroll = {
      x: tableScrollWidth(columns, 100),
      y: isPub ? 'max-content' : 'calc(100vh - 335px)',
    };
    return (
      <React.Fragment>
        {customizeTable ? (
          customizeTable(
            {
              code: 'SPCM.CONTRACT.TEMPLATE.LIST', // 单元编码
            },
            <EditTable {...tableProps} />
          )
        ) : (
          <EditTable {...tableProps} />
        )}
      </React.Fragment>
    );
  }
}
