import React, { useState, useEffect, useCallback } from 'react';
import { DataSet, Tree, Tooltip, Button, Modal, TextField } from 'choerodon-ui/pro';
import { Icon } from 'hzero-ui';
import { Header, Content } from 'components/Page';
import scrollIntoView from 'scroll-into-view-if-needed';
import { isString } from 'lodash';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getDocumentMarkDown } from '@/services/objectHelpManualService';
import ActionImg from '@/assets/action.png';
import { getDocFlowPermissionDs, getQueryFormDs } from './store/objectHelpManualDs';
import MarkdownPreview from './MarkdownPreview/index.tsx';
import SearchMD from './SearchMD';
import style from './index.less';
// 帮助手册默认打开的md的key
const objectDefaultKey = '1.1';

function ObjectHelpManual(props = {}) {
  const { valueData, queryFormDs } = props;
  const [tableVisible, handleTableVisible] = useState(true);
  const [menuFlag, handleMenuFlag] = useState(true);
  const [selectKey, handleSelectKey] = useState('');
  const [searchFlag, handleSearchFlag] = useState(true);
  const [source, handleSource] = useState('');
  const [currentKey, handleCurrentKey] = useState('');

  const witchMenu = (key) => {
    if (isString(key)) {
      handleCurrentKey(key);
      getDocumentMarkDown(key).then((res) => {
        if (res) {
          handleSource(res);
          handleTableVisible(true);
        } else {
          handleTableVisible(false);
        }
      });
    }
  };

  const openSearchModal = () => {
    const searchContent = queryFormDs?.current?.get('searchContent');
    if (searchContent) {
      const searchModal = Modal.open({
        key: 'searchModalkey',
        children: (
          <SearchMD
            queryFormDs={queryFormDs}
            closeModal={() => searchModal.close()}
            handleSelectKey={handleSelectKey}
            witchMenu={witchMenu}
          />
        ),
        drawer: true,
        maskClosable: true,
        footer: null,
        closable: true,
        destroyOnClose: true,
        bodyStyle: {
          width: '100%',
          height: 'calc(100% - 60px)',
          padding: '0 24px',
        },
        onClose: () => {
          handleSearchFlag(true);
          queryFormDs.reset();
        },
      });
    }
  };

  useEffect(() => {
    getDocumentMarkDown(objectDefaultKey).then((res) => {
      if (res) {
        handleSource(res);
        handleTableVisible(true);
      } else {
        handleTableVisible(false);
      }
    });
  }, []);

  const nodeCover = useCallback(
    ({ record }) => {
      // 搜索结果跳转，自动打开树结构，并初始化值
      if (record.get('code') && selectKey && selectKey.indexOf(record.get('code')) !== -1) {
        record.set('expand', true);
        handleSelectKey('');
      }
      return record.get('hasChild')
        ? {
            title: () => (
              <div
                className={style['adaptor-task-node']}
                onClick={() => {
                  const a = record.get('expand');
                  record.set('expand', !a);
                }}
              >
                <div className="adaptor-task-node-left">
                  <span>{record.get('name')}</span>
                </div>
              </div>
            ),
            isLeaf: false,
            key: record.get('code'),
          }
        : {
            title: () => (
              <div
                className={style['adaptor-task-transform']}
                style={currentKey === record.get('code') ? { background: '#F5F5F5' } : {}}
                onClick={() => witchMenu(record.get('code'))}
              >
                <div style={{ fontSize: 14 }}>{record.get('name')}</div>
              </div>
            ),
            isLeaf: true,
          };
    },
    [valueData, selectKey]
  );

  return (
    <>
      <Header title="配置对象定义帮助手册">
        {searchFlag ? (
          <Tooltip
            title={intl.get('spfm.marmotHelpManual.view.search.title').d('搜索')}
            placement="left"
            theme="light"
          >
            <Button
              icon="search"
              funcType="flat"
              shape="circle"
              onClick={() => handleSearchFlag(false)}
            />
          </Tooltip>
        ) : (
          <TextField
            dataSet={queryFormDs}
            name="searchContent"
            placeholder={intl.get('spfm.marmotHelpManual.view.search.title').d('搜索')}
            clearButton
            autoFocus
            onEnterDown={openSearchModal}
          />
        )}
      </Header>
      <Content>
        <div>
          <div className={style['left-left']}>
            {menuFlag ? (
              <div className="left-body">
                <div className="left-body-fold">
                  <img src={ActionImg} alt="" onClick={() => handleMenuFlag(false)} />
                </div>
                <Tree
                  dataSet={valueData}
                  showLine={{ showLeafIcon: false }}
                  treeNodeRenderer={nodeCover}
                />
              </div>
            ) : (
              <div className="left-left-unfold">
                <img
                  src={ActionImg}
                  alt=""
                  style={{ transform: 'rotateY(180deg)' }}
                  onClick={() => handleMenuFlag(true)}
                />
              </div>
            )}
          </div>
          <div className={menuFlag ? style['right-content-bwidth'] : style['right-content-swidth']}>
            <div className={style['adaptor-task-form']} id="markdownContent">
              {tableVisible ? (
                <MarkdownPreview
                  source={source}
                  handleSelectKey={handleSelectKey}
                  witchMenu={witchMenu}
                />
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
        <div
          className={style['back-md-top']}
          onClick={() => {
            scrollIntoView(document.getElementById('markdownContent'));
          }}
        >
          <Icon type="to-top" className="back-md-top-icon" />
          <span className="back-md-top-span">
            {intl.get('spfm.marmotHelpManual.view.to.top').d('顶部')}
          </span>
        </div>
      </Content>
    </>
  );
}

export default formatterCollections({
  code: ['spfm.objectHelpManual'],
})(
  withProps(
    () => {
      const valueData = new DataSet(getDocFlowPermissionDs());
      const queryFormDs = new DataSet(getQueryFormDs());
      return { valueData, queryFormDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(ObjectHelpManual)
);
