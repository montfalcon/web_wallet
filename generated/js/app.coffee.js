(function() {
  var app;

  app = angular.module("app", ["ngResource", "ui.router", "ui.bootstrap", "app.services", "app.directives", "ngGrid"]);

  app.config(function($stateProvider, $urlRouterProvider) {
    var blocks, contacts, createwallet, home, receive, transactions, transfer;
    $urlRouterProvider.otherwise('/home');
    home = {
      name: 'home',
      url: '/home',
      templateUrl: "home.html",
      controller: "HomeController"
    };
    receive = {
      name: 'receive',
      url: '/receive',
      templateUrl: "receive.html",
      controller: "ReceiveController"
    };
    transfer = {
      name: 'transfer',
      url: '/transfer',
      templateUrl: "transfer.html",
      controller: "TransferController"
    };
    contacts = {
      name: 'contacts',
      url: '/contacts',
      templateUrl: "contacts.html",
      controller: "ContactsController"
    };
    transactions = {
      name: 'transactions',
      url: '/transactions',
      templateUrl: "transactions.html",
      controller: "TransactionsController"
    };
    blocks = {
      name: 'blocks',
      url: '/blocks',
      templateUrl: "blocks.html",
      controller: "BlocksController"
    };
    createwallet = {
      name: 'createwallet',
      url: '/createwallet',
      templateUrl: "createwallet.html",
      controller: "CreateWalletController"
    };
    return $stateProvider.state(home).state(receive).state(transfer).state(contacts).state(transactions).state(blocks).state(createwallet);
  });

}).call(this);

(function() {
  angular.module("app").controller("BlocksController", function($scope, $location) {});

}).call(this);

(function() {
  angular.module("app").controller("ContactsController", function($scope, $location, RpcService, InfoBarService) {
    $scope.myData = [];
    $scope.filterOptions = {
      filterText: ""
    };
    $scope.gridOptions = {
      enableRowSelection: false,
      enableCellSelection: false,
      enableCellEdit: false,
      data: "myData",
      filterOptions: $scope.filterOptions,
      columnDefs: [
        {
          field: "Label",
          width: 80,
          enableCellEdit: true
        }, {
          field: "Address",
          enableCellEdit: false
        }, {
          displayName: "",
          enableCellEdit: false,
          width: 100,
          cellTemplate: "<div class='text-center' style='margin-top:4px'><button title='Copy' class='btn btn-xs btn-link' onclick=\"alert('You clicked  {{row.entity}} ')\"><i class='fa fa-lg fa-copy fa-fw'></i></button><button title='Send' class='btn btn-xs btn-link' onclick=\"alert('You clicked  {{row.entity}} ')\"><i class='fa fa-lg fa-sign-in fa-fw'></i></button><button title='Delete' class='btn btn-xs btn-link' onclick=\"alert('You clicked  {{row.entity}} ')\"><i style='color:#d14' class='fa fa-lg fa-times fa-fw'></i></button></div>",
          headerCellTemplate: "<div class='text-center' style='background:none; margin-top:2px'><i class='fa fa-wrench fa-fw fa-2x'></i></div>"
        }
      ]
    };
    $scope.filterNephi = function() {
      var filterText;
      filterText = "name:Nephi";
      if ($scope.filterOptions.filterText === "") {
        $scope.filterOptions.filterText = filterText;
      } else {
        if ($scope.filterOptions.filterText === filterText) {
          $scope.filterOptions.filterText = "";
        }
      }
    };
    $scope.refresh_addresses = function() {
      return RpcService.request("wallet_list_receive_accounts").then(function(response) {
        var data, i, newData;
        newData = [];
        data = response.result;
        i = 0;
        while (i < data.length) {
          newData.push({
            Label: data[i][0],
            Address: data[i][1]
          });
          i++;
        }
        $scope.myData = newData;
        return InfoBarService.message = "Click labels to edit";
      });
    };
    return $scope.refresh_addresses();
  });

}).call(this);

(function() {
  angular.module("app").controller("CreateWalletController", function($scope, $modal, $log, RpcService, ErrorService, Wallet) {
    return $scope.submitForm = function(isValid) {
      if (isValid) {
        return Wallet.create($scope.wallet_password, $scope.spending_password).success(function() {
          return window.location.href = "/";
        });
      } else {
        ErrorService.set("Please fill up the form below");
      }
    };
  });

}).call(this);

