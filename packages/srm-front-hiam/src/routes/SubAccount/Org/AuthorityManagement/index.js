/**
 * AuthorityManagement - 租户级权限维护
 * @date: 2018-7-31
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import { Button, Form, Modal, Tabs } from 'hzero-ui';
import qs from 'querystring';
import lodash from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';

import Company from './Detail/Company';
import Customer from './Detail/Customer';
import Supplier from './Detail/Supplier';
import Purorg from './Detail/Purorg';
import Puragent from './Detail/Puragent';
import Purcat from './Detail/Purcat';
import AuthorityCopy from './Detail/AuthorityCopy';
import Group from './Detail/Group';
import Position from './Detail/Position';
import Unit from './Detail/Unit';
import Employee from './Detail/Employee';
import Puritem from './Detail/Puritem';
import SupplierType from './Detail/SupplierType';
import Inventory from './Detail/Inventory';
import styles from './index.less';

const FormItem = Form.Item;
const { TabPane } = Tabs;

/**
 * 权限复制弹出框
 * @extends {Component} - React.Component
 * @reactProps {Object} userId - 用户id
 * @reactProps {Object} copyModalVisible - 控制modal显示/隐藏属性
 * @reactProps {Function} refresh - 刷新数据
 * @reactProps {Function} authorityCopy - 控制modal显示隐藏方法
 * @reactProps {Object} organizationId - 组织编号
 * @return React.element
 */
const AuthorityCopyModal = (props) => {
  const { copyModalVisible, authorityCopy, userId, organizationId, refresh } = props;
  return (
    <Modal
      title={intl.get('hiam.authorityManagement.view.button.copy').d('权限复制')}
      visible={copyModalVisible}
      onCancel={() => {
        authorityCopy(false);
      }}
      width={600}
      footer={null}
    >
      <AuthorityCopy
        authorityCopy={authorityCopy}
        userId={userId}
        organizationId={organizationId}
        refresh={refresh}
      />
    </Modal>
  );
};

/**
 * 权限交换弹出框
 * @extends {Component} - React.Component
 * @reactProps {Object} changeModalVisible - 控制modal显示/隐藏属性
 * @reactProps {Function} changeAuthority - 交换后触发方法
 * @reactProps {Function} authorityChange - 控制modal显示隐藏方法
 * @reactProps {Object} organizationId - 组织编号
 * @return React.element
 */
