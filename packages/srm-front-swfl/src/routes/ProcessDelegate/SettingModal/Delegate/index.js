import React, { Component } from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { isEmpty, omit } from 'lodash';
import { Bind } from 'lodash-decorators';

import { Content } from 'components/Page';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import { renderDelegateStatus } from '@/utils/util';
import { autoDelegateFormDS, autoDelegateTableDS } from '@/stores/automaticProcessDS';
import { saveDelegate } from '@/services/processDelegateServices';

import DelegateRule from './DelegateRule';

import styles from '../index.less';

@formatterCollections({
  code: ['hwfp.automaticProcess', 'hwfp.common', 'hzero.common', 'hwfp.delegate'],
})
@withProps(() => {
  const formDs = new DataSet(autoDelegateFormDS());
  const tableDs = new DataSet(autoDelegateTableDS());
  return { formDs, tableDs };
}, {})
export default class AutomaticProcess extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // 新增/编辑后保存
  @Bind()
  async saveDelegate(isEdit) {
    const { formDs, tableDs } = this.props;
    const flag = await formDs.validate();
    if (!flag) {
      return false;
    }
    let value = formDs.current.toJSONData();
    value = omit(value, ['__dirty', '__id', '_status']);
    saveDelegate(isEdit, value).then((response) => {
      const res = getResponse(response);
      if (res) {
        notification.success();
        tableDs.query();
      }
    });
  }

  @Bind()
  openModal(record = {}) {
    const { formDs } = this.props;
    formDs.loadData([]);
    formDs.create();
    if (!isEmpty(record)) {
      const value = record.toData();
      Object.keys(value).forEach((item) => {
        formDs.current.init(item, value[item]);
      });
    }
    Modal.open({
      drawer: true,
      title: `${
        !isEmpty(record)
          ? intl.get('hzero.common.view.button.edit').d('编辑')
          : intl.get('hzero.common.button.newCreate').d('新建')
      }${intl.get('hzero.common.status.autoDelegate').d('自动转交')}`,
      style: {
        width: '380px',
      },
      className: styles['setting-modal-drawer'],
      children: <DelegateRule dataSet={formDs} isEdit={!isEmpty(record)} />,
      onOk: () => this.saveDelegate(!isEmpty(record)),
      okText: !isEmpty(record)
        ? intl.get('hzero.common.button.save').d('保存')
        : intl.get('hzero.common.button.ok').d('确定'),
    });
  }

  @Bind()
  getColumns() {
    return [
      {
        name: 'delegateStatus',
        width: 120,
        renderer: renderDelegateStatus,
      },
      {
        header: intl.get('hzero.common.button.action').d('操作'),
        width: 90,
        lock: 'right',
        renderer: ({ record }) => (
          <a onClick={() => this.openModal(record)}>
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
      },
      {
        name: 'employeeName',
      },
      {
        name: 'delegateStartDate',
      },
      {
        name: 'delegateEndDate',
      },
      {
        name: 'delegateName',
      },
    ];
  }

  render() {
    const { tableDs } = this.props;
    return (
      <>
        <Content className={styles['setting-modal']}>
          <div className={styles['setting-modal-content']}>
            <SearchBarTable
              searchCode="HWFP.PROCESS.DELEGATE.AUTO.DELEGATE.RULE"
              border={false}
              columns={this.getColumns()}
              dataSet={tableDs}
              selectionMode="none"
              searchBarConfig={{
                closeFilterSelector: true,
              }}
              buttons={[['add', { onClick: () => this.openModal({}) }]]}
              autoHeight={{ type: 'maxHeight', diff: -60 }}
            />
          </div>
        </Content>
      </>
    );
  }
}
