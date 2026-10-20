/**
 * 会员标签管理 - 列表
 * @Author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @Date: 2021-03-23
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { withRouter } from 'react-router';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import SearchBarTable from '_components/SearchBarTable';
import { DataSet, Modal, Button } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { Button as ButtonPermission } from 'components/Permission';
import { TagListDS, TagDetailDS } from '@/stores/TagManagementDS';
import { enabledTagItem } from '@/services/memberCentreService';

import EditModal from './EditModal';

const modalKey = Modal.key();

@formatterCollections({
  code: ['sigl.memberCenter', 'halt.alertAdvanced', 'hzero.common'],
})
@withRouter
export default class tagManagement extends Component {
  tableDS = new DataSet({ ...TagListDS(), autoQuery: true });

  tagDatailDS = new DataSet({ ...TagDetailDS(), autoQuery: false });

  path = 'srm.mall.tenant.member.sigl.member_label.ps'; // 权限集前缀

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.tableDS.query();
  }

  get columns() {
    // const {
    //   match: { path },
    // } = this.props;

    // const { path } = this;

    return [
      {
        name: 'enabledFlag',
        renderer: ({ value, text }) => {
          return (
            <Tag color={value ? 'green' : 'red'} border={false}>
              {text}
            </Tag>
          );
        },
      },
      {
        name: 'labelCode',
        renderer: ({ record }) => {
          return (
            <span>
              <a onClick={() => this.handleOpenEditModal(record)}>{record.get('labelCode')}</a>
            </span>
          );
        },
      },
      {
        name: 'labelName',
      },
      {
        name: 'remarks',
      },
      {
        header: intl.get(`sigl.memberCenter.view.modal.operation`).d('操作'),
        name: 'operation',
        width: 150,
        lock: 'right',
        renderer: ({ record }) => {
          const enabledBtn = record.get('enabledFlag')
            ? intl.get(`hzero.common.button.disable`).d('禁用')
            : intl.get(`hzero.common.button.enabled`).d('启用');

          return (
            <span className="action-link">
              <Button type="text" funcType="link" onClick={() => this.handleEnabledItem(record)}>
                {enabledBtn}
              </Button>
            </span>
          );
        },
      },
    ];
  }

  /**
   * 启用或禁用操作
   */
  @Bind()
  handleEnabledItem(record) {
    if (record.get('enabledFlag') === 0) {
      this.handleConfirmEnabled(record);
      return;
    }
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      style: {
        width: 560,
      },
      children: (
        <div>
          {intl
            .get(`sigl.memberCenter.view.message.deleteTagWarning`)
            .d('禁用标签会删除标签与所有会员的关联关系')}
        </div>
      ),
    }).then(async (button) => {
      if (button === 'ok') {
        this.handleConfirmEnabled(record);
      }
    });
  }

  @Bind()
  async handleConfirmEnabled(record) {
    const params = record.toData();
    const res = await enabledTagItem({
      ...params,
      enabledFlag: params.enabledFlag ? 0 : 1,
    });
    if (getResponse(res)) {
      this.tableDS.query(this.tableDS.currentPage);
    }
  }

  /**
   * 保存会员标签信息
   */
  @Bind()
  async handleSaveMemberTag() {
    const isValidate = await this.tagDatailDS.validate();
    if (!isValidate) {
      return false;
    }

    const res = await this.tagDatailDS.submit();
    if (getResponse(res)) {
      this.tagDatailDS.data = [];
      this.tableDS.query(this.tableDS.currentPage);
    } else {
      return false;
    }
  }

  /**
   * 打开会员标签 新建或编辑弹窗
   * 存在 recode 即为编辑
   */
  @Bind()
  handleOpenEditModal(record) {
    const labelId = record ? record.get('labelId') : '';
    this.tagDatailDS.data = [];
    if (labelId) {
      this.tagDatailDS.create({ ...record.toData() });
    } else {
      this.tagDatailDS.create({ enabledFlag: 1 });
    }

    const modalTitle = labelId
      ? intl.get(`sigl.memberCenter.view.title.tagEdit`).d('编辑标签')
      : intl.get(`sigl.memberCenter.view.button.createTag`).d('新建标签');

    const modalPropertys = {
      title: modalTitle,
      drawer: true,
      closable: true,
      style: {
        width: 380,
      },
      key: modalKey,
      children: <EditModal record={record} dataSet={this.tagDatailDS} />,
      onCancel: () => this.tagDatailDS.reset(),
      onClose: () => this.tagDatailDS.reset(),
      onOk: () => this.handleSaveMemberTag(),
    };

    Modal.open(modalPropertys);
  }

  render() {
    // const { path } = this;
    return (
      <React.Fragment>
        <Header title={intl.get(`sigl.memberCenter.view.title.tagManage`).d('会员标签管理')}>
          <ButtonPermission
            // permissionList={[
            //   {
            //     code: `${path}.button.create`,
            //     type: 'button',
            //     meaning: '积分管理-发放积分',
            //   },
            // ]}
            type="c7n-pro"
            icon="add"
            color="primary"
            onClick={() => this.handleOpenEditModal('')}
          >
            {intl.get(`sigl.memberCenter.view.button.createTag`).d('新建标签')}
          </ButtonPermission>
        </Header>
        <Content>
          <SearchBarTable
            searchCode="SIGL.TAG_MANAGE.LIST.SEARCH_NEW"
            customizedCode="SIGL.TAG_MANAGE.LIST"
            dataSet={this.tableDS}
            columns={this.columns}
            style={{ maxHeight: `calc(100vh - 196px)` }}
          />
        </Content>
      </React.Fragment>
    );
  }
}
