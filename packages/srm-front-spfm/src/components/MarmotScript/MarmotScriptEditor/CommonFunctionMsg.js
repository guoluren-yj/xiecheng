import React, { useState, useEffect } from 'react';
import { TextArea } from 'choerodon-ui/pro';
import copy from 'copy-to-clipboard';
import { isObject, isEmpty } from 'lodash';
import { message } from 'choerodon-ui';
import { withRouter } from 'dva/router';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCommonGrammar } from '../marmotScriptService';
import style from './CommonFunctionMsg.less';

function CommonFunctionMsg(props = {}) {
  const { functionCodeQuery = '' } = props;
  const [commonGrammar, handleCommonGrammar] = useState({});
  const [allCommonGrammar, handleAllCommonGrammar] = useState({});

  useEffect(() => {
    getCommonGrammar().then((res) => {
      if (res && isObject(res)) {
        handleCommonGrammar(res);
        handleAllCommonGrammar(res);
      }
    });
  }, []);

  useEffect(() => {
    handleCommonGrammar(filterCommonGrammar(functionCodeQuery));
  }, [functionCodeQuery]);

  // 前端搜索
  const filterCommonGrammar = (value) => {
    if (!value) {
      return allCommonGrammar;
    }
    let result = {};
    Object.keys(allCommonGrammar).forEach((key) => {
      let content = {};
      Object.keys(allCommonGrammar[key]).forEach((title) => {
        if (
          allCommonGrammar[key][title].toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) !== -1
        ) {
          content = { ...content, [title]: allCommonGrammar[key][title] };
        }
      });
      result = { ...result, [key]: content };
    });
    return result;
  };

  const copyText = (text) => {
    copy(text);
    message.destroy();
    message.config({ duration: 2 });
    message.success(
      intl.get('spfm.commonFunctionMsg.button.copy.success').d('复制成功'),
      undefined,
      undefined,
      'bottomLeft'
    );
    if (props.hidePopover) {
      props.hidePopover();
    }
  };

  return (
    <div className={style['content-center']}>
      {Object.keys(commonGrammar).map(
        (res) =>
          !isEmpty(commonGrammar[res]) && (
            <div className="content-center-block">
              <div className="content-center-block-title">
                <div>---------------------------------------------------</div>
                <div className="content-center-block-title-title">
                  <span style={{ backgroundColor: 'white', padding: '0 4px' }}>{res}</span>
                </div>
              </div>
              <div className="content-center-block-value">
                {!isEmpty(commonGrammar[res]) &&
                  Object.keys(commonGrammar[res]).map((text) => (
                    <div className="content-center-block-value-area">
                      <span>{text}</span>
                      <TextArea
                        placeholder="Basic usage"
                        style={{
                          marginBottom: '12px',
                          backgroundColor: '#EBEBEB',
                          width: '100%',
                          fontWeight: 'bold',
                          fontSize: '1.2em',
                          color: '#828282',
                        }}
                        className={style['aaa-aaa']}
                        value={commonGrammar[res][text] || ''}
                        autoSize={{ minRows: 3, maxRows: 8 }}
                        readOnly
                      />
                      <div
                        className="content-center-block-value-area-div"
                        onClick={() => copyText(commonGrammar[res][text] || '')}
                      >
                        {intl.get('spfm.commonFunctionMsg.button.view.copy').d('复制代码')}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )
      )}
    </div>
  );
}

export default formatterCollections({
  code: ['spfm.commonFunctionMsg', 'hzero.common'],
})(withRouter(CommonFunctionMsg));
