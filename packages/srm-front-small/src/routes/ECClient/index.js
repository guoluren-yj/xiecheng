import React from 'react';
import uuidv4 from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import { isEmpty, filter, isNil } from 'lodash';
import { Tag } from 'choerodon-ui';
import { Modal as HModal } from 'hzero-ui';
import {
  DataSet,
  // Table,
  Password,
  Button,
  Icon,
  Modal,
  Form,
} from 'choerodon-ui/pro';
import DynamicButtons from '_components/DynamicButtons';
import intl from 'utils/intl';
import { getResponse, getEditTableData } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import ImportButton from 'components/Import';
import formatterCollections from 'utils/intl/formatterCollections';
import SearchBarTable from '_components/SearchBarTable';
import TextFieldPro from '@/components/TextFieldPro';
import c7nModal from '@/utils/c7nModal';
import { operationRender } from '@/utils/renderer';
import { Fields } from 'components/Permission';
import { SUCCESS as PERMISSION_SUCCESS } from 'components/Permission/Status';
import PropTypes from 'prop-types';
import './index.less';

import {
  updateEcStatus,
  activeClient,
  updatePwd,
  fetchCommonData,
  fetchStatusList,
  saveModalData,
  deleteModalData,
} from './api';
import { tableDs, formDs } from './listDs';
import CommonModal from './CommonModal';
import FreightTypeModal from './FreightTypeModal';
import EditForm from './EditForm';
import Assign from './Assign';
import RemainModal from './remainModal';


const defultPermission = {
  code: `srm.mall.tenant.buying-manage.ec-client.ps.default`,
  type: 'fields',
  meaning: '默认权限集合',
};
const onlyBalancePermission = {
  code: `srm.mall.tenant.buying-manage.ec-client.api.only-balance`,
  type: 'fields',
  meaning: '仅查看余额',
};
const MenuItemLinkBtn = ({ btnComp, style, ...btnProps }) => {
  const BtnComp = btnComp;
  return (
    <div className="drop-down-import-btn-wrapper" style={style}>
      <BtnComp {...btnProps} isHeadButton={false} />
    </div>
  );
};

