import React from 'react';
import { TextArea } from 'choerodon-ui/pro';
import copy from 'copy-to-clipboard';
import { message } from 'choerodon-ui';
import { withRouter } from 'dva/router';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import style from './CommonFunctionMsg.less';

function CommonFunctionMsg(props = {}) {
  const msg = {
    log: {
      title: intl.get('spfm.commonFunctionMsg.log.view.title').d('日志'),
      value: ['STD.Logger.info("description: {}",message);'],
    },
    objectConversion: {
      title: intl.get('spfm.commonFunctionMsg.objectConversion.view.title').d('对象转换'),
      value: [
        'let  obj = STD.SAFE_JSON.parse(jsonStr);',
        'let  objStr = STD.SAFE_JSON.stringify(obj);',
      ],
    },
    abnormal: {
      title: intl.get('spfm.commonFunctionMsg.abnormal.view.title').d('异常'),
      value: ['throw new STD.BusinessException("");', 'throw new SimpleException("");'],
    },
    arrMap: {
      title: intl.get('spfm.commonFunctionMsg.arrMap.view.title').d('数组 to map'),
      value: ['let resultMap = targetList.collectors().toMap(x => x.attribute,x=>x,(a,b)=>b);'],
    },
    arrGroup: {
      title: intl.get('spfm.commonFunctionMsg.arrGroup.view.title').d('数组 group by'),
      value: ['let resultMap = targetList.collectors().groupingBy(x => x.attribute,x=>x);'],
    },
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
      {Object.keys(msg).map((res) => (
        <div className="content-center-block">
          <div className="content-center-block-title">
            <div>---------------------------------------------------</div>
            <div className="content-center-block-title-title">
              <span style={{ backgroundColor: 'white', padding: '0 4px' }}>{msg[res].title}</span>
            </div>
          </div>
          <div className="content-center-block-value">
            {msg[res].value.map((text) => (
              <div className="content-center-block-value-area">
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
                  value={text}
                  autoSize={{ minRows: 3, maxRows: 8 }}
                  readOnly
                />
                <div className="content-center-block-value-area-div" onClick={() => copyText(text)}>
                  {intl.get('spfm.commonFunctionMsg.button.view.copy').d('复制代码')}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default formatterCollections({
  code: ['spfm.commonFunctionMsg', 'hzero.common'],
})(withRouter(CommonFunctionMsg));
