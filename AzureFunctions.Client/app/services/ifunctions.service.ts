import {VfsObject} from '../models/vfs-object';
import {FunctionInfo} from '../models/function-info';
import {ScmInfo} from '../models/scm-info';
import {FunctionTemplate} from '../models/function-template';
import {RunResponse} from '../models/run-response';
import {Observable, Subscription as RxSubscription} from 'rxjs/Rx';
import {DesignerSchema} from '../models/designer-schema';
import {FunctionSecrets} from '../models/function-secrets';
import {Subscription} from '../models/subscription';
import {HostSecrets} from '../models/host-secrets';
import {BindingConfig} from '../models/binding';
import {FunctionContainer} from '../models/function-container';

export interface IFunctionsService {
    setFunctionContainer(functionContainer: FunctionContainer): void;
    getFunctions(): Observable<FunctionInfo[]>;
    getFileContent(file: VfsObject): Observable<string>;
    saveFile(file: VfsObject|string, updatedContent: string): Observable<VfsObject>;
    getTemplates(): Observable<FunctionTemplate[]>;
    createFunction(functionName: string, templateId: string): Observable<FunctionInfo>;
    createFunctionV2(functionName: string, files: any): Observable<FunctionInfo>;
    getNewFunctionNode(): FunctionInfo;
    getSettingsNode(): FunctionInfo;
    getTestData(functionInfo: FunctionInfo): Observable<string>;
    runFunction(functionInfo: FunctionInfo, content: string): Observable<string>;
    deleteFunction(functionInfo: FunctionInfo): Observable<string>;
    getDesignerSchema(): Observable<DesignerSchema>;
    warmupMainSite();
    getSecrets(fi: FunctionInfo): Observable<FunctionSecrets>;
    setSecrets(fi: FunctionInfo, secrets: FunctionSecrets): Observable<FunctionSecrets>;
    getFunctionInvokeUrl(fi: FunctionInfo): string;
    getScmUrl();
    getDefaultStorageAccount();
    getHostSecrets(): RxSubscription;
    createTrialFunctionsContainer(): Observable<string>;
    getBindingConfig(): Observable<BindingConfig>;
    updateFunction(fi: FunctionInfo): Observable<FunctionInfo>;
}