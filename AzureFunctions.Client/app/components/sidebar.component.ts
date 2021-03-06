import {Component, OnInit, EventEmitter, OnDestroy} from 'angular2/core';
import {FunctionsService} from '.././services/functions.service';
import {FunctionInfo} from '../models/function-info';
import {FunctionConfig} from '../models/function-config';
import {VfsObject} from '../models/vfs-object';
import {Observable, Subscription, Subject} from 'rxjs/Rx';
import {UserService} from '../services/user.service';
import {IBroadcastService, BroadcastEvent} from '../services/ibroadcast.service';
import {SideBarFilterPipe} from '../pipes/sidebar.pipe';
import {TutorialEvent, TutorialStep} from '../models/tutorial';

@Component({
    selector: 'sidebar',
    templateUrl: 'templates/sidebar.component.html',
    styleUrls: [ 'styles/sidebar.style.css' ],
    inputs: ['functionsInfo'],
    pipes: [SideBarFilterPipe]
})
export class SideBarComponent implements OnDestroy {
    public functionsInfo: FunctionInfo[];
    public selectedFunction: FunctionInfo;
    public inIFrame: boolean;
    private subscriptions: Subscription[];

    constructor(private _functionsService: FunctionsService,
                private _userService: UserService,
                private _broadcastService: IBroadcastService) {

        this.subscriptions = [];
        this.inIFrame = this._userService.inIFrame;

        this.subscriptions.push(this._broadcastService.subscribe<FunctionInfo>(BroadcastEvent.FunctionDeleted, fi => {
            if (this.selectedFunction === fi) delete this.selectedFunction;
            for (var i = 0; this.functionsInfo.length; i++) {
                if (this.functionsInfo[i] === fi) {
                    this.functionsInfo.splice(i, 1);
                    break;
                }
            }
        }));

        this.subscriptions.push(this._broadcastService.subscribe<FunctionInfo>(BroadcastEvent.FunctionAdded, fi => {
            this.functionsInfo.push(fi);
            this.functionsInfo.sort();
            this.selectFunction(fi);
        }));

        this._broadcastService.subscribe<TutorialEvent>(BroadcastEvent.TutorialStep, (event) => {
            if(event.step === TutorialStep.NextSteps){
                let selectedFi = this.functionsInfo.find(fi => fi === event.functionInfo);
                this.selectFunction(selectedFi);
            }
        });
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    selectFunction(fi: FunctionInfo) {
        var switchFunction = true;
        if (this._broadcastService.getDirtyState('function') || this._broadcastService.getDirtyState('function_integrate')) {
            switchFunction = confirm(`Changes made to function ${this.selectedFunction.name} will be lost. Are you sure you want to continue?`);
        }

        if (switchFunction) {
            this._broadcastService.clearDirtyState('function', true);
            this._broadcastService.clearDirtyState('function_integrate', true);
            this.selectedFunction = fi;
            this._broadcastService.broadcast(BroadcastEvent.FunctionSelected, fi);
        }
    }
}