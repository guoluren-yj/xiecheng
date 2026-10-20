/**
 *
 * @date: 2020/7/21
 * @author: zhanghao <hao.zhang07@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import React, { Fragment, useCallback, useState } from 'react';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import { isEmpty, compose } from 'lodash';
import { routerRedux } from 'dva/router';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import CommonImport from 'components/Import';
import { SRM_SSLM } from '_utils/config';
import ExcelExportPro from 'components/ExcelExportPro';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';
import { batchSubmit } from '@/services/EventRecordService';

import Ds from './store/indexDS';
import List from './List';

const organizationId = getCurrentOrganizationId();

const Index = ({ dataSet, customizeTable, dispatch = e => e }) => {
  const [loading, setLoading] = useState(false);
  /**
   * 新增按钮处理逻辑
   */
  const handleAdd = () => {
    dispatch(
      routerRedux.push({
        pathname: '/sslm/event-record/detail/create',
      })
    );
  };

  /**
   * 删除按钮处理逻辑
   */
  const handleDelete = useCallback(() => {
    if (dataSet.selected.length) {
      let flag = true; // 判断是否存在不能删除的数据标识
      dataSet.selected.forEach(record => {
        const eventStatus = record.get('eventStatus');
        if (eventStatus !== 'NEW' && eventStatus !== 'REJECTED') {
          flag = false;
        }
      });
      if (!flag) {
        notification.error({
          message: intl
            .get('sslm.eventRecord.view.message.validateDelete')
            .d('仅新建和审批拒绝状态允许删除！'),
        });
        return false;
      }
      return new Promise(resolve => {
        dataSet
          .delete(dataSet.selected)
          .then(() => {
            dataSet.query();
          })
          .finally(() => resolve());
      });
    } else {
      notification.warning({
        message: intl.get('hzero.common.notification.warning').d('请先勾选一条数据'),
      });
    }
  }, [dataSet]);

  /**
   * 批量提交按钮处理逻辑
   */
  const handleBatchSubmit = useCallback(() => {
    if (!isEmpty(dataSet.selected)) {
      let flag = true; // 判断是否存在不能删除的数据标识
      dataSet.selected.forEach(record => {
        const eventStatus = record.get('eventStatus');
        if (!['NEW', 'REJECTED'].includes(eventStatus)) {
          flag = false;
        }
      });
      if (!flag) {
        notification.error({
          message: intl
            .get('sslm.eventRecord.view.message.validateSubmit')
            .d('仅新建和审批拒绝状态允许提交！'),
        });
        return false;
      }
      const evalEventHeaderIds = dataSet.selected.map(record => record.toData().evalEventHeaderId);
      Modal.confirm({
        // title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl.get('hzero.common.message.confirm.submit').d('是否确认提交?'),
        onOk: () => {
          return new Promise(resolve => {
            setLoading(true);
            const params = {
              evalEventHeaderIds,
            };
            batchSubmit(params)
              .then(response => {
                const res = getResponse(response);
                if (res) {
                  notification.success();
                }
              })
              .finally(async () => {
                await dataSet.query(dataSet.currentPage, {}, false);
                resolve();
                setLoading(false);
              });
          });
        },
      });
    } else {
      notification.warning({
        message: intl.get('hzero.common.notification.warning').d('请先勾选一条数据'),
      });
    }
  }, [dataSet]);

  // 导出参数
  const handleParams = useCallback(() => {
    const queryData = dataSet.queryDataSet?.current?.toData();

    const queryParams = filterNullValueObject(queryData);
    const { __dirty, ...others } = queryParams;
    return {
      ...others,
    };
  }, []);

  return (
    <Fragment>
      <Header title={intl.get('sslm.eventRecord.view.message.title.main').d('考评事件维护')}>
        <Button color="primary" icon="add" onClick={handleAdd} loading={loading}>
          {intl.get('hzero.common.button.add').d('新增')}
        </Button>
        <Button icon="check" onClick={handleBatchSubmit} funcType="flat" loading={loading}>
          {intl.get('hzero.common.button.batchSubmit').d('批量提交')}
        </Button>
        <Button
          icon="delete"
          onClick={handleDelete}
          funcType="flat"
          wait={500}
          waitType="debounce"
          loading={loading}
        >
          {intl.get('hzero.common.button.delete').d('删除')}
        </Button>
        <CommonImport
          data-name="commonImport"
          businessObjectTemplateCode="SSLM_BATCH_EVAL_EVENT_HEADER_IMPORT"
          prefixPatch={SRM_SSLM}
          refreshButton
          buttonText={intl.get('hzero.common.button.newBatchImport').d('(新)批量导入')}
          successCallBack={() => {
            dataSet.query();
          }}
          buttonProps={{
            funcType: 'flat',
          }}
        />
        <ExcelExportPro
          requestUrl={`${SRM_SSLM}/v1/${organizationId}/eval-event-header/export`}
          queryParams={() => handleParams()}
          templateCode="SRM_C_SRM_SSLM_EVAL_EVENT_HEADER_EXPORT"
          buttonText={intl.get('hzero.common.button.newExport').d('(新)导出')}
          otherButtonProps={{
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
          }}
        />
      </Header>
      <Content>
        <List dataSet={dataSet} dispatch={dispatch} customizeTable={customizeTable} />
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.eventRecord', 'hzero.common'],
  }),
  withCustomize({
    unitCode: ['SSLM.EVALUATION_EVENT_RECORD.LIST.LIST_TABLE'],
  }),
  withProps(
    () => {
      const dataSet = new DataSet(Ds());
      return { dataSet };
    },
    { cacheState: true }
  )
)(Index);
