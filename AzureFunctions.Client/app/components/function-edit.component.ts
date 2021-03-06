import {Component, OnInit, EventEmitter} from 'angular2/core';
import {FunctionsService} from '../services/functions.service';
import {UserService} from '../services/user.service';
import {FunctionInfo} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';
import {AceEditorDirective} from '../directives/ace-editor.directive';
import {FunctionDesignerComponent} from './function-designer.component';
import {LogStreamingComponent} from './log-streaming.component';
import {FunctionDevComponent} from './function-dev.component';
import {FunctionIntegrateComponent} from './function-integrate.component';
import {FunctionConfig} from '../models/function-config';
import {Observable, Subject} from 'rxjs/Rx';
import {FunctionSecrets} from '../models/function-secrets';
import {TabsComponent} from './tabs.component';
import {TabComponent} from './tab.component';
import {FunctionConfigureComponent} from './function-configure.component';
import {FunctionIntegrateV2Component} from './function-integrate-v2.component';
import {IBroadcastService, BroadcastEvent} from '../services/ibroadcast.service';
import {TabNames} from '../constants';
import {FunctionMonitorComponent} from './function-monitor.component'

@Component({
    selector: 'function-edit', 
    templateUrl: 'templates/function-edit.component.html',
    styleUrls: ['styles/function-edit.style.css'],
    inputs: ['selectedFunction'],
    directives: [
        FunctionDevComponent,
        FunctionIntegrateComponent,
        AceEditorDirective,
        FunctionDesignerComponent,
        LogStreamingComponent,
        TabsComponent,
        TabComponent,
        FunctionConfigureComponent,
        FunctionIntegrateV2Component,
        FunctionMonitorComponent
    ]
})
export class FunctionEditComponent {
    public selectedFunction: FunctionInfo;
    public inIFrame: boolean;
    public selectedTabTitle: string = "";
    public editorType: string = "standard";

    public DevelopTab = TabNames.develop;
    public IntegrateTab = TabNames.integrate;
    public ManageTab = TabNames.manage;

    constructor(
        private _functionsService: FunctionsService,
        private _userService: UserService,
        private _broadcastService: IBroadcastService) {

        this.inIFrame = this._userService.inIFrame;

        this._broadcastService.subscribe<FunctionInfo>(BroadcastEvent.FunctionUpdated, fi => {
            this.selectedFunction = JSON.parse(JSON.stringify(fi));
        });
    }

    onTabSelected(selectedTab: TabComponent) {
        this.selectedTabTitle = selectedTab.title;
    }

    deleteFunction() {
        var result = confirm(`Are you sure you want to delete Function: ${this.selectedFunction.name}?`);
        if (result) {
            this._functionsService.deleteFunction(this.selectedFunction)
                .subscribe(r => {
                    this._broadcastService.broadcast(BroadcastEvent.FunctionDeleted, this.selectedFunction);
                });
        }
    }

    onEditorChange(editorType: string) {
        this.editorType = editorType;
    }
}