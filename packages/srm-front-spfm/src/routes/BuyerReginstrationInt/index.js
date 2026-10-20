// import React, { Component, Fragment } from 'react';
// import { Row, Col, Form, Input, Button, notification, Checkbox, Modal } from 'choerodon-ui';
// import { Lov, Select, DataSet } from 'choerodon-ui/pro';
// import { Bind } from 'lodash-decorators';
// import { isUndefined, isEmpty } from 'lodash';
// import { PHONE, EMAIL } from 'utils/regExp';

// import { Content } from 'components/Page';
// import { HZERO_IAM } from 'utils/config';
// import intl from 'utils/intl';
// import { lovDefineAxiosConfig } from '_utils/c7nUiConfig';
// import { encryptPwd } from 'utils/utils';
// import formatterCollections from 'utils/intl/formatterCollections';

// import styles from './index.less';
// import {
//   handleVerificationCode,
//   handleSubmit,
//   getPublicKey,
// } from '@/services/buyerReginIntServices';

// const FormItem = Form.Item;

// @formatterCollections({
//   code: ['spfm.buyerReginstrationInt'],
// })
// @Form.create({ fieldNameProp: null })
// export default class MaterialPrice extends Component {
//   state = {
//     confirmDirty: false,
//     captchaKey: '',
//     codeFlag: 'one',
//     time: 60,
//     unitFlag: false,
//   };

//   lovDs = new DataSet({
//     autoCreate: true,
//     fields: [
//       {
//         name: 'unitId',
//         type: 'object',
//         label: intl.get('spfm.buyerReginstrationInt.modal.unitId').d('所属组织'),
//         lovCode: 'SCUX.GJSC.IAM.UNIT',
//         noCache: true,
//         required: true,
//         transformRequest: (value) => value && value.unitId,
//         lovDefineAxiosConfig: (code) => {
//           const lovConfig = lovDefineAxiosConfig(code);
//           return {
//             ...lovConfig,
//             url: `${HZERO_IAM}/v1/cux/gjsc/lov-view/info?viewCode=SCUX.GJSC.IAM.UNIT`,
//             transformResponse: [
//               ...lovConfig.transformResponse,
//               (data) => {
//                 return {
//                   ...data,
//                 };
//               },
//             ],
//           };
//         },

//         lovQueryAxiosConfig: () => {
//           return {
//             url: `${HZERO_IAM}/v1/cux/gjsc/user/unit`,
//             method: 'GET',
//             transformResponse: (data) => {
//               const res = JSON.parse(data || '{}');
//               return {
//                 ...res,
//                 content: res.content,
//               };
//             },
//           };
//         },
//       },
//       {
//         name: 'internationalTelCode',
//         type: 'string',
//         lookupCode: 'HPFM.IDD',
//         lookupAxiosConfig: () => {
//           return {
//             url: `${HZERO_IAM}/v1/cux/gjsc/user/idd`,
//           };
//         },
//       },
//     ],
//   });

//   componentDidMount() {
//     if (this.lovDs.current) {
//       this.lovDs.current.set('internationalTelCode', '+86');
//     }
//   }

//   componentWillMount() {
//     clearTimeout(this.interVal);
//     this.props.form.resetFields();
//   }

//   @Bind()
//   validateToNextPassword(rule, value, callback) {
//     const { form } = this.props;
//     if (value && this.state.confirmDirty) {
//       form.validateFields(['confirmPassword'], { force: true });
//     }
//     callback();
//   }

//   @Bind()
//   compareToFirstPassword(rule, value, callback) {
//     const { form } = this.props;
//     if (value && value !== form.getFieldValue('password')) {
//       callback(
//         intl
//           .get('spfm.buyerReginstrationInt.modal.aomparePassvord')
//           .d('两次输入的密码不一致，请重新输入!')
//       );
//     } else {
//       callback();
//     }
//   }

