import {Component, OnInit} from 'angular2/core';
import {DashboardComponent} from './dashboard.component';
import {GettingStartedComponent} from './getting-started.component';
import {PortalService} from '../services/portal.service';
import {FunctionsService} from '../services/functions.service';
import {BroadcastEvent, IBroadcastService} from '../services/ibroadcast.service';
import {BusyStateComponent} from './busy-state.component';
import {ArmService} from '../services/arm.service';
import {FunctionContainer} from '../models/function-container';
import {UserService} from '../services/user.service';
import {Observable} from 'rxjs/Rx';

@Component({
    selector: 'azure-functions-app',
    template: `<busy-state></busy-state>
<functions-dashboard *ngIf="!gettingStarted && ready" [functionContainer]="functionContainer"></functions-dashboard>
<getting-started *ngIf="gettingStarted && ready" (userReady)="initializeDashboard($event)"></getting-started>`,
    directives: [BusyStateComponent, DashboardComponent, GettingStartedComponent]
})
export class AppComponent implements OnInit {
    public gettingStarted: boolean;
    public ready: boolean;
    public functionContainer: FunctionContainer;

    constructor(
        private _portalService: PortalService,
        private _functionsService: FunctionsService,
        private _broadcastService: IBroadcastService,
        private _armService: ArmService,
        private _userService: UserService
    ) {
        this.ready = false;
        if (_userService.inIFrame ||
            window.location.protocol === 'http:') {
            this.gettingStarted = false;
            return;
        } else {
            this.gettingStarted = true;
        }
    }

    ngOnInit() {
        this._broadcastService.setBusyState();

        if (!this.gettingStarted) {
            if (this._userService.inIFrame) {
                Observable.zip(this._userService.getToken(), this._portalService.getResourceId(), (t, r) => r)
                    .subscribe((res: string) => this.initializeDashboard(res));
            } else {
                // Initialize for mocked data
            }
        } else {
            this._userService.getToken()
                .subscribe(t => {
                    this.ready = true;
                    // TODO: Initialize token for all services.
                    this._broadcastService.clearBusyState();
                });
        }
    }

    initializeDashboard(functionContainer: FunctionContainer | string) {
        if (this.redirectToIbizaIfNeeded(functionContainer)) return;

        if (typeof functionContainer !== 'string') {
            if (functionContainer.properties &&
                functionContainer.properties.hostNameSslStates) {

                this._functionsService.setFunctionContainer(functionContainer);
                this.gettingStarted = false;
                this._broadcastService.clearBusyState();
                this.ready = true;
                this.functionContainer = functionContainer;
            } else {
                this._broadcastService.setBusyState();
                this._armService.getFunctionContainer(functionContainer.id).subscribe(fc => this.initializeDashboard(fc));
            }
        } else {
                this._broadcastService.setBusyState();
            this._armService.getFunctionContainer(functionContainer).subscribe(fc => this.initializeDashboard(fc));
        }

    }

    private redirectToIbizaIfNeeded(functionContainer: FunctionContainer | string): boolean {
        if (!this._userService.inIFrame &&
            window.location.hostname !== "localhost" &&
            window.location.search.indexOf("ibiza=disabled") === -1) {
            var armId = typeof functionContainer === 'string' ? functionContainer : functionContainer.id;
            this._userService.getTenants()
                .subscribe(tenants => {
                    var currentTenant = tenants.find(t => t.Current);
                    var portalHostName = 'https://portal.azure.com';
                    var query = `?feature.canmodifystamps=true&BizTalkExtension=canary&Microsoft_Azure_Microservices=canary&WebsitesExtension=canary&ClearDBExtension=canary&websitesextension_cloneapp=true&HubsExtension_ItemHideKey=GalleryApplicationTesting`;
                    var environment = window.location.host.indexOf('staging') === -1
                        ? '&websitesextension_functions=true' // production
                        : '&websitesextension_functionsstaged=true'; // staging
                    window.location.replace(`${portalHostName}/${currentTenant.DomainName}${query}${environment}#resource${armId}`);
                });
            return true;
        } else {
            return false;
        }
    }
}