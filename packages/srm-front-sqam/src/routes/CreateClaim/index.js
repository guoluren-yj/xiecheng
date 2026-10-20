/**
 * 索赔单创建
 * @date: 2019-11-05
 * @author: MJQ <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { Form, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { routerRedux } from 'dva/router';

import { stringify } from 'querystring';
import { createPagination, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { isEmpty, throttle, isUndefined } from 'lodash';
import Import from 'components/Import';

import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { Button as PermissionButton } from 'components/Permission';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';
import remote from 'hzero-front/lib/utils/remote';

import FilterForm from './FilterForm';
import List from './List';
@remote({
  code: 'SQAM_CLAIM_LIST',
  name: 'remote',
})
@connect(({ createClaim, loading }) => ({
  createClaim,
  fetchClaimLoading: loading.effects['createClaim/fetchClaim'],
  submitLoading: loading.effects['createClaim/submitClaim'],
}))
@formatterCollections({
  code: [
    'sqam.common',
    'entity.item',
    'entity.company',
    'entity.business',
    'entity.supplier',
    'entity.organization',
    'entity.roles',
  ],
})
@withCustomize({
  unitCode: ['SQAM.CREATE_CLAIM_LIST.BTNS'],
})
@Form.create({ fieldNameProp: null })
export default class CreateClaim extends Component {
  constructor(props) {
    super(props);
    this.state = {
      claimList: [],
      selectedRows: [],
      selectedRowKeys: [],
    };
  }

  // componentDidMount() {
  //   this.fetchClaim();
  // }

  componentDidUpdate(prevProps) {
    if (prevProps.custLoading === true && this.props.custLoading === false) {
      const {
        location: { state: { _back } = {} },
        createClaim: { pagination = {} },
      } = this.props;
      // 校验是否从详情页返回
      const page = isUndefined(_back) ? {} : pagination;
      this.fetchClaim(page);
    }
  }

  // 索赔单查询
  @Bind()
  fetchClaim(page = {}) {
    const {
      dispatch,
      form: { getFieldsValue = (e) => e },
    } = this.props;
    const values = this.handleFormQuery(getFieldsValue());
    const { supplierCompanyIdStash, ...vals } = values;
    dispatch({
      type: 'createClaim/fetchClaim',
      payload: {
        page,
        ...vals,
        supplierCompanyId: supplierCompanyIdStash,
        customizeUnitCode: 'SQAM.CREATE_CLAIM_LIST.GRID,SQAM.CREATE_CLAIM_LIST.FILTER',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          claimList: res.content,
          selectedRowKeys: [],
          pagination: createPagination(res),
        });
      }
    });
  }

  // 新建跳转
  @Bind()
  handleCreateClaim() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sqam/createClaim/create`,
      })
    );
  }

  /**
   * Excel-批量导入-创建-索赔单
   */
  @Bind()
  handleImport() {
    const { history } = this.props;
    history.push({
      pathname: '/sqam/createClaim/data-import/SQAM_CLAIM_FORM_BATCH_CREATE',
      search: stringify({
        action: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
        backPath: '/sqam/createClaim/list',
        args: JSON.stringify({
          tenantId: getCurrentOrganizationId(),
          templateCode: 'SQAM_CLAIM_FORM_BATCH_CREATE',
        }),
      }),
    });
  }

  // 引用检验单创建
  @Bind()
  handleQuoteIncoming() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sqam/createClaim/quoteIncomingInspection`,
      })
    );
  }

  // 提交索赔单
  @Bind()
  handleSubmit() {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;
    if (Array.isArray(selectedRows) && selectedRows.length === 0) {
      notification.warning({
        message: intl.get('sqam.common.view.message.selectWarning').d('请选择至少一条数据'),
      });
      return;
    }
    const validateOk = () => {
      dispatch({
        type: 'createClaim/submitClaim',
        payload: selectedRows,
      }).then((res) => {
        if (res && isEmpty(res)) {
          notification.success();
        }
        this.fetchClaim();
      });
    };
    dispatch({
      type: 'createClaim/submitValidate',
      payload: selectedRows,
    }).then((valiRes) => {
      if (!valiRes) return;
      const { validatedCode, msg } = valiRes || {};
      if (validatedCode === 'WARNING') {
        Modal.confirm({
          content: msg,
          onOk: validateOk,
        });
      } else if (validatedCode === 'ERROR') {
        notification.error({
          message: intl.get('sqam.common.notification.error').d('操作失败'),
          description: msg,
        });
      } else if (valiRes) {
        return validateOk();
      }
    });
  }

  // 改变选中行
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  // 跳转索赔单维护
  @Bind()
  goDetail(formHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sqam/createClaim/detail/${formHeaderId}`,
      })
    );
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   */
  @Bind()
  handleFormQuery(filterValues) {
    const dealTime = {};
    const timeArray = ['creationDateFrom', 'creationDateTo', 'feedbackDateFrom', 'feedbackDateTo'];
    timeArray.forEach((item) => {
      if (['creationDateFrom', 'feedbackDateFrom'].includes(item)) {
        dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
      } else {
        dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MAX) : undefined;
      }
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  @Bind()
  headerBtns() {
    const { selectedRowKeys } = this.state;
    const { fetchClaimLoading, submitLoading, remote: remoteProps } = this.props;
    const isLoading = fetchClaimLoading || submitLoading;
    const otherProps = {
      loading: isLoading,
      onSearch: this.fetchClaim,
      goDetail: this.goDetail,
    };
    const allBtns = [
      {
        name: 'create',
        child: intl.get('hzero.common.button.create').d('新建'),
        btnProps: {
          type: 'primary',
          icon: 'plus',
          onClick: throttle(this.handleCreateClaim, 1500, { trailing: false }),
          loading: isLoading,
        },
      },
      {
        name: 'import',
        btnComp: PermissionButton,
        child: intl.get(`hzero.common.viewtitle.batchImportCreation`).d('导入创建'),
        btnProps: {
          onClick: throttle(this.handleImport, 1500, { trailing: false }),
          permissionList: [
            {
              code: `srm.sqam.business.claim.sqam.create.claim.list.ps.batch.import`,
              type: 'button',
            },
          ],
          loading: isLoading,
        },
      },
      {
        name: 'quoteQualityInspect',
        btnComp: PermissionButton,
        child: intl.get('sqam.common.view.title.quoteQualityInspect').d('引用质检单'),
        btnProps: {
          onClick: throttle(this.handleQuoteIncoming, 1500, { trailing: false }),
          permissionList: [
            {
              code: `srm.sqam.business.claim.sqam.create.claim.list.ps.batch.inspection`,
              type: 'button',
            },
          ],
          loading: isLoading,
        },
      },
      {
        name: 'submit',
        btnComp: PermissionButton,
        child: intl.get('hzero.common.button.submit').d('提交'),
        btnProps: {
          icon: 'check',
          onClick: throttle(this.handleSubmit, 1500, { trailing: false }),
          disabled: isEmpty(selectedRowKeys),
          permissionList: [
            {
              code: `srm.sqam.business.claim.sqam.create.claim.list.button.submit`,
              type: 'button',
            },
          ],
          loading: isLoading,
        },
      },
      {
        name: 'newImport',
        btnComp: Import,
        childFor: 'buttonText',
        child: intl.get(`hzero.common.button.addExcel1`).d('新版Excel导入'),
        btnProps: {
          businessObjectTemplateCode: 'SQAM_CLAIM_FORM_BATCH_CREATE',
          buttonProps: {
            type: 'c7n-pro',
            icon: 'archive',
            funcType: 'raised',
            loading: isLoading,
            permissionList: [
              {
                code: `srm.sqam.business.claim.sqam.create.claim.list.ps.newbatchimport`,
                type: 'button',
              },
            ],
          },
          prefixPatch: '/sqam',
          args: {
            tenantId: getCurrentOrganizationId(),
            templateCode: 'SQAM_CLAIM_FORM_BATCH_CREATE',
          },
          successCallBack: () => this.fetchClaim(),
        },
      },
      {
        name: 'imgImport',
        btnComp: PermissionButton,
        child: intl.get('sqam.common.button.img.createClaim.import.img').d('索赔图片导入'),
        btnProps: {
          icon: 'archive',
          onClick: throttle(() => this.props.history.push('/sqam/createClaim/imgImport'), 1500, {
            trailing: false,
          }),
          permissionList: [
            {
              code: `srm.sqam.business.claim.sqam.create.claim.list.button.img_import`,
              type: 'button',
            },
          ],
          loading: isLoading,
        },
      },
    ];
    return remoteProps ? remoteProps.process('SQAM_CLAIM_LIST_BTNS', allBtns, otherProps) : allBtns;
  }

  render() {
    const { claimList, pagination, selectedRowKeys } = this.state;
    const { fetchClaimLoading, form, customizeBtnGroup } = this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const filterFormProps = {
      form,
      fetchClaim: this.fetchClaim,
    };
    const listProps = {
      claimList,
      pagination,
      rowSelection,
      goDetail: this.goDetail,
      fetchClaimLoading,
      fetchClaim: this.fetchClaim,
    };
    return (
      <Fragment>
        <Header title={intl.get('sqam.common.view.title.createClaim').d('索赔单创建')}>
          {customizeBtnGroup(
            { code: 'SQAM.CREATE_CLAIM_LIST.BTNS', pro: true },
            <DynamicButtons buttons={this.headerBtns()} />
          )}
        </Header>
        <Content>
          <FilterForm {...filterFormProps} />
          <List {...listProps} />
        </Content>
      </Fragment>
    );
  }
}
