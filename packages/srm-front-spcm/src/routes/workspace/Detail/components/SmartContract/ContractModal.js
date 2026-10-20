/**
 * index.js - 智能摘要
 * @date: 2022-03-22
 * @author: CDJ
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import classnames from 'classnames';

import { RichText, Icon, Modal, Spin, Form, Output } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { getSmartContractByTaskId } from '@/services/workspaceService';
import { ReactComponent as IntelExtract } from '@/assets/intel_extract.svg';
import { hanldeMdToHtml } from './utils/utils';

import styles from './index.less';

const ContractModal = observer(
  ({ dataSet, isEdit = false, showMaskFlag = false, pcHeaderId } = {}) => {
    const smartAbstractTimer = useRef(null);
    const taskId = useMemo(() => dataSet.getState('taskId'), [dataSet.getState('taskId')]);
    const [maskFlag, setMaskFlag] = useState(showMaskFlag);

    useEffect(() => {
      handleSmartAbstract();
      return () => {
        clearAbstractTimer();
      };
    }, [taskId, pcHeaderId]);

    // 处理合同摘要
    const handleSmartAbstract = () => {
      if (taskId) {
        setMaskFlag(true);
        getSmartAbstractByTaskId();
      }
    };

    // 通过 taskId获取 合同摘要
    const getSmartAbstractByTaskId = () => {
      clearAbstractTimer();
      if (!taskId) {
        return;
      }
      smartAbstractTimer.current = setInterval(() => {
        getSmartContractByTaskId({ taskId }).then((res) => {
          if (getResponse(res)) {
            const {
              contractAbstract = '',
              smartTaskFetchFlag,
              abstractDate = '',
              objectVersionNumber,
            } = res;
            // 成功获取智能摘要
            if (Number(smartTaskFetchFlag) === 1) {
              let formatAbstract = contractAbstract;
              // 重新提取的时候格式是md格式，需要转成html格式
              if (contractAbstract) {
                const result = hanldeMdToHtml(contractAbstract);
                formatAbstract = result === false ? contractAbstract : result;
              }
              // 刷新头信息标识
              dataSet.setState({ refresHeaderFlag: true });
              const data = {
                contractAbstract: formatAbstract,
                abstractDate,
                objectVersionNumber,
              };
              if (dataSet.current) {
                dataSet.current.set(data);
              } else {
                dataSet.create(data, 0);
              }
              setMaskFlag(false);
              clearAbstractTimer();
            }
          } else {
            setMaskFlag(false);
            clearAbstractTimer();
          }
        });
      }, 2000);
    };

    const clearAbstractTimer = useCallback(() => {
      if (smartAbstractTimer.current) {
        clearInterval(smartAbstractTimer.current);
      }
    }, []);

    // 全屏
    const handleFullScreenClick = () => {
      Modal.open({
        key: Modal.key(),
        movable: false,
        title: intl.get('spcm.common.view.title.smartContract').d('智能摘要'),
        children: (
          <RichText
            dataSet={dataSet}
            name="contractAbstract"
            style={{ height: '100%' }}
            // mode={isEdit ? 'editor' : 'preview'}
            toolbar={(params = {}) => renderCustomToolbar({ showFullScreen: false, ...params })}
          />
        ),
        cancelButton: false,
        fullScreen: true,
      });
    };

    // 工具条
    const renderCustomToolbar = useCallback(
      (params = {}) => {
        const { id, showFullScreen = true } = params;
        return (
          <div id={id}>
            {showFullScreen && (
              <button
                type="button"
                className="ql-fullScreen"
                style={{ outline: 'none' }}
                onClick={handleFullScreenClick}
              >
                <Icon type="zoom_out_map" style={{ marginTop: -5 }} />
              </button>
            )}
            <select className="ql-size" />
            <button type="button" className="ql-bold" />
            <button type="button" className="ql-italic" />
            <button type="button" className="ql-underline" />
            <button type="button" className="ql-strike" />
            {/* 暂时不需要 */}
            {/* <button type="button" className="ql-blockquote" />
        <button type="button" className="ql-list" value="ordered" />
        <button type="button" className="ql-list" value="bullet" />
        <button type="button" className="ql-image" />
        <button type="button" className="ql-link" /> */}
            <select className="ql-color" />
          </div>
        );
      },
      [isEdit]
    );

    return (
      <div className={styles['spcm-smart-contract-wrap']}>
        {!maskFlag ? (
          <>
            <div className={styles['spcm-smart-contract-wrap-generationTime']}>
              <Form columns={1} dataSet={dataSet} labelAlign="left">
                <Output name="abstractDate" />
              </Form>
            </div>
            <div
              className={classnames(styles['spcm-smart-contract-wrap-content'], {
                [styles['hidden-ql-toolbar']]: !isEdit,
              })}
            >
              <RichText
                dataSet={dataSet}
                name="contractAbstract"
                style={{ height: '100%' }}
                // mode是preview不支持html格式的内容，这里取默认的editor，通过ds的disabled来控制
                // mode={isEdit ? 'editor' : 'preview'}
                toolbar={renderCustomToolbar}
              />
            </div>
          </>
        ) : (
          <div>
            <div className={styles['spcm-smart-contract-wrap-svg']}>
              <Spin>
                <IntelExtract />
              </Spin>
            </div>
            <div className={styles['spcm-smart-contract-wrap-loading']}>
              <p className={styles['spcm-smart-contract-wrap-loadingText']}>
                {intl.get('spcm.common.view.title.generateAbstract').d('正在生成摘要')}
              </p>
              {/* <a>{intl.get('hzero.common.button.cancel').d('取消')}</a> */}
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default ContractModal;
