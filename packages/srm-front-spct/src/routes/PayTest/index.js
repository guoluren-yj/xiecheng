// /**
//  * 订单支付测试页面
//  */
// import React, { useMemo } from 'react';
// import { Form, DataSet, TextField, Button } from 'choerodon-ui/pro';
// import { getResponse } from 'utils/utils';
// import { Header, Content } from 'components/Page';
// import { PayTestDS } from './PayTestStores';
// import { beforeGenerate, getOpenService } from './payTestServices';

// const PayTest = (props) => {
//   const formDS = new DataSet({ ...PayTestDS(), autoCreate: true });

//   const handlePay = async () => {
//     const isValidate = formDS.validate();
//     if (isValidate) {
//       const params = formDS.current.toData();
//       const serviceFlag = await getOpenService();

//       if (serviceFlag) {
//         beforeGenerate({ ...params, serviceFlag }).then((res) => {
//           if (getResponse(res)) {
//             const { paymentOrderNum } = res;
//             props.history.push(
//               `/pub/hpay/checkout-counter?paymentOrderNum=${paymentOrderNum}&channelTrxType=qrcode`
//             );
//           }
//         });
//       }
//     }
//   };

//   return useMemo(
//     () => (
//       <>
//         <Header title="创建支付订单">
//           <Button color="primary" onClick={handlePay}>
//             去支付
//           </Button>
//         </Header>
//         <Content>
//           <Form dataSet={formDS} columns={3}>
//             <TextField name="merchantOrderNum" />
//             <TextField name="paymentSubject" />
//             <TextField name="paymentDescription" />
//             <TextField name="paymentAmount" />
//             <TextField name="returnUrl" />
//             <TextField name="notifyUrl" />
//             <TextField name="paymentCustomer" />
//             <TextField name="currencyCode" />
//           </Form>
//         </Content>
//       </>
//     ),
//     []
//   );
// };

// export default PayTest;
