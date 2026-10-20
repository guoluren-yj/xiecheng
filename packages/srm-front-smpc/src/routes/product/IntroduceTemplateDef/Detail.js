/**
 * Detail - 详细页
 * @date: 2020-11-10
 * @author hl <li.huang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import classnames from 'classnames';
import { Card } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import {
  DataSet,
  Form,
  Button,
  Row,
  Col,
  Spin,
  Switch,
  TextField,
  IntlField,
} from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import RichTextEditor from 'components/RichTextEditor';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_CARD_CLASSNAME, DETAIL_CARD_TABLE_CLASSNAME } from 'utils/constants';
import { PUBLIC_BUCKET } from '_utils/config';

import { formDs } from './ds';
import { saveTemplate } from './api';

@formatterCollections({
  code: ['smpc.prdIntroTemplateDef', 'smpc.product'],
})
export default class Detail extends Component {
  ds;

  constructor(props) {
    super(props);
    const {
      match: { params: a = {} },
    } = props;
    this.ds = new DataSet(formDs(a.templateId));
    if (a.templateId === 'create') this.ds.create({});
  }

  componentWillReceiveProps(newProps) {
    const { match: { params: a = {} } = {} } = this.props;
    const { match: { params: b = {} } = {} } = newProps;
    if (a.templateId !== b.templateId) {
      this.ds = new DataSet(formDs(b.templateId));
    }
  }

  /**
   * 监听富文本编辑
   * @param {object} dataSource - 编辑的数据
   */
  @Bind()
  onRichTextEditorChange(dataSource) {
    this.ds.data[0].set('content', dataSource);
  }

  @Bind()
  async handleSave() {
    const flag = await this.ds.validate();
    const { history } = this.props;
    if (flag) {
      const baseInfo = this.ds.current.toData();
      const result = getResponse(
        await saveTemplate({
          ...baseInfo,
          // eslint-disable-next-line no-undef
          content: CKEDITOR.instances.richTextEditor.getData(), // 为了源码模式时候直接保存
        })
      );
      if (result) {
        const { templateId } = result;
        const {
          match: { params = {} },
        } = this.props;
        notification.success();
        if (params.templateId === 'create') {
          history.push(`/s2-mall/product/introduce-template-def/detail/${templateId}`);
        } else {
          this.ds.query();
        }
      }
    }
  }

  render() {
    const TempRichTextEditor = observer(({ dataSet }) => {
      const { templateId, content } = (dataSet.records[0] && dataSet.records[0].data) || {};
      const staticTextProps = {
        key: templateId,
        ref: this.staticTextEditor,
        content,
        onEditorChange: (dataSource) => this.onRichTextEditorChange(dataSource),
        bucketDirectory: 'small-product-template',
        bucketName: PUBLIC_BUCKET,
        config: {
          allowedContent: true,
          removeButtons:
            'About,Flash,Save,Form,Checkbox,Button,ShowBlocks,NewPage,Print,Language,Templates,CreateDiv,Radio,TextField,Textarea,Select,HiddenField',
        },
      };
      return <RichTextEditor {...staticTextProps} />;
    });
    return (
      <React.Fragment>
        <Header
          title={intl.get('smpc.prdIntroTemplateDef.view.detail').d('商品介绍模板明细')}
          backPath="/s2-mall/product/introduce-template-def/list"
        >
          <Button wait={1000} icon="save" color="primary" onClick={() => this.handleSave()}>
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
        </Header>
        <Content>
          <Spin dataSet={this.ds} wrapperClassName={classnames('ued-detail-wrapper')}>
            <Row gutter={48} style={{ marginTop: '-12px' }}>
              <Col span={24}>
                <Card
                  bordered={false}
                  className={DETAIL_CARD_CLASSNAME}
                  title={intl.get('smpc.prdIntroTemplateDef.view.baseInfo').d('基本信息')}
                >
                  <Form dataSet={this.ds} columns={3}>
                    <TextField name="templateCode" />
                    <IntlField name="templateName" />
                    <Switch name="enabledFlag" />
                  </Form>
                </Card>
              </Col>
            </Row>
            <Row gutter={48} style={{ marginTop: '-12px' }}>
              <Col span={24}>
                <Card
                  bordered={false}
                  title={intl.get('smpc.prdIntroTemplateDef.model.content').d('内容编辑')}
                  className={DETAIL_CARD_TABLE_CLASSNAME}
                >
                  <TempRichTextEditor dataSet={this.ds} />
                </Card>
              </Col>
            </Row>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
