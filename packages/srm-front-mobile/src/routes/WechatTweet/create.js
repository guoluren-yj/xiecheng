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
   Lov,
   TextField,
 } from 'choerodon-ui/pro';

 import intl from 'utils/intl';
 import { getResponse, getCurrentOrganizationId } from 'utils/utils';
 import notification from 'utils/notification';
 import { Header, Content } from 'components/Page';
 import RichTextEditor from 'components/RichTextEditor';
 import formatterCollections from 'utils/intl/formatterCollections';
 import {publicBucketName} from "@/utils/smblConstant";
 import { DETAIL_CARD_CLASSNAME, DETAIL_CARD_TABLE_CLASSNAME } from 'utils/constants';

 import Upload from 'components/Upload/UploadButton';
//  import Upload from '_components/C7NUpload';
import {Icon} from 'hzero-ui';


 import { formDs } from './stores/indexDS';
 import { uploadMedia, saveTemplate, updateTemplate } from '../../services/WechatTweetService';

const organizationId = getCurrentOrganizationId();

 @formatterCollections({
   code: ['smbl.wechatTweet', 'smbl.common', 'hzero.common'],
 })
 export default class Detail extends Component {
   ds;

   constructor(props) {
     super(props);
     const {
       match: { params: a = {} },
       location: { query = {} },
     } = props;
     this.ds = new DataSet({
       ...formDs(a.templateId),
       events: {
        load: () => {
          this.forceUpdate();
        },
      },
    });
     if (a.templateId === 'create') {
      this.ds.create({});
     } else if(a.templateId === 'copy') {
      const { id, _token, mediaId, mediaUrl, objectVersionNumber, ...rest } = query;
      this.ds.create(rest);
     }
     this.state = {
      isCreate: ['create', 'copy'].includes(a.templateId),
    };
   }


   /**
    * 监听富文本编辑
    * @param {object} dataSource - 编辑的数据
    */
   @Bind()
   onRichTextEditorChange(dataSource) {
     this.ds.current.set('content', dataSource);
   }

   @Bind()
   async handleSave() {
     const flag = await this.ds.validate();
     const { isCreate } = this.state;
     const { history } = this.props;
     if (flag) {
      const baseInfo = this.ds.current.toData();
      const newParams = {
        ...baseInfo,
        "tenantId": organizationId,   
      };
      const handlerService = isCreate ? saveTemplate : updateTemplate;
       const result = getResponse(
         await handlerService({
           ...newParams,
           // eslint-disable-next-line no-undef
           content: CKEDITOR.instances.richTextEditor.getData(), // 为了源码模式时候直接保存
         })
       );
       if (result) {
          notification.success();
          history.push(`/smbl/wechat-tweet/config/org/list`);
       }
     }
   }

  // 上传之前的回调
  @Bind()
  beforeUpload() {
    if(!this.ds.records[0].get("thirdPartyAccountId")) {
      notification.error({
        message: intl
          .get(`smbl.wechatTweet.view.validation.thirdPartyAccountIdNotEmpty`)
          .d('请先选择关联公众号'),
      });
      return false;
     }
  }

  //  上传附件
   @Bind()
   async uploadFile(data) {

     const formData = new FormData();
     formData.append("file", data.file);
     const result = getResponse(await uploadMedia(this.ds.records[0].get("thirdPartyAccountId"), formData));
     if(result) {
        this.ds.current.set('mediaId', result.mediaId);
        this.ds.current.set('mediaUrl', result.url);
        this.forceUpdate();
     }  
   }


   @Bind
   handleRemoveFile() {
     this.props.dataSet.current.set('cardLogo', null);    
   }

   render() {
     const TempRichTextEditor = observer(({ dataSet }) => {
       const { templateId, content } = (dataSet.current && dataSet.current.data) || {};
       if(!content && !this.state.isCreate) return ;
       const staticTextProps = {
         key: templateId,
         ref: this.staticTextEditor,
         content,
         onEditorChange: (dataSource) => this.onRichTextEditorChange(dataSource),
         bucketDirectory: 'small-product-template',
         bucketName: 'public-bucket',
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
           title={intl.get('smbl.wechatTweet.view.title.wechatTempConfig').d('服务号推文模板配置')}
           backPath="/smbl/wechat-tweet/config/org"
         >
           <Button icon="save" color="primary" onClick={() => this.handleSave()}>
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
                   title={intl.get('smbl.wechatTweet.view.baseInfo').d('基本信息')}
                 >
                   <Form dataSet={this.ds} columns={3} hidden={!this.ds.current}>
                     {/* <Lov name="orgatization" /> */}
                     <TextField name="templateCode" />
                     <TextField name="templateName" />
                     <Lov name="thirdPartyAccount" />
                     <TextField name="remark" />
                     <Switch name="enabledFlag" />
                     <Upload
                       className="cardLogoUpload"
                       multiple={false}
                       dataSet={this.ds}
                       beforeUpload={this.beforeUpload}
                       customRequest={this.uploadFile}
                       onSuccess={this.handleUploadSuccess}
                       bucketName={publicBucketName}
                       name="mediaUrl"
                       accept="image/*"
                       showUploadList={false}
                       showUploadBtn={false}
                     >
                       {this.ds.current && this.ds.current.data.mediaUrl ? (
                         <img width={50} src={this.ds.current.data.mediaUrl} alt="" />
                        ) : (
                          <Icon type="plus" />
                        )}
                     </Upload>
                   </Form>
                 </Card>
               </Col>
             </Row>
             <Row gutter={48} style={{ marginTop: '-12px' }}>
               <Col span={24}>
                 <Card
                   bordered={false}
                   title={intl.get('smbl.wechatTweet.model.content').d('内容编辑')}
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
