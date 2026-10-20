import React from 'react';
import { isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Button, Form, Input } from 'hzero-ui';
import Table from '@/components/VirtualTable';

import request from "utils/request";
import { getCurrentOrganizationId, getResponse, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import intl from 'utils/intl';
import { getEnvConfig } from 'hzero-front/lib/utils/iocUtils';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class DetailModal extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      expanded: true,
      data: [],
      expandedRowKeys: [],
    };
    this.preAuthRoleId = '';
  }

  componentDidMount() {
    this.refreshValue();
  }

  /**
   *刷新数据
   */
  @Bind()
  refreshValue() {
    const {
      userId,
      authRoleId,
      form,
    } = this.props;
    const { HZERO_IAM } = getEnvConfig();
    const url = isTenantRoleLevel()
    ? `${HZERO_IAM}/v1/${getCurrentOrganizationId()}/users/${userId}/authority-org/assigned`
    : `${HZERO_IAM}/v1/users/${userId}/${getCurrentOrganizationId()}/authority-org/assigned`;

    this.setState({
      loading: true,
    });
    request(url, {
      method: "GET",
      query: {
        userId,
        authRoleId,
        ...form.getFieldsValue(),
      },
    }).then((res) => {
      if (getResponse(res)) {
        const expandedRowKeys = res.originList && res.originList.map((list) => list.id);
        this.setState({
          loading: false,
          data: res.treeList,
          expandedRowKeys,
        });
      }
    });
  }

  /**
   *点击展开节点触发方法
   *
   * @param {*Boolean} expanded 展开收起标志
   * @param {*Object} record 行记录
   */
  @Bind()
  onExpand(expanded, record = {}) {
    const { expandedRowKeys = [] } = this.state;
    this.setState({
      expandedRowKeys: expanded
      ? expandedRowKeys.concat(record.id)
      : expandedRowKeys.filter((o) => o !== record.id),
    });
  }

  /**
   *渲染查询结构
   *
   * @returns
   */
  renderForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline">
        <FormItem label={intl.get('hiam.authority.model.authorityCompany.name').d('名称')}>
          {getFieldDecorator('dataName')(<Input />)}
        </FormItem>
        <FormItem label={intl.get('hiam.authority.model.authorityCompany.dataCode').d('代码')}>
          {getFieldDecorator('dataCode')(<Input typeCase="upper" trim inputChinese={false} />)}
        </FormItem>
        <FormItem>
          <Button type="primary" onClick={this.refreshValue} htmlType="submit">
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </FormItem>
      </Form>
    );
  }

  /**
   *渲染方法
   *
   * @returns
   */
  render() {
    const {
      userId,
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
    const {
      data = [],
      expandedRowKeys = [],
      loading,
    } = this.state;
    const columns = [
      {
        title: intl
          .get('hiam.authority.model.authorityCompany.dataName')
          .d('公司/业务单元/库存组织'),
        dataIndex: 'dataName',
        width: 400,
        flexGrow: 1,
      },
      {
        title: intl.get('hiam.authority.model.authorityCompany.dataCode').d('代码'),
        dataIndex: 'dataCode',
        width: 300,
        resizable: true,
      },
    ];

    return (
      <div>
        <div className="table-list-search">{this.renderForm()}</div>
        <Table
          isTree
          bordered
          rowKey="id"
          pagination={false}
          loading={loading}
          data={data}
          expandedRowKeys={expandedRowKeys}
          columns={columns}
          height={600}
          onExpandChange={this.onExpand}
        />
      </div>
    );
  }
}
