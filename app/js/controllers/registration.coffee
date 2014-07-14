angular.module("app").controller "RegistrationController", ($scope, $modalInstance, Wallet, Shared, RpcService, Blockchain, Info, Utils, md5) ->
  $scope.symbolOptions = []
  $scope.delegate_reg_fee = Info.info.delegate_reg_fee
  $scope.priority_fee = Info.info.priority_fee
  $scope.m={}
  $scope.m.payrate=50
  $scope.m.delegate=false
  
  #this can be a dropdown instead of being hardcoded when paying for registration with multiple assets is possilbe
  $scope.symbol = 'XTS'
  
  
  refresh_accounts = ->
    $scope.accounts = []
    angular.forEach Wallet.balances, (balances, name) ->
        bals = []
        angular.forEach balances, (asset, symbol) ->
            if asset.amount
                bals.push asset
        if bals.length
            $scope.accounts.push([name, bals])

    $scope.m.payfrom= $scope.accounts[0]

  Wallet.get_accounts().then ->
    refresh_accounts()

  #TODO watch accounts

  $scope.cancel = ->
    $modalInstance.dismiss "cancel"

  $scope.ok = ->  # $scope.payWith is not in modal's scope FFS!!!
    payrate = if $scope.m.delegate then $scope.m.payrate else 255
    if $scope.account.private_data.gui_data.email
        gravatarMD5 = md5.createHash($scope.account.private_data.gui_data.email)
    else
        gravatarMD5 = ""
    console.log($scope.account.name, $scope.m.payfrom[0], {'gravatarID': gravatarMD5}, payrate)
    Wallet.wallet_account_register($scope.account.name, $scope.m.payfrom[0], {'gravatarID': gravatarMD5}, payrate).then (response) ->
      $modalInstance.close("ok")
      Wallet.pendingRegistrations[$scope.account.name]="pending"
      $scope.p.pendingRegistration = Wallet.pendingRegistrations[$scope.account.name]
      console.log('pending', Wallet.pendingRegistrations, 'loc', $scope.p.pendingRegistration)