@formatterCollections({ code: ['small.ecClient', 'small.common', 'small.ecClientSite'] })
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
    currentPermissions: { defultPermissionFlag: false, onlyBalancePermissionFlag: false },
  };

  static contextTypes = {
    permission: PropTypes.object,
  };

  tableDs = new DataSet(tableDs());

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
      <Tag color="red" border={false}>
        {intl.get('hzero.common.button.disable').d('禁用')}
      </Tag>
    ) : (
      <Tag color="green" border={false}>
        {intl.get('hzero.common.button.enable').d('启用')}
      </Tag>
    );
  };

  optionsRender = ({ record }) => {
    const { currentPermissions: {defultPermissionFlag, onlyBalancePermissionFlag} } = this.state;
    let buttonList = [
      {
        visible: !defultPermissionFlag || +record.get('activateFlag'),
        name: intl.get('small.ecClient.view.option.accountActivation').d('账户激活'),
        onClick: () => this.handleBatchActiveClient([record]),
      },
      // {
      //   visible: !defultPermissionFlag,
      //   name: intl.get('small.common.button.changePassword').d('修改密码'),
      //   onClick: () => this.handleOpenPwdModal(record),
      // },
      {
        visible: !defultPermissionFlag,
        name: intl.get('small.ecClient.view.ecClient.assignmentSet').d('分配设置'),
        onClick: () => this.handleAssign(record),
      },
      // {
      //   visible: !defultPermissionFlag,
      //   name: intl.get('small.ecClient.view.ecClient.editable').d('编辑'),
      //   onClick: () => this.handleCreate(record),
      // },
      {
        visible: !onlyBalancePermissionFlag || record.get('remainLimitFlag') !== 1,
        name: intl.get('small.ecClient.view.ecClient.checkRemain').d('查看余额'),
        onClick: () => this.handleRemain(record),
      },
    ]
    .filter(i=>!i.visible);

    if (defultPermissionFlag) {
      buttonList.splice(1, 0, { // 固定在第二个位置添加禁用按钮
        name: record.get('enabledFlag') === 1
          ? intl.get('hzero.common.button.disable').d('禁用')
          : intl.get('hzero.common.button.enable').d('启用'),
        onClick: () => this.handleUpdateStatus(record),
      });
    }

    // 禁用只展示启用
    if(record.get('enabledFlag') !== 1) {
      buttonList = [
        {
          name: intl.get('hzero.common.button.enable').d('启用'),
          onClick: () => this.handleUpdateStatus(record),
        },
      ];
    }

    return record.status === 'add' ? (
      '-'
    ) : operationRender({
      buttonList,
    });

  };

  @Bind
  createBtnsRender(){

    const buttons = [
      {
        name: 'create',
        group: true,
        child: (
          <Button icon="add" color="primary">
            {intl.get('small.ecClient.view.addEcClient').d('新建电商账号')}
            <Icon
              type="expand_more"
              style={{
                marginLeft: 4,
                marginTop: -2,
                fontSize: '16px',
              }}
            />
          </Button>
        ),
        children: [
          {
            name: 'manualCreate',
            btnType: 'c7n-pro',
            child: intl.get('small.ecClient.view.maualCreate').d('手动新建'),
            btnProps: {
              onClick: () => this.handleCreate(),
            },
          },
          {
            name: 'import',
            btnComp: MenuItemLinkBtn,
            btnProps: {
              btnComp: ImportButton,
              prefixPatch: "/smal",
              refreshButton: true,
              businessObjectTemplateCode: "SRM_C_SCEC_EC_CLIENT_TEMPLATE",
              buttonText: intl.get('small.ecClient.view.batchImportClient').d('导入电商账号'),
              successCallBack: () => this.tableDs.query(this.tableDs.currentPage),
              buttonProps: {
                icon: '',
                funcType: 'flat',
              },
            },
          },
        ],
      },
    ];
    return (
      <DynamicButtons buttons={buttons} maxNum={3} defaultBtnType="c7n-pro" />
    );
  }

  @Bind
  batchBtnsRender(){
    const buttons = [
      {
        name: 'batch',
        group: true,
        child: (
          <Button icon="settings" funcType="flat">
            {intl.get('small.ecClient.view.batchOperate').d('批量操作')}
            <Icon
              type="expand_more"
              style={{
                marginLeft: 4,
                marginTop: -2,
                fontSize: '16px',
              }}
            />
          </Button>
        ),
        observerBtnProps: ()=>({
          funcType: 'flat',
          disabled: !this.tableDs.selected.length,
        }),
        children: [
          {
            name: 'batchDisabled',
            btnType: 'c7n-pro',
            child: intl.get('small.common.button.disableBatch').d('批量禁用'),
            observerBtnProps: ()=>({
              funcType: 'flat',
              disabled: !this.tableDs.selected.some(s => s.get('enabledFlag') === 1),
              onClick: () =>
                this.handleBatchUpdateStatus(
                  this.tableDs.selected.filter(f => f.get('enabledFlag') === 1)
                )
              ,
            }),
          },
          {
            name: 'batchEnabled',
            btnType: 'c7n-pro',
            child: intl.get('small.common.button.enableBatch').d('批量启用'),
            observerBtnProps: ()=>({
              funcType: 'flat',
              disabled: !this.tableDs.selected.some(s => s.get('enabledFlag') === 0),
              onClick: () =>
                this.handleBatchUpdateStatus(
                  this.tableDs.selected.filter(f => f.get('enabledFlag') === 0)
                ),
            }),
          },
          {
            name: 'batchActive',
            btnType: 'c7n-pro',
            child: intl.get('small.ecClient.button.batchActive').d('批量激活'),
            observerBtnProps: ()=>({
              funcType: 'flat',
              disabled: !this.tableDs.selected.some(s => !+s.get('activateFlag') && s.get('enabledFlag') === 1),
              onClick: () =>
              this.handleBatchActiveClient(
                this.tableDs.selected.filter(f => !+f.get('activateFlag'))
              ),
            }),
          },
        ],
      },
    ];
    return (
      <DynamicButtons buttons={buttons} maxNum={3} defaultBtnType="c7n-pro" />
    );
  }

  columns = [
    {
      name: 'enabledFlag',
      width: 90,
      align: 'left',
      renderer: this.statusRender,
    },
    {
      name: 'userName',
      width: 160,
      renderer: ({ text, record }) => {
        const { currentPermissions: {defultPermissionFlag} } = this.state;
        return !defultPermissionFlag || record.get('enabledFlag') !== 1 || record.status === 'add' ?
          <span>{text}</span> : <a onClick={() => this.handleCreate(record)}>{text}</a>;
      },
      // editor: true,
    },
    {
      name: 'ecPlatformLov',
      width: 180,
      // lock: 'left',
      // editor: (record) => (
      //   <Lov
      //     onChange={(item) => {
      //       if (item) {
      //         record.set('ecPlatformLov', {
      //           ecPlatform: item.ecPlatformCode,
      //           ecPlatformCodeName: `${item.ecPlatformCode}-${item.ecPlatformName}`,
      //           ecTenantId: item.tenantId,
      //         });
      //       }
      //       record.set('companyLov', null);
      //     }}
      //   />
      // ),
    },
    {
      name: 'companyLov',
      width: 140,
      // editor: true,
    },
    {
      name: 'ecCompanyName',
      minWidth: 180,
    },
    {
      name: 'customerCode',
      width: 120,
      // editor: true,
    },
    {
      name: 'userPassword',
      width: 120,
      renderer: ({ value }) => (value ? <span>*********</span> : <span>-</span>),
    },
    {
      name: 'serverAddress',
      width: 240,
      // editor: true,
    },
    {
      name: 'placeOrderUrl',
      width: 160,
      // editor: true,
    },
    {
      name: 'soldTo',
      width: 160,
      // editor: true,
    },
    {
      name: 'accessKeyId',
      width: 200,
      // editor: true,
    },
    {
      name: 'accessKeySecret',
      width: 120,
      renderer: ({ value }) => (value ? <span>*********</span> : <span>-</span>),
      // editor: true,
    },
    {
      name: 'dataType',
      width: 150,
      // editor: true,
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
    //           'SMAL.INVOICE_DETAIL',
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
    {
      name: 'options',
      width: 220,
      lock: 'right',
      renderer: this.optionsRender,
    },
  ];

  handleCurrentPermission = (name, status)=>{
    this.setState((state)=>({
      currentPermissions: {
        ...state.currentPermissions,
        [name]: PERMISSION_SUCCESS === status,
      },
    }));
  }

  componentDidMount() {

    if (this.context?.permission) {
      this.context.permission.check({
        permissionList: [
          defultPermission,
        ],
      }, (status) => {
        this.handleCurrentPermission('defultPermissionFlag', status);
      });

      this.context.permission.check({
        permissionList: [
          defultPermission,
          onlyBalancePermission,
        ],
      }, (status) => {
        this.handleCurrentPermission('onlyBalancePermissionFlag', status);
      });
    }

  }

  @Bind()
  handleRemain(record) {
    const modal = c7nModal({
      title: intl.get('small.common.model.accountRemainSum').d('账户余额'),
      style: { width: '742px' },
      children: <RemainModal recordData={record.toData()} />,
      footer: (
        <Button color="primary" onClick={() => modal?.close()}>
          {intl.get('small.common.model.close').d('关闭')}
        </Button>
      ),
    });
  }

  @Bind()
  handleCreate(record) {
    const formDS = new DataSet(formDs());
    const recordData = record ? record.toData() : {};
    const modal = c7nModal({
      title: record
        ? intl.get('small.common.model.editAccount').d('编辑电商账号')
        : intl.get('small.common.model.addAccount').d('新建电商账号'),
      children: <EditForm recordData={recordData} dataSet={formDS} />,
      style: { width: 380 },
      onOk: async () => {
        const flag = await formDS.validate();
        if (flag) {
          Modal.confirm({
            title: intl.get('small.common.view.tips').d('提示'),
            children: intl
              .get('small.ecClient.view.saveConfirm')
              .d(
                '一个电商平台可能存在多个电商公司，为保证后续流程执行无误，请确认该电商公司名称是商务合同中的签约服务方后再保存'
              ),
            onOk: async () => {
              try {
                await formDS.submit();
                modal.close();
                this.tableDs.query();
              } catch {

              }
            },
          });
        };
        return false;
      },
      okText: intl.get('hzero.common.button.save').d('保存'),
    });
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave(ds) {
    const flag = await ds.validate();
    if (flag) {
      const res = await ds.submit();
      const result = getResponse(res);
      if (result) {
        this.tableDs.query();
      }
    } else {
      return false;
    }
  }

  @Bind()
  handleCancel() {
    this.tableDs.forEach(record => {
      record.reset();
    });
  }

  @Bind()
  async handleUpdateStatus(record) {
    const data = record.toData();
    delete data.userPassword;
    const res = await updateEcStatus([{ ...data, enabledFlag: data.enabledFlag === 1 ? 0 : 1 }]);
    const result = getResponse(res);
    if (result) {
      notification.success();
      this.tableDs.query(this.tableDs.currentPage);
    }
  }

  @Bind()
  async handleBatchUpdateStatus(selected) {
    const params = selected.map(m => {
      const item = m.toData();
      delete item.userPassword;
      return { ...item, enabledFlag: item.enabledFlag === 1 ? 0 : 1 };
    });
    const res = await updateEcStatus(params);
    const result = getResponse(res);
    if (result) {
      notification.success();
      this.tableDs.query(this.tableDs.currentPage);
    }
  }

  // @Bind()
  // async handleActiveClient(record) {
  //   const res = await activeClient([{ ecClientId: record.get('ecClientId') }]);
  //   const result = getResponse(res);
  //   if (result) {
  //     if(result === 1) {
  //       Modal.confirm({
  //         title: intl.get('small.common.model.tips').d('提示'),
  //         children: intl.get('small.ecClient.title.activeClient').d('您所在的企业针对京东配置了多个电商账号，请联系京东运营开通"多pin映射"，否则可能导致后续在线结算出现数据无法获取的异常，同时确保同一客户id下所有京东电商账号只在甄云SRM相同环境使用，否则可能导致多个环境间数据相关影响'),
  //       });
  //     }
  //     this.tableDs.query(this.tableDs.currentPage);
  //   }
  // }

  @Bind()
  async handleBatchActiveClient(selected) {
    const params = selected.map(m => ({ ecClientId: m.get('ecClientId') }));
    const res = await activeClient(params);
    const result = getResponse(res);
    if (!isNil(result)) {
      if(result === 1) {
        Modal.confirm({
          title: intl.get('small.common.model.tips').d('提示'),
          children: intl.get('small.ecClient.title.activeClient').d('您所在的企业针对京东配置了多个电商账号，请联系京东运营开通"多pin映射"，否则可能导致后续在线结算出现数据无法获取的异常，同时确保同一客户id下所有京东电商账号只在甄云SRM相同环境使用，否则可能导致多个环境间数据相关影响'),
        });
      }
      this.tableDs.query(this.tableDs.currentPage);
    }
  }

  @Bind()
  async handleVisible(record = {}, title, name, valueType) {
    this.setState({
      [valueType === 'FREIGHT_TYPE' ? 'freightModalVisible' : 'commonModalVisible']: true,
      modalProps: {
        modalTitle: title,
        record,
        valueType,
      },
    });
    if (name) {
      this.setState({ codeLoading: true });
      const res = await fetchCommonData({
        ecClientId: record.ecClientId,
        valueType,
      });
      const result = getResponse(res);
      this.setState({
        codeLoading: false,
        commonData: (result || []).map(m => ({ ...m, _status: 'update' })),
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
    const { commonData } = this.state;
    this.setState({
      commonData: [
        ...commonData,
        {
          enabledFlag: 1,
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
      modalProps: { record, valueType },
      mapStatusList,
    } = this.state;
    let newParams;
    if (type !== 'freightType') {
      newParams = getEditTableData(commonData, ['valueId']);
      newParams = newParams.map(item => {
        const newItem = item;
        const { tag } = mapStatusList.find(n => n.value === item.valueCode) || {};
        delete newItem.name;
        return {
          ...newItem,
          ecClientId: record.ecClientId,
          tenantId: record.tenantId,
          valueType,
          externalValueCode: tag,
        };
      });
    } else {
      newParams = param;
    }
    if (!isEmpty(newParams)) {
      const res = await saveModalData(newParams);
      const result = getResponse(res);
      if (result) {
        this.setState({ codeLoading: true });
        const res2 = await fetchCommonData({
          ecClientId: record.ecClientId,
          valueType,
        });
        const result2 = getResponse(res2);
        this.setState({ codeLoading: true });
        if (result2) {
          this.setState({ commonData: result2.map(m => ({ ...m, _status: 'create' })) });
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
    const { commonSelectedRowKeys, commonData } = this.state;
    // 过滤出勾选数据
    const newParameters = filter(commonData, item => {
      return commonSelectedRowKeys.indexOf(item.valueId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newData = filter(commonData, item => {
      return commonSelectedRowKeys.indexOf(item.valueId) < 0;
    });
    HModal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: () => {
        const remoteDelete = [];
        const localDelete = [];
        newParameters.forEach(item => {
          if (item._status === 'create') {
            localDelete.push(item);
          } else if (item._status === 'update') {
            remoteDelete.push(item);
          }
        });
        if (isEmpty(remoteDelete)) {
          this.setState({ commonSelectedRowKeys: [], commonSelectedRows: [], commonData: newData });
        } else {
          deleteModalData({ remoteDelete }).then(res => {
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
    Modal.confirm({
      title: intl.get('small.common.button.changePassword').d('修改密码'),
      // destroyOnClose: true,
      // mask: true,
      // closable: true,
      style: { width: 560 },
      onOk: () => this.handleUpdatePwd(record),
      okProps: { loading: pwdLoading },
      afterClose: () => {
        this.pwdFormDs.reset();
      },
      children: (
        <div style={{ marginTop: '16px' }}>
          <Form dataSet={this.pwdFormDs} labelLayout="float">
            <Password name="userPassword" autoComplete="new-password" />
          </Form>
        </div>
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
    const ecClientId = record.get('ecClientId');
    const ecTenantId = record.get('ecTenantId');
    c7nModal({
      title: intl.get('small.ecClient.view.ecClient.assignmentSet').d('分配设置'),
      style: { width: 1090 },
      children: <Assign ecClientId={ecClientId} ecTenantId={ecTenantId} />,
      okText: intl.get('hzero.common.save').d('保存'),
    });
    // this.props.history.push(
    //   `/small/ec-client/assign?ecClientId=${record.get('ecClientId')}&ecTenantId=${record.get(
    //     'ecTenantId'
    //   )}`
    // );
  }

  render() {
    const {
      commonModalVisible,
      freightModalVisible,
      modalProps,
      commonData,
      mapStatusList,
      codeLoading,
      commonSelectedRowKeys = [],
      commonSelectedRows = [],
    } = this.state;
    const commonRowSelection = {
      selectedRowKeys: commonSelectedRowKeys,
      onChange: this.handleCodeRowSelectChange,
    };
    // const buttons = [
    //   <Button icon="playlist_add" onClick={this.handleCreate}>
    //     {intl.get('hzero.common.button.new').d('新建')}
    //   </Button>,
    //   <Button icon="save" onClick={this.handleSave}>
    //     {intl.get('hzero.common.save').d('保存')}
    //   </Button>,
    //   'delete',
    //   <Button funcType="flat" color="primary" icon="undo" onClick={this.handleCancel}>
    //     {intl.get('hzero.common.button.cancel').d('取消')}
    //   </Button>,
    // ];

    return (
      <React.Fragment>
        <Header title={intl.get('small.ecClient.view.message.title').d('电商账号管理')}>
          <Fields
            permissionList={[
              defultPermission,
            ]}
          >
            { this.createBtnsRender() }

            <ImportButton
              businessObjectTemplateCode="SCEC_EC_COMPANY_ASSIGN_TEMPLATE"
              refreshButton
              buttonText={intl.get('small.ecClient.button.batchImportAssign').d('导入分配信息')}
              prefixPatch="/smal"
            // successCallBack={() => this.tableDs.query(this.tableDs.currentPage)}
              buttonProps={{
              icon: 'archive',
              funcType: 'flat',
            }}
            />
            { this.batchBtnsRender() }
          </Fields>
        </Header>
        <Content>
          <div style={{ height: 'calc(100vh - 200px)' }}>
            <SearchBarTable
              className="small-table-all-space"
              dataSet={this.tableDs}
              columns={this.columns}
              // buttons={buttons}
              searchCode="SMAL.EC_CLIENT.SELECT"
              customizedCode="SMAL.EC_CLIENT.QUERY"
              style={{ maxHeight: `calc(100% - 22px)` }}
              searchBarConfig={{
                left: {
                  render: () => (
                    <TextFieldPro
                      ds={this.tableDs}
                      placeholder={intl
                        .get('small.ecClient.view.message.tip')
                        .d('请输入电商平台查询')}
                      name="ecPlatformName"
                      onRef={ref => {
                        this.queryRef = ref;
                      }}
                    />
                  ),
                },
                onReset: () => {
                  if (this.queryRef) {
                    this.queryRef.handleClear();
                  }
                },
                onClear: () => {
                  if (this.queryRef) {
                    this.queryRef.handleClear();
                  }
                },
              }}
            />
          </div>
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
