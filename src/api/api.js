import axios from "axios";

// axios.defaults.baseURL = 'https://www.easy-mock.com/mock/5c22475a4e21841210a7015f';
 //axios.defaults.baseURL = 'http://139.217.219.205:8080';
//axios.defaults.baseURL = 'http://localhost:5001';
axios.defaults.baseURL=IPCONFIG;
// axios.defaults.baseURL='https://localhost:44373';
//带cookie
//axios.defaults.withCredentials = true;
axios.defaults.headers =  {
  'Content-Type' : 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
  'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token'
}
//登陆注册
export function loginApi(form) {
  return axios.post('/api/login', {
    ...form
  });
}

export function signupApi({name, pwd, type,}) {
  return axios.post('/api/register', {
    ...{name, pwd, type,}
  });
}

export function signOut(sessionID) {
  return axios.post('/api/logout', {
    sessionID: sessionID
  })
}

//折线图
export function getDeviceProperty(id) {
  // return axios.get(`api/deviceProperty/${id}`);

}

export function getDevicePropertyData(deviceid, propertyid) {
  return axios.get(`/api/deviceData/${deviceid}/${propertyid}`);
}

export function getDeviceMultiPropertyData(deviceId, properties) {
  return axios.post(`/api/deviceData/multipleLineChart/${deviceId}`, {...properties});
}

//网关管理
export function getGatewaysApi(searchType='all', page=1, column='id', order='asc', city, factory, workshop) {
  return axios.get(`/api/gateway?searchType=${searchType}&page=${page}&sortColumn=${column}&order=${order}&city=${city}&factory=${factory}&workshop=${workshop}`);
}

export function deleteGatewayApi(id) {
  return axios.delete(`/api/gateway/${id}`);
}

export function deleteMultipleGatewayApi(id) {
  return axios.post(`/api/gateway/batch/gateways`, {...id});
}

export function updateGatewayApi(data) {
  return axios.put(`/api/gateway/${data.id}`, {
    ...data
  });
}

export function updateThreshold(id, data) {
  return axios.put(`/api/threshold/${id}`, {...data});
}

export function addGatewayApi(data) {
  return axios.post(`/api/gateway`, {
    ...data
  });
}

export function searchGatewaysApi(data) {
  return axios.get('/api/gateway', {
    params: {
      ...data
    }
  });
}

//设备管理
export function getDevicesApi(searchType='all', page=1, column='id', order='asc', city, factory, workshop) {
  return axios.get(`/api/device?searchType=${searchType}&page=${page}&sortColumn=${column}&order=${order}&city=${city}&factory=${factory}&workshop=${workshop}`);
}

export function getDeviceNumber(searchType, city='all', factory='all', workshop='all') {
  return axios.get(`/api/device/number?searchType=${searchType}&city=${city}&factory=${factory}&workshop=${workshop}`);
}

export function getGatewayNumber(searchType, city='all', factory='all', workshop='all') {
  return axios.get(`/api/gateway/number?searchType=${searchType}&city=${city}&factory=${factory}&workshop=${workshop}`);
}

export function getDeviceDataNumber(searchType, deviceId = 'all') {
  return axios.get(`/api/deviceData/number?searchType=${searchType}&deviceId=${deviceId}`);
}

export function deleteDeviceApi(id) {
  return axios.delete(`/api/device/${id}`);
}

export function deleteMultipleDeviceApi(id) {
  return axios.post(`/api/device/batch/devices`, {...id});
}

export function getCity(page=1, column='id', order='asc', pageMode) {
  return axios.get(`/api/city?&page=${page}&sortColumn=${column}&order=${order}&pageMode=${pageMode}`);
}

export function getFactory(page=1, column='id', order='asc', pageMode) {
  return axios.get(`/api/factory?&page=${page}&sortColumn=${column}&order=${order}&pageMode=${pageMode}`);
}

export function getWorkshop(page=1, column='id', order='asc', pageMode) {
  return axios.get(`/api/workshop?&page=${page}&sortColumn=${column}&order=${order}&pageMode=${pageMode}`);
}

export function getDeviceState() {
  return axios.get('/api/deviceState');
}

export function getDeviceType() {
  return axios.get('/api/deviceType');
}

export function getGatewayState() {
  return axios.get('/api/gatewayState');
}

export function getGatewayType() {
  return axios.get('/api/gatewayType');
}


