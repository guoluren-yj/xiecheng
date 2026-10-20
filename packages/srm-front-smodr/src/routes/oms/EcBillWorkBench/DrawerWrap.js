import React, { useEffect, useState, useMemo } from 'react';
import { Button, TextField, Icon, DataSet } from 'choerodon-ui/pro';
import classNames from 'classnames';
import { Timeline, Spin } from 'choerodon-ui';

import { getResponse } from 'utils/utils';
import c7nModal from '@/utils/c7nModal';
import intl from 'utils/intl';
import { queryUnifyIdpValue } from 'services/api';
import { fetchEcRecord } from '@/services/oms/ecBillService';
import SelectFilter from '@/routes/components/SelectFilter';
import LogModal from './LogModal';
import styles from './drawer.less';

function DrawerWrap(props) {
  const { recordData } = props;
  const [data, setData] = useState([]);
  const [value, setValue] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [query, setQuery] = useState({ supplier: recordData.get('supplier') });

  useEffect(() => {
    initData(query);
    fetchList();
  }, []);

  async function fetchList() {
    const res = getResponse(await queryUnifyIdpValue('SMOP.EC_INTERFACE_NAME'));
    if (res && res.length > 0) {
      const newRes = res.map((i) => ({ title: i.meaning, value: i.value, key: i.orderSeq }));
      setList(newRes);
    }
  }

  const ds = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [{ name: 'status' }, { name: 'requestName', lookupCode: 'SMOP.EC_INTERFACE_NAME' }],
      }),
    []
  );

  async function initData(params) {
    setLoading(true);
    const res = getResponse(await fetchEcRecord({ id: recordData?.get('id'), ...params }));
    if (res) {
      setData(res);
      setLoading(false);
    }
  }

  function selectParam(params, type) {
    setQuery({ ...query, [type]: params });
    initData({ ...query, [type]: params });
  }

  function handleLog(item = {}) {
    const draw = c7nModal({
      title: intl.get('smodr.ecBill.view.log').d('日志'),
      children: <LogModal data={item} />,
      style: { width: 742 },
      footer: (
        <Button color="primary" onClick={() => draw?.close()}>
          {intl.get('smodr.ecBill.view.close').d('关闭')}
        </Button>
      ),
    });
  }

  const lineColor = (i) => {
    if (i.status) {
      return '#47B883';
    } else {
      return '#F56649';
    }
  };

  const handleChange = (val) => {
    setValue(val);
    setQuery({ ...query, thirdOrderId: val });
    initData({ ...query, thirdOrderId: val });
  };

  const flagList = [
    { title: intl.get('hzero.common.button.success').d('成功'), value: true, key: 1 },
    { title: intl.get('hzero.common.button.fail').d('失败'), value: false, key: 0 },
  ];

  return (
    <div className={styles['draw-wrapper']}>
      <div style={{ display: 'flex' }}>
        <TextField
          style={{
            width: '280px',
            marginBottom: '19px',
            display: 'inline-block',
            marginRight: '16px',
          }}
          value={value}
          valueChangeAction="blur"
          // multiple
          prefix={<Icon type="search" />}
          placeholder={intl.get('smodr.ecBill.view.queryTips').d('输入子订单号查询')}
          clearButton
          onChange={handleChange}
        />
        <SelectFilter
          dataSet={ds}
          filterName="status"
          title={intl.get('smodr.ecBill.view.status').d('状态')}
          selectList={flagList}
          onSearch={(val) => selectParam(val, 'status')}
        />
        <SelectFilter
          dataSet={ds}
          filterName="requestName"
          selectList={list}
          onSearch={(val) => selectParam(val, 'requestName')}
          title={intl.get('smodr.ecBill.view.requestName').d('接口名称')}
        />
      </div>
      <Spin spinning={loading}>
        <Timeline>
          {data.map((i) => {
            return (
              <Timeline.Item color={lineColor(i)}>
                <div className="item-line">
                  <span
                    className={classNames({ 'item-tag': true, green: !!i.status, red: !i.status })}
                  >
                    {i.status
                      ? intl.get('smodr.ecBill.view.success').d('成功')
                      : intl.get('smodr.ecBill.view.failed').d('失败')}
                  </span>
                  <span className="item-requestName">{i.requestName}</span>
                  <Button
                    style={{ color: '#29BECE', fontWeight: 600, height: '24px' }}
                    funcType="flat"
                    icon="chrome_reader_mode"
                    onClick={() => handleLog(i)}
                  >
                    {intl.get('smodr.ecBill.view.log').d('日志')}
                  </Button>
                </div>
                {!i.status && (
                  <div className="item-info">
                    <div className="item-align">
                      <span>{intl.get('smodr.ecBill.view.thirdId').d('子订单号')}：</span>
                      <span className="label">{i.thirdOrderId || '-'}</span>
                    </div>
                    <div className="item-align">
                      <span>{intl.get('smodr.ecBill.view.errorDeal').d('异常处理')}：</span>
                      <span className="label">{i.errorHandle || '-'}</span>
                    </div>
                    <div className="item-align">
                      <span>{intl.get('smodr.ecBill.view.errorMsg').d('异常原因')}：</span>
                      <span className="label">{i.errorMsg || '-'}</span>
                    </div>
                  </div>
                )}
                <div className="item-time">{i.requestTime}</div>
              </Timeline.Item>
            );
          })}
        </Timeline>
      </Spin>
    </div>
  );
}

export default DrawerWrap;
