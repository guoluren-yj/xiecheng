import React, { Fragment, useMemo, useEffect, useState, useRef } from 'react';
import { Form, TextField, DataSet, Icon, Modal, Spin } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { TabsPosition } from 'choerodon-ui/lib/tabs/enum';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { getSearchCustomizer } from '@/services/roleWorkbenchService';
import SynthesesTable from './components/SynthesesTable';
import { SearchDS, synthesesHeaderDS } from './stores';

import styles from '../card.less';

const { TabPane } = Tabs;
/**
 *
 * @param {*} props
 * @returns
 * @total --单据总数量
 * @textValue --value值
 * @id --唯一key
 * @historyRecord --历史记录
 * @localStorage --getItem取
 * @localStorage --setItem存
 * @localStorage --removeItem删除指定的key
 * @new Date().getTime() :返回从 1970 年 1 月 1 日午夜到指定日期之间的毫秒数。
 */
const DraftModal = (props) => {
  const inputRef = useRef(null);
  const modalRef = useRef('');
  const { width = 956, modal, currentCarousel } = props;
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentData, setCurrentData] = useState([]);
  const [documentType, setDocumentType] = useState([]);
  const [customizerCode, setCustomizerCode] = useState('');
  const searchDs = useMemo(() => new DataSet(SearchDS()), []);
  const searchHeaderDs = useMemo(() => new DataSet(synthesesHeaderDS(currentCarousel)), [currentCarousel]);
  // 回车查询条件
  const paramsKeyword = searchDs.current?.get('keyword') || '';
  /**
   * 更新单据弹窗详情
   * @param {*} modalObj
   * @returns
   */
  const openModal = (modalObj) => {
    if (modalRef.current) {
      modalRef.current.update(modalObj);
      return;
    }
    modalRef.current = Modal.open(modalObj);
  };
  useEffect(() => {
    synthesesQuery();
    c7nInputFocus();
  }, []);
  /**
   * 自动focus
   */
  const c7nInputFocus = () => {
    setTimeout(() => {
      inputRef.current.focus();
    }, 50);
  };
  /**
   * 综合
   * @totalElements --综合总数量
   * @esDocResponseResultDTO --
   * @esDocDataList --综合单据类型
   */
  const synthesesQuery = () => {
    searchHeaderDs
      .query()
      .then((res) => {
        if (getResponse(res)) {
          const { esDocDataList, totalElements } = res || {};
          setDocumentType(esDocDataList);
          setTotal(totalElements);
          setCurrentData(res.content);
          searchCustomizer(esDocDataList[0].docTypeCode);
        }
      })
      .finally(() => setLoading(false));
  };

  /**
   *@keyword --查询条件
   *
   */

  const handleOnEnterDown = (e) => {
    const value = e?.target?.value?.trim();
    handleQuery(null, value);
  };
  /**
   * @param {*} value
   */
  const handleQuery = (key, value, code, size) => {
    const params = {
      size,
      docType: key,
      keyword: value,
      customizeUnitCode: isEmpty(customizerCode) ? null : code || customizerCode,
    };
    searchHeaderDs.setQueryParameter('params', params);
    searchHeaderDs.query();
  };
  /**
   * 分页查询
   * @param {*} page
   * @param {*} pageSize
   */
  const changePagination = (page, pageSize) => {
    // handleQuery(null, paramsKeyword, null, pageSize);
    searchHeaderDs.setQueryParameter('size', pageSize);
    searchHeaderDs.query();
  };
  /**
   * tab页切换
   * @param {*} key
   */
  const handleTabChange = async (key) => {
    let code = '';
    code = await searchCustomizer(key);
    handleQuery(key, paramsKeyword, code);
    c7nInputFocus();
  };

  /**
   * 清空查询参数
   */
  const handleClaer = () => {
    searchDs.current.reset();
    handleQuery(null, null);
    c7nInputFocus();
  };
  /**
   * 单据类型个性化
   */
  const searchCustomizer = async (value) => {
    getSearchCustomizer({ combineCode: value }).then((res) => {
      if (res) {
        setCustomizerCode(res);
        try {
          if (res === undefined) return '';
          const errorResult = JSON.parse(res);
          getResponse(errorResult);
          if (errorResult.failed) {
            return errorResult;
          } else {
            return String(res);
          }
        } catch {
          if (isEmpty(res)) {
            return '';
          } else {
            return String(res);
          }
        }
      }
    });
  };
  const formationProps = {
    total,
    searchDs,
    modalRef,
    modal,
    searchHeaderDs,
    documentType,
    currentData,
    paramsKeyword,
    customizerCode,
    openModal,
    changePagination,
  };
  return (
    <Fragment>
      <Form dataSet={searchDs} labelLayout="placeholder" labelWidth={width} className={styles['super-form']}>
        <TextField
          ref={inputRef}
          onEnterDown={handleOnEnterDown}
          prefix={<Icon type="search" />}
          name="keyword"
          suffix={
            <span className={styles['super-input']} onClick={handleClaer}>
              {isEmpty(paramsKeyword) ? null : intl.get('srm.common.view.title.cleanUp').d('清除')}
            </span>
          }
        />
      </Form>
      <Spin spinning={loading}>
        <Tabs className={styles['super-tabs-list']} tabPosition={TabsPosition.top} onChange={handleTabChange}>
          {documentType.map((i) => {
            return (
              <TabPane tab={i.docTypeName} key={i.docTypeCode} count={() => i.totalElements}>
                <SynthesesTable {...formationProps} />
              </TabPane>
            );
          })}
        </Tabs>
      </Spin>
    </Fragment>
  );
};
export default observer(DraftModal);