(function() {
  angular.module("app").controller("FooterController", function($scope, Wallet) {
    var on_update, watch_for;
    $scope.connections = 0;
    watch_for = function() {
      return Wallet.info;
    };
    on_update = function(info) {
      var connections;
      connections = info.network_connections;
      $scope.connections = connections;
      if (connections === 0) {
        $scope.connections_str = "Not connected to the network";
      } else if (connections === 1) {
        $scope.connections_str = "1 network connection";
      } else {
        $scope.connections_str = "" + connections + " network connections";
      }
      if (connections < 4) {
        $scope.connections_img = "/img/signal_" + connections + ".png";
      } else {
        $scope.connections_img = "/img/signal_4.png";
      }
      return $scope.wallet_open = info.wallet_open;
    };
    return $scope.$watch(watch_for, on_update, true);
  });

}).call(this);

(function() {
  angular.module("app").controller("HomeController", function($scope, $modal, $log, RpcService, Wallet) {
    var format_amount, fromat_address, load_transactions, on_update, watch_for;
    $scope.transactions = [];
    $scope.balance_amount = 0.0;
    $scope.balance_asset_type = '';
    watch_for = function() {
      return Wallet.info;
    };
    on_update = function(info) {
      if (info.wallet_open) {
        return $scope.balance_amount = info.balance;
      }
    };
    $scope.$watch(watch_for, on_update, true);
    fromat_address = function(addr) {
      var res;
      if (!addr || addr.length === 0) {
        return "-";
      }
      res = "";
      angular.forEach(addr, function(a) {
        if (res.length > 0) {
          res += ", ";
        }
        return res += a[1];
      });
      return res;
    };
    format_amount = function(delta_balance) {
      var first_asset;
      if (!delta_balance || delta_balance.length === 0) {
        return "-";
      }
      first_asset = delta_balance[0];
      if (!first_asset || first_asset.length < 2) {
        return "-";
      }
      return first_asset[1];
    };
    load_transactions = function() {
      return RpcService.request("wallet_get_transaction_history").then(function(response) {
        var count;
        $scope.transactions.splice(0, $scope.transactions.length);
        count = 0;
        return angular.forEach(response.result, function(val) {
          count += 1;
          if (count < 10) {
            return $scope.transactions.push({
              block_num: val.block_num,
              trx_num: val.trx_num,
              time: val.confirm_time,
              amount: format_amount(val.delta_balance),
              from: fromat_address(val.from),
              to: fromat_address(val.to),
              memo: val.memo
            });
          }
        });
      });
    };
    return Wallet.get_balance().then(function(balance) {
      $scope.balance_amount = balance.amount;
      $scope.balance_asset_type = balance.asset_type;
      return load_transactions();
    });
  });

}).call(this);

(function() {
  angular.module("app").controller("OpenWalletController", function($scope, $modalInstance, RpcService, mode) {
    var open_wallet_request, unlock_wallet_request;
    console.log("OpenWalletController mode: " + mode);
    if (mode === "open_wallet") {
      $scope.title = "Open Wallet";
      $scope.password_label = "Wallet Password";
      $scope.wrong_password_msg = "Wallet cannot be opened. Please check you password";
    } else if (mode === "unlock_wallet") {
      $scope.title = "Unlock Wallet";
      $scope.password_label = "Spending Password";
      $scope.wrong_password_msg = "Wallet cannot be unlocked. Please check you password";
    }
    open_wallet_request = function() {
      return RpcService.request('wallet_open', ['default', $scope.password]).then(function(response) {
        if (response.result) {
          $modalInstance.close("ok");
          return $scope.cur_deferred.resolve();
        } else {
          $scope.password_validation_error();
          return $scope.cur_deferred.resolve("invalid password");
        }
      }, function(reason) {
        $scope.password_validation_error();
        return $scope.cur_deferred.reject(reason);
      });
    };
    unlock_wallet_request = function() {
      return RpcService.request('wallet_unlock', [1000000, $scope.password]).then(function(response) {
        $modalInstance.close("ok");
        return $scope.cur_deferred.resolve();
      }, function(reason) {
        $scope.password_validation_error();
        return $scope.cur_deferred.reject(reason);
      });
    };
    $scope.has_error = false;
    $scope.ok = function() {
      if (mode === "open_wallet") {
        return open_wallet_request();
      } else {
        return unlock_wallet_request();
      }
    };
    $scope.password_validation_error = function() {
      $scope.password = "";
      return $scope.has_error = true;
    };
    $scope.cancel = function() {
      return $modalInstance.dismiss("cancel");
    };
    return $scope.$watch("password", function(newValue, oldValue) {
      if (newValue !== "") {
        return $scope.has_error = false;
      }
    });
  });

}).call(this);

