/**
 * 价格拓展策略创建
 * @date: 2020-07-14
 * @author: chenjuan <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import {
  DataSet,
  Button,
  Form,
  TextField,
  NumberField,
  Switch,
  Select,
  Lov,
  TextArea,
  CheckBox,
} from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';

import { basicFormDS } from './lineDS';
import styles from '../index.less';

@formatterCollections({ code: ['ssrc.priceExpandStrategy'] })
export default class PriceExpandStrategy extends Component {
  basicFormDs = new DataSet(basicFormDS());

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const flag = await this.basicFormDs.validate();
    if (flag) {
      const res = getResponse(await this.basicFormDs.submit());
      if (res && !res.failed) {
        this.props.history.push(`/ssrc/price-expand-strategy/update/${res.content[0].expandId}`);
      }
    }
  }

  render() {
    return (
      <Fragment>
        <Header
          title={intl
            .get('ssrc.priceExpandStrategy.view.title.createExpandStrategy')
            .d('新建拓展策略')}
          backPath="/ssrc/price-expand-strategy/list"
        >
          <Button icon="save" color="primary" funcType="raised" onClick={this.handleSave}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content style={{ padding: '20px' }}>
          <h3 id="rfxBasicInfo" className={styles['create-base']}>
            {intl.get('ssrc.priceExpandStrategy.view.tab.basicInfos').d('基础信息')}
          </h3>
          <Form
            useWidthPercent
            labelLayout="float"
            dataSet={this.basicFormDs}
            columns={3}
            // className={style['c7n-form-label-required']}
          >
            <TextField name="expandCode" />
            <TextField name="expandName" />
            <NumberField name="priorityLevel" />
            <Select
              name="priceLibExpandByCodes"
              maxTagCount={2}
              maxTagTextLength={2}
              maxTagPlaceholder={(restValues) => `+${restValues.length}...`}
            />
            <Lov
              name="templateIds"
              maxTagCount={2}
              maxTagTextLength={2}
              maxTagPlaceholder={(restValues) => `+${restValues.length}...`}
            />
            <TextField name="realName" />
            <NumberField name="creationDate" />
            {/* <CheckBox name="enabledFlag" /> */}
            <TextArea name="remark" colSpan={2} newLine resize="vertical" rows={6} />
          </Form>
        </Content>
      </Fragment>
    );
  }
}
