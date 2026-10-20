/**
 * index.js 收货管理配置
 * @date: 2022-10-21
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import React, { useMemo, useEffect, useRef } from 'react';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';
import { connect } from 'dva';

import qs from 'querystring';
import intl from 'utils/intl';
import { compose, isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { Header, Content } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';
import { handleDelete } from '@/services/receiptManageConfigService';
import { deliveryLineDS, returnLineDS } from './store/lineDS';
import { formColumns, lineColumns } from './methods';

import FormModal from '../CreateComponent/index';

import styles from './index.less';

const DetailView = (props) => {
  const {
    match = {},
    receiptManageConfig = {},
    location: { search },
  } = props;
  const { params } = match;
  const { readOnly = false } = qs.parse(search.substr(1));
  const { createFormInfo = {} } = receiptManageConfig;

  const curRef = useRef(null);
  const deliveryLineDs = useMemo(() => new DataSet(deliveryLineDS()), []);
  const returnLineDs = useMemo(() => new DataSet(returnLineDS()), []);

  useEffect(() => {
    deliveryLineDs.setQueryParameter('params', {
      nodeConfigType: 1,
      nodeConfigId: params.id,
      asyncCountFlag: 'DEFAULT',
    });
    returnLineDs.setQueryParameter('params', {
      nodeConfigType: 0,
      nodeConfigId: params.id,
      asyncCountFlag: 'DEFAULT',
    });
    deliveryLineDs.query();
    returnLineDs.query();
  }, []);

  useEffect(() => {
    curRef.current.ds.loadData([createFormInfo]);
  }, [createFormInfo]);

  /**
   * 公用删除方法
   * @param {*} dataSet - 当前ds
   * @param {*} type
   */
  const handleDeleteLine = (dataSet, type) => {
    const lines = dataSet.selected.map((item) => item.toData()) || [];
    const id = type === 'node' ? 'mappingId' : 'reverseConfigId';
    const deleteFlag = lines.some((i) => i[id]);
    if (deleteFlag) {
      if (!isEmpty(lines)) {
        Modal.confirm({
          children: intl.get('sinv.receiptManage.view.message.delete').d('确认删除选中行？'),
          onOk: async () => {
            const res = getResponse(await handleDelete(lines, 'node'));
            if (res) {
              notification.success();
              //  dataSet.query(dataSet.currentPage).then(() => {
              //   dataSet.forEach((record) => {
              //      Object.assign(record, { workFlag: this.state.workFlag });
              //    });
              //  });
              //  if (type === 'line') {
              //    this.setState({ updateFlag: true });
              //  }
            }
          },
        });
      }
    } else {
      dataSet.remove(dataSet.selected);
    }
  };

  const LineBtn = observer(({ dataSet, type }) => {
    return (
      <>
        <Button
          icon="add"
          type="c7n-pro"
          funcType="flat"
          color="primary"
          onClick={() => dataSet.create({}, 0)}
        >
          {intl.get(`hzero.common.button.create`).d('新建')}
        </Button>
        <Button
          icon="delete"
          type="c7n-pro"
          funcType="flat"
          color="primary"
          disabled={isEmpty(dataSet.selected)}
          onClick={() => handleDeleteLine(dataSet, type)}
        >
          {intl.get(`hzero.common.button.delete`).d('删除')}
        </Button>
      </>
    );
  });
  const modalProps = {
    readOnly,
    column: 3,
    componentData: formColumns({ readOnly }),
  };
  return (
    <>
      <Header
        title={`${intl
          .get('sinv.receiptManage.view.title.nodeConfigurationMaintain')
          .d('业务节点配置维护')}`}
      >
        <DynamicButtons
          buttons={[
            {
              name: 'save',
              child: intl.get('hzero.common.button.save').d('保存'),
              btnProps: {
                color: 'primary',
                icon: 'save',
                type: 'c7n-pro',
                // loading: Loading,
                // onClick: () => handleAllList('affirm'),
              },
            },
          ]}
        />
      </Header>
      <div>
        <Content style={{ marginBottom: 8 }}>
          <div>
            <h3 className={styles['page-title']}>
              {intl.get(`sinv.receiptManage.view.title.receipHeaderInfo`).d('基础信息')}
            </h3>
          </div>
          <FormModal ref={curRef} {...modalProps} />
        </Content>
        <Content style={{ marginTop: 0, marginBottom: 8 }}>
          <div>
            <h3 className={styles['page-title']}>
              {intl.get(`sinv.receiptManage.view.title.deliveryLineInfo`).d('收货类型明细')}
            </h3>
          </div>
          <Table
            columns={lineColumns('node')}
            dataSet={deliveryLineDs}
            buttons={[<LineBtn dataSet={deliveryLineDs} type="node" />]}
          />
        </Content>
        <Content style={{ marginTop: 0, marginBottom: 8 }}>
          <div>
            <h3 className={styles['page-title']}>
              {intl.get(`sinv.receiptManage.view.title.returnLineInfo`).d('退货类型明细')}
            </h3>
          </div>
          <Table
            columns={lineColumns('return')}
            dataSet={returnLineDs}
            buttons={[<LineBtn dataSet={returnLineDs} type="return" />]}
          />
        </Content>
      </div>
    </>
  );
};

export default compose(
  connect(({ _, receiptManageConfig = {} }) => ({
    _,
    receiptManageConfig,
  }))
)(DetailView);