const AuthorityChangeModal = Form.create({ fieldNameProp: null })((props) => {
  const {
    changeModalVisible,
    authorityChange,
    changeAuthority,
    organizationId,
    form,
    userId,
  } = props;
  return (
    <Modal
      title={intl.get('hiam.authorityManagement.model.authorityManage.authChange').d('权限交换')}
      visible={changeModalVisible}
      onOk={() => {
        form.validateFields((err, fieldsValue) => {
          if (!err) {
            changeAuthority(fieldsValue, form);
          }
        });
      }}
      onCancel={() => {
        authorityChange(false);
      }}
      width={500}
    >
      <div>
        {intl
          .get('hiam.authorityManagement.view.message.title.authorityChange')
          .d('权限交换操作会将当前用户与所选用户权限值进行互换，请谨慎操作!')}
      </div>
      <React.Fragment>
        <FormItem>
          {form.getFieldDecorator('authorityChangeId')(
            <Lov code="HIAM.USER_AUTHORITY_USER" queryParams={{ organizationId, userId }} />
          )}
        </FormItem>
      </React.Fragment>
    </Modal>
  );
});
/**
 * 租户级权限管理
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} authorityManagement，authorityCompany，authoritySupplier，authorityPurorg，authorityPurcat，authorityCustomer - 数据源
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: [
    'hiam.authorityManagement',
    'entity.company',
    'entity.customer',
    'entity.supplier',
    'sslm.enterpriseInform',
  ],
})
@Form.create({ fieldNameProp: null })
@connect(
  ({
    authorityCompany,
    authorityCustomer,
    authoritySupplier,
    authorityPurorg,
    authorityPurcat,
    authorityManagement,
    authorityGroup,
    authorityPosition,
    authorityUnit,
    authorityEmployee,
    authorityPurchasing,
  }) => ({
    authorityCompany,
    authorityCustomer,
    authoritySupplier,
    authorityPurorg,
    authorityPurcat,
    authorityManagement,
    authorityGroup,
    authorityPosition,
    authorityUnit,
    authorityEmployee,
    authorityPurchasing,
  })
)
@withRouter
export default class AuthorityManagement extends PureComponent {
  /**
   *Creates an instance of AuthorityManagement.
   * @param {Object} props 属性
   */
  constructor(props) {
    super(props);
    const routerParam = qs.parse(props.history.location.search.substr(1));
    const organizationId = getCurrentOrganizationId();
    this.state = {
      userId: routerParam.userId,
      organizationId,
      copyModalVisible: false,
      changeModalVisible: false,
      tabList: [
        'customer',
        'supplier',
        'purchaseOrganization',
        'purchaseAgent',
        'purchaseCategory',
        'purchaseItem',
        'group',
        'position',
        'unit',
        'employee',
        'supplierItem', // 此页面和功能暂未开发
        'supplierType', // 供应商分类
      ],
    };
  }

  /**
   *组件挂载后执行方法
   */
  componentDidMount() {
    const { dispatch } = this.props;
    const { userId } = this.state;
    dispatch({
      type: 'authorityManagement/fetchUserInfo',
      payload: { userId },
    });
    dispatch({
      type: 'authorityCompany/fetchAuthorityCompany',
      payload: { userId },
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    // TODO: 为了 清除缓存 需要在这里将所有model还原到初始化
    dispatch({
      type: 'authorityCompany/updateState',
      payload: {
        data: [],
        checkList: [],
        originList: [],
        expandedRowKeys: [],
      },
    });
    dispatch({
      type: 'authorityCustomer/updateState',
      payload: {
        head: {},
        list: [],
        pagination: {},
        customerDataSource: [],
        customerPagination: {},
      },
    });
    dispatch({
      type: 'authorityManagement/updateState',
      payload: {
        data: {
          list: [],
        },
      },
    });
    dispatch({
      type: 'authorityPuragent/updateState',
      payload: {
        head: {}, // 头部数据
        list: [], // 请求查询到的数据
        pagination: {}, // 分页信息
        puragentDataSource: [],
        puragentPagination: {},
      },
    });
    dispatch({
      type: 'authorityPurcat/updateState',
      payload: {
        head: {},
        list: [],
        pagination: {},
        purcatDataSource: [],
        purcatPagination: {},
      },
    });
    dispatch({
      type: 'authorityPuritem/updateState',
      payload: {
        head: {},
        data: {
          list: [],
        },
      },
    });
    dispatch({
      type: 'authorityPurorg/updateState',
      payload: {
        head: {}, // 头部数据
        list: [], // 请求查询到的数据
        pagination: {}, // 分页信息
        purorgDataSource: [],
        purorgPagination: {},
      },
    });
    dispatch({
      type: 'authoritySalitem/updateState',
      payload: {
        head: {},
        data: {
          list: [],
        },
      },
    });
    dispatch({
      type: 'authoritySupplier/updateState',
      payload: {
        head: {}, // 头部数据
        list: [], // 请求查询到的数据
        pagination: {}, // 分页信息
        supplierDataSource: [],
        supplierPagination: {},
      },
    });
    dispatch({
      type: 'authorityGroup/updateState',
      payload: {
        head: {}, // 头部数据
        list: [], // 请求查询到的数据
        pagination: {}, // 分页信息
        groupDataSource: [],
        groupPagination: {},
      },
    });
    dispatch({
      type: 'authorityPosition/updateState',
      payload: {
        head: {}, // 头部数据
        list: [], // 请求查询到的数据
        pagination: {}, // 分页信息
        positionDataSource: [],
        positionPagination: {},
      },
    });
    dispatch({
      type: 'authorityUnit/updateState',
      payload: {
        head: {}, // 头部数据
        list: [], // 请求查询到的数据
        pagination: {}, // 分页信息
        unitDataSource: [],
        unitPagination: {},
      },
    });
    dispatch({
      type: 'authorityEmployee/updateState',
      payload: {
        head: {}, // 头部数据
        list: [], // 请求查询到的数据
        pagination: {}, // 分页信息
        employeeDataSource: [],
        employeePagination: {},
      },
    });
  }

  @Bind()
  formatTypeCode(code) {
    let typeCode = code;
    switch (code) {
      case 'customer':
        typeCode = 'CUSTOMER';
        break;
      case 'supplier':
        typeCode = 'SUPPLIER';
        break;
      case 'purchaseOrganization':
        typeCode = 'PURCHASE_ORGANIZATION';
        break;
      case 'purchaseAgent':
        typeCode = 'PURCHASE_AGENT';
        break;
      case 'purchaseCategory':
        typeCode = 'PURCHASE_CATEGORY';
        break;
      case 'supplierItem': // 此页面和功能暂未开发
        typeCode = 'SUPPLIER_ITEM';
        break;
      case 'group': // 此页面和功能暂未开发
        typeCode = 'GROUP';
        break;
      case 'unit': // 此页面和功能暂未开发
        typeCode = 'UNIT';
        break;
      case 'employee': // 此页面和功能暂未开发
        typeCode = 'EMPLOYEE';
        break;
      case 'position': // 此页面和功能暂未开发
        typeCode = 'POSITION';
        break;
      case 'purchaseItem': // 此页面和功能暂未开发
        typeCode = 'PURCHASE_ITEM';
        break;
      default:
        break;
    }
    return typeCode;
  }

  /**
   * tab切换后查询数据
   *
   * @param {Object} name tab名称
   */
  @Bind()
  fetchData(name) {
    const { dispatch } = this.props;
    const { userId } = this.state;
    const staticData = {
      userId,
      page: 0,
      size: 10,
      // authorityTypeCode: lodash.upperCase(name),
      authorityTypeCode: this.formatTypeCode(name),
    };
    if (name === 'customer') {
      dispatch({
        type: `authorityCustomer/fetchAuthorityCustomer`,
        payload: staticData,
      });
    } else if (name === 'supplier') {
      dispatch({
        type: `authoritySupplier/fetchAuthoritySupplier`,
        payload: staticData,
      });
    } else if (name === 'purchaseOrganization') {
      dispatch({
        type: `authorityPurorg/fetchAuthorityPurorg`,
        payload: staticData,
      });
    } else if (name === 'purchaseAgent') {
      dispatch({
        type: `authorityPuragent/fetchAuthorityPuragent`,
        payload: staticData,
      });
    } else if (name === 'purchaseCategory') {
      dispatch({
        type: `authorityPurcat/fetchAuthorityPurcat`,
        payload: staticData,
      });
    } else if (name === 'group') {
      dispatch({
        type: `authorityGroup/fetchAuthorityGroup`,
        payload: staticData,
      });
    } else if (name === 'unit') {
      dispatch({
        type: `authorityUnit/fetchAuthorityUnit`,
        payload: staticData,
      });
    } else if (name === 'employee') {
      dispatch({
        type: `authorityEmployee/fetchAuthorityEmployee`,
        payload: staticData,
      });
    } else if (name === 'position') {
      dispatch({
        type: `authorityPosition/fetchAuthorityPosition`,
        payload: staticData,
      });
    } else if (name === 'purchaseItem') {
      dispatch({
        type: 'authorityPurchasing/fetch',
        payload: staticData,
      });
    }
  }

  /**
   *Tab改变触发事件
   *
   * @param {Object} activeKey
   */
  @Bind()
  tabChange(activeKey) {
    const { tabList } = this.state;
    const dataList = tabList;
    if (tabList.length > 0) {
      if (tabList.find((list) => list === activeKey)) {
        this.setState({
          tabList: lodash.pull(dataList, activeKey),
        });
        switch (activeKey) {
          case 'customer':
            this.fetchData(activeKey);
            break;
          case 'supplier':
            this.fetchData(activeKey);
            break;
          case 'purchaseOrganization':
            this.fetchData(activeKey);
            break;
          case 'purchaseAgent':
            this.fetchData(activeKey);
            break;
          case 'purchaseCategory':
            this.fetchData(activeKey);
            break;
          case 'group':
            this.fetchData(activeKey);
            break;
          case 'employee':
            this.fetchData(activeKey);
            break;
          case 'unit':
            this.fetchData(activeKey);
            break;
          case 'position':
            this.fetchData(activeKey);
            break;
          case 'purchaseItem':
            this.fetchData(activeKey);
            break;
          case 'inventory':
            this.fetchData(activeKey);
            break;
          // 后期预留 暂时注释
          // case 'purchasing':
          //   this.fetchData('authorityPurchasing');
          //   break;
          // case 'production':
          //   this.fetchData('authorityProduction');
          //   break;
          default:
            this.setState({
              tabList: [],
            });
        }
      }
    }
  }

  /**
   *刷新数据
   *
   */
  @Bind()
  refresh() {
    const { dispatch } = this.props;
    const { userId } = this.state;
    dispatch({
      type: 'authorityCompany/fetchAuthorityCompany',
      payload: { userId },
    });
    this.setState({
      tabList: [
        'customer',
        'supplier',
        'purchaseOrganization',
        'purchaseAgent',
        'purchaseCategory',
        'purchaseItem',
        'group',
        'position',
        'unit',
        'employee',
        'supplierItem', // 此页面和功能暂未开发
      ],
    });
  }

  /**
   *权限交换modal显示隐藏标记
   *
   * @param {*Boolean} flag 隐藏/显示标记
   */
  @Bind()
  authorityChange(flag) {
    this.setState({
      changeModalVisible: !!flag,
    });
  }

  /**
   *权限复制modal显示隐藏方法
   *
   * @param {Boolean} flag 隐藏/显示标记
   */
  @Bind()
  authorityCopy(flag) {
    this.setState({
      copyModalVisible: !!flag,
    });
  }

  /**
   *权限更改触发方法
   *
   * @param {Object} values form数据
   * @param {Object} form form表单
   */
  @Bind()
  changeAuthority(values, form) {
    const { dispatch } = this.props;
    const { userId } = this.state;
    dispatch({
      type: 'authorityManagement/changeAuthority',
      payload: {
        userId,
        exchanageUserId: values.authorityChangeId,
      },
    }).then((response) => {
      if (response) {
        notification.success();
        form.resetFields();
        this.authorityChange(false);
        this.refresh();
      }
    });
  }

  /**
   *渲染事件
   *
   * @returns
   */
  render() {
    const {
      authorityManagement: { data = {} },
    } = this.props;
    const { organizationId, userId, copyModalVisible, changeModalVisible } = this.state;
    return (
      <React.Fragment>
        <Header
          title={intl.get('hiam.authorityManagement.view.message.title').d('权限维护')}
          backPath="/hiam/sub-account-org/users"
        >
          <Button icon="copy" type="primary" onClick={() => this.authorityCopy(true)}>
            {intl.get('hiam.authorityManagement.view.button.copy').d('权限复制')}
          </Button>
          <Button icon="swap" onClick={() => this.authorityChange(true)}>
            {intl.get('hiam.authorityManagement.model.authorityManage.authChange').d('权限交换')}
          </Button>
        </Header>
        <Content>
          <div style={{ margin: '0 0 8px 0px', lineHeight: '20px' }}>
            <span style={{ marginRight: '32px' }}>
              {intl.get('hiam.authorityManagement.model.authorityManage.userAccount').d('账号')}:
              {data.loginName}
            </span>
            <span>
              {intl.get('hiam.authorityManagement.model.authorityManagement.userName').d('描述')}:
              {data.realName}
            </span>
          </div>
          <Tabs
            defaultActiveKey="company"
            animated={false}
            onChange={this.tabChange}
            tabPosition="left"
            className={styles['sub-accout-tabs']}
          >
            <TabPane
              tab={intl
                .get('hiam.authorityManagement.view.message.tab.busiOrgCompany')
                .d('业务组织-公司')}
              key="company"
            >
              <Company organizationId={organizationId} userId={userId} />
            </TabPane>
            <TabPane tab={intl.get('entity.customer.tag').d('客户')} key="customer">
              <Customer organizationId={organizationId} userId={userId} />
            </TabPane>
            <TabPane tab={intl.get('entity.supplier.tag').d('供应商')} key="supplier">
              <Supplier organizationId={organizationId} userId={userId} />
            </TabPane>
            <TabPane
              tab={intl.get('hiam.authorityManagement.view.message.tab.purorg').d('采购组织')}
              key="purchaseOrganization"
            >
              <Purorg organizationId={organizationId} userId={userId} />
            </TabPane>
            <TabPane tab={intl.get('entity.supplier.tag1').d('库房')} key="inventory">
              <Inventory organizationId={organizationId} userId={userId} />
            </TabPane>
            <TabPane
              tab={intl.get('hiam.authorityManagement.view.message.tab.puragent').d('采购员')}
              key="purchaseAgent"
            >
              <Puragent organizationId={organizationId} userId={userId} />
            </TabPane>
            <TabPane
              tab={intl.get('hiam.authorityManagement.view.message.tab.purcat').d('采购品类')}
              key="purchaseCategory"
            >
              <Purcat organizationId={organizationId} userId={userId} />
            </TabPane>
            <TabPane
              tab={intl.get('hiam.authorityManagement.view.message.tab.puritem').d('采购物料')}
              key="purchaseItem"
            >
              <Puritem organizationId={organizationId} userId={userId} />
            </TabPane>
            <TabPane
              tab={intl.get('hiam.authorityManagement.view.message.tab.salitem').d('销售产品')}
              key="supplierItem"
            >
              {/* 此页面和功能功能暂未开发 */}
              <Customer organizationId={organizationId} userId={userId} />
            </TabPane>
            <TabPane
              tab={intl
                .get('hiam.authorityManagement.view.message.tab.groupConCom')
                .d('组织架构-公司')}
              key="group"
            >
              <Group organizationId={organizationId} userId={userId} />
            </TabPane>
            <TabPane
              tab={intl.get('hiam.authorityManagement.view.message.tab.partmentUnit').d('部门')}
              key="unit"
            >
              <Unit organizationId={organizationId} userId={userId} />
            </TabPane>
            <TabPane
              tab={intl.get('hiam.authorityManagement.view.message.tab.position').d('岗位')}
              key="position"
            >
              <Position organizationId={organizationId} userId={userId} />
            </TabPane>
            <TabPane
              tab={intl.get('hiam.authorityManagement.view.message.tab.employees').d('员工')}
              key="employee"
            >
              <Employee organizationId={organizationId} userId={userId} />
            </TabPane>
            <TabPane
              tab={intl.get('hiam.authorityManagement.view.message.tab.hahhha').d('供应商类别')}
              key="supplierType"
            >
              <SupplierType organizationId={organizationId} userId={userId} />
            </TabPane>
          </Tabs>
          <AuthorityCopyModal
            organizationId={organizationId}
            copyModalVisible={copyModalVisible}
            authorityCopy={this.authorityCopy}
            userId={userId}
            refresh={this.refresh}
          />
          <AuthorityChangeModal
            changeAuthority={this.changeAuthority}
            changeModalVisible={changeModalVisible}
            authorityChange={this.authorityChange}
            userId={userId}
            organizationId={organizationId}
          />
        </Content>
      </React.Fragment>
    );
  }
}