(function() {
  angular.module("app").controller("ReceiveController", function($scope, $location, RpcService, InfoBarService) {
    var refresh_addresses;
    $scope.new_address_label = "";
    $scope.addresses = [];
    $scope.pk_label = "";
    $scope.pk_value = "";
    $scope.wallet_file = "";
    $scope.wallet_password = "";
    refresh_addresses = function() {
      return RpcService.request('wallet_list_receive_accounts').then(function(response) {
        $scope.addresses.splice(0, $scope.addresses.length);
        return angular.forEach(response.result, function(val) {
          return $scope.addresses.push({
            label: val[0],
            address: val[1]
          });
        });
      });
    };
    refresh_addresses();
    $scope.create_address = function() {
      return RpcService.request('wallet_create_receive_account', [$scope.new_address_label]).then(function(response) {
        $scope.new_address_label = "";
        return refresh_addresses();
      });
    };
    $scope.import_key = function() {
      return RpcService.request('wallet_import_private_key', [$scope.pk_value, $scope.pk_label]).then(function(response) {
        $scope.pk_value = "";
        $scope.pk_label = "";
        InfoBarService.message = "Your private key was successfully imported.";
        return refresh_addresses();
      });
    };
    return $scope.import_wallet = function() {
      return RpcService.request('wallet_import_bitcoin', [$scope.wallet_file, $scope.wallet_password]).then(function(response) {
        $scope.wallet_file = "";
        $scope.wallet_password = "";
        InfoBarService.message = "The wallet was successfully imported.";
        return refresh_addresses();
      });
    };
  });

}).call(this);

(function() {
  angular.module("app").controller("RootController", function($scope, $location, $modal, $q, $http, $rootScope, ErrorService, InfoBarService) {
    var open_wallet;
    $scope.errorService = ErrorService;
    $scope.infoBarService = InfoBarService;
    open_wallet = function(mode) {
      $rootScope.cur_deferred = $q.defer();
      $modal.open({
        templateUrl: "openwallet.html",
        controller: "OpenWalletController",
        resolve: {
          mode: function() {
            return mode;
          }
        }
      });
      return $rootScope.cur_deferred.promise;
    };
    $rootScope.open_wallet_and_repeat_request = function(mode, request_data) {
      var deferred_request;
      deferred_request = $q.defer();
      open_wallet(mode).then(function() {
        return $http({
          method: "POST",
          cache: false,
          url: '/rpc',
          data: request_data
        }).success(function(data, status, headers, config) {
          return deferred_request.resolve(data);
        }).error(function(data, status, headers, config) {
          return deferred_request.reject();
        });
      });
      return deferred_request.promise;
    };
    return $scope.wallet_action = function(mode) {
      return open_wallet(mode);
    };
  });

}).call(this);

(function() {
  angular.module("app").controller("TransactionsController", function($scope, $location, RpcService) {
    var format_amount, fromat_address;
    $scope.transactions = [];
    fromat_address = function(addr) {
      var res;
      if (!addr || addr.length === 0) {
        return "-";
      }
      res = "";
      angular.forEach(addr, function(a) {
        if (res.length > 0) {
          res += ", ";
        }
        return res += a[1];
      });
      return res;
    };
    format_amount = function(delta_balance) {
      var first_asset;
      if (!delta_balance || delta_balance.length === 0) {
        return "-";
      }
      first_asset = delta_balance[0];
      if (!first_asset || first_asset.length < 2) {
        return "-";
      }
      return first_asset[1];
    };
    $scope.load_transactions = function() {
      return RpcService.request("wallet_rescan_blockchain_state").then(function(response) {
        return RpcService.request("wallet_get_transaction_history").then(function(response) {
          $scope.transactions.splice(0, $scope.transactions.length);
          return angular.forEach(response.result, function(val) {
            return $scope.transactions.push({
              block_num: val.location.block_num,
              trx_num: val.location.trx_num,
              time: val.received,
              amount: val.trx.operations[0].data.amount,
              from: val.trx.operations[0].data.balance_id.slice(-32),
              to: val.trx.operations[1].data.condition.data.owner.slice(-32),
              memo: val.memo
            });
          });
        });
      });
    };
    $scope.load_transactions();
    return $scope.rescan = function() {
      return $scope.load_transactions();
    };
  });

}).call(this);