export function updateDeviceApi(data) {
  return axios.put(`/api/device/${data.id}`, {
    ...data
  });
}

export function addDeviceApi(data) {
  return axios.post(`/api/device`, {...data});
}

export function searchDevicesByDeviceNameApi(data) {
  return axios.get(`/api/device/devicename/${data}`);
}

export function searchDevicesByDeviceIdApi(data) {
  return axios.get(`/api/device/deviceid/${data}`);
}

export function searchGatewaysByGatewayIdApi(data) {
  return axios.get(`/api/gateway/gatewayname/${data}`);
}

export function searchGatewaysByGatewayNameApi(data) {
  return axios.get(`/api/gateway/gatewayid/${data}`);
}


//单个设备
export function getDeviceApi(id) {
  return axios.get(`/api/device/${id}`);
}

//设备数据
export function getDevicesDataApi(searchType='all', page=1, sortColumn='Id', order='asc', deviceId) {
  return axios.get(`/api/deviceData?searchType=${searchType}&page=${page}&sortColumn=${sortColumn}&order=${order}&deviceId=${deviceId}`);
}

export function deleteDeviceDataApi(id) {
  return axios.delete(`/api/deviceData/${id}`);
}

export function deleteMultipleDataApi(id) {
  return axios.delete(`/api/multipleDeviceData`, {
    params: {
      ...id
    }
  });
}

export function updateDeviceDataApi(data) {//
  console.log(data);
  return axios.put(`/api/deviceData/${data.id}`, {
    ...data
  });
}

export function addDeviceDataApi(data) {
  return axios.post(`/api/device`, {
    ...data
  });
}

export function searchDeviceDataApi(data) {
  return axios.get('/api/deviceData', {
    params: {
      ...data
    }
  });
}

//监控
export function getDeviceTreeApi(city, factory) {
  return axios.get(`/api/device/tree/${city}/${factory}`);
}

//告警信息
export function getAlarmInformationApi(searchType, deviceId = 'all', page = 1, sortColumn = 'Id', order = 'asc') {
  return axios.get(`/api/alarmInfo?searchType=${searchType}&deviceId=${deviceId}&page=${page}&sortColumn=${sortColumn}&order=${order}`);
}

export function updateAlarmInformationApi(data) {
  return axios.put(`/api/alarmInformation/${data.id}`, {
    ...data
  });
}

export function handleAllAlarmInformationApi(handleData, id) {
  return axios.post(`/api/alarmInformation`, {
    handleData,
    id: {
      ...id
    }
  });
}

export function searchAlarmInformationApi(data) {
  return axios.get('/api/alarmInformation', {
    params: {
      ...data
    }
  });
}

// 报表中心
// 概览
export function getReportStaticIndexHistogram1() {
  return axios.get('/api/ReportStaticIndexHistogram1');
}

export function getReportStaticIndexPieChart1() {
  return axios.get('/api/ReportStaticIndexPieChart1');
}

export function getReportStaticIndexHistogram2() {
  return axios.get('/api/ReportStaticIndexHistogram2');
}

export function getReportStaticIndexPieChart2() {
  return axios.get('/api/ReportStaticIndexPieChart2');
}

// 按天统计
export function getRegionalDimensionHistogram(selectedType, selectedSource, time) {
  return axios.get('/api/RegionalDimensionHistogram', {
    selectedType: selectedType,
    selectedSource: selectedSource,
    time: time
  });
}

export function getReportStaticDaithlyPieChart(selectedType, selectedSource, time) {
  return axios.get('/api/RegionalDimensionPieChart', {
    selectedType: selectedType,
    selectedSource: selectedSource,
    time: time
  });
}

// 按月统计
export function getReportStaticMonthlyHistogram(selectedType, selectedSource, time) {
  return axios.get('/api/ReportStaticMonthlyHistogram', {
    selectedType: selectedType,
    selectedSource: selectedSource,
    time: time
  });
}

export function getReportStaticMonthlyPieChart(selectedType, selectedSource, time) {
  return axios.get('/api/ReportStaticMonthlyPieChart', {
    selectedType: selectedType,
    selectedSource: selectedSource,
    time: time
  });
}

// 按资源类别费用统计
export function getReportStaticByCategoryTable(selectedType, selectedSource, time) {
  return axios.get('/api/ReportStaticByCategoryTable', {
    selectedType: selectedType,
    selectedSource: selectedSource,
    time: time
  });
}

