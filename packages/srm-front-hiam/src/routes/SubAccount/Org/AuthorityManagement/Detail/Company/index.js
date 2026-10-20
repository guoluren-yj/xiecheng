/* eslint-disable no-param-reassign */
/**
 * Company - 租户级权限维护tab页 - 公司
 * @date: 2018-7-31
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import lodash, { isNil } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import { Button, Form, Input, Row, Col, Checkbox, Tooltip, Icon, Switch } from 'hzero-ui';
import { Button as C7NButton, Modal, DataSet, Table } from 'choerodon-ui/pro';

import { Button as ButtonPermission } from 'components/Permission';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import intl from 'utils/intl';

import DetailModal from './DetailModal';
import styles from '../index.less';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
const TYPE_CODE = {
  COMPANY: 'COMPANY',
  OU: 'OU',
  INV_ORGANIZATION: 'INV_ORGANIZATION',
};

/**
 * 租户级权限管理 - 公司
 * @extends {Component} - React.Component
 * @reactProps {Object} authorityCompany - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ authorityCompanySrm, loading }) => ({
  authorityCompanySrm,
  updateLoading: loading.effects['authorityCompanySrm/updateAuthorityCompany'],
  fetchLoading: loading.effects['authorityCompanySrm/fetchAuthorityCompanyAndExpand'],
  updateFlagLoading: loading.effects['authorityPurorg/addAuthorityPurorg'],
  refreshLoading: loading.effects['authorityCompanySrm/fetchAuthorityCompany'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['hiam.authorityManagement', 'hiam.authority'] })
export default class Company extends React.Component {
  /**
   *Creates an instance of Company.
   * @param {Object} props 属性
   * @memberof Company
   */
  constructor(props) {
    super(props);
    this.state = {
      expanded: true,
      queryParams: {},
      checkListState: [],
    };
    this.preAuthRoleId = '';
    this.tableDs = new DataSet({
      paging: false,
      idField: '_id_',
      parentField: '_parentId_',
      fields: [
        {
          label: intl
            .get('hiam.authority.model.authorityCompany.dataName')
            .d('公司/业务单元/库存组织'),
          name: 'dataName',
        },
        {
          label: intl.get('hiam.authority.model.authorityCompany.dataCode').d('代码'),
          name: 'dataCode',
        },
      ],
      events: {
        load: ({ dataSet }) => {
          dataSet.forEach((record) => {
            if (record.get('checkedFlag') === 1) {
              record.isSelected = true;
            }
          });
        },
        select: ({ record }) => {
          const { parent, children } = record;
          const _selectParentFunc = (parentRecord) => {
            if (parentRecord) {
              parentRecord.isSelected = true;
              _selectParentFunc(parentRecord.parent);
            }
          };
          const _selectChildrenFunc = (childrenRecord) => {
            if (childrenRecord && childrenRecord.length) {
              childrenRecord.forEach((child) => {
                child.isSelected = true;
                _selectChildrenFunc(child.children);
              });
            }
          };
          _selectParentFunc(parent);
          _selectChildrenFunc(children);
        },
        unSelect: ({ record }) => {
          const { parent, children } = record;
          const _unSelectParentFunc = (parentRecord) => {
            if (parentRecord && !parentRecord.children.some((i) => i.isSelected)) {
              parentRecord.isSelected = false;
              _unSelectParentFunc(parentRecord.parent);
            }
          };
          const _unSelectChildrenFunc = (childrenRecord) => {
            if (childrenRecord && childrenRecord.length) {
              childrenRecord.forEach((child) => {
                child.isSelected = false;
                _unSelectChildrenFunc(child.children);
              });
            }
          };
          _unSelectParentFunc(parent);
          _unSelectChildrenFunc(children);
        },
      },
    });
  }

  componentDidMount() {
    const { authRoleId, activeKey } = this.props;
    if (this.preAuthRoleId !== authRoleId && activeKey === 'COMPANY') {
      this.preAuthRoleId = authRoleId;
      this.queryValue();
    }
  }

  componentDidUpdate() {
    const { authRoleId, activeKey } = this.props;
    if (this.preAuthRoleId !== authRoleId && activeKey === 'COMPANY') {
      this.preAuthRoleId = authRoleId;
      this.queryValue();
    }
  }

  /**
   *刷新数据
   */
  @Bind()
  refreshValue() {
    const {
      dispatch,
      queryParams: { userId },
      authRoleId,
    } = this.props;
    const { queryParams } = this.state;
    this.tableDs.status = 'loading';
    dispatch({
      type: 'authorityCompanySrm/fetchCompanyHeader',
      payload: {
        authorityTypeCode: TYPE_CODE.COMPANY,
        userId,
      },
    });
    dispatch({
      type: 'authorityCompanySrm/fetchCompanyHeader',
      payload: {
        authorityTypeCode: TYPE_CODE.INV_ORGANIZATION,
        userId,
      },
    });
    dispatch({
      type: 'authorityCompanySrm/fetchCompanyHeader',
      payload: {
        authorityTypeCode: TYPE_CODE.OU,
        userId,
      },
    });
    dispatch({
      type: 'authorityCompanySrm/fetchAuthorityCompany',
      payload: {
        userId,
        authRoleId,
        ...queryParams,
      },
    }).then(() => {
      this.tableDs.status = 'ready';
      const {
        authorityCompanySrm: { checkList = [], originList = [] },
      } = this.props;
      this.tableDs.loadData(this.transformOriginList(originList));
      this.setState({
        checkListState: checkList,
      });
    });
  }

  @Bind()
  transformOriginList(originList) {
    return originList.map((i) => {
      const item = i;
      item._id_ = `${i.typeCode}-${i.dataId}`;
      if (!isNil(i.parentId)) {
        const parentCode =
          i.typeCode === 'OU' ? 'COMPANY' : i.typeCode === 'INV_ORGANIZATION' ? 'OU' : '';
        item._parentId_ = `${parentCode}-${i.parentId}`;
      }
      return item;
    });
  }

  /**
   *保存
   */
  @Bind()
  campanySave() {
    const {
      dispatch,
      authRoleId,
      authorityCompanySrm: { checkList: oldCheckList = [] },
      queryParams: { userId },
    } = this.props;
    const nowCheckList = this.tableDs.selected.map((i) => i.toData());
    // const { checkListState } = this.state;
    const newCheckList = lodash.xorWith(
      oldCheckList,
      nowCheckList,
      lodash.isEqualWith((cl, cls) => cl.id === cls.id)
    );
    const newList = newCheckList.map((e) => {
      if (nowCheckList.find((v) => v.id === e.id)) {
        return {
          ...e,
          checkedFlag: 1,
        };
      }
      return {
        ...e,
        checkedFlag: 0,
      };
    });
    this.tableDs.status = 'loading';
    dispatch({
      type: 'authorityCompanySrm/updateAuthorityCompany',
      payload: {
        checkList: lodash.uniqBy(newList, 'id'),
        userId,
        authRoleId,
      },
    }).then((response) => {
      this.tableDs.status = 'ready';
      if (response) {
        this.refreshValue();
        notification.success();
      }
    });
  }

  /**
   *查询数据
   */
  @Bind()
  queryValue() {
    const {
      form,
      dispatch,
      queryParams: { userId },
      authRoleId,
    } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        this.setState({
          queryParams: fieldsValue,
          expanded: false,
        });
        this.tableDs.status = 'loading';
        dispatch({
          type: 'authorityCompanySrm/fetchCompanyHeader',
          payload: {
            authorityTypeCode: TYPE_CODE.COMPANY,
            userId,
          },
        });
        dispatch({
          type: 'authorityCompanySrm/fetchCompanyHeader',
          payload: {
            authorityTypeCode: TYPE_CODE.INV_ORGANIZATION,
            userId,
          },
        });
        dispatch({
          type: 'authorityCompanySrm/fetchCompanyHeader',
          payload: {
            authorityTypeCode: TYPE_CODE.OU,
            userId,
          },
        });
        dispatch({
          type: 'authorityCompanySrm/fetchAuthorityCompanyAndExpand',
          payload: {
            ...fieldsValue,
            userId,
            authRoleId,
          },
        }).then(() => {
          this.tableDs.status = 'ready';
          const {
            authorityCompanySrm: { checkList = [], originList = [] },
          } = this.props;
          this.tableDs.loadData(this.transformOriginList(originList));
          this.setState({
            checkListState: checkList,
          });
        });
      }
    });
  }

  /**
   *设置选中
   *
   * @param {*Array} rows 选中的行
   */
  @Bind()
  setSelectRows(rows) {
    const { dispatch } = this.props;
    dispatch({
      type: 'authorityCompanySrm/updateCheckList',
      payload: lodash.uniqBy(rows, 'id'),
    });
  }

  /**
   *表格选中事件
   *
   * @param {*} _ 占位
   * @param {*Array} rows 选中行数据
   */
  @Bind()
  handleSelectRows(_, rows) {
    this.setSelectRows(rows);
  }

  /**
   *点击展开节点触发方法
   *
   * @param {*Boolean} expanded 展开收起标志
   * @param {*Object} record 行记录
   */
  @Bind()
  onExpand(expanded, record = {}) {
    const {
      dispatch,
      authorityCompanySrm: { expandedRowKeys = [] },
    } = this.props;
    dispatch({
      type: 'authorityCompanySrm/updateExpanded',
      payload: expanded
        ? expandedRowKeys.concat(record.id)
        : expandedRowKeys.filter((o) => o !== record.id),
    });
  }

  /**
   *全部展开和收起
   */
  @Bind()
  handleExpand() {
    // const {
    //   dispatch,
    //   authorityCompanySrm: { originList = [] },
    // } = this.props;
    const { expanded } = this.state;
    // dispatch({
    //   type: 'authorityCompanySrm/updateExpanded',
    //   payload: expanded ? originList.map(list => list.id) : [],
    // });
    this.setState({
      expanded: !expanded,
    });
    this.tableDs.forEach((record) => {
      record.isExpanded = expanded;
    });
  }

  /**
   * 获取子节点类型
   *
   * @param {*Object} parentType 父级类型
   * @returns
   */
  @Bind()
  findChildType(parentType) {
    let childType = null;
    if (parentType === 'COMPANY') {
      childType = 'OU';
    } else if (parentType === 'OU') {
      childType = 'INV_ORGANIZATION';
    } else {
      childType = null;
    }
    return childType;
  }

  /**
   *选中父级后同时选中子集
   *
   * @param {*Object} record 当前操作的行
   * @param {*boolean} selected 选中标记
   * @param {*Array} selectedRows 已经选中行数据
   */
  @Bind()
  selectChilds(record = {}, selected, selectedRows) {
    const {
      authorityCompanySrm: { originList },
    } = this.props;
    const childType = this.findChildType(record.typeCode);
    let grandsonList = [];
    const childLists = originList.filter(
      (list) => list.parentId === record.dataId && list.typeCode && list.typeCode === childType
    );
    childLists.map((childList) => {
      const grandsonType = this.findChildType(childList.typeCode);
      grandsonList = lodash.unionWith(
        grandsonList,
        originList.filter(
          (list) =>
            list.parentId === childList.dataId && list.typeCode && list.typeCode === grandsonType
        )
      );
      return grandsonList;
    });
    const parentList = this.getParentList(
      record.parentId,
      this.findParentType(record.typeCode),
      originList
    );
    if (selected) {
      this.setSelectRows(
        lodash.unionWith(
          parentList,
          lodash.unionWith(lodash.unionWith(selectedRows, childLists), grandsonList)
        )
      );
    } else {
      this.setSelectRows(
        lodash.pullAllBy(lodash.pullAllBy(selectedRows, childLists, 'id'), grandsonList, 'id')
      );
    }
  }

  @Bind()
  getParentList(parentId, parentTypeCode, originList, oldList = []) {
    if (lodash.isNil(parentId)) {
      return oldList;
    }
    const obj = originList.find(
      (list) => parentId === list.dataId && list.typeCode && list.typeCode === parentTypeCode
    );
    let resArr = oldList;
    if (obj) {
      resArr = resArr.concat([lodash.omit(obj, 'children')]);
      const parentCode = this.findParentType(obj.typeCode);
      return this.getParentList(obj.parentId, parentCode, originList, resArr);
    }
    return oldList;
  }

  /**
   * 获取父节点类型
   *
   * @param {*Object} childType 子级类型
   * @returns
   */
  // eslint-disable-next-line class-methods-use-this
  findParentType(childType) {
    let parentType = null;
    if (childType === 'OU') {
      parentType = 'COMPANY';
    } else if (childType === 'INV_ORGANIZATION') {
      parentType = 'OU';
    } else {
      parentType = null;
    }
    return parentType;
  }

  /**
   *渲染查询结构
   *
   * @returns
   */
  renderForm() {
    const { getFieldDecorator } = this.props.form;
    const { updateLoading, authorityCompanySrm, fetchLoading, updateFlagLoading } = this.props;
    const { companyHeader = {}, invOrgHeader = {}, ouHeader = {} } = authorityCompanySrm || {};
    const { expanded } = this.state;
    return (
      <Form layout="inline">
        <FormItem label={intl.get('hiam.authority.model.authorityCompany.name').d('名称')}>
          {getFieldDecorator('dataName')(<Input />)}
        </FormItem>
        <FormItem label={intl.get('hiam.authority.model.authorityCompany.dataCode').d('代码')}>
          {getFieldDecorator('dataCode')(<Input typeCase="upper" trim inputChinese={false} />)}
        </FormItem>
        <FormItem>
          <Button type="primary" onClick={() => this.queryValue()} htmlType="submit">
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </FormItem>
        <Row>
          <Col style={{ overflow: 'hidden', position: 'relative' }}>
            <FormItem className={styles['right-btn-group']}>
              <div>
                <div style={{ display: 'inline-block', margin: '0 8px' }}>
                  <span style={{ marginRight: '8px' }}>
                    {intl.get('hiam.authority.view.message.label.company').d('加入全部公司:')}
                  </span>
                  <Tooltip
                    title={intl
                      .get('hiam.authority.view.message.title.tooltip.includeAllCompany')
                      .d('“加入全部公司”即将所有公司权限自动添加至当前账户，无需再手工添加。')}
                    placement="right"
                  >
                    <Switch
                      loading={updateLoading || fetchLoading || updateFlagLoading}
                      checked={!!companyHeader.includeAllFlag}
                      disabled={updateFlagLoading || !!ouHeader.includeAllFlag}
                      onChange={(e) => this.includeAllFlag(e, TYPE_CODE.COMPANY)}
                    />
                  </Tooltip>
                </div>
                <div style={{ display: 'inline-block', margin: '0 8px' }}>
                  <span style={{ marginRight: '8px' }}>
                    {intl.get('hiam.authority.view.message.label.entity').d('加入全部业务单元:')}
                  </span>
                  <Tooltip
                    title={intl
                      .get('hiam.authority.view.message.title.tooltip.includeAllEntity')
                      .d(
                        '“加入全部业务单元”即将所有业务实体权限自动添加至当前账户，无需再手工添加。'
                      )}
                    placement="right"
                  >
                    <Switch
                      loading={updateLoading || fetchLoading || updateFlagLoading}
                      checked={!!ouHeader.includeAllFlag}
                      disabled={updateFlagLoading || !!invOrgHeader.includeAllFlag}
                      onChange={(e) => this.includeAllFlag(e, TYPE_CODE.OU)}
                    />
                  </Tooltip>
                </div>
                <div style={{ display: 'inline-block', margin: '0 8px' }}>
                  <span style={{ marginRight: '8px' }}>
                    {intl.get('hiam.authority.view.message.label.InvOrg').d('加入全部库存组织:')}
                  </span>
                  <Tooltip
                    title={intl
                      .get('hiam.authority.view.message.title.tooltip.includeAllInvOrg')
                      .d(
                        '“加入全部库存组织”即将所有库存组织权限自动添加至当前账户，无需再手工添加。'
                      )}
                    placement="right"
                  >
                    <Switch
                      loading={updateLoading || fetchLoading || updateFlagLoading}
                      checked={!!invOrgHeader.includeAllFlag}
                      disabled={updateFlagLoading}
                      onChange={(e) => this.includeAllFlag(e, TYPE_CODE.INV_ORGANIZATION)}
                    />
                  </Tooltip>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'inline-block', margin: '0 24px 16px 0' }}>
                  <Tooltip
                    title={intl
                      .get('hiam.authority.view.message.nullValue.tooltip')
                      .d('勾选后，单据中该维度字段为空该用户可查询到')}
                  >
                    <span style={{ marginRight: '8px' }}>
                      {intl.get('hiam.authority.view.message.company.nullValue').d('公司包含空值')}
                      <Icon type="question-circle" style={{ margin: '0 4px' }} />:
                    </span>
                    <Checkbox
                      onChange={this.includeNullFlag}
                      checked={(companyHeader || {}).includeNullFlag || 0}
                    />
                  </Tooltip>
                </div>
                <Button onClick={() => this.handleExpand()} style={{ marginRight: '8px' }}>
                  {expanded
                    ? intl.get('hzero.common.button.expand').d('展开')
                    : intl.get('hzero.common.button.up').d('收起')}
                </Button>
                <ButtonPermission
                  permissionList={[
                    {
                      code: 'hiam.sub-account-org.authority-management.button.saveCompany',
                      type: 'button',
                      meaning: '权限维护-保存公司',
                    },
                  ]}
                  type="primary"
                  loading={updateLoading}
                  onClick={() => this.campanySave()}
                >
                  {intl.get('hzero.common.button.save').d('保存')}
                </ButtonPermission>
              </div>
            </FormItem>
            <div style={{ position: 'absolute', left: 0, bottom: 0 }}>
              <C7NButton funcType="link" color="primary" onClick={this.viewAuthList}>
                {intl.get('hiam.authority.button.viewAuthList').d('查看已分配权限')}
              </C7NButton>
            </div>
          </Col>
        </Row>
      </Form>
    );
  }

  viewAuthList = () => {
    const {
      queryParams: { userId },
      authRoleId,
    } = this.props;

    Modal.open({
      drawer: true,
      closable: true,
      style: { width: '750px' },
      title: intl
        .get('hiam.authority.title.viewAuthList')
        .d('查看已分配的 公司/业务单元/库存组织权限'),
      children: <DetailModal userId={userId} authRoleId={authRoleId} />,
      footer: null,
    });
  };

  /**
   *点击包含空值后触发事件
   *
   * @param {Boolean} checked switch的value值
   */
  @Bind()
  @Debounce(500)
  includeNullFlag(e) {
    const { checked } = e.target;
    const {
      dispatch,
      queryParams: { userId },
      authorityCompanySrm: { companyHeader = {} },
    } = this.props;
    this.setState({
      switchLoading: true,
    });
    dispatch({
      type: 'authorityPurorg/addAuthorityPurorg',
      payload: {
        authorityTypeCode: 'COMPANY',
        userId,
        userAuthority: {
          ...companyHeader,
          authorityTypeCode: 'COMPANY',
          includeNullFlag: checked ? 1 : 0,
        },
        userAuthorityLineList: [],
      },
    }).then((response) => {
      if (response) {
        dispatch({
          type: 'authorityCompanySrm/fetchCompanyHeader',
          payload: {
            authorityTypeCode: 'COMPANY',
            userId,
          },
        });
        notification.success();
      }
    });
  }

  /**
   *点击加入全部公司后触发事件
   *
   * @param {Boolean} checked switch的value值
   */
  @Bind()
  includeAllFlag(checked, type) {
    const {
      dispatch,
      queryParams: { userId },
      authorityCompanySrm,
    } = this.props;
    this.setState({
      switchLoading: true,
    });
    const TYPE_HEADER = {
      COMPANY: 'companyHeader',
      INV_ORGANIZATION: 'invOrgHeader',
      OU: 'ouHeader',
    };
    dispatch({
      type: 'authorityPurorg/addAuthorityPurorg',
      payload: {
        authorityTypeCode: type,
        userId,
        userAuthority: {
          ...authorityCompanySrm[TYPE_HEADER[type]],
          includeAllFlag: checked ? 1 : 0,
        },
        userAuthorityLineList: [],
      },
    }).then((response) => {
      if (response) {
        dispatch({
          type: 'authorityCompanySrm/fetchCompanyHeader',
          payload: {
            authorityTypeCode: type,
            userId,
          },
        });
      }
    });
    if (type === TYPE_CODE.INV_ORGANIZATION && checked) {
      // 勾选加入全部库存组织时 自动勾选加入全部业务单元
      this.includeAllFlag(checked, TYPE_CODE.OU);
      // 勾选加入全部业务单元时 自动勾选加入全部公司
    } else if (type === TYPE_CODE.OU && checked) {
      this.includeAllFlag(checked, TYPE_CODE.COMPANY);
    }
  }

  /**
   *渲染方法
   *
   * @returns
   */
  render() {
    const {
      queryParams: { userId },
    } = this.props;
    if (isNil(userId)) {
      return (
        <h3 style={{ color: 'gray', marginTop: '10%', textAlign: 'center' }}>
          {intl
            .get('hiam.authorityManagement.model.authorityManagement.noSupport')
            .d('此功能不适用')}
        </h3>
      );
    }
    const newColumns = [{ name: 'dataName' }, { name: 'dataCode', width: 400 }];
    return (
      <div>
        <div className="table-list-search">{this.renderForm()}</div>
        <Table
          mode="tree"
          virtual
          virtualCell
          defaultRowExpanded
          style={{ height: 600 }}
          columns={newColumns}
          dataSet={this.tableDs}
        />
      </div>
    );
  }
}