//   @Bind()
//   regPhoneNumber(rule, value, callback) {
//     const reg = PHONE;
//     const flag = value && reg.test(value);
//     if (!value) {
//       callback();
//       return;
//     }
//     if (flag) {
//       callback();
//     } else {
//       callback(
//         intl.get('spfm.buyerReginstrationInt.modal.regPhone').d('手机号格式不正确，请重新输入!')
//       );
//     }
//   }

//   @Bind()
//   emailPhoneNumber(rule, value, callback) {
//     // eslint-disable-next-line
//     const reg = EMAIL;
//     const flag = value && reg.test(value);
//     if (!value) {
//       callback();
//       return;
//     }
//     if (flag) {
//       callback();
//     } else {
//       callback(
//         intl.get('spfm.buyerReginstrationInt.modal.regEmail').d('邮箱格式不正确，请重新输入!')
//       );
//     }
//   }

//   @Bind()
//   handleVerificationCode() {
//     const { getFieldValue } = this.props.form;
//     let timeStart = 60;
//     let timeControl = true;
//     if (
//       getFieldValue('phone') &&
//       this.lovDs.current &&
//       this.lovDs.current.get('internationalTelCode')
//     ) {
//       const response = handleVerificationCode(
//         getFieldValue('phone'),
//         this.lovDs.current && this.lovDs.current.get('internationalTelCode')
//       );
//       response.then((res) => {
//         if (res && res.failed && res.message) {
//           notification.warning({ message: res.message, placement: 'bottomRight' });
//         } else {
//           if (timeControl) {
//             this.interVal = setInterval(() => {
//               timeControl = false;
//               timeStart--;
//               if (timeStart === 0) {
//                 clearTimeout(this.interVal);
//                 timeControl = true;
//                 this.setState({ codeFlag: 'two' });
//                 return timeControl;
//               }
//               this.setState({ time: timeStart, codeFlag: 'three' });
//             }, 1000);
//           }
//           this.setState({ captchaKey: res.captchaKey });
//         }
//       });
//     }
//   }

//   @Bind()
//   handleSubmit() {
//     this.props.form.validateFields((err, values) => {
//       if (isEmpty(this.lovDs.current.get('unitId'))) {
//         this.setState({ unitFlag: true });
//         return;
//       }
//       if (!err) {
//         // 单独校验所属组织并给出提示
//         const resPubKey = getPublicKey();
//         resPubKey.then((res) => {
//           if (!(res && res.failed && res.message)) {
//             if (isUndefined(res)) {
//               Modal.error({
//                 title: intl
//                   .get('spfm.buyerReginstrationInt.modal.error')
//                   .d('系统异常，请联系管理员!'),
//               });
//               return;
//             }
//             const newData = {
//               ...values,
//               password: values.password ? encryptPwd(values.password, res.publicKey) : undefined,
//               confirmPassword: undefined,
//               internationalTelCode: this.lovDs.current
//                 ? this.lovDs.current.get('internationalTelCode')
//                 : undefined,
//               unitId: this.lovDs.current ? this.lovDs.current.get('unitId').unitId : undefined,
//               unitName: this.lovDs.current ? this.lovDs.current.get('unitId').unitName : undefined,
//               unitCode: this.lovDs.current ? this.lovDs.current.get('unitId').unitCode : undefined,
//               captchaKey: this.state.captchaKey,
//             };

//             const response = handleSubmit(newData);
//             response.then((resall) => {
//               if (resall && resall.failed && resall.message) {
//                 Modal.error({
//                   title: resall.message,
//                 });
//               } else {
//                 Modal.success({
//                   title: intl
//                     .get('spfm.buyerReginstrationInt.modal.succcessSubmit')
//                     .d('注册已经通过，您可以用手机号码进行登陆！'),
//                 });
//               }
//             });
//           }
//         });
//       }
//     });
//   }

