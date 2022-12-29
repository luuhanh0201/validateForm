
// Hàm validate
function Validator(options) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }
    var selectorRules = {}
    //thuc hien validate
    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage;

        var rules = selectorRules[rule.selector];

        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );

                    break;
                default:
                    errorMessage = rules[i](inputElement.value);

            }

            if (errorMessage) break;
        }
        if (errorMessage) {
            errorElement.innerText = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        } else {
            errorElement.innerText = ''
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')

        }
        return !errorMessage
    }


    // lay element form can validate
    var formElement = document.querySelector(options.form)
    if (formElement) {
        formElement.onsubmit = function (e) {
            e.preventDefault();
            var isFormValid = true;
            options.rules.forEach(rule => {
                var inputElements = formElement.querySelector(rule.selector)
                // Array.from(inputElements).forEach(inputElement=>{

                // })


                var isValid = validate(inputElements, rule)
                if (!isValid) {
                    isFormValid = false
                }
            })
            if (isFormValid) {
                if (typeof options.onsubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')
                    var formValues = Array.from(enableInputs).reduce((values, input) => {
                        switch (input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                                break;
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    values[input.name] = ''
                                    return values
                                }
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }
                                values[input.name].push(input.value)
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default: values[input.name] = input.value
                        }
                        return values
                    }, {})

                    options.onsubmit(formValues)
                }
            }
        }
    }
    if (formElement) {
        options.rules.forEach(rule => {
            // luu lai cac rule trong input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }
            // selectorRules[rule.selector] = rule.test;
            var inputElements = formElement.querySelectorAll(rule.selector)
            Array.from(inputElements).forEach(function (inputElement) {
                if (inputElement) {
                    //xu ly blur khoi input
                    inputElement.onblur = function () {
                        validate(inputElement, rule)


                    }
                    //xu ly khi nguoi dung nhap vao input
                    inputElement.oninput = function () {
                        if (inputElement) {
                            var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)

                            errorElement.innerText = ''
                            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')

                        }
                    }
                }
            })

        });

    }
}




Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}
Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : `Mật khẩu tối thiểu ${min} kí tự`
        }
    }
}
Validator.confirmPassword = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không đúng'
        }
    }
}
Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

            return regex.test(value) ? undefined : message || 'Vui lòng nhập email'
        }
    }
}