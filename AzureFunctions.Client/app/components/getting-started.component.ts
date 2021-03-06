﻿import {Component, Input, Output, EventEmitter, OnInit, OnChanges} from 'angular2/core';
import {UserService} from '../services/user.service';
import {FunctionsService} from '../services/functions.service';
import {BroadcastEvent, IBroadcastService} from '../services/ibroadcast.service';
import {User} from '../models/user';
import {Subscription} from '../models/subscription';
import {DropDownElement} from '../models/drop-down-element';
import {DropDownComponent} from './drop-down.component';
import {TopBarComponent} from './top-bar.component';
import {ArmService} from '../services/arm.service';
import {FunctionContainer} from '../models/function-container';

@Component({
    selector: 'getting-started',
    templateUrl: 'templates/getting-started.component.html',
    styleUrls: ['styles/getting-started.style.css'],
    directives: [DropDownComponent, TopBarComponent]
})
export class GettingStartedComponent implements OnInit {
    @Output() userReady: EventEmitter<FunctionContainer>;

    public tryItNow: boolean;
    public geoRegions: DropDownElement<string>[];
    public subscriptions: DropDownElement<Subscription>[];
    public selectedSubscription: Subscription;
    public selectedGeoRegion: string;
    public functionContainers: FunctionContainer[];
    public functionContainerName: string;
    public createError: string;

    public user: User;

    private tryAppServiceTenantId: string = "6224bcc1-1690-4d04-b905-92265f948dad";

    constructor(
        private _userService: UserService,
        private _functionsService: FunctionsService,
        private _broadcastService: IBroadcastService,
        private _armService: ArmService
    ) {
        //http://stackoverflow.com/a/8084248/3234163
        var secret = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        this.functionContainerName = `functions${this.makeId()}`;
        this.functionContainers = [];
        this.userReady = new EventEmitter<FunctionContainer>();
        this.geoRegions = ['West US']
            .map(e => ({ displayLabel: e, value: e }))
            .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));
    }

    ngOnInit() {
        this._broadcastService.setBusyState();

        this._userService.getUser()
            .subscribe(u => this.user = u);

        this._userService.getTenants()
            .subscribe(tenants => {
                this._broadcastService.clearBusyState();
                if (tenants.filter(e => e.TenantId.toLocaleLowerCase() !== this.tryAppServiceTenantId).length === 0) {
                    this.tryItNow = true;
                } else {
                    this.tryItNow = false;
                    this._broadcastService.setBusyState();
                    this._armService.getSubscriptions()
                        .subscribe(subs => {
                            this.subscriptions = subs
                                .map(e => ({ displayLabel: e.displayName, value: e }))
                                .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));
                            this._broadcastService.clearBusyState();
                        });
                }
            });

    }

    createTrialFunctionsContainer() {
        this._broadcastService.setBusyState();
        this._functionsService.createTrialFunctionsContainer()
            .subscribe(r => this.switchToTryAppServiceTenant(), undefined, () => this._broadcastService.clearBusyState());
    }

    switchToTryAppServiceTenant() {
        window.location.href = `api/switchtenants/${this.tryAppServiceTenantId}${window.location.search}`;
    }

    createFunctionsContainer() {
        delete this.createError;
        this._broadcastService.setBusyState();

        this._armService.createFunctionContainer(this.selectedSubscription.subscriptionId, this.selectedGeoRegion, this.functionContainerName)
            .subscribe(r => this.userReady.emit(r), e => {
                if (e._body) {
                    var body = JSON.parse(e._body);
                    this.createError = body.error && body.error.message ? body.error.message : JSON.stringify(body);
                    this._broadcastService.clearBusyState();
                }
            } , () => this._broadcastService.clearBusyState());
    }

    onSubscriptionSelect(value: Subscription) {
        this._broadcastService.setBusyState();
        this._armService.getFunctionContainers(value.subscriptionId)
            .subscribe(fc => {
                this.selectedSubscription = value;
                this.functionContainers = fc;
                this._broadcastService.clearBusyState();
            });
    }

    onGeoRegionChange(value: string) {
        this.selectedGeoRegion = value;
    }

    login() {
        window.location.replace(`${window.location.protocol}//${window.location.hostname}/signin${window.location.search}`);
    }

    selectContainer(container: FunctionContainer) {
        this.userReady.emit(container);
    }

    // http://stackoverflow.com/a/1349426/3234163
    makeId() {
        var text = '';
        var possible = 'abcdef123456789';

        for (var i = 0; i < 8; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }
}