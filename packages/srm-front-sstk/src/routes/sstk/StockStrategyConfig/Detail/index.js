import React, { useMemo, useEffect, useState } from 'react';
import qs from 'querystring';
import { flowRight } from 'lodash';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';

import { HeadButton } from '@/components/CommonButtons';
import { openStockTimelineRecord } from '@/utils/drawer/commonDrawer';
import { strategyRecordRender } from '@/utils/record/recordRender';
import SubContent from '../../components/SubContent';
import BaseInfo from './BaseInfo';
import BatchConfig from './BatchConfig';
import ItemRange from './ItemRange';
import { initStore, handleSave } from './func';
import { fetchStrategyDetail } from '../api';

import styles from './index.less';

function StrategyDetail(props) {
  const {
    location: { search = '' },
    match: { params = {} },
    history: { push },
  } = props;
  const { strategyId } = qs.parse(search.substr(1));
  const [{
    statusCode,
    strategyId: _strategyId,
  }, setInfo] = useState({ statusCode: '', strategyId });

  const [readOnly, setReadOnly] = useState(params.status === 'read');

  const title = readOnly ?
    intl.get('sstk.stockConfig.view.title.stockStrategyDetail').d('查看批次')
    : _strategyId
      ? intl.get('sstk.stockConfig.view.title.editStockStrategy').d('编辑批次')
      : intl.get('sstk.stockConfig.view.title.newStockStrategy').d('新建批次');
  const dsMap = initStore(_strategyId, readOnly);
  const {
    baseInfoDs,
    batchLineDs,
    itemRangeDs,
  } = dsMap;

  useEffect(() => {
    if (_strategyId) {
      init();
    }
  }, [_strategyId, readOnly]);

  const maxVersionFlag = baseInfoDs.current.get('maxVersionFlag');

  const init = async (id) => {
    const res = getResponse(await fetchStrategyDetail(_strategyId || id));
    if (res) {
      const { lines, statusCode: _code, strategyId: _id } = res || {};
      baseInfoDs.loadData([res]);
      setInfo({ statusCode: _code, strategyId: _id });
      batchLineDs.loadData(lines || []);
      itemRangeDs.query(itemRangeDs.currentPage);
    }
  };

  const contents = useMemo(() => {
    return [
      {
        key: 'base-info',
        title: intl.get('sstk.stockConfig.view.title.baseInfo').d('基础信息'),
        comp: BaseInfo,
        props: {
          readOnly,
          dataSet: baseInfoDs,
        },
      },
      {
        key: 'batch-config',
        title: intl.get('sstk.stockConfig.view.batchConfig').d('批次维度'),
        comp: BatchConfig,
        props: {
          readOnly,
          baseInfoDs,
          batchLineDs,
        },
      },
      {
        key: 'item-range',
        show: _strategyId,
        title: intl.get('sstk.stockConfig.view.itemRange').d('物料范围'),
        comp: ItemRange,
        props: {
          itemRangeDs,
          readOnly,
          strategyId: _strategyId,
        },
      },
    ].filter(f => f.show || !('show' in f));
  }, [_strategyId, readOnly]);

  const headerBtns = useMemo(() => {
    const btns = [
      {
        show: _strategyId && statusCode === 'NEW' && maxVersionFlag,
        comp: (
          <HeadButton
            name="publish"
            icon="publish2"
            color="primary"
            bindBtn={['save']}
            dataSet={baseInfoDs}
            onClick={() => handleSave(dsMap, 'publish', () => push('/sstk/stock-strategy-config/list'))}
          >
            {intl.get('sstk.stockConfig.button.publish').d('发布')}
          </HeadButton>
        ),
      },
      {
        show: _strategyId && statusCode === 'RELEASED',
        comp: (
          <HeadButton
            name="cancel"
            icon="cancel"
            funcType='flat'
            dataSet={baseInfoDs}
            onClick={() => handleSave(dsMap, 'unPublish', init)}
          >
            {intl.get('sstk.stockConfig.button.publishCancel').d('取消发布')}
          </HeadButton>
        ),
      },
      {
        show: _strategyId && readOnly && statusCode !== 'RELEASED' && maxVersionFlag,
        comp: (
          <HeadButton
            name="edit"
            icon="mode_edit"
            funcType='flat'
            onClick={() => {
              setReadOnly(false);
            }}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </HeadButton>
        ),
      },
      {
        show: !readOnly && (!_strategyId || (statusCode === 'NEW' && maxVersionFlag)),
        comp: (
          <HeadButton
            name="save"
            icon="save"
            funcType="flat"
            bindBtn={['publish']}
            dataSet={baseInfoDs}
            onClick={() => handleSave(dsMap, 'save', (res) => {
              if (_strategyId) {
                init(res.strategyId);
              }
              else {
                push(`/sstk/stock-strategy-config/detail/edit?strategyId=${res.strategyId}`);
                setInfo({ statusCode: res.statusCode, strategyId: res.strategyId });
              }
            })}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </HeadButton>
        ),
      },
      {
        show: _strategyId,
        comp: (
          <HeadButton
            name="operateRecord"
            icon="operation_service_request"
            funcType="flat"
            onClick={() => openStockTimelineRecord(_strategyId, baseInfoDs.current.get('strategyName'), strategyRecordRender)}
          >
            {intl.get('hzero.common.button.operating').d('操作记录')}
          </HeadButton>
        ),
      },
    ];
    return btns;
  }, [readOnly, statusCode, _strategyId, maxVersionFlag]);
  return (
    <>
      <Header title={title} backPath='/sstk/stock-strategy-config/list'>
        {
          headerBtns.filter((f) => f.show || !('show' in f)).map((m) => m.comp)
        }
      </Header>
      <Content className={styles['stock-strategy-detail']}>
        {contents.map((m, idx) => (
          <SubContent
            title={m.title}
            id={m.key}
            hasTip={m.key === 'batch-config'}
            showDivide={!!idx}
          >
            {m.comp ? <m.comp {...m.props} /> : m.title}
          </SubContent>
        ))}
      </Content>
    </>
  );
}

export default flowRight(
  formatterCollections({
    code: ['hzero.common', 'sstk.stockConfig', 'smpc.product', 'sagm.common'],
  }),
  observer,
)(StrategyDetail);