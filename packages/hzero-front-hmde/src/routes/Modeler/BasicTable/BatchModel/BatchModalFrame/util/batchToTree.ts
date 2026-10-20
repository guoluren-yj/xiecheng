interface INodeData {
  grade: string;
  type: string;
  name: string;
  id: string | number;
  schemaName: string;
  dataSourceType: string;
  serviceCode: string;
}
type IBatchToTree = (ret: INodeData[]) => any[] | undefined;
const BatchToTree: IBatchToTree = (ret) => {
  const serviceMap = {};
  if (ret) {
    ret.forEach((item) => {
      if (serviceMap[item.serviceCode] === undefined) {
        serviceMap[item.serviceCode] = {
          id: item.serviceCode,
          serviceCode: item.serviceCode,
          children: [item],
        };
      } else {
        serviceMap[item.serviceCode].children.push(item);
      }
    });
    const dbMap = {};
    Object.keys(serviceMap).forEach((key) => {
      serviceMap[key].children.forEach((ele) => {
        const dbName = `${serviceMap[key].serviceCode}?${ele.schemaName}`;
        if (dbMap[dbName] === undefined) {
          dbMap[dbName] = {
            serviceCode: serviceMap[key].serviceCode,
            id: ele.schemaName,
            schemaName: ele.schemaName,
            dataSourceType: ele.dataSourceType,
            children: [ele],
          };
        } else {
          dbMap[dbName].children.push(ele);
        }
      });
      serviceMap[key].children = [];
    });
    Object.keys(serviceMap).forEach((servicekey) => {
      Object.keys(dbMap).forEach((dbkey) => {
        if (dbMap[dbkey].serviceCode === serviceMap[servicekey].serviceCode) {
          serviceMap[servicekey].children.push(dbMap[dbkey]);
        }
      });
    });
    // eslint-disable-next-line no-param-reassign
    return Object.keys(serviceMap).map((v) => ({
      dataSourceId: v,
      ...serviceMap[v],
    }));
  }
};
export default BatchToTree;
