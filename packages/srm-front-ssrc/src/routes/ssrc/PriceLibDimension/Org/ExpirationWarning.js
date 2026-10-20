/**
 * ExpirationWarning - 到期预警-表单组件
 * @date: 2020-08-18
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent } from 'react';
import { compose } from 'lodash';
import { Form, Switch, NumberField, Select, Lov, Spin, TimePicker } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { observer } from 'mobx-react';

import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import ConstructForm from './ConstructForm';

import style from '../index.less';

/**
 * 纯组件 - 展示型组件
 * @extends {PureComponent} React.PureComponent
 * @reactProps {DataSet} [warningDS={}] - ds配置项
 * @returns React.element
 */

class ExpirationWarning extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * 修改到期预警Flag - 当关闭时, 需要清空所有数据, 并且设置disabled
   * @param {String} val - change后的value
   */
  @Bind()
  handleChangeWarningFlag(val) {
    const { warningDS } = this.props;
    if (val) {
      warningDS.current.set('warningHighlightFlag', 1);
      warningDS.current.set('warningDays', 30);
    } else {
      warningDS.current.set('warningDays', null);
      warningDS.current.set('warningNoticeFlag', 0);
      warningDS.current.set('warningHighlightFlag', 0);
      warningDS.current.set('warningNoticeMethod', null);
      warningDS.current.set('warningNoticeFrequency', null);
      warningDS.current.set('warningNoticeReceiverLov', null);
      warningDS.current.set('warningNoticeReceiver', null);
      warningDS.current.set('receiverMeaning', null);
      warningDS.current.set('warningTime', null);
    }
  }

  /**
   * 修改开启消息通知Flag
   */
  @Bind()
  handleChangeWarningNoticeFlag(val) {
    const { warningDS } = this.props;
    if (val) {
      warningDS.current.set('warningNoticeMethod', ['EMAIL', 'SMS', 'WEB']);
      warningDS.current.set('warningNoticeFrequency', 'ONCE');
      warningDS.current.set('warningTime', moment('09', 'HH'));
    } else {
      warningDS.current.set('warningNoticeMethod', null);
      warningDS.current.set('warningNoticeFrequency', null);
      warningDS.current.set('warningNoticeReceiverLov', null);
      warningDS.current.set('warningNoticeReceiver', null);
      warningDS.current.set('receiverMeaning', null);
      warningDS.current.set('warningTime', null);
    }
  }

  render() {
    const { warningDS, customizeForm = () => { }, viewOnly = false } = this.props;
    const { current } = warningDS;
    const enabledEdit = !viewOnly && current?.get('templateStatus') !== 'RELEASED';
    return (
      <Spin dataSet={warningDS}>
        <div className={!enabledEdit && style['view-only-form']}>
          {customizeForm(
            {
              code: 'SSRC.PRICE_LIB_NEW.EXPIRATIONWARNING',
              dataSet: warningDS,
            },
            <Form
              dataSet={warningDS}
              columns={2}
              labelLayout={enabledEdit ? "float" : "vertical"}
              className={enabledEdit ? null : 'c7n-pro-vertical-form-display'}
            >
              <ConstructForm formType="CheckBox" isEdit={enabledEdit} name="expireWarningFlag" onChange={this.handleChangeWarningFlag} />
              <ConstructForm formType="NumberField" isEdit={enabledEdit} name="warningDays" />
              <ConstructForm formType="CheckBox" isEdit={enabledEdit} name="warningNoticeFlag" onChange={this.handleChangeWarningNoticeFlag} />
              <ConstructForm formType="CheckBox" isEdit={enabledEdit} name="warningHighlightFlag" />
              <ConstructForm formType="Select" isEdit={enabledEdit} name="warningNoticeMethod" />
              <ConstructForm formType="TimePicker" isEdit={enabledEdit} name="warningTime" />
              <ConstructForm formType="Select" isEdit={enabledEdit} name="warningNoticeFrequency" />
              <ConstructForm formType="Select" isEdit={enabledEdit} name="messageReceiver" />
              {current?.get('messageReceiver').includes('assigner') && (<ConstructForm formType="Lov" isEdit={enabledEdit} name="warningNoticeReceiverLov" />)}
            </Form>
          )}
        </div>
      </Spin>
    );
  }
}

const hocComponent = (com) =>
  compose(
    WithCustomizeC7N({
      unitCode: [`SSRC.PRICE_LIB_NEW.EXPIRATIONWARNING`],
    }),
    observer
  )(com);

export default hocComponent(ExpirationWarning);