(function() {
  angular.module("app").controller("TransferController", function($scope, $location, $state, RpcService, InfoBarService) {
    return $scope.send = function() {
      return RpcService.request('wallet_transfer', [
        $scope.amount, $scope.payto, {
          "to_account": $scope.payto
        }
      ]).then(function(response) {
        $scope.payto = "";
        $scope.amount = "";
        $scope.memo = "";
        return InfoBarService.message = "Transaction broadcasted (" + response.result + ")";
      });
    };
  });

}).call(this);

(function() {
  angular.module("app.directives", []).directive("errorBar", function($parse) {
    return {
      restrict: "A",
      template: "<div class=\"alert alert-danger\">\n  <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-hidden=\"true\" ng-click=\"hideErrorBar()\" >×</button>\n  <i class=\"fa fa-exclamation-circle\"></i>\n  {{errorMessage}}\n </div> ",
      link: function(scope, elem, attrs) {
        var errorMessageAttr;
        errorMessageAttr = attrs["errormessage"];
        scope.errorMessage = null;
        scope.$watch(errorMessageAttr, function(newVal) {
          scope.errorMessage = newVal;
          return scope.isErrorBarHidden = !newVal;
        });
        return scope.hideErrorBar = function() {
          scope.errorMessage = null;
          $parse(errorMessageAttr).assign(scope, null);
          return scope.isErrorBarHidden = true;
        };
      }
    };
  });

  angular.module("app.directives").directive("infoBar", function($parse) {
    return {
      restrict: "A",
      template: "<div class=\"alert alert-success\">\n  <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-hidden=\"true\" ng-click=\"hideInfoBar()\" >×</button>\n  <i class=\"fa fa-check-circle\"></i>\n  {{infoMessage}}\n </div> ",
      link: function(scope, elem, attrs) {
        var infoMessageAttr;
        infoMessageAttr = attrs["infomessage"];
        scope.infoMessage = null;
        scope.$watch(infoMessageAttr, function(newVal) {
          scope.infoMessage = newVal;
          return scope.isInfoBarHidden = !newVal;
        });
        return scope.hideInfoBar = function() {
          scope.infoMessage = null;
          $parse(infoMessageAttr).assign(scope, null);
          return scope.isInfoBarHidden = true;
        };
      }
    };
  });

}).call(this);

(function() {
  angular.module("app.directives").directive("focusMe", function($timeout) {
    return {
      scope: {
        trigger: "@focusMe"
      },
      link: function(scope, element) {
        return scope.$watch("trigger", function() {
          return $timeout(function() {
            return element[0].focus();
          });
        });
      }
    };
  });

  angular.module("app.directives").directive("match", function() {
    return {
      require: "ngModel",
      restrict: "A",
      scope: {
        match: "="
      },
      link: function(scope, elem, attrs, ctrl) {
        return scope.$watch((function() {
          return (ctrl.$pristine && angular.isUndefined(ctrl.$modelValue)) || scope.match === ctrl.$modelValue;
        }), function(currentValue) {
          return ctrl.$setValidity("match", currentValue);
        });
      }
    };
  });

}).call(this);

