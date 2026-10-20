/**
 * index.js - 印章管理
 * @date: 2019-08-07
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
import { Tag } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import EditTable from 'components/EditTable';
import { yesOrNoRender } from 'utils/renderer';
import { sum } from 'lodash';
import intl from 'utils/intl';
// import Checkbox from 'components/Checkbox';
// const FormItem = Form.Item;
export default class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // selectedRowKeys: [],
      //   invOrganizationName: undefined,
    };
  }

  /**
   * 打开编辑弹窗
   * @param {Object} record
   */
  @Bind()
  protocolType(text, record) {
    const { handleModalVisibleList = e => e } = this.props;
    return (
      <span className="action-link">
        {record.userImpowerFlag === 1 && record.authType === 'ESIGN' && (
          <a
            onClick={() =>
              handleModalVisibleList('sealGenerationVisible', true, {
                companyId: record.companyId,
              })
            }
          >
            {intl.get(`spfm.sealmanage.view.message.title.generateSeal`).d('印章生成')}
          </a>
        )}
        <a
          onClick={() =>
            handleModalVisibleList(
              'operationRecordVisible',
              true,
              {
                companyId: record.companyId,
                certificateResId: record.certificateResId,
              },
              record.authType === 'FDD' ? !record.authorizeFlag : false
            )
          }
        >
          {intl.get(`spfm.sealmanage.view.message.title.controlOfStamping`).d('印章管理')}
        </a>
        {record.caAuthStatus === 'CA_SUCCESS' && (
          <a
            onClick={() =>
              handleModalVisibleList(
                'authorizationVisible',
                true,
                {
                  companyId: record.companyId,
                  certificateResId: record.certificateResId,
                },
                record.authType === 'FDD' ? !record.authorizeFlag : false
              )
            }
          >
            {intl.get(`spfm.sealmanage.view.message.title.authorizationVisible`).d('授权')}
          </a>
        )}
      </span>
    );
  }

  /**
   * 打开编辑弹窗
   * @param {Object} record
   */
  // @Bind()
  // showEditModal(record) {
  //   if (this.props.showEditModal) {
  //     this.props.showEditModal(record);
  //   }
  // }

  render() {
    const { loading, dataSource, onSearch, pagination } = this.props;
    const tableProps = {
      columns: [
        {
          title: intl.get('entity.company.code').d('公司编码'),
          dataIndex: 'companyNum',
          width: 200,
        },
        {
          title: intl.get('entity.company.name').d('公司名称'),
          dataIndex: 'companyName',
          width: 200,
        },
        {
          title: intl.get(`spfm.sealmanage.model.certifAuthStatus`).d('CA状态'),
          dataIndex: 'caAuthStatusMeaning',
          width: 100,
        },
        {
          title: intl.get(`hzero.common.status.enable`).d('启用'),
          dataIndex: 'enabledFlag',
          width: 40,
          render: value => {
            return (
              <Tag color={value == 1 ? 'green' : 'red'}>
                {value == 1
                  ? intl.get('hzero.common.status.alreadyEnabled').d('已启用')
                  : intl.get('hzero.common.status.alreadyDisabled').d('已禁用')}
              </Tag>
            );
          },
        },
        {
          title: intl.get(`hzero.common.table.column.option`).d('操作'),
          dataIndex: 'guanli',
          width: 180,
          render: this.protocolType,
        },
      ],
      loading,
      dataSource,
      bordered: true,
      onChange: page => onSearch(page),
      pagination,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map(n => n.width)) + 300 };

    return (
      <React.Fragment>
        <EditTable {...tableProps} />
      </React.Fragment>
    );
  }
}
