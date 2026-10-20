/**
 * Table 公共的Table
 * @date Mon Aug 13 2018
 * @author yunqiang.wu yunqiang.wu@hang-china.com
 * @copyright Copyright(c) 2018 Hand
 */

import React from 'react';
import { Table, Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { enableRender } from 'utils/renderer';
import intl from 'utils/intl';
import AttrsDrawer from './AttrsDrawer';

@Form.create({ fieldNameProp: null })
export default class FieldTable extends React.PureComponent {
  state = {
    attrsDrawerVisible: false,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.prevDataSource !== nextProps.dataSource) {
      nextProps.form.resetFields();
      return {
        dataSource: nextProps.dataSource,
        prevDataSource: nextProps.dataSource,
      };
    }
    return null;
  }

  // 显示组件
  @Bind()
  showAttrsDrawer(record) {
    this.setState({
      attrsDrawerVisible: true,
      drawerData: record,
    });
  }

  // 隐藏组件
  @Bind()
  hideAttrsDrawer() {
    this.setState({
      attrsDrawerVisible: false,
    });
  }

  render() {
    const { dataSource } = this.props;
    const columns = [
      {
        title: intl.get(`sslm.investTemHisOrg.model.definition.fieldCode`).d('字段编码'),
        dataIndex: 'fieldCode',
        width: 120,
      },
      {
        title: intl.get(`sslm.investTemHisOrg.model.definition.fieldDes`).d('字段描述'),
        dataIndex: 'fieldDescription',
        width: 150,
      },
      {
        title: intl.get(`sslm.investTemHisOrg.model.definition.orderSeq`).d('排序'),
        dataIndex: 'orderSeq',
        width: 70,
      },
      {
        title: intl.get(`sslm.investTemHisOrg.model.definition.component`).d('组件'),
        dataIndex: 'componentTypeMeaning',
        width: 100,
      },
      {
        title: intl.get(`sslm.investTemHisOrg.model.definition.lovCode`).d('值集'),
        dataIndex: 'lovCode',
        width: 150,
      },
      {
        title: intl.get(`sslm.investTemHisOrg.model.definition.attrs`).d('组件属性'),
        key: 'attrs',
        width: 100,
        render: (record) => (
          <a onClick={() => this.showAttrsDrawer(record)}>
            {intl.get(`sslm.investTemHisOrg.model.definition.attrs`).d('组件属性')}
          </a>
        ),
      },
      {
        title: intl.get(`sslm.investTemHisOrg.model.definition.customFlag`).d('预留字段'),
        dataIndex: 'customFlag',
        width: 100,
        render: (item) => {
          return item === 1
            ? intl.get('hzero.common.status.yes')
            : intl.get('hzero.common.status.no');
        },
      },
      {
        title: intl.get(`sslm.investTemHisOrg.model.definition.visualFlag`).d('启用'),
        dataIndex: 'visualFlag',
        width: 80,
        render: enableRender,
      },
      {
        title: intl.get(`sslm.investTemHisOrg.model.definition.requiredFlag`).d('要求必输'),
        dataIndex: 'requiredFlag',
        width: 100,
        render: enableRender,
      },
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.editFlag`).d('允许编辑'),
        dataIndex: 'editableFlag',
        width: 100,
        render: enableRender,
      },
      {
        title: intl.get(`sslm.investTemHisOrg.model.definition.colspan`).d('跨列'),
        dataIndex: 'colspan',
        width: 70,
      },
      {
        title: intl.get(`sslm.investTemHisOrg.model.definition.leftOffset`).d('左空位'),
        dataIndex: 'leftOffset',
        width: 70,
      },
      {
        title: intl.get(`sslm.investTemHisOrg.model.definition.rightOffset`).d('右空位'),
        dataIndex: 'rightOffset',
        width: 70,
      },
    ];

    const tableProps = {
      columns,
      dataSource,
      rowKey: 'investgCfLineId',
      pagination: false,
      scroll: { x: 1050 }, // y: 500  todo 待解决 加上 y 会有 header 和 body 对不齐的问题
    };

    return (
      <React.Fragment>
        <Table bordered {...tableProps} />
        {this.state.attrsDrawerVisible && (
          <AttrsDrawer
            visible={this.state.attrsDrawerVisible}
            record={this.state.drawerData}
            onClose={this.hideAttrsDrawer}
          />
        )}
      </React.Fragment>
    );
  }
}