export function getReportStaticByCategoryTypeHistogram(selectedType, selectedSource, time) {
  return axios.get('/api/ReportStaticByCategoryTypeHistogram', {
    selectedType: selectedType,
    selectedSource: selectedSource,
    time: time
  });
}

export function getReportStaticByCategorySubClassHistogram(selectedType, selectedSource, time) {
  return axios.get('/api/gReportStaticByCategorySubClassHistogram', {
    selectedType: selectedType,
    selectedSource: selectedSource,
    time: time
  });
}


// 按订阅费用统计
export function getReportStaticBySubscribe(year) {
  return axios.get('/api/ReportStaticBySubscribe', {
    params: {
      year: year
    }
  });
}

// 月度费用报告
export function getReportOfMonthlyExpense() {
  return axios.get('/api/getReportOfMonthlyExpense');
}


export function checkMonthlyReport(order, date) {
  return axios.get('/api/checkMonthlyReport', {
    params: {
      order: order,
      date: date
    }
  });
}

// 用户管理
// 获取所有部门 下拉框要用
export function getAllDepartments() {
  return axios.get(`/api/city`);
}

// crud


export function getUserById(id) {
  return axios.get(`/api/user/${id}`);
}

// 增加新用户
export function createNewUser(userInfo) {
  return axios.post(`/api/user`, {
    ...userInfo
  })
}

// 获取用户信息表，如果没有传参数就是获取全部
export function getUserTable(username, depart) {
  return axios.get('/api/user', {
    params: {
      username: username,
      depart: depart
    }
  });
}

// 删除用户
export function deleteUser(userID) {
  return axios.delete(`/api/user/${userID}`)
}

export function editUser(id, userInfo) {
  return axios.put(`/api/user/${id}`, {
    ...userInfo
  });
}

//  修改用户(一般改权限，传参用户id和权限名的数组)
export function editAuthorities(userID, options) {
  return axios.post(`/api/editAuthorities`, {
    userID,
    options: options
  })
}

export function getAllAuthorities() {
  return axios.get('/api/getAllAuthorities');
}

export function getAuthorities(userID) {
  return axios.get(`/api/getAuthorities/${userID}`)
}

export function getFields(searchType='all', page=1, column='device', order='asc', property, pageMode) {
  return axios.get(`/api/field?searchType=${searchType}&page=${page}&sortColumn=${column}&order=${order}&property=${property}&pageMode=${pageMode}`);
}

export function getFieldPageNumber(searchType, property) {
  return axios.get(`/api/field/number?searchType=${searchType}&property=${property}`);
}

export function addRule(rule) {
  return axios.post(`/api/threshold`, {...rule});
}

export function getAllRules(searchType, deviceName='all', page='1', order='asc', sortColumn='id') {
  console.log(`/api/threshold?searchType=${searchType}&deviceName=${deviceName}&page=${page}&order=${order}&sortColumn=${sortColumn}`);
  return axios.get(`/api/threshold?searchType=${searchType}&deviceName=${deviceName}&page=${page}&order=${order}&sortColumn=${sortColumn}`);
}

export function getRuleNumber(searchType, deviceName='all') {
  return axios.get(`/api/threshold/number?searchType=${searchType}&deviceName=${deviceName}`);
}

export function getCityOptions() {
  return axios.get(`/api/city/cityOptions`);
}

export function getFactoryOptions(cityname) {
  return axios.get(`/api/factory/factoryOptions/${cityname}`);
}

export function getWorkshopOptions(cityName,factoryname) {
  return axios.get(`/api/workshop/workshopOptions/${cityName}/${factoryname}`);
}

export function getDeviceByWorkshop(city, factory, workshop) {
  return axios.get(`/api/device/workshop/${city}/${factory}/${workshop}`);
}

export function getGatewayByWorkshop(city, factory, workshop) {
  return axios.get(`/api/gateway/workshop/${city}/${factory}/${workshop}`);
}

export function getDeviceAmount() {
  return axios.get(`/api/device/amount`);
}

export function getDashboardAlarmInfo() {
  return axios.get(`/api/alarmInfo/dashboard`);
}

export function getDeviceDataAmount() {
  return axios.get(`/api/deviceData/amount`);
}

export function getNoticeAlarmInfoAmount() {
  return axios.get(`/api/alarmInfo/noticeAmount`);
}

