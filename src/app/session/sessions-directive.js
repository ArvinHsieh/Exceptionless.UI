(function () {
  'use strict';

  angular.module('app.session')
    .directive('sessions', function (linkService) {
      return {
        bindToController: true,
        restrict: 'E',
        replace: true,
        scope: {
          settings: '='
        },
        templateUrl: 'app/session/sessions-directive.tpl.html',
        controller: ['$ExceptionlessClient', '$window', '$state', '$stateParams', 'linkService', 'filterService', 'notificationService', 'paginationService', function ($ExceptionlessClient, $window, $state, $stateParams, linkService, filterService, notificationService, paginationService) {
          var vm = this;
          var source = vm.settings.source + '.sessions';

          function canRefresh(data) {
            if (!!data && data.type === 'PersistentEvent') {
              // We are already listening to the stack changed event... This prevents a double refresh.
              if (!data.deleted) {
                return false;
              }

              // Refresh if the event id is set (non bulk) and the deleted event matches one of the events.
              if (!!data.id && !!vm.events) {
                return vm.events.filter(function (e) { return e.id === data.id; }).length > 0;
              }

              return filterService.includedInProjectOrOrganizationFilter({ organizationId: data.organization_id, projectId: data.project_id });
            }

            if (!!data && data.type === 'Stack') {
              return filterService.includedInProjectOrOrganizationFilter({ organizationId: data.organization_id, projectId: data.project_id });
            }

            return true;
          }

          function get(options) {
            function onSuccess(response) {
              vm.events = response.data.plain();

              var links = linkService.getLinksQueryParameters(response.headers('link'));
              vm.previous = links['previous'];
              vm.next = links['next'];

              vm.pageSummary = paginationService.getCurrentPageSummary(response.data, vm.currentOptions.page, vm.currentOptions.limit);

              if (vm.events.length === 0 && vm.currentOptions.page && vm.currentOptions.page > 1) {
                return get();
              }

              return vm.events;
            }

            vm.loading = vm.events.length === 0;
            vm.currentOptions = options || vm.settings.options;
            return vm.settings.get(vm.currentOptions).then(onSuccess).finally(function() {
              vm.loading = false;
            });
          }

          function getDuration(ev) {
            if (ev.data.SessionEnd) {
              return ev.data.Value || 0;
            }

            return moment().diff(ev.date, 'seconds');
          }

          function hasEvents() {
            return vm.events && vm.events.length > 0;
          }

          function open(id, event) {
            var openInNewTab = (event.ctrlKey || event.metaKey || event.which === 2);
            $ExceptionlessClient.createFeatureUsage(source + '.open').setProperty('id', id).setProperty('_blank', openInNewTab).submit();
            if (openInNewTab) {
              $window.open($state.href('app.event', { id: id }, { absolute: true }), '_blank');
            } else {
              $state.go('app.event', { id: id });
            }

            event.preventDefault();
          }

          function nextPage() {
            $ExceptionlessClient.createFeatureUsage(source + '.nextPage').setProperty('next', vm.next).submit();
            return get(vm.next);
          }

          function previousPage() {
            $ExceptionlessClient.createFeatureUsage(source + '.previousPage').setProperty('previous', vm.previous).submit();
            return get(vm.previous);
          }

          vm.canRefresh = canRefresh;
          vm.events = [];
          vm.get = get;
          vm.getDuration = getDuration;
          vm.hasEvents = hasEvents;
          vm.hasFilter = filterService.hasFilter;
          vm.loading = true;
          vm.open = open;
          vm.nextPage = nextPage;
          vm.previousPage = previousPage;
          vm.showType = vm.settings.summary ? vm.settings.summary.showType : !filterService.getEventType();
          get();
        }],
        controllerAs: 'vm'
      };
    });
}());
