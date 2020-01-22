console.warn('From Onsen UI 2.11.0, the AngularJS binding will no longer be part of the core package. You will need to install the new angularjs-onsenui package. See https://onsen.io/v2/guide/angular1/#migrating-to-angularjs-onsenui-package for more details.');

/* angularjs-onsenui v1.0.1 - 2019-04-01 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

  /* Simple JavaScript Inheritance for ES 5.1
   * based on http://ejohn.org/blog/simple-javascript-inheritance/
   *  (inspired by base2 and Prototype)
   * MIT Licensed.
   */
  (function () {

    var fnTest = /xyz/.test(function () {
    }) ? /\b_super\b/ : /.*/;

    // The base Class implementation (does nothing)
    function BaseClass() {}

    // Create a new Class that inherits from this class
    BaseClass.extend = function (props) {
      var _super = this.prototype;

      // Set up the prototype to inherit from the base class
      // (but without running the init constructor)
      var proto = Object.create(_super);

      // Copy the properties over onto the new prototype
      for (var name in props) {
        // Check if we're overwriting an existing function
        proto[name] = typeof props[name] === "function" && typeof _super[name] == "function" && fnTest.test(props[name]) ? function (name, fn) {
          return function () {
            var tmp = this._super;

            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];

            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);
            this._super = tmp;

            return ret;
          };
        }(name, props[name]) : props[name];
      }

      // The new constructor
      var newClass = typeof proto.init === "function" ? proto.hasOwnProperty("init") ? proto.init // All construction is actually done in the init method
      : function SubClass() {
        _super.init.apply(this, arguments);
      } : function EmptyClass() {};

      // Populate our constructed prototype object
      newClass.prototype = proto;

      // Enforce the constructor to be what we expect
      proto.constructor = newClass;

      // And make this class extendable
      newClass.extend = BaseClass.extend;

      return newClass;
    };

    // export
    window.Class = BaseClass;
  })();

  var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

  /*
  Copyright 2013-2015 ASIAL CORPORATION

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */

  /**
   * @object ons
   * @description
   *   [ja]Onsen UIで利用できるグローバルなオブジェクトです。このオブジェクトは、AngularJSのスコープから参照することができます。 [/ja]
   *   [en]A global object that's used in Onsen UI. This object can be reached from the AngularJS scope.[/en]
   */

  (function (ons) {

    var module = angular.module('onsen', []);
    angular.module('onsen.directives', ['onsen']); // for BC

    // JS Global facade for Onsen UI.
    initOnsenFacade();
    waitOnsenUILoad();
    initAngularModule();
    initTemplateCache();

    function waitOnsenUILoad() {
      var unlockOnsenUI = ons._readyLock.lock();
      module.run(['$compile', '$rootScope', function ($compile, $rootScope) {
        // for initialization hook.
        if (document.readyState === 'loading' || document.readyState == 'uninitialized') {
          window.addEventListener('DOMContentLoaded', function () {
            document.body.appendChild(document.createElement('ons-dummy-for-init'));
          });
        } else if (document.body) {
          document.body.appendChild(document.createElement('ons-dummy-for-init'));
        } else {
          throw new Error('Invalid initialization state.');
        }

        $rootScope.$on('$ons-ready', unlockOnsenUI);
      }]);
    }

    function initAngularModule() {
      module.value('$onsGlobal', ons);
      module.run(['$compile', '$rootScope', '$onsen', '$q', function ($compile, $rootScope, $onsen, $q) {
        ons._onsenService = $onsen;
        ons._qService = $q;

        $rootScope.ons = window.ons;
        $rootScope.console = window.console;
        $rootScope.alert = window.alert;

        ons.$compile = $compile;
      }]);
    }

    function initTemplateCache() {
      module.run(['$templateCache', function ($templateCache) {
        var tmp = ons._internal.getTemplateHTMLAsync;

        ons._internal.getTemplateHTMLAsync = function (page) {
          var cache = $templateCache.get(page);

          if (cache) {
            return Promise.resolve(cache);
          } else {
            return tmp(page);
          }
        };
      }]);
    }

    function initOnsenFacade() {
      ons._onsenService = null;

      // Object to attach component variables to when using the var="..." attribute.
      // Can be set to null to avoid polluting the global scope.
      ons.componentBase = window;

      /**
       * @method bootstrap
       * @signature bootstrap([moduleName, [dependencies]])
       * @description
       *   [ja]Onsen UIの初期化を行います。Angular.jsのng-app属性を利用すること無しにOnsen UIを読み込んで初期化してくれます。[/ja]
       *   [en]Initialize Onsen UI. Can be used to load Onsen UI without using the <code>ng-app</code> attribute from AngularJS.[/en]
       * @param {String} [moduleName]
       *   [en]AngularJS module name.[/en]
       *   [ja]Angular.jsでのモジュール名[/ja]
       * @param {Array} [dependencies]
       *   [en]List of AngularJS module dependencies.[/en]
       *   [ja]依存するAngular.jsのモジュール名の配列[/ja]
       * @return {Object}
       *   [en]An AngularJS module object.[/en]
       *   [ja]AngularJSのModuleオブジェクトを表します。[/ja]
       */
      ons.bootstrap = function (name, deps) {
        if (angular.isArray(name)) {
          deps = name;
          name = undefined;
        }

        if (!name) {
          name = 'myOnsenApp';
        }

        deps = ['onsen'].concat(angular.isArray(deps) ? deps : []);
        var module = angular.module(name, deps);

        var doc = window.document;
        if (doc.readyState == 'loading' || doc.readyState == 'uninitialized' || doc.readyState == 'interactive') {
          doc.addEventListener('DOMContentLoaded', function () {
            angular.bootstrap(doc.documentElement, [name]);
          }, false);
        } else if (doc.documentElement) {
          angular.bootstrap(doc.documentElement, [name]);
        } else {
          throw new Error('Invalid state');
        }

        return module;
      };

      /**
       * @method findParentComponentUntil
       * @signature findParentComponentUntil(name, [dom])
       * @param {String} name
       *   [en]Name of component, i.e. 'ons-page'.[/en]
       *   [ja]コンポーネント名を指定します。例えばons-pageなどを指定します。[/ja]
       * @param {Object/jqLite/HTMLElement} [dom]
       *   [en]$event, jqLite or HTMLElement object.[/en]
       *   [ja]$eventオブジェクト、jqLiteオブジェクト、HTMLElementオブジェクトのいずれかを指定できます。[/ja]
       * @return {Object}
       *   [en]Component object. Will return null if no component was found.[/en]
       *   [ja]コンポーネントのオブジェクトを返します。もしコンポーネントが見つからなかった場合にはnullを返します。[/ja]
       * @description
       *   [en]Find parent component object of <code>dom</code> element.[/en]
       *   [ja]指定されたdom引数の親要素をたどってコンポーネントを検索します。[/ja]
       */
      ons.findParentComponentUntil = function (name, dom) {
        var element;
        if (dom instanceof HTMLElement) {
          element = angular.element(dom);
        } else if (dom instanceof angular.element) {
          element = dom;
        } else if (dom.target) {
          element = angular.element(dom.target);
        }

        return element.inheritedData(name);
      };

      /**
       * @method findComponent
       * @signature findComponent(selector, [dom])
       * @param {String} selector
       *   [en]CSS selector[/en]
       *   [ja]CSSセレクターを指定します。[/ja]
       * @param {HTMLElement} [dom]
       *   [en]DOM element to search from.[/en]
       *   [ja]検索対象とするDOM要素を指定します。[/ja]
       * @return {Object/null}
       *   [en]Component object. Will return null if no component was found.[/en]
       *   [ja]コンポーネントのオブジェクトを返します。もしコンポーネントが見つからなかった場合にはnullを返します。[/ja]
       * @description
       *   [en]Find component object using CSS selector.[/en]
       *   [ja]CSSセレクタを使ってコンポーネントのオブジェクトを検索します。[/ja]
       */
      ons.findComponent = function (selector, dom) {
        var target = (dom ? dom : document).querySelector(selector);
        return target ? angular.element(target).data(target.nodeName.toLowerCase()) || null : null;
      };

      /**
       * @method compile
       * @signature compile(dom)
       * @param {HTMLElement} dom
       *   [en]Element to compile.[/en]
       *   [ja]コンパイルする要素を指定します。[/ja]
       * @description
       *   [en]Compile Onsen UI components.[/en]
       *   [ja]通常のHTMLの要素をOnsen UIのコンポーネントにコンパイルします。[/ja]
       */
      ons.compile = function (dom) {
        if (!ons.$compile) {
          throw new Error('ons.$compile() is not ready. Wait for initialization with ons.ready().');
        }

        if (!(dom instanceof HTMLElement)) {
          throw new Error('First argument must be an instance of HTMLElement.');
        }

        var scope = angular.element(dom).scope();
        if (!scope) {
          throw new Error('AngularJS Scope is null. Argument DOM element must be attached in DOM document.');
        }

        ons.$compile(dom)(scope);
      };

      ons._getOnsenService = function () {
        if (!this._onsenService) {
          throw new Error('$onsen is not loaded, wait for ons.ready().');
        }

        return this._onsenService;
      };

      /**
       * @param {String} elementName
       * @param {Function} lastReady
       * @return {Function}
       */
      ons._waitDiretiveInit = function (elementName, lastReady) {
        return function (element, callback) {
          if (angular.element(element).data(elementName)) {
            lastReady(element, callback);
          } else {
            var listen = function listen() {
              lastReady(element, callback);
              element.removeEventListener(elementName + ':init', listen, false);
            };
            element.addEventListener(elementName + ':init', listen, false);
          }
        };
      };

      /**
       * @method createElement
       * @signature createElement(template, [options])
       * @param {String} template
       *   [en]Either an HTML file path, an `<ons-template>` id or an HTML string such as `'<div id="foo">hoge</div>'`.[/en]
       *   [ja][/ja]
       * @param {Object} [options]
       *   [en]Parameter object.[/en]
       *   [ja]オプションを指定するオブジェクト。[/ja]
       * @param {Boolean|HTMLElement} [options.append]
       *   [en]Whether or not the element should be automatically appended to the DOM.  Defaults to `false`. If `true` value is given, `document.body` will be used as the target.[/en]
       *   [ja][/ja]
       * @param {HTMLElement} [options.insertBefore]
       *   [en]Reference node that becomes the next sibling of the new node (`options.append` element).[/en]
       *   [ja][/ja]
       * @param {Object} [options.parentScope]
       *   [en]Parent scope of the element. Used to bind models and access scope methods from the element. Requires append option.[/en]
       *   [ja][/ja]
       * @return {HTMLElement|Promise}
       *   [en]If the provided template was an inline HTML string, it returns the new element. Otherwise, it returns a promise that resolves to the new element.[/en]
       *   [ja][/ja]
       * @description
       *   [en]Create a new element from a template. Both inline HTML and external files are supported although the return value differs. If the element is appended it will also be compiled by AngularJS (otherwise, `ons.compile` should be manually used).[/en]
       *   [ja][/ja]
       */
      var createElementOriginal = ons.createElement;
      ons.createElement = function (template) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        var link = function link(element) {
          if (options.parentScope) {
            ons.$compile(angular.element(element))(options.parentScope.$new());
            options.parentScope.$evalAsync();
          } else {
            ons.compile(element);
          }
        };

        var getScope = function getScope(e) {
          return angular.element(e).data(e.tagName.toLowerCase()) || e;
        };
        var result = createElementOriginal(template, _extends({ append: !!options.parentScope, link: link }, options));

        return result instanceof Promise ? result.then(getScope) : getScope(result);
      };

      /**
       * @method createAlertDialog
       * @signature createAlertDialog(page, [options])
       * @param {String} page
       *   [en]Page name. Can be either an HTML file or an <ons-template> containing a <ons-alert-dialog> component.[/en]
       *   [ja]pageのURLか、もしくはons-templateで宣言したテンプレートのid属性の値を指定できます。[/ja]
       * @param {Object} [options]
       *   [en]Parameter object.[/en]
       *   [ja]オプションを指定するオブジェクト。[/ja]
       * @param {Object} [options.parentScope]
       *   [en]Parent scope of the dialog. Used to bind models and access scope methods from the dialog.[/en]
       *   [ja]ダイアログ内で利用する親スコープを指定します。ダイアログからモデルやスコープのメソッドにアクセスするのに使います。このパラメータはAngularJSバインディングでのみ利用できます。[/ja]
       * @return {Promise}
       *   [en]Promise object that resolves to the alert dialog component object.[/en]
       *   [ja]ダイアログのコンポーネントオブジェクトを解決するPromiseオブジェクトを返します。[/ja]
       * @description
       *   [en]Create a alert dialog instance from a template. This method will be deprecated in favor of `ons.createElement`.[/en]
       *   [ja]テンプレートからアラートダイアログのインスタンスを生成します。[/ja]
       */

      /**
       * @method createDialog
       * @signature createDialog(page, [options])
       * @param {String} page
       *   [en]Page name. Can be either an HTML file or an <ons-template> containing a <ons-dialog> component.[/en]
       *   [ja]pageのURLか、もしくはons-templateで宣言したテンプレートのid属性の値を指定できます。[/ja]
       * @param {Object} [options]
       *   [en]Parameter object.[/en]
       *   [ja]オプションを指定するオブジェクト。[/ja]
       * @param {Object} [options.parentScope]
       *   [en]Parent scope of the dialog. Used to bind models and access scope methods from the dialog.[/en]
       *   [ja]ダイアログ内で利用する親スコープを指定します。ダイアログからモデルやスコープのメソッドにアクセスするのに使います。このパラメータはAngularJSバインディングでのみ利用できます。[/ja]
       * @return {Promise}
       *   [en]Promise object that resolves to the dialog component object.[/en]
       *   [ja]ダイアログのコンポーネントオブジェクトを解決するPromiseオブジェクトを返します。[/ja]
       * @description
       *   [en]Create a dialog instance from a template. This method will be deprecated in favor of `ons.createElement`.[/en]
       *   [ja]テンプレートからダイアログのインスタンスを生成します。[/ja]
       */

      /**
       * @method createPopover
       * @signature createPopover(page, [options])
       * @param {String} page
       *   [en]Page name. Can be either an HTML file or an <ons-template> containing a <ons-dialog> component.[/en]
       *   [ja]pageのURLか、もしくはons-templateで宣言したテンプレートのid属性の値を指定できます。[/ja]
       * @param {Object} [options]
       *   [en]Parameter object.[/en]
       *   [ja]オプションを指定するオブジェクト。[/ja]
       * @param {Object} [options.parentScope]
       *   [en]Parent scope of the dialog. Used to bind models and access scope methods from the dialog.[/en]
       *   [ja]ダイアログ内で利用する親スコープを指定します。ダイアログからモデルやスコープのメソッドにアクセスするのに使います。このパラメータはAngularJSバインディングでのみ利用できます。[/ja]
       * @return {Promise}
       *   [en]Promise object that resolves to the popover component object.[/en]
       *   [ja]ポップオーバーのコンポーネントオブジェクトを解決するPromiseオブジェクトを返します。[/ja]
       * @description
       *   [en]Create a popover instance from a template. This method will be deprecated in favor of `ons.createElement`.[/en]
       *   [ja]テンプレートからポップオーバーのインスタンスを生成します。[/ja]
       */

      /**
       * @param {String} page
       */
      var resolveLoadingPlaceHolderOriginal = ons.resolveLoadingPlaceHolder;
      ons.resolveLoadingPlaceholder = function (page) {
        return resolveLoadingPlaceholderOriginal(page, function (element, done) {
          ons.compile(element);
          angular.element(element).scope().$evalAsync(function () {
            return setImmediate(done);
          });
        });
      };

      ons._setupLoadingPlaceHolders = function () {
        // Do nothing
      };
    }
  })(window.ons = window.ons || {});

  /*
  Copyright 2013-2015 ASIAL CORPORATION

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */

  (function () {

    var module = angular.module('onsen');

    module.factory('ActionSheetView', ['$onsen', function ($onsen) {

      var ActionSheetView = Class.extend({

        /**
         * @param {Object} scope
         * @param {jqLite} element
         * @param {Object} attrs
         */
        init: function init(scope, element, attrs) {
          this._scope = scope;
          this._element = element;
          this._attrs = attrs;

          this._clearDerivingMethods = $onsen.deriveMethods(this, this._element[0], ['show', 'hide', 'toggle']);

          this._clearDerivingEvents = $onsen.deriveEvents(this, this._element[0], ['preshow', 'postshow', 'prehide', 'posthide', 'cancel'], function (detail) {
            if (detail.actionSheet) {
              detail.actionSheet = this;
            }
            return detail;
          }.bind(this));

          this._scope.$on('$destroy', this._destroy.bind(this));
        },

        _destroy: function _destroy() {
          this.emit('destroy');

          this._element.remove();
          this._clearDerivingMethods();
          this._clearDerivingEvents();

          this._scope = this._attrs = this._element = null;
        }

      });

      MicroEvent.mixin(ActionSheetView);
      $onsen.derivePropertiesFromElement(ActionSheetView, ['disabled', 'cancelable', 'visible', 'onDeviceBackButton']);

      return ActionSheetView;
    }]);
  })();

  /*
  Copyright 2013-2015 ASIAL CORPORATION

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */

  (function () {

    var module = angular.module('onsen');

    module.factory('AlertDialogView', ['$onsen', function ($onsen) {

      var AlertDialogView = Class.extend({

        /**
         * @param {Object} scope
         * @param {jqLite} element
         * @param {Object} attrs
         */
        init: function init(scope, element, attrs) {
          this._scope = scope;
          this._element = element;
          this._attrs = attrs;

          this._clearDerivingMethods = $onsen.deriveMethods(this, this._element[0], ['show', 'hide']);

          this._clearDerivingEvents = $onsen.deriveEvents(this, this._element[0], ['preshow', 'postshow', 'prehide', 'posthide', 'cancel'], function (detail) {
            if (detail.alertDialog) {
              detail.alertDialog = this;
            }
            return detail;
          }.bind(this));

          this._scope.$on('$destroy', this._destroy.bind(this));
        },

        _destroy: function _destroy() {
          this.emit('destroy');

          this._element.remove();

          this._clearDerivingMethods();
          this._clearDerivingEvents();

          this._scope = this._attrs = this._element = null;
        }

      });

      MicroEvent.mixin(AlertDialogView);
      $onsen.derivePropertiesFromElement(AlertDialogView, ['disabled', 'cancelable', 'visible', 'onDeviceBackButton']);

      return AlertDialogView;
    }]);
  })();

  /*
  Copyright 2013-2015 ASIAL CORPORATION

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */

  (function () {

    var module = angular.module('onsen');

    module.factory('CarouselView', ['$onsen', function ($onsen) {

      /**
       * @class CarouselView
       */
      var CarouselView = Class.extend({

        /**
         * @param {Object} scope
         * @param {jqLite} element
         * @param {Object} attrs
         */
        init: function init(scope, element, attrs) {
          this._element = element;
          this._scope = scope;
          this._attrs = attrs;

          this._scope.$on('$destroy', this._destroy.bind(this));

          this._clearDerivingMethods = $onsen.deriveMethods(this, element[0], ['setActiveIndex', 'getActiveIndex', 'next', 'prev', 'refresh', 'first', 'last']);

          this._clearDerivingEvents = $onsen.deriveEvents(this, element[0], ['refresh', 'postchange', 'overscroll'], function (detail) {
            if (detail.carousel) {
              detail.carousel = this;
            }
            return detail;
          }.bind(this));
        },

        _destroy: function _destroy() {
          this.emit('destroy');

          this._clearDerivingEvents();
          this._clearDerivingMethods();

          this._element = this._scope = this._attrs = null;
        }
      });

      MicroEvent.mixin(CarouselView);

      $onsen.derivePropertiesFromElement(CarouselView, ['centered', 'overscrollable', 'disabled', 'autoScroll', 'swipeable', 'autoScrollRatio', 'itemCount', 'onSwipe']);

      return CarouselView;
    }]);
  })();

  /*
  Copyright 2013-2015 ASIAL CORPORATION

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */

  (function () {

    var module = angular.module('onsen');

    module.factory('DialogView', ['$onsen', function ($onsen) {

      var DialogView = Class.extend({

        init: function init(scope, element, attrs) {
          this._scope = scope;
          this._element = element;
          this._attrs = attrs;

          this._clearDerivingMethods = $onsen.deriveMethods(this, this._element[0], ['show', 'hide']);

          this._clearDerivingEvents = $onsen.deriveEvents(this, this._element[0], ['preshow', 'postshow', 'prehide', 'posthide', 'cancel'], function (detail) {
            if (detail.dialog) {
              detail.dialog = this;
            }
            return detail;
          }.bind(this));

          this._scope.$on('$destroy', this._destroy.bind(this));
        },

        _destroy: function _destroy() {
          this.emit('destroy');

          this._element.remove();
          this._clearDerivingMethods();
          this._clearDerivingEvents();

          this._scope = this._attrs = this._element = null;
        }
      });

      MicroEvent.mixin(DialogView);
      $onsen.derivePropertiesFromElement(DialogView, ['disabled', 'cancelable', 'visible', 'onDeviceBackButton']);

      return DialogView;
    }]);
  })();

  /*
  Copyright 2013-2015 ASIAL CORPORATION

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */

  (function () {

    var module = angular.module('onsen');

    module.factory('FabView', ['$onsen', function ($onsen) {

      /**
       * @class FabView
       */
      var FabView = Class.extend({

        /**
         * @param {Object} scope
         * @param {jqLite} element
         * @param {Object} attrs
         */
        init: function init(scope, element, attrs) {
          this._element = element;
          this._scope = scope;
          this._attrs = attrs;

          this._scope.$on('$destroy', this._destroy.bind(this));

          this._clearDerivingMethods = $onsen.deriveMethods(this, element[0], ['show', 'hide', 'toggle']);
        },

        _destroy: function _destroy() {
          this.emit('destroy');
          this._clearDerivingMethods();

          this._element = this._scope = this._attrs = null;
        }
      });

      $onsen.derivePropertiesFromElement(FabView, ['disabled', 'visible']);

      MicroEvent.mixin(FabView);

      return FabView;
    }]);
  })();

  /*
  Copyright 2013-2015 ASIAL CORPORATION

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */

  (function () {

    angular.module('onsen').factory('GenericView', ['$onsen', function ($onsen) {

      var GenericView = Class.extend({

        /**
         * @param {Object} scope
         * @param {jqLite} element
         * @param {Object} attrs
         * @param {Object} [options]
         * @param {Boolean} [options.directiveOnly]
         * @param {Function} [options.onDestroy]
         * @param {String} [options.modifierTemplate]
         */
        init: function init(scope, element, attrs, options) {
          var self = this;
          options = {};

          this._element = element;
          this._scope = scope;
          this._attrs = attrs;

          if (options.directiveOnly) {
            if (!options.modifierTemplate) {
              throw new Error('options.modifierTemplate is undefined.');
            }
            $onsen.addModifierMethods(this, options.modifierTemplate, element);
          } else {
            $onsen.addModifierMethodsForCustomElements(this, element);
          }

          $onsen.cleaner.onDestroy(scope, function () {
            self._events = undefined;
            $onsen.removeModifierMethods(self);

            if (options.onDestroy) {
              options.onDestroy(self);
            }

            $onsen.clearComponent({
              scope: scope,
              attrs: attrs,
              element: element
            });

            self = element = self._element = self._scope = scope = self._attrs = attrs = options = null;
          });
        }
      });

      /**
       * @param {Object} scope
       * @param {jqLite} element
       * @param {Object} attrs
       * @param {Object} options
       * @param {String} options.viewKey
       * @param {Boolean} [options.directiveOnly]
       * @param {Function} [options.onDestroy]
       * @param {String} [options.modifierTemplate]
       */
      GenericView.register = function (scope, element, attrs, options) {
        var view = new GenericView(scope, element, attrs, options);

        if (!options.viewKey) {
          throw new Error('options.viewKey is required.');
        }

        $onsen.declareVarAttribute(attrs, view);
        element.data(options.viewKey, view);

        var destroy = options.onDestroy || angular.noop;
        options.onDestroy = function (view) {
          destroy(view);
          element.data(options.viewKey, null);
        };

        return view;
      };

      MicroEvent.mixin(GenericView);

      return GenericView;
    }]);
  })();

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  /*
  Copyright 2013-2015 ASIAL CORPORATION

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */

  (function () {

    angular.module('onsen').factory('AngularLazyRepeatDelegate', ['$compile', function ($compile) {

      var directiveAttributes = ['ons-lazy-repeat', 'ons:lazy:repeat', 'ons_lazy_repeat', 'data-ons-lazy-repeat', 'x-ons-lazy-repeat'];

      var AngularLazyRepeatDelegate = function (_ons$_internal$LazyRe) {
        _inherits(AngularLazyRepeatDelegate, _ons$_internal$LazyRe);

        /**
         * @param {Object} userDelegate
         * @param {Element} templateElement
         * @param {Scope} parentScope
         */
        function AngularLazyRepeatDelegate(userDelegate, templateElement, parentScope) {
          _classCallCheck(this, AngularLazyRepeatDelegate);

          var _this = _possibleConstructorReturn(this, (AngularLazyRepeatDelegate.__proto__ || Object.getPrototypeOf(AngularLazyRepeatDelegate)).call(this, userDelegate, templateElement));

          _this._parentScope = parentScope;

          directiveAttributes.forEach(function (attr) {
            return templateElement.removeAttribute(attr);
          });
          _this._linker = $compile(templateElement ? templateElement.cloneNode(true) : null);
          return _this;
        }

        _createClass(AngularLazyRepeatDelegate, [{
          key: 'configureItemScope',
          value: function configureItemScope(item, scope) {
            if (this._userDelegate.configureItemScope instanceof Function) {
              this._userDelegate.configureItemScope(item, scope);
            }
          }
        }, {
          key: 'destroyItemScope',
          value: function destroyItemScope(item, element) {
            if (this._userDelegate.destroyItemScope instanceof Function) {
              this._userDelegate.destroyItemScope(item, element);
            }
          }
        }, {
          key: '_usingBinding',
          value: function _usingBinding() {
            if (this._userDelegate.configureItemScope) {
              return true;
            }

            if (this._userDelegate.createItemContent) {
              return false;
            }

            throw new Error('`lazy-repeat` delegate object is vague.');
          }
        }, {
          key: 'loadItemElement',
          value: function loadItemElement(index, done) {
            this._prepareItemElement(index, function (_ref) {
              var element = _ref.element,
                  scope = _ref.scope;

              done({ element: element, scope: scope });
            });
          }
        }, {
          key: '_prepareItemElement',
          value: function _prepareItemElement(index, done) {
            var _this2 = this;

            var scope = this._parentScope.$new();
            this._addSpecialProperties(index, scope);

            if (this._usingBinding()) {
              this.configureItemScope(index, scope);
            }

            this._linker(scope, function (cloned) {
              var element = cloned[0];
              if (!_this2._usingBinding()) {
                element = _this2._userDelegate.createItemContent(index, element);
                $compile(element)(scope);
              }

              done({ element: element, scope: scope });
            });
          }

          /**
           * @param {Number} index
           * @param {Object} scope
           */

        }, {
          key: '_addSpecialProperties',
          value: function _addSpecialProperties(i, scope) {
            var last = this.countItems() - 1;
            angular.extend(scope, {
              $index: i,
              $first: i === 0,
              $last: i === last,
              $middle: i !== 0 && i !== last,
              $even: i % 2 === 0,
              $odd: i % 2 === 1
            });
          }
        }, {
          key: 'updateItem',
          value: function updateItem(index, item) {
            var _this3 = this;

            if (this._usingBinding()) {
              item.scope.$evalAsync(function () {
                return _this3.configureItemScope(index, item.scope);
              });
            } else {
              _get(AngularLazyRepeatDelegate.prototype.__proto__ || Object.getPrototypeOf(AngularLazyRepeatDelegate.prototype), 'updateItem', this).call(this, index, item);
            }
          }

          /**
           * @param {Number} index
           * @param {Object} item
           * @param {Object} item.scope
           * @param {Element} item.element
           */

        }, {
          key: 'destroyItem',
          value: function destroyItem(index, item) {
            if (this._usingBinding()) {
              this.destroyItemScope(index, item.scope);
            } else {
              _get(AngularLazyRepeatDelegate.prototype.__proto__ || Object.getPrototypeOf(AngularLazyRepeatDelegate.prototype), 'destroyItem', this).call(this, index, item.element);
            }
            item.scope.$destroy();
          }
        }, {
          key: 'destroy',
          value: function destroy() {
            _get(AngularLazyRepeatDelegate.prototype.__proto__ || Object.getPrototypeOf(AngularLazyRepeatDelegate.prototype), 'destroy', this).call(this);
            this._scope = null;
          }
        }]);

        return AngularLazyRepeatDelegate;
      }(ons._internal.LazyRepeatDelegate);

      return AngularLazyRepeatDelegate;
    }]);
  })();

  /*
  Copyright 2013-2015 ASIAL CORPORATION

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */

  (function () {

    var module = angular.module('onsen');

    module.factory('LazyRepeatView', ['AngularLazyRepeatDelegate', function (AngularLazyRepeatDelegate) {

      var LazyRepeatView = Class.extend({

        /**
         * @param {Object} scope
         * @param {jqLite} element
         * @param {Object} attrs
         */
        init: function init(scope, element, attrs, linker) {
          var _this = this;

          this._element = element;
          this._scope = scope;
          this._attrs = attrs;
          this._linker = linker;

          var userDelegate = this._scope.$eval(this._attrs.onsLazyRepeat);

          var internalDelegate = new AngularLazyRepeatDelegate(userDelegate, element[0], scope || element.scope());

          this._provider = new ons._internal.LazyRepeatProvider(element[0].parentNode, internalDelegate);

          // Expose refresh method to user.
          userDelegate.refresh = this._provider.refresh.bind(this._provider);

          element.remove();

          // Render when number of items change.
          this._scope.$watch(internalDelegate.countItems.bind(internalDelegate), this._provider._onChange.bind(this._provider));

          this._scope.$on('$destroy', function () {
            _this._element = _this._scope = _this._attrs = _this._linker = null;
          });
        }
      });

      return LazyRepeatView;
    }]);
  })();

  /*
  Copyright 2013-2015 ASIAL CORPORATION

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */

  (function () {

    var module = angular.module('onsen');

    module.factory('ModalView', ['$onsen', '$parse', function ($onsen, $parse) {

      var ModalView = Class.extend({
        _element: undefined,
        _scope: undefined,

        init: function init(scope, element, attrs) {
          this._scope = scope;
          this._element = element;
          this._attrs = attrs;
          this._scope.$on('$destroy', this._destroy.bind(this));

          this._clearDerivingMethods = $onsen.deriveMethods(this, this._element[0], ['show', 'hide', 'toggle']);

          this._clearDerivingEvents = $onsen.deriveEvents(this, this._element[0], ['preshow', 'postshow', 'prehide', 'posthide'], function (detail) {
            if (detail.modal) {
              detail.modal = this;
            }
            return detail;
          }.bind(this));
        },

        _destroy: function _destroy() {
          this.emit('destroy', { page: this });

          this._element.remove();
          this._clearDerivingMethods();
          this._clearDerivingEvents();
          this._events = this._element = this._scope = this._attrs = null;
        }
      });

      MicroEvent.mixin(ModalView);
      $onsen.derivePropertiesFromElement(ModalView, ['onDeviceBackButton', 'visible']);

      return ModalView;
    }]);
  })();

  /*
  Copyright 2013-2015 ASIAL CORPORATION

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */

  (function () {

    var module = angular.module('onsen');

    module.factory('NavigatorView', ['$compile', '$onsen', function ($compile, $onsen) {

      /**
       * Manages the page navigation backed by page stack.
       *
       * @class NavigatorView
       */
      var NavigatorView = Class.extend({

        /**
         * @member {jqLite} Object
         */
        _element: undefined,

        /**
         * @member {Object} Object
         */
        _attrs: undefined,

        /**
         * @member {Object}
         */
        _scope: undefined,

        /**
         * @param {Object} scope
         * @param {jqLite} element jqLite Object to manage with navigator
         * @param {Object} attrs
         */
        init: function init(scope, element, attrs) {

          this._element = element || angular.element(window.document.body);
          this._scope = scope || this._element.scope();
          this._attrs = attrs;
          this._previousPageScope = null;

          this._boundOnPrepop = this._onPrepop.bind(this);
          this._element.on('prepop', this._boundOnPrepop);

          this._scope.$on('$destroy', this._destroy.bind(this));

          this._clearDerivingEvents = $onsen.deriveEvents(this, element[0], ['prepush', 'postpush', 'prepop', 'postpop', 'init', 'show', 'hide', 'destroy'], function (detail) {
            if (detail.navigator) {
              detail.navigator = this;
            }
            return detail;
          }.bind(this));

          this._clearDerivingMethods = $onsen.deriveMethods(this, element[0], ['insertPage', 'removePage', 'pushPage', 'bringPageTop', 'popPage', 'replacePage', 'resetToPage', 'canPopPage']);
        },

        _onPrepop: function _onPrepop(event) {
          var pages = event.detail.navigator.pages;
          angular.element(pages[pages.length - 2]).data('_scope').$evalAsync();
        },

        _destroy: function _destroy() {
          this.emit('destroy');
          this._clearDerivingEvents();
          this._clearDerivingMethods();
          this._element.off('prepop', this._boundOnPrepop);
          this._element = this._scope = this._attrs = null;
        }
      });

      MicroEvent.mixin(NavigatorView);
      $onsen.derivePropertiesFromElement(NavigatorView, ['pages', 'topPage', 'onSwipe', 'options', 'onDeviceBackButton', 'pageLoader']);

      return NavigatorView;
    }]);
  })();

  /*
  Copyright 2013-2015 ASIAL CORPORATION

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */

  (function () {

    var module = angular.module('onsen');

    module.factory('PageView', ['$onsen', '$parse', function ($onsen, $parse) {

      var PageView = Class.extend({
        init: function init(scope, element, attrs) {
          var _this = this;

          this._scope = scope;
          this._element = element;
          this._attrs = attrs;

          this._clearListener = scope.$on('$destroy', this._destroy.bind(this));

          this._clearDerivingEvents = $onsen.deriveEvents(this, element[0], ['init', 'show', 'hide', 'destroy']);

          Object.defineProperty(this, 'onDeviceBackButton', {
            get: function get() {
              return _this._element[0].onDeviceBackButton;
            },
            set: function set(value) {
              if (!_this._userBackButtonHandler) {
                _this._enableBackButtonHandler();
              }
              _this._userBackButtonHandler = value;
            }
          });

          if (this._attrs.ngDeviceBackButton || this._attrs.onDeviceBackButton) {
            this._enableBackButtonHandler();
          }
          if (this._attrs.ngInfiniteScroll) {
            this._element[0].onInfiniteScroll = function (done) {
              $parse(_this._attrs.ngInfiniteScroll)(_this._scope)(done);
            };
          }
        },

        _enableBackButtonHandler: function _enableBackButtonHandler() {
          this._userBackButtonHandler = angular.noop;
          this._element[0].onDeviceBackButton = this._onDeviceBackButton.bind(this);
        },

        _onDeviceBackButton: function _onDeviceBackButton($event) {
          this._userBackButtonHandler($event);

          // ng-device-backbutton
          if (this._attrs.ngDeviceBackButton) {
            $parse(this._attrs.ngDeviceBackButton)(this._scope, { $event: $event });
          }

          // on-device-backbutton
          /* jshint ignore:start */
          if (this._attrs.onDeviceBackButton) {
            var lastEvent = window.$event;
            window.$event = $event;
            new Function(this._attrs.onDeviceBackButton)(); // eslint-disable-line no-new-func
            window.$event = lastEvent;
          }
          /* jshint ignore:end */
        },

        _destroy: function _destroy() {
          this._clearDerivingEvents();

          this._element = null;
          this._scope = null;

          this._clearListener();
        }
      });
      MicroEvent.mixin(PageView);

      return PageView;
    }]);
  })();

  /*
  Copyright 2013-2015 ASIAL CORPORATION

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */

  (function () {

    angular.module('onsen').factory('PopoverView', ['$onsen', function ($onsen) {

      var PopoverView = Class.extend({

        /**
         * @param {Object} scope
         * @param {jqLite} element
         * @param {Object} attrs
         */
        init: function init(scope, element, attrs) {
          this._element = element;
          this._scope = scope;
          this._attrs = attrs;

          this._scope.$on('$destroy', this._destroy.bind(this));

          this._clearDerivingMethods = $onsen.deriveMethods(this, this._element[0], ['show', 'hide']);

          this._clearDerivingEvents = $onsen.deriveEvents(this, this._element[0], ['preshow', 'postshow', 'prehide', 'posthide'], function (detail) {
            if (detail.popover) {
              detail.popover = this;
            }
            return detail;
          }.bind(this));
        },

        _destroy: function _destroy() {
          this.emit('destroy');

          this._clearDerivingMethods();
          this._clearDerivingEvents();

          this._element.remove();

          this._element = this._scope = null;
        }
      });

      MicroEvent.mixin(PopoverView);
      $onsen.derivePropertiesFromElement(PopoverView, ['cancelable', 'disabled', 'onDeviceBackButton', 'visible']);

      return PopoverView;
    }]);
  })();

  /*
  Copyright 2013-2015 ASIAL CORPORATION

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */

  (function () {

    var module = angular.module('onsen');

    module.factory('PullHookView', ['$onsen', '$parse', function ($onsen, $parse) {

      var PullHookView = Class.extend({

        init: function init(scope, element, attrs) {
          var _this = this;

          this._element = element;
          this._scope = scope;
          this._attrs = attrs;

          this._clearDerivingEvents = $onsen.deriveEvents(this, this._element[0], ['changestate'], function (detail) {
            if (detail.pullHook) {
              detail.pullHook = _this;
            }
            return detail;
          });

          this.on('changestate', function () {
            return _this._scope.$evalAsync();
          });

          this._element[0].onAction = function (done) {
            if (_this._attrs.ngAction) {
              _this._scope.$eval(_this._attrs.ngAction, { $done: done });
            } else {
              _this.onAction ? _this.onAction(done) : done();
            }
          };

          this._scope.$on('$destroy', this._destroy.bind(this));
        },

        _destroy: function _destroy() {
          this.emit('destroy');

          this._clearDerivingEvents();

          this._element = this._scope = this._attrs = null;
        }
      });

      MicroEvent.mixin(PullHookView);

      $onsen.derivePropertiesFromElement(PullHookView, ['state', 'onPull', 'pullDistance', 'height', 'thresholdHeight', 'disabled']);

      return PullHookView;
    }]);
  })();

  /*
  Copyright 2013-2015 ASIAL CORPORATION

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */

  (function () {

    var module = angular.module('onsen');

    module.factory('SpeedDialView', ['$onsen', function ($onsen) {

      /**
       * @class SpeedDialView
       */
      var SpeedDialView = Class.extend({

        /**
         * @param {Object} scope
         * @param {jqLite} element
         * @param {Object} attrs
         */
        init: function init(scope, element, attrs) {
          this._element = element;
          this._scope = scope;
          this._attrs = attrs;

          this._scope.$on('$destroy', this._destroy.bind(this));

          this._clearDerivingMethods = $onsen.deriveMethods(this, element[0], ['show', 'hide', 'showItems', 'hideItems', 'isOpen', 'toggle', 'toggleItems']);

          this._clearDerivingEvents = $onsen.deriveEvents(this, element[0], ['open', 'close']).bind(this);
        },

        _destroy: function _destroy() {
          this.emit('destroy');

          this._clearDerivingEvents();
          this._clearDerivingMethods();

          this._element = this._scope = this._attrs = null;
        }
      });

      MicroEvent.mixin(SpeedDialView);

      $onsen.derivePropertiesFromElement(SpeedDialView, ['disabled', 'visible', 'inline']);

      return SpeedDialView;
    }]);
  })();

  /*
  Copyright 2013-2015 ASIAL CORPORATION

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */
  (function () {

    angular.module('onsen').factory('SplitterContent', ['$onsen', '$compile', function ($onsen, $compile) {

      var SplitterContent = Class.extend({

        init: function init(scope, element, attrs) {
          this._element = element;
          this._scope = scope;
          this._attrs = attrs;

          this.load = this._element[0].load.bind(this._element[0]);
          scope.$on('$destroy', this._destroy.bind(this));
        },

        _destroy: function _destroy() {
          this.emit('destroy');
          this._element = this._scope = this._attrs = this.load = this._pageScope = null;
        }
      });

      MicroEvent.mixin(SplitterContent);
      $onsen.derivePropertiesFromElement(SplitterContent, ['page']);

      return SplitterContent;
    }]);
  })();

  /*
  Copyright 2013-2015 ASIAL CORPORATION

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */
  (function () {

    angular.module('onsen').factory('SplitterSide', ['$onsen', '$compile', function ($onsen, $compile) {

      var SplitterSide = Class.extend({

        init: function init(scope, element, attrs) {
          var _this = this;

          this._element = element;
          this._scope = scope;
          this._attrs = attrs;

          this._clearDerivingMethods = $onsen.deriveMethods(this, this._element[0], ['open', 'close', 'toggle', 'load']);

          this._clearDerivingEvents = $onsen.deriveEvents(this, element[0], ['modechange', 'preopen', 'preclose', 'postopen', 'postclose'], function (detail) {
            return detail.side ? angular.extend(detail, { side: _this }) : detail;
          });

          scope.$on('$destroy', this._destroy.bind(this));
        },

        _destroy: function _destroy() {
          this.emit('destroy');

          this._clearDerivingMethods();
          this._clearDerivingEvents();

          this._element = this._scope = this._attrs = null;
        }
      });

      MicroEvent.mixin(SplitterSide);
      $onsen.derivePropertiesFromElement(SplitterSide, ['page', 'mode', 'isOpen', 'onSwipe', 'pageLoader']);

      return SplitterSide;
    }]);
  })();

  /*
  Copyright 2013-2015 ASIAL CORPORATION

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */
  (function () {

    angular.module('onsen').factory('Splitter', ['$onsen', function ($onsen) {

      var Splitter = Class.extend({
        init: function init(scope, element, attrs) {
          this._element = element;
          this._scope = scope;
          this._attrs = attrs;
          scope.$on('$destroy', this._destroy.bind(this));
        },

        _destroy: function _destroy() {
          this.emit('destroy');
          this._element = this._scope = this._attrs = null;
        }
      });

      MicroEvent.mixin(Splitter);
      $onsen.derivePropertiesFromElement(Splitter, ['onDeviceBackButton']);

      ['left', 'right', 'side', 'content', 'mask'].forEach(function (prop, i) {
        Object.defineProperty(Splitter.prototype, prop, {
          get: function get() {
            var tagName = 'ons-splitter-' + (i < 3 ? 'side' : prop);
            return angular.element(this._element[0][prop]).data(tagName);
          }
        });
      });

      return Splitter;
    }]);
  })();

  /*
  Copyright 2013-2015 ASIAL CORPORATION

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */

  (function () {

    angular.module('onsen').factory('SwitchView', ['$parse', '$onsen', function ($parse, $onsen) {

      var SwitchView = Class.extend({

        /**
         * @param {jqLite} element
         * @param {Object} scope
         * @param {Object} attrs
         */
        init: function init(element, scope, attrs) {
          var _this = this;

          this._element = element;
          this._checkbox = angular.element(element[0].querySelector('input[type=checkbox]'));
          this._scope = scope;

          this._prepareNgModel(element, scope, attrs);

          this._scope.$on('$destroy', function () {
            _this.emit('destroy');
            _this._element = _this._checkbox = _this._scope = null;
          });
        },

        _prepareNgModel: function _prepareNgModel(element, scope, attrs) {
          var _this2 = this;

          if (attrs.ngModel) {
            var set = $parse(attrs.ngModel).assign;

            scope.$parent.$watch(attrs.ngModel, function (value) {
              _this2.checked = !!value;
            });

            this._element.on('change', function (e) {
              set(scope.$parent, _this2.checked);

              if (attrs.ngChange) {
                scope.$eval(attrs.ngChange);
              }

              scope.$parent.$evalAsync();
            });
          }
        }
      });

      MicroEvent.mixin(SwitchView);
      $onsen.derivePropertiesFromElement(SwitchView, ['disabled', 'checked', 'checkbox', 'value']);

      return SwitchView;
    }]);
  })();

  /*
  Copyright 2013-2015 ASIAL CORPORATION

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */

  (function () {

    var module = angular.module('onsen');

    module.factory('TabbarView', ['$onsen', function ($onsen) {
      var TabbarView = Class.extend({

        init: function init(scope, element, attrs) {
          if (element[0].nodeName.toLowerCase() !== 'ons-tabbar') {
            throw new Error('"element" parameter must be a "ons-tabbar" element.');
          }

          this._scope = scope;
          this._element = element;
          this._attrs = attrs;

          this._scope.$on('$destroy', this._destroy.bind(this));

          this._clearDerivingEvents = $onsen.deriveEvents(this, element[0], ['reactive', 'postchange', 'prechange', 'init', 'show', 'hide', 'destroy']);

          this._clearDerivingMethods = $onsen.deriveMethods(this, element[0], ['setActiveTab', 'show', 'hide', 'setTabbarVisibility', 'getActiveTabIndex']);
        },

        _destroy: function _destroy() {
          this.emit('destroy');

          this._clearDerivingEvents();
          this._clearDerivingMethods();

          this._element = this._scope = this._attrs = null;
        }
      });

      MicroEvent.mixin(TabbarView);

      $onsen.derivePropertiesFromElement(TabbarView, ['visible', 'swipeable', 'onSwipe']);

      return TabbarView;
    }]);
  })();

  /*
  Copyright 2013-2015 ASIAL CORPORATION

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */

  (function () {

    var module = angular.module('onsen');

    module.factory('ToastView', ['$onsen', function ($onsen) {

      var ToastView = Class.extend({

        /**
         * @param {Object} scope
         * @param {jqLite} element
         * @param {Object} attrs
         */
        init: function init(scope, element, attrs) {
          this._scope = scope;
          this._element = element;
          this._attrs = attrs;

          this._clearDerivingMethods = $onsen.deriveMethods(this, this._element[0], ['show', 'hide', 'toggle']);

          this._clearDerivingEvents = $onsen.deriveEvents(this, this._element[0], ['preshow', 'postshow', 'prehide', 'posthide'], function (detail) {
            if (detail.toast) {
              detail.toast = this;
            }
            return detail;
          }.bind(this));

          this._scope.$on('$destroy', this._destroy.bind(this));
        },

        _destroy: function _destroy() {
          this.emit('destroy');

          this._element.remove();

          this._clearDerivingMethods();
          this._clearDerivingEvents();

          this._scope = this._attrs = this._element = null;
        }

      });

      MicroEvent.mixin(ToastView);
      $onsen.derivePropertiesFromElement(ToastView, ['visible', 'onDeviceBackButton']);

      return ToastView;
    }]);
  })();

  (function () {

    angular.module('onsen').directive('onsActionSheetButton', ['$onsen', 'GenericView', function ($onsen, GenericView) {
      return {
        restrict: 'E',
        link: function link(scope, element, attrs) {
          GenericView.register(scope, element, attrs, { viewKey: 'ons-action-sheet-button' });
          $onsen.fireComponentEvent(element[0], 'init');
        }
      };
    }]);
  })();

  /**
   * @element ons-action-sheet
   */

  /**
   * @attribute var
   * @initonly
   * @type {String}
   * @description
   *  [en]Variable name to refer this action sheet.[/en]
   *  [ja]このアクションシートを参照するための名前を指定します。[/ja]
   */

  /**
   * @attribute ons-preshow
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "preshow" event is fired.[/en]
   *  [ja]"preshow"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-prehide
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "prehide" event is fired.[/en]
   *  [ja]"prehide"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-postshow
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "postshow" event is fired.[/en]
   *  [ja]"postshow"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-posthide
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "posthide" event is fired.[/en]
   *  [ja]"posthide"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-destroy
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "destroy" event is fired.[/en]
   *  [ja]"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @method on
   * @signature on(eventName, listener)
   * @description
   *   [en]Add an event listener.[/en]
   *   [ja]イベントリスナーを追加します。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]イベントが発火された際に呼び出されるコールバックを指定します。[/ja]
   */

  /**
   * @method once
   * @signature once(eventName, listener)
   * @description
   *  [en]Add an event listener that's only triggered once.[/en]
   *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]イベントが発火した際に呼び出されるコールバックを指定します。[/ja]
   */

  /**
   * @method off
   * @signature off(eventName, [listener])
   * @description
   *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
   *  [ja]イベントリスナーを削除します。もしlistenerパラメータが指定されなかった場合、そのイベントのリスナーが全て削除されます。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]削除するイベントリスナーの関数オブジェクトを渡します。[/ja]
   */

  (function () {

    /**
     * Action sheet directive.
     */

    angular.module('onsen').directive('onsActionSheet', ['$onsen', 'ActionSheetView', function ($onsen, ActionSheetView) {
      return {
        restrict: 'E',
        replace: false,
        scope: true,
        transclude: false,

        compile: function compile(element, attrs) {

          return {
            pre: function pre(scope, element, attrs) {
              var actionSheet = new ActionSheetView(scope, element, attrs);

              $onsen.declareVarAttribute(attrs, actionSheet);
              $onsen.registerEventHandlers(actionSheet, 'preshow prehide postshow posthide destroy');
              $onsen.addModifierMethodsForCustomElements(actionSheet, element);

              element.data('ons-action-sheet', actionSheet);

              scope.$on('$destroy', function () {
                actionSheet._events = undefined;
                $onsen.removeModifierMethods(actionSheet);
                element.data('ons-action-sheet', undefined);
                element = null;
              });
            },
            post: function post(scope, element) {
              $onsen.fireComponentEvent(element[0], 'init');
            }
          };
        }
      };
    }]);
  })();

  /**
   * @element ons-alert-dialog
   */

  /**
   * @attribute var
   * @initonly
   * @type {String}
   * @description
   *  [en]Variable name to refer this alert dialog.[/en]
   *  [ja]このアラートダイアログを参照するための名前を指定します。[/ja]
   */

  /**
   * @attribute ons-preshow
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "preshow" event is fired.[/en]
   *  [ja]"preshow"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-prehide
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "prehide" event is fired.[/en]
   *  [ja]"prehide"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-postshow
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "postshow" event is fired.[/en]
   *  [ja]"postshow"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-posthide
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "posthide" event is fired.[/en]
   *  [ja]"posthide"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-destroy
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "destroy" event is fired.[/en]
   *  [ja]"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @method on
   * @signature on(eventName, listener)
   * @description
   *   [en]Add an event listener.[/en]
   *   [ja]イベントリスナーを追加します。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]イベントが発火された際に呼び出されるコールバックを指定します。[/ja]
   */

  /**
   * @method once
   * @signature once(eventName, listener)
   * @description
   *  [en]Add an event listener that's only triggered once.[/en]
   *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]イベントが発火した際に呼び出されるコールバックを指定します。[/ja]
   */

  /**
   * @method off
   * @signature off(eventName, [listener])
   * @description
   *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
   *  [ja]イベントリスナーを削除します。もしlistenerパラメータが指定されなかった場合、そのイベントのリスナーが全て削除されます。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]削除するイベントリスナーの関数オブジェクトを渡します。[/ja]
   */

  (function () {

    /**
     * Alert dialog directive.
     */

    angular.module('onsen').directive('onsAlertDialog', ['$onsen', 'AlertDialogView', function ($onsen, AlertDialogView) {
      return {
        restrict: 'E',
        replace: false,
        scope: true,
        transclude: false,

        compile: function compile(element, attrs) {

          return {
            pre: function pre(scope, element, attrs) {
              var alertDialog = new AlertDialogView(scope, element, attrs);

              $onsen.declareVarAttribute(attrs, alertDialog);
              $onsen.registerEventHandlers(alertDialog, 'preshow prehide postshow posthide destroy');
              $onsen.addModifierMethodsForCustomElements(alertDialog, element);

              element.data('ons-alert-dialog', alertDialog);
              element.data('_scope', scope);

              scope.$on('$destroy', function () {
                alertDialog._events = undefined;
                $onsen.removeModifierMethods(alertDialog);
                element.data('ons-alert-dialog', undefined);
                element = null;
              });
            },
            post: function post(scope, element) {
              $onsen.fireComponentEvent(element[0], 'init');
            }
          };
        }
      };
    }]);
  })();

  (function () {

    var module = angular.module('onsen');

    module.directive('onsBackButton', ['$onsen', '$compile', 'GenericView', 'ComponentCleaner', function ($onsen, $compile, GenericView, ComponentCleaner) {
      return {
        restrict: 'E',
        replace: false,

        compile: function compile(element, attrs) {

          return {
            pre: function pre(scope, element, attrs, controller, transclude) {
              var backButton = GenericView.register(scope, element, attrs, {
                viewKey: 'ons-back-button'
              });

              if (attrs.ngClick) {
                element[0].onClick = angular.noop;
              }

              scope.$on('$destroy', function () {
                backButton._events = undefined;
                $onsen.removeModifierMethods(backButton);
                element = null;
              });

              ComponentCleaner.onDestroy(scope, function () {
                ComponentCleaner.destroyScope(scope);
                ComponentCleaner.destroyAttributes(attrs);
                element = scope = attrs = null;
              });
            },
            post: function post(scope, element) {
              $onsen.fireComponentEvent(element[0], 'init');
            }
          };
        }
      };
    }]);
  })();

  (function () {

    angular.module('onsen').directive('onsBottomToolbar', ['$onsen', 'GenericView', function ($onsen, GenericView) {
      return {
        restrict: 'E',
        link: {
          pre: function pre(scope, element, attrs) {
            GenericView.register(scope, element, attrs, {
              viewKey: 'ons-bottomToolbar'
            });
          },

          post: function post(scope, element, attrs) {
            $onsen.fireComponentEvent(element[0], 'init');
          }
        }
      };
    }]);
  })();

  /**
   * @element ons-button
   */

  (function () {

    angular.module('onsen').directive('onsButton', ['$onsen', 'GenericView', function ($onsen, GenericView) {
      return {
        restrict: 'E',
        link: function link(scope, element, attrs) {
          var button = GenericView.register(scope, element, attrs, {
            viewKey: 'ons-button'
          });

          Object.defineProperty(button, 'disabled', {
            get: function get() {
              return this._element[0].disabled;
            },
            set: function set(value) {
              return this._element[0].disabled = value;
            }
          });
          $onsen.fireComponentEvent(element[0], 'init');
        }
      };
    }]);
  })();

  (function () {

    angular.module('onsen').directive('onsCard', ['$onsen', 'GenericView', function ($onsen, GenericView) {
      return {
        restrict: 'E',
        link: function link(scope, element, attrs) {
          GenericView.register(scope, element, attrs, { viewKey: 'ons-card' });
          $onsen.fireComponentEvent(element[0], 'init');
        }
      };
    }]);
  })();

  /**
   * @element ons-carousel
   * @description
   *   [en]Carousel component.[/en]
   *   [ja]カルーセルを表示できるコンポーネント。[/ja]
   * @codepen xbbzOQ
   * @guide UsingCarousel
   *   [en]Learn how to use the carousel component.[/en]
   *   [ja]carouselコンポーネントの使い方[/ja]
   * @example
   * <ons-carousel style="width: 100%; height: 200px">
   *   <ons-carousel-item>
   *    ...
   *   </ons-carousel-item>
   *   <ons-carousel-item>
   *    ...
   *   </ons-carousel-item>
   * </ons-carousel>
   */

  /**
   * @attribute var
   * @initonly
   * @type {String}
   * @description
   *   [en]Variable name to refer this carousel.[/en]
   *   [ja]このカルーセルを参照するための変数名を指定します。[/ja]
   */

  /**
   * @attribute ons-postchange
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "postchange" event is fired.[/en]
   *  [ja]"postchange"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-refresh
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "refresh" event is fired.[/en]
   *  [ja]"refresh"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-overscroll
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "overscroll" event is fired.[/en]
   *  [ja]"overscroll"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-destroy
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "destroy" event is fired.[/en]
   *  [ja]"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @method once
   * @signature once(eventName, listener)
   * @description
   *  [en]Add an event listener that's only triggered once.[/en]
   *  [ja]一度だけ呼び出されるイベントリスナを追加します。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
   */

  /**
   * @method off
   * @signature off(eventName, [listener])
   * @description
   *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
   *  [ja]イベントリスナーを削除します。もしイベントリスナーが指定されなかった場合には、そのイベントに紐付いているイベントリスナーが全て削除されます。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
   */

  /**
   * @method on
   * @signature on(eventName, listener)
   * @description
   *   [en]Add an event listener.[/en]
   *   [ja]イベントリスナーを追加します。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
   */

  (function () {

    var module = angular.module('onsen');

    module.directive('onsCarousel', ['$onsen', 'CarouselView', function ($onsen, CarouselView) {
      return {
        restrict: 'E',
        replace: false,

        // NOTE: This element must coexists with ng-controller.
        // Do not use isolated scope and template's ng-transclude.
        scope: false,
        transclude: false,

        compile: function compile(element, attrs) {

          return function (scope, element, attrs) {
            var carousel = new CarouselView(scope, element, attrs);

            element.data('ons-carousel', carousel);

            $onsen.registerEventHandlers(carousel, 'postchange refresh overscroll destroy');
            $onsen.declareVarAttribute(attrs, carousel);

            scope.$on('$destroy', function () {
              carousel._events = undefined;
              element.data('ons-carousel', undefined);
              element = null;
            });

            $onsen.fireComponentEvent(element[0], 'init');
          };
        }

      };
    }]);

    module.directive('onsCarouselItem', ['$onsen', function ($onsen) {
      return {
        restrict: 'E',
        compile: function compile(element, attrs) {
          return function (scope, element, attrs) {
            if (scope.$last) {
              var carousel = $onsen.util.findParent(element[0], 'ons-carousel');
              carousel._swiper.init({
                swipeable: carousel.hasAttribute('swipeable'),
                autoRefresh: carousel.hasAttribute('auto-refresh')
              });
            }
          };
        }
      };
    }]);
  })();

  /**
   * @element ons-checkbox
   */

  (function () {

    angular.module('onsen').directive('onsCheckbox', ['$parse', function ($parse) {
      return {
        restrict: 'E',
        replace: false,
        scope: false,

        link: function link(scope, element, attrs) {
          var el = element[0];

          var onChange = function onChange() {
            $parse(attrs.ngModel).assign(scope, el.checked);
            attrs.ngChange && scope.$eval(attrs.ngChange);
            scope.$parent.$evalAsync();
          };

          if (attrs.ngModel) {
            scope.$watch(attrs.ngModel, function (value) {
              return el.checked = value;
            });
            element.on('change', onChange);
          }

          scope.$on('$destroy', function () {
            element.off('change', onChange);
            scope = element = attrs = el = null;
          });
        }
      };
    }]);
  })();

  /**
   * @element ons-dialog
   */

  /**
   * @attribute var
   * @initonly
   * @type {String}
   * @description
   *  [en]Variable name to refer this dialog.[/en]
   *  [ja]このダイアログを参照するための名前を指定します。[/ja]
   */

  /**
   * @attribute ons-preshow
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "preshow" event is fired.[/en]
   *  [ja]"preshow"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-prehide
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "prehide" event is fired.[/en]
   *  [ja]"prehide"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-postshow
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "postshow" event is fired.[/en]
   *  [ja]"postshow"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-posthide
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "posthide" event is fired.[/en]
   *  [ja]"posthide"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-destroy
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "destroy" event is fired.[/en]
   *  [ja]"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @method on
   * @signature on(eventName, listener)
   * @description
   *   [en]Add an event listener.[/en]
   *   [ja]イベントリスナーを追加します。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
   */

  /**
   * @method once
   * @signature once(eventName, listener)
   * @description
   *  [en]Add an event listener that's only triggered once.[/en]
   *  [ja]一度だけ呼び出されるイベントリスナを追加します。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
   */

  /**
   * @method off
   * @signature off(eventName, [listener])
   * @description
   *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
   *  [ja]イベントリスナーを削除します。もしイベントリスナーが指定されなかった場合には、そのイベントに紐付いているイベントリスナーが全て削除されます。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
   */
  (function () {

    angular.module('onsen').directive('onsDialog', ['$onsen', 'DialogView', function ($onsen, DialogView) {
      return {
        restrict: 'E',
        scope: true,
        compile: function compile(element, attrs) {

          return {
            pre: function pre(scope, element, attrs) {

              var dialog = new DialogView(scope, element, attrs);
              $onsen.declareVarAttribute(attrs, dialog);
              $onsen.registerEventHandlers(dialog, 'preshow prehide postshow posthide destroy');
              $onsen.addModifierMethodsForCustomElements(dialog, element);

              element.data('ons-dialog', dialog);
              scope.$on('$destroy', function () {
                dialog._events = undefined;
                $onsen.removeModifierMethods(dialog);
                element.data('ons-dialog', undefined);
                element = null;
              });
            },

            post: function post(scope, element) {
              $onsen.fireComponentEvent(element[0], 'init');
            }
          };
        }
      };
    }]);
  })();

  (function () {

    var module = angular.module('onsen');

    module.directive('onsDummyForInit', ['$rootScope', function ($rootScope) {
      var isReady = false;

      return {
        restrict: 'E',
        replace: false,

        link: {
          post: function post(scope, element) {
            if (!isReady) {
              isReady = true;
              $rootScope.$broadcast('$ons-ready');
            }
            element.remove();
          }
        }
      };
    }]);
  })();

  /**
   * @element ons-fab
   */

  /**
   * @attribute var
   * @initonly
   * @type {String}
   * @description
   *   [en]Variable name to refer the floating action button.[/en]
   *   [ja]このフローティングアクションボタンを参照するための変数名をしてします。[/ja]
   */

  (function () {

    var module = angular.module('onsen');

    module.directive('onsFab', ['$onsen', 'FabView', function ($onsen, FabView) {
      return {
        restrict: 'E',
        replace: false,
        scope: false,
        transclude: false,

        compile: function compile(element, attrs) {

          return function (scope, element, attrs) {
            var fab = new FabView(scope, element, attrs);

            element.data('ons-fab', fab);

            $onsen.declareVarAttribute(attrs, fab);

            scope.$on('$destroy', function () {
              element.data('ons-fab', undefined);
              element = null;
            });

            $onsen.fireComponentEvent(element[0], 'init');
          };
        }

      };
    }]);
  })();

  (function () {

    var EVENTS = ('drag dragleft dragright dragup dragdown hold release swipe swipeleft swiperight ' + 'swipeup swipedown tap doubletap touch transform pinch pinchin pinchout rotate').split(/ +/);

    angular.module('onsen').directive('onsGestureDetector', ['$onsen', function ($onsen) {

      var scopeDef = EVENTS.reduce(function (dict, name) {
        dict['ng' + titlize(name)] = '&';
        return dict;
      }, {});

      function titlize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }

      return {
        restrict: 'E',
        scope: scopeDef,

        // NOTE: This element must coexists with ng-controller.
        // Do not use isolated scope and template's ng-transclude.
        replace: false,
        transclude: true,

        compile: function compile(element, attrs) {
          return function link(scope, element, attrs, _, transclude) {

            transclude(scope.$parent, function (cloned) {
              element.append(cloned);
            });

            var handler = function handler(event) {
              var attr = 'ng' + titlize(event.type);

              if (attr in scopeDef) {
                scope[attr]({ $event: event });
              }
            };

            var gestureDetector;

            setImmediate(function () {
              gestureDetector = element[0]._gestureDetector;
              gestureDetector.on(EVENTS.join(' '), handler);
            });

            $onsen.cleaner.onDestroy(scope, function () {
              gestureDetector.off(EVENTS.join(' '), handler);
              $onsen.clearComponent({
                scope: scope,
                element: element,
                attrs: attrs
              });
              gestureDetector.element = scope = element = attrs = null;
            });

            $onsen.fireComponentEvent(element[0], 'init');
          };
        }
      };
    }]);
  })();

  /**
   * @element ons-icon
   */

  (function () {

    angular.module('onsen').directive('onsIcon', ['$onsen', 'GenericView', function ($onsen, GenericView) {
      return {
        restrict: 'E',

        compile: function compile(element, attrs) {

          if (attrs.icon.indexOf('{{') !== -1) {
            attrs.$observe('icon', function () {
              setImmediate(function () {
                return element[0]._update();
              });
            });
          }

          return function (scope, element, attrs) {
            GenericView.register(scope, element, attrs, {
              viewKey: 'ons-icon'
            });
            // $onsen.fireComponentEvent(element[0], 'init');
          };
        }

      };
    }]);
  })();

  /**
   * @element ons-if-orientation
   * @category conditional
   * @description
   *   [en]Conditionally display content depending on screen orientation. Valid values are portrait and landscape. Different from other components, this component is used as attribute in any element.[/en]
   *   [ja]画面の向きに応じてコンテンツの制御を行います。portraitもしくはlandscapeを指定できます。すべての要素の属性に使用できます。[/ja]
   * @seealso ons-if-platform [en]ons-if-platform component[/en][ja]ons-if-platformコンポーネント[/ja]
   * @example
   * <div ons-if-orientation="portrait">
   *   <p>This will only be visible in portrait mode.</p>
   * </div>
   */

  /**
   * @attribute ons-if-orientation
   * @initonly
   * @type {String}
   * @description
   *   [en]Either "portrait" or "landscape".[/en]
   *   [ja]portraitもしくはlandscapeを指定します。[/ja]
   */

  (function () {

    var module = angular.module('onsen');

    module.directive('onsIfOrientation', ['$onsen', '$onsGlobal', function ($onsen, $onsGlobal) {
      return {
        restrict: 'A',
        replace: false,

        // NOTE: This element must coexists with ng-controller.
        // Do not use isolated scope and template's ng-transclude.
        transclude: false,
        scope: false,

        compile: function compile(element) {
          element.css('display', 'none');

          return function (scope, element, attrs) {
            attrs.$observe('onsIfOrientation', update);
            $onsGlobal.orientation.on('change', update);

            update();

            $onsen.cleaner.onDestroy(scope, function () {
              $onsGlobal.orientation.off('change', update);

              $onsen.clearComponent({
                element: element,
                scope: scope,
                attrs: attrs
              });
              element = scope = attrs = null;
            });

            function update() {
              var userOrientation = ('' + attrs.onsIfOrientation).toLowerCase();
              var orientation = getLandscapeOrPortrait();

              if (userOrientation === 'portrait' || userOrientation === 'landscape') {
                if (userOrientation === orientation) {
                  element.css('display', '');
                } else {
                  element.css('display', 'none');
                }
              }
            }

            function getLandscapeOrPortrait() {
              return $onsGlobal.orientation.isPortrait() ? 'portrait' : 'landscape';
            }
          };
        }
      };
    }]);
  })();

  /**
   * @element ons-if-platform
   * @category conditional
   * @description
   *    [en]Conditionally display content depending on the platform / browser. Valid values are "opera", "firefox", "safari", "chrome", "ie", "edge", "android", "blackberry", "ios" and "wp".[/en]
   *    [ja]プラットフォームやブラウザーに応じてコンテンツの制御をおこないます。opera, firefox, safari, chrome, ie, edge, android, blackberry, ios, wpのいずれかの値を空白区切りで複数指定できます。[/ja]
   * @seealso ons-if-orientation [en]ons-if-orientation component[/en][ja]ons-if-orientationコンポーネント[/ja]
   * @example
   * <div ons-if-platform="android">
   *   ...
   * </div>
   */

  /**
   * @attribute ons-if-platform
   * @type {String}
   * @initonly
   * @description
   *   [en]One or multiple space separated values: "opera", "firefox", "safari", "chrome", "ie", "edge", "android", "blackberry", "ios" or "wp".[/en]
   *   [ja]"opera", "firefox", "safari", "chrome", "ie", "edge", "android", "blackberry", "ios", "wp"のいずれか空白区切りで複数指定できます。[/ja]
   */

  (function () {

    var module = angular.module('onsen');

    module.directive('onsIfPlatform', ['$onsen', function ($onsen) {
      return {
        restrict: 'A',
        replace: false,

        // NOTE: This element must coexists with ng-controller.
        // Do not use isolated scope and template's ng-transclude.
        transclude: false,
        scope: false,

        compile: function compile(element) {
          element.css('display', 'none');

          var platform = getPlatformString();

          return function (scope, element, attrs) {
            attrs.$observe('onsIfPlatform', function (userPlatform) {
              if (userPlatform) {
                update();
              }
            });

            update();

            $onsen.cleaner.onDestroy(scope, function () {
              $onsen.clearComponent({
                element: element,
                scope: scope,
                attrs: attrs
              });
              element = scope = attrs = null;
            });

            function update() {
              var userPlatforms = attrs.onsIfPlatform.toLowerCase().trim().split(/\s+/);
              if (userPlatforms.indexOf(platform.toLowerCase()) >= 0) {
                element.css('display', 'block');
              } else {
                element.css('display', 'none');
              }
            }
          };

          function getPlatformString() {

            if (navigator.userAgent.match(/Android/i)) {
              return 'android';
            }

            if (navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/RIM Tablet OS/i) || navigator.userAgent.match(/BB10/i)) {
              return 'blackberry';
            }

            if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
              return 'ios';
            }

            if (navigator.userAgent.match(/Windows Phone|IEMobile|WPDesktop/i)) {
              return 'wp';
            }

            // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
            var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
            if (isOpera) {
              return 'opera';
            }

            var isFirefox = typeof InstallTrigger !== 'undefined'; // Firefox 1.0+
            if (isFirefox) {
              return 'firefox';
            }

            var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
            // At least Safari 3+: "[object HTMLElementConstructor]"
            if (isSafari) {
              return 'safari';
            }

            var isEdge = navigator.userAgent.indexOf(' Edge/') >= 0;
            if (isEdge) {
              return 'edge';
            }

            var isChrome = !!window.chrome && !isOpera && !isEdge; // Chrome 1+
            if (isChrome) {
              return 'chrome';
            }

            var isIE = /*@cc_on!@*/!!document.documentMode; // At least IE6
            if (isIE) {
              return 'ie';
            }

            return 'unknown';
          }
        }
      };
    }]);
  })();

  /**
   * @element ons-input
   */

  (function () {

    angular.module('onsen').directive('onsInput', ['$parse', function ($parse) {
      return {
        restrict: 'E',
        replace: false,
        scope: false,

        link: function link(scope, element, attrs) {
          var el = element[0];

          var onInput = function onInput() {
            $parse(attrs.ngModel).assign(scope, el.type === 'number' ? Number(el.value) : el.value);
            attrs.ngChange && scope.$eval(attrs.ngChange);
            scope.$parent.$evalAsync();
          };

          if (attrs.ngModel) {
            scope.$watch(attrs.ngModel, function (value) {
              if (typeof value !== 'undefined' && value !== el.value) {
                el.value = value;
              }
            });

            element.on('input', onInput);
          }

          scope.$on('$destroy', function () {
            element.off('input', onInput);
            scope = element = attrs = el = null;
          });
        }
      };
    }]);
  })();

  /**
   * @element ons-keyboard-active
   * @category form
   * @description
   *   [en]
   *     Conditionally display content depending on if the software keyboard is visible or hidden.
   *     This component requires cordova and that the com.ionic.keyboard plugin is installed.
   *   [/en]
   *   [ja]
   *     ソフトウェアキーボードが表示されているかどうかで、コンテンツを表示するかどうかを切り替えることが出来ます。
   *     このコンポーネントは、Cordovaやcom.ionic.keyboardプラグインを必要とします。
   *   [/ja]
   * @example
   * <div ons-keyboard-active>
   *   This will only be displayed if the software keyboard is open.
   * </div>
   * <div ons-keyboard-inactive>
   *   There is also a component that does the opposite.
   * </div>
   */

  /**
   * @attribute ons-keyboard-active
   * @description
   *   [en]The content of tags with this attribute will be visible when the software keyboard is open.[/en]
   *   [ja]この属性がついた要素は、ソフトウェアキーボードが表示された時に初めて表示されます。[/ja]
   */

  /**
   * @attribute ons-keyboard-inactive
   * @description
   *   [en]The content of tags with this attribute will be visible when the software keyboard is hidden.[/en]
   *   [ja]この属性がついた要素は、ソフトウェアキーボードが隠れている時のみ表示されます。[/ja]
   */

  (function () {

    var module = angular.module('onsen');

    var compileFunction = function compileFunction(show, $onsen) {
      return function (element) {
        return function (scope, element, attrs) {
          var dispShow = show ? 'block' : 'none',
              dispHide = show ? 'none' : 'block';

          var onShow = function onShow() {
            element.css('display', dispShow);
          };

          var onHide = function onHide() {
            element.css('display', dispHide);
          };

          var onInit = function onInit(e) {
            if (e.visible) {
              onShow();
            } else {
              onHide();
            }
          };

          ons.softwareKeyboard.on('show', onShow);
          ons.softwareKeyboard.on('hide', onHide);
          ons.softwareKeyboard.on('init', onInit);

          if (ons.softwareKeyboard._visible) {
            onShow();
          } else {
            onHide();
          }

          $onsen.cleaner.onDestroy(scope, function () {
            ons.softwareKeyboard.off('show', onShow);
            ons.softwareKeyboard.off('hide', onHide);
            ons.softwareKeyboard.off('init', onInit);

            $onsen.clearComponent({
              element: element,
              scope: scope,
              attrs: attrs
            });
            element = scope = attrs = null;
          });
        };
      };
    };

    module.directive('onsKeyboardActive', ['$onsen', function ($onsen) {
      return {
        restrict: 'A',
        replace: false,
        transclude: false,
        scope: false,
        compile: compileFunction(true, $onsen)
      };
    }]);

    module.directive('onsKeyboardInactive', ['$onsen', function ($onsen) {
      return {
        restrict: 'A',
        replace: false,
        transclude: false,
        scope: false,
        compile: compileFunction(false, $onsen)
      };
    }]);
  })();

  /**
   * @element ons-lazy-repeat
   * @description
   *   [en]
   *     Using this component a list with millions of items can be rendered without a drop in performance.
   *     It does that by "lazily" loading elements into the DOM when they come into view and
   *     removing items from the DOM when they are not visible.
   *   [/en]
   *   [ja]
   *     このコンポーネント内で描画されるアイテムのDOM要素の読み込みは、画面に見えそうになった時まで自動的に遅延され、
   *     画面から見えなくなった場合にはその要素は動的にアンロードされます。
   *     このコンポーネントを使うことで、パフォーマンスを劣化させること無しに巨大な数の要素を描画できます。
   *   [/ja]
   * @codepen QwrGBm
   * @guide UsingLazyRepeat
   *   [en]How to use Lazy Repeat[/en]
   *   [ja]レイジーリピートの使い方[/ja]
   * @example
   * <script>
   *   ons.bootstrap()
   *
   *   .controller('MyController', function($scope) {
   *     $scope.MyDelegate = {
   *       countItems: function() {
   *         // Return number of items.
   *         return 1000000;
   *       },
   *
   *       calculateItemHeight: function(index) {
   *         // Return the height of an item in pixels.
   *         return 45;
   *       },
   *
   *       configureItemScope: function(index, itemScope) {
   *         // Initialize scope
   *         itemScope.item = 'Item #' + (index + 1);
   *       },
   *
   *       destroyItemScope: function(index, itemScope) {
   *         // Optional method that is called when an item is unloaded.
   *         console.log('Destroyed item with index: ' + index);
   *       }
   *     };
   *   });
   * </script>
   *
   * <ons-list ng-controller="MyController">
   *   <ons-list-item ons-lazy-repeat="MyDelegate">
   *     {{ item }}
   *   </ons-list-item>
   * </ons-list>
   */

  /**
   * @attribute ons-lazy-repeat
   * @type {Expression}
   * @initonly
   * @description
   *  [en]A delegate object, can be either an object attached to the scope (when using AngularJS) or a normal JavaScript variable.[/en]
   *  [ja]要素のロード、アンロードなどの処理を委譲するオブジェクトを指定します。AngularJSのスコープの変数名や、通常のJavaScriptの変数名を指定します。[/ja]
   */

  /**
   * @property delegate.configureItemScope
   * @type {Function}
   * @description
   *   [en]Function which recieves an index and the scope for the item. Can be used to configure values in the item scope.[/en]
   *   [ja][/ja]
   */

  (function () {

    var module = angular.module('onsen');

    /**
     * Lazy repeat directive.
     */
    module.directive('onsLazyRepeat', ['$onsen', 'LazyRepeatView', function ($onsen, LazyRepeatView) {
      return {
        restrict: 'A',
        replace: false,
        priority: 1000,
        terminal: true,

        compile: function compile(element, attrs) {
          return function (scope, element, attrs) {
            var lazyRepeat = new LazyRepeatView(scope, element, attrs);

            scope.$on('$destroy', function () {
              scope = element = attrs = lazyRepeat = null;
            });
          };
        }
      };
    }]);
  })();

  (function () {

    angular.module('onsen').directive('onsListHeader', ['$onsen', 'GenericView', function ($onsen, GenericView) {
      return {
        restrict: 'E',
        link: function link(scope, element, attrs) {
          GenericView.register(scope, element, attrs, { viewKey: 'ons-list-header' });
          $onsen.fireComponentEvent(element[0], 'init');
        }
      };
    }]);
  })();

  (function () {

    angular.module('onsen').directive('onsListItem', ['$onsen', 'GenericView', function ($onsen, GenericView) {
      return {
        restrict: 'E',
        link: function link(scope, element, attrs) {
          GenericView.register(scope, element, attrs, { viewKey: 'ons-list-item' });
          $onsen.fireComponentEvent(element[0], 'init');
        }
      };
    }]);
  })();

  (function () {

    angular.module('onsen').directive('onsList', ['$onsen', 'GenericView', function ($onsen, GenericView) {
      return {
        restrict: 'E',
        link: function link(scope, element, attrs) {
          GenericView.register(scope, element, attrs, { viewKey: 'ons-list' });
          $onsen.fireComponentEvent(element[0], 'init');
        }
      };
    }]);
  })();

  (function () {

    angular.module('onsen').directive('onsListTitle', ['$onsen', 'GenericView', function ($onsen, GenericView) {
      return {
        restrict: 'E',
        link: function link(scope, element, attrs) {
          GenericView.register(scope, element, attrs, { viewKey: 'ons-list-title' });
          $onsen.fireComponentEvent(element[0], 'init');
        }
      };
    }]);
  })();

  /**
   * @element ons-loading-placeholder
   * @category util
   * @description
   *   [en]Display a placeholder while the content is loading.[/en]
   *   [ja]Onsen UIが読み込まれるまでに表示するプレースホルダーを表現します。[/ja]
   * @example
   * <div ons-loading-placeholder="page.html">
   *   Loading...
   * </div>
   */

  /**
   * @attribute ons-loading-placeholder
   * @initonly
   * @type {String}
   * @description
   *   [en]The url of the page to load.[/en]
   *   [ja]読み込むページのURLを指定します。[/ja]
   */

  (function () {

    angular.module('onsen').directive('onsLoadingPlaceholder', function () {
      return {
        restrict: 'A',
        link: function link(scope, element, attrs) {
          if (attrs.onsLoadingPlaceholder) {
            ons._resolveLoadingPlaceholder(element[0], attrs.onsLoadingPlaceholder, function (contentElement, done) {
              ons.compile(contentElement);
              scope.$evalAsync(function () {
                setImmediate(done);
              });
            });
          }
        }
      };
    });
  })();

  /**
   * @element ons-modal
   */

  /**
   * @attribute var
   * @type {String}
   * @initonly
   * @description
   *   [en]Variable name to refer this modal.[/en]
   *   [ja]このモーダルを参照するための名前を指定します。[/ja]
   */

  /**
   * @attribute ons-preshow
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "preshow" event is fired.[/en]
   *  [ja]"preshow"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-prehide
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "prehide" event is fired.[/en]
   *  [ja]"prehide"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-postshow
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "postshow" event is fired.[/en]
   *  [ja]"postshow"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-posthide
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "posthide" event is fired.[/en]
   *  [ja]"posthide"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-destroy
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "destroy" event is fired.[/en]
   *  [ja]"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  (function () {

    /**
     * Modal directive.
     */

    angular.module('onsen').directive('onsModal', ['$onsen', 'ModalView', function ($onsen, ModalView) {
      return {
        restrict: 'E',
        replace: false,

        // NOTE: This element must coexists with ng-controller.
        // Do not use isolated scope and template's ng-transclude.
        scope: false,
        transclude: false,

        compile: function compile(element, attrs) {

          return {
            pre: function pre(scope, element, attrs) {
              var modal = new ModalView(scope, element, attrs);
              $onsen.addModifierMethodsForCustomElements(modal, element);

              $onsen.declareVarAttribute(attrs, modal);
              $onsen.registerEventHandlers(modal, 'preshow prehide postshow posthide destroy');
              element.data('ons-modal', modal);

              scope.$on('$destroy', function () {
                $onsen.removeModifierMethods(modal);
                element.data('ons-modal', undefined);
                modal = element = scope = attrs = null;
              });
            },

            post: function post(scope, element) {
              $onsen.fireComponentEvent(element[0], 'init');
            }
          };
        }
      };
    }]);
  })();

  /**
   * @element ons-navigator
   * @example
   * <ons-navigator animation="slide" var="app.navi">
   *   <ons-page>
   *     <ons-toolbar>
   *       <div class="center">Title</div>
   *     </ons-toolbar>
   *
   *     <p style="text-align: center">
   *       <ons-button modifier="light" ng-click="app.navi.pushPage('page.html');">Push</ons-button>
   *     </p>
   *   </ons-page>
   * </ons-navigator>
   *
   * <ons-template id="page.html">
   *   <ons-page>
   *     <ons-toolbar>
   *       <div class="center">Title</div>
   *     </ons-toolbar>
   *
   *     <p style="text-align: center">
   *       <ons-button modifier="light" ng-click="app.navi.popPage();">Pop</ons-button>
   *     </p>
   *   </ons-page>
   * </ons-template>
   */

  /**
   * @attribute var
   * @initonly
   * @type {String}
   * @description
   *  [en]Variable name to refer this navigator.[/en]
   *  [ja]このナビゲーターを参照するための名前を指定します。[/ja]
   */

  /**
   * @attribute ons-prepush
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "prepush" event is fired.[/en]
   *  [ja]"prepush"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-prepop
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "prepop" event is fired.[/en]
   *  [ja]"prepop"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-postpush
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "postpush" event is fired.[/en]
   *  [ja]"postpush"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-postpop
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "postpop" event is fired.[/en]
   *  [ja]"postpop"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-init
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when a page's "init" event is fired.[/en]
   *  [ja]ページの"init"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-show
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when a page's "show" event is fired.[/en]
   *  [ja]ページの"show"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-hide
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when a page's "hide" event is fired.[/en]
   *  [ja]ページの"hide"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-destroy
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when a page's "destroy" event is fired.[/en]
   *  [ja]ページの"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @method on
   * @signature on(eventName, listener)
   * @description
   *   [en]Add an event listener.[/en]
   *   [ja]イベントリスナーを追加します。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]このイベントが発火された際に呼び出される関数オブジェクトを指定します。[/ja]
   */

  /**
   * @method once
   * @signature once(eventName, listener)
   * @description
   *  [en]Add an event listener that's only triggered once.[/en]
   *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
   */

  /**
   * @method off
   * @signature off(eventName, [listener])
   * @description
   *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
   *  [ja]イベントリスナーを削除します。もしイベントリスナーを指定しなかった場合には、そのイベントに紐づく全てのイベントリスナーが削除されます。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]削除するイベントリスナーを指定します。[/ja]
   */

  (function () {

    var lastReady = window.ons.elements.Navigator.rewritables.ready;
    window.ons.elements.Navigator.rewritables.ready = ons._waitDiretiveInit('ons-navigator', lastReady);

    angular.module('onsen').directive('onsNavigator', ['NavigatorView', '$onsen', function (NavigatorView, $onsen) {
      return {
        restrict: 'E',

        // NOTE: This element must coexists with ng-controller.
        // Do not use isolated scope and template's ng-transclude.
        transclude: false,
        scope: true,

        compile: function compile(element) {

          return {
            pre: function pre(scope, element, attrs, controller) {
              var view = new NavigatorView(scope, element, attrs);

              $onsen.declareVarAttribute(attrs, view);
              $onsen.registerEventHandlers(view, 'prepush prepop postpush postpop init show hide destroy');

              element.data('ons-navigator', view);

              element[0].pageLoader = $onsen.createPageLoader(view);

              scope.$on('$destroy', function () {
                view._events = undefined;
                element.data('ons-navigator', undefined);
                scope = element = null;
              });
            },
            post: function post(scope, element, attrs) {
              $onsen.fireComponentEvent(element[0], 'init');
            }
          };
        }
      };
    }]);
  })();

  /**
   * @element ons-page
   */

  /**
   * @attribute var
   * @initonly
   * @type {String}
   * @description
   *   [en]Variable name to refer this page.[/en]
   *   [ja]このページを参照するための名前を指定します。[/ja]
   */

  /**
   * @attribute ng-infinite-scroll
   * @initonly
   * @type {String}
   * @description
   *   [en]Path of the function to be executed on infinite scrolling. The path is relative to $scope. The function receives a done callback that must be called when it's finished.[/en]
   *   [ja][/ja]
   */

  /**
   * @attribute on-device-back-button
   * @type {Expression}
   * @description
   *   [en]Allows you to specify custom behavior when the back button is pressed.[/en]
   *   [ja]デバイスのバックボタンが押された時の挙動を設定できます。[/ja]
   */

  /**
   * @attribute ng-device-back-button
   * @initonly
   * @type {Expression}
   * @description
   *   [en]Allows you to specify custom behavior with an AngularJS expression when the back button is pressed.[/en]
   *   [ja]デバイスのバックボタンが押された時の挙動を設定できます。AngularJSのexpressionを指定できます。[/ja]
   */

  /**
   * @attribute ons-init
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "init" event is fired.[/en]
   *  [ja]"init"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-show
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "show" event is fired.[/en]
   *  [ja]"show"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-hide
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "hide" event is fired.[/en]
   *  [ja]"hide"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-destroy
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "destroy" event is fired.[/en]
   *  [ja]"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  (function () {

    var module = angular.module('onsen');

    module.directive('onsPage', ['$onsen', 'PageView', function ($onsen, PageView) {

      function firePageInitEvent(element) {
        // TODO: remove dirty fix
        var i = 0,
            f = function f() {
          if (i++ < 15) {
            if (isAttached(element)) {
              $onsen.fireComponentEvent(element, 'init');
              fireActualPageInitEvent(element);
            } else {
              if (i > 10) {
                setTimeout(f, 1000 / 60);
              } else {
                setImmediate(f);
              }
            }
          } else {
            throw new Error('Fail to fire "pageinit" event. Attach "ons-page" element to the document after initialization.');
          }
        };

        f();
      }

      function fireActualPageInitEvent(element) {
        var event = document.createEvent('HTMLEvents');
        event.initEvent('pageinit', true, true);
        element.dispatchEvent(event);
      }

      function isAttached(element) {
        if (document.documentElement === element) {
          return true;
        }
        return element.parentNode ? isAttached(element.parentNode) : false;
      }

      return {
        restrict: 'E',

        // NOTE: This element must coexists with ng-controller.
        // Do not use isolated scope and template's ng-transclude.
        transclude: false,
        scope: true,

        compile: function compile(element, attrs) {
          return {
            pre: function pre(scope, element, attrs) {
              var page = new PageView(scope, element, attrs);

              $onsen.declareVarAttribute(attrs, page);
              $onsen.registerEventHandlers(page, 'init show hide destroy');

              element.data('ons-page', page);
              $onsen.addModifierMethodsForCustomElements(page, element);

              element.data('_scope', scope);

              $onsen.cleaner.onDestroy(scope, function () {
                page._events = undefined;
                $onsen.removeModifierMethods(page);
                element.data('ons-page', undefined);
                element.data('_scope', undefined);

                $onsen.clearComponent({
                  element: element,
                  scope: scope,
                  attrs: attrs
                });
                scope = element = attrs = null;
              });
            },

            post: function postLink(scope, element, attrs) {
              firePageInitEvent(element[0]);
            }
          };
        }
      };
    }]);
  })();

  /**
   * @element ons-popover
   */

  /**
   * @attribute var
   * @initonly
   * @type {String}
   * @description
   *  [en]Variable name to refer this popover.[/en]
   *  [ja]このポップオーバーを参照するための名前を指定します。[/ja]
   */

  /**
   * @attribute ons-preshow
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "preshow" event is fired.[/en]
   *  [ja]"preshow"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-prehide
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "prehide" event is fired.[/en]
   *  [ja]"prehide"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-postshow
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "postshow" event is fired.[/en]
   *  [ja]"postshow"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-posthide
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "posthide" event is fired.[/en]
   *  [ja]"posthide"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-destroy
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "destroy" event is fired.[/en]
   *  [ja]"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @method on
   * @signature on(eventName, listener)
   * @description
   *   [en]Add an event listener.[/en]
   *   [ja]イベントリスナーを追加します。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]このイベントが発火された際に呼び出される関数オブジェクトを指定します。[/ja]
   */

  /**
   * @method once
   * @signature once(eventName, listener)
   * @description
   *  [en]Add an event listener that's only triggered once.[/en]
   *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
   */

  /**
   * @method off
   * @signature off(eventName, [listener])
   * @description
   *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
   *  [ja]イベントリスナーを削除します。もしイベントリスナーを指定しなかった場合には、そのイベントに紐づく全てのイベントリスナーが削除されます。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]削除するイベントリスナーを指定します。[/ja]
   */

  (function () {

    var module = angular.module('onsen');

    module.directive('onsPopover', ['$onsen', 'PopoverView', function ($onsen, PopoverView) {
      return {
        restrict: 'E',
        replace: false,
        scope: true,
        compile: function compile(element, attrs) {
          return {
            pre: function pre(scope, element, attrs) {

              var popover = new PopoverView(scope, element, attrs);

              $onsen.declareVarAttribute(attrs, popover);
              $onsen.registerEventHandlers(popover, 'preshow prehide postshow posthide destroy');
              $onsen.addModifierMethodsForCustomElements(popover, element);

              element.data('ons-popover', popover);

              scope.$on('$destroy', function () {
                popover._events = undefined;
                $onsen.removeModifierMethods(popover);
                element.data('ons-popover', undefined);
                element = null;
              });
            },

            post: function post(scope, element) {
              $onsen.fireComponentEvent(element[0], 'init');
            }
          };
        }
      };
    }]);
  })();

  /**
   * @element ons-pull-hook
   * @example
   * <script>
   *   ons.bootstrap()
   *
   *   .controller('MyController', function($scope, $timeout) {
   *     $scope.items = [3, 2 ,1];
   *
   *     $scope.load = function($done) {
   *       $timeout(function() {
   *         $scope.items.unshift($scope.items.length + 1);
   *         $done();
   *       }, 1000);
   *     };
   *   });
   * </script>
   *
   * <ons-page ng-controller="MyController">
   *   <ons-pull-hook var="loader" ng-action="load($done)">
   *     <span ng-switch="loader.state">
   *       <span ng-switch-when="initial">Pull down to refresh</span>
   *       <span ng-switch-when="preaction">Release to refresh</span>
   *       <span ng-switch-when="action">Loading data. Please wait...</span>
   *     </span>
   *   </ons-pull-hook>
   *   <ons-list>
   *     <ons-list-item ng-repeat="item in items">
   *       Item #{{ item }}
   *     </ons-list-item>
   *   </ons-list>
   * </ons-page>
   */

  /**
   * @attribute var
   * @initonly
   * @type {String}
   * @description
   *   [en]Variable name to refer this component.[/en]
   *   [ja]このコンポーネントを参照するための名前を指定します。[/ja]
   */

  /**
   * @attribute ng-action
   * @initonly
   * @type {Expression}
   * @description
   *   [en]Use to specify custom behavior when the page is pulled down. A <code>$done</code> function is available to tell the component that the action is completed.[/en]
   *   [ja]pull downしたときの振る舞いを指定します。アクションが完了した時には<code>$done</code>関数を呼び出します。[/ja]
   */

  /**
   * @attribute ons-changestate
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "changestate" event is fired.[/en]
   *  [ja]"changestate"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @method on
   * @signature on(eventName, listener)
   * @description
   *   [en]Add an event listener.[/en]
   *   [ja]イベントリスナーを追加します。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]このイベントが発火された際に呼び出される関数オブジェクトを指定します。[/ja]
   */

  /**
   * @method once
   * @signature once(eventName, listener)
   * @description
   *  [en]Add an event listener that's only triggered once.[/en]
   *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
   */

  /**
   * @method off
   * @signature off(eventName, [listener])
   * @description
   *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
   *  [ja]イベントリスナーを削除します。もしイベントリスナーを指定しなかった場合には、そのイベントに紐づく全てのイベントリスナーが削除されます。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]削除するイベントリスナーを指定します。[/ja]
   */

  (function () {

    /**
     * Pull hook directive.
     */

    angular.module('onsen').directive('onsPullHook', ['$onsen', 'PullHookView', function ($onsen, PullHookView) {
      return {
        restrict: 'E',
        replace: false,
        scope: true,

        compile: function compile(element, attrs) {
          return {
            pre: function pre(scope, element, attrs) {
              var pullHook = new PullHookView(scope, element, attrs);

              $onsen.declareVarAttribute(attrs, pullHook);
              $onsen.registerEventHandlers(pullHook, 'changestate destroy');
              element.data('ons-pull-hook', pullHook);

              scope.$on('$destroy', function () {
                pullHook._events = undefined;
                element.data('ons-pull-hook', undefined);
                scope = element = attrs = null;
              });
            },
            post: function post(scope, element) {
              $onsen.fireComponentEvent(element[0], 'init');
            }
          };
        }
      };
    }]);
  })();

  /**
   * @element ons-radio
   */

  (function () {

    angular.module('onsen').directive('onsRadio', ['$parse', function ($parse) {
      return {
        restrict: 'E',
        replace: false,
        scope: false,

        link: function link(scope, element, attrs) {
          var el = element[0];

          var onChange = function onChange() {
            $parse(attrs.ngModel).assign(scope, el.value);
            attrs.ngChange && scope.$eval(attrs.ngChange);
            scope.$parent.$evalAsync();
          };

          if (attrs.ngModel) {
            scope.$watch(attrs.ngModel, function (value) {
              return el.checked = value === el.value;
            });
            element.on('change', onChange);
          }

          scope.$on('$destroy', function () {
            element.off('change', onChange);
            scope = element = attrs = el = null;
          });
        }
      };
    }]);
  })();

  (function () {

    angular.module('onsen').directive('onsRange', ['$parse', function ($parse) {
      return {
        restrict: 'E',
        replace: false,
        scope: false,

        link: function link(scope, element, attrs) {

          var onInput = function onInput() {
            var set = $parse(attrs.ngModel).assign;

            set(scope, element[0].value);
            if (attrs.ngChange) {
              scope.$eval(attrs.ngChange);
            }
            scope.$parent.$evalAsync();
          };

          if (attrs.ngModel) {
            scope.$watch(attrs.ngModel, function (value) {
              element[0].value = value;
            });

            element.on('input', onInput);
          }

          scope.$on('$destroy', function () {
            element.off('input', onInput);
            scope = element = attrs = null;
          });
        }
      };
    }]);
  })();

  (function () {

    angular.module('onsen').directive('onsRipple', ['$onsen', 'GenericView', function ($onsen, GenericView) {
      return {
        restrict: 'E',
        link: function link(scope, element, attrs) {
          GenericView.register(scope, element, attrs, { viewKey: 'ons-ripple' });
          $onsen.fireComponentEvent(element[0], 'init');
        }
      };
    }]);
  })();

  /**
   * @element ons-scope
   * @category util
   * @description
   *   [en]All child elements using the "var" attribute will be attached to the scope of this element.[/en]
   *   [ja]"var"属性を使っている全ての子要素のviewオブジェクトは、この要素のAngularJSスコープに追加されます。[/ja]
   * @example
   * <ons-list>
   *   <ons-list-item ons-scope ng-repeat="item in items">
   *     <ons-carousel var="carousel">
   *       <ons-carousel-item ng-click="carousel.next()">
   *         {{ item }}
   *       </ons-carousel-item>
   *       </ons-carousel-item ng-click="carousel.prev()">
   *         ...
   *       </ons-carousel-item>
   *     </ons-carousel>
   *   </ons-list-item>
   * </ons-list>
   */

  (function () {

    var module = angular.module('onsen');

    module.directive('onsScope', ['$onsen', function ($onsen) {
      return {
        restrict: 'A',
        replace: false,
        transclude: false,
        scope: false,

        link: function link(scope, element) {
          element.data('_scope', scope);

          scope.$on('$destroy', function () {
            element.data('_scope', undefined);
          });
        }
      };
    }]);
  })();

  /**
   * @element ons-search-input
   */

  (function () {

    angular.module('onsen').directive('onsSearchInput', ['$parse', function ($parse) {
      return {
        restrict: 'E',
        replace: false,
        scope: false,

        link: function link(scope, element, attrs) {
          var el = element[0];

          var onInput = function onInput() {
            $parse(attrs.ngModel).assign(scope, el.type === 'number' ? Number(el.value) : el.value);
            attrs.ngChange && scope.$eval(attrs.ngChange);
            scope.$parent.$evalAsync();
          };

          if (attrs.ngModel) {
            scope.$watch(attrs.ngModel, function (value) {
              if (typeof value !== 'undefined' && value !== el.value) {
                el.value = value;
              }
            });

            element.on('input', onInput);
          }

          scope.$on('$destroy', function () {
            element.off('input', onInput);
            scope = element = attrs = el = null;
          });
        }
      };
    }]);
  })();

  /**
   * @element ons-segment
   */

  /**
   * @attribute var
   * @initonly
   * @type {String}
   * @description
   *   [en]Variable name to refer this segment.[/en]
   *   [ja]このタブバーを参照するための名前を指定します。[/ja]
   */

  /**
   * @attribute ons-postchange
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "postchange" event is fired.[/en]
   *  [ja]"postchange"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  (function () {

    angular.module('onsen').directive('onsSegment', ['$onsen', 'GenericView', function ($onsen, GenericView) {
      return {
        restrict: 'E',
        link: function link(scope, element, attrs) {
          var view = GenericView.register(scope, element, attrs, { viewKey: 'ons-segment' });
          $onsen.fireComponentEvent(element[0], 'init');
          $onsen.registerEventHandlers(view, 'postchange');
        }
      };
    }]);
  })();

  /**
   * @element ons-select
   */

  /**
   * @method on
   * @signature on(eventName, listener)
   * @description
   *   [en]Add an event listener.[/en]
   *   [ja]イベントリスナーを追加します。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]このイベントが発火された際に呼び出される関数オブジェクトを指定します。[/ja]
   */

  /**
   * @method once
   * @signature once(eventName, listener)
   * @description
   *  [en]Add an event listener that's only triggered once.[/en]
   *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
   */

  /**
   * @method off
   * @signature off(eventName, [listener])
   * @description
   *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
   *  [ja]イベントリスナーを削除します。もしイベントリスナーを指定しなかった場合には、そのイベントに紐づく全てのイベントリスナーが削除されます。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]削除するイベントリスナーを指定します。[/ja]
   */

  (function () {

    angular.module('onsen').directive('onsSelect', ['$parse', '$onsen', 'GenericView', function ($parse, $onsen, GenericView) {
      return {
        restrict: 'E',
        replace: false,
        scope: false,

        link: function link(scope, element, attrs) {
          var onInput = function onInput() {
            var set = $parse(attrs.ngModel).assign;

            set(scope, element[0].value);
            if (attrs.ngChange) {
              scope.$eval(attrs.ngChange);
            }
            scope.$parent.$evalAsync();
          };

          if (attrs.ngModel) {
            scope.$watch(attrs.ngModel, function (value) {
              element[0].value = value;
            });

            element.on('input', onInput);
          }

          scope.$on('$destroy', function () {
            element.off('input', onInput);
            scope = element = attrs = null;
          });

          GenericView.register(scope, element, attrs, { viewKey: 'ons-select' });
          $onsen.fireComponentEvent(element[0], 'init');
        }
      };
    }]);
  })();

  /**
   * @element ons-speed-dial
   */

  /**
   * @attribute var
   * @initonly
   * @type {String}
   * @description
   *   [en]Variable name to refer the speed dial.[/en]
   *   [ja]このスピードダイアルを参照するための変数名をしてします。[/ja]
   */

  /**
   * @attribute ons-open
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "open" event is fired.[/en]
   *  [ja]"open"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-close
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "close" event is fired.[/en]
   *  [ja]"close"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @method once
   * @signature once(eventName, listener)
   * @description
   *  [en]Add an event listener that's only triggered once.[/en]
   *  [ja]一度だけ呼び出されるイベントリスナを追加します。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
   */

  /**
   * @method off
   * @signature off(eventName, [listener])
   * @description
   *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
   *  [ja]イベントリスナーを削除します。もしイベントリスナーが指定されなかった場合には、そのイベントに紐付いているイベントリスナーが全て削除されます。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
   */

  /**
   * @method on
   * @signature on(eventName, listener)
   * @description
   *   [en]Add an event listener.[/en]
   *   [ja]イベントリスナーを追加します。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
   */

  (function () {

    var module = angular.module('onsen');

    module.directive('onsSpeedDial', ['$onsen', 'SpeedDialView', function ($onsen, SpeedDialView) {
      return {
        restrict: 'E',
        replace: false,
        scope: false,
        transclude: false,

        compile: function compile(element, attrs) {

          return function (scope, element, attrs) {
            var speedDial = new SpeedDialView(scope, element, attrs);

            element.data('ons-speed-dial', speedDial);

            $onsen.registerEventHandlers(speedDial, 'open close');
            $onsen.declareVarAttribute(attrs, speedDial);

            scope.$on('$destroy', function () {
              speedDial._events = undefined;
              element.data('ons-speed-dial', undefined);
              element = null;
            });

            $onsen.fireComponentEvent(element[0], 'init');
          };
        }

      };
    }]);
  })();

  /**
   * @element ons-splitter-content
   */

  /**
   * @attribute var
   * @initonly
   * @type {String}
   * @description
   *   [en]Variable name to refer this splitter content.[/en]
   *   [ja]このスプリッターコンポーネントを参照するための名前を指定します。[/ja]
   */

  /**
   * @attribute ons-destroy
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "destroy" event is fired.[/en]
   *  [ja]"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */
  (function () {

    var lastReady = window.ons.elements.SplitterContent.rewritables.ready;
    window.ons.elements.SplitterContent.rewritables.ready = ons._waitDiretiveInit('ons-splitter-content', lastReady);

    angular.module('onsen').directive('onsSplitterContent', ['$compile', 'SplitterContent', '$onsen', function ($compile, SplitterContent, $onsen) {
      return {
        restrict: 'E',

        compile: function compile(element, attrs) {

          return function (scope, element, attrs) {

            var view = new SplitterContent(scope, element, attrs);

            $onsen.declareVarAttribute(attrs, view);
            $onsen.registerEventHandlers(view, 'destroy');

            element.data('ons-splitter-content', view);

            element[0].pageLoader = $onsen.createPageLoader(view);

            scope.$on('$destroy', function () {
              view._events = undefined;
              element.data('ons-splitter-content', undefined);
            });

            $onsen.fireComponentEvent(element[0], 'init');
          };
        }
      };
    }]);
  })();

  /**
   * @element ons-splitter-side
   */

  /**
   * @attribute var
   * @initonly
   * @type {String}
   * @description
   *   [en]Variable name to refer this splitter side.[/en]
   *   [ja]このスプリッターコンポーネントを参照するための名前を指定します。[/ja]
   */

  /**
   * @attribute ons-destroy
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "destroy" event is fired.[/en]
   *  [ja]"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-preopen
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "preopen" event is fired.[/en]
   *  [ja]"preopen"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-preclose
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "preclose" event is fired.[/en]
   *  [ja]"preclose"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-postopen
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "postopen" event is fired.[/en]
   *  [ja]"postopen"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-postclose
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "postclose" event is fired.[/en]
   *  [ja]"postclose"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-modechange
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "modechange" event is fired.[/en]
   *  [ja]"modechange"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */
  (function () {

    var lastReady = window.ons.elements.SplitterSide.rewritables.ready;
    window.ons.elements.SplitterSide.rewritables.ready = ons._waitDiretiveInit('ons-splitter-side', lastReady);

    angular.module('onsen').directive('onsSplitterSide', ['$compile', 'SplitterSide', '$onsen', function ($compile, SplitterSide, $onsen) {
      return {
        restrict: 'E',

        compile: function compile(element, attrs) {

          return function (scope, element, attrs) {

            var view = new SplitterSide(scope, element, attrs);

            $onsen.declareVarAttribute(attrs, view);
            $onsen.registerEventHandlers(view, 'destroy preopen preclose postopen postclose modechange');

            element.data('ons-splitter-side', view);

            element[0].pageLoader = $onsen.createPageLoader(view);

            scope.$on('$destroy', function () {
              view._events = undefined;
              element.data('ons-splitter-side', undefined);
            });

            $onsen.fireComponentEvent(element[0], 'init');
          };
        }
      };
    }]);
  })();

  /**
   * @element ons-splitter
   */

  /**
   * @attribute var
   * @initonly
   * @type {String}
   * @description
   *   [en]Variable name to refer this splitter.[/en]
   *   [ja]このスプリッターコンポーネントを参照するための名前を指定します。[/ja]
   */

  /**
   * @attribute ons-destroy
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "destroy" event is fired.[/en]
   *  [ja]"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @method on
   * @signature on(eventName, listener)
   * @description
   *   [en]Add an event listener.[/en]
   *   [ja]イベントリスナーを追加します。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]このイベントが発火された際に呼び出される関数オブジェクトを指定します。[/ja]
   */

  /**
   * @method once
   * @signature once(eventName, listener)
   * @description
   *  [en]Add an event listener that's only triggered once.[/en]
   *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
   */

  /**
   * @method off
   * @signature off(eventName, [listener])
   * @description
   *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
   *  [ja]イベントリスナーを削除します。もしイベントリスナーを指定しなかった場合には、そのイベントに紐づく全てのイベントリスナーが削除されます。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]削除するイベントリスナーを指定します。[/ja]
   */

  (function () {

    angular.module('onsen').directive('onsSplitter', ['$compile', 'Splitter', '$onsen', function ($compile, Splitter, $onsen) {
      return {
        restrict: 'E',
        scope: true,

        compile: function compile(element, attrs) {

          return function (scope, element, attrs) {

            var splitter = new Splitter(scope, element, attrs);

            $onsen.declareVarAttribute(attrs, splitter);
            $onsen.registerEventHandlers(splitter, 'destroy');

            element.data('ons-splitter', splitter);

            scope.$on('$destroy', function () {
              splitter._events = undefined;
              element.data('ons-splitter', undefined);
            });

            $onsen.fireComponentEvent(element[0], 'init');
          };
        }
      };
    }]);
  })();

  /**
   * @element ons-switch
   */

  /**
   * @attribute var
   * @initonly
   * @type {String}
   * @description
   *   [en]Variable name to refer this switch.[/en]
   *   [ja]JavaScriptから参照するための変数名を指定します。[/ja]
   */

  /**
   * @method on
   * @signature on(eventName, listener)
   * @description
   *   [en]Add an event listener.[/en]
   *   [ja]イベントリスナーを追加します。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]このイベントが発火された際に呼び出される関数オブジェクトを指定します。[/ja]
   */

  /**
   * @method once
   * @signature once(eventName, listener)
   * @description
   *  [en]Add an event listener that's only triggered once.[/en]
   *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
   */

  /**
   * @method off
   * @signature off(eventName, [listener])
   * @description
   *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
   *  [ja]イベントリスナーを削除します。もしイベントリスナーを指定しなかった場合には、そのイベントに紐づく全てのイベントリスナーが削除されます。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]削除するイベントリスナーを指定します。[/ja]
   */

  (function () {

    angular.module('onsen').directive('onsSwitch', ['$onsen', 'SwitchView', function ($onsen, SwitchView) {
      return {
        restrict: 'E',
        replace: false,
        scope: true,

        link: function link(scope, element, attrs) {

          if (attrs.ngController) {
            throw new Error('This element can\'t accept ng-controller directive.');
          }

          var switchView = new SwitchView(element, scope, attrs);
          $onsen.addModifierMethodsForCustomElements(switchView, element);

          $onsen.declareVarAttribute(attrs, switchView);
          element.data('ons-switch', switchView);

          $onsen.cleaner.onDestroy(scope, function () {
            switchView._events = undefined;
            $onsen.removeModifierMethods(switchView);
            element.data('ons-switch', undefined);
            $onsen.clearComponent({
              element: element,
              scope: scope,
              attrs: attrs
            });
            element = attrs = scope = null;
          });

          $onsen.fireComponentEvent(element[0], 'init');
        }
      };
    }]);
  })();

  /**
   * @element ons-tabbar
   */

  /**
   * @attribute var
   * @initonly
   * @type {String}
   * @description
   *   [en]Variable name to refer this tab bar.[/en]
   *   [ja]このタブバーを参照するための名前を指定します。[/ja]
   */

  /**
   * @attribute ons-reactive
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "reactive" event is fired.[/en]
   *  [ja]"reactive"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-prechange
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "prechange" event is fired.[/en]
   *  [ja]"prechange"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-postchange
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "postchange" event is fired.[/en]
   *  [ja]"postchange"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-init
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when a page's "init" event is fired.[/en]
   *  [ja]ページの"init"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-show
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when a page's "show" event is fired.[/en]
   *  [ja]ページの"show"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-hide
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when a page's "hide" event is fired.[/en]
   *  [ja]ページの"hide"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-destroy
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when a page's "destroy" event is fired.[/en]
   *  [ja]ページの"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @method on
   * @signature on(eventName, listener)
   * @description
   *   [en]Add an event listener.[/en]
   *   [ja]イベントリスナーを追加します。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]このイベントが発火された際に呼び出される関数オブジェクトを指定します。[/ja]
   */

  /**
   * @method once
   * @signature once(eventName, listener)
   * @description
   *  [en]Add an event listener that's only triggered once.[/en]
   *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
   */

  /**
   * @method off
   * @signature off(eventName, [listener])
   * @description
   *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
   *  [ja]イベントリスナーを削除します。もしイベントリスナーを指定しなかった場合には、そのイベントに紐づく全てのイベントリスナーが削除されます。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]削除するイベントリスナーを指定します。[/ja]
   */

  (function () {

    var lastReady = window.ons.elements.Tabbar.rewritables.ready;
    window.ons.elements.Tabbar.rewritables.ready = ons._waitDiretiveInit('ons-tabbar', lastReady);

    angular.module('onsen').directive('onsTabbar', ['$onsen', '$compile', '$parse', 'TabbarView', function ($onsen, $compile, $parse, TabbarView) {

      return {
        restrict: 'E',

        replace: false,
        scope: true,

        link: function link(scope, element, attrs, controller) {
          var tabbarView = new TabbarView(scope, element, attrs);
          $onsen.addModifierMethodsForCustomElements(tabbarView, element);

          $onsen.registerEventHandlers(tabbarView, 'reactive prechange postchange init show hide destroy');

          element.data('ons-tabbar', tabbarView);
          $onsen.declareVarAttribute(attrs, tabbarView);

          scope.$on('$destroy', function () {
            tabbarView._events = undefined;
            $onsen.removeModifierMethods(tabbarView);
            element.data('ons-tabbar', undefined);
          });

          $onsen.fireComponentEvent(element[0], 'init');
        }
      };
    }]);
  })();

  (function () {

    tab.$inject = ['$onsen', 'GenericView'];
    angular.module('onsen').directive('onsTab', tab).directive('onsTabbarItem', tab); // for BC

    function tab($onsen, GenericView) {
      return {
        restrict: 'E',
        link: function link(scope, element, attrs) {
          var view = GenericView.register(scope, element, attrs, { viewKey: 'ons-tab' });
          element[0].pageLoader = $onsen.createPageLoader(view);

          $onsen.fireComponentEvent(element[0], 'init');
        }
      };
    }
  })();

  (function () {

    angular.module('onsen').directive('onsTemplate', ['$templateCache', function ($templateCache) {
      return {
        restrict: 'E',
        terminal: true,
        compile: function compile(element) {
          var content = element[0].template || element.html();
          $templateCache.put(element.attr('id'), content);
        }
      };
    }]);
  })();

  /**
   * @element ons-toast
   */

  /**
   * @attribute var
   * @initonly
   * @type {String}
   * @description
   *  [en]Variable name to refer this toast dialog.[/en]
   *  [ja]このトーストを参照するための名前を指定します。[/ja]
   */

  /**
   * @attribute ons-preshow
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "preshow" event is fired.[/en]
   *  [ja]"preshow"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-prehide
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "prehide" event is fired.[/en]
   *  [ja]"prehide"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-postshow
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "postshow" event is fired.[/en]
   *  [ja]"postshow"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-posthide
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "posthide" event is fired.[/en]
   *  [ja]"posthide"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @attribute ons-destroy
   * @initonly
   * @type {Expression}
   * @description
   *  [en]Allows you to specify custom behavior when the "destroy" event is fired.[/en]
   *  [ja]"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
   */

  /**
   * @method on
   * @signature on(eventName, listener)
   * @description
   *   [en]Add an event listener.[/en]
   *   [ja]イベントリスナーを追加します。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]イベントが発火された際に呼び出されるコールバックを指定します。[/ja]
   */

  /**
   * @method once
   * @signature once(eventName, listener)
   * @description
   *  [en]Add an event listener that's only triggered once.[/en]
   *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]イベントが発火した際に呼び出されるコールバックを指定します。[/ja]
   */

  /**
   * @method off
   * @signature off(eventName, [listener])
   * @description
   *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
   *  [ja]イベントリスナーを削除します。もしlistenerパラメータが指定されなかった場合、そのイベントのリスナーが全て削除されます。[/ja]
   * @param {String} eventName
   *   [en]Name of the event.[/en]
   *   [ja]イベント名を指定します。[/ja]
   * @param {Function} listener
   *   [en]Function to execute when the event is triggered.[/en]
   *   [ja]削除するイベントリスナーの関数オブジェクトを渡します。[/ja]
   */

  (function () {

    /**
     * Toast directive.
     */

    angular.module('onsen').directive('onsToast', ['$onsen', 'ToastView', function ($onsen, ToastView) {
      return {
        restrict: 'E',
        replace: false,
        scope: true,
        transclude: false,

        compile: function compile(element, attrs) {

          return {
            pre: function pre(scope, element, attrs) {
              var toast = new ToastView(scope, element, attrs);

              $onsen.declareVarAttribute(attrs, toast);
              $onsen.registerEventHandlers(toast, 'preshow prehide postshow posthide destroy');
              $onsen.addModifierMethodsForCustomElements(toast, element);

              element.data('ons-toast', toast);
              element.data('_scope', scope);

              scope.$on('$destroy', function () {
                toast._events = undefined;
                $onsen.removeModifierMethods(toast);
                element.data('ons-toast', undefined);
                element = null;
              });
            },
            post: function post(scope, element) {
              $onsen.fireComponentEvent(element[0], 'init');
            }
          };
        }
      };
    }]);
  })();

  /**
   * @element ons-toolbar-button
   */

  /**
   * @attribute var
   * @initonly
   * @type {String}
   * @description
   *   [en]Variable name to refer this button.[/en]
   *   [ja]このボタンを参照するための名前を指定します。[/ja]
   */
  (function () {

    var module = angular.module('onsen');

    module.directive('onsToolbarButton', ['$onsen', 'GenericView', function ($onsen, GenericView) {
      return {
        restrict: 'E',
        scope: false,
        link: {
          pre: function pre(scope, element, attrs) {
            var toolbarButton = new GenericView(scope, element, attrs);
            element.data('ons-toolbar-button', toolbarButton);
            $onsen.declareVarAttribute(attrs, toolbarButton);

            $onsen.addModifierMethodsForCustomElements(toolbarButton, element);

            $onsen.cleaner.onDestroy(scope, function () {
              toolbarButton._events = undefined;
              $onsen.removeModifierMethods(toolbarButton);
              element.data('ons-toolbar-button', undefined);
              element = null;

              $onsen.clearComponent({
                scope: scope,
                attrs: attrs,
                element: element
              });
              scope = element = attrs = null;
            });
          },
          post: function post(scope, element, attrs) {
            $onsen.fireComponentEvent(element[0], 'init');
          }
        }
      };
    }]);
  })();

  /**
   * @element ons-toolbar
   */

  /**
   * @attribute var
   * @initonly
   * @type {String}
   * @description
   *  [en]Variable name to refer this toolbar.[/en]
   *  [ja]このツールバーを参照するための名前を指定します。[/ja]
   */
  (function () {

    angular.module('onsen').directive('onsToolbar', ['$onsen', 'GenericView', function ($onsen, GenericView) {
      return {
        restrict: 'E',

        // NOTE: This element must coexists with ng-controller.
        // Do not use isolated scope and template's ng-transclude.
        scope: false,
        transclude: false,

        compile: function compile(element) {
          return {
            pre: function pre(scope, element, attrs) {
              // TODO: Remove this dirty fix!
              if (element[0].nodeName === 'ons-toolbar') {
                GenericView.register(scope, element, attrs, { viewKey: 'ons-toolbar' });
              }
            },
            post: function post(scope, element, attrs) {
              $onsen.fireComponentEvent(element[0], 'init');
            }
          };
        }
      };
    }]);
  })();

  /*
  Copyright 2013-2015 ASIAL CORPORATION

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */

  (function () {

    var module = angular.module('onsen');

    /**
     * Internal service class for framework implementation.
     */
    module.factory('$onsen', ['$rootScope', '$window', '$cacheFactory', '$document', '$templateCache', '$http', '$q', '$compile', '$onsGlobal', 'ComponentCleaner', function ($rootScope, $window, $cacheFactory, $document, $templateCache, $http, $q, $compile, $onsGlobal, ComponentCleaner) {

      var $onsen = createOnsenService();
      var ModifierUtil = $onsGlobal._internal.ModifierUtil;

      return $onsen;

      function createOnsenService() {
        return {

          DIRECTIVE_TEMPLATE_URL: 'templates',

          cleaner: ComponentCleaner,

          util: $onsGlobal._util,

          DeviceBackButtonHandler: $onsGlobal._internal.dbbDispatcher,

          _defaultDeviceBackButtonHandler: $onsGlobal._defaultDeviceBackButtonHandler,

          /**
           * @return {Object}
           */
          getDefaultDeviceBackButtonHandler: function getDefaultDeviceBackButtonHandler() {
            return this._defaultDeviceBackButtonHandler;
          },

          /**
           * @param {Object} view
           * @param {Element} element
           * @param {Array} methodNames
           * @return {Function} A function that dispose all driving methods.
           */
          deriveMethods: function deriveMethods(view, element, methodNames) {
            methodNames.forEach(function (methodName) {
              view[methodName] = function () {
                return element[methodName].apply(element, arguments);
              };
            });

            return function () {
              methodNames.forEach(function (methodName) {
                view[methodName] = null;
              });
              view = element = null;
            };
          },

          /**
           * @param {Class} klass
           * @param {Array} properties
           */
          derivePropertiesFromElement: function derivePropertiesFromElement(klass, properties) {
            properties.forEach(function (property) {
              Object.defineProperty(klass.prototype, property, {
                get: function get() {
                  return this._element[0][property];
                },
                set: function set(value) {
                  return this._element[0][property] = value; // eslint-disable-line no-return-assign
                }
              });
            });
          },

          /**
           * @param {Object} view
           * @param {Element} element
           * @param {Array} eventNames
           * @param {Function} [map]
           * @return {Function} A function that clear all event listeners
           */
          deriveEvents: function deriveEvents(view, element, eventNames, map) {
            map = map || function (detail) {
              return detail;
            };
            eventNames = [].concat(eventNames);
            var listeners = [];

            eventNames.forEach(function (eventName) {
              var listener = function listener(event) {
                map(event.detail || {});
                view.emit(eventName, event);
              };
              listeners.push(listener);
              element.addEventListener(eventName, listener, false);
            });

            return function () {
              eventNames.forEach(function (eventName, index) {
                element.removeEventListener(eventName, listeners[index], false);
              });
              view = element = listeners = map = null;
            };
          },

          /**
           * @return {Boolean}
           */
          isEnabledAutoStatusBarFill: function isEnabledAutoStatusBarFill() {
            return !!$onsGlobal._config.autoStatusBarFill;
          },

          /**
           * @return {Boolean}
           */
          shouldFillStatusBar: $onsGlobal.shouldFillStatusBar,

          /**
           * @param {Function} action
           */
          autoStatusBarFill: $onsGlobal.autoStatusBarFill,

          /**
           * @param {Object} directive
           * @param {HTMLElement} pageElement
           * @param {Function} callback
           */
          compileAndLink: function compileAndLink(view, pageElement, callback) {
            var link = $compile(pageElement);
            var pageScope = view._scope.$new();

            /**
             * Overwrite page scope.
             */
            angular.element(pageElement).data('_scope', pageScope);

            pageScope.$evalAsync(function () {
              callback(pageElement); // Attach and prepare
              link(pageScope); // Run the controller
            });
          },

          /**
           * @param {Object} view
           * @return {Object} pageLoader
           */
          createPageLoader: function createPageLoader(view) {
            var _this = this;

            return new $onsGlobal.PageLoader(function (_ref, done) {
              var page = _ref.page,
                  parent = _ref.parent;

              $onsGlobal._internal.getPageHTMLAsync(page).then(function (html) {
                _this.compileAndLink(view, $onsGlobal._util.createElement(html), function (element) {
                  return done(parent.appendChild(element));
                });
              });
            }, function (element) {
              element._destroy();
              if (angular.element(element).data('_scope')) {
                angular.element(element).data('_scope').$destroy();
              }
            });
          },

          /**
           * @param {Object} params
           * @param {Scope} [params.scope]
           * @param {jqLite} [params.element]
           * @param {Array} [params.elements]
           * @param {Attributes} [params.attrs]
           */
          clearComponent: function clearComponent(params) {
            if (params.scope) {
              ComponentCleaner.destroyScope(params.scope);
            }

            if (params.attrs) {
              ComponentCleaner.destroyAttributes(params.attrs);
            }

            if (params.element) {
              ComponentCleaner.destroyElement(params.element);
            }

            if (params.elements) {
              params.elements.forEach(function (element) {
                ComponentCleaner.destroyElement(element);
              });
            }
          },

          /**
           * @param {jqLite} element
           * @param {String} name
           */
          findElementeObject: function findElementeObject(element, name) {
            return element.inheritedData(name);
          },

          /**
           * @param {String} page
           * @return {Promise}
           */
          getPageHTMLAsync: function getPageHTMLAsync(page) {
            var cache = $templateCache.get(page);

            if (cache) {
              var deferred = $q.defer();

              var html = typeof cache === 'string' ? cache : cache[1];
              deferred.resolve(this.normalizePageHTML(html));

              return deferred.promise;
            } else {
              return $http({
                url: page,
                method: 'GET'
              }).then(function (response) {
                var html = response.data;

                return this.normalizePageHTML(html);
              }.bind(this));
            }
          },

          /**
           * @param {String} html
           * @return {String}
           */
          normalizePageHTML: function normalizePageHTML(html) {
            html = ('' + html).trim();

            if (!html.match(/^<ons-page/)) {
              html = '<ons-page _muted>' + html + '</ons-page>';
            }

            return html;
          },

          /**
           * Create modifier templater function. The modifier templater generate css classes bound modifier name.
           *
           * @param {Object} attrs
           * @param {Array} [modifiers] an array of appendix modifier
           * @return {Function}
           */
          generateModifierTemplater: function generateModifierTemplater(attrs, modifiers) {
            var attrModifiers = attrs && typeof attrs.modifier === 'string' ? attrs.modifier.trim().split(/ +/) : [];
            modifiers = angular.isArray(modifiers) ? attrModifiers.concat(modifiers) : attrModifiers;

            /**
             * @return {String} template eg. 'ons-button--*', 'ons-button--*__item'
             * @return {String}
             */
            return function (template) {
              return modifiers.map(function (modifier) {
                return template.replace('*', modifier);
              }).join(' ');
            };
          },

          /**
           * Add modifier methods to view object for custom elements.
           *
           * @param {Object} view object
           * @param {jqLite} element
           */
          addModifierMethodsForCustomElements: function addModifierMethodsForCustomElements(view, element) {
            var methods = {
              hasModifier: function hasModifier(needle) {
                var tokens = ModifierUtil.split(element.attr('modifier'));
                needle = typeof needle === 'string' ? needle.trim() : '';

                return ModifierUtil.split(needle).some(function (needle) {
                  return tokens.indexOf(needle) != -1;
                });
              },

              removeModifier: function removeModifier(needle) {
                needle = typeof needle === 'string' ? needle.trim() : '';

                var modifier = ModifierUtil.split(element.attr('modifier')).filter(function (token) {
                  return token !== needle;
                }).join(' ');

                element.attr('modifier', modifier);
              },

              addModifier: function addModifier(modifier) {
                element.attr('modifier', element.attr('modifier') + ' ' + modifier);
              },

              setModifier: function setModifier(modifier) {
                element.attr('modifier', modifier);
              },

              toggleModifier: function toggleModifier(modifier) {
                if (this.hasModifier(modifier)) {
                  this.removeModifier(modifier);
                } else {
                  this.addModifier(modifier);
                }
              }
            };

            for (var method in methods) {
              if (methods.hasOwnProperty(method)) {
                view[method] = methods[method];
              }
            }
          },

          /**
           * Add modifier methods to view object.
           *
           * @param {Object} view object
           * @param {String} template
           * @param {jqLite} element
           */
          addModifierMethods: function addModifierMethods(view, template, element) {
            var _tr = function _tr(modifier) {
              return template.replace('*', modifier);
            };

            var fns = {
              hasModifier: function hasModifier(modifier) {
                return element.hasClass(_tr(modifier));
              },

              removeModifier: function removeModifier(modifier) {
                element.removeClass(_tr(modifier));
              },

              addModifier: function addModifier(modifier) {
                element.addClass(_tr(modifier));
              },

              setModifier: function setModifier(modifier) {
                var classes = element.attr('class').split(/\s+/),
                    patt = template.replace('*', '.');

                for (var i = 0; i < classes.length; i++) {
                  var cls = classes[i];

                  if (cls.match(patt)) {
                    element.removeClass(cls);
                  }
                }

                element.addClass(_tr(modifier));
              },

              toggleModifier: function toggleModifier(modifier) {
                var cls = _tr(modifier);
                if (element.hasClass(cls)) {
                  element.removeClass(cls);
                } else {
                  element.addClass(cls);
                }
              }
            };

            var append = function append(oldFn, newFn) {
              if (typeof oldFn !== 'undefined') {
                return function () {
                  return oldFn.apply(null, arguments) || newFn.apply(null, arguments);
                };
              } else {
                return newFn;
              }
            };

            view.hasModifier = append(view.hasModifier, fns.hasModifier);
            view.removeModifier = append(view.removeModifier, fns.removeModifier);
            view.addModifier = append(view.addModifier, fns.addModifier);
            view.setModifier = append(view.setModifier, fns.setModifier);
            view.toggleModifier = append(view.toggleModifier, fns.toggleModifier);
          },

          /**
           * Remove modifier methods.
           *
           * @param {Object} view object
           */
          removeModifierMethods: function removeModifierMethods(view) {
            view.hasModifier = view.removeModifier = view.addModifier = view.setModifier = view.toggleModifier = undefined;
          },

          /**
           * Define a variable to JavaScript global scope and AngularJS scope as 'var' attribute name.
           *
           * @param {Object} attrs
           * @param object
           */
          declareVarAttribute: function declareVarAttribute(attrs, object) {
            if (typeof attrs.var === 'string') {
              var varName = attrs.var;
              this._defineVar(varName, object);
            }
          },

          _registerEventHandler: function _registerEventHandler(component, eventName) {
            var capitalizedEventName = eventName.charAt(0).toUpperCase() + eventName.slice(1);

            component.on(eventName, function (event) {
              $onsen.fireComponentEvent(component._element[0], eventName, event && event.detail);

              var handler = component._attrs['ons' + capitalizedEventName];
              if (handler) {
                component._scope.$eval(handler, { $event: event });
                component._scope.$evalAsync();
              }
            });
          },

          /**
           * Register event handlers for attributes.
           *
           * @param {Object} component
           * @param {String} eventNames
           */
          registerEventHandlers: function registerEventHandlers(component, eventNames) {
            eventNames = eventNames.trim().split(/\s+/);

            for (var i = 0, l = eventNames.length; i < l; i++) {
              var eventName = eventNames[i];
              this._registerEventHandler(component, eventName);
            }
          },

          /**
           * @return {Boolean}
           */
          isAndroid: function isAndroid() {
            return !!$window.navigator.userAgent.match(/android/i);
          },

          /**
           * @return {Boolean}
           */
          isIOS: function isIOS() {
            return !!$window.navigator.userAgent.match(/(ipad|iphone|ipod touch)/i);
          },

          /**
           * @return {Boolean}
           */
          isWebView: function isWebView() {
            return $onsGlobal.isWebView();
          },

          /**
           * @return {Boolean}
           */
          isIOS7above: function () {
            var ua = $window.navigator.userAgent;
            var match = ua.match(/(iPad|iPhone|iPod touch);.*CPU.*OS (\d+)_(\d+)/i);

            var result = match ? parseFloat(match[2] + '.' + match[3]) >= 7 : false;

            return function () {
              return result;
            };
          }(),

          /**
           * Fire a named event for a component. The view object, if it exists, is attached to event.component.
           *
           * @param {HTMLElement} [dom]
           * @param {String} event name
           */
          fireComponentEvent: function fireComponentEvent(dom, eventName, data) {
            data = data || {};

            var event = document.createEvent('HTMLEvents');

            for (var key in data) {
              if (data.hasOwnProperty(key)) {
                event[key] = data[key];
              }
            }

            event.component = dom ? angular.element(dom).data(dom.nodeName.toLowerCase()) || null : null;
            event.initEvent(dom.nodeName.toLowerCase() + ':' + eventName, true, true);

            dom.dispatchEvent(event);
          },

          /**
           * Define a variable to JavaScript global scope and AngularJS scope.
           *
           * Util.defineVar('foo', 'foo-value');
           * // => window.foo and $scope.foo is now 'foo-value'
           *
           * Util.defineVar('foo.bar', 'foo-bar-value');
           * // => window.foo.bar and $scope.foo.bar is now 'foo-bar-value'
           *
           * @param {String} name
           * @param object
           */
          _defineVar: function _defineVar(name, object) {
            var names = name.split(/\./);

            function set(container, names, object) {
              var name;
              for (var i = 0; i < names.length - 1; i++) {
                name = names[i];
                if (container[name] === undefined || container[name] === null) {
                  container[name] = {};
                }
                container = container[name];
              }

              container[names[names.length - 1]] = object;

              if (container[names[names.length - 1]] !== object) {
                throw new Error('Cannot set var="' + object._attrs.var + '" because it will overwrite a read-only variable.');
              }
            }

            if (ons.componentBase) {
              set(ons.componentBase, names, object);
            }

            var getScope = function getScope(el) {
              return angular.element(el).data('_scope');
            };

            var element = object._element[0];

            // Current element might not have data('_scope')
            if (element.hasAttribute('ons-scope')) {
              set(getScope(element) || object._scope, names, object);
              element = null;
              return;
            }

            // Ancestors
            while (element.parentElement) {
              element = element.parentElement;
              if (element.hasAttribute('ons-scope')) {
                set(getScope(element), names, object);
                element = null;
                return;
              }
            }

            element = null;

            // If no ons-scope element was found, attach to $rootScope.
            set($rootScope, names, object);
          }
        };
      }
    }]);
  })();

  /*
  Copyright 2013-2015 ASIAL CORPORATION

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */

  (function () {

    var module = angular.module('onsen');

    var ComponentCleaner = {
      /**
       * @param {jqLite} element
       */
      decomposeNode: function decomposeNode(element) {
        var children = element.remove().children();
        for (var i = 0; i < children.length; i++) {
          ComponentCleaner.decomposeNode(angular.element(children[i]));
        }
      },

      /**
       * @param {Attributes} attrs
       */
      destroyAttributes: function destroyAttributes(attrs) {
        attrs.$$element = null;
        attrs.$$observers = null;
      },

      /**
       * @param {jqLite} element
       */
      destroyElement: function destroyElement(element) {
        element.remove();
      },

      /**
       * @param {Scope} scope
       */
      destroyScope: function destroyScope(scope) {
        scope.$$listeners = {};
        scope.$$watchers = null;
        scope = null;
      },

      /**
       * @param {Scope} scope
       * @param {Function} fn
       */
      onDestroy: function onDestroy(scope, fn) {
        var clear = scope.$on('$destroy', function () {
          clear();
          fn.apply(null, arguments);
        });
      }
    };

    module.factory('ComponentCleaner', function () {
      return ComponentCleaner;
    });

    // override builtin ng-(eventname) directives
    (function () {
      var ngEventDirectives = {};
      'click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste'.split(' ').forEach(function (name) {
        var directiveName = directiveNormalize('ng-' + name);
        ngEventDirectives[directiveName] = ['$parse', function ($parse) {
          return {
            compile: function compile($element, attr) {
              var fn = $parse(attr[directiveName]);
              return function (scope, element, attr) {
                var listener = function listener(event) {
                  scope.$apply(function () {
                    fn(scope, { $event: event });
                  });
                };
                element.on(name, listener);

                ComponentCleaner.onDestroy(scope, function () {
                  element.off(name, listener);
                  element = null;

                  ComponentCleaner.destroyScope(scope);
                  scope = null;

                  ComponentCleaner.destroyAttributes(attr);
                  attr = null;
                });
              };
            }
          };
        }];

        function directiveNormalize(name) {
          return name.replace(/-([a-z])/g, function (matches) {
            return matches[1].toUpperCase();
          });
        }
      });
      module.config(['$provide', function ($provide) {
        var shift = function shift($delegate) {
          $delegate.shift();
          return $delegate;
        };
        Object.keys(ngEventDirectives).forEach(function (directiveName) {
          $provide.decorator(directiveName + 'Directive', ['$delegate', shift]);
        });
      }]);
      Object.keys(ngEventDirectives).forEach(function (directiveName) {
        module.directive(directiveName, ngEventDirectives[directiveName]);
      });
    })();
  })();

  // confirm to use jqLite
  if (window.jQuery && angular.element === window.jQuery) {
    console.warn('Onsen UI require jqLite. Load jQuery after loading AngularJS to fix this error. jQuery may break Onsen UI behavior.'); // eslint-disable-line no-console
  }

  /*
  Copyright 2013-2015 ASIAL CORPORATION

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */

  Object.keys(ons.notification).filter(function (name) {
    return !/^_/.test(name);
  }).forEach(function (name) {
    var originalNotification = ons.notification[name];

    ons.notification[name] = function (message) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      typeof message === 'string' ? options.message = message : options = message;

      var compile = options.compile;
      var $element = void 0;

      options.compile = function (element) {
        $element = angular.element(compile ? compile(element) : element);
        return ons.$compile($element)($element.injector().get('$rootScope'));
      };

      options.destroy = function () {
        $element.data('_scope').$destroy();
        $element = null;
      };

      return originalNotification(options);
    };
  });

  /*
  Copyright 2013-2015 ASIAL CORPORATION

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */

  (function () {

    angular.module('onsen').run(['$templateCache', function ($templateCache) {
      var templates = window.document.querySelectorAll('script[type="text/ons-template"]');

      for (var i = 0; i < templates.length; i++) {
        var template = angular.element(templates[i]);
        var id = template.attr('id');
        if (typeof id === 'string') {
          $templateCache.put(id, template.text());
        }
      }
    }]);
  })();

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhcmpzLW9uc2VudWkuanMiLCJzb3VyY2VzIjpbIi4uL3ZlbmRvci9jbGFzcy5qcyIsIi4uL2pzL29uc2VuLmpzIiwiLi4vdmlld3MvYWN0aW9uU2hlZXQuanMiLCIuLi92aWV3cy9hbGVydERpYWxvZy5qcyIsIi4uL3ZpZXdzL2Nhcm91c2VsLmpzIiwiLi4vdmlld3MvZGlhbG9nLmpzIiwiLi4vdmlld3MvZmFiLmpzIiwiLi4vdmlld3MvZ2VuZXJpYy5qcyIsIi4uL3ZpZXdzL2xhenlSZXBlYXREZWxlZ2F0ZS5qcyIsIi4uL3ZpZXdzL2xhenlSZXBlYXQuanMiLCIuLi92aWV3cy9tb2RhbC5qcyIsIi4uL3ZpZXdzL25hdmlnYXRvci5qcyIsIi4uL3ZpZXdzL3BhZ2UuanMiLCIuLi92aWV3cy9wb3BvdmVyLmpzIiwiLi4vdmlld3MvcHVsbEhvb2suanMiLCIuLi92aWV3cy9zcGVlZERpYWwuanMiLCIuLi92aWV3cy9zcGxpdHRlckNvbnRlbnQuanMiLCIuLi92aWV3cy9zcGxpdHRlclNpZGUuanMiLCIuLi92aWV3cy9zcGxpdHRlci5qcyIsIi4uL3ZpZXdzL3N3aXRjaC5qcyIsIi4uL3ZpZXdzL3RhYmJhci5qcyIsIi4uL3ZpZXdzL3RvYXN0LmpzIiwiLi4vZGlyZWN0aXZlcy9hY3Rpb25TaGVldEJ1dHRvbi5qcyIsIi4uL2RpcmVjdGl2ZXMvYWN0aW9uU2hlZXQuanMiLCIuLi9kaXJlY3RpdmVzL2FsZXJ0RGlhbG9nLmpzIiwiLi4vZGlyZWN0aXZlcy9iYWNrQnV0dG9uLmpzIiwiLi4vZGlyZWN0aXZlcy9ib3R0b21Ub29sYmFyLmpzIiwiLi4vZGlyZWN0aXZlcy9idXR0b24uanMiLCIuLi9kaXJlY3RpdmVzL2NhcmQuanMiLCIuLi9kaXJlY3RpdmVzL2Nhcm91c2VsLmpzIiwiLi4vZGlyZWN0aXZlcy9jaGVja2JveC5qcyIsIi4uL2RpcmVjdGl2ZXMvZGlhbG9nLmpzIiwiLi4vZGlyZWN0aXZlcy9kdW1teUZvckluaXQuanMiLCIuLi9kaXJlY3RpdmVzL2ZhYi5qcyIsIi4uL2RpcmVjdGl2ZXMvZ2VzdHVyZURldGVjdG9yLmpzIiwiLi4vZGlyZWN0aXZlcy9pY29uLmpzIiwiLi4vZGlyZWN0aXZlcy9pZk9yaWVudGF0aW9uLmpzIiwiLi4vZGlyZWN0aXZlcy9pZlBsYXRmb3JtLmpzIiwiLi4vZGlyZWN0aXZlcy9pbnB1dC5qcyIsIi4uL2RpcmVjdGl2ZXMva2V5Ym9hcmQuanMiLCIuLi9kaXJlY3RpdmVzL2xhenlSZXBlYXQuanMiLCIuLi9kaXJlY3RpdmVzL2xpc3RIZWFkZXIuanMiLCIuLi9kaXJlY3RpdmVzL2xpc3RJdGVtLmpzIiwiLi4vZGlyZWN0aXZlcy9saXN0LmpzIiwiLi4vZGlyZWN0aXZlcy9saXN0VGl0bGUuanMiLCIuLi9kaXJlY3RpdmVzL2xvYWRpbmdQbGFjZWhvbGRlci5qcyIsIi4uL2RpcmVjdGl2ZXMvbW9kYWwuanMiLCIuLi9kaXJlY3RpdmVzL25hdmlnYXRvci5qcyIsIi4uL2RpcmVjdGl2ZXMvcGFnZS5qcyIsIi4uL2RpcmVjdGl2ZXMvcG9wb3Zlci5qcyIsIi4uL2RpcmVjdGl2ZXMvcHVsbEhvb2suanMiLCIuLi9kaXJlY3RpdmVzL3JhZGlvLmpzIiwiLi4vZGlyZWN0aXZlcy9yYW5nZS5qcyIsIi4uL2RpcmVjdGl2ZXMvcmlwcGxlLmpzIiwiLi4vZGlyZWN0aXZlcy9zY29wZS5qcyIsIi4uL2RpcmVjdGl2ZXMvc2VhcmNoSW5wdXQuanMiLCIuLi9kaXJlY3RpdmVzL3NlZ21lbnQuanMiLCIuLi9kaXJlY3RpdmVzL3NlbGVjdC5qcyIsIi4uL2RpcmVjdGl2ZXMvc3BlZWREaWFsLmpzIiwiLi4vZGlyZWN0aXZlcy9zcGxpdHRlckNvbnRlbnQuanMiLCIuLi9kaXJlY3RpdmVzL3NwbGl0dGVyU2lkZS5qcyIsIi4uL2RpcmVjdGl2ZXMvc3BsaXR0ZXIuanMiLCIuLi9kaXJlY3RpdmVzL3N3aXRjaC5qcyIsIi4uL2RpcmVjdGl2ZXMvdGFiYmFyLmpzIiwiLi4vZGlyZWN0aXZlcy90YWIuanMiLCIuLi9kaXJlY3RpdmVzL3RlbXBsYXRlLmpzIiwiLi4vZGlyZWN0aXZlcy90b2FzdC5qcyIsIi4uL2RpcmVjdGl2ZXMvdG9vbGJhckJ1dHRvbi5qcyIsIi4uL2RpcmVjdGl2ZXMvdG9vbGJhci5qcyIsIi4uL3NlcnZpY2VzL29uc2VuLmpzIiwiLi4vc2VydmljZXMvY29tcG9uZW50Q2xlYW5lci5qcyIsIi4uL2pzL3NldHVwLmpzIiwiLi4vanMvbm90aWZpY2F0aW9uLmpzIiwiLi4vanMvdGVtcGxhdGVMb2FkZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogU2ltcGxlIEphdmFTY3JpcHQgSW5oZXJpdGFuY2UgZm9yIEVTIDUuMVxuICogYmFzZWQgb24gaHR0cDovL2Vqb2huLm9yZy9ibG9nL3NpbXBsZS1qYXZhc2NyaXB0LWluaGVyaXRhbmNlL1xuICogIChpbnNwaXJlZCBieSBiYXNlMiBhbmQgUHJvdG90eXBlKVxuICogTUlUIExpY2Vuc2VkLlxuICovXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgZm5UZXN0ID0gL3h5ei8udGVzdChmdW5jdGlvbigpe3h5ejt9KSA/IC9cXGJfc3VwZXJcXGIvIDogLy4qLztcblxuICAvLyBUaGUgYmFzZSBDbGFzcyBpbXBsZW1lbnRhdGlvbiAoZG9lcyBub3RoaW5nKVxuICBmdW5jdGlvbiBCYXNlQ2xhc3MoKXt9XG5cbiAgLy8gQ3JlYXRlIGEgbmV3IENsYXNzIHRoYXQgaW5oZXJpdHMgZnJvbSB0aGlzIGNsYXNzXG4gIEJhc2VDbGFzcy5leHRlbmQgPSBmdW5jdGlvbihwcm9wcykge1xuICAgIHZhciBfc3VwZXIgPSB0aGlzLnByb3RvdHlwZTtcblxuICAgIC8vIFNldCB1cCB0aGUgcHJvdG90eXBlIHRvIGluaGVyaXQgZnJvbSB0aGUgYmFzZSBjbGFzc1xuICAgIC8vIChidXQgd2l0aG91dCBydW5uaW5nIHRoZSBpbml0IGNvbnN0cnVjdG9yKVxuICAgIHZhciBwcm90byA9IE9iamVjdC5jcmVhdGUoX3N1cGVyKTtcblxuICAgIC8vIENvcHkgdGhlIHByb3BlcnRpZXMgb3ZlciBvbnRvIHRoZSBuZXcgcHJvdG90eXBlXG4gICAgZm9yICh2YXIgbmFtZSBpbiBwcm9wcykge1xuICAgICAgLy8gQ2hlY2sgaWYgd2UncmUgb3ZlcndyaXRpbmcgYW4gZXhpc3RpbmcgZnVuY3Rpb25cbiAgICAgIHByb3RvW25hbWVdID0gdHlwZW9mIHByb3BzW25hbWVdID09PSBcImZ1bmN0aW9uXCIgJiZcbiAgICAgICAgdHlwZW9mIF9zdXBlcltuYW1lXSA9PSBcImZ1bmN0aW9uXCIgJiYgZm5UZXN0LnRlc3QocHJvcHNbbmFtZV0pXG4gICAgICAgID8gKGZ1bmN0aW9uKG5hbWUsIGZuKXtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyIHRtcCA9IHRoaXMuX3N1cGVyO1xuXG4gICAgICAgICAgICAgIC8vIEFkZCBhIG5ldyAuX3N1cGVyKCkgbWV0aG9kIHRoYXQgaXMgdGhlIHNhbWUgbWV0aG9kXG4gICAgICAgICAgICAgIC8vIGJ1dCBvbiB0aGUgc3VwZXItY2xhc3NcbiAgICAgICAgICAgICAgdGhpcy5fc3VwZXIgPSBfc3VwZXJbbmFtZV07XG5cbiAgICAgICAgICAgICAgLy8gVGhlIG1ldGhvZCBvbmx5IG5lZWQgdG8gYmUgYm91bmQgdGVtcG9yYXJpbHksIHNvIHdlXG4gICAgICAgICAgICAgIC8vIHJlbW92ZSBpdCB3aGVuIHdlJ3JlIGRvbmUgZXhlY3V0aW5nXG4gICAgICAgICAgICAgIHZhciByZXQgPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICB0aGlzLl9zdXBlciA9IHRtcDtcblxuICAgICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KShuYW1lLCBwcm9wc1tuYW1lXSlcbiAgICAgICAgOiBwcm9wc1tuYW1lXTtcbiAgICB9XG5cbiAgICAvLyBUaGUgbmV3IGNvbnN0cnVjdG9yXG4gICAgdmFyIG5ld0NsYXNzID0gdHlwZW9mIHByb3RvLmluaXQgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgPyBwcm90by5oYXNPd25Qcm9wZXJ0eShcImluaXRcIilcbiAgICAgICAgPyBwcm90by5pbml0IC8vIEFsbCBjb25zdHJ1Y3Rpb24gaXMgYWN0dWFsbHkgZG9uZSBpbiB0aGUgaW5pdCBtZXRob2RcbiAgICAgICAgOiBmdW5jdGlvbiBTdWJDbGFzcygpeyBfc3VwZXIuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9XG4gICAgICA6IGZ1bmN0aW9uIEVtcHR5Q2xhc3MoKXt9O1xuXG4gICAgLy8gUG9wdWxhdGUgb3VyIGNvbnN0cnVjdGVkIHByb3RvdHlwZSBvYmplY3RcbiAgICBuZXdDbGFzcy5wcm90b3R5cGUgPSBwcm90bztcblxuICAgIC8vIEVuZm9yY2UgdGhlIGNvbnN0cnVjdG9yIHRvIGJlIHdoYXQgd2UgZXhwZWN0XG4gICAgcHJvdG8uY29uc3RydWN0b3IgPSBuZXdDbGFzcztcblxuICAgIC8vIEFuZCBtYWtlIHRoaXMgY2xhc3MgZXh0ZW5kYWJsZVxuICAgIG5ld0NsYXNzLmV4dGVuZCA9IEJhc2VDbGFzcy5leHRlbmQ7XG5cbiAgICByZXR1cm4gbmV3Q2xhc3M7XG4gIH07XG5cbiAgLy8gZXhwb3J0XG4gIHdpbmRvdy5DbGFzcyA9IEJhc2VDbGFzcztcbn0pKCk7XG4iLCIvKlxuQ29weXJpZ2h0IDIwMTMtMjAxNSBBU0lBTCBDT1JQT1JBVElPTlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4qL1xuXG4vKipcbiAqIEBvYmplY3Qgb25zXG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2phXU9uc2VuIFVJ44Gn5Yip55So44Gn44GN44KL44Kw44Ot44O844OQ44Or44Gq44Kq44OW44K444Kn44Kv44OI44Gn44GZ44CC44GT44Gu44Kq44OW44K444Kn44Kv44OI44Gv44CBQW5ndWxhckpT44Gu44K544Kz44O844OX44GL44KJ5Y+C54Wn44GZ44KL44GT44Go44GM44Gn44GN44G+44GZ44CCIFsvamFdXG4gKiAgIFtlbl1BIGdsb2JhbCBvYmplY3QgdGhhdCdzIHVzZWQgaW4gT25zZW4gVUkuIFRoaXMgb2JqZWN0IGNhbiBiZSByZWFjaGVkIGZyb20gdGhlIEFuZ3VsYXJKUyBzY29wZS5bL2VuXVxuICovXG5cbihmdW5jdGlvbihvbnMpe1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdvbnNlbicsIFtdKTtcbiAgYW5ndWxhci5tb2R1bGUoJ29uc2VuLmRpcmVjdGl2ZXMnLCBbJ29uc2VuJ10pOyAvLyBmb3IgQkNcblxuICAvLyBKUyBHbG9iYWwgZmFjYWRlIGZvciBPbnNlbiBVSS5cbiAgaW5pdE9uc2VuRmFjYWRlKCk7XG4gIHdhaXRPbnNlblVJTG9hZCgpO1xuICBpbml0QW5ndWxhck1vZHVsZSgpO1xuICBpbml0VGVtcGxhdGVDYWNoZSgpO1xuXG4gIGZ1bmN0aW9uIHdhaXRPbnNlblVJTG9hZCgpIHtcbiAgICB2YXIgdW5sb2NrT25zZW5VSSA9IG9ucy5fcmVhZHlMb2NrLmxvY2soKTtcbiAgICBtb2R1bGUucnVuKGZ1bmN0aW9uKCRjb21waWxlLCAkcm9vdFNjb3BlKSB7XG4gICAgICAvLyBmb3IgaW5pdGlhbGl6YXRpb24gaG9vay5cbiAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnbG9hZGluZycgfHwgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PSAndW5pbml0aWFsaXplZCcpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29ucy1kdW1teS1mb3ItaW5pdCcpKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKGRvY3VtZW50LmJvZHkpIHtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvbnMtZHVtbXktZm9yLWluaXQnKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaW5pdGlhbGl6YXRpb24gc3RhdGUuJyk7XG4gICAgICB9XG5cbiAgICAgICRyb290U2NvcGUuJG9uKCckb25zLXJlYWR5JywgdW5sb2NrT25zZW5VSSk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0QW5ndWxhck1vZHVsZSgpIHtcbiAgICBtb2R1bGUudmFsdWUoJyRvbnNHbG9iYWwnLCBvbnMpO1xuICAgIG1vZHVsZS5ydW4oZnVuY3Rpb24oJGNvbXBpbGUsICRyb290U2NvcGUsICRvbnNlbiwgJHEpIHtcbiAgICAgIG9ucy5fb25zZW5TZXJ2aWNlID0gJG9uc2VuO1xuICAgICAgb25zLl9xU2VydmljZSA9ICRxO1xuXG4gICAgICAkcm9vdFNjb3BlLm9ucyA9IHdpbmRvdy5vbnM7XG4gICAgICAkcm9vdFNjb3BlLmNvbnNvbGUgPSB3aW5kb3cuY29uc29sZTtcbiAgICAgICRyb290U2NvcGUuYWxlcnQgPSB3aW5kb3cuYWxlcnQ7XG5cbiAgICAgIG9ucy4kY29tcGlsZSA9ICRjb21waWxlO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdFRlbXBsYXRlQ2FjaGUoKSB7XG4gICAgbW9kdWxlLnJ1bihmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAgICAgY29uc3QgdG1wID0gb25zLl9pbnRlcm5hbC5nZXRUZW1wbGF0ZUhUTUxBc3luYztcblxuICAgICAgb25zLl9pbnRlcm5hbC5nZXRUZW1wbGF0ZUhUTUxBc3luYyA9IChwYWdlKSA9PiB7XG4gICAgICAgIGNvbnN0IGNhY2hlID0gJHRlbXBsYXRlQ2FjaGUuZ2V0KHBhZ2UpO1xuXG4gICAgICAgIGlmIChjYWNoZSkge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoY2FjaGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0bXAocGFnZSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0T25zZW5GYWNhZGUoKSB7XG4gICAgb25zLl9vbnNlblNlcnZpY2UgPSBudWxsO1xuXG4gICAgLy8gT2JqZWN0IHRvIGF0dGFjaCBjb21wb25lbnQgdmFyaWFibGVzIHRvIHdoZW4gdXNpbmcgdGhlIHZhcj1cIi4uLlwiIGF0dHJpYnV0ZS5cbiAgICAvLyBDYW4gYmUgc2V0IHRvIG51bGwgdG8gYXZvaWQgcG9sbHV0aW5nIHRoZSBnbG9iYWwgc2NvcGUuXG4gICAgb25zLmNvbXBvbmVudEJhc2UgPSB3aW5kb3c7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGJvb3RzdHJhcFxuICAgICAqIEBzaWduYXR1cmUgYm9vdHN0cmFwKFttb2R1bGVOYW1lLCBbZGVwZW5kZW5jaWVzXV0pXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogICBbamFdT25zZW4gVUnjga7liJ3mnJ/ljJbjgpLooYzjgYTjgb7jgZnjgIJBbmd1bGFyLmpz44GubmctYXBw5bGe5oCn44KS5Yip55So44GZ44KL44GT44Go54Sh44GX44GrT25zZW4gVUnjgpLoqq3jgb/ovrzjgpPjgafliJ3mnJ/ljJbjgZfjgabjgY/jgozjgb7jgZnjgIJbL2phXVxuICAgICAqICAgW2VuXUluaXRpYWxpemUgT25zZW4gVUkuIENhbiBiZSB1c2VkIHRvIGxvYWQgT25zZW4gVUkgd2l0aG91dCB1c2luZyB0aGUgPGNvZGU+bmctYXBwPC9jb2RlPiBhdHRyaWJ1dGUgZnJvbSBBbmd1bGFySlMuWy9lbl1cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW21vZHVsZU5hbWVdXG4gICAgICogICBbZW5dQW5ndWxhckpTIG1vZHVsZSBuYW1lLlsvZW5dXG4gICAgICogICBbamFdQW5ndWxhci5qc+OBp+OBruODouOCuOODpeODvOODq+WQjVsvamFdXG4gICAgICogQHBhcmFtIHtBcnJheX0gW2RlcGVuZGVuY2llc11cbiAgICAgKiAgIFtlbl1MaXN0IG9mIEFuZ3VsYXJKUyBtb2R1bGUgZGVwZW5kZW5jaWVzLlsvZW5dXG4gICAgICogICBbamFd5L6d5a2Y44GZ44KLQW5ndWxhci5qc+OBruODouOCuOODpeODvOODq+WQjeOBrumFjeWIl1svamFdXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqICAgW2VuXUFuIEFuZ3VsYXJKUyBtb2R1bGUgb2JqZWN0LlsvZW5dXG4gICAgICogICBbamFdQW5ndWxhckpT44GuTW9kdWxl44Kq44OW44K444Kn44Kv44OI44KS6KGo44GX44G+44GZ44CCWy9qYV1cbiAgICAgKi9cbiAgICBvbnMuYm9vdHN0cmFwID0gZnVuY3Rpb24obmFtZSwgZGVwcykge1xuICAgICAgaWYgKGFuZ3VsYXIuaXNBcnJheShuYW1lKSkge1xuICAgICAgICBkZXBzID0gbmFtZTtcbiAgICAgICAgbmFtZSA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgIG5hbWUgPSAnbXlPbnNlbkFwcCc7XG4gICAgICB9XG5cbiAgICAgIGRlcHMgPSBbJ29uc2VuJ10uY29uY2F0KGFuZ3VsYXIuaXNBcnJheShkZXBzKSA/IGRlcHMgOiBbXSk7XG4gICAgICB2YXIgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUobmFtZSwgZGVwcyk7XG5cbiAgICAgIHZhciBkb2MgPSB3aW5kb3cuZG9jdW1lbnQ7XG4gICAgICBpZiAoZG9jLnJlYWR5U3RhdGUgPT0gJ2xvYWRpbmcnIHx8IGRvYy5yZWFkeVN0YXRlID09ICd1bmluaXRpYWxpemVkJyB8fCBkb2MucmVhZHlTdGF0ZSA9PSAnaW50ZXJhY3RpdmUnKSB7XG4gICAgICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgYW5ndWxhci5ib290c3RyYXAoZG9jLmRvY3VtZW50RWxlbWVudCwgW25hbWVdKTtcbiAgICAgICAgfSwgZmFsc2UpO1xuICAgICAgfSBlbHNlIGlmIChkb2MuZG9jdW1lbnRFbGVtZW50KSB7XG4gICAgICAgIGFuZ3VsYXIuYm9vdHN0cmFwKGRvYy5kb2N1bWVudEVsZW1lbnQsIFtuYW1lXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RhdGUnKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1vZHVsZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBmaW5kUGFyZW50Q29tcG9uZW50VW50aWxcbiAgICAgKiBAc2lnbmF0dXJlIGZpbmRQYXJlbnRDb21wb25lbnRVbnRpbChuYW1lLCBbZG9tXSlcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqICAgW2VuXU5hbWUgb2YgY29tcG9uZW50LCBpLmUuICdvbnMtcGFnZScuWy9lbl1cbiAgICAgKiAgIFtqYV3jgrPjg7Pjg53jg7zjg43jg7Pjg4jlkI3jgpLmjIflrprjgZfjgb7jgZnjgILkvovjgYjjgbBvbnMtcGFnZeOBquOBqeOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gICAgICogQHBhcmFtIHtPYmplY3QvanFMaXRlL0hUTUxFbGVtZW50fSBbZG9tXVxuICAgICAqICAgW2VuXSRldmVudCwganFMaXRlIG9yIEhUTUxFbGVtZW50IG9iamVjdC5bL2VuXVxuICAgICAqICAgW2phXSRldmVudOOCquODluOCuOOCp+OCr+ODiOOAgWpxTGl0ZeOCquODluOCuOOCp+OCr+ODiOOAgUhUTUxFbGVtZW5044Kq44OW44K444Kn44Kv44OI44Gu44GE44Ga44KM44GL44KS5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICogICBbZW5dQ29tcG9uZW50IG9iamVjdC4gV2lsbCByZXR1cm4gbnVsbCBpZiBubyBjb21wb25lbnQgd2FzIGZvdW5kLlsvZW5dXG4gICAgICogICBbamFd44Kz44Oz44Od44O844ON44Oz44OI44Gu44Kq44OW44K444Kn44Kv44OI44KS6L+U44GX44G+44GZ44CC44KC44GX44Kz44Oz44Od44O844ON44Oz44OI44GM6KaL44Gk44GL44KJ44Gq44GL44Gj44Gf5aC05ZCI44Gr44GvbnVsbOOCkui/lOOBl+OBvuOBmeOAglsvamFdXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogICBbZW5dRmluZCBwYXJlbnQgY29tcG9uZW50IG9iamVjdCBvZiA8Y29kZT5kb208L2NvZGU+IGVsZW1lbnQuWy9lbl1cbiAgICAgKiAgIFtqYV3mjIflrprjgZXjgozjgZ9kb23lvJXmlbDjga7opqropoHntKDjgpLjgZ/jganjgaPjgabjgrPjg7Pjg53jg7zjg43jg7Pjg4jjgpLmpJzntKLjgZfjgb7jgZnjgIJbL2phXVxuICAgICAqL1xuICAgIG9ucy5maW5kUGFyZW50Q29tcG9uZW50VW50aWwgPSBmdW5jdGlvbihuYW1lLCBkb20pIHtcbiAgICAgIHZhciBlbGVtZW50O1xuICAgICAgaWYgKGRvbSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGVsZW1lbnQgPSBhbmd1bGFyLmVsZW1lbnQoZG9tKTtcbiAgICAgIH0gZWxzZSBpZiAoZG9tIGluc3RhbmNlb2YgYW5ndWxhci5lbGVtZW50KSB7XG4gICAgICAgIGVsZW1lbnQgPSBkb207XG4gICAgICB9IGVsc2UgaWYgKGRvbS50YXJnZXQpIHtcbiAgICAgICAgZWxlbWVudCA9IGFuZ3VsYXIuZWxlbWVudChkb20udGFyZ2V0KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGVsZW1lbnQuaW5oZXJpdGVkRGF0YShuYW1lKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBmaW5kQ29tcG9uZW50XG4gICAgICogQHNpZ25hdHVyZSBmaW5kQ29tcG9uZW50KHNlbGVjdG9yLCBbZG9tXSlcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAgICAgKiAgIFtlbl1DU1Mgc2VsZWN0b3JbL2VuXVxuICAgICAqICAgW2phXUNTU+OCu+ODrOOCr+OCv+ODvOOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gW2RvbV1cbiAgICAgKiAgIFtlbl1ET00gZWxlbWVudCB0byBzZWFyY2ggZnJvbS5bL2VuXVxuICAgICAqICAgW2phXeaknOe0ouWvvuixoeOBqOOBmeOCi0RPTeimgee0oOOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gICAgICogQHJldHVybiB7T2JqZWN0L251bGx9XG4gICAgICogICBbZW5dQ29tcG9uZW50IG9iamVjdC4gV2lsbCByZXR1cm4gbnVsbCBpZiBubyBjb21wb25lbnQgd2FzIGZvdW5kLlsvZW5dXG4gICAgICogICBbamFd44Kz44Oz44Od44O844ON44Oz44OI44Gu44Kq44OW44K444Kn44Kv44OI44KS6L+U44GX44G+44GZ44CC44KC44GX44Kz44Oz44Od44O844ON44Oz44OI44GM6KaL44Gk44GL44KJ44Gq44GL44Gj44Gf5aC05ZCI44Gr44GvbnVsbOOCkui/lOOBl+OBvuOBmeOAglsvamFdXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogICBbZW5dRmluZCBjb21wb25lbnQgb2JqZWN0IHVzaW5nIENTUyBzZWxlY3Rvci5bL2VuXVxuICAgICAqICAgW2phXUNTU+OCu+ODrOOCr+OCv+OCkuS9v+OBo+OBpuOCs+ODs+ODneODvOODjeODs+ODiOOBruOCquODluOCuOOCp+OCr+ODiOOCkuaknOe0ouOBl+OBvuOBmeOAglsvamFdXG4gICAgICovXG4gICAgb25zLmZpbmRDb21wb25lbnQgPSBmdW5jdGlvbihzZWxlY3RvciwgZG9tKSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gKGRvbSA/IGRvbSA6IGRvY3VtZW50KS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgIHJldHVybiB0YXJnZXQgPyBhbmd1bGFyLmVsZW1lbnQodGFyZ2V0KS5kYXRhKHRhcmdldC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpKSB8fCBudWxsIDogbnVsbDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjb21waWxlXG4gICAgICogQHNpZ25hdHVyZSBjb21waWxlKGRvbSlcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkb21cbiAgICAgKiAgIFtlbl1FbGVtZW50IHRvIGNvbXBpbGUuWy9lbl1cbiAgICAgKiAgIFtqYV3jgrPjg7Pjg5HjgqTjg6vjgZnjgovopoHntKDjgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqICAgW2VuXUNvbXBpbGUgT25zZW4gVUkgY29tcG9uZW50cy5bL2VuXVxuICAgICAqICAgW2phXemAmuW4uOOBrkhUTUzjga7opoHntKDjgpJPbnNlbiBVSeOBruOCs+ODs+ODneODvOODjeODs+ODiOOBq+OCs+ODs+ODkeOCpOODq+OBl+OBvuOBmeOAglsvamFdXG4gICAgICovXG4gICAgb25zLmNvbXBpbGUgPSBmdW5jdGlvbihkb20pIHtcbiAgICAgIGlmICghb25zLiRjb21waWxlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignb25zLiRjb21waWxlKCkgaXMgbm90IHJlYWR5LiBXYWl0IGZvciBpbml0aWFsaXphdGlvbiB3aXRoIG9ucy5yZWFkeSgpLicpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIShkb20gaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIEhUTUxFbGVtZW50LicpO1xuICAgICAgfVxuXG4gICAgICB2YXIgc2NvcGUgPSBhbmd1bGFyLmVsZW1lbnQoZG9tKS5zY29wZSgpO1xuICAgICAgaWYgKCFzY29wZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FuZ3VsYXJKUyBTY29wZSBpcyBudWxsLiBBcmd1bWVudCBET00gZWxlbWVudCBtdXN0IGJlIGF0dGFjaGVkIGluIERPTSBkb2N1bWVudC4nKTtcbiAgICAgIH1cblxuICAgICAgb25zLiRjb21waWxlKGRvbSkoc2NvcGUpO1xuICAgIH07XG5cbiAgICBvbnMuX2dldE9uc2VuU2VydmljZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCF0aGlzLl9vbnNlblNlcnZpY2UpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCckb25zZW4gaXMgbm90IGxvYWRlZCwgd2FpdCBmb3Igb25zLnJlYWR5KCkuJyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLl9vbnNlblNlcnZpY2U7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBlbGVtZW50TmFtZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGxhc3RSZWFkeVxuICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICAgICAqL1xuICAgIG9ucy5fd2FpdERpcmV0aXZlSW5pdCA9IGZ1bmN0aW9uKGVsZW1lbnROYW1lLCBsYXN0UmVhZHkpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlbGVtZW50LCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoYW5ndWxhci5lbGVtZW50KGVsZW1lbnQpLmRhdGEoZWxlbWVudE5hbWUpKSB7XG4gICAgICAgICAgbGFzdFJlYWR5KGVsZW1lbnQsIGNhbGxiYWNrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgbGlzdGVuID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsYXN0UmVhZHkoZWxlbWVudCwgY2FsbGJhY2spO1xuICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGVsZW1lbnROYW1lICsgJzppbml0JywgbGlzdGVuLCBmYWxzZSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZWxlbWVudE5hbWUgKyAnOmluaXQnLCBsaXN0ZW4sIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjcmVhdGVFbGVtZW50XG4gICAgICogQHNpZ25hdHVyZSBjcmVhdGVFbGVtZW50KHRlbXBsYXRlLCBbb3B0aW9uc10pXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRlbXBsYXRlXG4gICAgICogICBbZW5dRWl0aGVyIGFuIEhUTUwgZmlsZSBwYXRoLCBhbiBgPG9ucy10ZW1wbGF0ZT5gIGlkIG9yIGFuIEhUTUwgc3RyaW5nIHN1Y2ggYXMgYCc8ZGl2IGlkPVwiZm9vXCI+aG9nZTwvZGl2PidgLlsvZW5dXG4gICAgICogICBbamFdWy9qYV1cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gICAgICogICBbZW5dUGFyYW1ldGVyIG9iamVjdC5bL2VuXVxuICAgICAqICAgW2phXeOCquODl+OCt+ODp+ODs+OCkuaMh+WumuOBmeOCi+OCquODluOCuOOCp+OCr+ODiOOAglsvamFdXG4gICAgICogQHBhcmFtIHtCb29sZWFufEhUTUxFbGVtZW50fSBbb3B0aW9ucy5hcHBlbmRdXG4gICAgICogICBbZW5dV2hldGhlciBvciBub3QgdGhlIGVsZW1lbnQgc2hvdWxkIGJlIGF1dG9tYXRpY2FsbHkgYXBwZW5kZWQgdG8gdGhlIERPTS4gIERlZmF1bHRzIHRvIGBmYWxzZWAuIElmIGB0cnVlYCB2YWx1ZSBpcyBnaXZlbiwgYGRvY3VtZW50LmJvZHlgIHdpbGwgYmUgdXNlZCBhcyB0aGUgdGFyZ2V0LlsvZW5dXG4gICAgICogICBbamFdWy9qYV1cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBbb3B0aW9ucy5pbnNlcnRCZWZvcmVdXG4gICAgICogICBbZW5dUmVmZXJlbmNlIG5vZGUgdGhhdCBiZWNvbWVzIHRoZSBuZXh0IHNpYmxpbmcgb2YgdGhlIG5ldyBub2RlIChgb3B0aW9ucy5hcHBlbmRgIGVsZW1lbnQpLlsvZW5dXG4gICAgICogICBbamFdWy9qYV1cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnMucGFyZW50U2NvcGVdXG4gICAgICogICBbZW5dUGFyZW50IHNjb3BlIG9mIHRoZSBlbGVtZW50LiBVc2VkIHRvIGJpbmQgbW9kZWxzIGFuZCBhY2Nlc3Mgc2NvcGUgbWV0aG9kcyBmcm9tIHRoZSBlbGVtZW50LiBSZXF1aXJlcyBhcHBlbmQgb3B0aW9uLlsvZW5dXG4gICAgICogICBbamFdWy9qYV1cbiAgICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudHxQcm9taXNlfVxuICAgICAqICAgW2VuXUlmIHRoZSBwcm92aWRlZCB0ZW1wbGF0ZSB3YXMgYW4gaW5saW5lIEhUTUwgc3RyaW5nLCBpdCByZXR1cm5zIHRoZSBuZXcgZWxlbWVudC4gT3RoZXJ3aXNlLCBpdCByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIHRoZSBuZXcgZWxlbWVudC5bL2VuXVxuICAgICAqICAgW2phXVsvamFdXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogICBbZW5dQ3JlYXRlIGEgbmV3IGVsZW1lbnQgZnJvbSBhIHRlbXBsYXRlLiBCb3RoIGlubGluZSBIVE1MIGFuZCBleHRlcm5hbCBmaWxlcyBhcmUgc3VwcG9ydGVkIGFsdGhvdWdoIHRoZSByZXR1cm4gdmFsdWUgZGlmZmVycy4gSWYgdGhlIGVsZW1lbnQgaXMgYXBwZW5kZWQgaXQgd2lsbCBhbHNvIGJlIGNvbXBpbGVkIGJ5IEFuZ3VsYXJKUyAob3RoZXJ3aXNlLCBgb25zLmNvbXBpbGVgIHNob3VsZCBiZSBtYW51YWxseSB1c2VkKS5bL2VuXVxuICAgICAqICAgW2phXVsvamFdXG4gICAgICovXG4gICAgY29uc3QgY3JlYXRlRWxlbWVudE9yaWdpbmFsID0gb25zLmNyZWF0ZUVsZW1lbnQ7XG4gICAgb25zLmNyZWF0ZUVsZW1lbnQgPSAodGVtcGxhdGUsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICAgICAgY29uc3QgbGluayA9IGVsZW1lbnQgPT4ge1xuICAgICAgICBpZiAob3B0aW9ucy5wYXJlbnRTY29wZSkge1xuICAgICAgICAgIG9ucy4kY29tcGlsZShhbmd1bGFyLmVsZW1lbnQoZWxlbWVudCkpKG9wdGlvbnMucGFyZW50U2NvcGUuJG5ldygpKTtcbiAgICAgICAgICBvcHRpb25zLnBhcmVudFNjb3BlLiRldmFsQXN5bmMoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvbnMuY29tcGlsZShlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgY29uc3QgZ2V0U2NvcGUgPSBlID0+IGFuZ3VsYXIuZWxlbWVudChlKS5kYXRhKGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpKSB8fCBlO1xuICAgICAgY29uc3QgcmVzdWx0ID0gY3JlYXRlRWxlbWVudE9yaWdpbmFsKHRlbXBsYXRlLCB7IGFwcGVuZDogISFvcHRpb25zLnBhcmVudFNjb3BlLCBsaW5rLCAuLi5vcHRpb25zIH0pO1xuXG4gICAgICByZXR1cm4gcmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSA/IHJlc3VsdC50aGVuKGdldFNjb3BlKSA6IGdldFNjb3BlKHJlc3VsdCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY3JlYXRlQWxlcnREaWFsb2dcbiAgICAgKiBAc2lnbmF0dXJlIGNyZWF0ZUFsZXJ0RGlhbG9nKHBhZ2UsIFtvcHRpb25zXSlcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcGFnZVxuICAgICAqICAgW2VuXVBhZ2UgbmFtZS4gQ2FuIGJlIGVpdGhlciBhbiBIVE1MIGZpbGUgb3IgYW4gPG9ucy10ZW1wbGF0ZT4gY29udGFpbmluZyBhIDxvbnMtYWxlcnQtZGlhbG9nPiBjb21wb25lbnQuWy9lbl1cbiAgICAgKiAgIFtqYV1wYWdl44GuVVJM44GL44CB44KC44GX44GP44Gvb25zLXRlbXBsYXRl44Gn5a6j6KiA44GX44Gf44OG44Oz44OX44Os44O844OI44GuaWTlsZ7mgKfjga7lgKTjgpLmjIflrprjgafjgY3jgb7jgZnjgIJbL2phXVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICAgKiAgIFtlbl1QYXJhbWV0ZXIgb2JqZWN0LlsvZW5dXG4gICAgICogICBbamFd44Kq44OX44K344On44Oz44KS5oyH5a6a44GZ44KL44Kq44OW44K444Kn44Kv44OI44CCWy9qYV1cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnMucGFyZW50U2NvcGVdXG4gICAgICogICBbZW5dUGFyZW50IHNjb3BlIG9mIHRoZSBkaWFsb2cuIFVzZWQgdG8gYmluZCBtb2RlbHMgYW5kIGFjY2VzcyBzY29wZSBtZXRob2RzIGZyb20gdGhlIGRpYWxvZy5bL2VuXVxuICAgICAqICAgW2phXeODgOOCpOOCouODreOCsOWGheOBp+WIqeeUqOOBmeOCi+imquOCueOCs+ODvOODl+OCkuaMh+WumuOBl+OBvuOBmeOAguODgOOCpOOCouODreOCsOOBi+OCieODouODh+ODq+OChOOCueOCs+ODvOODl+OBruODoeOCveODg+ODieOBq+OCouOCr+OCu+OCueOBmeOCi+OBruOBq+S9v+OBhOOBvuOBmeOAguOBk+OBruODkeODqeODoeODvOOCv+OBr0FuZ3VsYXJKU+ODkOOCpOODs+ODh+OCo+ODs+OCsOOBp+OBruOBv+WIqeeUqOOBp+OBjeOBvuOBmeOAglsvamFdXG4gICAgICogQHJldHVybiB7UHJvbWlzZX1cbiAgICAgKiAgIFtlbl1Qcm9taXNlIG9iamVjdCB0aGF0IHJlc29sdmVzIHRvIHRoZSBhbGVydCBkaWFsb2cgY29tcG9uZW50IG9iamVjdC5bL2VuXVxuICAgICAqICAgW2phXeODgOOCpOOCouODreOCsOOBruOCs+ODs+ODneODvOODjeODs+ODiOOCquODluOCuOOCp+OCr+ODiOOCkuino+axuuOBmeOCi1Byb21pc2Xjgqrjg5bjgrjjgqfjgq/jg4jjgpLov5TjgZfjgb7jgZnjgIJbL2phXVxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqICAgW2VuXUNyZWF0ZSBhIGFsZXJ0IGRpYWxvZyBpbnN0YW5jZSBmcm9tIGEgdGVtcGxhdGUuIFRoaXMgbWV0aG9kIHdpbGwgYmUgZGVwcmVjYXRlZCBpbiBmYXZvciBvZiBgb25zLmNyZWF0ZUVsZW1lbnRgLlsvZW5dXG4gICAgICogICBbamFd44OG44Oz44OX44Os44O844OI44GL44KJ44Ki44Op44O844OI44OA44Kk44Ki44Ot44Kw44Gu44Kk44Oz44K544K/44Oz44K544KS55Sf5oiQ44GX44G+44GZ44CCWy9qYV1cbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY3JlYXRlRGlhbG9nXG4gICAgICogQHNpZ25hdHVyZSBjcmVhdGVEaWFsb2cocGFnZSwgW29wdGlvbnNdKVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwYWdlXG4gICAgICogICBbZW5dUGFnZSBuYW1lLiBDYW4gYmUgZWl0aGVyIGFuIEhUTUwgZmlsZSBvciBhbiA8b25zLXRlbXBsYXRlPiBjb250YWluaW5nIGEgPG9ucy1kaWFsb2c+IGNvbXBvbmVudC5bL2VuXVxuICAgICAqICAgW2phXXBhZ2Xjga5VUkzjgYvjgIHjgoLjgZfjgY/jga9vbnMtdGVtcGxhdGXjgaflrqPoqIDjgZfjgZ/jg4bjg7Pjg5fjg6zjg7zjg4jjga5pZOWxnuaAp+OBruWApOOCkuaMh+WumuOBp+OBjeOBvuOBmeOAglsvamFdXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgICAqICAgW2VuXVBhcmFtZXRlciBvYmplY3QuWy9lbl1cbiAgICAgKiAgIFtqYV3jgqrjg5fjgrfjg6fjg7PjgpLmjIflrprjgZnjgovjgqrjg5bjgrjjgqfjgq/jg4jjgIJbL2phXVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucy5wYXJlbnRTY29wZV1cbiAgICAgKiAgIFtlbl1QYXJlbnQgc2NvcGUgb2YgdGhlIGRpYWxvZy4gVXNlZCB0byBiaW5kIG1vZGVscyBhbmQgYWNjZXNzIHNjb3BlIG1ldGhvZHMgZnJvbSB0aGUgZGlhbG9nLlsvZW5dXG4gICAgICogICBbamFd44OA44Kk44Ki44Ot44Kw5YaF44Gn5Yip55So44GZ44KL6Kaq44K544Kz44O844OX44KS5oyH5a6a44GX44G+44GZ44CC44OA44Kk44Ki44Ot44Kw44GL44KJ44Oi44OH44Or44KE44K544Kz44O844OX44Gu44Oh44K944OD44OJ44Gr44Ki44Kv44K744K544GZ44KL44Gu44Gr5L2/44GE44G+44GZ44CC44GT44Gu44OR44Op44Oh44O844K/44GvQW5ndWxhckpT44OQ44Kk44Oz44OH44Kj44Oz44Kw44Gn44Gu44G/5Yip55So44Gn44GN44G+44GZ44CCWy9qYV1cbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgICAqICAgW2VuXVByb21pc2Ugb2JqZWN0IHRoYXQgcmVzb2x2ZXMgdG8gdGhlIGRpYWxvZyBjb21wb25lbnQgb2JqZWN0LlsvZW5dXG4gICAgICogICBbamFd44OA44Kk44Ki44Ot44Kw44Gu44Kz44Oz44Od44O844ON44Oz44OI44Kq44OW44K444Kn44Kv44OI44KS6Kej5rG644GZ44KLUHJvbWlzZeOCquODluOCuOOCp+OCr+ODiOOCkui/lOOBl+OBvuOBmeOAglsvamFdXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogICBbZW5dQ3JlYXRlIGEgZGlhbG9nIGluc3RhbmNlIGZyb20gYSB0ZW1wbGF0ZS4gVGhpcyBtZXRob2Qgd2lsbCBiZSBkZXByZWNhdGVkIGluIGZhdm9yIG9mIGBvbnMuY3JlYXRlRWxlbWVudGAuWy9lbl1cbiAgICAgKiAgIFtqYV3jg4bjg7Pjg5fjg6zjg7zjg4jjgYvjgonjg4DjgqTjgqLjg63jgrDjga7jgqTjg7Pjgrnjgr/jg7PjgrnjgpLnlJ/miJDjgZfjgb7jgZnjgIJbL2phXVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjcmVhdGVQb3BvdmVyXG4gICAgICogQHNpZ25hdHVyZSBjcmVhdGVQb3BvdmVyKHBhZ2UsIFtvcHRpb25zXSlcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcGFnZVxuICAgICAqICAgW2VuXVBhZ2UgbmFtZS4gQ2FuIGJlIGVpdGhlciBhbiBIVE1MIGZpbGUgb3IgYW4gPG9ucy10ZW1wbGF0ZT4gY29udGFpbmluZyBhIDxvbnMtZGlhbG9nPiBjb21wb25lbnQuWy9lbl1cbiAgICAgKiAgIFtqYV1wYWdl44GuVVJM44GL44CB44KC44GX44GP44Gvb25zLXRlbXBsYXRl44Gn5a6j6KiA44GX44Gf44OG44Oz44OX44Os44O844OI44GuaWTlsZ7mgKfjga7lgKTjgpLmjIflrprjgafjgY3jgb7jgZnjgIJbL2phXVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICAgKiAgIFtlbl1QYXJhbWV0ZXIgb2JqZWN0LlsvZW5dXG4gICAgICogICBbamFd44Kq44OX44K344On44Oz44KS5oyH5a6a44GZ44KL44Kq44OW44K444Kn44Kv44OI44CCWy9qYV1cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnMucGFyZW50U2NvcGVdXG4gICAgICogICBbZW5dUGFyZW50IHNjb3BlIG9mIHRoZSBkaWFsb2cuIFVzZWQgdG8gYmluZCBtb2RlbHMgYW5kIGFjY2VzcyBzY29wZSBtZXRob2RzIGZyb20gdGhlIGRpYWxvZy5bL2VuXVxuICAgICAqICAgW2phXeODgOOCpOOCouODreOCsOWGheOBp+WIqeeUqOOBmeOCi+imquOCueOCs+ODvOODl+OCkuaMh+WumuOBl+OBvuOBmeOAguODgOOCpOOCouODreOCsOOBi+OCieODouODh+ODq+OChOOCueOCs+ODvOODl+OBruODoeOCveODg+ODieOBq+OCouOCr+OCu+OCueOBmeOCi+OBruOBq+S9v+OBhOOBvuOBmeOAguOBk+OBruODkeODqeODoeODvOOCv+OBr0FuZ3VsYXJKU+ODkOOCpOODs+ODh+OCo+ODs+OCsOOBp+OBruOBv+WIqeeUqOOBp+OBjeOBvuOBmeOAglsvamFdXG4gICAgICogQHJldHVybiB7UHJvbWlzZX1cbiAgICAgKiAgIFtlbl1Qcm9taXNlIG9iamVjdCB0aGF0IHJlc29sdmVzIHRvIHRoZSBwb3BvdmVyIGNvbXBvbmVudCBvYmplY3QuWy9lbl1cbiAgICAgKiAgIFtqYV3jg53jg4Pjg5fjgqrjg7zjg5Djg7zjga7jgrPjg7Pjg53jg7zjg43jg7Pjg4jjgqrjg5bjgrjjgqfjgq/jg4jjgpLop6PmsbrjgZnjgotQcm9taXNl44Kq44OW44K444Kn44Kv44OI44KS6L+U44GX44G+44GZ44CCWy9qYV1cbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiAgIFtlbl1DcmVhdGUgYSBwb3BvdmVyIGluc3RhbmNlIGZyb20gYSB0ZW1wbGF0ZS4gVGhpcyBtZXRob2Qgd2lsbCBiZSBkZXByZWNhdGVkIGluIGZhdm9yIG9mIGBvbnMuY3JlYXRlRWxlbWVudGAuWy9lbl1cbiAgICAgKiAgIFtqYV3jg4bjg7Pjg5fjg6zjg7zjg4jjgYvjgonjg53jg4Pjg5fjgqrjg7zjg5Djg7zjga7jgqTjg7Pjgrnjgr/jg7PjgrnjgpLnlJ/miJDjgZfjgb7jgZnjgIJbL2phXVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBhZ2VcbiAgICAgKi9cbiAgICBjb25zdCByZXNvbHZlTG9hZGluZ1BsYWNlSG9sZGVyT3JpZ2luYWwgPSBvbnMucmVzb2x2ZUxvYWRpbmdQbGFjZUhvbGRlcjtcbiAgICBvbnMucmVzb2x2ZUxvYWRpbmdQbGFjZWhvbGRlciA9IHBhZ2UgPT4ge1xuICAgICAgcmV0dXJuIHJlc29sdmVMb2FkaW5nUGxhY2Vob2xkZXJPcmlnaW5hbChwYWdlLCAoZWxlbWVudCwgZG9uZSkgPT4ge1xuICAgICAgICBvbnMuY29tcGlsZShlbGVtZW50KTtcbiAgICAgICAgYW5ndWxhci5lbGVtZW50KGVsZW1lbnQpLnNjb3BlKCkuJGV2YWxBc3luYygoKSA9PiBzZXRJbW1lZGlhdGUoZG9uZSkpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9ucy5fc2V0dXBMb2FkaW5nUGxhY2VIb2xkZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBEbyBub3RoaW5nXG4gICAgfTtcbiAgfVxuXG59KSh3aW5kb3cub25zID0gd2luZG93Lm9ucyB8fCB7fSk7XG4iLCIvKlxuQ29weXJpZ2h0IDIwMTMtMjAxNSBBU0lBTCBDT1JQT1JBVElPTlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4qL1xuXG4oZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ29uc2VuJyk7XG5cbiAgbW9kdWxlLmZhY3RvcnkoJ0FjdGlvblNoZWV0VmlldycsIGZ1bmN0aW9uKCRvbnNlbikge1xuXG4gICAgdmFyIEFjdGlvblNoZWV0VmlldyA9IENsYXNzLmV4dGVuZCh7XG5cbiAgICAgIC8qKlxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IHNjb3BlXG4gICAgICAgKiBAcGFyYW0ge2pxTGl0ZX0gZWxlbWVudFxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJzXG4gICAgICAgKi9cbiAgICAgIGluaXQ6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICB0aGlzLl9zY29wZSA9IHNjb3BlO1xuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5fYXR0cnMgPSBhdHRycztcblxuICAgICAgICB0aGlzLl9jbGVhckRlcml2aW5nTWV0aG9kcyA9ICRvbnNlbi5kZXJpdmVNZXRob2RzKHRoaXMsIHRoaXMuX2VsZW1lbnRbMF0sIFtcbiAgICAgICAgICAnc2hvdycsICdoaWRlJywgJ3RvZ2dsZSdcbiAgICAgICAgXSk7XG5cbiAgICAgICAgdGhpcy5fY2xlYXJEZXJpdmluZ0V2ZW50cyA9ICRvbnNlbi5kZXJpdmVFdmVudHModGhpcywgdGhpcy5fZWxlbWVudFswXSwgW1xuICAgICAgICAgICdwcmVzaG93JywgJ3Bvc3RzaG93JywgJ3ByZWhpZGUnLCAncG9zdGhpZGUnLCAnY2FuY2VsJ1xuICAgICAgICBdLCBmdW5jdGlvbihkZXRhaWwpIHtcbiAgICAgICAgICBpZiAoZGV0YWlsLmFjdGlvblNoZWV0KSB7XG4gICAgICAgICAgICBkZXRhaWwuYWN0aW9uU2hlZXQgPSB0aGlzO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZGV0YWlsO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuX3Njb3BlLiRvbignJGRlc3Ryb3knLCB0aGlzLl9kZXN0cm95LmJpbmQodGhpcykpO1xuICAgICAgfSxcblxuICAgICAgX2Rlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmVtaXQoJ2Rlc3Ryb3knKTtcblxuICAgICAgICB0aGlzLl9lbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLl9jbGVhckRlcml2aW5nTWV0aG9kcygpO1xuICAgICAgICB0aGlzLl9jbGVhckRlcml2aW5nRXZlbnRzKCk7XG5cbiAgICAgICAgdGhpcy5fc2NvcGUgPSB0aGlzLl9hdHRycyA9IHRoaXMuX2VsZW1lbnQgPSBudWxsO1xuICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICBNaWNyb0V2ZW50Lm1peGluKEFjdGlvblNoZWV0Vmlldyk7XG4gICAgJG9uc2VuLmRlcml2ZVByb3BlcnRpZXNGcm9tRWxlbWVudChBY3Rpb25TaGVldFZpZXcsIFsnZGlzYWJsZWQnLCAnY2FuY2VsYWJsZScsICd2aXNpYmxlJywgJ29uRGV2aWNlQmFja0J1dHRvbiddKTtcblxuICAgIHJldHVybiBBY3Rpb25TaGVldFZpZXc7XG4gIH0pO1xufSkoKTtcbiIsIi8qXG5Db3B5cmlnaHQgMjAxMy0yMDE1IEFTSUFMIENPUlBPUkFUSU9OXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbiovXG5cbihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnb25zZW4nKTtcblxuICBtb2R1bGUuZmFjdG9yeSgnQWxlcnREaWFsb2dWaWV3JywgZnVuY3Rpb24oJG9uc2VuKSB7XG5cbiAgICB2YXIgQWxlcnREaWFsb2dWaWV3ID0gQ2xhc3MuZXh0ZW5kKHtcblxuICAgICAgLyoqXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gc2NvcGVcbiAgICAgICAqIEBwYXJhbSB7anFMaXRlfSBlbGVtZW50XG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAgICAgICAqL1xuICAgICAgaW5pdDogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgIHRoaXMuX3Njb3BlID0gc2NvcGU7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLl9hdHRycyA9IGF0dHJzO1xuXG4gICAgICAgIHRoaXMuX2NsZWFyRGVyaXZpbmdNZXRob2RzID0gJG9uc2VuLmRlcml2ZU1ldGhvZHModGhpcywgdGhpcy5fZWxlbWVudFswXSwgW1xuICAgICAgICAgICdzaG93JywgJ2hpZGUnXG4gICAgICAgIF0pO1xuXG4gICAgICAgIHRoaXMuX2NsZWFyRGVyaXZpbmdFdmVudHMgPSAkb25zZW4uZGVyaXZlRXZlbnRzKHRoaXMsIHRoaXMuX2VsZW1lbnRbMF0sIFtcbiAgICAgICAgICAncHJlc2hvdycsXG4gICAgICAgICAgJ3Bvc3RzaG93JyxcbiAgICAgICAgICAncHJlaGlkZScsXG4gICAgICAgICAgJ3Bvc3RoaWRlJyxcbiAgICAgICAgICAnY2FuY2VsJ1xuICAgICAgICBdLCBmdW5jdGlvbihkZXRhaWwpIHtcbiAgICAgICAgICBpZiAoZGV0YWlsLmFsZXJ0RGlhbG9nKSB7XG4gICAgICAgICAgICBkZXRhaWwuYWxlcnREaWFsb2cgPSB0aGlzO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZGV0YWlsO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuX3Njb3BlLiRvbignJGRlc3Ryb3knLCB0aGlzLl9kZXN0cm95LmJpbmQodGhpcykpO1xuICAgICAgfSxcblxuICAgICAgX2Rlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmVtaXQoJ2Rlc3Ryb3knKTtcblxuICAgICAgICB0aGlzLl9lbGVtZW50LnJlbW92ZSgpO1xuXG4gICAgICAgIHRoaXMuX2NsZWFyRGVyaXZpbmdNZXRob2RzKCk7XG4gICAgICAgIHRoaXMuX2NsZWFyRGVyaXZpbmdFdmVudHMoKTtcblxuICAgICAgICB0aGlzLl9zY29wZSA9IHRoaXMuX2F0dHJzID0gdGhpcy5fZWxlbWVudCA9IG51bGw7XG4gICAgICB9XG5cbiAgICB9KTtcblxuICAgIE1pY3JvRXZlbnQubWl4aW4oQWxlcnREaWFsb2dWaWV3KTtcbiAgICAkb25zZW4uZGVyaXZlUHJvcGVydGllc0Zyb21FbGVtZW50KEFsZXJ0RGlhbG9nVmlldywgWydkaXNhYmxlZCcsICdjYW5jZWxhYmxlJywgJ3Zpc2libGUnLCAnb25EZXZpY2VCYWNrQnV0dG9uJ10pO1xuXG4gICAgcmV0dXJuIEFsZXJ0RGlhbG9nVmlldztcbiAgfSk7XG59KSgpO1xuIiwiLypcbkNvcHlyaWdodCAyMDEzLTIwMTUgQVNJQUwgQ09SUE9SQVRJT05cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuKi9cblxuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdvbnNlbicpO1xuXG4gIG1vZHVsZS5mYWN0b3J5KCdDYXJvdXNlbFZpZXcnLCBmdW5jdGlvbigkb25zZW4pIHtcblxuICAgIC8qKlxuICAgICAqIEBjbGFzcyBDYXJvdXNlbFZpZXdcbiAgICAgKi9cbiAgICB2YXIgQ2Fyb3VzZWxWaWV3ID0gQ2xhc3MuZXh0ZW5kKHtcblxuICAgICAgLyoqXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gc2NvcGVcbiAgICAgICAqIEBwYXJhbSB7anFMaXRlfSBlbGVtZW50XG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAgICAgICAqL1xuICAgICAgaW5pdDogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLl9zY29wZSA9IHNjb3BlO1xuICAgICAgICB0aGlzLl9hdHRycyA9IGF0dHJzO1xuXG4gICAgICAgIHRoaXMuX3Njb3BlLiRvbignJGRlc3Ryb3knLCB0aGlzLl9kZXN0cm95LmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuX2NsZWFyRGVyaXZpbmdNZXRob2RzID0gJG9uc2VuLmRlcml2ZU1ldGhvZHModGhpcywgZWxlbWVudFswXSwgW1xuICAgICAgICAgICdzZXRBY3RpdmVJbmRleCcsICdnZXRBY3RpdmVJbmRleCcsICduZXh0JywgJ3ByZXYnLCAncmVmcmVzaCcsICdmaXJzdCcsICdsYXN0J1xuICAgICAgICBdKTtcblxuICAgICAgICB0aGlzLl9jbGVhckRlcml2aW5nRXZlbnRzID0gJG9uc2VuLmRlcml2ZUV2ZW50cyh0aGlzLCBlbGVtZW50WzBdLCBbJ3JlZnJlc2gnLCAncG9zdGNoYW5nZScsICdvdmVyc2Nyb2xsJ10sIGZ1bmN0aW9uKGRldGFpbCkge1xuICAgICAgICAgIGlmIChkZXRhaWwuY2Fyb3VzZWwpIHtcbiAgICAgICAgICAgIGRldGFpbC5jYXJvdXNlbCA9IHRoaXM7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBkZXRhaWw7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICB9LFxuXG4gICAgICBfZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZW1pdCgnZGVzdHJveScpO1xuXG4gICAgICAgIHRoaXMuX2NsZWFyRGVyaXZpbmdFdmVudHMoKTtcbiAgICAgICAgdGhpcy5fY2xlYXJEZXJpdmluZ01ldGhvZHMoKTtcblxuICAgICAgICB0aGlzLl9lbGVtZW50ID0gdGhpcy5fc2NvcGUgPSB0aGlzLl9hdHRycyA9IG51bGw7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBNaWNyb0V2ZW50Lm1peGluKENhcm91c2VsVmlldyk7XG5cbiAgICAkb25zZW4uZGVyaXZlUHJvcGVydGllc0Zyb21FbGVtZW50KENhcm91c2VsVmlldywgW1xuICAgICAgJ2NlbnRlcmVkJywgJ292ZXJzY3JvbGxhYmxlJywgJ2Rpc2FibGVkJywgJ2F1dG9TY3JvbGwnLCAnc3dpcGVhYmxlJywgJ2F1dG9TY3JvbGxSYXRpbycsICdpdGVtQ291bnQnLCAnb25Td2lwZSdcbiAgICBdKTtcblxuICAgIHJldHVybiBDYXJvdXNlbFZpZXc7XG4gIH0pO1xufSkoKTtcbiIsIi8qXG5Db3B5cmlnaHQgMjAxMy0yMDE1IEFTSUFMIENPUlBPUkFUSU9OXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbiovXG5cbihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnb25zZW4nKTtcblxuICBtb2R1bGUuZmFjdG9yeSgnRGlhbG9nVmlldycsIGZ1bmN0aW9uKCRvbnNlbikge1xuXG4gICAgdmFyIERpYWxvZ1ZpZXcgPSBDbGFzcy5leHRlbmQoe1xuXG4gICAgICBpbml0OiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgdGhpcy5fc2NvcGUgPSBzY29wZTtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMuX2F0dHJzID0gYXR0cnM7XG5cbiAgICAgICAgdGhpcy5fY2xlYXJEZXJpdmluZ01ldGhvZHMgPSAkb25zZW4uZGVyaXZlTWV0aG9kcyh0aGlzLCB0aGlzLl9lbGVtZW50WzBdLCBbXG4gICAgICAgICAgJ3Nob3cnLCAnaGlkZSdcbiAgICAgICAgXSk7XG5cbiAgICAgICAgdGhpcy5fY2xlYXJEZXJpdmluZ0V2ZW50cyA9ICRvbnNlbi5kZXJpdmVFdmVudHModGhpcywgdGhpcy5fZWxlbWVudFswXSwgW1xuICAgICAgICAgICdwcmVzaG93JyxcbiAgICAgICAgICAncG9zdHNob3cnLFxuICAgICAgICAgICdwcmVoaWRlJyxcbiAgICAgICAgICAncG9zdGhpZGUnLFxuICAgICAgICAgICdjYW5jZWwnXG4gICAgICAgIF0sIGZ1bmN0aW9uKGRldGFpbCkge1xuICAgICAgICAgIGlmIChkZXRhaWwuZGlhbG9nKSB7XG4gICAgICAgICAgICBkZXRhaWwuZGlhbG9nID0gdGhpcztcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGRldGFpbDtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICB0aGlzLl9zY29wZS4kb24oJyRkZXN0cm95JywgdGhpcy5fZGVzdHJveS5iaW5kKHRoaXMpKTtcbiAgICAgIH0sXG5cbiAgICAgIF9kZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5lbWl0KCdkZXN0cm95Jyk7XG5cbiAgICAgICAgdGhpcy5fZWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5fY2xlYXJEZXJpdmluZ01ldGhvZHMoKTtcbiAgICAgICAgdGhpcy5fY2xlYXJEZXJpdmluZ0V2ZW50cygpO1xuXG4gICAgICAgIHRoaXMuX3Njb3BlID0gdGhpcy5fYXR0cnMgPSB0aGlzLl9lbGVtZW50ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIE1pY3JvRXZlbnQubWl4aW4oRGlhbG9nVmlldyk7XG4gICAgJG9uc2VuLmRlcml2ZVByb3BlcnRpZXNGcm9tRWxlbWVudChEaWFsb2dWaWV3LCBbJ2Rpc2FibGVkJywgJ2NhbmNlbGFibGUnLCAndmlzaWJsZScsICdvbkRldmljZUJhY2tCdXR0b24nXSk7XG5cbiAgICByZXR1cm4gRGlhbG9nVmlldztcbiAgfSk7XG59KSgpO1xuIiwiLypcbkNvcHlyaWdodCAyMDEzLTIwMTUgQVNJQUwgQ09SUE9SQVRJT05cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuKi9cblxuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdvbnNlbicpO1xuXG4gIG1vZHVsZS5mYWN0b3J5KCdGYWJWaWV3JywgZnVuY3Rpb24oJG9uc2VuKSB7XG5cbiAgICAvKipcbiAgICAgKiBAY2xhc3MgRmFiVmlld1xuICAgICAqL1xuICAgIHZhciBGYWJWaWV3ID0gQ2xhc3MuZXh0ZW5kKHtcblxuICAgICAgLyoqXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gc2NvcGVcbiAgICAgICAqIEBwYXJhbSB7anFMaXRlfSBlbGVtZW50XG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAgICAgICAqL1xuICAgICAgaW5pdDogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLl9zY29wZSA9IHNjb3BlO1xuICAgICAgICB0aGlzLl9hdHRycyA9IGF0dHJzO1xuXG4gICAgICAgIHRoaXMuX3Njb3BlLiRvbignJGRlc3Ryb3knLCB0aGlzLl9kZXN0cm95LmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuX2NsZWFyRGVyaXZpbmdNZXRob2RzID0gJG9uc2VuLmRlcml2ZU1ldGhvZHModGhpcywgZWxlbWVudFswXSwgW1xuICAgICAgICAgICdzaG93JywgJ2hpZGUnLCAndG9nZ2xlJ1xuICAgICAgICBdKTtcbiAgICAgIH0sXG5cbiAgICAgIF9kZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5lbWl0KCdkZXN0cm95Jyk7XG4gICAgICAgIHRoaXMuX2NsZWFyRGVyaXZpbmdNZXRob2RzKCk7XG5cbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IHRoaXMuX3Njb3BlID0gdGhpcy5fYXR0cnMgPSBudWxsO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgJG9uc2VuLmRlcml2ZVByb3BlcnRpZXNGcm9tRWxlbWVudChGYWJWaWV3LCBbXG4gICAgICAnZGlzYWJsZWQnLCAndmlzaWJsZSdcbiAgICBdKTtcblxuICAgIE1pY3JvRXZlbnQubWl4aW4oRmFiVmlldyk7XG5cbiAgICByZXR1cm4gRmFiVmlldztcbiAgfSk7XG59KSgpO1xuIiwiLypcbkNvcHlyaWdodCAyMDEzLTIwMTUgQVNJQUwgQ09SUE9SQVRJT05cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuKi9cblxuKGZ1bmN0aW9uKCl7XG4gICd1c2Ugc3RyaWN0JztcblxuICBhbmd1bGFyLm1vZHVsZSgnb25zZW4nKS5mYWN0b3J5KCdHZW5lcmljVmlldycsIGZ1bmN0aW9uKCRvbnNlbikge1xuXG4gICAgdmFyIEdlbmVyaWNWaWV3ID0gQ2xhc3MuZXh0ZW5kKHtcblxuICAgICAgLyoqXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gc2NvcGVcbiAgICAgICAqIEBwYXJhbSB7anFMaXRlfSBlbGVtZW50XG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuZGlyZWN0aXZlT25seV1cbiAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtvcHRpb25zLm9uRGVzdHJveV1cbiAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5tb2RpZmllclRlbXBsYXRlXVxuICAgICAgICovXG4gICAgICBpbml0OiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBvcHRpb25zID0ge307XG5cbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMuX3Njb3BlID0gc2NvcGU7XG4gICAgICAgIHRoaXMuX2F0dHJzID0gYXR0cnM7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuZGlyZWN0aXZlT25seSkge1xuICAgICAgICAgIGlmICghb3B0aW9ucy5tb2RpZmllclRlbXBsYXRlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ29wdGlvbnMubW9kaWZpZXJUZW1wbGF0ZSBpcyB1bmRlZmluZWQuJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgICRvbnNlbi5hZGRNb2RpZmllck1ldGhvZHModGhpcywgb3B0aW9ucy5tb2RpZmllclRlbXBsYXRlLCBlbGVtZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkb25zZW4uYWRkTW9kaWZpZXJNZXRob2RzRm9yQ3VzdG9tRWxlbWVudHModGhpcywgZWxlbWVudCk7XG4gICAgICAgIH1cblxuICAgICAgICAkb25zZW4uY2xlYW5lci5vbkRlc3Ryb3koc2NvcGUsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNlbGYuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAkb25zZW4ucmVtb3ZlTW9kaWZpZXJNZXRob2RzKHNlbGYpO1xuXG4gICAgICAgICAgaWYgKG9wdGlvbnMub25EZXN0cm95KSB7XG4gICAgICAgICAgICBvcHRpb25zLm9uRGVzdHJveShzZWxmKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAkb25zZW4uY2xlYXJDb21wb25lbnQoe1xuICAgICAgICAgICAgc2NvcGU6IHNjb3BlLFxuICAgICAgICAgICAgYXR0cnM6IGF0dHJzLFxuICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudFxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgc2VsZiA9IGVsZW1lbnQgPSBzZWxmLl9lbGVtZW50ID0gc2VsZi5fc2NvcGUgPSBzY29wZSA9IHNlbGYuX2F0dHJzID0gYXR0cnMgPSBvcHRpb25zID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc2NvcGVcbiAgICAgKiBAcGFyYW0ge2pxTGl0ZX0gZWxlbWVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMudmlld0tleVxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuZGlyZWN0aXZlT25seV1cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbb3B0aW9ucy5vbkRlc3Ryb3ldXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLm1vZGlmaWVyVGVtcGxhdGVdXG4gICAgICovXG4gICAgR2VuZXJpY1ZpZXcucmVnaXN0ZXIgPSBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIG9wdGlvbnMpIHtcbiAgICAgIHZhciB2aWV3ID0gbmV3IEdlbmVyaWNWaWV3KHNjb3BlLCBlbGVtZW50LCBhdHRycywgb3B0aW9ucyk7XG5cbiAgICAgIGlmICghb3B0aW9ucy52aWV3S2V5KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignb3B0aW9ucy52aWV3S2V5IGlzIHJlcXVpcmVkLicpO1xuICAgICAgfVxuXG4gICAgICAkb25zZW4uZGVjbGFyZVZhckF0dHJpYnV0ZShhdHRycywgdmlldyk7XG4gICAgICBlbGVtZW50LmRhdGEob3B0aW9ucy52aWV3S2V5LCB2aWV3KTtcblxuICAgICAgdmFyIGRlc3Ryb3kgPSBvcHRpb25zLm9uRGVzdHJveSB8fCBhbmd1bGFyLm5vb3A7XG4gICAgICBvcHRpb25zLm9uRGVzdHJveSA9IGZ1bmN0aW9uKHZpZXcpIHtcbiAgICAgICAgZGVzdHJveSh2aWV3KTtcbiAgICAgICAgZWxlbWVudC5kYXRhKG9wdGlvbnMudmlld0tleSwgbnVsbCk7XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gdmlldztcbiAgICB9O1xuXG4gICAgTWljcm9FdmVudC5taXhpbihHZW5lcmljVmlldyk7XG5cbiAgICByZXR1cm4gR2VuZXJpY1ZpZXc7XG4gIH0pO1xufSkoKTtcbiIsIi8qXG5Db3B5cmlnaHQgMjAxMy0yMDE1IEFTSUFMIENPUlBPUkFUSU9OXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbiovXG5cbihmdW5jdGlvbigpe1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhci5tb2R1bGUoJ29uc2VuJykuZmFjdG9yeSgnQW5ndWxhckxhenlSZXBlYXREZWxlZ2F0ZScsIGZ1bmN0aW9uKCRjb21waWxlKSB7XG5cbiAgICBjb25zdCBkaXJlY3RpdmVBdHRyaWJ1dGVzID0gWydvbnMtbGF6eS1yZXBlYXQnLCAnb25zOmxhenk6cmVwZWF0JywgJ29uc19sYXp5X3JlcGVhdCcsICdkYXRhLW9ucy1sYXp5LXJlcGVhdCcsICd4LW9ucy1sYXp5LXJlcGVhdCddO1xuICAgIGNsYXNzIEFuZ3VsYXJMYXp5UmVwZWF0RGVsZWdhdGUgZXh0ZW5kcyBvbnMuX2ludGVybmFsLkxhenlSZXBlYXREZWxlZ2F0ZSB7XG4gICAgICAvKipcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSB1c2VyRGVsZWdhdGVcbiAgICAgICAqIEBwYXJhbSB7RWxlbWVudH0gdGVtcGxhdGVFbGVtZW50XG4gICAgICAgKiBAcGFyYW0ge1Njb3BlfSBwYXJlbnRTY29wZVxuICAgICAgICovXG4gICAgICBjb25zdHJ1Y3Rvcih1c2VyRGVsZWdhdGUsIHRlbXBsYXRlRWxlbWVudCwgcGFyZW50U2NvcGUpIHtcbiAgICAgICAgc3VwZXIodXNlckRlbGVnYXRlLCB0ZW1wbGF0ZUVsZW1lbnQpO1xuICAgICAgICB0aGlzLl9wYXJlbnRTY29wZSA9IHBhcmVudFNjb3BlO1xuXG4gICAgICAgIGRpcmVjdGl2ZUF0dHJpYnV0ZXMuZm9yRWFjaChhdHRyID0+IHRlbXBsYXRlRWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoYXR0cikpO1xuICAgICAgICB0aGlzLl9saW5rZXIgPSAkY29tcGlsZSh0ZW1wbGF0ZUVsZW1lbnQgPyB0ZW1wbGF0ZUVsZW1lbnQuY2xvbmVOb2RlKHRydWUpIDogbnVsbCk7XG4gICAgICB9XG5cbiAgICAgIGNvbmZpZ3VyZUl0ZW1TY29wZShpdGVtLCBzY29wZSl7XG4gICAgICAgIGlmICh0aGlzLl91c2VyRGVsZWdhdGUuY29uZmlndXJlSXRlbVNjb3BlIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgICAgICB0aGlzLl91c2VyRGVsZWdhdGUuY29uZmlndXJlSXRlbVNjb3BlKGl0ZW0sIHNjb3BlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBkZXN0cm95SXRlbVNjb3BlKGl0ZW0sIGVsZW1lbnQpe1xuICAgICAgICBpZiAodGhpcy5fdXNlckRlbGVnYXRlLmRlc3Ryb3lJdGVtU2NvcGUgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgICAgIHRoaXMuX3VzZXJEZWxlZ2F0ZS5kZXN0cm95SXRlbVNjb3BlKGl0ZW0sIGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIF91c2luZ0JpbmRpbmcoKSB7XG4gICAgICAgIGlmICh0aGlzLl91c2VyRGVsZWdhdGUuY29uZmlndXJlSXRlbVNjb3BlKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fdXNlckRlbGVnYXRlLmNyZWF0ZUl0ZW1Db250ZW50KSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdgbGF6eS1yZXBlYXRgIGRlbGVnYXRlIG9iamVjdCBpcyB2YWd1ZS4nKTtcbiAgICAgIH1cblxuICAgICAgbG9hZEl0ZW1FbGVtZW50KGluZGV4LCBkb25lKSB7XG4gICAgICAgIHRoaXMuX3ByZXBhcmVJdGVtRWxlbWVudChpbmRleCwgKHtlbGVtZW50LCBzY29wZX0pID0+IHtcbiAgICAgICAgICBkb25lKHtlbGVtZW50LCBzY29wZX0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgX3ByZXBhcmVJdGVtRWxlbWVudChpbmRleCwgZG9uZSkge1xuICAgICAgICBjb25zdCBzY29wZSA9IHRoaXMuX3BhcmVudFNjb3BlLiRuZXcoKTtcbiAgICAgICAgdGhpcy5fYWRkU3BlY2lhbFByb3BlcnRpZXMoaW5kZXgsIHNjb3BlKTtcblxuICAgICAgICBpZiAodGhpcy5fdXNpbmdCaW5kaW5nKCkpIHtcbiAgICAgICAgICB0aGlzLmNvbmZpZ3VyZUl0ZW1TY29wZShpbmRleCwgc2NvcGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbGlua2VyKHNjb3BlLCAoY2xvbmVkKSA9PiB7XG4gICAgICAgICAgbGV0IGVsZW1lbnQgPSBjbG9uZWRbMF07XG4gICAgICAgICAgaWYgKCF0aGlzLl91c2luZ0JpbmRpbmcoKSkge1xuICAgICAgICAgICAgZWxlbWVudCA9IHRoaXMuX3VzZXJEZWxlZ2F0ZS5jcmVhdGVJdGVtQ29udGVudChpbmRleCwgZWxlbWVudCk7XG4gICAgICAgICAgICAkY29tcGlsZShlbGVtZW50KShzY29wZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZG9uZSh7ZWxlbWVudCwgc2NvcGV9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gc2NvcGVcbiAgICAgICAqL1xuICAgICAgX2FkZFNwZWNpYWxQcm9wZXJ0aWVzKGksIHNjb3BlKSB7XG4gICAgICAgIGNvbnN0IGxhc3QgPSB0aGlzLmNvdW50SXRlbXMoKSAtIDE7XG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHNjb3BlLCB7XG4gICAgICAgICAgJGluZGV4OiBpLFxuICAgICAgICAgICRmaXJzdDogaSA9PT0gMCxcbiAgICAgICAgICAkbGFzdDogaSA9PT0gbGFzdCxcbiAgICAgICAgICAkbWlkZGxlOiBpICE9PSAwICYmIGkgIT09IGxhc3QsXG4gICAgICAgICAgJGV2ZW46IGkgJSAyID09PSAwLFxuICAgICAgICAgICRvZGQ6IGkgJSAyID09PSAxXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB1cGRhdGVJdGVtKGluZGV4LCBpdGVtKSB7XG4gICAgICAgIGlmICh0aGlzLl91c2luZ0JpbmRpbmcoKSkge1xuICAgICAgICAgIGl0ZW0uc2NvcGUuJGV2YWxBc3luYygoKSA9PiB0aGlzLmNvbmZpZ3VyZUl0ZW1TY29wZShpbmRleCwgaXRlbS5zY29wZSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN1cGVyLnVwZGF0ZUl0ZW0oaW5kZXgsIGl0ZW0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gaXRlbVxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IGl0ZW0uc2NvcGVcbiAgICAgICAqIEBwYXJhbSB7RWxlbWVudH0gaXRlbS5lbGVtZW50XG4gICAgICAgKi9cbiAgICAgIGRlc3Ryb3lJdGVtKGluZGV4LCBpdGVtKSB7XG4gICAgICAgIGlmICh0aGlzLl91c2luZ0JpbmRpbmcoKSkge1xuICAgICAgICAgIHRoaXMuZGVzdHJveUl0ZW1TY29wZShpbmRleCwgaXRlbS5zY29wZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3VwZXIuZGVzdHJveUl0ZW0oaW5kZXgsIGl0ZW0uZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgICAgaXRlbS5zY29wZS4kZGVzdHJveSgpO1xuICAgICAgfVxuXG4gICAgICBkZXN0cm95KCkge1xuICAgICAgICBzdXBlci5kZXN0cm95KCk7XG4gICAgICAgIHRoaXMuX3Njb3BlID0gbnVsbDtcbiAgICAgIH1cblxuICAgIH1cblxuICAgIHJldHVybiBBbmd1bGFyTGF6eVJlcGVhdERlbGVnYXRlO1xuICB9KTtcbn0pKCk7XG4iLCIvKlxuQ29weXJpZ2h0IDIwMTMtMjAxNSBBU0lBTCBDT1JQT1JBVElPTlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4qL1xuXG4oZnVuY3Rpb24oKXtcbiAgJ3VzZSBzdHJpY3QnO1xuICB2YXIgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ29uc2VuJyk7XG5cbiAgbW9kdWxlLmZhY3RvcnkoJ0xhenlSZXBlYXRWaWV3JywgZnVuY3Rpb24oQW5ndWxhckxhenlSZXBlYXREZWxlZ2F0ZSkge1xuXG4gICAgdmFyIExhenlSZXBlYXRWaWV3ID0gQ2xhc3MuZXh0ZW5kKHtcblxuICAgICAgLyoqXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gc2NvcGVcbiAgICAgICAqIEBwYXJhbSB7anFMaXRlfSBlbGVtZW50XG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAgICAgICAqL1xuICAgICAgaW5pdDogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBsaW5rZXIpIHtcbiAgICAgICAgdGhpc