export function getSeriousAlarmInfoAmount() {
  return axios.get(`/api/alarmInfo/seriousAmount`);
}

export function getVerySeriousAlarmInfoAmount() {
  return axios.get(`/api/alarmInfo/verySeriousAmount`);
}

export function getDeviceStatus(id, t) {
  return axios.post(`/api/deviceData/status/${id}`, t);
}

export function getSeverity() {
  return axios.get(`/api/severity`);
}

export function addCity(city) {
  console.log(city)
  return axios.post(`/api/city`, {...city});
}

export function addFactory(factory) {
  return axios.post(`/api/factory`, {...factory});
}

export function addWorkshop(workshop) {
  return axios.post(`/api/workshop`, {...workshop});
}

export function searchUsers(username){
  return axios.get(`/api/user/name/${username}`);
}

export function getUserByName(username) {
  return axios.get(`/api/user/username/${username}`);
}

export function updatePassword(username, password){
  return axios.post(`/api/user/password/${username}`, {...password});
}

export function getAlarmInfoByDeviceid(deviceid) {
  return axios.get(`/api/alarmInfo/deviceId/${deviceid}`);
}

export function createNewField(field) {
  return axios.post(`/api/field`, {...field});
}

export function createDeviceType(type) {
  return axios.post(`/api/device/type/${type}`);
}

export function createGatewayType(type) {
  return axios.post(`/api/gateway/type/${type}`);
}

export function getMapInfo() {
  return axios.get('/api/city/mapInfo');
}

export function getOneMapInfo(cityName) {
  return axios.get(`/api/city/oneMapInfo?cityName=${cityName}`);
}

export function getAffiliateFields(deviceName) {
  return axios.get(`/api/field/affiliate/${deviceName}`);
}

// 获取所有城市的所有实验楼以及每个实验楼下的所有实验室，返回：树结构：城市->实验楼->实验室
export function getCityCascaderOptions() {
  return axios.get('/api/city/cityCascaderOptions');
}

export function getStatistic100(deviceId) {
  return axios.get(`/api/deviceData/statistic100?deviceId=${deviceId}`)
}

export function getRulesByDeviceId(deviceId) {
  return axios.get(`/api/threshold/${deviceId}`);
}

export function deleteRule(id) {
  return axios.delete(`/api/threshold/${id}`);
}

export function batchDeleteThresholds(data) {
  return axios.post('/api/threshold/batch/thresholds', {...data});
}

export function deleteDeviceData(id) {
  return axios.delete(`/api/deviceData/${id}`);
}

export function batchDeleteDeviceData(data) {
  return axios.post(`/api/deviceData/batch/deviceData`, {str: data});
}

export function updateDeviceData(id, data) {
  return axios.put(`/api/deviceData/${id}`, {...data});
}

export function getAlarmInfoNumber(searchType, deviceId){
  return axios.get(`/api/alarmInfo/number?searchType=${searchType}&deviceId=${deviceId}`);
}

export function deleteAlarmInfo(id) {
  return axios.delete(`/api/alarmInfo/${id}`);
}

export function updateAlarmInfoProcessed(id) {
  return axios.post(`/api/alarmInfo/processed/${id}`);
}

//配置管理-地域配置
export function getCityNumber(searchType, cityName = 'all') {
  return axios.get(`/api/city/number?searchType=${searchType}&cityName=${cityName}`);
}

export function getFactoryNumber(searchType, factoryName = 'all') {
  return axios.get(`/api/factory/number?searchType=${searchType}&factoryName=${factoryName}`);
}

export function getWorkshopNumber(searchType, workshopName = 'all') {
  return axios.get(`/api/workshop/number?searchType=${searchType}&workshopName=${workshopName}`);
}

export function updateCityApi(id, data) {
  return axios.put(`/api/city/${id}`, {...data});
}

export function deleteCity(id) {
  return axios.delete(`/api/city/${id}`);
}

export function deleteFactory(id) {
  return axios.delete(`/api/factory/${id}`);
}

export function updateFactory(id, data) {
  return axios.put(`/api/factory/${id}`, {...data});
}

export function deleteWorkshop(id) {
  return axios.delete(`/api/workshop/${id}`);
}

export function updateWorkshop(id, data) {
  return axios.put(`/api/workshop/${id}`, {...data});
}

