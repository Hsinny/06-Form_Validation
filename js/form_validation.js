// JavaScript validation of subscription form.
// A. Anonymous function triggered by submit event 
// B. Functions called to perform generic checks by anon function in section A
// C. Functions called to perform generic checks by anon function in section A
// D. Functions to get / set / show / remove error messages
// E. Object to check type of data using RegEx called by validateTypes in section B

// Dependencies: jQuery, jQueryUI, birthday.js, styles.css

(function () {

  //  document.forms.register.noValidate = true; // 關閉 HTML5 預設的表單驗證
  var formEl = document.querySelectorAll('form');
  for (let i = 0; i < formEl.length; i++) {
    formEl[i].addEventListener('submit', function (e) {
      var elements = this.elements;            // form.elements => form 裡的所有表單控制元件集合
      var isValid;                             // 檢測表單控制元件的驗證狀態
      var valid = {};                          // 自訂驗證物件
      var isFormValid;                         // 檢測整個表單
      // 對每一個表單控制元件執行"通用檢測"
      for (let i = 0; i < (elements.length - 1); i++) {       // 迴圈 -1 為減掉 submit 按鈕元件
        // validateRequired() 驗證欄位是否為必填 && validateTypes() 輸入的值是否有效
        // isValid = validateRequired(elements[i]) && validateNames(elements[i]);

        if (validateRequired(elements[i])) {
          isValid = validateNames(elements[i]);
        } else {
          isValid = false;
        }

        if (!isValid) {                        // 如果元件未通過這兩種檢測
          showErrorMessage(elements[i]);       // 顯示錯誤訊息
        } else {                               // 否則
          removeErrorMessage(elements[i]);     // 移除錯誤訊息
        }
        valid[elements[i].id] = isValid;        // 將元件加入至 valid 物件
      }                                         // 迴圈結束


      // 執行自訂驗證
      // 若註冊表單存在，才執行
      if (document.getElementById('form-join')) {
        if (formEl[i].id === 'form-join') {
          // Comfirm password
          if (!validateComfirmPassword(formEl[i])) {
            showErrorMessage(document.getElementById('conf-password-join'));
            valid.confPassword = false;
          } else {
            removeErrorMessage(document.getElementById('conf-password-join'));
          }
        }
      }


      // 是否通過檢測 / 可否送出表單？
      // 迴圈巡訪 valid 物件，如果有任何錯誤，設定 isFormValid 為 false
      for (var field in valid) {          // 檢測 valid 物件的特性
        if (!valid[field]) {              // 如果特型值為無效
          isFormValid = false;
          break;                          // 發現有元件欄位錯誤，停止迴圈
        }
        isFormValid = true;               // 欄位皆正確，表單可以送出
      }

      // 如果表單未通過驗證，停止表單送出
      if (!isFormValid) {
        e.preventDefault();
      } else {
        e.preventDefault();
        sendForm(formEl[i]);
      }
    }, false)
  }
  //  END: anonymous function triggered by the submit button


  // -------------------------------------------------------------------------
  // B) 執行通用檢測
  // -------------------------------------------------------------------------

  // 通用檢測：檢查 required 屬性 & 是否有輸入內容
  // (1) isRequired()      檢測元件是否有 required 屬性，如果為必填 
  // (2) isEmpty()         檢查欄位是否有輸入內容
  // (3) setErrorMessage() 如果沒有輸入內容，設定錯誤訊息
  function validateRequired(el) {
    if (isRequired(el)) {                           // 如果元件欄位為必填
      var valid = !isEmpty(el);                     // 欄位是否為空 ( 空值 true / false )?
      if (!valid) {                                 // 如果 valid 變數為 false
        setErrorMessage(el, '請輸入');               // 設定錯誤訊息
      }
      return valid;                                 // 回傳 valid 變數 (true or false)?
    }
    return true;                                    // 如果欄位為設為必填，回傳 true
  }

  // 檢測欄位是否有 required 屬性，包含辨別瀏覽器是否為現代新版、支援HTML5
  // 由 validateRequired() 呼叫使用
  function isRequired(el) {
    return ((typeof el.required === 'boolean') && el.required) ||
      (typeof el.required === 'string');
  }

  // 檢測欄位是否為空
  // 由 validateRequired() 呼叫使用
  function isEmpty(el) {
    return !el.value || el.value === el.placeholder; // 空值 => return true
  }

  // 驗證不同 type 的輸入框
  // Relies on the validateType object (shown at end of IIFE)
  function validateTypes(el) {
    if (!el.value) return false;                               // 欄位沒有值就傳 false 返回 (原始碼為true)
    // Otherwise get the value from .data()
    var type = $(el).data('type') || el.getAttribute('type');  // 擷取輸入框的 type
                                                               // 另外使用 getAttribute() 
                                                               // 則為若瀏覽器無法辨識 HTML5 的 DOM 特性，則會值街回傳text值
    if (typeof validateType[type] === 'function') { // validateType 為自訂物件，[type]為物件key值
                                                    // 此元件的 type 是否有在檢測方法內
      return validateType[type](el);                // 若通過檢測方法會得到回傳的 true，再回傳 true
    } else {                                        
      return true;
    }
  }

  // 抓表單元件的 name 值來驗證輸入框，通過不為空值才會執行驗證
  function validateNames(el) {
    // if (!el.value) return false;                            // 欄位沒有值就傳 false 返回 (原始碼為true)
    // Otherwise get the value from .data()
    var name = $(el).data('name') || el.getAttribute('name');  // 擷取輸入框的 name
    // 另外使用 getAttribute() 
    // 則為若瀏覽器無法辨識 HTML5 的 DOM 特性，則會值街回傳text值
    if (typeof validateType[name] === 'function') {            // validateType 為自訂物件，[type]為物件key值
      // 此元件的 type 是否有在檢測方法內
      return validateType[name](el);                           // 若通過檢測方法會得到回傳的 true，再回傳 true
    } else {
      return true;
    }
  }

  // -------------------------------------------------------------------------
  // C) FUNCTIONS FOR CUSTOM VALIDATION
  // -------------------------------------------------------------------------

  // Check passwords again 元件值與密碼相同
  function validateComfirmPassword() {
    var password = document.getElementById('password-join');  
    var confPassword = document.getElementById('conf-password-join');
    
    var valid = (confPassword.value === password.value) && (confPassword.value.length >= 8) ; 
    if (!valid) {
      if (confPassword.value.length < 1) {
        setErrorMessage(confPassword, '請輸入');
      } else if ((confPassword.value.length < 8) && (confPassword.value.length >= 1)) {
        setErrorMessage(confPassword, '請輸入8-12碼數字英文 ( 至少包含一個大寫字母、一個小寫字母、一個數字 )');
      } else {
        setErrorMessage(confPassword, '兩次輸入密碼不同');
      }
    }
    return valid;
  }



  // -------------------------------------------------------------------------
  // D) FUNCTIONS TO SET / GET / SHOW / REMOVE ERROR MESSAGES
  // -------------------------------------------------------------------------

  // 元件設定錯誤訊息
  // 由 validateRequired() 呼叫使用
  function setErrorMessage(el, message) {
    $(el).data('errorMessage', message);                 // 將錯誤訊息儲存於目標元件中
                                                         // jQuery 的 .data('key', value)
                                                         // 需要在某個DOM元素上附加額外的非原生屬性，
                                                         // 通常是用來給程式做為判斷或識別的資料，
                                                         // 以前的做法就是直接在HTML tag中給定一個屬性與資料，
                                                         // 但是這樣的做法會讓資料曝露在原始碼中 )
  }
  
  function getErrorMessage(el) {
    return $(el).data('errorMessage') || $(el).title;       // Get error message or title of element
  }

  // 欄位未通過檢測，顯示錯誤訊息
  function showErrorMessage(el) {
    var $el = $(el);                                     // 未通過檢測的欄位元件
    var errorContainer = $el.siblings('.error.message'); // .siblings() 目前選取集合的所有兄弟元件，有符合此class的兄弟
                                                         // Any siblings holding an error message

    if (!errorContainer.length) {   
      $el.addClass('error');
      $el.removeClass('ok');
      // 建立<span>來保存錯誤，並加入到錯誤元件的後方
      errorContainer = $('<span class="error message"></span>').insertAfter($el);
    }
    errorContainer.text(getErrorMessage(el));             // 加入錯誤訊息文字內容
  }

  function removeErrorMessage(el) {
    var errorContainer = $(el).siblings('.error.message'); // Get the sibling of this form control used to hold the error message
    $(el).removeClass('error');
    $(el).removeClass('message');
    $(el).addClass('ok');
    errorContainer.remove();                               // Remove the element that contains the error message
  }



  // -------------------------------------------------------------------------
  // E) 建立物件以驗證資料型別
  // -------------------------------------------------------------------------

  // 檢查值是否為有效，無效設定錯誤訊息
  // 有效返回 true，無效 false
  // validateTypes() 函式內用到
  var validateType = {
    email: function (el) {                                 // 建立 Email 檢測方法
      var valid = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(el.value);
                                                           // 正規標示法，通過檢測會得到 true
      if (!valid) {                                        // 若 false 沒通過檢測，設定錯誤訊息
        setErrorMessage(el, '請輸入有效的電子郵件地址'); 
      }
      return valid;                                   
    },
    password: function (el) {  
      var valid = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,12}$/.test(el.value); // 限制：{8-12}字元，至少有一個數字/小寫英文字母/大寫英文字母               
      if (!valid) {
        setErrorMessage(el, '請輸入8-12碼數字英文 ( 至少包含一個大寫字母、一個小寫字母、一個數字 )');
      }
      return valid;
    },
    confPassword: function (el) {
      var valid = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,12}$/.test(el.value); // 限制：{8-12}字元，至少有一個數字/小寫英文字母/大寫英文字母               
      if (!valid) {
        setErrorMessage(el, '請輸入8-12碼數字英文 ( 至少包含一個大寫字母、一個小寫字母、一個數字 )');
      }
      return valid;
    },
    phone: function (el) {                             // 建立 手機號碼 檢測方法
      var valid = /^[09]{2}[0-9]{8}$/.test(el.value);
      // 正規標示法，通過檢測會得到 true
      if (!valid) {                                    // 若 false 沒通過檢測，設定錯誤訊息
        setErrorMessage(el, '請輸入有效的手機號碼');
      }
      return valid;
    },
    birthYear: function (el) {                         // 數字檢測方法
      var valid = /^\d+$/.test(el.value);
      if (!valid) {
        setErrorMessage(el, '請選擇');
      }
      return valid;
    },
    birthMonth: function (el) {                       // 數字檢測方法
      var valid = /^\d+$/.test(el.value);
      if (!valid) {
        setErrorMessage(el, '請選擇');
      }
      return valid;
    },
    birthDay: function (el) {                          // 數字檢測方法
      var valid = /^\d+$/.test(el.value);
      if (!valid) {
        setErrorMessage(el, '請選擇');
      }
      return valid;
    },
    city: function (el) {     
      if (el.value === '請選擇'){
        var valid = false;
      } else { 
        var valid = true;
      }
      if (!valid) {
        setErrorMessage(el, '請選擇');
      }
      return valid;
    },
    region: function (el) {
      if (el.value === '請選擇') {
        var valid = false;
      } else {
        var valid = true;
      }
      if (!valid) {
        setErrorMessage(el, '請選擇');
      }
      return valid;
    },
    cardNumber: function (el) {
      var valid = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6011[0-9]{12}|622((12[6-9]|1[3-9][0-9])|([2-8][0-9][0-9])|(9(([0-1][0-9])|(2[0-5]))))[0-9]{10}|64[4-9][0-9]{13}|65[0-9]{14}|3(?:0[0-5]|[68][0-9])[0-9]{11}|3[47][0-9]{13})*$/.test(el.value);                              // 信用卡號       
      if (!valid) {
        setErrorMessage(el, '請輸入有效卡號');
      }
      return valid;
    },
    cvvNumber: function (el) {
      var valid = /^(\d){3}$/.test(el.value); // 3個數字             
      if (!valid) {
        setErrorMessage(el, '請輸入3位數字');
      }
      return valid;
    },
    date: function (el) {                                  // 建立日期檢測方法
      var valid = /^(\d{2}\/\d{2}\/\d{4})|(\d{4}-\d{2}-\d{2})$/.test(el.value);
      if (!valid) {                                        
        setErrorMessage(el, 'Please enter a valid date'); 
      }
      return valid;                                     
    }
  };



  // -------------------------------------------------------------------------
  // F) 離開輸入框，再次檢測欄位
  // -------------------------------------------------------------------------
  var storeEl = [];

  for (let i = 0; i < formEl.length; i++) {
    var elements = formEl[i].elements;  

    for (let i = 0; i < elements.length; i++) {
      storeEl.push(elements[i]);
    }
  }

  for (let i = 0; i < storeEl.length; i++){
    // 所有 input 監聽，離開此元件焦點時觸發檢測
    storeEl[i].addEventListener('blur', function () {

        if (validateRequired(storeEl[i])) {
          isValid = validateNames(storeEl[i]);
        } else {
          isValid = false;
        }

        if (!isValid) {     
          showErrorMessage(storeEl[i]);       // 顯示錯誤訊息
        } else {                               // 否則
          removeErrorMessage(storeEl[i]);     // 移除錯誤訊息
        }

      if ((storeEl[i]) == document.getElementById('conf-password-join')) {
        // Comfirm password
        if (!validateComfirmPassword(storeEl[i])) {
           showErrorMessage(document.getElementById('conf-password-join'));
          } else {
           removeErrorMessage(document.getElementById('conf-password-join'));
          }
        }
      }, false);
  }



  // -------------------------------------------------------------------------
  // G) 送出註冊表單
  // -------------------------------------------------------------------------
  // AJAX post 向伺服器取得 Email 帳號 
  //   1. 透過XMLHttpRequest()物件向伺服器請求資料
  //   2. 設定請求資料 => .open( 方法 get / post , 資料網址, true 同步 / false 非同步)
  //   3. xhr.setRequestHeader('Content-type','application/json')  => 告訴伺服器傳送的資料格式，使用json格式
  //   3. 發送請求 => .send() ，括號內傳送的內容格式需為string
  //   4. 瀏覽器撈到資料後觸發 => .onload(XMLHttpRequest物件裡的方法)
  //   5. 撈到的資料放在 XMLHttpRequest物件的.responseText
  //   6. 撈到的資料格式為string，轉成object => JSON.parse()
  //   7. 信箱已註冊返回表單，註冊成功跳至會員中心
  // -------------------------------------------------------------------------
  function goHref(formEl) {
    var goHref = formEl.dataset.href;
    location.href = goHref;    // 跳轉至指定的 url 頁面
  }

  var account = {};                // 儲存要傳送給伺服器的資料

  function sendForm(formEl){
    var $formEl = $(formEl);       // 轉成 jquery 元件
    if (document.getElementById('email-login')){  // 有登入元件，表示在index.html
      var $emailEl = $formEl.find('.email');
      var $emailStr = $emailEl.val();
      account.email = $emailStr;   // 資料使用 json 格式

      var xhr = new XMLHttpRequest();
      xhr.open('post', 'https://www.thef2e.com/api/isSignUp', true);
      xhr.setRequestHeader('Content-type', 'application/json');
      var data = JSON.stringify(account);
      xhr.send(data);
      loading();                   // loading 動畫

      xhr.onload = function () {
        removeLoading();           // 撈到資料，關閉 loading 動畫

        var callbackData = JSON.parse(xhr.responseText);
        var veriStr = callbackData.success;  // 此 Email 已報名過 => true
         
        if (formEl.id === "form-join"){
          if (veriStr) {
            setErrorMessage($emailEl, '此信箱已註冊');
            showErrorMessage($emailEl);
          } else {
            removeErrorMessage($emailEl);
            goHref(formEl);
          }
        } else if (formEl.id === "form-login") {
          if (veriStr) {
            localStorage.setItem('account', data);  // 紀錄登入帳號，存到localStorage
            removeErrorMessage($emailEl);
            goHref(formEl);
          } else {
            setErrorMessage($emailEl, '此信箱未註冊');
            showErrorMessage($emailEl);
          }
        }
      } 
    } else {
      // 換頁前，我想要有1秒的loading()效果
      goHref(formEl);
    }
  }




  // -------------------------------------------------------------------------
  // 撈取登入帳號的作品資料
  // -------------------------------------------------------------------------
  if (window.location.pathname === '/account.html') {
    
    var accountGet = localStorage.getItem('account');
  
    var xhrAccount = new XMLHttpRequest();
    xhrAccount.open('post', 'https://www.thef2e.com/api/stageCheck', true);
    xhrAccount.setRequestHeader('Content-type', 'application/json');
    xhrAccount.send(accountGet);
    loading();

    var items = document.getElementById('item')
    var DOMstr = '';
 
    xhrAccount.onload = function (){
      removeLoading(); 

      var callbackData = JSON.parse(xhrAccount.responseText);

      /*===================================================================*/
      /* 讀取 callbackData 的資料，生成 DOM 元件，更新網頁內容
      /*===================================================================*/

      if (callbackData.length == 0 ) {
        alert('你尚未繳件');
      } else {
      }

      for (let i = 0; i < callbackData.length; i++) {
        addItemToDOM(callbackData[i], i);
      }
      items.innerHTML = DOMstr;
    }
  }


  // stage 名稱 & 圖片
  var itemObj = [
    { name: 'Todo List',
      img: 'stage-01.jpg'
    },
    {
      name: 'Filter',
      img: 'stage-02.jpg'
    },
    {
      name: 'Admin Order',
      img: 'stage-03.jpg'
    },
    {
      name: 'Product Gallery',
      img: 'stage-04.jpg'
    },
    {
      name: 'Comic Viewer',
      img: 'stage-05.jpg'
    },
    {
      name: 'Form',
      img: 'stage-06.jpg'
    },
    {
      name: 'Game',
      img: 'stage-01.jpg'
    },
    {
      name: '尚未公布',
      img: 'banner-01-thef2e.jpg'
    },
    {
      name: '尚未公布',
      img: 'banner-01-thef2e.jpg'
    }
  ]
  

  function addItemToDOM(item, j){

    var tagGroup = item.tag; // string 分割
    var tagArray = tagGroup.split(', ');
    var itemTagStr = '';

    for (let i = 0; i < tagArray.length; i++){
      itemTagStr += `<span class="badge badge-info">${tagArray[i]}</span>`;
    }

    var stageTime = new Date(item.timeStamp);
    var itemTimeStr = stageTime.getFullYear() + '/' + 
                     (stageTime.getMonth()+1) + '/' + 
                      stageTime.getDate() + ' ' +
                      stageTime.getHours() + ':' +
                      stageTime.getMinutes() + ':' +
                      stageTime.getSeconds();

    DOMstr = DOMstr +
              `<div class="card card-customized">
                <div class="card-img">
                  <img class="card-img-aside" src="images/${itemObj[j].img}" weight="400" height="230" alt="">
                </div>
                <div class="card-body">
                  <h5 class="card-title">${itemObj[j].name}</h5>
                  <dl class="card-text dl-customized">
                    <dt>繳件時間：</dt>
                    <dd class="item-date">${itemTimeStr}</dd>
                    <dt>作品網址：</dt>
                    <dd><a class="item-link" href="${item.url}" target="_blank">${item.url}</a></dd>
                    <dt>挑戰技術：</dt>
                    <dd class="item-pill">${itemTagStr}</dd>
                  </dl>
                </div>
                <div class="card-footer text-muted">
                  <div class="card-footer-img"><img class="" src="images/icon-trophy.svg" alt=""></div>
                </div>
              </div>`;
  }

  // -------------------------------------------------------------------------
  // 迴圈產生選單的 option 選項 (年月日)
  // -------------------------------------------------------------------------
  function optionItem(el) {
    var str = '';
    var from = parseInt(el.dataset.from);  // data-*屬性取出的值，型態為字串，做數字運算會出錯，需轉型
    var to = parseInt(el.dataset.to);
    var unit = (el.dataset.unit);
    var firstOption = `<option selected disabled="disabled">${unit}</option>`;

    if (from < to) {
      for (var i = from; i < to + 1; i++) {
        var option = `<option>${i}</option>`;
        str += option;
      }
    } else {
      for (var i = from; i > to - 1; i--) {
        var option = `<option>${i}</option>`;
        str += option;
      }
    }
    el.innerHTML = firstOption + str;
  }

  if (document.querySelector('select')) {      // 頁面中有 <select> 元件才往下執行
    var selectEls = document.querySelectorAll('select');
    for (let i = 0; i < selectEls.length; i++) {
      if (selectEls[i].dataset.from) {         // 判斷 <select> 有無data-from
        optionItem(selectEls[i]);
      }
    }
  }



  // ------------------------------------------------------------------------
  // 縣市地區選單
  // ------------------------------------------------------------------------
 
  // 縣市選單
  function cityOption(dataArray, el) {
    var str = '';
    var firstOption = `<option selected disabled="disabled" style="color:red;">請選擇</option>`;
    for (let i = 0; i < dataArray.length; i++) {
      var option = `<option>${dataArray[i]}</option>`;
      str += option;
    }
    el.innerHTML = firstOption + str;
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

  // 有<select id="city">才執行
  if (document.getElementById('city')) {
    var cityEl = document.getElementById('city');
    var regionEl = document.getElementById('region');
    var cityData, regionData;    // 用來存放 json 內的縣市、地區資料

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
  }



  // -------------------------------------------------------------------------
  // Loding
  // -------------------------------------------------------------------------
  function loading(){
    $('#loading').fadeIn();
    $('body').addClass('overflow');
  }

  function removeLoading() {
    $('#loading').fadeOut();
    $('body').removeClass('overflow');
  }


}());  // End of IIFE