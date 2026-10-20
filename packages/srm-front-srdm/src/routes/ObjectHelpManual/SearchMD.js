import React, { useState, useEffect } from 'react';
import { TextField } from 'choerodon-ui/pro';
import { Icon } from 'hzero-ui';
import { withRouter } from 'dva/router';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getSearchContent } from '@/services/objectHelpManualService';
import style from './index.less';

function SearchMD(props = {}) {
  const {
    queryFormDs,
    closeModal = () => {},
    witchMenu = () => {},
    handleSelectKey = () => {},
  } = props;

  const [resArr, handleResArr] = useState([]);

  useEffect(() => {
    queryContent();
  }, []);

  const queryContent = () => {
    const searchContent = queryFormDs?.current?.get('searchContent');
    if (searchContent) {
      getSearchContent(searchContent).then((res = []) => {
        handleResArr(res);
      });
    }
  };

  const jumpTo = (key) => {
    handleSelectKey(key);
    witchMenu(key);
    closeModal();
  };

  return (
    <div className={style['search-body']}>
      <div>
        <TextField
          className="search-body-input"
          dataSet={queryFormDs}
          name="searchContent"
          placeholder={intl.get('spfm.marmotHelpManual.view.search.title').d('搜索')}
          prefix={
            <Icon type="search" onClick={() => queryContent()} style={{ cursor: 'pointer' }} />
          }
          autoFocus
          clearButton
          valueChangeAction="input"
          onEnterDown={() => queryContent()}
        />
      </div>
      <div className="search-body-res">
        {resArr.length ? (
          resArr.map((res) => (
            <div className="search-body-res-card">
              <div className="search-body-res-card-title">
                <span style={{ cursor: 'pointer' }} onClick={() => jumpTo(res.code)}>
                  {res.name}
                </span>
              </div>
              <div className="search-body-res-card-content">
                <div className="search-body-res-card-content-line" />
                <div className="search-body-res-card-content-text">{res.content}</div>
              </div>
            </div>
          ))
        ) : (
          <div>{intl.get('spfm.marmotHelpManual.view.search.noting').d('无搜索结果')}</div>
        )}
      </div>
    </div>
  );
}

export default formatterCollections({
  code: ['spfm.objectHelpManual', 'hzero.common'],
})(withRouter(SearchMD));
