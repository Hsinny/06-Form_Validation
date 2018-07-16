// JavaScript validation of subscription form.
// A. Anonymous function triggered by submit event 
// B. Functions called to perform generic checks by anon function in section A
// C. Functions called to perform generic checks by anon function in section A
// D. Functions to get / set / show / remove error messages
// E. Object to check type of data using RegEx called by validateTypes in section B

// Dependencies: jQuery, jQueryUI, birthday.js, styles.css

(function () {
  document.forms.register.noValidate = true; // 關閉 HTML5 預設的表單驗證
  // -------------------------------------------------------------------------
  //  A) 監聽事件觸發
  // -------------------------------------------------------------------------
  $('form').on('submit', function (e) {      // 當表單被送出
    var elements = this.elements;            // form.elements => form 裡的所有表單控制元件集合
    var isValid;                             // 檢測表單控制元件的驗證狀態
    var valid = {};                          // Custom valid object
    
    var isFormValid;                         // isFormValid: checks entire form

    // 對每一個表單控制元件執行"通用檢測"
    for (let i = 0; i < (elements.length - 1); i++) {       // 迴圈 -1 為減掉 submit 按鈕元件
      // validateRequired() 驗證欄位是否為必填 && validateTypes() 輸入的值是否有效
      isValid = validateRequired(elements[i]) && validateTypes(elements[i]);
      if (!isValid) {                        // 如果元件未通過這兩種檢測
        showErrorMessage(elements[i]);       // 顯示錯誤訊息
      } else {                               // 否則
        removeErrorMessage(elements[i]);     // 移除錯誤訊息
      }                                  
      valid[elements[i].id] = isValid;        // 將元件加入至 valid 物件
    }                                         // 迴圈結束

    // PERFORM CUSTOM VALIDATION
    // bio (you could cache bio input in variable here)
    // if (!validateBio()) {                // Call validateBio(), and if not valid
    //   showErrorMessage(document.getElementById('bio')); // Show error message
    //   valid.bio = false;                 // Update valid object - this element is not valid
    // } else {                             // Otherwise remove error message
    //   removeErrorMessage(document.getElementById('bio'));
    // }

    // Email 
    if (!validateEmail()) {
      showErrorMessage(document.getElementById('email'));
      valid.email = false;
    } else {
      removeErrorMessage(document.getElementById('email'));
    }

    // password (you could cache password input in variable here)
    if (!validatePassword()) {          // Call validatePassword(), and if not valid
      showErrorMessage(document.getElementById('password')); // Show error message
      valid.password = false;           // Update the valid object - this element is not valid
    } else {                            // Otherwise remove error message
      removeErrorMessage(document.getElementById('password'));
    }

    // Comfirm password
    if (!validateComfirmPassword()) {
      showErrorMessage(document.getElementById('conf-password'));
      valid.confPassword = false;
    } else {
      removeErrorMessage(document.getElementById('conf-password'));
    }

    // parental consent (you could cache parent-consent in variable here)
    // if (!validateParentsConsent()) {     // Call validateParentalConsent(), and if not valid
    //   showErrorMessage(document.getElementById('parents-consent')); // Show error message
    //   valid.parentsConsent = false;      // Update the valid object - this is not valid
    // } else {                             // Otherwise remove error message
    //   removeErrorMessage(document.getElementById('parents-consent'));
    // }

    // DID IT PASS / CAN IT SUBMIT THE FORM?
    // Loop through valid object, if there are errors set isFormValid to false
    for (var field in valid) {          // Check properties of the valid object
      if (!valid[field]) {              // If it is not valid
        isFormValid = false;            // Set isFormValid variable to false
        break;                          // Stop the for loop, an error was found
      }                                 // Otherwise
      isFormValid = true;               // The form is valid and OK to submit
    }


    // If the form did not validate, prevent it being submitted
    if (!isFormValid) {                 // If isFormValid is not true
      e.preventDefault();               // Prevent the form being submitted
    }

  });                                   // End of event handler anon function
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
        setErrorMessage(el, 'Field is required');   // 設定錯誤訊息
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
      return validateType[type](el);                // If yes, check if the value validates
    } else {                                        // If not
      return true;                                  // Return true because it cannot be tested
    }
  }

  // -------------------------------------------------------------------------
  // C) FUNCTIONS FOR CUSTOM VALIDATION
  // -------------------------------------------------------------------------

  // IF USER IS UNDER 13, CHECK THAT PARENTS HAVE TICKED THE CONSENT CHECKBOX
  // Dependency: birthday.js (otherwise check does not work)
  function validateParentsConsent() {
    var parentsConsent = document.getElementById('parents-consent');
    var consentContainer = document.getElementById('consent-container');
    var valid = true;                          // Variable: valid set to true
    // if (consentContainer.className.indexOf('hide') === -1) { // If checkbox shown
    //   valid = parentsConsent.checked;          // Update valid: is it checked/not
    //   if (!valid) {                            // If not, set the error message
    //     setErrorMessage(parentsConsent, 'You need your parents\' consent');
    //   }
    // }
    return valid;                               // Return whether valid or not
  }

  // Check if the bio is less than or equal to 140 characters
  function validateBio() {
    var bio = document.getElementById('bio');
    var valid = bio.value.length <= 140;
    if (!valid) {
      setErrorMessage(bio, 'Please make sure your bio does not exceed 140 characters');
    }
    return valid;
  }

  // Check Email
  function validateEmail() {
    var email = document.getElementById('email');
    var valid = email.value.length >= 8;
    if (!valid) {
      setErrorMessage(email, 'INVALID EMAIL');
    }
    return valid;
  }

  // Check that the passwords both match and are 8 characters or more
  function validatePassword() {
    var password = document.getElementById('password');
    var valid = password.value.length >= 8;
    if (!valid) {
      setErrorMessage(password, 'INIMUM 8 CHARACTERS');
    }
    return valid;
  }

  // Check passwords again
  function validateComfirmPassword() {
    var confPassword = document.getElementById('conf-password');
    var valid = (confPassword.value === password.value);
    if (!valid) {
      setErrorMessage(password, 'NOT MATCH');
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
    return $(el).data('errorMessage') || el.title;       // Get error message or title of element
  }

  // 欄位未通過檢測，顯示錯誤訊息
  function showErrorMessage(el) {
    var $el = $(el);                                     // 未通過檢測的欄位元件
    var errorContainer = $el.siblings('.error.message'); // .siblings() 目前選取集合的所有兄弟元件，有符合此class的兄弟
                                                         // Any siblings holding an error message
    console.log(errorContainer);

    if (!errorContainer.length) {                         // 如果沒有發現錯誤
      // 建立<span>來保存錯誤，並加入到錯誤元件的後方
      errorContainer = $('<span class="error message"></span>').insertAfter($el);
    }
    errorContainer.text(getErrorMessage(el));             // 加入錯誤訊息文字內容
  }

  function removeErrorMessage(el) {
    var errorContainer = $(el).siblings('.error.message'); // Get the sibling of this form control used to hold the error message
    errorContainer.remove();                               // Remove the element that contains the error message
  }



  // -------------------------------------------------------------------------
  // E) OBJECT FOR CHECKING TYPES
  // -------------------------------------------------------------------------

  // Checks whether data is valid, if not set error message
  // Returns true if valid, false if invalid
  var validateType = {
    email: function (el) {                                 // Create email() method
      // Rudimentary regular expression that checks for a single @ in the email
      var valid = /[^@]+@[^@]+/.test(el.value);            // Store result of test in valid
      if (!valid) {                                        // If the value of valid is not true
        setErrorMessage(el, 'Please enter a valid email'); // Set error message
      }
      return valid;                                        // Return the valid variable
    },
    number: function (el) {                                // Create number() method
      var valid = /^\d+$/.test(el.value);                  // Store result of test in valid
      if (!valid) {
        setErrorMessage(el, 'Please enter a valid number');
      }
      return valid;
    },
    date: function (el) {                                  // Create date() method
      // Store result of test in valid
      var valid = /^(\d{2}\/\d{2}\/\d{4})|(\d{4}-\d{2}-\d{2})$/.test(el.value);
      if (!valid) {                                        // If the value of valid is not true
        setErrorMessage(el, 'Please enter a valid date');  // Set error message
      }
      return valid;                                        // Return the valid variable
    }
  };

}());  // End of IIFE