//   render() {
//     const { getFieldDecorator } = this.props.form;
//     return (
//       <Fragment>
//         <Content>
//           <Row>
//             <Col span={16} offset={4}>
//               <h2 className={`${styles['register-form']} ${styles['register-title']}`}>
//                 {intl.get('spfm.buyerReginstrationInt.modal.mallAccountRegin').d('商城账号注册')}
//               </h2>
//               <span
//                 className={`${styles['register-form']}`}
//                 style={{ paddingBottom: '30px', display: 'block' }}
//               >
//                 {intl.get('spfm.buyerReginstrationInt.modal.prompt').d('注：需求人员申请使用')}
//               </span>
//               <div className={styles['register-wrap']}>
//                 <Form autoComplete="off">
//                   <FormItem>
//                     <span className="c7n-form-text">
//                       {intl.get('spfm.buyerReginstrationInt.modal.loginName').d('姓名')}
//                     </span>
//                     {getFieldDecorator('realName', {
//                       rules: [
//                         {
//                           required: true,
//                           message: intl
//                             .get('spfm.buyerReginstrationInt.modal.loginNamePrompt')
//                             .d('请输入注册申请人姓名'),
//                         },
//                       ],
//                     })(
//                       <Input
//                         placeholder={intl
//                           .get('spfm.buyerReginstrationInt.modal.loginNamePrompt')
//                           .d('请输入注册申请人姓名')}
//                         autoComplete="new-password"
//                       />
//                     )}
//                   </FormItem>
//                   <FormItem>
//                     <span className="c7n-form-text">
//                       {intl.get('spfm.buyerReginstrationInt.modal.password').d('登陆密码')}
//                     </span>
//                     {getFieldDecorator('password', {
//                       rules: [
//                         {
//                           required: true,
//                           message: intl
//                             .get('spfm.buyerReginstrationInt.modal.passwordPrompt')
//                             .d('请输入登陆密码'),
//                         },
//                         {
//                           validator: this.validateToNextPassword,
//                         },
//                       ],
//                     })(
//                       <Input
//                         placeholder={intl
//                           .get('spfm.buyerReginstrationInt.modal.passwordPrompt')
//                           .d('请输入登陆密码')}
//                         type="password"
//                       />
//                     )}
//                   </FormItem>
//                   <FormItem>
//                     <span className="c7n-form-text">
//                       {intl.get('spfm.buyerReginstrationInt.modal.confirmPassword').d('确认密码')}
//                     </span>
//                     {getFieldDecorator('confirmPassword', {
//                       rules: [
//                         {
//                           required: true,
//                           message: intl
//                             .get('spfm.buyerReginstrationInt.modal.confirmPassword')
//                             .d('请输入确认密码'),
//                         },
//                         {
//                           validator: this.compareToFirstPassword,
//                         },
//                       ],
//                     })(
//                       <Input
//                         placeholder={intl
//                           .get('spfm.buyerReginstrationInt.modal.confirmPasswordPrompt')
//                           .d('请确认登陆密码')}
//                         type="password"
//                       />
//                     )}
//                   </FormItem>
//                   <FormItem className={styles.unitLov}>
//                     <span className="c7n-form-text">
//                       {intl.get('spfm.buyerReginstrationInt.modal.unitId').d('所属组织')}
//                     </span>
//                     <Lov dataSet={this.lovDs} name="unitId" modalProps={{ movable: false }} />
//                     <span
//                       className={styles.unitStyle}
//                       style={{ display: this.state.unitFlag ? 'inline-block' : 'none' }}
//                     >
//                       {intl
//                         .get('spfm.buyerReginstrationInt.modal.unitIdPrompt')
//                         .d('请输入所属组织')}
//                     </span>
//                   </FormItem>
//                   <FormItem>
//                     <span className="c7n-form-text">
//                       {intl.get('spfm.buyerReginstrationInt.modal.phone').d('手机号')}
//                     </span>
//                     <span className="phoneStyle">
//                       {getFieldDecorator('phone', {
//                         rules: [
//                           {
//                             required: true,
//                             message: intl
//                               .get('spfm.buyerReginstrationInt.modal.inputPhone')
//                               .d('请输入手机号'),
//                           },
//                           {
//                             validator: this.regPhoneNumber,
//                           },
//                         ],
//                       })(
//                         <Input
//                           placeholder={intl
//                             .get('spfm.buyerReginstrationInt.modal.phonePrompt')
//                             .d('可用于登陆及找回密码')}
//                         />
//                       )}
//                       {getFieldDecorator('internationalTelCode')(
//                         <Select dataSet={this.lovDs} name="internationalTelCode" />
//                       )}
//                     </span>
//                   </FormItem>
//                   <FormItem>
//                     <span className="c7n-form-text">
//                       {intl.get('spfm.buyerReginstrationInt.modal.email').d('邮箱')}
//                     </span>
//                     {getFieldDecorator('email', {
//                       rules: [
//                         {
//                           required: true,
//                           message: intl
//                             .get('spfm.buyerReginstrationInt.modal.inputEmail')
//                             .d('请输入邮箱'),
//                         },
//                         {
//                           validator: this.emailPhoneNumber,
//                         },
//                       ],
//                     })(
//                       <Input
//                         placeholder={intl
//                           .get('spfm.buyerReginstrationInt.modal.phonePrompt')
//                           .d('可用于登陆及找回密码')}
//                       />
//                     )}
//                   </FormItem>
//                   <FormItem>
//                     <span className="c7n-form-text">
//                       {intl.get('spfm.buyerReginstrationInt.modal.captcha').d('验证码')}
//                     </span>
//                     <span className="captchaStyle">
//                       {getFieldDecorator('captcha', {
//                         rules: [
//                           {
//                             required: true,
//                             message: intl
//                               .get('spfm.buyerReginstrationInt.modal.inputCaptchaPrompt')
//                               .d('请输入验证码'),
//                           },
//                         ],
//                       })(
//                         <Input
//                           placeholder={intl
//                             .get('spfm.buyerReginstrationInt.modal.captchaPrompt')
//                             .d('请输入验证码')}
//                         />
//                       )}
//                       <Button className={styles.btnStyle} onClick={this.handleVerificationCode}>
//                         {this.state.codeFlag === 'two'
//                           ? intl
//                               .get('spfm.buyerReginstrationInt.modal.verificationCodeR')
//                               .d('重新获取短信验证码')
//                           : this.state.codeFlag === 'one'
//                           ? intl
//                               .get('spfm.buyerReginstrationInt.modal.verificationCode')
//                               .d('获取短信验证码')
//                           : `${this.state.time}${intl
//                               .get(`spfm.buyerReginstrationInt.modal.seconds`)
//                               .d('秒')}`}
//                       </Button>
//                     </span>
//                   </FormItem>
//                   <FormItem className={styles.readANDagreeStyle}>
//                     {getFieldDecorator('agreement', {
//                       rules: [
//                         {
//                           required: true,
//                           message: intl
//                             .get('spfm.buyerReginstrationInt.modal.selectReadANDagree')
//                             .d('请勾选同意条款!'),
//                         },
//                       ],
//                     })(
//                       <Checkbox>
//                         {intl
//                           .get('spfm.buyerReginstrationInt.modal.readANDagree')
//                           .d('我已阅读并同意')}
//                         <a
//                           href={`${window.$$env.GJSC_HOST}/oauth/public/default/terms.html`}
//                           target="view_window"
//                         >
//                           {intl
//                             .get('spfm.buyerReginstrationInt.modal.gjscUserAgreement')
//                             .d('广建商城用户注册协议')}
//                         </a>
//                       </Checkbox>
//                     )}
//                   </FormItem>
//                   <FormItem className={styles.submitStyle}>
//                     <Button
//                       type="primary"
//                       funcType="raised"
//                       htmlType="submit"
//                       onClick={this.handleSubmit}
//                     >
//                       {intl.get('spfm.buyerReginstrationInt.modal.register').d('注册')}
//                     </Button>
//                   </FormItem>
//                 </Form>
//               </div>
//             </Col>
//           </Row>
//         </Content>
//       </Fragment>
//     );
//   }
// }