export function getCityByCityName(cityName) {
  return axios.get(`/api/city/cityName/${cityName}`);
}

export function getFactoryByFactoryName(factoryName) {
  return axios.get(`/api/factory/factoryName/${factoryName}`);
}

export function getWorkshopByWorkshopName(workshopName) {
  return axios.get(`/api/workshop/workshopName/${workshopName}`);
}

export function getAuthByUid(uid) {
  return axios.get(`/api/user/getAuth/${uid}`);
}

export function getDeviceByCity(cityName, factoryName = 'all', workshopName = 'all') {
  return axios.get(`/api/device/getByCity?cityName=${cityName}&factoryName=${factoryName}&workshopName=${workshopName}`);
}

export function getRegionLevelMenu() {
  return axios.get(`/api/city/threeLevelMenu`);
}

export function getDashboardDeviceStatus() {
  return axios.get('/api/device/dashboardStatus');
}

export function getAffiliateDeviceNumber(id) {
  return axios.get(`/api/gateway/affiliateDevice/${id}`);
}

export function getDeviceAffiliateData(deviceId) {
  return axios.get(`/api/device/affiliateData/${deviceId}`);
}

export function getDeviceAffiliateAlarmInfo(deviceId) {
  return axios.get(`/api/device/affiliateAlarmInfo/${deviceId}`);
}

export function getDeviceAffiliateThreshold(deviceId) {
  return axios.get(`/api/device/affiliateThreshold/${deviceId}`);
}

export function getCityAffiliateFactory(id) {
  return axios.get(`/api/city/affiliateFactory/${id}`);
}

export function getCityAffiliateDevice(id) {
  return axios.get(`/api/city/affiliateDevice/${id}`);
}

export function getCityAffiliateGateway(id) {
  return axios.get(`/api/city/affiliateGateway/${id}`);
}

export function getFactoryAffiliateWorkshop(id) {
  return axios.get(`/api/factory/affiliateWorkshop/${id}`);
}

export function getFactoryAffiliateDevice(id) {
  return axios.get(`/api/factory/affiliateDevice/${id}`);
}

export function getFactoryAffiliateGateway(id) {
  return axios.get(`/api/factory/affiliateGateway/${id}`);
}

export function getWorkshopAffiliateDevice(id) {
  return axios.get(`/api/workshop/affiliateDevice/${id}`);
}

export function getWorkshopAffiliateGateway(id) {
  return axios.get(`/api/workshop/affiliateGateway/${id}`);
}

export function getAllAuth() {
  return axios.get('/api/user/getAllAuth');
}

export function updateUserAuth(id, auth) {
  return axios.post(`/api/user/updateUserAuth/${id}`, auth);
}

export function getDataStatistic(deviceId, t) {
  return axios.post(`/api/deviceData/statistic/${deviceId}`, t)
}

export function getDayAggregateData(deviceId, indexId, t, scale) {
  return axios.post(`/api/deviceData/aggregate/day/${deviceId}?indexId=${indexId}&scale=${scale}`, t);
}

export function getCityFactoryTree() {
  return axios.get(`/api/city/cityFactoryTree`);
}

export function getReportByRegion(cityName,factoryName, t) {
  return axios.post(`/api/report/byRegion?cityName=${cityName}&factoryName=${factoryName}`, t);
}

export function getReportByTime(t) {
  return axios.post(`/api/report/byTime`, t);
}

export function getReportByTag(t) {
  return axios.post(`/api/report/byTag`, t);
}

export function getReportByType(t) {
  return axios.post(`/api/report/byType`, t);
}

export function getDetailedDeviceType(searchType='all', page=1, column='id', order='asc', device, pageMode) {
  return axios.get(`/api/detailedDeviceType?searchType=${searchType}&page=${page}&sortColumn=${column}&order=${order}&device=${device}&pageMode=${pageMode}`);
}

export function getDevicePageNumber(searchType, device) {
  return axios.get(`/api/detailedDeviceType/number?searchType=${searchType}&device=${device}`);
}

export function uploadPicture(body) {
  return axios.post(`/api/device/uploadPicture`, body);
}

export function getPicture(deviceId) {
  return axios.get(`/api/device/getPicture/${deviceId}`);
}

export function getOneCityByName(cityName) {
  return axios.get(`/api/city/oneCityByName/${cityName}`);
}

