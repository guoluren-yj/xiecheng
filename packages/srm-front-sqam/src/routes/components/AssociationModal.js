import React, { PureComponent } from 'react';
import { Form, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';

import { Content, Header } from 'components/Page';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';

@Form.create({ fieldNameProp: null })
export default class MaterielModal extends PureComponent {
  componentDidMount() {
    const { fetchAssociation } = this.props;
    fetchAssociation();
  }

  /**
   * 关联8d跳转
   */
  @Bind()
  onDetail(record) {
    const { onCancel, dispatch, supplier = false } = this.props;
    const { associateProblemHeaderId } = record;
    const path = supplier ? '/sqam/received8D/detail' : '/sqam/initiated8D/detail';
    dispatch(
      routerRedux.push({
        pathname: `${path}/${associateProblemHeaderId}`,
      })
    );
    onCancel();
  }

  render() {
    const { visible, onCancel, associationList, loadingAssociation } = this.props;
    const columns = [
      {
        title: intl.get('sqam.common.model.qualityRectification.code').d('整改报告编号'),
        dataIndex: 'problemNum',
        width: 300,
        render: (val, record) => <a onClick={() => this.onDetail(record)}>{val}</a>,
      },
      {
        title: intl.get('sqam.common.model.qualityRectification.title').d('整改报告标题'),
        dataIndex: 'problemTitle',
        width: 300,
      },
      {
        title: intl.get('entity.roles.creator').d('创建人'),
        dataIndex: 'createdName',
        width: 200,
      },
    ];
    const tableProps = {
      columns,
      rowKey: 'problemHeaderId',
      loading: loadingAssociation,
      dataSource: associationList,
    };
    return (
      <Modal width={800} destroyOnClose visible={visible} onCancel={onCancel} footer={null}>
        <React.Fragment>
          <Header
            title={intl
              .get('sqam.common.model.qualityRectification.relatedRectification')
              .d('关联整改报告')}
          />
          <Content>
            <EditTable bordered {...tableProps} />
          </Content>
        </React.Fragment>
      </Modal>
    );
  }
}
