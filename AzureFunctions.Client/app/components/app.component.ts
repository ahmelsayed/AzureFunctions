import {Component, OnInit} from 'angular2/core';
import {SideBarComponent} from './sidebar.component';
import {TopBarComponent} from './top-bar.component';
import {NewFunctionComponent} from './new-function.component';
import {FunctionEditComponent} from './function-edit.component';
import {LogStreamingComponent} from './log-streaming.component';
import {FunctionsService} from '../services/functions.service';
import {FunctionInfo} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';
import {FunctionTemplate} from '../models/function-template';
import {ScmInfo} from '../models/scm-info';


@Component({
    selector: 'azure-functions-app',
    templateUrl: 'templates/app.html',
    directives: [SideBarComponent, TopBarComponent, NewFunctionComponent, FunctionEditComponent, LogStreamingComponent]
})
export class AppComponent implements OnInit{
    public functionsInfo: FunctionInfo[];
    public functionTemplates: FunctionTemplate[];
    public selectedFunction: FunctionInfo;
    public deleteSelectedFunction: boolean;
    public addedFunction: FunctionInfo;
    private initializing: boolean;

    constructor(private _functionsService: FunctionsService) { }

    ngOnInit() {
        this.initializing = true;
        this._functionsService.initializeUser()
            .subscribe(r => {
                this._functionsService.getFunctions()
                .subscribe(res => {
                    res.unshift(this._functionsService.getLogStreamingNode());
                    res.unshift(this._functionsService.getNewFunctionNode());
                    res.unshift(this._functionsService.getSettingsNode());
                    this.functionsInfo = res;
                    this.initializing = false;
                });
                this._functionsService.getTemplates()
                    .subscribe(res => this.functionTemplates = res);
                this._functionsService.warmupMainSite();
            });
    }

    initFunctions(fi: FunctionInfo) {
        this.addedFunction = fi;
    }

    onFunctionSelect(functionInfo: FunctionInfo){
        this.selectedFunction = functionInfo;
    }

    onDeleteSelectedFunction(deleteSelectedFunction: boolean) {
        this.deleteSelectedFunction = deleteSelectedFunction;
        if (deleteSelectedFunction) {
            this.selectedFunction = null;
        }
    }

}