(function() {
  var servicesModule;

  servicesModule = angular.module("app.services", []);

  servicesModule.factory("ErrorService", function(InfoBarService) {
    return {
      errorMessage: null,
      set: function(msg) {
        this.errorMessage = msg;
        if (msg) {
          return InfoBarService.message = null;
        }
      },
      clear: function() {
        return this.errorMessage = null;
      }
    };
  });

  servicesModule.config(function($httpProvider) {
    return $httpProvider.interceptors.push('myHttpInterceptor');
  });

  servicesModule.factory("myHttpInterceptor", function($q, $rootScope, ErrorService) {
    var dont_report_methods;
    dont_report_methods = ["open_wallet", "walletpassphrase"];
    return {
      responseError: function(response) {
        var error_msg, method, method_in_dont_report_list, promise, title, _ref, _ref1, _ref2;
        promise = null;
        method = null;
        error_msg = ((_ref = response.data) != null ? (_ref1 = _ref.error) != null ? _ref1.message : void 0 : void 0) != null ? response.data.error.message : response.data;
        if ((response.config != null) && response.config.url.match(/\/rpc$/)) {
          if (error_msg.match(/check_wallet_is_open/)) {
            promise = $rootScope.open_wallet_and_repeat_request("open_wallet", response.config.data);
          }
          if (error_msg.match(/wallet must be unlocked/)) {
            promise = $rootScope.open_wallet_and_repeat_request("unlock_wallet", response.config.data);
          }
          method = (_ref2 = response.config.data) != null ? _ref2.method : void 0;
          title = method ? "RPC error calling " + method : "RPC error";
          error_msg = "" + title + ": " + error_msg;
        } else {
          error_msg = "HTTP Error: " + error_msg;
        }
        console.log("" + (error_msg.substring(0, 512)) + " (" + response.status + ")", response);
        method_in_dont_report_list = method && (dont_report_methods.filter(function(x) {
          return x === method;
        })).length > 0;
        if (!promise && !method_in_dont_report_list) {
          ErrorService.set("" + (error_msg.substring(0, 512)) + " (" + response.status + ")");
        }
        return (promise ? promise : $q.reject(response));
      }
    };
  });

}).call(this);

(function() {
  var servicesModule;

  servicesModule = angular.module("app.services");

  servicesModule.factory("InfoBarService", function() {
    return {
      message: null,
      setMessage: function(msg) {
        return this.message = msg;
      },
      clear: function() {
        return this.message = null;
      }
    };
  });

}).call(this);

(function() {
  var servicesModule;

  servicesModule = angular.module("app.services");

  servicesModule.factory("RpcService", function($http, ErrorService) {
    var RpcService;
    return RpcService = {
      request: function(method, params) {
        var http_params, reqparams;
        reqparams = {
          method: method,
          params: params || []
        };
        ErrorService.clear();
        http_params = {
          method: "POST",
          cache: false,
          url: '/rpc',
          data: {
            jsonrpc: "2.0",
            id: 1
          }
        };
        angular.extend(http_params.data, reqparams);
        return $http(http_params).then(function(response) {
          console.log("RpcService <" + http_params.data.method + "> response:", response);
          return response.data || response;
        });
      }
    };
  });

}).call(this);

(function() {
  var Wallet,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Wallet = (function() {
    function Wallet(q, log, rpc, error_service, interval) {
      this.q = q;
      this.log = log;
      this.rpc = rpc;
      this.error_service = error_service;
      this.interval = interval;
      this.watch_for_updates = __bind(this.watch_for_updates, this);
      this.log.info("---- Wallet Constructor ----");
      this.wallet_name = "";
      this.info = {
        network_connections: 0,
        balance: 0,
        wallet_open: false
      };
      this.watch_for_updates();
    }

    Wallet.prototype.create = function(wallet_password, spending_password) {
      var _this = this;
      return this.rpc.request('wallet_create', ['default', wallet_password]).then(function(response) {
        var error;
        if (response.result === true) {
          return true;
        } else {
          error = "Cannot create wallet, the wallet may already exist";
          _this.error_service.set(error);
          return _this.q.reject(error);
        }
      });
    };

    Wallet.prototype.get_balance = function() {
      return this.rpc.request('wallet_get_balance').then(function(response) {
        var asset;
        asset = response.result[0];
        return {
          amount: asset[0],
          asset_type: asset[1]
        };
      });
    };

    Wallet.prototype.get_wallet_name = function() {
      var _this = this;
      return this.rpc.request('wallet_get_name').then(function(response) {
        _this.wallet_name = response.result;
        return console.log("---- current wallet name: ", response.result);
      });
    };

    Wallet.prototype.get_info = function() {
      return this.rpc.request('get_info').then(function(response) {
        return response.result;
      });
    };

    Wallet.prototype.watch_for_updates = function() {
      var _this = this;
      return this.interval((function() {
        return _this.get_info().then(function(info) {
          _this.info.network_connections = info.network_num_connections;
          _this.info.balance = info.wallet_balance;
          _this.info.wallet_open = info.wallet_open;
          return _this.log.info("+++ intervalFunction", _this.info);
        });
      }), 5000);
    };

    return Wallet;

  })();

  angular.module("app").service("Wallet", ["$q", "$log", "RpcService", "ErrorService", "$interval", Wallet]);

}).call(this);