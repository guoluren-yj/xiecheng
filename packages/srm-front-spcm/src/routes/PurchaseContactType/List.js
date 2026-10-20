/**
 * index.js - 协议类型管理
 * @date: 2019-05-14
 * @author: zuoxaingyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
import { Bind } from 'lodash-decorators';
import EditTable from 'components/EditTable';
import { Tooltip, Form, Input } from 'hzero-ui';
import withCustomize from 'srm-front-cuz';
import { tableScrollWidth } from 'utils/utils';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import warning from '@/assets/warning.svg';
import UploadModal from 'components/Upload';
import Switch from 'components/Switch';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import showFieldMatchConfig from '../components/FieldMatchConfig';

const commonPrompt = 'spcm.purchaseContractType.model';
const FormItem = Form.Item;

@withCustomize({
  unitCode: ['SPCM.CONTRACT.TYPE.LIST'],
})
export default class List extends React.Component {
  /**
   * 查询公司
   */
  @Bind()
  handleQueryCompany(_, record) {
    const { handleCompany = (e) => e } = this.props;
    if (record.dataFlag) {
      return (
        <span>
          <a disabled={record._status} onClick={() => handleCompany(record)}>
            {intl.get(`spcm.common.model.companyList`).d('公司列表')}
          </a>
        </span>
      );
    } else {
      return (
        <Tooltip title={intl.get(`spcm.common.view.title.assignedCompany`).d('您尚未分配任何公司')}>
          <img src={warning} alt="img" />
        </Tooltip>
      );
    }
  }

  /**
   * 查询字段匹配配置列表
   */
  @Bind()
  handleQueryFieldMatch(_, record) {
    const { enumMap } = this.props;
    if (record.dataFlag) {
      return (
        <span>
          <a
            disabled={record._status}
            onClick={() => showFieldMatchConfig({ ...record, enumMap, editable: true })}
          >
            {intl.get(`spcm.common.model.fieldMatch`).d('字段匹配')}
          </a>
        </span>
      );
    } else {
      return (
        <Tooltip title={intl.get(`spcm.common.view.title.assignedCompany`).d('您尚未分配任何公司')}>
          <img src={warning} alt="img" />
        </Tooltip>
      );
    }
  }

  /**
   * upTemplate - 上传文件render方法
   * @param {object} record - 行数据
   */
  @Bind()
  upTemplate(text, record) {
    const { afterOpenLineUploadModal = (e) => e } = this.props;
    const uploadModalProps = {
      showFilesNumber: false,
      icon: false,
      templateFileURL: record.templateFileUrl,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'sodr-order',
      afterOpenUploadModal: (uuid) => afterOpenLineUploadModal(uuid, record),
    };
    return <UploadModal {...uploadModalProps} />;
  }

  render() {
    const {
      loading,
      dataSource,
      onSearch,
      pagination,
      redirectDetail,
      onAddCopyRow,
      onDeleteCopyRow,
      customizeTable,
      remote,
    } = this.props;
    const pcTypeCodeRoules = [
        {
          required: true,
          message: intl.get('hzero.common.validation.notNull', {
            name: intl.get(`${commonPrompt}.pcTypeCode`).d('协议类型编码'),
          }),
        },
        {
          max: 12,
          message: intl.get('hzero.common.validation.max', { max: 12 }),
        },
        {
          pattern: /^[A-Z\d]+$/,
          message: intl
            .get(`${commonPrompt}.capitalLettersOrNumbersOnly`)
            .d('协议类型编码只能由大写字母或数字组成'),
        },
      ];
      const remoterPcTypeCodeRoules = remote ? remote.process('SPCM_PURCHASECONTACTYPE_CONTRACTPARTNERHEADER_PCTYPECODEROULES',
      pcTypeCodeRoules) : pcTypeCodeRoules;
    const tableProps = {
      columns: [
        {
          title: intl.get(`${commonPrompt}.pcTypeCode`).d('协议类型编码'),
          dataIndex: 'pcTypeCode',
          width: 200,
          // fixed: 'left',
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator(`pcTypeCode`, {
                  rules: remoterPcTypeCodeRoules,
                })(<Input />)}
              </FormItem>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`${commonPrompt}.pcTypeName`).d('协议类型名称'),
          dataIndex: 'pcTypeName',
          width: 200,
          // fixed: 'left',
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator(`pcTypeName`, {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.pcTypeName`).d('协议类型名称'),
                      }),
                    },
                    {
                      max: 120,
                      message: intl.get('hzero.common.validation.max', { max: 120 }),
                    },
                  ],
                })(<Input typeCase="upper" />)}
              </FormItem>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`entity.item.applyCompany`).d('适用公司'),
          dataIndex: 'companyName',
          width: 400,
          render: this.handleQueryCompany,
        },
        {
          title: intl.get(`hzero.common.status.enable`).d('启用'),
          dataIndex: 'enabledFlag',
          width: 80,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator(`enabledFlag`, {
                  initialValue: 1,
                })(<Switch />)}
              </FormItem>
            ) : (
              yesOrNoRender(val)
            ),
        },
        {
          title: intl.get(`entity.item.specialFieldMatch`).d('特殊字段匹配'),
          dataIndex: 'specialFieldMatch',
          width: 400,
          render: this.handleQueryFieldMatch,
        },
        {
          title: intl.get('hzero.common.button.operator').d('操作'),
          dataIndex: 'operator',
          width: 125,
          fixed: 'right',
          render: (_, record) => (
            <>
              <a disabled={record._status} onClick={() => redirectDetail(record.pcTypeId)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <a
                disabled={record._status}
                style={{ marginLeft: 8 }}
                onClick={() => onAddCopyRow(record)}
              >
                {intl.get('hzero.common.title.copy').d('复制')}
              </a>
              {record._status === 'create' && (
                <a style={{ marginLeft: 8 }} onClick={() => onDeleteCopyRow(record)}>
                  {intl.get('hzero.common.delete').d('清除')}
                </a>
              )}
            </>
          ),
        },
      ],
      loading,
      dataSource,
      bordered: true,
      rowKey: 'pcTypeId',
      onChange: (page) => onSearch(page),
      pagination,
    };
    tableProps.scroll = { x: tableScrollWidth(tableProps.columns, 100), y: 'calc(100vh - 335px)' };

    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SPCM.CONTRACT.TYPE.LIST', // 单元编码
          },
          <EditTable {...tableProps} />
        )}
      </React.Fragment>
    );
  }
}