export function getDeviceTag(id) {
  return axios.get(`/api/device/deviceTag/${id}`);
}

export function getAllTags() {
  return axios.get(`/api/device/getalltag`);
}

export function setDeviceTags(id, tags) {
  return axios.post(`/api/device/deviceTag/${id}`, {str: tags});
}

export function addTag(tagName) {
  return axios.post(`/api/device/tag?tagName=${tagName}`);
}

export function deleteTag(tagName) {
  return axios.delete(`/api/device/tag?tagName=${tagName}`);
}

export function addDeviceType(deviceType) {
  return axios.post(`/api/deviceType`, {...deviceType});
}

export function updateDeviceType(id, deviceType) {
  return axios.put(`/api/deviceType/${id}`, {...deviceType})
}

export function deleteDeviceType(id) {
  return axios.delete(`/api/deviceType/${id}`);
}

export function updateField(id, property) {
  return axios.put(`/api/field/${id}`, {...property});
}

export function deleteField(id) {
  return axios.delete(`/api/field/${id}`);
}

export function findTagAffiliation(tagName) {
  return axios.get(`/api/device/tag/affiliation?tagName=${tagName}`);
}

export function getFieldAffiliateData(fieldId) {
  return axios.get(`/api/field/affiliateData/${fieldId}`);
}

export function getDeviceTypeAffiliateDevice(id) {
  return axios.get(`/api/deviceType/affiliate/${id}`);
}

export function getDeviceIdExist(deviceId) {
  return axios.get(`/api/device/exist/${deviceId}`);
}

export function getGatewayIdExist(gatewayId) {
  return axios.get(`/api/gateway/exist/${gatewayId}`);
}

export function batchDeleteAlarmInfo(str) {
  return axios.post(`/api/alarmInfo/batchDelete`, {...str});
}

//平台三级名称配置
export function getAllName() {
  return axios.get('/api/theme')
}

export function deleteName(id) {
  return axios.delete(`/api/theme/${id}`)
}

export function addName(newName) {
  return axios.post(`/api/theme`,{...newName})

}

export function updateName(id, updateName) {
  return axios.put(`/api/theme/${id}`,{...updateName})
}

export function changeGlobalName(id, selection) {
  return axios.put(`/api/theme/allUserTheme/${id}`,{...selection})
}

export function getNewName(id) {
  return axios.get(`/api/theme/${id}`)
}

export function getUserThreeLevelName(uid) {
  return axios.get(`/api/user/${uid}`)
}

export function getDeviceLocation(deviceName) {
  return axios.get(`/api/device/deviceLocation?deviceName=${deviceName}`);
}

export function getDeviceDataInDeviceCard(deviceName) {
  return axios.get(`/api/deviceData/dataInDeviceCard?deviceName=${deviceName}`);
}

export function getDeviceDataInDeviceProperty(deviceName) {
  return axios.get(`/api/deviceData/dataInDeviceProperty?deviceName=${deviceName}`);
}

export function getAlarmInfoInAlarmRecord(deviceName) {
  return axios.get(`/api/deviceData/dataInAlarmRecord?deviceName=${deviceName}`);
}

export function getRuleInDeviceAlarmingRule(deviceName) {
  return axios.get(`/api/deviceData/ruleInDeviceAlarmingRule?deviceName=${deviceName}`);
}

export function get100DataInDataStatistic(deviceName) {
  return axios.get(`/api/deviceData/100DataInDataStatistic?deviceName=${deviceName}`);
}

export function getFieldByDeviceName(deviceName) {
  return axios.get(`/api/deviceData/affiliateField?deviceName=${deviceName}`);
}

export function getHourAggregateData(deviceName, fieldId, time) {
  return axios.post(`/api/deviceData/hourAggregateData?deviceName=${deviceName}&fieldId=${fieldId}`, time);
}

export function getDayAggregateDataInDataStatistic(deviceName, fieldId, time) {
  return axios.post(`/api/deviceData/dayAggregateData?deviceName=${deviceName}&fieldId=${fieldId}`, time);
}

export function getMonthAggregateData(deviceName, fieldId, time) {
  return axios.post(`/api/deviceData/monthAggregateData?deviceName=${deviceName}&fieldId=${fieldId}`, time);
}

//workshop
export function listWorkshopName(cityName,factoryName){
  return axios.get(`/api/Workshop/workshopNameList/${cityName}/${factoryName}`);
}