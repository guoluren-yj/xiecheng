import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import _isString from 'lodash/isString';
// import _Modal from 'hzero-ui/lib/modal';
import { Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';

@withRouter
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    this.SearchBarRef = {};
    this.state = {};
  }

  render() {
    const { title, btns, backPath, isChange, releaseSendBackRemaind, history } = this.props;
    return (
      <div className="page-head">
        <div
          className="page-head-back-btn"
          onClick={() => {
            if (_isString(backPath)) {
              if (isChange) {
                Modal.confirm({
                  title: intl.get(`srpm.common.model.common.confirm.giveUpTipTitle`).d('提示'),
                  children: (
                    <div>
                      {intl
                        .get(`srpm.common.model.common.confirm.giveUpTipMsg`)
                        .d('点击返回未处理单据需回到计划待发放页签重新处理，请确认是否离开？')}
                    </div>
                  ),
                }).then((button) => {
                  if (button === 'ok') {
                    // 退回剩余单据
                    releaseSendBackRemaind('all', 'return');
                    history.push({ pathname: backPath });
                  }
                });
              } else {
                history.push({ pathname: backPath });
              }
            } else {
              history.goBack();
            }
          }}
        >
          <i className="anticon anticon-arrow-left back-btn" />
        </div>
        <span className="page-head-title">{title}</span>
        <div className="page-head-operator">{btns()}</div>
      </div>
    );
  }
}
