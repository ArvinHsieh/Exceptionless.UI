﻿(function () {
  'use strict';

  angular.module('exceptionless.stacks')
    .factory('stacksActionsService', ['dialogService', 'stackService', 'notificationService', function (dialogService, stackService, notificationService) {
      var deleteAction = {
        name: 'Delete',
        run: function (ids) {
          return dialogService.confirmDanger('Are you sure you want to delete these stacks?', 'DELETE STACKS').then(function () {
            function onSuccess() {
              notificationService.success('Successfully deleted the stacks.');
            }

            function onFailure() {
              notificationService.error('An error occurred while deleting the stacks.');
            }

            return stackService.remove(ids.join(',')).then(onSuccess, onFailure);
          });
        }
      };

      var markFixedAction = {
        name: 'Mark Fixed',
        run: function (ids) {
          function onSuccess() {
            notificationService.success('Successfully marked stacks as fixed.');
          }

          function onFailure() {
            notificationService.error('An error occurred while marking stacks as fixed.');
          }

          return stackService.markFixed(ids.join(',')).then(onSuccess, onFailure);
        }
      };

      var markNotFixedAction = {
        name: 'Mark Not Fixed',
        run: function (ids) {
          function onSuccess() {
            notificationService.success('Successfully marked stacks as not fixed.');
          }

          function onFailure() {
            notificationService.error('An error occurred while marking stacks as not fixed.');
          }

          return stackService.markNotFixed(ids.join(',')).then(onSuccess, onFailure);
        }
      };

      var markHiddenAction = {
        name: 'Mark Hidden',
        run: function (ids) {
          function onSuccess() {
            notificationService.success('Successfully marked stacks as hidden.');
          }

          function onFailure() {
            notificationService.error('An error occurred while marking stacks as hidden.');
          }

          return stackService.markHidden(ids.join(',')).then(onSuccess, onFailure);
        }
      };

      var markNotHiddenAction = {
        name: 'Mark Not Hidden',
        run: function (ids) {
          function onSuccess() {
            notificationService.success('Successfully marked stacks as not hidden.');
          }

          function onFailure() {
            notificationService.error('An error occurred while marking stacks as not hidden.');
          }

          return stackService.markNotHidden(ids.join(',')).then(onSuccess, onFailure);
        }
      };

      function getActions() {
        return [markFixedAction, markNotFixedAction, markHiddenAction, markNotHiddenAction, deleteAction];
      }

      var service = {
        getActions: getActions
      };

      return service;
    }]);
}());
