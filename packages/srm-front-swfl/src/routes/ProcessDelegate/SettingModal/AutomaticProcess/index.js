import React, { Component } from 'react';
import { DataSet, TextField, Icon, Modal, Button } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { isEmpty, omit } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { observer } from 'mobx-react';

import { Content } from 'components/Page';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { enableRender } from 'utils/renderer';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { toJS } from 'mobx';
import { renderDelegateStatus } from '@/utils/util';
import { processProcessFormDS, processProcessTableDS } from '@/stores/automaticProcessDS';
import { saveProcess } from '@/services/processDelegateServices';
import { deleteProcess } from '@/services/automaticProcessService';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import ProcessRule from './ProcessRule';

import styles from '../index.less';

@formatterCollections({ code: ['hwfp.automaticProcess', 'hwfp.common', 'hwfp.delegate'] })
@withProps(() => {
  const formDs = new DataSet(processProcessFormDS());
  const tableDs = new DataSet(processProcessTableDS());
  return { formDs, tableDs };
}, {})
@observer
export default class AutomaticProcess extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // 新增/编辑后保存
  @Bind()
  async saveProcess(isEdit) {
    const { formDs, tableDs } = this.props;
    const flag = await formDs.validate();
    if (!flag) {
      return false;
    }
    let value = formDs.current.toJSONData();
    value = omit(value, ['__dirty', '__id', '_status']);
    if (!value.processStartDate) {
      value.processStartDate = moment().format(DEFAULT_DATETIME_FORMAT);
    }
    saveProcess(isEdit, value).then((response) => {
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
        const itemValue = value[item];
        if (item === 'delegateActList') {
          formDs.current.init(
            'delegateActId',
            Array.isArray(itemValue) ? itemValue.map((v) => v.id) : []
          );
        } else if (item !== 'delegateActId') {
          formDs.current.init(item, itemValue);
        }
      });
    }
    Modal.open({
      drawer: true,
      title: !isEmpty(record)
        ? intl.get('hwfp.automaticProcess.view.message.title.editRule').d('编辑处理规则')
        : intl.get('hwfp.automaticProcess.view.message.title.addRule').d('新增处理规则'),
      style: {
        width: '380px',
      },
      className: styles['setting-modal-drawer'],
      children: <ProcessRule dataSet={formDs} isEdit={!isEmpty(record)} />,
      onOk: () => this.saveProcess(!isEmpty(record)),
      okText: !isEmpty(record)
        ? intl.get('hzero.common.button.save').d('保存')
        : intl.get('hzero.common.button.ok').d('确定'),
    });
  }

  @Bind()
  handleSearch(params = {}) {
    const { tableDs } = this.props;
    let filterValues = params;
    const { processKey = '' } = filterValues;
    filterValues = omit(filterValues, ['__dirty', 'employeeLov']);
    tableDs.setQueryParameter('queryParams', {
      ...filterValues,
      processName: processKey || null,
    });
    tableDs.query();
  }

  @Bind()
  handleClean() {
    const { tableDs } = this.props;
    if (tableDs.selected.length) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示?'),
        children: intl
          .get('hwfp.automaticProcess.view.message.title.confirmClean')
          .d(`是否确认清除?`),
        onOk: () => {
          const data = tableDs.selected.map((i) => i.toData());
          deleteProcess(data).then((res) => {
            if (getResponse(res)) {
              notification.success();
              tableDs.query();
            }
          });
        },
      });
    }
  }

  @Bind()
  getColumns() {
    return [
      {
        name: 'automaticProcessStatus',
        width: 160,
        renderer: renderDelegateStatus,
      },
      {
        name: 'employeeName',
        width: 90,
      },
      {
        name: 'delegateStatus',
        width: 160,
        renderer: renderDelegateStatus,
      },
      {
        name: 'processKey',
        width: 170,
      },
      {
        name: 'processName',
        width: 170,
      },
      {
        header: intl.get('hwfp.common.model.approval.processNode').d('审批节点'),
        width: 200,
        renderer: ({ record }) => {
          const delegateActList = toJS(record.get('delegateActList'));
          if (!delegateActList || !Array.isArray(delegateActList)) {
            return '';
          }
          return delegateActList.map((n) => n.name).join(',');
        },
      },
      {
        name: 'processConditionMeaning',
        width: 90,
      },
      {
        name: 'conditionDetail',
        width: 280,
      },
      {
        name: 'processRuleMeaning',
        width: 90,
      },
      {
        name: 'processAction',
        renderer: ({ record, text }) => {
          const processRule = record.get('processRule');
          return (
            <span>
              {processRule === 'AutoDelegate'
                ? intl.get('hwfp.delegate.view.message.delegate').d('转交人')
                : intl
                    .get('hwfp.common.model.approval.opinion', { title: '审批意见' })
                    .d('审批意见')}
              : {text}
            </span>
          );
        },
        width: 170,
      },
      {
        name: 'enabledFlag',
        renderer: ({ text }) => enableRender(parseInt(text, 10)),
        width: 120,
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
    ];
  }

  render() {
    const { tableDs } = this.props;
    return (
      <>
        <Content className={styles['setting-modal']}>
          <div className={`${styles['setting-modal-content']} ${styles['setting-modal-process']}`}>
            <Alert
              closable
              className={`${styles['setting-modal-alert']} `}
              type="info"
              showIcon
              description={intl
                .get('hwfp.automaticProcess.view.message.automaticProcess.alert')
                .d('提示：用户开启全局转交配置且在生效中，则自动处理规则不会生效')}
            />
            <SearchBarTable
              searchCode="HWFP.PROCESS.DELEGATE.PROCESS.TABLE"
              border={false}
              columns={this.getColumns()}
              dataSet={tableDs}
              searchBarConfig={{
                onQuery: ({ params }) => this.handleSearch(params),
                left: {
                  render: (_, dataSet) => {
                    return (
                      <TextField
                        clearButton
                        dataSet={dataSet}
                        name="processKey"
                        placeholder={intl
                          .get('hwfp.common.model.query.process.codeAndName')
                          .d('请输入流程编码、流程名称查询')}
                        prefix={<Icon type="search" />}
                        style={{ width: '280px', margin: '0 20px 4px 0', zIndex: 0 }}
                      />
                    );
                  },
                },
                closeFilterSelector: true,
              }}
              buttons={[
                ['add', { onClick: () => this.openModal({}) }],
                <Button
                  icon="delete"
                  disabled={!tableDs.selected.length}
                  onClick={this.handleClean}
                >
                  {intl.get('hzero.common.button.clean').d('清除')}
                </Button>,
              ]}
              autoHeight={{ type: 'maxHeight', diff: -60 }}
            />
          </div>
        </Content>
      </>
    );
  }
}
