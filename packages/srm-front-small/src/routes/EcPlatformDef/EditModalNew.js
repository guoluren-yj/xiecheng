/**
 * EcPlatformDef -前置机定义modal 编辑页
 * @date: 2018-9-13
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

 import React, { Component } from 'react';
 import { Bind } from 'lodash-decorators';
 import { Form, Attachment, DataSet, Modal, TextField, IntlField, Lov, NumberField, Select, CheckBox, Output } from 'choerodon-ui/pro';

 import intl from 'utils/intl';
 import { PRIVATE_BUCKET } from '_utils/config';
 import RichTextEditor from 'components/RichTextEditor';

 /**
  * 编辑模态框数据展示
  * @extends {PureComponent} - React.PureComponent
  * @reactProps {Function} onHandleSaveFrontCompter - 编辑确定后回调函数以保存数据
  * @reactProps {Function} onCancel - 取消模态框
  * @reactProps {Object} visible - 控制模态框显影
  * @reactProps {Object} tableRecord - 表格中信息的一条记录
  * @reactProps {String} anchor - 模态框弹出方向
  * @return React.element
  */
 export default class FrontComputerModal extends Component {
   constructor(props) {
     super(props);
     this.refCurrent = React.createRef();
     this.formDs = new DataSet({
      forceValidate: true,
      data: [this.props.tableRecord],
      fields: [
        {
          name: 'ecPlatformCode',
          required: true,
          label: intl
          .get('small.ecplatformDef.model.Ec.platform.coding')
          .d('电商平台编码'),
          disabled: this.props.tableRecord.ecPlatformCode,
        },
        {
          name: 'ecPlatformName',
          required: true,
          label: intl.get('small.ecplatformDef.model.Ec.platform.name').d('电商平台名称'),
          type: 'intl',
        },
        {
          name: 'tenantLov',
          required: true,
          type: 'object',
          label: intl.get('small.ecplatformDef.model.ecplatformDef.tenant').d('租户'),
          lovCode: "HPFM.TENANT",
        },
        {
          name: 'tenantId',
          bind: 'tenantLov.tenantId',
        },
        {
          name: 'tenantName',
          bind: 'tenantLov.tenantName',
        },
        {
          name: 'purchaseQuantity',
          type: 'number',
          min: 1,
          max: 99999,
          label: intl
          .get('small.ecplatformDef.model.ecplatformDef.purchaseQuantity')
          .d('单次采购最大购买量'),
        },
        {
          name: 'remark',
          label: intl.get('small.ecplatformDef.model.ecplatformDef.remark').d('备注'),
        },
        {
          name: 'interfaceType',
          label: intl.get('small.ecplatformDef.form.interface.type').d('接口类型'),
          lookupCode: 'SMAL.INTERFACE_TYPE',
        },
        {
          name: 'ecGift',
          label: intl.get('small.common.table.column.ecGift').d('赠品'),
          trueValue: 1,
          falseValue: 0,
        },
        {
          name: 'ecService',
          label: intl.get('small.ecplatformDef.model.ecplatformDef.ecService').d('电商服务'),
          trueValue: 1,
          falseValue: 0,
        },
        {
          name: 'cancelAfterSale',
          label: intl
          .get('small.ecplatformDef.model.ecplatformDef.cancelAfterSale')
          .d('取消售后'),
          trueValue: 1,
          falseValue: 0,
        },
        {
          name: 'feedbackFlag',
          label: intl.get('small.ecplatformDef.model.feedbackFlag').d('商品反馈'),
          trueValue: 1,
          falseValue: 0,
        },
        {
          name: 'afterSaleType',
          label: intl
          .get('small.ecplatformDef.model.ecplatformDef.afterSaleType')
          .d('售后类型查询'),
          trueValue: 1,
          falseValue: 0,
        },
        {
          name: 'aggregationProduct',
          label: intl
          .get('small.ecplatformDef.model.ecplatformDef.aggregationProduct')
          .d('商品聚合查询'),
          trueValue: 1,
          falseValue: 0,
        },
        {
          name: 'freightQueryEnabled',
          label: intl.get('small.ecplatformDef.model.feight.query').d('运费查询'),
          trueValue: 1,
          falseValue: 0,
        },
        {
          name: 'batchBill',
          label: intl.get('small.ecplatformDef.model.batchBill').d('批量差异反馈'),
          trueValue: 1,
          falseValue: 0,
        },
        {
          name: 'telPhoneRequired',
          label: intl.get('small.ecplatformDef.model.telPhoneRequired').d('座机号维护'),
          trueValue: 1,
          falseValue: 0,
        },
        {
          name: 'remainLimit',
          label: intl.get('small.ecplatformDef.model.remainLimit').d('查询账户余额'),
          trueValue: 1,
          falseValue: 0,
        },
        {
          name: 'onlineServiceFlag',
          label: intl.get('small.ecplatformDef.model.onlineService').d('查询在线客服入口'),
          trueValue: 1,
          falseValue: 0,
        },
        {
          name: 'cancelBillingRequestFlag',
          label: intl.get('small.ecplatformDef.model.cancelBillingRequestFlag').d('取消发票申请'),
          trueValue: 1,
          falseValue: 0,
        },
        {
          name: 'rushInvoiceFlag',
          label: intl.get('small.ecplatformDef.model.rushInvoiceFlag').d('在线红冲'),
          trueValue: 1,
          falseValue: 0,
        },
        {
          name: 'onlineSign',
          label: intl.get('small.ecplatformDef.model.onlineSign').d('线上签约'),
          trueValue: 1,
          falseValue: 0,
        },
        {
          name: 'attachmentUuid',
          label: intl.get('small.ecplatformDef.model.ecLogo').d('电商Logo'),
          accept: ['image/*'],
          type: 'attchment',
          bucketName: PRIVATE_BUCKET,
          bucketDirectory: 'small',
        },
        {
          name: 'ecIntroduction',
          label: intl.get('small.ecplatformDef.model.ecIntroduction').d('电商介绍'),
        },
        {
          name: 'serverAddress',
          type: 'url',
          label: intl.get('small.ecplatformDef.model.serverAddress').d('电商接口地址'),
        },
      ],
     });
   }

   // 点击确认回调
   @Bind()
   async onOk() {
     const { onHandleSaveEcDef, tableRecord = {} } = this.props;
     const flag = await this.formDs.validate();
     if(flag) {
      const data = this.formDs.toData();
      onHandleSaveEcDef({
        ...tableRecord,
        ...data[0],
        ecIntroduction: this.refCurrent.current.getContent(),
      });
     }
   }

   render() {
     const { loading, visible, anchor, tableRecord = {}, onCancel } = this.props;
     const staticTextProps = {
       content: tableRecord.ecIntroduction,
       data: tableRecord.ecIntroduction,
       ref: this.refCurrent,
       bucketName: PRIVATE_BUCKET,
       bucketDirectory: 'small',
       config: {
         allowedContent: true,
         removeButtons:
           'About,Flash,Save,Form,Checkbox,Button,ShowBlocks,NewPage,Print,Language,Templates,CreateDiv,Radio,TextField,Textarea,Select,HiddenField',
       },
     };
     return (
       <Modal
         drawer
         destroyOnClose
         maskClosable
         title={intl.get('small.ecplatformDef.view.Ec.platform.maintain').d('维护电商平台')}
         width={540}
         onCancel={onCancel}
         onOk={this.onOk}
         visible={visible}
         wrapClassName={`ant-modal-sidebar-${anchor}`}
         transitionName={`move-${anchor}`}
         confirmLoading={loading}
       >
         <Form dataSet={this.formDs} columns={1}>
           <TextField name="ecPlatformCode" />
           <IntlField name="ecPlatformName" />
           <Lov name="tenantLov" />
           <NumberField name="purchaseQuantity" />
           <TextField name="remark" />
           <Select name="interfaceType" />
           <TextField name="serverAddress" />
           <CheckBox name="ecGift" />
           <CheckBox name="ecService" />
           <CheckBox name="cancelAfterSale" />
           <CheckBox name="feedbackFlag" />
           <CheckBox name="afterSaleType" />
           <CheckBox name="aggregationProduct" />
           <CheckBox name="freightQueryEnabled" />
           <CheckBox name="batchBill" />
           <CheckBox name="telPhoneRequired" />
           <CheckBox name="remainLimit" />
           <CheckBox name="onlineServiceFlag" />
           <CheckBox name="cancelBillingRequestFlag" />
           <CheckBox name="rushInvoiceFlag" />
           <CheckBox name="onlineSign" />
           <Attachment
             name="attachmentUuid"
             accept={['image/*']}
             listType="picture-card"
             max={1}
           />
           <Output
             name="ecIntroduction"
             renderer={() => (
               <RichTextEditor {...staticTextProps} />
           )}
           />
         </Form>
       </Modal>
     );
   }
 }
