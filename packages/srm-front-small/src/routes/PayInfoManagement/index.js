import React from 'react';
import uuidv4 from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import { isEmpty, filter } from 'lodash';
import { Tag } from 'choerodon-ui';
import { Modal as HModal } from 'hzero-ui';
import {
  DataSet,
  Password,
  Menu,
  Dropdown,
  Icon,
  Modal,
  Form,
  Tabs,
  Button,
} from 'choerodon-ui/pro';
import DynamicButtons from '_components/DynamicButtons';

import intl from 'utils/intl';
import { getResponse, getEditTableData, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import ImportButton from 'components/Import';
import formatterCollections from 'utils/intl/formatterCollections';
import SearchBarTable from '_components/SearchBarTable';
import CataTables from './CataTables';

import {
  updateEcStatus,
  activeClient,
  updatePwd,
  fetchCommonData,
  fetchStatusList,
  saveModalData,
  deleteModalData,
  saveConfigModal,
} from './api';
import { tableDs, cataTableDs } from './listDs';
import CommonModal from './CommonModal';
import FreightTypeModal from './FreightTypeModal';
import ConfigModal from './ConfigModal';
import './overwrite.less';

@formatterCollections({
  code: ['small.ecClient', 'small.payInfoManagement', 'small.common', 'small.ecClientSite'],
})
export default class ECClient extends React.Component {
  state = {
    pwdLoading: false,
    codeLoading: false,
    commonData: [],
    mapStatusList: [],
    commonSelectedRowKeys: [], // 公共modal选中id
    commonSelectedRows: [], // 公共modal选中行
    commonModalVisible: false, // 公共modal显示/隐藏标记
    freightModalVisible: false,
    modalProps: {
      modalTitle: '', // 模态框标题
      record: {}, // 行数据
      valueType: '', // 数据类型
    },
    activeKey: 'ec',
    saveConfigModalLoading: false,
    cataEditFlag: false,
  };

  tableDs = new DataSet(tableDs());

  cataTableDs = new DataSet(cataTableDs());

  pwdFormDs = new DataSet({
    fields: [
      {
        name: 'userPassword',
        type: 'string',
        required: true,
        maxLength: 120,
        label: intl.get('small.common.model.password').d('密码'),
      },
    ],
  });

  statusRender = ({ record }) => {
    return record.status === 'add' ? (
      '-'
    ) : record.get('enabledFlag') === 0 ? (
      <Tag color="#FEE7E5" style={{ color: '#F44336' }}>
        {intl.get('hzero.common.button.disable').d('禁用')}
      </Tag>
    ) : (
      <Tag color="#D9F6F2" style={{ color: '#00BFA5' }}>
        {intl.get('hzero.common.button.enable').d('启用')}
      </Tag>
    );
  };

  optionsRender = ({ record }) => {
    const enableOption = (
      <a onClick={() => this.handleUpdateStatus(record)}>
        {record.get('enabledFlag') === 1
          ? intl.get('hzero.common.button.disable').d('禁用')
          : intl.get('hzero.common.button.enable').d('启用')}
      </a>
    );
    const pwdOption = (
      <a onClick={() => this.handleOpenPwdModal(record)}>
        {intl.get('small.common.button.changePassword').d('修改密码')}
      </a>
    );
    const assignOption = (
      <a onClick={() => this.handleAssign(record)}>
        {intl.get('small.ecClient.view.ecClient.assignmentSet').d('分配设置')}
      </a>
    );
    const menu = (
      <Menu>
        <Menu.Item>{pwdOption}</Menu.Item>
        <Menu.Item>{assignOption}</Menu.Item>
      </Menu>
    );
    const activeN = (
      <React.Fragment>
        <a onClick={() => this.handleActiveClient(record)}>
          {intl.get('small.ecClient.view.option.accountActivation').d('账户激活')}
        </a>
        {enableOption}
        <Dropdown overlay={menu}>
          <a>
            {intl.get('small.common.view.button.more').d('更多操作')}
            <Icon type="arrow_drop_down" />
          </a>
        </Dropdown>
      </React.Fragment>
    );
    const activeY = (
      <React.Fragment>
        {pwdOption}
        {enableOption}
        {assignOption}
      </React.Fragment>
    );
    return record.status === 'add' ? (
      '-'
    ) : (
      <span className="action-link">{+record.get('activateFlag') ? activeY : activeN}</span>
    );
  };

  buttons(){
    const { cataEditFlag, activeKey } = this.state;
    const btns = [
      {
        name: 'import',
        show: !cataEditFlag || activeKey !== 'cata',
        btnComp: ()=>(
          <ImportButton
            businessObjectTemplateCode="SMAL_EC_CLIENT_PAYMENT_TEMPALTE"
            refreshButton
            buttonText={intl
          .get('small.payInfoManagement.button.batchImport')
          .d('导入电商支付信息')}
            prefixPatch="/smal"
            successCallBack={() => this.tableDs.query()}
            buttonProps={{
            icon: 'archive',
            funcType: 'flat',
          }}
          />
        ),
      },
      {
        name: 'save',
        show: cataEditFlag && activeKey === 'cata',
        child: intl.get('small.common.button.save').d('保存'),
        btnProps: {
          color: 'primary',
          icon: 'save',
          onClick: this.handleCataSave,
        },
      },
      {
        name: 'cancel',
        show: cataEditFlag && activeKey === 'cata',
        child: intl.get('small.common.button.cancel').d('取消'),
        btnProps: {
          funcType: 'flat',
          icon: 'cancel',
          onClick: () => this.handleCataEdit(),
        },
      },
      {
        name: 'edit',
        show: !cataEditFlag && activeKey === 'cata',
        child: intl.get('small.common.button.edit').d('编辑'),
        btnProps: {
          funcType: 'flat',
          icon: 'mode_edit',
          onClick: () => this.handleCataEdit(),
        },
      },
    ].filter(i=> !!i.show);
    return <DynamicButtons buttons={btns} defaultBtnType="c7n-pro" />;
  }

  configModalOk = async () => {
    const newEcInvoiceInfoDTOS = this.invoiceMethodDS.map((p, index) => {
      return {
        groupNum: index + 1,
        ecInvoiceInfoList: p.tds?.toData(),
        ecInvoiceAssignList: p.cds?.toData()?.[0]?.companyLov || [],
      };
    });
    const otherInvoiceData = [
      ...this.invoiceTitleDS.toData(),
      ...this.invoiceDetailDS.toData(),
      ...this.paymentMethodDS.toData(),
      ...this.freightTypeDS.toData(),
    ];
    return saveConfigModal({
      newEcInvoiceInfoDTOS,
      ecClientValueList: otherInvoiceData.filter((p) => !isEmpty(p)),
    });
  };

  columns = [
    {
      name: 'ecPlatform',
      width: 180,
    },
    {
      name: 'ecPlatformName',
      width: 180,
    },
    {
      name: 'companyLov',
      width: 180,
      editor: false,
    },
    {
      name: 'ecCompanyName',
      minWidth: 180,
    },
    {
      name: 'userName',
      width: 180,
      editor: false,
    },
    {
      name: 'opreate',
      renderer: ({ record }) => {
        return (
          <Button
            funcType='link'
            color='primary'
            onClick={() =>
              Modal.open({
                className: 'small-PayInfoManagement-config-info-modal',
                style: { width: 742 },
                title: intl.get('small.common.EC.paymenyInfo.config').d('电商支付信息配置'),
                drawer: true,
                children: (
                  <ConfigModal
                    activeKey={this.state.activeKey}
                    onDSRef={({ name, ref }) => {
                      this[name] = ref;
                    }}
                    record={record.toData()}
                  />
                ),
                okProps: {
                  loading: this.state.saveConfigModalLoading,
                },
                onOk: async () => {
                  const result = await Promise.all([
                    ...this.invoiceMethodDS?.map((p) => p.tds.validate()),
                    this.invoiceTitleDS.validate(),
                    this.invoiceDetailDS.validate(),
                    this.paymentMethodDS.validate(),
                    this.freightTypeDS.validate(),
                  ]);
                  if (result.every((p) => !!p)) {
                    const err = [];
                    this.invoiceMethodDS
                      .map((p) => p.tds)
                      .forEach((ds) => {
                        ds.forEach((d, i)=> d.set('orderSeq', i + 1)); // 设置优先级
                      });
                    this.invoiceMethodDS
                      .filter((p) => p.groupNum !== 1)
                      .map((p) => p.cds)
                      .forEach((ds) => {
                        if (isEmpty(ds.current.toData().companyLov)) {
                          err.push(false);
                        }
                      });
                    if (err.some((p) => !p)) {
                      notification.warning({
                        message: intl
                          .get('small.payInfoManagement.warning.empty.company')
                          .d('请选择适用公司'),
                      });
                      return false;
                    }
                    if (isEmpty(this.invoiceTitleDS.toData())) {
                      notification.warning({
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('small.common.model.invoiceForm').d('发票形式'),
                        }),
                      });
                      return false;
                    } else if (isEmpty(this.invoiceDetailDS.toData())) {
                      notification.warning({
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('small.common.model.invoiceDetails').d('发票明细'),
                        }),
                      });
                      return false;
                    } else if (isEmpty(this.paymentMethodDS.toData())) {
                      notification.warning({
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('small.common.model.paymentMethod').d('支付方式'),
                        }),
                      });
                      return false;
                    } else if (isEmpty(this.freightTypeDS.toData())) {
                      notification.warning({
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('small.common.model.freightType').d('运费类型'),
                        }),
                      });
                      return false;
                    } else {
                      this.setState({
                        saveConfigModalLoading: true,
                      });
                      const res = getResponse(await this.configModalOk(record.toData()));
                      this.setState({
                        saveConfigModalLoading: false,
                      });
                      if (res) {
                        notification.success();
                      }
                      return !!res;
                    }
                  } else {
                    return false;
                  }
                },
              })
            }
          >
            {intl.get('small.common.EC.paymenyInfo.config').d('电商支付信息配置')}
          </Button>
        );
      },
    },
    // {
    //   name: 'invoiceMethod',
    //   width: 120,
    //   renderer: ({ record }) => (
    //     <a
    //       onClick={() =>
    //         this.handleVisible(
    //           record.toData(),
    //           intl.get('small.common.model.invoiceMethod').d('开票方式'),
    //           'SMAL.INVOICE_METHOD',
    //           'INVOICE_METHOD'
    //         )
    //       }
    //     >
    //       {intl.get('small.common.model.invoiceMethod').d('开票方式')}
    //     </a>
    //   ),
    // },
    // {
    //   name: 'invoiceTitle',
    //   width: 120,
    //   renderer: ({ record }) => (
    //     <a
    //       onClick={() =>
    //         this.handleVisible(
    //           record.toData(),
    //           intl.get('small.common.model.invoiceForm').d('发票形式'),
    //           'SMAL.INVOICE_TITLE',
    //           'INVOICE_TITLE'
    //         )
    //       }
    //     >
    //       {intl.get('small.common.model.invoiceForm').d('发票形式')}
    //     </a>
    //   ),
    // },
    // {
    //   name: 'invoiceType',
    //   width: 120,
    //   renderer: ({ record }) => (
    //     <a
    //       onClick={() =>
    //         this.handleVisible(
    //           record.toData(),
    //           intl.get('small.common.model.invoiceTypes').d('发票类型'),
    //           'SMAL.INVOICE_TYPE',
    //           'INVOICE_TYPE'
    //         )
    //       }
    //     >
    //       {intl.get('small.common.model.invoiceTypes').d('发票类型')}
    //     </a>
    //   ),
    // },
    // {
    //   name: 'invoiceDetail',
    //   width: 120,
    //   renderer: ({ record }) => (
    //     <a
    //       onClick={() =>
    //         this.handleVisible(
    //           record.toData(),
    //           intl.get('small.common.model.invoiceDetails').d('发票明细'),
    //           'SMAL.INVOICE_CONTENT',
    //           'INVOICE_DETAIL'
    //         )
    //       }
    //     >
    //       {intl.get('small.common.model.invoiceDetails').d('发票明细')}
    //     </a>
    //   ),
    // },
    // {
    //   name: 'paymentMethod',
    //   width: 120,
    //   renderer: ({ record }) => (
    //     <a
    //       onClick={() =>
    //         this.handleVisible(
    //           record.toData(),
    //           intl.get('small.common.model.paymentMethod').d('支付方式'),
    //           'SMAL.PAYMENT_METHOD',
    //           'PAYMENT_TYPE'
    //         )
    //       }
    //     >
    //       {intl.get('small.common.model.paymentMethod').d('支付方式')}
    //     </a>
    //   ),
    // },
    // {
    //   name: 'freightType',
    //   width: 120,
    //   renderer: ({ record }) => (
    //     <a
    //       onClick={() =>
    //         this.handleVisible(
    //           record.toData(),
    //           intl.get('small.common.model.freightType').d('运费类型'),
    //           'SMAL.EC_FREIGHT_TYPE',
    //           'FREIGHT_TYPE'
    //         )
    //       }
    //     >
    //       {intl.get('small.common.model.freightType').d('运费类型')}
    //     </a>
    //   ),
    // },
  ];

  cataColunms = [
    {
      name: 'invoiceMethod',
      renderer: ({ record }) => (
        <a
          onClick={() =>
            this.handleVisible(
              record.toData(),
              intl.get('small.common.model.invoiceMethod').d('开票方式'),
              'SMAL.CATA_INVOICE_METHOD',
              'INVOICE_METHOD'
            )
          }
        >
          {intl.get('small.common.model.invoiceMethod').d('开票方式')}
        </a>
      ),
    },
    {
      name: 'invoiceTitle',
      renderer: ({ record }) => (
        <a
          onClick={() =>
            this.handleVisible(
              record.toData(),
              intl.get('small.common.model.invoiceForm').d('发票形式'),
              'SMAL.INVOICE_TITLE',
              'INVOICE_TITLE'
            )
          }
        >
          {intl.get('small.common.model.invoiceForm').d('发票形式')}
        </a>
      ),
    },
    {
      name: 'invoiceType',
      renderer: ({ record }) => (
        <a
          onClick={() =>
            this.handleVisible(
              record.toData(),
              intl.get('small.common.model.invoiceTypes').d('发票类型'),
              'SMAL.INVOICE_TYPE',
              'INVOICE_TYPE'
            )
          }
        >
          {intl.get('small.common.model.invoiceTypes').d('发票类型')}
        </a>
      ),
    },
    {
      name: 'invoiceDetail',
      renderer: ({ record }) => (
        <a
          onClick={() =>
            this.handleVisible(
              record.toData(),
              intl.get('small.common.model.invoiceDetails').d('发票明细'),
              'SMAL.INVOICE_CONTENT',
              'INVOICE_DETAIL'
            )
          }
        >
          {intl.get('small.common.model.invoiceDetails').d('发票明细')}
        </a>
      ),
    },
    // {
    //   name: 'freightType',
    //   renderer: ({ record }) => (
    //     <a
    //       onClick={() =>
    //         this.handleVisible(
    //           record.toData(),
    //           intl.get('small.common.model.freightType').d('运费类型'),
    //           'SMAL.EC_FREIGHT_TYPE',
    //           'FREIGHT_TYPE'
    //         )
    //       }
    //     >
    //       {intl.get('small.common.model.freightType').d('运费类型')}
    //     </a>
    //   ),
    // },
    // {
    //   name: 'paymentType',
    //   renderer: ({ record }) => (
    //     <a
    //       onClick={() =>
    //         this.handleVisible(
    //           record.toData(),
    //           intl.get('small.common.model.paymentTypeCata').d('支付类型'),
    //           'SMAL.CATA_PAYMENT_TYPE',
    //           'PAYMENT_TYPE'
    //         )
    //       }
    //     >
    //       {intl.get('small.common.model.paymentTypeCata').d('支付类型')}
    //     </a>
    //   ),
    // },
    // {
    //   name: 'paymentMethod',
    //   renderer: ({ record }) => (
    //     <a
    //       onClick={() =>
    //         this.handleVisible(
    //           record.toData(),
    //           intl.get('small.common.model.paymentMethod').d('支付方式'),
    //           'SMAL.CATA_PAYMENT_METHOD',
    //           'PAYMENT_METHOD'
    //         )
    //       }
    //     >
    //       {intl.get('small.common.model.paymentMethod').d('支付方式')}
    //     </a>
    //   ),
    // },
  ];

  @Bind()
  handleCreate() {
    this.cataTableDs.create({ clientType: 'TENANT', enabledFlag: 1 }, 0);
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const flag = await this.tableDs.validate();
    if (flag) {
      const res = await this.tableDs.submit();
      const result = getResponse(res);
      if (result) {
        this.tableDs.query();
      }
    }
  }

  @Bind()
  handleCancel() {
    this.tableDs.forEach((record) => {
      record.reset();
    });
  }

  @Bind()
  async handleUpdateStatus(record) {
    const data = record.toData();
    const res = await updateEcStatus([{ ...data, enabledFlag: data.enabledFlag === 1 ? 0 : 1 }]);
    const result = getResponse(res);
    if (result) {
      notification.success();
      this.tableDs.query(this.tableDs.currentPage);
    }
  }

  @Bind()
  async handleActiveClient(record) {
    const res = await activeClient({ ecClientId: record.get('ecClientId') });
    const result = getResponse(res);
    if (result) {
      this.tableDs.query(this.tableDs.currentPage);
    }
  }

  @Bind()
  async handleVisible(record = {}, title, name, valueType) {
    const { activeKey } = this.state;
    this.setState({
      [valueType === 'FREIGHT_TYPE' ? 'freightModalVisible' : 'commonModalVisible']: true,
      modalProps: {
        modalTitle: title,
        record,
        valueType,
        activeKey,
      },
    });
    if (name) {
      this.setState({ codeLoading: true });
      const params =
        activeKey === 'ec'
          ? {
              activeKey,
              ecClientId: record.ecClientId,
              valueType,
            }
          : {
              activeKey,
              valueType,
            };
      const res = await fetchCommonData(params);
      const result = getResponse(res);
      this.setState({
        codeLoading: false,
        commonData: (result || []).map((m, index) => ({
          ...m,
          orderSeq: index + 1,
          _status: 'update',
        })),
      });
    }
    const res2 = await fetchStatusList({
      lovCode: name,
      parentValue: record.ecPlatform,
    });
    const response = getResponse(res2);
    this.setState({
      mapStatusList: response,
    });
  }

  /**
   * 公共模态框-新增行
   */
  @Bind()
  handleCodeCreate() {
    const { commonData = [] } = this.state;
    this.setState({
      commonData: [
        ...commonData,
        {
          orderSeq: commonData.length + 1,
          enabledFlag: 1,
          defaultValue: 0,
          valueId: uuidv4(),
          _status: 'create',
        },
      ],
    });
  }

  /**
   * 公共模态框-保存
   */
  @Bind()
  async handleCodeSave(param, type) {
    const {
      commonData,
      activeKey,
      modalProps: { record, valueType },
    } = this.state;
    let newParams;
    if (type !== 'freightType') {
      newParams = getEditTableData(commonData, ['valueId', 'orderSeq']);
      newParams = newParams.map((item) => {
        const newItem = item;
        delete newItem.name;
        return {
          ...newItem,
          [activeKey === 'ec' && 'ecClientId']: record[activeKey === 'ec' && 'ecClientId'],
          tenantId: getCurrentOrganizationId(),
          valueType,
        };
      });
    } else {
      newParams = param;
    }
    if (!isEmpty(newParams)) {
      const res = await saveModalData(activeKey, newParams);
      const result = getResponse(res);
      if (result) {
        this.setState({ codeLoading: true });
        const params =
          activeKey === 'ec'
            ? {
                activeKey,
                ecClientId: record.ecClientId,
                valueType,
              }
            : {
                activeKey,
                valueType,
              };
        const res2 = await fetchCommonData(params);
        const result2 = getResponse(res2);
        this.setState({ codeLoading: true });
        if (result2) {
          this.setState({
            commonData: result2.map((m, index) => ({
              ...m,
              orderSeq: index + 1,
              _status: 'create',
            })),
          });
        }
        this.setState({
          [valueType === 'FREIGHT_TYPE' ? 'freightModalVisible' : 'commonModalVisible']: false,
        });
        notification.success();
      }
    }
  }

  /**
   * 公共模态框-批量删除
   */
  @Bind()
  handleCodeDelete() {
    const { commonSelectedRowKeys, commonData, activeKey } = this.state;
    // 过滤出勾选数据
    const newParameters = filter(commonData, (item) => {
      return commonSelectedRowKeys.indexOf(item.valueId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newData = filter(commonData, (item) => {
      return commonSelectedRowKeys.indexOf(item.valueId) < 0;
    });
    HModal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: () => {
        const remoteDelete = [];
        const localDelete = [];
        newParameters.forEach((item) => {
          if (item._status === 'create') {
            localDelete.push(item);
          } else if (item._status === 'update') {
            remoteDelete.push(item);
          }
        });
        if (isEmpty(remoteDelete)) {
          this.setState({ commonSelectedRowKeys: [], commonSelectedRows: [], commonData: newData });
        } else {
          deleteModalData({ remoteDelete, activeKey }).then((res) => {
            const result = getResponse(res);
            if (result) {
              notification.success();
              this.setState({
                commonSelectedRowKeys: [],
                commonSelectedRows: [],
                commonData: newData,
              });
            }
          });
        }
      },
    });
  }

  /**
   * 公共模态框-获取删除选中行
   * @param {*} selectedRowKeys
   */
  @Bind()
  handleCodeRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      commonSelectedRowKeys: selectedRowKeys,
      commonSelectedRows: selectedRows,
    });
  }

  @Bind()
  handleCloseCodeModal() {
    this.setState({
      commonModalVisible: false,
      freightModalVisible: false,
    });
  }

  @Bind()
  handleOpenPwdModal(record) {
    const { pwdLoading } = this.state;
    this.pwdFormDs.create();
    Modal.open({
      destroyOnClose: true,
      title: intl.get('small.common.button.changePassword').d('修改密码'),
      mask: true,
      closable: true,
      style: { width: 400 },
      onOk: () => this.handleUpdatePwd(record),
      okProps: { loading: pwdLoading },
      afterClose: () => {
        this.pwdFormDs.reset();
      },
      children: (
        <Form dataSet={this.pwdFormDs}>
          <Password name="userPassword" autoComplete="new-password" />
        </Form>
      ),
    });
  }

  @Bind()
  async handleUpdatePwd(record) {
    const ecClientId = record.get('ecClientId');
    const flag = await this.pwdFormDs.validate();
    if (flag) {
      const params = this.pwdFormDs.toData()[0] || {};
      this.setState({ pwdLoading: true });
      const res = await updatePwd({
        ...params,
        ecClientId,
      });
      const result = getResponse(res);
      this.setState({ pwdLoading: false });
      if (result) {
        notification.success();
        this.tableDs.query(this.tableDs.currentPage);
        return true;
      }
      return false;
    }
    return false;
  }

  @Bind()
  handleAssign(record) {
    this.props.history.push(`/small/ec-client/assign?ecClientId=${record.get('ecClientId')}`);
  }

  @Bind()
  handleCataEdit(){
    this.setState({cataEditFlag: !this.state.cataEditFlag});
  }

  @Bind()
  async handleCataSave(){
    const result = await Promise.all([
      this.cataInvoiceMethodDS.validate(),
      this.cataInvoiceTitleDS.validate(),
      this.cataInvoiceDetailDS.validate(),
      this.cataInvoiceTypeDS.validate(),
    ]);
    if (result.every((p) => !!p)) {
      if (isEmpty(this.cataInvoiceMethodDS.toData())) {
        notification.warning({
          message: intl.get('hzero.common.validation.notNull', {
            name: intl.get('small.common.model.invoiceMethod').d('开票方式'),
          }),
        });
        return false;
      } else if (isEmpty(this.cataInvoiceTitleDS.toData())) {
        notification.warning({
          message: intl.get('hzero.common.validation.notNull', {
            name: intl.get('small.common.model.invoiceForm').d('发票形式'),
          }),
        });
        return false;
      } else if (isEmpty(this.cataInvoiceTypeDS.toData())) {
        notification.warning({
          message: intl.get('hzero.common.validation.notNull', {
            name: intl.get('small.common.model.invoiceTypes').d('发票类型'),
          }),
        });
        return false;
      } else if (isEmpty(this.cataInvoiceDetailDS.toData())) {
        notification.warning({
          message: intl.get('hzero.common.validation.notNull', {
            name: intl.get('small.common.model.invoiceDetails').d('发票明细'),
          }),
        });
        return false;
      } else {
        const newParams = [
          ...this.cataInvoiceMethodDS.toData(),
          ...this.cataInvoiceTitleDS.toData(),
          ...this.cataInvoiceDetailDS.toData(),
          ...this.cataInvoiceTypeDS.toData() ];
        const res = await saveModalData(this.state.activeKey, newParams);
        if (res && !res.failed) {
          notification.success();
          this.handleCataEdit();
        }else if(res.failed){
          notification.warning({
            message: res.message,
          });
        }
        return !!res;
      }
    } else {
      return false;
    }
  }

  render() {
    const {
      activeKey,
      commonModalVisible,
      freightModalVisible,
      modalProps,
      commonData,
      mapStatusList,
      codeLoading,
      commonSelectedRowKeys = [],
      commonSelectedRows = [],
      cataEditFlag,
    } = this.state;
    const commonRowSelection = {
      selectedRowKeys: commonSelectedRowKeys,
      onChange: this.handleCodeRowSelectChange,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('small.payInfoManagement.view.message.title').d('支付信息管理')}>
          {this.buttons()}
        </Header>
        <Content>
          <Tabs
            animated={false}
            activeKey={activeKey}
            onChange={key => this.setState({ activeKey: key })}
            // tabBarStyle={{ marginTop: '-16px' }}
          >
            <Tabs.TabPane tab={intl.get('small.common.model.common.E-commerce').d('电商')} key="ec">
              <div style={{ height: 'calc(100vh - 252px)' }}>
                <SearchBarTable
                  searchCode='SMAL.EC_PAYMENT.SEARCH_INFO'
                  customizedCode="SMAL.EC_PAYMENT.QUERY"
                  dataSet={this.tableDs}
                  columns={this.columns}
                  style={{ maxHeight: `calc(100% - 18px)` }}
                />
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get('small.common.model.common.innerBuy').d('内部采购')}
              key="cata"
            >
              <CataTables
                editFlag={!cataEditFlag}
                activeKey={activeKey}
                onDSRef={({ name, ref }) => {
                  this[name] = ref;
                }}
                record={{}}
              />
            </Tabs.TabPane>
          </Tabs>
          {commonModalVisible && (
            <CommonModal
              {...modalProps}
              loading={codeLoading}
              commonModalVisible={commonModalVisible}
              commonData={commonData}
              mapStatusList={mapStatusList}
              onHandleVisible={this.handleVisible}
              onCloseCommonModal={this.handleCloseCodeModal}
              onCreate={this.handleCodeCreate}
              onDelete={this.handleCodeDelete}
              onSave={this.handleCodeSave}
              commonRowSelection={commonRowSelection}
              commonSelectedRows={commonSelectedRows}
              commonSelectedRowKeys={commonSelectedRowKeys}
              onDefaultValue={data => this.setState({ commonData: data })}
            />
          )}
          <FreightTypeModal
            {...modalProps}
            loading={codeLoading}
            commonModalVisible={freightModalVisible}
            commonData={commonData}
            mapStatusList={mapStatusList}
            onHandleVisible={this.handleVisible}
            onCloseCommonModal={this.handleCloseCodeModal}
            onCreate={this.handleCodeCreate}
            onDelete={this.handleCodeDelete}
            onSave={this.handleCodeSave}
            commonRowSelection={commonRowSelection}
            commonSelectedRows={commonSelectedRows}
            commonSelectedRowKeys={commonSelectedRowKeys}
          />
        </Content>
      </React.Fragment>
    );
  }
}
