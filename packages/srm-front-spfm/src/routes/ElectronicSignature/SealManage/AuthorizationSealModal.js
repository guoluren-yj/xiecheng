/*
 * AuthorizationSealModal - 授权印章弹窗
 * @date: 2019-08-07
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Modal, Form, Table, Row, Col, Input, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import notification from 'utils/notification';
import {
  fetchLeftSealList,
  fetchRightSealList,
  fddAuthorize,
  fddCancelAuthorize,
} from '@/services/sealMangeService';

import {
  SEARCH_COL_CLASSNAME,
  SEARCH_FORM_ROW_LAYOUT,
  FORM_COL_4_LAYOUT,
  SEARCH_FORM_ITEM_LAYOUT,
} from 'utils/constants';
import intl from 'utils/intl';
import { createPagination, getCurrentOrganizationId, getResponse } from 'utils/utils';
import { queryIdpValue } from 'hzero-front/lib/services/api';

import styles from './AuthorizationSealModal.less';

const organizationId = getCurrentOrganizationId();

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class AuthorizationSealModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      leftSealDataSource: [],
      leftSealPagination: {},
      rightSealDataSource: [],
      rightSealPagination: {},
      leftSealSelectedRowKeys: [], // 未选印章id
      rightSealSelectedRowKeys: [], // 已选印章id(
      leftSealSelectedRow: [], // 未选印章列表勾选行数据
      rightSealSelectedRow: [], // 已选印章列表勾选行数据
      visible: false,
      loadingfetchLeftSealList: false,
      loadingfetchRightSealList: false,
      loadingHandleAssign: false,
      loadingHandleCancelAssign: false,
      bizTypeMap: {},
    };
  }

  componentDidMount() {
    queryIdpValue('SPFM.SEAL_BIZ_TYPE').then((res) => {
      if (res && Array.isArray(res) && res.length) {
        const typeMap = {};
        res.forEach(item => {
          typeMap[item.value] = item.meaning;
        });
        this.setState({
          bizTypeMap: typeMap,
        });
      }
    });
  }

  /**
   * 查询可授权印章列表(左)
   * @param {*} [page={}]
   */
  @Bind()
  fetchLeftSealList(page = {}) {
    const { companyId, record, authType } = this.props;
    const { impowerType, impowerId } = record;
    const serchValue = this.props.form.getFieldsValue();
    this.setState({
      loadingfetchLeftSealList: true,
    });
    fetchLeftSealList({
      companyId,
      tenantId: organizationId,
      impowerType,
      impowerId,
      authType,
      ...serchValue,
      page,
    })
      .then((res) => {
        if (getResponse(res)) {
          this.setState({
            leftSealSelectedRowKeys: [],
            leftSealDataSource: res.content,
            leftSealPagination: createPagination(res),
          });
        }
      })
      .finally(() => {
        this.setState({
          loadingfetchLeftSealList: false,
        });
      });
  }

  /**
   * 查询已授权印章列表(右)
   * @param {*} [page={}]
   */
  @Bind()
  fetchRightSealList(page = {}) {
    const { companyId, record, authType } = this.props;
    const { impowerType, impowerId } = record;
    const serchValue = this.props.form.getFieldsValue();
    this.setState({
      loadingfetchRightSealList: true,
    });
    fetchRightSealList({
      companyId,
      tenantId: organizationId,
      impowerType,
      impowerId,
      authType,
      ...serchValue,
      page,
    })
      .then((res) => {
        if (getResponse(res)) {
          this.setState({
            rightSealSelectedRowKeys: [],
            rightSealDataSource: res.content,
            rightSealPagination: createPagination(res),
          });
        }
      })
      .finally(() => {
        this.setState({
          loadingfetchRightSealList: false,
        });
      });
  }

  /**
   * 添加
   */
  @Bind()
  handleAssign() {
    const { record, authType } = this.props;
    const { leftSealSelectedRow } = this.state;
    const { impowerId, impowerType } = record;
    this.setState({
      loadingHandleAssign: true,
    });
    const data = leftSealSelectedRow.map((item) => {
      return {
        impowerId,
        impowerType,
        tenantId: organizationId,
        sealId: item.sealId,
        sealCode: item.sealCode,
      };
    });

    fddAuthorize({ list: data, authType })
      .then((res) => {
        if (getResponse(res)) {
          notification.success();
          this.setState({
            leftSealSelectedRowKeys: [],
            leftSealSelectedRow: [],
            loadingHandleAssign: true,
          });
          this.fetchLeftSealList();
          this.fetchRightSealList();
        }
        this.fetchLeftSealList();
        this.fetchRightSealList();
      })
      .finally(() => {
        this.setState({
          loadingHandleAssign: false,
        });
      });
  }

  /**
   * 删除
   */
  @Bind()
  handleCancelAssign() {
    const { record, authType } = this.props;
    const { rightSealSelectedRow } = this.state;
    const { impowerId, impowerType } = record;
    this.setState({
      loadingHandleCancelAssign: true,
    });
    const data = rightSealSelectedRow.map((item) => {
      return {
        impowerId,
        impowerType,
        tenantId: organizationId,
        sealId: item.sealId,
        sealCode: item.sealCode,
        authorizeId: item.authorizeId,
      };
    });
    fddCancelAuthorize({ list: data, authType })
      .then((res) => {
        if (getResponse(res)) {
          notification.success();
          this.setState({
            rightSealSelectedRowKeys: [],
            rightSealSelectedRow: [],
            loadingHandleCancelAssign: true,
          });
          this.fetchLeftSealList();
          this.fetchRightSealList();
        }
        this.fetchLeftSealList();
        this.fetchRightSealList();
      })
      .finally(() => {
        this.setState({
          loadingHandleCancelAssign: false,
        });
      });
  }

  /**
   * 重置
   */
  @Bind()
  handleReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  render() {
    const {
      leftSealDataSource,
      leftSealPagination,
      rightSealDataSource,
      rightSealPagination,
      leftSealSelectedRowKeys,
      rightSealSelectedRowKeys,
      visible,
      loadingfetchLeftSealList,
      loadingfetchRightSealList,
      loadingHandleAssign,
      loadingHandleCancelAssign,
      bizTypeMap,
    } = this.state;
    const {
      form: { getFieldDecorator },
      isShowField,
    } = this.props;
    const modalProps = {
      visible,
      onCancel: () => {
        this.setState({
          visible: false,
        });
      },
      width: 1000,
      title: intl.get(`spfm.sealmanage.model.selectSealList`).d('选择印章列表'),
      footer: null,
    };
    const notPermitTableProps = {
      columns: [
        {
          title: intl.get(`spfm.sealmanage.model.sealCode`).d('印章编码'),
          dataIndex: 'sealCode',
          width: 120,
        },
        {
          title: intl.get(`spfm.sealmanage.model.sealName`).d('印章名称'),
          dataIndex: 'sealName',
          width: 120,
        },
        isShowField && {
          title: intl.get(`spfm.sealmanage.model.sealType`).d('印章类型'),
          dataIndex: 'sealBizType',
          width: 120,
          render: (val, record) => {
            return bizTypeMap[val] || '-';
          },
        },
      ].filter(Boolean),
      title: () => intl.get(`spfm.sealmanage.model.optionalSeal`).d('可选印章'),
      loading: loadingfetchLeftSealList,
      bordered: true,
      pagination: leftSealPagination,
      dataSource: leftSealDataSource,
      rowKey: 'sealId',
      rowSelection: {
        selectedRowKeys: leftSealSelectedRowKeys,
        onChange: (rowKeys, selectedRows) =>
          this.setState({ leftSealSelectedRowKeys: rowKeys, leftSealSelectedRow: selectedRows }),
      },
      onChange: this.fetchLeftSealList,
    };
    const permitTableProps = {
      columns: [
        {
          title: intl.get(`spfm.sealmanage.model.sealCode`).d('印章编码'),
          dataIndex: 'sealCode',
          width: 120,
        },
        {
          title: intl.get(`spfm.sealmanage.model.sealName`).d('印章名称'),
          dataIndex: 'sealName',
          width: 120,
        },
        isShowField && {
          title: intl.get(`spfm.sealmanage.model.sealType`).d('印章类型'),
          dataIndex: 'sealBizType',
          width: 120,
          render: (val, record) => {
            return bizTypeMap[val] || '-';
          },
        },
      ].filter(Boolean),
      title: () => intl.get(`spfm.sealmanage.model.selectedSeal`).d('已选印章'),
      bordered: true,
      loading: loadingfetchRightSealList,
      pagination: rightSealPagination,
      dataSource: rightSealDataSource,
      rowKey: 'sealId',
      rowSelection: {
        selectedRowKeys: rightSealSelectedRowKeys,
        onChange: (rowKeys, selectedRows) =>
          this.setState({ rightSealSelectedRowKeys: rowKeys, rightSealSelectedRow: selectedRows }),
      },
      onChange: this.fetchRightSealList,
    };
    return (
      <div>
        <Modal {...modalProps}>
          <Form className="more-fields-search-form">
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_4_LAYOUT}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`spfm.sealmanage.model.sealCode`).d('印章编码')}
                >
                  {getFieldDecorator('sealCode')(<Input />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`spfm.sealmanage.model.sealName`).d('印章名称')}
                >
                  {getFieldDecorator('sealName')(<Input />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_4_LAYOUT} className={SEARCH_COL_CLASSNAME}>
                <FormItem>
                  <Button onClick={this.handleReset}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    onClick={() => {
                      this.fetchLeftSealList();
                      this.fetchRightSealList();
                    }}
                  >
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </FormItem>
              </Col>
            </Row>
          </Form>
          <div className={styles['supplier-online-confirm']}>
            <div className="one-col">
              <Table {...notPermitTableProps} />
            </div>
            <div className="two-col">
              <Button
                icon="right"
                loading={loadingHandleAssign}
                disabled={!leftSealSelectedRowKeys.length}
                onClick={this.handleAssign}
              >
                {intl.get('spfm.configServer.view.button.add.selectedSupplier').d('添加')}
              </Button>
              <Button
                icon="left"
                loading={loadingHandleCancelAssign}
                disabled={!rightSealSelectedRowKeys.length}
                onClick={this.handleCancelAssign}
                style={{
                  marginTop: '8px',
                }}
              >
                {intl.get(`hzero.common.button.delete`).d('删除')}
              </Button>
            </div>
            <div className="three-col">
              <Table {...permitTableProps} />
            </div>
          </div>
        </Modal>
        <a
          onClick={() => {
            this.setState({
              visible: true,
            });
            this.fetchLeftSealList();
            this.fetchRightSealList();
          }}
        >
          {intl.get('spfm.sealmanage.model.authorizationSeal').d('授权印章')}
        </a>
      </div>
    );
  }
}
