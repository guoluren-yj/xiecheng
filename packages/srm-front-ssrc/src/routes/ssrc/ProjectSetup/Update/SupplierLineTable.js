/**
 * routes 寻源立项-维护／详情/供应商
 * @date: 2020-2-24
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Alert } from 'choerodon-ui';
import { Modal as C7nModal, DataSet, message, Tooltip } from 'choerodon-ui/pro';
import { Form, Input, Button, Table, Popover, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import querystring from 'querystring';

import CommonImportNew from 'hzero-front/lib/components/Import';
import { tableScrollWidth, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import { TooltipButton } from '@/routes/components/TooltipButton';
import { EMAIL, NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import SupplierLov from 'srm-front-boot/lib/components/SupplierLov';
import { phoneRender } from '@/utils/renderer';
import warnIcon from '@/assets/warn-icon.svg';
import commonStyle from '@/routes/ssrc/common.less';
import SupplierRelatedGraph from '@/routes/ssrc/ProjectSetupNew/Components/SupplierRelatedGraph';

import AllotSectionModal from './AllotSectionModal';

import './index.less';

class SupplierLineTable extends PureComponent {
  state = {
    visible: false,
  };

  /**
   * 改变供应商编码-获取供应商名称
   */
  @Bind()
  jumpSupplierLifeManagerDetail(record, supplierTabKey = null) {
    // 根据当前登陆账号，查配置表，判断是老租户还是新租户
    const {
      companyId,
      history: {
        location: { pathname = null, search },
      },
    } = this.props;
    const {
      tenantId,
      partnerCompanyId,
      partnerTenantId,
      spfmSupplierCompanyId,
      spfmCompanyId,
      supplierCompanyId,
    } = record;

    if (
      !companyId ||
      !partnerCompanyId ||
      !partnerTenantId ||
      !spfmSupplierCompanyId ||
      !supplierCompanyId
    ) {
      return;
    }

    const params = {
      tenantId,
      companyId,
      partnerCompanyId,
      partnerTenantId,
      spfmPartnerCompanyId: spfmSupplierCompanyId,
      spfmCompanyId,
      supplierCompanyId,
    };
    const searchParams = querystring.stringify(params);

    if (supplierTabKey) {
      // 判断是否在iframe中
      if (window.top !== window) {
        // 是
        window.parent.postMessage({
          type: 'link',
          data: JSON.stringify({
            pathname: `${supplierTabKey}`,
            search: searchParams,
          }),
        });
      } else {
        this.props.history.push({
          pathname: `${supplierTabKey}`,
          search: searchParams,
          state: {
            historyBack: pathname + search,
            ...params,
          },
        });
      }
    }
  }

  /**
   * 检查表格内容值发生变化
   */
  @Bind()
  hasChangeData(record, changeValues) {
    const { onChangeTableData } = this.props;
    if (!isEmpty(changeValues)) {
      onChangeTableData();
    }
  }

  /**
   * 改变联系人-获取联系电话、电子邮件
   */
  @Bind()
  changeContactName(value, dataList, record) {
    record.$form.setFieldsValue({
      contactMobilephone: dataList.mobilephone,
      contactMail: dataList.mail,
    });
  }

  // table columns
  renderColumns() {
    const {
      companyId,
      detailFlag = false,
      idd = [],
      subjectMatterRule,
      supplierConfigOldUserFlag = true,
    } = this.props;

    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 140,
        render: (val, record) => {
          // 判断有无供应商生命周期/供应商生命周期汇总菜单权限
          // const supplierTabKey =
          //   window.dvaApp?._store
          //     ?.getState?.()
          //     ?.global?.menuLeafNode?.find?.(
          //       (i) =>
          //         i.path === '/sslm/supplier-life-manage' || i.path === '/sslm/supplier-manager'
          //     )?.path || null;
          const supplierTabKey = supplierConfigOldUserFlag
            ? '/sslm/include/supplier-manager/supplier-detail'
            : '/sslm/supplier-detail-new';
          return supplierTabKey && record.supplierCompanyId ? (
            <>
              <a onClick={() => this.jumpSupplierLifeManagerDetail(record, supplierTabKey)}>
                {val}
              </a>
            </>
          ) : (
            val
          );
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 180,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !detailFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('supplierCompanyName', {
                initialValue: val,
              })(
                <>
                  {record.qualificationExpiredFlag === 1 && (
                    <Tooltip
                      title={intl
                        .get(`ssrc.inquiryHall.view.tooltip.qualificationExpirationWarning`)
                        .d('资质到期')}
                    >
                      <img src={warnIcon} alt="" style={{ marginRight: 8, marginBottom: 2 }} />
                    </Tooltip>
                  )}
                  <span>{val}</span>
                </>
              )}
            </Form.Item>
          ) : (
            <>
              {record.qualificationExpiredFlag === 1 && (
                <Tooltip
                  title={intl
                    .get(`ssrc.inquiryHall.view.tooltip.qualificationExpirationWarning`)
                    .d('资质到期')}
                >
                  <img src={warnIcon} alt="" style={{ marginRight: 8, marginBottom: 2 }} />
                </Tooltip>
              )}
              {val}
            </>
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCategory`).d('供应商分类'),
        dataIndex: 'supplierCategoryDescription',
        width: 180,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !detailFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('supplierCategoryDescription', {
                initialValue: val,
              })(
                <Popover content={record.$form.getFieldValue('supplierCategoryDescription')}>
                  <Input
                    value={record.$form.getFieldValue('supplierCategoryDescription')}
                    disabled
                  />
                </Popover>
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lifeCycle`).d('生命周期阶段'),
        dataIndex: 'stageDescription',
        width: 140,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !detailFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('stageDescription', {
                initialValue: val,
              })(
                <Tooltip
                  title={
                    record?.stageMismatchCnfFlag
                      ? intl
                          .get(`ssrc.inquiryHall.model.inquiryHall.supplierNotQuotation`)
                          .d('该供应商当前所在的生命周期阶段不可进行报价')
                      : ''
                  }
                >
                  <Input
                    id={record?.stageMismatchCnfFlag ? 'stageDescription' : ''}
                    disabled
                    value={val}
                  />
                </Tooltip>
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.contacts`).d('联系人'),
        dataIndex: 'contactName',
        width: 140,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !detailFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('contactName', {
                initialValue: val,
                rules: [
                  {
                    required: false,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.inquiryHall.model.inquiryHall.contacts`).d('联系人'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SSRC.SUPPLIER_CONTANCTS"
                  textValue={record.contactName || record.$form.getFieldValue('contactName')}
                  queryParams={{
                    companyId,
                    supplierCompanyId: record.supplierCompanyId,
                  }}
                  onChange={(value, dataList) => this.changeContactName(value, dataList, record)}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.tel`).d('联系电话'),
        dataIndex: 'contactMobilephone',
        width: 260,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !detailFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('contactMobilephone', {
                initialValue: val,
                rules: [
                  {
                    required: false,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.contactPhone`).d('联系人电话'),
                    }),
                  },
                  {
                    pattern:
                      record.$form.getFieldValue('internationalTelCode') === '+86'
                        ? PHONE
                        : NOT_CHINA_PHONE,
                    message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
                  },
                ],
              })(
                <Input
                  addonBefore={record.$form.getFieldDecorator('internationalTelCode', {
                    initialValue: record?.internationalTelCode,
                  })(
                    <Select onChange={this.reValidationPhone}>
                      {idd.map((r) => (
                        <Select.Option key={r.value} value={r.value}>
                          {r.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.email`).d('电子邮件'),
        dataIndex: 'contactMail',
        width: 130,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !detailFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('contactMail', {
                initialValue: val,
                rules: [
                  {
                    pattern: EMAIL,
                    message: intl.get(`hzero.common.validation.email`).d('邮箱格式不正确'),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      subjectMatterRule === 'PACK' && {
        title: intl.get(`ssrc.inquiryHall.view.message.button.allotSection`).d('分配标段'),
        dataIndex: 'allocatedLot',
        width: 140,
        render: (_, record) => (
          <a
            disabled={record._status !== 'update'}
            onClick={() => this.handleAllocatedLot(record, detailFlag)}
          >
            {intl.get(`ssrc.inquiryHall.view.message.button.allotSection`).d('分配标段')}
            {record._status !== 'create' &&
              `(${record.assignSectionNums || 0}/${record.sectionNums || 0})`}
          </a>
        ),
      },
    ].filter(Boolean);

    return columns;
  }

  @Bind()
  handleAllocatedLot(record, detailFlag) {
    const { organizationId } = this.props;

    const modalDS = () => ({
      selection: false,
      autoQuery: true,
      fields: [
        {
          name: 'sectionNum',
          type: 'string',
          label: intl.get(`ssrc.bidHall.model.bidHall.sectionPackNum`).d('标段/包编号'),
        },
        {
          name: 'sectionName',
          type: 'string',
          label: intl.get(`ssrc.bidHall.model.bidHall.sectionPackName`).d('标段/包名称'),
        },
        {
          name: 'inviteFlag',
          type: 'boolean',
          trueValue: 1,
          falseValue: 0,
          label: intl.get(`ssrc.bidHall.model.bidHall.whetherDistribute`).d('是否分配'),
        },
        {
          name: 'sectionRemark',
          type: 'string',
          label: intl.get(`hzero.common.remark`).d('备注'),
        },
        {
          name: 'sectionAttachmentUuid',
          type: 'attachment',
          label: intl.get('ssrc.common.model.common.attachment').d('附件'),
        },
      ],
      transport: {
        read: () => {
          return {
            url: `${SRM_SSRC}/v1/${organizationId}/project-sup-sect-assigns/get-assign`,
            method: 'GET',
            data: {
              projectLineSupplierId: record.projectLineSupplierId,
              sourceProjectId: record.sourceProjectId,
            },
          };
        },
        submit: ({ dataSet }) => {
          const data = dataSet.toData();
          return {
            url: `${SRM_SSRC}/v1/${organizationId}/project-sup-sect-assigns/update-assigns`,
            method: 'POST',
            data,
          };
        },
      },
    });

    const modalDs = new DataSet(modalDS());

    C7nModal.open({
      destroyOnClose: true,
      key: C7nModal.key(),
      closable: true,
      drawer: true,
      title: intl.get(`ssrc.inquiryHall.view.message.button.allotSection`).d('分配标段'),
      style: { width: '50%', zIndex: 2 },
      children: <AllotSectionModal modalDs={modalDs} detailFlag={detailFlag} />,
      onOk: () => this.confirmAllotSection(modalDs),
      okButton: !detailFlag,
    });
  }

  @Bind()
  async confirmAllotSection(modalDs) {
    const { supplierLinePage, fetchSupplierLine } = this.props;
    try {
      const res = getResponse(await modalDs.submit());
      if (res) {
        message.success();
      }
    } catch (error) {
      throw error;
    } finally {
      fetchSupplierLine(supplierLinePage || {});
    }
  }

  // table columns
  renderDetailColumns() {
    const { subjectMatterRule, supplierConfigOldUserFlag = true } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 200,
        render: (val, record) => {
          // let source = {};
          // // 判断是否在iframe中
          // if (window.top !== window) {
          //   source = window.parent;
          // } else {
          //   source = window;
          // }
          // 判断有无供应商生命周期/供应商生命周期汇总菜单权限
          // const supplierTabKey =
          //   source.dvaApp?._store
          //     ?.getState?.()
          //     ?.global?.menuLeafNode?.find?.(
          //       (i) =>
          //         i.path === '/sslm/supplier-life-manage' || i.path === '/sslm/supplier-manager'
          //     )?.path || null;
          const supplierTabKey = supplierConfigOldUserFlag
            ? '/sslm/include/supplier-manager/supplier-detail'
            : '/sslm/supplier-detail-new';
          return supplierTabKey && record.supplierCompanyId ? (
            <a onClick={() => this.jumpSupplierLifeManagerDetail(record, supplierTabKey)}>{val}</a>
          ) : (
            val
          );
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 200,
        render: (val, record) => (
          <>
            {record.qualificationExpiredFlag === 1 && (
              <Tooltip
                title={intl
                  .get(`ssrc.inquiryHall.view.tooltip.qualificationExpirationWarning`)
                  .d('资质到期')}
              >
                <img src={warnIcon} alt="" style={{ marginRight: 8, marginBottom: 2 }} />
              </Tooltip>
            )}
            <span>{val}</span>
          </>
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCategory`).d('供应商分类'),
        dataIndex: 'supplierCategoryDescription',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lifeCycle`).d('生命周期阶段'),
        dataIndex: 'stageDescription',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.contacts`).d('联系人'),
        dataIndex: 'contactName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.tel`).d('联系电话'),
        dataIndex: 'contactMobilephone',
        width: 180,
        render: (val, record) => phoneRender(record.internationalTelCode, val || ''),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.email`).d('电子邮件'),
        dataIndex: 'contactMail',
        width: 130,
      },
      subjectMatterRule === 'PACK' && {
        title: intl.get(`ssrc.inquiryHall.view.message.button.allotSection`).d('分配标段'),
        dataIndex: 'allocatedLot',
        width: 120,
        render: (_, record) => (
          <a onClick={() => this.handleAllocatedLot(record, true)}>
            {intl.get(`ssrc.inquiryHall.view.message.button.allotSection`).d('分配标段')}(
            {record.assignSectionNums || 0}/{record.sectionNums || 0})
          </a>
        ),
      },
    ].filter(Boolean);

    return columns;
  }

  batchImportOk = () => {
    const { fetchSupplierLine } = this.props;
    if (fetchSupplierLine) {
      fetchSupplierLine();
    }
  };

  renderImportNewButton = () => {
    const { organizationId, sourceProjectId } = this.props;

    const ImportProps = {
      businessObjectTemplateCode: 'SSRC.PROJECT_SUPPLIER.IMPORT',
      organizationId,
      prefixPatch: SRM_SSRC,
      args: {
        tenantId: organizationId,
        organizationId,
        sourceProjectId,
        templateCode: 'SSRC.PROJECT_SUPPLIER.IMPORT',
      },
      buttonProps: {
        icon: 'archive',
        // funcType: 'flat',
        // color: 'primary',
        disabled: !sourceProjectId,
      },
      buttonText: intl.get('ssrc.inquiryHall.view.message.button.supplierImport').d('供应商导入'),
      autoRefreshInterval: 5000,
      backPath: undefined,
      tenantId: organizationId,
      action: 'hzero.common.title.batchImport',
      auto: true,
      successCallBack: this.batchImportOk,
      name: 'importNew',
    };
    return <CommonImportNew {...ImportProps} />;
  };

  render() {
    const {
      loading,
      saveLoading,
      detailFlag = false,
      supplierRowSelection,
      supplierLineSelectedRowKeys,
      dataSource = [],
      pagination,
      onSearch,
      onSaveLine,
      onDeleteLines,
      onBulkAddSupplier,
      deletLoading,
      // createSupplierLine,
      customizeTable,
      qualificationInfo,
      custLoading = false,
      supplierConfigOldFlag = true,
      // supplierConfigOldUserFlag = true,
      supplierLovProps = {},
      sourceProjectId,
      header,
    } = this.props;

    const columns = detailFlag ? this.renderDetailColumns() : this.renderColumns();
    const scrollX = tableScrollWidth(columns || []);
    const { supplierCompanyName, expiredCount } = qualificationInfo || {};
    const CommonProps = {
      bordered: true,
      rowKey: 'projectLineSupplierId',
      loading,
      scroll: { x: scrollX, y: 480 },
      columns,
      dataSource,
      pagination,
      onChange: (page) => onSearch(page),
      custLoading,
    };

    return (
      <React.Fragment>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            marginBottom: '16px',
            justifyContent: 'end',
          }}
        >
          {!detailFlag && (
            <>
              {this.renderImportNewButton()}
              <SupplierRelatedGraph
                name="relationMap"
                disabled={!sourceProjectId}
                supplierDataList={dataSource}
                sourceProjectId={sourceProjectId}
                projectNum={header?.sourceProjectNum}
                style={{ marginLeft: '8px', marginRight: '8px', borderRadius: '4px' }}
              />
              <TooltipButton
                onClick={onDeleteLines}
                disabled={!supplierLineSelectedRowKeys.length}
                loading={deletLoading}
                help={intl
                  .get('ssrc.common.view.message.supplier-line.select.tip')
                  .d('请先勾选供应商行')}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </TooltipButton>
              <TooltipButton
                style={{ marginLeft: '8px', marginRight: '8px' }}
                onClick={onSaveLine}
                disabled={!dataSource.length}
                loading={saveLoading}
                help={intl
                  .get('ssrc.common.view.message.supplier-line.add.tip')
                  .d('请先新增供应商行')}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </TooltipButton>
              {supplierConfigOldFlag ? (
                <Button onClick={onBulkAddSupplier}>
                  {intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.button.bulkAddSupplier`)
                    .d('批量添加供应商')}
                </Button>
              ) : (
                <SupplierLov {...supplierLovProps}>
                  {intl
                    .get('ssrc.inquiryHall.model.inquiryHall.button.bulkAddSupplier')
                    .d('批量添加供应商')}
                </SupplierLov>
              )}
            </>
          )}
        </div>
        <div>
          {!!supplierCompanyName && (
            <Alert
              showIcon
              message={intl
                .get(`ssrc.inquiryHall.view.message.qualificationWarnInfo`, {
                  supplierCompanyName,
                  expiredCount,
                })
                .d(
                  '{supplierCompanyName}等{expiredCount}家供应商在供应商360资质认证已到期，请确认是否邀请！'
                )}
              type="error"
              style={{ margin: 0 }}
              className={commonStyle['ssrc-alert-error']}
            />
          )}
        </div>
        {customizeTable(
          {
            code: detailFlag
              ? 'SSRC.PROJECT_SETUP_DETAIL.LINE_SUPPLIER'
              : 'SSRC.PROJECT_SETUP_EDIT.LINE_SUPPLIER',
          },
          detailFlag ? (
            <Table {...CommonProps} />
          ) : (
            <EditTable {...CommonProps} rowSelection={supplierRowSelection} />
          )
        )}
      </React.Fragment>
    );
  }
}

const hocComponent = (Com) => {
  return Com;
};

export default SupplierLineTable;

export { SupplierLineTable, hocComponent };
