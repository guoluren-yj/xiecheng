import React from 'react';
import { connect } from 'dva';
import { SelectBox } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import NavMode1 from '../../../../assets/icon-nav-mode-1.svg';
import NavMode2 from '../../../../assets/icon-nav-mode-2.svg';

const NavigationSelect = function NavigationSelect(props) {
  const { className, navPattern, onChange } = props;
  return (
    <>
      <span style={{ marginRight: '1rem' }}>{intl.get('hzero.common.basicLayout.navigationMode').d('导航模式')}</span>
      <SelectBox size="small" className={className} value={navPattern} onChange={onChange} mode="button">
        <SelectBox.Option value="NAV_MODE_1">
          <img src={NavMode2} />
        </SelectBox.Option>
        <SelectBox.Option value="NAV_MODE_2">
          <img src={NavMode1} />
        </SelectBox.Option>
      </SelectBox>
    </>
  );
};

export default connect(({ user = {} }) => {
  const { currentUser = {} } = user;
  const { themeConfigVO = {} } = currentUser;
  return {
    navPattern: themeConfigVO.navPattern || 'NAV_MODE_1',
  };
}, (dispatch) => ({
  onChange(navPattern) {
    dispatch({
      type: 'user/updateNavPattern',
      payload: { navPattern },
    });
  },
}))(NavigationSelect);
