/* eslint-disable no-param-reassign */
const routers = require.context('./routers', false, /\.js$/);
// eslint-disable-next-line import/no-mutable-exports
let convertRouter = [];
// const servicePath = '/s2-mall';

// function getComponent(arr) {
//   arr.forEach((r) => {
//     if (r.path) {
//       r.path = `${servicePath}${r.path}`;
//     }
//   });
//   return arr;
// }

routers.keys().forEach((key) => {
  const newRouters = routers(key);
  convertRouter = convertRouter.concat(newRouters);
});
export default convertRouter;
