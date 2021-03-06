﻿import {Component, OnInit, EventEmitter, QueryList, OnChanges, Input, SimpleChange} from 'angular2/core';
import {FunctionsService} from '../services/functions.service';
import {FunctionInfo} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';
import {AceEditorDirective} from '../directives/ace-editor.directive';
import {FunctionDesignerComponent} from './function-designer.component';
import {LogStreamingComponent} from './log-streaming.component';
import {FunctionConfig} from '../models/function-config';
import {Observable, Subject, Subscription} from 'rxjs/Rx';
import {FunctionSecrets} from '../models/function-secrets';
import {IBroadcastService, BroadcastEvent} from '../services/ibroadcast.service';

@Component({
    selector: 'function-dev',
    templateUrl: 'templates/function-dev.component.html',
    styleUrls: ['styles/function-dev.style.css'],
    directives: [
        AceEditorDirective,
        FunctionDesignerComponent,
        LogStreamingComponent
    ]
})
export class FunctionDevComponent implements OnChanges {
    @Input() selectedFunction: FunctionInfo;
    public functionInfo: FunctionInfo;
    public scriptFile: VfsObject;
    public content: string;
    public fileName: string;
    public inIFrame: boolean;

    public scriptContent: string;
    public configContent: string;
    public webHookType: string;
    public secrets: FunctionSecrets;
    public isCode: boolean;
    public isHttpFunction: boolean;

    public runResult: string;

    private updatedContent: string;
    private updatedTestContent: string;
    private functionSelectStream: Subject<FunctionInfo>;

    constructor(private _functionsService: FunctionsService, private _broadcastService: IBroadcastService) {
        this.isCode = true;
        this.functionSelectStream = new Subject<FunctionInfo>();
        this.functionSelectStream
            .distinctUntilChanged()
            .switchMap(fi => {
                this._broadcastService.setBusyState();
                return Observable.zip(
                    this._functionsService.getFileContent(fi.script_href),
                    fi.clientOnly ? Observable.of({}) : this._functionsService.getSecrets(fi),
                    this._functionsService.getFunction(fi),
                    (c, s, f) => ({ content: c, secrets: s, functionInfo: f }))
            })
            .subscribe((res: any) => {
                this._broadcastService.clearBusyState();
                this.functionInfo = res.functionInfo;
                var fileName = this.functionInfo.script_href.substring(this.functionInfo.script_href.lastIndexOf('/') + 1);
                this.fileName = fileName;
                this.scriptFile = { href: this.functionInfo.script_href, name: fileName };
                this.content = res.content;

                this.configContent = JSON.stringify(this.functionInfo.config, undefined, 2);
                var inputBinding = (this.functionInfo.config && this.functionInfo.config.bindings
                    ? this.functionInfo.config.bindings.find(e => !!e.webHookType)
                    : null);
                if (inputBinding) {
                    this.webHookType = inputBinding.webHookType;
                } else {
                    delete this.webHookType;
                }
                inputBinding = (this.functionInfo.config && this.functionInfo.config.bindings
                    ? this.functionInfo.config.bindings.find(e => e.type === 'httpTrigger')
                    : null);
                if (inputBinding) {
                    this.isHttpFunction = true;
                } else {
                    this.isHttpFunction = false;
                }
                this.createSecretIfNeeded(res.functionInfo, res.secrets);
            });

    }

    private createSecretIfNeeded(fi: FunctionInfo, secrets: FunctionSecrets) {
        if (!secrets.key) {
            if (this.isHttpFunction) {
                //http://stackoverflow.com/a/8084248/3234163
                var secret = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
                this._functionsService.setSecrets(fi, { key: secret })
                    .subscribe(r => this.secrets = r);
            } else {
                this.secrets = secrets;
            }
        } else {
            this.secrets = secrets;
        }
    }

    ngOnChanges(changes: {[key: string]: SimpleChange}) {
        if (changes['selectedFunction']) {
            this.functionSelectStream.next(changes['selectedFunction'].currentValue);
        }
    }

    //TODO: change to field;
    get functionInvokeUrl(): string {
        var code = '';
        if (this.webHookType === 'github') {
            code = '';
        } else if (this.isHttpFunction && this.secrets && this.secrets.key) {
            code = `?code=${this.secrets.key}`;
        } else if (this.isHttpFunction && this._functionsService.HostSecrets.functionKey) {
            code = `?code=${this._functionsService.HostSecrets.functionKey}`;
        }
        return this._functionsService.getFunctionInvokeUrl(this.functionInfo) + code;
    }

    saveScript(dontClearBusy?: boolean) {
        // Only save if the file is dirty
        if (!this.scriptFile.isDirty) return;
        this._broadcastService.setBusyState();
        return this._functionsService.saveFile(this.scriptFile, this.updatedContent)
            .subscribe(r => {
                if (!dontClearBusy)
                    this._broadcastService.clearBusyState();
                if (typeof r !== 'string' && r.isDirty) {
                    r.isDirty = false;
                    this._broadcastService.clearDirtyState('function');
                }
            });
    }

    contentChanged(content: string) {
        if (!this.scriptFile.isDirty) {
            this.scriptFile.isDirty = true;
            this._broadcastService.setDirtyState('function');
        }
        this.updatedContent = content;
    }

    //http://stackoverflow.com/q/8019534/3234163
    highlightText(event: Event) {
        var el: any = event.target;
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    testContentChanged(content: string) {
        this.updatedTestContent = content;
    }

    saveTestData() {
        this.functionInfo.test_data = this.updatedTestContent || this.functionInfo.test_data;
        this._functionsService.updateFunction(this.functionInfo)
            .subscribe(r => Object.assign(this.functionInfo, r));
    }

    runFunction() {
        this.saveTestData();
        if (this.scriptFile.isDirty) {
            this.saveScript(true).add(() => setTimeout(() => this.runFunction(), 200));
        } else {
            this._broadcastService.setBusyState();
            this._functionsService.runFunction(this.functionInfo, this.updatedTestContent || this.functionInfo.test_data)
                .subscribe(
                    r => { this.runResult = r; this._broadcastService.clearBusyState(); },
                    e => { this.runResult = e._body; this._broadcastService.clearBusyState(); }
                );
        }
    }
}
