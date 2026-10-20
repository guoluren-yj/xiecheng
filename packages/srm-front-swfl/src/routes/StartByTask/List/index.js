/**
 * startByTask - 参与流程
 * @date: 2018-8-31
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Modal as ModalPro, TextArea } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';
import moment from 'moment';

import { Header } from 'components/Page';

import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';

import FilterForm from './FilterForm';
import ListTable from './ListTable';
import styles from './index.less';

@formatterCollections({
  code: ['hwfp.task', 'hwfp.startByTask', 'hwfp.common', 'hpfm.organization'],
})
@connect(({ startByTask, loading }) => ({
  startByTask,
  fetchListLoading: loading.effects['startByTask/fetchTaskList'],
  remindLoading: loading.effects['startByTask/taskRemind'],
  revokeLoading: loading.effects['startByTask/taskRevoke'],
  tenantId: getCurrentOrganizationId(),
}))
export default class StartByTask extends Component {
  constructor(props) {
    super(props);
    this.form = null;
    this.tableRef = null;
  }

  componentDidMount() {
    const {
      startByTask: { pagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    // 校验是否从详情页返回
    const page = isUndefined(_back) ? {} : pagination;
    this.handleSearch({ involved: true, page });
    this.props.dispatch({ type: 'startByTask/queryProcessStatus' });
  }

  /**
   * 传递表单对象
   * @param {object} ref - FilterForm对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  handleBindTableRef(ref = {}) {
    this.tableRef = ref;
  }

  @Bind()
  handleExpandForm() {
    if (this.tableRef) {
      this.tableRef.handler();
    }
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch, tenantId } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const {
      startedAfter,
      startedBefore,
      processInstanceId,
      processDefinitionNameLike,
      startUserName,
      ...others
    } = filterValues;

    dispatch({
      type: 'startByTask/fetchTaskList',
      payload: {
        tenantId,
        startedAfter: startedAfter ? moment(startedAfter).format(DATETIME_MIN) : null,
        startedBefore: startedBefore ? moment(startedBefore).format(DATETIME_MAX) : null,
        startUserName,
        processDefinitionNameLike,
        processInstanceId,
        page: isEmpty(fields) ? {} : fields,
        startedBy: true,
        oldTotalElements: fields.total ? fields.total : '',
        ...others,
      },
    }).then((res) => {
      if (res && res.content && res.content.length > 0) {
        const processInstanceIds = Array.from(
          new Set(res.content.map((record) => record.procInstId).filter(Boolean))
        );
        dispatch({
          type: 'startByTask/queryPreviousInfo',
          payload: processInstanceIds,
        });
      }
    });
  }

  @Bind
  handleRevoke(record) {
    const {
      tenantId,
      dispatch,
      startByTask: { pagination = {} },
    } = this.props;
    ModalPro.open({
      title: intl.get('hwfp.startByTask.view.message.title.confirmBack').d(`确认撤回吗?`),
      closable: true,
      autoCenter: true,
      okFirst: true,
      children: (
        <div>
          <p>{intl.get('hwfp.task.view.message.backComment').d('撤销意见')}</p>
          <TextArea
            style={{ width: '100%' }}
            ref={(el) => {
              this.comment = el;
            }}
          />
        </div>
      ),
      onOk: () => {
        const params = {
          type: 'startByTask/taskRevoke',
          payload: {
            tenantId,
            id: record.encryptId,
            comment: this.comment && this.comment.value ? this.comment.value : '',
          },
        };
        dispatch(params).then((res) => {
          if (res) {
            notification.success();
            this.handleSearch(pagination);
          }
        });
      },
    });
  }

  @Bind
  handleRemind(record) {
    const {
      tenantId,
      dispatch,
      startByTask: { pagination = {} },
    } = this.props;
    dispatch({
      type: 'startByTask/beforeTaskRemind',
      payload: {
        tenantId,
        id: record.encryptId,
      },
    }).then((response) => {
      if (response && response.failed) {
        ModalPro.open({
          title: intl.get('hwfp.common.process.remind').d('流程催办'),
          closable: true,
          okCancel: true,
          destroyOnClose: true,
          children: response.message,
          footer: (okBtn) => okBtn,
          okText: intl.get('hwfp.common.hold.on').d('再等等'),
        });
      } else {
        ModalPro.confirm({
          title: intl.get('hwfp.common.process.remind').d('流程催办'),
          children: intl.get('hwfp.startByTask.view.message.title.confirmRemind').d(`确认催办吗?`),
          onOk: () => {
            const params = {
              type: 'startByTask/taskRemind',
              payload: {
                tenantId,
                id: record.encryptId,
              },
            };
            dispatch(params).then((res) => {
              if (res && res.failed) {
                ModalPro.open({
                  title: intl.get('hwfp.common.process.remind').d('流程催办'),
                  closable: true,
                  okCancel: true,
                  destroyOnClose: true,
                  children: res.message,
                  footer: (okBtn) => okBtn,
                  okText: intl.get('hzero.common.button.ok').d('确定'),
                });
              } else {
                notification.success();
                this.handleSearch(pagination);
              }
            });
          },
        });
      }
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      fetchListLoading,
      revokeLoading = false,
      remindLoading = false,
      startByTask: { list, pagination, processStatus = [] },
    } = this.props;
    const filterProps = {
      processStatus,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
      onExpandForm: this.handleExpandForm,
    };
    const listProps = {
      pagination,
      processStatus,
      dataSource: list,
      revokeLoading,
      remindLoading,
      loading: fetchListLoading,
      onChange: this.handleSearch,
      onRevoke: this.handleRevoke,
      onRemind: this.handleRemind,
      onRef: this.handleBindTableRef,
    };
    return (
      <>
        <Header title={intl.get('hwfp.startByTask.view.message.title').d('我发起的流程')} />
        <div className={styles.content}>
          <FilterForm {...filterProps} />
          <div className={styles.list}>
            <ListTable {...listProps} />
          </div>
        </div>
      </>
    );
  }
}
