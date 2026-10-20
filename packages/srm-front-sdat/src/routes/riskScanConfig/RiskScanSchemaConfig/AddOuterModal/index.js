import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { Row, Col, Button, TextArea, Tooltip, CheckBox } from 'choerodon-ui/pro';
import { Icon, notification } from 'choerodon-ui';

import { fetchMatchBusiness } from '@/services/riskScanConfig/schemaConfigService';

import styles from './index.less';

const noResult = require('@/assets/noResult.svg');

let inputCompany = '';
let checkedList = [];

export default function AddOuterModal({ localId, onSelectList = () => {} }) {
  const [matchList, setMatchList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCheckAll, setCheckAll] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    setRefresh(false);
  }, [refresh]);

  useEffect(() => {
    const str1 = intl
      .get('sdat.riskScanConfig.view.message.addBusinessStr1')
      .d('请批量输入企业名称或简称查询，系统将自动匹配对应企业；多个企业请换行输入');
    const str2 = intl.get('sdat.riskScanConfig.view.message.eg').d('例:');
    const str3 = intl.get('sdat.riskScanConfig.view.message.zhenyun').d('上海甄云信息科技有限公司');
    const str4 = intl
      .get('sdat.riskScanConfig.view.message.hand')
      .d('上海汉得信息技术股份有限公司');

    const placeHolder = `${str1}\n\n${str2} \n${str3}\n${str4}\n`;

    const dom = document.getElementById('monitor-business-textarea-left');

    if (dom) {
      dom.setAttribute('placeholder', placeHolder);
    }
  }, []);

  const handleInputCompany = (e) => {
    inputCompany = e.target.value.trim();
    setRefresh(true);
  };

  /**
   * 对象数组去重
   */
  const uniqueList = (arr) => {
    const result = [];
    const obj = {};
    for (let i = 0; i < arr.length; i++) {
      if (!obj[arr[i].creditCode]) {
        result.push(arr[i]);
        obj[arr[i].creditCode] = true;
      }
    }
    return result;
  };

  /**
   * 全选操作
   * @param {*} e
   */
  const handleChangeCheckAll = (e) => {
    setCheckAll(e);
    checkedList = []; // 置空
    if (e) {
      // 全选
      matchList.forEach((item) => {
        if (!item.monitorFlag) {
          checkedList.push(item);
        }
      });
    }

    if (onSelectList && typeof onSelectList === 'function') {
      onSelectList(checkedList);
    }
    setRefresh(true);
  };

  /**
   * 查询企业列表
   */
  const handleQueryCompany = () => {
    const companyList = inputCompany?.trim()?.split(/\n/) ?? [];
    if (companyList.length + matchList.length <= 20) {
      setLoading(true);
      fetchMatchBusiness(companyList, { riskPlanId: localId }).then((res) => {
        setLoading(false);
        if (!res.failed) {
          if (res.length) {
            setCheckAll(false);
          }
          checkedList = [];
          const pushArr = [...matchList, ...(res || [])];
          const uniqueData = uniqueList(pushArr);
          const dealSwData = uniqueData.map((item) => {
            const { searchWord } = item;
            // eslint-disable-next-line no-useless-escape
            const reg = /\[?([^\[\]]+)\]?/;
            if (reg.test(searchWord)) {
              return { ...item, searchWord: reg.exec(searchWord)[1] };
            } else return { ...item };
          });
          const failedList = dealSwData.filter((item) => !item?.successFlag);
          const successList = dealSwData.filter((item) => item?.successFlag);
          setMatchList([...successList]);
          if (failedList.length) {
            notification.info({
              message: intl.get('sdat.monitorBusiness.view.message.querySelectMuchFailed', {
                length: failedList.length,
                failedNameMsg: failedList.map((item) => `【${item.searchWord}】`).join(','),
              }),
            });
          }
          inputCompany = '';
          setRefresh(true);
        } else {
          notification.error({
            message: res?.message ?? res?.msg ?? '',
          });
        }
      });
    } else {
      notification.error({
        message: intl
          .get('sdat.riskScanConfig.view.message.querySelectMuch')
          .d('（待匹配企业总数+已匹配企业数）不得超过20家'),
      });
    }
  };

  /**
   * 取消选择企业
   */
  const handleRemoveBusiness = (item) => {
    const list = [].concat(matchList);
    if (list.length) {
      list.forEach((result, index) => {
        if (result.creditCode === item.creditCode) {
          list.splice(index, 1);
        }
      });
    }

    setMatchList(list);
    inputCompany = `${inputCompany}${item.searchWord}\n`;
    setRefresh(true);
  };

  /**
   * 切换对应的选择状态
   * @param {*} e
   * @param {*} item
   */
  const handleChangeCheckBox = (e, item) => {
    if (e) {
      checkedList.push(item);
    } else {
      const index = checkedList.findIndex((check) => check.creditCode === item.creditCode);
      checkedList.splice(index, 1);
    }
    if (onSelectList && typeof onSelectList === 'function') {
      onSelectList(checkedList);
    }
    setCheckAll(checkedList.length === matchList.length);
    setRefresh(true);
  };

  /**
   * 渲染匹配结果列表
   */
  const drowSelectList = () => {
    return (matchList || []).map((item) => {
      return (
        <div style={{ marginBottom: '16px' }} key={item.creditCode}>
          <CheckBox
            key={item.creditCode}
            value={item.creditCode}
            checked={checkedList.findIndex((check) => check.creditCode === item.creditCode) !== -1}
            disabled={item.monitorFlag}
            onChange={(e) => handleChangeCheckBox(e, item)}
          >
            {item.name}
          </CheckBox>
          {item.monitorFlag && (
            <span
              style={{
                color: '#4E5769',
                border: '1px solid rgba(201,205,212,1)',
                borderRadius: '2px',
                padding: '2px 4px',
                background: '#F2F3F5',
              }}
            >
              {intl.get('sdat.riskScanConfig.view.title.hadAdded').d('已添加')}
            </span>
          )}

          <Tooltip
            title={intl.get('sdat.riskScanConfig.view.title.removeResult').d('从结果中移除')}
          >
            <Icon
              type="close"
              style={{ cursor: 'pointer', float: 'right' }}
              onClick={() => handleRemoveBusiness(item)}
            />
          </Tooltip>
        </div>
      );
    });
  };

  return (
    <div>
      <Row className={styles['add-business-modal']}>
        <Col span={11}>
          <div className={styles['add-business-modal-left-panel']}>
            <div className={styles['add-business-modal-panel-title']}>
              {intl.get('sdat.riskScanConfig.view.title.textPasteAdded').d('文本粘贴添加')}
            </div>
            <div style={{ height: 'calc(100vh - 288px)', overflow: 'hidden', overflowY: 'scroll' }}>
              <TextArea
                id="monitor-business-textarea-left"
                value={inputCompany}
                cols={200}
                autoSize
                onInput={handleInputCompany}
              />
            </div>
          </div>
        </Col>
        <Col span={2}>
          <div className={styles['add-business-modal-center-panel']}>
            <Tooltip
              title={intl.get('sdat.riskScanConfig.view.title.searchBusiness').d('查询企业')}
            >
              <Button
                loading={loading}
                tooltip="none"
                color="primary"
                disabled={!inputCompany}
                onClick={handleQueryCompany}
                style={{ height: '48px' }}
              >
                {' '}
                &gt;{' '}
              </Button>
            </Tooltip>
          </div>
        </Col>
        <Col span={11}>
          <div className={styles['add-business-modal-right-panel']}>
            <div className={styles['add-business-modal-panel-title']}>
              <span>{intl.get('sdat.riskScanConfig.view.title.matchResult').d('匹配结果')}</span>
              &nbsp;&nbsp;
              <span>{checkedList?.length ?? 0}/20</span>
              <span style={{ float: 'right' }}>
                <CheckBox checked={isCheckAll} onChange={handleChangeCheckAll}>
                  {intl.get('sdat.riskScanConfig.view.button.selectedAll').d('全选')}
                </CheckBox>
              </span>
            </div>
            {matchList.length ? (
              <div className={styles['list-container-box']}>{drowSelectList()}</div>
            ) : (
              <div>
                <div
                  style={{
                    width: '40px',
                    height: '45px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '0 auto',
                    marginTop: '200px',
                  }}
                >
                  <img src={noResult} style={{ width: '38px' }} alt="noResult" />
                </div>
                <div style={{ textAlign: 'center', marginTop: '10px', color: '#999' }}>
                  {intl.get('sdat.riskScanConfig.view.message.notDataFound').d('暂无匹配结果')}
                </div>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}
