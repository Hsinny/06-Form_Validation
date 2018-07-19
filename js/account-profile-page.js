// -------------------------------------------------------------------------
// 迴圈產生選單的 option 選項 (年月日)
// -------------------------------------------------------------------------  
var yearEl = document.getElementById('birth-year');
var monthEl = document.getElementById('birth-month');
var dayEl = document.getElementById('birth-day');
var countDown = true;

function optionItem(start, end, el, dateStr, countDown) {
  var str = '';
  var firstOption = `<option selected disabled="disabled">${dateStr}</option>`;
  if (!countDown) {
    for (var i = start; i < end + 1; i++) {
      var option = `<option>${i}</option>`;
      str += option;
    }
  } else {
    for (var i = end; i > start - 1; i--) {  // 年份用遞減倒序
      var option = `<option>${i}</option>`;
      str += option;
    }
  }
  el.innerHTML = firstOption + str;
  // el.innerHTML = str;
}

optionItem(1, 31, dayEl, '日');
optionItem(1, 12, monthEl, '月');
optionItem(1900, 2018, yearEl, '西元年', countDown);



// ------------------------------------------------------------------------
// 縣市地區選單
// ------------------------------------------------------------------------
var cityEl = document.getElementById('city');
var regionEl = document.getElementById('region');
var cityData, regionData;    // 用來存放 json 內的縣市、地區資料

// 縣市選單
function cityOption(dataArray, el) {
  var str = '';
  for (let i = 0; i < dataArray.length; i++) {
    var option = `<option>${dataArray[i]}</option>`;
    str += option;
  }
  el.innerHTML = str;
}

// 地區選單：找出選取到的縣市索引值，再帶出第幾筆陣列
function regionOption(e) {
  for (let i = 0; i < cityData.length; i++) {
    if (e.target.value === cityData[i]) {
      var cityIndex = i;
      break;
    }
  }
  cityOption(regionData[cityIndex], regionEl);
}


var xhrCity = new XMLHttpRequest();
xhrCity.open('get', '../city.json', true); //https://hsinny.github.io/06-Form_Validation/city.json
xhrCity.send('');
xhrCity.onload = function () {
  var callbackData = JSON.parse(xhrCity.responseText);
  cityData = callbackData.city;
  regionData = callbackData.region;
  cityOption(cityData, cityEl);
}

cityEl.addEventListener('change', regionOption, false);