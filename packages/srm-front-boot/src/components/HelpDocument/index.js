import React, { useState, useEffect, useCallback } from 'react';
import { DataSet, Tree, Tooltip, Button, Modal, TextField } from 'choerodon-ui/pro';
import { Icon } from 'hzero-ui';
import { withRouter } from 'dva/router';
import Cookies from 'universal-cookie';
import { Header, Content } from 'components/Page';
import scrollIntoView from 'scroll-into-view-if-needed';
import { isString } from 'lodash';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import ActionImg from '../../assets/action.png';
import { getDocFlowPermissionDs, getQueryFormDs } from './store/helpDocumentDs';
import { getDocumentMarkDown } from './helpDocumentService';
import MarkdownPreview from './MarkdownPreview';
import SearchMD from './SearchMD';
import style from './index.less';

const cookies = new Cookies();

const getService = (service = 'ssc') => {
  return service.replace('/', '');
};

function HelpDocument(props = {}) {
  /**
   * defaultOpenKey: String - 默认打开的markdown的code
   * notPub: Boolean - 控制左侧树的高度，默认是pub页面，不是pub页面的话，高度会超出
   */
  const { jsColor, valueData, queryFormDs, defaultOpenKey = '1.1', notPub = false } = props;
  const service = getService(props.service);
  const [tableVisible, handleTableVisible] = useState(true);
  const [menuFlag, handleMenuFlag] = useState(true);
  const [searchFlag, handleSearchFlag] = useState(true);
  const [source, handleSource] = useState('');
  const [currentKey, handleCurrentKey] = useState('');
  const [javaScriptColor, switchJavaScriptColor] = useState(cookies.get('javaScriptColor'));
  const [openKeyArr, setOpenKeyArr] = useState([]);

  const witchMenu = (key) => {
    if (isString(key)) {
      handleCurrentKey(key);
      getDocumentMarkDown({ markKey: key, service }).then((res) => {
        if (res) {
          handleSource(res);
          handleTableVisible(true);
        } else {
          handleTableVisible(false);
        }
      });
    }
  };

  // 通过url跳到对应的md
  useEffect(() => {
    const {
      location: { hash = '' },
    } = props;
    if (hash && /^#/.test(hash)) {
      const hrefKey = hash.slice(1);
      if (!isNaN(hrefKey.replaceAll('.', ''))) {
        handleSelectKey(hrefKey);
        witchMenu(hrefKey);
      } else {
        queryDefaultMd();
      }
    } else {
      queryDefaultMd();
    }
  }, []);

  useEffect(() => {
    valueData.setState('serviceKey', service);
  }, [service]);

  const queryDefaultMd = () => {
    getDocumentMarkDown({ markKey: defaultOpenKey, service }).then((res) => {
      if (res) {
        handleSource(res);
        handleTableVisible(true);
      } else {
        handleTableVisible(false);
      }
    });
  };

  const handleSelectKey = (key = '') => {
    const setArr = new Set();
    for (let i = 0; i < key.length; i++) {
      if (key[i] === '.' && i !== 0) {
        setArr.add(key.slice(0, i));
      }
    }
    setOpenKeyArr(Array.from(setArr));
  };

  const openSearchModal = () => {
    const searchContent = queryFormDs.current ? queryFormDs.current.get('searchContent') : '';
    if (searchContent) {
      const searchModal = Modal.open({
        key: 'searchModalKey',
        children: (
          <SearchMD
            queryFormDs={queryFormDs}
            closeModal={() => searchModal.close()}
            handleSelectKey={handleSelectKey}
            witchMenu={witchMenu}
            service={service}
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

  const nodeCover = useCallback(
    ({ record }) => {
      // 搜索结果跳转，自动打开树结构，并初始化值
      if (
        record.get('code') &&
        openKeyArr.length &&
        openKeyArr.indexOf(record.get('code')) !== -1
      ) {
        record.set('expand', true);
        setOpenKeyArr((preState) => {
          const index = openKeyArr.indexOf(record.get('code'));
          preState.splice(index, 1);
          return preState;
        });
      }
      // a标签的href，复制给别人跳转用
      const hrefCode = record.get('code') || '';
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
              <a
                style={{ textDecorationLine: 'none', fontSize: 14, color: 'inherit' }}
                href={hrefCode ? `#${hrefCode}` : ''}
              >
                <div
                  className={style['adaptor-task-transform']}
                  style={currentKey === record.get('code') ? { background: '#F5F5F5' } : {}}
                  onClick={() => witchMenu(record.get('code'))}
                >
                  {record.get('name')}
                </div>
              </a>
            ),
            isLeaf: true,
          };
    },
    [valueData, openKeyArr]
  );

  return (
    <>
      <Header
        title={intl.get('spfm.marmotHelpManual.view.marmotHelpManual.title').d('Marmot 帮助手册')}
      >
        <Tooltip
          title={intl
            .get('spfm.marmotHelpManual.view.javascript.color')
            .d('更换JavaScript区域颜色')}
          placement="left"
          theme="light"
        >
          <Button
            icon="color_lens-o"
            funcType="flat"
            shape="circle"
            onClick={() => {
              const current = jsColor.indexOf(javaScriptColor);
              if (current + 1 < jsColor.length && current + 1 > -1) {
                cookies.set('javaScriptColor', jsColor[current + 1]);
                switchJavaScriptColor(jsColor[current + 1]);
              } else {
                cookies.set('javaScriptColor', undefined);
                switchJavaScriptColor(undefined);
              }
            }}
          />
        </Tooltip>
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
        <div style={{ position: 'relative' }}>
          <div className={style['left-left']}>
            {menuFlag ? (
              <div
                className="left-body"
                style={{ height: notPub ? 'calc(100vh - 200px)' : 'calc(100vh - 100px)' }}
              >
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
                  javaScriptColor={jsColor.indexOf(javaScriptColor)}
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
  code: ['spfm.marmotHelpManual'],
})(
  withProps(
    () => {
      const valueData = new DataSet(getDocFlowPermissionDs());
      const queryFormDs = new DataSet(getQueryFormDs());
      const jsColor = ['okaidia', 'oneDark', 'vscDarkPlus'];
      return { valueData, jsColor, queryFormDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(withRouter(HelpDocument))
);
